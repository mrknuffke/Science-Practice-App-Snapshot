/* ============================================================
   3-1a LESSON INTERACTIVES
   Two tools in this lesson. Both lock until their prediction is committed.
     1. Two Vessels: a looping canvas on TB.sim.create (RUNTIME_SPEC 4.3). Brief:
        docs/plans/textbook-sim-briefs.md, "Chem 3-1a: Two Vessels".
        Thermal energy is counted from 0 degrees C (the brief's default), so it is m * c * T
        with T in degrees C. The particle bar shows slower to faster, not a speed in m/s.
     2. The q = mc(delta T) calculator (a DOM tool, locked with GC_GATE_TOOL).
   Zero em-dashes.
   ============================================================ */

/* ---------- 1. TWO VESSELS ---------- */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));

  /* ---- the model ---- */
  const C_WATER = 4.18;                         // J/(g*C), the value in the lesson's table
  const W = 320, VH = 190, BAR_H = 56;          // one vessel, in design units
  const R = 5;                                  // particle radius
  const SPEED_20C = 90;                         // design units a second at 20 C
  const T_MIN = 10, T_MAX = 100;
  const DEFAULTS = { tA: 80, mA: 50, tB: 30, mB: 250 };

  const energyKJ = (mass, temp) => (mass * C_WATER * temp) / 1000;          // above 0 C
  const kelvin = (temp) => temp + 273.15;
  const speed = (temp) => SPEED_20C * Math.sqrt(kelvin(temp) / 293.15);
  // where the marker sits on the slower-to-faster bar, 0 to 1
  const barPos = (temp) => (Math.sqrt(kelvin(temp)) - Math.sqrt(kelvin(T_MIN))) / (Math.sqrt(kelvin(T_MAX)) - Math.sqrt(kelvin(T_MIN)));
  const dotCount = (mass) => Math.max(5, Math.round(mass / 4));              // one dot is about 4 g

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

  function newVessel(seed) {
    return { rand: rng(seed), dots: [] };
  }
  function setDots(v, n) {
    while (v.dots.length < n) {
      const a = v.rand() * Math.PI * 2;
      v.dots.push({ x: R + v.rand() * (W - 2 * R), y: R + v.rand() * (VH - 2 * R), ux: Math.cos(a), uy: Math.sin(a) });
    }
    v.dots.length = n;
  }
  function stepVessel(v, temp, dt) {
    const sp = speed(temp) * dt;
    v.dots.forEach((p) => {
      p.x += p.ux * sp; p.y += p.uy * sp;
      if (p.x < R) { p.x = R; p.ux = Math.abs(p.ux); }
      if (p.x > W - R) { p.x = W - R; p.ux = -Math.abs(p.ux); }
      if (p.y < R) { p.y = R; p.uy = Math.abs(p.uy); }
      if (p.y > VH - R) { p.y = VH - R; p.uy = -Math.abs(p.uy); }
    });
  }

  if (window.GC_MODELS) window.GC_MODELS['3-1a'] = { C_WATER: C_WATER, energyKJ: energyKJ, speed: speed, barPos: barPos, dotCount: dotCount, newVessel: newVessel, setDots: setDots, stepVessel: stepVessel, DEFAULTS: DEFAULTS, W: W, VH: VH, R: R };

  /* ---- the page ---- */
  function init() {
    const box = $('[data-sim="vessels"]');
    if (!box || !window.TB) return;
    const inputs = { tA: $('#vesTempA', box), mA: $('#vesMassA', box), tB: $('#vesTempB', box), mB: $('#vesMassB', box) };
    const note = $('[data-sim-note]', box);
    const A = newVessel(3101), B = newVessel(3102);
    const state = { tA: DEFAULTS.tA, mA: DEFAULTS.mA, tB: DEFAULTS.tB, mB: DEFAULTS.mB };
    setDots(A, dotCount(state.mA)); setDots(B, dotCount(state.mB));
    let sim = null;

    const fmt = (kj) => kj.toFixed(1) + ' kJ';

    function report() {
      const eA = energyKJ(state.mA, state.tA), eB = energyKJ(state.mB, state.tB);
      const more = Math.abs(eA - eB) < 0.05 ? 'Equal' : (eA > eB ? 'Vessel A' : 'Vessel B');
      sim.setReadout('eA', fmt(eA));
      sim.setReadout('eB', fmt(eB));
      sim.setReadout('more', more);
      const hotter = state.tA === state.tB ? 'The vessels are at the same temperature.' : (state.tA > state.tB ? 'Vessel A is hotter.' : 'Vessel B is hotter.');
      if (sim.committed) {
        const verdict = more === 'Equal' ? 'They hold equal thermal energy.' : more + ' holds more thermal energy.';
        sim.setStatus('neutral', hotter + ' ' + verdict);
        note.textContent = 'Vessel A: ' + state.mA + ' g at ' + state.tA + ' °C holds ' + fmt(eA) + '. Vessel B: ' + state.mB + ' g at ' + state.tB + ' °C holds ' + fmt(eB) + '. Energy is counted above 0 °C.';
      } else {
        sim.setStatus('neutral', 'Predict to start');
      }
      sim.setLabel('Two vessels of water. Vessel A: ' + state.mA + ' g at ' + state.tA + ' degrees C, ' + dotCount(state.mA) + ' particles. Vessel B: ' + state.mB + ' g at ' + state.tB + ' degrees C, ' + dotCount(state.mB) + ' particles.');
    }

    function read() {
      state.tA = Number(inputs.tA.value); state.mA = Number(inputs.mA.value);
      state.tB = Number(inputs.tB.value); state.mB = Number(inputs.mB.value);
      setDots(A, dotCount(state.mA)); setDots(B, dotCount(state.mB));
      report();
      sim.redraw();
    }

    /* ---- drawing ---- */
    function drawVessel(ctx, env, v, temp, title, dotColor, fs) {
      const c = env.colors;
      ctx.fillStyle = c.card; ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(0.75, 0.75, W - 1.5, VH - 1.5, 6); ctx.fill(); ctx.stroke();
      ctx.save();
      ctx.beginPath(); ctx.roundRect(1, 1, W - 2, VH - 2, 6); ctx.clip();
      ctx.fillStyle = dotColor;
      v.dots.forEach((p) => { ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2); ctx.fill(); });
      ctx.restore();
      ctx.fillStyle = c.ink; ctx.font = env.font(fs, 'display', 700); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(title, 8, VH + 8);
      // the slower-to-faster bar
      const bx = 70, bw = W - 140, by = VH + 34;
      ctx.fillStyle = c.hair; ctx.beginPath(); ctx.roundRect(bx, by, bw, 8, 4); ctx.fill();
      ctx.fillStyle = c.inkSoft; ctx.font = env.font(fs, 'display', 400); ctx.textBaseline = 'middle';
      ctx.textAlign = 'right'; ctx.fillText('slower', bx - 8, by + 4);
      ctx.textAlign = 'left'; ctx.fillText('faster', bx + bw + 8, by + 4);
      const mx = bx + barPos(temp) * bw;
      ctx.fillStyle = dotColor; ctx.beginPath(); ctx.arc(mx, by + 4, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = c.paper; ctx.lineWidth = 2; ctx.stroke();
    }
    function draw(ctx, env) {
      const wide = env.w / env.h > 1.5;
      const one = VH + BAR_H;
      const dw = wide ? 2 * W + 20 : W, dh = wide ? one : 2 * one + 20;
      const k = Math.min(env.w / dw, env.h / dh);
      ctx.save();
      ctx.translate((env.w - dw * k) / 2, (env.h - dh * k) / 2);
      ctx.scale(k, k);
      const fs = Math.max(12, 12 / k);   // labels stay 12 px on screen whatever the scale
      drawVessel(ctx, env, A, state.tA, 'Vessel A', env.colors.accent, fs);
      ctx.translate(wide ? W + 20 : 0, wide ? 0 : one + 20);
      drawVessel(ctx, env, B, state.tB, 'Vessel B', env.colors.inkSoft, fs);
      ctx.restore();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 0.5,
      init() { report(); },
      onUnlock() { report(); },
      update(dt) { stepVessel(A, state.tA, dt); stepVessel(B, state.tB, dt); },
      draw: draw,
      preset(name) {
        const sets = { start: [80, 50, 30, 250], same: [40, 50, 40, 200], extreme: [100, 20, 20, 300] };
        const s = sets[name];
        if (!s) return;
        [inputs.tA, inputs.mA, inputs.tB, inputs.mB].forEach((el, i) => { el.value = String(s[i]); el.dispatchEvent(new Event('input')); });
      },
      record() {
        return {
          'A mass (g)': state.mA, 'A temperature (°C)': state.tA, 'A energy (kJ)': energyKJ(state.mA, state.tA).toFixed(1),
          'B mass (g)': state.mB, 'B temperature (°C)': state.tB, 'B energy (kJ)': energyKJ(state.mB, state.tB).toFixed(1)
        };
      }
    });
    Object.keys(inputs).forEach((k) => inputs[k].addEventListener('input', read));
    report();
  }

  document.addEventListener('DOMContentLoaded', init);
})();


/* ---------- 2. THE HEAT CALCULATOR (q = mc delta T) ---------- */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));

  const SUBSTANCES = {
    water: { name: 'Water (liquid)', c: 4.18 },
    ethanol: { name: 'Ethanol', c: 2.44 },
    aluminum: { name: 'Aluminum', c: 0.897 },
    granite: { name: 'Granite', c: 0.79 },
    iron: { name: 'Iron', c: 0.449 },
    copper: { name: 'Copper', c: 0.385 }
  };
  const PRESETS = {
    coffee: { sub: 'water', m: 150, ti: 20, tf: 80 },
    aluminum: { sub: 'aluminum', m: 450, ti: 25, tf: 200 },
    iron: { sub: 'iron', m: 1200, ti: 450, tf: 25 }
  };

  // q = m c delta T, in joules. Returns null when an input is not a usable number.
  function heat(sub, m, ti, tf) {
    const s = SUBSTANCES[sub];
    if (!s || !isFinite(m) || !isFinite(ti) || !isFinite(tf) || m <= 0) return null;
    const dT = tf - ti;
    return { c: s.c, name: s.name, m: m, ti: ti, tf: tf, dT: dT, q: m * s.c * dT };
  }
  if (window.GC_MODELS) window.GC_MODELS['3-1a-heat'] = { heat: heat, SUBSTANCES: SUBSTANCES, PRESETS: PRESETS };

  const sign = (x) => (x > 0 ? '+' : x < 0 ? '−' : '');
  const num = (x, d) => Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  function init() {
    const box = $('[data-tool="heat"]');
    if (!box || !window.GC_GATE_TOOL) return;
    const sub = $('#calcSubstance', box), mass = $('#calcMass', box), ti = $('#calcTi', box), tf = $('#calcTf', box);
    const steps = $('[data-steps]', box);
    const pill = $('.status-pill', box);
    const read = (id, text) => { const el = $('[data-readout="' + id + '"] .readout-value', box); if (el) el.textContent = text; };
    let live = false;

    function show(r) {
      const q = r.q, kj = q / 1000;
      read('q', sign(q) + num(kj, 2) + ' kJ');
      read('dT', sign(r.dT) + num(r.dT, 1) + ' °C');
      read('dir', q > 0 ? 'Into the sample' : q < 0 ? 'Out of the sample' : 'None');
      steps.textContent = '';
      const add = (html, cls) => { const p = document.createElement('p'); if (cls) p.className = cls; p.innerHTML = html; steps.appendChild(p); };
      add('<b>1. List the givens.</b> ' + r.name + ': <em>c</em> = ' + r.c + ' J/(g&middot;&deg;C). <em>m</em> = ' + num(r.m, 0) + ' g. &Delta;<em>T</em> = ' + r.tf.toFixed(1) + ' &minus; ' + r.ti.toFixed(1) + ' = ' + sign(r.dT) + num(r.dT, 1) + ' &deg;C.');
      add('<b>2. Substitute.</b> <em>q</em> = (' + num(r.m, 0) + ' g)(' + r.c + ' J/(g&middot;&deg;C))(' + sign(r.dT) + num(r.dT, 1) + ' &deg;C)');
      add('<b>3. Multiply.</b> <em>q</em> = ' + sign(q) + num(q, 1) + ' J = ' + sign(q) + num(kj, 2) + ' kJ', 'calc-result');
      add(q > 0 ? 'The sign is positive: the sample absorbed ' + num(kj, 2) + ' kJ, so its particles move faster.'
        : q < 0 ? 'The sign is negative: the sample released ' + num(kj, 2) + ' kJ to its surroundings, so its particles move slower.'
          : 'The temperature did not change, so <em>q</em> = 0.');
      pill.dataset.state = q > 0 ? 'ok' : 'neutral';
      pill.textContent = q > 0 ? 'Energy absorbed' : q < 0 ? 'Energy released' : 'No change';
    }
    function update() {
      if (!live) return;
      const r = heat(sub.value, parseFloat(mass.value), parseFloat(ti.value), parseFloat(tf.value));
      if (!r) {
        pill.dataset.state = 'alert';
        pill.textContent = 'Enter a positive mass and two temperatures';
        steps.textContent = '';
        ['q', 'dT', 'dir'].forEach((id) => read(id, '–'));
        return;
      }
      show(r);
    }
    [sub, mass, ti, tf].forEach((el) => { el.addEventListener('input', update); el.addEventListener('change', update); });
    $$('[data-preset]', box).forEach((chip) => chip.addEventListener('click', () => {
      const p = PRESETS[chip.dataset.preset];
      if (!p) return;
      sub.value = p.sub; mass.value = p.m; ti.value = p.ti; tf.value = p.tf;
      update();
    }));
    window.GC_GATE_TOOL(box, $$('.sim-controls', box), () => { live = true; $('[data-results]', box).hidden = false; update(); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
