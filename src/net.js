'use strict';

/**
 * 极简 HTTP(S) 抓取工具，支持系统代理（HTTP_PROXY / HTTPS_PROXY）。
 * 仅用于后台「链接抓取文章」功能，限制大小、超时与重定向次数。
 */

const http = require('node:http');
const https = require('node:https');
const tls = require('node:tls');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function proxyFor(url) {
  const raw =
    url.protocol === 'https:'
      ? process.env.HTTPS_PROXY || process.env.https_proxy || process.env.ALL_PROXY || process.env.all_proxy
      : process.env.HTTP_PROXY || process.env.http_proxy || process.env.ALL_PROXY || process.env.all_proxy;
  if (!raw) return null;
  try {
    const proxy = new URL(raw);
    if (proxy.protocol !== 'http:') return null;
    return proxy;
  } catch {
    return null;
  }
}

function proxyHeaders(proxy) {
  if (!proxy.username) return {};
  const auth = Buffer.from(`${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`).toString('base64');
  return { 'Proxy-Authorization': `Basic ${auth}` };
}

function collect(res, resolve, reject, maxBytes) {
  const chunks = [];
  let size = 0;
  res.on('data', (chunk) => {
    size += chunk.length;
    if (size > maxBytes) {
      res.destroy();
      reject(new Error('网页内容过大，暂时无法抓取'));
      return;
    }
    chunks.push(chunk);
  });
  res.on('end', () => {
    resolve({ status: res.statusCode || 0, headers: res.headers || {}, body: Buffer.concat(chunks) });
  });
  res.on('error', reject);
}

function requestDirect(url, options) {
  return new Promise((resolve, reject) => {
    const mod = url.protocol === 'https:' ? https : http;
    const req = mod.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: options.method,
        headers: options.headers
      },
      (res) => collect(res, resolve, reject, options.maxBytes)
    );
    req.setTimeout(options.timeout, () => req.destroy(new Error('抓取超时，请检查链接或稍后重试')));
    req.on('error', reject);
    req.end();
  });
}

function requestViaProxy(url, options) {
  const proxy = proxyFor(url);
  if (!proxy) return requestDirect(url, options);

  const headers = { ...options.headers, ...proxyHeaders(proxy) };
  if (url.protocol === 'http:') {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: proxy.hostname,
          port: proxy.port || 80,
          method: options.method,
          path: url.href,
          headers: { ...headers, Host: url.host }
        },
        (res) => collect(res, resolve, reject, options.maxBytes)
      );
      req.setTimeout(options.timeout, () => req.destroy(new Error('抓取超时，请检查链接或稍后重试')));
      req.on('error', reject);
      req.end();
    });
  }

  return new Promise((resolve, reject) => {
    const port = url.port || 443;
    const target = `${url.hostname}:${port}`;
    const connectReq = http.request({
      hostname: proxy.hostname,
      port: proxy.port || 80,
      method: 'CONNECT',
      path: target,
      headers: { Host: target, ...proxyHeaders(proxy) }
    });
    connectReq.setTimeout(options.timeout, () => {
      connectReq.destroy(new Error('代理连接超时'));
    });
    connectReq.on('connect', (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        reject(new Error('代理连接失败'));
        return;
      }
      const tlsSocket = tls.connect({ socket, servername: url.hostname }, () => {
        const req = https.request(
          {
            hostname: url.hostname,
            port,
            path: `${url.pathname}${url.search}`,
            method: options.method,
            headers,
            createConnection: () => tlsSocket
          },
          (response) => collect(response, resolve, reject, options.maxBytes)
        );
        req.setTimeout(options.timeout, () => req.destroy(new Error('抓取超时，请检查链接或稍后重试')));
        req.on('error', reject);
        req.end();
      });
      tlsSocket.setTimeout(options.timeout, () => tlsSocket.destroy(new Error('抓取超时')));
      tlsSocket.on('error', reject);
    });
    connectReq.on('error', reject);
    connectReq.end();
  });
}

function charsetOf(contentType, body) {
  const fromHeader = /charset=([\w-]+)/i.exec(contentType || '');
  if (fromHeader) return fromHeader[1].toLowerCase();
  const head = body.slice(0, 4096).toString('utf8');
  const fromMeta = /<meta[^>]+charset=["']?([\w-]+)/i.exec(head);
  return fromMeta ? fromMeta[1].toLowerCase() : 'utf-8';
}

function decodeBody(body, contentType) {
  const charset = charsetOf(contentType, body);
  try {
    return new TextDecoder(charset).decode(body);
  } catch {
    return body.toString('utf8');
  }
}

/**
 * 抓取网页，返回解码后的正文与最终地址。
 */
async function fetchPage(rawUrl, options = {}) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('链接格式不正确');
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('只支持 http / https 链接');

  const timeout = options.timeout || 12000;
  const maxBytes = options.maxBytes || 3 * 1024 * 1024;
  let current = url;
  let redirects = 0;

  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.6',
    'Accept-Encoding': 'identity',
    Connection: 'close',
    ...(options.headers || {})
  };

  while (redirects <= 4) {
    const requestOptions = {
      method: 'GET',
      headers: { ...headers, Host: current.host },
      timeout,
      maxBytes
    };
    let res;
    try {
      res = await requestViaProxy(current, requestOptions);
    } catch (err) {
      // 代理不可用时回退直连，兼容本地开发与云端运行环境。
      if (!proxyFor(current)) throw err;
      res = await requestDirect(current, requestOptions);
    }

    if ([301, 302, 303, 307, 308].includes(res.status) && res.headers.location) {
      redirects += 1;
      current = new URL(res.headers.location, current);
      if (!['http:', 'https:'].includes(current.protocol)) throw new Error('跳转链接不受支持');
      continue;
    }

    return {
      url: current.href,
      status: res.status,
      contentType: String(res.headers['content-type'] || ''),
      html: decodeBody(res.body, String(res.headers['content-type'] || ''))
    };
  }
  throw new Error('页面跳转次数过多');
}

module.exports = { fetchPage };
