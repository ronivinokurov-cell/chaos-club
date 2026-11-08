/* ===== משחקי קופסא: קלפים, קוביות ופאזלים ===== */
(function () {

  const SUITS = ['♠', '♥', '♦', '♣'];
  const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const rankName = v => ({ 11: 'J', 12: 'Q', 13: 'K', 14: 'A' }[v] || String(v));
  const cardText = c => `${rankName(c.v)}${c.s}`;
  const newDeck = () => shuffle(SUITS.flatMap(s => RANKS.map(v => ({ s, v }))));

  function shell(stage, noteText) {
    stage.innerHTML = '';
    const wrap = el('div', 'pad-wrap');
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '12px';
    const note = el('div', 'small-note', noteText || '');
    wrap.appendChild(note);
    stage.appendChild(wrap);
    return { wrap, note };
  }

  function cardEl(c, small) {
    const d = el('div', '');
    const red = c.s === '♥' || c.s === '♦';
    d.textContent = cardText(c);
    d.style.cssText = `min-width:${small ? 40 : 54}px;padding:${small ? '6px 4px' : '10px 6px'};border-radius:8px;background:#f7f7fb;color:${red ? '#d81b45' : '#1b1b28'};font-weight:900;font-size:${small ? 13 : 17}px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,.35)`;
    return d;
  }

  /* ---------- מלחמה ---------- */
  registerGame({
    id: 'table.war', cat: 'board', name: 'מלחמה בקלפים', emoji: '🃏', diff: 1, gold: 600, silver: 300,
    desc: 'קלף מול קלף — מי שמוציא גבוה יותר לוקח את הסיבוב.',
    howto: ['לוחצים "סיבוב" ומגלים שני קלפים.', 'הקלף הגבוה מנצח בסיבוב.', 'שוויון לא מזכה באף נקודה.', 'עשרים סיבובים בכל משחק.'],
    scoring: '60 נקודות לכל סיבוב שניצחתם · 200 בונוס על 14 ומעלה',
    mount(stage, api) {
      const deck = newDeck();
      let i = 0, wins = 0, rounds = 0, over = false;
      const { wrap, note } = shell(stage, 'מוכנים? 0/20');
      const row = el('div', '');
      row.style.cssText = 'display:flex;gap:18px;align-items:center;justify-content:center;min-height:80px';
      const btn = el('button', 'btn', '🃏 סיבוב');
      wrap.appendChild(row); wrap.appendChild(btn);

      const draw = () => {
        if (over) return;
        const a = deck[(i * 2) % deck.length], b = deck[(i * 2 + 1) % deck.length];
        i++; rounds++;
        row.innerHTML = '';
        row.appendChild(cardEl(a)); row.appendChild(cardEl(b));
        if (a.v > b.v) { wins++; api.sfx('good'); } else if (a.v < b.v) api.sfx('bad'); else api.sfx('tap');
        api.setScore(wins * 60);
        note.textContent = `סיבוב ${rounds}/20 · ניצחונות ${wins} · ${fmt(wins * 60)} נקודות`;
        if (rounds >= 20) {
          over = true;
          btn.disabled = true;
          const bonus = wins >= 14 ? 200 : 0;
          api.after(500, () => api.finish(wins * 60 + bonus, { detail: `${wins} סיבובים מתוך 20${bonus ? ' · בונוס 200' : ''}` }));
        }
      };
      btn.onclick = draw;
      api.status('לחצו כדי לגלות קלפים');
    }
  });

  /* ---------- בלאק ג'ק ---------- */
  registerGame({
    id: 'table.blackjack', cat: 'board', name: 'בלאק ג\'ק 21', emoji: '🂡', diff: 2, gold: 700, silver: 350,
    desc: 'הגיעו קרוב ל־21 בלי לעבור, נגד הדילר.',
    howto: ['מקבלים שני קלפים והדילר מקבל שניים.', 'לוחצים "קלף" כדי לקחת עוד, או "עצור".', 'מעל 21 — הפסדתם את היד.', 'חמישה סיבובים, וניצחון על הדילר שווה 150.'],
    scoring: '150 נקודות לניצחון ביד · 100 לתיקו · 400 בונוס על 4 ניצחונות',
    mount(stage, api) {
      let round = 0, wins = 0, score = 0, busy = false;
      const val = cards => {
        let total = 0, aces = 0;
        cards.forEach(c => { if (c.v === 14) { aces++; total += 11; } else total += Math.min(10, c.v); });
        while (total > 21 && aces > 0) { total -= 10; aces--; }
        return total;
      };
      const { wrap, note } = shell(stage, 'סיבוב 1/5');
      const dealerRow = el('div', ''); dealerRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;justify-content:center;min-height:52px';
      const myRow = el('div', ''); myRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;justify-content:center;min-height:52px';
      const dLabel = el('div', 'g-title', 'דילר');
      const pLabel = el('div', 'g-title', 'אתם');
      const actions = el('div', ''); actions.style.cssText = 'display:flex;gap:10px;justify-content:center;flex-wrap:wrap';
      wrap.appendChild(dLabel); wrap.appendChild(dealerRow); wrap.appendChild(pLabel); wrap.appendChild(myRow); wrap.appendChild(actions);

      const hit = el('button', 'btn', 'קלף 🂠');
      const stand = el('button', 'btn ghost', 'עצור ✋');
      actions.appendChild(hit); actions.appendChild(stand);

      let deck = newDeck(), mine = [], dealer = [];

      const paint = hideDealer => {
        dealerRow.innerHTML = ''; myRow.innerHTML = '';
        dealer.forEach((c, idx) => dealerRow.appendChild(cardEl(idx === 1 && hideDealer ? { s: '♠', v: 2 } : c, true)));
        mine.forEach(c => myRow.appendChild(cardEl(c, true)));
        note.textContent = `סיבוב ${round}/5 · אתם ${val(mine)} · דילר ${hideDealer ? val([dealer[0]]) : val(dealer)} · ${fmt(score)} נקודות`;
      };

      const deal = () => {
        if (round >= 5) {
          const bonus = wins >= 4 ? 400 : 0;
          return api.finish(score + bonus, { detail: `${wins} ניצחונות מתוך 5${bonus ? ' · בונוס 400' : ''}` });
        }
        round++;
        busy = false;
        if (deck.length < 12) deck = newDeck();
        mine = [deck.pop(), deck.pop()];
        dealer = [deck.pop(), deck.pop()];
        hit.disabled = false; stand.disabled = false;
        paint(true);
        api.status(`יד ${round}`);
        if (val(mine) === 21) resolve();
      };

      const resolve = () => {
        busy = true;
        hit.disabled = true; stand.disabled = true;
        while (val(dealer) < 17) dealer.push(deck.pop());
        paint(false);
        const me = val(mine), dl = val(dealer);
        let msg;
        if (me > 21) { msg = 'עברתם 21 — הפסד'; api.sfx('bad'); }
        else if (dl > 21 || me > dl) { wins++; score += 150; api.sfx('win'); msg = 'ניצחתם את הדילר!'; }
        else if (me === dl) { score += 100; api.sfx('tap'); msg = 'תיקו'; }
        else { api.sfx('bad'); msg = 'הדילר ניצח'; }
        api.setScore(score);
        note.textContent = `${msg} · ${fmt(score)} נקודות`;
        api.after(1100, deal);
      };

      hit.onclick = () => {
        if (busy || round > 5) return;
        mine.push(deck.pop());
        api.sfx('tap');
        paint(true);
        if (val(mine) >= 21) resolve();
      };
      stand.onclick = () => { if (!busy && round <= 5) resolve(); };
      deal();
    }
  });

  /* ---------- סוליטר פירמידה ---------- */
  registerGame({
    id: 'table.pyramid', cat: 'board', name: 'סוליטר פירמידה', emoji: '🔺', diff: 2, gold: 700, silver: 350,
    desc: 'הסירו זוגות שמסתכמים ל־13 — מלמטה למעלה.',
    howto: ['הפירמידה בנויה משבע שורות.', 'לוחצים על שני קלפים פתוחים שמסתכמים ל־13.', 'מלך (K) יורד לבד.', 'מנצחים כשמנקים כמה שיותר מהפירמידה.'],
    scoring: '80 נקודות לכל זוג שהוסר · 300 בונוס על פירמידה ריקה',
    mount(stage, api) {
      const deck = newDeck();
      const rows = [];
      let idx = 0;
      for (let r = 0; r < 7; r++) {
        const row = [];
        for (let c = 0; c <= r; c++) row.push({ card: deck[idx++], removed: false, row: r, col: c });
        rows.push(row);
      }
      let selected = null, score = 0, removed = 0;
      const { wrap, note } = shell(stage, 'בחרו שני קלפים שמסתכמים ל־13');
      const boardEl = el('div', '');
      boardEl.style.cssText = 'display:flex;flex-direction:column;gap:6px;align-items:center';
      wrap.appendChild(boardEl);

      const isOpen = (card) => {
        if (card.removed) return false;
        const below = rows[card.row + 1];
        if (!below) return true;
        return below[card.col].removed && below[card.col + 1].removed;
      };
      const val13 = c => (c.v === 14 ? 13 : c.v === 13 ? 13 : Math.min(10, c.v));

      const draw = () => {
        boardEl.innerHTML = '';
        rows.forEach(row => {
          const line = el('div', '');
          line.style.cssText = 'display:flex;gap:5px;justify-content:center';
          row.forEach(cell => {
            if (cell.removed) { const sp = el('div', ''); sp.style.cssText = 'width:44px;height:62px'; line.appendChild(sp); return; }
            const c = cardEl(cell.card, true);
            c.style.width = '44px';
            const open = isOpen(cell);
            c.style.opacity = open ? '1' : '.38';
            c.style.outline = selected === cell ? '3px solid #ffd166' : 'none';
            c.onclick = () => pick(cell, open);
            line.appendChild(c);
          });
          boardEl.appendChild(line);
        });
      };

      const pick = (cell, open) => {
        if (!open) { api.sfx('bad'); note.textContent = 'הקלף הזה עדיין מכוסה'; return; }
        if (cell.card.v === 13) {
          cell.removed = true; score += 80; removed++;
          api.setScore(score); api.sfx('good');
          finishCheck();
          draw();
          note.textContent = `מלך ירד · ${fmt(score)} נקודות`;
          return;
        }
        if (!selected) { selected = cell; api.sfx('tap'); draw(); return; }
        if (selected === cell) { selected = null; draw(); return; }
        const sum = Math.min(10, selected.card.v) + Math.min(10, cell.card.v);
        if (sum === 13) {
          selected.removed = true; cell.removed = true;
          selected = null; score += 80; removed += 2;
          api.setScore(score); api.sfx('good');
          draw(); finishCheck();
          note.textContent = `${fmt(score)} נקודות · ${removed} קלפים הוסרו`;
        } else {
          selected = cell;
          api.sfx('tap');
          draw();
        }
      };

      let ended = false;
      const anyMove = () => {
        const open = rows.flat().filter(c => !c.removed && isOpen(c));
        if (open.some(c => c.card.v === 13)) return true;
        for (let i = 0; i < open.length; i++) {
          for (let j = i + 1; j < open.length; j++) {
            if (Math.min(10, open[i].card.v) + Math.min(10, open[j].card.v) === 13) return true;
          }
        }
        return false;
      };
      const finishCheck = () => {
        if (ended) return;
        if (!anyMove()) {
          ended = true;
          api.sfx('bad');
          api.after(500, () => api.finish(score, { detail: `אין עוד מהלכים · ${removed} קלפים הוסרו` }));
          return;
        }
        const left = rows.flat().filter(c => !c.removed).length;
        if (left === 0) {
          ended = true;
          score += 300;
          api.setScore(score);
          api.sfx('win');
          api.after(500, () => api.finish(score, { detail: 'הפירמידה נוקתה לגמרי' }));
        }
      };
      draw();
      api.status('פירמידה');
    }
  });

  /* ---------- 2048 ---------- */
  function game2048(size) {
    return function (stage, api) {
      let b = new Array(size * size).fill(0);
      let score = 0, over = false, moved = 0;
      const { wrap, note } = shell(stage, 'הגיעו ל־2048');
      const grid = el('div', '');
      grid.style.cssText = `display:grid;grid-template-columns:repeat(${size},1fr);gap:6px;width:min(88vw,${size * 74}px);background:rgba(255,255,255,.06);padding:8px;border-radius:16px`;
      const pads = el('div', '');
      pads.style.cssText = 'display:grid;grid-template-columns:repeat(3,50px);gap:6px;justify-content:center';
      wrap.appendChild(note); wrap.appendChild(grid); wrap.appendChild(pads);

      const addTile = () => {
        const empty = b.map((v, i) => (v ? -1 : i)).filter(i => i >= 0);
        if (!empty.length) return;
        const i = empty[Math.floor(Math.random() * empty.length)];
        b[i] = Math.random() < .9 ? 2 : 4;
      };

      const draw = () => {
        grid.innerHTML = '';
        b.forEach(v => {
          const c = el('div', '');
          const tone = v ? Math.min(90, 12 + Math.log2(v) * 8) : 0;
          c.textContent = v || '';
          c.style.cssText = `aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:10px;font-weight:900;font-size:${v > 999 ? 15 : 19}px;background:${v ? `hsla(${255 - tone},80%,${28 + tone / 3}%,.85)` : 'rgba(255,255,255,.05)'}`;
          grid.appendChild(c);
        });
        note.textContent = `ניקוד ${fmt(score)} · מהלכים ${moved}`;
      };

      const slide = dir => {
        if (over) return;
        const before = b.join(',');
        const lineIdx = (li, k) => {
          if (dir === 'left' || dir === 'right') return li * size + (dir === 'left' ? k : size - 1 - k);
          return (dir === 'up' ? k : size - 1 - k) * size + li;
        };
        for (let li = 0; li < size; li++) {
          let vals = [];
          for (let k = 0; k < size; k++) vals.push(b[lineIdx(li, k)]);
          vals = vals.filter(v => v);
          for (let k = 0; k < vals.length - 1; k++) {
            if (vals[k] === vals[k + 1]) { vals[k] *= 2; score += vals[k]; vals.splice(k + 1, 1); }
          }
          while (vals.length < size) vals.push(0);
          for (let k = 0; k < size; k++) b[lineIdx(li, k)] = vals[k];
        }
        if (b.join(',') !== before) {
          moved++;
          addTile();
          api.setScore(score);
          api.sfx('tap');
          draw();
        }
        if (b.includes(2048)) {
          over = true;
          api.sfx('win');
          api.after(400, () => api.finish(score + 500, { detail: 'הגעתם ל־2048!' }));
          return;
        }
        const stuck = !canMove();
        if (stuck) {
          over = true;
          api.sfx('bad');
          api.after(400, () => api.finish(score, { detail: `אין מהלכים · ${moved} מהלכים` }));
        }
      };

      const canMove = () => {
        for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
          const v = b[r * size + c];
          if (!v) return true;
          if (c < size - 1 && v === b[r * size + c + 1]) return true;
          if (r < size - 1 && v === b[(r + 1) * size + c]) return true;
        }
        return false;
      };

      const mkPad = (label, dir) => {
        const btn = el('button', 'chip', label);
        btn.style.cssText = 'font-size:20px;padding:12px 0';
        btn.onclick = () => slide(dir);
        return btn;
      };
      pads.appendChild(el('span'));
      pads.appendChild(mkPad('↑', 'up'));
      pads.appendChild(el('span'));
      pads.appendChild(mkPad('←', 'left'));
      pads.appendChild(mkPad('↓', 'down'));
      pads.appendChild(mkPad('→', 'right'));

      const keyH = e => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); slide('left'); }
        if (e.key === 'ArrowRight') { e.preventDefault(); slide('right'); }
        if (e.key === 'ArrowUp') { e.preventDefault(); slide('up'); }
        if (e.key === 'ArrowDown') { e.preventDefault(); slide('down'); }
      };
      window.addEventListener('keydown', keyH);
      api.onCleanup(() => window.removeEventListener('keydown', keyH));

      addTile(); addTile(); draw();
      api.status('החליקו בכיוונים');
    };
  }

  registerGame({
    id: 'table.2048', cat: 'board', name: '2048', emoji: '🔢', diff: 2, gold: 900, silver: 500,
    desc: 'מחליקים אריחים ומכפילים אותם עד 2048.',
    howto: ['מחליקים עם החצים או הכפתורים.', 'שני אריחים זהים מתמזגים ונסכמים.', 'כל מהלך מוסיף אריח חדש.', 'הגיעו לאריח 2048 כדי לנצח.'],
    scoring: 'ניקוד לפי סכום המיזוגים · 500 בונוס על 2048',
    mount: game2048(4)
  });

  registerGame({
    id: 'table.2048.big', cat: 'board', name: '2048 ענק', emoji: '🔟', diff: 3, gold: 1000, silver: 600,
    desc: 'אותו משחק על לוח 5×5 — יותר מקום, יותר מיזוגים.',
    howto: ['לוח 5×5 במקום 4×4.', 'אותם חוקים.', 'קל יותר לשרוד, קשה יותר לתכנן.', 'המטרה נשארת 2048.'],
    scoring: 'ניקוד לפי מיזוגים · 500 בונוס על 2048',
    mount: game2048(5)
  });

  /* ---------- שולות מוקשים ---------- */
  function minesGame(cfg) {
    return function (stage, api) {
      const N = cfg.size, M = cfg.mines;
      const mine = new Set();
      const revealed = new Set();
      const flagged = new Set();
      let over = false, hits = 0, flags = 0, flagMode = false;

      const { wrap, note } = shell(stage, 'לחצו על משבצת כדי לחשוף');
      const grid = el('div', '');
      grid.style.cssText = `display:grid;grid-template-columns:repeat(${N},1fr);gap:3px;width:min(92vw,${N * 40}px)`;
      const toggle = el('button', 'btn ghost', '🚩 מצב סימון: כבוי');
      wrap.appendChild(note); wrap.appendChild(grid); wrap.appendChild(toggle);

      while (mine.size < M) mine.add(rnd(N * N));

      const neighbors = i => {
        const x = i % N, y = Math.floor(i / N), out = [];
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          if (!dx && !dy) continue;
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < N && ny >= 0 && ny < N) out.push(ny * N + nx);
        }
        return out;
      };

      const draw = () => {
        grid.innerHTML = '';
        for (let i = 0; i < N * N; i++) {
          const cell = el('button', 'tile', '');
          cell.style.cssText = `aspect-ratio:1;padding:0;font-size:13px;display:flex;align-items:center;justify-content:center`;
          if (revealed.has(i)) {
            const count = neighbors(i).filter(k => mine.has(k)).length;
            cell.textContent = mine.has(i) ? '💥' : (count || '');
            cell.style.background = mine.has(i) ? 'rgba(255,77,77,.5)' : 'rgba(255,255,255,.14)';
          } else if (flagged.has(i)) {
            cell.textContent = '🚩';
          }
          cell.onclick = () => act(i);
          grid.appendChild(cell);
        }
        note.textContent = `מוקשים ${M} · סימונים ${flags} · פתוחים ${revealed.size}`;
      };

      const revealFlood = start => {
        const stack = [start];
        while (stack.length) {
          const i = stack.pop();
          if (revealed.has(i) || mine.has(i)) continue;
          revealed.add(i);
          if (!neighbors(i).filter(k => mine.has(k)).length) neighbors(i).forEach(k => { if (!revealed.has(k)) stack.push(k); });
        }
      };

      const act = i => {
        if (over || revealed.has(i)) return;
        if (flagMode) {
          if (flagged.has(i)) { flagged.delete(i); flags--; } else { flagged.add(i); flags++; }
          api.sfx('tap'); draw(); return;
        }
        if (mine.has(i)) {
          revealed.add(i);
          over = true;
          api.sfx('bad');
          draw();
          return api.after(500, () => api.finish(80, { detail: `פיצוץ במהלך ${revealed.size} משבצות` }));
        }
        revealFlood(i);
        api.sfx('good');
        draw();
        if (revealed.size === N * N - M) {
          over = true;
          api.sfx('win');
          api.after(400, () => api.finish(600 + Math.max(0, 400 - revealed.size), { detail: 'כל הלוח נוקה ללא פיצוץ' }));
        }
      };

      toggle.onclick = () => {
        flagMode = !flagMode;
        toggle.textContent = `🚩 מצב סימון: ${flagMode ? 'פעיל' : 'כבוי'}`;
        api.sfx('tap');
      };
      draw();
      api.status('פתחו משבצות');
    };
  }

  registerGame({
    id: 'table.mines.easy', cat: 'board', name: 'שולות מוקשים', emoji: '💣', diff: 2, gold: 700, silver: 350,
    desc: 'לוח 8×8 עם 10 מוקשים — פתחו הכל בלי להתפוצץ.',
    howto: ['לוחצים על משבצת כדי לפתוח אותה.', 'המספרים מראים כמה מוקשים צמודים.', 'אפשר לסמן מוקשים בדגל.', 'מנצחים כשכל המשבצות הבטוחות פתוחות.'],
    scoring: '600 נקודות על ניקוי הלוח · פחות ככל שפתחתם יותר',
    mount: minesGame({ size: 8, mines: 10 })
  });

  registerGame({
    id: 'table.mines.hard', cat: 'board', name: 'שולות מוקשים קשה', emoji: '☠️', diff: 3, gold: 900, silver: 500,
    desc: 'לוח 10×10 עם 20 מוקשים — למי שאוהב סיכון.',
    howto: ['לוח גדול יותר ויותר מוקשים.', 'אותם חוקים.', 'השתמשו בסימוני דגל כדי לתכנן.', 'פיצוץ אחד מסיים את המשחק.'],
    scoring: '800 נקודות על ניקוי הלוח',
    mount: minesGame({ size: 10, mines: 20 })
  });

  /* ---------- בול ופרה ---------- */
  function bullsGame(cfg) {
    return function (stage, api) {
      const L = cfg.length;
      let secret = '';
      while (secret.length < L) {
        const d = String(rndInt(0, 9));
        if (cfg.unique ? secret.includes(d) ? true : false : false) continue;
        if (!secret.includes(d)) secret += d;
      }
      if (secret.length < L) secret = Array.from({ length: L }, () => String(rndInt(0, 9))).join('');
      let tries = 0, over = false;
      const { wrap, note } = shell(stage, `${L} ספרות · עד ${cfg.maxTries} ניסיונות`);
      const input = el('input', 'input');
      input.type = 'text';
      input.inputMode = 'numeric';
      input.placeholder = `${L} ספרות`;
      input.style.cssText = 'max-width:200px;text-align:center;font-size:20px;letter-spacing:4px';
      const btn = el('button', 'btn', 'נחש');
      const log = el('div', '');
      log.style.cssText = 'display:flex;flex-direction:column;gap:6px;width:100%;max-width:360px;font-size:14px';
      const row = el('div', ''); row.style.cssText = 'display:flex;gap:10px;justify-content:center;align-items:center';
      row.appendChild(input); row.appendChild(btn);
      wrap.appendChild(row); wrap.appendChild(log);

      const submit = () => {
        if (over) return;
        const guess = input.value.replace(/\D/g, '');
        if (guess.length !== L) { note.textContent = `צריך בדיוק ${L} ספרות`; return; }
        tries++;
        let bulls = 0, cows = 0;
        for (let i = 0; i < L; i++) {
          if (guess[i] === secret[i]) bulls++;
          else if (secret.includes(guess[i])) cows++;
        }
        const line = el('div', '', `${guess} — ${bulls} בול · ${cows} פרה`);
        line.style.cssText = `padding:8px 10px;border-radius:9px;background:${bulls === L ? 'rgba(34,211,165,.3)' : 'rgba(255,255,255,.08)'}`;
        log.prepend(line);
        input.value = '';
        api.sfx(bulls === L ? 'win' : 'tap');
        api.setScore(Math.max(0, (cfg.maxTries - tries) * 60));
        if (bulls === L) {
          over = true;
          api.after(500, () => api.finish(Math.max(150, (cfg.maxTries - tries) * 100), { detail: `פתרתם ב־${tries} ניסיונות` }));
          return;
        }
        if (tries >= cfg.maxTries) {
          over = true;
          note.textContent = `נגמרו הניסיונות · המספר היה ${secret}`;
          api.after(700, () => api.finish(40, { detail: `המספר היה ${secret}` }));
          return;
        }
        note.textContent = `ניסיון ${tries}/${cfg.maxTries}`;
      };
      btn.onclick = submit;
      input.onkeydown = e => { if (e.key === 'Enter') submit(); };
      api.status('נחשו את המספר');
    };
  }

  registerGame({
    id: 'table.bulls', cat: 'board', name: 'בול ופרה', emoji: '🐂', diff: 2, gold: 600, silver: 300,
    desc: 'נחשו מספר בן ארבע ספרות שונות לפי רמזי בולים ופרות.',
    howto: ['מקלידים מספר בן 4 ספרות שונות.', 'בול = ספרה נכונה במקום נכון.', 'פרה = ספרה נכונה במקום אחר.', 'יש עשרה ניסיונות.'],
    scoring: '100 נקודות על כל ניסיון שנחסך · מינימום 150',
    mount: bullsGame({ length: 4, maxTries: 10, unique: true })
  });

  registerGame({
    id: 'table.bulls.hard', cat: 'board', name: 'בול ופרה 5', emoji: '🐄', diff: 3, gold: 800, silver: 400,
    desc: 'חמש ספרות, שנים עשר ניסיונות — אתגר לחובבי היגיון.',
    howto: ['מספר בן חמש ספרות שונות.', 'אותם רמזים.', 'יש שנים עשר ניסיונות.', 'עדיף להתחיל בספרות נפוצות.'],
    scoring: '120 נקודות על כל ניסיון שנחסך',
    mount: bullsGame({ length: 5, maxTries: 12, unique: true })
  });

  /* ---------- מאסטרמיינד ---------- */
  registerGame({
    id: 'table.mastermind', cat: 'board', name: 'מאסטרמיינד', emoji: '🎨', diff: 3, gold: 800, silver: 400,
    desc: 'פענחו את צירוף הצבעים הסודי לפי רמזים.',
    howto: ['בחרו ארבעה צבעים מתוך שישה.', 'רמז שחור = צבע נכון במקום נכון.', 'רמז לבן = צבע נכון במקום אחר.', 'יש עשרה ניסיונות.'],
    scoring: '100 נקודות על כל ניסיון שנחסך',
    mount(stage, api) {
      const COLORS = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
      const L = 4;
      const secret = Array.from({ length: L }, () => pick(COLORS));
      let guess = [], tries = 0, over = false;
      const { wrap, note } = shell(stage, 'בחרו ארבעה צבעים');
      const chosen = el('div', '');
      chosen.style.cssText = 'display:flex;gap:8px;min-height:44px;align-items:center;justify-content:center';
      const palette = el('div', '');
      palette.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:340px';
      const send = el('button', 'btn', 'בדוק');
      const log = el('div', '');
      log.style.cssText = 'display:flex;flex-direction:column;gap:5px;width:100%;max-width:360px;font-size:15px';
      wrap.appendChild(chosen); wrap.appendChild(palette); wrap.appendChild(send); wrap.appendChild(log);

      const drawChosen = () => {
        chosen.innerHTML = '';
        guess.forEach(c => { const s = el('span', '', c); s.style.cssText = 'font-size:26px'; chosen.appendChild(s); });
        if (!guess.length) chosen.innerHTML = '<span style="opacity:.45;font-size:13px">עוד לא בחרתם</span>';
      };

      COLORS.forEach(c => {
        const b = el('button', 'chip', c);
        b.style.cssText = 'font-size:24px;padding:8px 12px';
        b.onclick = () => {
          if (over || guess.length >= L) return;
          guess.push(c);
          api.sfx('tap');
          drawChosen();
        };
        palette.appendChild(b);
      });

      const reset = el('button', 'btn ghost', 'נקה');
      reset.onclick = () => { if (!over) { guess = []; drawChosen(); } };
      wrap.insertBefore(reset, send);

      send.onclick = () => {
        if (over || guess.length !== L) return;
        tries++;
        let exact = 0, partial = 0;
        const secCopy = secret.slice(), gueCopy = guess.slice();
        for (let i = 0; i < L; i++) if (gueCopy[i] === secCopy[i]) { exact++; secCopy[i] = null; gueCopy[i] = null; }
        gueCopy.forEach((c, i) => {
          if (!c) return;
          const j = secCopy.indexOf(c);
          if (j >= 0) { partial++; secCopy[j] = null; }
        });
        const line = el('div', '', `${guess.join('')} — ${exact} מדויק · ${partial} במקום אחר`);
        line.style.cssText = `padding:7px 10px;border-radius:9px;background:${exact === L ? 'rgba(34,211,165,.3)' : 'rgba(255,255,255,.08)'}`;
        log.prepend(line);
        api.setScore(Math.max(0, (10 - tries) * 80));
        api.sfx(exact === L ? 'win' : 'tap');
        guess = [];
        drawChosen();
        if (exact === L) {
          over = true;
          api.after(400, () => api.finish(Math.max(200, (10 - tries) * 120), { detail: `פוענח ב־${tries} ניסיונות` }));
          return;
        }
        if (tries >= 10) {
          over = true;
          note.textContent = `נגמרו הניסיונות · הצירוף היה ${secret.join('')}`;
          api.after(700, () => api.finish(50, { detail: `הצירוף היה ${secret.join('')}` }));
          return;
        }
        note.textContent = `ניסיון ${tries}/10`;
      };
      drawChosen();
      api.status('פענחו את הצירוף');
    }
  });

  /* ---------- קרב ימי ---------- */
  registerGame({
    id: 'table.battleship', cat: 'board', name: 'קרב ימי', emoji: '🚢', diff: 2, gold: 800, silver: 400,
    desc: 'מצאו את שלוש הספינות שהתחבאו בלוח.',
    howto: ['הלוח 8×8 עם שלוש ספינות.', 'לוחצים על משבצת כדי לירות.', 'פגיעה מסומנת באדום, החמצה בכחול.', 'יש 22 יריות להטביע את כולן.'],
    scoring: 'עד 700 נקודות לפי מספר היריות · 200 בונוס על פחות מ־16 יריות',
    mount(stage, api) {
      const N = 8;
      const ship = new Set();
      const sizes = [3, 3, 2];
      sizes.forEach(len => {
        let guard = 0;
        while (guard++ < 500) {
          const horiz = Math.random() < .5;
          const r = rnd(N), c = rnd(N);
          const cells = [];
          for (let k = 0; k < len; k++) {
            const rr = horiz ? r : r + k, cc = horiz ? c + k : c;
            if (rr >= N || cc >= N) break;
            cells.push(rr * N + cc);
          }
          if (cells.length === len && cells.every(i => !ship.has(i))) { cells.forEach(i => ship.add(i)); return; }
        }
      });
      let shots = 0, hits = 0, over = false;
      const { wrap, note } = shell(stage, `ספינות: ${sizes.join(', ')} · יריות 0/22`);
      const grid = el('div', '');
      grid.style.cssText = `display:grid;grid-template-columns:repeat(${N},1fr);gap:3px;width:min(90vw,${N * 44}px)`;
      wrap.appendChild(grid);

      const draw = (state) => {
        grid.innerHTML = '';
        for (let i = 0; i < N * N; i++) {
          const b = el('button', 'tile', '');
          b.style.cssText = 'aspect-ratio:1;padding:0;font-size:15px';
          const st = state[i];
          if (st === 'hit') { b.textContent = '💥'; b.style.background = 'rgba(255,77,77,.45)'; b.disabled = true; }
          else if (st === 'miss') { b.textContent = '💧'; b.style.background = 'rgba(58,208,255,.25)'; b.disabled = true; }
          b.onclick = () => fire(i);
          grid.appendChild(b);
        }
      };
      const state = new Array(N * N).fill('');

      const fire = i => {
        if (over || state[i]) return;
        shots++;
        if (ship.has(i)) { state[i] = 'hit'; hits++; api.sfx('good'); }
        else { state[i] = 'miss'; api.sfx('tap'); }
        draw(state);
        api.setScore(Math.max(0, hits * 150 + (22 - shots) * 10));
        note.textContent = `פגיעות ${hits}/${[...ship].length} · יריות ${shots}/22`;
        if (hits === [...ship].length) {
          over = true;
          const bonus = shots < 16 ? 200 : 0;
          api.sfx('win');
          api.after(400, () => api.finish(500 + (22 - shots) * 10 + bonus, { detail: `כל הספינות הוטבעו ב־${shots} יריות${bonus ? ' · בונוס 200' : ''}` }));
          return;
        }
        if (shots >= 22) {
          over = true;
          api.sfx('bad');
          api.after(400, () => api.finish(hits * 60, { detail: `${hits} פגיעות מתוך ${ship.size}` }));
        }
      };
      draw(state);
      api.status('ירו על הלוח');
    }
  });

  /* ---------- דומינו ---------- */
  registerGame({
    id: 'table.dominoes', cat: 'board', name: 'דומינו', emoji: '🁫', diff: 2, gold: 800, silver: 400,
    desc: 'שחקו אריחים על השרשרת — מי שנפטר מכל האריחים מנצח.',
    howto: ['לכל שחקן שבעה אריחים.', 'מניחים אריח שמתאים לאחד הקצוות.', 'אם אין אריח מתאים — לוקחים מהקופה.', 'מי שנשאר בלי אריחים ראשון מנצח.'],
    scoring: '700 נקודות על ניצחון · 300 על תיקו בקופה ריקה',
    mount(stage, api) {
      const all = [];
      for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) all.push([a, b]);
      const deck = shuffle(all);
      let mine = deck.splice(0, 7);
      let bot = deck.splice(0, 7);
      let chain = [];
      let stock = deck;
      let over = false;

      const { wrap, note } = shell(stage, 'בחרו אריח מהשרשרת');
      const chainEl = el('div', '');
      chainEl.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;justify-content:center;min-height:52px;align-items:center';
      const mineEl = el('div', '');
      mineEl.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:420px';
      const drawBtn = el('button', 'btn ghost', 'שלוף מהקופה');
      wrap.appendChild(chainEl); wrap.appendChild(el('div', 'g-title', 'האריחים שלכם')); wrap.appendChild(mineEl); wrap.appendChild(drawBtn);

      const tileEl = (t, small) => {
        const d = el('button', 'chip', `${t[0]}–${t[1]}`);
        d.style.cssText = `padding:${small ? '7px 9px' : '10px 14px'};font-weight:900;font-size:${small ? 13 : 16}px`;
        return d;
      };

      const fits = t => {
        if (!chain.length) return true;
        return t[0] === chain[0][0] || t[1] === chain[0][0] || t[0] === chain[chain.length - 1][1] || t[1] === chain[chain.length - 1][1];
      };

      const place = t => {
        if (!chain.length) { chain.push(t); return; }
        const head = chain[0][0], tail = chain[chain.length - 1][1];
        if (t[1] === head) chain.unshift([t[0], t[1]]);
        else if (t[0] === head) chain.unshift([t[1], t[0]]);
        else if (t[0] === tail) chain.push(t);
        else if (t[1] === tail) chain.push([t[1], t[0]]);
      };

      const render = () => {
        chainEl.innerHTML = chain.length ? '' : '<span style="opacity:.45;font-size:13px">השרשרת ריקה — הניחו אריח ראשון</span>';
        chain.forEach(t => chainEl.appendChild(tileEl(t, true)));
        mineEl.innerHTML = '';
        mine.forEach(t => {
          const el2 = tileEl(t, false);
          el2.disabled = over || !fits(t);
          el2.style.opacity = el2.disabled ? '.45' : '1';
          el2.onclick = () => playTile(t);
          mineEl.appendChild(el2);
        });
        drawBtn.disabled = over || !stock.length;
        note.textContent = `שרשרת ${chain.length} · אריחים שלכם ${mine.length} · קופה ${stock.length}`;
      };

      const end = (won, detail) => {
        over = true;
        render();
        api.sfx(won ? 'win' : 'bad');
        api.after(400, () => api.finish(won ? 700 : 300, { detail, title: won ? 'ניצחתם!' : 'המשחק נגמר' }));
      };

      const botTurn = () => {
        if (over) return;
        const idx = bot.findIndex(fits);
        if (idx >= 0) {
          const t = bot.splice(idx, 1)[0];
          place(t);
          api.sfx('tap');
          if (!bot.length) return end(false, 'למחשב נגמרו האריחים');
        } else if (stock.length) {
          bot.push(stock.pop());
        }
        render();
        note.textContent = 'התור שלכם';
        if (!bot.length) end(false, 'למחשב נגמרו האריחים');
        if (!mine.length) end(true, 'נשארתם בלי אריחים');
        if (!stock.length && !bot.some(fits) && !mine.some(fits)) end(mine.length <= bot.length, 'הקופה ריקה — מי שנשאר עם פחות אריחים מנצח');
      };

      const playTile = t => {
        if (over) return;
        mine = mine.filter(x => x !== t);
        place(t);
        api.sfx('good');
        render();
        if (!mine.length) return end(true, 'נשארתם בלי אריחים');
        api.after(420, botTurn);
      };

      drawBtn.onclick = () => {
        if (over || !stock.length) return;
        mine.push(stock.pop());
        api.sfx('tap');
        render();
        api.after(250, botTurn);
      };

      render();
      api.status('דומינו');
    }
  });

})();
