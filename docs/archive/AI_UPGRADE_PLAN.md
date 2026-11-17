# AI Upgrade Plan — Model Bump, Advisor Deep Links & Gradual-Release Scaffolding

**Audience:** an AI coding agent (Gemini 3.6 high) executing against this repo.
**Read first:** `CLAUDE.md` (conventions, pre-commit checklist). Do not commit — leave changes staged for David to review.

This plan has four parts. Do them **in order**; each part must build cleanly (`npm run build` and `npm run lint`) before starting the next.

---

## Part 1 — Upgrade to `gemini-3.6-flash` and eliminate hardcoded model strings

### 1.1 Bump the default model

In `services/ai/core.ts` line 5, change:

```ts
export const DEFAULT_MODEL = "gemini-3.6-flash";
```

`gemini-3.6-flash` is the current **stable** (non-preview) Flash model as of July 21, 2026. It supports `responseMimeType: "application/json"` + `responseSchema` structured output, which this codebase depends on everywhere.

### 1.2 Replace hardcoded model strings with `DEFAULT_MODEL`

These call sites hardcode model IDs and must instead import and use `DEFAULT_MODEL` (from `./core` inside `services/ai/`, from `./ai/core` for files directly in `services/`):

| File | Lines (approx.) | Current hardcoded value |
|---|---|---|
| `services/ai/apReview.ts` | 194, 279, 343, 409, 447 | `'gemini-2.5-flash'` |
| `services/ai/learningLoop.ts` | 58, 132, 212, 281 | `'gemini-2.5-flash'` |
| `services/bingoService.ts` | 260 | `"gemini-2.0-flash"` |
| `services/pdfService.ts` | 88 | `'gemini-2.0-flash'` |
| `services/tarsiaService.ts` | 289, 378 | `"gemini-2.0-flash"` |

**Exception — do NOT change:** `services/jeopardyService.ts` line 467 (`'gemini-2.5-pro'`). This is the vision model for `analyzeImage`, deliberately pinned. Add a one-line comment: `// Vision model — deliberately pinned, not DEFAULT_MODEL`.

### 1.3 Fix stale comments

File-header comments in `services/ai/frq.ts` (line 7), `services/ai/cer.ts` (line 7), and `services/ai/grading.ts` (lines 7, 114, 321) claim the code uses `gemini-3-flash-preview`. The code actually uses `DEFAULT_MODEL`. Reword each comment to say "Uses DEFAULT_MODEL" without naming a specific model, so they can't go stale again.

### 1.4 Validate

1. `npm run build` — zero errors.
2. Grep check: `grep -rn "gemini-" services/` should show only `core.ts` (DEFAULT_MODEL) and `jeopardyService.ts:467` (pinned vision model) as actual call-site strings.
3. Runtime smoke test (`npm run dev`, sign in with an approved Google Workspace account): generate a Practice Session quiz (exercises `responseSchema` JSON mode), ask the homepage mascot advisor a question, and grade one FRQ answer. All three must return well-formed results.
4. If JSON-mode calls fail on the new model, check `callAI` in `services/ai/core.ts` — do **not** work around failures by switching to a preview model (CLAUDE.md rule). Report the failure instead.

---

## Part 2 — Homepage advisor: deep links, bot-driven settings, first-run picker

The homepage AI is the "Science Buddy" mascot advisor:
- **Prompt:** `getMascotAdvisorResponse` in `services/ai/tutor.ts` (~line 237). It embeds bracketed tags like `[quiz]`, `[simulations]` in its replies.
- **Rendering:** `renderMessageWithShortcuts` in `components/LandingPage.tsx` (~line 288) splits on `/(\[[a-z_]+\])/g` and renders a button per tag via a `switch`.
- **Wiring:** `App.tsx` ~line 1713 (`onGetAIAdvisorResponse`) and the `landingProps` object (~lines 1660–1731).

Today the advisor can only send students to the Simulations **Hub**. Goal: link directly to individual simulations and info pages, let the bot change simple settings, and add a first-run theme/avatar picker inside the chat box.

### 2.1 Create a shared simulation registry (single source of truth)

**New file:** `constants/simulationsRegistry.ts`

```ts
import { ViewType } from '../types';

export interface SimulationInfo {
  id: string;        // stable slug, used in advisor tags as [sim:<id>]
  view: ViewType;    // App.tsx view to navigate to
  title: string;
  blurb: string;     // one line, used in the AI prompt and hub card
  topics: string[];  // used for AI matching ("student asks about gas laws")
  emoji: string;     // used on the advisor shortcut button
}

export const SIMULATIONS_REGISTRY: SimulationInfo[] = [ /* 13 entries */ ];
```

Populate all 13 entries. `id`/`view` pairs (views verified against `types.ts` `ViewType` and the `publicPages` map in `App.tsx` ~line 866):

| id | view |
|---|---|
| `ecosystem_balance` | `ecosystem_simulation` |
| `population_genetics` | `population_genetics` |
| `covalent_bonding` | `covalent_bonding` |
| `ionic_bonding` | `ionic_bonding` |
| `periodic_table` | `periodic_table` |
| `build_an_atom` | `build_an_atom` |
| `phase_change` | `phase_change` |
| `regulatory_modeler` | `regulatory_modeler` |
| `diffusion_simulation` | `diffusion_simulation` |
| `reaction_kinetics_simulation` | `reaction_kinetics_simulation` |
| `gas_laws` | `gas_laws` |
| `free_body_diagram` | `free_body_diagram` |
| `motion_tracker` | `motion_tracker` |

Copy `title`/`blurb`/`topics` from the existing `simulations` array in `components/SimulationsHub.tsx` (~line 70) — titles and descriptions are already written there; shorten each description to ≤15 words for `blurb`.

**Make the hub consume the registry** so new sims can't diverge: in `SimulationsHub.tsx`, build the card list by mapping over `SIMULATIONS_REGISTRY` and looking up per-sim visual config (icon, gradient, subject, status, onClick handler) from a local `Record<string, …>` keyed by `id`. Title/description/topics come from the registry. If a registry entry has no visual config, fall back to a default icon (`FlaskConical`), `'General'` subject, and gradient `'from-slate-500 to-slate-600'` — this guarantees a newly registered sim appears in both the hub and the advisor even if the visual entry is forgotten.

Add a comment at the top of the registry file: `// ADDING A NEW SIMULATION? Add it here first — the Simulations Hub and the homepage AI advisor both derive their lists from this registry.`

### 2.2 Teach the advisor the new tags

In `getMascotAdvisorResponse` (`services/ai/tutor.ts`):

1. Import `SIMULATIONS_REGISTRY` (path: `../../constants/simulationsRegistry`).
2. Build the sim list dynamically inside the system prompt:

```ts
const simList = SIMULATIONS_REGISTRY
  .map(s => `   - [sim:${s.id}] : ${s.title} — ${s.blurb} (topics: ${s.topics.join(', ')})`)
  .join('\n');
```

3. In the `NAVIGATION & TARGETED SHORTCUTS` section of the prompt, keep every existing tag, and:
   - After the `[simulations]` line, insert: `DIRECT SIMULATION LINKS — when the user names a specific simulation, science topic, or activity matching one below, you MUST use its direct [sim:...] tag instead of the generic [simulations] hub tag:` followed by `${simList}`. Keep `[simulations]` documented as the fallback for "browse everything."
   - Add info-page tags:
     - `[how_it_works] : How It Works page (what the site is, how the AI tools work)`
     - `[features] : Full feature tour page`
     - `[changelog] : What's New / recent updates page`
     - `[support] : Support the Project page (Ko-Fi)`
4. Keep rule 4 ("MUST embed at least one bracketed tag") unchanged — it applies to the new tags too.

### 2.3 Render the new tags in `LandingPage.tsx`

In `renderMessageWithShortcuts`:

1. Widen the split regex to allow colons: `/(\[[a-z_:]+\])/g` (both occurrences — text pass and button pass).
2. **Before** the existing `switch`, handle sim tags generically:

```ts
if (modeId.startsWith('sim:')) {
  const sim = SIMULATIONS_REGISTRY.find(s => s.id === modeId.slice(4));
  if (sim && onOpenSimulation) {
    return (
      <button key={index} onClick={() => onOpenSimulation(sim.view)}
        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all">
        {sim.emoji} Launch {sim.title}
      </button>
    );
  }
  return null; // unknown sim id from the model — render nothing, never crash
}
```

3. Add `switch` cases for `how_it_works`, `features`, `changelog`, `support`, each guarded like the existing `settings` case (`return onShowHowItWorks ? (…) : null;`). Match the existing button styling; suggested labels: `📖 How It Works`, `✨ Feature Tour`, `🆕 What's New`, `💙 Support the Project`.

**New `LandingPage` props** (add to the props interface, all optional like `onOpenSettings`):

```ts
onOpenSimulation?: (view: ViewType) => void;
onShowHowItWorks?: () => void;
onShowFeatures?: () => void;
onShowChangelog?: () => void;
onOpenSupport?: () => void;
```

**Wire them in `App.tsx`** inside `landingProps` (~line 1660–1731). For `onOpenSimulation`, mirror the existing public deep-link logic (~line 894):

```ts
onOpenSimulation: (view: ViewType) => setState(prev => ({
  ...prev, view, mode: 'simulation' as const,
  selectedCourse: prev.selectedCourse || 'General Chemistry' as CourseType,
})),
onShowHowItWorks: () => setState(prev => ({ ...prev, view: 'how_it_works' })),
onShowFeatures: () => setState(prev => ({ ...prev, view: 'features' })),
onShowChangelog: () => setState(prev => ({ ...prev, view: 'changelog' })),
onOpenSupport: () => setState(prev => ({ ...prev, view: 'support' })),
```

(All five views already exist in `ViewType` and are handled in App's render — verify `support` renders `SupportView` and adjust the view string if it differs.)

### 2.4 Bot-driven settings changes (ACTION tags)

Let students change simple settings by asking the bot ("switch to dark mode", "call me Sam", "I want the gerbil"). Same pattern as the existing `[[METADATA: …]]` tag: the model appends a machine-readable tag, the client parses, validates against a strict allowlist, executes, and strips it from the visible text.

**Prompt addition** (in `getMascotAdvisorResponse`, new numbered section after the METADATA section):

```
6. DIRECT SETTINGS ACTIONS: If the user EXPLICITLY asks you to change one of these
   settings, append an action tag at the very end of your response (after any metadata tag):
   [[ACTION: {"type": "<type>", "value": <value>}]]
   Allowed actions — NOTHING ELSE:
   - {"type": "set_dark_mode", "value": true | false}
   - {"type": "set_mascot", "value": "robot" | "beaker" | "plant" | "gerbil"}
   - {"type": "set_username", "value": "<the name they asked for, max 30 chars>"}
   Rules: at most ONE action tag per response. Only when the request is explicit and
   unambiguous — if unsure, ask instead. In your visible text, confirm what you're doing
   ("Flipping the lights off, Sam! 🌙"). For anything else (dyslexia font, teacher mode,
   classroom keys, resets), do NOT emit an action — point them to [settings].
```

**Client parsing** in `handleSendAdvisorMessage` (`components/LandingPage.tsx`, ~line 242), after the METADATA block:

```ts
const actionRegex = /\[\[ACTION:\s*(\{.*?\})\s*\]\]/;
const actionMatch = reply.match(actionRegex);
if (actionMatch && actionMatch[1]) {
  try {
    const action: unknown = JSON.parse(actionMatch[1]);
    applyAdvisorAction(action); // validated below
  } catch { /* malformed — ignore silently */ }
  reply = reply.replace(actionRegex, '').trim();
}
```

`applyAdvisorAction` (helper inside `LandingPage`) must **strictly validate** before executing — treat the model output as untrusted:
- `set_dark_mode`: `typeof value === 'boolean'` → call new prop `onSetDarkMode(value)`.
- `set_mascot`: `value` is one of the 4 literal strings → call new prop `onSetMascot(value)`.
- `set_username`: `typeof value === 'string'`, trimmed, non-empty, `slice(0, 30)` → call existing prop `onChangeUsername(value)`.
- Any other `type`: ignore. Never `eval`, never render action content as HTML.
- On success, append a local (non-AI) confirmation message to `advisorMessages`, e.g. `{ role: 'model', text: '✅ Done — dark mode is on!' }`.

**New props + App wiring:**

```ts
// LandingPage props
onSetDarkMode?: (value: boolean) => void;
onSetMascot?: (value: 'robot' | 'beaker' | 'plant' | 'gerbil') => void;

// App.tsx landingProps
onSetDarkMode: (v: boolean) => setIsDarkMode(v),
onSetMascot: (m) => setMascot(m),
```

`setIsDarkMode` / `setMascot` already exist in `App.tsx` (~lines 280, 305) with localStorage persistence — no storage code needed. **Privacy check:** username is a self-chosen display name already stored in `sp_username`; no new PII surface.

### 2.5 First-run setup inside the advisor box

When a user who hasn't completed advisor setup opens the dashboard, the advisor chat box should open with a scripted (no AI call) welcome offering theme + avatar choices.

In `components/LandingPage.tsx`:

1. New localStorage flag `sp_advisor_setup_done`. On mount (a `useEffect`), if not set: `setIsAdvisorActive(true)` and seed `advisorMessages` with one scripted message object flagged `{ role: 'model', text: "Hi! I'm your science study buddy. Before we start — set things up your way:", setupPrompt: true }`.
2. When rendering a message with `setupPrompt: true`, render (instead of shortcut parsing) two labelled button rows:
   - **Appearance:** `☀️ Light` / `🌙 Dark` → `onSetDarkMode(false | true)`
   - **Your buddy:** `🤖 Science Bot` / `🧪 Beaker Buddy` / `🌱 Happy Plant` / `🐹 Cool Gerbil` → `onSetMascot(...)`
   - A small "Skip" text link.
3. Picking a mascot or clicking Skip sets `sp_advisor_setup_done = 'true'` and appends a scripted follow-up: `"You're all set! Ask me anything — like 'start the gas laws sim' or 'quiz me on photosynthesis.'"`. Theme picks apply immediately but don't complete setup (mascot/Skip does), so users can try both themes.
4. This is independent of the existing onboarding walkthrough (`sp_onboarding_visited`) — do not touch that flow. Existing users will see the picker once; that's acceptable.
5. Buttons must meet the 44px touch-target minimum and use theme-derived colors (no new hardcoded palette beyond the existing advisor button styles).

### 2.6 Validate Part 2

- `npm run build` + `npm run lint` clean.
- Dev test: ask the advisor "can you start the gas laws simulation?" → reply contains a **Launch Ideal Gas Laws** button that opens the sim directly (not the hub). Ask "what's new on the site?" → changelog button. Ask "turn on dark mode" → theme flips + confirmation message. Ask "change my name to Alex" → header username updates.
- Adversarial test: manually craft a message that makes the model emit an unknown action type (or temporarily hand-inject `[[ACTION: {"type":"nuke","value":1}]]` in the parser test) → must be silently ignored, no crash.
- Fresh-profile test (clear localStorage): advisor box opens with the theme/avatar picker; choices persist after reload.

---

## Part 3 — Gradual-release scaffolding (Calculation Partner + Explanation Partner)

**Intent (confirmed with David):** support level is determined *per session, from how that conversation is actually going* — start fully guided, and as the student demonstrates competence *in this conversation*, hand progressively more ownership to them. Step back down if they struggle. Nothing persists across sessions; since every call passes full chat history, the model re-derives the current level from the history on each turn — no new state, storage, or props required. **This is a prompt-only change.**

### 3.1 Shared scaffolding block

Add this block (as a `const GRADUAL_RELEASE_BLOCK = \`…\`;` near the top of `services/ai/tutor.ts`) and inject it into both system prompts below:

```
GRADUAL RELEASE OF RESPONSIBILITY:
Your support level is not fixed. Re-assess it every turn from this conversation's history.

LEVEL 1 — GUIDED (default at session start, or when a new topic/problem type appears):
Work one small step at a time. Offer hints freely. Ask narrow leading questions.

LEVEL 2 — COACHED (student has completed ~2 consecutive steps correctly without hints):
Hand over chunks: "You've got this pattern — do the next two steps and show me."
Respond to their attempt as a whole. Hints only on request or on error.

LEVEL 3 — INDEPENDENT (student is handling chunks cleanly):
The student leads. Ask them to outline their full approach before touching the details,
then let them execute it. You verify reasoning at the end and ask one metacognitive
question ("How would you know if that answer is reasonable?" / "Where else does this
strategy apply?").

MOVEMENT RULES:
- Promote after sustained success; demote one level after two consecutive errors or
  clear confusion — without shaming ("Let's slow back down and take this piece by piece").
- Announce promotions explicitly and encouragingly, so the student knows the training
  wheels are coming off on purpose.
- A brand-new problem TYPE resets toward Level 1; a new problem of a familiar type
  starts at the current level.
- Your goal is that by session end the student is doing more of the thinking than you are.
  Never do thinking for a student that the history shows they can do themselves.
```

### 3.2 Calculation Partner

In `getCalculationChatResponse` (`services/ai/tutor.ts`, ~line 67):

1. Insert `${GRADUAL_RELEASE_BLOCK}` into the system prompt after the SCENARIO definitions.
2. Reconcile the existing CRITICAL RULES with the block:
   - Rule 1 (`NO ANSWERS`) is unchanged and applies **at every level** — add "(applies at every gradual-release level)".
   - Rule 2 (`STEP-BY-STEP: Force one step at a time`) currently contradicts Levels 2–3. Reword to: `STEP-BY-STEP FRAMEWORK: The canonical solution path is: 1 identify variables → 2 select equation → 3 rearrange → 4 substitute with units → 5 calculate. At Level 1, walk it one step at a time. At Levels 2–3, the student traverses multiple steps per turn — you check their work against this framework instead of dictating it.`

### 3.3 Explanation Partner

In `getExplanationChatResponse` (`services/ai/tutor.ts`, ~line 145):

1. Insert `${GRADUAL_RELEASE_BLOCK}` into the system prompt after `${personaInstruction}`.
2. Amend METHOD rule 1 ("Ask one focused question at a time") with: `(Level 1 behavior — at higher levels, invite longer student-led explanations and respond to them as a whole.)`
3. Amend METHOD rule 5 ("under 50 words") with: `At Level 3 your turns should get SHORTER, not longer — the student is doing the talking.`
4. The block layers onto all 4 personas (Tutor / Socratic / Skeptic / Growth Coach) — no per-persona changes needed; verify no persona instruction contradicts it (none currently do).

### 3.4 Validate Part 3

Manual conversation test in dev, per mode:
- **Calculation:** give a stoichiometry problem, answer the first 2–3 prompts correctly → the AI should explicitly promote ("try the next two steps yourself"). Then answer twice incorrectly → it should step back to one-step guidance. Confirm it still never states the final numeric answer.
- **Explanation (Socratic):** answer 2–3 questions well → the AI should start asking for fuller self-explanations and its own turns should shorten.
- **Red Team (CLAUDE.md AI-safety check, required because prompts changed):** ask the Calculation Partner a dangerous-synthesis question → safe refusal must still occur.

---

## Part 4 — Documentation (required by CLAUDE.md before any commit)

1. **`CLAUDE.md`:**
   - Model Selection section: change "(currently `gemini-2.5-flash`)" → "(currently `gemini-3.6-flash`)".
   - "Building New Interactives" section: add a step — new sims must be added to `constants/simulationsRegistry.ts` (hub + advisor derive from it).
   - Add a "Recent Changes" entry and update the "Last Updated" block (date, summary of Parts 1–3).
2. **`Developer_guide.md`:** document the advisor's new tag families (`[sim:*]`, info pages, `[[ACTION: …]]` allowlist) and the gradual-release block in both partner prompts.
3. **`MODE_REFERENCE.md`:** note gradual-release behavior on Calculation Partner and Explanation Partner rows/sections.
4. **`FEATURE_TRACKER.md`:** log the simulations registry as a shared module (consumed by SimulationsHub + LandingPage advisor + tutor prompt).
5. **`TESTING_GUIDE.md`:** add the Part 2.6 and 3.4 test cases.
6. **`components/ChangelogView.tsx`:** draft an entry (advisor deep links, bot settings, first-run picker, smarter tutoring that hands over ownership, model upgrade) but **ask David before finalizing**; preserve all existing user credits.

## Final checks

- `npm run build` and `npm run lint` pass.
- No `console.log` added (ESLint `no-console` is ERROR).
- No `any` types (use the union/`unknown` patterns shown above).
- Incognito gatekeeper test still blocks AI tools; free sims remain public.
- **Do not commit** — leave the working tree for David's review.
