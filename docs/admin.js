'use strict';

/* ------------------------------------------------------------------ *
 * 暖月 · 管理后台
 * 纯前端单页，所有数据通过 /api/admin 接口读写。
 * ------------------------------------------------------------------ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const HOME_URL = window.NUANYUE_STATIC ? 'index.html' : '/';

const TOKEN_KEY = 'ny_admin_token';
const PAGE_SIZE = 10;

const A = {
  token: localStorage.getItem(TOKEN_KEY) || '',
  me: null,
  meta: null,
  overview: null,
  recipes: [],
  recipeImages: [],
  articles: [],
  users: [],
  view: 'overview',
  recipeQuery: '',
  recipeCourse: 'all',
  recipeStatus: 'all',
  articleQuery: '',
  articleStatus: 'all',
  userQuery: '',
  userRole: 'all',
  userStatus: 'all',
  page: { recipes: 1, articles: 1, users: 1 },
  generating: new Set(),
  busy: false
};

const ICONS = {
  dashboard: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.8"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8"/>',
  dish: '<path d="M4 11h16a8 8 0 0 1-16 0Z"/><path d="M12 3.5v3M8.5 5.5c0-1 1-1.5 1.5-1.5M15.5 5.5c0-1-1-1.5-1.5-1.5"/><path d="M3 20h18"/>',
  doc: '<path d="M6 3.5h7.5L18 8v12.5H6V3.5Z"/><path d="M13.5 3.5V8H18"/><path d="M9 12h6M9 15.5h6"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.4 2.7-5.2 6-5.2s6 1.8 6 5.2"/><path d="M16.5 10.4A3 3 0 0 0 16.5 4.6"/><path d="M18 14.8c2 .7 3 2.4 3 5.2"/>',
  search: '<circle cx="11" cy="11" r="6.4"/><path d="m16 16 4 4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.4 6.2"/><path d="M20 4.5V11h-6.5"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="m10 8-4 4 4 4M6 12h9"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  arrowLeft: '<path d="m15 5-7 7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>'
};

function icon(name, size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

function esc(value) {
  return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fmtDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return `${fmtDate(value)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function money(value) {
  const n = Number(value) || 0;
  return n > 0 ? `¥${n.toFixed(2)}` : '—';
}

function courseLabel(key) {
  const c = (A.meta?.courses || []).find((x) => x.key === key);
  return c ? c.label : key;
}

function stageText(stages) {
  const list = Array.isArray(stages) ? stages : [];
  if (list.length >= 4) return '全阶段';
  if (!list.length) return '—';
  return list
    .map((n) => {
      const s = (A.meta?.stages || []).find((x) => x.stage === n);
      return s ? s.week : `第 ${n} 阶段`;
    })
    .join(' · ');
}

function roleBadge(user) {
  if (user.role === 'admin') return '<span class="adm-badge adm-badge-gold">管理员</span>';
  return '<span class="adm-badge">普通用户</span>';
}

function toast(message, type = 'info') {
  const root = $('#adm-toast-root');
  if (!root) return;
  const el = document.createElement('div');
  el.className = `adm-toast ${type === 'error' ? 'is-error' : type === 'success' ? 'is-success' : ''}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 250);
  }, 2600);
}

/* ------------------------------ API ------------------------------ */

function setToken(token) {
  A.token = token || '';
  if (A.token) localStorage.setItem(TOKEN_KEY, A.token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function api(path, options = {}) {
  if (window.__NUANYUE_API__) return window.__NUANYUE_API__(path, options, A.token);
  const headers = { 'Content-Type': 'application/json' };
  if (A.token) headers.Authorization = `Bearer ${A.token}`;
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch {
    const err = new Error('网络连接失败，请检查网络后重试');
    err.status = 0;
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || '请求失败，请稍后再试');
    err.status = res.status;
    err.code = data?.error?.code;
    if (res.status === 401 && !path.startsWith('/auth/')) {
      setToken('');
      A.me = null;
      renderLogin('登录已过期，请重新登录');
    }
    throw err;
  }
  return data;
}

/* ------------------------------ 登录 ------------------------------ */

function renderBootError(message) {
  $('#admin-root').innerHTML = `
    <div class="adm-fatal">
      <h1>管理后台暂时无法打开</h1>
      <p>${esc(message || '请稍后刷新重试')}</p>
      <button type="button" class="adm-btn adm-btn-primary" data-action="reload">重新加载</button>
    </div>`;
}

function renderLogin(message = '') {
  $('#admin-root').innerHTML = `
    <div class="adm-login">
      <section class="adm-login-hero">
        <div class="adm-login-brand">
          <span class="adm-mark">N U A N Y U E</span>
          <h1>暖月<br />管理后台</h1>
          <p>集中管理菜品、月子知识与用户账号，为后续自助点餐做好准备。</p>
        </div>
        <ul class="adm-login-points">
          <li>菜品信息、价格与上架状态一处维护</li>
          <li>知识库内容随时更新，前台立即生效</li>
          <li>用户角色、账号状态与使用数据可查可控</li>
        </ul>
      </section>
      <section class="adm-login-panel">
        <div class="adm-login-card">
          <h2>管理员登录</h2>
          <p class="adm-login-sub">请使用管理员账号进入后台</p>
          <form class="adm-login-form" data-form="login">
            <label class="adm-field">
              <span>账号</span>
              <input name="username" autocomplete="username" placeholder="请输入管理员账号" required />
            </label>
            <label class="adm-field">
              <span>密码</span>
              <input name="password" type="password" autocomplete="current-password" placeholder="请输入密码" required />
            </label>
            <p class="adm-form-error" id="adm-login-error">${esc(message)}</p>
            <button class="adm-btn adm-btn-primary adm-btn-block" type="submit">登录后台</button>
          </form>
          <div class="adm-login-hint">
            <strong>初始账号</strong> admin&nbsp;/&nbsp;admin123456
            <br />登录后请在左下角「修改密码」及时更换。
          </div>
          <a class="adm-login-back" href="${HOME_URL}">${icon('arrowLeft', 15)} 返回前台</a>
        </div>
      </section>
    </div>`;
}

async function doLogin(form) {
  const fd = new FormData(form);
  const username = String(fd.get('username') || '').trim();
  const password = String(fd.get('password') || '');
  const btn = form.querySelector('button[type="submit"]');
  const errorBox = $('#adm-login-error');
  errorBox.textContent = '';
  btn.disabled = true;
  const oldText = btn.textContent;
  btn.textContent = '正在登录…';
  try {
    const data = await api('/auth/login', { method: 'POST', body: { username, password } });
    if (data.user?.role !== 'admin') throw new Error('该账号没有管理权限');
    setToken(data.token);
    A.me = data.user;
    A.meta = await api('/meta');
    await loadAll();
    A.view = 'overview';
    renderShell();
  } catch (err) {
    errorBox.textContent = err.message;
    btn.disabled = false;
    btn.textContent = oldText;
  }
}

async function logout() {
  setToken('');
  A.me = null;
  A.overview = null;
  A.recipes = [];
  A.articles = [];
  A.users = [];
  closeModal();
  renderLogin();
}

/* ------------------------------ 数据 ------------------------------ */

async function loadAll() {
  const [overview, recipes, articles, users] = await Promise.all([
    api('/admin/overview'),
    api('/admin/recipes'),
    api('/admin/articles'),
    api('/admin/users')
  ]);
  A.overview = overview;
  A.recipes = recipes.recipes;
  A.recipeImages = recipes.images || [];
  A.articles = articles.articles;
  A.users = users.users;
}

async function refreshRecipes() {
  const data = await api('/admin/recipes');
  A.recipes = data.recipes;
  A.recipeImages = data.images || A.recipeImages;
}

async function refreshArticles() {
  const data = await api('/admin/articles');
  A.articles = data.articles;
}

async function refreshUsers() {
  const data = await api('/admin/users');
  A.users = data.users;
}

async function refreshOverview() {
  A.overview = await api('/admin/overview');
}

/* ------------------------------ 外壳 ------------------------------ */

const VIEW_META = {
  overview: { label: '数据概览', icon: 'dashboard', title: '数据概览', sub: '用户、菜品与内容的关键指标' },
  recipes: { label: '菜品管理', icon: 'dish', title: '菜品管理', sub: '维护菜品信息、价格与上架状态' },
  articles: { label: '内容管理', icon: 'doc', title: '内容管理', sub: '维护月子知识库与前台内容' },
  users: { label: '用户管理', icon: 'users', title: '用户管理', sub: '查看用户数据、角色与账号状态' }
};

function navHTML() {
  return Object.entries(VIEW_META)
    .map(([key, meta]) => `
      <button type="button" class="${A.view === key ? 'active' : ''}" data-action="view" data-view="${key}">
        ${icon(meta.icon, 19)}<span>${meta.label}</span>
        ${key === 'users' && A.overview ? `<em>${A.overview.users.total}</em>` : ''}
      </button>`)
    .join('');
}

function topActionsHTML() {
  if (A.view === 'recipes') {
    return `<button class="adm-btn adm-btn-primary" type="button" data-action="new-recipe">${icon('plus', 16)} 新增菜品</button>`;
  }
  if (A.view === 'articles') {
    return `<button class="adm-btn adm-btn-primary" type="button" data-action="new-article">${icon('plus', 16)} 新增文章</button>`;
  }
  if (A.view === 'users') {
    return `<button class="adm-btn" type="button" data-action="reload">${icon('refresh', 15)} 刷新</button>`;
  }
  return `<button class="adm-btn" type="button" data-action="reload">${icon('refresh', 15)} 刷新数据</button>`;
}

function viewHTML() {
  if (A.view === 'recipes') return recipesViewHTML();
  if (A.view === 'articles') return articlesViewHTML();
  if (A.view === 'users') return usersViewHTML();
  return overviewViewHTML();
}

function renderShell() {
  const meta = VIEW_META[A.view] || VIEW_META.overview;
  $('#admin-root').innerHTML = `
    <div class="adm-shell">
      <aside class="adm-side">
        <div class="adm-brand">
          <span class="adm-brand-mark">暖月</span>
          <small>月子餐 · 管理后台</small>
        </div>
        <nav class="adm-nav">${navHTML()}</nav>
        <div class="adm-side-foot">
          ${A.me ? `
            <div class="adm-side-user">
              <span class="adm-avatar">${esc((A.me.name || A.me.username || '管').slice(0, 1))}</span>
              <div><strong>${esc(A.me.name || A.me.username)}</strong><small>管理员</small></div>
            </div>` : ''}
          <button type="button" data-action="open-password">${icon('lock', 16)} 修改密码</button>
          <a href="${HOME_URL}" target="_blank" rel="noreferrer">${icon('arrowLeft', 16)} 返回前台</a>
          <button type="button" data-action="logout">${icon('logout', 16)} 退出登录</button>
        </div>
      </aside>
      <div class="adm-main">
        <header class="adm-top">
          <div>
            <h1>${meta.title}</h1>
            <p>${meta.sub}</p>
          </div>
          <div class="adm-top-actions">${topActionsHTML()}</div>
        </header>
        <main class="adm-body" id="adm-body">${viewHTML()}</main>
      </div>
    </div>`;
}

function renderBody() {
  const body = $('#adm-body');
  if (body) body.innerHTML = viewHTML();
  const nav = $('.adm-nav');
  if (nav) nav.innerHTML = navHTML();
  const topTitle = $('.adm-top h1');
  const topSub = $('.adm-top p');
  const meta = VIEW_META[A.view] || VIEW_META.overview;
  if (topTitle) topTitle.textContent = meta.title;
  if (topSub) topSub.textContent = meta.sub;
  const actions = $('.adm-top-actions');
  if (actions) actions.innerHTML = topActionsHTML();
}

/* ------------------------------ 概览 ------------------------------ */

function overviewViewHTML() {
  const o = A.overview || {
    users: { total: 0, admins: 0, disabled: 0, new7d: 0, active7d: 0 },
    plans: { users: 0, days: 0, records: 0 },
    recipes: { total: 0, available: 0, hidden: 0 },
    articles: { total: 0, available: 0 },
    recentUsers: []
  };
  const priced = A.recipes.filter((r) => r.available !== false && Number(r.price) > 0).length;
  const available = o.recipes.available || 0;
  const pricePct = available ? Math.round((priced / available) * 100) : 0;

  return `
    <section class="adm-stat-grid">
      <article class="adm-stat">
        <span class="adm-stat-label">用户总数</span>
        <strong>${o.users.total}</strong>
        <p>管理员 ${o.users.admins} · 停用 ${o.users.disabled}</p>
      </article>
      <article class="adm-stat">
        <span class="adm-stat-label">近 7 天活跃</span>
        <strong>${o.users.active7d}</strong>
        <p>新增注册 ${o.users.new7d} 位</p>
      </article>
      <article class="adm-stat">
        <span class="adm-stat-label">上架菜品</span>
        <strong>${o.recipes.available}</strong>
        <p>共 ${o.recipes.total} 道 · 下架 ${o.recipes.hidden} 道</p>
      </article>
      <article class="adm-stat">
        <span class="adm-stat-label">知识库文章</span>
        <strong>${o.articles.available}</strong>
        <p>共 ${o.articles.total} 篇 · 上架 ${o.articles.available} 篇</p>
      </article>
      <article class="adm-stat">
        <span class="adm-stat-label">已生成餐单</span>
        <strong>${o.plans.users}</strong>
        <p>累计 ${o.plans.days} 天餐单</p>
      </article>
      <article class="adm-stat">
        <span class="adm-stat-label">健康记录</span>
        <strong>${o.plans.records}</strong>
        <p>来自全部用户的打卡</p>
      </article>
    </section>

    <section class="adm-two-col">
      <article class="adm-card">
        <div class="adm-card-head">
          <div><h2>最近注册用户</h2><p>按注册时间倒序</p></div>
          <button class="adm-btn adm-btn-ghost adm-btn-sm" type="button" data-action="view" data-view="users">查看全部</button>
        </div>
        <div class="adm-table-wrap">
          <table class="adm-table">
            <thead><tr><th>用户</th><th>角色</th><th>注册时间</th><th>状态</th></tr></thead>
            <tbody>
              ${(o.recentUsers || []).map((u) => `
                <tr>
                  <td>
                    <div class="adm-user-cell">
                      <span class="adm-avatar sm">${esc((u.name || u.username || '暖').slice(0, 1))}</span>
                      <div><strong>${esc(u.name || u.username)}</strong><small>@${esc(u.username)}</small></div>
                    </div>
                  </td>
                  <td>${u.role === 'admin' ? '<span class="adm-badge adm-badge-gold">管理员</span>' : '<span class="adm-badge">普通用户</span>'}</td>
                  <td>${fmtDate(u.createdAt)}</td>
                  <td>${u.disabled ? '<span class="adm-badge adm-badge-danger">已停用</span>' : '<span class="adm-badge adm-badge-sage">正常</span>'}</td>
                </tr>`).join('') || '<tr><td colspan="4"><div class="adm-empty">暂无用户</div></td></tr>'}
            </tbody>
          </table>
        </div>
      </article>

      <article class="adm-card">
        <div class="adm-card-head">
          <div><h2>自助点餐准备度</h2><p>价格与上架状态是点餐的基础</p></div>
        </div>
        <div class="adm-ready">
          <div class="adm-ready-row">
            <span>已设置价格</span><strong>${priced} / ${available} 道</strong>
          </div>
          <div class="adm-progress"><span style="width:${pricePct}%"></span></div>
          <p class="adm-muted">在「菜品管理」中为菜品补充价格并保持上架后，即可直接作为点餐菜单使用。</p>
          <div class="adm-ready-actions">
            <button class="adm-btn adm-btn-primary adm-btn-sm" type="button" data-action="view" data-view="recipes">去管理菜品</button>
            <button class="adm-btn adm-btn-ghost adm-btn-sm" type="button" data-action="view" data-view="articles">维护内容</button>
          </div>
        </div>
        <div class="adm-divider"></div>
        <div class="adm-mini-list">
          <div><span>菜品品类</span><strong>${Object.keys(o.recipes.byCourse || {}).length} 类</strong></div>
          <div><span>前台可用文章</span><strong>${o.articles.available} 篇</strong></div>
          <div><span>用户健康记录</span><strong>${o.plans.records} 条</strong></div>
        </div>
      </article>
    </section>`;
}

/* ------------------------------ 菜品 ------------------------------ */

function filteredRecipes() {
  const q = A.recipeQuery.trim().toLowerCase();
  return A.recipes.filter((r) => {
    if (A.recipeCourse !== 'all' && r.course !== A.recipeCourse) return false;
    if (A.recipeStatus === 'available' && r.available === false) return false;
    if (A.recipeStatus === 'hidden' && r.available !== false) return false;
    if (q) {
      const hay = [r.name, r.id, ...(r.tags || []), ...(r.ingredients || []).map((i) => i[0])]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function paginate(list, key) {
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, A.page[key] || 1), pages);
  A.page[key] = page;
  return {
    items: list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    page,
    pages,
    total: list.length
  };
}

function paginationHTML(key, page, pages, total) {
  if (pages <= 1) return `<div class="adm-table-foot"><span>共 ${total} 条</span></div>`;
  return `
    <div class="adm-table-foot">
      <span>共 ${total} 条 · 第 ${page}/${pages} 页</span>
      <div class="adm-pager">
        <button type="button" class="adm-btn adm-btn-ghost adm-btn-sm" data-action="page" data-key="${key}" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>上一页</button>
        <button type="button" class="adm-btn adm-btn-ghost adm-btn-sm" data-action="page" data-key="${key}" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''}>下一页</button>
      </div>
    </div>`;
}

function recipesTableHTML() {
  const list = filteredRecipes();
  if (!list.length) return '<div class="adm-empty">没有符合条件的菜品</div>';
  const { items, page, pages } = paginate(list, 'recipes');
  return `
    <div class="adm-table-wrap">
      <table class="adm-table adm-table-recipes">
        <thead>
          <tr>
            <th>菜品</th><th>品类</th><th>适用阶段</th><th>热量</th><th>用时</th><th>价格</th><th>状态</th><th class="right">操作</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((r) => `
            <tr>
              <td>
                <div class="adm-dish-cell">
                  <img src="${esc(r.image)}" alt="" loading="lazy" />
                  <div>
                    <strong>${esc(r.name)}</strong>
                    <small>${esc(r.id)}${r.admin ? ' · 后台创建' : ''} · ${esc((r.tags || []).slice(0, 2).join(' / '))}</small>
                  </div>
                </div>
              </td>
              <td>${esc(courseLabel(r.course))}</td>
              <td>${esc(stageText(r.stages))}</td>
              <td>${r.kcal} kcal</td>
              <td>${r.time} 分钟</td>
              <td>${money(r.price)}</td>
              <td>
                <button type="button" class="adm-switch ${r.available ? 'on' : ''}" data-action="toggle-recipe" data-id="${esc(r.id)}" title="${r.available ? '点击下架' : '点击上架'}"><span></span></button>
              </td>
              <td class="right">
                <div class="adm-row-actions">
                  <button type="button" class="adm-btn adm-btn-ghost adm-btn-sm" data-action="edit-recipe" data-id="${esc(r.id)}">编辑</button>
                  ${r.admin ? `<button type="button" class="adm-btn adm-btn-ghost adm-btn-sm danger" data-action="delete-recipe" data-id="${esc(r.id)}">删除</button>` : ''}
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${paginationHTML('recipes', page, pages, list.length)}`;
}

function recipesViewHTML() {
  return `
    <section class="adm-card">
      <div class="adm-toolbar">
        <div class="adm-search">
          ${icon('search', 16)}
          <input id="adm-recipe-q" data-filter="recipe-q" value="${esc(A.recipeQuery)}" placeholder="搜索菜名、食材或 ID" autocomplete="off" />
        </div>
        <select class="adm-select" data-filter="recipe-course">
          <option value="all" ${A.recipeCourse === 'all' ? 'selected' : ''}>全部品类</option>
          ${(A.meta?.courses || []).map((c) => `<option value="${esc(c.key)}" ${A.recipeCourse === c.key ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}
        </select>
        <select class="adm-select" data-filter="recipe-status">
          <option value="all" ${A.recipeStatus === 'all' ? 'selected' : ''}>全部状态</option>
          <option value="available" ${A.recipeStatus === 'available' ? 'selected' : ''}>已上架</option>
          <option value="hidden" ${A.recipeStatus === 'hidden' ? 'selected' : ''}>已下架</option>
        </select>
        <span class="adm-count">${filteredRecipes().length} 道菜品</span>
      </div>
      <div id="adm-list">${recipesTableHTML()}</div>
    </section>`;
}

/* ------------------------------ 内容 ------------------------------ */

function filteredArticles() {
  const q = A.articleQuery.trim().toLowerCase();
  return A.articles.filter((a) => {
    if (A.articleStatus === 'available' && a.available === false) return false;
    if (A.articleStatus === 'hidden' && a.available !== false) return false;
    if (q) {
      const hay = [a.title, a.summary, a.tag].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function articlesTableHTML() {
  const list = filteredArticles();
  if (!list.length) return '<div class="adm-empty">没有符合条件的文章</div>';
  const { items, page, pages } = paginate(list, 'articles');
  return `
    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th>文章</th><th>标签</th><th>阅读时长</th><th>状态</th><th class="right">操作</th></tr></thead>
        <tbody>
          ${items.map((a) => `
            <tr>
              <td>
                <div class="adm-article-cell">
                  <strong>${esc(a.title)}</strong>
                  <small>${esc(a.summary || '暂无摘要')}</small>
                </div>
              </td>
              <td><span class="adm-badge">${esc(a.tag)}</span></td>
              <td>${a.minutes} 分钟</td>
              <td>
                <button type="button" class="adm-switch ${a.available ? 'on' : ''}" data-action="toggle-article" data-id="${esc(a.id)}" title="${a.available ? '点击下架' : '点击上架'}"><span></span></button>
              </td>
              <td class="right">
                <div class="adm-row-actions">
                  <button type="button" class="adm-btn adm-btn-ghost adm-btn-sm" data-action="edit-article" data-id="${esc(a.id)}">编辑</button>
                  ${a.admin ? `<button type="button" class="adm-btn adm-btn-ghost adm-btn-sm danger" data-action="delete-article" data-id="${esc(a.id)}">删除</button>` : ''}
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${paginationHTML('articles', page, pages, list.length)}`;
}

function articlesViewHTML() {
  return `
    <section class="adm-card">
      <div class="adm-toolbar">
        <div class="adm-search">
          ${icon('search', 16)}
          <input id="adm-article-q" data-filter="article-q" value="${esc(A.articleQuery)}" placeholder="搜索标题、摘要或标签" autocomplete="off" />
        </div>
        <select class="adm-select" data-filter="article-status">
          <option value="all" ${A.articleStatus === 'all' ? 'selected' : ''}>全部状态</option>
          <option value="available" ${A.articleStatus === 'available' ? 'selected' : ''}>已上架</option>
          <option value="hidden" ${A.articleStatus === 'hidden' ? 'selected' : ''}>已下架</option>
        </select>
        <span class="adm-count">${filteredArticles().length} 篇文章</span>
      </div>
      <div id="adm-list">${articlesTableHTML()}</div>
    </section>`;
}

/* ------------------------------ 用户 ------------------------------ */

function filteredUsers() {
  const q = A.userQuery.trim().toLowerCase();
  return A.users.filter((u) => {
    if (A.userRole !== 'all' && u.role !== A.userRole) return false;
    if (A.userStatus === 'disabled' && !u.disabled) return false;
    if (A.userStatus === 'active' && u.disabled) return false;
    if (q) {
      const hay = [u.name, u.username, u.id].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function usersTableHTML() {
  const list = filteredUsers();
  if (!list.length) return '<div class="adm-empty">没有符合条件的用户</div>';
  const { items, page, pages } = paginate(list, 'users');
  return `
    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead>
          <tr><th>用户</th><th>角色</th><th>产后信息</th><th>使用情况</th><th>注册时间</th><th>最近登录</th><th>状态</th><th class="right">操作</th></tr>
        </thead>
        <tbody>
          ${items.map((u) => `
            <tr>
              <td>
                <div class="adm-user-cell">
                  <span class="adm-avatar sm">${esc((u.name || u.username || '暖').slice(0, 1))}</span>
                  <div><strong>${esc(u.name || u.username)}</strong><small>@${esc(u.username)}</small></div>
                </div>
              </td>
              <td>${roleBadge(u)}</td>
              <td>
                <div class="adm-cell-stack">
                  <span>${esc(u.profile?.deliveryType || '—')} · ${esc(u.profile?.feeding || '—')}</span>
                  <small>热量目标 ${u.profile?.calorieGoal || '—'} kcal</small>
                </div>
              </td>
              <td>
                <div class="adm-cell-stack">
                  <span>计划 ${u.stats?.planDays || 0} 天 · 记录 ${u.recordDays || 0} 天</span>
                  <small>收藏 ${u.favorites || 0} · 做过 ${u.cooked || 0}</small>
                </div>
              </td>
              <td>${fmtDate(u.createdAt)}</td>
              <td>${fmtDateTime(u.lastLoginAt)}</td>
              <td>${u.disabled ? '<span class="adm-badge adm-badge-danger">已停用</span>' : '<span class="adm-badge adm-badge-sage">正常</span>'}</td>
              <td class="right">
                <button type="button" class="adm-btn adm-btn-ghost adm-btn-sm" data-action="manage-user" data-id="${esc(u.id)}">管理</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${paginationHTML('users', page, pages, list.length)}`;
}

function usersViewHTML() {
  return `
    <section class="adm-card">
      <div class="adm-toolbar">
        <div class="adm-search">
          ${icon('search', 16)}
          <input id="adm-user-q" data-filter="user-q" value="${esc(A.userQuery)}" placeholder="搜索昵称或账号" autocomplete="off" />
        </div>
        <select class="adm-select" data-filter="user-role">
          <option value="all" ${A.userRole === 'all' ? 'selected' : ''}>全部角色</option>
          <option value="admin" ${A.userRole === 'admin' ? 'selected' : ''}>管理员</option>
          <option value="user" ${A.userRole === 'user' ? 'selected' : ''}>普通用户</option>
        </select>
        <select class="adm-select" data-filter="user-status">
          <option value="all" ${A.userStatus === 'all' ? 'selected' : ''}>全部状态</option>
          <option value="active" ${A.userStatus === 'active' ? 'selected' : ''}>正常</option>
          <option value="disabled" ${A.userStatus === 'disabled' ? 'selected' : ''}>已停用</option>
        </select>
        <span class="adm-count">${filteredUsers().length} 位用户</span>
      </div>
      <div id="adm-list">${usersTableHTML()}</div>
    </section>`;
}

/* ------------------------------ 弹层 ------------------------------ */

function openModal(html, wide = false) {
  const root = $('#adm-modal-root');
  root.innerHTML = `
    <div class="adm-modal-backdrop" data-action="close-modal"></div>
    <div class="adm-modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div>`;
  document.body.classList.add('adm-modal-open');
}

function closeModal() {
  const root = $('#adm-modal-root');
  if (root) root.innerHTML = '';
  document.body.classList.remove('adm-modal-open');
}

function modalHead(title, subtitle) {
  return `
    <div class="adm-modal-head">
      <div><h2>${esc(title)}</h2>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div>
      <button type="button" class="adm-icon-btn" data-action="close-modal" aria-label="关闭">${icon('close', 18)}</button>
    </div>`;
}

/* -------- 菜品表单 -------- */

function slotOptionsHTML(course, selected) {
  const slots = A.meta?.slots || [];
  const allowed = slots.filter((s) => s.courses.includes(course));
  const chosen = new Set(selected || []);
  return allowed.map((s) => `
    <label class="adm-check">
      <input type="checkbox" name="slots" value="${esc(s.key)}" ${chosen.has(s.key) || !chosen.size ? 'checked' : ''} />
      <span>${esc(s.label)}</span>
    </label>`).join('');
}

function recipeFormHTML(recipe) {
  const r = recipe || {
    name: '',
    course: 'main',
    stages: [1, 2, 3, 4],
    slots: [],
    tags: [],
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    time: 20,
    price: 0,
    image: 'auto',
    available: true,
    ingredients: [],
    steps: [],
    tips: ''
  };
  const stages = new Set(r.stages || []);
  const imageValue = r.image || 'auto';
  const images = [...new Set(['auto', imageValue, ...(A.recipeImages || [])])];
  return `
    <form class="adm-form" data-form="recipe" data-id="${esc(r.id || '')}">
      ${modalHead(recipe ? '编辑菜品' : '新增菜品', recipe ? '保存后立即同步到前台' : '新菜品默认上架，可随时下架')}
      <div class="adm-form-body">
        <div class="adm-grid-2">
          <label class="adm-field"><span>菜品名称</span><input name="name" maxlength="30" required value="${esc(r.name || '')}" placeholder="例如：山药排骨汤" /></label>
          <label class="adm-field"><span>品类</span>
            <select name="course" id="adm-recipe-course">
              ${(A.meta?.courses || []).map((c) => `<option value="${esc(c.key)}" ${r.course === c.key ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}
            </select>
          </label>
        </div>
        <div class="adm-field"><span>适用阶段</span>
          <div class="adm-chip-row">
            ${[1, 2, 3, 4].map((n) => `
              <label class="adm-check">
                <input type="checkbox" name="stages" value="${n}" ${stages.has(n) ? 'checked' : ''} />
                <span>${esc((A.meta?.stages || []).find((s) => s.stage === n)?.week || `第 ${n} 阶段`)}</span>
              </label>`).join('')}
          </div>
        </div>
        <div class="adm-field"><span>适合餐次</span>
          <div class="adm-chip-row" id="adm-slot-options">${slotOptionsHTML(r.course, r.slots)}</div>
        </div>
        <div class="adm-grid-3">
          <label class="adm-field"><span>热量（kcal）</span><input name="kcal" type="number" min="0" max="1500" value="${r.kcal || 0}" /></label>
          <label class="adm-field"><span>蛋白质（g）</span><input name="protein" type="number" min="0" max="300" step="0.1" value="${r.protein || 0}" /></label>
          <label class="adm-field"><span>碳水（g）</span><input name="carbs" type="number" min="0" max="300" step="0.1" value="${r.carbs || 0}" /></label>
        </div>
        <div class="adm-grid-3">
          <label class="adm-field"><span>脂肪（g）</span><input name="fat" type="number" min="0" max="300" step="0.1" value="${r.fat || 0}" /></label>
          <label class="adm-field"><span>用时（分钟）</span><input name="time" type="number" min="1" max="360" value="${r.time || 20}" /></label>
          <label class="adm-field"><span>价格（元）</span><input name="price" type="number" min="0" max="999" step="0.01" value="${Number(r.price) || 0}" /></label>
        </div>
        <div class="adm-grid-2">
          <div class="adm-field"><span>菜品图片</span>
            <div class="adm-image-edit">
              <img id="adm-image-preview" src="${esc(imageValue === 'auto' ? 'images/main.jpg' : imageValue)}" alt="" />
              <div class="adm-image-side">
                <select name="image" id="adm-image-select" data-image-select>
                  ${images.map((img) => `<option value="${esc(img)}" ${imageValue === img ? 'selected' : ''}>${img === 'auto' ? '按菜名自动匹配' : img.startsWith('data:') ? '已上传图片' : img.startsWith('/uploads/') ? '已上传图片' : img.includes('/dishes/') ? `专属图 ${img.replace(/^\/?images\/dishes\//, '')}` : img.replace(/^\/?images\//, '')}</option>`).join('')}
                </select>
                <div class="adm-image-actions">
                  <button type="button" class="adm-btn adm-btn-sm" data-action="pick-recipe-image">上传图片</button>
                  <button type="button" class="adm-btn adm-btn-sm" data-action="generate-recipe-image" data-mode="search">联网配图</button>
                  <button type="button" class="adm-btn adm-btn-sm" data-action="generate-recipe-image" data-mode="ai">AI 生成</button>
                  <small class="adm-muted">JPG / PNG / WebP，≤5MB</small>
                </div>
                <span id="adm-image-status" class="adm-muted"></span>
                <input type="file" id="adm-recipe-image-file" accept="image/jpeg,image/png,image/webp" hidden />
              </div>
            </div>
          </div>
          <div class="adm-field"><span>上架状态</span>
            <label class="adm-toggle">
              <input type="checkbox" name="available" ${r.available !== false ? 'checked' : ''} />
              <span class="adm-toggle-track"><span></span></span>
              <span class="adm-toggle-text">保存后立即在前台展示</span>
            </label>
          </div>
        </div>
        <label class="adm-field"><span>标签（用顿号或逗号分隔，最多 6 个）</span><input name="tags" value="${esc((r.tags || []).join('、'))}" placeholder="补血、养胃、易消化" /></label>
        <label class="adm-field"><span>食材（每行一种：名称, 用量, 单位）</span>
          <textarea name="ingredients" rows="5" placeholder="小米, 40, g&#10;南瓜, 80, g">${esc((r.ingredients || []).map((i) => i.join(', ')).join('\n'))}</textarea>
        </label>
        <label class="adm-field"><span>做法步骤（每行一步）</span>
          <textarea name="steps" rows="6" placeholder="小米淘洗后浸泡 10 分钟…">${esc((r.steps || []).join('\n'))}</textarea>
        </label>
        <label class="adm-field"><span>小贴士</span><textarea name="tips" rows="3" maxlength="200">${esc(r.tips || '')}</textarea></label>
      </div>
      <div class="adm-form-foot">
        <button type="button" class="adm-btn" data-action="close-modal">取消</button>
        <button type="submit" class="adm-btn adm-btn-primary">保存菜品</button>
      </div>
    </form>`;
}

function parseIngredientLines(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[,，\t]+/).map((s) => s.trim());
      return {
        name: parts[0] || '',
        amount: Number(parts[1]),
        unit: parts[2] || 'g',
        category: parts[3] || ''
      };
    });
}

function collectRecipePayload(form) {
  const fd = new FormData(form);
  return {
    name: String(fd.get('name') || '').trim(),
    course: String(fd.get('course') || ''),
    stages: $$('input[name="stages"]:checked', form).map((el) => Number(el.value)),
    slots: $$('input[name="slots"]:checked', form).map((el) => el.value),
    tags: String(fd.get('tags') || '').split(/[,，、\s]+/).filter(Boolean),
    kcal: Number(fd.get('kcal')) || 0,
    protein: Number(fd.get('protein')) || 0,
    carbs: Number(fd.get('carbs')) || 0,
    fat: Number(fd.get('fat')) || 0,
    time: Number(fd.get('time')) || 20,
    price: Number(fd.get('price')) || 0,
    image: String(fd.get('image') || 'auto'),
    available: Boolean(form.querySelector('input[name="available"]')?.checked),
    ingredients: parseIngredientLines(fd.get('ingredients')),
    steps: String(fd.get('steps') || '').split('\n').map((s) => s.trim()).filter(Boolean),
    tips: String(fd.get('tips') || '').trim()
  };
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.readAsDataURL(file);
  });
}

async function uploadRecipeImage(file) {
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) throw new Error('图片最大 5MB');
  const dataUrl = await readFileAsDataURL(file);
  toast('正在上传图片…');
  const data = await api('/admin/upload', { method: 'POST', body: { dataUrl } });
  const select = $('#adm-image-select');
  const preview = $('#adm-image-preview');
  if (select) {
    const option = document.createElement('option');
    option.value = data.url;
    option.textContent = '已上传图片';
    select.appendChild(option);
    select.value = data.url;
  }
  if (preview) preview.src = data.url;
  toast('图片已上传，保存菜品后生效', 'success');
}

/* ------------------------- AI 菜品配图 ------------------------- */

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = src;
  });
}

function buildDishImagePrompt(recipe) {
  const ingredients = (recipe.ingredients || [])
    .slice(0, 4)
    .map((item) => (Array.isArray(item) ? item[0] : item && item.name))
    .filter(Boolean)
    .join('、');
  return [
    recipe.name,
    courseLabel(recipe.course),
    ingredients ? `主要食材${ingredients}` : '',
    '中式月子餐',
    '成品菜特写',
    '真实美食摄影',
    '自然光',
    '白瓷餐具',
    '无文字',
    '无人物',
    '高清',
    'Chinese home-style dish, realistic food photography, close-up, natural light'
  ]
    .filter(Boolean)
    .join('，');
}

function cropGeneratedImage(img) {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  // 生成服务会在右下角带小水印，裁掉底部约 4.5% 再居中裁成 4:3。
  const usableHeight = Math.max(1, img.height - Math.round(img.height * 0.045));
  const targetRatio = 4 / 3;
  let sourceWidth = img.width;
  let sourceHeight = usableHeight;
  if (sourceWidth / sourceHeight > targetRatio) sourceWidth = sourceHeight * targetRatio;
  else sourceHeight = sourceWidth / targetRatio;
  const sourceX = Math.max(0, (img.width - sourceWidth) / 2);
  const sourceY = Math.max(0, (usableHeight - sourceHeight) / 2);
  ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, 800, 600);
  return canvas.toDataURL('image/jpeg', 0.86);
}

async function generateAiDishImageDataUrl(recipe) {
  const name = String((recipe && recipe.name) || '').trim();
  if (!name) throw new Error('请先填写菜品名称');
  const prompt = buildDishImagePrompt(recipe);
  let lastError;
  for (let attempt = 0; attempt < 1; attempt += 1) {
    const seed = Math.floor(Math.random() * 1e9);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&seed=${seed}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) throw new Error(`AI 图片服务返回 ${response.status}`);
      const type = String(response.headers.get('content-type') || '');
      if (!type.includes('image/')) throw new Error('AI 图片服务返回内容异常');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      try {
        const img = await loadImageElement(objectUrl);
        return cropGeneratedImage(img);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(timer);
    }
  }
  const reason = lastError && lastError.name === 'AbortError' ? '生成超时' : (lastError && lastError.message) || '生成失败';
  throw new Error(`AI 配图${reason}`);
}

function search360DishImages(query) {
  return new Promise((resolve, reject) => {
    const callback = `__ny360_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const script = document.createElement('script');
    let done = false;
    const finish = (err, data) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      script.remove();
      try {
        delete window[callback];
      } catch {
        /* ignore */
      }
      if (err) reject(err);
      else resolve(data);
    };
    const timer = setTimeout(() => finish(new Error('联网搜图超时')), 15000);
    window[callback] = (data) => finish(null, data);
    script.onerror = () => finish(new Error('联网搜图失败'));
    script.src = `https://image.so.com/j?q=${encodeURIComponent(query)}&src=srp&sn=0&pn=30&callback=${callback}`;
    document.head.appendChild(script);
  });
}

function rankDishImageCandidates(list, name, relaxed = false) {
  const productRe = /(袋装|包邮|旗舰店|天猫|淘宝|京东|拼多多|优惠|促销|批发|礼盒|罐装|瓶装|代餐粉|\d+\s*(?:g|克|kg)\b)/i;
  const junkRe = /(壁纸|海报|素材|模板|展板|电路|玩具|枪|动漫|电影|明星|穿搭|楼盘|招聘)/i;
  const blockHosts = ['babybus', 'learn.', 'logo', 'icon', 'so.com'];
  const preferred = ['xiachufang', 'douguo', 'meishichina', 'meishij', 'sohu', 'baijiahao', 'xiangha'];
  return (Array.isArray(list) ? list : [])
    .filter((item) => {
      if (!item || !item.thumb) return false;
      const title = String(item.title || '');
      const link = String(item.link || '');
      if (junkRe.test(title)) return false;
      if (blockHosts.some((host) => link.includes(host))) return false;
      const width = Number(item.width) || 0;
      const height = Number(item.height) || 0;
      if (width && height) {
        const ratio = width / height;
        if (relaxed) {
          if (width < 260 || ratio < 0.65) return false;
        } else if (width < 400 || ratio < 0.9) {
          return false;
        }
      }
      return true;
    })
    .map((item, index) => {
      const title = String(item.title || '');
      const link = String(item.link || '');
      let score = title.includes(name) ? 20 : 0;
      if (preferred.some((host) => link.includes(host))) score += 10;
      if (productRe.test(title)) score -= 30;
      return { ...item, score, index };
    })
    .filter((item) => item.score > -10)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 10);
}

async function searchDishImageDataUrl(recipe) {
  const name = String((recipe && recipe.name) || '').trim();
  if (!name) throw new Error('请先填写菜品名称');
  const queries = [`${name} 成品`, `${name} 美食`, name];
  for (const query of queries) {
    let data;
    try {
      data = await search360DishImages(query);
    } catch (err) {
      continue;
    }
    const strict = rankDishImageCandidates(data && data.list, name, false);
    const relaxed = rankDishImageCandidates(data && data.list, name, true);
    const seen = new Set();
    const candidates = [...strict, ...relaxed].filter((item) => {
      if (seen.has(item.thumb)) return false;
      seen.add(item.thumb);
      return true;
    });
    for (const item of candidates) {
      try {
        const response = await fetch(item.thumb, { mode: 'cors', cache: 'no-store', referrerPolicy: 'no-referrer' });
        if (!response.ok) continue;
        const blob = await response.blob();
        if (!String(blob.type || '').includes('image/')) continue;
        const objectUrl = URL.createObjectURL(blob);
        try {
          const img = await loadImageElement(objectUrl);
          return cropGeneratedImage(img);
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      } catch {
        /* try next candidate */
      }
    }
  }
  throw new Error('未能匹配到合适的菜品图，请手动上传');
}

async function generateDishImageDataUrl(recipe, mode = 'search') {
  if (mode === 'ai') {
    try {
      return { dataUrl: await generateAiDishImageDataUrl(recipe), source: 'ai' };
    } catch (aiError) {
      console.warn('[ai-image] fallback to search:', aiError.message);
      const dataUrl = await searchDishImageDataUrl(recipe);
      return { dataUrl, source: 'search' };
    }
  }
  try {
    return { dataUrl: await searchDishImageDataUrl(recipe), source: 'search' };
  } catch (searchError) {
    console.warn('[ai-image] search failed, trying AI:', searchError.message);
    const dataUrl = await generateAiDishImageDataUrl(recipe);
    return { dataUrl, source: 'ai' };
  }
}

async function generateImageForRecipe(recipe, mode = 'search') {
  if (!recipe || !recipe.id) throw new Error('菜品信息不完整');
  if (A.generating.has(recipe.id)) throw new Error('这道菜正在生成配图');
  A.generating.add(recipe.id);
  try {
    const generated = await generateDishImageDataUrl(recipe, mode);
    const uploaded = await api('/admin/upload', { method: 'POST', body: { dataUrl: generated.dataUrl } });
    const image = uploaded.url;
    await api(`/admin/recipes/${encodeURIComponent(recipe.id)}`, {
      method: 'PUT',
      body: { ...recipe, image }
    });
    const index = A.recipes.findIndex((item) => item.id === recipe.id);
    if (index >= 0) A.recipes[index] = { ...A.recipes[index], image };
    return { image, source: generated.source };
  } finally {
    A.generating.delete(recipe.id);
  }
}

async function generateFormRecipeImage(btn) {
  const form = btn.closest('form');
  const name = String(form?.elements?.name?.value || '').trim();
  if (!name) throw new Error('请先填写菜品名称');
  const recipe = {
    name,
    course: form.elements.course?.value || 'main',
    ingredients: parseIngredientLines(form.elements.ingredients?.value || '')
  };
  const mode = btn.dataset.mode === 'ai' ? 'ai' : 'search';
  const status = $('#adm-image-status');
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = '处理中…';
  if (status) status.textContent = mode === 'ai' ? 'AI 正在生成菜品图，约 20-60 秒…' : '正在联网匹配菜品图…';
  try {
    const generated = await generateDishImageDataUrl(recipe, mode);
    const uploaded = await api('/admin/upload', { method: 'POST', body: { dataUrl: generated.dataUrl } });
    const select = $('#adm-image-select');
    const preview = $('#adm-image-preview');
    if (select) {
      const option = document.createElement('option');
      option.value = uploaded.url;
      option.textContent = generated.source === 'ai' ? 'AI 生成图片' : '联网匹配图片';
      select.appendChild(option);
      select.value = uploaded.url;
    }
    if (preview) preview.src = uploaded.url;
    if (status) status.textContent = '已生成，可继续生成或保存菜品。';
    toast(generated.source === 'ai' ? 'AI 菜品图已生成，保存菜品后生效' : '已联网匹配菜品图，保存菜品后生效', 'success');
  } catch (err) {
    if (status) status.textContent = err.message;
    throw err;
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
}

/* ---------------------- 文章菜品识别 ---------------------- */

function articlePlainText(form) {
  return [
    form?.elements?.title?.value || '',
    form?.elements?.summary?.value || '',
    form?.elements?.sections?.value || ''
  ].join('\n');
}

function detectArticleDishes(form) {
  const text = articlePlainText(form);
  if (!text.trim()) return [];
  return A.recipes
    .filter((recipe) => recipe.available !== false && recipe.name && text.includes(recipe.name))
    .sort((a, b) => b.name.length - a.name.length)
    .slice(0, 8);
}

function renderArticleDishes(form, options = {}) {
  const box = $('#adm-article-dishes', form);
  if (!box) return [];
  const matches = detectArticleDishes(form);
  if (!matches.length) {
    box.innerHTML = '<p class="adm-muted">未在文中识别到食谱库里的菜品。可在正文中写出完整菜名后点击「识别文中菜品」。</p>';
    return [];
  }
  box.innerHTML = `
    <div class="adm-article-dish-head">
      <div><strong>文中提到的菜品</strong><small>${matches.length} 道 · 可生成专属配图</small></div>
      <button type="button" class="adm-btn adm-btn-sm adm-btn-primary" data-action="generate-article-images">批量生成配图</button>
    </div>
    <div class="adm-article-dish-list">
      ${matches.map((recipe) => `
        <div class="adm-article-dish" data-id="${esc(recipe.id)}">
          <img src="${esc(recipe.image)}" alt="" />
          <div><strong>${esc(recipe.name)}</strong><small>${esc(courseLabel(recipe.course))}</small></div>
          <button type="button" class="adm-btn adm-btn-ghost adm-btn-sm" data-action="generate-article-dish" data-id="${esc(recipe.id)}">智能配图</button>
        </div>`).join('')}
    </div>`;
  if (options.notify) toast(`识别到 ${matches.length} 道文中菜品，可生成配图`, 'success');
  return matches;
}

async function generateArticleDish(btn) {
  const id = btn.dataset.id;
  const recipe = findRecipe(id);
  if (!recipe) throw new Error('菜品不存在');
  const chip = btn.closest('.adm-article-dish');
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = '生成中…';
  try {
    const result = await generateImageForRecipe(recipe);
    const img = chip?.querySelector('img');
    if (img) img.src = result.image;
    btn.textContent = '重新生成';
    toast(result.source === 'ai' ? `「${recipe.name}」AI 配图已生成` : `「${recipe.name}」已联网匹配菜品图`, 'success');
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    btn.disabled = false;
    if (btn.textContent === '生成中…') btn.textContent = old;
  }
}

async function generateArticleImages(btn) {
  const form = btn.closest('form');
  const chips = [...(form?.querySelectorAll('.adm-article-dish') || [])];
  const ids = [...new Set(chips.map((chip) => chip.dataset.id))];
  if (!ids.length) throw new Error('请先识别文中菜品');
  const targets = ids.slice(0, 5);
  if (ids.length > 5) toast('一次最多生成 5 道，已处理前 5 道');
  if (!window.confirm(`将为 ${targets.length} 道菜生成 AI 配图，每张约 20-60 秒，是否继续？`)) return;
  const old = btn.textContent;
  btn.disabled = true;
  let ok = 0;
  let failed = 0;
  try {
    for (let i = 0; i < targets.length; i += 1) {
      const recipe = findRecipe(targets[i]);
      if (!recipe) { failed += 1; continue; }
      btn.textContent = `生成中 ${i + 1}/${targets.length}…`;
      try {
        const result = await generateImageForRecipe(recipe);
        const chip = form.querySelector(`.adm-article-dish[data-id="${CSS.escape(recipe.id)}"]`);
        if (chip) {
          const img = chip.querySelector('img');
          if (img) img.src = result.image;
          const chipBtn = chip.querySelector('button');
          if (chipBtn) chipBtn.textContent = '重新生成';
        }
        ok += 1;
      } catch (err) {
        console.warn('[ai-image]', recipe.name, err);
        failed += 1;
      }
    }
    toast(`配图生成完成：成功 ${ok} 道${failed ? `，失败 ${failed} 道` : ''}`, ok ? 'success' : 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
}

async function fetchArticleIntoForm(btn) {
  const form = btn.closest('form');
  const url = String(form?.elements?.sourceUrl?.value || '').trim();
  if (!url) throw new Error('请先粘贴文章链接');
  if (window.NUANYUE_STATIC && form?.elements?.fetchHelper) {
    const helper = String(form.elements.fetchHelper.value || '').trim();
    if (helper) localStorage.setItem('nuanyue_fetch_helper', helper);
    else localStorage.removeItem('nuanyue_fetch_helper');
  }
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = '抓取中…';
  try {
    const data = await api('/admin/articles/fetch', { method: 'POST', body: { url } });
    const article = data.article;
    if (form.elements.title) form.elements.title.value = article.title || '';
    if (form.elements.summary) form.elements.summary.value = article.summary || '';
    if (form.elements.tag) form.elements.tag.value = article.tag || '网络摘录';
    if (form.elements.minutes) form.elements.minutes.value = article.minutes || 3;
    if (form.elements.sections) form.elements.sections.value = sectionsToText(article.sections || []);
    renderArticleDishes(form, { notify: true });
    toast('已抓取正文，核对后点击保存文章', 'success');
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
}

async function saveRecipe(form) {
  const id = form.dataset.id;
  const payload = collectRecipePayload(form);
  if (!payload.ingredients.length) throw new Error('请至少填写一种食材');
  if (!payload.steps.length) throw new Error('请至少填写一个做法步骤');
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = '保存中…';
  try {
    if (id) await api(`/admin/recipes/${encodeURIComponent(id)}`, { method: 'PUT', body: payload });
    else await api('/admin/recipes', { method: 'POST', body: payload });
    closeModal();
    await Promise.all([refreshRecipes(), refreshOverview()]);
    renderBody();
    toast(id ? '菜品已更新' : '菜品已创建', 'success');
  } finally {
    btn.disabled = false;
    btn.textContent = '保存菜品';
  }
}

/* -------- 文章表单 -------- */

function sectionsToText(sections) {
  return (sections || [])
    .map((s) => `## ${s.h}\n${(s.p || []).join('\n')}`)
    .join('\n\n');
}

function parseSections(text) {
  const sections = [];
  let current = null;
  for (const raw of String(text || '').split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('##')) {
      current = { h: line.replace(/^#+\s*/, ''), p: [] };
      sections.push(current);
    } else {
      if (!current) {
        current = { h: '正文', p: [] };
        sections.push(current);
      }
      current.p.push(line);
    }
  }
  return sections;
}

function articleFormHTML(article) {
  const a = article || {
    title: '',
    summary: '',
    tag: '饮食调养',
    minutes: 3,
    sections: [],
    available: true
  };
  return `
    <form class="adm-form" data-form="article" data-id="${esc(a.id || '')}">
      ${modalHead(article ? '编辑文章' : '新增文章', article ? '保存后立即同步到前台知识库' : '新文章默认上架')}
      <div class="adm-form-body">
        <div class="adm-fetch-box">
          <div class="adm-fetch-row">
            <input name="sourceUrl" placeholder="粘贴文章链接，例如 https://..." autocomplete="off" />
            <button type="button" class="adm-btn adm-btn-sm" data-action="fetch-article">抓取正文</button>
          </div>
          ${window.NUANYUE_STATIC ? `<label class="adm-field adm-fetch-helper"><span>抓取服务（静态版使用）</span><input name="fetchHelper" value="${esc(localStorage.getItem('nuanyue_fetch_helper') || 'https://37lq1tfihyzcugo02dp.traesite.cn/api/fetch-article')}" /></label>` : ''}
          <p class="adm-muted">${window.NUANYUE_STATIC ? '抓取失败时可直接在下方粘贴正文，再点击「识别文中菜品」。' : '抓取结果会填入下方表单，核对内容与来源后再发布。'}</p>
        </div>
        <label class="adm-field"><span>文章标题</span><input name="title" maxlength="60" required value="${esc(a.title || '')}" placeholder="例如：产后第一周怎么吃" /></label>
        <div class="adm-grid-3">
          <label class="adm-field"><span>标签</span><input name="tag" maxlength="20" value="${esc(a.tag || '')}" /></label>
          <label class="adm-field"><span>阅读时长（分钟）</span><input name="minutes" type="number" min="1" max="60" value="${a.minutes || 3}" /></label>
          <div class="adm-field"><span>上架状态</span>
            <label class="adm-toggle">
              <input type="checkbox" name="available" ${a.available !== false ? 'checked' : ''} />
              <span class="adm-toggle-track"><span></span></span>
              <span class="adm-toggle-text">前台可见</span>
            </label>
          </div>
        </div>
        <label class="adm-field"><span>摘要</span><textarea name="summary" rows="3" maxlength="160" placeholder="用于列表页的一句话介绍">${esc(a.summary || '')}</textarea></label>
        <label class="adm-field"><span>正文（用 ## 开头表示小节标题）</span>
          <textarea name="sections" rows="14" placeholder="## 第一周怎么吃&#10;饮食清淡、少油少盐…&#10;&#10;## 推荐食材&#10;小米、山药、鲫鱼…">${esc(sectionsToText(a.sections))}</textarea>
        </label>
        <div class="adm-article-tools">
          <button type="button" class="adm-btn adm-btn-sm" data-action="detect-article-dishes">识别文中菜品</button>
          <span class="adm-muted">自动关联食谱库中提到的菜品，可一键生成 AI 配图</span>
        </div>
        <div id="adm-article-dishes" class="adm-article-dishes"></div>
      </div>
      <div class="adm-form-foot">
        <button type="button" class="adm-btn" data-action="close-modal">取消</button>
        <button type="submit" class="adm-btn adm-btn-primary">保存文章</button>
      </div>
    </form>`;
}

async function saveArticle(form) {
  const id = form.dataset.id;
  const fd = new FormData(form);
  const sections = parseSections(fd.get('sections'));
  if (!sections.length) throw new Error('请至少填写一个内容段落');
  const payload = {
    title: String(fd.get('title') || '').trim(),
    tag: String(fd.get('tag') || '').trim() || '饮食调养',
    minutes: Number(fd.get('minutes')) || 3,
    summary: String(fd.get('summary') || '').trim(),
    sections,
    available: Boolean(form.querySelector('input[name="available"]')?.checked)
  };
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = '保存中…';
  try {
    if (id) await api(`/admin/articles/${encodeURIComponent(id)}`, { method: 'PUT', body: payload });
    else await api('/admin/articles', { method: 'POST', body: payload });
    closeModal();
    await Promise.all([refreshArticles(), refreshOverview()]);
    renderBody();
    toast(id ? '文章已更新' : '文章已创建', 'success');
  } finally {
    btn.disabled = false;
    btn.textContent = '保存文章';
  }
}

/* -------- 用户管理 -------- */

async function openUserModal(id) {
  openModal(`${modalHead('用户管理', '查看数据并调整账号权限')}<div class="adm-modal-body"><div class="adm-loading">正在加载用户数据…</div></div>`, true);
  try {
    const data = await api(`/admin/users/${encodeURIComponent(id)}`);
    const u = data.user;
    const logs = data.recentLogs || [];
    const isSelf = u.id === A.me?.id;
    openModal(`
      ${modalHead('用户管理', `@${u.username} · ${fmtDate(u.createdAt)} 注册`)}
      <div class="adm-modal-body">
        <div class="adm-user-summary">
          <span class="adm-avatar">${esc((u.name || u.username || '暖').slice(0, 1))}</span>
          <div>
            <h3>${esc(u.name || u.username)} ${u.role === 'admin' ? '<span class="adm-badge adm-badge-gold">管理员</span>' : ''}</h3>
            <p>${esc(u.profile?.deliveryType || '—')} · ${esc(u.profile?.feeding || '—')} · 热量目标 ${u.profile?.calorieGoal || '—'} kcal</p>
          </div>
        </div>

        <div class="adm-mini-grid">
          <div><span>计划餐单</span><strong>${u.stats?.planDays || 0} 天</strong></div>
          <div><span>健康记录</span><strong>${u.recordDays || 0} 天</strong></div>
          <div><span>收藏食谱</span><strong>${u.favorites || 0} 道</strong></div>
          <div><span>做过的菜</span><strong>${u.cooked || 0} 道</strong></div>
          <div><span>打卡完成率</span><strong>${u.stats?.completionRate || 0}%</strong></div>
          <div><span>自定义食谱</span><strong>${u.customRecipes || 0} 道</strong></div>
        </div>

        <div class="adm-section-title">账号设置</div>
        <form class="adm-inline-form" data-form="user" data-id="${esc(u.id)}">
          <label class="adm-field"><span>昵称</span><input name="name" maxlength="20" value="${esc(u.name || '')}" /></label>
          <label class="adm-field"><span>角色</span>
            <select name="role" ${isSelf ? 'disabled' : ''}>
              <option value="user" ${u.role === 'user' ? 'selected' : ''}>普通用户</option>
              <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>管理员</option>
            </select>
          </label>
          <label class="adm-field"><span>账号状态</span>
            <select name="disabled" ${isSelf ? 'disabled' : ''}>
              <option value="0" ${!u.disabled ? 'selected' : ''}>正常</option>
              <option value="1" ${u.disabled ? 'selected' : ''}>停用</option>
            </select>
          </label>
          <button type="submit" class="adm-btn adm-btn-primary adm-btn-sm">保存设置</button>
        </form>
        ${isSelf ? '<p class="adm-muted">当前登录账号不能取消管理员或停用。</p>' : ''}

        <div class="adm-section-title">重置密码</div>
        <form class="adm-inline-form" data-form="reset-password" data-id="${esc(u.id)}">
          <label class="adm-field grow"><span>新密码（至少 6 位）</span><input name="password" type="text" minlength="6" placeholder="输入后将立即生效" /></label>
          <button type="submit" class="adm-btn adm-btn-sm">重置密码</button>
        </form>

        <div class="adm-section-title">最近健康记录</div>
        ${logs.length ? `
          <div class="adm-table-wrap">
            <table class="adm-table compact">
              <thead><tr><th>日期</th><th>体重</th><th>体温</th><th>心情</th><th>备注</th></tr></thead>
              <tbody>
                ${logs.map((l) => `
                  <tr>
                    <td>${esc(l.date)}</td>
                    <td>${l.weight ? `${l.weight} kg` : '—'}</td>
                    <td>${l.temperature ? `${l.temperature} ℃` : '—'}</td>
                    <td>${esc(l.mood || '—')}</td>
                    <td class="adm-note-cell">${esc(l.note || '—')}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>` : '<div class="adm-empty small">该用户还没有健康记录</div>'}

        ${isSelf ? '' : `
          <div class="adm-danger-zone">
            <div><strong>删除用户</strong><p>将同时移除该账号的餐单、记录与自定义食谱，且不可恢复。</p></div>
            <button type="button" class="adm-btn adm-btn-danger adm-btn-sm" data-action="delete-user" data-id="${esc(u.id)}">删除账号</button>
          </div>`}
      </div>`, true);
  } catch (err) {
    toast(err.message, 'error');
    closeModal();
  }
}

async function saveUser(form) {
  const id = form.dataset.id;
  const fd = new FormData(form);
  const payload = {};
  if (fd.get('name') !== null) payload.name = String(fd.get('name') || '').trim();
  if (fd.get('role') !== null && !form.querySelector('select[name="role"]')?.disabled) payload.role = String(fd.get('role'));
  if (fd.get('disabled') !== null && !form.querySelector('select[name="disabled"]')?.disabled) {
    payload.disabled = String(fd.get('disabled')) === '1';
  }
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = '保存中…';
  try {
    await api(`/admin/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload });
    await Promise.all([refreshUsers(), refreshOverview()]);
    closeModal();
    renderBody();
    toast('账号设置已更新', 'success');
  } finally {
    btn.disabled = false;
    btn.textContent = '保存设置';
  }
}

async function resetPassword(form) {
  const id = form.dataset.id;
  const fd = new FormData(form);
  const password = String(fd.get('password') || '');
  if (password.length < 6) throw new Error('新密码至少 6 位');
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = '重置中…';
  try {
    await api(`/admin/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: { resetPassword: password } });
    form.reset();
    toast('密码已重置', 'success');
  } finally {
    btn.disabled = false;
    btn.textContent = '重置密码';
  }
}

async function deleteUser(id) {
  const user = A.users.find((u) => u.id === id);
  if (!window.confirm(`确定删除「${user?.name || user?.username || '该用户'}」？该操作不可恢复。`)) return;
  await api(`/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await Promise.all([refreshUsers(), refreshOverview()]);
  closeModal();
  renderBody();
  toast('用户已删除', 'success');
}

/* -------- 修改密码 -------- */

function passwordModalHTML() {
  return `
    <form class="adm-form" data-form="password">
      ${modalHead('修改密码', '修改当前管理员账号的登录密码')}
      <div class="adm-form-body">
        <label class="adm-field"><span>原密码</span><input name="oldPassword" type="password" required /></label>
        <label class="adm-field"><span>新密码（至少 6 位）</span><input name="newPassword" type="password" minlength="6" required /></label>
        <label class="adm-field"><span>确认新密码</span><input name="confirmPassword" type="password" minlength="6" required /></label>
      </div>
      <div class="adm-form-foot">
        <button type="button" class="adm-btn" data-action="close-modal">取消</button>
        <button type="submit" class="adm-btn adm-btn-primary">保存新密码</button>
      </div>
    </form>`;
}

async function savePassword(form) {
  const fd = new FormData(form);
  const oldPassword = String(fd.get('oldPassword') || '');
  const newPassword = String(fd.get('newPassword') || '');
  const confirmPassword = String(fd.get('confirmPassword') || '');
  if (newPassword !== confirmPassword) throw new Error('两次输入的新密码不一致');
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = '保存中…';
  try {
    await api('/auth/password', { method: 'POST', body: { oldPassword, newPassword } });
    closeModal();
    toast('密码已更新', 'success');
  } finally {
    btn.disabled = false;
    btn.textContent = '保存新密码';
  }
}

/* ------------------------------ 交互 ------------------------------ */

function findRecipe(id) {
  return A.recipes.find((r) => r.id === id);
}

function findArticle(id) {
  return A.articles.find((a) => a.id === id);
}

async function toggleRecipe(id) {
  const recipe = findRecipe(id);
  if (!recipe) return;
  const data = await api(`/admin/recipes/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { available: !recipe.available }
  });
  const idx = A.recipes.findIndex((r) => r.id === id);
  if (idx >= 0) A.recipes[idx] = data.recipe;
  refreshOverview().then(() => {
    if (A.view === 'overview') renderBody();
  }).catch(() => {});
  const list = $('#adm-list');
  if (list) list.innerHTML = recipesTableHTML();
  toast(data.recipe.available ? '菜品已上架' : '菜品已下架', 'success');
}

async function toggleArticle(id) {
  const article = findArticle(id);
  if (!article) return;
  const data = await api(`/admin/articles/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { available: !article.available }
  });
  const idx = A.articles.findIndex((a) => a.id === id);
  if (idx >= 0) A.articles[idx] = data.article;
  refreshOverview().then(() => {
    if (A.view === 'overview') renderBody();
  }).catch(() => {});
  const list = $('#adm-list');
  if (list) list.innerHTML = articlesTableHTML();
  toast(data.article.available ? '文章已上架' : '文章已下架', 'success');
}

async function deleteRecipe(id) {
  const recipe = findRecipe(id);
  if (!window.confirm(`确定删除「${recipe?.name || '该菜品'}」？删除后前台将不可见。`)) return;
  await api(`/admin/recipes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await Promise.all([refreshRecipes(), refreshOverview()]);
  renderBody();
  toast('菜品已删除', 'success');
}

async function deleteArticle(id) {
  const article = findArticle(id);
  if (!window.confirm(`确定删除「${article?.title || '该文章'}」？删除后前台将不可见。`)) return;
  await api(`/admin/articles/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await Promise.all([refreshArticles(), refreshOverview()]);
  renderBody();
  toast('文章已删除', 'success');
}

function handleClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;

  if (action === 'reload') {
    if (A.me) {
      loadAll().then(() => {
        renderShell();
        toast('数据已刷新', 'success');
      }).catch((err) => toast(err.message, 'error'));
    } else {
      boot();
    }
    return;
  }
  if (action === 'view') {
    const view = target.dataset.view;
    if (!VIEW_META[view]) return;
    A.view = view;
    A.page = { recipes: 1, articles: 1, users: 1 };
    renderShell();
    return;
  }
  if (action === 'logout') {
    logout();
    return;
  }
  if (action === 'close-modal') {
    if (event.target === target || target.classList.contains('adm-icon-btn') || target.classList.contains('adm-btn')) {
      closeModal();
    }
    return;
  }
  if (action === 'open-password') {
    openModal(passwordModalHTML());
    return;
  }
  if (action === 'new-recipe') {
    openModal(recipeFormHTML(null), true);
    return;
  }
  if (action === 'pick-recipe-image') {
    $('#adm-recipe-image-file')?.click();
    return;
  }
  if (action === 'generate-recipe-image') {
    generateFormRecipeImage(target).catch((err) => toast(err.message, 'error'));
    return;
  }
  if (action === 'detect-article-dishes') {
    renderArticleDishes(target.closest('form'), { notify: true });
    return;
  }
  if (action === 'generate-article-dish') {
    generateArticleDish(target).catch((err) => toast(err.message, 'error'));
    return;
  }
  if (action === 'generate-article-images') {
    generateArticleImages(target).catch((err) => toast(err.message, 'error'));
    return;
  }
  if (action === 'fetch-article') {
    fetchArticleIntoForm(target).catch((err) => toast(err.message, 'error'));
    return;
  }
  if (action === 'edit-recipe') {
    const recipe = findRecipe(target.dataset.id);
    if (recipe) openModal(recipeFormHTML(recipe), true);
    return;
  }
  if (action === 'toggle-recipe') {
    toggleRecipe(target.dataset.id).catch((err) => toast(err.message, 'error'));
    return;
  }
  if (action === 'delete-recipe') {
    deleteRecipe(target.dataset.id).catch((err) => toast(err.message, 'error'));
    return;
  }
  if (action === 'new-article') {
    openModal(articleFormHTML(null), true);
    return;
  }
  if (action === 'edit-article') {
    const article = findArticle(target.dataset.id);
    if (article) {
      openModal(articleFormHTML(article), true);
      renderArticleDishes($('#adm-modal-root form[data-form="article"]'));
    }
    return;
  }
  if (action === 'toggle-article') {
    toggleArticle(target.dataset.id).catch((err) => toast(err.message, 'error'));
    return;
  }
  if (action === 'delete-article') {
    deleteArticle(target.dataset.id).catch((err) => toast(err.message, 'error'));
    return;
  }
  if (action === 'manage-user') {
    openUserModal(target.dataset.id);
    return;
  }
  if (action === 'delete-user') {
    deleteUser(target.dataset.id).catch((err) => toast(err.message, 'error'));
    return;
  }
  if (action === 'page') {
    const key = target.dataset.key;
    if (!A.page[key]) return;
    A.page[key] = Number(target.dataset.page) || 1;
    const listId = $('#adm-list');
    if (!listId) return;
    listId.innerHTML = key === 'recipes' ? recipesTableHTML() : key === 'articles' ? articlesTableHTML() : usersTableHTML();
    return;
  }
}

function handleSubmit(event) {
  const form = event.target;
  if (!form?.dataset?.form) return;
  event.preventDefault();
  const type = form.dataset.form;
  const run = async () => {
    if (type === 'login') return doLogin(form);
    if (type === 'recipe') return saveRecipe(form);
    if (type === 'article') return saveArticle(form);
    if (type === 'user') return saveUser(form);
    if (type === 'reset-password') return resetPassword(form);
    if (type === 'password') return savePassword(form);
  };
  run().catch((err) => toast(err.message || '操作失败', 'error'));
}

function handleInput(event) {
  const el = event.target;
  const filter = el.dataset?.filter;
  if (!filter) return;
  if (filter === 'recipe-q') {
    A.recipeQuery = el.value;
    A.page.recipes = 1;
    const list = $('#adm-list');
    if (list) list.innerHTML = recipesTableHTML();
    const count = $('.adm-count');
    if (count) count.textContent = `${filteredRecipes().length} 道菜品`;
    return;
  }
  if (filter === 'article-q') {
    A.articleQuery = el.value;
    A.page.articles = 1;
    const list = $('#adm-list');
    if (list) list.innerHTML = articlesTableHTML();
    const count = $('.adm-count');
    if (count) count.textContent = `${filteredArticles().length} 篇文章`;
    return;
  }
  if (filter === 'user-q') {
    A.userQuery = el.value;
    A.page.users = 1;
    const list = $('#adm-list');
    if (list) list.innerHTML = usersTableHTML();
    const count = $('.adm-count');
    if (count) count.textContent = `${filteredUsers().length} 位用户`;
  }
}

function handleChange(event) {
  const el = event.target;
  const filter = el.dataset?.filter;
  if (!filter) {
    if (el.id === 'adm-recipe-course') {
      const course = el.value;
      const box = $('#adm-slot-options');
      if (box) box.innerHTML = slotOptionsHTML(course, []);
      return;
    }
    if (el.id === 'adm-recipe-image-file') {
      uploadRecipeImage(el.files?.[0])
        .catch((err) => toast(err.message, 'error'))
        .finally(() => {
          el.value = '';
        });
      return;
    }
    if (el.id === 'adm-image-select') {
      const preview = $('#adm-image-preview');
      if (preview && el.value !== 'auto') preview.src = el.value;
    }
    return;
  }
  if (filter === 'recipe-course') {
    A.recipeCourse = el.value;
    A.page.recipes = 1;
    const list = $('#adm-list');
    if (list) list.innerHTML = recipesTableHTML();
  } else if (filter === 'recipe-status') {
    A.recipeStatus = el.value;
    A.page.recipes = 1;
    const list = $('#adm-list');
    if (list) list.innerHTML = recipesTableHTML();
  } else if (filter === 'article-status') {
    A.articleStatus = el.value;
    A.page.articles = 1;
    const list = $('#adm-list');
    if (list) list.innerHTML = articlesTableHTML();
  } else if (filter === 'user-role') {
    A.userRole = el.value;
    A.page.users = 1;
    const list = $('#adm-list');
    if (list) list.innerHTML = usersTableHTML();
  } else if (filter === 'user-status') {
    A.userStatus = el.value;
    A.page.users = 1;
    const list = $('#adm-list');
    if (list) list.innerHTML = usersTableHTML();
  }
  updateFilterCount();
}

function updateFilterCount() {
  const count = $('.adm-count');
  if (!count) return;
  if (A.view === 'recipes') count.textContent = `${filteredRecipes().length} 道菜品`;
  else if (A.view === 'articles') count.textContent = `${filteredArticles().length} 篇文章`;
  else if (A.view === 'users') count.textContent = `${filteredUsers().length} 位用户`;
}

/* ------------------------------ 启动 ------------------------------ */

async function boot() {
  if (!A.token) {
    renderLogin();
    return;
  }
  try {
    const me = await api('/auth/me');
    if (me.user?.role !== 'admin') throw new Error('该账号没有管理权限');
    A.me = me.user;
    A.meta = await api('/meta');
    await loadAll();
    renderShell();
  } catch (err) {
    setToken('');
    A.me = null;
    if (err.status === 401 || err.status === 403 || /没有管理权限/.test(err.message)) {
      renderLogin(err.status === 403 ? '该账号没有管理权限' : '');
    } else {
      renderBootError(err.message);
    }
  }
}

document.addEventListener('click', handleClick);
document.addEventListener('submit', handleSubmit);
document.addEventListener('input', handleInput);
document.addEventListener('change', handleChange);

boot();
