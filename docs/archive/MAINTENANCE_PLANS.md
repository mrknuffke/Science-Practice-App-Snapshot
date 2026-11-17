# Maintenance Plans (for Sonnet execution)

> Authored by Opus after a codebase health sweep on 2026-07-25. Execute the plans **in the order listed**. Each is a self-contained PR/commit unit. Do not batch them together — commit after each plan so regressions are bisectable.
>
> Every plan ends with `npm run build` (which runs `tsc -b && vite build`) passing with no errors. Follow the CLAUDE.md pre-commit checklist. Do **not** commit until David asks; these plans stop at "verified, ready to commit."

---

## Plan 1 — Fix FRQView Rules-of-Hooks bug + repair the ESLint gate

**Why together:** They're both small, and the ESLint fix is what makes the lint gate able to catch the *next* bug like the FRQView one. Do them in one PR.

### Part A — FRQView conditional-hooks crash (real bug)

**Problem:** [components/FRQView.tsx](../../components/FRQView.tsx) has an early `return` for the `!question` loading state at **lines 36-45**, positioned *before* all 10 of the component's hooks (7 `useState` at lines 47-54, `useSimplify` at line 57, 2 `useEffect` at lines 60 and 70). This violates the Rules of Hooks. When `question` is defined on one render and `undefined` on a later one (e.g. a refresh/retry clears `state.questions` while the view is still `frq`), React renders a different number of hooks and throws *"rendered fewer hooks than expected"* — a white-screen crash.

**Fix (choose the simpler that keeps behavior identical):**
1. Preferred: **Delete the `if (!question) { return (...) }` block entirely** (lines 36-45). App.tsx already guards the loading state at [App.tsx:2252](../../App.tsx#L2252) (`if (isPreparingQuiz && state.questions.length === 0)` renders its own loader), so FRQView is not relied upon to render the spinner. Before deleting, confirm no other caller mounts FRQView with a null question (grep `<FRQView`). If confirmed, delete.
2. If any caller *can* pass a null question: **keep the early return but move it below all the hooks** (after line 70's `useEffect`, before the main `return`). The hooks reference `question?.` with optional chaining already (see line 57), so they are safe to run with `question` undefined. Guard the two `useEffect` bodies with `if (!question) return;` if needed.

**Verify:**
- `npm run lint 2>&1 | grep FRQView` returns **zero** `rules-of-hooks` errors.
- Manually exercise: start an FRQ session, submit, and hit "Refresh"/"Try harder"/"Try easier" (the `onRefresh`/`onHarder`/`onEasier` handlers that clear questions) — no crash.
- `npm run build` passes.

### Part B — Replace the hand-maintained browser-globals list with the `globals/browser` preset

**Problem:** [eslint.config.js](../../eslint.config.js) declares browser globals one identifier at a time (lines 20-44). The list is incomplete, so `npm run lint` reports **~148 phantom `no-undef` errors** for `File`, `HTMLElement`, `HTMLDivElement`, `confirm`, `HTMLCanvasElement`, `Response`, `process`, `Node`, `MouseEvent`, etc. Real errors (like Part A) are buried in that noise, and contributors have been appending to this list by hand for months.

**Fix:**
1. `globals` v14 is **already installed** (transitive dep — verify with `ls node_modules/globals/package.json`; if missing, `npm install --save-dev globals`, and get David's OK first per CLAUDE.md dependency rule).
2. At the top of eslint.config.js: `import globals from "globals";`
3. Replace the entire hand-written `globals: { ... }` object (lines 20-44) with:
   ```js
   globals: {
     ...globals.browser,
     ...globals.node,   // for `process` in the few build-adjacent files
     React: "readonly",
   }
   ```
   Keep `React: "readonly"` (not in the browser preset). `node` covers `process`. Drop the rest — the presets subsume them.
4. Do **not** touch the `rules` block or the `ignores` block.

**Verify:**
- `npm run lint 2>&1 | grep -c "no-undef"` → **0**.
- Total error count drops from 169 to a small number (ideally only real issues). Fix or `_`-prefix any *legitimate* remaining errors; leave warnings alone.
- `npm run build` passes.

**Risk:** Very low. Config-only + one component edit. Rollback = revert the two files.

---

## Plan 2 — Reconcile documentation drift (AP Review Bots + CLAUDE.md metadata)

**Why now:** It's quick, low-risk, and it resolves an ambiguity that Plan 4 depends on (whether `APReviewTutorView.tsx` is live code or an orphan to delete).

**Problem:** CLAUDE.md's 2026-04-25 changelog entry states AP Review Bots were **"hard-deleted"** and lists `components/ApPrepView.tsx` as removed. But [components/APReviewTutorView.tsx](../../components/APReviewTutorView.tsx) (913 lines) exists and **is wired into App.tsx** at [App.tsx:2169](../../App.tsx#L2169) (imported at line 43). The docs and the code disagree.

**Steps:**
1. **Determine ground truth.** Trace `APReviewTutorView` in App.tsx: what `state.view` value renders it, and is there a live navigation path (deep link, dashboard card, mode registry) that reaches that view? Grep for the view string and any handlers.
   - If **reachable/live:** it's a real feature. Update CLAUDE.md — the "AP Review Bots Deprecated" entry is misleading. Add a note that `APReviewTutorView` is the current AP tutor surface (distinct from the deleted `ApPrepView`), and reflect it in `MODE_REFERENCE.md` if it belongs there.
   - If **unreachable/orphaned:** confirm with David before deleting (CLAUDE.md requires confirmation for file deletion). If approved, remove the component, its App.tsx import + render branch, and any dead handlers/state. Do **not** delete without explicit approval.
2. **Fix CLAUDE.md metadata footer** ("Last Updated" section): it reads `Last Updated By: Gemini 3.6 Flash`. Update to reflect this maintenance pass. Note the commit `Co-Authored-By` footer in CLAUDE.md still specifies "Claude Sonnet 4.5" — leave the *instruction* as-is unless David wants it changed, but be aware commits are currently authored as Opus.
3. Update the CLAUDE.md "Last Updated" date and add a changelog bullet summarizing whatever Plans 1-2 changed.

**Verify:** `grep -rn "ApPrepView\|APReviewTutorView" --include="*.ts*" .` — every reference is either intentional live code or fully removed; no half-deleted state. `npm run build` passes.

**Risk:** Low, but **deletion requires David's sign-off.** Default to documenting reality rather than removing code if unsure.

---

## Plan 3 — Code-split the production bundle

**Why:** `npm run build` emits a single `dist/assets/index-*.js` of **4.3 MB (1.19 MB gzipped)** — the whole app, Mermaid's renderers, cytoscape (442 KB), treemap (375 KB), Recharts, and three.js (`@react-three`) all eagerly loaded on first paint. Students on slow connections pay for all 13 simulations and every diagram engine before they see the landing page. There is currently **no `build` config in [vite.config.ts](../../vite.config.ts) and no `React.lazy` anywhere in App.tsx** (68 static component imports).

Do this in two independently-committable steps.

### Step 3a — Manual chunk splitting (low risk, immediate win)

Add a `build` section to the returned config object in [vite.config.ts](../../vite.config.ts) (alongside `server` and `plugins`):
```js
build: {
  chunkSizeWarningLimit: 1000,
  rollupOptions: {
    output: {
      manualChunks: {
        mermaid: ['mermaid'],
        three: ['@react-three/fiber', '@react-three/drei', 'three'],
        charts: ['recharts'],
        genai: ['@google/genai', '@google/generative-ai'],
      },
    },
  },
},
```
(Confirm each package name against `package.json` before listing it; `three` may be transitive — include only if it resolves.) This alone pulls the heavy libraries out of the main chunk so they cache separately and don't invalidate on app-code changes.

**Verify:** `npm run build` produces separate `mermaid-*`, `three-*`, `charts-*` chunks; main `index-*.js` shrinks materially. App still runs (`npm run preview`, smoke-test landing + one simulation + one AI mode).

### Step 3b — Lazy-load simulations and Mermaid (higher value, more care)

1. **Simulations:** In App.tsx, convert the 13 simulation-view imports (lines ~85-94 and neighbors — `CovalentBondingView`, `IonicBondingBuilderView`, `PeriodicTableView`, `EcosystemSimulationView`, `PopulationGeneticsView`, `PhaseChangeView`, `RegulatoryModelerView`, `DiffusionView`, `KineticsView`, `GasLawsView`, plus `BuildAnAtom`, `MotionTrackerView`, `FreeBodyDiagram`) from static `import X from '...'` to `const X = React.lazy(() => import('...'))`. Wrap the render sites in `<Suspense fallback={<LoadingSpinner/>}>` (reuse an existing spinner component; check what other loading states use).
2. **Mermaid:** [components/MermaidDiagram.tsx](../../components/MermaidDiagram.tsx) statically `import mermaid from 'mermaid'` at line 2, and is consumed by `AITutorPanel.tsx`, `MarkdownRenderer.tsx`, `ResultsView.tsx`. Either (a) lazy-load `MermaidDiagram` itself via `React.lazy` at its three consumers, or (b) switch the inner `import mermaid` to a dynamic `await import('mermaid')` inside the render effect so the 1 MB+ of diagram engines load only when a diagram actually renders. Option (b) is cleaner since Mermaid is already isolated to one component.

**Watch for:** `React.lazy` requires the target module to have a **default export** — verify each simulation view is a default export before converting (some may be named exports; those need the `.then(m => ({ default: m.Named }))` form). Every lazy component **must** be rendered inside a `<Suspense>` boundary or it throws.

**Verify:** `npm run build` — simulation code splits into per-sim (or grouped) chunks; Mermaid no longer in the main chunk. `npm run preview` and confirm: landing loads, each simulation opens without a flash-of-error, AI modes that render Mermaid still show diagrams. `npm run lint` clean.

**Risk:** Medium. Lazy boundaries can surface missing-Suspense or default-export issues at runtime, not build time — smoke-test each converted view. Commit 3a and 3b separately.

---

## Plan 4 — Reduce oversized components (ongoing debt, lowest urgency)

**Why last:** Largest effort, no functional payoff, purely maintainability. CLAUDE.md sets a **600-line component cap** and its own "Technical Debt Prevention" section claims JeopardyGame was refactored to 1,143 lines — it has since regrown to **1,946**. Do this **incrementally**, one component per commit, and only after Plans 1-3 land. Do **not** attempt all at once.

**Current worst offenders (lines):**
| File | Lines |
|---|---|
| components/jeopardy/JeopardyGame.tsx | 1946 |
| components/LandingPage.tsx | 1316 |
| components/simulations/covalentBonding/CovalentBondingView.tsx | 1155 |
| components/simulations/periodicTable/PeriodicTableView.tsx | 1013 |
| components/charades/CharadesGameView.tsx | 1011 |
| components/taboo/TabooGameView.tsx | 967 |
| components/ChangelogView.tsx | 952 |
| components/APReviewTutorView.tsx | 913 (resolve via Plan 2 first) |
| components/simulations/buildAnAtom/BuildAnAtom.tsx | 892 |

**Approach (per CLAUDE.md "Refactoring Checklist"):**
1. Start with **JeopardyGame.tsx** (worst, and has prior extraction precedent in `components/jeopardy/`). Extract in this order of safety:
   - Pure helpers → new files under `components/jeopardy/` (font-sizing, score math, board normalization already partly external — pull the rest).
   - Presentational sub-components (clue modal, HUD, pre-game review board, Daily Double UI) → separate `.tsx` files with typed props.
   - Custom hooks for the clue/turn/timer state machines.
2. **Build after each extraction** (`npm run build`) and commit each logical extraction separately — never one giant refactor commit.
3. Do **not** change behavior. This is mechanical extraction only. No feature changes, no prop-shape redesigns beyond what extraction requires.
4. Skip `ChangelogView.tsx` unless it's genuinely painful — it's long because it's data (changelog entries), and splitting data files yields little.

**Verify per component:** `wc -l` drops under (or toward) 600; `npm run build` + `npm run lint` clean; the mode still works end-to-end in `npm run preview`.

**Stop condition:** This is open-ended. Recommend doing JeopardyGame + LandingPage only, then reassessing with David whether the remainder is worth the churn.

---

## Suggested execution order recap
1. **Plan 1** — FRQView bug + ESLint gate (one PR). Fast, high value, unblocks lint.
2. **Plan 2** — Doc drift / AP reconciliation. Fast, resolves an ambiguity Plan 4 needs.
3. **Plan 3** — Bundle code-splitting (3a then 3b, separate commits). High user-facing value.
4. **Plan 4** — Oversized-component refactors, incrementally, JeopardyGame first. Lowest urgency.
