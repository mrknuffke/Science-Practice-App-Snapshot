/* ============================================================
   SHARED TEXTBOOK RUNTIME: core.js
   Loaded by every page of every book. Safe where an element is absent.
   Spec: docs/textbook/RUNTIME_SPEC.md. Look: docs/textbook/STYLE_STANDARD.md.

   Holds: theme, top bar, contents menu, footer navigation, lightbox,
   glossary tooltips, Enrichment, recall blanks, gated scoring guide, section
   stepping, print hook, storage, progress hook.

   Load order (RUNTIME_SPEC 2.3): assets/book.js, core.js, widgets.js, sim.js,
   assets/glossary.js. The book's config (window.TB_BOOK) is therefore ready
   before this file runs, and the glossary is read lazily.

   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const TB = (window.TB = window.TB || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;

  TB.book = window.TB_BOOK || {};

  /* ---------- storage that survives a sandboxed or private window ---------- */
  TB.storage = (function () {
    let kind = null;
    const memory = {};
    const works = (type) => {
      try {
        const s = window[type];
        s.setItem('__tb_test__', '1');
        s.removeItem('__tb_test__');
        return true;
      } catch (e) {
        return false;
      }
    };
    if (works('localStorage')) kind = 'localStorage';
    else if (works('sessionStorage')) kind = 'sessionStorage';

    return {
      get(key) {
        if (kind) {
          try { return window[kind].getItem(key); } catch (e) { return null; }
        }
        return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null;
      },
      set(key, value) {
        if (kind) {
          try { window[kind].setItem(key, String(value)); return; } catch (e) { /* fall through */ }
        }
        memory[key] = String(value);
      },
      remove(key) {
        if (kind) {
          try { window[kind].removeItem(key); } catch (e) { /* ignore */ }
        }
        delete memory[key];
      }
    };
  })();

  /* ---------- progress hook ----------
     Widgets call TB.progress.mark(type, index, value). Nothing is stored unless
     the book sets progress: true in TB_BOOK and supplies a handler: an object
     { mark, isDone, value }, set as TB.progressHandler in assets/book.js (which
     loads before this file) or passed to TB.progress.register(). */
  TB.progress = (function () {
    const handler = () => (TB.book.progress && TB.progressHandler) || null;
    return {
      register(h) { TB.progressHandler = h; },
      mark(type, index, value) {
        const h = handler();
        if (h && h.mark) h.mark(type, index, value === undefined ? true : value);
      },
      isDone(type, index) {
        const h = handler();
        return !!(h && h.isDone && h.isDone(type, index));
      },
      value(type, index) {
        const h = handler();
        return h && h.value ? h.value(type, index) : null;
      }
    };
  })();

  /* ---------- where the book lives, and its manifest ---------- */
  function bookRoot() {
    const script = $('script[src*="assets/book.js"]');
    if (script) return new URL('../', script.src).href;
    const m = location.pathname.match(/^\/([a-z]+)\//);
    return location.origin + (m ? '/' + m[1] + '/' : '/');
  }
  TB.root = bookRoot();

  let lessonPromise = null;
  TB.lessons = function () {
    if (!lessonPromise) {
      lessonPromise = fetch(TB.root + 'lessons.json')
        .then((r) => (r.ok ? r.json() : { lessons: [] }))
        .then((data) => {
          TB._lessonList = data.lessons || [];
          return TB._lessonList;
        })
        .catch(() => {
          TB._lessonList = [];
          return [];
        });
    }
    return lessonPromise;
  };

  /* ---------- theme (one key: sp_dark_mode) ----------
     The toggle also writes gc-theme. Two things outside the books still read it first: the
     main app (App.tsx) and chem's PE practice pages (public/chem/pe/), which are not part of
     this runtime. When they move to sp_dark_mode, delete LEGACY_THEME_KEYS. The per-book
     keys gp_theme and physics_theme are gone: nothing reads them now that every book is here. */
  const LEGACY_THEME_KEYS = ['gc-theme'];
  const themeListeners = [];
  TB.theme = {
    get() { return root.classList.contains('dark') ? 'dark' : 'light'; },
    onChange(fn) { themeListeners.push(fn); },
    set(mode) {
      root.classList.toggle('dark', mode === 'dark');
      TB.storage.set('sp_dark_mode', mode === 'dark' ? 'true' : 'false');
      LEGACY_THEME_KEYS.forEach((key) => TB.storage.set(key, mode === 'dark' ? 'dark' : 'light'));
      themeListeners.forEach((fn) => fn(mode));
    }
  };
  window.addEventListener('storage', (e) => {
    if (e.key === 'sp_dark_mode' && (e.newValue === 'true' || e.newValue === 'false')) {
      const mode = e.newValue === 'true' ? 'dark' : 'light';
      root.classList.toggle('dark', mode === 'dark');
      themeListeners.forEach((fn) => fn(mode));
    }
    if (e.key === 'sp_accessibility_mode') root.classList.toggle('accessibility-mode', e.newValue === 'true');
  });

  /* ---------- the top bar (rendered, never copied into a lesson) ---------- */
  const ICONS = {
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    toc: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    print: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>'
  };
  const svg = (inner, cls) =>
    '<svg ' + (cls ? 'class="' + cls + '" ' : '') + 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';

  function tbButton(tag, attrs, html) {
    const el = document.createElement(tag);
    el.className = 'tb-btn';
    Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
    el.innerHTML = html;
    if (tag === 'button') el.type = 'button';
    return el;
  }

  function renderTopbar() {
    if ($('.topbar')) return;
    const lessonId = root.dataset.lesson || '';
    const sections = $$('section[data-toc]');

    const bar = document.createElement('header');
    bar.className = 'topbar';
    const left = document.createElement('div');
    left.className = 'topbar-left';
    const right = document.createElement('div');
    right.className = 'topbar-right';
    bar.appendChild(left);
    bar.appendChild(right);

    left.appendChild(tbButton('a', { href: TB.book.home || TB.root, 'aria-label': 'Course home', title: 'Course home' },
      svg(ICONS.home) + '<span class="tb-label">Home</span>'));
    const crumb = document.createElement('div');
    crumb.className = 'crumb';
    crumb.textContent = TB.book.title || '';
    left.appendChild(crumb);

    // the book's own tools: { id, label, title, icon, href | onClick, target }
    (TB.book.tools || []).forEach((tool) => {
      // tool.icon is the inside of a 24 by 24 feather-style svg. A tool without one keeps its label on a phone.
      const el = tbButton(tool.href ? 'a' : 'button', { 'aria-label': tool.title || tool.label, title: tool.title || tool.label },
        (tool.icon ? svg(tool.icon) : '') + '<span class="tb-label">' + tool.label + '</span>');
      if (tool.id) el.dataset.tool = tool.id;
      if (tool.href) el.href = tool.href;
      if (tool.href && tool.target) { el.target = tool.target; el.rel = 'noopener noreferrer'; }
      if (tool.onClick) el.addEventListener('click', tool.onClick);
      right.appendChild(el);
    });

    if (sections.length > 1) {
      const toc = tbButton('button', { 'aria-label': 'Contents', 'aria-expanded': 'false', 'aria-controls': 'tbToc' },
        svg(ICONS.toc) + '<span class="tb-label">Contents</span>');
      toc.classList.add('toc-btn');
      right.appendChild(toc);
    }
    if (lessonId) {
      const print = tbButton('button', { 'aria-label': 'Print this lesson', title: 'Print this lesson' },
        svg(ICONS.print) + '<span class="tb-label">Print</span>');
      print.classList.add('print-btn');
      print.addEventListener('click', () => window.print());
      right.appendChild(print);
    }
    const theme = tbButton('button', { 'aria-label': 'Switch between light and dark', title: 'Switch between light and dark' },
      svg('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>', 'moon') +
      svg('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>', 'sun'));
    theme.classList.add('theme-toggle');
    theme.addEventListener('click', () => TB.theme.set(root.classList.contains('dark') ? 'light' : 'dark'));
    right.appendChild(theme);

    document.body.insertBefore(bar, document.body.firstChild);

    // the crumb names the unit and the lesson once the manifest arrives
    if (lessonId) {
      TB.lessons().then((list) => {
        const entry = list.find((l) => l.id === lessonId);
        if (entry) crumb.innerHTML = 'Unit ' + entry.unit + ' &middot; <b>' + (/review/i.test(entry.id) ? 'Review' : 'Lesson ' + entry.id) + '</b>';
      });
    }
  }

  /* ---------- contents menu, built from section[data-toc] ---------- */
  function renderContents() {
    const btn = $('.toc-btn');
    const sections = $$('section[data-toc]');
    if (!btn || sections.length < 2) return;

    const drop = document.createElement('nav');
    drop.className = 'toc-drop';
    drop.id = 'tbToc';
    drop.setAttribute('aria-label', 'Contents');
    document.body.appendChild(drop);

    sections.forEach((sec, i) => {
      if (!sec.id) sec.id = 's-' + (i + 1);
      const a = document.createElement('a');
      a.href = '#' + sec.id;
      const numEl = $('.section-tag .num', sec);
      const num = numEl ? numEl.textContent.trim() : (i === 0 ? '•' : String(i).padStart(2, '0'));
      a.innerHTML = '<span class="tnum"></span><span class="tlabel"></span>';
      $('.tnum', a).textContent = num;
      $('.tlabel', a).textContent = sec.dataset.toc;
      if (sec.hasAttribute('data-enrichment')) {
        const tag = document.createElement('span');
        tag.className = 'tag-enrichment';
        tag.textContent = 'Enrichment';
        a.appendChild(tag);
      }
      a.addEventListener('click', () => close());
      drop.appendChild(a);
    });

    const close = () => {
      drop.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    };
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = drop.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!drop.contains(e.target) && !btn.contains(e.target)) close();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ---------- previous and next lesson ---------- */
  function renderLessonNav() {
    const lessonId = root.dataset.lesson;
    if (!lessonId || $('.lesson-nav')) return;
    TB.lessons().then((list) => {
      const i = list.findIndex((l) => l.id === lessonId);
      if (i === -1) return;
      const prev = i > 0 ? list[i - 1] : null;
      const next = i < list.length - 1 ? list[i + 1] : null;
      const nav = document.createElement('nav');
      nav.className = 'lesson-nav';
      nav.setAttribute('aria-label', 'Lessons');

      const link = (cls, href, meta, title) => {
        const a = document.createElement('a');
        a.className = cls;
        a.href = href;
        a.innerHTML = '<span class="nav-meta"></span><span class="nav-title"></span>';
        $('.nav-meta', a).textContent = meta;
        $('.nav-title', a).textContent = title;
        return a;
      };
      if (prev) nav.appendChild(link('prev-lesson', prev.slug + '.html', 'Previous lesson', prev.id + ' · ' + prev.title));
      if (next) nav.appendChild(link('next-lesson', next.slug + '.html', 'Next lesson', next.id + ' · ' + next.title));
      else nav.appendChild(link('next-lesson', TB.root, 'You finished the book so far', 'Back to all lessons'));
      (document.querySelector('main') || document.body).appendChild(nav);
    });
  }

  /* ---------- hero "Start" button and other [data-next] buttons ---------- */
  $$('[data-next]').forEach((btn) => btn.addEventListener('click', () => {
    const sec = btn.closest('section');
    let nxt = sec ? sec.nextElementSibling : null;
    while (nxt && nxt.tagName !== 'SECTION') nxt = nxt.nextElementSibling;
    if (nxt) nxt.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  /* ---------- expandable blocks (used by the Synopsis panel) ---------- */
  $$('[data-more]').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      if (!body) return;
      const open = body.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      const label = btn.dataset.more || 'details';
      btn.textContent = (open ? 'Hide ' : 'Show ') + label;
    });
  });

  /* ---------- recall blanks (Show answers waits for one check) ---------- */
  const norm = (s) => s.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/[.,]/g, '');
  const firstAnswer = (b) => b.dataset.answer.split('|')[0].replace(/-/g, ' ');

  $$('.recall').forEach((scope, idx) => {
    const blanks = $$('.blank', scope);
    const fb = $('[data-recall-feedback]', scope);
    const check = $('[data-recall-check]', scope);
    const reveal = $('[data-recall-reveal]', scope);
    const reset = $('[data-recall-reset]', scope);
    let checked = false;
    if (reveal) reveal.disabled = true;

    const done = (r) => {
      if (fb) {
        fb.textContent = r + ' of ' + blanks.length + ' correct';
        fb.className = 'feedback' + (r === blanks.length ? ' good' : '');
      }
    };

    if (TB.progress.isDone('recall', idx)) {
      blanks.forEach((b) => {
        b.value = firstAnswer(b);
        b.classList.add('correct');
      });
      done(blanks.length);
      checked = true;
      if (reveal) reveal.disabled = false;
    }

    if (check) check.addEventListener('click', () => {
      // an empty Check is not an attempt, so it does not unlock Show answers
      if (!blanks.some((b) => norm(b.value))) {
        if (fb) { fb.textContent = 'Fill in at least one blank first.'; fb.className = 'feedback'; }
        return;
      }
      let r = 0;
      blanks.forEach((b) => {
        b.classList.remove('correct', 'wrong', 'shown');
        const ans = b.dataset.answer.split('|').map(norm);
        const v = norm(b.value);
        if (!v) return;
        if (ans.includes(v)) { b.classList.add('correct'); r++; } else b.classList.add('wrong');
      });
      done(r);
      checked = true;
      if (reveal) reveal.disabled = false;
      if (r === blanks.length) TB.progress.mark('recall', idx);
    });
    if (reveal) reveal.addEventListener('click', () => {
      if (!checked) return;
      blanks.forEach((b) => {
        b.value = firstAnswer(b);
        b.classList.remove('wrong', 'correct');
        b.classList.add('shown');
      });
      if (fb) { fb.textContent = 'Answers shown. Try from memory next time.'; fb.className = 'feedback'; }
      TB.progress.mark('recall', idx);
    });
    if (reset) reset.addEventListener('click', () => {
      blanks.forEach((b) => { b.value = ''; b.classList.remove('correct', 'wrong', 'shown'); });
      if (fb) { fb.textContent = ''; fb.className = 'feedback'; }
      checked = false;
      if (reveal) reveal.disabled = true;
    });
  });

  /* ---------- written response: the scoring guide waits for an answer ---------- */
  $$('[data-scheme]').forEach((btn, idx) => {
    const frame = btn.closest('.exam-frame');
    const box = frame ? $('.scheme', frame) : btn.nextElementSibling;
    const textarea = frame ? $('textarea', frame) : null;
    const MIN = 15;
    const label = (open) => { btn.textContent = open ? 'Hide scoring guide' : 'Show scoring guide'; };
    const done = TB.progress.isDone('scheme', idx);

    if (textarea && !done) {
      const gate = () => {
        // once the guide is open, the student can always close it again
        const ready = textarea.value.trim().length >= MIN || (box && box.classList.contains('show'));
        btn.disabled = !ready;
        btn.title = ready ? '' : 'Write your answer above to unlock the scoring guide.';
      };
      gate();
      textarea.addEventListener('input', gate);
    }
    if (done && box) {
      box.classList.add('show');
      label(true);
      btn.disabled = false;
    }
    btn.addEventListener('click', () => {
      if (!box || btn.disabled) return;
      const open = box.classList.toggle('show');
      label(open);
      TB.progress.mark('scheme', idx);
    });
  });

  /* ---------- model answer: Compare waits for an attempt ----------
     A button[data-peek] is followed by a .peek-box. The button stays disabled
     until the student has written in the nearest textarea above it. */
  $$('[data-peek]').forEach((btn, idx) => {
    const scope = btn.closest('section') || document;
    const box = $$('.peek-box', scope).find((b) => btn.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    if (!box) return;
    const before = $$('textarea', scope).filter((t) => t.compareDocumentPosition(btn) & Node.DOCUMENT_POSITION_FOLLOWING);
    const textarea = before.length ? before[before.length - 1] : null;
    const MIN = 15;
    const done = TB.progress.isDone('peek', idx);

    if (textarea && !done) {
      const gate = () => {
        // once the model answer is open, the student can always close it again
        const ready = textarea.value.trim().length >= MIN || box.classList.contains('show');
        btn.disabled = !ready;
        btn.title = ready ? '' : 'Write your answer above to unlock the model answer.';
      };
      gate();
      textarea.addEventListener('input', gate);
    }
    if (done) box.classList.add('show');
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      box.classList.toggle('show');
      TB.progress.mark('peek', idx);
    });
  });

  /* ---------- diagram lightbox ---------- */
  (function () {
    const media = $$('.figure .diagram svg, .figure .diagram img, figure svg, figure img, .synopsis-figure svg, .synopsis-figure img')
      .filter((m) => !m.closest('[data-no-lightbox]') && !m.closest('.sim-box') && !m.closest('[data-widget]'));
    if (!media.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Enlarged figure');
    overlay.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close">&times;</button><div class="lightbox-content"></div><div class="lightbox-cap"></div>';
    document.body.appendChild(overlay);
    const content = $('.lightbox-content', overlay);
    const cap = $('.lightbox-cap', overlay);
    let opener = null;

    const close = () => {
      overlay.classList.remove('open');
      content.innerHTML = '';
      cap.textContent = '';
      document.body.style.overflow = '';
      if (opener) opener.focus();
    };
    const open = (el) => {
      opener = el;
      content.innerHTML = '';
      content.appendChild(el.cloneNode(true));
      const parent = el.closest('figure') || el.closest('.diagram') || el.closest('.synopsis-figure');
      const capEl = parent ? $('figcaption', parent) : null;
      cap.textContent = capEl ? capEl.textContent : '';
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      $('.lightbox-close', overlay).focus();
    };

    media.forEach((m) => {
      if (m.tagName.toLowerCase() === 'svg' || m.tagName.toLowerCase() === 'img') {
        m.setAttribute('tabindex', '0');
        m.addEventListener('click', (e) => { e.stopPropagation(); open(m); });
        m.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(m); });
      }
    });
    overlay.addEventListener('click', close);
    content.addEventListener('click', (e) => e.stopPropagation());
    $('.lightbox-close', overlay).addEventListener('click', (e) => { e.stopPropagation(); close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });
  })();

  /* ---------- section stepping: Page Up and Page Down jump one section ----------
     For a clicker at the projector. Arrow keys and Space scroll as normal. */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'PageDown' && e.key !== 'PageUp') return;
    const tag = (e.target.tagName || '').toUpperCase();
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || e.target.isContentEditable) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tops = $$('section').map((s) => window.scrollY + s.getBoundingClientRect().top);
    if (!tops.length) return;
    const y = window.scrollY;
    const down = e.key === 'PageDown';
    let target = down ? tops.find((t) => t > y + 24) : [...tops].reverse().find((t) => t < y - 24);
    if (target == null) target = down ? tops[tops.length - 1] : 0;
    e.preventDefault();
    window.scrollTo({ top: target, behavior: 'smooth' });
  });

  /* ---------- glossary tooltips (reads window.TB_GLOSSARY only) ---------- */
  function initGlossary() {
    const glossary = window.TB_GLOSSARY;
    if (!glossary) return;

    const tip = document.createElement('div');
    tip.id = 'tb-glossary-tooltip';
    tip.className = 'tb-tooltip';
    tip.setAttribute('role', 'tooltip');
    tip.setAttribute('aria-hidden', 'true');
    tip.innerHTML = '<div class="tb-tooltip-term"></div><div class="tb-tooltip-definition"></div><div class="tb-tooltip-example"></div>';
    document.body.appendChild(tip);
    const nameEl = $('.tb-tooltip-term', tip);
    const defEl = $('.tb-tooltip-definition', tip);
    const exEl = $('.tb-tooltip-example', tip);

    let active = null;
    let touch = false;
    let pointer = '';   // 'mouse', 'touch' or 'pen' while a press is under way; '' for the keyboard
    window.addEventListener('touchstart', () => { touch = true; }, { once: true, passive: true });

    const slugOf = (el) =>
      el.dataset.term ||
      el.textContent.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

    function place(termEl) {
      const rect = termEl.getBoundingClientRect();
      const top = window.scrollY || root.scrollTop;
      const left = window.scrollX || root.scrollLeft;
      const w = tip.offsetWidth;
      const h = tip.offsetHeight;
      const vw = root.clientWidth;
      const pad = 12;
      let x = rect.left + rect.width / 2 - w / 2;
      let shift = 0;
      if (x < pad) shift = pad - x;
      else if (x + w > vw - pad) shift = (vw - pad) - (x + w);
      tip.style.left = x + shift + left + 'px';
      tip.style.top = rect.top - h - 10 + top + 'px';
      const arrow = Math.max(12, Math.min(w - 12, w / 2 - shift));
      tip.style.setProperty('--arrow-left', arrow + 'px');
    }
    function show(termEl, entry) {
      nameEl.textContent = entry.term;
      defEl.textContent = entry.definition;
      exEl.textContent = entry.example || '';
      exEl.hidden = !entry.example;
      tip.style.left = '-9999px';
      tip.style.top = '-9999px';
      tip.classList.add('visible');
      tip.setAttribute('aria-hidden', 'false');
      place(termEl);
      active = termEl;
    }
    function hide() {
      if (!active) return;
      tip.classList.remove('visible');
      tip.setAttribute('aria-hidden', 'true');
      active = null;
    }

    $$('strong.term').forEach((termEl) => {
      const entry = glossary[slugOf(termEl)];
      if (!entry) return;
      termEl.setAttribute('tabindex', '0');
      termEl.setAttribute('aria-describedby', 'tb-glossary-tooltip');
      termEl.addEventListener('mouseenter', () => { if (!touch) show(termEl, entry); });
      termEl.addEventListener('mouseleave', () => { if (!touch) hide(); });
      // A tap focuses the term and then clicks it. Focus opens the tooltip only from the
      // keyboard, so the click of the same tap opens it instead of closing it again.
      termEl.addEventListener('pointerdown', (e) => { pointer = e.pointerType || 'mouse'; });
      termEl.addEventListener('focus', () => { if (!pointer) show(termEl, entry); });
      termEl.addEventListener('blur', () => { pointer = ''; hide(); });
      termEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const from = pointer;
        pointer = '';
        // a mouse already opened it on hover, so a click keeps it open; a tap toggles it
        if (from === 'mouse') show(termEl, entry);
        else if (active === termEl) hide();
        else show(termEl, entry);
      });
    });
    document.addEventListener('click', (e) => { if (active && !tip.contains(e.target)) hide(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
    window.addEventListener('resize', () => { if (active) place(active); });
  }

  /* ---------- print: prepare and restore ----------
     Widget rendering and motion captions are hooks that widgets.js (and
     sim.js) register. Each hook receives undo(fn) so restore can run in reverse. */
  TB.print = (function () {
    const hooks = [];
    const undoStack = [];
    let prepared = false;
    const undo = (fn) => undoStack.push(fn);
    const printOnly = (tag, cls) => {
      const el = document.createElement(tag);
      el.className = 'print-only' + (cls ? ' ' + cls : '');
      return el;
    };

    function glossaryAppendix() {
      const glossary = window.TB_GLOSSARY;
      if (!glossary) return null;
      const slugOf = (el) =>
        el.dataset.term || el.textContent.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
      const seen = new Map();
      $$('strong.term').forEach((el) => {
        const entry = glossary[slugOf(el)];
        if (entry && !seen.has(entry.term)) seen.set(entry.term, entry);
      });
      if (!seen.size) return null;
      const section = printOnly('section', 'print-glossary');
      const h2 = document.createElement('h2');
      h2.textContent = 'Key terms in this lesson';
      section.appendChild(h2);
      const dl = document.createElement('dl');
      [...seen.values()].sort((a, b) => a.term.localeCompare(b.term)).forEach((entry) => {
        const dt = document.createElement('dt');
        dt.textContent = entry.term;
        const dd = document.createElement('dd');
        dd.textContent = entry.definition;
        if (entry.example) {
          const em = document.createElement('em');
          em.textContent = entry.example;
          dd.appendChild(em);
        }
        dl.appendChild(dt);
        dl.appendChild(dd);
      });
      section.appendChild(dl);
      return section;
    }

    function prepare() {
      if (prepared) return; // beforeprint and matchMedia can both fire
      prepared = true;

      document.body.classList.add('tb-printing');
      undo(() => document.body.classList.remove('tb-printing'));

      // paper is always the light theme; the saved choice is not touched. The theme
      // listeners run so a sim redraws in light colours before its still frame is taken.
      if (root.classList.contains('dark')) {
        root.classList.remove('dark');
        themeListeners.forEach((fn) => fn('light'));
        undo(() => {
          root.classList.add('dark');
          themeListeners.forEach((fn) => fn('dark'));
        });
      }

      const header = printOnly('div', 'print-header');
      const entry = (TB._lessonList || []).find((l) => l.id === root.dataset.lesson);
      header.textContent = entry ? entry.id + ' · ' + entry.title : document.title;
      document.body.insertBefore(header, document.body.firstChild);
      undo(() => header.remove());

      // fill empty recall blanks; leave what the student typed
      $$('.recall .blank').forEach((b) => {
        if (b.value) return;
        b.value = firstAnswer(b);
        b.classList.add('shown');
        undo(() => { b.value = ''; b.classList.remove('shown'); });
      });

      // Enrichment prints open, with its tag
      $$('details.enrichment').forEach((d) => {
        if (d.open) return;
        d.open = true;
        undo(() => { d.open = false; });
      });

      hooks.forEach((fn) => fn(undo));

      const appendix = glossaryAppendix();
      if (appendix) {
        document.body.appendChild(appendix);
        undo(() => appendix.remove());
      }
    }
    function restore() {
      if (!prepared) return;
      prepared = false;
      while (undoStack.length) undoStack.pop()();
    }

    window.addEventListener('beforeprint', prepare);
    window.addEventListener('afterprint', restore);
    if (window.matchMedia) {
      const mq = window.matchMedia('print');
      const onChange = (m) => { if (m.matches) prepare(); else restore(); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }

    return { hook(fn) { hooks.push(fn); }, prepare: prepare, restore: restore };
  })();

  /* ---------- boot ---------- */
  renderTopbar();
  renderContents();
  renderLessonNav();
  // assets/glossary.js loads after this file, so tooltips start once the page is parsed.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGlossary);
  else initGlossary();
})();
