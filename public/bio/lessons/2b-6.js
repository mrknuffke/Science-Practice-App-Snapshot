/* ============================================================
   Lesson 2b-6: how does a longer stay on land change how many polar bears
   Hudson Bay can support?
   Built on TB.sim.create (docs/textbook/RUNTIME_SPEC.md, section 4.3).
   Brief: docs/plans/textbook-sim-briefs.md, "Bio 2b-6".

   A teaching model, and the lesson says so. The carrying capacity K is a
   straight line through two counts from the lesson:
     105 days on land -> about 1,200 bears (1,194 counted in 1987)
     145 days on land -> about 620 bears   (618 counted in 2021)
   so K = 1,200 - 14.5 x (days - 105). The bears take yearly logistic steps,
   N + 0.06 N (1 - N / K), from 1,200 bears in year 0. The clock holds at
   year 40. Every run ends on the same numbers:
     105 days: K 1,200, 1,200 bears.  145 days: K 620, 645 bears.
     180 days: K 113, 120 bears.
   The year clock and the weight bar use Pilfold et al. 2016: a fasting bear
   loses about 1 kg a day. They show why; they do not drive the numbers.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const START = 1200;
  const RATE = 0.06;             // growth rate per year in the logistic step
  const END_YEAR = 40;
  const YEARS_PER_SECOND = 2;
  const N_MAX = 1400;            // top of the graph
  const KEEP_RUNS = 2;           // earlier runs kept as faint lines

  const capacity = (days) => Math.max(0, 1200 - 14.5 * (days - 105));
  const nextYear = (n, k) => Math.max(0, n + RATE * n * (1 - n / k));

  const box = document.querySelector('[data-sim="bears"]');
  if (!box || !window.TB) return;

  const slider = box.querySelector('input[type="range"]');
  const restartBtn = box.querySelector('[data-restart]');

  const s = { days: 105, t: 0, n: [START], ghosts: [] };
  let sim = null;
  let lastStatus = '';

  const fmt = (x) => Math.round(x).toLocaleString('en-US');
  const yearNow = () => Math.min(END_YEAR, Math.floor(s.t + 1e-9));
  // bears at a moment between two yearly counts, for a smooth line
  function bearsAt(t) {
    const y = Math.min(END_YEAR, Math.floor(t + 1e-9));
    const f = t - y;
    const a = s.n[y];
    const b = s.n[y + 1] !== undefined ? s.n[y + 1] : a;
    return a + (b - a) * f;
  }

  function newRun(keepOld) {
    // only a run that got going is kept, so dragging the slider does not fill the list
    if (keepOld && s.t >= 1) {
      s.ghosts.push(s.n.slice());
      while (s.ghosts.length > KEEP_RUNS) s.ghosts.shift();
    }
    s.t = 0;
    s.n = [START, nextYear(START, capacity(s.days))];
  }

  function step(dt) {
    if (s.t >= END_YEAR) return;
    s.t += dt * YEARS_PER_SECOND;
    // the count for the coming year is worked out when its year begins
    while (s.n.length <= Math.min(END_YEAR, Math.floor(s.t + 1e-9)) + 1 && s.n.length <= END_YEAR) {
      s.n.push(nextYear(s.n[s.n.length - 1], capacity(s.days)));
    }
    if (s.t >= END_YEAR - 1e-9) {
      s.t = END_YEAR;
      sim.hold();   // the clock stops exactly on year 40
    }
  }

  // where in the year the bears are on land: centred on mid-September (day 258)
  const landStart = () => 258 - s.days / 2;
  function landDaysSoFar() {
    if (s.t >= END_YEAR) return s.days;
    const day = (s.t - Math.floor(s.t)) * 365;
    return Math.max(0, Math.min(s.days, day - landStart()));
  }

  function statusText() {
    const n = fmt(bearsAt(s.t));
    if (s.t >= END_YEAR) return ['ok', 'Year 40: ' + n + ' bears. Press Record, then try another number of days.'];
    if (s.t === 0) return ['ok', 'Year 0: 1,200 bears. Set the days on land, then press Play.'];
    return ['neutral', 'Year ' + yearNow() + ': ' + n + ' bears'];
  }

  function report() {
    sim.setReadout('year', String(yearNow()));
    sim.setReadout('bears', fmt(bearsAt(s.t)));
    sim.setReadout('k', fmt(capacity(s.days)));
    sim.setReadout('lost', Math.round(landDaysSoFar()) + ' kg');
    const st = statusText();
    if (st[1] !== lastStatus) { lastStatus = st[1]; sim.setStatus(st[0], st[1]); }
  }

  /* ---------- drawing ---------- */
  function label(ctx, env, text, x, y, align, color, weight) {
    ctx.font = env.font(12, 'mono', weight || 500);
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color || env.colors.inkSoft;
    ctx.fillText(text, x, y);
  }

  function drawClock(ctx, env, x, y, r) {
    const c = env.colors;
    const toAngle = (day) => -Math.PI / 2 + (day / 365) * Math.PI * 2;
    const a0 = toAngle(landStart());
    const a1 = toAngle(landStart() + s.days);
    ctx.lineWidth = Math.max(8, r * 0.22);
    ctx.lineCap = 'butt';
    ctx.strokeStyle = c.water;
    ctx.beginPath(); ctx.arc(x, y, r, a1, a0 + Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = c.atp;
    ctx.beginPath(); ctx.arc(x, y, r, a0, a1); ctx.stroke();
    // the pointer
    const frac = s.t >= END_YEAR ? 0 : s.t - Math.floor(s.t);
    const a = -Math.PI / 2 + frac * Math.PI * 2;
    ctx.strokeStyle = c.ink; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82); ctx.stroke();
    ctx.fillStyle = c.ink; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
    label(ctx, env, 'Jan', x, y - r - ctx.lineWidth - 12, 'center', c.inkSoft);
    label(ctx, env, s.days + ' days on land', x, y + r + 26, 'center', c.ink, 600);
  }

  function drawWeightBar(ctx, env, x, y, w, h) {
    const c = env.colors;
    const MAX_KG = 180;
    label(ctx, env, 'Weight lost on land this year', x, y - 14, 'left', c.ink, 600);
    ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1.5;
    ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
    const lost = landDaysSoFar();
    ctx.fillStyle = c.thermal;
    ctx.fillRect(x + 1, y + 1, Math.max(0, (w - 2) * lost / MAX_KG), h - 2);
    // the full summer's loss, marked so the end is visible before it arrives
    const full = x + (w * s.days) / MAX_KG;
    ctx.strokeStyle = c.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(full, y - 4); ctx.lineTo(full, y + h + 4); ctx.stroke();
    label(ctx, env, Math.round(lost) + ' kg', x, y + h + 16, 'left', c.inkSoft);
    label(ctx, env, s.days + ' kg by freeze-up', Math.min(full, x + w), y + h + 32, 'right', c.inkSoft);
  }

  function drawGraph(ctx, env, G) {
    const c = env.colors;
    const X = (t) => G.x + (t / END_YEAR) * G.w;
    const Y = (n) => G.y + G.h - (Math.min(n, N_MAX) / N_MAX) * G.h;
    ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1.5;
    ctx.fillRect(G.x, G.y, G.w, G.h); ctx.strokeRect(G.x, G.y, G.w, G.h);
    [0, 400, 800, 1200].forEach((v) => {
      ctx.strokeStyle = c.hairSoft; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(G.x, Y(v)); ctx.lineTo(G.x + G.w, Y(v)); ctx.stroke();
      label(ctx, env, fmt(v), G.x - 6, Y(v), 'right', c.inkSoft);
    });
    for (let yr = 0; yr <= END_YEAR; yr += 10) label(ctx, env, String(yr), X(yr), G.y + G.h + 14, 'center', c.inkSoft);
    label(ctx, env, 'Years', G.x + G.w, G.y + G.h + 30, 'right', c.inkSoft);
    label(ctx, env, 'Bears', G.x, G.y - 12, 'left', c.inkSoft);

    // the carrying capacity for this run
    const k = capacity(s.days);
    ctx.strokeStyle = c.oxygen; ctx.lineWidth = 2; ctx.setLineDash([7, 5]);
    ctx.beginPath(); ctx.moveTo(G.x, Y(k)); ctx.lineTo(G.x + G.w, Y(k)); ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, env, 'Carrying capacity ' + fmt(k), G.x + G.w - 6, Y(k) - 10, 'right', c.oxygen, 600);

    ctx.save();
    ctx.beginPath(); ctx.rect(G.x, G.y, G.w, G.h); ctx.clip();
    // earlier runs, faint
    ctx.globalAlpha = 0.3; ctx.strokeStyle = c.ink; ctx.lineWidth = 2;
    s.ghosts.forEach((run) => {
      ctx.beginPath();
      run.forEach((n, yr) => { if (yr > END_YEAR) return; if (yr === 0) ctx.moveTo(X(0), Y(n)); else ctx.lineTo(X(yr), Y(n)); });
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    // this run, up to now
    ctx.strokeStyle = c.ink; ctx.lineWidth = 2.75; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(X(0), Y(s.n[0]));
    for (let yr = 1; yr <= yearNow(); yr++) ctx.lineTo(X(yr), Y(s.n[yr]));
    ctx.lineTo(X(s.t), Y(bearsAt(s.t)));
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = c.ink;
    ctx.beginPath(); ctx.arc(X(s.t), Y(bearsAt(s.t)), 4.5, 0, Math.PI * 2); ctx.fill();
  }

  function draw(ctx, env) {
    const narrow = env.w < 560;
    const topH = env.h * (narrow ? 0.4 : 0.38);
    const r = Math.min(topH * 0.3, env.w * 0.13);
    const cx = narrow ? env.w * 0.25 : env.w * 0.2;
    drawClock(ctx, env, cx, topH * 0.45, r);
    const bx = narrow ? env.w * 0.5 : env.w * 0.42;
    drawWeightBar(ctx, env, bx, topH * 0.3, env.w - bx - 16, 18);
    const gx = 52;
    drawGraph(ctx, env, { x: gx, y: topH + 22, w: env.w - gx - 16, h: env.h - topH - 22 - 40 });
  }

  /* ---------- the sim ---------- */
  sim = window.TB.sim.create(box, {
    kind: 'canvas',
    loop: true,
    tokens: ['water', 'atp', 'thermal', 'oxygen'],
    init() {
      // a browser can restore the slider on reload, so the model starts from what it shows
      if (slider) s.days = Number(slider.value);
      newRun(false);
      report();
    },
    stepSeconds: 2.5,   // under reduced motion one Step is 5 model years
    update(dt) {
      step(dt);
      report();
    },
    draw: draw,
    record() {
      return {
        'Days on land': String(s.days),
        'Carrying capacity': fmt(capacity(s.days)),
        'Bears in year 40': s.t >= END_YEAR ? fmt(s.n[END_YEAR]) : 'Wait',
        'Weight lost each summer': s.days + ' kg'
      };
    }
  });

  if (slider) {
    slider.addEventListener('input', () => {
      s.days = Number(slider.value);
      newRun(true);
      sim.release();
      report();
      sim.redraw();
    });
  }
  if (restartBtn) restartBtn.addEventListener('click', () => {
    s.ghosts = [];
    newRun(false);
    sim.release();
    report();
    sim.redraw();
  });
})();
