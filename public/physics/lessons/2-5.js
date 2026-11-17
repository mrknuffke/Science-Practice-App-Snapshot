/* ============================================================
   LESSON 2-5: COUPLED SYSTEMS & THE ATWOOD MACHINE
   The Atwood rig, built on TB.sim.create (RUNTIME_SPEC 4.3).
   Brief: docs/plans/textbook-sim-briefs.md, "Physics 2-5".

   Two rigs, both with a massless cord and a frictionless pulley, and g = 9.8 N/kg:
   - Two hanging masses: a = (m2 - m1) g / (m1 + m2), T = 2 m1 m2 g / (m1 + m2).
   - A mass on a table with a hanging mass: a = (m2 g - f) / (m1 + m2) while it moves.
     The table block stays at rest when the hanging weight is no bigger than the friction.
   The readouts stay at a dash until the prediction is committed (the sim helper does it).
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const PD = window.PD;
  const { chipGroup } = PD;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));

  const G = 9.8;
  const TRAVEL = 3;        // m the masses can move before the run ends
  const RUN = 6;           // s, the longest run
  const PX_PER_N = 0.45;   // arrow length for one newton, so 50 N is a fixed length

  function initAtwood() {
    const box = $('[data-sim="atwood"]');
    if (!box || !window.TB) return;
    const sl1 = $('#sliderM1', box);
    const sl2 = $('#sliderM2', box);
    const slF = $('#sliderFriction', box);
    const tableOnly = $$('[data-table-only]', box);
    const rigChips = $$('[data-rig]', box);
    const restartBtn = $('[data-restart]', box);
    const w1Tile = $('[data-readout="w1"]', box);

    const m = { rig: 'classic', t: 0, s: 0, v: 0, hist: [[0, 0]], over: false };
    let sim = null;
    let lastStatus = '';

    const M1 = () => Number(sl1.value);
    const M2 = () => Number(sl2.value);
    const FR = () => (m.rig === 'half' ? Number(slF.value) : 0);

    // The acceleration and the cord tension for these settings.
    function dynamics() {
      const m1 = M1(), m2 = M2();
      if (m.rig === 'classic') {
        return { a: ((m2 - m1) * G) / (m1 + m2), tension: (2 * m1 * m2 * G) / (m1 + m2) };
      }
      const push = m2 * G - FR();
      if (push <= 0) return { a: 0, tension: m2 * G };       // the table block stays at rest
      const a = push / (m1 + m2);
      return { a, tension: m1 * a + FR() };
    }

    function step(dt) {
      if (m.over) return;
      const d = dynamics();
      m.v += d.a * dt;
      m.s += m.v * dt;
      m.t += dt;
      if (Math.round(m.t * 60) % 6 === 0) m.hist.push([m.t, Math.abs(m.v)]);
      if (Math.abs(m.s) >= TRAVEL) { m.s = Math.sign(m.s) * TRAVEL; m.over = true; m.hist.push([m.t, Math.abs(m.v)]); sim.hold(); }
      else if (m.t >= RUN - 1e-9) { m.over = true; sim.hold(); }
    }

    function report() {
      const d = dynamics();
      sim.setReadout('w1', (M1() * G).toFixed(1) + ' N');
      sim.setReadout('w2', (M2() * G).toFixed(1) + ' N');
      sim.setReadout('acc', Math.abs(d.a).toFixed(2) + ' m/s²');
      sim.setReadout('tension', d.tension.toFixed(1) + ' N');
      sim.setReadout('vel', Math.abs(m.v).toFixed(2) + ' m/s');
      let s;
      if (m.over) s = ['ok', Math.abs(m.s) >= TRAVEL ? 'The masses reached the end of their travel' : 'The run is over at 6 s'];
      else if (Math.abs(d.a) < 1e-9) s = ['neutral', 'The forces balance. The masses stay at rest'];
      else s = ['neutral', 'The masses are speeding up'];
      if (s[1] !== lastStatus) { lastStatus = s[1]; sim.setStatus(s[0], s[1]); }
    }

    function restart() {
      m.t = 0; m.s = 0; m.v = 0; m.hist = [[0, 0]]; m.over = false;
      sim.release();
      report();
      sim.redraw();
    }

    function setRig(rig) {
      m.rig = rig;
      tableOnly.forEach((el) => { el.hidden = rig !== 'half'; });
      if (w1Tile) w1Tile.hidden = rig === 'half';
      sim.setLabel(rig === 'half'
        ? 'A mass on a table joined by a cord over a pulley at the table edge to a hanging mass, with arrows for the weight, the tension and the friction. Below it, a velocity-time graph of the run.'
        : 'Two masses joined by a cord over a pulley, with arrows for the weight of each mass and the cord tension. Below it, a velocity-time graph of the run.');
      restart();
    }

    // Both rigs draw the weight (down) and the tension (up) of a hanging block.
    function hangingBlock(ctx, env, cx, cy, mass, tension, label) {
      const c = env.colors;
      const w = 28 + 2.4 * mass, h = w;
      ctx.fillStyle = c.accent;
      PD.roundRect(ctx, cx - w / 2, cy - h / 2, w, h, 4); ctx.fill();
      ctx.fillStyle = c.paper;
      ctx.font = env.font(11, 'mono', 600); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(mass + ' kg', cx, cy);
      PD.arrow(ctx, cx - w / 2 + 6, cy + h / 2, cx - w / 2 + 6, cy + h / 2 + mass * G * PX_PER_N, c.bad, 3);
      PD.arrow(ctx, cx + w / 2 - 6, cy - h / 2, cx + w / 2 - 6, cy - h / 2 - tension * PX_PER_N, c.good, 3);
    }

    function drawRig(ctx, env, r) {
      const c = env.colors;
      const d = dynamics();
      const k = Math.max(4, (r.h - 70 - 50) / (2 * TRAVEL));       // pixels for one metre of travel
      if (m.rig === 'classic') {
        const cx = r.w / 2, py = r.y + 30, R = 26;
        const y0 = py + R + 26 + TRAVEL * k + 26;
        ctx.strokeStyle = c.inkMute; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, r.y); ctx.lineTo(cx, py); ctx.stroke();
        ctx.fillStyle = c.card; ctx.strokeStyle = c.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, py, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = c.ink; ctx.beginPath(); ctx.arc(cx, py, 4, 0, Math.PI * 2); ctx.fill();
        const y1 = y0 - m.s * k, y2 = y0 + m.s * k;
        ctx.strokeStyle = c.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx - R, py); ctx.lineTo(cx - R, y1 - (14 + 1.2 * M1())); ctx.moveTo(cx + R, py); ctx.lineTo(cx + R, y2 - (14 + 1.2 * M2())); ctx.stroke();
        hangingBlock(ctx, env, cx - R, y1, M1(), d.tension);
        hangingBlock(ctx, env, cx + R, y2, M2(), d.tension);
      } else {
        const tableY = r.y + Math.round(r.h * 0.34), right = r.w - 70, left = 18;
        const pulleyR = 14, px = right, py = tableY - pulleyR;
        ctx.fillStyle = c.hair; ctx.strokeStyle = c.inkMute; ctx.lineWidth = 2;
        ctx.fillRect(left, tableY, right - left, 8); ctx.strokeRect(left, tableY, right - left, 8);
        ctx.fillRect(left + 20, tableY + 8, 8, 40);
        ctx.fillStyle = c.card; ctx.strokeStyle = c.ink;
        ctx.beginPath(); ctx.arc(px, py, pulleyR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // the table block moves right as the hanging block moves down
        const bw = 28 + 2.4 * M1(), bh = 26;
        const travelPx = (right - left) - 40 - bw - 40;
        const bx = left + 24 + bw / 2 + (m.s / TRAVEL) * travelPx;
        ctx.fillStyle = c.accent;
        PD.roundRect(ctx, bx - bw / 2, tableY - bh, bw, bh, 4); ctx.fill();
        ctx.fillStyle = c.paper; ctx.font = env.font(11, 'mono', 600); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(M1() + ' kg', bx, tableY - bh / 2);
        const yh = py + pulleyR + 40 + m.s * k + 0;
        ctx.strokeStyle = c.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(bx + bw / 2, tableY - bh / 2); ctx.lineTo(px, tableY - bh / 2); ctx.lineTo(px, py - pulleyR); ctx.arc(px, py, pulleyR, -Math.PI / 2, 0); ctx.lineTo(px + pulleyR, yh - (14 + 1.2 * M2())); ctx.stroke();
        hangingBlock(ctx, env, px + pulleyR, yh, M2(), d.tension);
        // on the table block: the tension pulls right and friction pulls left
        PD.arrow(ctx, bx + bw / 2, tableY - bh / 2 - 8, bx + bw / 2 + d.tension * PX_PER_N, tableY - bh / 2 - 8, c.good, 3);
        const fr = d.a > 0 ? FR() : Math.min(FR(), M2() * G);
        if (fr > 0.5) PD.arrow(ctx, bx - bw / 2, tableY - bh / 2 - 8, bx - bw / 2 - fr * PX_PER_N, tableY - bh / 2 - 8, c.warn, 3);
      }
      PD.line(ctx, [[10, r.y + r.h - 14], [10 + 50 * PX_PER_N, r.y + r.h - 14]], c.inkSoft, 3);
      PD.label(ctx, env, '50 N', 10 + 25 * PX_PER_N, r.y + r.h - 28, { align: 'center', color: c.inkSoft, size: 11 });
    }

    function drawGraph(ctx, env, r) {
      const c = env.colors;
      const a = Math.abs(dynamics().a);
      const vEnd = a > 0 ? Math.min(a * RUN, Math.sqrt(2 * a * TRAVEL)) : 1;
      const top = Math.max(1, Math.ceil(vEnd * 1.15));
      const g = PD.graph(ctx, env, r, { xmin: 0, xmax: RUN, ymin: 0, ymax: top, xlabel: 'Time t (s)', ylabel: 'Speed (m/s)', xticks: 6, yticks: 4 });
      PD.line(ctx, m.hist.map((h) => [g.px(h[0]), g.py(h[1])]), c.cool, 3);
      ctx.fillStyle = c.cool;
      ctx.beginPath(); ctx.arc(g.px(m.t), g.py(Math.abs(m.v)), 5, 0, Math.PI * 2); ctx.fill();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 1,
      init() {
        // a short run at the start masses, so the first frame and a print show the graph
        for (let i = 0; i < 90; i++) step(1 / 60);
        report();
      },
      onUnlock() { restart(); },
      update(dt) { step(dt); report(); },
      draw(ctx, env) {
        const rigH = Math.round(env.h * 0.58);
        drawRig(ctx, env, { x: 0, y: 0, w: env.w, h: rigH });
        drawGraph(ctx, env, { x: 0, y: rigH + 6, w: env.w, h: env.h - rigH - 6 });
      },
      record() {
        const d = dynamics();
        return {
          'Rig': m.rig === 'classic' ? 'Hanging' : 'Table',
          'Mass 1 (kg)': M1(),
          'Mass 2 (kg)': M2(),
          'Acceleration (m/s²)': Math.abs(d.a).toFixed(2),
          'Tension (N)': d.tension.toFixed(1)
        };
      }
    });

    chipGroup(rigChips, 'rig', setRig);
    [sl1, sl2, slF].forEach((s) => s.addEventListener('input', restart));
    restartBtn.addEventListener('click', restart);
  }

  document.addEventListener('DOMContentLoaded', initAtwood);
})();
