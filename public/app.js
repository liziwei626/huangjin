'use strict';

/* ------------------------------------------------------------------ *
 * 暖月 · 月子餐智能搭配
 * 前端为原生 JS 单页应用，所有数据通过 /api 与后端交互。
 * ------------------------------------------------------------------ */

const $ = (sel, root = document) => root.querySelector(sel);

const S = {
  token: localStorage.getItem('ny_token') || '',
  meta: null,
  recipes: [],
  me: null,
  profile: null,
  stage: null,
  favorites: [],
  stats: null,
  plan: null,
  planDay: null,
  selectedDate: '',
  tab: 'today',
  filter: { course: 'all', stage: 'all', effect: 'all', q: '', fav: false },
  grocery: { view: 'week', data: null, loading: false, hideChecked: false },
  authMode: 'login',
  onb: null,
  sheet: null,
  edit: null,
  recordDate: todayStr(),
  logs: [],
  logsLoaded: false,
  log: {},
  logDirty: false,
  articles: null,
  article: null,
  busy: false,
  bootError: null
};

/* ------------------------------ 工具 ------------------------------ */

function esc(v) {
  return String(v === undefined || v === null ? '' : v).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(dateStr, n) {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

function daysBetween(from, to) {
  const [y1, m1, d1] = String(from).split('-').map(Number);
  const [y2, m2, d2] = String(to).split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

function postpartumDays(deliveryDate) {
  if (!deliveryDate) return 1;
  return Math.max(1, daysBetween(deliveryDate, todayStr()) + 1);
}

function weekdayShort(dateStr) {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(y, m - 1, d).getDay()];
}

function dateLabelCN(dateStr) {
  const [, m, d] = String(dateStr).split('-').map(Number);
  return `${m} 月 ${d} 日 · ${weekdayShort(dateStr)}`;
}

const ICONS = {
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5Z"/>',
  basket: '<path d="M4 9h16l-1.5 10.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 9Z"/><path d="m8.5 9 3.5-5.5L15.5 9"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7a4.1 4.1 0 0 1 7.5 3.6C19.5 15.4 12 20 12 20Z"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.4 6.2"/><path d="M20 4.5V11h-6.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  flame: '<path d="M12 21c4 0 6.5-2.6 6.5-6 0-4.5-4.5-6.5-4.5-11-3 1.5-4.3 4-4.3 6.2 0 1.6.6 2.6.6 2.6S8 11 8 8.7C6.2 10.4 5.5 12.6 5.5 15c0 3.4 2.5 6 6.5 6Z"/>',
  edit: '<path d="M4 20h4l10-10-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="m10 8-4 4 4 4M6 12h9"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.8v.2"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M8 3.5v4M16 3.5v4M4 10h16"/>',
  sparkle: '<path d="M12 3.5 13.8 9l5.2 1.5-5.2 1.5L12 17.5 10.2 12 5 10.5 10.2 9 12 3.5Z"/>',
  leaf: '<path d="M20 4c-8 0-13 3.5-13 9a6 6 0 0 0 6 6c5.5 0 7-5 7-15Z"/><path d="M4 20c2-5 5-8 10-10"/>',
  arrowLeft: '<path d="m15 5-7 7 7 7"/>',
  arrowRight: '<path d="m9 5 7 7-7 7"/>',
  trend: '<path d="M4 19V5M4 19h16"/><path d="m7 15 3.5-4 3 2.5L20 7"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
  download: '<path d="M12 4v11"/><path d="m8 11 4 4 4-4"/><path d="M5 19h14"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  water: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
  bookmark: '<path d="M6 4h12v17l-6-4-6 4V4Z"/>'
};

function icon(name, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

function courseLabel(key) {
  const c = S.meta?.courses?.find((x) => x.key === key);
  return c ? c.label : key;
}

function slotMeta(key) {
  return S.meta?.slots?.find((s) => s.key === key) || { key, label: key, time: '', courses: [] };
}

function stageByNumber(n) {
  return S.meta?.stages?.find((s) => s.stage === n) || null;
}

function stageNumberForDay(day) {
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 28) return 3;
  return 4;
}

/* ------------------------------ API ------------------------------ */

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (S.token) headers.Authorization = `Bearer ${S.token}`;
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
    throw err;
  }
  return data;
}

function setToken(token) {
  S.token = token || '';
  if (S.token) localStorage.setItem('ny_token', S.token);
  else localStorage.removeItem('ny_token');
}

function applyMe(data) {
  S.me = data.user;
  S.profile = data.profile;
  S.stage = data.stage;
  S.favorites = Array.isArray(data.favorites) ? data.favorites : [];
  S.plan = data.plan || null;
  S.stats = data.stats || null;
}

function clearSession() {
  setToken('');
  S.me = null;
  S.profile = null;
  S.stage = null;
  S.favorites = [];
  S.plan = null;
  S.planDay = null;
  S.stats = null;
  S.grocery = { view: 'week', data: null, loading: false, hideChecked: false };
  S.records = null;
  S.logs = [];
  S.logsLoaded = false;
  S.log = {};
  S.logDirty = false;
  S.articles = null;
  S.article = null;
  S.sheet = null;
}

function handleError(err) {
  if (err && err.status === 401) {
    clearSession();
    renderAuth();
    toast('登录状态已失效，请重新登录', 'error');
    return;
  }
  toast(err?.message || '操作失败，请稍后再试', 'error');
}

/* ------------------------------ 启动 ------------------------------ */

async function boot() {
  try {
    S.meta = await api('/meta');
    const recipeData = await api('/recipes');
    S.recipes = recipeData.recipes;
    S.selectedDate = todayStr();

    if (S.token) {
      try {
        const me = await api(`/auth/me?date=${S.selectedDate}`);
        applyMe(me);
        if (!S.profile.onboarded) {
          initOnboarding();
          renderOnboarding();
          return;
        }
        await loadPlan(S.selectedDate, true);
        renderMain();
        return;
      } catch (err) {
        if (err.status === 401) {
          setToken('');
        } else {
          throw err;
        }
      }
    }
    renderAuth();
  } catch (err) {
    S.bootError = err;
    renderFatal();
  }
}

async function loadPlan(date, silent = false) {
  const data = await api(`/plan?date=${encodeURIComponent(date)}`);
  S.plan = data.plan;
  S.planDay = data.day;
  S.stats = data.stats;
  S.selectedDate = date;
  if (!silent) S.grocery.data = null;
  return data;
}

/* ------------------------------ 认证 ------------------------------ */

function renderAuth() {
  const mode = S.authMode;
  const demo = S.meta?.demo || { username: 'demo', password: 'demo123456' };
  $('#app').innerHTML = `
    <div class="auth-scroll">
      <div class="auth-hero">
        <img src="/images/hero.jpg" alt="温热月子餐餐桌" />
        <div class="auth-brand">
          <div class="mark">N U A N Y U E</div>
          <h1>月子餐，<br />按阶段吃得对</h1>
          <p>根据产后天数、分娩方式与忌口，自动搭配一周不重样的三餐三点，连采购清单一起备好。</p>
        </div>
      </div>
      <div class="auth-card">
        <div class="segmented auth-tabs">
          <button type="button" class="${mode === 'login' ? 'active' : ''}" data-action="auth-mode" data-mode="login">登录</button>
          <button type="button" class="${mode === 'register' ? 'active' : ''}" data-action="auth-mode" data-mode="register">注册</button>
        </div>
        <form class="auth-form" data-form="auth">
          <label class="field">
            <span>账号</span>
            <input name="username" autocomplete="username" placeholder="3-20 位字母、数字或下划线" required />
          </label>
          <label class="field">
            <span>密码</span>
            <input name="password" type="password" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" placeholder="至少 6 位" required />
          </label>
          <label class="field ${mode === 'login' ? 'hidden' : ''}">
            <span>怎么称呼你</span>
            <input name="name" maxlength="20" placeholder="例如：小满（选填）" />
          </label>
          <button class="btn btn-primary" type="submit">${mode === 'login' ? '登录' : '创建账号，开始搭配'}</button>
          <p class="form-error" id="auth-error"></p>
        </form>
        <button class="btn btn-ghost demo-btn" type="button" data-action="demo-login">使用体验账号进入</button>
        <p class="auth-note">体验账号 ${esc(demo.username)} / ${esc(demo.password)}，数据仅用于演示</p>
      </div>
      <p class="auth-foot">饮食建议仅供参考，具体请遵医嘱</p>
    </div>`;
  $('#overlay-root').innerHTML = '';
}

async function doAuthSubmit(form) {
  const fd = new FormData(form);
  const payload = {
    username: String(fd.get('username') || '').trim(),
    password: String(fd.get('password') || ''),
    date: todayStr()
  };
  if (S.authMode === 'register') payload.name = String(fd.get('name') || '').trim();

  const btn = form.querySelector('button[type="submit"]');
  const errBox = $('#auth-error');
  errBox.textContent = '';
  btn.disabled = true;
  const oldText = btn.textContent;
  btn.textContent = '请稍候…';

  try {
    const data = await api(`/auth/${S.authMode === 'login' ? 'login' : 'register'}`, {
      method: 'POST',
      body: payload
    });
    setToken(data.token);
    applyMe(data);
    if (!S.profile.onboarded) {
      initOnboarding();
      renderOnboarding();
      return;
    }
    S.selectedDate = todayStr();
    await loadPlan(S.selectedDate, true);
    renderMain();
  } catch (err) {
    errBox.textContent = err.message;
    btn.disabled = false;
    btn.textContent = oldText;
  }
}

async function doDemoLogin(btn) {
  if (S.busy) return;
  S.busy = true;
  const demo = S.meta?.demo || { username: 'demo', password: 'demo123456' };
  const old = btn.textContent;
  btn.textContent = '正在进入体验…';
  try {
    const data = await api('/auth/login', { method: 'POST', body: { ...demo, date: todayStr() } });
    setToken(data.token);
    applyMe(data);
    S.selectedDate = todayStr();
    if (!S.profile.onboarded) {
      initOnboarding();
      renderOnboarding();
      return;
    }
    await loadPlan(S.selectedDate, true);
    renderMain();
  } catch (err) {
    handleError(err);
    btn.textContent = old;
  } finally {
    S.busy = false;
  }
}

/* ------------------------------ 引导 ------------------------------ */

function initOnboarding() {
  const p = S.profile || {};
  const slots = Array.isArray(p.slots) && p.slots.length ? p.slots : S.meta.slots.map((s) => s.key);
  S.onb = {
    step: 1,
    calorieTouched: Boolean(p.onboarded),
    data: {
      name: p.name || S.me?.name || '',
      deliveryDate: p.deliveryDate || addDays(todayStr(), -7),
      deliveryType: p.deliveryType || '顺产',
      feeding: p.feeding || '混合喂养',
      restrictions: Array.isArray(p.restrictions) ? [...p.restrictions] : [],
      taste: p.taste || '适中',
      calorieGoal: p.calorieGoal || 2600,
      slots: [...slots],
      onboarded: true
    }
  };
}

function onbSummaryDays() {
  return postpartumDays(S.onb.data.deliveryDate);
}

function renderOnboarding() {
  const o = S.onb;
  const d = o.data;
  const days = onbSummaryDays();
  const stage = stageByNumber(stageNumberForDay(days));
  const steps = [
    { title: '先认识一下你', sub: '这些信息会用于计算产后阶段、推荐合适的餐次与热量。' },
    { title: '吃得舒服最重要', sub: '勾选需要避开的食材，搭配时会自动排除；口味和热量也可以随时调整。' },
    { title: '一天吃几餐？', sub: '月子期建议三正餐 + 两到三次加餐，少食多餐更好吸收。' }
  ];
  const stepInfo = steps[o.step - 1];

  let body = '';
  if (o.step === 1) {
    body = `
      <div class="form-block">
        <h3>基本信息</h3>
        <label class="field">
          <span>怎么称呼你</span>
          <input data-onb="name" maxlength="20" value="${esc(d.name)}" placeholder="例如：小满" />
        </label>
        <label class="field">
          <span>分娩日期</span>
          <input type="date" data-onb="deliveryDate" value="${esc(d.deliveryDate)}" max="${todayStr()}" />
          <div class="quick-dates">
            ${[7, 14, 21, 28].map((n) => {
              const val = addDays(todayStr(), -n);
              return `<button type="button" class="${d.deliveryDate === val ? 'active' : ''}" data-action="onb-quick-date" data-days="${n}">${n} 天前</button>`;
            }).join('')}
          </div>
        </label>
        <div style="margin-top:14px">
          <span class="small muted">按当前日期计算：产后第 <b style="color:var(--primary-deep)">${days}</b> 天 · ${esc(stage?.week || '')}</span>
        </div>
      </div>
      <div class="form-block">
        <h3>分娩方式</h3>
        <div class="option-grid cols-2">
          ${(S.meta.deliveryTypes || []).map((t) => `<button type="button" class="option ${d.deliveryType === t ? 'active' : ''}" data-action="onb-option" data-field="deliveryType" data-value="${esc(t)}">${esc(t)}</button>`).join('')}
        </div>
      </div>
      <div class="form-block">
        <h3>喂养方式</h3>
        <div class="option-grid">
          ${(S.meta.feedings || []).map((t) => `<button type="button" class="option ${d.feeding === t ? 'active' : ''}" data-action="onb-option" data-field="feeding" data-value="${esc(t)}">${esc(t)}</button>`).join('')}
        </div>
        <p class="small muted" style="margin-top:10px;line-height:1.7">母乳或混合喂养会自动避开含酒精的菜品。</p>
      </div>`;
  } else if (o.step === 2) {
    body = `
      <div class="form-block">
        <h3>忌口与过敏（可多选）</h3>
        <div class="option-grid">
          ${(S.meta.restrictions || []).map((r) => `<button type="button" class="option ${d.restrictions.includes(r.key) ? 'active' : ''}" data-action="onb-restrict" data-key="${esc(r.key)}">${esc(r.label)}</button>`).join('')}
        </div>
        <p class="small muted" style="margin-top:10px;line-height:1.7">已选 ${d.restrictions.length} 项。生成餐单和换菜时都会自动排除相关食材。</p>
      </div>
      <div class="form-block">
        <h3>口味偏好</h3>
        <div class="option-grid">
          ${(S.meta.tastes || []).map((t) => `<button type="button" class="option ${d.taste === t ? 'active' : ''}" data-action="onb-option" data-field="taste" data-value="${esc(t)}">${esc(t)}</button>`).join('')}
        </div>
      </div>
      <div class="form-block">
        <h3>每日热量目标</h3>
        <div class="option-grid cols-2">
          ${(S.meta.caloriePresets || []).map((p) => `<button type="button" class="option ${Number(d.calorieGoal) === p.value ? 'active' : ''}" data-action="onb-option" data-field="calorieGoal" data-value="${p.value}">${esc(p.label)}<small>${esc(p.desc)}</small></button>`).join('')}
        </div>
      </div>`;
  } else {
    body = `
      <div class="form-block">
        <h3>每日餐次</h3>
        ${(S.meta.slots || []).map((s) => {
          const on = d.slots.includes(s.key);
          return `
            <div class="switch-row">
              <span class="label">${esc(s.label)}<small>${esc(s.time)}</small></span>
              <button type="button" class="switch ${on ? 'on' : ''}" data-action="onb-slot" data-key="${esc(s.key)}" aria-label="切换${esc(s.label)}"></button>
            </div>`;
        }).join('')}
      </div>
      <div class="summary-card">
        <div>称呼：<b>${esc(d.name || '宝妈')}</b></div>
        <div>当前阶段：<b>${esc(stage?.week || '')} · ${esc(stage?.title || '')}</b></div>
        <div>分娩方式：<b>${esc(d.deliveryType)}</b> · 喂养：<b>${esc(d.feeding)}</b></div>
        <div>忌口：<b>${d.restrictions.length ? d.restrictions.map((k) => esc((S.meta.restrictions.find((r) => r.key === k) || {}).label || k)).join('、') : '无'}</b></div>
        <div>热量目标：<b>${d.calorieGoal} kcal</b> · 每日 <b>${d.slots.length}</b> 餐</div>
      </div>`;
  }

  $('#app').innerHTML = `
    <div class="onb">
      <div class="onb-head">
        ${o.step > 1 ? `<button class="onb-back" type="button" data-action="onb-back" aria-label="上一步">${icon('arrowLeft', 18)}</button>` : `<div class="onb-back" style="visibility:hidden">${icon('arrowLeft', 18)}</div>`}
        <div class="onb-dots">${[1, 2, 3].map((n) => `<span class="${o.step >= n ? 'active' : ''}"></span>`).join('')}</div>
      </div>
      <div class="onb-body">
        <div class="onb-kicker">STEP ${o.step} / 3</div>
        <h1 class="onb-title">${esc(stepInfo.title)}</h1>
        <p class="onb-sub">${esc(stepInfo.sub)}</p>
        ${body}
      </div>
      <div class="onb-foot">
        <button class="btn btn-primary" type="button" data-action="${o.step === 3 ? 'onb-submit' : 'onb-next'}">
          ${o.step === 3 ? '生成我的 7 天餐单' : '下一步'}
        </button>
      </div>
    </div>`;
  $('#overlay-root').innerHTML = '';
}

function onbValidate() {
  const d = S.onb.data;
  if (S.onb.step === 1) {
    if (!d.name.trim()) {
      toast('请填写称呼', 'error');
      return false;
    }
    if (!d.deliveryDate) {
      toast('请选择分娩日期', 'error');
      return false;
    }
    if (d.deliveryDate > todayStr()) {
      toast('分娩日期不能晚于今天', 'error');
      return false;
    }
  }
  if (S.onb.step === 3 && !d.slots.length) {
    toast('至少保留一餐', 'error');
    return false;
  }
  return true;
}

function renderMain(opts = {}) {
  const prev = $('#main-scroll');
  const scrollY = prev ? prev.scrollTop : 0;

  let view = '';
  if (S.tab === 'today') view = todayHTML();
  else if (S.tab === 'recipes') view = recipesHTML();
  else if (S.tab === 'records') view = recordsHTML();
  else if (S.tab === 'grocery') view = groceryHTML();
  else view = meHTML();

  $('#app').innerHTML = `
    <div class="app-layout">
      <main class="scroll" id="main-scroll">${view}</main>
      ${tabbarHTML()}
    </div>`;

  if (opts.keepScroll) {
    const next = $('#main-scroll');
    if (next) next.scrollTop = scrollY;
  }
}

function tabbarHTML() {
  const tabs = [
    { key: 'today', label: '今日', icon: 'sun' },
    { key: 'recipes', label: '食谱', icon: 'book' },
    { key: 'records', label: '记录', icon: 'trend' },
    { key: 'grocery', label: '清单', icon: 'basket' },
    { key: 'me', label: '我的', icon: 'user' }
  ];
  return `
    <nav class="tabbar">
      ${tabs.map((t) => `
        <button type="button" class="${S.tab === t.key ? 'active' : ''}" data-action="tab" data-tab="${t.key}">
          <span class="tab-icon">${icon(t.icon, 21)}</span>
          <span>${t.label}</span>
        </button>`).join('')}
    </nav>`;
}

/* ------------------------------ 今日 ------------------------------ */

function todayHTML() {
  const hour = new Date().getHours();
  const greet = hour < 11 ? '早安' : hour < 18 ? '午安' : '晚安';
  const name = (S.profile?.name || S.me?.name || '宝妈').slice(0, 10);
  const stage = S.planDay?.stage || S.stage;
  const day = S.planDay;
  const planInfo = S.plan;
  const eaten = day?.eaten || [];
  const skipped = day?.skipped || [];
  const mealCount = day?.meals?.length || 0;
  const kcal = day?.nutrition?.kcal || 0;
  const weekCount = planInfo ? Math.ceil(planInfo.days / 7) : 0;
  const weekIndex = planInfo
    ? Math.max(0, Math.min(weekCount - 1, Math.floor(Math.max(0, daysBetween(planInfo.startDate, S.selectedDate)) / 7)))
    : 0;
  const weekDays = planInfo ? planInfo.dayList.slice(weekIndex * 7, weekIndex * 7 + 7) : [];

  const heroCard = `
    <section class="hero-card">
      <img class="hero-bg" src="/images/hero.jpg" alt="" />
      <div class="hero-content">
        <p class="hero-eyebrow">${esc(stage?.week || '')} · 产后第 ${stage?.postpartumDay || postpartumDays(S.profile?.deliveryDate)} 天</p>
        <h1>${esc(stage?.title || '温和调养')}</h1>
        <p class="hero-focus">${esc(stage?.focus || '')}</p>
        <div class="hero-meta">
          <span class="pill">${mealCount ? `已吃 ${eaten.length}/${mealCount} 餐` : '待生成餐单'}</span>
          <span class="pill">${kcal ? `约 ${kcal} kcal` : `${S.profile?.calorieGoal || 2600} kcal 目标`}</span>
          ${skipped.length ? `<span class="pill">跳过 ${skipped.length}</span>` : ''}
        </div>
        <div class="hero-progress"><span style="width:${Math.round((stage?.progress || 0.05) * 100)}%"></span></div>
      </div>
    </section>`;

  const weekTabs = weekCount > 1
    ? `<div class="week-tabs">
        ${Array.from({ length: weekCount }, (_, i) => `
          <button type="button" class="week-tab ${i === weekIndex ? 'active' : ''}" data-action="week-tab" data-index="${i}">第 ${i + 1} 周</button>`).join('')}
      </div>`
    : '';

  const weekStrip = planInfo?.dayList?.length
    ? `
      <div class="section-head">
        <h2>${weekCount > 1 ? `第 ${weekIndex + 1} 周餐单` : '本周餐单'}</h2>
        <button class="link-btn" type="button" data-action="open-generate">重新生成</button>
      </div>
      ${weekTabs}
      <div class="week-strip">
        ${weekDays.map((d) => `
          <button type="button" class="day-chip ${d.date === S.selectedDate ? 'active' : ''} ${d.complete ? 'complete' : ''}" data-action="select-date" data-date="${d.date}">
            <span class="w">${esc(d.weekday)}</span>
            <span class="d">${d.dayOfMonth}</span>
            <span class="dot"></span>
          </button>`).join('')}
      </div>`
    : '';

  let content = '';
  if (!day) {
    content = `
      <div class="empty-card">
        <h3>这一天还没有餐单</h3>
        <p>根据你的产后阶段和忌口，生成一份新的餐单吧。</p>
        <button class="btn btn-primary" type="button" data-action="open-generate">生成餐单</button>
      </div>`;
  } else {
    content = `
      <div class="section-head" style="padding-top:14px">
        <h2>${dateLabelCN(day.date)} · 今日安排</h2>
        <span class="small muted">${eaten.length}/${mealCount} 已吃${skipped.length ? ` · ${skipped.length} 跳过` : ''}</span>
      </div>
      ${day.meals.map((meal) => mealCardHTML(meal, day.date, eaten, skipped)).join('')}
      ${nutritionHTML(day)}
      ${tipsHTML(stage)}`;
  }

  return `
    <header class="topbar">
      <div>
        <div class="brand-chip">暖月</div>
        <div class="top-date">${greet}，${esc(name)}</div>
      </div>
      <div class="topbar-right">
        <span class="top-date">${dateLabelCN(todayStr())}</span>
        <button class="avatar" type="button" data-action="tab" data-tab="me" aria-label="个人中心">${esc((name || '暖').slice(0, 1))}</button>
      </div>
    </header>
    ${heroCard}
    ${weekStrip}
    ${content}`;
}

function mealCardHTML(meal, date, eaten, skipped = []) {
  const done = eaten.includes(meal.slot);
  const skip = skipped.includes(meal.slot);
  return `
    <section class="meal-card">
      <div class="meal-head">
        <div class="meal-title">
          <h3>${esc(meal.label)}</h3>
          <span>${esc(meal.time)}</span>
        </div>
        <div class="meal-actions">
          <button type="button" class="skip-btn ${skip ? 'on' : ''}" data-action="skip" data-date="${date}" data-slot="${meal.slot}">
            ${skip ? '已跳过' : '跳过'}
          </button>
          <button type="button" class="eat-btn ${done ? 'done' : ''}" data-action="eat" data-date="${date}" data-slot="${meal.slot}">
            ${done ? icon('check', 13) + ' 已吃' : '打卡'}
          </button>
        </div>
      </div>
      ${meal.dishes.map((d) => `
        <div class="dish">
          <button type="button" class="dish-thumb" data-action="open-recipe" data-id="${d.recipe.id}" aria-label="查看${esc(d.recipe.name)}">
            <img src="${d.recipe.image}" alt="" loading="lazy" />
          </button>
          <div class="dish-info">
            <button type="button" class="dish-name" data-action="open-recipe" data-id="${d.recipe.id}">${esc(d.recipe.name)}</button>
            <span class="dish-tags">${esc(d.recipe.tags.slice(0, 2).join(' · '))}</span>
          </div>
          <div class="dish-kcal">${d.recipe.kcal}<span>kcal</span></div>
          <button type="button" class="swap-btn" data-action="swap" data-date="${date}" data-slot="${meal.slot}" data-course="${d.course}" aria-label="换一道" title="换一道">
            ${icon('refresh', 14)}
          </button>
        </div>`).join('')}
    </section>`;
}

function nutritionHTML(day) {
  const target = day.targetKcal || 2600;
  const pct = Math.min(100, Math.round((day.nutrition.kcal / target) * 100));
  const diff = day.nutrition.kcal - target;
  return `
    <section class="card nutrition-card">
      <div class="section-head" style="padding:0 0 8px">
        <h2>今日营养</h2>
        <span class="small muted">目标 ${target} kcal</span>
      </div>
      <div class="nutrition-top">
        <div class="nutrition-kcal">
          <strong>${day.nutrition.kcal}</strong><span>kcal</span>
          <em>${diff > 0 ? `较目标多 ${diff} kcal，哺乳期可灵活调整` : `较目标少 ${Math.abs(diff)} kcal`}</em>
        </div>
        <span class="pill">${pct}%</span>
      </div>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <div class="macro-grid">
        <div><span>蛋白质</span><strong>${day.nutrition.protein} g</strong></div>
        <div><span>碳水</span><strong>${day.nutrition.carbs} g</strong></div>
        <div><span>脂肪</span><strong>${day.nutrition.fat} g</strong></div>
      </div>
    </section>`;
}

function tipsHTML(stage) {
  if (!stage?.suggestions?.length) return '';
  return `
    <section class="card tip-card">
      <span class="tip-badge">本阶段重点</span>
      <ul>${stage.suggestions.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
    </section>`;
}

/* ------------------------------ 食谱 ------------------------------ */

function filteredRecipes() {
  const f = S.filter;
  const q = f.q.trim();
  const effect = f.effect === 'all' ? null : (S.meta.effects || []).find((e) => e.key === f.effect);
  return S.recipes.filter((r) => {
    if (f.fav && !S.favorites.includes(r.id)) return false;
    if (f.course !== 'all' && r.course !== f.course) return false;
    if (f.stage !== 'all' && !r.stages.includes(Number(f.stage))) return false;
    if (effect && !r.tags.some((t) => effect.tags.includes(t))) return false;
    if (q) {
      const hay = `${r.name} ${r.tags.join(' ')} ${r.ingredients.map((i) => i[0]).join(' ')}`;
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function recipeCardHTML(r) {
  const fav = S.favorites.includes(r.id);
  return `
    <article class="recipe-card" data-action="open-recipe" data-id="${r.id}">
      <div class="recipe-thumb">
        <img src="${r.image}" alt="" loading="lazy" />
        <button type="button" class="fav-btn ${fav ? 'on' : ''}" data-action="fav" data-id="${r.id}" aria-label="收藏${esc(r.name)}">
          ${icon('heart', 16)}
        </button>
      </div>
      <div class="recipe-body">
        <h3>${esc(r.name)}</h3>
        <p>${esc(r.tags.slice(0, 2).join(' · '))}</p>
        <div class="recipe-meta"><span>${courseLabel(r.course)}</span><span>${r.kcal} kcal</span></div>
      </div>
    </article>`;
}

function recipeGridHTML() {
  const list = filteredRecipes();
  if (!list.length) return `<div class="grid-empty">没有符合条件的食谱${S.filter.fav ? '，去收藏几道喜欢的菜吧' : ''}</div>`;
  return list.map(recipeCardHTML).join('');
}

function recipesHTML() {
  const f = S.filter;
  return `
    <header class="page-head">
      <h1>食谱库</h1>
      <p>${S.recipes.length} 道月子餐 · 按阶段、餐次与功效自由筛选</p>
    </header>
    <div class="search-box">
      ${icon('search', 18)}
      <input id="recipe-search" placeholder="搜索菜名或食材，如「鲫鱼」" value="${esc(f.q)}" autocomplete="off" />
    </div>
    <div class="filter-bar">
      <span class="small muted">共 ${filteredRecipes().length} 道</span>
      <button class="fav-filter ${f.fav ? 'active' : ''}" type="button" data-action="filter-fav">
        ${icon('heart', 13)} 我的收藏
      </button>
    </div>
    <div class="chip-row">
      <button class="chip ${f.course === 'all' ? 'active' : ''}" type="button" data-action="filter-course" data-value="all">全部</button>
      ${(S.meta.courses || []).map((c) => `<button class="chip ${f.course === c.key ? 'active' : ''}" type="button" data-action="filter-course" data-value="${c.key}">${esc(c.label)}</button>`).join('')}
    </div>
    <div class="chip-row">
      <button class="chip ${f.stage === 'all' ? 'active' : ''}" type="button" data-action="filter-stage" data-value="all">全部阶段</button>
      ${(S.meta.stages || []).map((s) => `<button class="chip ${String(f.stage) === String(s.stage) ? 'active' : ''}" type="button" data-action="filter-stage" data-value="${s.stage}">${esc(s.week)}</button>`).join('')}
    </div>
    <div class="chip-row">
      <button class="chip ${f.effect === 'all' ? 'active' : ''}" type="button" data-action="filter-effect" data-value="all">全部功效</button>
      ${(S.meta.effects || []).map((e) => `<button class="chip ${f.effect === e.key ? 'active' : ''}" type="button" data-action="filter-effect" data-value="${esc(e.key)}">${esc(e.label)}</button>`).join('')}
    </div>
    <div class="recipe-grid" id="recipe-grid">${recipeGridHTML()}</div>`;
}

/* ------------------------------ 记录 ------------------------------ */

const EMPTY_LOG = {
  weight: '',
  waterMl: 0,
  sleepHours: '',
  mood: '',
  lochia: '',
  wound: '',
  bowel: '',
  note: ''
};

function findLog(date) {
  return S.logs.find((l) => l.date === date) || null;
}

function logWithDefaults(log) {
  return { ...EMPTY_LOG, ...(log || {}) };
}

async function loadLogs() {
  try {
    const start = addDays(todayStr(), -41);
    const data = await api(`/logs?start=${start}&days=42`);
    S.logs = data.logs || [];
    S.logsLoaded = true;
    if (!S.recordDate) S.recordDate = todayStr();
    S.log = logWithDefaults(findLog(S.recordDate));
    S.logDirty = false;
    if (S.tab === 'records') renderMain({ keepScroll: true });
  } catch (err) {
    S.logsLoaded = true;
    handleError(err);
  }
}

function sortedLogs() {
  return S.logs.filter((l) => l && l.date).sort((a, b) => a.date.localeCompare(b.date));
}

function weightChange(date, weight) {
  if (!weight) return null;
  const prev = sortedLogs().filter((l) => l.date < date && l.weight);
  if (!prev.length) return null;
  const diff = Math.round((Number(weight) - Number(prev[prev.length - 1].weight)) * 10) / 10;
  return diff;
}

function sparklineSVG(points) {
  if (points.length < 2) return '<div class="chart-empty">记录两次体重后，这里会出现趋势曲线</div>';
  const w = 300;
  const h = 78;
  const pad = 8;
  const values = points.map((p) => Number(p.weight));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coords = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (values.length - 1);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y];
  });
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`;
  const last = coords[coords.length - 1];
  return `
    <svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#c4704e" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#c4704e" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <polygon points="${area}" fill="url(#sparkFill)"/>
      <polyline points="${line}" fill="none" stroke="#c4704e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="3.2" fill="#c4704e"/>
    </svg>`;
}

function waterChartHTML() {
  const days = Array.from({ length: 7 }, (_, i) => addDays(todayStr(), -6 + i));
  const goal = S.meta.logOptions.waterGoalMl;
  const values = days.map((d) => Number(findLog(d)?.waterMl) || 0);
  const max = Math.max(goal, ...values, 1);
  return `
    <div class="mini-chart">
      <div class="chart-title"><span>近 7 天饮水</span><em>目标 ${goal / 1000} L</em></div>
      <div class="bar-chart">
        ${days.map((d, i) => `
          <div class="bar-col">
            <div class="bar-track"><span style="height:${Math.round((values[i] / max) * 100)}%" class="${values[i] >= goal ? 'met' : ''}"></span></div>
            <label>${weekdayShort(d).replace('周', '')}</label>
          </div>`).join('')}
      </div>
    </div>`;
}

function sleepChartHTML() {
  const days = Array.from({ length: 7 }, (_, i) => addDays(todayStr(), -6 + i));
  const values = days.map((d) => Number(findLog(d)?.sleepHours) || 0);
  const max = Math.max(9, ...values);
  return `
    <div class="mini-chart">
      <div class="chart-title"><span>近 7 天睡眠</span><em>小时</em></div>
      <div class="bar-chart">
        ${days.map((d, i) => `
          <div class="bar-col">
            <div class="bar-track"><span style="height:${Math.round((values[i] / max) * 100)}%" class="sage"></span></div>
            <label>${weekdayShort(d).replace('周', '')}</label>
          </div>`).join('')}
      </div>
    </div>`;
}

function recordsHTML() {
  if (!S.logsLoaded) {
    return `
      <header class="page-head"><h1>调养记录</h1><p>正在加载你的记录…</p></header>
      <div class="empty-card"><h3>加载中</h3><p>正在同步体重、饮水与睡眠记录。</p></div>`;
  }

  const date = S.recordDate;
  const log = logWithDefaults(S.log);
  const dayNumber = postpartumDays(S.profile?.deliveryDate);
  const dateDay = daysBetween(S.profile?.deliveryDate, date) + 1;
  const isToday = date === todayStr();
  const summary = S.plan?.dayList?.find((d) => d.date === date);
  const weightLogs = sortedLogs().filter((l) => l.weight && l.date <= date).slice(-14);
  const change = weightChange(date, log.weight);
  const waterGoal = S.meta.logOptions.waterGoalMl;
  const cupMl = S.meta.logOptions.waterCupMl;
  const cups = Math.round(Number(log.waterMl || 0) / cupMl);
  const waterPct = Math.min(100, Math.round((Number(log.waterMl || 0) / waterGoal) * 100));

  return `
    <header class="page-head">
      <h1>调养记录</h1>
      <p>每天一点记录，看见身体在慢慢恢复</p>
    </header>

    <div class="date-nav">
      <button class="icon-btn nav-arrow" type="button" data-action="log-prev" aria-label="前一天">${icon('arrowLeft', 18)}</button>
      <div class="date-nav-center">
        <strong>${dateLabelCN(date)}</strong>
        <span>产后第 ${dateDay > 0 ? dateDay : dayNumber} 天${isToday ? ' · 今天' : ''}</span>
      </div>
      <button class="icon-btn nav-arrow" type="button" data-action="log-next" ${isToday ? 'disabled' : ''} aria-label="后一天">${icon('arrowRight', 18)}</button>
    </div>
    ${!isToday ? `<div class="today-link"><button type="button" data-action="log-today">回到今天</button></div>` : ''}

    <section class="card meal-progress-card">
      <div class="section-head" style="padding:0 0 8px">
        <h2>当天餐单</h2>
        <button class="link-btn" type="button" data-action="view-day-plan" data-date="${date}">查看餐单</button>
      </div>
      ${summary ? `
        <div class="meal-progress-row">
          <div><strong>${summary.eatenCount}</strong><span>已吃</span></div>
          <div><strong>${summary.skippedCount}</strong><span>跳过</span></div>
          <div><strong>${summary.mealCount - summary.eatenCount - summary.skippedCount}</strong><span>待完成</span></div>
          <div><strong>${summary.kcal}</strong><span>kcal</span></div>
        </div>
        <div class="bar"><span style="width:${summary.mealCount ? Math.round(((summary.eatenCount + summary.skippedCount) / summary.mealCount) * 100) : 0}%"></span></div>
      ` : `<p class="small muted" style="line-height:1.8">这一天不在当前餐单范围内，可以回到今日重新生成 28 天餐单。</p>`}
    </section>

    <section class="card record-card">
      <div class="record-head"><h3>体重</h3><span class="small muted">每周固定时间记录更准确</span></div>
      <div class="weight-row">
        <input type="number" inputmode="decimal" step="0.1" min="25" max="200" data-log="weight" value="${log.weight ?? ''}" placeholder="62.5" />
        <span class="unit">kg</span>
        ${change === null ? '<span class="weight-diff muted">首次记录</span>' : `<span class="weight-diff ${change > 0 ? 'up' : 'down'}">${change > 0 ? '+' : ''}${change} kg</span>`}
      </div>
      ${sparklineSVG(weightLogs)}
    </section>

    <section class="card record-card">
      <div class="record-head">
        <h3>饮水</h3>
        <span class="water-total"><b>${log.waterMl || 0}</b> / ${waterGoal} ml</span>
      </div>
      <div class="water-cups">
        ${Array.from({ length: 8 }, (_, i) => `
          <button type="button" class="cup ${i < cups ? 'filled' : ''}" data-action="log-water" data-cups="${i + 1}" aria-label="${i + 1} 杯水">
            ${icon('water', 18)}
          </button>`).join('')}
      </div>
      <div class="bar"><span style="width:${waterPct}%"></span></div>
      <p class="small muted" style="margin-top:8px">每杯约 ${cupMl} ml，哺乳期建议每天 ${waterGoal} ml 以上</p>
    </section>

    <section class="card record-card">
      <div class="record-head"><h3>睡眠</h3><span class="small muted">按实际睡眠估算</span></div>
      <div class="weight-row">
        <input type="number" inputmode="decimal" step="0.5" min="0" max="24" data-log="sleepHours" value="${log.sleepHours ?? ''}" placeholder="6.5" />
        <span class="unit">小时</span>
      </div>
      <div class="quick-chips">
        ${[5, 6, 7, 8, 9].map((h) => `<button type="button" class="chip ${Number(log.sleepHours) === h ? 'active' : ''}" data-action="log-sleep" data-value="${h}">${h} 小时</button>`).join('')}
      </div>
    </section>

    <section class="card record-card">
      <div class="record-head"><h3>心情</h3><span class="small muted">允许自己偶尔低落</span></div>
      <div class="mood-row">
        ${S.meta.logOptions.moods.map((m) => `
          <button type="button" class="mood ${log.mood === m ? 'active' : ''}" data-action="log-option" data-field="mood" data-value="${esc(m)}">
            <span>${S.meta.logOptions.moodEmoji[m] || '🙂'}</span>${esc(m)}
          </button>`).join('')}
      </div>
    </section>

    <section class="card record-card">
      <div class="record-head"><h3>身体感受</h3><span class="small muted">异常时请及时就医</span></div>
      ${[
        ['lochia', '恶露'],
        ['wound', '伤口'],
        ['bowel', '排便']
      ].map(([field, label]) => `
        <div class="feeling-row">
          <span class="feeling-label">${label}</span>
          <div class="option-mini-group">
            ${S.meta.logOptions[field].map((v) => `<button type="button" class="option-mini ${log[field] === v ? 'active' : ''}" data-action="log-option" data-field="${field}" data-value="${esc(v)}">${esc(v)}</button>`).join('')}
          </div>
        </div>`).join('')}
    </section>

    <section class="card record-card">
      <div class="record-head"><h3>今日备注</h3><span class="small muted">写下想记住的事</span></div>
      <textarea class="note-input" data-log="note" maxlength="300" placeholder="例如：今天奶量不错，午后补了一觉…">${esc(log.note || '')}</textarea>
    </section>

    <div class="save-bar">
      <span class="dirty-hint" data-dirty>${S.logDirty ? '有未保存的修改' : '记录会自动保存在本机账号'}</span>
      <button class="btn btn-primary" type="button" data-action="save-log">保存记录</button>
    </div>

    <section class="card calendar-card">
      <div class="section-head" style="padding:0 0 10px">
        <h2>恢复日历</h2>
        <span class="small muted">近 42 天</span>
      </div>
      ${recoveryCalendarHTML()}
      <div class="calendar-legend">
        <span><i class="dot log"></i>有记录</span>
        <span><i class="dot complete"></i>餐单完成</span>
        <span><i class="dot today"></i>今天</span>
      </div>
    </section>

    <section class="card trend-card">
      <div class="section-head" style="padding:0 0 6px">
        <h2>最近趋势</h2>
      </div>
      ${waterChartHTML()}
      ${sleepChartHTML()}
    </section>`;
}

function recoveryCalendarHTML() {
  const today = todayStr();
  const delivery = S.profile?.deliveryDate;
  const postpartum = delivery ? daysBetween(delivery, today) + 1 : 99;
  const start = postpartum > 42 ? addDays(today, -41) : delivery || addDays(today, -41);
  const cells = Array.from({ length: 42 }, (_, i) => {
    const date = addDays(start, i);
    const log = findLog(date);
    const summary = S.plan?.dayList?.find((d) => d.date === date);
    const future = date > today;
    const classes = [
      'calendar-cell',
      log ? 'has-log' : '',
      summary?.complete ? 'complete' : '',
      date === today ? 'is-today' : '',
      future ? 'future' : '',
      date === S.recordDate ? 'selected' : ''
    ].filter(Boolean).join(' ');
    return `<button type="button" class="${classes}" ${future ? 'disabled' : ''} data-action="log-date" data-date="${date}" title="${dateLabelCN(date)}">
      <span class="day-num">${Number(date.slice(8, 10))}</span>
      <i class="day-dot"></i>
    </button>`;
  });
  return `<div class="calendar-grid">${cells.join('')}</div>`;
}



function groceryHTML() {
  const g = S.grocery;
  const viewChips = [
    { key: 'day', label: '今日' },
    { key: 'week', label: '本周' },
    { key: 'all', label: S.plan && S.plan.days > 7 ? `全部 ${S.plan.days} 天` : '全部餐单' }
  ];

  let content = '';
  if (g.loading || !g.data) {
    content = `<div class="empty-card"><h3>正在汇总食材…</h3><p>把餐单里的食材按类别整理成采购清单。</p></div>`;
  } else if (!g.data.total) {
    content = `
      <div class="empty-card">
        <h3>这个范围还没有食材</h3>
        <p>先回到今日生成餐单，采购清单会自动汇总食材与用量。</p>
        <button class="btn btn-primary" type="button" data-action="tab" data-tab="today">去看看今日餐单</button>
      </div>`;
  } else {
    const pct = Math.round((g.data.checked / g.data.total) * 100);
    const visibleGroups = g.data.groups
      .map((group) => ({ ...group, items: group.items.filter((item) => !g.hideChecked || !item.checked) }))
      .filter((group) => group.items.length);
    content = `
      <section class="card grocery-summary">
        <div>
          <div class="num">${g.data.checked}<span> / ${g.data.total}</span></div>
          <p>已采购 ${pct}%${g.data.checked === g.data.total ? ' · 全部买齐，可以开火了' : ' · 买齐后记得勾选'}</p>
          <div class="bar"><span style="width:${pct}%"></span></div>
        </div>
      </section>
      <div class="grocery-tools">
        <button class="tool-btn" type="button" data-action="copy-grocery">${icon('copy', 14)} 复制清单</button>
        <button class="tool-btn ${g.hideChecked ? 'active' : ''}" type="button" data-action="toggle-hide-checked">
          ${icon('check', 14)} ${g.hideChecked ? '显示已购' : '隐藏已购'}
        </button>
      </div>
      ${visibleGroups.length ? visibleGroups.map((group) => `
        <section class="grocery-group">
          <header><h3>${esc(group.category)}</h3><span>${group.items.length} 项</span></header>
          ${group.items.map((item) => `
            <label class="check-row">
              <input type="checkbox" data-check-key="${esc(item.key)}" ${item.checked ? 'checked' : ''} />
              <span class="name">${esc(item.name)}</span>
              <span class="amt">${esc(item.amountText)}</span>
            </label>`).join('')}
        </section>`).join('') : '<div class="empty-card" style="padding:26px 20px"><h3>已购项目都藏起来了</h3><p>点击「显示已购」可以重新查看。</p></div>'}
      <div class="grocery-actions">
        <button class="btn btn-ghost btn-sm" type="button" data-action="clear-grocery">清空勾选</button>
      </div>`;
  }

  return `
    <header class="page-head">
      <h1>采购清单</h1>
      <p>按餐单自动汇总食材与用量，买菜不漏项</p>
    </header>
    <div class="chip-row">
      ${viewChips.map((v) => `<button class="chip ${g.view === v.key ? 'active' : ''}" type="button" data-action="grocery-view" data-view="${v.key}">${esc(v.label)}</button>`).join('')}
    </div>
    ${content}`;
}

async function loadGrocery(silent = false) {
  const g = S.grocery;
  if (!silent) {
    g.loading = true;
    if (S.tab === 'grocery') renderMain({ keepScroll: true });
  }
  try {
    let start = todayStr();
    let days = 1;
    if (g.view !== 'day' && S.plan) {
      start = S.plan.startDate;
      days = g.view === 'week' ? Math.min(7, S.plan.days) : S.plan.days;
    }
    const data = await api(`/grocery?start=${start}&days=${days}&view=${g.view}`);
    g.data = data;
  } catch (err) {
    handleError(err);
  } finally {
    g.loading = false;
    if (S.tab === 'grocery') renderMain({ keepScroll: true });
  }
}

/* ------------------------------ 我的 ------------------------------ */

function meHTML() {
  const p = S.profile || {};
  const stats = S.stats || {};
  const stage = S.stage || {};
  const initial = (p.name || S.me?.name || '暖').slice(0, 1);
  return `
    <header class="page-head">
      <h1>我的</h1>
      <p>调养记录与个人偏好</p>
    </header>
    <section class="profile-card">
      <div class="avatar-big">${esc(initial)}</div>
      <div>
        <h2>${esc(p.name || S.me?.name || '宝妈')}</h2>
        <p>产后第 ${stage.postpartumDay || postpartumDays(p.deliveryDate)} 天 · ${esc(stage.week || '')}<br />${esc(p.deliveryType || '')} · ${esc(p.feeding || '')}</p>
      </div>
      <button class="btn btn-soft btn-sm" type="button" data-action="open-edit">编辑</button>
    </section>
    <section class="stage-card">
      <div class="row">
        <h3>${esc(stage.title || '温和调养')}</h3>
        <span>${esc(stage.days || '')}</span>
      </div>
      <p>${esc(stage.focus || '')}</p>
    </section>
    <div class="stat-grid">
      <div class="stat-cell"><strong>${stats.planDays || 0}<span>天</span></strong><p>计划餐单</p></div>
      <div class="stat-cell"><strong>${stats.completionRate || 0}<span>%</span></strong><p>打卡完成率</p></div>
      <div class="stat-cell"><strong>${stats.streak || 0}<span>天</span></strong><p>连续打卡</p></div>
      <div class="stat-cell"><strong>${(S.favorites || []).length}<span>道</span></strong><p>收藏食谱</p></div>
    </div>
    <div class="card menu-list" style="padding:4px 0">
      <button class="menu-row" type="button" data-action="open-favorites">
        <span class="ico">${icon('heart', 18)}</span>我的收藏
        <span class="chev">${icon('chevron', 16)}</span>
      </button>
      <button class="menu-row" type="button" data-action="open-articles">
        <span class="ico">${icon('book', 18)}</span>月子知识库
        <span class="chev">${icon('chevron', 16)}</span>
      </button>
      <button class="menu-row" type="button" data-action="open-generate">
        <span class="ico">${icon('sparkle', 18)}</span>生成 / 重新生成餐单
        <span class="chev">${icon('chevron', 16)}</span>
      </button>
      <button class="menu-row" type="button" data-action="open-edit">
        <span class="ico">${icon('edit', 18)}</span>偏好与忌口设置
        <span class="chev">${icon('chevron', 16)}</span>
      </button>
      <button class="menu-row" type="button" data-action="open-password">
        <span class="ico">${icon('lock', 18)}</span>修改密码
        <span class="chev">${icon('chevron', 16)}</span>
      </button>
      <button class="menu-row" type="button" data-action="export-data">
        <span class="ico">${icon('download', 18)}</span>导出我的数据
        <span class="chev">${icon('chevron', 16)}</span>
      </button>
      <button class="menu-row" type="button" data-action="open-about">
        <span class="ico">${icon('info', 18)}</span>关于暖月与免责声明
        <span class="chev">${icon('chevron', 16)}</span>
      </button>
      <button class="menu-row danger" type="button" data-action="logout">
        <span class="ico">${icon('logout', 18)}</span>退出登录
        <span class="chev">${icon('chevron', 16)}</span>
      </button>
    </div>
    <p class="small muted" style="text-align:center;padding:10px 20px 26px;line-height:1.8">暖月 · 月子餐智能搭配 v2.0<br />饮食建议仅供参考，具体请遵医嘱</p>`;
}

/* ------------------------------ 弹层 ------------------------------ */

function openSheet(sheet) {
  S.sheet = sheet;
  renderSheet();
}

function closeSheet() {
  S.sheet = null;
  $('#overlay-root').innerHTML = '';
}

function renderSheet() {
  const root = $('#overlay-root');
  if (!S.sheet) {
    root.innerHTML = '';
    return;
  }
  let inner = '';
  let label = '';
  if (S.sheet.type === 'recipe') {
    const recipe = S.recipes.find((r) => r.id === S.sheet.id);
    if (!recipe) {
      closeSheet();
      return;
    }
    label = '食谱详情';
    inner = recipeSheetHTML(recipe);
  } else if (S.sheet.type === 'edit') {
    label = '偏好设置';
    inner = editSheetHTML();
  } else if (S.sheet.type === 'about') {
    label = '关于暖月';
    inner = aboutSheetHTML();
  } else if (S.sheet.type === 'generate') {
    label = '生成餐单';
    inner = generateSheetHTML();
  } else if (S.sheet.type === 'password') {
    label = '修改密码';
    inner = passwordSheetHTML();
  } else if (S.sheet.type === 'articles') {
    label = '月子知识';
    inner = articlesSheetHTML();
  } else if (S.sheet.type === 'article') {
    label = '知识详情';
    inner = articleSheetHTML();
  }

  root.innerHTML = `
    <div class="sheet-wrap">
      <div class="sheet-backdrop" data-action="close-sheet"></div>
      <div class="sheet" role="dialog" aria-label="${esc(label)}">
        <div class="sheet-handle"></div>
        ${inner}
      </div>
    </div>`;
}

function applyTargets(r) {
  if (!S.plan?.dayList?.length) return [];
  const date = S.plan.dayList.some((d) => d.date === S.selectedDate) ? S.selectedDate : S.plan.startDate;
  const enabled = S.profile?.slots || [];
  return S.meta.slots
    .filter((s) => enabled.includes(s.key) && s.courses.includes(r.course) && r.slots.includes(s.key))
    .map((s) => ({ slot: s.key, label: s.label, date, course: r.course }));
}

function recipeSheetHTML(r) {
  const fav = S.favorites.includes(r.id);
  const stageText = r.stages.map((n) => S.meta.stages.find((s) => s.stage === n)?.week || '').filter(Boolean).join('、');
  const slotText = r.slots.map((s) => slotMeta(s).label).join('、');
  const targets = applyTargets(r);
  return `
    <img class="detail-cover" src="${r.image}" alt="${esc(r.name)}" />
    <div class="sheet-head" style="padding-bottom:0">
      <div>
        <div class="small muted">${courseLabel(r.course)} · 约 ${r.time} 分钟</div>
      </div>
      <button class="sheet-close" type="button" data-action="close-sheet" aria-label="关闭">${icon('close', 17)}</button>
    </div>
    <div class="detail-body">
      <div class="detail-title-row">
        <h2>${esc(r.name)}</h2>
        <button class="fav-btn ${fav ? 'on' : ''}" type="button" data-action="sheet-fav" data-id="${r.id}" aria-label="收藏" style="position:static;background:var(--bg-deep);width:38px;height:38px;flex:0 0 auto">
          ${icon('heart', 18)}
        </button>
      </div>
      <div class="tag-row">${r.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      <div class="nutri-grid">
        <div><strong>${r.kcal}</strong><span>kcal</span></div>
        <div><strong>${r.protein}g</strong><span>蛋白质</span></div>
        <div><strong>${r.carbs}g</strong><span>碳水</span></div>
        <div><strong>${r.fat}g</strong><span>脂肪</span></div>
      </div>
      ${targets.length ? `
        <section class="apply-block">
          <h3>加入餐单</h3>
          <p class="small muted">放进 ${dateLabelCN(targets[0].date)} 的某一餐，打卡状态会重置。</p>
          <div class="apply-buttons">
            ${targets.map((t) => `<button class="apply-btn" type="button" data-action="apply-recipe" data-id="${r.id}" data-date="${t.date}" data-slot="${t.slot}" data-course="${t.course}">${esc(t.label)}</button>`).join('')}
          </div>
        </section>` : ''}
      <section class="detail-section">
        <h3>食材份量</h3>
        <ul class="ing-list">
          ${r.ingredients.map(([name, amount, unit]) => `<li><span>${esc(name)}</span><span>${amount} ${esc(unit)}</span></li>`).join('')}
        </ul>
      </section>
      <section class="detail-section">
        <h3>做法步骤</h3>
        <ol class="steps">
          ${r.steps.map((s, i) => `<li><span class="n">${i + 1}</span><span>${esc(s)}</span></li>`).join('')}
        </ol>
      </section>
      <div class="tip-box">小贴士：${esc(r.tips)}</div>
      <p class="detail-meta">适合阶段：${esc(stageText)}<br />适合餐次：${esc(slotText)} · 营养数据为每份估算值</p>
    </div>
    <div class="sheet-actions">
      <button class="btn ${fav ? 'btn-soft' : 'btn-primary'}" type="button" data-action="sheet-fav" data-id="${r.id}">
        ${fav ? '已收藏，点击取消' : '收藏这道菜'}
      </button>
    </div>`;
}

function editSheetHTML() {
  const e = S.edit;
  if (!e) return '';
  return `
    <div class="sheet-head">
      <h2>偏好设置</h2>
      <button class="sheet-close" type="button" data-action="close-sheet" aria-label="关闭">${icon('close', 17)}</button>
    </div>
    <form data-form="edit-profile">
      <div class="edit-section">
        <h3>基本情况</h3>
        <label class="field">
          <span>称呼</span>
          <input data-edit="name" maxlength="20" value="${esc(e.name)}" />
        </label>
        <label class="field">
          <span>分娩日期</span>
          <input type="date" data-edit="deliveryDate" value="${esc(e.deliveryDate)}" max="${todayStr()}" />
        </label>
        <span class="small muted" style="display:block;margin-top:8px">产后第 ${postpartumDays(e.deliveryDate)} 天 · ${esc(stageByNumber(stageNumberForDay(postpartumDays(e.deliveryDate)))?.week || '')}</span>
      </div>
      <div class="edit-section">
        <h3>分娩方式</h3>
        <div class="option-grid cols-2">
          ${(S.meta.deliveryTypes || []).map((t) => `<button type="button" class="option ${e.deliveryType === t ? 'active' : ''}" data-action="edit-option" data-field="deliveryType" data-value="${esc(t)}">${esc(t)}</button>`).join('')}
        </div>
      </div>
      <div class="edit-section">
        <h3>喂养方式</h3>
        <div class="option-grid">
          ${(S.meta.feedings || []).map((t) => `<button type="button" class="option ${e.feeding === t ? 'active' : ''}" data-action="edit-option" data-field="feeding" data-value="${esc(t)}">${esc(t)}</button>`).join('')}
        </div>
      </div>
      <div class="edit-section">
        <h3>忌口与过敏</h3>
        <div class="option-grid">
          ${(S.meta.restrictions || []).map((r) => `<button type="button" class="option ${e.restrictions.includes(r.key) ? 'active' : ''}" data-action="edit-restrict" data-key="${esc(r.key)}">${esc(r.label)}</button>`).join('')}
        </div>
      </div>
      <div class="edit-section">
        <h3>口味偏好</h3>
        <div class="option-grid">
          ${(S.meta.tastes || []).map((t) => `<button type="button" class="option ${e.taste === t ? 'active' : ''}" data-action="edit-option" data-field="taste" data-value="${esc(t)}">${esc(t)}</button>`).join('')}
        </div>
      </div>
      <div class="edit-section">
        <h3>每日热量目标</h3>
        <div class="option-grid cols-2">
          ${(S.meta.caloriePresets || []).map((p) => `<button type="button" class="option ${Number(e.calorieGoal) === p.value ? 'active' : ''}" data-action="edit-option" data-field="calorieGoal" data-value="${p.value}">${esc(p.label)}<small>${esc(p.desc)}</small></button>`).join('')}
        </div>
      </div>
      <div class="edit-section">
        <h3>每日餐次</h3>
        ${(S.meta.slots || []).map((s) => {
          const on = e.slots.includes(s.key);
          return `
            <div class="switch-row">
              <span class="label">${esc(s.label)}<small>${esc(s.time)}</small></span>
              <button type="button" class="switch ${on ? 'on' : ''}" data-action="edit-slot" data-key="${esc(s.key)}" aria-label="切换${esc(s.label)}"></button>
            </div>`;
        }).join('')}
      </div>
      <p class="sheet-note">修改分娩日期、忌口或餐次后，会自动按新偏好重新生成 7 天餐单。</p>
      <div class="sheet-actions" style="padding-bottom:6px">
        <button class="btn btn-primary" type="submit">保存设置</button>
      </div>
    </form>`;
}

function aboutSheetHTML() {
  return `
    <div class="sheet-head">
      <h2>关于暖月</h2>
      <button class="sheet-close" type="button" data-action="close-sheet" aria-label="关闭">${icon('close', 17)}</button>
    </div>
    <div class="sheet-body about-text" style="padding-bottom:18px">
      <p><strong>暖月</strong>是一份按产后阶段整理的月子餐搭配工具。它根据你的产后天数、分娩方式、喂养方式与忌口，从食谱库中组合三餐三点，并同步生成采购清单。</p>
      <p><strong>阶段说明：</strong>第 1 周以排恶露、清淡易消化为主；第 2 周修复组织、补血养气；第 3-4 周滋补催乳；第 5 周起逐步恢复均衡饮食。</p>
      <p><strong>免责声明：</strong>食谱、营养数据与功效说明均为日常饮食参考，不构成医疗建议。产后饮食需结合个人体质、伤口恢复、哺乳情况和医生建议调整；如出现过敏、发热、伤口异常、恶露异常等情况，请及时就医。</p>
      <p><strong>忌口说明：</strong>勾选忌口或过敏项后，生成餐单与换菜时会自动排除相关食材；母乳喂养或混合喂养会默认排除含酒精的菜品。</p>
      <p><strong>数据说明：</strong>账号、餐单与打卡记录保存在服务端实例中，仅用于功能演示。请勿填写身份证号、住址等敏感个人信息。</p>
      <p class="muted">暖月 v2.0 · 用一日三餐，好好照顾自己。</p>
    </div>`;
}

function generateSheetHTML() {
  return `
    <div class="sheet-head">
      <h2>生成餐单</h2>
      <button class="sheet-close" type="button" data-action="close-sheet" aria-label="关闭">${icon('close', 17)}</button>
    </div>
    <div class="sheet-body">
      <p class="sheet-lead">重新生成会替换当前餐单，并清空已做的打卡与跳过状态；调养记录会保留。</p>
      <div class="generate-options">
        <button class="gen-option" type="button" data-action="do-generate" data-days="7">
          <span class="gen-icon">${icon('sun', 20)}</span>
          <span><strong>7 天餐单</strong><small>一周不重样，适合先体验</small></span>
          ${icon('chevron', 16)}
        </button>
        <button class="gen-option" type="button" data-action="do-generate" data-days="28">
          <span class="gen-icon">${icon('calendar', 20)}</span>
          <span><strong>28 天完整餐单</strong><small>覆盖四个阶段，按周推进</small></span>
          ${icon('chevron', 16)}
        </button>
      </div>
      <p class="sheet-note">生成时会自动结合你的产后阶段、忌口、喂养方式和每日餐次。</p>
    </div>`;
}

function passwordSheetHTML() {
  return `
    <div class="sheet-head">
      <h2>修改密码</h2>
      <button class="sheet-close" type="button" data-action="close-sheet" aria-label="关闭">${icon('close', 17)}</button>
    </div>
    <form data-form="password">
      <div class="edit-section" style="margin-top:4px">
        <label class="field">
          <span>原密码</span>
          <input name="oldPassword" type="password" autocomplete="current-password" required />
        </label>
        <label class="field">
          <span>新密码</span>
          <input name="newPassword" type="password" autocomplete="new-password" placeholder="至少 6 位" required />
        </label>
        <label class="field">
          <span>确认新密码</span>
          <input name="confirmPassword" type="password" autocomplete="new-password" required />
        </label>
      </div>
      <p class="form-error" id="password-error" style="padding:0 20px"></p>
      <div class="sheet-actions" style="padding-bottom:8px">
        <button class="btn btn-primary" type="submit">保存新密码</button>
      </div>
    </form>`;
}

function articlesSheetHTML() {
  return `
    <div class="sheet-head">
      <h2>月子知识库</h2>
      <button class="sheet-close" type="button" data-action="close-sheet" aria-label="关闭">${icon('close', 17)}</button>
    </div>
    <div class="sheet-body" style="padding-bottom:18px">
      ${!S.articles ? '<p class="small muted" style="padding:24px 0;text-align:center">正在加载…</p>' : S.articles.map((a) => `
        <button class="article-item" type="button" data-action="open-article" data-id="${a.id}">
          <span class="article-tag">${esc(a.tag)}</span>
          <strong>${esc(a.title)}</strong>
          <p>${esc(a.summary)}</p>
          <span class="article-meta">${a.minutes} 分钟阅读 ${icon('chevron', 13)}</span>
        </button>`).join('')}
    </div>`;
}

function articleSheetHTML() {
  const a = S.article;
  if (!a) {
    return `
      <div class="sheet-head">
        <h2>知识详情</h2>
        <button class="sheet-close" type="button" data-action="close-sheet" aria-label="关闭">${icon('close', 17)}</button>
      </div>
      <p class="small muted" style="padding:30px 20px;text-align:center">正在加载…</p>`;
  }
  return `
    <div class="sheet-head">
      <button class="sheet-back" type="button" data-action="back-articles" aria-label="返回知识列表">${icon('arrowLeft', 17)}</button>
      <h2>知识详情</h2>
      <button class="sheet-close" type="button" data-action="close-sheet" aria-label="关闭">${icon('close', 17)}</button>
    </div>
    <div class="sheet-body article-detail">
      <span class="article-tag">${esc(a.tag)}</span>
      <h2>${esc(a.title)}</h2>
      <p class="article-lead">${esc(a.summary)}</p>
      ${a.sections.map((sec) => `
        <section>
          <h3>${esc(sec.h)}</h3>
          ${(sec.p || []).map((p) => `<p>${esc(p)}</p>`).join('')}
          ${(sec.list || []).length ? `<ul class="article-list">${sec.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}
        </section>`).join('')}
      <div class="tip-box">以上内容为日常饮食与护理参考，不构成医疗建议。身体不适请及时就医。</div>
    </div>`;
}

/* ------------------------------ 操作 ------------------------------ */

async function switchTab(tab) {
  if (S.busy) return;
  S.tab = tab;
  closeSheet();
  if (tab === 'grocery' && !S.grocery.data) {
    S.grocery.loading = true;
    renderMain();
    await loadGrocery();
    return;
  }
  if (tab === 'records') {
    renderMain();
    if (!S.logsLoaded) await loadLogs();
    return;
  }
  renderMain();
}

async function selectDate(date) {
  if (S.busy || date === S.selectedDate) return;
  S.busy = true;
  try {
    await loadPlan(date);
    renderMain({ keepScroll: true });
  } catch (err) {
    handleError(err);
  } finally {
    S.busy = false;
  }
}

async function doSwap(el) {
  if (S.busy) return;
  S.busy = true;
  el.style.opacity = '0.4';
  try {
    const data = await api('/plan/swap', {
      method: 'POST',
      body: { date: el.dataset.date, slot: el.dataset.slot, course: el.dataset.course }
    });
    S.planDay = data.day;
    S.plan = data.plan;
    S.stats = data.stats;
    S.grocery.data = null;
    renderMain({ keepScroll: true });
    toast('已换一道，口味换换更开胃');
  } catch (err) {
    handleError(err);
  } finally {
    S.busy = false;
  }
}

async function doEat(el) {
  if (S.busy) return;
  S.busy = true;
  el.style.opacity = '0.4';
  try {
    const date = el.dataset.date;
    const slot = el.dataset.slot;
    const wasDone = (S.planDay?.eaten || []).includes(slot);
    const data = await api('/plan/eat', {
      method: 'POST',
      body: { date, slot, eaten: !wasDone }
    });
    S.planDay = data.day;
    S.plan = data.plan;
    S.stats = data.stats;
    renderMain({ keepScroll: true });
    if (!wasDone) toast('已打卡，记得也照顾好自己');
  } catch (err) {
    handleError(err);
  } finally {
    S.busy = false;
  }
}

async function doSkip(el) {
  if (S.busy) return;
  S.busy = true;
  el.style.opacity = '0.4';
  try {
    const date = el.dataset.date;
    const slot = el.dataset.slot;
    const wasSkipped = (S.planDay?.skipped || []).includes(slot);
    const data = await api('/plan/skip', {
      method: 'POST',
      body: { date, slot, skipped: !wasSkipped }
    });
    S.planDay = data.day;
    S.plan = data.plan;
    S.stats = data.stats;
    renderMain({ keepScroll: true });
    toast(wasSkipped ? '已取消跳过' : '这一餐已跳过');
  } catch (err) {
    handleError(err);
  } finally {
    S.busy = false;
  }
}

async function doApplyRecipe(el) {
  if (S.busy) return;
  S.busy = true;
  try {
    const data = await api('/plan/apply', {
      method: 'POST',
      body: {
        date: el.dataset.date,
        slot: el.dataset.slot,
        course: el.dataset.course,
        recipeId: el.dataset.id
      }
    });
    S.planDay = data.day;
    S.plan = data.plan;
    S.stats = data.stats;
    S.grocery.data = null;
    closeSheet();
    renderMain({ keepScroll: true });
    toast('已加入餐单');
  } catch (err) {
    handleError(err);
  } finally {
    S.busy = false;
  }
}

async function doFavorite(id) {
  if (!S.me) {
    toast('请先登录', 'error');
    return;
  }
  try {
    const data = await api(`/recipes/${id}/favorite`, { method: 'POST' });
    S.favorites = data.favorites;
    if (S.stats) S.stats.favoriteCount = S.favorites.length;
    if (S.sheet?.type === 'recipe') renderSheet();
    renderMain({ keepScroll: true });
    toast(data.favorited ? '已加入收藏' : '已取消收藏');
  } catch (err) {
    handleError(err);
  }
}

async function generatePlan(days = 7) {
  if (S.busy) return;
  S.busy = true;
  closeSheet();
  try {
    const data = await api('/plan/generate', {
      method: 'POST',
      body: { startDate: todayStr(), days }
    });
    S.plan = data.plan;
    S.planDay = data.day;
    S.stats = data.stats;
    S.selectedDate = data.day.date;
    S.grocery.data = null;
    S.grocery.view = 'week';
    if (S.tab === 'grocery') await loadGrocery(true);
    renderMain();
    toast(`${days} 天餐单已准备好`);
  } catch (err) {
    handleError(err);
  } finally {
    S.busy = false;
  }
}

async function saveProfile() {
  const e = S.edit;
  if (!e.name.trim()) {
    toast('称呼不能为空', 'error');
    return;
  }
  if (!e.deliveryDate) {
    toast('请选择分娩日期', 'error');
    return;
  }
  if (!e.slots.length) {
    toast('至少保留一餐', 'error');
    return;
  }
  try {
    const res = await api('/profile', {
      method: 'PUT',
      body: {
        name: e.name.trim(),
        deliveryDate: e.deliveryDate,
        deliveryType: e.deliveryType,
        feeding: e.feeding,
        restrictions: e.restrictions,
        taste: e.taste,
        calorieGoal: Number(e.calorieGoal),
        slots: e.slots
      }
    });
    S.profile = res.profile;
    S.stage = res.stage;
    S.plan = res.plan;
    if (S.me) S.me.name = res.profile.name;
    if (res.needsRegenerate) {
      const gen = await api('/plan/generate', { method: 'POST', body: { startDate: todayStr(), days: 7 } });
      S.plan = gen.plan;
      S.planDay = gen.day;
      S.stats = gen.stats;
      S.selectedDate = gen.day.date;
      S.grocery.data = null;
    }
    closeSheet();
    if (S.tab === 'grocery') await loadGrocery(true);
    renderMain({ keepScroll: true });
    toast(res.needsRegenerate ? '已按新偏好更新餐单' : '设置已保存');
  } catch (err) {
    handleError(err);
  }
}

async function saveLog() {
  if (S.busy) return;
  S.busy = true;
  const date = S.recordDate;
  const payload = {
    weight: S.log.weight === '' || S.log.weight === null ? null : Number(S.log.weight),
    waterMl: Number(S.log.waterMl) || 0,
    sleepHours: S.log.sleepHours === '' || S.log.sleepHours === null ? null : Number(S.log.sleepHours),
    mood: S.log.mood || '',
    lochia: S.log.lochia || '',
    wound: S.log.wound || '',
    bowel: S.log.bowel || '',
    note: S.log.note || ''
  };
  try {
    const data = await api(`/logs/${date}`, { method: 'PUT', body: payload });
    const entry = data.log ? { date, ...data.log } : null;
    const idx = S.logs.findIndex((l) => l.date === date);
    if (entry) {
      if (idx >= 0) S.logs[idx] = entry;
      else S.logs.push(entry);
    } else if (idx >= 0) {
      S.logs.splice(idx, 1);
    }
    S.log = logWithDefaults(data.log);
    S.logDirty = false;
    if (data.stats) S.stats = data.stats;
    renderMain({ keepScroll: true });
    toast('今天的记录已保存');
  } catch (err) {
    handleError(err);
  } finally {
    S.busy = false;
  }
}

function selectLogDate(date) {
  if (!date || date > todayStr()) return;
  S.recordDate = date;
  S.log = logWithDefaults(findLog(date));
  S.logDirty = false;
  renderMain({ keepScroll: true });
}

function setLogField(field, value) {
  S.log[field] = value;
  S.logDirty = true;
  renderMain({ keepScroll: true });
}

function updateDirtyHint() {
  const el = $('[data-dirty]');
  if (el) el.textContent = S.logDirty ? '有未保存的修改' : '记录会自动保存在本机账号';
}

async function copyGrocery() {
  if (!S.grocery.data) return;
  const viewLabel = { day: '今日', week: '本周', all: '全部餐单' }[S.grocery.view] || '本周';
  const lines = [`暖月采购清单（${viewLabel}）`];
  for (const group of S.grocery.data.groups) {
    lines.push('', `【${group.category}】`);
    for (const item of group.items) {
      lines.push(`${item.checked ? '✓ ' : ''}${item.name} ${item.amountText}`);
    }
  }
  const text = lines.join('\n');
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    toast('采购清单已复制');
  } catch {
    toast('复制失败，请手动选择文字复制', 'error');
  }
}

async function exportData() {
  try {
    const res = await fetch('/api/export', {
      headers: S.token ? { Authorization: `Bearer ${S.token}` } : {}
    });
    if (!res.ok) throw new Error('导出失败');
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nuanyue-data-${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('数据已导出为 JSON 文件');
  } catch (err) {
    handleError(err);
  }
}

async function openArticles() {
  openSheet({ type: 'articles' });
  if (S.articles) return;
  try {
    const data = await api('/articles');
    S.articles = data.articles || [];
    if (S.sheet?.type === 'articles') renderSheet();
  } catch (err) {
    handleError(err);
  }
}

async function openArticle(id) {
  S.article = null;
  S.sheet = { type: 'article', id };
  renderSheet();
  try {
    const data = await api(`/articles/${id}`);
    S.article = data.article;
    if (S.sheet?.type === 'article' && S.sheet.id === id) renderSheet();
  } catch (err) {
    handleError(err);
  }
}

async function submitPassword(form) {
  const fd = new FormData(form);
  const oldPassword = String(fd.get('oldPassword') || '');
  const newPassword = String(fd.get('newPassword') || '');
  const confirmPassword = String(fd.get('confirmPassword') || '');
  const errBox = $('#password-error');
  errBox.textContent = '';
  if (newPassword !== confirmPassword) {
    errBox.textContent = '两次输入的新密码不一致';
    return;
  }
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  try {
    await api('/auth/password', { method: 'POST', body: { oldPassword, newPassword } });
    closeSheet();
    toast('密码已更新');
  } catch (err) {
    errBox.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
}

async function submitOnboarding() {
  if (!onbValidate()) return;
  const d = S.onb.data;
  const btn = $('[data-action="onb-submit"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '正在生成餐单…';
  }
  try {
    const res = await api('/profile', {
      method: 'PUT',
      body: {
        name: d.name.trim(),
        deliveryDate: d.deliveryDate,
        deliveryType: d.deliveryType,
        feeding: d.feeding,
        restrictions: d.restrictions,
        taste: d.taste,
        calorieGoal: Number(d.calorieGoal),
        slots: d.slots,
        onboarded: true
      }
    });
    S.profile = res.profile;
    S.stage = res.stage;
    if (S.me) S.me.name = res.profile.name;
    const gen = await api('/plan/generate', { method: 'POST', body: { startDate: todayStr(), days: 7 } });
    S.plan = gen.plan;
    S.planDay = gen.day;
    S.stats = gen.stats;
    S.selectedDate = gen.day.date;
    S.tab = 'today';
    renderMain();
    toast('餐单已生成，愿你这一个月被好好照顾');
  } catch (err) {
    handleError(err);
    if (btn) {
      btn.disabled = false;
      btn.textContent = '生成我的 7 天餐单';
    }
  }
}

/* ------------------------------ 事件 ------------------------------ */

async function onClick(e) {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;

  switch (action) {
    case 'auth-mode':
      S.authMode = el.dataset.mode;
      renderAuth();
      break;
    case 'demo-login':
      doDemoLogin(el);
      break;
    case 'tab':
      switchTab(el.dataset.tab);
      break;
    case 'select-date':
      selectDate(el.dataset.date);
      break;
    case 'swap':
      doSwap(el);
      break;
    case 'eat':
      doEat(el);
      break;
    case 'skip':
      doSkip(el);
      break;
    case 'week-tab': {
      if (!S.plan) break;
      const idx = Number(el.dataset.index);
      selectDate(addDays(S.plan.startDate, idx * 7));
      break;
    }
    case 'apply-recipe':
      doApplyRecipe(el);
      break;
    case 'open-recipe':
      openSheet({ type: 'recipe', id: el.dataset.id });
      break;
    case 'fav':
      doFavorite(el.dataset.id);
      break;
    case 'sheet-fav':
      doFavorite(el.dataset.id);
      break;
    case 'filter-course':
      S.filter.course = el.dataset.value;
      renderMain({ keepScroll: true });
      break;
    case 'filter-stage':
      S.filter.stage = el.dataset.value;
      renderMain({ keepScroll: true });
      break;
    case 'filter-effect':
      S.filter.effect = el.dataset.value;
      renderMain({ keepScroll: true });
      break;
    case 'filter-fav':
      S.filter.fav = !S.filter.fav;
      renderMain({ keepScroll: true });
      break;
    case 'open-favorites':
      S.tab = 'recipes';
      S.filter.fav = true;
      S.filter.course = 'all';
      S.filter.stage = 'all';
      S.filter.effect = 'all';
      renderMain();
      break;
    case 'grocery-view':
      if (S.grocery.view === el.dataset.view) break;
      S.grocery.view = el.dataset.view;
      S.grocery.data = null;
      await loadGrocery();
      break;
    case 'clear-grocery':
      if (S.busy) break;
      if (!S.grocery.data || !S.grocery.data.checked) break;
      S.busy = true;
      try {
        await api('/grocery/clear', { method: 'POST' });
        S.grocery.data = null;
        await loadGrocery();
        toast('已清空勾选');
      } catch (err) {
        handleError(err);
      } finally {
        S.busy = false;
      }
      break;
    case 'generate-plan':
      openSheet({ type: 'generate' });
      break;
    case 'open-generate':
      openSheet({ type: 'generate' });
      break;
    case 'do-generate':
      generatePlan(Number(el.dataset.days) || 7);
      break;
    case 'copy-grocery':
      copyGrocery();
      break;
    case 'toggle-hide-checked':
      S.grocery.hideChecked = !S.grocery.hideChecked;
      renderMain({ keepScroll: true });
      break;
    case 'log-prev':
      selectLogDate(addDays(S.recordDate, -1));
      break;
    case 'log-next':
      if (S.recordDate < todayStr()) selectLogDate(addDays(S.recordDate, 1));
      break;
    case 'log-today':
      selectLogDate(todayStr());
      break;
    case 'log-date':
      selectLogDate(el.dataset.date);
      break;
    case 'log-water': {
      const cups = Number(el.dataset.cups);
      const cupMl = S.meta.logOptions.waterCupMl;
      const current = Number(S.log.waterMl || 0);
      S.log.waterMl = current === cups * cupMl ? (cups - 1) * cupMl : cups * cupMl;
      S.logDirty = true;
      renderMain({ keepScroll: true });
      break;
    }
    case 'log-sleep':
      S.log.sleepHours = Number(el.dataset.value);
      S.logDirty = true;
      renderMain({ keepScroll: true });
      break;
    case 'log-option':
      setLogField(el.dataset.field, el.dataset.value);
      break;
    case 'save-log':
      saveLog();
      break;
    case 'view-day-plan': {
      const date = el.dataset.date;
      if (!S.plan?.dayList.some((d) => d.date === date)) break;
      S.tab = 'today';
      if (date === S.selectedDate) renderMain();
      else selectDate(date);
      break;
    }
    case 'open-password':
      openSheet({ type: 'password' });
      break;
    case 'open-articles':
      openArticles();
      break;
    case 'open-article':
      openArticle(el.dataset.id);
      break;
    case 'back-articles':
      openSheet({ type: 'articles' });
      break;
    case 'export-data':
      exportData();
      break;
    case 'open-edit':
      S.edit = {
        name: S.profile.name || '',
        deliveryDate: S.profile.deliveryDate,
        deliveryType: S.profile.deliveryType || '顺产',
        feeding: S.profile.feeding || '混合喂养',
        restrictions: [...(S.profile.restrictions || [])],
        taste: S.profile.taste || '适中',
        calorieGoal: S.profile.calorieGoal || 2600,
        slots: [...(S.profile.slots || S.meta.slots.map((s) => s.key))]
      };
      openSheet({ type: 'edit' });
      break;
    case 'open-about':
      openSheet({ type: 'about' });
      break;
    case 'close-sheet':
      closeSheet();
      break;
    case 'logout':
      if (!window.confirm('确定退出登录吗？')) break;
      clearSession();
      renderAuth();
      toast('已退出登录');
      break;
    case 'onb-quick-date': {
      const n = Number(el.dataset.days);
      S.onb.data.deliveryDate = addDays(todayStr(), -n);
      renderOnboarding();
      break;
    }
    case 'onb-option': {
      const field = el.dataset.field;
      let value = el.dataset.value;
      if (field === 'calorieGoal') {
        value = Number(value);
        S.onb.calorieTouched = true;
      }
      if (field === 'feeding' && !S.onb.calorieTouched) {
        S.onb.data.calorieGoal = value === '纯母乳' ? 2800 : value === '混合喂养' ? 2600 : 2400;
      }
      S.onb.data[field] = value;
      renderOnboarding();
      break;
    }
    case 'onb-restrict': {
      const key = el.dataset.key;
      const list = S.onb.data.restrictions;
      const idx = list.indexOf(key);
      if (idx >= 0) list.splice(idx, 1);
      else list.push(key);
      renderOnboarding();
      break;
    }
    case 'onb-slot': {
      const key = el.dataset.key;
      const list = S.onb.data.slots;
      const idx = list.indexOf(key);
      if (idx >= 0) list.splice(idx, 1);
      else list.push(key);
      renderOnboarding();
      break;
    }
    case 'onb-next':
      if (!onbValidate()) break;
      S.onb.step += 1;
      renderOnboarding();
      break;
    case 'onb-back':
      if (S.onb.step > 1) {
        S.onb.step -= 1;
        renderOnboarding();
      }
      break;
    case 'onb-submit':
      submitOnboarding();
      break;
    case 'retry-boot':
      location.reload();
      break;
    case 'edit-option': {
      const field = el.dataset.field;
      let value = el.dataset.value;
      if (field === 'calorieGoal') value = Number(value);
      S.edit[field] = value;
      renderSheet();
      break;
    }
    case 'edit-restrict': {
      const key = el.dataset.key;
      const list = S.edit.restrictions;
      const idx = list.indexOf(key);
      if (idx >= 0) list.splice(idx, 1);
      else list.push(key);
      renderSheet();
      break;
    }
    case 'edit-slot': {
      const key = el.dataset.key;
      const list = S.edit.slots;
      const idx = list.indexOf(key);
      if (idx >= 0) list.splice(idx, 1);
      else list.push(key);
      renderSheet();
      break;
    }
    default:
      break;
  }
}

function onSubmit(e) {
  const form = e.target.closest('form[data-form]');
  if (!form) return;
  e.preventDefault();
  if (form.dataset.form === 'auth') doAuthSubmit(form);
  if (form.dataset.form === 'edit-profile') saveProfile();
  if (form.dataset.form === 'password') submitPassword(form);
}

function onInput(e) {
  const el = e.target;
  if (el.dataset.onb) {
    S.onb.data[el.dataset.onb] = el.value;
    if (el.dataset.onb === 'deliveryDate') renderOnboarding();
    return;
  }
  if (el.dataset.edit) {
    S.edit[el.dataset.edit] = el.value;
    return;
  }
  if (el.dataset.log) {
    S.log[el.dataset.log] = el.value;
    S.logDirty = true;
    updateDirtyHint();
    return;
  }
  if (el.id === 'recipe-search') {
    S.filter.q = el.value;
    const grid = $('#recipe-grid');
    if (grid) grid.innerHTML = recipeGridHTML();
    const count = $('.filter-bar .small.muted');
    if (count) count.textContent = `共 ${filteredRecipes().length} 道`;
  }
}

async function onChange(e) {
  const el = e.target;
  const key = el.dataset.checkKey;
  if (!key || !S.grocery.data) return;
  let item = null;
  for (const group of S.grocery.data.groups) {
    item = group.items.find((i) => i.key === key);
    if (item) break;
  }
  if (!item) return;
  item.checked = el.checked;
  S.grocery.data.checked = S.grocery.data.groups.flatMap((g) => g.items).filter((i) => i.checked).length;
  renderMain({ keepScroll: true });
  try {
    await api('/grocery/toggle', { method: 'POST', body: { key } });
  } catch (err) {
    item.checked = !item.checked;
    S.grocery.data.checked = S.grocery.data.groups.flatMap((g) => g.items).filter((i) => i.checked).length;
    renderMain({ keepScroll: true });
    handleError(err);
  }
}

/* ------------------------------ 提示 ------------------------------ */

function toast(message, type = 'info') {
  const root = $('#toast-root');
  const el = document.createElement('div');
  el.className = `toast ${type === 'error' ? 'error' : ''}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .25s ease, transform .25s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';
    setTimeout(() => el.remove(), 260);
  }, 2400);
}

function renderFatal() {
  const message = S.bootError?.message || '页面加载失败';
  $('#app').innerHTML = `
    <div class="boot" style="padding:30px;text-align:center">
      <div class="boot-mark">暖月</div>
      <p style="line-height:1.8">${esc(message)}</p>
      <button class="btn btn-primary" type="button" data-action="retry-boot" style="min-width:160px">重新加载</button>
    </div>`;
}

/* ------------------------------ 绑定 ------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', onClick);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  boot();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js?v=2').catch(() => {});
  }
});
