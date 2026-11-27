'use strict';

const dns = require('node:dns').promises;
const http = require('node:http');
const https = require('node:https');
const net = require('node:net');
const { performance } = require('node:perf_hooks');
const { setTimeout: sleep } = require('node:timers/promises');

const PRODUCT = 'RecipeCrawler';
const USER_AGENT = `${PRODUCT}/1.0`;
const LIMITS = { page: 4 * 1024 * 1024, image: 8 * 1024 * 1024, robots: 512 * 1024 };
const REDIRECTS = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 5;
const MAX_TIMER = 2147483647;

const loopbackV4 = new net.BlockList();
loopbackV4.addSubnet('127.0.0.0', 8, 'ipv4');
const loopbackV6 = new net.BlockList();
loopbackV6.addAddress('::1', 'ipv6');

const reserved = new net.BlockList();
for (const [address, bits] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.31.196.0', 24], ['192.52.193.0', 24], ['192.88.99.0', 24], ['192.168.0.0', 16],
  ['192.175.48.0', 24], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24],
  ['224.0.0.0', 3]
]) reserved.addSubnet(address, bits, 'ipv4');
for (const [address, bits] of [
  ['2001::', 23], ['2001:db8::', 32], ['2002::', 16], ['2620:4f:8000::', 48], ['3fff::', 20]
]) reserved.addSubnet(address, bits, 'ipv6');

const globalV6 = new net.BlockList();
globalV6.addSubnet('2000::', 3, 'ipv6');

function allowedAddress(address, allowLocal) {
  const family = net.isIP(address);
  if (!family || address.includes('%')) return false;
  const type = family === 4 ? 'ipv4' : 'ipv6';
  // BlockList also recognizes IPv4-mapped IPv6. Only native loopback is eligible here.
  if (allowLocal && (family === 4 ? loopbackV4 : loopbackV6).check(address, type)) return true;
  return (family === 4 || globalV6.check(address, type)) && !reserved.check(address, type);
}

function abortable(promise, signal) {
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
    if (signal.aborted) abort();
  });
}

function checkedUrl(value, hosts, base) {
  const raw = String(value).replace(/^[\x00-\x20]+|[\x00-\x20]+$/g, '').replace(/[\t\r\n]/g, '');
  const url = new URL(raw, base);
  const authority = /^(?:https?:[/\\]*|[/\\]{2,})([^/\\?#]*)/i.exec(raw)?.[1];
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || authority?.includes('@')) {
    throw new Error('仅允许无凭据的 HTTP(S) 链接');
  }
  if (!hosts.has(url.host)) throw new Error(`主机不在允许列表中：${url.host}`);
  url.hash = '';
  return url;
}

async function pinnedAddress(hostname, allowLocal, signal) {
  const literal = hostname.replace(/^\[|\]$/g, '');
  const answers = net.isIP(literal) ? [{ address: literal }] :
    await abortable(dns.lookup(hostname, { all: true }), signal);
  if (!answers.length || answers.some(({ address }) => !allowedAddress(address, allowLocal))) {
    throw new Error(`主机解析到不允许的 IP 地址：${hostname}`);
  }
  return answers[0].address;
}

function fetchOnce(url, address, limit, signal) {
  const secure = url.protocol === 'https:';
  return new Promise((resolve, reject) => {
    const req = (secure ? https : http).request({
      hostname: address,
      port: url.port || (secure ? 443 : 80),
      path: url.href.slice(url.origin.length),
      method: 'GET',
      agent: false,
      signal,
      ...(secure ? {
        rejectUnauthorized: true,
        servername: net.isIP(url.hostname.replace(/^\[|\]$/g, '')) ? '' : url.hostname
      } : {}),
      headers: {
        Host: url.host,
        'User-Agent': USER_AGENT,
        'Accept-Encoding': 'identity',
        Connection: 'close'
      }
    }, (res) => {
      const { statusCode: status, headers } = res;
      res.on('error', reject);
      if (status < 200 || status >= 300) {
        resolve({ status, location: headers.location });
        res.destroy();
        return;
      }
      const encoding = headers['content-encoding'];
      if (encoding && encoding.trim().toLowerCase() !== 'identity') {
        reject(new Error('响应使用了不支持的 Content-Encoding'));
        res.destroy();
        return;
      }
      const tooLarge = () => {
        reject(new Error(`响应超过大小限制（${limit} 字节）`));
        res.destroy();
      };
      if (Number(headers['content-length']) > limit) {
        tooLarge();
        return;
      }
      const chunks = [];
      let size = 0;
      res.on('data', (chunk) => {
        size += chunk.length;
        if (size > limit) tooLarge();
        else chunks.push(chunk);
      });
      res.on('end', () => {
        if (res.complete) resolve({ status, body: Buffer.concat(chunks, size) });
        else reject(new Error('响应提前结束'));
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Compare robots paths by octet. Escaped reserved characters stay distinct from literal ones.
function normalizeRobotsPath(path) {
  return path.replace(/%[\dA-Fa-f]{2}|[^\x00-\x7f]/gu, (part) => {
    if (part.startsWith('%')) {
      const char = String.fromCharCode(parseInt(part.slice(1), 16));
      return /^[a-z\d._~-]$/i.test(char) ? char : part.toUpperCase();
    }
    return encodeURIComponent(part);
  });
}

function parseRobots(body) {
  const product = PRODUCT.toLowerCase();
  const groups = new Map();
  const agents = new Set();
  let hasAgent = false;
  let hasRules = false;
  for (const line of body.toString('utf8').replace(/^\uFEFF/, '').split(/\r\n|\r|\n/)) {
    const directive = /^\s*([a-z-]+)\s*:\s*(.*?)\s*$/i.exec(line.split('#', 1)[0]);
    if (!directive) continue;
    const field = directive[1].toLowerCase();
    const value = directive[2];
    if (field === 'user-agent') {
      if (hasRules) agents.clear();
      hasRules = false;
      hasAgent = true;
      const agent = value.toLowerCase();
      if (agent === product || agent === '*') {
        agents.add(agent);
        if (!groups.has(agent)) groups.set(agent, []);
      }
    } else if (hasAgent && (field === 'allow' || field === 'disallow')) {
      hasRules = true;
      const pattern = value.startsWith('/') && normalizeRobotsPath(value);
      const end = pattern && pattern.endsWith('$');
      if (!pattern) continue;
      const parts = (end ? pattern.slice(0, -1) : pattern).split('*');
      const length = parts.join('').replace(/%[\dA-F]{2}/g, 'x').length;
      const rule = { parts, end, length, allow: field === 'allow' };
      for (const agent of agents) groups.get(agent).push(rule);
    }
  }

  return groups.get(product) ?? groups.get('*') ?? [];
}

function matchesRule(path, { parts, end }) {
  if (!path.startsWith(parts[0])) return false;
  if (parts.length === 1) return !end || path === parts[0];
  let position = parts[0].length;
  let last = parts.length;
  let boundary = path.length;
  if (end) {
    const suffix = parts[--last];
    if (!path.endsWith(suffix)) return false;
    boundary -= suffix.length;
  }
  for (let i = 1; i < last; i++) {
    const match = path.indexOf(parts[i], position);
    if (match === -1) return false;
    position = match + parts[i].length;
    if (position > boundary) return false;
  }
  return position <= boundary;
}

function robotsAllows(url, rules) {
  const path = normalizeRobotsPath(url.href.slice(url.origin.length));
  let best;
  for (const rule of rules) {
    if ((!best || rule.length > best.length || (rule.length === best.length && rule.allow)) && matchesRule(path, rule)) {
      best = rule;
    }
  }
  return !best || best.allow;
}

function createRequester({ pageHosts, imageHosts, delayMs = 500, timeoutMs = 10000, allowLocal = false }) {
  for (const [name, value, min] of [['delayMs', delayMs, 0], ['timeoutMs', timeoutMs, 1]]) {
    if (!Number.isInteger(value) || value < min || value > MAX_TIMER) throw new Error(`无效的 ${name}`);
  }
  const hostsByKind = {
    page: new Set(Array.from(pageHosts || [], (host) => host.toLowerCase())),
    image: new Set(Array.from(imageHosts || [], (host) => host.toLowerCase()))
  };
  const robotsCache = new Map();
  const lastFinished = new Map();
  let queue = Promise.resolve();

  async function hop(url, limit, signal) {
    signal.throwIfAborted();
    const wait = delayMs - (performance.now() - (lastFinished.get(url.origin) ?? -Infinity));
    if (wait > 0) await sleep(Math.ceil(wait), undefined, { signal });
    const address = await pinnedAddress(url.hostname, allowLocal === true, signal);
    signal.throwIfAborted();
    try {
      return await fetchOnce(url, address, limit, signal);
    } finally {
      lastFinished.set(url.origin, performance.now());
    }
  }

  function redirect(url, response, hosts, count) {
    if (count >= MAX_REDIRECTS) throw new Error('重定向次数超限');
    if (!response.location) throw new Error('重定向响应缺少 Location');
    return checkedUrl(response.location, hosts, url);
  }

  async function checkRobots(url, hosts, signal) {
    let policy = robotsCache.get(url.origin);
    if (!policy) {
      const chain = [];
      let robotsUrl = new URL('/robots.txt', url);
      for (let count = 0; ; count++) {
        chain.push(robotsUrl.host);
        const response = await hop(robotsUrl, LIMITS.robots, signal);
        if (REDIRECTS.has(response.status)) {
          robotsUrl = redirect(robotsUrl, response, hosts, count);
          continue;
        }
        if (response.status === 404 || response.status === 410) policy = { chain, rules: [] };
        else if (response.status >= 200 && response.status < 300 && response.status !== 206) {
          policy = { chain, rules: parseRobots(response.body) };
        } else policy = { chain, status: response.status };
        robotsCache.set(url.origin, policy);
        break;
      }
    }
    if (policy.chain.some((host) => !hosts.has(host))) throw new Error('robots.txt 重定向主机不在允许列表中');
    if (policy.status) throw new Error(`robots.txt 拒绝访问（HTTP ${policy.status}）：${url.origin}`);
    if (!robotsAllows(url, policy.rules)) throw new Error(`robots.txt 禁止抓取：${url.href}`);
  }

  return async function request(value, kind = 'page') {
    if (!Object.hasOwn(hostsByKind, kind)) throw new Error('无效的请求类型');
    const hosts = hostsByKind[kind];
    const initialUrl = checkedUrl(value, hosts);
    const controller = new AbortController();
    const { signal } = controller;
    const deadline = performance.now() + timeoutMs;
    const timeout = new Error(`请求超时（${timeoutMs} 毫秒）`);
    const timer = setTimeout(() => controller.abort(timeout), timeoutMs);
    const checkDeadline = () => {
      if (performance.now() >= deadline) controller.abort(timeout);
      signal.throwIfAborted();
    };

    const job = queue.then(async () => {
      let url = initialUrl;
      for (let count = 0; ; count++) {
        checkDeadline();
        await checkRobots(url, hosts, signal);
        checkDeadline();
        const response = await hop(url, LIMITS[kind], signal);
        checkDeadline();
        if (REDIRECTS.has(response.status)) url = redirect(url, response, hosts, count);
        else if (response.status >= 200 && response.status < 300) return { url: url.href, body: response.body };
        else throw new Error(`请求被拒绝（HTTP ${response.status}）：${url.href}`);
      }
    });
    queue = job.catch(() => {});
    try {
      return await abortable(job, signal);
    } finally {
      clearTimeout(timer);
    }
  };
}

module.exports = { createRequester };
