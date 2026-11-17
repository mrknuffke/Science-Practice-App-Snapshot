/* ============================================================
   Lesson 1-1: where do the atoms in glucose go, and where does the energy go?
   Built on TB.sim.create (docs/textbook/RUNTIME_SPEC.md, section 4.3).
   Brief: docs/plans/textbook-sim-briefs.md, "Bio 1-1".

   The model traces every atom. One reaction unit takes one glucose (24 atoms)
   and six oxygen molecules (12 atoms) in, breaks the bonds, and sends the same
   36 atoms out as six carbon dioxide and six water molecules. Atoms are never
   created, never destroyed, and never change element.

   Units start on a fixed schedule, so the model is the same on every screen:
   one unit every 5 s (rest), 2.5 s (steady swim), or 1.25 s (sprint), and each
   unit takes 5 s from entering to leaving. Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const UNIT_SECONDS = 5;     // how long one reaction unit takes
  const WINDOW = 10;          // the counters cover the last 10 s
  const ATOMS_PER_UNIT = 36;
  const CO2_PER_UNIT = 6;
  const SETTINGS = [
    { name: 'Rest', every: 5 },
    { name: 'Steady swim', every: 2.5 },
    { name: 'Sprint', every: 1.25 }
  ];
  const MAX_PER_WINDOW = WINDOW / SETTINGS[2].every;   // the energy bars are full at a sprint
  const LANES = 4;

  // Phases of one unit, as fractions of UNIT_SECONDS.
  const T_ENTER = 0.26;       // molecules move in
  const T_BREAK = 0.38;       // bonds break, atoms drift apart
  const T_REGROUP = 0.62;     // atoms regroup into new molecules, new bonds form
  const T_EXIT = 1;           // products leave
  // The model clock starts in a middle lane, as one glucose and six oxygen molecules
  // arrive and before any bond breaks. So the first frame (and a print made before the
  // sim runs) shows the inputs, not an empty cell, and never shows the products, which
  // would answer the prediction.
  const T_START = UNIT_SECONDS * (1 + 0.24);
  const modelTime = (env) => env.time + T_START;

  const box = document.querySelector('[data-sim="respiration"]');
  if (!box || !window.TB) return;

  const chips = Array.prototype.slice.call(box.querySelectorAll('[data-level]'));
  let level = 0;
  let clock0 = 0;             // the run clock starts again when the workload changes
  let sim = null;

  /* ---------- a small seeded generator, so a unit looks the same every time ---------- */
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
  const smooth = (x) => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c); };
  const lerp = (a, b, k) => a + (b - a) * k;

  /* ---------- the atoms of one unit, in unit-free offsets ----------
     Each atom has four places: where it enters, where it drifts, where it sits in its
     new molecule, and where it leaves. The element of an atom never changes. */
  const cache = new Map();
  const CACHE_MAX = 24;       // more than the units on screen at a sprint; older ones are dropped
  function buildUnit(k, lvl) {
    const key = lvl + ':' + k;
    if (cache.has(key)) return cache.get(key);
    const rand = rng(k * 7919 + lvl * 104729 + 17);
    const atoms = [];
    const add = (el, enter, product, bondIn, bondOut) => {
      const a = { el: el, enter: enter, product: product, bondIn: bondIn, bondOut: bondOut,
                  drift: { x: (rand() - 0.5) * 3.2, y: (rand() - 0.5) * 3.2 } };
      atoms.push(a);
      return atoms.length - 1;
    };
    // glucose: a ring of 6 carbon, an oxygen on each carbon, two hydrogen per carbon pair
    const carbons = [], glucoseO = [], hydrogens = [];
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI * 2 * i) / 6;
      carbons.push(add('C', { x: Math.cos(ang) * 1.1, y: Math.sin(ang) * 1.1 }, null, -1, -1));
    }
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI * 2 * i) / 6;
      glucoseO.push(add('O', { x: Math.cos(ang) * 2.0, y: Math.sin(ang) * 2.0 }, null, carbons[i], -1));
    }
    for (let i = 0; i < 12; i++) {
      const ang = (Math.PI * 2 * (i >> 1)) / 6 + (i % 2 ? 0.24 : -0.24);
      hydrogens.push(add('H', { x: Math.cos(ang) * 2.9, y: Math.sin(ang) * 2.9 }, null, glucoseO[i >> 1], -1));
    }
    // six oxygen molecules, in a block to the left of the glucose
    const o2a = [], o2b = [];
    for (let i = 0; i < 6; i++) {
      const col = i % 2, row = (i / 2) | 0;
      const ox = -5.2 - col * 2.1, oy = (row - 1) * 2.2;
      const a1 = add('O', { x: ox, y: oy - 0.45 }, null, -1, -1);
      const a2 = add('O', { x: ox, y: oy + 0.45 }, null, a1, -1);
      o2a.push(a1); o2b.push(a2);
    }
    // products: carbon dioxide i = O(glucose i) + C(i) + O(a of O2 i); water i = O(b of O2 i) + 2 H
    // carbon dioxide leaves at the top of the lane, water at the bottom
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = (i / 3) | 0;
      const cx = 1.5 + col * 3.4, cy = -3.0 - row * 1.5;
      atoms[carbons[i]].product = { x: cx, y: cy };
      atoms[glucoseO[i]].product = { x: cx - 1.1, y: cy };
      atoms[o2a[i]].product = { x: cx + 1.1, y: cy };
      atoms[glucoseO[i]].bondOut = carbons[i];
      atoms[o2a[i]].bondOut = carbons[i];
      const wx = 1.5 + col * 3.4, wy = 2.6 + row * 1.9;
      atoms[o2b[i]].product = { x: wx, y: wy };
      atoms[hydrogens[2 * i]].product = { x: wx - 0.9, y: wy + 0.8 };
      atoms[hydrogens[2 * i + 1]].product = { x: wx + 0.9, y: wy + 0.8 };
      atoms[hydrogens[2 * i]].bondOut = o2b[i];
      atoms[hydrogens[2 * i + 1]].bondOut = o2b[i];
      // the oxygen atoms and carbon atoms keep one bond out each: water oxygen has none of its own
    }
    // the exit lane offsets: carbon dioxide up and out, water down and out
    atoms.forEach((a) => {
      a.exitUp = (a.el === 'H') ? 1 : (a.product.y > 0 ? 1 : -1);
    });
    cache.set(key, atoms);
    if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
    return atoms;
  }

  /* ---------- layout ---------- */
  function layout(env) {
    const narrow = env.w < 520;
    const L = { narrow: narrow };
    const unit = Math.max(5.5, Math.min(env.w, env.h * 1.55) / (narrow ? 34 : 56));   // pixels per offset unit
    L.unit = unit;
    if (!narrow) {
      L.cell = { x: env.w * 0.03, y: env.h * 0.1, w: env.w * 0.7, h: env.h * 0.8 };
      L.bars = { x: env.w * 0.79, y: env.h * 0.18, w: env.w * 0.17, h: env.h * 0.64 };
    } else {
      L.cell = { x: env.w * 0.04, y: env.h * 0.06, w: env.w * 0.92, h: env.h * 0.62 };
      L.bars = { x: env.w * 0.08, y: env.h * 0.76, w: env.w * 0.84, h: env.h * 0.2 };
    }
    const c = L.cell;
    L.mito = { cx: c.x + c.w * 0.5, cy: c.y + c.h * 0.52, rx: c.w * 0.4, ry: c.h * 0.38 };
    return L;
  }

  function lanePoint(L, lane, anchor) {
    const m = L.mito;
    const dy = (lane - (LANES - 1) / 2) * (m.ry * 2 / (LANES + 0.4));
    switch (anchor) {
      case 'start': return { x: L.cell.x + L.unit * 1.2, y: m.cy + dy };
      case 'enter': return { x: m.cx - m.rx * 0.55, y: m.cy + dy };
      case 'drift': return { x: m.cx - m.rx * 0.05, y: m.cy + dy };
      case 'product': return { x: m.cx + m.rx * 0.2, y: m.cy + dy };
      default: return { x: L.cell.x + L.cell.w - L.unit * 1.2, y: m.cy + dy };
    }
  }

  function atomPosition(a, u, lane, L) {
    // u in 0..1 is how far through the unit this atom is
    const U = L.unit;
    const place = (anchor, off) => {
      const p = lanePoint(L, lane, anchor);
      return { x: p.x + off.x * U, y: p.y + off.y * U };
    };
    const start = place('start', { x: a.enter.x - 2, y: a.enter.y });
    const enter = place('enter', a.enter);
    const drift = place('drift', { x: a.drift.x + a.enter.x * 0.35, y: a.drift.y + a.enter.y * 0.35 });
    const prod = place('product', a.product);
    const exit = place('exit', { x: -3.2 + (a.product.x - 1.5) * 0.2, y: a.exitUp * 2.1 + a.product.y * 0.3 });
    if (u < T_ENTER) { const k = smooth(u / T_ENTER); return { x: lerp(start.x, enter.x, k), y: lerp(start.y, enter.y, k) }; }
    if (u < T_BREAK) { const k = smooth((u - T_ENTER) / (T_BREAK - T_ENTER)); return { x: lerp(enter.x, drift.x, k), y: lerp(enter.y, drift.y, k) }; }
    if (u < T_REGROUP) { const k = smooth((u - T_BREAK) / (T_REGROUP - T_BREAK)); return { x: lerp(drift.x, prod.x, k), y: lerp(drift.y, prod.y, k) }; }
    const k = smooth((u - T_REGROUP) / (T_EXIT - T_REGROUP));
    return { x: lerp(prod.x, exit.x, k), y: lerp(prod.y, exit.y, k) };
  }

  /* ---------- the counters: completed units in the last 10 s ---------- */
  // The schedule runs forever in both directions (units start at 0, every, 2 x every, ...), so the
  // scene is full from the first frame, and the count over any 10 s window is a whole number.
  function completedInWindow(t) {
    const every = SETTINGS[level].every;
    return Math.floor((t - UNIT_SECONDS) / every) - Math.floor((t - WINDOW - UNIT_SECONDS) / every);
  }

  function report(env) {
    const n = completedInWindow(modelTime(env));
    sim.setReadout('glucose', n);
    sim.setReadout('co2', n * CO2_PER_UNIT);
    sim.setReadout('atoms-in', n * ATOMS_PER_UNIT);
    sim.setReadout('atoms-out', n * ATOMS_PER_UNIT);
    sim.setReadout('clock', Math.max(0, Math.floor(env.time - clock0)) + ' s');
  }

  /* ---------- drawing ---------- */
  // A label is measured first, so it never runs off the stage.
  function drawLabel(ctx, env, text, x, y, align, color) {
    ctx.font = env.font(12, 'mono', 600);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const w = ctx.measureText(text).width;
    const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.fillStyle = color || env.colors.inkSoft;
    ctx.fillText(text, Math.max(4, Math.min(env.w - 4 - w, left)), y);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawAtom(ctx, env, a, p, alpha) {
    const c = env.colors;
    const U = Math.max(4.5, env.w / 150);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    if (a.el === 'C') { ctx.arc(p.x, p.y, U * 0.95, 0, Math.PI * 2); ctx.fillStyle = c.ink; ctx.fill(); }
    else if (a.el === 'O') { ctx.arc(p.x, p.y, U * 0.8, 0, Math.PI * 2); ctx.fillStyle = c.oxygen; ctx.fill(); }
    else { ctx.arc(p.x, p.y, U * 0.5, 0, Math.PI * 2); ctx.fillStyle = c.card; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = c.inkMute; ctx.stroke(); }
    ctx.globalAlpha = 1;
  }

  function draw(ctx, env) {
    const c = env.colors;
    const L = layout(env);
    const every = SETTINGS[level].every;
    const t = modelTime(env);

    // the cell and the mitochondrion
    ctx.lineWidth = 2;
    ctx.strokeStyle = c.hair;
    ctx.fillStyle = c.card;
    roundRect(ctx, L.cell.x, L.cell.y, L.cell.w, L.cell.h, 16);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(L.mito.cx, L.mito.cy, L.mito.rx, L.mito.ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = c.paper2;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = c.accent;
    ctx.stroke();

    drawLabel(ctx, env, 'Muscle cell', L.cell.x + 10, L.cell.y + 14, 'left', c.inkSoft);
    drawLabel(ctx, env, L.narrow ? 'Mitochondrion' : 'Where respiration happens', L.mito.cx, L.cell.y + L.cell.h - 14, 'center', c.ink);
    drawLabel(ctx, env, 'In', L.cell.x + 10, L.cell.y + L.cell.h - 14, 'left', c.inkSoft);
    drawLabel(ctx, env, 'Out', L.cell.x + L.cell.w - 10, L.cell.y + L.cell.h - 14, 'right', c.inkSoft);

    // the active units, clipped to the cell so atoms enter through its wall
    ctx.save();
    roundRect(ctx, L.cell.x, L.cell.y, L.cell.w, L.cell.h, 16);
    ctx.clip();
    const kMin = Math.ceil((t - UNIT_SECONDS) / every);
    const kMax = Math.floor(t / every);
    const dots = [];
    for (let k = kMin; k <= kMax; k++) {
      const start = k * every;
      const u = (t - start) / UNIT_SECONDS;
      if (u < 0 || u > 1) continue;
      const lane = ((k % LANES) + LANES) % LANES;
      const atoms = buildUnit(k, level);
      const pos = atoms.map((a) => atomPosition(a, u, lane, L));
      // bonds: the old bonds fade as the unit breaks apart, the new bonds fade in as it regroups
      let bondOld = u < T_ENTER ? 1 : Math.max(0, 1 - (u - T_ENTER) / (T_BREAK - T_ENTER));
      let bondNew = u < T_BREAK ? 0 : Math.min(1, (u - T_BREAK) / (T_REGROUP - T_BREAK + 0.1));
      ctx.lineWidth = 2;
      ctx.strokeStyle = c.inkMute;
      atoms.forEach((a, i) => {
        if (bondOld > 0.02 && a.bondIn >= 0) {
          ctx.globalAlpha = bondOld;
          ctx.beginPath(); ctx.moveTo(pos[i].x, pos[i].y); ctx.lineTo(pos[a.bondIn].x, pos[a.bondIn].y); ctx.stroke();
        }
        if (bondNew > 0.02 && a.bondOut >= 0) {
          ctx.globalAlpha = bondNew;
          ctx.beginPath(); ctx.moveTo(pos[i].x, pos[i].y); ctx.lineTo(pos[a.bondOut].x, pos[a.bondOut].y); ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
      const fade = u > 0.92 ? 1 - (u - 0.92) / 0.08 : 1;
      atoms.forEach((a, i) => dots.push({ a: a, p: pos[i], alpha: fade }));
    }
    // carbon first, then oxygen, then hydrogen on top, so no atom hides another
    ['C', 'O', 'H'].forEach((el) => dots.filter((d) => d.a.el === el).forEach((d) => drawAtom(ctx, env, d.a, d.p, d.alpha)));
    ctx.restore();

    // the energy bars: how much energy moved in the last 10 s (no numbers). About 40% of
    // the energy goes to ATP and 60% leaves as heat, so heat fills 1.5 times the ATP bar.
    const n = completedInWindow(t);
    const fill = Math.max(0, Math.min(1, n / MAX_PER_WINDOW));
    const bars = [{ text: 'To ATP', color: c.atp, share: 2 / 3 }, { text: 'As heat', color: c.thermal, share: 1 }];
    ctx.lineWidth = 1.5;
    bars.forEach((b, i) => {
      if (!L.narrow) {
        const bw = L.bars.w * 0.42;
        const bx = L.bars.x + i * (L.bars.w * 0.58);
        const by = L.bars.y;
        ctx.strokeStyle = c.hair; ctx.fillStyle = c.card;
        roundRect(ctx, bx, by, bw, L.bars.h, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = b.color;
        const hh = (L.bars.h - 4) * fill * b.share;
        roundRect(ctx, bx + 2, by + L.bars.h - 2 - hh, bw - 4, Math.max(0, hh), 4); ctx.fill();
        drawLabel(ctx, env, b.text, bx + bw / 2, by + L.bars.h + 16, 'center', c.inkSoft);
      } else {
        const bh = L.bars.h * 0.34;
        const by = L.bars.y + i * (L.bars.h * 0.52);
        const lx = L.bars.x + 62;
        ctx.strokeStyle = c.hair; ctx.fillStyle = c.card;
        roundRect(ctx, lx, by, L.bars.w - 62, bh, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = b.color;
        roundRect(ctx, lx + 2, by + 2, Math.max(0, (L.bars.w - 66) * fill * b.share), bh - 4, 3); ctx.fill();
        drawLabel(ctx, env, b.text, L.bars.x, by + bh / 2, 'left', c.inkSoft);
      }
    });
  }

  /* ---------- the sim ---------- */
  function setLevel(next) {
    level = next;
    chips.forEach((chip, i) => chip.setAttribute('aria-pressed', String(i === level)));
    clock0 = sim.env.time;
    report(sim.env);
    sim.redraw();
  }

  sim = window.TB.sim.create(box, {
    kind: 'canvas',
    loop: true,
    tokens: ['glucose', 'oxygen', 'co2', 'water', 'atp', 'thermal', 'hormone'],
    stepSeconds: 0.5,
    init(env) {
      setLevel(0);
    },
    update(dt, env) {
      report(env);
    },
    draw: draw,
    record() {
      // the helper reads the column names once, before the sim exists
      const n = completedInWindow(sim ? modelTime(sim.env) : T_START);
      return {
        'Workload': SETTINGS[level].name,
        'Glucose used (10 s)': n,
        'CO₂ made (10 s)': n * CO2_PER_UNIT,
        'Atoms in': n * ATOMS_PER_UNIT,
        'Atoms out': n * ATOMS_PER_UNIT
      };
    }
  });

  chips.forEach((chip, i) => chip.addEventListener('click', () => setLevel(i)));
  sim.setStatus('ok', 'Atoms in equal atoms out');
})();
