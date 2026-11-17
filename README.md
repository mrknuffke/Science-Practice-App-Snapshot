> **Public snapshot, updated 2026-11-17.** This is a read-only copy of the code behind
> [sciencepractice.app](https://sciencepractice.app), shared so other teachers can see
> how it is built and reuse what helps them. Development happens in a private repository,
> and each update here replaces the last one, so this repo has no detailed history.
> Code is MIT licensed; lessons, simulation text and images are CC BY-NC-SA 4.0.
> See [LICENSING.md](LICENSING.md).
>
> The live app's AI features and sign-in need your own keys: copy `.env.local.example`
> to `.env.local` and fill it in. The textbooks under `public/chem/`, `public/physics/`
> and `public/bio/` run without any keys.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Science Practice Partner

Live at **[sciencepractice.app](https://sciencepractice.app)**. React/TypeScript SPA, built with Vite, deployed on Vercel.

## What's Inside

AI-powered practice tools (require Google Workspace sign-in on an approved school domain) plus free, sign-in-free interactive content.

**Free Interactive Simulations (19):**
<!-- BEGIN:SIMULATIONS - checked against constants/simulationsRegistry.ts by
     sourceOfTruth.test.ts. Do not hand-edit. -->
Ecosystem Balance · Population Genetics · Covalent Bonding · Ionic Bonding · Periodic Table · Build an Atom · Particle Phase Change · Biological Systems Modeler · Cell Membrane Transport · Reaction Kinetics · Ideal Gas Laws · Free Body Diagrams · Motion Tracker · Thermal & Thermochemistry Studio · Arterial Blood Buffers · Nuclear Decay & Dating · Osmosis Lab · Tracking a Carbon Atom · Island Biogeography
<!-- END:SIMULATIONS -->

Registered in [`constants/simulationsRegistry.ts`](constants/simulationsRegistry.ts) — the Simulations Hub and the homepage AI advisor both derive their lists from it.

**Free Interactive Textbooks:**
- [SAS General Chemistry](public/chem/) — lessons built from retrieval-practice widgets, particle diagrams, spaced-repetition review, and a shared reference drawer. Served at `/chem/` and at `chem.sciencepractice.app`. Guide: [`docs/textbook/TEXTBOOK_DEV_GUIDE.md`](docs/textbook/TEXTBOOK_DEV_GUIDE.md).
- [SAS General Physics](public/physics/) — Levels 1 and 2, each closing with a review packet. It runs on the shared textbook runtime in `public/textbook/`, since Phase 4 of [the consistency plan](docs/archive/plans/textbook-consistency-fixes.md). Served at `/physics/` and at `physics.sciencepractice.app`. Guide: [`docs/textbook/PHYSICS_DEV_GUIDE.md`](docs/textbook/PHYSICS_DEV_GUIDE.md).
- [SAS General Biology](public/bio/) — Unit 1 (Homeostasis) and Unit 2 (2a Carbon: photosynthesis and the carbon cycle; 2b Ecology: biodiversity, energy, carrying capacity), each half closing with a review packet. Zero-build static architecture with Emerald design tokens, interactive simulations, and published data sets. Served at `/bio/` and at `bio.sciencepractice.app`. Guide: [`docs/textbook/BIOLOGY_DEV_GUIDE.md`](docs/textbook/BIOLOGY_DEV_GUIDE.md).

**AI-Powered Tools (22 dashboard modes, plus Teacher Mode):**
<!-- BEGIN:MODES - checked against MODES_METADATA in constants/modesRegistry.ts by
     sourceOfTruth.test.ts. Do not hand-edit. -->
Adaptive Practice · Written Response (FRQ) · Data Analysis (C.E.R.) · Study Sprint · Explanation Partner · Calculation Partner · Smart Scanner · Flashcard Study Decks · Metacognitive Reflection · Lab Co-Pilot · Motion Tracker · Research Assistant · Interactives Lab · Review Games · Advanced Study Buddy · The Learning Loop · Concept Map Builder · Diagram Labeling · The Skeptic (Peer Review) · AI Science Tutor · AI Socratic Guide · AI Growth Coach
<!-- END:MODES -->

Advanced Study Buddy covers every course in [`constants/apCourses.ts`](constants/apCourses.ts) (28 AP & IB courses). Teacher Mode adds Document Creator, Test Creator, Interview Script, Reflection Prompter, Review Games, and Rubric Translator.

## AI Model

`DEFAULT_MODEL` in [`services/ai/core.ts`](services/ai/core.ts) is the single source of truth — currently `gemini-3.6-flash`. Image/PDF parsing is deliberately pinned to `gemini-2.5-pro` in `services/jeopardyService.ts`. New AI functions must use `DEFAULT_MODEL`; see [CLAUDE.md](CLAUDE.md).

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app:
   `npm run dev`

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run verify` | Diagrams, `tsc -b`, lint, unit tests, production build. Run before reporting work done. |
| `npm run preflight` | **The push gate.** `verify` on the production Node major, edge-safety checks, then serves the build and requests every public route, every textbook lesson and every script each lesson loads, then the browser smoke suite. Enforced by the pre-push hook — never `--no-verify`. |
| `npm run build` / `npm run lint` / `npm test` | The individual steps. |
