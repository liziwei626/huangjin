'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { COURSES } = require('../../src/data/meta');

const SOURCE = 'https://github.com/Anduin2017/HowToCook/blob/master/';
const COURSE_BY_DIRECTORY = new Map([
  ['aquatic', 'main'], ['meat', 'main'], ['meat_dish', 'main'], ['vegetable', 'veg'], ['vegetable_dish', 'veg'],
  ['breakfast', 'staple'], ['staple', 'staple'], ['soup', 'soup'],
  ['dessert', 'snack'], ['drink', 'snack']
]);
const LIST_ITEM = /^(\s*)(?:[-+*]|\d+[.)、．])\s+(.+)$/;
const IMAGE = /!\[[^\]\n]*\]\(\s*(?:<([^>]+)>|((?:\\.|[^\s()\\]|\([^()]*\))+))(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)|<img\b(?:"[^"]*"|'[^']*'|[^'">])*>/gi;
const QUANTITY = /(?:[\d０-９½¼¾]|[一二两三四五六七八九十半](?=\s*(?:克|斤|升|勺|匙|个|块|片|根|瓣|颗|份|碗|杯|袋|把|条|只|撮|滴|段|张|枚|粒|盒|瓶))|适量|少许|若干|少量|些许)/u;
const LEADING_QUANTITY = /^([\d０-９½¼¾一二两三四五六七八九十半][\d０-９./／~～至\-\s]*\s*(?:kg|mg|ml|g|l|毫克|千克|公斤|毫升|大勺|小勺|汤匙|茶匙|克|斤|升|勺|匙|个|块|片|根|瓣|颗|份|碗|杯|袋|把|条|只|撮|滴|段|张|枚|粒|盒|瓶))(?:\s*)(\S.*)$/iu;

const isTemplate = (name) => /模板|template/i.test(name);
const isMarkdown = (name) => /\.md$/i.test(name) && !isTemplate(name) && !/^readme\.md$/i.test(name);

async function* markdownFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  for (const entry of entries) {
    const { name } = entry;
    if (name.startsWith('.') || isTemplate(name)) continue;
    const filename = path.join(directory, name);
    if (entry.isDirectory()) yield* markdownFiles(filename);
    else if (entry.isFile() && isMarkdown(name)) yield filename;
  }
}

function isInside(root, filename) {
  const relative = path.relative(root, filename);
  return relative && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function plainText(markdown) {
  return markdown.replace(IMAGE, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(\*{1,3}|_{1,3}|`+)(\S(?:.*?\S)?)\1/g, '$2')
    .trim();
}

function splitSections(markdown) {
  const sections = { intro: [], ingredients: [], calculation: [], operation: [] };
  let group = 'intro';
  let sectionLevel = 7;
  let name = '';
  for (const line of markdown.replace(/^\uFEFF/, '').replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/)) {
    const heading = line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!heading) {
      sections[group]?.push(line);
      continue;
    }
    const level = heading[1].length;
    const title = plainText(heading[2]);
    if (level === 1) name ||= title.replace(/的做法$/, '').trim();
    else if (/^计算/.test(title)) [group, sectionLevel] = ['calculation', level];
    else if (/^(?:必备|所需|准备)?(?:原材?料|食材|材料|用料)/.test(title)) [group, sectionLevel] = ['ingredients', level];
    else if (/^(?:操作|制作步骤|烹饪步骤|做法|步骤)/.test(title)) [group, sectionLevel] = ['operation', level];
    else if (level <= sectionLevel) [group, sectionLevel] = ['', level];
  }
  return { name, ...sections };
}

function parseIngredient(text) {
  const colon = text.match(/^(.+?)\s*[：:]\s*(.+)$/);
  if (colon && !/\d\s*$/.test(colon[1])) return { name: colon[1].trim(), amountText: colon[2].trim() };
  const leading = text.match(LEADING_QUANTITY);
  if (leading) return { name: leading[2], amountText: leading[1] };
  const index = text.search(QUANTITY);
  if (index > 0) {
    const name = text.slice(0, index).trim();
    const parenthesized = /[（(]$/.test(name);
    return {
      name: name.replace(/[（(：:]$/, '').trim(),
      amountText: parenthesized ? text.slice(index).replace(/[）)]$/, '').trim() : text.slice(index).trim()
    };
  }
  return { name: text, amountText: '' };
}

function ingredientList(lines) {
  return lines.flatMap((line) => {
    const text = plainText(line.match(LIST_ITEM)?.[2] || '').trim();
    return text && !/[：:]$/.test(text) ? [parseIngredient(text)] : [];
  }).filter(({ name }) => name);
}

async function imagePaths(line, root, filename) {
  const images = [];
  for (const [markup, angled, bare] of line.matchAll(IMAGE)) {
    const html = markup.startsWith('<') && markup.match(/\s+src\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const ref = angled ?? bare ?? (html && (html[1] ?? html[2] ?? html[3]));
    if (!ref) continue;
    let decoded;
    try {
      decoded = decodeURIComponent(ref.replace(/\\([() ])/g, '$1').replace(/[?#].*$/, ''));
    } catch {
      continue;
    }
    if (!decoded || /[\\\0]|^[a-z][a-z\d+.-]*:|^\/\//i.test(decoded)) continue;
    const candidate = decoded.startsWith('/')
      ? path.resolve(root, `.${decoded}`) : path.resolve(path.dirname(filename), decoded);
    if (!isInside(root, candidate)) continue;
    try {
      const real = await fs.realpath(candidate);
      if (isInside(root, real) && (await fs.stat(real)).isFile()) images.push(path.relative(root, real));
    } catch (error) {
      if (!['ENOENT', 'ENOTDIR', 'ELOOP'].includes(error.code)) throw error;
    }
  }
  return images;
}

async function parseRecipe(root, filename, sourcePath) {
  const sections = splitSections(await fs.readFile(filename, 'utf8'));
  const name = sections.name || path.basename(filename, path.extname(filename));
  const calculated = ingredientList(sections.calculation);
  const listed = ingredientList(sections.ingredients);
  const ingredients = calculated.some(({ amountText }) => amountText) || !listed.length ? calculated : listed;
  if (!ingredients.length || !sections.operation.length) return;

  const covers = new Set(await imagePaths(sections.intro.join('\n'), root, filename));
  const steps = [];
  let step;
  let separated = true;
  for (const line of sections.operation) {
    if (!line.trim()) {
      separated = true;
      continue;
    }
    const item = line.match(LIST_ITEM);
    const text = plainText(item?.[2] ?? line);
    const images = (await imagePaths(line, root, filename)).filter((image) => !covers.has(image));
    if (!text && !images.length) continue;
    if (!step || (text && step.text && (item || (separated && !/^\s/.test(line))))) {
      step = { text: '', images: [] };
      steps.push(step);
    }
    if (text) step.text = step.text ? `${step.text}\n${text}` : text;
    step.images = [...new Set([...step.images, ...images])];
    separated = false;
  }
  if (!steps.some(({ text }) => text)) return;

  const [, directory, child] = sourcePath.split('/');
  const categories = child ? [directory] : [];
  const course = child && COURSE_BY_DIRECTORY.get(directory);
  if (course) categories.push(COURSES[course].label);
  return {
    sourceId: sourcePath,
    sourceUrl: SOURCE + sourcePath.split('/').map(encodeURIComponent).join('/'),
    name, categories, ingredients, steps, images: [...covers], assetRoot: root
  };
}

// The caller's request function and page budget apply to HTTP sources only.
async function* howtocook({ input }) {
  if (typeof input !== 'string' || !input.trim()) throw new Error('请指定 HowToCook 检出目录或 Markdown 文件');
  const location = await fs.realpath(input);
  const stat = await fs.stat(location);
  if (stat.isDirectory()) {
    const dishes = path.join(location, 'dishes');
    if (!(await fs.lstat(dishes)).isDirectory()) throw new Error(`HowToCook 菜谱目录无效：${dishes}`);
    for await (const filename of markdownFiles(dishes)) {
      const recipe = await parseRecipe(location, filename, path.relative(location, filename).split(path.sep).join('/'));
      if (recipe) yield recipe;
    }
  } else if (stat.isFile() && isMarkdown(path.basename(location))) {
    let directory = path.dirname(location);
    while (path.basename(directory) !== 'dishes' && directory !== path.dirname(directory)) directory = path.dirname(directory);
    const inDishes = path.basename(directory) === 'dishes';
    const root = inDishes ? path.dirname(directory) : path.dirname(location);
    const sourcePath = inDishes ? path.relative(root, location).split(path.sep).join('/') : `dishes/${path.basename(location)}`;
    const recipe = await parseRecipe(root, location, sourcePath);
    if (recipe) yield recipe;
  }
}

module.exports = { howtocook };
