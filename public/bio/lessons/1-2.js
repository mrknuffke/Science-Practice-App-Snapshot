/* ============================================================
   Lesson 1-2: how does your body keep its core temperature steady?
   Built on TB.sim.create (docs/textbook/RUNTIME_SPEC.md, section 4.3).
   Brief: docs/plans/textbook-sim-briefs.md, "Bio 1-2".

   The model is a feedback loop that runs over time. Every step it:
     1. senses: mostly core temperature, a little skin temperature
     2. decides: how far the sensed value is from the 37.0 C set point
     3. responds: skin vessels, goosebumps, shivering, sweating, each easing in
     4. heats or cools the core by the balance of heat made and heat lost
   Sweat only cools when it can evaporate, so humid air weakens that loss.

   The scale is for teaching. One real second is ten simulated seconds, so one
   simulated minute takes six real seconds, and the graph shows ten minutes.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const SPEED = 10;                 // simulated seconds per real second
  const SET_POINT = 37.0;
  const BAND_LOW = 36.5;
  const BAND_HIGH = 37.5;
  const WINDOW_MIN = 10;            // the graph shows the last 10 simulated minutes
  const T_MIN = 35;
  const T_MAX = 41;

  const NEUTRAL_AIR = 22;           // the air temperature at which no response is needed
  const HEAT_MADE = 85;             // watts at rest
  const SKIN_LOSS = HEAT_MADE / (SET_POINT - NEUTRAL_AIR);   // watts per degree, vessels as they are
  const BODY_MASS = 5000;           // joules per degree (teaching scale, so a minute is enough to see)
  const EASE_SECONDS = 35;          // how fast a response eases in or out
  const SHIVER_WATTS = 260;
  const SWEAT_WATTS = 300;
  const HUMID_EVAPORATION = 0.25;   // the share of sweat that still evaporates in humid air
  const ON_LEVEL = 0.15;            // a response shows as "on" above this level
  const HOLD_SECONDS = 60;          // the record column reads the core at this time after a change

  const box = document.querySelector('[data-sim="thermo"]');
  if (!box || !window.TB) return;

  const slider = box.querySelector('input[type="range"]');
  const humidChip = box.querySelector('[data-humid]');
  const restartChip = box.querySelector('[data-restart]');

  const state = {
    core: SET_POINT,
    vc: 0, vd: 0, goose: 0, shiver: 0, sweat: 0,   // response levels, 0 to 1
    air: 22,
    humid: false,
    clock: 0,                                       // simulated seconds since the last change
    held: null,                                     // core at HOLD_SECONDS after the last change
    elapsed: 0,                                     // simulated seconds since the start
    history: [],
    nextSample: 0
  };
  let sim = null;

  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

  /* ---------- the model ---------- */
  function sense(s) {
    const skin = s.air + 0.6 * (s.core - s.air);
    return 0.85 * (s.core - SET_POINT) + 0.10 * (skin - 31);
  }

  function step(s, seconds) {
    const e = sense(s);
    const cold = Math.max(0, -e - 0.15);
    const hot = Math.max(0, e - 0.15);
    const target = {
      vc: clamp(cold / 0.5, 0, 1),
      vd: clamp(hot / 0.5, 0, 1),
      goose: cold > 0.25 ? clamp((cold - 0.25) / 0.6, 0, 1) : 0,
      shiver: cold > 0.35 ? clamp((cold - 0.35) / 0.8, 0, 1) : 0,
      sweat: hot > 0.25 ? clamp((hot - 0.25) / 0.7, 0, 1) : 0
    };
    const k = 1 - Math.exp(-seconds / EASE_SECONDS);
    ['vc', 'vd', 'goose', 'shiver', 'sweat'].forEach((key) => { s[key] += (target[key] - s[key]) * k; });
    const conductance = (1 - 0.35 * s.vc + 0.9 * s.vd) * (1 - 0.1 * s.goose);
    const made = HEAT_MADE + SHIVER_WATTS * s.shiver;
    const lostSkin = SKIN_LOSS * conductance * (s.core - s.air);
    const lostSweat = SWEAT_WATTS * s.sweat * (s.humid ? HUMID_EVAPORATION : 1);
    s.core += ((made - lostSkin - lostSweat) / BODY_MASS) * seconds;
    s.elapsed += seconds;
    s.clock += seconds;
    if (s.held === null && s.clock >= HOLD_SECONDS) s.held = s.core;
  }

  function sample(s) {
    s.history.push({ t: s.elapsed / 60, v: s.core });
    const cut = s.elapsed / 60 - WINDOW_MIN - 1;
    while (s.history.length > 2 && s.history[1].t < cut) s.history.shift();
  }

  function startOver() {
    state.core = SET_POINT;
    state.vc = state.vd = state.goose = state.shiver = state.sweat = 0;
    state.clock = 0;
    state.held = null;
    state.elapsed = 0;
    state.history = [];
    state.nextSample = 0;
  }

  function conditionChanged() {
    state.clock = 0;
    state.held = null;
  }

  // The words for what is on, from the response levels.
  function responses(s) {
    const on = [];
    if (s.shiver > ON_LEVEL) on.push('shivering');
    if (s.goose > ON_LEVEL) on.push('goosebumps');
    if (s.vc > ON_LEVEL) on.push('vessels narrow');
    if (s.vd > ON_LEVEL) on.push('vessels widen');
    if (s.sweat > ON_LEVEL) on.push('sweating');
    return on.length ? on.join(', ') : 'none';
  }

  function statusFor(s) {
    if (s.core > BAND_HIGH + 0.3) return ['warn', 'Core temperature is too high'];
    if (s.core < BAND_LOW - 0.3) return ['warn', 'Core temperature is too low'];
    if (s.core > BAND_HIGH || s.core < BAND_LOW) return ['warn', 'Core is outside the normal band'];
    return ['ok', 'Core is in the normal band'];
  }

  function minutes(sec) {
    const m = Math.floor(sec / 60);
    const r = Math.floor(sec % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  let lastStatus = '';
  function report() {
    sim.setReadout('core', state.core.toFixed(1) + ' °C');
    sim.setReadout('clock', minutes(state.clock));
    sim.setReadout('held', state.held === null ? 'Wait' : state.held.toFixed(1) + ' °C');
    sim.setReadout('on', responses(state));
    const st = statusFor(state);
    if (st[1] !== lastStatus) { lastStatus = st[1]; sim.setStatus(st[0], st[1]); }
  }

  /* ---------- layout ---------- */
  const PILL_TEXTS = ['Shivering', 'Goosebumps', 'Vessels narrow', 'Vessels widen', 'Sweating'];
  function layout(env) {
    const narrow = env.w < 600;
    const pad = 10;
    const ctx = env.ctx;
    ctx.font = env.font(12, 'mono', 600);
    let widest = 0;
    PILL_TEXTS.forEach((s) => { widest = Math.max(widest, ctx.measureText(s).width); });
    const L = { narrow: narrow, pill: Math.ceil(widest) + 36 };
    if (!narrow) {
      L.bodyW = 118;
      L.body = { x: pad, y: pad, w: L.bodyW + 14 + L.pill, h: env.h - 2 * pad };
      const gx = L.body.x + L.body.w + 40;
      L.graph = { x: gx, y: pad + 24, w: env.w - gx - pad - 6, h: env.h - 2 * pad - 24 - 22 };
    } else {
      L.body = { x: pad, y: pad, w: env.w - 2 * pad, h: env.h * 0.5 - pad };
      L.bodyW = L.body.w - L.pill - 14;
      L.graph = { x: 40, y: env.h * 0.5 + 26, w: env.w - 40 - pad - 6, h: env.h * 0.5 - 26 - 40 };
    }
    return L;
  }

  /* ---------- drawing ---------- */
  function drawLabel(ctx, env, text, x, y, align, color) {
    ctx.font = env.font(12, 'mono', 600);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const w = ctx.measureText(text).width;
    const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.fillStyle = color || env.colors.inkSoft;
    ctx.fillText(text, Math.max(3, Math.min(env.w - 3 - w, left)), y);
    return w;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // The body, in a box of body units: 100 tall, 56 wide, centred on x = 0.
  function drawBody(ctx, env, L) {
    const c = env.colors;
    const B = L.body;
    const bodyW = L.bodyW;
    const s = Math.min(bodyW / 50, (B.h - 8) / 100);
    const ox = B.x + bodyW / 2;
    const oy = B.y + Math.max(4, (B.h - 100 * s) / 2);
    const X = (u) => ox + u * s;
    const Y = (u) => oy + u * s;
    const t = env.time;

    // limbs and torso: an outline pass, then a fill pass
    const limbs = [
      [-10, 26, -19, 54, 6], [10, 26, 19, 54, 6],
      [-5, 58, -7, 96, 7.5], [5, 58, 7, 96, 7.5]
    ];
    ctx.lineCap = 'round';
    [1, 0].forEach((outline) => {
      ctx.strokeStyle = outline ? c.inkMute : c.paper2;
      limbs.forEach((l) => {
        ctx.lineWidth = (l[4] + (outline ? 1.4 : 0)) * s;
        ctx.beginPath(); ctx.moveTo(X(l[0]), Y(l[1])); ctx.lineTo(X(l[2]), Y(l[3])); ctx.stroke();
      });
    });
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = c.inkMute;
    ctx.fillStyle = c.paper2;
    roundRect(ctx, X(-12), Y(20), 24 * s, 40 * s, 7 * s);
    ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(0), Y(10), 8.5 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // the core thermometer
    const frac = clamp((state.core - T_MIN) / (T_MAX - T_MIN), 0, 1);
    const tubeTop = 24, tubeBottom = 50;
    const tubeW = 5 * s;
    ctx.fillStyle = c.card; ctx.strokeStyle = c.inkMute; ctx.lineWidth = 1.5;
    roundRect(ctx, X(0) - tubeW / 2, Y(tubeTop), tubeW, (tubeBottom - tubeTop) * s, tubeW / 2);
    ctx.fill(); ctx.stroke();
    const thermoColor = state.core > BAND_HIGH ? c.thermal : state.core < BAND_LOW ? c.oxygen : c.accent;
    ctx.fillStyle = thermoColor;
    const fh = (tubeBottom - tubeTop) * s * frac;
    ctx.fillRect(X(0) - tubeW / 2 + 1.5, Y(tubeBottom) - fh, tubeW - 3, fh);
    ctx.beginPath(); ctx.arc(X(0), Y(tubeBottom + 3), 4.2 * s, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // the set point mark on the tube
    const spY = Y(tubeBottom) - (tubeBottom - tubeTop) * s * ((SET_POINT - T_MIN) / (T_MAX - T_MIN));
    ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(X(0) + tubeW / 2, spY); ctx.lineTo(X(0) + tubeW / 2 + 4 * s, spY); ctx.stroke();

    // skin vessels: two lines down the torso that narrow in the cold and widen in the heat
    const vw = clamp(2.2 * (1 - 0.8 * state.vc + 1.6 * state.vd), 0.8, 6) * Math.max(0.7, s * 0.55);
    ctx.lineWidth = vw;
    ctx.strokeStyle = state.vd > ON_LEVEL ? c.thermal : state.vc > ON_LEVEL ? c.oxygen : c.inkSoft;
    [-8.2, 8.2].forEach((x) => {
      ctx.beginPath(); ctx.moveTo(X(x), Y(26)); ctx.lineTo(X(x), Y(56)); ctx.stroke();
    });

    // goosebumps: small bumps along the arms and the torso edge
    if (state.goose > ON_LEVEL) {
      ctx.fillStyle = c.oxygen;
      ctx.globalAlpha = clamp(state.goose + 0.2, 0, 1);
      [[-14, 34], [-16, 42], [-18, 50], [14, 34], [16, 42], [18, 50], [-12, 30], [12, 30]].forEach((p) => {
        ctx.beginPath(); ctx.arc(X(p[0]) + (p[0] < 0 ? -3.5 : 3.5) * s * 0.6, Y(p[1]), Math.max(1.6, 1.3 * s), 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    // shivering: short marks that jitter beside the arms and legs
    if (state.shiver > ON_LEVEL) {
      ctx.strokeStyle = c.oxygen;
      ctx.lineWidth = 2;
      const amp = (1 + 2.2 * state.shiver) * s * 0.5;
      [[-24, 40], [24, 40], [-14, 78], [14, 78]].forEach((p, i) => {
        const j = Math.sin(t * 38 + i * 1.7) * amp;
        ctx.beginPath();
        ctx.moveTo(X(p[0]) + j, Y(p[1]) - 5 * s);
        ctx.lineTo(X(p[0]) - j, Y(p[1]));
        ctx.lineTo(X(p[0]) + j, Y(p[1]) + 5 * s);
        ctx.stroke();
      });
    }

    // sweating: drops on the head and shoulders. Dry air: they dry away. Humid air: they stay and drip.
    if (state.sweat > ON_LEVEL) {
      const count = Math.max(2, Math.round(state.sweat * 7));
      const spots = [[-5, 4], [5, 5], [0, 15], [-9, 20], [9, 21], [-6, 30], [6, 31], [0, 40]];
      ctx.fillStyle = c.water;
      for (let i = 0; i < count; i++) {
        const sp = spots[i];
        const phase = (t * 0.7 + i * 0.37) % 1;
        const dy = state.humid ? phase * 4 : -phase * 4;
        ctx.globalAlpha = state.humid ? 0.95 : 1 - phase;
        ctx.beginPath(); ctx.arc(X(sp[0]), Y(sp[1]) + dy * s, Math.max(1.8, 1.4 * s), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // the four response names, lit when the response is on
    const items = [
      { text: 'Shivering', on: state.shiver > ON_LEVEL, color: c.oxygen },
      { text: 'Goosebumps', on: state.goose > ON_LEVEL, color: c.oxygen },
      state.vd > ON_LEVEL ? { text: 'Vessels widen', on: true, color: c.thermal }
        : state.vc > ON_LEVEL ? { text: 'Vessels narrow', on: true, color: c.oxygen }
        : { text: 'Vessels', on: false, color: c.inkMute },
      { text: 'Sweating', on: state.sweat > ON_LEVEL, color: c.thermal }
    ];
    const px = B.x + bodyW + 14;
    const pw = L.pill;
    const ph = 24;
    const gap = L.narrow ? 8 : 12;
    const total = items.length * ph + (items.length - 1) * gap;
    let py = B.y + (B.h - total) / 2;
    ctx.font = env.font(12, 'mono', 600);
    items.forEach((it) => {
      ctx.lineWidth = it.on ? 2.5 : 1.5;
      ctx.strokeStyle = it.on ? it.color : c.hair;
      ctx.fillStyle = c.card;
      roundRect(ctx, px, py, pw, ph, 12);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = it.on ? it.color : c.hair;
      ctx.beginPath(); ctx.arc(px + 12, py + ph / 2, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillStyle = it.on ? c.ink : c.inkMute;
      ctx.fillText(it.text, px + 23, py + ph / 2 + 0.5);
      py += ph + gap;
    });
  }

  function drawGraph(ctx, env, L) {
    const c = env.colors;
    const G = L.graph;
    const xNow = state.elapsed / 60;
    const x0 = Math.max(0, xNow - WINDOW_MIN);
    const X = (m) => G.x + ((m - x0) / WINDOW_MIN) * G.w;
    const Y = (v) => G.y + G.h - ((clamp(v, T_MIN, T_MAX) - T_MIN) / (T_MAX - T_MIN)) * G.h;

    ctx.fillStyle = c.card;
    ctx.strokeStyle = c.hair;
    ctx.lineWidth = 1.5;
    ctx.fillRect(G.x, G.y, G.w, G.h);
    ctx.strokeRect(G.x, G.y, G.w, G.h);

    // the normal band, then the set point
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = c.accent;
    ctx.fillRect(G.x, Y(BAND_HIGH), G.w, Y(BAND_LOW) - Y(BAND_HIGH));
    ctx.globalAlpha = 1;
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(G.x, Y(SET_POINT)); ctx.lineTo(G.x + G.w, Y(SET_POINT)); ctx.stroke();
    ctx.setLineDash([]);

    // y labels (the temperature) and x labels (minutes)
    const yTicks = G.h > 150 ? [35, 36, 37, 38, 39, 40, 41] : [35, 37, 39, 41];
    yTicks.forEach((v) => {
      ctx.strokeStyle = c.hairSoft || c.hair;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(G.x - 4, Y(v)); ctx.lineTo(G.x, Y(v)); ctx.stroke();
      drawLabel(ctx, env, String(v), G.x - 8 - 14, Y(v), 'left', c.inkSoft);
    });
    drawLabel(ctx, env, '°C', G.x - 30, G.y - 16, 'left', c.inkSoft);
    const first = Math.ceil(x0 / 2) * 2;
    for (let m = first; m <= x0 + WINDOW_MIN + 0.001; m += 2) {
      ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(m), G.y + G.h); ctx.lineTo(X(m), G.y + G.h + 4); ctx.stroke();
      drawLabel(ctx, env, String(m), X(m), G.y + G.h + 16, 'center', c.inkSoft);
    }
    drawLabel(ctx, env, 'min', G.x - 34, G.y + G.h + 16, 'left', c.inkSoft);

    // the core temperature line, clipped to the graph box
    ctx.save();
    ctx.beginPath(); ctx.rect(G.x, G.y, G.w, G.h); ctx.clip();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const pts = state.history.concat([{ t: xNow, v: state.core }]);
    pts.forEach((p, i) => { if (i === 0) ctx.moveTo(X(p.t), Y(p.v)); else ctx.lineTo(X(p.t), Y(p.v)); });
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = c.ink;
    ctx.beginPath(); ctx.arc(X(xNow), Y(state.core), 4, 0, Math.PI * 2); ctx.fill();
  }

  function draw(ctx, env) {
    const L = layout(env);
    drawBody(ctx, env, L);
    drawGraph(ctx, env, L);
  }

  /* ---------- the sim ---------- */
  sim = window.TB.sim.create(box, {
    kind: 'canvas',
    loop: true,
    tokens: ['glucose', 'oxygen', 'co2', 'water', 'atp', 'thermal', 'hormone'],
    stepSeconds: 1,   // under reduced motion one Step is 10 simulated seconds
    init() {
      // a browser can restore the slider on reload, so the model starts from what it shows
      if (slider) state.air = Number(slider.value);
      startOver();
      sample(state);
      report();
    },
    update(dt) {
      step(state, dt * SPEED);
      if (state.elapsed >= state.nextSample) { sample(state); state.nextSample = state.elapsed + 3; }
      report();
    },
    draw: draw,
    record() {
      return {
        'Air (°C)': state.air,
        'Humidity': state.humid ? 'Humid' : 'Dry',
        'Responses on': responses(state),
        'Core at 1 min (°C)': state.held === null ? 'Wait' : state.held.toFixed(1)
      };
    }
  });

  if (slider) {
    slider.addEventListener('input', () => {
      state.air = Number(slider.value);
      conditionChanged();
      report();
    });
  }
  if (humidChip) {
    humidChip.setAttribute('aria-pressed', 'false');
    humidChip.addEventListener('click', () => {
      state.humid = !state.humid;
      humidChip.setAttribute('aria-pressed', String(state.humid));
      conditionChanged();
      report();
      sim.redraw();
    });
  }
  if (restartChip) {
    restartChip.addEventListener('click', () => {
      startOver();
      sim.release();
      sample(state);
      report();
      sim.redraw();
    });
  }
})();
