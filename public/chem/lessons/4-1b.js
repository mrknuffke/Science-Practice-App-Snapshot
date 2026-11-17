/* ============================================================
   4-1b LESSON INTERACTIVES
   The enzyme simulator: a looping canvas on TB.sim.create (RUNTIME_SPEC 4.3), inside the Enrichment
   block of the lesson and locked until the prediction is committed. Brief:
   docs/plans/textbook-sim-briefs.md, "Chem 4-1b: Enzyme Sim".

   The old sim drew one enzyme and took its rate from a formula (rate = top speed x S / (K + S))
   whose "sites in use" never matched the picture. Here the picture is the model: a handful of
   enzyme molecules, each with ONE active site. A substrate that reaches a free, working site
   binds; the site is busy for one turnover time, then releases two product molecules. A fresh
   substrate enters each time one binds, so the substrate amount stays what the slider says. The
   rate and the share of sites in use come from counting what happens. Saturation follows: with
   little substrate most sites sit empty; with a lot, nearly every site is busy.

   The temperature and pH factor is the old sim's: an Arrhenius rise below the best temperature, a
   fall as heat unfolds the protein, and a bell curve around pH 7.4. The old formula was multiplied
   by 95 at the best temperature instead of being divided to give 1 there; it is normalised here.
   A run starts from a system that has already run for 6 seconds, so the first counted second is
   not a transient. Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);

  /* ---- the model ---- */
  const W = 340, H = 220, RS = 3.5, RE = 22, CAP = 18;
  const V0 = 120;                     // substrate speed in design units a second at 37 degrees C
  const TAU0 = 2.2;                   // seconds a site stays busy at full activity
  const WARM_S = 6;                   // simulated seconds a system runs before a run starts
  const RUN_S = 10;                   // seconds in a run
  const SEED = 4309;                  // chosen so one run shows the typical behaviour (see the sheet)
  const DEFAULTS = { S: 20, T: 37, ph: 7.4, E: 8 };
  const MIN_ACTIVITY = 0.05;          // below this the protein has lost its shape

  // plain multiply, add and square root, so the browser and Node follow the same path (Math.hypot is not the same in every engine)
  const dist = (x, y) => Math.sqrt(x * x + y * y);
  // A random direction from plain arithmetic and a square root only, so the browser and Node follow the same path
  // (Math.cos, Math.sin, Math.exp and Math.hypot are not the same to the last bit in every engine, and collisions amplify that).
  function direction(r) {
    for (;;) {
      const x = 2 * r() - 1, y = 2 * r() - 1, d2 = x * x + y * y;
      if (d2 > 0.01 && d2 <= 1) { const d = Math.sqrt(d2); return { x: x / d, y: y / d }; }
    }
  }
  const kelvin = (c) => c + 273.15;
  const fDenat = (t) => 1 / (1 + Math.exp(-0.35 * (t - 50)));
  // Activity relative to 37 degrees C and pH 7.4 (1 there). Zero once the protein is unfolded.
  function activity(T, ph) {
    const temp = Math.exp(0.045 * (T - 37)) * (1 - fDenat(T)) / (1 - fDenat(37));
    const bell = Math.exp(-((ph - 7.4) * (ph - 7.4)) / (2 * 1.3 * 1.3));
    if (T > 65 || ph < 3.5 || ph > 11.2) return 0;
    return Math.round(Math.max(0, temp * bell) * 1e6) / 1e6;     // rounded, so the last bit of Math.exp cannot move a timer
  }
  const stateOf = (a) => (a <= MIN_ACTIVITY ? 'denatured' : a < 0.6 ? 'strained' : 'native');
  // The most reactions a run can hold: every site busy all the time.
  const topSpeed = (E, T, ph) => { const a = activity(T, ph); return a <= MIN_ACTIVITY ? 0 : (E * a / TAU0) * RUN_S; };
  const speedFor = (T) => V0 * Math.sqrt(kelvin(T) / kelvin(37));

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function layout(E) {
    const cols = 4, rows = Math.ceil(E / cols), out = [];
    for (let i = 0; i < E; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      out.push({ x: W * (0.14 + 0.24 * c), y: rows > 1 ? H * (0.22 + 0.56 * r / (rows - 1)) : H * 0.5, busy: 0, since: 0 });
    }
    return out;
  }
  function newSystem(opts, seed) {
    const o = { S: opts.S, T: opts.T, ph: opts.ph, E: opts.E };
    const sys = {
      opts: o, r: rng(seed === undefined ? SEED : seed), a: activity(o.T, o.ph), v: speedFor(o.T),
      enzymes: layout(o.E), subs: [], products: [], t: 0, runT: 0, reactions: 0, busySum: 0, steps: 0, counting: false, history: []
    };
    sys.tau = sys.a > MIN_ACTIVITY ? TAU0 / sys.a : Infinity;
    for (let i = 0; i < o.S; i++) sys.subs.push(freshSub(sys));
    for (let i = 0; i < WARM_S * 60; i++) step(sys, 1 / 60);
    return sys;
  }
  function freshSub(sys) {
    let x, y, tries = 0;
    do { x = RS + sys.r() * (W - 2 * RS); y = RS + sys.r() * (H - 2 * RS); tries++; }
    while (tries < 50 && sys.enzymes.some((e) => dist(e.x - x, e.y - y) < RE + RS + 2));
    const u = direction(sys.r);
    return { x: x, y: y, vx: u.x * sys.v, vy: u.y * sys.v };
  }

  function step(sys, dt) {
    const E = sys.enzymes;
    E.forEach((e) => {
      if (e.busy > 0) {
        e.busy -= dt;
        if (e.busy <= 0) {
          e.busy = 0;
          if (sys.counting) sys.reactions++;
          for (let k = 0; k < 2; k++) sys.products.push({ x: e.x + (k ? 5 : -5), y: e.y - RE, vx: (k ? 1 : -1) * 14, vy: -26, age: 0 });
        }
      }
    });
    for (let i = 0; i < sys.subs.length; i++) {
      const s = sys.subs[i];
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.x < RS) { s.x = RS; s.vx = Math.abs(s.vx); }
      if (s.x > W - RS) { s.x = W - RS; s.vx = -Math.abs(s.vx); }
      if (s.y < RS) { s.y = RS; s.vy = Math.abs(s.vy); }
      if (s.y > H - RS) { s.y = H - RS; s.vy = -Math.abs(s.vy); }
      for (let j = 0; j < E.length; j++) {
        const e = E[j];
        if (e.busy === 0 && sys.a > MIN_ACTIVITY && dist(s.x - e.x, s.y - (e.y - RE)) < CAP) {
          e.busy = sys.tau; e.since = sys.t;
          sys.subs[i] = freshSub(sys);
          break;
        }
        const dx = s.x - e.x, dy = s.y - e.y, d = dist(dx, dy);
        if (d < RE + RS) {
          const nx = dx / d, ny = dy / d, k = s.vx * nx + s.vy * ny;
          if (k < 0) { s.vx -= 2 * k * nx; s.vy -= 2 * k * ny; }
          s.x = e.x + nx * (RE + RS); s.y = e.y + ny * (RE + RS);
        }
      }
    }
    for (let i = sys.products.length - 1; i >= 0; i--) {
      const p = sys.products[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.age += dt;
      if (p.age > 1.2) sys.products.splice(i, 1);
    }
    sys.t += dt;
    if (sys.counting) {
      sys.runT += dt;
      sys.busySum += E.filter((e) => e.busy > 0).length / E.length;
      sys.steps++;
    }
  }
  const finished = (sys) => sys.runT >= RUN_S - 1e-9;
  const sitesInUse = (sys) => (sys.steps ? sys.busySum / sys.steps : E_busy(sys));
  const E_busy = (sys) => sys.enzymes.filter((e) => e.busy > 0).length / sys.enzymes.length;

  if (window.GC_MODELS) window.GC_MODELS['4-1b'] = { W: W, H: H, RS: RS, RE: RE, CAP: CAP, V0: V0, TAU0: TAU0, WARM_S: WARM_S, RUN_S: RUN_S, SEED: SEED, DEFAULTS: DEFAULTS, MIN_ACTIVITY: MIN_ACTIVITY, activity: activity, stateOf: stateOf, topSpeed: topSpeed, speedFor: speedFor, newSystem: newSystem, step: step, finished: finished, sitesInUse: sitesInUse };

  /* ---- the page ---- */
  function init() {
    const box = $('[data-sim="enzyme"]');
    if (!box || !window.TB) return;
    const sS = $('#eSubstrate', box), sT = $('#eTemp', box), sP = $('#ePh', box), sE = $('#eEnz', box);
    const startBtn = $('#btnStartEnzyme', box), resetBtn = $('#btnResetEnzyme', box);
    const note = $('[data-sim-note]', box);
    let sys = null, state = 'ready', sim = null, tick = 0, points = [];

    const read = () => ({ S: Number(sS.value), T: Number(sT.value), ph: Number(sP.value), E: Number(sE.value) });
    const STATE_TEXT = { native: 'Native fold', strained: 'Strained fold', denatured: 'Denatured' };
    const pct = () => Math.round(sitesInUse(sys) * 100);

    function report() {
      const done = state === 'done', st = stateOf(sys.a);
      sim.setReadout('time', Math.min(RUN_S, sys.runT).toFixed(1) + ' s');
      sim.setReadout('react', done ? String(sys.reactions) : sys.reactions + ' so far');
      sim.setReadout('sites', state === 'ready' ? '–' : pct() + (done ? ' %' : ' % so far'));
      sim.setReadout('shape', STATE_TEXT[st]);
      if (!sim.committed) sim.setStatus('neutral', 'Predict to start');
      else if (state === 'ready') sim.setStatus(st === 'native' ? 'neutral' : st === 'strained' ? 'warn' : 'alert', st === 'denatured' ? 'Active sites collapsed' : 'Ready to start the run');
      else if (state === 'running') sim.setStatus('warn', 'Run in progress');
      else sim.setStatus('ok', 'Stopped at 10.0 s');
      sim.setLabel('A vessel with ' + sys.opts.E + ' enzyme molecules, each with one active site, and ' + sys.opts.S + ' substrate particles at ' + sys.opts.T + ' degrees C and pH ' + sys.opts.ph.toFixed(1) + ', beside a graph of reactions in 10 seconds against substrate amount. The enzyme is ' + STATE_TEXT[st].toLowerCase() + '. ' +
        (done ? 'The run is over: ' + sys.reactions + ' reactions in 10 seconds, with ' + pct() + ' percent of the sites in use.' : 'The run has not finished.'));
    }
    function setState(next) {
      state = next;
      if (next === 'ready') {
        sys = newSystem(read());
        note.textContent = stateOf(sys.a) === 'denatured'
          ? 'Under these conditions the enzyme has lost its shape. The active sites have collapsed, so no substrate can bind.'
          : 'Set up a run, then press Start run. Each reaction needs one substrate to bind to a free active site.';
      } else if (next === 'running') {
        sys = newSystem(read());
        sys.counting = true;
        note.textContent = 'A substrate that reaches a free active site binds. The site stays busy while it works, then releases two products.';
      } else {
        points.push({ S: sys.opts.S, n: sys.reactions });
        note.textContent = sys.a <= MIN_ACTIVITY
          ? 'No reactions: the enzyme has lost its shape. Change the temperature or the pH and run again.'
          : 'The run stopped on the 10 second mark. ' + pct() + ' % of the active sites were in use on average.';
      }
      tick = 0;
      report();
      sim.redraw();
    }

    /* ---- drawing ---- */
    const GX0 = 46, GX1 = W - 14, GY0 = H - 40, GY1 = 18, XMAX = 80;
    function drawEnzyme(ctx, env, e, st) {
      const c = env.colors;
      const a0 = -Math.PI / 2 + 0.45, a1 = -Math.PI / 2 - 0.45 + Math.PI * 2;
      const depth = st === 'denatured' ? 2 : st === 'strained' ? 8 : 12;
      ctx.save();
      ctx.translate(e.x, e.y);
      if (st === 'denatured') ctx.rotate(0.25);
      ctx.beginPath();
      ctx.arc(0, 0, RE, a0, a1, false);
      ctx.quadraticCurveTo(0, -RE + depth * 1.6, RE * Math.cos(a0), RE * Math.sin(a0));
      ctx.closePath();
      ctx.fillStyle = c.paper2; ctx.fill();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = st === 'native' ? c.ink : st === 'strained' ? c.warn : c.bad;
      ctx.setLineDash(st === 'denatured' ? [5, 3] : []);
      ctx.stroke(); ctx.setLineDash([]);
      if (e.busy > 0) { ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(0, -RE + depth * 0.55 + 3, 4.6, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    function drawChamber(ctx, env) {
      const c = env.colors, st = stateOf(sys.a);
      ctx.fillStyle = c.card; ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(0.75, 0.75, W - 1.5, H - 1.5, 6); ctx.fill(); ctx.stroke();
      sys.enzymes.forEach((e) => drawEnzyme(ctx, env, e, st));
      ctx.fillStyle = c.accent;
      sys.subs.forEach((s) => { ctx.beginPath(); ctx.arc(s.x, s.y, RS, 0, Math.PI * 2); ctx.fill(); });
      sys.products.forEach((p) => {
        ctx.globalAlpha = Math.max(0, 1 - p.age / 1.2);
        ctx.fillStyle = c.good; ctx.beginPath(); ctx.arc(p.x, p.y, 2.8, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      });
    }
    function drawGraph(ctx, env, fs) {
      const c = env.colors;
      const top = topSpeed(sys.opts.E, sys.opts.T, sys.opts.ph);
      const ymax = top > 0 ? Math.ceil((top * 1.2) / 10) * 10 : 40;
      const gx = (s) => GX0 + (s / XMAX) * (GX1 - GX0), gy = (n) => GY0 - (Math.min(ymax, n) / ymax) * (GY0 - GY1);
      ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 0.5, W - 1, H - 1, 6); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(GX0, GY1 - 4); ctx.lineTo(GX0, GY0); ctx.lineTo(GX1, GY0); ctx.stroke();
      ctx.fillStyle = c.inkSoft; ctx.font = env.font(fs, 'mono', 400);
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      [0, 40, 80].forEach((s) => ctx.fillText(String(s), gx(s), GY0 + 5));
      ctx.font = env.font(fs, 'display', 400);
      ctx.fillText('Substrate →', (GX0 + GX1) / 2, GY0 + 5 + fs * 1.15);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.font = env.font(fs, 'mono', 400);
      [0, ymax / 2, ymax].forEach((n) => {
        if (n) { ctx.strokeStyle = c.hair; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(GX0, gy(n)); ctx.lineTo(GX1, gy(n)); ctx.stroke(); }
        ctx.fillText(String(n), GX0 - 6, gy(n));
      });
      ctx.save(); ctx.translate(11, (GY0 + GY1) / 2); ctx.rotate(-Math.PI / 2);
      ctx.font = env.font(fs, 'display', 400); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.inkSoft;
      ctx.fillText('Reactions in 10 s', 0, 0); ctx.restore();
      if (points.length && top > 0) {
        ctx.strokeStyle = c.inkMute; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(GX0, gy(top)); ctx.lineTo(GX1, gy(top)); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = c.inkSoft; ctx.font = env.font(fs, 'display', 400); ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
        ctx.fillText('Top speed', GX1 - 4, gy(top) - 3);
      }
      points.forEach((p) => {
        ctx.fillStyle = c.accent; ctx.strokeStyle = c.paper; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(gx(p.S), gy(p.n), 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
    }
    function draw(ctx, env) {
      const wide = env.w / env.h > 1.6;
      const dw = wide ? 2 * W + 20 : W, dh = wide ? H : 2 * H + 16;
      const k = Math.min(env.w / dw, env.h / dh);
      const fs = Math.max(12, 12 / k);
      ctx.save();
      ctx.translate((env.w - dw * k) / 2, (env.h - dh * k) / 2);
      ctx.scale(k, k);
      drawChamber(ctx, env);
      ctx.translate(wide ? W + 20 : 0, wide ? 0 : H + 16);
      drawGraph(ctx, env, fs);
      ctx.restore();
    }

    sys = newSystem(DEFAULTS);
    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 3.4,       // three presses run the 10 s
      init() { report(); },
      onUnlock() { report(); },
      update(dt) {
        step(sys, dt);
        if (state === 'running') {
          if (finished(sys)) { sys.counting = false; setState('done'); sim.hold(); }
          else if (++tick % 6 === 0) report();
        }
      },
      draw: draw,
      preset(name) {
        const p = { s10: [10, 37, 7.4], s40: [40, 37, 7.4], s80: [80, 37, 7.4], hot: [40, 70, 7.4], acid: [40, 37, 2.4] }[name];
        if (!p) return;
        sS.value = String(p[0]); sT.value = String(p[1]); sP.value = String(p[2]); sE.value = String(DEFAULTS.E);
        [sS, sT, sP, sE].forEach((el) => el.dispatchEvent(new Event('input')));
        setState('ready');
      },
      record() {
        const done = state === 'done';
        return {
          'Substrate particles': sys.opts.S, 'Temperature (°C)': sys.opts.T, 'pH': sys.opts.ph.toFixed(1), 'Enzyme molecules': sys.opts.E,
          'Reactions in 10 s': done ? sys.reactions : 'run first', 'Sites in use (%)': done ? pct() : 'run first'
        };
      }
    });

    // the substrate amount keeps the dots on the graph; a change to the enzyme itself starts them again
    sS.addEventListener('input', () => setState('ready'));
    [sT, sP, sE].forEach((el) => el.addEventListener('input', () => { points = []; setState('ready'); }));
    startBtn.addEventListener('click', () => {
      if (!sim.committed) return;
      setState('running');
      sim.release();
    });
    resetBtn.addEventListener('click', () => { points = []; setState('ready'); sim.release(); });
    report();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
