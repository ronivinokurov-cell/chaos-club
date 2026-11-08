/* ===== היגיון ומרחב ===== */
(function () {

  /* 1. מבוך */
  registerGame({
    id: 'logic.maze', cat: 'logic', name: 'מבוך', emoji: '🧱', diff: 2, gold: 700, silver: 400,
    desc: 'מצאו את הדרך מהפינה השמאלית העליונה ליציאה.',
    howto: [
      'אתם הנקודה הצהובה בפינה.',
      'זזים עם החצים או עם כפתורי הכיוון.',
      'קירות חוסמים — צריך למצוא את הדרך.',
      'מגיעים ליציאה הירוקה לפני שהזמן נגמר.'
    ],
    scoring: '400 נקודות בבסיס · 4− לכל צעד · 100 בונוס על סיום מתחת ל־30 שניות',
    mount(stage, api) {
      const N = 7;
      const cells = [];
      for (let i = 0; i < N * N; i++) cells.push({ n: true, e: true, s: true, w: true, seen: false });
      const at = (x, y) => cells[y * N + x];
      const stack = [[0, 0]];
      at(0, 0).seen = true;
      while (stack.length) {
        const [x, y] = stack[stack.length - 1];
        const dirs = shuffle([[0, -1, 'n', 's'], [1, 0, 'e', 'w'], [0, 1, 's', 'n'], [-1, 0, 'w', 'e']])
          .filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && nx < N && ny >= 0 && ny < N && !at(nx, ny).seen; });
        if (!dirs.length) { stack.pop(); continue; }
        const [dx, dy, from, to] = dirs[0];
        const nx = x + dx, ny = y + dy;
        at(x, y)[from] = false;
        at(nx, ny)[to] = false;
        at(nx, ny).seen = true;
        stack.push([nx, ny]);
      }

      let px = 0, py = 0, steps = 0, done = false;
      const startT = Date.now();
      stage.innerHTML = '';
      const wrap = el('div', 'pad-wrap');
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '12px';
      const board = el('div', '');
      board.style.cssText = `display:grid;grid-template-columns:repeat(${N},1fr);gap:0;width:min(88vw,360px);aspect-ratio:1;background:#101019;border-radius:14px;overflow:hidden`;
      const note = el('div', 'small-note');
      const pad = el('div', '');
      pad.style.cssText = 'display:grid;grid-template-columns:repeat(3,54px);gap:8px;justify-content:center';
      wrap.appendChild(board); wrap.appendChild(note); wrap.appendChild(pad);
      stage.appendChild(wrap);

      const cellEls = [];
      const draw = () => {
        board.innerHTML = '';
        cellEls.length = 0;
        for (let y = 0; y < N; y++) {
          for (let x = 0; x < N; x++) {
            const c = at(x, y);
            const d = el('div', '');
            d.style.cssText = `border-style:solid;border-color:#4b4b6a;border-width:${c.n ? 2 : 0}px ${c.e ? 2 : 0}px ${c.s ? 2 : 0}px ${c.w ? 2 : 0}px;display:flex;align-items:center;justify-content:center;font-size:13px`;
            d.dataset.x = x; d.dataset.y = y;
            board.appendChild(d);
            cellEls.push(d);
          }
        }
        paint();
      };
      const paint = () => {
        cellEls.forEach(d => {
          d.textContent = '';
          d.style.background = 'transparent';
        });
        const exit = cellEls[(N - 1) * N + (N - 1)];
        exit.textContent = '🚪';
        exit.style.background = 'rgba(34,211,165,.22)';
        const me = cellEls[py * N + px];
        me.textContent = '🟡';
        me.style.background = 'rgba(255,209,102,.2)';
        note.textContent = `צעדים: ${steps} · ניקוד: ${fmt(Math.max(0, 400 - steps * 4))}`;
      };
      const move = (dx, dy, dir) => {
        if (done) return;
        const c = at(px, py);
        if (c[dir]) { api.sfx('bad'); return; }
        px = clamp(px + dx, 0, N - 1);
        py = clamp(py + dy, 0, N - 1);
        steps++;
        api.sfx('tap');
        paint();
        if (px === N - 1 && py === N - 1) {
          done = true;
          const secs = (Date.now() - startT) / 1000;
          const bonus = secs < 30 ? 100 : 0;
          const score = Math.max(50, 400 - steps * 4) + bonus;
          api.sfx('win');
          api.finish(score, { detail: `${steps} צעדים ב־${Math.round(secs)} שניות${bonus ? ' · בונוס 100' : ''}` });
        }
      };
      const mk = (label, dx, dy, dir) => {
        const b = el('button', 'chip', label);
        b.style.cssText = 'font-size:20px;padding:12px 0;font-weight:800';
        b.onclick = () => move(dx, dy, dir);
        return b;
      };
      pad.appendChild(el('span'));
      pad.appendChild(mk('↑', 0, -1, 'n'));
      pad.appendChild(el('span'));
      pad.appendChild(mk('←', -1, 0, 'w'));
      pad.appendChild(mk('↓', 0, 1, 's'));
      pad.appendChild(mk('→', 1, 0, 'e'));

      const keyH = e => {
        if (e.key === 'ArrowUp') { e.preventDefault(); move(0, -1, 'n'); }
        if (e.key === 'ArrowDown') { e.preventDefault(); move(0, 1, 's'); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1, 0, 'w'); }
        if (e.key === 'ArrowRight') { e.preventDefault(); move(1, 0, 'e'); }
      };
      window.addEventListener('keydown', keyH);
      api.onCleanup(() => window.removeEventListener('keydown', keyH));

      api.setTimer(90, () => {
        if (done) return;
        done = true;
        api.finish(Math.max(0, 200 - steps * 3), { detail: 'הזמן נגמר לפני שהגעתם ליציאה' });
      });
      draw();
      api.status('מצאו את הדרך ליציאה');
    }
  });

  /* 2. פאזל הזזה */
  registerGame({
    id: 'logic.puzzle', cat: 'logic', name: 'פאזל הזזה', emoji: '🧩', diff: 2, gold: 800, silver: 450,
    desc: 'הזיזו את האריחים עד שהמספרים מסודרים לפי הסדר.',
    howto: [
      'יש שמונה אריחים ותא ריק.',
      'לוחצים על אריח שליד התא הריק כדי להחליף ביניהם.',
      'מסדרים את המספרים מ־1 עד 8, והתא הריק בסוף.',
      'כמה שפחות מהלכים — יותר נקודות.'
    ],
    scoring: '600 נקודות פחות 6 לכל מהלך',
    mount(stage, api) {
      let board = [1, 2, 3, 4, 5, 6, 7, 8, 0];
      // shuffle with valid moves
      for (let i = 0; i < 60; i++) {
        const e = board.indexOf(0);
        const opts = [e - 3, e + 3, e % 3 === 0 ? -1 : e - 1, e % 3 === 2 ? -1 : e + 1].filter(n => n >= 0 && n < 9);
        const n = pick(opts);
        [board[e], board[n]] = [board[n], board[e]];
      }
      let moves = 0, solved = false;
      stage.innerHTML = '';
      const wrap = el('div', 'pad-wrap');
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '14px';
      const grid = el('div', '');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:min(80vw,300px);aspect-ratio:1';
      const note = el('div', 'small-note');
      wrap.appendChild(grid); wrap.appendChild(note);
      stage.appendChild(wrap);

      const render = () => {
        grid.innerHTML = '';
        board.forEach((v, i) => {
          const b = el('button', v ? 'tile' : '', v ? String(v) : '');
          b.style.cssText = 'font-size:26px;font-weight:800;display:flex;align-items:center;justify-content:center' + (v ? '' : ';opacity:.12');
          b.onclick = () => {
            if (solved || !v) return;
            const e = board.indexOf(0);
            const ok = (i === e - 3) || (i === e + 3) || (i === e - 1 && e % 3 !== 0) || (i === e + 1 && e % 3 !== 2);
            if (!ok) { api.sfx('bad'); return; }
            [board[e], board[i]] = [board[i], board[e]];
            moves++;
            api.sfx('tap');
            render();
          };
          grid.appendChild(b);
        });
      };
      const check = () => {
        for (let i = 0; i < 8; i++) if (board[i] !== i + 1) return false;
        return true;
      };
      const wrapCheck = () => {
        note.textContent = `מהלכים: ${moves}`;
        if (check()) {
          solved = true;
          const score = Math.max(80, 600 - moves * 6);
          api.setScore(score);
          api.sfx('win');
          api.after(400, () => api.finish(score, { detail: `הפאזל נפתר ב־${moves} מהלכים` }));
        }
      };
      const loop = api.every(250, () => { if (!solved) wrapCheck(); });
      api.onCleanup(() => clearInterval(loop));
      render();
      wrapCheck();
      api.status('סדרו את המספרים');
    }
  });

  const NEXT = [
    q4('מהו האיבר הבא? 2, 4, 8, 16, ___', '32', ['24', '20', '30']),
    q4('מהו האיבר הבא? 1, 4, 9, 16, ___', '25', ['20', '24', '36']),
    q4('מהו האיבר הבא? א, ג, ה, ז, ___', 'ט', ['ח', 'י', 'ו']),
    q4('מהו האיבר הבא? 3, 6, 11, 18, ___', '27', ['24', '26', '30']),
    q4('מהו האיבר הבא? 100, 50, 25, ___', '12.5', ['10', '15', '5']),
    q4('מהו האיבר הבא? 1, 1, 2, 3, 5, 8, ___', '13', ['11', '12', '15']),
    q4('מהו האיבר הבא? 2, 6, 12, 20, ___', '30', ['28', '24', '32']),
    q4('מהו האיבר הבא? 81, 27, 9, 3, ___', '1', ['0', '2', '6']),
    q4('מהו האיבר הבא? 1, 8, 27, 64, ___', '125', ['100', '81', '216']),
    q4('מהו האיבר הבא? 5, 10, 9, 18, 17, ___', '34', ['26', '20', '36'])
  ];
  quizGame({
    id: 'logic.next', cat: 'logic', name: 'מה בא בתור', emoji: '➰', diff: 2, gold: 900, silver: 500,
    desc: 'עשר סדרות עם חוקים שונים — מצאו את האיבר הבא.',
    howto: [
      'מוצגת סדרה של מספרים או אותיות.',
      'מזהים את החוק שמפעיל אותה.',
      'בוחרים את האיבר הבא מתוך ארבע.',
      '120 נקודות לכל סדרה שנפתרה.'
    ],
    scoring: '120 נקודות לתשובה נכונה',
    pick() { return sample(NEXT, 10); }
  });

  const RIDDLES = [
    q4('לאבא של דני יש חמישה בנים: אחד, שניים, שלושה, ארבעה ו...?', 'דני', ['חמישה', 'שישה', 'אף אחד']),
    q4('חילקו 12 תפוחים ל־4 ילדים שווה בשווה, אבל נשארו 4 בסל. איך?', 'כל ילד קיבל 2 ונותרו 4', ['כל ילד קיבל 3', 'אחד לא קיבל', 'לא ניתן']),
    q4('כמה פעמים אפשר לגרוע 5 מ־25?', 'פעם אחת — אחר כך זה 20', ['5 פעמים', '4 פעמים', 'אין סוף']),
    q4('שני אבות ושני בנים הלכו לדוג והוציאו 3 דגים. כל אחד קיבל דג אחד. איך?', 'סבא, אבא ובן', ['אחד לא דג', 'היה שם כלב', 'דג אחד היה גדול']),
    q4('מה הולך על ארבע בבוקר, על שתיים בצהריים ועל שלוש בערב?', 'אדם בחייו', ['כלב', 'סוס', 'ציפור']),
    q4('מה שיש לך, שאם תיתן אותו למישהו אחר — נשאר לך?', 'מילה', ['כסף', 'מתנה', 'חיוך']),
    q4('מה שוקל יותר: קילוגרם נוצות או קילוגרם ברזל?', 'שווים', ['הברזל', 'הנוצות', 'תלוי בגודל']),
    q4('לאמא יש 3 בנות. לכל בת יש אח אחד. כמה ילדים יש לאמא?', '4', ['3', '5', '6']),
    q4('אם אתה רץ במירוץ ועברת את מי שהיה במקום השני, באיזה מקום אתה?', 'שני', ['ראשון', 'שלישי', 'רביעי']),
    q4('כמה חודשים בשנה יש 28 ימים?', 'כל החודשים', ['אחד', 'שניים', 'אף אחד'])
  ];
  quizGame({
    id: 'logic.riddles', cat: 'logic', name: 'חידות היגיון', emoji: '🤯', diff: 3, gold: 1000, silver: 550,
    desc: 'עשר חידות שמפעילות את הראש — שימו לב לניסוח.',
    howto: [
      'מוצגת חידה קצרה.',
      'בוחרים תשובה מתוך ארבע.',
      'התשובה לרוב מסתתרת בניסוח.',
      '140 נקודות לכל חידה שנפתרה.'
    ],
    scoring: '140 נקודות לתשובה נכונה',
    pick() { return sample(RIDDLES, 10); }
  });

  const GRID = [
    q4('דנה גבוהה מיובל, ויובל גבוה מנועה. מי הנמוכה מכולן?', 'נועה', ['דנה', 'יובל', 'אי אפשר לדעת']),
    q4('אם כל החתולים הם חיות, וחלק מהחיות ישנות ביום — מה בהכרח נכון?', 'כל החתולים הם חיות', ['כל החתולים ישנים ביום', 'חלק מהחתולים ישנים ביום', 'כל החיות הן חתולים']),
    q4('בכיתה 20 תלמידים. 12 לומדים אנגלית, 8 לומדים צרפתית, ו־4 לומדים את שתיהן. כמה לומדים רק אנגלית?', '8', ['12', '4', '16']),
    q4('לכל אחד משלושת האחים יש אחות אחת. כמה אחים ואחיות במשפחה?', '3 אחים ואחות אחת', ['3 אחים ו־3 אחיות', '4 אחים ואחות', '2 אחים ואחות']),
    q4('לוקח 5 דקות להרתיח ביצה אחת. כמה זמן להרתיח 4 ביצים בסיר אחד?', '5 דקות', ['20 דקות', '10 דקות', '15 דקות']),
    q4('שני אנשים משחקים 5 משחקים, וכל אחד מנצח 3 פעמים. מה נכון?', 'זה בלתי אפשרי', ['אחד מהם שיקר', 'היה תיקו', 'זה אפשרי עם תוספת זמן']),
    q4('אם היום יום ראשון, איזה יום היה אתמול של אתמול?', 'שבת', ['שישי', 'שני', 'ראשון']),
    q4('בקופסה יש 3 זוגות גרביים שחורים ו־2 זוגות לבנים. כמה גרביים צריך להוציא בלי להסתכל כדי להבטיח זוג בצבע אחד?', '3', ['2', '4', '5']),
    q4('אבא של שירה הוא בנו של סבא שלי. מי שירה בשבילי?', 'אחות (או בת דוד)', ['אמא', 'דודה', 'בת']),
    q4('מספר ועוד חצי ממנו ועוד רבע ממנו שווה 7. מהו המספר?', '4', ['3', '5', '6'])
  ];
  quizGame({
    id: 'logic.grid', cat: 'logic', name: 'חשיבה מסודרת', emoji: '🔎', diff: 3, gold: 1000, silver: 550,
    desc: 'עשר חידות חשיבה לוגית עם מסקנות.',
    howto: [
      'מוצגת חידה עם נתונים.',
      'בוחרים את המסקנה הנכונה.',
      'שימו לב להבדל בין "בהכרח" ל"אפשרי".',
      '140 נקודות לכל תשובה נכונה.'
    ],
    scoring: '140 נקודות לתשובה נכונה',
    pick() { return sample(GRID, 10); }
  });

})();
