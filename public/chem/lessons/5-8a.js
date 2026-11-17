/* ============================================================
   5-8a LESSON INTERACTIVES
   The nuclear lab, split into three simulators on TB.sim.create (RUNTIME_SPEC 4.3), each locked until
   its prediction is committed. REPAIR. Brief: docs/plans/textbook-sim-briefs.md, "Chem 5-8a: Nuclear
   Lab". Each panel answers its own question, so each has its own box (the old page used tabs that
   were styled by inline style writes).

   1. Decay lab (core). 100 atoms and a decay curve. Each fixed step (1/60 s) every parent atom decays
      with the probability that halves the sample in 128 steps, so a half-life is 128/60 s of
      simulated time on every screen (the old loop moved a fixed 0.02 half-lives every second frame).
      A seeded generator draws the decays (so the numbers in "Look for" are the numbers on every
      screen), using only + - * / and Math.sqrt. A second generator, seeded apart, picks the direction
      of each ejected particle, so a drawing choice never changes a count. The run stops with
      sim.hold() at 1, 2, 3 and 4 half-lives.
   2. Fission, one nucleus (core). One neutron strikes uranium-235. It is an animation on a fixed
      timeline with no random draw. Nucleons and protons are counted before and after.
   3. Chain reaction (Enrichment). Generation by generation: fissions in the next generation are the
      fissions now times k, where k = 1.5 minus the share of the control rods that is inserted.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);

  /* ================= 1. the decay model ================= */
  const ATOMS = 100;
  const STEPS_PER_HL = 128;                // fixed steps in one half-life
  const MARKS = 4;                         // the run stops at 1, 2, 3 and 4 half-lives
  const SAMPLE_STEPS = 8;                  // the curve takes a point this often
  const BASE_SEED = 21696;                 // chosen from a scan so each isotope shows the typical halving (see the sheet)
  const ISOTOPES = [
    { key: 'C14', name: 'Carbon-14', half: 5730, unit: 'years', digits: 0, mode: 'beta', from: 'Carbon-14', to: 'nitrogen-14', a: '14 = 14 + 0', z: '6 = 7 + (−1)' },
    { key: 'Cs137', name: 'Cesium-137', half: 30.2, unit: 'years', digits: 1, mode: 'beta', from: 'Cesium-137', to: 'barium-137', a: '137 = 137 + 0', z: '55 = 56 + (−1)' },
    { key: 'I131', name: 'Iodine-131', half: 8, unit: 'days', digits: 0, mode: 'beta', from: 'Iodine-131', to: 'xenon-131', a: '131 = 131 + 0', z: '53 = 54 + (−1)' },
    { key: 'U238', name: 'Uranium-238', half: 4.47, unit: 'billion years', digits: 2, mode: 'alpha', from: 'Uranium-238', to: 'thorium-234', a: '238 = 234 + 4', z: '92 = 90 + 2' },
    { key: 'Ra226', name: 'Radium-226', half: 1600, unit: 'years', digits: 0, mode: 'alpha', from: 'Radium-226', to: 'radon-222', a: '226 = 222 + 4', z: '88 = 86 + 2' }
  ];
  const DIRS = [[1, 0], [0.7071, 0.7071], [0, 1], [-0.7071, 0.7071], [-1, 0], [-0.7071, -0.7071], [0, -1], [0.7071, -0.7071]];
  // the chance one atom decays in one step: 1 - 0.5^(1/128), from seven square roots (no Math.pow)
  const P_STEP = (function () { let q = 0.5; for (let i = 0; i < 7; i++) q = Math.sqrt(q); return 1 - q; })();

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
  function newSample(iso) {
    const i = Math.max(0, ISOTOPES.findIndex((x) => x.key === iso));
    return { iso: ISOTOPES[i], alive: new Array(ATOMS).fill(true), remaining: ATOMS, steps: 0, series: [[0, ATOMS]], ejects: [], rD: rng(BASE_SEED + i * 7), rV: rng(BASE_SEED + 1000 + i) };
  }
  function stepSample(s, dt) {
    s.steps++;
    for (let i = 0; i < ATOMS; i++) {
      if (s.alive[i] && s.rD() < P_STEP) {
        s.alive[i] = false;
        s.remaining--;
        s.ejects.push({ i: i, d: DIRS[Math.floor(s.rV() * 8)], age: 0 });
      }
    }
    for (let k = s.ejects.length - 1; k >= 0; k--) { s.ejects[k].age += dt; if (s.ejects[k].age > 0.6) s.ejects.splice(k, 1); }
    if (s.steps % SAMPLE_STEPS === 0) s.series.push([s.steps / STEPS_PER_HL, s.remaining]);
  }
  const halfLives = (s) => s.steps / STEPS_PER_HL;
  const atMark = (s) => s.steps > 0 && s.steps % STEPS_PER_HL === 0;
  const commas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  function timeText(iso, h) {
    const v = iso.half * h;
    const txt = iso.digits ? v.toFixed(iso.digits) : String(Math.round(v));
    return (iso.digits ? txt : commas(txt)) + ' ' + iso.unit;
  }

  /* ================= 2. the fission timeline ================= */
  const FISS = { APPROACH: 1.2, WOBBLE: 0.8, SPLIT: 1.4, TOTAL: 3.4 };
  const fissionPhase = (t) => (t < FISS.APPROACH ? 'approach' : t < FISS.APPROACH + FISS.WOBBLE ? 'wobble' : t < FISS.TOTAL ? 'split' : 'done');

  /* ================= 3. the chain model ================= */
  const CHAIN = { START: 50, CAP: 1000, GEN_S: 0.5, MAX_BARS: 24, STOP_GEN: 5 };
  const kOf = (rods) => 1.5 - rods / 100;           // rods inserted, 0 to 100 percent
  function newChain() { return { n: 0, gen: 0, total: 0, series: [], running: false }; }
  function nextGeneration(c, rods) {
    if (!c.running) return;
    c.gen++;
    c.n = Math.min(CHAIN.CAP, c.n * kOf(rods));
    if (c.n < 0.5) c.n = 0;
    c.total += c.n;
    c.series.push(c.n);
    if (c.series.length > CHAIN.MAX_BARS) c.series.shift();
  }
  function startChain(c) { c.running = true; c.n = CHAIN.START; c.gen = 0; c.total = CHAIN.START; c.series = [CHAIN.START]; }

  if (window.GC_MODELS) window.GC_MODELS['5-8a'] = { ATOMS: ATOMS, STEPS_PER_HL: STEPS_PER_HL, MARKS: MARKS, BASE_SEED: BASE_SEED, P_STEP: P_STEP, ISOTOPES: ISOTOPES, newSample: newSample, stepSample: stepSample, halfLives: halfLives, atMark: atMark, timeText: timeText, FISS: FISS, fissionPhase: fissionPhase, CHAIN: CHAIN, kOf: kOf, newChain: newChain, startChain: startChain, nextGeneration: nextGeneration };

  /* ================= the pages ================= */
  function initDecay() {
    const box = $('[data-sim="decay"]');
    if (!box || !window.TB) return;
    const sel = $('#decIso', box), startBtn = $('#btnDecStart', box), resetBtn = $('#btnDecReset', box);
    const note = $('[data-sim-note]', box);
    const W = 340, H = 220, GX0 = 46, GX1 = W - 14, GY0 = H - 40, GY1 = 18;
    let s = newSample(sel.value), state = 'ready', sim = null, tick = 0;

    const mark = () => Math.round(halfLives(s));
    function report() {
      const h = halfLives(s);
      sim.setReadout('half', commas(s.iso.half) + ' ' + s.iso.unit);
      sim.setReadout('passed', h.toFixed(2));
      sim.setReadout('time', timeText(s.iso, h));
      sim.setReadout('left', s.remaining + ' of ' + ATOMS);
      if (!sim.committed) sim.setStatus('neutral', 'Predict to start');
      else if (state === 'ready') sim.setStatus('neutral', 'Ready to start the run');
      else if (state === 'running') sim.setStatus('warn', 'Run in progress');
      else if (state === 'done') sim.setStatus('ok', 'Stopped at 4 half-lives: the run is over');
      else sim.setStatus('ok', 'Stopped at ' + mark() + (mark() === 1 ? ' half-life' : ' half-lives') + '. Press Record, then Play');
      sim.setLabel(s.remaining + ' of ' + ATOMS + ' ' + s.iso.name + ' atoms have not decayed after ' + h.toFixed(2) + ' half-lives, beside a decay curve.');
      startBtn.disabled = state === 'running';
    }
    function sentence() {
      if (!sim.committed) return 'The explanation appears after you predict.';
      const i = s.iso;
      const eq = i.from + ' → ' + i.to + ' + ' + (i.mode === 'alpha' ? 'helium-4 nucleus (alpha particle)' : 'electron + antineutrino') + '. Mass numbers: ' + i.a + '. Atomic numbers: ' + i.z + '.';
      if (state === 'ready') return 'Each decay: ' + eq + ' Press Start run. The run stops at each half-life.';
      return 'Each decay: ' + eq + ' Watch the grid: no one can say which atom goes next, but about half of the atoms are left after each half-life.';
    }
    function setState(next) {
      state = next;
      if (next === 'ready') s = newSample(sel.value);
      tick = 0;
      note.textContent = sentence();
      report();
      sim.redraw();
    }

    /* ---- drawing ---- */
    const COL = 10, CELL = 22, GRID_X = 20, GRID_Y = 0;
    const cx = (i) => GRID_X + (i % COL) * CELL + CELL / 2 + 8;
    const cy = (i) => GRID_Y + Math.floor(i / COL) * CELL + CELL / 2;
    function drawGrid(ctx, env) {
      const c = env.colors;
      ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 0.5, W - 1, H - 1, 6); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.translate(0, 0);
      for (let i = 0; i < ATOMS; i++) {
        const x = cx(i), y = cy(i);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = c.paper; ctx.fillStyle = s.alive[i] ? c.accent : c.cool;
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      s.ejects.forEach((e) => {
        const d = e.age * 60, x = cx(e.i) + e.d[0] * (8 + d), y = cy(e.i) + e.d[1] * (8 + d);
        ctx.globalAlpha = 1 - e.age / 0.6;
        ctx.fillStyle = s.iso.mode === 'alpha' ? c.warn : c.ink;
        ctx.beginPath(); ctx.arc(x, y, s.iso.mode === 'alpha' ? 5 : 3, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      });
      ctx.restore();
    }
    const gx = (h) => GX0 + (h / MARKS) * (GX1 - GX0);
    const gy = (n) => GY0 - (n / ATOMS) * (GY0 - GY1);
    function drawCurve(ctx, env, fs) {
      const c = env.colors;
      ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 0.5, W - 1, H - 1, 6); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(GX0, GY1 - 4); ctx.lineTo(GX0, GY0); ctx.lineTo(GX1, GY0); ctx.stroke();
      ctx.fillStyle = c.inkSoft; ctx.font = env.font(fs, 'mono', 400); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let h = 0; h <= MARKS; h++) ctx.fillText(String(h), gx(h), GY0 + 5);
      ctx.font = env.font(fs, 'display', 400);
      ctx.fillText('Half-lives →', (GX0 + GX1) / 2, GY0 + 5 + fs * 1.15);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.font = env.font(fs, 'mono', 400);
      [0, 50, 100].forEach((n) => {
        if (n) { ctx.strokeStyle = c.hair; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(GX0, gy(n)); ctx.lineTo(GX1, gy(n)); ctx.stroke(); }
        ctx.fillText(String(n), GX0 - 6, gy(n));
      });
      ctx.save(); ctx.translate(11, (GY0 + GY1) / 2); ctx.rotate(-Math.PI / 2);
      ctx.font = env.font(fs, 'display', 400); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.inkSoft;
      ctx.fillText('Atoms left', 0, 0); ctx.restore();
      // the halving rule, as a dashed guide
      ctx.strokeStyle = c.inkMute; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]);
      ctx.beginPath();
      for (let k = 0; k <= 32; k++) { const h = (k / 32) * MARKS, v = ATOMS * Math.pow(0.5, h); if (k) ctx.lineTo(gx(h), gy(v)); else ctx.moveTo(gx(h), gy(v)); }
      ctx.stroke(); ctx.setLineDash([]);
      if (s.series.length > 1) {
        ctx.strokeStyle = c.accent; ctx.lineWidth = 3; ctx.lineJoin = 'round';
        ctx.beginPath();
        s.series.forEach((pt, i) => { if (i) ctx.lineTo(gx(pt[0]), gy(pt[1])); else ctx.moveTo(gx(pt[0]), gy(pt[1])); });
        ctx.stroke();
      }
      if (atMark(s)) {
        ctx.fillStyle = c.ink; ctx.font = env.font(fs, 'mono', 700); ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
        ctx.fillText(String(s.remaining), Math.min(gx(halfLives(s)) + 6, GX1 - 24), gy(s.remaining) - 6);
      }
    }
    function draw(ctx, env) {
      const wide = env.w / env.h > 1.6;
      const dw = wide ? 2 * W + 20 : W, dh = wide ? H : 2 * H + 16;
      const k = Math.min(env.w / dw, env.h / dh);
      const fs = Math.max(12, 12 / k);
      ctx.save();
      ctx.translate((env.w - dw * k) / 2, (env.h - dh * k) / 2);
      ctx.scale(k, k);
      drawGrid(ctx, env);
      ctx.translate(wide ? W + 20 : 0, wide ? 0 : H + 16);
      drawCurve(ctx, env, fs);
      ctx.restore();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 2.2,       // one press reaches the next half-life stop
      init() { note.textContent = sentence(); report(); },
      onUnlock() { note.textContent = sentence(); report(); },
      update(dt) {
        if (state !== 'running') return;
        stepSample(s, dt);
        if (atMark(s)) {
          state = mark() >= MARKS ? 'done' : 'stopped';
          note.textContent = sentence(); report();
          sim.hold();
          return;
        }
        if (++tick % 6 === 0) report();
      },
      draw: draw,
      preset(name) {
        const key = { c14: 'C14', i131: 'I131', u238: 'U238' }[name];
        if (!key) return;
        sel.value = key;
        setState('ready');
      },
      record() {
        const h = halfLives(s);
        return {
          'Isotope': s.iso.name,
          'Half-lives passed': h.toFixed(2),
          'Time passed': timeText(s.iso, h),
          'Atoms left': s.remaining
        };
      }
    });

    sel.addEventListener('change', () => setState('ready'));
    startBtn.addEventListener('click', () => {
      if (!sim.committed) return;
      s = newSample(sel.value);
      state = 'running';
      note.textContent = sentence();
      report();
      sim.release();
    });
    resetBtn.addEventListener('click', () => { setState('ready'); sim.release(); });
    // a stopped run goes on when the student presses Play or Step
    const resume = () => { if (state === 'stopped') { state = 'running'; note.textContent = sentence(); report(); } };
    box.addEventListener('click', (ev) => {
      const b = ev.target.closest && ev.target.closest('button');
      if (b && (b.dataset.simPlay !== undefined || b.textContent === 'Step')) resume();
    });
    report();
  }

  function initFission() {
    const box = $('[data-sim="fission"]');
    if (!box || !window.TB) return;
    const fireBtn = $('#btnFire', box), resetBtn = $('#btnFissionReset', box);
    const note = $('[data-sim-note]', box);
    const W = 340, H = 220, UX = 170, UY = 110;
    let t = 0, state = 'ready', sim = null;
    const phase = () => fissionPhase(t);
    const done = () => state === 'done';

    function report() {
      sim.setReadout('in', '235 + 1 = 236');
      sim.setReadout('out', done() ? '141 + 92 + 3 = 236' : '–');
      sim.setReadout('prot', done() ? '92 = 56 + 36' : '–');
      sim.setReadout('energy', done() ? 'about 200 million eV' : '–');
      if (!sim.committed) sim.setStatus('neutral', 'Predict to start');
      else if (state === 'ready') sim.setStatus('neutral', 'Ready to fire');
      else if (state === 'running') sim.setStatus('warn', phase() === 'approach' ? 'Neutron approaching' : phase() === 'wobble' ? 'Nucleus unstable' : 'The nucleus splits');
      else sim.setStatus('ok', 'Split: the totals match');
      sim.setLabel(done() ? 'A uranium-235 nucleus has absorbed a neutron and split into barium-141, krypton-92 and three neutrons. Bars compare the energy of one fission with a chemical bond.' : 'A neutron travels toward a uranium-235 nucleus. Bars compare the energy of one fission with a chemical bond.');
      fireBtn.disabled = state === 'running';
    }
    function sentence() {
      if (!sim.committed) return 'The explanation appears after you predict.';
      if (state === 'ready') return 'Press Fire a neutron. A slow neutron will strike a uranium-235 nucleus.';
      if (state === 'running') return phase() === 'approach' ? 'A neutron joins the nucleus, which then holds 236 protons and neutrons.' : phase() === 'wobble' ? 'The 236-nucleon nucleus is unstable. It wobbles.' : 'The nucleus splits into barium-141 and krypton-92 and throws out 3 neutrons.';
      return 'Protons and neutrons: 236 in, 236 out. Protons: 92 in, 92 out. The elements changed, and the energy released is about 200 million eV.';
    }

    function disc(ctx, x, y, r, stroke, fill, label, c, fs) {
      ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (label) { ctx.fillStyle = c.ink; ctx.font = c.font(fs, 'mono', 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x, y); }
    }
    function drawScene(ctx, env, fs) {
      const c = env.colors, ph = phase();
      const env2 = { ink: c.ink, font: env.font };
      ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 0.5, W - 1, H - 1, 6); ctx.fill(); ctx.stroke();
      if (state === 'ready') {
        disc(ctx, UX, UY, 32, c.warn, c.card, 'U-235', env2, fs);
        disc(ctx, 40, UY, 7, c.cool, c.cool, '', env2, fs);
      } else if (ph === 'approach') {
        const nx = 40 + (UX - 32 - 7 - 40) * (t / FISS.APPROACH);
        disc(ctx, UX, UY, 32, c.warn, c.card, 'U-235', env2, fs);
        disc(ctx, nx, UY, 7, c.cool, c.cool, '', env2, fs);
      } else if (ph === 'wobble') {
        const w = Math.sin((t - FISS.APPROACH) * 18) * 5;
        ctx.fillStyle = c.card; ctx.strokeStyle = c.accent; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.ellipse(UX, UY, 33 + w, 33 - w * 0.7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = c.ink; ctx.font = env.font(fs, 'mono', 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('U-236', UX, UY);
      } else {
        const p = Math.min(1, (t - FISS.APPROACH - FISS.WOBBLE) / FISS.SPLIT);
        disc(ctx, UX - 90 * p, UY, 28, c.accent, c.card, 'Ba-141', env2, fs);
        disc(ctx, UX + 90 * p, UY, 22, c.warn, c.card, 'Kr-92', env2, fs);
        [[-0.5, -1], [0.1, 1], [0.6, -0.4]].forEach((v) => disc(ctx, UX + v[0] * 95 * p, UY + v[1] * 78 * p, 6, c.cool, c.cool, '', env2, fs));
      }
    }
    // energy on a scale that grows by 1,000 at each step: one chemical bond against one fission
    const BX0 = 30, BX1 = W - 20;
    const lx = (v) => BX0 + (Math.log(v) / Math.log(1e9)) * (BX1 - BX0);
    function drawBars(ctx, env, fs) {
      const c = env.colors;
      ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 0.5, W - 1, H - 1, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = c.inkSoft; ctx.font = env.font(fs, 'display', 700); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('Energy (eV)', 14, 10);
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(BX0, 168); ctx.lineTo(BX1, 168); ctx.stroke();
      ctx.font = env.font(fs, 'mono', 400); ctx.textAlign = 'center'; ctx.fillStyle = c.inkSoft;
      [[1, '1'], [1e3, '1,000'], [1e6, '1 million']].forEach((tk) => {
        const x = lx(Math.max(tk[0], 1.0001));
        ctx.textAlign = tk[0] === 1 ? 'left' : 'center';
        ctx.fillText(tk[1], tk[0] === 1 ? BX0 : x, 174);
        ctx.strokeStyle = c.hair; ctx.beginPath(); ctx.moveTo(lx(Math.max(tk[0], 1.0001)), 60); ctx.lineTo(lx(Math.max(tk[0], 1.0001)), 168); ctx.stroke();
      });
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = env.font(fs, 'display', 400);
      ctx.fillStyle = c.cool; ctx.fillRect(BX0, 78, lx(10) - BX0, 26);
      ctx.fillStyle = c.ink; ctx.fillText('A chemical bond', BX0, 66);
      ctx.fillStyle = c.accent; ctx.globalAlpha = done() ? 1 : 0.25;
      ctx.fillRect(BX0, 132, lx(2e8) - BX0, 26); ctx.globalAlpha = 1;
      ctx.fillStyle = c.ink; ctx.fillText('One fission', BX0, 120);
    }
    function draw(ctx, env) {
      const wide = env.w / env.h > 1.6;
      const dw = wide ? 2 * W + 20 : W, dh = wide ? H : 2 * H + 16;
      const k = Math.min(env.w / dw, env.h / dh);
      const fs = Math.max(12, 12 / k);
      ctx.save();
      ctx.translate((env.w - dw * k) / 2, (env.h - dh * k) / 2);
      ctx.scale(k, k);
      drawScene(ctx, env, fs);
      ctx.translate(wide ? W + 20 : 0, wide ? 0 : H + 16);
      drawBars(ctx, env, fs);
      ctx.restore();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 2,         // two presses run the 3.4 s
      init() { note.textContent = sentence(); report(); },
      onUnlock() { note.textContent = sentence(); report(); },
      update(dt) {
        if (state !== 'running') return;
        const was = phase();
        t += dt;
        if (t >= FISS.TOTAL) { t = FISS.TOTAL; state = 'done'; note.textContent = sentence(); report(); sim.hold(); return; }
        if (phase() !== was) { note.textContent = sentence(); report(); }
      },
      draw: draw,
      record() {
        return {
          'Protons and neutrons in': 236,
          'Protons and neutrons out': done() ? 236 : 'fire first',
          'Protons in': 92,
          'Protons out': done() ? 92 : 'fire first',
          'Energy released': done() ? 'about 200 million eV' : 'fire first'
        };
      }
    });

    fireBtn.addEventListener('click', () => {
      if (!sim.committed) return;
      t = 0; state = 'running';
      note.textContent = sentence(); report();
      sim.release();
    });
    resetBtn.addEventListener('click', () => { t = 0; state = 'ready'; note.textContent = sentence(); report(); sim.redraw(); sim.release(); });
    report();
  }

  function initChain() {
    const box = $('[data-sim="chain"]');
    if (!box || !window.TB) return;
    const sRods = $('#chainRods', box), startBtn = $('#btnChainStart', box), scramBtn = $('#btnScram', box), resetBtn = $('#btnChainReset', box);
    const note = $('[data-sim-note]', box);
    const W = 340, H = 220;
    let c = newChain(), sim = null, clock = 0, stopped = false;
    const rods = () => Number(sRods.value);

    function report() {
      const k = kOf(rods());
      sim.setReadout('k', k.toFixed(2));
      sim.setReadout('gen', String(c.gen));
      sim.setReadout('fissions', c.running ? String(Math.round(c.n)) : '–');
      sim.setReadout('total', c.running ? String(Math.round(c.total)) : '–');
      if (!sim.committed) sim.setStatus('neutral', 'Predict to start');
      else if (!c.running) sim.setStatus('neutral', 'Press Start run');
      else if (c.n >= CHAIN.CAP) sim.setStatus('alert', 'Runaway: drop the rods');
      else if (stopped && c.gen === CHAIN.STOP_GEN) sim.setStatus('ok', 'Stopped at generation 5. Press Record, then Play');
      else if (c.n === 0) sim.setStatus('ok', 'The chain has died out');
      else if (k > 1.005) sim.setStatus('warn', 'Growing (k above 1)');
      else if (k < 0.995) sim.setStatus('ok', 'Shrinking (k below 1)');
      else sim.setStatus('ok', 'Steady (k equals 1)');
      sim.setLabel('A reactor core with fuel pins and control rods inserted ' + rods() + ' percent, beside a bar chart of fissions in each generation. k is ' + k.toFixed(2) + '. ' + (c.running ? 'Generation ' + c.gen + ' has ' + Math.round(c.n) + ' fissions.' : 'The reactor has not started.'));
    }
    function sentence() {
      if (!sim.committed) return 'The explanation appears after you predict.';
      if (!c.running) return 'Set the control rods, then press Start run. The run begins with 50 fissions and stops at generation 5.';
      const k = kOf(rods());
      return k > 1.005 ? 'Each fission causes more than one new fission, so every generation is bigger.' : k < 0.995 ? 'Each fission causes less than one new fission, so every generation is smaller.' : 'Each fission causes exactly one new fission, so every generation is the same size.';
    }
    function refresh() { note.textContent = sentence(); report(); sim.redraw(); }

    const PY0 = 24, PIN = 8, PCOLS = 8, PROWS = 6;
    function drawCore(ctx, env) {
      const col = env.colors;
      ctx.fillStyle = col.card; ctx.strokeStyle = col.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 0.5, W - 1, H - 1, 6); ctx.fill(); ctx.stroke();
      const lit = c.running ? Math.min(PCOLS * PROWS, Math.ceil((c.n / 200) * PCOLS * PROWS)) : 0;
      for (let i = 0; i < PCOLS * PROWS; i++) {
        const x = 40 + (i % PCOLS) * 34, y = 60 + Math.floor(i / PCOLS) * 24;
        ctx.fillStyle = i < lit ? col.warn : col.paper; ctx.strokeStyle = col.inkMute; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y, PIN, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      const depth = (rods() / 100) * 150;
      ctx.fillStyle = col.inkSoft;
      for (let r = 0; r < PCOLS - 1; r++) ctx.fillRect(40 + r * 34 + 17 - 3, PY0 - 10, 6, depth * 0.92 + 6);
    }
    const BY0 = 168, BY1 = 24, BX0 = 40, BX1 = W - 14;
    function drawBars(ctx, env, fs) {
      const col = env.colors;
      ctx.fillStyle = col.card; ctx.strokeStyle = col.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(0.5, 0.5, W - 1, H - 1, 6); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = col.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(BX0, BY1 - 4); ctx.lineTo(BX0, BY0); ctx.lineTo(BX1, BY0); ctx.stroke();
      ctx.fillStyle = col.inkSoft; ctx.font = env.font(fs, 'mono', 400); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      [0, 100, 200].forEach((v) => {
        const y = BY0 - (v / 200) * (BY0 - BY1);
        if (v) { ctx.strokeStyle = col.hair; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(BX0, y); ctx.lineTo(BX1, y); ctx.stroke(); }
        ctx.fillText(String(v), BX0 - 6, y);
      });
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.font = env.font(fs, 'display', 400);
      ctx.fillText('Generations →', (BX0 + BX1) / 2, BY0 + 6);
      ctx.save(); ctx.translate(11, (BY0 + BY1) / 2); ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = 'middle'; ctx.fillText('Fissions', 0, 0); ctx.restore();
      const bw = (BX1 - BX0 - 4) / CHAIN.MAX_BARS;
      c.series.forEach((v, i) => {
        const h = (Math.min(v, 200) / 200) * (BY0 - BY1);
        ctx.fillStyle = v >= 200 ? col.accent : col.cool;
        ctx.fillRect(BX0 + 2 + i * bw, BY0 - h, Math.max(1, bw - 2), h);
      });
    }
    function draw(ctx, env) {
      const wide = env.w / env.h > 1.6;
      const dw = wide ? 2 * W + 20 : W, dh = wide ? H : 2 * H + 16;
      const k = Math.min(env.w / dw, env.h / dh);
      const fs = Math.max(12, 12 / k);
      ctx.save();
      ctx.translate((env.w - dw * k) / 2, (env.h - dh * k) / 2);
      ctx.scale(k, k);
      drawCore(ctx, env);
      ctx.translate(wide ? W + 20 : 0, wide ? 0 : H + 16);
      drawBars(ctx, env, fs);
      ctx.restore();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 1.5,               // one press is three generations, and the run stops at generation 5
      init() { note.textContent = sentence(); report(); },
      onUnlock() { note.textContent = sentence(); report(); },
      update(dt) {
        if (!c.running) return;
        clock += dt;
        if (clock >= CHAIN.GEN_S - 1e-9) {
          clock = 0; nextGeneration(c, rods()); report();
          if (c.gen === CHAIN.STOP_GEN) { stopped = true; note.textContent = sentence(); report(); sim.hold(); }
        }
      },
      draw: draw,
      preset(name) {
        const r = { steady: 50, grow: 30, scram: 100 }[name];
        if (r === undefined) return;
        sRods.value = String(r);
        sRods.dispatchEvent(new Event('input'));
        c = newChain(); clock = 0; stopped = false;
        refresh();
      },
      record() {
        return {
          'Control rods in': rods() + '%',
          'k': kOf(rods()).toFixed(2),
          'Generation': c.gen,
          'Fissions in this generation': c.running ? Math.round(c.n) : 'start first'
        };
      }
    });

    sRods.addEventListener('input', refresh);
    startBtn.addEventListener('click', () => { if (!sim.committed) return; startChain(c); clock = 0; stopped = false; refresh(); sim.release(); });
    scramBtn.addEventListener('click', () => { if (!sim.committed) return; sRods.value = '100'; sRods.dispatchEvent(new Event('input')); refresh(); });
    resetBtn.addEventListener('click', () => { c = newChain(); clock = 0; stopped = false; sRods.value = '50'; sRods.dispatchEvent(new Event('input')); refresh(); sim.release(); });
    report();
  }

  document.addEventListener('DOMContentLoaded', function () { initDecay(); initFission(); initChain(); });
})();
