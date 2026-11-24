'use strict';

const { RECIPES, RECIPE_MAP } = require('./data/recipes');
const { SLOTS, DEFAULT_SLOTS, restrictionTerms, stageInfo } = require('./data/meta');

const DAY_MS = 86400000;
const CATEGORY_ORDER = ['谷物豆类', '肉禽蛋', '水产', '豆制品', '蔬菜', '水果', '奶制品', '干货药材', '调味料', '其他'];

const SLOT_MAP = new Map(SLOTS.map((s) => [s.key, s]));

function toUTC(dateStr) {
  return new Date(`${dateStr}T00:00:00Z`);
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function isValidDate(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(str || ''))) return false;
  const d = toUTC(str);
  return !Number.isNaN(d.getTime()) && fmtDate(d) === str;
}

function addDays(dateStr, n) {
  return fmtDate(new Date(toUTC(dateStr).getTime() + n * DAY_MS));
}

function diffDays(from, to) {
  return Math.round((toUTC(to).getTime() - toUTC(from).getTime()) / DAY_MS);
}

function weekdayLabel(dateStr) {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][toUTC(dateStr).getUTCDay()];
}

function postpartumDay(deliveryDate, date) {
  if (!isValidDate(deliveryDate)) return 1;
  return Math.max(1, diffDays(deliveryDate, date) + 1);
}

function stageForDate(deliveryDate, date) {
  const day = postpartumDay(deliveryDate, date);
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 28) return 3;
  return 4;
}

function stagePayload(deliveryDate, date) {
  const day = postpartumDay(deliveryDate, date);
  const info = stageInfo(stageForDate(deliveryDate, date));
  return { ...info, postpartumDay: day, progress: Math.min(1, day / 42) };
}

function buildExclusions(profile) {
  const keys = Array.isArray(profile.restrictions) ? profile.restrictions.slice() : [];
  const terms = restrictionTerms(keys);
  // 母乳喂养额外排除含酒精菜品，更稳妥。
  if (profile.feeding === '纯母乳' || profile.feeding === '混合喂养') {
    if (!terms.includes('醪糟')) terms.push('醪糟');
  }
  return { keys, terms };
}

function isExcluded(recipe, terms) {
  if (!terms.length) return false;
  return terms.some((t) => recipe.searchText.includes(t));
}

function enabledSlots(profile) {
  const list = Array.isArray(profile.slots) && profile.slots.length ? profile.slots : DEFAULT_SLOTS;
  return SLOTS.map((s) => s.key).filter((k) => list.includes(k));
}

function recipePool(course, slot, stage, terms) {
  // 忌口优先：任何情况下都不会放宽忌口条件。
  const allowed = RECIPES.filter((r) => r.course === course && !isExcluded(r, terms));
  if (!allowed.length) return [];
  const tiers = [
    allowed.filter((r) => r.slots.includes(slot) && r.stages.includes(stage)),
    allowed.filter((r) => r.slots.includes(slot)),
    allowed.filter((r) => r.stages.includes(stage)),
    allowed
  ];
  return tiers.find((t) => t.length) || [];
}

function randInt(n) {
  return Math.floor(Math.random() * n);
}

function pickRecipe(pool, ctx) {
  let candidates = pool.filter((r) => r.id !== ctx.currentId);
  if (!candidates.length) candidates = pool;

  if (ctx.avoidProteins && ctx.avoidProteins.size) {
    const varied = candidates.filter((r) => !ctx.avoidProteins.has(r.proteinType));
    if (varied.length) candidates = varied;
  }

  if (ctx.cooldown > 0) {
    const fresh = candidates.filter((r) => {
      const last = ctx.lastUsed[r.id];
      return last === undefined || ctx.dayIndex - last >= ctx.cooldown;
    });
    if (fresh.length) candidates = fresh;
  }

  if (ctx.avoidIds && ctx.avoidIds.size) {
    const notUsed = candidates.filter((r) => !ctx.avoidIds.has(r.id));
    if (notUsed.length) candidates = notUsed;
  }

  // 轻度偏好：使用次数越少权重越高。
  const usage = ctx.usage || {};
  let best = candidates;
  if (candidates.length > 3) {
    const min = Math.min(...candidates.map((r) => usage[r.id] || 0));
    const light = candidates.filter((r) => (usage[r.id] || 0) <= min + 1);
    if (light.length) best = light;
  }
  return best[randInt(best.length)];
}

function generatePlan(profile, startDate, days) {
  const { terms } = buildExclusions(profile);
  const slots = enabledSlots(profile);
  const items = {};
  const lastUsed = {};
  const usage = {};
  const total = Math.max(1, Math.min(28, Number(days) || 7));

  for (let d = 0; d < total; d += 1) {
    const date = addDays(startDate, d);
    const stage = stageForDate(profile.deliveryDate, date);
    const dayItems = {};
    const dayProteins = new Set();
    const dayIds = new Set();

    for (const slot of slots) {
      const slotDef = SLOT_MAP.get(slot);
      if (!slotDef) continue;
      const order = slotDef.courses.slice().sort((a, b) => {
        const rank = { main: 0, soup: 1, staple: 2, veg: 3, snack: 4 };
        return (rank[a] ?? 9) - (rank[b] ?? 9);
      });
      const meal = {};

      for (const course of order) {
        const pool = recipePool(course, slot, stage, terms);
        if (!pool.length) continue;
        const cooldown = { main: 3, soup: 3, veg: 2, snack: 2, staple: 0 }[course] ?? 0;
        const avoidProteins = course === 'main' ? dayProteins : null;
        const recipe = pickRecipe(pool, {
          dayIndex: d,
          cooldown,
          lastUsed,
          usage,
          avoidProteins,
          avoidIds: dayIds
        });
        meal[course] = recipe.id;
        lastUsed[recipe.id] = d;
        usage[recipe.id] = (usage[recipe.id] || 0) + 1;
        dayIds.add(recipe.id);
        if (recipe.proteinType && recipe.proteinType !== 'none' && recipe.proteinType !== 'veg') {
          dayProteins.add(recipe.proteinType);
        }
      }
      dayItems[slot] = meal;
    }
    items[date] = dayItems;
  }

  return {
    startDate,
    days: total,
    items,
    createdAt: new Date().toISOString()
  };
}

function resolveMeal(slot, meal) {
  const slotDef = SLOT_MAP.get(slot);
  if (!slotDef) return null;
  const dishes = [];
  for (const course of slotDef.courses) {
    const id = meal[course];
    const recipe = id ? RECIPE_MAP.get(id) : null;
    if (recipe) dishes.push({ course, recipe: publicRecipe(recipe) });
  }
  if (!dishes.length) return null;
  return {
    slot,
    label: slotDef.label,
    time: slotDef.time,
    dishes,
    kcal: dishes.reduce((s, d) => s + d.recipe.kcal, 0),
    protein: Math.round(dishes.reduce((s, d) => s + d.recipe.protein, 0) * 10) / 10
  };
}

function publicRecipe(r) {
  return {
    id: r.id,
    name: r.name,
    course: r.course,
    slots: r.slots,
    stages: r.stages,
    tags: r.tags,
    kcal: r.kcal,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat,
    time: r.time,
    image: r.image,
    ingredients: r.ingredients,
    steps: r.steps,
    tips: r.tips
  };
}

function resolveDay(plan, date) {
  const dayItems = plan?.items?.[date];
  if (!dayItems) return null;
  const meals = [];
  let kcal = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  for (const slotDef of SLOTS) {
    const meal = dayItems[slotDef.key];
    if (!meal) continue;
    const resolved = resolveMeal(slotDef.key, meal);
    if (!resolved) continue;
    meals.push(resolved);
    kcal += resolved.kcal;
    protein += resolved.dishes.reduce((s, d) => s + d.recipe.protein, 0);
    carbs += resolved.dishes.reduce((s, d) => s + d.recipe.carbs, 0);
    fat += resolved.dishes.reduce((s, d) => s + d.recipe.fat, 0);
  }

  return {
    date,
    meals,
    nutrition: {
      kcal: Math.round(kcal),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10
    }
  };
}

function daySummary(plan, date, eaten) {
  const day = resolveDay(plan, date);
  if (!day) return null;
  const eatenSlots = Array.isArray(eaten?.[date]) ? eaten[date] : [];
  const slotKeys = day.meals.map((m) => m.slot);
  return {
    date,
    weekday: weekdayLabel(date),
    dayOfMonth: Number(date.slice(8, 10)),
    kcal: day.nutrition.kcal,
    mealCount: slotKeys.length,
    eatenCount: slotKeys.filter((s) => eatenSlots.includes(s)).length,
    complete: slotKeys.length > 0 && slotKeys.every((s) => eatenSlots.includes(s))
  };
}

function planDays(plan) {
  if (!plan) return [];
  return Array.from({ length: plan.days }, (_, i) => addDays(plan.startDate, i));
}

function planOverview(plan, eaten) {
  if (!plan) return null;
  return {
    startDate: plan.startDate,
    days: plan.days,
    createdAt: plan.createdAt,
    dayList: planDays(plan).map((d) => daySummary(plan, d, eaten)).filter(Boolean)
  };
}

function swapDish(plan, profile, date, slot, course, eaten) {
  if (!plan || !plan.items?.[date]) return { error: '该日期没有餐单' };
  const slotDef = SLOT_MAP.get(slot);
  if (!slotDef || !slotDef.courses.includes(course)) return { error: '餐次或品类不正确' };
  const meal = plan.items[date][slot];
  if (!meal || !meal[course]) return { error: '这一餐还没有安排' };

  const { terms } = buildExclusions(profile);
  const stage = stageForDate(profile.deliveryDate, date);
  const pool = recipePool(course, slot, stage, terms);
  if (pool.length <= 1) return { error: '忌口条件下暂时没有可以替换的菜品' };

  const startIndex = diffDays(plan.startDate, date);
  const avoidIds = new Set();
  const dayItems = plan.items[date];
  for (const s of Object.values(dayItems)) {
    for (const id of Object.values(s)) avoidIds.add(id);
  }
  const lastUsed = {};
  const usage = {};
  for (let i = 0; i < plan.days; i += 1) {
    const d = addDays(plan.startDate, i);
    if (i > startIndex || startIndex - i > 4) continue;
    const items = plan.items[d];
    if (!items) continue;
    for (const s of Object.values(items)) {
      for (const id of Object.values(s)) {
        lastUsed[id] = i;
        usage[id] = (usage[id] || 0) + 1;
      }
    }
  }

  const currentId = meal[course];
  const recipe = pickRecipe(pool, {
    dayIndex: startIndex,
    cooldown: course === 'staple' ? 0 : 2,
    lastUsed,
    usage,
    avoidIds,
    currentId
  });

  meal[course] = recipe.id;
  if (eaten?.[date]) {
    eaten[date] = eaten[date].filter((s) => s !== slot);
  }
  return { day: resolveDay(plan, date), recipeId: recipe.id };
}

function formatAmount(amount, unit) {
  if (unit === 'g' && amount >= 1000) return `${Math.round((amount / 1000) * 10) / 10} kg`;
  if (unit === 'ml' && amount >= 1000) return `${Math.round((amount / 1000) * 10) / 10} L`;
  const rounded = Math.round(amount * 10) / 10;
  return `${rounded} ${unit}`;
}

function aggregateGrocery(plan, startDate, days, checks) {
  if (!plan) return { days: 0, groups: [], total: 0, checked: 0 };
  const wanted = Array.from({ length: Math.max(1, Math.min(28, Number(days) || plan.days)) }, (_, i) =>
    addDays(startDate, i)
  ).filter((d) => plan.items?.[d]);

  const map = new Map();
  for (const date of wanted) {
    for (const meal of Object.values(plan.items[date])) {
      for (const id of Object.values(meal)) {
        const recipe = RECIPE_MAP.get(id);
        if (!recipe) continue;
        for (const [name, amount, unit, category] of recipe.ingredients) {
          if (name === '温水' || name === '清水') continue;
          const key = `${category}|${name}|${unit}`;
          if (!map.has(key)) map.set(key, { key, name, unit, category, amount: 0 });
          map.get(key).amount += Number(amount) || 0;
        }
      }
    }
  }

  const groups = CATEGORY_ORDER.map((category) => {
    const list = [...map.values()]
      .filter((i) => i.category === category)
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
    if (!list.length) return null;
    return {
      category,
      items: list.map((i) => ({
        ...i,
        amountText: formatAmount(i.amount, i.unit),
        checked: Boolean(checks?.[i.key])
      }))
    };
  }).filter(Boolean);

  const all = groups.flatMap((g) => g.items);
  return {
    startDate,
    days: wanted.length,
    groups,
    total: all.length,
    checked: all.filter((i) => i.checked).length
  };
}

function computeStats(user, today) {
  const plan = user.plan;
  const favoriteCount = Array.isArray(user.favorites) ? user.favorites.length : 0;
  if (!plan) {
    return { planDays: 0, favoriteCount, eatenMeals: 0, totalMeals: 0, completionRate: 0, streak: 0, plannedToday: false };
  }
  const dates = planDays(plan);
  let totalMeals = 0;
  let eatenMeals = 0;
  let passedMeals = 0;
  let passedEaten = 0;

  for (const date of dates) {
    const day = resolveDay(plan, date);
    if (!day) continue;
    const eaten = new Set(user.eaten?.[date] || []);
    for (const meal of day.meals) {
      totalMeals += 1;
      if (eaten.has(meal.slot)) eatenMeals += 1;
      if (date <= today) {
        passedMeals += 1;
        if (eaten.has(meal.slot)) passedEaten += 1;
      }
    }
  }

  // 连续打卡：从今天（或昨天）往前数，所有餐次都吃完的天数。
  let streak = 0;
  let cursor = dates.includes(today) ? today : addDays(today, -1);
  const dateSet = new Set(dates);
  while (dateSet.has(cursor)) {
    const day = resolveDay(plan, cursor);
    if (!day || !day.meals.length) break;
    const eaten = new Set(user.eaten?.[cursor] || []);
    if (day.meals.every((m) => eaten.has(m.slot))) {
      streak += 1;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }

  return {
    planDays: plan.days,
    favoriteCount,
    eatenMeals,
    totalMeals,
    completionRate: passedMeals ? Math.round((passedEaten / passedMeals) * 100) : 0,
    streak,
    plannedToday: dateSet.has(today)
  };
}

module.exports = {
  todayStr,
  addDays,
  diffDays,
  isValidDate,
  weekdayLabel,
  postpartumDay,
  stageForDate,
  stagePayload,
  buildExclusions,
  isExcluded,
  enabledSlots,
  generatePlan,
  resolveDay,
  planOverview,
  swapDish,
  aggregateGrocery,
  computeStats,
  publicRecipe,
  planDays
};
