'use strict';

/**
 * 菜品配图抓取脚本（开发期工具，不参与线上运行）。
 *
 * 用法：
 *   node scripts/fetch-dish-images.js --limit=3
 *   node scripts/fetch-dish-images.js --only=s01,s02
 *   node scripts/fetch-dish-images.js            # 抓取全部缺失图片
 *
 * 图片来自 Bing 图片搜索，按菜名逐道搜索，下载后统一裁剪为 800x600，
 * 并用灰度指纹去重，避免多道菜复用同一张图。
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);
const { RECIPES } = require('../src/data/recipes');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'dishes');
const MANIFEST_FILE = path.join(OUT_DIR, 'manifest.json');
const TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'nuanyue-dish-'));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy || '';
const CONCURRENCY = 2;
const MAX_CANDIDATES = 12;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CURL_BASE = ['-sSL', '--compressed', '-m', '30', '-A', UA];
if (PROXY) CURL_BASE.push('-x', PROXY);

function log(...args) {
  console.log(new Date().toISOString().slice(11, 19), ...args);
}

function parseArgs() {
  const args = { only: null, limit: 0, force: false };
  for (const raw of process.argv.slice(2)) {
    if (raw === '--force') args.force = true;
    else if (raw.startsWith('--limit=')) args.limit = Number(raw.slice(8)) || 0;
    else if (raw.startsWith('--only=')) args.only = raw.slice(7).split(',').map((s) => s.trim()).filter(Boolean);
  }
  return args;
}

function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
}

async function curlText(url, referer) {
  const args = [...CURL_BASE, '-e', referer || url, url];
  const { stdout } = await execFileAsync('curl', args, { maxBuffer: 24 * 1024 * 1024, encoding: 'utf8' });
  return stdout;
}

async function curlDownload(url, file, referer) {
  const args = [...CURL_BASE, '-e', referer || url, '-o', file, '-w', '%{http_code}', url];
  const { stdout } = await execFileAsync('curl', args, { maxBuffer: 1024 * 1024, encoding: 'utf8' });
  return String(stdout).trim();
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function parse360Results(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  const list = Array.isArray(data.list) ? data.list : [];
  return list
    .map((item) => {
      let url = item.img || item.https || item.http || '';
      if (url.startsWith('//')) url = `https:${url}`;
      let thumb = item.thumb || item._thumb || '';
      if (thumb.startsWith('//')) thumb = `https:${thumb}`;
      return {
        url,
        thumb,
        page: item.link || item.dspurl || '',
        title: decodeHtml(item.title || ''),
        width: Number(item.width) || 0,
        height: Number(item.height) || 0
      };
    })
    .filter((item) => /^https?:\/\//i.test(item.url) && !/\.(gif|svg)($|\?)/i.test(item.url));
}

// 商品图、图库水印图与壁纸素材优先级最低。
const BLOCK_HOSTS = [
  'alicdn.com',
  'taobao.com',
  'tmall.com',
  'jd.com',
  'jd.hk',
  'pinduoduo.com',
  'yangkeduo.com',
  'nipic.com',
  'nximg.cn',
  '699pic.com',
  '58pic.com',
  '588ku.com',
  'veer.com',
  'hellorf.com',
  'zcool.com.cn',
  'photophoto.cn',
  'tuchong.com',
  'vcg.com',
  'gettyimages',
  'zhimg.com'
];
// 优先使用菜谱社区的成品图，通常更贴近家常做法且水印少。
const PREFERRED_HOSTS = [
  'xiachufang.com',
  'chuimg.com',
  'douguo.com',
  'meishichina.com',
  'meishij.net',
  'xinshipu.com',
  'sohu.com',
  'baijiahao.baidu.com',
  '19lou.com',
  'meituan.com'
];

const PRODUCT_RE = /(袋装|包邮|旗舰店|天猫|淘宝|京东|拼多多|优惠|促销|批发|礼盒|罐装|瓶装|代餐粉|\d+\s*(?:g|克|kg)\b)/i;
const JUNK_RE = /(壁纸|海报|素材|模板|展板|电路|玩具|枪|动漫|电影|明星|穿搭|楼盘|招聘|优惠券)/i;

function hostOf(value) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function candidateScore(item) {
  const hosts = [hostOf(item.page), hostOf(item.url)];
  if (JUNK_RE.test(item.title)) return -100;
  const blocked = hosts.some((h) => BLOCK_HOSTS.some((b) => h.includes(b)));
  let score = 3;
  if (!blocked) {
    score = 30;
    for (let i = 0; i < PREFERRED_HOSTS.length; i += 1) {
      if (hosts.some((h) => h.includes(PREFERRED_HOSTS[i]))) {
        score = 100 - i * 4;
        break;
      }
    }
  }
  if (PRODUCT_RE.test(item.title)) score -= 35;
  return score;
}

function rankCandidates(results, name) {
  const chars = [...new Set(String(name || '').replace(/[（(].*?[)）]/g, ''))];
  return results
    .map((item, index) => {
      let score = candidateScore(item);
      if (chars.length) {
        const hit = chars.filter((c) => item.title.includes(c)).length / chars.length;
        if (hit >= 0.75) score += 15;
        else if (hit < 0.35) score -= 20;
      }
      return { ...item, score, index };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);
}

async function searchImages(query) {
  const url = `https://image.so.com/j?q=${encodeURIComponent(query)}&src=srp&sn=0&pn=30`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const raw = await curlText(url, 'https://image.so.com/');
    const results = parse360Results(raw);
    if (results.length) return results;
    await sleep(1200 + attempt * 1600);
  }
  return [];
}

async function imageSize(file) {
  try {
    const { stdout } = await execFileAsync('identify', ['-format', '%w %h', file]);
    const [w, h] = stdout.trim().split(/\s+/).map(Number);
    if (!w || !h) return null;
    return { width: w, height: h };
  } catch {
    return null;
  }
}

async function fingerprint(file) {
  const buffer = fs.readFileSync(file);
  return crypto.createHash('sha1').update(buffer).digest('hex');
}

async function compress(input, output) {
  await execFileAsync('convert', [
    input,
    '-auto-orient',
    '-resize',
    '800x600^',
    '-gravity',
    'center',
    '-extent',
    '800x600',
    '-strip',
    '-quality',
    '82',
    output
  ]);
}

async function fetchOne(recipe, usedSignatures, usedSources) {
  const output = path.join(OUT_DIR, `${recipe.id}.jpg`);
  const queries = [`${recipe.name} 成品`, `${recipe.name} 美食`, recipe.name];
  for (const query of queries) {
    let results = [];
    try {
      results = await searchImages(query);
    } catch (err) {
      log('search failed', recipe.id, query, err.message);
      continue;
    }
    log('search', recipe.id, recipe.name, 'results', results.length, 'q=', query);
    results = rankCandidates(results, recipe.name);
    await sleep(350);
    let tried = 0;
    for (const item of results) {
      if (tried >= MAX_CANDIDATES) break;
      if (usedSources.has(item.url)) continue;
      if (item.width && item.height && (item.width < 300 || item.height < 220)) continue;
      tried += 1;
      const tmp = path.join(TMP_DIR, `${recipe.id}-${tried}.img`);
      try {
        const code = await curlDownload(item.url, tmp, item.page || 'https://cn.bing.com/');
        if (code !== '200') {
          if (item.thumb) {
            const thumbCode = await curlDownload(item.thumb, tmp, 'https://cn.bing.com/');
            if (thumbCode !== '200') continue;
          } else {
            continue;
          }
        }
        const size = await imageSize(tmp);
        if (!size) continue;
        if (size.width < 320 || size.height < 240) continue;
        const ratio = size.width / size.height;
        if (ratio < 0.55 || ratio > 2.6) continue;

        await compress(tmp, output);
        const signature = await fingerprint(output);
        if (usedSignatures.has(signature)) {
          log('duplicate skip', recipe.id, signature.slice(0, 8));
          continue;
        }
        usedSignatures.add(signature);
        usedSources.add(item.url);
        const stat = fs.statSync(output);
        return {
          signature,
          source: item.page || item.url,
          imageUrl: item.url,
          bytes: stat.size,
          width: 800,
          height: 600
        };
      } catch {
        /* 尝试下一张候选图 */
      } finally {
        try {
          fs.unlinkSync(tmp);
        } catch {
          /* ignore */
        }
      }
    }
  }
  return null;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const args = parseArgs();
  const manifest = loadManifest();
  const usedSignatures = new Set(Object.values(manifest).map((m) => m.signature).filter(Boolean));
  const usedSources = new Set(Object.values(manifest).map((m) => m.imageUrl).filter(Boolean));

  let list = RECIPES.slice();
  if (args.only) list = list.filter((r) => args.only.includes(r.id));
  if (!args.force) list = list.filter((r) => !fs.existsSync(path.join(OUT_DIR, `${r.id}.jpg`)));
  if (args.limit) list = list.slice(0, args.limit);

  log('targets', list.length, 'existing', Object.keys(manifest).length, 'proxy', PROXY ? 'on' : 'off');
  let cursor = 0;
  let done = 0;
  let failed = 0;

  async function worker(index) {
    while (cursor < list.length) {
      const current = list[cursor];
      cursor += 1;
      const result = await fetchOne(current, usedSignatures, usedSources);
      if (result) {
        manifest[current.id] = {
          name: current.name,
          signature: result.signature,
          source: result.source,
          imageUrl: result.imageUrl,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          fetchedAt: new Date().toISOString()
        };
        saveManifest(manifest);
        done += 1;
        log(`OK [${done + failed}/${list.length}]`, current.id, current.name, `${Math.round(result.bytes / 1024)}KB`);
      } else {
        failed += 1;
        log(`FAIL [${done + failed}/${list.length}]`, current.id, current.name);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));
  saveManifest(manifest);
  log('finished', { done, failed, manifest: Object.keys(manifest).length });
  try {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
