/* ============================================================
   1-7b LESSON INTERACTIVES (file 2-7b)
   Two tools in this lesson. The building is the attempt in both, so neither has a prediction
   lock (docs/plans/textbook-sim-briefs.md, "Chem building tools").
     1. The conversion factor builder. The cards, the setup line and the buttons are DOM.
        The "visual conversion path" is a canvas on TB.sim.create (RUNTIME_SPEC 4.3) that
        has no loop: it is redrawn when a card is chosen.
     2. The empirical and molecular formula calculator (a DOM tool). It asks for a guess
        first and keeps its work hidden until the guess is checked.
   Zero em-dashes.
   ============================================================ */

/* ---------- 1. CONVERSION FACTOR BUILDER ---------- */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  const TAU = Math.PI * 2;

  // each problem: the correct card has isCorrect; "target" is the substance the problem asks about
  const PROBLEMS = [
    {
      text: 'A chemistry experiment makes a small sample of water. How many moles of water are in 36.04 grams of H₂O?',
      startVal: 36.04, startUnit: 'g H₂O', target: 'H2O', correctVal: 2.00, correctUnit: 'mol H₂O',
      success: 'The g H₂O in the denominator cancels the starting g H₂O and leaves mol H₂O. 36.04 × (1 / 18.02) = 2.00 mol of water.',
      factors: [
        { num: '1 mol H₂O', den: '18.02 g H₂O', numVal: 1, denVal: 18.02, substance: 'H2O', isCorrect: true },
        { num: '18.02 g H₂O', den: '1 mol H₂O', numVal: 18.02, denVal: 1, substance: 'H2O', isCorrect: false },
        { num: '1 mol NaCl', den: '58.44 g NaCl', numVal: 1, denVal: 58.44, substance: 'NaCl', isCorrect: false },
        { num: '58.44 g NaCl', den: '1 mol NaCl', numVal: 58.44, denVal: 1, substance: 'NaCl', isCorrect: false }
      ],
      order: [1, 0, 3, 2]
    },
    {
      text: 'A reaction needs table salt. How many grams of NaCl are in 2.50 moles of NaCl?',
      startVal: 2.50, startUnit: 'mol NaCl', target: 'NaCl', correctVal: 146.10, correctUnit: 'g NaCl',
      success: 'The mol NaCl in the denominator cancels the starting mol NaCl and leaves g NaCl. 2.50 × (58.44 / 1) = 146.10 g of salt.',
      factors: [
        { num: '58.44 g NaCl', den: '1 mol NaCl', numVal: 58.44, denVal: 1, substance: 'NaCl', isCorrect: true },
        { num: '1 mol NaCl', den: '58.44 g NaCl', numVal: 1, denVal: 58.44, substance: 'NaCl', isCorrect: false },
        { num: '18.02 g H₂O', den: '1 mol H₂O', numVal: 18.02, denVal: 1, substance: 'H2O', isCorrect: false },
        { num: '1 mol H₂O', den: '18.02 g H₂O', numVal: 1, denVal: 18.02, substance: 'H2O', isCorrect: false }
      ],
      order: [2, 3, 0, 1]
    },
    {
      text: 'A flask holds 88.02 grams of carbon dioxide gas. How many moles of CO₂ are in the flask?',
      startVal: 88.02, startUnit: 'g CO₂', target: 'CO2', correctVal: 2.00, correctUnit: 'mol CO₂',
      success: 'The g CO₂ in the denominator cancels the starting g CO₂ and leaves mol CO₂. 88.02 × (1 / 44.01) = 2.00 mol of CO₂.',
      factors: [
        { num: '1 mol CO₂', den: '44.01 g CO₂', numVal: 1, denVal: 44.01, substance: 'CO2', isCorrect: true },
        { num: '44.01 g CO₂', den: '1 mol CO₂', numVal: 44.01, denVal: 1, substance: 'CO2', isCorrect: false },
        { num: '1 mol CH₄', den: '16.04 g CH₄', numVal: 1, denVal: 16.04, substance: 'CH4', isCorrect: false },
        { num: '16.04 g CH₄', den: '1 mol CH₄', numVal: 16.04, denVal: 1, substance: 'CH4', isCorrect: false }
      ],
      order: [0, 2, 1, 3]
    },
    {
      text: 'A Bunsen burner burns methane. How many grams of methane are in 0.50 moles of CH₄?',
      startVal: 0.50, startUnit: 'mol CH₄', target: 'CH4', correctVal: 8.02, correctUnit: 'g CH₄',
      success: 'The mol CH₄ in the denominator cancels the starting mol CH₄ and leaves g CH₄. 0.50 × (16.04 / 1) = 8.02 g of methane.',
      factors: [
        { num: '16.04 g CH₄', den: '1 mol CH₄', numVal: 16.04, denVal: 1, substance: 'CH4', isCorrect: true },
        { num: '1 mol CH₄', den: '16.04 g CH₄', numVal: 1, denVal: 16.04, substance: 'CH4', isCorrect: false },
        { num: '44.01 g CO₂', den: '1 mol CO₂', numVal: 44.01, denVal: 1, substance: 'CO2', isCorrect: false },
        { num: '1 mol CO₂', den: '44.01 g CO₂', numVal: 1, denVal: 44.01, substance: 'CO2', isCorrect: false }
      ],
      order: [3, 1, 0, 2]
    },
    {
      text: 'A baking recipe needs 168.02 grams of sodium bicarbonate (NaHCO₃). How many moles of NaHCO₃ is that?',
      startVal: 168.02, startUnit: 'g NaHCO₃', target: 'NaHCO3', correctVal: 2.00, correctUnit: 'mol NaHCO₃',
      success: 'The g NaHCO₃ in the denominator cancels the starting g NaHCO₃ and leaves mol NaHCO₃. 168.02 × (1 / 84.01) = 2.00 mol of baking soda.',
      factors: [
        { num: '1 mol NaHCO₃', den: '84.01 g NaHCO₃', numVal: 1, denVal: 84.01, substance: 'NaHCO3', isCorrect: true },
        { num: '84.01 g NaHCO₃', den: '1 mol NaHCO₃', numVal: 84.01, denVal: 1, substance: 'NaHCO3', isCorrect: false },
        { num: '1 mol H₂O', den: '18.02 g H₂O', numVal: 1, denVal: 18.02, substance: 'H2O', isCorrect: false },
        { num: '18.02 g H₂O', den: '1 mol H₂O', numVal: 18.02, denVal: 1, substance: 'H2O', isCorrect: false }
      ],
      order: [1, 3, 2, 0]
    }
  ];

  // what a chosen card does to the setup. Wrong substance is checked first, then the orientation.
  function evaluate(prob, f) {
    if (f.substance !== prob.target) return { state: 'wrong-substance' };
    const startQty = prob.startUnit.split(' ')[0];     // "g" or "mol"
    const denQty = f.den.split(' ')[1], numQty = f.num.split(' ')[1];
    if (denQty === startQty) return { state: 'correct', value: Math.round(prob.startVal * (f.numVal / f.denVal) * 100) / 100 };
    if (numQty === startQty) return { state: 'wrong-orientation' };
    return { state: 'no-cancel' };
  }
  if (window.GC_MODELS) window.GC_MODELS['1-7b'] = { PROBLEMS: PROBLEMS, evaluate: evaluate };

  function init() {
    const box = $('[data-sim="conversion"]');
    if (!box || !window.TB) return;
    const counter = $('#problemCounter', box), text = $('#problemText', box);
    const startEl = $('#startingValue', box), slot = $('#factorSlot', box), result = $('#finalResult', box);
    const cardsEl = $('#factorCards', box);
    const prev = $('#prevBtn', box), next = $('#nextBtn', box);
    const note = $('[data-sim-note]', box);
    let idx = 0, picked = null, state = 'initial', sim = null;

    const fraction = (f) => {
      const span = document.createElement('span');
      span.className = 'fraction';
      const n = document.createElement('span'); n.className = 'numerator'; n.textContent = f.num;
      const d = document.createElement('span'); d.className = 'denominator'; d.textContent = f.den;
      span.appendChild(n); span.appendChild(d);
      return span;
    };

    function setStatus(kind, label, message) {
      sim.setStatus(kind, label);
      note.textContent = message;
    }

    function loadProblem(i) {
      idx = i; picked = null; state = 'initial';
      const p = PROBLEMS[idx];
      counter.textContent = 'Problem ' + (idx + 1) + ' of ' + PROBLEMS.length;
      text.textContent = p.text;
      startEl.textContent = '';
      startEl.appendChild(document.createTextNode(p.startVal + ' '));
      const u = document.createElement('span'); u.className = 'unit-text'; u.textContent = p.startUnit; startEl.appendChild(u);
      result.textContent = '?';
      slot.textContent = 'Choose a card below';
      slot.dataset.filled = 'false';
      prev.disabled = idx === 0;
      next.disabled = true;
      cardsEl.textContent = '';
      p.order.forEach((fi) => {
        const f = p.factors[fi];
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'factor-card';
        b.setAttribute('aria-pressed', 'false');
        b.setAttribute('aria-label', f.num + ' over ' + f.den);
        b.appendChild(fraction(f));
        b.addEventListener('click', () => choose(f, b));
        cardsEl.appendChild(b);
      });
      sim.setReadout('start', p.startVal + ' ' + p.startUnit);
      sim.setReadout('target', p.correctUnit);
      setStatus('neutral', 'Choose a card', 'Look for the card that puts the starting unit (' + p.startUnit.split(' ')[0] + ') in the denominator, so the units cancel.');
      report();
    }

    function choose(f, button) {
      const p = PROBLEMS[idx];
      picked = f;
      $$('.factor-card', cardsEl).forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      slot.textContent = '';
      slot.appendChild(fraction(f));
      slot.dataset.filled = 'true';
      const r = evaluate(p, f);
      state = r.state;
      const startUnitEl = $('.unit-text', startEl);
      startUnitEl.classList.toggle('canceled', r.state === 'correct');
      $$('.denominator', slot).forEach((el) => el.classList.toggle('canceled', r.state === 'correct'));
      const g = p.startUnit.split(' ')[0];
      if (r.state === 'correct') {
        result.textContent = r.value.toFixed(2) + ' ' + p.correctUnit;
        next.disabled = idx === PROBLEMS.length - 1;
        setStatus('ok', 'Correct setup', p.success);
      } else {
        result.textContent = '?';
        next.disabled = true;
        if (r.state === 'wrong-substance') setStatus('alert', 'Wrong compound', 'This card is for a different compound. The problem asks about ' + p.startUnit.split(' ')[1] + ', so the formula on the card must match.');
        else if (r.state === 'wrong-orientation') setStatus('alert', 'Units do not cancel', g + ' is in the numerator, so you multiply: ' + g + ' × ' + g + ' = ' + g + '². Flip the card so ' + g + ' sits in the denominator.');
        else setStatus('alert', 'Nothing cancels', 'The starting unit (' + p.startUnit + ') is on neither line of this card. Choose a card with the starting unit in the denominator.');
      }
      report();
    }

    function report() {
      const p = PROBLEMS[idx];
      sim.setReadout('result', state === 'correct' ? result.textContent : '?');
      sim.setLabel('Path from ' + p.startVal + ' ' + p.startUnit + ' to ' + p.correctUnit + '. ' + (state === 'correct' ? 'The units cancel.' : state === 'initial' ? 'No conversion factor chosen yet.' : 'The chosen factor does not work.'));
      sim.redraw();
    }

    /* ---- the picture: the starting amount, an arrow with the factor, the target amount ---- */
    const line = (ctx, x1, y1, x2, y2) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
    const disc = (ctx, x, y, r, fill, stroke) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.lineWidth = 0.8; ctx.strokeStyle = stroke; ctx.stroke(); } };

    function molecule(ctx, c, sub, x, y) {
      ctx.strokeStyle = c.ink;
      if (sub === 'H2O') {
        line(ctx, x, y, x - 4.5, y + 4.5); line(ctx, x, y, x + 4.5, y + 4.5);
        disc(ctx, x, y, 4.5, c.accent, c.ink); disc(ctx, x - 4.5, y + 4.5, 2.6, c.paper3, c.ink); disc(ctx, x + 4.5, y + 4.5, 2.6, c.paper3, c.ink);
      } else if (sub === 'CO2') {
        line(ctx, x - 7, y, x + 7, y);
        disc(ctx, x - 7, y, 3.4, c.accent, c.ink); disc(ctx, x + 7, y, 3.4, c.accent, c.ink); disc(ctx, x, y, 4, c.ink, c.ink);
      } else {                                          // CH4
        [[-4.5, 0], [4.5, 0], [0, -4.5], [0, 4.5]].forEach((o) => line(ctx, x, y, x + o[0], y + o[1]));
        disc(ctx, x, y, 4.4, c.ink, c.ink);
        [[-4.5, 0], [4.5, 0], [0, -4.5], [0, 4.5]].forEach((o) => disc(ctx, x + o[0], y + o[1], 2.4, c.paper3, c.ink));
      }
    }
    function substance(ctx, c, sub, kind, cx, cy) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1.35, 1.35);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.4;
      if (kind === 'g') {
        if (sub === 'H2O') {
          ctx.beginPath(); ctx.moveTo(-15, 0); ctx.quadraticCurveTo(-7, -2, 7, 0); ctx.quadraticCurveTo(11, 1, 15, 0); ctx.lineTo(15, 14); ctx.lineTo(-15, 14); ctx.closePath();
          ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = c.water; ctx.fill(); ctx.restore();
          ctx.beginPath(); ctx.moveTo(-15, -12); ctx.lineTo(-15, 15); ctx.lineTo(15, 15); ctx.lineTo(15, -12); ctx.stroke();
        } else if (sub === 'NaCl') {
          ctx.beginPath(); ctx.moveTo(-20, 5); ctx.lineTo(-14, 18); ctx.lineTo(14, 18); ctx.lineTo(20, 5); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-12, 17); ctx.quadraticCurveTo(0, 2, 12, 17); ctx.closePath(); ctx.fillStyle = c.paper2; ctx.fill(); ctx.strokeStyle = c.inkMute; ctx.stroke();
        } else if (sub === 'CO2') {
          ctx.beginPath(); ctx.moveTo(-5, -15); ctx.lineTo(-5, -6); ctx.lineTo(-18, 18); ctx.lineTo(18, 18); ctx.lineTo(5, -6); ctx.lineTo(5, -15); ctx.closePath(); ctx.stroke();
          ctx.fillStyle = c.accentSoft; ctx.fillRect(-4, -18, 8, 4); ctx.strokeRect(-4, -18, 8, 4);
        } else if (sub === 'CH4') {
          ctx.lineWidth = 2; line(ctx, -8, 18, 8, 18); ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.rect(-3, 5, 6, 13); ctx.fillStyle = c.inkMute; ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(-6, -2, 0, 4); ctx.quadraticCurveTo(6, -2, 0, -14); ctx.fillStyle = c.water; ctx.fill(); ctx.stroke();
        } else {                                        // NaHCO3
          ctx.beginPath(); ctx.moveTo(-20, 8); ctx.quadraticCurveTo(0, 18, 20, 8); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-15, 12); ctx.quadraticCurveTo(0, 2, 15, 12); ctx.closePath(); ctx.fillStyle = c.paper2; ctx.fill(); ctx.strokeStyle = c.inkMute; ctx.stroke();
        }
      } else if (sub === 'NaCl') {
        for (let r = -1; r <= 1; r++) for (let q = -1; q <= 1; q++) {
          const cl = Math.abs(r + q) % 2 === 1;
          disc(ctx, q * 10, r * 10, cl ? 4.5 : 3, cl ? c.warn : c.inkMute, c.ink);
        }
      } else if (sub === 'NaHCO3') {
        [[-12, -8, 1], [12, -8, 0], [-10, 10, 0], [10, 10, 1], [0, 0, 1]].forEach((p) => {
          if (p[2]) disc(ctx, p[0], p[1], 3.5, c.inkMute, c.ink);
          else { [[-4, 2], [4, 2], [0, -4]].forEach((o) => disc(ctx, p[0] + o[0], p[1] + o[1], 2.5, c.accent)); disc(ctx, p[0], p[1], 2.8, c.ink); }
        });
      } else {
        const spots = sub === 'CO2' ? [[0, -12], [-11, 4], [11, 4], [0, 16]] : [[-10, -10], [10, -10], [-10, 11], [10, 11]];
        spots.forEach((p) => molecule(ctx, c, sub, p[0], p[1]));
      }
      ctx.restore();
    }

    function draw(ctx, env) {
      const c = env.colors;
      const p = PROBLEMS[idx];
      const k = Math.min(env.w / 360, env.h / 150);
      ctx.save();
      ctx.translate((env.w - 360 * k) / 2, (env.h - 150 * k) / 2);
      ctx.scale(k, k);
      const startKind = p.startUnit.split(' ')[0], targetKind = p.correctUnit.split(' ')[0];
      const mark = (x, color) => { ctx.setLineDash([3, 3]); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, 66, 46, 0, TAU); ctx.stroke(); ctx.setLineDash([]); };
      mark(70, c.hair); mark(290, c.hair);
      substance(ctx, c, p.target, startKind, 70, 66);
      ctx.fillStyle = c.inkSoft; ctx.font = env.font(12, 'mono', 600); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(p.startVal + ' ' + p.startUnit, 70, 134);
      // the target side
      const good = state === 'correct';
      if (good) {
        substance(ctx, c, p.target, targetKind, 290, 66);
        ctx.fillText(p.correctVal.toFixed(2) + ' ' + p.correctUnit, 290, 134);
      } else {
        ctx.fillStyle = state === 'initial' ? c.inkMute : c.accent;
        ctx.font = env.font(28, 'display', 700); ctx.textBaseline = 'middle';
        ctx.fillText(state === 'initial' ? '?' : '×', 290, 66);
        ctx.fillStyle = c.inkSoft; ctx.font = env.font(12, 'mono', 600); ctx.textBaseline = 'alphabetic';
        ctx.fillText(state === 'initial' ? '? ' + p.correctUnit : 'No result', 290, 134);
      }
      // the arrow and the factor
      const col = good ? c.good : state === 'initial' ? c.inkMute : c.accent;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = good || state !== 'initial' ? 2.2 : 1.5;
      ctx.setLineDash(state === 'initial' ? [4, 4] : []);
      line(ctx, 124, 66, 236, 66);
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(244, 66); ctx.lineTo(234, 61); ctx.lineTo(234, 71); ctx.closePath(); ctx.fill();
      ctx.font = env.font(12, 'display', 700); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      let label = 'Choose a factor';
      if (picked) label = state === 'wrong-substance' ? 'Wrong compound' : state === 'correct' ? '× (' + picked.num.split(' ').slice(0, 2).join(' ') + ' / ' + picked.den.split(' ').slice(0, 2).join(' ') + ')' : 'Units multiply';
      ctx.fillText(label, 180, 46);
      if (state === 'wrong-orientation') {
        const g = p.startUnit.split(' ')[0];
        ctx.font = env.font(12, 'mono', 600);
        ctx.fillText(g + ' × ' + g + ' = ' + g + '²', 180, 94);
      }
      if (picked) {
        disc(ctx, 180, 66, 9, col);
        ctx.fillStyle = c.paper; ctx.font = env.font(12, 'display', 700); ctx.textBaseline = 'middle';
        ctx.fillText(good ? '✓' : '✗', 180, 67);
      }
      ctx.restore();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: false,
      tokens: ['paper-3', 'water'],
      init() { loadProblem(0); },
      draw: draw
    });
    prev.addEventListener('click', () => { if (idx > 0) loadProblem(idx - 1); });
    next.addEventListener('click', () => { if (idx < PROBLEMS.length - 1) loadProblem(idx + 1); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();

/* ---------- 2. EMPIRICAL AND MOLECULAR FORMULA CALCULATOR ---------- */
(function () {
  'use strict';

  const SUB = '₀₁₂₃₄₅₆₇₈₉';
  const subscript = (n) => String(n).split('').map((d) => SUB[d] || d).join('');
  const format = (els, subs) => els.map((e, i) => e.sym + (subs[i] === 1 ? '' : subscript(subs[i]))).join('');

  // the smallest whole-number multiplier (1 to 6) that makes every ratio close to a whole number
  function wholeMultiplier(ratios) {
    for (let k = 1; k <= 6; k++) if (ratios.every((r) => Math.abs(r * k - Math.round(r * k)) < 0.08)) return k;
    return 1;
  }

  const DATA = {
    glucose: {
      name: 'Glucose', molarMass: 180.16, distractors: ['CH₃O', 'C₆H₁₂O₆'],
      elements: [{ sym: 'C', massG: 40.0, atomicMass: 12.011 }, { sym: 'H', massG: 6.7, atomicMass: 1.008 }, { sym: 'O', massG: 53.3, atomicMass: 15.999 }]
    },
    caffeine: {
      name: 'Caffeine', molarMass: 194.19, distractors: ['C₂H₂NO', 'C₈H₁₀N₄O₂'],
      elements: [{ sym: 'C', massG: 49.48, atomicMass: 12.011 }, { sym: 'H', massG: 5.19, atomicMass: 1.008 }, { sym: 'N', massG: 28.85, atomicMass: 14.007 }, { sym: 'O', massG: 16.48, atomicMass: 15.999 }]
    },
    vitaminC: {
      name: 'Vitamin C', molarMass: 176.12, distractors: ['CHO', 'C₆H₈O₆'],
      elements: [{ sym: 'C', massG: 40.92, atomicMass: 12.011 }, { sym: 'H', massG: 4.58, atomicMass: 1.008 }, { sym: 'O', massG: 54.50, atomicMass: 15.999 }]
    }
  };

  // everything comes from the masses, the atomic masses and the molar mass: no formula is typed in
  function solve(item) {
    const moles = item.elements.map((e) => e.massG / e.atomicMass);
    const least = Math.min.apply(null, moles);
    const rawRatios = moles.map((m) => m / least);
    const k = wholeMultiplier(rawRatios);
    const scaled = rawRatios.map((r) => r * k);
    const subs = scaled.map((r) => Math.round(r));
    const empMass = item.elements.reduce((s, e, i) => s + e.atomicMass * subs[i], 0);
    const n = Math.round(item.molarMass / empMass);
    return { moles: moles, rawRatios: rawRatios, k: k, scaled: scaled, subs: subs, empirical: format(item.elements, subs), empMass: empMass, n: n, molecular: format(item.elements, subs.map((s) => s * n)) };
  }
  // where the right guess sits in each list: glucose second, caffeine first, vitamin C last
  const GUESS_ORDER = { glucose: [1, 0, 2], caffeine: [0, 2, 1], vitaminC: [2, 1, 0] };
  if (window.GC_MODELS) window.GC_MODELS['1-7b-empirical'] = { DATA: DATA, solve: solve, GUESS_ORDER: GUESS_ORDER, wholeMultiplier: wholeMultiplier };

  function init() {
    const $ = (id) => document.getElementById(id);
    const preset = $('empPresetSelect'), guess = $('empGuessSelect'), check = $('empCheckBtn');
    const pill = $('empGuessPill'), wrap = $('empWorkWrapper'), head = $('empHeaderRow'), body = $('empTableBody');
    const tool = document.querySelector('[data-tool="empirical"]');
    if (!preset || !guess || !check || !head || !body || !tool) return;
    const setValue = (id, v) => { const el = tool.querySelector('[data-readout="' + id + '"] .readout-value'); if (el) el.textContent = v; };
    const live = tool.querySelector('.sim-readouts');

    function fill() {
      const item = DATA[preset.value];
      const sol = solve(item);
      const options = [sol.empirical].concat(item.distractors);
      guess.textContent = '';
      const first = document.createElement('option');
      first.value = ''; first.textContent = 'Choose an empirical formula';
      guess.appendChild(first);
      GUESS_ORDER[preset.value].forEach((i) => {
        const o = document.createElement('option');
        o.value = options[i]; o.textContent = options[i]; o.dataset.correct = String(i === 0);
        guess.appendChild(o);
      });
      guess.disabled = false;
      check.disabled = true;
      pill.hidden = true;
      wrap.hidden = true;
      ['emp', 'n', 'mol'].forEach((id) => setValue(id, '–'));
    }

    function addRow(label, values, bold) {
      const tr = document.createElement('tr');
      const th = document.createElement('th'); th.scope = 'row'; th.textContent = label; tr.appendChild(th);
      values.forEach((v) => {
        const td = document.createElement('td'); td.className = 'num';
        if (bold) { const b = document.createElement('b'); b.textContent = v; td.appendChild(b); } else td.textContent = v;
        tr.appendChild(td);
      });
      body.appendChild(tr);
    }

    function show() {
      const item = DATA[preset.value];
      const sol = solve(item);
      head.textContent = '';
      const h0 = document.createElement('th'); h0.scope = 'col'; h0.textContent = 'Step'; head.appendChild(h0);
      item.elements.forEach((e) => { const th = document.createElement('th'); th.scope = 'col'; th.className = 'num'; th.textContent = e.sym; head.appendChild(th); });
      body.textContent = '';
      addRow('1. Mass in a 100 g sample (g)', item.elements.map((e) => e.massG.toFixed(2)));
      addRow('2. Atomic mass (g/mol)', item.elements.map((e) => e.atomicMass.toFixed(3)));
      addRow('3. Moles = mass ÷ atomic mass', sol.moles.map((m) => m.toFixed(3)));
      addRow('4. Divide by the smallest', sol.rawRatios.map((r) => r.toFixed(3)));
      addRow(sol.k === 1 ? '5. Multiply to whole numbers (×1, already whole)' : '5. Multiply to whole numbers (×' + sol.k + ')', sol.scaled.map((r) => r.toFixed(2)));
      addRow('6. Empirical subscript', sol.subs.map(String), true);
      setValue('emp', sol.empirical + ' (' + sol.empMass.toFixed(2) + ' g/mol)');
      setValue('n', item.molarMass.toFixed(2) + ' ÷ ' + sol.empMass.toFixed(2) + ' = ' + sol.n);
      setValue('mol', sol.molecular);
      if (live) live.setAttribute('aria-live', 'polite');
    }

    guess.addEventListener('change', () => { check.disabled = !guess.value; });
    preset.addEventListener('change', fill);
    check.addEventListener('click', () => {
      const chosen = guess.options[guess.selectedIndex];
      if (!chosen || !chosen.value) return;
      const right = chosen.dataset.correct === 'true';
      pill.hidden = false;
      pill.dataset.state = right ? 'ok' : 'warn';
      pill.textContent = right ? 'Your guess matches. Here is the work.' : 'Your guess is different. Here is the work, so you can see where it splits.';
      guess.disabled = true;
      check.disabled = true;
      wrap.hidden = false;
      show();
    });
    fill();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
