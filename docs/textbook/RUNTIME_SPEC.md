# Shared Textbook Runtime: Specification

**Status: approved by David, 2026-10-12 (Phase 3, deliverable 2).**

This is the build spec for **public/textbook/** (new in Phase 4, session 4a):
one stylesheet set and one script set that all three textbooks load. It
implements [`STYLE_STANDARD.md`](STYLE_STANDARD.md). Session order is in
[the consistency plan](../archive/plans/textbook-consistency-fixes.md).

**Nothing here exists yet.** Until a book's Phase 4 session ships, that book
runs on its own `assets/` files and shares no code with the others.

## 1. Constraints

- **Zero build.** Plain CSS and classic (non-module) scripts, served as files.
  No bundler, no framework, no npm dependency, no server code.
- **Hosting.** Files under `public/` are served from the site root, so the
  shared runtime is at `/textbook/` and a lesson reaches it with the relative
  path `../../textbook/`. The `chem.`, `physics.` and `bio.` subdomains redirect
  to the main domain, so one copy is cached for all three books.
- **A shared bug reaches every book.** Section 8 lists the checks that must
  exist before any book depends on the runtime.

## 2. Files

### 2.1 Shared (in the new folder)

| File | Holds | Loaded by |
|---|---|---|
| **theme-boot.js** | Sets the `dark` class before first paint. About ten lines. | every page, in `<head>` |
| **base.css** | Font import, reset, page foundation, type by element, layout and rhythm, top bar, card shell, buttons, chips, tables, figures, callout, brief, glossary tooltip, lightbox, accessibility mode, reduced motion | every page |
| **lesson.css** | Hero, checks and widgets, motion primitives, sim shell, Enrichment, recall, written response, Synopsis, print rules | lessons |
| **core.js** | Theme, top bar, contents menu, footer navigation, lightbox, glossary tooltips, Enrichment, recall blanks, gated scoring guide, section stepping, print hook, storage | every page (safe where its elements are absent) |
| **widgets.js** | The `data-widget` framework (8 types), the motion primitives (step, scrub, zoom), widget print rendering | lessons |
| **sim.js** | The sim helper: loop, sizing, colours and fonts, prediction gate, "Try this", record table, readouts | lessons |
| **specimen.html** | Every component in one page, switchable between the three books' tokens. The runtime's own test page. | smoke suite only; not linked from any book |

### 2.2 Per book (what remains in `public/<book>/`)

| File | Holds |
|---|---|
| `assets/tokens.css` | The per-book tokens of the standard's section 2.2, in both themes. No reset, no `body` rule, no font import. |
| `assets/components.css` | Subject conventions (chem particle diagrams and Bohr model, physics vectors), lesson-only layouts, the dashboard. No selector that the shared files define. |
| `assets/book.js` | The book's config (section 4.1) and any book-only behaviour. Replaces the book's `assets/core.js`. |
| `assets/glossary.js` | The book's terms. Each file also sets `window.TB_GLOSSARY`, because the three books use three global names today (`GC_GLOSSARY`, `GP_GLOSSARY`, `BIO_GLOSSARY`). |
| `lessons.json` | The one manifest. |
| `lessons/`, `index.html`, `about.html` | Content. Source references (PE statements, review sheets) live in `docs/textbook/references/<book>/`, which is not served. |
| Book tools | Chem: Reference Center, `elements.js`, the molecule and particle renderers, the PE practice engine, the diagram generator, Quick Check, Cram View, resume bar, practice bridge, Socratic companion, progress and spaced repetition. Physics: its own Reference Center. Bio: none. |

Chem's tools stay chem-only in this project. Bio's reference-drawer CSS and
handler have no markup and are deleted.

### 2.3 Load order in a lesson

```html
<html lang="en" data-book="bio" data-lesson="1-3">
<head>
  <script src="../../textbook/theme-boot.js"></script>
  <link rel="stylesheet" href="../../textbook/base.css">
  <link rel="stylesheet" href="../../textbook/lesson.css">
  <link rel="stylesheet" href="../assets/tokens.css">
  <link rel="stylesheet" href="../assets/components.css">
</head>
<body>
  <main> ... sections ... </main>
  <script src="../assets/book.js"></script>
  <script src="../../textbook/core.js"></script>
  <script src="../../textbook/widgets.js"></script>
  <script src="../../textbook/sim.js"></script>
  <script src="../assets/glossary.js"></script>
  <!-- book tools, then the lesson's own script -->
</body>
```

Every lesson loads the same shared set in this order, whether or not it has a
sim. No `?v=` query strings. No inline `<script>` in a lesson except a widget's
JSON config.

**Non-lesson pages.** Each book's `index.html` and `about.html` load
**theme-boot.js**, **base.css**, the book's `tokens.css` and `components.css`,
and **core.js**. They must switch in the same session as the book's lessons,
because the book's `tokens.css` no longer carries the page foundation. Chem's
PE practice pages and diagram generator have their own stylesheets and are not
touched.

## 3. What moves out of chem's `core.js`

Line ranges are from chem's old `core.js` at commit `a52875d` (deleted in session 4c, stage 1). Search
for the comment header if a number has drifted.

| Chem section (lines) | Goes to | Note |
|---|---|---|
| Lessons manifest (22-53) | removed | Navigation reads `lessons.json` (section 4.2). Chem then has two manifests, not three. |
| Home button (55-67), contents menu (462-477), print button (3871-3886) | **core.js** top bar | The top bar is rendered, not copied into each lesson. |
| Storage engine (69-225) | **core.js** `TB.storage` | Progress helpers stay with chem. |
| Progress and spaced repetition (227-279) | chem `book.js` | Reached through the progress hook (section 4.4). |
| Footer navigation (281-330) | **core.js** | Previous and next lesson for all three books. |
| Theme and accessibility (332-352) | **theme-boot.js**, **core.js** | One key (section 5). |
| Quick Check (354-400), Cram View (402-460) | chem `book.js` | Chem-only. |
| Next-section scroll (479-485) | **core.js** | Kept for the hero's "Start" button only. |
| Reveal on scroll (487-493) | deleted | Content never waits for a scroll animation. |
| Expandable blocks (495-503) | **core.js** | Used by the Synopsis panel. |
| Synopsis checklist persistence (504-523) | chem `book.js` | |
| Predict-then-reveal, `data-predict` (524-549) | deleted at the end of 4c | After chem's `data-predict` questions become `commit-reveal` widgets. |
| Recall blanks (550-593), peek (594-608), scoring guide (609-648) | **core.js** | All three gated on an attempt. |
| Lightbox (649-720) | **core.js** | |
| Animation observer (721-735) | **sim.js** | The old name `GC_REGISTER_ANIMATION` was deleted in 4c stage 6, when the last lesson stopped calling it. |
| Section stepping by keyboard (737-752) | **core.js** | In all three books, Page Up and Page Down jump one section (for a clicker at the projector). Arrow keys and Space scroll normally, which changes chem. |
| Glossary tooltips (754-903) | **core.js** | |
| Widget framework (905-2986) | **widgets.js** | |
| Motion primitives (2987-3517) | **widgets.js** | |
| Print (3518-3870) | **widgets.js** (widget rendering), **core.js** (prepare and restore) | |
| Contact button (3887-3906), resume (3907-4030), practice bridge (4031-4287), Socratic companion (4288-4503) | chem `book.js` | Chem-only. |

Bio's and physics' `core.js` (421 and 361 lines) are replaced whole. Their
lean contents menu, lightbox and animation observer are the starting point for
the shared versions.

## 4. Public API

### 4.1 Page contract (HTML)

| Attribute or element | Meaning |
|---|---|
| `<html data-book data-lesson>` | Book id and lesson id. Scopes storage and the top bar. |
| `window.TB_BOOK` (set in `assets/book.js`) | `{ id, title, home, briefLabel, progress, tools }`. `progress` is `true` for chem only. `tools` lists the book's top-bar buttons. |
| `section[data-toc="Label"]` | One contents-menu entry. |
| `section[data-enrichment]`, `details.enrichment` | Enrichment (standard, section 6). The script adds the tag to the contents entry and opens every block for print. |
| `data-widget="..."` with a child `script.w-config` | A widget. Types: `commit-reveal`, `faded-example`, `scaffold`, `step-builder`, `sort-classify`, `predict-run`, `diagnose-error`, `construct-validate`. Config schemas are in [`INTERACTION_SPEC.md`](INTERACTION_SPEC.md). |
| `data-motion="step|scrub|zoom"` | A motion primitive. |
| `.recall` with `input.blank[data-answer]` | Recall blanks. |
| `.exam-frame` with a text box and `[data-scheme]` | Written response with a gated scoring guide. |
| `strong.term[data-term]` | Glossary term. |
| `.sim-box[data-sim="name"]` | A simulation (section 4.3). |

### 4.2 Script: `window.TB`

| Member | Does |
|---|---|
| `TB.book` | The `TB_BOOK` config. |
| `TB.lessons()` | A promise of the book's `lessons.json`, fetched once. Feeds the footer and "Next lesson" link. |
| `TB.theme.get()`, `TB.theme.onChange(fn)` | `'light'` or `'dark'`; a callback on every change. |
| `TB.storage.get/set/remove` | Storage that survives a sandboxed or private window (chem's engine). |
| `TB.progress.mark(type, index, value)` | Reports a completed check. Does nothing unless the book set `progress: true` and registered a handler. |
| `TB.widgets.register(type, init, print)` | Adds a widget type. A type with no `print` function fails the guard test. |
| `TB.sim.create(box, spec)` | Creates a sim (below). |

The shared script reads terms from `window.TB_GLOSSARY` only. Chem's
`GC_GLOSSARY`, `GC_ELEMENTS` and `GC_SCRUB_FN` keep their names, because chem's
dashboard and practice engine read them.

### 4.3 The sim helper

One call per sim, from the lesson's script:

```js
const sim = TB.sim.create(document.querySelector('[data-sim="osmo"]'), {
  kind: 'canvas',            // or 'svg'
  loop: true,                // false for a tool that redraws only on input
  init(env) {},              // once, after fonts have loaded
  update(dt, env) {},        // dt = 1/60 s of simulated time, fixed step
  draw(ctx, env) {},         // env.w, env.h in CSS pixels
  record() { return { 'Blood (mOsm/kg)': 288, 'ADH (pg/mL)': 1.8 }; }
});
sim.setReadout('adh', '4.1 pg/mL');
sim.setStatus('warn', 'Blood too concentrated');
sim.redraw();
sim.hold();      // stop exactly here (a data mark); sim.held is now true
sim.release();   // Start over or a new run: clear the hold and run again
```

`spec.stepSeconds` (default 0.25) is the real time one Step press advances.
Set it so a reduced-motion student reaches each data mark in a few presses.

What the helper owns, so no lesson script does it again:

| Job | Behaviour | Standard item |
|---|---|---|
| Loop | One `requestAnimationFrame` loop. Real time is turned into fixed 1/60 s steps (at most five a frame), so a model runs the same on a 60Hz and a 120Hz screen. | 15 |
| Visibility | Stops when the sim is off screen or the tab is hidden; restores control state on return. | 16 |
| Gate | Stage, controls and Record are inert, and every readout shows an en dash, until the `commit-reveal` widget marked `data-sim-gate` inside the box is committed. The lock goes on after the helper has built every part. | 2, 13 |
| Pause | Adds a Pause chip to a looping sim. It reads Play while paused and carries no `aria-pressed`. A Step chip shows while paused; one press advances `spec.stepSeconds`. Under reduced motion the sim starts paused. | 19 |
| Hold | `sim.hold()` from `update` stops the model on the spot: the steps left in that frame are dropped, so a clock stops exactly on a data mark. `sim.held` is true until the student presses Play or Step. `sim.release()` clears a hold and runs again (still paused under reduced motion); call it from Start over and from any control that starts a new run. | 16, 19 |
| Sizing | Sizes the canvas from the stage box and the device pixel ratio with a `ResizeObserver`. | 20 |
| Colours | `env.colors.accent` and the rest are resolved token values, refreshed on theme change, followed by a redraw. | 23 |
| Fonts | `env.font(12, 'mono')` returns a valid canvas font string in the book's loaded face. Never smaller than 11px. | 24 |
| Try this | Turns `ol.try-this` into a one-step-at-a-time stepper. Prints as the full list. | 3, 4 |
| Record | Adds the Record button and table from the keys `record()` returns. Six rows, visit only. | 5 |
| Readouts | `setReadout` and `setStatus` write into an `aria-live` region, at most twice a second. | 27 |

The lesson script owns the model and the drawing, and nothing else.

### 4.4 Progress hook

Widgets call `TB.progress.mark(...)`. Chem's `book.js` registers the handler
that writes its existing `gc-textbook-progress` record, so no student loses
progress. Bio and physics register nothing, so nothing is stored for them.

## 5. Theme and accessibility keys

- **One key: `sp_dark_mode`** (`'true'` or `'false'`). It is the key the main
  app already uses, so the app and all three books agree.
- **Migration, once.** If `sp_dark_mode` is unset, **theme-boot.js** reads the
  old keys (`gc-theme`, `gp_theme`, `physics_theme`, `bio_theme`, `theme`) and
  writes `sp_dark_mode`. With no saved choice it follows the operating system.
- **After session 4c, stage 1** every book reads `sp_dark_mode` only. The shared toggle
  still also writes **`gc-theme`**, because two things outside the books read it first:
  the main app (`App.tsx`) and chem's PE practice pages (`public/chem/pe/`). When they
  move to `sp_dark_mode`, delete `LEGACY_THEME_KEYS` in **core.js**. The keys
  `gp_theme` and `physics_theme` are no longer written. **theme-boot.js** still reads
  every old key once, so a saved choice survives, and removes none of them.
- **The class is `dark` on `<html>`.** Nothing sets or reads `data-theme`.
- **Accessibility mode:** `sp_accessibility_mode`, also the app's key. All
  three books honour it (today only chem does).
- A change fires `TB.theme.onChange` and a `storage` listener keeps open tabs
  in step.

## 6. Order of moves

**4a. Build the runtime, with bio as the first consumer.**
1. Write the shared files to the standard. **widgets.js** starts as a copy of
   chem's framework with three changes: the progress hook, the standard's class
   names, and the gate event for sims. (A fourth, the fixed strings, was
   approved during 4a; see section 9. The copy also gained print renderers for
   the three types chem could not print.)
2. Build **specimen.html** and add it and every shared file to
   `scripts/preflight/check-routes.mjs` and `tests/smoke/textbook.smoke.ts`.
3. Move bio: slim `tokens.css`, switch every page's tags, write `book.js`,
   delete bio's `core.js` and the shared rules in its `components.css`.

**4b. Physics**, by the same steps. Its Reference Center stays.

**4c. Chem.**
1. Diff chem's widget framework against **widgets.js**. Port anything only chem
   has. Then switch chem to the shared copy and delete its own.
2. Rename what is left of chem's `core.js` to `book.js`.
3. Migrate components, then set the 20px reading size.

**Two copies of the widget framework exist from 4a until 4c.** That is
deliberate: moving it out of chem in 4a would put all 27 chem lessons at risk
in a push meant for bio. Rule for that window: chem's copy is frozen. Any
widget fix goes into the shared copy only.

## 7. What must not change for a student

- Chem progress, spaced repetition, resume and saved theme survive the move.
- Every existing widget config keeps working without edits.
- Lesson URLs do not change.

## 8. Checks that must exist before bio depends on the runtime

1. The route check requests every shared file and **specimen.html**.
2. The smoke suite opens **specimen.html** once per book token set and both
   themes. It checks the book's accent and paper colours, no sideways scroll at
   360px and 1280px, no page or console errors, and that all eight widget types
   render. (Amended in 4R: there is no image baseline, because pixel baselines
   differ between machines.)
3. The existing per-lesson smoke tests still open every lesson in every book.
4. The guard tests in `services/__tests__/textbookStandard.test.ts`. Its
   baseline file has two lists, because a book moves in three commits:
   - Session 4a adds bio to "migrated" in the markup commit. That switches on
     the load-order check and the check that bio keeps no copy of a shared
     component.
   - It adds bio to "finished" after the sims commit. That switches on the
     checks that every sim is on the helper and every question is balanced.
5. A new test, written in 4a with **widgets.js**: every registered widget type
   has a print function.

## 9. Notes from the 4a build

What the first build added to the spec. Each item fills a gap the spec left, and
none changes what a student sees.

- **Extra files in the shared folder.** **specimen.js** (the specimen's book
  config, switcher and demo sim), **specimen.css** (its page-only styles and a
  token preview) and nothing else. **specimen.css** holds each book's tokens in
  the standard's form until that book's own `tokens.css` moves to it. A book is
  deleted from the preview in the session that slims its file (bio: 4a,
  physics: 4b, chem: 4c). `?book=chem|physics|bio` and `?theme=light|dark`
  choose what the specimen shows. The theme parameter is not saved.
- **The progress handler is set in `book.js`.** `book.js` loads before
  **core.js**, so it cannot call `TB.progress.register`. A book that wants
  progress sets `TB_BOOK.progress = true` and `TB.progressHandler =
  { mark, isDone, value }` in `book.js`. `TB.progress.register(handler)` does the
  same later. `isDone` and `value` are what a widget reads when it restores its
  state on load.
- **Printing is a hook list.** **core.js** owns `TB.print`. **widgets.js** and
  **sim.js** call `TB.print.hook(fn)`. Each `fn(undo)` registers what to put
  back after printing. Three widget types had no print renderer in chem
  (`predict-run`, `diagnose-error`, `construct-validate`). They have one now.
- **Sim markup the helper looks for.** `.readout[data-readout="id"]` receives
  `setReadout('id', ...)`. `[data-sim-gate]` marks the prediction widget. A
  slider's `output` follows its `input`, with `data-unit` and `data-digits`.
  `[data-preset]` chips inside `ol.try-this` call `spec.preset(name, env)`.
  The legend swatch is `span.key[data-shape][data-token]`.
- **Paused and reduced motion.** The Pause chip reads Play while paused and a
  **Step** chip appears. One press advances `spec.stepSeconds` (default 0.25 s).
  (Amended in 4R: it was a pressed toggle labelled Pause, and lessons told
  students to "press Pause to go on".)
- **Previous and next lesson** are rendered by **core.js** as `nav.lesson-nav`
  at the end of `main`. The last lesson's "next" link goes to the book's
  dashboard.
- **A fourth change to the widget copy, approved by David (2026-10-13).** The
  fixed strings in the copy broke the voice standard ("Excellent.",
  "Completed!", "Correct!" as a default, one chem-only example). They are now
  plain statements with no praise and no exclamation mark, and a missing
  feedback string shows nothing, because the widget already marks right and
  wrong. A guard in `textbookRuntime.test.ts` keeps them that way. Session 4c
  must port this change into chem's copy when it switches chem over.

## 10. Notes from the 4c stage 1 build

What moving chem added to the spec. Each item fills a gap the spec left; none changes
what a student reads.

- **A model answer (`[data-peek]`).** Section 3 sent chem's peek to **core.js**, but the
  shared file had none. It has one now: `button[data-peek]` followed by `.peek-box`,
  disabled until the nearest textarea above it holds 15 characters, and always closable
  once open. **lesson.css** styles it and prints it open. The specimen shows it.
- **Top-bar tools** take `id` (set as `data-tool`), `target` (with `rel="noopener noreferrer"`)
  and `icon` (the inside of a 24 by 24 svg). Chem's Quick Check and Cram View mark
  themselves with `aria-pressed` on their button. A tool with no icon still loses its
  label under 768px and becomes an empty box; physics and bio have that today.
- **Missing feedback.** `widgets.js` now writes `''` instead of the word "undefined" when
  an option has no `feedback`. The converted chem questions have none yet.
- **`data-predict` became `commit-reveal`** (migration map). Widget progress keys are
  `<type>-<position among all widgets>`, so the conversion moved every later widget.
  **book.js** carries `PROGRESS_MAP` (old key, new key) per lesson and applies it once,
  flagged by `_map` in the lesson's record. `chemBook.test.ts` pins this.
- **Chem's page files.** `assets/dashboard.js` is the dashboard's old inline script,
  moved without changes except the theme toggle (now the shared top bar) and Clear
  Progress (a top-bar tool that fires `gc:clear-progress`). The Reference Center is a
  top-bar tool that calls `window.TB_REFERENCE_CENTER.open()`.
- **One manifest.** `lessons.json` only. Previous and next links now follow its order,
  which puts 2-6a after 2-7c (chem's old script had it after 1-3b).
- **Names the shared sheet now owns.** Chem's `.readout` (an explanation panel) is
  `.result-panel`, and chem's `div.slider-row` in 2-6a and 2-7c is `.slider-field`.

## 11. Notes from the 4c stage 2 build (chem Unit 1)

What rebuilding the first chem sims added. No shared file changed.

- **A DOM-only tool in a `.sim-box`.** `TB.sim.create` needs a canvas or an svg it owns, so a
  tool made of buttons, a table or a form (a heat-map table, a builder) cannot use it. It uses
  the shell classes and `window.GC_GATE_TOOL(box, locks, onUnlock)`, set in chem's `book.js`:
  the controls get `inert`, every `.readout-value` shows an en dash, and both clear when the
  `data-sim-gate` widget commits. Its `.sim-readouts` carries `aria-live="polite"` by hand.
- **Chem-only canvas helper.** `public/chem/assets/bohr.js` draws one Bohr diagram from the
  helper's `env.colors`, for 1-1a and 1-1b.
- **Interactive svg.** A stage whose svg holds buttons (the 1-3a Lewis lab) is
  `role="group"` with a label, not `role="img"`, because an image role hides its children
  from a screen reader. Each bond and atom is a focusable `role="button"`.
- **A model registers itself.** A lesson script sets `window.GC_MODELS['<lesson>']` before it
  touches the page, so `services/__tests__/chemUnit1Models.test.ts` can run the model alone.
- **Progress keys, again.** A sim box adds a prediction widget and an evidence check, which
  moves every later widget's position key. `book.js` has `PROGRESS_MAP_2`, flagged `_map2`,
  for the lessons rebuilt so far. Each stage adds its own lessons to it.

## 12. Notes from the 4c stage 3 build (chem Unit 2)

What rebuilding the building tools added. No shared file changed.

- **A canvas tool with no loop.** `TB.sim.create(box, { kind: 'canvas', loop: false })` gives a
  tool that only redraws on input the sizing, colours, fonts, readouts, status, Try this, Record and
  the prediction lock, and no Pause chip. The script calls `sim.redraw()` after every input. Used by
  the 1-2d change lab, the 1-2e balancer, the 1-7a builder, the 1-7b path picture and the 1-7c chamber.
- **A preset sets several controls at once.** `spec.preset(name)` dispatches an `input` event on each
  slider so the helper rewrites its output. A handler that resets a related control (1-7c puts the
  progress back to 0 when a starting amount changes) must skip the reset while a preset loads.
- **Readout labels are set in capitals.** An element symbol in a label turns into the wrong symbol
  (Na becomes NA). Name the substance in the label and put the symbol in the value.
- **Chem stage shapes.** `.sim-stage[data-ratio="strip"]` (12 to 5) and `[data-ratio="pair"]`
  (two chambers, 3 to 4 on a phone) are chem-only rules in `components.css`.
- **A DOM-only second tool in a lesson** (the 1-7b empirical calculator, the 1-7c s'mores factory,
  the 2-6a argument builders) uses the shell classes and, where it has a prediction, `GC_GATE_TOOL`.
  A bar that follows a number uses `data-level` and CSS, never a style write.

## 13. Notes from the 4c stage 4 build (chem Unit 3)

What rebuilding the thermal sims added. No shared file changed.

- **An svg stage.** `TB.sim.create(box, { kind: 'svg' })` sets the svg's `viewBox` to the stage's pixel size,
  so a lesson draws in its own design units inside one `<g transform="translate(...) scale(k)">`. Text is
  given `font-size="max(12, 12 / k)"` so it stays 12px on screen at any size. `draw(svg, env)` runs every
  frame, so it keeps the last markup and writes `innerHTML` only when the markup changes (3-1c, 3-4a).
- **A run with a Start button.** A sim whose result is a run (the 3-1c calorimeter, the 3-4a trial) keeps
  `state` as `ready`, `running` or `done`. Its result readouts hold the en dash until a run finishes, and any
  control change puts it back to `ready`, so the default screen never answers the checkpoint. The Start
  button calls `sim.release()` so the run also starts under reduced motion (the Step chip then moves it).
- **A canvas stage that can show a second view.** The 3-4a histogram is an Enrichment chip on the control row.
  It changes `stage.dataset.ratio` and the canvas redraws, because a ResizeObserver already watches the stage.
- **A group of particles held to a temperature.** In the 3-4a chamber each group's speeds are rescaled every
  step to the temperature the model gives it. The groups meet at the average (equal numbers of identical
  particles), the total kinetic energy never changes, and the readouts do not shake. 60 particles cannot show
  a stable temperature by themselves: a group of 30 moves by about 20 percent from one moment to the next.
- **Enrichment tools.** A tool inside `details.enrichment` is a DOM tool like any other. `chemUnit3Content.test.ts`
  lets the one tool with no prediction (the 1-4a bond-energy calculator, which has a practice item below it) stand.
- **Progress keys.** `PROGRESS_MAP_2` gained `3-1a` (its checkpoint now follows the vessels) and `1-4a` (the
  Enrichment practice item comes before the exam, so `scheme-0` is now `scheme-1`).

## 14. Notes from the 4c stage 5 build (chem Unit 4)

What rebuilding the rate and equilibrium sims added. No shared file changed.

- **A run that stops on a mark and a system that stops on a settle.** 4-1a and 4-1b keep `state` as `ready`, `running` or `done`.
  A run is 10 simulated seconds (600 fixed steps). `update` calls `sim.hold()` when the clock reaches 10.0 s, and Start run and
  Start over call `sim.release()`. 4-6a has no run: a change puts the model in `shifting`, the other controls get `disabled`, and
  `update` calls `sim.hold()` when the net rate has stayed under 4% of the forward rate for one second. Under reduced motion
  `stepSeconds` is 3.4 (three presses reach 10 s) in 4-1a and 4-1b, and 4 in 4-6a (the slowest change settles in 14 s).
- **A seeded model with a chosen seed.** A random model (4-1a, 4-1b) uses its own generator and a fixed seed, so the numbers in
  "Look for" are the numbers on every screen. The seed was picked from a scan so that one run shows the average behaviour.
  Its sheet entry says so.
- **Same numbers in Node and in Chrome.** Collisions amplify a last-bit difference, and `Math.cos`, `Math.sin`, `Math.exp` and
  `Math.hypot` differ in the last bit between engines. A model that follows hundreds of collisions draws directions by rejection
  sampling and uses only `+ - * /` and `Math.sqrt`. `chemUnit4Content.test.ts` guards it, and the Chrome smoke test pins the numbers.
- **A range input starts on its step grid.** A browser moves `value="37"` with `min="5" step="5"` to 35. A content test checks every slider.
- **Constant concentrations in a rate measurement.** 4-1a replaces each reacting pair with a fresh A and B, so the slope of the graph
  is the rate and the collision count does not fall as the reactants are used up. The legend and the note say so.
- **A graph that follows the settings.** The 4-1b graph plots one point per finished run and clears when the enzyme itself changes
  (temperature, pH or enzyme amount). Its axis follows the top speed for those settings. The 4-6a and 4-6b strip charts keep the last
  30 s in 120 samples, trimmed, and are prefilled with the starting state.
- **Chips as a choice.** 4-6b's Buffered blood and Pure water are two `.chip` buttons with `aria-pressed`; the class and attribute show
  the choice, never a style write.

## 15. Notes from the 4c stage 6 build (chem Unit 5)

What rebuilding the last five lessons added. The one shared change is that `GC_REGISTER_ANIMATION` is
gone from **sim.js**, because no lesson calls it any more.

- **A seeded model of many independent events.** The 5-8a decay lab follows 100 atoms with a generator
  seeded for each isotope and decays drawn by plain arithmetic. The chance of a decay in one fixed step is
  `1 - 0.5^(1/128)`, built from seven square roots, so a half-life is exactly 128 steps (2.13 s) on every
  screen. A second generator, seeded apart, picks only the direction of each ejected particle, so a drawing
  choice never changes a count. The seed was picked from a scan so that each of the five isotopes halves close to 50, 25, 12 and 6.
- **A run that stops at several marks.** 5-8a's decay lab calls `sim.hold()` at 1, 2, 3 and 4 half-lives. The
  status says where it stopped and that Play goes on. A listener on the box turns a press of Play or Step into
  the next stretch (the helper clears the hold itself). `stepSeconds` is 2.2, so one Step press reaches each mark.
- **An svg tool with no loop.** The 5-2a redshift analyzer and the two 5-3a tools use
  `TB.sim.create(box, { kind: 'svg', loop: false })`: the helper gives them the lock, Try this, Record and
  the readouts, and the script calls `sim.redraw()` after each input.
- **Three boxes for one old lab.** The old 5-8a tabs (decay, single fission, chain reaction) are three
  `.sim-box`es, each with its own question, prediction and Record, because the Sim Standard gives each sim one
  question. The chain reaction sits in an Enrichment block.
- **A core sim with a deeper view behind a tagged chip.** 5-4a's "Show energies in eV" chip carries the
  Enrichment tag and swaps the rank of the photon for its energy.
- **An exam in an Enrichment block shifts the scoring-guide key.** `PROGRESS_MAP_2` moves `scheme-0` to
  `scheme-1` in 5-2a, 5-3a and 5-4a, and the old self-explain text widget to `peek-0` or `peek-1`.
- **Dead code removed.** `data-predict` counting and selectors in `book.js`, the `x5-*` rules and the legacy
  layout block in `components.css`, and `GC_REGISTER_ANIMATION` in **sim.js**.

