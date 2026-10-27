/* 思想星图 · Thinking Star Map — p5.js sketch + small UI layer.
   Content lives in data.js (UI, WRITERS, QUESTIONS). */

const GOLD = [220, 179, 76];
const PAPER = [246, 243, 236];

const state = {
  lang: "zh",
  view: "map",
  hover: null,     // { w, s }
  pinned: null,    // { w, s }
  pulse: null,     // { w, s, t0 }
  touch: false,
  ask: null        // { status, id? } from matchTopic
};

let bgStars = [];
let layout = [];          // per writer: region + computed star positions
let reduceMotion = false;

/* ------------------------------------------------------------------ */
/* language                                                            */
/* ------------------------------------------------------------------ */

function initLang() {
  const saved = safeStorage("get", "starmap-lang");
  if (saved === "zh" || saved === "en") state.lang = saved;
  else state.lang = (navigator.language || "zh").toLowerCase().startsWith("zh") ? "zh" : "en";
}

function safeStorage(op, key, value) {
  try {
    if (op === "get") return window.localStorage.getItem(key);
    window.localStorage.setItem(key, value);
  } catch (e) { /* private mode etc. */ }
  return null;
}

function t(key) { return UI[state.lang][key]; }
function other() { return state.lang === "zh" ? "en" : "zh"; }

function inferLabel(writer) {
  const custom = writer.inferPrefix && writer.inferPrefix[state.lang];
  return custom || t("inferPrefix");
}

function applyLang() {
  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  const langBtn = document.getElementById("lang-btn");
  langBtn.textContent = t("langBtn");
  langBtn.setAttribute("aria-label", t("langBtnLabel"));
  document.getElementById("sky").setAttribute("aria-label", t("title"));
  document.querySelectorAll(".card-close").forEach((b) => b.setAttribute("aria-label", t("close")));
  document.getElementById("hint").textContent = state.touch ? t("hintTouch") : t("hint");
  const askInput = document.getElementById("qa-input");
  if (askInput) askInput.placeholder = t("askPlaceholder");
  renderAbout();
  renderQA();
  renderAsk();
  if (state.pinned) fillCard(state.pinned);
  else if (state.hover) fillCard(state.hover);
}

/* ------------------------------------------------------------------ */
/* p5 sketch                                                           */
/* ------------------------------------------------------------------ */

function setup() {
  reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  state.touch = window.matchMedia("(hover: none)").matches;
  const c = createCanvas(windowWidth, windowHeight);
  c.parent("sky");
  pixelDensity(Math.min(2, displayDensity()));
  frameRate(45);
  textFont('"Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC", "SimSun", serif');
  makeBackgroundStars();
  bindPointer(c.elt);
  initLang();
  bindUI();
  applyLang();
  computeLayout();                       // after header text exists
  watchHeader();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      syncHeaderOffset();
      computeLayout();
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  makeBackgroundStars();
  computeLayout();
  if (state.pinned) positionCard(state.pinned);
}

function makeBackgroundStars() {
  bgStars = [];
  const n = Math.round((windowWidth * windowHeight) / 5200);
  for (let i = 0; i < n; i++) {
    bgStars.push({
      x: random(width), y: random(height),
      r: random(0.4, 1.5),
      a: random(40, 160),
      phase: random(TWO_PI),
      speed: random(0.6, 2.2)
    });
  }
}

function syncHeaderOffset() {
  const header = document.querySelector(".topbar");
  if (!header) return;
  const h = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--header-h", h + "px");
}

function watchHeader() {
  syncHeaderOffset();
  const header = document.querySelector(".topbar");
  if (!header || !window.ResizeObserver) return;
  let last = header.getBoundingClientRect().height;
  const observer = new ResizeObserver(() => {
    const h = header.getBoundingClientRect().height;
    syncHeaderOffset();
    if (Math.abs(h - last) < 0.5) return;
    last = h;
    computeLayout();
  });
  observer.observe(header);
}

function topReserve() {
  const header = document.querySelector(".topbar");
  const h = header ? header.getBoundingClientRect().height : 120;
  return h + (width < 760 ? 18 : 30);
}

function computeLayout() {
  const top = topReserve();
  const bottom = width < 760 ? 40 : 56;
  const sidePad = width < 760 ? 8 : Math.max(20, width * 0.03);
  const fourCols = width >= 900 && width / height > 1.05;
  const cols = fourCols ? 4 : 2;
  const rows = fourCols ? 1 : 2;
  const cellW = (width - sidePad * 2) / cols;
  const cellH = (height - top - bottom) / rows;

  layout = WRITERS.map((w, i) => {
    const cx = sidePad + (i % cols) * cellW;
    const cy = top + Math.floor(i / cols) * cellH;
    const labelH = cellW < 260 ? 34 : 60;
    const narrow = cellW < 260;
    const inner = {
      x: cx + cellW * (narrow ? 0.1 : 0.14),
      y: cy + labelH + 10,
      w: cellW * (narrow ? 0.8 : 0.72),
      h: Math.max(60, cellH - labelH - (narrow ? 56 : 48))
    };
    return {
      cell: { x: cx, y: cy, w: cellW, h: cellH },
      inner,
      labelH,
      stars: w.stars.map((s, j) => ({
        bx: inner.x + s.x * inner.w,
        by: inner.y + s.y * inner.h,
        x: 0, y: 0,
        seed: i * 31 + j * 7.3,
        phase: random(TWO_PI)
      }))
    };
  });
  updateStarPositions(0);
}

function updateStarPositions(time) {
  const amp = reduceMotion ? 0 : (width < 760 ? 2.5 : 4);
  layout.forEach((L) => {
    L.stars.forEach((p) => {
      p.x = p.bx + (noise(p.seed, time * 0.12) - 0.5) * 2 * amp;
      p.y = p.by + (noise(p.seed + 100, time * 0.12) - 0.5) * 2 * amp;
    });
  });
}

function draw() {
  const time = millis() / 1000;
  drawSky(time);
  updateStarPositions(time);

  const dim = state.view === "qa";
  layout.forEach((L, wi) => drawConstellation(L, WRITERS[wi], wi, time, dim));
}

function drawSky(time) {
  // vertical night gradient
  const ctx = drawingContext;
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, "#0a0f22");
  g.addColorStop(0.6, "#121a36");
  g.addColorStop(1, "#1b2142");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  noStroke();
  for (const s of bgStars) {
    const tw = reduceMotion ? 0.8 : 0.55 + 0.45 * Math.sin(time * s.speed + s.phase);
    fill(PAPER[0], PAPER[1], PAPER[2], s.a * tw);
    circle(s.x, s.y, s.r * 2);
  }

  drawMoon();
}

function drawMoon() {
  // a small crescent, a nod to the moon on the home page
  const r = width < 760 ? 13 : 20;
  const x = width < 760 ? width - 34 : width - Math.max(60, width * 0.05);
  const y = height - (width < 760 ? 52 : 70);
  noStroke();
  fill(GOLD[0], GOLD[1], GOLD[2], 16);
  circle(x, y, r * 5);
  fill(GOLD[0], GOLD[1], GOLD[2], 30);
  circle(x, y, r * 3);
  fill(GOLD[0], GOLD[1], GOLD[2], 235);
  circle(x, y, r * 2);
  // carve the crescent with the sky colour
  fill(25, 31, 62);
  circle(x + r * 0.62, y - r * 0.38, r * 1.9);
}

function isActive(wi, si) {
  const a = state.pinned || state.hover;
  return a && a.w === wi && a.s === si;
}

function drawConstellation(L, writer, wi, time, dim) {
  const col = writer.color;
  const fade = dim ? 0.35 : 1;
  const active = state.pinned || state.hover;
  const writerActive = active && active.w === wi;

  // constellation name
  const small = L.cell.w < 260;
  noStroke();
  textAlign(CENTER, TOP);
  textSize(small ? 15 : 18);
  textStyle(NORMAL);
  fill(col[0], col[1], col[2], 235 * fade);
  const nameX = L.cell.x + L.cell.w / 2;
  text(writer.name[state.lang], nameX, L.cell.y);
  if (!small) {
    textSize(11.5);
    fill(PAPER[0], PAPER[1], PAPER[2], 120 * fade);
    textAlign(CENTER, TOP);
    text(writer.motto[state.lang], L.cell.x + 8, L.cell.y + 26, L.cell.w - 16);
  }

  // links
  for (const [a, b] of writer.links) {
    const pa = L.stars[a], pb = L.stars[b];
    const hot = writerActive && (active.s === a || active.s === b);
    stroke(col[0], col[1], col[2], (hot ? 150 : 52) * fade);
    strokeWeight(hot ? 1.3 : 0.8);
    line(pa.x, pa.y, pb.x, pb.y);
  }

  // stars
  writer.stars.forEach((s, si) => {
    const p = L.stars[si];
    const on = isActive(wi, si);
    const breathe = reduceMotion ? 0.85 : 0.7 + 0.3 * Math.sin(time * 1.6 + p.phase);
    const base = small ? 5.2 : 6.5;
    const r = base * (on ? 1.35 : 1);

    // pulse ring when highlighted from the Q&A view
    if (state.pulse && state.pulse.w === wi && state.pulse.s === si) {
      const age = time - state.pulse.t0;
      if (age < 3.2) {
        const k = (age % 1.05) / 1.05;
        noFill();
        stroke(col[0], col[1], col[2], 200 * (1 - k));
        strokeWeight(1.5);
        circle(p.x, p.y, r * 3 + k * 46);
      } else {
        state.pulse = null;
      }
    }

    drawConceptStar(p.x, p.y, r, col, breathe * fade, on);

    // label
    const label = s.name[state.lang];
    noStroke();
    textAlign(CENTER, TOP);
    textSize(small ? 10.5 : 12.5);
    fill(PAPER[0], PAPER[1], PAPER[2], (on ? 245 : 170) * fade);
    const half = textWidth(label) / 2 + 2;
    const lx = constrain(p.x, L.cell.x + half, L.cell.x + L.cell.w - half);
    text(label, lx, p.y + r + 7);
  });
}

function drawConceptStar(x, y, r, col, a, on) {
  push();
  translate(x, y);
  rotate(-HALF_PI);
  noStroke();
  fill(col[0], col[1], col[2], (on ? 46 : 22) * a);
  circle(0, 0, r * 6);
  fill(col[0], col[1], col[2], (on ? 90 : 55) * a);
  circle(0, 0, r * 3);
  fill(lerp(col[0], 255, 0.55), lerp(col[1], 255, 0.55), lerp(col[2], 255, 0.55), 250 * Math.max(a, 0.4));
  beginShape();
  for (let k = 0; k < 10; k++) {
    const ang = (k * PI) / 5;
    const rr = k % 2 === 0 ? r : r * 0.45;
    vertex(Math.cos(ang) * rr, Math.sin(ang) * rr);
  }
  endShape(CLOSE);
  pop();
}

/* ------------------------------------------------------------------ */
/* pointer (mouse + touch)                                             */
/* ------------------------------------------------------------------ */

function hitTest(px, py, radius) {
  let best = null;
  let bestD = radius;
  layout.forEach((L, wi) => {
    L.stars.forEach((p, si) => {
      const d = Math.hypot(px - p.x, py - p.y);
      if (d < bestD) { bestD = d; best = { w: wi, s: si }; }
    });
  });
  return best;
}

function bindPointer(el) {
  el.addEventListener("pointermove", (e) => {
    if (state.view !== "map" || e.pointerType !== "mouse") return;
    const hit = hitTest(e.offsetX, e.offsetY, 24);
    el.style.cursor = hit ? "pointer" : "default";
    if (state.pinned) return;
    if (!same(hit, state.hover)) {
      state.hover = hit;
      if (hit) showCard(hit); else hideCard();
    }
  });

  el.addEventListener("pointerleave", () => {
    if (!state.pinned && state.hover) { state.hover = null; hideCard(); }
  });

  el.addEventListener("pointerdown", (e) => {
    if (state.view !== "map") return;
    if (e.pointerType !== "mouse") {
      state.touch = true;
      document.getElementById("hint").textContent = t("hintTouch");
    }
    const hit = hitTest(e.offsetX, e.offsetY, e.pointerType === "mouse" ? 24 : 34);
    if (hit) {
      state.pinned = hit;
      state.hover = null;
      showCard(hit);
    } else if (state.pinned) {
      closeCard();
    }
  });
}

function same(a, b) {
  return a && b ? a.w === b.w && a.s === b.s : a === b;
}

/* ------------------------------------------------------------------ */
/* concept card                                                        */
/* ------------------------------------------------------------------ */

const card = () => document.getElementById("card");

function fillCard(ref) {
  const w = WRITERS[ref.w];
  const s = w.stars[ref.s];
  const el = card();
  el.style.setProperty("--accent", `rgb(${w.color.join(",")})`);
  document.getElementById("card-writer").textContent = `${w.name.zh} · ${w.name.en}`;
  document.getElementById("card-title").textContent = s.name[state.lang];
  document.getElementById("card-sub").textContent = s.name[other()];
  document.getElementById("card-summary").textContent = s.summary[state.lang];

  const fig = document.getElementById("card-quote");
  if (s.quote) {
    fig.hidden = false;
    document.getElementById("card-quote-text").textContent = s.quote;
    document.getElementById("card-quote-text").setAttribute("lang", "zh-CN");
    let cap = t("quoteLabel");
    if (s.quoteSource) cap += state.lang === "zh" ? `（${s.quoteSource.zh}）` : ` (${s.quoteSource.en})`;
    cap += state.lang === "zh" ? `｜${t("quoteNote")}` : ` · ${t("quoteNote")}`;
    document.getElementById("card-quote-cap").textContent = cap;
  } else {
    fig.hidden = true;
  }
}

function showCard(ref) {
  fillCard(ref);
  card().hidden = false;
  positionCard(ref);
}

function positionCard(ref) {
  const el = card();
  if (window.innerWidth < 760) {           // bottom sheet via CSS
    el.style.left = ""; el.style.top = "";
    return;
  }
  const p = layout[ref.w].stars[ref.s];
  const rect = el.getBoundingClientRect();
  const margin = 16;
  const headerH = document.querySelector(".topbar")?.getBoundingClientRect().height || 120;
  let x = p.bx + 26;
  if (x + rect.width > window.innerWidth - margin) x = p.bx - 26 - rect.width;
  x = Math.max(margin, x);
  let y = p.by - rect.height / 2;
  const minY = headerH + 10;
  const maxY = Math.max(minY, window.innerHeight - rect.height - margin);
  y = Math.min(Math.max(y, minY), maxY);
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}

function hideCard() { card().hidden = true; }

function closeCard() {
  state.pinned = null;
  state.hover = null;
  hideCard();
}

/* ------------------------------------------------------------------ */
/* views, about, Q&A                                                   */
/* ------------------------------------------------------------------ */

function setView(v) {
  state.view = v;
  document.body.classList.toggle("view-map", v === "map");
  document.body.classList.toggle("view-qa", v === "qa");
  document.getElementById("tab-map").setAttribute("aria-selected", String(v === "map"));
  document.getElementById("tab-qa").setAttribute("aria-selected", String(v === "qa"));
  document.getElementById("qa-view").hidden = v !== "qa";
  if (v === "qa") closeCard();
  syncHeaderOffset();
}

function highlightStar(writerId, starId) {
  const wi = WRITERS.findIndex((w) => w.id === writerId);
  if (wi < 0) return;
  const si = WRITERS[wi].stars.findIndex((s) => s.id === starId);
  if (si < 0) return;
  setView("map");
  state.pinned = { w: wi, s: si };
  state.pulse = { w: wi, s: si, t0: millis() / 1000 };
  showCard(state.pinned);
  window.scrollTo(0, 0);
}

function renderAbout() {
  document.getElementById("about-title").textContent = t("aboutTitle");
  const body = document.getElementById("about-body");
  body.replaceChildren();
  const paras = t("aboutBody");
  paras.forEach((txt, i) => {
    const p = document.createElement("p");
    p.textContent = txt;
    if (i === paras.length - 1) p.className = "credit";
    body.appendChild(p);
  });
}

function buildAnswerCard(writer, answer) {
  const hasStar = Boolean(answer.star);
  const cardEl = document.createElement(hasStar ? "button" : "div");
  if (hasStar) cardEl.type = "button";
  cardEl.className = "qa-card" + (hasStar ? "" : " no-star");
  cardEl.style.setProperty("--accent", `rgb(${writer.color.join(",")})`);

  const name = document.createElement("span");
  name.className = "qa-name";
  name.textContent = writer.name[state.lang];
  cardEl.appendChild(name);

  const p = document.createElement("p");
  p.className = "qa-text";
  if (answer.coverage === "inferred") {
    cardEl.classList.add("inferred");
    const pre = document.createElement("em");
    pre.className = "qa-infer";
    pre.textContent = inferLabel(writer);
    p.append(pre, answer[state.lang]);
  } else {
    p.textContent = answer[state.lang];
  }
  cardEl.appendChild(p);

  if (hasStar) {
    const star = writer.stars.find((s) => s.id === answer.star);
    const starName = star ? star.name[state.lang] : "";
    const link = document.createElement("span");
    link.className = "qa-link";
    link.textContent = state.lang === "en"
      ? `✦ ${t("viewStar")}: ${starName}`
      : `✦ ${t("viewStar")}：${starName}`;
    cardEl.appendChild(link);
    cardEl.addEventListener("click", () => highlightStar(writer.id, answer.star));
  }
  return cardEl;
}

function appendAnswerGrid(parent, question) {
  const grid = document.createElement("div");
  grid.className = "qa-grid";
  WRITERS.forEach((writer) => {
    const answer = question.answers[writer.id];
    if (!answer) return;
    grid.appendChild(buildAnswerCard(writer, answer));
  });
  parent.appendChild(grid);
}

function buildSuggestions() {
  const wrap = document.createElement("div");
  wrap.className = "qa-suggests";
  QUESTIONS.forEach((question, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "qa-suggest";
    button.textContent = `Q${index + 1}  ${question.q[state.lang]}`;
    button.addEventListener("click", () => {
      const input = document.getElementById("qa-input");
      input.value = question.q[state.lang];
      submitAsk(question.q[state.lang]);
    });
    wrap.appendChild(button);
  });
  return wrap;
}

function renderQA() {
  document.getElementById("qa-intro").textContent = t("qaIntro");
  const list = document.getElementById("qa-list");
  list.replaceChildren();

  QUESTIONS.forEach((question, index) => {
    const block = document.createElement("section");
    block.className = "qa-block";
    const h = document.createElement("h2");
    const num = document.createElement("span");
    num.textContent = `Q${index + 1}`;
    h.append(num, question.q[state.lang]);
    block.appendChild(h);
    appendAnswerGrid(block, question);
    list.appendChild(block);
  });
}

function renderAsk() {
  const box = document.getElementById("qa-result");
  if (!box) return;
  box.replaceChildren();
  const ask = state.ask;
  if (!ask) return;

  if (ask.status === "empty" || ask.status === "short") {
    const note = document.createElement("p");
    note.className = "qa-note";
    note.textContent = t(ask.status === "empty" ? "askEmpty" : "askShort");
    box.appendChild(note);
    if (ask.status === "short") box.appendChild(buildSuggestions());
    return;
  }

  if (ask.status === "none") {
    const note = document.createElement("p");
    note.className = "qa-note";
    note.textContent = t("askNone");
    box.appendChild(note);
    box.appendChild(buildSuggestions());
    return;
  }

  const topic = QUESTIONS.find((question) => question.id === ask.id);
  if (!topic) return;
  const label = document.createElement("p");
  label.className = "qa-match";
  const kicker = document.createElement("span");
  kicker.className = "qa-match-kicker";
  kicker.textContent = t("askMatched");
  const name = document.createElement("span");
  name.className = "qa-match-name";
  name.textContent = topic.q[state.lang];
  label.append(kicker, name);
  box.appendChild(label);

  const sub = document.createElement("p");
  sub.className = "qa-match-sub";
  sub.lang = state.lang === "zh" ? "en" : "zh-CN";
  sub.textContent = topic.q[other()];
  box.appendChild(sub);
  appendAnswerGrid(box, topic);
}

function submitAsk(raw) {
  state.ask = matchTopic(raw);
  renderAsk();
  const box = document.getElementById("qa-result");
  const scroller = document.getElementById("qa-view");
  if (!box || !box.firstChild || !scroller) return;
  scroller.scrollTo({ top: Math.max(0, box.offsetTop - 8), behavior: reduceMotion ? "auto" : "smooth" });
}

function bindUI() {
  document.getElementById("lang-btn").addEventListener("click", () => {
    state.lang = other();
    safeStorage("set", "starmap-lang", state.lang);
    applyLang();
    computeLayout();
  });
  document.getElementById("tab-map").addEventListener("click", () => setView("map"));
  document.getElementById("tab-qa").addEventListener("click", () => setView("qa"));
  const askForm = document.getElementById("qa-ask");
  if (askForm) {
    askForm.addEventListener("submit", (event) => {
      event.preventDefault();
      submitAsk(document.getElementById("qa-input").value);
    });
  }
  document.getElementById("card-close").addEventListener("click", closeCard);

  const about = document.getElementById("about");
  const openAbout = () => { about.hidden = false; document.getElementById("about-close").focus(); };
  const closeAbout = () => { about.hidden = true; document.getElementById("about-btn").focus(); };
  document.getElementById("about-btn").addEventListener("click", openAbout);
  document.getElementById("about-close").addEventListener("click", closeAbout);
  about.addEventListener("click", (e) => { if (e.target === about) closeAbout(); });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!about.hidden) closeAbout();
    else if (state.pinned || state.hover) closeCard();
  });
}
