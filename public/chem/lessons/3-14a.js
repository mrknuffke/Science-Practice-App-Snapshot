/* ============================================================
   3-14a LESSON INTERACTIVES (manifest id 1-4a)
   Two tools in this lesson.
     1. The reaction profile: a looping canvas on TB.sim.create (RUNTIME_SPEC 4.3), locked until
        the prediction is committed. Brief: docs/plans/textbook-sim-briefs.md, "Chem 3-14a:
        Reaction Profile". Every reaction has its own particle picture, and the barrier of the
        reverse reaction is the forward barrier plus the energy released.
        The forward barriers (436 and 945 kJ/mol) are the values the lesson always carried; they
        are the bond energies of H-H and N-N triple, which the brief lists for David to confirm.
     2. The bond-energy calculator, a DOM tool that sits inside the Enrichment block.
   Zero em-dashes.
   ============================================================ */

/* ---------- 1. THE REACTION PROFILE ---------- */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  /* ---- the model: energies in kJ/mol, measured from the reactants ---- */
  const FWD = {
    combust: { name: '2 H₂ + O₂ → 2 H₂O', dH: -484, eaU: 436, eaC: 125 },
    ammonia: { name: 'N₂ + 3 H₂ → 2 NH₃', dH: -92, eaU: 945, eaC: 180 }
  };
  // The reverse reaction climbs the same hill from the other side: its barrier is the forward barrier plus the energy released.
  const RXN = {
    combust: Object.assign({ key: 'combust' }, FWD.combust),
    split: { key: 'split', name: '2 H₂O → 2 H₂ + O₂', dH: -FWD.combust.dH, eaU: FWD.combust.eaU - FWD.combust.dH, eaC: FWD.combust.eaC - FWD.combust.dH },
    ammonia: Object.assign({ key: 'ammonia' }, FWD.ammonia)
  };
  const barrier = (r, cat) => (cat ? r.eaC : r.eaU);

  // A smooth profile: flat reactants, a hump whose top is exactly the barrier, then the products.
  const smooth = (x) => { const t = clamp((x - 0.15) / 0.7, 0, 1); return t * t * (3 - 2 * t); };
  const bump = (x) => Math.exp(-Math.pow((x - 0.5) / 0.14, 2));
  function curve(dH, peak) {
    const top = (B) => { let m = -Infinity; for (let i = 0; i <= 400; i++) { const x = i / 400; m = Math.max(m, dH * smooth(x) + B * bump(x)); } return m; };
    let lo = 0, hi = Math.max(1, peak * 3);
    for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (top(mid) < peak) lo = mid; else hi = mid; }
    const B = (lo + hi) / 2;
    return (x) => dH * smooth(x) + B * bump(x);
  }

  /* ---- the particle pictures: one for each reaction, in design units of a 320 by 200 panel ---- */
  const COL = { H: 'inkSoft', O: 'accent', N: 'cool' };
  const RAD = { H: 6, O: 10, N: 9 };
  const h2 = (x, y) => ({ atoms: [{ t: 'H', x: x, y: y }, { t: 'H', x: x + 18, y: y }], bonds: [[0, 1, 1]] });
  const o2 = (x, y) => ({ atoms: [{ t: 'O', x: x, y: y }, { t: 'O', x: x + 24, y: y }], bonds: [[0, 1, 2]] });
  const n2 = (x, y) => ({ atoms: [{ t: 'N', x: x, y: y }, { t: 'N', x: x + 24, y: y }], bonds: [[0, 1, 3]] });
  const h2o = (x, y) => ({ atoms: [{ t: 'O', x: x, y: y }, { t: 'H', x: x - 15, y: y + 20 }, { t: 'H', x: x + 15, y: y + 20 }], bonds: [[0, 1, 1], [0, 2, 1]] });
  const nh3 = (x, y) => ({ atoms: [{ t: 'N', x: x, y: y }, { t: 'H', x: x - 18, y: y + 20 }, { t: 'H', x: x + 18, y: y + 20 }, { t: 'H', x: x, y: y - 22 }], bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] });
  const SCENES = {
    combust: {
      start: [h2(52, 52), h2(52, 128), o2(214, 90)],
      end: [h2o(104, 80), h2o(214, 80)],
      mid: { atoms: [{ t: 'H', x: 118, y: 62 }, { t: 'H', x: 152, y: 62 }, { t: 'H', x: 118, y: 138 }, { t: 'H', x: 152, y: 138 }, { t: 'O', x: 196, y: 82 }, { t: 'O', x: 196, y: 118 }], stretched: [[0, 1], [2, 3], [4, 5]], partial: [[1, 4], [3, 5]] }
    },
    ammonia: {
      start: [n2(46, 100), h2(206, 40), h2(206, 100), h2(206, 160)],
      end: [nh3(104, 96), nh3(214, 96)],
      mid: { atoms: [{ t: 'N', x: 134, y: 100 }, { t: 'N', x: 176, y: 100 }, { t: 'H', x: 120, y: 58 }, { t: 'H', x: 148, y: 58 }, { t: 'H', x: 166, y: 146 }, { t: 'H', x: 194, y: 146 }, { t: 'H', x: 124, y: 146 }, { t: 'H', x: 152, y: 146 }], stretched: [[0, 1], [2, 3], [4, 5], [6, 7]], partial: [[2, 0], [3, 1], [6, 0], [5, 1]] }
    }
  };
  SCENES.split = { start: SCENES.combust.end, end: SCENES.combust.start, mid: SCENES.combust.mid };
  const atomCount = (mols) => mols.reduce((c, m) => { m.atoms.forEach((a) => { c[a.t] = (c[a.t] || 0) + 1; }); return c; }, {});
  const stageOf = (pct) => (pct < 25 ? 'start' : pct <= 75 ? 'mid' : 'end');
  const STAGE_NAME = { start: 'Reactants', mid: 'Transition state', end: 'Products' };
  const TEXT = {
    combust: { start: 'H₂ and O₂ molecules approach. Every covalent bond is whole.', mid: 'The H–H and O=O bonds stretch and weaken. New H–O bonds start to form.', end: 'Two H₂O molecules form. The new bonds released more energy than breaking the old bonds cost.' },
    split: { start: 'Two H₂O molecules sit low in energy. Splitting them takes a large push.', mid: 'The O–H bonds stretch to the breaking point before the H–H and O=O bonds hold.', end: 'H₂ and O₂ form. The products sit higher than the water, so the reaction absorbed energy.' },
    ammonia: { start: 'N₂ has a strong triple bond. Three H₂ molecules approach.', mid: 'The N≡N bond stretches while the H–H bonds weaken and N–H bonds start to form.', end: 'Two NH₃ molecules form. The six new N–H bonds released more energy than breaking the old bonds cost.' }
  };
  const fmt = (x) => (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x) + ' kJ/mol';

  if (window.GC_MODELS) window.GC_MODELS['3-14a'] = { RXN: RXN, barrier: barrier, curve: curve, SCENES: SCENES, atomCount: atomCount, stageOf: stageOf, TEXT: TEXT, FWD: FWD };

  /* ---- the page ---- */
  const PW = 320, PH = 200;
  const X0 = 44, X1 = 308, Y0 = 164, Y1 = 22;

  function init() {
    const box = $('[data-sim="profile"]');
    if (!box || !window.TB) return;
    const pick = $('#rxnChoice', box), catBtn = $('#chkCatalyst', box), playBtn = $('#btnPlayRxn', box), slider = $('#sliderProgress', box);
    const note = $('[data-sim-note]', box);
    let rxn = RXN.combust, cat = false, pct = 0, playing = false, sim = null, fromPlay = false;
    const curves = {};
    const cv = (r, c) => { const k = r.key + (c ? 'C' : 'U'); return curves[k] || (curves[k] = curve(r.dH, barrier(r, c))); };

    function report() {
      const stage = stageOf(pct);
      sim.setReadout('ea', '+' + barrier(rxn, cat) + ' kJ/mol');
      sim.setReadout('dh', fmt(rxn.dH));
      sim.setReadout('cat', cat ? 'On' : 'Off');
      sim.setReadout('stage', STAGE_NAME[stage]);
      sim.setStatus(stage === 'mid' ? 'warn' : stage === 'end' ? 'ok' : 'neutral', stage === 'mid' ? 'At the barrier' : stage === 'end' ? (rxn.dH < 0 ? 'Energy released' : 'Energy absorbed') : 'Reactants');
      if (sim.committed) note.textContent = TEXT[rxn.key][stage];
      sim.setLabel('Reaction ' + rxn.name + ' with the catalyst ' + (cat ? 'on' : 'off') + '. A graph of energy against reaction progress with a barrier of ' + barrier(rxn, cat) + ' kJ per mole, and a picture of the molecules at the ' + STAGE_NAME[stage].toLowerCase() + ' stage.');
    }

    /* ---- drawing ---- */
    function atom(ctx, env, a) {
      ctx.fillStyle = env.colors[COL[a.t]]; ctx.strokeStyle = env.colors.paper; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(a.x, a.y, RAD[a.t], 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    function bondLine(ctx, a, b, order, color, dash) {
      const dx = b.y - a.y, dy = a.x - b.x, len = Math.hypot(dx, dy) || 1, nx = dx / len, ny = dy / len;
      ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.setLineDash(dash || []);
      for (let i = 0; i < order; i++) {
        const o = (i - (order - 1) / 2) * 4;
        ctx.beginPath(); ctx.moveTo(a.x + nx * o, a.y + ny * o); ctx.lineTo(b.x + nx * o, b.y + ny * o); ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    function drawGraph(ctx, env, fs) {
      const c = env.colors, E = cv(rxn, cat), Eu = cv(rxn, false);
      const lo = Math.min(0, rxn.dH), hi = rxn.eaU;
      const span = hi - lo, ymin = lo - span * 0.1, ymax = hi + span * 0.1;
      const gx = (x) => X0 + x * (X1 - X0), gy = (e) => Y0 - ((e - ymin) / (ymax - ymin)) * (Y0 - Y1);
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X0, Y1 - 6); ctx.lineTo(X0, Y0 + 6); ctx.lineTo(X1 + 4, Y0 + 6); ctx.stroke();
      ctx.fillStyle = c.inkSoft; ctx.font = env.font(fs, 'display', 400); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('Reaction progress →', (X0 + X1) / 2, Y0 + 10);
      ctx.save(); ctx.translate(14, (Y0 + Y1) / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = 'alphabetic'; ctx.fillText('Energy', 0, 0); ctx.restore();
      // the reactant level
      ctx.strokeStyle = c.inkMute; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(X0, gy(0)); ctx.lineTo(X1, gy(0)); ctx.stroke(); ctx.setLineDash([]);
      const trace = (fn, color, w, dash) => {
        ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.beginPath();
        for (let i = 0; i <= 120; i++) { const x = i / 120; (i ? ctx.lineTo : ctx.moveTo).call(ctx, gx(x), gy(fn(x))); }
        ctx.stroke(); ctx.setLineDash([]);
      };
      if (cat) { trace(Eu, c.inkMute, 2); trace(E, c.good, 3.5, [6, 4]); } else trace(Eu, c.accent, 3.5);
      // the barrier and the energy change
      const eaX = gx(0.5), peak = barrier(rxn, cat);
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(eaX, gy(0)); ctx.lineTo(eaX, gy(peak)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = c.ink; ctx.font = env.font(fs, 'mono', 700); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('Ea', eaX + 6, (gy(0) + gy(peak)) / 2);
      const dX = gx(0.88);
      ctx.strokeStyle = c.accent; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(dX, gy(0)); ctx.lineTo(dX, gy(rxn.dH)); ctx.stroke();
      ctx.fillStyle = c.accent; ctx.textAlign = 'right';
      // a short bracket (ammonia) has no room beside it, so its label sits just above the reactant level
      const dy = Math.abs(gy(0) - gy(rxn.dH));
      ctx.fillText('ΔH', dX - 6, dy < 18 ? gy(0) - 9 : (gy(0) + gy(rxn.dH)) / 2);
      // level names
      ctx.fillStyle = c.ink; ctx.font = env.font(fs, 'display', 700); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('Reactants', X0 + 6, gy(0) + 5);
      ctx.textAlign = 'right'; ctx.textBaseline = rxn.dH < 0 ? 'top' : 'bottom';
      ctx.fillText('Products', dX - 8, rxn.dH < 0 ? gy(rxn.dH) + 5 : gy(rxn.dH) - 5);
      // the bead
      const x = pct / 100;
      ctx.fillStyle = cat ? c.good : c.accent; ctx.strokeStyle = c.paper; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(gx(x), gy(E(x)), 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    function drawMolecules(ctx, env, fs) {
      const c = env.colors, stage = stageOf(pct), sc = SCENES[rxn.key];
      ctx.fillStyle = c.card; ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(0.75, 0.75, PW - 1.5, PH - 1.5, 6); ctx.fill(); ctx.stroke();
      if (stage === 'mid') {
        const m = sc.mid;
        m.stretched.forEach((p) => bondLine(ctx, m.atoms[p[0]], m.atoms[p[1]], 1, c.inkMute, [4, 3]));
        m.partial.forEach((p) => bondLine(ctx, m.atoms[p[0]], m.atoms[p[1]], 1, c.accent, [2, 3]));
        m.atoms.forEach((a) => atom(ctx, env, a));
      } else {
        sc[stage].forEach((mol) => {
          mol.bonds.forEach((b) => bondLine(ctx, mol.atoms[b[0]], mol.atoms[b[1]], b[2], c.ink));
          mol.atoms.forEach((a) => atom(ctx, env, a));
        });
      }
      ctx.fillStyle = c.ink; ctx.font = env.font(fs, 'display', 700); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(STAGE_NAME[stage], 10, 8);
    }
    function draw(ctx, env) {
      const wide = env.w / env.h > 1.6;
      const dw = wide ? 2 * PW + 20 : PW, dh = wide ? PH : 2 * PH + 16;
      const k = Math.min(env.w / dw, env.h / dh);
      const fs = Math.max(12, 12 / k);
      ctx.save();
      ctx.translate((env.w - dw * k) / 2, (env.h - dh * k) / 2);
      ctx.scale(k, k);
      drawGraph(ctx, env, fs);
      ctx.translate(wide ? PW + 20 : 0, wide ? 0 : PH + 16);
      drawMolecules(ctx, env, fs);
      ctx.restore();
    }

    function setProgress(p, fromUser) {
      pct = clamp(p, 0, 100);
      if (fromUser) playing = false;
      fromPlay = true;
      slider.value = String(pct);
      slider.dispatchEvent(new Event('input'));
      fromPlay = false;
      report();
      sim.redraw();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 1.1,       // four presses run the 4 s reaction
      init() { report(); },
      onUnlock() { report(); },
      update(dt) {
        if (!playing) return;
        const next = pct + (dt / 4) * 100;
        if (next >= 100) { playing = false; setProgress(100); } else setProgress(next);
      },
      draw: draw,
      preset(name) {
        const p = name.split(':');
        pick.value = p[0]; rxn = RXN[p[0]]; cat = p[1] === 'on';
        catBtn.setAttribute('aria-pressed', String(cat));
        playing = false;
        setProgress(50);
      },
      record() {
        return { 'Reaction': rxn.name, 'Catalyst': cat ? 'On' : 'Off', 'Barrier (kJ/mol)': '+' + barrier(rxn, cat), 'Energy change (kJ/mol)': (rxn.dH > 0 ? '+' : '−') + Math.abs(rxn.dH) };
      }
    });

    pick.addEventListener('change', () => { rxn = RXN[pick.value]; playing = false; setProgress(0); });
    catBtn.addEventListener('click', () => { cat = !cat; catBtn.setAttribute('aria-pressed', String(cat)); report(); sim.redraw(); });
    slider.addEventListener('input', () => { if (!fromPlay) setProgress(Number(slider.value), true); });
    playBtn.addEventListener('click', () => { if (pct >= 100) setProgress(0); playing = true; sim.release(); });
    report();
  }
  document.addEventListener('DOMContentLoaded', init);
})();


/* ---------- 2. THE BOND-ENERGY CALCULATOR (Enrichment) ---------- */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);

  const BONDS = { 'C−H': 413, 'O=O': 498, 'C=O': 799, 'O−H': 463, 'H−H': 436, 'N≡N': 945, 'N−H': 391, 'Cl−Cl': 242, 'H−Cl': 431 };
  const DATA = {
    methane: { eq: 'CH₄ + 2 O₂ → CO₂ + 2 H₂O', broken: [[4, 'C−H'], [2, 'O=O']], formed: [[2, 'C=O'], [4, 'O−H']], comment: 'The strong C=O and O−H bonds that form release far more energy than the reactant bonds cost to break.' },
    hydrogen: { eq: '2 H₂ + O₂ → 2 H₂O', broken: [[2, 'H−H'], [1, 'O=O']], formed: [[4, 'O−H']], comment: 'Four O−H bonds form. They release 482 kJ more than breaking two H−H bonds and one O=O bond costs.' },
    haber: { eq: 'N₂ + 3 H₂ → 2 NH₃', broken: [[1, 'N≡N'], [3, 'H−H']], formed: [[6, 'N−H']], comment: 'Breaking the strong N≡N bond costs a lot. The six N−H bonds that form return slightly more, so the net release is 93 kJ.' },
    hcl: { eq: 'H₂ + Cl₂ → 2 HCl', broken: [[1, 'H−H'], [1, 'Cl−Cl']], formed: [[2, 'H−Cl']], comment: 'The two H−Cl bonds that form are stronger than the H−H and Cl−Cl bonds that break, so energy is released.' }
  };

  // The totals for one reaction: each count times its bond energy, then the difference.
  function enthalpy(key) {
    const d = DATA[key];
    if (!d) return null;
    const sum = (list) => list.map((b) => ({ count: b[0], bond: b[1], d: BONDS[b[1]], sub: b[0] * BONDS[b[1]] }));
    const broken = sum(d.broken), formed = sum(d.formed);
    const tb = broken.reduce((s, x) => s + x.sub, 0), tf = formed.reduce((s, x) => s + x.sub, 0);
    return { eq: d.eq, broken: broken, formed: formed, totalBroken: tb, totalFormed: tf, dH: tb - tf, comment: d.comment };
  }
  if (window.GC_MODELS) window.GC_MODELS['3-14a-bonds'] = { enthalpy: enthalpy, DATA: DATA, BONDS: BONDS };

  function init() {
    const box = $('[data-tool="bonds"]');
    if (!box) return;
    const pick = $('#calcRxnPreset', box);
    const lists = { broken: $('[data-bonds="broken"]', box), formed: $('[data-bonds="formed"]', box) };
    const pill = $('.status-pill', box), note = $('[data-sim-note]', box);
    const read = (id, text) => { const el = $('[data-readout="' + id + '"] .readout-value', box); if (el) el.textContent = text; };

    function show() {
      const r = enthalpy(pick.value);
      ['broken', 'formed'].forEach((k) => {
        lists[k].textContent = '';
        r[k].forEach((b) => { const li = document.createElement('li'); li.textContent = b.count + ' × ' + b.bond + ' = ' + b.count + ' × ' + b.d + ' kJ = ' + b.sub.toLocaleString('en-US') + ' kJ'; lists[k].appendChild(li); });
      });
      read('broken', '+' + r.totalBroken.toLocaleString('en-US') + ' kJ');
      read('formed', '−' + r.totalFormed.toLocaleString('en-US') + ' kJ');
      read('net', (r.dH > 0 ? '+' : '−') + Math.abs(r.dH).toLocaleString('en-US') + ' kJ/mol');
      pill.dataset.state = r.dH < 0 ? 'ok' : 'warn';
      pill.textContent = r.dH < 0 ? 'Releases energy' : 'Absorbs energy';
      note.textContent = r.eq + '. ' + r.comment;
    }
    pick.addEventListener('change', show);
    show();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
