'use strict';

/* ------------------------------------------------------------------ *
 * 暖月 · 纯静态版本地 API
 * GitHub Pages 无法运行 Node 服务，这里用 localStorage + 内置 planner
 * 模拟原有 /api 接口。账号、餐单、记录、后台内容都只保存在当前浏览器。
 * ------------------------------------------------------------------ */

(function () {
  if (!window.NUANYUE_STATIC || !window.NUANYUE) return;

  const { RECIPES, RECIPE_MAP, ARTICLES, ARTICLE_MAP, planner, data, utils } = window.NUANYUE;
  const DB_KEY = 'nuanyue-static-db-v1';
  const STORAGE_QUOTA_CHARS = 5 * 1024 * 1024;
  let persistedRaw = '';
  const BASE_RECIPES = RECIPES.map((r) => ({ ...r }));
  const BASE_ARTICLES = ARTICLES.map((a) => ({
    ...a,
    sections: (a.sections || []).map((s) => ({ h: s.h, p: [...(s.p || [])] }))
  }));

  const IMAGE_OPTIONS = [
    'images/staple.jpg',
    'images/rice.jpg',
    'images/noodle.jpg',
    'images/bun.jpg',
    'images/main.jpg',
    'images/pork.jpg',
    'images/beef.jpg',
    'images/chicken.jpg',
    'images/duck.jpg',
    'images/shrimp.jpg',
    'images/egg.jpg',
    'images/veg.jpg',
    'images/tofu.jpg',
    'images/soup.jpg',
    'images/snack.jpg',
    'images/dessert.jpg',
    'images/fruit.jpg',
    'images/drink.jpg'
  ];

  const now = () => new Date().toISOString();

  function uid(prefix) {
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }

  function makeSalt() {
    return Math.random().toString(36).slice(2, 12);
  }

  // 本地演示账号使用轻量哈希，仅用于避免明文密码，不等同于真实服务端安全。
  function hashPassword(password, salt) {
    const text = `${salt}:${password}`;
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
  }

  function fail(status, message, code) {
    const err = new Error(message);
    err.status = status;
    err.code = code || 'BAD_REQUEST';
    throw err;
  }

  function todayStr() {
    return planner.todayStr();
  }

  function dateParam(params) {
    const raw = params.get('date');
    return planner.isValidDate(raw) ? raw : todayStr();
  }

  function defaultProfile(name) {
    return {
      name,
      deliveryDate: planner.addDays(todayStr(), -7),
      deliveryType: '顺产',
      feeding: '混合喂养',
      restrictions: [],
      taste: '适中',
      calorieGoal: 2600,
      slots: [...data.DEFAULT_SLOTS],
      onboarded: false
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

  function ensureUser(user) {
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

  function createUser({ username, password, name, role = 'user' }) {
    const salt = makeSalt();
    return ensureUser({
      id: uid('u'),
      username,
      salt,
      hash: hashPassword(password, salt),
      name: name || username,
      role,
      disabled: false,
      createdAt: now(),
      updatedAt: now(),
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
    });
  }

  function seedLogs() {
    const samples = [
      { offset: 0, weight: 62.4, temperature: 36.5, waterMl: 1250, sleepHours: 6.5, sleepQuality: '一般', mood: '不错', fatigue: '轻微', lochia: '少量', lochiaColor: '暗红', lochiaOdor: '正常', wound: '良好', breast: '正常', pain: '无', bowel: '正常', activityMinutes: 15, supplements: ['钙片'], note: '今天奶量不错，午后睡了半小时。' },
      { offset: 1, weight: 62.6, temperature: 36.6, waterMl: 2000, sleepHours: 7, sleepQuality: '很好', mood: '很好', fatigue: '无', lochia: '少量', lochiaColor: '暗红', lochiaOdor: '正常', wound: '良好', breast: '正常', pain: '无', bowel: '正常', activityMinutes: 25, supplements: ['钙片'], note: '走了 15 分钟，精神好多了。' },
      { offset: 2, weight: 62.8, temperature: 36.8, waterMl: 1750, sleepHours: 5.5, sleepQuality: '较差', mood: '疲惫', fatigue: '明显', lochia: '中等', lochiaColor: '暗红', lochiaOdor: '正常', wound: '轻微不适', breast: '胀痛', pain: '轻微', bowel: '正常', activityMinutes: 5, supplements: ['钙片'], note: '夜里喂了两次，白天补觉。' }
    ];
    const logs = {};
    for (const item of samples) {
      const { offset, ...rest } = item;
      logs[planner.addDays(todayStr(), -offset)] = rest;
    }
    return logs;
  }

  function seedDb() {
    const db = {
      version: 1,
      users: [],
      content: { recipes: [], recipeOverrides: {}, articles: [], articleOverrides: {} }
    };
    const admin = createUser({ username: 'admin', password: 'admin123456', name: '暖月管理员', role: 'admin' });
    admin.profile = {
      ...admin.profile,
      name: '暖月管理员',
      deliveryDate: planner.addDays(todayStr(), -30),
      onboarded: true
    };
    db.users.push(admin);

    const demo = createUser({ username: 'demo', password: 'demo123456', name: '林小满' });
    demo.profile = {
      ...demo.profile,
      name: '林小满',
      deliveryDate: planner.addDays(todayStr(), -12),
      feeding: '纯母乳',
      calorieGoal: 2800,
      onboarded: true
    };
    demo.favorites = ['p01', 'm13', 'k04'];
    demo.cooked = ['p01', 'm02', 's01', 'k04'];
    demo.recipeNotes = {
      p01: '鲫鱼煎过再冲开水，汤色更白；豆腐最后放，别煮老。',
      m02: '温水按 1.5 倍加，蒸出来真的很嫩。'
    };
    demo.logs = seedLogs();
    demo.plan = planner.generatePlan(demo.profile, todayStr(), 7);
    db.users.push(demo);
    return db;
  }

  let memoryDb = null;

  function loadDb() {
    if (memoryDb) return memoryDb;
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users) && parsed.content) {
          memoryDb = parsed;
          persistedRaw = raw;
          for (const user of memoryDb.users) ensureUser(user);
          if (!memoryDb.content.recipes) memoryDb.content.recipes = [];
          if (!memoryDb.content.articles) memoryDb.content.articles = [];
          if (!memoryDb.content.recipeOverrides) memoryDb.content.recipeOverrides = {};
          if (!memoryDb.content.articleOverrides) memoryDb.content.articleOverrides = {};
          rebuildRuntime(memoryDb);
          return memoryDb;
        }
      }
    } catch (err) {
      console.warn('[static] failed to load local data:', err);
    }
    memoryDb = seedDb();
    saveDb(memoryDb);
    rebuildRuntime(memoryDb);
    return memoryDb;
  }

  function saveDb(db) {
    const serialized = JSON.stringify(db);
    try {
      localStorage.setItem(DB_KEY, serialized);
      persistedRaw = serialized;
    } catch (err) {
      // 写入失败时回退到上一次成功落盘的数据，避免界面显示“已保存”但刷新后丢失。
      if (persistedRaw) {
        try {
          memoryDb = JSON.parse(persistedRaw);
          for (const user of memoryDb.users) ensureUser(user);
          rebuildRuntime(memoryDb);
        } catch {
          memoryDb = null;
        }
      }
      const sizeText = serialized.length >= 1024 * 1024
        ? `${(serialized.length / 1024 / 1024).toFixed(1)} MB`
        : `${Math.max(1, Math.round(serialized.length / 1024))} KB`;
      fail(400, `浏览器本地存储空间不足（当前数据约 ${sizeText}，上限约 5 MB），已撤销本次修改。请先在「数据概览 → 数据备份」导出备份，并清理部分上传图片后重试。`);
    }
  }

  function normalizeRecipe(source) {
    const copy = { ...source };
    for (const key of ['searchText', 'nutrients', 'method', 'difficulty', 'cautions', 'substitutes', 'vegetarian']) {
      delete copy[key];
    }
    if (!copy.image || copy.image === 'auto') copy.image = utils.imageForRecipe(copy);
    copy.available = copy.available !== false;
    copy.price = Math.max(0, Number(copy.price) || 0);
    return utils.decorateRecipe(copy);
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
              h: String((s && s.h) || '').trim(),
              p: (Array.isArray(s && s.p) ? s.p : []).map((p) => String(p).trim()).filter(Boolean)
            }))
            .filter((s) => s.h && s.p.length)
        : [],
      available: source.available !== false,
      admin: Boolean(source.admin),
      updatedAt: now()
    };
  }

  function rebuildRuntime(db) {
    const recipes = BASE_RECIPES.map((r) => ({ ...r }));
    for (const [id, snapshot] of Object.entries(db.content.recipeOverrides || {})) {
      const index = recipes.findIndex((r) => r.id === id);
      if (index >= 0) recipes[index] = normalizeRecipe({ ...recipes[index], ...snapshot, id });
    }
    for (const raw of db.content.recipes || []) {
      recipes.push(normalizeRecipe({ ...raw, admin: true }));
    }
    RECIPES.length = 0;
    RECIPES.push(...recipes);
    RECIPE_MAP.clear();
    for (const recipe of RECIPES) RECIPE_MAP.set(recipe.id, recipe);
    for (const user of db.users) {
      for (const recipe of user.customRecipes || []) {
        RECIPE_MAP.set(recipe.id, utils.decorateRecipe(recipe));
      }
    }

    const articles = BASE_ARTICLES.map((a) => ({ ...a, sections: a.sections.map((s) => ({ h: s.h, p: [...s.p] })) }));
    for (const [id, snapshot] of Object.entries(db.content.articleOverrides || {})) {
      const index = articles.findIndex((a) => a.id === id);
      if (index >= 0) articles[index] = normalizeArticle({ ...articles[index], ...snapshot, id });
    }
    for (const raw of db.content.articles || []) {
      articles.push(normalizeArticle({ ...raw, admin: true }));
    }
    ARTICLES.length = 0;
    ARTICLES.push(...articles);
    ARTICLE_MAP.clear();
    for (const article of ARTICLES) ARTICLE_MAP.set(article.id, article);
  }

  function findUserByToken(db, token) {
    if (!token) return null;
    return db.users.find((user) => user.id === token) || null;
  }

  function requireUser(db, token) {
    const user = findUserByToken(db, token);
    if (!user) fail(401, '登录已过期，请重新登录', 'UNAUTHORIZED');
    if (user.disabled) fail(403, '该账号已被停用，请联系管理员', 'ACCOUNT_DISABLED');
    return ensureUser(user);
  }

  function requireAdmin(db, token) {
    const user = requireUser(db, token);
    if (user.role !== 'admin') fail(403, '该账号没有管理权限', 'FORBIDDEN');
    return user;
  }

  function authPayload(user, date) {
    ensureUser(user);
    return {
      token: null,
      user: publicUser(user),
      profile: user.profile,
      stage: planner.stagePayload(user.profile.deliveryDate, date),
      favorites: user.favorites,
      cooked: user.cooked,
      recipeNotes: user.recipeNotes,
      plan: planner.planOverview(user.plan, user.eaten, user.skipped),
      stats: planner.computeStats(user, date)
    };
  }

  function ensurePlan(user) {
    if (!user.plan) {
      user.plan = planner.generatePlan(user.profile, todayStr(), 7);
      user.eaten = {};
      user.skipped = {};
      user.groceryChecks = {};
      saveDb(loadDb());
    }
  }

  function decorateDay(user, date) {
    const day = planner.resolveDay(user.plan, date);
    if (!day) return null;
    day.eaten = Array.isArray(user.eaten && user.eaten[date]) ? user.eaten[date] : [];
    day.skipped = Array.isArray(user.skipped && user.skipped[date]) ? user.skipped[date] : [];
    day.stage = planner.stagePayload(user.profile.deliveryDate, date);
    day.targetKcal = user.profile.calorieGoal || 2600;
    return day;
  }

  function planResponse(db, user, date) {
    ensurePlan(user);
    return {
      plan: planner.planOverview(user.plan, user.eaten, user.skipped),
      day: decorateDay(user, date),
      inRange: Boolean(planner.resolveDay(user.plan, date)),
      stage: planner.stagePayload(user.profile.deliveryDate, date),
      stats: planner.computeStats(user, todayStr())
    };
  }

  function normalizeTags(value) {
    const raw = Array.isArray(value) ? value : String(value || '').split(/[,，、\s]+/);
    return [...new Set(raw.map((t) => String(t).trim()).filter(Boolean))].slice(0, 6);
  }

  function normalizeIngredients(value) {
    if (!Array.isArray(value) || !value.length) fail(400, '请至少填写一种食材');
    return value.slice(0, 20).map((item) => {
      const raw = Array.isArray(item)
        ? { name: item[0], amount: item[1], unit: item[2], category: item[3] }
        : item || {};
      const name = String(raw.name || '').trim();
      const amount = Number(raw.amount);
      const unit = String(raw.unit || 'g').trim();
      let category = String(raw.category || '').trim();
      if (!name) fail(400, '食材名称不能为空');
      if (!Number.isFinite(amount) || amount <= 0) fail(400, `「${name}」的用量不正确`);
      if (!['g', 'ml', '个', '颗', '张', '瓣', '片'].includes(unit)) fail(400, `「${name}」的单位不正确`);
      if (!utils.INGREDIENT_CATEGORIES.includes(category)) category = utils.inferCategory(name);
      return [name, amount, unit, category];
    });
  }

  function normalizeSteps(value) {
    const raw = Array.isArray(value) ? value : String(value || '').split('\n');
    const steps = raw.map((s) => String(s).trim()).filter(Boolean).slice(0, 15);
    if (!steps.length) fail(400, '请至少填写一个做法步骤');
    return steps;
  }

  function buildCustomRecipe(user, body, existing) {
    const name = String(body.name || (existing && existing.name) || '').trim();
    if (!name || name.length > 30) fail(400, '食谱名称需为 1-30 个字符');
    const course = String(body.course || (existing && existing.course) || '');
    if (!data.COURSES[course]) fail(400, '请选择正确的品类');
    const compatible = data.SLOTS.filter((s) => s.courses.includes(course)).map((s) => s.key);
    const requested = Array.isArray(body.slots) ? body.slots.filter((k) => compatible.includes(k)) : (existing && existing.slots) || [];
    const slots = requested.length ? requested : compatible;
    const kcal = Math.round(Number(body.kcal !== undefined ? body.kcal : (existing && existing.kcal) || 0) || 0);
    const protein = Math.round((Number(body.protein !== undefined ? body.protein : (existing && existing.protein) || 0) || 0) * 10) / 10;
    const carbs = Math.round((Number(body.carbs !== undefined ? body.carbs : (existing && existing.carbs) || 0) || 0) * 10) / 10;
    const fat = Math.round((Number(body.fat !== undefined ? body.fat : (existing && existing.fat) || 0) || 0) * 10) / 10;
    const time = Math.round(Number(body.time !== undefined ? body.time : (existing && existing.time) || 20) || 20);
    if (kcal < 0 || kcal > 1500) fail(400, '热量需在 0-1500 kcal 之间');
    if (time < 1 || time > 360) fail(400, '用时需在 1-360 分钟之间');
    const tags = body.tags !== undefined ? normalizeTags(body.tags) : (existing && existing.tags) || [];
    const ingredients = body.ingredients !== undefined ? normalizeIngredients(body.ingredients) : existing && existing.ingredients;
    if (!ingredients || !ingredients.length) fail(400, '请至少填写一种食材');
    const steps = body.steps !== undefined ? normalizeSteps(body.steps) : existing && existing.steps;
    if (!steps || !steps.length) fail(400, '请至少填写一个做法步骤');
    const tips = String(body.tips !== undefined ? body.tips : (existing && existing.tips) || '').trim();
    return utils.decorateRecipe({
      id: (existing && existing.id) || uid('c'),
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
      createdAt: (existing && existing.createdAt) || now()
    });
  }

  function recipeUsedInPlan(user, recipeId) {
    const items = (user.plan && user.plan.items) || {};
    for (const day of Object.values(items)) {
      for (const meal of Object.values(day)) {
        if (Object.values(meal).includes(recipeId)) return true;
      }
    }
    return false;
  }

  function buildAdminRecipe(body, existing) {
    const name = String(body.name !== undefined ? body.name : (existing && existing.name) || '').trim();
    if (!name || name.length > 30) fail(400, '菜品名称需为 1-30 个字符');
    const course = String(body.course !== undefined ? body.course : (existing && existing.course) || '');
    if (!data.COURSES[course]) fail(400, '请选择正确的菜品品类');
    const compatible = data.SLOTS.filter((s) => s.courses.includes(course)).map((s) => s.key);
    const requestedSlots = Array.isArray(body.slots) ? body.slots.filter((k) => compatible.includes(k)) : existing && existing.slots;
    const slots = requestedSlots && requestedSlots.length ? requestedSlots : compatible;
    const requestedStages = Array.isArray(body.stages) ? body.stages.map(Number) : existing && existing.stages;
    const stages = [...new Set((requestedStages || [1, 2, 3, 4]).filter((n) => [1, 2, 3, 4].includes(n)))].sort();
    if (!stages.length) fail(400, '请至少选择一个适用阶段');
    const kcal = Math.round(Number(body.kcal !== undefined ? body.kcal : (existing && existing.kcal) || 0) || 0);
    const protein = Math.round((Number(body.protein !== undefined ? body.protein : (existing && existing.protein) || 0) || 0) * 10) / 10;
    const carbs = Math.round((Number(body.carbs !== undefined ? body.carbs : (existing && existing.carbs) || 0) || 0) * 10) / 10;
    const fat = Math.round((Number(body.fat !== undefined ? body.fat : (existing && existing.fat) || 0) || 0) * 10) / 10;
    const time = Math.round(Number(body.time !== undefined ? body.time : (existing && existing.time) || 20) || 20);
    const price = Math.round((Number(body.price !== undefined ? body.price : (existing && existing.price) || 0) || 0) * 100) / 100;
    if (kcal < 0 || kcal > 1500) fail(400, '热量需在 0-1500 kcal 之间');
    if (time < 1 || time > 360) fail(400, '用时需在 1-360 分钟之间');
    if (price < 0 || price > 999) fail(400, '价格需在 0-999 元之间');
    const tags = body.tags !== undefined ? normalizeTags(body.tags) : (existing && existing.tags) || [];
    const ingredients = body.ingredients !== undefined ? normalizeIngredients(body.ingredients) : existing && existing.ingredients;
    if (!ingredients || !ingredients.length) fail(400, '请至少填写一种食材');
    const steps = body.steps !== undefined ? normalizeSteps(body.steps) : existing && existing.steps;
    if (!steps || !steps.length) fail(400, '请至少填写一个做法步骤');
    const tips = String(body.tips !== undefined ? body.tips : (existing && existing.tips) || '').trim();
    const image = String(body.image !== undefined ? body.image : (existing && existing.image) || 'auto');
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
      available: body.available !== undefined ? Boolean(body.available) : existing ? existing.available !== false : true
    };
  }

  function buildAdminArticle(body, existing) {
    const title = String(body.title !== undefined ? body.title : (existing && existing.title) || '').trim();
    if (!title || title.length > 60) fail(400, '标题需为 1-60 个字符');
    const summary = String(body.summary !== undefined ? body.summary : (existing && existing.summary) || '').trim();
    if (summary.length > 160) fail(400, '摘要最多 160 字');
    const tag = String(body.tag !== undefined ? body.tag : (existing && existing.tag) || '饮食调养').trim();
    const minutes = Math.round(Number(body.minutes !== undefined ? body.minutes : (existing && existing.minutes) || 3) || 3);
    const rawSections = body.sections !== undefined ? body.sections : existing && existing.sections;
    if (!Array.isArray(rawSections) || !rawSections.length) fail(400, '请至少填写一个内容段落');
    const sections = rawSections.slice(0, 12).map((s) => {
      const h = String((s && s.h) || '').trim();
      const paragraphs = (Array.isArray(s && s.p) ? s.p : []).map((p) => String(p).trim()).filter(Boolean);
      if (!h) fail(400, '段落标题不能为空');
      if (!paragraphs.length) fail(400, `「${h}」至少需要一段正文`);
      return { h, p: paragraphs };
    });
    return {
      title,
      summary,
      tag,
      minutes,
      sections,
      available: body.available !== undefined ? Boolean(body.available) : existing ? existing.available !== false : true
    };
  }

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
    const stats = planner.computeStats(user, todayStr());
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
      planStart: user.plan ? user.plan.startDate : null,
      planDays: user.plan ? user.plan.days : 0
    };
  }

  function overview(db) {
    const weekAgo = Date.now() - 7 * 86400000;
    const logCount = db.users.reduce((sum, u) => sum + Object.keys(u.logs || {}).length, 0);
    const planUsers = db.users.filter((u) => u.plan);
    const byCourse = {};
    for (const r of RECIPES) {
      if (!byCourse[r.course]) byCourse[r.course] = { total: 0, available: 0 };
      byCourse[r.course].total += 1;
      if (r.available !== false) byCourse[r.course].available += 1;
    }
    return {
      users: {
        total: db.users.length,
        admins: db.users.filter((u) => u.role === 'admin').length,
        disabled: db.users.filter((u) => u.disabled).length,
        new7d: db.users.filter((u) => u.createdAt && new Date(u.createdAt).getTime() >= weekAgo).length,
        active7d: db.users.filter((u) => u.lastLoginAt && new Date(u.lastLoginAt).getTime() >= weekAgo).length
      },
      plans: {
        users: planUsers.length,
        days: planUsers.reduce((sum, u) => sum + ((u.plan && u.plan.days) || 0), 0),
        records: logCount
      },
      recipes: {
        total: RECIPES.length,
        available: RECIPES.filter((r) => r.available !== false).length,
        hidden: RECIPES.filter((r) => r.available === false).length,
        byCourse
      },
      articles: {
        total: ARTICLES.length,
        available: ARTICLES.filter((a) => a.available !== false).length
      },
      recentUsers: db.users
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
        })),
      storage: {
        mode: 'local',
        usedChars: JSON.stringify(db).length,
        quotaChars: STORAGE_QUOTA_CHARS
      }
    };
  }

  function parseArticleHtml(html, url) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const metaContent = (names) => {
      for (const name of names) {
        const el = doc.querySelector(`meta[property="${name}"],meta[name="${name}"]`);
        if (el && el.getAttribute('content')) return el.getAttribute('content').trim();
      }
      return '';
    };
    const title =
      metaContent(['og:title', 'twitter:title']) ||
      (doc.querySelector('h1') && doc.querySelector('h1').textContent.trim()) ||
      (doc.title || '').replace(/\s*[-_|｜]\s*[^-_|｜]{0,24}$/, '').trim();
    const main = doc.querySelector('article') || doc.querySelector('main') || doc.body;
    if (!main) throw new Error('未能识别网页正文');
    for (const el of main.querySelectorAll('script,style,noscript,nav,header,footer,aside,form,iframe,svg,button')) {
      el.remove();
    }
    const sections = [];
    const heads = [...main.querySelectorAll('h2,h3')];
    const collect = (node) => [...node.querySelectorAll('p')]
      .map((p) => p.textContent.replace(/\s+/g, ' ').trim())
      .filter((text) => text.length >= 18 && text.length <= 800 &&
        !/(版权所有|免责声明|扫码|关注公众号|广告|登录后|责任编辑|来源[:：])/.test(text))
      .slice(0, 8);
    if (heads.length) {
      const firstHead = heads[0];
      const intro = [...main.querySelectorAll('p')]
        .filter((p) => firstHead.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_PRECEDING)
        .map((p) => p.textContent.replace(/\s+/g, ' ').trim())
        .filter((text) => text.length >= 18 && text.length <= 800)
        .slice(0, 3);
      if (intro.length) sections.push({ h: '导语', p: intro });
      heads.forEach((head, i) => {
        const parts = [];
        let node = head.nextElementSibling;
        const next = heads[i + 1];
        while (node && node !== next) {
          if (node.matches('p')) {
            const text = node.textContent.replace(/\s+/g, ' ').trim();
            if (text.length >= 18 && text.length <= 800) parts.push(text);
          }
          node = node.nextElementSibling;
        }
        if (head.textContent.trim() && parts.length) {
          sections.push({ h: head.textContent.trim().slice(0, 60), p: parts.slice(0, 8) });
        }
      });
    }
    if (!sections.length) {
      const paragraphs = collect(main);
      if (paragraphs.length) sections.push({ h: '正文', p: paragraphs.slice(0, 14) });
    }
    if (!sections.length) throw new Error('未能识别正文内容，请手动粘贴');
    const summary = (metaContent(['og:description', 'description']) || sections.flatMap((s) => s.p)[0] || '').slice(0, 140);
    const chars = sections.reduce((sum, s) => sum + s.p.join('').length, 0);
    return {
      title: title.slice(0, 60),
      summary,
      tag: '网络摘录',
      minutes: Math.min(20, Math.max(1, Math.round(chars / 400))),
      sections,
      sourceUrl: url
    };
  }

  async function compressImage(dataUrl) {
    if (!/^data:image\/(png|jpe?g|webp);base64,/i.test(dataUrl)) fail(400, '请上传 JPG / PNG / WebP 图片');
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const max = 1200;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        let out = canvas.toDataURL('image/jpeg', 0.82);
        if (out.length > 500 * 1024) out = canvas.toDataURL('image/jpeg', 0.68);
        if (out.length > 900 * 1024) {
          reject(new Error('图片压缩后仍然过大，请换一张尺寸更小的图片'));
          return;
        }
        resolve(out);
      };
      img.onerror = () => reject(new Error('图片读取失败'));
      img.src = dataUrl;
    });
  }

  function applyProfileUpdates(profile, body) {
    const next = { ...profile };
    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name || name.length > 20) fail(400, '称呼需为 1-20 个字符');
      next.name = name;
    }
    if (body.deliveryDate !== undefined) {
      if (!planner.isValidDate(body.deliveryDate)) fail(400, '请选择正确的分娩日期');
      if (body.deliveryDate > todayStr()) fail(400, '分娩日期不能晚于今天');
      next.deliveryDate = body.deliveryDate;
    }
    if (body.deliveryType !== undefined) next.deliveryType = body.deliveryType;
    if (body.feeding !== undefined) next.feeding = body.feeding;
    if (body.restrictions !== undefined) next.restrictions = Array.isArray(body.restrictions) ? [...new Set(body.restrictions)] : [];
    if (body.taste !== undefined) next.taste = body.taste;
    if (body.calorieGoal !== undefined) {
      const goal = Number(body.calorieGoal);
      if (!Number.isFinite(goal) || goal < 1500 || goal > 3200) fail(400, '热量目标需在 1500-3200 kcal 之间');
      next.calorieGoal = Math.round(goal);
    }
    if (body.slots !== undefined) next.slots = Array.isArray(body.slots) && body.slots.length ? body.slots : [...data.DEFAULT_SLOTS];
    if (body.onboarded !== undefined) next.onboarded = Boolean(body.onboarded);
    return next;
  }

  async function handle(path, options, token) {
    const method = String((options && options.method) || 'GET').toUpperCase();
    const rawPath = String(path || '');
    const queryIndex = rawPath.indexOf('?');
    const pathname = queryIndex >= 0 ? rawPath.slice(0, queryIndex) : rawPath;
    const params = new URLSearchParams(queryIndex >= 0 ? rawPath.slice(queryIndex + 1) : '');
    const body = (options && options.body) || {};
    const db = loadDb();

    if (pathname === '/health') return { ok: true, time: now() };

    if (pathname === '/meta') {
      const methods = [...new Set(RECIPES.map((r) => r.method))];
      return {
        stages: data.STAGES,
        slots: data.SLOTS,
        courses: Object.entries(data.COURSES).map(([key, value]) => ({ key, ...value })),
        restrictions: data.RESTRICTIONS.map((r) => ({ key: r.key, label: r.label })),
        tastes: data.TASTES,
        deliveryTypes: data.DELIVERY_TYPES,
        feedings: data.FEEDINGS,
        caloriePresets: data.CALORIE_PRESETS,
        effects: data.EFFECT_GROUPS,
        collections: data.COLLECTIONS,
        methods,
        logOptions: data.LOG_OPTIONS,
        ingredientCategories: utils.INGREDIENT_CATEGORIES,
        recipeCount: RECIPES.filter((r) => r.available !== false).length,
        articleCount: ARTICLES.filter((a) => a.available !== false).length,
        demo: { username: 'demo', password: 'demo123456' }
      };
    }

    if (pathname === '/auth/register' && method === 'POST') {
      const username = String(body.username || '').trim();
      const password = String(body.password || '');
      const name = String(body.name || '').trim();
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) fail(400, '账号需为 3-20 位字母、数字或下划线');
      if (password.length < 6) fail(400, '密码至少 6 位');
      if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) fail(409, '该账号已被注册');
      const user = createUser({ username, password, name: name || '宝妈' });
      if (body.date && planner.isValidDate(body.date)) user.profile.deliveryDate = body.date;
      db.users.push(user);
      saveDb(db);
      const payload = authPayload(user, planner.isValidDate(body.date) ? body.date : todayStr());
      payload.token = user.id;
      return payload;
    }

    if (pathname === '/auth/login' && method === 'POST') {
      const username = String(body.username || '').trim().toLowerCase();
      const password = String(body.password || '');
      const user = db.users.find((u) => u.username.toLowerCase() === username);
      if (!user || user.hash !== hashPassword(password, user.salt)) fail(401, '账号或密码不正确', 'INVALID_CREDENTIALS');
      if (user.disabled) fail(403, '该账号已被停用，请联系管理员', 'ACCOUNT_DISABLED');
      user.lastLoginAt = now();
      saveDb(db);
      const payload = authPayload(user, planner.isValidDate(body.date) ? body.date : todayStr());
      payload.token = user.id;
      return payload;
    }

    if (pathname === '/auth/me' && method === 'GET') {
      const user = requireUser(db, token);
      const payload = authPayload(user, dateParam(params));
      delete payload.token;
      return payload;
    }

    if (pathname === '/auth/password' && method === 'POST') {
      const user = requireUser(db, token);
      if (user.hash !== hashPassword(String(body.oldPassword || ''), user.salt)) fail(400, '原密码不正确');
      const next = String(body.newPassword || '');
      if (next.length < 6) fail(400, '新密码至少 6 位');
      if (next === String(body.oldPassword || '')) fail(400, '新密码不能与原密码相同');
      user.salt = makeSalt();
      user.hash = hashPassword(next, user.salt);
      user.updatedAt = now();
      saveDb(db);
      return { ok: true };
    }

    if (pathname === '/profile' && method === 'GET') {
      const user = requireUser(db, token);
      const date = dateParam(params);
      return {
        user: publicUser(user),
        profile: user.profile,
        stage: planner.stagePayload(user.profile.deliveryDate, date),
        plan: planner.planOverview(user.plan, user.eaten, user.skipped),
        stats: planner.computeStats(user, date),
        favorites: user.favorites,
        cooked: user.cooked,
        recipeNotes: user.recipeNotes
      };
    }

    if (pathname === '/profile' && method === 'PUT') {
      const user = requireUser(db, token);
      const before = user.profile;
      const next = applyProfileUpdates(before, body);
      const needsRegenerate = Boolean(user.plan) &&
        (next.deliveryDate !== before.deliveryDate ||
          next.feeding !== before.feeding ||
          JSON.stringify(next.restrictions) !== JSON.stringify(before.restrictions) ||
          JSON.stringify(next.slots) !== JSON.stringify(before.slots));
      user.profile = next;
      if (next.name) user.name = next.name;
      user.updatedAt = now();
      saveDb(db);
      return {
        profile: user.profile,
        stage: planner.stagePayload(user.profile.deliveryDate, todayStr()),
        needsRegenerate,
        plan: planner.planOverview(user.plan, user.eaten)
      };
    }

    if (pathname === '/plan' && method === 'GET') {
      const user = requireUser(db, token);
      return planResponse(db, user, dateParam(params));
    }

    if (pathname === '/plan/generate' && method === 'POST') {
      const user = requireUser(db, token);
      const startDate = planner.isValidDate(body.startDate) ? body.startDate : todayStr();
      const days = Number(body.days) || 7;
      if (days < 1 || days > 28) fail(400, '餐单天数需在 1-28 天之间');
      user.plan = planner.generatePlan(user.profile, startDate, days);
      user.eaten = {};
      user.skipped = {};
      user.groceryChecks = {};
      saveDb(db);
      return planResponse(db, user, startDate);
    }

    if (pathname === '/plan/swap' && method === 'POST') {
      const user = requireUser(db, token);
      const date = String(body.date || '');
      if (!planner.isValidDate(date)) fail(400, '日期不正确');
      const result = planner.swapDish(user.plan, user.profile, date, String(body.slot || ''), String(body.course || ''), user.eaten, user.skipped);
      if (result.error) fail(400, result.error);
      saveDb(db);
      return { day: decorateDay(user, date), plan: planner.planOverview(user.plan, user.eaten, user.skipped), stats: planner.computeStats(user, todayStr()) };
    }

    if (pathname === '/plan/eat' && method === 'POST') {
      const user = requireUser(db, token);
      const date = String(body.date || '');
      const slot = String(body.slot || '');
      if (!planner.isValidDate(date)) fail(400, '日期不正确');
      if (!user.plan || !user.plan.items || !user.plan.items[date] || !user.plan.items[date][slot]) fail(400, '这一餐还没有安排');
      const set = new Set(Array.isArray(user.eaten[date]) ? user.eaten[date] : []);
      if (body.eaten === false) set.delete(slot); else set.add(slot);
      user.eaten[date] = [...set];
      if (user.skipped[date]) user.skipped[date] = user.skipped[date].filter((s) => s !== slot);
      saveDb(db);
      return { day: decorateDay(user, date), plan: planner.planOverview(user.plan, user.eaten, user.skipped), stats: planner.computeStats(user, todayStr()) };
    }

    if (pathname === '/plan/skip' && method === 'POST') {
      const user = requireUser(db, token);
      const date = String(body.date || '');
      const slot = String(body.slot || '');
      if (!planner.isValidDate(date)) fail(400, '日期不正确');
      if (!user.plan || !user.plan.items || !user.plan.items[date] || !user.plan.items[date][slot]) fail(400, '这一餐还没有安排');
      const set = new Set(Array.isArray(user.skipped[date]) ? user.skipped[date] : []);
      if (body.skipped === false) set.delete(slot); else set.add(slot);
      user.skipped[date] = [...set];
      if (body.skipped !== false) user.eaten[date] = (Array.isArray(user.eaten[date]) ? user.eaten[date] : []).filter((s) => s !== slot);
      saveDb(db);
      return { day: decorateDay(user, date), plan: planner.planOverview(user.plan, user.eaten, user.skipped), stats: planner.computeStats(user, todayStr()) };
    }

    if (pathname === '/plan/apply' && method === 'POST') {
      const user = requireUser(db, token);
      const date = String(body.date || '');
      if (!planner.isValidDate(date)) fail(400, '日期不正确');
      const target = RECIPE_MAP.get(String(body.recipeId || ''));
      if (target && target.custom && target.customOwnerId !== user.id) fail(404, '没有找到这道菜', 'NOT_FOUND');
      const result = planner.applyRecipe(user.plan, user.profile, date, String(body.slot || ''), String(body.course || ''), String(body.recipeId || ''), user.eaten, user.skipped);
      if (result.error) fail(400, result.error);
      user.groceryChecks = {};
      saveDb(db);
      return { day: decorateDay(user, date), plan: planner.planOverview(user.plan, user.eaten, user.skipped), stats: planner.computeStats(user, todayStr()) };
    }

    if (pathname === '/recipes' && method === 'GET') {
      const user = findUserByToken(db, token);
      const ownCustom = user ? (user.customRecipes || []).filter((r) => r && !r.deleted) : [];
      let list = ownCustom.length ? [...RECIPES, ...ownCustom] : RECIPES.slice();
      list = list.filter((r) => r.available !== false);
      const course = params.get('course');
      const stage = Number(params.get('stage'));
      const slot = params.get('slot');
      const methodName = params.get('method');
      const maxTime = Number(params.get('maxTime'));
      const minKcal = Number(params.get('minKcal'));
      const maxKcal = Number(params.get('maxKcal'));
      const vegetarian = params.get('vegetarian');
      const q = String(params.get('q') || '').trim().toLowerCase();
      const ids = params.get('ids');
      if (ids) {
        const wanted = new Set(ids.split(',').map((s) => s.trim()));
        list = list.filter((r) => wanted.has(r.id));
      }
      if (course) list = list.filter((r) => r.course === course);
      if (stage) list = list.filter((r) => r.stages.includes(stage));
      if (slot) list = list.filter((r) => r.slots.includes(slot));
      if (methodName) list = list.filter((r) => r.method === methodName);
      if (Number.isFinite(maxTime) && maxTime > 0) list = list.filter((r) => r.time <= maxTime);
      if (Number.isFinite(minKcal) && minKcal > 0) list = list.filter((r) => r.kcal >= minKcal);
      if (Number.isFinite(maxKcal) && maxKcal > 0) list = list.filter((r) => r.kcal <= maxKcal);
      if (vegetarian === '1') list = list.filter((r) => r.vegetarian);
      if (q) list = list.filter((r) => String(r.searchText || '').toLowerCase().includes(q));
      return { total: list.length, customCount: ownCustom.length, recipes: list.map(planner.publicRecipe) };
    }

    if (pathname === '/favorites' && method === 'GET') {
      const user = requireUser(db, token);
      const recipes = user.favorites.map((id) => RECIPE_MAP.get(id)).filter(Boolean).map(planner.publicRecipe);
      return { total: recipes.length, recipes };
    }

    if (pathname === '/recipes/custom' && method === 'POST') {
      const user = requireUser(db, token);
      const recipe = buildCustomRecipe(user, body);
      user.customRecipes.unshift(recipe);
      RECIPE_MAP.set(recipe.id, recipe);
      user.updatedAt = now();
      saveDb(db);
      return { recipe: planner.publicRecipe(recipe), customCount: user.customRecipes.length };
    }

    const customMatch = pathname.match(/^\/recipes\/custom\/([\w-]+)$/);
    if (customMatch && (method === 'PUT' || method === 'DELETE')) {
      const user = requireUser(db, token);
      const id = customMatch[1];
      const index = user.customRecipes.findIndex((r) => r.id === id);
      if (index < 0) fail(404, '没有找到这道自制食谱', 'NOT_FOUND');
      if (method === 'PUT') {
        const recipe = buildCustomRecipe(user, body, user.customRecipes[index]);
        user.customRecipes[index] = recipe;
        RECIPE_MAP.set(recipe.id, recipe);
        saveDb(db);
        return { recipe: planner.publicRecipe(recipe), customCount: user.customRecipes.length };
      }
      if (recipeUsedInPlan(user, id)) fail(400, '这道菜还在当前餐单中，请先换掉再删除');
      user.customRecipes.splice(index, 1);
      user.favorites = user.favorites.filter((fid) => fid !== id);
      user.cooked = user.cooked.filter((cid) => cid !== id);
      if (user.recipeNotes) delete user.recipeNotes[id];
      RECIPE_MAP.delete(id);
      saveDb(db);
      return { ok: true, customCount: user.customRecipes.length };
    }

    const cookMatch = pathname.match(/^\/recipes\/([\w-]+)\/cook$/);
    if (cookMatch && method === 'POST') {
      const user = requireUser(db, token);
      const id = cookMatch[1];
      const recipe = RECIPE_MAP.get(id);
      if (!recipe || recipe.available === false) fail(404, '没有找到这道菜', 'NOT_FOUND');
      if (recipe.custom && recipe.customOwnerId !== user.id) fail(404, '没有找到这道菜', 'NOT_FOUND');
      const index = user.cooked.indexOf(id);
      let isCooked;
      if (index >= 0) { user.cooked.splice(index, 1); isCooked = false; }
      else { user.cooked.unshift(id); isCooked = true; }
      saveDb(db);
      return { isCooked, cooked: user.cooked, stats: planner.computeStats(user, todayStr()) };
    }

    const noteMatch = pathname.match(/^\/recipes\/([\w-]+)\/note$/);
    if (noteMatch && method === 'PUT') {
      const user = requireUser(db, token);
      const id = noteMatch[1];
      const recipe = RECIPE_MAP.get(id);
      if (!recipe || recipe.available === false) fail(404, '没有找到这道菜', 'NOT_FOUND');
      if (recipe.custom && recipe.customOwnerId !== user.id) fail(404, '没有找到这道菜', 'NOT_FOUND');
      const note = String(body.note || '').trim();
      if (note.length > 300) fail(400, '笔记最多 300 字');
      if (note) user.recipeNotes[id] = note; else delete user.recipeNotes[id];
      saveDb(db);
      return { id, note };
    }

    const favoriteMatch = pathname.match(/^\/recipes\/([\w-]+)\/favorite$/);
    if (favoriteMatch && method === 'POST') {
      const user = requireUser(db, token);
      const id = favoriteMatch[1];
      const recipe = RECIPE_MAP.get(id);
      if (!recipe || recipe.available === false) fail(404, '没有找到这道菜', 'NOT_FOUND');
      if (recipe.custom && recipe.customOwnerId !== user.id) fail(404, '没有找到这道菜', 'NOT_FOUND');
      const index = user.favorites.indexOf(id);
      let favorited;
      if (index >= 0) { user.favorites.splice(index, 1); favorited = false; }
      else { user.favorites.unshift(id); favorited = true; }
      saveDb(db);
      return { favorited, favorites: user.favorites };
    }

    const recipeMatch = pathname.match(/^\/recipes\/([\w-]+)$/);
    if (recipeMatch && method === 'GET') {
      const user = findUserByToken(db, token);
      const id = recipeMatch[1];
      const recipe = RECIPE_MAP.get(id);
      if (!recipe || recipe.available === false) fail(404, '没有找到这道菜', 'NOT_FOUND');
      if (recipe.custom && (!user || recipe.customOwnerId !== user.id)) fail(404, '没有找到这道菜', 'NOT_FOUND');
      const pool = user && recipe.custom ? [...RECIPES, ...(user.customRecipes || [])] : RECIPES;
      const similar = pool
        .filter((r) => r.id !== id && r.available !== false && r.course === recipe.course)
        .slice(0, 3)
        .map((r) => ({ id: r.id, name: r.name, image: r.image, kcal: r.kcal, time: r.time }));
      return {
        recipe: planner.publicRecipe(recipe),
        similar,
        cooked: Boolean(user && user.cooked.includes(id)),
        note: (user && user.recipeNotes && user.recipeNotes[id]) || ''
      };
    }

    if (pathname === '/logs' && method === 'GET') {
      const user = requireUser(db, token);
      let days = Number(params.get('days'));
      if (!days || days < 1 || days > 120) days = 42;
      let start = params.get('start');
      if (!planner.isValidDate(start)) start = planner.addDays(todayStr(), -(days - 1));
      const logs = [];
      for (let i = 0; i < days; i += 1) {
        const date = planner.addDays(start, i);
        if (user.logs[date]) logs.push({ date, ...user.logs[date] });
      }
      return { startDate: start, days, logs };
    }

    const logMatch = pathname.match(/^\/logs\/(\d{4}-\d{2}-\d{2})$/);
    if (logMatch && method === 'PUT') {
      const user = requireUser(db, token);
      const date = logMatch[1];
      if (!planner.isValidDate(date)) fail(400, '日期不正确');
      const patch = {};
      for (const key of ['weight', 'temperature', 'systolic', 'diastolic', 'waterMl', 'sleepHours', 'activityMinutes', 'mood', 'sleepQuality', 'lochia', 'lochiaColor', 'lochiaOdor', 'wound', 'breast', 'pain', 'fatigue', 'bowel', 'supplements', 'note']) {
        if (body[key] !== undefined) patch[key] = body[key];
      }
      if (patch.note !== undefined) patch.note = String(patch.note || '').trim().slice(0, 300);
      const current = { ...(user.logs[date] || {}), ...patch };
      for (const key of Object.keys(current)) {
        if (current[key] === null || current[key] === '' || current[key] === undefined) delete current[key];
      }
      if (Object.keys(current).length) user.logs[date] = current; else delete user.logs[date];
      saveDb(db);
      return { date, log: user.logs[date] || null, stats: planner.computeStats(user, todayStr()) };
    }

    if (pathname === '/grocery' && method === 'GET') {
      const user = requireUser(db, token);
      const view = String(params.get('view') || 'week');
      let start = params.get('start');
      let days = Number(params.get('days'));
      if (!planner.isValidDate(start)) start = (user.plan && user.plan.startDate) || todayStr();
      if (!days || days < 1 || days > 28) days = view === 'day' ? 1 : (user.plan && user.plan.days) || 7;
      const grocery = planner.aggregateGrocery(user.plan, start, days, user.groceryChecks || {});
      return { ...grocery, hasPlan: Boolean(user.plan) };
    }

    if (pathname === '/grocery/toggle' && method === 'POST') {
      const user = requireUser(db, token);
      const key = String(body.key || '');
      if (!key) fail(400, '清单项目不正确');
      if (user.groceryChecks[key]) delete user.groceryChecks[key]; else user.groceryChecks[key] = true;
      saveDb(db);
      return { key, checked: Boolean(user.groceryChecks[key]) };
    }

    if (pathname === '/grocery/clear' && method === 'POST') {
      const user = requireUser(db, token);
      user.groceryChecks = {};
      saveDb(db);
      return { ok: true };
    }

    if (pathname === '/stats' && method === 'GET') {
      const user = requireUser(db, token);
      return { stats: planner.computeStats(user, dateParam(params)), plan: planner.planOverview(user.plan, user.eaten, user.skipped) };
    }

    if (pathname === '/export' && method === 'GET') {
      const user = requireUser(db, token);
      return {
        app: 'nuanyue-static',
        version: 1,
        exportedAt: now(),
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
      };
    }

    if (pathname === '/articles' && method === 'GET') {
      const list = ARTICLES.filter((a) => a.available !== false);
      return {
        total: list.length,
        articles: list.map((a) => ({ id: a.id, title: a.title, summary: a.summary, minutes: a.minutes, tag: a.tag }))
      };
    }

    const articleMatch = pathname.match(/^\/articles\/([\w-]+)$/);
    if (articleMatch && method === 'GET') {
      const article = ARTICLE_MAP.get(articleMatch[1]);
      if (!article || article.available === false) fail(404, '没有找到这篇文章', 'NOT_FOUND');
      return { article };
    }

    // ------------------------- 管理后台 -------------------------

    if (pathname === '/admin/overview' && method === 'GET') {
      requireAdmin(db, token);
      return overview(db);
    }

    if (pathname === '/admin/backup' && method === 'GET') {
      requireAdmin(db, token);
      // 深拷贝，避免调用方持有运行时数据引用导致备份内容被后续修改影响。
      const snapshot = JSON.parse(JSON.stringify({ users: db.users, content: db.content }));
      return {
        app: 'nuanyue-static',
        kind: 'admin-backup',
        version: 1,
        exportedAt: now(),
        db: snapshot
      };
    }

    if (pathname === '/admin/restore' && method === 'POST') {
      const me = requireAdmin(db, token);
      const snapshot = body && body.db ? body.db : body;
      if (!snapshot || !Array.isArray(snapshot.users) || !snapshot.content || typeof snapshot.content !== 'object') {
        fail(400, '备份文件格式不正确，请选择由本后台导出的 JSON 文件');
      }
      const nextUsers = [];
      const seenIds = new Set();
      for (const raw of snapshot.users) {
        if (!raw || typeof raw !== 'object' || !raw.id || !raw.username) continue;
        if (seenIds.has(raw.id)) continue;
        seenIds.add(raw.id);
        const user = ensureUser(raw);
        if (!user.profile || typeof user.profile !== 'object') {
          user.profile = defaultProfile(user.name || user.username);
        }
        nextUsers.push(user);
      }
      if (!nextUsers.length) fail(400, '备份中没有可用的账号数据');
      let self = nextUsers.find((u) => u.id === me.id) ||
        nextUsers.find((u) => String(u.username).toLowerCase() === String(me.username).toLowerCase());
      if (!self) {
        self = ensureUser(me);
        nextUsers.push(self);
      }
      self.role = 'admin';
      self.disabled = false;
      const source = snapshot.content;
      memoryDb = {
        version: 1,
        users: nextUsers,
        content: {
          recipes: Array.isArray(source.recipes) ? source.recipes.filter((r) => r && r.id) : [],
          articles: Array.isArray(source.articles) ? source.articles.filter((a) => a && a.id) : [],
          recipeOverrides: source.recipeOverrides && typeof source.recipeOverrides === 'object' ? source.recipeOverrides : {},
          articleOverrides: source.articleOverrides && typeof source.articleOverrides === 'object' ? source.articleOverrides : {}
        }
      };
      rebuildRuntime(memoryDb);
      saveDb(memoryDb);
      return { ok: true, token: self.id, users: nextUsers.length };
    }

    if (pathname === '/admin/recipes' && method === 'GET') {
      requireAdmin(db, token);
      const q = String(params.get('q') || '').trim().toLowerCase();
      const course = String(params.get('course') || '');
      const status = String(params.get('status') || '');
      let list = RECIPES.slice();
      if (course) list = list.filter((r) => r.course === course);
      if (status === 'available') list = list.filter((r) => r.available !== false);
      if (status === 'hidden') list = list.filter((r) => r.available === false);
      if (q) list = list.filter((r) => [r.name, r.id, ...(r.tags || []), ...(r.ingredients || []).map((i) => i[0])].join(' ').toLowerCase().includes(q));
      return { total: list.length, images: IMAGE_OPTIONS, recipes: list.map(adminRecipeView) };
    }

    if (pathname === '/admin/recipes' && method === 'POST') {
      requireAdmin(db, token);
      const payload = buildAdminRecipe(body);
      const recipe = normalizeRecipe({ ...payload, id: uid('a'), admin: true, custom: false, createdAt: now() });
      db.content.recipes.push(recipe);
      rebuildRuntime(db);
      saveDb(db);
      return { recipe: adminRecipeView(RECIPE_MAP.get(recipe.id)) };
    }

    const adminRecipeMatch = pathname.match(/^\/admin\/recipes\/([\w-]+)$/);
    if (adminRecipeMatch && (method === 'PUT' || method === 'DELETE')) {
      requireAdmin(db, token);
      const id = adminRecipeMatch[1];
      const existing = RECIPE_MAP.get(id);
      if (!existing) fail(404, '菜品不存在', 'NOT_FOUND');
      if (method === 'PUT') {
        const payload = buildAdminRecipe(body, existing);
        const recipe = normalizeRecipe({ ...existing, ...payload, id, admin: Boolean(existing.admin), custom: Boolean(existing.custom), customOwnerId: existing.customOwnerId });
        const adminIndex = db.content.recipes.findIndex((r) => r.id === id);
        if (adminIndex >= 0) db.content.recipes[adminIndex] = recipe;
        else if (existing.admin) db.content.recipes.push(recipe);
        else db.content.recipeOverrides[id] = recipe;
        rebuildRuntime(db);
        saveDb(db);
        return { recipe: adminRecipeView(RECIPE_MAP.get(id)) };
      }
      if (!existing.admin) fail(400, '内置菜品不支持删除，请使用下架');
      const index = db.content.recipes.findIndex((r) => r.id === id);
      if (index >= 0) db.content.recipes.splice(index, 1);
      for (const user of db.users) {
        user.favorites = (user.favorites || []).filter((fid) => fid !== id);
        user.cooked = (user.cooked || []).filter((cid) => cid !== id);
        if (user.recipeNotes) delete user.recipeNotes[id];
      }
      rebuildRuntime(db);
      saveDb(db);
      return { ok: true };
    }

    const adminRecipeStatusMatch = pathname.match(/^\/admin\/recipes\/([\w-]+)\/status$/);
    if (adminRecipeStatusMatch && method === 'PATCH') {
      requireAdmin(db, token);
      const id = adminRecipeStatusMatch[1];
      const existing = RECIPE_MAP.get(id);
      if (!existing) fail(404, '菜品不存在', 'NOT_FOUND');
      const recipe = normalizeRecipe({ ...existing, available: Boolean(body.available), id, admin: Boolean(existing.admin) });
      const adminIndex = db.content.recipes.findIndex((r) => r.id === id);
      if (adminIndex >= 0) db.content.recipes[adminIndex] = recipe;
      else if (existing.admin) db.content.recipes.push(recipe);
      else db.content.recipeOverrides[id] = recipe;
      rebuildRuntime(db);
      saveDb(db);
      return { recipe: adminRecipeView(RECIPE_MAP.get(id)) };
    }

    if (pathname === '/admin/articles' && method === 'GET') {
      requireAdmin(db, token);
      return { total: ARTICLES.length, articles: ARTICLES.map(adminArticleView) };
    }

    if (pathname === '/admin/articles' && method === 'POST') {
      requireAdmin(db, token);
      const article = normalizeArticle({ ...buildAdminArticle(body), id: uid('na'), admin: true });
      db.content.articles.push(article);
      rebuildRuntime(db);
      saveDb(db);
      return { article: adminArticleView(ARTICLE_MAP.get(article.id)) };
    }

    const adminArticleMatch = pathname.match(/^\/admin\/articles\/([\w-]+)$/);
    if (adminArticleMatch && (method === 'PUT' || method === 'DELETE')) {
      requireAdmin(db, token);
      const id = adminArticleMatch[1];
      const existing = ARTICLE_MAP.get(id);
      if (!existing) fail(404, '文章不存在', 'NOT_FOUND');
      if (method === 'PUT') {
        const article = normalizeArticle({ ...existing, ...buildAdminArticle(body, existing), id, admin: Boolean(existing.admin) });
        const adminIndex = db.content.articles.findIndex((a) => a.id === id);
        if (adminIndex >= 0) db.content.articles[adminIndex] = article;
        else if (existing.admin) db.content.articles.push(article);
        else db.content.articleOverrides[id] = article;
        rebuildRuntime(db);
        saveDb(db);
        return { article: adminArticleView(ARTICLE_MAP.get(id)) };
      }
      if (!existing.admin) fail(400, '内置文章不支持删除，请使用下架');
      const index = db.content.articles.findIndex((a) => a.id === id);
      if (index >= 0) db.content.articles.splice(index, 1);
      rebuildRuntime(db);
      saveDb(db);
      return { ok: true };
    }

    const adminArticleStatusMatch = pathname.match(/^\/admin\/articles\/([\w-]+)\/status$/);
    if (adminArticleStatusMatch && method === 'PATCH') {
      requireAdmin(db, token);
      const id = adminArticleStatusMatch[1];
      const existing = ARTICLE_MAP.get(id);
      if (!existing) fail(404, '文章不存在', 'NOT_FOUND');
      const article = normalizeArticle({ ...existing, available: Boolean(body.available), id, admin: Boolean(existing.admin) });
      const adminIndex = db.content.articles.findIndex((a) => a.id === id);
      if (adminIndex >= 0) db.content.articles[adminIndex] = article;
      else if (existing.admin) db.content.articles.push(article);
      else db.content.articleOverrides[id] = article;
      rebuildRuntime(db);
      saveDb(db);
      return { article: adminArticleView(ARTICLE_MAP.get(id)) };
    }

    if (pathname === '/admin/articles/fetch' && method === 'POST') {
      requireAdmin(db, token);
      const url = String(body.url || '').trim();
      if (!url) fail(400, '请先粘贴文章链接');
      const encoded = encodeURIComponent(url);
      const sources = [
        url,
        `https://api.allorigins.win/raw?url=${encoded}`,
        `https://api.codetabs.com/v1/proxy?quest=${encoded}`
      ];
      let html = '';
      for (const source of sources) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        try {
          const response = await fetch(source, { mode: 'cors', signal: controller.signal });
          if (!response.ok) continue;
          const text = await response.text();
          if (text && text.length >= 300) {
            html = text;
            break;
          }
        } catch {
          /* 尝试下一个抓取通道 */
        } finally {
          clearTimeout(timer);
        }
      }
      if (!html) {
        const helper = (
          localStorage.getItem('nuanyue_fetch_helper') ||
          'https://37lq1tfihyzcugo02dp.traesite.cn/api/fetch-article'
        ).trim();
        if (helper) {
          try {
            const response = await fetch(helper, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url })
            });
            if (response.ok) {
              const data = await response.json();
              if (data && data.article) return { article: data.article };
            }
          } catch {
            /* 抓取服务不可用时走手动粘贴 */
          }
        }
        fail(400, '抓取失败。该网站可能限制浏览器跨域访问，请复制正文粘贴到「正文」框后直接发布');
      }
      try {
        return { article: parseArticleHtml(html, url) };
      } catch (err) {
        fail(400, err.message || '未能识别正文，请手动粘贴');
      }
    }

    if (pathname === '/admin/upload' && method === 'POST') {
      requireAdmin(db, token);
      const url = await compressImage(String(body.dataUrl || ''));
      return { url, size: url.length };
    }

    if (pathname === '/admin/users' && method === 'GET') {
      requireAdmin(db, token);
      const users = db.users.slice().sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))).map(adminUserView);
      return { total: users.length, users };
    }

    const adminUserMatch = pathname.match(/^\/admin\/users\/([\w-]+)$/);
    if (adminUserMatch && ['GET', 'PATCH', 'DELETE'].includes(method)) {
      const me = requireAdmin(db, token);
      const id = adminUserMatch[1];
      const user = db.users.find((u) => u.id === id);
      if (!user) fail(404, '用户不存在', 'NOT_FOUND');
      if (method === 'GET') {
        const recentLogs = [];
        for (let i = 0; i < 14; i += 1) {
          const date = planner.addDays(todayStr(), -i);
          if (user.logs[date]) recentLogs.push({ date, ...user.logs[date] });
        }
        return {
          user: adminUserView(user),
          recentLogs,
          favorites: (user.favorites || []).map((fid) => RECIPE_MAP.get(fid)).filter(Boolean).map((r) => ({ id: r.id, name: r.name })),
          cooked: (user.cooked || []).map((cid) => RECIPE_MAP.get(cid)).filter(Boolean).map((r) => ({ id: r.id, name: r.name }))
        };
      }
      if (method === 'PATCH') {
        const activeAdmins = db.users.filter((u) => u.role === 'admin' && !u.disabled && u.id !== id).length;
        if (body.role !== undefined) {
          if (!['admin', 'user'].includes(body.role)) fail(400, '角色不正确');
          if (id === me.id && body.role !== 'admin') fail(400, '不能取消自己的管理员权限');
          if (user.role === 'admin' && body.role === 'user' && activeAdmins === 0) fail(400, '至少保留一名可用管理员');
          user.role = body.role;
        }
        if (body.disabled !== undefined) {
          if (id === me.id && body.disabled) fail(400, '不能停用当前登录的账号');
          if (body.disabled && user.role === 'admin' && activeAdmins === 0) fail(400, '至少保留一名可用管理员');
          user.disabled = Boolean(body.disabled);
        }
        if (body.name !== undefined) {
          const name = String(body.name).trim();
          if (!name || name.length > 20) fail(400, '称呼需为 1-20 个字符');
          user.name = name;
          if (user.profile) user.profile.name = name;
        }
        if (body.resetPassword !== undefined) {
          const password = String(body.resetPassword || '');
          if (password.length < 6) fail(400, '新密码至少 6 位');
          user.salt = makeSalt();
          user.hash = hashPassword(password, user.salt);
        }
        user.updatedAt = now();
        saveDb(db);
        return { user: adminUserView(user) };
      }
      if (id === me.id) fail(400, '不能删除当前登录的账号');
      if (user.role === 'admin' && db.users.filter((u) => u.role === 'admin' && !u.disabled).length <= 1) fail(400, '至少保留一名可用管理员');
      const index = db.users.findIndex((u) => u.id === id);
      db.users.splice(index, 1);
      for (const recipe of user.customRecipes || []) RECIPE_MAP.delete(recipe.id);
      saveDb(db);
      return { ok: true };
    }

    fail(404, '接口不存在', 'NOT_FOUND');
  }

  window.__NUANYUE_API__ = function (path, options, token) {
    return handle(path, options, token).catch((err) => {
      if (err && err.status) throw err;
      console.error('[static-api]', path, err);
      const wrapped = new Error(err && err.message ? err.message : '操作失败，请稍后再试');
      wrapped.status = 500;
      throw wrapped;
    });
  };

  loadDb();
})();
