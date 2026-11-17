---
name: new-simulation
description: Two-phase process (discovery interview, then build) and technical requirements for a new Simulations Hub interactive, including the required About panel. Use when building or adding a simulation.
---

# Building New Interactives


When building new interactive simulations for the Simulations Hub, follow this two-phase process:

**Phase 1: Discovery Interview**
- Do not begin coding immediately. Interview the user to gather requirements first.
- Ask exactly one question at a time. Wait for the response before asking the next.
- Gather: (1) Specific learning objective or "aha moment", (2) Visual style preferences, (3) User controls needed, (4) Edge cases or specific data points required.

**Phase 2: Execution**
- Once requirements are gathered, implement the full interactive.
- Adhere to the project's design system, component patterns, and coding guidelines.

**Technical Requirements:**
- Use existing project frameworks (React, TypeScript, Tailwind CSS, Recharts).
- All interactives must be responsive — desktop and mobile.
- Use Unicode for scientific notation (H₂O, 6.02 × 10²³, p² + 2pq + q² = 1). No LaTeX unless it renders correctly.
- Provide complete, working code — no placeholders.
- Add new simulation to `constants/simulationsRegistry.ts` (the Simulations Hub and homepage AI advisor both derive from this registry) and wire up routing in `components/routing/SimulationRouter.tsx`.

**About / How To Panel (REQUIRED for every interactive):**
Every simulation must include an About panel using `components/simulations/shared/AboutPanel.tsx`. Create a `*About.ts` file alongside the simulation with a `SimulationAboutContent` object. The content must include four sections:
1. **"What Am I Looking At?"** — Explain all visual elements (icons, colors, graphs, labels).
2. **"How to Explore"** (or "How to Build…" for builder simulations) — Step-by-step guide to every user control.
3. **"Things to Try"** — 5–7 concrete, specific experiments users can run with expected outcomes.
4. **"Key Concepts"** — Definitions of the core science concepts the interactive demonstrates.

Wiring it up:
- Simulations using `SimulationHeader`: pass `onOpenAbout={() => setShowAbout(true)}` prop — the button appears automatically.
- Simulations with custom headers: add a "How To Use" button in the header bar using the `HelpCircle` icon from lucide-react.
- Render `<AboutPanel>` at the bottom of the main return; pass a `gradient` matching the simulation's theme.
- `dangerouslySetInnerHTML` is permitted only in `AboutPanel` item content (static strings only, no user input).

**Ecosystem Simulation Architecture:**
- Engine: NetLogo Wolf Sheep Predation style — probabilistic reproduction with energy splitting, deterministic plant regrowth countdown, 100% predation on co-location, random movement.
- Files: `ecosystemConstants.ts` (types/constants), `ecologyEngine.ts` (simulation logic), `EcosystemCanvas.tsx` (SVG grid rendering), `ParameterControls.tsx` (sliders), `EcosystemSimulationView.tsx` (main view), `PopulationGraph.tsx` (Recharts dual-axis).
- Terminology: plants/herbivores/carnivores (not grass/rabbits/wolves).
