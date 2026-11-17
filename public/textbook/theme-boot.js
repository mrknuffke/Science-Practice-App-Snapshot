/* Shared textbook runtime: theme boot.
   Runs in <head>, before first paint, so a page never flashes the wrong theme.
   One key (docs/textbook/RUNTIME_SPEC.md, section 5): sp_dark_mode, the key the
   main app already uses. The class is "dark" on <html>. */
(function () {
  var root = document.documentElement;
  var read = function (key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  };
  var write = function (key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* private window */ }
  };
  var saved = read('sp_dark_mode');
  if (saved !== 'true' && saved !== 'false') {
    // Once: take the choice from the old per-book keys, so a student's saved theme survives the move to
    // one key. They are not removed: the main app and chem's PE practice pages still read gc-theme
    // (core.js keeps writing it), and a student on an older device may still have only an old key.
    var OLD = ['gc-theme', 'gp_theme', 'physics_theme', 'bio_theme', 'theme'];
    saved = null;
    OLD.forEach(function (key) {
      var value = read(key);
      if (saved === null && (value === 'dark' || value === 'light')) saved = value === 'dark' ? 'true' : 'false';
    });
    if (saved !== null) write('sp_dark_mode', saved);
  }

  var dark = saved === 'true' ||
    (saved !== 'false' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', dark);

  if (read('sp_accessibility_mode') === 'true') root.classList.add('accessibility-mode');
})();
