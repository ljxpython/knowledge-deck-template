const byId = (id) => document.getElementById(id);
const viewport = byId('deck-viewport');
const penCanvas = byId('pen-canvas');
const drawCanvas = byId('draw-canvas');
const ctx = {
  get pen() { return penCanvas ? penCanvas.getContext('2d') : null; },
  get draw() { return drawCanvas ? drawCanvas.getContext('2d') : null; }
};

let deck, index = 0, cleanup = null, requestId = 0, menuOpen = false, penOn = false, drawOn = false;
let currentDrawColor = '#f05d5e';
let colorPickerOpen = false;
const cache = new Map();

function resizeCanvases() {
  const dpr = window.devicePixelRatio || 1;
  [penCanvas, drawCanvas].forEach((canvas) => {
    if (!canvas) return;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
  });
  if (ctx.pen) ctx.pen.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (ctx.draw) ctx.draw.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (drawOn && drawStrokes.length) redrawDraw();
}

function pageFromHash() {
  const raw = location.hash.slice(1);
  if (!raw) return 0;
  if (/^\d+$/.test(raw)) {
    const num = parseInt(raw, 10) - 1;
    if (num >= 0 && num < deck.pages.length) return num;
  }
  const found = deck.pages.findIndex((page) => page.id === raw);
  return found < 0 ? 0 : found;
}

function setMenu(open) {
  menuOpen = open;
  byId('side-menu')?.classList.toggle('open', open);
  byId('menu-overlay')?.classList.toggle('visible', open);
}

function buildMenu() {
  const menu = byId('menu-list');
  if (!menu) return;
  menu.replaceChildren();
  deck.sections.forEach((section) => {
    const label = document.createElement('p');
    label.className = 'menu-section';
    label.textContent = section.title;
    menu.append(label);
    deck.pages.filter((page) => page.section === section.id).forEach((page) => {
      const button = document.createElement('button');
      button.className = 'menu-page';
      button.dataset.pageId = page.id;
      button.innerHTML = `<span>${String(deck.pages.indexOf(page) + 1).padStart(2, '0')}</span>${page.title}`;
      button.addEventListener('click', () => {
        setMenu(false);
        show(deck.pages.indexOf(page));
      });
      menu.append(button);
    });
  });
}

function updateChrome() {
  const total = deck.pages.length;
  // 顶部 3px 精细进度条
  const bar = byId('progress-bar');
  if (bar) {
    bar.style.width = `${Math.max(4, (index / (total - 1 || 1)) * 100)}%`;
  }
  // 左侧 Dock 内置页码指示器
  const curEl = byId('page-current');
  const totEl = byId('page-total');
  if (curEl) curEl.textContent = String(index + 1).padStart(2, '0');
  if (totEl) totEl.textContent = String(total).padStart(2, '0');

  // 兼容旧版单一文本 page-indicator
  const legacyIndicator = byId('page-indicator');
  if (legacyIndicator && !curEl) {
    legacyIndicator.textContent = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  }

  // 左右边缘导航按钮状态（兼容新旧 ID）
  const prevBtn = byId('nav-prev') || byId('previous-page');
  const nextBtn = byId('nav-next') || byId('next-page');
  if (prevBtn) prevBtn.disabled = index === 0;
  if (nextBtn) nextBtn.disabled = index === total - 1;

  document.querySelectorAll('.menu-page').forEach((node) => {
    node.classList.toggle('active', node.dataset.pageId === deck.pages[index].id);
  });
}

async function fragment(page) {
  if (window.__EMBEDDED_FRAGMENTS__ && window.__EMBEDDED_FRAGMENTS__[page.path]) {
    return window.__EMBEDDED_FRAGMENTS__[page.path];
  }
  if (!cache.has(page.path)) {
    cache.set(page.path, fetch(page.path).then((response) => {
      if (!response.ok) throw new Error(`Could not load ${page.path}`);
      return response.text();
    }));
  }
  return cache.get(page.path);
}

async function show(next) {
  if (next < 0 || next >= deck.pages.length) return;
  const token = ++requestId;
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
  index = next;
  const page = deck.pages[index];
  updateChrome();
  if (location.hash.slice(1) !== page.id) {
    history.replaceState(null, '', `#${page.id}`);
  }
  try {
    const html = await fragment(page);
    if (token !== requestId) return;
    viewport.innerHTML = `<article class="slide" data-page-id="${page.id}" data-page-type="${page.type}">${html}</article>`;
    if (page.module) {
      let module;
      if (window.__EMBEDDED_MODULES__ && window.__EMBEDDED_MODULES__[page.module]) {
        module = window.__EMBEDDED_MODULES__[page.module];
      } else {
        module = await import(`../${page.module}`);
      }
      if (token !== requestId) return;
      cleanup = (await module.init({ root: viewport.firstElementChild, page, deck })) || null;
    }
  } catch (error) {
    if (token === requestId) {
      viewport.innerHTML = `<article class="slide"><p class="eyebrow">Load error</p><h1 class="section-title">This page could not load.</h1><p class="lead">${error.message}</p></article>`;
    }
  }
  [index - 1, index + 1].forEach((nearby) => {
    if (deck.pages[nearby]) fragment(deck.pages[nearby]).catch(() => {});
  });
}

/* ==========================================================================
   激光笔拖尾引擎 (FADE_MS = 1200)
   ========================================================================== */
const trails = [];
let penDrawing = false;
let penPoints = [];

function point(event) {
  const source = event.touches ? event.touches[0] : event;
  return { x: source.clientX, y: source.clientY, t: performance.now() };
}

function renderPen() {
  ctx.pen.clearRect(0, 0, innerWidth, innerHeight);
  const now = performance.now();
  for (let i = trails.length - 1; i >= 0; i--) {
    const trail = trails[i];
    const age = now - trail.at;
    if (age > 1200) {
      trails.splice(i, 1);
      continue;
    }
    ctx.pen.strokeStyle = currentDrawColor;
    ctx.pen.globalAlpha = 1 - age / 1200;
    ctx.pen.lineWidth = 3;
    ctx.pen.lineCap = 'round';
    ctx.pen.beginPath();
    trail.points.forEach((p, n) => (n ? ctx.pen.lineTo(p.x, p.y) : ctx.pen.moveTo(p.x, p.y)));
    ctx.pen.stroke();
  }
  ctx.pen.globalAlpha = 1;
  if (trails.length || penDrawing) requestAnimationFrame(renderPen);
}

function penStart(event) {
  if (!penOn) return;
  event.preventDefault();
  penDrawing = true;
  penPoints = [point(event)];
  requestAnimationFrame(renderPen);
}

function penMove(event) {
  if (!penDrawing) return;
  event.preventDefault();
  penPoints.push(point(event));
}

function penEnd() {
  if (!penDrawing) return;
  penDrawing = false;
  if (penPoints.length > 1) trails.push({ points: penPoints, at: performance.now() });
  penPoints = [];
}

function togglePen() {
  penOn = !penOn;
  penCanvas.classList.toggle('active', penOn);
  byId('btn-pen')?.classList.toggle('active', penOn);
  if (!penOn) {
    penEnd();
    trails.length = 0;
    ctx.pen.clearRect(0, 0, innerWidth, innerHeight);
  }
}

/* ==========================================================================
   涂鸦画板引擎 (支持单步 Undo 撤销)
   ========================================================================== */
let drawing = false;
let drawStrokes = [];
let currentStroke = null;

function drawPoint(event) {
  const source = event.touches ? event.touches[0] : event;
  return { x: source.clientX, y: source.clientY };
}

function redrawDraw() {
  ctx.draw.clearRect(0, 0, innerWidth, innerHeight);
  drawStrokes.forEach((stroke) => {
    if (!stroke.points.length) return;
    ctx.draw.strokeStyle = stroke.color;
    ctx.draw.lineWidth = stroke.width;
    ctx.draw.lineCap = 'round';
    ctx.draw.lineJoin = 'round';
    ctx.draw.beginPath();
    stroke.points.forEach((p, n) => (n === 0 ? ctx.draw.moveTo(p.x, p.y) : ctx.draw.lineTo(p.x, p.y)));
    ctx.draw.stroke();
  });
}

function drawStart(event) {
  if (!drawOn) return;
  event.preventDefault();
  drawing = true;
  const p = drawPoint(event);
  currentStroke = { color: currentDrawColor, width: 3, points: [p] };
  drawStrokes.push(currentStroke);
  ctx.draw.strokeStyle = currentStroke.color;
  ctx.draw.lineWidth = currentStroke.width;
  ctx.draw.lineCap = 'round';
  ctx.draw.beginPath();
  ctx.draw.moveTo(p.x, p.y);
}

function drawMove(event) {
  if (!drawing || !currentStroke) return;
  event.preventDefault();
  const p = drawPoint(event);
  currentStroke.points.push(p);
  ctx.draw.lineTo(p.x, p.y);
  ctx.draw.stroke();
}

function undoDraw() {
  if (!drawOn || !drawStrokes.length) return;
  drawStrokes.pop();
  redrawDraw();
}

function clearDraw() {
  drawing = false;
  currentStroke = null;
  drawStrokes = [];
  ctx.draw.clearRect(0, 0, innerWidth, innerHeight);
}

function toggleDraw() {
  drawOn = !drawOn;
  drawCanvas.classList.toggle('active', drawOn);
  byId('btn-draw')?.classList.toggle('active', drawOn);
  byId('draw-hint')?.classList.toggle('visible', drawOn);
  if (!drawOn) clearDraw();
}

/* ==========================================================================
   4 色弹出式调色盘控制
   ========================================================================== */
function setDrawColor(color) {
  currentDrawColor = color;
  const indicator = byId('color-dot-indicator');
  if (indicator) indicator.style.background = color;
  const popup = byId('color-picker-popup');
  if (popup) popup.classList.remove('open');
  colorPickerOpen = false;
}

function toggleColorPicker(e) {
  if (e) e.stopPropagation();
  colorPickerOpen = !colorPickerOpen;
  const popup = byId('color-picker-popup');
  if (popup) popup.classList.toggle('open', colorPickerOpen);
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen?.();
  } else {
    document.documentElement.requestFullscreen?.();
  }
}

/* ==========================================================================
   键盘快捷键体系
   ========================================================================== */
function onKey(event) {
  if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
  const key = event.key.toLowerCase();
  if (key === 'escape') {
    if (colorPickerOpen) { toggleColorPicker(); return; }
    if (drawOn) toggleDraw();
    else if (penOn) togglePen();
    else setMenu(false);
    return;
  }
  if (drawOn && (key === 'z' || ((event.ctrlKey || event.metaKey) && key === 'z'))) {
    event.preventDefault();
    undoDraw();
    return;
  }
  if (key === 'arrowright' || key === ' ' || key === 'arrowdown') {
    event.preventDefault();
    show(index + 1);
  }
  if (key === 'arrowleft' || key === 'arrowup') {
    event.preventDefault();
    show(index - 1);
  }
  if (key === 'home') show(0);
  if (key === 'end') show(deck.pages.length - 1);
  if (key === 'm') setMenu(!menuOpen);
  if (key === 't') togglePen();
  if (key === 'd') toggleDraw();
  if (key === 'f') toggleFullscreen();
}

/* ==========================================================================
   触控滑动手势 (Touch Swipe)
   ========================================================================== */
let touchStartX = 0;
let touchStartY = 0;

function setupTouchSwipe() {
  viewport.addEventListener('touchstart', (e) => {
    if (drawOn || penOn || !e.touches.length) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    if (drawOn || penOn || !e.changedTouches.length) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(diffX) > 48 && Math.abs(diffY) < 60) {
      if (diffX < 0) show(index + 1);
      else show(index - 1);
    }
  }, { passive: true });
}

function bind() {
  const on = (id, event, handler) => {
    const el = byId(id);
    if (el) el.addEventListener(event, handler);
  };
  const onAny = (ids, event, handler) => {
    ids.forEach((id) => on(id, event, handler));
  };

  onAny(['btn-menu', 'toggle-menu'], 'click', () => setMenu(!menuOpen));
  onAny(['close-menu'], 'click', () => setMenu(false));
  onAny(['menu-overlay'], 'click', () => setMenu(false));

  onAny(['nav-prev', 'previous-page'], 'click', () => show(index - 1));
  onAny(['nav-next', 'next-page'], 'click', () => show(index + 1));

  onAny(['btn-pen', 'toggle-pen'], 'click', togglePen);
  onAny(['btn-draw', 'toggle-draw'], 'click', toggleDraw);
  onAny(['btn-fullscreen', 'toggle-fullscreen'], 'click', toggleFullscreen);

  // 调色盘绑定 (新版气泡按钮 + 旧版原生 input[type=color])
  on('btn-color', 'click', toggleColorPicker);
  on('draw-color', 'input', (e) => setDrawColor(e.target.value));

  document.querySelectorAll('.color-dot').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setDrawColor(btn.dataset.color);
    });
  });

  document.addEventListener('click', (e) => {
    if (colorPickerOpen && !byId('color-picker-wrap')?.contains(e.target)) {
      toggleColorPicker();
    }
  });

  document.addEventListener('keydown', onKey);
  window.addEventListener('resize', resizeCanvases);

  // 路由 hash 响应
  window.addEventListener('hashchange', () => {
    const target = pageFromHash();
    if (target !== index) show(target);
  });

  [penCanvas, drawCanvas].forEach((canvas) => {
    if (!canvas) return;
    canvas.addEventListener('pointerdown', canvas === penCanvas ? penStart : drawStart);
    canvas.addEventListener('pointermove', canvas === penCanvas ? penMove : drawMove);
    canvas.addEventListener('pointerup', canvas === penCanvas ? penEnd : () => { drawing = false; });
  });

  setupTouchSwipe();
}

async function start() {
  if (window.__EMBEDDED_DECK__) {
    deck = window.__EMBEDDED_DECK__;
  } else {
    const response = await fetch('deck.json');
    deck = await response.json();
  }
  document.title = deck.title;
  resizeCanvases();
  bind();
  buildMenu();
  await show(pageFromHash());
  window.__deck = {
    show,
    get index() { return index; },
    get deck() { return deck; }
  };
}

start().catch((error) => {
  viewport.innerHTML = `<article class="slide"><h1 class="section-title">Deck startup failed</h1><p class="lead">${error.message}</p></article>`;
});
