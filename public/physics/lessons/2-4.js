/* ============================================================
   LESSON 2-4: FRICTION MODELS & INCLINED PLANES
   The Incline Sandbox, built on TB.sim.create (RUNTIME_SPEC 4.3).
   Brief: docs/plans/textbook-sim-briefs.md, "Physics 2-4".

   The model: a block on a ramp. It slips when tan(angle) is bigger than the
   static coefficient. A sliding block speeds up at g(sin - mu_k cos). If the ramp
   is lowered while it slides, the block slows down and stops, and it does not
   stop dead. Core view: the three forces on the block. Enrichment view: the two
   parts of the weight (dashed), the critical angle and an acceleration graph.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const PD = window.PD;
  const $ = (s, r) => (r || document).querySelector(s);

  const G = 9.8;
  const RAMP_M = 8;          // m, the length of the ramp
  const START_M = 1;         // m, the block starts this far below the top
  const PX_PER_N = 0.45;     // arrow length for one newton, so 50 N is a fixed length
  const SURFACES = {
    teflon: { name: 'Teflon on Teflon', muS: 0.04, muK: 0.04 },
    ice: { name: 'Ice on wood', muS: 0.10, muK: 0.05 },
    wood: { name: 'Wood on wood', muS: 0.50, muK: 0.35 },
    rubber: { name: 'Rubber on concrete', muS: 0.90, muK: 0.70 }
  };
  const rad = (d) => (d * Math.PI) / 180;
  const deg = (r) => (r * 180) / Math.PI;

  function initIncline() {
    const box = $('[data-sim="incline"]');
    if (!box || !window.TB) return;
    const slA = $('#sliderAngle', box);
    const slM = $('#sliderMass', box);
    const enrChip = $('[data-enrichment-view]', box);
    const restartBtn = $('[data-restart]', box);
    const enrReadouts = ['crit', 'along', 'into', 'fric'].map((k) => $('[data-readout="' + k + '"]', box));

    const m = { surf: 'wood', s: START_M, v: 0, sliding: false, slipAngle: null, bottom: false, enr: false };
    let sim = null;
    let lastStatus = '';

    const angle = () => Number(slA.value);
    const mass = () => Number(slM.value);
    const mu = () => SURFACES[m.surf];
    const critical = () => deg(Math.atan(mu().muS));

    function forces() {
      const th = rad(angle());
      const w = mass() * G;
      const along = w * Math.sin(th), into = w * Math.cos(th);
      const friction = m.sliding ? mu().muK * into : (m.bottom ? mu().muS * into : Math.min(along, mu().muS * into));
      return { w, along, into, friction };
    }

    function blockText() {
      if (m.bottom) return 'Stopped at the bottom';
      if (m.sliding) return (G * (Math.sin(rad(angle())) - mu().muK * Math.cos(rad(angle())))) < 0 ? 'Slowing down' : 'Sliding';
      return m.s > START_M + 1e-9 ? 'Stopped' : 'At rest';
    }

    function report() {
      sim.setReadout('angle', angle() + '°');
      sim.setReadout('block', blockText());
      const f = forces();
      sim.setReadout('crit', critical().toFixed(1) + '°');
      sim.setReadout('along', f.along.toFixed(1) + ' N');
      sim.setReadout('into', f.into.toFixed(1) + ' N');
      sim.setReadout('fric', f.friction.toFixed(1) + ' N');
      let text, state = 'neutral';
      if (m.bottom) { text = 'The block reached the bottom of the ramp'; state = 'ok'; }
      else if (m.sliding) { text = blockText() + ': the weight along the ramp beats the friction'; state = 'warn'; }
      else if (m.s > START_M + 1e-9) { text = 'The block stopped on the ramp'; }
      else text = 'The block is at rest. Static friction holds it';
      if (text !== lastStatus) { lastStatus = text; sim.setStatus(state, text); }
    }

    function restart() {
      m.s = START_M; m.v = 0; m.sliding = false; m.slipAngle = null; m.bottom = false;
      slA.value = '0';
      slA.dispatchEvent(new Event('input'));
      sim.release();
      report();
      sim.redraw();
    }

    function update(dt) {
      if (m.bottom) return;
      const th = rad(angle());
      if (!m.sliding && Math.tan(th) > mu().muS + 1e-9) {
        m.sliding = true;
        // the ramp moves in 1 degree steps, so the slip happens at the first step above the critical angle
        if (m.slipAngle === null) m.slipAngle = Math.min(angle(), Math.floor(critical()) + 1);
      }
      if (m.sliding) {
        const a = G * (Math.sin(th) - mu().muK * Math.cos(th));
        m.v += a * dt;
        if (m.v <= 0) { m.v = 0; m.sliding = false; }
        else {
          m.s += m.v * dt;
          if (m.s >= RAMP_M) { m.s = RAMP_M; m.v = 0; m.sliding = false; m.bottom = true; sim.hold(); }
        }
      }
      report();
    }

    function setEnrichment(on) {
      m.enr = on;
      enrChip.setAttribute('aria-pressed', String(on));
      enrReadouts.forEach((el) => { if (el) el.hidden = !on; });
      sim.redraw();
    }

    function drawRamp(ctx, env, r) {
      const c = env.colors;
      const th = rad(angle());
      const ground = r.y + r.h - 16;
      const x0 = r.x + 24;
      const len = Math.min((r.w - 60) * 0.95, (r.h - 40) * 0.95 / Math.max(Math.sin(rad(75)), 0.01));
      const ux = Math.cos(th), uy = -Math.sin(th);          // up the ramp, in screen coordinates
      const nx = -Math.sin(th), ny = -Math.cos(th);         // out of the ramp surface
      const topX = x0 + len * ux, topY = ground + len * uy;
      ctx.fillStyle = c.hair; ctx.strokeStyle = c.inkMute; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, ground); ctx.lineTo(topX, ground); ctx.lineTo(topX, topY); ctx.closePath(); ctx.fill(); ctx.stroke();
      // the angle
      PD.label(ctx, env, angle() + '°', x0 + 56, ground - 14, { color: c.ink, size: 12 });
      // the block, sitting on the surface at distance s from the top
      const pxPerM = len / RAMP_M;
      const bw = 44, bh = 26;
      const px = topX - m.s * pxPerM * ux, py = topY - m.s * pxPerM * uy;
      const cx = px + nx * bh / 2, cy = py + ny * bh / 2;
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(-th);
      ctx.fillStyle = c.accent; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
      ctx.restore();
      // forces on the block
      const f = forces();
      const k = PX_PER_N;
      PD.arrow(ctx, cx, cy, cx, cy + f.w * k, c.bad, 3);
      PD.label(ctx, env, 'Weight', cx + 6, cy + f.w * k + 12, { align: 'left', color: c.ink, bg: c.paper, size: 11 });
      const sx = px + ux * 14, sy = py + uy * 14;        // the contact point, a little uphill of the block's middle
      PD.arrow(ctx, sx, sy, sx + nx * f.into * k, sy + ny * f.into * k, c.good, 3);
      PD.label(ctx, env, 'Normal', sx + nx * f.into * k - 8, sy + ny * f.into * k - 8, { align: 'right', color: c.ink, bg: c.paper, size: 11 });
      if (f.friction > 0.5) {
        PD.arrow(ctx, sx, sy, sx + ux * f.friction * k, sy + uy * f.friction * k, c.warn, 3);
        PD.label(ctx, env, 'Friction', sx + ux * f.friction * k + 8, sy + uy * f.friction * k - 8, { align: 'left', color: c.ink, bg: c.paper, size: 11 });
      }
      if (m.enr) {
        // the two parts of the weight, dashed, because they are parts and not extra forces
        ctx.save(); ctx.setLineDash([5, 4]);
        PD.arrow(ctx, cx, cy, cx - ux * f.along * k, cy - uy * f.along * k, c.ink, 2);
        PD.arrow(ctx, cx, cy, cx - nx * f.into * k, cy - ny * f.into * k, c.ink, 2);
        ctx.restore();
        PD.label(ctx, env, 'Along the ramp', cx - ux * f.along * k - 6, cy - uy * f.along * k + 16, { align: 'right', color: c.ink, bg: c.paper, size: 11 });
      }
      PD.line(ctx, [[r.x + 12, r.y + 14], [r.x + 12 + 50 * k, r.y + 14]], c.inkSoft, 3);
      PD.label(ctx, env, '50 N', r.x + 12 + 25 * k, r.y + 28, { align: 'center', color: c.inkSoft, size: 11 });
    }

    function drawGraph(ctx, env, r) {
      const c = env.colors;
      const g = PD.graph(ctx, env, r, { xmin: 0, xmax: 75, ymin: 0, ymax: 10, xlabel: 'Ramp angle (degrees)', ylabel: 'Acceleration (m/s²)', xticks: 5, yticks: 4 });
      const pts = [];
      for (let d = 0; d <= 75; d += 1) {
        const th = rad(d);
        const a = Math.tan(th) > mu().muS ? G * (Math.sin(th) - mu().muK * Math.cos(th)) : 0;
        pts.push([g.px(d), g.py(a)]);
      }
      PD.line(ctx, pts, c.accent, 3);
      PD.line(ctx, [[g.px(critical()), g.top], [g.px(critical()), g.bottom]], c.inkMute, 1, [3, 4]);
      PD.label(ctx, env, 'Critical angle ' + critical().toFixed(1) + '°', g.px(critical()) + 6, g.top + 12, { align: 'left', color: c.ink, size: 11 });
      const th = rad(angle());
      const a = Math.tan(th) > mu().muS ? G * (Math.sin(th) - mu().muK * Math.cos(th)) : 0;
      ctx.fillStyle = c.ink;
      ctx.beginPath(); ctx.arc(g.px(angle()), g.py(a), 5, 0, Math.PI * 2); ctx.fill();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 0.5,
      init() {
        // a ramp at 15 degrees with the block at rest, so the first frame shows the forces
        slA.value = '15';
        slA.dispatchEvent(new Event('input'));
        m.sliding = false; m.s = START_M;
        report();
      },
      onUnlock() { restart(); },
      update(dt) { update(dt); },
      draw(ctx, env) {
        if (m.enr) {
          const rampH = Math.round(env.h * 0.6);
          drawRamp(ctx, env, { x: 0, y: 0, w: env.w, h: rampH });
          drawGraph(ctx, env, { x: 0, y: rampH + 6, w: env.w, h: env.h - rampH - 6 });
        } else drawRamp(ctx, env, { x: 0, y: 0, w: env.w, h: env.h });
      },
      preset(name) {
        if (!SURFACES[name]) return;
        m.surf = name;
        restart();
      },
      record() {
        return { 'Surface': mu().name, 'Mass (kg)': mass(), 'Slipped at (°)': m.slipAngle === null ? 'did not slip' : m.slipAngle };
      }
    });

    slA.addEventListener('input', () => { report(); sim.redraw(); });
    slM.addEventListener('input', () => { restart(); });
    enrChip.addEventListener('click', () => setEnrichment(!m.enr));
    restartBtn.addEventListener('click', restart);
  }

  document.addEventListener('DOMContentLoaded', initIncline);
})();
