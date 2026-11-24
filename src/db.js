'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

/**
 * 轻量 JSON 存储。
 * 平台的文件系统除 TMPDIR 外均为只读，因此数据写入 ${TMPDIR:-/tmp}/nuanyue-data。
 * 运行期间数据在进程内保持一致，实例重启后重新落盘（个人自用/演示场景足够）。
 */
const DATA_DIR = path.join(process.env.TMPDIR || '/tmp', 'nuanyue-data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let db = null;

function emptyDb() {
  return {
    version: 1,
    secret: crypto.randomBytes(32).toString('hex'),
    createdAt: new Date().toISOString(),
    users: []
  };
}

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function load() {
  if (db) return db;
  ensureDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (parsed && Array.isArray(parsed.users)) {
        db = parsed;
        return db;
      }
    } catch (err) {
      console.error('[db] failed to parse store, starting fresh:', err.message);
      try {
        fs.renameSync(DB_FILE, `${DB_FILE}.broken-${Date.now()}`);
      } catch {
        /* ignore */
      }
    }
  }
  db = emptyDb();
  save();
  return db;
}

let saveTimer = null;

function save() {
  if (!db) return;
  if (saveTimer) clearTimeout(saveTimer);
  // 合并短时间内的多次写盘，避免频繁 IO。
  saveTimer = setTimeout(flush, 30);
}

function flush() {
  saveTimer = null;
  if (!db) return;
  try {
    ensureDir();
    const tmp = `${DB_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(db));
    fs.renameSync(tmp, DB_FILE);
  } catch (err) {
    console.error('[db] failed to persist store:', err.message);
  }
}

function getDb() {
  return load();
}

function findUserById(id) {
  return load().users.find((u) => u.id === id) || null;
}

function findUserByUsername(username) {
  const key = String(username || '').trim().toLowerCase();
  return load().users.find((u) => u.username.toLowerCase() === key) || null;
}

function addUser(user) {
  load().users.push(user);
  save();
  return user;
}

function touchUser(user) {
  user.updatedAt = new Date().toISOString();
  save();
}

function newId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

module.exports = {
  getDb,
  save,
  findUserById,
  findUserByUsername,
  addUser,
  touchUser,
  newId,
  DATA_DIR
};
