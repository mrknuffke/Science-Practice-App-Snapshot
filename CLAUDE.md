# Claude Code Instructions for SciencePracticeApp

This file contains persistent instructions for Claude Code when working on this project.

## Project Overview

**Science Practice Partner** is a React-based Single Page Application (SPA) that provides AI-powered, interactive science practice tools across multiple disciplines (Biology, Chemistry, Physics, Environmental, Elementary, Middle School, and Electives), plus free interactive simulations accessible without authentication.

### Core Features
**Free Interactive Simulations** (no sign-in required, 19 total — source of truth is `constants/simulationsRegistry.ts`):
<!-- BEGIN:SIMULATIONS - checked against constants/simulationsRegistry.ts by
     sourceOfTruth.test.ts. Do not hand-edit; if this fails, the test prints the
     exact block to paste. -->
- Ecosystem Balance
- Population Genetics
- Covalent Bonding
- Ionic Bonding
- Periodic Table
- Build an Atom
- Particle Phase Change
- Biological Systems Modeler
- Cell Membrane Transport
- Reaction Kinetics
- Ideal Gas Laws
- Free Body Diagrams
- Motion Tracker
- Thermal & Thermochemistry Studio
- Arterial Blood Buffers
- Nuclear Decay & Dating
- Osmosis Lab
- Tracking a Carbon Atom
- Island Biogeography
<!-- END:SIMULATIONS -->

**Free Interactive Textbooks** (no sign-in required): three zero-build static sites
under `public/`. None imports anything from the React app. All three run on the shared
runtime in `public/textbook/`, so a fix there reaches every book.

- **SAS General Chemistry**: `public/chem/`, served at `/chem/` (also `chem.sciencepractice.app`). Guide: [`docs/textbook/TEXTBOOK_DEV_GUIDE.md`](docs/textbook/TEXTBOOK_DEV_GUIDE.md).
- **SAS General Physics**: `public/physics/`, served at `/physics/` (also `physics.sciencepractice.app`). Levels 3 and up are on hold for Physics PLC feedback. Guide: [`docs/textbook/PHYSICS_DEV_GUIDE.md`](docs/textbook/PHYSICS_DEV_GUIDE.md).
- **SAS General Biology**: `public/bio/`, served at `/bio/` (also `bio.sciencepractice.app`). Units 1 (Homeostasis) and 2 (2a Carbon, 2b Ecology). PLC source files and downloaded papers live in `docs/textbook/bio-sources/` (never under `public/`), gitignored apart from its README. Guide: [`docs/textbook/BIOLOGY_DEV_GUIDE.md`](docs/textbook/BIOLOGY_DEV_GUIDE.md).

**Any textbook work starts with the `textbook-work` skill**
(`.claude/skills/textbook-work/SKILL.md`). It holds the checklists, the guard tests and
the new-textbook recipe. The standards are
[`docs/textbook/STYLE_STANDARD.md`](docs/textbook/STYLE_STANDARD.md) and
[`docs/textbook/RUNTIME_SPEC.md`](docs/textbook/RUNTIME_SPEC.md).

### Application Architecture
- **`services/geminiService.ts` is only a barrel** that re-exports `services/ai/*`; most
  components import `services/ai/*` directly. It holds no logic. Edit the module in
  `services/ai/` (`core.ts` owns `DEFAULT_MODEL`, `VISION_MODEL` and `getCourseContext`), not the barrel.

## Code Style & Standards

### General Principles
- Avoid backwards-compatibility hacks for unused code - delete it completely if certain it's unused
- **Documentation is half the work**: If documentation doesn't match the actual app, the feature is not done

### TypeScript
- Prefer interfaces over types for object shapes
- When adding new subjects: Update `types.ts` → `constants.ts` → `services/ai/core.ts` (`getCourseContext`)

### Security & XSS Prevention
- Wrap every `dangerouslySetInnerHTML` value in `cleanHtml` from `utils/sanitize.ts`
  (DOMPurify), because AI-generated content reaches these props.
- Watch for injection vulnerabilities in AI-generated content
- Gatekeeper must always protect API access (verify in incognito mode)
- The OAuth session token must contain only a verified email domain, never the user's email or name. The React app stores no PII in localStorage.
- The static books (`/chem/`, `/physics/`, `/bio/`) may keep a student's own name and saved receipts in that student's browser (David, 2026-11-02). Never send it anywhere, and escape it before it goes into HTML: these pages share an origin with the signed-in app.

### Design System Compliance
See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for full details:
- **Colors**: Subject-specific semantic colors (Biology=Emerald, Chemistry=Violet, Physics=Cyan, etc.)
- **Typography**: Inter for headings/body, Fira Code for code/data, Verdana for accessibility mode
- **Components**: Use `rounded-2xl` for cards, glassmorphism for overlays, consistent button states
- **NO hardcoded colors**: Always derive from the theme logic in `hooks/useTheme.ts` (`getTheme`)
- **Touch targets**: Minimum 44px x 44px for mobile
- **Icons**: Consistent style (Outline vs Solid) across app

## Verification & Visual UI Rules

General rules (two-attempt rule, no forged auth, no ad-hoc infrastructure) are in
`~/.claude/CLAUDE.md`. Here too, prefer reading the code and reasoning about DOM/CSS
over screenshots, even for public routes. This repo's facts:

- **NEVER build ad-hoc headless browser automation, mint fake session tokens, or construct Playwright harnesses to bypass authentication for verification.** Two Claude Code hooks enforce it: `pre-bash.sh` refuses commands that sign or plant a session or install browser automation, and `pre-write.sh` refuses writing session-minting code anywhere except the real auth files (`utils/jwt.ts`, `api/*.ts`, `vite.config.ts`, `App.tsx`, `Gatekeeper.tsx`, `utils/googleAuth.ts`).
- **There is deliberately no test-auth fixture, and agents do not build one.** A committed way for automation to get past sign-in would be a bypass in a student-facing app. Screens behind sign-in are verified by David, by hand.
- **The dev server's sign-in bypass (`/api/auth-dev` and the "Bypass Sign-In (Local Dev Only)" button in `Gatekeeper.tsx`) is David's tool, not a verification path.** An agent never signs, plants, or forges a session, and never uses it to "check" a screen behind sign-in. Four independent things confine it to local development, and a change that breaks any one is a real problem. They are listed in the `dev-sign-in` skill (`.claude/skills/dev-sign-in/SKILL.md`).
- **Sanctioned automated checks cover the public surface only** (no sign-in, nothing in localStorage): `tests/smoke/textbook.smoke.ts` (dashboard plus every lesson), `tests/smoke/app.smoke.ts` (the signed-out gate, the info pages, every simulation by `?page=`), and `/verify-ui <route>` for a one-off screenshot of a public route.
- **Public routes:** `/` (sign-in gate), every `?page=` value in `PUBLIC_PAGE_PARAMS` (`constants/publicRoutes.ts`, which is also what App.tsx and the route check read), and everything under `/chem/`, `/physics/` and `/bio/`. **Everything else needs sign-in: STOP and ask David to inspect it**, with a short numbered checklist of what to look at.
- **Unified health check:** `npm run verify` (`verify_diagrams.mjs && tsc -b && npm run lint && vitest run && vite build`). The full push gate is `npm run preflight` (below).

## Collaboration & Communication

You are pair-programming with an expert science educator, not a career software
engineer.

- **Ground technical decisions in pedagogical intent**, student usability, and
  what is practical in a classroom.
- **Clarity over jargon.** Explain mechanisms, root causes and trade-offs in
  plain English. Do not assume formal CS theory.
- **Explain the why.** Never just announce a change: say why it was needed, how
  the fix works, and what it changes for the student or teacher using it.
- **Give concrete verification steps.** When you finish something, say exactly
  what David should click and what he should see. He is the visual acceptance
  tester; see the verification rules above.
- **Flag guardrails early** — edge cases, mobile layout, print layout,
  accessibility — before they become bugs.
- **Get straight to the substance**, but never trade away thoroughness or context
  for artificial brevity.

### Modes vs. features

- A **mode** is something with a launch button on the dashboard, or inside
  Document Creator. Modes need not behave identically, but their *design
  language* must match. Adapting an existing mode into a new one is fine and
  encouraged.
- A **feature** is something that lives inside modes and recurs across them
  (TTS, Dictation, Simplify, Refresh). **Feature consistency across modes
  matters** — a student should not have to relearn the same control twice.
- Either way: reuse the existing design language and regularise the UX. Questions
  that come out of that reading go to David directly.

## Student-Facing Voice & Pedagogical Register

**Read [`docs/textbook/VOICE.md`](docs/textbook/VOICE.md) before authoring any student-facing content, questions, feedback, or UI copy.** It applies repo-wide: textbook lessons, PE practice modules, simulations, quiz banks, and AI prompts. Section 7 holds the five course tiers with their sentence and option word caps. Section 8 holds the Simplified Technical English rules.

- Zero em-dashes (U+2014) or HTML mdash entities in authored copy, SVGs, captions, or runtime JS strings. Use hyphens, colons, commas, or parentheses.
- MCQ options are balanced: the correct answer is never more than 1.8x the length of a distractor, with parallel grammar and tone.
- Every distractor names a real student misconception, never a cartoon-wrong answer.
- Match the course tier's caps. Tier 3 (general high school, all three textbooks): sentences of 12-18 words, options of 22 words or fewer.
- Write like a teacher at a desk, not a testing board (see VOICE.md section 5). Read every string aloud first.

## Content & Rendering Invariants

**Read `docs/RENDERING_GOTCHAS.md` before authoring lesson content, widgets, or UI.** Every entry shipped once. Fixing a new rendering bug means adding an entry and a check in the same commit.

- **Know which fields render as text.** Sort-classify *category labels* render with `textContent`, so markup there shows literally: write notation in Unicode (NH₄⁺, `\u2084\u207A` in JSON). Item text and most other widgets' `label` fields render as HTML. Flashcard and other data strings: check how the consuming component renders before adding markup.
- **Lists need explicit padding in both surfaces.** Textbook: `tokens.css` zeroes padding on everything, so give lists in any new container a `padding-left` (`.interactive` lists already have one). React app: Tailwind preflight strips list styling, so use `list-disc pl-5` / `list-decimal pl-5`.
- **Define every CSS token before using it.** An undefined `var(--x)` fails silently. Guarded by `services/__tests__/chemCssTokens.test.ts`.

## Local Development

- **The dev server is pinned to `http://localhost:5173`** (`strictPort: true`). It is the one dev origin registered with Google, and Google matches origins exactly. Do not unpin the port: if it stepped to 5174, `open: true` would land on an origin that was never registered, silently.
- **`npm run dev` prints the sign-in setup at startup** (the origin to register, the client id, whether `AUTH_SECRET` and `OAUTH_ALLOWED_DOMAINS` are set). Read that banner before investigating sign-in. If sign-in fails locally (`origin_mismatch` etc.), use the `dev-sign-in` skill.
- **`.env.local` is read once, at server start.** Changing it means restarting.
- **Local-first loop: never "push to test".** The dev server serves the React app and the static books (`/chem/`, `/physics/`, `/bio/`). Verify the whole journey locally (entry, interaction, completion), batch fixes into one verified milestone, then make one commit. While working, run `npm run verify` or focused tests. The full preflight is the push gate (see Deploy & Runtime Safety).
- **Do routine edits and known-cause bug fixes in the main thread,** with focused commands, not background subagents or polling. A root-cause hunt with an unknown cause and broad reading goes to a read-only subagent or `/diagnose`.
- **When you hand work back, give a `http://localhost:5173/...` URL and a short checklist** of what to click and what David should see, so he can confirm it locally before anything is pushed.

## Deploy & Runtime Safety

- **Production:** https://sciencepractice.app (Vercel project `sciencepracticebot`, deploys `main` on push). `chem.sciencepractice.app`, `physics.sciencepractice.app`, and `bio.sciencepractice.app` 301-redirect to `/chem/`, `/physics/`, and `/bio/`.
- **Auth env vars:** `OAUTH_ALLOWED_DOMAINS` (comma-separated email domains — the normal school gate). `OAUTH_ALLOWED_EMAILS` (optional, comma-separated individual addresses — grants specific people access even if their domain is not listed, e.g. a colleague's personal Gmail; checked server-side only, never stored in the session token). Both are set in the Vercel dashboard; neither gets a `VITE_` prefix.
- **Runtime:** the build runs on **Node 22** (`.nvmrc`, matching CI and `@types/node`). The Vercel project's Node setting could not be read from the CLI (not logged in); if it is ever changed, update `.nvmrc` to match. `api/*.ts` run on the **edge runtime**, which has **no Node built-ins** (`fs`, `path`, `crypto`, `node:*`): they typecheck and build locally, then fail only when deployed.
- **`npm run preflight`** (`scripts/preflight/preflight.sh`) is the push gate: `npm run verify` under Node 22 → edge functions import no Node built-ins and never skip auth by hostname → serves the production build → requests every public route (`check-routes.mjs`: every public app page, every lesson in `lessons.json`, and every script each lesson loads, with missing files detected against the server's not-found fallback) → browser smoke suite.
- **Never push without a green preflight.** It runs in the git pre-push hook (`.githooks/`, installed by `npm install` via `prepare`) and in CI (`.github/workflows/preflight.yml`). Never use `--no-verify`; a Claude Code hook refuses it.
- **Snapshot baseline** `tests/smoke/__snapshots__/`: after an intentional change, `PREFLIGHT_PLAYWRIGHT_ARGS=--update-snapshots npm run preflight`, review, commit.
- **After any deploy,** confirm `200` on https://sciencepractice.app/, https://sciencepractice.app/chem/ and https://sciencepractice.app/?page=interactives before reporting done.
- **Public snapshot for other teachers:** this repo stays private. `scripts/public-snapshot/build-snapshot.sh <dir> [--commit <public-clone>]` builds a history-free copy from an allowlist and blocks on answer keys, document files, secrets and unlisted emails. When you add a top-level file or folder that should be shared, add it to the script's `INCLUDE` list; private material goes in `EXCLUDE`. It never pushes.
- **Changelog for `/ship`:** app changes go in `ChangelogView.tsx` (**ask David first**, per the `commit-checklist` skill); textbook changes go in `docs/textbook/CHANGELOG.md` and the version history in `public/chem/about.html`.
- **Claude Code hooks** (`.claude/settings.json`, `scripts/claude-hooks/`): after an edit, ESLint `--fix` on that file (errors come back); sort-classify label check on lesson files; async `tsc -b` for `.ts/.tsx`, plus the source-of-truth drift guards when manifests, counts, or model names could change. Before Bash/Write: the deploy-gate and forged-auth guards described above.

## Drift Guards

Machine-checkable facts are checked by `services/__tests__/sourceOfTruth.test.ts` and
`services/__tests__/docsIntegrity.test.ts` on every push and PR. The ten guards are listed in
[`docs/DRIFT_GUARDS.md`](docs/DRIFT_GUARDS.md).

- **Never type a number or a model name into user-facing copy.** Render it: `SIMULATIONS_REGISTRY.length`, `MODES_METADATA.length`, `COURSES.length`, `formatModelName(DEFAULT_MODEL)`. If a registry already holds the fact, import the registry.
- **When you delete, gate, or replace a feature, grep the user-facing copy for its name before you commit** (the feature's name, the UI label, and the noun a student would use). Fix what you find in the same commit. No test catches copy that outlives its feature.

## Committing

- **Never commit without explicit user request.** Stage specific files, never `git add .`.
- **Before every commit or PR, run the `commit-checklist` skill**
  (`.claude/skills/commit-checklist/SKILL.md`): verification, git review, safety audit,
  documentation updates, commit message format and the PR template.

## Important Development Rules

- **Model:** new AI functions use `DEFAULT_MODEL` (`VISION_MODEL` for image/PDF work), both from `services/ai/core.ts`. Never an experimental model.
- **JSON mode needs both `responseMimeType: "application/json"` and `responseSchema`.** A missing schema causes a 500 in production.
- **Quit handlers inside Study Sprint:** every mode's quit or back handler calls `handleSprintAwareQuit` (from `hooks/useStudySprint.ts`), never `reset()` directly. Calculation is the one exception: its `onQuit` calls `handleStudySprintBackToDashboard` when in a sprint.
- Prompt, schema, graphing, gamification and sprint details are in [`DEVELOPER_GUIDE.md`](DEVELOPER_GUIDE.md) (sections 2, 3, 11, 13, 15). Landing-page ordering rules are in section 4.

### Building New Interactives (Simulations)

Use the `new-simulation` skill (`.claude/skills/new-simulation/SKILL.md`): discovery interview
first (one question at a time), then the build, the required About panel, and registry plus
routing wiring.

## Where to look

| When you are... | Read |
| --- | --- |
| Checking what a mode does, or which modes have the Standard Kit (TTS, Dictation, Simplify, Refresh) | [MODE_REFERENCE.md](MODE_REFERENCE.md) (Feature Matrix) |
| Finding which modes share a component, or what is live | [FEATURE_TRACKER.md](FEATURE_TRACKER.md) |
| Creating a new mode | [NEW_MODE_CRITERIA.md](NEW_MODE_CRITERIA.md), completed before any code |
| Adding a feature to an existing mode | [FEATURE_ADDITION_CHECKLIST.md](FEATURE_ADDITION_CHECKLIST.md) |
| Running the 5-minute health check (gate, landing, quiz, advanced modes, red team) | [TESTING_GUIDE.md](TESTING_GUIDE.md) |
| Splitting a large component, typing errors, linting | [TECHNICAL_DEBT_PREVENTION.md](TECHNICAL_DEBT_PREVENTION.md) |

- **Large files: search, then read a range.** `docs/textbook/CHANGELOG.md`, `App.tsx`, `components/ChangelogView.tsx` and `FEATURE_TRACKER.md` each cost over 20k tokens to read whole. Use `grep -n`, then Read with `offset` and `limit`. New changelog entries go at the top, so the first 60 lines are enough.
- **Code size and types:** components stay under 600 lines, never use `any` (use `unknown`), and ESLint warnings stay at 0. Modals use `useDialog`, keyboard shortcuts use `useWindowKeydown`, icon-only buttons and form fields get an `aria-label` (see TECHNICAL_DEBT_PREVENTION.md).
- **Mermaid diagrams** (`components/MermaidDiagram.tsx`): generate one only when it genuinely helps, keep the user's switch to turn diagrams off, and never force a sequence diagram on a general concept.

## Special Notes

- **No PII in the app**: the React app never collects names or emails; its localStorage holds only the opaque OAuth session token (verified domain only) and badges. The static books' exception is under Security above.
- **Multilingual**: Previously implemented but **REVERTED** - do NOT re-implement without specific plan for scientific term complexity
- **The Skeptic** is a standalone mode (`SkepticView`, `?page=skeptic`), not a persona toggle.

## Autonomy & Permissions

- **Local reversible actions**: Freely edit files, run tests, run builds
- **Risky actions requiring confirmation**:
  - Deleting files/branches
  - Force-pushing to git
  - Pushing to remote (unless explicitly authorized)
  - Creating/commenting on PRs or issues
  - Running destructive git commands (reset --hard, clean -f, etc.)
  - Installing/removing dependencies
  - Modifying CI/CD or build configurations

## Roadmap & Planning

- [`.claude/SESSION_NOTES.md`](.claude/SESSION_NOTES.md): the active work queue and handoff state. Read it at the start of a session. Update it at the end (what shipped, the exact next step).
- [`FUTURE_FEATURES.md`](FUTURE_FEATURES.md): the backlog, mothballed items and retired concepts.
- [`FEATURE_TRACKER.md`](FEATURE_TRACKER.md): live features, domain sub-routers and registered public routes.
- When a feature is implemented, changed or retired, update `FEATURE_TRACKER.md` and `FUTURE_FEATURES.md` in that same commit. Before ending a session, run `npx vitest run services/__tests__/docsIntegrity.test.ts` and confirm `git status` is clean.

## Change History

Dated entries live in [`docs/archive/CLAUDE_HISTORY.md`](docs/archive/CLAUDE_HISTORY.md).

When you finish work worth recording, add an entry at the top of that file. Keep
**this** file to things that are true now.

---

**Remember**: update this file whenever conventions, structure, or processes
change, as part of the commit checklist. Facts a machine can check belong in
`services/__tests__/sourceOfTruth.test.ts`, not in prose here.
