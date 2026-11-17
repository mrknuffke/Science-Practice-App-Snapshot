# Rendering Gotchas

Every entry here is a bug that actually shipped. Read this before authoring
lesson content, widgets, or UI.

**This is the single source of truth for content and rendering invariants.** It
used to be two: a set of these rules also lived in `.agent/rules/`, in a format
only Antigravity reads, with entries this file had never heard of. Two of the
bugs below were sitting in the textbook at the time, covered by a rule that was
written down in the wrong file. Those rules were merged in here on 2026-09-20;
`.agent/rules/` now points here. **Do not start a third copy.**

When you fix a new rendering bug, add an entry **and** a check that would have
caught it, in the same commit:

- textbook: `tests/smoke/textbook.smoke.ts` (runs every lesson), or a drift guard
  in `services/__tests__/`
- React app: `tests/smoke/app.smoke.ts` for public screens; authenticated
  screens are checked by David, not automated

Format: **Symptom** / **Cause** / **Correct pattern** / **Guard**.

---

## Page text is invisible in one theme, and the page colour follows the OS

- **Symptom:** In the bio and physics books, text was dark on black or pale on
  white depending on the reader's macOS appearance, not the book's theme toggle.
  Padded `width: 100%` cards and text boxes poked past their column. Unclassed
  `<p>`, `<ul>` and `<li>` rendered in Times.
- **Cause:** `tokens.css` defined tokens but never applied them: no reset, and no
  `html` or `body` rule. Lessons declare `<meta name="color-scheme" content="light dark">`,
  so with no body background the browser paints its own canvas from the OS theme.
  Without `box-sizing: border-box`, padding adds to the width.
- **Correct pattern:** A book on the shared runtime (the `migrated` list in
  `services/__tests__/textbookStandard.baseline.json`) gets all of this from
  **public/textbook/base.css**, and its `tokens.css` holds tokens only. For a book
  that has not moved yet, every `assets/tokens.css` ends with the reset
  (`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}`), `html` and
  `body` rules that read `var(--paper)`, `var(--ink)` and `var(--serif)`, and a
  list rule that restores `padding-left`. Do not patch single cards or text boxes.
- **Guard:** `services/__tests__/textbookFoundation.test.ts` (runs in
  `npm run verify`) asserts the reset and the `body` rule in each book's `tokens.css`,
  and `textbookStandard.test.ts` asserts them in the shared `base.css` for migrated books.

## Chemical formulas show literal `<sub>` tags on sort-classify bins

- **Symptom:** Lesson 1-2c bins read `NH<sub>4</sub>` instead of NH₄⁺.
- **Cause:** `core.js` renders sort-classify category labels with `textContent`
  (and the print view does too), so markup in a label is shown as text. Other
  widgets' `label` fields and sort-classify *item* text render as HTML, which
  makes this easy to get wrong by analogy.
- **Correct pattern:** Category labels are plain text. Write notation in Unicode:
  subscripts `₀₁₂₃₄₅₆₇₈₉`, superscripts `⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻` (in JSON, `₄⁺`).
- **Guard:** smoke test (every lesson: no literal markup in rendered text, no
  markup in `.w-sort-bin`); Claude Code hook `check-sort-labels.mjs` on edit.

## Bullets hang outside the text column in lesson cards

- **Symptom:** List markers in interactive cards sat flush with (or left of) the
  card's text edge, reading as unindented.
- **Cause:** `tokens.css` resets `padding` to 0 on every element, which removes
  the default `padding-left` that lists rely on for their markers.
- **Correct pattern:** Lists need an explicit `padding-left`.
  `components.css` restores it for `.interactive ul, .interactive ol`; any list in
  a new container needs the same. Inline `padding-left` on a card still wins.
- **Guard:** smoke test fails any visible-marker list inside `.interactive` with
  zero left padding (proven: zeroing the rule fails 1-2c, 2-6a and 1-7b).

## Lists lose their bullets in the React app

- **Symptom:** `<ul>`/`<ol>` in app screens render with no markers or indent.
- **Cause:** Tailwind's preflight reset sets `list-style: none` and `padding: 0`
  on lists.
- **Correct pattern:** Add classes explicitly, e.g. `list-disc pl-5` or
  `list-decimal pl-5`.

## A CSS token silently resolves to nothing

- **Symptom:** A colour, gap, or diagram radius quietly falls back to its initial
  value (black text, zero gap, `r=0` circles). Nothing errors.
- **Cause:** `var(--token)` referencing a custom property that is not defined
  (renamed, typo, or never added to `tokens.css`).
- **Correct pattern:** Define every token in `tokens.css` (or the component file)
  before using it. Use `var(--token, fallback)` only when unset is intended. SVG
  presentation attributes cannot take `var()` at all (`r="var(--x)"` parses to 0);
  use `style="r: var(--x)"`.
- **Guard:** drift guard `services/__tests__/chemCssTokens.test.ts` (runs in
  `npm run verify`, preflight, and CI). It runs for all three books (chem,
  physics, bio). Bio shipped with 27 uses of `var(--primary)`, a token the book
  never defined, so active buttons and readouts were white on white. The accent
  token is `--accent`.

## Progress shows zero for every lesson

- **Symptom:** The dashboard reported no progress anywhere.
- **Cause:** Checkpoints are stored as spaced-repetition metadata objects, but
  progress was counted with `=== true`, which no object satisfies.
- **Correct pattern:** When a stored value's shape changes, grep every reader of
  that key and update them in the same commit.

## A lesson card is dead on the dashboard

- **Symptom:** Lesson 1-2c had no working card.
- **Cause:** It was missing from `index.html`'s hardcoded `MANIFEST_DATA`, one of
  three manifests (`lessons.json`, `MANIFEST_DATA`, `core.js` `LESSONS_MANIFEST`).
- **Correct pattern:** Add a lesson to all three manifests together.
- **Guard:** drift guard in `sourceOfTruth.test.ts` (manifests agree); smoke test
  asserts the dashboard shows one card per `lessons.json` entry; route check
  requests every lesson page and every script it loads.

## Lesson scripts are not named after lesson ids

- **Symptom:** (Tooling, not user-facing.) Checks that guessed `<id>.js` reported
  16 lessons missing their scripts.
- **Cause:** Lesson ids were renumbered (1-7a is the mole lesson); the script
  files kept their original names (`2-7a.js`).
- **Correct pattern:** Read a lesson's scripts from its own `<script src>` tags,
  as `scripts/preflight/check-routes.mjs` does. Never derive file names from ids.

## An HTML tag inside an SVG `<text>` ejects the rest of the drawing

- **Symptom:** Part of a diagram vanishes, and its labels reappear as stray text
  in the page *below* the figure. No error.
- **Cause:** `<em>`, `<sub>`, `<sup>`, `<strong>`, `<b>` and `<i>` are on the HTML
  parser's foreign-content breakout list. Inside an `<svg>`, encountering one is a
  parse error: the parser closes out of the SVG and reparents everything after it
  into the surrounding HTML. Shipped in `3-1c` (`<text><em>q</em></text>`) and
  `5-1a.js` (`<text>2 ν<sub>e</sub></text>`).
- **Correct pattern:** `<tspan font-style="italic">q</tspan>` for styling, and
  Unicode for notation: `₀₁₂₃₄₅₆₇₈₉ ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ ₑ ν Δ`. The same rule applies
  inside JS template literals that build SVG.
- **Guard:** drift guard in `sourceOfTruth.test.ts` (source scan of both
  textbooks, so it catches SVG built in JS that no smoke test renders); smoke test
  also fails any `svg text` with a non-SVG child.

## A named entity inside an uppercased button renders as `&SUP4;`

- **Symptom:** A button or header shows literal `&SUP4;` or `&DELTA;`.
- **Cause:** `text-transform: uppercase` is applied after the entity is parsed in
  some engines, and named entities are case-sensitive.
- **Correct pattern:** Use literal Unicode in anything uppercased: `⁴He`, `ΔH`.

## A CSS variable passed to Canvas 2D silently keeps the previous colour

- **Symptom:** Everything drawn after a certain point comes out in the wrong
  colour, usually whatever was set before it.
- **Cause:** `ctx.fillStyle = 'var(--accent)'` is not a colour. Canvas 2D rejects
  the assignment and leaves the property at its old value — no error, no warning.
- **Correct pattern:** Resolve first:
  `getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()`,
  or use a hex literal. Re-resolve on theme change.

## Canvas drawings are blurry on Retina

- **Symptom:** Crisp DOM text next to soft, fuzzy canvas output.
- **Cause:** The backing buffer is CSS pixels, not device pixels.
- **Correct pattern:** Size the buffer by `window.devicePixelRatio` and scale the
  context to match; keep the CSS size as authored.

## Inline formulas break apart when their container is a flex row

- **Symptom:** Superscripts and subscripts drop to the baseline, or separate from
  their base with a visible gap.
- **Cause:** `display: flex` with a `gap` on a container holding inline maths or a
  chemical equation makes each inline box a flex item.
- **Correct pattern:** Formulas and equations stay in continuous text flow. Use
  `display: block` (or plain inline) on the container.

## Diagrams shrink to a fraction of their column

- **Symptom:** An SVG sits tiny and centred in a wide column, with labels too
  small to read.
- **Cause:** A hardcoded `max-width: 300px`-style clamp, or a flex parent that
  shrink-wraps the child.
- **Correct pattern:** Figures default to `width: 100%` of their container. Inside
  `.step-stage`, children need `align-items: stretch` and `width: 100%`. Scale
  internal SVG typography for legibility: 11–12px minimum for labels, 16–20px for
  key readouts.

## An ad-hoc font size or raw colour breaks the theme

- **Symptom:** One element ignores dark mode, or sits half a step off the type
  scale.
- **Cause:** A fractional rem (`0.72rem`), a bracket size (`text-[13px]`), or a
  raw hex inside a component.
- **Correct pattern:** Consume tokens only.
  - *Textbook / vanilla CSS:* `var(--text-3xs)` (9px) through `var(--text-4xl)`
    (48px), plus `var(--text-reading)` (22px) for editorial prose.
  - *React / Tailwind:* the named scale (`text-xs` … `text-xl`). No bracket sizes.
  - *Colour:* `--paper --card --ink --ink-soft --ink-mute --accent --good --hair
    --hair-soft`. Never a raw hex in a component.
  - *SVG geometry:* `--dia-r-particle: 2`, `--dia-r-atom-sm: 5`, `--dia-r-atom: 7.5`,
    `--dia-stroke: 1`, `--dia-stroke-bond: 1.2`; figure tiers `.figure--sm`,
    `.figure--md`, `.figure--full`, `.figure--wide`.
- **Guard:** `services/__tests__/chemCssTokens.test.ts` catches an undefined token,
  and `services/__tests__/designTokens.test.ts` asserts semantic token coverage,
  zero ad-hoc font sizes across stylesheets and lesson HTML files, and zero em-dashes.

## Em-dashes in student-facing copy

- **Symptom:** Inconsistent punctuation between lessons.
- **Cause:** House style: no `—` or `&mdash;` anywhere in authored site content or
  code, including HTML prose, callouts, captions, SVG `<text>`, and runtime
  strings (feedback messages, status pills). Use commas, colons, parentheses, or a
  shorter sentence.
- **Exception:** `docs/textbook/references/**` (moved out of `public/` 2026-11-08) holds verbatim Google Sheets exports of
  the NGSS performance expectations. That text is quoted, not authored, and is
  left exactly as published.

## A reveal button that works before the student has tried

- **Symptom:** Students open the answer without attempting the item, and the
  checkpoint records a completion that means nothing.
- **Cause:** Reveal/answer buttons rendered enabled on load.
- **Correct pattern:** Self-tests, faded examples and practice widgets start with
  the reveal `disabled`, and enable it only after a real attempt (an answer
  submitted, a value checked).

## A simulation that is only sliders

- **Symptom:** Students move controls at random and take nothing away.
- **Cause:** Shipping the model without the inquiry scaffolding around it.
- **Correct pattern:** Every simulation ships structured "Try This" challenges or
  inquiry missions, with the parameters it is testing shown transparently. See the
  About-panel requirement in `/CLAUDE.md`.

## A sim prints as a dark rectangle

- **Symptom:** A lesson printed from dark mode shows each simulation as a dark box
  with pale text on white paper.
- **Cause:** Print switches the page to the light theme by removing the `dark`
  class, but a canvas keeps the pixels it last drew. The still frame was taken from
  a canvas drawn with the dark tokens.
- **Correct pattern:** Anything that changes the theme for print runs the theme
  listeners (`TB.theme.onChange`), so every sim re-reads its tokens and redraws
  before its still frame is captured. The same happens in reverse after printing.
- **Check:** `tests/smoke/textbook.smoke.ts`, "a sim printed from dark mode is
  redrawn in light colours first".

## A glossary tooltip that never opens on a tap

- **Symptom:** On a phone or a touch Chromebook, tapping a bold term does nothing.
- **Cause:** A tap focuses the term and then clicks it. The focus handler opened
  the tooltip, and the click handler of the same tap saw it open and closed it.
- **Correct pattern:** Focus opens a tooltip only when it comes from the keyboard.
  A tap toggles it on the click; a mouse opens it on hover and a click keeps it open.
- **Check:** `tests/smoke/textbook.smoke.ts`, "on a touch screen", run with
  `hasTouch`.

## A sim prints an empty scene

- **Symptom:** Printed before the student runs it, a sim shows an empty stage (in
  bio 1-1, an empty cell and mitochondrion), and reads as a blank box.
- **Cause:** A print takes the canvas as it is. A sim that is locked behind its
  prediction has drawn only its first frame, and 1-1's first frame fell between
  two reactions.
- **Correct pattern:** Choose the first frame on purpose: it shows the model's
  inputs at work, and never the result a prediction asks about. In 1-1 the model
  clock starts as one glucose and six oxygen molecules arrive (`T_START`).
- **Check:** `tests/smoke/textbook.smoke.ts`, "the sim prints as a drawn still
  frame", which for 1-1 also counts the atoms in the printed frame.

## A missing feedback string prints "undefined"

- **Symptom:** A multiple-choice option with no `feedback` shows the word "undefined"
  in the feedback line after the student checks it.
- **Cause:** The widget wrote `chosen.feedback` straight into `innerHTML`. A missing
  property becomes the string "undefined". Chem's converted prediction questions
  have no per-option feedback yet, which exposed it.
- **Correct pattern:** Every place a widget writes an authored string falls back to
  `''` (`opt.feedback || ''`). Write real per-option feedback anyway: the standard
  requires it and the voice pass will add it.
- **Check:** `services/__tests__/textbookRuntime.test.ts`, "never writes a missing
  feedback string into the page".

## An exam section left open, and a "+1" list in running text

- **Symptom:** All six chem Unit 2 pages ended their exam section with a `section` and
  two `div`s still open, so the browser closed them at `</main>` and put the practice
  card inside the exam. In 2-7c the "Before, Change, After" list showed a "+1" badge in
  front of each item.
- **Cause:** The old pages closed only the exam frame. And `ul.pts` is the scoring-guide
  list: `lesson.css` puts a "+1" mark in front of every item, so it is wrong anywhere else.
- **Correct pattern:** Close the exam as `exam-frame`, `div.narrow`, `section`, then start the
  practice card as its own section. Write a plain `ul` for a list in prose. Use `ul.pts` only
  inside a scoring guide (`.scheme-card`, or a widget's reveal).
- **Guard:** `services/__tests__/chemUnit2Content.test.ts` (every Unit 2 section and div is
  closed; no `ul.pts` outside a scoring guide in any chem lesson).

## The dashboard's exam practice showed a checkpoint, not the exam

- **Symptom:** Exam practice on the chem dashboard could show a lesson's first checkpoint
  question, and that question's reveal, in place of the written-response exam.
- **Cause:** `extractExamQuestionData` in `dashboard.js` looked for a `commit-reveal` widget
  inside the exam frame, and when it found none it took the first one anywhere on the page.
  Since stage 1 every checkpoint is a `commit-reveal`, so that fallback always found one.
- **Correct pattern:** Look only inside the exam container. Read the question from `.exam-q`
  and the guide from `.scheme`, or from the widget when the exam itself is a widget (1-2e, 1-7a).
- **Guard:** `services/__tests__/chemUnit2Content.test.ts` runs `extractExamQuestionData` on
  every chem lesson page. Without the fix, 15 lessons failed it.

## A class that no stylesheet defines, and a symbol turned into capitals

- **Symptom:** In 1-7b a conversion factor (`span.fraction` with a numerator and a denominator)
  printed as two plain words on one line, because no stylesheet had a rule for any of the three
  classes. In the 1-2d dashboard a label "Sodium (Na)" read "SODIUM (NA)".
- **Cause:** A lesson used a class its stylesheet never defined, and nothing fails when that
  happens. And `.readout-label` is set in capitals, so an element symbol in it changes case.
- **Correct pattern:** Define every class a page or its script uses (shared or in `components.css`).
  Name the substance in a readout label and put the symbol in the value.
- **Guard:** `services/__tests__/chemUnit2Content.test.ts`: every class in the six Unit 2 pages and
  scripts is defined, and no readout label holds an element symbol in brackets.

## A "Reveal" button with no handler, and a solution that was already open

- **Symptom:** In 3-1a three "Reveal worked solution" buttons did nothing, and each worked solution
  was already on the page before any attempt.
- **Cause:** Stage 1 of session 4c deleted chem's old predict-then-reveal script and the style rule
  that hid the solution box, but the three short-answer problems were never turned into widgets.
  The markup stayed, with a button nobody listened to.
- **Correct pattern:** A worked problem is a free-text `commit-reveal` widget. The student writes
  first, and the solution opens after.
- **Guard:** `services/__tests__/chemUnit3Content.test.ts` (no `data-reveal-btn` and no
  `predict-reveal` in any Unit 3 page).

## A pressed chip hides the Enrichment tag it carries

- **Symptom:** In 3-4a the "Speed histogram" chip, tagged Enrichment, turned ink-filled when pressed.
  Its dashed grey tag then sat dark on dark and could not be read.
- **Cause:** `.tag-enrichment` is drawn in `--ink-mute`, and a pressed `.chip` fills with `--ink`.
- **Correct pattern:** `.chip[aria-pressed="true"] .tag-enrichment { color: inherit; border-color: currentColor; }`.
- **Guard:** `chemUnit3Content.test.ts` asserts the rule is in `components.css`.

## A slider starts on a value its step does not allow

- **Symptom:** The 4-1b temperature slider was written `value="37"` with `min="5" step="5"`. The page showed 35 degrees C, and
  every number in the lesson text was for 37.
- **Cause:** A browser moves a range input's value to the nearest step from `min`. 37 is not on the grid 5, 10, 15 and so on.
- **Correct pattern:** `(value - min) / step` is a whole number. For a start that is not a multiple of the step, use a step of 1.
- **Guard:** `services/__tests__/chemUnit4Content.test.ts`, "a slider starts on a value its step allows" (all four Unit 4 pages).

## A random sim gives other numbers in Chrome than in Node

- **Symptom:** The 4-1a "Look for" line said 21 reactions. The model test in Node agreed, and the page in Chrome showed 23.
- **Cause:** Hard-disk collisions amplify a last-bit difference into a different run within a few collisions per particle.
  `Math.cos`, `Math.sin`, `Math.exp` and `Math.hypot` are not exact to the last bit in every engine, and the seeded generator
  fed them.
- **Correct pattern:** In a model that follows many collisions, draw a direction by rejection sampling in the unit disc and
  normalise with `Math.sqrt`; use only `+ - * /`; round any `Math.exp` result that feeds a timer.
- **Guard:** `chemUnit4Content.test.ts` ("the chaotic models give the same numbers in every engine") and the Chrome numbers in
  `tests/smoke/chemUnit4.smoke.ts`.

## A PE practice item is always marked wrong because its answer key uses a name the engine does not read

- **Symptom:** In HS-PS1-2 a student typed 5 for the propane coefficient and was told it was wrong, and a fully correct classification (Synthesis, Decomposition, Single Replacement, Combustion) was marked wrong too. Seven more PE files had the same fault for classification, ranking and numeric items.
- **Cause:** `public/chem/pe/pe-engine.js` grades against `correctCategoryIndex` (on each classification row, with the row text in `label`), `correctOrder` (ranking, with `items` as plain strings) and `correctValue` and `unit` (numeric). The data used `correctCategory`, `category` by name, `correctRank`, `targetValue`, `correctAnswer` and `numericUnit`. A missing key is `undefined`, so no answer can match and nothing errors.
- **Correct pattern:** use the engine's key names (see any item in `public/chem/pe/data/hs-ps1-1.js`).
- **Guard:** `services/__tests__/peDataKeys.test.ts` runs every item in every PE file and asks each type for the key the engine grades against.

## A drawing in a PE item's stem would be rewritten by the glossary pass

- **Symptom (prevented, not shipped):** the HS-PS1-2 and HS-PS1-3 polarity items needed Lewis structures. Pasted into `stem`, an SVG's `<text>` labels ("lone pair", "H₂O") would be wrapped in glossary `<span>`s or have their formulas rewritten, and SVG does not render HTML inside `<text>`.
- **Cause:** `public/chem/pe/pe-engine.js` runs `stem`, options, hints and worked solutions through `formatStudentContent`, which rewrites everything that is not a tag.
- **Correct pattern:** put the drawing in the item's `figure` field, one `<svg role="img" aria-label="...">`. The engine draws it under the stem untouched. Colour it with the `--pe-*` tokens from `pe-practice.css` (not the lesson tokens, which that page does not load), so it follows dark mode. Build it with the shared helpers in `public/chem/pe/pe-figures.js` (Lewis structures in the 1-2b style, particle boxes, energy profiles, fatty-acid chains), which `index.html` loads before the data files and both PE guard tests load into their sandbox.
- **Guard:** `services/__tests__/peDataKeys.test.ts` ("drawings live in `figure`") fails on any `<svg` outside `figure`, and on a figure without `role="img"` and an `aria-label`.

## Cram View threw on every exam section

- **Symptom:** Turning on Cram View (the top-bar button) did nothing on a lesson with a written-response exam, and the console showed a `SyntaxError`.
- **Cause:** `toggleCramView` in `public/chem/assets/book.js` passed `querySelectorAll` a list whose second selector began with `>` (`'...:not(.section-tag), > *:not(.narrow)'`). A selector may not start with a combinator unless it is written with `:scope`, so the call threw for every section that holds an exam frame.
- **Correct pattern:** Write `:scope > *` when a selector starts from the element you are searching in.
- **Guard:** `services/__tests__/chemBook.test.ts`, "parses each literal selector without throwing", runs every literal `querySelectorAll` selector in `book.js` against jsdom.

