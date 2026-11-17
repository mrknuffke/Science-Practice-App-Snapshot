/* ============================================================
   LESSON 1-2: MOTION GRAPHS & UNIFORM ACCELERATION
   Three sims, each built on TB.sim.create (RUNTIME_SPEC 4.3).
   Briefs: docs/plans/textbook-sim-briefs.md, "Physics 1-2a", "1-2b", "1-2c".
   1. Graph Matcher: time runs by itself, the student moves one position slider.
   2. Area Decomposer: a velocity-time graph in three parts (no motion).
   3. Triple-Graph Studio: x-t, v-t and a-t of one motion, with a time scrubber.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const PD = window.PD;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));

  const { chipGroup, setOutput } = PD;

  /* ---------- 1. Graph Matcher ---------- */
  const TARGETS = {
    1: { name: 'Profile 1: steady speed', fn: (t) => 2.0 * t },
    2: { name: 'Profile 2: away, stop, return', fn: (t) => (t <= 4 ? 3 * t : t <= 7 ? 12 : 12 - 3 * (t - 7)) },
    3: { name: 'Profile 3: accelerate from rest', fn: (t) => 0.22 * t * t }
  };
  const PARTS = [[0, 4, '0 to 4 s'], [4, 7, '4 to 7 s'], [7, 10, '7 to 10 s']];
  const TOL = 1.0;        // m: a sample "matches" when it is within this of the target
  const RUN_STEPS = 600;  // 10 s

  function initMatcher() {
    const box = $('[data-sim="matcher"]');
    if (!box || !window.TB) return;
    const slider = $('#matcherPos', box);
    const startBtn = $('[data-start]', box);
    const chips = $$('[data-target]', box);

    const m = { target: 3, state: 'idle', n: 0, trace: [], result: null, demo: true };
    let sim = null;

    const time = () => m.n / 60;
    const yours = () => Number(slider.value);

    function finish() {
      const samples = m.trace;
      const hit = samples.filter((s) => Math.abs(s.you - s.tgt) <= TOL).length;
      const err = PARTS.map((p) => {
        const seg = samples.filter((s) => s.t >= p[0] - 1e-9 && s.t <= p[1] + 1e-9);
        return seg.reduce((a, s) => a + Math.abs(s.you - s.tgt), 0) / Math.max(1, seg.length);
      });
      let worst = 0;
      err.forEach((e, i) => { if (e > err[worst]) worst = i; });
      m.result = { score: Math.round((100 * hit) / samples.length), worst: err[worst] < 0.5 ? 'None' : PARTS[worst][2] };
      m.state = 'done';
      sim.hold();
    }

    function step() {
      if (m.state !== 'running') return;
      m.n++;
      if (m.n % 6 === 0) m.trace.push({ t: time(), you: yours(), tgt: TARGETS[m.target].fn(time()) });
      if (m.n >= RUN_STEPS) finish();
    }

    function report() {
      const t = time();
      sim.setReadout('time', t.toFixed(1) + ' s');
      sim.setReadout('target', m.state === 'idle' ? '–' : TARGETS[m.target].fn(t).toFixed(1) + ' m');
      sim.setReadout('you', yours().toFixed(1) + ' m');
      sim.setReadout('score', m.result ? m.result.score + ' %' : '–');
      if (m.state === 'idle') sim.setStatus('neutral', 'Press Start run');
      else if (m.state === 'running') sim.setStatus('neutral', 'Slide your position to follow the dashed line');
      else sim.setStatus(m.result.score >= 80 ? 'ok' : 'warn', 'The run is over. Score ' + m.result.score + ' %');
    }

    function reset() {
      m.state = 'idle'; m.n = 0; m.trace = []; m.result = null; m.demo = false;
      report();
      sim.redraw();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 2.5,
      init() {
        // a steady walk of 4 s, so the first frame and a print show the trace at work (the target stays hidden)
        for (let i = 1; i <= 4; i++) m.trace.push({ t: i, you: 2 * i, tgt: 0 });
        report();
      },
      onUnlock() { reset(); },
      update() { step(); if (m.state === 'running') report(); },
      draw(ctx, env) {
        const c = env.colors;
        const g = PD.graph(ctx, env, { x: 0, y: 0, w: env.w, h: env.h }, { xmin: 0, xmax: 10, ymin: 0, ymax: 25, xlabel: 'Time t (s)', ylabel: 'Position x (m)' });
        if (sim.committed) {
          const pts = [];
          for (let t = 0; t <= 10.0001; t += 0.1) pts.push([g.px(t), g.py(TARGETS[m.target].fn(t))]);
          PD.line(ctx, pts, c.cool, 3, [8, 5]);
        }
        const trace = m.trace.map((s) => [g.px(s.t), g.py(s.you)]);
        if (m.state === 'running' || m.state === 'done') trace.unshift([g.px(0), g.py(m.trace.length ? m.trace[0].you : yours())]);
        PD.line(ctx, trace, c.accent, 3);
        if (m.state !== 'done' && !m.demo) {
          ctx.fillStyle = c.accent;
          ctx.beginPath(); ctx.arc(g.px(time()), g.py(yours()), 5, 0, Math.PI * 2); ctx.fill();
        }
      },
      record() {
        return { 'Target': TARGETS[m.target].name, 'Score (% within 1 m)': m.result ? m.result.score : '', 'Furthest off': m.result ? m.result.worst : '' };
      }
    });

    chipGroup(chips, 'target', (k) => { m.target = Number(k); reset(); });
    slider.addEventListener('input', () => { if (m.state === 'idle') report(); sim.redraw(); });
    startBtn.addEventListener('click', () => { m.state = 'running'; m.n = 0; m.trace = []; m.result = null; m.demo = false; sim.release(); report(); });
  }

  /* ---------- 2. Area Decomposer ---------- */
  const SEGS = [
    { t0: 0, t1: 4, v0: 0, v1: 12, shape: 'Triangle' },
    { t0: 4, t1: 10, v0: 12, v1: 12, shape: 'Rectangle' },
    { t0: 10, t1: 14, v0: 12, v1: 0, shape: 'Triangle' }
  ];
  const area = (s) => ((s.v0 + s.v1) / 2) * (s.t1 - s.t0);

  function initDecomposer() {
    const box = $('[data-sim="decomposer"]');
    if (!box || !window.TB) return;
    const chips = $$('[data-seg]', box);
    const seen = {};
    let sel = 0;
    let sim = null;

    function runningTotal() { return Object.keys(seen).reduce((a, k) => a + area(SEGS[k - 1]), 0); }

    function show() {
      if (!sel) {
        sim.setReadout('seg', 'None selected'); sim.setReadout('shape', '–'); sim.setReadout('acc', '–'); sim.setReadout('area', '–');
        sim.setStatus('neutral', 'Select a segment');
      } else {
        const s = SEGS[sel - 1];
        const a = (s.v1 - s.v0) / (s.t1 - s.t0);
        sim.setReadout('seg', 'Segment ' + sel);
        sim.setReadout('shape', s.shape);
        sim.setReadout('acc', PD.sign(a, 1) + ' m/s²');
        sim.setReadout('area', area(s).toFixed(1) + ' m');
        sim.setStatus('ok', 'Segment ' + sel + ' selected');
      }
      sim.redraw();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: false,
      init() { show(); },
      onUnlock() { show(); },
      draw(ctx, env) {
        const c = env.colors;
        const g = PD.graph(ctx, env, { x: 0, y: 0, w: env.w, h: env.h }, { xmin: 0, xmax: 14, ymin: 0, ymax: 14, xlabel: 'Time t (s)', ylabel: 'Velocity v (m/s)', yticks: 7 });
        if (sel) {
          const s = SEGS[sel - 1];
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = c.accent;
          ctx.beginPath();
          ctx.moveTo(g.px(s.t0), g.py(0)); ctx.lineTo(g.px(s.t0), g.py(s.v0)); ctx.lineTo(g.px(s.t1), g.py(s.v1)); ctx.lineTo(g.px(s.t1), g.py(0));
          ctx.closePath(); ctx.fill();
          ctx.restore();
        }
        PD.line(ctx, [[g.px(0), g.py(0)], [g.px(4), g.py(12)], [g.px(10), g.py(12)], [g.px(14), g.py(0)]], c.accent, 3);
        if (sel) {
          const s = SEGS[sel - 1];
          PD.line(ctx, [[g.px(s.t0), g.py(s.v0)], [g.px(s.t1), g.py(s.v1)]], c.accent, 5);
        }
      },
      record() {
        if (sel) seen[sel] = true;
        return { 'Segment': sel ? 'Segment ' + sel : '', 'Area (m)': sel ? area(SEGS[sel - 1]).toFixed(1) : '', 'Running total (m)': runningTotal().toFixed(1) };
      }
    });

    chipGroup(chips, 'seg', (k) => { sel = Number(k); show(); });
  }

  /* ---------- 3. Triple-Graph Studio ---------- */
  const T_END = 6;
  function motion(mode, t) {
    if (mode === 1) return { x: 4 * t, v: 4, a: 0 };
    if (mode === 2) return { x: t * t, v: 2 * t, a: 2 };
    if (mode === 3) return t <= 4 ? { x: 12 * t - 1.5 * t * t, v: 12 - 3 * t, a: -3 } : { x: 24, v: 0, a: 0 };
    const y = Math.max(0, 45 - 4.9 * t * t);
    return y > 0 ? { x: y, v: -9.8 * t, a: -9.8 } : { x: 0, v: 0, a: 0 };
  }
  const MODES = {
    1: { name: 'Constant velocity', b: { x: [0, 25], v: [0, 8], a: [-2, 4] } },
    2: { name: 'Forward acceleration', b: { x: [0, 40], v: [0, 15], a: [0, 4] } },
    3: { name: 'Emergency braking', b: { x: [0, 30], v: [-2, 15], a: [-4, 2] } },
    4: { name: 'Gravity drop', b: { x: [0, 50], v: [-60, 5], a: [-12, 2] } }
  };
  const signWord = (v) => (v > 0.05 ? 'positive' : v < -0.05 ? 'negative' : 'zero');

  function initStudio() {
    const box = $('[data-sim="studio"]');
    if (!box || !window.TB) return;
    const slider = $('#studioTime', box);
    const modeChips = $$('[data-motion]', box);
    const showArea = $('[data-show="area"]', box);
    const showTan = $('[data-show="tangent"]', box);
    const s = { mode: 1, t: 0, area: true, tangent: false };
    let sim = null;

    function report() {
      const q = motion(s.mode, s.t);
      sim.setReadout('time', s.t.toFixed(1) + ' s');
      sim.setReadout('x', q.x.toFixed(1) + ' m');
      sim.setReadout('v', PD.sign(q.v, 1) + ' m/s');
      sim.setReadout('a', PD.sign(q.a, 1) + ' m/s²');
      sim.setStatus('neutral', MODES[s.mode].name);
    }
    function setTime(t) {
      s.t = PD.clamp(t, 0, T_END);
      slider.value = String(s.t);
      setOutput(slider, s.t.toFixed(1) + ' s');
      report();
    }
    function curve(ctx, g, key, color, bounds) {
      const pts = [];
      for (let t = 0; t <= s.t + 1e-9; t += 0.05) pts.push([g.px(t), g.py(motion(s.mode, t)[key])]);
      PD.line(ctx, pts, color, 3);
    }
    function drawGraph(ctx, env, r, key, color, label) {
      const b = MODES[s.mode].b[key];
      const g = PD.graph(ctx, env, r, { xmin: 0, xmax: T_END, ymin: b[0], ymax: b[1], xlabel: 't (s)', ylabel: label, xticks: 6, yticks: 4 });
      const c = env.colors;
      if (key === 'v' && s.area) {
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = c.good;
        ctx.beginPath();
        ctx.moveTo(g.px(0), g.py(0));
        for (let t = 0; t <= s.t + 1e-9; t += 0.05) ctx.lineTo(g.px(t), g.py(motion(s.mode, t).v));
        ctx.lineTo(g.px(s.t), g.py(0));
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      PD.line(ctx, [[g.px(s.t), g.top], [g.px(s.t), g.bottom]], c.inkMute, 1, [2, 4]);
      curve(ctx, g, key, color, b);
      const q = motion(s.mode, s.t);
      if (key === 'x' && s.tangent) {
        const span = 1.2;
        PD.line(ctx, [[g.px(s.t - span), g.py(q.x - q.v * span)], [g.px(s.t + span), g.py(q.x + q.v * span)]], c.ink, 2, [6, 4]);
      }
      ctx.fillStyle = c.ink;
      ctx.beginPath(); ctx.arc(g.px(s.t), g.py(q[key]), 4.5, 0, Math.PI * 2); ctx.fill();
    }
    function drawObject(ctx, env, r) {
      const c = env.colors;
      const q = motion(s.mode, s.t);
      ctx.save();
      ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
      ctx.font = env.font(11, 'mono', 500);
      ctx.fillStyle = c.inkSoft;
      ctx.textBaseline = 'top';
      const ground = r.y + r.h - 22;
      if (s.mode === 4) {
        // a ball falling down the view: 45 m at the top, 0 m at the ground
        const top = r.y + 12;
        const py = (y) => ground - (y / 45) * (ground - top);
        ctx.strokeStyle = c.inkMute; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(r.x + 40, ground); ctx.lineTo(r.x + r.w - 20, ground); ctx.stroke();
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        [0, 15, 30, 45].forEach((y) => { ctx.fillText(String(y), r.x + 34, py(y)); ctx.beginPath(); ctx.moveTo(r.x + 38, py(y)); ctx.lineTo(r.x + 44, py(y)); ctx.stroke(); });
        ctx.fillStyle = c.accent;
        ctx.beginPath(); ctx.arc(r.x + r.w / 2, py(q.x) - 6, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = c.inkSoft; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('Height (m)', r.x + 6, r.y + 4);
      } else {
        const xmax = MODES[s.mode].b.x[1];
        const px = (x) => r.x + 30 + (x / xmax) * (r.w - 60);
        ctx.strokeStyle = c.inkMute; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(r.x + 30, ground); ctx.lineTo(r.x + r.w - 30, ground); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        const step = PD.tickStep(0, xmax, Math.max(2, Math.floor((r.w - 60) / 60)));
        for (let x = 0; x <= xmax + 1e-9; x += step) { ctx.beginPath(); ctx.moveTo(px(x), ground - 4); ctx.lineTo(px(x), ground + 4); ctx.stroke(); ctx.fillText(String(Math.round(x)), px(x), ground + 5); }
        ctx.fillStyle = c.accent;
        PD.roundRect(ctx, px(q.x) - 14, ground - 22, 28, 14, 3); ctx.fill();
        ctx.fillStyle = c.ink;
        ctx.beginPath(); ctx.arc(px(q.x) - 8, ground - 8, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px(q.x) + 8, ground - 8, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = c.inkSoft; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('Position (m)', r.x + 6, r.y + 4);
      }
      ctx.restore();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 1,
      init() { report(); },
      update(dt) {
        if (s.t >= T_END) { sim.pause(); return; }
        setTime(s.t + dt);
      },
      draw(ctx, env) {
        const wide = env.w >= 640;
        let rects;
        if (wide) {
          const gh = Math.round(env.h * 0.64), gw = env.w / 3;
          rects = [{ x: 0, y: 0, w: gw, h: gh }, { x: gw, y: 0, w: gw, h: gh }, { x: 2 * gw, y: 0, w: gw, h: gh }, { x: 0, y: gh + 6, w: env.w, h: env.h - gh - 6 }];
        } else {
          const oh = 92, gh = (env.h - oh - 6) / 3;
          rects = [{ x: 0, y: oh + 6, w: env.w, h: gh }, { x: 0, y: oh + 6 + gh, w: env.w, h: gh }, { x: 0, y: oh + 6 + 2 * gh, w: env.w, h: gh }, { x: 0, y: 0, w: env.w, h: oh }];
        }
        const c = env.colors;
        drawGraph(ctx, env, rects[0], 'x', c.accent, 'x (m)');
        drawGraph(ctx, env, rects[1], 'v', c.good, 'v (m/s)');
        drawGraph(ctx, env, rects[2], 'a', c.warn, 'a (m/s²)');
        drawObject(ctx, env, rects[3]);
      },
      record() {
        const q = motion(s.mode, s.t);
        const q2 = motion(s.mode, Math.min(T_END, s.t + 0.05));
        return { 'Motion': MODES[s.mode].name, 'x-t slope': signWord(q.v), 'v-t slope': signWord(q.a), 'a-t slope': signWord((q2.a - q.a) / 0.05) };
      }
    });

    chipGroup(modeChips, 'motion', (k) => { s.mode = Number(k); setTime(0); sim.release(); sim.redraw(); });
    slider.addEventListener('input', () => { sim.pause(); setTime(Number(slider.value)); sim.redraw(); });
    showArea.addEventListener('click', () => { s.area = !s.area; showArea.setAttribute('aria-pressed', String(s.area)); sim.redraw(); });
    showTan.addEventListener('click', () => { s.tangent = !s.tangent; showTan.setAttribute('aria-pressed', String(s.tangent)); sim.redraw(); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMatcher();
    initDecomposer();
    initStudio();
  });
})();
