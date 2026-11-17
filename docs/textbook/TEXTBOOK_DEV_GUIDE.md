# TEXTBOOK_DEV_GUIDE.md — Behavioral Guidelines & Project Contract

> **Scope:** the SAS General Chemistry interactive textbook in `public/chem/`.
> Since 2026-10-12 this file is the chem appendix to
> [`STYLE_STANDARD.md`](STYLE_STANDARD.md), which governs all three books. Read
> section 0 below before relying on any rule here. Start any work with the
> `textbook-work` skill.
> (This file was named `CLAUDE.md` before the textbook moved into this repo;
> older `CHANGELOG.md` entries still refer to it by that name.)

> **New session?** Open work for all three books is in [`FUTURE_FEATURES.md`](../../FUTURE_FEATURES.md) ("Curriculum & Textbook Content"), and the handoff state is in `.claude/SESSION_NOTES.md`. The old `TODO.md` is archived as [`TEXTBOOK_TODO.md`](../archive/TEXTBOOK_TODO.md). All 27 manifest lessons are built, a full consistency/bug-fix pass is done, and PDF/print export is built and verified (see [`CHANGELOG.md`](CHANGELOG.md) for the dated history of all three).

## 0. How this guide relates to the standard

**The standard wins.** Where a rule below and
[`STYLE_STANDARD.md`](STYLE_STANDARD.md) disagree, follow the standard.

**Chem runs on the shared runtime** (session 4c, stage 1, 2026-10-23). All 27
lessons, the dashboard and the colophon load `public/textbook/` in the order of
[`RUNTIME_SPEC.md`](RUNTIME_SPEC.md) section 2.3. Chem's own files are
`assets/tokens.css`, `assets/components.css`, `assets/book.js`,
`assets/glossary.js`, the Reference Center, `elements.js`, the molecule and
particle renderers, `assets/dashboard.js` and the lessons. The rules that the
standard replaced have been deleted from this file: golden rules 13, 16, 18, 19,
20, 23 and 26, and the old "end each section with a data-next button" rule.

**Nothing is still being moved.** Session 4c (stages 1 to 6) is done: every chem sim runs on
`TB.sim.create`, and every tool sits in the shared `.sim-box`. Chem is in both the `migrated` and
the `finished` lists of `services/__tests__/textbookStandard.baseline.json`, so the standard's
guards now cover all 27 lessons. A canvas Bohr sim draws with `assets/bohr.js` (`window.GC_BOHR`). A tool with no
canvas (a table, a builder) calls `GC_GATE_TOOL(box, locks, onUnlock)` from `book.js`, which
locks it until its prediction is committed. A canvas tool that only redraws on input (the 1-2d
change lab, the 1-2e balancer, the 1-7a builder, the 1-7b path picture, the 1-7c chamber)
passes `loop: false` to `TB.sim.create`. A stage that is an svg (the 3-1c calorimeter, the 3-4a
investigation graph) passes `kind: 'svg'`; its `draw(svg, env)` writes markup in design units,
scaled by `k`, and rewrites the svg only when the markup changes. A sim that follows many collisions
(4-1a, 4-1b) uses only plain arithmetic and `Math.sqrt` in its model, so Node and Chrome give the same
numbers; so does the 5-8a decay lab, with a seed chosen from a scan. A sim whose subject is past the PE boundary sits
inside an Enrichment block (4-1b, 4-6b, the two 5-3a tools and the 5-8a chain reaction), and a core sim offers a deeper
view only behind a chip that carries the Enrichment tag (the 5-4a eV values). The rules a Unit 2
tool needs are in the "UNIT 2 TOOLS" section of `components.css`, a Unit 3 tool's are in the
"UNIT 3 TOOLS" section, and the one new Unit 4 class is in "UNIT 4 TOOLS" at the end. Unit 5 needed no new
rule. The "legacy" layout rules are gone.

**Still chem's own, and not in the standard:** rules 1 to 12, 14, 15, 17, 21, 22,
24, 25 and 27 below; the file manifest (section 5); the particle-diagram
conventions (section 8).

### Chem at a glance

| | |
|---|---|
| Accent | Vermilion, `#D6452A` light and `#F26B4E` dark. Green means correct only. |
| Subject families | `--nucleus`, `--electron`, `--shell`, `--cool`, `--hot`, `--water` |
| Special tools | Reference Center, `elements.js`, the molecule and particle renderers, the PE practice engine (`public/chem/pe/`), the diagram generator, Quick Check, Cram View, the resume bar, the practice bridge, the Socratic companion, progress and spaced repetition |
| Glossary global | `window.GC_GLOSSARY` |
| PE list | 15 PEs. Statements, clarification statements and assessment boundaries are verbatim in `docs/textbook/references/chem/`. The lesson-to-PE map is `public/chem/lessons.json`. |

Course decisions (2026-10-12):
- Core, although past a strict reading of the PE: naming the intermolecular
  forces (1-3b) and limiting reactant (2-7c).
- Enrichment: Roman numerals for transition metals (1-2c), the bond-energy sum
  for ΔH (3-14a), how enzymes work (4-1b), buffer chemistry (4-6b), and the
  splits for 1-1a, 3-4a, 5-1a, 5-2a, 5-3a, 5-4a and 5-8a in
  [the rewrite plan](../plans/textbook-rewrite-plan.md), section 6.

---

## 1. Behavioral Guidelines (Reduce common LLM coding mistakes)

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**
Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### Simplicity First
**Minimum code that solves the problem. Nothing speculative.**
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.
- Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### Surgical Changes
**Touch only what you must. Clean up only your own mess.**
When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.
When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.
- Every changed line should trace directly to the user's request.

### Goal-Driven Execution
**Define success criteria. Loop until verified.**
Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"
For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

### Voice Note Feedback Workflow
**Automate transcription, verify changes, and clean up audio files.**
When the user points to an audio feedback file (e.g. `.m4a`, `.mp3`, `.wav`) under `Ongoing Work/` or mentions one:
1. **Transcribe**: Set up and execute a local Python script using `openai-whisper` and `imageio-ffmpeg` (with `ssl._create_default_https_context = ssl._create_unverified_context` to bypass macOS certificate checks).
2. **Operationalize**: Transcribe the file, review the transcript, create a concrete implementation plan, and obtain user sign-off.
3. **Clean Up**: Delete the audio feedback file immediately after the changes have been implemented and verified. Never leave audio files in the repository.

---

## 2. Project Contract (Chemistry Interactive Text)

This repo builds a set of **interactive HTML review pages** for a high-school General Chemistry course (Semester 1). They are studied **outside class, after first exposure**, so the job is *retrieval practice woven with a second, differently-framed re-narration* — not first teaching, not a quiz bank.

`lessons/1-1b_periodic-trends-reactivity.html` is the **reference implementation**. Match its structure, pedagogy, and visual language. When in doubt, open it and follow it.

---

## 3. Golden Rules (Read before building anything)

1. **Hew to the review sheets, not the consensus notes.** The PLC has reviewed and committed to the review-sheet content; the consensus notes are stale and not yet updated. If something is only in the consensus notes (e.g. VSEPR, empirical formula), it is **not** headline content here. Source of truth = the review sheets in `References/` (inside `public/chem/References/`).
2. **Verify all chemistry.** Every periodic value, ΔEN cutoff, balanced equation, molar mass, and Bohr configuration goes into student materials. Check it. Do not trust memory or a plausible-looking number.
3. **Render before declaring done.** Most quality bugs are visual (a glitchy glyph, dead space, an arrow that's the wrong color, a misleading particle diagram). Open and test the page in a browser (light and dark mode) to actually check the output.
4. **Adhere to the particle-diagram conventions** in `docs/textbook/references/chem/` (see below). Diagrams must be chemically honest — a diagram that only *looks* energetic is worse than no diagram.
5. **One accent.** Vermilion is the only accent color. Green means "correct/positive" only. Cool→hot blue/red is for sequential heat-maps only. Don't introduce new hues.
6. **Concept-before-definition & term styling:** Always explain a concept in plain English *before* introducing/naming the term. Wrap defined terms in `<strong class="term">` — this applies the dashed vermilion underline AND triggers a hover/tap tooltip from `glossary.js` when the text slug matches a `GC_GLOSSARY` key. Add `data-term="slug"` to override the auto-slug when the visible text doesn't normalize cleanly. When you introduce a new defined term in a lesson, add it to `assets/glossary.js` too. A mismatched slug (auto-generated or a stale `data-term` override) is a **silent no-op** — no error, just no tooltip — so after adding or editing a term, verify the slug actually resolves against `glossary.js` rather than assuming it does.
7. **No LaTeX formatting:** Never use LaTeX formatting syntax (like $H_2$, $O_2$, or $\Delta EN$) in HTML content. Instead, use HTML tags (e.g., `H<sub>2</sub>`, `O<sub>2</sub>`, `&Delta;EN`) to ensure proper, clean rendering in the browser without any math engines.
8. **Keep storylines/contexts light and tangential:** Focus heavily on the core chemistry, not the storylines. The storylines (e.g. roti prata, grill) are tangential and can be referenced briefly, but always in a general way that works for any student, even if they are unfamiliar with the specific story context. Do not let contexts overwhelm chemical explanations.
9. **Follow the VOICE.md Prose Contract:** All student-facing text must follow the rules in `VOICE.md` (root directory): use second person ("you"), predict specific misconceptions by name, concrete before abstract, short declaratives, no throat-clearing, and describe consequences rather than just definitions. Widget feedback must explain the temptation of the incorrect choice, never just say "incorrect". Run the `VOICE.md` §6 QA pass (read aloud, check banned words, check misconceptions) before declaring any page done.
10. **Gated Interaction Contract (INTERACTION_SPEC.md):** Commit-before-reveal is mandatory on all widgets and predict prompts. Never let the student see the answer or proceed without committing an answer first. Parity for keyboard and touch, no persistence of state on reload. Green means correct/positive only; incorrect uses vermilion outline/text, never red fill. Follow the widget config patterns and motion controller specifications defined in `INTERACTION_SPEC.md` (root directory).
11. **QA Gates:** Every ⚑ chemistry item verified before build; no reveal reachable without a commit; a reduced-motion pass; a `VOICE.md` §6 pass; screenshots reviewed at both widths before a session closes. (Historical session-by-session sequencing lived in the now-retired `BUILD_PLAN.md` — see `CHANGELOG.md` — but the gates themselves are still binding on any new work.)
12. **Sequenced diagrams use the step motion primitive only.** Any "click through frames" diagram must use `data-motion="step"` (see `INTERACTION_SPEC.md`), which crossfades one frame in place inside a fixed-height stage. Never show every frame at once in a `flex-wrap` grid — that stacks/scatters frames instead of replacing them and was a repeated bug.
14. **Free-text gates never show a character cap.** Commit-before-reveal free-response widgets (`mode: "free"`) enforce a minimum length before enabling the check button, but the UI must never display a number or a cap (no "12 / 30 characters"). Show a soft, non-numeric progress hint instead (see the shared `widgets.js`, `w-progress-hint`).
15. **Chemical formulas never break across a line.** Never place a `<sub>`-bearing formula as the sole content of a flex or grid item without wrapping it — flex/grid containers turn each inline run (including a bare `<sub>`) into its own item, tearing "CO<sub>2</sub>" onto multiple lines. Wrap inline formulas in a `<span>` (or `.formula` for pure nowrap) before they sit inside `.st-fields label` or similar flex containers.
17. **Unified Reference Center (References Drawer):** Any global study helper (like the Periodic Table, formulas/tables, calculator, or other quick converters) must be built inside the slide-out drawer layout (`#ptableDrawer` and `.ptable-panel` inside `assets/reference-center.js` / `assets/components.css`) rather than creating standalone widgets or loading raw elements. The drawer lives in its own file, because the dashboard (`index.html`) loads it too — there is exactly one drawer implementation, shared by both. `book.js` lists it as the "References" top-bar tool and calls `window.TB_REFERENCE_CENTER.open()`. Content added here must read strictly from the canonical lesson data or committed review sheets in `public/chem/References/`.
21. **No Emoji in Arrows & Levers:** Emoji (like 🔴, 🔵, 🟢, 🌡️, 👁️) must NEVER be used inside `.arrow` divs or as step icons. Use clean typographic arrows (`&rarr;`, `&darr;`, `&uarr;`, `&harr;`).
22. **Canonical Rapid Retrieval (`.recall-section.recall`):** Section 05 of all lessons must use canonical `.recall-section.recall` with `.blank[data-answer]` blanks. Flashcard-only sections break dashboard Spaced Repetition (SRS) / Cram review engines. All self-explanation prompt cards must use commit-reveal gating (reveal button disabled until student types a substantive response).
*(Rules 13, 16, 18, 19, 20, 23 and 26 were replaced by the standard in session 4c: figures and frames
are STYLE_STANDARD 4 and 5.2, equations are `.eq-display` (5.2), the animation lifecycle is the sim helper
(RUNTIME_SPEC 4.3), and the type scale is STYLE_STANDARD 3. The numbers are kept so older notes still match.)*
24. **Particle Chamber Bay Grid Architecture:** In multi-particle reaction simulations (such as stoichiometry, limiting reactants, equilibrium, or gas kinetics), never scatter particles using arbitrary random positions or unconstrained float coordinates, which inevitably collide or overlap at high quantities. Partition the container chamber into dedicated coordinate bays or cells (such as an N x M grid with minimum clearance d >= 36px and boundary insets), allocating distinct non-overlapping cells to reaction units and excess species to mathematically guarantee zero collision across all reactant amounts.
25. **Comparative Dual-Panel Simulation Architecture:** When illustrating structure-property relationships (such as saturated vs. unsaturated fatty acid melting behavior, or polar vs. nonpolar intermolecular forces), provide synchronized side-by-side simulation panels controlled by a single unified parameter slider (such as temperature) with quick-jump preset buttons, rather than forcing students to toggle or scroll across disjointed widgets. Position the scientific argument builder or reasoning scaffold full-width directly below the dual simulator so visual evidence remains in direct view while drafting claims.
27. **High-Resolution Photography & Johnstone's Macro-Micro Standards:** Authentic laboratory photography completes Johnstone's Triangle by providing the macroscopic observational anchor alongside submicroscopic models. All photos must be wrapped in `<figure class="figure photo">` or paired within `.macro-micro-grid` (Macroscopic Observation on left, Submicroscopic Model on right). Photos must use `.photo-img` to exempt them from dark mode white-backing matting, support click-to-zoom lightboxing automatically, use `loading="lazy" decoding="async"`, and provide rich declarative captions. Strict zero em-dashes apply to all photo captions.

---

## 4. File / Project Structure

### Root Planning & Guidelines Directory
```
TEXTBOOK_DEV_GUIDE.md   Behavioral guidelines & design constraints (this file)
CHANGELOG.md            Dated, one-line log of what shipped — add an entry every time you push to GitHub
README.md               Comprehensive project context, setup, and deployment notes
BUILDING.md             Step-by-step checklist for building a lesson
DIAGRAM_CONTRACT.md     Checkable diagram rules and --dia-* token values (the retrofit plan behind them is archived)
DIAGRAM_WORKFLOW.md     How to draw and check a diagram
VOICE.md                Pedagogical tone and feedback text style contract
INTERACTION_SPEC.md     Specifications for retrieval widgets and motion controllers
```
`Ongoing Work/` is the voice-note feedback staging folder (see the Voice Note Feedback Workflow above) — it should otherwise stay empty. A stale, out-of-sync duplicate of five of the docs above once lived there (leftover from an incomplete doc-consolidation merge) and has been removed; don't recreate it there. An orphaned `content_audit.md` content-gap snapshot has likewise been removed — re-run a fresh audit if one is needed rather than trusting an old one. `Diagram_Inventory_v2.md` and `Content_Expansion_v2.md` (the 1-2b seed docs) have been retired now that 1-2b is built — don't recreate them. `BUILD_PLAN.md`, `LESSON_1-2B_PLAN.md`, `REMEDIATION_PLAN.md`, `PDF_EXPORT_PLAN.md`, `REVISION_PLAN.md`, and `FEATURES.md` have likewise been retired now that their work is done and their durable facts migrated into this file, `TODO.md` (since archived as `docs/archive/TEXTBOOK_TODO.md`), `INTERACTION_SPEC.md`, and `BUILDING.md` — see `CHANGELOG.md` for what each covered; don't recreate them.

**Update `CHANGELOG.md` every time you push to the GitHub repo** (a merge to `main` deploys the whole app, textbook included — see `README.md` §Automated Publishing). Add one dated line summarizing what the push contains before or as part of that push. This is separate from `FUTURE_FEATURES.md` (open work): the changelog is an append-only historical record, never edited after the fact. When it grows long, older entries move unedited to `docs/archive/` (June to September 2026 are in `docs/archive/TEXTBOOK_CHANGELOG_2026-06_TO_09.md`).

**And if the change is visible to a student or teacher, add a plain-language entry to `public/chem/about.html` §06.** Two records, two audiences: `CHANGELOG.md` is the engineering log (file names, root causes, commit detail), `about.html` is the public version history. An internal refactor needs only the first; a new lesson, a fixed widget, or a behavior change needs both.

### Deployed Site Directory (`public/chem/`)
```
public/chem/
  assets/
    tokens.css       the per-book tokens of the standard (section 2.2), both themes, plus chem's subject families
    components.css   chem-only components: particle diagrams, the Bohr model, the periodic-table grid, the Reference
                     Center drawer, the dashboard, the practice bridge, the resume bar, the Socratic companion,
                     the lesson-only layouts, and the "legacy" rules that serve sims until they are rebuilt
    book.js          TB_BOOK config and top-bar tools, progress and spaced repetition (the "gc-textbook-progress"
                     record), Quick Check, Cram View, Synopsis checklist, resume bar, practice bridge, Socratic companion
    dashboard.js     the dashboard (lessons from lessons.json, progress, search, tabs, concept map, glossary)
    reference-center.js  the slide-out Reference Center drawer (periodic table, formulas & tables, calculator);
                     a top-bar tool, loaded by every lesson and by index.html
    glossary.js      window.GC_GLOSSARY, also exposed as window.TB_GLOSSARY for the shared runtime; drives the tooltips
                     on <strong class="term">
    elements.js      window.GC_ELEMENTS: canonical periodic data (Z=1..36); read from here, never retype
    bohr.js          window.GC_BOHR: the canvas Bohr diagram that 1-1a and 1-1b draw with, and ion() for Na⁺ and Al³⁺
  lessons/
    <id>_<slug>.html one file per lesson; loads the shared runtime, then ../assets/*, then its own <id>.js
    <id>.js          lesson-specific interactives ONLY (Bohr builder, explorer, and so on)
  index.html         Home dashboard page and search portal
  about.html         Public colophon: how the book was built, the constraints it follows, and a
                     plain-language version history for students and teachers. It loads the shared
                     runtime like every other page. Linked from the dashboard as "How It Was Built".
                     §06 is the reader-facing twin of CHANGELOG.md: when a push changes something a
                     student or teacher would notice, add an entry there too.
  lessons.json       THE lesson manifest (id/slug/title/unit/pes/description). The dashboard and the
                     shared runtime's previous and next links both read it at runtime. Adding a lesson
                     means editing this one file (and the dashboard's unit text if it is a new unit).
  diagram-generator/ teacher-facing SVG diagram generator (Bohr/Lewis/models/reactions + PNG export); standalone assets, does NOT load tokens.css/components.css
```

The shared runtime (`public/textbook/`) holds the theme, top bar, contents menu, previous and next links,
lightbox, glossary tooltips, recall blanks, scoring guide, model answer, section stepping, print, the widget
framework and the sim helper.

Lesson HTML should be **mostly content**. Shared CSS/JS lives in `assets/`. If you find yourself copying a style or behavior between two lessons, lift it into `components.css` (chem-only) or ask David about the shared runtime.

---

## 5. File Manifest — Units 1 and 2 (13 files; every PE within a 3-file cap)

Built from the review-sheet sub-targets, with shared chemistry deduplicated into canonical files.

> **Scope note (2026-09-20).** This section covers the original Units 1–2 build
> only. The book has since grown to **27 lessons across five units**.
> `public/chem/lessons.json` is the authority for what exists; this list is kept
> because it records the *deduplication decisions* behind the shared canonical
> files, which nothing else captures. Do not read it as a current inventory.

**All 13 files below are built and exist in `public/chem/lessons/`** (confirmed 2026-08-10; see `CHANGELOG.md` for the build-order and bug-fix-pass history). This section is about scope/coverage, not QA state.

**Unit-1-specific**
- `1-1a` Atomic Structure & Electron Configuration — PS1-1.2, .3
- `1-1b` Periodic Trends & Reactivity — PS1-1.1, .4, .5   ← REFERENCE BUILD (match this one's discipline)
- `1-2a` Bonding & Electronegativity — PS1-2.1
- `1-2b` Molecular Polarity — PS1-2.1 (bond polarity + shape → molecular polarity → IMF; geometry shown as given fact, **no VSEPR**)
- `1-2c` Chemical Nomenclature — PS1-2.2 (ionic vs. covalent decision tree, charge balancing, Roman numeral oxidation states, polyatomic ions, covalent Greek prefixes; prerequisite for `1-3a`)
- `1-3a` Lewis Structures — PS1-3.4 (Lewis only; **no VSEPR headline**)
- `1-3b` IMFs & Properties — PS1-3.5 (+ HS-PS1-3 investigation coda)

**Unit-2-specific**
- `2-2a` Physical vs Chemical Change & Particle Diagrams — PS1-2.1, .4
- `2-7a` The Mole & Molar Mass — PS1-7.1, .5
- `2-7b` Mole Conversions — PS1-7.2, .8 (includes empirical & molecular formula determination — see decision below)
- `2-7c` Stoichiometry — molar ratios, BCA, limiting/excess — PS1-7.3, .4

**Shared canonical (serve both units)**
- `C-RXN` Reaction Types & Balancing — PS1-2.2, .3 (replaces a per-unit copy in each)
- `C-SPA` Structure → Property → Argument — PS2-6 (all sub-targets). Owns the fatty-acid shape → packing → LDF → property → argument reasoning and the GHS/food-texture applications; do not split into two files.

Decisions that are easy to re-make wrong, so they're fixed:
- **VSEPR**: not an assessed sub-target. At most a connective sentence inside `1-2b` or `C-SPA`. Never a headline section.
- **Empirical formula**: the original Unit-2 review sheet omitted it, but the 2026–27 curriculum materials reinstated it as target PS1-7.8 / Block 2.9. It lives in `2-7b` (Section 04b): a 4-step algorithm callout plus an interactive stepper for glucose, caffeine, and vitamin C.
- **Bond polarity + shape → molecular polarity → IMF** lives in `1-2b` (general case: which IMF a molecule gets). `C-SPA` owns the fatty-acid-specific packing/argument application, not general molecular polarity. Neither lives in `1-3a`, which stays Lewis-structures-only.

---

## 6. Pedagogical Spine (Every lesson)

Retrieval **and** re-narration, interleaved — never narrate-then-quiz at the end. The reference order, adapt as content needs:

1. **Hook** — a concrete phenomenon/contrast (kept *light*; the chemistry stands on its own, not hostage to the unit storyline). One callback to the class phenomenon is fine; don't make the file depend on it.
2. **Re-narration** — a second, differently-framed explanation of the core idea, carried by **diagrams** as much as prose. Keep prose tight; if a block feels text-heavy, convert part of it to a diagram or a tap-to-expand.
3. **Signature interactive** — at least one per file; a second only where the content earns it (e.g. `2-7c` wants a fillable BCA table *and* a limiting-reactant visual; `C-RXN` wants a drag-to-balance equation).
4. **Predict-then-reveal** — make them commit before the answer.
5. **Recall** (fill-in-the-blank), **self-explain** (free text + model answer), **exam practice** (constructed response + self-scorable scoring guide with a ⚑ on the move that separates full from partial credit).

Sections have no "Continue" buttons; only the hero has a "Start" button. The shared top bar builds a contents menu from `section[data-toc]`, and the page ends with the shared previous and next links. Sections are numbered `01…NN` via `.section-tag .num`.

---

## 7. Visual Language

- **Fonts** (all open-source Google Fonts, loaded via `@import` in tokens.css):
  - Display / UI / headings: **Hanken Grotesk** (heavy weights)
  - Prose: **Spectral** (lining figures forced via `font-feature-settings`)
  - Labels / data / chemistry: **IBM Plex Mono**
- **Palette**: cool sage graph-paper ground, deep ink, single **vermilion** accent, **green** = correct/positive. Faint graph-paper grid is the signature texture. Light + dark mode (toggle persists in localStorage).
- **Heat-maps**: sequential quantities use a **cool→pale→hot** (blue→red) diverging scale with luminance-based text color. *Categorical* data (e.g. metal vs nonmetal reactivity) uses the vermilion/green split instead — keep these distinct.
- Don't over-format. Minimal headers; prose over bullet lists in explanations.
- **Diagram sizes & Lightbox zoom:** Static diagrams must have a spacious, readable size (use standard wrap classes like `.compass-wrap` (600px), `.single-atom-wrap` (600px), and `.octet-wrap` (640px) or set appropriate inline `max-width` like `480px` or `580px`). Clicking any diagram SVG automatically opens a high-resolution, centered Lightbox viewer overlay with en-dash/subscript support.

---

## 8. Particle-Diagram Conventions (From the posters in docs/textbook/references/chem/ — ADHERE)

These are the class's established modeling conventions. Reuse the `.d-*` classes in `components.css`.

- **Particles** = filled circles (`.d-particle`); some atoms as squares (`.d-metal`). Distinct fills per a **legend** (always include one).
- **Framing** = dashed box (`.d-frame`) wraps a before→after system; a single snapshot uses a solid box. Label Before / After.
- **Container** = solid open-top walls (`.d-wall`) + a blue wavy water line (`.d-water`).
- **Conservation** = atom counts MUST match before and after.
- **Phase & motion**: solid = **brackets**, liquid = **lumps**, gas = **tails**; more marks = hotter / more energy. (Bring these in for phase/IMF/reaction files — `2-2a`, `C-RXN`, `1-3b`.)
- **Energy** = energy-bar diagrams (conserved total; gain/loss shown; bars lost as heat). **Note:** Energy-bar diagrams are deferred to Unit 3 (next unit) and MUST NOT be used in Unit 2. Use only particle diagrams for Unit 2.
- **Atomic level** = Bohr model (see `1-1b.js`); animate electrons orbiting.
- **Honest > pretty.** If a diagram can't be made chemically correct at the level shown, simplify the claim (e.g. show single-particle ionization instead of a fake macro reaction) rather than fudge it.

---

## 9. Shared Widget Contract (in the shared runtime, data-attribute driven)

The full contract is [`RUNTIME_SPEC.md`](RUNTIME_SPEC.md) section 4.1. In short:

- `[data-next]` → scroll to next `<section>` (the hero's "Start" button only)
- `section[data-toc="Label"]` → adds a contents entry
- `[data-more="label"]` + following `.more-body` → expand/collapse (the Synopsis)
- `data-widget="..."` with a `script.w-config` → a check (INTERACTION_SPEC). A multiple-choice question is `commit-reveal`; the old `data-predict` markup no longer exists.
- `.recall` container with `.blank[data-answer="a|alt"]` + `[data-recall-check]` `[data-recall-reveal]` `[data-recall-reset]` `[data-recall-feedback]`. Show answers waits for one check.
- `[data-peek]` + a following `.peek-box`: the model answer. The button stays disabled until the nearest textarea above it has text.
- `[data-scheme]` inside `.exam-frame` (toggles the `.scheme`), disabled until the student has written an answer
- `<strong class="term">` → hover/tap tooltip from `window.TB_GLOSSARY` (set by `glossary.js`). Slug = normalized text content (lowercase, spaces→hyphens, strip punctuation). Override with `data-term="slug"`.

`data-answer` accepts `|`-separated alternates; matching is case/space-insensitive.

Lesson-specific interactives go in `lessons/<id>.js` and must guard on element existence (`if (!el) return;`) so the file is safe to load anywhere.

---

## 10. Workflow Per Lesson

1. Read the relevant review sheet in `docs/textbook/references/chem/`. List the sub-targets.
2. Draft the section outline (hook → re-narration → interactive(s) → retrieval).
3. Decide the signature interactive(s) and any particle/energy diagrams.
4. Build the HTML (content + lesson JS), linking the shared assets. Script load order: see [`BUILDING.md`](BUILDING.md) (book.js, the shared core.js, widgets.js, sim.js, glossary.js, reference-center.js, elements.js if needed, then `<id>.js`).
5. For every `<strong class="term">` you write, verify the slug exists in `glossary.js`. Add a new entry if needed; do not leave a term without a definition.
6. **Verify chemistry.** Open the page in a web browser (using a local server) and test it thoroughly in both light and dark modes.
7. Fix what you see. Repeat.

**Tone for prose:** direct, lightly wry, second-person, no fluff — match the voice in `1-1b` and the author's older notes. Spell out abbreviations on first use (e.g. "ionization energy (IE)") before using the short form.
