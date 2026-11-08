/* ===== ספורט ===== */
(function () {

  const RULES = [
    q4('כמה שחקנים בקבוצת כדורגל על המגרש?', '11', ['9', '10', '12']),
    q4('כמה שחקנים בקבוצת כדורסל על המגרש?', '5', ['6', '7', '4']),
    q4('כמה נקודות שווה סל משלוש בכדורסל?', '3', ['1', '2', '4']),
    q4('מהו הצבע של כרטיס הרחקה בכדורגל?', 'אדום', ['צהוב', 'כחול', 'ירוק']),
    q4('כמה סטים צריך לנצח בטניס גרנד סלאם (גברים)?', '3', ['2', '4', '5']),
    q4('כמה שחקנים בקבוצת כדורעף על המגרש?', '6', ['5', '7', '8']),
    q4('מהי אורך בריכת שחייה אולימפית?', '50 מטר', ['25 מטר', '75 מטר', '100 מטר']),
    q4('כמה זמן נמשך מחצית בכדורגל?', '45 דקות', ['30 דקות', '40 דקות', '60 דקות']),
    q4('באיזה ענף משתמשים במחבט שנקרא ״מחבט״ ומכדור נוצות?', 'בדמינטון', ['טניס', 'סקווש', 'טניס שולחן']),
    q4('כמה שחקנים בקבוצת רוגבי יוניון?', '15', ['11', '13', '7'])
  ];
  quizGame({
    id: 'sport.rules', cat: 'sport', name: 'חוקי המשחק', emoji: '📋', diff: 2, gold: 900, silver: 500,
    desc: 'עשר שאלות על חוקים, מספרים ומגרשים בספורט.',
    howto: [
      'מוצגת שאלת חוקים.',
      'בוחרים תשובה מתוך ארבע.',
      'מיד נחשפת התשובה הנכונה.',
      '110 נקודות לכל תשובה נכונה.'
    ],
    scoring: '110 נקודות לתשובה נכונה',
    pick() { return sample(RULES, 10); }
  });

  const EQUIPMENT = [
    q4('במה משחקים בענף שבו יש ״פאק״ ומקלות על הקרח?', 'הוקי קרח', ['לקרוס', 'קרלינג', 'החלקה אמנותית']),
    q4('באיזה ענף משתמשים בכפפות ובשק אגרוף?', 'איגרוף', ['היאבקות', 'ג׳ודו', 'סיף']),
    q4('באיזה ענף יש רשת, כדור צהוב ומגרש חול?', 'כדורעף חופים', ['טניס', 'בדמינטון', 'פאדל']),
    q4('באיזה ענף רוכבים על אופניים בשטח?', 'אופני הרים', ['טריאתלון', 'מרתון', 'סקייטבורד']),
    q4('באיזה ענף משתמשים בגלגלת ובמסלול מעץ?', 'סקייטבורד', ['רולרבליידס', 'קרלינג', 'בובסלה']),
    q4('באיזה ענף זורקים דיסקית ומטילים כידון?', 'אתלטיקה', ['הרמת משקולות', 'התעמלות', 'שחייה']),
    q4('באיזה ענף יש סירה ומשוטים?', 'חתירה', ['שייט מפרשיות', 'גלישת גלים', 'קאנו סלאלום']),
    q4('באיזה ענף משתמשים במחבט עם מיתרים וכדור עגול?', 'טניס', ['גולף', 'בייסבול', 'הוקי']),
    q4('באיזה ענף משתמשים באלות ובכדור קטן על דשא?', 'גולף', ['קרוקט', 'פולו', 'בייסבול']),
    q4('באיזה ענף יש טבעת וקורה ומקבילים?', 'התעמלות מכשירים', ['החלקה', 'שחייה צורנית', 'קליעה'])
  ];
  quizGame({
    id: 'sport.equipment', cat: 'sport', name: 'זיהוי ענף', emoji: '🏅', diff: 1, gold: 900, silver: 500,
    desc: 'הציוד על השולחן — באיזה ענף ספורט משתמשים בו?',
    howto: [
      'מוצג תיאור ציוד.',
      'בוחרים את הענף שמתאים לו.',
      'מיד נחשפת התשובה הנכונה.',
      '100 נקודות לכל תשובה נכונה.'
    ],
    scoring: '100 נקודות לתשובה נכונה',
    pick() { return sample(EQUIPMENT, 10); }
  });

  const TRIVIA = [
    q4('איזו מדינה זכתה הכי הרבה פעמים במונדיאל?', 'ברזיל', ['גרמניה', 'איטליה', 'ארגנטינה']),
    q4('מהי המדינה שאירחה את אולימפיאדת 2024?', 'צרפת', ['יפן', 'ארצות הברית', 'בריטניה']),
    q4('מי מכונה ״המלך״ בכדורסל?', 'מייקל ג׳ורדן', ['לברון ג׳יימס', 'קובי בראיינט', 'שאקיל אוניל']),
    q4('כמה טבעות אולימפיות יש?', '5', ['4', '6', '7']),
    q4('באיזו עיר נערכה אולימפיאדת 2021 (שנערכה ב־2021)?', 'טוקיו', ['פריז', 'לוס אנג׳לס', 'בייג׳ינג']),
    q4('מהו שם הגביע של ליגת האלופות האירופית?', 'הגביע הגדול', ['גביע העולם', 'הגביע הכסוף', 'הגביע המוזהב']),
    q4('באיזה ענף מפורסם רוג׳ר פדרר?', 'טניס', ['גולף', 'כדורסל', 'קריקט']),
    q4('מהי הריצה הארוכה ביותר באולימפיאדה?', 'מרתון', ['10,000 מטר', '5,000 מטר', 'ריצת 800 מטר']),
    q4('כמה שחקנים בקבוצת בייסבול על המגרש בהגנה?', '9', ['7', '8', '10']),
    q4('באיזו מדינה נולד הכדורגל המודרני?', 'אנגליה', ['ברזיל', 'איטליה', 'ספרד'])
  ];
  quizGame({
    id: 'sport.trivia', cat: 'sport', name: 'טריוויה ספורט', emoji: '🏆', diff: 2, gold: 1000, silver: 550,
    desc: 'עשר שאלות על ספורטאים, תארים ואולימפיאדות.',
    howto: [
      'מוצגת שאלת ספורט.',
      'בוחרים תשובה מתוך ארבע.',
      'מיד נחשפת התשובה הנכונה.',
      '120 נקודות לכל תשובה נכונה.'
    ],
    scoring: '120 נקודות לתשובה נכונה',
    pick() { return sample(TRIVIA, 10); }
  });

  /* בעיטת עונשין */
  registerGame({
    id: 'sport.penalty', cat: 'sport', name: 'בעיטת עונשין', emoji: '🥅', diff: 2, gold: 800, silver: 450,
    desc: 'שמונה בעיטות, שוער שמזנק לפינה אקראית — לאן תבעטו?',
    howto: [
      'השער מחולק לשישה אזורים.',
      'לוחצים על האזור שאליו תבעטו.',
      'השוער קופץ לאזור אחד — אם הוא שם, זה עצירה.',
      'שמונה בעיטות, 150 נקודות לכל שער.'
    ],
    scoring: '150 נקודות לשער · 300 בונוס על שישה שערים ומעלה',
    mount(stage, api) {
      const SPOTS = 6;
      let shots = 0, goals = 0, score = 0, busy = false;
      stage.innerHTML = '';
      const wrap = el('div', 'pad-wrap');
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '14px';
      const note = el('div', 'g-title', 'בחרו פינה ובעיטה');
      const goal = el('div', '');
      goal.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:420px;width:100%;padding:12px;border:6px solid #f5f5f5;border-radius:12px;border-bottom-width:10px';
      const scoreEl = el('div', 'small-note');
      wrap.appendChild(note); wrap.appendChild(goal); wrap.appendChild(scoreEl);
      stage.appendChild(wrap);

      const zones = [];
      for (let i = 0; i < SPOTS; i++) {
        const z = el('button', 'tile');
        z.style.cssText = 'height:78px;font-size:26px;display:flex;align-items:center;justify-content:center';
        z.textContent = '·';
        z.onclick = () => {
          if (busy || shots >= 8) return;
          busy = true;
          shots++;
          const keeper = rnd(SPOTS);
          const isGoal = keeper !== i;
          z.textContent = isGoal ? '⚽' : '🧤';
          z.style.background = isGoal ? 'rgba(34,211,165,.35)' : 'rgba(255,77,77,.35)';
          if (isGoal) { goals++; score += 150; api.setScore(score); api.sfx('good'); }
          else api.sfx('bad');
          scoreEl.textContent = `בעיטה ${shots}/8 · שערים ${goals} · ${fmt(score)} נקודות`;
          api.after(520, () => {
            z.textContent = '·'; z.style.background = '';
            busy = false;
            if (shots >= 8) {
              const bonus = goals >= 6 ? 300 : 0;
              api.finish(score + bonus, { detail: `${goals} שערים מתוך 8${bonus ? ' · בונוס 300' : ''}` });
            } else {
              note.textContent = goals >= shots / 2 ? 'יפה! בעיטה נוספת' : 'השוער ערני — נסו פינה אחרת';
            }
          });
        };
        zones.push(z);
        goal.appendChild(z);
      }
      scoreEl.textContent = `בעיטה 0/8 · שערים 0 · 0 נקודות`;
      api.status('בחרו אזור לבעיטה');
    }
  });

  /* ריצת משוכות */
  registerGame({
    id: 'sport.hurdles', cat: 'sport', name: 'ריצת משוכות', emoji: '🏃', diff: 2, gold: 800, silver: 450,
    desc: 'ספרינט של 30 שניות — קפצו מעל כל משוכה בדיוק בזמן.',
    howto: [
      'רצים קדימה, ומשוכות מגיעות מימין.',
      'לוחצים על המסך (או רווח) כדי לקפוץ.',
      'פגיעה במשוכה מסיימת את הריצה.',
      '100 נקודות לכל משוכה שעברתם בשלום.'
    ],
    scoring: '100 נקודות למשוכה · 200 בונוס על 20 משוכות',
    mount(stage, api) {
      let score = 0, passed = 0, over = false, jumping = false, cleared = false;
      let hurdles = [], speed = 2.4, spawn = 0;

      stage.innerHTML = '';
      const track = el('div', '');
      track.style.cssText = 'position:relative;height:190px;width:100%;max-width:560px;border-radius:18px;overflow:hidden;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.12)';
      const ground = el('div', '');
      ground.style.cssText = 'position:absolute;left:0;right:0;bottom:0;height:6px;background:rgba(255,255,255,.25)';
      const runner = el('div', '');
      runner.textContent = '🏃';
      runner.style.cssText = 'position:absolute;bottom:8px;right:16px;font-size:34px;transition:bottom .16s ease';
      track.appendChild(ground); track.appendChild(runner);

      const hint = el('div', 'small-note', 'הקליקו על המסלול כדי לקפוץ');
      const wrap = el('div', 'pad-wrap');
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '10px';
      wrap.appendChild(track); wrap.appendChild(hint);
      stage.appendChild(wrap);

      const jump = () => {
        if (over || jumping) return;
        jumping = true;
        runner.style.bottom = '78px';
        api.sfx('tap');
        setTimeout(() => { runner.style.bottom = '8px'; jumping = false; }, 380);
      };
      track.onclick = jump;
      const keyH = e => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); } };
      window.addEventListener('keydown', keyH);
      api.onCleanup(() => window.removeEventListener('keydown', keyH));

      api.every(30, () => {
        if (over || cleared) return;
        spawn += 30;
        if (spawn > 1000 - speed * 60) {
          spawn = 0;
          const h = el('div', '');
          h.textContent = '🚧';
          h.style.cssText = 'position:absolute;bottom:8px;right:-40px;font-size:28px';
          h._x = -6;
          track.appendChild(h);
          hurdles.push(h);
        }
        hurdles.forEach(h => {
          h._x += speed;
          h.style.right = h._x + '%';
          if (!h._done && h._x > 62) {
            h._done = true;
            if (!jumping) {
              over = true;
              api.sfx('bad');
              api.finish(score, { detail: `נפלתם במשוכה ${passed + 1} · ${passed} משוכות עברו` });
            } else {
              passed++;
              score += 100;
              api.setScore(score);
              api.sfx('good');
              hint.textContent = `משוכות: ${passed} · ${fmt(score)} נקודות`;
              if (speed < 6) speed += 0.09;
            }
          }
          if (h._x > 120) { h.remove(); }
        });
        hurdles = hurdles.filter(h => h.parentNode);
      });

      api.setTimer(30, () => {
        if (cleared || over) return;
        cleared = true;
        const bonus = passed >= 20 ? 200 : 0;
        api.finish(score + bonus, { detail: `${passed} משוכות בשלום${bonus ? ' · בונוס 200' : ''}` });
      });
      api.onCleanup(() => { cleared = true; });
      api.status('קפצו מעל המשוכות');
    }
  });

})();
