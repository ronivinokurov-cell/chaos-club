/* ===== מהירות ואתגרים ===== */
(function () {

  /* 1. זמן תגובה */
  registerGame({
    id: 'speed.reaction', cat: 'speed', name: 'זמן תגובה', emoji: '⏱️', diff: 1, gold: 200, silver: 120,
    desc: 'חמישה סיבובים: כמה מהר תלחצו כשהמסך מתחלף לירוק?',
    howto: ['לוחצים על הכפתור כדי להתחיל סיבוב.', 'ממתינים — המסך יחליף צבע לירוק.', 'ברגע שהוא ירוק, לוחצים מהר ככל האפשר.', 'לחיצה מוקדמת מדי מבטלת את הסיבוב.'],
    scoring: 'עד 70 נקודות לסיבוב לפי מהירות התגובה',
    mount(stage, api) {
      stage.innerHTML = '';
      api.status('סיבוב 1/5');
      const pad = el('button');
      pad.style.cssText = 'width:100%;min-height:250px;border-radius:20px;font-size:22px;font-weight:900;'
        + 'background:rgba(255,255,255,.06);border:2px solid var(--line);color:var(--txt);transition:.15s';
      pad.textContent = 'לחצו להתחלת סיבוב';
      stage.appendChild(pad);
      const msg = el('p', 'g-note', 'חמישה סיבובים · הממוצע קובע את הניקוד');
      stage.appendChild(msg);

      let trial = 0, score = 0, total = 0, state = 'idle', t0 = 0;
      const startTrial = () => {
        state = 'wait';
        pad.style.background = 'linear-gradient(150deg,#7a1c2c,#3a0d16)';
        pad.textContent = 'המתינו לירוק…';
        api.after(rndInt(900, 3200), () => {
          if (state !== 'wait') return;
          state = 'go';
          t0 = performance.now();
          pad.style.background = 'linear-gradient(150deg,#22d3a5,#0f9d76)';
          pad.textContent = 'לחצו עכשיו!';
          api.sfx('pop');
        });
      };
      pad.onclick = () => {
        if (state === 'idle' || state === 'done') { startTrial(); return; }
        if (state === 'wait') {
          state = 'idle'; pad.style.background = 'rgba(255,255,255,.06)';
          pad.textContent = 'מוקדם מדי! לחצו לניסיון נוסף';
          api.sfx('bad'); msg.textContent = 'הסיבוב בוטל — נסו שוב';
          return;
        }
        if (state === 'go') {
          const ms = Math.round(performance.now() - t0);
          const pts = clamp(Math.round((600 - ms) / 6), 0, 70);
          score += pts; total += ms;
          api.setScore(score);
          api.sfx(ms < 300 ? 'great' : 'good');
          trial++;
          pad.style.background = 'rgba(255,255,255,.06)';
          pad.textContent = `${ms} מ״ש · +${pts}`;
          msg.textContent = `סיבוב ${Math.min(trial + 1, 5)}/5`;
          api.status(`${Math.min(trial, 5)}/5 סיבובים`);
          state = 'idle';
          if (trial >= 5) {
            state = 'done';
            api.after(500, () => api.finish(score, { detail: `ממוצע ${Math.round(total / 5)} מ״ש` }));
          }
        }
      };
      startTrial();
    }
  });

  /* 2. חפרפרת */
  registerGame({
    id: 'speed.mole', cat: 'speed', name: 'חפרפרת', emoji: '🐹', diff: 2, gold: 200, silver: 110,
    desc: 'פגעו בחפרפרות שקופצות מהחורים — 30 שניות.',
    howto: ['חפרפרת מופיעה בחור אקראי.', 'לוחצים עליה לפני שהיא נעלמת.', 'פגיעה = 10 נקודות, החמצה = 5−.', 'יש 30 שניות.'],
    scoring: '10 נקודות לפגיעה · 5− להחמצה',
    mount(stage, api) {
      let score = 0, hits = 0;
      stage.innerHTML = '';
      stage.appendChild(el('p', 'g-title', '🐹 פגעו בחפרפרת'));
      const grid = el('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:330px;margin:0 auto';
      stage.appendChild(grid);
      const holes = [];
      for (let i = 0; i < 9; i++) {
        const h = el('button');
        h.style.cssText = 'aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 50% 30%,rgba(255,255,255,.14),rgba(0,0,0,.35));'
          + 'border:1px solid var(--line);font-size:30px;display:grid;place-items:center;transition:.1s';
        h.onclick = () => {
          if (h.dataset.up === '1') {
            h.dataset.up = '0'; h.textContent = '';
            score += 10; hits++; api.setScore(score); api.sfx('good');
          } else {
            score = Math.max(0, score - 5); api.setScore(score); api.sfx('bad');
            h.classList.add('bad'); api.after(300, () => h.classList.remove('bad'));
          }
        };
        holes.push(h); grid.appendChild(h);
      }
      let active = -1;
      const pop = () => {
        if (active >= 0) { holes[active].dataset.up = '0'; holes[active].textContent = ''; }
        active = rnd(9);
        holes[active].dataset.up = '1';
        holes[active].textContent = '🐹';
        api.sfx('hat');
      };
      pop();
      api.every(900, pop);
      api.setTimer(30, () => api.finish(score, { detail: `${hits} פגיעות ב־30 שניות` }), { onTick: t => api.status(`נותרו ${t}s · ${hits} פגיעות`) });
      api.status('30s · 0 פגיעות');
    }
  });

  /* 3. הקלדה מהירה */
  const WORDS = ['תפוח', 'מחשב', 'שמש', 'כוכב', 'ילדים', 'צבע', 'מוזיקה', 'מסך', 'חופש', 'רעיון', 'מפתח', 'סיפור', 'מים', 'דרך', 'שעון', 'כדור', 'אור', 'מזל', 'חלום', 'ספר'];
  registerGame({
    id: 'speed.typing', cat: 'speed', name: 'הקלדה מהירה', emoji: '⌨️', diff: 2, gold: 120, silver: 70,
    desc: 'הקלידו כמה שיותר מילים נכון ב־40 שניות.',
    howto: ['מוצגת מילה — מקלידים אותה בדיוק ולוחצים Enter.', 'מילה נכונה = 10 נקודות.', 'מילה שגויה לא מזכה בנקודות ועוברים הלאה.', 'יש 40 שניות.'],
    scoring: '10 נקודות למילה נכונה',
    mount(stage, api) {
      let score = 0, correct = 0, current = pick(WORDS);
      stage.innerHTML = '';
      stage.appendChild(el('p', 'g-title', 'הקלידו את המילה ולחצו Enter'));
      const word = el('div', 'g-q', current);
      stage.appendChild(word);
      const input = el('input', 'input');
      input.placeholder = '…';
      input.style.display = 'block'; input.style.margin = '0 auto';
      stage.appendChild(input);
      const fb = el('p', 'g-note', '');
      stage.appendChild(fb);
      api.after(80, () => input.focus());

      const check = () => {
        const v = input.value.trim();
        if (!v) return;
        if (v === current) {
          score += 10; correct++; api.setScore(score); api.sfx('good');
          fb.textContent = 'נכון! ✅';
        } else {
          api.sfx('bad'); fb.textContent = 'שגוי — המילה הייתה ' + current;
        }
        input.value = '';
        current = pick(WORDS);
        word.textContent = current;
      };
      input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
      api.setTimer(40, () => api.finish(score, { detail: `${correct} מילים נכונות ב־40 שניות` }), { onTick: t => api.status(`${t}s · ${correct} מילים`) });
      api.status(`40s · 0 מילים`);
    }
  });

  /* 4. קליק מטורף */
  registerGame({
    id: 'speed.frenzy', cat: 'speed', name: 'קליק מטורף', emoji: '🎯', diff: 2, gold: 200, silver: 120,
    desc: 'המטרה קופצת בכל מקום — תפסו אותה שוב ושוב ב־15 שניות.',
    howto: ['מטרה מהבהבת מופיעה באזור המשחק.', 'לוחצים עליה — היא קופצת למקום אחר.', 'כל פגיעה = 8 נקודות.', 'יש 15 שניות.'],
    scoring: '8 נקודות לפגיעה · 15 שניות',
    mount(stage, api) {
      let score = 0, hits = 0;
      stage.innerHTML = '';
      const field = el('div');
      field.style.cssText = 'position:relative;height:300px;border-radius:18px;overflow:hidden;'
        + 'background:radial-gradient(circle at 50% 40%,rgba(255,255,255,.07),rgba(0,0,0,.25));border:1px solid var(--line)';
      const target = el('button');
      target.style.cssText = 'position:absolute;width:74px;height:74px;border-radius:50%;'
        + 'background:radial-gradient(circle at 35% 30%,var(--c2),var(--c1));box-shadow:0 0 30px -4px var(--c1);'
        + 'display:grid;place-items:center;font-size:26px;transition:transform .1s;color:#08080f';
      target.textContent = '🎯';
      field.appendChild(target);
      stage.appendChild(field);
      stage.appendChild(el('p', 'g-note', 'לחצו על המטרה — היא לא מפסיקה לקפוץ'));

      const move = () => {
        const w = field.clientWidth, h = field.clientHeight;
        target.style.left = rndInt(4, Math.max(6, w - 80)) + 'px';
        target.style.top = rndInt(4, Math.max(6, h - 80)) + 'px';
      };
      api.after(50, move);
      target.onclick = () => {
        hits++; score += 8; api.setScore(score); api.sfx('pop');
        target.style.transform = 'scale(.7)';
        api.after(90, () => target.style.transform = 'scale(1)');
        move();
      };
      api.every(1400, move);
      api.setTimer(15, () => api.finish(score, { detail: `${hits} פגיעות ב־15 שניות` }), { onTick: t => api.status(`${t}s · ${hits} פגיעות`) });
      api.status('15s · 0 פגיעות');
    }
  });

  /* 5. הישרדות */
  registerGame({
    id: 'speed.dodge', cat: 'speed', name: 'הישרדות', emoji: '🛸', diff: 3, gold: 150, silver: 80,
    desc: 'התחמקו מכל מה שנופל — שרדו 30 שניות.',
    howto: ['הזיזו את החללית עם העכבר, האצבע או מקשי החצים.', 'נמנעים מאסטרואידים שנופלים מלמעלה.', 'כל שנייה ששרדתם = 5 נקודות.', 'פגיעה אחת מסיימת את המשחק.'],
    scoring: '5 נקודות לכל שנייה ששרדתם',
    mount(stage, api) {
      stage.innerHTML = '';
      const cv = el('canvas');
      cv.width = 640; cv.height = 380;
      cv.style.cssText = 'width:100%;background:rgba(0,0,0,.35);border-radius:16px;touch-action:none;cursor:none';
      stage.appendChild(cv);
      const ctx = cv.getContext('2d');
      const P = { x: cv.width / 2, y: cv.height - 42, w: 42, h: 18 };
      let rocks = [], alive = true, t0 = performance.now(), last = t0, score = 0, killed = false;

      const movePointer = e => {
        const r = cv.getBoundingClientRect();
        P.x = clamp((e.clientX - r.left) * (cv.width / r.width), P.w / 2, cv.width - P.w / 2);
      };
      cv.addEventListener('pointermove', movePointer);
      cv.addEventListener('pointerdown', movePointer);
      const keyH = e => {
        if (e.key === 'ArrowLeft') P.x = clamp(P.x - 34, P.w / 2, cv.width - P.w / 2);
        if (e.key === 'ArrowRight') P.x = clamp(P.x + 34, P.w / 2, cv.width - P.w / 2);
      };
      window.addEventListener('keydown', keyH);
      api.onCleanup(() => window.removeEventListener('keydown', keyH));

      const loop = now => {
        if (!alive) return;
        const dt = Math.min(48, now - last) / 1000;
        last = now;
        const elapsed = (now - t0) / 1000;
        score = Math.round(elapsed * 5);
        api.setScore(score);
        api.status(`${30 - Math.floor(elapsed)}s · ${Math.floor(elapsed)}s שרדתם`);
        if (!killed && elapsed > 30) {
          alive = false;
          api.sfx('win'); confetti(60);
          api.finish(Math.round(elapsed * 5) + 60, { detail: `שרדתם ${Math.round(elapsed)} שניות · בונוס הישרדות 60` });
          return;
        }
        ctx.clearRect(0, 0, cv.width, cv.height);
        // stars
        ctx.fillStyle = 'rgba(255,255,255,.22)';
        for (let i = 0; i < 26; i++) {
          const sx = (i * 137 + elapsed * 40) % cv.width, sy = (i * 71 + elapsed * 90) % cv.height;
          ctx.fillRect(sx, sy, 2, 2);
        }
        const rate = Math.min(0.55, 0.18 + elapsed * 0.014);
        if (Math.random() < rate) rocks.push({ x: rndInt(20, cv.width - 20), y: -18, r: rndInt(9, 20), v: rndInt(150, 300) });
        rocks.forEach(o => { o.y += o.v * dt; });
        rocks = rocks.filter(o => o.y < cv.height + 30);

        ctx.fillStyle = 'rgba(255,120,80,.92)';
        rocks.forEach(o => {
          ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill();
        });
        // player
        const grad = ctx.createLinearGradient(P.x - 20, 0, P.x + 20, 0);
        grad.addColorStop(0, '#3ad0ff'); grad.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(P.x, P.y - 14);
        ctx.lineTo(P.x + P.w / 2, P.y + P.h / 2);
        ctx.lineTo(P.x - P.w / 2, P.y + P.h / 2);
        ctx.closePath(); ctx.fill();

        const hit = rocks.find(o => o.y + o.r > P.y - 14 && o.y - o.r < P.y + 10 && Math.abs(o.x - P.x) < (P.w / 2 + o.r * .8));
        if (hit) {
          alive = false; killed = true;
          api.sfx('lose'); confetti(0);
          api.finish(Math.round(elapsed * 5), { detail: `שרדתם ${Math.round(elapsed)} שניות` });
          return;
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
      api.status('30s · 0s שרדתם');
    }
  });
})();
