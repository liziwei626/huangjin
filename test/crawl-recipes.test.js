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
