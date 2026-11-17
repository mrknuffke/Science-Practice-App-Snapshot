# Learning Mode Reference & User Guide

This document provides a comprehensive overview of all available modes in **Science Practice Partner**, detailing their specific features, user flows, and intended capabilities.

## 🔓 Access Levels

**Science Practice Partner** offers three primary access tiers:
- **AI-Powered Tools** (🔐 require Google Workspace sign-in): Practice Session, Written Response, Lab Co-Pilot, Smart Scanner, etc.
- **Free Interactive Simulations** (🌐 public access): Periodic Table, Covalent Bonding, Ionic Bonding, Build an Atom, Free Body Diagrams, Biological Systems Modeler, Particle Phase Change, Ideal Gas Laws, Reaction Kinetics, Cell Membrane Transport, Ecosystem Balance, Population Genetics, Motion Tracker, Thermal & Thermochemistry Studio, Arterial Blood Buffers, Nuclear Decay & Dating (the full list is `SIMULATIONS_REGISTRY` in `constants/simulationsRegistry.ts`)
- **Free Interactive Course Texts** (🌐 public access): SAS General Chemistry (`/chem/`), SAS General Physics (`/physics/`) and SAS General Biology (`/bio/`), all on the shared runtime in `public/textbook/`: retrieval-practice widgets, a reference drawer, spaced-repetition review, and embedded simulations. Lesson lists are each book's `lessons.json`.

Authenticated users access AI tools via the internal dashboard (`LandingPage.tsx`), while public users see the split-screen public landing page (`PublicLandingPage.tsx`).

## 📐 Design & Governance
Before starting work, consult these standards:
*   [**🎨 UX & Design Checklist**](./UX_DESIGN_CHECKLIST.md) (Audit existing modes)
*   [**🧩 New Mode Criteria**](./NEW_MODE_CRITERIA.md) (Plan new modes)
*   [**➕ Feature Addition Checklist**](./FEATURE_ADDITION_CHECKLIST.md) (Update existing modes)
*   [**🚀 Release Checklist**](./RELEASE_CHECKLIST.md) (Pre-commit steps)

## 🧩 Feature Matrix

| Mode | Target User | Multi-Topic? | Session History? | Uploads? | TTS? | Dictation? | Simplify? | Refresh? | Easier/Harder? | Configurable? | Output |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Advanced Study Buddy** | Student | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (Course/Level) | Socratic Dialogue |
| **Calculation Partner** | Student | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | Interactive Math Chat |
| **Concept Map Builder** | Student | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (Reset) | ❌ | ✅ (Presets) | Interactive Web + Report |
| **Data Analysis (CER)** | Student | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (Diff) | Scored CER Response |
| **Practice Session** | Student | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ (Replace) | ✅ | ✅ (Diff) | Adaptive Quiz (MCQ) |
| **Written Response (FRQ)** | Student | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (Diff) | Scored Short Answer |
| **Explanation Partner** | Student | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | Socratic Dialogue |
| **Flashcards** | Student | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | Digital Flashcards |
| **Smart Scanner** | Student | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (Config) | Quiz / Note Sheet |
| **Lab Co-Pilot** | Student | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Project Analysis / Reports |
| **Study Sprint** (BETA) | Student | ✅ | ❌ | ❌ | ⚙️ | ⚙️ | ⚙️ | ❌ | ❌ | ✅ | PDF Report + Practice |
| **Document Creator** | Teacher | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (Deep) | Printable PDF |
| **Interview Script** | Teacher | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | Verbal Exam Script |
| **Rubric Translator** | Teacher | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Student Checklist |
| **Review Games** | Teacher | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | Interactive Review Board |
| **Reflection Prompter** | Teacher | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (Structure) | Printable Prompt Sheet |
| **Periodic Table** (SIM) | Student | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Interactive Explorer |
| **Covalent Bonding** (SIM) | Student | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Molecule Builder |
| **Ionic Bonding** (SIM) | Student | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Compound Visualizer |
| **Build an Atom** (SIM) | Student | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Bohr Atom Sandbox |
| **Free Body Diagrams** (SIM) | Student/Teacher | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | FBD Builder + Practice |
| **Biological Systems Modeler** (SIM) | Student | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Regulatory Network |
| **Particle Phase Change** (SIM) | Student | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Particle Simulation |
| **Ideal Gas Laws** (SIM) | Student | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Gas Particle Simulation |
| **Reaction Kinetics** (SIM) | Student | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Collision/Enzyme Sim |
| **Cell Membrane Transport** (SIM) | Student | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Diffusion/Transport Sim |
| **Ecosystem Balance** (SIM) | Student | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Predator-Prey Sim |
| **Population Genetics** (SIM) | Student | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Hardy-Weinberg Sim |
| **Motion Tracker** (SIM) | Student | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Kinematics Tracker |
| **Thermal & Thermochemistry Studio** (SIM) | Student | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Calorimetry Sandbox |
| **Arterial Blood Buffers** (SIM) | Student | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Homeostasis Buffer Sim |
| **Nuclear Decay** (SIM) | Student | N/A | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | Radiometric Dating Sim |

_Note: ⚙️ indicates features inherited from sub-modes (Study Sprint launches quiz/FRQ/CER/worksheet tasks)_
_Note: (SIM) indicates interactive simulations - different feature set from practice modes_

---

## 🆕 Global Features (March 2026)

### Multi-Topic Practice Sessions
Modes marked with ✅ in the "Multi-Topic?" column now support combining multiple topics into a single practice session. This enables:

- **Practice Whole Unit:** One-click button to generate questions covering all topics in a specific unit (perfect for unit reviews and test prep)
- **Custom Topic Mix:** Specify multiple topics using comma-separated input (e.g., "Photosynthesis, Cellular Respiration, Calvin Cycle")
- **Even Distribution:** AI generates questions that cover ALL selected topics evenly
- **Topic Labeling:** Each question is labeled with its primary topic for clarity

**Supported Modes:** Practice Session (Quiz), Written Response (FRQ), Data Analysis (CER), Flashcards, Document Creator (Worksheets), Study Sprint

### Session History
Modes marked with ✅ in the "Session History?" column automatically save completed sessions for later review. Features include:

- **Automatic Saving:** All practice sessions are saved to browser localStorage upon completion
- **Full Session Review:** Access complete questions, your original answers, and all detailed feedback
- **Color-Coded Navigation:** Question navigator with green (correct), red (incorrect), and amber (partial credit) indicators
- **Filter & Search:** Filter by mode type, search by topic or course name, sort by date or score
- **Storage Management:** Automatically maintains up to 50 sessions with intelligent pruning to stay within browser storage limits
- **Trophy Room Integration:** Click any badge in the Trophy Room to review the full session that earned it

**Access:** Click the History button (📜) on the landing page to view all saved sessions.

**Supported Modes:** Practice Session (Quiz), Written Response (FRQ), Data Analysis (CER), Flashcards

---

## 🎯 Student Tools: Practice & Assess

### 0. Advanced Study Buddy (AP & IB)
**Curriculum-Aligned Socratic Tutor.** Deep-dive review sessions aligned to AP Course & Exam Descriptions or IB syllabi.
-   **Courses Supported:**
    - Every course in `COURSES` (`constants/apCourses.ts`), grouped by `curriculumType`.
    - **AP:** All major AP sciences, math, humanities, languages, and CS
    - **IB:** Biology SL/HL, Chemistry SL/HL, Physics SL/HL, Environmental Systems & Societies SL/HL
-   **Catalog:** Grouped by curriculum track (AP / IB) with subject sub-headers inside AP. Star/pin any course for quick access.
-   **AI Tutor Modes:** Chat (Socratic dialogue) and Practice (MCQ + IB CRQ generation)
-   **AP Mode:** Stimulus-based questions, CED unit scope, AP scoring rubrics
-   **IB Mode:** Command-term questions (State / Describe / Explain / Evaluate), IB Assessment Criteria Marks 1–4
-   **Grading:** Grader receives exact option list and correct answer for every MCQ — no hallucinated distractor analysis
-   **Pinning:** Star any course from the catalog; pinned courses appear in a "Pinned" quick-access section
-   **Search:** Live filter across all AP and IB courses simultaneously

### 1. Calculation Partner
**Math & Physics Solver.** Step-by-step guidance through complex calculations.
-   **Features:** Built-in floating Desmos scientific calculator. LaTeX rendering for formulas, "Hint" based progression. **Export** session to Markdown or PDF.
-   **Gradual Release of Responsibility**: Dynamic 3-tier support progression (Level 1 Guided step-by-step → Level 2 Coached chunking → Level 3 Independent student-led execution with metacognitive verification).
-   **Flow:** Choose Topic -> AI presents a problem -> Student attempts steps -> AI checks work.

### 2. Data Analysis (CER)
**Scientific Reasoning.** Practice constructing Claim-Evidence-Reasoning arguments from data.
-   **Features:** Generates unique "Confidential Dossier" with datasets (tables/graphs). **Refresh** to generate new data.
-   **Rubric & Model Diff Grader:** Criterion-by-criterion rubric alignment checklist (Claim, Evidence citation, Scientific Reasoning) with status pills, side-by-side exemplar comparison, and actionable sentence revision upgrade suggestions (`RubricDiffViewer.tsx`).
-   **Tools:** Dictation support. Simplify/TTS for scenarios.
-   **Flow:** View Data -> Write Claim -> Write Evidence -> Write Reasoning -> Get AI Score (1-5 Rubric).

### 3. Practice Session
**Adaptive Quizzing.** The core adaptive multiple-choice experience.
-   **Features:** Text-to-Speech, "Simplify" text, "Easier/Harder" dynamic adjustment.
-   **Accessibility:** Full keyboard support (`A`/`B`/`C`/`D`).

### 4. Written Response (FRQ)
**Short Answer Simulator.** Drills concise scientific writing.
-   **Features:** Strict word-count monitoring. **Refresh** to get a new question.
-   **Rubric & Model Diff Grader:** Sub-part criteria breakdown with points, side-by-side exemplar comparison, and concrete sentence revision upgrade suggestions (`RubricDiffViewer.tsx`).
-   **Tools:** Dictation support. Simplify/TTS for prompts. Timer (Anxiety Mode).
-   **Flow:** Prompt -> Write Response -> AI highlights missed concepts vs. rubric.

---

## 🧠 Student Tools: Study & Review

### 5. Concept Map Builder
**Relational Knowledge Web.** Interactive node-and-edge concept builder where students connect scientific terms with directional propositions and receive semantic evaluation.
-   **Features:**
    - **Interactive Infinite Canvas:** Draggable concept cards, directed SVG arrows, and inline linking phrase badges.
    - **Canonical Topic Presets:** Curated offline concept sets for AP Biology (Cellular Energy, Central Dogma), Chemistry (Chemical Bonding), Physics (Classical Mechanics), and Environmental Science (Trophic Ecology).
    - **Proposition Evaluator:** Audits directed propositions (Concept A -> linking verb -> Concept B) against pedagogical canonical rules and Gemini semantic analysis. Flags backwards or inverted causality vectors as misconceptions.
    - **Circle Auto-Layout:** One-click equidistant layout arrangement to untangle complex relational webs.
    - **Exports:** Download full Markdown study reports with embedded Mermaid diagram code or copy raw Mermaid definitions directly.
-   **Flow:** Select Topic Preset or add custom concepts -> Drag connection pins between nodes -> Select or type linking phrases -> Click "Evaluate Web" for mastery score and feedback -> Export Markdown report.

### 6. Explanation Partner
**Socratic Tutor.** A conversational mode that tests deep understanding.
-   **Features:** Continuous conversation history. AI asks follow-up questions ("Why do you think that?").
-   **Gradual Release of Responsibility**: Dynamic 3-tier support progression (Level 1 Guided Socratic questions → Level 2 Coached feedback → Level 3 Independent student-led explanations with metacognitive checks).
-   **Tools:** Dictation input. Voice output (TTS).
-   **Goal:** Reach a point of "Mastery" where the AI awards a badge.

### 6. Flashcards
**Rapid Recall & Spaced Repetition.** High-retention flashcard study system.
-   **Leitner 5-Box SRS Engine:** Pure 5-box spaced repetition system (`srsEngine.ts`: 1d → 3d → 7d → 14d → 30d), live 5-box distribution HUD (`LeitnerBoxBar.tsx`), interactive Cloze fill-in-the-blank typing with fuzzy checking (`ClozeCardContent.tsx`), front-face active recall MCQ/TF selection, study mode filters (All, Due, Cram, Match), and local saved decks library (`SavedDecksModal.tsx`).
-   **Tools:** TTS and Simplify available on cards. Ergonomic keyboard hotkeys (`Space`, `←`/`1`, `→`/`2`, `A`/`B`/`C`/`D`).

### 7. Smart Scanner (Quiz My Notes)
**Content Generator.** Turns *your* specific notes into study tools.
-   **Context:** Upload PDF/Images/Text (Max 5 files).
-   **Outputs:**
    *   **Quiz Mode:** Generates MCQ based *only* on context. Configurable difficulty/count *before* start.
    *   **Note Sheet:** Creates an "Active Recall" summary sheet.

### 8. Study Sprint (BETA)
**Comprehensive Review Session.** Multi-mode study session with AI-curated tasks and complete PDF transcript.
-   **Features:**
    *   AI recommends 3 diverse practice tasks (Quiz, FRQ, CER, Worksheet)
    *   Free-choice completion order (task board pattern)
    *   Progress tracking with visual indicators
    *   Full session transcript with all Q&A, feedback, and scores
    *   Targeted bonus practice materials based on weak areas
    *   Downloadable PDF report with answer key
-   **Flow:** Enter topics → Review AI recommendations → Swap/edit tasks → Complete in any order → Generate comprehensive report
-   **Persistence:** Session state saved in localStorage, resume anytime
-   **Inherited Features:** Each task inherits features from its mode (TTS, Simplify, Dictation available within sub-tasks)
-   **Status:** Beta - testing data capture and report generation

---

## 🧬 Student Tools: Lab & Research

### 9. Lab Co-Pilot
**The Research Assistant.** A multi-track tool for real-world experimentation.
-   **Tracks:**
    *   **Experimental Design:** Brainstorm variables and controls.
    *   **Data Analysis:** Manual entry or CSV upload for stats.
    *   **Report Feedback:** Critique your lab report / CER.
    *   **Error Analysis:** Troubleshoot anomalies.
    *   **Research Mentor:** Long-term project guidance.
    *   **Safety Check:** Hazard review.
-   **Memory:** "Project Context" persists across sessions. Can be auto-filled from uploaded files.
-   **Visuals:** Generates decision trees/flowcharts (Mermaid).

---

## 🏫 Teacher Tools

### 10. Document Creator
**Worksheet Builder.** Generates high-quality, printable resources.
-   **Types:** Worksheets (Mixed), Data Analysis (CER), Written Response (FRQ), Problem Sets (Math), Exit Tickets.
-   **Beta:** Test Creator (Build comprehensive exams).
-   **Output:** Browser-native print styling for clean PDFs.

### 11. Interview Script
**Verbal Assessment.** Generates scripts for teacher-student grading conferences.
-   **Output:** 3-4 standard questions + "Look fors" (Rubric) + Common Misconceptions.
-   **Format:** Printable script with scoring space.

### 12. Rubric Translator
**Scaffolding Tool.** Converts dense official standards (NGSS/AP) into student-friendly checklists.
-   **Flow:** Paste Official Standard -> AI simplifies language -> Generates "I can..." statements.

### 13. Review Games (Science Jeopardy)
**Classroom Review.** Interactive, gamified whole-class review sessions.
-   **Features:** Customizable Jeopardy-style board generation. Daily Doubles, Final Jeopardy, and Scoring. Data-rich clues with charts & tables.
-   **Tools:** Teacher Preview (View answers), Library (Save boards), Timer, Manual Score Adjustment, Team Renaming.
-   **Modes:** Standard (Q&A) or Classic (Clue/Response) with Winning Animations.

### 14. Square Match Puzzle
**Printable Matching Activity.** Creates Tarsia-style cut-out puzzles for hands-on review.
-   **Grid Sizes:** 3x3 (12 pairs), 4x4 (24 pairs), 5x5 (40 pairs).
-   **Difficulty Levels:** Easy (blank outer edges), Medium (filler text edges), Hard (distractor edges).
-   **Features:** AI-generated term/match pairs from selected Course/Topic, editable pair list, A4-optimized print layout.
-   **Output:** PDF with scrambled puzzle page and answer key page.

### 15. Who Am I? Review Game
**20-Questions Style Guessing Game.** Project clues to the whole class to guess science concepts, elements, or scientists.
-   **Setup:** Puzzle count (3/5/8/10), difficulty mix (Easier/Mixed/Harder), silliness slider, optional source material (PDF + paste). Recent topics chips for one-click reuse. Load from Library jumps straight to preview.
-   **Preview / Edit:** Per-puzzle AI Revise (notes-driven), Regenerate (whole puzzle), Regenerate All (full deck), Delete, Add Puzzle (AI). Per-clue Regenerate, Delete (min 2), Add Clue (AI, max 7). Inline edit for entity and clues. Save/Load/Share library via storageService.
-   **Presentation (game view):** Manually reveal clues one at a time. Once ≥2 clues are revealed, the display automatically cycles focus through them with a dwell timer scaled to reading length (5–12s). Speed pill (Slow/Medium/Fast) in header, persisted to `sp_whoami_scroll_speed`. Pause/Resume control. Click any revealed clue to manually focus it. Progress dots for puzzle navigation. Reset Session button.
-   **Keyboard shortcuts:** Space = reveal next clue / answer; →/N = next puzzle; ←/B = prev; P = pause auto-scroll; Esc = exit.
-   **Export:** Download PDF review sheet (jsPDF) from the game header.

### 16. Bingo Generator (Review Games)
**Printable Review Boards.** Create randomized BINGO boards for students with an accompanying calling script.
-   **Features:** Standard pre-coded topic dictionaries (Lab Equipment, Cells, Elements) or AI-generated custom term lists.
-   **Configuration:** Flexible number of unique boards, optional Free Space.
-   **Output:** Responsive print views mimicking A4 format (1-per-page or vertically-split 2-per-page) plus a teacher guide holding 3 distinct clues (Definition, Example, Fill-in-the-Blank) per term.
-   **Authoring:** Per-term AI Revise (notes-driven), single Regenerate (dedup-aware), inline edit, delete, manual add — same teacher-authoring shape as Jeopardy.

### 17. Charades & Pictionary Generator (Review Games)
**Dual-Mode Performance Cards.** AI-generated cards for either Charades (act it out) or Pictionary (draw it). Mode is chosen at setup and saved on the deck.
-   **Card Shape:** Term + category + difficulty pill (easy/medium/hard) + optional one-line player hint.
-   **Configuration:** Game mode (Charades / Pictionary), topic, course, grade level, card count (10/20/30/40), difficulty mix (easy-skewed / mixed / hard-skewed). The AI prompt branches on mode — Charades favors physically-actable terms, Pictionary favors drawable terms with canonical textbook diagrams.
-   **Authoring:** Per-card AI Revise (notes-driven), single Regenerate (dedup-aware), inline edit, delete, manual add. Decks save to a personal library (`sp_charades_lib_v1`).
-   **Output:** Printable card grid (6 per page) or live in-app play with team scoring, configurable round timer (30/60/90/120s), Pause and End Round Early controls, and keyboard shortcuts (Space = correct, S = skip).
-   **End-of-Round Review:** When a round ends, a per-card log is shown with toggle buttons (Correct / Skip / remove). Edits recompute the team's score live; "Confirm & Next Team" commits the delta.

### 18. Taboo Generator (Review Games)
**Forbidden-Word Cards.** AI-generated science Taboo cards for printable or live in-class play.
-   **Card Shape:** Target term + category + 3–7 forbidden words (configurable per deck via slider).
-   **Authoring:** Per-card AI Revise (notes-driven), single Regenerate (dedup-aware), inline edit (term, category, individual forbidden words), delete, manual add. Decks save to a personal library (`sp_taboo_lib_v1`).
-   **Forbidden-Word Quality:** AI prompt explicitly enforces morphological variants of the term plus most-obvious-clue synonyms; schema enforces exact `forbiddenCount` so the deck is consistent.
-   **Output:** Printable card grid (4 per page, classic red-bordered Taboo styling) or live in-app play with team scoring, foul calls, optional skip-penalty, configurable round timer, Pause and End Round Early controls, and keyboard shortcuts (Space = correct, F = foul, S = skip).
-   **End-of-Round Review:** Per-card log with toggle buttons (Correct +1 / Foul −1 / Skip / remove). Score recomputes live; "Confirm & Next Team" commits the delta.

### 19. Reflection Prompter
**Metacognition Scaffold Generator.** Generates student-facing reflection prompt sheets for six core metacognitive structures.
-   **Structures:** Learning Journal, Exit Ticket, I Used to Think / Now I Think, 3-2-1, Plus/Delta, Scientific Metacognition.
-   **Output:** Printable prompt sheet with sentence starters, writing lines, ELL sentence frames, and a teacher debrief note.
-   **Access:** Accessible from Teacher Tools, and directly via `/?page=reflection` (no password required).
-   **AI Service:** `getReflectionPrompts()` in `services/ai/documents.ts`.

---

## 🧪 Interactive Simulations

**Note:** As of March 2026, all simulations are accessed through a centralized **Simulations Hub** on the landing page. Individual simulation cards have been replaced with a single "Interactive Simulations" card that launches the hub.

### 18. Interactive Periodic Table (BETA - March 2026)
**Explore Element Properties & Periodic Trends.** Interactive visualization of all 118 elements with comprehensive data and filtering capabilities. Inspired by periodex.co and ptable.com.

**Features:**
- **Search Function:** Find elements instantly by name, symbol, or atomic number
- **Multiple View Modes:**
  - **Standard Mode:** Traditional periodic table with category color-coding
  - **Temperature Mode:** Interactive temperature slider (0-6000K) shows element states at different temperatures
  - **Property Mode:** Visualize periodic trends with heat maps for atomic radius, electronegativity, ionization energy, and density
- **Element Comparison:** Select two elements side-by-side to compare properties with percentage differences
- **Interactive Exploration:**
  - Hover over elements to see quick info (symbol, name, atomic number, state)
  - Click elements to view comprehensive details modal
  - Filter by metals, nonmetals, metalloids, or physical state (solid/liquid/gas)
- **Comprehensive Element Data:**
  - Atomic mass, electron configuration, electronegativity
  - Ionization energy, atomic radius, density
  - Melting/boiling points, oxidation states
  - Discovery year and element category
- **Element Detail Modal Tabs:** Bohr Model, Lewis Dot Diagram, and **Spectra** (visible-light emission/absorption strips, 380–700 nm, NIST Atomic Spectra Database data for 97 elements, capped at each element's 25 strongest lines; hover any line for its wavelength)
- **Temperature Visualization:**
  - Real-time state changes as temperature slider adjusts
  - Color-coded by state: Blue (solid), Orange (liquid), Red (gas)
  - Displays temperature in Kelvin, Celsius, and Fahrenheit

**UI/UX:**
- Color-coded by element category (alkali metals, halogens, noble gases, etc.) in standard mode
- Responsive grid layout optimized for desktop and tablets
- Legend toggle to show/hide category color guide
- Clean modal design for detailed element information
- Search bar for quick element lookup

**Status:** BETA (March 2026)

**Access:** Simulations Hub → Interactive Periodic Table

---

### 19. Covalent Bonding Simulator (BETA v0.3)
**Molecule Builder with Lewis Structures.** Build molecules atom-by-atom, create covalent bonds, assign lone pairs, and visualize molecular geometry with drag-and-drop interface.

**Features:**
- **Atom Placement:** Drag-and-drop atoms (H, C, N, O, F, Cl) onto canvas with automatic circular positioning
- **Bond Creation:** Click two atoms to select, then choose bond type (single/double/triple) from toolbar
- **Bond Breaking:** Click bond lines to select, then use "Break Bond" button to remove bonds
- **Lone Pair Assignment:** Automatically assigned when bonds are created or broken
- **Preset Molecules:** Quick-load library with 12+ common molecules organized by difficulty (Beginner/Intermediate/Advanced)
- **Validation Engine:**
  - Real-time octet rule checking for each atom
  - Electron count verification with visual feedback (green = satisfied, amber = partial, gray = none)
  - Molecular geometry calculation (VSEPR)
  - Polarity determination
  - Course-aware validation (expanded octet support for AP Chemistry)
- **Visualizations:**
  - **Builder Mode:** Interactive drag-and-drop canvas with visual bond lines, atom status badges
  - **Lewis Diagram Mode:** Dot-cross diagrams with color-coded electrons (bonding vs lone pairs)
  - Molecular formula generation with subscripts (Hill notation)
  - Geometry labels (linear, bent, tetrahedral, trigonal planar, trigonal pyramidal, etc.)
  - Formal charge calculations and molar mass display

**Difficulty:** Intermediate

**Topics Covered:** Lewis Structures, Molecular Geometry, VSEPR Theory, Polarity, Bonding Electrons vs Lone Pairs, Formal Charge, Electron Apportionment

**Status:** BETA v0.3 (updated March 2026) - Near production-ready

**Access:** Simulations Hub → Covalent Bonding

**Technical Notes:**
- Uses `@dnd-kit/core` for drag-and-drop interactions
- Molecule engine (`moleculeEngine.ts`) handles bond logic and validation
- Formula engine (`formulaEngine.ts`) generates chemical formulas with Unicode subscripts

---

### 20. Ionic Bonding Builder (BETA)
**Interactive Compound Formation.** Build ionic compounds atom-by-atom. Observe electron transfer from cations to anions and balance charges to form stable structures.

**Features:**
- **Atom Placement:** Select metals (cations) and nonmetals (anions) to add to the canvas.
- **Electron Transfer Animation:** Click a metal then a nonmetal to animate the transfer of a valence electron.
- **Lewis Dot Diagrams:** Atoms are rendered as Lewis dot diagrams with dots (cations) and crosses (anions).
- **Ion Visualization:** Ions automatically get square brackets and charge labels once they lose or gain electrons.
- **Charge Balance Validation:** Real-time monitoring of net charge and octet status.
- **Compound Identification:** Automatically generates chemical formula and IUPAC name once a neutral, stable compound is formed.
- **Variable Oxidation States:** Support for transition metals like Iron (Fe) and Copper (Cu).

**Difficulty:** Intermediate

**Topics Covered:** Ionic Bonding, Electron Transfer, Valence Electrons, Octet Rule, Charge Neutrality, Chemical Formulas, IUPAC Naming.

**Status:** BETA (Updated March 2026)

**Access:** Simulations Hub → Ionic Bonding Builder

---

### 21. Build an Atom Bohr Sandbox (STABLE)
**Interactive Bohr Shell Sandbox & Isotope Stability Explorer.** Build stable or radioactive atoms and ions nucleon-by-nucleon using an animated concentric-shell interface.

**Features:**
- **Nucleon Bins:** Click buttons to add or remove Protons (+), Neutrons (0), and Electrons (-) dynamically.
- **Golden Spiral Core:** Nucleons cluster dynamically inside the nucleus using an elegant Fibonacci spiral distribution.
- **Nuclear Stability Physics:** Includes an active stability engine. If the neutron-proton ratio is radioactive or highly unstable (e.g. Carbon-14, Hydrogen-3, Beryllium-8), the nucleus triggers an active shaking animation (`animate-shake`).
- **Live Dial Instruments:** Displays real-time calculations for:
  - **Mass Number (A = P+N):** Illustrated on a color-coded gauge.
  - **Net Charge (P-e):** Illustrated on a sliding scale pointing to Anions (-), Neutral atoms (0), or Cations (+).
- **Range:** Supports elements Hydrogen through Argon (Z 1–18), with per-element nuclear stability rules for each.
- **Clickable Miniature Periodic Table:** A 3-row element highlight grid (H to Ar). Clicking any element autocompletes its most-abundant stable isotope nucleon recipe.
- **Clickable Element Detail Popup:** Click the Active Element Card to open a periodic-table-style detail modal (properties list + Bohr Model / Lewis Dot / Spectra tabs), reusing the Periodic Table interactive's components and data. The popup also shows the **currently built isotope's natural abundance** (e.g. Chlorine-35 → 75.76%), or a "not naturally occurring" note for synthetic/radioactive mass numbers.
- **Layout:** A compact Mass Number (A) and Net Charge readout sits above the Bohr canvas; the nucleon bins sit directly beneath the canvas, above the detailed Mass/Charge instrument gauges. The Net Charge scale knob is clamped to its track so it never escapes the window at extreme charges.
- **Gamified Challenge Deck:** Play through 8 target challenges (from simple Hydrogen-1 to stable Neon-20) with active verification.
- **Socratic Mascot Advice Panel:** Integrated mascot conversational guide that walks students through concepts of shell configurations (2, 8, 8), isotopes, ion charge, and core forces.

**Difficulty:** Beginner / Intermediate

**Topics Covered:** Bohr Model, Electron Configuration, Shell Filling Rules (2, 8, 8), Isotopes, Nuclear Stability, Mass Number, Net Charge, Ions (Cations/Anions).

**Status:** STABLE (June 2026)

**Access:** Simulations Hub → Build an Atom

---

### Simulations Hub Architecture

**Navigation Flow:**
1. Landing Page → "Interactive Simulations" card → Simulations Hub
2. Simulations Hub → Select simulation → Individual simulation view
3. Individual simulation → Back button → Returns to Simulations Hub
4. Simulations Hub → Back button → Returns to Landing Page

**Design Principles:**
- **Centralized Discovery:** All simulations in one place for easy browsing
- **Status Badges:** All simulations marked as BETA during active development
- **Difficulty Labels:** Beginner, Intermediate, Advanced to guide student selection
- **Topics Preview:** Each card shows key concepts covered
- **Feedback Integration:** Direct link to submit simulation requests via email

**ViewType Routing:**
- `'simulations_hub'` → Main simulations listing page
- `'periodic_table'` → Interactive Periodic Table
- `'covalent_bonding'` → Covalent Bonding Simulator
- `'ionic_bonding'` → Ionic Bonding Simulator

**Future Simulations:**
- Determined by user feedback and educational needs
- Submit requests via Simulations Hub feedback link
