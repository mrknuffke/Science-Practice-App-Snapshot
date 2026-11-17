/* ============================================================
   4-6b LESSON INTERACTIVES
   The blood-buffer simulator: a looping canvas on TB.sim.create (RUNTIME_SPEC 4.3), inside the
   Enrichment block of the lesson and locked until the prediction is committed. Brief:
   docs/plans/textbook-sim-briefs.md, "Chem 4-6b: Blood Buffer".

   Repairs: the same dose (5 mM) goes into blood and into pure water (the old sim took 4.5 mM from
   the blood and added 5 mM to the water, and its mission text said 10 mM); the chosen liquid shows
   by aria-pressed and a class, not by an inline style; the clocks are in seconds, not frames.
   The blood model is the old one: pH = 6.10 + log10([HCO3-] / (0.03 x pCO2)). A dose of strong
   acid uses up its own amount of bicarbonate. Breathing sets the pCO2 the blood relaxes toward.
   The kidneys slowly restore the bicarbonate. Pure water has no buffer: the pH follows the net
   strong acid or base. Both liquids are drawn on one scale, pH 1 to 13, so the size of the swing
   can be compared. Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);

  /* ---- the model ---- */
  const DOSE = 5;                         // mM of strong acid or base, in both liquids
  const HCO3_NORMAL = 24, PCO2_NORMAL = 40, RATE_NORMAL = 14;
  const HCO3_MIN = 4, HCO3_MAX = 45, W_MAX = 20;
  const TAU_RESP = 1.5, TAU_REN = 5;      // seconds for the pCO2 and the bicarbonate to close most of a gap
  const WINDOW = [7.35, 7.45];
  const PH_MIN = 1, PH_MAX = 13;

  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const targetPco2 = (rr) => PCO2_NORMAL * Math.pow(RATE_NORMAL / rr, 0.7);
  const phBlood = (hco3, pco2) => clamp(6.1 + Math.log10(Math.max(2, hco3) / Math.max(0.2, 0.03 * pco2)), 6.6, 8.2);
  function phWater(net) {                 // net strong acid in mM; negative is net base
    if (Math.abs(net) < 1e-9) return 7;
    const p = net > 0 ? -Math.log10(net * 1e-3) : 14 + Math.log10(-net * 1e-3);
    return clamp(p, PH_MIN, PH_MAX);
  }
  function newState() {
    return { liquid: 'blood', rr: RATE_NORMAL, hco3: HCO3_NORMAL, pco2: PCO2_NORMAL, wNet: 0, t: 0, event: null };
  }
  const phNow = (st) => (st.liquid === 'blood' ? phBlood(st.hco3, st.pco2) : phWater(st.wNet));
  // the pH once the breathing has caught up (the bicarbonate, which the kidneys restore slowly, stays as it is)
  const phSettled = (st) => (st.liquid === 'blood' ? phBlood(st.hco3, targetPco2(st.rr)) : phWater(st.wNet));
  function step(st, dt) {
    st.pco2 += (targetPco2(st.rr) - st.pco2) * (1 - Math.exp(-dt / TAU_RESP));
    st.hco3 += (HCO3_NORMAL - st.hco3) * (1 - Math.exp(-dt / TAU_REN));
    st.t += dt;
  }
  function dose(st, kind) {
    const before = phNow(st), sign = kind === 'acid' ? 1 : -1;
    if (st.liquid === 'blood') st.hco3 = clamp(st.hco3 - sign * DOSE, HCO3_MIN, HCO3_MAX);
    else st.wNet = clamp(st.wNet + sign * DOSE, -W_MAX, W_MAX);
    st.event = { liquid: st.liquid, dose: DOSE + ' mM ' + kind, before: before, after: phSettled(st) };
    return st.event;
  }
  function setRate(st, rr) {
    const before = phNow(st);
    st.rr = clamp(rr, 4, 40);
    st.event = { liquid: st.liquid, dose: 'none', before: before, after: phSettled(st) };
    return st.event;
  }
  function setLiquid(st, liquid) {
    if (liquid === st.liquid) return;
    st.liquid = liquid;
    if (liquid === 'water') st.wNet = 0;
    st.event = null;
  }
  const zone = (ph) => (ph < WINDOW[0] ? (ph < 7.2 ? 'alert' : 'warn') : ph > WINDOW[1] ? (ph > 7.6 ? 'alert' : 'warn') : 'ok');
  const windowName = (ph) => (ph < WINDOW[0] ? 'Acidosis' : ph > WINDOW[1] ? 'Alkalosis' : 'Healthy');

  if (window.GC_MODELS) window.GC_MODELS['4-6b'] = { DOSE: DOSE, HCO3_NORMAL: HCO3_NORMAL, PCO2_NORMAL: PCO2_NORMAL, RATE_NORMAL: RATE_NORMAL, HCO3_MIN: HCO3_MIN, HCO3_MAX: HCO3_MAX, W_MAX: W_MAX, TAU_RESP: TAU_RESP, TAU_REN: TAU_REN, WINDOW: WINDOW, targetPco2: targetPco2, phBlood: phBlood, phWater: phWater, newState: newState, phNow: phNow, phSettled: phSettled, step: step, dose: dose, setRate: setRate, setLiquid: setLiquid, zone: zone, windowName: windowName };

  /* ---- the page ---- */
  function init() {
    const box = $('[data-sim="blood"]');
    if (!box || !window.TB) return;
    const chipBlood = $('#btnModeBlood', box), chipWater = $('#btnModeWater', box);
    const rate = $('#respSlider', box);
    const acidBtn = $('#btnAddAcid', box), baseBtn = $('#btnAddBase', box), resetBtn = $('#btnResetHomeo', box);
    const note = $('[data-sim-note]', box);
    const PW = 340, PH = 230, MAX_HIST = 120, SAMPLE_S = 0.25;
    let st = newState(), sim = null, tick = 0, nextSample = 0;
    const hist = [];

    function pushHist(mark) { hist.push({ ph: phNow(st), mark: !!mark }); if (hist.length > MAX_HIST) hist.shift(); }
    function prefill() { hist.length = 0; for (let i = 0; i < MAX_HIST; i++) pushHist(false); nextSample = 0; }

    function report() {
      const ph = phNow(st);
      sim.setReadout('ph', ph.toFixed(2));
      sim.setReadout('liquid', st.liquid === 'blood' ? 'Blood' : 'Pure water');
      sim.setReadout('rate', st.rr + ' a minute');
      sim.setReadout('window', st.liquid === 'blood' ? windowName(ph) : 'No buffer');
      if (!sim.committed) sim.setStatus('neutral', 'Predict to start');
      else if (st.liquid === 'water') sim.setStatus(ph === 7 ? 'neutral' : 'alert', ph === 7 ? 'Pure water, pH 7' : 'The pH swings widely');
      else sim.setStatus(zone(ph), windowName(ph) === 'Healthy' ? 'Inside the healthy window' : windowName(ph));
      sim.setLabel('A pH scale from 1 to 13 and a chart of pH over the last 30 seconds for ' + (st.liquid === 'blood' ? 'buffered blood' : 'pure water') + '. The pH is ' + ph.toFixed(2) + '. The breathing rate is ' + st.rr + ' breaths a minute.');
      rate.disabled = st.liquid !== 'blood';
    }
    function modeUi() {
      const blood = st.liquid === 'blood';
      chipBlood.setAttribute('aria-pressed', String(blood));
      chipWater.setAttribute('aria-pressed', String(!blood));
    }
    function sentence() {
      const e = st.event;
      if (!e) return st.liquid === 'blood' ? 'Buffered blood holds a weak acid and its conjugate base. Add acid or base, or change the breathing rate.' : 'Pure water has no buffer. Add acid or base and watch the pH.';
      if (e.dose === 'none') return 'The breathing rate changed the CO₂ in the blood. The pH moves from ' + e.before.toFixed(2) + ' toward ' + e.after.toFixed(2) + '.';
      return 'You added ' + e.dose + ' to ' + (e.liquid === 'blood' ? 'the blood' : 'pure water') + '. The pH went from ' + e.before.toFixed(2) + ' to ' + e.after.toFixed(2) + '.' + (e.liquid === 'blood' ? ' The kidneys then restore the bicarbonate, so the pH creeps back.' : '');
    }

    /* ---- drawing ---- */
    const GX0 = 26, GX1 = PW - 14;
    const gxPh = (p) => GX0 + ((p - PH_MIN) / (PH_MAX - PH_MIN)) * (GX1 - GX0);
    const CX0 = 40, CX1 = PW - 12, CY0 = PH - 36, CY1 = 92;
    const cyPh = (p) => CY0 - ((clamp(p, PH_MIN, PH_MAX) - PH_MIN) / (PH_MAX - PH_MIN)) * (CY0 - CY1);
    function drawScale(ctx, env, fs) {
      const c = env.colors, ph = phNow(st), ty = 44;
      ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 0.5, PW - 1, 80, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = c.hair; ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(GX0, ty - 4, GX1 - GX0, 8, 4); ctx.fill(); ctx.stroke();
      // the healthy window, wide enough to see
      const wx = gxPh(7.4);
      ctx.fillStyle = c.good; ctx.fillRect(wx - 4, ty - 8, 8, 16);
      ctx.fillStyle = c.inkSoft; ctx.font = env.font(fs, 'mono', 400); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      [1, 3, 5, 7, 9, 11, 13].forEach((p) => ctx.fillText(String(p), gxPh(p), ty + 14));
      ctx.font = env.font(fs, 'display', 700); ctx.textBaseline = 'bottom'; ctx.fillStyle = c.good;
      ctx.fillText('Healthy window', wx, ty - 12);
      // the marker
      const mx = gxPh(ph);
      ctx.strokeStyle = c.paper; ctx.fillStyle = c.accent; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(mx, ty, 6.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    function drawChart(ctx, env, fs) {
      const c = env.colors;
      ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 86.5, PW - 1, PH - 87, 6); ctx.fill(); ctx.stroke();
      const gx = (i) => CX0 + (i / (MAX_HIST - 1)) * (CX1 - CX0);
      // the healthy band
      ctx.fillStyle = c.good; ctx.globalAlpha = 0.35;
      const by = cyPh(WINDOW[1]), bh = Math.max(5, cyPh(WINDOW[0]) - cyPh(WINDOW[1]));
      ctx.fillRect(CX0, by - (bh - (cyPh(WINDOW[0]) - cyPh(WINDOW[1]))) / 2, CX1 - CX0, bh); ctx.globalAlpha = 1;
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(CX0, CY1 - 6); ctx.lineTo(CX0, CY0); ctx.lineTo(CX1, CY0); ctx.stroke();
      ctx.fillStyle = c.inkSoft; ctx.font = env.font(fs, 'mono', 400); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      [1, 7, 13].forEach((p) => {
        if (p > 1) { ctx.strokeStyle = c.hair; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(CX0, cyPh(p)); ctx.lineTo(CX1, cyPh(p)); ctx.stroke(); }
        ctx.fillText(String(p), CX0 - 6, cyPh(p));
      });
      ctx.font = env.font(fs, 'display', 400); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('The last 30 s →', (CX0 + CX1) / 2, CY0 + 6);
      ctx.save(); ctx.translate(12, (CY0 + CY1) / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = 'middle';
      ctx.fillText('pH', 0, 0); ctx.restore();
      hist.forEach((h, i) => {
        if (!h.mark) return;
        ctx.strokeStyle = c.inkMute; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(gx(i), CY1 - 4); ctx.lineTo(gx(i), CY0); ctx.stroke(); ctx.setLineDash([]);
      });
      ctx.strokeStyle = c.accent; ctx.lineWidth = 3; ctx.lineJoin = 'round';
      ctx.beginPath();
      hist.forEach((h, i) => { if (i) ctx.lineTo(gx(i), cyPh(h.ph)); else ctx.moveTo(gx(i), cyPh(h.ph)); });
      ctx.stroke();
    }
    function draw(ctx, env) {
      const k = Math.min(env.w / PW, env.h / PH);
      const fs = Math.max(12, 12 / k);
      ctx.save();
      ctx.translate((env.w - PW * k) / 2, (env.h - PH * k) / 2);
      ctx.scale(k, k);
      drawScale(ctx, env, fs);
      drawChart(ctx, env, fs);
      ctx.restore();
    }

    function startOver(liquid, rr) {
      st = newState();
      if (liquid) st.liquid = liquid;
      if (rr) st.rr = rr;
      rate.value = String(st.rr);
      rate.dispatchEvent(new Event('input'));
      modeUi();
      prefill();
      note.textContent = sentence();
      report();
      sim.redraw();
    }
    function event(ev) {
      pushHist(true);
      note.textContent = sentence();
      report();
      sim.redraw();
    }

    prefill();
    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 3,         // two presses carry the breathing, three the kidneys, most of the way
      init() { note.textContent = sentence(); report(); },
      onUnlock() { note.textContent = sentence(); report(); },
      update(dt) {
        step(st, dt);
        nextSample += dt;
        while (nextSample >= SAMPLE_S) { nextSample -= SAMPLE_S; pushHist(false); }
        if (++tick % 6 === 0) report();
      },
      draw: draw,
      preset(name) {
        if (name === 'blood') startOver('blood', RATE_NORMAL);
        else if (name === 'water') startOver('water', RATE_NORMAL);
        else if (name === 'fast') { startOver('blood', RATE_NORMAL); setRate(st, 36); rate.value = '36'; rate.dispatchEvent(new Event('input')); event(); }
      },
      record() {
        const e = st.event;
        return {
          'Liquid': st.liquid === 'blood' ? 'Blood' : 'Pure water',
          'Breathing (a minute)': st.liquid === 'blood' ? st.rr : 'n/a',
          'Change': e ? (e.dose === 'none' ? 'Breathing rate' : e.dose) : 'none yet',
          'pH before': e ? e.before.toFixed(2) : '–',
          'pH after': e ? e.after.toFixed(2) : '–'
        };
      }
    });

    chipBlood.addEventListener('click', () => { if (st.liquid === 'blood') return; setLiquid(st, 'blood'); modeUi(); pushHist(true); note.textContent = sentence(); report(); });
    chipWater.addEventListener('click', () => { if (st.liquid === 'water') return; setLiquid(st, 'water'); modeUi(); pushHist(true); note.textContent = sentence(); report(); });
    rate.addEventListener('input', () => {
      if (!sim || !sim.committed || Number(rate.value) === st.rr) return;
      setRate(st, Number(rate.value));
      event();
    });
    acidBtn.addEventListener('click', () => { dose(st, 'acid'); event(); });
    baseBtn.addEventListener('click', () => { dose(st, 'base'); event(); });
    resetBtn.addEventListener('click', () => startOver('blood', RATE_NORMAL));
    modeUi();
    report();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
