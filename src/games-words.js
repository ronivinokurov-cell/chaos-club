/* ===== מילים ושפה ===== */
(function () {

  const FINALS = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
  const norm = ch => FINALS[ch] || ch;
  const ALPHABET = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];

  /* 1. תלי תלוי */
  registerGame({
    id: 'words.hangman', cat: 'words', name: 'תלי תלוי', emoji: '🪢', diff: 2, gold: 700, silver: 400,
    desc: 'נחשו את המילה הנסתרת אות אחר אות, לפני שנגמרים הניסיונות.',
    howto: [
      'מוצגת מילה חסרה — קו לכל אות.',
      'לוחצים על אותיות במקלדת שמתחת למילה.',
      'אות נכונה נחשפת ומוסיפה 40 נקודות.',
      'שש טעיות מסיימות את המשחק עם הניקוד שנצבר.'
    ],
    scoring: '40 נקודות לאות נכונה · 200 בונוס על פתרון מילה',
    mount(stage, api) {
      const WORDS = ['מחשב', 'שמש', 'פיל', 'מטריה', 'תפוח', 'כוכב', 'מכונית', 'גיטרה', 'חלון', 'ארנב',
        'מגדל', 'שוקולד', 'כדורגל', 'מזוודה', 'ענן', 'חוף', 'תמונה', 'מפתח', 'חורף', 'גמל',
        'מסעדה', 'טלפון', 'ספריה', 'שוק', 'ירח', 'נמר', 'ארמון', 'פסנתר'];
      const FACES = ['😀', '🙂', '😐', '😟', '😰', '😵'];
      const TOTAL = 3;
      let round = 0, score = 0, solved = 0;

      const nextWord = () => {
        if (round >= TOTAL) {
          return api.finish(score, { detail: `${solved} מילים מתוך ${TOTAL} · ${round - solved} נכשלו` });
        }
        round++;
        const word = pick(WORDS);
        const chars = [...word];
        const need = new Set(chars.map(norm));
        const guessed = new Set();
        let misses = 0;

        stage.innerHTML = '';
        const wrap = el('div', 'pad-wrap');
        wrap.style.flexDirection = 'column';
        wrap.style.gap = '16px';
        const face = el('div', '', FACES[0]);
        face.style.cssText = 'font-size:44px;line-height:1';
        const slots = el('div', '');
        slots.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;font-size:26px;font-weight:800;direction:rtl';
        const note = el('div', 'small-note');
        const kbd = el('div', '');
        kbd.style.cssText = 'display:grid;grid-template-columns:repeat(6,1fr);gap:8px;max-width:460px;width:100%';
        wrap.appendChild(face); wrap.appendChild(slots); wrap.appendChild(note); wrap.appendChild(kbd);
        stage.appendChild(wrap);

        const drawSlots = () => {
          slots.innerHTML = '';
          chars.forEach(ch => {
            const cell = el('span', '', guessed.has(norm(ch)) || ch === ' ' ? ch : '•');
            cell.style.cssText = 'min-width:26px;text-align:center;border-bottom:3px solid currentColor;padding-bottom:2px;opacity:' + (guessed.has(norm(ch)) ? '1' : '.55');
            slots.appendChild(cell);
          });
        };
        const drawNote = () => {
          note.textContent = `מילה ${round}/${TOTAL} · טעיות ${misses}/6 · ניקוד ${fmt(score)}`;
        };

        const checkSolved = () => [...need].every(l => guessed.has(l));

        ALPHABET.forEach(letter => {
          const b = el('button', 'chip', letter);
          b.style.cssText = 'font-size:17px;padding:10px 0;font-weight:700';
          b.onclick = () => {
            if (b.disabled) return;
            b.disabled = true;
            b.style.opacity = '.35';
            if (need.has(letter)) {
              guessed.add(letter);
              score += 40;
              api.setScore(score);
              api.sfx('good');
              drawSlots(); drawNote();
              if (checkSolved()) {
                solved++;
                score += 200;
                api.setScore(score);
                api.sfx('win');
                note.textContent = `פתרתם את "${word}"! ‎+200`;
                api.after(900, nextWord);
              }
            } else {
              misses++;
              api.sfx('bad');
              face.textContent = FACES[Math.min(misses, FACES.length - 1)];
              drawNote();
              if (misses >= 6) {
                slots.innerHTML = `<span style="font-size:20px">המילה הייתה: ${word}</span>`;
                api.after(1200, () => api.finish(score, { detail: `המילה "${word}" לא נפתרה · ${solved} מילים נפתרו` }));
              }
            }
          };
          kbd.appendChild(b);
        });

        drawSlots(); drawNote();
        api.status(`מילה ${round}/${TOTAL}`);
      };
      nextWord();
    }
  });

  /* 2. אנגרמות */
  registerGame({
    id: 'words.anagram', cat: 'words', name: 'אנגרמות', emoji: '🔤', diff: 2, gold: 800, silver: 450,
    desc: 'האותיות התערבבו — הרכיבו מהן את המילה הנכונה.',
    howto: [
      'מוצגות אותיות מעורבבות של מילה אחת.',
      'לוחצים על האותיות לפי הסדר שבו הן נכתבות.',
      'מילה נכונה מוסיפה 120 נקודות ועוברת למילה הבאה.',
      'מילה שגויה מורידה 30 נקודות ומאפסת את הבנייה.'
    ],
    scoring: '120 נקודות למילה · 30− למילה שגויה · 150 בונוס בסיום כל שש המילים',
    mount(stage, api) {
      const WORDS = ['מחשב', 'תפוח', 'מכונית', 'גיטרה', 'שוקולד', 'כדורגל', 'מזוודה', 'חלון', 'מסעדה', 'טלפון', 'ספריה', 'פסנתר'];
      const TOTAL = 6;
      const list = sample(WORDS, TOTAL);
      let idx = 0, score = 0, built = [];

      const round = () => {
        if (idx >= TOTAL) return api.finish(score, { detail: `כל ${TOTAL} המילים הורכבו` });
        const word = list[idx];
        idx++;
        built = [];
        stage.innerHTML = '';
        const wrap = el('div', 'pad-wrap');
        wrap.style.flexDirection = 'column';
        wrap.style.gap = '16px';
        const target = el('div', '');
        target.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;font-size:26px;font-weight:800;min-height:44px';
        const letters = el('div', '');
        letters.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:460px';
        const note = el('div', 'small-note');
        wrap.appendChild(target); wrap.appendChild(letters); wrap.appendChild(note);
        stage.appendChild(wrap);

        const draw = () => {
          target.innerHTML = '';
          built.forEach(ch => {
            const c = el('span', '', ch);
            c.style.cssText = 'min-width:26px;text-align:center;border-bottom:3px solid currentColor;padding-bottom:2px';
            target.appendChild(c);
          });
          for (let i = built.length; i < [...word].length; i++) {
            const c = el('span', '', '·');
            c.style.cssText = 'min-width:26px;text-align:center;opacity:.35';
            target.appendChild(c);
          }
          note.textContent = `מילה ${Math.min(idx, TOTAL)}/${TOTAL} · ניקוד ${fmt(score)}`;
        };

        const pool = shuffle([...word]);
        pool.forEach((ch, i) => {
          const b = el('button', 'chip', ch);
          b.style.cssText = 'font-size:20px;padding:12px 16px;font-weight:800';
          b.onclick = () => {
            if (b.style.display === 'none') return;
            b.style.display = 'none';
            built.push(ch);
            api.sfx('tap');
            draw();
            if (built.length === [...word].length) {
              if (built.join('') === word) {
                score += 120;
                api.setScore(score);
                api.sfx('good');
                note.textContent = 'נכון! עוברים למילה הבאה';
                api.after(700, round);
              } else {
                score = Math.max(0, score - 30);
                api.setScore(score);
                api.sfx('bad');
                built = [];
                Array.from(letters.children).forEach(c => { c.style.display = ''; });
                draw();
              }
            }
          };
          letters.appendChild(b);
        });
        draw();
        api.status(`מילה ${idx}/${TOTAL}`);
      };
      round();
    }
  });

  /* 3. מה לא שייך */
  const ODD = [
    q4('מה לא שייך לקבוצה: תפוח, בננה, אגס, גזר?', 'גזר', ['תפוח', 'בננה', 'אגס']),
    q4('מה לא שייך לקבוצה: כלב, חתול, שולחן, סוס?', 'שולחן', ['כלב', 'חתול', 'סוס']),
    q4('מה לא שייך לקבוצה: אוטובוס, רכבת, מטוס, אופניים?', 'אופניים', ['אוטובוס', 'רכבת', 'מטוס']),
    q4('מה לא שייך לקבוצה: עין, אוזן, אף, נעל?', 'נעל', ['עין', 'אוזן', 'אף']),
    q4('מה לא שייך לקבוצה: גיטרה, כינור, חצוצרה, מקרר?', 'מקרר', ['גיטרה', 'כינור', 'חצוצרה']),
    q4('מה לא שייך לקבוצה: תל אביב, חיפה, פריז, באר שבע?', 'פריז', ['תל אביב', 'חיפה', 'באר שבע']),
    q4('מה לא שייך לקבוצה: ים, אגם, נהר, הר?', 'הר', ['ים', 'אגם', 'נהר']),
    q4('מה לא שייך לקבוצה: חורף, אביב, קיץ, צהריים?', 'צהריים', ['חורף', 'אביב', 'קיץ']),
    q4('מה לא שייך לקבוצה: עיפרון, עט, טוש, מספריים?', 'מספריים', ['עיפרון', 'עט', 'טוש']),
    q4('מה לא שייך לקבוצה: שמש, ירח, כוכב, ענן?', 'ענן', ['שמש', 'ירח', 'כוכב'])
  ];
  quizGame({
    id: 'words.odd', cat: 'words', name: 'מה לא שייך', emoji: '🧐', diff: 1, gold: 800, silver: 450,
    desc: 'בכל שאלה שלוש מילים שייכות לקבוצה אחת — ואחת לא.',
    howto: [
      'מוצגות ארבע מילים.',
      'שלוש מהן חולקות מאפיין משותף.',
      'בוחרים את המילה שלא שייכת.',
      'עשר שאלות, וכל תשובה נכונה מוסיפה 100 נקודות.'
    ],
    scoring: '100 נקודות לתשובה נכונה',
    questions: ODD
  });

  /* 4. השלם את הפתגם */
  const PROVERBS = [
    q4('״טובים השניים מן ה___״', 'אחד', ['שניים', 'שלושה', 'ארבעה']),
    q4('״אין עשן בלי ___״', 'אש', ['רוח', 'מים', 'עץ']),
    q4('״כל הכבוד ___״', 'מאחור', ['מלפנים', 'בצד', 'בעבר']),
    q4('״מי שטרח בערב שבת יאכל בשבת״ — מה הרעיון?', 'שכר על מאמץ מוקדם', ['אכילה בשבת', 'עבודה קשה', 'מנוחה']),
    q4('״אל תסתכל בקנקן אלא במה שיש ___״', 'בתוכו', ['עליו', 'מתחתיו', 'לידו']),
    q4('״לא כל הנוצץ ___״', 'זהב', ['כסף', 'יהלום', 'נחושת']),
    q4('״עדיף ציפור אחת ביד משתיים על ___״', 'העץ', ['הגג', 'ההר', 'הגדר']),
    q4('״אין דבר העומד בפני ה___״', 'רצון', ['כסף', 'כוח', 'זמן']),
    q4('״טיפה ועוד טיפה — סוף סוף ___״', 'ים', ['נהר', 'שלולית', 'גשם']),
    q4('״אדם לאדם ___״', 'זאב', ['חבר', 'אח', 'עזר'])
  ];
  quizGame({
    id: 'words.proverb', cat: 'words', name: 'השלם את הפתגם', emoji: '📜', diff: 2, gold: 800, silver: 450,
    desc: 'עשרה פתגמים עבריים עם חור אחד — השלימו אותו.',
    howto: [
      'מוצג פתגם עם מילה חסרה.',
      'בוחרים את המילה שמתאימה.',
      'מיד נחשפת התשובה הנכונה.',
      'עשר שאלות, 120 נקודות לכל תשובה נכונה.'
    ],
    scoring: '120 נקודות לתשובה נכונה',
    questions: PROVERBS
  });

  /* 5. איות מהיר */
  registerGame({
    id: 'words.spell', cat: 'words', name: 'איות מהיר', emoji: '⌨️', diff: 2, gold: 900, silver: 500,
    desc: 'מוצגת מילה — הקלידו אותה נכון לפני שהזמן נגמר.',
    howto: [
      'מוצגת מילה בעברית.',
      'מקלידים אותה בשדה שמתחת ולוחצים Enter.',
      'מילה נכונה מוסיפה 80 נקודות ומילה חדשה מופיעה.',
      'ארבעים שניות לכל הסבב.'
    ],
    scoring: '80 נקודות למילה נכונה · 200 בונוס על 12 מילים',
    mount(stage, api) {
      const WORDS = ['מקלדת', 'שמשייה', 'מכונית', 'טלסקופ', 'חלומות', 'ספרייה', 'מטבחון', 'ציפורן', 'גלגלת', 'מזחלת',
        'פנסיון', 'קלמרית', 'שעונית', 'מריצה', 'עגבנייה', 'אבטיח', 'תותית', 'מנהרה', 'תחנה', 'נמלה'];
      let score = 0, correct = 0, word = '', inputEl = null, cleared = false;
      stage.innerHTML = '';
      const wrap = el('div', 'pad-wrap');
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '16px';
      const shown = el('div', 'g-q');
      shown.style.cssText = 'font-size:32px;font-weight:900;letter-spacing:1px';
      const input = el('input', 'input');
      input.type = 'text';
      input.placeholder = 'הקלידו כאן את המילה';
      input.autocomplete = 'off';
      input.style.cssText = 'max-width:320px;text-align:center;font-size:20px';
      const note = el('div', 'small-note');
      wrap.appendChild(shown); wrap.appendChild(input); wrap.appendChild(note);
      stage.appendChild(wrap);
      inputEl = input;

      const nextWord = () => {
        let w;
        do { w = pick(WORDS); } while (w === word);
        word = w;
        shown.textContent = word;
        input.value = '';
        input.focus();
      };

      input.onkeydown = e => {
        if (e.key !== 'Enter') return;
        const typed = input.value.trim();
        if (!typed) return;
        if (typed === word) {
          score += 80; correct++;
          api.setScore(score);
          api.sfx('good');
          note.textContent = `נכון! ${correct} מילים · ${fmt(score)} נקודות`;
          nextWord();
        } else {
          api.sfx('bad');
          note.textContent = 'כמעט — נסו שוב עם אותה מילה';
          input.value = '';
          input.focus();
        }
      };

      api.setTimer(40, () => {
        if (cleared) return;
        cleared = true;
        const bonus = correct >= 12 ? 200 : 0;
        api.finish(score + bonus, { detail: `${correct} מילים נכונות${bonus ? ' · בונוס 200' : ''}` });
      });
      api.onCleanup(() => { cleared = true; });
      nextWord();
      api.status('כתבו את המילה וליחצו Enter');
    }
  });

})();
