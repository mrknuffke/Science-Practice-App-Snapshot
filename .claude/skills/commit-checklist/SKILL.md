---
name: commit-checklist
description: Pre-commit checklist, commit message format, commit process and PR template for this repo. Use before every commit or PR in SciencePracticeApp.
model: sonnet
---

# Commit checklist

## Pre-Commit Checklist

Run every check below before each commit. It is based on `RELEASE_CHECKLIST.md`.

### 1. Code Quality & Build Verification
- [ ] Verify the full interactive user journey locally on `http://localhost:5173` before committing
- [ ] Run unified verification gate: `npm run verify` (runs `tsc -b`, `npm run lint`, `vitest run`, and `vite build` in one command)
- [ ] Before pushing: `npm run preflight` (verify + routes + browser smoke; the pre-push hook runs it too)
- [ ] Ensure build completes successfully with no TypeScript, lint, test, or Vite errors
- [ ] Remove debug `console.log` statements

### 2. Git Checks
- [ ] Review `git status` to understand what's changed
- [ ] Review `git diff` to see the actual changes
- [ ] Review `git log` to understand commit message style
- [ ] Ensure no sensitive files (.env, credentials) are being committed
- [ ] Stage only relevant files (prefer specific file names over `git add .`)

### 3. Safety & Security Audit
- [ ] **Gatekeeper Check**: Open incognito window → verify app blocks access until signed in with an approved Google account
- [ ] **XSS Check**: Verify all `dangerouslySetInnerHTML` uses are wrapped with `cleanHtml` utility
- [ ] **Data Hygiene**: Verify no PII stored in localStorage (only an opaque OAuth session token containing a domain, no email/name)
- [ ] **AI Safety** (if AI prompts changed): Test with "Red Team" question to verify safe refusal

### 4. Documentation Updates

**ALWAYS update the following documentation files as applicable:**

#### Core Documentation (Update if Changed)
- [ ] **`CLAUDE.md`** (project root):
  - New dependencies, scripts, features, conventions, or architectural changes
  - New lessons learned or troubleshooting tips
  - Add an entry at the top of `docs/archive/CLAUDE_HISTORY.md` for work worth recording

- [ ] **`DESIGN_SYSTEM.md`**:
  - New colors, fonts, or component patterns added
  - New UI components or glassmorphism effects

- [ ] **`DEVELOPER_GUIDE.md`**:
  - Installation steps, new scripts, or architectural changes
  - New services or major refactors
  - AI prompt modifications (document in relevant sections)

- [ ] **`MODE_REFERENCE.md`**:
  - Update Feature Matrix for any new mode capabilities
  - Add details for new modes or mode modifications
  - Ensure feature checkboxes match actual implementation

- [ ] **`FEATURE_ADDITION_CHECKLIST.md`**:
  - Review if a new feature was added to existing mode
  - Verify checklist was followed during development

#### User-Facing Documentation
- [ ] **`components/ChangelogView.tsx`**:
  - **Check GitHub repo for recent commits/changes**
  - **Ask user if changelog should be updated**
  - Provide draft of features, fixes, improvements for user review
  - Add finalized entry for current date/version
  - **Preserve existing user credits** (see in-file comment for format)
  - If feature was user-requested, add credit: "Feature requested by **User Name**!"

- [ ] **`README.md`**:
  - Update if main feature list changed
  - Update screenshots if UI changed significantly

- [ ] **`FeaturesView.tsx` and `TeachersView.tsx`**:
  - Update if new modes or tools were added
  - Ensure new Teacher Tools have "Teacher Tip" included

#### Project Tracking
- [ ] **`FUTURE_FEATURES.md`** (Roadmap):
  - Move completed features from "Planned" to "Implemented"
  - Clear "Implemented" list if starting fresh cycle (per user preference)

- [ ] **`FEATURE_TRACKER.md`**:
  - Log completion of features
  - Update if reused components in new places (e.g., FileUpload)
  - Update status of ongoing work

- [ ] **`TESTING_GUIDE.md`**:
  - Add test cases for new features
  - Update health check procedures if core flows changed

- [ ] **`UX_DESIGN_CHECKLIST.md`**:
  - Verify new interfaces meet accessibility and design standards
  - Document any UX decisions or patterns

- [ ] **`NEW_MODE_CRITERIA.md`**:
  - If new mode created, ensure it meets documented criteria

### 5. Commit Message Format
- [ ] Follow existing commit message style (see git log)
- [ ] Be concise (1-2 sentences) focusing on "why" not "what"
- [ ] Accurately reflect changes (use "add" for new, "update" for enhancements, "fix" for bugs)
- [ ] Use HEREDOC format (see Commit Process section below)
- [ ] Include a Co-Authored-By footer naming the model you are running as

## Commit Process

When creating commits:

1. **Never commit without explicit user request**
2. **Run all pre-commit checks** (see checklist above)
3. **Use heredoc format** for commit messages:
   ```bash
   git commit -m "$(cat <<'EOF'
   Your commit message here.

   Co-Authored-By: <your model name> <noreply@anthropic.com>
   EOF
   )"
   ```
4. **If pre-commit hooks fail**: Fix the issue and create a NEW commit (never use --amend unless explicitly requested)
5. **After commit**: Run `git status` to verify success

## Pull Request Process

When creating PRs:

1. Review ALL commits that will be included (use `git log` and `git diff [base-branch]...HEAD`)
2. Keep PR title short (<70 characters)
3. Use this format for PR body:
   ```markdown
   ## Summary
   - Bullet point summary of changes

   ## Test plan
   - [ ] Checklist of testing steps

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   ```

## Quick Reference: Pre-Commit Flow

When user asks to commit, follow this exact sequence:

1. **Run Build**: `npm run build` (MUST pass with no errors); before any push, `npm run preflight`
2. **Git Review**: Run `git status`, `git diff`, `git log` in parallel
3. **Safety Checks**:
   - Incognito gatekeeper test (if auth changed)
   - XSS check (if HTML rendering changed)
   - No PII in localStorage
4. **Documentation Updates**:
   - Update CLAUDE.md if conventions/architecture changed
   - Ask user about Changelog update
   - Update MODE_REFERENCE.md if features added/changed
   - Update FEATURE_TRACKER.md if components reused
   - Update other .md files as applicable per checklist above
5. **Stage & Commit**:
   - Stage specific files (avoid `git add .`)
   - Use HEREDOC format with Co-Authored-By footer
   - Run `git status` after to verify
