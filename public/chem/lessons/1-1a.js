/* ============================================================
   1-1a LESSON INTERACTIVES
   Two interactives unique to this lesson:
     1. Bohr and configuration builder, built on TB.sim.create (RUNTIME_SPEC 4.3).
        Brief: docs/plans/textbook-sim-briefs.md, "Chem keeps" (1-1a).
     2. Configuration self-test (#stConfig)
   Periodic data comes from ../assets/elements.js (window.GC_ELEMENTS); the
   atom is drawn by ../assets/bohr.js (window.GC_BOHR).
   Zero em-dashes.
   ============================================================ */

/* ---------- BOHR + CONFIGURATION BUILDER ---------- */
(function () {
  'use strict';

  const EL = window.GC_ELEMENTS;
  const BOHR = window.GC_BOHR;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [].slice.call((r || document).querySelectorAll(s));

  /* the model: one element at a time, and how far the electrons have turned */
  const ROTATE = 0.5;                 // rad/s for the innermost shell; outer shells turn slower
  const FIRST = 9;                    // fluorine, the lesson's hook (not the prediction's answer)
  const state = { z: FIRST, rot: 0 };
  if (window.GC_MODELS) window.GC_MODELS['1-1a'] = { state: state };

  const joinShells = (e) => e.shells.join(', ');

  // One sentence about the element on screen. Transition metals are Enrichment.
  function describe(e) {
    const t = EL.tendency(e);
    if (e.z === 1) return 'Hydrogen has a single electron in one shell. That first shell is full at 2, not 8. So hydrogen can lose its electron to form H⁺, or, less often, gain one to fill the shell.';
    if (!e.mainGroup) {
      let s = 'Enrichment: ' + e.name + ' is a transition metal. Shell 4 already holds electrons while shell 3 is still filling toward 18. Its outer-shell count does not give a simple valence.';
      if (e.anomaly) s += ' ' + e.name + ' even moves one electron from shell 4 into shell 3 for a little extra stability.';
      return s;
    }
    if (e.kind === 'noble') return e.name + ' has a full outer shell of ' + e.valence + ' electrons, so it has no reason to lose or gain. That is why it is inert.';
    if (t.dir === 'lose') return e.name + ' has ' + e.valence + ' valence electron' + (e.valence > 1 ? 's' : '') + '. The short path to a full shell is to lose ' + e.valence + ', forming ' + BOHR.ion(e.sym, e.valence, '+') + '. With only a few to give up, it behaves as a metal.';
    if (t.dir === 'gain') return e.name + ' has ' + e.valence + ' valence electrons, ' + t.need + ' short of a full octet. It tends to gain ' + t.need + ', forming ' + BOHR.ion(e.sym, t.need, '-') + '. That makes it a reactive nonmetal.';
    return e.name + ' has 4 valence electrons, equally far from emptying or filling its outer shell. It tends to share electrons rather than fully lose or gain them.';
  }

  function status(e) {
    if (!e.mainGroup) return ['warn', 'Enrichment: transition metal'];
    if (e.kind === 'noble') return ['ok', 'Full outer shell: inert'];
    const t = EL.tendency(e);
    if (t.dir === 'lose') return ['neutral', 'Tends to lose ' + e.valence];
    if (t.dir === 'gain') return ['neutral', 'Tends to gain ' + t.need];
    return ['neutral', 'Tends to share'];
  }

  const valenceText = (e) => (e.mainGroup ? String(e.valence) : 'not a simple count');

  function initBuilder() {
    const box = $('[data-sim="bohr"]');
    if (!box || !EL || !BOHR || !window.TB) return;
    const slider = $('#bohrZ', box);
    const slOut = $('output', slider.closest('label'));
    const note = $('[data-sim-note]', box);
    let sim = null;

    const el = () => EL.byZ[state.z];

    function report() {
      const e = el();
      sim.setReadout('el', e.name);
      sim.setReadout('z', e.z);
      sim.setReadout('shells', e.shells.length);
      sim.setReadout('config', joinShells(e));
      sim.setReadout('val', valenceText(e));
      const s = sim.committed ? status(e) : ['neutral', 'Predict to start'];
      sim.setStatus(s[0], s[1]);
      slOut.textContent = e.z + ' (' + e.sym + ')';
      if (sim.committed) note.textContent = describe(e);
      sim.setLabel('Bohr model of ' + e.name + ': ' + e.z + ' protons in the nucleus and ' + e.shells.join(', ') + ' electrons in the shells' + (e.mainGroup ? ', ' + e.valence + ' of them valence electrons.' : '.'));
    }

    function setZ(z) {
      state.z = z;
      slider.value = String(z);
      $$('[data-preset]', box).forEach((chip) => chip.setAttribute('aria-pressed', 'false'));
      report();
      sim.redraw();
    }

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      stepSeconds: 2,
      init() { report(); },
      onUnlock() { report(); },
      update(dt) { state.rot += dt * ROTATE; },
      draw(ctx, env) {
        const e = el();
        BOHR.draw(ctx, env, {
          cx: env.w / 2, cy: env.h / 2, scale: Math.min(env.w, env.h) / 340,
          shells: e.shells, z: e.z, rot: state.rot, valenceShell: e.mainGroup ? e.shells.length - 1 : -1
        });
      },
      preset(name) {
        const e = EL.bySym[name];
        if (!e) return;
        setZ(e.z);
        $$('[data-preset]', box).forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.preset === name)));
      },
      record() {
        const e = el();
        return { 'Element': e.name, 'Protons (Z)': e.z, 'Shell configuration': joinShells(e), 'Valence electrons': valenceText(e) };
      }
    });

    slider.addEventListener('input', () => setZ(Number(slider.value)));
  }

  document.addEventListener('DOMContentLoaded', initBuilder);
})();

/* ---------- CONFIGURATION SELF-TEST ---------- */
(function () {
  const promptName = document.getElementById('stName');
  if (!promptName || !window.GC_ELEMENTS) return;
  const EL = window.GC_ELEMENTS;
  const POOL = EL.list.filter(e => e.mainGroup);   // valence is well-defined here

  const elName = promptName;
  const elMeta = document.getElementById('stMeta');
  const inCfg = document.getElementById('stConfig');
  const inVal = document.getElementById('stValence');
  const fb = document.getElementById('stFeedback');
  const btnReveal = document.getElementById('stReveal');
  let cur = EL.bySym['S'];                          // matches the static placeholder

  const nums = s => (String(s).match(/\d+/g) || []).map(Number);
  const eqArr = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

  function load(e) {
    cur = e;
    elName.textContent = e.name;
    elMeta.textContent = e.sym + ' · Z = ' + e.z;
    inCfg.value = ''; inVal.value = '';
    inCfg.className = ''; inVal.className = '';
    fb.textContent = ''; fb.className = 'feedback';
    if (btnReveal) {
      btnReveal.disabled = true;
      btnReveal.title = 'Make an attempt and check your answer first';
    }
  }
  function next() {
    let e; do { e = POOL[Math.floor(Math.random() * POOL.length)]; } while (e.sym === cur.sym);
    load(e);
  }
  function check() {
    const cfgOk = eqArr(nums(inCfg.value), cur.shells);
    const valOk = nums(inVal.value).length === 1 && nums(inVal.value)[0] === cur.valence;
    inCfg.className = inCfg.value.trim() ? (cfgOk ? 'correct' : 'wrong') : '';
    inVal.className = inVal.value.trim() ? (valOk ? 'correct' : 'wrong') : '';
    if (btnReveal) {
      btnReveal.disabled = false;
      btnReveal.title = '';
    }
    if (cfgOk && valOk) { fb.textContent = 'Both are right. Try another.'; fb.className = 'feedback good'; }
    else if (cfgOk && !valOk) { fb.textContent = 'The configuration is right. Recount the outer shell for the valence electrons.'; fb.className = 'feedback accent'; }
    else if (!cfgOk && valOk) { fb.textContent = 'The valence count is right. Recheck the shell counts.'; fb.className = 'feedback accent'; }
    else { fb.textContent = 'Not yet. Fill from the inside out (2, then 8) and recount.'; fb.className = 'feedback accent'; }
  }
  function reveal() {
    inCfg.value = EL.config(cur); inVal.value = cur.valence;
    inCfg.className = 'shown'; inVal.className = 'shown';
    fb.textContent = 'Answer shown. Try the next one from memory.'; fb.className = 'feedback accent';
  }

  document.getElementById('stCheck').addEventListener('click', check);
  if (btnReveal) btnReveal.addEventListener('click', reveal);
  document.getElementById('stNext').addEventListener('click', next);
  [inCfg, inVal].forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') check(); }));

  load(cur);
})();
