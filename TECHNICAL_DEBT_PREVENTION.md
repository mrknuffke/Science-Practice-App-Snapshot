# Technical Debt Prevention Guide

This guide documents best practices to prevent technical debt accumulation in the Science Practice Partner codebase.

## Quick Reference

**Before Writing Code:**
- [ ] Will this component exceed 600 lines? → Plan to extract utilities/sub-components
- [ ] Am I using `any` type? → Use proper types or `unknown`
- [ ] Is this function >50 lines? → Consider extracting to utility
- [ ] Does this logic belong in App.tsx? → Consider custom hook or context

**Before Committing:**
- [ ] Run `npm run build` (must pass)
- [ ] Run `npm run lint` (fix all ERRORs)
- [ ] No `console.log` statements (use `console.warn` or `console.error` if needed)
- [ ] All `any` types replaced with proper types
- [ ] Component size <600 lines

---

## Component Organization

### Size Limits

| Component Type | Max Lines | Action When Exceeded |
|----------------|-----------|---------------------|
| View Components | 600 | Extract sub-components, utilities, or hooks |
| Utility Functions | 50 | Split into smaller functions |
| Custom Hooks | 100 | Extract helper functions |

### When to Extract

**Extract to Utility File:**
- Pure functions with no React dependencies
- Functions used in multiple components
- Complex calculations or transformations
- Examples: `fontUtils.ts`, `audioUtils.ts`

**Extract to Custom Hook:**
- Reusable state logic
- Side effects with cleanup
- Complex state management
- Examples: `useTheme.ts`, `useErrorHandler.ts`, `useKeyboardNavigation.ts`

**Extract to Sub-Component:**
- Self-contained UI with own state
- Reusable across views
- Clear single responsibility
- Examples: `CountdownTimer.tsx`, `Confetti.tsx`

**Extract to Context:**
- Cross-cutting state (used by many components)
- Global configuration
- Authentication/authorization
- Examples: `AuthContext`, `AppConfigContext`, `ToastContext`

---

## Type Safety

### Never Use `any`

❌ **Bad:**
```typescript
function handleError(err: any) {
  alert(err.message);
}
```

✅ **Good:**
```typescript
import { errorMessage } from '../utils/errorMessage';

try { await generate(); }
catch (err) {           // a catch variable is `unknown`; never annotate it `any`
  setError(errorMessage(err, 'Could not generate the quiz.'));
}
```

**AI replies:** type the parse, not the call site. Annotate what `JSON.parse` returns with the
shape the prompt asked for (`const result: { questions?: Question[] } = JSON.parse(...)`), and
check arrays before mapping: the model does not always follow its schema. Shared reply shapes
live beside their service (`ApFRQ`, `LoopDiagnosis` and the rest).

**Untyped JavaScript in a vm sandbox** (tests that load the static books) is the one place a
file-level `eslint-disable @typescript-eslint/no-explicit-any` is allowed, with the reason on the
same line. As of 2026-11-02 there are two, and ESLint reports 0 warnings repo-wide; keep it there.

### Type Imports

Always import types from `types.ts`:
```typescript
import { AppState, Question, CourseType, AppConfig } from './types';
```

Use `Partial<T>` for optional config:
```typescript
function updateConfig(config?: Partial<AppConfig>) {
  // ...
}
```

---

## Code Extraction Patterns

### Pattern 1: Extract Utility Function

**Before:**
```typescript
// Inside large component (100+ lines)
const getAdaptiveFontSize = (text: string, size: number) => {
  // 50 lines of logic
};
```

**After:**
```typescript
// utils/fontUtils.ts
export const getAdaptiveFontSize = (text: string, size: number): string => {
  // 50 lines of logic
};

// Component.tsx
import { getAdaptiveFontSize } from './utils/fontUtils';
```

### Pattern 2: Extract Custom Hook

**Before:**
```typescript
// Inside component
const [error, setError] = useState<string | null>(null);
const showError = (msg: string) => setError(msg);
const clearError = () => setError(null);
```

**After:**
```typescript
// hooks/useErrorHandler.ts
export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);
  const showError = useCallback((msg: string) => setError(msg), []);
  const clearError = useCallback(() => setError(null), []);
  return { error, showError, clearError };
};

// Component.tsx
const { error, showError, clearError } = useErrorHandler();
```

### Pattern 3: Extract Sub-Component

**Before:**
```typescript
// Inside 1000-line JeopardyGame.tsx
const CountdownTimer = () => {
  // 50 lines of timer logic
};
```

**After:**
```typescript
// components/jeopardy/CountdownTimer.tsx
export const CountdownTimer: React.FC = () => {
  // 50 lines of timer logic
};

// JeopardyGame.tsx
import { CountdownTimer } from './CountdownTimer';
```

---

## Linting Standards

### ESLint Configuration

**Enforced Rules (ERROR - must fix):**
- `no-console` - No `console.log()` (use `console.warn()` or `console.error()`)
- `react-hooks/rules-of-hooks` - Hooks must follow React rules

**Warning Rules (fix every one; the count is 0 as of 2026-11-02):**
- `@typescript-eslint/no-unused-vars` - Remove unused variables
- `@typescript-eslint/no-explicit-any` - Replace `any` with proper types
- `react-hooks/exhaustive-deps` - Add the missing dependency, or, when the effect must run only
  once or only when one prop changes, keep the list and write why on the disable line:
  `// eslint-disable-next-line react-hooks/exhaustive-deps -- one AI report per visit`.
  A keyboard listener never needs this: use `useWindowKeydown` (below).

### Shared hooks for keyboard and modals

- **Keyboard shortcuts:** `useWindowKeydown(handler)` from `hooks/useWindowKeydown.ts`. It always
  calls the handler from the latest render, so a shortcut cannot act on old state. A plain
  `useEffect` listener with a missed dependency did exactly that in Charades and Taboo (a key press
  after the timer ran out did not end the turn).
- **Modals:** `useDialog({ onClose, labelledBy })` from `hooks/useDialog.ts`, spread on the panel
  (not the backdrop). It moves focus in, keeps Tab inside, closes on Escape and returns focus to the
  opener. Leave out `onClose` for a dialog the student must answer.
- **Icon-only buttons** need `aria-label`; `services/__tests__/a11yButtons.test.ts` fails otherwise.
- **Form fields** (`input`, `textarea`, `select`) need a name too: `aria-label` matching the visible label, a wrapping `<label>`, or `id` plus `<label htmlFor>`. Placeholder text is not a name. Guarded by `services/__tests__/a11yFormFields.test.ts`. Prefer `aria-label` in components that can render twice, where a fixed `id` would repeat.
- **Simulation tests:** check every particle every step, but collect problems into an array and `expect` once. An `expect()` per particle per step made two `chemUnit4Models` tests take 2 to 4 s and brush the 5 s limit under parallel load.
- **Markdown inside a button or option:** pass `INLINE_PARAGRAPHS` (or `SPACED_PARAGRAPHS`) from
  `MarkdownRenderer.tsx`, not an inline `components={{ p: ... }}` object, which re-renders the
  markdown on every render.

### Running Linter

```bash
# Check for violations
npm run lint

# Auto-fix formatting issues
npm run lint:fix
```

**Ignore Patterns:**
Use `_` prefix for intentionally unused variables:
```typescript
function handler(_event: Event, data: Data) {
  // Only using data, not event
}
```

---

## Refactoring Process

### Step-by-Step Refactoring

1. **Identify Target:**
   - Find component >600 lines
   - Identify self-contained sections

2. **Plan Extraction:**
   - List what to extract (utilities, hooks, sub-components)
   - Determine file structure
   - Check for dependencies

3. **Extract Incrementally:**
   ```bash
   # Extract one piece at a time
   1. Create new file with extracted code
   2. Add imports to new file
   3. Update original file to import
   4. Test: npm run build
   5. Commit: git commit -m "refactor: extract XYZ from Component"
   6. Repeat
   ```

4. **Test Thoroughly:**
   - Build must pass: `npm run build`
   - Lint must pass: `npm run lint`
   - Manual testing in browser

### Example Refactoring Session

```bash
# Start with 1,360-line JeopardyGame.tsx

# Extract audio utilities
git commit -m "refactor(jeopardy): extract audio utilities"
# Now: 1,240 lines

# Extract CountdownTimer component
git commit -m "refactor(jeopardy): extract CountdownTimer"
# Now: 1,190 lines

# Extract Confetti animation
git commit -m "refactor(jeopardy): extract Confetti"
# Now: 1,143 lines

# Final result: 217 lines removed (16% reduction)
```

---

## Common Anti-Patterns to Avoid

### ❌ God Components
**Problem:** Single component doing everything (routing, state, UI, business logic)

**Solution:** Extract concerns into hooks, contexts, and sub-components

### ❌ Prop Drilling
**Problem:** Passing props through 5+ levels

**Solution:** Use Context API for cross-cutting concerns

### ❌ Duplicate Logic
**Problem:** Same function copied across multiple files

**Solution:** Extract to shared utility file

### ❌ Magic Numbers
**Problem:** Hardcoded values without explanation

**Solution:** Extract to constants with descriptive names
```typescript
// Bad
if (text.length > 30) return 'text-[6px]';

// Good
const MAX_TEXT_LENGTH_SMALL_FONT = 30;
if (text.length > MAX_TEXT_LENGTH_SMALL_FONT) return 'text-[6px]';
```

### ❌ Weak Types
**Problem:** Using `any` everywhere

**Solution:** Create proper interfaces and use type inference

---

## File Organization

### Recommended Structure

```
/components
  /jeopardy
    JeopardyGame.tsx        # Main component (<600 lines)
    CountdownTimer.tsx      # Sub-component
    Confetti.tsx            # Sub-component
    RenderHTML.tsx          # Utility component
    audioUtils.ts           # Pure utilities
  /squareMatch
    SquareMatchView.tsx     # Main component
    fontUtils.ts            # Pure utilities

/hooks
  useTheme.ts              # Theme logic
  useErrorHandler.ts       # Error state
  useKeyboardNavigation.ts # Keyboard shortcuts

/contexts
  AuthContext.tsx          # Authentication
  AppConfigContext.tsx     # App settings
  ToastContext.tsx         # Toast notifications

/utils
  sanitize.ts              # DOMPurify helpers
```

### Naming Conventions

- **Components:** PascalCase - `CountdownTimer.tsx`
- **Hooks:** camelCase with `use` prefix - `useTheme.ts`
- **Utils:** camelCase - `audioUtils.ts`, `fontUtils.ts`
- **Contexts:** PascalCase with `Context` suffix - `AuthContext.tsx`

---

## Metrics & Goals

### Current State (2026-10-28)

| Metric | Value |
|--------|-------|
| Largest component (`components/`) | `CovalentBondingView.tsx` (1,361 lines) |
| Components >600 lines | 22 (mostly interactive simulations & multi-mode hubs) |
| Shared hooks & utilities | 17 modules (`hooks/` + `utils/`, including `useSpeechRecognition.ts`) |
| `any` types in `App.tsx` | 5 (down from 152) |
| Total explicit `any` across codebase | 228 (down from 260+) |
| Drift-guard & unit test suites | 47 test files (`npm test`) |
| ESLint errors / unused-var warnings | 0 errors, 0 unused-var warnings across all `.ts/.tsx` and `public/**/*.js` files |
| `console.log` statements | 0 (enforced) |

### Goals

- Keep all components <600 lines
- Reduce `any` types to <50 per file
- 100% ESLint error-free
- Extract 1-2 utilities per large feature addition

---

## Review Checklist

Use this checklist when reviewing PRs or your own code:

### Code Quality
- [ ] No component exceeds 600 lines
- [ ] No function exceeds 50 lines (unless well-justified)
- [ ] No `any` types (use `unknown` or proper types)
- [ ] No `console.log` statements
- [ ] TypeScript types properly imported and used

### Organization
- [ ] Utilities extracted to separate files
- [ ] Custom hooks for reusable state logic
- [ ] Sub-components for self-contained UI
- [ ] Contexts for cross-cutting concerns

### Documentation
- [ ] JSDoc comments on exported functions
- [ ] Complex logic has explanatory comments
- [ ] README updated if public API changed

### Testing
- [ ] `npm run build` passes
- [ ] `npm run lint` has no errors
- [ ] Manual testing in browser
- [ ] No regression in existing features

---

## Resources

- **CLAUDE.md** - Project conventions and architecture
- **MODE_REFERENCE.md** - Feature matrix and mode details
- **DEVELOPER_GUIDE.md** - Setup and development workflow
- **DESIGN_SYSTEM.md** - UI/UX standards

## Questions?

When in doubt:
1. Check if similar pattern exists in codebase
2. Refer to this guide
3. Extract early, extract often
4. Keep it simple and focused

---

*Last Updated: 2026-10-28*
