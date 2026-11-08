/* ===== קזינו ומזל ===== */
(function () {

  const DICE = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  /* 1. קוביות */
  registerGame({
    id: 'luck.dice', cat: 'luck', name: 'הימור קוביות', emoji: '🎲', diff: 1, gold: 800, silver: 450,
    desc: 'שתי קוביות מתגלגלות — מעל 7 או מתחת ל־7?',
    howto: [
      'בוחרים אם הסכום יהיה מעל 7 או מתחת ל־7.',
      'הקוביות מתגלגלות ומוצג הסכום.',
      'ניחוש נכון מוסיף 150 נקודות, סכום של 7 הוא הפסד.',
      'עשרה סיבובים.'
    ],
    scoring: '150 נקודות לניחוש נכון · 400 בונוס על 7 מ־10',
    mount(stage, api) {
      let round = 0, score = 0, hits = 0, busy = false;
      stage.innerHTML = '';
      const wrap = el('div', 'pad-wrap');
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '14px';
      const dice = el('div', '');
      dice.style.cssText = 'font-size:56px;letter-spacing:6px;line-height:1';
      dice.textContent = '⚀ ⚀';
      const note = el('div', 'small-note', 'סיבוב 1/10');
      const row = el('div', '');
      row.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;justify-content:center';
      wrap.appendChild(dice); wrap.appendChild(note); wrap.appendChild(row);
      stage.appendChild(wrap);

      const bet = (high) => {
        if (busy || round >= 10) return;
        busy = true;
        round++;
        api.sfx('tap');
        let a, b, sum;
        let spins = 0;
        const iv = setInterval(() => {
          a = rndInt(1, 6); b = rndInt(1, 6);
          dice.textContent = DICE[a - 1] + ' ' + DICE[b - 1];
          spins++;
          if (spins > 6) {
            clearInterval(iv);
            sum = a + b;
            const win = sum !== 7 && ((sum > 7) === high);
            if (win) { hits++; score += 150; api.setScore(score); api.sfx('good'); }
            else api.sfx('bad');
            note.textContent = `סכום ${sum} · ${win ? 'ניצחתם!' : 'הפסדתם'} · סיבוב ${round}/10 · ${fmt(score)} נקודות`;
            busy = false;
            if (round >= 10) {
              const bonus = hits >= 7 ? 400 : 0;
              api.after(700, () => api.finish(score + bonus, { detail: `${hits} ניחושים נכונים מתוך 10${bonus ? ' · בונוס 400' : ''}` }));
            }
          }
        }, 70);
        api.onCleanup(() => clearInterval(iv));
      };
      const hi = el('button', 'btn', 'מעל 7 ⬆️');
      hi.onclick = () => bet(true);
      const lo = el('button', 'btn ghost', 'מתחת ל־7 ⬇️');
      lo.onclick = () => bet(false);
      row.appendChild(hi); row.appendChild(lo);
      api.status('בחרו הימור');
    }
  });

  /* 2. גלגל מזל */
  registerGame({
    id: 'luck.wheel', cat: 'luck', name: 'גלגל מזל', emoji: '🎡', diff: 1, gold: 800, silver: 450,
    desc: 'שמונה סיבובים על גלגל — כמה נקודות ייצאו הפעם?',
    howto: [
      'לוחצים על הגלגל והוא מסתובב.',
      'החץ מראה על הפרס שנבחר.',
      'הפרס מתווסף לניקוד שלכם.',
      'שמונה סיבובים סך הכל.'
    ],
    scoring: 'הפרסים בגלגל נעים בין 0 ל־300 נקודות',
    mount(stage, api) {
      const SEGMENTS = [50, 100, 0, 200, 50, 300, 0, 150];
      let spins = 0, score = 0, rotation = 0, busy = false;
      stage.innerHTML = '';
      const wrap = el('div', 'pad-wrap');
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '12px';
      const holder = el('div', 'wheel-wrap');
      const wheel = el('div', '');
      wheel.id = 'ccWheel';
      wheel.style.cssText = 'width:min(70vw,280px);aspect-ratio:1;border-radius:50%;position:relative;transition:transform 2.2s cubic-bezier(.2,.8,.2,1);border:6px solid rgba(255,255,255,.8)';
      const grad = SEGMENTS.map((v, i) => {
        const from = (i / SEGMENTS.length) * 360, to = ((i + 1) / SEGMENTS.length) * 360;
        const col = i % 2 ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.28)';
        return `${col} ${from}deg ${to}deg`;
      }).join(',');
      wheel.style.background = `conic-gradient(${grad})`;
      SEGMENTS.forEach((v, i) => {
        const lab = el('div', '', String(v));
        const ang = (i + .5) * (360 / SEGMENTS.length);
        lab.style.cssText = `position:absolute;left:50%;top:50%;transform:rotate(${ang}deg) translateY(-38%) translateX(-50%);font-size:13px;font-weight:800;color:#fff;text-shadow:0 1px 3px #000`;
        wheel.appendChild(lab);
      });
      const ptr = el('div', 'wheel-pointer', '▼');
      holder.appendChild(ptr); holder.appendChild(wheel);
      const note = el('div', 'small-note', 'סיבוב 0/8');
      wrap.appendChild(holder); wrap.appendChild(note);
      stage.appendChild(wrap);

      wheel.onclick = () => {
        if (busy || spins >= 8) return;
        busy = true;
        spins++;
        api.sfx('whoosh');
        const idx = rnd(SEGMENTS.length);
        const target = 360 * 4 + (360 - (idx + .5) * (360 / SEGMENTS.length));
        rotation += target;
        wheel.style.transform = `rotate(${rotation}deg)`;
        api.after(2350, () => {
          const win = SEGMENTS[idx];
          score += win;
          api.setScore(score);
          api.sfx(win > 0 ? 'good' : 'bad');
          note.textContent = `סיבוב ${spins}/8 · קיבלתם ${win} · סה״כ ${fmt(score)}`;
          busy = false;
          if (spins >= 8) api.after(600, () => api.finish(score, { detail: `8 סיבובים בגלגל · ${fmt(score)} נקודות` }));
        });
      };
      api.status('סובבו את הגלגל');
    }
  });

  /* 3. קלף גבוה */
  registerGame({
    id: 'luck.card', cat: 'luck', name: 'גבוה או נמוך', emoji: '🃏', diff: 2, gold: 800, silver: 450,
    desc: 'קלף על השולחן — הקלף הבא יהיה גבוה ממנו או נמוך?',
    howto: [
      'מוצג קלף עם מספר.',
      'בוחרים אם הקלף הבא גבוה או נמוך ממנו.',
      'ניחוש נכון מוסיף 100 נקודות.',
      'עשרה סיבובים, וקלף זהה נחשב הפסד.'
    ],
    scoring: '100 נקודות לניחוש נכון · 300 בונוס על 7 מ־10',
    mount(stage, api) {
      const NAME = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
      let current = rndInt(1, 13), round = 0, score = 0, hits = 0, busy = false;
      stage.innerHTML = '';
      const wrap = el('div', 'pad-wrap');
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '14px';
      const card = el('div', '');
      card.style.cssText = 'width:120px;height:170px;border-radius:14px;background:linear-gradient(160deg,#fff,#e8e8f5);color:#161622;display:flex;align-items:center;justify-content:center;font-size:52px;font-weight:900;box-shadow:0 10px 30px rgba(0,0,0,.4)';
      const note = el('div', 'small-note');
      const row = el('div', '');
      row.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;justify-content:center';
      wrap.appendChild(card); wrap.appendChild(note); wrap.appendChild(row);
      stage.appendChild(wrap);
      const show = v => { card.textContent = NAME[v] || String(v); };
      const paint = () => { note.textContent = `סיבוב ${round}/10 · ניקוד ${fmt(score)}`; };

      const guess = higher => {
        if (busy || round >= 10) return;
        busy = true;
        round++;
        const next = rndInt(1, 13);
        const win = next !== current && ((next > current) === higher);
        if (win) { hits++; score += 100; api.setScore(score); api.sfx('good'); }
        else api.sfx('bad');
        show(next);
        current = next;
        paint();
        note.textContent = `הקלף הבא: ${NAME[next] || next} · ${win ? 'ניצחתם' : 'הפסדתם'} · סיבוב ${round}/10`;
        busy = false;
        if (round >= 10) {
          const bonus = hits >= 7 ? 300 : 0;
          api.after(700, () => api.finish(score + bonus, { detail: `${hits} ניחושים נכונים מתוך 10${bonus ? ' · בונוס 300' : ''}` }));
        }
      };
      const hi = el('button', 'btn', 'גבוה יותר ⬆️'); hi.onclick = () => guess(true);
      const lo = el('button', 'btn ghost', 'נמוך יותר ⬇️'); lo.onclick = () => guess(false);
      row.appendChild(hi); row.appendChild(lo);
      show(current); paint();
      api.status('גבוה או נמוך?');
    }
  });

  /* 4. מטבע רצף */
  registerGame({
    id: 'luck.coin', cat: 'luck', name: 'רצף מטבעות', emoji: '🪙', diff: 2, gold: 800, silver: 450,
    desc: 'עץ או פלי — כל ניחוש נכון מכפיל את הרצף. מתי תעצרו?',
    howto: [
      'בוחרים עץ או פלי ומטילים את המטבע.',
      'ניחוש נכון מגדיל את הרצף ומוסיף 50 × אורך הרצף.',
      'ניחוש שגוי מסיים את הסבב עם הניקוד שנצבר.',
      'מותר עד עשרה הטלות.'
    ],
    scoring: '50 × אורך הרצף לכל ניחוש נכון · 300 בונוס על רצף של 5',
    mount(stage, api) {
      let flips = 0, streak = 0, best = 0, score = 0, busy = false, over = false;
      stage.innerHTML = '';
      const wrap = el('div', 'pad-wrap');
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '14px';
      const coin = el('div', '');
      coin.style.cssText = 'width:110px;height:110px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe066,#f0b400);display:flex;align-items:center;justify-content:center;font-size:44px;box-shadow:0 10px 26px rgba(240,180,0,.4)';
      coin.textContent = '🪙';
      const note = el('div', 'small-note', 'רצף: 0 · ניקוד 0');
      const row = el('div', '');
      row.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;justify-content:center';
      wrap.appendChild(coin); wrap.appendChild(note); wrap.appendChild(row);
      stage.appendChild(wrap);

      const flip = side => {
        if (busy || over) return;
        busy = true;
        flips++;
        coin.textContent = '⏳';
        api.after(500, () => {
          const result = Math.random() < .5 ? 'עץ' : 'פלי';
          coin.textContent = result === 'עץ' ? '🌳' : '🪙';
          if (result === side) {
            streak++;
            best = Math.max(best, streak);
            score += 50 * streak;
            api.setScore(score);
            api.sfx('good');
            note.textContent = `נכון! רצף ${streak} · ניקוד ${fmt(score)}`;
          } else {
            api.sfx('bad');
            over = true;
            note.textContent = `המטבע נפל על ${result} · סוף הסבב עם ${fmt(score)}`;
            api.after(600, () => api.finish(score, { detail: `רצף שיא ${best} · ${flips} הטלות` }));
            return;
          }
          busy = false;
          if (flips >= 10) {
            over = true;
            const bonus = best >= 5 ? 300 : 0;
            api.after(400, () => api.finish(score + bonus, { detail: `רצף שיא ${best}${bonus ? ' · בונוס 300' : ''}` }));
          }
        });
      };
      const a = el('button', 'btn', 'עץ 🌳'); a.onclick = () => flip('עץ');
      const b = el('button', 'btn ghost', 'פלי 🪙'); b.onclick = () => flip('פלי');
      row.appendChild(a); row.appendChild(b);
      api.status('עץ או פלי');
    }
  });

  /* 5. בינגו */
  registerGame({
    id: 'luck.bingo', cat: 'luck', name: 'בינגו מהיר', emoji: '🔢', diff: 1, gold: 800, silver: 450,
    desc: 'כרטיס בינגו 4×4 — השלימו שורה לפני שהמספרים נגמרים.',
    howto: [
      'לכל שחקן כרטיס עם 16 מספרים.',
      'לוחצים "קרא מספר" והמערכת מגרילה מספר.',
      'מספר שמופיע בכרטיס מסומן אוטומטית.',
      'כל שורה, עמודה או אלכסון מלאים מזכים ב־300 נקודות.'
    ],
    scoring: '300 נקודות לכל קו שהושלם · 200 בונוס על שני קווים ומעלה',
    mount(stage, api) {
      const pool = shuffle([...Array(30)].map((_, i) => i + 1)).slice(0, 16);
      const marked = new Set();
      const called = [];
      let lines = 0, score = 0, calls = 0, over = false;

      stage.innerHTML = '';
      const wrap = el('div', 'pad-wrap');
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '12px';
      const grid = el('div', '');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:min(84vw,320px)';
      const note = el('div', 'small-note', 'קריאות: 0 · קווים: 0');
      const btn = el('button', 'btn', '🎲 קרא מספר');
      wrap.appendChild(grid); wrap.appendChild(note); wrap.appendChild(btn);
      stage.appendChild(wrap);

      const render = () => {
        grid.innerHTML = '';
        pool.forEach(n => {
          const d = el('div', '');
          const on = marked.has(n);
          d.textContent = String(n);
          d.style.cssText = `padding:14px 0;text-align:center;border-radius:10px;font-weight:800;font-size:17px;border:1px solid rgba(255,255,255,.16);background:${on ? 'rgba(34,211,165,.35)' : 'rgba(255,255,255,.06)'}`;
          grid.appendChild(d);
        });
      };
      const checkLines = () => {
        const idx = n => pool.indexOf(n);
        const rows = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]];
        const cols = [[0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15]];
        const dias = [[0, 5, 10, 15], [3, 6, 9, 12]];
        [...rows, ...cols, ...dias].forEach(line => {
          if (line.every(i => marked.has(pool[i]))) {
            const key = line.join('-');
            if (!checkLines.done) checkLines.done = new Set();
            if (!checkLines.done.has(key)) {
              checkLines.done.add(key);
              lines++;
              score += 300;
              api.setScore(score);
              api.sfx('win');
            }
          }
        });
      };
      btn.onclick = () => {
        if (over) return;
        calls++;
        let n;
        do { n = rndInt(1, 30); } while (called.includes(n) && called.length < 30);
        called.push(n);
        if (pool.includes(n)) marked.add(n);
        api.sfx('tap');
        render();
        checkLines();
        note.textContent = `קריאות: ${calls} · קווים: ${lines} · ${fmt(score)} נקודות (מספר ${n})`;
        if (lines >= 2 || calls >= 25) {
          over = true;
          const bonus = lines >= 2 ? 200 : 0;
          btn.disabled = true;
          api.after(600, () => api.finish(score + bonus, { detail: `${lines} קווים הושלמו ב־${calls} קריאות${bonus ? ' · בונוס 200' : ''}` }));
        }
      };
      render();
      api.status('קראו מספרים ומלאו קווים');
    }
  });

})();
