# 🚀 Future Features Roadmap

Ideas to expand Science Practice Partner for greater inclusivity, utility, and engagement.

## ✅ Recently Implemented (October 2026)

### Adaptive PE Practice: Scoring Rules
- **Status:** ✅ Implemented 2026-11-02
- `public/chem/pe/pe-scoring.js` (tested by `services/__tests__/peScoring.test.ts`) and a second Level 2 item (`diagnosticAlt`) for all 91 skills: skills end at 4 / 3 / 2 / 1; only first-try answers raise a level; no repeated item inside a skill; results show the PE median and each skill's path; study tips follow the levels; seal v2 covers the level string. Details: `docs/textbook/CHANGELOG.md` (2026-11-02).

### Adaptive PE Practice: Voice, Scope & Figures Pass (All 15 Banks + PE Hub)
- **Status:** ✅ Implemented 2026-10-27 to 2026-10-28
- All 15 PE question banks (`HS-PS1-1` through `HS-ESS1-3`) and the PE hub (`public/chem/pe/pe-engine.js`) rewritten to the Tier 3 teacher voice (`docs/textbook/VOICE.md`) and aligned to the core scope of their linked lessons; Enrichment-only concepts and self-answering ranking giveaways removed; `questionRegister.test.ts` guards option-length balance (`<= 25` words, `correct <= 1.8x` min distractor) and zero banned testing-board phrases across all 15 banks.
- Item figures: a `figure` field in `pe-engine.js` and shared drawing helpers in `public/chem/pe/pe-figures.js` (Lewis structures, particle box, energy profile, reactions drawn bond by bond, fatty-acid chains).
- Engine hints & hub: a two-part miss names the part and keeps the item's hint; the numeric fallback no longer prints the answer; `renderHub` computes live per-card skill counts and total assessed skills (`91`) dynamically from `PE_DATA_*` and uses semantic CSS classes instead of hex colors.
- Details: `docs/textbook/CHANGELOG.md` (2026-10-27 and 2026-10-28).

### Project CLAUDE.md Consolidation
- **Status:** ✅ Implemented 2026-10-27 (separate session)
- Project `CLAUDE.md` cut from about 37 KB to about 19 KB. Content moved, not lost: voice tiers to `docs/textbook/VOICE.md`, landing-page order and sprint notes to `DEVELOPER_GUIDE.md`, the dev-bypass safety argument to the `dev-sign-in` skill, the ten drift guards to the new `docs/DRIFT_GUARDS.md`.

## ✅ Earlier

Shipped work from March to September 2026 is in [`docs/archive/FEATURES_SHIPPED_2026-03_TO_09.md`](docs/archive/FEATURES_SHIPPED_2026-03_TO_09.md).

## 🔮 Planned Features

### 📝 Adaptive PE Practice Follow-ups (from the 2026-10-27 pass)
*   ~~**Remaining banks:** the same voice and scope pass for HS-PS1-1, PS1-5, PS1-8, PS3-1, PS3-4 and ESS1-1 to 1-3 (not reviewed yet).~~ — **done 2026-10-28.** Rewrote all 8 remaining banks (`hs-ps1-1.js`, `hs-ps1-5.js`, `hs-ps1-8.js`, `hs-ps3-1.js`, `hs-ps3-4.js`, `hs-ess1-1.js`, `hs-ess1-2.js`, `hs-ess1-3.js`) to the Tier 3 voice and core lesson scope, removed Enrichment-only requirements and self-answering ranking labels (`EN = ...`, `c = ...`, `Approach / Physical Contact / Energy Redistribution`, galaxy redshifts in labels, onion shell depths in labels), and verified all 15 banks against `peDataKeys.test.ts` and `questionRegister.test.ts` (61/61 passing).
*   ~~**PE hub page copy** (`renderHub` in `pe-engine.js`): the card blurbs and the "Complete Curriculum" card are in testing-board register, type counts by hand ("15 / 15", "90 Assessed Skills", "6 Skills"), and use hex colours. Render counts from the data and rewrite the copy. Needs David's go-ahead.~~ — **done 2026-10-28.** `HUB_CARDS` and `renderHub` in `public/chem/pe/pe-engine.js` now compute per-card skill counts and total assessed skills (`91`) dynamically from the loaded `PE_DATA_*` banks, rewrite all 15 card blurbs and hero copy in Tier 3 teacher voice, and replace inline `#10b981` styles with `.pe-card-complete` CSS classes in `public/chem/pe/pe-practice.css`.
*   ~~**HS-PS1-4.6 placement:** collision orientation is taught in 4-1a (Unit 4), but HS-PS1-4 is a Unit 3 standard and its skill links to 3-4a. David to decide: link to 4-1a, or keep orientation out of the Unit 3 items.~~ — **done 2026-10-28 (Option B).** Rewrote `PS1-4.6` in `public/chem/pe/data/hs-ps1-4.js` to focus on the transition state and activation barrier (Lesson `3-14a`, without Unit 4 collision orientation) and updated `SKILL_LESSON_MAP['PS1-4.6']` in `public/chem/pe/pe-engine.js` to point to `Lesson 3-14a`.
*   ~~**CLAUDE.md size:** about 5 KB over the 14 KB target; lowering the `docsIntegrity` size cap to about 20 KB awaits David's yes.~~ — **done 2026-10-28.** Lowered the `docsIntegrity.test.ts` budget cap from 60 KB to 22 KB (`CLAUDE.md` is 19 KB).

### 📝 Adaptive PE Practice Follow-ups (from the 2026-11-02 scoring change)
*   ~~**Second Level 2 item per skill (`diagnosticAlt`)**~~ **done 2026-11-02.** 91 items, one per skill, in all 15 banks; review sheet for David in the 2026-11-02 changelog entry.
*   ~~**Varied numbers**~~ **calculation items done 2026-11-02** (33 items, `pe-num.js`). ~~Element-swap items~~ **done 2026-11-02** (20 items in HS-PS1-1 and HS-PS1-2, each set written and checked on its own). Not varied, on purpose: PS1-1.2 diag and diag2 (Ca and K are the only Z = 19 and 20 cases) and PS1-1.5 diag (Group 2 up to Z = 36 is Be, Mg, Ca). PS1-1.4 diag's aluminum distractor now reads "3-, because it gains 3 electrons, one for each outer electron it has" (was "...to match the nonmetals in Group 16", which form 2- ions; David chose this wording).

### 🎨 Visual & Interactive Learning
*   **Challenge Deck: goals, not recipes** (from Google Research, *Harnessing Generative UI for Education*, arXiv:2609.20738).
    - **Pilot (Reaction Kinetics):** ✅ **Approved & Committed September 2026** (David approved the goal pattern as the standard template).
    - **Universal Rollout Decision:** Roll out goal-oriented challenge decks across **all** simulations in the Simulations Hub (approved 2026-09-27). No simulations excluded: include Motion Tracker, Periodic Table, Build an Atom, Nuclear Decay, Gas Laws, Arterial Blood Buffer, Free Body Diagram, and Regulatory Modeler.
    - **Sprint 1A (Motion Tracker):** ✅ **Implemented September 2026** — 4 goal-oriented kinematic challenges (constant velocity glider $v_x = 1.50\text{ m/s}$, free fall gravitational drop $a_y = -9.80\text{ m/s}^2$, incline ramp acceleration $a_x = 2.00\text{ m/s}^2$, and 2D projectile motion independence) with 3-tiered hint ladders, synthetic lab apparatus presets, regression verification, and About panel (`components/simulations/motionTracker/`).
    - **Sprint 1B (Physiological & Nuclear Interactive Sims):** ✅ **Implemented September 2026**
      - **Arterial Blood Buffers (`components/simulations/bloodBuffer/`):** 4 goal-oriented clinical ER scenarios (Diabetic Ketoacidosis DKA, Panic Attack Hyperventilation, Post-Operative Respiratory Depression, and Excessive Antacid Ingestion) with 3-tiered hint ladders, dual clinical diagnosis + respiratory ventilation compensation verification into $[7.35, 7.45]$, neutral start states, About guide, and unit tests (`tests/unit/bloodBufferEngine.test.ts`).
      - **Nuclear Decay & Dating (`components/simulations/nuclearDecay/`):** 4 goal-oriented radiometric dating mystery scenarios (Egyptian Old Kingdom cedar beam, Paleolithic cave campfire charcoal, Iodine-131 radiopharmaceutical storage, and Earth's oldest zircon crystal) with 3-tiered hint ladders, isotope matching, half-life slider grid alignment, numeric age calculation within 6% tolerance, neutral start states, About guide, and unit tests (`tests/unit/nuclearDecayEngine.test.ts`).
    - **Sprint 1C (Legacy Recipe Decks Rewrite):** ✅ **Implemented September 2026**
      - **Gas Laws (`components/simulations/gasLaws/`):** 4 goal-oriented $PV=nRT$ thermodynamic challenges (Boyle isothermal compression $P \in [1.80, 2.20]\text{ atm}$, Charles isobaric expansion $T \ge 450\text{ K}$, Gay-Lussac isochoric pressurization $P \ge 2.50\text{ atm}$, and Dalton equimolar partial pressures $|P_A - P_B| \le 0.30\text{ atm}$) with 3-tiered hint ladders, solutionUnlockAfter={2}, neutral start states, and companion unit tests (`tests/unit/gasLawsEngine.test.ts`).
      - **Free Body Diagram (`components/simulations/freeBodyDiagram/`):** 11 goal-oriented kinematic scenario challenges across flat, inclined plane, hanging/pulley, and vertical motion categories with 3-tiered hint ladders, target acceleration state verification (equilibrium $\Sigma F = 0$, horizontal, vertical, and incline acceleration vectors), and companion unit tests (`tests/unit/fbdEngine.test.ts`).
    - **Sprint 1D (Trend & Biological System Sims):** ✅ **Implemented September 2026 — Universal Challenge Deck Rollout 100% COMPLETE**
      - **Periodic Table Trends (`components/simulations/periodicTable/`):** 4 goal-oriented periodic trend challenges (Fluorine peak electronegativity $\chi \ge 3.90$, Cesium alkali ionization threshold $\text{IE}_1 \le 380\text{ kJ/mol}$, Silicon semiconductor metalloid corridor, and Xenon noble gas thermal liquefaction $161\text{ K} \le T \le 165\text{ K}$) with 3-tiered hint ladders, property and temperature view integration, solution unlock after 2 failed attempts, neutral start states, and companion unit tests (`tests/unit/periodicTableEngine.test.ts`).
      - **Biological Systems Modeler (`components/simulations/regulatoryModeler/`):** 4 goal-oriented gene regulation and homeostasis challenges (Lac operon double-negative induction/derepression, Trp operon corepression/attenuation, endocrine negative feedback homeostatic setpoint control $[30\%, 55\%]$, and antagonistic dual-hormone insulin/glucagon glucose homeostasis) with 3-tiered hint ladders, multi-step dynamic steady-state verification, neutral start states, and companion unit tests (`tests/unit/regulatoryEngine.test.ts`).
    - **Design Invariants:**
      1. Target + constraint format without naming specific controls.
      2. 3-tiered hint ladders: question → concept → control.
      3. Solution unlock gated behind failed attempts (`solutionUnlockAfter={2}`).
      4. Neutral `start` state distinct from `solutionSetup`.
      5. Vitest solvability assertions for every deck in `tests/unit/simulationSolvability.test.ts`.
      6. Mobile viewport width containment (no horizontal overflow at 420px).
*   **Thermal & Thermochemistry Studio Simulation:** ✅ **Implemented September 2026**
    - Unified multi-tab interactive laboratory combining three core thermochemistry engines into a single first-class simulation in the Simulations Hub:
      1. **Tab 1: Specific Heat & Thermal Equilibration ($q = mc\Delta T$):** Metal cylinder / liquid mixing sandbox with dynamic dual-probe thermal logging, transparent masses, specific heat parameter sweeps, and thermal equilibrium calculation checks.
      2. **Tab 2: Multi-Stage Heating Curves:** Phase change energy workbench calculating $\Sigma q = q_{\text{solid}} + q_{\text{fus}} + q_{\text{liquid}} + q_{\text{vap}} + q_{\text{gas}}$ with animated particulate phase states, latent heat plateaus, and thousands-separator step metrics.
      3. **Tab 3: Coffee-Cup Calorimetry & Dynamic LOL Balancer:** Stacked discrete integer energy blocks ($E_{\text{th}} + E_{\text{ch}} = E_{\text{tot}}$) paired with animated center-circle heat flow vectors ($\pm \Delta E / q$) and reaction enthalpy $\Delta H_{\text{rxn}}$ solution calorimeter analysis.
    - Includes challenge decks, Socratic Beaker Buddy advice panel, and auto-exportable student lab reports.
*   **Free Body Diagram Simulator:** ✅ **Implemented April 2026** (Build Mode + Practice Mode with local verification and AI feedback for authed users; 11 scenarios across flat, incline, pulley, and vertical categories; view: `'free_body_diagram'`).
*   **Diagram Labeling Mode:** ✅ **Implemented September 2026** — AI generates an SVG diagram with numbered parts; students type labels (`components/diagramLabeling/DiagramLabelingView.tsx`, `?page=diagram_labeling`).
*   **Concept Map Builder:** ✅ **Implemented September 2026** — Interactive instrument where students build visual webs of connected terms, defining relationships rather than just facts (`components/conceptMap/ConceptMapView.tsx`, `?page=concept_map`).
*   **Advanced Graphing Support:** ✅ **Implemented September 2026 (v.28Sep.01)** - Implementation of **Box and Whisker Plots** (SVG whiskers, IQR box, median bar, Tukey outlier markers, interactive summary HUD) and **Histograms** (continuous frequency binning and distribution statistics) in `components/DataChart.tsx` and `services/graphingEngine.ts`.

### 🤖 AI Pedagogy & Assessment
*   **"The Skeptic" (Peer Review Simulator):** ✅ **Implemented September 2026** — AI skeptical peer reviewer pushes back on hypotheses and experimental designs, forcing students to defend positions (`skeptic` view, `?page=skeptic`).
*   **Diff-Check Grader:** ✅ **Implemented September 2026 (v.15Sep.05)** — Rubric alignment checklist HUD, side-by-side model comparison, and actionable sentence revision recommendations in FRQ & CER (`components/results/RubricDiffViewer.tsx`).
*   **AI Personae Standalone Modes (Sprint 2):** ✅ **Implemented September 2026**
    - Spun out **AI Science Tutor** (`components/personae/TutorView.tsx`, `?page=tutor`), **AI Socratic Guide** (`components/personae/SocraticView.tsx`, `?page=socratic`), and **AI Growth Coach** (`components/personae/GrowthCoachView.tsx`, `?page=growth_coach`) into dedicated standalone app modes matching the architecture of The Skeptic (`?page=skeptic`).
    - Full Standard Kit parity: Text-to-speech narration (`TTSButton`), SpeechRecognition voice dictation, Simplify/analogy levers, and Markdown session exports.
    - Pure calculation engine (`personaeEngine.ts`) with 4-part error taxonomy classification, math step parsing, Socratic reasoning depth measurement, offline fallbacks, and 14 unit tests in `tests/unit/personaeEngine.test.ts`.

### 🎮 Review Games
*   **Science Charades / Pictionary:** ✅ **Implemented** (`components/charades/CharadesGameView.tsx`).
*   **Element Bingo:** ✅ **Implemented** (`components/bingo/BingoGameView.tsx`).
*   **"Vocab Relay":** ✅ **Implemented September 2026** - High-energy, turn-based team review game (`components/relay/VocabRelayView.tsx`, `?page=vocab_relay`) featuring Pass & Play, Projector Dual (Red vs Blue), and Hot-Seat Solo Sprint modes; Clue Caller (with Taboo forbidden words) and Rapid 4-Choice retrieval modalities; active runner countdown timers, Baton Pass transition screens with offline Web Audio synthesis, scoring engine with speed/streak/+25% clean leg bonuses, and detailed Markdown match reports.

### 📚 Curriculum & Textbook Content
*   **SAS General Physics Level 3 and up** (energy, momentum, waves, fields): on hold for the Singapore American School Physics PLC's feedback on Levels 1 and 2. Carried over from the archived `docs/archive/TEXTBOOK_TODO.md`.
*   **SAS General Biology beyond Unit 2:** not planned. Unit 1 (Homeostasis) has four lessons and a review; Unit 2 (2a Carbon, 2b Ecology) has nine lessons and two reviews, built 2026-11-07 to 11-08 from Biology PLC materials. The PLC flags drift; summatives stay out of the book.
*   **Authentic Chemistry Textbook Figures & Diagrams:** Progressive addition of authentic, publication-grade science illustrations, apparatus diagrams, and molecular models across Chemistry textbook lessons (`public/chem/lessons/`).
*   **PE Support Pack Digital Practice Items:** Interactive digital practice items modeled directly on NYSSLS / NGSS Performance Expectation (PE) support packs, providing targeted assessment aligned with state standards.

### 🛠 Core UX & Accessibility
*   **Universal Student Accessibility Tools:** ✅ **Implemented September 2026 (v.28Sep.01)** - Guaranteed "Simplify", "Text-to-Speech" (`TTSButton`), and "Harder/Easier" scaffolding levers across `CalculationView`, `LabView`, `SkepticView`, and `DiagramLabelingView`.

## 🔧 Technical Debt & Refactoring

### Flashcard Mode Improvements
*   **Core Redesign:** ✅ **Implemented September 2026 (v.15Sep.03)** — 5-Box Leitner spaced repetition system (`components/flashcards/srsEngine.ts`), real-time 5-box distribution HUD (`components/flashcards/LeitnerBoxBar.tsx`), interactive Cloze deletion with inline typing (`components/flashcards/ClozeCardContent.tsx`), front-face active recall MCQ and True/False selection, study mode filters (All, Due, Cram, Match), and local saved decks library (`components/flashcards/SavedDecksModal.tsx`).
*   **Future Enhancements:**
    - ~~Image occlusion cards~~ ✅ **Implemented September 2026** — `components/flashcards/ImageOcclusionCardContent.tsx` with 3 preset decks and SVG mask overlays.
    - ~~Multi-step reveal~~ ✅ **Implemented September 2026 (v.28Sep.01)**: `components/flashcards/MultiStepCardContent.tsx` with sequential progressive disclosure, stage-by-stage TTS, and curated AP Bio / AP Chem pathway decks.

### Code Quality & Architecture
*   ~~**Study Sprint Data Capture:** Implement universal adapter to transform each mode's output into TaskResponse[] for Study Sprint report~~: **done 2026-09-28 (Sprint 2).** Implemented universal `adaptQuizResponses`, `adaptExplanationResponses`, `adaptCalculationResponses`, `adaptFlashcardResponses`, and `adaptWorksheetResponses` in `utils/studySprintAdapter.ts` with companion test suite `tests/unit/studySprintAdapter.test.ts`.
*   ~~**Type Safety:** Audit all `as any` casts and replace with proper type guards~~: **done 2026-11-02.** All 246 `no-explicit-any` warnings removed (ESLint is at 0 warnings). AI replies are typed at the parse (`services/ai/apReview.ts` and `learningLoop.ts` export their response types; `callAI` takes Gemini's `ContentListUnion` and `GenerateContentConfig`); `catch` blocks use `utils/errorMessage.ts`. Two tests that run book JavaScript in a vm sandbox keep a documented file-level exception. The 20 `exhaustive-deps` warnings were each read: 4 were real stale-state bugs (Charades and Taboo shortcuts ignored the timer running out, Flashcards' Space ignored Write mode, the periodic-table trend graph ignored the sidebar filter) and are fixed; 4 were harmless gaps and are closed; 12 are intentional run-once or prop-sync effects and carry a one-line reason.
*   **Component Consolidation:** Review duplicated UI patterns across modes (e.g., loading states, error displays, result cards). **Partly done 2026-11-02:** `components/games/GameModals.tsx` replaces 8 copies of the review games' revise, save and load modals; `INLINE_PARAGRAPHS` and `SPACED_PARAGRAPHS` in `MarkdownRenderer.tsx` replace about 30 inline renderer objects; `hooks/useWindowKeydown.ts` and `hooks/useDialog.ts` give one pattern for shortcuts and modals. Still open: loading states, error banners and result cards. The unused AdvisorFeed component (an old copy of the study-buddy chat now in `WelcomeHeroTile.tsx`) was deleted 2026-11-02.
*   ~~**Service Layer Cleanup:** Refactor geminiService.ts~~: **done 2026-02-22.** Split into `services/ai/*` (one module per feature); `geminiService.ts` is now a 60-line barrel re-export.
*   ~~**Decide what `services/geminiService.ts` is.**~~: **resolved 2026-09-27.** Formally established and documented as a permanent convenience barrel export facade for centralized access to `services/ai/*`.
*   ~~**State Management:** Migrate complex state from useState to useReducer~~: **done 2026-09-28 (Sprint 6).** Consolidated 11 disjointed `useState` hooks in `components/MultiModeView.tsx` into pure `useReducer(multiModeReducer)` (`components/multimode/multiModeReducer.ts`) with companion unit test `tests/unit/multiModeReducer.test.ts`.
*   ~~**Error Boundaries:** Add React error boundaries to prevent full app crashes from component failures~~: **done 2026-09-28 (Sprint 6).** Wrapped all 4 domain sub-routers (`SimulationRouter`, `ReviewGamesRouter`, `StudySprintRouter`, `TeacherToolsRouter`) in isolated `<ErrorBoundary />` components with contextual reset callbacks and buttons.
*   **Testing Infrastructure:**
    - Add unit tests for utility functions
    - Add integration tests for critical flows (quiz generation, grading, report generation)
    - Implement E2E tests for Study Sprint workflow
*   **Performance Optimization:**
    - ~~Code splitting for Review Games (Jeopardy, Square Match)~~: done 2026-09-14
    - ~~Lazy loading for Teacher Tools~~: done 2026-09-14
    - ~~Memoization audit for expensive computations~~: **done 2026-09-28 (Sprint 6).** Memoized `visualConfigMap` and registry projection mapping in `components/SimulationsHub.tsx`.
*   **Accessibility Audit:**
    - ~~Focus management in modals~~: **done 2026-11-02.** `hooks/useDialog.ts` (focus in on open, Tab kept inside, Escape closes, focus returns to the opener, `role="dialog"` with a name) at 36 call sites (modals, the mobile menu drawer and the sim About panel). Not applied: Jeopardy's projector-screen question and Final Jeopardy overlays, which run their own Space/Escape scheme. Guarded by `tests/unit/useDialog.test.tsx`.
    - ~~ARIA label completeness (buttons)~~: **done 2026-11-02.** 46 icon-only buttons named; `services/__tests__/a11yButtons.test.ts` fails on any new one. Form fields and images not audited yet.
    - Keyboard navigation: game shortcuts fixed (stale state, `useWindowKeydown`); Who Am I?'s hover-only edit button now shows on keyboard focus. A full tab-order pass is still open.
    - Screen reader testing: needs a person with VoiceOver or NVDA; not started.

### Infrastructure & DevOps
*   **Environment Configuration:** Move API keys and settings to proper .env file structure
*   ~~**Build Optimization:** Address Vite chunk size warnings~~ — **done 2026-09-14.** Vendor chunks split and secondary views lazy-loaded; the entry chunk is ~737 kB (215 kB gzipped).
*   ~~**Deployment Pipeline:** Automated testing before deployments~~ — **done 2026-09-17.** `npm run preflight` runs in the git pre-push hook and in `.github/workflows/preflight.yml`, which covers build, lint, unit tests, every public route and the browser smoke suite.
*   **Monitoring:** Add error tracking (e.g., Sentry) for production issues
*   **Analytics:** Privacy-respecting usage analytics to understand feature adoption

### Documentation Debt
*   **API Documentation:** Document all `services/ai/*` functions with JSDoc
*   **Component Props:** Add JSDoc comments to all component prop interfaces
*   **Architecture Diagram:** Create visual diagram of data flow and component hierarchy
*   **Onboarding Guide:** New developer setup documentation beyond README

## 🪦 Mothballed Features

The following concepts have been reviewed and permanently retired to prevent backlog bloat and focus on high-yield pedagogical tools:

*   **Skill Trees:** Visual curriculum tree that changes color (Bronze/Silver/Gold) based on mastery. *Retired 2026-09-27 per David's review — graph data model and state overhead are high relative to pedagogical value; existing Trophy Room and Unit Mastery tracking suffice.*
*   **"Boss Battles":** Timed, mixed-topic reviews required to unlock new units. *Retired 2026-09-27 per David's review — artificial gating mechanics conflict with student autonomy and flexible classroom practice.*
*   **"Science in the News" (Real-World Connector):** AI-generated practice scenarios based on recent scientific breakthroughs. *Retired 2026-09-27 per David's review — knowledge cutoff limitations, web grounding fragility, and low curricular alignment.*
*   **"Glossary Garden":** Gamified vocabulary collection where missed terms grow and must be "watered" (reviewed) to stay alive. *Retired 2026-09-27 per David's review — unnecessary gamification layer when Leitner SRS flashcard boxes already provide spaced review.*
*   **"Escape Room Puzzles":** Multi-step logic puzzles requiring science knowledge to unlock clues. *Retired 2026-09-27 per David's review — high puzzle-engine development cost with low reusable curricular depth.*
