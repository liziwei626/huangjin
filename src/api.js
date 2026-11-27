'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const {
  getDb,
  save,
  findUserById,
  findUserByUsername,
  addUser,
  newId,
  touchUser,
  DATA_DIR
} = require('./db');
const { hashPassword, verifyPassword, signToken, verifyToken } = require('./auth');
const { RECIPES, RECIPE_MAP } = require('./data/recipes');
const {
  COURSES,
  SLOTS,
  STAGES,
  RESTRICTIONS,
  TASTES,
  DELIVERY_TYPES,
  FEEDINGS,
  CALORIE_PRESETS,
  DEFAULT_SLOTS,
  EFFECT_GROUPS,
  COLLECTIONS,
  LOG_OPTIONS
} = require('./data/meta');
const { ARTICLE_MAP } = require('./data/articles');
const { decorateRecipe, inferCategory, INGREDIENT_CATEGORIES } = require('./data/recipe-utils');
const content = require('./content');
const { fetchArticle } = require('./article-fetch');
const planner = require('./planner');

const DEMO_USERNAME = 'demo';
const DEMO_PASSWORD = 'demo123456';
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code || 'BAD_REQUEST';
  }
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readJson(req, limit = 256 * 1024) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > limit) {
        reject(new ApiError(413, '请求内容过大', 'PAYLOAD_TOO_LARGE'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('not an object');
        }
        resolve(parsed);
      } catch {
        reject(new ApiError(400, '请求格式不正确', 'INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

function requireUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const payload = verifyToken(token, getDb().secret);
  if (!payload) throw new ApiError(401, '登录已过期，请重新登录', 'UNAUTHORIZED');
  const user = findUserById(payload.uid);
  if (!user) throw new ApiError(401, '账号不存在，请重新登录', 'UNAUTHORIZED');
  if (user.disabled) throw new ApiError(403, '该账号已被停用，请联系管理员', 'ACCOUNT_DISABLED');
  ensureCollections(user);
  return user;
}

function requireAdmin(req) {
  const user = requireUser(req);
  if (user.role !== 'admin') throw new ApiError(403, '该账号没有管理权限', 'FORBIDDEN');
  return user;
}

function ensureCollections(user) {
  if (!user.logs || typeof user.logs !== 'object') user.logs = {};
  if (!user.skipped || typeof user.skipped !== 'object') user.skipped = {};
  if (!user.eaten || typeof user.eaten !== 'object') user.eaten = {};
  if (!user.groceryChecks || typeof user.groceryChecks !== 'object') user.groceryChecks = {};
  if (!Array.isArray(user.favorites)) user.favorites = [];
  if (!Array.isArray(user.customRecipes)) user.customRecipes = [];
  if (!Array.isArray(user.cooked)) user.cooked = [];
  if (!user.recipeNotes || typeof user.recipeNotes !== 'object') user.recipeNotes = {};
  return user;
}

function optionalUser(req) {
  try {
    return requireUser(req);
  } catch {
    return null;
  }
}

function dateParam(url) {
  const raw = url.searchParams.get('date');
  if (planner.isValidDate(raw)) return raw;
  return planner.todayStr();
}

function defaultProfile(name) {
  const today = planner.todayStr();
  return {
    name,
    deliveryDate: planner.addDays(today, -7),
    deliveryType: '顺产',
    feeding: '混合喂养',
    restrictions: [],
    taste: '适中',
    calorieGoal: 2600,
    slots: [...DEFAULT_SLOTS],
    onboarded: false
  };
}

function createUserRecord({ username, password, name }) {
  const { salt, hash } = hashPassword(password);
  return {
    id: newId('u'),
    username,
    salt,
    hash,
    name: name || username,
    role: 'user',
    disabled: false,
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: defaultProfile(name || username),
    favorites: [],
    cooked: [],
    recipeNotes: {},
    plan: null,
    eaten: {},
    skipped: {},
    logs: {},
    groceryChecks: {},
    customRecipes: []
  };
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role === 'admin' ? 'admin' : 'user',
    createdAt: user.createdAt
  };
}

function authPayload(user, date) {
  const profile = user.profile || {};
  ensureCollections(user);
  return {
    token: null,
    user: publicUser(user),
    profile,
    stage: planner.stagePayload(profile.deliveryDate, date),
    favorites: Array.isArray(user.favorites) ? user.favorites : [],
    cooked: user.cooked,
    recipeNotes: user.recipeNotes,
    plan: planner.planOverview(user.plan, user.eaten, user.skipped),
    stats: planner.computeStats(user, date)
  };
}

function validateUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(String(username || ''));
}

function sanitizeRestrictions(value) {
  const allowed = new Set(RESTRICTIONS.map((r) => r.key));
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((k) => allowed.has(k)))];
}

function sanitizeSlots(value) {
  const allowed = SLOTS.map((s) => s.key);
  if (!Array.isArray(value)) return [...DEFAULT_SLOTS];
  const list = SLOTS.map((s) => s.key).filter((k) => value.includes(k));
  return list.length ? list : [...DEFAULT_SLOTS];
}

function applyProfileUpdates(profile, body) {
  const next = { ...profile };

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name || name.length > 20) throw new ApiError(400, '称呼需为 1-20 个字符');
    next.name = name;
  }
  if (body.deliveryDate !== undefined) {
    if (!planner.isValidDate(body.deliveryDate)) throw new ApiError(400, '请选择正确的分娩日期');
    if (body.deliveryDate > planner.todayStr()) throw new ApiError(400, '分娩日期不能晚于今天');
    next.deliveryDate = body.deliveryDate;
  }
  if (body.deliveryType !== undefined) {
    if (!DELIVERY_TYPES.includes(body.deliveryType)) throw new ApiError(400, '分娩方式不正确');
    next.deliveryType = body.deliveryType;
  }
  if (body.feeding !== undefined) {
    if (!FEEDINGS.includes(body.feeding)) throw new ApiError(400, '喂养方式不正确');
    next.feeding = body.feeding;
  }
  if (body.restrictions !== undefined) {
    next.restrictions = sanitizeRestrictions(body.restrictions);
  }
  if (body.taste !== undefined) {
    if (!TASTES.includes(body.taste)) throw new ApiError(400, '口味偏好不正确');
    next.taste = body.taste;
  }
  if (body.calorieGoal !== undefined) {
    const goal = Number(body.calorieGoal);
    if (!Number.isFinite(goal) || goal < 1500 || goal > 3200) throw new ApiError(400, '热量目标需在 1500-3200 kcal 之间');
    next.calorieGoal = Math.round(goal);
  }
  if (body.slots !== undefined) {
    next.slots = sanitizeSlots(body.slots);
  }
  if (body.onboarded !== undefined) {
    next.onboarded = Boolean(body.onboarded);
    if (next.onboarded && !planner.isValidDate(next.deliveryDate)) {
      throw new ApiError(400, '请先填写分娩日期');
    }
  }
  return next;
}

function decorateDay(user, date) {
  const day = planner.resolveDay(user.plan, date);
  if (!day) return null;
  day.eaten = Array.isArray(user.eaten?.[date]) ? user.eaten[date] : [];
  day.skipped = Array.isArray(user.skipped?.[date]) ? user.skipped[date] : [];
  day.stage = planner.stagePayload(user.profile.deliveryDate, date);
  day.targetKcal = user.profile.calorieGoal || 2600;
  return day;
}

function planResponse(user, date) {
  ensureCollections(user);
  const overview = planner.planOverview(user.plan, user.eaten, user.skipped);
  const day = decorateDay(user, date);
  return {
    plan: overview,
    day,
    inRange: Boolean(day),
    stage: planner.stagePayload(user.profile.deliveryDate, date),
    stats: planner.computeStats(user, planner.todayStr())
  };
}

function ensureDemoUser() {
  let demo = findUserByUsername(DEMO_USERNAME);
  if (!demo) {
    demo = createUserRecord({ username: DEMO_USERNAME, password: DEMO_PASSWORD, name: '林小满' });
    demo.profile = {
      name: '林小满',
      deliveryDate: planner.addDays(planner.todayStr(), -12),
      deliveryType: '顺产',
      feeding: '纯母乳',
      restrictions: [],
      taste: '适中',
      calorieGoal: 2800,
      slots: [...DEFAULT_SLOTS],
      onboarded: true
    };
    demo.favorites = ['p01', 'm13', 'k04'];
    demo.plan = planner.generatePlan(demo.profile, planner.todayStr(), 7);
    demo.eaten = {
      [planner.todayStr()]: ['breakfast', 'morningSnack']
    };
    demo.skipped = {
      [planner.addDays(planner.todayStr(), -1)]: ['nightSnack']
    };
    demo.logs = buildDemoLogs();
    demo.customRecipes = [buildDemoRecipe(demo.id)];
    demo.cooked = ['p01', 'm02', 's01', 'k04'];
    demo.recipeNotes = {
      p01: '鲫鱼煎过再冲开水，汤色更白；豆腐最后放，别煮老。',
      m02: '温水按 1.5 倍加，蒸出来真的很嫩。'
    };
    for (const r of demo.customRecipes) RECIPE_MAP.set(r.id, r);
    addUser(demo);
    console.log('[seed] demo account created');
    return;
  }

  ensureCollections(demo);
  if (!demo.cooked.length) demo.cooked = ['p01', 'm02', 's01', 'k04'];
  if (!Object.keys(demo.recipeNotes).length) {
    demo.recipeNotes = {
      p01: '鲫鱼煎过再冲开水，汤色更白；豆腐最后放，别煮老。',
      m02: '温水按 1.5 倍加，蒸出来真的很嫩。'
    };
  }

  // 演示账号的餐单过期时自动顺延，保证体验始终可用。
  if (!demo.plan || !demo.plan.items?.[planner.todayStr()]) {
    demo.plan = planner.generatePlan(demo.profile, planner.todayStr(), 7);
    demo.eaten = {};
    demo.skipped = {};
    demo.profile.deliveryDate = planner.addDays(planner.todayStr(), -12);
    if (!Object.keys(demo.logs || {}).length) demo.logs = buildDemoLogs();
    save();
  }
}

function ensureAdminUser() {
  const username = 'admin';
  let admin = findUserByUsername(username);
  if (!admin) {
    admin = createUserRecord({ username, password: 'admin123456', name: '暖月管理员' });
    admin.role = 'admin';
    admin.profile = {
      ...admin.profile,
      name: '暖月管理员',
      deliveryDate: planner.addDays(planner.todayStr(), -30),
      onboarded: true
    };
    addUser(admin);
    console.log('[seed] admin account created');
    return admin;
  }
  if (admin.role !== 'admin') {
    admin.role = 'admin';
    save();
  }
  return admin;
}

function buildDemoRecipe(ownerId) {
  return decorateRecipe({
    id: newId('c'),
    custom: true,
    customOwnerId: ownerId,
    name: '外婆的红枣桂圆蛋花汤',
    course: 'soup',
    slots: ['lunch', 'dinner'],
    stages: [1, 2, 3, 4],
    tags: ['补血', '暖身', '家常'],
    kcal: 180,
    protein: 8,
    carbs: 22,
    fat: 6,
    time: 15,
    proteinType: 'egg',
    ingredients: [
      ['鸡蛋', 1, '个', '肉禽蛋'],
      ['红枣', 3, '颗', '干货药材'],
      ['桂圆', 3, '颗', '干货药材'],
      ['枸杞', 3, 'g', '干货药材']
    ],
    steps: ['红枣去核，桂圆去壳，加 400ml 清水煮 10 分钟。', '鸡蛋打散，转圈淋入汤中煮成蛋花。', '关火前撒枸杞，温热饮用。'],
    tips: '家里传下来的暖身甜汤，恶露量多时少放桂圆。'
  });
}

function buildDemoLogs() {
  const today = planner.todayStr();
  const samples = [
    { offset: 0, weight: 62.4, temperature: 36.5, systolic: 112, diastolic: 72, waterMl: 1250, sleepHours: 6.5, sleepQuality: '一般', mood: '不错', fatigue: '轻微', lochia: '少量', lochiaColor: '暗红', lochiaOdor: '正常', wound: '良好', breast: '正常', pain: '无', bowel: '正常', activityMinutes: 15, supplements: ['钙片'], note: '今天奶量不错，午后睡了半小时。' },
    { offset: 1, weight: 62.6, temperature: 36.6, systolic: 115, diastolic: 74, waterMl: 2000, sleepHours: 7, sleepQuality: '很好', mood: '很好', fatigue: '无', lochia: '少量', lochiaColor: '暗红', lochiaOdor: '正常', wound: '良好', breast: '正常', pain: '无', bowel: '正常', activityMinutes: 25, supplements: ['钙片', '铁剂'], note: '走了 15 分钟，精神好多了。' },
    { offset: 2, weight: 62.8, temperature: 36.8, systolic: 120, diastolic: 78, waterMl: 1750, sleepHours: 5.5, sleepQuality: '较差', mood: '疲惫', fatigue: '明显', lochia: '中等', lochiaColor: '暗红', lochiaOdor: '正常', wound: '轻微不适', breast: '胀痛', pain: '轻微', bowel: '正常', activityMinutes: 5, supplements: ['钙片'], note: '夜里喂了两次，白天补觉。' },
    { offset: 3, weight: 63.0, temperature: 36.7, systolic: 118, diastolic: 76, waterMl: 1500, sleepHours: 6, sleepQuality: '一般', mood: '一般', fatigue: '轻微', lochia: '中等', lochiaColor: '褐色', lochiaOdor: '正常', wound: '良好', breast: '正常', pain: '无', bowel: '便秘', activityMinutes: 10, supplements: [], note: '蔬菜吃少了，明天加一份秋葵。' },
    { offset: 4, weight: 63.1, temperature: 36.4, systolic: 110, diastolic: 70, waterMl: 2000, sleepHours: 7.5, sleepQuality: '很好', mood: '不错', fatigue: '无', lochia: '少量', lochiaColor: '褐色', lochiaOdor: '正常', wound: '良好', breast: '正常', pain: '无', bowel: '正常', activityMinutes: 20, supplements: ['钙片', '维生素D'], note: '' },
    { offset: 5, weight: 63.3, temperature: 36.6, systolic: 114, diastolic: 73, waterMl: 2250, sleepHours: 8, sleepQuality: '很好', mood: '很好', fatigue: '无', lochia: '少量', lochiaColor: '淡红', lochiaOdor: '正常', wound: '良好', breast: '正常', pain: '无', bowel: '正常', activityMinutes: 30, supplements: ['钙片'], note: '胃口不错，汤都喝完了。' },
    { offset: 6, weight: 63.4, temperature: 36.5, systolic: 116, diastolic: 75, waterMl: 1800, sleepHours: 6, sleepQuality: '一般', mood: '一般', fatigue: '轻微', lochia: '少量', lochiaColor: '淡红', lochiaOdor: '正常', wound: '良好', breast: '正常', pain: '无', bowel: '正常', activityMinutes: 15, supplements: [], note: '' }
  ];
  const logs = {};
  for (const s of samples) {
    const { offset, ...rest } = s;
    logs[planner.addDays(today, -offset)] = rest;
  }
  return logs;
}

// ------------------------- 路由处理 -------------------------

async function handleMeta(req, res) {
  const methodOrder = ['蒸', '煮', '炖煮', '炒', '拌', '煎', '灼', '焖', '煮饮', '冲调', '即食'];
  const methods = [...new Set(RECIPES.map((r) => r.method))].sort(
    (a, b) => (methodOrder.indexOf(a) + 1 || 99) - (methodOrder.indexOf(b) + 1 || 99)
  );
  sendJson(res, 200, {
    stages: STAGES,
    slots: SLOTS,
    courses: Object.entries(COURSES).map(([key, v]) => ({ key, ...v })),
    restrictions: RESTRICTIONS.map((r) => ({ key: r.key, label: r.label })),
    tastes: TASTES,
    deliveryTypes: DELIVERY_TYPES,
    feedings: FEEDINGS,
    caloriePresets: CALORIE_PRESETS,
    effects: EFFECT_GROUPS,
    collections: COLLECTIONS,
    methods,
    logOptions: LOG_OPTIONS,
    ingredientCategories: INGREDIENT_CATEGORIES,
    recipeCount: RECIPES.filter((r) => r.available !== false).length,
    articleCount: content.publicArticles().length,
    demo: { username: DEMO_USERNAME, password: DEMO_PASSWORD }
  });
}

async function handleRegister(req, res) {
  const body = await readJson(req);
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const name = String(body.name || '').trim();

  if (!validateUsername(username)) throw new ApiError(400, '账号需为 3-20 位字母、数字或下划线');
  if (password.length < 6) throw new ApiError(400, '密码至少 6 位');
  if (name.length > 20) throw new ApiError(400, '称呼过长');
  if (findUserByUsername(username)) throw new ApiError(409, '该账号已被注册');

  const user = createUserRecord({ username, password, name: name || '宝妈' });
  addUser(user);

  const date = planner.isValidDate(body.date) ? body.date : planner.todayStr();
  const payload = authPayload(user, date);
  payload.token = signToken(user.id, getDb().secret);
  sendJson(res, 201, payload);
}

async function handleLogin(req, res) {
  const body = await readJson(req);
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const user = findUserByUsername(username);
  if (!user || !verifyPassword(password, user.salt, user.hash)) {
    throw new ApiError(401, '账号或密码不正确', 'INVALID_CREDENTIALS');
  }
  if (user.disabled) throw new ApiError(403, '该账号已被停用，请联系管理员', 'ACCOUNT_DISABLED');
  user.lastLoginAt = new Date().toISOString();
  touchUser(user);
  const date = planner.isValidDate(body.date) ? body.date : planner.todayStr();
  const payload = authPayload(user, date);
  payload.token = signToken(user.id, getDb().secret);
  sendJson(res, 200, payload);
}

async function handleMe(req, res, url) {
  const user = requireUser(req);
  const date = dateParam(url);
  const payload = authPayload(user, date);
  delete payload.token;
  sendJson(res, 200, payload);
}

async function handleProfileGet(req, res, url) {
  const user = requireUser(req);
  const date = dateParam(url);
  sendJson(res, 200, {
    user: publicUser(user),
    profile: user.profile,
    stage: planner.stagePayload(user.profile.deliveryDate, date),
    plan: planner.planOverview(user.plan, user.eaten, user.skipped),
    stats: planner.computeStats(user, date),
    favorites: user.favorites || [],
    cooked: user.cooked || [],
    recipeNotes: user.recipeNotes || {}
  });
}

async function handleProfileUpdate(req, res) {
  const user = requireUser(req);
  const body = await readJson(req);
  const before = user.profile;
  const next = applyProfileUpdates(before, body);

  const needsRegenerate =
    Boolean(user.plan) &&
    (next.deliveryDate !== before.deliveryDate ||
      next.feeding !== before.feeding ||
      JSON.stringify(next.restrictions) !== JSON.stringify(before.restrictions) ||
      JSON.stringify(next.slots) !== JSON.stringify(before.slots));

  user.profile = next;
  if (next.name) user.name = next.name;
  touchUser(user);

  const date = planner.todayStr();
  sendJson(res, 200, {
    profile: user.profile,
    stage: planner.stagePayload(user.profile.deliveryDate, date),
    needsRegenerate,
    plan: planner.planOverview(user.plan, user.eaten)
  });
}

async function handleRecipes(req, res, url) {
  const course = url.searchParams.get('course');
  const stage = Number(url.searchParams.get('stage'));
  const slot = url.searchParams.get('slot');
  const method = url.searchParams.get('method');
  const maxTime = Number(url.searchParams.get('maxTime'));
  const minKcal = Number(url.searchParams.get('minKcal'));
  const maxKcal = Number(url.searchParams.get('maxKcal'));
  const vegetarian = url.searchParams.get('vegetarian');
  const q = String(url.searchParams.get('q') || '').trim().toLowerCase();
  const ids = url.searchParams.get('ids');
  const user = optionalUser(req);

  const ownCustom = user ? (user.customRecipes || []).filter((r) => r && !r.deleted) : [];
  let list = ownCustom.length ? [...RECIPES, ...ownCustom] : RECIPES.slice();
  list = list.filter((r) => r.available !== false);
  if (ids) {
    const wanted = new Set(ids.split(',').map((s) => s.trim()));
    list = list.filter((r) => wanted.has(r.id));
  }
  if (course) list = list.filter((r) => r.course === course);
  if (stage) list = list.filter((r) => r.stages.includes(stage));
  if (slot) list = list.filter((r) => r.slots.includes(slot));
  if (method) list = list.filter((r) => r.method === method);
  if (Number.isFinite(maxTime) && maxTime > 0) list = list.filter((r) => r.time <= maxTime);
  if (Number.isFinite(minKcal) && minKcal > 0) list = list.filter((r) => r.kcal >= minKcal);
  if (Number.isFinite(maxKcal) && maxKcal > 0) list = list.filter((r) => r.kcal <= maxKcal);
  if (vegetarian === '1') list = list.filter((r) => r.vegetarian);
  if (q) list = list.filter((r) => r.searchText.toLowerCase().includes(q));

  sendJson(res, 200, {
    total: list.length,
    customCount: ownCustom.length,
    recipes: list.map(planner.publicRecipe)
  });
}

async function handleRecipeDetail(req, res, id) {
  const user = optionalUser(req);
  const recipe = RECIPE_MAP.get(id);
  if (!recipe || recipe.available === false) throw new ApiError(404, '没有找到这道菜', 'NOT_FOUND');
  if (recipe.custom && (!user || recipe.customOwnerId !== user.id)) {
    throw new ApiError(404, '没有找到这道菜', 'NOT_FOUND');
  }
  const pool = user && recipe.custom ? [...RECIPES, ...(user.customRecipes || [])] : RECIPES;
  const similar = pool
    .filter((r) => r.id !== id && r.available !== false && r.course === recipe.course)
    .slice(0, 3)
    .map((r) => ({ id: r.id, name: r.name, image: r.image, kcal: r.kcal, time: r.time }));
  sendJson(res, 200, {
    recipe: planner.publicRecipe(recipe),
    similar,
    cooked: Boolean(user && (user.cooked || []).includes(id)),
    note: (user && user.recipeNotes?.[id]) || ''
  });
}

async function handleRecipeCook(req, res, id) {
  const user = requireUser(req);
  const recipe = RECIPE_MAP.get(id);
  if (!recipe) throw new ApiError(404, '没有找到这道菜', 'NOT_FOUND');
  if (recipe.custom && recipe.customOwnerId !== user.id) {
    throw new ApiError(404, '没有找到这道菜', 'NOT_FOUND');
  }
  const idx = user.cooked.indexOf(id);
  let isCooked;
  if (idx >= 0) {
    user.cooked.splice(idx, 1);
    isCooked = false;
  } else {
    user.cooked.unshift(id);
    isCooked = true;
  }
  touchUser(user);
  sendJson(res, 200, {
    isCooked,
    cooked: user.cooked,
    stats: planner.computeStats(user, planner.todayStr())
  });
}

async function handleRecipeNote(req, res, id) {
  const user = requireUser(req);
  const recipe = RECIPE_MAP.get(id);
  if (!recipe) throw new ApiError(404, '没有找到这道菜', 'NOT_FOUND');
  if (recipe.custom && recipe.customOwnerId !== user.id) {
    throw new ApiError(404, '没有找到这道菜', 'NOT_FOUND');
  }
  const body = await readJson(req);
  const note = String(body.note || '').trim();
  if (note.length > 300) throw new ApiError(400, '笔记最多 300 字');
  if (note) user.recipeNotes[id] = note;
  else delete user.recipeNotes[id];
  touchUser(user);
  sendJson(res, 200, { id, note });
}

async function handleFavorite(req, res, id) {
  const user = requireUser(req);
  const recipe = RECIPE_MAP.get(id);
  if (!recipe) throw new ApiError(404, '没有找到这道菜', 'NOT_FOUND');
  if (recipe.custom && recipe.customOwnerId !== user.id) {
    throw new ApiError(404, '没有找到这道菜', 'NOT_FOUND');
  }
  const idx = user.favorites.indexOf(id);
  let favorited;
  if (idx >= 0) {
    user.favorites.splice(idx, 1);
    favorited = false;
  } else {
    user.favorites.unshift(id);
    favorited = true;
  }
  touchUser(user);
  sendJson(res, 200, { favorited, favorites: user.favorites });
}

function normalizeTags(value) {
  const raw = Array.isArray(value) ? value : String(value || '').split(/[,，、\s]+/);
  const tags = [...new Set(raw.map((t) => String(t).trim()).filter(Boolean))];
  if (tags.length > 6) throw new ApiError(400, '标签最多 6 个');
  if (tags.some((t) => t.length > 12)) throw new ApiError(400, '单个标签最多 12 个字符');
  return tags;
}

function normalizeIngredients(value) {
  if (!Array.isArray(value) || !value.length) throw new ApiError(400, '请至少填写一种食材');
  if (value.length > 20) throw new ApiError(400, '食材最多 20 种');
  return value.map((item) => {
    const raw = Array.isArray(item)
      ? { name: item[0], amount: item[1], unit: item[2], category: item[3] }
      : item || {};
    const name = String(raw.name || '').trim();
    const amount = Number(raw.amount);
    const unit = String(raw.unit || 'g').trim();
    let category = String(raw.category || '').trim();
    if (!name || name.length > 20) throw new ApiError(400, '食材名称需为 1-20 个字符');
    if (!Number.isFinite(amount) || amount <= 0 || amount > 5000) throw new ApiError(400, `「${name}」的用量不正确`);
    if (!['g', 'ml', '个', '颗', '张', '瓣', '片'].includes(unit)) {
      throw new ApiError(400, `「${name}」的单位需为 g/ml/个/颗/张/瓣/片`);
    }
    if (!INGREDIENT_CATEGORIES.includes(category)) category = inferCategory(name);
    return [name, amount, unit, category];
  });
}

function normalizeSteps(value) {
  const raw = Array.isArray(value) ? value : String(value || '').split('\n');
  const steps = raw.map((s) => String(s).trim()).filter(Boolean);
  if (!steps.length) throw new ApiError(400, '请至少填写一个做法步骤');
  if (steps.length > 15) throw new ApiError(400, '做法步骤最多 15 条');
  if (steps.some((s) => s.length > 200)) throw new ApiError(400, '单条步骤最多 200 字');
  return steps;
}

function buildCustomRecipe(user, body, existing) {
  const name = String(body.name || existing?.name || '').trim();
  if (!name || name.length > 30) throw new ApiError(400, '食谱名称需为 1-30 个字符');

  const course = String(body.course || existing?.course || '');
  if (!COURSES[course]) throw new ApiError(400, '请选择正确的品类');

  const compatibleSlots = SLOTS.filter((s) => s.courses.includes(course)).map((s) => s.key);
  const requested = Array.isArray(body.slots) ? body.slots.filter((k) => compatibleSlots.includes(k)) : [];
  const slots = requested.length ? requested : compatibleSlots;

  const kcal = Math.round(Number(body.kcal ?? existing?.kcal ?? 0) || 0);
  const protein = Math.round((Number(body.protein ?? existing?.protein ?? 0) || 0) * 10) / 10;
  const carbs = Math.round((Number(body.carbs ?? existing?.carbs ?? 0) || 0) * 10) / 10;
  const fat = Math.round((Number(body.fat ?? existing?.fat ?? 0) || 0) * 10) / 10;
  if (kcal < 0 || kcal > 1500) throw new ApiError(400, '热量需在 0-1500 kcal 之间');
  if ([protein, carbs, fat].some((v) => v < 0 || v > 300)) throw new ApiError(400, '营养素数值需在 0-300 之间');

  const time = Math.round(Number(body.time ?? existing?.time ?? 20) || 20);
  if (time < 1 || time > 360) throw new ApiError(400, '用时需在 1-360 分钟之间');

  const tags = body.tags !== undefined ? normalizeTags(body.tags) : existing?.tags || [];
  const ingredients = body.ingredients !== undefined ? normalizeIngredients(body.ingredients) : existing?.ingredients;
  if (!ingredients || !ingredients.length) throw new ApiError(400, '请至少填写一种食材');
  const steps = body.steps !== undefined ? normalizeSteps(body.steps) : existing?.steps;
  if (!steps || !steps.length) throw new ApiError(400, '请至少填写一个做法步骤');
  const tips = String(body.tips ?? existing?.tips ?? '').trim();
  if (tips.length > 200) throw new ApiError(400, '小贴士最多 200 字');

  const recipe = decorateRecipe({
    id: existing?.id || newId('c'),
    custom: true,
    customOwnerId: user.id,
    name,
    course,
    slots,
    stages: [1, 2, 3, 4],
    tags,
    kcal,
    protein,
    carbs,
    fat,
    time,
    ingredients,
    steps,
    tips,
    proteinType: 'none',
    createdAt: existing?.createdAt || new Date().toISOString()
  });
  return recipe;
}

function recipeUsedInPlan(user, recipeId) {
  const items = user.plan?.items || {};
  for (const day of Object.values(items)) {
    for (const meal of Object.values(day)) {
      if (Object.values(meal).includes(recipeId)) return true;
    }
  }
  return false;
}

async function handleCustomRecipeCreate(req, res) {
  const user = requireUser(req);
  const body = await readJson(req);
  const recipe = buildCustomRecipe(user, body);
  user.customRecipes.unshift(recipe);
  RECIPE_MAP.set(recipe.id, recipe);
  touchUser(user);
  sendJson(res, 201, { recipe: planner.publicRecipe(recipe), customCount: user.customRecipes.length });
}

async function handleCustomRecipeUpdate(req, res, id) {
  const user = requireUser(req);
  const existing = user.customRecipes.find((r) => r.id === id);
  if (!existing) throw new ApiError(404, '没有找到这道自制食谱', 'NOT_FOUND');
  const body = await readJson(req);
  const recipe = buildCustomRecipe(user, body, existing);
  const idx = user.customRecipes.findIndex((r) => r.id === id);
  user.customRecipes[idx] = recipe;
  RECIPE_MAP.set(recipe.id, recipe);
  touchUser(user);
  sendJson(res, 200, { recipe: planner.publicRecipe(recipe), customCount: user.customRecipes.length });
}

async function handleCustomRecipeDelete(req, res, id) {
  const user = requireUser(req);
  const idx = user.customRecipes.findIndex((r) => r.id === id);
  if (idx < 0) throw new ApiError(404, '没有找到这道自制食谱', 'NOT_FOUND');
  if (recipeUsedInPlan(user, id)) {
    throw new ApiError(400, '这道菜还在当前餐单中，请先换掉再删除');
  }
  user.customRecipes.splice(idx, 1);
  user.favorites = user.favorites.filter((fid) => fid !== id);
  user.cooked = (user.cooked || []).filter((cid) => cid !== id);
  if (user.recipeNotes) delete user.recipeNotes[id];
  RECIPE_MAP.delete(id);
  touchUser(user);
  sendJson(res, 200, { ok: true, customCount: user.customRecipes.length });
}

async function handlePlanGet(req, res, url) {
  const user = requireUser(req);
  const date = dateParam(url);

  if (!user.plan) {
    user.plan = planner.generatePlan(user.profile, planner.todayStr(), 7);
    user.eaten = {};
    user.skipped = {};
    user.groceryChecks = {};
    save();
  }

  sendJson(res, 200, planResponse(user, date));
}

async function handlePlanGenerate(req, res) {
  const user = requireUser(req);
  const body = await readJson(req);
  const startDate = planner.isValidDate(body.startDate) ? body.startDate : planner.todayStr();
  const days = Number(body.days) || 7;
  if (days < 1 || days > 28) throw new ApiError(400, '餐单天数需在 1-28 天之间');

  user.plan = planner.generatePlan(user.profile, startDate, days);
  user.eaten = {};
  user.skipped = {};
  user.groceryChecks = {};
  touchUser(user);

  const date = startDate;
  sendJson(res, 200, planResponse(user, date));
}

async function handlePlanSwap(req, res) {
  const user = requireUser(req);
  const body = await readJson(req);
  const date = String(body.date || '');
  const slot = String(body.slot || '');
  const course = String(body.course || '');
  if (!planner.isValidDate(date)) throw new ApiError(400, '日期不正确');

  const result = planner.swapDish(user.plan, user.profile, date, slot, course, user.eaten, user.skipped);
  if (result.error) throw new ApiError(400, result.error);

  touchUser(user);
  sendJson(res, 200, {
    day: decorateDay(user, date),
    plan: planner.planOverview(user.plan, user.eaten, user.skipped),
    stats: planner.computeStats(user, planner.todayStr())
  });
}

async function handlePlanEat(req, res) {
  const user = requireUser(req);
  const body = await readJson(req);
  const date = String(body.date || '');
  const slot = String(body.slot || '');
  if (!planner.isValidDate(date)) throw new ApiError(400, '日期不正确');
  if (!user.plan?.items?.[date]?.[slot]) throw new ApiError(400, '这一餐还没有安排');

  const set = new Set(Array.isArray(user.eaten[date]) ? user.eaten[date] : []);
  if (body.eaten === false) set.delete(slot);
  else set.add(slot);
  user.eaten[date] = [...set];
  if (user.skipped?.[date]) user.skipped[date] = user.skipped[date].filter((s) => s !== slot);
  touchUser(user);

  sendJson(res, 200, {
    day: decorateDay(user, date),
    plan: planner.planOverview(user.plan, user.eaten, user.skipped),
    stats: planner.computeStats(user, planner.todayStr())
  });
}

async function handlePlanSkip(req, res) {
  const user = requireUser(req);
  const body = await readJson(req);
  const date = String(body.date || '');
  const slot = String(body.slot || '');
  if (!planner.isValidDate(date)) throw new ApiError(400, '日期不正确');
  if (!user.plan?.items?.[date]?.[slot]) throw new ApiError(400, '这一餐还没有安排');

  const set = new Set(Array.isArray(user.skipped[date]) ? user.skipped[date] : []);
  if (body.skipped === false) set.delete(slot);
  else set.add(slot);
  user.skipped[date] = [...set];
  if (body.skipped !== false) {
    user.eaten[date] = (Array.isArray(user.eaten[date]) ? user.eaten[date] : []).filter((s) => s !== slot);
  }
  touchUser(user);

  sendJson(res, 200, {
    day: decorateDay(user, date),
    plan: planner.planOverview(user.plan, user.eaten, user.skipped),
    stats: planner.computeStats(user, planner.todayStr())
  });
}

async function handlePlanApply(req, res) {
  const user = requireUser(req);
  const body = await readJson(req);
  const date = String(body.date || '');
  const slot = String(body.slot || '');
  const course = String(body.course || '');
  const recipeId = String(body.recipeId || '');
  if (!planner.isValidDate(date)) throw new ApiError(400, '日期不正确');
  const target = RECIPE_MAP.get(recipeId);
  if (target?.custom && target.customOwnerId !== user.id) {
    throw new ApiError(404, '没有找到这道菜', 'NOT_FOUND');
  }

  const result = planner.applyRecipe(
    user.plan,
    user.profile,
    date,
    slot,
    course,
    recipeId,
    user.eaten,
    user.skipped
  );
  if (result.error) throw new ApiError(400, result.error);
  user.groceryChecks = {};
  touchUser(user);

  sendJson(res, 200, {
    day: decorateDay(user, date),
    plan: planner.planOverview(user.plan, user.eaten, user.skipped),
    stats: planner.computeStats(user, planner.todayStr())
  });
}

async function handleGrocery(req, res, url) {
  const user = requireUser(req);
  const view = String(url.searchParams.get('view') || 'week');
  let start = url.searchParams.get('start');
  let days = Number(url.searchParams.get('days'));

  if (!planner.isValidDate(start)) {
    start = user.plan?.startDate || planner.todayStr();
  }
  if (!days || days < 1 || days > 28) {
    days = view === 'day' ? 1 : user.plan?.days || 7;
  }

  const grocery = planner.aggregateGrocery(user.plan, start, days, user.groceryChecks || {});
  sendJson(res, 200, { ...grocery, hasPlan: Boolean(user.plan) });
}

async function handleGroceryToggle(req, res) {
  const user = requireUser(req);
  const body = await readJson(req);
  const key = String(body.key || '');
  if (!key || key.length > 160) throw new ApiError(400, '清单项目不正确');
  if (!user.groceryChecks) user.groceryChecks = {};
  if (user.groceryChecks[key]) delete user.groceryChecks[key];
  else user.groceryChecks[key] = true;
  touchUser(user);
  sendJson(res, 200, { key, checked: Boolean(user.groceryChecks[key]) });
}

async function handleGroceryClear(req, res) {
  const user = requireUser(req);
  user.groceryChecks = {};
  touchUser(user);
  sendJson(res, 200, { ok: true });
}

async function handleStats(req, res, url) {
  const user = requireUser(req);
  const date = dateParam(url);
  sendJson(res, 200, {
    stats: planner.computeStats(user, date),
    plan: planner.planOverview(user.plan, user.eaten, user.skipped)
  });
}

async function handleFavorites(req, res) {
  const user = requireUser(req);
  const ids = Array.isArray(user.favorites) ? user.favorites : [];
  const recipes = ids.map((id) => RECIPE_MAP.get(id)).filter(Boolean).map(planner.publicRecipe);
  sendJson(res, 200, { total: recipes.length, recipes });
}

// ------------------------- 每日记录 -------------------------

function sanitizeLog(body) {
  const out = {};
  if (body.weight !== undefined) {
    if (body.weight === '' || body.weight === null) {
      out.weight = null;
    } else {
      const w = Number(body.weight);
      if (!Number.isFinite(w) || w < 25 || w > 200) throw new ApiError(400, '体重需在 25-200 kg 之间');
      out.weight = Math.round(w * 10) / 10;
    }
  }
  if (body.temperature !== undefined) {
    if (body.temperature === '' || body.temperature === null) {
      out.temperature = null;
    } else {
      const t = Number(body.temperature);
      if (!Number.isFinite(t) || t < 34 || t > 43) throw new ApiError(400, '体温需在 34-43 ℃ 之间');
      out.temperature = Math.round(t * 10) / 10;
    }
  }
  if (body.systolic !== undefined) {
    if (body.systolic === '' || body.systolic === null) {
      out.systolic = null;
    } else {
      const v = Number(body.systolic);
      if (!Number.isFinite(v) || v < 50 || v > 250) throw new ApiError(400, '收缩压需在 50-250 mmHg 之间');
      out.systolic = Math.round(v);
    }
  }
  if (body.diastolic !== undefined) {
    if (body.diastolic === '' || body.diastolic === null) {
      out.diastolic = null;
    } else {
      const v = Number(body.diastolic);
      if (!Number.isFinite(v) || v < 30 || v > 160) throw new ApiError(400, '舒张压需在 30-160 mmHg 之间');
      out.diastolic = Math.round(v);
    }
  }
  if (body.waterMl !== undefined) {
    const v = Number(body.waterMl);
    if (!Number.isFinite(v) || v < 0 || v > 8000) throw new ApiError(400, '饮水量不正确');
    out.waterMl = Math.round(v);
  }
  if (body.sleepHours !== undefined) {
    if (body.sleepHours === '' || body.sleepHours === null) {
      out.sleepHours = null;
    } else {
      const v = Number(body.sleepHours);
      if (!Number.isFinite(v) || v < 0 || v > 24) throw new ApiError(400, '睡眠时长需在 0-24 小时之间');
      out.sleepHours = Math.round(v * 10) / 10;
    }
  }
  if (body.activityMinutes !== undefined) {
    if (body.activityMinutes === '' || body.activityMinutes === null) {
      out.activityMinutes = null;
    } else {
      const v = Number(body.activityMinutes);
      if (!Number.isFinite(v) || v < 0 || v > 600) throw new ApiError(400, '活动时长需在 0-600 分钟之间');
      out.activityMinutes = Math.round(v);
    }
  }
  const optionFields = {
    mood: LOG_OPTIONS.moods,
    sleepQuality: LOG_OPTIONS.sleepQuality,
    lochia: LOG_OPTIONS.lochia,
    lochiaColor: LOG_OPTIONS.lochiaColor,
    lochiaOdor: LOG_OPTIONS.lochiaOdor,
    wound: LOG_OPTIONS.wound,
    breast: LOG_OPTIONS.breast,
    pain: LOG_OPTIONS.pain,
    fatigue: LOG_OPTIONS.fatigue,
    bowel: LOG_OPTIONS.bowel
  };
  for (const [field, options] of Object.entries(optionFields)) {
    if (body[field] !== undefined) {
      if (body[field] && !options.includes(body[field])) throw new ApiError(400, `${field} 选项不正确`);
      out[field] = body[field] || '';
    }
  }
  if (body.supplements !== undefined) {
    const raw = Array.isArray(body.supplements) ? body.supplements : [];
    out.supplements = [...new Set(raw.filter((s) => LOG_OPTIONS.supplements.includes(s)))];
  }
  if (body.note !== undefined) {
    const note = String(body.note || '').trim();
    if (note.length > 300) throw new ApiError(400, '备注最多 300 字');
    out.note = note;
  }
  return out;
}

async function handleLogsGet(req, res, url) {
  const user = requireUser(req);
  let days = Number(url.searchParams.get('days'));
  if (!days || days < 1 || days > 120) days = 42;
  let start = url.searchParams.get('start');
  if (!planner.isValidDate(start)) start = planner.addDays(planner.todayStr(), -(days - 1));

  const logs = [];
  for (let i = 0; i < days; i += 1) {
    const date = planner.addDays(start, i);
    const log = user.logs[date];
    if (log) logs.push({ date, ...log });
  }
  sendJson(res, 200, { startDate: start, days, logs });
}

async function handleLogPut(req, res, date) {
  const user = requireUser(req);
  if (!planner.isValidDate(date)) throw new ApiError(400, '日期不正确');
  const body = await readJson(req);
  const patch = sanitizeLog(body);
  const current = { ...(user.logs[date] || {}), ...patch };
  for (const key of Object.keys(current)) {
    if (current[key] === null || current[key] === '' || current[key] === undefined) delete current[key];
  }
  if (Object.keys(current).length) user.logs[date] = current;
  else delete user.logs[date];
  touchUser(user);
  sendJson(res, 200, {
    date,
    log: user.logs[date] || null,
    stats: planner.computeStats(user, planner.todayStr())
  });
}

// ------------------------- 账号与扩展 -------------------------

async function handlePassword(req, res) {
  const user = requireUser(req);
  const body = await readJson(req);
  const oldPassword = String(body.oldPassword || '');
  const newPassword = String(body.newPassword || '');
  if (!verifyPassword(oldPassword, user.salt, user.hash)) throw new ApiError(400, '原密码不正确');
  if (newPassword.length < 6) throw new ApiError(400, '新密码至少 6 位');
  if (newPassword === oldPassword) throw new ApiError(400, '新密码不能与原密码相同');
  const { salt, hash } = hashPassword(newPassword);
  user.salt = salt;
  user.hash = hash;
  touchUser(user);
  sendJson(res, 200, { ok: true });
}

async function handleExport(req, res) {
  const user = requireUser(req);
  sendJson(res, 200, {
    app: 'nuanyue',
    version: 1,
    exportedAt: new Date().toISOString(),
    account: { username: user.username, name: user.name },
    profile: user.profile,
    plan: user.plan,
    eaten: user.eaten,
    skipped: user.skipped,
    logs: user.logs,
    favorites: user.favorites,
    cooked: user.cooked,
    recipeNotes: user.recipeNotes,
    groceryChecks: user.groceryChecks,
    customRecipes: user.customRecipes || []
  });
}

async function handleArticles(req, res) {
  const list = content.publicArticles();
  sendJson(res, 200, {
    total: list.length,
    articles: list.map((a) => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      minutes: a.minutes,
      tag: a.tag
    }))
  });
}

async function handleArticleDetail(req, res, id) {
  const article = ARTICLE_MAP.get(id);
  if (!article || article.available === false) throw new ApiError(404, '没有找到这篇文章', 'NOT_FOUND');
  sendJson(res, 200, { article });
}

// ------------------------- 管理后台 -------------------------

function adminRecipeView(recipe) {
  return {
    ...planner.publicRecipe(recipe),
    price: Number(recipe.price) || 0,
    available: recipe.available !== false,
    admin: Boolean(recipe.admin)
  };
}

function adminArticleView(article) {
  return {
    id: article.id,
    title: article.title,
    summary: article.summary,
    minutes: article.minutes,
    tag: article.tag,
    sections: article.sections || [],
    available: article.available !== false,
    admin: Boolean(article.admin)
  };
}

function adminUserView(user) {
  const stats = planner.computeStats(user, planner.todayStr());
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role === 'admin' ? 'admin' : 'user',
    disabled: Boolean(user.disabled),
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt || null,
    profile: user.profile || {},
    stats,
    recordDays: Object.keys(user.logs || {}).length,
    favorites: (user.favorites || []).length,
    cooked: (user.cooked || []).length,
    customRecipes: (user.customRecipes || []).length,
    planStart: user.plan?.startDate || null,
    planDays: user.plan?.days || 0
  };
}

function buildAdminOverview() {
  const users = getDb().users;
  const now = Date.now();
  const weekAgo = now - 7 * 86400000;
  const recipes = content.listRecipes();
  const articles = content.listArticles();
  const byCourse = {};
  for (const r of recipes) {
    if (!byCourse[r.course]) byCourse[r.course] = { total: 0, available: 0 };
    byCourse[r.course].total += 1;
    if (r.available !== false) byCourse[r.course].available += 1;
  }
  const logCount = users.reduce((sum, u) => sum + Object.keys(u.logs || {}).length, 0);
  const planUsers = users.filter((u) => u.plan);
  const totalPlanDays = planUsers.reduce((sum, u) => sum + (u.plan?.days || 0), 0);

  return {
    users: {
      total: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      disabled: users.filter((u) => u.disabled).length,
      new7d: users.filter((u) => u.createdAt && new Date(u.createdAt).getTime() >= weekAgo).length,
      active7d: users.filter((u) => u.lastLoginAt && new Date(u.lastLoginAt).getTime() >= weekAgo).length
    },
    plans: {
      users: planUsers.length,
      days: totalPlanDays,
      records: logCount
    },
    recipes: {
      total: recipes.length,
      available: recipes.filter((r) => r.available !== false).length,
      hidden: recipes.filter((r) => r.available === false).length,
      byCourse
    },
    articles: {
      total: articles.length,
      available: articles.filter((a) => a.available !== false).length
    },
    recentUsers: users
      .slice()
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
      .slice(0, 6)
      .map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        role: u.role === 'admin' ? 'admin' : 'user',
        createdAt: u.createdAt,
        disabled: Boolean(u.disabled)
      }))
  };
}

async function handleAdminOverview(req, res) {
  requireAdmin(req);
  sendJson(res, 200, buildAdminOverview());
}

async function handleAdminRecipes(req, res, url) {
  requireAdmin(req);
  const q = String(url.searchParams.get('q') || '').trim().toLowerCase();
  const course = String(url.searchParams.get('course') || '');
  const status = String(url.searchParams.get('status') || '');
  let list = content.listRecipes();
  if (course) list = list.filter((r) => r.course === course);
  if (status === 'available') list = list.filter((r) => r.available !== false);
  if (status === 'hidden') list = list.filter((r) => r.available === false);
  if (q) {
    list = list.filter((r) =>
      [r.name, r.id, ...(r.tags || []), ...(r.ingredients || []).map((i) => i[0])]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }
  sendJson(res, 200, {
    total: list.length,
    images: content.IMAGE_OPTIONS,
    recipes: list.map(adminRecipeView)
  });
}

function buildAdminRecipe(body, existing) {
  const name = String(body.name ?? existing?.name ?? '').trim();
  if (!name || name.length > 30) throw new ApiError(400, '菜品名称需为 1-30 个字符');

  const course = String(body.course ?? existing?.course ?? '');
  if (!COURSES[course]) throw new ApiError(400, '请选择正确的菜品品类');

  const compatible = SLOTS.filter((s) => s.courses.includes(course)).map((s) => s.key);
  const requestedSlots = Array.isArray(body.slots) ? body.slots.filter((k) => compatible.includes(k)) : existing?.slots;
  const slots = requestedSlots && requestedSlots.length ? requestedSlots : compatible;

  const requestedStages = Array.isArray(body.stages) ? body.stages.map(Number) : existing?.stages;
  const stages = [...new Set((requestedStages || [1, 2, 3, 4]).filter((n) => [1, 2, 3, 4].includes(n)))].sort();
  if (!stages.length) throw new ApiError(400, '请至少选择一个适用阶段');

  const kcal = Math.round(Number(body.kcal ?? existing?.kcal ?? 0) || 0);
  const protein = Math.round((Number(body.protein ?? existing?.protein ?? 0) || 0) * 10) / 10;
  const carbs = Math.round((Number(body.carbs ?? existing?.carbs ?? 0) || 0) * 10) / 10;
  const fat = Math.round((Number(body.fat ?? existing?.fat ?? 0) || 0) * 10) / 10;
  if (kcal < 0 || kcal > 1500) throw new ApiError(400, '热量需在 0-1500 kcal 之间');
  if ([protein, carbs, fat].some((v) => v < 0 || v > 300)) throw new ApiError(400, '营养素数值需在 0-300 之间');

  const time = Math.round(Number(body.time ?? existing?.time ?? 20) || 20);
  if (time < 1 || time > 360) throw new ApiError(400, '用时需在 1-360 分钟之间');

  const price = Math.round((Number(body.price ?? existing?.price ?? 0) || 0) * 100) / 100;
  if (price < 0 || price > 999) throw new ApiError(400, '价格需在 0-999 元之间');

  const image = String(body.image ?? existing?.image ?? 'auto');
  const imageAllowed =
    image === 'auto' ||
    image === existing?.image ||
    content.IMAGE_OPTIONS.includes(image) ||
    /^\/images\/dishes\/[\w-]+\.jpg(\?v=\d+)?$/.test(image) ||
    /^\/uploads\/[a-f0-9]{24}\.(jpg|png|webp)$/.test(image);
  if (!imageAllowed) throw new ApiError(400, '图片选项不正确');

  const tags = body.tags !== undefined ? normalizeTags(body.tags) : existing?.tags || [];
  const ingredients =
    body.ingredients !== undefined ? normalizeIngredients(body.ingredients) : existing?.ingredients;
  if (!ingredients || !ingredients.length) throw new ApiError(400, '请至少填写一种食材');
  const steps = body.steps !== undefined ? normalizeSteps(body.steps) : existing?.steps;
  if (!steps || !steps.length) throw new ApiError(400, '请至少填写一个做法步骤');
  const tips = String(body.tips ?? existing?.tips ?? '').trim();
  if (tips.length > 200) throw new ApiError(400, '小贴士最多 200 字');

  return {
    name,
    course,
    slots,
    stages,
    tags,
    kcal,
    protein,
    carbs,
    fat,
    time,
    price,
    image,
    ingredients,
    steps,
    tips,
    available: body.available !== undefined ? Boolean(body.available) : existing?.available !== false
  };
}

async function handleAdminRecipeCreate(req, res) {
  requireAdmin(req);
  const body = await readJson(req);
  const data = buildAdminRecipe(body);
  const recipe = content.createRecipe({ ...data, proteinType: 'none' });
  sendJson(res, 201, { recipe: adminRecipeView(recipe) });
}

async function handleAdminRecipeUpdate(req, res, id) {
  requireAdmin(req);
  const existing = RECIPE_MAP.get(id);
  if (!existing) throw new ApiError(404, '菜品不存在', 'NOT_FOUND');
  const body = await readJson(req);
  const data = buildAdminRecipe(body, existing);
  const recipe = content.updateRecipe(id, data);
  sendJson(res, 200, { recipe: adminRecipeView(recipe) });
}

async function handleAdminRecipeStatus(req, res, id) {
  requireAdmin(req);
  const body = await readJson(req);
  const recipe = content.setRecipeAvailable(id, Boolean(body.available));
  if (!recipe) throw new ApiError(404, '菜品不存在', 'NOT_FOUND');
  sendJson(res, 200, { recipe: adminRecipeView(recipe) });
}

async function handleAdminRecipeDelete(req, res, id) {
  requireAdmin(req);
  const result = content.removeRecipe(id);
  if (result.error) throw new ApiError(400, result.error);
  for (const user of getDb().users) {
    if (Array.isArray(user.favorites)) user.favorites = user.favorites.filter((fid) => fid !== id);
    if (Array.isArray(user.cooked)) user.cooked = user.cooked.filter((cid) => cid !== id);
    if (user.recipeNotes) delete user.recipeNotes[id];
  }
  save();
  sendJson(res, 200, { ok: true });
}

function buildAdminArticle(body, existing) {
  const title = String(body.title ?? existing?.title ?? '').trim();
  if (!title || title.length > 60) throw new ApiError(400, '标题需为 1-60 个字符');
  const summary = String(body.summary ?? existing?.summary ?? '').trim();
  if (summary.length > 160) throw new ApiError(400, '摘要最多 160 字');
  const tag = String(body.tag ?? existing?.tag ?? '饮食调养').trim();
  if (tag.length > 20) throw new ApiError(400, '标签最多 20 个字符');
  const minutes = Math.round(Number(body.minutes ?? existing?.minutes ?? 3) || 3);
  if (minutes < 1 || minutes > 60) throw new ApiError(400, '阅读时长需在 1-60 分钟之间');

  const rawSections = body.sections !== undefined ? body.sections : existing?.sections;
  if (!Array.isArray(rawSections) || !rawSections.length) throw new ApiError(400, '请至少填写一个内容段落');
  if (rawSections.length > 12) throw new ApiError(400, '内容段落最多 12 个');
  const sections = rawSections.map((s) => {
    const h = String(s?.h || '').trim();
    const paragraphs = (Array.isArray(s?.p) ? s.p : []).map((p) => String(p).trim()).filter(Boolean);
    if (!h || h.length > 60) throw new ApiError(400, '段落标题需为 1-60 个字符');
    if (!paragraphs.length) throw new ApiError(400, `「${h}」至少需要一段正文`);
    if (paragraphs.some((p) => p.length > 600)) throw new ApiError(400, '单段正文最多 600 字');
    return { h, p: paragraphs };
  });

  return {
    title,
    summary,
    tag,
    minutes,
    sections,
    available: body.available !== undefined ? Boolean(body.available) : existing?.available !== false
  };
}

async function handleAdminArticles(req, res) {
  requireAdmin(req);
  const list = content.listArticles();
  sendJson(res, 200, { total: list.length, articles: list.map(adminArticleView) });
}

async function handleAdminArticleCreate(req, res) {
  requireAdmin(req);
  const body = await readJson(req);
  const article = content.createArticle(buildAdminArticle(body));
  sendJson(res, 201, { article: adminArticleView(article) });
}

async function handleAdminArticleUpdate(req, res, id) {
  requireAdmin(req);
  if (!ARTICLE_MAP.get(id)) throw new ApiError(404, '文章不存在', 'NOT_FOUND');
  const body = await readJson(req);
  const article = content.updateArticle(id, buildAdminArticle(body, ARTICLE_MAP.get(id)));
  sendJson(res, 200, { article: adminArticleView(article) });
}

async function handleAdminArticleStatus(req, res, id) {
  requireAdmin(req);
  const body = await readJson(req);
  const article = content.setArticleAvailable(id, Boolean(body.available));
  if (!article) throw new ApiError(404, '文章不存在', 'NOT_FOUND');
  sendJson(res, 200, { article: adminArticleView(article) });
}

async function handleAdminArticleDelete(req, res, id) {
  requireAdmin(req);
  const result = content.removeArticle(id);
  if (result.error) throw new ApiError(400, result.error);
  sendJson(res, 200, { ok: true });
}

function imageExtFromBuffer(buffer) {
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'png';
  }
  if (
    buffer.length > 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}

async function handleAdminUpload(req, res) {
  requireAdmin(req);
  const body = await readJson(req, 8 * 1024 * 1024);
  const dataUrl = String(body.dataUrl || '');
  const match = /^data:image\/(?:png|jpe?g|webp);base64,([A-Za-z0-9+/=\s]+)$/i.exec(dataUrl);
  if (!match) throw new ApiError(400, '请上传 JPG / PNG / WebP 图片');
  const buffer = Buffer.from(match[1].replace(/\s+/g, ''), 'base64');
  if (!buffer.length) throw new ApiError(400, '图片内容为空');
  if (buffer.length > MAX_IMAGE_BYTES) throw new ApiError(400, '图片最大 5MB');
  const ext = imageExtFromBuffer(buffer);
  if (!ext) throw new ApiError(400, '图片格式无法识别，请重新选择');
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = `${crypto.randomBytes(12).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  sendJson(res, 201, { url: `/uploads/${name}`, size: buffer.length });
}

const UPLOAD_NAME_RE = /^[a-f0-9]{24}\.(?:jpg|png|webp)$/i;

/** 导出后台内容、账号与内容中引用的上传图片（base64）。 */
async function handleAdminBackup(req, res) {
  requireAdmin(req);
  const db = getDb();
  const refs = new Set();
  const scan = (value) => {
    if (typeof value === 'string') {
      if (value.startsWith('/uploads/')) refs.add(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(scan);
      return;
    }
    if (value && typeof value === 'object') Object.values(value).forEach(scan);
  };
  scan(db.content || {});

  const uploads = {};
  for (const ref of refs) {
    const name = ref.split('/').pop();
    if (!UPLOAD_NAME_RE.test(name)) continue;
    try {
      const buffer = fs.readFileSync(path.join(UPLOAD_DIR, name));
      const ext = imageExtFromBuffer(buffer);
      if (!ext || buffer.length > MAX_IMAGE_BYTES) continue;
      const mime = ext === 'jpg' ? 'jpeg' : ext;
      uploads[name] = `data:image/${mime};base64,${buffer.toString('base64')}`;
    } catch {
      /* 图片已丢失时忽略，不影响其余数据导出 */
    }
  }

  sendJson(res, 200, {
    app: 'nuanyue',
    kind: 'admin-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    dataDir: DATA_DIR,
    db: { users: db.users, content: db.content || {} },
    uploads
  });
}

/** 从备份文件恢复账号、菜品、文章与上传图片。 */
async function handleAdminRestore(req, res) {
  const me = requireAdmin(req);
  const body = await readJson(req, 96 * 1024 * 1024);
  const snapshot = body && body.db ? body.db : null;
  if (!snapshot || !Array.isArray(snapshot.users) || !snapshot.content || typeof snapshot.content !== 'object') {
    throw new ApiError(400, '备份文件格式不正确，请选择由本后台导出的 JSON 文件');
  }

  const users = [];
  const seen = new Set();
  for (const raw of snapshot.users) {
    if (!raw || typeof raw !== 'object' || !raw.id || !raw.username) continue;
    if (seen.has(raw.id)) continue;
    seen.add(raw.id);
    users.push(raw);
  }
  if (!users.length) throw new ApiError(400, '备份中没有可用的账号数据');

  let self = users.find((u) => u.id === me.id) ||
    users.find((u) => String(u.username).toLowerCase() === String(me.username).toLowerCase());
  if (!self) {
    self = { ...me };
    users.push(self);
  }
  self.role = 'admin';
  self.disabled = false;
  if (!users.some((u) => u.role === 'admin' && !u.disabled)) users.push({ ...me, role: 'admin', disabled: false });

  const source = snapshot.content;
  const db = getDb();
  db.users = users;
  db.content = {
    recipes: Array.isArray(source.recipes) ? source.recipes.filter((r) => r && r.id) : [],
    articles: Array.isArray(source.articles) ? source.articles.filter((a) => a && a.id) : [],
    recipeOverrides: source.recipeOverrides && typeof source.recipeOverrides === 'object' ? source.recipeOverrides : {},
    articleOverrides: source.articleOverrides && typeof source.articleOverrides === 'object' ? source.articleOverrides : {}
  };

  let restored = 0;
  if (body.uploads && typeof body.uploads === 'object') {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    for (const [name, dataUrl] of Object.entries(body.uploads)) {
      if (!UPLOAD_NAME_RE.test(name)) continue;
      const match = /^data:image\/(?:png|jpe?g|webp);base64,([A-Za-z0-9+/=\s]+)$/i.exec(String(dataUrl || ''));
      if (!match) continue;
      const buffer = Buffer.from(match[1].replace(/\s+/g, ''), 'base64');
      if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) continue;
      fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
      restored += 1;
    }
  }

  content.resetRuntime();
  registerCustomRecipes();
  save();
  sendJson(res, 200, {
    ok: true,
    token: signToken(self.id, getDb().secret),
    users: users.length,
    uploads: restored
  });
}

async function handleAdminArticleFetch(req, res) {
  requireAdmin(req);
  const body = await readJson(req);
  const url = String(body.url || '').trim();
  if (!url) throw new ApiError(400, '请先粘贴文章链接');
  try {
    const article = await fetchArticle(url);
    sendJson(res, 200, { article });
  } catch (err) {
    throw new ApiError(400, err.message || '抓取失败，请稍后再试');
  }
}

const publicFetchHits = new Map();

function allowPublicFetch(ip) {
  const now = Date.now();
  const hits = (publicFetchHits.get(ip) || []).filter((t) => now - t < 60000);
  if (hits.length >= 30) return false;
  hits.push(now);
  publicFetchHits.set(ip, hits);
  return true;
}

/**
 * 供 GitHub Pages 纯静态后台调用的文章抓取通道。
 * 只抓取公开网页，无鉴权，带简单频控与 CORS。
 */
async function handlePublicArticleFetch(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  const ip = req.socket.remoteAddress || 'unknown';
  if (!allowPublicFetch(ip)) throw new ApiError(429, '抓取过于频繁，请稍后再试', 'RATE_LIMITED');
  const body = await readJson(req);
  const url = String(body.url || '').trim();
  if (!url || url.length > 2048) throw new ApiError(400, '请填写正确的文章链接');
  try {
    const article = await fetchArticle(url);
    sendJson(res, 200, { article });
  } catch (err) {
    throw new ApiError(400, err.message || '抓取失败，请稍后再试');
  }
}

async function handleAdminUsers(req, res) {
  requireAdmin(req);
  const users = getDb().users
    .slice()
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    .map(adminUserView);
  sendJson(res, 200, { total: users.length, users });
}

async function handleAdminUserDetail(req, res, id) {
  requireAdmin(req);
  const user = findUserById(id);
  if (!user) throw new ApiError(404, '用户不存在', 'NOT_FOUND');
  const today = planner.todayStr();
  const recentLogs = [];
  for (let i = 0; i < 14; i += 1) {
    const date = planner.addDays(today, -i);
    const log = user.logs?.[date];
    if (log) recentLogs.push({ date, ...log });
  }
  sendJson(res, 200, {
    user: adminUserView(user),
    recentLogs,
    favorites: (user.favorites || []).map((fid) => RECIPE_MAP.get(fid)).filter(Boolean).map((r) => ({ id: r.id, name: r.name })),
    cooked: (user.cooked || []).map((cid) => RECIPE_MAP.get(cid)).filter(Boolean).map((r) => ({ id: r.id, name: r.name }))
  });
}

async function handleAdminUserUpdate(req, res, id) {
  const me = requireAdmin(req);
  const user = findUserById(id);
  if (!user) throw new ApiError(404, '用户不存在', 'NOT_FOUND');
  const body = await readJson(req);
  const activeAdmins = getDb().users.filter((u) => u.role === 'admin' && !u.disabled && u.id !== id).length;

  if (body.role !== undefined) {
    if (!['admin', 'user'].includes(body.role)) throw new ApiError(400, '角色不正确');
    if (id === me.id && body.role !== 'admin') throw new ApiError(400, '不能取消自己的管理员权限');
    if (user.role === 'admin' && body.role === 'user' && activeAdmins === 0) {
      throw new ApiError(400, '至少保留一名可用管理员');
    }
    user.role = body.role;
  }

  if (body.disabled !== undefined) {
    if (id === me.id && body.disabled) throw new ApiError(400, '不能停用当前登录的账号');
    if (body.disabled && user.role === 'admin' && activeAdmins === 0) {
      throw new ApiError(400, '至少保留一名可用管理员');
    }
    user.disabled = Boolean(body.disabled);
  }

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name || name.length > 20) throw new ApiError(400, '称呼需为 1-20 个字符');
    user.name = name;
    if (user.profile) user.profile.name = name;
  }

  if (body.resetPassword !== undefined) {
    const password = String(body.resetPassword || '');
    if (password.length < 6) throw new ApiError(400, '新密码至少 6 位');
    const { salt, hash } = hashPassword(password);
    user.salt = salt;
    user.hash = hash;
  }

  touchUser(user);
  sendJson(res, 200, { user: adminUserView(user) });
}

async function handleAdminUserDelete(req, res, id) {
  const me = requireAdmin(req);
  if (id === me.id) throw new ApiError(400, '不能删除当前登录的账号');
  const user = findUserById(id);
  if (!user) throw new ApiError(404, '用户不存在', 'NOT_FOUND');
  if (user.role === 'admin' && getDb().users.filter((u) => u.role === 'admin' && !u.disabled).length <= 1) {
    throw new ApiError(400, '至少保留一名可用管理员');
  }
  for (const recipe of user.customRecipes || []) RECIPE_MAP.delete(recipe.id);
  const users = getDb().users;
  const idx = users.findIndex((u) => u.id === id);
  if (idx >= 0) users.splice(idx, 1);
  save();
  sendJson(res, 200, { ok: true });
}

// ------------------------- 路由分发 -------------------------

async function handle(req, res, url) {
  const method = req.method;
  const path = url.pathname;

  try {
    if (path === '/api/health' && method === 'GET') {
      sendJson(res, 200, { ok: true, time: new Date().toISOString() });
      return;
    }
    if (path === '/api/fetch-article' && method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      });
      res.end();
      return;
    }
    if (path === '/api/fetch-article' && method === 'POST') return await handlePublicArticleFetch(req, res);
    if (path === '/api/meta' && method === 'GET') return await handleMeta(req, res);

    if (path === '/api/admin/overview' && method === 'GET') return await handleAdminOverview(req, res);
    if (path === '/api/admin/backup' && method === 'GET') return await handleAdminBackup(req, res);
    if (path === '/api/admin/restore' && method === 'POST') return await handleAdminRestore(req, res);
    if (path === '/api/admin/recipes' && method === 'GET') return await handleAdminRecipes(req, res, url);
    if (path === '/api/admin/recipes' && method === 'POST') return await handleAdminRecipeCreate(req, res);
    if (path === '/api/admin/users' && method === 'GET') return await handleAdminUsers(req, res);
    if (path === '/api/admin/articles' && method === 'GET') return await handleAdminArticles(req, res);
    if (path === '/api/admin/articles' && method === 'POST') return await handleAdminArticleCreate(req, res);
    if (path === '/api/admin/articles/fetch' && method === 'POST') return await handleAdminArticleFetch(req, res);
    if (path === '/api/admin/upload' && method === 'POST') return await handleAdminUpload(req, res);

    const adminRecipeStatus = path.match(/^\/api\/admin\/recipes\/([\w-]+)\/status$/);
    if (adminRecipeStatus && method === 'PATCH') return await handleAdminRecipeStatus(req, res, adminRecipeStatus[1]);
    const adminRecipe = path.match(/^\/api\/admin\/recipes\/([\w-]+)$/);
    if (adminRecipe && method === 'PUT') return await handleAdminRecipeUpdate(req, res, adminRecipe[1]);
    if (adminRecipe && method === 'DELETE') return await handleAdminRecipeDelete(req, res, adminRecipe[1]);

    const adminArticleStatus = path.match(/^\/api\/admin\/articles\/([\w-]+)\/status$/);
    if (adminArticleStatus && method === 'PATCH') return await handleAdminArticleStatus(req, res, adminArticleStatus[1]);
    const adminArticle = path.match(/^\/api\/admin\/articles\/([\w-]+)$/);
    if (adminArticle && method === 'PUT') return await handleAdminArticleUpdate(req, res, adminArticle[1]);
    if (adminArticle && method === 'DELETE') return await handleAdminArticleDelete(req, res, adminArticle[1]);

    const adminUser = path.match(/^\/api\/admin\/users\/([\w-]+)$/);
    if (adminUser && method === 'GET') return await handleAdminUserDetail(req, res, adminUser[1]);
    if (adminUser && method === 'PATCH') return await handleAdminUserUpdate(req, res, adminUser[1]);
    if (adminUser && method === 'DELETE') return await handleAdminUserDelete(req, res, adminUser[1]);

    if (path === '/api/auth/register' && method === 'POST') return await handleRegister(req, res);
    if (path === '/api/auth/login' && method === 'POST') return await handleLogin(req, res);
    if (path === '/api/auth/me' && method === 'GET') return await handleMe(req, res, url);
    if (path === '/api/auth/password' && method === 'POST') return await handlePassword(req, res);

    if (path === '/api/profile' && method === 'GET') return await handleProfileGet(req, res, url);
    if (path === '/api/profile' && method === 'PUT') return await handleProfileUpdate(req, res);

    if (path === '/api/recipes' && method === 'GET') return await handleRecipes(req, res, url);
    if (path === '/api/favorites' && method === 'GET') return await handleFavorites(req, res);

    if (path === '/api/recipes/custom' && method === 'POST') return await handleCustomRecipeCreate(req, res);
    const customRecipe = path.match(/^\/api\/recipes\/custom\/([\w-]+)$/);
    if (customRecipe && method === 'PUT') return await handleCustomRecipeUpdate(req, res, customRecipe[1]);
    if (customRecipe && method === 'DELETE') return await handleCustomRecipeDelete(req, res, customRecipe[1]);

    if (path === '/api/articles' && method === 'GET') return await handleArticles(req, res);
    const articleDetail = path.match(/^\/api\/articles\/([\w-]+)$/);
    if (articleDetail && method === 'GET') return await handleArticleDetail(req, res, articleDetail[1]);

    const recipeCook = path.match(/^\/api\/recipes\/([\w-]+)\/cook$/);
    if (recipeCook && method === 'POST') return await handleRecipeCook(req, res, recipeCook[1]);
    const recipeNote = path.match(/^\/api\/recipes\/([\w-]+)\/note$/);
    if (recipeNote && method === 'PUT') return await handleRecipeNote(req, res, recipeNote[1]);

    const recipeDetail = path.match(/^\/api\/recipes\/([\w-]+)$/);
    if (recipeDetail && method === 'GET') return await handleRecipeDetail(req, res, recipeDetail[1]);

    const favorite = path.match(/^\/api\/recipes\/([\w-]+)\/favorite$/);
    if (favorite && method === 'POST') return await handleFavorite(req, res, favorite[1]);

    if (path === '/api/plan' && method === 'GET') return await handlePlanGet(req, res, url);
    if (path === '/api/plan/generate' && method === 'POST') return await handlePlanGenerate(req, res);
    if (path === '/api/plan/swap' && method === 'POST') return await handlePlanSwap(req, res);
    if (path === '/api/plan/eat' && method === 'POST') return await handlePlanEat(req, res);
    if (path === '/api/plan/skip' && method === 'POST') return await handlePlanSkip(req, res);
    if (path === '/api/plan/apply' && method === 'POST') return await handlePlanApply(req, res);

    if (path === '/api/logs' && method === 'GET') return await handleLogsGet(req, res, url);
    const logDate = path.match(/^\/api\/logs\/(\d{4}-\d{2}-\d{2})$/);
    if (logDate && method === 'PUT') return await handleLogPut(req, res, logDate[1]);

    if (path === '/api/grocery' && method === 'GET') return await handleGrocery(req, res, url);
    if (path === '/api/grocery/toggle' && method === 'POST') return await handleGroceryToggle(req, res);
    if (path === '/api/grocery/clear' && method === 'POST') return await handleGroceryClear(req, res);

    if (path === '/api/stats' && method === 'GET') return await handleStats(req, res, url);
    if (path === '/api/export' && method === 'GET') return await handleExport(req, res);

    throw new ApiError(404, '接口不存在', 'NOT_FOUND');
  } catch (err) {
    if (err instanceof ApiError) {
      sendJson(res, err.status, { error: { code: err.code, message: err.message } });
      return;
    }
    console.error('[api]', path, err);
    sendJson(res, 500, { error: { code: 'INTERNAL', message: '服务器开小差了，请稍后再试' } });
  }
}

function registerCustomRecipes() {
  for (const user of getDb().users) {
    for (const recipe of user.customRecipes || []) {
      if (recipe && recipe.id) RECIPE_MAP.set(recipe.id, decorateRecipe(recipe));
    }
  }
}

function createApi() {
  content.applyContent();
  ensureAdminUser();
  ensureDemoUser();
  registerCustomRecipes();
  return { handle };
}

module.exports = { createApi, DEMO_USERNAME, DEMO_PASSWORD };
