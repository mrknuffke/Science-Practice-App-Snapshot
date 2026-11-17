# Drift Guards

Facts that a machine can check are checked by a test, not by a checklist. The
commit checklist is long, and length is its weakness. A September 2026 audit found
the docs advertising a model two upgrades stale, three pages promising the site
would "never offer logins" a month after sign-in shipped, the Support page selling
an access code for a flow deleted in August, and four different wrong counts. Every
one of those was covered by the checklist. The checklist did not catch them,
because a 40-item list gets skimmed.

These guards live in `services/__tests__/sourceOfTruth.test.ts` and
`services/__tests__/docsIntegrity.test.ts`. They run on every push and PR through
`.github/workflows/preflight.yml`.

1. **No source file names a Gemini model.** Import `DEFAULT_MODEL`, or
   `VISION_MODEL` for image/PDF work, both from `services/ai/core.ts`.
   `ChangelogView.tsx` is exempt: its entries are dated history.
2. **No doc names a model the app no longer uses.** `docs/archive/` is exempt,
   being a frozen record.
3. **Counts in `README.md` and `CLAUDE.md` match their registries.**
4. **Simulation and mode *names*, not just counts.** A rename or a merge that
   leaves the total unchanged is invisible to a count. The fenced
   `BEGIN:SIMULATIONS` block in `CLAUDE.md` and in `README.md` is compared to
   `SIMULATIONS_REGISTRY` entry by entry, and the `BEGIN:MODES` block in
   `README.md` to `MODES_METADATA`.
5. **The chemistry textbook has one lesson manifest**, `lessons.json`, which the
   dashboard (`assets/dashboard.js`) and the shared runtime's previous and next
   links read at runtime. No chem script or page may hold a second copy, and
   `TEXTBOOK_LESSONS` in `utils/textbookProgress.ts` must match `lessons.json`.
6. **Every lesson in all three books** exists on disk, is linked from its own
   dashboard, and has its lesson and review counts in `OpenResourcesView.tsx`
   checked against `lessons.json`, so a lesson cannot be shipped that no student
   can reach or that leaves the Open Resources hub count stale.
7. **`constants/publicRoutes.ts` and `check-routes.mjs` agree**, so a new
   simulation cannot ship without a public route check.
8. **No HTML tag inside an SVG `<text>`** in any of the three books.
9. **Documentation links resolve**, case-sensitively, and `.agent/rules/` stay
   pointers rather than growing into a second rulebook.
10. **Textbook inline styling, unregistered sim loops and unresolved glossary
    terms never grow.** `services/__tests__/textbookStandard.test.ts` compares
    each lesson with a baseline that can only go down.

## Render facts, never type them

A count in prose is a count that will be wrong within two releases. Render it:
`SIMULATIONS_REGISTRY.length`, `MODES_METADATA.length`, `COURSES.length`,
`formatModelName(DEFAULT_MODEL)`. If you are adding a fact to a page, and a registry
already holds that fact, import the registry.

## The one thing no test can catch

Copy that outlives the feature it describes. Nothing detects that the Ko-fi
"access code" pitch survived the deletion of the code path, or that a quote
promising no logins survived the arrival of logins. One rule covers it:

> **When you delete, gate, or replace a feature, grep the user-facing copy for
> its name before you commit.** Search the feature's name, the UI label, and the
> noun a student would use for it. Then fix what you find, in the same commit.

That is a narrower and more memorable instruction than "review 12 documents," and
it is the specific step that would have prevented both misses.
