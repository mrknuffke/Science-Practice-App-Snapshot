/* ============================================================
   LESSON 1-3: KINEMATICS EQUATIONS & PROJECTILE MOTION
   Three sims, each built on TB.sim.create (RUNTIME_SPEC 4.3).
   Briefs: docs/plans/textbook-sim-briefs.md, "Physics 1-3a", "1-3b", "1-3c".
   1. Equation Solver (no motion): three knowns in, the equations and the answers out.
   2. Dropped and fired (Enrichment): two balls, a flash every 0.25 s.
   3. Projectile Precision (Enrichment): find the launch speed that hits the flag.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const PD = window.PD;
  const { chipGroup } = PD;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  const G_EARTH = 9.8;

  // A number for a screen: two decimals at most, never "-0".
  function f(n) {
    const r = Math.round(n * 100) / 100;
    return String(r === 0 ? 0 : r);
  }

  /* ---------- 1. Equation Solver ---------- */
  const VI = '<em>v</em><sub>i</sub>';
  const VF = '<em>v</em><sub>f</sub>';
  const A = '<em>a</em>';
  const DX = '&Delta;<em>x</em>';
  const T = '<em>t</em>';
  const NAMES = { vi: 'vi', vf: 'vf', a: 'a', dx: 'Δx', t: 't' };
  const KEYS = ['vi', 'vf', 'a', 'dx', 't'];
  const NEGATIVE = 'The time comes out negative. Check the signs of your knowns.';
  const zero = (x) => Math.abs(x) < 1e-9;

  // Three knowns in, the other two out. Returns { vals, steps: [{ eq, text }], note } or { error }.
  // eq 1: vf = vi + at   eq 2: dx = vi t + 1/2 a t^2   eq 3: vf^2 = vi^2 + 2 a dx   eq 0: dx = v t (a = 0)
  function solve(k) {
    const v = { vi: k.vi, vf: k.vf, a: k.a, dx: k.dx, t: k.t };
    const steps = [];
    let note = '';
    const fail = (error) => ({ error });
    if (k.t !== null && k.t < 0) return fail(NEGATIVE);
    const has = KEYS.filter((x) => k[x] !== null).join(',');
    const t1 = (vi, vf, a) => `${T} = (${VF} &minus; ${VI}) / ${A} = (${f(vf)} &minus; ${f(vi)}) / ${f(a)} = ${f((vf - vi) / a)} s`;

    // The speed and time when a = 0: Equation 1 cannot give t, so use dx = v t.
    const steady = (vi, dx) => {
      if (zero(vi)) return null;
      const t = dx / vi;
      return t < 0 ? null : t;
    };

    switch (has) {
      case 'vi,vf,a': {
        if (zero(k.a)) return fail(zero(k.vf - k.vi) ? 'With a = 0 the velocity never changes. These three knowns cannot give t or Δx.' : 'With a = 0 the final velocity must equal the starting velocity. Check your numbers.');
        v.t = (k.vf - k.vi) / k.a;
        if (v.t < 0) return fail(NEGATIVE);
        v.dx = (k.vf * k.vf - k.vi * k.vi) / (2 * k.a);
        steps.push({ eq: 3, text: `${DX} = (${VF}&sup2; &minus; ${VI}&sup2;) / 2${A} = (${f(k.vf)}&sup2; &minus; ${f(k.vi)}&sup2;) / 2(${f(k.a)}) = ${f(v.dx)} m` });
        steps.push({ eq: 1, text: t1(k.vi, k.vf, k.a) });
        break;
      }
      case 'vi,vf,dx': {
        if (zero(k.dx)) return fail('Δx = 0 gives no single answer for a and t. Choose a Δx that is not zero.');
        v.a = (k.vf * k.vf - k.vi * k.vi) / (2 * k.dx);
        steps.push({ eq: 3, text: `${A} = (${VF}&sup2; &minus; ${VI}&sup2;) / 2${DX} = (${f(k.vf)}&sup2; &minus; ${f(k.vi)}&sup2;) / 2(${f(k.dx)}) = ${f(v.a)} m/s&sup2;` });
        if (zero(v.a)) {
          if (!zero(k.vf - k.vi)) return fail('The numbers do not fit one steady acceleration. Check the signs of the velocities.');
          const t = steady(k.vi, k.dx);
          if (t === null) return fail('These numbers give no time. Check the signs of your knowns.');
          v.t = t;
          steps.push({ eq: 0, text: `Because ${A} = 0, Equation 1 cannot give ${T}. Use ${DX} = <em>v</em>${T}: ${T} = ${f(k.dx)} / ${f(k.vi)} = ${f(t)} s` });
        } else {
          v.t = (k.vf - k.vi) / v.a;
          if (v.t < 0) return fail(NEGATIVE);
          steps.push({ eq: 1, text: t1(k.vi, k.vf, v.a) });
        }
        break;
      }
      case 'vi,vf,t': {
        if (zero(k.t)) return fail('t = 0 leaves no time to change speed. Choose a t that is not zero.');
        v.a = (k.vf - k.vi) / k.t;
        steps.push({ eq: 1, text: `${A} = (${VF} &minus; ${VI}) / ${T} = (${f(k.vf)} &minus; ${f(k.vi)}) / ${f(k.t)} = ${f(v.a)} m/s&sup2;` });
        v.dx = k.vi * k.t + 0.5 * v.a * k.t * k.t;
        steps.push({ eq: 2, text: `${DX} = ${VI}${T} + &frac12;${A}${T}&sup2; = ${f(k.vi)}(${f(k.t)}) + &frac12;(${f(v.a)})(${f(k.t)})&sup2; = ${f(v.dx)} m` });
        break;
      }
      case 'vi,a,dx': {
        const disc = k.vi * k.vi + 2 * k.a * k.dx;
        if (disc < -1e-9) return fail('The object never reaches that Δx, because vf² would be negative.');
        const r = Math.sqrt(Math.max(0, disc));
        if (zero(k.a)) {
          const t = steady(k.vi, k.dx);
          if (t === null) return fail('With a = 0 the velocity stays at vi. These numbers give no time. Check the signs.');
          v.vf = k.vi; v.t = t;
          steps.push({ eq: 3, text: `${VF} = ${VI} = ${f(k.vi)} m/s, because ${A} = 0` });
          steps.push({ eq: 0, text: `${T} = ${DX} / <em>v</em> = ${f(k.dx)} / ${f(k.vi)} = ${f(t)} s` });
          break;
        }
        const options = (zero(r) ? [0] : [r, -r]).map((vf) => ({ vf, t: (vf - k.vi) / k.a })).filter((o) => o.t >= -1e-9).sort((p, q) => p.t - q.t);
        if (!options.length) return fail(NEGATIVE);
        v.vf = options[0].vf; v.t = Math.max(0, options[0].t);
        steps.push({ eq: 3, text: `${VF} = &plusmn;&radic;(${VI}&sup2; + 2${A}${DX}) = &plusmn;&radic;(${f(k.vi)}&sup2; + 2(${f(k.a)})(${f(k.dx)})) = ${f(v.vf)} m/s` });
        steps.push({ eq: 1, text: t1(k.vi, v.vf, k.a) });
        if (options.length > 1) note = `A second answer also fits: ${VF} = ${f(options[1].vf)} m/s at ${T} = ${f(options[1].t)} s. The object passes that point twice.`;
        break;
      }
      case 'vi,a,t': {
        v.vf = k.vi + k.a * k.t;
        steps.push({ eq: 1, text: `${VF} = ${VI} + ${A}${T} = ${f(k.vi)} + (${f(k.a)})(${f(k.t)}) = ${f(v.vf)} m/s` });
        v.dx = k.vi * k.t + 0.5 * k.a * k.t * k.t;
        steps.push({ eq: 2, text: `${DX} = ${VI}${T} + &frac12;${A}${T}&sup2; = ${f(k.vi)}(${f(k.t)}) + &frac12;(${f(k.a)})(${f(k.t)})&sup2; = ${f(v.dx)} m` });
        break;
      }
      case 'vi,dx,t': {
        if (zero(k.t)) return fail('t = 0 leaves no time to move. Choose a t that is not zero.');
        v.a = (2 * (k.dx - k.vi * k.t)) / (k.t * k.t);
        steps.push({ eq: 2, text: `${A} = 2(${DX} &minus; ${VI}${T}) / ${T}&sup2; = 2(${f(k.dx)} &minus; ${f(k.vi)}(${f(k.t)})) / ${f(k.t)}&sup2; = ${f(v.a)} m/s&sup2;` });
        v.vf = k.vi + v.a * k.t;
        steps.push({ eq: 1, text: `${VF} = ${VI} + ${A}${T} = ${f(k.vi)} + (${f(v.a)})(${f(k.t)}) = ${f(v.vf)} m/s` });
        break;
      }
      case 'vf,a,dx': {
        const disc = k.vf * k.vf - 2 * k.a * k.dx;
        if (disc < -1e-9) return fail('No starting velocity fits, because vi² would be negative.');
        const r = Math.sqrt(Math.max(0, disc));
        if (zero(k.a)) {
          const t = steady(k.vf, k.dx);
          if (t === null) return fail('With a = 0 the velocity stays at vf. These numbers give no time. Check the signs.');
          v.vi = k.vf; v.t = t;
          steps.push({ eq: 3, text: `${VI} = ${VF} = ${f(k.vf)} m/s, because ${A} = 0` });
          steps.push({ eq: 0, text: `${T} = ${DX} / <em>v</em> = ${f(k.dx)} / ${f(k.vf)} = ${f(t)} s` });
          break;
        }
        const options = (zero(r) ? [0] : [r, -r]).map((vi) => ({ vi, t: (k.vf - vi) / k.a })).filter((o) => o.t >= -1e-9).sort((p, q) => p.t - q.t);
        if (!options.length) return fail(NEGATIVE);
        v.vi = options[0].vi; v.t = Math.max(0, options[0].t);
        steps.push({ eq: 3, text: `${VI} = &plusmn;&radic;(${VF}&sup2; &minus; 2${A}${DX}) = &plusmn;&radic;(${f(k.vf)}&sup2; &minus; 2(${f(k.a)})(${f(k.dx)})) = ${f(v.vi)} m/s` });
        steps.push({ eq: 1, text: t1(v.vi, k.vf, k.a) });
        if (options.length > 1) note = `A second answer also fits: ${VI} = ${f(options[1].vi)} m/s at ${T} = ${f(options[1].t)} s. Both start speeds reach the same final velocity.`;
        break;
      }
      case 'vf,a,t': {
        v.vi = k.vf - k.a * k.t;
        steps.push({ eq: 1, text: `${VI} = ${VF} &minus; ${A}${T} = ${f(k.vf)} &minus; (${f(k.a)})(${f(k.t)}) = ${f(v.vi)} m/s` });
        v.dx = v.vi * k.t + 0.5 * k.a * k.t * k.t;
        steps.push({ eq: 2, text: `${DX} = ${VI}${T} + &frac12;${A}${T}&sup2; = ${f(v.vi)}(${f(k.t)}) + &frac12;(${f(k.a)})(${f(k.t)})&sup2; = ${f(v.dx)} m` });
        break;
      }
      case 'vf,dx,t': {
        if (zero(k.t)) return fail('t = 0 leaves no time to move. Choose a t that is not zero.');
        v.a = (2 * (k.vf * k.t - k.dx)) / (k.t * k.t);
        steps.push({ eq: 2, text: `Put ${VI} = ${VF} &minus; ${A}${T} into Equation 2. Then ${A} = 2(${VF}${T} &minus; ${DX}) / ${T}&sup2; = 2(${f(k.vf)}(${f(k.t)}) &minus; ${f(k.dx)}) / ${f(k.t)}&sup2; = ${f(v.a)} m/s&sup2;` });
        v.vi = k.vf - v.a * k.t;
        steps.push({ eq: 1, text: `${VI} = ${VF} &minus; ${A}${T} = ${f(k.vf)} &minus; (${f(v.a)})(${f(k.t)}) = ${f(v.vi)} m/s` });
        break;
      }
      case 'a,dx,t': {
        if (zero(k.t)) return fail('t = 0 leaves no time to move. Choose a t that is not zero.');
        v.vi = k.dx / k.t - 0.5 * k.a * k.t;
        steps.push({ eq: 2, text: `${VI} = ${DX} / ${T} &minus; &frac12;${A}${T} = ${f(k.dx)} / ${f(k.t)} &minus; &frac12;(${f(k.a)})(${f(k.t)}) = ${f(v.vi)} m/s` });
        v.vf = v.vi + k.a * k.t;
        steps.push({ eq: 1, text: `${VF} = ${VI} + ${A}${T} = ${f(v.vi)} + (${f(k.a)})(${f(k.t)}) = ${f(v.vf)} m/s` });
        break;
      }
      default:
        return fail('Fill exactly three boxes.');
    }
    if (KEYS.some((x) => !Number.isFinite(v[x]))) return fail('These numbers do not give a finite answer. Check your knowns.');
    return { vals: v, steps, note, has };
  }

  const EQ_NAME = { 0: 'Δx = vt', 1: 'Eq 1', 2: 'Eq 2', 3: 'Eq 3' };

  function initSolver() {
    const box = $('[data-sim="solver"]');
    if (!box || !window.TB) return;
    const inputs = {
      vi: $('#solve-vi', box), vf: $('#solve-vf', box), a: $('#solve-a', box), dx: $('#solve-dx', box), t: $('#solve-t', box)
    };
    const solveBtn = $('[data-solve]', box);
    const clearBtn = $('[data-clear]', box);
    const work = $('[data-work]', box);
    let sim = null;
    let res = null;

    function read() {
      const k = {};
      KEYS.forEach((x) => {
        const raw = inputs[x].value;
        const n = raw === '' ? NaN : parseFloat(raw);
        k[x] = Number.isNaN(n) ? null : n;
      });
      return k;
    }
    const count = (k) => KEYS.filter((x) => k[x] !== null).length;

    function show() {
      const k = read();
      if (res && res.vals) {
        const got = KEYS.filter((x) => k[x] === null);
        sim.setReadout('knowns', KEYS.filter((x) => k[x] !== null).map((x) => NAMES[x]).join(', '));
        sim.setReadout('eq', res.steps.map((s) => EQ_NAME[s.eq]).join(', then '));
        sim.setReadout('answer', got.map((x) => NAMES[x] + ' = ' + f(res.vals[x]) + (x === 'a' ? ' m/s²' : x === 't' ? ' s' : x === 'dx' ? ' m' : ' m/s')).join('; '));
      } else {
        sim.setReadout('knowns', count(k) ? KEYS.filter((x) => k[x] !== null).map((x) => NAMES[x]).join(', ') : '–');
        sim.setReadout('eq', '–');
        sim.setReadout('answer', '–');
      }
      sim.redraw();
    }

    function solveNow() {
      const k = read();
      if (count(k) !== 3) {
        res = null;
        work.innerHTML = '';
        sim.setStatus('warn', 'Fill exactly three boxes. You have filled ' + count(k) + '.');
        show();
        return;
      }
      const r = solve(k);
      if (r.error) {
        res = null;
        work.innerHTML = '<p>' + r.error + '</p>';
        sim.setStatus('warn', r.error);
      } else {
        res = r;
        const lines = r.steps.map((s, i) => '<p><b>Step ' + (i + 1) + ', ' + (s.eq === 0 ? 'steady speed' : 'Equation ' + s.eq) + ':</b> ' + s.text + '</p>');
        if (r.note) lines.push('<p>' + r.note + '</p>');
        work.innerHTML = lines.join('');
        sim.setStatus('ok', 'Solved with ' + r.steps.map((s) => EQ_NAME[s.eq]).join(', then '));
      }
      show();
    }

    function clearAll() {
      KEYS.forEach((x) => { inputs[x].value = ''; });
      res = null;
      work.innerHTML = '';
      sim.setStatus('neutral', 'Enter exactly three knowns');
      show();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: false,
      init() { show(); },
      onUnlock() { show(); },
      draw(ctx, env) {
        const c = env.colors;
        let b = { xmax: 5, ymin: 0, ymax: 10 };
        if (res && res.vals && res.vals.t > 0) {
          const lo = Math.min(0, res.vals.vi, res.vals.vf), hi = Math.max(0, res.vals.vi, res.vals.vf);
          const pad = (hi - lo || 1) * 0.15;
          b = { xmax: res.vals.t, ymin: lo < 0 ? lo - pad : 0, ymax: hi > 0 ? hi + pad : (lo < 0 ? 0 : 1) };
        }
        const g = PD.graph(ctx, env, { x: 0, y: 0, w: env.w, h: env.h }, { xmin: 0, xmax: b.xmax, ymin: b.ymin, ymax: b.ymax, xlabel: 'Time t (s)', ylabel: 'Velocity v (m/s)', xticks: 6, yticks: 4 });
        if (!res || !res.vals || !(res.vals.t > 0)) {
          PD.label(ctx, env, 'No answer yet', (g.left + g.right) / 2, (g.top + g.bottom) / 2, { align: 'center', color: c.inkSoft, size: 12, face: 'display' });
          return;
        }
        const v = res.vals;
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = c.good;
        ctx.beginPath();
        ctx.moveTo(g.px(0), g.py(0)); ctx.lineTo(g.px(0), g.py(v.vi)); ctx.lineTo(g.px(v.t), g.py(v.vf)); ctx.lineTo(g.px(v.t), g.py(0));
        ctx.closePath(); ctx.fill();
        ctx.restore();
        PD.line(ctx, [[g.px(0), g.py(v.vi)], [g.px(v.t), g.py(v.vf)]], c.accent, 3);
        PD.label(ctx, env, 'Δx = ' + f(v.dx) + ' m', (g.left + g.right) / 2, g.py(0) + (v.vi + v.vf < 0 ? 16 : -16), { align: 'center', color: c.ink, bg: c.paper, size: 12 });
      },
      record() {
        if (!res || !res.vals) return { 'Knowns': '', 'Equations': '', 'Answers': '' };
        const k = read();
        const got = KEYS.filter((x) => k[x] === null);
        return {
          'Knowns': KEYS.filter((x) => k[x] !== null).map((x) => NAMES[x]).join(', '),
          'Equations': res.steps.map((s) => EQ_NAME[s.eq]).join(', then '),
          'Answers': got.map((x) => NAMES[x] + ' = ' + f(res.vals[x])).join('; ')
        };
      }
    });

    solveBtn.addEventListener('click', solveNow);
    clearBtn.addEventListener('click', clearAll);
    KEYS.forEach((x) => inputs[x].addEventListener('input', () => {
      res = null;
      work.innerHTML = '';
      sim.setStatus('neutral', 'Knowns entered: ' + count(read()) + ' of 3');
      show();
    }));
  }

  /* ---------- 2. Dropped and fired ---------- */
  const DF_H = 45;                                     // m, the height both balls start from
  const DF_FALL = Math.sqrt((2 * DF_H) / G_EARTH);     // s, the same for both balls
  const DF_FLASH = 0.25;                               // s between flashes
  const DF_XMAX = 100;                                 // m, the right end of the graph

  function initDropFire() {
    const box = $('[data-sim="dropfire"]');
    if (!box || !window.TB) return;
    const chips = $$('[data-speed]', box);
    const restartBtn = $('[data-restart]', box);
    const m = { v: 30, n: 0, landed: false };
    let sim = null;
    let lastStatus = '';

    const time = () => Math.min(m.n / 60, DF_FALL);
    const fallen = (t) => 0.5 * G_EARTH * t * t;

    function step() {
      if (m.landed) return;
      m.n++;
      if (m.n / 60 >= DF_FALL) { m.landed = true; sim.hold(); }
    }

    function report() {
      const t = time();
      sim.setReadout('time', t.toFixed(2) + ' s');
      sim.setReadout('height', (DF_H - fallen(t)).toFixed(1) + ' m');
      sim.setReadout('dist', (m.v * t).toFixed(1) + ' m');
      sim.setReadout('land', m.landed ? 'A ' + DF_FALL.toFixed(2) + ' s, B ' + DF_FALL.toFixed(2) + ' s' : '–');
      const text = m.landed ? 'Both balls landed at the same time' : 'Both balls are falling';
      if (text !== lastStatus) { lastStatus = text; sim.setStatus(m.landed ? 'ok' : 'neutral', text); }
    }

    function restart() {
      m.n = 0; m.landed = false;
      sim.release();
      report();
      sim.redraw();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 0.75,
      init() {
        // a short run, so the first frame and a print show the strobe marks
        m.n = 90;
        report();
      },
      onUnlock() { restart(); },
      update() { step(); report(); },
      draw(ctx, env) {
        const c = env.colors;
        const g = PD.graph(ctx, env, { x: 0, y: 0, w: env.w, h: env.h }, { xmin: 0, xmax: DF_XMAX, ymin: 0, ymax: DF_H, xlabel: 'Distance from the cliff (m)', ylabel: 'Height (m)', yticks: 5 });
        const t = time();
        const flashes = [];
        for (let k = 0; k * DF_FLASH <= t + 1e-9; k++) flashes.push(k * DF_FLASH);
        if (m.landed) flashes.push(DF_FALL);
        flashes.forEach((tt) => {
          const y = g.py(DF_H - fallen(tt));
          PD.line(ctx, [[g.px(0), y], [g.px(m.v * tt), y]], c.inkMute, 1, [3, 3]);
          ctx.fillStyle = c.accent;
          ctx.beginPath(); ctx.arc(g.px(0), y, 3, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = c.warn;
          ctx.beginPath(); ctx.arc(g.px(m.v * tt), y, 3, 0, Math.PI * 2); ctx.fill();
        });
        const y = g.py(DF_H - fallen(t));
        const ax = g.px(0), bx = g.px(m.v * t);
        ctx.fillStyle = c.accent;
        ctx.beginPath(); ctx.arc(ax, y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = c.warn;
        ctx.beginPath(); ctx.arc(bx, y, 8, 0, Math.PI * 2); ctx.fill();
        // the two names never share a spot: one label while the balls are close, then A beside A and B above B
        if (bx - ax < 44) PD.label(ctx, env, 'A and B', ax + 24, y - 17, { color: c.ink, bg: c.paper, align: 'center' });
        else {
          PD.label(ctx, env, 'A', ax + 14, y, { color: c.ink, bg: c.paper });
          PD.label(ctx, env, 'B', bx, y - 17, { color: c.ink, bg: c.paper, align: 'center' });
        }
      },
      record() {
        return {
          'Fired speed (m/s)': m.v,
          'Fall time A (s)': m.landed ? DF_FALL.toFixed(2) : 'still falling',
          'Fall time B (s)': m.landed ? DF_FALL.toFixed(2) : 'still falling',
          'Landing distance (m)': m.landed ? (m.v * DF_FALL).toFixed(1) : 'still falling'
        };
      }
    });

    chipGroup(chips, 'speed', (v) => { m.v = Number(v); restart(); });
    restartBtn.addEventListener('click', restart);
  }

  /* ---------- 3. Projectile Precision ---------- */
  const HIT = 2.5;       // m, a landing this close to the flag is a hit
  const VX_MIN = 5;      // m/s, the ends of the speed slider
  const VX_MAX = 40;

  function initPrecision() {
    const box = $('[data-sim="precision"]');
    if (!box || !window.TB) return;
    const slHeight = $('#bossHeight', box);
    const slSpeed = $('#bossVx', box);
    const planets = $$('[data-planet]', box);
    const launchBtn = $('[data-launch]', box);
    const flagBtn = $('[data-newflag]', box);
    // the opening mission is the one in the prediction: 45 m, Earth, flag at 60.6 m
    const m = { g: G_EARTH, h: 45, vx: 15, target: 60.6, state: 'idle', n: 0, path: [], land: 0 };
    let sim = null;

    const fall = () => Math.sqrt((2 * m.h) / m.g);
    const reachable = (x) => x >= VX_MIN * fall() && x <= VX_MAX * fall();

    function newFlag() {
      // a speed the slider can reach, so every flag can be hit
      const speed = VX_MIN + 1 + 0.5 * Math.floor(Math.random() * 66);
      m.target = Math.round(speed * fall() * 10) / 10;
    }

    function status() {
      if (m.state === 'idle') return ['neutral', 'Set a speed and press Launch'];
      if (m.state === 'flying') return ['neutral', 'The capsule is flying'];
      const miss = m.land - m.target;
      if (Math.abs(miss) <= HIT) return ['ok', 'Hit. The capsule landed ' + Math.abs(miss).toFixed(1) + ' m from the flag'];
      return ['warn', 'Missed by ' + Math.abs(miss).toFixed(1) + ' m, ' + (miss > 0 ? 'long' : 'short') + '. The speed that hits is ' + (m.target / fall()).toFixed(1) + ' m/s'];
    }

    function report() {
      sim.setReadout('target', m.target.toFixed(1) + ' m');
      const landed = m.state === 'landed';
      sim.setReadout('time', m.state === 'idle' ? '–' : (landed ? fall() : Math.min(m.n / 60, fall())).toFixed(2) + ' s');
      sim.setReadout('land', landed ? m.land.toFixed(1) + ' m' : '–');
      sim.setReadout('miss', landed ? PD.sign(m.land - m.target, 1) + ' m' : '–');
      sim.setReadout('need', landed ? (m.target / fall()).toFixed(1) + ' m/s' : '–');
      const s = status();
      sim.setStatus(s[0], s[1]);
    }

    function reset() {
      m.state = 'idle'; m.n = 0; m.path = [];
      sim.release();
      report();
      sim.redraw();
    }

    function launch() {
      m.state = 'flying'; m.n = 0; m.path = [[0, m.h]];
      sim.release();
      report();
    }

    function step() {
      if (m.state !== 'flying') return;
      m.n++;
      const t = Math.min(m.n / 60, fall());
      if (m.n % 3 === 0 || t >= fall()) m.path.push([m.vx * t, m.h - 0.5 * m.g * t * t]);
      if (t >= fall()) {
        m.state = 'landed';
        m.land = m.vx * fall();
        sim.hold();
      }
    }

    // A setting changed: stop any flight. The flag stays unless the new cliff or planet puts it out of reach.
    function settingsChanged() {
      if (!reachable(m.target)) newFlag();
      reset();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 1,
      init() {
        // a short miss at the default speed, so the first frame and a print show the model at work
        m.state = 'flying'; m.n = 0; m.path = [[0, m.h]];
        for (let i = 0; i < Math.ceil(fall() * 60) + 2; i++) step();
        report();
      },
      onUnlock() { reset(); },
      update() { step(); report(); },
      draw(ctx, env) {
        const c = env.colors;
        const xmax = Math.max(40, Math.ceil((1.12 * Math.max(m.target, m.vx * fall())) / 10) * 10);
        const ymax = Math.max(20, Math.ceil((m.h * 1.1) / 10) * 10);
        const g = PD.graph(ctx, env, { x: 0, y: 0, w: env.w, h: env.h }, { xmin: 0, xmax: xmax, ymin: 0, ymax: ymax, xlabel: 'Distance from the cliff (m)', ylabel: 'Height (m)', yticks: 5 });
        // the cliff
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = c.hair;
        ctx.fillRect(g.px(0), g.py(m.h), g.px(xmax * 0.03) - g.px(0), g.py(0) - g.py(m.h));
        ctx.restore();
        // the hit zone and the flag
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = c.good;
        ctx.fillRect(g.px(m.target - HIT), g.py(0) - 7, g.px(m.target + HIT) - g.px(m.target - HIT), 7);
        ctx.restore();
        const poleTop = g.py(ymax * 0.13);
        PD.line(ctx, [[g.px(m.target), g.py(0)], [g.px(m.target), poleTop]], c.bad, 2);
        ctx.fillStyle = c.bad;
        ctx.beginPath();
        ctx.moveTo(g.px(m.target), poleTop); ctx.lineTo(g.px(m.target) + 14, poleTop + 6); ctx.lineTo(g.px(m.target), poleTop + 12);
        ctx.closePath(); ctx.fill();
        PD.label(ctx, env, 'Flag', g.px(m.target), g.py(ymax * 0.21), { align: 'center', color: c.ink, bg: c.paper });
        // the drone on the cliff top
        ctx.fillStyle = c.accent;
        PD.roundRect(ctx, g.px(0) - 2, g.py(m.h) - 10, 16, 10, 3); ctx.fill();
        // the path and the capsule
        PD.line(ctx, m.path.map((p) => [g.px(p[0]), g.py(p[1])]), c.accent, 3);
        if (m.state === 'flying' && m.path.length) {
          const last = m.path[m.path.length - 1];
          ctx.fillStyle = c.accent;
          ctx.beginPath(); ctx.arc(g.px(last[0]), g.py(last[1]), 6, 0, Math.PI * 2); ctx.fill();
        }
        if (m.state === 'landed') {
          const hit = Math.abs(m.land - m.target) <= HIT;
          ctx.fillStyle = hit ? c.good : c.warn;
          ctx.beginPath(); ctx.arc(g.px(m.land), g.py(0), 6, 0, Math.PI * 2); ctx.fill();
          PD.label(ctx, env, 'Landed ' + m.land.toFixed(1) + ' m', g.px(m.land), g.py(ymax * 0.33), { align: 'center', color: c.ink, bg: c.paper });
        }
      },
      record() {
        const landed = m.state === 'landed';
        return {
          'Flag (m)': m.target.toFixed(1),
          'Launch speed (m/s)': m.vx.toFixed(1),
          'Landing (m)': landed ? m.land.toFixed(1) : '',
          'Miss (m)': landed ? PD.sign(m.land - m.target, 1) : ''
        };
      }
    });

    slHeight.addEventListener('input', () => { m.h = Number(slHeight.value); settingsChanged(); });
    slSpeed.addEventListener('input', () => { m.vx = Number(slSpeed.value); reset(); });
    chipGroup(planets, 'planet', (g) => { m.g = Number(g); settingsChanged(); });
    launchBtn.addEventListener('click', launch);
    flagBtn.addEventListener('click', () => { newFlag(); reset(); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSolver();
    initDropFire();
    initPrecision();
  });
})();
