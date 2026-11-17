/* ============================================================
   SHARED TEXTBOOK RUNTIME: sim.js
   The sim helper: TB.sim.create(box, spec). Spec: docs/textbook/RUNTIME_SPEC.md
   section 4.3. The rules it carries out: the Sim Standard, STYLE_STANDARD.md
   section 7.

   The helper owns: the loop, visibility, the prediction gate, Pause and
   reduced motion, sizing, colours, fonts, the Try this stepper, the Record
   table, and the readouts. The lesson script owns the model and the drawing,
   and nothing else.

   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const TB = (window.TB = window.TB || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;

  const STEP = 1 / 60;          // fixed simulated step, in seconds
  const MAX_STEPS = 5;          // at most five steps a frame (item 15)
  const MAX_FRAME = 0.25;       // a stalled tab never catches up by more than this
  const LIVE_MS = 500;          // readouts and status write at most twice a second (item 27)
  const MIN_FONT = 11;          // canvas text is never smaller (item 24)
  const MAX_ROWS = 6;           // the record table (item 5)
  const TOKENS = ['paper', 'paper-2', 'card', 'ink', 'ink-soft', 'ink-mute', 'accent', 'accent-soft', 'good', 'bad', 'warn', 'cool', 'hair', 'hair-soft', 'grid'];

  const camel = (name) => name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  const reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const instances = [];

  function resolveFaces() {
    const cs = getComputedStyle(root);
    return {
      display: cs.getPropertyValue('--display').trim() || 'sans-serif',
      serif: cs.getPropertyValue('--serif').trim() || 'serif',
      mono: cs.getPropertyValue('--mono').trim() || 'monospace'
    };
  }

  // Wait for the book's loaded faces, but never hang if a font host is blocked.
  function fontsReady(faces) {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    const loads = Object.keys(faces).map((k) => document.fonts.load('400 12px ' + faces[k]).catch(() => null));
    const all = Promise.all(loads).then(() => document.fonts.ready);
    return Promise.race([all, new Promise((resolve) => setTimeout(resolve, 1500))]);
  }

  function create(box, spec) {
    if (!box) throw new Error('TB.sim.create: no box');
    spec = spec || {};
    const kind = spec.kind === 'svg' ? 'svg' : 'canvas';
    const loop = spec.loop !== false;

    const stage = $('.sim-stage', box);
    if (!stage) throw new Error('TB.sim.create: the box has no .sim-stage');
    let surface = $(kind === 'svg' ? 'svg' : 'canvas', stage);
    if (!surface && kind === 'canvas') {
      surface = document.createElement('canvas');
      stage.appendChild(surface);
    }
    if (!surface) throw new Error('TB.sim.create: the stage has no ' + kind);
    surface.setAttribute('role', 'img');
    if (!surface.getAttribute('aria-label')) console.warn('TB.sim: the stage needs an aria-label that says what the model shows', box);
    const ctx = kind === 'canvas' ? surface.getContext('2d') : null;

    /* ---- environment handed to the lesson ---- */
    let faces = resolveFaces();
    const env = {
      w: 0, h: 0, dpr: 1, time: 0, colors: {}, ctx: ctx, stage: stage, surface: surface,
      font(size, face, weight) {
        const px = Math.max(MIN_FONT, size || MIN_FONT);
        return (weight || 400) + ' ' + px + 'px ' + (faces[face || 'display'] || faces.display);
      }
    };
    function readColors() {
      const cs = getComputedStyle(root);
      faces = resolveFaces();
      TOKENS.concat(spec.tokens || []).forEach((name) => {
        env.colors[camel(name)] = cs.getPropertyValue('--' + name).trim();
      });
    }
    readColors();

    /* ---- state ---- */
    const gate = $('[data-sim-gate]', box);
    let committed = !gate || gate.dataset.committed === 'true';
    let locked = !committed;
    let paused = loop && reducedMotion();
    let visible = true;
    let tabVisible = !document.hidden;
    let ready = false;
    let raf = 0;
    let last = 0;
    let acc = 0;
    let halt = false;            // set by hold(): no more model steps until the student goes on
    let heldAtMark = false;

    // Everything the student could use or read before predicting (item 2, item 13).
    const lockTargets = () => [stage, ...$$('.sim-controls', box), $('.sim-record-actions', box)].filter(Boolean);

    function setLocked(on) {
      locked = on;
      box.dataset.locked = on ? 'true' : 'false';
      lockTargets().forEach((el) => el.toggleAttribute('inert', on));
      if (!on) Object.keys(latestReadouts).forEach((id) => { pendingReadouts[id] = latestReadouts[id]; });
      if (!on) schedule();
      sync();
    }

    /* ---- sizing: from the stage box and the device pixel ratio (item 20) ---- */
    function measure() {
      const w = Math.max(1, Math.round(stage.clientWidth));
      const h = Math.max(1, Math.round(stage.clientHeight));
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      env.w = w; env.h = h; env.dpr = dpr;
      if (kind === 'canvas') {
        surface.width = Math.round(w * dpr);
        surface.height = Math.round(h * dpr);
      } else {
        surface.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      }
    }

    function draw() {
      if (!ready || !spec.draw) return;
      if (kind === 'canvas') {
        ctx.setTransform(env.dpr, 0, 0, env.dpr, 0, 0);
        ctx.clearRect(0, 0, env.w, env.h);
        spec.draw(ctx, env);
      } else {
        spec.draw(surface, env);
      }
    }

    function advance(seconds) {
      const n = Math.max(1, Math.round(seconds / STEP));
      for (let i = 0; i < n && !halt; i++) {
        env.time += STEP;
        if (spec.update) spec.update(STEP, env);
      }
    }

    /* ---- the loop: real time becomes fixed 1/60 s steps (item 15) ---- */
    function frame(now) {
      raf = requestAnimationFrame(frame);
      let dt = (now - last) / 1000;
      last = now;
      if (dt > MAX_FRAME) dt = MAX_FRAME;
      acc += dt;
      let n = 0;
      while (acc >= STEP && n < MAX_STEPS && !halt) {
        env.time += STEP;
        if (spec.update) spec.update(STEP, env);
        acc -= STEP;
        n++;
      }
      if (n === MAX_STEPS || halt) acc = 0;
      draw();
    }
    function startLoop() {
      last = performance.now();
      acc = 0;
      raf = requestAnimationFrame(frame);
    }
    function stopLoop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    // Run only when the sim is on screen, the tab is visible, nothing is locked or paused (items 16, 19).
    function sync() {
      const should = loop && ready && !locked && !paused && visible && tabVisible;
      if (should && !raf) startLoop();
      else if (!should && raf) stopLoop();
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        visible = entries[entries.length - 1].isIntersecting;
        sync();
      }, { threshold: 0.05 }).observe(box);
    }
    document.addEventListener('visibilitychange', () => { tabVisible = !document.hidden; sync(); });
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => { measure(); draw(); }).observe(stage);
    } else {
      window.addEventListener('resize', () => { measure(); draw(); });
    }

    /* ---- the prediction gate (item 2) ---- */
    if (gate) {
      gate.addEventListener('tb:commit', () => {
        if (committed) return;
        committed = true;
        setLocked(false);
        if (spec.onUnlock) spec.onUnlock(env);
      });
    }

    /* ---- Pause chip (reads Play while paused), and Step chip while paused (item 19) ---- */
    let pauseChip = null;
    let stepChip = null;
    if (loop) {
      let controls = $('.sim-controls', box);
      if (!controls) {
        controls = document.createElement('div');
        controls.className = 'sim-controls';
        stage.insertAdjacentElement('afterend', controls);
      }
      // The label is the action, so the chip carries no aria-pressed (RUNTIME_SPEC 4.3).
      pauseChip = document.createElement('button');
      pauseChip.type = 'button';
      pauseChip.className = 'chip';
      pauseChip.dataset.simPlay = '';
      pauseChip.addEventListener('click', () => (paused ? resume() : pause()));
      controls.appendChild(pauseChip);

      stepChip = document.createElement('button');
      stepChip.type = 'button';
      stepChip.className = 'chip';
      stepChip.textContent = 'Step';
      stepChip.hidden = !paused;
      stepChip.addEventListener('click', () => { halt = false; heldAtMark = false; advance(spec.stepSeconds || 0.25); draw(); });
      controls.appendChild(stepChip);
      showPaused();

      if (window.matchMedia) {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const onChange = (m) => { if (m.matches) pause(); };
        if (mq.addEventListener) mq.addEventListener('change', onChange);
      }
    }
    function showPaused() {
      if (pauseChip) pauseChip.textContent = paused ? 'Play' : 'Pause';
      if (stepChip) stepChip.hidden = !paused;
    }
    function pause() {
      paused = true;
      showPaused();
      sync();
    }
    function resume() {
      paused = false;
      halt = false;
      heldAtMark = false;
      showPaused();
      sync();
    }
    // Stop exactly here, mid-frame: the steps left in this frame are dropped (a data mark).
    function hold() {
      halt = true;
      heldAtMark = true;
      pause();
    }
    // Start over or a new run: clear a hold and run again (still paused under reduced motion).
    function release() {
      halt = false;
      heldAtMark = false;
      if (reducedMotion()) { paused = true; showPaused(); sync(); } else resume();
    }

    /* ---- sliders: the output follows the value, with its unit ---- */
    $$('label.slider-row', box).forEach((row) => {
      const input = $('input[type="range"]', row);
      const out = $('output', row);
      if (!input || !out) return;
      const show = () => {
        const digits = input.dataset.digits !== undefined ? Number(input.dataset.digits) : null;
        const value = digits === null ? input.value : Number(input.value).toFixed(digits);
        out.textContent = value + (input.dataset.unit ? ' ' + input.dataset.unit : '');
      };
      input.addEventListener('input', show);
      show();
    });

    /* ---- Try this: one step at a time (items 3, 4) ---- */
    const tryList = $('ol.try-this', box);
    if (tryList) {
      const steps = $$('li', tryList);
      if (steps.length > 1) {
        let at = 0;
        tryList.classList.add('is-stepper');
        const nav = document.createElement('div');
        nav.className = 'try-nav';
        const prev = document.createElement('button');
        prev.type = 'button';
        prev.className = 'btn ghost';
        prev.textContent = 'Previous step';
        const count = document.createElement('span');
        count.className = 'try-count';
        count.setAttribute('aria-live', 'polite');
        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'btn ghost';
        next.textContent = 'Next step';
        nav.appendChild(prev);
        nav.appendChild(count);
        nav.appendChild(next);
        tryList.insertAdjacentElement('afterend', nav);
        const show = () => {
          steps.forEach((li, i) => li.classList.toggle('is-current', i === at));
          prev.disabled = at === 0;
          next.disabled = at === steps.length - 1;
          count.textContent = 'Step ' + (at + 1) + ' of ' + steps.length;
        };
        prev.addEventListener('click', () => { at = Math.max(0, at - 1); show(); });
        next.addEventListener('click', () => { at = Math.min(steps.length - 1, at + 1); show(); });
        show();
      }
      // "Load this setup" chips
      $$('[data-preset]', tryList).forEach((chip) => {
        chip.addEventListener('click', () => { if (spec.preset) spec.preset(chip.dataset.preset, env); });
      });
    }

    /* ---- Record: up to six rows, for this visit only (item 5) ---- */
    let recordBody = null;
    let recordBtn = null;
    let recordNote = null;
    let columns = [];
    if (spec.record) {
      columns = Object.keys(spec.record());
      const block = document.createElement('div');
      block.className = 'sim-record-block';
      block.innerHTML =
        '<div class="sim-record-actions">' +
        '<button type="button" class="btn ghost" data-sim-record>Record</button>' +
        '<button type="button" class="btn ghost" data-sim-clear>Clear</button>' +
        '</div>' +
        '<p class="hint sim-record-note" aria-live="polite"></p>' +
        '<div class="table-wrap"><table class="data-table sim-record"><caption>Your recorded rows</caption>' +
        '<thead><tr></tr></thead><tbody></tbody></table></div>';
      (tryList ? ($('.try-nav', box) || tryList) : stage.parentNode.lastElementChild).insertAdjacentElement('afterend', block);
      const head = $('thead tr', block);
      ['#'].concat(columns).forEach((name, i) => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = name;
        if (i === 0) th.className = 'num';
        head.appendChild(th);
      });
      recordBody = $('tbody', block);
      recordBtn = $('[data-sim-record]', block);
      recordNote = $('.sim-record-note', block);
      const emptyRow = () => {
        recordBody.innerHTML = '<tr class="empty"><td colspan="' + (columns.length + 1) + '">Nothing recorded yet. Press Record to add a row.</td></tr>';
        recordBtn.disabled = false;
        recordNote.textContent = '';
      };
      emptyRow();
      recordBtn.addEventListener('click', () => {
        const rows = $$('tr:not(.empty)', recordBody);
        if (rows.length >= MAX_ROWS) return;
        const values = spec.record();
        if (!rows.length) recordBody.innerHTML = '';
        const tr = document.createElement('tr');
        const idx = document.createElement('td');
        idx.className = 'num';
        idx.textContent = String(rows.length + 1);
        tr.appendChild(idx);
        columns.forEach((name) => {
          const td = document.createElement('td');
          const v = values[name];
          td.textContent = v === undefined || v === null ? '' : String(v);
          if (typeof v === 'number' || /^-?[\d.,]+(\s?[^\s\d]{0,4})?$/.test(td.textContent)) td.className = 'num';
          tr.appendChild(td);
        });
        recordBody.appendChild(tr);
        if (rows.length + 1 >= MAX_ROWS) {
          recordBtn.disabled = true;
          recordNote.textContent = 'The table is full. Press Clear to record more rows.';
        } else {
          recordNote.textContent = 'Row ' + (rows.length + 1) + ' recorded.';
        }
      });
      $('[data-sim-clear]', block).addEventListener('click', emptyRow);
    }

    /* ---- readouts and status, in live regions, at most twice a second (item 27) ---- */
    const readoutRegion = $('.sim-readouts', box);
    if (readoutRegion) {
      readoutRegion.setAttribute('aria-live', 'polite');
      readoutRegion.setAttribute('aria-atomic', 'false');
    }
    const pill = $('.status-pill', box);
    if (pill) pill.setAttribute('role', 'status');
    const pendingReadouts = {};
    const latestReadouts = {};
    const LOCKED_VALUE = '–';   // an en dash: nothing to read before the prediction (item 13)
    let pendingStatus = null;
    let lastFlush = 0;
    let flushTimer = 0;
    const warned = {};

    function flush() {
      flushTimer = 0;
      lastFlush = performance.now();
      Object.keys(pendingReadouts).forEach((id) => {
        const el = $('.readout[data-readout="' + id + '"] .readout-value', box);
        const text = locked ? LOCKED_VALUE : pendingReadouts[id];
        if (!el) {
          if (!warned[id]) { warned[id] = true; console.warn('TB.sim: no readout with data-readout="' + id + '"'); }
        } else if (el.textContent !== text) {
          el.textContent = text;
        }
        delete pendingReadouts[id];
      });
      if (pendingStatus && pill) {
        pill.dataset.state = pendingStatus.state;
        if (pill.textContent !== pendingStatus.text) pill.textContent = pendingStatus.text;
      }
      pendingStatus = null;
    }
    function schedule() {
      if (flushTimer) return;
      const wait = LIVE_MS - (performance.now() - lastFlush);
      if (wait <= 0) flush();
      else flushTimer = setTimeout(flush, wait);
    }

    /* ---- the public object ---- */
    const sim = {
      env: env,
      get committed() { return committed; },
      get held() { return heldAtMark; },
      setReadout(id, text) { latestReadouts[id] = pendingReadouts[id] = String(text); schedule(); },
      setStatus(state, text) { pendingStatus = { state: state, text: String(text) }; schedule(); },
      setLabel(text) { surface.setAttribute('aria-label', text); },
      redraw() { draw(); },
      pause: pause,
      resume: resume,
      hold: hold,
      release: release,
      refreshColors() { readColors(); draw(); }
    };
    instances.push(sim);

    /* ---- the gate goes on last, once every control and the Record block exist (item 2) ---- */
    if (locked) {
      $$('.readout-value', box).forEach((el) => { el.textContent = LOCKED_VALUE; });
      setLocked(true);
    } else {
      box.dataset.locked = 'false';
    }

    /* ---- start: after the book's fonts load (item 24), draw one still frame ---- */
    measure();
    fontsReady(faces).then(() => {
      readColors();
      measure();
      if (spec.init) spec.init(env);
      ready = true;
      draw();
      sync();
    });

    return sim;
  }

  /* ---- a sim prints its stage as a still frame ---- */
  if (TB.print && TB.print.hook) {
    TB.print.hook(function (undo) {
      $$('.sim-stage canvas').forEach((canvas) => {
        let url = '';
        try { url = canvas.toDataURL('image/png'); } catch (e) { return; }
        const img = document.createElement('img');
        img.className = 'print-only';
        img.alt = canvas.getAttribute('aria-label') || 'Simulation, still frame';
        img.src = url;
        canvas.insertAdjacentElement('afterend', img);
        canvas.hidden = true;
        undo(() => { img.remove(); canvas.hidden = false; });
      });
    });
  }

  TB.sim = {
    create: create,
    instances: instances,
    refreshColors() { instances.forEach((s) => s.refreshColors()); }
  };
  if (TB.theme && TB.theme.onChange) TB.theme.onChange(() => TB.sim.refreshColors());
})();
