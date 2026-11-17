/* ============================================================
   Lesson 1-4: how does your body keep blood sugar steady after a meal and between meals?
   Built on TB.sim.create (docs/textbook/RUNTIME_SPEC.md, section 4.3).
   Brief: docs/plans/textbook-sim-briefs.md, "Bio 1-4".

   The model is a feedback loop that runs over time:
     blood sugar -> insulin (above 100 mg/dL) and glucagon (below 80 mg/dL)
     insulin -> glucose leaves the blood into the liver store and the muscle
     glucagon -> the liver store releases glucose into the blood
   The glucose that leaves the blood for the liver is the glucose the liver store gains.

   The constants are fitted so that a meal passes through the lesson's data table at
   0, 30, 60 and 120 minutes: Healthy is Patient A and Type 1 is Patient C. The table
   has no Type 2 patient. Type 2 is fitted to invented values (130 fasting, 205, 230
   and 212 mg/dL at 30, 60 and 120 min) from the same meal as Healthy, with high
   insulin that clears little glucose, so the liver store grows less than Healthy's
   (David, session 4R). The clock stops at 120 min so a student records the
   numbers. Time runs 5 simulated minutes per real second. Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const DT = 1 / 12;                 // simulated minutes per step: 5 min per real second
  const SET_INSULIN = 100;           // insulin is released above this (mg/dL)
  const SET_GLUCAGON = 80;           // glucagon is released below this (mg/dL)
  const BAND_LOW = 70;
  const BAND_HIGH = 110;
  const GREF = 60;
  const TAU_GLUCAGON = 10;           // minutes for glucagon to follow blood sugar
  const MARK = 120;                  // the clock stops here
  const WINDOW = 150;                // the graph shows this many minutes
  const SKIP_DRAIN = 0.35;           // mg/dL per minute used by light activity while skipping a meal
  const LIVER_SHARE = 0.4;           // the liver's share of insulin-driven uptake; the muscle takes the rest
  const STORE_UNIT = 5;             // mg/dL of blood sugar per 1 percent of liver store
  const GLUCAGON_RELEASE = 1.0;      // mg/dL per minute for each unit of glucagon above normal
  const START_STORE = 60;            // percent

  // g0: fasting blood sugar; ibase: insulin when fasting; gi: how strongly insulin follows blood sugar.
  // rtot and tau shape the meal's arrival, ku is the insulin-driven clearance, ti is how fast insulin follows. All fitted.
  const BODIES = [
    { name: 'Healthy', g0: 88, ibase: 1.0, gi: 1.60316, ku: 0.01825, kn: 0.004, rtot: 127.47665, tau: 15.9476, ti: 30.1686 },
    { name: 'Type 1', g0: 165, ibase: 0.1, gi: 0, ku: 0.01115, kn: 0.004, rtot: 148.48839, tau: 16.55283, ti: 10 },
    { name: 'Type 2', g0: 130, ibase: 2.0, gi: 3.0, ku: 0.00006898, kn: 0.004, rtot: 128.25513, tau: 14.19547, ti: 5 }
  ];

  const box = document.querySelector('[data-sim="glucose"]');
  if (!box || !window.TB) return;

  const condChips = Array.prototype.slice.call(box.querySelectorAll('[data-cond]'));
  const eatBtn = box.querySelector('[data-eat]');
  const skipBtn = box.querySelector('[data-skip]');
  const restartBtn = box.querySelector('[data-restart]');

  const s = { cond: 0, g: 0, ins: 1, glu: 0.8, store: START_STORE, run: null, t: 0, history: [], peak: 0, checked: false, insMax: 0, at120: null, uptakeLiver: 0, uptakeMuscle: 0, release: 0, absorb: 0, nextSample: 0 };
  let sim = null;
  let lastStatus = '';

  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const body = () => BODIES[s.cond];
  const insulinTarget = (b, g) => b.ibase + b.gi * Math.max(0, g - SET_INSULIN) / 50;
  const fasting = (b) => insulinTarget(b, b.g0);
  const glucagonTarget = (g) => 0.8 + clamp((SET_GLUCAGON - g) / 15, 0, 2.2) - 0.5 * clamp((g - SET_INSULIN) / 60, 0, 1);
  const level = (v, low, high) => (v < low ? 'low' : v < high ? 'normal' : 'high');
  const insulinWord = (v) => level(v, 0.5, 3);
  const glucagonWord = (v) => level(v, 0.7, 1.5);

  /* ---------- the model ---------- */
  function step() {
    const b = body();
    const t = s.t;
    const meal = s.run === 'meal' ? b.rtot * (t / (b.tau * b.tau)) * Math.exp(-t / b.tau) : 0;
    const drain = s.run === 'skip' ? SKIP_DRAIN : 0;
    s.ins += (insulinTarget(b, s.g) - s.ins) * DT / b.ti;
    s.glu += (glucagonTarget(s.g) - s.glu) * DT / TAU_GLUCAGON;
    const i0 = fasting(b);
    const baseInflow = (b.kn + b.ku * i0) * (b.g0 - GREF);
    const cleared = (b.kn + b.ku * s.ins) * (s.g - GREF);
    const released = GLUCAGON_RELEASE * Math.max(0, s.glu - 0.8) * Math.min(1, s.store / 10);
    // the glucose the liver gains from insulin is the glucose that left the blood for it
    const toLiver = LIVER_SHARE * b.ku * Math.max(0, s.ins - i0) * (s.g - GREF);
    const toMuscle = b.ku * Math.max(0, s.ins - i0) * (s.g - GREF) - toLiver;
    s.g += (meal + baseInflow + released - cleared - drain) * DT;
    s.store = clamp(s.store + (toLiver - released) * DT / STORE_UNIT, 0, 100);
    s.uptakeLiver = toLiver; s.uptakeMuscle = toMuscle; s.release = released; s.absorb = meal;
    s.t += DT;
    if (s.run) {
      s.insMax = Math.max(s.insMax, s.ins);
      const steps = Math.round(s.t / DT);
      // the checks the data table uses: 30, 60 and 120 minutes
      if (steps === 360 || steps === 720 || steps === MARK * 12) {
        s.peak = Math.max(s.peak, s.g);
        s.checked = true;
      }
      if (steps === MARK * 12) {
        s.at120 = s.g;
        sim.hold();   // the clock stops exactly on 120 min
      }
      if (s.t >= s.nextSample) {
        s.history.push([s.t, s.g]);
        s.nextSample = s.t + 1;
        // the graph scrolls after WINDOW minutes, so only the visible points are kept
        while (s.history.length > 2 && s.history[1][0] < s.t - WINDOW - 1) s.history.shift();
      }
    }
  }

  function toFasting() {
    const b = body();
    s.g = b.g0; s.ins = fasting(b); s.glu = 0.8; s.run = null; s.t = 0;
    s.history = []; s.peak = b.g0; s.checked = false; s.insMax = s.ins; s.at120 = null; s.nextSample = 0;
    s.uptakeLiver = s.uptakeMuscle = s.release = s.absorb = 0;
  }

  function begin(kind) {
    s.run = kind; s.t = 0; s.history = [[0, s.g]]; s.peak = s.g; s.checked = false; s.insMax = s.ins; s.at120 = null; s.nextSample = 1;
  }

  function setCond(i) {
    s.cond = i;
    condChips.forEach((c, k) => c.setAttribute('aria-pressed', String(k === i)));
    s.store = START_STORE;
    toFasting();
  }

  function statusText() {
    if (sim.held) return ['ok', 'Stopped at 2 h. Press Record, then Play.'];
    if (s.g > BAND_HIGH + 30) return ['warn', 'Blood sugar is high'];
    if (s.g > BAND_HIGH) return ['warn', 'Blood sugar is above the normal band'];
    if (s.g < BAND_LOW) return ['warn', 'Blood sugar is below the normal band'];
    return ['ok', 'Blood sugar is in the normal band'];
  }

  function report() {
    sim.setReadout('time', Math.floor(s.run ? s.t + 0.0001 : 0) + ' min');
    sim.setReadout('sugar', Math.round(s.g) + ' mg/dL');
    sim.setReadout('insulin', insulinWord(s.ins));
    sim.setReadout('glucagon', glucagonWord(s.glu));
    sim.setReadout('store', Math.round(s.store) + ' %');
    const st = statusText();
    if (st[1] !== lastStatus) { lastStatus = st[1]; sim.setStatus(st[0], st[1]); }
  }

  /* ---------- layout ---------- */
  function layout(env) {
    const narrow = env.w < 600;
    const pad = 10;
    const L = { narrow: narrow };
    const topH = env.h * (narrow ? 0.54 : 0.56);
    L.top = { x: pad, y: pad, w: env.w - 2 * pad, h: topH - pad };
    const gx = 44;
    L.graph = { x: gx, y: topH + 24, w: env.w - gx - pad - 6, h: env.h - topH - 24 - 34 };
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

  function arrow(ctx, x1, y1, x2, y2, color) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 8 * Math.cos(a - 0.45), y2 - 8 * Math.sin(a - 0.45));
    ctx.lineTo(x2 - 8 * Math.cos(a + 0.45), y2 - 8 * Math.sin(a + 0.45));
    ctx.closePath(); ctx.fill();
  }

  function stream(ctx, x1, y1, x2, y2, count, speed, t, radius, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < count; i++) {
      const k = (t * speed + i / count) % 1;
      ctx.beginPath(); ctx.arc(x1 + (x2 - x1) * k, y1 + (y2 - y1) * k, radius, 0, Math.PI * 2); ctx.fill();
    }
  }

  function bar(ctx, c, x, y, w, h, frac, color) {
    ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1.5;
    roundRect(ctx, x, y, w, h, 4); ctx.fill(); ctx.stroke();
    const fh = Math.max(2, (h - 4) * clamp(frac, 0, 1));
    ctx.fillStyle = color;
    roundRect(ctx, x + 2, y + h - 2 - fh, w - 4, fh, 3); ctx.fill();
  }

  /* ---------- the four boxes ---------- */
  function drawBoxes(ctx, env, L) {
    const c = env.colors;
    const T = L.top;
    const t = env.time;
    const gap = L.narrow ? 8 : 18;
    const pw = (T.w - 2 * gap) / 3;
    const ph = T.h * 0.52;
    const yb = T.y + T.h * 0.78;           // the bloodstream
    const boxes = [
      { x: T.x, text: 'Pancreas' },
      { x: T.x + pw + gap, text: 'Liver' },
      { x: T.x + 2 * (pw + gap), text: 'Muscle' }
    ];
    // the bloodstream
    ctx.fillStyle = c.card; ctx.strokeStyle = c.thermal; ctx.lineWidth = 2;
    roundRect(ctx, T.x, yb - 8, T.w, 16, 8); ctx.fill(); ctx.stroke();
    drawLabel(ctx, env, 'Bloodstream', T.x + T.w - 6, yb + 22, 'right', c.inkSoft);

    boxes.forEach((o) => {
      ctx.fillStyle = c.card; ctx.strokeStyle = c.inkMute; ctx.lineWidth = 2;
      roundRect(ctx, o.x, T.y, pw, ph, 8); ctx.fill(); ctx.stroke();
      drawLabel(ctx, env, o.text, o.x + pw / 2, T.y + 14, 'center', c.ink);
    });

    // pancreas: an insulin bar and a glucagon bar
    const bw = Math.min(26, pw * 0.26);
    const by = T.y + 28, bh = ph - 36;
    const px = boxes[0].x + pw / 2;
    bar(ctx, c, px - bw - 5, by, bw, bh, s.ins / 6, c.hormone);
    bar(ctx, c, px + 5, by, bw, bh, s.glu / 3, c.atp);

    // liver: the store bar
    const lx = boxes[1].x + pw / 2;
    bar(ctx, c, lx - bw / 2, by, bw, bh, s.store / 100, c.glucose);

    // arrows between each box and the bloodstream
    const cx = boxes.map((o) => o.x + pw / 2);
    arrow(ctx, cx[0], T.y + ph, cx[0], yb - 9, c.hormone);
    const liverIn = s.uptakeLiver > s.release;
    if (liverIn) arrow(ctx, cx[1], yb - 9, cx[1], T.y + ph + 1, c.glucose);
    else arrow(ctx, cx[1], T.y + ph + 1, cx[1], yb - 9, c.glucose);
    arrow(ctx, cx[2], yb - 9, cx[2], T.y + ph + 1, c.glucose);

    // hormones leave the pancreas, in numbers that follow their levels
    stream(ctx, cx[0] - 6, T.y + ph, cx[0] - 6, yb - 6, Math.round(clamp(s.ins * 0.7, 0, 4)), 0.3, t, 3.2, c.hormone);
    stream(ctx, cx[0] + 6, T.y + ph, cx[0] + 6, yb - 6, Math.round(clamp((s.glu - 0.8) * 2, 0, 4)), 0.3, t, 3.2, c.atp);
    // glucose into the liver or out of it, and into the muscle
    const nl = Math.round(clamp(Math.abs(s.uptakeLiver - s.release) * 0.8, 0, 6));
    if (nl > 0) {
      if (liverIn) stream(ctx, cx[1], yb - 6, cx[1], T.y + ph - 2, nl, 0.35, t, 3, c.glucose);
      else stream(ctx, cx[1], T.y + ph - 2, cx[1], yb - 6, nl, 0.35, t, 3, c.glucose);
    }
    const nm = Math.round(clamp(s.uptakeMuscle * 0.8 + 1, 0, 7));
    stream(ctx, cx[2], yb - 6, cx[2], T.y + ph * 0.55, nm, 0.3, t, 3, c.glucose);

    // a meal arrives from the left
    if (s.run === 'meal' && s.absorb > 0.5) {
      const n = Math.round(clamp(s.absorb * 0.25, 1, 7));
      stream(ctx, T.x + 16, yb + 28, T.x + 16, yb + 6, n, 0.4, t, 3, c.glucose);
      drawLabel(ctx, env, 'Meal', T.x + 28, yb + 22, 'left', c.inkSoft);
    }
  }

  /* ---------- the graph ---------- */
  function drawGraph(ctx, env, L) {
    const c = env.colors;
    const G = L.graph;
    const lo = 50, hi = 300;
    const x0 = s.run ? Math.max(0, s.t - WINDOW) : 0;
    const X = (m) => G.x + ((clamp(m, x0, x0 + WINDOW) - x0) / WINDOW) * G.w;
    const Y = (v) => G.y + G.h - ((clamp(v, lo, hi) - lo) / (hi - lo)) * G.h;
    ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1.5;
    ctx.fillRect(G.x, G.y, G.w, G.h); ctx.strokeRect(G.x, G.y, G.w, G.h);
    ctx.globalAlpha = 0.22; ctx.fillStyle = c.accent;
    ctx.fillRect(G.x, Y(BAND_HIGH), G.w, Y(BAND_LOW) - Y(BAND_HIGH));
    ctx.globalAlpha = 1;
    [100, 200, 300].forEach((v) => {
      ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(G.x - 4, Y(v)); ctx.lineTo(G.x, Y(v)); ctx.stroke();
      drawLabel(ctx, env, String(v), G.x - 8 - 22, Y(v), 'left', c.inkSoft);
    });
    drawLabel(ctx, env, 'mg/dL', G.x - 40, G.y - 14, 'left', c.inkSoft);
    for (let m = Math.ceil(x0 / 30) * 30; m <= x0 + WINDOW + 0.001; m += 30) {
      ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(m), G.y + G.h); ctx.lineTo(X(m), G.y + G.h + 4); ctx.stroke();
      drawLabel(ctx, env, String(m), X(m), G.y + G.h + 16, 'center', c.inkSoft);
    }
    drawLabel(ctx, env, 'min', G.x - 40, G.y + G.h + 16, 'left', c.inkSoft);
    // the line
    const pts = s.history.concat(s.run ? [[s.t, s.g]] : [[0, s.g]]);
    ctx.save();
    ctx.beginPath(); ctx.rect(G.x, G.y, G.w, G.h); ctx.clip();
    ctx.strokeStyle = c.ink; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach((p, i) => { if (i === 0) ctx.moveTo(X(p[0]), Y(p[1])); else ctx.lineTo(X(p[0]), Y(p[1])); });
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = c.ink;
    ctx.beginPath(); ctx.arc(X(s.run ? s.t : 0), Y(s.g), 4, 0, Math.PI * 2); ctx.fill();
  }

  function draw(ctx, env) {
    const L = layout(env);
    drawBoxes(ctx, env, L);
    drawGraph(ctx, env, L);
  }

  /* ---------- the sim ---------- */
  sim = window.TB.sim.create(box, {
    kind: 'canvas',
    loop: true,
    tokens: ['glucose', 'oxygen', 'co2', 'water', 'atp', 'thermal', 'hormone'],
    init() {
      setCond(0);
      report();
    },
    stepSeconds: 6,   // under reduced motion one Step is 30 simulated minutes, and it stops at 120
    update() {
      step();
      report();
    },
    draw: draw,
    record() {
      return {
        'Body': ['Healthy', 'Type 1', 'Type 2'][s.cond],
        'Peak (mg/dL)': s.checked ? Math.round(s.peak) : 'Wait',
        'At 2 h (mg/dL)': s.at120 === null ? 'Wait' : Math.round(s.at120),
        'Insulin': s.checked ? insulinWord(s.insMax) : 'Wait'
      };
    }
  });

  // every new run, a new body and Start over clear a stop at 120 min and run again
  condChips.forEach((chip, i) => chip.addEventListener('click', () => { setCond(i); sim.release(); report(); sim.redraw(); }));
  if (eatBtn) eatBtn.addEventListener('click', () => { begin('meal'); sim.release(); report(); sim.redraw(); });
  if (skipBtn) skipBtn.addEventListener('click', () => { begin('skip'); sim.release(); report(); sim.redraw(); });
  if (restartBtn) restartBtn.addEventListener('click', () => { setCond(0); sim.release(); report(); sim.redraw(); });
})();
