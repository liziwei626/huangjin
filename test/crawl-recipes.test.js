'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { crawl } = require('../scripts/crawl-recipes');
const { createRequester } = require('../scripts/crawler/request');

const photo = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64');
const structured = (data) => `<script type="application/ld+json">${JSON.stringify(data)}</script>`;

async function workspace(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'recipe-crawl-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return root;
}

test('HowToCook 读取 Markdown 食材、分类和本地配图', async (t) => {
  const root = await workspace(t);
  const input = path.join(root, 'dishes', 'vegetable_dish');
  const out = path.join(root, 'out');
  await fs.mkdir(input, { recursive: true });
  await fs.writeFile(path.join(input, '封面.png'), photo);
  await fs.writeFile(path.join(input, '菜心.md'), [
    '# 菜心的做法', '![封面](./封面.png)', '## 必备原料和工具', '- 菜心',
    '## 计算', '- 菜心 250g', '- 盐 适量', '## 操作', '1. 洗净', '2. 焯熟'
  ].join('\n'));
  assert.deepEqual(await crawl({ source: 'howtocook', input: root, out }), { recipes: 1, images: 1 });
  const [recipe] = JSON.parse(await fs.readFile(path.join(out, 'recipes.json'), 'utf8')).recipes;
  assert.equal(recipe.name, '菜心');
  assert.equal(recipe.course, 'veg');
  assert.deepEqual(recipe.ingredients, [{ name: '菜心', amountText: '250g' }, { name: '盐', amountText: '适量' }]);
  assert.deepEqual(recipe.steps.map((step) => step.text), ['洗净', '焯熟']);
  assert.deepEqual(await fs.readFile(path.join(out, recipe.images[0].path)), photo);
});

test('本地数据包统一分类、保存照片并原子替换清单', async (t) => {
  const root = await workspace(t);
  const input = path.join(root, 'source.json');
  const out = path.join(root, 'out');
  const manifest = path.join(out, 'recipes.json');
  const recipe = { sourceId: 'one', name: '米粥', categories: ['主食'],
    ingredients: [{ name: '米', amountText: '适量' }],
    steps: ['洗米', { text: '煮熟', images: ['photo.png'] }], images: ['photo.png'] };
  await fs.writeFile(path.join(root, 'photo.png'), photo);
  await fs.writeFile(input, JSON.stringify([recipe, recipe]));
  const options = { source: 'json', input, out, onError() {} };
  assert.deepEqual(await crawl(options), { recipes: 1, images: 1 });
  const snapshot = await fs.readFile(manifest, 'utf8');
  const saved = JSON.parse(snapshot).recipes[0];
  assert.equal(saved.course, 'staple');
  assert.deepEqual(saved.ingredients, recipe.ingredients);
  assert.deepEqual(saved.steps.map((step) => step.text), ['洗米', '煮熟']);
  assert.equal(saved.images[0].path, saved.steps[1].images[0].path);
  assert.deepEqual(await fs.readFile(path.join(out, saved.images[0].path)), photo);
  await crawl(options);
  assert.equal(await fs.readFile(manifest, 'utf8'), snapshot);
  await fs.writeFile(path.join(root, 'photo.png'), 'invalid');
  await assert.rejects(crawl(options), /图片/);
  assert.equal(await fs.readFile(manifest, 'utf8'), snapshot);
});

test('网页来源跟随分页并去重，拒绝访问及超时保留旧清单', async (t) => {
  const root = await workspace(t);
  const visits = [];
  const listing = structured({ '@type': 'ItemList', itemListElement: [{ '@type': 'ListItem', position: 1, url: '/dish' }] });
  const dish = structured({ '@context': 'https://schema.org', '@type': 'Recipe', name: '南瓜汤',
    recipeCategory: '汤羹', recipeIngredient: ['南瓜'], image: '/photo.png', recipeInstructions: [
      { '@type': 'HowToStep', text: '切块' }, { '@type': 'HowToSection', itemListElement: [
        { '@type': 'HowToStep', text: '煮熟', image: '/photo.png' }
      ] }
    ] });
  const server = http.createServer((req, res) => {
    visits.push(req.url);
    if (req.url === '/slow') return;
    if (req.url === '/forbidden') return res.writeHead(403).end();
    if (req.url === '/robots.txt') return res.end('User-agent: *\nDisallow: /blocked\n');
    if (req.url === '/photo.png') return res.writeHead(200, { 'Content-Type': 'image/png' }).end(photo);
    res.setHeader('Content-Type', 'text/html');
    if (req.url === '/list') return res.end(`<link rel="next" href="/page2">${listing}`);
    if (req.url === '/page2') return res.end(listing);
    if (req.url === '/dish') return res.end(dish);
    return res.writeHead(404).end();
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); return new Promise((resolve) => server.close(resolve)); });
  const host = `127.0.0.1:${server.address().port}`;
  const base = `http://${host}`;
  const request = createRequester({ pageHosts: [host], imageHosts: [host], allowLocal: true, delayMs: 0, timeoutMs: 300 });
  const options = { source: 'jsonld', out: root, request, onError() {} };
  assert.deepEqual(await crawl({ ...options, input: `${base}/list` }), { recipes: 1, images: 1 });
  assert.ok(visits.includes('/page2'));
  assert.equal(visits.filter((url) => url === '/dish').length, 1);
  const file = path.join(root, 'recipes.json');
  const snapshot = await fs.readFile(file, 'utf8');
  const recipe = JSON.parse(snapshot).recipes[0];
  assert.equal(recipe.course, 'soup');
  assert.deepEqual(recipe.steps.map((step) => step.text), ['切块', '煮熟']);
  assert.equal(recipe.steps[1].images[0].path, recipe.images[0].path);
  assert.deepEqual(await fs.readFile(path.join(root, recipe.images[0].path)), photo);
  assert.equal(visits.filter((url) => url === '/photo.png').length, 1);
  await assert.rejects(crawl({ ...options, input: `${base}/list`, maxPages: 1 }));
  await assert.rejects(crawl({ ...options, input: `${base}/forbidden` }), /403/);
  assert.equal(visits.filter((url) => url === '/forbidden').length, 1);
  await assert.rejects(crawl({ ...options, input: `${base}/slow` }));
  await assert.rejects(crawl({ ...options, input: `${base}/blocked` }));
  assert.ok(!visits.includes('/blocked'));
  assert.equal(await fs.readFile(file, 'utf8'), snapshot);
});

for (const site of [
  {
    source: 'douguo', origin: 'https://www.douguo.com', recipePath: '/cookbook/123.html',
    photoHost: 'https://cp1.douguo.com', category: '汤羹', course: 'soup',
    markup: `<h1>南瓜汤</h1><div id="banner" data-origin="COVER"></div><table class="retamr"><tr>
      <td><span class="scname">南瓜</span><span class="scnum">适量</span></td></tr></table>
      ${structured({ '@type': 'Recipe', name: '南瓜汤', recipeCategory: '汤羹' })}
      <div class="step"><div class="stepcont"><div class="stepinfo"><p>步骤1</p>切块</div></div>
      <div class="stepcont"><a data-origin="STEP"></a><div class="stepinfo"><p>步骤2</p>煮熟</div></div></div>`
  },
  {
    source: 'meishichina', origin: 'https://home.meishichina.com', recipePath: '/recipe-123.html',
    photoHost: 'https://i3.meishichina.com', category: '汤羹', course: 'soup',
    markup: `<h1 id="recipe_title">南瓜汤</h1><ul class="recipeCategory_sub_R"><li>
      <span class="category_s1"><a>南瓜</a></span><span class="category_s2">适量</span></li></ul>
      <div class="recipeTip"><a>汤羹</a></div><div class="recipeStep"><ul>
      <li><div class="recipeStep_word"><div>1</div>切块</div></li>
      <li><div class="recipeStep_img"><img data-src="STEP"></div><div class="recipeStep_word"><div>2</div>煮熟</div></li>
      </ul></div>`
  },
  {
    source: 'xiachufang', origin: 'https://www.xiachufang.com', recipePath: '/recipe/123/',
    photoHost: 'https://i2.chuimg.com', category: '主食', course: 'staple',
    markup: `<h1 class="page-title">南瓜饭</h1><div class="ings"><table><tr>
      <td class="name"><a>南瓜</a></td><td class="unit">适量</td></tr></table></div>
      <div class="recipe-cats"><a>主食</a></div><div class="steps"><ol>
      <li><p class="text">切块</p></li><li><p class="text">煮熟</p><img data-src="STEP"></li>
      </ol></div>`
  }
]) {
  test(`${site.source} 发现菜谱、保存分类和步骤照片，遇验证页或 403 保留旧清单`, async (t) => {
    const out = await workspace(t);
    const input = `${site.origin}/`;
    const recipeUrl = `${site.origin}${site.recipePath}`;
    const stepUrl = `${site.photoHost}/step.png`;
    const coverUrl = `${site.photoHost}/cover.png`;
    const visits = [];
    let blocked = false;
    const request = async (url, kind) => {
      visits.push([url, kind]);
      const respond = (html) => ({ url, body: Buffer.from(html) });
      if (url === input) return respond(`<a href="${site.recipePath}">菜谱</a><a rel="next" href="/second">下一页</a>`);
      if (url === `${site.origin}/second`) return respond(`<a href="${site.recipePath}?ref=listing#top">重复菜谱</a><a href="https://example.com${site.recipePath}">外站</a>`);
      if (url === recipeUrl) {
        if (blocked && site.source === 'meishichina') throw new Error('HTTP 403');
        if (blocked) return respond('<title>滑动验证</title>');
        return respond(`<meta property="og:image" content="${coverUrl}">${site.markup.replace('STEP', stepUrl).replace('COVER', coverUrl)}`);
      }
      assert.equal(kind, 'image');
      assert.ok([stepUrl, coverUrl].includes(url), `Unexpected request: ${url}`);
      return { url, body: photo };
    };
    const options = { source: site.source, input, out, request, maxPages: 3, onError() {} };
    assert.deepEqual(await crawl(options), { recipes: 1, images: 1 });
    assert.equal(visits.filter(([url]) => url === recipeUrl).length, 1);
    const manifest = path.join(out, 'recipes.json');
    const snapshot = await fs.readFile(manifest, 'utf8');
    const [recipe] = JSON.parse(snapshot).recipes;
    assert.equal(recipe.sourceId, '123');
    assert.equal(recipe.sourceUrl, recipeUrl);
    assert.deepEqual(recipe.categories, [site.category]);
    assert.equal(recipe.course, site.course);
    assert.equal(recipe.reviewStatus, site.source === 'douguo' ? 'candidate' : undefined);
    assert.deepEqual(recipe.ingredients, [{ name: '南瓜', amountText: '适量' }]);
    assert.deepEqual(recipe.steps.map(({ text }) => text), ['切块', '煮熟']);
    assert.equal(recipe.steps[1].images[0].source, stepUrl);
    assert.equal(recipe.images[0].source, coverUrl);
    assert.equal(recipe.steps[1].images[0].path, recipe.images[0].path);
    assert.deepEqual(await fs.readFile(path.join(out, recipe.images[0].path)), photo);
    blocked = true;
    await assert.rejects(crawl(options), /403|站点要求访问验证/);
    assert.equal(await fs.readFile(manifest, 'utf8'), snapshot);
  });
}
