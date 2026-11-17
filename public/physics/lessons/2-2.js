/* ============================================================
   LESSON 2-2: NEWTON'S SECOND LAW & ACCELERATION
   The Acceleration Rig, built on TB.sim.create (RUNTIME_SPEC 4.3).
   Brief: docs/plans/textbook-sim-briefs.md, "Physics 2-2".

   The model: a = (applied force - friction) / mass. Friction opposes the motion.
   A cart at rest stays at rest when the push is no bigger than the friction. A
   moving cart slows down when the friction is bigger than the push, and stops.
   The run ends at the end of the 100 m track or after 10 s.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const PD = window.PD;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));

  const TRACK = 100;       // m
  const RUN = 10;          // s, the longest run
  const PX_PER_N = 0.55;   // arrow length for one newton, so 50 N is a fixed length
  const PRESETS = { base: { f: 20, m: 5, r: 0 }, force: { f: 40, m: 5, r: 0 }, mass: { f: 20, m: 10, r: 0 }, friction: { f: 36, m: 6, r: 12 } };

  function initRig() {
    const box = $('[data-sim="rig"]');
    if (!box || !window.TB) return;
    const slF = $('#sliderForceApp', box);
    const slM = $('#sliderMass', box);
    const slR = $('#sliderFriction', box);
    const restartBtn = $('[data-restart]', box);

    const m = { t: 0, x: 0, v: 0, hist: [[0, 0]], over: false };
    let sim = null;
    let lastStatus = '';

    const F = () => Number(slF.value);
    const M = () => Number(slM.value);
    const R = () => Number(slR.value);

    // The acceleration the cart has right now, with these settings.
    function accel() {
      const push = F() - R();
      if (m.v > 1e-9) return push / M();      // moving: friction opposes the motion
      return push > 0 ? push / M() : 0;       // at rest: friction holds the cart still
    }

    function step(dt) {
      if (m.over) return;
      const a = accel();
      m.v = Math.max(0, m.v + a * dt);
      m.x += m.v * dt;
      m.t += dt;
      if (Math.round(m.t * 60) % 6 === 0) m.hist.push([m.t, m.v]);
      if (m.x >= TRACK) { m.x = TRACK; m.over = true; m.hist.push([m.t, m.v]); sim.hold(); }
      else if (m.t >= RUN - 1e-9) { m.over = true; sim.hold(); }
    }

    function statusText() {
      if (m.over) return ['ok', m.x >= TRACK ? 'The cart reached the end of the track' : 'The run is over at 10 s'];
      const a = accel();
      if (m.t === 0) return ['neutral', 'Ready'];
      if (a < -1e-9) return ['warn', 'Friction is larger than the push, so the cart slows down'];
      if (m.v < 1e-9 && F() <= R()) return ['warn', 'The push is no bigger than friction, so the cart stays at rest'];
      return ['neutral', Math.abs(a) < 1e-9 ? 'The forces balance. The cart keeps a constant velocity' : 'The cart is speeding up'];
    }

    function report() {
      const a = accel();
      sim.setReadout('fnet', PD.sign(F() - R(), 1) + ' N');
      sim.setReadout('acc', PD.sign(a, 2) + ' m/s²');
      sim.setReadout('vel', m.v.toFixed(1) + ' m/s');
      sim.setReadout('pos', m.x.toFixed(1) + ' m');
      sim.setReadout('time', m.t.toFixed(2) + ' s');
      const s = statusText();
      if (s[1] !== lastStatus) { lastStatus = s[1]; sim.setStatus(s[0], s[1]); }
    }

    function restart() {
      m.t = 0; m.x = 0; m.v = 0; m.hist = [[0, 0]]; m.over = false;
      sim.release();
      report();
      sim.redraw();
    }

    // The v-t graph's top is the speed the first part of the run would reach, so the axes hold still.
    function topSpeed() {
      const a = (F() - R()) / M();
      if (a <= 0) return 5;
      return Math.max(5, Math.min(a * RUN, Math.sqrt(2 * a * TRACK)));
    }

    function drawTrack(ctx, env, r) {
      const c = env.colors;
      const left = 24, right = r.w - 24;
      const px = (x) => left + (x / TRACK) * (right - left);
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
      // the cart
      const cx = px(m.x), top = ground - 26;
      ctx.fillStyle = c.accent;
      PD.roundRect(ctx, cx - 18, top, 36, 16, 4); ctx.fill();
      ctx.fillStyle = c.ink;
      ctx.beginPath(); ctx.arc(cx - 10, ground - 6, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 10, ground - 6, 5, 0, Math.PI * 2); ctx.fill();
      // forces: the same scale for both arrows, from the middle of the cart
      const midY = top + 8;
      if (F() > 0) PD.arrow(ctx, cx + 20, midY, cx + 20 + F() * PX_PER_N, midY, c.accent, 3);
      if (R() > 0) PD.arrow(ctx, cx - 20, midY, cx - 20 - R() * PX_PER_N, midY, c.warn, 3);
      PD.line(ctx, [[12, r.y + 12], [12 + 50 * PX_PER_N, r.y + 12]], c.inkSoft, 3);
      PD.label(ctx, env, '50 N', 12 + 25 * PX_PER_N, r.y + 26, { align: 'center', color: c.inkSoft, size: 11 });
    }

    function drawGraph(ctx, env, r) {
      const c = env.colors;
      const g = PD.graph(ctx, env, r, { xmin: 0, xmax: RUN, ymin: 0, ymax: topSpeed(), xlabel: 'Time t (s)', ylabel: 'Velocity v (m/s)', xticks: 5, yticks: 4 });
      ctx.save();
      ctx.globalAlpha = 0.28; ctx.fillStyle = c.good;
      ctx.beginPath(); ctx.moveTo(g.px(0), g.py(0));
      m.hist.forEach((h) => ctx.lineTo(g.px(h[0]), g.py(Math.min(h[1], topSpeed()))));
      const last = m.hist[m.hist.length - 1];
      ctx.lineTo(g.px(last[0]), g.py(0)); ctx.closePath(); ctx.fill();
      ctx.restore();
      PD.line(ctx, m.hist.map((h) => [g.px(h[0]), g.py(Math.min(h[1], topSpeed()))]), c.cool, 3);
      ctx.fillStyle = c.cool;
      ctx.beginPath(); ctx.arc(g.px(m.t), g.py(Math.min(m.v, topSpeed())), 5, 0, Math.PI * 2); ctx.fill();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 1,
      init() {
        // a 3 s run at the defaults, so the first frame and a print show the graph
        for (let i = 0; i < 180; i++) step(1 / 60);
        report();
      },
      onUnlock() { restart(); },
      update(dt) { step(dt); report(); },
      draw(ctx, env) {
        const trackH = PD.clamp(Math.round(env.h * 0.3), 80, 130);
        drawTrack(ctx, env, { x: 0, y: 0, w: env.w, h: trackH });
        drawGraph(ctx, env, { x: 0, y: trackH + 6, w: env.w, h: env.h - trackH - 6 });
      },
      preset(name) {
        const p = PRESETS[name];
        if (!p) return;
        [[slF, p.f], [slM, p.m], [slR, p.r]].forEach((e) => { e[0].value = String(e[1]); e[0].dispatchEvent(new Event('input')); });
        restart();
      },
      record() {
        return {
          'Applied force (N)': F(),
          'Friction (N)': R(),
          'Mass (kg)': M(),
          'Acceleration (m/s²)': accel().toFixed(2)
        };
      }
    });

    [slF, slM, slR].forEach((s) => s.addEventListener('input', () => { report(); sim.redraw(); }));
    restartBtn.addEventListener('click', restart);
  }

  document.addEventListener('DOMContentLoaded', initRig);
})();
