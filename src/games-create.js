/* ===== יצירתיות ===== */
(function () {

  /* 1. סטודיו ציור */
  const PROMPTS = ['ציירו חלל עם כוכב לכת אחד לפחות', 'ציירו חיה שיצרתם מהדמיון', 'ציירו את החדר האהוב עליכם', 'ציירו עיר עתידנית', 'ציירו פורטרט עצמי מופשט', 'ציירו אי בודד עם עץ דקל'];
  registerGame({
    id: 'create.draw', cat: 'create', name: 'סטודיו ציור', emoji: '🖌️', diff: 1, gold: 120, silver: 60,
    desc: 'קנבס חופשי עם משימה אקראית וכלי ציור מלאים.',
    howto: ['מקבלים משימה אקראית.', 'בוחרים צבע ועובי ומציירים עם האצבע או העכבר.', 'יש מחק, ביטול אחרון וניקוי הכל.', 'לוחצים «סיימתי» — הניקוד מחושב לפי מה שציירתם.'],
    scoring: 'עד 120 נקודות: שימוש ב־3 צבעים, 30+ משיחות ופינות מלאות',
    mount(stage, api) {
      const prompt = pick(PROMPTS);
      stage.innerHTML = '';
      stage.appendChild(el('p', 'g-title', '🎯 המשימה: ' + prompt));
      const cv = el('canvas');
      cv.width = 620; cv.height = 380;
      cv.style.cssText = 'width:100%;background:#fff;cursor:crosshair';
      stage.appendChild(cv);
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      let color = '#ff4d8d', size = 8, drawing = false, strokes = 0, colorsUsed = new Set();
      const history = [];
      const PALETTE = ['#111827', '#ff4d8d', '#8b5cf6', '#3ad0ff', '#22d3a5', '#ffb020', '#ff6b3d', '#ffffff'];

      const tools = el('div', 'row');
      tools.style.margin = '12px 0';
      PALETTE.forEach(c => {
        const b = el('button');
        b.style.cssText = `width:32px;height:32px;border-radius:10px;background:${c};border:2px solid rgba(255,255,255,.35)`;
        b.onclick = () => { color = c; api.sfx('tap'); Array.from(tools.querySelectorAll('button[data-c]')).forEach(x => x.style.outline = 'none'); b.style.outline = '2.5px solid #fff'; b.style.outlineOffset = '2px'; };
        b.dataset.c = '1';
        tools.appendChild(b);
      });
      stage.appendChild(tools);

      const sizes = el('div', 'row');
      sizes.style.marginBottom = '10px';
      [[4, 'דק'], [9, 'בינוני'], [18, 'עבה']].forEach(([v, l]) => {
        const b = el('button', 'btn ghost', l);
        b.style.padding = '7px 14px'; b.style.fontSize = '12.5px';
        b.onclick = () => { size = v; api.sfx('tap'); };
        sizes.appendChild(b);
      });
      const undo = el('button', 'btn ghost', '↩︎ בטל');
      undo.style.cssText = 'padding:7px 14px;font-size:12.5px';
      undo.onclick = () => {
        if (!history.length) return;
        ctx.putImageData(history.pop(), 0, 0);
        api.sfx('tap');
      };
      const clr = el('button', 'btn ghost', '🧽 נקה');
      clr.style.cssText = 'padding:7px 14px;font-size:12.5px';
      clr.onclick = () => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); api.sfx('tap'); };
      sizes.appendChild(undo); sizes.appendChild(clr);
      stage.appendChild(sizes);

      const paint = e => {
        const r = cv.getBoundingClientRect();
        const x = (e.clientX - r.left) * (cv.width / r.width);
        const y = (e.clientY - r.top) * (cv.height / r.height);
        ctx.strokeStyle = color; ctx.lineWidth = size;
        ctx.lineTo(x, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y);
      };
      cv.addEventListener('pointerdown', e => {
        drawing = true; strokes++;
        colorsUsed.add(color);
        if (history.length > 8) history.shift();
        history.push(ctx.getImageData(0, 0, cv.width, cv.height));
        const r = cv.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo((e.clientX - r.left) * (cv.width / r.width), (e.clientY - r.top) * (cv.height / r.height));
        cv.setPointerCapture(e.pointerId);
      });
      cv.addEventListener('pointermove', e => { if (drawing) paint(e); });
      cv.addEventListener('pointerup', () => { drawing = false; ctx.beginPath(); });
      cv.addEventListener('pointerleave', () => { drawing = false; });

      const done = el('button', 'btn wide', '✅ סיימתי');
      done.style.marginTop = '14px';
      done.onclick = () => {
        let pts = clamp(colorsUsed.size * 20, 0, 60) + clamp(strokes * 2, 0, 60);
        api.sfx('great'); confetti(30);
        api.finish(pts, { detail: `${strokes} משיכות מכחול · ${colorsUsed.size} צבעים` });
      };
      stage.appendChild(done);
      api.status('צבעו בחופשיות');
    }
  });

  /* 2. מכונת סיפורים */
  registerGame({
    id: 'create.story', cat: 'create', name: 'מכונת סיפורים', emoji: '📖', diff: 1, gold: 90, silver: 45,
    desc: 'מגרילים גיבורים ומקום, וכותבים סיפור משלכם.',
    howto: ['לוחצים «הגרל סיפור» ומקבלים גיבור, מקום וטוויסט.', 'כותבים סיפור קצר שמשלב את שלושת האלמנטים.', 'לוחצים «סיימתי» לקבלת ניקוד.', 'כל 10 מילים = 10 נקודות, ועוד בונוס על שילוב האלמנטים.'],
    scoring: 'עד 100 נקודות לפי אורך הסיפור והאלמנטים',
    mount(stage, api) {
      const HERO = ['ספרית חלומות נודדת', 'רובוט שלומד לצחוק', 'חתול שמבין בשפות עתיקות', 'מדריך טיולים אבוד', 'ילדה שאוספת צלילים', 'שף שמבשל זיכרונות'];
      const PLACE = ['בשוק תל אביב בלילה', 'על כוכב לכת שעשוי מזכוכית', 'בספרייה שנפתחת רק בחצות', 'במדבר שבו יורד שלג', 'בתחנת רכבת נטושה', 'באי שצף בין עננים'];
      const TWIST = ['ופתאום כל הצבעים התחלפו', 'ומכתב מסתורי הגיע בדואר', 'והזמן התחיל ללכת אחורה', 'ונפתחה דלת שלא הייתה קודם', 'ומישהו קרא בשמה שלוש פעמים', 'והשמש זרחה בפעם השנייה באותו יום'];

      stage.innerHTML = '';
      const slots = el('div');
      slots.style.cssText = 'display:grid;gap:9px;max-width:560px;margin:0 auto 14px';
      const s1 = el('div', 'pill', 'גיבור'), s2 = el('div', 'pill', 'מקום'), s3 = el('div', 'pill', 'טוויסט');
      [s1, s2, s3].forEach(s => { s.style.cssText = 'justify-content:center;padding:14px;font-size:14px;text-align:center;display:block'; slots.appendChild(s); });
      stage.appendChild(slots);
      const roll = el('button', 'btn wide', '🎲 הגרל סיפור');
      roll.style.maxWidth = '560px'; roll.style.margin = '0 auto'; roll.style.display = 'flex';
      stage.appendChild(roll);

      const ta = el('textarea', 'input');
      ta.placeholder = 'כאן כותבים את הסיפור… (3–5 משפטים)';
      ta.style.cssText = 'display:block;max-width:560px;width:100%;margin:16px auto 0;height:130px;text-align:right;padding:14px;resize:vertical;border-radius:15px';
      stage.appendChild(ta);
      const counter = el('p', 'g-note', '0 מילים');
      stage.appendChild(counter);

      let cur = {};
      roll.onclick = () => {
        cur = { h: pick(HERO), p: pick(PLACE), t: pick(TWIST) };
        s1.textContent = '🦸 ' + cur.h;
        s2.textContent = '📍 ' + cur.p;
        s3.textContent = '🌀 ' + cur.t;
        api.sfx('pop');
        anim(slots, [{ transform: 'scale(.96)' }, { transform: 'scale(1)' }], { duration: 220 });
      };

      const finish = el('button', 'btn wide', '✅ סיימתי');
      finish.style.maxWidth = '560px'; finish.style.margin = '14px auto 0';
      stage.appendChild(finish);

      ta.addEventListener('input', () => {
        const words = ta.value.trim().split(/\s+/).filter(Boolean).length;
        counter.textContent = words + ' מילים';
        api.setScore(Math.min(80, words * 2));
      });

      finish.onclick = () => {
        const text = ta.value.trim();
        const words = text.split(/\s+/).filter(Boolean).length;
        if (words < 10) { toast('צריך לפחות 10 מילים'); return; }
        let pts = Math.min(80, words * 2);
        if (cur.h && text.includes(cur.h.split(' ')[0])) pts += 10;
        if (cur.t && text.includes(cur.t.split(' ')[1] || '')) pts += 10;
        confetti(30); api.sfx('great');
        api.finish(pts, { detail: `${words} מילים · סיפור משלכם` });
      };
      api.status('סיפור קצר, דמיון גדול');
    }
  });

  /* 3. מנדלה מראה */
  registerGame({
    id: 'create.mandala', cat: 'create', name: 'מנדלה מראה', emoji: '🪷', diff: 2, gold: 100, silver: 50,
    desc: 'צובעים רבע אחד והמנדלה נבנית סימטרית לבד.',
    howto: ['בוחרים צבע מהפלטה.', 'לוחצים על משבצות ברבע העליון־ימני.', 'הצביעה מועתקת אוטומטית לכל ארבעת הרבעים.', 'צובעים 12 משבצות לפחות ומסיימים.'],
    scoring: 'עד 100 נקודות לפי מספר המשבצות והגיוון',
    mount(stage, api) {
      const N = 5, COLORS = ['#8b5cf6', '#ff4d8d', '#ffb020', '#22d3a5', '#3ad0ff', '#ff6b3d'];
      let color = COLORS[0], painted = 0; const used = new Set();
      stage.innerHTML = '';
      stage.appendChild(el('p', 'g-title', 'בחרו צבע וצבעו את הרבע — הסימטריה תעשה את השאר'));
      const pal = el('div', 'row'); pal.style.marginBottom = '14px';
      COLORS.forEach((c, i) => {
        const b = el('button');
        b.style.cssText = `width:34px;height:34px;border-radius:11px;background:${c};border:2px solid ${i === 0 ? '#fff' : 'transparent'}`;
        b.onclick = () => { color = c; Array.from(pal.children).forEach(x => x.style.border = '2px solid transparent'); b.style.border = '2px solid #fff'; api.sfx('tap'); };
        pal.appendChild(b);
      });
      stage.appendChild(pal);

      const grid = el('div');
      grid.style.cssText = `display:grid;grid-template-columns:repeat(${N * 2},1fr);gap:4px;max-width:330px;margin:0 auto`;
      const cells = {};
      for (let r = 0; r < N * 2; r++) {
        for (let c = 0; c < N * 2; c++) {
          const b = el('button');
          b.style.cssText = 'aspect-ratio:1;border-radius:6px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.06);transition:.15s';
          const mirror = (rr, cc) => `${Math.min(rr, N * 2 - 1 - rr)}-${Math.min(cc, N * 2 - 1 - cc)}`;
          b.dataset.k = mirror(r, c);
          b.onclick = () => {
            const k = b.dataset.k;
            const group = Object.values(cells).filter(x => x.dataset.k === k);
            const already = group[0].dataset.colored === '1';
            group.forEach(x => {
              x.style.background = already ? 'rgba(255,255,255,.06)' : color;
              x.dataset.colored = already ? '0' : '1';
            });
            if (!already) { painted++; used.add(color); } else { painted--; }
            api.setScore(Math.min(100, painted * 6 + used.size * 8));
            api.sfx('pop');
            api.status(`${painted} משבצות · ${used.size} צבעים`);
          };
          cells[r + '-' + c] = b;
          grid.appendChild(b);
        }
      }
      stage.appendChild(grid);
      const done = el('button', 'btn wide', '✅ סיימתי');
      done.style.cssText = 'max-width:330px;margin:16px auto 0;display:flex';
      done.onclick = () => {
        if (painted < 4) { toast('צבעו קצת יותר קודם'); return; }
        confetti(40); api.sfx('great');
        api.finish(Math.min(100, painted * 6 + used.size * 8), { detail: `${painted} משבצות · ${used.size} צבעים` });
      };
      stage.appendChild(done);
      api.status('0 משבצות');
    }
  });

  /* 4. העתק את הפיקסל */
  registerGame({
    id: 'create.pixel', cat: 'create', name: 'העתק את הפיקסל', emoji: '🟦', diff: 2, gold: 110, silver: 60,
    desc: 'מציירים מחדש תבנית פיקסלים לפי הדוגמה.',
    howto: ['משמאל (או למעלה) מופיעה הדוגמה.', 'צבעו את הגריד הריק כדי לחזור עליה בדיוק.', 'לוחצים «בדוק» לקבלת אחוז הדיוק.', 'שלושה סבבים.'],
    scoring: 'עד 40 נקודות לסבב לפי אחוז הדיוק',
    mount(stage, api) {
      const N = 8, COLORS = ['#ff4d8d', '#8b5cf6', '#22d3a5', '#ffb020'];
      let round = 0, score = 0;
      stage.innerHTML = '';
      const box = el('div');
      stage.appendChild(box);

      function build() {
        if (round >= 3) return api.finish(score, { detail: 'שלושה פיקסלים שוחזרו' });
        round++;
        api.status(`סבב ${round}/3`);
        const target = Array.from({ length: N * N }, () => rnd(10) < 3 ? rndInt(1, COLORS.length) : 0);
        const user = target.map(() => 0);
        let color = 1;
        box.innerHTML = '';
        box.appendChild(el('p', 'g-title', 'הדוגמה למעלה — שחזרו אותה למטה'));

        const wrapEl = el('div');
        wrapEl.style.cssText = 'display:flex;gap:16px;justify-content:center;flex-wrap:wrap;align-items:flex-start';

        const mkGrid = (arr, small, onPaint) => {
          const g = el('div');
          g.style.cssText = `display:grid;grid-template-columns:repeat(${N},1fr);gap:2px;width:${small ? 150 : 220}px`;
          arr.forEach((v, i) => {
            const c = el('button');
            c.style.cssText = `aspect-ratio:1;border-radius:3px;background:${v ? COLORS[v - 1] : 'rgba(255,255,255,.08)'}`;
            if (onPaint) c.onclick = () => { user[i] = user[i] === color ? 0 : color; c.style.background = user[i] ? COLORS[user[i] - 1] : 'rgba(255,255,255,.08)'; onPaint(); };
            g.appendChild(c);
          });
          return g;
        };

        wrapEl.appendChild(mkGrid(target, true));
        const mine = mkGrid(user, false, () => api.sfx('pop'));
        wrapEl.appendChild(mine);
        box.appendChild(wrapEl);

        const pal = el('div', 'row'); pal.style.marginTop = '14px';
        COLORS.forEach((c, i) => {
          const b = el('button');
          b.style.cssText = `width:34px;height:34px;border-radius:11px;background:${c};border:2px solid ${i === 0 ? '#fff' : 'transparent'}`;
          b.onclick = () => { color = i + 1; Array.from(pal.children).forEach(x => x.style.border = '2px solid transparent'); b.style.border = '2px solid #fff'; api.sfx('tap'); };
          pal.appendChild(b);
        });
        const erase = el('button', 'btn ghost', '🧽 מחק');
        erase.style.padding = '7px 14px'; erase.style.fontSize = '12.5px';
        erase.onclick = () => { color = 0; api.sfx('tap'); };
        pal.appendChild(erase);
        box.appendChild(pal);

        const check = el('button', 'btn wide', 'בדוק ✔');
        check.style.marginTop = '14px';
        check.onclick = () => {
          let hit = 0;
          target.forEach((v, i) => { if (v === user[i]) hit++; });
          const pct = hit / (N * N), pts = Math.round(pct * 40);
          score += pts; api.setScore(score);
          api.sfx(pct > .8 ? 'great' : 'good');
          box.innerHTML = '';
          const fb = el('div', 'result');
          fb.innerHTML = `<div class="medal">${pct > .85 ? '🏆' : pct > .6 ? '🥈' : '💪'}</div>
            <h3>${Math.round(pct * 100)}% התאמה</h3><div class="sub">+${pts} נקודות</div>
            <div class="res-actions"><button class="btn wide" id="nx">${round < 3 ? 'לסבב הבא ←' : 'לתוצאות ←'}</button></div>`;
          box.appendChild(fb);
          $('#nx', fb).onclick = build;
        };
        box.appendChild(check);
      }
      build();
    }
  });

  /* 5. מעצב דגלים */
  registerGame({
    id: 'create.flag', cat: 'create', name: 'מעצב דגלים', emoji: '🏳️', diff: 2, gold: 100, silver: 55,
    desc: 'מקבלים בריף עיצוב ומעצבים דגל שמקיים את החוקים.',
    howto: ['מקבלים שם למדינה דמיונית ושלושה חוקים.', 'צובעים את הגריד בעזרת הפלטה.', 'לוחצים «בדוק את הדגל» — כל חוק שמתקיים מזכה בנקודות.', 'צריכים לפחות שני צבעים ולפחות 8 משבצות צבועות.'],
    scoring: 'עד 100 נקודות לפי עמידה בחוקי הבריף',
    mount(stage, api) {
      const N = 8;
      const NAMES = ['רפובליקת נובה', 'מדינת זוהר', 'איי קלמנטינה', 'קונפדרציית לבה', 'ממלכת ענבר'];
      const RULES = [
        { t: 'חייב להכיל בדיוק 3 צבעים', test: u => new Set(u.filter(Boolean)).size === 3 },
        { t: 'לפחות שליש מהדגל צבוע', test: u => u.filter(Boolean).length >= Math.ceil(N * N / 3) },
        { t: 'הצבע הכחול מופיע לפחות ב־5 משבצות', test: u => u.filter(x => x === '#3ad0ff').length >= 5 },
        { t: 'הצבע האדום מופיע לפחות ב־5 משבצות', test: u => u.filter(x => x === '#ff4d8d').length >= 5 },
        { t: 'הדגל סימטרי אופקית', test: u => { for (let r = 0; r < N; r++) for (let c = 0; c < N / 2; c++) if (u[r * N + c] !== u[r * N + (N - 1 - c)]) return false; return true; } },
        { t: 'לפחות שני צבעים שונים', test: u => new Set(u.filter(Boolean)).size >= 2 }
      ];
      const COLORS = ['#ff4d8d', '#3ad0ff', '#ffd166', '#22d3a5', '#8b5cf6', '#ffffff'];
      const name = pick(NAMES);
      const rules = shuffle(RULES).slice(0, 3);
      let color = COLORS[0];
      const u = Array.from({ length: N * N }, () => null);

      stage.innerHTML = '';
      stage.appendChild(el('p', 'g-title', `דגל עבור ${name}`));
      const list = el('div');
      list.style.cssText = 'display:grid;gap:5px;max-width:380px;margin:0 auto 14px;font-size:13px;color:var(--dim)';
      list.innerHTML = rules.map((r, i) => `<div>${i + 1}. ${r.t}</div>`).join('');
      stage.appendChild(list);

      const pal = el('div', 'row'); pal.style.marginBottom = '12px';
      COLORS.forEach((c, i) => {
        const b = el('button');
        b.style.cssText = `width:34px;height:34px;border-radius:11px;background:${c};border:2px solid ${i === 0 ? '#fff' : 'transparent'}`;
        b.onclick = () => { color = c; Array.from(pal.children).forEach(x => x.style.border = '2px solid transparent'); b.style.border = '2px solid #fff'; api.sfx('tap'); };
        pal.appendChild(b);
      });
      stage.appendChild(pal);

      const grid = el('div');
      grid.style.cssText = `display:grid;grid-template-columns:repeat(${N},1fr);gap:3px;max-width:340px;margin:0 auto;background:rgba(255,255,255,.1);padding:3px;border-radius:8px`;
      u.forEach((_, i) => {
        const c = el('button');
        c.style.cssText = 'aspect-ratio:1.4;background:rgba(255,255,255,.06);border-radius:4px;transition:.12s';
        c.onclick = () => {
          u[i] = u[i] === color ? null : color;
          c.style.background = u[i] || 'rgba(255,255,255,.06)';
          api.sfx('pop');
        };
        grid.appendChild(c);
      });
      stage.appendChild(grid);

      const check = el('button', 'btn wide', '🏁 בדוק את הדגל');
      check.style.cssText = 'max-width:340px;margin:16px auto 0;display:flex';
      check.onclick = () => {
        const ok = rules.filter(r => r.test(u)).length;
        const painted = u.filter(Boolean).length;
        if (painted < 8) { toast('צבעו לפחות 8 משבצות'); return; }
        const pts = Math.round((ok / rules.length) * 70) + clamp(painted, 0, 30);
        confetti(ok === rules.length ? 60 : 24);
        api.sfx(ok === rules.length ? 'win' : 'great');
        api.finish(pts, { detail: `${ok}/${rules.length} חוקים התקיימו · ${painted} משבצות` });
      };
      stage.appendChild(check);
      api.status('עצבו את הדגל');
    }
  });
})();
