/* ===== מוזיקה ובידור ===== */
(function () {
  const NF = { 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392, 'A4': 440, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25 };
  const playMelody = (notes, api, gap = .34) => notes.forEach((n, i) => api.note(NF[n] || 440, i * gap, .3, 'triangle', .22));

  const SONGS = [
    { name: 'אודה לשמחה', notes: ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'D4'] },
    { name: 'כוכב קטן', notes: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4'] },
    { name: 'יום הולדת שמח', notes: ['G4', 'G4', 'A4', 'G4', 'C5', 'B4', 'G4', 'G4', 'A4', 'G4', 'D5', 'C5'] },
    { name: 'ג׳ינגל בלס', notes: ['E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'G4', 'C4', 'D4', 'E4'] },
    { name: 'פרר ז׳אק', notes: ['C4', 'D4', 'E4', 'C4', 'C4', 'D4', 'E4', 'C4', 'E4', 'F4', 'G4', 'E4', 'F4', 'G4'] },
    { name: 'למרי היה כבש קטן', notes: ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4', 'D4', 'D4', 'D4', 'E4', 'G4', 'G4'] },
    { name: 'למקדונלד היתה חווה', notes: ['G4', 'G4', 'G4', 'D4', 'E4', 'E4', 'D4', 'B4', 'B4', 'A4', 'A4', 'G4'] }
  ];

  /* 1. נחש את המנגינה */
  registerGame({
    id: 'music.melody', cat: 'music', name: 'נחש את המנגינה', emoji: '🎼', diff: 2, gold: 90, silver: 50,
    desc: 'מנגינה מושמעת ואתם מזהים את השיר.',
    howto: ['לוחצים «השמע מנגינה» כדי לשמוע.', 'בוחרים את שם השיר מתוך ארבע אפשרויות.', 'אפשר להשמיע שוב בלי הגבלה.', 'תשובה נכונה = 15 נקודות.'],
    scoring: '15 נקודות לכל מנגינה שזיהיתם',
    mount(stage, api) {
      const deck = shuffle(SONGS).slice(0, 6);
      runQuiz(api, {
        count: deck.length,
        make(i) {
          const s = deck[i];
          const wrong = shuffle(SONGS.filter(x => x.name !== s.name)).slice(0, 3).map(x => x.name);
          const options = shuffle([s.name].concat(wrong));
          return {
            sub: '🎧 האזינו ואז בחרו',
            q: 'איזו מנגינה זו?',
            options, answer: options.indexOf(s.name), pts: 15,
            build(box) {
              const b = el('button', 'btn', '▶︎ השמע מנגינה');
              b.style.margin = '0 auto 16px';
              b.style.display = 'flex';
              b.onclick = () => { Sound.unlock(); playMelody(s.notes, api); Sound.play('pop'); };
              box.appendChild(b);
            }
          };
        }
      });
    }
  });

  /* 2. תפוס את הקצב */
  registerGame({
    id: 'music.rhythm', cat: 'music', name: 'תפוס את הקצב', emoji: '🥁', diff: 2, gold: 130, silver: 70,
    desc: 'הקישו בדיוק על הפעימה — כמה שיותר מדויק.',
    howto: ['שומעים ספירה לאחור של 4 פעימות.', 'לאחר מכן מקישים על הכפתור הגדול בכל פעימה.', 'הקשה מדויקת = 10 נקודות, קרובה = 5.', '16 פעימות בסבב.'],
    scoring: '10 נקודות להקשה מדויקת (עד 90 מ״ש סטייה)',
    mount(stage, api) {
      const BEAT = 560, BEATS = 16, LEAD = 4;
      stage.innerHTML = '';
      const dots = el('div');
      dots.style.cssText = 'display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:14px';
      const dotEls = [];
      for (let i = 0; i < BEATS; i++) { const d = el('span', 'chip', '•'); dots.appendChild(d); dotEls.push(d); }
      stage.appendChild(dots);
      const tapBtn = el('button', 'btn', '👆 הקש כאן');
      tapBtn.style.cssText = 'width:min(320px,80vw);height:120px;font-size:20px;border-radius:26px;display:block;margin:10px auto';
      stage.appendChild(tapBtn);
      stage.appendChild(el('p', 'g-note', 'אפשר גם להקיש במקש הרווח'));
      api.status('מתכוננים…');

      const start = performance.now() + 1400;
      let score = 0, idx = 0, taps = [];

      for (let i = 0; i < LEAD; i++) api.after(Math.max(0, start - performance.now() + i * BEAT), () => { api.sfx('tick'); api.status(`ספירה: ${i + 1}`); });
      for (let i = 0; i < BEATS; i++) {
        api.after(Math.max(0, start - performance.now() + (LEAD + i) * BEAT), () => {
          api.sfx('drum');
          dotEls[i].classList.add('on');
          dotEls[i].style.background = 'linear-gradient(135deg,var(--c1),var(--c2))';
          dotEls[i].style.color = '#08080f';
          api.status(`פעימה ${i + 1}/${BEATS}`);
        });
      }
      api.after(Math.max(0, start - performance.now() + (LEAD + BEATS) * BEAT + 500), () => {
        const total = taps.length;
        api.finish(score, { detail: `${total} הקשות · ${score / 10} מדויקות` });
      });

      const tap = () => {
        const now = performance.now();
        if (now < start - 200) return;
        const rel = (now - start) / BEAT - LEAD;
        const near = Math.round(rel);
        const err = Math.abs(rel - near) * BEAT;
        if (near < 0 || near >= BEATS) return;
        taps.push({ near, err });
        if (err < 90) { score += 10; api.sfx('good'); tapBtn.textContent = '🎯 מדויק!'; }
        else if (err < 190) { score += 5; api.sfx('tap'); tapBtn.textContent = '👍 קרוב'; }
        else { api.sfx('bad'); tapBtn.textContent = '😬 לא בקצב'; }
        api.setScore(score);
        api.after(160, () => { tapBtn.textContent = '👆 הקש כאן'; });
      };
      tapBtn.onclick = tap;
      const keyH = e => { if (e.code === 'Space') { e.preventDefault(); tap(); } };
      window.addEventListener('keydown', keyH);
      api.onCleanup(() => window.removeEventListener('keydown', keyH));
    }
  });

  /* 3. חזור על המנגינה */
  registerGame({
    id: 'music.echo', cat: 'music', name: 'חזור על המנגינה', emoji: '🎹', diff: 3, gold: 120, silver: 70,
    desc: 'האזינו למנגינה ונגנו אותה בעצמכם על הקלידים.',
    howto: ['המערכת מנגנת רצף צלילים על הקליד.', 'חזרו על הרצף לפי הסדר בלחיצה על הקלידים.', 'כל סבב מוסיף צליל אחד.', 'טעות מסיימת את המשחק.'],
    scoring: '20 נקודות על כל סבב שהושלם',
    mount(stage, api) {
      const keys = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
      const labels = ['דו', 'רה', 'מי', 'פה', 'סול', 'לה', 'סי', 'דו׳'];
      let seq = [], level = 0, input = [], busy = true;
      stage.innerHTML = '';
      const kb = el('div');
      kb.style.cssText = 'display:flex;gap:5px;justify-content:center;align-items:flex-end;margin:10px 0 18px';
      const keyEls = keys.map((k, i) => {
        const b = el('button');
        b.style.cssText = `flex:1;max-width:58px;height:${150 - i * 4}px;border-radius:0 0 12px 12px;background:linear-gradient(180deg,#f7f5ff,#cfc7ef);color:#221a3a;font-weight:900;font-size:12px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:10px;transition:.1s;box-shadow:0 6px 0 #8d82b5`;
        b.textContent = labels[i];
        b.onclick = () => press(i);
        kb.appendChild(b);
        return b;
      });
      stage.appendChild(kb);
      const note = el('p', 'g-note', 'האזינו…');
      stage.appendChild(note);
      const replay = el('button', 'btn ghost', '🔁 השמע שוב');
      replay.style.margin = '10px auto 0'; replay.style.display = 'flex';
      replay.onclick = () => { if (!busy) { busy = true; playSeq(); } };
      stage.appendChild(replay);

      function flash(i) {
        keyEls[i].style.background = 'linear-gradient(180deg,var(--c2),var(--c1))';
        api.note(NF[keys[i]], 0, .32, 'sine', .24);
        api.after(300, () => { keyEls[i].style.background = 'linear-gradient(180deg,#f7f5ff,#cfc7ef)'; });
      }
      function playSeq() {
        note.textContent = `סבב ${level} · האזינו…`;
        api.status(`סבב ${level}`);
        seq.forEach((v, k) => api.after(560 * k + 300, () => flash(v)));
        api.after(560 * seq.length + 320, () => { busy = false; input = []; note.textContent = 'עכשיו תורכם — נגנו את הרצף'; });
      }
      function next() { level++; seq.push(rnd(keys.length)); api.setScore((level - 1) * 20); playSeq(); }
      function press(i) {
        if (busy) return;
        flash(i);
        input.push(i);
        const k = input.length - 1;
        if (input[k] !== seq[k]) {
          api.sfx('lose'); busy = true;
          note.textContent = 'טעות! נסו שוב במשחק חדש.';
          api.after(700, () => api.finish(Math.max(0, (level - 1) * 20), { detail: `הגעתם לסבב ${level}` }));
          return;
        }
        if (input.length === seq.length) {
          api.sfx('great'); busy = true;
          note.textContent = 'מעולה! עוד צליל…';
          api.after(800, next);
        }
      }
      api.after(500, next);
    }
  });

  /* 4. טריוויה מוזיקה וקולנוע */
  const TRIVIA = [
    { q: 'כמה מיתרים יש בגיטרה קלאסית?', a: '6', o: ['4', '5', '7'] },
    { q: 'מי הלחין את «חליל הקסם»?', a: 'מוצרט', o: ['בטהובן', 'באך', 'שופן'] },
    { q: 'איזה כלי נגינה נקרא «הפסנתר של העניים»?', a: 'מפוחית', o: ['חלילית', 'בנג׳ו', 'אקורדיון'] },
    { q: 'כמה קלידים יש בפסנתר סטנדרטי?', a: '88', o: ['61', '76', '96'] },
    { q: 'מה פירוש הסימן «פורטה» בתווים?', a: 'חזק', o: ['חלש', 'מהר', 'לאט'] },
    { q: 'מי ביים את «פארק היורה»?', a: 'סטיבן ספילברג', o: ['ג׳יימס קמרון', 'כריסטופר נולאן', 'רידלי סקוט'] },
    { q: 'איזה זמרת ביצעה את «Like a Prayer»?', a: 'מדונה', o: ['שר', 'ביונסה', 'סלין דיון'] },
    { q: 'מהי התזמורת שמנגנת מוזיקה קלאסית גדולה?', a: 'תזמורת סימפונית', o: ['להקת ג׳אז', 'מקהלה', 'רביעיית מיתרים'] },
    { q: 'כמה שחקנים יש ברביעיית מיתרים?', a: '4', o: ['3', '5', '6'] },
    { q: 'מהו התפקיד של המנצח בתזמורת?', a: 'לנהל את הקצב והביצוע', o: ['לנגן בכינור', 'לכתוב את התווים', 'לכוון את הכלים'] }
  ];
  registerGame({
    id: 'music.trivia', cat: 'music', name: 'טריוויה מוזיקלית', emoji: '🎬', diff: 1, gold: 80, silver: 50,
    desc: 'עשר שאלות על מוזיקה, כלים וקולנוע.',
    howto: ['בכל שאלה יש ארבע תשובות.', 'בוחרים את התשובה הנכונה.', 'תשובה נכונה = 10 נקודות.', '10 שאלות, 20 שניות לשאלה.'],
    scoring: '10 נקודות לשאלה · 20 שניות לשאלה',
    mount(stage, api) {
      const deck = shuffle(TRIVIA).slice(0, 10);
      runQuiz(api, {
        count: deck.length,
        make(i) {
          const t = deck[i];
          const options = shuffle([t.a].concat(t.o));
          return { sub: '🎵 טריוויה', q: t.q, options, answer: options.indexOf(t.a), pts: 10 };
        }
      });
    }
  });

  /* 5. שחזר את הקצב */
  registerGame({
    id: 'music.beat', cat: 'music', name: 'שחזר את הקצב', emoji: '🎛️', diff: 3, gold: 120, silver: 60,
    desc: 'תופים: האזינו לתבנית קצב ושחזרו אותה על הגריד.',
    howto: ['לוחצים «השמע את הקצב» ושומעים 8 צעדים בשלושה כלים.', 'מסמנים בגריד את המשבצות ששמעתם.', 'לוחצים «בדוק» כדי לקבל ניקוד לפי דיוק.', 'שלושה סבבים, כל סבב קשה יותר.'],
    scoring: 'עד 40 נקודות לסבב לפי אחוז הדיוק',
    mount(stage, api) {
      const ROWS = [{ n: 'קיק', s: 'drum' }, { n: 'סנר', s: 'snare' }, { n: 'היי־האט', s: 'hat' }];
      const STEPS = 8;
      let round = 0, score = 0;
      stage.innerHTML = '';
      const box = el('div');
      stage.appendChild(box);

      function newRound() {
        if (round >= 3) return api.finish(score, { detail: 'שלושה קצבים שוחזרו' });
        round++;
        api.status(`סבב ${round}/3`);
        const density = 2 + round;
        const target = ROWS.map(() => Array.from({ length: STEPS }, () => false));
        ROWS.forEach((_, r) => {
          for (let k = 0; k < density; k++) target[r][rnd(STEPS)] = true;
          if (r === 0) target[0][0] = true;
        });
        const user = ROWS.map(() => Array.from({ length: STEPS }, () => false));
        box.innerHTML = '';
        box.appendChild(el('p', 'g-title', 'בנו את הקצב ששמעתם'));
        const grid = el('div');
        grid.style.cssText = 'display:grid;grid-template-columns:56px repeat(8,1fr);gap:6px;max-width:520px;margin:0 auto';
        ROWS.forEach((row, r) => {
          const lab = el('div', '', row.n);
          lab.style.cssText = 'font-size:11.5px;font-weight:800;color:var(--dim);display:flex;align-items:center';
          grid.appendChild(lab);
          for (let s = 0; s < STEPS; s++) {
            const c = el('button');
            c.style.cssText = 'aspect-ratio:1;border-radius:9px;background:rgba(255,255,255,.07);border:1px solid var(--line);transition:.12s';
            c.onclick = () => {
              user[r][s] = !user[r][s];
              c.style.background = user[r][s] ? 'linear-gradient(145deg,var(--c1),var(--c2))' : 'rgba(255,255,255,.07)';
              api.sfx(row.s === 'drum' ? 'drum' : row.s);
            };
            grid.appendChild(c);
          }
        });
        box.appendChild(grid);

        const row = el('div', 'row'); row.style.marginTop = '16px';
        const listen = el('button', 'btn ghost', '🔊 השמע את הקצב');
        listen.onclick = () => {
          for (let s = 0; s < STEPS; s++) {
            api.after(s * 260, () => {
              ROWS.forEach((rr, r) => { if (target[r][s]) { api.sfx(rr.s); } });
            });
          }
        };
        const check = el('button', 'btn', 'בדוק ✔');
        check.onclick = () => {
          let hit = 0, total = 0;
          ROWS.forEach((_, r) => { for (let s = 0; s < STEPS; s++) { total++; if (user[r][s] === target[r][s]) hit++; } });
          const pct = hit / total;
          const pts = Math.round(pct * 40);
          score += pts; api.setScore(score);
          api.sfx(pct > .8 ? 'great' : 'good');
          box.innerHTML = '';
          const fb = el('div', 'result');
          fb.innerHTML = `<div class="medal">${pct > .85 ? '🏆' : pct > .6 ? '🥈' : '💪'}</div>
            <h3>${Math.round(pct * 100)}% דיוק</h3><div class="sub">+${pts} נקודות</div>
            <div class="res-actions"><button class="btn wide" id="nx">${round < 3 ? 'לסבב הבא ←' : 'לתוצאות ←'}</button></div>`;
          box.appendChild(fb);
          $('#nx', fb).onclick = () => newRound();
        };
        row.appendChild(listen); row.appendChild(check);
        box.appendChild(row);
        box.appendChild(el('p', 'g-note', 'טיפ: הקשיבו פעמיים לפני שמסמנים'));
      }
      newRound();
    }
  });
})();
