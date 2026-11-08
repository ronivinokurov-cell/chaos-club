/* ===== משחקי קופסא ולוח: מנועים ===== */
(function () {

  const HUMAN = '✖️', AI = '⭕';

  function boardWrap(style) {
    const w = el('div', 'pad-wrap');
    w.style.flexDirection = 'column';
    w.style.gap = '12px';
    if (style) w.style.cssText += ';' + style;
    return w;
  }

  function gridBox(cols, max) {
    const g = el('div', '');
    g.style.cssText = `display:grid;grid-template-columns:repeat(${cols},1fr);gap:${cols > 9 ? 2 : 5}px;width:min(90vw,${max || 420}px)`;
    return g;
  }

  function resultScore(win, moves, base) {
    if (win) return (base || 600) + Math.max(0, 200 - moves * 4);
    return 120;
  }

  /* ---------- מנוע: K בשורה (איקס עיגול / גומוקו / ארבע בשורה על לוח) ---------- */
  function placeGame(cfg) {
    return function (stage, api) {
      const N = cfg.size, K = cfg.win;
      const cellsArr = new Array(N * N).fill('');
      let over = false, moves = 0, score = 0;

      stage.innerHTML = '';
      const wrap = boardWrap();
      const note = el('div', 'small-note', cfg.hint || `אתם ${HUMAN} · המחשב ${AI} · ${K} בשורה מנצח`);
      const grid = gridBox(N, Math.min(N * 46, 430));
      const cellEls = [];

      const hasWin = (b, idx, mark) => {
        const x = idx % N, y = Math.floor(idx / N);
        const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
        return dirs.some(([dx, dy]) => {
          let count = 1;
          for (const s of [1, -1]) {
            let cx = x + dx * s, cy = y + dy * s;
            while (cx >= 0 && cx < N && cy >= 0 && cy < N && b[cy * N + cx] === mark) {
              count++; cx += dx * s; cy += dy * s;
            }
          }
          return count >= K;
        });
      };

      const paint = () => {
        cellEls.forEach((c, i) => {
          c.textContent = cellsArr[i];
          c.disabled = !!cellsArr[i] || over;
          c.style.opacity = cellsArr[i] ? '1' : '.9';
        });
      };

      const endGame = (playerWon, detail) => {
        over = true;
        paint();
        if (playerWon) { api.sfx('win'); score = resultScore(true, moves, cfg.base); }
        else { api.sfx('bad'); score = resultScore(false, moves, cfg.base); }
        api.after(500, () => api.finish(score, { detail, title: playerWon ? 'ניצחתם!' : 'המחשב ניצח' }));
      };

      const aiTurn = () => {
        if (over) return;
        const empties = cellsArr.map((v, i) => v ? -1 : i).filter(i => i >= 0);
        if (!empties.length) return endGame(false, 'תיקו');
        let move = -1;
        const wouldWin = (i, mark) => { cellsArr[i] = mark; const w = hasWin(cellsArr, i, mark); cellsArr[i] = ''; return w; };
        for (const i of empties) if (wouldWin(i, AI)) { move = i; break; }
        if (move < 0) for (const i of empties) if (wouldWin(i, HUMAN)) { move = i; break; }
        if (move < 0) {
          const mid = (N - 1) / 2;
          const scored = empties.map(i => {
            const d = Math.abs((i % N) - mid) + Math.abs(Math.floor(i / N) - mid);
            return { i, v: d + Math.random() * 3 };
          }).sort((a, b) => a.v - b.v);
          move = scored[0].i;
        }
        cellsArr[move] = AI;
        moves++;
        api.sfx('tap');
        paint();
        if (cfg.misere ? hasWin(cellsArr, move, AI) : hasWin(cellsArr, move, AI)) {
          return endGame(cfg.misere, cfg.misere ? 'המחשב סגר שורה — ניצחתם' : 'שלוש בשורה למחשב');
        }
        if (cellsArr.every(v => v)) return endGame(false, 'תיקו');
        note.textContent = 'התור שלכם';
      };

      const play = (i) => {
        if (over || cellsArr[i]) return;
        cellsArr[i] = HUMAN;
        moves++;
        api.sfx('good');
        paint();
        if (hasWin(cellsArr, i, HUMAN)) {
          if (cfg.misere) return endGame(false, 'סגרתם שורה — במשחק הזה זה הפסד');
          return endGame(true, `ניצחתם ב־${moves} מהלכים`);
        }
        if (cellsArr.every(v => v)) return endGame(false, 'תיקו');
        note.textContent = 'המחשב חושב…';
        api.after(420, aiTurn);
      };

      for (let i = 0; i < N * N; i++) {
        const b = el('button', 'tile', '');
        b.style.cssText = `aspect-ratio:1;padding:0;display:flex;align-items:center;justify-content:center;font-size:${N > 9 ? '15px' : '24px'}`;
        b.onclick = () => play(i);
        cellEls.push(b);
        grid.appendChild(b);
      }
      wrap.appendChild(note);
      wrap.appendChild(grid);
      stage.appendChild(wrap);
      paint();
      api.status(cfg.statusLabel || 'התור שלכם');
    };
  }

  /* ---------- מנוע: הפלה בעמודות (ארבע בשורה) ---------- */
  function gravityGame(cfg) {
    return function (stage, api) {
      const COLS = cfg.cols, ROWS = cfg.rows, K = cfg.win;
      const b = new Array(COLS * ROWS).fill('');
      let over = false, moves = 0;

      stage.innerHTML = '';
      const wrap = boardWrap();
      const note = el('div', 'small-note', `אתם ${HUMAN} · ${K} בשורה מנצח`);
      const grid = gridBox(COLS, Math.min(COLS * 54, 430));

      const at = (c, r) => b[r * COLS + c];
      const set = (c, r, v) => { b[r * COLS + c] = v; };
      const dropRow = c => { for (let r = ROWS - 1; r >= 0; r--) if (!at(c, r)) return r; return -1; };

      const hasWin = (c, r, mark) => {
        const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
        return dirs.some(([dx, dy]) => {
          let count = 1;
          for (const s of [1, -1]) {
            let cx = c + dx * s, cy = r + dy * s;
            while (cx >= 0 && cx < COLS && cy >= 0 && cy < ROWS && at(cx, cy) === mark) { count++; cx += dx * s; cy += dy * s; }
          }
          return count >= K;
        });
      };

      const els = [];
      const paint = () => els.forEach((e, i) => {
        e.textContent = b[i];
        e.disabled = over;
      });

      const aiTurn = () => {
        if (over) return;
        const valid = [...Array(COLS).keys()].filter(c => dropRow(c) >= 0);
        if (!valid.length) return endGame(false, 'תיקו');
        let col = -1;
        for (const c of shuffle(valid)) {
          const r = dropRow(c);
          set(c, r, AI); if (hasWin(c, r, AI)) { set(c, r, ''); col = c; break; } set(c, r, '');
        }
        if (col < 0) for (const c of shuffle(valid)) {
          const r = dropRow(c);
          set(c, r, HUMAN); if (hasWin(c, r, HUMAN)) { set(c, r, ''); col = c; break; } set(c, r, '');
        }
        if (col < 0) col = valid[Math.floor(valid.length / 2)];
        const r = dropRow(col);
        set(col, r, AI);
        moves++;
        api.sfx('tap');
        paint();
        if (hasWin(col, r, AI)) return endGame(false, 'המחשב השלים שורה');
        note.textContent = 'התור שלכם';
      };

      const endGame = (won, detail) => {
        over = true;
        paint();
        api.sfx(won ? 'win' : 'bad');
        api.after(450, () => api.finish(resultScore(won, moves, cfg.base), { detail, title: won ? 'ניצחתם!' : 'המחשב ניצח' }));
      };

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const e = el('button', 'tile', '');
          e.style.cssText = 'aspect-ratio:1;padding:0;display:flex;align-items:center;justify-content:center;font-size:20px';
          e.onclick = () => {
            if (over) return;
            const rr = dropRow(c);
            if (rr < 0) return;
            set(c, rr, HUMAN);
            moves++;
            api.sfx('good');
            paint();
            if (hasWin(c, rr, HUMAN)) return endGame(true, `ניצחתם ב־${moves} מהלכים`);
            if (b.every(v => v)) return endGame(false, 'תיקו');
            note.textContent = 'המחשב זורק…';
            api.after(420, aiTurn);
          };
          els.push(e);
          grid.appendChild(e);
        }
      }
      wrap.appendChild(note); wrap.appendChild(grid); stage.appendChild(wrap);
      api.status('בחרו עמודה');
    };
  }

  /* ---------- מנוע: רוורסי ---------- */
  function reversiGame(cfg) {
    return function (stage, api) {
      const N = cfg.size;
      const b = new Array(N * N).fill('');
      const mid = N / 2;
      b[(mid - 1) * N + (mid - 1)] = '⚪'; b[mid * N + mid] = '⚪';
      b[(mid - 1) * N + mid] = '⚫'; b[mid * N + (mid - 1)] = '⚫';
      const P = '⚫', C = '⚪';
      let over = false, moves = 0;

      stage.innerHTML = '';
      const wrap = boardWrap();
      const note = el('div', 'small-note', 'אתם ⚫ · המחשב ⚪');
      const grid = gridBox(N, Math.min(N * 46, 420));
      const els = [];

      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      const flipsFor = (i, mark) => {
        if (b[i]) return [];
        const x = i % N, y = Math.floor(i / N), out = [];
        for (const [dx, dy] of dirs) {
          let cx = x + dx, cy = y + dy, line = [];
          while (cx >= 0 && cx < N && cy >= 0 && cy < N && b[cy * N + cx] && b[cy * N + cx] !== mark) {
            line.push(cy * N + cx); cx += dx; cy += dy;
          }
          if (line.length && cx >= 0 && cx < N && cy >= 0 && cy < N && b[cy * N + cx] === mark) out.push(...line);
        }
        return out;
      };
      const legal = mark => b.map((v, i) => (!v && flipsFor(i, mark).length ? i : -1)).filter(i => i >= 0);

      const paint = () => {
        els.forEach((e, i) => { e.textContent = b[i]; e.disabled = over; });
        const mine = b.filter(v => v === P).length, theirs = b.filter(v => v === C).length;
        note.textContent = `אתם ${mine} · המחשב ${theirs}`;
      };

      const end = () => {
        over = true;
        paint();
        const mine = b.filter(v => v === P).length, theirs = b.filter(v => v === C).length;
        const won = mine > theirs;
        api.sfx(won ? 'win' : 'bad');
        api.after(400, () => api.finish(won ? resultScore(true, moves, 700) : 120, {
          detail: `${mine} מול ${theirs}`, title: won ? 'ניצחתם!' : 'המחשב ניצח'
        }));
      };

      const aiTurn = () => {
        if (over) return;
        const opts = legal(C);
        if (!opts.length) {
          if (!legal(P).length) return end();
          note.textContent = 'אין מהלך למחשב — התור שלכם';
          return;
        }
        let best = opts[0], bestGain = -1;
        for (const i of opts) {
          const gain = flipsFor(i, C).length;
          if (gain > bestGain) { bestGain = gain; best = i; }
        }
        b[best] = C;
        flipsFor(best, C).forEach(i => { b[i] = C; });
        moves++;
        api.sfx('tap');
        paint();
        if (!legal(P).length) {
          if (!legal(C).length) return end();
          note.textContent = 'אין לכם מהלך — המחשב ממשיך';
          api.after(600, aiTurn);
        }
      };

      for (let i = 0; i < N * N; i++) {
        const e = el('button', 'tile', '');
        e.style.cssText = 'aspect-ratio:1;padding:0;display:flex;align-items:center;justify-content:center;font-size:20px';
        e.onclick = () => {
          if (over || b[i]) return;
          const flips = flipsFor(i, P);
          if (!flips.length) { api.sfx('bad'); note.textContent = 'מהלך לא חוקי'; return; }
          b[i] = P;
          flips.forEach(k => { b[k] = P; });
          moves++;
          api.sfx('good');
          paint();
          api.after(420, aiTurn);
        };
        els.push(e);
        grid.appendChild(e);
      }
      wrap.appendChild(note); wrap.appendChild(grid); stage.appendChild(wrap);
      paint();
      api.status('הפכו דיסקיות');
    };
  }

  /* ---------- מנוע: דמקה ---------- */
  function checkersGame(cfg) {
    return function (stage, api) {
      const N = cfg.size;
      let b = new Array(N * N).fill('');
      const P = '🔴', C = '⚫';
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const dark = (r + c) % 2 === 1;
        if (!dark) continue;
        if (r < N / 2 - 1) b[r * N + c] = C;
        else if (r >= N / 2 + 1) b[r * N + c] = P;
      }
      let over = false, moves = 0, selected = -1;

      stage.innerHTML = '';
      const wrap = boardWrap();
      const note = el('div', 'small-note', 'אתם 🔴 · בחרו כלי ואז יעד');
      const grid = gridBox(N, Math.min(N * 46, 420));
      const els = [];

      const owner = v => v === P || v === '👑' ? 'P' : v === C || v === '🂡' ? 'C' : null;
      const isKing = v => v === '👑' || v === '🂡';
      const mine = v => v === P || v === '👑';
      const theirs = v => v === C || v === '🂡';

      const movesFrom = i => {
        const x = i % N, y = Math.floor(i / N), cur = b[i], out = [];
        if (!cur) return out;
        const dirs = isKing(cur) ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : (mine(cur) ? [[-1, 1], [-1, -1]] : [[1, 1], [1, -1]]);
        for (const [dx, dy] of dirs) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= N || ny < 0 || ny >= N) continue;
          const j = ny * N + nx;
          if (!b[j]) out.push({ to: j, cap: -1 });
          else if ((mine(cur) ? theirs(b[j]) : mine(b[j]))) {
            const kx = x + dx * 2, ky = y + dy * 2;
            if (kx >= 0 && kx < N && ky >= 0 && ky < N) {
              const k = ky * N + kx;
              if (!b[k]) out.push({ to: k, cap: j });
            }
          }
        }
        return out;
      };

      const paint = () => {
        els.forEach((e, i) => {
          e.textContent = b[i];
          e.style.outline = i === selected ? '3px solid #ffd166' : 'none';
          e.disabled = over;
        });
      };

      const finishCheck = () => {
        const pCount = b.filter(v => mine(v)).length, cCount = b.filter(v => theirs(v)).length;
        if (cCount === 0) { over = true; api.sfx('win'); api.after(400, () => api.finish(resultScore(true, moves, 700), { detail: 'כל הכלים של המחשב נאכלו', title: 'ניצחתם!' })); return true; }
        if (pCount === 0) { over = true; api.sfx('bad'); api.after(400, () => api.finish(120, { detail: 'נשארתם בלי כלים', title: 'המחשב ניצח' })); return true; }
        return false;
      };

      const aiTurn = () => {
        if (over) return;
        const options = [];
        for (let i = 0; i < b.length; i++) if (theirs(b[i])) movesFrom(i).forEach(m => options.push({ from: i, ...m }));
        if (!options.length) { over = true; api.after(300, () => api.finish(resultScore(true, moves, 700), { detail: 'למחשב אין מהלך', title: 'ניצחתם!' })); return; }
        const caps = options.filter(o => o.cap >= 0);
        const pickm = (caps.length ? caps : options)[Math.floor(Math.random() * (caps.length ? caps.length : options.length))];
        const piece = b[pickm.from];
        b[pickm.from] = '';
        b[pickm.to] = piece;
        if (pickm.cap >= 0) b[pickm.cap] = '';
        moves++;
        api.sfx('tap');
        paint();
        if (!finishCheck()) note.textContent = 'התור שלכם';
      };

      for (let i = 0; i < N * N; i++) {
        const e = el('button', 'tile', '');
        e.style.cssText = 'aspect-ratio:1;padding:0;display:flex;align-items:center;justify-content:center;font-size:18px';
        e.onclick = () => {
          if (over) return;
          if (mine(b[i])) { selected = i; api.sfx('tap'); paint(); return; }
          if (selected < 0) return;
          const mv = movesFrom(selected).find(m => m.to === i);
          if (!mv) { api.sfx('bad'); note.textContent = 'מהלך לא חוקי'; return; }
          const piece = b[selected];
          b[selected] = '';
          b[i] = piece;
          if (mv.cap >= 0) b[mv.cap] = '';
          selected = -1;
          moves++;
          if (mv.cap >= 0) {
            const opts = movesFrom(i).filter(m => m.cap >= 0);
            if (opts.length) { selected = i; note.textContent = 'יש עוד אכילה — המשיכו'; api.sfx('great'); paint(); return; }
          }
          api.sfx('good');
          paint();
          if (!finishCheck()) { note.textContent = 'המחשב משחק…'; api.after(420, aiTurn); }
        };
        els.push(e);
        grid.appendChild(e);
      }
      wrap.appendChild(note); wrap.appendChild(grid); stage.appendChild(wrap);
      paint();
      api.status('דמקה');
    };
  }

  /* ---------- מנוע: נים ---------- */
  function nimGame(cfg) {
    return function (stage, api) {
      let piles = cfg.piles.slice();
      const misere = !!cfg.misere;
      let over = false, score = 0, turns = 0;

      stage.innerHTML = '';
      const wrap = boardWrap();
      const note = el('div', 'small-note', 'לוקחים 1–3 מקלות מערימה אחת. מי שלוקח אחרון ' + (misere ? 'מפסיד' : 'מנצח'));
      const rows = el('div', '');
      rows.style.cssText = 'display:flex;flex-direction:column;gap:10px;width:100%;max-width:420px';
      wrap.appendChild(note); wrap.appendChild(rows); stage.appendChild(wrap);

      const draw = () => {
        rows.innerHTML = '';
        piles.forEach((count, pi) => {
          const row = el('div', '');
          row.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap';
          const label = el('span', '', `ערימה ${pi + 1}:`);
          label.style.cssText = 'font-size:12.5px;opacity:.7;min-width:62px';
          row.appendChild(label);
          for (let k = 0; k < count; k++) {
            const s = el('span', '', '|');
            s.style.cssText = 'font-size:20px;font-weight:900;color:#ffd166';
            row.appendChild(s);
          }
          [1, 2, 3].forEach(n => {
            const btn = el('button', 'chip', `−${n}`);
            btn.style.cssText = 'padding:6px 10px;font-size:13px';
            btn.disabled = count < n || over;
            btn.onclick = () => take(pi, n);
            row.appendChild(btn);
          });
          rows.appendChild(row);
        });
      };

      const total = () => piles.reduce((a, b) => a + b, 0);

      const end = (playerWon, detail) => {
        over = true;
        draw();
        api.sfx(playerWon ? 'win' : 'bad');
        api.after(400, () => api.finish(resultScore(playerWon, turns, 500), { detail, title: playerWon ? 'ניצחתם!' : 'המחשב ניצח' }));
      };

      const aiTurn = () => {
        if (over) return;
        // אסטרטגיית נים: להשאיר XOR אפס (או 1 במצב הפוך)
        const x = piles.reduce((a, v) => a ^ v, 0);
        let idx = piles.findIndex(v => v > 0);
        let amount = 1;
        const threshold = misere ? 1 : 0;
        if (x !== threshold) {
          for (let i = 0; i < piles.length; i++) {
            const target = piles[i] ^ x ^ threshold;
            if (target < piles[i]) { idx = i; amount = piles[i] - target; break; }
          }
        }
        amount = Math.min(3, Math.max(1, amount), piles[idx]);
        piles[idx] -= amount;
        turns++;
        api.sfx('tap');
        draw();
        if (total() === 0) {
          const playerWon = misere; // במצב הפוך מי שנטל אחרון מפסיד
          return end(playerWon, misere ? 'המחשב לקח אחרון — ניצחתם' : 'המחשב לקח אחרון');
        }
        note.textContent = 'התור שלכם';
      };

      const take = (pi, n) => {
        if (over) return;
        piles[pi] -= n;
        turns++;
        api.sfx('good');
        draw();
        if (total() === 0) return end(!misere, misere ? 'לקחתם אחרון — הפסדתם' : 'לקחתם אחרון וניצחתם');
        note.textContent = 'המחשב חושב…';
        api.after(420, aiTurn);
      };

      draw();
      api.status('התור שלכם');
    };
  }

  /* ---------- מנוע: נקודות וקווים ---------- */
  function dotsGame(cfg) {
    return function (stage, api) {
      const R = cfg.rows, C = cfg.cols;
      const hLines = {}, vLines = {};
      let boxes = {}, myScore = 0, aiScore = 0, turn = 'P', over = false;

      stage.innerHTML = '';
      const wrap = boardWrap();
      const note = el('div', 'small-note', 'אתם 🔵 · משלימים ריבוע = נקודה ותור נוסף');
      const grid = el('div', '');
      grid.style.cssText = `display:grid;grid-template-columns:repeat(${C * 2 - 1},1fr);grid-template-rows:repeat(${R * 2 - 1},1fr);gap:2px;width:min(92vw,420px);aspect-ratio:1`;
      wrap.appendChild(note); wrap.appendChild(grid); stage.appendChild(wrap);

      const drawAll = () => {
        grid.innerHTML = '';
        for (let r = 0; r < R * 2 - 1; r++) {
          for (let c = 0; c < C * 2 - 1; c++) {
            const cell = el('div', '');
            const isDot = r % 2 === 0 && c % 2 === 0;
            const isH = r % 2 === 0 && c % 2 === 1;
            const isV = r % 2 === 1 && c % 2 === 0;
            const isBox = r % 2 === 1 && c % 2 === 1;
            if (isDot) {
              cell.style.cssText = 'display:flex;align-items:center;justify-content:center';
              const d = el('span', '');
              d.style.cssText = 'width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.65)';
              cell.appendChild(d);
            } else if (isH) {
              const key = `${(r / 2) | 0}-${((c - 1) / 2) | 0}`;
              cell.style.cssText = `border-radius:3px;cursor:pointer;background:${hLines[key] ? 'rgba(255,209,102,.95)' : 'rgba(255,255,255,.09)'}`;
              cell.onclick = () => line('h', key);
            } else if (isV) {
              const key = `${((r - 1) / 2) | 0}-${(c / 2) | 0}`;
              cell.style.cssText = `border-radius:3px;cursor:pointer;background:${vLines[key] ? 'rgba(255,209,102,.95)' : 'rgba(255,255,255,.09)'}`;
              cell.onclick = () => line('v', key);
            } else {
              const key = `${((r - 1) / 2) | 0}-${((c - 1) / 2) | 0}`;
              const owner = boxes[key];
              cell.style.cssText = `border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:16px;background:${owner === 'P' ? 'rgba(58,208,255,.32)' : owner === 'A' ? 'rgba(255,77,141,.32)' : 'transparent'}`;
              cell.textContent = owner === 'P' ? '🔵' : owner === 'A' ? '🔴' : '';
            }
            grid.appendChild(cell);
          }
        }
      };

      const completeBoxes = who => {
        let gained = 0;
        for (let br = 0; br < R - 1; br++) {
          for (let bc = 0; bc < C - 1; bc++) {
            const k = `${br}-${bc}`;
            if (boxes[k]) continue;
            const ok = hLines[`${br}-${bc}`] && hLines[`${br + 1}-${bc}`] && vLines[`${br}-${bc}`] && vLines[`${br}-${bc + 1}`];
            if (ok) { boxes[k] = who; gained++; }
          }
        }
        return gained;
      };

      const aiTurn = () => {
        if (over) return;
        const hKeys = [], vKeys = [];
        for (let r = 0; r < R; r++) for (let c = 0; c < C - 1; c++) { const k = `${r}-${c}`; if (!hLines[k]) hKeys.push(['h', k]); }
        for (let r = 0; r < R - 1; r++) for (let c = 0; c < C; c++) { const k = `${r}-${c}`; if (!vLines[k]) vKeys.push(['v', k]); }
        const all = hKeys.concat(vKeys);
        if (!all.length) return finish();
        const [t, k] = all[Math.floor(Math.random() * all.length)];
        (t === 'h' ? hLines : vLines)[k] = 'A';
        const gained = completeBoxes('A');
        aiScore += gained;
        drawAll();
        if (gained) { note.textContent = `המחשב סגר ${gained} ריבועים`; api.after(500, aiTurn); return; }
        turn = 'P';
        note.textContent = 'התור שלכם';
        if (isDone()) finish();
      };

      const isDone = () => {
        let done = true;
        for (let r = 0; r < R; r++) for (let c = 0; c < C - 1; c++) if (!hLines[`${r}-${c}`]) done = false;
        for (let r = 0; r < R - 1; r++) for (let c = 0; c < C; c++) if (!vLines[`${r}-${c}`]) done = false;
        return done;
      };

      const finish = () => {
        if (over) return;
        over = true;
        const won = myScore > aiScore;
        api.sfx(won ? 'win' : 'bad');
        api.after(400, () => api.finish(won ? 600 + myScore * 20 : 120 + myScore * 20, {
          detail: `${myScore} ריבועים מול ${aiScore}`, title: won ? 'ניצחתם!' : (myScore === aiScore ? 'תיקו' : 'המחשב ניצח')
        }));
      };

      const line = (t, k) => {
        if (over || turn !== 'P') return;
        const store = t === 'h' ? hLines : vLines;
        if (store[k]) return;
        store[k] = 'P';
        api.sfx('good');
        const gained = completeBoxes('P');
        myScore += gained;
        drawAll();
        note.textContent = `אתם ${myScore} · המחשב ${aiScore}`;
        if (isDone()) return finish();
        if (gained) { note.textContent = `סגרתם ${gained} ריבועים — עוד תור`; return; }
        turn = 'A';
        api.after(420, aiTurn);
      };

      drawAll();
      api.status('התור שלכם');
    };
  }

  /* ---------- מנוע: סולמות ונחשים ---------- */
  function raceGame(cfg) {
    return function (stage, api) {
      const LAST = cfg.size;
      const jumps = cfg.jumps;
      let me = 0, cpu = 0, over = false, rolls = 0;

      stage.innerHTML = '';
      const wrap = boardWrap();
      const note = el('div', 'small-note', 'לחצו על הקובייה כדי להתקדם');
      const board = el('div', '');
      board.style.cssText = 'display:grid;grid-template-columns:repeat(10,1fr);gap:3px;width:min(92vw,400px)';
      const cells = [];
      for (let n = 1; n <= LAST; n++) {
        const c = el('div', '');
        c.style.cssText = 'aspect-ratio:1;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9.5px;background:rgba(255,255,255,.07);position:relative';
        c.textContent = String(n);
        cells[n - 1] = c;
        board.appendChild(c);
      }
      const roll = el('button', 'btn', '🎲 הטל קובייה');
      wrap.appendChild(note); wrap.appendChild(board); wrap.appendChild(roll); stage.appendChild(wrap);

      const paint = () => {
        cells.forEach(c => { c.style.boxShadow = 'none'; c.style.outline = 'none'; });
        if (cells[me - 1] && me > 0) { cells[me - 1].style.outline = '2px solid #3ad0ff'; }
        if (cells[cpu - 1] && cpu > 0) { cells[cpu - 1].style.boxShadow = 'inset 0 0 0 2px #ff4d8d'; }
        note.textContent = `אתם: ${me} · המחשב: ${cpu}`;
      };

      const move = (who, d) => {
        let pos = who === 'P' ? me : cpu;
        pos = Math.min(LAST, pos + d);
        if (jumps[pos]) pos = jumps[pos];
        if (who === 'P') me = pos; else cpu = pos;
        return pos;
      };

      const end = (won, detail) => {
        over = true;
        api.sfx(won ? 'win' : 'bad');
        api.after(400, () => api.finish(won ? resultScore(true, rolls, 500) : 120, { detail, title: won ? 'ניצחתם!' : 'המחשב ניצח' }));
      };

      roll.onclick = () => {
        if (over) return;
        const d = rndInt(1, 6);
        rolls++;
        move('P', d);
        api.sfx('tap');
        paint();
        if (me >= LAST) return end(true, `הגעתם ל־${LAST} ב־${rolls} הטלות`);
        roll.disabled = true;
        api.after(500, () => {
          if (over) return;
          move('A', rndInt(1, 6));
          paint();
          api.sfx('tap');
          if (cpu >= LAST) return end(false, 'המחשב הגיע קודם');
          roll.disabled = false;
        });
      };
      paint();
      api.status('הטילו קובייה');
    };
  }

  /* ===== רישום המשחקים ===== */

  const P = (o) => { registerGame(o); };

  P({
    id: 'board.tictactoe', cat: 'board', name: 'איקס עיגול', emoji: '❌', diff: 1, gold: 500, silver: 250,
    desc: 'הקלאסיקה של שלוש בשורה, נגד המחשב.',
    howto: ['הלוח 3×3 ואתם ✖️.', 'לוחצים על משבצת ריקה כדי להניח.', 'המחשב שם ⭕ אחריכם.', 'שלושה בסימן אחד בשורה, עמודה או אלכסון — מנצחים.'],
    scoring: '600 נקודות על ניצחון · 200 בונוס על ניצחון מהיר · 120 על הפסד',
    mount: placeGame({ size: 3, win: 3, base: 500 })
  });

  P({
    id: 'board.tictactoe.misere', cat: 'board', name: 'איקס עיגול הפוך', emoji: '🙃', diff: 2, gold: 600, silver: 300,
    desc: 'אותו לוח, חוק הפוך: מי שסוגר שלוש בשורה — מפסיד.',
    howto: ['הלוח 3×3, אתם ✖️.', 'אסור לכם לסגור שלוש בשורה.', 'אם המחשב סוגר שורה — אתם מנצחים.', 'המשחק הזה דורש חשיבה הפוכה.'],
    scoring: '600 נקודות כשהמחשב טועה · 120 אם סגרתם שורה',
    mount: placeGame({ size: 3, win: 3, misere: true, base: 600, hint: 'אתם ✖️ · מי שסוגר שלוש בשורה מפסיד' })
  });

  P({
    id: 'board.four', cat: 'board', name: 'ארבע בשורה', emoji: '🔶', diff: 2, gold: 700, silver: 350,
    desc: 'ארבעה בסימן אחד על לוח 7×7.',
    howto: ['לוח 7×7, אתם ✖️.', 'צריך ארבעה בסימן אחד בכל כיוון.', 'המחשב חוסם איומים אוטומטית.', 'אפשר גם לנצח באלכסון.'],
    scoring: '600 נקודות על ניצחון · בונוס על ניצחון מהיר',
    mount: placeGame({ size: 7, win: 4, base: 600 })
  });

  P({
    id: 'board.gomoku9', cat: 'board', name: 'חמישה בשורה', emoji: '⚫', diff: 2, gold: 700, silver: 350,
    desc: 'גומוקו על לוח 9×9 — חמישה בסימן אחד.',
    howto: ['לוח 9×9.', 'מניחים תור-תור אבן.', 'חמישה בסימן אחד ברצף מנצחים.', 'המחשב מנסה לחסום ולסגור משלו.'],
    scoring: '600 נקודות על ניצחון',
    mount: placeGame({ size: 9, win: 5, base: 600 })
  });

  P({
    id: 'board.gomoku13', cat: 'board', name: 'גומוקו גדול', emoji: '⚪', diff: 3, gold: 800, silver: 400,
    desc: 'לוח 13×13 לחמישה בשורה — משחק ארוך ואסטרטגי.',
    howto: ['לוח 13×13.', 'חמישה ברצף מנצחים.', 'עדיף לבנות שני איומים במקביל.', 'המחשב מגיב לאיומים המיידיים.'],
    scoring: '700 נקודות על ניצחון',
    mount: placeGame({ size: 13, win: 5, base: 700 })
  });

  P({
    id: 'board.connect4', cat: 'board', name: 'ארבע בשורה בנפילה', emoji: '🔴', diff: 2, gold: 700, silver: 350,
    desc: 'הדיסקיות נופלות לתחתית — ארבע בשורה מנצח.',
    howto: ['לוח 7 עמודות × 6 שורות.', 'לוחצים על משבצת והדיסקית נופלת לתחתית העמודה.', 'ארבעה ברצף בכל כיוון מנצחים.', 'המחשב ינסה לחסום אתכם.'],
    scoring: '600 נקודות על ניצחון',
    mount: gravityGame({ cols: 7, rows: 6, win: 4, base: 600 })
  });

  P({
    id: 'board.connect4.mini', cat: 'board', name: 'ארבע בשורה מהיר', emoji: '🟡', diff: 1, gold: 600, silver: 300,
    desc: 'גרסה קטנה ומהירה על 5×5.',
    howto: ['לוח 5 עמודות × 5 שורות.', 'ארבעה ברצף מנצחים.', 'משחק קצר — טעות אחת מכרעת.', 'אפשר לשחק גם באלכסון.'],
    scoring: '500 נקודות על ניצחון',
    mount: gravityGame({ cols: 5, rows: 5, win: 4, base: 500 })
  });

  P({
    id: 'board.reversi', cat: 'board', name: 'רוורסי', emoji: '⚫', diff: 3, gold: 800, silver: 400,
    desc: 'הופכים דיסקיות של היריב — מי שיש לו יותר בסוף מנצח.',
    howto: ['לוח 8×8 עם ארבע דיסקיות במרכז.', 'מהלך חוקי חייב להפוך לפחות דיסקית אחת.', 'הדיסקיות ההפוכות הופכות לצבע שלכם.', 'כשהלוח מלא — מי שיש לו יותר מנצח.'],
    scoring: '700 נקודות על ניצחון',
    mount: reversiGame({ size: 8 })
  });

  P({
    id: 'board.reversi6', cat: 'board', name: 'רוורסי מהיר', emoji: '🟤', diff: 2, gold: 700, silver: 350,
    desc: 'רוורסי על לוח 6×6 — סבב קצר.',
    howto: ['לוח 6×6.', 'אותם חוקים כמו רוורסי רגיל.', 'המשחק נגמר מהר יותר.', 'שווה לשמור על הפינות.'],
    scoring: '600 נקודות על ניצחון',
    mount: reversiGame({ size: 6 })
  });

  P({
    id: 'board.checkers', cat: 'board', name: 'דמקה', emoji: '🔴', diff: 3, gold: 800, silver: 400,
    desc: 'דמקה קלאסית 8×8 נגד המחשב.',
    howto: ['כלים נעים באלכסון קדימה.', 'אכילה מדלגת מעל כלי יריב.', 'אכילה נוספת באותו תור ממשיכה אוטומטית.', 'מנצחים כשכל הכלים של היריב נעלמו.'],
    scoring: '700 נקודות על ניצחון',
    mount: checkersGame({ size: 8 })
  });

  P({
    id: 'board.checkers6', cat: 'board', name: 'דמקה מהירה', emoji: '⚪', diff: 2, gold: 700, silver: 350,
    desc: 'דמקה על לוח 6×6 — משחק קצר.',
    howto: ['לוח 6×6 עם פחות כלים.', 'אותם חוקי אכילה.', 'משחק של 3–5 דקות.', 'טעות אחת יכולה להכריע.'],
    scoring: '600 נקודות על ניצחון',
    mount: checkersGame({ size: 6 })
  });

  P({
    id: 'board.nim', cat: 'board', name: 'נים', emoji: '🥢', diff: 2, gold: 600, silver: 300,
    desc: 'שלוש ערימות מקלות — לוקחים 1–3, מי שלוקח אחרון מנצח.',
    howto: ['שלוש ערימות עם מספר מקלות שונה.', 'בכל תור לוקחים 1 עד 3 מקלות מערימה אחת.', 'אסור לקחת משתי ערימות.', 'מי שלוקח את המקל האחרון מנצח.'],
    scoring: '600 נקודות על ניצחון',
    mount: nimGame({ piles: [3, 4, 5] })
  });

  P({
    id: 'board.nim.misere', cat: 'board', name: 'נים הפוך', emoji: '🎋', diff: 3, gold: 700, silver: 350,
    desc: 'אותן ערימות, אבל הפעם מי שלוקח אחרון מפסיד.',
    howto: ['אותם חוקים בדיוק.', 'ההבדל: המקל האחרון הוא הפסד.', 'המחשב משחק לפי האסטרטגיה הנכונה.', 'צריך לכפות עליו לקחת אחרון.'],
    scoring: '650 נקודות על ניצחון',
    mount: nimGame({ piles: [3, 5, 6], misere: true })
  });

  P({
    id: 'board.dots', cat: 'board', name: 'נקודות וקווים', emoji: '🔷', diff: 2, gold: 700, silver: 350,
    desc: 'מחברים נקודות, ומי שסוגר ריבוע זוכה בנקודה ובתור נוסף.',
    howto: ['לוחצים על הקו האפור כדי למתוח אותו.', 'ריבוע שנסגר נצבע בצבע הסגור והתור נמשך.', 'המחשב מושך קווים משלו.', 'מי שסגר יותר ריבועים מנצח.'],
    scoring: '600 נקודות על ניצחון · 20 על כל ריבוע',
    mount: dotsGame({ rows: 5, cols: 5 })
  });

  P({
    id: 'board.dots.big', cat: 'board', name: 'נקודות וקווים גדול', emoji: '🔶', diff: 3, gold: 800, silver: 400,
    desc: 'לוח גדול יותר עם יותר ריבועים לנצח.',
    howto: ['לוח 7×7.', 'אותם חוקים.', 'יותר ריבועים — יותר הזדמנויות.', 'המחשב מנצל ריבועים פתוחים.'],
    scoring: '700 נקודות על ניצחון',
    mount: dotsGame({ rows: 7, cols: 7 })
  });

  P({
    id: 'board.snakes', cat: 'board', name: 'סולמות ונחשים', emoji: '🪜', diff: 1, gold: 600, silver: 300,
    desc: 'מרוץ ל־100 עם סולמות שמקפיצים ונחשים שמפילים.',
    howto: ['מטילים קובייה בתור.', 'סולם מעלה אותך, נחש מוריד.', 'המחשב מטיל אחריכם.', 'מי שמגיע ל־100 ראשון מנצח.'],
    scoring: '550 נקודות על ניצחון',
    mount: raceGame({
      size: 100,
      jumps: { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91, 17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 79 }
    })
  });

  P({
    id: 'board.snakes.short', cat: 'board', name: 'סולמות מהיר', emoji: '🎢', diff: 1, gold: 500, silver: 250,
    desc: 'מסלול קצר של 50 משבצות — סבב של דקה.',
    howto: ['מרוץ ל־50.', 'אותם חוקים.', 'פחות נחשים, יותר סולמות.', 'משחק מהיר לכל גיל.'],
    scoring: '500 נקודות על ניצחון',
    mount: raceGame({ size: 50, jumps: { 3: 11, 8: 26, 14: 22, 21: 38, 30: 42, 17: 7, 27: 9, 34: 19, 45: 33 } })
  });

})();
