'use strict';

const {
  getDb,
  save,
  findUserById,
  findUserByUsername,
  addUser,
  newId,
  touchUser
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
  LOG_OPTIONS
} = require('./data/meta');
const { ARTICLES, ARTICLE_MAP } = require('./data/articles');
const planner = require('./planner');

const DEMO_USERNAME = 'demo';
const DEMO_PASSWORD = 'demo123456';

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

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 256 * 1024) {
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
  ensureCollections(user);
  return user;
}

function ensureCollections(user) {
  if (!user.logs || typeof user.logs !== 'object') user.logs = {};
  if (!user.skipped || typeof user.skipped !== 'object') user.skipped = {};
  if (!user.eaten || typeof user.eaten !== 'object') user.eaten = {};
  if (!user.groceryChecks || typeof user.groceryChecks !== 'object') user.groceryChecks = {};
  if (!Array.isArray(user.favorites)) user.favorites = [];
  return user;
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: defaultProfile(name || username),
    favorites: [],
    plan: null,
    eaten: {},
    skipped: {},
    logs: {},
    groceryChecks: {}
  };
}

function publicUser(user) {
  return { id: user.id, username: user.username, name: user.name, createdAt: user.createdAt };
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
    addUser(demo);
    console.log('[seed] demo account created');
    return;
  }

  ensureCollections(demo);

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

function buildDemoLogs() {
  const today = planner.todayStr();
  const samples = [
    { offset: 0, weight: 62.4, waterMl: 1250, sleepHours: 6.5, mood: '不错', lochia: '少量', wound: '良好', bowel: '正常', note: '今天奶量不错，午后睡了半小时。' },
    { offset: 1, weight: 62.6, waterMl: 2000, sleepHours: 7, mood: '很好', lochia: '少量', wound: '良好', bowel: '正常', note: '走了 15 分钟，精神好多了。' },
    { offset: 2, weight: 62.8, waterMl: 1750, sleepHours: 5.5, mood: '疲惫', lochia: '中等', wound: '轻微不适', bowel: '正常', note: '夜里喂了两次，白天补觉。' },
    { offset: 3, weight: 63.0, waterMl: 1500, sleepHours: 6, mood: '一般', lochia: '中等', wound: '良好', bowel: '便秘', note: '蔬菜吃少了，明天加一份秋葵。' },
    { offset: 4, weight: 63.1, waterMl: 2000, sleepHours: 7.5, mood: '不错', lochia: '少量', wound: '良好', bowel: '正常', note: '' },
    { offset: 5, weight: 63.3, waterMl: 2250, sleepHours: 8, mood: '很好', lochia: '少量', wound: '良好', bowel: '正常', note: '胃口不错，汤都喝完了。' },
    { offset: 6, weight: 63.4, waterMl: 1800, sleepHours: 6, mood: '一般', lochia: '少量', wound: '良好', bowel: '正常', note: '' }
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
    logOptions: LOG_OPTIONS,
    recipeCount: RECIPES.length,
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
    favorites: user.favorites || []
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
  const q = String(url.searchParams.get('q') || '').trim().toLowerCase();
  const ids = url.searchParams.get('ids');

  let list = RECIPES;
  if (ids) {
    const wanted = new Set(ids.split(',').map((s) => s.trim()));
    list = list.filter((r) => wanted.has(r.id));
  }
  if (course) list = list.filter((r) => r.course === course);
  if (stage) list = list.filter((r) => r.stages.includes(stage));
  if (slot) list = list.filter((r) => r.slots.includes(slot));
  if (q) list = list.filter((r) => r.searchText.toLowerCase().includes(q));

  sendJson(res, 200, {
    total: list.length,
    recipes: list.map(planner.publicRecipe)
  });
}

async function handleRecipeDetail(req, res, id) {
  const recipe = RECIPE_MAP.get(id);
  if (!recipe) throw new ApiError(404, '没有找到这道菜', 'NOT_FOUND');
  const similar = RECIPES.filter((r) => r.id !== id && r.course === recipe.course)
    .slice(0, 3)
    .map((r) => ({ id: r.id, name: r.name, image: r.image, kcal: r.kcal }));
  sendJson(res, 200, { recipe: planner.publicRecipe(recipe), similar });
}

async function handleFavorite(req, res, id) {
  const user = requireUser(req);
  const recipe = RECIPE_MAP.get(id);
  if (!recipe) throw new ApiError(404, '没有找到这道菜', 'NOT_FOUND');
  if (!Array.isArray(user.favorites)) user.favorites = [];
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
  if (body.mood !== undefined) {
    if (body.mood && !LOG_OPTIONS.moods.includes(body.mood)) throw new ApiError(400, '心情选项不正确');
    out.mood = body.mood || '';
  }
  if (body.lochia !== undefined) {
    if (body.lochia && !LOG_OPTIONS.lochia.includes(body.lochia)) throw new ApiError(400, '恶露选项不正确');
    out.lochia = body.lochia || '';
  }
  if (body.wound !== undefined) {
    if (body.wound && !LOG_OPTIONS.wound.includes(body.wound)) throw new ApiError(400, '伤口选项不正确');
    out.wound = body.wound || '';
  }
  if (body.bowel !== undefined) {
    if (body.bowel && !LOG_OPTIONS.bowel.includes(body.bowel)) throw new ApiError(400, '排便选项不正确');
    out.bowel = body.bowel || '';
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
  let start = url.searchParams.get('start');
  let days = Number(url.searchParams.get('days'));
  if (!planner.isValidDate(start)) start = planner.addDays(planner.todayStr(), -41);
  if (!days || days < 1 || days > 120) days = 42;

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
    groceryChecks: user.groceryChecks
  });
}

async function handleArticles(req, res) {
  sendJson(res, 200, {
    total: ARTICLES.length,
    articles: ARTICLES.map((a) => ({
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
  if (!article) throw new ApiError(404, '没有找到这篇文章', 'NOT_FOUND');
  sendJson(res, 200, { article });
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
    if (path === '/api/meta' && method === 'GET') return await handleMeta(req, res);

    if (path === '/api/auth/register' && method === 'POST') return await handleRegister(req, res);
    if (path === '/api/auth/login' && method === 'POST') return await handleLogin(req, res);
    if (path === '/api/auth/me' && method === 'GET') return await handleMe(req, res, url);
    if (path === '/api/auth/password' && method === 'POST') return await handlePassword(req, res);

    if (path === '/api/profile' && method === 'GET') return await handleProfileGet(req, res, url);
    if (path === '/api/profile' && method === 'PUT') return await handleProfileUpdate(req, res);

    if (path === '/api/recipes' && method === 'GET') return await handleRecipes(req, res, url);
    if (path === '/api/favorites' && method === 'GET') return await handleFavorites(req, res);

    if (path === '/api/articles' && method === 'GET') return await handleArticles(req, res);
    const articleDetail = path.match(/^\/api\/articles\/([\w-]+)$/);
    if (articleDetail && method === 'GET') return await handleArticleDetail(req, res, articleDetail[1]);

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

function createApi() {
  ensureDemoUser();
  return { handle };
}

module.exports = { createApi, DEMO_USERNAME, DEMO_PASSWORD };
