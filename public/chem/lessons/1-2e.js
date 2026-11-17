/* ============================================================
   1-2e LESSON INTERACTIVES
   The visual equation balancer, built on TB.sim.create (RUNTIME_SPEC 4.3). It has no loop:
   the picture is redrawn when a coefficient or the reaction changes. The building is the
   attempt, so it has no prediction lock (docs/plans/textbook-sim-briefs.md, "Chem building
   tools").
   Each substance has one slider for its coefficient (1 to 4). The ledger counts the atoms
   from the formulas and the coefficients. The beam tips by mass, so it only levels when the
   atoms match.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  const TAU = Math.PI * 2;

  // formulas, atom counts and molar masses (g/mol) of every substance
  const SPECIES = {
    H2: { label: 'H₂', atoms: { H: 2 }, mass: 2.02 },
    O2: { label: 'O₂', atoms: { O: 2 }, mass: 32.00 },
    N2: { label: 'N₂', atoms: { N: 2 }, mass: 28.02 },
    H2O: { label: 'H₂O', atoms: { H: 2, O: 1 }, mass: 18.02 },
    NH3: { label: 'NH₃', atoms: { N: 1, H: 3 }, mass: 17.03 },
    H2O2: { label: 'H₂O₂', atoms: { H: 2, O: 2 }, mass: 34.01 },
    CH4: { label: 'CH₄', atoms: { C: 1, H: 4 }, mass: 16.04 },
    CO2: { label: 'CO₂', atoms: { C: 1, O: 2 }, mass: 44.01 }
  };
  const ELEMENT = { H: 'Hydrogen atoms', O: 'Oxygen atoms', N: 'Nitrogen atoms', C: 'Carbon atoms' };
  const REACTIONS = {
    water: { name: 'Water synthesis', left: ['H2', 'O2'], right: ['H2O'] },
    ammonia: { name: 'Ammonia synthesis', left: ['N2', 'H2'], right: ['NH3'] },
    peroxide: { name: 'Peroxide decomposition', left: ['H2O2'], right: ['H2O', 'O2'] },
    methane: { name: 'Methane combustion', left: ['CH4', 'O2'], right: ['CO2', 'H2O'] }
  };
  const MIN = 1, MAX = 4;

  const sideSum = (names, coef, get) => names.reduce((n, k) => n + coef[k] * get(SPECIES[k]), 0);

  /* ---- the model ---- */
  function elements(rxn) {
    const out = [];
    REACTIONS[rxn].left.forEach((k) => Object.keys(SPECIES[k].atoms).forEach((el) => { if (out.indexOf(el) < 0) out.push(el); }));
    return out;
  }
  function ledger(rxn, coef) {
    const r = REACTIONS[rxn];
    return elements(rxn).map((el) => {
      const left = sideSum(r.left, coef, (s) => s.atoms[el] || 0);
      const right = sideSum(r.right, coef, (s) => s.atoms[el] || 0);
      return { el: el, left: left, right: right, match: left === right };
    });
  }
  const balanced = (rxn, coef) => ledger(rxn, coef).every((row) => row.match);

  // the beam tips toward the heavier side. A balanced equation has equal masses, so it levels.
  function tilt(rxn, coef) {
    if (balanced(rxn, coef)) return 0;
    const r = REACTIONS[rxn];
    const diff = sideSum(r.right, coef, (s) => s.mass) - sideSum(r.left, coef, (s) => s.mass);
    const sign = Math.sign(diff) || 1;
    return sign * (4.5 + Math.min(1, Math.max(0.1, Math.abs(diff) / 32)) * 9.5);
  }

  /* ---- the picture, in a 480 by 300 design box ---- */
  const W = 480, H = 300, CX = 240, PIVOT_Y = 70, BEAM = 120, DROP = 100, PAN = 66;
  function layout(rxn, coef) {
    const r = REACTIONS[rxn];
    const rad = (tilt(rxn, coef) * Math.PI) / 180;
    const ends = { lx: CX - BEAM * Math.cos(rad), ly: PIVOT_Y - BEAM * Math.sin(rad), rx: CX + BEAM * Math.cos(rad), ry: PIVOT_Y + BEAM * Math.sin(rad) };
    function pan(names, ex, ey) {
      const plateY = ey + DROP;
      const rows = names.length === 1 ? [plateY - 30] : [plateY - 52, plateY - 25];
      const mols = [];
      names.forEach((k, ri) => {
        const n = coef[k];
        for (let i = 0; i < n; i++) mols.push({ type: k, x: ex + (i - (n - 1) / 2) * 32, y: rows[ri] });
      });
      return { cx: ex, plateY: plateY, mols: mols };
    }
    return { tilt: tilt(rxn, coef), ends: ends, left: pan(r.left, ends.lx, ends.ly), right: pan(r.right, ends.rx, ends.ry) };
  }
  if (window.GC_MODELS) window.GC_MODELS['1-2e'] = { SPECIES: SPECIES, REACTIONS: REACTIONS, MIN: MIN, MAX: MAX, ledger: ledger, balanced: balanced, tilt: tilt, layout: layout, W: W, H: H, PAN: PAN };

  function init() {
    const box = $('[data-sim="balancer"]');
    if (!box || !window.TB) return;
    const chips = $$('[data-rxn]', box);
    const controls = $('[data-coef-rows]', box);
    const rows = {};
    $$('[data-species]', box).forEach((row) => { rows[row.dataset.species] = row; });
    const tiles = $$('[data-el-tile]', box);
    const note = $('[data-sim-note]', box);
    const coef = {};
    Object.keys(SPECIES).forEach((k) => { coef[k] = MIN; });
    let rxn = 'water';
    let sim = null;

    const equation = () => {
      const r = REACTIONS[rxn];
      const part = (names) => names.map((k) => coef[k] + ' ' + SPECIES[k].label).join(' + ');
      return part(r.left) + ' → ' + part(r.right);
    };

    function report() {
      const lg = ledger(rxn, coef);
      const ok = lg.every((row) => row.match);
      tiles.forEach((tile, i) => {
        const row = lg[i];
        tile.hidden = !row;
        if (!row) return;
        tile.dataset.match = String(row.match);
        $('.readout-label', tile).textContent = ELEMENT[row.el];
        sim.setReadout(tile.dataset.readout, row.left + (row.match ? ' = ' : ' ≠ ') + row.right);
      });
      sim.setReadout('eq', equation());
      sim.setStatus(ok ? 'ok' : 'warn', ok ? 'Balanced' : 'Not balanced yet');
      const bad = lg.filter((row) => !row.match)[0];
      note.textContent = ok
        ? 'Every atom on the left has a partner on the right, and no subscript changed. The beam is level.'
        : ELEMENT[bad.el].replace(' atoms', '') + ': ' + bad.left + ' on the left and ' + bad.right + ' on the right. Change a coefficient, never a subscript.';
      sim.setLabel('Balance beam for ' + REACTIONS[rxn].name.toLowerCase() + '. Left pan: ' + REACTIONS[rxn].left.map((k) => coef[k] + ' ' + SPECIES[k].label).join(', ') + '. Right pan: ' + REACTIONS[rxn].right.map((k) => coef[k] + ' ' + SPECIES[k].label).join(', ') + '. ' + (ok ? 'The beam is level.' : 'The beam tips to the heavier side.'));
    }

    function setReaction(name) {
      rxn = name;
      const r = REACTIONS[name];
      Object.keys(SPECIES).forEach((k) => { coef[k] = MIN; });
      Object.keys(rows).forEach((k) => {
        const row = rows[k];
        const input = $('input', row);
        const on = r.left.indexOf(k) >= 0 || r.right.indexOf(k) >= 0;
        row.hidden = !on;
        input.value = String(MIN);
        input.dispatchEvent(new Event('input'));          // the helper rewrites the output beside it
      });
      r.left.concat(r.right).forEach((k) => {
        $('.side', rows[k]).textContent = r.left.indexOf(k) >= 0 ? 'reactant' : 'product';
        controls.appendChild(rows[k]);                    // reactants first, then products
      });
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.rxn === name)));
      report();
      sim.redraw();
    }

    /* ---- drawing ---- */
    function atom(ctx, x, y, r, fill) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
      ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 1; ctx.stroke();
    }
    function bonds(ctx, list) {
      ctx.lineWidth = 1.2;
      list.forEach((b) => { ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(b[2], b[3]); ctx.stroke(); });
    }
    function molecule(ctx, c, type, x, y) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(0.9, 0.9);
      ctx.strokeStyle = c.ink;
      const G = c.inkMute;
      if (type === 'H2') {
        bonds(ctx, [[-5, 0, 5, 0]]);
        atom(ctx, -5, 0, 3.8, c.paper3); atom(ctx, 5, 0, 3.8, c.paper3);
      } else if (type === 'O2') {
        bonds(ctx, [[-6, -1.4, 6, -1.4], [-6, 1.4, 6, 1.4]]);
        atom(ctx, -6, 0, 5.6, c.accent); atom(ctx, 6, 0, 5.6, c.accent);
      } else if (type === 'N2') {
        bonds(ctx, [[-6, -2, 6, -2], [-6, 0, 6, 0], [-6, 2, 6, 2]]);
        atom(ctx, -6, 0, 5.6, G); atom(ctx, 6, 0, 5.6, G);
      } else if (type === 'H2O') {
        bonds(ctx, [[0, -2, -7, 5], [0, -2, 7, 5]]);
        atom(ctx, 0, -2, 6, c.accent); atom(ctx, -7, 5, 3.8, c.paper3); atom(ctx, 7, 5, 3.8, c.paper3);
      } else if (type === 'NH3') {
        bonds(ctx, [[0, -2, -8, 6], [0, -2, 8, 6], [0, -2, 0, 8]]);
        atom(ctx, 0, -2, 6, G); atom(ctx, -8, 6, 3.8, c.paper3); atom(ctx, 8, 6, 3.8, c.paper3); atom(ctx, 0, 8, 3.8, c.paper3);
      } else if (type === 'H2O2') {
        bonds(ctx, [[-12, -4, -6, 0], [-6, 0, 6, 0], [6, 0, 12, 4]]);
        atom(ctx, -6, 0, 5.6, c.accent); atom(ctx, 6, 0, 5.6, c.accent); atom(ctx, -12, -4, 3.8, c.paper3); atom(ctx, 12, 4, 3.8, c.paper3);
      } else if (type === 'CH4') {
        bonds(ctx, [[0, 0, 0, -9], [0, 0, -8, 6], [0, 0, 8, 6], [0, 0, 0, 9]]);
        atom(ctx, 0, 0, 6, c.ink);
        atom(ctx, 0, -9, 3.8, c.paper3); atom(ctx, -8, 6, 3.8, c.paper3); atom(ctx, 8, 6, 3.8, c.paper3); atom(ctx, 0, 9, 3.8, c.paper3);
      } else {                                              // CO2
        bonds(ctx, [[-12, -1.5, 12, -1.5], [-12, 1.5, 12, 1.5]]);
        atom(ctx, -12, 0, 5.6, c.accent); atom(ctx, 12, 0, 5.6, c.accent); atom(ctx, 0, 0, 6, c.ink);
      }
      ctx.restore();
    }
    function drawPan(ctx, env, p, endX, endY, title) {
      const c = env.colors;
      ctx.strokeStyle = c.inkSoft; ctx.lineWidth = 1;
      [-PAN, PAN].forEach((d) => { ctx.beginPath(); ctx.moveTo(endX, endY); ctx.lineTo(endX + d, p.plateY); ctx.stroke(); });
      ctx.fillStyle = c.paper2; ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(endX - PAN - 5, p.plateY);
      ctx.lineTo(endX + PAN + 5, p.plateY);
      ctx.bezierCurveTo(endX + PAN, p.plateY + 7, endX - PAN, p.plateY + 7, endX - PAN - 5, p.plateY);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      p.mols.forEach((m) => molecule(ctx, c, m.type, m.x, m.y));
      ctx.fillStyle = c.inkSoft;
      ctx.font = env.font(12, 'mono', 600);
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(title, endX, p.plateY + 14);
    }
    function draw(ctx, env) {
      const c = env.colors;
      const k = Math.min(env.w / W, env.h / H);
      ctx.save();
      ctx.translate((env.w - W * k) / 2, (env.h - H * k) / 2);
      ctx.scale(k, k);
      const lay = layout(rxn, coef);
      ctx.strokeStyle = c.inkMute; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(CX, PIVOT_Y); ctx.lineTo(CX, 284); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CX - 60, 284); ctx.lineTo(CX + 60, 284); ctx.stroke();
      ctx.strokeStyle = c.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(lay.ends.lx, lay.ends.ly); ctx.lineTo(lay.ends.rx, lay.ends.ry); ctx.stroke();
      drawPan(ctx, env, lay.left, lay.ends.lx, lay.ends.ly, 'Reactants');
      drawPan(ctx, env, lay.right, lay.ends.rx, lay.ends.ry, 'Products');
      ctx.lineWidth = 1.5; ctx.strokeStyle = c.ink; ctx.fillStyle = c.accent;
      ctx.beginPath(); ctx.arc(CX, PIVOT_Y, 6, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: false,
      tokens: ['paper-3'],
      init() { setReaction('water'); },
      draw: draw
    });

    chips.forEach((chip) => chip.addEventListener('click', () => setReaction(chip.dataset.rxn)));
    Object.keys(rows).forEach((k) => {
      $('input', rows[k]).addEventListener('input', (e) => { coef[k] = Number(e.target.value); report(); sim.redraw(); });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
