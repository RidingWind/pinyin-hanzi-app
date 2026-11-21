/* =====================================================
   拼音乐园 · 应用逻辑
   ===================================================== */
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const pick1 = a => a[Math.floor(Math.random() * a.length)];
const now = () => Date.now();
const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const fmtDue = ms => {
  if (ms <= 0) return '现在';
  const m = Math.round(ms / 60000);
  if (m < 1) return '1分钟内';
  if (m < 60) return m + '分钟后';
  const h = Math.round(m / 60);
  if (h < 24) return h + '小时后';
  return Math.round(h / 24) + '天后';
};

/* ---------------- 状态 ---------------- */
const KEY = 'pinyinFun.v1';
const DEFAULT_STATE = {
  seen: false, xp: 0,
  streak: { c: 0, last: '' },
  hearts: { n: 5, last: '' },
  prog: {},                      // unitId -> { done:[bool], challenge:bool }
  chars: {},                     // char -> { stage, due, learned, correct, wrong }
  pinyinDone: {},                // p1/p2/p3 -> true
  settings: { rate: 'normal', voice: '', sfx: true, mode: 'auto' },
  ach: {},
  stats: { lessons: 0, perfect: 0, reviews: 0, writes: 0, todayXp: { d: '', v: 0 } }
};
let S = loadState();
function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    const s = JSON.parse(raw);
    return Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), s, { stats: Object.assign({}, DEFAULT_STATE.stats, s.stats), settings: Object.assign({}, DEFAULT_STATE.settings, s.settings) });
  } catch (e) { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

/* ---------------- 工具：数据 ---------------- */
const ALL_CHARS = [];
const CHAR_MAP = {};
(window.UNITS || []).forEach(u => u.chars.forEach(c => { ALL_CHARS.push(c); CHAR_MAP[c.c] = c; }));
const PY_COLOR = n => window.TONE_COLORS[n] || '#3c3c3c';
function toneOf(py) {
  if (/[āēīōūǖĀĒĪŌŪǕ]/.test(py)) return 1;
  if (/[áéíóúǘÁÉÍÓÚǗ]/.test(py)) return 2;
  if (/[ǎěǐǒǔǚǍĚǏǑǓǙ]/.test(py)) return 3;
  if (/[àèìòùǜÀÈÌÒÙǛ]/.test(py)) return 4;
  return 5;
}
function toneNumName(n) { return ['', '第一声', '第二声', '第三声', '第四声', '轻声'][n] || '轻声'; }
function meanZh(m) { return m.replace(/（[^）]*）/g, '').replace(/\u201c的\u201d：/, ''); }

/* ---------------- 发音：在线标准语音 + 系统语音回退 ---------------- */
let zhVoices = [];
function voiceScore(v) {
  const lang = String(v.lang || '').toLowerCase().replace('_', '-');
  const id = (v.name || '') + ' ' + (v.voiceURI || '');
  let s = 0;
  if (/^zh-cn|^zh-hans|^cmn/.test(lang)) s += 120;          // 普通话优先
  else if (/^zh-tw|^zh-hant/.test(lang)) s += 50;            // 台湾国语
  else if (/^zh-hk|^yue/.test(lang)) s -= 40;                // 粤语，尽量避免
  else if (/^zh/.test(lang) || /chinese|中文|普通话|國語/i.test(id)) s += 30;
  else s -= 200;
  if (/xiaoxiao|xiaoyi|yunxi|yunyang|yunjian|xiaomo|xiaohan|natural|neural/i.test(id)) s += 50;
  if (/ting-?ting|mei-?jia|huihui|kangkang|yaoyao|google/i.test(id)) s += 20;
  return s;
}
function refreshVoices() {
  const all = (typeof speechSynthesis !== 'undefined' && speechSynthesis.getVoices) ? speechSynthesis.getVoices() : [];
  zhVoices = all.filter(v => /^zh|cmn|chinese|中文|普通话/i.test((v.lang || '') + ' ' + (v.name || '')))
    .sort((a, b) => voiceScore(b) - voiceScore(a));
  renderVoiceOptions && renderVoiceOptions();
}
if (typeof speechSynthesis !== 'undefined') {
  refreshVoices();
  speechSynthesis.onvoiceschanged = refreshVoices;
}
let audioEl = null, remoteFail = 0, remoteOff = false;
function remoteUrl(text) {
  return 'https://fanyi.baidu.com/gettts?lan=zh&text=' + encodeURIComponent(text) + '&spd=3&source=web';
}
function stopVoice() {
  if (audioEl) { try { audioEl.pause(); } catch (e) {} audioEl = null; }
  try { speechSynthesis.cancel(); } catch (e) {}
}
function ttsSpeak(text, opts) {
  if (typeof speechSynthesis === 'undefined') return;
  opts = opts || {};
  try {
    const u = new SpeechSynthesisUtterance(text);
    const v = (S.settings.voice && zhVoices.find(x => x.name === S.settings.voice)) || zhVoices[0];
    if (v) { u.voice = v; u.lang = v.lang || 'zh-CN'; } else { u.lang = 'zh-CN'; }
    const rates = { slow: 0.82, normal: 1, fast: 1.12 };
    u.rate = opts.slow ? 0.72 : (rates[S.settings.rate] || 1);
    u.pitch = 1;
    u.volume = 1;
    speechSynthesis.speak(u);
  } catch (e) {}
}
function playRemote(text, opts) {
  try {
    const a = new Audio(remoteUrl(text));
    audioEl = a;
    a.preload = 'auto';
    a.playbackRate = opts && opts.slow ? 0.8 : 1;
    let settled = false, timer = null;
    const fallback = (penalize) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      if (penalize !== false) {
        remoteFail++;
        if (remoteFail >= 2) remoteOff = true;
      }
      if (audioEl === a) audioEl = null;
      try { a.pause(); } catch (e) {}
      ttsSpeak(text, opts);
    };
    a.addEventListener('playing', () => { settled = true; remoteFail = 0; if (timer) clearTimeout(timer); }, { once: true });
    a.addEventListener('error', () => fallback(true), { once: true });
    timer = setTimeout(() => { if (!settled) fallback(true); }, 1500);
    const p = a.play();
    // 浏览器自动播放限制不算网络失败，避免误关在线发音
    if (p && p.catch) p.catch(err => fallback(!(err && err.name === 'NotAllowedError')));
    return true;
  } catch (e) { return false; }
}
function speak(text, opts) {
  if (!text) return;
  stopVoice();
  const mode = S.settings.mode || 'auto';
  const isZh = /[\u3400-\u9fff]/.test(text);
  if (isZh && mode !== 'tts' && !remoteOff && playRemote(text, opts)) return;
  ttsSpeak(text, opts);
}
/* 播放本地拼音音节录音（离线、标准呼读音） */
function playLocal(file, altText, opts) {
  if (!file) return false;
  try {
    const a = new Audio('audio/' + file + '.mp3');
    stopVoice();
    audioEl = a;
    a.playbackRate = opts && opts.slow ? 0.8 : 1;
    a.addEventListener('error', () => {
      if (audioEl === a) audioEl = null;
      if (altText) speak(altText, opts);
    }, { once: true });
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
    return true;
  } catch (e) { return false; }
}
function speakChar(ch, slow) { const c = CHAR_MAP[ch]; speak(c ? c.c : ch, { slow }); }
function speakSentence(cn, py) { speak(cn); }

/* ---------------- 音效 ---------------- */
let actx = null;
function sfx(type) {
  if (!S.settings.sfx) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime;
    const note = (f, st, dur, vol, wave) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = wave || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(vol, t + st);
      g.gain.exponentialRampToValueAtTime(0.001, t + st + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(t + st); o.stop(t + st + dur + 0.02);
    };
    if (type === 'correct') { note(659, 0, .12, .18); note(880, .1, .18, .18); }
    else if (type === 'wrong') { note(196, 0, .22, .16, 'square'); }
    else if (type === 'tap') { note(440, 0, .06, .08, 'triangle'); }
    else if (type === 'win') { [523, 659, 784, 1047].forEach((f, i) => note(f, i * .12, .22, .16)); }
    else if (type === 'star') { note(1175, 0, .1, .12); note(1568, .08, .16, .12); }
    else if (type === 'combo') { note(784, 0, .08, .14); note(1047, .07, .14, .14); }
  } catch (e) {}
}

/* ---------------- HanziWriter 集成 ---------------- */
const HW = window.HanziWriter;
function charDataLoader(char, onLoad, onError) {
  if (window.HANZI_DATA && window.HANZI_DATA[char]) { onLoad(window.HANZI_DATA[char]); return; }
  fetch('https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/' + encodeURIComponent(char) + '.json')
    .then(r => { if (!r.ok) throw 0; return r.json(); })
    .then(d => onLoad(d)).catch(() => onError && onError());
}
function hwOpts(extra) {
  return Object.assign({
    width: 186, height: 186, padding: 8,
    strokeColor: '#3c3c3c', radicalColor: '#16837d',
    strokeAnimationSpeed: 1.2, delayBetweenStrokes: 260, highlightColor: '#58cc02',
    charDataLoader
  }, extra || {});
}
/* 播放笔顺动画 */
function playStrokes(container, ch, opts) {
  opts = opts || {};
  container.innerHTML = '';
  if (!HW) { container.innerHTML = '<div style="font-size:90px;font-weight:900">' + esc(ch) + '</div>'; return null; }
  const size = opts.size || Math.min(container.clientWidth || 186, 200);
  const w = HW.create(container, ch, hwOpts({ width: size, height: size, strokeAnimationSpeed: opts.slow ? 0.5 : 1.4, delayBetweenStrokes: opts.slow ? 600 : 220 }));
  w.animateCharacter({ onComplete: opts.onDone });
  return w;
}
/* 写字测验 */
function quizChar(container, ch, opts) {
  opts = opts || {};
  container.innerHTML = '';
  if (!HW) { opts.onComplete && opts.onComplete(); return null; }
  const size = opts.size || Math.min(container.clientWidth || 240, 260);
  const w = HW.create(container, ch, hwOpts({
    width: size, height: size, showOutline: true,
    strokeAnimationSpeed: 1, delayBetweenStrokes: 300,
    showHintAfterMisses: 3, leniency: 1.15
  }));
  let strokesRight = 0, strokesTotal = 0;
  const data = window.HANZI_DATA && window.HANZI_DATA[ch];
  strokesTotal = data ? data.strokes.length : 0;
  w.quiz({
    onCorrectStroke: st => { strokesRight = st.strokeNum + 1; opts.onProgress && opts.onProgress(strokesRight, strokesTotal); sfx('tap'); },
    onMistake: () => { sfx('wrong'); opts.onMistake && opts.onMistake(strokesRight, strokesTotal); },
    onComplete: () => { sfx('star'); opts.onComplete && opts.onComplete(); }
  });
  return w;
}

/* ---------------- 艾宾浩斯调度 ---------------- */
const EB_STAGES = [
  { min: 5, label: '5分钟' }, { min: 30, label: '30分钟' }, { min: 12 * 60, label: '12小时' },
  { min: 24 * 60, label: '1天' }, { min: 2 * 24 * 60, label: '2天' }, { min: 4 * 24 * 60, label: '4天' },
  { min: 7 * 24 * 60, label: '7天' }, { min: 15 * 24 * 60, label: '15天' }
];
function charRec(c) {
  if (!S.chars[c]) S.chars[c] = { stage: -1, due: 0, learned: false, correct: 0, wrong: 0 };
  return S.chars[c];
}
function scheduleChar(c, ok) {
  const r = charRec(c);
  if (ok) {
    r.correct++;
    if (r.stage < 0) r.stage = 0;
    else r.stage = Math.min(r.stage + 1, EB_STAGES.length - 1);
  } else {
    r.wrong++;
    r.stage = r.stage < 1 ? 0 : 1;
    r.learned = r.stage > 0 || r.learned;
  }
  r.learned = true;
  r.due = now() + EB_STAGES[r.stage].min * 60000;
  save();
}
function dueChars() {
  const t = now(), out = [];
  Object.keys(S.chars).forEach(c => {
    const r = S.chars[c];
    if (r.learned && r.stage < EB_STAGES.length && r.due <= t) out.push({ c, rec: r });
  });
  return out;
}
function nextDueIn() {
  let min = Infinity;
  Object.keys(S.chars).forEach(c => {
    const r = S.chars[c];
    if (r.learned && r.due > now()) min = Math.min(min, r.due - now());
  });
  return min === Infinity ? null : min;
}

/* ---------------- XP / 连胜 / 爱心 ---------------- */
const LEVELS = [0, 50, 120, 220, 360, 540, 760, 1040, 1400, 1800, 2400];
function levelInfo(xp) {
  let lv = 1;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i]) lv = i + 1;
  const base = LEVELS[lv - 1] || 0, next = LEVELS[lv] || (base + 600);
  return { lv, base, next, pct: Math.min(100, Math.round((xp - base) / (next - base) * 100)) };
}
function gainXp(n) {
  S.xp += n;
  const t = todayStr();
  if (S.stats.todayXp.d !== t) S.stats.todayXp = { d: t, v: 0 };
  S.stats.todayXp.v += n;
  touchStreak();
  checkAch(); save(); renderTopbar();
}
function touchStreak() {
  const t = todayStr();
  if (S.streak.last === t) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yStr = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
  S.streak.c = (S.streak.last === yStr) ? S.streak.c + 1 : 1;
  S.streak.last = t;
  if (S.streak.c > 1) toast('🔥 连续学习 ' + S.streak.c + ' 天！', 'gold');
}
function rollDay() {
  const t = todayStr();
  if (S.hearts.last !== t) { S.hearts = { n: 5, last: t }; save(); }
}
function loseHeart() {
  S.hearts.n = Math.max(0, S.hearts.n - 1); save();
  const el = $('#lessonHearts'); if (el) el.textContent = '❤️ × ' + S.hearts.n;
}
function lessonUnitState(u) {
  const nLess = Math.ceil(u.chars.length / 5);
  if (!S.prog[u.id]) S.prog[u.id] = { done: Array(nLess).fill(false), challenge: false };
  return S.prog[u.id];
}
function unitUnlocked(u) {
  const idx = window.UNITS.findIndex(x => x.id === u.id);
  if (idx <= 0) return true;
  const prev = window.UNITS[idx - 1];
  const ps = lessonUnitState(prev);
  return ps.done.every(Boolean) && ps.challenge;
}

/* ---------------- Toast / Dialog ---------------- */
function toast(msg, cls) {
  const wrap = $('#toastWrap'); if (!wrap) return;
  const t = document.createElement('div');
  t.className = 'toast ' + (cls || '');
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}
function openDialog(html, noClose) {
  const mask = document.createElement('div');
  mask.className = 'modal-mask'; mask.style.alignItems = 'center'; mask.style.zIndex = 70;
  mask.innerHTML = '<div class="modal dialog">' + html + '</div>';
  $('#app').appendChild(mask);
  return mask;
}

/* ---------------- 学习路径 ---------------- */
function chunk(arr, n) { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; }
function renderLearn() {
  const box = $('#scr-learn');
  let html = '<div class="unit-banner" style="background:linear-gradient(135deg,#ff9600,#ffb347)"><div><div class="u-name">🔤 拼音启蒙</div><div class="u-desc">听音辨音 · 声母韵母四声</div></div><div class="u-emoji">🎵</div></div><div class="path">';
  window.PINYIN_LESSONS.forEach((pl, i) => {
    const locked = i > 0 && !S.pinyinDone[window.PINYIN_LESSONS[i - 1].id];
    const done = S.pinyinDone[pl.id];
    html += '<div class="path-row" style="transform:translateX(' + (i % 2 ? 46 : -46) + 'px)">'
      + '<div class="node ' + (done ? 'done' : locked ? 'locked' : 'available') + '" style="background:' + '#1cb0f6' + '" data-py="' + pl.id + '">'
      + (done ? '👑' : locked ? '🔒' : pl.emoji)
      + (locked ? '' : '<span class="node-label">' + esc(pl.name) + '</span>')
      + '</div></div>';
  });
  html += '</div>';
  window.UNITS.forEach((u, ui) => {
    const st = lessonUnitState(u);
    const unlocked = unitUnlocked(u);
    const parts = chunk(u.chars, 5);
    html += '<div class="unit-banner" style="background:linear-gradient(135deg,' + u.color + ',' + u.color + 'cc)"><div><div class="u-name">' + u.emoji + ' ' + esc(u.name) + '</div><div class="u-desc">' + esc(u.desc) + ' · ' + u.chars.length + '个汉字</div></div><div class="u-guide">' + (unlocked ? '📖' : '🔒') + '</div></div>';
    if (!unlocked) { html += '<div class="path"><div class="path-row"><div class="node locked" style="background:#e5e5e5">🔒<span class="node-label">完成上一单元解锁</span></div></div></div>'; return; }
    html += '<div class="path">';
    parts.forEach((part, li) => {
      const done = st.done[li];
      const avail = li === 0 || st.done[li - 1];
      html += '<div class="path-row" style="transform:translateX(' + ((li % 2 ? 46 : -46)) + 'px)">'
        + '<div class="node ' + (done ? 'done' : avail ? 'available' : 'locked') + '" style="background:' + u.color + '" data-unit="' + u.id + '" data-li="' + li + '">'
        + (done ? '⭐' : avail ? '⭐' : '🔒')
        + (avail || done ? '<span class="node-label">' + esc(u.name) + '·第' + (li + 1) + '课</span>' : '')
        + (done ? '<span class="badge">✅</span>' : '')
        + '</div></div>';
    });
    const chAvail = st.done.every(Boolean);
    html += '<div class="path-row"><div class="node ' + (st.challenge ? 'done' : chAvail ? 'available' : 'locked') + '" style="background:#7a5b00" data-unit="' + u.id + '" data-li="challenge">'
      + (st.challenge ? '👑' : chAvail ? '🏅' : '🔒')
      + (chAvail || st.challenge ? '<span class="node-label">单元挑战</span>' : '')
      + '</div></div></div>';
  });
  html += '<div style="text-align:center;color:var(--ink3);font-size:13px;padding:18px 0">更多单元制作中 🚧</div>';
  box.innerHTML = html;
  box.querySelectorAll('[data-unit]').forEach(n => n.addEventListener('click', () => {
    const u = window.UNITS.find(x => x.id === n.dataset.unit);
    const li = n.dataset.li;
    if (n.classList.contains('locked')) { toast('🔒 先完成前面的课程哦'); return; }
    startLesson(u, li);
  }));
  box.querySelectorAll('[data-py]').forEach(n => n.addEventListener('click', () => {
    if (n.classList.contains('locked')) { toast('🔒 先完成前面的拼音课哦'); return; }
    startPinyinLesson(n.dataset.py);
  }));
}

/* ---------------- 题目构建（汉字课程） ---------------- */
function learnedPool(exclude) {
  const learned = Object.keys(S.chars).filter(c => S.chars[c].learned && !exclude.includes(c) && CHAR_MAP[c]);
  return learned.map(c => CHAR_MAP[c]);
}
function distractorChars(answer, pool, n) {
  const cand = pool.filter(c => c.c !== answer.c);
  const extra = ALL_CHARS.filter(c => c.c !== answer.c && !pool.includes(c));
  return pick(cand.concat(extra), n);
}
function buildLessonQuestions(unit, li) {
  const newChars = li === 'challenge' ? unit.chars : chunk(unit.chars, 5)[li];
  const review = pick(learnedPool(newChars.map(c => c.c)), Math.min(3, Math.max(0, Object.keys(S.chars).filter(c => S.chars[c].learned).length - newChars.length)));
  const pool = newChars.concat(review);
  const qs = [];
  newChars.forEach((c, i) => {
    qs.push(i % 2 === 0
      ? { type: 'listen', ch: c, opts: shuffle([c].concat(distractorChars(c, pool, 3))) }
      : { type: 'py', ch: c, opts: shuffle([{ p: c.p, t: toneOf(c.p) }].concat(distractorChars(c, pool, 3).map(d => ({ p: d.p, t: toneOf(d.p) })))) });
  });
  qs.push({ type: 'pair', pairs: pick(pool, 5).map(c => ({ ch: c.c, zh: meanZh(c.m) })) });
  qs.push({ type: 'img', ch: pick1(newChars), opts: shuffle([pick1(newChars)].concat(distractorChars(pick1(newChars), pool, 3))) });
  const sc = newChars.flatMap(c => c.s.map(s => ({ ch: c.c, sent: s })));
  if (sc.length) {
    const s = pick1(sc);
    qs.push({ type: 'fill', s, opts: shuffle([s.ch].concat(distractorChars(CHAR_MAP[s.ch] || newChars[0], pool, 3).map(d => d.c))) });
  }
  const shortSents = newChars.flatMap(c => c.s.filter(x => x[0].length <= 9).map(x => ({ ch: c.c, sent: x })));
  if (shortSents.length) qs.push({ type: 'build', s: pick1(shortSents) });
  const wch = pick(newChars.filter(c => c.st <= 9), li === 'challenge' ? 2 : 1);
  wch.forEach(c => qs.push({ type: 'write', ch: c }));
  return { qs, newChars, pool, isChallenge: li === 'challenge' };
}

/* ---------------- 课程流程 ---------------- */
let L = null; // 当前课程会话
function startLesson(unit, li) {
  if (S.hearts.n <= 0) { offerHeartRefill(); return; }
  const built = buildLessonQuestions(unit, li);
  openSession({
    kind: 'char', unit, li, questions: shuffle(built.qs), newChars: built.newChars,
    bonus: built.isChallenge ? 10 : 0, title: unit.name + (built.isChallenge ? ' · 单元挑战' : ' · 第' + (Number(li) + 1) + '课')
  });
}
function startPinyinLesson(pid) {
  const pl = window.PINYIN_LESSONS.find(x => x.id === pid);
  const qs = [];
  if (pl.tone) {
    window.TONE_ROWS.forEach(row => {
      const shuffled = shuffle(row);
      qs.push({ type: 'toneChar', row, ch: pick1(row) });
      qs.push({ type: 'toneNum', row, ch: pick1(row) });
    });
  } else {
    pl.sets.forEach(set => {
      for (let k = 0; k < 2; k++) {
        const target = pick1(set);
        const deco = pick1(window.PINYIN_LESSONS.flatMap(x => x.sets || []).flat().filter(x => x[1] !== target[1] && !(set.some(m => m[1] === x[1]))));
        const allOpts = shuffle(set.concat(deco ? [deco] : []));
        qs.push({ type: 'audioMC', ch: target, opts: allOpts.map(m => ({ p: m[1] })) });
      }
    });
  }
  openSession({ kind: 'pinyin', pid, questions: shuffle(qs), newChars: [], title: '拼音启蒙 · ' + pl.name, bonus: 5 });
}
function openSession(cfg) {
  L = {
    cfg, idx: 0, correct: 0, wrong: 0, answered: false,
    total: cfg.questions.length, combo: 0, maxCombo: 0, mistakesThisQ: 0
  };
  $('#lessonTitle') && ($('#lessonTitle').textContent = cfg.title);
  $('#lesson').classList.remove('hidden');
  $('#lessonDone').classList.add('hidden');
  updateLessonProgress();
  nextQuestion();
}
function updateLessonProgress() {
  const pct = Math.round((L.idx / L.total) * 100);
  $('#lessonProgress .progress-fill').style.width = pct + '%';
  $('#lessonHearts').textContent = '❤️ × ' + S.hearts.n;
}
function nextQuestion() {
  if (!L) return;
  L.answered = false; L.mistakesThisQ = 0;
  if (L.idx >= L.total) return finishLesson();
  const q = L.cfg.questions[L.idx];
  renderQuestion(q);
  updateLessonProgress();
}
function setFeedback(mode, msg, solText) {
  const fb = $('#feedbackBar');
  fb.className = 'feedback ' + (mode || '');
  fb.innerHTML = (mode
    ? '<div class="fb-msg">' + (mode === 'good' ? '🎉 ' : '💪 ') + msg + '</div>' + (solText ? '<div class="fb-sol">' + esc(solText) + '</div>' : '')
    : '') + '<button class="btn ' + (mode === 'bad' ? 'red' : 'green') + ' wide" id="fbBtn">' + (mode ? '继续' : '检查') + '</button>';
  $('#fbBtn').addEventListener('click', onCheckOrContinue);
  fb.classList.remove('hidden');
}
function hideFeedback() { const fb = $('#feedbackBar'); fb.classList.add('hidden'); fb.innerHTML = ''; }
function onCheckOrContinue() {
  if (!L) return;
  const q = L.cfg.questions[L.idx];
  if (!L.answered) { q.check && q.check(); return; }
  hideFeedback();
  L.idx++;
  if (L.idx >= L.total) finishLesson(); else nextQuestion();
}
function answer(ok, solText, msgOk) {
  if (L.answered) return;
  L.answered = true;
  const q = L.cfg.questions[L.idx];
  q.lock = true;
  if (L.cfg.kind === 'review' && q._reviewChar) {
    scheduleChar(q._reviewChar, ok);
    S.stats.reviews++;
  }
  if (ok) {
    L.correct++; L.combo++; L.maxCombo = Math.max(L.maxCombo, L.combo);
    sfx(L.combo >= 4 ? 'combo' : 'correct');
    if (L.combo >= 4) toast('🔥 连对 ' + L.combo + ' 题！');
    setFeedback('good', msgOk || pick1(['太棒了！', '真厉害！', '答对啦！', '继续保持！']));
  } else {
    L.wrong++; L.combo = 0; loseHeart();
    sfx('wrong');
    setFeedback('bad', pick1(['再想想哦', '差一点点', '别灰心！']), solText || '');
  }
}
function renderQuestion(q) {
  const area = $('#qArea');
  area.innerHTML = '';
  area.scrollTop = 0;
  hideFeedback();
  const R = RENDERERS[q.type];
  if (R) R(area, q);
}

/* ---------------- 各题型渲染器 ---------------- */
function optCard(o, cls) {
  return '<button class="opt ' + (cls || '') + '"><span class="oz">' + esc(o.c || o.label) + '</span>'
    + (o.p ? '<span class="op" style="color:' + PY_COLOR(o.t) + '">' + esc(o.p) + '</span>' : '')
    + (o.zh ? '<span class="oe">' + esc(o.zh) + '</span>' : '') + '</button>';
}
function bindOptions(area, q, correctIdx, after) {
  const cards = [...area.querySelectorAll('.opt')];
  const speakTarget = () => {
    if (Array.isArray(q.ch)) speak(q.ch[0]);
    else if (q.ch && typeof q.ch === 'object') speakChar(q.ch.c);
    else if (q.ch) speakChar(q.ch);
  };
  const solTextOf = v => typeof v === 'string' ? v : (v ? (v.c || v.label || v.p) : '');
  cards.forEach((el, i) => {
    el.addEventListener('click', () => {
      if (L.answered) return;
      sfx('tap');
      if (i === correctIdx) {
        cards.forEach((c, j) => { if (j !== i) c.classList.add('dim'); });
        el.classList.add('correct');
        speakTarget();
        answer(true);
      } else {
        el.classList.add('wrong');
        answer(false, '正确答案：' + solTextOf(q.opts && q.opts[correctIdx]));
        el.classList.remove('wrong');
        cards[correctIdx].classList.add('correct');
      }
      after && after();
    });
  });
}
const RENDERERS = {
  /* 听音选字 */
  listen(area, q) {
    area.innerHTML = '<div class="q-title">听一听，选出你听到的字</div>'
      + '<div class="listen-hero"><button class="audio-ball" id="abtn">🔊</button></div>'
      + '<div class="opt-grid">' + q.opts.map(o => optCard({ c: o.c })).join('') + '</div>';
    $('#abtn').addEventListener('click', () => speakChar(q.ch.c));
    setTimeout(() => speakChar(q.ch.c), 350);
    const ci = q.opts.findIndex(o => o.c === q.ch.c);
    bindOptions(area, q, ci);
  },
  /* 看字选拼音 */
  py(area, q) {
    area.innerHTML = '<div class="q-title">选一选，它的读音是？</div>'
      + '<div class="listen-hero"><div class="audio-ball" style="background:#fff;color:var(--ink);box-shadow:0 6px 0 var(--line);font-size:56px;font-weight:900;color:var(--ink)">' + esc(q.ch.c) + '</div>'
      + '<button class="btn ghost" id="abtn">🔊 听发音</button></div>'
      + '<div class="opt-grid">' + q.opts.map(o => optCard({ label: o.p, p: '' })).join('') + '</div>';
    const ci = q.opts.findIndex(o => o.p === q.ch.p);
    // 拼音选项着声调色
    [...area.querySelectorAll('.opt')].forEach((el, i) => { el.querySelector('.oz').style.color = PY_COLOR(q.opts[i].t); });
    $('#abtn').addEventListener('click', () => speakChar(q.ch.c));
    setTimeout(() => speakChar(q.ch.c), 350);
    bindOptions(area, q, ci);
  },
  /* 看图选字 */
  img(area, q) {
    const c = q.ch;
    area.innerHTML = '<div class="q-title">' + esc(c.m) + '，是哪个字？</div>'
      + '<div class="scene-card" style="background:' + c.bg + '"><div class="scene-emoji a-' + c.a + '">' + c.e + '</div><div class="scene-cap">' + esc(c.t) + '</div></div>'
      + '<div class="opt-grid" style="margin-top:14px">' + q.opts.map(o => optCard({ c: o.c })).join('') + '</div>';
    const ci = q.opts.findIndex(o => o.c === c.c);
    bindOptions(area, q, ci);
  },
  /* 连线配对 */
  pair(area, q) {
    const left = shuffle(q.pairs), right = shuffle(q.pairs);
    area.innerHTML = '<div class="q-title">连一连：字和它的意思<span class="hint">点左边一个字，再点右边对应的意思</span></div>'
      + '<div class="pair-grid"><div class="pair-col">' + left.map(p => '<button class="pair" data-k="' + p.ch + '">' + esc(p.ch) + '</button>').join('') + '</div>'
      + '<div class="pair-col">' + right.map(p => '<button class="pair" data-k="' + p.ch + '">' + esc(meanZh(CHAR_MAP[p.ch].m)) + '</button>').join('') + '</div></div>';
    let selL = null, selR = null, matched = 0, fails = 0;
    area.querySelectorAll('.pair').forEach(el => el.addEventListener('click', () => {
      if (L.answered || el.classList.contains('matched')) return;
      sfx('tap');
      const isL = el.closest('.pair-col') === area.querySelector('.pair-col');
      if (isL) { area.querySelectorAll('.pair-col:first-child .pair.sel').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); selL = el; }
      else { area.querySelectorAll('.pair-col:last-child .pair.sel').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); selR = el; }
      if (selL && selR) {
        if (selL.dataset.k === selR.dataset.k) {
          selL.classList.add('matched'); selR.classList.add('matched');
          selL.classList.remove('sel'); selR.classList.remove('sel');
          speakChar(selL.dataset.k);
          matched++;
          selL = selR = null;
          if (matched === q.pairs.length) answer(fails <= 2, '', '全部连对！');
        } else {
          selL.classList.add('err'); selR.classList.add('err');
          fails++;
          sfx('wrong');
          setTimeout(() => { selL && selL.classList.remove('err', 'sel'); selR && selR.classList.remove('err', 'sel'); selL = selR = null; }, 420);
        }
      }
    }));
  },
  /* 写一写 */
  write(area, q) {
    const c = q.ch;
    area.innerHTML = '<div class="q-title">✏️ 写一写：' + esc(c.p) + '（' + esc(c.m) + '）<span class="hint">按照笔顺，一笔一笔写出来</span></div>'
      + '<div class="write-stage"><div class="write-box" id="wbox"></div></div>'
      + '<div class="write-meta" id="wmeta">🔊 <b>' + esc(c.c) + '</b> · 共' + c.st + '笔 · 用手指或鼠标在格子里写</div>'
      + '<div class="stroke-ctrls" style="max-width:280px;margin:10px auto 0"><button class="sbtn" id="whint">💡 看提示</button><button class="sbtn" id="wskip">听发音</button></div>';
    speakChar(c.c);
    $('#wskip').addEventListener('click', () => speakChar(c.c));
    const w = quizChar($('#wbox'), c.c, {
      onProgress: (r, t) => { $('#wmeta').textContent = '已写对 ' + r + ' / ' + t + ' 笔'; },
      onMistake: () => {},
      onComplete: () => {
        S.stats.writes++; save(); checkAch();
        $('#wmeta').innerHTML = '🎉 写对啦！「' + esc(c.c) + '」一共有 ' + c.st + ' 笔';
        answer(true, '', '笔顺满分！');
        L.answered = true;
        setFeedback('good', '写字小达人！');
      }
    });
    $('#whint').addEventListener('click', () => { try { w.showHint(); } catch (e) {} });
  },
  /* 选词填空 */
  fill(area, q) {
    const s = q.s, cn = s.sent[0], py = s.sent[1], en = s.sent[2];
    const blanked = cn.replace(s.ch, '<span class="fill-blank">__</span>');
    area.innerHTML = '<div class="q-title">选出填空正确的字</div>'
      + '<div class="fill-sent">' + blanked + '</div>'
      + '<div class="fill-trans">' + esc(py) + '<br>' + esc(en) + '</div>'
      + '<div class="opt-grid" style="margin-top:14px">' + q.opts.map(o => optCard({ c: o })).join('') + '</div>';
    const ci = q.opts.indexOf(s.ch);
    bindOptions(area, q, ci, () => { if (L.answered) speak(cn); });
  },
  /* 连词成句 */
  build(area, q) {
    const s = q.s, cn = s.sent[0];
    const clean = cn.replace(/[。！？，,.!?]/g, '');
    let tiles = shuffle(clean.split(''));
    area.innerHTML = '<div class="q-title">把字排成一句话<span class="hint">点击下方字块，按顺序排好</span></div>'
      + '<div class="sent-line" id="ansLine"></div>'
      + '<div class="tile-pool" id="tilePool">' + tiles.map((t, i) => '<button class="tile" data-i="' + i + '">' + esc(t) + '</button>').join('') + '</div>'
      + '<div class="fill-trans" style="margin-top:10px">意思：' + esc(s.sent[2]) + '</div>';
    const ansLine = $('#ansLine'), pool = $('#tilePool');
    let ans = [];
    pool.querySelectorAll('.tile').forEach(el => el.addEventListener('click', () => {
      if (L.answered) return;
      sfx('tap');
      el.classList.add('used');
      const tile = document.createElement('button');
      tile.className = 'tile'; tile.textContent = el.textContent;
      tile.addEventListener('click', () => {
        if (L.answered) return;
        el.classList.remove('used');
        tile.remove();
        ans = [...ansLine.querySelectorAll('.tile')];
        setCheckEnabled(ans.length === clean.length);
      });
      ansLine.appendChild(tile);
      ans = [...ansLine.querySelectorAll('.tile')];
      setCheckEnabled(ans.length === clean.length);
    }));
    function setCheckEnabled(on) {
      if (on) {
        setFeedback(null, '');
        $('#fbBtn').disabled = false;
      } else {
        setFeedback(null, '');
        $('#fbBtn').disabled = true;
      }
    }
    q.check = () => {
      const joined = ansLine.querySelectorAll('.tile');
      const val = [...joined].map(t => t.textContent).join('');
      if (val === clean) { speak(cn); answer(true, '', '造句正确！'); }
      else answer(false, '正确答案：' + cn);
    };
    setFeedback(null, '');
    $('#fbBtn').disabled = true;
  },
  /* 拼音听辨（听字音 → 选拼音） */
  audioMC(area, q) {
    area.innerHTML = '<div class="q-title">听发音，选出正确的拼音</div>'
      + '<div class="listen-hero"><button class="audio-ball" id="abtn">🔊</button></div>'
      + '<div class="opt-grid">' + q.opts.map(o => optCard({ label: o.p, p: '' })).join('') + '</div>';
    [...area.querySelectorAll('.opt')].forEach((el, i) => { el.querySelector('.oz').style.color = PY_COLOR(toneOf(q.opts[i].p)); });
    const play = () => speak(q.ch[0]);
    $('#abtn').addEventListener('click', play);
    setTimeout(play, 350);
    const ci = q.opts.findIndex(o => o.p === q.ch[1]);
    bindOptions(area, q, ci);
  },
  /* 声调选字（同音不同调） */
  toneChar(area, q) {
    const opts = shuffle(q.row);
    area.innerHTML = '<div class="q-title">听发音，选出正确的字<span class="hint">同一个拼音，四个声调大不同</span></div>'
      + '<div class="listen-hero"><button class="audio-ball" id="abtn">🔊</button></div>'
      + '<div class="opt-grid">' + opts.map(o => optCard({ c: o[0], p: o[1], t: toneOf(o[1]) })).join('') + '</div>';
    const play = () => speak(q.ch[0]);
    $('#abtn').addEventListener('click', play);
    setTimeout(play, 350);
    const ci = opts.findIndex(o => o[0] === q.ch[0]);
    bindOptions(area, q, ci);
  },
  /* 声调选择（听音选第几声） */
  toneNum(area, q) {
    const t = toneOf(q.ch[1]);
    area.innerHTML = '<div class="q-title">它是第几声？<span class="hint">听发音，选出正确的声调</span></div>'
      + '<div class="listen-hero"><button class="audio-ball" id="abtn" style="font-size:52px;font-weight:900">' + esc(q.ch[0]) + '</button></div>'
      + '<div class="opt-grid">' + [1, 2, 3, 4].map(n => '<button class="opt"><span class="oz" style="color:' + PY_COLOR(n) + '">' + toneNumName(n) + '</span><span class="op">' + ({1:'ā 平平稳稳',2:'á 向上扬',3:'ǎ 先降后升',4:'à 快速降下'}[n]) + '</span></button>').join('') + '</div>';
    const play = () => speak(q.ch[0]);
    $('#abtn').addEventListener('click', play);
    setTimeout(play, 350);
    const ci = [1, 2, 3, 4].indexOf(t);
    bindOptions(area, q, ci);
  }
};
/* ---------------- 课程结束 ---------------- */
function finishLesson() {
  const kind = L.cfg.kind;
  const acc = L.total ? Math.round(L.correct / L.total * 100) : 0;
  const perfect = L.wrong === 0;
  let xp = kind === 'review' ? 15 : 10;
  if (perfect) xp += 5;
  if (L.maxCombo >= 5) xp += 3;
  xp += L.cfg.bonus || 0;
  gainXp(xp);
  if (kind === 'char') {
    L.cfg.newChars.forEach(c => {
      const r = charRec(c.c);
      if (!r.learned) { r.learned = true; r.stage = 0; r.due = now() + EB_STAGES[0].min * 60000; }
    });
    const st = lessonUnitState(L.cfg.unit);
    if (L.cfg.li === 'challenge') st.challenge = true;
    else st.done[Number(L.cfg.li)] = true;
    S.stats.lessons++;
    if (perfect) S.stats.perfect++;
  } else if (kind === 'pinyin') {
    S.pinyinDone[L.cfg.pid] = true;
    S.stats.lessons++;
    if (perfect) S.stats.perfect++;
  } else if (kind === 'review') {
    if (L.correct >= 5) S.hearts.n = Math.min(5, S.hearts.n + 1);
    save();
  }
  checkAch(); save(); renderTopbar();
  const done = $('#lessonDone');
  done.classList.remove('hidden');
  const praise = acc === 100 ? '满分！你是小天才！' : acc >= 80 ? '表现很棒，继续加油！' : '进步啦，再练一练更好！';
  done.innerHTML = '<div class="sun">' + (perfect ? '🏆' : '🌞') + '</div>'
    + '<h2>' + (kind === 'review' ? '复习完成！' : '课程完成！') + '</h2>'
    + '<div class="muted">' + esc(L.cfg.title) + '</div>'
    + '<div class="done-stats">'
    + '<div class="done-stat"><div class="v">+' + xp + '</div><div class="k">经验值 XP</div></div>'
    + '<div class="done-stat"><div class="v">' + acc + '%</div><div class="k">正确率</div></div>'
    + '<div class="done-stat"><div class="v">' + L.maxCombo + '</div><div class="k">最高连对</div></div>'
    + '</div>'
    + '<div class="muted" style="margin-bottom:6px">' + (kind === 'char' && L.cfg.newChars.length ? '📅 新学的 ' + L.cfg.newChars.map(c => c.c).join(' ') + ' 已进入艾宾浩斯复习计划（' + EB_STAGES[0].label + '后提醒）' : praise) + '</div>'
    + '<button class="btn wide" id="doneBack">' + (perfect ? '继续闯关' : '回到课程') + '</button>'
    + '<button class="btn blue wide" id="doneMore">' + (kind === 'review' ? '继续学习' : '去复习旧字') + '</button>';
  sfx('win');
  confetti(perfect ? 40 : 24);
  $('#doneBack').addEventListener('click', () => { closeLesson(); });
  $('#doneMore').addEventListener('click', () => { closeLesson(); switchTab(kind === 'char' ? 'review' : 'learn'); });
}
function closeLesson() {
  L = null;
  $('#lesson').classList.add('hidden');
  hideFeedback();
  renderTopbar();
  switchTab(currentTab === 'review' ? 'review' : 'learn');
}
function confetti(n) {
  const colors = ['#58cc02', '#1cb0f6', '#ff4b4b', '#ffc800', '#ce82ff'];
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div');
    d.className = 'confetti';
    d.style.left = Math.random() * 100 + '%';
    d.style.background = pick1(colors);
    d.style.animationDelay = (Math.random() * .6) + 's';
    d.style.transform = 'scale(' + (0.7 + Math.random() * 0.8) + ')';
    $('#app').appendChild(d);
    setTimeout(() => d.remove(), 3400);
  }
}
function offerHeartRefill() {
  const m = openDialog('<div style="font-size:44px">💔</div><h3>爱心用完了！</h3><p class="muted">完成一次复习可以赚回爱心，<br>或等明天自动恢复满 5 颗。</p>'
    + '<div class="dlg-btns"><button class="btn ghost" id="dlgClose">关闭</button><button class="btn blue" id="dlgReview">去复习赚爱心</button></div>');
  m.querySelector('#dlgClose').addEventListener('click', () => m.remove());
  m.querySelector('#dlgReview').addEventListener('click', () => { m.remove(); switchTab('review'); });
}
$('#quitBtn').addEventListener('click', () => {
  const m = openDialog('<div style="font-size:40px">🚪</div><h3>确定退出吗？</h3><p class="muted">本课的进度将不会保存哦。</p>'
    + '<div class="dlg-btns"><button class="btn ghost" id="dlgStay">继续学习</button><button class="btn red" id="dlgQuit">退出</button></div>');
  m.querySelector('#dlgStay').addEventListener('click', () => m.remove());
  m.querySelector('#dlgQuit').addEventListener('click', () => { m.remove(); L = null; $('#lesson').classList.add('hidden'); switchTab('learn'); });
});

/* ---------------- 复习页 ---------------- */
function renderReview() {
  const due = dueChars();
  const learned = Object.keys(S.chars).filter(c => S.chars[c].learned);
  const buckets = EB_STAGES.map((st, i) => learned.filter(c => S.chars[c].stage === i).length);
  const nd = nextDueIn();
  let html = '<div class="hero-card blue"><h2>🔁 艾宾浩斯复习</h2>'
    + '<div class="big-num">' + due.length + '</div>'
    + '<p>' + (due.length ? '个汉字到了复习时间' : (nd ? '下一个复习：' + fmtDue(nd) : '学完第一课就会开始安排复习')) + '</p>'
    + '<button class="btn gold" style="margin-top:12px" id="startReview"' + (due.length ? '' : ' disabled') + '>开始复习 ' + Math.min(due.length, 10) + ' 个</button></div>';
  html += '<div class="card"><h3>📅 记忆周期（艾宾浩斯遗忘曲线）</h3><div class="ebbing-timeline">'
    + EB_STAGES.map((st, i) => '<div class="eb-chip ' + (i === 0 && buckets[0] ? 'hot' : '') + '"><div class="n">' + buckets[i] + '</div><div class="l">' + st.label + '</div></div>').join('')
    + '<div class="eb-chip"><div class="n">' + learned.filter(c => S.chars[c].stage >= EB_STAGES.length - 1).length + '</div><div class="l">已巩固</div></div>'
    + '</div><p class="muted" style="margin-top:10px">答对 → 进入下一周期；答错 → 退回重新记。科学对抗遗忘，记得更牢！</p></div>';
  html += '<div class="card"><h3>📖 复习小贴士</h3><p class="muted">在 5 分钟、30 分钟、12 小时、1 天、2 天、4 天、7 天、15 天这几个关键时间点复习，记忆留存率可以大幅提升。每天复习 5 分钟，胜过一次学 1 小时！</p></div>';
  $('#scr-review').innerHTML = html;
  const btn = $('#startReview');
  if (btn) btn.addEventListener('click', startReviewSession);
}
function startReviewSession() {
  const due = dueChars();
  if (!due.length) { toast('太棒了，暂时没有要复习的字！'); return; }
  const chosen = pick(due, Math.min(due.length, 10)).map(d => CHAR_MAP[d.c]).filter(Boolean);
  const qs = chosen.map(c => {
    const types = ['listen', 'py', 'img'];
    const t = c.st <= 9 && Math.random() < 0.3 ? 'write' : pick1(types);
    const q = { type: t, ch: c, _reviewChar: c.c };
    if (t === 'listen' || t === 'img') q.opts = shuffle([c].concat(distractorChars(c, chosen, 3)));
    if (t === 'py') q.opts = shuffle([{ p: c.p, t: toneOf(c.p) }].concat(distractorChars(c, chosen, 3).map(d => ({ p: d.p, t: toneOf(d.p) }))));
    return q;
  });
  openSession({ kind: 'review', questions: qs, newChars: [], title: '艾宾浩斯复习 · ' + qs.length + ' 个汉字' });
}

/* ---------------- 拼音页 ---------------- */
function toneSvg(n) {
  const paths = { 1: 'M8,14 L58,14', 2: 'M8,44 L58,12', 3: 'M8,12 C24,46 42,46 58,12', 4: 'M8,12 L58,44' };
  const col = PY_COLOR(n);
  return '<svg class="tone-svg" viewBox="0 0 66 56"><circle cx="33" cy="47" r="4" stroke="' + col + '"/><path d="' + paths[n] + '" stroke="' + col + '"/></svg>';
}
function renderPinyin() {
  const rows = ['mā 妈', 'má 麻', 'mǎ 马', 'mà 骂'];
  let html = '<div class="card" style="margin-top:0"><h3>🎹 四声变变变 <small style="font-weight:600;color:var(--ink2)">点击听读音，看声调小尾巴</small></h3><div class="tone-card">'
    + rows.map((r, i) => '<button class="tone-item" data-tone="' + (i + 1) + '" data-char="' + rows[i].split(' ')[1] + '"><div class="tt" style="color:' + PY_COLOR(i + 1) + '">' + rows[i].split(' ')[0] + '</div>' + toneSvg(i + 1) + '<div class="td">' + rows[i].split(' ')[1] + ' · ' + toneNumName(i + 1) + '</div></button>').join('')
    + '</div></div>'
    + '<p class="muted" style="margin:2px 0 12px">声母、韵母使用标准呼读音录音（第一声），点击卡片即可听标准发音。</p>';
  const sec = (title, key, sub) => '<div class="sec-title">' + title + ' <small>' + sub + '</small></div><div class="chip-grid" data-key="' + key + '">'
    + window.PINYIN_DATA[key].map(x => '<button class="py-chip" data-py="' + esc(x[0]) + '" data-rep="' + esc(x[1]) + '"><div class="py" style="color:' + PY_COLOR(toneOf(x[1])) + '">' + esc(x[0]) + '</div><div class="rep">' + esc(x[1]) + '</div></button>').join('') + '</div>';
  html += sec('🔤 声母', 'initials', '23个 · 呼读音');
  html += sec('🎵 韵母', 'finals', '24个 · 示例字');
  html += sec('⭐ 整体认读', 'integral', '16个 · 示例字');
  html += '<div style="margin-top:16px"><button class="btn wide" id="pyQuiz">🎯 拼音小测（考考你的耳朵）</button></div>';
  $('#scr-pinyin').innerHTML = html;
  $$('#scr-pinyin .py-chip').forEach(el => el.addEventListener('click', () => {
    sfx('tap');
    const file = (window.PINYIN_AUDIO || {})[el.dataset.py];
    if (!(file && playLocal(file, el.dataset.rep))) speak(el.dataset.rep);
    el.classList.add('played');
    setTimeout(() => el.classList.remove('played'), 900);
  }));
  $$('#scr-pinyin .tone-item').forEach(el => el.addEventListener('click', () => {
    sfx('tap');
    speak(el.dataset.char);
    const svg = el.querySelector('.tone-svg');
    svg.classList.remove('on'); void svg.offsetWidth; svg.classList.add('on');
  }));
  $('#pyQuiz').addEventListener('click', () => startPinyinLesson(pick1(['p1', 'p2'])));
  setTimeout(() => $$('#scr-pinyin .tone-svg').forEach((svg, i) => setTimeout(() => svg.classList.add('on'), i * 150)), 300);
}

/* ---------------- 字典页 ---------------- */
function renderDict() {
  const q = ($('#dictSearch') && $('#dictSearch').value || '').trim();
  let html = '<input class="search-box" id="dictSearch" placeholder="🔍 搜索汉字或拼音…" value="' + esc(q) + '">';
  html += '<div class="sec-title">📚 汉字总表 <small>已学 ' + Object.keys(S.chars).filter(c => S.chars[c].learned).length + ' / ' + ALL_CHARS.length + '</small></div>';
  const list = ALL_CHARS.filter(c => !q || c.c.includes(q) || c.p.includes(q.toLowerCase()));
  html += '<div class="dict-grid">' + list.map(c => {
    const learned = S.chars[c.c] && S.chars[c.c].learned;
    return '<button class="dict-tile ' + (learned ? '' : 'new') + '" data-ch="' + c.c + '">'
      + (learned ? '' : '<span class="lock-mini">🔒</span>')
      + '<div class="dz">' + esc(c.c) + '</div><div class="dp" style="color:' + PY_COLOR(toneOf(c.p)) + '">' + esc(c.p) + '</div></button>';
  }).join('') + '</div>';
  $('#scr-dict').innerHTML = html;
  $('#dictSearch').addEventListener('input', renderDict);
  $$('#scr-dict .dict-tile').forEach(el => el.addEventListener('click', () => openCharDetail(el.dataset.ch)));
}
function openCharDetail(ch) {
  const c = CHAR_MAP[ch];
  if (!c) return;
  const learned = S.chars[c.c] && S.chars[c.c].learned;
  const mask = document.createElement('div');
  mask.className = 'modal-mask';
  mask.innerHTML = '<div class="modal">'
    + '<div class="modal-head"><h2>' + esc(c.c) + ' <span style="color:' + PY_COLOR(toneOf(c.p)) + '">' + esc(c.p) + '</span></h2><button class="close-x">✕</button></div>'
    + '<div class="scene-card" style="background:' + c.bg + '"><div class="scene-emoji a-' + c.a + '">' + c.e + '</div><div class="scene-cap">' + esc(c.t) + '</div><div style="margin-top:6px;font-weight:700;color:var(--ink2)">' + esc(c.m) + '</div></div>'
    + '<div class="sec-title">✍️ 笔顺动画详解</div>'
    + '<div class="stroke-stage"><div class="hanzi-box" id="hwBox"></div>'
    + '<div class="stroke-info"><div class="big-py" style="color:' + PY_COLOR(toneOf(c.p)) + '">' + esc(c.p) + ' ' + toneNumName(toneOf(c.p)) + '</div>'
    + '<div class="chips"><span class="tag">共 ' + c.st + ' 笔</span><span class="tag">部首 ' + esc(c.rad) + '</span><button class="sbtn blue" id="hwSay" style="min-height:36px;flex:none;padding:0 12px">🔊 发音</button></div></div></div>'
    + '<div class="stroke-ctrls"><button class="sbtn green" id="hwPlay">▶ 笔顺演示</button><button class="sbtn" id="hwSlow">🐢 慢速</button><button class="sbtn blue" id="hwWrite">✏️ 我来写</button></div>'
    + '<div class="write-meta" id="hwMeta">共 ' + c.st + ' 笔 · 演示用绿色高亮最新笔画</div>'
    + '<div class="tip-box">💡 <b>字源小故事：</b>' + esc(c.tip) + '</div>'
    + '<div class="sec-title">🧩 常用词语</div><div class="word-row">'
    + c.w.map(w => '<button class="word-chip" data-w="' + esc(w[0]) + '">' + esc(w[0]) + ' <span class="wp">' + esc(w[1]) + '</span></button>').join('')
    + '</div>'
    + '<div class="sec-title">💬 看图造句</div>'
    + c.s.map(s => '<div class="sentence-card"><span class="sc-audio">🔊</span><div class="sc-cn">' + esc(s[0]) + '</div><div class="sc-py">' + esc(s[1]) + '</div><div class="sc-en">' + esc(s[2]) + '</div></div>').join('')
    + '<div style="margin-top:14px"><button class="btn ' + (learned ? 'ghost' : 'green') + ' wide" id="hwStar">' + (learned ? '⭐ 已在复习计划中 · 再巩固一下' : '⭐ 加入艾宾浩斯复习计划') + '</button></div>'
    + '</div>';
  $('#app').appendChild(mask);
  mask.querySelector('.close-x').addEventListener('click', () => mask.remove());
  mask.addEventListener('click', e => { if (e.target === mask) mask.remove(); });
  const box = mask.querySelector('#hwBox');
  let writer = playStrokes(box, c.c, { size: 186 });
  const replay = slow => { writer = playStrokes(box, c.c, { size: 186, slow }); };
  mask.querySelector('#hwPlay').addEventListener('click', () => replay(false));
  mask.querySelector('#hwSlow').addEventListener('click', () => replay(true));
  mask.querySelector('#hwSay').addEventListener('click', () => speakChar(c.c));
  mask.querySelector('#hwWrite').addEventListener('click', () => {
    mask.querySelector('#hwMeta').textContent = '用手指或鼠标，按笔顺写出来！写错会抖动提醒';
    quizChar(box, c.c, { size: 186, onComplete: () => { mask.querySelector('#hwMeta').innerHTML = '🎉 写对啦！'; S.stats.writes++; checkAch(); save(); } });
  });
  mask.querySelectorAll('.word-chip').forEach(el => el.addEventListener('click', () => { sfx('tap'); speak(el.dataset.w); }));
  mask.querySelectorAll('.sentence-card').forEach(el => el.addEventListener('click', () => { sfx('tap'); speak(el.querySelector('.sc-cn').textContent); }));
  mask.querySelector('#hwStar').addEventListener('click', () => {
    const r = charRec(c.c);
    r.learned = true;
    if (r.stage < 0) { r.stage = 0; r.due = now() + EB_STAGES[0].min * 60000; }
    save(); checkAch();
    toast('⭐ 已加入复习计划（' + fmtDue(r.due - now()) + '后复习）', 'gold');
    renderDict();
  });
}

/* ---------------- 我的页 ---------------- */
const ACHS = [
  { id: 'first', icon: '🎉', name: '初次上课', cond: s => s.stats.lessons >= 1 },
  { id: 'xp50', icon: '⚡', name: '攒到50XP', cond: s => s.xp >= 50 },
  { id: 'streak3', icon: '🔥', name: '连续3天', cond: s => s.streak.c >= 3 },
  { id: 'streak7', icon: '🏅', name: '连续7天', cond: s => s.streak.c >= 7 },
  { id: 'c10', icon: '📚', name: '学会10字', cond: () => Object.values(S.chars).filter(r => r.learned).length >= 10 },
  { id: 'c40', icon: '🎓', name: '学会40字', cond: () => Object.values(S.chars).filter(r => r.learned).length >= 40 },
  { id: 'c80', icon: '🌟', name: '学会80字', cond: () => Object.values(S.chars).filter(r => r.learned).length >= 80 },
  { id: 'rev20', icon: '🔁', name: '复习达人', cond: s => s.stats.reviews >= 20 },
  { id: 'wr10', icon: '✏️', name: '书写达人', cond: s => s.stats.writes >= 10 },
  { id: 'perfect', icon: '💯', name: '满分一课', cond: s => s.stats.perfect >= 1 }
];
function checkAch() {
  ACHS.forEach(a => {
    if (!S.ach[a.id] && a.cond(S)) {
      S.ach[a.id] = true;
      toast('🏆 成就解锁：' + a.name, 'gold');
      sfx('star');
    }
  });
}
function renderVoiceOptions() {
  const sel = $('#voiceSel');
  if (!sel) return;
  sel.innerHTML = (zhVoices.length ? zhVoices : [{ name: '', lang: 'zh' }]).map(v =>
    '<option value="' + esc(v.name) + '"' + (S.settings.voice === v.name ? ' selected' : '') + '>' + esc((v.name || '系统默认') + (v.lang ? '（' + v.lang + '）' : '')) + '</option>').join('');
}
function renderMe() {
  const lv = levelInfo(S.xp);
  const t = todayStr();
  const todayXp = S.stats.todayXp.d === t ? S.stats.todayXp.v : 0;
  const accAll = (() => {
    let c = 0, w = 0;
    Object.values(S.chars).forEach(r => { c += r.correct; w += r.wrong; });
    return c + w ? Math.round(c / (c + w) * 100) + '%' : '—';
  })();
  let html = '<div class="me-head"><div class="avatar">🐼</div><div style="flex:1"><b style="font-size:18px">小小汉字家</b><div class="muted">Lv.' + lv.lv + ' · ' + S.xp + ' XP</div>'
    + '<div class="xp-track"><div class="xp-fill" style="width:' + lv.pct + '%"></div></div><div class="muted" style="font-size:11px">距下一级还差 ' + Math.max(0, lv.next - S.xp) + ' XP</div></div></div>';
  html += '<div class="stat-grid" style="margin-top:14px">'
    + '<div class="stat-box"><div class="v">🔥 ' + S.streak.c + '</div><div class="k">连续学习天数</div></div>'
    + '<div class="stat-box"><div class="v">⚡ ' + S.xp + '</div><div class="k">总经验值</div></div>'
    + '<div class="stat-box"><div class="v">📚 ' + Object.values(S.chars).filter(r => r.learned).length + '</div><div class="k">已学汉字</div></div>'
    + '<div class="stat-box"><div class="v">' + accAll + '</div><div class="k">练习正确率</div></div></div>';
  html += '<div class="card"><h3>🎯 今日目标</h3><div class="xp-track" style="margin:4px 0"><div class="xp-fill" style="width:' + Math.min(100, todayXp / 20 * 100) + '%"></div></div>'
    + '<p class="muted">' + todayXp + ' / 20 XP · ' + (todayXp >= 20 ? '今日目标达成，太棒了！' : '继续加油，再得 ' + (20 - todayXp) + ' XP 就达标！') + '</p></div>';
  html += '<div class="card"><h3>🏆 成就墙</h3><div class="ach-grid">'
    + ACHS.map(a => '<div class="ach ' + (S.ach[a.id] ? 'unlocked' : 'locked') + '"><div class="ai">' + a.icon + '</div><div class="an">' + a.name + '</div></div>').join('')
    + '</div></div>';
  html += '<div class="card"><h3>⚙️ 设置</h3>'
    + '<div class="set-row"><div class="sl">🔊 语速<small>真人发音速度</small></div><select class="seg" id="rateSel"><option value="slow"' + (S.settings.rate === 'slow' ? ' selected' : '') + '>慢速（启蒙）</option><option value="normal"' + (S.settings.rate === 'normal' ? ' selected' : '') + '>正常</option><option value="fast"' + (S.settings.rate === 'fast' ? ' selected' : '') + '>快速</option></select></div>'
    + '<div class="set-row"><div class="sl">🎧 发音引擎<small>在线语音更标准；离线时自动用系统语音</small></div><select class="seg" id="modeSel"><option value="auto"' + ((S.settings.mode || 'auto') === 'auto' ? ' selected' : '') + '>自动（推荐）</option><option value="tts"' + (S.settings.mode === 'tts' ? ' selected' : '') + '>仅系统语音</option></select></div>'
    + '<div class="set-row"><div class="sl">🗣️ 发音人<small>系统中文语音' + (zhVoices.length ? '' : '（未检测到，请用手机/电脑浏览器打开）') + '</small></div><select class="seg" id="voiceSel"></select></div>'
    + '<div class="set-row"><div class="sl">🎵 音效<small>答对答错的提示音</small></div><div class="switch ' + (S.settings.sfx ? 'on' : '') + '" id="sfxSwitch"></div></div>'
    + '<div class="set-row"><div class="sl">🗑️ 重置进度<small>清除所有学习记录</small></div><button class="btn red" style="min-height:40px;padding:0 14px" id="resetBtn">重置</button></div>'
    + '<p class="muted" style="margin-top:10px">数据保存在本设备浏览器中（localStorage），无需联网也可学习。</p></div>';
  $('#scr-me').innerHTML = html;
  renderVoiceOptions();
  $('#rateSel').addEventListener('change', e => { S.settings.rate = e.target.value; save(); toast('语速已调整'); });
  $('#modeSel').addEventListener('change', e => {
    S.settings.mode = e.target.value;
    remoteOff = false; remoteFail = 0;
    save();
    toast(e.target.value === 'tts' ? '已切换为系统语音' : '已切换为自动发音');
    speak('你好，我是你的发音小老师');
  });
  $('#voiceSel').addEventListener('change', e => { S.settings.voice = e.target.value; save(); speak('你好，我是你的发音小老师'); });
  $('#sfxSwitch').addEventListener('click', e => { S.settings.sfx = !S.settings.sfx; e.target.classList.toggle('on', S.settings.sfx); save(); });
  $('#resetBtn').addEventListener('click', () => {
    const m = openDialog('<div style="font-size:40px">⚠️</div><h3>重置所有进度？</h3><p class="muted">学习记录、经验值、成就都会被清除。</p><div class="dlg-btns"><button class="btn ghost" id="dlgNo">取消</button><button class="btn red" id="dlgYes">确认重置</button></div>');
    m.querySelector('#dlgNo').addEventListener('click', () => m.remove());
    m.querySelector('#dlgYes').addEventListener('click', () => { localStorage.removeItem(KEY); location.reload(); });
  });
}

/* ---------------- 顶栏 / 页签 ---------------- */
function renderTopbar() {
  $('#streakN').textContent = S.streak.c;
  $('#xpN').textContent = S.xp;
  $('#heartsN').textContent = S.hearts.n;
}
let currentTab = 'learn';
function switchTab(name) {
  currentTab = name;
  $$('#screens .screen').forEach(s => s.classList.add('hidden'));
  $('#scr-' + name).classList.remove('hidden');
  $$('#tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  ({ learn: renderLearn, review: renderReview, pinyin: renderPinyin, dict: renderDict, me: renderMe })[name]();
  $('#screens').scrollTop = 0;
}

/* ---------------- 启动 ---------------- */
function boot() {
  rollDay();
  if (!S.seen) {
    $('#welcome').classList.remove('hidden');
    $('#startBtn').addEventListener('click', () => {
      S.seen = true; save();
      $('#welcome').classList.add('hidden');
      $('#main').classList.remove('hidden');
      sfx('win');
      switchTab('learn');
      setTimeout(() => speak('你好！欢迎来到拼音乐园'), 500);
    });
  } else {
    $('#main').classList.remove('hidden');
    switchTab('learn');
  }
  $$('#tabbar button').forEach(b => b.addEventListener('click', () => { sfx('tap'); switchTab(b.dataset.tab); }));
  renderTopbar();
}
document.addEventListener('DOMContentLoaded', boot);
