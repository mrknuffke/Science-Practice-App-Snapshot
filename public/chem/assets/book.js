/* ============================================================
   GEN CHEM: BOOK SCRIPT
   Replaces the old assets/core.js (docs/textbook/RUNTIME_SPEC.md, sections 2.2
   and 3). The shared runtime in public/textbook/ now holds the theme, top bar,
   contents menu, footer navigation, lightbox, glossary tooltips, recall,
   scoring guide, section stepping, print and the widget framework. This file
   keeps what only chem has:

     - TB_BOOK config and the top-bar tools
     - progress and spaced repetition (the "gc-textbook-progress" record)
     - Quick Check and Cram View (review modes)
     - Synopsis checklist persistence
     - resume bar, practice bridge, Socratic companion
     - the dashboard hooks (window.GC_STORAGE)

   Loaded BEFORE the shared core.js, so the config and the progress handler are
   ready when it starts. Anything that needs the rendered top bar waits for
   DOMContentLoaded. Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const TB = (window.TB = window.TB || {});
  const page = document.documentElement.dataset;
  const lessonId = page.lesson || '';
  // currentLesson is filled in from lessons.json once the shared runtime has fetched it.
  // Progress needs only the id, which the page carries.
  let currentLesson = lessonId ? { id: lessonId, title: '' } : null;

  /* ---- storage engine (sandboxed-safe virtualization) ---- */
  const StorageEngine = (function () {
    let storageType = null;
    let fallbackDict = {};

    function checkStorage(type) {
      try {
        const storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
      } catch (e) {
        return false;
      }
    }

    if (checkStorage('localStorage')) {
      storageType = 'localStorage';
    } else if (checkStorage('sessionStorage')) {
      storageType = 'sessionStorage';
    } else {
      storageType = 'memory';
    }

    const getItem = (key) => {
      if (storageType === 'localStorage') {
        try { return localStorage.getItem(key); } catch (e) { return null; }
      } else if (storageType === 'sessionStorage') {
        try { return sessionStorage.getItem(key); } catch (e) { return null; }
      } else {
        return fallbackDict[key] || null;
      }
    };

    const setItem = (key, value) => {
      if (storageType === 'localStorage') {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          try {
            sessionStorage.setItem(key, value);
          } catch (err) {
            fallbackDict[key] = String(value);
          }
        }
      } else if (storageType === 'sessionStorage') {
        try {
          sessionStorage.setItem(key, value);
        } catch (e) {
          fallbackDict[key] = String(value);
        }
      } else {
        fallbackDict[key] = String(value);
      }
    };

    const removeItem = (key) => {
      if (storageType === 'localStorage') {
        try { localStorage.removeItem(key); } catch (e) {}
      } else if (storageType === 'sessionStorage') {
        try { sessionStorage.removeItem(key); } catch (e) {}
      }
      delete fallbackDict[key];
    };

    const clear = () => {
      if (storageType === 'localStorage') {
        try { localStorage.clear(); } catch (e) {}
      } else if (storageType === 'sessionStorage') {
        try { sessionStorage.clear(); } catch (e) {}
      }
      fallbackDict = {};
    };

    const LESSON_ID_MIGRATIONS = {
      "C-SPA": "2-6a",
      "2-2a": "1-2d",
      "C-RXN": "1-2e",
      "2-7a": "1-7a",
      "2-7b": "1-7b",
      "2-7c": "1-7c",
      "3-14a": "1-4a",
      "4-1a": "1-5a",
      "4-1b": "1-5b",
      "4-6a": "1-6a",
      "4-6b": "1-6b",
      "5-8a": "1-8a",
      "5-4a": "4-4a",
      "5-1a": "E1-1a",
      "5-2a": "E1-2a",
      "5-3a": "E1-3a"
    };

    const getProgress = () => {
      try {
        const raw = JSON.parse(getItem('gc-textbook-progress')) || {};
        let migrated = false;
        Object.keys(LESSON_ID_MIGRATIONS).forEach(oldId => {
          const newId = LESSON_ID_MIGRATIONS[oldId];
          if (raw[oldId] && !raw[newId]) {
            raw[newId] = raw[oldId];
            migrated = true;
          }
        });
        if (migrated) {
          saveProgress(raw);
        }
        return raw;
      } catch (e) {
        return {};
      }
    };

    const saveProgress = (progress) => {
      setItem('gc-textbook-progress', JSON.stringify(progress));
    };

    // A checkpoint is stored either as legacy `true` or as the spaced-repetition
    // metadata object written by markCheckpointCompleted(). Anything that counts
    // completions MUST go through this - comparing against `true` silently misses
    // every modern entry. Keys beginning with `_` are bookkeeping, not checkpoints.
    const isComplete = (val) => val === true || (!!val && typeof val === 'object' && val.completed === true);

    const countCompleted = (lessonProgress) =>
      Object.keys(lessonProgress || {}).filter(k => k[0] !== '_' && isComplete(lessonProgress[k])).length;

    const isCheckpointCompleted = (type, index) => {
      if (!currentLesson) return false;
      const progress = getProgress();
      const lessonProgress = progress[currentLesson.id] || {};
      return isComplete(lessonProgress[`${type}-${index}`]);
    };

    const getCheckpointValue = (type, index) => {
      if (!currentLesson) return null;
      const progress = getProgress();
      const lessonProgress = progress[currentLesson.id] || {};
      return lessonProgress[`${type}-${index}`];
    };

    return {
      getItem,
      setItem,
      removeItem,
      clear,
      getProgress,
      saveProgress,
      isComplete,
      countCompleted,
      isCheckpointCompleted,
      getCheckpointValue
    };
  })();

  // Expose StorageEngine globally
  window.GC_STORAGE = StorageEngine;

  function markCheckpointCompleted(type, index, value = true) {
    if (!currentLesson) return;
    const lessonId = currentLesson.id;
    const progress = StorageEngine.getProgress();
    if (!progress[lessonId]) progress[lessonId] = {};
    
    const key = `${type}-${index}`;
    const existing = progress[lessonId][key];
    const now = Date.now();
    
    let metadata = {
      completed: true,
      box: 1,
      interval: 1,
      nextDue: now + 24 * 60 * 60 * 1000,
      lastAttempt: now,
      attempts: 1
    };

    if (existing && typeof existing === 'object') {
      metadata.box = existing.box || 1;
      metadata.interval = existing.interval || 1;
      metadata.nextDue = existing.nextDue || (now + 24 * 60 * 60 * 1000);
      metadata.lastAttempt = now;
      metadata.attempts = (existing.attempts || 0) + 1;
    } else if (existing === true) {
      metadata.attempts = 2;
    }

    if (value && typeof value === 'object') {
      metadata.score = value.score;
    }

    progress[lessonId][key] = metadata;
    StorageEngine.saveProgress(progress);
  }

  function updateLessonTotalCheckpoints() {
    if (!currentLesson) return;
    const lessonId = currentLesson.id;
    const total = $$('.recall').length +
                  $$('[data-peek]').length +
                  $$('[data-scheme]').length +
                  $$('[data-widget]').length +
                  $$('[data-motion="step"]').length +
                  $$('[data-motion="scrub"]').length +
                  $$('[data-motion="zoom"]').length;
    const progress = StorageEngine.getProgress();
    if (!progress[lessonId]) progress[lessonId] = {};
    progress[lessonId]._total = total;
    StorageEngine.saveProgress(progress);
  }

  /* ---- progress hook: the shared runtime calls this (RUNTIME_SPEC 4.4) ---- */
  TB.progressHandler = {
    mark: (type, index, value) => markCheckpointCompleted(type, index, value),
    isDone: (type, index) => StorageEngine.isCheckpointCompleted(type, index),
    value: (type, index) => StorageEngine.getCheckpointValue(type, index)
  };

  /* ---- one-time progress remap ----
     A data-predict question became a commit-reveal widget, which moved the position
     of every widget after it. Widget keys are "<type>-<position>", so without this a
     lesson with predict questions would show the wrong checks as done.
     PROGRESS_MAP[lessonId] lists [oldKey, newKey] pairs, worked out from the old and
     new page order when the lesson was migrated. It runs once per lesson; the flag
     "_map" in the lesson's record (a "_" key is bookkeeping, never counted) says so. */
  const PROGRESS_MAP = {
    /*MAP:BEGIN*/
    '1-1b': [
      ['predict-0', 'commit-reveal-0'],
      ['predict-1', 'commit-reveal-1']
    ],
    '1-2a': [
      ['predict-0', 'commit-reveal-0'],
      ['predict-1', 'commit-reveal-1'],
      ['predict-2', 'commit-reveal-2']
    ],
    '1-3a': [
      ['predict-0', 'commit-reveal-0'],
      ['predict-1', 'commit-reveal-1']
    ],
    '1-3b': [
      ['diagnose-error-2', 'diagnose-error-4'],
      ['predict-0', 'commit-reveal-2'],
      ['predict-1', 'commit-reveal-3']
    ],
    '1-2d': [
      ['sort-classify-0', 'sort-classify-2'],
      ['predict-0', 'commit-reveal-0'],
      ['predict-1', 'commit-reveal-1']
    ],
    '1-7b': [
      ['predict-0', 'commit-reveal-0'],
      ['predict-1', 'commit-reveal-1']
    ],
    '1-7c': [
      ['predict-0', 'commit-reveal-0'],
      ['predict-1', 'commit-reveal-1']
    ],
    '2-6a': [
      ['predict-0', 'commit-reveal-0'],
      ['predict-1', 'commit-reveal-1']
    ],
    '3-1a': [
      ['predict-0', 'commit-reveal-0']
    ]
    /*MAP:END*/
  };

  /* ---- a second remap, for the Unit 1 rebuild (4c stage 2) ----
     Each rebuilt sim (Unit 1, and in stage 3 the sims of 1-2d, 1-7c and 2-6a; in stage 4 the vessels of 3-1a, whose checkpoint now follows them, and the Enrichment practice item that comes before 1-4a's exam; in stage 5 the free-text self-explain of 4-1b, 4-6a and 4-6b (manifest ids 1-5b, 1-6a, 1-6b), which now follows the sim's prediction and evidence check; in stage 6 the self-explain of 5-1a, 5-2a, 5-3a and 5-4a (manifest ids E1-1a, E1-2a, E1-3a, 4-4a), which was a text widget and is now a model-answer box, and the core exam of 5-2a, 5-3a and 5-4a, which now follows an Enrichment exam) gained a prediction and an evidence check, so the widgets after them moved
     again. The keys below are the position keys as stage 1 left them, and where they sit now.
     It runs after the first remap and once, flagged "_map2". Later stages add their own lessons here. */
  const PROGRESS_MAP_2 = {
    /*MAP2:BEGIN*/
    '1-1a': [
      ['faded-example-0', 'faded-example-2'],
      ['commit-reveal-1', 'commit-reveal-3'],
      ['commit-reveal-2', 'commit-reveal-4'],
      ['commit-reveal-3', 'commit-reveal-5']
    ],
    '1-1b': [
      ['commit-reveal-0', 'commit-reveal-3'],
      ['commit-reveal-1', 'commit-reveal-4']
    ],
    '1-2a': [
      ['commit-reveal-0', 'commit-reveal-2'],
      ['commit-reveal-1', 'commit-reveal-3'],
      ['commit-reveal-2', 'commit-reveal-4']
    ],
    '1-3b': [
      ['commit-reveal-2', 'commit-reveal-4'],
      ['commit-reveal-3', 'commit-reveal-5'],
      ['step-builder-1', 'step-builder-3'],
      ['diagnose-error-4', 'diagnose-error-6']
    ],
    '1-2d': [
      ['commit-reveal-0', 'commit-reveal-2'],
      ['commit-reveal-1', 'commit-reveal-3'],
      ['sort-classify-2', 'sort-classify-4']
    ],
    '1-7c': [
      ['commit-reveal-0', 'commit-reveal-3'],
      ['commit-reveal-1', 'commit-reveal-4']
    ],
    '2-6a': [
      ['commit-reveal-0', 'commit-reveal-2'],
      ['commit-reveal-1', 'commit-reveal-3']
    ],
    '3-1a': [
      ['commit-reveal-0', 'commit-reveal-2']
    ],
    '1-4a': [
      ['scheme-0', 'scheme-1']
    ],
    '1-5b': [
      ['commit-reveal-0', 'commit-reveal-2']
    ],
    '1-6a': [
      ['commit-reveal-0', 'commit-reveal-2']
    ],
    '1-6b': [
      ['commit-reveal-0', 'commit-reveal-2']
    ],
    'E1-1a': [
      ['commit-reveal-0', 'peek-0']
    ],
    'E1-2a': [
      ['commit-reveal-0', 'peek-0'],
      ['scheme-0', 'scheme-1']
    ],
    'E1-3a': [
      ['commit-reveal-0', 'peek-1'],
      ['scheme-0', 'scheme-1']
    ],
    '4-4a': [
      ['commit-reveal-0', 'peek-0'],
      ['scheme-0', 'scheme-1']
    ]
    /*MAP2:END*/
  };

  function remapProgress(map, flag) {
    const pairs = map[lessonId];
    if (!pairs) return;
    const progress = StorageEngine.getProgress();
    const lp = progress[lessonId] || (progress[lessonId] = {});
    if (lp[flag] === 1) return;
    const moved = {};
    pairs.forEach((pair) => { if (pair[0] in lp) moved[pair[1]] = lp[pair[0]]; });
    pairs.forEach((pair) => { delete lp[pair[0]]; });
    Object.assign(lp, moved);
    lp[flag] = 1;
    StorageEngine.saveProgress(progress);
  }
  remapProgress(PROGRESS_MAP, '_map');
  remapProgress(PROGRESS_MAP_2, '_map2');

  /* ---- the book config and the top-bar tools (rendered by the shared core.js) ---- */
  const isTestPage = page.page === 'widget-test';
  const openReferences = () => { if (window.TB_REFERENCE_CENTER) window.TB_REFERENCE_CENTER.open(); };
  // feather-style icons for the top-bar buttons (a button with no icon would be an empty box on a phone)
  const ICONS = {
    'quick-check': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    'cram-view': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    'back': '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    'references': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    'diagram-generator': '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    'colophon': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    'clear-progress': '<path d="M3 2v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/>',
    'feedback': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
  };
  const tools = [];
  if (lessonId || isTestPage) {
    tools.push({ id: 'quick-check', icon: ICONS['quick-check'], label: 'Quick Check', title: 'Toggle Quick Check (Review Mode)', onClick: () => toggleQuickCheck() });
    tools.push({ id: 'cram-view', icon: ICONS['cram-view'], label: 'Cram View', title: 'Toggle Cram View (Exam Questions Only)', onClick: () => toggleCramView() });
  }
  if (page.page === 'about') {
    tools.push({ id: 'back', icon: ICONS['back'], label: 'Back to Textbook', title: 'Back to the textbook', href: 'index.html' });
  } else {
    tools.push({ id: 'references', icon: ICONS['references'], label: 'References', title: 'Open the Reference Center', onClick: openReferences });
    if (page.page === 'index') {
      tools.push({ id: 'diagram-generator', icon: ICONS['diagram-generator'], label: 'Diagram Generator', title: 'Teacher-facing SVG diagram generator, not student work', href: 'diagram-generator/index.html', target: '_blank' });
      tools.push({ id: 'colophon', icon: ICONS['colophon'], label: 'How It Was Built', title: 'How this book was built, and what has changed since', href: 'about.html' });
      tools.push({ id: 'clear-progress', icon: ICONS['clear-progress'], label: 'Clear Progress', title: 'Clear all lesson progress', onClick: () => document.dispatchEvent(new CustomEvent('gc:clear-progress')) });
    }
    tools.push({ id: 'feedback', icon: ICONS['feedback'], label: 'Submit Feedback', title: 'Contact and Feedback (opens in new tab)', href: '/?contact=true', target: '_blank' });
  }

  /* ---- a DOM-only tool in a .sim-box (no canvas, so no TB.sim.create) ----
     GC_GATE_TOOL locks the tool's controls and shows a dash in every readout until the
     box's prediction (the commit-reveal marked data-sim-gate) is committed (Sim Standard 2).
     A tool with no gate unlocks at once. onUnlock runs after the unlock, or at once. */
  window.GC_GATE_TOOL = function (box, locks, onUnlock) {
    const gate = box.querySelector('[data-sim-gate]');
    const values = [].slice.call(box.querySelectorAll('.readout-value'));
    const kept = values.map((el) => el.textContent);
    if (!gate) { box.dataset.locked = 'false'; if (onUnlock) onUnlock(); return; }
    const unlock = () => {
      box.dataset.locked = 'false';
      locks.forEach((el) => el && el.removeAttribute('inert'));
      values.forEach((el, i) => { if (el.textContent === '\u2013') el.textContent = kept[i]; });
      if (onUnlock) onUnlock();
    };
    if (gate.dataset.committed === 'true') { unlock(); return; }
    box.dataset.locked = 'true';
    locks.forEach((el) => el && el.setAttribute('inert', ''));
    values.forEach((el) => { el.textContent = '\u2013'; });
    gate.addEventListener('tb:commit', unlock, { once: true });
  };

  window.TB_BOOK = {
    id: 'chem',
    title: 'SAS General Chemistry',
    briefLabel: 'Phenomenon',
    progress: true,
    tools: tools
  };


  /* ---- synopsis checklist interactivity & persistence ---- */
  $$('.synopsis-checklist').forEach(checklist => {
    const lessonKey = (window.location.pathname.split('/').pop() || 'lesson').replace('.html', '');
    const boxes = $$('input[type="checkbox"]', checklist);
    boxes.forEach((box, i) => {
      box.removeAttribute('disabled');
      const storageKey = 'sp_chk_' + lessonKey + '_' + i;
      try {
        if (localStorage.getItem(storageKey) === '1') {
          box.checked = true;
        }
      } catch (e) {}
      box.addEventListener('change', () => {
        try {
          localStorage.setItem(storageKey, box.checked ? '1' : '0');
        } catch (e) {}
      });
    });
  });


  /* ---- review modes: Quick Check and Cram View ---- */
  let quickCheckOn = false;
  let cramViewOn = false;
  const toolButton = (id) => $('[data-tool="' + id + '"]');
  function setToolOn(id, on) {
    const btn = toolButton(id);
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(on));
    btn.classList.toggle('active', on);
  }

  function toggleQuickCheck() {
    quickCheckOn = !quickCheckOn;
    setToolOn('quick-check', quickCheckOn);
    document.body.classList.toggle('quick-check-active', quickCheckOn);

    // Deactivate Cram View if it is active
    if (quickCheckOn && cramViewOn) toggleCramView();

    const sections = $$('section');
    sections.forEach(sec => {
      if (sec.id === 's-hero') return;

      const hasInteractive = sec.querySelector('[data-widget], .recall, [data-peek], [data-scheme], [data-motion]');
      if (!hasInteractive) {
        sec.classList.toggle('is-folded', quickCheckOn);
      }
    });
  }

  function toggleCramView() {
    cramViewOn = !cramViewOn;
    setToolOn('cram-view', cramViewOn);
    document.body.classList.toggle('cram-view-active', cramViewOn);

    // Deactivate Quick Check if active
    if (cramViewOn && quickCheckOn) toggleQuickCheck();

    const sections = $$('section');
    sections.forEach(sec => {
      if (sec.id === 's-hero') {
        const extra = sec.querySelector('.lede, .meta-strip, .synopsis-wrapper, .hero-actions');
        if (extra) extra.classList.toggle('is-folded', cramViewOn);
        return;
      }

      const hasExam = sec.querySelector('.exam-frame');
      if (!hasExam) {
        sec.classList.toggle('is-folded', cramViewOn);
      } else {
        // Keep the section containing the exam, but hide everything except exam-frame and headings
        const nonExamElements = sec.querySelectorAll('.narrow > *:not(.exam-frame):not(h2):not(.section-tag), :scope > *:not(.narrow):not(.section-tag)');
        nonExamElements.forEach(el => el.classList.toggle('is-folded', cramViewOn));
      }
    });
  }

  /* ---- resume: remember how far a student got, and offer to take them back ----
     Two separate jobs. Tracking watches scrolling and records the furthest
     section[data-toc] reached, so a student who reads without answering anything
     still has a resume point. Offering renders a dismissible bar - we never move
     the page on our own; the student decides. */
  function initResume() {
    if (!currentLesson) return;
    const lessonId = currentLesson.id;
    const secs = $$('section[data-toc]');
    if (secs.length < 2) return;

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const topbar = $('.topbar');
    const topOffset = () => (topbar ? topbar.getBoundingClientRect().height : 52);
    const tocNum = (i) => (i === 0 ? '\u2022' : String(i).padStart(2, '0'));

    const readResume = () => {
      const lp = StorageEngine.getProgress()[lessonId];
      const r = lp && lp._resume;
      return (r && typeof r === 'object' && typeof r.index === 'number') ? r : null;
    };

    const saved = readResume();

    // The furthest section reached, never the most recent one - re-reading the
    // hook must not erase how far a student actually got.
    let furthest = saved ? Math.max(0, saved.index) : 0;
    let pending = false;

    function persist() {
      if (!pending) return;
      pending = false;
      const progress = StorageEngine.getProgress();
      if (!progress[lessonId]) progress[lessonId] = {};
      const sec = secs[furthest];
      progress[lessonId]._resume = {
        index: furthest,
        id: sec.id || '',
        label: sec.dataset.toc || '',
        num: tocNum(furthest),
        lastVisited: Date.now()
      };
      StorageEngine.saveProgress(progress);
    }

    let persistTimer = null;
    function schedulePersist() {
      pending = true;
      clearTimeout(persistTimer);
      persistTimer = setTimeout(persist, 1200);
    }

    function currentIndex() {
      const limit = topOffset() + 8;
      let idx = 0;
      secs.forEach((sec, i) => {
        if (sec.getBoundingClientRect().top <= limit) idx = i;
      });
      return idx;
    }

    /* ---- the offer ---- */
    let bar = null;

    function hideBar() {
      if (!bar) return;
      const el = bar;
      bar = null;
      el.classList.remove('in');
      setTimeout(() => el.remove(), reduceMotion ? 0 : 320);
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const idx = currentIndex();
        if (idx > furthest) {
          furthest = idx;
          schedulePersist();
        }
        // Once they've scrolled back to where they left off under their own
        // steam, the offer is moot.
        if (bar && saved && idx >= saved.index) hideBar();
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', persist);
    document.addEventListener('visibilitychange', () => { if (document.hidden) persist(); });

    // Respect an explicit #anchor, and don't offer a resume point they're
    // already looking at.
    if (!saved || saved.index < 1 || window.location.hash) return;
    const target = (saved.id && document.getElementById(saved.id)) || secs[saved.index];
    if (!target || currentIndex() >= saved.index) return;

    bar = document.createElement('div');
    bar.className = 'resume-bar';
    bar.setAttribute('role', 'status');
    bar.style.top = topOffset() + 'px';
    bar.innerHTML = `
      <span class="resume-bar-text">Pick up where you left off: <b></b></span>
      <span class="resume-bar-actions">
        <button class="resume-bar-btn" type="button" data-resume-go>Resume</button>
        <button class="resume-bar-dismiss" type="button" data-resume-dismiss aria-label="Dismiss resume prompt">&times;</button>
      </span>
    `;
    // Section name via textContent, not innerHTML - it round-trips through
    // localStorage, which is user-writable.
    $('.resume-bar-text b', bar).textContent =
      `${saved.num || tocNum(saved.index)} \u00b7 ${saved.label || 'your last section'}`;
    document.body.appendChild(bar);
    requestAnimationFrame(() => bar && bar.classList.add('in'));

    $('[data-resume-go]', bar).addEventListener('click', () => {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      hideBar();
    });
    $('[data-resume-dismiss]', bar).addEventListener('click', hideBar);
  }

  /* ---- in-lesson practice & simulation bridge ---- */
  function initPracticeBridge() {
    if (!currentLesson) return;
    const footer = $('.footer');
    if (!footer) return;

    // Keyed by the manifest id in lessons.json (services/__tests__/chemBook.test.ts checks every key).
    const LESSON_INTEGRATION_MAP = {
      '1-1a': {
        topic: 'Atomic Structure and Isotopes',
        sims: [
          { simSlug: 'build_an_atom', title: 'Build an Atom', icon: '⚛️' },
          { simSlug: 'periodic_table', title: 'Periodic Table', icon: '📋' }
        ]
      },
      '1-1b': {
        topic: 'The Periodic Table and Trends',
        sims: [
          { simSlug: 'periodic_table', title: 'Periodic Table (Trends)', icon: '📋' }
        ]
      },
      '1-2a': {
        topic: 'Bonding (Ionic, Covalent, Metallic)',
        sims: [
          { simSlug: 'covalent_bonding', title: 'Covalent Bonding', icon: '🔗' },
          { simSlug: 'ionic_bonding', title: 'Ionic Bonding', icon: '⚡' }
        ]
      },
      '1-2b': {
        topic: 'Molecular Geometry',
        sims: [
          { simSlug: 'covalent_bonding', title: 'Covalent Bonding & VSEPR', icon: '🔗' }
        ]
      },
      '1-2c': {
        topic: 'Bonding (Ionic, Covalent, Metallic)',
        sims: [
          { simSlug: 'ionic_bonding', title: 'Ionic Bonding Builder', icon: '⚡' }
        ]
      },
      '1-3a': {
        topic: 'Molecular Geometry',
        sims: [
          { simSlug: 'covalent_bonding', title: 'Covalent Bonding (Lewis)', icon: '🔗' }
        ]
      },
      '1-3b': {
        topic: 'Intermolecular Forces and Bulk Properties',
        sims: [
          { simSlug: 'phase_change', title: 'Particle Phase Change', icon: '🌡️' }
        ]
      },
      '2-6a': {
        topic: 'Intermolecular Forces and Bulk Properties',
        sims: [
          { simSlug: 'phase_change', title: 'Particle Phase Change', icon: '🌡️' }
        ]
      },
      '1-2d': {
        topic: 'Types of Reactions',
        sims: [
          { simSlug: 'phase_change', title: 'Phase Change & Particle Motion', icon: '🌡️' }
        ]
      },
      '1-2e': {
        topic: 'Balancing Chemical Equations',
        sims: [
          { simSlug: 'reaction_kinetics', title: 'Reaction Kinetics', icon: '💥' }
        ]
      },
      '1-7a': {
        topic: 'Stoichiometry and The Mole',
        sims: [
          { simSlug: 'build_an_atom', title: 'Build an Atom (Molar Mass)', icon: '⚛️' }
        ]
      },
      '1-7b': {
        topic: 'Stoichiometry and The Mole',
        sims: []
      },
      '1-7c': {
        topic: 'Stoichiometry and The Mole',
        sims: []
      },
      '3-1a': {
        topic: 'Thermochemistry and Calorimetry',
        sims: [
          { simSlug: 'phase_change', title: 'Particle Phase Change & Heat', icon: '🌡️' },
          { simSlug: 'gas_laws', title: 'Gas Laws & Kinetic Theory', icon: '🎈' }
        ]
      },
      '3-1b': {
        topic: 'Thermochemistry and Calorimetry',
        sims: [
          { simSlug: 'phase_change', title: 'Particle Phase Change (Heating Curve)', icon: '🌡️' }
        ]
      },
      '3-1c': {
        topic: 'Thermochemistry and Calorimetry',
        sims: [
          { simSlug: 'calorimetry', title: 'Thermal & Thermochemistry Studio (Calorimetry)', icon: '☕' },
          { simSlug: 'phase_change', title: 'Thermal Energy Transfer', icon: '🌡️' }
        ]
      },
      '3-4a': {
        topic: 'Conservation of Energy in Reactions',
        sims: [
          { simSlug: 'phase_change', title: 'Thermal Equilibrium', icon: '🌡️' },
          { simSlug: 'gas_laws', title: 'Gas Particles & Entropy', icon: '🎈' }
        ]
      },
      '1-4a': {
        topic: 'Endothermic and Exothermic Reactions',
        sims: [
          { simSlug: 'reaction_kinetics', title: 'Reaction Potential Energy & Kinetics', icon: '💥' }
        ]
      },
      '1-5a': {
        topic: 'Reaction Rates and Equilibrium',
        sims: [
          { simSlug: 'reaction_kinetics', title: 'Reaction Kinetics & Collision Theory', icon: '💥' }
        ]
      },
      '1-5b': {
        topic: 'Reaction Rates and Equilibrium',
        sims: [
          { simSlug: 'reaction_kinetics', title: 'Catalyzed Reaction Kinetics', icon: '⚡' }
        ]
      },
      '1-6a': {
        topic: 'Reaction Rates and Equilibrium',
        sims: [
          { simSlug: 'reaction_kinetics', title: 'Reversible Reaction Equilibrium', icon: '⚖️' },
          { simSlug: 'gas_laws', title: 'Gas Pressure Le Chatelier', icon: '🎈' }
        ]
      },
      '1-6b': {
        topic: 'Acids, Bases, and pH',
        sims: [
          { simSlug: 'blood_buffer', title: 'Arterial Blood Buffers & Homeostasis', icon: '🫁' },
          { simSlug: 'reaction_kinetics', title: 'Dynamic Buffer Kinetics', icon: '💥' }
        ]
      },
      'E1-1a': {
        topic: 'Nuclear Chemistry (Fission/Fusion)',
        sims: [
          { simSlug: 'build_an_atom', title: 'Build an Atom (Nucleons & Isotopes)', icon: '⚛️' }
        ]
      },
      'E1-2a': {
        topic: 'Atomic Structure and Isotopes',
        sims: [
          { simSlug: 'build_an_atom', title: 'Build an Atom (H & He Primordial Nuclei)', icon: '🌌' },
          { simSlug: 'periodic_table', title: 'Periodic Table (Spectra & Redshift)', icon: '🌈' }
        ]
      },
      'E1-3a': {
        topic: 'The Periodic Table and Trends',
        sims: [
          { simSlug: 'periodic_table', title: 'Periodic Table (Origin of Elements)', icon: '📋' },
          { simSlug: 'build_an_atom', title: 'Build an Atom (Nuclear Fusion)', icon: '⚛️' }
        ]
      },
      '1-8a': {
        topic: 'Nuclear Chemistry (Fission/Fusion)',
        sims: [
          { simSlug: 'nuclear_decay', title: 'Nuclear Decay & Radiometric Dating', icon: '⏳' },
          { simSlug: 'build_an_atom', title: 'Build an Atom (Nuclear Stability & Decay)', icon: '⚛️' }
        ]
      },
      '4-4a': {
        topic: 'Electromagnetic Spectrum',
        sims: [
          { simSlug: 'periodic_table', title: 'Periodic Table (Atomic Emission Spectra)', icon: '🌈' }
        ]
      }
    };

    const bridgeData = LESSON_INTEGRATION_MAP[currentLesson.id];
    if (!bridgeData) return;

    const topicEncoded = encodeURIComponent(bridgeData.topic);
    const quizUrl = `/?course=General%20Chemistry&topic=${topicEncoded}&mode=quiz`;
    const flashcardsUrl = `/?course=General%20Chemistry&topic=${topicEncoded}&mode=flashcards`;

    const bridge = document.createElement('aside');
    bridge.className = 'textbook-bridge narrow';
    bridge.setAttribute('aria-label', 'Practice and simulations in Science Practice Partner');

    let simsHtml = '';
    if (bridgeData.sims && bridgeData.sims.length > 0) {
      simsHtml = `
        <div class="bridge-col">
          <h4 class="bridge-col-heading">Interactive Simulations</h4>
          <div class="bridge-btn-group">
            ${bridgeData.sims.map(s => `
              <a class="bridge-btn bridge-btn-sim" href="/?page=${s.simSlug}" target="_blank" rel="noopener noreferrer">
                <span class="bridge-btn-icon" aria-hidden="true">${s.icon}</span>
                <span class="bridge-btn-text">
                  <strong class="bridge-btn-title">${s.title}</strong>
                  <span class="bridge-btn-sub">Open simulation ↗</span>
                </span>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    bridge.innerHTML = `
      <div class="textbook-bridge-header">
        <div class="textbook-bridge-badge">
          <span class="bridge-badge-icon" aria-hidden="true">🚀</span>
          <span>Science Practice Partner</span>
        </div>
        <h3 class="textbook-bridge-title">Practice &amp; Explore Beyond This Lesson</h3>
        <p class="textbook-bridge-desc">Extend your learning with adaptive AI tutor practice and interactive simulations designed to reinforce ${currentLesson.title}.</p>
      </div>
      <div class="textbook-bridge-content ${bridgeData.sims && bridgeData.sims.length > 0 ? 'has-sims' : 'no-sims'}">
        <div class="bridge-col">
          <h4 class="bridge-col-heading">AI Practice Sessions</h4>
          <div class="bridge-btn-group">
            <a class="bridge-btn bridge-btn-primary" href="${quizUrl}" target="_blank" rel="noopener noreferrer">
              <span class="bridge-btn-icon" aria-hidden="true">⚡</span>
              <span class="bridge-btn-text">
                <strong class="bridge-btn-title">Practice Quiz</strong>
                <span class="bridge-btn-sub">Adaptive multiple-choice ↗</span>
              </span>
            </a>
            <a class="bridge-btn bridge-btn-secondary" href="${flashcardsUrl}" target="_blank" rel="noopener noreferrer">
              <span class="bridge-btn-icon" aria-hidden="true">📇</span>
              <span class="bridge-btn-text">
                <strong class="bridge-btn-title">Study Flashcards</strong>
                <span class="bridge-btn-sub">Active recall review ↗</span>
              </span>
            </a>
          </div>
        </div>
        ${simsHtml}
      </div>
    `;

    // above the previous and next links the shared runtime renders, else above the footer
    const nav = $('.lesson-nav');
    const anchor = nav || footer;
    anchor.parentNode.insertBefore(bridge, anchor);
  }

  /* ---- in-lesson socratic companion mascot ---- */
  function initSocraticCompanion() {
    if (!currentLesson) return;

    const oauthSession = localStorage.getItem('oauth_session');
    const isAuthenticated = !!oauthSession;

    const UNIT_TIPS = {
      '1': 'Pay close attention to electronegativity differences and particulate geometry. Remember that polar bonds can cancel out in symmetrical molecules!',
      '2': 'Conservation of matter is absolute: every single atom on the reactant side must appear in the products. Count atoms methodically!',
      '3': 'Thermochemistry golden rule: Heat lost by hot metals equals heat gained by water (q_metal = -q_water). Check your signs and units (J vs kJ)!',
      '4': 'Equilibrium is dynamic: forward and reverse rates are equal, not concentrations! Any perturbation shifts the system to relieve the applied stress.',
      '5': 'Nuclear transmutations strictly balance nucleon number (A) and proton number (Z). Half-life exponential decay is constant and independent of environmental conditions!'
    };
    const unitPrefix = currentLesson.id ? currentLesson.id.split('-')[0] : '1';
    const studyTip = UNIT_TIPS[unitPrefix] || 'Connect macroscopic observations back to sub-microscopic particulate motion and interactions!';

    const widget = document.createElement('div');
    widget.className = 'chem-socratic-widget';
    widget.setAttribute('aria-label', 'Socratic Chemistry Study Partner');

    widget.innerHTML = `
      <button class="chem-mascot-btn ${!isAuthenticated ? 'chem-mascot-btn--locked' : ''}" type="button" aria-expanded="false" title="${!isAuthenticated ? 'Sign in with school account to unlock AI Tutor' : 'Need a hint? Ask Study Partner'}" aria-label="${!isAuthenticated ? 'Sign in required to use Chemistry Study Partner' : 'Open Socratic Chemistry Study Partner'}">
        <div class="chem-mascot-avatar" aria-hidden="true">
          <svg viewBox="0 0 100 100" class="chem-mascot-svg">
            <defs>
              <linearGradient id="beakerFluidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#38bdf8"/>
                <stop offset="100%" stop-color="#0284c7"/>
              </linearGradient>
            </defs>
            <path d="M34,22 L66,22 M40,22 L40,36 L24,76 C22,81 26,86 32,86 L68,86 C74,86 78,81 76,76 L60,36 L60,22" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M28,75 L72,75 L67,61 C63,63 56,59 50,61 C44,63 37,59 33,61 Z" fill="url(#beakerFluidGrad)" opacity="0.85"/>
            <circle cx="44" cy="48" r="3.5" fill="currentColor"/>
            <circle cx="56" cy="48" r="3.5" fill="currentColor"/>
            <path d="M45,56 Q50,61 55,56" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="48" cy="71" r="2" fill="#ffffff" opacity="0.8"/>
            <circle cx="54" cy="66" r="1.8" fill="#ffffff" opacity="0.8"/>
          </svg>
          ${!isAuthenticated ? '<span class="chem-mascot-lock-badge" aria-hidden="true">🔒</span>' : ''}
        </div>
        <span class="chem-mascot-pill">Tutor${!isAuthenticated ? ' <span class="chem-mascot-pill-tag">Sign In</span>' : ''}</span>
      </button>

      <div class="chem-socratic-drawer" role="dialog" aria-modal="false" aria-label="Socratic Chemistry Study Partner">
        <div class="chem-socratic-head">
          <div class="chem-socratic-title-group">
            <span class="chem-socratic-badge-icon" aria-hidden="true">🧪</span>
            <div>
              <h4 class="chem-socratic-title">Chemistry Study Partner</h4>
              <span class="chem-socratic-subtitle">${currentLesson.title}</span>
            </div>
          </div>
          <button class="chem-socratic-close-btn" type="button" aria-label="Close Study Partner panel">&times;</button>
        </div>

        <div class="chem-socratic-body">
          ${!isAuthenticated ? `
            <div class="chem-socratic-tip-card">
              <div class="chem-socratic-tip-badge">
                <span aria-hidden="true">💡</span>
                <strong>Lesson Focus Tip</strong>
              </div>
              <p class="chem-socratic-tip-text">${studyTip}</p>
            </div>
            <div class="chem-socratic-lock-card">
              <div class="chem-lock-icon" aria-hidden="true">🔒</div>
              <h5 class="chem-lock-title">Interactive AI Tutor Locked</h5>
              <p class="chem-lock-desc">Sign in with your school Google account in Science Practice Partner to chat with your Study Partner, get hints on checkpoint questions, and check your reasoning.</p>
              <a class="chem-lock-btn" href="/?action=login" target="_blank" rel="noopener noreferrer">
                Sign In with School Account &rarr;
              </a>
              <span class="chem-lock-note">Zero-auth access includes all 27 lessons, simulations, sandboxes, and offline drills.</span>
            </div>
          ` : `
            <div class="chem-chat-history" id="chemChatHistory">
              <div class="chem-msg chem-msg-bot">
                <p>Hi! I'm your Chemistry Study Partner for <strong>${currentLesson.title}</strong>. Stuck on a concept or need a hint on one of the checkpoint questions?</p>
              </div>
            </div>
            <div class="chem-chat-chips">
              <button class="chem-chat-chip" type="button" data-prompt="Explain this lesson's main particulate concept simply.">💬 Core concept</button>
              <button class="chem-chat-chip" type="button" data-prompt="Give me a quick Socratic check question to test my understanding.">⚡ Quick check</button>
              <button class="chem-chat-chip" type="button" data-prompt="Give me a guiding hint for the checkpoint questions.">📝 Question hint</button>
            </div>
            <form class="chem-chat-form" id="chemChatForm">
              <input type="text" id="chemChatInput" placeholder="Ask a question or request a hint..." autocomplete="off" />
              <button type="submit" id="chemChatSubmit" aria-label="Send question">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          `}
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    const toggleBtn = widget.querySelector('.chem-mascot-btn');
    const drawer = widget.querySelector('.chem-socratic-drawer');
    const closeBtn = widget.querySelector('.chem-socratic-close-btn');

    const toggleDrawer = () => {
      const isOpen = drawer.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen && isAuthenticated) {
        const input = widget.querySelector('#chemChatInput');
        if (input) setTimeout(() => input.focus(), 150);
      }
    };

    toggleBtn.addEventListener('click', toggleDrawer);
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });

    if (isAuthenticated) {
      const form = widget.querySelector('#chemChatForm');
      const input = widget.querySelector('#chemChatInput');
      const history = widget.querySelector('#chemChatHistory');
      const chips = widget.querySelectorAll('.chem-chat-chip');

      const appendMessage = (html, role) => {
        const row = document.createElement('div');
        row.className = `chem-msg chem-msg-${role}`;
        row.innerHTML = `<p>${html}</p>`;
        history.appendChild(row);
        history.scrollTop = history.scrollHeight;
        return row;
      };

      const sendQuery = async (queryText) => {
        if (!queryText || !queryText.trim()) return;
        const prompt = queryText.trim();
        if (input) input.value = '';

        appendMessage(prompt, 'user');
        const loadingRow = appendMessage('<span class="chem-coach-dots"><span></span><span></span><span></span></span>', 'bot');

        try {
          const res = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-oauth-session': oauthSession
            },
            body: JSON.stringify({
              model: 'gemini-3.6-flash',
              contents: [{
                role: 'user',
                parts: [{
                  text: `You are the Science Practice Study Partner, an encouraging, pedagogically rigorous Socratic chemistry tutor for high school students.
Current Lesson: "${currentLesson.title}" (Unit ${unitPrefix}).
Rules:
1. Socratic coaching: guide with questions, particle-level analogies, or intermediate steps. Never give away full answers to practice problems immediately.
2. Keep responses brief (2 to 4 sentences).
3. Use plain chemical notation (H+, OH-, CO2, etc.).

Student question: ${prompt}`
                }]
              }]
            })
          });

          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              loadingRow.innerHTML = '<p>⚠️ Your session has expired. Please sign in again in Science Practice Partner.</p>';
              localStorage.removeItem('oauth_session');
              return;
            }
            throw new Error('Server error ' + res.status);
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let fullText = '';
          loadingRow.innerHTML = '<p></p>';
          const targetP = loadingRow.querySelector('p');

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullText += decoder.decode(value, { stream: true });
            targetP.textContent = fullText;
            history.scrollTop = history.scrollHeight;
          }

          if (!fullText.trim()) {
            targetP.textContent = "I'm thinking about that! Could you rephrase or ask about a specific part of the lesson?";
          }
        } catch (err) {
          loadingRow.innerHTML = '<p>⚠️ Could not connect to Chemistry Study Partner. Please check your connection.</p>';
        }
      };

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (input) sendQuery(input.value);
        });
      }

      chips.forEach((c) => {
        c.addEventListener('click', () => {
          const p = c.getAttribute('data-prompt');
          if (p) sendQuery(p);
        });
      });
    }
  }

  // Initialize widgets, motion primitives, and tooltips

  /* ---- start-up: everything that needs the rendered top bar or the manifest ---- */
  function start() {
    TB.lessons().then((list) => {
      const entry = list.find((l) => l.id === lessonId);
      if (entry) currentLesson = entry;
      updateLessonTotalCheckpoints();
      initResume();
      initPracticeBridge();
      initSocraticCompanion();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
