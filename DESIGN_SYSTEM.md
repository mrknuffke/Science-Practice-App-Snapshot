# Design System & Token Specification

**Science Practice Partner** utilizes a dual-surface, unified design architecture:
1. **React Application Modes**: Styled via **Tailwind CSS** with semantic subject themes and dark-mode defaults.
2. **SAS General Chemistry Textbook & Interactives**: Built with Vanilla HTML/CSS using a single-source-of-truth token system (`public/chem/assets/tokens.css`).

---

## 1. Unified Semantic Typography Scale

To prevent visual drift and fractional `rem` sprawl, all surfaces must map to this unified scale. Ad-hoc pixel or fractional rem values are strictly prohibited.

| Token (Textbook CSS) | Class (React Tailwind) | Equivalent (16px Root) | Intended Semantic Usage |
| :--- | :--- | :--- | :--- |
| `var(--text-3xs)` | `text-3xs` | 8px - 9px (0.5625rem) | Periodic table micro cells, sub-indices, atomic mass. |
| `var(--text-2xs)` | `text-2xs` | 10px - 11px (0.6875rem) | Micro badges, status pills, option letters, tiny counters. |
| `var(--text-xs)` | `text-xs` | 12px (0.75rem) | Metadata, breadcrumbs, tags, secondary button labels, tab titles. |
| `var(--text-sm)` | `text-sm` | 14px (0.875rem) | Hints, footnotes, secondary descriptions, dropdown links. |
| `var(--text-base)` | `text-base` | 16px (1.0rem) | Standard body, interactive cards, form inputs, options. |
| `var(--text-md)` | `text-lg` | 18px (1.125rem) | Lead intros, callouts, prominent readouts, step controls. |
| `var(--text-lg)` | `text-xl` | 20px (1.25rem) | Card headers, section subheadings, formula displays. |
| `var(--text-xl)` | `text-2xl` | 24px (1.5rem) | Major section subheads (h3), dialog titles. |
| `var(--text-2xl)` | `text-3xl` | 30px (1.875rem) | Section titles (h2), modal headers. |
| `var(--text-3xl)` | `text-4xl` | 36px (2.25rem) | Lesson titles (h1), mode splash titles. |
| `var(--text-4xl)` | `text-5xl` | 48px (3.0rem) | Display hero titles, dashboard banners. |
| `var(--text-reading)`| N/A | 22px (1.375rem) | Editorial longform serif reading paragraphs (`Spectral`). |

---

## 2. React Application Design System

### 🎨 Color Palette
Our color system is semantic, mapping specific hues to scientific disciplines:

| Subject Area | Color Name | Tailwind Class | Hex (Approx) | Icon |
| :--- | :--- | :--- | :--- | :--- |
| **Biology** | Emerald | `emerald-600` | `#059669` | 🧬 |
| **Chemistry** | Violet | `violet-600` | `#7c3aed` | ⚗️ |
| **Physics** | Cyan | `cyan-600` | `#0891b2` | ⚛️ |
| **Environmental** | Teal | `teal-600` | `#0d9488` | 🌍 |
| **Middle School** | Amber | `amber-500` | `#f59e0b` | 🎒 |
| **Elementary** | Orange | `orange-500` | `#f97316` | 🌟 |
| **Electives** | Slate | `slate-600` | `#475569` | 🔬 |
| **Custom** | Indigo | `indigo-600` | `#4f46e5` | ✨ |

### UI Neutrals
- **Background:** `bg-slate-900` (Dark Mode Default)
- **Panels:** `bg-slate-800`
- **Text Primary:** `text-white`
- **Text Secondary:** `text-slate-400`
- **Borders:** `border-slate-700`

### 🧩 Common React Components
- **Buttons / Cards:** Rounded `rounded-2xl` or `rounded-[2rem]`. Hover slight scale `hover:scale-[1.02]`.
- **Modals:** Backdrop `bg-black/80 backdrop-blur-sm`, container `bg-slate-900 border border-slate-700 rounded-2xl`.
- **Simulation Heat/Cool Controls:** Shared `HeatCoolButtons` (`components/simulations/shared/HeatCoolButtons.tsx`). Do not roll custom heat/cool buttons in new simulations: use the shared component.
- **Simulation Data Export:** Shared `ExportButtons` (`components/simulations/shared/ExportButtons.tsx`).

---

## 3. General Chemistry Textbook & Interactives Design System

Source of truth: `public/chem/assets/tokens.css` and `public/chem/assets/components.css`.

### 🎨 Paper & Ink Palette
- **Paper Surfaces:** `--paper: #EDF1EC;` (default), `--paper-2: #E4EAE3;`, `--paper-3: #DBE2D9;`, `--card: #F5F8F4;`.
- **Ink Typography:** `--ink: #16201C;` (high contrast), `--ink-soft: #3A463F;`, `--ink-mute: #6B756D;`.
- **Accent Color:** `--accent: #D6452A;` (Vermilion, the single primary accent). `--accent-soft: #E68A77;`.
- **Positive/Correct:** `--good: #2E7D57;` (Forest green, reserved strictly for verified correct states).
- **Hairlines:** `--hair: rgba(22,32,28,.16);`, `--hair-soft: rgba(22,32,28,.09);`.

### 📐 Figure Tiers & Diagrams
- **Width Tiers:**
  - `.figure--sm`: 24rem (compact single atoms, lone levers).
  - `.figure--md`: 34rem (paired models, comparisons).
  - `.figure--full`: 52rem (default, matches prose column).
  - `.figure--wide`: 68rem (wide multi-stage timelines, periodic grids).
- **Diagram Geometry Tokens:**
  - Radius: `--dia-r-particle: 2`, `--dia-r-atom-sm: 5`, `--dia-r-atom: 7.5`.
  - Strokes: `--dia-stroke: 1`, `--dia-stroke-bond: 1.2`.
  - SVG Text Tokens: `--dia-label-size: 12px`, `--dia-caption-size: 10px`, `--dia-header-size: 14px`, `--dia-atom-size: 22px`.

---

## 4. Anti-Drift Enforcement Invariants

1. **Zero Ad-Hoc Typography:** Never introduce new fractional rem or arbitrary px values. Always consume the semantic scales above.
2. **Zero Em-Dashes Invariant:** Never use em-dashes (`—` or `&mdash;`) anywhere in site content or code.
3. **Commit-Before-Reveal Interaction Gating:** Interactive reveals, answers, and checks must be disabled on initial load until the student commits an attempt.
4. **Automated Verification:** All code changes must pass `npm run verify` (`tsc -b`, ESLint, Vitest, and Vite build).
