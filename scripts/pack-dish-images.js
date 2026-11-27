'use strict';

/**
 * 将 public/images/dishes/ 下的菜品图打包为单个二进制文件与索引。
 * 部署平台对图片文件数量有限制，打包后由 server.js 按菜品 ID 输出。
 *
 * 用法：node scripts/pack-dish-images.js
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'public', 'images', 'dishes');
const PACK_FILE = path.join(ROOT, 'src', 'data', 'dish-images.bin');
const INDEX_FILE = path.join(ROOT, 'src', 'data', 'dish-images-index.json');

if (!fs.existsSync(SOURCE_DIR)) {
  console.error('未找到 public/images/dishes/，请先运行 node scripts/fetch-dish-images.js');
  process.exit(1);
}

const files = fs
  .readdirSync(SOURCE_DIR)
  .filter((file) => file.endsWith('.jpg'))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

const chunks = [];
const index = {};
let offset = 0;
for (const file of files) {
  const buffer = fs.readFileSync(path.join(SOURCE_DIR, file));
  index[file.replace('.jpg', '')] = { offset, length: buffer.length };
  chunks.push(buffer);
  offset += buffer.length;
}

fs.writeFileSync(PACK_FILE, Buffer.concat(chunks));
fs.writeFileSync(INDEX_FILE, JSON.stringify(index));
console.log(`已打包 ${files.length} 张菜品图，共 ${(offset / 1024 / 1024).toFixed(1)}MB`);
