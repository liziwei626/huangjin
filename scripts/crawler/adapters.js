'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const array = (value) => value == null ? [] : Array.isArray(value) ? value : [value];

async function* json({ input }) {
  const filename = path.resolve(input);
  let records;
  try {
    const data = JSON.parse((await fs.readFile(filename, 'utf8')).replace(/^\uFEFF/, ''));
    records = Array.isArray(data) ? data : data?.recipes;
    if (!Array.isArray(records)) throw new Error('expected an array or {recipes: [...]}');
    if (records.some((record) => !record || typeof record !== 'object' || Array.isArray(record))) {
      throw new Error('expected each recipe to be an object');
    }
  } catch (error) {
    throw new Error(`Cannot read recipe JSON at ${filename}: ${error.message}`, { cause: error });
  }
  for (const record of records) yield { ...record, assetRoot: path.dirname(filename) };
}

const entities = { amp: '&', apos: "'", gt: '>', lt: '<', nbsp: ' ', quot: '"' };

function decodeEntities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|nbsp|quot);/gi, (match, entity) => {
    entity = entity.toLowerCase();
    if (entity[0] !== '#') return entities[entity];
    const code = entity[1] === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
      ? String.fromCodePoint(code) : '\ufffd';
  });
}

function text(value) {
  return typeof value === 'string' ? decodeEntities(value).trim() : '';
}

function remoteUrl(value, base) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    const url = new URL(value.trim(), base);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
  } catch {
    // An invalid optional URL cannot be used as a link or image.
  }
}

function pageUrl(url) {
  return url.split('#', 1)[0];
}

function hasType(node, type) {
  return array(node?.['@type']).some((value) => value === type || value === `schema:${type}` ||
    value === `https://schema.org/${type}` || value === `http://schema.org/${type}`);
}

function attributes(markup) {
  const attrs = Object.create(null);
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  for (const [, name, doubleQuoted, singleQuoted, unquoted] of markup.matchAll(pattern)) {
    const key = name.toLowerCase();
    attrs[key] ??= decodeEntities(doubleQuoted ?? singleQuoted ?? unquoted ?? '');
  }
  return attrs;
}

function readPage(body, url) {
  const html = body.toString('utf8').replace(/^\uFEFF/, '');
  if (/^\s*[\[{]/.test(html)) return { data: [JSON.parse(html)], base: url, next: [] };

  const data = [];
  const next = [];
  let baseHref;
  // Consume raw-text elements as a unit so their contents cannot supply HTML links.
  const tags = /<!--[\s\S]*?(?:-->|$)|<(script|style|textarea|title)\b((?:"[^"]*"|'[^']*'|[^'">])*)>([\s\S]*?)(?:<\/\1\s*>|$)|<([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi;
  for (const [, rawTag, rawAttrs, contents, tag, markup] of html.matchAll(tags)) {
    if (rawTag?.toLowerCase() === 'script') {
      const { type } = attributes(rawAttrs);
      if (type?.split(';', 1)[0].trim().toLowerCase() === 'application/ld+json' && contents.trim()) {
        data.push(JSON.parse(contents.trim()));
      }
    } else if (tag) {
      const name = tag.toLowerCase();
      if (name !== 'base' && name !== 'a' && name !== 'link') continue;
      const { href, rel } = attributes(markup);
      if (name === 'base') baseHref ??= href;
      else if (href && rel?.toLowerCase().split(/\s+/).includes('next')) next.push(href);
    }
  }
  const base = remoteUrl(baseHref, url) ?? url;
  return { data, base, next: next.map((href) => remoteUrl(href, base)).filter(Boolean) };
}

function link(value, base) {
  for (const item of array(value)) {
    const url = remoteUrl(typeof item === 'string' ? item : item?.url ?? item?.['@id'], base);
    if (url) return url;
  }
}

function extractPage({ data, base }, url) {
  const recipes = [];
  const lists = [];
  const definitions = new Map();
  const nodes = data.slice().reverse();
  while (nodes.length) {
    const node = nodes.pop();
    if (!node || typeof node !== 'object') continue;
    if (hasType(node, 'Recipe')) recipes.push(node);
    if (hasType(node, 'ItemList')) lists.push(node);
    if (node['@id'] && Object.keys(node).length > 1) {
      const id = link(node['@id'], base);
      if (id && (!definitions.has(id) || Object.keys(node).length > Object.keys(definitions.get(id)).length)) {
        definitions.set(id, node);
      }
    }
    for (const [key, value] of Object.entries(node).reverse()) {
      if (key !== '@context' && value && typeof value === 'object') nodes.push(value);
    }
  }

  function dereference(node) {
    if (node && typeof node === 'object' && Object.keys(node).length === 1 && node['@id']) {
      return definitions.get(link(node['@id'], base)) ?? node;
    }
    return node;
  }

  function images(value) {
    const urls = array(value).map((item) => {
      item = dereference(item);
      return typeof item === 'string' ? link(item, base)
        : link(item?.contentUrl, base) ?? link(item?.url, base) ?? link(item?.['@id'], base);
    });
    return [...new Set(urls.filter(Boolean))];
  }

  function steps(value) {
    const result = [];
    const ancestors = new Set();
    function visit(item) {
      item = dereference(item);
      if (typeof item === 'string') {
        if (text(item)) result.push({ text: text(item), images: [] });
      } else if (item && typeof item === 'object' && !ancestors.has(item)) {
        ancestors.add(item);
        const children = item.itemListElement ?? item.steps ?? item['@list'] ?? item.item;
        const instruction = text(item.text) || (children == null ? text(item.name) : '');
        const photos = images(item.image);
        if (instruction || photos.length) result.push({ text: instruction, images: photos });
        for (const child of array(children)) visit(child);
        ancestors.delete(item);
      }
    }
    for (const item of array(value)) visit(item);
    return result;
  }

  const detailLinks = new Set();
  const linkedStubs = new Set();
  for (const list of lists) {
    for (const element of array(list.itemListElement?.['@list'] ?? list.itemListElement)) {
      const entry = dereference(element);
      const reference = entry?.item ?? entry;
      const item = dereference(reference);
      const target = link(item, base) ?? link(reference, base) ?? link(entry, base);
      if (!target) continue;
      if (hasType(item, 'Recipe')) {
        if (text(item.name) && (item.recipeIngredient != null || item.recipeInstructions != null)) continue;
        linkedStubs.add(item);
      }
      detailLinks.add(pageUrl(target));
    }
  }

  const records = [];
  for (const node of recipes) {
    const name = text(node.name);
    if (!name || linkedStubs.has(node)) continue;
    const id = link(node['@id'], base);
    const explicitUrl = link(node.url, base) ?? link(node.mainEntityOfPage, base);
    const sourceUrl = explicitUrl ?? id ?? url;
    const identifier = array(node.identifier)[0];
    const value = identifier?.value ?? identifier;
    const sourceId = (typeof value === 'number' ? String(value) : text(value)) ||
      id || explicitUrl || `${url}#${name}`;
    records.push({
      explicitUrl: explicitUrl ?? id,
      recipe: {
        sourceId,
        sourceUrl,
        name,
        categories: array(node.recipeCategory).map(text).filter(Boolean),
        ingredients: array(node.recipeIngredient).flatMap((ingredient) => {
          if (typeof ingredient === 'string') return text(ingredient) ? [text(ingredient)] : [];
          const name = text(ingredient?.name);
          return name ? [{ name, amountText: text(ingredient.amountText ?? ingredient.amount) }] : [];
        }),
        steps: steps(node.recipeInstructions),
        images: images(node.image),
      },
    });
  }
  return { records, detailLinks };
}

const siteSources = {
  douguo: {
    homepage: 'https://www.douguo.com/',
    imageHosts: ['cp1.douguo.com', 'cp2.douguo.com', 'cp3.douguo.com'],
    recipePath: /^\/cookbook\/(\d+)\.html$/,
    delayMs: 1000
  },
  meishichina: {
    homepage: 'https://home.meishichina.com/',
    imageHosts: ['i3.meishichina.com', 'i8.meishichina.com', 'i9.meishichina.com'],
    recipePath: /^\/recipe-(\d+)\.html$/,
    delayMs: 500
  },
  xiachufang: {
    homepage: 'https://www.xiachufang.com/',
    imageHosts: ['i1.chuimg.com', 'i2.chuimg.com', 'i3.chuimg.com', 'i4.chuimg.com', 'i5.chuimg.com'],
    recipePath: /^\/recipe\/(\d+)\/?$/,
    delayMs: 10000
  }
};

function parseSiteHtml(html) {
  const root = { children: [] };
  const stack = [root];
  const tokens = /<!--[\s\S]*?(?:-->|$)|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<(\/?)([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>|([^<]+)/gi;
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  for (const [, rawTag, closing, tag, markup, content] of html.matchAll(tokens)) {
    if (rawTag) continue;
    if (content) {
      stack.at(-1).children.push(content);
      continue;
    }
    if (!tag) continue;
    const name = tag.toLowerCase();
    if (closing) {
      const index = stack.findLastIndex((node) => node.tag === name);
      if (index > 0) stack.length = index;
      continue;
    }
    const node = { tag: name, attrs: attributes(markup), children: [] };
    stack.at(-1).children.push(node);
    if (!voidTags.has(name) && !markup.endsWith('/')) stack.push(node);
  }
  return root;
}

function select(root, predicate) {
  const matches = [];
  const pending = [...(root?.children || [])].reverse();
  while (pending.length) {
    const node = pending.pop();
    if (typeof node === 'string') continue;
    if (predicate(node)) matches.push(node);
    for (let i = node.children.length - 1; i >= 0; i--) pending.push(node.children[i]);
  }
  return matches;
}

function nodeText(node) {
  if (!node) return '';
  if (typeof node === 'string') return decodeEntities(node);
  if (node.tag === 'br') return '\n';
  return node.children.map(nodeText).join('').trim();
}

const withClass = (name) => (node) => (node.attrs.class || '').split(/\s+/).includes(name);
const tagIs = (name) => (node) => node.tag === name;
const firstClass = (node, name) => select(node, withClass(name))[0];

function meishichinaStepText(node) {
  const children = node?.children || [];
  const index = children.findIndex((child) => nodeText(child).trim());
  const marker = children[index];
  if (marker?.tag === 'div' && /^\d+$/.test(nodeText(marker))) {
    return children.slice(index + 1).map(nodeText).join('').trim();
  }
  return nodeText(node);
}

function douguoRecipe(tree, result, url) {
  const byId = (id) => select(tree, (node) => node.attrs.id === id)[0];
  const photo = (node) => remoteUrl(node?.attrs['data-origin'] || node?.attrs['data-src'] || node?.attrs.src, url);
  const ingredients = select(firstClass(tree, 'retamr'), tagIs('td')).map((cell) => ({
    name: nodeText(firstClass(cell, 'scname')),
    amountText: nodeText(firstClass(cell, 'scnum'))
  })).filter(({ name }) => name);
  const steps = select(firstClass(tree, 'step'), withClass('stepcont')).map((step) => {
    const info = firstClass(step, 'stepinfo');
    const marker = select(info, tagIs('p')).find((node) => /^步骤\s*\d+$/.test(nodeText(node)));
    const instruction = (info?.children || []).filter((node) => node !== marker).map(nodeText).join('').trim();
    const image = photo(select(step, (node) => Boolean(node.attrs['data-origin']))[0]) || photo(select(step, tagIs('img'))[0]);
    return { text: instruction, images: image ? [image] : [] };
  }).filter((step) => step.text);
  const structured = result.records[0]?.recipe;
  const cover = photo(byId('banner')) || photo(select(byId('banner'), tagIs('img'))[0]);
  return {
    name: nodeText(select(tree, tagIs('h1'))[0]) || structured?.name,
    categories: structured?.categories || [],
    ingredients: ingredients.length ? ingredients : structured?.ingredients || [],
    steps: steps.length ? steps : structured?.steps || [],
    images: cover ? [cover] : structured?.images || []
  };
}

function sitePage(body, url, site) {
  const html = body.toString('utf8');
  const tree = parseSiteHtml(html);
  const title = nodeText(select(tree, tagIs('title'))[0]);
  if (/滑动验证|安全验证|人机验证|Just a moment|Access Denied/i.test(title)) {
    throw new Error('站点要求访问验证，采集已停止');
  }
  const parsed = readPage(body, url);
  const result = extractPage(parsed, url);
  const sameSite = (value) => {
    const address = remoteUrl(value, url);
    return address && new URL(address).origin === new URL(site.homepage).origin && address;
  };
  const canonicalRecipe = (value) => {
    const address = sameSite(value);
    if (!address) return null;
    const { pathname } = new URL(address);
    const match = pathname.match(site.recipePath);
    if (!match) return null;
    const canonicalPath = site === siteSources.xiachufang ? `/recipe/${match[1]}/` : pathname;
    return new URL(canonicalPath, site.homepage).href;
  };
  const canonical = canonicalRecipe(url);
  if (canonical) {
    const sourceId = new URL(canonical).pathname.match(site.recipePath)[1];
    if (site === siteSources.douguo) {
      const recipe = douguoRecipe(tree, result, url);
      if (!recipe.name || !recipe.ingredients.length || !recipe.steps.length) throw new Error('豆果详情缺少菜名、食材或做法');
      return { records: [{ recipe: { ...recipe, sourceId, sourceUrl: canonical }, explicitUrl: canonical }], detailLinks: [], next: [] };
    }
    const xcf = site === siteSources.xiachufang;
    const images = (root) => select(root, tagIs('img')).map(({ attrs }) =>
      remoteUrl(attrs['data-src'] || attrs['data-original'] || attrs['data-cfsrc'] || attrs.src, url)).filter(Boolean);
    const cover = firstClass(tree, xcf ? 'cover' : 'recipe_De_imgBox') || firstClass(tree, 'recipe_De_img');
    const ogImage = select(tree, (node) => node.tag === 'meta' && node.attrs.property === 'og:image')[0];
    const hero = remoteUrl(ogImage?.attrs.content, url) || images(cover)[0];
    const ingredients = xcf
      ? select(firstClass(tree, 'ings'), tagIs('tr')).map((row) => ({
        name: nodeText(firstClass(row, 'name')), amountText: nodeText(firstClass(row, 'unit'))
      }))
      : select(tree, withClass('recipeCategory_sub_R')).flatMap((group) => select(group, tagIs('li'))).map((row) => ({
        name: nodeText(firstClass(row, 'category_s1')), amountText: nodeText(firstClass(row, 'category_s2'))
      }));
    const steps = xcf
      ? select(firstClass(tree, 'steps'), tagIs('li')).map((step) => ({
        text: nodeText(firstClass(step, 'text') || select(step, tagIs('p'))[0]), images: images(step)
      }))
      : select(tree, withClass('recipeStep')).flatMap((group) => select(group, tagIs('li'))).map((step) => ({
        text: meishichinaStepText(firstClass(step, 'recipeStep_word')),
        images: images(firstClass(step, 'recipeStep_img'))
      }));
    const categoryRoot = firstClass(tree, xcf ? 'recipe-cats' : 'recipeTip');
    const categories = select(categoryRoot, tagIs('a')).map(nodeText).filter(Boolean);
    const name = nodeText(select(tree, (node) => node.tag === 'h1' || node.attrs.id === 'recipe_title')[0]);
    const structured = result.records.find(({ recipe }) => recipe.ingredients.length && recipe.steps.length)?.recipe;
    const native = { name, ingredients: ingredients.filter((item) => item.name), steps: steps.filter((step) => step.text),
      categories, images: hero ? [hero] : [] };
    const recipe = structured ? {
      ...structured,
      categories: [...new Set([...structured.categories, ...categories])],
      images: structured.images.length ? structured.images : native.images,
      steps: native.steps.some((step) => step.images.length) ? native.steps : structured.steps
    } : native;
    if (!recipe.name || !recipe.ingredients.length || !recipe.steps.length) throw new Error('菜谱详情缺少菜名、食材或做法');
    return { records: [{ recipe: { ...recipe, sourceId, sourceUrl: canonical }, explicitUrl: canonical }], detailLinks: [], next: [] };
  }
  const links = select(tree, tagIs('a'));
  const detailLinks = [...new Set([...result.detailLinks, ...links.map((node) => node.attrs.href)].map(canonicalRecipe).filter(Boolean))];
  const next = [...parsed.next, ...links.filter((node) => /^下一页\s*[›»>]?$/u.test(nodeText(node))).map((node) => node.attrs.href)]
    .map(sameSite).filter((address) => address && !canonicalRecipe(address));
  if (!detailLinks.length && !next.length && !result.records.length) throw new Error('页面中没有发现菜谱链接');
  return { records: result.records, detailLinks, next };
}

async function* jsonld({ input, request, maxPages = 100 }, site) {
  const start = remoteUrl(input);
  if (!start) throw new Error(`Invalid recipe page URL: ${input}`);
  if (site && new URL(start).origin !== new URL(site.homepage).origin) {
    throw new Error(`请输入 ${new URL(site.homepage).host} 的网页链接`);
  }
  if (!Number.isSafeInteger(maxPages) || maxPages < 1) {
    throw new Error(`Invalid maxPages (${maxPages}) for ${start}: expected a positive integer`);
  }

  let requests = 0;
  const fetched = new Map();
  async function load(url) {
    if (fetched.has(url)) return fetched.get(url);
    if (requests >= maxPages) throw new Error(`maxPages (${maxPages}) exceeded before requesting ${url}`);
    requests += 1;
    let resolved = url;
    try {
      const response = await request(url, 'page');
      resolved = pageUrl(remoteUrl(response.url, url) ?? url);
      let page = fetched.get(resolved);
      if (!page) {
        if (site) {
          if (new URL(resolved).origin !== new URL(site.homepage).origin) throw new Error('详情重定向到站外');
          page = { url: resolved, ...sitePage(response.body, resolved, site) };
        } else {
          const parsed = readPage(response.body, resolved);
          page = { url: resolved, next: parsed.next, ...extractPage(parsed, resolved) };
        }
      }
      fetched.set(resolved, page);
      fetched.set(url, page);
      return page;
    } catch (error) {
      const location = resolved === url ? url : `${url} (resolved to ${resolved})`;
      throw new Error(`Cannot read recipe page at ${location}: ${error.message}`, { cause: error });
    }
  }

  const listingPages = new Set();
  const detailPages = new Set();
  const details = new Set();
  const inlineUrls = new Set();
  const recipes = new Map();
  function collect(records) {
    for (const { recipe, explicitUrl } of records) {
      if (explicitUrl) inlineUrls.add(pageUrl(explicitUrl));
      const identity = JSON.stringify([recipe.sourceUrl, recipe.sourceId]);
      const previous = recipes.get(identity);
      if (previous && JSON.stringify(previous) !== JSON.stringify(recipe)) {
        throw new Error(`同一来源链接存在不同菜谱记录：${recipe.sourceUrl}`);
      }
      recipes.set(identity, recipe);
    }
  }

  // Discover the pagination chain before making any detail requests.
  const listings = new Set([pageUrl(start)]);
  for (const url of listings) {
    const page = await load(url);
    if (listingPages.has(page.url)) continue;
    listingPages.add(page.url);
    const { records, detailLinks } = page;
    collect(records);
    for (const detail of detailLinks) details.add(detail);
    for (const next of page.next) listings.add(pageUrl(next));
  }

  for (const url of details) {
    if (inlineUrls.has(url) || listings.has(url) || listingPages.has(url) || detailPages.has(url)) continue;
    const page = await load(url);
    if (listingPages.has(page.url) || detailPages.has(page.url)) continue;
    detailPages.add(page.url);
    const { records } = page;
    if (!records.length) throw new Error(`No schema.org Recipe found at ${page.url}`);
    collect(records);
  }

  if (!recipes.size) throw new Error(`No schema.org Recipe found at ${start}`);
  // Yield only after discovery succeeds, so a page limit or request failure cannot publish a partial batch.
  yield* recipes.values();
}

const { howtocook } = require('./howtocook');
const adapters = { json, jsonld, howtocook };
for (const [name, config] of Object.entries(siteSources)) {
  adapters[name] = (options) => jsonld({ ...options, input: options.input || config.homepage }, config);
}

module.exports = { adapters, siteSources };
