# Textbook Style Standard

**Status: approved by David, 2026-10-12 (Phase 3, deliverable 1).**

One standard for all three textbooks (`public/chem/`, `public/physics/`,
`public/bio/`) and for any book added later. It sets how a lesson looks, how
its components are marked up, what every simulation must do, and how deep and
how hard the writing may go.

It comes from the Phase 2 audits in [`docs/archive/plans/audit/`](../archive/plans/audit/page-audit.md)
and from David's decisions recorded in
[the consistency plan](../archive/plans/textbook-consistency-fixes.md).

## 0. How to use this document

- **Who reads it.** Any agent or person who writes or edits a lesson, a
  simulation, a widget or a shared stylesheet in a textbook.
- **What wins when documents disagree.**
  1. This standard: layout, type, components, the Sim Standard, level policy.
  2. [`VOICE.md`](VOICE.md): how every student-facing sentence is written.
  3. [`INTERACTION_SPEC.md`](INTERACTION_SPEC.md): how widgets and motion
     controllers behave.
  4. [`../RENDERING_GOTCHAS.md`](../RENDERING_GOTCHAS.md): traps that have
     already shipped once.
  5. Each book's guide: that book's colours, special tools and PE list only.
- **Target and today.** This document describes the target. A book reaches it in
  its Phase 4 migration session. Until then a book keeps its current classes.
  New or edited content in any book must still follow sections 1, 7 and 8, and
  must add no new inline `style=""` attribute and no per-lesson `<style>` block.
- **Where the code lives.** The shared stylesheet and script are specified in
  [`RUNTIME_SPEC.md`](RUNTIME_SPEC.md).
  Once the shared stylesheet exists it is the source of truth for exact CSS
  values. This document then records the decisions and the markup.

## 1. Five rules everything else follows

1. **One reading size.** Every sentence a student reads to learn is 20px:
   prose, list items, questions, options, feedback, callouts, sim instructions.
   Smaller text is for labels and controls only.
2. **Style belongs to components, never to a lesson.** A lesson is content and
   class names. If a lesson needs a look that no component gives it, the
   component is missing: add it to the shared library, then use it.
3. **Tokens only.** Every size, colour, radius and gap is a token. No raw hex,
   no raw pixel or rem font size, in HTML, CSS or lesson JS.
4. **The core stays inside the PE.** The core of each lesson stays within the
   assessment boundary of the NGSS performance expectation it serves. Anything
   past the boundary is Enrichment (section 6) or is cut.
5. **Nothing is revealed before an attempt.** No answer, scoring guide, model
   response or simulation run is reachable until the student has committed
   something.

## 2. Tokens

### 2.1 Shared tokens (identical in every book)

| Group | Tokens | Values |
|---|---|---|
| Faces | `--display`, `--serif`, `--mono` | Hanken Grotesk, Spectral, IBM Plex Mono |
| Type scale | `--text-xs` to `--text-4xl` | 12, 14, 16, 18, 20, 24, 30, 36, 48px |
| Reading size | `--text-read` | 20px (same value as `--text-lg`) |
| Hero title | `--text-hero` | 4.7rem (75px); the hero `h1` only |
| Column | `--prose` | 46rem (about 78 characters of 20px Spectral) |
| Wide column | `--wide` | 68rem |
| Gutter | `--gutter` | `clamp(1.25rem, 5vw, 4rem)` |
| Gaps | `--gap-text`, `--gap-block`, `--gap-section` | 1.25rem, 1.75rem, `clamp(3rem, 6vw, 4rem)` |
| Radius | `--r-tag`, `--r-ctl`, `--r-card` | 4px, 6px, 8px |
| Figure tiers | `--fig-sm`, `--fig-md`, `--fig-full`, `--fig-wide` | 24rem, 34rem, `var(--prose)`, `var(--wide)` |
| Diagram geometry | `--dia-*` | chem's existing set, shared unchanged |

Retired: `--text-reading` (22px), `--text-2xs` (11px) and `--text-3xs` (9px) in
lesson content, and `--beat`. The 11px size remains legal only inside an SVG or
canvas diagram. The 9px size remains legal only in the periodic table grid.

### 2.2 Per-book tokens (the only CSS a book owns)

Each book's `assets/tokens.css` defines these, **in both themes**, and nothing
else:

| Token | Meaning | Rule |
|---|---|---|
| `--paper`, `--paper-2`, `--card` | page, band, card backgrounds | |
| `--ink`, `--ink-soft`, `--ink-mute` | text, secondary text, decorative labels | `--ink-mute` never carries a sentence |
| `--accent`, `--accent-soft` | the book's one accent | means "look here" |
| `--good` | correct or steady | never used for decoration |
| `--bad` | incorrect or alert | outline and text only, never a fill. No subject colour shares its value |
| `--warn`, `--cool` | caution; cold or second data series | |
| `--hair`, `--hair-soft`, `--grid` | borders and the graph-paper ground | |
| Subject families | for example `--glucose`, `--vector`, `--nucleus` | used in diagrams and sims only |

A semantic token defined for light and not for dark is a defect. (Bio and
physics define `--bad` and `--warn` for light only today.)

### 2.3 Colour meaning

- **Selected** is an ink border. It is not the accent, because in bio the accent
  and `--good` are the same green.
- **Correct** is `--good` plus the word or mark that says so.
- **Incorrect** is a `--bad` outline plus the word or mark that says so.
- **Never colour alone.** Right, wrong, selected and status are always carried
  by text or a mark as well as colour.
- **Filled ink** means "primary action" or "currently on". Nothing else is
  filled with ink.

## 3. Type scale application

Headings and text are styled **by element** inside `<main>`, so unclassed text
is always correct. Classes such as `.section-head`, `.subhead`, `.prose` and
`.step` are not needed and are removed during migration.

| Role | Element | Size | Face and weight |
|---|---|---|---|
| Lesson title (the hook sentence) | `h1` in `.hero` | 36px to 75px (`clamp(var(--text-3xl), 7vw, var(--text-hero))`), at most 17 characters a line | display 800 |
| Section head | `h2` | 30px to 36px (`clamp(var(--text-2xl), 3.6vw, var(--text-3xl))`) | display 700 |
| Subhead | `h3` | 24px | display 700 |
| Card or sim title | `h4` | 20px | display 700 |
| Prose, lists | `p`, `li` | 20px, line height 1.65 | serif 400, colour `--ink` |
| Question, option, feedback, reveal, callout, sim step | (in components) | 20px | serif 400 |
| Hook paragraph | `.lede` | 20px | serif 400, `--ink-soft` |
| Header rows (Alignment, Objective, Scope) | `.meta-block .v` | 16px | serif. Orientation text, the one exception to the reading size |
| Button label, table header and cell | | 16px | display 600; table numbers in mono |
| Caption, hint, legend | `figcaption`, `.hint` | 14px | caption mono, hint display, `--ink-soft` |
| Label, tag, readout label, status | `.label` | 12px | mono 600, uppercase, tracking .12em |
| Readout value | `.readout-value` | 20px | mono 600 |
| Standalone equation | `.eq-display` | 24px | mono |
| Diagram label (SVG, canvas) | | 12px, never under 11px | display or mono |

Rules:
- A heading is never smaller than the text under it.
- Body text is upright. Italic is for a single word or a symbol, never a
  paragraph.
- `em` is plain italic in the text colour. It is not coloured.
- Anything set in uppercase uses literal Unicode, never a named entity
  (see the `&SUP4;` entry in the gotchas).
- Formulas use `<sub>` and `<sup>` in HTML text, and Unicode in SVG, canvas,
  uppercase labels and fields that render as plain text.

## 4. Layout and rhythm

- **One column.** Text, cards, figures and sims share one column,
  `.narrow` at `--prose` (46rem), so every left edge lines up. `.wrap`
  (`--wide`) is for the hero, a two-panel sim or a wide table, and for nothing
  else.
- **Three gaps.**
  - Paragraph to paragraph: `--gap-text`.
  - Text to component, and component to component: `--gap-block`.
  - Section to section: `--gap-section`. This replaces the 88px to 192px bands.
- **Subhead spacing.** `h3` has 2.25rem above and `--gap-text` below.
- **Sections.** One `<section data-toc="Label">` per numbered part. A section
  starts with a `.section-tag`, then its `h2`.
- **No hand-set spacing.** No inline margin or padding. If two things sit too
  close, the component rule is wrong.
- **Phone.** Everything works at 360px with no sideways scroll. Grids use
  `repeat(auto-fit, minmax(...))`, never a fixed column count. Tables sit in
  `.table-wrap`.
- **Lists.** `ul` and `ol` take the prose style by element, with
  `padding-left: 1.4em`.

## 5. Component catalogue

One card shell is shared by every boxed component: `--card` background, 1px
`--hair` border, `--r-card` corners, padding `clamp(1.1rem, 3vw, 1.5rem)`.
Children are spaced 0.9rem apart. Components differ by their label and their
content, not by their box.

Markup below is the authoring contract. Where a component is rendered by the
shared script from a JSON config, the JSON is the contract.

### 5.1 Page frame

| Component | Markup | Rules |
|---|---|---|
| **Top bar** | rendered by the shared script | Never copied into a lesson by hand. Holds home, contents, theme, print and the book's own tools. |
| **Lesson header (hero)** | `<section class="hero" id="s-hero" data-toc="Opening">` holding, in order: a `.label` (lesson number and name), `h1`, `p.lede`, `.meta-strip`, the optional Synopsis panel, and a "Start" button | Chem's header, used by all three books (rules below). |
| **Section tag** | `<div class="section-tag"><span class="num">02</span><span class="label">...</span></div>` | The label is plain words. No "Mission Briefing" style text here (section 8.5). |
| **Next lesson** | `<a class="next-lesson" href="...">` at the end of the page | One per page. Sections have no "Continue" button and no divider row between them. The hero's "Start" button is the one exception. |

**Hero rules.**
- **The title is a hook, not a name.** The `h1` is one to three short sentences
  that state the phenomenon or the paradox. One word may carry the accent
  (`<span class="flip">`). The lesson's number and name go in the label above
  it, so a student can still find "Lesson 4-1a".
- **The lede** is two to four sentences on the phenomenon (`VOICE.md` section 4).
- **The meta strip** has three rows. *Alignment*: the PE code and its statement.
  *Objective*: what the student can do after the page, written to the student in
  Tier 3 ("You can explain ..."). *Scope*: what the page covers, in plain words,
  with any Enrichment topic named as Enrichment.
- **It fills the first screen** (`min-height: 94vh`) and ends with the "Start"
  button.
- **Synopsis panel.** Every chem lesson has one (core claims, one figure, a
  retrieval checklist). It is available to bio and physics and not yet required
  there.

### 5.2 Text components

| Component | Markup | Rules |
|---|---|---|
| **Callout** | `<div class="callout"><div class="label">...</div><p>...</p></div>` | One design. The label names the kind. Two standing labels: "The one idea to hold onto" and "Common mistake". At most one paragraph. |
| **Briefing card** | `<div class="brief"><div class="label">...</div><p>...</p></div>` | Optional. A named scenario the lesson returns to (a bio anchor case, a physics mission). At most one, directly after the hero. The hook itself lives in the hero. The label is the book's word for it ("Phenomenon", "Mission"). A scenario name is a bold lead-in to the first paragraph (`<p><b>Name.</b> ...`), never a heading. |
| **Glossary term** | `<strong class="term" data-term="key">word</strong>` | Every term resolves to an entry in the book's `assets/glossary.js`. A term with no entry fails the guard test. |
| **Figure** | `<figure class="figure figure--md"><div class="diagram">svg or img</div><figcaption>...</figcaption></figure>` | Width from a tier, never pixels. Default `figure--full`. The caption states the takeaway (`VOICE.md` section 4), in normal case. One exception: a figure that a question asks the student to read gets a caption that says what is plotted, so the caption does not answer the question. Number a figure the text or a question refers to: `<b>Figure 1.3</b>`. |
| **Data table** | `<div class="table-wrap"><table class="data-table"><caption>...</caption>...</table></div>` | Always has a caption. Numbers right-aligned in mono. Not the Reference Center table. |
| **Equation** | `<div class="eq-display">...</div>` | Block layout, centred, wraps on a phone. Never a flex container. |

### 5.3 Checks

All checks are widgets from [`INTERACTION_SPEC.md`](INTERACTION_SPEC.md),
written as a JSON config and rendered by the shared script. No lesson carries
its own question handler.

| Component | Markup | Rules |
|---|---|---|
| **Checkpoint** | `data-widget="commit-reveal"`, mode `choice`, `free` or `drill` | The only multiple-choice form. Every option has its own feedback. The reveal opens only after a commit. |
| **Reveal** | rendered by the widget | Chosen option marked "Your answer". Correct option marked with a tick and the word "Answer". The feedback for the chosen option comes first, then the general explanation. |
| **Recall blanks** | `.recall` with `input.blank[data-answer="a|alt"]` | "Show answers" is disabled until one check has been made. |
| **Written response** | `.exam-frame` with a marks label, the prompt, a text box and a gated scoring guide | The scoring-guide button is disabled until the student has written an answer. Marks stay. The guide is a checklist (section 8.4). |
| **Other widgets** | `faded-example`, `scaffold`, `step-builder`, `sort-classify`, `diagnose-error`, `construct-validate`, `predict-run` | Available to all three books from the shared runtime. |
| **Review check section** | the widgets above, in a section before the printable written part | Every unit review opens with auto-checked items (decision D8). |

Free-text gates never show a character count. They show a soft hint
("Keep going.", "Ready.").

### 5.4 Simulation shell

The parts of `.sim-box`, always in this order. Section 7 gives the rules.

| Order | Part | Markup |
|---|---|---|
| 1 | Label and question | `.label` "Simulation", then `h4` holding the question |
| 2 | Prediction | a `commit-reveal` widget marked as the sim's gate |
| 3 | Stage | `.sim-stage` holding one `canvas` or `svg` with `role="img"` and an `aria-label` |
| 4 | Controls | `.sim-controls`: `.btn`, `.chip`, and `label.slider-row` with an `output` |
| 5 | Readouts and status | `.sim-readouts > .readout > .readout-label + .readout-value`; `.status-pill[data-state]` |
| 6 | Legend | `ul.sim-legend > li > span.key` |
| 7 | Try this | `ol.try-this`, shown one step at a time |
| 8 | Record | a "Record" `.btn.ghost` and `table.sim-record` |
| 9 | Use the evidence | a checkpoint directly after the sim box |

| Component | Rules |
|---|---|
| **Button** `.btn` | Primary: ink fill. Secondary: `.btn.ghost`. Minimum height 44px. Sentence case, display face. |
| **Chip** `.chip` | A small toggle or preset. Carries `aria-pressed`. On = ink fill. Set by class and attribute, never by inline style from JS. The helper's Pause chip is the one exception: its label is the action (Pause or Play), so it carries no `aria-pressed`. An action that is not a toggle or preset (Start over, Eat a meal) is a `.btn.ghost`, not a chip. |
| **Slider** | `<label class="slider-row">Name <output>value</output><input type="range"></label>`. Always labelled, always shows its value with a unit. |
| **Readout tile** | Label 12px, value 20px mono, on `--paper`. The grid wraps by itself. |
| **Status pill** | `data-state` is `ok`, `warn`, `alert` or `neutral`. The name says the meaning, not the subject (no `hot` for a diabetes state). |
| **Legend** | One entry for every colour, symbol and particle on the stage. Swatches read the same tokens the stage uses. |
| **Try this** | Two to four steps. Each step is one action and one "Look for" sentence. A step may hold a "Load this setup" chip. |
| **Record table** | One column per recorded readout, named with its unit. At most six rows, newest last. A "Clear" control empties it. Nothing is stored after the visit. |

### 5.5 What is not a component

- A lesson-only layout (for example an equation balancer's stage) is a class in
  that book's `assets/components.css`, under a comment that names the lesson.
  It is never a `<style>` block or an inline style.
- Inline `style=""` is allowed for one thing: setting a `--dia-*` diagram token
  or an SVG geometry property that cannot be set by attribute (see the gotchas).

## 6. Enrichment

Enrichment marks content that goes past the assessment boundary of the lesson's
PE. It is one component with one look in all three books.

**Look.** A dashed 1.5px `--ink-mute` outline, no fill, `--r-card` corners, and
a dashed tag reading "Enrichment". Core cards are solid and filled; Enrichment
is dashed and unfilled. It is neutral grey on purpose: the accent means "look
here", green means "correct", and Enrichment is neither.

**Markup (a block).**

```html
<details class="enrichment">
  <summary><span class="tag-enrichment">Enrichment</span><h4>Title of the block</h4></summary>
  <p class="hint">Extra depth. The rest of the lesson works without it.</p>
  ... content: prose, a figure, a sim, a check ...
</details>
```

**Markup (a whole section).** The tag goes in the section tag, and the section
body goes in the same `details.enrichment`:

```html
<section data-toc="Launches in two directions" data-enrichment>
  <div class="section-tag"><span class="num">03</span><span class="label">...</span><span class="tag-enrichment">Enrichment</span></div>
  <h2>...</h2>
  <details class="enrichment"> ... </details>
</section>
```

**Rules.**
1. **The core never depends on it.** No core sentence, figure, checkpoint or
   scoring-guide line needs anything inside an Enrichment block. A student who
   opens none of them can complete the lesson and its review.
2. **Block level only.** The smallest unit is a block with a title. A stray
   above-level sentence is rewritten or moved into a block, not tagged inline.
3. **Checks inside stay inside.** A check on Enrichment content sits inside the
   block. Recall blanks, unit-review auto-checks and core written responses
   draw on core content only. An Enrichment written response carries the tag
   beside its marks.
4. **Sims.** A sim whose subject is past the boundary sits inside an Enrichment
   block. A core sim may offer a deeper view only behind a control that carries
   the tag.
5. **Contents menu and print.** A tagged section shows the tag in the contents
   menu. Enrichment prints open, with its tag.
6. **Same voice.** Enrichment text follows the same tier caps and `VOICE.md`
   rules as the core. It is deeper, not harder to read.
7. **Not a dumping ground.** A block exists because David chose to keep that
   content. Content nobody chose to keep is cut.

## 7. Sim Standard

Appendix A of the plan, as approved on 2026-10-08, with amendments from the
Phase 2 sim audit. **Amended** and **New** mark what changed. Every textbook
simulation, in any book, meets all of these. A DOM-only tool (a calculator, a
builder) meets every item that does not need motion.

**A. Student guidance** (text follows `VOICE.md` for the course tier)

1. **Question first.** The sim's `h4` is the question the sim answers. It is a
   question, not a title.
2. **Predict before touching. (Amended.)** The prediction sits inside the sim
   box. The stage, the controls and Record stay locked, and every readout
   shows a dash, until the student commits it. A prediction elsewhere on the
   page does not count, and a wrong prediction still unlocks the sim.
3. **Try this. (Amended.)** Two to four numbered steps in the one `try-this`
   component. Each starts with a verb and names the control and the setting.
   This replaces "missions", "guided inquiry", "investigations" and preset
   decks.
4. **What to look for.** Each step says what the student should see change,
   pointing at a named, visible part of the model.
5. **Record. (New.)** The sim has a record table. A "Record" button copies the
   current readouts into a new row, up to six rows. The table lasts for the
   visit and prints with the lesson. Each "Try this" step that produces a value
   tells the student to record it.
6. **Use the evidence. (Amended.)** A checkpoint directly after the sim that
   can be answered only from what the sim showed, and that says so. Where the
   sim records values, the question asks the student to compare two recorded
   rows.
7. **Legend.** Every symbol, colour and particle is identified in one legend
   placed with the sim.

**B. Scientific fidelity**

8. The model never contradicts the lesson text around it.
9. Conservation holds where it is the point (matter, energy, charge, momentum).
10. Readouts and visuals change in the same proportion.
11. The start state is consistent: the selected control, the model state, the
    readouts and the status text all agree.
12. **One set of numbers. (New.)** A value that appears in the lesson text, a
    table, a checkpoint and the sim is the same value in all of them.
13. **Not solved at load. (New.)** The default state does not meet the sim's
    goal, and no default readout shows the answer to a checkpoint.
14. **Inside the boundary. (New.)** The core view of a sim stays within the PE's
    assessment boundary. Anything past it follows section 6.

**C. Motion and runtime**

15. One `requestAnimationFrame` loop, time-based. `dt` is in seconds and is
    clamped. **(Amended.)** The model advances by simulated time, never by
    frame count, so a rate readout is the same on every screen.
16. Registered with the shared sim loop, so it stops off screen.
    **(Amended.)** Stopping and restarting leave every control in a correct
    state.
17. Particle paths are chosen once per leg, never re-randomised each frame.
    Pre-warm the scene so the first frame is not a clump.
18. Speeds are readable: a student can follow a single particle.
19. **Pause and reduced motion. (New.)** A sim that loops has a Pause control,
    which reads Play while the sim is paused. Nothing runs before the
    prediction is committed. Under `prefers-reduced-motion` a sim starts paused
    and offers a step control, sized so a student reaches each data mark in a
    few presses. A sim that stops on a data mark says so in its status and
    goes on with Play; Start over always runs it again.
20. **Sizing. (New.)** The canvas takes its size from the stage box and the
    device pixel ratio, and resizes when the stage resizes. No fixed pixel
    width or height set from JS.

**D. Visual consistency**

21. Uses the shared sim shell in the order of section 5.4, with the same
    classes in every book.
22. One control per variable (no button row duplicating a slider). A preset is
    a chip inside a "Try this" step. The active state is a class and
    `aria-pressed`, never an inline style set from JS.
23. Colours come from tokens. The canvas reads them through the shared helper
    and redraws on theme change. No hex in lesson HTML or lesson JS.
    **(Amended.)** A CSS `var()` is never passed to a canvas colour or font
    string.
24. Canvas and SVG text is at least 11px, in the book's loaded fonts, with
    Unicode notation (O₂, °C, →). **(Amended.)** Prefer the legend and the
    readouts to on-canvas labels. An on-canvas label is three words or fewer.
25. No label overlaps another label, a drawing or a particle path, at any
    width from 360px to 1280px. Label boxes are sized with `measureText`.
26. Works at 360px (stacked layout below 600px) and in both themes.

**E. Accessibility**

27. Buttons are `<button>` elements with `aria-pressed` for toggles. Sliders
    have labels. Readouts sit in an `aria-live="polite"` region. Touch targets
    are at least 44px. **(Amended.)** The stage has `role="img"` and an
    `aria-label` that says what the model shows.

## 8. Reading level and content policy

### 8.1 Tier

All three books are **Tier 3** (general high school) as defined in
[`VOICE.md`](VOICE.md) section 7:
- sentences of 12 to 18 words, and never over 25;
- instructions and steps of 20 words or fewer;
- multiple-choice options of 22 words or fewer;
- every rule in `VOICE.md` section 8 (active voice, one idea per sentence, no
  stack of four nouns, "because" for cause, no empty intensifiers).

### 8.2 The boundary rule

1. Each lesson names the PE it serves in the Alignment row of its hero and in
   the book's `lessons.json`.
2. The core explanation, the core sim, the checkpoints, the recall blanks and
   the unit review stay within that PE's assessment boundary.
3. Content past the boundary that David keeps is Enrichment (section 6).
   Content past the boundary that David does not keep is cut.
4. Course decisions override the boundary only where recorded. On record
   (2026-10-12): naming the intermolecular forces and limiting reactant are
   core in chem; organ and hormone names are core in bio.
5. Standards language appears in one place: the Alignment row of the hero. A
   student never reads "Disciplinary Core Idea", "Target Standards" or a PE
   statement anywhere else. The Alignment row quotes each PE word for word
   from NGSS and is exempt from the Tier 3 limits (David, 2026-10-22). The
   Objective and Scope rows are student-facing text and follow Tier 3 like the
   rest of the page.

### 8.3 Vocabulary

- Every bolded term is in the glossary. A term too advanced to define in one
  Tier 3 sentence is above level.
- Use the course-level wording in the replacement glossary of the rewrite plan
  ([`textbook-rewrite-plan.md`](../plans/textbook-rewrite-plan.md), section 5) in core text. The
  technical term may appear inside Enrichment.
- One word for one thing within a topic.

### 8.4 Questions, feedback and scoring guides

- **Feedback opens with the reason.** No "Correct!", "Incorrect.", "Perfect!"
  and no exclamation marks. The widget marks right and wrong; the sentence
  teaches.
- **Wrong-answer feedback names the temptation** (`VOICE.md` rule 10). One
  generic message for every wrong option is not allowed.
- **Balanced options.** Longest option is at most 1.8 times the shortest, for
  options longer than six words. The correct option is not the longest more
  often than chance.
- **Key position is spread.** Across a lesson and across a book, no one letter
  is the key for more than half the questions.
- **Distractors are real misconceptions.** No cartoon option.
- **Scoring guides are checklists.** Marks stay. Each line is under 20 words,
  one idea, in a teacher's voice ("You say the pituitary released more ADH.").
  The guide is hidden until an attempt.

### 8.5 Book themes

A book may have a title and named units or lessons (physics keeps its level and
mission names). Instructions, feedback, explanations, section
labels and button text use the plain teacher register. No "Cadet Directive" or
"Boss Challenge" in working text.

## 9. Accessibility and print

- Both themes are checked on every page. Theme follows the book's toggle, never
  the operating system alone.
- Every control is a real `button`, `input` or `select`, reachable by keyboard,
  with a visible focus ring and a 44px target.
- Live feedback uses `aria-live="polite"`.
- Motion honours `prefers-reduced-motion`. Content never waits for a scroll
  animation to become visible.
- Every lesson prints. Widgets print their question and, after it, their
  answer. Enrichment prints open. A sim prints its stage as a still frame.

## 10. Migration map (old name to standard)

For the Phase 4 sessions. "Element" means the bare HTML element with no class.

| Old (book) | Standard |
|---|---|
| `h2.section-head`, `h3.subhead`, `.section-heading`, `p.prose`, `p.step`, `ul.prose`, `p.lead` (bio, physics) | element |
| `h1.lesson-title`, `.lesson-subtitle`, the "Target Standards" and "Target Competency" lines (bio, physics); physics 1-3's separate page template | `.hero` (chem's header, section 5.1) |
| `.anchor-brief` family (bio), `.mission-brief` family (physics) | `.brief` + `.label` |
| `.callout-title`, `callout-warning`, `callout-accent`, `callout-good` | `.callout` + `.label` |
| `.predict-box` family, `.check-box` / `.check-opt` / `.feedback-box` with inline handlers, radio checkpoints (physics 1-3), `data-predict` choice questions (chem) | `data-widget="commit-reveal"` |
| `.scheme` opened by an inline script, ungated scoring-guide buttons, ungated "Show Answers" | gated scoring guide; gated recall |
| `recall-box`, `recall-list`, `recall-card` family | `.recall` |
| `.btn-primary`, `.btn-secondary`, `.w-btn` in lessons, `btn-sm`, `btn-subtle`, `w-btn-sm` | `.btn`, `.btn.ghost` |
| `.btn-preset`, `.preset-pill-btn`, `.action-pill-btn`, `preset-btn`, `stage-preset-btn`, `temp-preset-btn`, `path-btn`, `milestone-btn` | `.chip` |
| inline sim wrappers, `.sim-container`, `.boss-sim-container`, `interactive-header` family, lesson `<style>` sim shells | `.sim-box` and its parts |
| `.boss-canvas-wrap`, `.drop-vs-fire-wrap`, inline stage wrappers | `.sim-stage` |
| `.*-telemetry-card` family, `.telemetry-board`, `.readout-box`, `.tally-card`, `readout-pill`, inline tiles and fixed-column HUD grids | `.sim-readouts` > `.readout` |
| `.status-pill.cold/.hot/.neutral`, `.label.label-good/.label-warn` used as status, inline status colour from JS | `.status-pill[data-state]` |
| `mission-deck`, `mission-card`, "Guided Inquiry Missions", "Cadet Training Missions", "Try This" panels | `ol.try-this` |
| `.ref-table` used in a lesson, `.molar-table`, `.bca-table`, `.reference-table` | `.data-table` |
| `.chem-display.formula-lg`, `.bio-display.formula-lg` | `.eq-display` |
| raw SVG `font-size="N"` | `--dia-label-size`, `--dia-caption-size` |
| `[Enrichment]` text, "Beyond assessment boundary" label (chem) | `.enrichment` |
| `[data-next]` section buttons, `.next-action` rows, `.next-cue` | removed, except the hero's "Start" button; one `.next-lesson` link at the end of the page |
| the 78-line top bar copied into each lesson | rendered by the shared script |

## 11. Page checklist

Before a lesson is called done:

1. No `style=""` except diagram tokens. No `<style>` block. No hex.
2. Every class used is defined in the shared stylesheet or the book's
   `assets/components.css`.
3. Headings run `h1` to `h4` without skipping a level, with one exception: the
   title of a component (sim box, card, Enrichment block) is always `h4`.
   Every term resolves.
4. Every check is a widget, and no reveal opens without an attempt.
5. Every sim meets section 7, item by item.
6. Everything past the PE boundary is in an Enrichment block or gone, and the
   core reads complete without it.
7. `VOICE.md` section 6 QA pass, plus the limits in section 8.4 here.
8. Looked at in both themes at 360px and 1280px.
