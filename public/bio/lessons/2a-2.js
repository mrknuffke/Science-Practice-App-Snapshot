/* ============================================================
   Lesson 2a-2: if we cut emissions in half, does the carbon dioxide in
   the air go down?
   Built on TB.sim.create (docs/textbook/RUNTIME_SPEC.md, section 4.3).
   Brief: docs/plans/textbook-sim-briefs.md, "Bio 2a-2".

   A teaching model, and the lesson says so. Numbers are the 2023 row of the
   Global Carbon Budget 2024 (Friedlingstein et al. 2025, ESSD 17: 965-1039):
     emissions 11.1 GtC (fossil 10.1, land-use change 1.0)
     ocean uptake 2.9, land uptake 2.3, air gain 5.9
     air 419.31 ppm in 2023, about 278 ppm in 1750, 1 ppm = 2.124 GtC
   Uptake by ocean and land grows in step with the carbon the air holds above
   its 1750 level: uptake = C x (air - 1750 air), with C fitted so 2023 gives
   5.2. Each year: air += emissions - uptake. Land and ocean keep 2023's
   shares of the uptake (2.3 and 2.9 of 5.2). Every run lasts 40 years.
   Ends of run (headless check): 100% -> 500 ppm, 50% -> 424 ppm,
   0% -> 348 ppm. Year 0 at 100% reproduces the 2023 row exactly.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const PPM = 2.124;                 // GtC per ppm
  const AIR0 = 419.31 * PPM;         // 2023
  const AIR1750 = 278 * PPM;
  const UPTAKE0 = 2.9 + 2.3;
  const C = UPTAKE0 / (AIR0 - AIR1750);
  const LAND_SHARE = 2.3 / UPTAKE0;
  const OCEAN_SHARE = 2.9 / UPTAKE0;
  const E2023 = 11.1;
  const FOSSIL_SHARE = 10.1 / E2023;
  const CLEARING_SHARE = 1.0 / E2023;
  const START_YEAR = 2023;
  const END = 40;
  const YEARS_PER_SECOND = 2;
  const PPM_MIN = 250;
  const PPM_MAX = 600;
  const KEEP_RUNS = 2;

  const box = document.querySelector('[data-sim="air"]');
  if (!box || !window.TB) return;

  const slider = box.querySelector('input[type="range"]');
  const output = box.querySelector('label.slider-row output');
  const restartBtn = box.querySelector('[data-restart]');

  const s = { pct: 100, t: 0, run: null, ghosts: [] };
  let sim = null;
  let lastStatus = '';

  const emissions = () => E2023 * s.pct / 100;
  const one = (x) => (Math.round(x * 10) / 10).toFixed(1);
  const whole = (x) => Math.round(x).toLocaleString('en-US');
  const signed = (x) => (x >= 0.05 ? '+' : x <= -0.05 ? '−' : '') + whole(Math.abs(x));

  // the whole run is worked out at once; the clock only reveals it
  function buildRun() {
    const e = emissions();
    const air = [AIR0], land = [0], ocean = [0], geo = [0], uptake = [];
    for (let y = 0; y <= END; y++) {
      const u = Math.max(0, C * (air[y] - AIR1750));
      uptake.push(u);
      if (y === END) break;
      air.push(air[y] + e - u);
      land.push(land[y] + u * LAND_SHARE - e * CLEARING_SHARE);
      ocean.push(ocean[y] + u * OCEAN_SHARE);
      geo.push(geo[y] - e * FOSSIL_SHARE);
    }
    return { e: e, air: air, land: land, ocean: ocean, geo: geo, uptake: uptake };
  }

  function newRun(keepOld) {
    // only a run that got going is kept, so dragging the slider does not fill the list
    if (keepOld && s.run && s.t >= 1) {
      s.ghosts.push(s.run.air.slice());
      while (s.ghosts.length > KEEP_RUNS) s.ghosts.shift();
    }
    s.t = 0;
    s.run = buildRun();
  }

  const yearNow = () => Math.min(END, Math.floor(s.t + 1e-9));
  function at(series, t) {
    const y = Math.min(END, Math.floor(t + 1e-9));
    const f = t - y;
    const a = series[y];
    const b = series[y + 1] !== undefined ? series[y + 1] : a;
    return a + (b - a) * f;
  }

  function step(dt) {
    if (s.t >= END) return;
    s.t += dt * YEARS_PER_SECOND;
    if (s.t >= END - 1e-9) {
      s.t = END;
      sim.hold();   // the clock stops exactly on year 40
    }
  }

  function showSlider() {
    if (output) output.textContent = s.pct + '% = ' + one(emissions()) + ' billion t';
  }

  function statusText() {
    const ppm = whole(at(s.run.air, s.t) / PPM);
    if (s.t >= END) return ['ok', (START_YEAR + END) + ': ' + ppm + ' ppm. Press Record, then try another setting.'];
    if (s.t === 0) return ['ok', '2023: 419 ppm. Set the emissions, then press Play.'];
    return ['neutral', (START_YEAR + yearNow()) + ': ' + ppm + ' ppm'];
  }

  function report() {
    const y = yearNow();
    const u = s.run.uptake[y];
    sim.setReadout('year', String(START_YEAR + y));
    sim.setReadout('ppm', whole(at(s.run.air, s.t) / PPM) + ' ppm');
    sim.setReadout('uptake', one(u));
    sim.setReadout('gain', one(s.run.e - u));
    const st = statusText();
    if (st[1] !== lastStatus) { lastStatus = st[1]; sim.setStatus(st[0], st[1]); }
  }

  /* ---------- drawing ---------- */
  function label(ctx, env, text, x, y, align, color, weight, size) {
    ctx.font = env.font(size || 12, 'mono', weight || 500);
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color || env.colors.inkSoft;
    ctx.fillText(text, x, y);
  }

  function sphere(ctx, env, b, name, line, color) {
    const c = env.colors;
    ctx.fillStyle = c.card; ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.strokeRect(b.x, b.y, b.w, b.h);
    label(ctx, env, name, b.x + b.w / 2, b.y + b.h * 0.36, 'center', c.ink, 700);
    label(ctx, env, line, b.x + b.w / 2, b.y + b.h * 0.7, 'center', c.inkSoft, 500, 11);
  }

  // an arrow from (x1, y1) to (x2, y2); width follows the flow
  function arrow(ctx, color, x1, y1, x2, y2, width, dash, phase) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const head = 6 + width;
    const ex = x2 - Math.cos(ang) * head, ey = y2 - Math.sin(ang) * head;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = 'butt';
    if (dash) { ctx.setLineDash(dash); ctx.lineDashOffset = -phase; }
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(ex + Math.cos(ang + Math.PI / 2) * head * 0.6, ey + Math.sin(ang + Math.PI / 2) * head * 0.6);
    ctx.lineTo(ex + Math.cos(ang - Math.PI / 2) * head * 0.6, ey + Math.sin(ang - Math.PI / 2) * head * 0.6);
    ctx.closePath(); ctx.fill();
  }

  const flowWidth = (gtc) => (gtc < 0.05 ? 0 : 1.5 + gtc * 0.9);

  function drawSpheres(ctx, env, top, h) {
    const c = env.colors;
    const pad = 12;
    const gap = env.w < 560 ? 8 : 18;
    const bw = (env.w - 2 * pad - 2 * gap) / 3;
    const bh = Math.min(64, h * 0.3);
    const y = yearNow();
    const run = s.run;
    const u = run.uptake[y];
    const e = run.e;

    const air = { x: env.w / 2 - bw * 0.75, y: top + 6, w: bw * 1.5, h: bh };
    const rowY = top + h - bh - 4;
    const land = { x: pad, y: rowY, w: bw, h: bh };
    const sea = { x: pad + bw + gap, y: rowY, w: bw, h: bh };
    const rock = { x: pad + 2 * (bw + gap), y: rowY, w: bw, h: bh };

    const narrow = env.w < 560;
    const airNow = at(run.air, s.t);
    sphere(ctx, env, air, 'Atmosphere', whole(airNow) + ' GtC (' + whole(airNow / PPM) + ' ppm)', c.cool);
    sphere(ctx, env, land, 'Biosphere', signed(at(run.land, s.t)) + (narrow ? '' : ' since 2023'), c.glucose);
    sphere(ctx, env, sea, 'Hydrosphere', signed(at(run.ocean, s.t)) + (narrow ? '' : ' since 2023'), c.water);
    sphere(ctx, env, rock, 'Geosphere', signed(at(run.geo, s.t)) + (narrow ? '' : ' since 2023'), c.co2);

    const phase = (s.t * 40) % 1000;
    const airBottom = air.y + air.h;
    const gapY = rowY - airBottom;

    // natural two-way flows, which balance: thin and still
    const nat = (bx, text) => {
      const x = bx.x + bx.w * 0.18;
      arrow(ctx, c.inkMute, x, airBottom + 4, x, rowY - 2, 1.25);
      arrow(ctx, c.inkMute, x + 9, rowY - 2, x + 9, airBottom + 4, 1.25);
      label(ctx, env, text, x - 5, airBottom + gapY * 0.5, 'right', c.inkMute, 500, 11);
    };
    nat(land, '130');
    nat(sea, '80');

    // flows changed by people: width follows the flow, dashes move with it
    const dash = [8, 6];
    const mid = (b) => b.x + b.w * 0.62;
    const fossil = e * FOSSIL_SHARE;
    const clearing = e * CLEARING_SHARE;
    if (fossil > 0.05) {
      arrow(ctx, c.thermal, rock.x + rock.w * 0.45, rowY - 2, air.x + air.w - 8, airBottom + 4, flowWidth(fossil), dash, phase);
      label(ctx, env, one(fossil), rock.x + rock.w * 0.45 + 8, rowY - 14, 'left', c.thermal, 700);
    }
    if (clearing > 0.05) {
      arrow(ctx, c.thermal, mid(land) + 22, rowY - 2, air.x + 18, airBottom + 4, flowWidth(clearing), dash, phase);
    }
    const landU = u * LAND_SHARE, seaU = u * OCEAN_SHARE;
    arrow(ctx, c.glucose, air.x + 4, airBottom + 4, mid(land), rowY - 2, flowWidth(landU), dash, phase);
    arrow(ctx, c.water, mid(sea), airBottom + 4, mid(sea), rowY - 2, flowWidth(seaU), dash, phase);
    label(ctx, env, one(landU), mid(land) + 6, rowY - 14, 'left', c.glucose, 700);
    label(ctx, env, one(seaU), mid(sea) + 8, airBottom + gapY * 0.5, 'left', c.water, 700);
    if (clearing > 0.05) label(ctx, env, one(clearing), mid(land) + 30, airBottom + 16, 'left', c.thermal, 700);
  }

  function drawGraph(ctx, env, G) {
    const c = env.colors;
    const X = (t) => G.x + (t / END) * G.w;
    const Y = (ppm) => G.y + G.h - ((Math.max(PPM_MIN, Math.min(ppm, PPM_MAX)) - PPM_MIN) / (PPM_MAX - PPM_MIN)) * G.h;
    ctx.fillStyle = c.card; ctx.strokeStyle = c.hair; ctx.lineWidth = 1.5;
    ctx.fillRect(G.x, G.y, G.w, G.h); ctx.strokeRect(G.x, G.y, G.w, G.h);
    [300, 400, 500, 600].forEach((v) => {
      ctx.strokeStyle = c.hairSoft; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(G.x, Y(v)); ctx.lineTo(G.x + G.w, Y(v)); ctx.stroke();
      label(ctx, env, String(v), G.x - 6, Y(v), 'right', c.inkSoft);
    });
    for (let yr = 0; yr <= END; yr += 10) label(ctx, env, String(START_YEAR + yr), X(yr), G.y + G.h + 14, 'center', c.inkSoft);
    label(ctx, env, 'CO₂ in the air (ppm)', G.x, G.y - 12, 'left', c.inkSoft);

    // the 1750 level
    ctx.strokeStyle = c.inkMute; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.moveTo(G.x, Y(278)); ctx.lineTo(G.x + G.w, Y(278)); ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, env, '1750: 278 ppm', G.x + G.w - 6, Y(278) - 10, 'right', c.inkMute);

    ctx.save();
    ctx.beginPath(); ctx.rect(G.x, G.y, G.w, G.h); ctx.clip();
    ctx.globalAlpha = 0.3; ctx.strokeStyle = c.ink; ctx.lineWidth = 2;
    s.ghosts.forEach((air) => {
      ctx.beginPath();
      air.forEach((a, yr) => { if (yr === 0) ctx.moveTo(X(0), Y(a / PPM)); else ctx.lineTo(X(yr), Y(a / PPM)); });
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.strokeStyle = c.ink; ctx.lineWidth = 2.75; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(X(0), Y(s.run.air[0] / PPM));
    for (let yr = 1; yr <= yearNow(); yr++) ctx.lineTo(X(yr), Y(s.run.air[yr] / PPM));
    ctx.lineTo(X(s.t), Y(at(s.run.air, s.t) / PPM));
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = c.ink;
    ctx.beginPath(); ctx.arc(X(s.t), Y(at(s.run.air, s.t) / PPM), 4.5, 0, Math.PI * 2); ctx.fill();
  }

  function draw(ctx, env) {
    const topH = env.h * 0.5;
    drawSpheres(ctx, env, 0, topH);
    const gx = 44;
    drawGraph(ctx, env, { x: gx, y: topH + 30, w: env.w - gx - 16, h: env.h - topH - 30 - 26 });
  }

  /* ---------- the sim ---------- */
  sim = window.TB.sim.create(box, {
    kind: 'canvas',
    loop: true,
    tokens: ['cool', 'glucose', 'water', 'co2', 'thermal'],
    init() {
      // a browser can restore the slider on reload, so the model starts from what it shows
      if (slider) s.pct = Number(slider.value);
      newRun(false);
      showSlider();
      report();
    },
    stepSeconds: 2.5,   // under reduced motion one Step is 5 model years
    update(dt) {
      step(dt);
      report();
    },
    draw: draw,
    record() {
      const done = s.t >= END;
      return {
        'Emissions': s.pct + '% (' + one(emissions()) + ' billion t)',
        'CO₂ in 2063': done ? whole(s.run.air[END] / PPM) + ' ppm' : 'Wait',
        'Air gain in 2063': done ? one(s.run.e - s.run.uptake[END]) + ' billion t' : 'Wait'
      };
    }
  });

  showSlider();   // after the helper's own slider wiring, so this label wins
  if (slider) {
    slider.addEventListener('input', () => {
      s.pct = Number(slider.value);
      showSlider();
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
