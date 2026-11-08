/* ===== סדנת בישול · מנוע הכנה אמיתי (גרירה, מריחה, גלגול, חיתוך, תזמון) ===== */
(function () {
  const mk = (css, html) => { const n = document.createElement('div'); if (html != null) n.innerHTML = html; n.style.cssText = css; return n; };

  function cookSim(def) {
    return function (stage, api) {
      stage.innerHTML = '';
      let score = 0, idx = 0, mistakes = 0, busy = false;

      const root = mk('display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;touch-action:none;-webkit-user-select:none;user-select:none');
      const hud = el('div', 'hud');
      const hint = el('div', 'g-title');
      hint.style.cssText = 'min-height:22px;text-align:center;font-size:15px;opacity:.9';
      const station = mk('position:relative;width:min(84vw,330px);height:min(84vw,330px);border-radius:26px;background:radial-gradient(circle at 50% 40%,rgba(255,255,255,.11),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.16);overflow:hidden;touch-action:none;flex:none');
      const tray = mk('display:flex;gap:12px;justify-content:center;flex-wrap:wrap;min-height:76px;align-items:center');
      root.append(hud, hint, station, tray);
      stage.appendChild(root);

      const paintHud = () => {
        hud.innerHTML = `<span class="pill">שלב <b>${Math.min(idx + 1, def.steps.length)}</b>/${def.steps.length}</span><span class="pill">🏆 <b>${score}</b></span>`;
      };
      paintHud();

      const addLayer = (txt, o = {}) => {
        const n = mk(`position:absolute;left:${(o.x == null ? .5 : o.x) * 100}%;top:${(o.y == null ? .5 : o.y) * 100}%;transform:translate(-50%,-50%) scale(.5) rotate(${o.rot || 0}deg);font-size:${o.size || 54}px;opacity:0;transition:.35s;pointer-events:none;z-index:${o.z || 1}`, txt);
        station.appendChild(n);
        requestAnimationFrame(() => { n.style.opacity = 1; n.style.transform = `translate(-50%,-50%) scale(1) rotate(${o.rot || 0}deg)`; });
        return n;
      };

      const shake = () => {
        station.style.transition = 'transform .08s';
        station.style.transform = 'translateX(-6px)';
        setTimeout(() => { station.style.transform = 'translateX(6px)'; }, 80);
        setTimeout(() => { station.style.transform = 'translateX(0)'; }, 160);
      };

      const reward = (pts) => { score += Math.max(20, Math.round(pts)); api.setScore(score); paintHud(); api.sfx('win'); };

      const finishDish = () => {
        if (def.final) addLayer(def.final, { size: 92, z: 9 });
        tray.innerHTML = '';
        hint.textContent = `${def.name} מוכן! 🎉`;
        api.sfx('win');
        api.after(700, () => api.finish(score + Math.max(0, 200 - mistakes * 40), { detail: `${def.name} · ${mistakes} טעויות` }));
      };

      const next = () => { idx++; busy = false; if (idx >= def.steps.length) return finishDish(); run(); };

      /* ---- גרירה ---- */
      function dragStep(s) {
        const chip = mk('display:flex;align-items:center;gap:6px;padding:12px 18px;border-radius:18px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.22);font-weight:700;font-size:15px;cursor:grab;touch-action:none',
          `<span style="font-size:26px">${s.item.emoji}</span><span>${s.item.label || ''}</span>`);
        tray.appendChild(chip);
        let dragging = false, ghost = null;
        const move = (e) => { if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; } };
        const down = (e) => {
          if (busy) return;
          e.preventDefault();
          dragging = true; busy = true;
          chip.style.opacity = .4;
          ghost = mk('position:fixed;font-size:44px;pointer-events:none;z-index:9999;transform:translate(-50%,-50%)');
          ghost.textContent = s.item.emoji;
          document.body.appendChild(ghost);
          move(e);
        };
        const up = (e) => {
          if (!dragging) return;
          dragging = false; busy = false;
          if (ghost) { ghost.remove(); ghost = null; }
          chip.style.opacity = 1;
          const r = station.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          const t = s.drop || { x: .5, y: .5, r: .32 };
          const d = Math.hypot(x - t.x, y - t.y);
          const r0 = t.r || .32;
          if (d <= r0 + .14) {
            chip.remove();
            addLayer(s.visual || s.item.emoji, { size: s.size, x: t.x, y: t.y, z: s.z, rot: s.rot });
            reward(d <= r0 ? (s.points || 100) : Math.round((s.points || 100) * .6));
            hint.textContent = d <= r0 ? (s.ok || 'מעולה!') : 'קרוב מספיק — אבל אפשר מדויק יותר';
            api.after(420, next);
          } else {
            mistakes++; api.sfx('bad'); shake();
            hint.textContent = s.fail || 'כמעט — הניחו במרכז הכלי';
          }
        };
        chip.addEventListener('pointerdown', down);
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        api.onCleanup(() => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          if (ghost) ghost.remove();
        });
      }

      /* ---- מריחה ---- */
      function paintStep(s) {
        const cols = 8, total = cols * cols;
        const grid = mk(`position:absolute;inset:0;display:grid;grid-template-columns:repeat(${cols},1fr);touch-action:none;z-index:2`);
        const cells = [];
        for (let i = 0; i < total; i++) {
          const c = mk('background:transparent;transition:background .18s');
          grid.appendChild(c); cells.push(c);
        }
        station.appendChild(grid);
        let filled = 0, finished = false;
        const paint = (e) => {
          if (finished) return;
          const r = grid.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          if (x < 0 || x > 1 || y < 0 || y > 1) return;
          const cx = Math.floor(x * cols), cy = Math.floor(y * cols);
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const px = cx + dx, py = cy + dy;
            if (px < 0 || py < 0 || px >= cols || py >= cols) continue;
            const cell = cells[py * cols + px];
            if (cell.dataset.f) continue;
            cell.dataset.f = '1';
            cell.style.background = s.color || 'rgba(255,140,140,.6)';
            filled++;
          }
          const pct = filled / total;
          hint.textContent = `${s.label || 'מורחים'} · ${Math.round(pct * 100)}%`;
          if (pct >= (s.coverage || .55)) {
            finished = true;
            reward(s.points || 130);
            hint.textContent = s.ok || 'מיושר ושטוח 👌';
            api.after(200, () => grid.remove());
            api.after(320, next);
          }
        };
        grid.addEventListener('pointerdown', (e) => { paint(e); grid.dataset.down = '1'; });
        grid.addEventListener('pointermove', (e) => { if (grid.dataset.down === '1') paint(e); });
        const release = () => { grid.dataset.down = '0'; };
        window.addEventListener('pointerup', release);
        api.onCleanup(() => window.removeEventListener('pointerup', release));
      }

      /* ---- גרירה מהירה (גלגול / חיתוך / קיפול) ---- */
      function swipeStep(s) {
        const need = s.count || 1;
        let done = 0, start = null;
        const pad = mk('position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:70px;touch-action:none;z-index:3');
        pad.textContent = s.icon || '✋';
        station.appendChild(pad);
        const down = (e) => { start = { x: e.clientX, y: e.clientY }; };
        const up = (e) => {
          if (!start) return;
          const dx = e.clientX - start.x, dy = e.clientY - start.y;
          start = null;
          const okDir = (s.dir === 'up' && dy < -50 && Math.abs(dy) > Math.abs(dx))
            || (s.dir === 'down' && dy > 50 && Math.abs(dy) > Math.abs(dx))
            || (s.dir === 'right' && dx > 50 && Math.abs(dx) > Math.abs(dy))
            || (s.dir === 'left' && dx < -50 && Math.abs(dx) > Math.abs(dy));
          if (!okDir) { hint.textContent = s.fail || 'גררו בכיוון הנכון'; api.sfx('tap'); return; }
          done++;
          api.sfx('pop');
          hint.textContent = `${s.label || 'מבצע'} · ${done}/${need}`;
          reward((s.points || 120) / need);
          if (done >= need) {
            if (s.visual) addLayer(s.visual, { size: s.size || 70, z: 5 });
            pad.remove();
            api.after(320, next);
          }
        };
        pad.addEventListener('pointerdown', down);
        window.addEventListener('pointerup', up);
        api.onCleanup(() => window.removeEventListener('pointerup', up));
      }

      /* ---- החזקה ---- */
      function holdStep(s) {
        const ms = s.ms || 1400;
        const wrap = mk('position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:3');
        const btn = mk('width:150px;height:150px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:64px;background:rgba(255,255,255,.10);border:3px solid rgba(255,255,255,.25);touch-action:none;position:relative;overflow:hidden');
        btn.textContent = s.icon || '👆';
        const fill = mk('position:absolute;left:0;bottom:0;width:100%;height:0%;background:rgba(120,255,180,.35);transition:height .1s');
        btn.appendChild(fill);
        wrap.appendChild(btn); station.appendChild(wrap);
        let t0 = 0, raf = null, ok = false;
        const tick = () => {
          const p = Math.min(1, (Date.now() - t0) / ms);
          fill.style.height = (p * 100) + '%';
          hint.textContent = `${s.label || 'מחזיקים'} · ${Math.round(p * 100)}%`;
          if (p >= 1) { finish(); return; }
          raf = requestAnimationFrame(tick);
        };
        const finish = () => {
          if (ok) return; ok = true;
          cancelAnimationFrame(raf);
          reward(s.points || 140);
          if (s.visual) addLayer(s.visual, { size: s.size || 64, z: 4 });
          wrap.remove();
          hint.textContent = s.ok || 'מושלם!';
          api.after(320, next);
        };
        const down = (e) => { e.preventDefault(); t0 = Date.now(); tick(); };
        const up = () => {
          if (ok) return;
          cancelAnimationFrame(raf);
          fill.style.height = '0%';
          if (t0) { hint.textContent = s.fail || 'החזיקו עד הסוף בלי לשחרר'; t0 = 0; }
        };
        btn.addEventListener('pointerdown', down);
        window.addEventListener('pointerup', up);
        api.onCleanup(() => { cancelAnimationFrame(raf); window.removeEventListener('pointerup', up); });
      }

      /* ---- תזמון ---- */
      function timingStep(s) {
        const wrap = mk('display:flex;flex-direction:column;gap:12px;align-items:center;width:min(84vw,330px)');
        const bar = mk('position:relative;width:100%;height:22px;border-radius:12px;background:rgba(255,255,255,.12);overflow:hidden');
        const zone = mk('position:absolute;top:0;bottom:0;left:40%;width:20%;background:rgba(110,240,160,.35)');
        const mark = mk('position:absolute;top:-4px;bottom:-4px;width:5px;border-radius:3px;background:#fff;left:0');
        bar.append(zone, mark);
        const go = el('button', 'btn', s.button || 'עצרו בזמן!');
        wrap.append(bar, go); tray.appendChild(wrap);
        let pos = 0, dir = 1, iv = null;
        iv = setInterval(() => {
          pos += dir * 2.4;
          if (pos > 100) { pos = 100; dir = -1; }
          if (pos < 0) { pos = 0; dir = 1; }
          mark.style.left = pos + '%';
        }, 16);
        api.onCleanup(() => clearInterval(iv));
        go.onclick = () => {
          clearInterval(iv);
          const d = Math.abs(pos - 50);
          if (d <= 8) reward(180);
          else if (d <= 18) reward(120);
          else { reward(40); mistakes++; api.sfx('bad'); }
          if (s.visual) addLayer(s.visual, { size: s.size || 64, z: 4 });
          tray.innerHTML = '';
          hint.textContent = d <= 8 ? 'בול! 🔥' : d <= 18 ? 'טוב מאוד' : 'קצת נשרף…';
          api.after(400, next);
        };
      }

      const run = () => {
        if (busy) return;
        const s = def.steps[idx];
        tray.innerHTML = '';
        hint.textContent = s.hint || '';
        paintHud();
        if (s.type === 'drag') dragStep(s);
        else if (s.type === 'paint') paintStep(s);
        else if (s.type === 'swipe') swipeStep(s);
        else if (s.type === 'hold') holdStep(s);
        else if (s.type === 'timing') timingStep(s);
        else next();
      };

      run();
    };
  }

  window.cookSim = cookSim;
})();
