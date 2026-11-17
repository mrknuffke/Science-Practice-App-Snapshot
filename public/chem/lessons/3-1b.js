/* ============================================================
   3-1b LESSON INTERACTIVES
   Two tools in this lesson. Both lock until their prediction is committed.
     1. The heating curve: a looping canvas on TB.sim.create (RUNTIME_SPEC 4.3). Brief:
        docs/plans/textbook-sim-briefs.md, "Chem 3-1b: Heating Curve". The heat added is the
        slider; the curve's horizontal axis is proportional to it. The particles keep their
        positions, solid molecules vibrate smoothly, and the stage names are plain words.
     2. The multi-stage calculator (a DOM tool, locked with GC_GATE_TOOL).
   Zero em-dashes.
   ============================================================ */

/* ---------- 1. THE HEATING CURVE ---------- */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));

  /* ---- the model: 50.0 g of water, from -20 to 120 degrees C ---- */
  const MASS = 50;
  const C_ICE = 2.09, HF = 334, C_LIQ = 4.184, HV = 2260, C_STEAM = 2.01;    // the lesson's constants
  const Q_ICE_END = (MASS * C_ICE * 20) / 1000;                                // 2.09 kJ
  const Q_MELT_END = Q_ICE_END + (MASS * HF) / 1000;                           // 18.79 kJ
  const Q_LIQ_END = Q_MELT_END + (MASS * C_LIQ * 100) / 1000;                  // 39.71 kJ
  const Q_BOIL_END = Q_LIQ_END + (MASS * HV) / 1000;                           // 152.71 kJ
  const Q_MAX = Q_BOIL_END + (MASS * C_STEAM * 20) / 1000;                     // 154.72 kJ
  const T_LOW = -20, T_HIGH = 120;
  const SLIDER_MAX = 155;

  const STAGES = {
    ice: { name: 'Ice warming', goes: 'Faster molecules', plateau: false },
    melt: { name: 'Melting', goes: 'Pulling apart', plateau: true },
    water: { name: 'Water warming', goes: 'Faster molecules', plateau: false },
    boil: { name: 'Boiling', goes: 'Pulling apart', plateau: true },
    steam: { name: 'Steam warming', goes: 'Faster molecules', plateau: false }
  };

  // The state of the sample after q kJ of heat. melt and boil are the share of molecules that have changed (0 to 1).
  function stateAt(q) {
    q = Math.max(0, Math.min(Q_MAX, q));
    if (q < Q_ICE_END) return { q: q, T: T_LOW + (q * 1000) / (MASS * C_ICE), stage: 'ice', melt: 0, boil: 0 };
    if (q < Q_MELT_END) return { q: q, T: 0, stage: 'melt', melt: (q - Q_ICE_END) / (Q_MELT_END - Q_ICE_END), boil: 0 };
    if (q < Q_LIQ_END) return { q: q, T: ((q - Q_MELT_END) * 1000) / (MASS * C_LIQ), stage: 'water', melt: 1, boil: 0 };
    if (q < Q_BOIL_END) return { q: q, T: 100, stage: 'boil', melt: 1, boil: (q - Q_LIQ_END) / (Q_BOIL_END - Q_LIQ_END) };
    return { q: q, T: 100 + ((q - Q_BOIL_END) * 1000) / (MASS * C_STEAM), stage: 'steam', melt: 1, boil: 1 };
  }

  /* ---- the particle picture ---- */
  const N = 24, COLS = 6;
  const PW = 320, PH = 200, R = 6;
  const POOL_TOP = 74;
  const SPEED_293 = 42;                                            // design units a second at 293 K
  const speedAt = (T) => SPEED_293 * Math.sqrt((T + 273.15) / 293.15);
  const latticePos = (i) => {
    const r = Math.floor(i / COLS), c = i % COLS;
    return { x: 40 + c * 38 + (r % 2) * 19, y: 94 + r * 26 };
  };

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
  function newMolecules() {
    const rand = rng(3201);
    const out = [];
    for (let i = 0; i < N; i++) {
      const a = rand() * Math.PI * 2, l = latticePos(i);
      out.push({ x: l.x, y: l.y, ux: Math.cos(a), uy: Math.sin(a), ph: rand() * Math.PI * 2, ph2: rand() * Math.PI * 2 });
    }
    return out;
  }
  // how far molecule i has left the lattice (0 to 1) and whether it is a gas molecule yet
  const meltShare = (st, i) => Math.max(0, Math.min(1, st.melt * N - i));
  const isGas = (st, i) => i < st.boil * N;

  function stepMolecules(mols, st, dt) {
    const sp = speedAt(st.T) * dt;
    mols.forEach((p, i) => {
      p.x += p.ux * sp; p.y += p.uy * sp;
      const top = isGas(st, i) ? R : POOL_TOP;
      if (p.x < R) { p.x = R; p.ux = Math.abs(p.ux); }
      if (p.x > PW - R) { p.x = PW - R; p.ux = -Math.abs(p.ux); }
      if (p.y > PH - R) { p.y = PH - R; p.uy = -Math.abs(p.uy); }
      if (p.y < top) {                       // a molecule that rejoined the liquid settles back, it does not jump
        p.y = Math.min(top, p.y + 90 * dt);
        p.uy = Math.abs(p.uy);
        if (p.y >= top) p.y = top;
      }
    });
  }
  // where molecule i is drawn: the lattice site, vibrating smoothly, blended into its free position as it melts
  function drawPos(mols, st, i, time) {
    const p = mols[i], l = latticePos(i), s = meltShare(st, i);
    const amp = (1 - s) * (0.8 + 1.7 * Math.max(0, Math.min(1, (st.T + 20) / 20)));
    const vx = amp * Math.sin(6 * time + p.ph), vy = amp * Math.cos(7.3 * time + p.ph2);
    return { x: l.x * (1 - s) + p.x * s + vx * (1 - s), y: l.y * (1 - s) + p.y * s + vy * (1 - s) };
  }

  if (window.GC_MODELS) window.GC_MODELS['3-1b'] = {
    stateAt: stateAt, STAGES: STAGES, newMolecules: newMolecules, stepMolecules: stepMolecules, drawPos: drawPos, latticePos: latticePos, meltShare: meltShare, isGas: isGas, speedAt: speedAt,
    K: { MASS: MASS, Q_ICE_END: Q_ICE_END, Q_MELT_END: Q_MELT_END, Q_LIQ_END: Q_LIQ_END, Q_BOIL_END: Q_BOIL_END, Q_MAX: Q_MAX, PW: PW, PH: PH, R: R, N: N, SLIDER_MAX: SLIDER_MAX }
  };

  function init() {
    const box = $('[data-sim="heating-curve"]');
    if (!box || !window.TB) return;
    const slider = $('#heatSlider', box);
    const note = $('[data-sim-note]', box);
    const mols = newMolecules();
    let q = 0, sim = null;

    const kj = (x) => x.toFixed(1);
    function report() {
      const st = stateAt(q), S = STAGES[st.stage];
      sim.setReadout('heat', kj(q) + ' kJ');
      sim.setReadout('temp', st.T.toFixed(1) + ' °C');
      sim.setReadout('stage', S.name);
      sim.setReadout('goes', S.goes);
      if (sim.committed) {
        sim.setStatus(S.plateau ? 'ok' : 'neutral', S.plateau ? 'Temperature steady' : 'Temperature rising');
        note.textContent = S.plateau
          ? 'The temperature holds at ' + st.T.toFixed(0) + ' °C. The heat pulls molecules apart, so they do not speed up.'
          : 'The heat speeds up the molecules, so the temperature rises.';
      } else {
        sim.setStatus('neutral', 'Predict to start');
      }
      sim.setLabel('A heating curve for 50 grams of water with ' + kj(q) + ' kilojoules added, and a picture of the molecules. The sample is at ' + st.T.toFixed(1) + ' degrees C: ' + S.name.toLowerCase() + '.');
    }
    function setHeat(x) {
      q = Math.max(0, Math.min(SLIDER_MAX, x));
      slider.value = String(q);
      slider.dispatchEvent(new Event('input'));
    }

    /* ---- drawing ---- */
    const GX0 = 56, GX1 = 312, GY0 = 160, GY1 = 14;
    const gx = (heat) => GX0 + (heat / SLIDER_MAX) * (GX1 - GX0);
    const gy = (T) => GY0 - ((T - T_LOW) / (T_HIGH - T_LOW)) * (GY0 - GY1);
    const KNOTS = [[0, T_LOW], [Q_ICE_END, 0], [Q_MELT_END, 0], [Q_LIQ_END, 100], [Q_BOIL_END, 100], [Q_MAX, T_HIGH]];

    function drawGraph(ctx, env, st, fs) {
      const c = env.colors;
      ctx.lineWidth = 1; ctx.strokeStyle = c.hair; ctx.setLineDash([3, 3]);
      [0, 100].forEach((T) => { ctx.beginPath(); ctx.moveTo(GX0, gy(T)); ctx.lineTo(GX1, gy(T)); ctx.stroke(); });
      ctx.setLineDash([]);
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(GX0, GY1 - 4); ctx.lineTo(GX0, GY0); ctx.lineTo(GX1 + 4, GY0); ctx.stroke();
      ctx.fillStyle = c.inkSoft; ctx.font = env.font(fs, 'mono', 400);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      [[0, '0 °C'], [100, '100 °C']].forEach((t) => ctx.fillText(t[1], GX0 - 6, gy(t[0])));
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      [0, 50, 100, 150].forEach((h) => ctx.fillText(String(h), gx(h), GY0 + 5));
      ctx.fillStyle = c.ink; ctx.font = env.font(fs, 'display', 700);
      ctx.fillText('Heat added (kJ)', (GX0 + GX1) / 2, GY0 + 5 + fs * 1.5);
      // the whole curve, faint
      ctx.strokeStyle = c.hair; ctx.lineWidth = 2.5;
      ctx.beginPath(); KNOTS.forEach((k, i) => (i ? ctx.lineTo(gx(k[0]), gy(k[1])) : ctx.moveTo(gx(k[0]), gy(k[1])))); ctx.stroke();
      // the part traced so far
      ctx.strokeStyle = c.accent; ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(gx(0), gy(T_LOW));
      for (let i = 1; i < KNOTS.length; i++) {
        if (st.q >= KNOTS[i][0]) ctx.lineTo(gx(KNOTS[i][0]), gy(KNOTS[i][1]));
        else { const a = KNOTS[i - 1], b = KNOTS[i], f = (st.q - a[0]) / (b[0] - a[0]); ctx.lineTo(gx(st.q), gy(a[1] + f * (b[1] - a[1]))); break; }
      }
      ctx.stroke();
      ctx.fillStyle = c.accent; ctx.strokeStyle = c.paper; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(gx(st.q), gy(st.T), 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    function drawMolecules(ctx, env, st, fs) {
      const c = env.colors;
      ctx.fillStyle = c.card; ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(0.75, 0.75, PW - 1.5, PH - 1.5, 6); ctx.fill(); ctx.stroke();
      ctx.save();
      ctx.beginPath(); ctx.roundRect(1, 1, PW - 2, PH - 2, 6); ctx.clip();
      const pts = mols.map((m, i) => drawPos(mols, st, i, env.time));
      // hydrogen bonds between neighbours that are still in the lattice
      ctx.strokeStyle = c.inkMute; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      for (let i = 0; i < N; i++) {
        const r = Math.floor(i / COLS), col = i % COLS;
        const nb = [];
        if (col < COLS - 1) nb.push(i + 1);
        if (r < 3) { nb.push(i + COLS); if (r % 2 === 0 ? col > 0 : col < COLS - 1) nb.push(i + COLS + (r % 2 === 0 ? -1 : 1)); }
        nb.forEach((j) => {
          const w = Math.min(1 - meltShare(st, i), 1 - meltShare(st, j));
          if (w <= 0.05) return;
          ctx.globalAlpha = w;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        });
      }
      ctx.globalAlpha = 1; ctx.setLineDash([]);
      ctx.fillStyle = c.accent;
      pts.forEach((p) => { ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2); ctx.fill(); });
      ctx.restore();
      ctx.fillStyle = c.ink; ctx.font = env.font(fs, 'display', 700); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('50 g water', 10, 8);
    }
    function draw(ctx, env) {
      const wide = env.w / env.h > 1.6;
      const dw = wide ? 2 * PW + 20 : PW, dh = wide ? PH : 2 * PH + 16;
      const k = Math.min(env.w / dw, env.h / dh);
      const fs = Math.max(12, 12 / k);
      const st = stateAt(q);
      ctx.save();
      ctx.translate((env.w - dw * k) / 2, (env.h - dh * k) / 2);
      ctx.scale(k, k);
      drawGraph(ctx, env, st, fs);
      ctx.translate(wide ? PW + 20 : 0, wide ? 0 : PH + 16);
      drawMolecules(ctx, env, st, fs);
      ctx.restore();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 0.5,
      init() { report(); },
      onUnlock() { report(); },
      update(dt) { stepMolecules(mols, stateAt(q), dt); },
      draw: draw,
      preset(name) { setHeat(Number(name)); },
      record() {
        const st = stateAt(q);
        return { 'Heat added (kJ)': kj(q), 'Temperature (°C)': st.T.toFixed(1), 'Stage': STAGES[st.stage].name };
      }
    });
    slider.addEventListener('input', () => { q = Number(slider.value); report(); sim.redraw(); });
    report();
  }
  document.addEventListener('DOMContentLoaded', init);
})();


/* ---------- 2. THE MULTI-STAGE CALCULATOR ---------- */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));

  const DATA = {
    water: { name: 'Water', tm: 0, tb: 100, cSolid: 2.09, hf: 334, cLiq: 4.184, hv: 2260, cGas: 2.01, solid: 'ice', liquid: 'liquid water', gas: 'steam' },
    ethanol: { name: 'Ethanol', tm: -114, tb: 78.4, cSolid: 0.97, hf: 109, cLiq: 2.44, hv: 841, cGas: 1.70, solid: 'solid ethanol', liquid: 'liquid ethanol', gas: 'ethanol vapor' }
  };
  const PRESETS = {
    melt: { sub: 'water', m: 25, ti: -15, tf: 0 },
    full: { sub: 'water', m: 25, ti: -15, tf: 110 },
    ethanol: { sub: 'ethanol', m: 50, ti: 20, tf: 78 }
  };

  // The stages a sample passes through, in order, with the heat of each (J).
  // A slope uses q = m c dT. A plateau uses q = m dH, with the sign of the direction.
  function stages(key, m, ti, tf) {
    const d = DATA[key];
    if (!d || !isFinite(m) || !isFinite(ti) || !isFinite(tf) || m <= 0) return null;
    const out = [];
    const slope = (id, label, c, from, to) => out.push({ id: id, kind: 'slope', label: label, from: from, to: to, c: c, q: m * c * (to - from) });
    const plateau = (id, label, h, sign, at) => out.push({ id: id, kind: 'plateau', label: label, at: at, h: h, q: sign * m * h });
    if (tf > ti) {
      if (ti < d.tm) slope('solid', 'Warm ' + d.solid, d.cSolid, ti, Math.min(tf, d.tm));
      if (ti <= d.tm && tf >= d.tm && (ti < d.tm || tf > d.tm)) plateau('melt', 'Melt at ' + d.tm.toFixed(1) + ' °C', d.hf, 1, d.tm);
      if (tf > d.tm && ti < d.tb) slope('liquid', 'Warm ' + d.liquid, d.cLiq, Math.max(ti, d.tm), Math.min(tf, d.tb));
      if (ti <= d.tb && tf >= d.tb && (ti < d.tb || tf > d.tb)) plateau('boil', 'Boil at ' + d.tb.toFixed(1) + ' °C', d.hv, 1, d.tb);
      if (tf > d.tb) slope('gas', 'Warm ' + d.gas, d.cGas, Math.max(ti, d.tb), tf);
    } else if (tf < ti) {
      if (ti > d.tb) slope('gas', 'Cool ' + d.gas, d.cGas, ti, Math.max(tf, d.tb));
      if (ti >= d.tb && tf <= d.tb && (ti > d.tb || tf < d.tb)) plateau('boil', 'Condense at ' + d.tb.toFixed(1) + ' °C', d.hv, -1, d.tb);
      if (ti > d.tm && tf < d.tb) slope('liquid', 'Cool ' + d.liquid, d.cLiq, Math.min(ti, d.tb), Math.max(tf, d.tm));
      if (ti >= d.tm && tf <= d.tm && (ti > d.tm || tf < d.tm)) plateau('melt', 'Freeze at ' + d.tm.toFixed(1) + ' °C', d.hf, -1, d.tm);
      if (tf < d.tm) slope('solid', 'Cool ' + d.solid, d.cSolid, Math.min(ti, d.tm), tf);
    }
    return { sub: d, m: m, ti: ti, tf: tf, steps: out, total: out.reduce((s, x) => s + x.q, 0) };
  }
  if (window.GC_MODELS) window.GC_MODELS['3-1b-stages'] = { stages: stages, DATA: DATA, PRESETS: PRESETS };

  const sign = (x) => (x > 0 ? '+' : x < 0 ? '−' : '');
  const num = (x, d) => Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  function init() {
    const box = $('[data-tool="stages"]');
    if (!box || !window.GC_GATE_TOOL) return;
    const sub = $('#multiSubstance', box), mass = $('#multiMass', box), ti = $('#multiTi', box), tf = $('#multiTf', box);
    const steps = $('[data-steps]', box);
    const pill = $('.status-pill', box);
    const read = (id, text) => { const el = $('[data-readout="' + id + '"] .readout-value', box); if (el) el.textContent = text; };
    let live = false;

    function update() {
      if (!live) return;
      const r = stages(sub.value, parseFloat(mass.value), parseFloat(ti.value), parseFloat(tf.value));
      steps.textContent = '';
      if (!r) {
        pill.dataset.state = 'alert'; pill.textContent = 'Enter a positive mass and two temperatures';
        ['total', 'count'].forEach((id) => read(id, '–'));
        return;
      }
      if (!r.steps.length) {
        pill.dataset.state = 'neutral'; pill.textContent = 'No temperature change';
        read('total', '0.00 kJ'); read('count', '0');
        steps.textContent = 'The starting and final temperatures are the same, so no heat moves: q = 0 J.';
        return;
      }
      const ol = document.createElement('ol');
      ol.className = 'calc-stage-list';
      r.steps.forEach((s) => {
        const li = document.createElement('li');
        li.dataset.kind = s.kind;
        const head = s.kind === 'slope'
          ? s.from.toFixed(1) + ' to ' + s.to.toFixed(1) + ' °C'
          : 'temperature stays at ' + s.at.toFixed(1) + ' °C';
        const work = s.kind === 'slope'
          ? '<em>q</em> = <em>m</em><em>c</em>&Delta;<em>T</em> = (' + num(r.m, 1) + ' g)(' + s.c + ' J/(g&middot;&deg;C))(' + sign(s.to - s.from) + num(s.to - s.from, 1) + ' &deg;C)'
          : '<em>q</em> = ' + (s.q < 0 ? '&minus;' : '') + '<em>m</em>&Delta;<em>H</em> = ' + (s.q < 0 ? '&minus;' : '') + '(' + num(r.m, 1) + ' g)(' + s.h + ' J/g)';
        li.innerHTML = '<b>' + s.label + '</b> (' + head + ')<br>' + work + ' = <b>' + sign(s.q) + num(s.q, 1) + ' J</b>';
        ol.appendChild(li);
      });
      steps.appendChild(ol);
      const p = document.createElement('p');
      p.className = 'calc-result';
      p.innerHTML = '<em>q</em><sub>total</sub> = ' + sign(r.total) + num(r.total, 1) + ' J = ' + sign(r.total) + num(r.total / 1000, 2) + ' kJ';
      steps.appendChild(p);
      read('total', sign(r.total) + num(r.total / 1000, 2) + ' kJ');
      read('count', String(r.steps.length));
      pill.dataset.state = r.total > 0 ? 'ok' : 'neutral';
      pill.textContent = r.total > 0 ? 'Energy absorbed' : 'Energy released';
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
