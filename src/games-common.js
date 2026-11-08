/* ===== עזרי בנייה למשחקי העולמות החדשים ===== */

/* שאלת אמריקאית: q4(נוסח, תשובה נכונה, [שלוש שגויות]) */
function q4(q, correct, wrongs, pts) {
  const opts = shuffle([correct].concat(wrongs.slice(0, 3)));
  return { q, options: opts, answer: opts.indexOf(correct), pts };
}

/* דגימה אקראית מתוך מאגר */
const sample = (arr, n) => shuffle(arr).slice(0, Math.min(n, arr.length));

/* משחק חידון מלא: מריץ את runQuiz עם מאגר שאלות */
function quizGame(def) {
  registerGame({
    id: def.id, cat: def.cat, name: def.name, emoji: def.emoji, desc: def.desc,
    howto: def.howto, scoring: def.scoring, diff: def.diff || 2,
    gold: def.gold || 900, silver: def.silver || 500,
    mount(stage, api) {
      const questions = def.pick ? def.pick() : def.questions;
      runQuiz(api, {
        count: questions.length,
        total: def.total,
        make: i => ({
          q: questions[i].q,
          options: questions[i].options,
          answer: questions[i].answer,
          pts: questions[i].pts || def.pts || 100
        })
      });
    }
  });
}

/* כפתור משחק גדול לפאנלים מותאמים */
function playBtn(label, fn, ghost) {
  const b = el('button', 'btn' + (ghost ? ' ghost' : ''), label);
  b.onclick = fn;
  return b;
}
