/* ============================================================
   5-4a LESSON INTERACTIVES
   Radiation and matter: a looping canvas on TB.sim.create (RUNTIME_SPEC 4.3), locked until the
   prediction is committed. REPAIR, core with an Enrichment view. Brief: docs/plans/textbook-sim-briefs.md,
   "Chem 5-4a: Radiation and Matter".

   What the old sim did wrong and this one fixes: the power slider mixed unrelated cases (a 0.001 W
   dental pulse up to a 10,000 W mast) and changed only the photon count; the animation moved a fixed
   distance every frame; colours were hex; status text was in capitals and said "physically
   impossible". Now one brightness control means one thing: photons each second, 1 to 16. It never
   changes the energy of a photon, so it never changes the effect on the target.

   The core view shows photon energy as a rank from 1 (radio) to 7 (gamma) on a bar, with the
   bond-breaking level between visible light and ultraviolet. The Enrichment chip swaps the rank for
   the energy in eV (the seven example photons of the lesson table). Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);

  /* ---- the model ---- */
  const BANDS = [
    { name: 'Radio waves', ev: '4.1 × 10⁻⁹ eV', wave: 30 },
    { name: 'Microwaves', ev: '1.0 × 10⁻⁵ eV', wave: 23 },
    { name: 'Infrared', ev: '0.124 eV', wave: 17 },
    { name: 'Visible light', ev: '2.25 eV', wave: 12 },
    { name: 'Ultraviolet', ev: '4.13 eV', wave: 8 },
    { name: 'X-rays', ev: '12,400 eV', wave: 5 },
    { name: 'Gamma rays', ev: '1,240,000 eV', wave: 3.5 }
  ];
  const TARGETS = ['Water', 'Carbon dioxide', 'A hydrogen atom', 'DNA'];
  const FIRST_IONIZING = 4;                       // ultraviolet and above can break a bond
  const NONE = 'No effect', THROUGH = 'Passes through';
  // what one photon of each band does to each target (rows: band 0 to 6; columns: target)
  const EFFECT = [
    [NONE, NONE, NONE, NONE],
    ['Molecule rotates: heat', NONE, NONE, 'Warms a little'],
    ['Bonds vibrate: heat', 'Bonds stretch and bend', NONE, 'Bonds vibrate: heat'],
    [THROUGH, THROUGH, 'Electron moves up', THROUGH],
    ['A bond can break', 'A bond can break', 'Electron can leave', 'DNA bond breaks'],
    ['A bond breaks', 'A bond breaks', 'Electron leaves', 'DNA bond breaks'],
    ['A bond breaks', 'A bond breaks', 'Electron leaves', 'DNA bond breaks']
  ];
  const DEFAULTS = { band: 4, bright: 3, target: 3, ev: false };   // slider values: band 4 of 7 is visible light, brightness 3, DNA
  const SPEED = 170;                              // design units a second
  const photonsEach = (b) => Math.pow(2, b - 1);   // brightness 1 to 5 is 1, 2, 4, 8, 16 photons each second
  const breaks = (band) => band >= FIRST_IONIZING;
  const brokenEachSecond = (band, bright) => (breaks(band) ? photonsEach(bright) : 0);
  const effect = (band, target) => EFFECT[band][target];

  if (window.GC_MODELS) window.GC_MODELS['5-4a'] = { BANDS: BANDS, TARGETS: TARGETS, FIRST_IONIZING: FIRST_IONIZING, EFFECT: EFFECT, DEFAULTS: DEFAULTS, photonsEach: photonsEach, brokenEachSecond: brokenEachSecond, effect: effect };

  /* ---- the page ---- */
  function init() {
    const box = $('[data-sim="radiation"]');
    if (!box || !window.TB) return;
    const sBand = $('#radBand', box), sBright = $('#radBright', box), btnEV = $('#btnEV', box), resetBtn = $('#btnRadReset', box);
    const tBtns = [].slice.call(box.querySelectorAll('[data-target]'));
    const note = $('[data-sim-note]', box);
    const W = 340, H = 220, TX = 250, TY = 110, SRC = 40;
    let band = DEFAULTS.band, bright = DEFAULTS.bright, target = DEFAULTS.target, evOn = DEFAULTS.ev;
    let sim = null;
    let packets = [];
    let spawn = 0;

    const band0 = () => band - 1;                  // the slider counts from 1
    const energyText = () => (evOn ? BANDS[band0()].ev : band + ' of 7');

    function fill() {
      // the first frame shows the model at work: packets already on their way
      packets = [];
      const gap = SPEED / photonsEach(bright);
      for (let x = SRC + gap * 0.5; x < TX - 30; x += gap) packets.push(x);
      spawn = 0;
    }
    function report() {
      const b = band0();
      sim.setReadout('band', b === 4 ? 'UV light' : BANDS[b].name);   // 'Ultraviolet' is too long for a readout tile
      sim.setReadout('energy', energyText());
      sim.setReadout('photons', String(photonsEach(bright)));
      sim.setReadout('effect', effect(b, target));
      sim.setReadout('broken', String(brokenEachSecond(b, bright)));
      if (!sim.committed) sim.setStatus('neutral', 'Predict to start');
      else if (breaks(b)) sim.setStatus('alert', 'Bonds can break');
      else sim.setStatus('ok', 'Bonds stay whole');
      sim.setLabel(photonsEach(bright) + ' photons each second of ' + BANDS[b].name.toLowerCase() + ' travel from a source to a ' + TARGETS[target].toLowerCase() + ' target, beside a bar of photon energy from low to high. ' + effect(b, target) + '. ' + brokenEachSecond(b, bright) + ' bonds break each second.');
      btnEV.setAttribute('aria-pressed', String(evOn));
      tBtns.forEach((el) => el.setAttribute('aria-pressed', String(Number(el.dataset.target) === target)));
    }
    function sentence() {
      if (!sim.committed) return 'The explanation appears after you predict.';
      const b = band0();
      if (breaks(b)) return 'Each ' + BANDS[b].name.toLowerCase().replace(/s$/, '') + ' photon carries enough energy to break a bond. More photons break more bonds, but each photon works alone.';
      return 'Each photon of ' + BANDS[b].name.toLowerCase() + ' is below the bond-breaking level. More photons do not change that, because the photons cannot add their energy together.';
    }
    function refresh() { note.textContent = sentence(); report(); sim.redraw(); }

    /* ---- drawing ---- */
    function bandColor(c, b) { return b >= FIRST_IONIZING ? c.accent : c.cool; }
    function drawPhoton(ctx, c, x, y, b) {
      const w = BANDS[b].wave, len = 5 * w > 44 ? 44 : 5 * w < 16 ? 16 : 5 * w;
      ctx.strokeStyle = bandColor(c, b); ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let k = 0; k <= len; k += 1) {
        const px = x - len + k, py = y + Math.sin((k / w) * Math.PI * 2) * 6;
        if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.stroke();
    }
    function ball(ctx, x, y, r, fill, stroke) {
      ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    function drawTarget(ctx, c, env) {
      const b = band0(), t = env.time;
      ctx.save(); ctx.translate(TX, TY);
      if (target === 0) {                                              // water
        ctx.rotate(b === 1 ? Math.sin(t * 5) * 0.6 : 0);
        ball(ctx, 0, -6, 15, c.cool, c.ink);
        ball(ctx, -17, 12, 9, c.card, c.ink); ball(ctx, 17, 12, 9, c.card, c.ink);
      } else if (target === 1) {                                       // carbon dioxide
        const d = b === 2 ? Math.sin(t * 9) * 7 : 0;
        ball(ctx, 0, 0, 13, c.ink, c.ink);
        ball(ctx, -34 - d, 0, 12, c.cool, c.ink); ball(ctx, 34 + d, 0, 12, c.cool, c.ink);
      } else if (target === 2) {                                       // a hydrogen atom
        ctx.strokeStyle = c.inkMute; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 56, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ball(ctx, 0, 0, 8, c.accent, c.ink);
        const r = b === 3 ? (Math.sin(t * 2.5) > 0 ? 56 : 28) : b >= FIRST_IONIZING ? 56 + ((t * 40) % 40) : 28;
        ball(ctx, Math.cos(t * 2.2) * r, Math.sin(t * 2.2) * r, 5, c.cool, c.ink);
      } else {                                                         // DNA
        const wob = (y) => Math.sin(y * 0.09 + t * 0.6) * 14;
        ctx.strokeStyle = c.ink; ctx.lineWidth = 1.8;
        for (let y = -48; y <= 48; y += 16) {
          const broken = breaks(b) && (y === 0 || y === 16);
          ctx.strokeStyle = broken ? c.accent : c.ink; ctx.lineWidth = broken ? 2.5 : 1.8;
          ctx.beginPath();
          if (broken) { ctx.moveTo(-wob(y), y); ctx.lineTo(-3, y + 3); ctx.moveTo(3, y - 3); ctx.lineTo(wob(y), y); }
          else { ctx.moveTo(-wob(y), y); ctx.lineTo(wob(y), y); }
          ctx.stroke();
        }
        [-1, 1].forEach((side) => {
          ctx.strokeStyle = breaks(b) ? c.accent : c.ink; ctx.lineWidth = 3;
          ctx.beginPath();
          for (let y = -62; y <= 62; y += 4) { const x = side * wob(y); if (y === -62) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
          ctx.stroke();
        });
      }
      ctx.restore();
    }
    function drawScene(ctx, env) {
      const c = env.colors, b = band0();
      ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 0.5, W - 1, H - 1, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = c.inkSoft; ctx.beginPath(); ctx.roundRect(12, 84, 28, 52, 4); ctx.fill();
      packets.forEach((x) => drawPhoton(ctx, c, x, TY, b));
      drawTarget(ctx, c, env);
    }
    // the energy bar: a column that rises with the band, and the bond-breaking level
    const BX0 = 118, BX1 = 156, BY0 = 202, BY1 = 18, ROW = (BY0 - BY1) / 7;
    function drawBar(ctx, env, fs) {
      const c = env.colors, b = band0();
      ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 0.5, W - 1, H - 1, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = c.paper; ctx.strokeStyle = c.inkMute; ctx.lineWidth = 1.5;
      ctx.fillRect(BX0, BY1, BX1 - BX0, BY0 - BY1); ctx.strokeRect(BX0, BY1, BX1 - BX0, BY0 - BY1);
      const top = BY0 - (b + 1) * ROW;
      ctx.fillStyle = bandColor(c, b); ctx.globalAlpha = 0.85;
      ctx.fillRect(BX0 + 1, top, BX1 - BX0 - 2, BY0 - top - 1); ctx.globalAlpha = 1;
      ctx.font = env.font(fs, 'display', 400); ctx.textBaseline = 'middle';
      BANDS.forEach((bd, i) => {
        const y = BY0 - (i + 0.5) * ROW;
        ctx.fillStyle = i === b ? c.ink : c.inkSoft; ctx.font = env.font(fs, 'display', i === b ? 700 : 400);
        ctx.textAlign = 'right'; ctx.fillText(bd.name.replace(' waves', '').replace(' light', '').replace(' rays', ''), BX0 - 8, y);
        if (evOn) { ctx.font = env.font(fs, 'mono', i === b ? 700 : 400); ctx.textAlign = 'left'; ctx.fillText(bd.ev, BX1 + 8, y); }
      });
      const ly = BY0 - FIRST_IONIZING * ROW;
      ctx.strokeStyle = c.ink; ctx.lineWidth = 2; ctx.setLineDash([5, 3]);
      ctx.beginPath(); ctx.moveTo(BX0 - 6, ly); ctx.lineTo(BX1 + 6, ly); ctx.stroke(); ctx.setLineDash([]);
      if (!evOn) { ctx.fillStyle = c.ink; ctx.font = env.font(fs, 'display', 700); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Bond-breaking', BX1 + 12, ly - 8); ctx.fillText('level', BX1 + 12, ly + 8); }
      ctx.fillStyle = c.inkSoft; ctx.font = env.font(fs, 'display', 400); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('Photon energy ↑', (BX0 + BX1) / 2, 2);
    }
    function draw(ctx, env) {
      const wide = env.w / env.h > 1.6;
      const dw = wide ? 2 * W + 20 : W, dh = wide ? H : 2 * H + 16;
      const k = Math.min(env.w / dw, env.h / dh);
      const fs = Math.max(12, 12 / k);
      ctx.save();
      ctx.translate((env.w - dw * k) / 2, (env.h - dh * k) / 2);
      ctx.scale(k, k);
      drawScene(ctx, env);
      ctx.translate(wide ? W + 20 : 0, wide ? 0 : H + 16);
      drawBar(ctx, env, fs);
      ctx.restore();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      init() { fill(); note.textContent = sentence(); report(); },
      onUnlock() { note.textContent = sentence(); report(); },
      update(dt) {
        const gap = SPEED / photonsEach(bright);
        packets = packets.map((x) => x + SPEED * dt).filter((x) => x < TX - 24);
        spawn += SPEED * dt;
        while (spawn >= gap) { spawn -= gap; packets.push(SRC + spawn); }
      },
      draw: draw,
      preset(name) {
        const p = { radio: [1, 5, 3], xray: [6, 1, 3], visible: [4, 3, 3], uv: [5, 3, 3] }[name];
        if (!p) return;
        sBand.value = String(p[0]); sBright.value = String(p[1]); target = p[2];
        sBand.dispatchEvent(new Event('input')); sBright.dispatchEvent(new Event('input'));
        band = p[0]; bright = p[1];
        fill(); refresh();
      },
      record() {
        return {
          'Band': BANDS[band0()].name,
          'Target': TARGETS[target],
          'Photons each second': photonsEach(bright),
          'Photon energy': energyText(),
          'Effect on the target': effect(band0(), target)
        };
      }
    });

    sBand.addEventListener('input', () => { band = Number(sBand.value); refresh(); });
    sBright.addEventListener('input', () => { bright = Number(sBright.value); fill(); refresh(); });
    tBtns.forEach((el) => el.addEventListener('click', () => { target = Number(el.dataset.target); refresh(); }));
    btnEV.addEventListener('click', () => { evOn = !evOn; refresh(); });
    resetBtn.addEventListener('click', () => {
      band = DEFAULTS.band; bright = DEFAULTS.bright; target = DEFAULTS.target; evOn = DEFAULTS.ev;
      sBand.value = String(band); sBright.value = String(bright);
      sBand.dispatchEvent(new Event('input')); sBright.dispatchEvent(new Event('input'));
      fill(); refresh();
    });
    report();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
