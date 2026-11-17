# Feature Tracker

What is live today: each component or shared module, where it is deployed, and the
files that belong to it. Use it to find every place a shared component appears before
you change it.

**Rules for this file**

- **Live only.** When something ships, changes or is retired, edit its entry in the
  same commit. History goes in `ChangelogView.tsx` (app) or `docs/textbook/CHANGELOG.md`
  (textbooks), never here. Older history is in
  [docs/archive/FEATURE_TRACKER_HISTORY.md](docs/archive/FEATURE_TRACKER_HISTORY.md).
- **No typed counts, version tags or status labels.** Counts live in the registries
  (`MODES_METADATA`, `SIMULATIONS_REGISTRY`, `COURSES`, each book's `lessons.json`).
  A simulation's beta/new/stable badge lives in `components/SimulationsHub.tsx`.
- **Sources of truth:** dashboard modes are `MODES_METADATA` in
  `constants/modesRegistry.ts`; simulations are `SIMULATIONS_REGISTRY` in
  `constants/simulationsRegistry.ts`; signed-out routes are `constants/publicRoutes.ts`.
  This file describes them; it does not replace them.
- **Rules and pitfalls** live in [CLAUDE.md](CLAUDE.md),
  [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) and
  [docs/RENDERING_GOTCHAS.md](docs/RENDERING_GOTCHAS.md), not here.

**Contents:** 1 App shell and access · 2 Practice and study modes · 3 Personae and
dialogue modes · 4 Review games · 5 Teacher tools · 6 Simulations · 7 Shared features ·
8 AI services · 9 Textbooks and static practice · 10 Tooling and guards

---

## 1. App shell and access

### `Gatekeeper`
**Path:** `components/Gatekeeper.tsx`
**Deployments:** App root (`App.tsx`), shown to signed-out users who open a mode that needs sign-in.
**Features:**
- Google Identity Services sign-in button (`utils/googleAuth.ts`).
- Server-side verification (`api/auth-google.ts`) against `OAUTH_ALLOWED_DOMAINS`, plus the optional `OAUTH_ALLOWED_EMAILS` list.
- Zero-PII HS256 session token (`utils/jwt.ts`, payload holds the verified domain only), re-verified on reload by `api/verify.ts`.
- School-domain help modal with a Formspree contact trigger.
- A "Textbooks" link and the simulations, so a signed-out visitor still reaches everything public.
- The local-dev sign-in bypass (`api/auth-dev` and its button) is David's tool. Its four safeguards are in `.claude/skills/dev-sign-in/SKILL.md`.

### `PublicLandingPage`
**Path:** `components/PublicLandingPage.tsx`
**Deployments:** App root, the signed-out splash page.
**Features:** Open-access cards for the three textbooks (`/chem/`, `/physics/`, `/bio/`) and the simulations.

### `LandingPage`
**Path:** `components/LandingPage.tsx`, sections in `components/landing/`
**Deployments:** App root, the signed-in dashboard home.
**Features:** Mode launch tiles from `MODES_METADATA`, the study-buddy advisor in the welcome tile (`components/landing/WelcomeHeroTile.tsx`, which turns `[sim:*]` tags into simulation shortcuts), the daily mission card, onboarding modal, and the Course Texts section (`components/landing/CourseTextsSection.tsx`) with reading progress and a resume link read through `utils/textbookProgress.ts`.

### `DashboardShell`
**Path:** `components/DashboardShell.tsx`
**Deployments:** App root, the layout around every signed-in dashboard view.
**Features:** Responsive sidebar (fixed on desktop, drawer on mobile), mascot, profile widget, dark mode and accessibility toggles, and links to Home, Practice Center, Lab & Research (`?page=lab`), Subject Library, Interactives, Trophy Room and History.

### Domain sub-routers
**Path:** `components/routing/`
**Deployments:** App root delegates these view families. Each wraps its views in its own `ErrorBoundary` with a reset that returns to the family's hub.
- **`components/routing/SimulationRouter.tsx`**: `SimulationsHub` and every simulation, lazy-loaded.
- **`components/routing/ReviewGamesRouter.tsx`**: Jeopardy, Square Match, Who Am I (setup, preview, game), Bingo, Charades and Taboo.
- **`components/routing/StudySprintRouter.tsx`**: Study Sprint setup, dashboard and report.
- **`components/routing/TeacherToolsRouter.tsx`**: Teachers hub, Document Creator and its config, Test Creator setup, Rubric Translator, Interview Script and Reflection.

### Navigation and account views
All routed from `App.tsx`, behind sign-in.
- **Practice Center** (`components/PracticeCenterView.tsx`): mode cards grouped by purpose.
- **Subject Library** (`components/SubjectLibraryView.tsx`): browse by course and unit.
- **Trophy Room** (`components/TrophyRoomView.tsx`) and **Session History** (`components/SessionHistoryView.tsx`, `components/SessionDetailView.tsx`): badges and past sessions from `services/storageService.ts`.
- **Settings** (`components/SettingsView.tsx`, "User Options" in the menu): role (Student or Teacher, which is `teacherMode`), display name, companion, display toggles, Sign Out, and the data-reset controls.
- **Profile card** (`components/landing/ProfileSetupModal.tsx`): after sign-in, before the tour, and not skippable. Picks the role and an optional name; `sp_profile_done` records it.
- **Sign Out** (`handleSignOut` in `App.tsx`): in the sidebar menu and in Settings. Removes the session token, the name and `sp_profile_done`, so a shared computer starts clean for the next student; badges, history and preferences stay.

### Info pages (public)
Listed in `INFO_PAGES` in `constants/publicRoutes.ts`: How It Works (`components/HowItWorksView.tsx`), Features (`components/FeaturesView.tsx`), Support (`components/SupportView.tsx`), Teachers (`components/TeachersView.tsx`), Changelog (`components/ChangelogView.tsx`) and Open Resources (`components/OpenResourcesView.tsx`). Counts on these pages are rendered from the registries, never typed.

### `FeedbackModal` / `ContactModal`
**Paths:** `components/FeedbackModal.tsx`, `components/ContactModal.tsx`
**Deployments:** `FeedbackModal` on the landing page and the Changelog "Submit Request" button. `ContactModal` from `components/FeedbackView.tsx` and `App.tsx`.
**Features:** Formspree submission via the `FORMSPREE_FORM_ID` constant, with validation, loading, success and error states.

### `SupportView`
**Path:** `components/SupportView.tsx`
**Features:** In-app support page with the project philosophy, live stats rendered from the registries, and donation options.

---

## 2. Practice and study modes

Each mode below has an entry in `MODES_METADATA` unless noted.

### `UniversalInputView`
**Path:** `components/UniversalInputView.tsx`
**Deployments:** App root, the `'menu'` view.
**Features:** Mode selector tabs, unit quick-browse badges, multi-topic input, topic auto-complete, the mode-specific `SettingsPanel` (`components/SettingsPanel.tsx`), and "Surprise Me" (below). Digital modes only: a guard in `services/__tests__/sourceOfTruth.test.ts` keeps worksheets out.

### Surprise Me topic
**Path:** `constants.ts` (`getAllTopicsForCourse`, `getRandomTopicForCourse`, `getRandomCourseAndTopic`)
**Deployments:** `UniversalInputView` topic header, and the landing page "Explore Direct Topic" card.
**Features:** Picks a random topic within the selected course, or a random course and topic when none is selected, then starts the chosen mode. Sign-in only. Tests: `services/__tests__/randomTopic.test.ts`.

### `LoadingSessionView`
**Path:** `components/LoadingSessionView.tsx`
**Deployments:** App root, the loading state for every AI generation.
**Features:** Thinking mascot, step progress bar, rotating science facts and recall tips, session badges (course, topic, mode, difficulty), and a cancel button.

### Adaptive Practice (`quiz`)
**Paths:** `components/QuestionCard.tsx`, `components/ResultsView.tsx`, `components/AITutorPanel.tsx`
**AI:** `services/ai/questions.ts`, validated by `services/ai/questionValidator.ts` (section 8), graded by `services/ai/grading.ts`.

### Written Response (`frq`) and Data Analysis (`cer`)
**Paths:** `components/FRQView.tsx`, `components/CERView.tsx`, both with Simplify via `hooks/useSimplify.ts`.
**AI:** `services/ai/frq.ts`, `services/ai/cer.ts`. Results show the `RubricDiffViewer` (section 7).

### Study Sprint (`study_sprint`)
**Paths:** `components/StudySprintSetupView.tsx`, `components/StudySprintDashboard.tsx`, `components/StudySprintReport.tsx`, state in `hooks/useStudySprint.ts`, adapter `utils/studySprintAdapter.ts`
**AI:** `services/ai/studySprint.ts`
**Rule:** every mode's quit handler inside a sprint calls `handleSprintAwareQuit` (see CLAUDE.md).

### Explanation Partner (`explanation`) and Calculation Partner (`calculation`)
**Paths:** `components/ExplanationView.tsx` (with `components/ExplanationMessage.tsx`), `components/CalculationView.tsx`
**Features:** Explanation Partner takes a persona from `SettingsPanel` (Tutor, Socratic, Skeptic, Growth Coach). Calculation Partner embeds `DesmosCalculatorModal` and `DataChart` (section 7).

### Smart Scanner (`quiz_my_notes`)
**Path:** `components/QuizMyNotesView.tsx`
**AI:** `services/ai/documents.ts`, file parsing via `services/fileData.ts` and `FileUpload` (section 7).

### `FlashcardView` (`flashcards`)
**Path:** `components/FlashcardView.tsx`, sub-components in `components/flashcards/`
**Deployments:** App root (standalone sessions) and Study Sprint tasks (`sprint.completeCurrentTask`).
**Features:**
- **Leitner spaced repetition** (`components/flashcards/srsEngine.ts`): correct answers move a card along spaced intervals, a miss returns it to box 1. Stored under `science_partner_flashcard_srs`. Progress bar in `components/flashcards/LeitnerBoxBar.tsx`.
- **Card types:** term/definition, cloze (`components/flashcards/ClozeCardContent.tsx`), MCQ, true/false, image occlusion (`components/flashcards/ImageOcclusionCardContent.tsx`, presets in `components/flashcards/occlusionPresets.ts`) and multi-step reveal (`components/flashcards/MultiStepCardContent.tsx`, presets in `components/flashcards/multiStepPresets.ts`).
- **Saved decks** (`components/flashcards/SavedDecksModal.tsx`): stored under `science_partner_saved_decks`, with JSON import and export.
- **Study filters:** all cards, SRS due only, cram, matching quiz. Reverse cards and write mode (fuzzy matching on plain text).
- **Keyboard:** Space flips, left arrow or 1 for Study Again, right arrow or 2 for Got It, A to D pick MCQ options.
- Notation rendered through `MarkdownRenderer` and KaTeX; card text scales to fit long questions.

### Metacognitive Reflection (`reflection`)
**Path:** `components/ReflectionView.tsx`
**Deployments:** Teacher Tools, and `?page=reflection`, which still needs sign-in (`AUTHENTICATED_ONLY_PAGES`).
**AI:** `getReflectionPrompts()` in `services/ai/documents.ts`.
**Features:** Several reflection structures (learning journal, exit ticket, I Used to Think / Now I Think, 3-2-1, Plus/Delta, scientific metacognition), sentence starters, ELL frames, a teacher debrief note, and print to PDF.

### Lab Co-Pilot (`lab`) and Research Assistant (`research`)
**Paths:** `components/LabView.tsx` (uploads through `FileUpload`), `components/ResearchModeView.tsx` (persona dropdown with tooltips)
**AI:** `services/ai/lab.ts`, `services/ai/research.ts`.

### Advanced Study Buddy (`ap_review_catalog`)
**Paths:** `components/APReviewCatalogView.tsx`, `components/APReviewTutorView.tsx`
**Course registry:** `COURSES` in `constants/apCourses.ts` (`curriculumType`, `subjectArea`, `slug`, `cedFile`, `emoji`, `color`). IB syllabi are JSON in `constants/extracted-ceds/`, loaded lazily by `utils/cedLoader.ts`.
**Features:** Catalog grouped by curriculum (AP, IB), then subject; sub-components `CourseCard`, `CourseGrid`, `CurriculumSection`.
**AI:** `services/ai/apReview.ts` switches exam-writer label, task verbs and scope rule by `curriculumType` (IB uses command terms, AP uses CED rubrics). The grader receives the correct answer and every option for MCQs.

### The Learning Loop (`learning_loop`)
**Path:** `components/LearningLoopView.tsx`
**AI:** `services/ai/learningLoop.ts`

### Concept Map Builder (`concept_map`)
**Path:** `components/conceptMap/ConceptMapView.tsx`, with canvas, node, edge, inspector, engine, presets and About content in `components/conceptMap/`
**Deployments:** Practice Center card, `?page=concept_map`.
**AI:** `services/ai/conceptMap.ts`
**Features:** Draggable concept cards with directed, labelled links; offline topic presets; a rule-based proposition checker (`components/conceptMap/conceptMapEngine.ts`) for synonyms and reversed causality; an AI auditor for custom maps; circle auto-layout; Markdown and Mermaid export.

### Diagram Labeling (`diagram_labeling`)
**Path:** `components/diagramLabeling/DiagramLabelingView.tsx`
**Deployments:** Landing page Study & Review card, Practice Center card, `?page=diagram_labeling`.
**Features:** The AI draws an SVG diagram with numbered targets; students type labels and get instant colour-coded feedback and a summary.

### `MultiModeView`
**Paths:** `components/MultiModeView.tsx`, `components/multimode/multiModeReducer.ts`, report in `components/MultiModeReport.tsx`
**Deployments:** App root, the `'multimode'` topic dashboard. Not in `MODES_METADATA`.
**Features:** One reducer holds loading state, uploaded notes, share-link toasts, the Explanation and Calculation partner chat histories and panel toggles. Session state persists in localStorage. Overview generated by `services/ai/overview.ts`. Tests: `tests/unit/multiModeReducer.test.ts`.

---

## 3. Personae and dialogue modes

Each is in `MODES_METADATA`, has a public `?page=` route, ships an About panel, and
carries the Standard Kit (TTS, dictation, Simplify, Markdown export). The same four
personae are also selectable inside Explanation Partner and Research Assistant.

### `SkepticView` (`skeptic`)
**Path:** `components/skeptic/SkepticView.tsx`, engine `components/skeptic/skepticEngine.ts`, About `components/skeptic/SkepticAbout.ts`
**AI:** `services/ai/skeptic.ts`
**Features:** The student submits a hypothesis, design or claim; the AI answers as a skeptical peer reviewer over several turns. TTS on research questions and challenges, and a "Simplify Concern" toggle beside reviewer hints.

### `TutorView` (`tutor`)
**Path:** `components/personae/TutorView.tsx`, About `components/personae/TutorAbout.ts`
**AI:** `services/ai/personae.ts`, engine `components/personae/personaeEngine.ts`
**Features:** Step-by-step problem partner with a scratchpad and science symbol shortcuts, and a step breakdown extracted from replies (`parseTutorMathSteps`).

### `SocraticView` (`socratic`)
**Path:** `components/personae/SocraticView.tsx`, About `components/personae/SocraticAbout.ts`
**AI:** `services/ai/personae.ts`
**Features:** Counter-questions and thought experiments, a reasoning-depth meter, and "push thinking" levers (probe assumptions, boundary test, counter-example, first principles).

### `GrowthCoachView` (`growth_coach`)
**Path:** `components/personae/GrowthCoachView.tsx`, About `components/personae/GrowthCoachAbout.ts`
**AI:** `services/ai/personae.ts`
**Features:** Error workbench that sorts a mistake into a four-part taxonomy (conceptual, maths or units, misread prompt, retrieval gap) and assigns a matching study drill.

---

## 4. Review games

Launched from `components/ReviewGamesView.tsx` (the `review_games` mode, also reachable from the Teachers hub) and routed by `components/routing/ReviewGamesRouter.tsx`.

### `JeopardyGame`
**Path:** `components/jeopardy/JeopardyGame.tsx`, modals and parts in `components/jeopardy/`, lazy-loaded
**AI:** `services/jeopardyService.ts`
**Features:** Daily Double, Final Jeopardy, manual scoring, team renaming, data-analysis clues (tables and charts), a saved-board library, and Whole-Course Review mode (pun-based categories across a whole curriculum, with a strict point-value difficulty ramp).

### `SquareMatchView`
**Path:** `components/SquareMatchView.tsx`, parts in `components/squareMatch/`
**AI:** `services/tarsiaService.ts`
**Features:** Several grid sizes and edge difficulties, editable and individually regenerable pairs, a Math Mix slider (calculation vs definition pairs), and an A4 print with answer key.

### `WhoAmIGameView`
**Paths:** `components/WhoAmISetupView.tsx`, `components/WhoAmIPreviewView.tsx`, `components/WhoAmIGameView.tsx`, parts in `components/whoAmI/`
**AI:** `services/ai/whoAmI.ts`
**Features:** Progressive clue puzzles with a factoid on reveal.

### `BingoGameView`
**Path:** `components/bingo/BingoGameView.tsx`
**AI:** `services/bingoService.ts`
**Features:** Presets or AI terms, adjustable board count, one or two boards per page, optional free space, and an appended teacher calling script.

### `CharadesGameView` and `TabooGameView`
**Paths:** `components/charades/CharadesGameView.tsx`, `components/taboo/TabooGameView.tsx`
**AI:** `services/charadesService.ts`, `services/tabooService.ts`

### `VocabRelayView`
**Path:** `components/relay/VocabRelayView.tsx`, with setup, card, baton-pass, results and About in `components/relay/`
**Deployments:** Review Games, `?page=vocab_relay`.
**Engines:** `services/relayEngine.ts` (scoring, streaks, clean-leg bonuses, analytics), `services/ai/vocabRelay.ts` (custom decks), `components/relay/relayAudio.ts` (Web Audio sound, offline).
**Features:** Pass & Play, Projector Dual and Solo Sprint; Clue Caller (with taboo words) and rapid four-choice formats; runner countdown; team rosters; baton-pass screen.

---

## 5. Teacher tools

Routed by `components/routing/TeacherToolsRouter.tsx`.

### `TeachersView`
**Path:** `components/TeachersView.tsx`
**Deployments:** "For Teachers" header button, and `?page=teachers` (public info page; the tools it launches need sign-in).
**Features:** The launch hub for every teacher tool below, plus Review Games, privacy and Gatekeeper information, and links to the static practice suites (section 9).

### Document Creator
**Paths:** `components/DocumentCreatorView.tsx`, `components/DocumentConfigView.tsx`, printable output in `components/WorksheetView.tsx` and `components/NoteSheetView.tsx`, PDF via `services/pdfService.ts`
**AI:** `services/ai/documents.ts`
**Features:** Worksheet, CER, FRQ, problem set, exit ticket and test formats. A top shelf of one-click chemistry unit presets (`DocumentCreatorView.tsx`) pre-configures a format and topic for each unit; a signed-out teacher is sent to Gatekeeper.

### Test Creator
**Path:** `components/TestCreatorConfigView.tsx`
**AI:** `services/ai/test.ts`

### Rubric Translator and Interview Script
**Paths:** `components/RubricTranslatorView.tsx`, `components/InterviewScriptView.tsx` (accepts uploads via `services/fileData.ts`)
**AI:** `services/ai/documents.ts`

### Reflection Prompter
See Metacognitive Reflection in section 2.

---

## 6. Simulations

Public, no sign-in. Every simulation is in `SIMULATIONS_REGISTRY`, is lazy-loaded by
`SimulationRouter`, has a `?page=` route in `VIEW_TO_PAGE`, and ships an About panel.
New ones follow the `new-simulation` skill.

### `SimulationsHub`
**Path:** `components/SimulationsHub.tsx`
**Deployments:** Landing page Interactives card, `?page=interactives`.
**Features:** Discovery page built from `SIMULATIONS_REGISTRY`, with per-card status badges, difficulty labels, topic previews and a request-a-simulation feedback link.

### `SIMULATIONS_REGISTRY`
**Path:** `constants/simulationsRegistry.ts`
**Read by:** `SimulationsHub`, the landing-page advisor (`[sim:*]` shortcuts), `services/ai/tutor.ts` (topic matching and deep links), `constants/publicRoutes.ts` guard, and the count and name guards on README.md and CLAUDE.md.

### Simulation shared components
**Path:** `components/simulations/shared/`
- `components/simulations/shared/AboutPanel.tsx`: the required About panel.
- `components/simulations/shared/ChallengeDeck.tsx`: goal-oriented challenges with progress, hint drawer, verification banner and one-click "apply solution". Used by most simulations; each keeps its challenges in a `*Challenges.ts` file.
- `components/simulations/shared/SocraticMascotPanel.tsx`: expandable advisor drawer with the student's mascot.
- `components/simulations/shared/SimulationHeader.tsx`, `components/simulations/shared/VisualizationModeTabs.tsx`, `components/simulations/shared/ExportButtons.tsx`, `components/simulations/shared/HeatCoolButtons.tsx`.
- `components/simulations/shared/MessageToast.tsx` with `components/simulations/shared/useSimulationMessage.ts` for feedback toasts.

### Simulation constants and utilities
**Paths:** `components/simulations/SIMULATION_CONSTANTS.ts`, `utils/unicodeFormatting.ts`
**Constants:** canvas sizes, periodic table grid, temperature ranges and state colours, atom and bond sizes, touch targets, animation timings, drag-and-drop config, z-index layers, XP and badge thresholds.
**Utilities:** `toSubscript()`, `toSuperscript()`, `formatIonCharge()`, `formatFormula()`, `formatScientificText()`, `stripFormatting()`.

### `PeriodicTableView` (Periodic Table)
**Path:** `components/simulations/periodicTable/PeriodicTableView.tsx`
**Features:** Temperature slider with live state colouring; property heat maps (radius, electronegativity, ionization energy, metallic and non-metallic character, reactivity, density, melting and boiling points); category, group and period filters that work in every view; f-block toggle; element comparison; search; element modal with electron configuration, oxidation states, trend indices, and Bohr, Lewis and Spectra tabs; graph mode; configurable A4 print; challenge deck.
**Files:** `components/simulations/periodicTable/PeriodicTableGraph.tsx`, `components/simulations/periodicTable/PeriodicTablePrint.tsx`, `components/simulations/periodicTable/BohrModelAtom.tsx`, `components/simulations/periodicTable/LewisDotDiagram.tsx`, `components/simulations/periodicTable/SpectrumDisplay.tsx`, `components/simulations/periodicTable/periodicTableData.ts`, `components/simulations/periodicTable/spectraData.ts` (NIST ASD export), `components/simulations/periodicTable/periodicTableAbout.ts`, `components/simulations/periodicTable/periodicTableChallenges.ts`.
**Reused by:** Build an Atom's element modal.

### `CovalentBondingView` (Covalent Bonding)
**Path:** `components/simulations/covalentBonding/CovalentBondingView.tsx`
**Features:** Drag-and-drop atoms (`@dnd-kit`), single, double and triple bonds, bond breaking, preset molecules with difficulty filter, Builder and Lewis views, octet validation, Hill-notation formula, VSEPR geometry and polarity, molar mass and formal charge, challenge deck.
**Files:** `components/simulations/covalentBonding/moleculeEngine.ts`, `components/simulations/covalentBonding/formulaEngine.ts`, `components/simulations/covalentBonding/moleculeDatabase.ts`, `components/simulations/covalentBonding/presetMolecules.ts`, `components/simulations/covalentBonding/DotCrossDiagram.tsx`, `components/simulations/covalentBonding/OverlappingCirclesView.tsx`.

### `IonicBondingBuilderView` (Ionic Bonding)
**Path:** `components/simulations/ionicBonding/IonicBondingBuilderView.tsx`
**Features:** Metals, nonmetals and polyatomic ions; oxidation-state choice for variable-charge metals; electron transfer; charge balance; Lewis transfer, crystal lattice, Bohr and bracket views; IUPAC naming, formula and formula mass; challenge deck.
**Files:** `components/simulations/ionicBonding/ionicBuilderEngine.ts`, `components/simulations/ionicBonding/compoundEngine.ts`, `components/simulations/ionicBonding/ionicDatabase.ts`, `components/simulations/ionicBonding/LewisIon.tsx`, `components/simulations/ionicBonding/LewisTransferDiagram.tsx`, `components/simulations/ionicBonding/CrystalLattice.tsx`, `components/simulations/ionicBonding/BohrModelDiagram.tsx`, `components/simulations/ionicBonding/BracketNotationView.tsx`.

### `BuildAnAtom` (Build an Atom)
**Path:** `components/simulations/buildAnAtom/BuildAnAtom.tsx`
**Features:** Proton, neutron and electron bins; live Bohr diagram with valence and kernel electrons coloured apart; nuclear stability check with a shake and a "Radioactive" badge; mass number, net charge and atomic number gauges; mini periodic table (hydrogen through argon); element modal with isotope abundance; challenge deck; mascot drawer.
**Files:** `components/simulations/buildAnAtom/ElementDetailModal.tsx` (reuses the periodic table components and data), `components/simulations/buildAnAtom/isotopeData.ts`.

### `PhaseChangeView` (Particle Phase Change)
**Path:** `components/simulations/phaseChange/PhaseChangeView.tsx`
**Features:** Canvas particle engine; heat energy mapped to temperature with latent-heat plateaus; heating and cooling; live heating curve; substances with different intermolecular forces; challenge deck.
**Files:** `components/simulations/phaseChange/particleEngine.ts`, `components/simulations/phaseChange/phaseChangeConstants.ts`, `components/simulations/phaseChange/PhaseChangeCanvas.tsx`, `components/simulations/phaseChange/PhaseChangeControls.tsx`, `components/simulations/phaseChange/HeatingCurveGraph.tsx`.

### `RegulatoryModelerView` (Biological Systems Modeler)
**Path:** `components/simulations/regulatoryModeler/RegulatoryModelerView.tsx`
**Features:** Discrete-time activation and repression engine with delay-driven oscillation; drag-and-drop circuit canvas; activity graph; starter circuits (negative feedback, double-negative gating); manual toggle nodes; challenge deck (operons, endocrine feedback, glucose homeostasis).
**Files:** `components/simulations/regulatoryModeler/regulatoryEngine.ts`, `components/simulations/regulatoryModeler/modelerConstants.ts`, `components/simulations/regulatoryModeler/regulatoryChallenges.ts`, `components/simulations/regulatoryModeler/NetworkCanvas.tsx`, `components/simulations/regulatoryModeler/NodeComponent.tsx`, `components/simulations/regulatoryModeler/ActivityGraph.tsx`.

### `DiffusionView` (Cell Membrane Transport)
**Path:** `components/simulations/diffusion/DiffusionView.tsx`
**Features:** Particle engine for simple diffusion, facilitated diffusion through channels, and active transport through pumps with manual ATP; inside vs outside concentration graph; particles with their own size, speed and permeability; challenge deck.
**Files:** `components/simulations/diffusion/diffusionEngine.ts`, `components/simulations/diffusion/diffusionConstants.ts`.

### `KineticsView` (Reaction Kinetics)
**Path:** `components/simulations/kinetics/KineticsView.tsx`
**Features:** Collision theory and enzyme kinetics modes; temperature slider; catalysts and enzymes that lower the activation energy; reactant and product graph; challenge deck.
**Files:** `components/simulations/kinetics/kineticsEngine.ts`, `components/simulations/kinetics/kineticsConstants.ts`.

### `GasLawsView` (Ideal Gas Laws)
**Path:** `components/simulations/gasLaws/GasLawsView.tsx`
**Features:** Wall-collision engine that builds pressure from impulses and temperature from mean kinetic energy; movable piston; heat and cool burners; two gas species; graph of any variable pair; challenge deck.
**Files:** `components/simulations/gasLaws/gasLawsEngine.ts`, `components/simulations/gasLaws/gasLawsConstants.ts`, `components/simulations/gasLaws/gasLawsChallenges.ts`, `components/simulations/gasLaws/gasLawsAbout.ts`, plus canvas, controls and graph components in the same folder.

### `FbdView` (Free Body Diagrams)
**Path:** `components/simulations/freeBodyDiagram/FbdView.tsx`
**Features:** Draggable force vectors with angle snap and live component table; flat, inclined, hanging, fluid and free-fall environments; scenario decks with hint ladders; a net-force and acceleration checker (`components/simulations/freeBodyDiagram/fbdEngine.ts`); AI feedback panel (`services/ai/fbd.ts`).
**Files:** `components/simulations/freeBodyDiagram/fbdScenarios.ts`, `components/simulations/freeBodyDiagram/fbdConstants.ts`, `components/simulations/freeBodyDiagram/fbdAbout.ts`, plus canvas, palette, editor and panel components in the same folder.

### `MotionTrackerView` (Motion Tracker)
**Path:** `components/simulations/motionTracker/MotionTrackerView.tsx`
**Deployments:** Simulations Hub, `?page=video-lab`, and the `motion_tracker` dashboard mode (it is in both registries).
**Files:** `components/simulations/motionTracker/motionEngine.ts`, `components/simulations/motionTracker/motionChallenges.ts`, `components/simulations/motionTracker/motionTrackerAbout.ts`.

### `EcosystemSimulationView` (Ecosystem Balance)
**Path:** `components/simulations/ecosystem/EcosystemSimulationView.tsx`
**Files:** `components/simulations/ecosystem/ecologyEngine.ts`, `components/simulations/ecosystem/ecosystemChallenges.ts`, `components/simulations/ecosystem/ecosystemAbout.ts`, `components/simulations/ecosystem/ecosystemConstants.ts`, plus canvas, controls and graph.

### `PopulationGeneticsView` (Population Genetics)
**Path:** `components/simulations/populationGenetics/PopulationGeneticsView.tsx`
**Features:** Hardy-Weinberg baseline, with challenges on selection and genetic drift.
**Files:** `components/simulations/populationGenetics/hwEngine.ts`, `components/simulations/populationGenetics/hwChallenges.ts`, `components/simulations/populationGenetics/hwAbout.ts`, `components/simulations/populationGenetics/hwConstants.ts`, plus grid, graphs and panels.

### `ThermalStudioView` (Thermal & Thermochemistry Studio)
**Path:** `components/simulations/thermalStudio/ThermalStudioView.tsx`, re-exported as `components/simulations/calorimetry/CalorimetryView.tsx` (the registry id is `calorimetry`)
**Deployments:** Simulations Hub, and the chemistry textbook's lesson bridge (`public/chem/assets/book.js`).
**Features:** Three tabs: thermal equilibration (q = mcΔT, heat sum checks), multi-stage heating curves, and solution calorimetry with an energy-bar (LOL) balancer. Challenge decks on each tab, mascot study guide, Markdown lab report export.
**Files:** `components/simulations/thermalStudio/ThermalEquilibrationTab.tsx`, `components/simulations/thermalStudio/HeatingCurvesTab.tsx`, `components/simulations/thermalStudio/CalorimetryLolTab.tsx`, `components/simulations/thermalStudio/thermalStudioConstants.ts`.

### `BloodBufferView` (Arterial Blood Buffers)
**Path:** `components/simulations/bloodBuffer/BloodBufferView.tsx`
**Deployments:** Simulations Hub, and the chemistry textbook's lesson bridge.
**Features:** Henderson-Hasselbalch model; pH dial with clinical zones; ventilation slider with a paper-bag toggle; metabolic disturbances; clinical-case challenge deck.
**Files:** `components/simulations/bloodBuffer/bloodBufferEngine.ts`, `components/simulations/bloodBuffer/bloodBufferChallenges.ts`, `components/simulations/bloodBuffer/bloodBufferAbout.ts`.

### `NuclearDecayView` (Nuclear Decay & Dating)
**Path:** `components/simulations/nuclearDecay/NuclearDecayView.tsx`
**Deployments:** Simulations Hub, and the chemistry textbook's lesson bridge.
**Features:** Alpha, beta-minus and beta-plus modes; stochastic parent and daughter grid; half-life slider with decay curve; radiometric dating calculator; dating-case challenge deck.
**Files:** `components/simulations/nuclearDecay/nuclearDecayEngine.ts`, `components/simulations/nuclearDecay/nuclearDecayChallenges.ts`, `components/simulations/nuclearDecay/nuclearDecayAbout.ts`.

### `OsmosisView` (Osmosis Lab)
**Path:** `components/simulations/osmosis/OsmosisView.tsx` (`?page=osmosis`)
**Deployments:** Simulations Hub.
**Origin:** Adapted from Ms. Michelle Lee's (SAS General Biology) osmometer page, with the science fixed: sucrose instead of NaCl (NaCl passes dialysis tubing), the bag dilutes and the column's weight pushes back so the rise levels off, and the particle view has no push toward the solute.
**Features:** Dialysis-bag osmometer (SVG) with ruler; bag and beaker sugar sliders; narrow, medium and wide tubes; water-only or leaky membrane; starts paused for a prediction; tug-of-war bar (osmosis against column weight); height graph that keeps the last run as a dashed line; membrane close-up whose net crossings come from random motion plus free-water density and column pressure; five verified challenges.
**Files:** `components/simulations/osmosis/osmosisEngine.ts`, `osmosisParticles.ts`, `osmosisChallenges.ts`, `osmosisAbout.ts`, `OsmometerDiagram.tsx`, `MembraneWindow.tsx`, `HeightGraph.tsx`, `TugOfWar.tsx`. Tests: `services/__tests__/osmosisEngine.test.ts`.

### `CarbonJourneyView` (Tracking a Carbon Atom)
**Path:** `components/simulations/carbonJourney/CarbonJourneyView.tsx` (`?page=carbon_atom`)
**Deployments:** Simulations Hub.
**Origin:** Adapted from Ms. Michelle Lee's (SAS General Biology) matter-tracing page, with the science fixed: energy released by forming stronger bonds (not by breaking bonds), CO₂'s oxygen from glucose and water, light splits water, correct glucose ring, bicarbonate as the main dissolved carbon, bull kelp named correctly.
**Features:** Six stages (seawater, photosynthesis, grazing, respiration, return, big picture); kelp-forest SVG scene and a close-up per stage; matter and energy cards; equation card with a computed atom count; one check per stage with feedback on every option; respects reduced motion.
**Files:** `components/simulations/carbonJourney/carbonJourneyData.ts`, `carbonJourneyAbout.ts`, `CarbonScene.tsx`, `CarbonCloseUps.tsx`, `TrackedAtom.tsx`, `EquationCard.tsx`, `StageCheckCard.tsx`. Tests: `services/__tests__/carbonJourney.test.ts`.

### `IslandBiogeographyView` (Island Biogeography)
**Path:** `components/simulations/islandBiogeography/IslandBiogeographyView.tsx` (`?page=island_biogeography`)
**Deployments:** Simulations Hub; linked from bio lesson 2b-2, section 05.
**Origin:** Built 2026-11-07 for SAS General Biology Unit 2b, from MacArthur and Wilson's equilibrium model. Calibrated so Krakatoa (28 km², 40 km) settles at 34 bird species and Surtsey (1.3 km², 32 km) at 15, the counts in lesson 2b-2 Table 1.
**Features:** A mainland of 50 bird species; each species arrives and dies out on its own, so the count wobbles around equilibrium; log sliders for island size (0.5 to 1,000 km²) and distance (1 to 500 km), movable mid-run; Krakatoa and Surtsey presets; starts paused for a prediction; Volcano (wipe the island) and Cut off (start from the land-bridge count) events; map with arrival rings and loss marks; count graph that keeps the last run; "Why it settles" tab with the arrival and extinction curves; "Watch the list" species grid with arrival and extinction counters; Record table with the 100-year average.
**Files:** `components/simulations/islandBiogeography/islandEngine.ts`, `islandAbout.ts`, `IslandMap.tsx`, `SpeciesGrid.tsx`, `IslandGraphs.tsx`. Tests: `services/__tests__/islandEngine.test.ts`.

---

## 7. Shared features

### Theme logic
**Path:** `hooks/useTheme.ts` (`getTheme(subject)`)
**Used by:** `components/LandingPage.tsx`, `components/ExplanationView.tsx`, `components/CalculationView.tsx`, `components/FlashcardView.tsx`, `components/RubricTranslatorView.tsx` and others. Never hard-code a subject colour.
**Colours:** Biology emerald, Chemistry violet, Physics cyan, Environmental teal, Middle School amber, Elementary orange, Elective slate. Full system in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

### Deep linking
**Path:** `App.tsx`, with routes from `constants/publicRoutes.ts`
**Session links:** `?course=...&topic=...&mode=...&config=...` (settings such as MCQ count and difficulty encoded in `config`).
**Page links:** `?page=...` from `VIEW_TO_PAGE`. `PUBLIC_PAGE_PARAMS` is exactly what a signed-out visitor can open; `AUTHENTICATED_ONLY_PAGES` carry a `?page=` but still need sign-in.

### Text-to-speech
**Paths:** `components/TTSButton.tsx`, `utils/speech.ts`
**Used by:** every mode with the Standard Kit (see the Feature Matrix in [MODE_REFERENCE.md](MODE_REFERENCE.md)).
**Features:** `cleanTextForSpeech` strips markup and reads formulas, charges and units aloud; `scoreVoice` and `getBestVoice` prefer natural voices; `chunkTextIntoSentences` avoids the browser's long-utterance cutoff; a popover sets pace and voice. Browser-only (Web Speech API), preferences in localStorage.

### Simplify
**Path:** `hooks/useSimplify.ts`
**Used by:** `components/FRQView.tsx`, `components/CERView.tsx`, `components/ExplanationMessage.tsx`. Other modes' Simplify levers are listed in the Feature Matrix in MODE_REFERENCE.md.

### `RubricDiffViewer`
**Path:** `components/results/RubricDiffViewer.tsx`
**Deployments:** `components/ResultsView.tsx`, for FRQ and CER answers with a rubric breakdown or model answer.
**Features:** Criterion checklist with points and Met / Partially Met / Missing badges; side-by-side or tabbed comparison with the model answer; "How to Upgrade Your Response" suggestions; fallback for older sessions without breakdown data.

### `DataChart` and graphing engine
**Paths:** `components/DataChart.tsx`, `services/graphingEngine.ts`
**Deployments:** `components/CalculationView.tsx` (charts generated during coaching), `components/ResultsView.tsx` (data series).
**Features:** Line, bar, scatter, area and pie (Recharts); histograms (`calculateHistogramBins`, with mean, median and sample SD); box plots (`calculateFiveNumberSummary`, 1.5 × IQR outliers, custom SVG).

### `DesmosCalculatorModal`
**Path:** `components/DesmosCalculatorModal.tsx`
**Deployments:** `components/CalculationView.tsx`, as a floating, draggable calculator.

### `FileUpload`
**Path:** `components/FileUpload.tsx`
**Deployments:** `components/LandingPage.tsx` (Smart Scanner entry), `components/LabView.tsx` (data CSVs and images), `components/QuizMyNotesView.tsx` (notes and PDFs).

### `MarkdownRenderer` and `MermaidDiagram`
**Paths:** `components/MarkdownRenderer.tsx`, `components/MermaidDiagram.tsx`
**Rules:** AI HTML passes through `cleanHtml` (`utils/sanitize.ts`); Mermaid only when it helps, behind the user's diagram switch (CLAUDE.md).

### Science Buddy mascot
**Path:** `components/ScienceBuddyMascot.tsx`
**Used by:** `components/DashboardShell.tsx`, `components/LoadingSessionView.tsx`, `components/Gatekeeper.tsx`, `components/ExplanationView.tsx`, `components/CalculationView.tsx`, `components/APReviewTutorView.tsx`, `components/TeachersView.tsx`, `components/SettingsView.tsx` and the onboarding modal.

---

## 8. AI services

All AI code lives in `services/ai/`. `services/geminiService.ts` is a barrel that re-exports it and holds no logic. `services/ai/core.ts` owns `DEFAULT_MODEL`, `VISION_MODEL` and `getCourseContext`. Requests go through the edge proxy `api/gemini.ts`, which rejects calls without a valid session (`x-oauth-session`). Model and JSON-mode rules are in CLAUDE.md ("Important Development Rules") and DEVELOPER_GUIDE.md section 2.

### Post-generation question validation
**Path:** `services/ai/questionValidator.ts`, called from `startQuizGeneration()` in `App.tsx` after generation and before the quiz is shown.
**Behaviour:**
- One batched validation call for every MCQ and fill-in-the-blank item; negative stems (NOT, EXCEPT, LEAST) get extra scrutiny.
- Invalid items are regenerated a limited number of times with the failure reason in the prompt; items that still fail are dropped, so the student gets a shorter quiz rather than a broken one.
- Failures are logged as structured JSON under `[QuestionValidator]`; the loading message switches to "Verifying questions..." during the pass.
- `services/ai/questions.ts` tells the generator to choose the correct answer to a negative stem first, then build distractors.

---

## 9. Textbooks and static practice

Zero-build static sites under `public/`, public, importing nothing from the React app.
Any work here starts with the `textbook-work` skill. Standards:
[docs/textbook/STYLE_STANDARD.md](docs/textbook/STYLE_STANDARD.md),
[docs/textbook/RUNTIME_SPEC.md](docs/textbook/RUNTIME_SPEC.md).

### Shared textbook runtime
**Path:** `public/textbook/` (`public/textbook/core.js`, `public/textbook/widgets.js`, `public/textbook/sim.js`, `public/textbook/base.css`, `public/textbook/lesson.css`, `public/textbook/theme-boot.js`, and the specimen page `public/textbook/specimen.html`)
**Used by:** all three books, so a fix here reaches every book.
**Features:** Table of contents, reveal observer, commit-before-reveal gates, recall checking, the widget framework (see [docs/textbook/INTERACTION_SPEC.md](docs/textbook/INTERACTION_SPEC.md)), canvas animations paused off-screen, figure lightbox, and the `--dia-*` diagram tokens governed by [docs/textbook/DIAGRAM_CONTRACT.md](docs/textbook/DIAGRAM_CONTRACT.md).

### SAS General Chemistry (`/chem/`)
**Paths:** `public/chem/index.html`, `public/chem/assets/` (`public/chem/assets/book.js`, `public/chem/assets/dashboard.js`, `public/chem/assets/glossary.js`, `public/chem/assets/reference-center.js`, `public/chem/assets/tokens.css`, `public/chem/assets/components.css`, and the drawing helpers `public/chem/assets/bohr.js` and `public/chem/assets/elements.js`. `public/chem/assets/molecule-renderer.js` and `public/chem/assets/particle-renderer.js` are loaded only by the test page `public/chem/lessons/_widget-test.html`), lessons in `public/chem/lessons/`, manifest `public/chem/lessons.json`, colophon `public/chem/about.html`
**Guide:** [docs/textbook/TEXTBOOK_DEV_GUIDE.md](docs/textbook/TEXTBOOK_DEV_GUIDE.md)
**Features:**
- Dashboard (`public/chem/assets/dashboard.js`) reads `lessons.json` at runtime; it holds the Performance Expectations and Practice & Review panels, cram mode, and the mixed review drill.
- Progress in localStorage under `gc-textbook-progress`. Two `StorageEngine` copies read it: `public/chem/assets/book.js` (lessons) and `public/chem/assets/dashboard.js` (dashboard). Change both together.
- Reference Center drawer (`public/chem/assets/reference-center.js`): periodic table, thermochemical tables, formulas and a calculator.
- Lesson bridge to the React simulations (`public/chem/assets/book.js`, keyed by manifest id).
- Socratic companion mascot (`public/chem/assets/book.js`): signed-out readers get a study tip and a sign-in card, with no AI calls; readers with a session in `oauth_session` get the AI tutor chat.
- Served at `/chem/` and via the `chem.sciencepractice.app` redirect (`vercel.json`).

### SAS General Physics (`/physics/`)
**Paths:** `public/physics/index.html`, `public/physics/assets/`, lessons in `public/physics/lessons/`, manifest `public/physics/lessons.json`
**Guide:** [docs/textbook/PHYSICS_DEV_GUIDE.md](docs/textbook/PHYSICS_DEV_GUIDE.md). Levels 3 and up are on hold for Physics PLC feedback.

### SAS General Biology (`/bio/`)
**Paths:** `public/bio/index.html`, `public/bio/assets/`, lessons in `public/bio/lessons/`, manifest `public/bio/lessons.json`
**Guide:** [docs/textbook/BIOLOGY_DEV_GUIDE.md](docs/textbook/BIOLOGY_DEV_GUIDE.md)
**Scope:** Unit 1 Homeostasis (1-1 to 1-4, review); Unit 2a Carbon (2a-1, 2a-2, review); Unit 2b Ecology (2b-1 to 2b-7, review). Lesson sims: `1-1.js` to `1-4.js`, `2b-2.js`, `2b-4.js`, `2b-6.js`, `2a-2.js`. Hub links: Island Biogeography (2b-2), Tracking a Carbon Atom (2a-1, 2a-2).

### Adaptive PE Practice Suite (`/chem/pe/`)
**Paths:** `public/chem/pe/index.html` (hub and workstation, `?pe=HS-PS1-1` style links), `public/chem/pe/pe-engine.js`, `public/chem/pe/pe-scoring.js` (scoring rules, tested by `services/__tests__/peScoring.test.ts`), `public/chem/pe/pe-num.js` (number helpers for items that vary per run), `public/chem/pe/pe-figures.js`, `public/chem/pe/pe-practice.css`, `public/chem/pe/qrcode.js`, `public/chem/pe/verify.html` (teacher verifier), one item bank per PE in `public/chem/pe/data/`
**Deployments:** Chemistry dashboard (Performance Expectations and Practice & Review panels) and a launch callout in each chemistry lesson.
**Features:**
- Each skill starts on a Level 2 item and steps up to Level 3 or down to Level 1. Each skill ends at 4 Mastered, 3 Proficient, 2 Developing or 1 Needs Practice. Only a first-try answer counts as independent evidence: a second-try pass after a hint gets one more check item, and no item repeats inside a skill. Every skill has two Level 2 items (`diagnostic` and `diagnosticAlt`, guarded by `peDataKeys.test.ts`). Each run picks one to place the student; the other is the check after a hint-assisted pass and the retry after Level 1. The rules live in `pe-scoring.js`.
- Two attempts per item: the first miss gives a scaffolding hint, the second reveals the worked solution.
- The results page shows the PE level (median of the skill levels), the count at Proficient or above, and each skill's level and path. Study tips cover the lowest skills first. Each run reshuffles options (the seed shown and sealed stays name plus PE).
- 33 calculation items (molar mass, mole conversions, mole ratios, limiting reactant, mass conservation, percent yield, balancing, rates from times, half-life, q = mcΔT, heating curves, calorimetry, equilibrium temperature) draw one of 2 to 4 vetted number sets per run; answer, distractors, hint and worked solution come from the same numbers. `peDataKeys.test.ts` runs every item over eight draws and lists the items that must vary. Concept items, bond-energy sums and measured data stay fixed.
- Optional item `figure` (one inline `<svg role="img">` drawn with the `--pe-*` tokens) rendered under the stem without passing through the glossary rewriter. Shared drawing helpers in `public/chem/pe/pe-figures.js`, loaded before the data files.
- Completion receipt with a check code (a SHA-256 hash whose key ships in the page, so it catches hand edits but is not proof), printed verification URL and a QR code to the verifier, sized for one A4 page. Seals from 2026-11 on also cover the per-skill level string (`levels=` in the URL); `verify.html` checks old seals without it.
- `verify.html` (Receipt Check) never shows the expected code, and escapes everything it prints. Names from `?name=` and saved receipts are escaped in `pe-engine.js` too; `peScoring.test.ts` guards both, plus banned register in the engine and verifier copy.
- Tap-to-define glossary (`public/chem/assets/glossary.js`) and Unicode formula typography.
- Which banks have had the Tier 3 voice and scope pass is tracked in `docs/textbook/CHANGELOG.md`.

### XL Chem quantitative practice (`/chem/xl/practice/`)
**Paths:** `public/chem/xl/practice/index.html`, one page and script per unit (`public/chem/xl/practice/unit1.html`, `public/chem/xl/practice/unit1.js` onward), `public/chem/xl/practice/smart-parser.js`, `public/chem/xl/practice/xl-practice.css`, `public/chem/xl/practice/verify.html`
**Deployments:** Chemistry dashboard, `components/TeachersView.tsx`, `components/OpenResourcesView.tsx`.
**Features:** No AI and no sign-in. A seeded PRNG keyed by the student's name gives each student stable, individual numbers. A keystroke parser for scientific notation and units with live KaTeX preview; ranking widget (drag-and-drop plus arrow buttons); periodic table drawer; draggable mini-calculator; attempt tracking; shuffled options per student; one-page A4 receipt with a check code (catches hand edits, not proof) and QR to the Receipt Check page, which never shows the expected code and escapes the name; light and dark themes.

### Chemistry Diagram Generator (`/chem/diagram-generator/`)
**Paths:** `public/chem/diagram-generator/index.html`, `public/chem/diagram-generator/app.js`, `public/chem/diagram-generator/app.css`, `public/chem/diagram-generator/elements.js`, `public/chem/diagram-generator/export-diagrams.html`
**Features:** Teacher tool for energy-bar (LOL) diagrams, phase motion diagrams in the classroom convention, reaction coordinate profiles with an optional catalysed path, and nuclear equations.

---

## 10. Tooling and guards

- **Diagram linter** (`scripts/verify_diagrams.mjs`, also `npm run verify:diagrams`): no em-dashes, no raw hex fills or strokes, token font sizes only, no green-on-green badges, no long prose inside SVG `<text>`. First step of `npm run verify`.
- **Drift guards** (`services/__tests__/sourceOfTruth.test.ts`, `services/__tests__/docsIntegrity.test.ts`): listed in [docs/DRIFT_GUARDS.md](docs/DRIFT_GUARDS.md).
- **Design-token guard** (`services/__tests__/designTokens.test.ts`) and CSS-token guard (`services/__tests__/chemCssTokens.test.ts`).
- **Push gate:** `npm run preflight` (`scripts/preflight/preflight.sh`). See CLAUDE.md "Deploy & Runtime Safety".
- **Smoke suites:** `tests/smoke/app.smoke.ts`, `tests/smoke/textbook.smoke.ts`.
