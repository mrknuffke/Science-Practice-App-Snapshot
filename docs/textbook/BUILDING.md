# BUILDING.md: Per-Lesson Build Checklist (Handoff)

> **Updated 2026-10-23 (session 4c, stage 1).** All three books run on the
> shared runtime in `public/textbook/`. This is the checkable build loop for one
> chem lesson. Start any textbook work with the `textbook-work` skill. Where this
> file and [`STYLE_STANDARD.md`](STYLE_STANDARD.md) disagree, the standard wins.

Read [`TEXTBOOK_DEV_GUIDE.md`](TEXTBOOK_DEV_GUIDE.md) for chem's own rules and
the [LLM Behavioral Guidelines](TEXTBOOK_DEV_GUIDE.md#1-behavioral-guidelines-reduce-common-llm-coding-mistakes).
Work **one lesson at a time**. A migrated lesson in `public/chem/lessons/` is the
worked example; the specimen page (`/textbook/specimen.html`) shows every
component.

---

## Before writing
- [ ] Open the lesson's **review sheet** in `docs/textbook/references/chem/` and list its sub-targets. That sheet, not the consensus notes, is the content source of truth.
- [ ] Confirm scope against the lesson's PE in `public/chem/lessons.json` and its assessment boundary in `docs/textbook/references/chem/`. Anything past the boundary is an Enrichment block or it is cut.
- [ ] Keep the storyline light. The chemistry has to work for a student who does not know the story.
- [ ] Read `VOICE.md` before writing a sentence a student reads, and `docs/RENDERING_GOTCHAS.md` before authoring a widget.

---

## While writing
- [ ] **Load order** (RUNTIME_SPEC 2.3). In the `<head>`: `theme-boot.js`, `base.css`, `lesson.css`, then the book's `tokens.css` and `components.css`. At the end of the body: `assets/book.js`, the shared `core.js`, `widgets.js`, `sim.js`, then `assets/glossary.js`, `assets/reference-center.js`, `assets/elements.js` (only if the lesson needs element data), and the lesson's own script. No `?v=` query strings. `<html>` carries `data-book="chem"` and `data-lesson="<id from lessons.json>"`.
- [ ] **The page is `<main>` with sections.** One `<section data-toc="Label">` per numbered part, each with a `.section-tag` and an `h2`. The hero is `section.hero`. Do not write the top bar, the contents menu or the previous and next links: the shared script renders them. No "Continue" buttons; the hero's "Start" button is the one exception.
- [ ] **Components only** (standard, section 5). Text is styled by element, so unclassed `p`, `ul`, `h2`, `h3` and `h4` are right. No `style=""` (except a `--dia-*` diagram token), no `<style>` block, no inline `<script>` except a widget's JSON config, no hex.
- [ ] **Every check is a widget** (`data-widget`, JSON config; INTERACTION_SPEC). A model answer after a self-explanation is `button[data-peek]` with a `.peek-box`, and it stays locked until the student has written something. A written response is `.exam-frame` with a gated `[data-scheme]` button.
- [ ] **Never re-type periodic data.** Read it from `window.GC_ELEMENTS` (`public/chem/assets/elements.js`). If a value is missing, add it there, verified.
- [ ] **Lesson-only layout** goes in `public/chem/assets/components.css` under a comment that names the lesson. Behaviour that would be copied between two lessons goes in the shared runtime (ask David first) or `public/chem/assets/book.js` if it is chem-only.
- [ ] **Terms.** Wrap each defined term in `<strong class="term">`, and make sure its slug is a key in `public/chem/assets/glossary.js`. Use `data-term="slug"` when the visible text does not normalise to the key.
- [ ] **Figures.** `<figure class="figure figure--md"><div class="diagram">svg or img</div><figcaption>...</figcaption></figure>`. The width is a tier, never pixels. The figure lightboxes on click by itself.
- [ ] **Equations.** A standalone equation is `<div class="eq-display">`, which is block layout. A formula inside a flex or grid parent is wrapped in `<span class="formula">` so it cannot tear.

---

## Non-negotiables (visual and chemical)
- [ ] No LaTeX. Use `<sub>`, `<sup>` and Unicode in SVG and canvas.
- [ ] One accent (vermilion). Green means correct only. Incorrect is a `--bad` outline plus a word. Never colour alone.
- [ ] Sequence diagrams use `data-motion="step"`, never a show-all grid.
- [ ] Particle diagrams follow the posters in `docs/textbook/references/chem/`: filled circles (square for a metal), dashed before and after frame, solid walls, **conserved atom counts**, motion as brackets (solid), lumps (liquid), tails (gas). Always a legend.
- [ ] **Honest over pretty.** Do not draw what you cannot make chemically correct.

---

## Before declaring done
- [ ] **Verify every value** that reaches a student (configurations, ΔEN, molar masses, balanced equations).
- [ ] Look at the page in light and dark at 360px and 1280px, through the local server. No console errors.
- [ ] `npx vitest run services/__tests__/textbookStandard.test.ts`. If a count improved, lower the baseline with the command it prints.
- [ ] `npm run verify`, then `npm run preflight` before any push.
- [ ] Record a student-visible change in `docs/textbook/CHANGELOG.md` and in `public/chem/about.html`, section 06.
