# CLAUDE.md change history

The dated log that used to live at the bottom of `/CLAUDE.md`, moved here on
2026-09-20. It was 78 KB against 37 KB of actual instructions, so the file agents
read to learn the rules was two-thirds history, and the entries were not even in
date order.

**This is a historical record, not guidance.** Model names, counts, file paths and
feature descriptions below were true when written. Where an entry conflicts with
`/CLAUDE.md`, `/CLAUDE.md` wins.

Entries are kept exactly as written, including the ones that later turned out to
be wrong; several are the only record of why a decision was made. New entries go
at the top, dated, newest first.

---

## 2026-11-17 - Public snapshot tool (`scripts/public-snapshot/`)

David wants to share the code with other teachers. The full history can't go public: it holds
answer keys (`docs/curriculum/`, `docs/textbook/references/`), files deleted from `public/` that
are still in old commits (College Board CEDs, PLC references), and his personal email on about
400 commits. A full-history secret scan found no credentials.

- **Decision: a separate public repo built from history-free snapshots,** not flipping this repo
  public or rewriting its history. `build-snapshot.sh` copies an allowlist from `HEAD` (new
  top-level files are left out until added), drops the private folders, adds the licenses, and
  stops on document files, key-like file names, secrets or unlisted emails.
- **Licenses (David, 2026-11-17):** MIT for code, CC BY-NC-SA 4.0 for teaching content (matching
  `docs/textbook/LICENSE`). Scope: app, all simulations and all three textbooks. Michelle Lee's two
  adapted sims go out under the same license. Student credits in `ChangelogView.tsx` (first name and
  last initial) are fine to publish; full student names would not be.
- **Still open:** SAS policy on PLC-derived textbook material, the empty public repo on GitHub, and
  turning on secret scanning there. A trial snapshot passed `tsc -b`, all tests and `vite build`.

## 2026-11-08 - SAS General Biology Unit 2 (2a Carbon, 2b Ecology) and Island Biogeography (19 simulations)

Built from the Biology PLC's Unit 2 materials (`docs/textbook/bio-sources/unit-2/`, gitignored:
local to David's machine). Decisions that are not obvious from the code:

- **Summatives stay out of the book.** No lesson reuses a summative or formative scenario, data set or
  question (SAS rainforest plots, Singapore tigers, SAS Food Web, Yellow River Estuary, cheatgrass,
  Wilson and Simberloff, the LS2-7 Design Project's client cards and rubric). 2b-review coaches the
  refine process only.
- **Every number comes from a cited, verified published source**, checked before drafting. CC BY-NC-ND
  sources (Chisholm 2023, Voigt 2018) are quoted as numbers in our own tables, never as figures.
- **Sims only where a moving model teaches what a table cannot.** Four new lesson sims (`2b-2.js` reef
  evenness, `2b-4.js` energy transfer, `2b-6.js` and `2a-2.js` teaching models, each labelled as one and
  checked headlessly against the lesson's numbers). 2b-6 took two failed fat-budget models before the
  carrying-capacity line was chosen (two-attempt rule). 2a-1 links the hub's Tracking a Carbon Atom
  instead of duplicating it.
- **2a-2 uses the single year 2023** from the Global Carbon Budget 2024, not the 2014-2023 average,
  because 2023's budget closes (11.1 - 2.9 - 2.3 = 5.9) and the decade's does not.
- **References left `public/`.** The three books' `References/` folders, answer keys included, were
  served publicly. They moved to `docs/textbook/references/<book>/`. Source material never goes under
  `public/`.
- **Island Biogeography** (`?page=island_biogeography`) joined the Simulations Hub, calibrated to
  Krakatoa 34 and Surtsey 15.

---
## 2026-11-02 - Element swaps, zero lint warnings, dialog and keyboard hooks

- **PE element swaps:** 20 HS-PS1-1 and HS-PS1-2 items draw a vetted element or compound set per run, each set with
  its own options and explanation (review sheet https://claude.ai/artifact/MoLYTegzbLRVtzmbWz4ZWA).
- **Types:** all 246 `no-explicit-any` warnings removed; ESLint at 0. Rule added to CLAUDE.md: warnings stay at 0.
- **Hook dependencies:** 20 warnings read one by one. Four were real stale-state bugs (game shortcuts and the timer,
  Flashcards' Write mode, the trend graph filter). The fix for keyboard shortcuts is `hooks/useWindowKeydown.ts`, not
  longer dependency lists.
- **Accessibility:** `hooks/useDialog.ts` on 36 modals and panels; 46 icon-only buttons named; guards
  `a11yButtons.test.ts` and `useDialog.test.tsx`. A shared ref on a div and its input had broken "jump to topic" focus
  in Document Creator and quiz setup.
- **Consolidation:** `components/games/GameModals.tsx` replaces eight copies of the game modals.

## 2026-10-28 - Osmosis Lab and Tracking a Carbon Atom (18 simulations)

Two simulations by Ms. Michelle Lee (SAS General Biology), from her Google Site, ported to React and rebuilt for
tier 3. Neither was copied: both had science errors that would have taught misconceptions.

- **Osmosis Lab** (`components/simulations/osmosis/`, `?page=osmosis`). The original used NaCl in
  dialysis tubing (NaCl passes it), had a 39 atm drive against a 110 mm tube so the column rose in a
  straight line and clipped, never diluted the bag, and pushed particles toward the solute. Now:
  sucrose, a scaled drive (`PRESSURE_MM_PER_M`, stated in the About panel), dilution, column
  back-pressure, an optional leaky membrane, and a particle window tuned so crossings balance at
  the model's stopping height. Engine tests in `services/__tests__/osmosisEngine.test.ts`.
- **Tracking a Carbon Atom** (`components/simulations/carbonJourney/`, `?page=carbon_atom`). The
  original said energy comes from breaking "high-energy bonds", drew O₂'s atoms joining carbon in
  CO₂, drew glucose as a six-carbon ring, and used cartoon distractors. Content now lives in
  `carbonJourneyData.ts`; equations carry atom counts so `services/__tests__/carbonJourney.test.ts`
  checks they balance, and the same test checks option balance and em-dashes.
- Wiring: registry, router, hub, `App.tsx` page map, `publicRoutes.ts`, `check-routes.mjs`,
  `app.smoke.ts`, README and CLAUDE.md lists. ChangelogView entry credits Ms. Lee (David asked).

## 2026-10-28 - Sign Out, a required profile card, and a role picker in User Options

There was no way to sign out short of "Fully Reset Profile", and the tour (skippable) was the only
place role or name came up, and it never actually asked for either. Added: `ProfileSetupModal` after
sign-in and before the tour (role required, name optional, `sp_profile_done`); a Student/Teacher
picker in Settings that replaces the separate "Teacher Tools space" toggle (same `teacherMode`);
Sign Out in the sidebar and Settings (`handleSignOut` in `App.tsx`, which clears the token, name and
`sp_profile_done`). `utils/googleAuth.ts` now routes the Google callback through a module variable,
because `initialize()` runs once per page and a Gatekeeper remounted after sign-out would otherwise
never hear the credential. `sp_open_resources_role` is written only on an explicit choice, so the
profile card can tell "never chose" from "student".

---

## 2026-10-27 - Docs cleanup: archive finished plans, FEATURE_TRACKER becomes a live tracker

Two passes in one push. Part 1 archived the textbook TODO, the consistency plan and its audits, the
textbook changelog before October, the FUTURE_FEATURES shipped history, and deleted `metadata.json`.
Part 2 rebuilt `FEATURE_TRACKER.md` (87 KB to about 42 KB): one entry per live component, grouped by
surface, no typed counts, version tags or status labels. Every claim was checked against the code;
wrong ones fixed (reflection is not public, `getTheme` lives in `hooks/useTheme.ts`, Charades, Taboo,
Test Creator and a dozen live modes had no entry). History moved unedited to
`docs/archive/FEATURE_TRACKER_HISTORY.md`. `DIAGRAM_STANDARDIZATION.md` was archived as superseded, not
finished: Phase 3 never closed and no lesson adopted the Phase 4 renderers. README lesson counts and the
teacher-tool count were dropped; a new guard compares README's mode list to `MODES_METADATA` by name.
MODE_REFERENCE's AP/IB split (26 + 8) was wrong against `COURSES` and now renders no number.

---

## 2026-10-27 - Adaptive PE practice: voice, scope and figures pass

David found the HS-PS1-2 practice overdone, above his general chemistry course, and asking about Lewis
structures without showing them. The same pass then went to HS-PS1-3, PS1-4, PS1-6, PS1-7, PS2-6 and PS4-4:
every item checked against what its linked lesson teaches (term counts in the lesson HTML, and for 5-4a the
split between core and Enrichment), rewritten to Tier 3, out-of-scope items replaced. PS1-2's nonpolar cutoff
(0.4) disagreed with 1-2a (0.5); PS4-4 still said DNA bonds take 3 to 5 eV after the 10-26 correction to 3 to 4.
Items gained a `figure` field drawn outside the glossary rewriter (which would put spans inside SVG text), with
helpers in `public/chem/pe/pe-figures.js`. The engine's two-part hint used to replace the item's own hint with
praise; the numeric fallback printed the answer. Open: the PE hub copy, six banks not yet reviewed, and where
collision orientation belongs (see `FUTURE_FEATURES.md`).

## 2026-10-27 - Project CLAUDE.md shortened (separate session)

`CLAUDE.md` went from 37,394 to 19,466 bytes in nine rows David approved. Nothing was dropped: each moved
block has a home named in `FUTURE_FEATURES.md` (October 2026) and in that session's notes. `docs/DRIFT_GUARDS.md`
is new. The `BEGIN:SIMULATIONS` block and the "no sign-in required, N total" phrase stay, because
`sourceOfTruth.test.ts` and `docsIntegrity.test.ts` read them.

## 2026-10-26 - Chem content corrections and tidy-up after Unit 5

David took my defaults for every open chemistry flag, and the follow-up work was done in one push. Corrected
text (each checked by hand): 5-1a coal (1 g of mass is about 3,500 tons of coal, not 20,000), 5-8a (0.1861 u is
173 MeV, 2.8e-11 J), 5-4a and the HS-PS4-4 practice explanations (a DNA bond needs about 3 to 4 eV, so 4.13 eV
UV can break one and a 28 GHz photon is about 30,000 times too weak), 5-3a (the Sun fuses helium to carbon and
oxygen only after its hydrogen runs out), 4-1a (the average collision at 25 C is 3/2 RT = 3.7 kJ/mol), 4-1b (best
temperature for many human enzymes 40 to 45 C, matching the model's peak at 44.5 C), 4-6a (the Haber yields now
name their pressure), 4-6b (one drop of 1 M HCl moves the pH of a litre of water to 4.3, not 3.0, so the lesson
uses 1.0 mL), 2-7a (methane 16.04 g/mol, flour to water 3:1), 1-2e (the combustion caption matches its figure),
3-14a (a note that the uncatalyzed barriers are the first bond to break). Not a defect: the "zero long-lived
waste" claim was already gone from the rewritten 5-1a. The practice-bridge map in `book.js` is keyed by manifest
id (14 lessons now get a bridge; the dead C-SPA and C-RXN entries are gone) with a guard in `chemBook.test.ts`.
The old token aliases in `components.css` are migrated to the standard tokens and deleted. `TODO.md` marks its
finished sections resolved and says nothing is queued after Phase 4.

---

## 2026-10-26 - Textbook session 4c, stage 6: chem Unit 5 content and sims; the chem book is closed

The five Unit 5 lessons (5-1a, 5-2a, 5-3a, 5-4a, 5-8a; manifest ids E1-1a, E1-2a, E1-3a, 4-4a, 1-8a), in three
local commits and one push after David's check (his review sheet needed no edits and is deleted; every "For
David" item stays at my default). Content: plain heroes, PE statements verbatim, per-option feedback,
checklist scoring guides, a Common mistake callout per concept section. 5-1a: the proton-proton chain, mass
defect and E = mc^2 are Enrichment. 5-2a: recombination, 2.725 K and Hubble's law are one Enrichment block.
5-3a: shells, binding energy and the s and r processes are Enrichment, and the "Type II" labels are cut.
5-4a: E = hf, eV values, the device comparison and the DNA chemistry are Enrichment. 5-8a: the half-life
equation, positron emission, mass-defect energy and the chain reaction are Enrichment. Sims on
`TB.sim.create`: 5-1a Sun (gravity and pressure arrows, a core-temperature step, a mass step), 5-4a radiation
(spectrum bar, four targets, photon-energy bar), 5-8a as three boxes (decay lab on 100 atoms, single fission,
chain reaction in Enrichment), 5-2a redshift analyzer (one straight-line rule), 5-3a two Enrichment tools.
Chemistry defects found by running each model and left for a content decision: the 5-1a coal comparison
(about five times too large), 0.1861 u is 173 MeV not 200 MeV (5-8a), UV-B at 4.13 eV against the "4 to 5 eV"
DNA-bond figure (5-4a), the old 5-2a analyzer's wrong presets and quadratic term (rebuilt), and an overstated
"zero long-lived waste" claim. Chem is now in `finished`: the Unit 5 legacy CSS, the `GC_REGISTER_ANIMATION`
alias (the only shared-file change, `public/textbook/sim.js`) and the `data-predict` code are deleted, the
Cram View selector no longer throws on exam sections, and the dashboard says "scoring guide". RUNTIME_SPEC
section 15 and INTERACTION_SPEC section 3.7 were rewritten. Known and left: the practice-bridge map in
`book.js` is keyed by file names for 14 lessons, so they get no bridge. Phase 4 is finished.

---

## 2026-10-25 - Textbook session 4c, stage 5: chem Unit 4 content and sims

The four Unit 4 lessons (4-1a, 4-1b, 4-6a, 4-6b; manifest ids 1-5a, 1-5b, 1-6a, 1-6b), in two commits and
one push after David's check (his review sheet needed no edits and is deleted; every "For David" item stays
at my default). Content: plain heroes, PE statements verbatim, per-option feedback, checklist scoring guides,
a Common mistake callout per concept section. 4-1a: the hydrogen and oxygen question rebuilt and the
Maxwell-Boltzmann figure in Enrichment. 4-1b (restructure): the core is what a catalyst does plus one
paragraph on enzymes; how enzymes work and the simulator are Enrichment. 4-6a: the Haber task is a
temperature question and a pressure question. 4-6b (restructure): the core is carbon dioxide in the blood
as one equilibrium and what breathing does to it; buffers, pH values and the simulator are Enrichment.
Sims on `TB.sim.create`, each model run on its own constants first: 4-1a's threshold let about 60% of all
collisions react at every temperature (heat barely mattered), 4-1b's activity formula was 95 times too
large at 37 degrees C and its "sites in use" came from a formula, 4-6a's rate law never settled at its own
constant (redesigned: one mass-action law, one particle per molecule, one change at a time, the clock stops
on the settle), 4-6b took 4.5 mM from blood and added 5 mM to water. Two traps found: a slider written off
its step grid showed 35 degrees C for 37, and a seeded collision model gave other numbers in Chrome than in
Node (cos, sin, exp and hypot differ in the last bit; the model uses plain arithmetic now). Both are in the
rendering gotchas with guards. `PROGRESS_MAP_2` gained 1-5b, 1-6a and 1-6b. Chem is `migrated`, not yet
`finished`; stage 6 (Unit 5) is next.

---

## 2026-10-24 - Textbook session 4c, stage 4: chem Unit 3 content and sims

The five lessons the manifest lists under Unit 3 (3-1a, 3-1b, 3-1c, 3-4a and 1-4a, file 3-14a), in
two commits and one push after David's check. Content: plain heroes, PE statements verbatim,
per-option feedback, checklist scoring guides, a Common mistake callout per concept section; the
microstate argument (3-4a) and the bond-energy sum with its calculator and practice item (1-4a) moved
into Enrichment, and 1-4a got a rebuilt core exam. 3-1a's three "Reveal worked solution" buttons had no
handler (the solutions showed before any attempt); they are free-text checks now. 3-4a's exam section
was never closed. Sims: nine tools on `TB.sim.create` or the gated shell (3-1a vessels and heat
calculator, 3-1b curve drawn to scale and stage calculator, 3-1c calorimeter as an svg stage, 3-4a
chamber and investigation graph, 1-4a profile with a picture per reaction and the Enrichment bond
calculator). Running each model repaired two things: the 3-4a chamber took particle speed from a role
multiplier, not the chamber's temperature (now held to the group's temperature, kinetic energy exactly
conserved), and 1-4a's reverse barrier was not the forward barrier plus the energy released. The 1-4a
barriers (436 and 945 kJ/mol) are bond energies and stay on David's list. `PROGRESS_MAP_2` gained 3-1a
and 1-4a. New guards: `chemUnit3Content.test.ts`, `chemUnit3Models.test.ts`, `chemUnit3.smoke.ts`
(with reduced-motion runs). No shared file changed.

## 2026-10-24 - Textbook session 4c, stage 3: chem Unit 2 content and sims

The six lessons the manifest lists under Unit 2 (1-2d, 1-2e, 1-7a, 1-7b, 1-7c, 2-6a; files 2-2a, 2-7a,
2-7b, 2-7c), in two commits and one push after David's check. Content: plain heroes, PE statements
verbatim, per-option feedback, checklist scoring guides, a Common mistake callout per concept
section, and the cartoon distractors in the 2-6a builders replaced by real misconceptions. Sims: 1-2d
(`loop:false` canvas change lab, prediction-locked), 1-2e, 1-7a and 1-7b (building tools, no lock),
1-7c (locked bond-change chamber plus a gated s'mores factory), 2-6a (looping dual-chamber sim).
Running each model found a 1-7c chamber that drew fewer reacting molecules than its table gave
moles; repaired. The dashboard's exam practice no longer falls back to the first checkpoint when an
exam frame holds no widget (15 lessons were affected). `PROGRESS_MAP_2` gained 1-2d, 1-7c and 2-6a.
New guards: `chemUnit2Content.test.ts` (including "every class used is defined"),
`chemUnit2Models.test.ts`, `chemUnit2.smoke.ts`. No shared file changed.

## 2026-10-23 - Textbook session 4c, stage 2: chem Unit 1 content and sims

The seven lessons the manifest lists under Unit 1 (1-1a to 1-3b), in two commits and one push after
David's check. Content: PE statements verbatim, plain Objective and Scope, feedback that opens with
the reason (the 12 converted predict questions finally got per-option feedback), checklist scoring
guides, a Common mistake callout per concept section, and two Enrichment blocks (the 4s and 3d
material in 1-1a, Roman numerals in 1-2c). 1-2c also needed the standard page structure it had
never received. Sims: 1-1a, 1-1b, 1-2a and 1-3b on `TB.sim.create`; the 1-1b trend table and chain,
1-2b, 1-2c and 1-3a as DOM tools in a `.sim-box` (`GC_GATE_TOOL` in `book.js`, `bohr.js`). Running each
model found a 1-3b vapor-pressure curve that disagreed with the page. A second progress remap
(`_map2`) keeps saved progress. The dashboard's exam practice now skips an Enrichment written
response. No shared file changed. The three new tests and the review-sheet pattern are the template for stages 3 to 6.

## 2026-10-23 - Textbook session 4c, stage 1: chem on the shared runtime

All 27 chem lessons, the dashboard, the colophon and the widget test page moved onto
`public/textbook/` in one commit (the old `core.js` could not go lesson by lesson and keep
`npm run verify` green), shipped in one push after David's check. No lesson sentence was
reworded. Chem's widget framework matched the shared copy (nothing to port), so the work was
the rest of chem's script: `book.js` (progress, Quick Check, Cram View, resume, bridge,
Socratic companion) and `dashboard.js`. The 23 `data-predict` questions became widgets, with a
one-time progress remap pinned by `chemBook.test.ts`. The shared files gained a gated model
answer, tool `id`/`target`/`icon`, and no "undefined" feedback; the theme toggle keeps writing
`gc-theme` because the app and chem's PE pages read it. Inline styles inside sims stay until
stages 2 to 6. Spec gaps and the problems found and left are in
`docs/textbook/CHANGELOG.md` and `docs/textbook/RUNTIME_SPEC.md` section 10.

## 2026-10-23 - Textbook session 4b: physics on the shared runtime

Physics moved onto `public/textbook/` in three local commits, then shipped in one
push after David's check. Step 1 moved the markup (all ten pages, the dashboard
and the colophon; lesson 1-3 rebuilt on the standard template; `core.js` deleted).
Step 2 was the content pass (plain-words heroes, per-option feedback, a spread key,
Enrichment boundaries, new one-dimensional 1-3 material, a momentum section in
2-3, a ramp section in 2-4, glossary entries for Level 2). Step 3 rebuilt all
thirteen sims on `TB.sim.create`, each model run headlessly in node before it
shipped, added `public/physics/assets/draw.js`, deleted the interim `legacy-*`
CSS, and added physics to `finished`. One gate script, `check-routes.mjs`, had to
learn that physics has `book.js`. David's review sheet needed no edits, so the
defaults in the sim briefs stand. Next is session 4c stage 1 (chem).

---

## 2026-10-22 - Textbook session 4R: review of the shared runtime and bio

Session 4a (2026-10-13 and 14) built `public/textbook/` and moved bio onto it.
Its commits went live on 2026-10-16, pushed with two unrelated fixes, before the
planned Opus review. 4R reviewed the live code against the runtime spec, the
standard, the briefs and the rewrite plan. It found 5 high and 9 medium
problems: a prediction gate that let Record work and showed 1-1's answer in its
readouts, sims that froze after stopping on a data mark, glossary tooltips that
never opened on a tap, review Problem 1 left claiming something the net equation
cannot support, and a key saying that breaking bonds releases energy.

David decided every open point in one sitting (15 review decisions and 12 sheet
items). The fixes are six commits plus this one, shipped together. Each fix to a
behaviour has a check that fails on the 4a code. The lessons for physics and chem
are in "Pattern corrections from 4R" in `docs/plans/textbook-consistency-fixes.md`.
Two worth repeating here: run every sim model headlessly before calling it done,
because the worst model bugs (negative hormone levels, a Type 2 curve fitted to a
pre-diabetic patient) only showed when the models were run; and push nothing else
to `main` while a book's commits wait for review.

## 2026-10-13 - Textbook consistency Phase 3: one standard for three books

Phase 2 (2026-10-12) audited all 42 textbook pages and 36 sims. Phase 3 was a
design session with David that turned the audit into rules:

- `docs/textbook/STYLE_STANDARD.md` (type, layout, components, the Enrichment
  block, a 27-item Sim Standard, reading level) and
  `docs/textbook/RUNTIME_SPEC.md` (the shared runtime the books move to).
- `docs/plans/textbook-sim-briefs.md` and `docs/plans/textbook-rewrite-plan.md`:
  one brief per sim and one content treatment per page.
- The `textbook-work` skill, and `services/__tests__/textbookStandard.test.ts`:
  a baseline of inline styling, unregistered sim loops and unresolved glossary
  terms that can only go down, plus strict checks that switch on per book.
- `CLAUDE.md` no longer says the books share no code. It says they are moving
  to a shared runtime, one book per Phase 4 session, and points to the skill.

Nothing a student sees changed. Phase 4 (sessions 4a, 4R, 4b, 4c) does the
migration. Plan: `docs/plans/textbook-consistency-fixes.md`.

---

## 2026-10-08 - Textbook consistency Phase 1 shipped

Bio and physics `tokens.css` now apply a page foundation (reset, `html`/`body`
from tokens, 20px body). Bio's undefined `--primary` became `--accent`, and the
token drift guard runs for all three books. Plan:
`docs/plans/textbook-consistency-fixes.md`. Phase 2 (read-only audits) is next.

---

## 2026-10-06 - CLAUDE.md trimmed; workflows moved to project skills

A `/doctor` pass and a prompt audit took `/CLAUDE.md` from 53 KB to about 35 KB.
Content a session can read from the code (file tree, tech stack, command list,
mode lists, ESLint rules) was cut. Three task-specific sections became project
skills under `.claude/skills/`: `commit-checklist` (pre-commit checklist, commit
and PR format), `new-simulation`, and `dev-sign-in` (local OAuth troubleshooting).
`.gitignore` now un-ignores `.claude/skills/` so they travel with the repo.

The audit also fixed facts the repo had outgrown (barrel importers, a missing
"Last Updated" section, simulation routing now in `SimulationRouter.tsx`, a pinned
co-author model name, a stale smoke-test count), dropped `CRITICAL`/`MUST` caps on
rules that already carry their reason, and reconciled the subagent rule with the
global file: known-cause fixes stay in the main thread, unknown-cause hunts go to
a subagent or `/diagnose`.

## 2026-10-01 - Simulation voice pass; About heading standardized

The second About-panel section had seven names across simulations and modes
("Controls & Parameters", "Controls & Levers", "Controls & Features", ...). It is
now "How to Explore" everywhere; builder simulations keep "How to Build...".
CLAUDE.md's required-section list was updated to match. The same pass removed em
and en dashes from `components/simulations/` and stripped exclamation-point
cheering ("Spot on!", "Masterful!") from challenge feedback, per VOICE.md rule 9.
Unit tests that asserted on those cheer words now assert on the science phrase.

---

## 2026-09-20 - Governance audit: one source of truth, physics under the gate

Six commits, `925ee6a..b1aef3c`, all pushed and deployed. Triggered by a request
to review the management docs and workflows for clarity, fidelity and cruft.

**The shape of the problem.** `CLAUDE.md` had reached 116 KB, 78 KB of which was
this change log, out of date order. Its own Drift Guards section argues that a
long list gets skimmed; the file had become the thing it warned about. Separately
a second rulebook had grown in `.agent/rules/` in a format only Antigravity
loads, carrying about ten rendering invariants `docs/RENDERING_GOTCHAS.md` had
never heard of. Two of those rules were being violated in the shipped textbook at
the time, because the file naming the rule was not the file anyone was told to
read.

**Docs (`d9b1d5f`).** Log moved here; CLAUDE.md is now 38 KB of things that are
true now. `.agent/rules/*` are pointers, enforced. The stranded invariants merged
into `RENDERING_GOTCHAS.md` (8 entries to 17), which is now the single source of
truth for both textbooks and the React app. Nine completed execution plans moved
to `docs/archive/` behind an index that says plainly nothing there is current;
`TESTING_DOCS_PDF_EXPORT.md` and `Simulations_Testing_Guide_v0.3.html` deleted as
byte-for-byte duplicates of files kept. Root markdown files 24 to 15. Fidelity
fixes: a file tree describing a `src/` that never existed, eleven references
across four docs sending people to `services/geminiService.ts` to edit prompts
(a barrel re-export since February), three links that resolved only on macOS,
`TEXTBOOK_DEV_GUIDE.md` claiming 13 lessons against 27, five shipped roadmap
items still listed as future.

**Physics under the gate (`da0941b`, `b1aef3c`).** `/physics/` had been live on
its own subdomain since 19 Sept with no route check, no smoke test and no drift
guard: the whole subtree could 404 with preflight green. Both now iterate a
`TEXTBOOKS` array. Added `PHYSICS_DEV_GUIDE.md` and `public/physics/about.html`,
the public colophon `TEXTBOOK_DEV_GUIDE.md` section 4 requires.

**Two live bugs.** `3-1c` carried `<text><em>q</em></text>` twice and `5-1a.js`
carried `<text>2 nu<sub>e</sub></text>`. Both ejected the rest of their drawing
into the page, silently.

**Guards 4 to 9, tests 22 to 68, routes 163 to 194.** Each new guard verified by
reintroducing its bug and watching it fail. The one that matters most: simulation
**names**, not counts. Merging Coffee-Cup Calorimetry into the Thermal Studio
left the total at 16, so the count guard passed while CLAUDE.md listed a
simulation that no longer existed and never listed its replacement. Also
`constants/publicRoutes.ts`, extracted from a map inside `App.tsx` that
`check-routes.mjs` had been hand-copying with a comment asking the next person to
keep it in step.

**Cruft (`760cfc0`).** `public/sciencepractice-support-page.html.bak` was tracked
and therefore served in production. Four dependencies with zero imports
(`three`, two `@react-three/*`, the deprecated `@google/generative-ai`), 36 MB
installed. `.gitignore`'s `.claude/*` had been swallowing `SESSION_NOTES.md`, so
`/checkpoint` wrote a file that could never be committed. `package.json` was
still named `biomaster-ap`.

**Dev sign-in helper (`f81d82a`).** Found uncommitted in the working tree, not
written in this session. Confirmed dev-only on four counts, then hardened: it had
signed with a fixed string committed to this repo at four call sites, and
answered on any interface. Now the configured secret or a per-process random key,
loopback only. CLAUDE.md's "there is deliberately no test-auth fixture" rewritten
to distinguish David's tool from the automation path agents still must not take.

**CI (`c32b733`).** `ci.yml` deleted. `preflight.yml` runs `npm run verify` as
its first step, a strict superset, so the second workflow was building, linting
and testing a second time on every push without even buying an earlier failure.

**Known and not fixed:** the physics book is effectively non-responsive, two
media queries against chemistry's 29, content cut off at 420px on every page
including the new colophon. Pre-existing, confirmed by before-screenshots. A
topbar fix was attempted, made the topbar correct, left the page-level overflow,
and was reverted rather than shipped half-done. Captured with everything else
from this pass in `docs/textbook/TODO.md` section 00.

---

- **Date**: 2026-09-13
- **Last Updated By**: Antigravity (development workflow rules, verification gate & safety protocol)
- **Recent Changes**:
  - **Developer Workflow Invariants, Verification Gate & Safety Protocol** (2026-09-13):
    - Added `npm run verify` script chaining `tsc -b`, ESLint, Vitest, and production Vite build
    - Added explicit rules against ad-hoc browser automation / Playwright harnesses / session token minting (user is visual acceptance tester)
    - Codified content and rendering invariants (no raw HTML in data strings, CSS reset list styling on `<ul>`/`<ol>`)
    - Enforced scope and target surface protocol (confirm surface, describe before/after, enumerate variants before writing code)
    - Added corresponding `.agent/rules/development-workflow.md`
  - **Site-Wide Accuracy Audit & Chemistry Textbook Colophon** (2026-09-05):
    - **Stale model claim.** `HowItWorksView.tsx` advertised "Gemini 2.5 Flash." `DEFAULT_MODEL` has been `gemini-3.6-flash` since the 2026-07-24 upgrade. The page now names both the default and the deliberately-pinned `gemini-2.5-pro` vision path, and notes the serverless proxy. `DEVELOPER_GUIDE.md` had the same rot, two versions further behind (`gemini-2.0-flash`).
    - **The same drift in code, not just docs.** `components/APReviewTutorView.tsx` hardcoded `'gemini-2.5-flash'` at four call sites — the July upgrade swept `services/ai/apReview.ts` but missed the component. Now imports `DEFAULT_MODEL`. **Lesson: the July pass grepped `services/`; hardcoded model strings can live in components too.**
    - **Privacy copy predated the OAuth migration.** Three surfaces (`HowItWorksView`, `SupportView`, `SettingsView`) still carried the author's quote promising the site would "never offer user accounts, memberships, or logins" — written before the August 2026 Google Workspace gatekeeper shipped, and false as stated. Rewritten to preserve the actual commitment (no user database, no PII, no student records) while describing what sign-in does: verify domain, store only that domain. Also corrected "no student information ever leaves your device" (prompts go to Gemini) and "zero data tracking" (`index.tsx` mounts Vercel Analytics + Speed Insights — cookieless and anonymous, but not zero).
    - **Ko-fi access-code flow was dead and still being sold.** `SupportView` promised an access code on joining, to be entered "on the login page." The classroom-code path was deleted in August; `Gatekeeper.tsx` has no code field. Per the author, the true perk is **domain whitelisting** — a teacher outside an approved school supports the project and gets their Workspace domain added to `OAUTH_ALLOWED_DOMAINS`. The section now says that.
    - **Counts and names.** 11 → 13 simulations (`README.md`, `CLAUDE.md`; `constants/simulationsRegistry.ts` is the source of truth). "21 different Advanced Placement subjects" → 28 AP **and IB** courses (verified against `constants/apCourses.ts`: 20 AP + 8 IB, and they span maths, history, English, CS, economics, and world languages, not just science). "AP Study Budy" → "Advanced Study Buddy" in `LandingPage.tsx` and `PracticeCenterView.tsx` (flagged as out-of-scope in the 2026-07-25 entry below; fixed here). "Kinematics Motion Tracker" → "Motion Tracker". Added the missing Calculation Partner explainer to How It Works.
    - **The app disagreed with itself about its own name.** March 2026 renamed it "Science Practice"; May 2026 renamed the sidebar back to "Science Practice Partner." Neither pass finished, so the public homepage, SEO description, `README.md`, `MODE_REFERENCE.md`, the homepage advisor's self-description, and the For Teachers page said one thing while the dashboard sidebar, `<title>`, `metadata.json`, worksheets, and printed reports said the other. **Standardized on "Science Practice Partner"** — the author's call — across live UI, meta tags, `metadata.json`, the textbook's links back to the main site, and the guidance docs.
      - **Two things are deliberately NOT renamed.** "Science Practice AI" is the homepage advisor's own tag, established alongside the app name in the May 2026 pass, not a stale variant. And `public/manifest.json` correctly keeps `name: "Science Practice Partner"` with `short_name: "Science Practice"` — that is what `short_name` is for (home-screen icon label), not drift.
      - **Never blanket-substitute this string.** "Science Practice" also appears as the College Board's *Science Practices* term (`constants/activeLearning.ts`, `utils/cedLoader.ts`, `constants/extracted-ceds/*.json`, and a 2026-04-03 `ChangelogView.tsx` entry titled "**Science Practice Weighting**" — singular, so a `(?!s\b)` guard does not catch it). Historical `ChangelogView.tsx` entries are also a record, not copy, and several of them quote both names on purpose. A regex sweep corrupted four such lines during this pass before they were restored.
    - **Chemistry textbook colophon (new): `public/chem/about.html`.** A public "How This Book Was Built" page — purpose, the teacher/AI division of labour, the constraints every lesson is held to, an SVG of the shared-asset architecture, known limitations, and a plain-language version history derived from `docs/textbook/CHANGELOG.md`. Written to `VOICE.md`. Standalone by design: `tokens.css` + `components.css` + an inline theme toggle, **no `core.js`** (that file holds lesson-page behaviors; the dashboard doesn't load it either). Linked from the dashboard topbar. **New policy, documented in `TEXTBOOK_DEV_GUIDE.md` §4: a student-visible textbook change now needs an entry in both `CHANGELOG.md` (engineering) and `about.html` §06 (public).**
    - **Topbar clipping, found by rendering it.** Adding the link exposed that the dashboard topbar was already overflowing between 769px and ~1100px: with labels the button group needs ~845px and the crumb another ~350px, against `components.css`'s shared collapse breakpoint of 768px. A fourth button widened the broken range to ~1400px. Fixed in `index.html`'s own style block (crumb hidden below 1340px, buttons icon-only below 1000px) rather than in shared CSS, so the 13 lesson pages keep the 768px rule that suits their three-button bar. Icons added to Diagram Generator and Clear Progress, since a label-only button collapses to an empty box. Verified at twelve widths, 360–1600px, both themes.
    - **Textbook docs never reconciled with the August repo move.** `docs/textbook/README.md` still pointed at the retired `mrknuffke.github.io` Pages URL and a GitHub Actions deploy workflow that no longer exists (it ships with Vercel now). Six docs still used `scaffold/` paths and referenced a `CLAUDE.md` that was renamed `TEXTBOOK_DEV_GUIDE.md` — genuinely ambiguous now that the repo root has its own. All corrected; historical `CHANGELOG.md` entries left untouched.
    - **Drift guards + CI (added in the same pass, after the audit above).** All of the above were a single failure repeated: a fact that lives in code, copied by hand into prose. Fixed structurally rather than by adding checklist items.
      - **Duplication deleted where possible.** `VISION_MODEL` and `formatModelName()` added to `services/ai/core.ts`; `jeopardyService.ts`'s pinned `'gemini-2.5-pro'` now imports it. `HowItWorksView` renders `formatModelName(DEFAULT_MODEL)` and `formatModelName(VISION_MODEL)` instead of typed-out names. Simulation, mode, and course counts in `HowItWorksView`, `FeaturesView`, `LandingPage`, `PracticeCenterView`, and `SupportView` now render `.length` off their registries. **This pass had itself hardcoded seven such counts before this fix** — the same mistake, one commit later, which is the argument for the structural fix.
      - **`MODES_METADATA` extracted** from `components/LandingPage.tsx` into `constants/modesRegistry.ts`, parallel to `simulationsRegistry.ts`. SupportView needed the count and would otherwise have pulled the whole LandingPage module into its chunk.
      - **`services/__tests__/sourceOfTruth.test.ts`** asserts: no source file names a Gemini model (except `ChangelogView`, which is history); no doc names a dead model (except CLAUDE.md's `## Last Updated`, and `-exp` ids, which only ever appear as counter-examples); counts in `README.md`/`CLAUDE.md` match their registries; and the textbook's three lesson manifests agree. **Each guard was verified by reintroducing the original bug and watching it fail** — a guard that has never failed is not known to work.
      - **CI added: `.github/workflows/ci.yml`** (build + lint + test on every PR and push to main). The repo had none, so `npm test` had never run automatically and its two existing tests had never caught anything.
      - **`public/chem/**` got its own ESLint config block — deliberately NOT an ignore.** Under the app's config it reported 698 errors, so the first instinct was to ignore the subtree; that was wrong, and checking rather than assuming is what caught it. 697 were browser globals the app config doesn't declare for plain `.js`. The 698th was **a real bug**: `const p2 = points[j = i + 1];` in `lessons/C-SPA.js` — a stray assignment leaking an implicit global `j`, which only works because these load as classic scripts in sloppy mode and would throw in strict mode. Fixed. The textbook has no TypeScript, no build step and no tests, so **lint is the only static analysis it can ever get** — silencing it would have thrown away the single real finding along with the noise, which is precisely the 2026-07-25 failure repeated. The block declares `globals.browser` plus the site's own cross-file globals (`GC_*`, `StorageEngine`, `LESSONS_MANIFEST`), keeps `no-undef` as an error, and drops `no-unused-vars`/`no-empty` to warnings. Whole repo is now **0 errors**, which is what makes the CI lint step meaningful.
      - **The residual, which no test can catch:** copy that outlives the feature it describes (the Ko-fi access code, the no-logins quote). Covered by one narrow rule in the new `## Drift Guards` section: when you delete or gate a feature, grep the user-facing copy for its name before committing.
    - **Known gap, not fixed:** the textbook's `about.html` version history is hand-maintained against `CHANGELOG.md`. Nothing enforces the two staying in step beyond the documented policy.
  - **Chemistry Textbook: Progress Tracking Repair, Resume, Shared Reference Drawer, 1-2c Widget Rebuild** (2026-09-02):
    - **Progress tracking reported zero for every lesson.** `markCheckpointCompleted` in `public/chem/assets/core.js` has stored spaced-repetition *metadata objects* (`{completed, box, interval, nextDue, …}`) since SRS shipped, but `renderProgress` in `public/chem/index.html` still counted completions with `lessonProgress[k] === true` — a test no object can pass. Three sites in `index.html` plus `scrollToLastCompletedSection` in `core.js`. Every bar sat at 0%, every lesson read "Not Started", the concept map stayed grey. Replaced with a shared `isComplete(val)` / `countCompleted(lessonProgress)` pair (accepts the object form and the legacy boolean, skips `_`-prefixed bookkeeping keys) added to **both** storage engines — `core.js` and the separate inlined copy in `index.html`. The SRS review queue already handled objects correctly; the fix was never backported to `renderProgress`.
    - **`1-2c` was missing from `index.html`'s `MANIFEST_DATA`** (12 entries against 13 in `lessons.json` and `core.js`'s `LESSONS_MANIFEST`). Its card, bar, and badge exist in the markup, but `renderProgress` iterates the manifest — so the card was permanently dead, and the lesson was also excluded from the deep search index, the concept map, and the SRS review queue. Fails silently, no error. **`MANIFEST_DATA` is a hand-copied snapshot of `lessons.json` that is not read at runtime; adding a lesson means editing all three manifests.** Documented in `docs/textbook/TEXTBOOK_DEV_GUIDE.md` §4.
    - **Clear Progress wiped the whole origin.** `StorageEngine.clear()` → `localStorage.clear()`; served from `sciencepractice.app/chem/`, that is the same origin as the main app, so it destroyed the OAuth session token, badges, teacher mode, and the textbook's own theme. Now `clearProgress()` removes only `gc-textbook-progress`.
    - **Progress copy:** cards read `N/M checkpoints` rather than a percentage, and a lesson whose page has never been opened says "Not started" instead of an invented `0/4` denominator (real counts range 1–10). `completed === total` → `>= total` so a lesson finished before it was counted isn't stuck on "In Progress".
    - **Resume (new).** Nothing tracked where a student stopped; the only mechanism was the broken auto-scroll-to-last-*completed*-section. `initResume()` in `core.js` records the furthest `section[data-toc]` reached (scroll-based, so a student who reads without answering still has a resume point) and only ever moves forward. On return it offers a dismissible bar — the page never scrolls on its own, the bar withdraws if the student gets there unaided, and an explicit `#anchor` suppresses it. State lives at `progress[lessonId]._resume`; no PII.
    - **Reference Center extracted to `public/chem/assets/reference-center.js`.** The ~870-line drawer was gated behind `if (!currentLesson) return` inside `core.js`, and the dashboard doesn't load `core.js` at all. Now one implementation shared by `index.html` and all 13 lessons (golden rule 17). `elements.js` resolves relative to `document.currentScript` so it works from both directory depths. **New lessons must load `reference-center.js` alongside `core.js`.**
    - **Topbar "Feedback ↗" relabelled "Submit Feedback"** (dashboard markup + the `core.js` injector that adds it to every lesson).
    - **`1-2c` rebuilt on the shared widget framework: 1 checkpoint → 10.** The lesson had been built entirely outside the framework — four bespoke `.chk` blocks with **no CSS anywhere in the project**, no persistence, no print path, and a single generic `'Not quite right. Review the rules above and try again.'` for every wrong answer (banned by VOICE.md Rule 10), plus a hand-rolled classifier. Converted to four `commit-reveal` widgets and a `sort-classify`, with authored per-option feedback naming the temptation on all 16 options. Added a `scaffold` charge-balance ledger, a `step-builder` recovering Cu²⁺ from CuCl₂ (the inverse direction, which exams ask for and the lesson never practised), a `faded-example` running name → formula to Al₂(SO₄)₃ (Target PS1-2.2, previously unpractised), and a `commit-reveal` prefix drill. Dead classifier/checkpoint logic removed from `1-2c.js` (215 → 103 lines; the charge balancer stays as free exploration).
    - **Two rendering fixes found by looking at the page:** `sort-classify` renders `categories[].label` via `textContent` (`core.js`), so markup there leaks literally — labels must be plain text with Unicode. And `tokens.css`'s `*{margin:0;padding:0}` reset flattens list indentation; `.interactive ul,.interactive ol` now restores a hanging indent (lists with inline `padding-left` keep theirs).
    - **Known gaps, deliberately not fixed:** `scaffold` table mode discards `feedback_wrong` and shows a generic string (`core.js` ~L1846), so the ledger can't teach on a miss — fixing it means touching shared widget code. `public/chem/**` is not covered by the app's ESLint browser globals (698 `no-undef` errors; HEAD's `core.js` alone had 310) — app source is 0 errors.
  - **Maintenance Pass: Rules-of-Hooks Crash Fix, ESLint Repair, Doc Drift Reconciliation** (2026-07-25):
    - **FRQView crash fix**: `components/FRQView.tsx` had a duplicate `!question` loading guard — one early `return` positioned *before* the component's hooks (violating Rules of Hooks; a mid-session `question` transitioning to `undefined`, e.g. via Refresh/Harder/Easier, would throw "rendered fewer hooks than expected" and white-screen) and a second, correctly-positioned guard already sitting after all hooks. Removed the pre-hooks duplicate; the post-hooks guard now serves as the sole safety net.
    - **ESLint globals repair**: `eslint.config.js` maintained browser globals (`File`, `HTMLElement`, `confirm`, etc.) by hand, one identifier at a time, and was missing most of them — producing ~148 phantom `no-undef` errors that buried real issues (including the FRQView bug above, which had been sitting undetected in `react-hooks/rules-of-hooks` output). Replaced the manual list with `globals.browser` + `globals.node` presets from the (already-installed) `globals` package. Also excluded `scratch_test_jeopardy.js` (a standalone dev debug script, not app source) from linting. Total lint errors: 169 → 0 (958 pre-existing warnings left untouched, per convention — WARNs are acceptable if justified).
    - **Real errors fixed once visible**: a vestigial `{true && (...)}` wrapper in `App.tsx` (from a flattened conditional — comment above it confirms intent, unwrapped safely), 3 empty `catch` blocks in `APReviewTutorView.tsx` (intentional swallow of malformed AI-embedded JSON metadata — annotated with comments rather than removed, since `no-empty` requires either), 2 unnecessary regex escapes (`ExplanationMessage.tsx`, `PeriodicTableGraph.tsx`), a stray debug `console.log` in `LandingPage.tsx`, a no-op try/catch pure-rethrow in `services/ai/grading.ts` (removed), and an unscoped `case` block `const` in `services/ai/lab.ts` (wrapped in braces).
    - **AP Review Bots doc-drift correction**: The 2026-04-25 "AP Review Bots Deprecated" entry below states AP Review Bots were hard-deleted — true at the time, but the feature was **rebuilt and relaunched in June 2026** as "Advanced Study Buddy" (`components/APReviewCatalogView.tsx` + `components/APReviewTutorView.tsx`, dashboard card id `ap_review_catalog`, `MODES_METADATA` in `LandingPage.tsx`), covering both AP and IB courses. This rebuild was already correctly documented in `FEATURE_TRACKER.md` (`APReviewCatalogView (Advanced Study Buddy)`, STABLE June 2026) and `MODE_REFERENCE.md` (mode #0, "Advanced Study Buddy (AP & IB)") — only this file's changelog narrative was stale and could mislead a reader into thinking the feature doesn't exist. The historical 2026-04-25 entry is left as-is below (it was accurate for what it described); this note exists so the two aren't read as contradictory.
    - **Minor, not fixed (flagged for follow-up)**: the live dashboard card title reads "AP Study Budy" (`components/LandingPage.tsx` `MODES_METADATA`, id `ap_review_catalog`) — likely a typo for "Buddy." Left untouched as out-of-scope for this pass.
  - **Chemistry Textbook Hardening & PE-Aligned Curriculum Nomenclature** (2026-09-16):
    - Re-aligned lesson codes across `public/chem/index.html`, `public/chem/lessons.json`, and `public/chem/assets/core.js` to match NGSS Performance Expectations (e.g. `1-7a/b/c` for HS-PS1-7, `1-4a` for HS-PS1-4, `1-5a/b` for HS-PS1-5, `1-6a/b` for HS-PS1-6, `1-8a` for HS-PS1-8, `E1-1a/2a/3a` for HS-ESS1) with transparent localStorage progress migration.
    - Redesigned Lesson 1-2a Section 01 into an uncluttered 3-stage sequence animation with dedicated spatial channels.
    - Resolved Section 03 interactive bond explorer lifecycle registration and lightbox click interception.
  - **AI Model Upgrade, Advisor Deep Links, Bot Settings & Gradual-Release Scaffolding** (2026-07-24):
    - **Gemini 3.6 Flash Upgrade**: Upgraded `DEFAULT_MODEL` in `services/ai/core.ts` to `gemini-3.6-flash`. Replaced hardcoded model strings in `apReview.ts`, `learningLoop.ts`, `bingoService.ts`, `pdfService.ts`, and `tarsiaService.ts` with `DEFAULT_MODEL`. Fixed stale comments referencing preview models across services.
    - **Simulation Registry & Deep Links**: Added single-source-of-truth `constants/simulationsRegistry.ts` for all 13 interactive simulations. `SimulationsHub.tsx` and homepage mascot advisor now derive simulation lists and direct deep links (`[sim:*]`) dynamically from the registry.
    - **Advisor Actions & First-Run Setup**: Homepage advisor now supports direct settings action tags (`[[ACTION: ...]]`) for dark mode, mascot companion selection, and username changes. Added a first-run setup picker directly inside the advisor box (`sp_advisor_setup_done` localStorage flag).
    - **Gradual Release of Responsibility**: Implemented `GRADUAL_RELEASE_BLOCK` in Calculation Partner and Explanation Partner prompts, enabling dynamic 3-tier support progression (Guided → Coached → Independent) based on turn-by-turn conversation history.
  - **Build an Atom — Through Argon, Isotope Abundance, Charge-Knob & Layout Fixes** (2026-07-10):
    - **Extended Z 1–10 → Z 1–18 (H–Ar).** `FIRST_TEN_ELEMENTS` renamed to `SANDBOX_ELEMENTS` and extended with Na–Ar; `getStability` gained per-element cases 11–18 (stable neutron sets: Na-23, Mg 12–14n, Al-27, Si 14–16n, P-31, S {16,17,18,20}n, Cl {18,20}n, Ar {18,20,22}n); proton cap 10→18, neutron cap 14→24; `handleAutocomplete` uses a new `STD_NEUTRONS` map (most-abundant isotope) instead of ad-hoc overrides; mini periodic table gained a 3rd row (Na–Ar); mass gauge rescaled 0–40 ("40 (Argon)").
    - **Isotope natural abundance.** New `isotopeData.ts` (`ISOTOPE_ABUNDANCE` Z 1–18 + `getIsotopeInfo`, IUPAC values, each element sums to 100%). `ElementDetailModal` takes an optional `massNumber` prop and shows the built isotope's abundance (e.g. Cl-35 → 75.76%) or a "not naturally occurring" note.
    - **Charge-knob clamp.** The Net Charge scale pin position is now `Math.min(100, Math.max(0, …))` so it can't slide out of its track at large ± charges.
    - **Layout.** Added a compact Mass (A) + Net Charge readout row at the top of the canvas card (right-aligned, clears the absolute stability badge) — "values above the atom window." Nucleon bins remain above the detailed Mass/Charge gauges.
  - **Build an Atom — Clickable Element Detail Popup + Control Reorder** (2026-07-10):
    - New `components/simulations/buildAnAtom/ElementDetailModal.tsx`: a periodic-table-style element detail modal (properties list + Bohr Model / Lewis Dot / Spectra tabs) that **reuses** `PERIODIC_TABLE_ELEMENTS` data and the `BohrModelAtom`, `LewisDotDiagram`, and `SpectrumDisplay` components from `../periodicTable/`. Dark-mode aware (BuildAnAtom supports dark themes; the Periodic Table's own modal is light-only). Closes on Esc / backdrop / Close button.
    - `BuildAnAtom.tsx`: the "Active Element Card" is now a `<button>` that opens the modal (looks up the full `Element` for the current proton count via `PERIODIC_TABLE_ELEMENTS.find`; the sandbox is limited to Z 1–10 so a record always exists). Also **reordered** the left column so the Nucleon Inventory Bins render directly under the Bohr canvas, above the Mass Number / Net Charge instruments (was below them), per user request.
    - `eslint.config.js`: added `requestAnimationFrame`, `cancelAnimationFrame`, and `KeyboardEvent` to the browser `globals` allowlist (the list was missing them — `requestAnimationFrame`/`cancelAnimationFrame` were already producing pre-existing `no-undef` errors in BuildAnAtom; `KeyboardEvent` is used by the new modal's Esc handler). Lint-only, additive.
  - **Periodic Table Spectra — Regenerated from NIST ASD Export (97 elements)** (2026-07-10):
    - **`spectraData.ts` is now generated, not hand-authored.** The project owner supplied a full NIST Atomic Spectra Database (ASD) line-list CSV (visible 380–700 nm, ~28k rows, with relative intensities and precomputed colors). A generator script (kept in scratch, not committed) reduces each element's raw lines for a clean strip: merge near-duplicate wavelengths (observed preferred over Ritz), compress lines sharing the same rendered color to their strongest representative, drop lines below ~1.5% of the element's peak, cap at the **25 strongest**, and sqrt-scale intensities to 0–1 for display opacity. Result: **97 elements** covered (was 28 hand-curated). Only Astatine (absent from the export) and Francium (no listed intensities) lack data, plus synthetic elements beyond Z=99 — all fall back to the "no lines on record" message. The earlier hand-entered batch is fully superseded by this authoritative data.
    - **To refresh:** re-run the generator against a new ASD export and overwrite `spectraData.ts`; do not hand-edit line data. The file header documents the reduction rules. `SpectrumDisplay` caption reads "NIST / spectroscopy literature." The `wavelengthToColor()` Dan Bruton approximation and `getEmissionLines()` are carried through unchanged and still drive both the emission line colors and the absorption gradient.
    - **Sourcing note:** `physics.nist.gov` and general `WebFetch` are blocked by the dev environment's network proxy, so the data could not be pulled in-session — it came from the owner's upload. That's the recommended path for future spectra refreshes.
  - **Periodic Table — Visible-Light Emission & Absorption Spectra** (2026-07-09):
    - New **Spectra** tab added alongside Bohr Model / Lewis Dot in the element detail popup (`components/simulations/periodicTable/PeriodicTableView.tsx`). `modelType` state widened to `'bohr' | 'lewis' | 'spectra'`; the panel header switches to the `Sparkles` icon + "Visible Spectrum" label for the new tab.
    - New `components/simulations/periodicTable/spectraData.ts`: `EMISSION_LINES` (a `Record<number, SpectralLine[]>` keyed by atomic number) holds NIST Handbook of Basic Atomic Spectroscopic Data strong/persistent lines restricted to the human-visible range (380–700 nm). Covers 28 elements with well-characterized classroom-relevant spectra (H, He, Li, N, O, Ne, Na, Mg, Al, Ar, K, Ca, Cr, Mn, Fe, Ni, Cu, Zn, Rb, Sr, Kr, Cd, In, Xe, Cs, Ba, Hg, Tl). Elements without reliably known visible lines (most lanthanides/actinides, many heavier transition/post-transition metals, all synthetic/superheavy elements) are intentionally omitted rather than guessed — `getEmissionLines()` returns `[]` for them. Also exports `wavelengthToColor()`, a standard Dan Bruton visible-spectrum RGB approximation with intensity falloff near the 380/700 nm edges.
    - New `components/simulations/periodicTable/SpectrumDisplay.tsx`: pure responsive SVG (no new dependencies) rendering an emission strip (black background, bright colored lines) and an absorption strip (rainbow gradient background, dark lines) sharing one wavelength axis (ticks at 400–700 nm). Each line has a native `<title>` tooltip showing its exact wavelength. Elements with no recorded data (`EMISSION_LINES[atomicNumber]` undefined) show a friendly "No visible-light emission lines on record" message instead of empty strips.
    - `periodicTableAbout.ts` updated: "What Am I Looking At?" explains the Spectra tab (emission = bright lines on black from a gas discharge tube; absorption = dark lines on a rainbow from white light through vapor; same wavelengths because both come from the same electron energy-level transitions). "Things to Try" gained two entries: Hydrogen's 4 clean Balmer lines vs. Neon's dense red-orange forest (why neon signs glow red-orange), and finding Sodium's yellow D-line doublet at ~589 nm (flame tests, streetlights). "Key Concepts" gained emission/absorption spectrum definitions.
  - **Subject Library — Course-Level Filters & Alphabetical Subject Tabs** (2026-06-03):
    - Added a second group of filter tabs to `components/SubjectLibraryView.tsx` for course rigor **level**: General → Honors → AP → IB (ordered by increasing rigor). New `getLevel(course)` helper maps by name prefix (`IB ` → ib, `AP ` → ap, `Honors ` → honors, `General ` → general); courses without a level prefix (electives, middle/elementary, plain "Environmental Science") return `null` and match no level tab.
    - New `LevelFilter` type and `FilterValue = DisciplineFilter | LevelFilter` union; `activeFilter` state widened to `FilterValue`. Filter logic checks `LEVEL_VALUES.includes(...)` to decide whether to match on `getLevel` vs `getDiscipline`.
    - Reordered the existing **subject** tabs alphabetically by label ("All Subjects" pinned first), and extracted a shared `tabClass()` helper so both tab groups share styling. A thin vertical divider (`hidden sm:block`) separates the subject group from the level group.
    - **Note:** "XL" was the user's verbal shorthand for Honors during the request — the shipped UI label and internal value are both `Honors`/`honors`; there is no `xl` value in the code.
  - **Jeopardy Whole-Course Review Clever Clues & Image Model Upgrade** (2026-05-22):
    - **Jeopardy Clever Clues Prompt Fixes**: Refactored `services/jeopardyService.ts` to dynamically replace dry formatting examples with clever, riddle-style ones when in whole-course review mode (`isWholeCourse`). Injected the complete `CLEVER_INSTRUCTIONS` contrasted DRY vs. CLEVER pairs block into all board generators and category, question, and Final Jeopardy refresh prompts to prevent stylistic drift to dry textbook definitions.
    - **Vision Model Upgrade**: Upgraded `analyzeImage` (image parsing) to use the stable production-ready `'gemini-2.5-pro'` model from the experimental `gemini-2.0-pro-exp-02-05`.
  - **Who Am I? — Setup Options, Library Load, Auto-Scroll, Per-Clue Editing, QoL** (2026-05-06):
    - **Load from setup.** The `WhoAmISetupView` gains a "Load from Library" button that opens the game library directly, so teachers can reuse a saved deck without first generating and then going to the preview screen. The Load modal is extracted into `components/whoAmI/LoadGameModal.tsx` and shared between setup and preview.
    - **Setup options.** Number of puzzles (3/5/8/10, default 5 — was hardcoded 10 in App.tsx), difficulty mix (Easier/Mixed/Harder), fun-factor silliness slider, and optional source material (PDF upload + paste). All wired through a new `GetWhoAmIPuzzlesOptions` interface on `getWhoAmIPuzzles` (accepts both old `'easier'|'harder'` string and new options object via union type, so existing callers like `handleRegenerateWhoAmIClues` are unbroken).
    - **Recent topics chips.** The setup screen derives the last 5 unique topics from the saved-game library and renders them as one-click chips below the topic textarea.
    - **Auto-scroll cycling through revealed clues.** `WhoAmIGameView` now maintains a `focusedClueIndex` state that cycles through revealed clues with a per-clue dwell timer computed from word count (4s + 0.4s/word, clamped 5–12s). The focused clue gets `scale-[1.02]` lift and a brighter ring; others step back to 60% opacity. A Pause/Resume button appears once ≥2 clues are revealed. Speed pill (Slow/Medium/Fast) persisted to `localStorage`. Clicking any revealed clue manually focuses it.
    - **Keyboard shortcuts in game view.** Space = reveal next clue (or answer when all 5 shown); →/N = next puzzle; ←/B = previous puzzle; P = pause/resume auto-scroll; Esc = exit.
    - **Progress dots + Reset session.** Header gains puzzle-progress dots with click-to-jump. A Reset link restores to puzzle 1 with a confirm.
    - **Guess input removed.** The student-typing "Who Am I?" input box was vestigial for classroom projection — removed to free layout space for the cycling clues.
    - **Per-clue editing (preview screen).** Each clue row now shows three hover-action buttons: Edit (existing inline edit), 🔄 Regenerate (single AI call via new `refreshWhoAmIClue` service function), and 🗑 Delete (min-2-clue guard). Below the last clue, an Add Clue button calls `addOneWhoAmIClue` to AI-generate a new clue at the appropriate difficulty slot (max 7 clues).
    - **Bulk Regenerate.** Preview toolbar gains a "Regenerate All" button wired through `onRegenerateClues(-1)` → App.tsx bulk path that regenerates the whole deck at the original puzzle count.
  - **End Round split: Save Card vs. Discard Card + cursor-exhaustion fix** (2026-05-06):
    - The single "End Round" button in Charades and Taboo live play implicitly carried the in-flight card into the next team's turn (cursor was never advanced) but the label gave teachers no way to know that. Split into two explicit options: **End Round · Save Card** (RotateCcw icon, in-flight card carries to next team) and **End Round · Discard** (X icon, in-flight card is dropped). At time-expired, Save Card is the prominent amber CTA and Discard is the secondary neutral button. The amber banner copy was updated to "Last call — record the outcome, or End Round (Save Card carries it to next team · Discard drops it)."
    - **Cursor-exhaustion off-by-one fixed.** `recordOutcome` previously used `if (next >= shuffled.length) { setPhase('turn-done'); return c; }` — i.e., when the teacher resolved the last card, cursor was clamped to `length-1` (the last played index) instead of advancing to `length`. `confirmTurn`'s exhaustion check was `cursor >= shuffled.length - 1` to match. With Save Card landing on the last index, `cursor === length-1` would falsely fire the "final" branch and lose the saved card. Both checks now use `cursor === shuffled.length` as the unambiguous "deck exhausted" signal: cursor always advances when an outcome is recorded; "in-flight card preserved" means cursor is at a valid index (`< length`).
  - **Print A4 Sizing + Timer Last-Call Grace** (2026-05-06):
    - **Print pages were sized to the full A4 height (297mm) but the `@page` rule applied 8–10mm margins,** so the rendered content overflowed the printable area by 16–20mm and forced ugly mid-card breaks across pages. Fixed all four printable games. Charades + Taboo: changed grid wrapper from `style={{ height: '297mm' }}` → `style={{ height: '281mm' }}` (A4 minus 2×8mm margins). Bingo + Square Match: bulk-renamed `min-h-[297mm]` → `min-h-[277mm]` (A4 minus 2×10mm margins). All four games' `@media print` rules now also include `break-inside: avoid` + `page-break-inside: avoid` on each card, plus `:last-child { break-after: auto }` so the last page doesn't force a trailing blank. Charades + Taboo cards additionally got `overflow-wrap: anywhere`, `word-break: break-word`, and `hyphens-auto` so long terms wrap cleanly instead of overflowing. Card text scaled down to `text-2xl md:text-3xl` for the same reason.
    - **Timer auto-advanced past the in-flight card.** When the round timer hit 0 in `CharadesLivePlay` / `TabooLivePlay`, the interval callback called `setPhase('turn-done')` immediately — if a student got an answer right (or fouled) at the buzzer, the teacher had no chance to record it. Replaced with a `timeExpired` boolean. When the clock hits 0, the interval clears and `timeExpired = true` but **phase stays as `turn-active`**. The HUD now shows "TIME!" in amber, an amber banner above the card reads "Last call — record the outcome of the in-flight card, or End Round to skip this guess", and the End Round button is promoted to the prominent amber-highlighted CTA. The next call to `recordOutcome` (Got It / Skip / Foul) logs the in-flight card and then transitions to turn-done. Pause is hidden once time is up (no longer meaningful). `beginTurn` resets `timeExpired` for the next round.
  - **Charades & Pictionary, End-of-Round Score Correction** (2026-05-06):
    - **Pictionary mode added to the Charades generator.** Same card shape, same setup flow — just a `gameMode: 'charades' | 'pictionary'` field on `CharadesDeck` (optional for back-compat with library decks saved before this change). Setup view now leads with a Charades / Pictionary toggle. Service prompt branches: charades asks for terms with "obvious physical motion or pantomime"; pictionary asks for "drawable terms — concrete nouns, recognizable shapes, processes with clear visual stages" and explicitly directs the model to substitute for terms with no visual hook (e.g. "uncertainty", "dimensionless quantity"). Live play swaps the verb on the turn-ready and turn-active screens ("ACT OUT" vs "DRAW") plus the icon (Users vs Pencil). ReviewGamesView card renamed to "Charades & Pictionary".
    - **Round-log architecture replaces immediate score updates** in both `CharadesLivePlay` and `TabooLivePlay`. Each card outcome (correct / skip / for Taboo also foul) pushes a `RoundEntry` into a `roundLog` instead of mutating `scores` directly. The HUD shows a projected score derived from `(scores[active] + computeDelta(roundLog))`. On `turn-done`, the screen renders the round log as an editable list with toggle buttons per entry plus a remove button, and a "Confirm & Next Team" CTA that finally commits the delta. This addresses the teacher feedback that scores were being committed too eagerly with no recourse if a card was miscalled. End-game also commits the in-progress round before showing winners.
    - **Pause + End Round Early** added to both games' turn-active screens. The interval tick clears when `paused`, the action buttons disable, and the HUD shows a Pause icon. End Round Early jumps straight to the editable review screen.
    - **Why a log instead of mutate-and-back-out:** computing scores from a log is cleaner than trying to "diff" a previous mutation when the teacher edits an entry. `confirmTurn` is the only place that actually writes to `scores`; everything before that is a projection.
  - **Review Games Pass — Square Match Fix, Charades + Taboo, Who Am I & Bingo Parity** (2026-05-06):
    - **Reported by Ms. Vivian Huang.** Square Match's pair-edit screen accepted only one keystroke per edit before focus dropped, and deleting a pair scrolled the list back to the top. Root cause: `PairEditor` was defined as a **nested function component inside `SquareMatchView`** ([components/SquareMatchView.tsx:166](../../components/SquareMatchView.tsx#L166)). Every parent state update created a new component reference, so React unmounted and remounted the whole subtree — destroying input focus and resetting the `max-h-[500px] overflow-y-auto` scroll position. Fix: inlined the JSX directly into the setup render. Same anti-pattern was present in `BingoGameView::TermEditor` and was fixed proactively while in the file (converted to a `const ... = ( ... )` JSX block, which is reconciled in place rather than treated as a new component type).
    - **Two new review games: Charades and Taboo.** Both follow the same architecture: single-component view with `viewMode` state machine ('setup' → 'review' → 'play' | 'print'), per-card edit + AI Revise (notes-driven) + single Regenerate + Add manual + Delete (Jeopardy-level affordances), save/load library at `sp_charades_lib_v1` / `sp_taboo_lib_v1`, printable card layouts (Charades 6/page, Taboo 4/page with classic red-border styling), and live-play modes with team scoring, configurable round timer (30/60/90/120s), and keyboard shortcuts. New files: `services/charadesService.ts`, `services/tabooService.ts`, `components/charades/CharadesGameView.tsx`, `components/taboo/TabooGameView.tsx`. New types in `types.ts`: `CharadesCard`, `CharadesDeck`, `TabooCard`, `TabooDeck`. New ViewType entries: `charades_setup`, `taboo_setup`. ReviewGamesView grid changed from `lg:grid-cols-4` to `lg:grid-cols-3` to fit 6 cards in a clean 2×3.
    - **Charades shortcuts:** Space = correct, S = skip. Difficulty-mix slider in setup ('easy-skewed' / 'mixed' / 'hard-skewed') drives prompt. Each card has term + category + difficulty pill + optional one-line hint.
    - **Taboo shortcuts:** Space = correct (+1), F = foul (−1, opposing team buzzed), S = skip (0 or −1 per teacher toggle). **Forbidden-word count is configurable 3–7** via slider; the schema enforces `minItems`/`maxItems = forbiddenCount` so AI can't drift. Prompt explicitly requires morphological variants of the term ("photosynthesis" → "photosynthesize", "photosynthetic", etc.) plus most-obvious-clue synonyms.
    - **Who Am I parity:** Added `reviseWhoAmIPuzzle` (notes-driven entity+clues+factoid revision) and `addOneWhoAmIPuzzle` (single dedup-aware new puzzle) to [services/ai/whoAmI.ts](../../services/ai/whoAmI.ts). [components/WhoAmIPreviewView.tsx](../../components/WhoAmIPreviewView.tsx) preview screen gains AI Revise + Delete per puzzle and Add Puzzle in the toolbar, with a notes-driven revise modal. Both new functions use `DEFAULT_MODEL` and a `SINGLE_PUZZLE_SCHEMA` that enforces `minItems: 5, maxItems: 5` on the clues array. Schema-side belt-and-suspenders + `normalizePuzzle` post-parse helper that pads short clue arrays — same lesson learned from the Jeopardy 5×5 fix.
    - **Bingo parity:** Added `refreshBingoTerm` (single dedup-aware replacement) and `reviseBingoTerm` (notes-driven revision) to [services/bingoService.ts](../../services/bingoService.ts). New code uses `DEFAULT_MODEL` directly from `./ai/core` even though the existing `generateBingoTermsFromAI` was previously hardcoded to `gemini-2.0-flash`; new code follows CLAUDE.md, old code left alone (separate concern). [components/bingo/BingoGameView.tsx](../../components/bingo/BingoGameView.tsx) per-term action column gains Sparkles (AI Revise) and RefreshCw (Regenerate) buttons; revise modal mirrors Who Am I.
    - **Library architecture intentionally not abstracted.** Charades and Taboo each have their own `getSaved* / save* / delete*` localStorage helpers in their service files. Per CLAUDE.md ("Three similar lines is better than a premature abstraction"), revisit when a 4th use case lands — Jeopardy has its own library at `jeopardy_lib_v3`, Who Am I uses `storageService.ts` helpers, so consolidation would be a larger refactor.
    - **AiReviseModal also intentionally duplicated** across Charades, Taboo, Who Am I, and Bingo — each is ~25 lines. Same DRY rule.
  - **Jeopardy — 5×5 Board Generation Bug Fix** (2026-05-04):
    - **Reported by Ms. Vivian Huang.** A Nuclear Chemistry board returned from `generateJeopardyBoard` with an uneven question distribution (5 categories totaling 26 clues — one column held 6 questions, four held 5). The grid renderer ([JeopardyGame.tsx:725-738](../../components/jeopardy/JeopardyGame.tsx#L725-L738)) is `grid grid-cols-5` with each column laying out its tiles via `flex-1`, so all columns share the row height. The over-stuffed column compressed to fit; neighbors with fewer (taller) tiles pushed their $1000 tile below the viewport — visually one column was the only one with a $1000 row, and a clue silently went missing.
    - **Root cause:** the prompt asked for "5 categories with 5 questions each ($200 to $1000)" but the response schema in `services/jeopardyService.ts` only specified `questions: { type: ARRAY, items: QUESTION_SCHEMA }` — no `minItems`/`maxItems`, no enum on `value`. Gemini drifted by one and the renderer happily displayed the malformed board.
    - **Fix (two layers).** (1) Schema now declares `minItems: 5, maxItems: 5` on both `categories` and `categories[].questions` in `generateJeopardyBoard`'s response schema, plus the same on `refreshCategory`. (2) New `normalizeBoard` / `normalizeCategory` helpers in `jeopardyService.ts` run post-parse: they sort each category's questions by value, take the first 5, force values to the canonical `[200, 400, 600, 800, 1000]`, and emit a placeholder clue if fewer than 5 are returned (teacher can refresh from the pre-game review screen). Belt-and-suspenders — the schema covers the happy path; normalization guarantees the renderer never sees a malformed board even if Gemini violates schema constraints under load.
    - Daily-double assignment already draws IDs from the parsed board, so it correctly samples from the normalized 25-question pool.
  - **Ideal Gas — Reversible Thermodynamics, Vent, Configurable Graph** (2026-05-02):
    - **Adiabatic round-trip fix in `gasLawsEngine.ts::stepGasLaws`.** Old approach used the moving-wall elastic formula `v' = 2·V_w - v` for piston collisions. Continuum-correct, but asymmetric in this discrete sim: compression produces many piston hits (heating reads correctly), expansion produces far fewer (cooling barely registered). Net effect: compress 100%→50% then expand back to 100% left the gas hotter than the starting point. Replaced with stationary-wall bounces + a per-tick global velocity scale of `√(V_old / V_new)` — the 2D ideal-gas adiabatic relation `T·V = const` (γ=2 for translational DOFs only). Round-trip now returns to original T exactly. Pressure still derives from per-collision wall impulses, so Boyle/Charles/Gay-Lussac/Avogadro/Dalton all still emerge correctly. Removed the `MIN_SPEED` clamp from the heat path (was preventing real cooling); kept `MAX_SPEED` clamp after both adiabatic and heat scaling to prevent runaway in extreme compression+heat cases.
    - **Vent feature.** Added `ventOpen: boolean` to `GasState` and `VENT_OFFSET_TOP`/`VENT_OFFSET_BOTTOM` constants. When open, the right-wall collision check is skipped for particles whose `y` falls in the vent band (just below the piston, tracks with piston motion); particles past `VESSEL_RIGHT + 60` are filtered out. View threads `ventOpen` through to the engine via `gasStateRef.current.ventOpen` (mutated each tick from React state to keep the rAF loop reading current value). Canvas draws the wall as two segments around the gap with an orange "VENT OPEN →" label and dashed escape path. Toggle button in `GasLawsControls` under the Vessel section.
    - **Configurable graph axes.** Rewrote `GasLawsGraph.tsx` with X/Y `<select>` dropdowns. X = Time keeps the multi-line `LineChart` (original behavior); any other X switches to a `ScatterChart` of recent 100 samples plotting selected Y vs X (variables: time, volume, temperature, total pressure, P_A, P_B). Lets users discover Boyle/Charles/Gay-Lussac empirically by plotting the relevant pair directly.
  - **Ecosystem & Biological Systems Modeler — Working-State Pass** (2026-05-01):
    - **Ecosystem auto-start.** `EcosystemSimulationView` initializes state via `seedEcosystem(INITIAL_PARAMETERS)` and `isRunning = true`. Previously the canvas was empty until the user pressed Play. Reset (`handleReset`) now re-seeds and auto-resumes (was stopping the sim). The `hasSeeded` ref and `initializeEcosystem` import are gone — the seed-on-first-play branching they protected is no longer needed. Reset icon swapped from `RefreshCw` → `RotateCcw` to match the unified Phase Change / Gas Laws pattern.
    - **Modeler bounds-clamp bug.** `RegulatoryModelerView::handleUpdateNodePosition` was clamping with `NODE_RADIUS = 40`, but the rendered node DOM is roughly 140×110 px. Nodes could drag mostly off-canvas. Replaced with `NODE_W = 140`, `NODE_H = 110` and clamps from `0` to `CANVAS_W/H - NODE_W/H`.
    - **Modeler missing icons.** `NodeComponent::getIcon` only handled `signal`/`gene`/`protein`/`environment` — it returned `undefined` for the 6 other types added with the multi-palette feature (`hormone`, `receptor`, `molecule`, `population`, `organism`, `custom`). Added `Droplet`/`Target`/`Atom`/`Users`/`Sprout`/`Star` from lucide and a `default` fallback to `Circle`.
    - **Modeler "Reset Activation" button** in `NodeControls` (RotateCcw icon, beside Save/Load/Clear). Calls `handleResetActivation` which zeros every node's `activationLevel` (including signal toggles), clears history, resets `tickCountRef`, and pauses. Lets users re-run an experiment without losing the network — previously the only way to reset was Clear (loses everything) or re-load the starter circuit (loses any custom edits).
    - **Modeler connection editing.** Added an "Edit Connections" panel in `NodeControls` listing every connection with `Source → / ⊣ Target`, a strength slider (0.2–2.0), a flip-type button (`Repeat`), and a delete button (`X`). Connections involving the currently-selected node get a green ring. New view-level handlers: `handleDeleteConnection`, `handleFlipConnection`, `handleConnectionStrength`. Previously the only way to remove or change a connection was to delete one of its nodes — substantial usability gap, especially with starter circuits that ship with mixed strengths.
    - **Dead import dropped.** `NODE_COLORS` was imported into `RegulatoryModelerView` but never read.
  - **Ideal Gas + Phase Change — Threshold, Indestructible Toggle, Real Collisions** (2026-05-01):
    - **Ideal Gas: `PRESSURE_BREAK_THRESHOLD` raised** from 600 → 1500 in `gasLawsConstants.ts`. Vessel previously broke during normal heat/compression sweeps.
    - **Ideal Gas: Indestructible toggle.** New section in `GasLawsControls` (Shield icon, Off/On pill). Threads through as a 4th arg to `stepGasLaws(state, pistonY, heatDelta, indestructible)` — when true, the break check is skipped entirely. State lives in `GasLawsView` and is mirrored to `indestructibleRef` so the rAF loop reads the latest value without re-binding.
    - **Phase Change: halos removed** from `PhaseChangeView::drawMolecule` for liquid and gas. The amber/sky disks were redundant once the Phase Mix bar landed and were visually noisy; phase is still readable from the background tint plus the bar.
    - **Phase Change: real elastic collisions** for all non-solid pairs (liquid–liquid, gas–gas, liquid–gas). Replaced the previous soft repulsion (overlap pushed positions apart but transferred only ~10% of velocity, so particles visibly passed through each other) with the standard equal-mass elastic-along-normal swap used in `gasLawsEngine`. Solid particles still use spring forces around lattice sites and are excluded from the pair loop. O(N²) at N=100 = ~10K iters/tick, no perf concern.
  - **Ideal Gas Laws — Unification with Phase Change** (2026-05-01):
    - **Auto-start on mount** (`isRunning` defaults to `true`). Phase Change runs continuously; Ideal Gas previously required an explicit Play press, which led users to think the sim was broken on first load. Play/Pause toggle is preserved for users who want to freeze a state.
    - **Press-and-hold Heat/Cool.** Replaced the click-queue model (`heatQueueRef`, 8 ticks per click) with a real `heatingState` React state (`'heating' | 'cooling' | 'none'`) wired into `HeatCoolButtons` the same way `PhaseChangeView` uses it. Per-tick heat is read from a ref-mirrored copy in the rAF loop. Disabled-while-paused gate removed; instead, pressing Heat or Cool auto-resumes the sim via `handleSetHeatingState`. Heat/cool also auto-clears on vessel break.
    - **Stat row redesign mirrors Phase Mix.** Replaced the 4-box row (Temp / Total P / P_A / P_B) with the same 2-box layout Phase Change uses: a big Temperature box and a "Pressure" box that shows total pressure plus a horizontal red/blue Dalton's-law breakdown bar (P<sub>A</sub> / P<sub>B</sub>) — visual analog to the Phase Mix S/L/G bar.
    - **Color match.** New breakdown bar uses red (Gas A) / blue (Gas B) to match the actual particle/legend colors in `GasCanvas`. The old stat boxes used indigo/amber, which conflicted with the canvas colors.
  - **Phase Change Sim — Refreeze Bug Fix + Refinements** (2026-05-01):
    - **Critical bug fix in `particleEngine.ts::calculateThermodynamics`.** `solidFraction` defaulted to `1.0` and was never reset in the warming-liquid, boiling, or pure-gas branches. Past melting, the engine still saw `solidFraction = 1.0` alongside the new liquid/gas fractions, so `targetSolid = N` and the LIQUID→SOLID block instantly refroze every particle that just melted. Water/oxygen/neon never reached real gas state — user reported "gas particles aren't following ballistic paths" and "liquid goes back to solid when boiling." CO₂ took the `sublimates` branch and avoided the bad path, so it appeared to work. Fix: default all fractions to `0.0` and explicitly assign in each branch (mirrors the sublimation block's structure).
    - **Substance-aware initial heat.** Added `getInitialHeat(substance) → meltingPoint * C_SOLID / 2` so every substance starts visibly solid. Was hard-coded to `100` globally, which placed Neon (mp=24K) past its boiling point on load.
    - **Reset button** in `PhaseChangeControls.tsx` — re-initializes particles, heat, history, phase counts, and clears any active heating/cooling press.
    - **Truthful Phase Mix display.** Replaced the temperature-comparison "State Marker" (which lied during transitions) with a live S/L/G percentage bar driven by actual particle counts. View now publishes `phaseCounts` alongside `temperature` on the existing 6 fps cadence.
  - **Free Body Diagram — Point Particle, Arrowhead Fix, Touch Support** (2026-04-29):
    - **Arrowhead Y-flip bug fix** in `FbdCanvas.tsx::arrowHeadPoints`. The shaft uses `oy - sin(rad)*mag` (SVG Y-flip) but the head corners used `+sin(...)` without the flip, so heads tilted incorrectly for non-horizontal forces. Negated the sin terms to match.
    - **Object → point-particle dot.** Replaced the per-preset `<ObjectShape>` (block/sphere/car/person/book/crate sprites) with a small filled dot at `(ox, oy)` plus offset label. Standard FBD convention; all forces now visibly emanate from the single dot. The object preset selector remains in the sidebar for context but no longer renders a shape on canvas. Removed `objectPreset` prop from `FbdCanvas` and the now-dead `OBJECT_CY`/`ObjectPreset` imports.
    - **Incline rendering bug fix.** Both `getObjectCenter` and `renderSurface` had `... || effectiveIncline > 0` fallbacks that caused a flat-surface selection to render as an incline (because `inclineAngle` state defaults to 30). The "no way to change incline angle" symptom was: pick Flat → see incline-shaped surface → no angle slider visible (slider only appears for `surfaceType === 'incline'`). Dropped the fallbacks; `effectiveSurface` already covers scenario-driven incline cases.
    - **Touch/pointer support** for arrow dragging. `onMouseDown` + `mousemove`/`mouseup` swapped to `onPointerDown` + `pointermove`/`pointerup`/`pointercancel` on `window`. Added `touchAction: 'none'` to draggable arrow groups so touch drags aren't hijacked by scroll. Drag now works on tablets/phones.
    - **Quick-angle row reorder** in `FbdForceEditor.tsx`. Was `[270, 90, 0, 180, 315, 45, 225, 135]` — reordered to `[0, 90, 180, 270, 45, 135, 225, 315]` so the cardinal row matches the legend "0° = right · 90° = up · 180° = left · 270° = down" right above it.
  - **Covalent Bonding — Generalized Electron-Group Geometry** (2026-04-27):
    - Extended the cardinal-slot allocator (introduced earlier this day) to handle non-octet electron-group counts. Previously every atom snapped LPs to N/E/S/W, which forced 90° spacing even when total occupants ≠ 4 — e.g., a mid-build atom with 1 bond + 2 LPs (3 groups) was showing LPs perpendicular to the bond (90° spread) instead of trigonal (120°).
    - `cardinalSlots.ts::computeSlotAngles` now branches on total occupant count: 4 → cardinal framework with optimal bond-to-cardinal assignment (page-relative, fixed N/E/S/W); ≠4 → even angular framework `2π/N` anchored at `bondAngles[0]` (bond-relative, rotates with the bond). Unbonded atoms still use even distribution starting at N.
    - All consumers (`CovalentBondingView::renderLonePairs`, `DotCrossDiagram`, `OverlappingCirclesView`) automatically pick up the new geometry; their call sites are unchanged.
    - Examples: 1 bond + 2 LPs → LPs at bond+120° and bond+240° (trigonal); 1 bond + 1 LP (e.g., N₂) → LP opposite bond (180°); HCl, water, ammonia (4-group cases) unchanged from prior fix.
  - **Covalent Bonding — Cardinal Slot Lone Pair Placement** (2026-04-27):
    - Replaced the greedy "farthest-from-occupied" lone-pair algorithm (introduced 2026-04-26) with a cardinal-slot allocator. The greedy approach drifted off N/E/S/W when bonds weren't exactly cardinal, producing visible bunching (e.g. HCl with all three lone pairs clustered opposite the H instead of one each at N/E/S).
    - New `components/simulations/covalentBonding/cardinalSlots.ts` exports `getCardinalElectronPlacement()`. Bonds claim the cardinal nearest each bond direction via brute-force minimum-total-angular-distance assignment (≤24 perms for ≤4 bonds); lone pairs and unpaired electrons fill the remaining cardinals, preferring slots whose opposite is free (perpendicular-to-bond, e.g. O₂ → LPs at N+S).
    - **All three** electron renderers now consume the shared module: `CovalentBondingView.tsx::renderLonePairs` (the primary canvas — was fanning LPs across a 120° arc opposite the bond for 1-bond atoms, hence the persistent HCl bunching), `DotCrossDiagram.tsx`, and `OverlappingCirclesView.tsx`. Bond lines and bonding-electron rendering remain along the actual bond axis (no kink); only lone-pair anchors changed.
    - Unbonded atoms still receive 4 cardinal slots so Hund's-style fill (1 per slot, then pair) reproduces standard Lewis dots for 1–8 valence electrons (e.g., 4-valence C → 4 singles; 6-valence O → 2 pairs + 2 singles).
    - Net effect: HCl now shows 3 LPs at the 3 non-bond cardinals, water shows 2 LPs at the 2 free cardinals, ammonia's lone pair lands at the unbonded cardinal — all stable across small bond-angle perturbations from the force-directed layout.
  - **Simulation Suite Overhaul — Phase A: Critical Bug Fixes** (2026-04-26):
    - **Phase Change — Gas behavior fix:** Gas particles now scatter uniformly across the full vessel on transition; liquid-only particle repulsion; all walls treated equally for gas. `particleEngine.ts` reworked.
    - **Phase Change — Molecule visuals:** H₂O as bent molecule; O₂ as dumbbell; CO₂ added as 4th substance (sublimation-only); Neon unchanged. `rotation`/`rotationSpeed` added to `Particle`.
    - **Reaction Kinetics — AB product visual:** Products render as red-blue fused dumbbell. New `KineticsLegend`. Live energy-diagram pointer tracks average KE.
    - **Reaction Kinetics — Enzyme improvements:** C-shape active site; denaturation animation above temp 1.7; cold suppression below 0.2; warning banner.
    - **Ideal Gas Laws — Piston drag:** Full drag-to-resize in `GasCanvas`; particle Y hard-clamped on every tick.
    - **Covalent Bonding — Lone pair cardinal fix:** VSEPR-aware `getElectronSlots()` replaces hardcoded offset array; lone pairs now at true N/E/S/W.
    - **Cell Membrane Transport — Proton pump animation:** 4-phase state machine with conformational change visual, directional arrows, and ATP labels.
    - **Cell Membrane Transport — Speed control:** 0.25×–4× selector applied to velocity normalization and pump phase progression.
  - **Simulation Suite Overhaul — Phase B: Standardization, Exports, FBD, Modeler** (2026-04-26):
    - **Shared `HeatCoolButtons`** (`components/simulations/shared/HeatCoolButtons.tsx`): press-and-hold, configurable colors, disabled state. Adopted in PhaseChange, Kinetics, Gas Laws.
    - **Shared `ExportButtons`** (`components/simulations/shared/ExportButtons.tsx`) + **`utils/dataExport.ts`**: PNG + CSV export wired into 7 sims.
    - **PhET attribution:** `SimulationsHub.tsx` Acknowledgments expanded with PhET credits for relevant sims.
    - **Beta label audit:** Ecosystem Balance and Population Genetics → stable (no badge). Others correctly set to `'beta'`.
    - **Free Body Diagram simulation** (`components/simulations/freeBodyDiagram/`, 12 files): Build Mode + Practice Mode (11 scenarios, local verify + reveal). AI feedback (`services/ai/fbd.ts`, `getFbdFeedback()`) gated to `isAuthenticated` prop. View string: `'free_body_diagram'`.
    - **Biological Systems Modeler rearchitecting:** `RegulatoryNodeType` extended; `NodeTypeDefinition` + `ModelerSavedState` added to `types.ts`; 4 domain palettes; 4 new starter circuits; `sp_regulatory_modeler_state` persistence; renamed to "Biological Systems Modeler".
  - **For Teachers Redesign + Teacher Mode** (2026-04-25):
  - **For Teachers Redesign + Teacher Mode** (2026-04-25):
    - New Teacher Mode toggle in dashboard header (persisted to `localStorage` key `sp_teacher_mode`).
    - When Teacher Mode is on, `components/LandingPage.tsx` renders a new Teacher Tools section (Document Creator, Interview Script, Reflection Prompter, Review Games, Rubric Translator — alphabetical).
    - `components/TeachersView.tsx` trimmed from ~319 to ~120 lines: removed all five tool cards, kept hero + privacy/gatekeeper block, added Get Started section with Teacher Mode CTA.
    - Plumbing in `App.tsx` mirrors the existing `accessibilityMode` pattern (state + localStorage persistence + toggle handler).
    - **Note for future cleanup:** dormant `teacherMode` in `contexts/AppConfigContext.tsx` is untouched (cross-cutting refactor; deferred).
  - **AP Review Bots Deprecated** (2026-04-25):
    - Hard-deleted dedicated AP Review Bot mode (Bio, Chem, Enviro, Physics 1/2/C). Functionality subsumed by a separate project.
  - **Diff-Check Grader & Model Rubric Highlighter for FRQ & CER** (2026-09-15, v.15Sep.05):
    - Implemented interactive criterion-by-criterion rubric alignment checklist and model exemplar comparison component (`components/results/RubricDiffViewer.tsx`) embedded directly in `components/ResultsView.tsx`.
    - Evaluates Claim, Evidence (auditing quantitative data and exhibit citations), and Scientific Reasoning in CER, and prompt sub-parts (Parts A, B, C) in FRQ with color-coded status badges (`Met`, `Partially Met`, `Missing`) and point scoring.
    - Added side-by-side / tabbed comparison view between student's submitted response and gold-standard model exemplar answer with one-click copy buttons for student reflection notebooks.
    - Added actionable "How to Upgrade Your Response" revision suggestions for any missing or partially met rubric criteria.
    - Updated `services/ai/grading.ts` prompts and JSON schemas to mandate `modelAnswer` and `rubricBreakdown` for all FRQ and CER assessments.
    - Added comprehensive unit tests in `components/results/__tests__/RubricDiffViewer.test.tsx` (4 tests passing).
  - **App Architecture Modularization & Domain Sub-Routers** (2026-09-15, v.15Sep.04):
    - De-monolithed the 3,280+ line `App.tsx` component into four cohesive domain sub-routers located in `components/routing/`: `SimulationRouter.tsx`, `ReviewGamesRouter.tsx`, `StudySprintRouter.tsx`, and `TeacherToolsRouter.tsx`.
    - Factored all 16 interactive simulations and hub dispatching into `<SimulationRouter />` with shared loading fallbacks and course/navigation props.
    - Factored all review games (Jeopardy, Square Match, Who Am I setup/preview/game, Bingo, Charades, and Taboo) into `<ReviewGamesRouter />`.
    - Factored Study Sprint setup, dashboard, and report views into `<StudySprintRouter />`.
    - Factored Teacher Tools (Document Creator, Document Config, Test Creator, Rubric Translator, Interview Script, Reflection, Teachers Hub) into `<TeacherToolsRouter />`.
    - Reduced `App.tsx` by ~480 lines of nested branch logic while retaining 100% type safety and zero runtime regressions.
  - **Flashcard Mode Overhaul: Leitner 5-Box SRS, Active Recall & Study Sets** (2026-09-15, v.15Sep.03):
    - Upgraded Flashcard Mode (`components/FlashcardView.tsx`) from a linear queue into a high-retention Spaced Repetition System (SRS) powered by a pure Leitner 5-box memory engine (`components/flashcards/srsEngine.ts`).
    - Correct cards advance along spaced retention intervals (1d → 3d → 7d → 14d → 30d), while missed cards drop back to Box 1 for reinforcement. All card progress persists in `localStorage['science_partner_flashcard_srs']` with zero student PII.
    - Added real-time 5-box distribution HUD (`components/flashcards/LeitnerBoxBar.tsx`) tracking counts in Learning, Familiar, Competent, Proficient, and Mastered stages with overdue counters and mastery percentage.
    - Built interactive Active Recall card mechanisms: inline Cloze fill-in-the-blank typing with fuzzy checking (`components/flashcards/ClozeCardContent.tsx`), front-face Multiple Choice (MCQ) option selection with instant correctness feedback, and quick True/False evaluation chips.
    - Added 1-click study filters (All Cards, Due for SRS Review, Rapid-Fire Cram, and Matching Quiz) and custom saved decks library (`components/flashcards/SavedDecksModal.tsx`) with JSON export/import.
    - Added full ergonomic keyboard shortcuts (`Space` to flip, `←`/`1` for Study Again, `→`/`2` for Got It, and `A`/`B`/`C`/`D` for MCQ options).
  - **Universal Simulation Challenge Decks (Biology & Chemistry Expansion)** (2026-09-15, v.15Sep.02):
    - Expanded the universal `<ChallengeDeck>` formative assessment suite to 4 foundational simulations (12 total): Reaction Kinetics, Cell Membrane Transport & Diffusion, Ecosystem Balance, and Population Genetics.
    - Added segmented mode switcher (Free Exploration Lab vs. Challenge Mode) and 3–4 sequenced, curriculum-aligned self-checking challenges with hints, solution presets, and real-time state verification across each simulation.
  - **General Chemistry Textbook Usability, Readability, Sim & Resource Overhaul** (2026-09-15, v.15Sep.01):
    - Guaranteed all illustrations, particle diagrams, and canvases across all 27 chemistry lessons are enclosed in responsive `.diagram` and `.figure` containers with overflow protection. Broadened `core.js` universal lightbox to enable click-to-zoom modal inspection with Esc-key dismiss across all diagrams and SVG figures.
    - Standardized chemical formulas, nuclear decay equations, thermodynamic definitions, and cosmological relationships to `.chem-display.formula-lg` with monospaced lining numbers and high-contrast semantic tokens.
    - Added 4 interactive simulation engines to Unit 5: Solar Proton-Proton Chain Fusion Sim (`5-1a`), Stellar Core Collapse & Supernova Simulator (`5-3a`), Radioactive Decay Transmutation Workbench (`5-8a`), and Nuclear Fission & Reactor Criticality Simulator (`5-8a`).
    - Implemented `window.GC_REGISTER_ANIMATION` using an `IntersectionObserver` to suspend off-screen canvas loops, preventing background CPU and battery drain.
    - Converted all practice sections across Units 4 and 5 to canonical Section 05 `.recall-section.recall` with `.blank[data-answer]`, restoring 100% curriculum-wide Spaced Repetition (SRS) and Cram Mode support.
    - Gated self-explanation cards behind substantive student input before unlocking model answers, and eliminated all emoji from `.arrow` navigation divs.
    - Enriched all 5 unit resource catalogs with verified Dr. David Knuffke K-Chem YouTube video lessons and playlists.
  - **Codebase Modularization & 72% Production Bundle Optimization** (2026-09-14, v.14Sep.04):
    - Decoupled vendor chunks (KaTeX, PDF generation, Lucide icons) to drop initial payload from 2.66 MB down to 729 kB (213 kB gzipped).
    - Modularized monolithic Science Jeopardy (1,947 lines down to 622 lines across 19 subcomponents) and Landing Page (1,393 lines down to 547 lines).
    - Converted secondary views to lazy-loaded chunks with smooth fallback.
  - **Universal Simulation Challenge Decks, Diagram Vector Tools & 5-Unit Suite** (2026-09-14, v.14Sep.03):
    - Built universal gamified `<ChallengeDeck>` component (`components/simulations/shared/ChallengeDeck.tsx`) with progress tracking, hint drawers, verification banners, and 1-click solution application.
    - Implemented self-checking formative assessments across all 8 interactive simulations: Calorimetry, Blood Buffers, Nuclear Decay, Ionic Bonding, Build an Atom, Covalent Bonding, Gas Laws, and Phase Change.
    - Upgraded Chemistry Diagram Generator (`public/chem/diagram-generator/`): Energy Bar LOL Charts with First Law thermodynamic conservation validation, Phase Motion Diagrams faithfully adhering to classroom conventions (brackets for solids, arcs for liquids, velocity vectors for gases), continuous cubic-bezier Reaction Coordinate Profiles with catalyzed pathways, and Nuclear Transmutation Equations with formatted nuclide notation and decay presets.
    - Expanded Document Creator and Teacher Workspace 1-click curriculum presets to all 5 chemistry units with new presets for Unit 1 (Chemical Hygiene & Structure) and Unit 2 (Prata Problems & Stoichiometry).
    - Completed comprehensive quality and checkpoint audit across all 27 chemistry lessons (100% clean JS syntax, 28 interactive widget JSON configs verified).
  - **Flashcard Formatting & Layout Improvements** (2026-09-14, v.14Sep.02):
    - Subscripts and superscripts (such as $Z_{\text{eff}}$, chemical formulas, and ionic charge notations) now render cleanly using Markdown and KaTeX across all flashcard study, write, and quiz modes instead of displaying raw code tags.
    - Added adaptive typography scaling and vertically responsive scroll areas to prevent multi-part questions and MCQ options from clipping at top of card.
    - Robustified write mode answer matching to strip formatting tags and normalize math notation.
    - Reported by **Ms. Vivian Huang**.
  - **Full Chemistry Textbook Curriculum, 3 New Simulations & Socratic Companion** (2026-09-14, v.14Sep.01):
    - Completed Units 3–5 of the SAS General Chemistry Textbook, completing all 27 lessons across 15 NGSS Performance Expectations with self-scoring checkpoints, live reference integrations, and printable review notes.
    - Added 3 new graduated standalone React simulations (16 total in `constants/simulationsRegistry.ts`):
      - **Coffee-Cup Calorimetry** (`components/simulations/calorimetry/CalorimetryView.tsx`): metal heat capacities, salt solution enthalpies, thermal equilibration curves, and heat-loss modeling.
      - **Arterial Blood Buffers & Homeostasis** (`components/simulations/bloodBuffer/BloodBufferView.tsx`): carbonic acid-bicarbonate buffer system, respiratory ($P_{CO_2}$) and renal ($[HCO_3^-]$) regulation, Henderson-Hasselbalch dial, and clinical disturbance challenges.
      - **Nuclear Decay & Radiometric Dating** (`components/simulations/nuclearDecay/NuclearDecayView.tsx`): alpha/beta/positron/gamma stochastic decay grid, half-life decay curves, and archaeological dating challenge.
    - Added interactive Socratic mascot companion to the chemistry textbook with strict zero-auth gating (0 LLM tokens consumed for unauthenticated guests; full Socratic guidance for signed-in school accounts).
    - Added 1-click curriculum presets in `DocumentCreatorView.tsx` and `TeachersView.tsx` for all 5 chemistry units.
    - Fixed Mixed Review drill blank card glitch during textbook cram sessions by supporting polymorphic diagram and passage stimuli.
  - **Google Workspace OAuth Gatekeeper Migration** (2026-08-25):
    - Migrated from legacy classroom code gate to Google Identity Services (GIS) Sign-In restricted to approved Google Workspace domains via `OAUTH_ALLOWED_DOMAINS`
    - Edge function `/api/auth-google` verifies Google ID tokens via `jose` and mints opaque 90-day HS256 session tokens with zero PII stored on device
    - Bumped `AUTH_VERSION` to 4 in `App.tsx` to automatically flush stale classroom codes and prompt re-authentication
    - Replaced passcode management in SettingsView with zero-maintenance domain authorization
    - Updated dev server middleware in `vite.config.ts` to mirror production token verification locally
  - **Jeopardy: Save to Library from Review Screen** (2026-04-21, v.21Apr.02):
    - Added a **Save to Library** button to the pre-game review footer in `components/jeopardy/JeopardyGame.tsx` (reuses the existing `handleSaveBoard` flow + `InputModal`), so a freshly generated board can be archived before approval.
  - **Jeopardy: Final Jeopardy Edit & AI Revise** (2026-04-21, v.21Apr.01):
    - Added `refreshFinalJeopardy()` in `services/jeopardyService.ts` (uses `DEFAULT_MODEL`, accepts optional category override + teacher notes).
    - Added `FinalJeopardyEditModal` and `AiReviseFinalModal` in `components/jeopardy/JeopardyGame.tsx`.
    - Wired **Edit** + **AI Revise** buttons into the Final Jeopardy card on the pre-game review screen, matching the existing category/clue authoring pattern.
  - **Jeopardy: Board Authoring, Daily Doubles & Display Polish** (2026-04-20, v.20Apr.02):
    - Added `AiReviseCategoryModal` and `AiReviseQuestionModal` — rich AI-revise UI replacing the generic inputModal flow for Refine/Refresh. Category modal allows editing the title directly.
    - Extended `refreshCategory()` in `services/jeopardyService.ts` to accept `newTitleOverride` parameter.
    - Added `difficultyMode` parameter to `generateJeopardyBoard()` — 'random' (default) or 'increasing' — with matching prompt directive.
    - Added `toggleDailyDouble()` handler + Daily Double badges and "Make DD"/"Remove DD" buttons in both pre-game review and `TeacherPreview` components.
    - Added `CategoryHeader` component with useLayoutEffect-based font-tier auto-fit (4 tiers) + CSS marquee fallback when still overflowing.
    - Added Archivo Black Google Font as `.font-display` utility in `index.html`; added `@keyframes jeopardy-marquee` animation.
    - HUD action row now `overflow-x-auto whitespace-nowrap`; Enter Final Stage button pinned outside teams scroll container.
  - **Jeopardy Review Game: Reliability, Legibility & Teacher QOL** (2026-04-20):
    - Replaced misleading "too much data" catch-all alert in `components/jeopardy/JeopardyGame.tsx` with error-aware branching (timeout / 401 / 429 / JSON parse / generic)
    - Upgraded 7 Jeopardy functions in `services/jeopardyService.ts` from hardcoded `gemini-2.0-flash` to `DEFAULT_MODEL` (`gemini-2.5-flash`); left `analyzeImage` on vision model
    - Added pre-game board review phase: generated boards render with all categories/clues/values for teacher edit/refine/refresh before play begins
    - Added adaptive font sizing helpers (`clueFontSize`, `answerFontSize`) to JeopardyGame mirroring the `squareMatch/fontUtils.ts` pattern
    - Legibility pass: category headers `text-sm md:text-base` + `h-24`, answered tiles `opacity-40` + `text-slate-400`, removed `italic` from hint box
    - Teacher QOL: re-open-last-clue undo, themed end-session modal (replaces `confirm()`), winner announcement flow on early end, Daily Double chime + ping ring, `Esc`/`Space` keyboard shortcuts in clue modal, HUD progress chip, clue-refresh failure alerts
    - HUD restructured: title/progress row + wrapped action-button row (fixes truncate-clipped buttons)
  - **AP Review Bots: CED-Accurate Prompt Alignment** (2026-04-03):
    - Added `ApCourseCedData` interface + `AP_COURSE_CED_DATA` constant in `services/ai/tutor.ts` with structured CED data for all 6 AP courses (unit weightings, science practices with MCQ percentages, exam format, anti-patterns)
    - Added `buildScopeDescription()` serializer; refactored `AP_PREP_PROMPTS` to be data-driven
    - Appended AP exam assessment style rules to `AP_PREP_ACTIVE_LEARNING_RULES` (stimulus-based MCQ requirement, AP task verbs, no recall questions)
    - Enriched all 6 AP cases in `getCourseContext()` in `services/ai/core.ts` — all modes (quizzes, FRQ, CER, flashcards, etc.) now receive CED-accurate context
    - CED PDFs placed in `public/CEDs/` as developer reference (not parsed at runtime)
    - Inspired by feedback from **Mr. Dylan Abbott**
  - **Upgraded DEFAULT_MODEL to gemini-2.5-flash** (2026-04-01):
    - Updated `DEFAULT_MODEL` in `services/ai/core.ts` from `gemini-2.0-flash` to `gemini-2.5-flash`
    - 2.5-flash is the latest stable (non-preview) Flash model
  - **About / How To Panels for All Simulations** (2026-03-29):
    - Created `AboutPanel.tsx` shared component with slide-in panel design
    - Added `onOpenAbout` prop to `SimulationHeader` (renders "How To Use" button)
    - Wrote full about content for all 5 simulations: Ecosystem, Population Genetics, Periodic Table, Covalent Bonding, Ionic Bonding
    - Each panel has 4 sections: What Am I Looking At?, Controls, Things to Try, Key Concepts
    - Added "About / How To Panel (REQUIRED)" section to Building New Interactives guidelines
  - **Ecosystem Simulation Overhaul & Interactives Polish** (2026-03-26):
    - Completely rewrote ecosystem simulation engine using NetLogo Wolf Sheep Predation mechanics
    - Renamed grass/rabbits/wolves to plants/herbivores/carnivores throughout
    - New mechanics: probabilistic reproduction with energy splitting, 100% predation on co-location, random movement, deterministic plant regrowth countdown
    - Added tick speed control, dual Y-axis population graph, consistent card headers
    - Added Acknowledgments section to SimulationsHub (NetLogo, Scarecrow Science)
    - Marked Periodic Table as stable (no longer beta)
    - Added "Building New Interactives" guidelines to CLAUDE.md
  - **Public Landing Page & Rebranding** (2026-03-26):
    - Created `PublicLandingPage.tsx` - new public homepage with split-screen design
    - Rebranded from "Science Practice Partner" to "Science Practice"
    - Converted `Gatekeeper.tsx` from full-screen to modal overlay with ESC key support
    - Implemented two-tier landing experience: public (unauthenticated) vs internal (authenticated)
    - Made interactive simulations publicly accessible without sign-in
    - Updated `SimulationsHub.tsx` with authentication-aware back button
    - Updated all meta tags, manifest.json, and SEO.tsx for new branding
  - **Technical Debt Cleanup** (2026-03-22):
    - Extracted 11 reusable modules from large components (449 lines removed)
    - Created `useTheme`, `useErrorHandler`, `useKeyboardNavigation` hooks
    - Created `AuthContext` and `AppConfigContext` providers
    - Added ESLint with `no-console` rule enforcement
    - Improved type safety (replaced `any` with proper types)
    - Fixed test creator section header hack with proper `sectionTitle` field
    - Refactored JeopardyGame (1,360 → 1,143 lines) and SquareMatchView (724 → 617 lines)
    - Added Technical Debt Prevention section to prevent regression
  - **Multi-Topic Practice Sessions** (2026-03-15):
    - Implemented across Quiz, FRQ, CER, Flashcards modes
    - Session History with automatic localStorage persistence
    - Updated Feature Matrix in MODE_REFERENCE.md

---

**Remember**: This file should be updated whenever project conventions, structure, or important processes change. Always review and update this file as part of the commit checklist.

**Last Updated**: September 16, 2026 (v.16Sep.01 - Chemistry Textbook Hardening & PE-Aligned Curriculum Nomenclature)

