/* ============================================================
   1-3b LESSON INTERACTIVES
   The IMF and phase lab, built on TB.sim.create (RUNTIME_SPEC 4.3).
   Brief: docs/plans/textbook-sim-briefs.md, "Chem 1-3b: IMF and Phase Lab".
   One chamber, three substances, one temperature slider (-100 to +120 C). The
   molecules move one fixed 1/60 s step at a time; the vapor pressure comes from
   the substance and the temperature alone, so the readout and the picture agree.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));
  const TAU = Math.PI * 2;
  const ATM = 101.3;                       // kPa
  const T_MIN = -100, T_MAX = 120;
  const SPEED_NOTE = 0.04;                 // phase of the lattice shake per step

  // The numbers the lesson text quotes. vp20 is the vapor pressure at 20 C, the value the
  // text gives, so the sim and the page agree. The curve is fitted through it and the boiling point.
  const SUBSTANCES = {
    CO2: {
      formula: 'CO₂', name: 'Carbon dioxide', imf: 'London dispersion', imfStrength: 'weak (about 2 kJ/mol)',
      point: '−78 °C (sublimes)', tb: -78, tm: -78, sublimes: true,
      desc: 'Carbon dioxide is nonpolar and symmetrical. It attracts its neighbors only through weak, temporary London dispersion forces (about 2 kJ/mol). Very little thermal energy breaks them, so it turns straight into gas at −78 °C at 1 atm.'
    },
    acetone: {
      formula: 'C₃H₆O', name: 'Acetone', imf: 'Dipole-dipole', imfStrength: 'moderate (about 10 kJ/mol)',
      point: '56 °C', tb: 56, tm: -95, vp20: 24.0,
      desc: 'Acetone has a polar C=O bond that gives it permanent partial charges. Its neighbors attract dipole to dipole (about 10 kJ/mol). It stays liquid at room temperature with a high vapor pressure (24 kPa) until it boils at 56 °C.'
    },
    H2O: {
      formula: 'H₂O', name: 'Water', imf: 'Hydrogen bonding', imfStrength: 'strong (about 25 kJ/mol)',
      point: '100 °C', tb: 100, tm: 0, vp20: 2.3,
      desc: 'Water has very polar O–H bonds and lone pairs on oxygen. Together they form a strong, cohesive network of hydrogen bonds (about 25 kJ/mol). Water stays a liquid with a very low vapor pressure (2.3 kPa) until it boils at 100 °C.'
    }
  };

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  /* ---- the model ---- */
  function phaseOf(key, t) {
    const s = SUBSTANCES[key];
    if (key === 'CO2') return t < s.tb ? 'solid' : 'gas';
    if (t < s.tm) return 'solid';
    if (t >= s.tb) return 'gas';
    return 'liquid';
  }

  // Vapor pressure of the liquid in kPa: 1 atm at the boiling point, the text's value at 20 C, and a
  // Clausius-Clapeyron curve between them.
  function liquidPressure(s, t) {
    const T = t + 273.15, Tb = s.tb + 273.15;
    const A = Math.log(ATM / s.vp20) / (1 / 293.15 - 1 / Tb);
    return ATM * Math.exp(-A * (1 / T - 1 / Tb));
  }

  // Always between 0.1 kPa and 1 atm, and it never falls as the temperature rises. A solid starts
  // from the liquid's value at the melting point and falls away smoothly toward the cold end.
  function vaporPressure(key, t) {
    const s = SUBSTANCES[key];
    if (key === 'CO2') {
      if (t < s.tb) { const f = clamp((t - T_MIN) / 22, 0, 1); return clamp(f * f * 95, 0.1, ATM); }
      return ATM;
    }
    if (t < s.tm) {
      const f = clamp((t - T_MIN) / (s.tm - T_MIN), 0, 1);
      return clamp(liquidPressure(s, s.tm) * f * f * f, 0.1, ATM);
    }
    if (t >= s.tb) return ATM;
    return clamp(liquidPressure(s, t), 0.1, ATM);
  }

  const N = 8;
  const SOLID = [{ x: 65, y: 150 }, { x: 120, y: 150 }, { x: 175, y: 150 }, { x: 230, y: 150 }, { x: 65, y: 195 }, { x: 120, y: 195 }, { x: 175, y: 195 }, { x: 230, y: 195 }];
  const LATTICE = [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [0, 4], [1, 5], [2, 6], [3, 7], [0, 5], [1, 4], [1, 6], [2, 5], [2, 7], [3, 6]];

  function makeMolecules() {
    let seed = 11;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    return SOLID.map((p, id) => ({
      id: id, x: p.x, y: p.y, vx: (rnd() - 0.5) * 1.8, vy: (rnd() - 0.5) * 1.8,
      angle: (rnd() - 0.5) * 0.4, vAngle: (rnd() - 0.5) * 0.04, zone: 'liquid'
    }));
  }

  const state = { key: 'acetone', temp: 20, t: 0, mols: makeMolecules() };
  if (window.GC_MODELS) window.GC_MODELS['1-3b'] = { SUBSTANCES: SUBSTANCES, vaporPressure: vaporPressure, phaseOf: phaseOf, state: state, step: step };

  // one fixed step (1/60 s)
  function step() {
    state.t += SPEED_NOTE;
    const phase = phaseOf(state.key, state.temp);
    const sub = SUBSTANCES[state.key];
    const vp = vaporPressure(state.key, state.temp);
    let wantVapor = 0;
    if (phase === 'gas') wantVapor = N;
    else if (phase === 'liquid') wantVapor = Math.round(1 + Math.min(1, vp / 85) * 5);

    state.mols.forEach((m, i) => {
      const isVapor = i < wantVapor;
      if (phase === 'solid') {
        const base = SOLID[m.id];
        const amp = Math.max(0.4, (state.temp + 105) * 0.015);
        m.x = base.x + Math.sin(state.t * 14 + m.id * 1.5) * amp;
        m.y = base.y + Math.cos(state.t * 14 + m.id * 1.5) * amp;
        m.angle = 0.08 * Math.sin(state.t * 4 + m.id);
        m.zone = 'solid';
      } else if (phase === 'gas') {
        const sp = Math.max(0.8, 1.2 + (state.temp - sub.tb) * 0.01);
        m.x += m.vx * sp; m.y += m.vy * sp; m.angle += m.vAngle * 1.5;
        if (m.x < 25) { m.x = 25; m.vx = Math.abs(m.vx); }
        if (m.x > 265) { m.x = 265; m.vx = -Math.abs(m.vx); }
        if (m.y < 25) { m.y = 25; m.vy = Math.abs(m.vy); }
        if (m.y > 215) { m.y = 215; m.vy = -Math.abs(m.vy); }
        m.zone = 'gas';
      } else if (isVapor) {
        const sp = 1.1 + (state.temp / 100) * 0.4;
        m.x += m.vx * sp; m.y += m.vy * sp; m.angle += m.vAngle;
        if (m.x < 25) { m.x = 25; m.vx = Math.abs(m.vx); }
        if (m.x > 265) { m.x = 265; m.vx = -Math.abs(m.vx); }
        if (m.y < 25) { m.y = 25; m.vy = Math.abs(m.vy); }
        if (m.y > 118) { m.y = 118; m.vy = -Math.abs(m.vy); }
        m.zone = 'vapor';
      } else {
        m.x += m.vx * 0.55; m.y += m.vy * 0.55; m.angle += m.vAngle * 0.4;
        m.vy += 0.04; m.vx += (145 - m.x) * 0.002;
        if (m.x < 45) { m.x = 45; m.vx = Math.abs(m.vx); }
        if (m.x > 245) { m.x = 245; m.vx = -Math.abs(m.vx); }
        if (m.y < 135) { m.y = 135; m.vy = Math.abs(m.vy); }
        if (m.y > 215) { m.y = 215; m.vy = -Math.abs(m.vy); }
        m.vx *= 0.985; m.vy *= 0.985;
        // a molecule that has nearly stopped gets a small nudge, from the molecule's own phase, not from chance
        if (Math.abs(m.vx) < 0.1) m.vx += Math.sin(state.t * 3 + m.id * 2.1) * 0.2;
        if (Math.abs(m.vy) < 0.1) m.vy += Math.cos(state.t * 3 + m.id * 1.7) * 0.2;
        m.zone = 'liquid';
      }
    });

    if (phase === 'liquid') {
      const minDist = 28;
      for (let i = 0; i < N; i++) {
        const a = state.mols[i];
        if (a.zone !== 'liquid') continue;
        for (let j = i + 1; j < N; j++) {
          const b = state.mols[j];
          if (b.zone !== 'liquid') continue;
          const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
          if (d2 < minDist * minDist && d2 > 0.01) {
            const d = Math.sqrt(d2), o = (minDist - d) / d, fx = dx * o * 0.22, fy = dy * o * 0.22;
            a.x -= fx; a.y -= fy; b.x += fx; b.y += fy;
            a.vx -= fx * 0.3; a.vy -= fy * 0.3; b.vx += fx * 0.3; b.vy += fy * 0.3;
          }
        }
      }
    }
  }

  function energyText(phase) {
    if (phase === 'solid') return 'Thermal energy is lower than the attractions, so the molecules are locked in a lattice.';
    if (phase === 'liquid') return 'Thermal energy loosens the lattice, so the molecules slide past each other. Surface molecules sometimes escape as vapor.';
    return 'Thermal energy is larger than the attractions, so the molecules move freely as a gas.';
  }
  function phaseName(phase, key, t) {
    if (phase === 'solid') return key === 'CO2' ? 'Solid (dry ice)' : 'Solid';
    if (phase === 'liquid') return 'Liquid';
    return t >= SUBSTANCES[key].tb && key !== 'CO2' ? 'Boiling' : 'Gas';
  }

  function init() {
    const box = $('[data-sim="phase"]');
    if (!box || !window.TB) return;
    const slider = $('#tempSlider', box);
    const slOut = $('output', slider.closest('label'));
    const note = $('[data-sim-note]', box);
    const chips = $$('[data-sub]', box);
    let sim = null;

    const tempText = (t) => (t > 0 ? '+' : t < 0 ? '−' : '') + Math.abs(t) + ' °C';

    function report() {
      const { key, temp } = state;
      const sub = SUBSTANCES[key];
      const phase = phaseOf(key, temp);
      const vp = vaporPressure(key, temp);
      slOut.textContent = tempText(temp);
      sim.setReadout('sub', sub.formula);
      sim.setReadout('phase', phaseName(phase, key, temp));
      sim.setReadout('vp', vp >= ATM ? '101 kPa (1 atm)' : vp.toFixed(1) + ' kPa');
      sim.setReadout('imf', sub.imf);
      sim.setReadout('point', sub.point);
      if (sim.committed) {
        sim.setStatus(vp >= ATM ? 'warn' : 'neutral', vp >= ATM ? 'Vapor pressure equals 1 atm' : phaseName(phase, key, temp));
        note.textContent = sub.desc + ' ' + energyText(phase);
      } else {
        sim.setStatus('neutral', 'Predict to start');
      }
      sim.setLabel(sub.name + ' in a closed chamber at ' + tempText(temp) + ': ' + phaseName(phase, key, temp).toLowerCase() + '. A column on the right shows a vapor pressure of ' + (vp >= ATM ? '1 atmosphere' : vp.toFixed(1) + ' kilopascals') + '.');
    }

    function setSub(key) {
      state.key = key;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.sub === key)));
      report();
      sim.redraw();
    }
    function setTemp(t) {
      state.temp = clamp(Math.round(t), T_MIN, T_MAX);
      slider.value = String(state.temp);
      report();
      sim.redraw();
    }

    /* ---- drawing, in a 330 by 240 design box scaled to the stage ---- */
    function molecule(ctx, env, type, cx, cy, ang) {
      const c = env.colors;
      let atoms = [], bonds = [];
      if (type === 'CO2') {
        atoms = [{ x: 0, y: 0, r: 6.5, f: c.inkMute }, { x: -14, y: 0, r: 5.5, f: c.accent }, { x: 14, y: 0, r: 5.5, f: c.accent }];
        bonds = [[-14, 0, 0, 0, 2], [0, 0, 14, 0, 2]];
      } else if (type === 'acetone') {
        atoms = [{ x: 0, y: 0, r: 6.5, f: c.inkMute }, { x: 0, y: -13, r: 5.5, f: c.accent }, { x: -12, y: 8, r: 5.5, f: c.paper3 }, { x: 12, y: 8, r: 5.5, f: c.paper3 }];
        bonds = [[0, 0, 0, -13, 2], [0, 0, -12, 8, 1], [0, 0, 12, 8, 1]];
      } else {
        atoms = [{ x: 0, y: -3, r: 6.5, f: c.accent }, { x: -10, y: 6, r: 4.2, f: c.paper3 }, { x: 10, y: 6, r: 4.2, f: c.paper3 }];
        bonds = [[0, -3, -10, 6, 1], [0, -3, 10, 6, 1]];
      }
      const cos = Math.cos(ang), sin = Math.sin(ang);
      const rot = (x, y) => ({ x: cx + x * cos - y * sin, y: cy + x * sin + y * cos });
      ctx.strokeStyle = c.ink;
      bonds.forEach((b) => {
        const p1 = rot(b[0], b[1]), p2 = rot(b[2], b[3]);
        const dx = p2.x - p1.x, dy = p2.y - p1.y, len = Math.hypot(dx, dy) || 1;
        const offs = b[4] === 2 ? [-1.6, 1.6] : [0];
        ctx.lineWidth = b[4] === 2 ? 1.2 : 1.8;
        offs.forEach((o) => {
          ctx.beginPath();
          ctx.moveTo(p1.x + (-dy / len) * o, p1.y + (dx / len) * o);
          ctx.lineTo(p2.x + (-dy / len) * o, p2.y + (dx / len) * o);
          ctx.stroke();
        });
      });
      atoms.forEach((a) => {
        const p = rot(a.x, a.y);
        ctx.beginPath(); ctx.arc(p.x, p.y, a.r, 0, TAU);
        ctx.fillStyle = a.f; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = c.ink; ctx.stroke();
      });
    }

    function text(ctx, env, s, x, y, size, color, align) {
      ctx.font = env.font(size, 'mono', 700);
      ctx.fillStyle = color; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(s, x, y);
    }

    function drawScene(ctx, env) {
      const c = env.colors;
      const phase = phaseOf(state.key, state.temp);
      const vp = vaporPressure(state.key, state.temp);

      ctx.fillStyle = c.paper; ctx.strokeStyle = c.hair; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(15, 15, 260, 210, 6); ctx.fill(); ctx.stroke();

      if (phase === 'liquid') {
        ctx.save(); ctx.globalAlpha = 0.14; ctx.fillStyle = c.cool; ctx.fillRect(16, 125, 258, 99); ctx.restore();
        ctx.strokeStyle = c.cool; ctx.lineWidth = 1.5; ctx.setLineDash([4, 2]);
        ctx.beginPath(); ctx.moveTo(16, 125); ctx.lineTo(274, 125); ctx.stroke(); ctx.setLineDash([]);
        text(ctx, env, 'Vapor', 22, 32, 11, c.inkMute);
        text(ctx, env, 'Liquid', 22, 140, 11, c.cool);
      } else if (phase === 'solid') {
        ctx.fillStyle = c.paper2; ctx.strokeStyle = c.hairSoft; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.roundRect(35, 135, 220, 80, 4); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
        text(ctx, env, 'Solid', 42, 147, 11, c.inkMute);
      } else {
        text(ctx, env, 'Gas', 22, 32, 11, c.accent);
      }

      ctx.strokeStyle = c.accent; ctx.setLineDash([3, 2]);
      const line = (a, b, w, alpha) => {
        ctx.save(); ctx.globalAlpha = alpha; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
      };
      if (phase === 'solid') LATTICE.forEach((p) => line(state.mols[p[0]], state.mols[p[1]], 1.6, 0.9));
      else if (phase === 'liquid') {
        for (let i = 0; i < N; i++) {
          if (state.mols[i].zone !== 'liquid') continue;
          for (let j = i + 1; j < N; j++) {
            if (state.mols[j].zone !== 'liquid') continue;
            const d = Math.hypot(state.mols[j].x - state.mols[i].x, state.mols[j].y - state.mols[i].y);
            if (d < 56) line(state.mols[i], state.mols[j], 1.5, Math.max(0.2, 1 - d / 56));
          }
        }
      }
      ctx.setLineDash([]);

      state.mols.forEach((m) => {
        if (m.zone === 'vapor' || m.zone === 'gas') {
          ctx.strokeStyle = c.inkMute; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.5;
          ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 4, m.y - m.vy * 4); ctx.stroke(); ctx.globalAlpha = 1;
        }
        molecule(ctx, env, state.key, m.x, m.y, m.angle);
      });

      // the vapor pressure column
      const gx = 296, gy = 32, gw = 18, gh = 175;
      ctx.fillStyle = c.paper3; ctx.strokeStyle = c.hair; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(gx, gy, gw, gh, 4); ctx.fill(); ctx.stroke();
      const frac = clamp(vp / ATM, 0.02, 1), fh = gh * frac;
      ctx.fillStyle = vp >= ATM ? c.accent : c.cool;
      ctx.beginPath(); ctx.roundRect(gx + 2, gy + gh - fh, gw - 4, fh, 2); ctx.fill();
      ctx.strokeStyle = c.accent; ctx.lineWidth = 1.5; ctx.setLineDash([2, 1]);
      ctx.beginPath(); ctx.moveTo(gx - 4, gy); ctx.lineTo(gx + gw + 4, gy); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, env, '1 atm', gx + gw / 2, 20, 11, c.accent, 'center');
      text(ctx, env, vp >= ATM ? '101 kPa' : vp.toFixed(1), gx + gw / 2, 221, 11, vp >= ATM ? c.accent : c.ink, 'center');
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 0.5,
      tokens: ['paper-3'],
      init() { for (let i = 0; i < 90; i++) step(); report(); },     // pre-warm: the first frame is not a clump
      onUnlock() { report(); },
      update() { step(); },
      draw(ctx, env) {
        const k = Math.min(env.w / 330, env.h / 240);
        ctx.save();
        ctx.translate((env.w - 330 * k) / 2, (env.h - 240 * k) / 2);
        ctx.scale(k, k);
        drawScene(ctx, env);
        ctx.restore();
      },
      preset(name) {
        const p = name.split('@');
        state.key = p[0];
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.sub === state.key)));
        $$('[data-preset]', box).forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.preset === name)));
        setTemp(Number(p[1]));
      },
      record() {
        const vp = vaporPressure(state.key, state.temp);
        return { 'Substance': SUBSTANCES[state.key].name, 'Temperature (°C)': state.temp, 'Vapor pressure (kPa)': vp >= ATM ? '101.3' : vp.toFixed(1), 'Phase': phaseName(phaseOf(state.key, state.temp), state.key, state.temp) };
      }
    });

    chips.forEach((c) => c.addEventListener('click', () => { $$('[data-preset]', box).forEach((p) => p.setAttribute('aria-pressed', 'false')); setSub(c.dataset.sub); }));
    slider.addEventListener('input', () => { $$('[data-preset]', box).forEach((p) => p.setAttribute('aria-pressed', 'false')); setTemp(Number(slider.value)); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
