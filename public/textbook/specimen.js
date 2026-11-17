/* ============================================================
   SPECIMEN SCRIPT (public/textbook/specimen.html only)
   Sets the page's book config and glossary, switches book tokens and theme,
   and runs the one working sim the specimen carries: a cup of hot water
   cooling in a room, built on TB.sim.create.

   It is the runtime's own test page. No book loads it. Zero em-dashes.
   ============================================================ */

window.TB_BOOK = {
  id: 'specimen',
  title: 'Shared runtime specimen',
  home: 'specimen.html',
  progress: false,
  // one tool with an icon and a link that opens in a new tab, to show both
  tools: [{ id: 'feedback', label: 'Feedback', title: 'Feedback (opens in a new tab)', href: 'specimen.html', target: '_blank',
    icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' }]
};

window.TB_GLOSSARY = {
  'set-point': {
    term: 'Set point',
    definition: 'The value a control system keeps pulling a variable back to, such as 37 degrees Celsius for core body temperature.'
  },
  'negative-feedback': {
    term: 'Negative feedback',
    definition: 'A change triggers a response that undoes the change and returns the variable to its set point.'
  },
  'equilibrium': {
    term: 'Equilibrium',
    definition: 'The state where two opposite changes happen at the same rate, so nothing seems to change.',
    example: 'A cup left in a room ends up at room temperature.'
  }
};

(function () {
  'use strict';
  const BOOKS = ['chem', 'physics', 'bio'];
  const root = document.documentElement;
  const asked = new URLSearchParams(location.search).get('book');
  root.dataset.tokens = BOOKS.indexOf(asked) === -1 ? 'bio' : asked;
  root.dataset.book = root.dataset.tokens;
  // Every book is in the standard's token form, so the specimen loads the real file of the book you pick.
  const TOKEN_FILES = { bio: '../bio/assets/tokens.css', physics: '../physics/assets/tokens.css', chem: '../chem/assets/tokens.css' };
  const tokenFile = (book) => TOKEN_FILES[book] || TOKEN_FILES.bio;
  document.write('<link rel="stylesheet" id="book-tokens" href="' + tokenFile(root.dataset.tokens) + '">');
  // ?theme=light or ?theme=dark shows one theme without saving the choice (the smoke test uses it)
  const askedTheme = new URLSearchParams(location.search).get('theme');
  if (askedTheme === 'light' || askedTheme === 'dark') root.classList.toggle('dark', askedTheme === 'dark');

  /* ---- the switcher: book tokens and theme ---- */
  function markPressed() {
    document.querySelectorAll('[data-book-chip]').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.bookChip === root.dataset.tokens));
    });
    document.querySelectorAll('[data-theme-chip]').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.themeChip === window.TB.theme.get()));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-book-chip]').forEach((chip) => {
      chip.addEventListener('click', () => {
        root.dataset.tokens = chip.dataset.bookChip;
        root.dataset.book = chip.dataset.bookChip;
        history.replaceState(null, '', '?book=' + chip.dataset.bookChip);
        const link = document.getElementById('book-tokens');
        const file = tokenFile(chip.dataset.bookChip);
        if (link.getAttribute('href') !== file) {
          link.onload = () => window.TB.sim.refreshColors();
          link.setAttribute('href', file);
        }
        markPressed();
        window.TB.sim.refreshColors();
      });
    });
    document.querySelectorAll('[data-theme-chip]').forEach((chip) => {
      chip.addEventListener('click', () => window.TB.theme.set(chip.dataset.themeChip));
    });
    window.TB.theme.onChange(markPressed);
    markPressed();
    coolingSim();
  });

  /* ---- the specimen sim: does the cup ever reach room temperature? ---- */
  function coolingSim() {
    const box = document.querySelector('[data-sim="cooling"]');
    if (!box) return;
    const START = 90;          // degrees Celsius
    const K_OPEN = 0.05;       // per minute, no lid
    const K_LID = 0.02;        // per minute, lid on
    const MINUTES = 60;        // length of a run, simulated
    const PACE = 2;            // simulated minutes per real second

    const state = { t: 0, temp: START, room: 20, lid: false, trace: [[0, START]], nextMark: 0.5 };
    const roomInput = box.querySelector('[data-sim-room]');
    const lidChip = box.querySelector('[data-sim-lid]');
    const restartChip = box.querySelector('[data-sim-restart]');
    let sim = null;

    function report() {
      sim.setReadout('time', Math.round(state.t) + ' min');
      sim.setReadout('cup', state.temp.toFixed(1) + ' °C');
      sim.setReadout('room', state.room + ' °C');
      const gap = state.temp - state.room;
      if (state.t >= MINUTES) sim.setStatus(gap < 5 ? 'ok' : 'warn', gap < 5 ? 'Settled near room temperature' : 'Run over, still warmer than the room');
      else sim.setStatus('neutral', 'Cooling');
    }

    function restart() {
      state.t = 0;
      state.temp = START;
      state.trace = [[0, START]];
      state.nextMark = 0.5;
      report();
      sim.redraw();
    }

    roomInput.addEventListener('input', () => { state.room = Number(roomInput.value); restart(); });
    lidChip.addEventListener('click', () => {
      state.lid = !state.lid;
      lidChip.setAttribute('aria-pressed', String(state.lid));
      restart();
    });
    restartChip.addEventListener('click', restart);

    sim = window.TB.sim.create(box, {
      kind: 'canvas',
      loop: true,
      update(dt) {
        if (state.t >= MINUTES) return;
        const minutes = dt * PACE;
        const k = state.lid ? K_LID : K_OPEN;
        state.temp = state.room + (state.temp - state.room) * Math.exp(-k * minutes);
        state.t = Math.min(MINUTES, state.t + minutes);
        if (state.t >= state.nextMark) {
          state.trace.push([state.t, state.temp]);
          state.nextMark += 0.5;
        }
        report();
      },
      draw(ctx, env) {
        const c = env.colors;
        const W = env.w;
        const H = env.h;
        const left = 52, right = 16, top = 30, bottom = 48;
        const pw = W - left - right;
        const ph = H - top - bottom;
        const X = (t) => left + (t / MINUTES) * pw;
        const Y = (v) => top + (1 - v / 100) * ph;

        ctx.lineWidth = 1;
        ctx.strokeStyle = c.hairSoft;
        [0, 25, 50, 75, 100].forEach((v) => {
          ctx.beginPath();
          ctx.moveTo(left, Y(v));
          ctx.lineTo(W - right, Y(v));
          ctx.stroke();
        });
        ctx.strokeStyle = c.inkMute;
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left, H - bottom);
        ctx.lineTo(W - right, H - bottom);
        ctx.stroke();

        ctx.fillStyle = c.inkSoft;
        ctx.font = env.font(12, 'mono');
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        [0, 50, 100].forEach((v) => ctx.fillText(String(v), left - 8, Y(v)));
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('°C', 8, top - 4);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        [0, 20, 40, 60].forEach((t) => ctx.fillText(String(t), X(t), H - bottom + 8));
        ctx.fillText('Time (min)', left + pw / 2, H - 22);

        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = c.cool;
        ctx.beginPath();
        ctx.moveTo(left, Y(state.room));
        ctx.lineTo(W - right, Y(state.room));
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = c.accent;
        ctx.beginPath();
        state.trace.forEach((p, i) => (i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))));
        ctx.lineTo(X(state.t), Y(state.temp));
        ctx.stroke();

        ctx.fillStyle = c.ink;
        ctx.beginPath();
        ctx.arc(X(state.t), Y(state.temp), 5, 0, Math.PI * 2);
        ctx.fill();
      },
      record() {
        return {
          'Time (min)': Math.round(state.t),
          'Room (°C)': state.room,
          'Lid': state.lid ? 'on' : 'off',
          'Cup (°C)': Math.round(state.temp)
        };
      },
      preset(name) {
        if (name === 'warm-lid') {
          state.room = 30;
          roomInput.value = '30';
          roomInput.dispatchEvent(new Event('input'));
          state.lid = true;
          lidChip.setAttribute('aria-pressed', 'true');
          restart();
        }
      }
    });
    report();
  }
})();
