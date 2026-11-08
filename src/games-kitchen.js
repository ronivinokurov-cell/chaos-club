/* ===== סדנת בישול: הכנת מנות ===== */
(function () {

  /* ---------- מנוע 1: מילוי הזמנה נכון ---------- */
  function shelfGame(def) {
    return function (stage, api) {
      let idx = 0, score = 0, done = 0;
      const TOTAL = def.orders.length;

      const startOrder = () => {
        if (idx >= TOTAL) return api.finish(score, { detail: `${done} הזמנות הושלמו מתוך ${TOTAL}` });
        const order = def.orders[idx++];
        const need = order.need.slice();
        const picked = [];
        const shelf = shuffle(need.concat(order.dist));

        stage.innerHTML = '';
        const wrap = el('div', 'pad-wrap');
        wrap.style.flexDirection = 'column';
        wrap.style.gap = '14px';
        const ticket = el('div', '');
        ticket.style.cssText = 'width:100%;max-width:460px;border:2px dashed rgba(255,255,255,.28);border-radius:16px;padding:14px;text-align:center';
        ticket.innerHTML = `<div style="font-size:15px;opacity:.72;margin-bottom:6px">${def.ticketLabel} ${idx}/${TOTAL}</div>
          <div style="font-size:22px;font-weight:900">${order.emoji} ${order.name}</div>
          <div style="font-size:13.5px;opacity:.8;margin-top:8px">צריך: ${need.join(' · ')}</div>`;
        const plate = el('div', '');
        plate.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;min-height:46px;align-items:center';
        plate.innerHTML = `<span style="opacity:.45;font-size:13px">${def.plateEmpty}</span>`;
        const shelfEl = el('div', '');
        shelfEl.style.cssText = 'display:grid;grid-template-columns:repeat(2,minmax(120px,1fr));gap:8px;width:100%;max-width:440px';
        const note = el('div', 'small-note', `ניקוד ${fmt(score)}`);
        wrap.appendChild(ticket); wrap.appendChild(plate); wrap.appendChild(shelfEl); wrap.appendChild(note);
        stage.appendChild(wrap);

        const drawPlate = () => {
          plate.innerHTML = '';
          if (!picked.length) {
            plate.innerHTML = `<span style="opacity:.45;font-size:13px">${def.plateEmpty}</span>`;
            return;
          }
          picked.forEach(p => {
            const c = el('span', 'chip', p);
            c.style.cssText = 'font-size:14px;padding:9px 12px;background:rgba(34,211,165,.22);border-color:rgba(34,211,165,.5)';
            plate.appendChild(c);
          });
        };

        shelf.forEach(item => {
          const b = el('button', 'chip', item);
          b.style.cssText = 'padding:13px 10px;font-size:14.5px;font-weight:700';
          b.onclick = () => {
            if (b.disabled) return;
            if (need.includes(item) && !picked.includes(item)) {
              picked.push(item);
              score += 80;
              api.setScore(score);
              api.sfx('good');
              b.disabled = true;
              b.style.opacity = '.35';
              drawPlate();
              note.textContent = `ניקוד ${fmt(score)} · ${picked.length}/${need.length} מרכיבים`;
              if (picked.length === need.length) {
                done++;
                score += 150;
                api.setScore(score);
                api.sfx('win');
                note.textContent = `${order.name} מוכן! ‎+150`;
                api.after(900, startOrder);
              }
            } else {
              score = Math.max(0, score - 30);
              api.setScore(score);
              api.sfx('bad');
              b.classList.add('flashbad');
              setTimeout(() => b.classList.remove('flashbad'), 420);
              note.textContent = `${item} לא שייך להזמנה הזאת · ${fmt(score)}`;
            }
          };
          shelfEl.appendChild(b);
        });
        api.status(`${def.statusLabel} ${idx}/${TOTAL}`);
      };
      startOrder();
    };
  }

  /* ---------- מנוע 2: סדר שכבות / שלבי הכנה ---------- */
  function stackGame(def) {
    return function (stage, api) {
      let idx = 0, score = 0, done = 0;
      const TOTAL = def.builds.length;

      const startBuild = () => {
        if (idx >= TOTAL) return api.finish(score, { detail: `${done} מנות הורכבו נכון מתוך ${TOTAL}` });
        const build = def.builds[idx++];
        const steps = build.steps;
        let placed = 0;

        stage.innerHTML = '';
        const wrap = el('div', 'pad-wrap');
        wrap.style.flexDirection = 'column';
        wrap.style.gap = '14px';
        const title = el('div', 'g-title', `${build.emoji} ${build.name} · ${idx}/${TOTAL}`);
        const tower = el('div', '');
        tower.style.cssText = 'display:flex;flex-direction:column-reverse;gap:4px;align-items:center;justify-content:flex-start;min-height:150px;width:100%;max-width:420px;padding:10px;border-radius:16px;background:rgba(255,255,255,.04)';
        const pool = el('div', '');
        pool.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:440px';
        const note = el('div', 'small-note', 'התחילו מהשכבה התחתונה');
        wrap.appendChild(title); wrap.appendChild(tower); wrap.appendChild(pool); wrap.appendChild(note);
        stage.appendChild(wrap);

        shuffle(steps.map((s, i) => ({ s, i }))).forEach(({ s, i }) => {
          const b = el('button', 'chip', s);
          b.style.cssText = 'padding:11px 14px;font-size:14.5px;font-weight:700';
          b.onclick = () => {
            if (b.disabled) return;
            if (i === placed) {
              b.disabled = true;
              b.style.opacity = '.3';
              const layer = el('div', '', s);
              layer.style.cssText = 'width:100%;text-align:center;padding:9px 10px;border-radius:10px;font-size:14px;font-weight:700;background:linear-gradient(135deg,rgba(34,211,165,.28),rgba(125,226,255,.18));animation:pop .28s both';
              tower.appendChild(layer);
              placed++;
              score += 70;
              api.setScore(score);
              api.sfx('good');
              note.textContent = `שכבה ${placed}/${steps.length} · ${fmt(score)} נקודות`;
              if (placed === steps.length) {
                done++;
                score += 200;
                api.setScore(score);
                api.sfx('win');
                note.textContent = `${build.name} מוכן! ‎+200`;
                api.after(950, startBuild);
              }
            } else {
              score = Math.max(0, score - 25);
              api.setScore(score);
              api.sfx('bad');
              b.classList.add('flashbad');
              setTimeout(() => b.classList.remove('flashbad'), 420);
              note.textContent = def.wrongHint;
            }
          };
          pool.appendChild(b);
        });
        api.status(`${def.statusLabel} ${idx}/${TOTAL}`);
      };
      startBuild();
    };
  }

  /* ---------- מנוע 3: חזור על המנה ---------- */
  function copyGame(def) {
    return function (stage, api) {
      let round = 0, score = 0, hits = 0;
      const ROUNDS = def.rounds;

      const startRound = () => {
        if (round >= ROUNDS.length) {
          return api.finish(score, { detail: `${hits} מנות שוחזרו נכון מתוך ${ROUNDS.length}` });
        }
        const len = ROUNDS[round];
        round++;
        const target = Array.from({ length: len }, () => pick(def.flavors));
        let built = [];

        stage.innerHTML = '';
        const wrap = el('div', 'pad-wrap');
        wrap.style.flexDirection = 'column';
        wrap.style.gap = '14px';
        const title = el('div', 'g-title', `מנה ${round}/${ROUNDS.length} · ${len} כדורים`);
        const show = el('div', '');
        show.style.cssText = 'display:flex;flex-direction:column-reverse;gap:4px;align-items:center;min-height:130px;justify-content:flex-start';
        const cones = el('div', '', '🍦');
        cones.style.cssText = 'font-size:36px;line-height:1';
        const mine = el('div', '');
        mine.style.cssText = 'display:flex;flex-direction:column-reverse;gap:4px;align-items:center;min-height:130px;justify-content:flex-start';
        const palette = el('div', '');
        palette.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;justify-content:center;max-width:420px';
        const note = el('div', 'small-note', 'הביטו בהזמנה');
        wrap.appendChild(title); wrap.appendChild(show); wrap.appendChild(mine); wrap.appendChild(palette); wrap.appendChild(note);
        stage.appendChild(wrap);

        show.innerHTML = '';
        target.forEach(f => {
          const s = el('div', '', f);
          s.style.cssText = 'font-size:30px;padding:2px 8px;border-radius:10px;background:rgba(255,255,255,.08)';
          show.appendChild(s);
        });

        let locked = true;
        def.flavors.forEach(f => {
          const b = el('button', 'chip', f);
          b.style.cssText = 'font-size:26px;padding:8px 14px';
          b.onclick = () => {
            if (locked || built.length >= target.length) return;
            built.push(f);
            api.sfx('tap');
            const s = el('div', '', f);
            s.style.cssText = 'font-size:30px;padding:2px 8px;border-radius:10px;background:rgba(139,92,246,.28)';
            mine.appendChild(s);
            if (built.length === target.length) {
              const ok = built.every((v, i) => v === target[i]);
              if (ok) {
                hits++;
                score += 250;
                api.setScore(score);
                api.sfx('win');
                note.textContent = 'מדויק! ‎+250';
              } else {
                api.sfx('bad');
                note.textContent = 'לא בדיוק — הנה ההזמנה המקורית';
                mine.style.opacity = '.5';
              }
              api.after(1100, startRound);
            }
          };
          palette.appendChild(b);
        });

        api.after(2200, () => {
          locked = false;
          show.style.opacity = '.25';
          note.textContent = 'עכשיו הרכיבו את אותה מנה';
        });
        api.status(`מנה ${round}/${ROUNDS.length}`);
      };
      startRound();
    };
  }

  /* ---------- מנוע 4: תזמון ---------- */
  function timingGame(def) {
    return function (stage, api) {
      let score = 0, perfect = 0, done = 0, pos = 0, dir = 1, active = true;
      const TOTAL = def.rounds;

      stage.innerHTML = '';
      const wrap = el('div', 'pad-wrap');
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '14px';
      const title = el('div', 'g-title', def.title);
      const board = el('div', '');
      board.style.cssText = 'position:relative;width:100%;max-width:440px;height:54px;border-radius:14px;background:linear-gradient(90deg,rgba(255,255,255,.08),rgba(255,255,255,.14),rgba(255,255,255,.08));overflow:hidden';
      const zone = el('div', '');
      zone.style.cssText = 'position:absolute;top:0;bottom:0;left:35%;width:30%;background:rgba(34,211,165,.35);border-left:2px solid rgba(34,211,165,.8);border-right:2px solid rgba(34,211,165,.8)';
      const center = el('div', '');
      center.style.cssText = 'position:absolute;top:0;bottom:0;left:50%;width:2px;background:rgba(255,255,255,.55)';
      const marker = el('div', '');
      marker.style.cssText = 'position:absolute;top:-4px;bottom:-4px;width:5px;border-radius:3px;background:#ffd166;box-shadow:0 0 12px #ffd166';
      board.appendChild(zone); board.appendChild(center); board.appendChild(marker);
      const btn = el('button', 'btn', def.actionLabel);
      const note = el('div', 'small-note', `0/${TOTAL}`);
      wrap.appendChild(title); wrap.appendChild(board); wrap.appendChild(btn); wrap.appendChild(note);
      stage.appendChild(wrap);

      const tick = api.every(16, () => {
        if (!active) return;
        pos += dir * 1.6;
        if (pos > 100) { pos = 100; dir = -1; }
        if (pos < 0) { pos = 0; dir = 1; }
        marker.style.left = `calc(${pos}% - 2px)`;
      });

      btn.onclick = () => {
        if (!active) return;
        active = false;
        done++;
        const dist = Math.abs(pos - 50);
        if (dist <= 10) { perfect++; score += 150; api.sfx('win'); note.textContent = `מושלם! ${done}/${TOTAL} · ${fmt(score)}`; }
        else if (dist <= 22) { score += 80; api.sfx('good'); note.textContent = `טוב · ${done}/${TOTAL} · ${fmt(score)}`; }
        else { api.sfx('bad'); note.textContent = `נשרף · ${done}/${TOTAL} · ${fmt(score)}`; }
        api.setScore(score);
        api.after(420, () => {
          if (done >= TOTAL) {
            const bonus = perfect >= 4 ? 200 : 0;
            return api.finish(score + bonus, { detail: `${perfect} מושלמים מתוך ${TOTAL}${bonus ? ' · בונוס 200' : ''}` });
          }
          active = true;
          btn.disabled = false;
        });
      };
      api.onCleanup(() => { active = false; clearInterval(tick); });
      api.status('הקישו ברגע המדויק');
    };
  }

  /* ================= 1. פיצה ================= */
  registerGame({
    id: 'kitchen.pizza', cat: 'kitchen', name: 'פיצת שף', emoji: '🍕', diff: 1, gold: 1000, silver: 600,
    desc: 'הזמנה נכנסת למטבח — אספו בדיוק את המרכיבים שהיא מבקשת.',
    howto: [
      'מוצגת הזמנה עם רשימת המרכיבים שלה.',
      'לוחצים על המרכיבים הנכונים ממדף המצרכים.',
      'מרכיב נכון עולה על הפיצה ומוסיף 80 נקודות.',
      'מרכיב לא נכון מוריד 30 — ויש עוד שתי הזמנות.'
    ],
    scoring: '80 נקודות למרכיב נכון · 150 בונוס על פיצה שלמה · 30− לטעות',
    mount: shelfGame({
      ticketLabel: 'הזמנה', statusLabel: 'הזמנה', plateEmpty: 'הפיצה עוד ריקה',
      orders: [
        { emoji: '🍕', name: 'פיצה מרגריטה', need: ['בצק', 'רוטב עגבניות', 'מוצרלה', 'בזיליקום'], dist: ['אננס', 'זיתים שחורים', 'שוקולד', 'חומוס'] },
        { emoji: '🍕', name: 'פיצה פפרוני', need: ['בצק', 'רוטב עגבניות', 'מוצרלה', 'פפרוני'], dist: ['אננס', 'פטריות', 'בצל', 'גבינה כחולה'] },
        { emoji: '🍕', name: 'פיצה פטריות', need: ['בצק', 'רוטב עגבניות', 'מוצרלה', 'פטריות'], dist: ['פפרוני', 'אננס', 'שוקולד', 'טונה'] }
      ]
    })
  });

  /* ================= 2. סושי ================= */
  registerGame({
    id: 'kitchen.sushi', cat: 'kitchen', name: 'סושי רול', emoji: '🍣', diff: 2, gold: 1000, silver: 600,
    desc: 'גלגלו רול לפי הסדר הנכון — מהנורי ועד החיתוך.',
    howto: [
      'מוצגים שלבי ההכנה של הרול, מעורבבים.',
      'לוחצים על השלב שצריך לבוא ראשון, ואז השני.',
      'שלב נכון עולה למגדל ומוסיף 70 נקודות.',
      'שלב לא בסדר מוריד 25 ומשאיר אתכם באותו מקום.'
    ],
    scoring: '70 נקודות לשלב נכון · 200 בונוס על רול מושלם · 25− לטעות',
    mount: stackGame({
      statusLabel: 'רול', wrongHint: 'זה לא השלב הבא בהכנה',
      builds: [
        { emoji: '🍣', name: 'רול סלמון', steps: ['הנחת עלה נורי', 'פיזור אורז מבושל', 'הנחת פרוסות סלמון', 'גלגול במחצלת', 'חיתוך לשמונה יחידות'] },
        { emoji: '🥑', name: 'רול אבוקדו', steps: ['הנחת עלה נורי', 'פיזור אורז מבושם', 'מילוי אבוקדו ומלפפון', 'גלגול הדוק', 'פיזור שומשום', 'חיתוך והגשה'] }
      ]
    })
  });

  /* ================= 3. גלידה ================= */
  registerGame({
    id: 'kitchen.icecream', cat: 'kitchen', name: 'גלידה בגביע', emoji: '🍨', diff: 2, gold: 900, silver: 550,
    desc: 'הזמנת גלידה מוצגת לשתי שניות — שחזרו אותה בדיוק.',
    howto: [
      'מוצג גביע עם רצף טעמים לשתי שניות.',
      'אחר כך בוחרים טעמים לפי אותו סדר.',
      'רצף מדויק מוסיף 250 נקודות.',
      'סבב חדש עם עוד כדור בכל פעם.'
    ],
    scoring: '250 נקודות למנה מדויקת · שלושה סבבים',
    mount: copyGame({
      flavors: ['🍫', '🍓', '🍦', '🍋', '🥝', '🫐'],
      rounds: [3, 4, 5]
    })
  });

  /* ================= 4. המבורגר ================= */
  registerGame({
    id: 'kitchen.burger', cat: 'kitchen', name: 'מגדל המבורגר', emoji: '🍔', diff: 2, gold: 1000, silver: 600,
    desc: 'בנו את ההמבורגר שכבה אחר שכבה, מהלחמנייה התחתונה ועד העליונה.',
    howto: [
      'מוצגים כל המרכיבים, מעורבבים.',
      'בוחרים את השכבה התחתונה, ואז את זו שמעליה.',
      'שכבה נכונה עולה למגדל ומוסיפה 70 נקודות.',
      'שכבה לא בסדר מורידה 25 נקודות.'
    ],
    scoring: '70 נקודות לשכבה · 200 בונוס על המבורגר שלם · 25− לטעות',
    mount: stackGame({
      statusLabel: 'המבורגר', wrongHint: 'השכבה הזאת לא באה עכשיו',
      builds: [
        { emoji: '🍔', name: 'קלאסי', steps: ['לחמנייה תחתונה', 'רוטב מיוחד', 'חסה', 'עגבנייה', 'קציצת בקר', 'צ׳דר', 'לחמנייה עליונה'] },
        { emoji: '🧅', name: 'עם בצל מקורמל', steps: ['לחמנייה תחתונה', 'רוטב ברביקיו', 'בצל מקורמל', 'חסה', 'קציצה', 'חמוצי', 'לחמנייה עליונה'] }
      ]
    })
  });

  /* ================= 5. טאקו ================= */
  registerGame({
    id: 'kitchen.taco', cat: 'kitchen', name: 'טאקו מהיר', emoji: '🌮', diff: 2, gold: 1000, silver: 600,
    desc: 'שלוש הזמנות טאקו נגד השעון — מלאו כל טורטייה בדיוק.',
    howto: [
      'הזמנה מציינת אילו חמישה מרכיבים צריך.',
      'לוחצים על המרכיבים הנכונים בלבד.',
      'מרכיב נכון מוסיף 80, שגוי מוריד 30.',
      'שלוש הזמנות, וכל טעות עולה לכם בניקוד.'
    ],
    scoring: '80 נקודות למרכיב · 150 בונוס על טאקו שלם · 30− לטעות',
    mount: shelfGame({
      ticketLabel: 'הזמנה', statusLabel: 'טאקו', plateEmpty: 'הטורטייה ריקה',
      orders: [
        { emoji: '🌮', name: 'טאקו בקר', need: ['טורטייה', 'בקר טחון', 'חסה', 'עגבנייה', 'צ׳דר'], dist: ['שוקולד', 'גלידה', 'פפרוני', 'דבש'] },
        { emoji: '🌮', name: 'טאקו עוף', need: ['טורטייה', 'עוף בגריל', 'כרוב', 'לימון', 'שמנת חמוצה'], dist: ['שוקולד', 'גלידה', 'פפרוני', 'דבש'] },
        { emoji: '🌮', name: 'טאקו צמחוני', need: ['טורטייה', 'שעועית', 'אבוקדו', 'עגבנייה', 'כוסברה'], dist: ['בקר טחון', 'עוף בגריל', 'שוקולד', 'דבש'] }
      ]
    })
  });

  /* ================= 6. פנקייק ================= */
  registerGame({
    id: 'kitchen.pancake', cat: 'kitchen', name: 'פנקייק מושלם', emoji: '🥞', diff: 2, gold: 900, silver: 550,
    desc: 'הפכו את הפנקייק ברגע המדויק — לא מוקדם מדי ולא שרוף.',
    howto: [
      'סמן זהב נע ימינה ושמאלה על המחבת.',
      'לוחצים על "הפוך" כשהסמן באזור הירוק.',
      'מרכז ירוק = מושלם, קצה ירוק = טוב, מחוץ לאזור = נשרף.',
      'שישה פנקייקים בכל סבב.'
    ],
    scoring: '150 נקודות להפיכה מושלמת · 80 לטובה · 200 בונוס על ארבע מושלמות',
    mount: timingGame({
      title: 'מתי להפוך?',
      actionLabel: '🥞 הפוך!',
      rounds: 6
    })
  });

  /* ================= 7. סלט ================= */
  registerGame({
    id: 'kitchen.salad', cat: 'kitchen', name: 'סלט צבעים', emoji: '🥗', diff: 1, gold: 1000, silver: 600,
    desc: 'כל סלט מבקש מרכיבים משלו — בנו אותו נכון בקערה.',
    howto: [
      'מוצגת הזמנת סלט עם חמשת המרכיבים שלה.',
      'לוחצים על הירקות והתוספות שמתאימים לה.',
      'מרכיב נכון עובר לקערה ומוסיף 80 נקודות.',
      'מרכיב לא מתאים מוריד 30 נקודות.'
    ],
    scoring: '80 נקודות למרכיב נכון · 150 בונוס על סלט שלם · 30− לטעות',
    mount: shelfGame({
      ticketLabel: 'הזמנה', statusLabel: 'סלט', plateEmpty: 'הקערה ריקה',
      orders: [
        { emoji: '🥗', name: 'סלט יווני', need: ['עגבנייה', 'מלפפון', 'בצל סגול', 'זיתים', 'גבינה בולגרית'], dist: ['שוקולד', 'מרשמלו', 'קצפת', 'קרמל'] },
        { emoji: '🥑', name: 'סלט אבוקדו', need: ['אבוקדו', 'עגבנייה', 'בצל', 'לימון', 'שמן זית'], dist: ['שוקולד', 'קצפת', 'מרשמלו', 'קרמל'] },
        { emoji: '🍓', name: 'סלט פירות', need: ['תות', 'בננה', 'תפוח', 'ענבים', 'נענע'], dist: ['שום', 'בצל', 'חומוס', 'קטשופ'] }
      ]
    })
  });

  /* ================= 8. שוקולד ================= */
  registerGame({
    id: 'kitchen.chocolate', cat: 'kitchen', name: 'שוקולד בלגי', emoji: '🍫', diff: 2, gold: 1000, silver: 600,
    desc: 'הכינו פרלינים מהמסה ועד החילוץ — בסדר הנכון.',
    howto: [
      'שלבי ייצור הפרלינים מוצגים מעורבבים.',
      'בוחרים את השלב הראשון, ואז את הבא.',
      'שלב נכון מוסיף 70 נקודות.',
      'שלב לא נכון מוריד 25 נקודות.'
    ],
    scoring: '70 נקודות לשלב · 200 בונוס על מנה מושלמת · 25− לטעות',
    mount: stackGame({
      statusLabel: 'מנה', wrongHint: 'השלב הזה עוד לא הגיע',
      builds: [
        { emoji: '🍫', name: 'פרלינים מרירים', steps: ['המסת שוקולד מריר', 'ערבוב עם שמנת חמה', 'יציקה לתבנית', 'קירור במקרר', 'חילוץ מהתבנית', 'פיזור קקאו'] },
        { emoji: '🤍', name: 'טראפלס לבנים', steps: ['המסת שוקולד לבן', 'הוספת חמאה', 'עיצוב כדורים', 'טבילה בשוקולד מריר', 'קישוט אגוזים'] }
      ]
    })
  });

})();
