# Feature Tracker History

Archived 2026-10-27 when `FEATURE_TRACKER.md` was restructured into a tracker of what
is live. The sections below are copied unedited from the old tracker: remediation
passes, bug fixes, prototypes, and one lessons-learned story. They describe the repo
as it was when each was written, so paths and counts in them may no longer hold.

The complete pre-restructure tracker is in git: `git show cf3a1d7:FEATURE_TRACKER.md`.

---

### Mixed Review Drill & Cram Mode Bugfix
**Path:** `public/chem/index.html`
**Features:**
- Replaced fragile single-selector DOM extraction with polymorphic parsers (`extractExamQuestionData` and `extractRecallQuestionData`).
- Fully supports all lesson formats: `.w-config` JSON data, `.exam-frame`, `.exam-card`, `.exam-q`, and `.stem`.
- Added defensive fallbacks for missing recall inputs, preventing `TypeError` on "Reveal Answer".
- Enabled Cram Mode to aggregate constructed-response prompts across all 27 lessons (including Units 4 and 5).
**Status:** Completed (Sept 2026)

### Diagram Quality Linter & Unit 1 / Unit 2 Curriculum Modernization
**Path:** `scripts/verify_diagrams.mjs`, `package.json`, `public/chem/lessons/`
**Deployments:**
- Integrated directly into `npm run verify` and standalone via `npm run verify:diagrams`.
- Automated regression guard across modernized lessons: `1-2c`, `1-2d`, `1-2e` (formerly C-RXN), `1-3a`, `1-3b`, `2-6a` (formerly C-SPA), and `2-7a`.
**Features:**
- **Automated Diagram Rule Enforcement:**
  - Strict zero em-dashes (`—` or `&mdash;`).
  - Prohibition of raw hex fills and strokes (requiring design tokens: `var(--paper)`, `var(--card)`, `var(--ink)`, `var(--accent)`, `var(--cool)`).
  - Enforcement of semantic token font sizes (`style="font-size:var(--dia-*)"`) preventing ad-hoc numeric pixel sprawl.
  - Green-on-green badge contrast prevention (`var(--good)` text on `var(--good-soft)`).
  - Prevention of long multi-word narrative prose in SVG `<text>` elements (> 50 chars), enforcing clean delegation to HTML `.diagram-cap` containers.
- **Curriculum Architecture & Legacy Slug Renaming:**
  - Standardized legacy slugs: renamed `C-RXN_reaction-types-balancing` &rarr; `1-2e_reaction-types-balancing` (and `1-2e.js`), and `C-SPA_structure-property-argument` &rarr; `2-6a_structure-property-argument` (and `2-6a.js`).
  - Formally moved lesson `2-6a` from Unit 1 to Unit 2 in `lessons.json`, `index.html`, and `textbookProgress.ts`.
  - Overhauled Section 02 scale explorer in `2-6a` from miniature overflowing scale explorer into container-width 3-step stage (`data-motion="step"`) with HTML captions.
  - Fixed premature green telegraphing site-wide by removing `[data-predict] .opt[data-correct="true"]` from active screen CSS (strictly gating correct option styling behind student interaction).
  - Fixed Sort & Classify card typography across the textbook with bold header separation and full-sentence description support.
  - Performed textbook-wide cleanup across all 27 lessons, eliminating all 121 stray space-comma artifacts (` ,`) and ensuring strict compliance with zero em-dashes (`—` / `&mdash;`).
  - Upgraded Bent water geometry, 5-part argument cards, liquid physics repulsion, and molar mass bridge diagrams across lessons.
**Status:** Completed (Sept 2026)

### Unit 2 Chemistry Lesson Visual & Interactive Quality Remediation
**Path:** `public/chem/lessons/1-2e*`, `2-2a*`, `2-6a*`, `2-7a*`, `2-7b*`, `2-7c*`, `public/chem/index.html`
**Features:**
- **Global Terminology Alignment:** Replaced whole-word "tawa" with "grill" globally across all code and docs. Verified 0 occurrences. Fixed unclosed anchor tag on the main landing dashboard.
- **1-2e Reaction Types:** Centered electron labels in electron transfer SVG paths; added 8px gap between O2 pairs and added second H2O molecule on combustion product side.
- **2-2a Physical & Chemical Change:** Aligned synopsis chemical change reactant circle colors to black + gray. Refactored liquid phase interpolation in `2-2a.js` so particles melt into a beaker floor pool at 50% without mid-air floating particles.
- **2-6a Structure-Property Argumentation:** Rebuilt Fat Explorer (`#s-explorer`) into a side-by-side simulation comparing Saturated (Stearic acid, MP 69°C) vs. Unsaturated (Oleic acid, MP 13°C) fats with a shared 0–100°C slider and quick preset buttons. Relocated the 5-step Argument Builder full-width directly below the dual simulation.
- **2-7a The Mole & Molar Mass:** Rescaled `#hero-zoom` to 400x300 viewBox matching `components.css` aspect ratio. Rebuilt Section 01 Mole Scale Bridge SVG to 540x180 with digital balance readout. Expanded synopsis Mole Bridge SVG. Converted Molar Mass Builder to draw space-filling CPK-style spheres without stick bonds, and updated the glucose preset to an authentic 6-membered glucopyranose ring (5 C + 1 O ring, exocyclic -CH2OH, 4 -OH groups).
- **2-7b Mole Conversions:** Standardized `.map-svg` and `.part-svg` to 100% container width, eliminating tiny diagrams. Converted water particles to canonical bent space-filling geometry (red oxygen, white hydrogens, no stick lines). Rebalanced conversion factor cards into a 2-column grid. Scaled `#builderCanvas` responsively. Formally designated Section 04b (Empirical Formulas) as a Non-Assessable Curricular Extension with callout notices, tag badges, and TOC labels.
- **2-7c Stoichiometry:** Rebuilt synopsis "Reaction Yield Map" with structured Before & After particle chamber boxes (2A + 4B -> 2AB + 2B excess) and theoretical yield callout. Fixed `.equation-display` CSS to block layout with prominent font size and proper subscript baseline alignment. Enforced fixed table layout on `.bca-table` with uniform columns and replaced `:` placeholders with `--`. Implemented visual particle equation for S'mores stoichiometry (2 Gc + 1 M + 1 Ch -> 1 Gc2MCh) with illustrated graphics and a dynamic visual results tray. Rebuilt the BCA reaction chamber coordinate system into 8 non-overlapping bays, mathematically guaranteeing zero particle collisions across all reactant amounts.
- **Zero Em-Dashes & Design Token Invariant:** Enforced strict zero em-dashes across all modified files and verified full compliance with `scripts/verify_diagrams.mjs` and `npm run verify`.
**Status:** Completed (Sept 2026)

### Chemistry Textbook Units 2, 3, 4, & 5 Comprehensive Usability, Typographic, and Pedagogical Remediation
**Path:** `public/chem/assets/components.css`, `.agent/rules/development-workflow.md`, `public/chem/lessons/2-6a*`, `3-14a*`, `3-1a*`, `3-1b*`, `3-1c*`, `3-4a*`, `4-1a*`, `4-1b*`, `4-6a*`, `4-6b*`, `5-1a*`, `5-2a*`, `5-3a*`, `5-4a*`, `5-8a*`
**Features:**
- **Architectural Safeguards & Invariants:**
  - Redefined `.chem-display` to `display: block; text-align: center;` with continuous inline character rendering, resolving flexbox gap equation tearing across all 27 textbook lessons.
  - SVG `<text>` parser protection: eliminated raw HTML markup inside SVG `<text>` elements (`<sup>`, `<sub>`, `<strong>`) which broke browser SVG parsing and ejected elements onto the page; transitioned to `<tspan>` and Unicode superscripts/subscripts.
  - Uppercase Button Entity Immunity: replaced named HTML entities (`&sup4;`, `&Delta;`) with native Unicode glyphs (`⁴He`, `ΔH`) inside uppercase-styled buttons.
  - Canvas 2D CSS Variable Resolution: resolved `getComputedStyle(document.documentElement).getPropertyValue(...)` for Canvas 2D contexts, eliminating stuck black/green atom rendering.
  - Universal Retina Canvas Scaling: backing buffers dynamically scaled to `window.devicePixelRatio`.
  - Simulation Inquiry Scaffolding: added 3–4 step "Try This" challenge decks and transparent parameters to all interactive sandboxes.
- **Unit 3 Thermochemistry & Energy Overhaul:**
  - `3-14a`: Realigned $E_\text{a}$ and $\Delta H$ coordinates, fixed `(+ΔH)` color splitting, repaired bond energy calculator, and updated Haber-Bosch reaction coordinate diagram with coordinate axes and complete stoichiometry.
  - `3-1a`: Rebuilt "Sparkler Paradox" and thermal boundary diagrams with authentic particulate ensembles and high legibility.
  - `3-1b`: Rebuilt heating curve diagrams with proper subscripts ($c_\text{ice}$, $\Delta H_\text{fus}$, $\Delta H_\text{vap}$), triatomic $\text{H}_2\text{O}$ particles exhibiting hydrogen bonding, thousand separators in computational outputs, and split exam textareas.
  - `3-1c`: Transformed continuous LOL diagrams into discrete, stacked unit blocks ($4 + 1 = 5 \rightarrow 2 + 3 = 5$) with explicit center-circle internal heat transfer ($\Delta E = -2 \xrightarrow{q} +2$, net $\Delta E = 0$), de-densified workbench layout with clean metric cards, collapsible step-by-step algebra drawer, and inquiry presets.
  - `3-4a`: Master 3-stage collision sequence (Approach $\rightarrow$ Impact with $F_1 = -F_2$ $\rightarrow$ Rebound with KE transfer bars); retitled histogram to "Particle Speed & Energy Distribution"; exposed transparent masses ($80\,\text{g}$ and $120\,\text{g}$) for mathematical clarity; completely removed Section 05 (Statistical Mechanics / $S = k_\text{B} \ln \Omega$) per curricular boundaries; cleansed microstates from Rapid Retrieval.
- **Unit 4 Reaction Rates & Equilibrium Overhaul:**
  - `4-1a`: Widened hero SVG, tagged Maxwell-Boltzmann curves as `[Enrichment / Beyond Assessed Scope]`, upgraded particle coalescence into bonded diatomic $AB$ molecules, reframed core self-explanation prompt around collision frequency and activation energy.
  - `4-1b`: Corrected $E_\text{a}$ and $\Delta H$ geometry; centered lesson on chemical surface catalysis (catalytic converters, Haber-Bosch iron surface) with enzymes framed as specialized biological catalysts.
  - `4-6a`: Added concentration plateau curves and axis arrows to synopsis; eliminated cubic Euler numerical instability in Le Chatelier simulation (preventing sawtooth graph spikes); fixed button entity casing; added guided inquiry missions.
  - `4-6b`: Purged illegal HTML tags from SVG `<text>` elements in blood buffer diagram; connected arterial pH dial gauge dynamically to Le Chatelier particle shift ratios.
- **Unit 2 Reasoning & Unit 5 Astrophysics Overhaul:**
  - `2-6a`: Implemented dual-path branching structure ("Choose Your Own Adventure": Lipid Packing & Saturation vs. Alkane Chain Length & Volatility), sharing the unified 5-step scientific reasoning framework.
  - `5-1a`: Authentic solar cross-section cutaway (Core, Radiative Zone, Convective Zone, Photosphere) with hydrostatic equilibrium force vectors; standard isotope typography ($^1_1\text{H}$, $^2_1\text{H}$, $^3_2\text{He}$, $^4_2\text{He}$); dynamic cosmic thermostat simulation with radial cross-section and split exam textareas.
  - `5-2a`: Three Visual Pillars synopsis figure (Redshift, 3:1 Primordial Abundance, CMB $2.725\,\text{K}$ curve); unclipped master redshift spectrum; strictly positive-definite Planck blackbody radiation curve; guided inquiry missions.
  - `5-3a`: Binding energy curve with coordinate ticks and landmark isotopes; rebuilt supergiant onion cross-section with logarithmic burning timescale bar and physical scale callout; balanced $3 \times 2$ shell button grid; 4-phase core collapse & supernova explosion engine.
  - `5-4a`: High-craft mini-spectrum synopsis; container-width Master Figure 5-4a.1 covering all 7 EM bands, dual coordinate axes, visible rainbow inset, 10 eV ionization divide, and 7 matter interaction cards; interactive simulator with Power Wattage / Intensity slider ($0.001\,\text{W} - 10,000\,\text{W}$) demonstrating sub-threshold photon frequency invariance; dropped quantitative $E = hc/\lambda$ calculation exam questions per NGSS HS-PS4-4 assessment boundaries, focusing on qualitative sunscreen and 5G claim evaluations.
  - `5-8a`: Particulate emission and shielding barrier comparison (alpha stopped by paper, beta by aluminum, gamma by lead); mathematically exact exponential half-life decay curve; fixed canvas CSS token resolution bug for lattice decay; unified Retina canvas scaling; guided inquiry missions and split exam textareas.
- **Strict Invariant Verification:** Verified zero em-dashes (`—` or `&mdash;`) site-wide and 100% diagram/token compliance.
### General Physics Interactive Textbook (*Mission: Physica*) Level 1 Suite & Runtime Architecture
**Path:** `public/physics/assets/`, `public/physics/lessons/`, `public/physics/index.html`, `public/physics/lessons.json`
**Deployments:**
- Accessible at `/physics/` and deep-linked from landing page, with standalone runtime serving Lessons 1-1, 1-2, 1-3, and the Level 1 Review Packet.
**Features:**
- **Shared Runtime & Reference Center:**
  - `tokens.css`: Cobalt / Electric Blue theme with strict semantic typography scale (`--text-3xs` through `--text-4xl`).
  - `components.css`: Container layout, figure tiers, continuous equation typography (`.chem-display`), gated interaction styles, and `@media print` rules.
  - `core.js`: Dynamic TOC generation, smooth-scrolling, reveal observer, disabled commit-before-reveal gates, rapid-recall checking, and `window.GC_REGISTER_ANIMATION` canvas lifecycle management.
  - `glossary.js`: Authoritative terminology dictionary bound to hover/tap tooltips.
  - `reference-center.js`: Global slide-out drawer with Formula Sheet, Physical Constants, 6-pattern Graphing & Linearization Matrix, and integrated Scientific Calculator.
- **Level 1 Interactive Lessons:**
  - `1-1_constant-velocity.html` & `1-1.js`: Mars Rover 1D Navigator signature simulation, Vector Direction Builder, Unit Converter (m/s to km/h), gated predictions, and BKE highway ECR problem.
  - `1-2_motion-graphs.html` & `1-2.js`: Sonic Ranger telemetry hook, position-time slope/curvature analysis, velocity-time slope & area under curve, Triple-Graph Studio interactive with synchronized real-time x-t, v-t, and a-t graphs and 5 mission presets, and runaway probe ECR problem.
  - `1-3_kinematics-equations.html` & `1-3.js`: Dropped vs. fired bullet puzzle, The Big Three equations, Kinematics Variable Selector & Equation Solver mini-tool, Galileo perpendicular independence with authentic stroboscopic photography and simultaneous drop vs. fire strobe experiment canvas, and Operation Projectile Precision Boss Challenge Simulator (height, velocity, planetary gravity controls, prediction commitment gate, component velocity vectors, target detection, and mastery badge).
- **Solo Trial Review Packet:**
  - `1-review_packet.html`: Directly addresses teacher note from course materials with 4-pillar Main Ideas synthesis, 5 tiered practice problems with toggleable worked solutions, and full printable worksheet export.
- **Subdomain Routing & Access:**
  - `physics.sciencepractice.app` configured via `public/physics/CNAME`, `vercel.json` 301 host redirect, and landing page buttons in `Gatekeeper.tsx` and `PublicLandingPage.tsx`.
- **Authentic Scientific Photography:**
  - Macro and stroboscopic laboratory photography integrated with full CC-BY attribution in Chemistry (`penny_surface_tension.jpg` by Margaret Kocherga, CC-BY-SA 4.0) and Physics (`projectile_independence_strobe.jpg` by Michael Maggs, CC-BY-SA 3.0).
- **Formula Typography Standardization:**
  - Complete elimination of raw LaTeX commands, underscore variables, and ad-hoc font spans across `1-3_kinematics-equations.html`, `1-3.js`, `reference-center.js`, `glossary.js`, and `1-1.js`. Standardized on semantic HTML entities and `.math-display` continuous text flow.
- **Invariants & Testing:**
  - Strict zero em-dashes across all files.
  - High-DPI Retina canvas scaling.
  - Automated invariant assertions in `services/__tests__/designTokens.test.ts`.
### Accelerated Chemistry (XL Chem) Quantitative Practice Suite (Unit 1 Prototype)
**Path:** `public/chem/xl/practice/unit1.html`, `public/chem/xl/practice/unit1.js`, `public/chem/xl/practice/xl-practice.css`, `public/chem/xl/practice/smart-parser.js`, `public/chem/xl/practice/qrcode.js`, `public/chem/xl/practice/verify.html`
**Deployments:**
- Accessible at `/chem/xl/practice/unit1.html` and verified via `/chem/xl/practice/verify.html`.
**Features:**
- **Zero-AI & Zero-OAuth Architecture:** 100% deterministic, open client-side access without login requirements, completely air-gapped from backend AI tools.
- **Seeded PRNG Individualization:** 32-bit PRNG (`mulberry32` keyed by student name hash) generates unique, stable numerical parameters, isotope systems, and light wavelengths per student.
- **16-Problem Taxonomy (8 Skills × 2 Modalities):**
  - Skill 1 (Matter): Macroscopic separation MCQ + 2D particulate chamber classification/counting (inline SVG).
  - Skill 2 (History): Rutherford alpha scattering MCQ + Model postulate to scientist matching.
  - Skill 3 (Subatomic): Full subatomic table grid ($p^+$, $n^0$, $e^-$, $Z$, $A$, charge) + Reverse species identification.
  - Skill 4 (Atomic Mass): Multi-isotope NIST weighted average calculation + Mass spectrometry peak reasoning (inline SVG).
  - Skill 5 (Radiation): Light wave equation ($c = \lambda \nu$) + Photon energy ($E = h\nu$) calculation with visible spectral color selector.
  - Skill 6 (Electrons): Ground-state electron configuration with subshell shortcuts + Valence, principal shell $n$, and unpaired spins.
  - Skill 7 (Trends): Dual Drag-and-Drop + Arrow periodic trends ranking widget + Coulombic law justification MCQ.
  - Skill 8 (Reactivity): Chemical families & typical charges MCQ + Comparative chemical reactivity trends MCQ.
- **Smart Chemistry Keystroke Parser:** Real-time tokenizer supporting scientific notation (`5.79 x 10^14 Hz`, `3.86e-19 J`, `amu`), live KaTeX math preview, prefix/sig-fig warnings, and split-box toggle.
- **Interactive Ranking Widget:** Dual-mode element ordering featuring HTML5 drag-and-drop with drag-over target cues and synchronized up/down arrow buttons.
- **Attempt Breakdown Tracking:** Tracks 1st try, 2nd try, 3rd try, and missed counts in real-time UI banner and embeds them on the certified receipt.
- **Strict Single-Page A4 Matrix Receipt:** Compact 16-row summary matrix table (`.print-matrix-table`) guaranteed to fit within 1 page on standard A4 print/PDF export.
- **Cryptographic Digital Seal & Scannable QR:** Client-side SHA-256 digital authenticity hash with a vector QR code linking to `verify.html`, allowing instant instructor mobile scan verification and student deck inspection.
- **Interactive Periodic Table Reference Drawer:** 18-column interactive grid ($Z = 1$ to $36$) featuring element inspection cards with live concentric Bohr model SVG diagrams ($Z^+$ nucleus, quantized rings, electron dots), multi-property heatmaps (Atomic Radius, 1st Ionization Energy, Electronegativity), and a 3d transition metals filter toggle.
- **Vertically Draggable Scientific Mini-Calculator:** Floating tool supporting scientific notation (`EE`), exponents (`xʸ`), square roots, and parentheses with smooth pointer events vertical dragging clamped along the right sidebar.
- **Robust MCQ Distractor Design & Anti-Heuristic Standards:**
  - Dynamic option order shuffling (`rng.shuffle()`) keyed per student seed prevents fixed letter positions.
  - Distractor length and grammatical symmetry: all distractors carry equal syntactic weight and authentic scientific vocabulary.
  - Anti-"longest answer" invariant: distractors are frequently equal to or longer than the correct answer, preventing students from guessing the most detailed option.
- **High-Density Slate & Clean Paper Themes:** Instant one-click toggle syncing `theme-light` and `theme-dark` classes across both `:root` and `body` with semantic token switching.
- **Invariants & Testing:** Strict zero em-dashes across all code and text, 100% unified health check pass (`npm run verify`).
**Status:** Completed (Sept 2026)


---

## Critical Lessons Learned

### Gemini API Model Selection (Jan 2026)
**Issue:** Study Sprint mode was failing with 500 errors when generating task recommendations.

**Root Cause:**
- Used `"gemini-2.0-flash-exp"` (experimental model) instead of `DEFAULT_MODEL` (`"gemini-2.0-flash"`)
- Experimental models don't properly support `responseSchema` with streaming in Vercel edge runtime

**Solution:**
- **ALWAYS use `DEFAULT_MODEL`** for new AI functions in `services/ai/`
- **NEVER use experimental models** without documented reason
- **ALWAYS include BOTH** `responseMimeType: "application/json"` AND `responseSchema: {...}` for JSON mode
- **DO NOT use** `nullable: true` in schemas (not supported in edge runtime)

**Related Files:**
- `services/ai/*.ts` - All AI function implementations (`geminiService.ts` is only a barrel re-export)
- `CLAUDE.md` - Updated with model selection rules
- `Developer_guide.md` - Updated with critical rules

**Prevention:** This rule is now documented in CLAUDE.md and Developer_guide.md to prevent future regressions.

---

## Dated bullets removed from entries that are still live

### From `Adaptive PE Practice Suite`
- Voice and scope pass (2026-10-27): HS-PS1-2, PS1-3, PS1-4, PS1-6, PS1-7, PS2-6 and PS4-4 match the Tier 3 voice and their lessons' scope. HS-PS1-1, PS1-5, PS1-8, PS3-1, PS3-4 and ESS1-1 to 1-3 have not had this pass.
- All Semester 1 PEs launched: `HS-PS1-1` (6 skills), `HS-PS1-2` (6 skills), `HS-PS1-3` (8 skills), `HS-PS1-7` (6 skills), and `HS-PS2-6` (5 skills).
- Strict Zero Em-Dashes Invariant observed site-wide.

### From `MultiModeView & multiModeReducer`
- State consolidation refactoring from 11 separate `useState` hooks to a centralized pure `multiModeReducer` managing loading states, uploaded note contexts, share link toasts, explanation and calculation chat message histories, and partner panel toggles.
- Covered by companion test suite `tests/unit/multiModeReducer.test.ts` (16 unit tests).

### From `JeopardyGame`
- **Modularized & Code-Split (Sep 2026):** Extracted 19 modular subcomponents and utilities (`components/jeopardy/*` and `components/jeopardy/modals/*`), reducing `JeopardyGame.tsx` from 1,947 to 622 lines and code-splitting it via `React.lazy`.

### From `TeachersView`
- **Primary Entry Point:** Now serves as the exclusive launch hub for all teacher-facing tools (Document Creator, Interview Script, Rubric Translator, Review Games, Reflection Prompter), which have been removed from the main landing page.

### From the old `Planned / Future Features` section: `AI Personae System`
### AI Personae System
**Description:** Configurable AI teaching personalities for interactive modes, fully expanded into standalone practice modes.
**Personas:**
- **📚 Tutor:** Explains clearly, gives direct answers and step-by-step guidance — **standalone mode live** (`components/personae/TutorView.tsx`, `?page=tutor`, v.28Sep.01)
- **🤔 Socratic:** Asks probing questions to help students discover answers themselves — **standalone mode live** (`components/personae/SocraticView.tsx`, `?page=socratic`, v.28Sep.01)
- **🔬 Skeptic:** Challenges reasoning like a tough peer reviewer — **standalone mode live** (`components/skeptic/SkepticView.tsx`, `?page=skeptic`, v.27Sep.01)
- **🌟 Growth Coach:** Builds confidence, celebrates progress, and analyzes errors — **standalone mode live** (`components/personae/GrowthCoachView.tsx`, `?page=growth_coach`, v.28Sep.01)
**Deployments:**
- **Explanation Partner** (`components/SettingsPanel.tsx`): 4-button selector
- **Research Project Mode** (`components/ResearchModeView.tsx`): Dropdown with hover tooltips
- **Backend** (`services/ai/core.ts` & `services/ai/personae.ts`): Persona-specific system prompts and Gemini streaming
- **Standalone Modes:** All 4 personae live with standalone routes (`?page=skeptic`, `?page=tutor`, `?page=socratic`, `?page=growth_coach`) with full Standard Kit parity.

### From `Course Texts` (pre-shared-runtime architecture notes)
- **Reference Center drawer** (`public/chem/assets/reference-center.js`): periodic table + thermochemical tables + formulas/tables + calculator. Extracted from `core.js` so one implementation serves both the dashboard (`public/chem/index.html`) and all 27 lesson pages. Any new lesson must load it alongside `core.js`.
- **Progress engine** (`gc-textbook-progress` in localStorage): `isComplete()` / `countCompleted()` live in **two** places: `core.js`'s `StorageEngine` and the separate inlined copy in `index.html`. Change both together.
- **Pedagogical Simulation Engines (Unit 5)**:
  - *Solar Proton-Proton Chain Fusion Sim* (`5-1a.js` + `5-1a_stellar-fusion-solar-energy.html`): 4-stage nucleosynthesis kinematics and $\Delta m c^2$ energy accounting.
  - *Stellar Core Collapse & Supernova Simulator* (`5-3a.js` + `5-3a_stellar-nucleosynthesis-element-origins.html`): Electron-degenerate iron core collapse, $70,000\text{ km/s}$ infall, shockwave bounce, and $r$-process synthesis.
  - *Radioactive Decay Transmutation Workbench* (`5-8a.js` + `5-8a_nuclear-reactions-radioactive-decay.html`): 100-atom lattice with alpha/beta emissions and live decay curves.
  - *Nuclear Fission & Criticality Reactor Simulator* (`5-8a.js` + `5-8a_nuclear-reactions-radioactive-decay.html`): Fission splitting kinematics and multi-generation core criticality with control rods and emergency SCRAM.
- **SRS & Rapid Retrieval** (`public/chem/lessons/`): 100% of lessons use canonical Section 05 `.recall-section.recall` with `.blank[data-answer]` for Spaced Repetition and Cram mode ingestion.
- **Manifest Architecture**: `lessons.json` is the single source of truth for textbook lessons, read dynamically at runtime by both the Chemistry and Physics dashboards (`index.html`). Standalone lesson pages use `core.js`'s `LESSONS_MANIFEST` for in-lesson previous/next navigation, verified continuously against `lessons.json` by automated drift guards in `sourceOfTruth.test.ts`.
