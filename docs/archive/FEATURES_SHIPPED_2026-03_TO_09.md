# Shipped features, March to September 2026

The "Recently Implemented" sections moved out of [`FUTURE_FEATURES.md`](../../FUTURE_FEATURES.md) on 2026-10-27 to keep the live backlog short.

## ✅ Recently Implemented (September 2026)

### Adaptive PE Practice Suite (Sprint 5B - Semester 1 Complete)
- **Status:** ✅ Implemented (v.28Sep.03, v.29Sep.01)
- **Features:**
  - **Single-Question Workstation & State Machine (`pe-engine.js`):** Sequential adaptive engine presenting one question at a time, Mulberry32 PRNG seed derived from student name and PE ID, and two-phase progression: Phase 1 Diagnostic Survey (1 quick check per skill) -> Phase 2 Targeted Adaptive Practice (only for skills requiring remediation).
  - **2-Attempt Scaffolding & Remediation Cap:** Attempt 1 incorrect reveals targeted tutoring hint; Attempt 2 incorrect reveals full worked solution and logs deficit. Capped at max 2 remediation items per skill to prevent student frustration.
  - **Cryptographic Anti-Tamper A4 PDF Receipt:** Generates signed completion certificate with SHA-256 seal code (`XXXX-XXXX`), printed verification URL in seal box and footer, and QR code linking to teacher verification tool, alongside skill mastery scorecard table and item audit trail formatted strictly for single-page A4 printing.
  - **Click-to-Define Chemistry Glossary:** Integrated shared glossary (`public/chem/assets/glossary.js`) for tap-to-inspect definition popovers on core scientific terms across questions and explanations.
  - **Universal Unicode Formula Typography:** Formatted all formulas, ions, powers of ten, and scientific units with proper Unicode subscripts and superscripts (`NH₃`, `CO₂`, `Fe³⁺`, `10²³`).
  - **High School Readability Regularization:** Standardized language, hints, and worked solutions across all 31 skills to accessible introductory high school chemistry readability.
  - **Teacher Verification Tool (`verify.html`):** Validates submitted digital seal codes against student name, PE, score, and date with tampering detection across all semester 1 PEs.
  - **Full Semester 1 Curriculum Coverage:** Launched all 5 first-semester PEs (`HS-PS1-1`, `HS-PS1-2`, `HS-PS1-3`, `HS-PS1-7`, `HS-PS2-6`) covering 31 distinct skills with multi-modal item formats (two-tier claim/justification, ranking trends, categorization matrices, multi-select criteria verification, and quantitative calculations).
  - **Curriculum Integration:** Wired into Chemistry Textbook dashboard (`index.html`) under Performance Expectations and Practice & Review, and embedded above footer resources across Units 1 and 2 lesson pages.
  - **Strict Zero Em-Dashes Invariant:** Verified 100% compliance with zero em-dashes site-wide.

### React Architecture & Technical Debt Polish (Sprint 6)
- **Status:** ✅ Implemented (v.28Sep.02)
- **Features:**
  - **Domain Sub-Router Error Boundary Isolation:** Wrapped all domain routers (`SimulationRouter`, `ReviewGamesRouter`, `StudySprintRouter`, `TeacherToolsRouter`) in `<ErrorBoundary />` components with isolated fault containment, contextual error messages, and dedicated return navigation callbacks.
  - **MultiModeView State Consolidation:** Refactored `MultiModeView.tsx` from 11 disjointed `useState` hooks into a pure, unified `useReducer(multiModeReducer)` architecture (`components/multimode/multiModeReducer.ts`), synchronizing asynchronous AI partner chat streams and panel visibility.
  - **SimulationsHub Render Optimization:** Memoized `visualConfigMap` and simulations registry mapping with `useMemo` in `components/SimulationsHub.tsx` to eliminate re-evaluations during feedback modal interactions.
  - **Comprehensive Unit Tests:** Built 16 automated tests in `tests/unit/multiModeReducer.test.ts` validating state initialization, panel toggle mutations, and chat request cycles.

### Universal Student Accessibility Sweep & Standard Scaffolding
- **Status:** ✅ Implemented (v.28Sep.01)
- **Features:**
  - Audited and standardized accessibility across all primary practice modes:
    - **`CalculationView.tsx`:** TTS audio narration on tutor responses, "Explain Simpler" button, and quick scaffolding chips ("Simpler Steps", "Easier Problem", "Harder Problem").
    - **`LabView.tsx`:** TTS audio narration on assistant messages, "Simplify" lever, and quick scaffolding levers ("Explain Simpler", "Make It Easier", "Make It Harder") above the text prompt.
    - **`SkepticView.tsx`:** Added `TTSButton` to Research Question, Working Hypothesis, and challenge questions; added "Simplify Concern" toggle and reviewer hints per challenge.
    - **`DiagramLabelingView.tsx`:** Added `TTSButton` to diagram descriptions and individual callout anatomical descriptions; added interactive "Need a clue?" hint reveal per callout.

### Flashcard Multi-Step Progressive Pathway Reveal
- **Status:** ✅ Implemented (v.28Sep.01)
- **Features:**
  - New `multi_step` card type (`types.ts`) with `MultiStepItem` interface and `multiStepSteps` on `Flashcard`.
  - `components/flashcards/MultiStepCardContent.tsx`: progressive sequential disclosure for multi-stage biochemical/physical pathways (Action Potential, Translation Elongation, Photosystem Z-Scheme, SN2 Mechanism, Ozone Depletion Cycle).
  - Progress bar with percentage completion, stage-by-stage `TTSButton`, "Reveal Next Step", "Reveal All", and keyboard hotkeys (`Space` / `ArrowDown`).
  - `multiStepPresets.ts`: curated pathway decks for AP Biology and AP Chemistry; integrated into `SavedDecksModal.tsx` for 1-click loading without AI token spend.

### Advanced Scientific Graphing: Box & Whisker Plots and Histograms
- **Status:** ✅ Implemented (v.28Sep.01)
- **Features:**
  - `services/graphingEngine.ts`: pure mathematical algorithms for `calculateFiveNumberSummary` (Min, Q1, Median, Q3, Max, IQR, Tukey fences), `calculateHistogramBins`, and `calculateDistributionStats` (mean, median, sample std dev).
  - `components/DataChart.tsx`: upgraded to support `'histogram'` and `'box_plot' | 'box_and_whisker'`.
  - Box and Whisker plots feature SVG whiskers, IQR box, median line, isolated outlier markers, and an interactive 5-number summary inspection HUD.
  - Companion unit tests in `tests/unit/graphingEngine.test.ts` (7 tests).

### Image Occlusion Flashcards
- **Status:** ✅ Implemented (v.27Sep.01)
- **Features:**
  - New `image_occlusion` card type (`types.ts`) with `OcclusionMask` interface and `occlusionSvg` / `occlusionViewBox` / `occlusionMasks` fields on `Flashcard`.
  - `ImageOcclusionCardContent.tsx`: interactive SVG overlay where coloured rectangles hide diagram labels; clicking a mask reveals its label with animated transitions.
  - `occlusionPresets.ts`: 3 ready-made decks — Cellular Ultrastructure & Organelles (AP Biology), Cardiac Anatomy & Systemic Chambers (A&P), and Galvanic Electrochemical Cell Schematic (AP Chemistry) — all with hand-drawn SVG diagrams.
  - **Featured Occlusion Decks** section in `SavedDecksModal.tsx`: one-click load any preset without spending AI tokens; preset is saved to local storage then immediately launched.
  - `FlashcardView.tsx` routes `image_occlusion` cards to the new component alongside the existing `basic`, `cloze`, `mcq`, and `true_false` types.

### Diagram Labeling Mode
- **Status:** ✅ Implemented (v.27Sep.01)
- **Features:**
  - `DiagramLabelingView.tsx`: AI generates numbered SVG diagrams; students type labels into numbered input fields and receive instant correctness feedback.
  - Registered as a public route (`?page=diagram_labeling`) and added to `LandingPage.tsx`, `PracticeCenterView.tsx`, and `modesRegistry.ts`.
  - Bento card in the Study & Review section.

### The Skeptic — AI Peer Review Partner
- **Status:** ✅ Implemented (v.27Sep.01)
- **Features:**
  - AI mode (`skeptic` view) where students submit a hypothesis or experimental design and an AI "skeptical peer" pushes back with probing objections, forcing students to defend their reasoning.
  - `components/skeptic/skepticEngine.ts` and `services/ai/skeptic.ts` with `components/skeptic/skepticTypes.ts`; registered in `constants/modesRegistry.ts` and as a public route (`?page=skeptic`).
  - `components/skeptic/SkepticAbout.ts` provides the About panel content.

### Chemistry Textbook Units 2, 3, 4, & 5 Comprehensive Usability, Typographic, and Pedagogical Remediation
- **Status:** ✅ Implemented (v.18Sep.02)
- **Features:**
  - **Core Architectural Invariants Codified:** Redefined `.chem-display` to block layout eliminating flexbox equation tearing; purged illegal HTML tags (`<sup>`, `<sub>`, `<strong>`) from SVG `<text>` elements preventing browser parser ejections; replaced named HTML entities with Unicode characters (`⁴He`, `ΔH`) in uppercase buttons; resolved dynamic CSS tokens for Canvas 2D contexts; applied universal Retina backing buffer scaling to all canvas engines; integrated 3 to 4-step inquiry challenge decks into all interactive sandboxes.
  - **Unit 3 Thermochemistry & Energy Overhaul:** Rebuilt reaction profile geometry (`3-14a`), Sparkler Paradox particulate ensembles (`3-1a`), multi-stage heating curve equations and water hydrogen bonding (`3-1b`), discrete stacked LOL energy block diagrams ($4 + 1 = 5 \rightarrow 2 + 3 = 5$) with explicit center-circle heat vectors and de-densified calorimetry workbench (`3-1c`), and master 3-stage thermal collision mechanics (`3-4a`). Removed non-assessable Section 05 (Statistical Mechanics / $S = k_{\text{B}} \ln \Omega$) per NGSS boundaries.
  - **Unit 4 Kinetics & Equilibrium Overhaul:** Tagged Maxwell-Boltzmann curves as `[Enrichment / Beyond Assessed Scope]` and reframed self-explanation prompts around collision frequency (`4-1a`); centered catalysis on industrial surface mechanisms (`4-1b`); stabilized Le Chatelier reaction simulator numerical integrator, eliminating sawtooth graph artifacts (`4-6a`); purged SVG text errors and dynamically coupled arterial blood pH gauge to Le Chatelier shift ratios (`4-6b`).
  - **Unit 2 Reasoning & Unit 5 Astrophysics Overhaul:** Added "Choose Your Own Adventure" dual-path structure (Lipids vs. Alkanes) in `2-6a`; built authentic solar cross-section cutaway and hydrostatic cosmic thermostat in `5-1a`; built Three Visual Pillars synopsis and positive-definite Planck blackbody curve in `5-2a`; implemented binding energy curve and supergiant onion shell timescale bar in `5-3a`; built container-width Master Figure 5-4a.1 EM spectrum, interactive dual-control simulator (Energy + Wattage) demonstrating frequency threshold invariance, and aligned Section 06 with NGSS qualitative assessment in `5-4a`; built particulate radiation shielding comparison, exact exponential decay curves, and repaired stochastic nuclear lattice simulator in `5-8a`.
  - **Zero Em-Dashes Invariant:** Verified 100% compliance with zero em-dashes (`—` or `&mdash;`) site-wide.

### Chemistry Textbook Unit 2 Comprehensive Polish & Interactive Overhaul
- **Status:** ✅ Implemented (v.18Sep.01)
- **Features:**
  - **Side-by-Side Structure-Property Fat Simulation (`2-6a`):** Interactive dual simulator comparing Saturated (Stearic acid, MP 69°C) vs. Unsaturated (Oleic acid, MP 13°C) fats with a shared 0 to 100°C slider, phase animations, and full-width scientific argument builder.
  - **Stoichiometry Non-Overlapping Particle Bays (`2-7c`):** Partitioned reaction chamber into 8 dedicated coordinate bays (100 x 125px), mathematically guaranteeing zero particle overlap across all reactant amounts. Includes visual particle equation (2 Gc + 1 M + 1 Ch -> 1 Gc2MCh) and dynamic results tray for S'mores limiting reactants.
  - **Mole & Mass Standards (`2-7a` & `2-7b`):** 540x180 mole scale bridge with digital bench balance, space-filling CPK particle spheres, authentic glucopyranose 6-membered ring, full container-width mole maps, canonical bent water models, and non-assessable extension demarcation.
  - **Physical & Chemical Transformations (`1-2e` & `2-2a`):** Centered electron transfer badges, combustion O2 separation and H2O mass conservation, heteronuclear atom identity conservation, and puddle-pooling melting phase physics.
  - **Dashboard Grid Parity & Grill Terminology:** Restored proper CSS grid separation between Unit 1 and Unit 2, and regularized storyline terminology to "grill" throughout the textbook.

### Diff-Check Grader & Model Rubric Highlighter for FRQ & CER
- **Status:** ✅ Implemented (v.15Sep.05)
- **Features:**
  - **Rubric Alignment Checklist HUD:** Interactive criterion-by-criterion rubric scorecard (`RubricDiffViewer.tsx`). Evaluates Claim, Evidence (auditing quantitative data and exhibit citations), and Scientific Reasoning in CER, and prompt sub-parts (Parts A, B, C) in FRQ with color-coded status badges (`Met`, `Partially Met`, `Missing`) and point scoring.
  - **Side-by-Side Model Exemplar Comparison:** Added an interactive comparison view displaying the student's submitted response side-by-side with a gold-standard model exemplar answer, complete with one-click copy buttons for reflection notebooks.
  - **"How to Upgrade" Sentence Revision Recommendations:** For any rubric criterion that was missed or only partially satisfied, the AI grader provides concrete, 1-sentence phrasing recommendations showing students exactly how to rewrite their response to earn full marks.

### App Architecture Modularization & Domain Sub-Routers
- **Status:** ✅ Implemented (v.15Sep.04)
- **Features:**
  - De-monolithed the 3,280+ line `App.tsx` component into four cohesive domain sub-routers located in `components/routing/`: `SimulationRouter.tsx`, `ReviewGamesRouter.tsx`, `StudySprintRouter.tsx`, and `TeacherToolsRouter.tsx`.
  - Factored all 16 interactive simulations and hub dispatching into `<SimulationRouter />` with shared loading fallbacks and course/navigation props.
  - Factored all review games (Jeopardy, Square Match, Who Am I setup/preview/game, Bingo, Charades, and Taboo) into `<ReviewGamesRouter />`.
  - Factored Study Sprint setup, dashboard, and report views into `<StudySprintRouter />`.
  - Factored Teacher Tools (Document Creator, Document Config, Test Creator, Rubric Translator, Interview Script, Reflection, Teachers Hub) into `<TeacherToolsRouter />`.
  - Reduced `App.tsx` by ~480 lines of nested branch logic while retaining 100% type safety and zero runtime regressions.

### Flashcard Mode Overhaul: Leitner 5-Box SRS, Active Recall & Study Sets
- **Status:** ✅ Implemented (v.15Sep.03)
- **Features:**
  - **Persistent Leitner Spaced Repetition (SRS):** Built on a 5-box memory engine (`srsEngine.ts`). Correct answers advance cards along spaced intervals (1d → 3d → 7d → 14d → 30d), while missed cards drop to Box 1 for reinforcement.
  - **Leitner Box Progress HUD:** Real-time 5-box distribution bar (`LeitnerBoxBar.tsx`) tracking counts in Learning, Familiar, Competent, Proficient, and Mastered stages, with overdue counters and mastery percentage.
  - **Interactive Active Recall Card Formats:** Inline Cloze fill-in-the-blank typing with instant fuzzy checking and reveal gating (`ClozeCardContent.tsx`), front-face Multiple Choice (MCQ) option selection with instant correctness feedback, and quick True/False evaluation chips.
  - **Study Mode Filters:** 1-click segmented switching between All Cards, SRS Due Only (targeting overdue cards), Rapid-Fire Cram Mode, and Matching Quiz.
  - **Saved Study Sets & Decks Library:** Save active decks locally to `science_partner_saved_decks`, load previously saved sets without AI token cost, and export/import decks as JSON (`SavedDecksModal.tsx`).
  - **Ergonomic Keyboard Navigation:** Full hotkey support (`Space` to flip, `←`/`1` for Study Again, `→`/`2` for Got It, and `A`/`B`/`C`/`D` to select MCQ options).

### Universal Simulation Challenge Decks (Biology & Chemistry Expansion)
- **Status:** ✅ Implemented (v.15Sep.02)
- **Features:**
  - Expanded `<ChallengeDeck>` self-checking formative assessment suites to 4 additional core simulations (12 total): Reaction Kinetics, Cell Membrane Transport & Diffusion, Ecosystem Balance, and Population Genetics.
  - **Reaction Kinetics:** Formative challenges for activation energy barriers, low-temperature inorganic catalysis, enzyme active site saturation ($V_{\text{max}}$), and thermal denaturation thresholds.
  - **Cell Membrane Transport:** Formative challenges for passive bilayer diffusion, glucose channel pore facilitation, ATP active transport pumps against gradients, and cellular homeostasis.
  - **Ecosystem Balance:** Formative challenges for 2-trophic stable green world balance, 3-trophic coexistence across 100 ticks, and apex predator trophic cascades.
  - **Population Genetics:** Formative challenges for Hardy-Weinberg null baseline ($N=1000$ over 25 generations), directional selection against recessive lethal alleles, small-population bottleneck drift, and balanced polymorphism under heterozygote advantage.

### General Chemistry Textbook Usability, Readability, Sim & Resource Overhaul
- **Status:** ✅ Implemented (v.15Sep.01)
- **Features:**
  - **Universal Framed Figures & Lightbox:** Framed all illustrations, charts, and particle diagrams in `.diagram` and `.figure` containers with responsive scaling. Broadened `core.js` universal lightbox to support all figures and SVG diagrams with Esc-key dismiss.
  - **Standardized Formula Typography:** Migrated all chemical formulas, nuclear reactions, thermodynamic definitions, and cosmological relations to `.chem-display.formula-lg` with monospaced lining numbers and high-contrast semantic tokens.
  - **Unit 5 Simulation Engines:** Built 4 new interactive simulation engines: Solar Proton-Proton Chain Fusion Sim (`5-1a`), Stellar Core Collapse & Supernova Simulator (`5-3a`), Radioactive Decay Transmutation Workbench (`5-8a`), and Nuclear Fission & Reactor Criticality Simulator (`5-8a`).
  - **Animation Performance:** Added `window.GC_REGISTER_ANIMATION` IntersectionObserver lifecycle API in `core.js` to suspend off-screen canvas loops.
  - **100% Spaced Repetition (SRS) Coverage:** Rebuilt Section 05 across all 27 lessons with canonical `.recall-section.recall` and `.blank[data-answer]`, fully restoring dashboard Cram and SRS review modes.
  - **Commit-Before-Reveal Gating:** Gated self-explanation prompt cards to require substantive student input before unlocking model answers.
  - **Authentic K-Chem Video Resources:** Enriched all 5 unit resource catalogs in `index.html` and `lessons.json` with authentic Dr. David Knuffke K-Chem YouTube lessons and playlists.

### Codebase Modularization & 72% Bundle Payload Optimization
- **Status:** ✅ Implemented (v.14Sep.04)
- **Features:**
  - **JeopardyGame Modularization:** Refactored monolithic component from 1,947 lines to 622 lines by extracting 19 focused subcomponents and utilities in `components/jeopardy/` (modals, review board, setup dashboard, game HUD, SVG/canvas charts, and PDF exporter).
  - **LandingPage Modularization:** Refactored main landing page from 1,393 lines to 547 lines by extracting `WelcomeHeroTile`, `DailyMissionCard`, `CourseTextsSection`, `OnboardingModal`, and `renderModeIcon` into `components/landing/`.
  - **Route & Vendor Code-Splitting:** Decoupled `jspdf`, `html2canvas`, `katex`, and `lucide-react` into cachable vendor chunks, and lazily loaded secondary review games, document creators, and dashboard views via `React.lazy` and `React.Suspense`.
  - **72.5% Bundle Payload Reduction:** Reduced entry JS chunk (`index-*.js`) from 2.66 MB down to 729 kB (213 kB gzipped).

### Full General Chemistry Textbook (27 Lessons, 15 NGSS PEs)
- **Status:** ✅ Implemented (v.14Sep.01)
- **Features:**
  - Completed Units 1 through 5 (27 lessons total) covering all 15 High School Chemistry NGSS Performance Expectations with strict 1:1 mapping.
  - Interactive Dual-Organization Switcher (Unit Storylines vs Performance Expectations) with persistent state.
  - 27-node concept mastery map with cross-unit prerequisite vectors and real-time color coding.
  - Client-side textbook reading progress bar and 1-click deep resume on student dashboard (`LandingPage.tsx`).

### 3 New Standalone React Simulations (16 Total in Registry)
- **Status:** ✅ Implemented (v.14Sep.01)
- **Features:**
  - **Coffee-Cup Calorimetry Sandbox:** $q = mc\Delta T$ calculation engine, metal cylinder drop animation, dynamic thermal equilibration curve, live LOL energy diagrams, and pedagogical About panel.
  - **Arterial Blood Buffers & Homeostasis:** Henderson-Hasselbalch physiological simulation, SVG arterial pH dial gauge ($6.8 - 8.0$), respiratory rate control ($4 - 40\ \text{bpm}$), rebreathing mask, and whole blood vs unbuffered saline toggle.
  - **Nuclear Decay & Radiometric Dating:** Transmutation selector (alpha, beta-minus, positron), 100-particle stochastic nucleon grid, continuous half-lives slider, balanced nuclear transmutation equations, and interactive sample age dating calculator.

### Socratic Companion Mascot in Textbook (`/chem/`)
- **Status:** ✅ Implemented (v.14Sep.01)
- **Features:**
  - Floating Beaker Buddy button and glassmorphic coaching drawer across all 27 textbook lessons.
  - **Strict OAuth Gating:** Unauthenticated guests see focus study tips and sign-in lock banner (0 LLM tokens). Authenticated school domain accounts get live Socratic inquiry coaching and quick prompt chips via `/api/gemini`.

### 1-Click Curriculum Presets (Units 3–5)
- **Status:** ✅ Implemented (v.14Sep.01)
- **Features:**
  - Ready-to-generate presets in Document Creator (`DocumentCreatorView.tsx`) and Teacher Workspace (`TeachersView.tsx`) for Calorimetry problem sets, Kinetics/Equilibrium CER data analysis, and Nuclear decay worksheets.

### Mixed Review Drill & Cram Mode Bugfix
- **Status:** ✅ Implemented (v.14Sep.01)
- **Features:**
  - Polymorphic question extraction (`extractExamQuestionData` and `extractRecallQuestionData`) resolving blank cards and runtime errors across legacy and modern lesson templates.

## ✅ Recently Implemented (August 2026)

### Google Workspace Domain OAuth & Zero-PII Auth Migration
- **Status:** ✅ Implemented (v.25Aug.01)
- **Features:**
  - **Google Identity Services (GIS) Sign-In:** Replaced legacy classroom code entry with domain-restricted Google Sign-In (`OAUTH_ALLOWED_DOMAINS`).
  - **Zero-PII Token Signing:** Server-side HS256 signed session tokens carrying only the verified domain string (`{ dom: domain }`), strictly avoiding student PII in storage.
  - **Auth Version Rotation:** Bumped `AUTH_VERSION` to 4 to automatically flush stale classroom codes and prompt re-authentication.
  - **Local Dev Parity:** Vite dev server middleware matches production token verification.

### Build an Atom — Atomic Number, Ionic Charge & Electron Shell Delineation
- **Status:** ✅ Implemented (v.14Aug.01)
- **Features:**
  - **Atomic Number (Z) Instrument:** Live gauge tracks proton count and element identity directly alongside Mass Number and Net Charge.
  - **Ionic Charge & Floating Bohr Badge:** Renamed Net Charge scale to "Net Charge / Ionic Charge" and added a floating non-zero charge badge inside the Bohr SVG diagram.
  - **Valence vs. Kernel Electron Distinction:** Visual distinction with slate-blue inner kernel electrons and vibrant cyan outer valence electrons, plus dynamic legend and sidebar stats.
  - **Subatomic Particle Inventory:** Corrected nucleon terminology with sub-headers separating Nucleons (Protons + Neutrons) from Electrons with a dashed divider.
  - **Radioactive Label:** Unstable isotopes explicitly labeled "Unstable Nucleus — Radioactive ☢️".

## ✅ Recently Implemented (July 2026)

### Periodic Table — Visible-Light Emission & Absorption Spectra
- **Status:** ✅ Implemented (v.09Jul.01)
- **Features:**
  - **Spectra Tab:** Third tab in the element detail popup (alongside Bohr Model / Lewis Dot) showing visible-light (380–700 nm) emission and absorption spectra as paired SVG strips with a shared wavelength axis and per-line wavelength tooltips.
  - **NIST-Sourced Data:** Generated from a NIST Atomic Spectra Database export covering 97 elements (Z 1–99 except At/Fr), reduced to each element's 25 strongest visible lines (H Balmer series, Ne red-orange forest, Na D-line doublet, Hg, He, Ca, Sr, Ba flame-test colors, etc.); elements without data show a friendly no-data message rather than invented wavelengths.
  - **About Panel Guidance:** New explanations connecting emission/absorption lines to electron energy-level transitions, plus suggested experiments.

## ✅ Recently Implemented (June 2026)

### IB Science Integration, Grading Alignment & Curriculum Catalog
- **Status:** ✅ Implemented (v.03Jun.01)
- **Features:**
  - **IB Science Courses:** Added 8 IB courses (Biology SL/HL, Chemistry SL/HL, Physics SL/HL, ESS SL/HL) with JSON-structured syllabi aligned to the current IB guide (2025 first assessment).
  - **Dynamic IB Tutor:** Socratic tutor adapts system prompts, grading rubrics (Marks 1–4), command-term definitions (State/Describe/Explain/Evaluate), and scope rules based on AP vs. IB context.
  - **Grading Alignment Fix:** Grading model now receives the exact MCQ option list and designated correct answer — eliminating hallucinated distractor analysis and silent answer re-derivation.
  - **Curriculum-Based Catalog:** Advanced Study Buddy catalog reorganized from subject-area grouping to curriculum-track grouping (AP / IB), with subject sub-headers inside AP and a future-ready architecture for adding Regents or other tracks.

### Interactive Sandbox, Onboarding, Socratic Advisor & Crowdfunding
- **Status:** ✅ Implemented (v.01Jun.01)
- **Features:**
  - **Bohr "Build an Atom" Simulator:** Bohr model sandbox with concentric animated shell revolutions, golden spiral nucleus particle clustering, nuclear stability engine shaking triggers, Mass/Charge pointers, click-to-build Periodic highlights, and gamified challenges.
  - **Socratic Mascot Advice Panels:** Interactive slide-out panels integrated across Covalent Bonding, Ionic Bonding, Phase Change, and Free Body Diagram simulators.
  - **Spotlight Onboarding Tutorial:** A 4-step modal tour overlay for first-time visitors covering favorites pinning, subject selection/preferences settings, and Socratic mascot helpers.
  - **Wikipedia-Style Crowdfunding Overhaul:** Standardized donation messaging around internet public goods, with premium Lucide React social vectors and pulsing coffee triggers.
  - **Centralized Feedback Modal:** Mounted `<ContactModal />` globally, routing all teachers/students/support pages to Formspree, deprecating broken `mailto:` links.
  - **Visual Bento Redesigns:** Transformed Let's Get Started Form, Grade Selector, and Dual-Concentric Loading Spinners to fluid theme-responsive light/dark containers.

## ✅ Recently Implemented (May 2026)

### Mascot Customization & AI Study Companion (Phase IV & V)
- **Status:** ✅ Implemented (v.31May.02)
- **Features:**
  - **Mascot Customization:** Choose from four distinct animated science companions site-wide (Science Bot, Beaker Buddy, Happy Plant, Cool Gerbil).
  - **AI Study Companion Chat:** Interactive two-way study planning cockpit on the homepage with custom persona voice responses.
  - **Dynamic Launcher Shortcuts:** Clicking suggestions directly boots up relevant practice modules (e.g. `[quiz]`, `[calculation]`).
  - **Sidebar Navigation Redesign:** Upgraded How It Works, Support, and Site Updates to full navigation buttons with custom vectors.
  - **Vector Icons Migration:** Migrated all practice modes and sub-tabs from emojis to high-fidelity, platform-perfect Lucide React vector icons.
  - **Branding Renames:** Standardized brand names to **Science Practice Partner** and **Science Practice AI**, purging leftover "Science Buddy" references.

## ✅ Recently Implemented (April 2026)

### Post-Generation Question Validation
- **Status:** ✅ Implemented (v.01Apr.01)
- **Problem Solved:** Prevents logically broken MCQ/fill_in_blank items (like negative-stems where all distractors fit the same direction) from reaching the student.
- **Features:** 
  - Batched post-generation LLM audit
  - Automatic injection of failure reasons into up to 2 retry attempts
  - Graceful fallback (silent drop of unrecoverable items)
  - Phased loading messages ("Generating questions..." -> "Verifying questions...")

## ✅ Recently Implemented (March 2026)

### Multi-Topic Practice Sessions
- **Status:** ✅ Implemented (v.15Mar.01)
- **Modes:** Practice Session, Written Response (FRQ), Data Analysis (CER), Flashcards, Document Creator, Study Sprint
- **Features:**
  - Practice Whole Unit button for one-click unit reviews
  - Custom multi-topic input via comma-separated topics
  - AI distributes questions evenly across all selected topics
  - Topic labeling on each question for clarity

### Session History & Review
- **Status:** ✅ Implemented (v.15Mar.01)
- **Modes:** Practice Session, Written Response (FRQ), Data Analysis (CER), Flashcards
- **Features:**
  - Automatic session saving to localStorage upon completion
  - Full session review with all questions, answers, and detailed feedback
  - Color-coded question navigator (green/red/amber)
  - Filter by mode, search by topic/course, sort by date/score
  - Storage management with 50-session limit and auto-pruning
  - Trophy Room integration (click badges to view original session)

---

