# Page and component audit (2A)

Phase 2 of [the consistency plan](../textbook-consistency-fixes.md). Read-only.
Bio first, then physics, then chem. Each book is appended as it is finished.

**Status:** all three books done (bio, physics, chem). Cross-book ranking at the end.

## Method and conventions

- **Counts come from a throwaway script** that parses each lesson file (kept
  outside the repo). Inline `style=` counts match the plan's baseline: bio totals
  271. A `style=` attribute is counted once per property family it contains, so
  the property columns add up to more than the attribute total.
- **Citations.** Lesson HTML is cited as `1-2.html:238`, lesson JS as
  `1-2.js:319`, within `public/bio/lessons/`. Stylesheets are cited as
  `components.css:114` within `public/bio/assets/`. Line numbers are from
  commit `59ef11b`.
- **Layout and overflow claims** come from reading the HTML and CSS and doing
  the arithmetic, not from a browser. They say "by calculation". David should
  confirm any that matter at 360px.
- **Content belongs to David.** Nothing here changes copy. Wording and science
  flags appear in the 2B and 2C reports.
- Zero em-dashes were found in any bio lesson, stylesheet or script. Three
  en-dashes exist in numeric ranges (`1-4.html:370`, `1-review_packet.html:252`
  and `:262`). The house rule bans em-dashes only, so these are noted, not flagged.

---

# Part 1: Bio (`public/bio/`)

Five pages: four lessons and the unit review (`1-review_packet.html`).
Shared files: `tokens.css` (128 lines), `components.css` (1,164 lines),
`core.js` (421 lines), `glossary.js` (27 terms).

## 1. Inline styling inventory

| Lesson | inline `style=` | font-size | font-family | color | background | padding | margin | border | layout (display/flex/grid) | hex in HTML | rgb() in HTML | `<style>` lines | hex in `<style>` | inline `<script>` lines | hex in inline script | lesson JS lines | hex in JS | rgba in JS | JS `.style.` writes |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 1-1 | 54 | 23 | 18 | 26 | 19 | 20 | 17 | 19 | 13 | 11 | 0 | 0 | 0 | 9 | 0 | 801 | 76 | 31 | 12 |
| 1-2 | 49 | 15 | 2 | 15 | 8 | 11 | 25 | 12 | 12 | 4 | 0 | 75 | 4 | 62 | 10 | 634 | 55 | 14 | 0 |
| 1-3 | 48 | 14 | 3 | 16 | 8 | 9 | 24 | 11 | 9 | 7 | 0 | 70 | 3 | 62 | 10 | 483 | 50 | 14 | 0 |
| 1-4 | 53 | 17 | 1 | 19 | 8 | 10 | 27 | 13 | 10 | 11 | 0 | 75 | 4 | 62 | 10 | 516 | 56 | 6 | 0 |
| 1-review | 67 | 35 | 12 | 15 | 1 | 13 | 32 | 5 | 11 | 1 | 0 | 28 | 2 | 23 | 0 | - | - | - | - |
| **Total** | **271** | **104** | **36** | **91** | **44** | **63** | **125** | **60** | **55** | **34** | **0** | **248** | **13** | **218** | **30** | **2,434** | **237** | **65** | **12** |

Reading the table:

- **Every lesson restyles the same things by hand.** Margins (125) and
  font-size (104) are the largest groups. Nearly all of them are repeats of a
  handful of patterns (the telemetry tile, the checkpoint heading, the card
  wrapper), so a small component set would remove most of the 271.
- **Hex colours in HTML (34) sit in three places:** readout and legend colours
  in 1-1 (`1-1.html:202-226`, four distinct hex values), SVG bar fills in the
  Figure 1.1 graph (`1-1.html:434`, `:438`, `:442`), and per-card accent colours
  in 1-2, 1-3 and 1-4 (`1-2.html:238-248`, `1-3.html:258`, `:264`, `:300-312`,
  `1-4.html:202-213`, `:276-279`, `:313-325`). None of them has a dark-mode
  variant, so each is tuned for one theme.
- **Hex colours in inline `<script>` (30)** are the checkpoint feedback boxes.
  `1-2.html:469-495`, `1-3.html:504-530` and `1-4.html:507-533` build
  `innerHTML` strings with `#10B981`, `#065F46`, `#EF4444`, `#991B1B`,
  `#E11D48` and `rgba()` backgrounds. The green and red boxes cannot follow the
  theme.
- **Lesson JS (237 hex, 65 rgba)** is canvas drawing. See the 2B report. No sim
  reads a colour token with `getComputedStyle` (0 calls in all four files).
- **Only 1-1 writes inline style from JS** (12 writes: preset button states
  at `1-1.js:88-94` and matter-select states at `1-1.js:777-782`). The three
  later sims use a class toggle (`.active`), which is the better pattern.
- **Sizes in inline `font-size` are all tokens**, except three `pt` values in
  the review's print header (`1-review_packet.html:116`, `:119`, `:123`). No raw
  `px` or `rem` font sizes were found in lesson HTML.

### Per-lesson `<style>` blocks

| Lesson | Lines | Selectors defined |
|---|--:|---|
| 1-1 | 0 | none (all styling is inline) |
| 1-2 | 75 (`1-2.html:21-96`) | `.thermo-dashboard-grid`, `.thermo-telemetry-card`, `.thermo-telemetry-label`, `.thermo-telemetry-val`, `.status-pill` (+ `.cold`, `.hot`, `.neutral`), `.preset-pill-btn` (+ `:hover`, `.active`) |
| 1-3 | 70 | `.osmo-dashboard-grid`, `.osmo-telemetry-card`, `.osmo-telemetry-label`, `.osmo-telemetry-val`, `.status-pill` (+ 3 variants), `.action-pill-btn` (+ `:hover`) |
| 1-4 | 75 | `.glucose-dashboard-grid`, `.glucose-telemetry-card`, `.glucose-telemetry-label`, `.glucose-telemetry-val`, `.status-pill` (+ 3 variants), `.action-pill-btn` (+ `:hover`, `.active`) |
| 1-review | 28 (`1-review_packet.html:22-48`) | `.review-print-header`, `.print-workspace`, `.print-hide`, `.scheme` (print rules; hex `#999999` at `:28`, `#000000` at `:35`) |

**The 1-2, 1-3 and 1-4 blocks are copies.** After renaming the `thermo-`,
`osmo-` and `glucose-` prefixes and the two button names, 93% to 99% of their
lines are identical. The `.status-pill` rules (including three hex colours and
three `rgba()` backgrounds) and the telemetry tile are defined three times. The
button is defined as `.preset-pill-btn` in 1-2 and `.action-pill-btn` in 1-3 and
1-4 for the same job.

## 2. Typography in practice

Body is Spectral at 20px (`tokens.css`, `body` rule, after Phase 1). The scale
tokens are defined (`tokens.css:34-47`). `--text-reading` (22px) is defined but
no lesson uses it.

### Which classes carry which role

| Role | Class | Computed size | Face | Where defined |
|---|---|---|---|---|
| Lesson title | `h1.lesson-title` | 30px to 36px (`clamp`) | Hanken Grotesk 800 | `components.css:82` |
| Subtitle | `.lesson-subtitle` | 18px | Hanken | `components.css:91` |
| Section head | `h2.section-head` | 24px to 30px (`clamp`) | Hanken 700 | `components.css:98` |
| Subhead | `h3.subhead` | 20px | Hanken 600 | `components.css:106` (used only in the review) |
| Body prose | `p.prose`, `p.step` | 20px, line height 1.7 | Spectral | `components.css:114` |
| Lead | `p.lead` | 18px | Spectral 500 | `components.css:121` (no lesson uses it) |
| Callout body | `.callout p` | 16px | Spectral | `components.css:161` |
| Caption | `.diagram-cap` | 14px | Spectral | `components.css:404` |
| Table text | `.ref-table` | 12px | IBM Plex Mono | `components.css:1017` |
| Checkpoint stem | `.predict-prompt` (1-1) | 16px | Spectral | `components.css:624` |
| Checkpoint stem | `p.prose` with inline `font-size:var(--text-sm)` (1-2 to 1-4) | 14px | Spectral | `1-2.html:358` and 5 more |
| Checkpoint option | `.predict-opt` (1-1) | 16px | Hanken | `components.css:637` |
| Checkpoint option | `label.check-opt` (1-2 to 1-4) | **20px, unstyled** | Spectral | class is not defined anywhere |
| Reveal text | `.reveal-box p` | 16px | Spectral | `components.css:739` |
| Reveal text | `.feedback-box` (1-2 to 1-4) | **20px, unstyled** (inline-styled child) | Spectral | class is not defined anywhere |
| Readout tile | inline (1-1) | label 9px, value 14px | IBM Plex Mono | `1-1.html:201-214` |
| Readout tile | `.*-telemetry-*` (1-2 to 1-4) | label 12px, value 20px | Hanken / Plex Mono | `1-2.html:36-50` |
| Status pill | `.status-pill` | 12px | Plex Mono | `1-2.html:51` |

### Every size that differs from the body or from its sibling

- **The same job has different sizes in different lessons.** The question a
  student must answer is 16px in 1-1 (`.predict-prompt`) and 14px in 1-2, 1-3
  and 1-4 (`1-2.html:358`, `:384`, `1-3.html:394`, `:420`, `1-4.html:397`,
  `:423`), while the paragraphs around it are 20px. This is the "mismatched text
  sizes" David saw.
- **Headings below body size.** The checkpoint `<h3>` is 18px (`--text-md`,
  `1-2.html:355`), smaller than the 20px paragraph under it. Card `<h3>`s in 1-2
  and 1-4 are 14px (`1-2.html:239`, `:248`, `1-4.html:203`, `:213`). Two
  different classes (`.subhead` at 20px and the unclassed inline `<h3>`) fill the
  same slot.
- **Lead text is smaller than prose.** `p.lead` is 18px against 20px prose
  (`components.css:121` against `:114`). Already on David's open list.
- **Lists do not match paragraphs.** `p.prose` is selected as `p.prose`, so
  `<ul class="prose">` (`1-1.html:138`, `1-2.html:201`, `1-3.html:229`) gets none
  of the prose rule. It renders at the body colour `--ink` and line height 1.62,
  while paragraphs use `--ink-soft` and 1.7.
- **Text below 11px.** 1-1 has four 9px tile labels (`--text-3xs`,
  `1-1.html:201`, `:205`, `:209`, `:213`). `RENDERING_GOTCHAS.md` sets 11 to 12px
  as the floor for labels.
- **Print header in points.** `20pt` and `10pt` (`1-review_packet.html:116`,
  `:119`, `:123`) are the only non-token sizes in lesson HTML.
- **Line length.** `.narrow` is 52rem (832px). At 20px Spectral that is about 90
  characters per line (estimated from font size, not measured). That is long for
  reading.

### Elements that fall back to an unset font

Phase 1 fixed the Times fallback by giving `body` the serif. What remains is
elements that inherit the serif where the design wants the display face, because
no class sets one:

- Unclassed `<h3>` inside cards and checkpoints (`1-2.html:239`, `:355`, `:381`,
  `:422`; similar in 1-3, 1-4). They render in Spectral. `.subhead` and
  `.section-head` use Hanken.
- `<label class="check-opt">` and its `<span>` (`1-2.html:362-373`), the
  checkpoint options. Spectral 20px, no card or hover state.
- `<ul>` and `<li>` inside the two-column cards (`1-2.html:240`, `:249`). They
  carry inline size and colour but no face, so they are Spectral.
- Form controls. `<select class="matter-select">` sets its face inline
  (`1-1.html:347`), `input[type=range]` is untouched, `<textarea>` gets one from
  `.commit-textarea`. Nothing else is missing.

## 3. Component catalogue

Each row lists every implementation found in bio. Differences across books are
filled in after physics and chem are audited (Parts 2 and 3).

| Component | Implementations in bio | Where | Differences |
|---|---|---|---|
| **Section tag** | `.section-tag` with `.num` and `.tag-label` | all lessons | One implementation. Review uses the same classes with a text `REVIEW` in `.num` (`1-review_packet.html:133`). |
| **Lesson header** | `h1.lesson-title` + `.lesson-subtitle` | all lessons | One. The review hides it behind `.print-hide`. |
| **Anchor / scenario card** | `.anchor-brief` + `.anchor-badge` + `.anchor-meta` | 1-1 (twice), 1-2, 1-3, 1-4 | Same class. 1-1 adds inline overrides for the lab card (`1-1.html:401`, `:403`). The "Target Standards" line is an inline-styled `p.prose` at 14px (`1-2.html:177`). |
| **Callout** | `.callout` + `.callout-title` | all four lessons | Same class, but 1-2, 1-3, 1-4 add `style="border-left-color:var(--accent)"`, which is already the default. 1-1 also uses `.callout` as an interactive card (`1-1.html:338`) with inline overrides. The icon is an inline `<svg>` copied into each lesson (`1-1.html:146`). |
| **Predict / checkpoint box** | **A:** `.predict-box` + `.predict-opt` buttons, wired by `core.js` (`core.js:152`). **B:** `.check-box` + `label.check-opt` radios, wired by an inline `<script>` in each lesson. | A: 1-1 (3). B: 1-2, 1-3, 1-4 (2 each), review (5 problem frames) | Two systems. **B's three classes (`check-box`, `check-opt`, `feedback-box`) have no CSS anywhere**, so the checkpoint has no card, no padding and no option styling (found by comparing every class used against `tokens.css`, `components.css` and the `<style>` blocks). A has 4 options, B has 3. A runs commit-before-reveal in `core.js`. B repeats the handler per question inside the lesson. |
| **Reveal box** | **A:** `.reveal-box` (class toggle, green, in `components.css`). **B:** `.feedback-box` with an inline-styled child built in JS. **C:** `.scheme` shown by an inline-script toggle. **D:** `.scheme-toggle-btn` handled in `core.js` | A: 1-1. B: 1-2, 1-3, 1-4. C: 1-2, 1-3, 1-4, review. D: nowhere | Four mechanisms for one job. D is dead code (`core.js:260`). B and C show the answer with no attempt: the scoring-guide button works with an empty text box (`1-2.html:432`), which `RENDERING_GOTCHAS.md` lists as a shipped bug ("A reveal button that works before the student has tried"). A only opens after a selection, as the spec requires. |
| **Free-text commit** | `.commit-textarea` + `.w-progress-hint` | 1-1 only (`1-1.html:467-472`) | The hint reads "Type at least 40 characters", a character count, which `INTERACTION_SPEC.md` 3.1 says the gate must never show. `core.js:206-212` swaps in "Keep reasoning..." but the label starts as a number. |
| **Data table** | `.ref-table` (built for the reference drawer) | 1-3, 1-4, review | Reused with inline overrides: `font-family:var(--display); font-size:var(--text-xs)` (`1-3.html:326`, `1-4.html:339`, `1-review_packet.html:186`, `:229`). Default is Plex Mono 12px. No caption, no `<caption>`, no zebra. |
| **Figure frame and caption** | `.figure.figure--md > .diagram > svg + .diagram-cap` | 1-1 (one figure) | One implementation. The caption is a descriptive sentence ("Figure 1.1: Mean time for 10 spinach leaf discs to float..."), but the house style is a lowercase takeaway (`VOICE.md` section 4). |
| **Sim box** | **A:** `.sim-box` > `.sim-stage` > canvas, `.sim-controls`. **B:** inline-styled `<div>` (`background`, `border`, `border-radius:12px`, `padding:1.25rem`, `margin`). | A: 1-1. B: 1-2, 1-3, 1-4 | B's radius is 12px against 8px in `.sim-box`. B's canvas wrapper is another inline div (`1-2.html:304`). The order differs: 1-1 is stage, controls, tiles, legend (matches Appendix A); 1-2 to 1-4 are presets, controls, canvas, status, tiles. |
| **Preset / action button** | `.btn-preset` (1-1, inline), `.preset-pill-btn` (1-2), `.action-pill-btn` (1-3, 1-4) | 4 lessons | Three class names, three radii (4px, 6px, 6px), three paddings. 1-1's active state is written to inline style from JS (`1-1.js:88-94`). The pill buttons are about 29px tall (12px text, 0.35rem padding), below the 44px target. |
| **Slider** | `.sim-slider` (1-1), bare `input[type=range]` with inline `width` and `accent-color` (1-2, 1-3) | 3 lessons | Same appearance. 1-3's slider has no associated `<label>` (the text above it is a plain `<div>`, `1-3.html:275`). 1-4 has no slider. |
| **Readout tile** | **A:** inline `div` (paper background, 6px radius, 9px label, 14px value). **B:** `.*-telemetry-card` (card background, 8px radius, 12px label, 20px value, centred) | A: 1-1. B: 1-2, 1-3, 1-4 (three copies) | Different size, background, radius and alignment. A hard-codes four value colours. B reuses the card class as a general bordered card for the cold/heat lists (`1-2.html:238`). |
| **Status pill** | `.status-pill` + `cold` / `hot` / `neutral` | 1-2, 1-3, 1-4 (three copies in `<style>`) | Hex and `rgba()` per theme-blind colour. 1-1 has no pill. The 1-4 pill uses "hot" for Type 1 and Type 2 pathologies (`1-4.js:147`, `:149`), which is a class name about temperature. |
| **Legend** | Inline box "How to Read This Model" | 1-1 only (`1-1.html:219-228`) | 1-2, 1-3, 1-4 have no legend. |
| **Recall blanks** | `.recall-section` + `input.blank`, `core.js:229` | 1-1 only | One implementation. Answer matching is exact lowercase, so `ATP` and `atp` both pass but `carbon-dioxide` fails. |
| **Matter-select** | inline `<select class="matter-select">` grid | 1-1 only (`1-1.html:344-380`) | `matter-select` has no CSS. All styling is inline (4 near-identical rows). |
| **ECR / exam card** | **A:** `.exam-frame` + `.exam-badge` + `.exam-prompt` (1-1). **B:** inline-styled card with `button.btn-secondary[data-scheme]` and `.scheme` (1-2, 1-3, 1-4) | 4 lessons | Same job, two builds. A is a free-text commit. B is a read-only rubric button. |
| **Glossary term** | `strong.term` + `data-term` | all lessons (1-1: 5, 1-2: 3, 1-3: 5, 1-4: 4) | One implementation. `core.js` finds the entry by slug. **Three terms in 1-3 have no glossary entry** (`osmosis` `1-3.html:193`, `osmoreceptor` `:231`, `aquaporin-2` `:233`), so they get the dashed underline and a pointer cursor but show nothing. Review packet has no terms. |
| **Next button** | `.next-action` > `a.next-btn` | all lessons | One. The review uses `a.btn-primary` instead (`1-review_packet.html:435`). |
| **Top bar** | `.topbar`, `.toc-btn`, `.print-btn`, `.theme-toggle` | all | One implementation, copied as 78 lines of HTML into every lesson (identical in all five apart from the crumb). |
| **Reference drawer** | `.ref-drawer*` CSS, `core.js:273` | nowhere | Dead in bio. About 130 lines of CSS and the handler have no markup. `.ref-table` survives only because lessons borrowed it. |

## 4. Layout rhythm

- **Section padding.** `section { padding: var(--beat) var(--gutter) }` with
  `--beat: clamp(2.75rem, 8vh, 6rem)` (`components.css:42`, `tokens.css`
  rhythm line). Each side is 44px to 96px, so adjacent sections leave **88px to
  192px (5.5rem to 12rem)** between content. On a 900px-tall window the gap is
  144px. The bands are the empty space David reported. Callouts and cards
  inside a section use 1.5rem to 2rem margins, so the gap between sections is
  five to ten times the gap between components.
- **Review packet.** It breaks the pattern: `<main style="padding-top:2rem">`
  (`1-review_packet.html:109`) and `<section style="padding:1.5rem 0">`
  (`:158`, `:276`). The same book therefore has two rhythms.
- **Column width.** `.narrow` is 52rem (`tokens.css` `--prose`). `.wrap` (78rem)
  is defined but unused in all five pages. Figures are `--fig-md` (34rem) and
  centre inside the 52rem column. The sim box fills the full column.
- **Gutter.** `clamp(1.25rem, 5vw, 4rem)`. At 360px it is 20px.

### Wider than its column

By calculation, not measured:

| Width | Item | Why |
|---|---|---|
| 360px | 1-2 "Exertion" row (`1-2.html:293-298`) | The row (`display:flex`, no wrap) holds a label and three pills, about 370px of content in a card about 278px wide. It overflows the card, and `body{overflow-x:hidden}` hides the spill, so the Sprint button is clipped. |
| 360px | 1-2, 1-3, 1-4 canvas labels | Panels are 28% to 58% of 278px. Headers such as `SUBCUTANEOUS ADIPOSE (Insulating Fat Layer)` (`1-2.js:276`, about 260px of text in a 161px panel) and `COLLECTING DUCT EPITHELIUM` (`1-3.js:274`, about 175px in a 122px panel) run into the next panel, which then paints over them. Details are in the 2B report. |
| 360px | 1-1 canvas | `cssHeight = max(340, w * 0.52)` (`1-1.js:36`) holds the height at 340px while four panels share 278px of width. |
| 1280px | none found | `.narrow` caps at 832px. Tables scroll inside an `overflow-x:auto` wrapper (`1-3.html:325`, `1-4.html:338`, `1-review_packet.html:185`). |

## 5. Bio ranking (provisional)

The final ranking waits for the other two books. Bio's contribution, worst
first:

1. **Checkpoint and reveal system.** Two builds plus two reveal variants plus a
   dead handler. Three classes have no CSS at all. The reveal works without an
   attempt in the ECR cards. This is the most visible inconsistency inside the
   book and the one that costs students the most (1-2 to 1-4 have no card,
   no option styling and no commit gate).
   *Canonical:* the `.predict-box` family with `core.js` handling (`core.js:152`,
   `components.css:610-745`). It already has a commit gate, a state machine and
   theme-aware colours.
2. **Sim shell and readout tiles.** Three copies of one stylesheet, three class
   names for the button, two tile designs, and 1-1 in a fourth style.
   *Canonical:* `.sim-box > .sim-stage + .sim-controls` from `components.css:508`
   for the shell (its order matches Appendix A), the `.*-telemetry-card`
   (12px label, 20px value) for the tile, `.preset-pill-btn` with a class-based
   `.active` for the button, and one `.status-pill`. Rename them without the
   lesson prefix.
3. **Status pill and feedback colours.** Hex and `rgba()` in three style blocks
   and three inline scripts. *Canonical:* one `.status-pill` built on `--good`,
   `--bad`, `--warn`, `--cool` (all defined in `tokens.css`).
4. **Question and option typography.** 14px stems beside 20px prose, 18px and
   14px headings, 20px unstyled options. *Canonical:* `.predict-prompt` (16px)
   and `.predict-opt` as a reference, but the size itself is a Phase 3 decision
   (stems should probably read at prose size).
5. **Data table.** One drawer table with inline overrides in every use.
   *Canonical:* a `.data-table` that sets display face and 14px, with a caption.
6. **Section rhythm.** One `--beat` that is too large between sections and a
   second hand-set rhythm in the review. *Canonical:* a single smaller gap
   token, applied to the review too.
7. **Dead code.** The reference drawer CSS and handler, `.scheme-toggle-btn`,
   `[data-next]`, `.wrap`, `p.lead` and `--text-reading` have no consumers in
   bio. Removing them is a Phase 4 task.

## Questions for David (bio, page level)

- Should checkpoint stems read at prose size (20px) or stay smaller?
- The bar graph colours in Figure 1.1 (`1-1.html:434-442`) are hex and do not
  change in dark mode. Is a fixed palette intended for data graphs?
- Is the unused reference drawer meant for bio later, or should it go?

---

# Part 2: Physics (`public/physics/`)

Ten pages: eight lessons and two review packets. Shared files: `tokens.css`
(135 lines), `components.css` (1,108 lines), `core.js` (361 lines),
`reference-center.js` (390 lines), `glossary.js`. In this part, lesson HTML is
cited as `2-2.html:327` and lesson JS as `2-2.js:270`, within
`public/physics/lessons/`.

**Physics components.css is bio's file with three renames** (`.mission-brief`
for `.anchor-brief`, no `.bio-display`, no `.bio-tooltip`). The tokens differ
only in colour. The two books therefore share class names and CSS, but their
JavaScript contracts differ (see the checkpoint row below).

## 1. Inline styling inventory

| Lesson | inline `style=` | font-size | font-family | color | background | padding | margin | border | layout (display/flex/grid) | hex in HTML | rgb() in HTML | `<style>` lines | hex in `<style>` | inline `<script>` lines | hex in inline script | lesson JS lines | hex in JS | rgba in JS | JS `.style.` writes |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 1-1 | 68 | 32 | 30 | 32 | 13 | 19 | 26 | 15 | 19 | 1 | 0 | 0 | 0 | 9 | 0 | 545 | 25 | 4 | 11 |
| 1-2 | 67 | 34 | 23 | 25 | 8 | 7 | 29 | 11 | 19 | 1 | 2 | 0 | 0 | 9 | 0 | 586 | 20 | 7 | 5 |
| 1-3 | 119 | 60 | 17 | 33 | 19 | 21 | 56 | 20 | 39 | 3 | 0 | 121 | 0 | 9 | 0 | 753 | 23 | 6 | 14 |
| 1-review | 29 | 10 | 9 | 11 | 1 | 9 | 13 | 5 | 1 | 1 | 0 | 25 | 2 | 9 | 0 | - | - | - | - |
| 2-1 | 110 | 57 | 23 | 47 | 16 | 25 | 52 | 18 | 20 | 4 | 0 | 0 | 0 | 9 | 0 | 562 | 17 | 2 | 6 |
| 2-2 | 105 | 60 | 26 | 47 | 19 | 27 | 51 | 20 | 14 | 2 | 0 | 0 | 0 | 9 | 0 | 556 | 12 | 2 | 1 |
| 2-3 | 90 | 49 | 21 | 38 | 16 | 21 | 45 | 17 | 13 | 3 | 0 | 0 | 0 | 9 | 0 | 732 | 23 | 2 | 1 |
| 2-4 | 100 | 54 | 24 | 38 | 18 | 30 | 49 | 19 | 15 | 3 | 0 | 0 | 0 | 9 | 0 | 729 | 21 | 2 | 2 |
| 2-5 | 88 | 48 | 19 | 33 | 14 | 25 | 40 | 15 | 15 | 2 | 0 | 0 | 0 | 9 | 0 | 788 | 24 | 2 | 7 |
| 2-review | 22 | 4 | 8 | 10 | 0 | 10 | 12 | 4 | 1 | 1 | 0 | 25 | 2 | 9 | 0 | - | - | - | - |
| **Total** | **798** | **408** | **200** | **314** | **124** | **194** | **373** | **144** | **156** | **21** | **2** | **171** | **4** | **90** | **0** | **5,251** | **165** | **27** | **47** |

(The 9 inline-script lines per page are the theme bootstrap in `<head>`; there
are no inline checkpoint handlers in physics.)

Reading the table:

- **Level 2 lessons carry 88 to 110 inline attributes each**, and 1-3 carries
  119. Physics also lacks the bio habit of triplicated `<style>` blocks. The
  inline repetition is inside the pages: the 2-x readout tile is copied 4 to 6
  times per page (`2-2.html:314-340`), the mission button 4 times
  (`2-1.html:418-433`).
- **Hex colours in HTML are few (21)** but each is a theme-blind literal:
  `#1e1a17` canvas backgrounds (`1-1.html:379`, `1-2.html:471`), force-colour
  labels (`2-1.html:340`, `:356`, `:372`, `:388`), readout colours (`2-2.html:327`,
  `:363`, `2-3.html:302`, `:314`, `:338`, `2-4.html:321`, `:325`, `:329`,
  `2-5.html:311`, `:315`) and the 1-3 amber dot (`1-3.html:429`, `:431`).
- **Lesson JS: 165 hex and 27 rgba.** 1-3 and 2-1 to 2-5 read their theme from
  the stylesheet with `getComputedStyle` (`1-3.js:68`, `2-1.js:32`); 1-1 and 1-2
  do not (0 calls). Even the readers hard-code the force and cart colours.
- **JS `.style.` writes (47)** are status colours and display toggles
  (`1-1.js:379`, `:397`, `:449`; `2-1.js:476`; `2-2.js:532`).
- **Sizes in inline `font-size` are all tokens** except the review's `20pt`
  and `10pt` print header (`1-review_packet.html:109`, `:112`, `:116`, and the same
  three lines in `2-review_packet.html`).
- **Only one lesson uses a `<style>` block** (1-3, 121 lines, 16 selectors:
  `.solver-grid`, `.solver-field`, `.boss-sim-container`, `.boss-canvas-wrap`,
  `.boss-controls`, `.telemetry-board`, `.telemetry-item`, `.telemetry-label`,
  `.telemetry-val`, `.badge-unlocked`, `.drop-vs-fire-wrap`, and their
  descendants; `1-3.html:21-142`). The reviews use the same 25-line print block
  as bio (`.review-print-header`, `.print-workspace`, `.print-hide`).

### Lesson 1-3 is built on a different page template

Of all fifteen lesson pages across bio and physics, only physics 1-3 uses it. It
introduces **27 class names that no stylesheet defines**: `physics-lesson`,
`lesson-main`, `container`, `lesson-header`, `lesson-badge-row`, `badge`,
`badge-accent`, `badge-secondary`, `badge-good`, `lesson-section`,
`section-heading`, `topbar-back-btn`, `topbar-divider`, `topbar-course-title`,
`topbar-toc`, `topbar-btn`, `theme-toggle-btn`, `callout-accent`,
`callout-good`, `btn` (20 uses), `recall`, `recall-title`, `btn-check-blanks`,
`btn-reset-blanks`, `exam-header`, `exam-title`, `exam-points`. Found by comparing
every class in the page with `tokens.css`, `components.css` and the page's
`<style>` block. The visible and functional effects, **all from reading the code
and worth a 30-second click by David**:

| What | Evidence | Effect |
|---|---|---|
| The theme toggle has no handler | The button is `.theme-toggle-btn#themeToggle` (`1-3.html:169`). `core.js` binds `.theme-toggle` only (`core.js:50`); `1-3.js` has no `themeToggle` | Clicking it does nothing |
| The contents menu is empty | `<nav class="topbar-toc" id="topbarToc">` (`1-3.html:159`). `core.js:63` needs `.toc-btn` and `.toc-drop` | No TOC on this page |
| All three prediction reveals stay hidden | `1-3.js:742` adds class `visible`; `.reveal-box` is `display:none` and shows on `.open` (`components.css:716-727`); no rule for `.reveal-box.visible` exists in either stylesheet or `1-3.html:21-142` | Students commit a prediction and never see the explanation (`1-3.html:247`, `:619`, `:651`) |
| "Continue" buttons do nothing | `data-next="sec-02"` has no `#` (`1-3.html:264`, `:387`, `:489`, `:587`, `:663`). `core.js:103` runs `querySelector('sec-02')`, which looks for a `<sec-02>` tag | The five section-advance buttons are dead |
| Fill-in-the-blank cannot be answered | Blanks are `<span class="blank">` (`1-3.html:680-689`), not `<input class="blank">`. The buttons carry `btn-check-blanks`, which no script reads (`core.js:177-179` wants `input.blank` and `[data-recall-check]`) | Check Answers and Reset do nothing, and nothing can be typed |
| Headings and badges unstyled | `section-heading`, `badge*`, `lesson-header` have no rule | `h2` falls back to the browser default |
| Column is narrower than other pages | `<section>` sits inside `.container.narrow` (`1-3.html:187`), so `section`'s gutter padding (`components.css:40-44`) is taken from inside the 52rem column | Text column about 704px at wide widths against 832px elsewhere (by calculation) |

## 2. Typography in practice

Same scale and the same classes as bio (`components.css:80-124`). Prose is 20px
Spectral; `.predict-prompt` 16px; `.callout p` 16px; `.diagram-cap` 14px.

Differences from bio and inside physics:

- **Bare `<h2>` and `<h3>` in every Level 2 lesson.** 2-1 to 2-5 use `<h2>`
  with no class for all six section titles (30 headings, e.g. `2-1.html:304`,
  `:456`) and unclassed `<h3>` for sub-heads (9). `h2.section-head` and
  `h3.subhead` are class-scoped selectors, so these fall back to the browser
  heading size (30px for `h2`) in the book's serif, bold, with margins zeroed by
  the Phase 1 reset. Lessons 1-1 and 1-2 use `.section-head` and `.subhead`
  correctly. 1-3 uses a third class, `.section-heading`, which is undefined.
- **Tile labels are 11px and 9px.** `--text-2xs` (11px) appears 9 to 11 times per
  Level 2 lesson (`2-2.html:318` and following). `--text-3xs` (9px) appears in
  1-2 (`1-2.html:430`, `:441`, `:452`), 1-3 (the `.telemetry-label` rule,
  `1-3.html:102`) and the 1-3 inline text. The floor in `RENDERING_GOTCHAS.md`
  is 11 to 12px.
- **Question and body text sizes.** `.predict-prompt` is 16px (`components.css:624`)
  beside 20px prose, the same split as bio. The 1-3 questions are `p` at
  `--text-sm` (14px) (`1-3.html:228`, `:595`, `:628`).
- **Lead text smaller than prose.** `p.prose.lead` (18px against 20px) is used in
  1-1 and 1-2 (`1-1.html:115`).
- **SVG text.** 15 SVG text elements in 1-2 are 10 to 11px
  (`1-2.html:176-203`), and one in 1-1 is 11px (`1-1.html:196`).
  `RENDERING_GOTCHAS.md` sets 11 to 12px as the floor for labels.
- **Lists carry inline copies of the prose rule.** `<ul style="list-style:disc;
  padding-left:1.5rem; margin-bottom:1.5rem; font-family:var(--serif);
  color:var(--ink-soft); line-height:1.7;">` appears in 1-1 (`1-1.html:155`,
  `:292`), the same fix bio applies with `class="prose"` (which does not work on
  `<ul>`).
- **Overline notation by inline style.** `style="text-decoration:overline"` for
  v-bar is used 5 times in 1-1 and 1-2 (`1-1.html:273`, `:277`). Fractions are
  built from inline-styled `<span>`s (`1-1.html:278-286`, `1-2.html:153-156`).
- **Canvas fonts.** 1-1 and 1-2 use "IBM Plex Mono" and "Hanken Grotesk"
  (loaded by the book's `tokens.css`), 9 to 11px. 2-1 to 2-5 use `system-ui`
  and `monospace` (not the book's fonts), 8 to 11px. 1-3 assigns
  `ctx.font = '10px var(--mono)'` (`1-3.js:82`, `:480`, `:493`) and
  `'11px var(--font-sans)'` (`:137`). **`var()` is not valid in a canvas font
  string, so the assignment is ignored and the canvas keeps its default font**
  (the same trap as the colour entry in `RENDERING_GOTCHAS.md`).

### Elements that fall back to an unset font

- Bare `<h2>`, `<h3>` (above).
- `<button class="w-btn">` in every Level 2 sim (36 uses), `<select class="w-select">`
  (`2-1.html:485`), `<span class="label label-good">` (`2-1.html:322`), and
  `<div class="recall-box">` with `recall-list` (all of 2-1 to 2-5):
  **none of these classes is defined**, so the buttons are browser-default grey
  buttons carrying only inline size and border overrides (`2-1.html:404`,
  `:418`). The page's own `.btn-primary` and `.btn-secondary` are not used on
  those controls.
- `<div class="sim-container">` (2-2 to 2-5, e.g. `2-2.html:303`) is undefined
  and styled by an inline copy of the `.sim-box` declarations.

## 3. Component catalogue

| Component | Implementations in physics | Where | Differences from bio |
|---|---|---|---|
| **Section tag** | `.section-tag .num / .tag-label` | all except 1-3 (flat `<div class="section-tag">01 &middot; MISSION BRIEFING...</div>`, `1-3.html:204`) | Same as bio |
| **Briefing card** | `.mission-brief` + `.mission-badge` + `.mission-location` | 1-1, 1-2, 2-1 to 2-5 | Same CSS as bio's `.anchor-brief`, different names. The "Target Competency" line is an inline 14px muted `p.prose` (`1-1.html:110`), as in bio. 1-3 uses `.callout.callout-accent` instead |
| **Callout** | `.callout` + `.callout-title` | 1-1 (2), 1-3 (11), 2-1 (3), reviews | 1-3 adds undefined `callout-accent` / `callout-good` and uses `.callout` as a general bordered box |
| **Checkpoint** | `.predict-box` + `.predict-opt` + `[data-predict-commit]`, handled by `core.js:112` (`initPredictionGates`) | 1-1 (2), 1-2 (3), 2-1 to 2-5 (2 each) | **Same class names as bio's `.predict-box` family, different attribute contract.** Physics tests `hasAttribute('data-correct')` (`core.js:159`), bio tests `getAttribute('data-correct') === 'true'`. A bio-style option marked `data-correct="false"` would count as correct in physics. Commit button is `[data-predict-commit]` against bio's `.predict-check-btn`. |
| **Checkpoint (1-3)** | Radio labels, inline styles, handler in `1-3.js:728-750` | 1-3 (3) | Third system; reveals never open (section 1 above) |
| **Free-text commit** | `.commit-textarea` + `.w-progress-hint` | 1-1, 2-1 | Physics hint reads "Draft your reasoning..." and the placeholder shows "(minimum 15 characters)" (`1-1.html:525`), a number the spec forbids |
| **Reveal** | `.reveal-box.open` | all | Same CSS as bio |
| **Scoring guide** | `.exam-frame > button[data-scheme] + .scheme.open`, `core.js:237` | 1-1, 1-2, 1-3, 2-x, both reviews | Cleaner than bio: no inline handler, no inline `display:none`. Same defect: the button works before any attempt |
| **Recall blanks** | `.recall-section > .recall-item > input.blank` + `[data-recall-check]`, `[data-recall-reveal]`, `[data-recall-reset]` | 1-1, 1-2, 2-1 to 2-5 | Physics has a **Show Answers** button that fills every blank without an attempt (`core.js:198-208`). 1-3 is broken (section 1) |
| **ECR card** | `.exam-frame` with `.ecr-grid` / `.ecr-card` | 1-1, 1-2, 2-x | 1-3 uses `.exam-header` / `.exam-title` / `.exam-points` (undefined) |
| **Sim box** | `.sim-box` + inline `max-width` (1-1, 1-2); `.boss-sim-container` (1-3 `<style>`); `.sim-box` with inline `border:1.5px solid var(--ink)` (2-1); undefined `.sim-container` + inline copy (2-2 to 2-5) | 8 lessons | Five variants in one book |
| **Sim stage** | `.sim-stage` (1-1, 1-2); `.boss-canvas-wrap` / `.drop-vs-fire-wrap` (1-3); inline `position:relative; width:100%; height:200px...` (2-x) | | Canvas height is a fixed inline pixel value in 1-3 and 2-x |
| **Button** | `.btn-primary` / `.btn-secondary` + inline `height:30px..34px` (1-1, 1-2); `.btn` + `.btn-primary` (1-3, `.btn` undefined); `.w-btn` (2-x, undefined) | | Three class systems. Mission buttons are 30px tall (`1-1.html:446`) |
| **Slider** | `.sim-slider` + `.sim-label` + `.sim-readout` (1-1, 1-2); bare `input[type=range]` with inline `width:100%` (1-3, 2-x) | | Same appearance, two builds |
| **Readout tile** | inline `div` with `--card` background, 4px radius, 11px label, 20px value (1-1); `.telemetry-item` in a `.telemetry-board` (1-3); inline `div` on `--paper`, 11px label, 14px value, six across (2-2) | | Three designs plus bio's three |
| **Status line** | Inline text with a colour set from JS (1-1, 1-2); `.label.label-good/warn` (2-1, undefined) | | No `.status-pill` in physics |
| **Legend** | Inline caption line under the canvas (`2-1.html:329-332`), no legend box | | 1-1 has none; bio 1-1 has one |
| **Data table** | `.ref-table` | reviews, 2-1 | Same drawer-table reuse as bio |
| **Figure frame** | `.diagram.figure.figure--md / --full` (1-1, 1-2); `figure.figure--full.photo` (1-3) | 3 lessons | **Level 2 has no figures** (0 `.diagram` in 2-1 to 2-5); the Level 2 lessons explain by text and by sim only. `.figure--full` data graph in 1-2 (`1-2.html:165`) |
| **Glossary term** | `strong.term[data-term]` | 1-1 (6), 1-2 (3), 1-3 (2) | **Level 2 has none (0 in 2-1 to 2-5)**, though they introduce the most new vocabulary |
| **Next / navigation** | `.next-action > button.next-btn[data-next="#id"]` between sections | 1-1, 1-2, 2-x | Bio uses `<a>` links to the next lesson and no in-lesson buttons |
| **Top bar** | `.topbar` block, 78 lines copied | all but 1-3 (separate markup, 38 lines) | Same as bio, plus the `ref-drawer-btn` |
| **Reference Center** | `.ref-drawer*` built by `reference-center.js` | all ten pages (the script is loaded everywhere) | Physics only; bio carries the CSS and no consumer |

## 4. Layout rhythm

- **Section padding** is the same `var(--beat)` as bio (88px to 192px between
  section contents). Physics adds a second rhythm: each section ends with a
  `.next-action` row (`margin-top:2.5rem; padding-top:1.5rem; border-top`) that
  adds a divider and a button between sections that already have a 5 to 12rem gap.
- **Column.** `.narrow` is 52rem. Sim sections 04 in 1-1 and 1-2 use `.wrap` and
  `.sim-box` with inline `max-width:58rem` and `64rem`
  (`1-1.html:368`, `1-2.html:400`), so the sim is wider than the text column.
  `.wrap` is used in physics (2 places), unlike bio.
- **Review packets** use the same inline rhythm as bio (`1-review_packet.html`:
  `<section style="padding:1.5rem 0">`).

### Wider than its column

By calculation, not measured. At 360px the sim card content is about 278px.

| Width | Item | Why |
|---|---|---|
| 360px | Rover track canvas (`1-1.html:379`) | `setupCanvasDPI` sets `canvas.style.width = '850px'` and `style.height = '120px'` (`1-1.js:78-79`), overriding the inline `width:100%; height:auto`. `canvas { max-width:100% }` (`components.css:535`) clamps the width to the column but the height stays 120px, so the drawing is squeezed about 3.4 times horizontally |
| 360px | 1-2 matcher, triple studio, track | Same helper (`1-2.js:14-21`). The studio puts three graph canvases in `grid-template-columns:repeat(3, 1fr)` (`1-2.html:423`) with no breakpoint: each column is about 80px, each canvas 280px wide by 200px high, squeezed 3.5 times horizontally |
| 360px | 2-2 and 2-5 telemetry HUD (`2-2.html:316`, `2-5.html:304`) | `repeat(6, 1fr)` inline with no breakpoint, about 40px per cell, against labels such as "ACCELERATION" at 11px uppercase |
| 360px | 2-3 and 2-4 HUD grids | `repeat(5, 1fr)` (`2-3.html:295`, `2-4.html:314`). **No Level 2 lesson has a single `@media` rule**; 2-1 builds its HUD with flex and wraps |
| 360px | Track tick labels in 2-2 and 2-3 | Eleven labels (`${i * 10}m`) across 218px of track: about 20px per label, each label about 22px wide (`2-2.js:134-147`, `2-3.js:137-150`) |
| 1280px | 1-3 text column | 704px against 832px elsewhere (section 1) |

## 5. Physics ranking (provisional)

1. **Level 2 control classes with no CSS** (`w-btn`, `sim-container`, `label`,
   `recall-box`, `w-select`) plus 30 bare `h2` and 9 bare `h3`. Every sim
   control is a default browser button, and every section title is unstyled.
   *Canonical:* `.btn-primary` / `.btn-secondary` (`components.css:570-605`),
   `h2.section-head`, `h3.subhead` (`components.css:96-111`), `.sim-box`
   (`components.css:506`), and the `.label` job given to a `.status-pill`.
2. **Lesson 1-3's template.** Six functional faults and 27 undefined classes.
   *Canonical:* the 1-1 and 1-2 template (topbar, `.section-tag`, `.section-head`,
   `.next-action`), as it is the one `core.js` serves.
3. **Fixed-pixel canvases** (`setupDPI` in 1-1 and 1-2) against the fluid
   canvases in 2-x. *Canonical:* the 2-x pattern (a wrapper with `width:100%`
   and a fixed height, buffer sized from `getBoundingClientRect` in a resize
   handler).
4. **Readout tiles.** Three physics designs plus three in bio.
   *Canonical:* to be chosen across books after chem.
5. **Checkpoint contract.** Same class names in two books, opposite
   `data-correct` rules. This matters only when the shared runtime merges them.
6. **Show Answers before an attempt** (`core.js:198-208`) and the scoring-guide
   buttons that open without an attempt.
7. **Dead weight:** reference-drawer CSS in bio, `p.lead`, 9px labels.

## Questions for David (physics, page level)

- Was lesson 1-3 deliberately built on a separate template (it looks like an
  earlier or hand-authored page), or should it match 1-1 and 1-2?
- Level 2 lessons have no figures and no glossary terms. Intended?
- The cadet and mission framing (`.mission-brief`, "Cadet Directive") is a
  design choice, but see the 2C report on the voice rules.

---

# Part 3: Chem (`public/chem/`)

27 lessons. Shared files: `tokens.css` (169 lines), `components.css` (4,111
lines, 29 `@media` blocks), `core.js` (4,514 lines), `elements.js`,
`glossary.js` (812), `molecule-renderer.js`, `particle-renderer.js`,
`reference-center.js` (952). The practice-engine pages under `public/chem/pe/`
and the diagram generator are not lessons and are not audited here.
Lesson files are cited by their on-disk prefix, which differs from the manifest
ids for ten lessons (for example file `3-14a` is manifest id `1-4a`; the
mapping is in `public/chem/lessons.json`).

**Chem is the origin of the other two books' CSS, and it is structurally
different from them.** Headings are styled by element (`h1`..`h4` in
`tokens.css`), not by class. Body prose is 22px (`--text-reading`) against
20px in bio and physics. Corners on cards are square. Almost every
interactive frame is `.interactive`, and checkpoints are widgets driven by a
JSON config in `core.js`.

## 1. Inline styling inventory

| Lesson | inline `style=` | font-size | font-family | color | background | padding | margin | border | layout (display/flex/grid) | hex in HTML | rgb() in HTML | `<style>` lines | hex in `<style>` | inline `<script>` lines | hex in inline script | lesson JS lines | hex in JS | rgba in JS | JS `.style.` writes |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 1-1a | 603 | 140 | 1 | 19 | 13 | 2 | 30 | 16 | 11 | 1 | 1 | 0 | 0 | 0 | 0 | 208 | 0 | 0 | 2 |
| 1-1b | 150 | 73 | 62 | 12 | 7 | 7 | 35 | 6 | 7 | 1 | 1 | 0 | 0 | 0 | 0 | 451 | 3 | 7 | 28 |
| 1-2a | 107 | 72 | 39 | 9 | 10 | 5 | 24 | 11 | 6 | 7 | 1 | 0 | 0 | 0 | 0 | 512 | 0 | 0 | 9 |
| 1-2b | 122 | 82 | 2 | 8 | 8 | 2 | 23 | 8 | 11 | 3 | 1 | 0 | 0 | 0 | 0 | 493 | 8 | 0 | 9 |
| 1-2c | 130 | 42 | 22 | 24 | 13 | 36 | 51 | 14 | 17 | 1 | 1 | 127 | 0 | 0 | 0 | 126 | 0 | 0 | 3 |
| 1-2e | 234 | 159 | 7 | 21 | 14 | 3 | 49 | 14 | 15 | 51 | 1 | 170 | 0 | 0 | 0 | 731 | 13 | 0 | 1 |
| 1-3a | 106 | 56 | 8 | 20 | 20 | 9 | 40 | 21 | 24 | 1 | 1 | 0 | 0 | 0 | 0 | 584 | 0 | 0 | 3 |
| 1-3b | 231 | 159 | 4 | 15 | 9 | 22 | 40 | 22 | 21 | 1 | 1 | 0 | 0 | 0 | 0 | 777 | 2 | 0 | 5 |
| 2-2a | 263 | 21 | 4 | 23 | 5 | 7 | 36 | 5 | 14 | 103 | 1 | 128 | 0 | 0 | 0 | 789 | 4 | 0 | 13 |
| 2-6a | 132 | 62 | 17 | 33 | 21 | 19 | 72 | 22 | 35 | 1 | 1 | 118 | 0 | 0 | 0 | 799 | 0 | 0 | 12 |
| 2-7a | 81 | 46 | 2 | 11 | 6 | 2 | 27 | 5 | 5 | 2 | 1 | 155 | 0 | 0 | 0 | 375 | 3 | 0 | 0 |
| 2-7b | 186 | 63 | 10 | 15 | 9 | 12 | 53 | 13 | 16 | 9 | 1 | 193 | 0 | 0 | 0 | 880 | 0 | 0 | 8 |
| 2-7c | 98 | 26 | 15 | 31 | 15 | 12 | 53 | 18 | 12 | 44 | 1 | 195 | 0 | 0 | 0 | 567 | 12 | 0 | 15 |
| 3-14a | 123 | 24 | 12 | 32 | 17 | 53 | 45 | 22 | 21 | 14 | 1 | 0 | 0 | 0 | 0 | 389 | 4 | 4 | 2 |
| 3-1a | 137 | 34 | 23 | 43 | 19 | 42 | 64 | 29 | 25 | 1 | 2 | 0 | 0 | 0 | 0 | 330 | 2 | 0 | 0 |
| 3-1b | 134 | 36 | 25 | 40 | 18 | 47 | 57 | 23 | 27 | 1 | 1 | 0 | 0 | 0 | 0 | 657 | 3 | 6 | 0 |
| 3-1c | 100 | 23 | 11 | 27 | 15 | 39 | 51 | 18 | 16 | 4 | 5 | 0 | 0 | 0 | 0 | 347 | 4 | 0 | 0 |
| 3-4a | 98 | 33 | 9 | 36 | 18 | 25 | 50 | 19 | 26 | 7 | 3 | 0 | 0 | 0 | 0 | 614 | 18 | 0 | 3 |
| 4-1a | 81 | 21 | 8 | 23 | 11 | 19 | 40 | 12 | 22 | 5 | 1 | 0 | 0 | 0 | 0 | 460 | 12 | 0 | 0 |
| 4-1b | 76 | 23 | 8 | 24 | 8 | 12 | 32 | 7 | 21 | 1 | 1 | 0 | 0 | 0 | 0 | 492 | 10 | 2 | 4 |
| 4-6a | 97 | 33 | 7 | 30 | 15 | 16 | 47 | 14 | 29 | 5 | 1 | 0 | 0 | 0 | 0 | 452 | 8 | 2 | 12 |
| 4-6b | 91 | 34 | 11 | 28 | 12 | 15 | 43 | 12 | 29 | 1 | 1 | 0 | 0 | 0 | 0 | 437 | 6 | 1 | 28 |
| 5-1a | 118 | 41 | 15 | 36 | 18 | 27 | 55 | 21 | 34 | 33 | 7 | 0 | 0 | 0 | 0 | 644 | 58 | 6 | 6 |
| 5-2a | 82 | 30 | 7 | 28 | 9 | 19 | 37 | 9 | 23 | 29 | 1 | 0 | 0 | 0 | 0 | 312 | 16 | 0 | 4 |
| 5-3a | 103 | 34 | 13 | 22 | 17 | 25 | 51 | 19 | 29 | 30 | 5 | 0 | 0 | 0 | 0 | 414 | 46 | 2 | 16 |
| 5-4a | 84 | 32 | 9 | 21 | 12 | 20 | 40 | 11 | 24 | 61 | 2 | 0 | 0 | 0 | 0 | 633 | 30 | 4 | 16 |
| 5-8a | 150 | 54 | 11 | 34 | 32 | 36 | 57 | 39 | 53 | 20 | 1 | 0 | 0 | 0 | 0 | 1098 | 34 | 2 | 53 |
| **Total** | **3917** | **1453** | **362** | **665** | **371** | **533** | **1202** | **430** | **573** | **437** | **45** | **1086** | **0** | **0** | **0** | **14571** | **296** | **36** | **252** |

(Totals differ from the plan's baseline by 4 attributes (3,917 here against
3,921) and 7 style-block lines (1,086 against 1,093); my parser matches
`style="..."` with double quotes only. The 4 form attributes and the
`_widget-test.html` page are excluded.)

### The 3,917 attributes are two different things

| | Lessons 1-1a to 2-7b (12 lessons) | Lessons 2-7c to 5-8a (15 lessons) |
|---|---|---|
| Attributes | 2,345 | 1,572 |
| Use a `--dia-*` diagram token | 1,322 (56%); per lesson 16 to 383 | **0 in every lesson** |
| Distinct strings per lesson | 31 to 66 (for 1-1a: 603 attributes, 50 distinct) | 46 to 106 (5-8a: 150 attributes, 106 distinct) |
| What they are | Repeated SVG paint: `r: var(--dia-r-particle)` (116 times in 1-1a), `stroke-width: var(--dia-stroke)` (113), `font-size: var(--dia-label-size, 12px)` (62) | Hand-written layout and type: `padding:.6rem .75rem` (26 times in 3-14a), card shells, tile copies |

(Counts by script. Across the whole book, 1,322 attributes (34%) use a
`--dia-*` token and 1,550 (40%) set only SVG paint properties. The left column
is the sum of lessons 1-1a to 2-7b in the table above, and the right column is
the rest.)

So the headline "3,921 inline styles" overstates the cost for the first 12
lessons: that is a diagram-token system working as designed (CSS custom
properties set inline). The maintenance problem sits in the last 15, where each lesson wrote
its own cards, tiles and buttons inline, the same way physics Level 2 did.

- **Hex colours in HTML (437)** are SVG fills and gradients, almost all in the
  later lessons: 5-4a 61, 2-2a 103 (3-digit and 6-digit), 1-2e 51, 2-7c 44, 5-1a 33,
  5-3a 30, 5-2a 29, 5-8a 20, 3-14a 14 (for example `5-4a.html:73-79` gradient
  stops, `5-1a.html:398` a canvas with an inline `background:#0f172a`).
- **Lesson JS: 296 hex and 36 rgba**, 252 `.style.` writes. Heaviest: 5-1a
  (58 hex), 5-3a (46), 5-4a (30), 5-8a (34), 5-8a also has 53 style writes.
- **Raw font sizes in inline `font-size`:** none. All 1,453 inline sizes are
  tokens (`--text-*` or `--dia-*`).
- **Raw SVG `font-size="N"` attributes under 11px: 424.** None in lessons 1-1a
  to 2-7b (they use the tokens). In 2-7c and every lesson from 3-14a on:
  2-7c 23, 3-14a 33, 3-1a 14, 3-1b 40, 3-1c 59, 3-4a 29, 4-1a 10, 4-1b 18, 4-6a 20,
  4-6b 10, 5-1a 32, 5-2a 24, 5-3a 24, 5-4a 61, 5-8a 27 (for example 6.5px text
  in `2-7c.html:286` and `5-1a.html:75`). `RENDERING_GOTCHAS.md` sets 11 to 12px
  as the floor.

### Per-lesson `<style>` blocks (1,086 lines in 7 lessons)

| Lesson | Lines | Selectors |
|---|--:|---|
| 1-2c | 127 | 18: `.nomen-tree-grid`, `.nomen-branch-card` (+ states), `.branch-expand-cue` |
| 1-2e | 170 | 27: `.balancer-stage`, `.eqn-selector`, `.coeff-row`, `.adjust-btn`, `.balance-canvas` |
| 2-2a | 128 | 20: `.change-stage`, `.change-svg`, `.slider`, `.tally-card`, `.tally-grid` |
| 2-6a | 118 | 20: `.dual-sim-grid`, `.sim-controls-card`, `.argument-step`, `.step-select` |
| 2-7a | 155 | 24: `.builder-grid`, `.formula-input`, `.molecule-canvas`, `.molar-table` |
| 2-7b | 193 | 29: `.conversion-stage`, `.fraction-block`, `.slot-box`, `.factor-container` |
| 2-7c | 195 | 32: `.stoich-stage`, `.control-box`, `.slider-input`, `.bca-table` |

These are lesson-specific sim shells written before the shared `.sim-box`
and `.interactive` existed. 2-2a, 2-6a, 2-7a to 2-7c each carry their own
slider (`.slider`, `.slider-input`) and their own table. No lesson from 3-14a
on uses a `<style>` block; they use inline attributes instead.

## 2. Typography in practice

- **Scale.** `tokens.css:30-44`: `--text-3xs` 9px to `--text-4xl` 48px, plus
  `--text-reading` 22px. The same tokens as bio and physics. Applied
  differently:

| Role | Chem | Bio and physics |
|---|---|---|
| Body | 22px Spectral, line height 1.62 (`tokens.css` `body` rule) | 20px |
| `h1` | `clamp(36px, 7vw, 75px)` (`tokens.css`, `h1` rule) | `clamp(30px, 4vw, 36px)` |
| `h2` | `clamp(30px, 4.2vw, 48px)` | `clamp(24px, 3vw, 30px)` |
| `h3` | `clamp(20px, 2.3vw, 27px)` | 20px (`.subhead`) |
| Headings selected by | element (`h1, h2, h3, h4`) | class (`h2.section-head`) |
| Prose width | `p { max-width: var(--prose) }` | `.narrow` column |
| `em` | italic **in the accent colour** everywhere (`tokens.css` `em` rule) | plain italic |
| Face | Hanken Grotesk headings, Spectral prose, IBM Plex Mono labels | same |

- **Chem headings are about 1.6 times larger than physics and bio** at wide
  widths (48px against 30px), which is the "large headings" the plan names.
- **A bare `<h2>` works in chem and fails in physics.** Chem styles `h2` by
  element, so physics Level 2's bare `<h2>` looks like it was authored against
  chem's CSS (see Part 2).
- **Labels.** `.label` is 12px mono, tracking .18em, uppercase (`tokens.css`).
  `.section-tag .num` and `.label` carry the section tags.
- **Sizes under the floor.** 424 SVG text attributes at 5 to 10px (above), plus
  canvas fonts of 5 to 9px in `4-6a.js`, `5-1a.js`, `5-4a.js`, `5-8a.js` (see
  2B).
- **Fonts not loaded:** canvas `bold 8px var(--sans)` (`3-14a.js:231`) uses a CSS
  variable in a font string, which canvas ignores. `4-1b.js`,
  `4-6a.js` and `5-1a.js` use `sans-serif` (generic), not the book's fonts.
- **Accessibility mode.** Chem has a body-level dyslexia/accessibility mode that
  swaps to Verdana and widens spacing (`tokens.css`, `body.accessibility-mode`).
  Bio and physics have none.

## 3. Component catalogue

What chem has that the other two do not: the `data-widget` framework (8
widget types), the step/scrub/zoom motion controllers, the Reference Center,
the Socratic drawer, spaced repetition, Quick Check and One-Screen Synopsis
views, a resume bar, and `prefers-reduced-motion` handling in `components.css`
and in the older sims. The table lists the same components as Parts 1 and 2.

| Component | Chem implementations | Differences from bio and physics |
|---|---|---|
| **Section tag** | `.section-tag > .num + .label.label-accent` | Square `num` box (no radius). Bio and physics use `.tag-label` with a 4px radius box |
| **Hero / briefing** | `.hero` with `Alignment` and `Objective` meta rows (every lesson, `L41` for most) | Chem prints the PE text and the lesson objective in the page head; bio shows "Target Standards" as a small inline line; physics shows "Target Competency" |
| **Callout** | `.callout` (+ `.callout-warning` in 4 lessons, undefined) | Same class as bio; `callout-warning` has no CSS (`4-1b.html`, `4-6a.html`, `5-2a.html`, `5-3a.html`) |
| **Checkpoint (A)** | `data-widget="commit-reveal"` with a JSON config: modes `choice`, `free`, `drill`; **per-option feedback**; reveal gated on a selection (`components.css:1782-1894`, `core.js`) | The strongest of the books. 13 choice questions in the JSON form; 0 questions missing per-option feedback |
| **Checkpoint (B)** | `.options > button.opt[data-correct]` + `.reveal-box[data-reveal]` + `.reveal-card` | 10 multiple-choice questions in 5 lessons (1-1b, 1-2a, 1-3a, 1-3b, 3-1a); the same `data-predict` attribute also marks 11 short-answer inputs in 2-2a, 2-6a, 2-7b, 2-7c and 3-1a. One shared explanation for all choices. Third dialect of "predict-reveal" |
| **Faded example, scaffold, step-builder, sort-classify, diagnose-error, construct-validate, predict-run** | `data-widget` types (`core.js`) | Not present in bio or physics |
| **Retrieval blanks** | `.recall` fill-in (`components.css:295`) | Same job as `.recall-section` elsewhere; 5-8a defines its own `recall-card`, `recall-list`, `btn-check`, `btn-reset`, `recall-score` (`5-8a.html`, undefined) |
| **Self-explain / peek** | `[data-peek]` reveal, disabled until the student types (`1-3b.js:752-760`) | **Gated on an attempt**; bio and physics scoring-guide buttons are not |
| **Exam practice** | `.exam-card` + `.scheme-card` with `[data-scheme]`, disabled until input (`1-3b.js:762-770`) | Gated; bio and physics are not |
| **Interactive frame** | `.interactive` > `.interactive-head` + `.label` (`components.css:213-215`) | Square corners, padding `clamp(1.1rem, 3vw, 2rem)`. **Six lessons use `interactive-header`, `interactive-title`, `interactive-badge`, `interactive-body` instead** (3-14a, 3-1a, 3-1b, 3-1c, 3-4a, 4-1a; 10 uses of the first and third), which have no CSS |
| **Sim shell** | `.sim-box > .sim-grid > .sim-stage` (`components.css:34-66`) plus 7 lesson `<style>` shells (section 1) | Same three names as bio and physics, with square-ish 8px radius. Used in units 2 to 5 inconsistently |
| **Buttons** | `.btn`, `.w-btn`, `.w-btn-check`, `.chip`, `.step-btn`, `.next-btn` | **`btn-sm` (30 uses in 8 lessons), `btn-subtle` (12), `w-btn-sm` (6), `stage-preset-btn`, `preset-btn`, `milestone-btn`, `path-btn` have no CSS**; none is read by any script |
| **Slider** | bare `input[type=range]` with `.slider` or `.slider-input` per-lesson `<style>` (2-2a, 2-6a, 2-7c) | Three lesson-specific slider stylings; bio and physics use `.sim-slider` |
| **Readout tile** | `.readout-box` (2-6a), `.tally-card` (2-2a, 2-7a), `readout-pill` (3-1a, undefined), `calorimeterMetricCards` (3-1c, inline), inline `div` tiles in 3-14a to 5-8a | At least six designs in chem alone, on top of bio and physics' |
| **Status badge** | `.label.label-accent / .label-good` (4-6a, `4-6a.js:140-152`), inline-styled `ionizeBadge` (5-4a, `5-4a.js:~130`), `status-badge-inline` (2-6a) | Three more |
| **Mission deck** | `mission-deck`, `mission-card`, `w-btn-sm` (5-1a, 5-2a), "Guided Inquiry Missions" panels (3-1c, 3-4a, 4-1a), "Try This" (4-6a, 4-6b), "Guided Investigation Missions" (5-4a) | Five names for one idea, all unstyled or inline-styled |
| **Figure frame** | `.figure.figure--sm/md/full/wide` + `.diagram` + `.cap` | Same tiers as bio and physics (this is where they came from) |
| **Data table** | `.molar-table`, `.bca-table` (lesson `<style>`), `.reference-table`, `table-wrap` | Four table styles |
| **Glossary term** | `strong.term` + tooltip card | Same pattern; chem's glossary has 812 lines |
| **Top bar** | `.topbar` + `.toc-btn`, `.topbar-home-btn`, `.clear-progress-btn`, `.contact-feedback-btn`, `.theme-toggle` | Two extra buttons; also a resume bar and footer navigation injected by `core.js` |

## 4. Layout rhythm

- **Section padding** is the same `var(--beat)` as bio and physics
  (`components.css:84`, `section{padding:var(--beat) var(--gutter)}`), so the
  same 88px to 192px bands apply. Chem adds a `.reveal` scroll-in class on
  headings, paragraphs and cards, so the empty band is partly hidden by the
  fade-in animation.
- **Widths.** `.wrap` (78rem) is used in every lesson (`1-1a.html:~268`), with
  `.narrow` (52rem) for prose. Figures are `--fig-sm/md/full/wide`.
- **Responsive rules.** 29 `@media` blocks in `components.css` (12
  `min-width`, 9 `max-width`, 3 print and reduced-motion), against 4 in bio and
  physics each. Seven lessons add their own breakpoint in the `<style>` block
  (for example `1-2c.html:21` at 700px, `2-7a.html:23` at 820px).

### Wider than its column

By calculation, not measured.

| Width | Item | Why |
|---|---|---|
| 360px | `5-8a.html:488` | `grid-template-columns:repeat(4, 1fr)` inline, about 65px per cell at 278px |
| 360px | `2-7c.html:652` | `1fr 1fr 1fr` inline ratio bars |
| 360px | `2-7c.html:90` | `.bca-table` has `min-width: 520px`; whether the table sits in a scroll wrapper was not checked |
| 360px | Canvas widths | Fluid: `.sim-stage canvas, .sim-stage svg { width:100% }` (`components.css:57-62`) scales every chem canvas proportionally. Chem's older sims survive 360px better than bio's and physics' |
| 1280px | none found | |

## 5. Chem ranking (provisional)

1. **Undefined control and frame classes from 3-14a on.** `interactive-header`
   (and `-title`, `-badge`, `-body`), `btn-sm`, `btn-subtle`, `w-btn-sm`,
   `preset-btn`, `stage-preset-btn`, `mission-deck`, `mission-card`,
   `callout-warning`, `recall-card` family: about 100 uses with no rule.
   *Canonical:* `.interactive` + `.interactive-head` (`components.css:213`),
   `.w-btn` (`:1745`), `.chip`.
2. **Hand-written inline layout from 2-7c on** (1,572 attributes, 46 to 106
   distinct strings per lesson, 0 using the diagram tokens). *Canonical:* the
   method of the first 12 lessons, a token for each diagram geometry and CSS classes for
   cards.
3. **Raw SVG and canvas text sizes (424 at 5 to 10px).** *Canonical:* the
   `--dia-label-size` / `--dia-caption-size` tokens the older lessons already
   use.
4. **Checkpoint dialects.** (A) the JSON `commit-reveal` widget is the best
   implementation in the project and should be the canonical checkpoint;
   (B) the HTML `data-predict` form (10 multiple-choice questions) should migrate to it.
5. **Lesson-specific sim shells and sliders (7 `<style>` blocks, 1,086 lines).**
6. **Five names for the mission/preset deck.**

## Cross-book ranking (final)

The five components whose variants cause the most visible inconsistency,
across all 42 pages, with the best existing variant as the proposed canonical
(Phase 3 decides; these come from the audit).

| Rank | Component | Variants found | Proposed canonical |
|---|---|---|---|
| 1 | **Checkpoint, reveal and scoring-guide system** | Chem: JSON `commit-reveal` widget (13 questions), HTML `data-predict` (10 multiple-choice), `[data-peek]`/`[data-scheme]` gated on input. Bio: `.predict-box` (`data-correct="true"`, `core.js:152`), `.check-box` (undefined, inline handler, hex colours, 4 pages), `.scheme` toggled by inline script. Physics: `.predict-box` (`data-correct` by presence, `core.js:112`), radio form in 1-3 whose reveal never opens, `View Scoring Guide`, `Show Answers`. Same class names, opposite attribute rules across bio and physics. Scoring-guide buttons that open with no attempt: 8 in bio (1-2, 1-3, 1-4, review x5) and 18 in physics (every lesson, review x5 each); two physics pages also have a Show Answers button | Chem's `data-widget="commit-reveal"` (JSON config, per-option feedback, gated reveal) at `components.css:1782-1894` |
| 2 | **Sim shell, controls and readout tiles** | `.sim-box` / `.interactive` / `.boss-sim-container` / `.sim-container` (undefined) / inline copies; buttons `.btn-primary`, `.btn-preset`, `.preset-pill-btn`, `.action-pill-btn`, `.w-btn`, `.btn` (undefined), `btn-sm` (undefined), `chip`; 14 or more tile designs (3 in bio, 3 in physics, at least 6 in chem); 3 copies of an identical bio `<style>` block | `.sim-box > .sim-stage + .sim-controls` shell, one `.btn-primary / .btn-secondary` pair, one tile (bio's 12px label / 20px value), one `.status-pill` built on tokens |
| 3 | **Canvas and SVG text and colour** | 424 chem SVG labels at 5 to 10px plus canvas text at 5 to 11px in all books; 237 + 165 + 296 hard-coded hex in lesson JS; `var()` used in canvas colour or font strings in 5 places (`2-2.js:270`, `1-3.js:82`, `3-14a.js:231`, `4-1b.js`, 1-3 boss); a dark-mode check that never fires in 5 places in 4 chem sims; dark text drawn on a dark paper in physics 1-1 and 1-2; light-mode palette frozen at load in `3-1a.js` | Read tokens with `getComputedStyle`, redraw on theme change, a shared minimum text size, and chem's `--dia-*` tokens for SVG |
| 4 | **Page shell and headings** | Chem element-styled headings (h2 up to 48px, body 22px); bio and physics class-styled (h2 up to 30px, body 20px); physics 2-1 to 2-5 with 30 bare `h2`; physics 1-3 on a separate template with 27 undefined classes and six dead behaviours | One template and one set of heading classes; the 1-1 / 1-2 physics header as the pattern |
| 5 | **Page rhythm and lists** | `--beat` gaps of 88 to 192px between sections in all three books; each section ending with a divider row (`.next-action`); `<ul>` styled by inline copies of the prose rule 22+ times in physics | One smaller gap token; a `.prose-list` class |

(Rank is by how many pages show the variant and how visible it is to a student,
not by lines of code. The chem ranking within Part 3 and the earlier "provisional"
rankings for bio and physics are the inputs.)

## Questions for David (chem, page level)

- Was the move from the diagram-token system (lessons 1-1a to 2-7b) to hand-written
  inline layout (lesson 2-7c onward) deliberate? The last 15 lessons would be the first to
  migrate.
- Are `interactive-header`, `btn-sm`, `mission-card` and friends leftovers from
  a CSS file that was never committed, or invented in the lesson HTML?
- Chem headings and body are larger than bio and physics. Decision D2 already
  settles prose at 20px; should headings follow bio and physics too?

