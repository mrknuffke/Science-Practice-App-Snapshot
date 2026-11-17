/* ============================================================
   Lesson 2b-2: which reef keeps more of its fish when a disease kills one species?
   Built on TB.sim.create (docs/textbook/RUNTIME_SPEC.md, section 4.3).

   Two reefs hold the counts of the lesson's Table 2 (the PLC's Candy Coral
   Reef lab): Reef Alpha 6, 6, 6, 6, 6 and Reef Beta 26, 1, 1, 1, 1, with the
   species in the order clownfish, blue tang, yellow tang, parrotfish, coral
   beauty. A disease kills every fish of the chosen species (any of the five).
   The deaths are spread evenly over DISEASE_SECONDS, then the clock holds on
   the result, so every run ends on the same numbers:
     clownfish:           Alpha 24 fish, 4 species;  Beta 4 fish, 4 species
     any other species:   Alpha 24 fish, 4 species;  Beta 29 fish, 4 species
   "Draw 5 fish" rings five living fish in each reef at random, the blind
   draw of the lab. The fish layout is seeded, so the first frame (and a
   printed frame) is the same every time.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const SPECIES = ['Clownfish', 'Blue tang', 'Yellow tang', 'Parrotfish', 'Coral beauty'];
  const COLOR = ['rose', 'oxygen', 'atp', 'glucose', 'thermal'];   // the candy lab's red, blue, yellow, green, orange
  const COUNTS = { alpha: [6, 6, 6, 6, 6], beta: [26, 1, 1, 1, 1] };
  const DISEASE_SECONDS = 4;    // simulated seconds for a disease to run its course
  const FADE = 0.5;             // seconds a dead fish takes to fade from view
  const SAMPLE = 5;

  const box = document.querySelector('[data-sim="reef"]');
  if (!box || !window.TB) return;

  const chips = Array.from(box.querySelectorAll('[data-target]'));
  const sampleBtn = box.querySelector('[data-sample]');
  const diseaseBtn = box.querySelector('[data-disease]');
  const restartBtn = box.querySelector('[data-restart]');

  // a small seeded generator, so the reef layout is the same on every load
  function seeded(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeReef(counts, seed) {
    const rand = seeded(seed);
    const fish = [];
    counts.forEach((n, sp) => {
      for (let i = 0; i < n; i++) {
        fish.push({
          sp: sp,
          hx: 0.1 + 0.8 * rand(), hy: 0.16 + 0.72 * rand(),     // home point inside the tank
          ax: 0.03 + 0.05 * rand(), ay: 0.015 + 0.025 * rand(),  // how far it swims from home
          ph: rand() * Math.PI * 2, sp1: 0.5 + 0.6 * rand(),
          dieAt: -1, sampled: false
        });
      }
    });
    return fish;
  }

  const reefs = { alpha: [], beta: [] };
  const state = { target: 0, running: false, t: 0, swim: 0, hits: [] };
  let sim = null;
  let lastStatus = '';

  function restart() {
    reefs.alpha = makeReef(COUNTS.alpha, 11);
    reefs.beta = makeReef(COUNTS.beta, 29);
    state.running = false; state.t = 0; state.hits = [];
  }

  const living = (reef) => reefs[reef].filter((f) => f.dieAt < 0);

  // schedule the deaths: the k-th of m target fish dies at DISEASE_SECONDS * (k + 1) / m
  function release() {
    if (state.running) return;
    const sp = state.target;
    const victims = { alpha: living('alpha').filter((f) => f.sp === sp), beta: living('beta').filter((f) => f.sp === sp) };
    if (!victims.alpha.length && !victims.beta.length) return;
    state.t = 0;
    ['alpha', 'beta'].forEach((reef) => {
      reefs[reef].forEach((f) => { if (f.dieAt >= 0) f.dieAt = -2; });   // fish from an earlier run stay gone
      const m = victims[reef].length;
      victims[reef].forEach((f, k) => { f.dieAt = DISEASE_SECONDS * (k + 1) / m; });
      reefs[reef].forEach((f) => { f.sampled = false; });
    });
    state.hits.push(SPECIES[sp]);
    state.running = true;
  }

  // dieAt: -1 alive, -2 died in an earlier run, otherwise the time of death in this run
  function isDead(f) { return f.dieAt === -2 || (f.dieAt >= 0 && f.dieAt <= state.t + 1e-9); }
  function count(reef) { return reefs[reef].filter((f) => !isDead(f)).length; }
  function richness(reef) { return new Set(reefs[reef].filter((f) => !isDead(f)).map((f) => f.sp)).size; }

  function drawSample() {
    if (state.running) return;
    ['alpha', 'beta'].forEach((reef) => {
      const pool = reefs[reef].filter((f) => !isDead(f));
      reefs[reef].forEach((f) => { f.sampled = false; });
      for (let i = 0; i < SAMPLE && pool.length; i++) {
        const j = Math.floor(Math.random() * pool.length);
        pool[j].sampled = true;
        pool.splice(j, 1);
      }
    });
  }

  function sampleKinds(reef) {
    return new Set(reefs[reef].filter((f) => f.sampled && !isDead(f)).map((f) => f.sp)).size;
  }

  function step(dt) {
    state.swim += dt;
    if (!state.running) return;
    state.t += dt;
    if (state.t >= DISEASE_SECONDS - 1e-9) {
      state.t = DISEASE_SECONDS;
      ['alpha', 'beta'].forEach((reef) => reefs[reef].forEach((f) => { if (f.dieAt >= 0) f.dieAt = -2; }));
      state.running = false;
      sim.hold();
    }
  }

  function statusText() {
    if (state.running) return ['warn', 'The disease is spreading'];
    if (sim.held) return ['ok', 'The disease is over. Press Record.'];
    if (reefs.alpha.some((f) => f.sampled)) return ['neutral', 'Sample of 5: Alpha shows ' + sampleKinds('alpha') + ' species, Beta shows ' + sampleKinds('beta')];
    if (state.hits.length) return ['neutral', 'Alpha kept ' + count('alpha') + ' fish, Beta kept ' + count('beta')];
    return ['ok', 'Both reefs are healthy'];
  }

  function setControls() {
    chips.forEach((c) => {
      c.setAttribute('aria-pressed', Number(c.dataset.target) === state.target ? 'true' : 'false');
      c.disabled = state.running;
    });
    if (diseaseBtn) {
      const left = reefs.alpha.concat(reefs.beta).some((f) => f.sp === state.target && !isDead(f));
      diseaseBtn.disabled = state.running || !left;
    }
    if (sampleBtn) sampleBtn.disabled = state.running;
  }

  function report() {
    sim.setReadout('alpha-n', String(count('alpha')));
    sim.setReadout('alpha-s', String(richness('alpha')));
    sim.setReadout('beta-n', String(count('beta')));
    sim.setReadout('beta-s', String(richness('beta')));
    const st = statusText();
    if (st[1] !== lastStatus) { lastStatus = st[1]; sim.setStatus(st[0], st[1]); }
    setControls();
  }

  /* ---------- drawing ---------- */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawFish(ctx, x, y, size, dir, color) {
    const L = size * 1.6, H = size * 0.9;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, L / 2, H / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    const tx = x - dir * L / 2;
    ctx.beginPath();
    ctx.moveTo(tx + dir * 1, y);
    ctx.lineTo(tx - dir * size * 0.7, y - H * 0.55);
    ctx.lineTo(tx - dir * size * 0.7, y + H * 0.55);
    ctx.closePath();
    ctx.fill();
  }

  function drawTank(ctx, env, reef, label, T) {
    const c = env.colors;
    ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1.5;
    roundRect(ctx, T.x, T.y, T.w, T.h, 8); ctx.fill(); ctx.stroke();
    // sea floor
    ctx.fillStyle = c.paper2;
    roundRect(ctx, T.x + 1, T.y + T.h * 0.9, T.w - 2, T.h * 0.1 - 1, 6); ctx.fill();
    ctx.font = env.font(12, 'mono', 600);
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillStyle = c.inkSoft;
    ctx.fillText(label, T.x + 10, T.y + 14);

    const size = Math.max(5, Math.min(T.w, T.h) / 24);
    reefs[reef].forEach((f) => {
      let a = 1;
      if (f.dieAt === -2) return;
      if (f.dieAt >= 0 && state.t >= f.dieAt) {
        a = 1 - (state.t - f.dieAt) / FADE;
        if (a <= 0) return;
      }
      const s = state.swim * f.sp1 + f.ph;
      const fx = T.x + T.w * (f.hx + f.ax * Math.sin(s));
      const fy = T.y + 22 + (T.h * 0.9 - 26) * (f.hy + f.ay * Math.sin(2 * s)) * 0.95;
      const dir = Math.cos(s) >= 0 ? 1 : -1;
      ctx.globalAlpha = Math.max(0, Math.min(1, a));
      drawFish(ctx, fx, fy, size, dir, c[COLOR[f.sp]]);
      if (f.sampled) {
        ctx.strokeStyle = c.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(fx, fy, size * 1.45, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });
  }

  function draw(ctx, env) {
    const pad = 8, gap = 10;
    const w = (env.w - 2 * pad - gap) / 2;
    const h = env.h - 2 * pad;
    drawTank(ctx, env, 'alpha', 'Reef Alpha', { x: pad, y: pad, w: w, h: h });
    drawTank(ctx, env, 'beta', 'Reef Beta', { x: pad + w + gap, y: pad, w: w, h: h });
  }

  /* ---------- the sim ---------- */
  sim = window.TB.sim.create(box, {
    kind: 'canvas',
    loop: true,
    tokens: COLOR,
    init() {
      restart();
      report();
    },
    stepSeconds: 1,   // under reduced motion four Step presses run a whole disease
    update(dt) {
      step(dt);
      report();
    },
    draw: draw,
    record() {
      return {
        'Disease hit': state.hits.length ? state.hits.join(' + ') : 'None',
        'Alpha fish': count('alpha'),
        'Alpha species': richness('alpha'),
        'Beta fish': count('beta'),
        'Beta species': richness('beta')
      };
    }
  });

  chips.forEach((chip) => chip.addEventListener('click', () => {
    if (state.running) return;
    state.target = Number(chip.dataset.target);
    report();
  }));
  if (sampleBtn) sampleBtn.addEventListener('click', () => {
    drawSample();
    report();
    sim.redraw();
  });
  if (diseaseBtn) diseaseBtn.addEventListener('click', () => {
    release();
    sim.release();
    report();
    sim.redraw();
  });
  if (restartBtn) restartBtn.addEventListener('click', () => {
    restart();
    sim.release();
    report();
    sim.redraw();
  });
})();
