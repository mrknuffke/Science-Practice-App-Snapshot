/* ============================================================
   Lesson 2b-4: how much of the energy in plants reaches the top of a food chain?
   Built on TB.sim.create (docs/textbook/RUNTIME_SPEC.md, section 4.3).

   Four levels, drawn as blocks of small squares (one square per unit of
   energy). The plants start with 1,000 units. Each "Pass energy up" moves one
   level: the units that pass up fly to the next block, and the rest turn
   heat-coloured and fade. The clock holds after each transfer.

   Step sizes come from the lesson's Table 1 (Silver Springs, Odum 1957, as
   redrawn in OpenStax Biology 2e): 3,368/20,810, 383/3,368 and 21/383. Each
   level is rounded to a whole unit, so every run ends on the same numbers:
     Silver Springs:   1,000  162  18  1
     10% every step:   1,000  100  10  1
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const LEVELS = ['Plants', 'Plant-eaters', 'Fish', 'Top fish'];
  const START = 1000;
  const STEPS = {
    springs: [3368 / 20810, 383 / 3368, 21 / 383],
    flat: [0.1, 0.1, 0.1]
  };
  const STEP_LABEL = { springs: 'Silver Springs', flat: '10% every step' };
  const TRANSFER_SECONDS = 2;   // simulated seconds for one level's energy to move up

  const box = document.querySelector('[data-sim="energy"]');
  if (!box || !window.TB) return;

  const chips = Array.from(box.querySelectorAll('[data-steps]'));
  const passBtn = box.querySelector('[data-pass]');
  const restartBtn = box.querySelector('[data-restart]');

  // units[k]: whole units that reached level k
  function unitsFor(mode) {
    const u = [START];
    STEPS[mode].forEach((f, k) => u.push(Math.round(u[k] * f)));
    return u;
  }

  const state = { mode: 'springs', units: unitsFor('springs'), reached: 0, moving: false, t: 0 };
  let sim = null;
  let lastStatus = '';

  function restart() {
    state.units = unitsFor(state.mode);
    state.reached = 0;
    state.moving = false;
    state.t = 0;
  }

  function pass() {
    if (state.moving || state.reached >= LEVELS.length - 1) return;
    state.moving = true;
    state.t = 0;
  }

  function step(dt) {
    if (!state.moving) return;
    state.t += dt;
    if (state.t >= TRANSFER_SECONDS - 1e-9) {
      state.t = 0;
      state.moving = false;
      state.reached += 1;
      sim.hold();
    }
  }

  const shown = (k) => (k <= state.reached ? state.units[k] : 0);
  const lost = () => START - state.units[state.reached];
  const fmt = (n) => n.toLocaleString('en-US');

  function statusText() {
    if (state.moving) return ['warn', 'Energy is moving up to the ' + LEVELS[state.reached + 1].toLowerCase()];
    if (state.reached === 0) return ['ok', '1,000 units of energy are stored in the plants'];
    if (state.reached === LEVELS.length - 1) return ['ok', 'The top fish got ' + state.units[3] + ' unit. Press Record.'];
    const k = state.reached;
    return ['neutral', fmt(state.units[k]) + ' units reached the ' + LEVELS[k].toLowerCase() + '. ' + fmt(state.units[k - 1] - state.units[k]) + ' left as heat and waste.'];
  }

  function setControls() {
    chips.forEach((c) => {
      c.setAttribute('aria-pressed', c.dataset.steps === state.mode ? 'true' : 'false');
      c.disabled = state.moving;
    });
    if (passBtn) passBtn.disabled = state.moving || state.reached >= LEVELS.length - 1;
  }

  function report() {
    LEVELS.forEach((_, k) => sim.setReadout('l' + k, k <= state.reached ? fmt(state.units[k]) : 'not yet'));
    sim.setReadout('lost', fmt(lost()));
    const st = statusText();
    if (st[1] !== lastStatus) { lastStatus = st[1]; sim.setStatus(st[0], st[1]); }
    setControls();
  }

  /* ---------- drawing ---------- */
  const colsFor = (n) => Math.max(1, Math.round(Math.sqrt(n * 2)));

  // Where each square of each level sits. Top fish at the top, plants at the bottom.
  function layout(env) {
    const labelW = Math.min(120, env.w * 0.26);
    const areaW = env.w - labelW - 70;
    const rows = state.units.map((n) => Math.ceil(n / colsFor(n)));
    const pad = 22;
    const s = Math.max(2.5, Math.min(areaW / colsFor(state.units[0]), (env.h - pad * 5) / rows.reduce((a, b) => a + b, 0)));
    const blocks = [];
    let y = pad;
    for (let k = LEVELS.length - 1; k >= 0; k--) {
      const n = state.units[k];
      const cols = colsFor(n);
      const w = cols * s;
      const x = labelW + (areaW - w) / 2;
      blocks[k] = { x: x, y: y, cols: cols, rows: rows[k], h: rows[k] * s, w: w };
      y += rows[k] * s + pad;
    }
    return { s: s, blocks: blocks, labelW: labelW, areaW: areaW };
  }

  const cell = (b, i, s) => ({ x: b.x + (i % b.cols) * s, y: b.y + Math.floor(i / b.cols) * s });

  function draw(ctx, env) {
    const c = env.colors;
    const L = layout(env);
    const s = L.s;
    const gap = s > 4 ? 1 : 0.5;
    ctx.textBaseline = 'middle';

    LEVELS.forEach((name, k) => {
      const b = L.blocks[k];
      const n = state.units[k];
      const mid = b.y + b.h / 2;
      ctx.font = env.font(12, 'mono', 600);
      ctx.textAlign = 'left';
      ctx.fillStyle = c.ink;
      ctx.fillText(name, 8, mid);
      ctx.font = env.font(12, 'mono', 400);
      ctx.fillStyle = c.inkSoft;
      ctx.textAlign = 'left';
      ctx.fillText(k <= state.reached ? fmt(n) : '?', b.x + b.w + 8, mid);

      // a level the energy has not reached yet shows nothing, so the block size never gives the answer away
      ctx.lineWidth = 1;
      if (k > state.reached) return;
      const spent = k < state.reached || (state.moving && k === state.reached);
      for (let i = 0; i < n; i++) {
        const p = cell(b, i, s);
        if (state.moving && k === state.reached) {
          const f = Math.min(1, state.t / TRANSFER_SECONDS);
          if (i < state.units[k + 1]) {
            // this unit passes up: fly to its square in the next block
            const q = cell(L.blocks[k + 1], i, s);
            ctx.fillStyle = c.glucose;
            ctx.fillRect(p.x + (q.x - p.x) * f, p.y + (q.y - p.y) * f, s - gap, s - gap);
          } else {
            // this unit leaves as heat and waste: drift right and fade
            ctx.globalAlpha = 1 - f;
            ctx.fillStyle = c.thermal;
            ctx.fillRect(p.x + 24 * f, p.y - 6 * f, s - gap, s - gap);
            ctx.globalAlpha = 1;
          }
        } else if (spent) {
          ctx.strokeStyle = c.hair;
          ctx.strokeRect(p.x + 0.5, p.y + 0.5, s - gap - 1, s - gap - 1);
        } else {
          ctx.fillStyle = c.glucose;
          ctx.fillRect(p.x, p.y, s - gap, s - gap);
        }
      }
    });
  }

  /* ---------- the sim ---------- */
  sim = window.TB.sim.create(box, {
    kind: 'canvas',
    loop: true,
    tokens: ['glucose', 'thermal'],
    init() {
      restart();
      report();
    },
    stepSeconds: 1,   // under reduced motion two Step presses move one level
    update(dt) {
      step(dt);
      report();
    },
    draw: draw,
    record() {
      return {
        'Step sizes': STEP_LABEL[state.mode],
        'Plants': fmt(shown(0)),
        'Plant-eaters': fmt(shown(1)),
        'Fish': fmt(shown(2)),
        'Top fish': fmt(shown(3))
      };
    }
  });

  chips.forEach((chip) => chip.addEventListener('click', () => {
    if (state.moving) return;
    state.mode = chip.dataset.steps;
    restart();
    sim.release();
    report();
    sim.redraw();
  }));
  if (passBtn) passBtn.addEventListener('click', () => {
    pass();
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
