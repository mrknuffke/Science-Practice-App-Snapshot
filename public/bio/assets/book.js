/* ============================================================
   SAS GENERAL BIOLOGY: BOOK CONFIG
   Loaded before the shared runtime (docs/textbook/RUNTIME_SPEC.md, section 4.1).
   Holds the book's config and the one piece of page code the book owns: the
   dashboard (lesson list and search). Bio has no progress and no book tools
   inside a lesson. Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  var page = document.documentElement.dataset;
  var mainApp = { id: 'main-app', label: 'Main App', title: 'Science Practice App', href: '/' };
  var about = { id: 'about', label: 'How It Was Built', title: 'How this book was built', href: 'about.html' };

  window.TB_BOOK = {
    id: 'bio',
    title: 'SAS General Biology',
    briefLabel: 'Phenomenon',
    progress: false,
    // The dashboard links to the main app and the colophon; the colophon to the main app. Lessons have no extra buttons.
    tools: page.lesson ? [] : (page.page === 'about' ? [mainApp] : [mainApp, about])
  };

  /* ---- dashboard: lesson list from lessons.json, and search ---- */
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
            container.innerHTML = '<p class="unit-empty">Curriculum staging and consensus notes review in progress.</p>';
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

        var searchInput = document.getElementById('searchInput');
        if (searchInput) {
          searchInput.addEventListener('input', function () {
            var query = searchInput.value.trim().toLowerCase();
            document.querySelectorAll('.lesson-link').forEach(function (link) {
              link.hidden = !link.textContent.toLowerCase().includes(query);
            });
          });
        }
      })
      .catch(function (err) {
        console.error('Error loading lessons manifest:', err);
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderDashboard);
  else renderDashboard();
})();
