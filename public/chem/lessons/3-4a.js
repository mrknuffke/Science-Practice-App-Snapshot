/* ============================================================
   3-4a LESSON INTERACTIVES
   Two tools in this lesson, both on TB.sim.create (RUNTIME_SPEC 4.3), both locked until the
   prediction is committed.
     1. The collision chamber. Brief: docs/plans/textbook-sim-briefs.md, "Chem 3-4a: Collision
        Chamber". Each chamber's particle speed comes from its own temperature, so two chambers
        at 50 degrees C start alike. The speed histogram is the Enrichment view.
        The two groups of particles keep their colour. Once the partition is out, each group's
        temperature relaxes toward the shared value (equal numbers of identical particles, so
        the shared value is the average) and the particles' speeds are held to it. Energy moves
        from one group to the other and the total never changes.
     2. The closed-system investigation: the hot and the cold component meet, then the whole
        system slowly cools toward the room if it is not well insulated.
   Zero em-dashes.
   ============================================================ */

/* ---------- 1. THE COLLISION CHAMBER ---------- */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);

  /* ---- the model ---- */
  const N = 30;                       // particles in each group
  const W = 340, H = 220, R = 4.5, EDGE = 5, MID = W / 2;
  const V0 = 60;                      // RMS speed in design units a second at 293.15 K
  const TAU = 2.0;                    // seconds for the temperature gap to fall by a factor e
  const SETTLED = 2;                  // the groups count as one temperature within this many degrees
  const DEFAULTS = { tA: 95, tB: 15 };

  const kelvin = (c) => c + 273.15;
  const meanV2 = (tC) => (V0 * V0 * kelvin(tC)) / 293.15;     // the mean of v squared that a temperature means

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

  // The temperatures of the two groups t seconds after the partition comes out.
  // Equal numbers of identical particles share the same heat capacity, so they meet at the average (in kelvin).
  function relaxed(tA, tB, t) {
    const kA = kelvin(tA), kB = kelvin(tB), m = (kA + kB) / 2, e = Math.exp(-t / TAU);
    return { A: m + (kA - m) * e - 273.15, B: m + (kB - m) * e - 273.15, shared: m - 273.15 };
  }

  function newChamber(tA, tB, seed) {
    const rand = rng(seed || 3401);
    const parts = [];
    ['A', 'B'].forEach((g) => {
      const sp = Math.sqrt(meanV2(g === 'A' ? tA : tB));
      for (let i = 0; i < N; i++) {
        const a = rand() * Math.PI * 2;
        const x0 = g === 'A' ? EDGE + R : MID + 2 + R, span = MID - 2 - R - (EDGE + R);
        parts.push({ g: g, x: x0 + rand() * span, y: EDGE + R + rand() * (H - 2 * (EDGE + R)), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
      }
    });
    return { tA0: tA, tB0: tB, parts: parts, open: false, since: 0, T: { A: tA, B: tB } };
  }

  function collide(parts) {
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const p = parts[i], q = parts[j];
        const dx = q.x - p.x, dy = q.y - p.y, d2 = dx * dx + dy * dy;
        if (d2 >= 4 * R * R || d2 < 1e-6) continue;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
        const k = (p.vx - q.vx) * nx + (p.vy - q.vy) * ny;
        if (k <= 0) continue;                       // already moving apart
        p.vx -= k * nx; p.vy -= k * ny; q.vx += k * nx; q.vy += k * ny;
        const o = (2 * R - d) / 2;
        p.x -= o * nx; p.y -= o * ny; q.x += o * nx; q.y += o * ny;
      }
    }
  }

  // One fixed step. Returns nothing; the chamber is changed in place.
  function step(ch, dt) {
    ch.parts.forEach((p) => {
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < EDGE + R) { p.x = EDGE + R; p.vx = Math.abs(p.vx); }
      if (p.x > W - EDGE - R) { p.x = W - EDGE - R; p.vx = -Math.abs(p.vx); }
      if (p.y < EDGE + R) { p.y = EDGE + R; p.vy = Math.abs(p.vy); }
      if (p.y > H - EDGE - R) { p.y = H - EDGE - R; p.vy = -Math.abs(p.vy); }
      if (!ch.open) {
        if (p.g === 'A' && p.x > MID - 2 - R) { p.x = MID - 2 - R; p.vx = -Math.abs(p.vx); }
        if (p.g === 'B' && p.x < MID + 2 + R) { p.x = MID + 2 + R; p.vx = Math.abs(p.vx); }
      }
    });
    collide(ch.parts);
    if (ch.open) { ch.since += dt; ch.T = relaxed(ch.tA0, ch.tB0, ch.since); }
    // hold each group's speeds to its temperature: energy only moves from one group to the other
    ['A', 'B'].forEach((g) => {
      const grp = ch.parts.filter((p) => p.g === g);
      const have = grp.reduce((s, p) => s + p.vx * p.vx + p.vy * p.vy, 0) / grp.length;
      if (have <= 0) return;
      const f = Math.sqrt(meanV2(ch.T[g]) / have);
      grp.forEach((p) => { p.vx *= f; p.vy *= f; });
    });
  }
  const settled = (ch) => ch.open && Math.abs(ch.T.A - ch.T.B) < SETTLED;
  function histogram(ch, bins, vMax) {
    const out = { A: new Array(bins).fill(0), B: new Array(bins).fill(0) };
    ch.parts.forEach((p) => { const b = Math.min(bins - 1, Math.floor((Math.hypot(p.vx, p.vy) / vMax) * bins)); out[p.g][b]++; });
    return out;
  }

  if (window.GC_MODELS) window.GC_MODELS['3-4a'] = { N: N, W: W, H: H, R: R, EDGE: EDGE, V0: V0, TAU: TAU, SETTLED: SETTLED, DEFAULTS: DEFAULTS, meanV2: meanV2, relaxed: relaxed, newChamber: newChamber, step: step, settled: settled, histogram: histogram };

  /* ---- the page ---- */
  function init() {
    const box = $('[data-sim="chamber"]');
    if (!box || !window.TB) return;
    const sA = $('#sliderTempA', box), sB = $('#sliderTempB', box);
    const mixBtn = $('#btnTogglePartition', box), resetBtn = $('#btnResetSandbox', box);
    const histBtn = $('[data-histogram]', box);
    const stage = $('.sim-stage', box);
    const note = $('[data-sim-note]', box);
    let ch = newChamber(Number(sA.value), Number(sB.value));
    let showHist = false, sim = null, tick = 0, wasSettled = false;

    function report() {
      sim.setReadout('a', ch.T.A.toFixed(0) + ' °C');
      sim.setReadout('b', ch.T.B.toFixed(0) + ' °C');
      sim.setReadout('part', ch.open ? 'Removed' : 'In place');
      if (!sim.committed) { sim.setStatus('neutral', 'Predict to start'); }
      else if (!ch.open) { sim.setStatus('neutral', 'Partition in place'); note.textContent = 'The two sides are separate. Each keeps its own temperature.'; }
      else if (settled(ch)) { sim.setStatus('ok', 'One temperature'); note.textContent = 'Both groups of particles now move at the same average speed. Energy still passes both ways, but the net flow is zero.'; }
      else { sim.setStatus('warn', 'Energy moving across'); note.textContent = 'Collisions pass kinetic energy from the fast particles to the slow ones. The red group slows down and the grey group speeds up.'; }
      sim.setLabel('A chamber of ' + 2 * N + ' particles. Red particles started on the left at ' + ch.tA0 + ' degrees C and grey ones on the right at ' + ch.tB0 + ' degrees C. The partition is ' + (ch.open ? 'removed' : 'in place') + '. The red group is at ' + ch.T.A.toFixed(0) + ' degrees C and the grey group is at ' + ch.T.B.toFixed(0) + '.');
    }
    function reset() {
      ch = newChamber(Number(sA.value), Number(sB.value));
      wasSettled = false; tick = 0;
      mixBtn.disabled = false;
      mixBtn.textContent = 'Remove partition and mix';
      report();
      sim.redraw();
    }

    /* ---- drawing ---- */
    const HX = 40, HY0 = 24;
    function drawChamber(ctx, env, fs) {
      const c = env.colors;
      ctx.fillStyle = c.card; ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(0.75, 0.75, W - 1.5, H - 1.5, 6); ctx.fill(); ctx.stroke();
      if (!ch.open) {
        ctx.strokeStyle = c.ink; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(MID, 8); ctx.lineTo(MID, H - 8); ctx.stroke();
      }
      ch.parts.forEach((p) => {
        const col = p.g === 'A' ? c.accent : c.inkSoft;
        ctx.strokeStyle = col; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.22, p.y - p.vy * 0.22); ctx.stroke();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2); ctx.fill();
      });
    }
    function drawHistogram(ctx, env, fs) {
      const c = env.colors, BINS = 12, V_MAX = V0 * 2.6;
      const h = histogram(ch, BINS, V_MAX);
      ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 0.5, W - 1, H - 1, 6); ctx.fill(); ctx.stroke();
      const x0 = HX, x1 = W - 14, y1 = H - 40, bw = (x1 - x0) / BINS, unit = (y1 - HY0) / 14;
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, HY0 - 6); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      for (let b = 0; b < BINS; b++) {
        const a = h.A[b] * unit, g = h.B[b] * unit;
        ctx.fillStyle = c.inkSoft; ctx.fillRect(x0 + b * bw + 1, y1 - g, bw - 2, g);
        ctx.fillStyle = c.accent; ctx.fillRect(x0 + b * bw + 1, y1 - g - a, bw - 2, a);
      }
      ctx.fillStyle = c.inkSoft; ctx.font = env.font(fs, 'display', 400); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('Speed →', (x0 + x1) / 2, y1 + 8);
      ctx.save(); ctx.translate(14, (HY0 + y1) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('Particles', 0, 0); ctx.restore();
    }
    function draw(ctx, env) {
      const two = showHist;
      const wide = env.w / env.h > 1.6;
      const dw = two ? (wide ? 2 * W + 20 : W) : W, dh = two ? (wide ? H : 2 * H + 16) : H;
      const k = Math.min(env.w / dw, env.h / dh);
      const fs = Math.max(12, 12 / k);
      ctx.save();
      ctx.translate((env.w - dw * k) / 2, (env.h - dh * k) / 2);
      ctx.scale(k, k);
      drawChamber(ctx, env, fs);
      if (two) { ctx.translate(wide ? W + 20 : 0, wide ? 0 : H + 16); drawHistogram(ctx, env, fs); }
      ctx.restore();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 2,         // about four presses reach one temperature
      init() { report(); },
      onUnlock() { report(); },
      update(dt) {
        step(ch, dt);
        if (!ch.open) return;
        const now = settled(ch);
        if (now !== wasSettled || ++tick % 10 === 0) { wasSettled = now; report(); }
      },
      draw: draw,
      preset(name) {
        const p = name.split(':');
        sA.value = p[0]; sB.value = p[1];
        sA.dispatchEvent(new Event('input')); sB.dispatchEvent(new Event('input'));
        reset();
      },
      record() {
        const all = ch.parts.length;
        const mean = (ch.T.A + ch.T.B) / 2;
        return { 'Left start (°C)': ch.tA0, 'Right start (°C)': ch.tB0, 'Left group now (°C)': ch.T.A.toFixed(0), 'Right group now (°C)': ch.T.B.toFixed(0), 'Mixed (°C)': ch.open && settled(ch) ? mean.toFixed(0) : 'not mixed yet', 'Particles': all };
      }
    });

    sA.addEventListener('input', reset);
    sB.addEventListener('input', reset);
    resetBtn.addEventListener('click', reset);
    mixBtn.addEventListener('click', () => {
      if (ch.open) return;
      ch.open = true;
      mixBtn.disabled = true;
      sim.release();
      report();
    });
    histBtn.addEventListener('click', () => {
      showHist = !showHist;
      histBtn.setAttribute('aria-pressed', String(showHist));
      if (showHist) stage.dataset.ratio = 'pair'; else delete stage.dataset.ratio;
      sim.redraw();
    });
    report();
  }
  document.addEventListener('DOMContentLoaded', init);
})();


/* ---------- 2. THE CLOSED-SYSTEM INVESTIGATION ---------- */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);

  /* ---- the model ---- */
  const ROOM = 21;                                  // degrees C
  const LOSS = { ideal: 0, moderate: 0.04, uninsulated: 0.15 };          // share of the gap to room lost by the end of the trial
  const DESIGNS = {
    'water-water': { name: '80 g hot water and 120 g cold water', hotLabel: '80 g hot water', coldLabel: '120 g cold water', capHot: 80 * 4.184, capCold: 120 * 4.184 },
    'metal-water': { name: '100 g aluminum block and 100 g water', hotLabel: '100 g aluminum block', coldLabel: '100 g water', capHot: 100 * 0.897, capCold: 100 * 4.184 }
  };
  const TAU_MIX = 0.08;                             // how fast the two components meet, on the sketch's time axis (0 to 1)
  const PRESETS = {
    unequal: { design: 'water-water', ins: 'ideal', hot: 80, cold: 20 },
    metal: { design: 'metal-water', ins: 'ideal', hot: 90, cold: 20 },
    leak: { design: 'water-water', ins: 'uninsulated', hot: 80, cold: 20 }
  };

  // The ideal equilibrium: the heat the hot part loses is the heat the cold part gains.
  function equilibrium(design, ins, hot, cold) {
    const d = DESIGNS[design];
    if (!d || !isFinite(hot) || !isFinite(cold)) return null;
    const ideal = (d.capHot * hot + d.capCold * cold) / (d.capHot + d.capCold);
    const f = LOSS[ins] === undefined ? 0 : LOSS[ins];
    const L = f > 0 ? -Math.log(1 - f) : 0;
    return { d: d, hot: hot, cold: cold, ideal: ideal, loss: f, L: L, end: ROOM + (ideal - ROOM) * Math.exp(-L), qMoved: d.capHot * (hot - ideal) };
  }
  // The temperatures of the two components at x (0 to 1) along the trial.
  function temps(eq, x) {
    const common = ROOM + (eq.ideal - ROOM) * Math.exp(-eq.L * x), e = Math.exp(-x / TAU_MIX);
    return { hot: common + (eq.hot - eq.ideal) * e, cold: common + (eq.cold - eq.ideal) * e, common: common };
  }
  if (window.GC_MODELS) window.GC_MODELS['3-4a-trial'] = { equilibrium: equilibrium, temps: temps, DESIGNS: DESIGNS, LOSS: LOSS, ROOM: ROOM, PRESETS: PRESETS, TAU_MIX: TAU_MIX };

  const TRIAL_S = 4;
  const GW = 500, GH = 220;

  function init() {
    const box = $('[data-sim="investigation"]');
    if (!box || !window.TB) return;
    const design = $('#invType', box), ins = $('#invInsulation', box), hot = $('#invThot', box), cold = $('#invTcold', box);
    const runBtn = $('#btnRunInvestigation', box);
    const note = $('[data-sim-note]', box);
    let sim = null, state = 'ready', runT = 0, last = '';

    const read = () => equilibrium(design.value, ins.value, Number(hot.value), Number(cold.value));
    const progress = () => (state === 'ready' ? 0 : state === 'done' ? 1 : Math.min(1, runT / TRIAL_S));

    function clear() { ['eq', 'end', 'dh', 'dc'].forEach((id) => sim.setReadout(id, '–')); }
    function show(eq) {
      sim.setReadout('eq', eq.ideal.toFixed(1) + ' °C');
      sim.setReadout('end', eq.end.toFixed(1) + ' °C');
      sim.setReadout('dh', '−' + (eq.hot - eq.end).toFixed(1) + ' °C');
      sim.setReadout('dc', '+' + (eq.end - eq.cold).toFixed(1) + ' °C');
    }
    function report() {
      const eq = read();
      if (!sim.committed) sim.setStatus('neutral', 'Predict to start');
      else if (state === 'ready') sim.setStatus('neutral', 'Ready to start the trial');
      else if (state === 'running') sim.setStatus('warn', 'Trial running');
      else sim.setStatus('ok', 'Trial finished');
      sim.setLabel('A graph of temperature against time for ' + eq.d.name + '. The hot part starts at ' + eq.hot + ' degrees C and the cold part at ' + eq.cold + '. ' + (state === 'done' ? 'Both end at ' + eq.end.toFixed(1) + ' degrees C.' : 'The trial has not run yet.'));
    }
    function setState(next) {
      state = next; runT = 0;
      runBtn.disabled = false;
      if (next === 'ready') { clear(); note.textContent = 'Press Start trial to run the investigation.'; }
      report();
      sim.redraw();
    }
    function onChange() {
      const d = DESIGNS[design.value];
      $('#invLabelThot', box).textContent = d.hotLabel + ' starts at';
      $('#invLabelTcold', box).textContent = d.coldLabel + ' starts at';
      setState('ready');
    }

    /* ---- drawing ---- */
    const X0 = 62, X1 = GW - 14, Y0 = GH - 56, Y1 = 14;
    const gx = (x) => X0 + x * (X1 - X0);
    const gy = (T) => Y0 - (Math.max(0, Math.min(100, T)) / 100) * (Y0 - Y1);
    function pathFor(eq, key, p) {
      let d = '';
      const n = Math.max(2, Math.round(60 * p));
      for (let i = 0; i <= n; i++) { const x = (i / n) * p; d += (i ? 'L' : 'M') + gx(x).toFixed(1) + ' ' + gy(temps(eq, x)[key]).toFixed(1); }
      return d;
    }
    function draw(svg, env) {
      const k = Math.min(env.w / GW, env.h / GH);
      const fs = Math.max(12, 12 / k).toFixed(2);
      const eq = read(), p = progress();
      const ox = (env.w - GW * k) / 2, oy = (env.h - GH * k) / 2;
      let g = '';
      [0, 50, 100].forEach((T) => { g += '<line x1="' + X0 + '" y1="' + gy(T).toFixed(1) + '" x2="' + X1 + '" y2="' + gy(T).toFixed(1) + '" stroke="var(--hair)" stroke-width="1" stroke-dasharray="' + (T ? '3 3' : '0') + '"/>' +
        '<text x="' + (X0 - 8) + '" y="' + (gy(T) + 4).toFixed(1) + '" font-size="' + fs + '" font-family="var(--mono)" fill="var(--ink-soft)" text-anchor="end">' + T + '</text>'; });
      g += '<line x1="' + X0 + '" y1="' + Y1 + '" x2="' + X0 + '" y2="' + Y0 + '" stroke="var(--ink)" stroke-width="1.5"/>' +
        '<text x="' + ((X0 + X1) / 2) + '" y="' + (Y0 + 8 + Number(fs) * 1.1).toFixed(1) + '" font-size="' + fs + '" font-weight="700" fill="var(--ink)" text-anchor="middle">Time →</text>' +
        '<text x="14" y="' + ((Y0 + Y1) / 2) + '" font-size="' + fs + '" font-weight="700" fill="var(--ink)" text-anchor="middle" transform="rotate(-90 14 ' + ((Y0 + Y1) / 2) + ')">Temperature (°C)</text>';
      if (state === 'done') {
        g += '<line x1="' + X0 + '" y1="' + gy(eq.end).toFixed(1) + '" x2="' + X1 + '" y2="' + gy(eq.end).toFixed(1) + '" stroke="var(--good)" stroke-width="1.5" stroke-dasharray="5 4"/>' +
          '<text x="' + (X1 - 4) + '" y="' + (gy(eq.end) - 6).toFixed(1) + '" font-size="' + fs + '" font-weight="700" font-family="var(--mono)" fill="var(--good)" text-anchor="end">' + eq.end.toFixed(1) + ' °C</text>';
      }
      if (state !== 'ready') {
        g += '<path d="' + pathFor(eq, 'hot', p) + '" fill="none" stroke="var(--accent)" stroke-width="3"/><path d="' + pathFor(eq, 'cold', p) + '" fill="none" stroke="var(--ink-soft)" stroke-width="3"/>';
      } else {
        g += '<circle cx="' + gx(0) + '" cy="' + gy(eq.hot).toFixed(1) + '" r="5" fill="var(--accent)"/><circle cx="' + gx(0) + '" cy="' + gy(eq.cold).toFixed(1) + '" r="5" fill="var(--ink-soft)"/>';
      }
      const html = '<g font-family="var(--display)" transform="translate(' + ox.toFixed(1) + ',' + oy.toFixed(1) + ') scale(' + k.toFixed(4) + ')">' + g + '</g>';
      if (html !== last) { svg.innerHTML = html; last = html; }
    }

    sim = window.TB.sim.create(box, {
      kind: 'svg',
      loop: true,
      stepSeconds: 2.1,       // two presses run the 4 s trial
      init() { onChange(); },
      onUnlock() { report(); },
      update(dt) {
        if (state !== 'running') return;
        runT += dt;
        if (runT >= TRIAL_S) {
          state = 'done';
          const eq = read();
          show(eq);
          note.textContent = eq.loss === 0
            ? 'Both curves meet at ' + eq.end.toFixed(1) + ' °C and stay there. No energy left the closed system.'
            : 'Both curves meet at ' + eq.ideal.toFixed(1) + ' °C, then the whole system cools toward the room. It ends at ' + eq.end.toFixed(1) + ' °C because heat also leaves to the room.';
          report();
        }
      },
      draw: draw,
      preset(name) {
        const p = PRESETS[name];
        if (!p) return;
        design.value = p.design; ins.value = p.ins; hot.value = String(p.hot); cold.value = String(p.cold);
        hot.dispatchEvent(new Event('input')); cold.dispatchEvent(new Event('input'));
        onChange();
      },
      record() {
        const eq = read();
        return { 'Design': eq.d.name, 'Insulation': ins.options[ins.selectedIndex].dataset.short, 'Hot start (°C)': eq.hot, 'Cold start (°C)': eq.cold, 'Final (°C)': state === 'done' ? eq.end.toFixed(1) : 'run first' };
      }
    });
    [design, ins, hot, cold].forEach((el) => { el.addEventListener('change', onChange); el.addEventListener('input', onChange); });
    runBtn.addEventListener('click', () => {
      if (!sim.committed) return;
      runT = 0; state = 'running';
      note.textContent = 'The hot part cools and the cold part warms.';
      sim.release();
      report();
    });
    onChange();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
