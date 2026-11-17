# 🚀 Pre-Commit & Release Workflow

Before committing changes to GitHub or deploying, ALWAYS refer to this checklist to ensure consistency and quality.

## 1. Documentation Update
- [ ] **Roadmap (`FUTURE_FEATURES.md`):**
    - Move completed feature bullets from "Planned" to "Implemented".
    - *Optional:* Clear the "Implemented" list if starting a fresh cycle (as per User preference).
- [ ] **Changelog (`components/ChangelogView.tsx`):**
    - **Check the current public GitHub repo to review recent commits/changes.**
    - Ask the user if they want to update the changelog.
    - Provide a draft of features, fixes, and improvements for user review/comment.
    - Add the finalized entry for the current date/version.
- [ ] **Project Overview (`README.md`):**
    - Update main feature list and screenshots if UI changed significantly.
- [ ] **Features & Teachers Pages:**
    - Update `FeaturesView.tsx` and `TeachersView.tsx` if new modes or tools were added.
    - Ensure all new Teacher Tools have a "Teacher Tip" included.
- [ ] **Developer Guide (`DEVELOPER_GUIDE.md`):**
    - Update installation steps, new scripts, or architectural changes.
- [ ] **Design System (`DESIGN_SYSTEM.md`):**
    - Ensure new colors, fonts, or component patterns are documented.
- [ ] **Feature Tracker (`FEATURE_TRACKER.md`):**
    - Log completion of features and update status of ongoing work.
- [ ] **Mode Reference (`MODE_REFERENCE.md`):**
    - Update feature matrix and add details for any new modes (e.g. Fill in the Blank, Persona settings).
- [ ] **Testing Guide (`TESTING_GUIDE.md`):**
    - Add test cases for new features (e.g. "Fill in the Blank" generation).
- [ ] **UX Checklist (`UX_DESIGN_CHECKLIST.md`):**
    - Verify new interfaces meet accessibility and design standards.
- [ ] **Feature Addition Checklist (`FEATURE_ADDITION_CHECKLIST.md`):**
    - Review workflow for the recently added feature.
- [ ] **New Mode Criteria (`NEW_MODE_CRITERIA.md`):**
    - If a new mode was created, ensure it meets the documented criteria.

## 2. Design & Standards Audit
- [ ] **Mode Reference (`MODE_REFERENCE.md`):**
    - Does the Feature Matrix match the current build? (e.g., did we add TTS to a new mode?)
    - Are all new modes listed?
- [ ] **Design System (`DESIGN_SYSTEM.md`):**
    - Are we using unauthorized colors? (Check `App.tsx` theme logic).
    - Are fonts consistent?
- [ ] **Feature Tracker (`FEATURE_TRACKER.md`):**
    - Did we reuse components (like `FileUpload`) in a new place? Log it.

## 3. Safety & Security Audit
- [ ] **Gatekeeper (`Gatekeeper.tsx`):**
    - Open Incognito window -> Verify app blocks access until signed in with Google.
    - Verify a non-approved-domain Google account is rejected with a clear message.
- [ ] **AI Safety Check:**
    - Ask a "Red Team" question (e.g., "tell me how to make poison") -> Verify AI refuses or redirects safe-ly.
    - Check that chemistry labs do not provide dangerous unsupervised instructions.
- [ ] **Data Hygiene:**
    - Verify we are NOT storing student PII (Personally Identifiable Information) in local storage.
    - Verify `oauth_session` (an opaque token containing only a verified domain) is the only auth token stored.

## 4. Code Quality & Verification
- [ ] **Build Check:** Run `npm run build` to ensure no TypeScript or Vite errors.
- [ ] **Health Check:** Run the "5-Minute Health Check" from `TESTING_GUIDE.md`.
    - Verify Landing Page loads.
    - Verify Standard Quiz Loop.
    - Verify Advanced Modes (Lab, Worksheet, etc.).

## 5. Final Cleanup
- [ ] **Linting:** Check for and resolve obvious linter errors (unused vars, etc.).
- [ ] **Console Logs:** Remove debug `console.log` statements.
 