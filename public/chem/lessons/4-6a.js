/* ============================================================
   4-6a LESSON INTERACTIVES
   The equilibrium chamber: a looping canvas on TB.sim.create (RUNTIME_SPEC 4.3), locked until the
   prediction is committed. REDESIGN. Brief: docs/plans/textbook-sim-briefs.md, "Chem 4-6a:
   Equilibrium Chamber".

   The old chamber used a forward rate that was not mass action (N2 x min(H2, 4) x P/200, with the
   hydrogen term cut off at 4) and a reverse rate of NH3 squared, and it showed an equilibrium
   constant written for a different expression, so the mixture never settled where its own
   constant said. It also drew 8 particles for each unit of N2 and H2 and 10 for each unit of NH3.

   Here one rate law runs in both directions:
       N2 + 3 H2 <=> 2 NH3     forward  kf [N2][H2]^3      reverse  kr [NH3]^2
   Both rate constants follow the Arrhenius form. The reverse barrier is the forward barrier plus
   the 92.4 kJ/mol the reaction releases, so the ratio kf/kr falls as the temperature rises (heat is
   a product) and the system settles where its own constant says. The vessel starts at its
   equilibrium. One particle stands for one molecule of every substance. The student makes one
   change at a time; the controls lock until the system settles, and the clock stops on that mark
   (sim.hold()). No equilibrium constant and no concentration appears in the page.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);

  /* ---- the model: amounts are numbers of molecules ---- */
  const R_GAS = 8.314, T_REF = 723.15;                 // 450 degrees C
  const DH = 92400, EA_F = 20000;                      // J/mol: energy released, forward barrier
  const START = { N2: 9, H2: 27, NH3: 10 };            // the starting equilibrium
  const RATE_EQ = 1.2;                                 // reactions a second in each direction at that equilibrium
  const KF0 = RATE_EQ / (START.N2 * Math.pow(START.H2, 3));
  const KR0 = RATE_EQ / (START.NH3 * START.NH3);
  const T_START = 450, P_START = 200;                  // degrees C, atm
  const T_MIN = 350, T_MAX = 550, P_MIN = 100, P_MAX = 400;
  const ADD = { N2: 5, H2: 15 }, REMOVE = 5, N2_CAP = 20;
  const CALM_RATIO = 0.04, CALM_S = 1;                 // settled when the net rate stays under 4% of the forward rate for 1 s
  const CHANGES = ['add', 'remove', 'heat', 'cool', 'compress', 'expand'];

  const kelvin = (c) => c + 273.15;
  const volumeOf = (P) => P_START / P;                 // a piston: twice the pressure, half the volume
  function constants(T) {
    const x = 1 / kelvin(T) - 1 / T_REF;
    return { kf: KF0 * Math.exp(-(EA_F / R_GAS) * x), kr: KR0 * Math.exp(-((EA_F + DH) / R_GAS) * x) };
  }
  // reactions a second in each direction (extent of reaction, so N2 changes by 1 and H2 by 3 for each)
  function rates(st) {
    const c = constants(st.T), V = volumeOf(st.P), n = st.n;
    return { f: c.kf * n.N2 * Math.pow(n.H2, 3) / Math.pow(V, 3), r: c.kr * n.NH3 * n.NH3 / V };
  }
  function newState() {
    return { n: { N2: START.N2, H2: START.H2, NH3: START.NH3 }, T: T_START, P: P_START, t: 0, calm: 0, phase: 'steady', change: '', shift: '', before: START.NH3, after: START.NH3, settledNH3: START.NH3 };
  }
  const label = { add: 'Add N₂ and H₂', remove: 'Remove NH₃', heat: 'Heat by 50 °C', cool: 'Cool by 50 °C', compress: 'Compress', expand: 'Expand' };
  function allowed(st, name) {
    switch (name) {
      case 'add': return st.n.N2 + ADD.N2 <= N2_CAP;
      case 'remove': return st.n.NH3 >= 2;
      case 'heat': return st.T + 50 <= T_MAX;
      case 'cool': return st.T - 50 >= T_MIN;
      case 'compress': return st.P * 2 <= P_MAX;
      case 'expand': return st.P / 2 >= P_MIN;
      default: return false;
    }
  }
  // One change. Returns false if it is not allowed or the system is still shifting.
  function applyChange(st, name) {
    if (st.phase === 'shifting' || !allowed(st, name)) return false;
    st.before = Math.round(st.n.NH3);
    if (name === 'add') { st.n.N2 += ADD.N2; st.n.H2 += ADD.H2; }
    else if (name === 'remove') st.n.NH3 -= Math.min(REMOVE, st.n.NH3);
    else if (name === 'heat') st.T += 50;
    else if (name === 'cool') st.T -= 50;
    else if (name === 'compress') st.P *= 2;
    else if (name === 'expand') st.P /= 2;
    const q = rates(st);
    st.change = name;
    st.shift = q.f > q.r * 1.02 ? 'right' : q.r > q.f * 1.02 ? 'left' : 'none';
    st.after = Math.round(st.n.NH3);
    st.phase = 'shifting';
    st.calm = 0;
    return true;
  }
  function step(st, dt) {
    const q = rates(st), net = q.f - q.r;
    // the extent this step, kept from taking more than is there
    let x = net * dt;
    x = Math.min(x, st.n.N2, st.n.H2 / 3);
    x = Math.max(x, -st.n.NH3 / 2);
    st.n.N2 -= x; st.n.H2 -= 3 * x; st.n.NH3 += 2 * x;
    st.t += dt;
    if (Math.abs(net) <= CALM_RATIO * Math.max(q.f, q.r)) st.calm += dt; else st.calm = 0;
    if (st.phase === 'shifting' && st.calm >= CALM_S) { st.phase = 'steady'; st.settledNH3 = Math.round(st.n.NH3); }
    return q;
  }
  const settled = (st) => st.phase === 'steady';
  const count = (st) => ({ N2: Math.round(st.n.N2), H2: Math.round(st.n.H2), NH3: Math.round(st.n.NH3) });

  if (window.GC_MODELS) window.GC_MODELS['4-6a'] = { START: START, RATE_EQ: RATE_EQ, T_START: T_START, P_START: P_START, T_MIN: T_MIN, T_MAX: T_MAX, P_MIN: P_MIN, P_MAX: P_MAX, ADD: ADD, REMOVE: REMOVE, N2_CAP: N2_CAP, CALM_RATIO: CALM_RATIO, CALM_S: CALM_S, CHANGES: CHANGES, label: label, constants: constants, volumeOf: volumeOf, rates: rates, newState: newState, allowed: allowed, applyChange: applyChange, step: step, settled: settled, count: count };

  /* ---- the page ---- */
  function init() {
    const box = $('[data-sim="equilibrium"]');
    if (!box || !window.TB) return;
    const btn = {};
    CHANGES.forEach((c) => { btn[c] = $('[data-change="' + c + '"]', box); });
    const resetBtn = $('#btnResetEq', box);
    const note = $('[data-sim-note]', box);
    const PW = 340, PH = 220, WIDTH_PER_V = 170, MAX_HIST = 120, SAMPLE_S = 0.25, YMAX = 50;
    let st = newState(), sim = null, tick = 0, lastRates = rates(st), nextSample = 0;
    let vw = WIDTH_PER_V * volumeOf(st.P);
    const rand = (function () { let a = 6101; return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
    const parts = { N2: [], H2: [], NH3: [] };
    const hist = [], rings = [];
    const speedFor = () => 70 * Math.sqrt(kelvin(st.T) / T_REF);

    function pushHist(mark) {
      const c = count(st);
      hist.push({ N2: c.N2, H2: c.H2, NH3: c.NH3, mark: !!mark });
      if (hist.length > MAX_HIST) hist.shift();
    }
    function newPart() {
      const a = rand() * Math.PI * 2;
      return { x: 8 + rand() * Math.max(10, vw - 16), y: 8 + rand() * (PH - 16), vx: Math.cos(a), vy: Math.sin(a), ang: rand() * Math.PI * 2, spin: (rand() - 0.5) * 1.5 };
    }
    function syncParts() {
      const c = count(st);
      ['N2', 'H2', 'NH3'].forEach((k) => {
        while (parts[k].length < c[k]) parts[k].push(newPart());
        while (parts[k].length > c[k]) parts[k].splice(Math.floor(rand() * parts[k].length), 1);
      });
    }
    function moveParts(dt) {
      const s = speedFor(), pad = 7;
      ['N2', 'H2', 'NH3'].forEach((k) => parts[k].forEach((p) => {
        const m = Math.hypot(p.vx, p.vy) || 1;
        p.x += (p.vx / m) * s * dt; p.y += (p.vy / m) * s * dt; p.ang += p.spin * dt;
        if (p.x < pad) { p.x = pad; p.vx = Math.abs(p.vx); }
        if (p.x > vw - pad) { p.x = vw - pad; p.vx = -Math.abs(p.vx); }
        if (p.y < pad) { p.y = pad; p.vy = Math.abs(p.vy); }
        if (p.y > PH - pad) { p.y = PH - pad; p.vy = -Math.abs(p.vy); }
      }));
    }
    // a ring where a forward reaction (near an N2) or a reverse reaction (near an NH3) happens, at the rate the model gives
    function spawnRings(q, dt) {
      if (rand() < q.f * dt && parts.N2.length) { const p = parts.N2[Math.floor(rand() * parts.N2.length)]; rings.push({ x: p.x, y: p.y, age: 0, fwd: true }); }
      if (rand() < q.r * dt && parts.NH3.length) { const p = parts.NH3[Math.floor(rand() * parts.NH3.length)]; rings.push({ x: p.x, y: p.y, age: 0, fwd: false }); }
      for (let i = rings.length - 1; i >= 0; i--) { rings[i].age += dt; if (rings[i].age > 0.5) rings.splice(i, 1); }
    }

    const fmt1 = (x) => x.toFixed(1);
    function lock(on) { CHANGES.forEach((c) => { btn[c].disabled = on || !allowed(st, c); }); }
    function report() {
      const q = lastRates, c = count(st);
      sim.setReadout('temp', st.T + ' °C');
      sim.setReadout('press', st.P + ' atm');
      sim.setReadout('nh3', String(c.NH3));
      sim.setReadout('fwd', fmt1(q.f) + ' a second');
      sim.setReadout('rev', fmt1(q.r) + ' a second');
      sim.setReadout('shift', st.phase === 'shifting' ? (q.f > q.r ? 'Right' : 'Left') : 'None');
      if (!sim.committed) sim.setStatus('neutral', 'Predict to start');
      else if (st.phase === 'shifting') sim.setStatus('warn', q.f > q.r ? 'Shifting right' : 'Shifting left');
      else sim.setStatus('ok', st.change ? 'Settled: rates are equal' : 'At equilibrium');
      sim.setLabel('A vessel with ' + c.N2 + ' nitrogen, ' + c.H2 + ' hydrogen and ' + c.NH3 + ' ammonia molecules at ' + st.T + ' degrees C and ' + st.P + ' atmospheres, beside a chart of the three amounts over the last 30 seconds. ' +
        (st.phase === 'shifting' ? 'The mixture is shifting ' + (q.f > q.r ? 'right, toward ammonia' : 'left, toward nitrogen and hydrogen') + '.' : 'The forward and reverse reactions run at the same rate.'));
      lock(!sim.committed || st.phase === 'shifting');
    }
    function sentence() {
      const c = st.change;
      const dir = st.shift === 'right' ? 'toward ammonia' : 'toward nitrogen and hydrogen';
      if (st.phase === 'shifting') return label[c] + '. The system shifts ' + dir + ' to work against the change. The controls unlock when the rates are equal again.';
      if (c) return 'Settled. The forward and reverse reactions run at the same rate again, with ' + st.settledNH3 + ' ammonia molecules (it was ' + st.before + ').';
      return 'The mixture starts at equilibrium. Both reactions run, at the same rate, so the amounts stay steady.';
    }

    /* ---- drawing ---- */
    function drawMolecule(ctx, c, k, p) {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.ang);
      ctx.lineWidth = 1.2; ctx.strokeStyle = c.paper;
      if (k === 'N2') {
        ctx.fillStyle = c.cool;
        [-3.6, 3.6].forEach((dx) => { ctx.beginPath(); ctx.arc(dx, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
      } else if (k === 'H2') {
        ctx.fillStyle = c.inkSoft;
        [-2.4, 2.4].forEach((dx) => { ctx.beginPath(); ctx.arc(dx, 0, 2.7, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
      } else {
        ctx.fillStyle = c.accent;
        ctx.beginPath(); ctx.arc(0, 0, 4.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        [0, 2.1, 4.2].forEach((a) => { ctx.beginPath(); ctx.arc(Math.cos(a) * 6.2, Math.sin(a) * 6.2, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
      }
      ctx.restore();
    }
    function drawChamber(ctx, env) {
      const c = env.colors;
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, PW, PH);
      ctx.fillStyle = c.card; ctx.strokeStyle = c.ink; ctx.lineWidth = 2;
      ctx.fillRect(0, 0, vw, PH); ctx.strokeRect(1, 1, vw - 2, PH - 2);
      // the piston: a plate with a handle
      ctx.fillStyle = c.ink; ctx.fillRect(vw, 0, 6, PH); ctx.fillRect(vw + 6, PH / 2 - 3, Math.max(0, PW - vw - 6), 6);
      ['N2', 'H2', 'NH3'].forEach((k) => parts[k].forEach((p) => drawMolecule(ctx, c, k, p)));
      rings.forEach((r) => {
        ctx.globalAlpha = 1 - r.age / 0.5;
        ctx.strokeStyle = r.fwd ? c.accent : c.good; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(r.x, r.y, 7 + r.age * 22, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      });
    }
    const CX0 = 40, CX1 = PW - 12, CY0 = PH - 42, CY1 = 16;
    function drawChart(ctx, env, fs) {
      const c = env.colors;
      ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 0.5, PW - 1, PH - 1, 6); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(CX0, CY1 - 4); ctx.lineTo(CX0, CY0); ctx.lineTo(CX1, CY0); ctx.stroke();
      const gy = (n) => CY0 - (Math.min(YMAX, n) / YMAX) * (CY0 - CY1);
      const gx = (i) => CX0 + (i / (MAX_HIST - 1)) * (CX1 - CX0);
      ctx.fillStyle = c.inkSoft; ctx.font = env.font(fs, 'mono', 400); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      [0, 25, 50].forEach((n) => {
        if (n) { ctx.strokeStyle = c.hair; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(CX0, gy(n)); ctx.lineTo(CX1, gy(n)); ctx.stroke(); }
        ctx.fillText(String(n), CX0 - 6, gy(n));
      });
      ctx.font = env.font(fs, 'display', 400); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('The last 30 s →', (CX0 + CX1) / 2, CY0 + 6);
      ctx.save(); ctx.translate(11, (CY0 + CY1) / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = 'middle';
      ctx.fillText('Molecules', 0, 0); ctx.restore();
      hist.forEach((h, i) => {
        if (!h.mark) return;
        ctx.strokeStyle = c.inkMute; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(gx(i), CY1); ctx.lineTo(gx(i), CY0); ctx.stroke(); ctx.setLineDash([]);
      });
      [['N2', c.cool], ['H2', c.inkSoft], ['NH3', c.accent]].forEach((pair) => {
        ctx.strokeStyle = pair[1]; ctx.lineWidth = 3; ctx.lineJoin = 'round';
        ctx.beginPath();
        hist.forEach((h, i) => { if (i) ctx.lineTo(gx(i), gy(h[pair[0]])); else ctx.moveTo(gx(i), gy(h[pair[0]])); });
        ctx.stroke();
      });
    }
    function draw(ctx, env) {
      const wide = env.w / env.h > 1.6;
      const dw = wide ? 2 * PW + 20 : PW, dh = wide ? PH : 2 * PH + 16;
      const k = Math.min(env.w / dw, env.h / dh);
      const fs = Math.max(12, 12 / k);
      ctx.save();
      ctx.translate((env.w - dw * k) / 2, (env.h - dh * k) / 2);
      ctx.scale(k, k);
      drawChamber(ctx, env);
      ctx.translate(wide ? PW + 20 : 0, wide ? 0 : PH + 16);
      drawChart(ctx, env, fs);
      ctx.restore();
    }

    function startOver() {
      st = newState(); lastRates = rates(st); vw = WIDTH_PER_V * volumeOf(st.P);
      ['N2', 'H2', 'NH3'].forEach((k) => { parts[k].length = 0; });
      rings.length = 0; hist.length = 0; nextSample = 0;
      syncParts();
      for (let i = 0; i < MAX_HIST; i++) pushHist(false);
      note.textContent = sentence();
      report();
      sim.redraw();
    }
    function change(name) {
      if (!sim.committed || !applyChange(st, name)) return;
      pushHist(true);
      lastRates = rates(st);
      note.textContent = sentence();
      report();
      sim.release();
    }

    syncParts();
    for (let i = 0; i < MAX_HIST; i++) pushHist(false);
    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 4,         // a change settles in a few presses
      init() { note.textContent = sentence(); report(); },
      onUnlock() { note.textContent = sentence(); report(); },
      update(dt) {
        const was = st.phase;
        lastRates = step(st, dt);
        syncParts();
        moveParts(dt);
        spawnRings(lastRates, dt);
        const target = WIDTH_PER_V * volumeOf(st.P);
        if (vw !== target) { vw = vw < target ? Math.min(target, vw + 140 * dt) : Math.max(target, vw - 140 * dt); }
        nextSample += dt;
        while (nextSample >= SAMPLE_S) { nextSample -= SAMPLE_S; pushHist(false); }
        if (was === 'shifting' && st.phase === 'steady') { note.textContent = sentence(); report(); sim.hold(); return; }
        if (++tick % 10 === 0) report();
      },
      draw: draw,
      record() {
        const done = !!st.change && st.phase === 'steady';
        return {
          'Change made': st.change ? label[st.change] : 'none yet',
          'Shift': done ? (st.shift === 'right' ? 'Right' : st.shift === 'left' ? 'Left' : 'None') : 'wait',
          'NH₃ before': st.change ? st.before : '–',
          'NH₃ settled': done ? st.settledNH3 : 'wait'
        };
      }
    });

    CHANGES.forEach((c) => btn[c].addEventListener('click', () => change(c)));
    resetBtn.addEventListener('click', () => { startOver(); sim.release(); });
    report();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
