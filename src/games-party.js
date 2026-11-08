/* ===== משחקי חברה ===== */
(function () {

  /* 1. קלפי אתגר */
  const CARDS = [
    'דברו 30 שניות במבטא זר שהחבורה בוחרת',
    'חקו חיה והחבורה צריכה לנחש',
    'שירו את הפזמון של השיר האהוב עליכם',
    'ספרו בדיחה. אם אף אחד לא צוחק — עוד אחת',
    'עשו 10 קפיצות במקום בלי להפסיק לחייך',
    'תארו את היום שלכם בלי מילים, רק בתנועות',
    'חקו את האדם שיושב לימינכם',
    'אמרו 5 מילים שמתחילות באות מ׳',
    'רקדו 15 שניות בלי מוזיקה',
    'דברו רק בחרוזים עד התור הבא',
    'ספרו סיפור קצר שמכיל שישה חיבורים: ו־, אבל, לכן, כי, כאשר, סוף',
    'חקו קול של חיה שהחבורה בוחרת לכם',
    'עשו פרצוף מצחיק והחזיקו 5 שניות',
    'אמרו את האלף־בית מהסוף להתחלה',
    'שירו «יום הולדת שמח» בקול אופראי',
    'תנו מחמאה אמיתית לכל אחד בחדר',
    'ספרו משהו שאף אחד לא יודע עליכם',
    'חקו שדרן ספורט שמתאר מזיגת כוס תה',
    'מצאו 10 חפצים אדומים בחדר ב־30 שניות',
    'דברו דקה שלמה בלי להשתמש באות א׳',
    'הציגו תנועה והחבורה חייבת לחזור עליה',
    'אמרו שלוש מילים באנגלית במבטא ישראלי חזק',
    'חקו רובוט שקונה במכולת',
    'שירו את השם שלכם במנגינה של פרסומת'
  ];
  registerGame({
    id: 'party.cards', cat: 'party', name: 'קלפי אתגר', emoji: '🎴', diff: 1, gold: 120, silver: 60,
    desc: 'מושכים קלף אתגר אקראי ומרימים את החבורה.',
    howto: ['לוחצים על «משוך קלף» ומקבלים אתגר.', 'מבצעים אותו מול החבורה.', 'לאחר שביצעתם — לוחצים «ביצעתי» ומקבלים 15 נקודות.', 'אפשר לדלג על קלף אחד בסבב.'],
    scoring: '15 נקודות לכל אתגר שביצעתם · 8 קלפים',
    mount(stage, api) {
      let i = 0, score = 0, deck = shuffle(CARDS).slice(0, 8);
      stage.innerHTML = '';
      const card = el('div');
      card.style.cssText = 'max-width:460px;margin:6px auto;padding:26px 20px;border-radius:20px;text-align:center;'
        + 'background:linear-gradient(150deg,rgba(255,77,141,.22),rgba(255,138,92,.12));border:1px solid rgba(255,255,255,.14);'
        + 'min-height:190px;display:grid;place-items:center;font-size:19px;font-weight:800;line-height:1.5';
      const actions = el('div', 'row');
      actions.style.marginTop = '18px';
      stage.appendChild(card);
      stage.appendChild(actions);
      const note = el('p', 'g-note', '');
      stage.appendChild(note);

      function draw() {
        if (i >= deck.length) return api.finish(score, { detail: `ביצעתם ${score / 15} אתגרים מתוך ${deck.length}` });
        api.status(`קלף ${i + 1}/${deck.length}`);
        card.textContent = deck[i];
        anim(card, [{ transform: 'scale(.92)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 300, easing: 'ease-out' });
        api.sfx('pop');
        actions.innerHTML = '';
        const done = el('button', 'btn', '✅ ביצעתי (+15)');
        done.onclick = e => { score += 15; api.setScore(score); api.sfx('good'); floatScore('+15', e.clientX, e.clientY); i++; draw(); };
        const skip = el('button', 'btn ghost', '⏭️ דלג על הקלף');
        skip.onclick = () => { api.sfx('tap'); i++; draw(); };
        actions.appendChild(done); actions.appendChild(skip);
        note.textContent = i === 0 ? 'טיפ: אפשר לשחק בתורות — כל שחקן מושך קלף' : '';
      }
      draw();
    }
  });

  /* 2. קטגוריה בזמן */
  registerGame({
    id: 'party.categories', cat: 'party', name: 'קטגוריה בזמן', emoji: '🗂️', diff: 2, gold: 120, silver: 70,
    desc: 'כתבו כמה שיותר מילים שמתאימות לקטגוריה — ב־45 שניות.',
    howto: ['מוצגת קטגוריה, למשל «פירות».', 'מקלידים מילה ומאשרים במקלדת או בכפתור.', 'מילה נכונה = 10 נקודות. מילה כפולה לא נספרת.', 'יש 45 שניות.'],
    scoring: '10 נקודות למילה ייחודית · 45 שניות',
    mount(stage, api) {
      const cats = ['פירות', 'מדינות', 'בעלי חיים', 'מקצועות', 'ערים בישראל', 'סרטים', 'שמות של בנים', 'מאכלים', 'ענפי ספורט', 'צבעים', 'כלי רכב', 'מילים באנגלית'];
      const catName = pick(cats);
      const words = [];
      let score = 0;
      stage.innerHTML = '';
      stage.appendChild(el('p', 'g-title', 'הקטגוריה שלכם'));
      stage.appendChild(el('div', 'g-q', catName));
      const input = el('input', 'input');
      input.placeholder = 'כתבו מילה ולחצו Enter…';
      input.style.display = 'block';
      input.style.margin = '0 auto';
      stage.appendChild(input);
      const chips = el('div', 'chips');
      stage.appendChild(chips);
      const bonusWord = el('p', 'g-note', '');
      stage.appendChild(bonusWord);

      function submit() {
        const w = input.value.trim().replace(/\s+/g, ' ');
        if (w.length < 2) { toast('מילה קצרה מדי'); return; }
        if (words.some(x => x === w)) {
          const c = el('div', 'chip dup', w + ' ✕');
          chips.appendChild(c);
          api.sfx('bad');
          toast('כבר כתבתם את זה');
          input.value = '';
          return;
        }
        words.push(w);
        chips.appendChild(el('div', 'chip', w));
        chips.scrollTop = chips.scrollHeight;
        score += 10; api.setScore(score); api.sfx('good');
        api.status(`${words.length} מילים`);
        input.value = '';
      }
      input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); else api.sfx('tap'); });
      const btn = el('button', 'btn wide', 'הוסף מילה ✔');
      btn.style.marginTop = '14px';
      btn.onclick = submit;
      stage.appendChild(btn);
      api.after(60, () => input.focus());

      api.setTimer(45, () => {
        api.finish(score + (words.length >= 10 ? 40 : 0), { detail: `${words.length} מילים בקטגוריית «${catName}»` });
      }, { onTick: t => { if (t <= 10) api.status(`${words.length} מילים · ${t}s`); } });
      api.status(`${words.length} מילים`);
    }
  });

  /* 3. נחש מי */
  const WHO = [
    { clues: ['פיזיקאי גאון עם שיער פרוע', 'פיתח את תורת היחסות', 'זכה בנובל לפיזיקה ב־1921'], a: 'אלברט איינשטיין', o: ['ניקולה טסלה', 'אייזק ניוטון', 'גלילאו גליליי'] },
    { clues: ['מלכה במצרים העתיקה', 'ידועה בקשרה עם יוליוס קיסר ומרקוס אנטוניוס', 'המיתוס סביבה עורר השראה בשייקספיר'], a: 'קלאופטרה', o: ['נפרטיטי', 'חתשפסות', 'איזבל הראשונה'] },
    { clues: ['אמן וממציא מתקופת הרנסאנס', 'צייר את המונה ליזה', 'שרטט מכונות מעופפות במחברותיו'], a: 'לאונרדו דה וינצ׳י', o: ['מיכלאנג׳לו', 'רפאל', 'דונטלו'] },
    { clues: ['מלחין אוסטרי שניגן מגיל 5', 'כתב את חליל הקסם', 'מת בגיל 35'], a: 'וולפגנג אמדאוס מוצרט', o: ['בטהובן', 'באך', 'שופן'] },
    { clues: ['אסטרונאוט אמריקאי', 'מפקד אפולו 11', 'האדם הראשון שדרך על הירח'], a: 'ניל ארמסטרונג', o: ['באז אולדרין', 'יורי גגארין', 'ג׳ון גלן'] },
    { clues: ['קוסם צעיר עם צלקת במצח', 'לומד בהוגוורטס', 'החבר הכי טוב שלו רון ויזלי'], a: 'הארי פוטר', o: ['פרדו באגינס', 'לוק סקייווקר', 'פרסי ג׳קסון'] },
    { clues: ['גיבור עם גלימה אדומה', 'בא מכוכב קריפטון', 'עובד כעיתונאי בשם קלארק קנט'], a: 'סופרמן', o: ['באטמן', 'ספיידרמן', 'איירון מן'] },
    { clues: ['בלש בדיוני שחי בלונדון', 'כתובתו רחוב בייקר 221B', 'שותפו הוא דוקטור ווטסון'], a: 'שרלוק הולמס', o: ['הרקול פוארו', 'פיליפ מרלו', 'מיס מארפל'] },
    { clues: ['צייר ספרדי', 'אחד ממייסדי הקוביזם', 'צייר את גרניקה'], a: 'פבלו פיקאסו', o: ['סלבדור דאלי', 'וינסנט ואן גוך', 'קלוד מונה'] },
    { clues: ['מדענית ילידת פולין', 'חקרה קרינה רדיואקטיבית', 'הראשונה לזכות בשני פרסי נובל'], a: 'מארי קירי', o: ['רוזלינד פרנקלין', 'אדה לאבלייס', 'ליזה מייטנר'] }
  ];
  registerGame({
    id: 'party.whoami', cat: 'party', name: 'נחש מי אני', emoji: '🕵️', diff: 2, gold: 100, silver: 60,
    desc: 'שלושה רמזים, ארבע אפשרויות — מי הדמות?',
    howto: ['מוצגים שלושה רמזים על דמות מפורסמת.', 'בוחרים את התשובה הנכונה מתוך ארבע.', 'תשובה נכונה = 15 נקודות.', 'סך הכול 8 סבבים.'],
    scoring: '15 נקודות לדמות נכונה',
    mount(stage, api) {
      const deck = shuffle(WHO).slice(0, 8);
      runQuiz(api, {
        count: deck.length,
        make(i) {
          const d = deck[i];
          const options = shuffle([d.a].concat(d.o));
          return {
            sub: 'מי אני? 🔍',
            q: d.clues.map((c, k) => `<span style="display:block;font-weight:700;font-size:${k === 0 ? 22 : 15}px;margin:${k ? '6px' : '0'} 0">${k === 0 ? '•' : '•'} ${c}</span>`).join(''),
            options, answer: options.indexOf(d.a), pts: 15
          };
        }
      });
    }
  });

  /* 4. כמה זה? */
  registerGame({
    id: 'party.estimate', cat: 'party', name: 'כמה זה?', emoji: '📏', diff: 2, gold: 140, silver: 80,
    desc: 'הערכות מספרים: מי הכי קרוב למספר האמיתי?',
    howto: ['מוצגת שאלה עם תשובה מספרית.', 'מקלידים את ההערכה שלכם ולוחצים «נחש».', 'ככל שההערכה קרובה יותר — הניקוד גבוה יותר (עד 25).', '6 שאלות בסבב.'],
    scoring: 'עד 25 נקודות לשאלה, לפי מידת הקרבה',
    mount(stage, api) {
      const QS = shuffle([
        { q: 'כמה עצמות יש בגוף אדם מבוגר?', a: 206 },
        { q: 'כמה קלידים יש בפסנתר רגיל?', a: 88 },
        { q: 'כמה מדינות חברות באו״ם?', a: 193 },
        { q: 'כמה שיניים יש לאדם מבוגר (כולל שיני בינה)?', a: 32 },
        { q: 'כמה מיתרים יש בגיטרה קלאסית?', a: 6 },
        { q: 'כמה ימים יש בשנה מעוברת?', a: 366 },
        { q: 'כמה שחקנים מקבוצה אחת נמצאים על מגרש כדורסל?', a: 5 },
        { q: 'בכמה מטרים מעל פני הים נמצא פסגת האוורסט (בקירוב)?', a: 8849 },
        { q: 'כמה דקות יש במשחק כדורגל רגיל?', a: 90 },
        { q: 'כמה שחקנים יש בקבוצת כדורעף על המגרש?', a: 6 }
      ]).slice(0, 6);
      let i = 0, score = 0, sumErr = 0;
      stage.innerHTML = '';
      const box = el('div');
      stage.appendChild(box);

      function round() {
        if (i >= QS.length) return api.finish(score, { detail: `${i} הערכות · סטייה כוללת ${Math.round(sumErr)}` });
        api.status(`שאלה ${i + 1}/${QS.length}`);
        const item = QS[i];
        box.innerHTML = '';
        box.appendChild(el('p', 'g-title', 'הערכה מספרית'));
        box.appendChild(el('div', 'g-q', item.q));
        const input = el('input', 'input');
        input.type = 'number'; input.inputMode = 'numeric'; input.placeholder = 'המספר שלכם…';
        input.style.display = 'block'; input.style.margin = '0 auto';
        box.appendChild(input);
        const row = el('div', 'row'); row.style.marginTop = '14px';
        const go = el('button', 'btn', 'נחש 🎯');
        row.appendChild(go); box.appendChild(row);
        const fb = el('p', 'g-note', ''); box.appendChild(fb);
        api.after(80, () => input.focus());

        function submit() {
          const v = parseFloat(input.value);
          if (isNaN(v)) { toast('כתבו מספר'); return; }
          const err = Math.abs(v - item.a);
          sumErr += err;
          const pts = Math.max(0, Math.round(25 * (1 - err / Math.max(item.a, 1))));
          score += pts; api.setScore(score);
          api.sfx(pts >= 20 ? 'great' : pts > 0 ? 'good' : 'bad');
          fb.innerHTML = `התשובה הנכונה: <b>${fmt(item.a)}</b> · סטייה ${fmt(err)} · <b>+${pts}</b>`;
          input.disabled = true; go.disabled = true;
          i++;
          api.after(1400, round);
        }
        go.onclick = submit;
        input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
      }
      round();
    }
  });

  /* 5. גלגל החבורה */
  registerGame({
    id: 'party.wheel', cat: 'party', name: 'גלגל החבורה', emoji: '🎡', diff: 1, gold: 80, silver: 40,
    desc: 'מזינים שמות, מסובבים את הגלגל ומי שנבחר מקבל משימה.',
    howto: ['כתבו את שמות השחקנים (מופרדים בפסיק).', 'לוחצים על «סובב» והגלגל בוחר שחקן.', 'השחקן שנבחר מקבל משימה אקראית.', '8 סיבובים ואז מסיימים.'],
    scoring: '10 נקודות לכל סיבוב שהושלם',
    mount(stage, api) {
      stage.innerHTML = '';
      const setup = el('div');
      setup.style.cssText = 'max-width:460px;margin:0 auto;text-align:center';
      setup.innerHTML = `<p class="g-title">מי משחק?</p>`;
      const inp = el('input', 'input');
      inp.value = 'דנה, יוסי, נועה, אבי';
      inp.style.display = 'block'; inp.style.margin = '0 auto';
      setup.appendChild(inp);
      const go = el('button', 'btn wide', 'לתחילת המשחק ←');
      go.style.marginTop = '16px';
      setup.appendChild(go);
      setup.appendChild(el('p', 'g-note', 'אפשר 2 עד 8 שמות, מופרדים בפסיק'));
      stage.appendChild(setup);

      const TASKS = ['ספרו בדיחה', 'חקו חיה שהחבורה בוחרת', 'שירו פזמון', 'עשו 10 קפיצות', 'תנו מחמאה למי שמשמאל', 'דברו במבטא זר 20 שניות', 'ספרו משהו שלא ידעו עליכם', 'רקדו 15 שניות'];

      go.onclick = () => {
        const names = inp.value.split(',').map(s => s.trim()).filter(Boolean).slice(0, 8);
        if (names.length < 2) { toast('צריך לפחות שני שמות'); return; }
        Sound.play('pop');
        stage.innerHTML = '';

        const wrapEl = el('div');
        wrapEl.style.cssText = 'display:grid;place-items:center;gap:10px';
        const pointer = el('div', 'wheel-pointer', '▼');
        const cv = el('canvas');
        cv.id = 'wheel';
        cv.width = 320; cv.height = 320;
        cv.style.width = 'min(320px, 78vw)'; cv.style.height = 'auto';
        wrapEl.appendChild(pointer); wrapEl.appendChild(cv);
        stage.appendChild(wrapEl);

        const res = el('div');
        res.style.cssText = 'text-align:center;margin-top:16px;min-height:64px';
        stage.appendChild(res);
        const spinBtn = el('button', 'btn wide', '🎡 סובב את הגלגל');
        spinBtn.style.maxWidth = '320px';
        spinBtn.style.margin = '14px auto 0';
        stage.appendChild(spinBtn);

        const ctx = cv.getContext('2d');
        const n = names.length, step = (Math.PI * 2) / n;
        const palette = ['#8b5cf6', '#ff4d8d', '#ffb020', '#22d3a5', '#3ad0ff', '#ff6b3d', '#ffd166', '#7de2ff'];
        let rot = 0, spinning = false, spins = 0, score = 0;

        function draw() {
          const R = 160, cx = 160, cy = 160;
          ctx.clearRect(0, 0, 320, 320);
          for (let i = 0; i < n; i++) {
            const a0 = rot + i * step - Math.PI / 2, a1 = a0 + step;
            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, R - 6, a0, a1); ctx.closePath();
            ctx.fillStyle = palette[i % palette.length];
            ctx.globalAlpha = .92; ctx.fill(); ctx.globalAlpha = 1;
            ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2; ctx.stroke();
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(a0 + step / 2);
            ctx.textAlign = 'right'; ctx.fillStyle = '#0b0b14';
            ctx.font = 'bold 15px Heebo, system-ui, sans-serif';
            ctx.fillText(names[i], R - 26, 6);
            ctx.restore();
          }
          ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2);
          ctx.fillStyle = '#12121f'; ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 20px system-ui';
          ctx.fillText('🎯', cx, cy + 7);
        }
        draw();
        api.status('סיבוב 0/8');

        spinBtn.onclick = () => {
          if (spinning) return;
          if (spins >= 8) return;
          spinning = true; spinBtn.disabled = true;
          api.sfx('whoosh');
          res.innerHTML = '';
          const winner = rnd(n);
          const target = (Math.PI * 2 * 4) + (Math.PI * 2 - (winner * step + step / 2));
          const from = rot, to = rot + target, t0 = performance.now(), dur = 3800;
          (function anim(t) {
            const k = clamp((t - t0) / dur, 0, 1);
            const e = 1 - Math.pow(1 - k, 3.2);
            rot = from + (to - from) * e;
            draw();
            if (k < 1) requestAnimationFrame(anim);
            else {
              spinning = false; spinBtn.disabled = false;
              spins++; score += 10; api.setScore(score);
              api.sfx('great');
              api.status(`סיבוב ${spins}/8`);
              const task = pick(TASKS);
              res.innerHTML = `<div style="font-size:13px;color:var(--dim)">הגלגל בחר</div>
                <div style="font-size:26px;font-weight:900;margin:2px 0 6px">${names[winner]}</div>
                <div style="font-weight:800">📋 ${task}</div>`;
              confetti(24);
              if (spins >= 8) {
                spinBtn.textContent = '✅ סיום וצפייה בתוצאות';
                spinBtn.onclick = () => api.finish(score, { detail: '8 סיבובים הושלמו' });
              }
            }
          })(performance.now());
        };
      };
    }
  });

})();
