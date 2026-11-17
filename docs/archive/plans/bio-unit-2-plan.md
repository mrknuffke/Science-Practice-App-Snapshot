# Bio Unit 2 plan: SAS General Biology

**Status (2026-11-08):** built. All nine lessons and both review packets (2a-review,
2b-review) are in `public/bio/lessons/`. Phases 0 to 5 done; David accepted the
visual check, sims and review sheet on 2026-11-08. Kept as the decision record.

Start any session on this plan with the `textbook-work` skill, then
[`BIOLOGY_DEV_GUIDE.md`](../../textbook/BIOLOGY_DEV_GUIDE.md).

## 1. Decisions (interview, 2026-10-27)

1. **One merged Unit 2** with six PEs: HS-LS1-5, HS-LS2-5, HS-LS2-1, HS-LS2-2,
   HS-LS2-4, HS-LS2-7. The anchor runs through the unit: Singapore's rainforest and
   the species it has lost (David, 2026-11-07). The SAS campus forest plots and the
   tiger story belong to the summatives, so no lesson uses them.
2. **Sources are mixed.** PLC materials are used where supplied, and Claude drafts
   the rest. David reviews every claim, number and question either way.
3. **Set by the PLC materials:** lesson order, how LS2-7 (design a solution) is
   taught, and how much math goes in the core vs. Enrichment.
4. **Phenomena:** Claude proposes two or three per lesson, and David picks. They
   become the hero lines.
5. **Sims only where earned:** a lesson gets a sim only when a moving model
   teaches something a table or graph cannot. Lessons also link out to the
   app's free sims where they fit (for example, Ecosystem Balance). The textbook
   cannot embed React. Every new sim gets a brief in
   [`textbook-sim-briefs.md`](../../plans/textbook-sim-briefs.md), approved before it is built.
6. **Cadence:** David approves the outline and sim briefs first. Then all lessons
   are built, then one review sheet in the format of
   [the rewrite plan](../../plans/textbook-rewrite-plan.md), section 1.3.

## 2. Intake location

PLC files go in `docs/textbook/bio-sources/unit-2/` (in the private repo, not
deployed). **Not** `public/`: everything under `public/` is
served at sciencepractice.app, answer keys included.

## 3. Phases

0. **Intake (David).** PLC materials go into the intake folder.
1. **Read and map (Claude).** Map each document to its PEs. Pull out the order,
   data sets, math expectations, vocabulary and the misconceptions teachers
   report. List the gaps. Add each PE's statement, clarification and assessment
   boundary, verbatim, to the References grid and `BIOLOGY_DEV_GUIDE.md` section 5.
2. **Outline for approval. STOP for David.** The lesson list (id, slug, PEs),
   phenomena candidates, and a core / Enrichment / cut table per lesson
   (rewrite plan section 3 format). Also: sim or no sim per lesson with briefs,
   app sims to link, new subject tokens, and glossary terms.
3. **Build.** Tokens and glossary, lessons, sims, review packet, `lessons.json`.
   All strict guards pass (bio is in `finished`, so they apply from the first
   lesson).
4. **Review sheet** to David. He checks locally at `localhost:5173/bio/`, then
   fixes are made.
5. **Records and ship.** Update `docs/textbook/CHANGELOG.md`, `about.html`
   section 06, `BIOLOGY_DEV_GUIDE.md` (scope, PEs, sim table),
   `FUTURE_FEATURES.md` ("beyond Unit 1: not planned"), `FEATURE_TRACKER.md`,
   and the scope line in `CLAUDE.md`. Then a green preflight and one push.

## 4. Open until the materials arrive

- Lesson numbering, and whether the photosynthesis and carbon lessons keep a
  "2a" label.
- One review packet for the unit, or one per half.
- Which app sims to link, and from which lessons.
