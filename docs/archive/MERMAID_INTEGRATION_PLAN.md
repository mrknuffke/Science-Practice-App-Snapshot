# 🧜‍♀️ Mermaid.js Integration Proposal

We have `mermaid.js` installed and ready on the frontend. This document outlines the proposed areas to activate it by updating our AI prompts in `geminiService.ts`.

## 1. Explanation Partner ("Deep Dive" Visuals)
**Goal:** When the AI provides a "Deep Dive" explanation (usually after a student answers incorrectly), it should also generate a visual diagram.
*   **Trigger:** `getAIExplanation` function.
*   **Implementation:** Add a `visualMapping` field to the JSON schema.
*   **Example:** 
    *   *Topic:* Cellular Respiration.
    *   *Visual:* A flowchart showing `Glycolysis -> Krebs Cycle -> ETC`.
    *   *Prompt Addition:* "If the concept involves a process or cycle, generate a Mermaid.js `graph TD` flow representation."

## 2. Lab Co-Pilot (Diagnostic Trees)
**Goal:** Help students troubleshoot experiments visually.
*   **Trigger:** `getLabAssistance` function (specifically "Error Analysis" track).
*   **Implementation:** Ask for a boolean decision tree.
*   **Example:**
    *   *Student Issue:* "My gel didn't run."
    *   *Visual:* `graph TD; A[Power On?] -- No --> B[Plug In]; A -- Yes --> C[Buffer Level OK?];`

## 3. Smart Scanner (Concept Maps)
**Goal:** Add a visual summary to the end of generated "Active Note Sheets".
*   **Trigger:** `generateNoteSheet` function.
*   **Implementation:** Append a **Concept Map** section to the markdown output.
*   **Example:** A `mindmap` or `graph` connecting the key terms found in the uploaded documents.
*   *Note:* This adds significant value to the "Active Note Sheet" feature by catering to visual learners.

## Technical Implementation Path
1.  **Phase 1 (Prototype):** Implement #1 (Deep Dive) only.
    *   Update `geminiService.ts`: `getAIExplanation` schema.
    *   Update `ExplanationView.tsx`: Render the returned Mermaid string.
2.  **Phase 2 (Expansion):** Roll out to Lab Co-Pilot and Note Sheets once Phase 1 is stable.

## Questions for Review
*   [ ] Do you agree with prioritized ranking (Deep Dive -> Lab -> Notes)?
Yes.  I also only want diagrams when they are useful.


*   [ ] Are there specific diagram types you want to avoid? (e.g. strict Sequence diagrams can be tricky for general concepts)?
Yes.  Whatever is most useful for the topic, even if that's no diagram

*   [ ] Should we allow the user to *toggle* visuals on/off to save tokens?
yes