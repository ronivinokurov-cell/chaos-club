/* ===== CHAOS CLUB · core ===== */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
const rnd = n => Math.floor(Math.random() * n);
const rndInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = rnd(i + 1); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = n => Math.round(n).toLocaleString('en-US');

const CATS = [
  { id: 'brain', name: 'מוח וחידות', emoji: '🧠', c1: '#8b5cf6', c2: '#3ad0ff', sub: 'זיכרון, היגיון ומספרים' },
  { id: 'party', name: 'משחקי חברה', emoji: '🎉', c1: '#ff4d8d', c2: '#ff8a5c', sub: 'קלפים, גלגל ואתגרים לחבורה' },
  { id: 'music', name: 'מוזיקה ובידור', emoji: '🎵', c1: '#ffb020', c2: '#ffe066', sub: 'מנגינות, קצב ואוזן מוזיקלית' },
  { id: 'create', name: 'יצירתיות', emoji: '🎨', c1: '#22d3a5', c2: '#7de2ff', sub: 'ציור, עיצוב ומכונת סיפורים' },
  { id: 'speed', name: 'מהירות ואתגרים', emoji: '⚡', c1: '#ff6b3d', c2: '#ffd166', sub: 'רפלקסים, קליקים והישרדות' },
  { id: 'words', name: 'מילים ושפה', emoji: '🅰️', c1: '#5b8cff', c2: '#7de2ff', sub: 'תלי תלוי, אנגרמות ופתגמים' },
  { id: 'numbers', name: 'חשבון ומספרים', emoji: '🔢', c1: '#f59e0b', c2: '#ffd166', sub: 'כפל, חילוק ומטרות' },
  { id: 'geo', name: 'גיאוגרפיה ועולם', emoji: '🌍', c1: '#22d3a5', c2: '#7de2ff', sub: 'דגלים, בירות ומדינות' },
  { id: 'science', name: 'מדע וטבע', emoji: '🔬', c1: '#8b5cf6', c2: '#22d3a5', sub: 'גוף, חלל ובעלי חיים' },
  { id: 'sport', name: 'ספורט', emoji: '⚽', c1: '#ff6b3d', c2: '#ffd166', sub: 'חוקים, ענפים ובעיטות' },
  { id: 'food', name: 'אוכל ומטבח', emoji: '🍳', c1: '#ff4d8d', c2: '#ff8a5c', sub: 'מאכלים, מטבחים ומתכונים' },
  { id: 'kitchen', name: 'סדנת בישול', emoji: '👨‍🍳', c1: '#a3e635', c2: '#fde047', sub: 'פיצה, סושי, גלידה, המבורגר ועוד' },
  { id: 'board', name: 'משחקי קופסא', emoji: '🎲', c1: '#f472b6', c2: '#a78bfa', sub: 'דמקה, רוורסי, ארבע בשורה ועוד' },
  { id: 'history', name: 'היסטוריה ותרבות', emoji: '🏛️', c1: '#c084fc', c2: '#f0abfc', sub: 'אירועים, אנשים והמצאות' },
  { id: 'screen', name: 'מסך וקולנוע', emoji: '🎬', c1: '#ffb020', c2: '#ffe066', sub: 'סרטים, סדרות ודמויות' },
  { id: 'logic', name: 'היגיון ומרחב', emoji: '🧭', c1: '#38bdf8', c2: '#a78bfa', sub: 'מבוכים, פאזלים ומרחב' },
  { id: 'garden', name: 'גינה וטבע', emoji: '🌱', c1: '#34d399', c2: '#a3e635', sub: 'צמחים, עונות וחרקים' },
  { id: 'mystery', name: 'תעלומות ובלשים', emoji: '🕵️', c1: '#818cf8', c2: '#c084fc', sub: 'חקירות, צפנים ואליבי' },
  { id: 'money', name: 'כסף וקניות', emoji: '💰', c1: '#fbbf24', c2: '#f97316', sub: 'עודף, הנחות ותקציב' },
  { id: 'luck', name: 'קזינו ומזל', emoji: '🎰', c1: '#facc15', c2: '#fb7185', sub: 'קוביות, גלגל ומזל' }
];
const CAT = id => CATS.find(c => c.id === id) || CATS[0];

/* ---------- storage ---------- */
const Store = (() => {
  const mem = {};
  const get = k => { try { const v = localStorage.getItem(k); return v == null ? mem[k] : v; } catch (e) { return mem[k]; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } };
  const S = { best: {}, total: 0, plays: 0, muted: false, theme: 'dark',
    coins: 50, lives: 1, items: { time: 0, hint: 0, x2: 0 }, board: [], name: '', carry: null };
  try { const raw = get('chaosclub.v2'); if (raw) Object.assign(S, JSON.parse(raw)); } catch (e) {}
  const persist = () => set('chaosclub.v2', JSON.stringify(S));
  return {
    get data() { return S; },
    best(id) { return S.best[id] || 0; },
    save(id, score) {
      const prev = S.best[id] || 0, isBest = score > prev;
      if (isBest) S.best[id] = score;
      S.plays = (S.plays || 0) + 1;
      S.total = Math.round((S.total || 0) + score);
      persist();
      return { best: S.best[id], isBest };
    },
    played() { return Object.keys(S.best).length; },
    muted() { return !!S.muted; },
    setMuted(v) { S.muted = !!v; persist(); },
    musicOn() { return !!S.music; },
    setMusic(v) { S.music = !!v; persist(); },
    theme() { return S.theme || 'dark'; },
    setTheme(t) { S.theme = t; persist(); },
    /* --- economy --- */
    coins() { return Math.max(0, Math.round(S.coins || 0)); },
    addCoins(n) { S.coins = Math.max(0, Math.round((S.coins || 0) + n)); persist(); },
    lives() { return Math.max(0, S.lives || 0); },
    addLives(n) { S.lives = Math.max(0, (S.lives || 0) + n); persist(); },
    useLife() { if ((S.lives || 0) <= 0) return false; S.lives--; persist(); return true; },
    item(k) { return (S.items && S.items[k]) || 0; },
    addItem(k, n) { S.items = S.items || {}; S.items[k] = (S.items[k] || 0) + n; persist(); },
    spendTime(max) {
      S.items = S.items || {};
      const take = Math.min(max, S.items.time || 0);
      if (take > 0) { S.items.time -= take; persist(); }
      return take;
    },
    useItem(k) { if (!S.items || (S.items[k] || 0) <= 0) return false; S.items[k]--; persist(); return true; },
    board() { return (S.board || []).slice(); },
    record(e) {
      S.board = S.board || [];
      S.board.push(e);
      S.board.sort((a, b) => b.score - a.score || b.ts - a.ts);
      S.board = S.board.slice(0, 60);
      persist();
    },
    playerName() { return S.name || ''; },
    setPlayerName(n) { S.name = (n || '').trim().slice(0, 18); persist(); },
    setCarry(id, score) { S.carry = { id, score: Math.round(score) }; persist(); },
    takeCarry(id) {
      if (S.carry && S.carry.id === id) { const c = S.carry.score; S.carry = null; persist(); return c; }
      return 0;
    },
    reset() { S.best = {}; S.total = 0; S.plays = 0; persist(); }
  };
})();

/* ---------- economy ---------- */
function coinsFor(score) {
  if (!score || score <= 0) return 0;
  let c = Math.floor(score / 10);
  if (score >= 150) c += 3;
  if (score >= 300) c += 8;
  if (score >= 600) c += 20;
  return c;
}
const SHOP = [
  { id: 'life1', emoji: '❤️', name: 'חיים בודדים', desc: 'חיים אחד שמאפשר להמשיך באותו ניקוד', price: 25, give: () => Store.addLives(1), tag: 'חיים' },
  { id: 'life2', emoji: '💕', name: 'חבילת 2 חיים', desc: 'שני חיים — המחיר משתלם יותר', price: 45, give: () => Store.addLives(2), tag: 'חיים' },
  { id: 'life3', emoji: '💖', name: 'חבילת 3 חיים', desc: 'שלושה חיים לסבבים ארוכים', price: 60, give: () => Store.addLives(3), tag: 'חיים' },
  { id: 'life4', emoji: '💗', name: 'חבילת 4 חיים', desc: 'ארבעה חיים — החבילה הגדולה', price: 75, give: () => Store.addLives(4), tag: 'חיים' },
  { id: 'time15', emoji: '⏱️', name: 'תוספת זמן +15 שנ׳', desc: 'מתווסף לשלב הבא בלבד, אוטומטית', price: 20, give: () => Store.addItem('time', 15), tag: 'בוסטרים' },
  { id: 'time30', emoji: '⏳', name: 'תוספת זמן +30 שנ׳', desc: 'חצי דקה שלמה לשלב הבא בלבד', price: 35, give: () => Store.addItem('time', 30), tag: 'בוסטרים' },
  { id: 'hint', emoji: '🔍', name: 'רמז 50:50', desc: 'מוריד שתי תשובות שגויות בחידון', price: 15, give: () => Store.addItem('hint', 1), tag: 'בוסטרים' },
  { id: 'x2', emoji: '✨', name: 'ניקוד כפול', desc: 'מכפיל פי שניים את הניקוד במשחק הבא', price: 50, give: () => Store.addItem('x2', 1), tag: 'בוסטרים' },
  { id: 'pack', emoji: '🎁', name: 'חבילת בוסטר', desc: '2 חיים + רמז + תוספת זמן 15 שנ׳', price: 70, give: () => { Store.addLives(2); Store.addItem('hint', 1); Store.addItem('time', 15); }, tag: 'משתלם' },
  { id: 'mega', emoji: '👑', name: 'חבילת אלוף', desc: '4 חיים + 2 רמזים + 30 שנ׳ + ניקוד כפול', price: 140, give: () => { Store.addLives(4); Store.addItem('hint', 2); Store.addItem('time', 30); Store.addItem('x2', 1); }, tag: 'משתלם' }
];
function walletText() {
  return `🪙 ${fmt(Store.coins())} · ❤️ ${Store.lives()}`;
}
function walletBump() {
  document.querySelectorAll('[data-wallet]').forEach(n => { n.innerHTML = `<b>🪙 ${fmt(Store.coins())}</b> · ❤️ ${Store.lives()}`; });
}

/* ---------- sound ---------- */
const Sound = (() => {
  let ctx = null;
  function ac() {
    if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function tone(o) {
    if (Store.muted()) return;
    const c = ac(); if (!c) return;
    const { freq = 440, dur = .13, type = 'sine', vol = .22, at = 0, to = null } = o;
    const t0 = o.abs != null ? o.abs : c.currentTime + at;
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), t0 + dur);
    g.gain.setValueAtTime(.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + .05);
  }
  function noise(o = {}) {
    if (Store.muted()) return;
    const c = ac(); if (!c) return;
    const dur = o.dur || .12, t0 = o.abs != null ? o.abs : c.currentTime + (o.at || 0);
    const buf = c.createBuffer(1, Math.max(1, c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.2);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = o.freq || 1800; f.Q.value = .9;
    const g = c.createGain(); g.gain.value = o.vol || .3;
    src.connect(f).connect(g).connect(c.destination);
    src.start(t0);
  }
  const SFX = {
    tap: () => tone({ freq: 620, dur: .06, type: 'triangle', vol: .13 }),
    pop: () => tone({ freq: 880, dur: .07, type: 'sine', vol: .16, to: 1320 }),
    good: () => { tone({ freq: 660, dur: .1, type: 'sine', vol: .2 }); tone({ freq: 990, dur: .16, type: 'sine', vol: .18, at: .08 }); },
    great: () => [523, 659, 784, 1046].forEach((f, i) => tone({ freq: f, dur: .16, type: 'triangle', vol: .18, at: i * .07 })),
    bad: () => tone({ freq: 200, dur: .22, type: 'sawtooth', vol: .14, to: 90 }),
    fail: () => tone({ freq: 320, dur: .18, type: 'square', vol: .13, to: 120 }),
    tick: () => tone({ freq: 1200, dur: .035, type: 'square', vol: .07 }),
    win: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone({ freq: f, dur: .3, type: 'triangle', vol: .19, at: i * .1 })),
    lose: () => [440, 370, 294, 220].forEach((f, i) => tone({ freq: f, dur: .26, type: 'sine', vol: .18, at: i * .12 })),
    flip: () => tone({ freq: 420, dur: .07, type: 'triangle', vol: .12, to: 700 }),
    drum: () => { noise({ dur: .1, freq: 160, vol: .32 }); tone({ freq: 110, dur: .14, type: 'sine', vol: .22, to: 60 }); },
    hat: () => noise({ dur: .05, freq: 7000, vol: .12 }),
    snare: () => { noise({ dur: .13, freq: 2400, vol: .22 }); tone({ freq: 190, dur: .1, type: 'triangle', vol: .12 }); },
    whoosh: () => noise({ dur: .38, freq: 900, vol: .16 })
  };
  return {
    play(n) { const f = SFX[n]; if (f) { try { f(); } catch (e) {} } },
    note(freq, at = 0, dur = .28, type = 'triangle', vol = .2) {
      tone({ freq, dur, type, vol, at });
      tone({ freq: freq * 2, dur: dur * .8, type: 'sine', vol: vol * .3, at });
    },
    noteAt(freq, when, dur = .26, type = 'triangle', vol = .18) {
      tone({ freq, dur, type, vol, abs: when });
      tone({ freq: freq * 2, dur: dur * .8, type: 'sine', vol: vol * .28, abs: when });
    },
    chordAt(freqs, when, dur = .8, vol = .05) { freqs.forEach(f => tone({ freq: f, dur, type: 'triangle', vol, abs: when })); },
    hatAt(when) { noise({ dur: .045, freq: 7000, vol: .09, abs: when }); },
    kickAt(when) { noise({ dur: .09, freq: 150, vol: .22, abs: when }); tone({ freq: 100, dur: .1, type: 'sine', vol: .16, to: 55, abs: when }); },
    ctx: ac,
    tone, noise, unlock() { ac(); }
  };
})();

/* ---------- מוזיקת רקע ---------- */
const Music = (() => {
  const BPM = 92, BEAT = 60 / BPM;
  const CHORDS = [[220.00,261.63,329.63],[174.61,220.00,261.63],[261.63,329.63,392.00],[196.00,246.94,293.66]];
  let timer = null, step = 0;
  function bar() {
    const c = Sound.ctx && Sound.ctx();
    if (!c) return;
    const t0 = c.currentTime + .06;
    const ch = CHORDS[step % CHORDS.length];
    Sound.noteAt(ch[0] / 2, t0, BEAT * 3.4, 'sine', .13);
    Sound.chordAt(ch, t0, BEAT * 3.1, .042);
    ch.forEach((f, i) => Sound.noteAt(f * 2, t0 + i * BEAT, .3, 'sine', .05));
    for (let i = 0; i < 4; i++) Sound.hatAt(t0 + i * BEAT + BEAT / 2);
    Sound.kickAt(t0);
    Sound.kickAt(t0 + BEAT * 2);
    step++;
  }
  return {
    isOn() { return !!timer; },
    start() {
      if (timer || Store.muted()) return false;
      Sound.unlock();
      step = 0; bar();
      timer = setInterval(bar, BEAT * 4 * 1000);
      return true;
    },
    stop() { if (timer) { clearInterval(timer); timer = null; } },
    toggle() { if (this.isOn()) { this.stop(); return false; } return this.start(); }
  };
})();

/* ---------- ui ---------- */
let toastT = null;
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = el('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2000);
}
function confetti(n = 60) {
  const colors = ['#8b5cf6', '#ff4d8d', '#ffb020', '#22d3a5', '#ff6b3d', '#7de2ff', '#ffd166'];
  for (let i = 0; i < n; i++) {
    const p = el('div', 'confetti');
    p.style.background = pick(colors);
    p.style.left = rndInt(6, 94) + 'vw'; p.style.top = '-14px';
    const dx = rndInt(-140, 140), dur = rndInt(1400, 2600);
    const an = anim(p, [
      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx}px,${window.innerHeight + 60}px) rotate(${rndInt(360, 1200)}deg)`, opacity: .9 }
    ], { duration: dur, easing: 'cubic-bezier(.3,.6,.5,1)' });
    if (an) an.onfinish = () => p.remove(); else setTimeout(() => p.remove(), dur);
  }
}
function anim(node, frames, opts) {
  if (node && typeof node.animate === 'function') { try { return node.animate(frames, opts); } catch (e) { return null; } }
  return null;
}
function floatScore(txt, x, y) {
  const d = el('div', 'floatscore', txt);
  d.style.left = x + 'px'; d.style.top = y + 'px';
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 950);
}
function applyTheme() {
  document.documentElement.setAttribute('data-theme', Store.theme());
}
function applyCatTheme(cat) {
  const c = CAT(cat);
  document.documentElement.style.setProperty('--c1', c.c1);
  document.documentElement.style.setProperty('--c2', c.c2);
}
/* קישור השיתוף: כשהמשחק מתארח (http/https) משתפים את הכתובת שלו.
   כשפותחים אותו מקומית (file://) משתפים את עותק האחסון הציבורי. */
const MIRROR_URL = 'https://superagent-b4bc5a92.base44.app/functions/chaosClub';
function gameUrl() {
  const h = location.href.split('#')[0];
  return /^https?:/i.test(h) ? h : MIRROR_URL;
}
function shareWhatsApp(text) {
  const msg = text + '\n' + gameUrl();
  const link = 'https://wa.me/?text=' + encodeURIComponent(msg);
  try { window.open(link, '_blank', 'noopener'); } catch (e) { location.href = link; }
  Sound.play('pop');
  toast('נפתח וואטסאפ לשיתוף המשחק 📲');
}
function shareSheet(game, score) {
  const msg = `🎮 CHAOS CLUB\n${game.emoji} ${game.name}${score != null ? '\nהשגתי ' + fmt(score) + ' נקודות!' : ''}\nבואו לשחק:`;
  shareWhatsApp(msg);
}

/* ---------- registry ---------- */
const GAMES = [];
const registerGame = g => { GAMES.push(g); return g; };
const gameById = id => GAMES.find(g => g.id === id);
const gamesOf = cat => GAMES.filter(g => g.cat === cat);

/* ---------- generic quiz runner ---------- */
function runQuiz(api, cfg) {
  // cfg: {count, make(i) -> {q, sub, options:[..], answer:index, pts, after(el)}, total}
  const stage = api.stage;
  stage.innerHTML = '';
  const box = el('div');
  stage.appendChild(box);
  let i = 0, score = 0, correct = 0, locked = false;
  const total = cfg.count;
  if (cfg.total) api.setTimer(cfg.total, () => end());

  function end() {
    api.stopTimer();
    api.finish(score, { detail: `${correct} תשובות נכונות מתוך ${total}` });
  }
  function round() {
    if (i >= total) return end();
    locked = false;
    const r = cfg.make(i);
    api.status(`שאלה ${i + 1}/${total}`);
    box.innerHTML = '';
    if (r.sub) box.appendChild(el('p', 'g-title', r.sub));
    const q = el('div', 'g-q', r.q);
    box.appendChild(q);
    if (r.build) { r.build(box); }
    if (Store.item('hint') > 0) {
      const hb = el('button', 'btn ghost', `🔍 רמז 50:50 (${Store.item('hint')})`);
      hb.style.margin = '0 auto 12px';
      hb.style.display = 'flex';
      hb.onclick = () => {
        if (!Store.useItem('hint')) return;
        walletBump();
        const wrong = [];
        r.options.forEach((_, idx) => { if (idx !== r.answer) wrong.push(idx); });
        shuffle(wrong).slice(0, 2).forEach(idx => {
          const b = opts.children[idx];
          if (b) { b.classList.add('off'); b.disabled = true; b.style.opacity = '.3'; }
        });
        hb.remove();
        Sound.play('pop');
      };
      box.appendChild(hb);
    }
    const opts = el('div', 'opts');
    r.options.forEach((txt, idx) => {
      const b = el('button', 'opt', txt);
      b.onclick = () => {
        if (locked) return;
        locked = true;
        const ok = idx === r.answer;
        Array.from(opts.children).forEach((c, ci) => {
          if (ci === r.answer) c.classList.add('ok');
          else if (ci === idx) c.classList.add('no');
        });
        if (ok) { score += (r.pts || 10); correct++; api.setScore(score); api.sfx('good'); }
        else { api.sfx('bad'); }
        if (!ok) { box.classList.add('flashbad'); setTimeout(() => box.classList.remove('flashbad'), 450); }
        if (r.after) r.after(ok);
        i++;
        api.after(ok ? 620 : 950, round);
      };
      opts.appendChild(b);
    });
    box.appendChild(opts);
    if (r.footer) box.appendChild(r.footer);
  }
  round();
}

/* ---------- router ---------- */
function navigate(hash) {
  if (location.hash === hash) render(); else location.hash = hash;
}
function render() {
  const bootEl = document.getElementById('boot');
  if (bootEl) bootEl.remove();
  applyTheme();
  const raw = location.hash.replace(/^#\/?/, '');
  const [view, arg] = raw.split('/');
  Sound.unlock();
  if (view === 'cat' && CATS.some(c => c.id === arg)) return renderCategory(arg);
  if (view === 'game' && gameById(arg)) return renderGame(gameById(arg));
  if (view === 'board') return renderBoard();
  if (view === 'shop') return renderShop();
  return renderHome();
}

/* ---------- chrome ---------- */
function topbar() {
  const bar = el('div', 'topbar');
  const brand = el('div', 'brand');
  brand.innerHTML = `<div class="logo">CHAOS CLUB<small>${GAMES.length} GAMES · ${CATS.length} WORLDS</small></div>`;
  brand.onclick = () => navigate('#/');
  brand.style.cursor = 'pointer';
  bar.appendChild(brand);

  const total = Object.values(Store.data.best).reduce((a, b) => a + b, 0);
  bar.appendChild(el('div', 'pill', `🏆 <b>${fmt(total)}</b>`));
  const wallet = el('div', 'pill wallet', `<b>🪙 ${fmt(Store.coins())}</b> · ❤️ ${Store.lives()}`);
  wallet.dataset.wallet = '1';
  wallet.title = 'הארנק שלכם';
  wallet.style.cursor = 'pointer';
  wallet.onclick = () => { Sound.play('tap'); navigate('#/shop'); };
  bar.appendChild(wallet);

  const themeBtn = el('button', 'icon-btn', Store.theme() === 'dark' ? '☀️' : '🌙');
  themeBtn.title = 'מצב לילה / יום';
  themeBtn.onclick = () => {
    Store.setTheme(Store.theme() === 'dark' ? 'light' : 'dark');
    applyTheme();
    themeBtn.textContent = Store.theme() === 'dark' ? '☀️' : '🌙';
    Sound.play('tap');
    toast(Store.theme() === 'dark' ? 'מצב לילה 🌙' : 'מצב יום ☀️');
  };
  bar.appendChild(themeBtn);

  const mute = el('button', 'icon-btn', Store.muted() ? '🔇' : '🔊');
  mute.title = 'השתקת אפקטים';
  mute.onclick = () => {
    Store.setMuted(!Store.muted());
    if (Store.muted()) { Music.stop(); Store.setMusic(false); }
    mute.textContent = Store.muted() ? '🔇' : '🔊';
    if (!Store.muted()) Sound.play('pop');
    toast(Store.muted() ? 'הקול הושתק 🔇' : 'הקול הופעל 🔊');
  };
  bar.appendChild(mute);

  const musicBtn = el('button', 'icon-btn', Music.isOn() ? '🎵' : '🎶');
  musicBtn.title = 'מוזיקת רקע';
  musicBtn.onclick = () => {
    const on = Music.toggle();
    Store.setMusic(on);
    musicBtn.textContent = on ? '🎵' : '🎶';
    toast(on ? 'מוזיקת רקע פועלת 🎵' : 'מוזיקת הרקע נעצרה');
  };
  bar.appendChild(musicBtn);

  const share = el('button', 'icon-btn wa', '📲');
  share.title = 'שיתוף בוואטסאפ';
  share.onclick = () => shareWhatsApp(`🎮 בוא נשחק CHAOS CLUB — ${GAMES.length} משחקים ב־${CATS.length} עולמות!`);
  bar.appendChild(share);
  return bar;
}

/* ---------- home ---------- */
function renderHome() {
  applyCatTheme('brain');
  const a = $('#app');
  a.innerHTML = '';
  a.appendChild(topbar());
  const wrap = el('div', 'wrap');
  wrap.innerHTML = `
    <div class="hero">
      <h1>ברוכים הבאים ל־<br><span>CHAOS CLUB</span></h1>
      <p>${GAMES.length} משחקים אמיתיים ב־${CATS.length} עולמות. בוחרים עולם, לוחצים על משחק ומתחילים. כל ניקוד נשמר אוטומטית במכשיר.</p>
      <div class="hero-stats">
        <div class="stat"><b>${Store.played()}/${GAMES.length}</b><span>משחקים ששוחקו</span></div>
        <div class="stat"><b>${fmt(Store.data.plays || 0)}</b><span>סבבים</span></div>
        <div class="stat"><b>${fmt(Store.data.total || 0)}</b><span>ניקוד מצטבר</span></div>
      </div>
    </div>`;
  wrap.appendChild(el('div', 'section-title', 'בחרו קטגוריה'));

  const grid = el('div', 'cat-grid');
  CATS.forEach((c, i) => {
    const games = gamesOf(c.id);
    const bestSum = games.reduce((s, g) => s + Store.best(g.id), 0);
    const card = el('button', 'cat-card');
    card.style.setProperty('--c1', c.c1); card.style.setProperty('--c2', c.c2);
    card.style.animationDelay = (i * 70) + 'ms';
    card.innerHTML = `
      <div class="cat-emoji">${c.emoji}</div>
      <div><h2 class="cat-name">${c.name}</h2><p class="cat-sub">${c.sub}</p></div>
      <div class="cat-foot">
        <span class="cat-count">${games.length} משחקים</span>
        <span class="cat-best">שיא: ${fmt(bestSum)}</span>
        <span class="cat-go">←</span>
      </div>`;
    card.onclick = () => { Sound.play('whoosh'); navigate('#/cat/' + c.id); };
    grid.appendChild(card);
  });
  wrap.appendChild(grid);

  const quick = el('div', 'quick');
  const qb = el('button', 'quick-card');
  qb.innerHTML = `<span class="qk-emoji">🛒</span><span><b>חנות המטבעות</b><small>${fmt(Store.coins())} מטבעות · ${Store.lives()} חיים</small></span><span class="qk-go">←</span>`;
  qb.onclick = () => { Sound.play('whoosh'); navigate('#/shop'); };
  const ql = el('button', 'quick-card');
  ql.innerHTML = `<span class="qk-emoji">🏅</span><span><b>טבלת ניקוד</b><small>${Store.board().length} תוצאות שמורות</small></span><span class="qk-go">←</span>`;
  ql.onclick = () => { Sound.play('whoosh'); navigate('#/board'); };
  quick.appendChild(qb); quick.appendChild(ql);
  wrap.appendChild(quick);

  const top = Store.board().slice(0, 3);
  if (top.length) {
    wrap.appendChild(el('div', 'section-title', 'שלושת המובילים'));
    wrap.appendChild(boardTable(top, false));
  }

  const row = el('div', 'share-row');
  const sh = el('button', 'btn', '📲 שתף את CHAOS CLUB בוואטסאפ');
  sh.onclick = () => shareWhatsApp(`🎮 CHAOS CLUB — ${GAMES.length} משחקים אמיתיים ב־${CATS.length} עולמות. בואו נשחק!`);
  row.appendChild(sh);
  wrap.appendChild(row);

  const reset = el('div', 'row'); reset.style.marginTop = '22px';
  const rb = el('button', 'btn ghost', '🗑️ איפוס כל הניקודים');
  rb.onclick = () => { if (confirm('לאפס את כל הניקודים והשיאים?')) { Store.reset(); toast('הניקוד אופס'); renderHome(); } };
  reset.appendChild(rb); wrap.appendChild(reset);
  a.appendChild(wrap);
  window.scrollTo({ top: 0 });
}

/* ---------- category ---------- */
function renderCategory(catId) {
  const c = CAT(catId);
  applyCatTheme(catId);
  const a = $('#app');
  a.innerHTML = '';
  a.appendChild(topbar());
  const wrap = el('div', 'wrap');
  const games = gamesOf(catId);

  const head = el('div', 'game-head');
  const back = el('button', 'icon-btn', '→');
  back.title = 'כל הקטגוריות';
  back.onclick = () => { Sound.play('tap'); navigate('#/'); };
  head.appendChild(back);
  const t = el('div'); t.innerHTML = `<h2>${c.emoji} ${c.name}</h2>`; head.appendChild(t);
  const sum = games.reduce((s, g) => s + Store.best(g.id), 0);
  head.insertAdjacentHTML('beforeend', `<div class="hud"><span class="pill">${games.length} משחקים</span><span class="pill">🏆 <b>${fmt(sum)}</b></span></div>`);
  wrap.appendChild(head);

  const grid = el('div', 'game-grid');
  games.forEach((g, i) => {
    const card = el('button', 'game-card');
    card.style.setProperty('--c1', c.c1); card.style.setProperty('--c2', c.c2);
    card.style.animationDelay = (i * 60) + 'ms';
    const best = Store.best(g.id);
    const dots = [1, 2, 3].map(n => `<i class="${n <= (g.diff || 1) ? 'on' : ''}"></i>`).join('');
    card.innerHTML = `
      <div class="gc-top"><div class="gc-emoji">${g.emoji}</div><h3>${g.name}</h3></div>
      <p class="gc-desc">${g.desc}</p>
      <div class="gc-meta">
        <span class="diff">${dots}</span>
        <span class="gc-best">${best ? 'שיא: <b>' + fmt(best) + '</b>' : 'טרם שוחק'}</span>
        <span class="gc-play">שחק ←</span>
      </div>`;
    card.onclick = () => { Sound.play('whoosh'); navigate('#/game/' + g.id); };
    grid.appendChild(card);
  });
  wrap.appendChild(grid);

  if (catId === 'music') {
    const audioBox = el('div', 'share-row');
    audioBox.style.flexDirection = 'column';
    audioBox.style.alignItems = 'stretch';
    const hint = el('p', 'small-note', '🎧 כל המשחקים כאן מושמעים — ודאו שהמכשיר לא על שקט');
    hint.style.textAlign = 'center';
    audioBox.appendChild(hint);
    const mBtn = el('button', 'btn', Music.isOn() ? '⏹ עצור מוזיקת רקע' : '🎵 הפעל מוזיקת רקע');
    mBtn.onclick = () => {
      const on = Music.toggle();
      Store.setMusic(on);
      mBtn.textContent = on ? '⏹ עצור מוזיקת רקע' : '🎵 הפעל מוזיקת רקע';
      toast(on ? 'מוזיקת רקע פועלת 🎵' : 'מוזיקת הרקע נעצרה');
    };
    const testBtn = el('button', 'btn ghost', '🎹 בדיקת שמע — נגן אקורד');
    testBtn.onclick = () => {
      Sound.unlock();
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => Sound.note(f, i * .12, .34));
      toast('אם לא שומעים — בדקו שהמכשיר לא על שקט 🔇');
    };
    audioBox.appendChild(mBtn);
    audioBox.appendChild(testBtn);
    wrap.appendChild(audioBox);
  }

  const row = el('div', 'share-row');
  const sh = el('button', 'btn ghost', '📲 שתף את הקטגוריה בוואטסאפ');
  sh.onclick = () => shareWhatsApp(`${c.emoji} ${c.name} — 5 משחקים ב־CHAOS CLUB:`);
  row.appendChild(sh); wrap.appendChild(row);
  a.appendChild(wrap);
  window.scrollTo({ top: 0 });
}

/* ---------- game shell ---------- */
function renderGame(game) {
  const c = CAT(game.cat);
  applyCatTheme(game.cat);
  const a = $('#app');
  a.innerHTML = '';
  a.appendChild(topbar());
  const wrap = el('div', 'wrap');

  const head = el('div', 'game-head');
  const back = el('button', 'icon-btn', '→');
  back.title = 'חזרה לקטגוריה';
  back.onclick = () => { cleanup(); Sound.play('tap'); navigate('#/cat/' + game.cat); };
  head.appendChild(back);
  const tt = el('div'); tt.innerHTML = `<h2>${game.emoji} ${game.name}</h2>`; head.appendChild(tt);

  const hud = el('div', 'hud');
  const scorePill = el('span', 'pill score', 'ניקוד <b>0</b>');
  const statusPill = el('span', 'pill'); statusPill.style.display = 'none';
  hud.appendChild(scorePill); hud.appendChild(statusPill);
  const howBtn = el('button', 'icon-btn', '?'); howBtn.title = 'הוראות';
  hud.appendChild(howBtn);
  const shareBtn = el('button', 'icon-btn wa', '📲'); shareBtn.title = 'שיתוף בוואטסאפ';
  shareBtn.onclick = () => shareWhatsApp(`${game.emoji} ${game.name} — שחקו איתי ב־CHAOS CLUB!`);
  hud.appendChild(shareBtn);
  head.appendChild(hud);
  wrap.appendChild(head);

  const tbar = el('div', 'timerbar'); tbar.style.opacity = '0'; tbar.innerHTML = '<i></i>';
  wrap.appendChild(tbar);
  const stage = el('div', 'stage');
  wrap.appendChild(stage);
  a.appendChild(wrap);
  window.scrollTo({ top: 0 });

  let score = 0, finished = false, timeBonusUsed = false;
  const timers = new Set(), intervals = new Set(), cleanups = new Set();

  const setScore = n => { score = Math.max(0, Math.round(n)); scorePill.innerHTML = `ניקוד <b>${fmt(score)}</b>`; };
  const add = (n, ev) => {
    setScore(score + n);
    if (ev) floatScore((n > 0 ? '+' : '') + n, ev.clientX || innerWidth / 2, (ev.clientY || 200) - 18);
    anim(scorePill, [{ transform: 'scale(1)' }, { transform: 'scale(1.16)' }, { transform: 'scale(1)' }], { duration: 260 });
  };

  function cleanup() {
    intervals.forEach(clearInterval); intervals.clear();
    timers.forEach(clearTimeout); timers.clear();
    cleanups.forEach(fn => { try { fn(); } catch (e) {} }); cleanups.clear();
  }
  window.__ccCleanup = cleanup;

  const api = {
    stage, game, cat: c,
    get score() { return score; },
    add, setScore,
    sfx: n => Sound.play(n),
    note: (f, at, d, t, v) => Sound.note(f, at, d, t, v),
    tone: o => Sound.tone(o),
    status(txt) {
      if (!txt) { statusPill.style.display = 'none'; return; }
      statusPill.style.display = ''; statusPill.innerHTML = txt;
    },
    setTimer(sec, onEnd, opts = {}) {
      if (!timeBonusUsed && Store.item('time') > 0) {
        timeBonusUsed = true;
        const add = Store.spendTime(30);
        if (add > 0) {
          sec += add;
          toast(`⏱️ תוספת זמן +${add} שניות`);
          walletBump();
        }
      }
      tbar.style.opacity = '1';
      const bar = tbar.firstElementChild;
      bar.style.transition = 'none'; bar.style.width = '100%';
      requestAnimationFrame(() => { bar.style.transition = 'width .18s linear'; });
      let left = sec; const total = sec;
      const paint = () => {
        bar.style.width = (clamp(left / total, 0, 1) * 100) + '%';
        tbar.classList.toggle('warn', left <= 10);
        if (opts.onTick) opts.onTick(left);
        if (left <= 5 && left > 0 && left !== sec) Sound.play('tick');
      };
      paint();
      const iv = setInterval(() => {
        left--; paint();
        if (left <= 0) { clearInterval(iv); intervals.delete(iv); this.clearTimer(); if (onEnd) onEnd(); }
      }, 1000);
      intervals.add(iv);
      return iv;
    },
    clearTimer() { tbar.style.opacity = '0'; tbar.firstElementChild.style.width = '0%'; },
    after(ms, fn) { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; },
    every(ms, fn) { const iv = setInterval(fn, ms); intervals.add(iv); return iv; },
    onCleanup(fn) { cleanups.add(fn); },
    stopTimer() { intervals.forEach(clearInterval); intervals.clear(); timers.forEach(clearTimeout); timers.clear(); },
    finish: (s, o) => finish(s, o),
    toCategory() { cleanup(); navigate('#/cat/' + game.cat); }
  };

  /* instructions */
  const overlay = el('div', 'overlay');
  const sheet = el('div', 'sheet');
  const best = Store.best(game.id);
  sheet.innerHTML = `
    <span class="tag">${c.emoji} ${c.name}</span>
    <h3>${game.emoji} ${game.name}</h3>
    <ul class="howto">${game.howto.map((h, i) => `<li data-n="${i + 1}">${h}</li>`).join('')}</ul>
    <div class="scoring">🎯 ${game.scoring}</div>
    ${best ? `<div class="scoring" style="margin-top:-6px">🏅 השיא שלך: <b>${fmt(best)}</b></div>` : ''}
    <button class="btn wide" id="startBtn">▶︎ התחל לשחק</button>`;
  overlay.appendChild(sheet);
  stage.appendChild(overlay);

  const carryScore = Store.takeCarry(game.id);
  $('#startBtn', sheet).onclick = () => {
    Sound.unlock(); Sound.play('pop');
    overlay.remove();
    setScore(carryScore > 0 ? carryScore : 0);
    if (carryScore > 0) toast(`❤️ ממשיכים מ־${fmt(carryScore)} נקודות`);
    try { game.mount(stage, api); }
    catch (err) { console.error(err); stage.innerHTML = '<div class="g-note">שגיאה בטעינת המשחק. נסו שוב.</div>'; }
  };

  howBtn.onclick = () => { api.stopTimer(); cleanup(); renderGame(game); };

  function finish(finalScore, opts = {}) {
    if (finished) return;
    finished = true;
    cleanup();
    api.clearTimer();
    let s = Math.max(0, Math.round(finalScore == null ? score : finalScore));
    let doubled = false;
    if (s > 0 && Store.useItem('x2')) { s *= 2; doubled = true; }
    setScore(s);
    const rec = Store.save(game.id, s);
    const coins = coinsFor(s);
    if (coins > 0) Store.addCoins(coins);
    if (s > 0) Store.record({ game: game.id, name: Store.playerName() || 'אורח', title: game.name, emoji: game.emoji, cat: game.cat, score: s, ts: Date.now() });
    walletBump();
    const stars = s >= (game.gold || 120) ? 3 : s >= (game.silver || 60) ? 2 : s >= 1 ? 1 : 0;
    if (rec.isBest && s > 0) { Sound.play('win'); confetti(70); } else if (s > 0) Sound.play('great'); else Sound.play('lose');

    const list = gamesOf(game.cat);
    const idx = list.findIndex(g => g.id === game.id);
    const next = list[idx + 1];
    const res = el('div', 'overlay');
    const card = el('div', 'sheet');
    card.innerHTML = `
      <div class="result">
        <div class="medal">${stars === 3 ? '🏆' : stars === 2 ? '🥈' : stars === 1 ? '✨' : '💪'}</div>
        <h3>${opts.title || (s > 0 ? 'כל הכבוד!' : 'נסה שוב')}</h3>
        <div class="big-score">${fmt(s)}</div>
        <div class="sub">${opts.detail || 'נקודות בסבב הזה'}</div>
        <div class="sub">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        ${rec.isBest && s > 0 ? '<div class="newbest">🏅 שיא חדש!</div>' : `<div class="sub" style="margin-top:8px">השיא שלך: ${fmt(rec.best)}</div>`}
        ${coins > 0 ? `<div class="coin-earn">🪙 +${fmt(coins)} מטבעות${doubled ? ' · ✨ ניקוד כפול הופעל' : ''}</div>` : `<div class="sub">${doubled ? '✨ ניקוד כפול הופעל' : 'אספו עוד נקודות כדי לזכות במטבעות'}</div>`}
        <div class="sub" style="margin-top:6px">יתרה: 🪙 ${fmt(Store.coins())} · ❤️ ${Store.lives()}</div>
        <div class="res-actions">
          ${Store.lives() > 0 && s > 0 ? `<button class="btn wide" id="reviveBtn">❤️ המשך מאותו ניקוד (${Store.lives()} חיים)</button>` : ''}
          <button class="btn ${Store.lives() > 0 && s > 0 ? 'ghost' : ''} wide" id="replayBtn">🔄 שחק שוב</button>
          ${next ? `<button class="btn ghost wide" id="nextBtn">המשך ל־${next.emoji} ${next.name} ←</button>` : ''}
          <button class="btn ghost wide" id="shopBtn">🛒 לחנות — קנו חיים ותוספת זמן</button>
          <button class="btn ghost wide" id="boardBtn2">🏅 טבלת ניקוד</button>
          <button class="btn ghost wide" id="shareBtn2">📲 שתף בוואטסאפ</button>
          <button class="btn ghost wide" id="catBtn">← חזרה לקטגוריה</button>
        </div>
      </div>`;
    res.appendChild(card);
    stage.appendChild(res);
    $('#replayBtn', card).onclick = () => { cleanup(); renderGame(game); };
    $('#shopBtn', card).onclick = () => { cleanup(); navigate('#/shop'); };
    $('#boardBtn2', card).onclick = () => { cleanup(); navigate('#/board'); };
    const rev = $('#reviveBtn', card);
    if (rev) rev.onclick = () => {
      if (!Store.useLife()) { toast('אין לכם חיים — אפשר לקנות בחנות'); navigate('#/shop'); return; }
      Store.setCarry(game.id, s);
      walletBump();
      Sound.play('great');
      cleanup(); renderGame(game);
    };
    $('#catBtn', card).onclick = () => { cleanup(); navigate('#/cat/' + game.cat); };
    $('#shareBtn2', card).onclick = () => shareWhatsApp(`השגתי ${fmt(s)} נקודות ב־${game.emoji} ${game.name}! תנצחו אותי:`);
    if (next) $('#nextBtn', card).onclick = () => { cleanup(); navigate('#/game/' + next.id); };
  }
  api.finish = finish;
}


/* ---------- leaderboard ---------- */
function boardTable(list, full = true) {
  const t = el('div', 'board');
  if (!list.length) {
    t.innerHTML = `<div class="board-empty">עוד אין תוצאות. שחקו משחק אחד והניקוד יופיע כאן 🎮</div>`;
    return t;
  }
  const head = el('div', 'board-row head');
  head.innerHTML = `<span>#</span><span>שחקן</span><span>משחק</span><span>ניקוד</span>${full ? '<span>מתי</span>' : ''}`;
  t.appendChild(head);
  list.forEach((r, i) => {
    const row = el('div', 'board-row' + (i === 0 ? ' top1' : i === 1 ? ' top2' : i === 2 ? ' top3' : ''));
    const when = new Date(r.ts || Date.now());
    const dateTxt = `${String(when.getDate()).padStart(2, '0')}/${String(when.getMonth() + 1).padStart(2, '0')}`;
    row.innerHTML = `<span class="rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
      <span class="who">${r.name || 'אורח'}</span>
      <span class="what">${r.emoji || '🎮'} ${r.title || ''}</span>
      <span class="pts">${fmt(r.score)}</span>
      ${full ? `<span class="when">${dateTxt}</span>` : ''}`;
    t.appendChild(row);
  });
  return t;
}

function renderBoard() {
  applyCatTheme('party');
  const a = $('#app');
  a.innerHTML = '';
  a.appendChild(topbar());
  const wrap = el('div', 'wrap');

  const head = el('div', 'game-head');
  const back = el('button', 'icon-btn', '→');
  back.onclick = () => { Sound.play('tap'); navigate('#/'); };
  head.appendChild(back);
  const t = el('div'); t.innerHTML = '<h2>🏅 טבלת ניקוד</h2>'; head.appendChild(t);
  wrap.appendChild(head);

  const nameRow = el('div', 'name-row');
  const nameInp = el('input', 'input');
  nameInp.placeholder = 'השם שלך בטבלה';
  nameInp.value = Store.playerName();
  nameInp.maxLength = 18;
  const saveName = () => { Store.setPlayerName(nameInp.value); toast('השם נשמר'); };
  nameInp.addEventListener('keydown', e => { if (e.key === 'Enter') saveName(); });
  const nameBtn = el('button', 'btn', 'שמור שם');
  nameBtn.onclick = saveName;
  nameRow.appendChild(nameInp); nameRow.appendChild(nameBtn);
  wrap.appendChild(nameRow);

  const chips = el('div', 'chips');
  chips.style.maxHeight = 'none';
  let filter = 'all';
  const draw = () => {
    const list = Store.board().filter(r => filter === 'all' || r.cat === filter).slice(0, 30);
    const old = wrap.querySelector('.board-wrap');
    if (old) old.remove();
    const holder = el('div', 'board-wrap');
    holder.appendChild(boardTable(list, true));
    wrap.appendChild(holder);
  };
  const mk = (id, label) => {
    const c = el('button', 'chip', label);
    c.style.cursor = 'pointer';
    if (filter === id) { c.style.background = 'linear-gradient(135deg,var(--c1),var(--c2))'; c.style.color = '#08080f'; c.style.borderColor = 'transparent'; }
    c.onclick = () => { filter = id; Sound.play('tap'); chips.innerHTML = ''; ['all'].concat(CATS.map(x => x.id)).forEach(k => chips.appendChild(mk(k, k === 'all' ? 'הכל' : CAT(k).name))); draw(); };
    return c;
  };
  ['all'].concat(CATS.map(x => x.id)).forEach(k => chips.appendChild(mk(k, k === 'all' ? 'הכל' : CAT(k).name)));
  wrap.appendChild(chips);
  draw();

  const row = el('div', 'share-row');
  const sh = el('button', 'btn', '📲 שתף את טבלת הניקוד בוואטסאפ');
  sh.onclick = () => {
    const top = Store.board().slice(0, 5).map((r, i) => `${i + 1}. ${r.name || 'אורח'} — ${r.title} ${fmt(r.score)}`).join('\n');
    shareWhatsApp('🏅 טבלת הניקוד של CHAOS CLUB:\n' + (top || 'עוד אין תוצאות'));
  };
  row.appendChild(sh);
  const sh2 = el('button', 'btn ghost', '🛒 לחנות');
  sh2.onclick = () => navigate('#/shop');
  row.appendChild(sh2);
  wrap.appendChild(row);
  a.appendChild(wrap);
  window.scrollTo({ top: 0 });
}

/* ---------- shop ---------- */
function renderShop() {
  applyCatTheme('music');
  const a = $('#app');
  a.innerHTML = '';
  a.appendChild(topbar());
  const wrap = el('div', 'wrap');

  const head = el('div', 'game-head');
  const back = el('button', 'icon-btn', '→');
  back.onclick = () => { Sound.play('tap'); navigate('#/'); };
  head.appendChild(back);
  const t = el('div'); t.innerHTML = '<h2>🛒 חנות המטבעות</h2>'; head.appendChild(t);
  head.insertAdjacentHTML('beforeend', `<div class="hud"><span class="pill" data-wallet><b>🪙 ${fmt(Store.coins())}</b> · ❤️ ${Store.lives()}</span></div>`);
  wrap.appendChild(head);

  const info = el('div', 'shop-info');
  info.innerHTML = `
    <div class="shop-badge">🪙 ${fmt(Store.coins())}<small>מטבעות</small></div>
    <div class="shop-badge">❤️ ${Store.lives()}<small>חיים</small></div>
    <div class="shop-badge">⏱️ ${Store.item('time')} שנ׳<small>תוספת זמן</small></div>
    <div class="shop-badge">🔍 ${Store.item('hint')}<small>רמזים</small></div>
    <div class="shop-badge">✨ ${Store.item('x2')}<small>ניקוד כפול</small></div>`;
  wrap.appendChild(info);
  wrap.appendChild(el('p', 'small-note', 'המטבעות הן כסף מזויף של המשחק — מרוויחים אותן מניקוד בכל סבב (10 נקודות = מטבע, ועוד בונוסים על 150/300/600).'));

  const grid = el('div', 'shop-grid');
  SHOP.forEach((it, i) => {
    const card = el('div', 'shop-card');
    card.style.animationDelay = (i * 40) + 'ms';
    const can = Store.coins() >= it.price;
    card.innerHTML = `
      <div class="shop-top"><span class="shop-emoji">${it.emoji}</span><span class="shop-tag">${it.tag}</span></div>
      <h3>${it.name}</h3>
      <p>${it.desc}</p>
      <button class="btn wide ${can ? '' : 'ghost'}" ${can ? '' : 'disabled'}>🪙 ${it.price}</button>`;
    const btn = card.querySelector('button');
    btn.onclick = () => {
      if (Store.coins() < it.price) { toast('אין מספיק מטבעות'); Sound.play('bad'); return; }
      Store.addCoins(-it.price);
      it.give();
      Sound.play('good'); confetti(18);
      toast(`נקנה: ${it.name} ✅`);
      renderShop();
    };
    grid.appendChild(card);
  });
  wrap.appendChild(grid);

  const row = el('div', 'share-row');
  const go = el('button', 'btn', '🎮 חזרה למשחקים');
  go.onclick = () => navigate('#/');
  const lb = el('button', 'btn ghost', '🏅 טבלת ניקוד');
  lb.onclick = () => navigate('#/board');
  row.appendChild(go); row.appendChild(lb);
  wrap.appendChild(row);

  if (Store.coins() < 15) {
    const tip = el('div', 'shop-tip');
    tip.innerHTML = `אין מספיק מטבעות? שחקו עוד סבב — כל 10 נקודות הופכות למטבע.`;
    wrap.appendChild(tip);
  }
  a.appendChild(wrap);
  window.scrollTo({ top: 0 });
}

/* ---------- boot ---------- */
window.addEventListener('hashchange', () => { if (window.__ccCleanup) { try { window.__ccCleanup(); } catch (e) {} } render(); });
window.addEventListener('DOMContentLoaded', () => {
  try { document.title = `CHAOS CLUB · ${GAMES.length} משחקים`; } catch (e) {}
  applyTheme();
  const holder = el('div'); holder.id = 'app';
  document.body.appendChild(holder);
  if (!location.hash) location.hash = '#/';
  render();
  const unlock = () => { Sound.unlock(); if (Store.musicOn() && !Music.isOn()) Music.start(); window.removeEventListener('pointerdown', unlock); };
  window.addEventListener('pointerdown', unlock);
});
