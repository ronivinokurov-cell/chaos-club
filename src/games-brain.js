/* ===== מוח וחידות ===== */
(function () {

  /* 1. זיכרון זוגות */
  registerGame({
    id: 'brain.memory', cat: 'brain', name: 'זיכרון זוגות', emoji: '🃏', diff: 1, gold: 700, silver: 400,
    desc: 'הפכו קלפים ומצאו את כל שמונת הזוגות הזהים.',
    howto: ['לוחצים על קלף כדי להפוך אותו.', 'שני קלפים זהים נשארים גלויים ומוסיפים 100 נקודות.', 'טעות מסובבת אותם חזרה ומורידה 10 נקודות.', 'סיימו את כל הזוגות — ככל שתמהרו, הבונוס גדול יותר.'],
    scoring: '100 נקודות לזוג · 10− על טעות · בונוס מהירות עד 200',
    mount(stage, api) {
      const icons = ['🔥', '🎧', '🍕', '🚀', '🐙', '💎', '🎯', '🌵'];
      const deck = shuffle(icons.concat(icons));
      let open = [], matched = 0, misses = 0, score = 0, t0 = Date.now();
      stage.innerHTML = '';
      const grid = el('div', 'tiles');
      grid.style.gridTemplateColumns = 'repeat(4, minmax(58px, 78px))';
      stage.appendChild(grid);
      api.status('זוגות: 0/8');

      deck.forEach((ic, i) => {
        const t = el('button', 'tile', '');
        t.dataset.i = i;
        t.onclick = () => {
          if (t.classList.contains('face') || t.classList.contains('done') || open.length === 2) return;
          api.sfx('flip');
          t.classList.add('face'); t.textContent = ic;
          open.push({ t, ic });
          if (open.length === 2) {
            if (open[0].ic === open[1].ic) {
              const a = open[0].t, b = open[1].t;
              open = [];
              setTimeout(() => {
                a.classList.add('done'); b.classList.add('done');
                matched++; score += 100; api.setScore(score); api.sfx('good');
                api.status(`זוגות: ${matched}/8`);
                if (matched === 8) {
                  const secs = (Date.now() - t0) / 1000;
                  const bonus = Math.max(0, Math.round(200 - secs * 4));
                  api.finish(score + bonus, { detail: `8 זוגות ב־${Math.round(secs)} שניות · בונוס ${bonus}` });
                }
              }, 260);
            } else {
              misses++;
              const [a, b] = open;
              open = [];
              api.after(720, () => {
                [a, b].forEach(o => { o.t.classList.remove('face'); o.t.textContent = ''; });
              });
              score = Math.max(0, score - 10); api.setScore(score); api.sfx('bad');
              b.t.classList.add('bad');
              api.after(360, () => b.t.classList.remove('bad'));
            }
          }
        };
        grid.appendChild(t);
      });
    }
  });

  /* 2. סיימון */
  registerGame({
    id: 'brain.simon', cat: 'brain', name: 'סיימון', emoji: '🎛️', diff: 2, gold: 300, silver: 150,
    desc: 'חזרו על רצף הצלילים והצבעים שהולך ומתארך.',
    howto: ['המערכת מהבהבת רצף של צבעים עם צליל.', 'לאחר מכן חזרו על הרצף באותו סדר.', 'כל שלב מוסיף צליל אחד לרצף.', 'טעות אחת מסיימת את המשחק.'],
    scoring: '50 נקודות על כל שלב שהושלם',
    mount(stage, api) {
      const colors = ['#8b5cf6', '#3ad0ff', '#ff4d8d', '#ffb020'];
      const freqs = [329.63, 392, 440, 523.25];
      let seq = [], level = 0, input = [], busy = true;
      stage.innerHTML = '';
      const pads = el('div', 'simon-pads');
      const els = colors.map((c, i) => {
        const p = el('button', 'pad');
        p.style.background = `linear-gradient(145deg,${c},${c}aa)`;
        p.style.color = c;
        p.onclick = () => press(i);
        pads.appendChild(p);
        return p;
      });
      stage.appendChild(pads);
      const note = el('p', 'g-note', 'צפו ברצף…');
      stage.appendChild(note);

      function light(i, ms = 340) {
        els[i].classList.add('lit');
        api.note(freqs[i], 0, .3, 'sine', .24);
        api.after(ms * .7, () => els[i].classList.remove('lit'));
      }
      function playSeq() {
        busy = true;
        note.textContent = `שלב ${level} · צפו ברצף…`;
        api.status(`שלב ${level}`);
        seq.forEach((v, k) => api.after(480 * k + 420, () => light(v)));
        api.after(480 * seq.length + 420, () => { busy = false; input = []; note.textContent = 'עכשיו תורכם — חזרו על הרצף'; });
      }
      function nextLevel() {
        level++;
        seq.push(rnd(4));
        api.setScore((level - 1) * 50);
        playSeq();
      }
      function press(i) {
        if (busy) return;
        light(i, 220);
        input.push(i);
        const k = input.length - 1;
        if (input[k] !== seq[k]) {
          els[i].classList.add('bad');
          api.sfx('lose');
          api.after(450, () => els[i].classList.remove('bad'));
          note.textContent = 'טעות! הרצף הסתיים.';
          api.after(700, () => api.finish(Math.max(0, (level - 1) * 50), { detail: `הגעת לשלב ${level}` }));
          busy = true;
          return;
        }
        if (input.length === seq.length) {
          api.sfx('great');
          busy = true;
          note.textContent = 'מעולה! עוד צליל…';
          api.after(900, nextLevel);
        }
      }
      api.after(500, nextLevel);
    }
  });

  /* 3. חשבון מהיר */
  registerGame({
    id: 'brain.math', cat: 'brain', name: 'חשבון מהיר', emoji: '➗', diff: 1, gold: 120, silver: 70,
    desc: 'פתרו 12 תרגילי חשבון נגד השעון.',
    howto: ['בכל שאלה מוצג תרגיל עם 4 תשובות.', 'לוחצים על התשובה הנכונה.','תשובה נכונה = 10 נקודות.','יש 60 שניות לסיים את כל השאלות.'],
    scoring: '10 נקודות לשאלה נכונה · 12 שאלות · 60 שניות',
    mount(stage, api) {
      const gen = () => {
        const kind = rnd(3);
        let a, b, q, ans;
        if (kind === 0) { a = rndInt(11, 89); b = rndInt(11, 99); q = `${a} + ${b}`; ans = a + b; }
        else if (kind === 1) { a = rndInt(40, 99); b = rndInt(11, a - 5); q = `${a} − ${b}`; ans = a - b; }
        else { a = rndInt(3, 12); b = rndInt(3, 12); q = `${a} × ${b}`; ans = a * b; }
        const set = new Set([ans]);
        while (set.size < 4) {
          const d = ans + pick([-11, -9, -6, -3, -2, 2, 3, 6, 9, 11, 18]);
          if (d > 0 && d !== ans) set.add(d);
        }
        const options = shuffle(Array.from(set));
        return { q: `= ${q}`, sub: 'מה התוצאה?', options: options.map(String), answer: options.indexOf(ans), pts: 10 };
      };
      runQuiz(api, { count: 12, total: 60, make: gen });
    }
  });

  /* 4. רצפים לוגיים */
  registerGame({
    id: 'brain.logic', cat: 'brain', name: 'רצף לוגי', emoji: '🧩', diff: 2, gold: 100, silver: 60,
    desc: 'גלו את החוק ומצאו את המספר הבא ברצף.',
    howto: ['מוצג רצף מספרים עם סימן שאלה בסופו.', 'מזהים את החוק ומקישים על המספר הנכון.', 'תשובה נכונה = 10 נקודות.', 'סך הכול 10 רצפים.'],
    scoring: '10 נקודות לרצף נכון',
    mount(stage, api) {
      const makeSeq = () => {
        const kind = rnd(4);
        let seq = [], next = 0;
        if (kind === 0) { const s = rndInt(2, 9), d = rndInt(2, 9); seq = [s, s + d, s + 2 * d, s + 3 * d]; next = s + 4 * d; }
        else if (kind === 1) { const s = rndInt(1, 4); seq = [s, s * 2, s * 4, s * 8]; next = s * 16; }
        else if (kind === 2) { let a = 1, b = 1; seq = [a]; for (let i = 0; i < 4; i++) { const c = a + b; seq.push(c); a = b; b = c; } seq = seq.slice(0, 5); next = seq[4] + seq[3]; }
        else { const s = rndInt(2, 7); seq = [s * s, (s + 1) * (s + 1), (s + 2) * (s + 2), (s + 3) * (s + 3)]; next = (s + 4) * (s + 4); }
        const opts = new Set([next]);
        while (opts.size < 4) {
          const d = next + pick([-7, -4, -3, -2, -1, 1, 2, 3, 4, 7, 10]);
          if (d > 0) opts.add(d);
        }
        const options = shuffle(Array.from(opts));
        return { q: `${seq.join(' , ')} , ?`, sub: 'מה המספר הבא?', options: options.map(String), answer: options.indexOf(next), pts: 10 };
      };
      runQuiz(api, { count: 10, make: makeSeq });
    }
  });

  /* 5. סודוקו 4x4 */
  registerGame({
    id: 'brain.sudoku', cat: 'brain', name: 'מיני סודוקו', emoji: '🔢', diff: 3, gold: 260, silver: 150,
    desc: 'מלאו ריבוע 4×4 כך שכל מספר יופיע פעם אחת בכל שורה, עמודה וריבוע.',
    howto: ['לוחצים על משבצת ריקה ואז על מספר 1–4.', 'אין כפילות בשורה, בעמודה או בריבוע 2×2.', 'תשובה נכונה = 10 נקודות, טעות = 5−.', 'מילוי מלא של הלוח מעניק בונוס 120.'],
    scoring: '10 נקודות למשבצת · 5− על טעות · בונוס 120 לסיום',
    mount(stage, api) {
      const base = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];
      const perm = shuffle([1, 2, 3, 4]);
      const sol = base.map(r => r.map(v => perm[v - 1]));
      const holes = new Set();
      while (holes.size < 9) holes.add(rnd(16));
      const values = sol.flat().map((v, i) => holes.has(i) ? 0 : v);
      let sel = -1, score = 0, left = holes.size, errors = 0;

      stage.innerHTML = '';
      const grid = el('div', 'tiles');
      grid.style.gridTemplateColumns = 'repeat(4, minmax(58px, 74px))';
      grid.style.gap = '7px';
      const cells = [];
      values.forEach((v, i) => {
        const c = el('button', 'tile', v ? v : '');
        if (v) { c.style.opacity = '.55'; c.style.fontWeight = '900'; }
        c.onclick = () => {
          if (values[i]) return;
          api.sfx('tap');
          cells.forEach(x => x.classList.remove('sel'));
          sel = i; c.classList.add('sel');
        };
        cells.push(c); grid.appendChild(c);
        if ((i % 4) === 1) c.style.marginInlineEnd = '10px';
        if (Math.floor(i / 4) === 1) c.style.marginBottom = '10px';
      });
      stage.appendChild(grid);

      const pad = el('div', 'row');
      pad.style.marginTop = '16px';
      for (let n = 1; n <= 4; n++) {
        const b = el('button', 'btn ghost', String(n));
        b.style.minWidth = '58px';
        b.onclick = () => {
          if (sel < 0) { toast('בחרו משבצת ריקה קודם'); return; }
          const i = sel;
          if (values[i]) return;
          if (sol[Math.floor(i / 4)][i % 4] === n) {
            values[i] = n;
            cells[i].textContent = n;
            cells[i].classList.remove('sel');
            cells[i].style.opacity = '1';
            cells[i].style.background = 'linear-gradient(145deg,#1c6b53,#22d3a5)';
            cells[i].style.color = '#04120d';
            score += 10; api.setScore(score); api.sfx('good');
            sel = -1; left--;
            api.status(`נותרו ${left} משבצות`);
            if (left === 0) {
              api.sfx('win');
              api.finish(score + 120, { detail: `לוח מלא! ${errors} טעויות · בונוס 120` });
            }
          } else {
            errors++;
            cells[i].classList.add('bad');
            api.after(380, () => cells[i].classList.remove('bad'));
            score = Math.max(0, score - 5); api.setScore(score); api.sfx('bad');
          }
        };
        pad.appendChild(b);
      }
      stage.appendChild(pad);
      stage.appendChild(el('p', 'g-note', 'רמז: כל שורה, עמודה וריבוע 2×2 מכילים 1–4 בלי כפילות'));
      api.status(`נותרו ${left} משבצות`);
    }
  });

})();
