'use strict';

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
    ingredients: [['豆干', 150, 'g', '豆制品'], ['彩椒', 80, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料']],
    steps: ['豆干切条，彩椒切丝。', '少油爆香蒜末，下豆干翻炒 2 分钟。', '加入彩椒大火快炒，少许盐调味。'],
    tips: '豆干蛋白质密度高，是清淡饮食里的好搭档。'
  },
  {
    id: 'm26', name: '腰果西芹', course: 'main', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['植物蛋白', '膳食纤维', '清爽'], kcal: 240, protein: 8, carbs: 12, fat: 18, time: 12, proteinType: 'nuts',
    ingredients: [['西芹', 150, 'g', '蔬菜'], ['腰果', 20, 'g', '干货药材'], ['蒜', 2, '瓣', '调味料']],
    steps: ['西芹撕去老筋，切斜段后焯水 30 秒。', '小火把腰果炒香备用。', '少油爆香蒜末，下西芹快炒，最后拌入腰果。'],
    tips: '坚果过敏者请避开；腰果最后放才够酥脆。'
  },
  {
    id: 'm27', name: '素炒三菇', course: 'main', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['鲜香', '低脂', '增强免疫'], kcal: 130, protein: 7, carbs: 12, fat: 6, time: 15, proteinType: 'veg',
    ingredients: [['香菇', 40, 'g', '蔬菜'], ['白玉菇', 60, 'g', '蔬菜'], ['平菇', 60, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料']],
    steps: ['三种菌菇洗净，香菇切片。', '菌菇焯水 1 分钟捞出。', '少油爆香蒜末，下菌菇大火翻炒 2 分钟，少许盐调味。'],
    tips: '菌菇自带鲜味，少盐也很好吃。'
  },
  {
    id: 'm31', name: '清炒山药木耳', course: 'main', slots: ['breakfast', 'lunch', 'dinner'], stages: ALL,
    tags: ['健脾', '爽脆', '低脂'], kcal: 180, protein: 5, carbs: 30, fat: 5, time: 15, proteinType: 'veg',
    ingredients: [['铁棍山药', 150, 'g', '蔬菜'], ['干木耳', 5, 'g', '干货药材'], ['彩椒', 40, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料']],
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
    ingredients: [['虾仁', 100, 'g', '水产'], ['芦笋', 120, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料']],
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
    ingredients: [['西兰花', 200, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['食用油', 4, 'g', '调味料']],
    steps: ['西兰花切小朵，用淡盐水浸泡 10 分钟。', '焯水 1 分钟后捞出。', '热锅少油爆香蒜末，下西兰花快炒，少许盐调味。'],
    tips: '先焯后炒能减少用油，颜色也更翠绿。'
  },
  {
    id: 'v02', name: '蒜蓉菠菜', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补铁', '纤维', '清淡'], kcal: 80, protein: 5, carbs: 8, fat: 4, time: 10,
    ingredients: [['菠菜', 200, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['食用油', 4, 'g', '调味料']],
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
    ingredients: [['时令青菜', 200, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['食用油', 4, 'g', '调味料']],
    steps: ['青菜洗净沥干，蒜切片。', '热锅少油爆香蒜片。', '下青菜大火快炒，少许盐调味。'],
    tips: '叶菜类大火快炒，口感和营养都保留得更好。'
  },
  {
    id: 'v05', name: '香菇油菜', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['补钙', '纤维', '鲜香'], kcal: 95, protein: 5, carbs: 11, fat: 4, time: 15,
    ingredients: [['油菜', 200, 'g', '蔬菜'], ['香菇', 50, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料']],
    steps: ['油菜和香菇洗净，香菇切片。', '油菜焯水后摆盘。', '少油炒香香菇和蒜，加少许水煮 2 分钟，浇在油菜上。'],
    tips: '油菜钙含量不错，搭配香菇更鲜美。'
  },
  {
    id: 'v06', name: '清炒芦笋', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['叶酸', '纤维', '清爽'], kcal: 85, protein: 5, carbs: 8, fat: 4, time: 12,
    ingredients: [['芦笋', 180, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['食用油', 4, 'g', '调味料']],
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
    ingredients: [['胡萝卜', 120, 'g', '蔬菜'], ['干木耳', 5, 'g', '干货药材'], ['蒜', 2, '瓣', '调味料']],
    steps: ['木耳提前泡发，撕小朵；胡萝卜切片。', '木耳焯水 1 分钟。', '少油爆香蒜末，下胡萝卜翻炒，加木耳炒熟调味。'],
    tips: '木耳泡发时间不宜超过 2 小时，现泡现用更安全。'
  },
  {
    id: 'v09', name: '清炒莴笋', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['通乳', '清爽', '低热量'], kcal: 70, protein: 3, carbs: 9, fat: 3, time: 12,
    ingredients: [['莴笋', 200, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料']],
    steps: ['莴笋去皮切片，可加少许盐腌 5 分钟出水。', '热锅少油爆香蒜末。', '下莴笋大火快炒 2 分钟，少许盐调味。'],
    tips: '莴笋清香爽脆，传统上也被认为有助于通乳。'
  },
  {
    id: 'v10', name: '蒜蓉丝瓜', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['清淡', '通络', '补水'], kcal: 75, protein: 3, carbs: 9, fat: 3, time: 12,
    ingredients: [['丝瓜', 200, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料']],
    steps: ['丝瓜去皮滚刀切块。', '热锅少油爆香蒜末。', '下丝瓜翻炒至变软出汁，少许盐调味。'],
    tips: '丝瓜易出水，炒制时间不要太长。'
  },
  {
    id: 'v11', name: '手撕包菜', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['开胃', '纤维', '爽脆'], kcal: 85, protein: 4, carbs: 11, fat: 4, time: 12,
    ingredients: [['包菜', 200, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料'], ['食用油', 4, 'g', '调味料']],
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
    ingredients: [['秋葵', 180, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料']],
    steps: ['秋葵洗净去蒂，焯水 1 分钟后切段。', '热锅少油爆香蒜末。', '下秋葵快炒，少许盐调味。'],
    tips: '秋葵黏液富含可溶性纤维，对产后便秘很友好。'
  },
  {
    id: 'v14', name: '蒜蓉茼蒿', course: 'veg', slots: ['lunch', 'dinner'], stages: ALL,
    tags: ['安神', '清香', '纤维'], kcal: 75, protein: 4, carbs: 8, fat: 3, time: 10,
    ingredients: [['茼蒿', 200, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料']],
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
    ingredients: [['莲藕', 180, 'g', '蔬菜'], ['米醋', 5, 'ml', '调味料'], ['蒜', 2, '瓣', '调味料']],
    steps: ['莲藕去皮切薄片，泡清水防氧化。', '焯水 1 分钟捞出。', '热锅少油爆香蒜末，下藕片快炒，烹入米醋调味。'],
    tips: '少量米醋提味，有助于改善产后胃口。'
  },
  {
    id: 'v17', name: '清炒荷兰豆', course: 'veg', slots: ['lunch', 'dinner'], stages: S2,
    tags: ['膳食纤维', '清甜', '低脂'], kcal: 90, protein: 5, carbs: 10, fat: 3, time: 12,
    ingredients: [['荷兰豆', 180, 'g', '蔬菜'], ['蒜', 2, '瓣', '调味料']],
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
  }
];

function imageForRecipe(r) {
  const n = r.name;
  if (r.course === 'staple') {
    if (/面|馄饨|饺/.test(n)) return '/images/noodle.jpg';
    if (/饭/.test(n)) return '/images/rice.jpg';
    return '/images/staple.jpg';
  }
  if (r.course === 'veg') return '/images/veg.jpg';
  if (r.course === 'soup') return '/images/soup.jpg';
  if (r.course === 'snack') {
    if (/茶|豆浆/.test(n)) return '/images/drink.jpg';
    if (/蒸蛋/.test(n)) return '/images/egg.jpg';
    if (/果盘|水果/.test(n)) return '/images/fruit.jpg';
    return '/images/dessert.jpg';
  }
  if (r.course === 'main') {
    if (/鸡/.test(n)) return '/images/chicken.jpg';
    if (/牛|羊/.test(n)) return '/images/beef.jpg';
    if (/豆腐|豆干/.test(n)) return '/images/tofu.jpg';
    if (/蛋/.test(n)) return '/images/egg.jpg';
    if (/猪|排骨|腰|肉末|肉饼|瘦肉|蹄/.test(n)) return '/images/pork.jpg';
    if (/鱼|虾|蟹|贝|蛤蜊|海参/.test(n)) return '/images/main.jpg';
    return '/images/chicken.jpg';
  }
  return '/images/main.jpg';
}

const RECIPES = RAW.map((r) => ({
  ...r,
  image: imageForRecipe(r),
  proteinType: r.proteinType || 'none',
  searchText: [r.name, ...r.tags, ...r.ingredients.map((i) => i[0])].join(' ')
}));

const RECIPE_MAP = new Map(RECIPES.map((r) => [r.id, r]));

module.exports = { RECIPES, RECIPE_MAP };
