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
