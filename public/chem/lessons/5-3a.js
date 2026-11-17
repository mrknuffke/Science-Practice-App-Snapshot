/* ============================================================
   5-3a LESSON INTERACTIVES
   Two Enrichment tools, each an svg that redraws only on input (TB.sim.create, kind 'svg', loop
   false), locked until its prediction is committed. Neither has a sim brief, so they follow the
   component catalogue. Both sit inside the Enrichment section, because shell-by-shell burning and
   the iron collapse are past the HS-ESS1-3 boundary.

   The shell explorer keeps the old tool's numbers (temperature and burning time for each shell of a
   massive star, the same values as Figure 5.4). The collapse stepper keeps its four stages and their
   numbers. What goes: the clickable circles (a chip row does the same job and works from the
   keyboard), the three mission cards, the "Type II" label, and the electron-degeneracy and
   Chandrasekhar detail in the stage captions. Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);

  /* ---- the data ---- */
  const SHELLS = [
    { key: 'h', name: 'Hydrogen shell', color: 'cool', radius: 100, reaction: '4 ¹H → ⁴He', temp: '40 MK', time: '7 million years', energy: 'Releases energy' },
    { key: 'he', name: 'Helium shell', color: 'good', radius: 82, reaction: '3 ⁴He → ¹²C', temp: '200 MK', time: '500,000 years', energy: 'Releases energy' },
    { key: 'c', name: 'Carbon shell', color: 'warn', radius: 64, reaction: '¹²C + ¹²C → ²⁰Ne + ⁴He', temp: '800 MK', time: '600 years', energy: 'Releases energy' },
    { key: 'o', name: 'Neon and oxygen shell', color: 'accent', radius: 46, reaction: '¹⁶O + ¹⁶O → ²⁸Si + ⁴He', temp: '1.5 GK', time: '6 months', energy: 'Releases energy' },
    { key: 'si', name: 'Silicon shell', color: 'inkSoft', radius: 28, reaction: '²⁸Si + 7 ⁴He → ⁵⁶Ni → ⁵⁶Fe', temp: '3.5 GK', time: 'about 1 day', energy: 'Releases energy' },
    { key: 'fe', name: 'Iron core', color: 'ink', radius: 12, reaction: 'No fusion', temp: '5 GK', time: 'under a second', energy: 'Takes in energy' }
  ];
  const STAGES = [
    { name: 'Iron core', radius: '5,000 km', speed: '0 km/s', time: '0 s', line: 'The core is balanced. Gravity pulls in, and the core pushes out.' },
    { name: 'Collapse', radius: '80 km', speed: '70,000 km/s', time: '0.22 s later', line: 'The outward push vanishes. The core falls inward at 23% of the speed of light.' },
    { name: 'Bounce', radius: '12 km', speed: '30,000 km/s outward', time: '0.26 s later', line: 'The core is squeezed as tightly as a nucleus. It rebounds and sends a shock wave out.' },
    { name: 'Blast', radius: 'a growing cloud', speed: '10,000 km/s outward', time: 'days to months later', line: 'The blast makes elements heavier than iron and throws them into space.' }
  ];
  if (window.GC_MODELS) window.GC_MODELS['5-3a'] = { SHELLS: SHELLS, STAGES: STAGES };

  function frame(svg, env, dw, dh, inner) {
    const k = Math.min(env.w / dw, env.h / dh);
    const fs = Math.max(12, 12 / k).toFixed(2);
    const ox = (env.w - dw * k) / 2, oy = (env.h - dh * k) / 2;
    return { fs: fs, wrap: (body) => '<g font-family="var(--display)" transform="translate(' + ox.toFixed(1) + ',' + oy.toFixed(1) + ') scale(' + k.toFixed(4) + ')">' + body + '</g>', inner: inner };
  }
  const tok = (n) => 'var(--' + n.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) + ')';

  /* ---- the shell explorer ---- */
  function initShells() {
    const box = $('[data-sim="shells"]');
    if (!box || !window.TB) return;
    const chips = [].slice.call(box.querySelectorAll('[data-shell]'));
    const resetBtn = $('#btnShellReset', box);
    const note = $('[data-sim-note]', box);
    let pick = 0, sim = null, last = '';

    function report() {
      const s = SHELLS[pick];
      sim.setReadout('shell', s.name);
      sim.setReadout('reaction', s.reaction);
      sim.setReadout('temp', s.temp);
      sim.setReadout('time', s.time);
      sim.setReadout('energy', s.energy);
      if (!sim.committed) sim.setStatus('neutral', 'Predict to start');
      else sim.setStatus(pick === 5 ? 'alert' : 'ok', pick === 5 ? 'Fusion has stopped' : 'Fusion releases energy');
      chips.forEach((c, i) => c.setAttribute('aria-pressed', String(i === pick)));
      sim.setLabel('Circles inside circles show the burning shells of a massive star. The ' + s.name.toLowerCase() + ' is selected: ' + s.temp + ', ' + s.time + '.');
    }
    function sentence() {
      if (!sim.committed) return 'The explanation appears after you predict.';
      return pick === 5 ? 'Fusing iron takes in energy, so the core can no longer hold the star up.' : 'Each shell fuses the ash of the shell outside it. The hotter the shell, the faster the fuel burns.';
    }
    function refresh() { note.textContent = sentence(); report(); sim.redraw(); }
    function draw(svg, env) {
      const f = frame(svg, env, 320, 230);
      let h = '';
      SHELLS.forEach((s, i) => {
        h += '<circle cx="160" cy="112" r="' + s.radius + '" fill="' + tok(s.color) + '" fill-opacity="' + (i === pick ? 0.55 : 0.16) + '" stroke="' + tok(s.color) + '" stroke-width="' + (i === pick ? 4 : 1.5) + '"/>';
      });
      h += '<text x="160" y="224" font-size="' + f.fs + '" font-weight="700" fill="var(--ink)" text-anchor="middle">' + SHELLS[pick].name.replace(' shell', '') + '</text>';
      h = f.wrap(h);
      if (h !== last) { svg.innerHTML = h; last = h; }
    }

    sim = window.TB.sim.create(box, {
      kind: 'svg',
      loop: false,
      init() { note.textContent = sentence(); report(); },
      onUnlock() { note.textContent = sentence(); report(); },
      draw: draw,
      preset(name) {
        const i = { h: 0, si: 4, fe: 5 }[name];
        if (i === undefined) return;
        pick = i; refresh();
      },
      record() { const s = SHELLS[pick]; return { 'Shell': s.name, 'Temperature': s.temp, 'Time it burns': s.time, 'Energy': s.energy }; }
    });
    chips.forEach((c, i) => c.addEventListener('click', () => { pick = i; refresh(); }));
    resetBtn.addEventListener('click', () => { pick = 0; refresh(); });
    report();
  }

  /* ---- the core collapse stepper ---- */
  function initCollapse() {
    const box = $('[data-sim="collapse"]');
    if (!box || !window.TB) return;
    const chips = [].slice.call(box.querySelectorAll('[data-stage]'));
    const resetBtn = $('#btnCollapseReset', box);
    const note = $('[data-sim-note]', box);
    let pick = 0, sim = null, last = '';

    function report() {
      const s = STAGES[pick];
      sim.setReadout('stage', s.name);
      sim.setReadout('radius', s.radius);
      sim.setReadout('speed', s.speed);
      sim.setReadout('time', s.time);
      if (!sim.committed) sim.setStatus('neutral', 'Predict to start');
      else sim.setStatus(pick === 0 ? 'ok' : 'warn', pick === 0 ? 'Balanced for now' : pick === 1 ? 'Falling inward' : pick === 2 ? 'Shock wave moving out' : 'New elements in space');
      chips.forEach((c, i) => c.setAttribute('aria-pressed', String(i === pick)));
      sim.setLabel('Stage ' + (pick + 1) + ' of the core collapse: ' + s.name.toLowerCase() + '. ' + s.line);
    }
    function sentence() { return sim.committed ? STAGES[pick].line : 'The explanation appears after you predict.'; }
    function refresh() { note.textContent = sentence(); report(); sim.redraw(); }
    const arrow = (x0, y0, x1, y1, col) => {
      const a = Math.atan2(y1 - y0, x1 - x0), hx = x1 - Math.cos(a) * 9, hy = y1 - Math.sin(a) * 9, px = Math.cos(a + Math.PI / 2) * 5, py = Math.sin(a + Math.PI / 2) * 5;
      return '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + hx.toFixed(1) + '" y2="' + hy.toFixed(1) + '" stroke="' + col + '" stroke-width="3"/><polygon points="' + x1 + ',' + y1 + ' ' + (hx + px).toFixed(1) + ',' + (hy + py).toFixed(1) + ' ' + (hx - px).toFixed(1) + ',' + (hy - py).toFixed(1) + '" fill="' + col + '"/>';
    };
    function draw(svg, env) {
      const f = frame(svg, env, 320, 230);
      const cx = 160, cy = 108;
      let h = '';
      if (pick === 0) {
        h += '<circle cx="' + cx + '" cy="' + cy + '" r="95" fill="none" stroke="var(--ink-mute)" stroke-width="1.5" stroke-dasharray="4 4"/>';
        h += '<circle cx="' + cx + '" cy="' + cy + '" r="48" fill="var(--accent)" fill-opacity="0.25" stroke="var(--accent)" stroke-width="3"/>';
        h += '<text x="' + cx + '" y="' + (cy + 4) + '" font-size="' + f.fs + '" font-weight="700" fill="var(--ink)" text-anchor="middle">Iron</text>';
        h += arrow(60, cy, 108, cy, 'var(--ink)') + arrow(260, cy, 212, cy, 'var(--ink)');
        h += arrow(cx, cy - 52, cx, cy - 92, 'var(--cool)') + arrow(cx, cy + 52, cx, cy + 92, 'var(--cool)');
      } else if (pick === 1) {
        h += '<circle cx="' + cx + '" cy="' + cy + '" r="95" fill="none" stroke="var(--ink-mute)" stroke-width="1.5" stroke-dasharray="4 4"/>';
        h += '<circle cx="' + cx + '" cy="' + cy + '" r="22" fill="var(--accent)" stroke="var(--ink)" stroke-width="2"/>';
        h += arrow(40, cy, 118, cy, 'var(--accent)') + arrow(280, cy, 202, cy, 'var(--accent)') + arrow(cx, 6, cx, 70, 'var(--accent)') + arrow(cx, 212, cx, 148, 'var(--accent)');
      } else if (pick === 2) {
        h += '<circle cx="' + cx + '" cy="' + cy + '" r="78" fill="var(--warn)" fill-opacity="0.2" stroke="var(--warn)" stroke-width="3"/>';
        h += '<circle cx="' + cx + '" cy="' + cy + '" r="56" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="5 3"/>';
        h += '<circle cx="' + cx + '" cy="' + cy + '" r="9" fill="var(--cool)" stroke="var(--ink)" stroke-width="2"/>';
        h += arrow(cx + 20, cy, cx + 74, cy, 'var(--warn)') + arrow(cx - 20, cy, cx - 74, cy, 'var(--warn)') + arrow(cx, cy - 20, cx, cy - 74, 'var(--warn)') + arrow(cx, cy + 20, cx, cy + 74, 'var(--warn)');
      } else {
        h += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="140" ry="92" fill="var(--cool)" fill-opacity="0.15" stroke="var(--cool)" stroke-width="2"/>';
        h += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="100" ry="62" fill="var(--warn)" fill-opacity="0.2" stroke="var(--warn)" stroke-width="1.5"/>';
        h += '<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="var(--ink)"/>';
        [['Gold', 100, 70], ['Platinum', 220, 70], ['Uranium', 100, 160], ['Iron', 220, 160]].forEach((t) => { h += '<text x="' + t[1] + '" y="' + t[2] + '" font-size="' + f.fs + '" font-weight="700" fill="var(--ink)" text-anchor="middle">' + t[0] + '</text>'; });
      }
      h = f.wrap(h);
      if (h !== last) { svg.innerHTML = h; last = h; }
    }

    sim = window.TB.sim.create(box, {
      kind: 'svg',
      loop: false,
      init() { note.textContent = sentence(); report(); },
      onUnlock() { note.textContent = sentence(); report(); },
      draw: draw,
      preset(name) {
        const i = { s1: 0, s2: 1, s3: 2 }[name];
        if (i === undefined) return;
        pick = i; refresh();
      },
      record() { const s = STAGES[pick]; return { 'Stage': (pick + 1) + '. ' + s.name, 'Core radius': s.radius, 'Speed': s.speed }; }
    });
    chips.forEach((c, i) => c.addEventListener('click', () => { pick = i; refresh(); }));
    resetBtn.addEventListener('click', () => { pick = 0; refresh(); });
    report();
  }

  document.addEventListener('DOMContentLoaded', function () { initShells(); initCollapse(); });
})();
