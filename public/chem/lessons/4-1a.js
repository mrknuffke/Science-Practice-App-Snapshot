/* ============================================================
   4-1a LESSON INTERACTIVES
   The collision sandbox: a looping canvas on TB.sim.create (RUNTIME_SPEC 4.3), locked until the
   prediction is committed. Brief: docs/plans/textbook-sim-briefs.md, "Chem 4-1a: Collision Sandbox".
   The vessel and a graph of reactions against time sit on one canvas. A run lasts 10 simulated
   seconds, whatever the screen, and stops on the 10.0 s mark with sim.hold().

   The rule is the old sandbox's rule, repaired:
     - Every particle moves at the speed its temperature gives (speed grows with the square root of
       the temperature in kelvin). Hard collisions between A and B react; the collision energy is the
       relative speed of the pair, so only a near head-on blow clears the barrier at 15 degrees C and
       a wider range of angles clears it at 80 degrees C. Seven in ten of the hard collisions also have
       the right orientation. The old threshold let about 60% of all collisions react at every
       temperature, so the temperature barely mattered.
     - Each time a pair reacts a fresh A and B enter the vessel, so the amounts stay steady and the
       slope of the graph is the rate. The number of collisions barely changes with temperature.
     - A solid lump holds A in a grid. Its atoms vibrate in place (they take part in the energy test
       with the thermal speed, in a random direction) but cannot move, so only the surface meets B.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);

  /* ---- the model ---- */
  const W = 340, H = 220, R = 4.5, EDGE = 5;
  const NB = 30;                      // particles of B
  const V0 = 120;                     // speed in design units a second at 293.15 K
  const LAMBDA = 3.9;                 // a collision reacts only if its relative speed squared is at least LAMBDA * V0 squared
  const PASS = 0.7;                   // share of hard collisions that also have the right orientation
  const RUN_S = 10;                   // seconds in a run
  const SAMPLE_S = 0.25;              // the graph takes a point this often
  const SEED = 4332;                  // chosen so one run shows the typical behaviour (see the sheet)
  const GRID = 11;                    // spacing of the lump
  const DEFAULTS = { T: 15, nA: 25, lump: false };

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
  const speedFor = (tC) => V0 * Math.sqrt(kelvin(tC) / 293.15);

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

  function newSystem(opts, seed) {
    const sd = seed === undefined ? SEED : seed;
    const o = { T: opts.T, nA: opts.nA, lump: !!opts.lump };
    const sys = {
      opts: o, s: speedFor(o.T),
      rA: rng(sd), rB: rng(sd + 1), rO: rng(sd + 2), rV: rng(sd + 3),
      parts: [], flashes: [], t: 0, coll: 0, react: 0, series: [[0, 0]], nextSample: SAMPLE_S, counting: false,
      grid: Math.ceil(Math.sqrt(o.nA))
    };
    const g = sys.grid, x0 = W / 2 - (g * GRID) / 2, y0 = H / 2 - (g * GRID) / 2;
    sys.lumpBox = { x0: x0 - 8, x1: x0 + g * GRID + 8, y0: y0 - 8, y1: y0 + g * GRID + 8 };
    for (let i = 0; i < o.nA; i++) sys.parts.push(makeA(sys, i));
    for (let i = 0; i < NB; i++) sys.parts.push(makeB(sys));
    return sys;
  }
  function spot(r) { return { x: EDGE + R + r() * (W - 2 * EDGE - 2 * R), y: EDGE + R + r() * (H - 2 * EDGE - 2 * R) }; }
  function makeA(sys, i) {
    if (sys.opts.lump) {
      const g = sys.grid, x0 = W / 2 - (g * GRID) / 2, y0 = H / 2 - (g * GRID) / 2;
      return { t: 'A', x: x0 + (i % g) * GRID + GRID / 2, y: y0 + Math.floor(i / g) * GRID + GRID / 2, vx: 0, vy: 0, fixed: true, slot: i };
    }
    const u = direction(sys.rA), p = spot(sys.rA);
    return { t: 'A', x: p.x, y: p.y, vx: u.x * sys.s, vy: u.y * sys.s };
  }
  function makeB(sys) {
    const u = direction(sys.rB);
    let p = spot(sys.rB);
    if (sys.opts.lump) { const b = sys.lumpBox; while (p.x > b.x0 && p.x < b.x1 && p.y > b.y0 && p.y < b.y1) p = spot(sys.rB); }
    return { t: 'B', x: p.x, y: p.y, vx: u.x * sys.s, vy: u.y * sys.s };
  }

  // One fixed step. The vessel always moves; only a counting run reacts and keeps score.
  function step(sys, dt) {
    const parts = sys.parts, s = sys.s, thr = LAMBDA * V0 * V0;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p.fixed) continue;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < EDGE + R) { p.x = EDGE + R; p.vx = Math.abs(p.vx); }
      if (p.x > W - EDGE - R) { p.x = W - EDGE - R; p.vx = -Math.abs(p.vx); }
      if (p.y < EDGE + R) { p.y = EDGE + R; p.vy = Math.abs(p.vy); }
      if (p.y > H - EDGE - R) { p.y = H - EDGE - R; p.vy = -Math.abs(p.vy); }
    }
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const p = parts[i], q = parts[j];
        if (p.fixed && q.fixed) continue;
        const dx = q.x - p.x, dy = q.y - p.y, d2 = dx * dx + dy * dy;
        if (d2 >= 4 * R * R || d2 < 1e-6) continue;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
        const k = (p.vx - q.vx) * nx + (p.vy - q.vy) * ny;
        if (k <= 0) continue;                                   // already moving apart
        if (sys.counting && p.t !== q.t) {
          sys.coll++;
          // a fixed atom of the lump vibrates at the thermal speed, in a random direction
          let pvx = p.vx, pvy = p.vy, qvx = q.vx, qvy = q.vy;
          if (p.fixed) { const u = direction(sys.rV); pvx = u.x * s; pvy = u.y * s; }
          if (q.fixed) { const u = direction(sys.rV); qvx = u.x * s; qvy = u.y * s; }
          const vr2 = (pvx - qvx) * (pvx - qvx) + (pvy - qvy) * (pvy - qvy);
          if (vr2 >= thr && sys.rO() < PASS) {
            sys.react++;
            sys.flashes.push({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2, age: 0 });
            // a fresh A and B replace the pair, so the amounts stay steady
            const a = p.t === 'A' ? p : q;
            const ia = parts.indexOf(a), ib = parts.indexOf(a === p ? q : p);
            parts[ia] = a.fixed ? { t: 'A', x: a.x, y: a.y, vx: 0, vy: 0, fixed: true, slot: a.slot } : makeA(sys, 0);
            parts[ib] = makeB(sys);
            continue;
          }
        }
        // elastic rebound, then every particle goes back to the speed its temperature gives
        if (!p.fixed) { p.vx -= k * nx; p.vy -= k * ny; }
        if (!q.fixed) { q.vx += k * nx; q.vy += k * ny; }
        [p, q].forEach((z) => { if (z.fixed) return; const sp = dist(z.vx, z.vy) || 1; z.vx *= s / sp; z.vy *= s / sp; });
        const o = (2 * R - d) / 2;
        if (!p.fixed) { p.x -= o * nx; p.y -= o * ny; }
        if (!q.fixed) { q.x += o * nx; q.y += o * ny; }
      }
    }
    for (let i = sys.flashes.length - 1; i >= 0; i--) { sys.flashes[i].age += dt; if (sys.flashes[i].age > 0.7) sys.flashes.splice(i, 1); }
    if (sys.counting) {
      sys.t += dt;
      while (sys.t >= sys.nextSample - 1e-9 && sys.nextSample <= RUN_S + 1e-9) { sys.series.push([sys.nextSample, sys.react]); sys.nextSample += SAMPLE_S; }
    }
  }
  const finished = (sys) => sys.t >= RUN_S - 1e-9;

  if (window.GC_MODELS) window.GC_MODELS['4-1a'] = { W: W, H: H, R: R, NB: NB, V0: V0, LAMBDA: LAMBDA, PASS: PASS, RUN_S: RUN_S, SEED: SEED, DEFAULTS: DEFAULTS, speedFor: speedFor, newSystem: newSystem, step: step, finished: finished };

  /* ---- the page ---- */
  function init() {
    const box = $('[data-sim="collisions"]');
    if (!box || !window.TB) return;
    const sT = $('#kTemp', box), sA = $('#kConc', box), selForm = $('#kForm', box);
    const startBtn = $('#btnStartKinetics', box), resetBtn = $('#btnResetKinetics', box);
    const note = $('[data-sim-note]', box);
    let sys = null, state = 'ready', sim = null, tick = 0;

    const read = () => ({ T: Number(sT.value), nA: Number(sA.value), lump: selForm.value === 'lump' });
    const form = () => (sys.opts.lump ? 'Lump' : 'Powder');

    function report() {
      const done = state === 'done';
      sim.setReadout('time', Math.min(RUN_S, sys.t).toFixed(1) + ' s');
      sim.setReadout('coll', String(sys.coll));
      sim.setReadout('react', done ? String(sys.react) : sys.react + ' so far');
      sim.setReadout('share', done && sys.coll ? Math.round((sys.react / sys.coll) * 100) + ' %' : '–');
      if (!sim.committed) sim.setStatus('neutral', 'Predict to start');
      else if (state === 'ready') sim.setStatus('neutral', 'Ready to start the run');
      else if (state === 'running') sim.setStatus('warn', 'Run in progress');
      else sim.setStatus('ok', 'Stopped at 10.0 s');
      sim.setLabel('A vessel of ' + sys.opts.nA + ' particles of A and ' + NB + ' of B at ' + sys.opts.T + ' degrees C, with A as a ' + form().toLowerCase() + ', beside a graph of reactions against time. ' +
        (done ? 'The run is over: ' + sys.react + ' reactions in 10 seconds from ' + sys.coll + ' collisions.' : 'The run has not finished.'));
    }
    function setState(next) {
      state = next;
      if (next === 'ready') {
        sys = newSystem(read());
        note.textContent = 'Set up a run, then press Start run. Each reaction makes one product AB.';
      } else if (next === 'running') {
        sys = newSystem(read());
        sys.counting = true;
        note.textContent = 'A hard, well-aimed collision between A and B makes AB. A fresh A and B then enter, so the amounts stay steady.';
      } else {
        note.textContent = 'The run stopped on the 10 second mark. Press Record to keep the result, or change a control and start a new run.';
      }
      tick = 0;
      report();
      sim.redraw();
    }

    /* ---- drawing ---- */
    const GX0 = 46, GX1 = W - 14, GY0 = H - 40, GY1 = 18, YMAX = 240;
    const gx = (t) => GX0 + (t / RUN_S) * (GX1 - GX0);
    const gy = (n) => GY0 - (Math.min(YMAX, n) / YMAX) * (GY0 - GY1);
    function drawVessel(ctx, env) {
      const c = env.colors;
      ctx.fillStyle = c.card; ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(0.75, 0.75, W - 1.5, H - 1.5, 6); ctx.fill(); ctx.stroke();
      sys.parts.forEach((p, i) => {
        const col = p.t === 'A' ? c.accent : c.cool;
        const jx = p.fixed ? Math.sin(env.time * 22 + i) * 0.7 : 0, jy = p.fixed ? Math.cos(env.time * 19 + i * 1.7) * 0.7 : 0;
        if (!p.fixed) {
          ctx.strokeStyle = col; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045); ctx.stroke();
        }
        ctx.fillStyle = col; ctx.strokeStyle = c.paper; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x + jx, p.y + jy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      // a product AB where each reaction happened: the pair, bonded, fading out
      sys.flashes.forEach((f) => {
        const a = 1 - f.age / 0.7;
        ctx.globalAlpha = a;
        ctx.strokeStyle = c.good; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(f.x - 4, f.y); ctx.lineTo(f.x + 4, f.y); ctx.stroke();
        ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(f.x - 4, f.y, 3.6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = c.cool; ctx.beginPath(); ctx.arc(f.x + 4, f.y, 3.6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = c.good; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(f.x, f.y, 8 + f.age * 14, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      });
    }
    function drawGraph(ctx, env, fs) {
      const c = env.colors;
      ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 0.5, W - 1, H - 1, 6); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(GX0, GY1 - 4); ctx.lineTo(GX0, GY0); ctx.lineTo(GX1, GY0); ctx.stroke();
      ctx.fillStyle = c.inkSoft; ctx.font = env.font(fs, 'mono', 400);
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      [0, 5, 10].forEach((t) => ctx.fillText(String(t), gx(t), GY0 + 5));
      ctx.font = env.font(fs, 'display', 400);
      ctx.fillText('Time (s) →', (GX0 + GX1) / 2, GY0 + 5 + fs * 1.15);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.font = env.font(fs, 'mono', 400);
      [0, 120, 240].forEach((n) => {
        ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
        if (n) { ctx.beginPath(); ctx.moveTo(GX0, gy(n)); ctx.lineTo(GX1, gy(n)); ctx.stroke(); }
        ctx.fillText(String(n), GX0 - 6, gy(n));
      });
      ctx.save(); ctx.translate(11, (GY0 + GY1) / 2); ctx.rotate(-Math.PI / 2);
      ctx.font = env.font(fs, 'display', 400); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.inkSoft;
      ctx.fillText('Reactions', 0, 0); ctx.restore();
      if (sys.series.length > 1) {
        ctx.strokeStyle = c.good; ctx.lineWidth = 3; ctx.lineJoin = 'round';
        ctx.beginPath();
        sys.series.forEach((pt, i) => { if (i) ctx.lineTo(gx(pt[0]), gy(pt[1])); else ctx.moveTo(gx(pt[0]), gy(pt[1])); });
        ctx.lineTo(gx(Math.min(sys.t, RUN_S)), gy(sys.react)); ctx.stroke();
      }
      if (state === 'done') {
        ctx.fillStyle = c.ink; ctx.font = env.font(fs, 'mono', 700); ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
        ctx.fillText(sys.react + ' in 10 s', gx(RUN_S) - 6, Math.min(gy(sys.react) - 8, GY0 - 20));
      }
    }
    function draw(ctx, env) {
      const wide = env.w / env.h > 1.6;
      const dw = wide ? 2 * W + 20 : W, dh = wide ? H : 2 * H + 16;
      const k = Math.min(env.w / dw, env.h / dh);
      const fs = Math.max(12, 12 / k);
      ctx.save();
      ctx.translate((env.w - dw * k) / 2, (env.h - dh * k) / 2);
      ctx.scale(k, k);
      drawVessel(ctx, env);
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
          if (finished(sys)) { state = 'done'; sys.counting = false; setState('done'); sim.hold(); }
          else if (++tick % 6 === 0) report();
        }
      },
      draw: draw,
      preset(name) {
        const p = { cold: [15, 25, 'powder'], hot: [80, 25, 'powder'], double: [15, 50, 'powder'], lump: [15, 25, 'lump'] }[name];
        if (!p) return;
        sT.value = String(p[0]); sA.value = String(p[1]); selForm.value = p[2];
        sT.dispatchEvent(new Event('input')); sA.dispatchEvent(new Event('input'));
        setState('ready');
      },
      record() {
        const done = state === 'done';
        return {
          'Temperature (°C)': sys.opts.T, 'Particles of A': sys.opts.nA, 'Form of A': form(),
          'Collisions in 10 s': done ? sys.coll : 'run first', 'Reactions in 10 s': done ? sys.react : 'run first'
        };
      }
    });

    [sT, sA].forEach((el) => el.addEventListener('input', () => setState('ready')));
    selForm.addEventListener('change', () => setState('ready'));
    startBtn.addEventListener('click', () => {
      if (!sim.committed) return;
      setState('running');
      sim.release();
    });
    resetBtn.addEventListener('click', () => { setState('ready'); sim.release(); });
    report();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
