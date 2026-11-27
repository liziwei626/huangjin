/* 自动生成：node scripts/build-pages.js */
(function () {
  const factories = {
"data/meta": function(module, exports, require) {
'use strict';

const COURSES = {
  staple: { label: '主食', icon: 'bowl' },
  main: { label: '主菜', icon: 'dish' },
  veg: { label: '蔬菜', icon: 'leaf' },
  soup: { label: '汤羹', icon: 'soup' },
  snack: { label: '加餐', icon: 'cup' }
};

const SLOTS = [
  { key: 'breakfast', label: '早餐', time: '07:00 - 08:00', courses: ['staple', 'main'] },
  { key: 'morningSnack', label: '上午加餐', time: '10:00 - 10:30', courses: ['snack'] },
  { key: 'lunch', label: '午餐', time: '11:30 - 12:30', courses: ['staple', 'main', 'veg', 'soup'] },
  { key: 'afternoonSnack', label: '下午加餐', time: '15:00 - 15:30', courses: ['snack'] },
  { key: 'dinner', label: '晚餐', time: '17:30 - 18:30', courses: ['staple', 'main', 'veg', 'soup'] },
  { key: 'nightSnack', label: '夜宵', time: '21:00 - 21:30', courses: ['snack'] }
];

const DEFAULT_SLOTS = SLOTS.map((s) => s.key);

const STAGES = [
  {
    stage: 1,
    week: '第 1 周',
    days: '产后 1-7 天',
    title: '排恶露 · 温和开胃',
    focus: '饮食清淡易消化，少油少盐，帮助恶露排出与伤口愈合。',
    suggestions: ['小米粥、软烂面条等易消化主食', '鲫鱼豆腐汤、蒸蛋等优质蛋白', '暂时避免大补、油腻与容易胀气的食物']
  },
  {
    stage: 2,
    week: '第 2 周',
    days: '产后 8-14 天',
    title: '修复组织 · 补血养气',
    focus: '增加铁与优质蛋白，修复子宫与伤口，开始温和催乳。',
    suggestions: ['红枣乌鸡汤、菠菜猪肝帮助补铁', '莲藕、花生等温和食材', '少食多餐，主食粗细搭配']
  },
  {
    stage: 3,
    week: '第 3-4 周',
    days: '产后 15-28 天',
    title: '滋补催乳 · 增强体质',
    focus: '在均衡基础上适度滋补，保证乳汁质量，兼顾身材恢复。',
    suggestions: ['鲫鱼、猪蹄等催乳汤品，记得撇去浮油', '每天足量饮水，汤和肉一起吃', '蔬菜水果不可少，预防便秘']
  },
  {
    stage: 4,
    week: '第 5 周起',
    days: '产后 29 天以后',
    title: '恢复元气 · 均衡塑形',
    focus: '逐步回归日常饮食，控制油脂与精制糖，增加膳食纤维。',
    suggestions: ['用杂粮饭替代部分白米饭', '多用清蒸、白灼，少用煎炸', '保持规律运动与充足睡眠']
  }
];

const RESTRICTIONS = [
  { key: 'seafood', label: '海鲜水产', terms: ['鱼', '虾', '蟹', '贝', '海带', '紫菜', '海苔', '海参', '鱿鱼', '蛤蜊', '牡蛎'] },
  { key: 'beef', label: '牛肉', terms: ['牛肉', '牛腩', '牛尾', '牛骨', '牛里脊'] },
  { key: 'mutton', label: '羊肉', terms: ['羊肉', '羊排', '羊骨'] },
  { key: 'pork', label: '猪肉', terms: ['猪肉', '排骨', '猪肝', '猪蹄', '猪腰', '猪里脊', '五花肉', '肉末', '瘦肉'] },
  { key: 'chicken', label: '鸡肉', terms: ['鸡肉', '乌鸡', '鸡胸', '鸡腿', '鸡翅', '鸡爪'] },
  { key: 'egg', label: '鸡蛋', terms: ['鸡蛋', '鹌鹑蛋'] },
  { key: 'dairy', label: '牛奶乳制品', terms: ['牛奶', '酸奶', '奶酪', '淡奶油', '奶粉'] },
  { key: 'peanut', label: '花生', terms: ['花生'] },
  { key: 'nuts', label: '坚果种子', terms: ['核桃', '腰果', '杏仁', '黑芝麻', '白芝麻', '松子', '南瓜子'] },
  { key: 'soy', label: '豆制品', terms: ['豆腐', '豆干', '豆浆', '黄豆', '腐竹', '千张'] },
  { key: 'spicy', label: '辛辣刺激', terms: ['辣椒', '花椒', '胡椒', '豆瓣酱', '咖喱'] },
  { key: 'alcohol', label: '含酒精', terms: ['醪糟', '米酒', '黄酒', '料酒'] },
  {
    key: 'vegetarian',
    label: '素食（不吃肉蛋水产）',
    terms: ['鸡肉', '乌鸡', '鸡胸', '鸡腿', '鸡爪', '猪肉', '排骨', '猪肝', '猪蹄', '猪腰', '猪里脊', '五花肉', '肉末', '瘦肉', '牛肉', '牛腩', '牛尾', '羊肉', '羊排', '鱼', '虾', '蟹', '贝', '鸡蛋', '鹌鹑蛋']
  }
];

const TASTES = ['清淡', '适中', '浓郁'];
const DELIVERY_TYPES = ['顺产', '剖腹产'];
const FEEDINGS = ['纯母乳', '混合喂养', '配方奶'];

const CALORIE_PRESETS = [
  { value: 2400, label: '2400 kcal', desc: '轻盈恢复' },
  { value: 2600, label: '2600 kcal', desc: '均衡日常' },
  { value: 2800, label: '2800 kcal', desc: '母乳喂养' },
  { value: 3000, label: '3000 kcal', desc: '奶量较大' }
];

const EFFECT_GROUPS = [
  { key: 'lactation', label: '催乳', tags: ['催乳'] },
  { key: 'blood', label: '补血补铁', tags: ['补血', '补铁', '补气养血', '补气'] },
  { key: 'protein', label: '高蛋白', tags: ['高蛋白', '优质蛋白', '补蛋白', '植物蛋白'] },
  { key: 'calcium', label: '补钙', tags: ['补钙', '补碘'] },
  { key: 'digest', label: '健脾养胃', tags: ['健脾', '养胃', '易消化'] },
  { key: 'bowel', label: '通便', tags: ['通便', '膳食纤维'] },
  { key: 'swelling', label: '消肿利水', tags: ['消肿', '利水'] },
  { key: 'sleep', label: '安神', tags: ['安神'] },
  { key: 'lowfat', label: '低脂控糖', tags: ['低脂', '控糖', '轻盈'] },
  { key: 'immune', label: '增强免疫', tags: ['增强免疫', '增强体力', '伤口愈合'] }
];

/**
 * 精选合集：把「不知道吃什么」的场景变成一键筛选。
 * match 由前端解释：effect 功效 / course 品类 / slot 餐次 / maxTime 最长用时 /
 * method 烹饪方式 / vegetarian 是否素食。
 */
const COLLECTIONS = [
  {
    key: 'lactation',
    label: '催乳优选',
    desc: '汤水与优质蛋白，给奶量添把劲',
    icon: 'water',
    match: { effect: 'lactation' }
  },
  {
    key: 'blood',
    label: '补铁补血',
    desc: '红肉、动物肝脏与时令深绿蔬菜',
    icon: 'heart',
    match: { effect: 'blood' }
  },
  {
    key: 'quick-breakfast',
    label: '快手早餐',
    desc: '20 分钟内端上桌，睡醒就能吃',
    icon: 'clock',
    match: { slot: 'breakfast', maxTime: 20 }
  },
  {
    key: 'stew',
    label: '一锅炖汤',
    desc: '食材下锅慢炖，汤和肉一起吃',
    icon: 'flame',
    match: { course: 'soup', method: '炖煮' }
  },
  {
    key: 'lowfat-dinner',
    label: '低脂晚餐',
    desc: '清爽不油腻，晚上也好消化',
    icon: 'leaf',
    match: { effect: 'lowfat', slot: 'dinner' }
  },
  {
    key: 'calcium',
    label: '高钙食谱',
    desc: '奶类、豆制品与深绿色蔬菜',
    icon: 'sparkle',
    match: { effect: 'calcium' }
  },
  {
    key: 'snack',
    label: '解馋加餐',
    desc: '小份温热甜点，解馋不负担',
    icon: 'bookmark',
    match: { course: 'snack' }
  },
  {
    key: 'vegetarian',
    label: '素食友好',
    desc: '不含肉蛋水产，也能吃得均衡',
    icon: 'leaf',
    match: { vegetarian: true }
  }
];

const LOG_OPTIONS = {
  moods: ['很好', '不错', '一般', '疲惫', '低落'],
  moodEmoji: { 很好: '😄', 不错: '🙂', 一般: '😐', 疲惫: '😪', 低落: '😔' },
  sleepQuality: ['很好', '一般', '较差'],
  lochia: ['无', '少量', '中等', '较多'],
  lochiaColor: ['淡红', '暗红', '鲜红', '褐色', '黄色', '白色'],
  lochiaOdor: ['正常', '有异味'],
  wound: ['良好', '轻微不适', '红肿疼痛'],
  breast: ['正常', '胀痛', '硬块', '乳头破损'],
  pain: ['无', '轻微', '明显', '剧烈'],
  fatigue: ['无', '轻微', '明显'],
  bowel: ['正常', '便秘', '腹泻'],
  supplements: ['铁剂', '钙片', '维生素D', '复合维生素'],
  waterCupMl: 250,
  waterGoalMl: 2000
};

function stageInfo(stage) {
  return STAGES.find((s) => s.stage === stage) || STAGES[3];
}

function restrictionTerms(keys) {
  const terms = [];
  const list = Array.isArray(keys) ? keys : [];
  for (const r of RESTRICTIONS) {
    if (list.includes(r.key)) terms.push(...r.terms);
  }
  return terms;
}

module.exports = {
  COURSES,
  SLOTS,
  DEFAULT_SLOTS,
  STAGES,
  RESTRICTIONS,
  TASTES,
  DELIVERY_TYPES,
  FEEDINGS,
  CALORIE_PRESETS,
  EFFECT_GROUPS,
  COLLECTIONS,
  LOG_OPTIONS,
  stageInfo,
  restrictionTerms
};

},
"data/recipe-utils": function(module, exports, require) {
'use strict';

/** 常见食材每 100g 的膳食纤维(g)、钙(mg)、铁(mg) 估算值。 */
const PER_100G = {
  大米: [0.7, 6, 0.8],
  小米: [1.6, 8, 5.1],
  糙米: [3.4, 12, 2.3],
  黑米: [3.9, 12, 1.6],
  紫米: [3.5, 12, 1.6],
  藜麦: [2.8, 47, 4.6],
  燕麦: [6.0, 54, 4.7],
  即食燕麦: [6.0, 54, 4.7],
  糯米粉: [0.8, 10, 0.6],
  细面条: [1.2, 10, 1.2],
  馄饨皮: [1.0, 10, 1.0],
  饺子皮: [1.0, 10, 1.0],
  红豆: [7.7, 76, 5.2],
  黄豆: [15.5, 191, 8.2],
  玉米: [2.9, 4, 0.5],
  玉米粒: [2.9, 4, 0.5],
  紫薯: [1.6, 23, 0.5],
  南瓜: [0.8, 16, 0.4],
  土豆: [1.1, 8, 0.8],
  铁棍山药: [0.8, 16, 0.3],
  莲藕: [1.2, 39, 1.4],
  板栗: [1.7, 17, 1.1],
  红枣: [1.9, 64, 2.3],
  桂圆: [1.1, 6, 0.2],
  枸杞: [4.0, 60, 5.4],
  干银耳: [30.4, 36, 4.1],
  莲子: [3.0, 97, 3.6],
  干木耳: [29.9, 247, 5.5],
  干黄花菜: [7.7, 463, 16.5],
  海带: [1.2, 168, 0.6],
  紫菜: [21.6, 264, 54.9],
  核桃: [6.7, 56, 2.7],
  黑芝麻: [14, 780, 22.7],
  腰果: [3.6, 26, 6.7],
  花生: [7.7, 92, 2.9],
  牛奶: [0, 104, 0.3],
  酸奶: [0, 118, 0.4],
  豆腐: [0.4, 164, 1.9],
  豆干: [0.8, 308, 4.9],
  鸡蛋: [0, 56, 2.0],
  鸡肉: [0, 9, 1.4],
  鸡胸肉: [0, 3, 0.6],
  乌鸡: [0, 17, 2.3],
  鸡爪: [0, 36, 1.4],
  鸡腿: [0, 11, 1.5],
  猪排骨: [0, 8, 1.5],
  猪瘦肉: [0, 6, 3.0],
  猪肉末: [0, 6, 2.0],
  猪肝: [0, 6, 22.6],
  猪蹄: [0, 33, 1.1],
  猪腰: [0, 17, 6.1],
  牛肉末: [0, 23, 3.3],
  牛腩: [0, 9, 2.8],
  牛尾: [0, 10, 2.5],
  羊肉: [0, 12, 2.3],
  鲈鱼: [0, 138, 1.5],
  鲫鱼: [0, 79, 1.3],
  黑鱼: [0, 152, 0.7],
  鳕鱼: [0, 42, 0.5],
  三文鱼: [0, 13, 0.3],
  龙利鱼: [0, 30, 0.4],
  鲳鱼: [0, 46, 0.9],
  虾仁: [0, 62, 1.5],
  蛤蜊: [0, 130, 10.9],
  菠菜: [1.7, 66, 2.9],
  西兰花: [2.6, 47, 0.7],
  油菜: [1.1, 108, 1.2],
  小青菜: [1.5, 90, 1.5],
  时令青菜: [1.5, 80, 1.5],
  娃娃菜: [0.8, 50, 0.5],
  包菜: [1.5, 49, 0.6],
  芦笋: [1.9, 24, 0.6],
  秋葵: [1.8, 45, 0.3],
  茼蒿: [1.2, 73, 2.5],
  荷兰豆: [1.4, 51, 1.0],
  莴笋: [0.6, 23, 0.9],
  丝瓜: [0.6, 14, 0.4],
  冬瓜: [0.7, 19, 0.2],
  西葫芦: [0.6, 15, 0.3],
  番茄: [0.5, 10, 0.4],
  胡萝卜: [1.1, 32, 1.0],
  白萝卜: [1.0, 24, 0.5],
  彩椒: [1.4, 14, 0.8],
  洋葱: [1.7, 24, 0.6],
  香菇: [3.3, 2, 0.3],
  白玉菇: [2.0, 3, 1.0],
  平菇: [2.0, 3, 1.0],
  西芹: [1.2, 38, 0.8],
  小葱: [1.3, 50, 0.6],
  蒜: [1.0, 39, 0.4],
  老姜: [1.0, 15, 0.8],
  姜片: [1.0, 15, 0.8],
  姜丝: [1.0, 15, 0.8],
  姜末: [1.0, 15, 0.8],
  木瓜: [0.8, 17, 0.2],
  雪梨: [1.3, 9, 0.2],
  苹果: [1.2, 4, 0.3],
  香蕉: [1.2, 7, 0.4],
  橙子: [1.6, 20, 0.4],
  猕猴桃: [1.4, 27, 1.2],
  蓝莓: [2.4, 6, 0.3],
  醪糟: [0.2, 5, 0.2],
  红糖: [0, 157, 2.2],
  淀粉: [0.1, 2, 0.1],
  生抽: [0, 20, 0.4],
  蒸鱼豉油: [0, 20, 0.4],
  米醋: [0, 7, 0.2],
  高汤: [0, 10, 0.3],
  鸡汤: [0, 10, 0.3],
  香油: [0, 9, 0.9],
  黑麻油: [0, 9, 0.9],
  小米粉: [2.0, 10, 6.0],
  面粉: [1.5, 18, 1.5],
  玉米面: [5.6, 22, 3.2],
  全麦面包: [6.0, 107, 2.5],
  糯米: [0.8, 10, 1.0],
  粉丝: [0.5, 15, 1.0],
  鹰嘴豆: [11.0, 105, 6.2],
  豌豆: [3.0, 21, 1.7],
  红薯: [1.6, 23, 0.5],
  赤小豆: [7.7, 74, 5.0],
  薏米: [2.0, 42, 3.6],
  黑豆: [10.2, 224, 7.0],
  芝麻酱: [5.9, 1170, 50.3],
  鲜虾: [0, 62, 1.5],
  虾皮: [0, 991, 6.7],
  牛里脊: [0, 8, 2.4],
  豆腐皮: [0.5, 239, 5.6],
  腐竹: [1.0, 77, 16.5],
  杏鲍菇: [3.1, 3, 0.5],
  菜心: [1.7, 96, 1.3],
  油麦菜: [1.4, 70, 1.2],
  豆苗: [1.9, 67, 1.5],
  苋菜: [2.2, 187, 5.4],
  空心菜: [1.4, 99, 2.3],
  芥蓝: [2.8, 128, 1.0],
  百合: [1.7, 11, 1.0],
  茄子: [1.3, 24, 0.5],
  黄瓜: [0.5, 24, 0.5],
  豇豆: [2.3, 42, 1.0],
  菜花: [2.1, 23, 1.1],
  紫甘蓝: [3.0, 45, 0.6],
  生菜: [1.3, 36, 0.9],
  虫草花: [6.0, 30, 4.0],
  茶树菇: [15.4, 26, 42.3],
  金针菇: [2.7, 1, 1.4],
  藕粉: [0.1, 8, 0.2],
  冰糖: [0, 3, 0.1],
  桂花: [0, 20, 0.5],
  陈皮: [1.0, 82, 1.0]
};

const UNIT_GRAMS = {
  鸡蛋: { 个: 50 },
  红枣: { 颗: 8 },
  桂圆: { 颗: 5 },
  板栗: { 颗: 8 },
  饺子皮: { 张: 8 },
  馄饨皮: { 张: 8 },
  蒜: { 瓣: 5 },
  姜片: { 片: 2 }
};

const INGREDIENT_CATEGORIES = ['谷物豆类', '肉禽蛋', '水产', '豆制品', '蔬菜', '水果', '奶制品', '干货药材', '调味料', '其他'];

const CATEGORY_KEYWORDS = [
  ['水产', ['鱼', '虾', '蛤蜊', '海带', '紫菜', '海参', '蟹', '贝']],
  ['豆制品', ['豆腐', '豆干', '豆浆', '腐竹', '豆皮', '千张']],
  ['奶制品', ['牛奶', '酸奶', '奶粉', '奶酪', '奶油']],
  ['肉禽蛋', ['鸡蛋', '鸡肉', '鸡胸', '鸡腿', '鸡爪', '乌鸡', '猪', '排骨', '牛肉', '牛腩', '牛里脊', '牛尾', '羊肉', '肉末', '瘦肉', '腰花']],
  ['谷物豆类', ['大米', '小米', '糙米', '黑米', '紫米', '藜麦', '燕麦', '面条', '馄饨皮', '饺子皮', '糯米粉', '糯米', '红豆', '黄豆', '黑豆', '鹰嘴豆', '豌豆', '粉丝', '面包', '淀粉']],
  ['水果', ['苹果', '雪梨', '橙子', '猕猴桃', '蓝莓', '香蕉', '木瓜', '樱桃']],
  ['干货药材', ['红枣', '桂圆', '枸杞', '核桃', '腰果', '芝麻', '花生', '银耳', '莲子', '黄花菜', '板栗', '杜仲', '百合', '茶树菇', '虫草花', '陈皮']],
  ['蔬菜', ['菜', '瓜', '萝卜', '山药', '莲藕', '南瓜', '番茄', '椒', '笋', '秋葵', '洋葱', '玉米', '豆', '菇', '菌', '木耳', '茼蒿', '菠菜', '茄子', '百合']],
  ['调味料', ['油', '盐', '糖', '醋', '生抽', '豉油', '姜', '蒜', '葱', '桂花']],
  ['其他', ['温水', '清水', '高汤', '鸡汤', '醪糟']]
];

function inferCategory(name) {
  const n = String(name || '');
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => n.includes(k))) return category;
  }
  return '其他';
}

function gramsFor(name, amount, unit) {
  if (unit === 'g' || unit === 'ml') return Number(amount) || 0;
  const unitMap = UNIT_GRAMS[name];
  if (unitMap && unitMap[unit]) return Number(amount) * unitMap[unit];
  return Number(amount) * 10;
}

function computeNutrients(ingredients = []) {
  let fiber = 0;
  let calcium = 0;
  let iron = 0;
  for (const item of ingredients) {
    if (!Array.isArray(item)) continue;
    const [name, amount, unit] = item;
    if (name === '温水' || name === '清水') continue;
    const per = PER_100G[name];
    if (!per) continue;
    const grams = gramsFor(name, amount, unit);
    fiber += (grams * per[0]) / 100;
    calcium += (grams * per[1]) / 100;
    iron += (grams * per[2]) / 100;
  }
  return {
    fiber: Math.round(fiber * 10) / 10,
    calcium: Math.round(calcium),
    iron: Math.round(iron * 10) / 10
  };
}

function methodFor(name = '', course = '') {
  if (/蒸/.test(name)) return '蒸';
  if (/煎|饼/.test(name)) return '煎';
  if (/拌/.test(name)) return '拌';
  if (/炒/.test(name)) return '炒';
  if (/汤|羹|煲/.test(name)) return '炖煮';
  if (/粥|糊/.test(name)) return '煮';
  if (/茶/.test(name)) return '煮饮';
  if (/糕/.test(name)) return '蒸';
  if (/酸奶|果盘|水果/.test(name)) return '即食';
  if (course === 'soup') return '炖煮';
  if (course === 'staple') return '煮';
  return '炒';
}

function difficultyFor(time) {
  if (time <= 15) return '简单';
  if (time <= 40) return '适中';
  return '需要耐心';
}

const CAUTION_RULES = [
  { match: ['猪肝'], text: '猪肝维生素 A 含量高，每周 1-2 次即可，不宜过量。' },
  { match: ['海带', '紫菜'], text: '含碘较高，甲状腺功能异常者请遵医嘱。' },
  { match: ['花生', '核桃', '腰果', '黑芝麻', '南瓜子'], text: '坚果种子类需注意过敏，首次少量尝试。' },
  { match: ['牛奶', '酸奶'], text: '乳糖不耐受可换成无乳糖牛奶或温热豆浆。' },
  { match: ['虾仁', '鲜虾', '蛤蜊', '鲫鱼', '鲈鱼', '鳕鱼', '黑鱼', '三文鱼', '鲳鱼', '龙利鱼'], text: '水产务必彻底煮熟；海鲜过敏者请避开。' },
  { match: ['虾皮'], text: '虾皮含盐较高，少量提味即可；海鲜过敏者避开。' },
  { match: ['醪糟'], text: '含微量酒精，哺乳期建议不吃或充分煮沸。' },
  { match: ['干木耳', '干银耳'], text: '泡发时间不宜超过 2 小时，现泡现用。' },
  { match: ['猪蹄'], text: '脂肪含量较高，喝汤前撇去浮油。' },
  { match: ['羊肉'], text: '偏温补，体质偏热或容易上火时少吃。' },
  { match: ['红糖', '冰糖'], text: '血糖偏高或恶露较多时减少用量。' },
  { match: ['糯米粉', '糯米', '紫米', '糙米'], text: '糯米与粗粮不易消化，肠胃弱时少量食用。' },
  { match: ['黄豆', '黑豆', '鹰嘴豆', '腐竹', '豆腐皮'], text: '豆类容易胀气，初次食用先少量。' },
  { match: ['豇豆', '豆角'], text: '豆角类必须彻底炒熟，避免生豆角引起不适。' },
  { match: ['薏米', '赤小豆'], text: '偏利水渗湿，恶露量多或体质偏寒时少量食用。' },
  { match: ['金针菇', '茶树菇', '杏鲍菇', '虫草花'], text: '菌菇类需彻底煮熟，泡发或清洗干净。' },
  { match: ['百合'], text: '百合偏凉润，脾胃虚寒时少量食用。' },
  { match: ['藕粉'], text: '藕粉以淀粉为主，血糖偏高时注意份量。' },
  { match: ['杜仲'], text: '属于传统药膳，食用前请咨询医生。' },
  { match: ['即食燕麦', '燕麦'], text: '增加饮水量，膳食纤维才能更好发挥作用。' }
];

function cautionsFor(ingredients = []) {
  const names = ingredients.map((i) => (Array.isArray(i) ? i[0] : i.name));
  const out = [];
  for (const rule of CAUTION_RULES) {
    if (rule.match.some((m) => names.some((n) => String(n).includes(m)))) {
      if (!out.includes(rule.text)) out.push(rule.text);
    }
  }
  return out.slice(0, 3);
}

const SUBSTITUTES = {
  鲫鱼: '鲈鱼、鳕鱼或瘦肉片',
  鲈鱼: '鳕鱼、鲳鱼或龙利鱼',
  鳕鱼: '鲈鱼、龙利鱼',
  龙利鱼: '鳕鱼、鲈鱼',
  鲳鱼: '鲈鱼、鳕鱼',
  黑鱼: '鲈鱼、鳕鱼',
  三文鱼: '鳕鱼、龙利鱼',
  虾仁: '鸡肉丝、豆腐',
  蛤蜊: '虾仁、鸡肉',
  鸡肉: '瘦牛肉、虾仁或豆制品',
  鸡胸肉: '鸡腿肉、瘦牛肉',
  鸡腿: '鸡胸肉、瘦牛肉',
  乌鸡: '鸡肉、瘦牛肉',
  鸡爪: '猪蹄、鸡腿',
  猪排骨: '鸡腿、牛腩或猪瘦肉',
  猪肝: '瘦牛肉、鸭血等含铁食材',
  猪蹄: '鸡爪、牛尾（注意去油）',
  猪腰: '猪瘦肉、牛肉',
  猪肉末: '鸡肉末、牛肉末',
  牛肉末: '鸡肉末、猪瘦肉末',
  牛腩: '牛尾、猪排骨',
  牛尾: '牛腩、猪排骨',
  羊肉: '牛肉、鸡肉',
  鸡蛋: '鹌鹑蛋、豆腐',
  牛奶: '无乳糖牛奶、豆浆',
  酸奶: '无糖酸奶、温牛奶',
  豆腐: '豆干、鸡蛋或鸡肉',
  豆干: '豆腐、鸡胸肉',
  花生: '南瓜籽、葵花籽（注意过敏）',
  核桃: '腰果、黑芝麻',
  腰果: '核桃、南瓜籽',
  黑芝麻: '白芝麻、核桃',
  海带: '紫菜（甲功异常遵医嘱）',
  紫菜: '海带（甲功异常遵医嘱）',
  醪糟: '桂圆红枣汤（无酒精）',
  糯米粉: '大米粉（更易消化）',
  糙米: '大米、小米',
  藜麦: '小米、燕麦',
  燕麦: '小米、藜麦',
  即食燕麦: '小米粥、燕麦片',
  铁棍山药: '土豆、南瓜',
  鲜虾: '虾仁、鸡肉',
  牛里脊: '牛腩、猪瘦肉',
  全麦面包: '全麦馒头、软面包',
  鹰嘴豆: '红豆、黄豆',
  虫草花: '香菇、红枣',
  茶树菇: '香菇、平菇',
  金针菇: '白玉菇、平菇',
  百合: '莲子、银耳',
  藕粉: '山药粉、小米糊',
  黑豆: '黄豆、黑米',
  豆腐皮: '豆腐、豆干',
  腐竹: '豆干、豆腐',
  芝麻酱: '花生酱（注意过敏）',
  虾皮: '虾仁、紫菜',
  菜心: '小青菜、油菜',
  油麦菜: '生菜、小青菜',
  苋菜: '菠菜、小青菜',
  芥蓝: '西兰花、菜心',
  豇豆: '荷兰豆、四季豆',
  菜花: '西兰花、娃娃菜',
  紫甘蓝: '包菜、生菜',
  红薯: '紫薯、南瓜',
  糯米: '大米、小米',
  粉丝: '米粉、红薯粉'
};

function substitutesFor(ingredients = []) {
  const names = ingredients.map((i) => (Array.isArray(i) ? i[0] : i.name));
  const out = [];
  for (const name of names) {
    if (SUBSTITUTES[name]) out.push({ from: name, to: SUBSTITUTES[name] });
  }
  return out.slice(0, 4);
}

const COURSE_IMAGE = {
  staple: 'images/staple.jpg',
  main: 'images/main.jpg',
  veg: 'images/veg.jpg',
  soup: 'images/soup.jpg',
  snack: 'images/dessert.jpg'
};

const ANIMAL_TERMS = [
  '鸡肉', '鸡胸', '鸡腿', '鸡爪', '鸡丝', '乌鸡', '鸡汤',
  '猪肉', '猪排', '排骨', '猪肝', '猪蹄', '猪腰', '猪里脊', '五花肉', '肉末', '瘦肉',
  '牛肉', '牛腩', '牛里脊', '牛尾', '羊肉', '羊排',
  '鱼', '虾', '蟹', '蛤蜊', '贝', '海参', '鱿鱼',
  '鸡蛋', '鹌鹑蛋', '鸭肉', '高汤'
];

function isVegetarian(ingredients = []) {
  const names = ingredients.map((i) => (Array.isArray(i) ? i[0] : i.name));
  return !ANIMAL_TERMS.some((term) => names.some((name) => String(name).includes(term)));
}

function decorateRecipe(recipe) {
  const r = { ...recipe };
  const nutrients = r.nutrients || computeNutrients(r.ingredients);
  r.image = r.image || COURSE_IMAGE[r.course] || 'images/main.jpg';
  r.nutrients = nutrients;
  r.method = r.method || methodFor(r.name, r.course);
  r.difficulty = r.difficulty || difficultyFor(r.time);
  r.cautions = Array.isArray(r.cautions) ? r.cautions : cautionsFor(r.ingredients);
  r.substitutes = Array.isArray(r.substitutes) ? r.substitutes : substitutesFor(r.ingredients);
  r.vegetarian = typeof r.vegetarian === 'boolean' ? r.vegetarian : isVegetarian(r.ingredients);
  r.searchText =
    r.searchText || [r.name, ...(r.tags || []), ...(r.ingredients || []).map((i) => i[0]), r.method].join(' ');
  return r;
}

module.exports = {
  INGREDIENT_CATEGORIES,
  inferCategory,
  computeNutrients,
  methodFor,
  difficultyFor,
  cautionsFor,
  substitutesFor,
  isVegetarian,
  decorateRecipe
};

},
"data/recipes": function(module, exports, require) {
'use strict';

const DISH_IMAGES = require('dish-images-index.json');

/**
 * 月子餐食谱库。
 * course: staple 主食 / main 主菜 / veg 蔬菜 / soup 汤羹 / snack 加餐
 * slots: 适合的餐次；stages: 适合的产后阶段（1: 第1周 ... 4: 第5周起）
 * 营养数据为每份估算值，仅供搭配参考。
 */

const ALL = [1, 2, 3, 4];
const S2 = [2, 3, 4];
const S3 = [3, 4];

const RAW = [
  // ================= 主食 =================
  {
    id: 's01', name: '小米南瓜粥', course: 'staple', slots: ['breakfast'], stages: ALL,
    tags: ['养胃', '补气', '易消化'], kcal: 215, protein: 6, carbs: 44, fat: 2, time: 30,
    ingredients: [['小米', 40, 'g', '谷物豆类'], ['南瓜', 80, 'g', '蔬菜'], ['枸杞', 3, 'g', '干货药材']],
    steps: ['小米淘洗后浸泡 10 分钟，南瓜去皮切成小块。', '锅中加 600ml 清水烧开，下小米转小火煮 20 分钟。', '加入南瓜继续煮 10 分钟至软糯，出锅前撒入枸杞。'],
    tips: '南瓜自带甜味，无需额外加糖；产后第一周可煮得更稀软一些。'
  },
  {
    id: 's02', name: '红枣小米粥', course: 'staple', slots: ['breakfast'], stages: ALL,
    tags: ['补血', '养胃', '温和'], kcal: 230, protein: 6, carbs: 48, fat: 2, time: 30,
    ingredients: [['小米', 40, 'g', '谷物豆类'], ['红枣', 4, '颗', '干货药材'], ['桂圆', 2, '颗', '干货药材']],
    steps: ['红枣去核切小块，桂圆去壳备用。', '小米淘洗后与红枣一起下锅，加 600ml 清水。', '大火煮开转小火 25 分钟，加入桂圆再煮 5 分钟即可。'],
    tips: '恶露量较多时先不加桂圆，避免活血过度。'
  },
  {
    id: 's03', name: '山药枸杞粥', course: 'staple', slots: ['breakfast'], stages: ALL,
    tags: ['健脾', '温和', '易消化'], kcal: 220, protein: 5, carbs: 46, fat: 1.5, time: 30,
    ingredients: [['大米', 30, 'g', '谷物豆类'], ['铁棍山药', 80, 'g', '蔬菜'], ['枸杞', 3, 'g', '干货药材']],
    steps: ['大米洗净，山药去皮切小丁（可戴手套防痒）。', '大米加水 600ml 煮开，转小火煮 15 分钟。', '加入山药丁再煮 10 分钟至软烂，撒枸杞焖 2 分钟。'],
    tips: '山药选铁棍山药，口感绵密；切好后泡清水防氧化。'
  },
  {
    id: 's04', name: '燕麦牛奶粥', course: 'staple', slots: ['breakfast'], stages: S2,
    tags: ['补钙', '通便', '有饱腹感'], kcal: 280, protein: 11, carbs: 40, fat: 8, time: 10,
    ingredients: [['即食燕麦', 40, 'g', '谷物豆类'], ['牛奶', 250, 'ml', '奶制品'], ['枸杞', 3, 'g', '干货药材']],
    steps: ['燕麦片倒入锅中，加入牛奶小火加热。', '边加热边搅拌，煮至浓稠冒小泡即可关火。', '撒上枸杞，稍稍放温后食用。'],
    tips: '牛奶不要煮沸，避免营养流失；乳糖不耐受可换成无乳糖牛奶。'
  },
  {
    id: 's05', name: '紫薯小米粥', course: 'staple', slots: ['breakfast'], stages: S2,
    tags: ['通便', '抗氧化', '香甜'], kcal: 225, protein: 6, carbs: 47, fat: 2, time: 30,
    ingredients: [['小米', 40, 'g', '谷物豆类'], ['紫薯', 80, 'g', '蔬菜']],
    steps: ['紫薯去皮切小块，小米淘洗干净。', '小米加水 600ml 煮开，转小火煮 15 分钟。', '加入紫薯块再煮 10 分钟，搅拌至粥色均匀。'],
    tips: '紫薯容易产气，肠胃敏感时减少用量。'
  },
  {
    id: 's06', name: '青菜鸡丝面', course: 'staple', slots: ['breakfast'], stages: ALL,
    tags: ['易消化', '补蛋白', '清爽'], kcal: 360, protein: 18, carbs: 52, fat: 8, time: 20,
    ingredients: [['细面条', 80, 'g', '谷物豆类'], ['鸡肉', 50, 'g', '肉禽蛋'], ['小青菜', 60, 'g', '蔬菜'], ['姜片', 2, '片', '调味料']],
    steps: ['鸡肉冷水下锅，加姜片煮熟后撕成细丝。', '另起锅烧水，下面条煮至软烂。', '放入小青菜烫熟，连汤盛出，铺上鸡丝即可。'],
    tips: '面条煮得比平时软一些，减少肠胃负担。'
  },
  {
    id: 's07', name: '鲜肉小馄饨', course: 'staple', slots: ['breakfast'], stages: S2,
    tags: ['补蛋白', '暖胃', '有食欲'], kcal: 340, protein: 16, carbs: 38, fat: 13, time: 25,
    ingredients: [['馄饨皮', 10, '张', '谷物豆类'], ['猪肉末', 80, 'g', '肉禽蛋'], ['小青菜', 50, 'g', '蔬菜'], ['姜末', 3, 'g', '调味料']],
    steps: ['猪肉末加姜末、少许盐和清水，顺一个方向搅拌上劲。', '取馄饨皮包入肉馅，捏紧收口。', '水开后下馄饨，浮起后加半碗冷水，再次沸腾后放入青菜煮 1 分钟。'],
    tips: '一次可多包一些冷冻保存，早餐现煮更省时。'
  },
  {
    id: 's08', name: '红豆花生粥', course: 'staple', slots: ['breakfast'], stages: S2,
    tags: ['补血', '利水', '软糯'], kcal: 320, protein: 10, carbs: 54, fat: 7, time: 50,
    ingredients: [['大米', 30, 'g', '谷物豆类'], ['红豆', 30, 'g', '谷物豆类'], ['花生', 20, 'g', '干货药材'], ['红枣', 3, '颗', '干货药材']],
    steps: ['红豆、花生提前浸泡 4 小时。', '所有食材加 700ml 清水，大火煮开转小火 40 分钟。', '煮至红豆开花、粥体浓稠即可。'],
    tips: '花生红衣有助补血，建议一并食用。'
  },
  {
    id: 's09', name: '杂粮饭', course: 'staple', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['膳食纤维', '粗细搭配', '控糖'], kcal: 330, protein: 8, carbs: 68, fat: 2.5, time: 40,
    ingredients: [['大米', 60, 'g', '谷物豆类'], ['糙米', 20, 'g', '谷物豆类'], ['小米', 20, 'g', '谷物豆类']],
    steps: ['糙米提前浸泡 2 小时。', '三种米混合淘洗，加水至没过米面约 1.2 厘米。', '电饭煲煮熟后焖 10 分钟再盛出。'],
    tips: '粗粮比例约三分之一即可，过多容易胀气。'
  },
  {
    id: 's10', name: '软米饭', course: 'staple', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['易消化', '温和'], kcal: 280, protein: 6, carbs: 62, fat: 0.8, time: 30,
    ingredients: [['大米', 80, 'g', '谷物豆类']],
    steps: ['大米淘洗两遍。', '加水量比平时略多，煮至偏软。', '焖 5 分钟后盛出即可。'],
    tips: '产后初期肠胃较弱，软米饭比硬饭更友好。'
  },
  {
    id: 's11', name: '紫薯糙米饭', course: 'staple', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['通便', '花青素', '有饱腹感'], kcal: 335, protein: 8, carbs: 70, fat: 2.5, time: 40,
    ingredients: [['大米', 60, 'g', '谷物豆类'], ['糙米', 30, 'g', '谷物豆类'], ['紫薯', 60, 'g', '蔬菜']],
    steps: ['糙米提前浸泡 2 小时，紫薯去皮切丁。', '与大米混合放入电饭煲，加适量水。', '煮好后焖 10 分钟，拌匀即可。'],
    tips: '紫薯丁不要切太小，避免煮化影响口感。'
  },
  {
    id: 's12', name: '鸡汤细面', course: 'staple', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补蛋白', '暖身', '易消化'], kcal: 340, protein: 20, carbs: 55, fat: 9, time: 25,
    ingredients: [['细面条', 80, 'g', '谷物豆类'], ['鸡汤', 300, 'ml', '其他'], ['鸡肉', 40, 'g', '肉禽蛋'], ['小青菜', 50, 'g', '蔬菜']],
    steps: ['鸡汤烧开，面条下锅煮至软烂。', '加入撕好的鸡肉和小青菜。', '再煮 1 分钟，连汤盛出。'],
    tips: '用撇过油的鸡汤更清爽，减少油腻感。'
  },
  {
    id: 's13', name: '藜麦饭', course: 'staple', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['优质蛋白', '控糖', '轻盈'], kcal: 340, protein: 11, carbs: 64, fat: 4, time: 35,
    ingredients: [['大米', 60, 'g', '谷物豆类'], ['藜麦', 30, 'g', '谷物豆类']],
    steps: ['藜麦淘洗至水变清澈，去除表面皂苷。', '与大米混合，加水入电饭煲。', '煮熟后焖 10 分钟，用饭勺翻松。'],
    tips: '藜麦口感有颗粒感，先从三分之一比例开始适应。'
  },
  {
    id: 's14', name: '山药小米饭', course: 'staple', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['健脾', '温和', '有饱腹感'], kcal: 310, protein: 8, carbs: 62, fat: 2, time: 35,
    ingredients: [['大米', 60, 'g', '谷物豆类'], ['小米', 25, 'g', '谷物豆类'], ['铁棍山药', 80, 'g', '蔬菜']],
    steps: ['山药去皮切小丁，大米小米混合淘洗。', '全部放入电饭煲，加适量水。', '煮熟后焖 10 分钟，轻轻拌匀。'],
    tips: '山药本身黏滑，煮饭时水量比平时略少一点。'
  },

  {
    id: 's15', name: '黑米红枣粥', course: 'staple', slots: ['breakfast'], stages: S2,
    tags: ['补血', '养胃', '乌发'], kcal: 240, protein: 6, carbs: 50, fat: 2, time: 40,
    ingredients: [['黑米', 30, 'g', '谷物豆类'], ['大米', 20, 'g', '谷物豆类'], ['红枣', 4, '颗', '干货药材']],
    steps: ['黑米提前浸泡 2 小时。', '黑米、大米加 600ml 清水煮开。', '转小火煮 30 分钟，加入红枣再煮 10 分钟。'],
    tips: '黑米外皮较硬，泡够时间口感才软糯。'
  },
  {
    id: 's16', name: '菠菜猪肝粥', course: 'staple', slots: ['breakfast'], stages: [1, 2],
    tags: ['补铁', '补血', '易消化'], kcal: 260, protein: 14, carbs: 40, fat: 6, time: 40,
    ingredients: [['大米', 40, 'g', '谷物豆类'], ['猪肝', 40, 'g', '肉禽蛋'], ['菠菜', 60, 'g', '蔬菜'], ['姜丝', 3, 'g', '调味料']],
    steps: ['大米加水煮成软粥。', '猪肝切薄片浸泡去血水，焯水后切碎。', '粥里加入猪肝和姜丝煮 3 分钟，放菠菜碎再煮 1 分钟。'],
    tips: '猪肝每周吃 1-2 次即可，不要过量。'
  },
  {
    id: 's17', name: '虾仁蔬菜面', course: 'staple', slots: ['breakfast'], stages: [1, 2, 3],
    tags: ['高蛋白', '补钙', '易消化'], kcal: 350, protein: 20, carbs: 50, fat: 8, time: 20,
    ingredients: [['细面条', 70, 'g', '谷物豆类'], ['虾仁', 50, 'g', '水产'], ['小青菜', 60, 'g', '蔬菜'], ['姜片', 2, '片', '调味料']],
    steps: ['虾仁去虾线，用姜片腌 5 分钟。', '水开下面条煮软，加入虾仁。', '虾仁变色后放小青菜，煮 1 分钟连汤盛出。'],
    tips: '面条煮软一点，搭配虾仁鲜甜开胃。'
  },
  {
    id: 's18', name: '南瓜糙米饭', course: 'staple', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['膳食纤维', '控糖', '香甜'], kcal: 300, protein: 7, carbs: 64, fat: 2, time: 40,
    ingredients: [['大米', 50, 'g', '谷物豆类'], ['糙米', 30, 'g', '谷物豆类'], ['南瓜', 80, 'g', '蔬菜']],
    steps: ['糙米提前浸泡 2 小时，南瓜切丁。', '与大米混合放入电饭煲，加适量水。', '煮熟后焖 10 分钟，轻轻拌匀。'],
    tips: '南瓜会出水，煮饭时比平时少放一点水。'
  },
  {
    id: 's19', name: '鸡肉香菇蒸饺', course: 'staple', slots: ['breakfast'], stages: S2,
    tags: ['高蛋白', '鲜香', '手作'], kcal: 330, protein: 18, carbs: 40, fat: 11, time: 35,
    ingredients: [['饺子皮', 8, '张', '谷物豆类'], ['鸡肉', 80, 'g', '肉禽蛋'], ['香菇', 40, 'g', '蔬菜'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['鸡肉和香菇切碎，加葱花和少许盐拌匀。', '取饺子皮包入馅料，捏紧收口。', '水开后蒸 12 分钟至熟透。'],
    tips: '一次多包一些冷冻，早餐随吃随蒸。'
  },
  {
    id: 's20', name: '红豆紫米饭', course: 'staple', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补血', '花青素', '有饱腹感'], kcal: 330, protein: 9, carbs: 68, fat: 2.5, time: 50,
    ingredients: [['大米', 50, 'g', '谷物豆类'], ['紫米', 30, 'g', '谷物豆类'], ['红豆', 20, 'g', '谷物豆类']],
    steps: ['红豆、紫米提前浸泡 3 小时。', '与大米混合，加水入电饭煲。', '煮熟后焖 10 分钟，口感更软糯。'],
    tips: '紫米和红豆都偏硬，泡透再煮更好消化。'
  },

  // ================= 主菜 =================
  {
    id: 'm01', name: '水煮蛋', course: 'main', slots: ['breakfast', 'lunch'], stages: ALL,
    tags: ['优质蛋白', '简单', '营养'], kcal: 145, protein: 13, carbs: 1, fat: 10, time: 10, proteinType: 'egg',
    ingredients: [['鸡蛋', 2, '个', '肉禽蛋']],
    steps: ['鸡蛋冷水下锅，水开后再煮 7 分钟。', '捞出过凉水，剥壳即可。'],
    tips: '每天 1-2 个鸡蛋即可，搭配其他蛋白质来源更均衡。'
  },
  {
    id: 'm02', name: '蒸蛋羹', course: 'main', slots: ['breakfast', 'lunch'], stages: ALL,
    tags: ['嫩滑', '易消化', '高蛋白'], kcal: 160, protein: 13, carbs: 3, fat: 11, time: 15, proteinType: 'egg',
    ingredients: [['鸡蛋', 2, '个', '肉禽蛋'], ['温水', 150, 'ml', '其他'], ['香油', 2, 'g', '调味料'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['鸡蛋打散，加入约 1.5 倍温水搅匀，过筛去浮沫。', '盖上盘子或保鲜膜，水开后中小火蒸 10 分钟。', '出锅淋少许香油，撒葱花。'],
    tips: '加温水蒸出的蛋羹更嫩；盖住容器可避免表面蜂窝。'
  },
  {
    id: 'm03', name: '虾仁蒸蛋', course: 'main', slots: ['breakfast', 'lunch'], stages: [1, 2, 3],
    tags: ['补钙', '高蛋白', '鲜嫩'], kcal: 190, protein: 21, carbs: 3, fat: 11, time: 18, proteinType: 'shrimp',
    ingredients: [['鸡蛋', 2, '个', '肉禽蛋'], ['虾仁', 50, 'g', '水产'], ['温水', 120, 'ml', '其他']],
    steps: ['虾仁去虾线，用姜片腌 5 分钟。', '鸡蛋加温水打散过筛，倒入碗中蒸 8 分钟。', '摆上虾仁再蒸 4 分钟，焖 2 分钟出锅。'],
    tips: '虾仁变红卷曲即熟，久蒸口感变老。'
  },
  {
    id: 'm04', name: '番茄炒蛋', course: 'main', slots: ['breakfast', 'lunch'], stages: ALL,
    tags: ['开胃', '优质蛋白', '家常'], kcal: 210, protein: 14, carbs: 8, fat: 14, time: 15, proteinType: 'egg',
    ingredients: [['鸡蛋', 2, '个', '肉禽蛋'], ['番茄', 150, 'g', '蔬菜'], ['食用油', 6, 'g', '调味料']],
    steps: ['鸡蛋打散，番茄切小块。', '热锅少油炒散鸡蛋盛出。', '下番茄炒出汁水，倒回鸡蛋翻炒均匀，少许盐调味。'],
    tips: '番茄炒软出汁更开胃，少油少盐更适合月子期。'
  },
  {
    id: 'm05', name: '菠菜炒蛋', course: 'main', slots: ['breakfast', 'lunch', 'dinner'], stages: ALL,
    tags: ['补铁', '纤维', '清淡'], kcal: 180, protein: 15, carbs: 5, fat: 12, time: 12, proteinType: 'egg',
    ingredients: [['鸡蛋', 2, '个', '肉禽蛋'], ['菠菜', 100, 'g', '蔬菜'], ['食用油', 5, 'g', '调味料']],
    steps: ['菠菜焯水 30 秒去除草酸，切段。', '鸡蛋炒散盛出。', '下菠菜翻炒，倒回鸡蛋，少许盐调味。'],
    tips: '菠菜先焯水，既去涩味也更利于钙吸收。'
  },
  {
    id: 'm06', name: '清蒸鲈鱼', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['优质蛋白', '伤口愈合', '低脂'], kcal: 230, protein: 28, carbs: 2, fat: 12, time: 20, proteinType: 'fish',
    ingredients: [['鲈鱼', 180, 'g', '水产'], ['姜丝', 8, 'g', '调味料'], ['小葱', 10, 'g', '蔬菜'], ['蒸鱼豉油', 5, 'ml', '调味料']],
    steps: ['鲈鱼洗净，两面划刀，铺上姜丝。', '水开后上锅大火蒸 8-10 分钟。', '倒掉盘中汤汁，铺葱丝，淋蒸鱼豉油和少量热油。'],
    tips: '蒸的时间按鱼的大小调整，鱼肉刚离骨最嫩。'
  },
  {
    id: 'm07', name: '清蒸鳕鱼', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['DHA', '低脂', '易消化'], kcal: 190, protein: 24, carbs: 1, fat: 9, time: 18, proteinType: 'fish',
    ingredients: [['鳕鱼', 150, 'g', '水产'], ['姜片', 3, '片', '调味料'], ['枸杞', 3, 'g', '干货药材']],
    steps: ['鳕鱼解冻后吸干水分，铺姜片。', '水开后蒸 8 分钟。', '撒枸杞再焖 1 分钟，淋少许豉油即可。'],
    tips: '鳕鱼刺少肉嫩，适合产后补充优质蛋白。'
  },
  {
    id: 'm08', name: '香菇滑鸡', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补蛋白', '鲜香', '增强体力'], kcal: 280, protein: 27, carbs: 8, fat: 15, time: 25, proteinType: 'chicken',
    ingredients: [['鸡肉', 150, 'g', '肉禽蛋'], ['香菇', 60, 'g', '蔬菜'], ['姜片', 3, '片', '调味料'], ['淀粉', 5, 'g', '调味料']],
    steps: ['鸡肉切块，加姜片、少许盐和淀粉抓匀腌制 10 分钟。', '香菇切片铺在盘底，放上鸡块。', '水开后蒸 15 分钟至鸡肉熟透。'],
    tips: '用淀粉抓腌能锁住肉汁，口感更滑嫩。'
  },
  {
    id: 'm09', name: '山药炖排骨', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补钙', '健脾', '温和'], kcal: 330, protein: 24, carbs: 12, fat: 19, time: 60, proteinType: 'pork',
    ingredients: [['猪排骨', 150, 'g', '肉禽蛋'], ['铁棍山药', 100, 'g', '蔬菜'], ['姜片', 3, '片', '调味料']],
    steps: ['排骨冷水下锅焯水，撇去浮沫后洗净。', '排骨加姜片和清水，小火炖 40 分钟。', '加入山药段再炖 15 分钟，少许盐调味。'],
    tips: '排骨汤记得撇油，喝汤也要吃肉。'
  },
  {
    id: 'm10', name: '菠菜猪肝', course: 'main', slots: ['lunch', 'dinner'], stages: [1, 2],
    tags: ['补铁', '补血', '明目'], kcal: 220, protein: 20, carbs: 8, fat: 11, time: 20, proteinType: 'pork',
    ingredients: [['猪肝', 80, 'g', '肉禽蛋'], ['菠菜', 120, 'g', '蔬菜'], ['姜片', 3, '片', '调味料']],
    steps: ['猪肝切薄片，清水浸泡 30 分钟去血水。', '猪肝焯水至变色捞出。', '菠菜焯水后与猪肝同炒，加少许盐调味。'],
    tips: '猪肝维生素 A 含量高，每周吃 1-2 次即可，不宜过量。'
  },
  {
    id: 'm11', name: '肉末豆腐', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补钙', '优质蛋白', '下饭'], kcal: 260, protein: 20, carbs: 10, fat: 15, time: 20, proteinType: 'pork',
    ingredients: [['豆腐', 200, 'g', '豆制品'], ['猪肉末', 60, 'g', '肉禽蛋'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['豆腐切小块，用淡盐水浸泡 5 分钟。', '热锅少油炒香肉末，加少许生抽。', '放入豆腐和小半碗水，小火焖 5 分钟，勾薄芡撒葱花。'],
    tips: '豆腐先泡盐水不易碎，口感也更紧实。'
  },
  {
    id: 'm12', name: '虾仁滑蛋', course: 'main', slots: ['lunch', 'dinner'], stages: [2, 3, 4],
    tags: ['高蛋白', '补钙', '嫩滑'], kcal: 240, protein: 24, carbs: 3, fat: 14, time: 15, proteinType: 'shrimp',
    ingredients: [['虾仁', 80, 'g', '水产'], ['鸡蛋', 2, '个', '肉禽蛋'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['虾仁去虾线，加少许淀粉抓匀。', '鸡蛋打散，加少许温水。', '热锅少油炒虾仁至变色，倒入蛋液快速推炒至凝固，撒葱花。'],
    tips: '全程中小火，蛋液刚凝固就关火，口感最嫩。'
  },
  {
    id: 'm13', name: '麻油鸡', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['温补', '催乳', '暖身'], kcal: 340, protein: 32, carbs: 5, fat: 25, time: 35, proteinType: 'chicken',
    ingredients: [['鸡肉', 200, 'g', '肉禽蛋'], ['老姜', 20, 'g', '调味料'], ['黑麻油', 10, 'g', '调味料']],
    steps: ['老姜切片，用黑麻油小火煸出香味。', '放入鸡块翻炒至表面变色。', '加温水没过食材，小火焖煮 20 分钟，少许盐调味。'],
    tips: '麻油用量不宜过多；剖腹产伤口未愈合时减少姜的用量。'
  },
  {
    id: 'm14', name: '番茄牛腩', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补铁', '补蛋白', '开胃'], kcal: 330, protein: 26, carbs: 14, fat: 21, time: 80, proteinType: 'beef',
    ingredients: [['牛腩', 180, 'g', '肉禽蛋'], ['番茄', 200, 'g', '蔬菜'], ['洋葱', 50, 'g', '蔬菜'], ['姜片', 3, '片', '调味料']],
    steps: ['牛腩切块，冷水下锅焯水去浮沫。', '少油炒香洋葱和番茄，加入牛腩翻炒。', '加开水没过食材，小火炖 60 分钟至软烂。'],
    tips: '番茄的酸味能促进食欲，炖得软烂更好消化。'
  },
  {
    id: 'm15', name: '杜仲腰花', course: 'main', slots: ['lunch', 'dinner'], stages: [2, 3],
    tags: ['强腰肾', '药膳', '补铁'], kcal: 250, protein: 22, carbs: 6, fat: 15, time: 30, proteinType: 'pork',
    ingredients: [['猪腰', 150, 'g', '肉禽蛋'], ['杜仲', 5, 'g', '干货药材'], ['姜丝', 8, 'g', '调味料']],
    steps: ['猪腰去筋膜，切花刀后用清水反复冲洗。', '杜仲煮水 15 分钟，取汁备用。', '热锅少油下姜丝和腰花快炒，烹入杜仲汁，炒熟即可。'],
    tips: '属于传统药膳，食用前请咨询医生，按个人体质调整。'
  },
  {
    id: 'm16', name: '板栗烧鸡', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['温补', '补气', '香甜'], kcal: 340, protein: 28, carbs: 28, fat: 18, time: 45, proteinType: 'chicken',
    ingredients: [['鸡肉', 180, 'g', '肉禽蛋'], ['板栗', 80, 'g', '干货药材'], ['姜片', 3, '片', '调味料']],
    steps: ['鸡肉切块焯水，板栗去壳。', '少油炒香姜片，下鸡块翻炒。', '加板栗和适量热水，小火焖 25 分钟收汁。'],
    tips: '板栗淀粉含量高，可相应减少主食量。'
  },
  {
    id: 'm17', name: '清炖羊肉萝卜', course: 'main', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['温补', '驱寒', '补蛋白'], kcal: 320, protein: 26, carbs: 10, fat: 22, time: 70, proteinType: 'mutton',
    ingredients: [['羊肉', 180, 'g', '肉禽蛋'], ['白萝卜', 150, 'g', '蔬菜'], ['姜片', 4, '片', '调味料']],
    steps: ['羊肉切块冷水下锅焯水去腥。', '加姜片和清水，小火炖 45 分钟。', '放入白萝卜块再炖 15 分钟，少许盐调味。'],
    tips: '体质偏热、容易上火时少吃羊肉。'
  },
  {
    id: 'm18', name: '黄花菜蒸鸡', course: 'main', slots: ['lunch', 'dinner'], stages: [2, 3],
    tags: ['催乳', '安神', '补蛋白'], kcal: 320, protein: 30, carbs: 10, fat: 17, time: 35, proteinType: 'chicken',
    ingredients: [['鸡肉', 180, 'g', '肉禽蛋'], ['干黄花菜', 20, 'g', '干货药材'], ['红枣', 3, '颗', '干货药材'], ['姜丝', 5, 'g', '调味料']],
    steps: ['黄花菜温水泡发 30 分钟，反复清洗后挤干水分。', '鸡肉切块，与黄花菜、红枣、姜丝拌匀。', '水开后蒸 20 分钟至熟透。'],
    tips: '黄花菜要泡透洗净，避免残留杂质。'
  },
  {
    id: 'm19', name: '莲藕蒸肉饼', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补铁', '润燥', '软嫩'], kcal: 300, protein: 20, carbs: 15, fat: 18, time: 30, proteinType: 'pork',
    ingredients: [['猪肉末', 120, 'g', '肉禽蛋'], ['莲藕', 80, 'g', '蔬菜'], ['淀粉', 5, 'g', '调味料'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['莲藕去皮切碎，与猪肉末、淀粉、少许盐拌匀。', '平铺在盘中压成饼状。', '水开后蒸 15 分钟，撒葱花出锅。'],
    tips: '莲藕自带清甜，肉饼不加过多调料也很好吃。'
  },
  {
    id: 'm20', name: '红烧牛肉土豆', course: 'main', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['补铁', '恢复元气', '下饭'], kcal: 350, protein: 26, carbs: 26, fat: 20, time: 90, proteinType: 'beef',
    ingredients: [['牛腩', 180, 'g', '肉禽蛋'], ['土豆', 120, 'g', '蔬菜'], ['胡萝卜', 50, 'g', '蔬菜'], ['姜片', 3, '片', '调味料']],
    steps: ['牛腩焯水切块，土豆胡萝卜切块。', '少油炒香姜片和牛腩，加少许生抽。', '加热水炖 60 分钟，放土豆胡萝卜再炖 20 分钟收汁。'],
    tips: '产后第三周开始适度进补，注意少盐少油。'
  },
  {
    id: 'm21', name: '三文鱼炒时蔬', course: 'main', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['DHA', '高蛋白', '低脂'], kcal: 320, protein: 24, carbs: 9, fat: 20, time: 20, proteinType: 'fish',
    ingredients: [['三文鱼', 150, 'g', '水产'], ['西兰花', 100, 'g', '蔬菜'], ['彩椒', 50, 'g', '蔬菜']],
    steps: ['三文鱼切块，用厨房纸吸干水分。', '西兰花焯水 1 分钟。', '少油煎香三文鱼，加入蔬菜翻炒，少许盐调味。'],
    tips: '三文鱼富含 Omega-3，有助于乳汁营养，每周 1-2 次即可。'
  },
  {
    id: 'm22', name: '香煎鸡胸配西兰花', course: 'main', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['低脂', '高蛋白', '塑形'], kcal: 260, protein: 31, carbs: 8, fat: 11, time: 20, proteinType: 'chicken',
    ingredients: [['鸡胸肉', 150, 'g', '肉禽蛋'], ['西兰花', 120, 'g', '蔬菜'], ['橄榄油', 3, 'g', '调味料']],
    steps: ['鸡胸肉拍松，用少许盐腌 10 分钟。', '平底锅刷薄油，中小火煎至两面金黄熟透。', '西兰花焯水摆盘，搭配食用。'],
    tips: '鸡胸肉煎好后静置 2 分钟再切，肉汁不流失。'
  },

  {
    id: 'm23', name: '香菇烧豆腐', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['植物蛋白', '补钙', '下饭'], kcal: 240, protein: 16, carbs: 14, fat: 14, time: 20, proteinType: 'soy',
    ingredients: [['豆腐', 220, 'g', '豆制品'], ['香菇', 60, 'g', '蔬菜'], ['姜片', 2, '片', '调味料'], ['生抽', 5, 'ml', '调味料']],
    steps: ['豆腐切块，用淡盐水浸泡 5 分钟。', '少油炒香姜片和香菇。', '放入豆腐和小半碗水，小火焖 8 分钟，淋少许生抽调味。'],
    tips: '植物蛋白搭配香菇，鲜味足也更清淡。'
  },
  {
    id: 'm24', name: '番茄炖豆腐', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['植物蛋白', '开胃', '低脂'], kcal: 210, protein: 14, carbs: 13, fat: 11, time: 20, proteinType: 'soy',
    ingredients: [['豆腐', 200, 'g', '豆制品'], ['番茄', 150, 'g', '蔬菜'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['番茄切块炒软出汁。', '加入豆腐块和小半碗清水。', '小火焖 6 分钟，少许盐调味，撒葱花。'],
    tips: '番茄的酸甜让豆腐更入味，也适合胃口不佳时。'
  },
  {
    id: 'm25', name: '彩椒炒豆干', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['植物蛋白', '爽脆', '补钙'], kcal: 230, protein: 18, carbs: 10, fat: 13, time: 15, proteinType: 'soy',
    ingredients: [['豆干', 150, 'g', '豆制品'], ['彩椒', 80, 'g', '蔬菜'], ['蒜', 10, 'g', '调味料']],
    steps: ['豆干切条，彩椒切丝。', '少油爆香蒜末，下豆干翻炒 2 分钟。', '加入彩椒大火快炒，少许盐调味。'],
    tips: '豆干蛋白质密度高，是清淡饮食里的好搭档。'
  },
  {
    id: 'm26', name: '腰果西芹', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['植物蛋白', '膳食纤维', '清爽'], kcal: 240, protein: 8, carbs: 12, fat: 18, time: 12, proteinType: 'nuts',
    ingredients: [['西芹', 150, 'g', '蔬菜'], ['腰果', 20, 'g', '干货药材'], ['蒜', 10, 'g', '调味料']],
    steps: ['西芹撕去老筋，切斜段后焯水 30 秒。', '小火把腰果炒香备用。', '少油爆香蒜末，下西芹快炒，最后拌入腰果。'],
    tips: '坚果过敏者请避开；腰果最后放才够酥脆。'
  },
  {
    id: 'm27', name: '素炒三菇', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['鲜香', '低脂', '增强免疫'], kcal: 130, protein: 7, carbs: 12, fat: 6, time: 15, proteinType: 'veg',
    ingredients: [['香菇', 40, 'g', '蔬菜'], ['白玉菇', 60, 'g', '蔬菜'], ['平菇', 60, 'g', '蔬菜'], ['蒜', 10, 'g', '调味料']],
    steps: ['三种菌菇洗净，香菇切片。', '菌菇焯水 1 分钟捞出。', '少油爆香蒜末，下菌菇大火翻炒 2 分钟，少许盐调味。'],
    tips: '菌菇自带鲜味，少盐也很好吃。'
  },
  {
    id: 'm31', name: '清炒山药木耳', course: 'main', slots: ['breakfast', 'lunch', 'dinner'], stages: ALL,
    tags: ['健脾', '爽脆', '低脂'], kcal: 180, protein: 5, carbs: 30, fat: 5, time: 15, proteinType: 'veg',
    ingredients: [['铁棍山药', 150, 'g', '蔬菜'], ['干木耳', 5, 'g', '干货药材'], ['彩椒', 40, 'g', '蔬菜'], ['蒜', 10, 'g', '调味料']],
    steps: ['木耳提前泡发撕小朵，山药去皮切片，彩椒切块。', '山药和木耳分别焯水 1 分钟。', '少油爆香蒜末，下所有食材大火快炒，少许盐调味。'],
    tips: '口感清爽脆嫩，早餐或晚餐搭配粥类都合适。'
  },
  {
    id: 'm28', name: '香煎山药饼', course: 'main', slots: ['breakfast', 'lunch'], stages: ALL,
    tags: ['健脾', '温和', '手作'], kcal: 200, protein: 5, carbs: 40, fat: 2, time: 25, proteinType: 'veg',
    ingredients: [['铁棍山药', 160, 'g', '蔬菜'], ['糯米粉', 15, 'g', '谷物豆类'], ['食用油', 3, 'g', '调味料']],
    steps: ['山药蒸熟压成泥，加入糯米粉揉匀。', '分成小团压成小饼。', '平底锅刷薄油，小火煎至两面微黄。'],
    tips: '素食或不爱吃肉时，可以用它作为早餐主菜。'
  },
  {
    id: 'm29', name: '素烧豆腐青菜', course: 'main', slots: ['breakfast', 'lunch', 'dinner'], stages: ALL,
    tags: ['植物蛋白', '清淡', '易消化'], kcal: 190, protein: 14, carbs: 8, fat: 12, time: 15, proteinType: 'soy',
    ingredients: [['豆腐', 180, 'g', '豆制品'], ['小青菜', 80, 'g', '蔬菜'], ['生抽', 5, 'ml', '调味料']],
    steps: ['豆腐切块，小青菜洗净。', '少油把豆腐两面煎至微黄。', '加小半碗水和少许生抽焖 3 分钟，放入青菜煮软。'],
    tips: '早餐搭配粥类，就是一份温暖的素餐。'
  },
  {
    id: 'm30', name: '鸡丝拌菠菜', course: 'main', slots: ['breakfast', 'lunch'], stages: ALL,
    tags: ['高蛋白', '补铁', '清爽'], kcal: 180, protein: 20, carbs: 6, fat: 8, time: 20, proteinType: 'chicken',
    ingredients: [['鸡肉', 80, 'g', '肉禽蛋'], ['菠菜', 120, 'g', '蔬菜'], ['姜片', 2, '片', '调味料'], ['香油', 2, 'g', '调味料']],
    steps: ['鸡肉加姜片煮熟，放凉后撕成细丝。', '菠菜焯水 30 秒，挤干水分切段。', '鸡丝和菠菜拌匀，淋少许香油和盐。'],
    tips: '不吃鸡蛋时，这是一道温和的早餐蛋白质选择。'
  },

  {
    id: 'm32', name: '芦笋炒虾仁', course: 'main', slots: ['lunch', 'dinner'], stages: [2, 3, 4],
    tags: ['高蛋白', '补钙', '清爽'], kcal: 220, protein: 22, carbs: 8, fat: 11, time: 15, proteinType: 'shrimp',
    ingredients: [['虾仁', 100, 'g', '水产'], ['芦笋', 120, 'g', '蔬菜'], ['蒜', 10, 'g', '调味料']],
    steps: ['虾仁去虾线，芦笋切段焯水 1 分钟。', '热锅少油炒虾仁至变色。', '加入芦笋和蒜末快炒，少许盐调味。'],
    tips: '虾仁和芦笋都易熟，大火快炒口感最好。'
  },
  {
    id: 'm33', name: '番茄龙利鱼', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['低脂', '优质蛋白', '开胃'], kcal: 210, protein: 24, carbs: 9, fat: 8, time: 20, proteinType: 'fish',
    ingredients: [['龙利鱼', 150, 'g', '水产'], ['番茄', 150, 'g', '蔬菜'], ['姜片', 2, '片', '调味料']],
    steps: ['龙利鱼解冻切块，用姜片腌 5 分钟。', '番茄切块炒软出汁。', '加小半碗水煮开，放入鱼块煮 5 分钟，少许盐调味。'],
    tips: '龙利鱼刺少肉嫩，适合不太会吃鱼的人。'
  },
  {
    id: 'm34', name: '土豆炖鸡块', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补蛋白', '家常', '有饱腹感'], kcal: 350, protein: 26, carbs: 24, fat: 17, time: 45, proteinType: 'chicken',
    ingredients: [['鸡肉', 180, 'g', '肉禽蛋'], ['土豆', 120, 'g', '蔬菜'], ['胡萝卜', 50, 'g', '蔬菜'], ['姜片', 3, '片', '调味料']],
    steps: ['鸡肉切块焯水，土豆胡萝卜切块。', '少油炒香姜片和鸡块。', '加土豆、胡萝卜和热水，小火炖 25 分钟收汁。'],
    tips: '土豆吸饱汤汁很下饭，主食可相应减少。'
  },
  {
    id: 'm35', name: '萝卜炖牛肉', course: 'main', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['补铁', '温补', '软烂'], kcal: 340, protein: 26, carbs: 12, fat: 20, time: 90, proteinType: 'beef',
    ingredients: [['牛腩', 180, 'g', '肉禽蛋'], ['白萝卜', 150, 'g', '蔬菜'], ['姜片', 3, '片', '调味料']],
    steps: ['牛腩切块焯水去浮沫。', '加姜片和热水，小火炖 60 分钟。', '放白萝卜再炖 20 分钟，少许盐调味。'],
    tips: '白萝卜能吸附油脂，汤喝起来更清爽。'
  },
  {
    id: 'm36', name: '蒜香蒸排骨', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补钙', '补蛋白', '鲜香'], kcal: 310, protein: 22, carbs: 6, fat: 22, time: 40, proteinType: 'pork',
    ingredients: [['猪排骨', 180, 'g', '肉禽蛋'], ['蒜', 10, 'g', '调味料'], ['淀粉', 5, 'g', '调味料'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['排骨泡去血水，加蒜末、淀粉和少许盐抓匀。', '腌制 15 分钟后平铺盘中。', '水开后蒸 20 分钟，撒葱花出锅。'],
    tips: '蒸排骨比红烧少油，更适合月子期。'
  },
  {
    id: 'm37', name: '香菇牛肉饼', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补铁', '高蛋白', '软嫩'], kcal: 290, protein: 24, carbs: 10, fat: 17, time: 30, proteinType: 'beef',
    ingredients: [['牛肉末', 120, 'g', '肉禽蛋'], ['香菇', 50, 'g', '蔬菜'], ['淀粉', 5, 'g', '调味料'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['香菇切碎，与牛肉末、淀粉、葱花拌匀。', '压成小饼放入盘中。', '水开后蒸 15 分钟即可。'],
    tips: '牛肉末选瘦一些的部位，口感更清爽。'
  },
  {
    id: 'm38', name: '清蒸鸡腿', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['优质蛋白', '清淡', '易消化'], kcal: 270, protein: 28, carbs: 2, fat: 16, time: 30, proteinType: 'chicken',
    ingredients: [['鸡腿', 180, 'g', '肉禽蛋'], ['姜丝', 8, 'g', '调味料'], ['小葱', 5, 'g', '蔬菜'], ['生抽', 5, 'ml', '调味料']],
    steps: ['鸡腿去皮划刀，铺上姜丝。', '水开后蒸 18 分钟至熟透。', '淋少许生抽，撒葱花。'],
    tips: '去皮蒸制能减少油脂，蛋白质依然充足。'
  },
  {
    id: 'm39', name: '虾仁豆腐煲', course: 'main', slots: ['lunch', 'dinner'], stages: [1, 2, 3],
    tags: ['补钙', '高蛋白', '暖胃'], kcal: 250, protein: 24, carbs: 8, fat: 13, time: 25, proteinType: 'shrimp',
    ingredients: [['虾仁', 80, 'g', '水产'], ['豆腐', 180, 'g', '豆制品'], ['小葱', 5, 'g', '蔬菜'], ['姜片', 2, '片', '调味料']],
    steps: ['豆腐切块，虾仁去虾线。', '砂锅加少许油炒香姜片，放豆腐和小半碗水煮 5 分钟。', '放入虾仁煮 3 分钟，撒葱花调味。'],
    tips: '豆腐和虾仁都是补钙好食材，汤水也别浪费。'
  },
  {
    id: 'm40', name: '五彩鸡丁', course: 'main', slots: ['lunch', 'dinner'], stages: [2, 3, 4],
    tags: ['高蛋白', '开胃', '色彩丰富'], kcal: 280, protein: 27, carbs: 12, fat: 13, time: 20, proteinType: 'chicken',
    ingredients: [['鸡肉', 150, 'g', '肉禽蛋'], ['彩椒', 60, 'g', '蔬菜'], ['玉米粒', 40, 'g', '蔬菜'], ['胡萝卜', 30, 'g', '蔬菜']],
    steps: ['鸡肉切丁，用少许淀粉抓匀。', '热锅少油滑炒鸡丁至变色盛出。', '下彩椒、玉米、胡萝卜翻炒，倒回鸡丁炒匀调味。'],
    tips: '颜色丰富更容易唤起食欲，蔬菜可随季节替换。'
  },
  {
    id: 'm41', name: '清蒸鲳鱼', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['优质蛋白', 'DHA', '低脂'], kcal: 220, protein: 26, carbs: 2, fat: 11, time: 20, proteinType: 'fish',
    ingredients: [['鲳鱼', 180, 'g', '水产'], ['姜丝', 8, 'g', '调味料'], ['小葱', 5, 'g', '蔬菜'], ['蒸鱼豉油', 5, 'ml', '调味料']],
    steps: ['鲳鱼处理干净，两面划刀铺姜丝。', '水开后大火蒸 8-10 分钟。', '倒掉汤汁，铺葱丝淋豉油和少量热油。'],
    tips: '鲳鱼肉厚刺少，蒸到筷子能轻松插入即可。'
  },

  // ================= 蔬菜 =================
  {
    id: 'v01', name: '清炒西兰花', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['维C', '膳食纤维', '清爽'], kcal: 90, protein: 5, carbs: 10, fat: 4, time: 12,
    ingredients: [['西兰花', 200, 'g', '蔬菜'], ['蒜', 10, 'g', '调味料'], ['食用油', 4, 'g', '调味料']],
    steps: ['西兰花切小朵，用淡盐水浸泡 10 分钟。', '焯水 1 分钟后捞出。', '热锅少油爆香蒜末，下西兰花快炒，少许盐调味。'],
    tips: '先焯后炒能减少用油，颜色也更翠绿。'
  },
  {
    id: 'v02', name: '蒜蓉菠菜', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补铁', '纤维', '清淡'], kcal: 80, protein: 5, carbs: 8, fat: 4, time: 10,
    ingredients: [['菠菜', 200, 'g', '蔬菜'], ['蒜', 10, 'g', '调味料'], ['食用油', 4, 'g', '调味料']],
    steps: ['菠菜洗净焯水 30 秒，挤干水分切段。', '热锅少油爆香蒜末。', '下菠菜快炒，少许盐调味出锅。'],
    tips: '焯水可去除草酸，吃起来不涩口。'
  },
  {
    id: 'v03', name: '上汤娃娃菜', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['清淡', '补水', '鲜甜'], kcal: 70, protein: 4, carbs: 8, fat: 2, time: 15,
    ingredients: [['娃娃菜', 200, 'g', '蔬菜'], ['枸杞', 3, 'g', '干货药材'], ['高汤', 100, 'ml', '其他']],
    steps: ['娃娃菜洗净切成长条。', '高汤煮开，放入娃娃菜煮 3 分钟。', '撒枸杞，少许盐调味即可。'],
    tips: '用鸡汤或排骨汤代替清水，蔬菜更鲜甜。'
  },
  {
    id: 'v04', name: '清炒时蔬', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['纤维', '应季', '清爽'], kcal: 75, protein: 4, carbs: 9, fat: 3, time: 10,
    ingredients: [['时令青菜', 200, 'g', '蔬菜'], ['蒜', 10, 'g', '调味料'], ['食用油', 4, 'g', '调味料']],
    steps: ['青菜洗净沥干，蒜切片。', '热锅少油爆香蒜片。', '下青菜大火快炒，少许盐调味。'],
    tips: '叶菜类大火快炒，口感和营养都保留得更好。'
  },
  {
    id: 'v05', name: '香菇油菜', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补钙', '纤维', '鲜香'], kcal: 95, protein: 5, carbs: 11, fat: 4, time: 15,
    ingredients: [['油菜', 200, 'g', '蔬菜'], ['香菇', 50, 'g', '蔬菜'], ['蒜', 10, 'g', '调味料']],
    steps: ['油菜和香菇洗净，香菇切片。', '油菜焯水后摆盘。', '少油炒香香菇和蒜，加少许水煮 2 分钟，浇在油菜上。'],
    tips: '油菜钙含量不错，搭配香菇更鲜美。'
  },
  {
    id: 'v06', name: '清炒芦笋', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['叶酸', '纤维', '清爽'], kcal: 85, protein: 5, carbs: 8, fat: 4, time: 12,
    ingredients: [['芦笋', 180, 'g', '蔬菜'], ['蒜', 10, 'g', '调味料'], ['食用油', 4, 'g', '调味料']],
    steps: ['芦笋去老根，切斜段。', '焯水 1 分钟后过凉。', '热锅少油爆香蒜末，下芦笋快炒调味。'],
    tips: '芦笋尖最嫩，焯水时间不宜过长。'
  },
  {
    id: 'v07', name: '蒸南瓜', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['养胃', '香甜', '低脂'], kcal: 80, protein: 2, carbs: 18, fat: 0.5, time: 20,
    ingredients: [['南瓜', 220, 'g', '蔬菜']],
    steps: ['南瓜去皮切厚片。', '摆入盘中，水开后蒸 15 分钟。', '用筷子能轻松扎透即可。'],
    tips: '南瓜本身清甜，不加糖也好吃，还能代替部分主食。'
  },
  {
    id: 'v08', name: '胡萝卜炒木耳', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补铁', '明目', '爽脆'], kcal: 100, protein: 3, carbs: 15, fat: 4, time: 15,
    ingredients: [['胡萝卜', 120, 'g', '蔬菜'], ['干木耳', 5, 'g', '干货药材'], ['蒜', 10, 'g', '调味料']],
    steps: ['木耳提前泡发，撕小朵；胡萝卜切片。', '木耳焯水 1 分钟。', '少油爆香蒜末，下胡萝卜翻炒，加木耳炒熟调味。'],
    tips: '木耳泡发时间不宜超过 2 小时，现泡现用更安全。'
  },
  {
    id: 'v09', name: '清炒莴笋', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['通乳', '清爽', '低热量'], kcal: 70, protein: 3, carbs: 9, fat: 3, time: 12,
    ingredients: [['莴笋', 200, 'g', '蔬菜'], ['蒜', 10, 'g', '调味料']],
    steps: ['莴笋去皮切片，可加少许盐腌 5 分钟出水。', '热锅少油爆香蒜末。', '下莴笋大火快炒 2 分钟，少许盐调味。'],
    tips: '莴笋清香爽脆，传统上也被认为有助于通乳。'
  },
  {
    id: 'v10', name: '蒜蓉丝瓜', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['清淡', '通络', '补水'], kcal: 75, protein: 3, carbs: 9, fat: 3, time: 12,
    ingredients: [['丝瓜', 200, 'g', '蔬菜'], ['蒜', 10, 'g', '调味料']],
    steps: ['丝瓜去皮滚刀切块。', '热锅少油爆香蒜末。', '下丝瓜翻炒至变软出汁，少许盐调味。'],
    tips: '丝瓜易出水，炒制时间不要太长。'
  },
  {
    id: 'v11', name: '手撕包菜', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['开胃', '纤维', '爽脆'], kcal: 85, protein: 4, carbs: 11, fat: 4, time: 12,
    ingredients: [['包菜', 200, 'g', '蔬菜'], ['蒜', 10, 'g', '调味料'], ['食用油', 4, 'g', '调味料']],
    steps: ['包菜用手撕成小片，洗净沥干。', '热锅少油爆香蒜末。', '下包菜大火快炒至断生，少许盐调味。'],
    tips: '手撕比刀切更容易入味，边缘也更好看。'
  },
  {
    id: 'v12', name: '番茄烩西葫芦', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['开胃', '低脂', '软嫩'], kcal: 85, protein: 4, carbs: 12, fat: 3, time: 15,
    ingredients: [['西葫芦', 180, 'g', '蔬菜'], ['番茄', 100, 'g', '蔬菜']],
    steps: ['西葫芦和番茄切块。', '少油炒软番茄出汁。', '下西葫芦翻炒至软，少许盐调味。'],
    tips: '番茄的酸甜能让清淡的月子餐更有食欲。'
  },

  {
    id: 'v13', name: '清炒秋葵', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['通便', '膳食纤维', '低脂'], kcal: 85, protein: 4, carbs: 11, fat: 3, time: 12,
    ingredients: [['秋葵', 180, 'g', '蔬菜'], ['蒜', 10, 'g', '调味料']],
    steps: ['秋葵洗净去蒂，焯水 1 分钟后切段。', '热锅少油爆香蒜末。', '下秋葵快炒，少许盐调味。'],
    tips: '秋葵黏液富含可溶性纤维，对产后便秘很友好。'
  },
  {
    id: 'v14', name: '蒜蓉茼蒿', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['安神', '清香', '纤维'], kcal: 75, protein: 4, carbs: 8, fat: 3, time: 10,
    ingredients: [['茼蒿', 200, 'g', '蔬菜'], ['蒜', 10, 'g', '调味料']],
    steps: ['茼蒿洗净沥干。', '热锅少油爆香蒜末。', '下茼蒿大火快炒至变软，少许盐调味。'],
    tips: '茼蒿有独特清香，传统上认为有助于安神。'
  },
  {
    id: 'v15', name: '五彩时蔬', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['膳食纤维', '维C', '清爽'], kcal: 100, protein: 4, carbs: 14, fat: 4, time: 15,
    ingredients: [['西兰花', 80, 'g', '蔬菜'], ['彩椒', 50, 'g', '蔬菜'], ['胡萝卜', 40, 'g', '蔬菜'], ['干木耳', 3, 'g', '干货药材']],
    steps: ['木耳泡发，所有蔬菜切小块。', '焯水 1 分钟后捞出。', '热锅少油快炒，少许盐调味。'],
    tips: '一次吃到多种蔬菜，颜色和营养都更丰富。'
  },
  {
    id: 'v16', name: '醋溜藕片', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['开胃', '爽脆', '低脂'], kcal: 90, protein: 3, carbs: 16, fat: 2, time: 12,
    ingredients: [['莲藕', 180, 'g', '蔬菜'], ['米醋', 5, 'ml', '调味料'], ['蒜', 10, 'g', '调味料']],
    steps: ['莲藕去皮切薄片，泡清水防氧化。', '焯水 1 分钟捞出。', '热锅少油爆香蒜末，下藕片快炒，烹入米醋调味。'],
    tips: '少量米醋提味，有助于改善产后胃口。'
  },
  {
    id: 'v17', name: '清炒荷兰豆', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['膳食纤维', '清甜', '低脂'], kcal: 90, protein: 5, carbs: 10, fat: 3, time: 12,
    ingredients: [['荷兰豆', 180, 'g', '蔬菜'], ['蒜', 10, 'g', '调味料']],
    steps: ['荷兰豆撕去两边老筋。', '焯水 1 分钟后捞出。', '热锅少油爆香蒜末，下荷兰豆快炒调味。'],
    tips: '荷兰豆一定要炒熟，口感才脆嫩安全。'
  },

  // ================= 汤羹 =================
  {
    id: 'p01', name: '鲫鱼豆腐汤', course: 'soup', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['催乳', '优质蛋白', '补钙'], kcal: 290, protein: 28, carbs: 8, fat: 15, time: 35, proteinType: 'fish',
    ingredients: [['鲫鱼', 200, 'g', '水产'], ['豆腐', 150, 'g', '豆制品'], ['姜片', 4, '片', '调味料'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['鲫鱼处理干净，用厨房纸吸干水分。', '少油煎至两面微黄，加姜片和开水。', '大火煮 10 分钟至汤色乳白，放豆腐再煮 8 分钟。'],
    tips: '煎鱼后加开水，汤色更容易煮成奶白色。'
  },
  {
    id: 'p02', name: '山药鸡汤', course: 'soup', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补气', '健脾', '温和'], kcal: 300, protein: 26, carbs: 16, fat: 15, time: 60, proteinType: 'chicken',
    ingredients: [['鸡肉', 150, 'g', '肉禽蛋'], ['铁棍山药', 100, 'g', '蔬菜'], ['红枣', 3, '颗', '干货药材'], ['姜片', 3, '片', '调味料']],
    steps: ['鸡肉切块焯水去浮沫。', '加姜片和清水，小火炖 40 分钟。', '放入山药和红枣再炖 15 分钟，少许盐调味。'],
    tips: '鸡汤表面浮油可以撇掉一部分，喝起来更清爽。'
  },
  {
    id: 'p03', name: '冬瓜排骨汤', course: 'soup', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['消肿', '清淡', '补钙'], kcal: 260, protein: 18, carbs: 9, fat: 16, time: 60, proteinType: 'pork',
    ingredients: [['猪排骨', 120, 'g', '肉禽蛋'], ['冬瓜', 200, 'g', '蔬菜'], ['姜片', 3, '片', '调味料']],
    steps: ['排骨冷水下锅焯水，洗净备用。', '加姜片和清水炖 40 分钟。', '放入冬瓜块再煮 15 分钟，少许盐调味。'],
    tips: '产后容易水肿，冬瓜利水，很适合第一周食用。'
  },
  {
    id: 'p04', name: '紫菜蛋花汤', course: 'soup', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补碘', '快手', '清淡'], kcal: 90, protein: 8, carbs: 3, fat: 5, time: 10, proteinType: 'egg',
    ingredients: [['紫菜', 5, 'g', '水产'], ['鸡蛋', 1, '个', '肉禽蛋'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['紫菜撕小片放入碗中，鸡蛋打散。', '锅中水烧开，转圈淋入蛋液。', '加紫菜煮开，少许盐调味，撒葱花。'],
    tips: '紫菜本身带咸味，盐要少放。'
  },
  {
    id: 'p05', name: '丝瓜蛋汤', course: 'soup', slots: ['lunch', 'dinner'], stages: [1, 2],
    tags: ['清淡', '通络', '易消化'], kcal: 110, protein: 8, carbs: 8, fat: 5, time: 12, proteinType: 'egg',
    ingredients: [['丝瓜', 150, 'g', '蔬菜'], ['鸡蛋', 1, '个', '肉禽蛋']],
    steps: ['丝瓜去皮切块，鸡蛋打散。', '水开后下丝瓜煮 3 分钟。', '淋入蛋液，煮开调味即可。'],
    tips: '第一周清淡饮食的优选汤品。'
  },
  {
    id: 'p06', name: '莲藕花生排骨汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补血', '润燥', '滋补'], kcal: 300, protein: 20, carbs: 18, fat: 18, time: 80, proteinType: 'pork',
    ingredients: [['猪排骨', 120, 'g', '肉禽蛋'], ['莲藕', 150, 'g', '蔬菜'], ['花生', 20, 'g', '干货药材'], ['姜片', 3, '片', '调味料']],
    steps: ['排骨焯水，莲藕去皮切块。', '所有食材加姜片和清水。', '小火炖 60 分钟至莲藕软糯，少许盐调味。'],
    tips: '莲藕选粉藕，炖汤口感更绵软。'
  },
  {
    id: 'p07', name: '猪蹄花生汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['催乳', '胶原蛋白', '滋补'], kcal: 380, protein: 26, carbs: 10, fat: 30, time: 90, proteinType: 'pork',
    ingredients: [['猪蹄', 200, 'g', '肉禽蛋'], ['花生', 30, 'g', '干货药材'], ['姜片', 4, '片', '调味料']],
    steps: ['猪蹄剁块，冷水下锅焯水去浮沫。', '加姜片、花生和足量清水。', '小火炖 70 分钟至软烂，撇去浮油后调味。'],
    tips: '汤面上的油脂建议撇掉再喝；每周 1-2 次即可。'
  },
  {
    id: 'p08', name: '黄花菜瘦肉汤', course: 'soup', slots: ['lunch', 'dinner'], stages: [2, 3],
    tags: ['催乳', '安神', '清甜'], kcal: 230, protein: 20, carbs: 9, fat: 12, time: 40, proteinType: 'pork',
    ingredients: [['猪瘦肉', 100, 'g', '肉禽蛋'], ['干黄花菜', 20, 'g', '干货药材'], ['姜片', 3, '片', '调味料']],
    steps: ['黄花菜泡发洗净，瘦肉切片。', '加姜片和清水煮开。', '放黄花菜小火煮 20 分钟，加肉片再煮 5 分钟。'],
    tips: '黄花菜安神助眠，适合夜间喂奶后容易疲惫的阶段。'
  },
  {
    id: 'p09', name: '红枣乌鸡汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补血', '补气', '滋补'], kcal: 280, protein: 26, carbs: 10, fat: 14, time: 80, proteinType: 'chicken',
    ingredients: [['乌鸡', 200, 'g', '肉禽蛋'], ['红枣', 5, '颗', '干货药材'], ['枸杞', 3, 'g', '干货药材'], ['姜片', 3, '片', '调味料']],
    steps: ['乌鸡切块焯水。', '加姜片、红枣和清水，小火炖 60 分钟。', '出锅前 5 分钟加枸杞，少许盐调味。'],
    tips: '第二周开始温和进补，乌鸡脂肪较低，很适合。'
  },
  {
    id: 'p10', name: '黑鱼豆腐汤', course: 'soup', slots: ['lunch', 'dinner'], stages: [1, 2, 3],
    tags: ['伤口愈合', '高蛋白', '补钙'], kcal: 280, protein: 30, carbs: 6, fat: 14, time: 30, proteinType: 'fish',
    ingredients: [['黑鱼', 180, 'g', '水产'], ['豆腐', 120, 'g', '豆制品'], ['姜片', 3, '片', '调味料']],
    steps: ['黑鱼切片，用姜片稍腌。', '锅中少油煎鱼骨，加开水煮 10 分钟。', '下豆腐煮 5 分钟，再放鱼片煮熟调味。'],
    tips: '黑鱼蛋白质丰富，传统上认为有助于伤口愈合。'
  },
  {
    id: 'p11', name: '玉米胡萝卜排骨汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补钙', '清甜', '家常'], kcal: 300, protein: 19, carbs: 20, fat: 16, time: 70, proteinType: 'pork',
    ingredients: [['猪排骨', 120, 'g', '肉禽蛋'], ['玉米', 100, 'g', '蔬菜'], ['胡萝卜', 80, 'g', '蔬菜'], ['姜片', 3, '片', '调味料']],
    steps: ['排骨焯水，玉米胡萝卜切块。', '全部食材加姜片和清水。', '小火炖 50 分钟，少许盐调味。'],
    tips: '玉米和胡萝卜自带甜味，汤不用加糖。'
  },
  {
    id: 'p12', name: '菌菇鸡汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['增强免疫', '鲜香', '补蛋白'], kcal: 270, protein: 25, carbs: 10, fat: 14, time: 60, proteinType: 'chicken',
    ingredients: [['鸡肉', 150, 'g', '肉禽蛋'], ['香菇', 40, 'g', '蔬菜'], ['白玉菇', 40, 'g', '蔬菜'], ['姜片', 3, '片', '调味料']],
    steps: ['鸡肉焯水，菌菇洗净。', '鸡肉加姜片和清水炖 40 分钟。', '放菌菇再煮 10 分钟，少许盐调味。'],
    tips: '菌菇本身很鲜，不需要额外加味精。'
  },
  {
    id: 'p13', name: '番茄牛尾汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['补铁', '滋补', '开胃'], kcal: 300, protein: 22, carbs: 10, fat: 21, time: 100, proteinType: 'beef',
    ingredients: [['牛尾', 150, 'g', '肉禽蛋'], ['番茄', 150, 'g', '蔬菜'], ['姜片', 3, '片', '调味料']],
    steps: ['牛尾冷水下锅焯水。', '加姜片和清水小火炖 70 分钟。', '加入番茄块再炖 20 分钟，少许盐调味。'],
    tips: '第三周后用牛尾滋补，喝汤时撇去表面浮油。'
  },
  {
    id: 'p14', name: '木瓜鲫鱼汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['催乳', '高蛋白', '清甜'], kcal: 300, protein: 25, carbs: 14, fat: 15, time: 35, proteinType: 'fish',
    ingredients: [['鲫鱼', 180, 'g', '水产'], ['木瓜', 150, 'g', '水果'], ['姜片', 4, '片', '调味料']],
    steps: ['鲫鱼煎至两面微黄。', '加姜片和开水煮 10 分钟。', '放木瓜块再煮 10 分钟，少许盐调味。'],
    tips: '木瓜选半熟的，汤味更清甜；喝汤记得吃肉。'
  },
  {
    id: 'p15', name: '海带排骨汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['补碘', '补钙', '清爽'], kcal: 270, protein: 18, carbs: 8, fat: 18, time: 70, proteinType: 'pork',
    ingredients: [['猪排骨', 120, 'g', '肉禽蛋'], ['海带', 50, 'g', '水产'], ['姜片', 3, '片', '调味料']],
    steps: ['排骨焯水，海带泡发切块。', '加姜片和清水炖 45 分钟。', '放海带再煮 15 分钟，少许盐调味。'],
    tips: '海带含碘丰富，甲状腺功能异常者请遵医嘱食用。'
  },
  {
    id: 'p16', name: '五红汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补气养血', '传统食补', '暖身'], kcal: 220, protein: 6, carbs: 40, fat: 4, time: 40,
    ingredients: [['红枣', 5, '颗', '干货药材'], ['红豆', 20, 'g', '谷物豆类'], ['花生', 15, 'g', '干货药材'], ['枸杞', 3, 'g', '干货药材'], ['红糖', 5, 'g', '调味料']],
    steps: ['红豆、花生提前浸泡 2 小时。', '加红枣和清水煮 30 分钟。', '出锅前加枸杞和红糖，煮至融化即可。'],
    tips: '传统补血甜汤，红糖用量要少；血糖偏高时不加糖。'
  },

  {
    id: 'p17', name: '菌菇豆腐汤', course: 'soup', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['植物蛋白', '鲜香', '低脂'], kcal: 130, protein: 9, carbs: 10, fat: 5, time: 20, proteinType: 'soy',
    ingredients: [['豆腐', 120, 'g', '豆制品'], ['香菇', 40, 'g', '蔬菜'], ['白玉菇', 40, 'g', '蔬菜'], ['姜片', 2, '片', '调味料']],
    steps: ['豆腐切块，菌菇洗净。', '加姜片和清水煮开。', '放入菌菇煮 8 分钟，再加豆腐煮 5 分钟，少许盐调味。'],
    tips: '清爽的植物蛋白汤，素食也能喝得满足。'
  },
  {
    id: 'p18', name: '番茄豆腐汤', course: 'soup', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['开胃', '植物蛋白', '清淡'], kcal: 120, protein: 8, carbs: 11, fat: 5, time: 15, proteinType: 'soy',
    ingredients: [['番茄', 150, 'g', '蔬菜'], ['豆腐', 120, 'g', '豆制品'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['番茄切块，少油炒出汁水。', '加清水煮开，放入豆腐块。', '小火煮 6 分钟，少许盐调味，撒葱花。'],
    tips: '番茄汤底酸甜开胃，适合产后胃口淡的时候。'
  },
  {
    id: 'p19', name: '山药莲藕汤', course: 'soup', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['健脾', '润燥', '温和'], kcal: 160, protein: 3, carbs: 35, fat: 1, time: 45, proteinType: 'veg',
    ingredients: [['铁棍山药', 100, 'g', '蔬菜'], ['莲藕', 100, 'g', '蔬菜'], ['红枣', 3, '颗', '干货药材']],
    steps: ['山药、莲藕去皮切块。', '加红枣和清水煮开。', '小火炖 30 分钟至食材软糯，可不加糖直接喝。'],
    tips: '清甜的素汤，搭配任何主菜都不抢味。'
  },

  {
    id: 'p20', name: '冬瓜木耳汤', course: 'soup', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['消肿', '清淡', '爽口'], kcal: 80, protein: 2, carbs: 10, fat: 2, time: 20, proteinType: 'veg',
    ingredients: [['冬瓜', 200, 'g', '蔬菜'], ['干木耳', 5, 'g', '干货药材'], ['姜片', 2, '片', '调味料']],
    steps: ['冬瓜去皮切片，木耳泡发撕小朵。', '加姜片和清水煮开。', '放入冬瓜和木耳煮 10 分钟，少许盐调味。'],
    tips: '清爽利水，搭配清淡主菜很合适。'
  },

  {
    id: 'p21', name: '冬瓜虾仁汤', course: 'soup', slots: ['lunch', 'dinner'], stages: [1, 2, 3],
    tags: ['消肿', '补钙', '清淡'], kcal: 150, protein: 14, carbs: 6, fat: 7, time: 20, proteinType: 'shrimp',
    ingredients: [['冬瓜', 200, 'g', '蔬菜'], ['虾仁', 60, 'g', '水产'], ['姜片', 2, '片', '调味料']],
    steps: ['冬瓜去皮切片，虾仁去虾线。', '加姜片和清水煮开，放冬瓜煮 8 分钟。', '放入虾仁煮 3 分钟，少许盐调味。'],
    tips: '冬瓜利水，产后水肿明显时可以常喝。'
  },
  {
    id: 'p22', name: '番茄牛肉汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补铁', '开胃', '补蛋白'], kcal: 260, protein: 20, carbs: 10, fat: 14, time: 70, proteinType: 'beef',
    ingredients: [['牛腩', 120, 'g', '肉禽蛋'], ['番茄', 150, 'g', '蔬菜'], ['姜片', 3, '片', '调味料']],
    steps: ['牛腩切块焯水。', '加姜片和热水炖 40 分钟。', '放入番茄再炖 20 分钟，少许盐调味。'],
    tips: '番茄炖得越久，汤的酸甜味越浓。'
  },
  {
    id: 'p23', name: '山药玉米汤', course: 'soup', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['健脾', '清甜', '温和'], kcal: 180, protein: 6, carbs: 32, fat: 4, time: 40,
    ingredients: [['铁棍山药', 100, 'g', '蔬菜'], ['玉米', 100, 'g', '蔬菜'], ['胡萝卜', 50, 'g', '蔬菜']],
    steps: ['山药、胡萝卜切块，玉米切段。', '所有食材加清水煮开。', '转小火煮 25 分钟，少许盐调味。'],
    tips: '三种食材都带天然甜味，不放糖也很好喝。'
  },
  {
    id: 'p24', name: '萝卜丝鲫鱼汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['催乳', '高蛋白', '清甜'], kcal: 280, protein: 25, carbs: 8, fat: 14, time: 35, proteinType: 'fish',
    ingredients: [['鲫鱼', 180, 'g', '水产'], ['白萝卜', 120, 'g', '蔬菜'], ['姜片', 4, '片', '调味料']],
    steps: ['鲫鱼煎至两面微黄，加姜片和开水。', '大火煮 10 分钟至汤色乳白。', '放白萝卜丝再煮 10 分钟，少许盐调味。'],
    tips: '萝卜丝吸油，汤会更清甜不腻。'
  },
  {
    id: 'p25', name: '花生鸡爪汤', course: 'soup', slots: ['lunch', 'dinner'], stages: [2, 3],
    tags: ['催乳', '胶原', '滋补'], kcal: 300, protein: 20, carbs: 8, fat: 20, time: 80, proteinType: 'chicken',
    ingredients: [['鸡爪', 150, 'g', '肉禽蛋'], ['花生', 25, 'g', '干货药材'], ['姜片', 3, '片', '调味料']],
    steps: ['鸡爪剪去指甲焯水，花生提前浸泡。', '加姜片和清水小火炖 50 分钟。', '放入花生再炖 20 分钟，撇油后调味。'],
    tips: '汤面浮油撇掉，喝汤也要吃点肉和花生。'
  },
  {
    id: 'p26', name: '栗子鸡汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['温补', '健脾', '补气'], kcal: 300, protein: 24, carbs: 20, fat: 14, time: 70, proteinType: 'chicken',
    ingredients: [['鸡肉', 150, 'g', '肉禽蛋'], ['板栗', 60, 'g', '干货药材'], ['红枣', 3, '颗', '干货药材'], ['姜片', 3, '片', '调味料']],
    steps: ['鸡肉焯水，板栗去壳。', '加姜片、红枣和清水炖 40 分钟。', '放入板栗再炖 20 分钟，少许盐调味。'],
    tips: '板栗偏温补，容易上火时减少用量。'
  },
  {
    id: 'p27', name: '海带豆腐汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['补碘', '补钙', '清淡'], kcal: 140, protein: 10, carbs: 9, fat: 6, time: 20, proteinType: 'soy',
    ingredients: [['海带', 40, 'g', '水产'], ['豆腐', 120, 'g', '豆制品'], ['姜片', 2, '片', '调味料']],
    steps: ['海带泡发切丝，豆腐切块。', '加姜片和清水煮开，放海带煮 8 分钟。', '放入豆腐再煮 5 分钟，少许盐调味。'],
    tips: '海带含碘丰富，甲状腺功能异常者请遵医嘱。'
  },
  {
    id: 'p28', name: '丝瓜蛤蜊汤', course: 'soup', slots: ['lunch', 'dinner'], stages: [2, 3],
    tags: ['鲜甜', '补锌', '低脂'], kcal: 160, protein: 16, carbs: 7, fat: 7, time: 20, proteinType: 'shrimp',
    ingredients: [['蛤蜊', 150, 'g', '水产'], ['丝瓜', 150, 'g', '蔬菜'], ['姜片', 2, '片', '调味料']],
    steps: ['蛤蜊吐沙洗净，丝瓜去皮切块。', '加姜片和清水煮开，放蛤蜊煮至开口。', '放入丝瓜煮 3 分钟，少许盐调味。'],
    tips: '蛤蜊本身有咸味，盐要少放；海鲜过敏者避开。'
  },

  // ================= 加餐 =================
  {
    id: 'k01', name: '红枣桂圆茶', course: 'snack', slots: ['morningSnack', 'afternoonSnack', 'nightSnack'], stages: ALL,
    tags: ['暖身', '补气', '安神'], kcal: 90, protein: 1, carbs: 21, fat: 0.3, time: 15,
    ingredients: [['红枣', 3, '颗', '干货药材'], ['桂圆', 3, '颗', '干货药材'], ['枸杞', 3, 'g', '干货药材']],
    steps: ['红枣去核，桂圆去壳。', '加 400ml 清水煮 10 分钟。', '关火前放入枸杞，温热饮用。'],
    tips: '恶露量多时先减少桂圆；晚上喝可去桂圆，避免太兴奋。'
  },
  {
    id: 'k02', name: '核桃黑芝麻糊', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: ALL,
    tags: ['补脑', '通便', '乌发'], kcal: 210, protein: 7, carbs: 12, fat: 15, time: 10,
    ingredients: [['核桃', 15, 'g', '干货药材'], ['黑芝麻', 15, 'g', '干货药材'], ['牛奶', 150, 'ml', '奶制品']],
    steps: ['核桃仁和黑芝麻小火炒香。', '放入料理机打碎。', '加温牛奶搅匀，小火煮至微稠即可。'],
    tips: '坚果热量较高，每天一小碗足够。'
  },
  {
    id: 'k03', name: '牛奶炖木瓜', course: 'snack', slots: ['afternoonSnack', 'nightSnack'], stages: S2,
    tags: ['催乳', '补钙', '清甜'], kcal: 160, protein: 7, carbs: 21, fat: 5, time: 20,
    ingredients: [['木瓜', 150, 'g', '水果'], ['牛奶', 200, 'ml', '奶制品']],
    steps: ['木瓜去皮去籽切块。', '放入炖盅，倒入牛奶。', '隔水炖 15 分钟，温热食用。'],
    tips: '牛奶不要炖到沸腾，营养保留更好。'
  },
  {
    id: 'k04', name: '银耳莲子羹', course: 'snack', slots: ['morningSnack', 'afternoonSnack', 'nightSnack'], stages: ALL,
    tags: ['润燥', '补水', '安神'], kcal: 120, protein: 3, carbs: 25, fat: 0.5, time: 60,
    ingredients: [['干银耳', 5, 'g', '干货药材'], ['莲子', 20, 'g', '干货药材'], ['红枣', 2, '颗', '干货药材']],
    steps: ['银耳提前泡发，去黄蒂撕小朵。', '加莲子、红枣和清水。', '小火炖 45 分钟至出胶，可不加糖或少许冰糖。'],
    tips: '银耳羹放凉后会变稠，温热食用更养胃。'
  },
  {
    id: 'k05', name: '蒸苹果', course: 'snack', slots: ['morningSnack', 'afternoonSnack', 'nightSnack'], stages: ALL,
    tags: ['护肠胃', '温和', '果香'], kcal: 100, protein: 0.5, carbs: 26, fat: 0.3, time: 20,
    ingredients: [['苹果', 200, 'g', '水果']],
    steps: ['苹果洗净去核，切块（可带皮）。', '放入碗中，水开后蒸 12 分钟。', '温热食用，连汤汁一起吃掉。'],
    tips: '产后肠胃敏感，水果蒸熟吃更温和。'
  },
  {
    id: 'k06', name: '酸奶坚果杯', course: 'snack', slots: ['afternoonSnack'], stages: S3,
    tags: ['益生菌', '补钙', '有饱腹感'], kcal: 200, protein: 8, carbs: 18, fat: 11, time: 5,
    ingredients: [['酸奶', 150, 'g', '奶制品'], ['核桃', 10, 'g', '干货药材'], ['蓝莓', 30, 'g', '水果']],
    steps: ['酸奶倒入杯中。', '铺上核桃碎和蓝莓。', '拌匀即可食用。'],
    tips: '酸奶提前从冰箱取出回温，避免冰凉刺激。'
  },
  {
    id: 'k07', name: '红豆沙小碗', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: S2,
    tags: ['补血', '利水', '香甜'], kcal: 180, protein: 7, carbs: 35, fat: 0.5, time: 50,
    ingredients: [['红豆', 50, 'g', '谷物豆类'], ['红糖', 3, 'g', '调味料']],
    steps: ['红豆提前浸泡 4 小时。', '加清水煮 40 分钟至软烂。', '用勺子压成泥，加少许红糖拌匀。'],
    tips: '红糖只是提味，少量即可。'
  },
  {
    id: 'k08', name: '山药红枣糕', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: ALL,
    tags: ['健脾', '温和', '手作'], kcal: 190, protein: 4, carbs: 42, fat: 1, time: 35,
    ingredients: [['铁棍山药', 120, 'g', '蔬菜'], ['红枣', 3, '颗', '干货药材'], ['糯米粉', 20, 'g', '谷物豆类']],
    steps: ['山药蒸熟压成泥，红枣去核切碎。', '与糯米粉混合揉成团。', '分成小块，水开后蒸 15 分钟。'],
    tips: '一次做多可冷冻，吃前蒸热；糯米不好消化，少量食用。'
  },
  {
    id: 'k09', name: '小米米糊', course: 'snack', slots: ['morningSnack', 'nightSnack'], stages: [1, 2],
    tags: ['养胃', '流食', '温和'], kcal: 150, protein: 4, carbs: 31, fat: 1.5, time: 20,
    ingredients: [['小米', 30, 'g', '谷物豆类'], ['燕麦', 10, 'g', '谷物豆类']],
    steps: ['小米和燕麦洗净，浸泡 20 分钟。', '放入破壁机，加 300ml 温水。', '选择米糊模式，打好后趁温热喝。'],
    tips: '产后第一周胃口不佳时，流食更容易入口。'
  },
  {
    id: 'k10', name: '香蕉燕麦杯', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: S2,
    tags: ['通便', '有饱腹感', '快手'], kcal: 230, protein: 6, carbs: 42, fat: 5, time: 8,
    ingredients: [['香蕉', 100, 'g', '水果'], ['即食燕麦', 20, 'g', '谷物豆类'], ['牛奶', 100, 'ml', '奶制品']],
    steps: ['香蕉压成泥。', '与燕麦、温牛奶混合。', '静置 3 分钟让燕麦吸水，拌匀食用。'],
    tips: '香蕉选熟透的，通便效果更好。'
  },
  {
    id: 'k11', name: '酒酿蛋花', course: 'snack', slots: ['afternoonSnack', 'nightSnack'], stages: S2,
    tags: ['催乳', '暖身', '含酒精'], kcal: 190, protein: 9, carbs: 26, fat: 5, time: 12,
    ingredients: [['醪糟', 80, 'g', '其他'], ['鸡蛋', 1, '个', '肉禽蛋'], ['枸杞', 3, 'g', '干货药材']],
    steps: ['醪糟加 300ml 清水煮开。', '淋入打散的蛋液，煮成蛋花。', '撒枸杞即可，务必充分煮沸。'],
    tips: '传统催乳甜汤，但含微量酒精。母乳喂养建议煮沸挥发酒精或咨询医生，勾选“含酒精”忌口后会自动排除。'
  },
  {
    id: 'k12', name: '缤纷水果盘', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: S2,
    tags: ['维C', '清爽', '补水'], kcal: 110, protein: 2, carbs: 26, fat: 0.5, time: 8,
    ingredients: [['橙子', 100, 'g', '水果'], ['猕猴桃', 80, 'g', '水果'], ['蓝莓', 30, 'g', '水果']],
    steps: ['水果洗净，橙子去皮切块，猕猴桃去皮切片。', '摆盘，放至室温后食用。'],
    tips: '水果从冰箱取出后放置 20 分钟再吃，避免生冷刺激。'
  },
  {
    id: 'k13', name: '紫薯牛奶羹', course: 'snack', slots: ['morningSnack', 'nightSnack'], stages: ALL,
    tags: ['补钙', '通便', '香甜'], kcal: 210, protein: 8, carbs: 32, fat: 6, time: 20,
    ingredients: [['紫薯', 100, 'g', '蔬菜'], ['牛奶', 200, 'ml', '奶制品']],
    steps: ['紫薯去皮切块蒸熟。', '压成泥，加入温牛奶。', '搅拌均匀，小火加热至微温即可。'],
    tips: '紫薯富含花青素和膳食纤维，帮助产后排便。'
  },
  {
    id: 'k14', name: '花生红枣汤', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: ALL,
    tags: ['补血', '润燥', '温热'], kcal: 180, protein: 6, carbs: 24, fat: 7, time: 40,
    ingredients: [['花生', 25, 'g', '干货药材'], ['红枣', 4, '颗', '干货药材']],
    steps: ['花生提前浸泡 2 小时。', '与红枣一起加清水煮 30 分钟。', '连汤带料温热食用。'],
    tips: '花生红衣别丢，传统认为有助补血。'
  },
  {
    id: 'k15', name: '红枣蒸蛋', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: [1, 2],
    tags: ['补血', '高蛋白', '嫩滑'], kcal: 180, protein: 10, carbs: 12, fat: 10, time: 20,
    ingredients: [['鸡蛋', 1, '个', '肉禽蛋'], ['红枣', 3, '颗', '干货药材'], ['红糖', 2, 'g', '调味料']],
    steps: ['红枣去核切碎，加入打散的鸡蛋。', '加 100ml 温水和少许红糖搅匀，过筛。', '盖住碗口，水开后中小火蒸 10 分钟。'],
    tips: '甜口蒸蛋更有食欲，红糖少量即可。'
  },
  {
    id: 'k16', name: '蒸雪梨', course: 'snack', slots: ['morningSnack', 'afternoonSnack', 'nightSnack'], stages: ALL,
    tags: ['润燥', '润肺', '清甜'], kcal: 110, protein: 0.5, carbs: 28, fat: 0.3, time: 25,
    ingredients: [['雪梨', 200, 'g', '水果'], ['枸杞', 3, 'g', '干货药材']],
    steps: ['雪梨洗净去核切块（可带皮）。', '放入碗中，撒枸杞。', '水开后蒸 15 分钟，温热食用。'],
    tips: '嗓子干、咳嗽时可以试试，但症状持续请就医。'
  },
  {
    id: 'k17', name: '南瓜牛奶羹', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: S2,
    tags: ['补钙', '养胃', '香甜'], kcal: 190, protein: 7, carbs: 27, fat: 6, time: 20,
    ingredients: [['南瓜', 150, 'g', '蔬菜'], ['牛奶', 200, 'ml', '奶制品']],
    steps: ['南瓜去皮蒸熟，压成泥。', '加入温牛奶搅拌均匀。', '小火加热至微温即可，不要煮沸。'],
    tips: '乳糖不耐受可以把牛奶换成无乳糖牛奶。'
  },
  {
    id: 'k18', name: '黑米豆浆', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: S2,
    tags: ['补血', '植物蛋白', '香浓'], kcal: 180, protein: 8, carbs: 26, fat: 5, time: 25,
    ingredients: [['黑米', 20, 'g', '谷物豆类'], ['黄豆', 30, 'g', '谷物豆类']],
    steps: ['黑米和黄豆提前浸泡 4 小时。', '放入豆浆机，加 400ml 清水。', '打成熟豆浆后趁温热喝，可不过滤。'],
    tips: '豆类容易胀气，第一次喝先少量试试。'
  },
  {
    id: 'k19', name: '紫米糕', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: S2,
    tags: ['补血', '手作', '有饱腹感'], kcal: 210, protein: 5, carbs: 45, fat: 1.5, time: 40,
    ingredients: [['紫米', 40, 'g', '谷物豆类'], ['糯米粉', 20, 'g', '谷物豆类'], ['红枣', 2, '颗', '干货药材']],
    steps: ['紫米蒸熟，加入糯米粉和少许温水揉匀。', '拌入红枣碎，压入模具。', '水开后蒸 20 分钟，放温后切块。'],
    tips: '糯米制品不好消化，一次吃一小块即可。'
  },
  {
    id: 'k20', name: '桂圆红枣银耳羹', course: 'snack', slots: ['morningSnack', 'afternoonSnack', 'nightSnack'], stages: S2,
    tags: ['安神', '润燥', '补气'], kcal: 140, protein: 2, carbs: 32, fat: 0.4, time: 60,
    ingredients: [['干银耳', 5, 'g', '干货药材'], ['红枣', 3, '颗', '干货药材'], ['桂圆', 3, '颗', '干货药材']],
    steps: ['银耳泡发撕小朵，红枣去核。', '加红枣和清水炖 40 分钟至出胶。', '放入桂圆再煮 10 分钟，可不加糖。'],
    tips: '晚上容易燥热或恶露多时，少放桂圆。'
  },

  // ================= 主食（v4 扩充） =================
  {
    id: 's21', name: '南瓜小米发糕', course: 'staple', slots: ['breakfast'], stages: ALL,
    tags: ['养胃', '香甜', '手作'], kcal: 235, protein: 6, carbs: 47, fat: 3, time: 50,
    ingredients: [['小米粉', 50, 'g', '谷物豆类'], ['面粉', 30, 'g', '谷物豆类'], ['南瓜', 100, 'g', '蔬菜'], ['酵母', 2, 'g', '调味料']],
    steps: ['南瓜去皮蒸熟，压成细腻的南瓜泥。', '小米粉、面粉和酵母混合，加入南瓜泥和适量温水，拌成浓稠面糊。', '盖上湿布发酵 30 分钟，倒入抹了薄油的模具。', '水开后大火蒸 20 分钟，关火焖 5 分钟再取出切块。'],
    tips: '发糕比馒头更松软，产后第一周也能吃；一次多做些冷冻，吃前蒸热。'
  },
  {
    id: 's22', name: '全麦鸡蛋三明治', course: 'staple', slots: ['breakfast'], stages: S2,
    tags: ['快手', '高蛋白', '补钙'], kcal: 320, protein: 18, carbs: 34, fat: 13, time: 10, method: '煎',
    ingredients: [['全麦面包', 80, 'g', '谷物豆类'], ['鸡蛋', 2, '个', '肉禽蛋'], ['生菜', 40, 'g', '蔬菜'], ['番茄', 60, 'g', '蔬菜'], ['食用油', 3, 'g', '调味料']],
    steps: ['平底锅刷薄油，把鸡蛋煎成两个荷包蛋。', '全麦面包放入锅中烘热，或用电饭煲蒸 2 分钟至柔软。', '依次铺上生菜、番茄片和煎蛋，对半切开即可。'],
    tips: '全麦面包选配料表干净的；怕凉可以先把蔬菜用温水过一下。'
  },
  {
    id: 's23', name: '牛肉燕麦粥', course: 'staple', slots: ['breakfast'], stages: S2,
    tags: ['补铁', '高蛋白', '有饱腹感'], kcal: 330, protein: 20, carbs: 40, fat: 9, time: 30,
    ingredients: [['即食燕麦', 45, 'g', '谷物豆类'], ['牛肉末', 40, 'g', '肉禽蛋'], ['胡萝卜', 40, 'g', '蔬菜'], ['姜丝', 3, 'g', '调味料'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['牛肉末加姜丝焯水，撇去浮沫后捞出。', '锅中加 500ml 清水，放入燕麦和胡萝卜丁煮 10 分钟。', '加入牛肉末再煮 5 分钟，撒葱花，少许盐调味。'],
    tips: '燕麦吸水快，煮的时候勤搅拌，避免糊底。'
  },
  {
    id: 's24', name: '香菇鸡肉粥', course: 'staple', slots: ['breakfast'], stages: ALL,
    tags: ['养胃', '补蛋白', '鲜香'], kcal: 300, protein: 18, carbs: 43, fat: 6, time: 35,
    ingredients: [['大米', 40, 'g', '谷物豆类'], ['鸡肉', 50, 'g', '肉禽蛋'], ['香菇', 30, 'g', '蔬菜'], ['姜丝', 3, 'g', '调味料'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['大米淘洗后加 600ml 清水煮开，转小火煮 20 分钟。', '鸡肉切小丁，香菇切薄片。', '把鸡肉和香菇放入粥中再煮 10 分钟，加姜丝和少许盐，撒葱花。'],
    tips: '香菇自带鲜味，不用额外加鸡精；鸡肉切小一点更容易消化。'
  },
  {
    id: 's25', name: '青菜瘦肉粥', course: 'staple', slots: ['breakfast'], stages: ALL,
    tags: ['易消化', '补铁', '清淡'], kcal: 270, protein: 15, carbs: 40, fat: 5, time: 35,
    ingredients: [['大米', 40, 'g', '谷物豆类'], ['猪瘦肉', 40, 'g', '肉禽蛋'], ['小青菜', 60, 'g', '蔬菜'], ['姜丝', 3, 'g', '调味料']],
    steps: ['大米加水煮成软粥。', '猪瘦肉切细丝，用姜丝和少许淀粉抓匀。', '粥煮至软烂后下肉丝煮 3 分钟，最后放青菜碎煮 1 分钟。'],
    tips: '肉丝先用淀粉抓一下更嫩；青菜最后放，颜色和营养都更好。'
  },
  {
    id: 's26', name: '虾仁小馄饨', course: 'staple', slots: ['breakfast'], stages: S2,
    tags: ['高蛋白', '补钙', '鲜甜'], kcal: 325, protein: 18, carbs: 36, fat: 12, time: 25,
    ingredients: [['馄饨皮', 10, '张', '谷物豆类'], ['虾仁', 60, 'g', '水产'], ['猪肉末', 30, 'g', '肉禽蛋'], ['小青菜', 40, 'g', '蔬菜'], ['姜末', 3, 'g', '调味料']],
    steps: ['虾仁去虾线剁碎，与猪肉末、姜末和少许盐拌匀。', '用馄饨皮包好，捏紧收口。', '水开后下馄饨，浮起后加半碗冷水，再次沸腾后放青菜煮 1 分钟。'],
    tips: '一次多包一些平铺冷冻，早餐不用现包。'
  },
  {
    id: 's27', name: '红枣玉米发糕', course: 'staple', slots: ['breakfast'], stages: ALL,
    tags: ['补血', '养胃', '手作'], kcal: 245, protein: 6, carbs: 50, fat: 2.5, time: 50,
    ingredients: [['玉米面', 50, 'g', '谷物豆类'], ['面粉', 30, 'g', '谷物豆类'], ['红枣', 4, '颗', '干货药材'], ['酵母', 2, 'g', '调味料']],
    steps: ['玉米面、面粉和酵母混合，加约 120ml 温水拌成面糊。', '红枣去核切碎，拌入面糊，发酵 30 分钟。', '倒入模具，大火蒸 20 分钟，焖 5 分钟后切块。'],
    tips: '玉米面比例高会略粗，喜欢细腻口感可以把玉米面减到 30g。'
  },
  {
    id: 's28', name: '鲜虾云吞面', course: 'staple', slots: ['breakfast'], stages: [1, 2, 3],
    tags: ['高蛋白', '补钙', '暖胃'], kcal: 380, protein: 22, carbs: 50, fat: 9, time: 20,
    ingredients: [['细面条', 60, 'g', '谷物豆类'], ['虾仁', 50, 'g', '水产'], ['馄饨皮', 6, '张', '谷物豆类'], ['小青菜', 50, 'g', '蔬菜'], ['鸡汤', 300, 'ml', '其他']],
    steps: ['虾仁切碎，用少许盐拌匀，包成小馄饨。', '鸡汤烧开，下面条煮至软烂，再下馄饨煮至浮起。', '放入小青菜烫熟，连汤盛出。'],
    tips: '可以提前包好馄饨冷冻，早上 10 分钟就能吃上。'
  },
  {
    id: 's29', name: '芝麻酱拌面', course: 'staple', slots: ['breakfast'], stages: S2,
    tags: ['补钙', '快手', '香浓'], kcal: 360, protein: 12, carbs: 52, fat: 12, time: 15,
    ingredients: [['细面条', 80, 'g', '谷物豆类'], ['芝麻酱', 15, 'g', '干货药材'], ['小青菜', 60, 'g', '蔬菜'], ['生抽', 5, 'g', '调味料'], ['香油', 3, 'g', '调味料']],
    steps: ['芝麻酱用温开水一点点澥开，加生抽和香油调匀。', '面条煮至软烂，小青菜烫熟。', '面条沥干，淋上芝麻酱汁拌匀，放上青菜。'],
    tips: '芝麻酱钙含量高，但热量也高，15g 左右刚好；可搭配一个水煮蛋。'
  },
  {
    id: 's30', name: '番茄鸡蛋面', course: 'staple', slots: ['breakfast'], stages: ALL,
    tags: ['开胃', '易消化', '家常'], kcal: 350, protein: 16, carbs: 52, fat: 9, time: 15,
    ingredients: [['细面条', 80, 'g', '谷物豆类'], ['鸡蛋', 1, '个', '肉禽蛋'], ['番茄', 120, 'g', '蔬菜'], ['小青菜', 50, 'g', '蔬菜'], ['食用油', 4, 'g', '调味料']],
    steps: ['番茄切小块，鸡蛋打散。', '热锅少油炒散鸡蛋盛出，下番茄炒出汁水。', '加 500ml 清水烧开，下面条煮软，放青菜和鸡蛋，少许盐调味。'],
    tips: '番茄炒出沙再加水，汤底更浓郁开胃。'
  },
  {
    id: 's31', name: '红薯糙米饭', course: 'staple', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['通便', '膳食纤维', '有饱腹感'], kcal: 320, protein: 7, carbs: 67, fat: 2, time: 40,
    ingredients: [['大米', 50, 'g', '谷物豆类'], ['糙米', 30, 'g', '谷物豆类'], ['红薯', 80, 'g', '蔬菜']],
    steps: ['糙米提前浸泡 2 小时，红薯去皮切块。', '与大米混合放入电饭煲，加水至正常刻度。', '煮熟后焖 10 分钟，轻轻拌匀。'],
    tips: '红薯会出水，煮饭时比平时少放一点水；容易胀气时红薯减半。'
  },
  {
    id: 's32', name: '紫菜饭团', course: 'staple', slots: ['breakfast', 'lunch'], stages: S3,
    tags: ['补碘', '快手', '方便'], kcal: 300, protein: 9, carbs: 55, fat: 5, time: 20, method: '拌',
    ingredients: [['大米', 70, 'g', '谷物豆类'], ['紫菜', 3, 'g', '水产'], ['鸡蛋', 1, '个', '肉禽蛋'], ['胡萝卜', 30, 'g', '蔬菜'], ['黑芝麻', 3, 'g', '干货药材']],
    steps: ['大米煮成软硬适中的米饭，放至温热。', '鸡蛋摊成蛋皮切丝，胡萝卜焯水切碎。', '米饭拌入黑芝麻和少许盐，包入蛋丝和胡萝卜，捏成饭团，外面裹紫菜。'],
    tips: '饭团适合带娃没空吃饭时垫肚子，搭配一杯温豆浆更完整。'
  },
  {
    id: 's33', name: '板栗鸡肉焖饭', course: 'staple', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['温补', '补蛋白', '香甜'], kcal: 430, protein: 22, carbs: 60, fat: 10, time: 45, method: '焖',
    ingredients: [['大米', 70, 'g', '谷物豆类'], ['鸡肉', 80, 'g', '肉禽蛋'], ['板栗', 50, 'g', '干货药材'], ['胡萝卜', 40, 'g', '蔬菜'], ['姜片', 2, '片', '调味料']],
    steps: ['鸡肉切小块焯水，板栗去壳，胡萝卜切丁。', '锅中少油炒香姜片和鸡肉，加入板栗、胡萝卜翻炒。', '与淘洗好的大米一起放入电饭煲，加水焖熟，拌匀后盛出。'],
    tips: '板栗偏温补，容易上火时减少用量；鸡肉换成鸡腿肉更嫩。'
  },
  {
    id: 's34', name: '豌豆虾仁焖饭', course: 'staple', slots: ['lunch', 'dinner'], stages: [2, 3, 4],
    tags: ['高蛋白', '补钙', '鲜香'], kcal: 400, protein: 20, carbs: 58, fat: 8, time: 45, method: '焖',
    ingredients: [['大米', 70, 'g', '谷物豆类'], ['虾仁', 60, 'g', '水产'], ['豌豆', 40, 'g', '蔬菜'], ['玉米粒', 30, 'g', '蔬菜'], ['胡萝卜', 30, 'g', '蔬菜']],
    steps: ['虾仁去虾线，用少许姜末腌 5 分钟。', '豌豆、玉米粒和胡萝卜丁略炒。', '与大米一起入电饭煲焖熟，最后 5 分钟铺上虾仁，焖至变色拌匀。'],
    tips: '虾仁最后放，口感更嫩；对海鲜过敏可换成鸡肉丁。'
  },
  {
    id: 's35', name: '鹰嘴豆杂粮饭', course: 'staple', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['植物蛋白', '控糖', '有饱腹感'], kcal: 340, protein: 12, carbs: 60, fat: 4, time: 50,
    ingredients: [['大米', 50, 'g', '谷物豆类'], ['藜麦', 20, 'g', '谷物豆类'], ['鹰嘴豆', 30, 'g', '谷物豆类'], ['小米', 20, 'g', '谷物豆类']],
    steps: ['鹰嘴豆提前浸泡 6 小时，藜麦淘洗去皂苷。', '所有谷物混合放入电饭煲，加水至正常刻度。', '煮熟后焖 10 分钟，用饭勺翻松。'],
    tips: '鹰嘴豆有嚼劲，第一次吃先少量；豆类容易胀气，慢慢增加比例。'
  },
  {
    id: 's36', name: '山药牛肉粥', course: 'staple', slots: ['breakfast'], stages: S2,
    tags: ['健脾', '补铁', '暖胃'], kcal: 310, protein: 18, carbs: 42, fat: 6, time: 40,
    ingredients: [['大米', 40, 'g', '谷物豆类'], ['牛肉末', 40, 'g', '肉禽蛋'], ['铁棍山药', 60, 'g', '蔬菜'], ['姜丝', 3, 'g', '调味料'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['大米加水煮开，转小火煮 15 分钟。', '山药去皮切小丁，牛肉末焯水。', '把山药和牛肉放入粥中再煮 15 分钟，加姜丝和少许盐，撒葱花。'],
    tips: '山药切丁后泡清水防氧化；牛肉末焯水可以去腥和多余油脂。'
  },

  // ================= 主菜（v4 扩充） =================
  {
    id: 'm42', name: '蒜蓉粉丝蒸虾', course: 'main', slots: ['lunch', 'dinner'], stages: [2, 3, 4],
    tags: ['高蛋白', '补钙', '低脂'], kcal: 230, protein: 24, carbs: 14, fat: 8, time: 25, proteinType: 'shrimp',
    ingredients: [['鲜虾', 200, 'g', '水产'], ['粉丝', 30, 'g', '谷物豆类'], ['蒜', 4, '瓣', '调味料'], ['生抽', 5, 'g', '调味料'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['粉丝用温水泡软，铺在盘底。', '鲜虾开背去虾线，摆在粉丝上。', '蒜末用少许油炒香，铺在虾上，淋生抽。', '水开后大火蒸 8 分钟，撒葱花即可。'],
    tips: '蒸虾时间不要太长，虾肉变白卷曲就熟了；对海鲜过敏者避开。'
  },
  {
    id: 'm43', name: '白灼虾', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['高蛋白', '低脂', '鲜甜'], kcal: 150, protein: 26, carbs: 1, fat: 3, time: 15, proteinType: 'shrimp', method: '灼',
    ingredients: [['鲜虾', 200, 'g', '水产'], ['姜片', 3, '片', '调味料'], ['小葱', 5, 'g', '蔬菜'], ['生抽', 5, 'g', '调味料']],
    steps: ['鲜虾剪去虾须，挑去虾线。', '锅中水加姜片和葱段烧开，放入鲜虾煮 2-3 分钟。', '虾身变红卷曲后捞出，蘸少许生抽食用。'],
    tips: '白灼能最大程度保留虾的鲜甜和蛋白质，蘸料清淡一点更好。'
  },
  {
    id: 'm44', name: '虾仁炒西兰花', course: 'main', slots: ['lunch', 'dinner'], stages: [1, 2, 3],
    tags: ['高蛋白', '补钙', '清爽'], kcal: 190, protein: 18, carbs: 8, fat: 9, time: 15, proteinType: 'shrimp',
    ingredients: [['虾仁', 100, 'g', '水产'], ['西兰花', 150, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['食用油', 4, 'g', '调味料']],
    steps: ['西兰花掰小朵，用淡盐水浸泡后焯水 1 分钟。', '虾仁去虾线，用姜片腌 5 分钟。', '热锅少油炒香蒜末，下虾仁炒至变色，再放西兰花翻炒，少许盐调味。'],
    tips: '西兰花焯水后过一下凉水，颜色更翠绿，口感也更脆。'
  },
  {
    id: 'm45', name: '虾仁玉米粒', course: 'main', slots: ['lunch', 'dinner'], stages: [2, 3, 4],
    tags: ['鲜甜', '低脂', '补钙'], kcal: 200, protein: 16, carbs: 16, fat: 8, time: 15, proteinType: 'shrimp',
    ingredients: [['虾仁', 100, 'g', '水产'], ['玉米粒', 100, 'g', '蔬菜'], ['胡萝卜', 40, 'g', '蔬菜'], ['豌豆', 30, 'g', '蔬菜'], ['食用油', 4, 'g', '调味料']],
    steps: ['虾仁去虾线，胡萝卜切小丁，豌豆和玉米粒洗净。', '热锅少油，下胡萝卜、豌豆和玉米粒翻炒 3 分钟。', '加入虾仁炒至变色，少许盐调味即可。'],
    tips: '颜色丰富的一道菜，没胃口时也能多吃两口；虾仁不要久炒。'
  },
  {
    id: 'm46', name: '三文鱼豆腐饼', course: 'main', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['补钙', '优质蛋白', '补脑'], kcal: 260, protein: 22, carbs: 8, fat: 16, time: 25, proteinType: 'fish', method: '煎',
    ingredients: [['三文鱼', 100, 'g', '水产'], ['豆腐', 80, 'g', '豆制品'], ['鸡蛋', 1, '个', '肉禽蛋'], ['淀粉', 10, 'g', '谷物豆类'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['三文鱼去皮去刺，剁成泥；豆腐压碎。', '与蛋液、淀粉、葱花和少许盐拌匀。', '平底锅刷薄油，舀入鱼泥压成小饼，小火煎至两面金黄。'],
    tips: '三文鱼油脂丰富，煎的时候少放油；一定要确认没有鱼刺。'
  },
  {
    id: 'm47', name: '香煎龙利鱼柳', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['高蛋白', '低脂', '无刺'], kcal: 200, protein: 26, carbs: 4, fat: 9, time: 20, proteinType: 'fish', method: '煎',
    ingredients: [['龙利鱼', 150, 'g', '水产'], ['淀粉', 8, 'g', '谷物豆类'], ['鸡蛋', 1, '个', '肉禽蛋'], ['食用油', 4, 'g', '调味料'], ['生抽', 3, 'g', '调味料']],
    steps: ['龙利鱼解冻后吸干水分，切成长条，用少许生抽腌 5 分钟。', '鱼柳先蘸蛋液，再裹一层薄淀粉。', '平底锅刷薄油，小火煎至两面金黄、内部熟透。'],
    tips: '龙利鱼几乎无刺，适合怕挑刺的妈妈；煎至用筷子能轻松戳透即可。'
  },
  {
    id: 'm48', name: '洋葱炒牛肉', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补铁', '高蛋白', '开胃'], kcal: 260, protein: 22, carbs: 10, fat: 14, time: 20, proteinType: 'beef',
    ingredients: [['牛里脊', 120, 'g', '肉禽蛋'], ['洋葱', 100, 'g', '蔬菜'], ['彩椒', 50, 'g', '蔬菜'], ['食用油', 5, 'g', '调味料'], ['生抽', 5, 'g', '调味料']],
    steps: ['牛里脊逆纹切薄片，用少许生抽和淀粉抓匀腌 10 分钟。', '洋葱和彩椒切块。', '热锅少油，下牛肉快速滑炒至变色盛出；再炒洋葱彩椒，倒回牛肉炒匀。'],
    tips: '牛肉逆着纹理切才嫩；全程大火快炒，避免肉质变老。'
  },
  {
    id: 'm49', name: '芹菜炒牛肉', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补铁', '膳食纤维', '清香'], kcal: 240, protein: 21, carbs: 8, fat: 13, time: 20, proteinType: 'beef',
    ingredients: [['牛里脊', 120, 'g', '肉禽蛋'], ['西芹', 120, 'g', '蔬菜'], ['胡萝卜', 30, 'g', '蔬菜'], ['食用油', 4, 'g', '调味料'], ['生抽', 5, 'g', '调味料']],
    steps: ['牛肉切薄片，用生抽和少许淀粉腌 10 分钟。', '西芹去筋切段，胡萝卜切片，焯水 1 分钟。', '热锅少油滑炒牛肉至变色，加入西芹和胡萝卜翻炒 2 分钟即可。'],
    tips: '西芹纤维较粗，切斜段并焯水后更好消化。'
  },
  {
    id: 'm50', name: '芦笋炒鸡柳', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['高蛋白', '低脂', '清爽'], kcal: 210, protein: 24, carbs: 6, fat: 10, time: 20, proteinType: 'chicken',
    ingredients: [['鸡胸肉', 120, 'g', '肉禽蛋'], ['芦笋', 120, 'g', '蔬菜'], ['彩椒', 40, 'g', '蔬菜'], ['食用油', 4, 'g', '调味料']],
    steps: ['鸡胸肉切条，用少许淀粉和盐抓匀。', '芦笋去老根切段，彩椒切条。', '热锅少油，下鸡柳炒至变白，加入芦笋和彩椒翻炒 3 分钟，少许盐调味。'],
    tips: '鸡胸肉容易柴，腌的时候加一点淀粉或蛋清能锁住水分。'
  },
  {
    id: 'm51', name: '莲藕炒鸡丁', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补蛋白', '健脾', '有嚼感'], kcal: 240, protein: 20, carbs: 16, fat: 11, time: 25, proteinType: 'chicken',
    ingredients: [['鸡腿', 120, 'g', '肉禽蛋'], ['莲藕', 100, 'g', '蔬菜'], ['胡萝卜', 40, 'g', '蔬菜'], ['食用油', 4, 'g', '调味料']],
    steps: ['鸡腿去骨切丁，用少许生抽和淀粉腌 10 分钟。', '莲藕和胡萝卜切丁，莲藕焯水 1 分钟。', '热锅少油炒鸡丁至变色，加入莲藕和胡萝卜丁翻炒 3 分钟，调味出锅。'],
    tips: '鸡腿肉比鸡胸更嫩；莲藕焯水后炒出来更爽脆。'
  },
  {
    id: 'm52', name: '鸡丝拌黄瓜', course: 'main', slots: ['breakfast', 'lunch', 'dinner'], stages: S3,
    tags: ['清爽', '高蛋白', '低脂'], kcal: 170, protein: 20, carbs: 5, fat: 8, time: 15, proteinType: 'chicken', method: '拌',
    ingredients: [['鸡胸肉', 100, 'g', '肉禽蛋'], ['黄瓜', 100, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['香油', 3, 'g', '调味料'], ['米醋', 5, 'g', '调味料']],
    steps: ['鸡胸肉冷水下锅，加姜片煮熟，放凉后撕成细丝。', '黄瓜切丝，蒜切末。', '鸡丝和黄瓜丝加蒜末、米醋、香油和少许盐拌匀。'],
    tips: '煮鸡胸的汤别倒，可以拿来煮青菜或面条，味道很鲜。'
  },
  {
    id: 'm53', name: '珍珠糯米丸子', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补蛋白', '软糯', '手作'], kcal: 330, protein: 17, carbs: 42, fat: 11, time: 45, proteinType: 'pork', method: '蒸',
    ingredients: [['猪肉末', 100, 'g', '肉禽蛋'], ['糯米', 40, 'g', '谷物豆类'], ['莲藕', 30, 'g', '蔬菜'], ['胡萝卜', 20, 'g', '蔬菜'], ['姜末', 3, 'g', '调味料']],
    steps: ['糯米提前浸泡 4 小时，沥干备用。', '猪肉末加莲藕碎、胡萝卜碎、姜末和少许盐，顺一个方向搅上劲。', '搓成小丸子，滚上一层糯米，摆入盘中。', '水开后蒸 20 分钟至糯米透明熟透。'],
    tips: '糯米不易消化，一次吃三四个即可；可以一次多做些冷冻。'
  },
  {
    id: 'm54', name: '白菜肉卷', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补蛋白', '清淡', '有蔬菜'], kcal: 230, protein: 18, carbs: 8, fat: 14, time: 40, proteinType: 'pork', method: '蒸',
    ingredients: [['猪肉末', 100, 'g', '肉禽蛋'], ['娃娃菜', 150, 'g', '蔬菜'], ['香菇', 30, 'g', '蔬菜'], ['胡萝卜', 30, 'g', '蔬菜'], ['淀粉', 5, 'g', '谷物豆类']],
    steps: ['娃娃菜叶整片焯软，沥干水分。', '肉末加香菇碎、胡萝卜碎、淀粉和少许盐拌匀。', '把肉馅放在菜叶上卷起，摆入盘中。', '水开后蒸 15 分钟，蒸出的汤汁勾薄芡淋回即可。'],
    tips: '菜叶焯软才好卷；一次多做一些，第二天蒸热照样好吃。'
  },
  {
    id: 'm55', name: '香菇肉末蒸豆腐', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补钙', '高蛋白', '嫩滑'], kcal: 240, protein: 20, carbs: 9, fat: 14, time: 30, proteinType: 'pork', method: '蒸',
    ingredients: [['豆腐', 150, 'g', '豆制品'], ['猪肉末', 60, 'g', '肉禽蛋'], ['香菇', 30, 'g', '蔬菜'], ['小葱', 5, 'g', '蔬菜'], ['生抽', 5, 'g', '调味料']],
    steps: ['豆腐切厚片摆入盘中。', '肉末加香菇碎和少许生抽拌匀，铺在豆腐上。', '水开后蒸 15 分钟，撒葱花，淋少许热油或香油。'],
    tips: '豆腐选嫩豆腐口感更滑；肉末铺薄一点更容易蒸熟。'
  },
  {
    id: 'm56', name: '木耳炒肉片', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补铁', '通便', '家常'], kcal: 230, protein: 18, carbs: 8, fat: 14, time: 20, proteinType: 'pork',
    ingredients: [['猪瘦肉', 100, 'g', '肉禽蛋'], ['干木耳', 5, 'g', '干货药材'], ['彩椒', 40, 'g', '蔬菜'], ['食用油', 5, 'g', '调味料']],
    steps: ['木耳提前泡发，撕成小朵，焯水 1 分钟。', '猪瘦肉切片，用少许生抽和淀粉腌 10 分钟。', '热锅少油炒肉片至变色，加入木耳和彩椒翻炒 2 分钟，调味出锅。'],
    tips: '木耳泡发不要超过 2 小时，现泡现用更安全。'
  },
  {
    id: 'm57', name: '丝瓜炒肉片', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['清热', '补蛋白', '清甜'], kcal: 210, protein: 17, carbs: 7, fat: 12, time: 20, proteinType: 'pork',
    ingredients: [['猪瘦肉', 100, 'g', '肉禽蛋'], ['丝瓜', 150, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['食用油', 4, 'g', '调味料']],
    steps: ['猪瘦肉切片，用少许淀粉和盐抓匀。', '丝瓜去皮切滚刀块。', '热锅少油炒香蒜末，下肉片炒至变色，加入丝瓜炒软，少许盐调味。'],
    tips: '丝瓜容易出水，炒到刚变软就好，汤水拌饭很鲜。'
  },
  {
    id: 'm58', name: '西葫芦炒蛋', course: 'main', slots: ['breakfast', 'lunch', 'dinner'], stages: ALL,
    tags: ['家常', '高蛋白', '清淡'], kcal: 190, protein: 14, carbs: 7, fat: 12, time: 12, proteinType: 'egg',
    ingredients: [['鸡蛋', 2, '个', '肉禽蛋'], ['西葫芦', 150, 'g', '蔬菜'], ['食用油', 5, 'g', '调味料']],
    steps: ['鸡蛋打散，西葫芦切片。', '热锅少油炒散鸡蛋盛出。', '下西葫芦炒软，倒回鸡蛋，少许盐调味。'],
    tips: '西葫芦不要炒太久，保持一点脆感更好吃。'
  },
  {
    id: 'm59', name: '虾皮蒸蛋', course: 'main', slots: ['breakfast', 'lunch'], stages: [1, 2, 3],
    tags: ['补钙', '高蛋白', '嫩滑'], kcal: 170, protein: 15, carbs: 2, fat: 11, time: 15, proteinType: 'egg', method: '蒸',
    ingredients: [['鸡蛋', 2, '个', '肉禽蛋'], ['虾皮', 5, 'g', '水产'], ['温水', 120, 'ml', '其他'], ['香油', 2, 'g', '调味料']],
    steps: ['虾皮用温水冲洗两遍，去除多余盐分。', '鸡蛋加温水打散，过筛去浮沫。', '蛋液倒入碗中，撒上虾皮，盖盘蒸 10 分钟，出锅淋香油。'],
    tips: '虾皮含盐高，记得先冲洗；对海鲜过敏者不要加。'
  },
  {
    id: 'm60', name: '洋葱炒蛋', course: 'main', slots: ['breakfast', 'lunch'], stages: ALL,
    tags: ['开胃', '高蛋白', '家常'], kcal: 200, protein: 13, carbs: 8, fat: 13, time: 12, proteinType: 'egg',
    ingredients: [['鸡蛋', 2, '个', '肉禽蛋'], ['洋葱', 100, 'g', '蔬菜'], ['食用油', 5, 'g', '调味料']],
    steps: ['洋葱切丝，鸡蛋打散。', '热锅少油炒散鸡蛋盛出。', '下洋葱炒至透明变软，倒回鸡蛋翻炒均匀，少许盐调味。'],
    tips: '洋葱炒软后甜味明显，怕辛辣可以多炒一会儿。'
  },
  {
    id: 'm61', name: '豆腐蒸蛋', course: 'main', slots: ['breakfast', 'lunch', 'dinner'], stages: ALL,
    tags: ['补钙', '高蛋白', '嫩滑'], kcal: 190, protein: 17, carbs: 5, fat: 12, time: 20, proteinType: 'egg', method: '蒸',
    ingredients: [['鸡蛋', 2, '个', '肉禽蛋'], ['豆腐', 100, 'g', '豆制品'], ['温水', 80, 'ml', '其他'], ['香油', 2, 'g', '调味料'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['豆腐压成泥，鸡蛋加温水打散。', '豆腐泥与蛋液混合，过筛倒入碗中。', '盖盘水开后中小火蒸 12 分钟，出锅淋香油、撒葱花。'],
    tips: '豆腐和鸡蛋都是优质蛋白，口感嫩滑，产后第一周也很好入口。'
  },
  {
    id: 'm62', name: '腐竹烧木耳', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['植物蛋白', '补铁', '家常'], kcal: 220, protein: 16, carbs: 14, fat: 11, time: 30, proteinType: 'soy',
    ingredients: [['腐竹', 40, 'g', '豆制品'], ['干木耳', 5, 'g', '干货药材'], ['胡萝卜', 50, 'g', '蔬菜'], ['生抽', 5, 'g', '调味料'], ['食用油', 5, 'g', '调味料']],
    steps: ['腐竹提前用温水泡软，切段；木耳泡发撕小朵。', '胡萝卜切片，木耳焯水 1 分钟。', '热锅少油炒胡萝卜，加入腐竹和木耳，加生抽和少量水烧 5 分钟收汁。'],
    tips: '腐竹泡到中心变软即可，泡太久容易碎；豆制品容易胀气，适量食用。'
  },
  {
    id: 'm63', name: '香煎豆腐', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补钙', '植物蛋白', '外酥里嫩'], kcal: 230, protein: 15, carbs: 7, fat: 16, time: 20, proteinType: 'soy', method: '煎',
    ingredients: [['豆腐', 200, 'g', '豆制品'], ['淀粉', 10, 'g', '谷物豆类'], ['食用油', 6, 'g', '调味料'], ['小葱', 5, 'g', '蔬菜'], ['生抽', 5, 'g', '调味料']],
    steps: ['豆腐切成厚片，用厨房纸吸干表面水分。', '两面薄薄拍一层淀粉。', '平底锅少油，中小火煎至两面金黄，淋少许生抽，撒葱花。'],
    tips: '豆腐吸干水分再煎，不容易粘锅也更省油。'
  },
  {
    id: 'm64', name: '凉拌豆腐皮', course: 'main', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['植物蛋白', '清爽', '快手'], kcal: 180, protein: 15, carbs: 7, fat: 11, time: 10, proteinType: 'soy', method: '拌',
    ingredients: [['豆腐皮', 100, 'g', '豆制品'], ['黄瓜', 80, 'g', '蔬菜'], ['胡萝卜', 30, 'g', '蔬菜'], ['香油', 3, 'g', '调味料'], ['米醋', 5, 'g', '调味料']],
    steps: ['豆腐皮切丝，用开水焯 1 分钟，捞出沥干。', '黄瓜和胡萝卜切丝，胡萝卜焯水。', '所有食材加米醋、香油和少许盐拌匀。'],
    tips: '豆腐皮是浓缩的豆制品，蛋白质高但热量也不低，一小盘刚好。'
  },
  {
    id: 'm65', name: '杏鲍菇炒彩椒', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['素食', '低脂', '鲜香'], kcal: 140, protein: 5, carbs: 14, fat: 7, time: 15, proteinType: 'veg',
    ingredients: [['杏鲍菇', 150, 'g', '蔬菜'], ['彩椒', 80, 'g', '蔬菜'], ['洋葱', 50, 'g', '蔬菜'], ['食用油', 5, 'g', '调味料']],
    steps: ['杏鲍菇用手撕成条，彩椒和洋葱切丝。', '热锅少油，下杏鲍菇煸炒至变软出水。', '加入彩椒和洋葱翻炒 2 分钟，少许盐调味。'],
    tips: '杏鲍菇撕成条比刀切更容易入味，口感也更有嚼劲。'
  },

  // ================= 蔬菜（v4 扩充） =================
  {
    id: 'v18', name: '白灼菜心', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补钙', '清淡', '爽口'], kcal: 70, protein: 3, carbs: 8, fat: 3, time: 10, method: '灼',
    ingredients: [['菜心', 200, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['生抽', 5, 'g', '调味料'], ['食用油', 3, 'g', '调味料']],
    steps: ['菜心洗净，根部较粗的剖开。', '水开后加少许盐和油，放入菜心焯 1 分钟。', '捞出摆盘，淋少许生抽，撒上蒜末，浇一点热油。'],
    tips: '焯水时加几滴油，菜心颜色更翠绿；根部先入水会更均匀。'
  },
  {
    id: 'v19', name: '蒜蓉油麦菜', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['通便', '清爽', '快手'], kcal: 80, protein: 2, carbs: 6, fat: 5, time: 10,
    ingredients: [['油麦菜', 200, 'g', '蔬菜'], ['蒜', 3, '瓣', '调味料'], ['食用油', 4, 'g', '调味料']],
    steps: ['油麦菜洗净切段，蒜切末。', '热锅少油炒香蒜末。', '下油麦菜大火快炒至变软，少许盐调味。'],
    tips: '油麦菜很容易熟，大火快炒 1 分钟即可，久炒会发黄。'
  },
  {
    id: 'v20', name: '清炒豆苗', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['维C', '清爽', '低脂'], kcal: 70, protein: 4, carbs: 7, fat: 3, time: 10,
    ingredients: [['豆苗', 200, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['食用油', 3, 'g', '调味料']],
    steps: ['豆苗洗净沥干，蒜切片。', '热锅少油炒香蒜片。', '下豆苗快速翻炒至断生，少许盐调味。'],
    tips: '豆苗很嫩，洗净后一定要沥干，避免下锅溅油。'
  },
  {
    id: 'v21', name: '清炒苋菜', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补铁', '补钙', '时令'], kcal: 80, protein: 4, carbs: 7, fat: 4, time: 10,
    ingredients: [['苋菜', 200, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['食用油', 4, 'g', '调味料']],
    steps: ['苋菜择洗干净，蒜切末。', '热锅少油炒香蒜末。', '下苋菜翻炒至软塌出汁，少许盐调味。'],
    tips: '红苋菜汁水会把米饭染红，拌饭很好看；铁含量在绿叶菜里较突出。'
  },
  {
    id: 'v22', name: '蒜蓉空心菜', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['通便', '清爽', '快手'], kcal: 80, protein: 3, carbs: 7, fat: 5, time: 10,
    ingredients: [['空心菜', 200, 'g', '蔬菜'], ['蒜', 3, '瓣', '调味料'], ['食用油', 4, 'g', '调味料']],
    steps: ['空心菜洗净切段，菜梗和菜叶分开。', '热锅少油炒香蒜末，先下菜梗炒 1 分钟。', '再下菜叶大火快炒，少许盐调味。'],
    tips: '菜梗先炒、菜叶后放，成熟度更一致。'
  },
  {
    id: 'v23', name: '清炒芥蓝', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补钙', '爽脆', '低脂'], kcal: 80, protein: 4, carbs: 8, fat: 3, time: 12,
    ingredients: [['芥蓝', 200, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['食用油', 3, 'g', '调味料']],
    steps: ['芥蓝削去老皮，切段，粗梗剖开。', '水开后焯 1 分钟，捞出沥干。', '热锅少油炒香蒜末，下芥蓝翻炒 1 分钟，少许盐调味。'],
    tips: '芥蓝略带苦味，焯水后苦味会减轻，搭配蒜蓉更香。'
  },
  {
    id: 'v24', name: '荷塘小炒', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['健脾', '爽脆', '配色好看'], kcal: 110, protein: 3, carbs: 18, fat: 3, time: 15,
    ingredients: [['莲藕', 100, 'g', '蔬菜'], ['干木耳', 4, 'g', '干货药材'], ['荷兰豆', 60, 'g', '蔬菜'], ['胡萝卜', 40, 'g', '蔬菜'], ['食用油', 4, 'g', '调味料']],
    steps: ['莲藕和胡萝卜切片，木耳泡发撕小朵，荷兰豆去筋。', '所有食材焯水 1 分钟，捞出沥干。', '热锅少油，下全部食材翻炒 2 分钟，少许盐调味。'],
    tips: '先焯后炒能缩短时间，蔬菜颜色也更漂亮。'
  },
  {
    id: 'v25', name: '南瓜蒸百合', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['润燥', '养胃', '清甜'], kcal: 100, protein: 3, carbs: 21, fat: 0.5, time: 30, method: '蒸',
    ingredients: [['南瓜', 180, 'g', '蔬菜'], ['百合', 40, 'g', '蔬菜'], ['枸杞', 3, 'g', '干货药材']],
    steps: ['南瓜去皮切厚片，百合掰开洗净。', '南瓜摆盘，百合放在上面，撒枸杞。', '水开后蒸 15 分钟至南瓜软糯。'],
    tips: '南瓜和百合都自带清甜，不用加糖；百合偏凉润，脾胃虚寒时少量。'
  },
  {
    id: 'v26', name: '蒜蓉蒸茄子', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['通便', '低脂', '软糯'], kcal: 90, protein: 3, carbs: 12, fat: 4, time: 20, method: '蒸',
    ingredients: [['茄子', 200, 'g', '蔬菜'], ['蒜', 4, '瓣', '调味料'], ['生抽', 5, 'g', '调味料'], ['香油', 2, 'g', '调味料']],
    steps: ['茄子切长条，摆入盘中。', '水开后蒸 12 分钟至软。', '蒜末用少许热油炒香，加生抽调成酱汁，淋在茄子上。'],
    tips: '蒸茄子比油炸省油很多，软糯入味，适合产后控制油脂。'
  },
  {
    id: 'v27', name: '凉拌黄瓜', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['清爽', '补水', '快手'], kcal: 50, protein: 1.5, carbs: 6, fat: 2.5, time: 10, method: '拌',
    ingredients: [['黄瓜', 200, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['米醋', 6, 'g', '调味料'], ['香油', 2, 'g', '调味料']],
    steps: ['黄瓜洗净拍碎，切小段。', '蒜切末。', '加米醋、香油和少许盐拌匀，静置 5 分钟更入味。'],
    tips: '黄瓜性凉，从冰箱拿出来先放至室温，或用温水略冲一下。'
  },
  {
    id: 'v28', name: '凉拌木耳', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补铁', '通便', '爽口'], kcal: 70, protein: 2, carbs: 9, fat: 3, time: 15, method: '拌',
    ingredients: [['干木耳', 8, 'g', '干货药材'], ['彩椒', 40, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['米醋', 6, 'g', '调味料'], ['香油', 2, 'g', '调味料']],
    steps: ['木耳泡发撕小朵，焯水 2 分钟，捞出过凉。', '彩椒切丝，蒜切末。', '所有食材加米醋、香油和少许盐拌匀。'],
    tips: '木耳泡发不超过 2 小时，焯熟再凉拌，不要生吃。'
  },
  {
    id: 'v29', name: '蒜蓉豇豆', course: 'veg', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['通便', '家常', '有嚼感'], kcal: 90, protein: 4, carbs: 10, fat: 4, time: 20,
    ingredients: [['豇豆', 200, 'g', '蔬菜'], ['蒜', 3, '瓣', '调味料'], ['食用油', 4, 'g', '调味料']],
    steps: ['豇豆去两头，切段，洗净沥干。', '热锅少油炒香蒜末，下豇豆翻炒。', '加少量水焖 3 分钟，确认完全熟透后加盐调味。'],
    tips: '豇豆必须彻底炒熟，避免生豆角引起恶心腹泻等不适。'
  },
  {
    id: 'v30', name: '番茄炒菜花', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['维C', '清爽', '家常'], kcal: 90, protein: 3, carbs: 10, fat: 4, time: 15,
    ingredients: [['菜花', 180, 'g', '蔬菜'], ['番茄', 120, 'g', '蔬菜'], ['食用油', 4, 'g', '调味料']],
    steps: ['菜花掰小朵，焯水 1 分钟；番茄切块。', '热锅少油，下番茄炒出汁。', '加入菜花翻炒 2 分钟，少许盐调味。'],
    tips: '番茄的酸味能盖住菜花的生味，没胃口时很开胃。'
  },
  {
    id: 'v31', name: '清炒紫甘蓝', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['花青素', '爽脆', '低脂'], kcal: 70, protein: 2, carbs: 9, fat: 3, time: 10,
    ingredients: [['紫甘蓝', 180, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['米醋', 5, 'g', '调味料'], ['食用油', 3, 'g', '调味料']],
    steps: ['紫甘蓝切细丝，蒜切片。', '热锅少油炒香蒜片。', '下紫甘蓝大火快炒，出锅前淋一点米醋，少许盐调味。'],
    tips: '加一点醋能帮助保持紫色，炒的时间越短越脆。'
  },
  {
    id: 'v32', name: '清炒生菜', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['清爽', '低脂', '快手'], kcal: 60, protein: 2, carbs: 5, fat: 4, time: 8,
    ingredients: [['生菜', 200, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['食用油', 3, 'g', '调味料']],
    steps: ['生菜洗净掰大块，沥干水分。', '热锅少油炒香蒜末。', '下生菜大火快炒 30 秒至变软，少许盐调味。'],
    tips: '生菜水分多，洗完沥干再炒，避免变成一锅水。'
  },

  // ================= 汤羹（v4 扩充） =================
  {
    id: 'p29', name: '虾皮紫菜汤', course: 'soup', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补钙', '补碘', '快手'], kcal: 60, protein: 5, carbs: 4, fat: 3, time: 10, proteinType: 'egg', method: '煮',
    ingredients: [['虾皮', 8, 'g', '水产'], ['紫菜', 3, 'g', '水产'], ['鸡蛋', 1, '个', '肉禽蛋'], ['香油', 2, 'g', '调味料'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['虾皮冲洗两遍，紫菜撕小片。', '锅中加 400ml 清水烧开，放入虾皮煮 2 分钟。', '淋入蛋液煮成蛋花，放入紫菜，关火淋香油、撒葱花。'],
    tips: '虾皮和紫菜都带咸味，基本不用额外加盐。'
  },
  {
    id: 'p30', name: '番茄鸡蛋汤', course: 'soup', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['开胃', '高蛋白', '家常'], kcal: 110, protein: 8, carbs: 6, fat: 6, time: 15, proteinType: 'egg', method: '煮',
    ingredients: [['番茄', 150, 'g', '蔬菜'], ['鸡蛋', 1, '个', '肉禽蛋'], ['小葱', 5, 'g', '蔬菜'], ['香油', 2, 'g', '调味料']],
    steps: ['番茄切小块，鸡蛋打散。', '锅中少油炒番茄至出汁，加 500ml 清水烧开。', '淋入蛋液煮成蛋花，加少许盐，淋香油撒葱花。'],
    tips: '番茄先炒再煮，汤色红亮、味道更浓。'
  },
  {
    id: 'p31', name: '青菜豆腐汤', course: 'soup', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补钙', '清淡', '易消化'], kcal: 100, protein: 8, carbs: 6, fat: 5, time: 15, proteinType: 'soy', method: '煮',
    ingredients: [['豆腐', 120, 'g', '豆制品'], ['小青菜', 100, 'g', '蔬菜'], ['姜片', 2, '片', '调味料'], ['香油', 2, 'g', '调味料']],
    steps: ['豆腐切小块，小青菜洗净。', '锅中加 500ml 清水和姜片烧开，放豆腐煮 5 分钟。', '放入青菜煮 1 分钟，少许盐调味，淋香油。'],
    tips: '豆腐先煮能让汤更白；青菜最后放，保持翠绿。'
  },
  {
    id: 'p32', name: '萝卜羊肉汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['温补', '暖身', '补铁'], kcal: 260, protein: 22, carbs: 8, fat: 15, time: 70, proteinType: 'mutton',
    ingredients: [['羊肉', 120, 'g', '肉禽蛋'], ['白萝卜', 150, 'g', '蔬菜'], ['姜片', 3, '片', '调味料'], ['枸杞', 3, 'g', '干货药材']],
    steps: ['羊肉切块冷水下锅焯水，撇去浮沫。', '加姜片和热水，小火炖 40 分钟。', '放入白萝卜块再炖 20 分钟，加枸杞和少许盐。'],
    tips: '羊肉偏温补，体质偏热或容易上火时少吃；汤面浮油记得撇掉。'
  },
  {
    id: 'p33', name: '虫草花鸡汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['滋补', '增强免疫', '鲜香'], kcal: 250, protein: 22, carbs: 8, fat: 13, time: 70, proteinType: 'chicken',
    ingredients: [['鸡肉', 150, 'g', '肉禽蛋'], ['虫草花', 15, 'g', '干货药材'], ['红枣', 3, '颗', '干货药材'], ['姜片', 3, '片', '调味料']],
    steps: ['鸡肉焯水，虫草花冲洗干净，红枣去核。', '所有食材加姜片和清水，大火煮开转小火炖 50 分钟。', '出锅前加少许盐调味。'],
    tips: '虫草花不是药材，是菌菇类食材，口感脆嫩；汤和肉都要吃。'
  },
  {
    id: 'p34', name: '茶树菇排骨汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['健脾', '补蛋白', '鲜香'], kcal: 280, protein: 20, carbs: 10, fat: 17, time: 80, proteinType: 'pork',
    ingredients: [['猪排骨', 150, 'g', '肉禽蛋'], ['茶树菇', 20, 'g', '干货药材'], ['胡萝卜', 60, 'g', '蔬菜'], ['姜片', 3, '片', '调味料']],
    steps: ['排骨焯水，茶树菇提前泡发洗净。', '排骨加姜片和热水炖 40 分钟。', '放入茶树菇和胡萝卜再炖 25 分钟，少许盐调味。'],
    tips: '茶树菇的香味很浓，泡发的水沉淀后可以一起炖，别浪费。'
  },
  {
    id: 'p35', name: '黄豆排骨汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补钙', '植物蛋白', '香浓'], kcal: 300, protein: 20, carbs: 12, fat: 18, time: 80, proteinType: 'pork',
    ingredients: [['猪排骨', 150, 'g', '肉禽蛋'], ['黄豆', 30, 'g', '谷物豆类'], ['姜片', 3, '片', '调味料'], ['小葱', 5, 'g', '蔬菜']],
    steps: ['黄豆提前浸泡 4 小时，排骨焯水。', '排骨、黄豆和姜片加足量热水，小火炖 60 分钟。', '出锅前加少许盐，撒葱花。'],
    tips: '黄豆容易胀气，第一次喝先少量；汤和豆子一起吃营养更完整。'
  },
  {
    id: 'p36', name: '海带牛肉汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['补铁', '补碘', '鲜香'], kcal: 240, protein: 22, carbs: 8, fat: 12, time: 70, proteinType: 'beef',
    ingredients: [['牛腩', 120, 'g', '肉禽蛋'], ['海带', 50, 'g', '水产'], ['姜片', 3, '片', '调味料']],
    steps: ['牛腩切块焯水，海带洗净切条。', '牛腩加姜片和热水炖 40 分钟。', '放入海带再炖 20 分钟，少许盐调味。'],
    tips: '海带含碘丰富，甲状腺功能异常者请遵医嘱；汤面浮油撇掉更清爽。'
  },
  {
    id: 'p37', name: '丝瓜瘦肉汤', course: 'soup', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['清热', '补蛋白', '清甜'], kcal: 150, protein: 14, carbs: 6, fat: 7, time: 20, proteinType: 'pork', method: '煮',
    ingredients: [['猪瘦肉', 80, 'g', '肉禽蛋'], ['丝瓜', 150, 'g', '蔬菜'], ['姜片', 2, '片', '调味料']],
    steps: ['猪瘦肉切薄片，用少许淀粉抓匀；丝瓜去皮切块。', '锅中加姜片和清水烧开，下肉片煮 2 分钟。', '放入丝瓜煮 3 分钟，少许盐调味。'],
    tips: '丝瓜清甜，肉片嫩滑，是夏天月子餐里很清爽的一道汤。'
  },
  {
    id: 'p38', name: '菠菜猪肝汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补铁', '补血', '快手'], kcal: 150, protein: 14, carbs: 5, fat: 7, time: 15, proteinType: 'pork', method: '煮',
    ingredients: [['猪肝', 50, 'g', '肉禽蛋'], ['菠菜', 100, 'g', '蔬菜'], ['姜丝', 3, 'g', '调味料'], ['香油', 2, 'g', '调味料']],
    steps: ['猪肝切薄片，用清水浸泡 20 分钟去血水，焯水后捞出。', '锅中加姜丝和清水烧开，放猪肝煮 2 分钟。', '菠菜焯水后放入汤中，少许盐调味，淋香油。'],
    tips: '猪肝每周吃 1-2 次即可；菠菜先焯水去除草酸。'
  },
  {
    id: 'p39', name: '番茄金针菇牛肉汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S3,
    tags: ['补铁', '开胃', '鲜香'], kcal: 210, protein: 20, carbs: 10, fat: 10, time: 30, proteinType: 'beef',
    ingredients: [['牛里脊', 100, 'g', '肉禽蛋'], ['番茄', 150, 'g', '蔬菜'], ['金针菇', 80, 'g', '蔬菜'], ['姜片', 2, '片', '调味料']],
    steps: ['牛里脊切薄片，用少许淀粉抓匀；番茄切块，金针菇去根。', '锅中少油炒番茄出汁，加姜片和 600ml 清水烧开。', '放入金针菇煮 3 分钟，再下牛肉片煮至变色，少许盐调味。'],
    tips: '牛肉片最后放，煮到刚变色就关火，口感最嫩。'
  },
  {
    id: 'p40', name: '虾仁豆腐汤', course: 'soup', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补钙', '高蛋白', '清淡'], kcal: 150, protein: 16, carbs: 5, fat: 7, time: 20, proteinType: 'shrimp', method: '煮',
    ingredients: [['虾仁', 80, 'g', '水产'], ['豆腐', 120, 'g', '豆制品'], ['小青菜', 60, 'g', '蔬菜'], ['姜片', 2, '片', '调味料']],
    steps: ['虾仁去虾线，豆腐切小块。', '锅中加姜片和清水烧开，放豆腐煮 5 分钟。', '加入虾仁煮 2 分钟，放青菜煮 1 分钟，少许盐调味。'],
    tips: '虾仁和豆腐都是优质蛋白，汤清味鲜，适合晚餐。'
  },
  {
    id: 'p41', name: '莲藕红枣汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['补血', '润燥', '清甜'], kcal: 120, protein: 3, carbs: 26, fat: 0.5, time: 40, proteinType: 'veg',
    ingredients: [['莲藕', 150, 'g', '蔬菜'], ['红枣', 4, '颗', '干货药材'], ['枸杞', 3, 'g', '干货药材']],
    steps: ['莲藕去皮切块，红枣去核。', '加 600ml 清水煮开，转小火炖 25 分钟。', '放入枸杞再煮 5 分钟，可不加糖直接喝。'],
    tips: '莲藕选粉藕更适合炖汤，口感绵软；恶露量多时红枣适量。'
  },
  {
    id: 'p42', name: '银耳雪梨汤', course: 'soup', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['润燥', '补水', '清甜'], kcal: 90, protein: 1, carbs: 22, fat: 0.2, time: 45, proteinType: 'veg',
    ingredients: [['干银耳', 6, 'g', '干货药材'], ['雪梨', 150, 'g', '水果'], ['枸杞', 3, 'g', '干货药材'], ['冰糖', 3, 'g', '调味料']],
    steps: ['银耳泡发撕小朵，雪梨去皮切块。', '银耳加 600ml 清水小火炖 30 分钟至出胶。', '放入雪梨和冰糖再煮 10 分钟，撒枸杞。'],
    tips: '嗓子干、空气干燥时可以常喝；血糖偏高时不加冰糖。'
  },
  {
    id: 'p43', name: '栗子莲藕排骨汤', course: 'soup', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['温补', '健脾', '香浓'], kcal: 300, protein: 20, carbs: 20, fat: 17, time: 75, proteinType: 'pork',
    ingredients: [['猪排骨', 150, 'g', '肉禽蛋'], ['板栗', 50, 'g', '干货药材'], ['莲藕', 100, 'g', '蔬菜'], ['姜片', 3, '片', '调味料']],
    steps: ['排骨焯水，板栗去壳，莲藕切块。', '排骨加姜片和热水炖 40 分钟。', '放入板栗和莲藕再炖 25 分钟，少许盐调味。'],
    tips: '板栗和莲藕都偏粉糯，汤会带自然甜味；喝汤记得吃肉。'
  },

  // ================= 加餐（v4 扩充） =================
  {
    id: 'k21', name: '藕粉桂花羹', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: ALL,
    tags: ['养胃', '润燥', '快手'], kcal: 120, protein: 1, carbs: 27, fat: 0.3, time: 10, method: '冲调',
    ingredients: [['藕粉', 25, 'g', '干货药材'], ['桂花', 2, 'g', '调味料'], ['温水', 200, 'ml', '其他']],
    steps: ['藕粉先用少量凉水化开，搅匀无颗粒。', '冲入刚烧开的沸水，一边冲一边快速搅拌至透明浓稠。', '撒上桂花，温热食用。'],
    tips: '一定要用沸水才能冲熟；血糖偏高时不加糖，桂花的香气就足够了。'
  },
  {
    id: 'k22', name: '赤小豆薏米水', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: S2,
    tags: ['消肿', '利水', '清淡'], kcal: 60, protein: 2, carbs: 11, fat: 0.3, time: 50,
    ingredients: [['赤小豆', 25, 'g', '谷物豆类'], ['薏米', 20, 'g', '谷物豆类']],
    steps: ['赤小豆和薏米提前浸泡 3 小时。', '加 600ml 清水煮开，转小火煮 40 分钟。', '滤出汤水，温热饮用，豆子也可以吃掉。'],
    tips: '偏利水渗湿，产后水肿明显时可以喝；恶露量多或体质偏寒时少量。'
  },
  {
    id: 'k23', name: '红枣枸杞豆浆', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: ALL,
    tags: ['补血', '植物蛋白', '香浓'], kcal: 160, protein: 7, carbs: 24, fat: 4, time: 25,
    ingredients: [['黄豆', 30, 'g', '谷物豆类'], ['红枣', 3, '颗', '干货药材'], ['枸杞', 3, 'g', '干货药材']],
    steps: ['黄豆提前浸泡 4 小时，红枣去核。', '所有食材放入豆浆机，加 400ml 清水。', '选择豆浆模式，打好后趁温热喝。'],
    tips: '豆浆一定要彻底煮熟；豆类容易胀气，第一次喝先少量。'
  },
  {
    id: 'k24', name: '花生核桃露', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: ALL,
    tags: ['补脑', '润燥', '香浓'], kcal: 220, protein: 7, carbs: 14, fat: 16, time: 15,
    ingredients: [['花生', 20, 'g', '干货药材'], ['核桃', 15, 'g', '干货药材'], ['牛奶', 150, 'ml', '奶制品']],
    steps: ['花生和核桃小火炒香，放凉后搓去外皮。', '放入料理机，加牛奶打成细腻的浆。', '倒入锅中小火加热至微温，边加热边搅拌。'],
    tips: '坚果热量较高，一小杯就够；对坚果过敏者不要尝试。'
  },
  {
    id: 'k25', name: '紫薯燕麦饼', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: S3,
    tags: ['通便', '有饱腹感', '手作'], kcal: 200, protein: 6, carbs: 36, fat: 4, time: 20, method: '煎',
    ingredients: [['紫薯', 120, 'g', '蔬菜'], ['即食燕麦', 25, 'g', '谷物豆类'], ['鸡蛋', 1, '个', '肉禽蛋'], ['面粉', 10, 'g', '谷物豆类']],
    steps: ['紫薯蒸熟压成泥，加入燕麦、鸡蛋和面粉拌匀。', '手上沾水，把紫薯泥压成小饼。', '平底锅刷薄油，小火煎至两面微黄。'],
    tips: '紫薯本身有甜味，不用加糖；燕麦让口感更有嚼劲。'
  },
  {
    id: 'k26', name: '香蕉燕麦饼', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: S2,
    tags: ['通便', '快手', '香甜'], kcal: 190, protein: 6, carbs: 35, fat: 4, time: 15, method: '煎',
    ingredients: [['香蕉', 100, 'g', '水果'], ['即食燕麦', 25, 'g', '谷物豆类'], ['鸡蛋', 1, '个', '肉禽蛋']],
    steps: ['香蕉压成泥，加入燕麦和鸡蛋拌匀。', '静置 5 分钟让燕麦吸水。', '平底锅刷薄油，舀入面糊摊成小饼，小火煎至两面金黄。'],
    tips: '熟透的香蕉甜度高，完全不用加糖；当早餐主食也很合适。'
  },
  {
    id: 'k27', name: '南瓜蒸糕', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: ALL,
    tags: ['养胃', '香甜', '手作'], kcal: 180, protein: 5, carbs: 38, fat: 1.5, time: 35, method: '蒸',
    ingredients: [['南瓜', 120, 'g', '蔬菜'], ['面粉', 40, 'g', '谷物豆类'], ['糯米粉', 15, 'g', '谷物豆类'], ['红枣', 2, '颗', '干货药材']],
    steps: ['南瓜蒸熟压泥，红枣去核切碎。', '加入面粉和糯米粉拌成稠糊，拌入红枣碎。', '倒入模具，水开后蒸 20 分钟，放温后切块。'],
    tips: '加了糯米粉口感更软糯，但不好消化，一次吃一两块即可。'
  },
  {
    id: 'k28', name: '红枣玉米饼', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: S2,
    tags: ['补血', '香甜', '手作'], kcal: 210, protein: 5, carbs: 42, fat: 3, time: 20, method: '煎',
    ingredients: [['玉米面', 40, 'g', '谷物豆类'], ['面粉', 20, 'g', '谷物豆类'], ['红枣', 3, '颗', '干货药材'], ['鸡蛋', 1, '个', '肉禽蛋']],
    steps: ['红枣去核切碎，与玉米面、面粉、鸡蛋混合。', '加适量温水拌成能流动的面糊。', '平底锅刷薄油，舀入面糊摊成小饼，小火煎至两面金黄。'],
    tips: '玉米面偏粗，加一点面粉口感更松软；配一杯温牛奶就是完整加餐。'
  },
  {
    id: 'k29', name: '牛奶炖蛋', course: 'snack', slots: ['morningSnack', 'nightSnack'], stages: ALL,
    tags: ['补钙', '高蛋白', '嫩滑'], kcal: 190, protein: 11, carbs: 14, fat: 10, time: 20, method: '蒸',
    ingredients: [['鸡蛋', 1, '个', '肉禽蛋'], ['牛奶', 150, 'ml', '奶制品'], ['红枣', 2, '颗', '干货药材']],
    steps: ['鸡蛋打散，加入温牛奶搅匀，过筛去浮沫。', '红枣去核切碎，撒在蛋液上。', '盖盘，水开后中小火蒸 12 分钟，焖 2 分钟。'],
    tips: '牛奶不要煮沸，温热即可；乳糖不耐受可换无乳糖牛奶。'
  },
  {
    id: 'k30', name: '木瓜银耳羹', course: 'snack', slots: ['afternoonSnack', 'nightSnack'], stages: S2,
    tags: ['润燥', '清甜', '补水'], kcal: 100, protein: 2, carbs: 22, fat: 0.3, time: 45,
    ingredients: [['干银耳', 5, 'g', '干货药材'], ['木瓜', 120, 'g', '水果'], ['枸杞', 3, 'g', '干货药材']],
    steps: ['银耳泡发撕小朵，木瓜去皮去籽切块。', '银耳加 600ml 清水小火炖 30 分钟至出胶。', '放入木瓜再煮 10 分钟，撒枸杞。'],
    tips: '木瓜的清甜和银耳的胶质很搭；不加糖也很好喝。'
  },
  {
    id: 'k31', name: '蒸橙子', course: 'snack', slots: ['morningSnack', 'afternoonSnack', 'nightSnack'], stages: ALL,
    tags: ['润燥', '维C', '清甜'], kcal: 80, protein: 1, carbs: 19, fat: 0.2, time: 15, method: '蒸',
    ingredients: [['橙子', 200, 'g', '水果'], ['枸杞', 2, 'g', '干货药材']],
    steps: ['橙子洗净，顶部切开一小块，果肉上划几刀。', '放上枸杞，盖上橙子盖。', '水开后蒸 10 分钟，连果肉带汁一起吃掉。'],
    tips: '嗓子干痒时可以试试；如果咳嗽持续或发热，请及时就医。'
  },
  {
    id: 'k32', name: '核桃红枣糕', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: S2,
    tags: ['补脑', '补血', '手作'], kcal: 220, protein: 5, carbs: 36, fat: 7, time: 35, method: '蒸',
    ingredients: [['红枣', 5, '颗', '干货药材'], ['核桃', 15, 'g', '干货药材'], ['面粉', 35, 'g', '谷物豆类'], ['鸡蛋', 1, '个', '肉禽蛋']],
    steps: ['红枣去核切碎，核桃掰成小碎。', '鸡蛋打散，加入面粉、红枣和核桃拌匀，加少量温水调成稠糊。', '倒入模具，水开后蒸 20 分钟，放温切块。'],
    tips: '红枣和核桃都自带甜香，不用加糖；坚果过敏者去掉核桃。'
  },
  {
    id: 'k33', name: '紫薯银耳羹', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: S2,
    tags: ['通便', '润燥', '花青素'], kcal: 130, protein: 2, carbs: 29, fat: 0.4, time: 50,
    ingredients: [['紫薯', 100, 'g', '蔬菜'], ['干银耳', 5, 'g', '干货药材'], ['枸杞', 3, 'g', '干货药材']],
    steps: ['银耳泡发撕小朵，紫薯去皮切小丁。', '银耳加 600ml 清水小火炖 30 分钟。', '加入紫薯再煮 15 分钟，撒枸杞。'],
    tips: '紫薯煮久会掉色，汤变成淡淡的紫色是正常的。'
  },
  {
    id: 'k34', name: '山药牛奶糊', course: 'snack', slots: ['morningSnack', 'nightSnack'], stages: ALL,
    tags: ['健脾', '补钙', '温润'], kcal: 180, protein: 6, carbs: 30, fat: 5, time: 15,
    ingredients: [['铁棍山药', 100, 'g', '蔬菜'], ['牛奶', 200, 'ml', '奶制品']],
    steps: ['山药去皮切块蒸熟。', '与温牛奶一起放入料理机打成细腻的糊。', '倒回锅中小火加热至微温即可。'],
    tips: '山药蒸熟再打，口感更顺滑；乳糖不耐受换成无乳糖牛奶。'
  },
  {
    id: 'k35', name: '红枣陈皮茶', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: ALL,
    tags: ['理气', '暖身', '解腻'], kcal: 60, protein: 0.5, carbs: 14, fat: 0.1, time: 15, method: '煮饮',
    ingredients: [['红枣', 3, '颗', '干货药材'], ['陈皮', 3, 'g', '干货药材'], ['枸杞', 3, 'g', '干货药材']],
    steps: ['红枣去核切小块，陈皮用温水泡软。', '加 400ml 清水煮 10 分钟。', '关火前放枸杞，温热饮用。'],
    tips: '吃油腻了或者胃口闷时来一杯；陈皮用量不要太多，否则会发苦。'
  },
  {
    id: 'k36', name: '花生黑豆浆', course: 'snack', slots: ['morningSnack', 'afternoonSnack'], stages: S2,
    tags: ['植物蛋白', '补血', '香浓'], kcal: 170, protein: 8, carbs: 20, fat: 7, time: 25,
    ingredients: [['黑豆', 30, 'g', '谷物豆类'], ['花生', 15, 'g', '干货药材'], ['黑芝麻', 5, 'g', '干货药材']],
    steps: ['黑豆和花生提前浸泡 4 小时。', '与黑芝麻一起放入豆浆机，加 400ml 清水。', '打成豆浆后充分煮熟，趁温热喝。'],
    tips: '黑豆和黑芝麻搭配，香气浓；豆类容易胀气，少量慢喝。'
  }
];

function imageForRecipe(r) {
  if (r.id && DISH_IMAGES[r.id]) return `images/dishes/${r.id}.jpg`;
  const n = r.name;
  if (r.course === 'staple') {
    if (/面|馄饨|云吞/.test(n)) return 'images/noodle.jpg';
    if (/饭/.test(n)) return 'images/rice.jpg';
    if (/饺|包|馒头|发糕|糕|饼/.test(n)) return 'images/bun.jpg?v=2';
    return 'images/staple.jpg';
  }
  if (r.course === 'veg') return 'images/veg.jpg';
  if (r.course === 'soup') return 'images/soup.jpg';
  if (r.course === 'snack') {
    if (/茶|豆浆/.test(n)) return 'images/drink.jpg';
    if (/蒸蛋|炖蛋/.test(n)) return 'images/egg.jpg';
    if (/果盘|水果|蒸橙/.test(n)) return 'images/fruit.jpg';
    return 'images/dessert.jpg';
  }
  if (r.course === 'main') {
    if (/虾/.test(n)) return 'images/shrimp.jpg?v=2';
    if (/鸡/.test(n)) return 'images/chicken.jpg';
    if (/牛|羊/.test(n)) return 'images/beef.jpg';
    if (/鸭/.test(n)) return 'images/duck.jpg';
    if (/鱼|蟹|贝|蛤蜊|海参/.test(n)) return 'images/main.jpg';
    if (/豆腐|豆干|腐竹|豆腐皮/.test(n)) return 'images/tofu.jpg';
    if (/蛋/.test(n)) return 'images/egg.jpg';
    if (/猪|排骨|腰|肉末|肉饼|肉片|肉卷|瘦肉|蹄|丸子/.test(n)) return 'images/pork.jpg';
    return 'images/chicken.jpg';
  }
  return 'images/main.jpg';
}

const { decorateRecipe } = require('data/recipe-utils');

const RECIPES = RAW.map((r) =>
  decorateRecipe({
    ...r,
    image: imageForRecipe(r),
    proteinType: r.proteinType || 'none'
  })
);

const RECIPE_MAP = new Map(RECIPES.map((r) => [r.id, r]));

module.exports = { RECIPES, RECIPE_MAP, imageForRecipe };

},
"data/articles": function(module, exports, require) {
'use strict';

const ARTICLES = [
  {
    id: 'a1',
    title: '月子餐的四个阶段：排、修、补、调',
    summary: '产后 42 天不是一味大补，而是先排、再修、后补、最后调。看懂阶段，才知道每一周该吃什么。',
    minutes: 4,
    tag: '阶段饮食',
    sections: [
      {
        h: '第 1 周：排恶露、消水肿',
        p: [
          '产后第一周的重点是让身体平稳过渡：饮食清淡、少油少盐、软烂易消化，保证优质蛋白帮助伤口愈合。',
          '主食可以选择小米粥、软米饭、烂面条，搭配蒸蛋、鱼汤、瘦肉和焯水蔬菜。暂时不需要浓汤大补，也不建议大量红糖水。'
        ]
      },
      {
        h: '第 2 周：修组织、补气血',
        p: [
          '伤口和子宫进入修复期，可以增加铁和优质蛋白：猪肝、牛肉、乌鸡、排骨、菠菜、红枣都是常见选择。',
          '开始温和催乳，但不要一次喝太多油腻浓汤。汤和肉一起吃，营养才完整。'
        ]
      },
      {
        h: '第 3-4 周：滋补催乳、增强体力',
        p: [
          '在均衡饮食的基础上适度增加汤品和蛋白质，如鲫鱼豆腐汤、猪蹄花生汤、山药鸡汤。喝汤前撇去浮油。',
          '主食粗细搭配，每天蔬菜 300-500 克、水果 200-300 克，预防便秘。'
        ]
      },
      {
        h: '第 5 周起：恢复元气、均衡塑形',
        p: [
          '逐步回归日常饮食，减少精制糖和油炸食物，用杂粮饭替代部分白米饭，配合温和活动。',
          '哺乳期不要盲目节食，热量过低会影响奶量和恢复。'
        ]
      }
    ]
  },
  {
    id: 'a2',
    title: '产后第一周怎么吃：排恶露、消水肿、护伤口',
    summary: '第一周肠胃功能还在恢复，吃对比吃多更重要。少油、少盐、软烂、温热是四个关键词。',
    minutes: 3,
    tag: '产后第 1 周',
    sections: [
      {
        h: '优先选择易消化的主食',
        p: ['小米粥、山药粥、软米饭、烂面条、小馄饨都比较友好。第一周粗粮比例不要太高，避免胀气。']
      },
      {
        h: '蛋白质要够，但做法要轻',
        p: ['蒸蛋、清蒸鱼、鲫鱼豆腐汤、瘦肉粥、鸡肉汤都是不错的选择。剖腹产排气后可先从流食、半流食过渡到软食。']
      },
      {
        h: '关于水肿',
        p: ['冬瓜、丝瓜、红豆、鲫鱼等食材有利水作用。同时注意不要吃得太咸，腌制食品、浓汤宝和外卖重口味都容易加重水肿。']
      },
      {
        h: '这些先别急',
        list: [
          '大量红糖水：可能增加恶露量，少量调味即可',
          '浓油厚汤：容易堵奶、增加肠胃负担',
          '生冷食物和冰饮：可能刺激肠胃',
          '辛辣、酒精：哺乳期尤其需要避开'
        ]
      }
    ]
  },
  {
    id: 'a3',
    title: '科学催乳：汤水、频率、情绪和睡眠',
    summary: '奶量不是靠一碗汤决定的。真正有效的催乳，是足够的水分、频繁有效的吸吮，以及放松的身体状态。',
    minutes: 4,
    tag: '哺乳',
    sections: [
      {
        h: '先保证“吸吮频率”',
        p: ['乳汁分泌遵循供需规律。每天 8-12 次有效亲喂或吸奶，比喝多少汤更重要。夜里也要保持一定频率。']
      },
      {
        h: '汤水要喝，但别只喝汤',
        p: ['鲫鱼豆腐汤、乌鸡汤、猪蹄花生汤、黄花菜瘦肉汤都是常见的催乳汤品。喝汤的同时要吃肉和豆制品，蛋白质才够。']
      },
      {
        h: '每天喝够水',
        p: ['哺乳期每天总水分建议 2000-2500 毫升，包括汤、牛奶和水。尿液颜色偏黄提示需要补水。']
      },
      {
        h: '情绪和睡眠同样重要',
        p: ['紧张、疼痛、疲劳都会影响催乳反射。给自己留出休息时间，家人分担家务，比“猛喝汤”更有效。']
      },
      {
        h: '什么时候需要就医',
        p: ['如果出现乳房红肿热痛、发热、硬块不消退，可能是乳腺炎，应尽快就医，不要只靠饮食调理。']
      }
    ]
  },
  {
    id: 'a4',
    title: '产后便秘与水肿，饮食怎么调',
    summary: '产后活动少、伤口疼、喝水少，便秘和水肿都很常见。调整主食、蔬菜和饮水，通常能明显改善。',
    minutes: 3,
    tag: '常见困扰',
    sections: [
      {
        h: '便秘：先增加“可溶性纤维”',
        p: ['燕麦、秋葵、南瓜、苹果、火龙果、木耳、银耳都不错。主食里加入约三分之一的糙米、小米或藜麦。'],
        h: '别忽略水和油脂',
        p: ['纤维需要水分才能发挥作用。每天 2000 毫升左右的饮水，加上少量坚果或芝麻，能帮助肠道蠕动。'],
        h: '水肿：少盐比多喝水更关键',
        p: ['水肿不是“水喝多了”，而是钠摄入过高、循环恢复慢。减少咸菜、加工肉、重口味汤料，多吃冬瓜、丝瓜、红豆、鲫鱼。'],
        h: '温和活动',
        p: ['顺产后可以在身体允许时缓慢走动，剖腹产按医生建议逐步下床。久躺不动会加重便秘和水肿。']
      }
    ]
  },
  {
    id: 'a5',
    title: '哺乳期忌口与食物过敏排查',
    summary: '大多数食物不需要盲目忌口，但酒精、过量咖啡因和明确的过敏原需要认真对待。',
    minutes: 3,
    tag: '安全饮食',
    sections: [
      {
        h: '真正需要避开的',
        list: [
          '酒精：会进入乳汁，哺乳期建议避免；醪糟类食物应充分煮沸或不吃',
          '过量咖啡因：每天咖啡因不超过约 200 毫克，约等于一杯中杯咖啡',
          '明确过敏的食物：如果吃完后宝宝出现皮疹、腹泻、明显哭闹，记录并就医评估',
          '生食和未煮熟的肉类、海鲜：存在感染风险'
        ]
      },
      {
        h: '不需要一刀切',
        p: ['葱姜蒜、少量香辛料、常见的蔬菜水果通常不需要忌口。长期过度忌口反而可能导致营养不均衡。']
      },
      {
        h: '怎么排查',
        p: ['一次只引入一种可疑食物，记录进食时间与宝宝反应，观察 24-72 小时。不要同时停掉多种食物，否则很难判断原因。']
      },
      {
        h: '关于“回奶食物”',
        p: ['韭菜、麦芽、山楂等被认为可能影响奶量，但证据有限。如果发现奶量明显变化，可以先暂停再观察，不必过度紧张。']
      }
    ]
  },
  {
    id: 'a6',
    title: '红糖、米酒、老母鸡：三个常见误区',
    summary: '很多月子餐传统并非完全错误，但“越多越好”往往是问题所在。',
    minutes: 3,
    tag: '饮食误区',
    sections: [
      {
        h: '红糖水不是喝得越多越好',
        p: ['红糖本质上还是糖。产后适量用于调味可以，但大量饮用会增加糖分摄入和恶露量。血糖偏高者更要控制。']
      },
      {
        h: '米酒、醪糟要谨慎',
        p: ['酒精会进入母乳。即使煮沸，也需要充分加热让酒精挥发。哺乳期最稳妥的做法是不吃含酒精的菜品。']
      },
      {
        h: '老母鸡未必比公鸡“更催乳”',
        p: ['老母鸡脂肪较高，汤容易油腻。真正影响奶量的是吸吮频率、水分和整体营养。选择去皮鸡肉、鱼、瘦肉、豆制品更均衡。']
      },
      {
        h: '浓汤不等于营养',
        p: ['白色浓汤主要来自脂肪乳化。喝汤时撇去浮油，并且把肉一起吃，才是更完整的蛋白质来源。']
      }
    ]
  },
  {
    id: 'a7',
    title: '产后体重管理与温和活动',
    summary: '月子期不建议节食减重。先恢复、再调整，通常比快速掉秤更安全。',
    minutes: 3,
    tag: '恢复与体重',
    sections: [
      {
        h: '先接受“不会立刻恢复”',
        p: ['子宫、血容量、水肿和脂肪储备都需要时间变化。42 天内的体重波动很正常，不必每天盯着秤。']
      },
      {
        h: '哺乳期需要足够热量',
        p: ['纯母乳喂养每天大约额外需要 300-500 千卡。热量过低可能影响奶量和疲劳恢复。']
      },
      {
        h: '温和活动',
        p: ['顺产后可以按身体感受缓慢散步；剖腹产要等伤口稳定、医生允许后再增加活动。避免过早做高强度腹部训练。']
      },
      {
        h: '记录比焦虑有用',
        p: ['每周固定时间称一次体重，配合饮水、睡眠、饮食记录，更容易看出真实趋势。短期波动不代表失败。']
      }
    ]
  }
];

const ARTICLE_MAP = new Map(ARTICLES.map((a) => [a.id, a]));

module.exports = { ARTICLES, ARTICLE_MAP };

},
"planner": function(module, exports, require) {
'use strict';

const { RECIPES, RECIPE_MAP } = require('data/recipes');
const { SLOTS, DEFAULT_SLOTS, restrictionTerms, stageInfo } = require('data/meta');

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
  // 忌口优先：任何情况下都不会放宽忌口条件；下架菜品不参与新搭配。
  const allowed = RECIPES.filter(
    (r) => r.available !== false && r.course === course && !isExcluded(r, terms)
  );
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
    tips: r.tips,
    method: r.method,
    difficulty: r.difficulty,
    nutrients: r.nutrients,
    cautions: r.cautions,
    substitutes: r.substitutes,
    vegetarian: Boolean(r.vegetarian),
    price: Number(r.price) || 0,
    available: r.available !== false,
    custom: Boolean(r.custom)
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

function daySummary(plan, date, eaten, skipped = {}) {
  const day = resolveDay(plan, date);
  if (!day) return null;
  const eatenSlots = Array.isArray(eaten?.[date]) ? eaten[date] : [];
  const skippedSlots = Array.isArray(skipped?.[date]) ? skipped[date] : [];
  const slotKeys = day.meals.map((m) => m.slot);
  const handled = (s) => eatenSlots.includes(s) || skippedSlots.includes(s);
  return {
    date,
    weekday: weekdayLabel(date),
    dayOfMonth: Number(date.slice(8, 10)),
    kcal: day.nutrition.kcal,
    mealCount: slotKeys.length,
    eatenCount: slotKeys.filter((s) => eatenSlots.includes(s)).length,
    skippedCount: slotKeys.filter((s) => skippedSlots.includes(s)).length,
    complete: slotKeys.length > 0 && slotKeys.every(handled)
  };
}

function planDays(plan) {
  if (!plan) return [];
  return Array.from({ length: plan.days }, (_, i) => addDays(plan.startDate, i));
}

function planOverview(plan, eaten, skipped = {}) {
  if (!plan) return null;
  return {
    startDate: plan.startDate,
    days: plan.days,
    createdAt: plan.createdAt,
    dayList: planDays(plan).map((d) => daySummary(plan, d, eaten, skipped)).filter(Boolean)
  };
}

function swapDish(plan, profile, date, slot, course, eaten, skipped) {
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
  if (skipped?.[date]) {
    skipped[date] = skipped[date].filter((s) => s !== slot);
  }
  return { day: resolveDay(plan, date), recipeId: recipe.id };
}

/**
 * 手动把某道菜放进餐单的指定餐次。
 * 会校验餐次、品类与忌口，成功时清除该餐的打卡/跳过状态。
 */
function applyRecipe(plan, profile, date, slot, course, recipeId, eaten, skipped) {
  if (!plan || !plan.items?.[date]) return { error: '该日期没有餐单' };
  const slotDef = SLOT_MAP.get(slot);
  if (!slotDef || !slotDef.courses.includes(course)) return { error: '餐次或品类不正确' };
  const recipe = RECIPE_MAP.get(recipeId);
  if (!recipe || recipe.course !== course) return { error: '食谱与餐次品类不匹配' };
  const { terms } = buildExclusions(profile);
  if (isExcluded(recipe, terms)) return { error: '这道菜含有你设置的忌口食材，已为你拦截' };

  const meal = plan.items[date][slot];
  if (!meal) return { error: '这一餐还没有安排' };
  meal[course] = recipe.id;
  if (eaten?.[date]) eaten[date] = eaten[date].filter((s) => s !== slot);
  if (skipped?.[date]) skipped[date] = skipped[date].filter((s) => s !== slot);
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
  const cookedCount = Array.isArray(user.cooked) ? user.cooked.length : 0;
  if (!plan) {
    return {
      planDays: 0,
      favoriteCount,
      cookedCount,
      eatenMeals: 0,
      skippedMeals: 0,
      totalMeals: 0,
      completionRate: 0,
      streak: 0,
      plannedToday: false,
      recordDays: Object.keys(user.logs || {}).length
    };
  }
  const dates = planDays(plan);
  let totalMeals = 0;
  let eatenMeals = 0;
  let skippedMeals = 0;
  let passedMeals = 0;
  let passedHandled = 0;

  for (const date of dates) {
    const day = resolveDay(plan, date);
    if (!day) continue;
    const eaten = new Set(user.eaten?.[date] || []);
    const skipped = new Set(user.skipped?.[date] || []);
    for (const meal of day.meals) {
      totalMeals += 1;
      if (eaten.has(meal.slot)) eatenMeals += 1;
      else if (skipped.has(meal.slot)) skippedMeals += 1;
      if (date <= today) {
        passedMeals += 1;
        if (eaten.has(meal.slot) || skipped.has(meal.slot)) passedHandled += 1;
      }
    }
  }

  // 连续打卡：从今天（或昨天）往前数，所有餐次都已吃或跳过的天数。
  let streak = 0;
  let cursor = dates.includes(today) ? today : addDays(today, -1);
  const dateSet = new Set(dates);
  while (dateSet.has(cursor)) {
    const day = resolveDay(plan, cursor);
    if (!day || !day.meals.length) break;
    const eaten = new Set(user.eaten?.[cursor] || []);
    const skipped = new Set(user.skipped?.[cursor] || []);
    if (day.meals.every((m) => eaten.has(m.slot) || skipped.has(m.slot))) {
      streak += 1;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }

  return {
    planDays: plan.days,
    favoriteCount,
    cookedCount,
    eatenMeals,
    skippedMeals,
    totalMeals,
    completionRate: passedMeals ? Math.round((passedHandled / passedMeals) * 100) : 0,
    streak,
    plannedToday: dateSet.has(today),
    recordDays: Object.keys(user.logs || {}).length
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
  applyRecipe,
  aggregateGrocery,
  computeStats,
  publicRecipe,
  planDays
};

},
"dish-images-index.json": function(module) { module.exports = {"k01":{"offset":0,"length":69418},"k02":{"offset":69418,"length":56193},"k03":{"offset":125611,"length":32290},"k04":{"offset":157901,"length":76421},"k05":{"offset":234322,"length":61179},"k06":{"offset":295501,"length":79052},"k07":{"offset":374553,"length":62601},"k08":{"offset":437154,"length":15670},"k09":{"offset":452824,"length":31165},"k10":{"offset":483989,"length":26529},"k11":{"offset":510518,"length":52298},"k12":{"offset":562816,"length":163263},"k13":{"offset":726079,"length":48824},"k14":{"offset":774903,"length":64076},"k15":{"offset":838979,"length":60256},"k16":{"offset":899235,"length":49643},"k17":{"offset":948878,"length":74642},"k18":{"offset":1023520,"length":86276},"k19":{"offset":1109796,"length":31655},"k20":{"offset":1141451,"length":49171},"k21":{"offset":1190622,"length":25616},"k22":{"offset":1216238,"length":61237},"k23":{"offset":1277475,"length":32835},"k24":{"offset":1310310,"length":32304},"k25":{"offset":1342614,"length":123964},"k26":{"offset":1466578,"length":109849},"k27":{"offset":1576427,"length":46420},"k28":{"offset":1622847,"length":60302},"k29":{"offset":1683149,"length":37973},"k30":{"offset":1721122,"length":69739},"k31":{"offset":1790861,"length":48511},"k32":{"offset":1839372,"length":68188},"k33":{"offset":1907560,"length":72330},"k34":{"offset":1979890,"length":21619},"k35":{"offset":2001509,"length":117871},"k36":{"offset":2119380,"length":16912},"m01":{"offset":2136292,"length":37599},"m02":{"offset":2173891,"length":41434},"m03":{"offset":2215325,"length":70322},"m04":{"offset":2285647,"length":91199},"m05":{"offset":2376846,"length":90640},"m06":{"offset":2467486,"length":159306},"m07":{"offset":2626792,"length":71789},"m08":{"offset":2698581,"length":91798},"m09":{"offset":2790379,"length":61900},"m10":{"offset":2852279,"length":85624},"m11":{"offset":2937903,"length":123698},"m12":{"offset":3061601,"length":74493},"m13":{"offset":3136094,"length":74113},"m14":{"offset":3210207,"length":92051},"m15":{"offset":3302258,"length":76824},"m16":{"offset":3379082,"length":56960},"m17":{"offset":3436042,"length":66511},"m18":{"offset":3502553,"length":109214},"m19":{"offset":3611767,"length":84391},"m20":{"offset":3696158,"length":94857},"m21":{"offset":3791015,"length":85980},"m22":{"offset":3876995,"length":122750},"m23":{"offset":3999745,"length":85584},"m24":{"offset":4085329,"length":133931},"m25":{"offset":4219260,"length":87316},"m26":{"offset":4306576,"length":62161},"m27":{"offset":4368737,"length":92655},"m28":{"offset":4461392,"length":148476},"m29":{"offset":4609868,"length":83661},"m30":{"offset":4693529,"length":85482},"m31":{"offset":4779011,"length":59081},"m32":{"offset":4838092,"length":74619},"m33":{"offset":4912711,"length":74602},"m34":{"offset":4987313,"length":81488},"m35":{"offset":5068801,"length":88132},"m36":{"offset":5156933,"length":135903},"m37":{"offset":5292836,"length":116749},"m38":{"offset":5409585,"length":81248},"m39":{"offset":5490833,"length":67821},"m40":{"offset":5558654,"length":77165},"m41":{"offset":5635819,"length":78085},"m42":{"offset":5713904,"length":92937},"m43":{"offset":5806841,"length":68213},"m44":{"offset":5875054,"length":66353},"m45":{"offset":5941407,"length":80459},"m46":{"offset":6021866,"length":109292},"m47":{"offset":6131158,"length":90008},"m48":{"offset":6221166,"length":79302},"m49":{"offset":6300468,"length":91440},"m50":{"offset":6391908,"length":75196},"m51":{"offset":6467104,"length":86730},"m52":{"offset":6553834,"length":143618},"m53":{"offset":6697452,"length":104804},"m54":{"offset":6802256,"length":72793},"m55":{"offset":6875049,"length":54189},"m56":{"offset":6929238,"length":69233},"m57":{"offset":6998471,"length":54039},"m58":{"offset":7052510,"length":95787},"m59":{"offset":7148297,"length":65026},"m60":{"offset":7213323,"length":85238},"m61":{"offset":7298561,"length":81202},"m62":{"offset":7379763,"length":77233},"m63":{"offset":7456996,"length":98272},"m64":{"offset":7555268,"length":73885},"m65":{"offset":7629153,"length":70346},"p01":{"offset":7699499,"length":43130},"p02":{"offset":7742629,"length":46971},"p03":{"offset":7789600,"length":47153},"p04":{"offset":7836753,"length":82322},"p05":{"offset":7919075,"length":48481},"p06":{"offset":7967556,"length":64924},"p07":{"offset":8032480,"length":52482},"p08":{"offset":8084962,"length":55462},"p09":{"offset":8140424,"length":73689},"p10":{"offset":8214113,"length":65912},"p11":{"offset":8280025,"length":75121},"p12":{"offset":8355146,"length":62940},"p13":{"offset":8418086,"length":64885},"p14":{"offset":8482971,"length":68429},"p15":{"offset":8551400,"length":59034},"p16":{"offset":8610434,"length":59777},"p17":{"offset":8670211,"length":80750},"p18":{"offset":8750961,"length":60325},"p19":{"offset":8811286,"length":34450},"p20":{"offset":8845736,"length":56005},"p21":{"offset":8901741,"length":51273},"p22":{"offset":8953014,"length":65531},"p23":{"offset":9018545,"length":86083},"p24":{"offset":9104628,"length":69041},"p25":{"offset":9173669,"length":71618},"p26":{"offset":9245287,"length":65584},"p27":{"offset":9310871,"length":76031},"p28":{"offset":9386902,"length":79631},"p29":{"offset":9466533,"length":63339},"p30":{"offset":9529872,"length":82323},"p31":{"offset":9612195,"length":61357},"p32":{"offset":9673552,"length":42708},"p33":{"offset":9716260,"length":81951},"p34":{"offset":9798211,"length":68603},"p35":{"offset":9866814,"length":19964},"p36":{"offset":9886778,"length":78922},"p37":{"offset":9965700,"length":90919},"p38":{"offset":10056619,"length":69303},"p39":{"offset":10125922,"length":70805},"p40":{"offset":10196727,"length":75655},"p41":{"offset":10272382,"length":47664},"p42":{"offset":10320046,"length":57726},"p43":{"offset":10377772,"length":78331},"s01":{"offset":10456103,"length":53956},"s02":{"offset":10510059,"length":45459},"s03":{"offset":10555518,"length":16656},"s04":{"offset":10572174,"length":35476},"s05":{"offset":10607650,"length":68942},"s06":{"offset":10676592,"length":69031},"s07":{"offset":10745623,"length":89457},"s08":{"offset":10835080,"length":71546},"s09":{"offset":10906626,"length":83798},"s10":{"offset":10990424,"length":55316},"s11":{"offset":11045740,"length":88596},"s12":{"offset":11134336,"length":45680},"s13":{"offset":11180016,"length":77879},"s14":{"offset":11257895,"length":18130},"s15":{"offset":11276025,"length":47965},"s16":{"offset":11323990,"length":50197},"s17":{"offset":11374187,"length":75290},"s18":{"offset":11449477,"length":63902},"s19":{"offset":11513379,"length":53012},"s20":{"offset":11566391,"length":40661},"s21":{"offset":11607052,"length":43158},"s22":{"offset":11650210,"length":63740},"s23":{"offset":11713950,"length":99486},"s24":{"offset":11813436,"length":61929},"s25":{"offset":11875365,"length":46278},"s26":{"offset":11921643,"length":62119},"s27":{"offset":11983762,"length":61413},"s28":{"offset":12045175,"length":62552},"s29":{"offset":12107727,"length":101454},"s30":{"offset":12209181,"length":78737},"s31":{"offset":12287918,"length":86698},"s32":{"offset":12374616,"length":97368},"s33":{"offset":12471984,"length":165430},"s34":{"offset":12637414,"length":99525},"s35":{"offset":12736939,"length":29586},"s36":{"offset":12766525,"length":75291},"v01":{"offset":12841816,"length":83338},"v02":{"offset":12925154,"length":92273},"v03":{"offset":13017427,"length":82160},"v04":{"offset":13099587,"length":86748},"v05":{"offset":13186335,"length":84647},"v06":{"offset":13270982,"length":96458},"v07":{"offset":13367440,"length":59721},"v08":{"offset":13427161,"length":130507},"v09":{"offset":13557668,"length":72701},"v10":{"offset":13630369,"length":105608},"v11":{"offset":13735977,"length":52276},"v12":{"offset":13788253,"length":85193},"v13":{"offset":13873446,"length":74170},"v14":{"offset":13947616,"length":90025},"v15":{"offset":14037641,"length":79500},"v16":{"offset":14117141,"length":56142},"v17":{"offset":14173283,"length":61719},"v18":{"offset":14235002,"length":77611},"v19":{"offset":14312613,"length":113697},"v20":{"offset":14426310,"length":48323},"v21":{"offset":14474633,"length":76425},"v22":{"offset":14551058,"length":84266},"v23":{"offset":14635324,"length":82387},"v24":{"offset":14717711,"length":75355},"v25":{"offset":14793066,"length":66132},"v26":{"offset":14859198,"length":92227},"v27":{"offset":14951425,"length":119463},"v28":{"offset":15070888,"length":64522},"v29":{"offset":15135410,"length":73434},"v30":{"offset":15208844,"length":136628},"v31":{"offset":15345472,"length":93643},"v32":{"offset":15439115,"length":70869}}; }
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
