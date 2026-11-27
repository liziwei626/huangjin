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

async function* jsonld({ input, request, maxPages = 100 }) {
  const start = remoteUrl(input);
  if (!start) throw new Error(`Invalid recipe page URL: ${input}`);
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
        const parsed = readPage(response.body, resolved);
        page = { url: resolved, next: parsed.next, ...extractPage(parsed, resolved) };
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

module.exports = { adapters: { json, jsonld } };
