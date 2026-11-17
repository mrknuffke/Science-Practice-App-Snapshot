/* ============================================================
   LESSON 2-3: NEWTON'S THIRD LAW & MOMENTUM
   The Force Collider, built on TB.sim.create (RUNTIME_SPEC 4.3).
   Brief: docs/plans/textbook-sim-briefs.md, "Physics 2-3".

   The model: two carts, each with a spring bumper. The bumpers push only while
   they touch, and each pushes with the same force on the other cart (third law).
   A cart is drawn as a body CART_W long with a bumper BUMP long on each end, so
   the force turns on exactly when the drawn bumper tips touch. The run ends when
   the carts have been apart for a while, or when a cart reaches an end of the
   track, so no momentum is lost at a wall.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const PD = window.PD;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));

  const TRACK = 100;        // m
  const CART_W = 10;        // m, the body of a cart
  const BUMP = 2;           // m, the bumper on the front of each cart
  const TOUCH = CART_W + 2 * BUMP;   // m between centres when the bumper tips touch
  const K = 120;            // N/m, the stiffness of the bumper pair
  const X1 = 25, X2 = 65;   // m, the start positions
  const SUBSTEPS = 10;      // model steps per 1/60 s, so a hard hit never tunnels
  const APART = 3;          // s the carts stay apart before the run ends
  const GIVE_UP = 20;       // s without a touch
  const GRAPH_T = 1.0;      // s of force graph, counted from the first touch
  const PRESETS = { start: [2, 3, 6, -2], equal: [3, 3, 3, -3], truck: [1, 4, 9, -1], target: [4, 4, 4, 0] };

  function initCollider() {
    const box = $('[data-sim="collider"]');
    if (!box || !window.TB) return;
    const sl = { m1: $('#sliderMass1', box), v1: $('#sliderVel1', box), m2: $('#sliderMass2', box), v2: $('#sliderVel2', box) };
    const restartBtn = $('[data-restart]', box);

    const m = { x1: X1, x2: X2, v1: 0, v2: 0, t: 0, touchT: -1, contactEnded: false, apart: 0, f: 0, peak: 0, hist: [], over: false, endedBy: '' };
    let sim = null;
    let lastStatus = '';

    const mass1 = () => Number(sl.m1.value);
    const mass2 = () => Number(sl.m2.value);
    const setV1 = () => Number(sl.v1.value);
    const setV2 = () => Number(sl.v2.value);
    const pBefore = () => mass1() * setV1() + mass2() * setV2();
    const compression = () => Math.max(0, TOUCH - (m.x2 - m.x1));

    function begin() {
      m.x1 = X1; m.x2 = X2; m.v1 = setV1(); m.v2 = setV2();
      m.t = 0; m.touchT = -1; m.contactEnded = false; m.apart = 0; m.f = 0; m.peak = 0; m.hist = []; m.over = false; m.endedBy = '';
    }

    function finish(why) {
      m.over = true; m.endedBy = why;
      sim.hold();
    }

    function step(dt) {
      if (m.over) return;
      const h = dt / SUBSTEPS;
      const m1 = mass1(), m2 = mass2();
      for (let i = 0; i < SUBSTEPS; i++) {
        const x = compression();
        m.f = K * x;                     // zero unless the bumpers touch
        if (x > 0 && m.touchT < 0) m.touchT = m.t;
        m.v1 += (-m.f / m1) * h;         // force on cart 1 points left
        m.v2 += (m.f / m2) * h;          // force on cart 2 points right
        m.x1 += m.v1 * h;
        m.x2 += m.v2 * h;
        m.t += h;
        if (m.f > m.peak) m.peak = m.f;
      }
      if (m.touchT >= 0 && m.t - m.touchT <= GRAPH_T) m.hist.push([m.t - m.touchT, m.f]);
      if (m.touchT >= 0 && m.f === 0 && compression() === 0) { m.contactEnded = true; m.apart += dt; }
      if (m.x1 - CART_W / 2 <= 0 || m.x2 + CART_W / 2 >= TRACK) finish('a cart reached the end of the track');
      else if (m.contactEnded && m.apart >= APART) finish('the carts have moved apart');
      else if (m.touchT < 0 && m.t >= GIVE_UP) finish('the carts never touched');
    }

    function report() {
      const touching = m.f > 0;
      sim.setReadout('f1', touching ? '−' + m.f.toFixed(1) + ' N' : '0.0 N');
      sim.setReadout('f2', touching ? '+' + m.f.toFixed(1) + ' N' : '0.0 N');
      sim.setReadout('peak', m.touchT >= 0 ? m.peak.toFixed(1) + ' N' : '–');
      sim.setReadout('p1', PD.sign(mass1() * m.v1, 1) + ' kg·m/s');
      sim.setReadout('p2', PD.sign(mass2() * m.v2, 1) + ' kg·m/s');
      sim.setReadout('before', PD.sign(pBefore(), 1) + ' kg·m/s');
      sim.setReadout('after', m.contactEnded ? PD.sign(mass1() * m.v1 + mass2() * m.v2, 1) + ' kg·m/s' : '–');
      let s;
      if (m.over) s = ['ok', 'The run is over: ' + m.endedBy];
      else if (touching) s = ['warn', 'The bumpers are touching. Each cart pushes on the other'];
      else if (m.touchT >= 0) s = ['neutral', 'The carts have separated'];
      else s = ['neutral', m.t === 0 ? 'Ready' : 'The carts are rolling toward each other'];
      if (s[1] !== lastStatus) { lastStatus = s[1]; sim.setStatus(s[0], s[1]); }
    }

    function restart() {
      begin();
      sim.release();
      report();
      sim.redraw();
    }

    // The top of the force graph: the peak a full hit gives, so the axis holds still during the run.
    function topForce() {
      const m1 = mass1(), m2 = mass2();
      const mu = (m1 * m2) / (m1 + m2);
      const peak = (setV1() - setV2()) * Math.sqrt(mu * K);
      return Math.max(20, Math.ceil((peak * 1.15) / 10) * 10);
    }

    function drawTrack(ctx, env, r) {
      const c = env.colors;
      const left = 16, right = r.w - 16;
      const ppm = (right - left) / TRACK;
      const px = (x) => left + x * ppm;
      const ground = r.y + r.h - 20;
      ctx.strokeStyle = c.inkMute; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(left, ground); ctx.lineTo(right, ground); ctx.stroke();
      ctx.font = env.font(11, 'mono', 500); ctx.fillStyle = c.inkSoft; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const every = env.w < 520 ? 25 : 10;
      for (let x = 0; x <= TRACK; x += every) {
        ctx.strokeStyle = c.inkMute; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(px(x), ground - 4); ctx.lineTo(px(x), ground + 4); ctx.stroke();
        ctx.fillText(String(x), px(x), ground + 6);
      }
      const squash = compression() / 2;      // each bumper gives half the squeeze
      const top = ground - 30, bodyH = 22;
      const cart = (x, color, facing, mass, v) => {
        const bx = px(x - CART_W / 2), bw = CART_W * ppm;
        ctx.fillStyle = color;
        PD.roundRect(ctx, bx, top, bw, bodyH, 4); ctx.fill();
        // the bumper on the side that faces the other cart
        const len = (BUMP - squash) * ppm;
        ctx.fillStyle = c.ink;
        if (facing > 0) ctx.fillRect(bx + bw, top + 6, len, 10); else ctx.fillRect(bx - len, top + 6, len, 10);
        ctx.fillStyle = c.ink;
        ctx.beginPath(); ctx.arc(bx + bw * 0.25, ground - 4, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(bx + bw * 0.75, ground - 4, 4, 0, Math.PI * 2); ctx.fill();
        // the velocity arrow above the cart
        if (Math.abs(v) > 0.05) PD.arrow(ctx, px(x), top - 10, px(x) + v * 6, top - 10, c.ink, 2.5);
        PD.label(ctx, env, mass + ' kg', px(x), top - 24, { align: 'center', color: c.ink, size: 11 });
      };
      cart(m.x1, c.accent, 1, mass1(), m.v1);
      cart(m.x2, c.warn, -1, mass2(), m.v2);
    }

    function drawGraph(ctx, env, r) {
      const c = env.colors;
      const g = PD.graph(ctx, env, r, { xmin: 0, xmax: GRAPH_T, ymin: 0, ymax: topForce(), xlabel: 'Time since the bumpers touched (s)', ylabel: 'Force (N)', xticks: 5, yticks: 4 });
      if (!m.hist.length) {
        PD.label(ctx, env, 'No force yet', (g.left + g.right) / 2, (g.top + g.bottom) / 2, { align: 'center', color: c.inkSoft, size: 12, face: 'display' });
        return;
      }
      const pts = m.hist.map((h) => [g.px(h[0]), g.py(h[1])]);
      PD.line(ctx, pts, c.accent, 4);
      PD.line(ctx, pts, c.warn, 2, [6, 5]);
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 1,
      init() {
        // the start values, run until the bumpers are squeezed, so the first frame and a print show the force
        begin();
        for (let i = 0; i < 360 && !(m.touchT >= 0 && m.f > 0 && m.t - m.touchT > 0.12); i++) step(1 / 60);
        report();
      },
      onUnlock() { restart(); },
      update(dt) { step(dt); report(); },
      draw(ctx, env) {
        const trackH = PD.clamp(Math.round(env.h * 0.36), 90, 140);
        drawTrack(ctx, env, { x: 0, y: 0, w: env.w, h: trackH });
        drawGraph(ctx, env, { x: 0, y: trackH + 6, w: env.w, h: env.h - trackH - 6 });
      },
      preset(name) {
        const p = PRESETS[name];
        if (!p) return;
        [sl.m1, sl.v1, sl.m2, sl.v2].forEach((s, i) => { s.value = String(p[i]); s.dispatchEvent(new Event('input')); });
        restart();
      },
      record() {
        const done = m.contactEnded;
        const sgn = (v) => PD.sign(v, 1);
        return {
          'Masses (kg)': mass1() + ' and ' + mass2(),
          'Speeds before (m/s)': sgn(setV1()) + ' and ' + sgn(setV2()),
          'Peak force (N)': m.touchT >= 0 ? m.peak.toFixed(1) : '',
          'Momentum before': sgn(pBefore()),
          'Momentum after': done ? sgn(mass1() * m.v1 + mass2() * m.v2) : ''
        };
      }
    });

    Object.keys(sl).forEach((k) => sl[k].addEventListener('input', restart));
    restartBtn.addEventListener('click', restart);
  }

  document.addEventListener('DOMContentLoaded', initCollider);
})();
