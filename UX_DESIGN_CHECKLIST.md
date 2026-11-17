# 🎨 UX & Design Consistency Checklist

Use this checklist to audit existing modes and validate new ones. Ideally, every mode should hit 100% of these items to ensure a unified user experience.

## 1. Global Visual Standards (The "Look")
- [ ] **Typography Scale Adherence:** Does the surface use the standard token hierarchy?
    - React Modes: `text-3xs`, `text-2xs`, `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`.
    - Chemistry Textbook: `var(--text-3xs)` through `var(--text-4xl)`, plus `var(--text-reading)` (22px Spectral editorial prose).
    - **Anti-Drift Guard:** Absolutely zero ad-hoc fractional `rem` (e.g. `0.72rem`) or arbitrary pixel values (`text-[13px]`).
- [ ] **Color Palette Fidelity:** Are colors derived strictly from the design system?
    - React Modes: Subject theme logic (Biology = Emerald, Chem = Violet, etc.) or dark-mode neutrals (`bg-slate-900`, `bg-slate-800`, `text-white`, `text-slate-400`).
    - Chemistry Textbook: Canonical tokens (`--paper`, `--card`, `--ink`, `--ink-soft`, `--ink-mute`, `--accent`, `--good`, `--hair`).
- [ ] **Strict Zero Em-Dashes:** No em-dashes (`—` or `&mdash;`) anywhere in prose, code, comments, or labels.
- [ ] **Icon Consistency:**
    - Are icons using the same style (Outline vs. Solid) as the rest of the app?
    - Do buttons have consistent icon-to-text spacing (`gap-2`)?
- [ ] **Button States:**
    - **Primary Action:** Solid color, clear hover state.
    - **Secondary Action:** Outline or ghost style.
    - **Disabled State:** Visual feedback (opacity/gray) + `cursor-not-allowed`.
- [ ] **Spacing & Breathing Room:**
    - Is there enough margin between the header and the content?
    - Are clickable elements at least 44px x 44px (touch target)?

## 2. Interaction Design (The "Feel")
- [ ] **Entry Transition:**
    - Does the mode animate in? (e.g., `animate-in fade-in slide-in-from-bottom`).
    - Is there a clear "Back" button to return to the Landing Page?
- [ ] **Configuration Phase (Pre-Start):**
    - If the mode requires setup (Topic/Difficulty), is it contained in a clear Modal or Setup View?
    - Is the "Start" button hidden or disabled until valid inputs are provided?
- [ ] **Loading States:**
    - When AI is thinking, is there a visual indicator? (Spinner, Skeleton Loader, or "Thinking..." text).
    - Is the UI blocked or safe from modification while generating?
- [ ] **Error Handling:**
    - If the AI fails or network drops, does the user get a friendly error message?
    - Is there a "Retry" button?

## 3. Standard Utility Tools (The "Kit")
Check if these tools are present (or explicitly decided against):
- [ ] **Text-to-Speech (TTS):** Can the user listen to the AI's output?
- [ ] **Dictation:** Can the user speak their input?
- [ ] **Simplify:** Is there a toggle to lower the reading level of the text?
- [ ] **Harder/Easier:** (If applicable) Can the user adjust difficulty on the fly?
- [ ] **Refresh/Regenerate:** Can the user get a new question/problem without restarting the whole mode?

## 4. AI & Content Behavior
- [ ] **Tone Consistency:** Does the AI sound like "Science Practice Partner"? (Encouraging, formal but accessible, rigorous).
- [ ] **Formatting:**
    - Is Markdown rendered correctly? (Bold keys, Lists, Code blocks).
    - Are LaTeX equations rendered properly?
- [ ] **Empty States:**
    - What does the screen look like before the user types anything? (Placeholders, "Waiting for input..." states).

## 5. Mobile & Responsiveness
- [ ] **No Horizontal Scroll:** Does the layout fit on an iPhone SE (small screen)?
- [ ] **Touch Targets:** Are buttons easy to tap with a thumb?
- [ ] **Keyboard Adjustments:**
    - Does the virtual keyboard cover the input box?
    - Can the user submit with the "Enter" key (where appropriate)?

## 6. Accessibility (A11y)
- [ ] **Contrast:** Do text colors pass WCAG AA standards against their background?
- [ ] **Dyslexia Mode Support:** Does the mode respect the global `accessibilityMode` flag? (Font swap to OpenDyslexic, increased tracking).
- [ ] **Screen Reader Labels:** Do icon-only buttons have `aria-label`?
- [ ] **Keyboard Navigation:** Can you Tab through all interactive elements?
