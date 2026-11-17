/* ============================================================
   5-2a LESSON INTERACTIVES
   The redshift analyzer: an svg tool that redraws only on input (TB.sim.create, kind 'svg',
   loop false), locked until the prediction is committed. This tool has no sim brief, so it follows
   the component catalogue (docs/plans/textbook-rewrite-plan.md, 6.2 and the "Chem building tools"
   note in the sim briefs).

   What it replaces: a slider from 0 to 12 billion light-years that gave a redshift of
   0.07 d + 0.009 d squared ("cosmic acceleration"), which disagreed with the lesson (Hubble's law
   is a straight line), with the lesson's own example (2 billion light-years) and with its preset
   labels; a second view with the composition bars and the 2.725 K curve, which the page now shows
   as a table, a figure and text; and mission cards.

   One rule now: the redshift is z = 0.07 per billion light-years (Hubble's law with
   H0 = 70 km/s per Mpc, the value in the Enrichment block), and a line's observed wavelength is
   the laboratory wavelength times (1 + z). The slider stops at 6 billion light-years, where that
   straight line still holds. Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);

  /* ---- the model ---- */
  const Z_PER_GLY = 0.07;
  const LINES = [{ name: 'Hδ', rest: 410.2 }, { name: 'Hγ', rest: 434.0 }, { name: 'Hβ', rest: 486.1 }, { name: 'Hα', rest: 656.3 }];
  const WIN = { lo: 380, hi: 780 };            // the visible window, in nm
  const DEFAULTS = { d: 0 };
  const redshift = (d) => Z_PER_GLY * d;
  const observed = (rest, d) => rest * (1 + redshift(d));
  const shift = (rest, d) => observed(rest, d) - rest;
  const inWindow = (nm) => nm >= WIN.lo && nm <= WIN.hi;

  if (window.GC_MODELS) window.GC_MODELS['5-2a'] = { Z_PER_GLY: Z_PER_GLY, LINES: LINES, WIN: WIN, DEFAULTS: DEFAULTS, redshift: redshift, observed: observed, shift: shift, inWindow: inWindow };

  /* ---- the page ---- */
  function init() {
    const box = $('[data-sim="redshift"]');
    if (!box || !window.TB) return;
    const slider = $('#rsDist', box), resetBtn = $('#btnRsReset', box);
    const note = $('[data-sim-note]', box);
    const DW = 560, DH = 200, X0 = 20, X1 = 540;
    let sim = null, last = '';
    const dist = () => Number(slider.value);
    const ha = LINES[3];
    const xOf = (nm) => X0 + ((nm - WIN.lo) / (WIN.hi - WIN.lo)) * (X1 - X0);

    function report() {
      const d = dist(), obs = observed(ha.rest, d);
      sim.setReadout('dist', d.toFixed(1));
      sim.setReadout('ha', Math.round(obs) + ' nm');
      sim.setReadout('shift', (d === 0 ? '0' : '+' + Math.round(shift(ha.rest, d))) + ' nm');
      sim.setReadout('where', inWindow(obs) ? 'Red' : 'Infrared');
      if (!sim.committed) sim.setStatus('neutral', 'Predict to start');
      else if (d === 0) sim.setStatus('ok', 'No shift: the same as the laboratory');
      else if (inWindow(obs)) sim.setStatus('warn', 'Lines shifted toward red');
      else sim.setStatus('warn', 'H-alpha has left the visible range');
      sim.setLabel('Two spectra of hydrogen lines. The laboratory spectrum has its red line at 656 nanometers. The spectrum of a galaxy ' + d.toFixed(1) + ' billion light-years away has it at ' + Math.round(obs) + ' nanometers.');
    }
    function sentence() {
      if (!sim.committed) return 'The explanation appears after you predict.';
      const d = dist();
      if (d === 0) return 'A nearby star shows no shift. Its hydrogen lines sit where they do in the laboratory. Move the slider to a far galaxy.';
      return 'Space has stretched the light on its way here, so every line sits at a longer wavelength. The farther the galaxy, the more the light has been stretched.';
    }
    function refresh() { note.textContent = sentence(); report(); sim.redraw(); }

    function draw(svg, env) {
      const k = Math.min(env.w / DW, env.h / DH);
      const fs = Math.max(12, 12 / k).toFixed(2);
      const ox = (env.w - DW * k) / 2, oy = (env.h - DH * k) / 2;
      const d = dist();
      let h = '<defs><linearGradient id="rsGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="var(--cool)"/><stop offset="35%" stop-color="var(--good)"/><stop offset="70%" stop-color="var(--warn)"/><stop offset="100%" stop-color="var(--accent)"/></linearGradient></defs>';
      h += '<g font-family="var(--display)" transform="translate(' + ox.toFixed(1) + ',' + oy.toFixed(1) + ') scale(' + k.toFixed(4) + ')">';
      h += '<text x="' + X0 + '" y="22" font-size="' + fs + '" font-weight="700" fill="var(--ink)">Laboratory</text>';
      h += '<rect x="' + X0 + '" y="30" width="' + (X1 - X0) + '" height="30" fill="url(#rsGrad)" stroke="var(--ink)" stroke-width="1"/>';
      LINES.forEach((l) => { const x = xOf(l.rest).toFixed(1); h += '<line x1="' + x + '" y1="30" x2="' + x + '" y2="60" stroke="var(--ink)" stroke-width="' + (l === ha ? 3.5 : 2.5) + '"/>'; });
      h += '<text x="' + xOf(ha.rest).toFixed(1) + '" y="78" font-size="' + fs + '" font-family="var(--mono)" font-weight="700" fill="var(--ink)" text-anchor="middle">' + Math.round(ha.rest) + ' nm</text>';
      h += '<text x="' + X0 + '" y="116" font-size="' + fs + '" font-weight="700" fill="var(--accent)">' + (d === 0 ? 'Nearby star' : 'Distant galaxy') + '</text>';
      h += '<rect x="' + X0 + '" y="124" width="' + (X1 - X0) + '" height="30" fill="url(#rsGrad)" stroke="var(--ink)" stroke-width="1"/>';
      LINES.forEach((l) => {
        const o = observed(l.rest, d);
        if (!inWindow(o)) return;
        const xo = xOf(o).toFixed(1), xr = xOf(l.rest).toFixed(1);
        if (d > 0) h += '<line x1="' + xr + '" y1="60" x2="' + xo + '" y2="124" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="3 3"/>';
        h += '<line x1="' + xo + '" y1="124" x2="' + xo + '" y2="154" stroke="var(--ink)" stroke-width="' + (l === ha ? 3.5 : 2.5) + '"/>';
      });
      const oh = observed(ha.rest, d);
      if (inWindow(oh)) h += '<text x="' + xOf(oh).toFixed(1) + '" y="172" font-size="' + fs + '" font-family="var(--mono)" font-weight="700" fill="var(--accent)" text-anchor="middle">' + Math.round(oh) + ' nm</text>';
      else h += '<text x="' + X1 + '" y="172" font-size="' + fs + '" font-weight="700" fill="var(--accent)" text-anchor="end">Hα: infrared →</text>';
      h += '</g>';
      if (h !== last) { svg.innerHTML = h; last = h; }
    }

    sim = window.TB.sim.create(box, {
      kind: 'svg',
      loop: false,
      init() { note.textContent = sentence(); report(); },
      onUnlock() { note.textContent = sentence(); report(); },
      draw: draw,
      preset(name) {
        const v = { d1: 1, d3: 3, d5: 5 }[name];
        if (v === undefined) return;
        slider.value = String(v);
        slider.dispatchEvent(new Event('input'));
        refresh();
      },
      record() {
        const d = dist();
        return { 'Distance (billion light-years)': d.toFixed(1), 'Hα line (nm)': Math.round(observed(ha.rest, d)), 'Shift (nm)': d === 0 ? 0 : '+' + Math.round(shift(ha.rest, d)) };
      }
    });
    slider.addEventListener('input', refresh);
    resetBtn.addEventListener('click', () => { slider.value = String(DEFAULTS.d); slider.dispatchEvent(new Event('input')); refresh(); });
    report();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
