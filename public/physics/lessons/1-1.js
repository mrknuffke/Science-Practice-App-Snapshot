/* ============================================================
   LESSON 1-1: CONSTANT VELOCITY & 1D MOTION
   1. Vector Direction Builder (a kept tool: question, prediction, live output)
   2. Velocity Unit Converter (a kept tool: question, prediction, live output)
   3. Mars Rover 1D Navigator, built on TB.sim.create (RUNTIME_SPEC 4.3).
   Brief: docs/plans/textbook-sim-briefs.md, "Physics 1-1c".

   The rover model: x = x0 + v t, clamped to the ends of the track, for a run of
   20 s. The clock stops exactly at 10 s (a data mark) so a student records the
   position after 10 s. Time is counted in whole 1/60 s steps, so the mark is exact.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const PD = window.PD;

  /* ---------- the two kept tools: no model change ---------- */
  // Each tool locks its controls and shows a dash until its prediction is committed.
  function gateTool(box, show) {
    const gate = box.querySelector('[data-sim-gate]');
    const controls = box.querySelector('.sim-controls');
    const readouts = box.querySelectorAll('.readout-value');
    controls.setAttribute('inert', '');
    readouts.forEach((el) => { el.textContent = '–'; });
    gate.addEventListener('tb:commit', () => {
      controls.removeAttribute('inert');
      show();
    });
  }

  function initVectorBuilder() {
    const box = document.getElementById('vectorMiniBox');
    const startSlider = document.getElementById('vmbStartPos');
    const dispSlider = document.getElementById('vmbDisp');
    if (!box || !startSlider || !dispSlider) return;
    const startReadout = document.getElementById('vmbStartReadout');
    const dispReadout = document.getElementById('vmbDispReadout');
    const finalReadout = document.getElementById('vmbFinalReadout');
    const expEl = document.getElementById('vmbExplanation');

    function update() {
      const xi = parseInt(startSlider.value, 10);
      const dx = parseInt(dispSlider.value, 10);
      const xf = xi + dx;
      const xiSign = xi >= 0 ? `+${xi}` : `${xi}`;
      const dxSign = dx >= 0 ? `+${dx}` : `${dx}`;
      const xfSign = xf >= 0 ? `+${xf}` : `${xf}`;
      startReadout.textContent = `${xiSign} m`;
      dispReadout.textContent = `${dxSign} m`;
      finalReadout.textContent = `${xfSign} m`;
      expEl.innerHTML = `<em>x</em><sub>f</sub> = <em>x</em><sub>i</sub> + &Delta;<em>x</em> = (${xiSign} m) + (${dxSign} m) = ${xfSign} m.`;
    }
    startSlider.addEventListener('input', update);
    dispSlider.addEventListener('input', update);
    gateTool(box, update);
  }

  function initUnitConverter() {
    const box = document.getElementById('unitConvertBox');
    const speedInput = document.getElementById('speedInput');
    const speedOutput = document.getElementById('speedOutput');
    const unitWork = document.getElementById('unitWork');
    if (!box || !speedInput || !speedOutput) return;

    function update() {
      const kmh = parseFloat(speedInput.value) || 0;
      const ms = kmh / 3.6;
      speedOutput.textContent = `${ms.toFixed(2)} m/s`;
      unitWork.textContent = `Conversion: (${kmh} km / 1 h) × (1,000 m / 1 km) × (1 h / 3,600 s) = ${kmh} ÷ 3.6 = ${ms.toFixed(2)} m/s.`;
    }
    speedInput.addEventListener('input', update);
    gateTool(box, update);
  }

  /* ---------- the rover ---------- */
  const X_MIN = -20;           // m, left end of the track and of the graph
  const X_MAX = 110;           // m, right end
  const RUN = 1200;            // steps in a run (20 s)
  const MARK = 600;            // the clock stops here (10 s)
  const FLAGS = [{ x: 30, name: 'Sample A', token: 'warn' }, { x: 75, name: 'Sample B', token: 'good' }];
  const PRESETS = { a: { x0: 0, v: 5 }, b: { x0: 0, v: 7.5 }, return: { x0: 80, v: -4 } };

  function initRover() {
    const box = document.querySelector('[data-sim="rover"]');
    if (!box || !window.TB) return;
    const slider = box.querySelector('#roverVel');
    const restartBtn = box.querySelector('[data-restart]');

    const m = { x0: 0, v: 5, n: 0, x: 0, hist: [[0, 0]], arrived: {}, atEnd: false };
    let sim = null;
    let lastStatus = '';

    const time = () => m.n / 60;
    const slope = () => (m.n > 0 ? (m.x - m.x0) / time() : null);

    function restartModel() {
      m.n = 0; m.x = m.x0; m.hist = [[0, m.x0]]; m.arrived = {}; m.atEnd = false;
    }

    function step() {
      if (m.n >= RUN) return;
      m.n++;
      const raw = m.x0 + m.v * time();
      m.x = PD.clamp(raw, X_MIN, X_MAX);
      m.atEnd = raw !== m.x;
      if (m.n % 6 === 0) m.hist.push([time(), m.x]);
      FLAGS.forEach((f) => {
        if (!m.arrived[f.name] && Math.abs(m.x - f.x) < 0.5 * Math.abs(m.v) / 60 + 1e-9) m.arrived[f.name] = true;
      });
      if (m.n === MARK) sim.hold();
      if (m.n === RUN) sim.pause();
    }

    function statusText() {
      if (m.n === MARK && sim.held) return ['ok', 'Stopped at 10 s. Press Record, then Play.'];
      if (m.n >= RUN) return ['ok', 'The run is over at 20 s.'];
      if (m.atEnd) return ['warn', 'The rover reached the end of the track.'];
      const f = FLAGS.find((fl) => m.arrived[fl.name] && Math.abs(m.x - fl.x) < Math.abs(m.v) * 0.5 + 1);
      if (f) return ['ok', 'The rover is at ' + f.name + '.'];
      return ['neutral', m.n === 0 ? 'Ready' : 'The rover is driving.'];
    }

    function report() {
      sim.setReadout('time', time().toFixed(1) + ' s');
      sim.setReadout('pos', PD.sign(m.x, 1) + ' m');
      sim.setReadout('vel', PD.sign(m.v, 1) + ' m/s');
      const s = slope();
      sim.setReadout('slope', s === null ? '–' : PD.sign(s, 1) + ' m/s');
      const st = statusText();
      if (st[1] !== lastStatus) { lastStatus = st[1]; sim.setStatus(st[0], st[1]); }
    }

    function restart() {
      m.v = Number(slider.value);
      restartModel();
      sim.release();
      report();
      sim.redraw();
    }

    function layout(env) {
      const trackH = PD.clamp(Math.round(env.h * 0.24), 64, 110);
      return { track: { x: 0, y: 0, w: env.w, h: trackH }, graph: { x: 0, y: trackH + 6, w: env.w, h: env.h - trackH - 6 } };
    }

    function drawTrack(ctx, env, r) {
      const c = env.colors;
      const left = 24, right = r.w - 24;
      const px = (x) => left + ((x - X_MIN) / (X_MAX - X_MIN)) * (right - left);
      const ground = r.y + r.h - 24;
      ctx.strokeStyle = c.inkMute;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(left, ground); ctx.lineTo(right, ground); ctx.stroke();
      ctx.font = env.font(11, 'mono', 500);
      ctx.fillStyle = c.inkSoft;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const every = env.w < 520 ? 40 : 20;
      for (let x = Math.ceil(X_MIN / every) * every; x <= X_MAX; x += every) {
        ctx.strokeStyle = x === 0 ? c.ink : c.inkMute;
        ctx.lineWidth = x === 0 ? 3 : 1.5;
        ctx.beginPath(); ctx.moveTo(px(x), ground - 5); ctx.lineTo(px(x), ground + 5); ctx.stroke();
        ctx.fillText(String(x), px(x), ground + 7);
      }
      FLAGS.forEach((f) => {
        ctx.strokeStyle = c[f.token];
        ctx.fillStyle = c[f.token];
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(px(f.x), ground); ctx.lineTo(px(f.x), ground - 34); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px(f.x), ground - 34); ctx.lineTo(px(f.x) + 14, ground - 28); ctx.lineTo(px(f.x), ground - 22); ctx.closePath(); ctx.fill();
      });
      // the rover: a body and two wheels
      const rx = px(m.x);
      ctx.fillStyle = c.accent;
      PD.roundRect(ctx, rx - 16, ground - 24, 32, 14, 4); ctx.fill();
      ctx.fillStyle = c.ink;
      ctx.beginPath(); ctx.arc(rx - 9, ground - 8, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(rx + 9, ground - 8, 5, 0, Math.PI * 2); ctx.fill();
    }

    function drawGraph(ctx, env, r) {
      const c = env.colors;
      const g = PD.graph(ctx, env, r, { xmin: 0, xmax: 20, ymin: X_MIN, ymax: X_MAX, xlabel: 'Time t (s)', ylabel: 'Position x (m)', yticks: 6 });
      FLAGS.forEach((f) => {
        PD.line(ctx, [[g.left, g.py(f.x)], [g.right, g.py(f.x)]], c[f.token], 1.5, [6, 4]);
      });
      // the 10 s mark
      PD.line(ctx, [[g.px(10), g.top], [g.px(10), g.bottom]], c.inkMute, 1, [2, 4]);
      const pts = m.hist.map((h) => [g.px(h[0]), g.py(h[1])]);
      PD.line(ctx, pts, c.accent, 3);
      ctx.fillStyle = c.accent;
      ctx.beginPath(); ctx.arc(g.px(time()), g.py(m.x), 5, 0, Math.PI * 2); ctx.fill();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 5,   // under reduced motion one Step is 5 s, so the 10 s mark takes two presses
      init() {
        // a short +5.0 m/s run, so the first frame and a print show the model at work
        m.v = 5; restartModel();
        for (let i = 0; i < 240; i++) step();
        report();
      },
      onUnlock() { restart(); },
      update() { step(); report(); },
      draw(ctx, env) {
        const L = layout(env);
        drawTrack(ctx, env, L.track);
        drawGraph(ctx, env, L.graph);
      },
      preset(name) {
        const p = PRESETS[name];
        if (!p) return;
        m.x0 = p.x0;
        slider.value = String(p.v);
        slider.dispatchEvent(new Event('input'));
      },
      record() {
        const s = slope();
        return {
          'Time (s)': time().toFixed(1),
          'Velocity (m/s)': PD.sign(m.v, 1),
          'Position (m)': PD.sign(m.x, 1),
          'Slope (m/s)': s === null ? '' : PD.sign(s, 1)
        };
      }
    });

    slider.addEventListener('input', restart);
    restartBtn.addEventListener('click', () => { m.x0 = 0; restart(); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initVectorBuilder();
    initUnitConverter();
    initRover();
  });
})();
