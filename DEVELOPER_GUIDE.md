

# Science Practice Partner: Developer Guide

**Welcome to the engine room!** 

This document explains how your application works under the hood and how you can modify it. You don't need to be a coding expert to make significant changes; you just need to know which file controls what.

---

## 1. The Big Picture

This is a **Single Page Application (SPA)** built with **React**. 
*   **Analogy:** Think of the app like a digital stage play. 
*   **`App.tsx`** is the **Director**. It decides which "Scene" (View) is currently on stage (Landing Page, Quiz, Results, etc.).
*   **`components/`** are the **Sets and Props**. Each file here represents a visual part of the app (a card, a button, a results screen).
*   **`services/ai/`** is the **Phone Line to the Expert**. When the app needs questions or grading, it calls one of these modules, which talks to Google's AI. `core.ts` holds the model ids, the shared `callAI()` wrapper and the per-subject personas; every other file is one feature (`questions.ts`, `frq.ts`, `cer.ts`, `lab.ts`, `grading.ts`, ...).
*   **`services/geminiService.ts`** is **not** where the AI logic lives. It is a 56-line barrel that re-exports `services/ai/*`, kept so the ~19 components importing it did not all have to change at once. Never add logic there.
*   **`constants.ts`** is the **Textbook**. It contains the list of all courses, units, and topics.

---

## 2. Changing the Curriculum (`constants.ts`)

This is the file you will edit most often. It contains the raw data for your subjects.

**How it works:**
The data is stored as simple **text strings** formatted with Markdown headers.
*   `# **Unit Name**` = A Main Idea / Unit.
*   `### **Topic Name**` = A specific topic within that unit.

**How to add a topic:**
1.  Open `constants.ts`.
2.  Find the variable for your subject (e.g., `AP_BIO_DATA`).
3.  Just type a new line: `### **My New Topic**`.
4.  Save. The app automatically updates.

**How to add a whole new subject:**
This requires touching 3 files:
1.  **`types.ts`**: Add the name to `CourseType`.
2.  **`constants.ts`**: Create the data string (copy an existing one) and add it to the `parseQuizData` list at the bottom.
3.  **`services/ai/core.ts`**: Give the AI a "Persona" for this subject (see below).

---

## 3. Changing the AI's Personality (`services/ai/core.ts`)

This file controls the "Brain". It defines how the AI behaves.

**CRITICAL: Model Selection Rules**
When creating new AI functions, you MUST follow these rules:

1. **ALWAYS use `DEFAULT_MODEL`** (currently `"gemini-3.6-flash"`)
   - This is defined in `services/ai/core.ts` and re-exported through the `geminiService.ts` barrel. It is the single source of truth — never hardcode a model string. A drift guard in `services/__tests__/sourceOfTruth.test.ts` fails the build if any source file names a `gemini-*` model.
   - Example: `const response = await callAI(DEFAULT_MODEL, prompt, {...})`
   - One documented exception: `analyzeImage` in `services/jeopardyService.ts` is pinned to `gemini-2.5-pro` because vision work needs the Pro model.

2. **NEVER use experimental models** like `"gemini-2.0-flash-exp"`
   - Experimental models don't support `responseSchema` properly with streaming
   - This causes 500 errors in production on Vercel edge runtime
   - Only use a different model if there's a documented, specific reason

3. **JSON Mode Requires BOTH parameters**:
   ```typescript
   const response = await callAI(DEFAULT_MODEL, prompt, {
     responseMimeType: "application/json",  // Required
     responseSchema: {                       // Also Required!
       type: Type.OBJECT,
       properties: { /* ... */ },
       required: [/* ... */]
     }
   });
   ```
   - Missing `responseSchema` will cause 500 errors
   - Do NOT use `nullable: true` (not supported in edge runtime)
   - Make optional fields optional by excluding from `required` array

**The "Persona" Logic:**
Look for the function `getCourseContext`. This is where we tell the AI who it is.
*   *Example:* If the course is "Elementary School", we tell it: "You are a fun tutor for an 8-year-old. Use emojis."
*   *Example:* If the course is "AP Physics", we tell it: "Use calculus-based reasoning."

**To change how the AI grades:**
1.  Search for `getDiagnosticReport`.
2.  Look for the `prompt` string.
3.  You can edit the English text there. For example, if you want it to stop being so strict about spelling, you could add: *"Do not penalize minor spelling errors."*

**To change how questions are written:**
1.  Search for `getDiverseQuestions`.
2.  Edit the `prompt` text. For example, you could add: *"Ensure every wrong answer is plausible but clearly incorrect."*

---

## 4. Visuals and Layout (`components/`)

The visual elements are broken into small files.

*   **`LandingPage.tsx`**: The first screen users see. Change the title, subtitle, or footer links here.
    *   Mode cards stay in **alphabetical order** within each section. Sections run in this order: Practice & Assess, Study & Review, Lab & Research, Teacher Tools, Interactives. Insert a new mode alphabetically in the right section.
    *   Teacher Tools render only when Teacher Mode is on. The header button toggles it and saves the choice in `localStorage` key `sp_teacher_mode`.
*   **`QuestionCard.tsx`**: The white box that displays a question.
*   **`ResultsView.tsx`**: The report card screen.
*   **`WorksheetView.tsx`**: The printable paper view.

**Changing Colors:**
We use a tool called **Tailwind CSS**. It uses class names to style things.
*   `bg-red-500` = Red background.
*   `text-white` = White text.
*   `p-4` = Padding (spacing).
*   `rounded-xl` = Rounded corners.

If you want to change the "Theme" colors (e.g., making Chemistry Green instead of Violet), look in **`App.tsx`**. Search for the function `getTheme`. You will see a list of colors assigned to each subject type.

**Accessibility / Dyslexia Mode:**
This feature is implemented by toggling a CSS class on the `<body>` element.
1.  In `index.html`, look for the `body.accessibility-mode` CSS block. This overrides the default font (Inter) with **Verdana** and increases line height.
2.  In `App.tsx`, a `useEffect` hook monitors the `accessibilityMode` state and adds/removes this class from the document body.

---

## 5. Storage (`services/storageService.ts`)

Currently, the app saves Badges to the user's **Local Storage** (their browser cache). 
*   **Important:** If they clear their cache or switch devices, their badges disappear. 
*   Because you mentioned "No Accounts/Privacy", we do not use a database. This file handles saving/loading from the browser.

---

## 6. Advanced Data Exhibits (Graphs & Tables)

The app generates complex scenarios for **FRQ**, **CER**, and **Worksheet** modes. This is handled in `services/ai/frq.ts` and `services/ai/cer.ts` via the `getFRQQuestion` and `getCERQuestion` functions.

**How it works:**
*   The AI is instructed to return a JSON object containing an `exhibits` array.
*   Each exhibit has:
    *   `type`: 'table' or 'graph'
    *   `content`: Raw HTML (for tables) or Raw SVG (for graphs).
    *   `caption`: A brief explanation of the data.
*   The **UI components** (`CERView.tsx`, `FRQView.tsx`) render these raw strings safely using `dangerouslySetInnerHTML`. 

**Troubleshooting Exhibits:**
*   If graphs look broken: Check the `getFRQQuestion` prompt in `services/ai/frq.ts`. Ensure it specifies `viewBox="0 0 600 400"`.
*   If tables look weird: Check `index.html` for the `.frq-table` CSS class definition.

---

## 7. Worksheet Configuration

The **Worksheet Generator** allows multi-selecting focus areas (e.g., Math + Visuals).

*   **State:** This is stored in `App.tsx` as `state.config.worksheetFocus` (an array of strings).
*   **Logic:** The `startQuizGeneration` function passes this array to the AI service.
*   **Prompting:** In `services/ai/questions.ts`, the `getDiverseQuestions` function takes this array and instructs the AI to "Provide a balanced mix" based on the selected tags.

---

## 8. Troubleshooting

**"The app is spinning forever!"**
*   This usually means the AI connection failed or timed out.
*   Check your Internet.
*   Check if your API Key is valid.

**"The AI is giving wrong answers."**
*   The AI (Gemini) is powerful but can hallucinate.
*   Go to `services/ai/core.ts` -> `getCourseContext`.
*   Make the `standard` instruction more specific. E.g., change *"aligned with biology"* to *"Strictly aligned with Campbell Biology 12th Edition."*

---


**You built this!** Even if you didn't type every character, the logic, the curriculum, and the pedagogy are 100% yours. This code is just the translation layer.

---

## 9. Lab Co-Pilot Architecture (`components/LabView.tsx`)

The **Lab Co-Pilot** is distinct from the quiz engine. It uses a "Track" system to give specialized advice.

**The Tracks:**
*   **Design (`experimental_design`)**: Focuses on variables (IV, DV, Controls).
*   **Analysis (`data_analysis`)**: Can accept raw text data or simulated CSV inputs.
*   **Feedback (`report_feedback`)**: Evaluation mode.
*   **Errors (`error_analysis`)**: Troubleshooting mode.
*   **Mentor (`research_mentor`)**: Unique because it maintains a **Project Context** state (persisting the student's overall goal across multiple questions).

**Modifying Lab Prompts:**
Go to `services/ai/lab.ts` and search for `getLabAssistance`. You will see the specific sub-prompts for each track.

---

## 10. Security & Gatekeeper

**XSS Prevention:**
*   We use **DOMPurify** to sanitize all HTML returned by the AI.
*   This is crucial for `ExplanationView` and `FeedbackView` which render rich text.
*   **Rule:** NEVER use `dangerouslySetInnerHTML` directly without wrapping it in our `cleanHtml` utility.

**API Authentication:**
*   The app requires **Google Sign-In** (Workspace domain-restricted) to function — see [`docs/archive/OAUTH_MIGRATION_PLAN.md`](docs/archive/OAUTH_MIGRATION_PLAN.md) for the full design (archived: it is the plan as executed, not current documentation).
*   **Frontend:** `Gatekeeper.tsx` blocks the UI until the user signs in with an approved Google account.
*   **Login exchange:** `api/auth-google.ts` verifies the Google ID token and mints a signed session token (never containing email/name — only the verified domain).
*   **Backend:** The API Router (`api/gemini`) checks the `x-oauth-session` header on every request.
*   **Local Dev:** Requires the same real Google OAuth setup as production (`http://localhost:5173` must be an Authorized JavaScript origin in Google Cloud Console) — there is no code-based bypass for local development.

---

## 11. Gamification System Overhaul

The Trophy Room (`TrophyRoomView.tsx`) has been rewritten to be purely **Points (XP) Based**.

*   **XP Calculation:**
    *   Previously, rank was based on *Badge Count*.
    *   Now, rank is based on *Total Score Sum* (e.g., getting 80% on a quiz = 80 XP).
*   **Rarity Logic:**
    *   **Common**: < 70%
    *   **Uncommon**: 70-89%
    *   **Rare**: 90-99%
    *   **Ultra Rare**: 100% (Triggers the "Holographic" CSS effect).
*   **Legacy Support:** Badges earned before "v2.0" (Jan 2026) are displayed but count as 0 XP to prevent inflation.

---

## 12. Notes on Accessibility

*   **Multilingual:** (Reverted/Cancelled). We briefly implemented full language translation but reverted it to keep the codebase maintainable. **Do not re-implement** without a specific plan to handle the complexity of translating scientific terms.

---

## 13. Graphing Engine & AI Generation (Lessons Learned)

The **DataChart** component and its integration with Gemini were the challenge of the January 2026 update. Here is what you need to know:

**1. Recharts & SVG Limitations:**
*   **No HTML in SVG Text:** You cannot use `<sub>`, `<sup>`, or `<b>` tags inside axis labels because Recharts renders them as SVG `<text>` elements. 
*   **The Fix:** Use the `utils/sanitize.ts` -> `formatScientificText` helper. It converts HTML-like strings (`CO<sub>2</sub>`) into real Unicode characters (`CO₂`) which render perfectly in SVG.

**2. Gemini JSON Strictness:**
*   **Schema is Destiny:** If you define a JSON schema for Gemini but *omit* a property (e.g., leaving out `y1` and only defining `y`), Gemini will struggle to hallucinate the missing property even if the prompt demands it.
*   **The Fix:** Your Schema object (in the relevant `services/ai/` module) must support ALL potential keys (`y1`, `y2`, `control`, `experimental`) or set `additionalProperties: true` (though strict typing is safer).

**3. Multi-Series Generation:**
*   **One-Shot is King:** Simply describing "Use two lines for comparisons" often fails.
*   **The Fix:** Provide a concrete, copy-pasteable JSON `example` in the prompt itself. This "One-Shot" prompting is the only reliable way to force complex behaviors like multi-series graphs.

**4. Caption Spoilers:**
*   **The Problem:** The AI loves to explain *why* the graph looks the way it does in the caption, ruining the student's chance to analyze it.
*   **The Fix:** Explicitly forbid analysis in the prompt: *"The caption must be DESCRIPTIVE ONLY."*

---

## 14. Documentation Standards

To keep the codebase maintainable, we now enforce a continuous documentation policy.

**Key Files to Maintain:**
1.  **`DESIGN_SYSTEM.md`**: If you add a new color or font style, update this.
2.  **`FEATURE_TRACKER.md`**: If you implement a new feature (e.g., File Upload) in a new place, log it here.
3.  **`MODE_REFERENCE.md`**: If you create a new Mode (e.g., "History Tutor"), add its Feature Matrix and User Flow here.

**Rule of Thumb:**
Code is only half the work. If the `MODE_REFERENCE.md` doesn't match the actual app, the feature is not done.

---

## 15. Study Sprint Architecture

**Study Sprint** is a session wrapper that orchestrates multiple existing modes (Quiz, FRQ, CER, Calculation, Worksheet) in sequence and generates aggregated feedback at the end. It is NOT a new mode in the same sense — it is a **conductor** over existing ones.

### Key State Fields (`AppState` / `types.ts`)
- `studySprintState: StudySprintState | null` — the full sprint config and task list
- `currentSprintTaskId: string | null` — set when user is inside a sprint task; `null` at all other times
- Sprint state is persisted to `localStorage` key `sp_study_sprint_data`
- On load, if the saved state has `isActive: true`, the app restores to `study_sprint_dashboard`

### Sprint-Aware Quit Pattern (CRITICAL)
When a mode is launched from a sprint, quitting it must return to the sprint dashboard — not the landing page. The `handleSprintAwareQuit` function in `hooks/useStudySprint.ts` (aliased in `App.tsx`) handles this:

```typescript
const handleSprintAwareQuit = () => {
  if (state.currentSprintTaskId) {
    handleStudySprintBackToDashboard(); // reset task to pending, clear state, go to dashboard
  } else {
    reset(); // normal quit
  }
};
```

**Every mode's quit/back handler MUST use `handleSprintAwareQuit`**, not `reset()` directly:
- Quiz X button → `handleSprintAwareQuit`
- FRQ (`handleSessionQuit`) → delegates to `handleSprintAwareQuit`
- CER `onQuit` → `handleSprintAwareQuit`
- Worksheet `onBack` → `handleSprintAwareQuit`
- Explanation `onQuit` → `handleSprintAwareQuit`
- Calculation `onQuit` → `handleStudySprintBackToDashboard` (direct, also passes `isStudySprint` prop)

### Sprint Task Completion (CRITICAL)
When a mode successfully finishes a sprint task (e.g., user hits "Submit & Grade" or finishes an interaction), it MUST report the completion back to the sprint orchestrator instead of showing its normal results screen. Use `sprint.completeCurrentTask(responses, score, duration)` (provided via `useStudySprint`) inside the mode's `onFinish` or `onSubmit` handler to seamlessly mark the task as completed and return the user to the `study_sprint_dashboard`.

If you add a new mode that can be launched from Study Sprint, follow both the Quit and Completion patterns.

### UX Rules
1. **Score visibility**: Task scores are stored but NOT shown on the dashboard. Only show "Completed ✓ • X min". Scores appear only in `StudySprintReport`.
2. **Feedback timing**: The `analyzing` spinner shows sprint-specific messaging ("Full feedback at end of Sprint") when `currentSprintTaskId` is set. Never imply per-task feedback is immediate.
3. **Editable foci**: The Recommended Tasks screen has an inline topics editor + Re-generate button. Users should not need to go back to the full form to tweak their focus.
4. **End Early**: The dashboard shows an "End Sprint Early" button when ≥1 task is complete but not all are done — it calls `onGenerateReport` with whatever completed tasks exist.

---

## Free Body Diagram Simulation Architecture

**Files:** `components/simulations/freeBodyDiagram/` (12 files)

### Two Modes
- **Build Mode:** Free-form canvas. User places any forces, adjusts label/magnitude/angle, sees live vector decomposition. No verification.
- **Practice Mode:** Preset scenarios. User places forces, then presses "Check My FBD" for local verification or "Get AI Feedback" for AI-graded response.

### Key Files
- `fbdEngine.ts` — `computeNetForce()`, `getFxFy()`, `verifyFbd()` (all pure functions, no React)
- `fbdConstants.ts` — `FORCE_DEFINITIONS` for 11 force types, canvas/geometry constants
- `fbdScenarios.ts` — 11 preset scenarios across flat/incline/pulley/vertical categories
- `FbdCanvas.tsx` — SVG-based canvas; force arrows are SVG elements with drag handlers
- `FbdView.tsx` — top-level view, mode switcher, force state management

### Auth Gating for AI Feedback
FBD is a public (no sign-in required) simulation. The AI feedback panel is only rendered when the `isAuthenticated` prop is `true`. `App.tsx` passes `isAuthenticated={isAuthenticated}` from the existing app auth state. Unauthenticated users see "Check & Reveal" only.

### AI Service
`services/ai/fbd.ts` exports `getFbdFeedback(scenario, forces)`. Uses `DEFAULT_MODEL` + `responseMimeType: 'application/json'` + `responseSchema` per project convention. Returns `FbdAiFeedback` with `overallVerdict`, `strengths`, `issues`, `teachingPoints`.

---

## Biological Systems Modeler — Type System

The Regulatory Modeler was rearchitected (April 2026) to support any domain of biological regulation, not just gene expression.

### Key Changes
- `RegulatoryNodeType` union extended with: `hormone | receptor | organism | molecule | population | custom`
- New `NodeTypeDefinition` interface in `types.ts` — open-ended type registry with `id`, `label`, `color`, `description`
- `ModelerSavedState` type for localStorage persistence (key: `sp_regulatory_modeler_state`)
- `PRESET_NODE_TYPE_SETS` in `modelerConstants.ts` — four domain palettes (Gene Regulation, Hormonal, Signal Transduction, Ecological)
- Starter circuits now declare `nodeTypeSetId` to auto-load their matching type palette on load
- View renamed to "Biological Systems Modeler" in header and SimulationsHub card

### Persistence Pattern
Save/Load uses `localStorage` key `sp_regulatory_modeler_state` with shape `ModelerSavedState`. The engine (`calculateNextStep`) operates on generic `activationLevel` regardless of node type — no engine changes were needed for the type expansion.

---

## Shared Simulation Utilities

### `HeatCoolButtons` (`components/simulations/shared/HeatCoolButtons.tsx`)
Press-and-hold thermal controls. Props: `heatingState`, `setHeatingState`, `heatColor`, `coolColor`, `layout`, `showInstruction`, `disabled`. Used in Phase Change, Kinetics, Gas Laws. See DESIGN_SYSTEM.md for the full pattern.

### `ExportButtons` (`components/simulations/shared/ExportButtons.tsx`)
PNG + CSV export pair. Props: `csvData`, `csvFilename`, `csvHeaders`, `graphRef`, `pngFilename`. PNG uses `html2canvas` (already a dep). CSV built via `utils/dataExport.ts`.

### `utils/dataExport.ts`
- `exportToCsv(data, filename, headers?)` — builds and triggers a `.csv` download
- `exportElementToPng(element, filename)` — captures a DOM element to PNG via `html2canvas`

---

## 11. Homepage Advisor & Gradual Release Scaffolding

### Advisor Deep Links & Action Tags (`services/ai/tutor.ts` & `components/LandingPage.tsx`)
- **Direct Simulation Deep Links**: The advisor receives `SIMULATIONS_REGISTRY` in its system prompt and emits `[sim:<id>]` tags for direct simulation links (e.g. `[sim:gas_laws]`). `LandingPage.tsx` parses `sim:*` tags and renders dedicated launch buttons.
- **Info Page Tags**: Supports `[how_it_works]`, `[features]`, `[changelog]`, `[support]` tags rendering clickable page navigation buttons.
- **Action Tag Allowlist (`[[ACTION: ...]]`)**: The advisor can trigger client-side settings changes by appending an action tag. Strict client-side allowlist validation handles:
  - `set_dark_mode` (`value: boolean`)
  - `set_mascot` (`value: 'robot' | 'beaker' | 'plant' | 'gerbil'`)
  - `set_username` (`value: string`, max 30 chars)
  - Anything else is ignored silently.

### Gradual Release of Responsibility (`services/ai/tutor.ts`)
Both **Calculation Partner** (`getCalculationChatResponse`) and **Explanation Partner** (`getExplanationChatResponse`) incorporate `GRADUAL_RELEASE_BLOCK` into their system prompts:
- **Level 1 (Guided)**: Step-by-step questions and direct hints (default).
- **Level 2 (Coached)**: Chunked problem-solving with hints on request/error.
- **Level 3 (Independent)**: Student leads and outlines full approach; tutor verifies reasoning and asks metacognitive questions.
- Progression is evaluated per session from conversation history without local state persistence.