# Plan: Textbook consistency (theme, typography, layout, simulations)

Status: **Phases 1, 2, 3 and 4 done (2026-10-08, 2026-10-12, 2026-10-13, 2026-10-26).
All three books are on the shared runtime and meet the standard.** Do not start a phase or a session
whose heading or table row does not say "ready".

**Start here:** read "Agent assignments" (just below), then your phase.

Audience: the implementing agent. Every finding below was verified against the
code on 2026-10-08 at commit `04288db`. Line numbers drift; search for the
quoted text if a line number misses.

## Why this is a multi-phase project

David's review of the bio book found broken light/dark mode, mismatched text
sizes, misaligned cards, unreadable sims and no guidance for students. The
causes are structural, and they reach all three books:

1. **Bio and physics have no page foundation.** No CSS reset and no `body`
   font, colour or background (chem has all three). Unclassed text falls back
   to the browser default (Times), and the page colour follows the OS, not the
   book's theme toggle.
2. **Styling is written per lesson, not per component.** Counted on
   2026-10-08 (excluding `_widget-test.html`):

   | Book | Lessons | Inline `style="..."` attributes | Lines in per-lesson `<style>` blocks |
   |---|---|---|---|
   | chem | 27 | 3,921 | 1,093 |
   | physics | 10 | 798 | 174 |
   | bio | 5 | 271 | 252 |

   Each lesson invents its own buttons, readout tiles, cards and font sizes,
   so no two modules match.
3. **The three books apply one type scale differently.** All three define the
   same `--text-*` tokens, but chem reads at 22px with large headings, while
   physics and bio read at 16px with small ones.
4. **There is no simulation standard.** About 38 canvas sims (chem 15 in 11
   lessons, physics 18 in 8, bio 4 in 4) each define their own motion, labels,
   controls and student guidance. Where the guidance exists, it is often
   missing, wrong, or contradicts the lesson.
5. **The explanations go deeper than the course.** David's judgement, from his
   2026-10-08 review: "the general level of explanatory resolution is too high
   for our general high school biology course, and maybe for the other ones, too.
   The language register is off." The bio Unit 1 sheet
   (`public/bio/References/U1 Homeostasis.html`) anchors the unit to NGSS
   HS-LS1-2, HS-LS1-3 and HS-LS1-7. The NGSS assessment boundaries for those
   PEs exclude molecular mechanism. LS1-3 excludes "the cellular processes involved
   in the feedback mechanism". LS1-7 excludes "identification of the steps or
   specific processes involved in cellular respiration". LS1-2 excludes
   "interactions and functions at the molecular or chemical reaction level".
   Yet the bio lessons and sims use GLUT (27 times), hepatocyte (11),
   myofibril (10), hypertonic (10), Islets of Langerhans (5), V2 G-protein
   receptors with a cAMP cascade, Krebs/ETC and VO2 max. See Phase 2C.

So the work runs in phases: fix the foundations (mechanical), audit everything
against a standard (read-only), have David approve the standard, then migrate
one book at a time. Phase 3 also sets up the shared runtime and the governance
that keeps all future textbook work unified.

| Phase | What | Model | Code changes |
|---|---|---|---|
| 0 | David's decisions | David | none (**done 2026-10-08**) |
| 1 | Foundation fixes in bio and physics | Sonnet | small, mechanical; one push |
| 2 | Page, sim, and content-level audits across all three books | Sonnet | **none** (reports only) |
| 3 | Standard, shared runtime spec, per-sim briefs, governance | Opus with David | docs, skill, tests |
| 4 | Build the shared runtime; migrate bio, then physics, then chem | Sonnet, with an Opus review of the first book | large; one book per push |

## Agent assignments

Run each phase in a fresh Claude Code session in this repo. **The full session
prompts, with model and effort for each, are in
`docs/plans/textbook-consistency-sessions.md`. Use those.** The kickoff lines
below are short forms.

| Phase | Model | Why this level | Kickoff |
|---|---|---|---|
| 1 | **Sonnet** (`claude-sonnet-5-5`) | Exact steps, but it touches shared CSS in two books, needs judgement on list padding and glossary keys, and must write a test. Haiku is too likely to over-apply the reset or miss a case. | `Execute Phase 1 of docs/plans/textbook-consistency-fixes.md. Follow its rules section. Stop at the Phase 1 checklist.` (Effort: medium) |
| 2 | **Sonnet** | Reads about 42 lessons and 38 sims and makes graded calls (pass, partial, fail; the register tier) against a fixed rubric. One session covering all three books in order (bio, physics, chem), checkpointing after each book; resume with the Resume prompt if context runs low. Effort: high. | See Session 2 in the sessions file. |
| 3 | **Opus** (`claude-opus-5-5`) with David | Design decisions: the standard, the component library, the runtime boundaries, the sim briefs, and the reading-level policy. Not delegable. | `/plan-first Phase 3 of docs/plans/textbook-consistency-fixes.md using the audit reports in docs/plans/audit/.` (Effort: high) |
| 4 | **Sonnet** per book (sessions 4a, 4b, 4c); **Opus** reviews 4a before push (session 4R) | Mechanical once the standard and runtime spec exist; the first migration sets the pattern, so it gets a stronger review. Effort: high. | Final prompts are in the sessions file. |

Every phase ends with: `npm run verify` green, the phase checklist handed to
David, and `.claude/SESSION_NOTES.md` rewritten. Phases 1 and 4 also need a
green `npm run preflight` before any push (David runs `/ship`).

## Rules for the implementing agent (all phases)

- Read first: `CLAUDE.md`, `docs/RENDERING_GOTCHAS.md`,
  `docs/textbook/VOICE.md`, `docs/textbook/INTERACTION_SPEC.md`,
  `docs/textbook/TEXTBOOK_DEV_GUIDE.md` (rules 19, 20, 24, 25 cover sims and
  frames), `docs/textbook/PHYSICS_DEV_GUIDE.md`,
  `docs/textbook/BIOLOGY_DEV_GUIDE.md`.
- Zero em-dashes (U+2014 or `&mdash;`) in anything you write, CSS comments included.
- A book shares code only once it is in the `migrated` list of
  `services/__tests__/textbookStandard.baseline.json`. Until then a fix to its
  `assets/` folder reaches that book only.
- Do only the steps listed. Put anything extra in your report, not in code.
- Content (data values, graphs, science claims) belongs to David. Where this
  plan says "flag", report it; do not change it.
- Two-attempt rule: if a step fails twice, stop and report.
- Do not commit or push unless your session prompt says to. (The Phase 4
  prompts ask for local commits and say when to push.) At the end of each
  phase, run `npm run verify`, report the result, and give David that phase's
  manual checklist.
- After each phase, rewrite `.claude/SESSION_NOTES.md` (under 15 lines).

---

## Phase 0: Decisions (done)

**Recorded 2026-10-08.** David accepted every recommendation below. That
settles:
- D1: physics is in Phase 1.
- D2: one reading size for all three books, **20px prose** (`1.25rem`).
  Phase 1 applies it to bio and physics; chem moves in Phase 4.
- D3: shared runtime, yes.
- D4: textbooks only.
- D5: Appendix A approved as the rubric.
- D6: the 1-1 sim traces matter.
- D7: redesign the bio sims.
- D8: add auto-checked items to reviews, built on the shared runtime.

He added two goals, now built into Phases 2C and 3: bring explanations and
register down to course level, and unify all future textbook development, not
just this pass. The original wording of each decision is kept below for context.

- **D1. Physics in Phase 1?** Physics has the same missing foundation as
  bio. *Recommended: yes.*
- **D2. Reading size target.** Chem body 22px, physics and bio 16px. Options:
  bring physics and bio up to chem; bring chem down; meet at 18 to 20px.
  *Recommended: one scale for all three books, around 19 to 20px prose,
  decided once and written into the standard.* (Physics and bio body size
  changes in Phase 1 only if this is decided in time; otherwise Phase 4.)
- **D3. Unified architecture?** See "Architecture: should the three books share
  one runtime?" below. *Recommended: yes, a shared zero-build runtime under
  **public/textbook/** (new), decided before Phase 4* so no book is migrated twice.
- **D4. Scope of the sim audit.** The three textbooks only (about 38 canvas
  sims), or also the 16 React sims in the Simulations Hub
  (`constants/simulationsRegistry.ts`), which already have an About panel
  standard (`.claude/skills/new-simulation/SKILL.md`)? *Recommended: textbooks
  only; score the Hub sims in a later pass against the same standard.*
- **D5. Approve the draft Sim Standard** (Appendix A) as the audit rubric. Edits welcome.
- **D6. Bio 1-1 respiration sim:** should it trace matter (1 glucose + 6 O₂ in,
  6 CO₂ + 6 H₂O out, ATP shown as energy carried away)? See Seed findings S6.
- **D7. Repair or redesign** the bio sims? *Recommended: redesign from
  approved briefs.* The defect lists below are enough to repair, but a repair
  keeps crowded four-panel scenes that do not teach their key idea.
- **D8. What should a unit review be?** See "Review pages" below.

---

## Review pages: what each book does today (verified 2026-10-08)

David's question: is the bio review less interactive than physics and chem?

| Book | Unit review page | Interactive checks inside lessons |
|---|---|---|
| chem | **No review page.** Practice lives in the PE practice modules (`public/chem/pe/`, `pe-engine.js`), a separate MCQ and practice engine. | `data-widget` framework in `core.js`, 8 types: `commit-reveal` (31 uses), `sort-classify` (5), `scaffold` (5), `step-builder` (4), `faded-example` (4), `diagnose-error` (3), `predict-run` (1), `construct-validate` (1). Plus 21 `data-predict` MCQs. |
| physics | `1-review_packet.html`, `2-review_packet.html`: **printable written-response** (`exam-frame`, `print-workspace`, a reveal-on-click `scheme` scoring guide). No MCQ, no auto-checked items. | Hand-written commit boxes and 13 `data-correct` MCQ options. None of chem's widget types. |
| bio | `1-review_packet.html`: same printable written-response pattern as physics (`check-box` in place of `exam-frame`). | Hand-written commit boxes and 12 `data-correct` options. None of chem's widget types. |

So the bio review matches physics; it is not the odd one out. The real gap
is between chem and the other two: physics and bio never got chem's widget
framework (fill-in, sort, step-builder and so on), and only chem has an
auto-checked practice engine. D8 options: (a) keep reviews printable and add
an auto-checked section (MCQ, sort, fill-in) using the shared widget framework;
(b) build reviews on the chem PE engine pattern; (c) leave as is. *Recommended:
(a), once the shared runtime exists.* Then all three books gain the same check types.

## Architecture: should the three books share one runtime?

**How they are built today.** All three are static, zero-build sites in
`public/<book>/`, served as-is by Vite in dev and Vercel in production. Each
has its own `lessons.json`, `assets/tokens.css`, `assets/components.css` and
`assets/core.js`, plus per-lesson HTML and, for sims, per-lesson JS. Nothing is
shared.

| | chem | physics | bio |
|---|---|---|---|
| `core.js` | 4,514 lines: widget framework, Reference Center, spaced repetition, print, Socratic companion, lightbox | 361 lines plus `reference-center.js` (390) | 421 lines, physics' core with a glossary tooltip |
| `components.css` | 4,111 lines | 1,108 | 1,162 (an 88-line diff from physics) |
| Page foundation (reset, body) | yes | **no** | **no** |
| Extra tooling | diagram generator, PE engine, molecule and particle renderers | none | none |
| Theme storage key | chem's own | `gp_theme` / `physics_theme` / `theme` | `bio_theme` / `sp_dark_mode` / `theme` |

In practice, physics and bio are one codebase copied, and chem is a different
and richer framework. Every fix has to be made two or three times, and the
copies drift: the missing foundation, the undefined `--primary`, and three
different theme keys all came from that drift.

**Recommendation: one shared runtime, still zero-build.**
- **public/textbook/base.css** (new): reset, base typography from one type scale,
  layout rhythm, and the canonical component library (from the Phase 2 audit).
- **public/textbook/core.js** (new): theme (one storage key, reading the old keys once
  to migrate), TOC, lightbox, glossary tooltip, print, `GC_REGISTER_ANIMATION`,
  a shared sim loop helper (`dt`, DPR, visibility), and the chem `data-widget`
  framework moved out of chem's `core.js`.
- Each book keeps `assets/tokens.css` (accent colours, subject families),
  its glossary, its lessons, and its book-specific tools (chem's Reference
  Center, PE engine and diagram generator stay chem-only, unless they are later
  generalised).
- Lessons load **../../textbook/base.css** and **../../textbook/core.js** before
  their book's files.

**Trade-offs.**
- A bug in the shared files now breaks all three books at once. Mitigation:
  `tests/smoke/textbook.smoke.ts` already opens every lesson in every book on
  each push, and `check-routes.mjs` must list the shared files.
- It reverses the documented "books share no code" rule. `CLAUDE.md` and the
  three dev guides need updating in the same commit.
- Chem is the largest migration (3,921 inline styles), and its `core.js`
  holds the framework to be extracted. Physics and bio gain the most, because
  they get chem's widgets for free.

**Order if approved.** Phase 1 runs as written; its fixes are small and move
into `base.css` later. Phase 2's audit doubles as the inventory for the shared
library. Phase 3 writes the standard *as* the spec for **public/textbook/** (new).
Phase 4 becomes: build the shared runtime with bio as the first consumer, then
move physics, then chem.

---

## Phase 1: Foundation fixes in bio and physics (done 2026-10-08)

Small and mechanical. Ships as one push. Do not touch chem in this phase.

### 1.1 Page foundation (fixes theme, Times fallback, card and textbox overflow)

**Cause.** `public/bio/assets/tokens.css` and `public/physics/assets/tokens.css`
define tokens but never apply them: no reset, no `html`/`body` rule. Lessons
declare `<meta name="color-scheme" content="light dark">`, so with no body
background the browser paints its own canvas based on the **OS** theme.
Light book on a dark Mac gives dark text on black; dark book on a light Mac
gives pale text on white. Without `box-sizing:border-box`, every `width:100%`
element with padding is wider than its column: in bio 1-1, the Figure 1.1
`.diagram` card is 2.5rem wider than its neighbours, and `.commit-textarea`
pokes past its card. Unclassed `<p>`, `<ul>` and `<li>` render in Times with
tight leading (bio 1-3 section 03 list).

**Pattern to copy.** `public/chem/assets/tokens.css`, from
`*,*::before,*::after{box-sizing` to the end of the `body{...}` block.

**Steps (per book).**
1. Append to the end of `assets/tokens.css`, after the `:root.dark` block:
   - `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}`
   - `html{scroll-behavior:smooth;background-color:var(--paper);}`
   - `body{font-family:var(--serif);color:var(--ink);background-color:var(--paper);`
     plus chem's grid `background-image` and `background-size`,
     `line-height:1.62; -webkit-font-smoothing:antialiased; overflow-x:hidden;
     transition:background-color .3s ease,color .3s ease;}`
   - `font-size:var(--text-lg);` (20px, decision D2). Also set `font-size:var(--text-lg)`
     on `p.prose, p.step` in that book's `assets/components.css`, so prose and
     unclassed text match. Leave heading sizes for Phase 4.
   - Base list rule: `ul,ol{padding-left:1.4em;} li{margin-bottom:.35em;}`
     (the reset zeroes list padding; see `CLAUDE.md`, "Lists need explicit padding").
2. Leave `public/bio/index.html`'s inline body rule alone; it agrees.
3. Do not patch `.diagram` or `.commit-textarea` separately; the reset fixes them.

**Gotcha and check (same commit).** Add a `docs/RENDERING_GOTCHAS.md` entry:
symptom (text invisible in one theme; page colour follows the OS), cause (no
body background with `color-scheme: light dark`), pattern (every book's
`tokens.css` sets reset, `html` and `body` from tokens). Add a vitest case that
reads each book's `assets/tokens.css` and asserts a `box-sizing:border-box`
reset and a `body` rule using `var(--paper)` and `var(--ink)`.

**Snapshots.** The reading-size change will alter screenshot baselines. After
the change is verified, run
`PREFLIGHT_PLAYWRIGHT_ARGS=--update-snapshots npm run preflight` in the
terminal, review the changed images in `tests/smoke/__snapshots__/`, and list
them for David.

### 1.2 Undefined `--primary` token (invisible buttons and readouts)

**Symptom.** In bio 1-2, the active "Comfort Zone (22°C)" and "Rest (85W)"
buttons, the "Ambient Temperature" readout and the CORE TEMP value are white
on white.

**Cause.** Bio uses `var(--primary)` 27 times (1-2: 7, 1-3: 5, 1-4: 6,
review packet: 9), e.g. `.preset-pill-btn.active { background: var(--primary);
color: #ffffff; }`. Bio never defines `--primary`.

**Steps.**
1. Replace every `var(--primary)` in `public/bio/lessons/*` with
   `var(--accent)`. Do not add an alias.
2. Generalise `services/__tests__/chemCssTokens.test.ts` to run for
   `public/chem`, `public/physics` and `public/bio` (`describe.each`). If
   physics or chem fail, **report the undefined tokens; do not fix them in
   Phase 1.**
3. Update the existing undefined-token entry in `docs/RENDERING_GOTCHAS.md`.

### 1.3 Glossary keys shown as visible words

**Cause.** Authors typed the glossary lookup key as the visible text. `getSlug`
in **public/bio/assets/core.js** (deleted in session 4a) already slugifies visible text and honours
`data-term`, so plain words work.

**Steps.** Fix every case; confirm each key exists in
`public/bio/assets/glossary.js`, and use `data-term="<key>"` where the plain
words would not slugify to the key:
- 1-1: `cellular-respiration` to `cellular respiration`
- 1-2: `set-point` to `set point`; `negative-feedback` to `negative feedback`
- 1-3: `adh` to `ADH` (with `data-term="adh"`); `aquaporin</strong>-2` to a
  single term `aquaporin-2` (with `data-term="aquaporin"`)
- 1-4: `blood-glucose` to `blood glucose`

Then grep `public/bio/lessons` and `public/physics/lessons` for
`<strong class="term"[^>]*>[^<]*-[^<]*</strong>` and for a term whose text
is all lowercase where the glossary `term` is capitalised. Report what remains.

### 1.4 Word equation overflows the column

`.formula-lg` in `public/bio/assets/components.css` sets `white-space: nowrap`.
The bio 1-1 word equation ("Glucose + Oxygen → Carbon Dioxide + Water + ATP
(usable energy)") runs past the column and will scroll sideways on a phone.
Add `.bio-display.formula-lg { white-space: normal; }`. Check that the symbol
equation below it still fits on one line at desktop width.

### 1.5 Figure 1.1 graph oversized

The bio 1-1 leaf-disc SVG (`viewBox="0 0 540 280"`) sits in `.figure--full`,
so it scales about 1.5x and its labels render larger than body text. Change
that wrapper to `figure figure--md`. Do not touch bar values or labels. List
other `figure--full` data graphs in bio and physics for the audit; do not change them.

### Phase 1 manual checklist for David

Run `npm run dev` in the terminal, then:
1. Open `http://localhost:5173/bio/lessons/1-1_cellular-respiration.html` and
   toggle the theme both ways. Background, title, prose and top bar switch
   together; nothing is dark on dark or light on light.
2. Switch macOS appearance (System Settings > Appearance) and reload. The book
   keeps its own toggle choice.
3. Bio 1-3 section 03: the bullet list is in the book's serif font with normal spacing.
4. Bio 1-2 sim: the selected preset and exertion buttons are filled green with
   white text; every readout is visible.
5. Bio 1-1 section 05: the Figure 1.1 card is as wide as the card below it, and
   the text box stays inside its card.
6. Phone width (narrow the window): the word equation wraps, and nothing scrolls sideways.
7. Repeat steps 1 and 3 on a physics lesson.

---

## Phase 2: Audit, read-only (done 2026-10-12)

**Output:** three reports in **docs/plans/audit/** (new). **No code changes in Phase 2.**
Work one book at a time (bio, physics, chem) and checkpoint after each.

### 2A. Page and component audit: **docs/plans/audit/page-audit.md** (new)

For every lesson in all three books:
1. **Inline styling inventory.** Count `style="..."` attributes by property
   (`font-size`, `font-family`, `color`, `background`, `padding`, `margin`,
   `border`, `display/grid/flex`). Count hard-coded hex or `rgb()` colours in
   HTML and in lesson JS. Line count of the per-lesson `<style>` block, with
   the selectors it defines.
2. **Typography in practice.** Which classes carry the lesson title, section
   heads, subheads, body prose, captions, table text and callout text. Every
   computed size that differs from the token scale. Every element that falls
   back to an unset font.
3. **Component catalogue.** For each recurring element, list every distinct
   implementation and where it appears: section tag, callout or anchor card,
   predict or commit box, reveal box, data table, figure frame and caption,
   sim box, preset button, slider, readout tile, status pill, legend box,
   glossary term. For each, show the differences across books (font, size,
   radius, border, padding, colours).
4. **Layout rhythm.** Section padding, the gap between sections (bio shows
   empty bands of about 12rem; see `section { padding: var(--beat) ...}`),
   column widths, and anything wider than its column at 360px and 1280px.

End with a ranked list: the components whose variants cause the most visible
inconsistency, and a proposed canonical version of each (taken from whichever
existing variant is best, with file references).

### 2B. Simulation audit: **docs/plans/audit/sim-audit.md** (new)

Score every canvas or parameter-driven sim against the Sim Standard
(Appendix A), using the scope in D4. One section per sim:
- Book, lesson, sim heading, files and functions.
- Each standard item: **pass / fail / partial**, with the code line or the
  missing element as evidence.
- Science and logic flags (do not fix): anything where the model contradicts
  the lesson, readouts disagree with the visuals, or the start state
  contradicts itself.
- Recommendation: **keep**, **repair** (list fixes) or **redesign**.
- For repair or redesign: a draft one-paragraph brief covering what it shows,
  what the student changes, what they predict and record, what they should
  see, and the question it answers.

Seed the report with the verified findings below (S1 to S9). Do not re-derive them.

### 2C. Content level and register audit: **docs/plans/audit/content-level-audit.md** (new)

David's judgement: the explanatory resolution is too high for general high
school, and the register is off, in bio and possibly in the other books.
The audit measures this against fixed yardsticks, so the result does not rest on
the auditor's taste.

**Yardsticks, per lesson.**
1. **The NGSS PE the lesson serves.** Take it from the book's `lessons.json`
   or the lesson header. Quote its clarification statement and its
   **assessment boundary** (from the NGSS standards text). Content beyond the
   boundary is "above level". The bio Unit 1 sheet is
   `public/bio/References/U1 Homeostasis.html`. Chem and physics have no
   References folder; use the PE codes in their manifests.
2. **The course tier in `docs/textbook/VOICE.md`** (section 7, "Tiered course register architecture"). All
   three books are Tier 3 (general high school): sentences of 12 to 18 words,
   MCQ options of 22 words or fewer, standard terms anchored to observable
   phenomena.
3. **`docs/textbook/VOICE.md`** and its STE rules (section 8): active voice,
   one idea per sentence, no stacks of more than 3 nouns, "because" rather than
   "since", no empty intensifiers.

**For each lesson, report:**
- **Above-level concepts:** every term or mechanism beyond the assessment
  boundary, with a location and count, and a suggested course-level
  replacement. Example: "V2 G-protein coupled receptors ... cAMP signalling
  cascade" becomes "ADH tells the kidney to put more water channels in place".
  The replacement is a suggestion; David decides.
- **Register:** sentences over the tier cap (count, plus the 5 worst); noun
  stacks; passive voice that hides the actor; nominalisations (for example "the
  exocytosis of ADH" becomes "the pituitary releases ADH").
- **Where the sims and checkpoints depend on above-level content.** Example:
  1-4 sim labels and the "GLUT4" checkpoint answer. A rewrite has to change
  these together.
- **Verdict per lesson:** at level, light edit, or heavy rewrite.

**Seed list (bio, counted 2026-10-08 across lesson HTML and JS):** GLUT 27,
hepatocyte 11, myofibril 10, hypertonic 10, Langerhans 5, endocytosis 4,
interstitium 4, exocytosis 3, translocate 3, medullary 3, vasomotor 3, VO2 3,
cAMP 2, sarcoplasm 2, perfusion 2, caliber 2, G-protein 1, Krebs 1,
vasopressin 1, hydrolysis 1. Also flagged by David: GLUT4 on the liver panel (S9).

**Do not rewrite anything in Phase 2.** Content belongs to David. The audit
proposes rewrites, and Phase 3 sets the policy.

### Phase 2 handoff

Hand the three reports to David. Phase 3 (writing the standard and approving the
briefs) is not for the implementing agent.

### Decisions David made after the audit (2026-10-12)

These are inputs to Phase 3. Do not re-ask them. The audit reports are in
`docs/plans/audit/`; the questions they posed at the end of each Part are
answered here, except where noted.

1. **Boundary policy.** Content past a PE's assessment boundary stays, tagged
   "Enrichment" (the device already on chem 4-1a and 3-4a). The core of each
   lesson stays at PE level. All three books. A "heavy rewrite" verdict now
   means "restructure so the core is at PE level and tag the rest".
2. **Feedback voice.** Feedback opens with the reason. Drop "Correct!",
   "Incorrect.", "Perfect!" and exclamation marks in all three books.
3. **Multiple choice.** Rebalance during each lesson's edit: spread the key
   across A, B and C, keep option lengths within 1.8x (CLAUDE.md), and cap
   options at the Tier 3 limit. David reviews the changed questions.
4. **Physics theme.** Keep the book title and mission names. Instructions,
   feedback and explanations use the plain teacher register (no "Cadet
   Directive" or "Boss Challenge" labels in working text).
5. **Physics 1-3.** Keep. Tag sections 03 to 05 and the review's projectile
   problem as Enrichment.
6. **Physics trigonometry.** Not assumed. Tag 2-1 Mission 4, 2-2 component
   equations, and 2-4 tilted coordinates and critical angle as Enrichment.
7. **Physics 2-3.** Add a short core momentum-conservation section (two bodies,
   1D) and a total-momentum readout in the sim, so the HS-PS2-2 tag is true.
8. **Bio vocabulary.** Organ and hormone names (hypothalamus, pituitary,
   pancreas, insulin, glucagon, ADH) stay as core and are defined in the
   glossary. Cell-level detail (GLUT, hepatocyte, aquaporin vesicles, cAMP)
   goes to Enrichment or is cut.
9. **Bio review.** Remove "30-32 ATP", Complex IV and the citric acid cycle from
   core.
10. **Scoring guides.** Keep mark totals. Rewrite rubric lines as short
    teacher-voice checklists (under 20 words, one idea per line), hidden until
    an attempt.
11. **Chem core versus Enrichment.** Core: naming IMFs (1-3b), limiting reactant
    (2-7c). Enrichment: Roman numerals for transition metals (1-2c), the
    bond-energy sum for ΔH (3-14a).

**Not yet decided; Phase 3 should ask, one at a time:** chem 4-1b (enzymes) and
4-6b (blood buffers) are covered by decision 1 (tag as Enrichment, keep the
inorganic-catalyst and Le Chatelier core), but David has not seen the proposed
split; chem unit 5 (ESS and nuclear) likewise; bio 1-1 sim rebuild (D6) and the
other sim redesign briefs are Phase 3 deliverable 3; the "Enrichment" tag needs
one visual and markup design (a component in the standard).

---

## Phase 3: Standard, runtime spec and governance (Opus with David; done 2026-10-13)

Not for the implementing agent. Run with `/plan-first`. Inputs: the three
audit reports. Deliverables, each approved by David:

1. **One textbook guide.** Merge the shared parts of `TEXTBOOK_DEV_GUIDE.md`,
   `PHYSICS_DEV_GUIDE.md` and `BIOLOGY_DEV_GUIDE.md` into
   **docs/textbook/STYLE_STANDARD.md** (new). It covers the type scale
   application, layout rhythm, the canonical component catalogue (markup plus
   CSS), the Sim Standard (Appendix A, as amended), and the reading-level
   policy from 2C (Tier 3, PE-boundary rule, replacement glossary). Each book's
   guide shrinks to a short appendix: its accent colours, its special tools,
   and its PE list.
2. **Shared runtime spec** for **public/textbook/** (new): the file list, what
   moves out of chem's `core.js`, the public API (`data-widget` types, sim loop
   helper, theme key), what stays per book, and the order of moves.
3. **Per-sim briefs.** One paragraph for each sim marked repair or redesign:
   what it shows, what the student changes, predicts and records, what they
   should see, and the question it answers. Matter tracing for bio 1-1 (D6).
4. **Rewrite policy and plan** for above-level content: which lessons get
   which treatment, and whether rewrites go before or with each book's migration.
5. **Governance, so future work stays unified.**
   - A project skill **.claude/skills/textbook-work/SKILL.md** (new). It loads
     the standard and the checklists for any task under `public/chem/`,
     `public/physics/` or `public/bio/`, and for any new book. It replaces the
     per-book instructions in `CLAUDE.md`, which shrink to a pointer.
   - A "new textbook" recipe: a new book is tokens, glossary, lessons and
     manifest only, and it gets everything else from **public/textbook/** (new).
   - Guard tests, run in `npm run verify`:
     - undefined tokens in all books (from Phase 1);
     - a ratchet that fails if any lesson's count of inline `font-size`,
       `font-family`, or hex colours rises above its baseline, and that
       drops the baseline as migration proceeds;
     - every lesson canvas registered with the shared sim loop;
     - no lesson loads a per-book copy of a shared component;
     - the book's base rule is present.
   - `CLAUDE.md` and the dev guides updated in the same commit, replacing
     the rule that the books share no code.
6. **Phase 4 kickoff prompts**, written into the sessions file, one per book.

### Phase 3 outputs

| Deliverable | Where it is |
|---|---|
| 1. Style standard | [`STYLE_STANDARD.md`](../../textbook/STYLE_STANDARD.md) |
| 2. Runtime spec | [`RUNTIME_SPEC.md`](../../textbook/RUNTIME_SPEC.md) |
| 3. Sim briefs | [`textbook-sim-briefs.md`](../../plans/textbook-sim-briefs.md) |
| 4. Rewrite policy and plan | [`textbook-rewrite-plan.md`](../../plans/textbook-rewrite-plan.md) |
| 5. Governance | The `textbook-work` skill; `services/__tests__/textbookStandard.test.ts` and its baseline; the textbook section of `CLAUDE.md`; the three book guides |
| 6. Phase 4 prompts | [`textbook-consistency-sessions.md`](textbook-consistency-sessions.md) |

### Decisions David made in Phase 3 (2026-10-12 and 2026-10-13)

Settled. Do not re-ask them. Each is written into the document named.

1. **Enrichment** is a closed, dashed-outline block that the student opens. Its
   line reads "Extra depth. The rest of the lesson works without it."
   (standard, section 6).
2. **Every sim has a Record button and table** (Sim Standard, item 5).
3. **No "Continue" button between sections.** One "Next lesson" link at the end.
4. **Lesson header:** chem's full-screen hero with a hook sentence, in all
   three books. The 15 new bio and physics titles are accepted as drafted and
   get a second look in each review sheet (rewrite plan, section 7).
5. **Keyboard:** Page Up and Page Down step sections in all three books. Arrow
   keys and Space scroll.
6. **The specimen page** is a permanent test page in the shared folder.
7. **Chem 5-1a** loses its fusion animation. **Chem's five building tools**
   join the standard; only 2-2a and 2-7c get a prediction lock.
8. **The default values** for sims that disagree with their lesson are
   accepted (sim briefs, "Values the build must not guess").
9. **Core and Enrichment splits** accepted as proposed for chem 4-1b, 4-6b,
   5-1a, 5-3a, 5-4a and 5-8a; one Enrichment block each in bio 1-3 and 1-4,
   the rest of the cell-level detail cut; the tangent-line construction in
   physics 1-2 is Enrichment (rewrite plan, sections 3, 4 and 6).
10. **Six older documents** that stated the old arrangement were brought into
    line (README, VOICE.md, INTERACTION_SPEC.md, BUILDING.md, Appendix A here,
    CLAUDE.md's drift-guard list).

Two things differ from the deliverable list above:
- The chem guide did not shrink in Phase 3. Chem runs on its current code
  until session 4c, so its current rules stay. Section 0 of the guide lists
  which rules the standard has superseded; stage 1 of session 4c deletes them.
- The guard "every widget type has a print function" is written in session 4a,
  with the shared widget file it tests.

## Phase 4: Shared runtime and migration (Sonnet, reviewed by Opus; done 2026-10-26)

The prompts are in [the sessions file](textbook-consistency-sessions.md). Run
them in the order of this table. Each session updates its own row.

| Session | What it does | Push | Status |
|---|---|---|---|
| 4a | Builds **public/textbook/** (new) and moves bio onto it: markup, then content, then sims | none (local commits) | done (went live 2026-10-16, before review; see below) |
| 4R | Opus reviews 4a, fixes what David approved, then pushes | 1 | done (2026-10-22) |
| 4b | Physics: markup, content, sims | 1 | done (2026-10-23) |
| 4c stage 1 | Chem: the shared runtime and the new look, all 27 lessons, no word changes | 1 | done (2026-10-23) |
| 4c stage 2 | Chem content and sims, Unit 1 | 1 | done (2026-10-23) |
| 4c stage 3 | Chem content and sims, Unit 2 (it holds all five building tools) | 1 | done (2026-10-24) |
| 4c stage 4 | Chem content and sims, Unit 3 | 1 | done (2026-10-24) |
| 4c stage 5 | Chem content and sims, Unit 4 | 1 | done (2026-10-25) |
| 4c stage 6 | Chem content and sims, Unit 5 | 1 | done (2026-10-26) |

How a book moves:
- Three local commits: markup (no word a student reads changes), content, sims.
- The session adds the book to `migrated` in the markup commit and to
  `finished` after the sims commit. Both lists are in
  `services/__tests__/textbookStandard.baseline.json`, and each switches on
  stricter guard tests for that book.
- The session writes a review sheet of every changed question, Enrichment
  boundary and hero text. David edits or approves it before the push.
- Each push needs a green preflight and David's visual check.

Two copies of the widget framework exist from 4a until 4c stage 1. Chem's copy
is frozen for that time: a widget fix goes into the shared copy only.

### Pattern corrections from 4R

Written by session 4R (2026-10-22). Sessions 4b and 4c read this first; where it
disagrees with their prompt, this wins. Each item says what went wrong in 4a.
The review found 5 high, 9 medium and a list of low findings. David decided every
open point, and the fixes shipped in one push.

**What happened in 4a that must not happen again**
1. **Unreviewed commits went live.** 4a's local commits were pushed on
   2026-10-16 along with two unrelated fixes, before 4R. While a book's commits
   are local and waiting for review, nothing else is pushed to `main`. If
   something urgent must ship, stop and ask David first.

**The runtime now does these; use it, do not rebuild it** (`RUNTIME_SPEC.md` 4.3)
2. **The gate covers everything.** Before the prediction, the helper locks the
   stage, the controls and Record, and shows "–" in every readout. A sim's
   markup needs no extra work, but its first readout values must still be
   right for the moment it unlocks.
3. **Stopping on a data mark.** Call `sim.hold()` from `update` when the clock
   reaches a mark, and `sim.release()` from Start over and from every control
   that starts a new run. Never write a wall-clock workaround with
   `performance.now()`, and never tell a student to "press Pause to go on". The
   Pause chip reads Play while paused.
4. **Reduced motion.** Set `stepSeconds` on every sim so one Step press covers a
   useful stretch (a data mark in a few presses). The default 0.25 s made 1-3 need
   120 presses.
5. **The first frame is chosen.** A locked sim, and a print made before it runs,
   show the first frame. Make it show the model at work, and never the result
   the prediction asks for (1-1 printed an empty cell; its next draft showed
   the answer).

**Sims**
6. **Run the model headlessly before calling it done.** 4R found what reading
   missed only by running each model with its own constants: values that go
   negative when a control is pressed repeatedly (1-3), and a graph that piles
   up past its window (1-4). Clamp every quantity to the range its curve was
   fitted for, cap repeatable controls, and trim or scroll every history.
7. **A fitted curve is a science claim.** 1-4 fitted "Type 2" to a patient the
   table labels pre-diabetic, and its liver store grew faster than Healthy's.
   Before fitting a model to a table row, check that the row's own label says
   what the model claims; otherwise flag it as "For David".
8. **Colours.** No subject colour may share `--bad`'s value, because sims fill
   with subject colours. **Physics: in the light theme `--thermal` is
   `#DC2626`, the same as `--bad`, and physics defines `--bad` for the light
   theme only (standard 2.2). Fix both in 4b's markup commit** and list them on
   the sheet.
   An action that is not a toggle (Start over, Launch) is a `.btn.ghost`, not a
   chip. Every colour on the stage, including a bloodstream or a track, is in
   the legend.

**Content**
9. **Cutting a clause can change a claim.** Removing "(and cellular water
   during the citric acid cycle)" left a scoring line that the net equation
   cannot support. When a cut touches a sentence that makes a claim, re-read
   the claim and flag it if its meaning moved.
10. **Watch the chemistry in biology.** "Breaking bonds releases energy" was
    written into a key. Breaking bonds takes energy. Check every energy
    sentence against that.
11. **Feedback opens with the reason.** No "Right." either. A guard now fails
    on any verdict opener in a finished book, and the key spread is checked
    per lesson as well as per book.
12. **A brief's scenario name is a bold lead-in**, not an `h4`.

**The review sheet** (rewrite plan 1.3)
13. List every scoring-guide line old and new, and every changed feedback
    string, not a summary. 4a's summary hid two changed claims.
14. Draft numbers ("I chose 0.2 L a minute") go under "For David" with the
    reason, as 4a did well.

**Specs corrected by 4R** (all in commit 6017b80 or this one)
- `STYLE_STANDARD.md`: component titles are always `h4` (11.3); a figure a
  question reads gets a descriptive caption (5.2); the Alignment row stays
  verbatim NGSS (8.2.5); the gate, Play chip and step size (7.2, 7.19); chips
  versus buttons (5.4); `--bad` shares no value with a subject colour (2.2).
- `RUNTIME_SPEC.md`: the gate, hold and release, and `stepSeconds` (4.3);
  the old theme keys are written until 4c (5); four changes to the widget copy
  (6); token checks instead of an image baseline (8.2).
- Sim briefs: 1-3 closes its loop by drinking; 1-4's Type 2 is its own curve.
- The 4b and 4c prompts: there are no image screenshots to update.

**For 4c only**
- Port the widget strings change into chem's copy (`RUNTIME_SPEC` 9).
- When chem moves, delete `LEGACY_THEME_KEYS` in `core.js` and remove the old
  keys in `theme-boot.js`; the test in `textbookRuntime.test.ts` that requires
  them switches off by itself once chem and physics are migrated.

---

## Seed findings for the sim audit (verified 2026-10-08)

### S1. Shared defects across bio sims (`public/bio/lessons/1-1.js` to `1-4.js`)

| Defect | 1-1 | 1-2 | 1-3 | 1-4 |
|---|---|---|---|---|
| Motion advances per frame, not per second, so a 120Hz laptop runs at double the speed of a 60Hz Chromebook | yes | yes | yes | yes |
| Keeps animating off screen (not registered with `GC_REGISTER_ANIMATION`, against TEXTBOOK_DEV_GUIDE rule 19) | no | yes | yes | yes |
| Canvas text below 11px (7 to 9px) | yes | yes | yes | yes |
| Fonts not loaded by the book (`IBM Plex Sans`, `system-ui`) | yes | yes | yes | yes |
| Labels overlapped by drawings or particles | yes | yes | yes | yes |
| No student task tied to the sim | yes | yes | yes | yes |

### S2. Bio 1-1 respiration: particles jitter and teleport

In `RespirationParticle.update`, every stage recomputes
`startX/startY/endX/endY` with `Math.random()` **every frame**, and re-randomises
`this.speed` every frame. Each particle's path changes 60 times a second.

### S3. Bio 1-1: workload barely changes the picture

The readouts claim ATP output rises 4x and then 8.2x, but the particle count is
fixed at 55, and speed only goes from 1.35x to 2.65x. All particles start
in one stage, so the opening seconds show a smear.

### S4. Bio 1-1: layout collisions

"Metabolic Heat -> (37 deg C Core)" (drawn at `cx + 32`) runs into the
myofibril panel. ATP particles fly across it and across "Myosin Reset (ATP
Bound)". Inbound particles converge on a 40 x 30 px box at the
mitochondrion centre, on top of the "MITOCHONDRIAL MATRIX" badge. The swimmer
label overflows its box. ASCII stand-ins (`deg C`, `->`, `O2`) are used instead of
°C, →, O₂. At phone width, `cssHeight = max(340, w * 0.52)` makes the four
panels overlap.

### S5. Bio 1-1: controls

The preset buttons and the 3-step slider duplicate each other. The buttons use
inline styles that JS overwrites. The HTML says `85 W (Resting)`, and JS
replaces it with `85 W (Metabolic Baseline)`.

### S6. Bio 1-1: the model contradicts the lesson (D6 decided: rebuild to trace matter)

The callout above the sim says "Cells do not turn matter into energy." In the
sim, one O₂ or glucose particle enters the matrix and **becomes** one ATP,
CO₂ or H₂O particle at random (45% / 35% / 20%). Inputs are 80% O₂. Atoms are
not traced.

### S7. Bio 1-2 thermoregulation: the start state contradicts itself

`state.ambientTemp` starts at 18 °C, but "Comfort Zone (22°C)" is marked
`active` in the HTML. At 18 °C the model applies shivering: the canvas shows
"SHIVERING TREMORS (5%)", and metabolic heat reads 289 W while "Rest (85W)" is
selected. Yet the status pill says "HOMEOSTATIC EQUILIBRIUM". Label collisions:
the hair follicle line crosses the EPIDERMIS and DERMIS labels; the "Arteriole"
label sits on the vessel; "Hypothalamus" overlaps the head; "SHIVERING
TREMORS" crosses the legs.

### S8. Bio 1-3 osmoregulation

- ADH particles never move: `adhPeptides` get a `vx` that is never applied.
- Water dots are spread across the whole cell width on four rows
  (`px = progress * (w - 16)`), so they look scattered rather than passing
  through channels.
- When ADH is low, the channels are drawn as "AQP2" vesicles in the cytoplasm,
  yet water still streams on all four rows (whenever `aquaporinDensity > 40`).
- Urine flow is six short lines, and dilute and concentrated urine differ only by tint.

### S9. Bio 1-4 blood glucose (from screenshot; flag, do not fix)

- The liver panel is labelled "GLUT4 CLOSED". **Flag for David:** liver
  glucose uptake is usually taught as GLUT2 and insulin-independent, with GLUT4
  in muscle and fat. The lesson text uses GLUT4 too, so this is David's call.
- In Type 1 mode at 220 mg/dL, liver glycogen still reads 72%.
- An unlabelled green bar sits along the bottom of the circulation panel.

---

## Appendix A: Sim Standard (approved by David 2026-10-08 as the audit rubric; Phase 3 may amend)

> **Superseded 2026-10-12.** Phase 3 amended this list. The Sim Standard in
> force is [`STYLE_STANDARD.md`](../../textbook/STYLE_STANDARD.md), section 7
> (27 items). The list below is kept as the rubric the Phase 1 audit used.

Every textbook simulation, in any book, meets all of these.

**A. Student guidance** (text follows `VOICE.md` for the course tier)
1. **Question first.** One sentence above the sim names the question it answers.
2. **Predict before touching.** A commit-before-reveal prediction comes before
   the first interaction (`INTERACTION_SPEC.md`).
3. **Try this.** Two to four numbered steps, each starting with a verb, that
   name the control and the setting.
4. **What to look for.** For each step, what the student should see change,
   pointing at named, visible parts of the model.
5. **Use the evidence.** A follow-up question (commit box or MCQ) that can be
   answered only from what the sim showed.
6. **Legend.** Every symbol, colour and particle is identified in one legend
   placed with the sim.

**B. Scientific fidelity**
7. The model never contradicts the lesson text around it.
8. Conservation holds where it is the point (matter, energy, charge).
9. Readouts and visuals change in the same proportion.
10. The start state is consistent: the selected control, the model state, the
    readouts and the status text all agree.

**C. Motion and runtime**
11. One `requestAnimationFrame` loop, time-based (`dt` in seconds, clamped).
12. Registered with `GC_REGISTER_ANIMATION`, so it stops off screen.
13. Particle paths are chosen once per leg, never re-randomised each frame.
    Pre-warm the scene so the first frame is not a clump.
14. Speeds are readable: a student can follow a single particle.

**D. Visual consistency**
15. Uses the shared sim shell: stage, then controls, then readout tiles, then
    legend, in one order with the same classes in every book.
16. One control per variable (no button row duplicating a slider). The active
    state uses a class, not inline styles set from JS.
17. Colours come from tokens. Canvas reads them with `getComputedStyle` and
    redraws on theme change. No hex values in lesson HTML.
18. Canvas text is at least 11px, in the book's loaded fonts, with Unicode
    notation (O₂, °C, →).
19. No label overlaps another label, a drawing or a particle path, at any
    width from 360px to 1280px. Label boxes are sized with `measureText`.
20. Works at 360px (stacked layout below 600px) and in both themes.

**E. Accessibility**
21. Buttons are `<button>` elements with `aria-pressed` for toggles. Sliders
    have labels. Readouts sit in an `aria-live="polite"` region. Touch targets
    are at least 44px.
