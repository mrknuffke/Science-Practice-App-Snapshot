# Session prompts: textbook consistency project

Companion to `docs/plans/textbook-consistency-fixes.md` (the plan). One
session per phase, run in order. Each block names the model and effort level
to set **before** pasting the prompt.

**How to run a session**
1. Open a fresh Claude Code session in this repo (new chat, not a continuation).
2. Set the model and effort shown (`/model` in the Claude Code prompt).
3. Paste the prompt into the Claude Code prompt, not the terminal.
4. When the session stops, do your check, then reply with what it asks for.

**Always state the level.** Every session prompt below, and any new one
written later, opens with a `Model:` and
`Effort:` line. Do not run a session whose prompt lacks them.

| Session | Phase | Model | Effort | Pushes? |
|---|---|---|---|---|
| 1 | Foundation fixes | Sonnet 5.5 | medium | yes, after your check |
| 2 | Audits (all three books) | Sonnet 5.5 | high | no |
| 3 | Standard, runtime spec, briefs, governance | Opus 5.5 | high | no (commit only) |
| 4a | Shared runtime and bio migration | Sonnet 5.5 | high | no (local commits; 4R pushes) |
| 4R | Review of 4a | Opus 5.5 | high | yes, after your check |
| 4b | Physics migration | Sonnet 5.5 | high | yes, after your check |
| 4c | Chem migration, in six stages | Sonnet 5.5 | high | yes, once per stage, after your check |

Phase 4 is split by book on purpose: each book is its own push, and chem alone
carries 3,921 inline styles. That is too much for one session to finish safely,
so chem is also split into six stages (the new look, then one unit at a time).

---

## Session 1: Phase 1, foundation fixes

```
Model: Sonnet 5.5 (claude-sonnet-5-5)
Effort: medium

Execute Phase 1 of docs/plans/textbook-consistency-fixes.md (sections 1.1 to 1.5),
for the bio and physics books only. Do not touch chem.

Before any code:
- Read .claude/SESSION_NOTES.md, then the plan's "Rules for the implementing agent"
  and every file that section lists.
- Give me a short numbered plan: files you will touch per step, and how you
  will verify each. Then proceed without waiting.

While working:
- Follow the plan's steps exactly. Anything outside them goes in your report, not in code.
- 1.2: if the generalised token test finds undefined tokens in physics or chem,
  list them; do not fix them.
- Two-attempt rule applies to every step.

Finish:
- Run npm run verify and show the result.
- Update the screenshot baselines as described in 1.1 ("Snapshots"), and list
  every image that changed.
- Give me the "Phase 1 manual checklist for David" with the localhost URLs, and
  STOP. Do not commit or push.
- After I confirm the checklist, run the commit-checklist skill, commit, and
  /ship. Then mark Phase 1 "done" and Phase 2 "ready" in the plan, and
  rewrite the top entry of .claude/SESSION_NOTES.md.
```

## Session 2: Phase 2, audits (read-only)

```
Model: Sonnet 5.5 (claude-sonnet-5-5)
Effort: high

Execute Phase 2 of docs/plans/textbook-consistency-fixes.md: audits 2A
(page and components), 2B (simulations against Appendix A) and 2C (content
level and register). Cover all three books, in this order: bio, physics, chem.

Rules:
- READ-ONLY. Change no lesson, asset, CSS, JS or test. Write only the three
  reports named in the plan (under docs/plans/audit/), plus
  .claude/SESSION_NOTES.md.
- Seed 2B with findings S1 to S9 and 2C with the seed list; do not re-derive them.
- Every pass/fail and every flag cites file and line, or quotes the text.
- Content belongs to David. Flag science and wording; never rewrite.
- 2C: quote each lesson's NGSS PE and its assessment boundary before judging
  "above level". Use Tier 3 caps from CLAUDE.md.

Pace and checkpoint:
- Finish all three audits for one book before starting the next.
- After each book, append its sections to the reports and rewrite the top entry
  of .claude/SESSION_NOTES.md with "Phase 2: <book> done, next <book>".
- If you run low on context, stop at a book boundary and say so. I will resume
  with the "Resume" prompt at the end of this file.

Finish:
- Run npx vitest run services/__tests__/docsIntegrity.test.ts (the reports
  must not name paths that do not exist).
- Give me a one-screen summary: the five worst components, the sims marked
  redesign, and the lessons marked "heavy rewrite". Then STOP.
- After I confirm, commit the reports (docs only, no push) and mark Phase 2
  "done" in the plan.
```

## Session 3: Phase 3, standard, runtime spec, briefs, governance

```
Model: Opus 5.5 (claude-opus-5-5)
Effort: high

/plan-first Phase 3 of docs/plans/textbook-consistency-fixes.md, using the
three audit reports in docs/plans/audit/.

Read first: .claude/SESSION_NOTES.md; the plan, including "Decisions David made
after the audit (2026-10-12)" (11 decisions, settled: do not re-ask them); the
three audit reports (each ends with David's questions, now answered in that
section); docs/textbook/VOICE.md; docs/RENDERING_GOTCHAS.md; the three dev
guides. Write "Enrichment" into the standard as a component (one visual and
markup design, used by all three books).

This is a design session with me, not a delegation. Work through the six
Phase 3 deliverables in order, and stop for my approval after each:
1. the style standard (type scale, rhythm, component catalogue, Sim Standard,
   reading-level policy), merging the shared parts of the three dev guides;
2. the shared runtime spec for public/textbook/;
3. per-sim briefs (one paragraph each; bio 1-1 traces matter);
4. the content rewrite policy and plan;
5. governance: the textbook-work skill, the "new textbook" recipe, the guard
   tests, and the CLAUDE.md and dev-guide updates that replace the stopgap note;
6. Phase 4 session prompts for sessions 4a, 4R, 4b and 4c, written into
   docs/plans/textbook-consistency-sessions.md. Each one must open with
   Model: and Effort: lines.

Ask me one question at a time when a decision is mine. Ground choices in what
a general high school student and a classroom teacher need.

Finish: run npm run verify, run the commit-checklist skill, and commit (no
push). Mark Phase 3 "done" and Phase 4 "ready" in the plan. Rewrite the top
entry of .claude/SESSION_NOTES.md.
```

## Sessions 4a, 4R, 4b, 4c: Phase 4 (final; written by Session 3, 2026-10-13)

**What every Phase 4 session builds from** (all approved in Phase 3):

| Document | What it settles |
|---|---|
| [`STYLE_STANDARD.md`](../../textbook/STYLE_STANDARD.md) | Type, layout, components, Enrichment, the Sim Standard, reading level |
| [`RUNTIME_SPEC.md`](../../textbook/RUNTIME_SPEC.md) | The shared files, their API, and the order of moves |
| [`textbook-sim-briefs.md`](../../plans/textbook-sim-briefs.md) | One brief per sim, and the values the build must not guess |
| [`textbook-rewrite-plan.md`](../../plans/textbook-rewrite-plan.md) | What each page's content edit is, and what a session may not change |
| The `textbook-work` skill | The reading list, the checklists and the guard tests |

**How a book moves.** Three local commits, in this order: markup (no word a
student reads changes), then content, then sims. The session writes a review
sheet of every changed question, Enrichment boundary and hero text. Nothing is
pushed until you have checked the pages and the sheet.

**The two lists in the guard-test baseline**
(`services/__tests__/textbookStandard.baseline.json`). A session adds its book
to `migrated` in the markup commit and to `finished` after the sims commit. Each
list switches on stricter tests for that book.

**Chem runs in stages.** The 4c prompt is pasted once per stage, in a fresh
session each time. `.claude/SESSION_NOTES.md` says which stage is next.

### 4a: shared runtime and bio

```
Model: Sonnet 5.5 (claude-sonnet-5-5)
Effort: high

Execute session 4a of the textbook consistency project: build the shared
textbook runtime in public/textbook/ and move the bio book onto it. Change
nothing under public/chem/ or public/physics/.

Read first, in this order:
1. .claude/SESSION_NOTES.md
2. the textbook-work skill, and the files its section 1 lists
3. docs/textbook/RUNTIME_SPEC.md, all of it. Section 6 "4a" is your step list
   and section 8 is your test list.
4. docs/textbook/STYLE_STANDARD.md, all of it
5. docs/plans/textbook-rewrite-plan.md, sections 1, 2, 3, 5 and 7
6. docs/plans/textbook-sim-briefs.md: "What every sim gets", the four bio
   briefs, and "Values the build must not guess"
7. the bio sections of the three reports in docs/plans/audit/, for evidence

Then give me a numbered plan (files per step, and how you will verify each)
and proceed without waiting.

Rules for the whole session:
- This prompt is my request to commit. Commit locally at the end of each step,
  after npm run verify and the commit-checklist skill. Textbook changes are
  recorded in docs/textbook/CHANGELOG.md and public/bio/about.html, not in
  ChangelogView. NEVER push: session 4R reviews this work first.
- Build to the specs. Where a spec is silent, or two documents disagree, stop
  and ask me one question. Do not improvise.
- Content is mine. Section 1.2 of the rewrite plan says what you may and may
  not change. Every "For David" item goes in the review sheet, undecided.
- Two-attempt rule on every step. Zero em-dashes. No new dependencies.
- Look at pages with /verify-ui or the dev server. Build no browser harness.
- If context runs low, stop at a step boundary with that step committed,
  rewrite .claude/SESSION_NOTES.md, and tell me to use the Resume prompt.

Step 1: the shared runtime (one commit).
- Write the shared files listed in RUNTIME_SPEC section 2.1, to the standard.
- widgets.js starts as a copy of chem's widget framework (the line ranges are
  in RUNTIME_SPEC section 3) with only the three changes section 6 names. Do
  not edit chem's copy.
- Build public/textbook/specimen.html: every component in the standard's
  section 5, every widget type, one Enrichment block, and one working sim
  built on TB.sim.create that meets the Sim Standard. It switches between the
  three books' tokens and both themes.
- Add the shared files and the specimen to scripts/preflight/check-routes.mjs
  and tests/smoke/textbook.smoke.ts. Write the widget-print test (RUNTIME_SPEC
  section 8, item 5).
- STOP. Give me the specimen's localhost URL and a short list of what to look
  at. Continue when I reply.

Step 2: bio markup (one commit). No word a student reads changes.
- Follow RUNTIME_SPEC section 6, "4a", item 3. Every bio page loads the files
  in the order of section 2.3.
- Move every page to the standard's components, using the migration map in
  the standard's section 10. Checkpoints become widgets with their existing
  words. The hero takes the standard's form with the existing title.
- I authorise deleting public/bio/assets/core.js and every rule in bio's
  components.css that the shared files now define.
- Keep the four sims running as they are. Their rebuild is step 4.
- Add "bio" to "migrated" in services/__tests__/textbookStandard.baseline.json.
  Lower the baseline with the command the test prints. The target for bio is
  zero inline styles, zero <style> blocks and zero inline scripts. List
  anything left, with the reason.

Step 3: bio content (one commit). Only words, question data and Enrichment
boundaries change.
- Apply section 3 of the rewrite plan page by page, the voice pass in section
  1.4, the replacement glossary in section 5 and the hero titles in section 7.
- Build the review page's auto-checked section (plan decision D8) from the
  lessons' own checkpoints.
- Write the review sheet (rewrite plan section 1.3) to
  docs/plans/review/bio.md. Do not commit it.

Step 4: bio sims (one commit).
- Rebuild the four sims to their briefs, on TB.sim.create, with the defaults in
  "Values the build must not guess".
- Walk each sim through all 27 items of the Sim Standard. For each item say
  "checked by reading the code" or "David must look".
- Add "bio" to "finished" in the baseline file and lower the baseline again.

Step 5: finish.
- Run npm run verify. Then run
  PREFLIGHT_PLAYWRIGHT_ARGS=--update-snapshots npm run preflight
  and list every screenshot that changed. Commit the new screenshots.
- Update section 2 of docs/textbook/BIOLOGY_DEV_GUIDE.md so it describes the
  book as it now runs, and the "Today" bullet in CLAUDE.md's textbook section.
- Mark 4a "done, awaiting 4R" in the plan's Phase 4 table and rewrite the top
  entry of .claude/SESSION_NOTES.md.
- Give me: the commit list; the bio checklist (each page's localhost URL, with
  what to click and what I should see, in both themes, at phone and laptop
  width, and in print preview); the review sheet's path; every "David must
  look" item; and anything you did that a spec did not call for.
- STOP. Do not push.
```

### 4R: review of 4a

```
Model: Opus 5.5 (claude-opus-5-5)
Effort: high

Review session 4a of the textbook consistency project (the shared runtime in
public/textbook/ and the bio migration) before it is pushed. This first
migration sets the pattern for physics and chem, so review the pattern as well
as the code.

The work is in local commits: git log origin/main..HEAD. The first two commits
in that range are docs-only (Phases 2 and 3) and are not under review.

Read first: .claude/SESSION_NOTES.md; the textbook-work skill;
docs/textbook/RUNTIME_SPEC.md; docs/textbook/STYLE_STANDARD.md; the bio parts
of docs/plans/textbook-sim-briefs.md and docs/plans/textbook-rewrite-plan.md
(with its section 1); and the review sheet at docs/plans/review/bio.md.

Part 1: review. Change nothing yet.
a. Run /code-review at high effort on the 4a commits.
b. Runtime against RUNTIME_SPEC: the file list, the load order, the TB API,
   the theme keys and their one-time migration, and the checks in section 8.
c. Diff public/textbook/widgets.js against chem's widget framework. The only
   differences allowed are the three named in RUNTIME_SPEC section 6. Confirm
   nothing under public/chem/ or public/physics/ changed.
d. Each bio page against the page checklist in the standard's section 11.
e. Each bio sim against its brief and all 27 items of the Sim Standard, by
   reading its code. Mark each item pass, fail, or "David must look".
f. The content commit against section 1.2 of the rewrite plan: no data value,
   graph, worked answer or science claim changed, and nothing cut that the
   plan does not list. Every changed question in the diff is on the review
   sheet.
g. Every feedback string and scoring-guide line against docs/textbook/VOICE.md
   section 6 and the standard's section 8.4.
h. The guard tests: no baseline number went up, bio is in "migrated" and
   "finished", and each strict check fails when you break its rule on purpose.
   Restore the file after each test and confirm with git status.

Report the findings by severity, each with file and line, and say for each
whether the code is wrong or the spec is wrong. Then STOP.

Part 2: after I reply.
- Fix only what I approve, as new local commits.
- Run npm run preflight. If a fix changed a page, update the screenshots as
  4a did and list the ones that changed.
- Give me the visual checklist with localhost URLs, and STOP again. I will
  come back with my check and my edits to the review sheet.

Part 3: after my check.
- Apply my review-sheet edits, then delete docs/plans/review/bio.md.
- Run the commit-checklist skill, then /ship. Confirm 200 on the production
  root, /chem/, /physics/, /bio/ and one bio lesson.
- Write "Pattern corrections from 4R" into the plan's Phase 4 section: what
  the next two migrations must do differently. Where the review showed a spec
  was wrong, correct the standard, the runtime spec, the textbook-work skill
  or the 4b and 4c prompts, and list each correction for me.
- Mark 4a and 4R "done" and 4b "ready" in the plan's Phase 4 table. Add an
  entry at the top of docs/archive/CLAUDE_HISTORY.md. Rewrite the top entry of
  .claude/SESSION_NOTES.md.
```

### 4b: physics

```
Model: Sonnet 5.5 (claude-sonnet-5-5)
Effort: high

Execute session 4b of the textbook consistency project: move the physics book
onto the shared runtime that bio already uses. Change nothing under
public/chem/.

Read first, in this order:
1. .claude/SESSION_NOTES.md
2. "Pattern corrections from 4R" in docs/plans/textbook-consistency-fixes.md.
   Where it disagrees with this prompt, it wins.
3. the textbook-work skill, and the files its section 1 lists
4. docs/textbook/RUNTIME_SPEC.md and docs/textbook/STYLE_STANDARD.md, all of both
5. docs/plans/textbook-rewrite-plan.md, sections 1, 2, 4, 5 and 7
6. docs/plans/textbook-sim-briefs.md: "What every sim gets", the physics
   briefs, and "Values the build must not guess"
7. the physics sections of the three reports in docs/plans/audit/
8. one migrated bio lesson and its sim script, as the worked example

Then give me a numbered plan (files per step, and how you will verify each)
and proceed without waiting.

Rules for the whole session:
- This prompt is my request to commit. Commit locally at the end of each step,
  after npm run verify and the commit-checklist skill. Textbook changes are
  recorded in docs/textbook/CHANGELOG.md and public/physics/about.html, not in
  ChangelogView. Do not push until I have checked the book.
- The shared files in public/textbook/ now serve bio as well. Change one only
  to fix a defect or to add something the runtime spec calls for. Add the
  change to the specimen page, and list every such change in your report.
  Chem's own widget framework stays frozen.
- Build to the specs. Where a spec is silent, or two documents disagree, stop
  and ask me one question. Do not improvise.
- Content is mine. Section 1.2 of the rewrite plan says what you may and may
  not change. Every "For David" item goes in the review sheet, undecided.
- Two-attempt rule on every step. Zero em-dashes. No new dependencies.
- Look at pages with /verify-ui or the dev server. Build no browser harness.
- If context runs low, stop at a step boundary with that step committed,
  rewrite .claude/SESSION_NOTES.md, and tell me to use the Resume prompt.

Step 1: physics markup (one commit). No word a student reads changes.
- Follow RUNTIME_SPEC section 6, "4b". Every page loads the files in the order
  of section 2.3. The Reference Center stays, as a physics-only tool.
- Move every page to the standard's components, using the migration map in
  the standard's section 10. Checkpoints become widgets with their existing
  words.
- Rebuild lesson 1-3 on the standard template, with its existing words. Its 27
  undefined classes and six dead behaviours go.
- I authorise deleting public/physics/assets/core.js and every rule in
  physics' components.css that the shared files now define.
- Keep every sim running as it is. Repairs are step 3.
- Add "physics" to "migrated" in the baseline file and lower the baseline.
  The target is zero inline styles, zero <style> blocks and zero inline
  scripts. List anything left, with the reason.

Step 2: physics content (one commit).
- Apply section 4 of the rewrite plan page by page, the voice pass in section
  1.4, the replacement glossary in section 5 and the hero titles in section 7.
- Mission names stay as names. Working text uses the plain teacher register.
- Draft the new core items the plan calls for: the one-dimensional items in
  1-3, and the momentum section in 2-3. Draft a glossary entry for each new
  Level 2 term. All of these go in the review sheet for my approval.
- Build the auto-checked section on both review pages (plan decision D8).
- Add no figures.
- Write the review sheet (rewrite plan section 1.3) to
  docs/plans/review/physics.md. Do not commit it.

Step 3: physics sims (one commit).
- Repair the 13 sims to their briefs, on TB.sim.create, with the defaults in
  "Values the build must not guess". The two "keep" sims get what their
  brief lists and no model change.
- Walk each sim through all 27 items of the Sim Standard. For each item say
  "checked by reading the code" or "David must look".
- Add "physics" to "finished" in the baseline file and lower the baseline.

Step 4: finish.
- Run npm run verify, then npm run preflight. There are no image screenshots
  (RUNTIME_SPEC 8.2); if the aria snapshot in tests/smoke/__snapshots__/
  changes, update it with
  PREFLIGHT_PLAYWRIGHT_ARGS=--update-snapshots npm run preflight
  and tell me why it changed.
- Update section 2 of docs/textbook/PHYSICS_DEV_GUIDE.md so it describes the
  book as it now runs, and the "Today" bullet in CLAUDE.md's textbook section.
- Give me: the commit list; the physics checklist (each page's localhost URL,
  with what to click and what I should see, in both themes, at phone and
  laptop width); the review sheet's path; every "David must look" item; every
  change to a shared file; and anything you did that a spec did not call for.
- STOP.

After my check:
- Apply my review-sheet edits, then delete docs/plans/review/physics.md.
- Run the commit-checklist skill, then /ship. Confirm 200 on the production
  root, /chem/, /physics/, /bio/ and one physics lesson.
- Mark 4b "done" and 4c stage 1 "ready" in the plan's Phase 4 table. Add an
  entry at the top of docs/archive/CLAUDE_HISTORY.md. Rewrite the top entry of
  .claude/SESSION_NOTES.md.
```

### 4c: chem (paste once per stage, in a fresh session each time)

```
Model: Sonnet 5.5 (claude-sonnet-5-5)
Effort: high

Execute the next stage of session 4c of the textbook consistency project:
moving the chem book onto the shared runtime. Chem has 27 lessons, so it moves
in six stages. Each stage ends with my check and its own push.

  Stage 1. The shared runtime and the new look, all 27 lessons. No word a
           student reads changes.
  Stages 2 to 6. Content and sims, one unit per stage, Unit 1 to Unit 5.

Read .claude/SESSION_NOTES.md and the Phase 4 table in
docs/plans/textbook-consistency-fixes.md. Tell me which stage you are starting
and what is already done. Do that one stage, then stop.

Read first, in this order:
1. "Pattern corrections from 4R" in the plan. Where it disagrees with this
   prompt, it wins.
2. the textbook-work skill, and the files its section 1 lists
3. docs/textbook/RUNTIME_SPEC.md and docs/textbook/STYLE_STANDARD.md, all of both
4. section 0 of docs/textbook/TEXTBOOK_DEV_GUIDE.md
5. for stages 2 to 6: docs/plans/textbook-rewrite-plan.md sections 1, 2, 5 and
   6; your unit's briefs in docs/plans/textbook-sim-briefs.md, with "What
   every sim gets", "Chem building tools" and "Values the build must not
   guess"; and your unit's sections of the three reports in docs/plans/audit/
6. one migrated physics lesson and its sim script, as the worked example

Then give me a numbered plan for the stage (files per step, and how you will
verify each) and proceed without waiting.

Rules for every stage:
- This prompt is my request to commit. Commit locally after npm run verify and
  the commit-checklist skill. Textbook changes are recorded in
  docs/textbook/CHANGELOG.md and public/chem/about.html, not in ChangelogView.
  Do not push until I have checked the stage.
- The shared files in public/textbook/ serve bio and physics. Change one only
  to fix a defect or as stage 1 describes. Add the change to the specimen
  page, and list every such change in your report.
- What must not change for a student is in RUNTIME_SPEC section 7: progress,
  spaced repetition, resume, the saved theme, every widget config and every
  lesson URL.
- Chem's own tools stay chem-only (RUNTIME_SPEC section 2.2).
- Build to the specs. Where a spec is silent, or two documents disagree, stop
  and ask me one question. Do not improvise.
- Content is mine. Section 1.2 of the rewrite plan says what you may and may
  not change. Every "For David" item goes in the review sheet, undecided.
- Two-attempt rule on every step. Zero em-dashes. No new dependencies.
- Look at pages with /verify-ui or the dev server. Build no browser harness.
- Work one unit of lessons at a time, with one local commit per unit.
  npm run verify must pass at every commit. Checkpoint
  .claude/SESSION_NOTES.md after each unit. If context runs low, stop at a
  unit boundary and say so. I will paste this prompt again.

Stage 1: the shared runtime and the new look.
- First, diff chem's widget framework, motion primitives and widget print code
  in public/chem/assets/core.js against public/textbook/widgets.js. Show me
  the differences before you change anything. Port what only chem has into
  the shared file. Do not drop a chem behaviour.
- Then move chem's script as the table in RUNTIME_SPEC section 3 says: each
  part goes to the shared file named there, stays in chem as book.js, or is
  deleted. I authorise deleting chem's core.js once book.js replaces it.
- That table removes the lesson manifest from chem's script. A drift guard in
  services/__tests__/sourceOfTruth.test.ts reads it. Update that guard, and
  drift guard 5 in CLAUDE.md, in the same commit.
- Move all 27 lessons to the load order of RUNTIME_SPEC section 2.3 and to the
  standard's components, using the migration map in the standard's section
  10. No word a student reads changes. The five building tools move to the
  shared sim shell with their existing words.
- Slim chem's tokens.css and set the 20px reading size. Delete every rule in
  chem's components.css that the shared files define.
- Keep every sim running as it is. Sim work is stages 2 to 6.
- Add "chem" to "migrated" in the baseline file and lower the baseline. The
  target is zero <style> blocks, zero inline scripts, and no inline style
  except a --dia-* diagram token. List anything left, with the reason.
- Delete the rules that section 0 of TEXTBOOK_DEV_GUIDE.md lists as
  superseded, and bring docs/textbook/BUILDING.md into line with the standard.
- Run npm run preflight. There are no image screenshots (RUNTIME_SPEC 8.2).
  Bio's and physics' smoke tests must pass unchanged. If one fails, stop and
  show me. If the chem dashboard's aria snapshot changes, say why.
- Checklist for me: a lesson I have progress in still shows it; spaced
  repetition, resume and my saved theme survive; one widget of each type
  works; Page Up and Page Down step sections while the arrow keys and Space
  scroll; three lessons per unit in both themes, at phone and laptop width,
  and in print preview.

Stages 2 to 6: one unit's content and sims (stage 2 is Unit 1).
- Content commit: apply section 6 of the rewrite plan to the unit's lessons,
  with the voice pass in section 1.4 and the replacement glossary in section
  5. Write the review sheet (section 1.3) to docs/plans/review/chem-unit-N.md.
  Do not commit it.
- Sims commit: build the unit's sims to their briefs, on TB.sim.create, with
  the defaults in "Values the build must not guess". The unit's building tools
  get the changes in "Chem building tools". Report any chemistry defect you
  find in a tool. Do not fix it.
- Walk each sim through all 27 items of the Sim Standard. For each item say
  "checked by reading the code" or "David must look".
- Lower the baseline. After Unit 5, add "chem" to "finished".

To finish any stage:
- Run npm run verify, then npm run preflight.
- Give me: the commit list; the stage's checklist with localhost URLs; the
  review sheet's path (stages 2 to 6); every "David must look" item; every
  change to a shared file; and anything you did that a spec did not call for.
- STOP.

After my check:
- Apply my review-sheet edits, then delete the review sheet.
- Run the commit-checklist skill, then /ship. Confirm 200 on the production
  root, /chem/, /physics/, /bio/ and one chem lesson from the stage.
- Mark the stage "done" and the next stage "ready" in the plan's Phase 4
  table. Add an entry at the top of docs/archive/CLAUDE_HISTORY.md. Rewrite
  the top entry of .claude/SESSION_NOTES.md, naming the next stage.
- After stage 6: update section 0 of TEXTBOOK_DEV_GUIDE.md and the textbook
  section of CLAUDE.md so they describe three migrated books, and mark Phase 4
  "done" in the plan.
```

---

## Resume (any session that stopped early)

Use the **same model and effort** as the session being resumed.

```
Model: <same as the interrupted session>
Effort: <same as the interrupted session>

Resume the textbook consistency project. Read .claude/SESSION_NOTES.md and
docs/plans/textbook-consistency-fixes.md. Tell me which session and step you
are resuming and what is already done, then continue that session's prompt
from docs/plans/textbook-consistency-sessions.md, starting at the next
unfinished step.
```
