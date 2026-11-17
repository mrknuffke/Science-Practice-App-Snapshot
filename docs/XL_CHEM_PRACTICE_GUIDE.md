# Accelerated Chemistry (XL Chem) Practice Suite: Development Guide

This document establishes the authoritative architectural blueprint, pedagogical standards, and design invariants for developing quantitative practice suites across Accelerated Chemistry (XL Chem) units (Unit 1: Atomic Structure, Unit 2: Chemical Bonding, Unit 3: Stoichiometry, etc.).

---

## 1. Architectural Principles & Invariants

1. **Zero-AI & Zero-OAuth Runtime:**
   * Practice suites are 100% deterministic, self-contained, and open-access.
   * No login gates, no Google OAuth, and no generative AI dependencies.
   * Runs natively in any browser with instant load times and complete air-gapping from third-party APIs.

2. **Seeded PRNG Individualization:**
   * Problem parameters are generated deterministically using a 32-bit PRNG (`mulberry32`) initialized with a `cyrb53` hash of the student's name.
   * Students working side-by-side receive distinct numerical values, isotope systems, wavelengths, and shuffled answer choices.
   * Entering the same name restores the exact problem deck and answers via `localStorage`.

3. **Strict Zero Em-Dashes Invariant:**
   * Never use em-dashes (`—` or `&mdash;`) in site prose, SVGs, worked solutions, hints, code strings, or comments.
   * Use commas, colons, parentheses, or direct declarative sentence structure instead.

4. **Single-Page A4 Matrix Receipt Standard:**
   * Final certified study guide and receipt must print cleanly on **exactly one page** (A4 or Letter portrait).
   * Uses a compact summary matrix table (`.print-matrix-table`) displaying Problem #, Skill, Parameters, Submitted Response, Tries, and Status.
   * Includes client-side SHA-256 digital authenticity seal and an instant vector QR code linking to `verify.html`.

---

## 2. Pedagogical Taxonomy & Deck Structure

1. **8 Skills × 2 Modalities Rule:**
   * Target approximately 8 core curricular skills per unit, assessing each skill twice using two distinct modalities.
   * Total deck length should stay concise: **16 to 24 items maximum**. Shorter, high-retention problem sets are preferred over lengthy, fatiguing sets.

2. **Multimodal Assessment Variety:**
   * **Calculations:** Smart notation parsing (`5.79 x 10^14 Hz`, `EE`) with split-box toggle fallback.
   * **Structured Grids:** Multi-input subatomic tables or stoichiometry calculation matrices.
   * **Inline Visuals:** Vector SVGs for particle models, mass spec readouts, molecular geometries, or potential energy curves.
   * **Interactive Sorting:** Reorderable ranking cards with synchronized drag-and-drop and up/down arrow buttons.
   * **Multiple Choice Questions (MCQs):** Conceptual reasoning, historical experiments, and comparative trend evaluations.

---

## 3. Multiple Choice Question (MCQ) Distractor Standards

To ensure valid assessment and prevent test-wiseness gaming, all MCQs must follow these three invariants:

### A. Dynamic Position Shuffling
Options must always be shuffled using the seeded PRNG:
```javascript
const options = rng.shuffle([item.correct, ...item.distractors]);
```
The correct answer must never be locked to a fixed position (A, B, C, or D).

### B. The Anti-"Longest Answer" Invariant
A well-known student test-taking heuristic is guessing the longest or most detailed option. To eliminate this bias:
1. Distractors must be written with the same grammatical structure, scientific depth, and vocabulary precision as the correct answer.
2. In every pool, ensure that distractors are frequently **equal in length or deliberately longer** than the correct answer.
3. The correct answer should frequently be the shortest or median option among the choices.

### C. Authentic Chemistry Misconceptions
Distractors must never be silly filler or obvious giveaways. They must embody genuine student misconceptions, such as:
* Confusing effective nuclear charge ($Z_{\text{eff}}$) with total proton count.
* Assuming average atomic mass is an unweighted arithmetic median.
* Assuming heavier isotopes or larger atoms dominate reaction rates.
* Reversing period vs. group periodic trends.

---

## 4. Scaffolded Attempt Feedback Protocol

Every problem features a structured, tiered feedback system tailored to problem complexity:
* **Conceptual & Multiple Choice Items:** Capped at **3 attempts** to prevent brute-force guessing.
* **Quantitative Multi-Step Calculations:** Granted **5 attempts** with dynamic progress dot tracking to give students space to diagnose arithmetic, scientific notation, and unit conversion slips without penalty exhaustion.

### Feedback Progression
1. **Early Attempts Missed:** Diagnostic clue checking for common errors (units, power-of-10 conversion slips, sig figs).
2. **Intermediate Attempts Missed:** Formula setup clue showing rearranged equations and key variables.
3. **Final Attempt Missed (Exhausted):** Input locks as exhausted, and the complete step-by-step mathematical worked solution is revealed.
4. **Attempt Metrics:** Real-time counter tracks how many problems were solved on Try 1, Try 2, Try 3, Try 4, Try 5, or exhausted. This breakdown and the 8-Skill Curriculum Mastery Scorecard are prominently printed on the final receipt.

---

## 5. Reference Center & Built-In Scientific Tools

Each unit suite provides two persistent study tools in the topbar:
1. **Slide-Out Reference Drawer:**
   * **Tab 1: Interactive Periodic Table:** 18-column grid ($Z = 1$ to $36$) with clickable Element Inspector Cards, live concentric Bohr model SVGs, 3d transition metal toggles, and property heatmaps (Radius, IE, Electronegativity).
   * **Tab 2: Unit Formulas & Constants:** Formatted tables of physical constants, equations, conversions, and reference data.
2. **Draggable Scientific Mini-Calculator:**
   * Floating tool with scientific notation (`EE`), exponents (`xʸ`), square roots (`√`), and parentheses.
   * Smooth vertical dragging via Pointer Events clamped along the right sidebar so it never obstructs question prompts.
3. **Light/Dark Mode Toggle:**
   * Toggles `theme-light` and `theme-dark` classes across both `document.documentElement` and `document.body`.
   * All components consume semantic CSS variables (`--xl-bg`, `--xl-surface`, `--xl-card`, `--xl-ink`, `--xl-primary`).

---

## 6. Verification & Mobile Instructor Scan

1. **Digital Hash Generation:**
   ```javascript
   const message = `${studentName}:${seed}:${score}:${total}:${timestamp}:${secretSalt}`;
   const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
   ```
2. **QR Code Verification:**
   * Scannable QR code on the receipt opens `/chem/xl/practice/verify.html`.
   * `verify.html` validates the digital hash against the parameters.
   * Upon verification, it renders the student's certified score, attempt distribution, and reconstructs their exact problem parameters for spot-checking.

---

## 7. Checklist for Authoring New Units (e.g. Unit 2, Unit 3)

When building the next unit practice suite:
- [ ] Establish 8 core skills with 2 distinct assessment modalities each (16 items total).
- [ ] Define scenario pools with at least 3-5 variations per skill.
- [ ] Write balanced MCQ distractors adhering to the Anti-"Longest Answer" Invariant.
- [ ] Implement smart input parsing for all quantitative calculations.
- [ ] Provide two diagnostic hints and a full step-by-step worked solution for every problem.
- [ ] Populate unit-specific constants and reference tables in the drawer.
- [ ] Verify that the single-page A4 print layout does not overflow to page 2.
- [ ] Run `npm run verify` to ensure clean compilation, zero lint warnings, and passing smoke tests.
- [ ] Verify strict zero em-dashes across all files.
