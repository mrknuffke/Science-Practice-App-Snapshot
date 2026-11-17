# Implementation Framework: Open Access Resources Hub & Sign-In Simplification

**Date:** 2026-10-09  
**Status:** Proposed / Under Review  
**Author:** Science Practice Partner Engineering  
**Scope:** Streamline the authentication modal (`Gatekeeper.tsx`) by consolidating disparate open-access feature pills into a single unified entry point that leads to a dedicated, high-performance **Open Science Resources Hub** (`OpenResourcesView.tsx`).

---

## 1. Executive Summary & Problem Definition

### Current State
When unauthenticated visitors land on Science Practice Partner, they are greeted by the `Gatekeeper` modal. Over recent releases, multiple zero-auth features have been exposed via stacked action pills under "EXPLORE WITHOUT SIGNING IN":
1. **SAS Biology Textbook** (`/bio/`)
2. **SAS Chemistry Textbook** (`/chem/`)
3. **SAS Physics Textbook** (`/physics/`)
4. **Explore Interactives** (Simulations Hub)

With the addition of the **Accelerated Chemistry (XL) Practice Suites** (Units 1 to 4 + Teacher Verifier), adding another pill would result in **5 stacked, full-width colored buttons** in an authentication dialog.

### The Problems
1. **Cognitive & Visual Overload:** The modal is intended for Google authentication. A towering stack of 5 large colored buttons competes directly with the sign-in button and mascot dialogue.
2. **Mobile Viewport Clutter:** On phone screens (375px to 420px), the 5 buttons push critical troubleshooting links and the bypass button below the fold, forcing awkward scrolling.
3. **Fragmented Discovery:** Students looking for free study tools cannot see the full breadth of available materials (e.g. 16 simulations, 3 complete textbooks, and 4 multi-skill practice suites) from tiny pill buttons.

### The Objective
- Consolidate the sign-in modal's non-AI links into **a single high-profile, beautifully styled Open Access entry card**.
- Create a dedicated **Open Science Resources Hub** (`?page=resources` or `/resources`) that showcases and organizes all non-AI, zero-sign-in educational materials:
  - **Interactive Textbooks** (Biology, Chemistry, Physics)
  - **Interactive Simulations** (16 client-side simulations across all 3 disciplines)
  - **Accelerated Chemistry (XL) Practice Suites** (Units 1 to 4 + Instructor Verifier)

---

## 2. Architectural Design & Component Structure

### Architecture Decision: Dedicated SPA View vs. Static Site
- **Decision:** Implement as a **React SPA Public View** (`components/OpenResourcesView.tsx`) registered in `App.tsx` and protected by `isPublicView`.
- **Rationale:**
  - Integrates seamlessly with the app's existing theme engine (Light and Dark mode synchronisation).
  - Can launch interactive simulations directly in-session without full-page reloads.
  - Shares design tokens, Lucide icons, and responsive layouts with the main application.
  - Allows deep linking (`?page=resources`) that works out-of-the-box for visitors and search engines.
  - Retains instant back-navigation to the sign-in modal (`Gatekeeper`) when unauthenticated, or to the dashboard (`LandingPage`) when authenticated.

### High-Level Component Relationship

```
+-------------------------------------------------------------+
|                      Sign-In Modal                          |
|                     (Gatekeeper.tsx)                        |
|                                                             |
|  [ Google Sign-In Button ]                                  |
|                                                             |
|  +-------------------------------------------------------+  |
|  | [🔬] Explore Open Science Resources                   |  |
|  |     Free textbooks, simulations & practice sets   --> |  |
|  +-------------------------------------------------------+  |
+------------------------------+------------------------------+
                               |
                               | (Clicks card or visits ?page=resources)
                               v
+-------------------------------------------------------------+
|                 Open Science Resources Hub                  |
|                  (OpenResourcesView.tsx)                    |
|                                                             |
|  [<- Back to Sign In]            [Filter: All | Books | Sims | XL] |
|                                                             |
|  === HERO BANNER ===                                        |
|  "Open Science Learning Studio"                             |
|  Client-side, free, zero sign-in educational tools.         |
|                                                             |
|  === SECTION 1: INTERACTIVE TEXTBOOKS (3) ===               |
|  [SAS Biology (Unit 1)] [SAS Chemistry (Units 1-5)]         |
|  [SAS General Physics (Levels 1-2)]                         |
|                                                             |
|  === SECTION 2: NGSS PE ADAPTIVE PRACTICE (15) ===          |
|  [PE Practice Hub (/chem/pe/)] [15 NGSS Chem Standards]     |
|  [Adaptive Leveling 1-3] [Receipt Verify (/chem/pe/verify)] |
|                                                             |
|  === SECTION 3: ACCELERATED CHEMISTRY PRACTICE (4) ===      |
|  [Unit 1 Workstation] [Unit 2 Workstation]                  |
|  [Unit 3 Workstation] [Unit 4 Workstation] [Receipt Verify] |
|                                                             |
|  === SECTION 4: INTERACTIVE SIMULATIONS (16) ===            |
|  [Biology (5)] [Chemistry (9)] [Physics (2)]                |
+-------------------------------------------------------------+
```

---

## 3. Content Inventory to Feature on the Hub

### Pillar 1: Interactive Textbooks (Open-Access Static Sites)
- **SAS General Biology** (`/bio/` or `bio.sciencepractice.app`):
  - Focus: Unit 1 Homeostasis (4 lessons + synthesis review).
  - Features: Leaf disc simulation data analysis, Emerald tokens, zero-build static architecture.
- **SAS General Chemistry** (`/chem/` or `chem.sciencepractice.app`):
  - Focus: Units 1 to 5 (27 lessons).
  - Features: Reference Center drawer, spaced repetition, 2D particle dynamics, printable summaries.
- **SAS General Physics** (`/physics/` or `physics.sciencepractice.app`):
  - Focus: Levels 1 (Kinematics) & 2 (Dynamics & Forces) (8 lessons + 2 reviews).
  - Features: Lean stack, interactive kinematics widgets, Cyan tokens.

### Pillar 2: NGSS Performance Expectation (PE) Adaptive Practice Modules
- **Centralized PE Hub:** `/chem/pe/` (direct entry or launcher)
- **Teacher Verification Tool:** `/chem/pe/verify.html`
- **15 Standardized NGSS PEs:**
  - `HS-PS1-1`: Valence Electrons & Periodic Properties (`/chem/pe/?pe=HS-PS1-1`)
  - `HS-PS1-2`: Simple Chemical Reactions & Product Prediction (`/chem/pe/?pe=HS-PS1-2`)
  - `HS-PS1-3`: Bulk Electrical & Thermal Properties / IMFs (`/chem/pe/?pe=HS-PS1-3`)
  - `HS-PS1-4`: Chemical Energy & Bond Energy Breaking/Forming (`/chem/pe/?pe=HS-PS1-4`)
  - `HS-PS1-5`: Collision Theory & Reaction Rates (`/chem/pe/?pe=HS-PS1-5`)
  - `HS-PS1-6`: Equilibrium & Le Chatelier's Principle (`/chem/pe/?pe=HS-PS1-6`)
  - `HS-PS1-7`: Conservation of Mass & Stoichiometry (`/chem/pe/?pe=HS-PS1-7`)
  - `HS-PS1-8`: Nuclear Processes & Fusion/Fission (`/chem/pe/?pe=HS-PS1-8`)
  - `HS-PS2-6`: Molecular Structure & Material Performance (`/chem/pe/?pe=HS-PS2-6`)
  - `HS-PS3-1`: Computational Model of Energy (`/chem/pe/?pe=HS-PS3-1`)
  - `HS-PS3-4`: Thermal Energy Transfer / Second Law (`/chem/pe/?pe=HS-PS3-4`)
  - `HS-PS4-4`: Electromagnetic Radiation & Matter (`/chem/pe/?pe=HS-PS4-4`)
  - `HS-ESS1-1`: Nuclear Fusion in the Sun (`/chem/pe/?pe=HS-ESS1-1`)
  - `HS-ESS1-2`: Big Bang & Cosmic Microwave Background (`/chem/pe/?pe=HS-ESS1-2`)
  - `HS-ESS1-3`: Stellar Nucleosynthesis & Elemental Abundance (`/chem/pe/?pe=HS-ESS1-3`)
- **Key Features:** Adaptive 3-tier leveling engine, automatic remediation loops, and cryptographic SHA-256 completion receipts.

### Pillar 3: Accelerated Chemistry (XL) Practice Suites
- **Centralized Hub:** `/chem/xl/practice/`
- **Unit 1: Atomic Structure & Electron Configurations** (16 items, 8 skills)
- **Unit 2: Periodic Trends, Bonding & Molecular Geometry** (16 items, 8 skills)
- **Unit 3: Intermolecular Forces & States of Matter** (16 items, 8 skills)
- **Unit 4: Reactions & Stoichiometry** (16 items, 8 skills)
- **Teacher Verification Tool:** `/chem/xl/practice/verify.html`
- **Key Badges:** 100% Deterministic, 5 Calculation Attempts, Cryptographic SHA-256 Print Receipts.

### Pillar 4: Free Interactive Simulations (16 Total)
Source of truth: `constants/simulationsRegistry.ts`.
- **Biology (5):**
  - Ecosystem Balance
  - Population Genetics
  - Biological Systems Modeler
  - Cell Membrane Transport (Diffusion)
  - Blood Buffers & Homeostasis
- **Chemistry (9):**
  - Covalent Bonding Builder
  - Ionic Bonding Builder
  - Interactive Periodic Table
  - Build an Atom
  - Particle Phase Change
  - Reaction Kinetics Studio
  - Ideal Gas Laws
  - Thermal & Thermochemistry Studio (Calorimetry)
  - Nuclear Decay & Dating
- **Physics (2):**
  - Free Body Diagrams
  - Motion Tracker (Video Lab)

---

## 4. UI & UX Specifications

### 4.1. Sign-In Modal (`Gatekeeper.tsx`) Updates
Replace lines 204 to 237 of `components/Gatekeeper.tsx`:
```tsx
{/* Before: 4 large stacked colored buttons */}
{/* After: 1 unified high-contrast bento card */}

<div className="mt-8 text-center space-y-4">
  <p className="text-[10px] text-slate-400 dark:text-slate-550 font-black uppercase tracking-wider">
    EXPLORE WITHOUT SIGNING IN
  </p>

  <button
    onClick={onOpenOpenResources}
    className="w-full group p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/80 dark:from-slate-800 dark:via-[#1E212A] dark:to-indigo-950/30 border border-indigo-150 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500/60 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between gap-3"
  >
    <div className="flex items-center gap-3.5">
      <div className="w-11 h-11 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
        🔬
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-rounded">
            Open Science Resources
          </span>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">FREE</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
          Textbooks, NGSS PE modules, simulations &amp; practice sets
        </p>
      </div>
    </div>
    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-450 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0">
      <ArrowRight className="w-4 h-4" />
    </div>
  </button>

  {/* Compact Quick Jump Chips */}
  <div className="flex items-center justify-center gap-2 pt-1 text-[10px] font-bold text-slate-450 dark:text-slate-500">
    <span>Textbooks</span>
    <span>•</span>
    <span>PE Modules</span>
    <span>•</span>
    <span>XL Sets</span>
    <span>•</span>
    <span>Simulations</span>
  </div>
</div>
```

### 4.2. New Hub View (`components/OpenResourcesView.tsx`)
- **Header:**
  - Back Button: Displays "Back to Sign In" (if unauthenticated) or "Back to Dashboard" (if authenticated).
  - Quick Search / Filter Bar: Live filter across titles, topics, and descriptions.
  - Category Pills: `All (23)`, `Textbooks (3)`, `Practice Sets (4)`, `Simulations (16)`.
- **Hero Card:**
  - Clear statement of purpose: 100% open access, zero sign-in required, student-privacy respecting, free forever.
  - Explains the distinction between these deterministic tools and the adaptive AI features (which require an SAS account).
- **Textbook Cards Grid:**
  - Distinct subject accent colors (Biology Emerald, Chemistry Indigo, Physics Cyan).
  - Live lesson counts and direct launch external links (`/bio/`, `/chem/`, `/physics/`).
- **XL Practice Workstations Grid:**
  - Direct launch links to `/chem/xl/practice/unit1.html` through `unit4.html`.
  - Feature badges: "Deterministic Seed", "5 Attempts on Math", "Printable Receipt".
  - Link to `/chem/xl/practice/verify.html` for teachers.
- **Simulation Cards Grid:**
  - Filterable by Biology, Chemistry, Physics.
  - Interactive click handler: launches the simulation view directly in `App.tsx` via `onSelectSimulation`.

---

## 5. Routing, Deep Links, and Source of Truth Compliance

To conform to the project push gate and prevent test failures:

1. **`types.ts`:**
   - Add `'open_resources'` to the `ViewType` union.
2. **`constants/publicRoutes.ts`:**
   - Add `open_resources: 'resources'` to `VIEW_TO_PAGE`.
   - Add `'resources'` to `PUBLIC_PAGE_PARAMS`.
   - Add `'open_resources'` to `INFO_PAGES` (or as a public educational hub).
3. **`App.tsx`:**
   - Add `'open_resources'` to `isPublicView`:
     ```ts
     const isPublicView =
       state.mode === 'simulation' ||
       ['how_it_works', 'features', 'support', 'teachers', 'changelog', 'open_resources'].includes(state.view);
     ```
   - In deep link parsing:
     ```ts
     if (pageParam === 'resources' || pageParam === 'open' || pageParam === 'free') {
       setState(prev => ({ ...prev, view: 'open_resources' }));
     }
     ```
   - Wire `onOpenOpenResources` from `Gatekeeper` to set `view: 'open_resources'`.
4. **`scripts/preflight/check-routes.mjs`:**
   - Add `'resources'` to `APP_PAGES`.
5. **`services/__tests__/sourceOfTruth.test.ts`:**
   - Keep `VIEW_TO_PAGE` and `APP_PAGES` in exact sync to pass the drift guard.

---

## 6. Rendering Invariants & Rules Checklist

Before shipping, verify all project invariants:
- **Zero Em-Dashes Invariant:** Verify zero em-dashes (both unicode character U+2014 and HTML mdash entities) in `OpenResourcesView.tsx`, `Gatekeeper.tsx`, and all copy. Use hyphens, colons, or parentheses.
- **420px Viewport Mobile Invariant:** Ensure no elements overflow horizontally at `width: 420px`. All grids collapse gracefully to 1 column.
- **Touch Target Invariant:** Every interactive button and card has at least 44px x 44px clickable area.
- **Dark & Light Mode Parity:** All cards, borders, text, and badges specify explicit light and dark classes.
- **Anti-"Longest Answer" / Clean Copy:** Keep all descriptions concise, educational, and free of AI fluff.

---

## 7. Step-by-Step Implementation Plan

| Step | File(s) | Description | Verification |
|---|---|---|---|
| **1. Types & Routes** | `types.ts`, `constants/publicRoutes.ts`, `scripts/preflight/check-routes.mjs` | Register `'open_resources'` view and `?page=resources` route. | `npm test sourceOfTruth.test.ts` |
| **2. New Component** | `components/OpenResourcesView.tsx` | Build the full hub with tabs, search, textbook cards, XL practice cards, and simulations grid. | Zero-dash scanner + test build |
| **3. Gatekeeper Streamline** | `components/Gatekeeper.tsx` | Replace the 4 stacked pills with the unified Open Access card. | Visual layout & mobile check |
| **4. App.tsx Wiring** | `App.tsx` | Wire public view bypass, deep links, navigation state transitions, and simulation launch callbacks. | Route check & click flow |
| **5. Preflight & Smoke Test** | `tests/smoke/textbook.smoke.ts`, `npm run verify` | Verify that `?page=resources` loads cleanly without auth, passes Playwright smoke tests, and has no horizontal overflow. | `npm run verify` passes |
| **6. Push to Main** | Git | Commit changes cleanly and push to `origin/main` via the pre-push hook. | Preflight passes & pushed |
