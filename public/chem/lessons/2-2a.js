/* ============================================================
   1-2d LESSON INTERACTIVES (file 2-2a)
   The Change Lab, built on TB.sim.create (RUNTIME_SPEC 4.3). It has no loop: the picture
   is redrawn when the slider or the scene changes.
   Brief: docs/textbook/STYLE_STANDARD.md section 7, and the "Chem building tools" note in
   docs/plans/textbook-sim-briefs.md (a question as the title, a prediction lock, a legend).
   One slider moves a change from start to finish. The atom counts on the dashboard are
   counted from the particles that are drawn, so the picture and the numbers cannot
   disagree.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  const TAU = Math.PI * 2;
  const lerp = (a, b, k) => (1 - k) * a + k * b;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // the atoms in each kind of particle on the stage
  const ATOMS = {
    H2O: { H: 2, O: 1 },
    CH4: { C: 1, H: 4 },
    O2: { O: 2 },
    CO2: { C: 1, O: 2 },
    Na: { Na: 1 },
    Cl: { Cl: 1 }
  };
  // names only: the readout labels are set in capitals, which would turn Na into NA
  const ELEMENT = { H: 'Hydrogen atoms', O: 'Oxygen atoms', C: 'Carbon atoms', Na: 'Sodium ions', Cl: 'Chloride ions' };

  /* ---- scene 1: water, solid to liquid to gas (nine molecules) ---- */
  const ICE = [[170, 140], [200, 140], [230, 140], [155, 165], [185, 165], [215, 165], [245, 165], [170, 190], [200, 190]].map((p) => ({ x: p[0], y: p[1], a: -Math.PI / 2 }));
  const POOL = [[122, 205, 0.1], [152, 205, -0.5], [182, 205, 0.7], [214, 205, -0.8], [246, 205, 0.4], [276, 205, -0.2], [137, 191, 0.8], [198, 191, -0.6], [260, 191, 0.3]].map((p) => ({ x: p[0], y: p[1], a: p[2] }));
  const GAS = [[125, 155, 1.1, -4, 10], [170, 125, -0.6, -8, -10], [215, 140, 2.1, 6, 10], [260, 115, 0.5, 8, -12], [275, 165, -1.5, 10, 8], [145, 55, -0.2, -4, -16], [200, 42, 1.2, 0, -18], [255, 50, -0.9, 4, -16], [190, 15, 0.4, -2, -22]].map((p) => ({ x: p[0], y: p[1], a: p[2], tx: p[3], ty: p[4] }));

  function water(t) {
    const mols = [];
    for (let i = 0; i < 9; i++) {
      let x, y, a, tail = null;
      if (t <= 0.5) {
        const k = t / 0.5;
        x = lerp(ICE[i].x, POOL[i].x, k); y = lerp(ICE[i].y, POOL[i].y, k); a = lerp(ICE[i].a, POOL[i].a, k);
      } else {
        const k = (t - 0.5) / 0.5;
        x = lerp(POOL[i].x, GAS[i].x, k); y = lerp(POOL[i].y, GAS[i].y, k); a = lerp(POOL[i].a, GAS[i].a, k);
        if (k > 0.15) tail = { x1: x - GAS[i].tx * 1.5, y1: y - GAS[i].ty * 1.5, x2: x - GAS[i].tx * 0.4, y2: y - GAS[i].ty * 0.4, op: Math.min(1, k * 1.2) };
      }
      mols.push({ type: 'H2O', x: x, y: y, a: a, s: 1, op: 1, group: 'a', tail: tail });
    }
    return {
      mols: mols,
      brackets: t < 0.25 ? Math.max(0, 1 - t / 0.2) : 0,
      pool: t >= 0.2 && t <= 0.85 ? (t <= 0.5 ? Math.min(1, (t - 0.2) / 0.2) : Math.max(0, 1 - (t - 0.5) / 0.35)) : 0,
      sparks: 0
    };
  }

  /* ---- scene 2: salt dissolving (two Na+, two Cl-, ten water molecules) ---- */
  const SALT_START = [{ n: 'Na', x: 188, y: 165, r: 8 }, { n: 'Cl', x: 212, y: 165, r: 11 }, { n: 'Cl', x: 188, y: 190, r: 11 }, { n: 'Na', x: 212, y: 190, r: 8 }];
  const SALT_END = [{ x: 155, y: 115 }, { x: 245, y: 115 }, { x: 155, y: 180 }, { x: 245, y: 180 }];
  const WATER_START = [[130, 80, 0.4], [270, 80, -1.2], [125, 135, 1.8], [275, 135, -0.3], [130, 175, -2.0], [270, 175, 0.9], [160, 70, 2.2], [240, 70, -0.7], [145, 205, -1.1], [255, 205, 1.5]].map((p) => ({ x: p[0], y: p[1], a: p[2] }));
  const WATER_END = (function () {
    const out = [];
    for (let i = 0; i < 5; i++) { const th = (i * TAU) / 5; out.push({ x: SALT_END[0].x + 21 * Math.cos(th), y: SALT_END[0].y + 21 * Math.sin(th), a: th }); }
    for (let i = 0; i < 5; i++) { const th = (i * TAU) / 5; out.push({ x: SALT_END[1].x + 24 * Math.cos(th), y: SALT_END[1].y + 24 * Math.sin(th), a: th + Math.PI }); }
    return out;
  }());

  function salt(t) {
    const mols = [];
    for (let i = 0; i < 10; i++) {
      mols.push({ type: 'H2O', x: lerp(WATER_START[i].x, WATER_END[i].x, t), y: lerp(WATER_START[i].y, WATER_END[i].y, t), a: lerp(WATER_START[i].a, WATER_END[i].a, t), s: 0.9, op: 0.85, group: 'a' });
    }
    SALT_START.forEach((ion, i) => {
      mols.push({ type: ion.n, x: lerp(ion.x, SALT_END[i].x, t), y: lerp(ion.y, SALT_END[i].y, t), a: 0, s: 1, op: 1, group: 'a', r: ion.r });
    });
    return { mols: mols, brackets: 0, pool: 0, sparks: 0 };
  }

  /* ---- scene 3: methane burning, 2 CH4 + 4 O2 to 2 CO2 + 4 H2O ----
     0 to 0.4 the reactants close in. 0.4 to 0.6 they cross-fade into the products at the
     collision point. 0.5 to 1 the products spread out. The dashboard counts the reactants
     before the halfway mark and the products after it. */
  const CH4_START = [[140, 110], [140, 170]], CH4_HIT = [[185, 135], [185, 155]];
  const O2_START = [[260, 100, 0.3], [260, 130, -0.6], [260, 160, 1.1], [260, 190, -0.2]];
  const O2_HIT = [[215, 125, 0.8], [215, 155, -0.4], [200, 130, 1.4], [200, 165, -0.9]];
  const CO2_END = [[165, 95, 0], [235, 95, Math.PI / 2]];
  const H2O_END = [[130, 35], [175, 25], [225, 25], [270, 35]];
  const CENTER = [200, 145];

  function combust(t) {
    const mols = [];
    const closing = Math.min(1, t / 0.4);
    const fade = clamp((t - 0.4) / 0.2, 0, 1);           // 0 = all reactants, 1 = all products
    const rOp = (1 - closing * 0.4) * (1 - fade);
    if (rOp > 0.001) {
      CH4_START.forEach((p, i) => mols.push({ type: 'CH4', x: lerp(p[0], CH4_HIT[i][0], closing), y: lerp(p[1], CH4_HIT[i][1], closing), a: 0, s: 1, op: rOp, group: 'r' }));
      O2_START.forEach((p, i) => mols.push({ type: 'O2', x: lerp(p[0], O2_HIT[i][0], closing), y: lerp(p[1], O2_HIT[i][1], closing), a: lerp(p[2], O2_HIT[i][2], closing), s: 1, op: rOp, group: 'r' }));
    }
    if (fade > 0.001) {
      const spread = clamp((t - 0.5) / 0.5, 0, 1);
      CO2_END.forEach((p) => mols.push({ type: 'CO2', x: lerp(CENTER[0], p[0], spread), y: lerp(CENTER[1], p[1], spread), a: lerp(0, p[2], spread), s: 1, op: fade, group: 'p' }));
      H2O_END.forEach((p, i) => {
        const x = lerp(CENTER[0], p[0], spread), y = lerp(CENTER[1], p[1], spread);
        mols.push({ type: 'H2O', x: x, y: y, a: lerp(-Math.PI / 2, -Math.PI / 2, spread), s: 0.95, op: fade, group: 'p', tail: spread > 0.3 ? { x1: x, y1: y + 12, x2: x, y2: y + 6, op: (spread - 0.3) / 0.7 } : null });
      });
    }
    return { mols: mols, brackets: 0, pool: 0, sparks: t >= 0.4 && t <= 0.6 ? Math.sin(((t - 0.4) / 0.2) * Math.PI) : 0 };
  }

  const SCENES = {
    water: {
      name: 'Water phase change',
      layout: water,
      stage: (t) => (t < 0.25 ? 'Solid ice' : t <= 0.75 ? 'Liquid water' : 'Steam'),
      particles: (t) => '9 H₂O, ' + (t < 0.25 ? 'solid' : t <= 0.75 ? 'liquid' : 'gas'),
      text: (t) => (t < 0.25
        ? 'Water molecules are locked into a rigid lattice by hydrogen bonds. The brackets show vibration in fixed positions.'
        : t <= 0.75
          ? 'Thermal energy loosens the lattice. The molecules stay in contact and slide past one another along the bottom of the beaker.'
          : 'The molecules overcome the attractions between them. They spread far apart and move fast in straight lines.')
    },
    salt: {
      name: 'Dissolving salt',
      layout: salt,
      stage: (t) => (t < 0.35 ? 'Crystal' : t <= 0.7 ? 'Hydrating' : 'Dissolved'),
      particles: (t) => (t < 0.35 ? 'NaCl crystal in water' : t <= 0.7 ? 'ions gathering water' : 'Na⁺ and Cl⁻ in water'),
      text: (t) => (t < 0.35
        ? 'Solid sodium chloride is a crystal of alternating Na⁺ and Cl⁻ ions.'
        : t <= 0.7
          ? 'Water molecules turn their charged ends toward the ions. Oxygen faces Na⁺, and hydrogen faces Cl⁻.'
          : 'Each ion is surrounded by water molecules. Evaporate the water and the crystal comes back, so no new substance formed.')
    },
    combust: {
      name: 'Methane combustion',
      layout: combust,
      stage: (t) => (t < 0.35 ? 'Reactants' : t <= 0.65 ? 'Colliding' : 'Products'),
      particles: (t) => (t < 0.35 ? '2 CH₄ + 4 O₂' : t <= 0.65 ? 'colliding' : '2 CO₂ + 4 H₂O'),
      text: (t) => (t < 0.35
        ? 'Methane (CH₄) and oxygen (O₂) move freely. Every bond inside each molecule is intact.'
        : t <= 0.65
          ? 'Heat starts violent collisions. The C-H and O=O bonds break, and new C=O and O-H bonds form.'
          : 'Two new substances are made: carbon dioxide (CO₂) and water vapor (H₂O). Every atom from the reactants is in the products.')
    }
  };

  /* ---- the model: atoms counted from the particles that are drawn ---- */
  function count(scene, t) {
    const lay = SCENES[scene].layout(t);
    const showing = lay.mols.some((m) => m.group === 'r') && t < 0.5 ? 'r' : lay.mols.some((m) => m.group === 'p') && t >= 0.5 ? 'p' : 'a';
    const tally = {};
    lay.mols.filter((m) => m.group === showing).forEach((m) => {
      const atoms = ATOMS[m.type];
      Object.keys(atoms).forEach((el) => { tally[el] = (tally[el] || 0) + atoms[el]; });
    });
    return tally;
  }
  const total = (tally) => Object.keys(tally).reduce((n, k) => n + tally[k], 0);
  if (window.GC_MODELS) window.GC_MODELS['1-2d'] = { SCENES: SCENES, count: count, total: total, ATOMS: ATOMS };

  function init() {
    const box = $('[data-sim="change-lab"]');
    if (!box || !window.TB) return;
    const slider = $('#changeSlider', box);
    const chips = $$('[data-scene]', box);
    const note = $('[data-sim-note]', box);
    const tiles = $$('[data-atoms]', box);
    let scene = 'water';
    let progress = 0;
    let sim = null;

    const t = () => progress / 100;

    function report() {
      const sc = SCENES[scene];
      const now = count(scene, t());
      const start = count(scene, 0);
      const els = Object.keys(start);
      tiles.forEach((tile, i) => {
        const el = els[i];
        tile.hidden = !el;
        if (!el) return;
        $('.readout-label', tile).textContent = ELEMENT[el] + ', start → now';
        sim.setReadout(tile.dataset.readout, start[el] + ' → ' + (now[el] || 0));
      });
      sim.setReadout('stage', sc.stage(t()));
      if (sim.committed) {
        sim.setStatus('ok', total(now) === total(start) ? 'Atom count unchanged' : 'Atom count changed');
        note.textContent = sc.text(t());
      } else {
        sim.setStatus('neutral', 'Predict to start');
      }
      sim.setLabel(sc.name + ' at ' + progress + ' percent: ' + sc.stage(t()).toLowerCase() + '. ' + total(now) + ' atoms are drawn, and ' + total(start) + ' were there at the start.');
    }

    function setScene(name) {
      scene = name;
      progress = 0;
      slider.value = '0';
      slider.dispatchEvent(new Event('input'));          // the helper rewrites the output beside it
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.scene === name)));
      report();
      sim.redraw();
    }

    /* ---- drawing, in a 400 by 240 design box scaled to the stage ---- */
    function ball(ctx, x, y, r, fill, lw) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
      ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
    }
    function drawMol(ctx, env, m) {
      const c = env.colors;
      ctx.save();
      ctx.globalAlpha = m.op;
      ctx.strokeStyle = c.ink;
      if (m.type === 'H2O') {
        const s = m.s, r = 5.2 * s;
        ball(ctx, m.x, m.y, 6.5 * s, c.accent, 1.1);
        [-1, 1].forEach((d) => ball(ctx, m.x + r * Math.cos(m.a + d * 0.9076), m.y + r * Math.sin(m.a + d * 0.9076), 3.5 * s, c.paper3, 0.9));
      } else if (m.type === 'CH4') {
        const hs = [[0, -9], [9, 3], [-5, 8], [-8, -4]];
        ctx.lineWidth = 0.9;
        hs.forEach((h) => { ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x + h[0], m.y + h[1]); ctx.stroke(); });
        ball(ctx, m.x, m.y, 7.5, c.inkMute, 1.2);
        hs.forEach((h) => ball(ctx, m.x + h[0], m.y + h[1], 3.5, c.paper3, 0.9));
      } else if (m.type === 'O2') {
        const dx = 5.2 * Math.cos(m.a), dy = 5.2 * Math.sin(m.a);
        ball(ctx, m.x - dx, m.y - dy, 6.2, c.accent, 1.1);
        ball(ctx, m.x + dx, m.y + dy, 6.2, c.accent, 1.1);
      } else if (m.type === 'CO2') {
        const dx = 9 * Math.cos(m.a), dy = 9 * Math.sin(m.a);
        ball(ctx, m.x - dx, m.y - dy, 6.5, c.accent, 1.1);
        ball(ctx, m.x + dx, m.y + dy, 6.5, c.accent, 1.1);
        ball(ctx, m.x, m.y, 7.5, c.inkMute, 1.2);
      } else {
        const na = m.type === 'Na';
        ball(ctx, m.x, m.y, m.r, na ? c.inkMute : c.accent, 1.4);
        ctx.fillStyle = c.paper;
        ctx.font = env.font(na ? 12 : 14, 'mono', 700);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(na ? '+' : '−', m.x, m.y + 1);
      }
      ctx.restore();
    }

    function draw(ctx, env) {
      const c = env.colors;
      const k = Math.min(env.w / 400, env.h / 240);
      ctx.save();
      ctx.translate((env.w - 400 * k) / 2, (env.h - 240 * k) / 2);
      ctx.scale(k, k);
      // the beaker
      ctx.strokeStyle = c.ink; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(100, 55); ctx.lineTo(100, 215); ctx.lineTo(300, 215); ctx.lineTo(300, 55); ctx.stroke();
      const lay = SCENES[scene].layout(t());
      ctx.strokeStyle = c.inkMute; ctx.lineWidth = 1.2;
      if (lay.brackets > 0) {
        ctx.globalAlpha = lay.brackets;
        ctx.beginPath(); ctx.moveTo(140, 125); ctx.lineTo(134, 125); ctx.lineTo(134, 202); ctx.lineTo(140, 202); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(260, 125); ctx.lineTo(266, 125); ctx.lineTo(266, 202); ctx.lineTo(260, 202); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (lay.pool > 0) {
        ctx.globalAlpha = lay.pool; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(105, 183); ctx.quadraticCurveTo(200, 180, 295, 183); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
      lay.mols.forEach((m) => {
        if (m.tail) {
          ctx.save(); ctx.globalAlpha = m.tail.op; ctx.strokeStyle = c.inkMute; ctx.lineWidth = 1.1; ctx.setLineDash([2, 2]);
          ctx.beginPath(); ctx.moveTo(m.tail.x1, m.tail.y1); ctx.lineTo(m.tail.x2, m.tail.y2); ctx.stroke(); ctx.restore();
        }
        drawMol(ctx, env, m);
      });
      if (lay.sparks > 0) {
        ctx.save(); ctx.globalAlpha = lay.sparks; ctx.strokeStyle = c.accent; ctx.lineWidth = 1.5; ctx.setLineDash([2, 2]);
        [[175, 125], [225, 125], [180, 165], [220, 165]].forEach((p) => { ctx.beginPath(); ctx.moveTo(200, 145); ctx.lineTo(p[0], p[1]); ctx.stroke(); });
        ctx.restore();
      }
      ctx.restore();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: false,
      tokens: ['paper-3'],
      init() { report(); },
      onUnlock() { report(); },
      draw: draw,
      preset(name) {
        const parts = name.split(':');
        scene = parts[0];
        progress = Number(parts[1]);
        slider.value = String(progress);
        slider.dispatchEvent(new Event('input'));
        chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.scene === scene)));
        report();
        sim.redraw();
      },
      record() {
        const sc = SCENES[scene], now = count(scene, t()), start = count(scene, 0);
        return { 'Change': sc.name, 'Progress': progress + '%', 'Particles': sc.particles(t()), 'Atoms at start': total(start), 'Atoms now': total(now) };
      }
    });

    chips.forEach((chip) => chip.addEventListener('click', () => setScene(chip.dataset.scene)));
    slider.addEventListener('input', () => { progress = Number(slider.value); report(); sim.redraw(); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
