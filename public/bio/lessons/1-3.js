/* ============================================================
   Lesson 1-3: what does the kidney change to keep the water in your blood steady?
   Built on TB.sim.create (docs/textbook/RUNTIME_SPEC.md, section 4.3).
   Brief: docs/plans/textbook-sim-briefs.md, "Bio 1-3".

   The model is a closed loop with three links:
     blood concentration  ->  ADH level  ->  urine flow and urine concentration
   and the urine, in turn, changes how much water the blood keeps.

   The curves are fitted so that the sweat run passes through the lesson's data
   table at 0, 30, 60 and 90 minutes: blood 288, 292, 297, 304 mOsm/kg; ADH 1.8,
   3.4, 5.8, 8.2 pg/mL; urine flow 1.4, 0.8, 0.4, 0.25 mL/min; urine concentration
   380, 620, 950, 1180 mOsm/L. The clock stops at each mark so a student records
   the table's own numbers. Time runs 3 simulated minutes per real second.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const MIN_PER_SECOND = 3;
  const TAU_ADH = 2;                 // minutes for ADH to follow blood concentration
  const URINE_BASE = 1.4;            // mL/min at baseline
  const STEPS_PER_MARK = 600;        // 30 min at 0.05 min per step
  const SWEAT_STEPS = 1800;          // the 90 min run
  const DRINK_RATE = 0.2;            // liters absorbed per minute
  const DRINK_MAX = 2;               // at most 2 L waiting to be absorbed, however often Drink is pressed
  const BAND_LOW = 285;
  const BAND_HIGH = 295;

  // water the body is short of (liters, kidneys included) -> blood concentration (mOsm/kg)
  const FX = [[-1.5, 274.65], [0, 288], [0.4415, 292], [0.9176, 297], [1.3353, 304], [2.5, 323.6]];
  // blood concentration -> ADH the pituitary releases (pg/mL)
  const GY = [[272, 0.3], [279, 0.5], [288, 1.8], [292, 3.514], [297, 5.964], [304, 8.361], [320, 11.5]];
  // ADH -> urine flow (mL/min) and urine concentration (mOsm/L)
  const HU = [[0.3, 10], [1.0, 3.0], [1.8, 1.4], [3.4, 0.8], [5.8, 0.4], [8.2, 0.25], [10, 0.22]];
  const HK = [[0.3, 90], [1.0, 250], [1.8, 380], [3.4, 620], [5.8, 950], [8.2, 1180], [10, 1200]];

  const box = document.querySelector('[data-sim="osmo"]');
  if (!box || !window.TB) return;

  const sweatBtn = box.querySelector('[data-sweat]');
  const drinkBtn = box.querySelector('[data-drink]');
  const restartBtn = box.querySelector('[data-restart]');

  const state = { deficit: 0, adh: 1.8, clock: 0, sweatSteps: -1, drinkLeft: 0 };
  let sim = null;
  let lastStatus = '';

  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

  function interp(pts, x) {
    let i = 0;
    if (x >= pts[pts.length - 1][0]) i = pts.length - 2;
    else if (x > pts[0][0]) while (pts[i + 1][0] < x) i++;
    const a = pts[i], b = pts[i + 1];
    return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]);
  }

  const blood = () => interp(FX, state.deficit);
  const flow = () => interp(HU, state.adh);
  const urineConc = () => interp(HK, state.adh);

  function sweatRate(steps) {          // liters per minute: 0.45, 0.50, 0.45 L in each 30 min
    if (steps < 0 || steps >= SWEAT_STEPS) return 0;
    if (steps < STEPS_PER_MARK) return 0.45 / 30;
    if (steps < 2 * STEPS_PER_MARK) return 0.5 / 30;
    return 0.45 / 30;
  }

  function step(dt) {
    const s = state;
    const c = blood();
    s.adh += (interp(GY, c) - s.adh) * (1 - Math.exp(-dt / TAU_ADH));
    const u = flow();
    let drunk = 0;
    if (s.drinkLeft > 0) { drunk = Math.min(s.drinkLeft, DRINK_RATE * dt); s.drinkLeft -= drunk; }
    s.deficit += sweatRate(s.sweatSteps) * dt + ((u - URINE_BASE) / 1000) * dt - drunk;
    // the curves are measured between these ends; past them a value could fall below zero
    s.deficit = clamp(s.deficit, FX[0][0], FX[FX.length - 1][0]);
    s.clock += dt;
    if (s.sweatSteps >= 0 && s.sweatSteps < SWEAT_STEPS) {
      s.sweatSteps++;
      if (s.sweatSteps % STEPS_PER_MARK === 0) sim.hold();   // the clock stops exactly on the mark
    }
  }

  function restart() {
    state.deficit = 0; state.adh = 1.8; state.clock = 0; state.sweatSteps = -1; state.drinkLeft = 0;
  }

  function setButtons() {
    const running = state.sweatSteps >= 0 && state.sweatSteps < SWEAT_STEPS;
    if (sweatBtn) sweatBtn.disabled = running;
  }

  function statusText() {
    const mark = Math.round(state.sweatSteps / 20);
    if (sim.held) return ['ok', 'Stopped at ' + mark + ' min. Press Record, then Play.'];
    const c = blood();
    if (c > BAND_HIGH) return ['warn', 'Blood is too concentrated'];
    if (c < BAND_LOW) return ['warn', 'Blood is too dilute'];
    return ['ok', 'Blood is in the normal range'];
  }

  function report() {
    sim.setReadout('time', Math.floor(state.clock + 0.0001) + ' min');
    sim.setReadout('blood', Math.round(blood()) + ' mOsm/kg');
    sim.setReadout('adh', state.adh.toFixed(1) + ' pg/mL');
    sim.setReadout('flow', flow().toFixed(2) + ' mL/min');
    sim.setReadout('urine', Math.round(urineConc()) + ' mOsm/L');
    const st = statusText();
    if (st[1] !== lastStatus) { lastStatus = st[1]; sim.setStatus(st[0], st[1]); }
    setButtons();
  }

  /* ---------- layout ---------- */
  function layout(env) {
    const narrow = env.w < 600;
    const pad = 10;
    const L = { narrow: narrow };
    if (!narrow) {
      L.dg = { x: pad, y: pad, w: env.w * 0.62 - pad, h: env.h - 2 * pad };
      L.mt = { x: env.w * 0.66, y: pad, w: env.w * 0.34 - pad, h: env.h - 2 * pad };
    } else {
      L.dg = { x: pad, y: pad, w: env.w - 2 * pad, h: env.h * 0.64 - pad };
      L.mt = { x: pad, y: env.h * 0.66, w: env.w - 2 * pad, h: env.h * 0.34 - pad };
    }
    return L;
  }

  /* ---------- drawing helpers ---------- */
  function drawLabel(ctx, env, text, x, y, align, color) {
    ctx.font = env.font(12, 'mono', 600);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const w = ctx.measureText(text).width;
    const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.fillStyle = color || env.colors.inkSoft;
    ctx.fillText(text, Math.max(3, Math.min(env.w - 3 - w, left)), y);
    return w;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function arrow(ctx, env, x1, y1, x2, y2, color) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 8 * Math.cos(a - 0.45), y2 - 8 * Math.sin(a - 0.45));
    ctx.lineTo(x2 - 8 * Math.cos(a + 0.45), y2 - 8 * Math.sin(a + 0.45));
    ctx.closePath(); ctx.fill();
  }

  // a point a fraction s of the way along a polyline
  function along(path, s) {
    let total = 0;
    const lens = [];
    for (let i = 1; i < path.length; i++) {
      const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
      lens.push(l); total += l;
    }
    let d = s * total;
    for (let i = 0; i < lens.length; i++) {
      if (d <= lens[i] || i === lens.length - 1) {
        const k = lens[i] ? d / lens[i] : 0;
        return [path[i][0] + (path[i + 1][0] - path[i][0]) * k, path[i][1] + (path[i + 1][1] - path[i][1]) * k];
      }
      d -= lens[i];
    }
    return path[path.length - 1];
  }

  function stream(ctx, path, count, speed, t, radius, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < count; i++) {
      const p = along(path, (t * speed + i / count) % 1);
      ctx.beginPath(); ctx.arc(p[0], p[1], radius, 0, Math.PI * 2); ctx.fill();
    }
  }

  // urine colour: pale water at low concentration, amber at high
  function urineFill(ctx, c, conc, drawPath) {
    const k = clamp((conc - 100) / 1100, 0, 1);
    ctx.globalAlpha = 0.55; ctx.fillStyle = c.water; drawPath(); ctx.fill();
    ctx.globalAlpha = 0.15 + 0.85 * k; ctx.fillStyle = c.atp; drawPath(); ctx.fill();
    ctx.globalAlpha = 1;
  }

  /* ---------- the body diagram ---------- */
  function drawDiagram(ctx, env, L) {
    const c = env.colors;
    const D = L.dg;
    const t = env.time;
    const bw = 108, bh = 26;
    const x0 = D.x + 6;
    const hypo = { x: x0, y: D.y + D.h * 0.03 };
    const pit = { x: x0, y: D.y + D.h * 0.25 };
    const yb = D.y + D.h * 0.5;
    const bandL = D.x + 6, bandR = D.x + D.w - 6;
    const px = x0 + bw / 2;
    const kid = { x: D.x + D.w * 0.5, y: D.y + D.h * 0.64, w: 84, h: 34 };
    const k1 = kid.x + kid.w * 0.28, k2 = kid.x + kid.w * 0.72;
    const bld = { x: kid.x + kid.w / 2 - 42, y: D.y + D.h * 0.88, w: 84, h: 26 };
    const ux = kid.x + kid.w / 2;

    // the bloodstream
    ctx.fillStyle = c.card; ctx.strokeStyle = c.thermal; ctx.lineWidth = 2;
    roundRect(ctx, bandL, yb - 8, bandR - bandL, 16, 8); ctx.fill(); ctx.stroke();
    drawLabel(ctx, env, 'Bloodstream', bandR - 4, yb - 20, 'right', c.inkSoft);

    // boxes
    const boxes = [
      { b: hypo, w: bw, h: bh, text: 'Hypothalamus' },
      { b: pit, w: bw, h: bh, text: 'Pituitary' },
      { b: kid, w: kid.w, h: kid.h, text: 'Kidney' },
      { b: bld, w: bld.w, h: bld.h, text: 'Bladder' }
    ];
    ctx.lineWidth = 2;
    boxes.forEach((o) => {
      ctx.fillStyle = c.card; ctx.strokeStyle = c.inkMute;
      roundRect(ctx, o.b.x, o.b.y, o.w, o.h, 8); ctx.fill(); ctx.stroke();
      drawLabel(ctx, env, o.text, o.b.x + o.w / 2, o.b.y + o.h / 2 + 0.5, 'center', c.ink);
    });

    // arrows: signal down, ADH into blood, blood to kidney, water back, urine to bladder
    const high = blood() > BAND_HIGH - 2;
    arrow(ctx, env, px, hypo.y + bh, px, pit.y, high ? c.accent : c.hair);
    arrow(ctx, env, px, pit.y + bh, px, yb - 9, c.hormone);
    arrow(ctx, env, k1, yb + 9, k1, kid.y, c.thermal);
    arrow(ctx, env, k2, kid.y, k2, yb + 10, c.water);
    arrow(ctx, env, ux, kid.y + kid.h, ux, bld.y, c.atp);

    // ADH leaves the pituitary, rides the blood, and reaches the kidney
    const adhPath = [[px, pit.y + bh], [px, yb], [k1, yb], [k1, kid.y + 4]];
    stream(ctx, adhPath, Math.max(1, Math.round(state.adh * 1.3)), 0.2, t, 3.6, c.hormone);

    // water the kidney returns to the blood: more when ADH is high
    const back = clamp((state.adh - 1.8) / 6.4, 0, 1);
    stream(ctx, [[k2, kid.y + 2], [k2, yb + 2]], Math.round(2 + 6 * back), 0.28, t, 3, c.water);

    // urine to the bladder: a few large drops when dilute and plentiful, a thin dark trickle when not
    const u = flow();
    const n = Math.max(1, Math.round(u * 1.1));
    for (let i = 0; i < n; i++) {
      const p = along([[ux, kid.y + kid.h + 3], [ux, bld.y - 2]], (t * 0.3 + i / n) % 1);
      urineFill(ctx, c, urineConc(), () => { ctx.beginPath(); ctx.arc(p[0], p[1], 3.2, 0, Math.PI * 2); });
    }

    // sweat leaves the blood, drink enters it
    const sweating = state.sweatSteps >= 0 && state.sweatSteps < SWEAT_STEPS && !sim.held;
    const sx = bandL + 40;
    if (sweating) {
      stream(ctx, [[sx, yb + 8], [sx - 8, yb + 46]], 4, 0.45, t, 3.2, c.water);
      drawLabel(ctx, env, 'Sweat', sx - 18, yb + 62, 'left', c.inkSoft);
    }
    if (state.drinkLeft > 0.001) {
      stream(ctx, [[sx, yb + 46], [sx, yb + 8]], 4, 0.45, t, 3.2, c.water);
      drawLabel(ctx, env, 'Drink', sx - 18, yb + 62, 'left', c.inkSoft);
    }
  }

  /* ---------- the three meters ---------- */
  function drawMeters(ctx, env, L) {
    const c = env.colors;
    const M = L.mt;
    const colW = M.w / 3;
    const top = M.y + 8;
    const gh = M.h - 8 - 30;
    const gw = Math.min(34, colW * 0.5);
    const cx = (i) => M.x + colW * (i + 0.5);

    const frame = (i) => {
      ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1.5;
      roundRect(ctx, cx(i) - gw / 2, top, gw, gh, 6); ctx.fill(); ctx.stroke();
    };

    // 1. blood concentration, with the normal band
    frame(0);
    const lo = 270, hi = 320;
    const yv = (v) => top + gh - ((clamp(v, lo, hi) - lo) / (hi - lo)) * gh;
    ctx.globalAlpha = 0.25; ctx.fillStyle = c.accent;
    ctx.fillRect(cx(0) - gw / 2 + 1, yv(BAND_HIGH), gw - 2, yv(BAND_LOW) - yv(BAND_HIGH));
    ctx.globalAlpha = 1;
    const cb = blood();
    ctx.fillStyle = c.ink;
    roundRect(ctx, cx(0) - gw / 2 + 3, yv(cb) - 3, gw - 6, 6, 3); ctx.fill();
    drawLabel(ctx, env, 'Blood', cx(0), top + gh + 16, 'center', c.inkSoft);

    // 2. ADH
    frame(1);
    const af = clamp(state.adh / 12, 0, 1);
    ctx.fillStyle = c.hormone;
    roundRect(ctx, cx(1) - gw / 2 + 3, top + gh - 3 - (gh - 6) * af, gw - 6, Math.max(2, (gh - 6) * af), 4); ctx.fill();
    drawLabel(ctx, env, 'ADH', cx(1), top + gh + 16, 'center', c.inkSoft);

    // 3. urine sample: height is the flow, colour is the concentration
    frame(2);
    const uf = clamp(flow() / 10, 0.04, 1);
    urineFill(ctx, c, urineConc(), () => roundRect(ctx, cx(2) - gw / 2 + 3, top + gh - 3 - (gh - 6) * uf, gw - 6, (gh - 6) * uf, 4));
    drawLabel(ctx, env, 'Urine', cx(2), top + gh + 16, 'center', c.inkSoft);
  }

  function draw(ctx, env) {
    const L = layout(env);
    drawDiagram(ctx, env, L);
    drawMeters(ctx, env, L);
  }

  /* ---------- the sim ---------- */
  sim = window.TB.sim.create(box, {
    kind: 'canvas',
    loop: true,
    tokens: ['glucose', 'oxygen', 'co2', 'water', 'atp', 'thermal', 'hormone'],
    init() {
      restart();
      report();
    },
    stepSeconds: 10,   // under reduced motion one Step is 30 simulated minutes, and it stops at each mark
    update(dt) {
      step(dt * MIN_PER_SECOND);
      report();
    },
    draw: draw,
    record() {
      return {
        'Time (min)': Math.floor(state.clock + 0.0001),
        'Blood (mOsm/kg)': Math.round(blood()),
        'ADH (pg/mL)': state.adh.toFixed(1),
        'Urine flow (mL/min)': flow().toFixed(2)
      };
    }
  });

  if (sweatBtn) sweatBtn.addEventListener('click', () => {
    if (state.sweatSteps >= 0 && state.sweatSteps < SWEAT_STEPS) return;
    state.sweatSteps = 0;
    state.clock = 0;
    sim.release();
    report();
    sim.redraw();
  });
  // Drinking after a stop goes on by itself, so step 2 of Try this needs no extra press.
  if (drinkBtn) drinkBtn.addEventListener('click', () => {
    state.drinkLeft = Math.min(DRINK_MAX, state.drinkLeft + 1);
    sim.release();
    sim.redraw();
  });
  if (restartBtn) restartBtn.addEventListener('click', () => {
    restart();
    sim.release();
    report();
    sim.redraw();
  });
})();
