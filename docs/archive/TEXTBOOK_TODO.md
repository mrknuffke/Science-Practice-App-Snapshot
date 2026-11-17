# TODO.md — Unified Outstanding Work & Backlog

**This is the single source of truth for all outstanding work, active design revisions, and feature backlogs for the Chemistry Interactive Notes project. If you are an AI assistant starting a session, read this file first. Add all new tasks, ideas, or feedback here, and log completed work in `CHANGELOG.md`.**

## Where things stand (2026-10-26)

Phase 4 of `docs/plans/textbook-consistency-fixes.md` is finished. All three books (chem, physics, bio) run on the
shared runtime in `public/textbook/` and meet the standard. Nothing in the plan is queued after it. What is open:

- **General Physics Level 3 and up** (energy, momentum, waves, fields): on hold for the Singapore American School
  Physics PLC's feedback (item 7 under "General Physics Textbook Launch" below).
- **Bio beyond Unit 1**: not planned. Unit 1 has four lessons and a synthesis review.
- **Shortening the project `CLAUDE.md`**: planned in a separate chat. `services/__tests__/docsIntegrity.test.ts` caps it at 60 KB.

Sections 00 and 0 below are history. Each item in them is resolved or replaced by the shared runtime and the Sim Standard.

## 00. Carried Forward from the 2026-09-20 Governance Audit [ALL RESOLVED 2026-09-27]

Found while bringing the physics book under the push gate and consolidating the
agent instructions. None of these were fixed in that pass. Each says what is
wrong, what was already tried, and how to know when it is done, so a cold
session can pick one up without re-deriving the context.

### 00.1 Physics book is effectively non-responsive [RESOLVED 2026-09-27]

**Resolution.** Measured all 6 physics pages in a 420px browser. Identified fixed `.topbar-left` and `.topbar-right` widths (lacking icons and responsive breakpoints on dashboard and `about.html`, where labels forced 500px+ width). Added SVG icons and label spans to dashboard and `about.html` topbars, added responsive collapse rules to `components.css` (`topbar` padding, icon-only buttons below 768px, crumb hidden below 600px), constrained `.sim-stage` with `min-width: 0; overflow: hidden;` and global `canvas { max-width: 100%; height: auto; }`. Verified `scrollWidth === 420` (zero overflowing elements) across all 6 pages at 420px, 768px, and 1440px. Pinned with automated Playwright assertion in `tests/smoke/textbook.smoke.ts`.

### 00.2 Neither dashboard renders from its own lesson manifest [RESOLVED 2026-09-27]

Previously, both `public/chem/index.html` and `public/physics/index.html` hard-coded
their lesson lists. Chemistry kept a `MANIFEST_DATA` copy (~1,500 lines of static JSON
in script, plus duplicated HTML cards); physics wrote the links directly into the markup.
`lessons.json` was not read at runtime by either.

**Physics Closed 2026-09-27:** `public/physics/index.html` now fetches `lessons.json`
at runtime, grouping lessons dynamically by unit, styling review packets, and
ensuring new lessons in `lessons.json` appear without dashboard code edits.

**Chemistry Closed 2026-09-27:** `public/chem/index.html` now fetches `lessons.json`
at runtime, populating lesson cards, glossary cards, unit and PE resources,
concept map nodes, and SRS review queue dynamically. Over 2,000 lines of duplicated
JSON and card markup eliminated from `index.html`. Guarded by `sourceOfTruth.test.ts`
and `textbook.smoke.ts`.

### 00.3 Colophon and changelog can drift apart, in both books [RESOLVED 2026-09-27]

`TEXTBOOK_DEV_GUIDE.md` section 4 requires a student-visible change to be
recorded in both `CHANGELOG.md` and the book's `about.html` section 06.

**Resolution:** Implemented `textbook changelog and colophons stay in step` drift
guard in `services/__tests__/docsIntegrity.test.ts`. Asserts that for both `chem`
and `physics`, the most recent date in `about.html` Section 06 is not older than
the most recent entry in `docs/textbook/CHANGELOG.md` describing that book. Also
backfilled the 20 September 2026 SVG repair entry into `public/chem/about.html`
Section 06.

### 00.4 `designTokens.test.ts` is named in the changelog and does not exist [RESOLVED 2026-09-27]

**Resolution:** The test previously lived under utils/ before being consolidated
into `services/__tests__/designTokens.test.ts` on 2026-09-27 to unify with
`chemCssTokens.test.ts`, `sourceOfTruth.test.ts`, and `docsIntegrity.test.ts`.
`docs/RENDERING_GOTCHAS.md` was updated to cite it as the active guard.

---

## 0. Typography Standardization & Foundational Design Governance [COMPLETED; superseded by Phase 4, 2026-10-26]

### Current Audit Status (2026-09-17)
- [x] **Single Source of Truth Semantic Scale (`tokens.css`)**: Expanded to 12 distinct levels (`--text-3xs` [9px] through `--text-4xl` [48px], plus `--text-reading` [22px Spectral editorial prose]).
- [x] **Core Stylesheet Regularization (`components.css`)**: 100% of the ~190 ad-hoc fractional rem and arbitrary pixel font declarations replaced with standard semantic tokens (`var(--text-*)`). Zero un-tokenized font-size declarations remaining.
- [x] **Dashboard & Colophon Harmonization (`index.html` & `about.html`)**: Inlined font sizes across concept maps, practice cards, review dialogs, and colophon tables converted to semantic tokens.
- [x] **Diagram Generator Synchronization (`diagram-generator/app.css`)**: Synchronized typography tokens with `tokens.css` and regularized diagram text sizes (`--dia-atom-size: 22px`, `--dia-header-size: 14px`, `--dia-label-size: 12px`, `--dia-caption-size: 10px`).
- [x] **React App Micro-Typography (`index.html`)**: Added `text-3xs` (`0.5rem`) and `text-2xs` (`0.625rem`) to Tailwind config.
- [x] **Governance & Anti-Drift Documentation**:
  - Added Design Token & Foundational Invariants to `.agent/rules/development-workflow.md`.
  - Added Golden Rule 23 to `docs/textbook/TEXTBOOK_DEV_GUIDE.md`.
  - Expanded `DESIGN_SYSTEM.md` with dual-surface token specifications and anti-drift invariants.
  - Updated `UX_DESIGN_CHECKLIST.md` with token audit gates.
- [x] **Curriculum-Wide Per-Lesson Font-Size Sweep (`public/chem/lessons/*.html`)**: Swept all 27 lesson HTML files, eliminating over 530 ad-hoc inline and `<style>` block font sizes and mapping them cleanly to `var(--text-*)` and `var(--dia-*)`. Zero ad-hoc font sizes remaining across the entire lesson library.
- [x] **Strict Zero Em-Dashes Invariant Enforced**: Eradicated all em-dashes and `&mdash;` entities across all 27 lesson HTML files and companion scripts.
- [x] **Automated Invariant Test Suite (`services/__tests__/designTokens.test.ts`)**: Integrated into `npm run verify` to test 100% token coverage, zero ad-hoc rem font sizes across `components.css` AND all 27 lesson HTML files, and zero em-dashes repo-wide.
- [x] **Lesson 1-2b Redesign & Bug Fixes**:
  - Rebuilt molecular diagrams into authentic 2D Lewis dot structures adhering to Diagram Generator standards (`DIAGRAM_WORKFLOW.md`).
  - Auto-loaded O2 molecule on startup in the Section 03 "Cancel or reinforce?" interactive.
- [x] **Lesson 1-2c (Chemical Nomenclature) Regularization**:
  - Regularized all internal `<style>` classes and inline declarations to semantic tokens.
  - Replaced hardcoded hex colors on Section 07 chemical tray badges with semantic tokens (`var(--accent)`, `var(--warn)`, `var(--cool)`).
- [x] **Lesson 1-3a (Lewis Structures) 2D Redesign & Modernization**:
  - Rebuilt Synopsis H₂O Lewis map with CPK colors (Oxygen `var(--accent)`, Hydrogen `var(--ink)`), cardinal lone pair dots (`r="2.6"`), and `var(--dia-atom-size, 22px)` typography.
  - Rebuilt Section 01 H₂O diagram with CPK vermilion Oxygen, cardinal dots, and proportional center-to-center bonds.
  - Rebuilt Section 02 5-step CO₂ sequence with monospace bold atom symbols, CPK colors, cardinal lone pairs, and standard bond lines.
  - Modernized Section 03 Interactive Lewis Structure Lab (`1-3a.js`) with CPK element coloring, `var(--dia-atom-size, 22px)`, warning-free `r="2.6"` circle radii, and enhanced drop-shadow hover feedback.
- [x] **Lesson 1-3b (Intermolecular Forces & Properties) Complete Modernization**:
  - **Section 03 Signature Simulation Engine Overhaul (`1-3b.js`)**: Combined Concept A (unified temperature spectrum from −100°C to +120°C with 6 jump presets and thermodynamic phase transitions for CO₂, Acetone, and H₂O) and Concept B (dynamic surface evaporation and live Clausius-Clapeyron manometer vapor pressure gauge). Preserved compact molecular ball-and-stick particles per explicit instruction. Connected to `window.GC_REGISTER_ANIMATION` for viewport-aware performance.
  - **Static Figures Lewis Dot Modernization**: Upgraded Synopsis, Section 01, and Section 02 diagrams to publication-grade 2D Lewis structures featuring CPK colors, cardinal lone pair dots, and standard dashed intermolecular bond lines.
  - **Three New Multi-Modal Interactive Widgets**:
    1. *Sort & Classify (`data-widget="sort-classify"`)*: 8-substance categorization matrix (CH₄, HCl, H₂O, N₂, NH₃, CO₂, CH₂O, HF) into LDF, Dipole-Dipole, and H-Bonding with decision-tree feedback.
    2. *Causal Chain Step-Builder (`data-widget="step-builder"`)*: 5-step guided reasoning walk-through (Connectivity &rarr; Polarity &rarr; IMF &rarr; Binding Energy &rarr; Bulk Properties) paired with a 5-state synchronized SVG diagram comparing ethanol and dimethyl ether.
    3. *Diagnose the Error (`data-widget="diagnose-error"`)*: Interactive misconception buster targeting the classic error that boiling water breaks intramolecular covalent bonds.
  - **Commit-Before-Reveal Gating**: Gated model answer reveals on `#selfx` and `#examAns` to require active student input before activation.
- [x] **Diagram Generator Tooling Alignment & Zero Em-Dash Eradication**:
  - Audited and eliminated all legacy em-dashes across `public/chem/diagram-generator/` (`app.js`, `elements.js`, `export-diagrams.html`, `index.html`), replacing them with semantic colons, commas, and hyphens.

- [x] **Unit 2 Lessons Complete Modernization & Defect Remediation (2026-09-18)**:
  - **1-2e Reaction Types & Balancing**: Electron transfer badge vertical alignment, reactant O2 pair separation, product H2O mass conservation.
  - **2-2a Physical vs. Chemical Change**: Synopsis reactant atom identity conservation, melting phase milestone liquid pooling on vessel bottom with defined fluid boundary.
  - **2-6a Structure-Property Arguments**: Dual side-by-side simulation comparing Saturated Fat vs. Unsaturated Fat with shared 0 to 100°C slider and quick preset buttons, full-width argument builder directly below.
  - **2-7a The Mole & Molar Mass**: Rescaled hero zoom, 540x180 mole scale bridge with digital bench balance, space-filling CPK spheres, authentic glucopyranose 6-membered ring.
  - **2-7b Mole Conversions**: Full container-width mole maps, canonical bent water geometry, 2-column factor card grid, Non-Assessable Extension scope demarcation for Section 04b.
  - **2-7c Stoichiometry**: Synopsis Reaction Yield Map, block equation typography with natural baseline subscripts, fixed 24%/19% BCA table layout, S'mores visual particle equation and dynamic results tray, 8-bay non-overlapping reaction chamber.
  - **Dashboard & Grill Refactor**: Resolved unclosed anchor tag on dashboard grid, replaced whole-word "tawa" with "grill" across entire codebase.

- [x] **Units 3, 4, and 5 Lessons Complete Modernization & Defect Remediation (2026-09-19)**:
  - **Unit 3 Thermochemistry & Energy Overhaul**: Rebuilt reaction profile geometry (`3-14a`), Sparkler Paradox particulate ensembles (`3-1a`), multi-stage heating curve equations and water hydrogen bonding (`3-1b`), discrete stacked LOL energy block diagrams ($4 + 1 = 5 \to 2 + 3 = 5$) with explicit center-circle heat vectors and de-densified calorimetry workbench (`3-1c`), and master 3-stage thermal collision mechanics (`3-4a`). Removed non-assessable Section 05 per NGSS boundaries.
  - **Unit 4 Kinetics & Equilibrium Overhaul**: Tagged Maxwell-Boltzmann curves as `[Enrichment / Beyond Assessed Scope]` and reframed self-explanation prompts around collision frequency (`4-1a`); centered catalysis on industrial surface mechanisms (`4-1b`); stabilized Le Chatelier reaction simulator numerical integrator, eliminating sawtooth graph artifacts (`4-6a`); purged SVG text errors and dynamically coupled arterial blood pH gauge to Le Chatelier shift ratios (`4-6b`).
  - **Unit 5 Astrophysics & Nuclear Physics Overhaul**: Authentic solar cross-section cutaway with hydrostatic equilibrium force vectors and cosmic thermostat simulation (`5-1a`); Three Visual Pillars synopsis figure, unclipped master redshift spectrum, and strictly positive-definite Planck blackbody radiation curve (`5-2a`); binding energy curve with coordinate ticks and landmark isotopes, rebuilt supergiant onion cross-section with logarithmic burning timescale bar, balanced 3x2 shell button grid, and 4-phase core collapse & supernova explosion engine (`5-3a`); container-width Master Figure 5-4a.1 EM spectrum, interactive simulator with Power Wattage / Intensity slider demonstrating sub-threshold photon frequency invariance, and aligned Section 06 with NGSS qualitative assessment (`5-4a`); particulate radiation shielding comparison, exact exponential decay curves, repaired stochastic nuclear lattice simulator, and unified Retina canvas scaling (`5-8a`).

### General Physics Textbook Launch & Chemistry Closeout (items 1 to 6 done; item 7 on hold)
1. [x] **Chemistry Resource Center & Site Materials Audit (Completed 2026-09-19)**:
   - Audited and hardened `public/chem/assets/reference-center.js`, `glossary.js`, `elements.js`, and `public/chem/about.html`. Zero em-dashes, semantic design tokens enforced by automated invariant tests.
2. [x] **Chemistry External Resource Links & Brand Audit (Completed 2026-09-19)**:
   - Full live verification and audit of 85 links across Units 1 through 5 in Chemistry (`lessons.json`, `index.html`). Replaced legacy/blocked links with 23 verified live CK-12 FlexBook 2.0 sections, restored 12 David Knuffke K-Chem videos and 6 Tyler DeWitt videos. Brand aligned to SciencePractice.app with zero em-dashes.
3. [x] **Thermal & Thermochemistry Studio Simulation (Completed 2026-09-19)**:
   - Built unified 3-tab thermochemistry laboratory in React Simulations Hub (`components/simulations/thermalStudio/`): Specific Heat & Thermal Equilibration ($q = mc\Delta T$), Multi-Stage Heating Curves ($\Sigma q$), and Solution Calorimetry & Dynamic LOL Balancer. Challenge decks, Socratic Beaker Buddy, and exportable lab reports.
4. [x] **General Physics Interactive Textbook Level 1 Suite & Runtime Architecture (Completed 2026-09-19)**:
   - Runtime architecture in `public/physics/assets/` (`tokens.css`, `components.css`, `core.js`, `glossary.js`, `reference-center.js`).
   - Lesson 1-1: Constant Velocity & 1D Motion (Mars Rover 1D Navigator, Vector Direction Builder, Unit Converter).
   - Lesson 1-2: Motion Graphs & Uniform Acceleration (Sonic Ranger, Triple-Graph Studio with 5 presets).
   - Lesson 1-3: Kinematics Equations & 2D Projectiles (The Big Three equations, Variable Selector, Drop vs. Fire strobe canvas, Operation Projectile Precision Boss Challenge Simulator).
   - Level 1 Solo Trial Review Packet (`1-review_packet.html`): Brendan's teacher request fulfilled with 4-pillar Main Ideas digest, 5 tiered practice problems with mark schemes, and printable `@media print` layout.
   - Usability Memo for Physics PLC: Authored `docs/textbook/PHYSICS_PLC_USABILITY_MEMO.md` for teacher review.
5. [x] **Global Language & Voice Edit (ASD-STE100 Principles) [COMPLETED 2026-10-05]**:
   - [x] **Universal Standards & Governing Policy**: Formatted in `docs/textbook/VOICE.md`, `CLAUDE.md`, and `services/ai/core.ts` prompt register.
   - [x] **4-Surface Pilot Exemplars (Completed & Verified)**:
     - Chemistry Adaptive PE Module: `public/chem/pe/data/hs-ps1-5.js` (Reaction Rates, Collision Theory & Catalysis).
     - Chemistry Textbook Lesson: `public/chem/lessons/3-14a_bond-energy-reaction-profiles.html` (Bond Energy & Reaction Profiles).
     - Physics Textbook Lesson: `public/physics/lessons/1-1_constant-velocity.html` (Constant Velocity & 1D Motion).
     - Simulation Challenge Deck: `components/simulations/freeBodyDiagram/fbdScenarios.ts` (Free Body Diagram Scenarios).
   - [x] **Full Project Rollout**: Systematic audit and edit completed across all 15 Chemistry PE modules (`public/chem/pe/data/*.js`), all 4 Physics lessons (`public/physics/lessons/*.html`), and all 27 Chemistry lessons (`public/chem/lessons/*.html`).
   - Enforced sentence length ceilings (&le; 20 words for instructions/hints, &le; 25 words for descriptions/explanations).
   - Eliminated noun strings, passive voice without agency, ambiguous connectors ("since"/"as" for causality), and filler intensifiers.
   - Verified pure Unicode in JS data files, semantic HTML in textbook lessons, zero backticks/LaTeX delimiters in student copy, and zero em-dashes repo-wide.
6. [x] **General Physics Level 2: Force Frontier [COMPLETED 2026-10-05]**:
   - [x] **Lesson 2-1: Newton's First Law &amp; Inertia (`2-1_newtons-first-law.html`)**: Reference frames, contact vs. field forces, translational equilibrium (&Sigma;<em>F</em> = 0), and authentic Free Body Diagram conventions. Features the 2D Equilibrium Force Vector Balancer (`2-1.js`), FBD Force Selector &amp; Misconception Buster, gated predictions, and terminal velocity ECR problem.
   - [x] **Lesson 2-2: Newton's Second Law (&Sigma;<em>F</em> = <em>m</em>&middot;<em>a</em>) (`2-2_newtons-second-law.html`)**: Unbalanced forces, proportional scaling (<em>a</em> &prop; &Sigma;<em>F</em>, <em>a</em> &prop; 1/<em>m</em>), component acceleration (&Sigma;<em>F</em><sub>x</sub> = <em>ma</em><sub>x</sub>, &Sigma;<em>F</em><sub>y</sub> = <em>ma</em><sub>y</sub>), apparent elevator weight (<em>F</em><sub>N</sub> = <em>m</em>(<em>g</em> + <em>a</em>)), and the Dynamic Acceleration Rig simulator (`2-2.js`) with real-time <em>v</em>-<em>t</em> graph plotting, mass propellant burn-off, gated predictions, and Mars rover emergency braking ECR.
   - [x] **Lesson 2-3: Newton's Third Law &amp; Action-Reaction (`2-3_newtons-third-law.html`)**: Mutual interaction pairs (<b>F</b><sub>A on B</sub> = &minus;<b>F</b><sub>B on A</sub>), four invariant criteria, resolution of the horse-and-cart paradox, vacuum rocket propulsion, and the Dual-Sensor Force Collider simulator (`2-3.js`) with real-time <em>F</em>-<em>t</em> mirror-image force curves, gated predictions, and space tug docking ECR.
   - [x] **Lesson 2-4: Friction Models &amp; Inclined Planes (`2-4_friction-and-inclines.html`)**: Static and kinetic friction models (<em>f</em><sub>s</sub> &le; &mu;<sub>s</sub> <em>F</em><sub>N</sub>, <em>f</em><sub>k</sub> = &mu;<sub>k</sub> <em>F</em><sub>N</sub>), surface contact asperities, tilted reference frames (<em>F</em><sub>g&parallel;</sub> = <em>mg</em> sin&theta;, <em>F</em><sub>g&perp;</sub> = <em>mg</em> cos&theta;), critical slip angle derivation (tan&theta;<sub>c</sub> = &mu;<sub>s</sub>), and the Inclined Plane Friction Sandbox simulator (`2-4.js`) with material presets, real-time acceleration curves, gated predictions, and mountain escape ramp ECR.
   - [x] **Lesson 2-5: Coupled Systems &amp; Atwood Machines (`2-5_coupled-systems-atwood.html`)**: Whole-system acceleration (&Sigma;<em>F</em><sub>ext</sub> / <em>m</em><sub>total</sub>), internal cord tension isolation, classical vertical Atwood derivation, cable safety engineering, and the Coupled Systems &amp; Atwood Machine simulator (`2-5.js`) with dual vertical/horizontal modes, variable surface friction, real-time velocity curves, gated predictions, and crane hoist ECR.
   - [x] **Level 2 Solo Trial Review Packet (`2-review_packet.html`)**: Dynamics digest, formula table, 4 core synthesis pillars, and 5 tiered remediation practice problems with printable worksheet export.
7. [ ] **General Physics Subsequent Levels (Level 3+ Energy, Momentum, Waves, Fields) [ON HOLD / AWAITING PLC FEEDBACK]**:
   - Levels 1 (Kinematics) and 2 (Force Frontier) are 100% complete and deployed with interactive simulations and review packets.
   - Rest of physics development paused pending review, feedback, and classroom evaluation from the Singapore American School Physics PLC.

---

## 1. Usability, Readability, Interactive Sims & Resource Overhaul [COMPLETED 2026-09-14]

- [x] **Frame Containment & Lightbox Parity**: Enforced `<div class="diagram figure">` or `<figure class="diagram">` containment with `.cap` / `.diagram-cap` across all lessons. Universal lightbox zoom on click via `core.js` selector matching `.diagram svg, .diagram img, .figure > svg, .figure > img`.
- [x] **Standardized Typography for Chemical Formulae**: Implemented `.chem-display` and `.formula-lg` in `components.css` with lining figures and high-contrast variable tokens (`--accent`, `--good`, `--ink`) for all major chemical, thermodynamic, and nuclear formulas.
- [x] **Emoji Clean-Up**: Removed all emoji icons (`🔴`, `🔵`, `🟢`, `🌡️`, `👁️`, etc.) from `.arrow` divs and headers across all lessons, standardizing on clean typographic arrows (`&rarr;`, `&darr;`, `&uarr;`, `&harr;`).
- [x] **Animation Lifecycle Management (`window.GC_REGISTER_ANIMATION`)**: Connected all canvas simulation animation loops to an `IntersectionObserver` in `core.js`, automatically pausing execution when off-screen to prevent background battery/CPU drain.
- [x] **Interactive Simulation Overhaul (Unit 5 Nuclear & Stellar Physics)**:
  - **Solar Proton-Proton Chain Fusion Sim (`5-1a.js`)**: Interactive 4-stage nucleosynthesis engine modeling the $p\text{-}p$ chain with nucleon tracking and mass defect ($E = \Delta m c^2$) accounting.
  - **Stellar Core Collapse & Supernova Simulator (`5-3a.js`)**: 4-phase evolutionary simulator detailing degenerate iron core exhaustion, electron capture infall ($70,000\text{ km/s}$), nuclear rebound shockwave, and remnant / $r$-process nucleosynthesis.
  - **Radioactive Decay Transmutation Workbench (`5-8a.js`)**: 100-atom stochastic lattice with alpha/beta particle ejection animations, exponential decay curve generation, and isotope selector (C-14, Cs-137, I-131, U-238, Ra-226).
  - **Nuclear Fission & Reactor Criticality Simulator (`5-8a.js`)**: Dual-mode engine modeling single thermal neutron induced fission ($^{235}\text{U} + n \to ^{141}\text{Ba} + ^{92}\text{Kr} + 3n + 200\text{ MeV}$) and multi-generation reactor core chain reaction criticality ($k < 1$ subcritical, $k = 1.0$ critical, $k > 1$ supercritical) with variable control rod insertion and SCRAM emergency shutdown.
- [x] **Canonical Rapid Retrieval Coverage (Section 05)**: Converted all remaining flashcard-only sections in Unit 4 and Unit 5 to canonical `.recall-section.recall` fill-in-the-blank practice cards, restoring 100% compatibility with the dashboard Spaced Repetition (SRS) and Cram engines across all 27 lessons.
- [x] **Commit-Before-Reveal Gating on Self-Explanations**: Gated all self-explanation prompt cards curriculum-wide to require meaningful student input ($\ge 15$ characters) before enabling the model answer reveal.
- [x] **K-Chem Video Resources Added (Units 1–5)**: Enriched resource panels across Units 1, 2, 3, 4, and 5 with authentic Dr. David Knuffke K-Chem YouTube video lessons and playlists, synchronized identically between `public/chem/index.html` and `public/chem/lessons.json`.

---

## 1. Active Design Revision Plan — ALL PHASES COMPLETED

All 6 phases of the design revision pass across all 12 lessons in the curriculum have been completed.

### 1.1 Phase 3 — Interaction Variety & Verb Scoping [COMPLETED]
- Introduced multi-modal interactions: **Sort & Classify**, **Predict & Run**, **Diagnose the Error**, and **Construct with Live Validation**.
- **Spine Tail Scoping (Resolved 2026-07-24)**: The mandated concluding tail (*recall → self-explain → exam practice*) is scoped as a single unified pedagogical practice sequence across all lessons.

### 1.2 Phase 4 — Synopsis & "Quick Check" [COMPLETED]
- One-Screen Synopsis cards and dynamic topbar "Quick Check" filtering propagated curriculum-wide.

### 1.3 Phase 5 — Density Floor & Coverage Sweep [COMPLETED]
- Retrofitted particle diagrams and mole conversion visual tools across all lessons.

### 1.4 Phase 6 — Lesson 1-2b Retrofit & Final Sweep [COMPLETED]
- Retrofitted `1-2b_molecular-polarity.html` with One-Screen Synopsis, Quick Check support, and Sort & Classify interactive widget.
- Completed final coherence sweep across light + dark modes, layout columns, and state restoration.

---

## 2. Curriculum Alignment Roadmap (2026-08-10 Baseline)

Based on the audit of the 2026–27 reference curriculum materials (`curriculum_alignment_analysis.md`), we are implementing a prioritized roadmap to align the site with the Singapore American School unit storylines ("Chemical Hygiene" & "Prata Problems").

### 2.1 Completed Alignment Milestones
- [x] **Dashboard Storyline Anchors (Shipped 2026-08-10)**: Embedded unit storyline titles and driving question subtitles into `index.html` section headers.
- [x] **Lesson 1-2c: Chemical Nomenclature (Shipped 2026-08-10)**: Built standalone lesson covering ionic vs. covalent decision trees, charge balancing, Roman numeral oxidation states, polyatomics, and covalent Greek prefixes (Target PS1-2.2).
- [x] **Reactivity Prediction & Causal Chains (Shipped 2026-08-10)**: Enhanced Lesson `1-1b` with an interactive 5-step causal chain builder ($\text{nuclear charge} \to \text{shielding} \to \text{atomic radius} \to \text{ionization energy} \to \text{reactivity}$) and a Block 1.4 case study comparing $\text{Mg}$ vs $\text{Cu}$ acid reactivity (Target PS1-1.5).
- [x] **Structure $\to$ Property $\to$ Hazard Argument (Shipped 2026-08-11)**: Enhanced Lesson `C-SPA` with Section 04b: GHS Hazard Argument Constructor (Acetone, NaOH, CO) with 4-layer dropdown validation and PS2-6.2 Limitations card (Target PS2-6.1 / PS2-6.2 / Block 1.12).
- [x] **Limiting Reactant & BCA Reasoning (Shipped 2026-08-11)**: Added Section 03b to Lesson `2-7c` with S'mores Limiting Reactant Simulator — live-updating ratio bars, leftover calculation, and BCA ratio bridge proving lowest-quantity ≠ limiting reactant (Target PS1-7.5 / Block 2.8).
- [x] **Empirical Formula Determination (Shipped 2026-08-11)**: Added Section 04b to Lesson `2-7b` with 4-step algorithm callout and interactive Empirical & Molecular Formula Stepper table for Glucose, Caffeine, and Vitamin C (Target PS1-7.8 / Block 2.9).

### 2.2 Active Backlog & Next Up
- *All initial Curriculum Alignment Roadmap items shipped!* (28 skill codes across 33 teaching blocks fully aligned).
- [x] **Roadmap QA/bugfix pass (Completed 2026-08-12, not yet pushed)**: Fixed undefined `--warn`/`--bad`/`--sans`/`--shadow-sm` CSS tokens (silently dropped declarations) and unstyled `class="card"` across all five roadmap files plus `1-2c`; fixed literal LaTeX/`&text;` rendering as visible text in `2-7b`/`1-1b`; fixed the empirical-formula calculator's Vitamin C bug (naive rounding gave C₁H₁O₁ instead of C₃H₄O₃ — now derives every formula from mass/molar-mass math with no hardcoded strings); fixed the GHS builder's answer-order exploit (correct option was always listed first) and shortened its option text for narrow viewports; fixed green (`--good`) being used as a category color instead of correct/positive only; gated the empirical-formula, causal-chain, and S'mores widgets behind a predict-then-reveal commit (previously showed the answer with no interaction); dropped emoji from the S'mores widget; added `empirical-formula`/`molecular-formula`/`polyatomic-ion`/`oxidation-state` to `glossary.js` with matching `class="term"` wraps. See git history for the affected files (`1-1b`, `2-7b`, `2-7c`, `C-SPA`, `1-2c`).

---

## 2. Feature Backlog & Study Utilities [COMPLETED]

All planned study utilities have been fully implemented and integrated:
- **Deep Content Search**: Full text & glossary search across all 12 lessons (shipped 2026-07-10).
- **Cram View / Mode**: Constructed-response frame aggregator on home dashboard (shipped 2026-07-10).
- **Spaced Retrieval & Mixed Practice**: Leitner scheduling & cumulative practice drills (shipped 2026-07-10).
- **Pedagogical Payoff Beats**: Macroscopic "Why This Matters" connections in all 12 lessons (shipped 2026-07-10).

---

## 3. SciencePracticeApp Cross-Integration Roadmap (2026-08 Migration)
Following the consolidation into the `SciencePracticeApp` monorepo under `public/chem/`:

- [x] **In-Lesson Simulation Deep Links**: Contextual 1-click launch cards in chapters:
  - Lessons `1-1a`/`1-1b` $\to$ **Build an Atom** and **Periodic Table**.
  - Lessons `1-2a`/`1-2b`/`1-2c`/`1-3a` $\to$ **Covalent Bonding Builder** and **Ionic Bonding Builder**.
  - Lessons `1-3b`/`C-SPA`/`2-2a` $\to$ **Particle Phase Change**.
  - Lesson `C-RXN` $\to$ **Reaction Kinetics**.
  - Lesson `2-7a` $\to$ **Build an Atom (Molar Mass)**.
- [x] **"Practice This Chapter" 1-Click Bridge**: Embed a direct practice launcher (*"Practice & Explore Beyond This Lesson"*) in all 13 chapter footers linking directly to SciencePracticeApp pre-loaded with the relevant course (`General Chemistry`), topic, and mode (`quiz` and `flashcards`).
- [x] **Student Dashboard Progress Widget**: Surface textbook chapter reading status and checkpoint percentages directly on the student's main Science Practice home cockpit (`LandingPage.tsx` + `utils/textbookProgress.ts`).
- [x] **Socratic Companion Mascot in Textbook**: Bring the animated buddy mascot into textbook margins (`core.js` + `components.css`) offering contextual coaching, study tips, and strictly gated live Socratic chat with school Google OAuth session token.
- [x] **Teacher Mode Worksheet & Jeopardy Generator**: 1-click generation presets in Document Creator and Teacher Workspace (`DocumentCreatorView.tsx` + `TeachersView.tsx`) for Chemistry Units 3–5 (Calorimetry calculation sets, Kinetics/Equilibrium CER data analysis, Nuclear decay worksheets).

---

## 4. Open Decisions & Chemistry Invariants

1. **The Verb Budget constraint (Revision Phase 3)**:
   - *Status: Resolved (2026-07-09).* Apply flexibly; spine tail (*recall → self-explain → exam practice*) treated as a single unified sequence.
2. **H–F polar-covalent boundary framing (Lesson 1-2a)**:
   - *Status: Resolved (2026-07-09).* Keep current values (H = 2.20, F = 3.98, ΔEN = 1.78); nonmetal-nonmetal electron sharing framing.
3. **Sodium GHS pictograms (Unit 1)**:
   - *Status: Resolved (2026-07-09).* Use Flame and Corrosion.
4. **Diagram generator palette exceptions**:
   - *Status: Resolved (2026-07-09).* CPK fills kept as documented exception to Golden Rule 5.

---

## 4. Housekeeping & Validation [COMPLETED]

* **Glossary Count Audit [COMPLETED 2026-07-24]**: `CLAUDE.md` §4 verified: exactly 80 term keys (72 canonical definitions + 8 aliases).
* **Sort & Classify Restore Score Persistence [COMPLETED 2026-07-24]**: Verified and updated `core.js` (`initSortClassify`) to record and restore live scores accurately without faking 100%.
* **SVG `var()` Attribute Console Noise [COMPLETED 2026-07-24]**: Converted all 398 bare SVG `r` and `stroke-width` presentation attributes using `var(...)` tokens across 11 lesson HTML files into standard inline `style="..."` properties, eliminating Chrome console warnings repo-wide.
* **Parser Gates [COMPLETED 2026-07-24]**: Structural HTML parser and JSON-config validator executed cleanly across all 12 lessons.

---

## 5. Completed Work

Log details in `CHANGELOG.md` upon pushing to remote.
* **2026-07-24**: Completed repository-wide SVG geometry attribute cleanup (converted 398 bare `r`/`stroke-width` `var()` attributes to inline styles across 11 HTML lessons), verified and fixed `sort-classify` score persistence in `core.js`, audited `CLAUDE.md` glossary count (80 keys), validated HTML structures & JSON configs across all 12 lessons, and finalized Phase 6 Lesson 1-2b retrofit.
* **2026-07-10**: Retrofitted Lesson 2-7b (Mole Conversions) with a dynamic visual Conversion Builder canvas showing bulk/particulate state transitions and real-time unit cancellation feedback.
* **2026-07-10**: Shipped Spaced Repetition Leitner system progress scheduler, dashboard review card, cumulative mixed review practice drills, payoff "Why This Matters" beats in all 12 lessons, complex biological monomer lookups, polymer brackets, vessel background framing, wavy blue solvent overlays, and hydration shell dissociation.
* **2026-07-09**: Shipped Phase 4 design pass: implemented dynamically injected global "Quick Check" toggle button in topbar; authored 3-column collapsible One-Screen Synopsis card across all 12 lessons.
* **2026-07-09**: Shipped Phase 3 Redesign verbs: implemented `predict-run`, `diagnose-error`, and `construct-validate`.
* **2026-07-09**: `DIAGRAM_GENERATOR_PLAN.md` closed out — all 5 phases done and verified.
* **2026-07-08**: Standardized all lessons to shared `--dia-*` geometry tokens, conformed particle/atom colors repowide.
* **2026-07-08**: Shipped data-driven Molecule Renderer (`molecule-renderer.js`) and Particle-Scene Renderer (`particle-renderer.js`).
* **2026-07-08**: Shipped persistence layer and visual Concept Map tab on the home dashboard.
* **2026-07-07**: Deployed step/zoom/scrub motion primitives repowide.
* **2026-07-07**: Shipped Reference Drawer (Periodic Table Z=1..36, Formulas Sheet, Math Calculator, and Mole-Mass Converter).
* **2026-07-06**: Shipped `.figure` width system.
* **2026-07-06**: Shipped PDF and print export for all 12 lessons.
