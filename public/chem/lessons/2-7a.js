/* ============================================================
   1-7a LESSON INTERACTIVES (file 2-7a)
   The molar mass builder, built on TB.sim.create (RUNTIME_SPEC 4.3). It has no loop: the
   picture is redrawn when a formula is calculated. The building is the attempt, so it has
   no prediction lock (docs/plans/textbook-sim-briefs.md, "Chem building tools").
   Type or pick a formula. The table multiplies each count by its atomic mass and adds the
   subtotals, the way the page does by hand. Atomic masses are the two-decimal values the
   lesson text and its tables use (Ca 40.08, C 12.01, O 16.00, and so on).
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  const TAU = Math.PI * 2;

  // g/mol, with a space-filling radius for the picture (design units)
  const MASS = {
    H: ['Hydrogen', 1.01, 12], He: ['Helium', 4.00, 13], Li: ['Lithium', 6.94, 15], Be: ['Beryllium', 9.01, 15],
    B: ['Boron', 10.81, 16], C: ['Carbon', 12.01, 19], N: ['Nitrogen', 14.01, 18], O: ['Oxygen', 16.00, 18],
    F: ['Fluorine', 19.00, 16], Ne: ['Neon', 20.18, 16], Na: ['Sodium', 22.99, 21], Mg: ['Magnesium', 24.31, 21],
    Al: ['Aluminum', 26.98, 20], Si: ['Silicon', 28.09, 19], P: ['Phosphorus', 30.97, 19], S: ['Sulfur', 32.06, 20],
    Cl: ['Chlorine', 35.45, 23], Ar: ['Argon', 39.95, 20], K: ['Potassium', 39.10, 24], Ca: ['Calcium', 40.08, 24],
    Sc: ['Scandium', 44.96, 21], Ti: ['Titanium', 47.87, 21], V: ['Vanadium', 50.94, 21], Cr: ['Chromium', 52.00, 21],
    Mn: ['Manganese', 54.94, 21], Fe: ['Iron', 55.85, 21], Co: ['Cobalt', 58.93, 21], Ni: ['Nickel', 58.69, 21],
    Cu: ['Copper', 63.55, 21], Zn: ['Zinc', 65.38, 21], Ga: ['Gallium', 69.72, 20], Ge: ['Germanium', 72.63, 20],
    As: ['Arsenic', 74.92, 20], Se: ['Selenium', 78.97, 20], Br: ['Bromine', 79.90, 24], Kr: ['Krypton', 83.80, 22]
  };
  // the token each element is drawn in, and whether its symbol is dark or light on that fill
  const FILL = { H: 'paper3', C: 'ink', N: 'cool', O: 'accent', Cl: 'warn' };
  const MAX_COUNT = 999;          // one element's count
  const MAX_DRAWN = 37;           // the picture shows up to three rings of atoms

  // hand-placed space-filling layouts for the six presets, in a 400 by 250 design box
  const PRESETS = {
    H2O: [['O', 200, 120, 21], ['H', 180, 134, 13], ['H', 220, 134, 13]],
    CO2: [['C', 200, 125, 21], ['O', 172, 125, 19], ['O', 228, 125, 19]],
    NaCl: [['Na', 184, 125, 20], ['Cl', 220, 125, 24]],
    NaHCO3: [['Na', 125, 125, 20], ['C', 210, 125, 21], ['O', 210, 95, 19], ['O', 180, 145, 19], ['O', 240, 145, 19], ['H', 264, 154, 13]],
    CH4: [['C', 200, 125, 22], ['H', 200, 98, 13], ['H', 224, 136, 13], ['H', 176, 136, 13], ['H', 200, 150, 13]],
    C6H12O6: [
      ['O', 220, 100, 17], ['C', 240, 130, 18], ['C', 220, 160, 18], ['C', 180, 160, 18], ['C', 160, 130, 18], ['C', 180, 100, 18],
      ['C', 160, 68, 18], ['O', 132, 58, 16], ['H', 112, 50, 11], ['H', 184, 58, 11], ['H', 156, 44, 11],
      ['O', 272, 130, 16], ['H', 290, 136, 11], ['H', 248, 110, 11], ['O', 242, 188, 16], ['H', 258, 198, 11], ['H', 208, 180, 11],
      ['O', 158, 188, 16], ['H', 142, 198, 11], ['H', 192, 180, 11], ['O', 128, 130, 16], ['H', 110, 136, 11], ['H', 152, 110, 11], ['H', 198, 86, 11]
    ]
  };

  /* ---- the model ---- */
  function parseFlat(s) {
    if (!/^([A-Z][a-z]?[0-9]*)+$/.test(s)) return null;
    const out = {};
    const re = /([A-Z][a-z]?)([0-9]*)/g;
    let m, used = 0;
    while ((m = re.exec(s)) !== null) {
      out[m[1]] = (out[m[1]] || 0) + (m[2] === '' ? 1 : parseInt(m[2], 10));
      used += m[0].length;
    }
    return used === s.length ? out : null;
  }
  // one level of parentheses at a time, so Ca(OH)2 and Al2(SO4)3 work
  function parse(text) {
    let s = String(text).replace(/\s+/g, '');
    if (!s) return null;
    const paren = /\(([^()]+)\)([0-9]*)/;
    for (let guard = 0, m; (m = paren.exec(s)) !== null && guard < 10; guard++) {
      const inner = parseFlat(m[1]);
      if (!inner) return null;
      const times = m[2] === '' ? 1 : parseInt(m[2], 10);
      s = s.replace(m[0], Object.keys(inner).map((k) => k + inner[k] * times).join(''));
    }
    const atoms = parseFlat(s);
    if (!atoms) return null;
    return Object.keys(atoms).some((k) => atoms[k] > MAX_COUNT || atoms[k] < 1) ? null : atoms;
  }
  const sub = (n) => String(n).split('').map((d) => '₀₁₂₃₄₅₆₇₈₉'[d] || d).join('');
  function pretty(atoms) { return Object.keys(atoms).map((k) => k + (atoms[k] > 1 ? sub(atoms[k]) : '')).join(''); }
  // the same atoms in the same counts are the same key, however the student typed them
  const canon = (atoms) => Object.keys(atoms).sort().map((k) => k + atoms[k]).join('');
  const PRESET_KEYS = {};
  Object.keys(PRESETS).forEach((k) => { PRESET_KEYS[canon(parse(k))] = k; });

  function molarMass(text) {
    const atoms = parse(text);
    if (!atoms) return { ok: false };
    let total = 0;
    const unknown = [];
    const rows = Object.keys(atoms).map((sym) => {
      const e = MASS[sym];
      if (!e) { unknown.push(sym); return { sym: sym, name: 'Unknown element', qty: atoms[sym], mass: null, subtotal: null }; }
      const subtotal = Math.round(atoms[sym] * e[1] * 100) / 100;
      total += atoms[sym] * e[1];
      return { sym: sym, name: e[0], qty: atoms[sym], mass: e[1], subtotal: subtotal };
    });
    const count = rows.reduce((n, r) => n + r.qty, 0);
    return { ok: unknown.length === 0, atoms: atoms, rows: rows, unknown: unknown, total: Math.round(total * 100) / 100, count: count, text: pretty(atoms) };
  }

  // atoms to draw: the preset's own layout, or rings of atoms with the biggest in the middle
  function layout(atoms) {
    const key = PRESET_KEYS[canon(atoms)];
    if (key) return PRESETS[key].map((a) => ({ sym: a[0], x: a[1], y: a[2], r: a[3] }));
    const list = [];
    Object.keys(atoms).forEach((sym) => { for (let i = 0; i < atoms[sym]; i++) list.push({ sym: sym, r: (MASS[sym] || [0, 0, 18])[2] * 0.7 }); });
    if (list.length > MAX_DRAWN) return null;
    list.sort((a, b) => b.r - a.r);
    let ring = 1, placed = 0;
    return list.map((a, i) => {
      if (i === 0) return { sym: a.sym, x: 200, y: 125, r: a.r };
      if (placed >= ring * 6) { ring++; placed = 0; }
      const ang = (placed / (ring * 6)) * TAU + ring * 0.5;
      placed++;
      return { sym: a.sym, x: 200 + ring * 32 * Math.cos(ang), y: 125 + ring * 32 * Math.sin(ang), r: a.r };
    });
  }
  if (window.GC_MODELS) window.GC_MODELS['1-7a'] = { parse: parse, molarMass: molarMass, layout: layout, MASS: MASS, PRESETS: PRESETS, MAX_DRAWN: MAX_DRAWN, pretty: pretty };

  function init() {
    const box = $('[data-sim="molar-mass"]');
    if (!box || !window.TB) return;
    const input = $('#formulaInput', box);
    const body = $('#calcTableBody', box);
    const chips = $$('[data-formula]', box);
    const note = $('[data-sim-note]', box);
    let current = molarMass('H2O');
    let sim = null;

    function cell(tr, text, cls) {
      const td = document.createElement('td');
      td.textContent = text;
      if (cls) td.className = cls;
      tr.appendChild(td);
    }

    function report(text) {
      current = molarMass(text);
      body.textContent = '';
      if (!current.atoms) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.textContent = 'This is not a formula the tool can read.';
        tr.appendChild(td);
        body.appendChild(tr);
        sim.setReadout('formula', '–'); sim.setReadout('total', '–'); sim.setReadout('atoms', '–');
        sim.setStatus('alert', 'Check the formula');
        note.textContent = 'Use element symbols and numbers, such as H2O or NaHCO3. A symbol starts with a capital letter. Counts are 1 to ' + MAX_COUNT + '.';
        sim.setLabel('No picture: the formula could not be read.');
        return;
      }
      current.rows.forEach((r) => {
        const tr = document.createElement('tr');
        cell(tr, r.sym + ' ' + r.name);
        cell(tr, String(r.qty), 'num');
        cell(tr, r.mass === null ? 'unknown' : r.mass.toFixed(2), 'num');
        cell(tr, r.subtotal === null ? '–' : r.subtotal.toFixed(2), 'num');
        body.appendChild(tr);
      });
      sim.setReadout('formula', current.text);
      sim.setReadout('atoms', String(current.count));
      if (current.ok) {
        sim.setReadout('total', current.total.toFixed(2) + ' g/mol');
        sim.setStatus('ok', 'Molar mass found');
        note.textContent = 'Each count times its atomic mass gives a subtotal. The subtotals add to ' + current.total.toFixed(2) + ' g/mol.';
      } else {
        sim.setReadout('total', '–');
        sim.setStatus('alert', 'Unknown element');
        note.textContent = current.unknown.join(', ') + ' is not in this tool. Check the symbols.';
      }
      const lay = layout(current.atoms);
      sim.setLabel(lay ? 'Space-filling picture of ' + current.count + ' atoms of ' + current.text + '.' : 'Too many atoms to draw. The mass is still calculated.');
    }

    function draw(ctx, env) {
      const c = env.colors;
      const k = Math.min(env.w / 400, env.h / 250);
      ctx.save();
      ctx.translate((env.w - 400 * k) / 2, (env.h - 250 * k) / 2);
      ctx.scale(k, k);
      const lay = current.atoms ? layout(current.atoms) : null;
      if (!lay) {
        ctx.fillStyle = c.inkSoft;
        ctx.font = env.font(14, 'display', 600);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(current.atoms ? 'Too many atoms to draw' : 'No picture', 200, 125);
        ctx.restore();
        return;
      }
      lay.forEach((a) => {
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, TAU);
        ctx.fillStyle = c[FILL[a.sym] || 'inkMute']; ctx.fill();
        ctx.lineWidth = 1.4; ctx.strokeStyle = c.ink; ctx.stroke();
        if (a.r * k >= 9) {
          ctx.fillStyle = a.sym === 'H' ? c.ink : c.paper;
          ctx.font = env.font(Math.max(11, Math.min(14, a.r * 0.75)), 'mono', 700);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(a.sym, a.x, a.y + 1);
        }
      });
      ctx.restore();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: false,
      tokens: ['paper-3'],
      init() { report(input.value); },
      draw: draw
    });

    function calculate() {
      const text = input.value.trim();
      const match = chips.filter((c) => c.dataset.formula === text)[0];
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === match)));
      report(text);
      sim.redraw();
    }
    chips.forEach((chip) => chip.addEventListener('click', () => { input.value = chip.dataset.formula; calculate(); }));
    $('#calcBtn', box).addEventListener('click', calculate);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); calculate(); } });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
