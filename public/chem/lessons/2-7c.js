/* ============================================================
   1-7c LESSON INTERACTIVES (file 2-7c)
   Two tools in this lesson. Both lock until their prediction is committed
   (docs/plans/textbook-sim-briefs.md, "Chem building tools": 2-7c shows an outcome a
   student can predict).
     1. The BCA simulator: CH4 + 2 O2 -> CO2 + 2 H2O in a chamber of eight bays. A canvas on
        TB.sim.create (RUNTIME_SPEC 4.3) that has no loop. The table and the picture are made
        from the same numbers: one drawn molecule stands for half a mole.
     2. The s'mores factory (a DOM tool, locked with GC_GATE_TOOL).
   Zero em-dashes.
   ============================================================ */

/* ---------- 1. BCA SIMULATOR ---------- */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  const TAU = Math.PI * 2;

  const BAYS = [[50, 62], [150, 62], [250, 62], [350, 62], [50, 187], [150, 187], [250, 187], [350, 187]];
  const OFFS = [[-24, -25], [24, 25]];       // the two O2 (or two H2O) around the middle molecule of a bay
  const SPARE = [[-24, -20], [24, 20]];      // the spare O2 in a bay that holds no reaction
  const COEF = { CH4: 1, O2: 2, CO2: 1, H2O: 2 };

  /* ---- the model: moles, in half-mole steps ---- */
  function bca(ch4, o2, pct) {
    const fromCH4 = ch4, fromO2 = o2 / 2;
    const xmax = Math.min(fromCH4, fromO2);
    let limiting = 'none';
    if (ch4 > 0 || o2 > 0) limiting = fromCH4 < fromO2 ? 'CH4' : fromO2 < fromCH4 ? 'O2' : 'both';
    const x = (pct / 100) * xmax;
    const row = (a, b, c, d) => ({ CH4: a, O2: b, CO2: c, H2O: d });
    return {
      xmax: xmax, x: x, limiting: limiting,
      before: row(ch4, o2, 0, 0),
      change: row(-x, -2 * x, x, 2 * x),
      after: row(ch4 - x, o2 - 2 * x, x, 2 * x)
    };
  }
  // one drawn molecule is half a mole, so a reaction event is 1 CH4 + 2 O2 -> 1 CO2 + 2 H2O
  const events = (ch4, o2) => Math.min(2 * ch4, o2);
  function bays(ch4, o2, pct) {
    const m = bca(ch4, o2, pct);
    const n = events(ch4, o2);
    const items = [];
    for (let i = 0; i < n; i++) items.push({ bay: i, kind: 'event', p: Math.max(0, Math.min(1, m.x * 2 - i)) });
    let b = n;
    for (let i = 0; i < 2 * ch4 - n; i++) items.push({ bay: b++, kind: 'spare-ch4' });
    const spareO2 = 2 * o2 - 2 * n;
    for (let i = 0; i < spareO2; i++) items.push({ bay: n + Math.floor(i / 2), kind: 'spare-o2', slot: i % 2 });
    return items;
  }
  // atoms in what is drawn: a reaction event counts as its reactants until it is done
  function atoms(ch4, o2, pct) {
    const t = { C: 0, H: 0, O: 0 };
    bays(ch4, o2, pct).forEach((it) => {
      if (it.kind === 'spare-ch4') { t.C += 1; t.H += 4; }
      else if (it.kind === 'spare-o2') { t.O += 2; }
      else if (it.p >= 1) { t.C += 1; t.O += 2 + 2; t.H += 4; }       // CO2 + 2 H2O
      else { t.C += 1; t.H += 4; t.O += 4; }                             // CH4 + 2 O2
    });
    return t;
  }
  if (window.GC_MODELS) window.GC_MODELS['1-7c'] = { bca: bca, bays: bays, atoms: atoms, events: events, BAYS: BAYS, COEF: COEF };

  const fmt = (v) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);
  const signed = (v) => (v > 0.004 ? '+' : '') + fmt(v);
  const NAME = { CH4: 'CH₄', O2: 'O₂', both: 'Both (exact 1:2 ratio)', none: '–' };

  function init() {
    const box = $('[data-sim="stoichiometry"]');
    if (!box || !window.TB) return;
    const inCH4 = $('#ch4Input', box), inO2 = $('#o2Input', box), inP = $('#progressInput', box);
    const note = $('[data-sim-note]', box);
    const cell = (id) => $('#' + id, box);
    let sim = null;
    let loading = false;          // a preset sets all three sliders at once, so a new amount must not reset the progress

    const state = () => ({ ch4: Number(inCH4.value), o2: Number(inO2.value), pct: Number(inP.value) });

    function setCells(m, live) {
      const dash = '–';
      const v = (id, text) => { cell(id).textContent = live ? text : dash; };
      v('bCH4', fmt(m.before.CH4)); v('bO2', fmt(m.before.O2));
      v('cCH4', signed(m.change.CH4)); v('cO2', signed(m.change.O2)); v('cCO2', signed(m.change.CO2)); v('cH2O', signed(m.change.H2O));
      v('aCH4', fmt(m.after.CH4)); v('aO2', fmt(m.after.O2)); v('aCO2', fmt(m.after.CO2)); v('aH2O', fmt(m.after.H2O));
      ['aCH4', 'aO2'].forEach((id) => { cell(id).dataset.limiting = 'false'; });
      if (live && state().pct === 100 && m.xmax > 0) {
        if (m.limiting === 'CH4' || m.limiting === 'both') cell('aCH4').dataset.limiting = 'true';
        if (m.limiting === 'O2' || m.limiting === 'both') cell('aO2').dataset.limiting = 'true';
      }
    }

    function report() {
      const s = state();
      const m = bca(s.ch4, s.o2, s.pct);
      const live = sim.committed;
      setCells(m, live);
      const done = s.pct === 100 && m.xmax > 0;
      sim.setReadout('progress', s.pct + '%');
      sim.setReadout('limiting', done ? NAME[m.limiting] : 'Run the reaction');
      sim.setReadout('water', fmt(m.after.H2O) + ' mol');
      sim.setReadout('left', m.limiting === 'CH4' || m.limiting === 'both' ? fmt(m.after.O2) + ' mol O₂' : fmt(m.after.CH4) + ' mol CH₄');
      if (!live) { sim.setStatus('neutral', 'Predict to start'); }
      else if (s.ch4 === 0 && s.o2 === 0) { sim.setStatus('neutral', 'Empty chamber'); note.textContent = 'Set some methane and oxygen with the sliders to begin.'; }
      else if (s.pct === 0) { sim.setStatus('neutral', 'Ready to react'); note.textContent = 'The reactants are mixed: ' + s.ch4 + ' mol of methane and ' + s.o2 + ' mol of oxygen. Move the Reaction progress slider to ignite the fuel.'; }
      else if (s.pct < 100 && m.xmax > 0) { sim.setStatus('neutral', 'Reacting'); note.textContent = 'Molecules are colliding. The Change row is negative for the reactants and positive for the products.'; }
      else if (m.xmax === 0) { sim.setStatus('warn', 'Nothing can react'); note.textContent = 'One reactant is missing, so no reaction can start.'; }
      else if (m.limiting === 'both') { sim.setStatus('ok', 'Reaction stopped'); note.textContent = 'The reactants were mixed in the exact 1:2 ratio, so both are used up. The chamber holds only ' + fmt(m.after.CO2) + ' mol of CO₂ and ' + fmt(m.after.H2O) + ' mol of H₂O.'; }
      else {
        const lim = m.limiting === 'CH4' ? 'methane (CH₄)' : 'oxygen (O₂)';
        const ex = m.limiting === 'CH4' ? fmt(m.after.O2) + ' mol of oxygen (O₂)' : fmt(m.after.CH4) + ' mol of methane (CH₄)';
        sim.setStatus('ok', 'Reaction stopped');
        note.textContent = 'The limiting reactant, ' + lim + ', is used up, so the reaction stops. The most water that can form is ' + fmt(m.after.H2O) + ' mol. ' + ex + ' is left over.';
      }
      sim.setLabel('A chamber of eight bays with ' + s.ch4 + ' mol of methane and ' + s.o2 + ' mol of oxygen at ' + s.pct + ' percent progress. ' + fmt(m.x) + ' mol has reacted.');
    }

    /* ---- drawing, in a 400 by 250 design box ---- */
    function ball(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); }
    function ch4(ctx, c, x, y) {
      const hs = [[0, -12], [0, 12], [-12, 0], [12, 0]];
      ctx.lineWidth = 1.2;
      hs.forEach((h) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + h[0], y + h[1]); ctx.stroke(); });
      ball(ctx, x, y, 7.5, c.ink);
      hs.forEach((h) => ball(ctx, x + h[0], y + h[1], 4.5, c.paper3));
    }
    function o2(ctx, c, x, y) { ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 7, y - 2); ctx.lineTo(x + 7, y - 2); ctx.moveTo(x - 7, y + 2); ctx.lineTo(x + 7, y + 2); ctx.stroke(); ball(ctx, x - 7, y, 7, c.accent); ball(ctx, x + 7, y, 7, c.accent); }
    function co2(ctx, c, x, y) { ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x + 14, y); ctx.stroke(); ball(ctx, x - 14, y, 7, c.accent); ball(ctx, x + 14, y, 7, c.accent); ball(ctx, x, y, 7.5, c.ink); }
    function h2o(ctx, c, x, y) { ctx.lineWidth = 1.2; [-8, 8].forEach((d) => { ctx.beginPath(); ctx.moveTo(x, y - 2); ctx.lineTo(x + d, y + 7); ctx.stroke(); }); ball(ctx, x, y - 2, 7, c.accent); ball(ctx, x - 8, y + 7, 4.5, c.paper3); ball(ctx, x + 8, y + 7, 4.5, c.paper3); }

    function draw(ctx, env) {
      const c = env.colors;
      const k = Math.min(env.w / 400, env.h / 250);
      const s = state();
      ctx.save();
      ctx.translate((env.w - 400 * k) / 2, (env.h - 250 * k) / 2);
      ctx.scale(k, k);
      ctx.strokeStyle = c.ink; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(2, 2, 396, 246, 6); ctx.stroke();
      ctx.lineWidth = 1.2;
      const withAlpha = (a, fn) => { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = c.ink; fn(); ctx.restore(); };
      bays(s.ch4, s.o2, s.pct).forEach((it) => {
        const [cx, cy] = BAYS[it.bay];
        if (it.kind === 'spare-ch4') { ctx.strokeStyle = c.ink; ch4(ctx, c, cx, cy); return; }
        if (it.kind === 'spare-o2') { ctx.strokeStyle = c.ink; o2(ctx, c, cx + SPARE[it.slot][0], cy + SPARE[it.slot][1]); return; }
        const reactants = () => { ch4(ctx, c, cx, cy); OFFS.forEach((o) => o2(ctx, c, cx + o[0], cy + o[1])); };
        const products = () => { co2(ctx, c, cx, cy); OFFS.forEach((o) => h2o(ctx, c, cx + o[0], cy + o[1])); };
        if (it.p <= 0) withAlpha(1, reactants);
        else if (it.p >= 1) withAlpha(1, products);
        else {
          withAlpha(1 - it.p, reactants);
          withAlpha(it.p, products);
          ctx.save();
          ctx.globalAlpha = Math.sin(it.p * Math.PI) * 0.85;
          ctx.fillStyle = c.accent;
          ctx.translate(cx, cy - 28); ctx.scale(0.6, 0.6);
          ctx.beginPath(); ctx.moveTo(-6, 2); ctx.quadraticCurveTo(0, -14, 6, 2); ctx.quadraticCurveTo(10, 12, 0, 14); ctx.quadraticCurveTo(-10, 12, -6, 2); ctx.fill();
          ctx.restore();
        }
      });
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
        const p = name.split(':').map(Number);
        loading = true;
        inCH4.value = String(p[0]); inO2.value = String(p[1]); inP.value = String(p[2]);
        [inCH4, inO2, inP].forEach((el) => el.dispatchEvent(new Event('input')));   // the helper rewrites the outputs
        loading = false;
        $$('[data-preset]', box).forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.preset === name)));
        report();
        sim.redraw();
      },
      record() {
        const s = state();
        const m = bca(s.ch4, s.o2, s.pct);
        return { 'CH₄ start (mol)': s.ch4, 'O₂ start (mol)': s.o2, 'Progress': s.pct + '%', 'Limiting reactant': NAME[m.limiting], 'CH₄ left (mol)': fmt(m.after.CH4), 'O₂ left (mol)': fmt(m.after.O2), 'H₂O made (mol)': fmt(m.after.H2O) };
      }
    });

    // a new starting amount puts the progress back to 0, so the table never shows a half-run mix of old and new
    [inCH4, inO2].forEach((el) => el.addEventListener('input', () => {
      if (!loading && inP.value !== '0') { inP.value = '0'; inP.dispatchEvent(new Event('input')); }
      $$('[data-preset]', box).forEach((chip) => chip.setAttribute('aria-pressed', 'false'));
      report(); sim.redraw();
    }));
    inP.addEventListener('input', () => { report(); sim.redraw(); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();

/* ---------- 2. S'MORES FACTORY ---------- */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));

  // the recipe: 2 crackers + 1 marshmallow + 1 chocolate square -> 1 s'more
  const RECIPE = { graham: 2, marsh: 1, choco: 1 };
  const NAMES = { graham: 'Graham crackers', marsh: 'Marshmallows', choco: 'Chocolate squares' };
  const MAX_TRAY = 10;

  function factory(amounts) {
    const ratio = {};
    Object.keys(RECIPE).forEach((k) => { ratio[k] = amounts[k] / RECIPE[k]; });
    const least = Math.min(ratio.graham, ratio.marsh, ratio.choco);
    const limiting = Object.keys(ratio).filter((k) => ratio[k] === least);
    const made = Math.floor(least);
    const left = {};
    Object.keys(RECIPE).forEach((k) => { left[k] = amounts[k] - made * RECIPE[k]; });
    return { ratio: ratio, least: least, limiting: limiting, made: made, left: left };
  }
  if (window.GC_MODELS) window.GC_MODELS['1-7c-smores'] = { factory: factory, RECIPE: RECIPE, MAX_TRAY: MAX_TRAY };

  function init() {
    const box = $('[data-tool="smores"]');
    if (!box || !window.GC_GATE_TOOL) return;
    const inputs = { graham: $('#smorGraham', box), marsh: $('#smorMarshmallow', box), choco: $('#smorChocolate', box) };
    const bars = { graham: $('[data-ing="graham"]', box), marsh: $('[data-ing="marsh"]', box), choco: $('[data-ing="choco"]', box) };
    const results = $('[data-results]', box);
    const note = $('[data-sim-note]', box);
    const tray = $('#smorVisualTray', box);
    const pill = $('.status-pill', box);
    const read = (id, text) => { const el = $('[data-readout="' + id + '"] .readout-value', box); if (el) el.textContent = text; };
    let live = false;

    const amounts = () => ({ graham: Number(inputs.graham.value), marsh: Number(inputs.marsh.value), choco: Number(inputs.choco.value) });

    function chip(kind, text, spare) {
      const s = document.createElement('span');
      s.className = 'smor-chip';
      s.dataset.kind = kind;
      s.dataset.spare = String(!!spare);
      s.textContent = text;
      return s;
    }

    function update() {
      const a = amounts();
      Object.keys(inputs).forEach((k) => { $('output', inputs[k].closest('label')).textContent = String(a[k]); });
      if (!live) return;
      const f = factory(a);
      Object.keys(bars).forEach((k) => {
        $('.smor-ratio', bars[k]).textContent = '= ' + f.ratio[k].toFixed(1);
        bars[k].dataset.level = String(Math.min(12, Math.round(f.ratio[k])));
        bars[k].dataset.limiting = String(f.ratio[k] === f.least);
      });
      read('made', String(f.made));
      read('limiting', f.limiting.map((k) => NAMES[k]).join(' and '));
      const spare = [];
      if (f.left.graham > 0) spare.push(f.left.graham + ' cracker' + (f.left.graham > 1 ? 's' : ''));
      if (f.left.marsh > 0) spare.push(f.left.marsh + ' marshmallow' + (f.left.marsh > 1 ? 's' : ''));
      if (f.left.choco > 0) spare.push(f.left.choco + ' chocolate square' + (f.left.choco > 1 ? 's' : ''));
      read('left', spare.length ? spare.join(', ') : 'None');
      pill.dataset.state = 'ok';
      pill.textContent = 'Limiting: ' + f.limiting.map((k) => NAMES[k]).join(' and ');
      note.textContent = 'Divide each amount by its recipe number: crackers ' + a.graham + ' ÷ ' + RECIPE.graham + ' = ' + f.ratio.graham.toFixed(1) + ', marshmallows ' + a.marsh + ' ÷ ' + RECIPE.marsh + ' = ' + f.ratio.marsh.toFixed(1) + ', chocolate ' + a.choco + ' ÷ ' + RECIPE.choco + ' = ' + f.ratio.choco.toFixed(1) + '. The smallest quotient is ' + f.least.toFixed(1) + ', so ' + f.limiting.map((k) => NAMES[k].toLowerCase()).join(' and ') + (f.limiting.length > 1 ? ' are' : ' is') + ' limiting. It may not be the ingredient with the fewest pieces.';
      tray.textContent = '';
      for (let i = 0; i < Math.min(f.made, MAX_TRAY); i++) tray.appendChild(chip('smore', "S'more", false));
      if (f.made > MAX_TRAY) { const more = document.createElement('span'); more.className = 'hint'; more.textContent = '+' + (f.made - MAX_TRAY) + ' more'; tray.appendChild(more); }
      if (f.left.graham > 0) tray.appendChild(chip('graham', '+' + f.left.graham + ' crackers', true));
      if (f.left.marsh > 0) tray.appendChild(chip('marsh', '+' + f.left.marsh + ' marshmallows', true));
      if (f.left.choco > 0) tray.appendChild(chip('choco', '+' + f.left.choco + ' chocolate', true));
    }

    Object.keys(inputs).forEach((k) => inputs[k].addEventListener('input', update));
    window.GC_GATE_TOOL(box, [$('.sim-controls', box)], () => { live = true; results.hidden = false; update(); });
    update();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
