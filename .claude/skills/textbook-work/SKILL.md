---
name: textbook-work
description: The one standard, the checklists and the guard tests for any work under public/chem/, public/physics/, public/bio/ or public/textbook/, and the recipe for a new textbook. Use before writing or editing a textbook lesson, simulation, widget, glossary, stylesheet or script.
---

# Textbook work

All three textbooks follow one standard. This skill tells you what to read, what
is true today, and what to check before you call the work done.

## 1. Read first, in this order

1. [`docs/textbook/STYLE_STANDARD.md`](../../../docs/textbook/STYLE_STANDARD.md):
   type, layout, components, Enrichment, the Sim Standard, reading level.
2. [`docs/textbook/VOICE.md`](../../../docs/textbook/VOICE.md) before writing any
   sentence a student reads.
3. [`docs/RENDERING_GOTCHAS.md`](../../../docs/RENDERING_GOTCHAS.md) before
   authoring content or a widget.
4. The book's own guide, for its colours, tools and PE list:
   [chem](../../../docs/textbook/TEXTBOOK_DEV_GUIDE.md),
   [physics](../../../docs/textbook/PHYSICS_DEV_GUIDE.md),
   [bio](../../../docs/textbook/BIOLOGY_DEV_GUIDE.md).
5. Only if you touch shared code or a sim:
   [`docs/textbook/RUNTIME_SPEC.md`](../../../docs/textbook/RUNTIME_SPEC.md) and
   [`docs/textbook/INTERACTION_SPEC.md`](../../../docs/textbook/INTERACTION_SPEC.md).

## 2. What is true today

All three books run on one shared runtime (Phase 4 of
[the consistency plan](../../../docs/archive/plans/textbook-consistency-fixes.md),
finished 2026-10-26).

**Check which books have moved:** the `migrated` list in
`services/__tests__/textbookStandard.baseline.json`.

| The book is | Its code lives in | A fix reaches |
|---|---|---|
| in `migrated` | the shared runtime, plus the book's tokens, glossary, `book.js` and lessons | every migrated book |
| not in `migrated` | its own `assets/` folder | that book only |

A second list, `finished`, names the books whose content and sims also meet
the standard. In a finished book the tests require every sim on the sim helper
and every multiple-choice question balanced. Since session 4c, stage 6 (2026-10-26),
all three books are in both lists, so every guard applies to every lesson.

In an unmigrated book, keep the classes the book already uses. Do not port code
between books, and do not start a book's migration outside its Phase 4 session.

## 3. Rules in every book, migrated or not

1. **No new inline `style=""`, per-lesson `<style>` block, hex colour or inline
   `<script>`.** The one exception is a `--dia-*` diagram token on an SVG
   element.
2. **Tokens only** for size, colour, radius and spacing.
3. **Every check gates on an attempt.** No answer, scoring guide or model
   response opens before the student commits something.
4. **Every sim meets the Sim Standard** (standard, section 7). A new or rebuilt
   sim follows its brief in
   [`textbook-sim-briefs.md`](../../../docs/plans/textbook-sim-briefs.md) if it
   has one.
5. **The core stays inside the PE's assessment boundary.** Content past it is an
   Enrichment block, or it is cut. The core never depends on an Enrichment
   block.
6. **Tier 3 voice.** Sentences of 12 to 18 words. Feedback opens with the reason,
   with no "Correct!" and no exclamation mark. Options balanced, key spread, no
   cartoon distractor.
7. **Every bolded term has a glossary entry.**
8. **Zero em-dashes** in anything you write.

## 4. What belongs to David

Data values, graphs, science claims, question content and which material is
core. You may reword, split sentences and move blocks as
[the rewrite plan](../../../docs/plans/textbook-rewrite-plan.md) allows. When
something looks wrong, report it. Do not change it.

Changed questions, new Enrichment boundaries and new hero text go to David in a
review sheet before a push (rewrite plan, section 1.3). The sheet lists every
scoring-guide line and every feedback string old and new, not a summary.

While a book's commits are local and waiting for review, push nothing else to
`main` (4a went live unreviewed that way). Read "Pattern corrections from 4R"
in [the plan](../../../docs/archive/plans/textbook-consistency-fixes.md) before any
Phase 4 session.

## 5. Checklists

### Editing or writing a lesson

- [ ] Components only (standard, section 5). Every class you use is defined.
- [ ] Headings are `h1` to `h4` in order, each larger than the text under it.
- [ ] Every check is a widget with per-option feedback. No feedback opens with
      a verdict ("Right.", "Correct!"); the guard fails on it.
- [ ] A cut that touches a claim: re-read the claim. If its meaning moved, flag
      it for David. Energy sentences: breaking bonds takes energy.
- [ ] Past-boundary content is in `details.enrichment` with the standard line.
- [ ] `VOICE.md` section 6 pass, plus the limits in the standard's section 8.4.
- [ ] Looked at in both themes at 360px and 1280px. For a public textbook page,
      `/verify-ui` or the dev server is fine. Ask David for anything you cannot
      see.

### Building or repairing a sim

- [ ] The title is the question. The prediction is inside the sim box and locks
      the stage.
- [ ] "Try this" steps, a legend, a Record table, and a follow-up check that
      uses the recorded rows.
- [ ] One set of numbers in the text, the table, the check and the sim.
- [ ] The default state is not already solved, and the first frame (what a
      locked sim and a print show) shows the model at work, never the answer.
- [ ] Time-based, registered, paused under reduced motion, sized from its box.
      `stepSeconds` is set so a Step press covers a useful stretch.
- [ ] A clock that stops on a data mark uses `sim.hold()`; Start over and every
      control that starts a run call `sim.release()`. No `performance.now()`
      workarounds.
- [ ] Run the model headlessly with its own constants: it hits the table's
      values, no quantity goes negative or past its fitted range when a control
      is pressed again and again, and every history is trimmed.
- [ ] A fitted curve claims what its table row's label says, or it is flagged.
- [ ] Actions that are not toggles are `.btn.ghost`, not chips. Every colour on
      the stage is in the legend, and no subject colour equals `--bad`.
- [ ] Colours and fonts from tokens. Canvas text at 11px or more.
- [ ] Walk the Sim Standard item by item and say which items you checked by
      reading and which David must look at.

### Before you finish

- [ ] `npx vitest run services/__tests__/textbookStandard.test.ts`. If it says a
      count improved, lower the baseline with the command it prints. The
      baseline never goes up.
- [ ] `npm run verify`.
- [ ] A student-visible change is recorded in `docs/textbook/CHANGELOG.md` and
      in the book's `about.html` section 06.
- [ ] A fixed rendering bug has a new entry and a check in
      `docs/RENDERING_GOTCHAS.md`.
- [ ] Give David the local URL and a short list of what to click and what he
      should see.

## 6. Recipe: a new textbook

Do not start a new book until the shared runtime exists (session 4a has
shipped). A new book is tokens, a glossary, a manifest and lessons. It writes no
layout CSS and no page behaviour of its own.

1. **Create `public/<book>/`** with:
   - `assets/tokens.css`: the per-book tokens of the standard's section 2.2, in
     both themes. Start from another book's file and change the colours.
   - `assets/book.js`: the `TB_BOOK` config (runtime spec, section 4.1).
   - `assets/glossary.js`, `assets/components.css` (empty to begin with),
     `lessons.json`, `index.html`, `about.html`, `lessons/`.
   - `docs/textbook/references/<book>/` (not under `public/`, which is served):
     each PE's statement, clarification statement and assessment boundary,
     verbatim.
2. **Write lessons** from the load order in the runtime spec, section 2.3, using
   only components from the standard.
3. **Register the book** everywhere the three existing books are listed:
   - `TEXTBOOKS` in `scripts/preflight/check-routes.mjs` and
     `tests/smoke/textbook.smoke.ts`;
   - `BOOKS` in `services/__tests__/textbookStandard.test.ts`,
     `services/__tests__/textbookFoundation.test.ts`,
     `services/__tests__/chemCssTokens.test.ts` and
     `services/__tests__/docsIntegrity.test.ts`;
   - `migrated` and `finished` in
     `services/__tests__/textbookStandard.baseline.json`, from the first
     commit.
4. **Write its guide** in `docs/textbook/`: accent colours, special tools, PE
   list. Nothing the standard already says.
5. **Update `CLAUDE.md` and `README.md`** where the books are listed.
6. **Ask David** before touching `vercel.json` for a subdomain redirect.
