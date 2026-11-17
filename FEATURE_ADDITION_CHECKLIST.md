# ➕ Feature Addition Checklist

Use this checklist whenever you are adding a new feature or capability to an **existing** mode. This ensures that "feature creep" doesn't degrade the core user experience.

## 1. Justification & Fit
- [ ] **Problem Solved:** What specific user problem does this solve? (e.g., "Students can't read the text easily" -> Text-to-Speech).
- [ ] **Mode Alignment:** Does this feature fit the *goal* of the current mode?
    - *Example:* Adding a "Calculator" to the generic "Chat" mode might be clutter. Adding it to "Physics Lab" is essential.
- [ ] **Complexity Check:** Does adding this make the UI too crowded?
    - If yes, should it be hidden behind a "Settings" menu or a "Tools" accordion?

## 2. UI/UX Integration
- [ ] **Placement:** Where does the control live?
    - **Primary Action:** (e.g., Submit) -> Main button area.
    - **Utility:** (e.g., TTS, Simplify) -> Top bar or Tool tray.
    - **Configuration:** (e.g., Difficulty) -> Settings modal.
- [ ] **Visual Consistency:**
    - Are we using a standard icon? (Check other modes).
    - Does it use the correct theme color?
- [ ] **Mobile Impact:**
    - Does adding this button break the layout on mobile?
    - Is it reachable with a thumb?

## 3. Technical & State
- [ ] **State Persistence:**
    - Should this setting be remembered next time? (e.g., "Always use TTS").
    - If yes, update `storageService.ts`.
- [ ] **AI Context:**
    - Does this feature require updating the System Prompt?
    - Does the AI need to *know* this feature is active? (e.g., "Simplify" mode changes the output style).

## 4. Documentation & Cleanup
- [ ] **Update Feature Matrix:** Go to `MODE_REFERENCE.md` and check the box for this mode.
- [ ] **Update Changelog:** Add a line to `components/ChangelogView.tsx`.
- [ ] **Update Roadmap:** Move from "Planned" to "Implemented" in `FUTURE_FEATURES.md`.
- [ ] **Refractor Check:** Did you copy-paste code? If so, consider moving it to `utils` or a shared component.
