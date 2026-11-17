# Archive

Finished work. Nothing here describes how the project works **today** — these are
execution plans that were carried out, and reports on work that shipped. They are
kept because they explain *why* a thing is the way it is, and because several of
them record decisions no commit message captured.

**Do not treat anything in this folder as current.** Counts, model names, file
paths and feature lists in these documents were accurate on the date at the top
of each and have not been maintained since. The living documents are:

| For | Read |
| --- | --- |
| Conventions, workflow, the push gate | [`/CLAUDE.md`](../../CLAUDE.md) |
| Rendering and content invariants | [`../RENDERING_GOTCHAS.md`](../RENDERING_GOTCHAS.md) |
| What each mode does | [`/MODE_REFERENCE.md`](../../MODE_REFERENCE.md) |
| How to test before a release | [`/TESTING_GUIDE.md`](../../TESTING_GUIDE.md) |
| Chemistry textbook | [`../textbook/TEXTBOOK_DEV_GUIDE.md`](../textbook/TEXTBOOK_DEV_GUIDE.md) |
| Physics textbook | [`../textbook/PHYSICS_DEV_GUIDE.md`](../textbook/PHYSICS_DEV_GUIDE.md) |
| Biology textbook | [`../textbook/BIOLOGY_DEV_GUIDE.md`](../textbook/BIOLOGY_DEV_GUIDE.md) |
| What is live, and where each shared component is used | [`/FEATURE_TRACKER.md`](../../FEATURE_TRACKER.md) |

## What's here

| Document | Work it describes | Shipped |
| --- | --- | --- |
| `AI_UPGRADE_PLAN.md` | Gemini 3.6 Flash bump, advisor deep links, gradual-release scaffolding | 2026-07-24 |
| `OAUTH_MIGRATION_PLAN.md` | Replacing the classroom code with Google Workspace sign-in | 2026-08-25 |
| `MAINTENANCE_PLANS.md` | FRQView rules-of-hooks fix and the ESLint gate repair | 2026-07-25 |
| `MERMAID_INTEGRATION_PLAN.md` | Proposal for Mermaid diagrams; shipped as `components/MermaidDiagram.tsx` | 2026-01 |
| `EXTRACTION_SUMMARY.md` | Splitting `geminiService.ts` into `services/ai/*` | 2026-02-22 |
| `SIMULATION_CLEANUP_SUMMARY.md` | The March simulations cleanup pass | 2026-03-23 |
| `SIMULATION_TODO.md` | Covalent Bonding v0.3 → v1.0 backlog | 2026-03-24 |
| `SIMULATION_TESTING_GUIDE.md` | Manual test script for the first three simulations | 2026-03-23 |
| `QUICK_START_TESTING.md` | The 5-minute version of the above | 2026-03-23 |
| `CLAUDE_HISTORY.md` | The dated change log that used to live at the bottom of `CLAUDE.md` | ongoing |
| `TEXTBOOK_TODO.md` | The old textbook backlog, once `TODO.md` in `docs/textbook/`; its two open items moved to `FUTURE_FEATURES.md` | 2026-10-27 |
| `TEXTBOOK_CHANGELOG_2026-06_TO_09.md` | Textbook changelog entries from June to September 2026 | 2026-10-27 |
| `FEATURES_SHIPPED_2026-03_TO_09.md` | The "Recently Implemented" sections of `FUTURE_FEATURES.md`, March to September 2026 | 2026-10-27 |
| `FEATURE_TRACKER_HISTORY.md` | Remediation passes, bug fixes, prototypes and dated bullets removed when `FEATURE_TRACKER.md` became a tracker of what is live | 2026-10-27 |
| `DIAGRAM_STANDARDIZATION.md` | The textbook diagram retrofit plan. Phases 0 to 2 done; Phase 3 reached part of the lessons; the Phase 4 renderers were built but no lesson adopted them. Superseded by the shared runtime; its live rules are `docs/textbook/DIAGRAM_CONTRACT.md` | 2026-07-08 |
| `plans/textbook-consistency-fixes.md`, `plans/textbook-consistency-sessions.md`, `plans/audit/` | The textbook consistency plan (Phases 1 to 4), its session prompts and its Phase 2 audits | 2026-10-26 |

Two documents were deleted rather than archived, because they were byte-for-byte
duplicates of others here: `TESTING_DOCS_PDF_EXPORT.md` (a concatenation of
`SIMULATION_TESTING_GUIDE.md` and `QUICK_START_TESTING.md` for PDF export) and
`Simulations_Testing_Guide_v0.3.html` (the rendered copy of the same). Both are
in git history if they are ever wanted.
