/* ============================================================
   LESSON 2-1: NEWTON'S FIRST LAW & INERTIA
   Two sims, each built on TB.sim.create (RUNTIME_SPEC 4.3).
   Briefs: docs/plans/textbook-sim-briefs.md, "Physics 2-1a", "2-1b".
   1. Force Balancer: four forces on a pod, plus an Enrichment angled cable.
   2. FBD Selector (no motion): tick the forces that belong on the diagram.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const PD = window.PD;
  const { chipGroup } = PD;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));

  /* ---------- 1. Force Balancer ---------- */
  const MASS = 10;          // kg, so the weight is 98 N (g = 9.8 N/kg)
  const SIZE_MAX = 200;     // N, the top of every size slider
  const WORLD_W = 40;       // m across the stage
  const BALANCED = 0.5;     // N, a net force this small counts as zero (the sliders move in 1 N steps)
  const PRESETS = {
    coast: { right: 0, left: 0, up: 0, down: 0, cable: 0, angle: 30, vx: 4, x: -15, angled: false },
    crate: { right: 0, left: 0, up: 98, down: 98, cable: 0, angle: 30, vx: 0, x: 0, angled: false },
    cruise: { right: 70, left: 70, up: 98, down: 98, cable: 0, angle: 30, vx: 5, x: -12, angled: false },
    // The task is to find the cable size and the Left force, so the preset sets neither.
    angled: { right: 0, left: 0, up: 0, down: 98, cable: 100, angle: 30, vx: 0, x: 0, angled: true }
  };

  function heading(vx, vy) {
    if (Math.hypot(vx, vy) < 0.05) return 'at rest';
    const names = ['right', 'up and right', 'up', 'up and left', 'left', 'down and left', 'down', 'down and right'];
    const a = (Math.atan2(vy, vx) * 180) / Math.PI;
    return names[Math.round(((a + 360) % 360) / 45) % 8];
  }

  function initBalancer() {
    const box = $('[data-sim="balancer"]');
    if (!box || !window.TB) return;
    const sl = { right: $('#fRight', box), left: $('#fLeft', box), up: $('#fUp', box), down: $('#fDown', box), cable: $('#fCable', box), angle: $('#aCable', box) };
    const angledChip = $('[data-angled]', box);
    const angledBox = $('.angled-controls', box);
    const restartBtn = $('[data-restart]', box);

    const m = { x: 0, y: 0, vx: 0, vy: 0, x0: 0, vx0: 0, angled: false, halfH: 12.5 };
    let sim = null;
    let lastStatus = '';

    const size = (k) => Number(sl[k].value);

    function net() {
      const rad = (size('angle') * Math.PI) / 180;
      const cable = m.angled ? size('cable') : 0;
      let fx = size('right') - size('left') + cable * Math.cos(rad);
      let fy = size('up') - size('down') + cable * Math.sin(rad);
      if (Math.abs(fx) < 0.05) fx = 0;
      if (Math.abs(fy) < 0.05) fy = 0;
      return { fx, fy, mag: Math.hypot(fx, fy) };
    }

    function report() {
      const n = net();
      sim.setReadout('fx', PD.sign(n.fx, 1) + ' N');
      sim.setReadout('fy', PD.sign(n.fy, 1) + ' N');
      sim.setReadout('acc', (n.mag / MASS).toFixed(2) + ' m/s²');
      const speed = Math.hypot(m.vx, m.vy);
      sim.setReadout('vel', speed.toFixed(1) + ' m/s' + (speed < 0.05 ? '' : ' ' + heading(m.vx, m.vy)));
      const text = n.mag < BALANCED ? 'Forces balance. The velocity stays the same.' : 'The net force is not zero. The velocity changes.';
      if (text !== lastStatus) { lastStatus = text; sim.setStatus(n.mag < BALANCED ? 'ok' : 'warn', text); }
    }

    function resetPod() {
      m.x = m.x0; m.y = 0; m.vx = m.vx0; m.vy = 0;
      sim.release();
      report();
      sim.redraw();
    }

    function setAngled(on) {
      m.angled = on;
      angledBox.hidden = !on;
      angledChip.setAttribute('aria-pressed', String(on));
    }

    function setSlider(k, v) {
      sl[k].value = String(v);
      sl[k].dispatchEvent(new Event('input'));
    }

    function update(dt) {
      const n = net();
      m.vx += (n.fx / MASS) * dt;
      m.vy += (n.fy / MASS) * dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      // the pod comes back in on the opposite edge
      const halfW = WORLD_W / 2;
      if (m.x > halfW) m.x -= WORLD_W; else if (m.x < -halfW) m.x += WORLD_W;
      const height = 2 * m.halfH;
      if (m.y > m.halfH) m.y -= height; else if (m.y < -m.halfH) m.y += height;
      report();
    }

    function drawScene(ctx, env) {
      const c = env.colors;
      const ppm = env.w / WORLD_W;
      m.halfH = env.h / ppm / 2;
      const pxN = (0.4 * Math.min(env.w, env.h)) / SIZE_MAX;   // pixels for one newton
      const cx = env.w / 2 + m.x * ppm;
      const cy = env.h / 2 - m.y * ppm;
      // axes through the middle of the view
      ctx.save();
      ctx.strokeStyle = c.hairSoft; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, env.h / 2); ctx.lineTo(env.w, env.h / 2); ctx.moveTo(env.w / 2, 0); ctx.lineTo(env.w / 2, env.h); ctx.stroke();
      ctx.restore();
      // scale bar
      PD.line(ctx, [[12, env.h - 18], [12 + 50 * pxN, env.h - 18]], c.inkSoft, 3);
      PD.label(ctx, env, '50 N', 12 + 25 * pxN, env.h - 32, { align: 'center', color: c.inkSoft, size: 11 });
      // forces
      const rad = (size('angle') * Math.PI) / 180;
      const forces = [
        { name: 'Right', fx: size('right'), fy: 0 }, { name: 'Left', fx: -size('left'), fy: 0 },
        { name: 'Up', fx: 0, fy: size('up') }, { name: 'Down', fx: 0, fy: -size('down') }
      ];
      if (m.angled) forces.push({ name: 'Cable', fx: size('cable') * Math.cos(rad), fy: size('cable') * Math.sin(rad) });
      const arrowTo = (f, color, dashed, tag, side) => {
        const mag = Math.hypot(f.fx, f.fy);
        if (mag < 0.5) return;
        const tx = cx + f.fx * pxN, ty = cy - f.fy * pxN;
        ctx.save();
        if (dashed) ctx.setLineDash([5, 4]);
        PD.arrow(ctx, cx, cy, tx, ty, color, 3);
        ctx.restore();
        const ux = f.fx / mag, uy = -f.fy / mag;
        PD.label(ctx, env, tag + ' ' + Math.round(mag) + ' N', tx + ux * 12 - uy * side * 14, ty + uy * 12 + ux * side * 14, { align: 'center', color: dashed ? c.warn : c.ink, size: 11 });
      };
      forces.forEach((f) => arrowTo(f, c.accent, false, f.name, 1));
      const n = net();
      if (n.mag >= BALANCED) arrowTo(n, c.warn, true, 'Net', -1);
      // the pod, then its velocity
      ctx.fillStyle = c.card; ctx.strokeStyle = c.ink; ctx.lineWidth = 2;
      ctx.fillRect(cx - 14, cy - 14, 28, 28); ctx.strokeRect(cx - 14, cy - 14, 28, 28);
      ctx.fillStyle = c.accent;
      ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();
      const speed = Math.hypot(m.vx, m.vy);
      if (speed > 0.1) {
        PD.arrow(ctx, cx, cy + 22, cx + m.vx * 8, cy + 22 - m.vy * 8, c.cool, 3);
        PD.label(ctx, env, 'v ' + speed.toFixed(1) + ' m/s', cx, cy + 38, { align: 'center', color: c.cool, size: 11 });
      }
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 1,
      init() {
        // the hanging crate: the forces balance and the pod is at rest
        report();
      },
      onUnlock() { resetPod(); },
      update(dt) { update(dt); },
      draw(ctx, env) { drawScene(ctx, env); },
      preset(name) {
        const p = PRESETS[name];
        if (!p) return;
        setAngled(p.angled);
        ['right', 'left', 'up', 'down', 'cable', 'angle'].forEach((k) => setSlider(k, p[k]));
        m.x0 = p.x; m.vx0 = p.vx;
        resetPod();
      },
      record() {
        const n = net();
        const speed = Math.hypot(m.vx, m.vy);
        const did = n.mag >= BALANCED ? 'changed its velocity' : (speed > 0.05 ? 'kept moving at constant velocity' : 'stayed at rest');
        return { 'Net across (N)': PD.sign(n.fx, 1), 'Net up and down (N)': PD.sign(n.fy, 1), 'What the pod did': did };
      }
    });

    // a size slider changes the forces, never the pod's place or velocity
    Object.keys(sl).forEach((k) => sl[k].addEventListener('input', () => { report(); sim.redraw(); }));
    angledChip.addEventListener('click', () => { setAngled(!m.angled); report(); sim.redraw(); });
    restartBtn.addEventListener('click', resetPod);
  }

  /* ---------- 2. FBD Selector ---------- */
  const FORCE_NAMES = {
    fg: 'Gravity', fn: 'Normal force', drag: 'Air drag', motion: 'Forward force of motion', inertia: 'Force of inertia', fall: 'Force of downward fall'
  };
  // Where each arrow points, and where it sits so two arrows never share a line.
  const FORCE_ARROW = {
    fg: { dx: 0, dy: 1, off: -16 }, fall: { dx: 0, dy: 1, off: 16 }, fn: { dx: 0, dy: -1, off: -16 }, drag: { dx: 0, dy: -1, off: 16 },
    motion: { dx: 1, dy: 0, off: 0 }, inertia: { dx: -1, dy: 0, off: 0 }
  };
  const SCENARIOS = {
    puck: {
      name: 'Hockey puck on frictionless ice', short: 'Puck', motion: 'moving right',
      correct: ['fg', 'fn'],
      done: 'Gravity pulls down and the ice pushes up. The ice is frictionless, so no force acts along the ice. The puck glides because of inertia, not because of a forward force.'
    },
    skydiver: {
      name: 'Skydiver at constant speed', short: 'Skydiver', motion: 'falling',
      correct: ['fg', 'drag'],
      done: 'Gravity pulls down and air drag pushes up. The two forces are equal, so the net force is zero and the speed stays constant.'
    },
    crate: {
      name: 'Crate resting on a floor', short: 'Crate', motion: 'at rest',
      correct: ['fg', 'fn'],
      done: 'Gravity pulls down and the floor pushes up with the same size. The forces cancel, so the crate stays at rest.'
    }
  };
  // Why a wrong tick is tempting, and why it does not belong. Keyed by the force, then by what is special about the scenario.
  const WHY_NOT = {
    motion: 'It seems that a moving object needs a push. It does not. A moving object keeps its velocity when the forces balance, and no force is needed to keep it going.',
    inertia: 'Inertia is how much a mass resists a change in its motion. It is a property of the object, not a push or a pull from something else, so it never goes on a diagram.',
    fall: 'Falling can feel like it has its own force. The only force that pulls the object down is gravity, and gravity is already on your diagram.',
    fn: { skydiver: 'The skydiver touches no surface, so no surface pushes up. The air pushes up instead, and that force is air drag.', _: 'It belongs only when a surface touches the object.' },
    drag: { puck: 'The puck moves slowly, and the diagram ignores air. The only vertical forces are gravity and the ice pushing up.', crate: 'The crate is at rest, and drag needs motion through the air. No drag acts on it.', _: 'It does not belong here.' },
  };
  const MISSING = {
    fg: 'Gravity is missing. Earth pulls on every object, so gravity belongs on every diagram here.',
    fn: 'The normal force is missing. The surface touches the object and pushes up on it.',
    drag: 'Air drag is missing. At constant speed the air pushes up with a force equal to gravity.'
  };

  function initFbd() {
    const box = $('[data-sim="fbd"]');
    if (!box || !window.TB) return;
    const chips = $$('[data-scenario]', box);
    const ticks = $$('input[type="checkbox"]', box);
    const checkBtn = $('[data-check]', box);
    const clearBtn = $('[data-clear]', box);
    const work = $('[data-work]', box);
    let sim = null;
    let key = 'puck';
    let result = null;   // null until the diagram is checked, then 'Correct' or 'n problems'

    const ticked = () => ticks.filter((t) => t.checked).map((t) => t.value);
    const wordsOf = (list) => list.map((k) => FORCE_NAMES[k]).join(', ');

    function show() {
      const t = ticked();
      sim.setReadout('scenario', SCENARIOS[key].short);
      sim.setReadout('ticked', String(t.length));
      sim.setReadout('result', result || '–');
      sim.redraw();
    }

    function check() {
      const sc = SCENARIOS[key];
      const t = ticked();
      const wrong = t.filter((k) => !sc.correct.includes(k));
      const missing = sc.correct.filter((k) => !t.includes(k));
      const lines = [];
      wrong.forEach((k) => {
        const why = WHY_NOT[k];
        lines.push('You ticked "' + FORCE_NAMES[k] + '". ' + (typeof why === 'string' ? why : (why[key] || why._)));
      });
      missing.forEach((k) => lines.push(MISSING[k]));
      if (!t.length) {
        result = null;
        work.textContent = '';
        sim.setStatus('warn', 'Tick at least one force first');
        show();
        return;
      }
      if (!lines.length) {
        result = 'Correct';
        work.textContent = sc.done;
        sim.setStatus('ok', 'Correct diagram: ' + wordsOf(t));
      } else {
        result = lines.length + (lines.length === 1 ? ' problem' : ' problems');
        work.innerHTML = lines.map((l) => '<p>' + l + '</p>').join('');
        sim.setStatus('warn', 'Not yet: ' + result);
      }
      show();
    }

    function resetTicks() {
      ticks.forEach((t) => { t.checked = false; });
      result = null;
      work.textContent = '';
      sim.setStatus('neutral', 'Tick the forces, then press Check');
      show();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: false,
      init() { show(); },
      onUnlock() { show(); },
      draw(ctx, env) {
        const c = env.colors;
        const sc = SCENARIOS[key];
        const cx = env.w / 2, cy = env.h / 2;
        const len = Math.min(env.h * 0.32, 90);
        ctx.fillStyle = c.card; ctx.strokeStyle = c.ink; ctx.lineWidth = 2;
        PD.roundRect(ctx, cx - 26, cy - 16, 52, 32, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = c.accent;
        ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();
        PD.label(ctx, env, sc.short + ', ' + sc.motion, 10, 14, { color: c.inkSoft, size: 12, face: 'display' });
        const t = ticked();
        if (!t.length) PD.label(ctx, env, 'Tick a force', cx, env.h - 18, { align: 'center', color: c.inkSoft, size: 12, face: 'display' });
        t.forEach((k) => {
          const a = FORCE_ARROW[k];
          const sx = cx + (a.dy !== 0 ? a.off : 0), sy = cy + (a.dx !== 0 ? a.off : 0);
          const ex = sx + a.dx * len, ey = sy + a.dy * len;
          PD.arrow(ctx, sx, sy, ex, ey, c.accent, 3);
          PD.label(ctx, env, FORCE_NAMES[k], ex + a.dx * 10 + (a.dy !== 0 ? Math.sign(a.off) * 8 : 0), ey + a.dy * 12, { align: a.dx > 0 ? 'left' : a.dx < 0 ? 'right' : (a.off < 0 ? 'right' : 'left'), color: c.ink, bg: c.paper, size: 11 });
        });
      },
      record() {
        const t = ticked();
        return { 'Scenario': SCENARIOS[key].short, 'Forces chosen': t.length ? wordsOf(t) : '', 'Result': result || '' };
      }
    });

    chipGroup(chips, 'scenario', (k) => { key = k; resetTicks(); });
    ticks.forEach((t) => t.addEventListener('change', () => { result = null; work.textContent = ''; sim.setStatus('neutral', 'Tick the forces, then press Check'); show(); }));
    checkBtn.addEventListener('click', check);
    clearBtn.addEventListener('click', resetTicks);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initBalancer();
    initFbd();
  });
})();
