/* ============================================================
   5-1a LESSON INTERACTIVES
   The Sun: a looping canvas on TB.sim.create (RUNTIME_SPEC 4.3), locked until the prediction is
   committed. REDESIGN. Brief: docs/plans/textbook-sim-briefs.md, "Chem 5-1a: The Sun".

   The old simulator animated protons turning into helium. The PE leaves out the sub-atomic detail,
   and the old animation turned two protons into one helium nucleus. That animation is gone. The
   p-p chain is a still figure in an Enrichment block.

   Two pushes act on the star, and both are drawn as arrows:
       gravity (in)    G = 1 / x^4              x is the star's size, 1.00 at balance
       pressure (out)  P = (1 + d) / x^5        d is how far the core temperature is from balance
   Squeezing a star heats its core and swelling cools it (core temperature = (15 + D) / x^2 MK, with
   D the disturbance in MK). The star's size follows the net push: x' = K (1 + d - x). Fusion pulls
   the disturbance back to nothing: D' = -D / TAU. So a cooled core shrinks the star at first,
   then the star swells back to its old size. A heated core does the reverse.

   Mass step (no run): a star of mass M sits at its own balance.
       size        M^0.8 Suns         core temperature  15 M^0.55 MK
       brightness  M^4 Suns           lifetime          10 M / M^4 = 10 / M^3 billion years
   The exponent 4 matches the exam (twice the Sun's mass is 16 times as bright, lifetime 1.25
   billion years). Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);

  /* ---- the model ---- */
  const T_SUN = 15;                    // MK, core temperature of the Sun
  const K = 3;                         // 1/s, how fast the size follows the net push
  const TAU = 3;                       // s, how fast fusion removes the disturbance
  const TOL = 0.01, CALM_S = 0.5;      // settled when size and disturbance stay within 1% for half a second
  const SAMPLE_S = 0.1, CHART_S = 12;  // the chart takes a point this often and shows this many seconds
  const DEFAULTS = { T: 15, M: 1 };

  const massTemp = (m) => T_SUN * Math.pow(m, 0.55);
  const massSize = (m) => Math.pow(m, 0.8);
  const brightness = (m) => m * m * m * m;
  const lifetime = (m) => (10 * m) / brightness(m);

  function newRun(T0) {
    return { T0: T0, D: T0 - T_SUN, x: 1, t: 0, calm: 0, settled: false, series: [[0, 1]], next: SAMPLE_S, minX: 1, maxX: 1 };
  }
  // the two pushes, in units of the push at balance
  function pushes(r) {
    const i = 1 / r.x, i2 = i * i, i4 = i2 * i2;
    return { P: (1 + r.D / T_SUN) * i4 * i, G: i4 };
  }
  const coreT = (r) => { const i = 1 / r.x; return (T_SUN + r.D) * i * i; };
  function step(r, dt) {
    r.x += K * ((1 + r.D / T_SUN) - r.x) * dt;
    r.D -= (r.D * dt) / TAU;
    r.t += dt;
    if (r.x < r.minX) r.minX = r.x;
    if (r.x > r.maxX) r.maxX = r.x;
    if (Math.abs(r.x - 1) < TOL && Math.abs(r.D) / T_SUN < TOL) r.calm += dt; else r.calm = 0;
    if (r.calm >= CALM_S) { r.settled = true; r.x = 1; r.D = 0; }   // inside 1% for half a second: the thermostat has finished
    while (r.t >= r.next - 1e-9 && r.next <= CHART_S + 1e-9) { r.series.push([r.next, r.x]); r.next += SAMPLE_S; }
  }
  const startPush = (T0) => (T0 < T_SUN ? 'Gravity' : T0 > T_SUN ? 'Pressure' : 'Equal');
  const behaviour = (T0) => (T0 < T_SUN ? 'Shrinks, then recovers' : T0 > T_SUN ? 'Swells, then recovers' : 'Holds its size');

  if (window.GC_MODELS) window.GC_MODELS['5-1a'] = { T_SUN: T_SUN, K: K, TAU: TAU, TOL: TOL, CALM_S: CALM_S, CHART_S: CHART_S, DEFAULTS: DEFAULTS, massTemp: massTemp, massSize: massSize, brightness: brightness, lifetime: lifetime, newRun: newRun, pushes: pushes, coreT: coreT, step: step, startPush: startPush, behaviour: behaviour };

  /* ---- the page ---- */
  const f2 = (x) => x.toFixed(2);
  const fBright = (b) => (b >= 10 ? String(Math.round(b)) : b >= 1 ? b.toFixed(1) : b.toFixed(2));
  const fLife = (y) => (y >= 10 ? String(Math.round(y)) : y >= 2 ? y.toFixed(1) : y.toFixed(2));

  function init() {
    const box = $('[data-sim="sun"]');
    if (!box || !window.TB) return;
    const sT = $('#sunTemp', box), sM = $('#sunMass', box);
    const startBtn = $('#btnSunStart', box), resetBtn = $('#btnSunReset', box);
    const note = $('[data-sim-note]', box);
    const W = 340, H = 220, GX0 = 46, GX1 = W - 14, GY0 = H - 40, GY1 = 18, YLO = 0.6, YHI = 1.4;
    let state = 'ready', sim = null, tick = 0;
    let run = newRun(DEFAULTS.T);
    let M = DEFAULTS.M;

    const readTemp = () => Number(sT.value);
    const readMass = () => Number(sM.value);
    const sun = () => M === 1;

    function view() {
      // what the star looks like right now: size in Suns, the pushes, the core temperature
      if (sun()) {
        const p = pushes(run);
        return { size: run.x, P: p.P, G: p.G, T: coreT(run) };
      }
      const g = massTemp(M) / T_SUN;
      return { size: massSize(M), P: g, G: g, T: massTemp(M) };
    }
    function report() {
      const v = view();
      sim.setReadout('mass', M.toFixed(1) + ' Suns');
      sim.setReadout('temp', v.T.toFixed(1) + ' MK');
      sim.setReadout('size', f2(v.size));
      sim.setReadout('grav', f2(v.G));
      sim.setReadout('pres', f2(v.P));
      sim.setReadout('bright', fBright(brightness(M)) + ' Suns');
      sim.setReadout('life', fLife(lifetime(M)));
      if (!sim.committed) sim.setStatus('neutral', 'Predict to start');
      else if (!sun()) sim.setStatus('ok', 'Balanced at its own mass');
      else if (state === 'running') sim.setStatus('warn', run.D < 0 ? 'Shrinking, core heating' : run.D > 0 ? 'Swelling, core cooling' : 'Balanced');
      else if (state === 'done') sim.setStatus('ok', 'Settled: back to the same size');
      else sim.setStatus(run.D === 0 ? 'ok' : 'neutral', run.D === 0 ? 'Balanced' : 'Ready to release');
      sim.setLabel('A star of ' + f2(v.size) + ' times the Sun’s size with its core at ' + v.T.toFixed(1) + ' million kelvin. Arrows show gravity pulling in with a push of ' + f2(v.G) + ' and pressure pushing out with a push of ' + f2(v.P) + ', beside a chart of the star’s size over time. ' + (state === 'done' ? 'The star has settled back to its balanced size.' : ''));
      sT.disabled = !sun() || state === 'running';
      startBtn.disabled = !sun() || state === 'running' || (state === 'ready' && run.D === 0);
    }
    function sentence() {
      if (!sim.committed) return 'The explanation appears after you predict.';
      if (!sun()) return 'This star sits at its own balance. A star with more mass has a hotter core, a bigger gravity push, more brightness and a shorter life. Set the mass back to 1.0 to test a change in core temperature.';
      if (state === 'ready') return run.D === 0 ? 'The Sun is in balance: gravity and pressure are equal. Set a core temperature, then press Start run.' : 'The core starts ' + (run.D < 0 ? 'cooler' : 'hotter') + ' than balance. The ' + (run.D < 0 ? 'gravity' : 'pressure') + ' push is the bigger one. Press Start run to release the star.';
      if (state === 'running') return 'The bigger push moves the star. Squeezing heats the core and swelling cools it, so the pushes come level again.';
      return 'The run stopped when the star settled. Press Record to keep the result, or change a control.';
    }
    function setState(next) {
      state = next;
      if (next === 'ready' || next === 'idle') { state = 'ready'; run = newRun(readTemp()); }
      tick = 0;
      note.textContent = sentence();
      report();
      sim.redraw();
    }

    /* ---- drawing ---- */
    function arrow(ctx, x0, y0, x1, y1, color, head) {
      const a = Math.atan2(y1 - y0, x1 - x0);
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - Math.cos(a - 0.45) * head, y1 - Math.sin(a - 0.45) * head);
      ctx.lineTo(x1 - Math.cos(a + 0.45) * head, y1 - Math.sin(a + 0.45) * head);
      ctx.closePath(); ctx.fill();
    }
    function drawStar(ctx, env) {
      const c = env.colors, v = view();
      ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 0.5, W - 1, H - 1, 6); ctx.fill(); ctx.stroke();
      const cx = W / 2, cy = H / 2, r = 40 * v.size;
      ctx.globalAlpha = 0.4; ctx.fillStyle = c.warn; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = c.warn; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(cx, cy, Math.max(4, r * 0.18), 0, Math.PI * 2); ctx.fill();
      const lenP = 20 * Math.sqrt(v.P), lenG = 20 * Math.sqrt(v.G), gap = 8;
      // pressure pushes out along the axes, gravity pulls in along the diagonals
      [[1, 0], [0, 1], [-1, 0], [0, -1]].forEach((d) => {
        arrow(ctx, cx + d[0] * (r + gap), cy + d[1] * (r + gap), cx + d[0] * (r + gap + lenP), cy + d[1] * (r + gap + lenP), c.accent, 9);
      });
      [[1, 1], [-1, 1], [-1, -1], [1, -1]].forEach((d) => {
        const k = Math.SQRT1_2;
        arrow(ctx, cx + d[0] * k * (r + gap + lenG), cy + d[1] * k * (r + gap + lenG), cx + d[0] * k * (r + gap), cy + d[1] * k * (r + gap), c.ink, 9);
      });
    }
    const gx = (t) => GX0 + (Math.min(CHART_S, t) / CHART_S) * (GX1 - GX0);
    const gy = (v) => GY0 - ((Math.max(YLO, Math.min(YHI, v)) - YLO) / (YHI - YLO)) * (GY0 - GY1);
    function drawChart(ctx, env, fs) {
      const c = env.colors;
      ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 0.5, W - 1, H - 1, 6); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(GX0, GY1 - 4); ctx.lineTo(GX0, GY0); ctx.lineTo(GX1, GY0); ctx.stroke();
      ctx.strokeStyle = c.inkMute; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(GX0, gy(1)); ctx.lineTo(GX1, gy(1)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = c.inkSoft; ctx.font = env.font(fs, 'mono', 400); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      [0, 6, 12].forEach((t) => ctx.fillText(String(t), gx(t), GY0 + 5));
      ctx.font = env.font(fs, 'display', 400);
      ctx.fillText('Time (s) →', (GX0 + GX1) / 2, GY0 + 5 + fs * 1.15);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.font = env.font(fs, 'mono', 400);
      [0.6, 1, 1.4].forEach((v) => ctx.fillText(v.toFixed(1), GX0 - 6, gy(v)));
      ctx.save(); ctx.translate(11, (GY0 + GY1) / 2); ctx.rotate(-Math.PI / 2);
      ctx.font = env.font(fs, 'display', 400); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.inkSoft;
      ctx.fillText('Star size', 0, 0); ctx.restore();
      if (sun() && run.series.length > 1) {
        ctx.strokeStyle = c.cool; ctx.lineWidth = 3; ctx.lineJoin = 'round';
        ctx.beginPath();
        run.series.forEach((pt, i) => { if (i) ctx.lineTo(gx(pt[0]), gy(pt[1])); else ctx.moveTo(gx(pt[0]), gy(pt[1])); });
        ctx.stroke();
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
      drawStar(ctx, env);
      ctx.translate(wide ? W + 20 : 0, wide ? 0 : H + 16);
      drawChart(ctx, env, fs);
      ctx.restore();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 4,         // three presses reach the longest settle
      init() { note.textContent = sentence(); report(); },
      onUnlock() { note.textContent = sentence(); report(); },
      update(dt) {
        if (state !== 'running') return;
        step(run, dt);
        if (run.settled) { state = 'done'; note.textContent = sentence(); report(); sim.hold(); return; }
        if (++tick % 6 === 0) report();
      },
      draw: draw,
      preset(name) {
        const p = { cool: [12, 1], hot: [18, 1], big: [15, 2], small: [15, 0.5] }[name];
        if (!p) return;
        sT.value = String(p[0]); sM.value = String(p[1]);
        sT.dispatchEvent(new Event('input')); sM.dispatchEvent(new Event('input'));
        M = p[1];
        setState('ready');
        sim.release();
      },
      record() {
        const done = state === 'done';
        const T0 = sun() ? readTemp() : null;
        return {
          'Mass (Suns)': M.toFixed(1),
          'Core temperature (MK)': sun() ? T0 : massTemp(M).toFixed(1),
          'Bigger push at the start': sun() ? startPush(T0) : 'Equal',
          'What the star does': sun() ? (done || run.D === 0 ? behaviour(T0) : 'run first') : 'Holds its size',
          'Brightness (Suns)': fBright(brightness(M)),
          'Lifetime (billion years)': fLife(lifetime(M))
        };
      }
    });

    sT.addEventListener('input', () => setState('ready'));
    sM.addEventListener('input', () => { M = readMass(); setState('ready'); });
    startBtn.addEventListener('click', () => {
      if (!sim.committed || !sun() || run.D === 0) return;
      run = newRun(readTemp());
      state = 'running';
      note.textContent = sentence();
      report();
      sim.release();
    });
    resetBtn.addEventListener('click', () => {
      sT.value = String(DEFAULTS.T); sM.value = String(DEFAULTS.M);
      sT.dispatchEvent(new Event('input')); sM.dispatchEvent(new Event('input'));
      M = DEFAULTS.M;
      setState('ready');
      sim.release();
    });
    report();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
