/* ============================================================
   3-1c LESSON INTERACTIVES
   The coffee-cup calorimeter and its LOL energy bars: an svg stage on TB.sim.create
   (RUNTIME_SPEC 4.3), locked until the prediction is committed. Brief:
   docs/plans/textbook-sim-briefs.md, "Chem keeps" (3-1c). The model is the one the page always
   had (a heat balance with the water at 4.184 J/(g*C)); what changed is the shell. The result
   (final temperature, heat, the LOL bars) shows only after the metal is dropped, so the
   default screen does not answer the checkpoint.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));

  /* ---- the model ---- */
  const C_WATER = 4.184;                                  // J/(g*C)
  const METALS = {
    aluminum: { name: 'Aluminum', symbol: 'Al', c: 0.897 },
    iron: { name: 'Iron', symbol: 'Fe', c: 0.449 },
    copper: { name: 'Copper', symbol: 'Cu', c: 0.385 },
    lead: { name: 'Lead', symbol: 'Pb', c: 0.129 }
  };
  const PRESETS = {
    equal: { metal: 'copper', mm: 50, tmi: 100, mw: 50, twi: 20 },
    lead: { metal: 'lead', mm: 100, tmi: 100, mw: 100, twi: 20 },
    aluminum: { metal: 'aluminum', mm: 100, tmi: 100, mw: 100, twi: 20 },
    iron: { metal: 'iron', mm: 200, tmi: 100, mw: 50, twi: 20 }
  };
  const START = { metal: 'copper', mm: 50, tmi: 100, mw: 100, twi: 20 };

  // q_metal = -q_water at the final temperature
  function equilibrium(metalKey, mm, tmi, mw, twi) {
    const metal = METALS[metalKey] || METALS.copper;
    const capWater = mw * C_WATER, capMetal = mm * metal.c;
    const tf = (capWater * twi + capMetal * tmi) / (capWater + capMetal);
    const qWater = capWater * (tf - twi);
    return { metal: metal, mm: mm, tmi: tmi, mw: mw, twi: twi, tf: tf, qWater: qWater, qMetal: -qWater, dtWater: tf - twi, dtMetal: tf - tmi, capWater: capWater, capMetal: capMetal };
  }
  // LOL energy blocks: a picture of the balance, not a scale of joules (one block is about 800 J)
  function blocks(r) {
    const transfer = Math.max(1, Math.min(3, Math.round(r.qWater / 800) || 1));
    const available = r.mm * r.metal.c * (r.tmi - r.twi);
    const initMetal = Math.max(transfer + 1, Math.min(6, Math.round(available / 700) + 1));
    const initWater = 1;
    return { transfer: transfer, initMetal: initMetal, initWater: initWater, finalMetal: initMetal - transfer, finalWater: initWater + transfer, total: initMetal + initWater };
  }
  if (window.GC_MODELS) window.GC_MODELS['3-1c'] = { equilibrium: equilibrium, blocks: blocks, METALS: METALS, PRESETS: PRESETS, START: START, C_WATER: C_WATER };

  /* ---- the page ---- */
  const DROP_S = 0.8, TOTAL_S = 2.4;                      // the metal falls, then the water warms
  const VW = 300, VH = 220, LW = 340, LH = 185;           // the vessel panel and the LOL panel, in design units

  function init() {
    const box = $('[data-sim="calorimeter"]');
    if (!box || !window.TB) return;
    const sel = $('#metalSelect', box);
    const ins = { mm: $('#metalMass', box), tmi: $('#metalTi', box), mw: $('#waterMass', box), twi: $('#waterTi', box) };
    const runBtn = $('#btnRunCalorimeter', box);
    const results = $('[data-results]', box);
    const note = $('[data-sim-note]', box);
    const cards = $('[data-working]', box);
    let sim = null, state = 'ready', runT = 0, last = '';

    const read = () => equilibrium(sel.value, Number(ins.mm.value), Number(ins.tmi.value), Number(ins.mw.value), Number(ins.twi.value));
    const sign = (x) => (x >= 0 ? '+' : '−');

    /* ---- the numbers, shown only after a run ---- */
    function showResult(r) {
      sim.setReadout('tf', r.tf.toFixed(2) + ' °C');
      sim.setReadout('dm', sign(r.dtMetal) + Math.abs(r.dtMetal).toFixed(1) + ' °C');
      sim.setReadout('dw', sign(r.dtWater) + Math.abs(r.dtWater).toFixed(1) + ' °C');
      sim.setReadout('q', (r.qWater / 1000).toFixed(2) + ' kJ');
      const q = Math.round(r.qWater).toLocaleString('en-US');
      cards.textContent = '';
      const add = (html) => { const p = document.createElement('p'); p.innerHTML = html; cards.appendChild(p); };
      add('<b>1. Conservation.</b> <em>q</em><sub>metal</sub> = &minus;<em>q</em><sub>water</sub>, so <em>T</em><sub>f</sub> = [(<em>m</em><sub>w</sub><em>c</em><sub>w</sub><em>T</em><sub>w,i</sub>) + (<em>m</em><sub>m</sub><em>c</em><sub>m</sub><em>T</em><sub>m,i</sub>)] / [(<em>m</em><sub>w</sub><em>c</em><sub>w</sub>) + (<em>m</em><sub>m</sub><em>c</em><sub>m</sub>)].');
      add('<b>2. Substitute.</b> <em>T</em><sub>f</sub> = [' + (r.capWater * r.twi).toFixed(1) + ' + ' + (r.capMetal * r.tmi).toFixed(1) + '] / [' + r.capWater.toFixed(1) + ' + ' + r.capMetal.toFixed(1) + '] = <b>' + r.tf.toFixed(2) + ' &deg;C</b>');
      add('<b>3. Heat.</b> <em>q</em><sub>water</sub> = +' + q + ' J and <em>q</em><sub>metal</sub> = &minus;' + q + ' J. The two add to zero.');
      results.hidden = false;
    }
    function clearResult() {
      ['tf', 'dm', 'dw', 'q'].forEach((id) => sim.setReadout(id, '–'));
      results.hidden = true;
    }
    function report() {
      const r = read();
      sim.setReadout('now', (state === 'ready' ? r.twi : currentWaterT(r)).toFixed(1) + ' °C');
      if (!sim.committed) sim.setStatus('neutral', 'Predict to start');
      else if (state === 'ready') sim.setStatus('neutral', 'Ready to drop the metal');
      else if (state === 'running') sim.setStatus('warn', 'Energy moving');
      else sim.setStatus('ok', 'Equilibrium reached');
      sim.setLabel('A coffee-cup calorimeter holding ' + r.mw + ' grams of water at ' + r.twi + ' degrees C, and an LOL energy diagram. ' +
        (state === 'done' ? 'The ' + r.metal.name.toLowerCase() + ' and the water reached ' + r.tf.toFixed(1) + ' degrees C.' : 'The ' + r.mm + ' gram ' + r.metal.name.toLowerCase() + ' sample at ' + r.tmi + ' degrees C has not been dropped in yet.'));
    }
    function currentWaterT(r) {
      if (state === 'done') return r.tf;
      const p = Math.max(0, Math.min(1, (runT - 0.5) / (TOTAL_S - 0.5)));
      return r.twi + (r.tf - r.twi) * (1 - Math.pow(1 - p, 2));
    }
    function setState(next) {
      state = next;
      runBtn.disabled = next === 'running';
      if (next === 'ready') { runT = 0; clearResult(); note.textContent = 'Press Drop metal and stir to run the experiment.'; }
      report();
      sim.redraw();
    }
    function onChange() { setState('ready'); }

    /* ---- drawing: built as svg text, in design units, and only rewritten when it changes ---- */
    function stack(x, n, fill) {
      let out = '';
      for (let i = 0; i < n; i++) out += '<rect x="' + x + '" y="' + (126 - (i + 1) * 14) + '" width="22" height="12" rx="2" fill="' + fill + '" stroke="var(--ink)" stroke-width="0.75"/>';
      return out;
    }
    function tally(x, n, fill, fs) {
      return '<text x="' + (x + 11) + '" y="' + (126 - n * 14 - 5) + '" font-size="' + fs + '" font-weight="700" font-family="var(--mono)" fill="' + fill + '" text-anchor="middle">' + n + '</text>';
    }
    function vessel(r, fs) {
      const p = Math.max(0, Math.min(1, runT / DROP_S));
      const ease = 1 - Math.pow(1 - p, 3);
      const y = state === 'ready' ? -20 : state === 'done' ? 135 : -20 + 155 * ease;
      const T = state === 'ready' ? r.twi : currentWaterT(r);
      const h = Math.min(140, 45 + (T / 100) * 80);
      return '<g>' +
        '<path d="M50 40 L65 190 Q150 205 235 190 L250 40 Z" fill="var(--card)" stroke="var(--ink)" stroke-width="1.8"/>' +
        '<path d="M68 90 L75 185 Q150 198 225 185 L232 90 Z" fill="var(--cool)" fill-opacity="0.25"/>' +
        '<line x1="68" y1="90" x2="232" y2="90" stroke="var(--cool)" stroke-width="2"/>' +
        '<g transform="translate(125,' + y.toFixed(1) + ')"><rect x="0" y="0" width="50" height="40" rx="3" fill="var(--accent)" stroke="var(--ink)" stroke-width="1.5"/>' +
        '<text x="25" y="25" font-size="' + fs + '" font-weight="700" fill="var(--paper)" text-anchor="middle">' + r.metal.symbol + '</text></g>' +
        '<rect x="95" y="10" width="8" height="150" rx="4" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.2"/>' +
        '<rect x="97" y="' + (160 - h).toFixed(1) + '" width="4" height="' + h.toFixed(1) + '" rx="2" fill="var(--accent)"/>' +
        '<circle cx="99" cy="158" r="6" fill="var(--accent)"/>' +
        '</g>';
    }
    function lol(r, fs) {
      const b = blocks(r);
      const done = state === 'done';
      const panel = (x, title) => '<rect x="' + x + '" y="12" width="105" height="142" rx="4" fill="var(--card)" stroke="var(--hair)" stroke-width="1"/>' +
        '<text x="' + (x + 52) + '" y="' + (12 + 5 + fs) + '" font-size="' + fs + '" font-weight="700" fill="var(--ink)" text-anchor="middle">' + title + '</text>' +
        '<line x1="' + (x + 12) + '" y1="128" x2="' + (x + 93) + '" y2="128" stroke="var(--ink)" stroke-width="1"/>';
      const names = (x) => '<text x="' + (x + 24) + '" y="' + (128 + 4 + fs) + '" font-size="' + fs + '" fill="var(--ink-soft)" text-anchor="middle">Metal</text>' +
        '<text x="' + (x + 76) + '" y="' + (128 + 4 + fs) + '" font-size="' + fs + '" fill="var(--ink-soft)" text-anchor="middle">Water</text>';
      let out = panel(5, 'Initial') + stack(24, b.initMetal, 'var(--accent)') + tally(24, b.initMetal, 'var(--accent)', fs) + stack(64, b.initWater, 'var(--ink-soft)') + tally(64, b.initWater, 'var(--ink-soft)', fs) + names(5);
      out += '<circle cx="170" cy="80" r="44" fill="var(--card)" stroke="var(--ink)" stroke-width="1.5"/>' +
        '<text x="170" y="62" font-size="' + fs + '" font-weight="700" fill="var(--ink)" text-anchor="middle">System</text>';
      out += panel(230, 'Final');
      if (done) {
        out += '<line x1="146" y1="84" x2="194" y2="84" stroke="var(--accent)" stroke-width="2" marker-end="url(#lol-dyn-arrow)"/>' +
          '<text x="170" y="78" font-size="' + fs + '" font-weight="700" font-family="var(--mono)" fill="var(--accent)" text-anchor="middle">q = ' + b.transfer + '</text>' +
          '<text x="170" y="106" font-size="' + fs + '" font-weight="700" fill="var(--good)" text-anchor="middle">&#916;E = 0</text>' +
          stack(249, b.finalMetal, 'var(--accent)') + tally(249, b.finalMetal, 'var(--accent)', fs) + stack(289, b.finalWater, 'var(--ink-soft)') + tally(289, b.finalWater, 'var(--ink-soft)', fs) + names(230) +
          '<text x="170" y="' + (LH - 8) + '" font-size="' + fs + '" font-weight="700" font-family="var(--mono)" fill="var(--good)" text-anchor="middle">Initial ' + b.total + ' = Final ' + b.total + '</text>';
      } else {
        out += '<text x="282" y="82" font-size="' + fs + '" fill="var(--ink-mute)" text-anchor="middle">drop the metal</text>';
      }
      return out;
    }
    function draw(svg, env) {
      const wide = env.w / env.h > 1.6;
      const dw = wide ? VW + 20 + LW : LW, dh = wide ? VH : VH + 16 + LH;
      const k = Math.min(env.w / dw, env.h / dh);
      const fs = Math.max(12, 12 / k).toFixed(2);
      const r = read();
      const ox = (env.w - dw * k) / 2, oy = (env.h - dh * k) / 2;
      const lolAt = wide ? 'translate(' + (VW + 20) + ',0)' : 'translate(0,' + (VH + 16) + ')';
      const html = '<defs><marker id="lol-dyn-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--accent)"/></marker></defs>' +
        '<g font-family="var(--display)" transform="translate(' + ox.toFixed(1) + ',' + oy.toFixed(1) + ') scale(' + k.toFixed(4) + ')">' + vessel(r, fs) + '<g transform="' + lolAt + '">' + lol(r, fs) + '</g></g>';
      if (html !== last) { svg.innerHTML = html; last = html; }
    }

    sim = window.TB.sim.create(box, {
      kind: 'svg',
      loop: true,
      stepSeconds: 1.3,       // two presses run the 2.4 s experiment
      init() { clearResult(); report(); },
      onUnlock() { report(); },
      update(dt) {
        if (state !== 'running') return;
        runT += dt;
        sim.setReadout('now', currentWaterT(read()).toFixed(1) + ' °C');
        if (runT >= TOTAL_S) {
          runT = TOTAL_S;
          state = 'done';
          runBtn.disabled = false;
          const r = read();
          showResult(r);
          note.textContent = 'The metal cooled by ' + Math.abs(r.dtMetal).toFixed(1) + ' °C and the water warmed by ' + r.dtWater.toFixed(1) + ' °C. The energy the metal lost is the energy the water gained.';
          report();
        }
      },
      draw: draw,
      preset(name) {
        const p = PRESETS[name];
        if (!p) return;
        sel.value = p.metal;
        Object.keys(ins).forEach((k) => { ins[k].value = String(p[k]); ins[k].dispatchEvent(new Event('input')); });
        onChange();
      },
      record() {
        const r = read();
        return {
          'Metal': r.metal.name, 'Metal mass (g)': r.mm, 'Metal start (°C)': r.tmi, 'Water mass (g)': r.mw, 'Water start (°C)': r.twi,
          'Final (°C)': state === 'done' ? r.tf.toFixed(1) : 'run first'
        };
      }
    });

    sel.addEventListener('change', onChange);
    Object.keys(ins).forEach((k) => ins[k].addEventListener('input', onChange));
    runBtn.addEventListener('click', () => {
      if (!sim.committed || state === 'running') return;
      runT = 0; state = 'running'; runBtn.disabled = true;
      note.textContent = 'The metal drops in and the energy starts to move.';
      sim.release();
      report();
    });
    clearResult();
    report();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
