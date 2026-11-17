/* ============================================================
   1-1b LESSON INTERACTIVES
   Three interactives unique to this lesson:
     1. Bohr model, across a period and down a group, built on TB.sim.create
        (RUNTIME_SPEC 4.3). The outer ring is drawn to the atomic radius, so the
        picture and the readout change in the same proportion.
     2. Periodic-trend explorer (a DOM tool in a .sim-box)
     3. Five-step reactivity chain (a DOM tool; its own predict-then-reveal)
   Element data comes from ../assets/elements.js (window.GC_ELEMENTS); the atom
   is drawn by ../assets/bohr.js (window.GC_BOHR).
   Zero em-dashes.
   ============================================================ */

/* ---------- BOHR MODEL: ACROSS A PERIOD, DOWN A GROUP ---------- */
(function () {
  'use strict';

  const EL = window.GC_ELEMENTS;
  const BOHR = window.GC_BOHR;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));

  const LISTS = {
    period: ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'],
    group: ['Li', 'Na', 'K']
  };
  const PM_TO_UNITS = { period: 0.9, group: 0.58 };   // design units per pm of atomic radius
  const NUCLEUS = 14;                                 // design units
  const ROTATE = 0.55;                                // rad/s for the innermost shell
  const state = { mode: 'period', idx: 0, rot: 0 };
  if (window.GC_MODELS) window.GC_MODELS['1-1b'] = { state: state, ringRadii: ringRadii };

  const atom = () => EL.bySym[LISTS[state.mode][state.idx]];

  // Ring radii in design units. The outer ring follows the atomic radius from the data.
  function ringRadii(mode, e) {
    const outer = Math.max(34, e.radius * PM_TO_UNITS[mode]);
    const n = e.shells.length;
    if (mode === 'period') return [24, outer];
    return e.shells.map((_, i) => (outer * (i + 1)) / n);
  }

  function explain(e) {
    if (state.mode === 'period') {
      return 'Still just two shells. Every new electron joins the same outer shell, but the nucleus keeps gaining protons (' + e.z + ' now). More pull at the same distance shrinks the atom from left to right.';
    }
    return e.name + ' has ' + e.shells.length + ' shell' + (e.shells.length > 1 ? 's' : '') + '. Each step down adds a whole new shell. The outer electron sits farther out and the inner shells shield it, so the nucleus holds it less tightly. The atom grows, and that electron gets easier to lose.';
  }

  function init() {
    const box = $('[data-sim="atom"]');
    if (!box || !EL || !BOHR || !window.TB) return;
    const slider = $('#atomIdx', box);
    const slOut = $('output', slider.closest('label'));
    const note = $('[data-sim-note]', box);
    const chips = $$('[data-mode]', box);
    let sim = null;

    function report() {
      const e = atom();
      sim.setReadout('el', e.name);
      sim.setReadout('z', e.z);
      sim.setReadout('shells', e.shells.length);
      sim.setReadout('radius', e.radius + ' pm');
      slOut.textContent = e.name + ' (' + e.sym + ')';
      const first = state.idx === 0;
      if (sim.committed) {
        sim.setStatus('neutral', state.mode === 'period' ? (first ? 'Start of the period' : 'The grip tightens') : (first ? 'Top of the group' : 'The grip loosens'));
        note.textContent = explain(e);
      } else {
        sim.setStatus('neutral', 'Predict to start');
      }
      sim.setLabel('Bohr model of ' + e.name + ': ' + e.z + ' protons in the nucleus and ' + e.shells.join(', ') + ' electrons in the shells. The outer ring is drawn to the atomic radius, ' + e.radius + ' picometers.');
    }

    function setMode(mode) {
      state.mode = mode;
      state.idx = 0;
      slider.max = String(LISTS[mode].length - 1);
      slider.value = '0';
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.mode === mode)));
      report();
      sim.redraw();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 2,
      init() { report(); },
      onUnlock() { report(); },
      update(dt) { state.rot += dt * ROTATE; },
      draw(ctx, env) {
        const e = atom();
        const k = Math.min(env.w, env.h) / 340;
        BOHR.draw(ctx, env, {
          cx: env.w / 2, cy: env.h / 2, scale: k,
          shells: e.shells, z: e.z, rot: state.rot,
          radii: ringRadii(state.mode, e).map((r) => r * k),
          nucleusR: NUCLEUS * k,
          valenceShell: e.shells.length - 1
        });
      },
      record() {
        const e = atom();
        return { 'Element': e.name, 'Protons': e.z, 'Shells': e.shells.length, 'Radius (pm)': e.radius };
      }
    });

    chips.forEach((c) => c.addEventListener('click', () => setMode(c.dataset.mode)));
    slider.addEventListener('input', () => { state.idx = Number(slider.value); report(); sim.redraw(); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();

/* ---------- PERIODIC-TREND EXPLORER ---------- */
(function () {
  'use strict';

  const EL = window.GC_ELEMENTS;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));

  // relative reactivity, 0 (inert) to 1 (most reactive): the course's own numbers
  const REACT = { Li: .55, Na: .78, K: .96, Be: .18, Mg: .40, Ca: .62, Al: .30, Ga: .28, F: 1, Cl: .82, Br: .68, O: .86, S: .58, Se: .48, N: .55, P: .42, As: .30, C: .25, Si: .20, Ge: .18, B: .15, H: .45, He: .02, Ne: .02, Ar: .03, Kr: .05 };
  const META = {
    radius: { name: 'Atomic radius', unit: 'pm', across: 'decreases', down: 'increases', text: 'Atoms shrink from left to right, because more protons pull the same shell inward. They grow from top to bottom, because each row adds a shell.' },
    ie: { name: 'Ionization energy', unit: 'kJ/mol', across: 'increases', down: 'decreases', text: 'This is the energy to remove an outer electron. Tightly held electrons (small atoms, top right) are hardest to pull off. The small zigzags are real: they come from subshell stability.' },
    en: { name: 'Electronegativity', unit: 'Pauling', across: 'increases', down: 'decreases', text: 'This is how strongly an atom pulls on shared electrons. It peaks at fluorine, top right. Noble gases are left blank because they barely bond.' },
    react: { name: 'Reactivity', unit: 'relative', across: 'splits (metals and nonmetals)', down: 'splits (metals and nonmetals)', text: 'Reactivity is not one gradient. Metals get more reactive toward the bottom left, because they lose electrons more easily. Nonmetals get more reactive toward the top right, because they grab electrons harder. Noble gases are inert.' }
  };
  const TRACK = { 1: 1, 2: 2, 13: 4, 14: 5, 15: 6, 16: 7, 17: 8, 18: 9 };   // column in the grid; track 3 is the gap
  const LEVELS = 8;

  function init() {
    const box = $('[data-tool="trends"]');
    const tableEl = $('#ptable');
    if (!box || !tableEl || !EL || !window.GC_GATE_TOOL) return;
    const legendEl = $('#legend');
    const controls = $('.sim-controls', box);
    const chips = $$('[data-trend]', box);
    const roName = $('#roName'), roText = $('#roText'), roAcross = $('#roAcross'), roDown = $('#roDown'), cmpOut = $('#cmpOut');
    const data = EL.list.filter((e) => e.mainGroup);
    const bySym = {}; data.forEach((e) => { bySym[e.sym] = e; });
    const cells = {};
    let current = 'radius', selected = [], live = false;

    const fieldOf = (e) => (current === 'radius' ? e.radius : current === 'ie' ? e.ie : e.en);
    const fmt = (v) => (current === 'en' ? v.toFixed(2) : String(v));
    const hueOf = (e) => (e.kind === 'noble' ? 'noble' : e.kind === 'metal' ? 'metal' : 'nonmetal');

    // build the grid once: periods 1 to 4, main-group columns only
    const at = {};
    data.forEach((e) => { at[e.period + '-' + TRACK[e.group]] = e; });
    for (let p = 1; p <= 4; p++) {
      for (let t = 1; t <= 9; t++) {
        const e = at[p + '-' + t];
        if (t === 3) { const gap = document.createElement('div'); gap.className = 'pcell spacer'; tableEl.appendChild(gap); continue; }
        if (!e) { const empty = document.createElement('div'); empty.className = 'pcell spacer'; tableEl.appendChild(empty); continue; }
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'pcell has-data';
        cell.dataset.sym = e.sym;
        cell.setAttribute('aria-pressed', 'false');
        cell.innerHTML = '<span class="z">' + e.z + '</span><span class="sym">' + e.sym + '</span><span class="val"></span>';
        cell.addEventListener('click', () => pick(e.sym));
        cells[e.sym] = cell;
        tableEl.appendChild(cell);
      }
    }

    function paint() {
      const m = META[current];
      roName.textContent = m.name; roText.textContent = m.text; roAcross.textContent = m.across; roDown.textContent = m.down;
      const vals = data.map(fieldOf).filter((v) => v != null);
      const mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
      if (current === 'react') {
        legendEl.innerHTML = '<span class="swatch"><span class="sw sw-metal"></span>metal: loses electrons</span><span class="swatch"><span class="sw sw-nonmetal"></span>nonmetal: gains electrons</span><span class="swatch"><span class="sw sw-noble"></span>noble gas: inert</span>';
      } else {
        legendEl.innerHTML = '<span>low</span><span class="bar" aria-hidden="true"></span><span>high</span><span>' + mn + ' to ' + mx + ' ' + m.unit + '</span>';
      }
      data.forEach((e) => {
        const cell = cells[e.sym];
        const val = $('.val', cell);
        cell.classList.remove('dim');
        if (current === 'react') {
          const r = REACT[e.sym];
          cell.dataset.hue = hueOf(e);
          if (e.kind === 'noble') { delete cell.dataset.level; cell.classList.add('dim'); val.textContent = 'inert'; }
          else { cell.dataset.level = String(Math.min(4, Math.floor(r * 5))); val.textContent = ''; }
          cell.setAttribute('aria-label', e.name + ', element ' + e.z + (e.kind === 'noble' ? ', inert' : ', ' + hueOf(e) + ', relative reactivity ' + r));
        } else {
          const v = fieldOf(e);
          cell.dataset.hue = v == null ? 'none' : 'seq';
          if (v == null) { delete cell.dataset.level; cell.classList.add('dim'); val.textContent = 'n/a'; }
          else { cell.dataset.level = String(Math.round(((v - mn) / (mx - mn)) * LEVELS)); val.textContent = fmt(v); }
          cell.setAttribute('aria-label', e.name + ', element ' + e.z + ', ' + m.name.toLowerCase() + (v == null ? ' not given' : ' ' + fmt(v) + ' ' + m.unit));
        }
      });
      refresh();
    }

    function refresh() {
      Object.keys(cells).forEach((sym) => {
        const on = selected.indexOf(sym) >= 0;
        cells[sym].classList.toggle('selected', on);
        cells[sym].setAttribute('aria-pressed', String(on));
      });
    }

    function pick(sym) {
      if (!live) return;
      const i = selected.indexOf(sym);
      if (i >= 0) selected.splice(i, 1);
      else { selected.push(sym); if (selected.length > 2) selected.shift(); }
      refresh();
      compare();
    }

    function compare() {
      if (selected.length < 2) { cmpOut.textContent = selected.length === 1 ? 'Select one more element.' : 'Select two elements to compare them.'; return; }
      const a = bySym[selected[0]], b = bySym[selected[1]];
      if (current === 'react') {
        const hi = REACT[a.sym] >= REACT[b.sym] ? a : b;
        const note = hueOf(a) === hueOf(b) ? '' : ' They react in different ways: one loses electrons and the other gains them.';
        cmpOut.textContent = hi.sym + ' is the more reactive of the two.' + note;
        return;
      }
      const va = fieldOf(a), vb = fieldOf(b), m = META[current];
      if (va == null || vb == null) { cmpOut.textContent = 'One of these is a noble gas with no ' + m.name.toLowerCase() + ' value.'; return; }
      const hi = va >= vb ? a : b;
      cmpOut.textContent = hi.sym + ' has the higher ' + m.name.toLowerCase() + ': ' + a.sym + ' ' + fmt(va) + ' ' + m.unit + ' and ' + b.sym + ' ' + fmt(vb) + ' ' + m.unit + '.';
    }

    chips.forEach((chip) => chip.addEventListener('click', () => {
      current = chip.dataset.trend;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      paint();
      compare();
    }));

    window.GC_GATE_TOOL(box, [controls, $('.ptable-scroll', box)], () => { live = true; paint(); compare(); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();

/* ---------- 5-STEP REACTIVITY CHAIN ---------- */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  // Each chain gives the relative picture first, then the supporting number in brackets.
  const DATA = {
    metals: [
      { sym: 'Li', name: 'Lithium', z: 3, shells: '2 (2, 1)', radius: '167 pm', ie: '520 kJ/mol',
        steps: ['Nuclear charge: 3 protons in the nucleus.', 'Shielding: 1 inner shell (2 electrons) shields the outer valence electron.', 'Radius: the smallest of the alkali metals (167 pm).',
          'Ionization energy: the tightest valence grip in Group 1 (520 kJ/mol).', 'Reactivity: moderate. Lithium fizzes and bubbles gently in water without exploding.'],
        severityLabel: 'Moderate', severity: 'Moderate: fizzes in water' },
      { sym: 'Na', name: 'Sodium', z: 11, shells: '3 (2, 8, 1)', radius: '190 pm', ie: '496 kJ/mol',
        steps: ['Nuclear charge: 11 protons in the nucleus.', 'Shielding: 2 inner shells (10 electrons) shield the outer valence electron.', 'Radius: larger, so the outer shell is farther away (190 pm).',
          'Ionization energy: a looser valence grip than lithium (496 kJ/mol).', 'Reactivity: high. Sodium skitters across water, melts into a sphere, and ignites a yellow flame.'],
        severityLabel: 'High', severity: 'High: ignites a yellow flame in water' },
      { sym: 'K', name: 'Potassium', z: 19, shells: '4 (2, 8, 8, 1)', radius: '243 pm', ie: '419 kJ/mol',
        steps: ['Nuclear charge: 19 protons in the nucleus.', 'Shielding: 3 inner shells (18 electrons) shield the outer valence electron.', 'Radius: the outer shell is far out (243 pm).',
          'Ionization energy: the lowest of the three, so the electron is handed off easily (419 kJ/mol).', 'Reactivity: violent. Potassium instantly ignites a bright lilac flame and pops on water contact.'],
        severityLabel: 'Violent', severity: 'Violent: lilac flame and explosion in water' }
    ],
    nonmetals: [
      { sym: 'F', name: 'Fluorine', z: 9, shells: '2 (2, 7)', radius: '42 pm', en: '3.98',
        steps: ['Nuclear charge: 9 protons in period 2.', 'Shielding: minimal. One inner shell of 2 electrons.', 'Radius: a very compact atom (42 pm).',
          'Electronegativity: the highest pull in the whole periodic table (3.98).', 'Reactivity: the most reactive nonmetal. It reacts with almost every element, including materials we normally treat as inert.'],
        severityLabel: 'Extreme', severity: 'Extreme oxidizer: reacts with nearly every element' },
      { sym: 'Cl', name: 'Chlorine', z: 17, shells: '3 (2, 8, 7)', radius: '79 pm', en: '3.16',
        steps: ['Nuclear charge: 17 protons in period 3.', 'Shielding: 2 inner shells shield the nucleus.', 'Radius: larger than fluorine (79 pm).',
          'Electronegativity: a strong pull, but weaker than fluorine (3.16).', 'Reactivity: high. Chlorine is a toxic, corrosive gas that vigorously oxidizes metals.'],
        severityLabel: 'High', severity: 'High: corrosive, toxic gas' },
      { sym: 'Br', name: 'Bromine', z: 35, shells: '4 (2, 8, 18, 7)', radius: '94 pm', en: '2.96',
        steps: ['Nuclear charge: 35 protons in period 4.', 'Shielding: 3 inner shells shield the valence shell.', 'Radius: the valence shell is farther out (94 pm).',
          'Electronegativity: a moderate to strong pull (2.96).', 'Reactivity: moderate. Bromine is a dense red liquid that fumes and oxidizes.'],
        severityLabel: 'Moderate', severity: 'Moderate: fuming liquid halogen' }
    ]
  };

  function init() {
    const catSelect = $('#causalCategory'), elSelect = $('#causalElement'), chainDisplay = $('#causalChainDisplay');
    const severityGuess = $('#causalSeverityGuess'), checkBtn = $('#causalCheckBtn'), guessFeedback = $('#causalGuessFeedback');
    const step5Wrapper = $('#causalStep5Wrapper'), step5Box = $('#causalStep5');
    const summaryTitle = $('#causalSummaryTitle'), summaryText = $('#causalSummaryText');
    if (!catSelect || !elSelect || !chainDisplay || !severityGuess || !checkBtn) return;

    const current = () => DATA[catSelect.value][parseInt(elSelect.value, 10) || 0];

    function stepItem(text, n) {
      const li = document.createElement('li');
      li.className = 'chain-step';
      const badge = document.createElement('span');
      badge.className = 'chain-badge';
      badge.textContent = 'Step ' + n;
      const body = document.createElement('span');
      body.textContent = text;
      li.appendChild(badge);
      li.appendChild(body);
      return li;
    }

    function renderSteps() {
      const item = current();
      chainDisplay.textContent = '';
      item.steps.slice(0, 4).forEach((t, i) => chainDisplay.appendChild(stepItem(t, i + 1)));
    }

    function resetGate() {
      const labels = DATA[catSelect.value].map((i) => i.severityLabel).filter((l, i, a) => a.indexOf(l) === i);
      severityGuess.textContent = '';
      const first = document.createElement('option');
      first.value = ''; first.textContent = 'Choose a strength';
      severityGuess.appendChild(first);
      labels.forEach((l) => { const o = document.createElement('option'); o.value = l; o.textContent = l; severityGuess.appendChild(o); });
      guessFeedback.textContent = '';
      checkBtn.disabled = true;
      severityGuess.disabled = false;
      step5Wrapper.hidden = true;
      renderSteps();
    }

    function fillElements() {
      elSelect.textContent = '';
      DATA[catSelect.value].forEach((item, i) => {
        const o = document.createElement('option');
        o.value = String(i);
        o.textContent = item.name + ' (' + item.sym + '), Z = ' + item.z;
        elSelect.appendChild(o);
      });
      resetGate();
    }

    severityGuess.addEventListener('change', () => { checkBtn.disabled = !severityGuess.value; });
    checkBtn.addEventListener('click', () => {
      const item = current();
      const right = severityGuess.value === item.severityLabel;
      guessFeedback.textContent = right ? 'That matches. Here is step 5.' : 'You chose ' + severityGuess.value + '. Here is what actually happens.';
      severityGuess.disabled = true;
      checkBtn.disabled = true;
      step5Box.textContent = '';
      step5Box.appendChild(stepItem(item.steps[4], 5));
      summaryTitle.textContent = item.name + ' (' + item.sym + '): ' + item.severity;
      summaryText.textContent = 'In short: ' + item.name + ' has ' + item.shells + ' shells and a radius of ' + item.radius + '. Its nuclear pull gives ' + (item.ie ? 'an ionization energy of ' + item.ie : 'an electronegativity of ' + item.en) + '. That leads to this result: ' + item.severity.toLowerCase() + '.';
      step5Wrapper.hidden = false;
    });
    catSelect.addEventListener('change', fillElements);
    elSelect.addEventListener('change', resetGate);
    fillElements();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
