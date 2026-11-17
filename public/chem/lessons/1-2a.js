/* ============================================================
   1-2a LESSON INTERACTIVES
   The bond explorer, built on TB.sim.create (RUNTIME_SPEC 4.3).
   Brief: docs/plans/textbook-sim-briefs.md, "Chem 1-2a: Bond Explorer".
   Two chosen atoms and the electrons between them. The bond type comes from the
   electronegativity difference. The drawing is a canvas redrawn each frame
   (no element is rebuilt), and its motion runs on simulated time.
   Element data comes from ../assets/elements.js (window.GC_ELEMENTS).
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const EL = window.GC_ELEMENTS;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  const TAU = Math.PI * 2;

  const POOL = EL ? EL.list.filter((e) => e.mainGroup && e.en !== null) : [];
  const N_SEA = 14;                       // loose electrons in the metallic picture
  const CYCLE = 3;                        // seconds for one electron transfer in the ionic picture

  /* ---- the model: bond type from the electronegativity difference ---- */
  function classify(a, b) {
    const diff = Math.abs(a.en - b.en);
    const metalA = a.kind === 'metal', metalB = b.kind === 'metal';
    if (metalA && metalB) return { cls: 'metallic', type: 'Metallic', diff: diff };
    if (metalA || metalB) {
      return diff >= 1.7 ? { cls: 'ionic', type: 'Ionic', diff: diff } : { cls: 'ionic-trans', type: 'Borderline ionic', diff: diff };
    }
    return diff < 0.5 ? { cls: 'nonpolar', type: 'Nonpolar covalent', diff: diff } : { cls: 'polar', type: 'Polar covalent', diff: diff };
  }

  function describe(a, b, bond) {
    const d = bond.diff.toFixed(2);
    switch (bond.cls) {
      case 'metallic':
        return a.name + ' and ' + b.name + ' are both metals with a loose grip on their electrons. Neither atom holds its valence electrons tightly, so the electrons drift away from their nuclei. They form a sea of electrons that flows around a grid of positive metal cores.';
      case 'ionic': {
        const metal = a.kind === 'metal' ? a : b, non = metal === a ? b : a;
        return non.name + ' pulls much harder (EN ' + non.en + ') than ' + metal.name + ' (EN ' + metal.en + '). With a mismatch of ΔEN = ' + d + ', ' + non.name + ' pulls the electron completely away. That forms a positive cation and a negative anion, held together by an electrostatic force.';
      }
      case 'ionic-trans':
        return 'This bond joins a metal and a nonmetal, but ΔEN = ' + d + ' is just below 1.7. The electron is mostly transferred to the nonmetal, and the sharing that is left is extremely lopsided.';
      case 'nonpolar':
        return 'Both atoms pull on the electrons with nearly equal strength (ΔEN = ' + d + '). The electrons spend equal time between the nuclei, so the bond has no charge separation.';
      default:
        return 'The atom with the higher EN pulls the shared electrons closer (ΔEN = ' + d + '). That gives a partial negative charge (δ−) on the stronger atom and a partial positive charge (δ+) on the weaker one.';
    }
  }

  // a fixed, repeatable scatter for the metallic sea (paths are chosen once)
  function seaStart() {
    const out = [];
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < N_SEA; i++) out.push({ x: rnd(), y: rnd(), vx: (rnd() - 0.5) * 0.4, vy: (rnd() - 0.5) * 0.4 });
    return out;
  }

  const state = { a: null, b: null, bond: null, sea: seaStart() };
  if (window.GC_MODELS) window.GC_MODELS['1-2a'] = { classify: classify, POOL: POOL };

  function init() {
    const box = $('[data-sim="bond"]');
    if (!box || !EL || !window.TB) return;
    const selA = $('#selectA', box), selB = $('#selectB', box);
    const note = $('[data-sim-note]', box);
    let sim = null;

    POOL.forEach((e) => {
      [selA, selB].forEach((sel) => {
        const o = document.createElement('option');
        o.value = e.sym;
        o.textContent = e.name + ' (' + e.sym + ')';
        sel.appendChild(o);
      });
    });
    selA.value = 'Na';
    selB.value = 'Cl';

    function pick() {
      state.a = EL.bySym[selA.value];
      state.b = EL.bySym[selB.value];
      state.bond = classify(state.a, state.b);
    }

    function report() {
      pick();
      const { a, b, bond } = state;
      sim.setReadout('endiff', bond.diff.toFixed(2));
      sim.setReadout('type', bond.type);
      sim.setReadout('ena', a.en.toFixed(2));
      sim.setReadout('enb', b.en.toFixed(2));
      if (sim.committed) {
        sim.setStatus(bond.cls === 'ionic-trans' ? 'warn' : 'neutral', bond.type + ' bond');
        note.textContent = describe(a, b, bond);
      } else {
        sim.setStatus('neutral', 'Predict to start');
      }
      sim.setLabel('Two atoms, ' + a.name + ' and ' + b.name + ', and the electrons between them. Bond type: ' + bond.type + '. The electronegativity difference is ' + bond.diff.toFixed(2) + '.');
    }

    // ---- drawing ----
    function nucleus(ctx, env, x, y, r, e) {
      const c = env.colors;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fillStyle = e.kind === 'metal' ? c.paper2 : c.ink;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = c.ink;
      ctx.stroke();
      ctx.fillStyle = e.kind === 'metal' ? c.ink : c.card;
      ctx.font = env.font(Math.max(14, r * 0.7), 'mono', 700);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.sym, x, y + 1);
    }
    function ring(ctx, env, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.lineWidth = 1.5; ctx.strokeStyle = env.colors.shell; ctx.stroke(); }
    function dot(ctx, env, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = env.colors.accent; ctx.fill(); }
    function label(ctx, env, text, x, y, color, size) {
      ctx.font = env.font(size || 12, 'mono', 700);
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);
    }

    function drawSea(ctx, env, k) {
      const c = env.colors;
      const cols = [0.22, 0.5, 0.78], rows = [0.25, 0.5, 0.75];
      rows.forEach((fy) => cols.forEach((fx) => {
        const x = env.w * fx, y = env.h * fy;
        ctx.beginPath(); ctx.arc(x, y, 17 * k, 0, TAU);
        ctx.fillStyle = c.paper2; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = c.inkMute; ctx.stroke();
        label(ctx, env, '+', x, y, c.ink, 14);
      }));
      state.sea.forEach((p) => dot(ctx, env, p.x * env.w, p.y * env.h, 4 * k));
    }

    function drawPair(ctx, env, k, t) {
      const { a, b, bond } = state;
      const c = env.colors;
      const cy = env.h / 2, xA = env.w * 0.3, xB = env.w * 0.7, mid = env.w / 2;
      const r = 26 * k;
      const hiA = a.en >= b.en;
      const lean = Math.min(1, bond.diff / 1.7);          // 0 = centered, 1 = all the way over
      const ionic = bond.cls === 'ionic' || bond.cls === 'ionic-trans';
      let rA = 40 * k, rB = 40 * k;
      if (ionic) { rA = (a.kind === 'metal' ? 22 : 44) * k; rB = (b.kind === 'metal' ? 22 : 44) * k; }
      else { rA = (40 + (hiA ? 6 : -10) * lean) * k; rB = (40 + (hiA ? -10 : 6) * lean) * k; }
      ring(ctx, env, xA, cy, rA);
      ring(ctx, env, xB, cy, rB);

      if (!ionic) {
        // the shared cloud leans toward the atom with the higher EN
        const cx = mid + (hiA ? -1 : 1) * lean * (xB - xA) * 0.2;
        ctx.save();
        ctx.fillStyle = c.accent;
        for (let i = 0; i < 6; i++) {
          ctx.globalAlpha = 0.07;
          ctx.beginPath();
          ctx.ellipse(cx, cy, (74 - i * 9) * k, (40 - i * 5) * k, 0, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
        // two shared electrons trace a figure eight about the cloud centre
        const w = 2.2;
        for (let n = 0; n < 2; n++) {
          const ph = t * w + n * Math.PI;
          dot(ctx, env, cx + 66 * k * Math.sin(ph), cy + 28 * k * Math.sin(2 * ph), 4.5 * k);
        }
        nucleus(ctx, env, xA, cy, r, a);
        nucleus(ctx, env, xB, cy, r, b);
        if (bond.cls === 'polar') {
          label(ctx, env, hiA ? 'δ−' : 'δ+', xA, cy - rA - 14 * k, hiA ? c.accent : c.cool, 14);
          label(ctx, env, hiA ? 'δ+' : 'δ−', xB, cy - rB - 14 * k, hiA ? c.cool : c.accent, 14);
        }
      } else {
        nucleus(ctx, env, xA, cy, r, a);
        nucleus(ctx, env, xB, cy, r, b);
        const metalIsA = a.kind === 'metal';
        const from = metalIsA ? xA : xB, to = metalIsA ? xB : xA;
        const p = (t % CYCLE) / CYCLE;
        let ex, ey;
        if (p < 0.32) { const q = p / 0.32; ex = from + (to - from) * q; ey = cy - 36 * k * Math.sin(q * Math.PI) - 22 * k; }
        else { const th = (p - 0.32) * 18; ex = to + 34 * k * Math.cos(th); ey = cy + 34 * k * Math.sin(th); }
        dot(ctx, env, ex, ey, 4.5 * k);
        const done = p >= 0.3;
        const signA = done ? (metalIsA ? '+' : '−') : 'neutral';
        const signB = done ? (metalIsA ? '−' : '+') : 'neutral';
        label(ctx, env, signA, xA, cy - rA - 14 * k, done ? (signA === '+' ? c.cool : c.accent) : c.inkMute, done ? 16 : 12);
        label(ctx, env, signB, xB, cy - rB - 14 * k, done ? (signB === '+' ? c.cool : c.accent) : c.inkMute, done ? 16 : 12);
      }
      label(ctx, env, 'EN ' + a.en.toFixed(2), xA, cy + 76 * k, c.inkSoft, 12);
      label(ctx, env, 'EN ' + b.en.toFixed(2), xB, cy + 76 * k, c.inkSoft, 12);
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 0.75,
      init() { report(); },
      onUnlock() { report(); },
      update(dt) {
        if (state.bond && state.bond.cls === 'metallic') {
          state.sea.forEach((p) => {
            p.x = (p.x + p.vx * dt + 1) % 1;
            p.y = (p.y + p.vy * dt + 1) % 1;
          });
        }
      },
      draw(ctx, env) {
        if (!state.bond) return;
        const k = Math.min(env.w / 560, env.h / 315);
        if (state.bond.cls === 'metallic') drawSea(ctx, env, k);
        else drawPair(ctx, env, k, env.time);
      },
      preset(name) {
        const parts = name.split('-');
        selA.value = parts[0];
        selB.value = parts[1];
        $$('[data-preset]', box).forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.preset === name)));
        report();
        sim.redraw();
      },
      record() {
        if (!state.a) pick();                 // the helper reads the column names before init runs
        return { 'Element A': state.a.sym, 'Element B': state.b.sym, 'ΔEN': state.bond.diff.toFixed(2), 'Bond type': state.bond.type };
      }
    });

    [selA, selB].forEach((sel) => sel.addEventListener('change', () => {
      $$('[data-preset]', box).forEach((chip) => chip.setAttribute('aria-pressed', 'false'));
      report();
      sim.redraw();
    }));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
