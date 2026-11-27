'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const { COURSES } = require('../src/data/meta');
const { adapters } = require('./crawler/adapters');
const { createRequester } = require('./crawler/request');

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const clean = (value) => typeof value === 'string' ? value.trim() : '';

function normalizeUrl(value) {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error(`不支持的来源链接：${url.origin}`);
  }
  url.hash = '';
  return url.href;
}

function normalizeRecipe(raw, source) {
  const sourceId = Number.isSafeInteger(raw.sourceId) ? String(raw.sourceId) : clean(raw.sourceId) || null;
  const sourceUrl = clean(raw.sourceUrl) ? normalizeUrl(raw.sourceUrl) : null;
  const name = clean(raw.name);
  if (!name || !(sourceId || sourceUrl)) throw new Error('需要菜名以及来源 ID 或链接');
  const categories = [...new Set((raw.categories || []).map(clean).filter(Boolean))];
  const course = Object.keys(COURSES).find((key) =>
    categories.some((category) => category.toLowerCase() === key || category === COURSES[key].label)) || null;
  const ingredients = (raw.ingredients || []).map((item) => ({
    name: clean(typeof item === 'string' ? item : item?.name),
    amountText: clean(item?.amountText)
  }));
  const steps = (raw.steps || []).map((step) => ({
    text: clean(typeof step === 'string' ? step : step?.text),
    images: step?.images || []
  }));
  if (!ingredients.length || ingredients.some((item) => !item.name)) throw new Error('食材列表为空或缺少食材名称');
  if (!steps.length || steps.some((step) => !step.text)) throw new Error('做法列表为空或存在空步骤');
  return { id: JSON.stringify([source, sourceId || sourceUrl]), source, sourceId, sourceUrl,
    name, categories, course, ingredients, steps, images: raw.images || [] };
}

function imageExtension(body) {
  if (body.length >= 24 && body.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) &&
      body.toString('ascii', 12, 16) === 'IHDR') return 'png';
  if (body.length >= 5 && body.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex')) &&
      body.subarray(-2).equals(Buffer.from('ffd9', 'hex'))) return 'jpg';
  if (body.length >= 20 && body.toString('ascii', 0, 4) === 'RIFF' && body.toString('ascii', 8, 12) === 'WEBP' &&
      body.readUInt32LE(4) + 8 === body.length) return 'webp';
  throw new Error('图片内容无效或格式不受支持（支持 JPG、PNG、WebP）');
}

async function atomicWrite(destination, data) {
  const temp = `${destination}.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(temp, data, { flag: 'wx' });
    await fs.rename(temp, destination);
  } finally {
    await fs.rm(temp, { force: true });
  }
}

async function crawl({ source, input, out, request, maxPages = 100, onError = console.error }) {
  const adapter = Object.hasOwn(adapters, source) && adapters[source];
  if (!adapter) throw new Error(`未知数据源：${source}`);
  if (!Number.isSafeInteger(maxPages) || maxPages < 1) throw new Error('max-pages 必须是正整数');
  const recipes = new Map();
  const images = new Set();
  const resolvedImages = new Map();
  let stage = '读取来源';
  let item = input;
  try {
    for await (const raw of adapter({ input, request, maxPages })) {
      item = raw?.sourceUrl || raw?.sourceId || input;
      stage = '校验菜谱';
      const recipe = normalizeRecipe(raw, source);
      const candidate = { recipe, assetRoot: raw.assetRoot };
      const previous = recipes.get(recipe.id);
      if (previous && JSON.stringify(previous) !== JSON.stringify(candidate)) {
        throw new Error(`同一来源 ID 或链接存在不同记录：${recipe.name}`);
      }
      recipes.set(recipe.id, candidate);
      stage = '读取来源';
      item = input;
    }
    if (!recipes.size) throw new Error('没有发现菜谱');
    const records = [];
    for (const key of [...recipes.keys()].sort()) {
      const { recipe, assetRoot } = recipes.get(key);
      stage = '读取图片';
      const gather = async (refs) => {
        if (!Array.isArray(refs)) throw new Error('图片列表必须是数组');
        const refsByPath = new Map();
        for (const ref of new Set(refs)) {
          if (!clean(ref)) throw new Error('图片地址不能为空');
          item = ref;
          const cached = resolvedImages.get(JSON.stringify([assetRoot, ref]));
          if (cached) {
            if (!refsByPath.has(cached.path)) refsByPath.set(cached.path, cached);
            continue;
          }
          let body;
          const remote = /^https?:\/\//i.test(ref);
          if (remote) {
            ({ body } = await request(normalizeUrl(ref), 'image'));
          } else {
            if (!assetRoot || path.isAbsolute(ref)) throw new Error('本地图片必须是数据包内相对路径');
            const root = await fs.realpath(assetRoot);
            const filename = await fs.realpath(path.resolve(root, ref));
            const relative = path.relative(root, filename);
            if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
              throw new Error('图片不得位于数据包目录之外');
            }
            const stat = await fs.stat(filename);
            if (!stat.isFile() || stat.size > MAX_IMAGE_BYTES) throw new Error('图片文件无效或过大');
            body = await fs.readFile(filename);
          }
          if (!Buffer.isBuffer(body) || body.length > MAX_IMAGE_BYTES) throw new Error('图片响应无效或过大');
          const digest = createHash('sha256').update(body).digest('hex');
          const imagePath = `images/${digest}.${imageExtension(body)}`;
          if (!images.has(imagePath)) {
            await fs.mkdir(path.join(out, 'images'), { recursive: true });
            await atomicWrite(path.join(out, imagePath), body);
            images.add(imagePath);
          }
          const saved = { path: imagePath, source: ref };
          resolvedImages.set(JSON.stringify([assetRoot, ref]), saved);
          if (!refsByPath.has(imagePath)) refsByPath.set(imagePath, saved);
        }
        return [...refsByPath.values()];
      };
      recipe.images = await gather(recipe.images);
      for (const step of recipe.steps) step.images = await gather(step.images);
      records.push(recipe);
    }
    stage = '写入结果';
    item = out;
    await fs.mkdir(out, { recursive: true });
    await atomicWrite(path.join(out, 'recipes.json'), `${JSON.stringify({ schemaVersion: 1, source, recipes: records }, null, 2)}\n`);
    return { recipes: records.length, images: images.size };
  } catch (err) {
    onError(`[${source}] ${stage}（${item}）：${err.message}`);
    throw err;
  }
}

const HELP = `用法：npm run crawl:recipes -- --source <json|jsonld> --input <文件或网址> --out <目录>
  --page-hosts <host[,host]>    允许采集的网页主机（jsonld 默认仅入口主机）
  --image-hosts <host[,host]>   允许下载的图片主机（默认与网页主机相同）
  --max-pages <数量>           最大列表和详情页请求数（默认 100）
  --delay-ms <毫秒>            同源请求间隔（默认 500）
  --timeout-ms <毫秒>          单次请求超时（默认 10000）

json 支持数组或 {"recipes":[...]}，每项含 sourceId 或 sourceUrl、name、categories、
ingredients（字符串或 {name, amountText}）、steps（字符串或 {text, images}）及 images。
本地图片路径相对于输入 JSON。jsonld 读取网页中 schema.org Recipe 结构化数据。
`;

async function main(args) {
  if (args.length === 1 && args[0] === '--help') {
    console.log(HELP.trimEnd());
    return;
  }
  const allowed = new Set(['source', 'input', 'out', 'page-hosts', 'image-hosts', 'max-pages', 'delay-ms', 'timeout-ms']);
  const options = Object.create(null);
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].slice(2);
    const value = args[i + 1];
    if (!args[i].startsWith('--') || !allowed.has(key) || !value || value.startsWith('--') || Object.hasOwn(options, key)) {
      throw new Error(`无效参数：${args[i]}。使用 --help 查看用法。`);
    }
    options[key] = value;
  }
  const { source, input, out } = options;
  if (!source || !input || !out || !Object.hasOwn(adapters, source)) throw new Error('请指定有效的 --source、--input 和 --out。');
  const integer = (key, fallback, min) => {
    if (!options[key]) return fallback;
    const value = Number(options[key]);
    if (!/^\d+$/.test(options[key]) || !Number.isSafeInteger(value) || value < min || value > 2147483647) {
      throw new Error(`--${key} 必须是有效整数且不小于 ${min}`);
    }
    return value;
  };
  const hosts = (key) => (options[key] || '').split(',').map((host) => host.trim()).filter(Boolean);
  const pageHosts = options['page-hosts'] ? hosts('page-hosts') : source === 'jsonld' ? [new URL(normalizeUrl(input)).host] : [];
  const imageHosts = options['image-hosts'] ? hosts('image-hosts') : pageHosts;
  const request = createRequester({ pageHosts, imageHosts, delayMs: integer('delay-ms', 500, 0), timeoutMs: integer('timeout-ms', 10000, 1) });
  const result = await crawl({ source, input, out, request, maxPages: integer('max-pages', 100, 1) }).catch(() => {
    process.exitCode = 1;
    return null;
  });
  if (!result) return;
  console.log(`已保存 ${result.recipes} 道菜谱、${result.images} 张图片到 ${path.resolve(out)}`);
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  });
}

module.exports = { crawl };
