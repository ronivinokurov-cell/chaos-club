/* ===== סדנת בישול · המתכונים (מכינים באמת עם האצבע) ===== */
(function () {
  const C = window.cookSim;
  const base = { cat: 'kitchen', diff: 2, gold: 900, silver: 500 };
  const make = (id, name, emoji, desc, steps, final, howto) =>
    registerGame(Object.assign({}, base, { id, name, emoji, desc, howto, scoring: 'כל שלב נכון = נקודות · טעות = פחות ניקוד · סיום המנה = בונוס', mount: C({ name, steps, final }) }));

  /* 1 · סושי */
  make('kitchen.sushi', 'סושי רול', '🍣', 'פורסים נורי, מורחים אורז, ממלאים, מגלגלים וחותכים — בדיוק כמו במציאות.',
    [
      { type: 'drag', hint: 'גררו את עלה הנורי אל מחצלת הגלגול', item: { emoji: '⬛', label: 'נורי' }, drop: { x: .5, y: .5, r: .42 }, visual: '⬛', size: 120 },
      { type: 'paint', hint: 'מרחו אורז על כל העלה עם האצבע', label: 'מורחים אורז', color: 'rgba(255,255,255,.78)', coverage: .6 },
      { type: 'drag', hint: 'הניחו את הסלמון לאורך המרכז', item: { emoji: '🐟', label: 'סלמון' }, drop: { x: .5, y: .5, r: .3 }, visual: '🍣', size: 60 },
      { type: 'drag', hint: 'ועכשיו אבוקדו', item: { emoji: '🥑', label: 'אבוקדו' }, drop: { x: .5, y: .5, r: .3 }, visual: '🥑', size: 54 },
      { type: 'swipe', hint: 'החליקו למעלה כדי לגלגל את הרול', label: 'מגלגלים', dir: 'up', icon: '🥢', visual: '🍥', size: 80 },
      { type: 'swipe', hint: 'החליקו ימינה פעמיים כדי לפרוס', label: 'פורסים', dir: 'right', count: 2, icon: '🔪' }
    ], '🍣',
    ['כל שלב הוא תנועה אמיתית: גרירה, מריחה באצבע או החלקה.', 'מרחו את האורז על רוב העלה — לא חייבים 100%.', 'גלגלו בהחלקה למעלה, ואז פרסו בהחלקות ימינה.', 'טעות בעוצמה או בכיוון מורידה ניקוד.']);

  /* 2 · פיצה */
  make('kitchen.pizza', 'פיצת שף', '🍕', 'רדדו בצק, מרחו רוטב, פזרו תוספות, אפו ופרסו — שלב אחרי שלב.',
    [
      { type: 'drag', hint: 'גררו את הבצק למרכז הלוח', item: { emoji: '🫓', label: 'בצק' }, drop: { x: .5, y: .5, r: .4 }, visual: '🫓', size: 130 },
      { type: 'paint', hint: 'מרחו רוטב עגבניות בתנועות סיבוביות', label: 'מורחים רוטב', color: 'rgba(255,90,60,.62)', coverage: .55 },
      { type: 'drag', hint: 'פזרו גבינה', item: { emoji: '🧀', label: 'מוצרלה' }, drop: { x: .5, y: .5, r: .32 }, visual: '🧀', size: 66 },
      { type: 'drag', hint: 'הוסיפו בזיליקום', item: { emoji: '🌿', label: 'בזיליקום' }, drop: { x: .54, y: .46, r: .28 }, visual: '🌿', size: 50 },
      { type: 'timing', hint: 'הכניסו לתנור — עצרו כשהסמן במרכז הזהוב', button: 'הוצא מהתנור', visual: '🍕', size: 96 },
      { type: 'swipe', hint: 'פרסו את הפיצה בהחלקות', label: 'פורסים', dir: 'right', count: 2, icon: '🔪' }
    ], '🍕',
    ['גוררים מצרך מהתחתית אל הכלי.', 'המריחה נעשית באצבע על המשטח.', 'התנור הוא מבחן תזמון — עצרו ברגע הנכון.', 'בסוף פורסים בהחלקות.']);

  /* 3 · גלידה */
  make('kitchen.icecream', 'גלידה בגביע', '🍨', 'הניחו גביע, הניחו כדורים אחד על השני והוסיפו דובדבן.',
    [
      { type: 'drag', hint: 'גררו את הגביע למרכז', item: { emoji: '🍦', label: 'גביע' }, drop: { x: .5, y: .62, r: .34 }, visual: '🍦', size: 96 },
      { type: 'drag', hint: 'כדור שוקולד מעל הגביע', item: { emoji: '🍫', label: 'שוקולד' }, drop: { x: .5, y: .45, r: .26 }, visual: '🍫', size: 56 },
      { type: 'drag', hint: 'כדור תות מעליו', item: { emoji: '🍓', label: 'תות' }, drop: { x: .5, y: .34, r: .24 }, visual: '🍓', size: 52 },
      { type: 'drag', hint: 'דובדבן על הראש', item: { emoji: '🍒', label: 'דובדבן' }, drop: { x: .5, y: .24, r: .22 }, visual: '🍒', size: 42 },
      { type: 'swipe', hint: 'החליקו למעלה להוסיף קצפת', label: 'קצפת', dir: 'up', icon: '🥛', visual: '🍨', size: 90 }
    ], '🍨',
    ['כל כדור צריך לנחות על הכדור שמתחתיו.', 'גררו בעדינות — שחרור מחוץ לגביע נופל.', 'בסיום החלקה למעלה מוסיפה קצפת.']);

  /* 4 · המבורגר */
  make('kitchen.burger', 'מגדל המבורגר', '🍔', 'צלו קציצה על האש ובנו את ההמבורגר שכבה אחר שכבה.',
    [
      { type: 'drag', hint: 'הניחו לחמנייה תחתונה', item: { emoji: '🍞', label: 'לחמנייה' }, drop: { x: .5, y: .72, r: .3 }, visual: '🍞', size: 80 },
      { type: 'hold', hint: 'החזיקו את הקציצה על האש עד שתסיים להשחים', label: 'צולים', icon: '🥩', ms: 1500, visual: '🥩', size: 66 },
      { type: 'drag', hint: 'הניחו צ׳דר שתימס', item: { emoji: '🧀', label: 'צ׳דר' }, drop: { x: .5, y: .58, r: .26 }, visual: '🧀', size: 56 },
      { type: 'drag', hint: 'חסה מעל', item: { emoji: '🥬', label: 'חסה' }, drop: { x: .5, y: .48, r: .26 }, visual: '🥬', size: 52 },
      { type: 'drag', hint: 'עגבנייה', item: { emoji: '🍅', label: 'עגבנייה' }, drop: { x: .5, y: .4, r: .24 }, visual: '🍅', size: 46 },
      { type: 'drag', hint: 'סוגרים בלחמנייה העליונה', item: { emoji: '🍞', label: 'לחמנייה' }, drop: { x: .5, y: .32, r: .28 }, visual: '🍞', size: 80 }
    ], '🍔',
    ['מתחילים בלחמנייה התחתונה.', 'הקציצה נקראת ״החזקה״ — משחררים מוקדם מדי והבשר חי.', 'כל שכבה מונחת במקום שלה במגדל.']);

  /* 5 · טאקו */
  make('kitchen.taco', 'טאקו מהיר', '🌮', 'טורטייה, בשר, ירקות וקיפול אחד — טאקו כמו בדוכן.',
    [
      { type: 'drag', hint: 'הניחו טורטייה על הלוח', item: { emoji: '🫓', label: 'טורטייה' }, drop: { x: .5, y: .55, r: .4 }, visual: '🫓', size: 120 },
      { type: 'drag', hint: 'בשר במרכז', item: { emoji: '🥩', label: 'בשר' }, drop: { x: .5, y: .52, r: .26 }, visual: '🥩', size: 56 },
      { type: 'drag', hint: 'כרוב קצוץ', item: { emoji: '🥬', label: 'כרוב' }, drop: { x: .44, y: .5, r: .24 }, visual: '🥬', size: 46 },
      { type: 'drag', hint: 'לימון מעל', item: { emoji: '🍋', label: 'לימון' }, drop: { x: .58, y: .48, r: .22 }, visual: '🍋', size: 42 },
      { type: 'swipe', hint: 'החליקו למעלה לקפל את הטורטייה', label: 'מקפלים', dir: 'up', icon: '🌮', visual: '🌮', size: 96 }
    ], '🌮',
    ['הטורטייה היא הבסיס — בלעדיה הכל נופל.', 'המילויים נערמים במרכז.', 'הקיפול נעשה בהחלקה אחת למעלה.']);

  /* 6 · פנקייק */
  make('kitchen.pancake', 'פנקייק מושלם', '🥞', 'יוצקים בלילה, מחזיקים, הופכים בתזמון ומוסיפים חמאה וסירופ.',
    [
      { type: 'hold', hint: 'החזיקו את הקנקן ויוצקים עד הסוף', label: 'יוצקים', icon: '🥣', ms: 1300, visual: '⚪', size: 96 },
      { type: 'timing', hint: 'הפיכה בתזמון — עצרו כשהסמן במרכז', button: 'הפוך! 🔄', visual: '🥞', size: 100 },
      { type: 'drag', hint: 'קוביית חמאה מלמעלה', item: { emoji: '🧈', label: 'חמאה' }, drop: { x: .5, y: .45, r: .26 }, visual: '🧈', size: 46 },
      { type: 'drag', hint: 'ולסיום — סירופ מייפל', item: { emoji: '🍯', label: 'סירופ' }, drop: { x: .5, y: .48, r: .28 }, visual: '🍯', size: 48 }
    ], '🥞',
    ['יציקה היא החזקה ארוכה על הקנקן.', 'ההפיכה היא תזמון — מוקדם מדי והבלילה נוזלית.', 'חמאה וסירופ נגררים מעל.']);

  /* 7 · סלט */
  make('kitchen.salad', 'סלט צבעים', '🥗', 'קוצצים ירקות, מעבירים לקערה ומתבלים בשמן זית.',
    [
      { type: 'drag', hint: 'הניחו את הקערה', item: { emoji: '🥣', label: 'קערה' }, drop: { x: .5, y: .55, r: .38 }, visual: '🥣', size: 120 },
      { type: 'drag', hint: 'חסה', item: { emoji: '🥬', label: 'חסה' }, drop: { x: .46, y: .52, r: .24 }, visual: '🥬', size: 54 },
      { type: 'drag', hint: 'עגבניות', item: { emoji: '🍅', label: 'עגבנייה' }, drop: { x: .58, y: .55, r: .22 }, visual: '🍅', size: 46 },
      { type: 'drag', hint: 'מלפפון', item: { emoji: '🥒', label: 'מלפפון' }, drop: { x: .42, y: .62, r: .22 }, visual: '🥒', size: 44 },
      { type: 'swipe', hint: 'קוצצים בהחלקות למטה', label: 'קוצצים', dir: 'down', count: 3, icon: '🔪' },
      { type: 'paint', hint: 'מתבלים בשמן זית בתנועות מעגליות', label: 'שמן זית', color: 'rgba(255,225,120,.42)', coverage: .5 }
    ], '🥗',
    ['קודם כלים, אחר כך ירקות, ואז חיתוך.', 'החיתוך נעשה בהחלקות למטה.', 'התיבול הוא מריחה קלה — לא להציף.']);

  /* 8 · שוקולד */
  make('kitchen.chocolate', 'שוקולד בלגי', '🍫', 'ממיסים, יוצקים לתבנית, מפזרים אגוזים ומחלצים.',
    [
      { type: 'hold', hint: 'החזיקו את השוקולד מעל האש עד שיימס', label: 'ממיסים', icon: '🍫', ms: 1600, visual: '🟫', size: 90 },
      { type: 'paint', hint: 'יוצקים לתבנית ומשטחים', label: 'יוצקים', color: 'rgba(122,72,42,.85)', coverage: .6 },
      { type: 'drag', hint: 'מפזרים אגוזים', item: { emoji: '🌰', label: 'אגוזים' }, drop: { x: .5, y: .5, r: .3 }, visual: '🌰', size: 46 },
      { type: 'swipe', hint: 'מחלצים מהתבנית בהחלקות למטה', label: 'מחלצים', dir: 'down', count: 2, icon: '⬛' }
    ], '🍫',
    ['ההמסה דורשת החזקה רצופה.', 'היציקה היא מריחה על כל התבנית.', 'החילוץ נעשה בהחלקות למטה.']);
})();
