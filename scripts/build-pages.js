'use strict';

/**
 * 生成 GitHub Pages 纯静态站点到 docs/。
 *
 * 用法：node scripts/build-pages.js
 * 产物：docs/index.html、docs/admin.html、docs/static-data.js、docs/images/dishes/*.jpg 等。
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const PUBLIC = path.join(ROOT, 'public');

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function stripImagesPaths(code) {
  return code.replace(/\/images\//g, 'images/');
}

function moduleSource(file, replacements = []) {
  let code = read(file);
  for (const [from, to] of replacements) code = code.split(from).join(to);
  return stripImagesPaths(code);
}

function buildStaticData() {
  const sources = {
    'data/meta': moduleSource('src/data/meta.js'),
    'data/recipe-utils': moduleSource('src/data/recipe-utils.js'),
    'data/recipes': moduleSource('src/data/recipes.js', [
      ["require('./recipe-utils')", "require('data/recipe-utils')"],
      ["require('./dish-images-index.json')", "require('dish-images-index.json')"]
    ]),
    'data/articles': moduleSource('src/data/articles.js'),
    planner: moduleSource('src/planner.js', [
      ["require('./data/recipes')", "require('data/recipes')"],
      ["require('./data/meta')", "require('data/meta')"]
    ])
  };
  const dishIndex = read('src/data/dish-images-index.json');

  const factories = Object.entries(sources)
    .map(([id, code]) => `${JSON.stringify(id)}: function(module, exports, require) {\n${code}\n}`)
    .join(',\n');
  const jsonFactory = `${JSON.stringify('dish-images-index.json')}: function(module) { module.exports = ${dishIndex}; }`;

  return `/* 自动生成：node scripts/build-pages.js */
(function () {
  const factories = {
${factories},
${jsonFactory}
  };
  const cache = {};
  function require(id) {
    if (cache[id]) return cache[id].exports;
    if (!factories[id]) throw new Error('module not found: ' + id);
    const module = { exports: {} };
    cache[id] = module;
    factories[id](module, module.exports, require);
    return module.exports;
  }
  const recipes = require('data/recipes');
  const articles = require('data/articles');
  const meta = require('data/meta');
  const utils = require('data/recipe-utils');
  const planner = require('planner');
  window.NUANYUE = {
    RECIPES: recipes.RECIPES,
    RECIPE_MAP: recipes.RECIPE_MAP,
    ARTICLES: articles.ARTICLES,
    ARTICLE_MAP: articles.ARTICLE_MAP,
    planner,
    data: meta,
    utils: Object.assign({}, utils, { imageForRecipe: recipes.imageForRecipe })
  };
})();
`;
}

function unpackDishImages() {
  const index = JSON.parse(read('src/data/dish-images-index.json'));
  const pack = fs.readFileSync(path.join(ROOT, 'src', 'data', 'dish-images.bin'));
  const dir = path.join(DOCS, 'images', 'dishes');
  fs.mkdirSync(dir, { recursive: true });
  for (const [id, entry] of Object.entries(index)) {
    fs.writeFileSync(path.join(dir, `${id}.jpg`), pack.subarray(entry.offset, entry.offset + entry.length));
  }
  return Object.keys(index).length;
}

function rewriteHtml(file, scriptPlaceholder, replacements) {
  let html = read(file);
  html = html.replace(
    scriptPlaceholder,
    `<script>window.NUANYUE_STATIC = true;</script>\n  <script src="static-data.js" defer></script>\n  <script src="static-api.js" defer></script>\n  ${scriptPlaceholder}`
  );
  html = html.replace(/="\/([^"]*)"/g, '="$1"');
  for (const [from, to] of replacements) html = html.split(from).join(to);
  fs.writeFileSync(path.join(DOCS, path.basename(file)), html);
}

function rewriteManifest() {
  const file = path.join(DOCS, 'manifest.webmanifest');
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  manifest.start_url = './';
  manifest.scope = './';
  if (Array.isArray(manifest.icons)) {
    manifest.icons = manifest.icons.map((icon) => ({ ...icon, src: String(icon.src || '').replace(/^\//, '') }));
  }
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
}

function build() {
  fs.rmSync(DOCS, { recursive: true, force: true });
  fs.mkdirSync(DOCS, { recursive: true });

  for (const file of ['index.html', 'admin.html', 'app.js', 'styles.css', 'admin.css', 'admin.js', 'icon.svg', 'manifest.webmanifest', 'static-api.js']) {
    fs.copyFileSync(path.join(PUBLIC, file), path.join(DOCS, file));
  }
  fs.cpSync(path.join(PUBLIC, 'images'), path.join(DOCS, 'images'), { recursive: true });
  fs.writeFileSync(path.join(DOCS, '.nojekyll'), '');
  fs.writeFileSync(path.join(DOCS, 'static-data.js'), buildStaticData());

  for (const file of ['app.js', 'admin.js', 'styles.css']) {
    const target = path.join(DOCS, file);
    fs.writeFileSync(target, stripImagesPaths(fs.readFileSync(target, 'utf8')));
  }

  rewriteHtml('public/index.html', '<script src="/app.js?v=4.3" defer></script>', []);
  rewriteHtml('public/admin.html', '<script src="/admin.js?v=4.3" defer></script>', []);
  rewriteManifest();

  const count = unpackDishImages();
  console.log(`GitHub Pages 构建完成：docs/，菜品图 ${count} 张`);
}

build();
