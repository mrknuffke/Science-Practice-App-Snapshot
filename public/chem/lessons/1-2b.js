/* ============================================================
   1-2b LESSON INTERACTIVES
   "Cancel or reinforce?": a five-molecule two-step tool (judge the bond,
   judge the shape) in a .sim-box. The building is the attempt, so it has
   no prediction lock (docs/plans/textbook-sim-briefs.md, "Chem building
   tools"). The verdict opens only after both steps are committed.
   Zero em-dashes.
   ============================================================ */
(function () {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  const svg = document.getElementById('molSvg');
  const tabsEl = document.getElementById('molTabs');
  if (!svg || !tabsEl || !window.GC_ELEMENTS) return;

  const EL = window.GC_ELEMENTS;
  const en = sym => EL.bySym[sym].en;
  const round2 = n => Math.round(n * 100) / 100;
  const classify = diff => (diff < 0.5 ? 'nonpolar' : 'polar');

  const stepLabelEl = document.getElementById('stepLabel');
  const stepPromptEl = document.getElementById('stepPrompt');
  const stepGivenEl = document.getElementById('stepGiven');
  const stepOptionsEl = document.getElementById('stepOptions');
  const stepFeedbackEl = document.getElementById('stepFeedback');
  const contBtn = document.getElementById('molContinue');
  const resetBtn = document.getElementById('molReset');
  const deltaReadout = document.getElementById('molDelta');
  const bondCallReadout = document.getElementById('molBondCall');
  const verdictBox = document.getElementById('verdictBox');
  const verdictTitle = document.getElementById('verdictTitle');
  const verdictText = document.getElementById('verdictText');

  const MOLECULES = [
    {
      id: 'O2', label: 'O&#8322;', kind: 'diatomic', atoms: ['O', 'O'],
      shapeGiven: 'O&#8322; has one bond. Whatever dipole that bond has IS the molecule’s dipole: there’s nothing else to cancel or reinforce against.',
      verdict: 'nonpolar', imf: 'LDF only',
      payoff: 'Same element on both ends, so &Delta;EN is exactly zero. There’s no tug-of-war to have in the first place.',
      feedback: {
        nonpolar: { correct: true, text: 'Identical atoms pull identically. &Delta;EN = 0.00, the smallest possible value.' },
        polar: { correct: false, text: 'Oxygen is genuinely electronegative, which makes this tempting. But &Delta;EN measures a <em>difference</em>, and oxygen paired with oxygen is a tie: &Delta;EN = 0.00.' }
      }
    },
    {
      id: 'HCl', label: 'HCl', kind: 'diatomic', atoms: ['H', 'Cl'],
      shapeGiven: 'HCl has one bond. Whatever dipole that bond has IS the molecule’s dipole: there’s nothing else to cancel or reinforce against.',
      verdict: 'polar', imf: 'dipole-dipole (not hydrogen bonding: chlorine isn’t nitrogen, oxygen, or fluorine)',
      payoff: 'One bond, one dipole, nothing to cancel it. HCl is polar, but the H isn’t bonded to N, O, or F, so it stops at dipole-dipole.',
      feedback: {
        polar: { correct: true, text: 'Chlorine pulls harder. &Delta;EN = 0.96, solidly past the 0.5 line.' },
        nonpolar: { correct: false, text: 'Chlorine and hydrogen aren’t close in pulling power (&Delta;EN = 0.96), well past the 0.5 cutoff for a real bond dipole.' }
      }
    },
    {
      id: 'CO2', label: 'CO&#8322;', kind: 'polyatomic', atoms: ['C', 'O'],
      shapeQuestion: 'Linear: O=C=O, with both oxygens directly across from carbon. Do the two C=O pulls cancel or reinforce?',
      shapeAnswer: 'cancel',
      shapeFeedback: {
        cancel: { correct: true, text: 'Linear shape, opposite pulls, exact cancellation. Polar bonds, nonpolar molecule.' },
        reinforce: { correct: false, text: 'This is the trap: “the bonds are polar, so the molecule must be polar.” But CO&#8322; is a straight line: the two oxygens sit on exactly opposite sides of carbon, so their pulls point in exactly opposite directions.' }
      },
      verdict: 'nonpolar', imf: 'LDF only',
      payoff: 'Polar bonds, canceled by a straight shape. CO&#8322; gets London dispersion forces only, which is why it’s already a gas at &minus;78&deg;C.',
      feedback: {
        polar: { correct: true, text: 'Oxygen pulls harder here. &Delta;EN = 0.89. Each C=O bond has a real dipole; the question is what the molecule’s shape does with it.' },
        nonpolar: { correct: false, text: 'Carbon and oxygen aren’t close in electronegativity (&Delta;EN = 0.89), past the 0.5 line. Each C=O bond really is polar.' }
      }
    },
    {
      id: 'H2O', label: 'H&#8322;O', kind: 'polyatomic', atoms: ['O', 'H'],
      shapeQuestion: 'Bent, about 104&deg; between the two O–H bonds (not a straight line). Do the two O–H pulls cancel or reinforce?',
      shapeAnswer: 'reinforce',
      shapeFeedback: {
        reinforce: { correct: true, text: 'Bent, not linear. Both pulls point generally toward oxygen, so instead of canceling they gang up into a net pull.' },
        cancel: { correct: false, text: 'Water also has two identical bonds, like CO&#8322;, which makes this tempting. But water isn’t a straight line. Both O–H pulls point generally toward the same atom, and a bent shape doesn’t give them a way to cancel.' }
      },
      verdict: 'polar', imf: 'dipole-dipole + hydrogen bonding',
      payoff: 'Polar bonds that don’t cancel, plus H bonded directly to O: water gets the whole set. That’s a big part of why it’s a liquid up to 100&deg;C.',
      feedback: {
        polar: { correct: true, text: 'Oxygen wins decisively. &Delta;EN = 1.24, the most polar bond among these five.' },
        nonpolar: { correct: false, text: 'Oxygen and hydrogen are not evenly matched (&Delta;EN = 1.24), solidly polar. Every O–H bond pulls hard toward oxygen.' }
      }
    },
    {
      id: 'CH4', label: 'CH&#8324;', kind: 'polyatomic', atoms: ['C', 'H'],
      shapeQuestion: 'Four H arranged symmetrically around carbon. Do the four C–H pulls cancel or reinforce?',
      shapeAnswer: 'cancel',
      shapeFeedback: {
        cancel: { correct: true, text: 'Perfect symmetry is the cancellation machine. Every pull has an equal, opposite partner somewhere in the arrangement.' },
        reinforce: { correct: false, text: 'Four bonds arranged with perfect symmetry around one center is exactly the setup where pulls cancel: every pull has an equal, opposite partner. (And these particular pulls barely exist to begin with.)' }
      },
      verdict: 'nonpolar', imf: 'LDF only',
      payoff: 'Barely-there bond pulls, and a symmetric shape cancels even those. LDF only: methane boils at &minus;162&deg;C, the coldest of this set.',
      feedback: {
        nonpolar: { correct: true, text: '&Delta;EN = 0.35, under the 0.5 line. There’s barely a tug-of-war here to begin with.' },
        polar: { correct: false, text: 'Carbon and hydrogen are close in electronegativity (&Delta;EN = 0.35), under the 0.5 line most chemists use for a real bond dipole.' }
      }
    }
  ];

  let current = null;
  let state = {};

  function resetState() {
    state = { bondDone: false, bondChoice: null, shapeDone: false, shapeChoice: null };
  }

  function renderTabs() {
    tabsEl.innerHTML = '';
    MOLECULES.forEach(m => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.type = 'button';
      b.setAttribute('aria-pressed', String(!!(current && current.id === m.id)));
      b.innerHTML = m.label;
      b.addEventListener('click', () => selectMolecule(m.id));
      tabsEl.appendChild(b);
    });
  }

  function selectMolecule(id) {
    current = MOLECULES.find(m => m.id === id);
    resetState();
    renderTabs();
    renderStep();
  }

  function optionButton(label) {
    const b = document.createElement('button');
    b.className = 'w-opt';
    b.type = 'button';
    b.innerHTML = label;
    return b;
  }

  function onBondChoice(choice, btn) {
    if (state.bondDone) return;
    const fb = current.feedback[choice];
    const diff = round2(Math.abs(en(current.atoms[0]) - en(current.atoms[1])));
    const correctCall = classify(diff);

    $$('.w-opt', stepOptionsEl).forEach(b => b.setAttribute('disabled', 'true'));
    btn.classList.add(fb.correct ? 'correct' : 'wrong');
    if (!fb.correct) {
      const okBtn = $$('.w-opt', stepOptionsEl).find(b => b.textContent.trim().toLowerCase() === correctCall);
      if (okBtn) okBtn.classList.add('correct');
    }
    stepFeedbackEl.innerHTML = fb.text;
    stepFeedbackEl.className = 'w-feedback ' + (fb.correct ? 'correct' : 'wrong');

    state.bondDone = true;
    state.bondChoice = choice;
    deltaReadout.textContent = diff.toFixed(2);
    bondCallReadout.textContent = correctCall;
    drawMolecule('bond');

    contBtn.hidden = false;
    contBtn.textContent = 'Continue →';
    contBtn.onclick = () => renderStep();
  }

  function onShapeChoice(choice, btn) {
    if (state.shapeDone) return;
    const fb = current.shapeFeedback[choice];

    $$('.w-opt', stepOptionsEl).forEach(b => b.setAttribute('disabled', 'true'));
    btn.classList.add(fb.correct ? 'correct' : 'wrong');
    if (!fb.correct) {
      const okBtn = $$('.w-opt', stepOptionsEl).find(b => b.textContent.trim().toLowerCase() === current.shapeAnswer);
      if (okBtn) okBtn.classList.add('correct');
    }
    stepFeedbackEl.innerHTML = fb.text;
    stepFeedbackEl.className = 'w-feedback ' + (fb.correct ? 'correct' : 'wrong');

    state.shapeDone = true;
    state.shapeChoice = choice;

    contBtn.hidden = false;
    contBtn.textContent = 'See the verdict';
    contBtn.onclick = () => renderStep();
  }

  function renderStep() {
    stepFeedbackEl.textContent = '';
    stepFeedbackEl.className = 'w-feedback';
    contBtn.hidden = true;
    verdictBox.hidden = true;
    stepOptionsEl.innerHTML = '';
    stepGivenEl.hidden = true;

    if (!current) {
      stepLabelEl.textContent = 'Pick a molecule above to begin';
      stepPromptEl.textContent = '';
      deltaReadout.textContent = '\u2013';
      bondCallReadout.textContent = '\u2013';
      drawMolecule(null);
      return;
    }

    const diff = round2(Math.abs(en(current.atoms[0]) - en(current.atoms[1])));
    const correctCall = classify(diff);

    if (!state.bondDone) {
      stepLabelEl.textContent = 'Step 1 · Judge the bond';
      stepPromptEl.innerHTML = current.atoms[0] + '–' + current.atoms[1] + ': is this bond polar or nonpolar?';
      deltaReadout.textContent = '\u2013';
      bondCallReadout.textContent = '\u2013';
      ['nonpolar', 'polar'].forEach(choice => {
        const btn = optionButton(choice.charAt(0).toUpperCase() + choice.slice(1));
        btn.addEventListener('click', () => onBondChoice(choice, btn));
        stepOptionsEl.appendChild(btn);
      });
      drawMolecule(null);
      return;
    }

    deltaReadout.textContent = diff.toFixed(2);
    bondCallReadout.textContent = correctCall;

    if (!state.shapeDone) {
      if (current.kind === 'diatomic') {
        stepLabelEl.textContent = 'Step 2 · Shape (given)';
        stepPromptEl.textContent = '';
        stepGivenEl.hidden = false;
        stepGivenEl.innerHTML = current.shapeGiven;
        contBtn.hidden = false;
        contBtn.textContent = 'See the verdict';
        contBtn.onclick = () => { state.shapeDone = true; renderStep(); };
      } else {
        stepLabelEl.textContent = 'Step 2 · Cancel or reinforce?';
        stepPromptEl.innerHTML = current.shapeQuestion;
        ['cancel', 'reinforce'].forEach(choice => {
          const btn = optionButton(choice.charAt(0).toUpperCase() + choice.slice(1));
          btn.addEventListener('click', () => onShapeChoice(choice, btn));
          stepOptionsEl.appendChild(btn);
        });
      }
      drawMolecule('bond');
      return;
    }

    showVerdict();
  }

  function showVerdict() {
    stepLabelEl.textContent = 'Both steps done';
    stepPromptEl.textContent = '';
    verdictBox.hidden = false;
    verdictTitle.textContent = (current.verdict === 'polar' ? 'Polar molecule' : 'Nonpolar molecule') + ' · ' + current.imf;
    verdictText.innerHTML = current.payoff;
    drawMolecule('verdict');
  }

  resetBtn.addEventListener('click', () => {
    if (!current) return;
    resetState();
    renderStep();
  });

  /* ---- SVG drawing: 2D Lewis Structure Standards ---- */
  function clearSvg() { while (svg.firstChild) svg.removeChild(svg.firstChild); }

  function svgEl(tag, attrs, text) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) {
      e.setAttribute(k, attrs[k]);
    }
    if (text != null) e.textContent = text;
    svg.appendChild(e);
    return e;
  }

  function lewisAtom(cx, cy, sym) {
    const color = sym === 'O' ? 'var(--accent)' : sym === 'Cl' ? 'var(--warn)' : sym === 'N' ? 'var(--cool)' : 'var(--ink)';
    const el = svgEl('text', {
      x: cx,
      y: cy,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-family': 'var(--mono)',
      'font-weight': 700,
      class: 'mol-atom',
      fill: color
    }, sym);
    return el;
  }

  function lonePair(cx, cy, color) {
    svgEl('circle', { cx: cx - 5, cy, r: 2.6, fill: color });
    svgEl('circle', { cx: cx + 5, cy, r: 2.6, fill: color });
  }

  function lonePairV(cx, cy, color) {
    svgEl('circle', { cx, cy: cy - 5, r: 2.6, fill: color });
    svgEl('circle', { cx, cy: cy + 5, r: 2.6, fill: color });
  }

  function bond(x1, y1, x2, y2, double) {
    if (double) {
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
      const ox = -dy / len * 4, oy = dx / len * 4;
      svgEl('line', { x1: x1 + ox, y1: y1 + oy, x2: x2 + ox, y2: y2 + oy, stroke: 'var(--ink)', 'stroke-width': 2.2, 'stroke-linecap': 'round' });
      svgEl('line', { x1: x1 - ox, y1: y1 - oy, x2: x2 - ox, y2: y2 - oy, stroke: 'var(--ink)', 'stroke-width': 2.2, 'stroke-linecap': 'round' });
    } else {
      svgEl('line', { x1, y1, x2, y2, stroke: 'var(--ink)', 'stroke-width': 2.4, 'stroke-linecap': 'round' });
    }
  }

  function delta(x, y, sign) {
    svgEl('text', {
      x,
      y,
      'text-anchor': 'middle',
      'font-family': 'var(--mono)',
      'font-weight': 700,
      class: 'mol-label',
      fill: sign === '+' ? 'var(--cool)' : 'var(--accent)'
    }, 'δ' + sign);
  }

  let arrowSeq = 0;
  function arrow(x1, y1, x2, y2, opts) {
    opts = opts || {};
    arrowSeq++;
    const id = 'mol-arr-' + arrowSeq;
    let defs = svg.querySelector('defs');
    if (!defs) defs = svgEl('defs', {});
    const marker = document.createElementNS(SVGNS, 'marker');
    marker.setAttribute('id', id);
    marker.setAttribute('markerWidth', 6);
    marker.setAttribute('markerHeight', 6);
    marker.setAttribute('refX', 5);
    marker.setAttribute('refY', 3);
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('viewBox', '0 0 6 6');
    const path = document.createElementNS(SVGNS, 'path');
    path.setAttribute('d', 'M0 0 L6 3 L0 6 z');
    path.setAttribute('fill', opts.color || 'var(--accent)');
    marker.appendChild(path);
    defs.appendChild(marker);
    svgEl('line', {
      x1, y1, x2, y2,
      stroke: opts.color || 'var(--accent)',
      'stroke-width': opts.width || 2,
      'stroke-dasharray': opts.solid ? '' : '4 3',
      'stroke-linecap': 'round',
      'marker-end': 'url(#' + id + ')'
    });
  }

  function caption(x, y, text, bold) {
    svgEl('text', {
      x,
      y,
      'text-anchor': 'middle',
      'font-family': 'var(--display)',
      class: 'mol-label',
      'font-weight': bold ? 700 : 500,
      fill: bold ? 'var(--accent)' : 'var(--ink-mute)'
    }, text);
  }

  function drawO2(level) {
    clearSvg();
    const y = 105, xL = 135, xR = 185;
    bond(xL + 12, y, xR - 12, y, true);
    lewisAtom(xL, y, 'O');
    lewisAtom(xR, y, 'O');
    lonePair(xL, y - 20, 'var(--accent)');
    lonePair(xL, y + 20, 'var(--accent)');
    lonePair(xR, y - 20, 'var(--accent)');
    lonePair(xR, y + 20, 'var(--accent)');

    if (level === 'bond') {
      caption(160, 168, 'Identical atoms: no charge separation');
    }
    if (level === 'verdict') {
      caption(160, 168, 'Identical atoms: pulls cancel');
      caption(160, 186, 'Nonpolar molecule · LDF only', true);
    }
  }

  function drawHCl(level) {
    clearSvg();
    const y = 105, xL = 133, xR = 187;
    bond(xL + 12, y, xR - 16, y, false);
    lewisAtom(xL, y, 'H');
    lewisAtom(xR, y, 'Cl');
    lonePair(xR, y - 20, 'var(--warn)');
    lonePair(xR, y + 20, 'var(--warn)');
    lonePairV(xR + 18, y, 'var(--warn)');

    if (level === 'bond' || level === 'verdict') {
      delta(xL, y - 32, '+');
      delta(xR, y - 32, '−');
    }
    if (level === 'verdict') {
      arrow(xL + 16, y - 18, xR - 16, y - 18, { solid: true });
      caption(160, 168, 'Single polar bond: net dipole toward Cl');
      caption(160, 186, 'Polar molecule · Dipole-dipole only', true);
    }
  }

  function drawCO2(level) {
    clearSvg();
    const y = 105, xL = 112, xC = 160, xR = 208;
    bond(xL + 12, y, xC - 12, y, true);
    bond(xC + 12, y, xR - 12, y, true);
    lewisAtom(xL, y, 'O');
    lewisAtom(xC, y, 'C');
    lewisAtom(xR, y, 'O');
    lonePair(xL, y - 20, 'var(--accent)');
    lonePair(xL, y + 20, 'var(--accent)');
    lonePair(xR, y - 20, 'var(--accent)');
    lonePair(xR, y + 20, 'var(--accent)');

    if (level === 'bond' || level === 'verdict') {
      delta(xC, y - 34, '+');
      delta(xL, y - 34, '−');
      delta(xR, y - 34, '−');
    }
    if (level === 'verdict') {
      arrow(xC - 14, y - 20, xL + 14, y - 20, {});
      arrow(xC + 14, y - 20, xR - 14, y - 20, {});
      caption(160, 168, 'Opposite pulls cancel exactly: net dipole = 0');
      caption(160, 186, 'Nonpolar molecule · LDF only', true);
    }
  }

  function drawH2O(level) {
    clearSvg();
    const ox = 160, oy = 78, h1x = 122, h1y = 108, h2x = 198, h2y = 108;
    bond(h1x + 10, h1y - 8, ox - 10, oy + 8, false);
    bond(h2x - 10, h2y - 8, ox + 10, oy + 8, false);
    lewisAtom(ox, oy, 'O');
    lewisAtom(h1x, h1y, 'H');
    lewisAtom(h2x, h2y, 'H');

    // Lone pairs on O (cardinal West and East)
    lonePairV(ox - 18, oy, 'var(--accent)');
    lonePairV(ox + 18, oy, 'var(--accent)');

    if (level === 'bond' || level === 'verdict') {
      delta(ox, oy - 26, '−');
      delta(h1x - 16, h1y + 8, '+');
      delta(h2x + 16, h2y + 8, '+');
    }
    if (level === 'verdict') {
      arrow(h1x + 8, h1y - 14, ox - 10, oy + 20, {});
      arrow(h2x - 8, h2y - 14, ox + 10, oy + 20, {});
      arrow(ox, h1y + 10, ox, oy + 18, { width: 2.6, solid: true });
      caption(160, 168, 'Pulls reinforce: net dipole toward O');
      caption(160, 186, 'Polar molecule · Dipole-dipole + H-bonding', true);
    }
  }

  function drawCH4(level) {
    clearSvg();
    const cx = 160, cy = 100;
    bond(cx, cy - 12, cx, 64, false);
    bond(cx, cy + 12, cx, 136, false);
    bond(cx - 12, cy, 124, cy, false);
    bond(cx + 12, cy, 196, cy, false);

    lewisAtom(cx, cy, 'C');
    lewisAtom(cx, 52, 'H');
    lewisAtom(cx, 148, 'H');
    lewisAtom(112, cy, 'H');
    lewisAtom(208, cy, 'H');

    if (level === 'bond') {
      caption(160, 180, 'C-H bonds: ΔEN = 0.35 (essentially nonpolar)');
    }
    if (level === 'verdict') {
      arrow(cx, 64, cx, 84, { width: 1.4 });
      arrow(cx, 136, cx, 116, { width: 1.4 });
      arrow(124, cy, 144, cy, { width: 1.4 });
      arrow(196, cy, 176, cy, { width: 1.4 });
      caption(160, 176, 'Symmetric pulls cancel');
      caption(160, 194, 'Nonpolar molecule · LDF only', true);
    }
  }

  function drawMolecule(level) {
    if (!current) { clearSvg(); return; }
    const fn = { O2: drawO2, HCl: drawHCl, CO2: drawCO2, H2O: drawH2O, CH4: drawCH4 }[current.id];
    if (fn) fn(level);
  }

  // Auto-load O2 on start so there is no blank canvas
  selectMolecule('O2');
})();
