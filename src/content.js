'use strict';

/**
 * 菜品与内容的可管理存储层。
 * 内置食谱/文章来自代码，管理后台的修改以「覆盖快照」的形式写入 db.content，
 * 启动时重新套用到内存中的 RECIPES / ARTICLES，保证运营改动可持久化。
 */

const { RECIPES, RECIPE_MAP, imageForRecipe } = require('./data/recipes');
const { ARTICLES, ARTICLE_MAP } = require('./data/articles');
const { decorateRecipe } = require('./data/recipe-utils');
const { getDb, save, newId } = require('./db');

// 保留内置内容的原始快照，恢复备份后可完整重建运行时数据。
const BASE_RECIPE_SNAPSHOT = RECIPES.map((r) => ({ ...r }));
const BASE_ARTICLE_SNAPSHOT = ARTICLES.map((a) => ({
  ...a,
  sections: (a.sections || []).map((s) => ({ h: s.h, p: [...(s.p || [])] }))
}));

const DERIVED_RECIPE_FIELDS = [
  'searchText',
  'nutrients',
  'method',
  'difficulty',
  'cautions',
  'substitutes',
  'vegetarian'
];

const IMAGE_OPTIONS = [
  '/images/staple.jpg',
  '/images/rice.jpg',
  '/images/noodle.jpg',
  '/images/bun.jpg',
  '/images/bun.jpg?v=2',
  '/images/main.jpg',
  '/images/pork.jpg',
  '/images/beef.jpg',
  '/images/chicken.jpg',
  '/images/duck.jpg',
  '/images/shrimp.jpg',
  '/images/shrimp.jpg?v=2',
  '/images/egg.jpg',
  '/images/veg.jpg',
  '/images/tofu.jpg',
  '/images/soup.jpg',
  '/images/snack.jpg',
  '/images/dessert.jpg',
  '/images/fruit.jpg',
  '/images/drink.jpg'
];

function ensureContent() {
  const db = getDb();
  if (!db.content || typeof db.content !== 'object') db.content = {};
  const c = db.content;
  if (!Array.isArray(c.recipes)) c.recipes = [];
  if (!Array.isArray(c.articles)) c.articles = [];
  if (!c.recipeOverrides || typeof c.recipeOverrides !== 'object') c.recipeOverrides = {};
  if (!c.articleOverrides || typeof c.articleOverrides !== 'object') c.articleOverrides = {};
  return c;
}

function normalizeRecipe(source) {
  const copy = { ...source };
  for (const key of DERIVED_RECIPE_FIELDS) delete copy[key];
  copy.image = copy.image && copy.image !== 'auto' ? copy.image : imageForRecipe(copy);
  copy.available = copy.available !== false;
  copy.price = Math.max(0, Number(copy.price) || 0);
  return decorateRecipe(copy);
}

function normalizeArticle(source) {
  return {
    id: source.id,
    title: String(source.title || '').trim(),
    summary: String(source.summary || '').trim(),
    minutes: Math.max(1, Math.round(Number(source.minutes) || 3)),
    tag: String(source.tag || '饮食调养').trim(),
    sections: Array.isArray(source.sections)
      ? source.sections
          .map((s) => ({
            h: String(s?.h || '').trim(),
            p: (Array.isArray(s?.p) ? s.p : []).map((p) => String(p).trim()).filter(Boolean)
          }))
          .filter((s) => s.h && s.p.length)
      : [],
    available: source.available !== false,
    admin: Boolean(source.admin),
    updatedAt: new Date().toISOString()
  };
}

function syncRecipe(recipe) {
  const idx = RECIPES.findIndex((r) => r.id === recipe.id);
  if (idx >= 0) RECIPES[idx] = recipe;
  else RECIPES.push(recipe);
  RECIPE_MAP.set(recipe.id, recipe);
}

function syncArticle(article) {
  const idx = ARTICLES.findIndex((a) => a.id === article.id);
  if (idx >= 0) ARTICLES[idx] = article;
  else ARTICLES.push(article);
  ARTICLE_MAP.set(article.id, article);
}

/** 启动时把后台内容套用到运行时数据。 */
function applyContent() {
  const c = ensureContent();

  for (const raw of c.recipes) {
    if (!raw || !raw.id) continue;
    syncRecipe(normalizeRecipe({ ...raw, admin: true, custom: false }));
  }

  for (const [id, snapshot] of Object.entries(c.recipeOverrides)) {
    const idx = RECIPES.findIndex((r) => r.id === id);
    if (idx < 0) continue;
    syncRecipe(normalizeRecipe({ ...RECIPES[idx], ...snapshot, id }));
  }

  for (const raw of c.articles) {
    if (!raw || !raw.id) continue;
    syncArticle(normalizeArticle({ ...raw, admin: true }));
  }

  for (const [id, snapshot] of Object.entries(c.articleOverrides)) {
    const idx = ARTICLES.findIndex((a) => a.id === id);
    if (idx < 0) continue;
    syncArticle(normalizeArticle({ ...ARTICLES[idx], ...snapshot, id }));
  }
}

/**
 * 恢复备份后使用：丢弃内存中的所有覆盖与后台新增内容，
 * 回到内置数据后再套用当前 db.content。
 */
function resetRuntime() {
  RECIPES.length = 0;
  for (const recipe of BASE_RECIPE_SNAPSHOT) RECIPES.push({ ...recipe, ingredients: [...(recipe.ingredients || [])], steps: [...(recipe.steps || [])] });
  RECIPE_MAP.clear();
  for (const recipe of RECIPES) RECIPE_MAP.set(recipe.id, recipe);

  ARTICLES.length = 0;
  for (const article of BASE_ARTICLE_SNAPSHOT) {
    ARTICLES.push({ ...article, sections: article.sections.map((s) => ({ h: s.h, p: [...s.p] })) });
  }
  ARTICLE_MAP.clear();
  for (const article of ARTICLES) ARTICLE_MAP.set(article.id, article);

  applyContent();
}

function listRecipes() {
  return RECIPES.slice();
}

function listArticles() {
  return ARTICLES.slice();
}

function createRecipe(data) {
  const c = ensureContent();
  const recipe = normalizeRecipe({
    ...data,
    id: newId('a'),
    admin: true,
    custom: false,
    createdAt: new Date().toISOString()
  });
  c.recipes.push(recipe);
  syncRecipe(recipe);
  save();
  return recipe;
}

function updateRecipe(id, data) {
  const existing = RECIPE_MAP.get(id);
  if (!existing) return null;
  const c = ensureContent();
  const recipe = normalizeRecipe({
    ...existing,
    ...data,
    id,
    admin: Boolean(existing.admin),
    custom: Boolean(existing.custom),
    customOwnerId: existing.customOwnerId
  });

  const adminIdx = c.recipes.findIndex((r) => r.id === id);
  if (adminIdx >= 0) c.recipes[adminIdx] = recipe;
  else if (existing.admin) c.recipes.push(recipe);
  else c.recipeOverrides[id] = recipe;
  syncRecipe(recipe);
  save();
  return recipe;
}

function setRecipeAvailable(id, available) {
  return updateRecipe(id, { available: Boolean(available) });
}

/** 仅允许删除后台创建的菜品，内置菜品通过下架控制。 */
function removeRecipe(id) {
  const existing = RECIPE_MAP.get(id);
  if (!existing) return { error: '菜品不存在' };
  if (!existing.admin) return { error: '内置菜品不支持删除，请使用下架' };
  const c = ensureContent();
  const idx = c.recipes.findIndex((r) => r.id === id);
  if (idx >= 0) c.recipes.splice(idx, 1);
  const runtimeIdx = RECIPES.findIndex((r) => r.id === id);
  if (runtimeIdx >= 0) RECIPES.splice(runtimeIdx, 1);
  RECIPE_MAP.delete(id);
  save();
  return { ok: true };
}

function createArticle(data) {
  const c = ensureContent();
  const article = normalizeArticle({
    ...data,
    id: newId('na'),
    admin: true
  });
  c.articles.push(article);
  syncArticle(article);
  save();
  return article;
}

function updateArticle(id, data) {
  const existing = ARTICLE_MAP.get(id);
  if (!existing) return null;
  const c = ensureContent();
  const article = normalizeArticle({ ...existing, ...data, id, admin: Boolean(existing.admin) });
  const adminIdx = c.articles.findIndex((a) => a.id === id);
  if (adminIdx >= 0) c.articles[adminIdx] = article;
  else if (existing.admin) c.articles.push(article);
  else c.articleOverrides[id] = article;
  syncArticle(article);
  save();
  return article;
}

function setArticleAvailable(id, available) {
  return updateArticle(id, { available: Boolean(available) });
}

function removeArticle(id) {
  const existing = ARTICLE_MAP.get(id);
  if (!existing) return { error: '文章不存在' };
  if (!existing.admin) return { error: '内置文章不支持删除，请使用下架' };
  const c = ensureContent();
  const idx = c.articles.findIndex((a) => a.id === id);
  if (idx >= 0) c.articles.splice(idx, 1);
  const runtimeIdx = ARTICLES.findIndex((a) => a.id === id);
  if (runtimeIdx >= 0) ARTICLES.splice(runtimeIdx, 1);
  ARTICLE_MAP.delete(id);
  save();
  return { ok: true };
}

function publicArticles() {
  return ARTICLES.filter((a) => a.available !== false);
}

module.exports = {
  IMAGE_OPTIONS,
  ensureContent,
  applyContent,
  resetRuntime,
  listRecipes,
  listArticles,
  createRecipe,
  updateRecipe,
  setRecipeAvailable,
  removeRecipe,
  createArticle,
  updateArticle,
  setArticleAvailable,
  removeArticle,
  publicArticles
};
