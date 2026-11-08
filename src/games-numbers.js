/* ===== חשבון ומספרים ===== */
(function () {

  const numOpts = (correct, spread) => {
    const set = new Set([correct]);
    let guard = 0;
    while (set.size < 4 && guard++ < 60) {
      const delta = rndInt(1, spread) * (Math.random() < .5 ? -1 : 1);
      const v = correct + delta;
      if (v >= 0) set.add(v);
    }
    const opts = shuffle([...set]);
    return { options: opts.map(String), answer: opts.indexOf(correct) };
  };

  /* 1. מה גדול יותר */
  quizGame({
    id: 'numbers.compare', cat: 'numbers', name: 'מה גדול יותר', emoji: '⚖️', diff: 2, gold: 800, silver: 450,
    desc: 'שני ביטויים על המסך — איזה מהם גדול יותר?',
    howto: [
      'מוצגים שני ביטויים חשבוניים.',
      'בוחרים את זה שהתוצאה שלו גדולה יותר.',
      'מיד נחשפת התשובה הנכונה.',
      'עשר שאלות, וכל תשובה נכונה מוסיפה 110 נקודות.'
    ],
    scoring: '110 נקודות לתשובה נכונה',
    pick() {
      const out = [];
      for (let i = 0; i < 10; i++) {
        let a, b, c, d, va, vb;
        do {
          a = rndInt(2, 12); b = rndInt(2, 9);
          c = rndInt(2, 12); d = rndInt(2, 9);
          va = a * b; vb = c * d;
        } while (va === vb);
        const q = `איזה ביטוי גדול יותר?`;
        const opts = [`${a} × ${b}`, `${c} × ${d}`];
        out.push({ q, options: opts, answer: va > vb ? 0 : 1, pts: 110 });
      }
      return out;
    }
  });

  /* 2. לוח הכפל */
  quizGame({
    id: 'numbers.times', cat: 'numbers', name: 'לוח הכפל', emoji: '✖️', diff: 1, gold: 900, silver: 500,
    desc: 'שתים עשרה שאלות כפל נגד השעון.',
    howto: [
      'מוצגת תרגיל כפל עם ארבע תשובות.',
      'בוחרים תשובה בלחיצה.',
      'שמונים שניות לכל השאלות.',
      'כל תשובה נכונה מוסיפה 90 נקודות.'
    ],
    scoring: '90 נקודות לתשובה נכונה · 100 בונוס על 12 מתוך 12',
    total: 80,
    pick() {
      const out = [];
      for (let i = 0; i < 12; i++) {
        const a = rndInt(2, 10), b = rndInt(2, 10);
        const correct = a * b;
        const o = numOpts(correct, 12);
        out.push({ q: `${a} × ${b} = ?`, options: o.options, answer: o.answer });
      }
      return out;
    }
  });

  /* 3. סדרות מספרים */
  quizGame({
    id: 'numbers.series', cat: 'numbers', name: 'סדרות חשבוניות', emoji: '🔗', diff: 2, gold: 900, silver: 500,
    desc: 'מצאו את המספר החסר בהמשך הסדרה.',
    howto: [
      'מוצגים ארבעה מספרים לפי חוק קבוע.',
      'מזהים את החוק ומחשבים את המספר הבא.',
      'בוחרים את התשובה מתוך ארבע אפשריות.',
      'עשר סדרות, 120 נקודות לכל תשובה נכונה.'
    ],
    scoring: '120 נקודות לסדרה שנפתרה',
    pick() {
      const out = [];
      for (let i = 0; i < 10; i++) {
        const start = rndInt(1, 20);
        const step = rndInt(2, 9);
        const seq = [start, start + step, start + step * 2, start + step * 3];
        const correct = start + step * 4;
        const o = numOpts(correct, step * 3);
        out.push({ q: `מהו המספר הבא? ${seq.join(' , ')} , ___`, options: o.options, answer: o.answer });
      }
      return out;
    }
  });

  /* 4. חילוק */
  quizGame({
    id: 'numbers.division', cat: 'numbers', name: 'חילוק מהיר', emoji: '➗', diff: 2, gold: 900, silver: 500,
    desc: 'תרגילי חילוק שלמים עם ארבע תשובות.',
    howto: [
      'מוצג תרגיל חילוק עם ארבע תשובות.',
      'בוחרים תשובה בלחיצה.',
      'שבעים שניות לכל השאלות.',
      'כל תשובה נכונה מוסיפה 100 נקודות.'
    ],
    scoring: '100 נקודות לתשובה נכונה',
    total: 70,
    pick() {
      const out = [];
      for (let i = 0; i < 12; i++) {
        const b = rndInt(2, 9);
        const correct = rndInt(2, 12);
        const a = b * correct;
        const o = numOpts(correct, 5);
        out.push({ q: `${a} ÷ ${b} = ?`, options: o.options, answer: o.answer });
      }
      return out;
    }
  });

  /* 5. פגע במספר */
  registerGame({
    id: 'numbers.target', cat: 'numbers', name: 'פגע במספר', emoji: '🎯', diff: 2, gold: 800, silver: 450,
    desc: 'חברו מספרים מהלוח כדי להגיע בדיוק למספר המטרה.',
    howto: [
      'מוצג מספר מטרה ומתחתיו תשעה מספרים.',
      'לוחצים על מספרים כדי לחבר אותם.',
      'הגעה בדיוק למטרה מזכה ב־200 נקודות ומטרה חדשה.',
      'חריגה מהמטרה מאפסת את הסכום הנוכחי.'
    ],
    scoring: '200 נקודות לכל מטרה שהושגה · 80 בונוס על מטרה בשתי לחיצות',
    mount(stage, api) {
      let score = 0, sum = 0, target = 0, hits = 0, cleared = false;

      stage.innerHTML = '';
      const wrap = el('div', 'pad-wrap');
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '14px';
      const head = el('div', '');
      head.style.cssText = 'font-size:19px;font-weight:700';
      const sumEl = el('div', 'g-q');
      sumEl.style.fontSize = '34px';
      const grid = el('div', '');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:340px;width:100%';
      wrap.appendChild(head); wrap.appendChild(sumEl); wrap.appendChild(grid);
      stage.appendChild(wrap);

      const newTarget = () => {
        target = rndInt(20, 60);
        sum = 0;
        sumEl.textContent = String(sum);
        head.textContent = `המטרה: ${target} · פגיעות: ${hits}`;
        grid.innerHTML = '';
        const nums = [];
        while (nums.length < 9) {
          const v = rndInt(1, Math.max(9, Math.ceil(target / 3)));
          nums.push(v);
        }
        if (!nums.includes(target)) nums[rnd(9)] = target;
        shuffle(nums).forEach(v => {
          const b = el('button', 'chip', String(v));
          b.style.cssText = 'font-size:21px;font-weight:800;padding:16px 0';
          b.onclick = () => {
            if (cleared) return;
            sum += v;
            api.sfx('tap');
            sumEl.textContent = String(sum);
            if (sum === target) {
              hits++;
              score += 200;
              api.setScore(score);
              api.sfx('win');
              head.textContent = 'פגיעה מדויקת! 🎯';
              setTimeout(() => { if (!cleared) newTarget(); }, 650);
            } else if (sum > target) {
              api.sfx('bad');
              sum = 0;
              sumEl.textContent = '0';
              head.textContent = `חרגתם! המטרה נשארה ${target}`;
            }
          };
          grid.appendChild(b);
        });
      };

      api.setTimer(90, () => {
        if (cleared) return;
        cleared = true;
        api.finish(score, { detail: `${hits} מטרות שהושגו` });
      });
      api.onCleanup(() => { cleared = true; });
      newTarget();
      api.status('חברו מספרים עד המטרה');
    }
  });

})();
