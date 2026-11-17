/* ============================================================
   MISSION: PHYSICA: BOOK CONFIG
   Loaded before the shared runtime (docs/textbook/RUNTIME_SPEC.md, section 4.1).
   Holds the book's config, its one tool (the Reference Center, built by
   reference-center.js) and the dashboard (lesson list from lessons.json).
   Physics has no progress and no other tools inside a lesson. Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  var page = document.documentElement.dataset;

  var references = {
    id: 'references',
    label: 'References',
    title: 'Open the Reference Center',
    onClick: function () {
      if (window.TB_REFERENCE_CENTER) window.TB_REFERENCE_CENTER.open();
    }
  };
  var practiceHub = { id: 'practice-hub', label: 'Practice Hub', title: 'Science Practice App', href: '/' };
  var chemistry = { id: 'chem', label: 'Chemistry Text', title: 'Chemistry textbook', href: '/chem/index.html' };
  var back = { id: 'back', label: 'Back to Textbook', title: 'Back to the textbook', href: 'index.html' };

  window.TB_BOOK = {
    id: 'physics',
    title: 'SAS General Physics',
    briefLabel: 'Mission',
    progress: false,
    tools: page.lesson ? [references] : (page.page === 'about' ? [back] : [references, practiceHub, chemistry])
  };

  /* ---- dashboard: lesson list from lessons.json ---- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderDashboard() {
    var lists = document.querySelectorAll('[data-unit-lessons]');
    if (!lists.length) return;

    fetch('lessons.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load lessons.json: HTTP ' + res.status);
        return res.json();
      })
      .then(function (manifest) {
        var lessons = manifest.lessons || [];
        var byUnit = {};
        lessons.forEach(function (l) {
          var u = String(l.unit || '1');
          if (!byUnit[u]) byUnit[u] = [];
          byUnit[u].push(l);
        });

        lists.forEach(function (container) {
          var unitLessons = byUnit[container.getAttribute('data-unit-lessons')] || [];
          if (!unitLessons.length) {
            container.innerHTML = '<p class="unit-empty">Awaiting Physics PLC review and feedback before development.</p>';
            return;
          }

          var card = container.closest('.unit-card');
          if (card) {
            card.classList.add('is-live');
            var pill = card.querySelector('.unit-status-pill');
            if (pill) {
              pill.textContent = 'Active Lessons Live';
              pill.classList.add('is-live');
            }
          }

          container.innerHTML = unitLessons.map(function (lesson) {
            var isReview = lesson.id.indexOf('review') !== -1;
            var badge = isReview ? 'REVIEW' : lesson.id;
            return '<a href="lessons/' + lesson.slug + '.html" class="lesson-link' + (isReview ? ' review' : '') + '">' +
              '<span class="lesson-link-left">' +
                '<span class="lesson-link-badge">' + badge + '</span>' +
                '<span class="lesson-link-title">' + escapeHtml(lesson.title) + '</span>' +
              '</span>' +
              '<span class="lesson-link-arrow">&rarr;</span>' +
            '</a>';
          }).join('');
        });
      })
      .catch(function (err) {
        console.error('Error loading lessons manifest:', err);
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderDashboard);
  else renderDashboard();
})();
