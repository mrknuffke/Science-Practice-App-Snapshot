/* ============================================================
   GEN CHEM: BOHR DIAGRAM RENDERER (canvas)
   One drawing of an atom, shared by the 1-1a and 1-1b simulations.
   The caller owns the model and the clock; this file only draws.
   Colours come from the tokens the sim helper resolved (env.colors), so a
   theme change redraws correctly. No colour literals here.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  // shell radii in a 340-unit design box; scale maps that box onto the stage
  const RADII = [38, 74, 110, 146];

  /* a = { cx, cy, scale, shells: [2, 8, 7], z, rot, radii?, nucleusR?, valenceShell? }
     valenceShell is the index of the shell whose electrons are drawn in the accent colour, or -1. */
  function draw(ctx, env, a) {
    const c = env.colors;
    const k = a.scale;
    const radii = a.radii || RADII.map((r) => r * k);
    const dot = Math.max(3.5, 5 * k);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = c.shell;
    a.shells.forEach((_, i) => {
      ctx.beginPath();
      ctx.arc(a.cx, a.cy, radii[i], 0, TAU);
      ctx.stroke();
    });

    a.shells.forEach((count, i) => {
      ctx.fillStyle = i === a.valenceShell ? c.accent : c.inkMute;
      for (let n = 0; n < count; n++) {
        const ang = (TAU / count) * n - Math.PI / 2 + a.rot / (i + 1);
        ctx.beginPath();
        ctx.arc(a.cx + radii[i] * Math.cos(ang), a.cy + radii[i] * Math.sin(ang), dot, 0, TAU);
        ctx.fill();
      }
    });

    const nr = a.nucleusR || 20 * k;
    ctx.beginPath();
    ctx.arc(a.cx, a.cy, nr, 0, TAU);
    ctx.fillStyle = c.card;
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = c.ink;
    ctx.stroke();
    ctx.fillStyle = c.ink;
    ctx.font = env.font(Math.max(12, 12 * k), 'mono', 700);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(a.z + '+', a.cx, a.cy + 1);
  }

  /* "Na" + 1 + '+' gives Na⁺ ; "Al" + 3 + '+' gives Al³⁺ ; "Cl" + 1 + '-' gives Cl⁻ */
  const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  function ion(sym, n, sign) {
    const digits = n > 1 ? String(n).split('').map((d) => SUP[d]).join('') : '';
    return sym + digits + (sign === '+' ? '⁺' : '⁻');
  }

  window.GC_BOHR = { RADII: RADII, draw: draw, ion: ion };
})();
