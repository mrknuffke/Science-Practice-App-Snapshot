
import React, { useState } from 'react';
import { cleanHtml } from '../utils/sanitize';
import ContactModal from './ContactModal';
import { ArrowLeft, Megaphone } from 'lucide-react';

interface ChangelogViewProps {
  onBack: () => void;
}

const ChangelogView: React.FC<ChangelogViewProps> = ({ onBack }) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  interface UpdateEntry {
    version: string;
    title: string;
    changes: string[];
  }

  interface DateGroup {
    date: string;
    entries: UpdateEntry[];
  }

  // IMPORTANT: When adding new changelog entries, always preserve user credits!
  // Users credited so far: Anna Mae, Keegan R., Kabir N., Robert C., Mr. Dylan Abbott, Mr. Brendan Madden, Ms. Vivian Huang, Ms. Michelle Lee
  // Format: "Feature description. Feature requested by **User Name**!" or "Thanks to **User Name** for the report"
  const changelogData: DateGroup[] = [
    {
      date: 'November 17, 2026',
      entries: [
        {
          version: 'v.17Nov.01',
          title: 'Source Code for Teachers',
          changes: [
            '🧩 **Source code for teachers.** The code behind the app, its simulations and the textbooks is now on GitHub, free to borrow. Find it on the Teachers page.',
          ],
        },
      ],
    },
    {
      date: 'November 8, 2026',
      entries: [
        {
          version: 'v.08Nov.01',
          title: 'SAS General Biology Unit 2: Carbon and Ecology',
          changes: [
            '🌿 **Unit 2a: Carbon.** Two new lessons and a review. Find out where a giant kelp\'s mass and energy come from, then follow the carbon people add to the air through four spheres. A new simulation tests what a cut in emissions does to carbon dioxide in the air.',
            '🦧 **Unit 2b: Ecology.** Seven new lessons and a review: biodiversity loss in Singapore, richness and evenness on reefs and islands, gut bacteria at three scales, energy and trophic levels, Biosphere 2, polar bears and carrying capacity, and orangutans and scale. Three new lesson simulations, and every data set comes from a cited published study.',
            '📋 **Two review packets.** Each half of the unit ends with quick checks, a main-ideas digest and two new practice problems. The Ecology review closes with a step-by-step guide to refining a conservation design.',
          ],
        },
      ],
    },
    {
      date: 'November 7, 2026',
      entries: [
        {
          version: 'v.07Nov.01',
          title: 'New Simulation: Island Biogeography',
          changes: [
            '🏝️ **Island Biogeography.** Change an island\'s size and distance, and watch how many bird species it holds. Krakatoa and Surtsey settle on their real bird counts, a volcano wipes an island clean, and the species list keeps changing even when the count holds steady.',
          ],
        },
      ],
    },
    {
      date: 'November 2, 2026',
      entries: [
        {
          version: 'v.02Nov.01',
          title: 'Keyboard and Screen Reader Fixes Across the App',
          changes: [
            '⌨️ **Pop-ups work from the keyboard.** Every pop-up now puts your cursor inside when it opens. Tab stays inside, Escape closes it, and you land back on the button you started from. This covers Contact Support, saved decks, Jeopardy editing, simulation About panels and the phone menu.',
            '🔊 **Every button has a name.** 46 icon-only buttons (close, send, delete, star, dictation) now say what they do to a screen reader instead of just "button."',
            '🎲 **Game shortcuts fixed.** In Charades and Taboo, pressing Space after time ran out recorded the card but did not end the turn. It ends the turn now, the same as clicking.',
            '🃏 **Flashcards:** Space no longer flips the card in Write mode before you have typed an answer.',
            '📈 **Periodic Table graph:** the trend graph now updates when you change the sidebar filter (metals, nonmetals) while it is open.',
            '📝 **Faster setup:** picking a course in Document Creator or quiz setup now moves your cursor straight to the topic box, as it was always meant to.',
          ],
        },
      ],
    },
    {
      date: 'October 28, 2026',
      entries: [
        {
          version: 'v.28Oct.01',
          title: 'Two New Biology Simulations: Osmosis Lab & Tracking a Carbon Atom',
          changes: [
            '🫧 **Osmosis Lab.** Watch water climb a tube from a sugar-filled dialysis bag, then find out why it stops. Predict first, compare narrow and wide tubes, try a leaky membrane that lets sugar escape, and zoom in on the bag wall to see water crossing both ways at random. Five challenges check your setup. Original simulation by **Ms. Michelle Lee**!',
            '♻️ **Tracking a Carbon Atom.** Follow one carbon atom from seawater into bull kelp, through a purple sea urchin and back to the sea. Matter and energy cards keep the two ideas apart, every equation shows its atom count, and each stage ends with a check that explains every answer. Original simulation by **Ms. Michelle Lee**!',
          ],
        },
      ],
    },
    {
      date: 'October 16, 2026',
      entries: [
        {
          version: 'v.16Oct.01',
          title: 'Adaptive Practice Multi-Topic Typing & Input Polish',
          changes: [
            '✍️ **Seamless Multi-Topic Configuration & Space/Comma Input.** When configuring adaptive practice sessions with multiple topics, the input box now smoothly preserves spaces within multi-word topic names (such as "Cellular Respiration") and handles commas and newlines naturally without stripping whitespace, eating punctuation, or jumping the cursor. Switching between single and multiple topic views now automatically carries over the active topic selection. Thanks to **Ms. Vivian Huang** for the report!',
          ],
        },
      ],
    },
    {
      date: 'October 14, 2026',
      entries: [
        {
          version: 'v.14Oct.01',
          title: 'Shared Textbook Runtime & SAS General Biology Expansion',
          changes: [
            '📚 **Unified Interactive Textbook Runtime.** Built a shared, zero-build textbook runtime (`public/textbook/`), establishing standardized typography, responsive navigation, and consistent widget components across all interactive science books.',
            '🧬 **SAS General Biology on Shared Runtime.** Migrated SAS General Biology (`public/bio/` and `bio.sciencepractice.app`) onto the shared runtime with four overhauled interactive simulations (Cellular Respiration, Thermoregulation, Osmoregulation, and Blood Glucose Homeostasis) built on the shared simulation helper.',
          ],
        },
      ],
    },
    {
      date: 'October 11, 2026',
      entries: [
        {
          version: 'v.11Oct.01',
          title: 'Natural Voice Discovery & Scientific Speech Normalization',
          changes: [
            '🗣️ **Intelligent Text-to-Speech (TTS) Engine.** Upgraded the speech synthesis subsystem with automated discovery of high-fidelity OS voices, preferring natural and neural system voices where available.',
            '🔬 **Scientific Formula & Unit Pronunciation.** TTS now intelligently normalizes complex scientific notation, subscripts, superscripts, units (such as m/s² or g/cm³), and chemical formulas into clean spoken English instead of reading raw code symbols.',
          ],
        },
      ],
    },
    {
      date: 'October 9, 2026',
      entries: [
        {
          version: 'v.09Oct.01',
          title: 'Open Access Resources Hub & Extended Chemistry Practice Suites',
          changes: [
            '📂 **Collapsible Open Access Resources Hub.** Introduced a dedicated, public-facing Open Access Resources hub providing instant, sign-in-free access to all 16 interactive simulations, chemistry and physics textbooks, and AP review tools.',
            '🧪 **Authentic Chemistry Practice Suites (Units 1-8).** Added comprehensive XL chemistry practice suites with instant digital exploration, dynamic problem banks, answer justification rubrics, and teacher verification tools.',
          ],
        },
      ],
    },
    {
      date: 'October 5, 2026',
      entries: [
        {
          version: 'v.05Oct.01',
          title: 'Mission: Physica Level 2 (Force Frontier) & Readability Pass',
          changes: [
            "🚀 **Mission: Physica Level 2 Complete.** Completed Level 2 (Force Frontier) with 5 interactive lessons covering Newton's Laws, 2D Force Balancer, friction models, inclined planes, and Atwood coupled systems, capped with a comprehensive Solo Trial Review Packet.",
            '📖 **Simplified Technical English Readability.** Applied concise sentence length limits, active voice, and concrete causal explanations across textbook lessons, simulation guides, and adaptive PE modules.',
          ],
        },
      ],
    },
    {
      date: 'October 4, 2026',
      entries: [
        {
          version: 'v.04Oct.01',
          title: 'High School Chemistry PE Practice Suite Complete (15/15 Standards)',
          changes: [
            '🎯 **All 15 Chemistry Performance Expectations Shipped.** Finalized the comprehensive HS Chemistry PE adaptive practice suite with HS-ESS1-3 (Stellar Nucleosynthesis), joining stellar fusion, dynamic equilibrium, calorimetry, reaction kinetics, and nuclear processes with multi-tiered challenge problem banks.',
          ],
        },
      ],
    },
    {
      date: 'October 1, 2026',
      entries: [
        {
          version: 'v.01Oct.01',
          title: 'Clearer Simulation Guides',
          changes: [
            "📖 **Plainer How To Use panels.** Every simulation's How To Use panel is rewritten in plainer language, with the same section headings across all simulations and AI modes.",
            '🎯 **Feedback that teaches.** Challenge feedback now tells you what you achieved instead of cheering.',
          ],
        },
      ],
    },
    {
      date: 'September 27, 2026',
      entries: [
        {
          version: 'v.27Sep.01',
          title: 'Image Occlusion Flashcards, Diagram Labeling Mode & The Skeptic Peer Review Partner',
          changes: [
            '🧠 **Image Occlusion Flashcards.** Added a new `image_occlusion` card type to the Flashcard mode. Coloured SVG rectangle masks cover labelled structures in a diagram; students click each mask to reveal the answer. Three hand-authored preset decks ship immediately with no AI tokens needed: **Cellular Ultrastructure & Organelles** (AP Biology), **Cardiac Anatomy & Systemic Chambers** (Anatomy & Physiology), and **Galvanic Electrochemical Cell Schematic** (AP Chemistry). A purple "Featured Occlusion Decks" strip in the Saved Decks library lets students load any preset in one click.',
            '🔬 **The Skeptic — AI Peer Review Partner.** A new standalone practice mode where students submit a hypothesis, experimental design, or scientific claim and an AI "skeptical peer" responds with targeted objections and requests for justification. Multi-turn dialogue forces students to defend, refine, or discard their reasoning — building the critical thinking skills required for lab write-ups, IB IA defenses, and AP investigations.',
            '🏷️ **Diagram Labeling Mode.** A new Study & Review tool where Gemini generates a numbered SVG diagram of a biological, chemical, or physical system and students type labels into numbered input fields. Instant correctness feedback with colour-coding and a full summary panel on completion. Accessible at `?page=diagram_labeling`.',
          ],
        },
      ],
    },
    {
      date: 'September 22, 2026',
      entries: [
        {
          version: 'v.22Sep.01',
          title: 'Lab & Research Sidebar Direct Access, Deep Linking & Build Security Hardening',
          changes: [
            '🧬 **Lab & Research Sidebar Direct Access.** Promoted Lab & Research (Lab Co-Pilot, Kinematics Motion Tracker, Research Project Assistant) to a first-class navigation link on the main dashboard sidebar with a dedicated flask vector icon, allowing students and teachers to jump straight to experimental design tools without digging through Practice Center sub-tabs.',
            '🔗 **Lab & Research Deep Linking.** Added deep link support for the Lab & Research workspace via `?page=lab` or `?tab=lab` with deferred authentication routing, landing students directly on the investigation tools upon sign-in.',
            '🛡️ **Vercel Build Security & Dependency Pruning.** Cleaned up deployment configuration by removing redundant vercel CLI dependencies, pruning over 230 unneeded transitive packages, and configuring allowScripts for npm v12 lifecycle script supply-chain security.',
          ],
        },
      ],
    },

    {
      date: 'September 18, 2026',
      entries: [
        {
          version: 'v.18Sep.01',
          title: 'Chemistry Textbook Unit 2 Comprehensive Polish, Dual Fat Simulation & Stoichiometry Non-Overlapping Bays',
          changes: [
            '🧈 **Dual Side-by-Side Fat Simulation (Lesson 2-6a).** Reconstructed the fat structure-property explorer into a synchronized dual-panel comparative simulation comparing Saturated Fat (Stearic acid, MP 69°C, dense parallel LDF cross-links) vs. Unsaturated Fat (Oleic acid, MP 13°C, kinked cis double bonds preventing close packing) under a unified 0 to 100°C slider with quick preset buttons, accompanied by a full-width 5-step Scientific Argument Builder directly below.',
            '📐 **Stoichiometry Non-Overlapping Particle Bays & S\'mores Factory (Lesson 2-7c).** Partitioned the 400x250 reaction chamber coordinate system into 8 dedicated non-overlapping bays (100x125px), mathematically eliminating particle collision across all reactant amounts. Replaced plain text recipe with an illustrated visual particle equation (2 Gc + 1 M + 1 Ch -> 1 Gc2MCh) and dynamic results tray showing assembled sandwiches and leftover ingredients.',
            '⚖️ **Mole Scale Bridge Balance & Glucopyranose Accuracy (Lesson 2-7a).** Rebuilt Section 01 Mole Scale Bridge to 540x180 with an authentic digital bench balance (12.00 g, 1 mole). Converted Molar Mass Builder particle view to space-filling CPK spheres in tangent contact without stick bonds. Replaced glucose preset with an authentic alpha-D-glucopyranose 6-membered ring (C6H12O6) with zero label overlap.',
            '🧪 **Mole Map Responsive Scaling & Non-Assessable Curricular Extension (Lesson 2-7b).** Standardized mole maps and particulate diagrams to 100% container width, conformed water particles to canonical bent space-filling geometry, and rebalanced conversion factor cards into a 2-column grid. Formally designated Section 04b as a Non-Assessable Curricular Extension with notice callout, tag badge, and updated TOC label.',
            '🔬 **Reaction Mechanics & Liquid Phase Transitions (Lessons 1-2e & 2-2a).** Centered electron transfer badge glyphs, separated combustion reactant O2 pairs, and added missing product H2O molecule for mass conservation. Aligned synopsis reactant atoms to heteronuclear pairs to conserve atomic identities, and refactored melting phase milestone physics so particles pool cleanly across the beaker bottom with a defined liquid surface boundary.',
            '🌐 **Dashboard Grid Parity & Global "Tawa" to "Grill" Replacement.** Fixed unclosed anchor tag restoring proper CSS grid separation between Unit 1 and Unit 2 on the main dashboard, and globally replaced whole-word "tawa" with "grill" across all prose, interactive SVGs, element IDs, and documentation.',
            '🛡️ **Strict Zero Em-Dashes Invariant.** Enforced zero em-dashes across all modified files and verified full health check via npm run verify.',
          ],
        },
      ],
    },
    {
      date: 'September 16, 2026',
      entries: [
        {
          version: 'v.16Sep.03',
          title: 'Lesson 1-2b 2D Lewis Structures, Interactive Auto-Load & Typography Scale Regularization',
          changes: [
            '🧪 **Lesson 1-2b 2D Lewis Structure Redesign.** Rebuilt all molecular diagrams in Lesson 1-2b (Molecular Polarity) to strictly adhere to Diagram Generator Lewis structure standards (`DIAGRAM_WORKFLOW.md`). Replaced crude ball-and-stick circles with authentic 2D Lewis dot structures featuring bold monospace atom symbols (`font-size: 22px`), CPK coloring (Oxygen in `--accent` vermilion, Carbon/Hydrogen in `--ink`, Chlorine in `--good` muted green, Nitrogen in `--cool` slate blue), paired valence electron dots (`r="2.6"`), clean center-to-center bond strokes, and distinct bond dipole & net dipole summation vectors across the Hero 3-step sequence, Synopsis figure, Section 02 worked example (CH4 and NH3), and Section 03 interactive.',
            '⚡ **Signature Interactive Auto-Load on Startup.** The Section 03 "Cancel or reinforce?" interactive now auto-loads the O2 molecule immediately on initial page load, eliminating the blank SVG window and presenting Step 1 directly. All 5 molecules (O2, HCl, CO2, H2O, CH4) render as publication-grade 2D Lewis structures with CPK colors and accurate lone pairs.',
            '📐 **Site-Wide & In-Page Typography Scale Regularization.** Standardized SVG typography tokens in `tokens.css` with a clean 4-tier scale (`--dia-atom-size: 22px;`, `--dia-header-size: 14px;`, `--dia-label-size: 12px;`, `--dia-caption-size: 10px;`), eradicating microscopic 7px annotations and regularizing font sizing consistency across elements and diagrams.',
            '🛡️ **Strict Zero Em-Dashes Invariant.** Audited and eradicated all legacy em-dashes and `&mdash;` entities across all modified stylesheets, scripts, lesson prose, and interactive configs.',
          ],
        },
        {
          version: 'v.16Sep.02',
          title: 'Global Graphic Contrast, Universal Synopsis Sizing & Lightbox Zoom',
          changes: [
            '🌓 **Universal Dark Mode Graphic Text Readability.** Deployed a comprehensive SVG typography engine across `components.css` guaranteeing that all untagged text, presentation attributes with `var(--ink)` (resolving WebKit/Safari XML presentation attribute limitations), and hardcoded dark/black fills or strokes render in crisp, high-contrast tokenized `--ink` (`#E7EDE6`) when dark mode is enabled.',
            '📐 **Unclamped Synopsis Figures & Responsive Grid.** Removed the 120px `max-height` clamp on `.synopsis-figure svg` and `.synopsis-figure img`, allowing diagrams to expand naturally to full column width across all 27 lessons. Upgraded `.synopsis-grid` to allocate 1.15fr / 1.25fr / 1fr on desktop, giving central concept maps generous breathing room.',
            '🔍 **Universal Lightbox Zoom for Synopsis Figures.** Expanded the core lightbox query engine to bind all synopsis figures, enabling click-to-zoom modal inspection with `cursor: zoom-in`, hover card elevation, automatic caption fallback to `<h4>` headings, and responsive scaling up to 860px width in the lightbox overlay.',
            '🧪 **Lesson 1-2a Bonding Types Map Redesign.** Rebuilt the foundational synopsis diagram into a balanced 3-panel 360x170 layout covering Covalent sharing (ΔEN < 1.7), Ionic transfer (ΔEN ≥ 1.7), and Metallic delocalized electron sea, complete with diagram framing and caption.',
            '🛡️ **Strict Zero Em-Dashes Invariant.** Cleaned up all legacy em-dashes and `&mdash;` entities across all modified stylesheets, scripts, and lesson chapters.',
          ],
        },
        {
          version: 'v.16Sep.01',
          title: 'Chemistry Textbook Hardening & PE-Aligned Curriculum Nomenclature',
          changes: [
            '📐 **NGSS Performance Expectation Alignment.** Standardized lesson codes across the Chemistry Textbook dashboard, concept map knowledge graph, and manifest data to directly mirror NGSS Performance Expectations (e.g., `1-7a/b/c` for HS-PS1-7 Stoichiometry, `1-4a` for HS-PS1-4 Bond Energy, `1-5a/b` for HS-PS1-5 Kinetics, `1-6a/b` for HS-PS1-6 Equilibrium, `1-8a` for HS-PS1-8 Nuclear Reactions, and `E1-1a/2a/3a` for Earth & Space Science connections). Existing student checkpoint progress is automatically migrated with zero data loss.',
            '🔬 **Lesson 1-2a Electrostatic Sequence Redesign & Covalent Overlap.** Completely redesigned the foundational bonding sequence into a generous, publication-grade 3-stage sequence animation with dedicated spatial channels, non-intersecting force vectors, eliminated text collisions in Stage 2, and physically accurate overlapping valence shells in Stage 3 with the shared electron pair nestled squarely inside the covalent lens.',
            '🧪 **AI Study Partner Rebranding & Proxy Hardening.** Rebranded in-lesson AI tutor to "Chemistry Study Partner" / "Tutor", purging leftover "Buddy" naming. Added a locked indicator (`Tutor [Sign In]`) to warn unauthenticated visitors before clicking. Passed `model: "gemini-3.6-flash"` explicitly with server-side proxy fallbacks, resolving connection failures for authenticated sessions.',
            '⚡ **Interactive Bond Explorer Polish.** Resolved lifecycle registration and lightbox click interception on the Lesson 1-2a Bond Explorer, ensuring dynamic valence electron density clouds, deferred ionic charge transfer timing, and dropdown selections function seamlessly.',
            '🎨 **Dark Mode Diagram Text & Typography Invariants.** Fixed Lesson 1-1a intro hero diagram text contrast in dark mode, added diagram SVG text fill fallbacks in `components.css`, and enforced zero em-dashes across all modified files.',
          ],
        },
      ],
    },
    {
      date: 'September 15, 2026',
      entries: [
        {
          version: 'v.15Sep.05',
          title: 'Diff-Check Grader & Model Rubric Highlighter for FRQ & CER',
          changes: [
            '📝 **Interactive Rubric Alignment Checklist.** FRQ and CER results now feature an interactive criterion-by-criterion rubric scorecard (`components/results/RubricDiffViewer.tsx`). Evaluates Claim, Evidence (auditing quantitative data and exhibit citations), and Scientific Reasoning in CER, and prompt sub-parts (Parts A, B, C) in FRQ with color-coded status badges (`Met`, `Partially Met`, `Missing`) and point counters.',
            '🔍 **Side-by-Side Model Exemplar Comparison.** Added an interactive comparison view displaying the student\'s submitted response side-by-side with a gold-standard model exemplar answer, complete with one-click copy buttons for reflection notebooks.',
            '✨ **"How to Upgrade" Sentence Revision Recommendations.** For any rubric criterion that was missed or only partially satisfied, the AI grader provides concrete, 1-sentence phrasing recommendations showing students exactly how to rewrite their response to earn full marks.',
            '🛡️ **Full Test Coverage & Seamless Compatibility.** Backed by comprehensive Vitest unit tests (`RubricDiffViewer.test.tsx`), full TypeScript safety (`tsc -b`), and graceful fallbacks for historic sessions.',
          ],
        },
        {
          version: 'v.15Sep.04',
          title: 'App Architecture Modularization & Domain Sub-Routers',
          changes: [
            '🏗️ **Domain Sub-Router Architecture.** De-monolithed the root `App.tsx` component by factoring four major functional domains into dedicated sub-router components in `components/routing/`: `SimulationRouter`, `ReviewGamesRouter`, `StudySprintRouter`, and `TeacherToolsRouter`.',
            '⚡ **Streamlined Navigation & Maintainability.** Reduced `App.tsx` by ~480 lines of nested view branching while retaining 100% type safety and zero-overhead lazy loading across all 16 interactive simulations, 7 review game modes, Study Sprint flows, and Teacher Tools.',
            '🛡️ **Strict Zero-Regression Guarantees.** Verified complete interface compatibility, navigation callbacks, and deep linking across all sub-routers with full TypeScript check (`tsc -b`), ESLint, 41 Vitest unit tests, and production Vite bundle verification.',
          ],
        },
        {
          version: 'v.15Sep.03',
          title: 'Flashcard Mode Overhaul: Leitner 5-Box SRS, Active Recall & Study Sets',
          changes: [
            '🧠 **Persistent 5-Box Leitner Spaced Repetition System (SRS).** Upgraded flashcards into a true spaced repetition memory engine. Correct answers ("Got It") advance cards along a spaced retention curve (1d → 3d → 7d → 14d → 30d), while missed cards ("Study Again") return to Box 1 for reinforcement. All card mastery records are saved locally with zero student PII.',
            '📊 **Live Leitner Box HUD.** Added a real-time 5-box distribution bar tracking counts in Learning, Familiar, Competent, Proficient, and Mastered stages, plus due card counters and mastery percentage.',
            '🎯 **Interactive Active Recall Card Types.** Added inline Cloze fill-in-the-blank typing with instant fuzzy checking and reveal gating, clickable front-face Multiple Choice (MCQ) option selection with immediate correctness feedback, and quick True/False evaluation buttons.',
            '⚡ **Study Mode Filters.** Added 1-click filter switching between All Cards, SRS Due Only (targeting overdue cards), Rapid-Fire Cram Mode, and Matching Quiz.',
            '📚 **Saved Study Sets & Decks Library.** Students can save any active deck to their local library, load previously saved study sets without calling Gemini, export sets as JSON, or import custom decks.',
            '⌨️ **Full Keyboard Accessibility.** Added ergonomic hotkeys: `Space` to flip, `←` or `1` for Study Again, `→` or `2` for Got It, and `A`/`B`/`C`/`D` to select MCQ options on the front face.',
          ],
        },
        {
          version: 'v.15Sep.02',
          title: 'Universal Simulation Challenge Decks (Biology & Chemistry Expansion)',
          changes: [
            '🏆 **Universal Challenge Decks Expanded to 12 Core Simulations.** Brought self-checking formative assessment Challenge Modes to four foundational simulations: Reaction Kinetics, Cell Membrane Transport & Diffusion, Ecosystem Balance, and Population Genetics.',
            '💥 **Reaction Kinetics Challenges.** Added sequenced challenges testing activation energy barriers, low-temperature inorganic catalysis acceleration, enzyme-substrate active site saturation ($V_{\\text{max}}$), and thermal denaturation thresholds ($\\ge 1.8$ / $325\\text{ K}$).',
            '💧 **Cell Membrane Transport Challenges.** Added challenges testing passive nonpolar bilayer diffusion to dynamic equilibrium, glucose channel pore facilitation, ATP-driven active transport against concentration gradients, and multi-channel cellular homeostasis.',
            '🌿 **Ecosystem Dynamics Challenges.** Added challenges modeling 2-trophic stable green worlds, 3-trophic balanced coexistence across 100 ticks, and apex predator trophic cascades driving vegetation recovery.',
            '🧬 **Population Genetics Challenges.** Added challenges testing the Hardy-Weinberg null baseline ($N=1000$ over 25 generations), directional selection against recessive lethal alleles, small-population genetic drift with 100% allele fixation, and balanced polymorphism under heterozygote advantage.',
          ],
        },
        {
          version: 'v.15Sep.01',
          title: 'General Chemistry Textbook Usability, Readability, Sim & Resource Overhaul',
          changes: [
            '🖼️ **Framed Diagrams & Universal Lightbox Parity.** Guaranteed all illustrations, charts, and particle diagrams across all 27 chemistry lessons are enclosed in responsive `.diagram` and `.figure` containers with caption metadata and horizontal overflow protection. Broadened the universal lightbox in `core.js` to enable click-to-zoom modal inspection with Esc-key dismiss across all diagrams and SVG figures.',
            '🧪 **Standardized Formula Typography.** Standardized chemical formulas, nuclear decay equations, thermodynamic definitions, and cosmological relationships to `.chem-display.formula-lg` with monospaced lining numbers, high-contrast semantic theme colors, and responsive horizontal scrolling.',
            '⚛️ **Pedagogical Simulation Upgrades (Unit 5 Nuclear & Stellar Physics).** Added 4 interactive simulation engines: Solar Proton-Proton Chain Fusion Sim (4 nucleosynthesis stages, proton/deuteron kinematics, and mass defect $\\Delta m c^2$ accounting in `5-1a`); Stellar Core Collapse & Supernova Simulator (modeling degenerate iron core collapse, $70,000\\text{ km/s}$ electron capture infall, shockwave bounce, and $r$-process nucleosynthesis in `5-3a`); Radioactive Decay Transmutation Workbench (100-atom stochastic lattice with alpha/beta animations in `5-8a`); and Nuclear Fission & Reactor Criticality Simulator (single-neutron fission and multi-generation core criticality with control rods and emergency SCRAM in `5-8a`).',
            '⚡ **Animation Lifecycle Performance Observer.** Implemented `window.GC_REGISTER_ANIMATION` using an IntersectionObserver to pause 2D canvas simulation render loops whenever off-screen, eliminating background CPU and battery drain.',
            '🧠 **100% Spaced Repetition (SRS) Coverage.** Converted all practice sections across Units 4 and 5 to canonical Section 05 `.recall-section.recall` with `.blank[data-answer]`, enabling full question parsing by the dashboard Spaced Repetition (SRS) and Cram Mode engines across all 27 lessons.',
            '🔒 **Commit-Before-Reveal Answer Gating.** Enforced the interaction spec invariant across all self-explanation prompt cards, requiring substantive student input before revealing model answers.',
            '🎥 **Authentic K-Chem Video Resources.** Enriched resource panels across all 5 units with direct links to verified Dr. David Knuffke K-Chem YouTube video lessons and curated unit playlists.',
          ],
        },
      ],
    },
    {
      date: 'September 14, 2026',
      entries: [
        {
          version: 'v.14Sep.04',
          title: 'Codebase Modularization & 72% Production Bundle Optimization',
          changes: [
            '⚡ **72% Production Bundle Optimization.** Decoupled heavy client libraries (PDF generation, KaTeX math typesetting, and Lucide icons) into dedicated on-demand vendor chunks, reducing the initial JavaScript bundle payload from 2.66 MB down to 729 kB (213 kB gzipped) for drastically faster load times on student mobile devices and school Chromebooks.',
            '🧩 **Science Jeopardy Modularization.** Restructured the monolithic Science Jeopardy game from 1,947 lines down to 622 lines across 19 dedicated subcomponents and utilities (game HUD, pre-game review board, setup dashboard, question clue modal, final jeopardy stage, teacher print preview, dynamic SVG/canvas chart generator, and PDF export engine).',
            '🏠 **Landing Page Architecture Overhaul.** Streamlined the core landing page from 1,393 lines down to 547 lines by isolating the Welcome Hero Tile, Daily Practice Mission Card, General Chemistry Textbook Section, Onboarding Walkthrough Modal, and universal mode icon mapper into clean, modular subcomponents.',
            '🚀 **On-Demand View Code-Splitting.** Converted secondary game modes, teacher tools, document creators, and utility views across the application to lazy-loaded asynchronous chunks with a smooth, responsive view loading fallback.',
          ],
        },
        {
          version: 'v.14Sep.03',
          title: 'Universal Simulation Challenge Decks, Diagram Vector Tools & 5-Unit Suite',
          changes: [
            '🏆 **Universal Simulation Challenge Decks.** Added self-checking formative assessment Challenge Modes across all 8 core interactives (Calorimetry, Blood Buffers, Nuclear Decay, Ionic Bonding, Build an Atom, Covalent Bonding, Gas Laws, Phase Change) with progress tracking, hint drawers, dynamic verification banners, and 1-click solution application.',
            '📐 **Diagram Generator Vector Tools.** Upgraded the Chemistry Diagram Generator with publication-ready Energy Bar Diagrams (LOL Charts with First Law thermodynamic conservation checking), Phase Motion Diagrams strictly adhering to classroom conventions (vibration brackets for solids, slip-slide arcs for liquids, temperature-scaled velocity vectors for gases), continuous cubic-bezier Reaction Coordinate Profiles with catalyzed pathway overlays, and Nuclear Transmutation Equations with formatted nuclide notation and decay presets.',
            '📄 **Teacher Mode & Document Creator 5-Unit Suite.** Expanded 1-click curriculum presets in Document Creator and Teacher Workspace to all 5 chemistry units with new presets for Unit 1 (Chemical Hygiene & Structure) and Unit 2 (Prata Problems & Stoichiometry).',
            '🔍 **Comprehensive 27-Lesson Quality Audit.** Ran automated syntax, widget JSON schema, and glossary binding verification across all 27 textbook lessons with zero errors.',
          ],
        },
        {
          version: 'v.14Sep.02',
          title: 'Flashcard Formatting & Layout Improvements',
          changes: [
            '🧪 **Scientific Notation & Chemical Formatting in Flashcards.** Subscripts and superscripts (such as $Z_{\\text{eff}}$, chemical formulas, and ionic charge notations) now render cleanly using Markdown and KaTeX across all flashcard study, write, and quiz modes instead of displaying raw code tags. Thanks to **Ms. Vivian Huang** for the report!',
            '📏 **Adaptive Card Layout & No More Cutoff Questions.** Flashcards now feature adaptive typography scaling and vertically responsive scroll areas, guaranteeing that long-form multi-part questions and multiple-choice options are fully readable on all screen sizes without getting cut off at the top. Thanks to **Ms. Vivian Huang** for spotting this!',
            '✍️ **Write Mode Matching Robustness.** Answer validation in Flashcard Write Mode now strips formatting tags and normalizes mathematical notation, so typing "Zeff" correctly matches $Z_{\\text{eff}}$ without false penalties.',
          ],
        },
        {
          version: 'v.14Sep.01',
          title: 'Full 27-Lesson Chemistry Curriculum, 3 New Standalone Simulations & Socratic Mascot',
          changes: [
            '📚 **All 27 Chemistry Lessons Completed.** Units 3 (Energy & Phase Changes), 4 (Kinetics & Equilibrium), and 5 (Nuclear Chemistry) are fully written, interactive, and aligned with all 15 high school NGSS chemistry standards. Every lesson includes self-scoring checkpoints, live practice bridges, and instant reference lookups.',
            '☕ **New Simulation: Coffee-Cup Calorimetry.** Measure specific heat capacities of metals and enthalpies of solution inside a virtual insulated cup. Features dynamic thermal equilibration curves, realistic heat-loss modeling, and instant verification against known thermochemical values.',
            '🩸 **New Simulation: Arterial Blood Buffers & Homeostasis.** Explore the carbonic acid-bicarbonate buffer system maintaining human blood pH (7.35–7.45). Adjust pulmonary ventilation rates and renal bicarbonate excretion to diagnose and treat respiratory and metabolic acidosis and alkalosis.',
            '⚛️ **New Simulation: Nuclear Decay & Radiometric Dating.** Watch individual radioactive nuclei undergo alpha, beta, positron, and gamma decay in real time. Features dynamic isotope half-life plots and an archeological dating challenge to determine unknown artifact ages.',
            '🦉 **Textbook Socratic Mascot Companion.** A friendly study companion in the corner of every chemistry lesson. Signed-in students can ask questions about tricky concepts and receive Socratic guiding hints. Strict zero-auth gating ensures zero LLM token consumption for unauthenticated guests.',
            '📄 **1-Click Curriculum Presets for Teachers.** Document Creator and Teacher Tools now offer single-click setup for all 5 chemistry units, instantly populating targeted NGSS standards, question blends, and worksheets.',
            '🔍 **Mixed Review Drill Polished.** Fixed an issue where questions with multi-part prompts or diagram stimuli appeared blank during cram sessions; drill questions now dynamically parse and render all stimulus structures.',
          ],
        },
      ],
    },
    {
      date: 'September 5, 2026',
      entries: [
        {
          version: 'v.05Sep.01',
          title: 'Site-Wide Accuracy Pass & a Colophon for the Chemistry Textbook',
          changes: [
            '📖 **New: "How It Was Built" for the Chemistry Textbook.** The textbook now has a public colophon at `/chem/about.html`, linked from its topbar — what these pages are actually for, who wrote what (the teacher does the chemistry and the verification; AI coding agents write the code), the rules every lesson is held to, what the book still gets wrong and how to report it, and a plain-language version history of everything that has changed since the first lesson shipped. It is deliberately unflattering about the bugs.',
            '🤖 **How It Works Now Names the Right Model.** The page said Gemini 2.5 Flash; the app has run on Gemini 3.6 Flash since July, with Gemini 2.5 Pro for reading images and PDFs. Also corrected the tech stack (it said Vanilla CSS, it is Tailwind) and rewrote the development section to describe the workflow honestly rather than naming tools that have changed three times.',
            '🔐 **Privacy Copy Now Matches the August Sign-In Change.** Three pages still promised the site would "never offer logins" — written before Google Workspace sign-in shipped, and no longer true as stated. They now explain what signing in actually does: Google confirms you are at an approved school, and only that domain is stored. Never your name, never your email. There is still no user database and no student account.',
            '☕ **Support Page: No More Phantom Access Codes.** It was still selling a Ko-fi membership as the way to get an "access code," a flow that stopped existing in August. It now says the true thing: access is granted by school Google Workspace domain, and supporting the project is how a teacher outside an approved school gets their domain added.',
            '🔢 **Counts and Names Corrected Everywhere.** 13 simulations, not 11. 28 AP and IB courses, not "21 Advanced Placement subjects." "AP Study Budy" is now "Advanced Study Buddy" on every card. "Kinematics Motion Tracker" is just Motion Tracker, which is what it is called everywhere else. The app also settled on one name for itself — **Science Practice Partner** — after two years of disagreeing with itself between the homepage and the dashboard.',
            '🧪 **Under the Hood.** The Advanced Study Buddy was still pinned to an older model in four places despite the July upgrade; it now follows the project default like everything else.',
          ],
        },
      ],
    },
    {
      date: 'September 2, 2026',
      entries: [
        {
          version: 'v.02Sep.01',
          title: 'Chemistry Textbook: Working Progress Tracking, Resume & Reference Center',
          changes: [
            '📊 **Your Lesson Progress Actually Counts Now.** Checkpoints you completed were being saved, but the dashboard was reading them the wrong way — so every lesson bar sat at 0% and said "Not Started" no matter how much work you had done. Lesson cards now show a real count, like "6/10 checkpoints", and move as you go.',
            '↩️ **Pick Up Where You Left Off.** Lessons now remember the furthest section you reached — even if you were only reading and hadn\'t answered anything yet — and offer a Resume bar when you come back. It never jumps the page on its own, and you can dismiss it.',
            '📖 **Reference Center on the Textbook Home Page.** The slide-out periodic table, formulas and tables, and chemistry calculator used to be reachable only from inside a lesson. They are now one click from the textbook dashboard as well.',
            '🧪 **Chemical Nomenclature Rebuilt — 1 Checkpoint to 10.** This lesson had almost nothing to practice against, and its progress card was invisible to the dashboard entirely. It now has a formula sorter, a charge-balance ledger, a name-to-formula walkthrough, a work-backwards Roman numeral builder, and a prefix drill — and every wrong answer now explains why that choice was tempting instead of just marking it wrong.',
            '🔒 **Clearing Progress No Longer Signs You Out.** The textbook\'s Clear Progress button was also wiping your sign-in, your trophies, and your theme setting. It now clears only the chemistry progress it promises to.',
            '💬 **Clearer Feedback Button.** The textbook topbar button now reads "Submit Feedback".',
          ],
        },
      ],
    },
    {
      date: 'August 25, 2026',
      entries: [
        {
          version: 'v.25Aug.01',
          title: 'Google Workspace Domain Sign-In & Zero-PII Session Auth',
          changes: [
            '🔐 **Google Workspace Sign-In.** Replaced the legacy classroom code system with Google Identity Services sign-in, restricted directly to approved school domains (e.g. `@sas.edu.sg`).',
            '🛡️ **Zero PII Stored.** Session tokens are signed server-side and contain only the verified school email domain — no student names, email addresses, or personal identifiers are stored on-device or collected.',
            '✨ **Seamless Session Persistence.** Verified sign-ins stay active for 90 days across browser sessions with automatic silent re-validation.',
            '🧪 **Unrestricted Free Simulations.** Interactive science simulations remain completely public and open for all students with zero sign-in required.',
          ],
        },
      ],
    },
    {
      date: 'August 14, 2026',
      entries: [
        {
          version: 'v.14Aug.01',
          title: 'Build an Atom: Atomic Number Readout, Ionic Charge Badge & Valence vs. Kernel Electrons',
          changes: [
            '🔢 **Dedicated Atomic Number (Z) Instrument.** Live gauge tracks proton count and element identity directly alongside Mass Number and Net Charge.',
            '⚡ **Ionic Charge & Floating Bohr Badge.** Net Charge panel is now explicitly labeled "Net Charge / Ionic Charge", with a floating non-zero charge badge (+1, 2−, etc.) rendered right on the Bohr diagram.',
            '🎨 **Valence vs. Kernel Electron Distinction.** Inner kernel electrons are styled in slate-blue while outer valence electrons are vibrant cyan, paired with a dynamic legend and sidebar kernel electron counter.',
            '🧪 **Subatomic Particle Grouping.** Particle inventory now properly organizes Protons and Neutrons under "Nucleons" and Electrons under a separate sub-header with visual division.',
            '☢️ **Clear Radioactive Label.** Unstable isotopes now clearly display "Unstable Nucleus — Radioactive ☢️" in the live stability status badge.',
          ],
        },
      ],
    },
    {
      date: 'July 24, 2026',
      entries: [
        {
          version: 'v.24Jul.01',
          title: 'Smarter AI Companion, Direct Sim Links & Gradual Release Tutoring',
          changes: [
            '⚡ **Gemini 3.6 Flash Power.** Upgraded core AI capabilities across all practice and assessment tools to Gemini 3.6 Flash.',
            '🚀 **Direct Simulation Links.** Your AI Companion can now send you directly to specific simulations (e.g. Ideal Gas Laws, Reaction Kinetics, Build an Atom) right from chat.',
            '🎨 **Bot-Driven Settings & Setup Picker.** Ask your companion to toggle dark mode, switch mascot avatars, or update your name. First-time users are greeted with an in-chat theme and companion setup picker.',
            '📈 **Smarter Gradual-Release Tutoring.** Calculation Partner and Explanation Partner now start with step-by-step guidance and hand over more problem-solving ownership to you as you demonstrate mastery.',
          ],
        },
      ],
    },
    {
      date: 'July 10, 2026',
      entries: [
        {
          version: 'v.10Jul.02',
          title: 'Build an Atom: Through Argon, Isotope Abundance & Layout Fixes',
          changes: [
            '⚛️ **Now Builds Through Argon.** The sandbox now supports every element from Hydrogen to Argon (Z 1–18) — new elements, nuclear stability rules, and a third row on the mini periodic table.',
            '🔎 **Click for Full Element Details.** Click the Active Element Card to open a full detail popup — the same style as the Periodic Table interactive — with properties (mass, electron configuration, electronegativity, ionization energy, radius, melting/boiling points) plus Bohr Model, Lewis Dot, and visible Spectra tabs.',
            '📊 **Isotope Natural Abundance.** The element popup now shows the natural abundance of the exact isotope you\'ve built (e.g. Chlorine-35 → 75.76%), or flags it as not naturally occurring for synthetic/radioactive mass numbers.',
            '🧭 **Cleaner Layout.** A compact Mass Number and Net Charge readout now sits above the atom, and the Proton / Neutron / Electron bins sit directly under it — main controls right where you\'re looking.',
            '🐛 **Charge Knob Fix.** The Net Charge scale pointer no longer slides out of its track when you set large positive or negative charges.',
          ],
        },
        {
          version: 'v.10Jul.01',
          title: 'Periodic Table Spectra: Expanded to 97 Elements (NIST Database)',
          changes: [
            '🌈 **Spectra for 97 Elements.** The Periodic Table\'s Spectra tab now covers 97 elements (up from 28), rebuilt directly from a NIST Atomic Spectra Database export. Nearly every element you can click — from Hydrogen to Einsteinium — now shows a real visible-light emission and absorption spectrum.',
            '🔬 **Cleaner, Stronger Lines.** Each element is reduced to its 25 strongest visible lines (380–700 nm), with near-duplicate and faint lines merged or trimmed so the strip stays readable. Hover any line for its exact wavelength.',
            '🎯 **Authoritative Data.** All wavelengths and relative intensities come straight from NIST — no estimated or hand-entered values. Astatine and Francium (no reliable visible data) still show the friendly "no lines on record" note.',
          ],
        },
      ],
    },
    {
      date: 'July 9, 2026',
      entries: [
        {
          version: 'v.09Jul.01',
          title: 'Periodic Table: Visible-Light Emission & Absorption Spectra',
          changes: [
            '🌈 **New Spectra Tab.** The Periodic Table\'s element detail popup gains a **Spectra** tab alongside Bohr Model and Lewis Dot — see each element\'s visible-light emission spectrum (bright lines on black, like a gas discharge tube through a spectroscope) and absorption spectrum (dark lines on a rainbow), covering 380–700 nm and sourced from NIST atomic spectroscopy data.',
            '🔬 **28 Elements with Classroom-Famous Spectra.** Includes Hydrogen\'s clean Balmer series, Neon\'s dense red-orange forest (why neon signs glow red-orange!), Sodium\'s yellow D-line doublet at ~589 nm, Mercury, Helium, and more. Hover any line to see its exact wavelength.',
            '📖 **About Panel Guidance.** New How-To content explains how emission and absorption lines both come from the same electron energy-level transitions, with suggested experiments to try.',
            '🔗 **Shareable Simulation Links.** Every interactive simulation now has its own unique, copyable URL — including Build an Atom, which was previously missing one. Open any simulation and the address bar updates to a link you can share directly with students.',
          ],
        },
      ],
    },
    {
      date: 'June 3, 2026',
      entries: [
        {
          version: 'v.03Jun.02',
          title: 'Subject Library: Course-Level Filters & Alphabetical Subject Tabs',
          changes: [
            '🎚️ **Filter by Course Level.** The Subject Library now includes a second row of filter tabs for course rigor level — **General, Honors, AP, and IB** — ordered from least to most rigorous. Combined with the existing subject filters, you can now jump straight to, say, every AP course or every General-level course in one click.',
            '🔤 **Alphabetical Subject Tabs.** The subject filter tabs (Chemistries, Earth & Environmental, Elementary, Life Sciences, Middle School, Physics, Science Electives) are now sorted alphabetically, with "All Subjects" pinned first and a divider separating subjects from the new level filters.',
          ],
        },
        {
          version: 'v.03Jun.01',
          title: 'Advanced Study Buddy: IB Science Courses, Grading Alignment Fix & Curriculum-Based Catalog',
          changes: [
            '🌍 **IB Science Courses Launched.** Eight new International Baccalaureate science courses are now available in Advanced Study Buddy: IB Biology SL/HL, IB Chemistry SL/HL, IB Physics SL/HL, and IB Environmental Systems & Societies SL/HL. Each course includes a structured syllabus with authentic IB command-term rubrics (State / Describe / Explain / Evaluate / Discuss).',
            '🧠 **Dynamic IB Socratic Tutor.** The Socratic tutor now fully adapts to IB vs. AP context — switching system prompts, grading rubrics, command-term definitions, and scope rules based on the selected course. IB sessions are graded against the IB Assessment Criteria (Marks 1–4) rather than AP rubrics.',
            '🎯 **Grading Alignment Fix.** Resolved a long-standing issue where the feedback/grading model was unaware of the exact MCQ options and correct answer generated during question creation. The grader now receives the full option list and designated correct answer for every question — eliminating hallucinated distractor analysis and preventing the model from silently re-deciding which answer was correct.',
            '🗂️ **Curriculum-Based Course Catalog.** The Advanced Study Buddy course browser is now organized by curriculum track instead of subject area. Courses are grouped into clearly marked **AP (Advanced Placement)** and **IB (International Baccalaureate)** sections with distinct visual identities (blue for AP, amber for IB). Subject sub-headings remain within the AP section for easy navigation.',
            '♻️ **Component Refactor.** The catalog card and grid JSX has been extracted into reusable `CourseCard`, `CourseGrid`, and `CurriculumSection` sub-components, eliminating ~200 lines of duplicated markup and making the catalog much easier to extend for future curriculum tracks (e.g., Regents).',
          ],
        },
      ],
    },
    {
      date: 'June 1, 2026',
      entries: [
        {
          version: 'v.01Jun.02',
          title: 'Science Practice Partner: Premium Settings Customization & Conversational Site Assistant',
          changes: [
            '⚙️ **Personalization & Settings Spotlight.** Expanded the first-visit spotlight walkthrough from 4 to 5 highly detailed steps, guiding students through custom username settings, Socratic companion selection (🤖 Science Bot, 🧪 Beaker Buddy, 🌱 Happy Plant, 🐹 Cool Gerbil), dark appearance view themes, dyslexia-friendly high-readability fonts, local sandboxed memory models, and Teacher Mode features.',
            '💬 **Conversational Site Assistant Companion.** Upgraded the homepage Socratic mascot companion chatbot to act as a highly knowledgeable, context-aware site assistant, helping users learn about feature navigation, local privacy limits, and unlocks.',
            '🔗 **Interactive Chat Navigation Shortcuts.** Integrated dynamic clickable chat button triggers (`[settings]`, `[trophy]`, `[subjects]`, `[review_games]`) inside the companion response panel, allowing the AI to route users instantly to specific views.'
          ],
        },
        {
          version: 'v.01Jun.01',
          title: 'Science Practice Partner: Bohr Model Sandbox, Onboarding Spotlight, Socratic Simulations & Centralized Feedback',
          changes: [
            '⚛️ **Bohr "Build an Atom" Sandbox.** Deployed a high-fidelity interactive atomic builder (inspired by PhET Interactive Simulations) featuring animated rotating electron SVG shells (n=1 max 2, n=2 max 8, n=3 max 8), golden spiral nucleon clustering, real-time nuclear stability engine with shaking animations, mass number gauges, charge scale sliders, and element highlights on a clickable miniature H-to-Ne Periodic Table alongside 8 gamified level challenges.',
            '🤖 **Mascot Socratic Simulation Panels.** Added slide-out interactive Mascot panels across all simulators (Covalent Bonding, Ionic Bonding, Phase Change, Free Body Diagrams) that pose custom, thought-provoking Socratic prompts leveraging your active companion mascot animations.',
            '✨ **Spotlight Onboarding Tutorial.** Integrated an elegant, dismissible 4-step modal tour overlay for first-time visitors covering favorites custom pinning in the Practice Center, subject selection and preferences settings (dark mode, dyslexia-friendly fonts), and Socratic advisor guides.',
            '💌 **Centralized Feedback & Formspree Contact.** Overhauled student and teacher feedback mechanics, mounting a unified secure contact modal connected to Formspree, completely purging generic and broken mailto: tags.',
            '📈 **Visual Bento Overhauls.** Redesigned the grade level selectors, Let\'s Get Started inputs, and dual-concentric rotating gradient preparation spinners to dynamically adapt to Light/Dark modes, replacing standard emojis with sleek Lucide React vector graphics.',
            '📚 **Guides and Documentation Updates.** Revamped the Features Guide and AI Systems Reference sheets to thoroughly document the technical prompt pipelines and features of AP Study Budy, The Learning Loop, Kinematics Motion Tracker, and Simulations Hub.'
          ],
        },
      ],
    },
    {
      date: 'May 31, 2026',
      entries: [
        {
          version: 'v.31May.02',
          title: 'Science Practice Partner Phase V: Premium Vector Icons & Full Brand Alignment',
          changes: [
            '🎨 **Premium Vector Icon Migration.** Migrated all core practice modes, homepage launch buttons, and Practice Center sub-tabs from platform-dependent native emojis to high-fidelity, custom-colored Lucide React SVG vector icons. This ensures visual excellence and cross-platform design consistency across macOS, iOS, Windows, and Android.',
            '🏷️ **Branding Alignment Purge.** Fully purged the leftover "Science Buddy" fallbacks and generic naming. Upgraded dashboard sidebar to "Science Practice Partner", customized username profile fallback to "Science Student", renamed advisor instructions to "Science Practice AI", and rebranded advisor input placeholders to "Ask AI".'
          ],
        },
        {
          version: 'v.31May.01',
          title: 'Science Practice Partner Phase IV: Mascot Customization, Study Planner Advisor & Branding Overhaul',
          changes: [
            '🤖 **Mascot Customization System.** Choose from four distinct animated science companions: **Science Bot** (Futuristic Companion 🤖), **Beaker Buddy** (Bubbling chemistry flask 🧪), **Happy Plant** (Smiling terracotta pot with leaf-waving animations 🌱), or **Cool Gerbil** (tan classroom pet wearing thick dark-rimmed glasses and a sharp scientific bowtie 🐹). Selection propagates instantly and automatically site-wide.',
            '💬 **Conversational Study Planner Advisor.** Welcome Hero has been upgraded to an interactive two-way study planning cockpit! Ask your active companion study questions, and they will respond in their unique companion persona (high-tech beeps for robot, bubbling reactions for beaker, photosynthesizing puns for plant, squeaks for gerbil) along with clickable dynamic launcher buttons to start learning modes instantly.',
            '🗂️ **Sidebar Redesign.** Upgraded How It Works, Support, and Site Updates to full-sized, bubble-styled navigation buttons matching the primary menu styling with custom vector icons (book, life buoy, megaphone) and active highlights.',
            '🏷️ **Branding Renamed.** Rebranded the entire application to **Science Practice Partner** in the sidebar, and upgraded the welcome tag to **Science Practice AI** on the homepage.'
          ],
        },
      ],
    },
    {
      date: 'May 22, 2026',
      entries: [
        {
          version: 'v.22May.01',
          title: 'Jeopardy: Clever Whole-Course Clues & Image Model Upgrade',
          changes: [
            '🧠 **Witty Clue Prompting.** Solved style drift in Whole-Course Jeopardy review games. Restructured core generation and refresh prompts to replace dry definition examples with contrasted "DRY vs. CLEVER" few-shot guidelines, forcing the AI to consistently produce clever, pun-filled science riddles.',
            '🔮 **Vision Model Upgrade.** Upgraded the image parsing model in Jeopardy to the production-stable `gemini-2.5-pro` (previously experimental `gemini-2.0-pro-exp-02-05`), ensuring smooth, high-fidelity diagram processing.',
          ],
        },
      ],
    },
    {
      date: 'May 21, 2026',
      entries: [
        {
          version: 'v.21May.01',
          title: 'Jeopardy: Fixed Schema State-Space Serving Error',
          changes: [
            '🐛 **Fixed Jeopardy Board Generation Error.** Resolved the Gemini API `INVALID_ARGUMENT` error where the board could not be built due to the response schema having too many states. Simplified nested validation structures for charts and tables in the initial generator schema, dramatically reducing complexity while fully retaining structured output safety and parsing safeguards.',
          ],
        },
      ],
    },
    {
      date: 'May 6, 2026',
      entries: [
        {
          version: 'v.06May.08',
          title: 'Who Am I? — Setup Options, Auto-Scroll, Per-Clue Editing',
          changes: [
            '📚 **Load from the setup screen.** You can now go straight from the setup screen to a saved game without generating anything. Hit "Load from Library" and pick any deck you\'ve saved before.',
            '⚙️ **More setup options.** Choose how many puzzles (3, 5, 8, or 10), difficulty level (Easier / Mixed / Harder), fun factor, and optionally paste or upload source material to ground the AI on your specific notes.',
            '🔄 **Auto-scroll through revealed clues.** Once you\'ve revealed 2 or more clues, the game display automatically cycles focus through them so students can re-read each clue without you scrolling. Dwell time scales with reading length (5–12s). Pause anytime. Slow / Medium / Fast speed control in the header.',
            '✏️ **Per-clue editing in the preview.** Hover over any clue to see Edit, Regenerate (single AI call), and Delete (min 2 per puzzle). An Add Clue button appears at the bottom of each puzzle\'s clue list when you have fewer than 7.',
            '🔁 **Regenerate All.** The toolbar now has a Regenerate All button to replace the whole deck without going back to setup.',
            '⌨️ **Keyboard shortcuts in the game.** Space = reveal next clue (or answer when all shown), →/N = next puzzle, ←/B = previous, P = pause auto-scroll, Esc = exit.',
            '🔢 **Progress dots** in the game header show where you are in the deck — click any to jump directly.',
            '🕐 **Recent topics chips** on the setup screen for one-click reuse of your last 5 topics.',
          ],
        },
        {
          version: 'v.06May.07',
          title: 'End Round: Save Card vs. Discard Card',
          changes: [
            '🔁 **End Round now has two flavors.** When you press End Round in a Charades or Taboo round, you can choose: **Save Card** (the in-flight card carries over and is the first card of the next team\'s turn) or **Discard** (the in-flight card is dropped). At time-expired, Save Card is the highlighted option since that\'s usually what you want when the buzzer cuts off a guess.',
            '🐛 **Fixed an off-by-one** that could end the game one card early when you used Save Card on the last card of the deck.',
          ],
        },
        {
          version: 'v.06May.06',
          title: 'Printable Cards: A4 Sizing Fix + Timer Last-Call Grace',
          changes: [
            '🖨 **Print pages now wrap correctly to A4.** Charades, Taboo, BINGO, and Square Match printouts were sized to the full page height but with margins applied, so content overflowed by ~16–20mm and split cards across pages. The grid containers and card wrappers now use the actual usable area (A4 minus the page margins), each card has `break-inside: avoid` so it can\'t split mid-card, and long terms wrap on word boundaries with hyphens instead of overflowing.',
            '⏱ **Timer no longer cuts you off at the buzzer.** In Charades and Taboo, when the round timer hit 0 the screen jumped straight to the round-review screen — if a student got the answer right (or fouled) right at the buzzer, you had no chance to record it. Now when the clock hits 0 the card stays visible with a "TIME!" badge and a Last-Call banner. Press Got It, Skip, or Foul to record that final outcome and advance to review, or End Round to skip the in-flight guess entirely.',
          ],
        },
        {
          version: 'v.06May.05',
          title: 'Charades + Pictionary, End-of-Round Score Correction',
          changes: [
            '🎨 **Pictionary mode** is now built into the Charades generator. Pick "Charades" (act it out) or "Pictionary" (draw it) at the top of the setup screen — the AI picks terms appropriate to whichever mode you chose. Decks saved to your library remember the mode they were built for.',
            '✏️ **End-of-round score correction.** When a Charades or Taboo round ends, you now land on a Round Review screen that lists every card from the round you just played. Tap any card to flip it from Correct → Skip → Foul → Correct, or remove a card from the round entirely if it shouldn\'t have counted. Your team total updates live as you make changes. Hit "Confirm & Next Team" when you\'re happy with the score.',
            '⏯ **Pause + End Round Early.** The live play screen now has a Pause button (timer freezes, action buttons disable) and an End Round Early button (jump straight to the review screen). Both Charades and Taboo.',
            '🙏 **Thanks to David** for the feedback that score corrections were too eager — this rebuilds the round flow around an editable log instead of immediate score writes.',
          ],
        },
        {
          version: 'v.06May.01',
          title: 'Square Match: Edit Bug Fix',
          changes: [
            '🔧 **Edit was unusable.** Editing a Square Match pair only let you type one letter before the input lost focus, and deleting a pair scrolled the list all the way back to the top. The pair editor was being completely rebuilt on every keystroke instead of updating in place. Now the editor reconciles in place — type freely, delete a pair anywhere in the list and the scroll position holds.',
            '🙏 **Thanks to Ms. Vivian Huang** for catching this one — second report this month!',
          ],
        },
        {
          version: 'v.06May.02',
          title: 'New Review Game: Science Charades',
          changes: [
            '🎭 **Charades generator** in Review Games. Type a topic, get a deck of AI-generated charades cards (term + category + difficulty pill + optional actor hint). Edit any card with full Jeopardy-style controls: inline edit, AI Revise (describe what to change), single-card Regenerate (dedupes against the rest of the deck), Delete, Add manual.',
            '🖨 **Print or play live.** Print 6 cards per page for physical play, or launch the live in-app game with team scoring, configurable round timer (30/60/90/120s), and keyboard shortcuts (Space = correct, S = skip).',
            '💾 **Save decks to a library** — pull them back up next semester with the same class.',
          ],
        },
        {
          version: 'v.06May.03',
          title: 'New Review Game: Science Taboo',
          changes: [
            '🚫 **Taboo generator** in Review Games. Generate target-word cards with forbidden clue words. The classic 5-word Taboo deck is the default, but you can slide between 3 and 7 forbidden words depending on the difficulty you want.',
            '🔴 **Classic styling.** Cards render in the iconic red-bordered Taboo look — target word on top, forbidden words in red below — both on screen and on print (4 cards per page).',
            '⌨️ **Live play with team buzzers.** Keyboard shortcuts: Space = got it (+1), F = foul (−1, opposing team buzzed), S = skip. Optional skip-penalty toggle in the live-game setup screen.',
            '✏️ **Same teacher controls** as Charades and Jeopardy: per-card AI Revise, single Regenerate, manual edit, delete, add. Save decks to your personal library.',
          ],
        },
        {
          version: 'v.06May.04',
          title: 'Who Am I? & BINGO: Per-Card AI Editing',
          changes: [
            '✨ **AI Revise on every Who Am I puzzle.** Hit the Sparkles button next to any puzzle to describe what you want changed ("make the clues more concrete", "swap to a more famous example", "use a real-world application for clue 2") and the AI will revise that single puzzle without touching the rest of the deck. Also added Add Puzzle (single new puzzle that dedupes against the deck) and Delete Puzzle to the toolbar.',
            '✨ **AI Revise + Single Regenerate on every BINGO term.** Same affordances on each term card — Sparkles to describe a change, RefreshCw to swap in a fresh dedup-aware replacement.',
            '🎯 **Why:** Brings Who Am I and BINGO up to the same per-card AI editing experience that Jeopardy got in April. The full Review Games suite now shares one teacher-authoring pattern.',
          ],
        },
      ],
    },
    {
      date: 'May 4, 2026',
      entries: [
        {
          version: 'v.04May.01',
          title: 'Jeopardy: Uneven Board Bug Fix',
          changes: [
            '🔧 **5×5 board enforced.** Generated Jeopardy boards occasionally came back with one category holding an extra clue (e.g., 6 questions in one column, 5 in the others). Because all columns share a row height, the over-stuffed column compressed to fit while the neighboring columns pushed their $1000 tile below the visible area — the board looked uneven and a clue went missing. The board generator now hard-enforces exactly 5 categories and exactly 5 clues per category at the canonical $200 / $400 / $600 / $800 / $1000 values, both via the AI response schema and a post-generation safety pass.',
            '🙏 **Thanks to Ms. Vivian Huang** for the bug report — caught while running a Nuclear Chemistry game with her class!',
          ],
        },
      ],
    },
    {
      date: 'May 2, 2026',
      entries: [
        {
          version: 'v.02May.01',
          title: 'Ideal Gas Laws: Reversible Thermodynamics, Vent, Configurable Graph',
          changes: [
            '🔧 **Reversible compression / expansion (bug fix).** Compressing the gas heated it correctly, but returning the piston to its original volume left the gas hotter than where it started — the round-trip was not adiabatic. The collision physics has been replaced with stationary-wall bounces plus a per-tick adiabatic velocity scale (T·V = const for a 2D ideal gas). Compress to half volume, expand back, and the temperature now returns to where it started. All four gas laws (Boyle, Charles, Gay-Lussac, Avogadro) and Dalton\'s Law remain intact.',
            '🆕 **Open Vent.** New toggle in the controls panel opens a gap in the right wall just below the piston. Gas particles in that band stream out and are removed from the system, dropping pressure and particle count in real time. Use it to demonstrate that pressure depends on n, or to relieve pressure before the vessel breaks.',
            '📊 **Configurable graph axes.** The Live Readings graph now has X and Y axis dropdowns. Keep X = Time for the original multi-line view, or pick any pair of variables to plot directly against each other — set X = Volume, Y = Pressure to see Boyle\'s Law as a curve, X = Temperature, Y = Pressure for Gay-Lussac, etc. Discover the gas laws empirically instead of just reading them off a quick-reference panel.',
          ],
        },
      ],
    },
    {
      date: 'April 29, 2026',
      entries: [
        {
          version: 'v.29Apr.01',
          title: 'Free Body Diagrams: Point-Particle Refresh',
          changes: [
            '🎯 **Object is now a dot.** A proper Free Body Diagram represents the object as a single point — so it does. When you pick an object type (block, sphere, car, person, etc.), the canvas now shows a small filled dot with the object label beside it, and every force arrow visibly emanates from that one point. The preset selector still drives the scenario context and AI suggestions, but the point-particle convention is now respected on the canvas.',
            '🔧 **Arrowhead direction fix.** Force arrowheads were tilting incorrectly for any non-horizontal force (the head was rotating opposite to the shaft on the vertical axis). Heads now fan back from the tip cleanly at every angle.',
            '🔧 **Incline rendering fix.** Selecting "Flat" used to show what looked like an incline (because the angle slider state defaulted to 30° even when not in use), and the angle slider appeared to be missing. The canvas now matches the surface you actually picked, and the angle slider shows up exactly when "Incline" is selected.',
            '📱 **Touch drag support.** Dragging arrowheads now works on tablets and phones, not just mouse/trackpad. Pinch-scroll won\'t hijack a force-rotation drag anymore.',
            '🎚️ **Quick-angle row reordered.** The cardinal angle preset row now reads 0° / 90° / 180° / 270° (right / up / left / down) — matching the legend directly above it instead of the prior down-up-right-left ordering.',
          ],
        },
        {
          version: 'v.29Apr.02',
          title: 'Physics Video Tracker Integrations',
          changes: [
            '🎥 **Video Motion Tracker:** We have integrated an incredible new physics tool to track real-world motion frame-by-frame. Upload any video, set a scale and origin, and click to track an object. The app will automatically generate position and velocity graphs with linear and quadratic regression models.',
            '🏫 **Credit:** This feature was originally developed and generously shared by **Mr. Brendan Madden**. Thanks for the contribution to the physics community!'
          ],
        },
      ],
    },
    {
      date: 'April 26, 2026',
      entries: [
        {
          version: 'v.26Apr.01',
          title: 'Simulation Suite Overhaul + Free Body Diagrams',
          changes: [
            '🆕 **Free Body Diagrams (Physics):** A brand-new interactive simulation in the Physics section of the Simulations Hub. Build Mode lets you place any combination of forces on an object, rotate and resize them by dragging, and watch the live vector decomposition table and net-force arrow update in real time. Practice Mode gives you 11 guided scenarios across flat surfaces, inclined planes, pulleys, and vertical motion — place your forces, press "Check My FBD" for instant color-coded feedback (green = correct, yellow = wrong direction, red = extra/missing), or reveal the solution overlay. Logged-in users also get AI physics tutor feedback with strengths, issues, and teaching points.',
            '🔧 **Particle Phase Change — Science Fix:** Gas particles now behave correctly. When a substance boils, particles scatter instantly across the entire vessel instead of pooling at the floor. Particle–particle repulsion is disabled in the gas state (gases have no significant IMFs). H₂O now renders as a bent molecule with a red oxygen atom and two white hydrogen atoms; O₂ as a dumbbell; CO₂ as a linear O–C–O structure that sublimates (no liquid phase). Carbon Dioxide is now a fourth substance in the sim.',
            '🔧 **Reaction Kinetics — Visuals & Science:** The product particle (formerly a plain purple sphere) now renders as a fused red–blue dumbbell labeled "AB," accurately representing the A+B combination. A legend panel below the canvas explains each particle type. The energy barrier diagram now has a live pointer dot that tracks the system\'s average kinetic energy and flashes yellow when a reaction fires. In Enzyme mode, the enzyme now has a visible C-shaped active site, denatures visually at high temperatures (gray blob, reactions stop), and suppresses reactions in the cold.',
            '🔧 **Ideal Gas Laws — Drag Piston:** The piston can now actually be dragged. Click and drag up/down directly on the piston bar in the canvas — it highlights blue while you hold it and the container never breaks, even at extremes. The misleading "drag to change volume" label that previously did nothing is now true.',
            '🔧 **Ideal Gas Laws — Visual Refresh:** Clean white background with a subtle grid, slate vessel walls, temperature-responsive particle colors: Gas A = red (dim when cold, vivid red when hot), Gas B = smaller blue (dim when cold, vivid blue when hot). An on-canvas key labels both gases.',
            '🔧 **Covalent Bonding — Lone Pair Geometry:** Lone electron pairs now sit at true cardinal directions (North/South/East/West) after bonds form. The previous implementation placed them 30° off-axis; the fix uses a VSEPR-aware slot calculator that identifies occupied bond directions and places lone pairs symmetrically in the remaining cardinal slots.',
            '🔧 **Cell Membrane Transport — Proton Pump Animation:** Active-transport pumps now animate their full mechanism. Each pump cycles through binding → pumping (interior glow) → releasing phases, with a directional arrow showing which way ions are moving and small "H⁺ in/out" labels. A speed selector (0.25× to 4×) lets you slow the sim to observe osmosis and diffusion, or speed it up to run long experiments.',
            '🔁 **Biological Systems Modeler (renamed from Regulatory Modeler):** The scope has been expanded from gene/protein expression to any biological regulation system. New component types: Hormone, Receptor, Signaling Molecule, Organism, Population. Four domain palettes (Gene Regulation, Hormonal Feedback, Signal Transduction, Ecological). Four new starter circuits: Blood Glucose Homeostasis (insulin/glucagon), G-Protein Receptor Cascade, Predator–Prey, and the existing gene circuits. Your work is now saved to the browser and can be reloaded with the Save/Load buttons.',
            '📊 **Data Export Everywhere:** Every simulation that generates a graph now has PNG and CSV export buttons. Download population curves, heating curves, pressure-volume data, concentration gradients, and activation levels as spreadsheet-ready CSVs or graph screenshots.',
            '🏷️ **Status Labels Updated:** Ecosystem Balance and Population Genetics are now fully published — no more beta badge.',
          ],
        },
      ],
    },
    {
      date: 'April 21, 2026',
      entries: [
        {
          version: 'v.21Apr.02',
          title: 'Jeopardy: Save to Library From the Review Screen',
          changes: [
            '**Save Right After Construction:** The pre-game review screen now has a **Save to Library** button alongside Discard and Approve, so you can archive a freshly generated (and edited) board without having to start the game first.',
          ]
        },
        {
          version: 'v.21Apr.01',
          title: 'Jeopardy: Final Jeopardy Edit & AI Revise',
          changes: [
            '**Final Jeopardy Parity:** The Final Jeopardy card in the pre-game review now has the same **Edit** and **AI Revise** buttons as every other category and clue. Rewrite the category, the clue, and the answer directly — or tell the AI what you want changed and let it regenerate — before play begins.',
          ]
        }
      ]
    },
    {
      date: 'April 20, 2026',
      entries: [
        {
          version: 'v.20Apr.02',
          title: 'Jeopardy: Board Authoring, Daily Double Control & Display Polish',
          changes: [
            '**AI Revise for Clues & Categories:** Every clue and category in the Instructor Preview now has an "AI Revise" button that opens a rich editor — current clue visible, free-text prompt box, and for categories an editable title field. Tell the AI "make it harder," "focus on stoichiometry," or "switch this category to enzymes" and it rewrites accordingly.',
            '**Daily Double Control:** Daily Doubles are now visible in both the pre-game review and the Instructor Preview — each marked clue gets a gold "Daily Double" badge and an amber border ring. Click "Make DD" on any clue to move a Daily Double there (or "Remove DD" to clear it). Teachers can now stage the drama instead of relying on random placement.',
            '**Difficulty Progression Selector:** The setup form now offers a choice between "Random" (default, current behavior) and "Increasing $200 → $1000" (difficulty ramps within each category). The AI prompt is adjusted accordingly.',
            '**Display Font for Category Headers:** Category headers now use Archivo Black — a heavier, more headline-appropriate typeface — and are taller (h-28 / md:h-32). Long titles auto-shrink through four font tiers, and if a title still overflows at the smallest size it gently marquee-scrolls so nothing gets cut off.',
            '**HUD Fixes:** The action-button row (Save Initial, PDF Guide, Library, Preview, Re-open) now horizontally scrolls instead of clipping when cramped. Enter Final Stage button is pinned to the right of the teams bar so it remains visible no matter how many teams you have.',
          ]
        },
        {
          version: 'v.20Apr.01',
          title: 'Jeopardy Review Game: Reliability, Legibility & Teacher QOL',
          changes: [
            '**Truthful Error Messages:** The "too much data" alert that appeared on any board-generation failure has been replaced with error-aware messaging — timeouts, rate limits, auth failures, and malformed responses each show a specific, actionable message instead of the old catch-all.',
            '**Upgraded AI Model:** Jeopardy now uses the project default `gemini-2.5-flash` across all 7 Jeopardy functions (board, clue refresh, category refresh, custom answer, chat, practice problems, study tips), matching the rest of the app.',
            '**Pre-Game Board Review:** Generated boards now show a review screen before play begins — categories, clues, and values are all visible so teachers can edit, refine, or refresh anything before the first team picks a square.',
            '**Adaptive Clue/Answer Sizing:** Long clues and long answers now resize to fit cleanly in the modal; short answers no longer balloon to comic proportions.',
            '**Readable Board:** Category headers bumped up in size with more header height; answered tiles now read as "completed" rather than invisible; the clue hint box dropped italics for legibility.',
            '**Re-open Last Clue:** One-level undo for teacher misclicks — if you hit "Return to Board" before resolving a scoring dispute, you can now restore the most recently closed clue from the HUD.',
            '**Themed End Session Modal:** The native browser `confirm()` dialog for ending a session has been replaced with a themed modal that matches the rest of the app. If teams have scores, you can also route through the full winner announcement flow to end the game on a celebratory note.',
            '**Daily Double Fanfare:** Daily Double reveals now play the chime sound and show a pulsing ring animation — the moment finally gets the drama it deserves.',
            '**Keyboard Shortcuts:** Inside the clue modal, `Esc` closes the clue and `Space` advances (reveal hint → reveal answer → return to board). Great for teachers running the game from a projector.',
            '**Progress Chip:** A "18 / 25 clues" counter in the HUD lets teachers pace the game without counting tiles.',
            '**Refresh Errors Surface:** Clue refresh failures used to fail silently; they now show an alert so you know to retry.',
          ]
        }
      ]
    },
    {
      date: 'April 4, 2026',
      entries: [
        {
          version: 'v.04Apr.01',
          title: 'Security Fix: Interactives Navigation',
          changes: [
            '**Auth Bypass Closed:** Fixed a navigation vulnerability where users accessing the Interactives hub without a class code could click "Back to Home" and land on the full authenticated site. The back button now correctly returns unauthenticated visitors to the Classroom Access page. Thanks to **Mr. Brendan Madden** for the report!',
          ]
        }
      ]
    },
    {
      date: 'April 3, 2026',
      entries: [
        {
          version: 'v.03Apr.01',
          title: 'AP Review Bots: CED-Accurate Prompt Alignment',
          changes: [
            '**CED-Accurate Course Scope:** All 6 AP Review Bots (Biology, Chemistry, Environmental Science, Physics 1, Physics 2, Physics C) have been rebuilt with structured Course and Exam Description data — including exact unit weightings, science practice distributions, exam format details, and explicit out-of-scope exclusions. Inspired by **Mr. Dylan Abbott**, who noted that the bots were generating content misaligned with the actual AP exam structure!',
            '**Stimulus-Based Practice Questions:** In Practice mode, the bots now follow the actual AP exam format: questions must be stimulus-based (data table, graph, experimental scenario, or passage presented first), use correct AP task verbs (Explain, Justify, Calculate, Predict and justify), and never ask pure recall/definition questions.',
            '**Science Practice Weighting:** Each bot now knows the dominant science practices for its exam. AP Chemistry emphasizes Mathematical Routines (~40% of MCQ); AP Environmental Science uniquely includes SP7 Environmental Solutions; AP Physics 1 and 2 are explicitly algebra-based; AP Physics C requires calculus throughout.',
            '**App-Wide Alignment:** The same CED context now flows into every mode — not just the review bots. Quizzes, FRQ practice, CER, flashcards, and worksheets generated for AP courses all receive the enriched exam-aware context.',
            '**CED Reference Library:** Official AP Course and Exam Description PDFs for all 7 exams are now included in the project for developer reference.',
          ]
        }
      ]
    },
    {
      date: 'April 1, 2026',
      entries: [
        {
          version: 'v.01Apr.01',
          title: 'Question Quality Validation System',
          changes: [
            '**Post-Generation Question Validator:** Added an automatic quality check that runs on every quiz before you see it. The validator catches logically broken questions — most critically, "NOT/EXCEPT" stems where all options accidentally satisfied the same condition. Thanks to **Robert C.** for reporting this issue!',
            '**Prompt Hardening:** Updated the AI generation instructions to explicitly build negative-stem questions in the correct order: pick the one thing that does NOT fit first, then generate three distractors that DO fit. This reduces broken questions at the source.',
            '**Automatic Repair:** When a question fails validation, the system attempts to regenerate it (up to two times) with the specific failure reason injected into the prompt. Unrecoverable questions are silently dropped rather than served to students.',
            '**Loading State:** The generation loader now shows a two-phase status message — "Generating questions..." followed by "Verifying questions..." — so you know the quality check is running.',
          ]
        }
      ]
    },
    {
      date: 'March 26, 2026',
      entries: [
        {
          version: 'v.26Mar.02',
          title: 'Ecosystem Simulation Overhaul & Interactives Polish',
          changes: [
            '**Ecosystem Simulation Rebuilt:** Completely rewrote the ecosystem simulation engine using proven NetLogo Wolf Sheep Predation mechanics. The model now produces stable, visible predator-prey oscillations instead of crashing early.',
            '**General Ecology Terms:** Renamed from species-specific labels (grass/rabbits/wolves) to general ecological terms (plants/herbivores/carnivores) for broader teaching applicability.',
            '**NetLogo-Style Mechanics:** Reproduction is now probabilistic with energy splitting (parents share energy with offspring), predation is 100% on co-location, movement is random, and plant regrowth uses deterministic countdown timers.',
            '**Simulation Speed Control:** Added tick speed buttons (Slow/Normal/Fast/Very Fast) to control simulation pace.',
            '**Population Graph:** Dual Y-axis graph shows plant cells (left) and animal populations (right, auto-scaled) building in real-time.',
            '**Interactives Hub Polish:** Consistent card header heights, shortened titles, removed difficulty labels, added Acknowledgments section crediting NetLogo and Scarecrow Science.',
            '**Periodic Table:** No longer marked as beta — it\'s stable!',
          ]
        },
        {
          version: 'v.26Mar.01',
          title: 'New Public Landing Page & Rebranding',
          changes: [
            '**New Public Homepage:** Introducing a split-screen landing page that showcases both AI-powered practice tools (require class code) and free interactive simulations (no code needed) side-by-side. First-time visitors can now explore interactives immediately or enter their class code for full AI access.',
            '**Rebranded to "Science Practice":** The app is now simply "Science Practice" (shortened from "Science Practice Partner") for a cleaner, more memorable name.',
            '**Free Public Access to Simulations:** The Interactive Periodic Table, Covalent Bonding Builder, Ionic Bonding Builder, and Ecosystem Simulation are now accessible without a class code! Explore chemistry and biology concepts hands-on, no login required.',
            '**Improved Class Code Entry:** The authentication modal now appears as a centered overlay (instead of full-screen), making it easier to dismiss and return to exploring public content.',
            '**Better Navigation:** The Simulations Hub now has context-aware navigation — authenticated users see "Back to Dashboard" while public visitors see "Back to Home".',
          ]
        }
      ]
    },
    {
      date: 'March 24, 2026',
      entries: [
        {
          version: 'v.24Mar.01',
          title: 'Interactive Periodic Table: Major Feature Upgrade',
          changes: [
            '**Filter System Overhaul:** Category filters now work universally in Standard, Temperature, and Property overlay views, so selecting Halogens, Transition Metals, etc. will properly dim unselected elements regardless of view context.',
            '**F-block Toggle:** Clicking the 57–71 (Lanthanides) or 89–103 (Actinides) placeholder boxes in the main table toggles those rows visible/hidden — allowing a cleaner, more compact main-table layout when you don\'t need the f-block.',
            '**New Property Overlays:** Added **Melting Point** and **Boiling Point** as selectable data overlays in Property View, each with a dedicated, distinct color gradient. Clicking the active overlay a second time now deselects it and returns to the clean standard view.',
            '**Graph Mode Improvements:** Group and Period removed from scatter plot axes (they don\'t scale linearly). Dedicated Group and Period number filter dropdowns added directly inside the Graph Controls panel. Tooltip is now smaller, compact, and appears inline without a fly-in animation.',
            '**Element Detail Modal:** Electron configuration now has a toggle between Noble Gas notation and Full expansion instead of stacking both. Lewis Dot and Bohr diagrams are both shown on a dark background for better contrast.',
            '**Aesthetic:** Element boxes now use sharp corners (`rounded-sm`) for a more scientific, professional feel.',
            '**Printable Table:** Improved A4 print layout: configurable detail fields (Atomic Mass, Electron Config, Oxidation States, etc.), Group/Period labels, F-block placeholders, and a category color legend. Complex interpretation key removed for cleaner output.',
          ]
        }
      ]
    },
    {
      date: 'March 23, 2026',

      entries: [
        {
          version: 'v.23Mar.01',
          title: 'Simulations v0.3 Update & Code Cleanup',
          changes: [
            '**Covalent Bonding v0.3:** Major upgrade from beta v0.1! Now includes full drag-and-drop molecule building with @dnd-kit integration, visual bond lines connecting atoms (single/double/triple with proper spacing), dot-cross Lewis diagram visualization mode with color-coded bonding and lone pair electrons, and preset molecules library (12+ molecules organized by difficulty).',
            '**Bond Breaking UI:** Click any bond line to select it, then use the "Break Bond" button to remove bonds—making molecule editing much easier!',
            '**Periodic Table Simulation (NEW):** Interactive periodic table with temperature slider (0-6000K) showing real-time state changes (solid/liquid/gas), property visualization modes (atomic radius, electronegativity, ionization energy, density), element comparison with percentage differences, search and filtering, and detailed element modals.',
            '**Ionic Bonding Simulation (NEW):** Build ionic compounds with electron transfer animations, multiple visualization modes (Lewis transfer, Bohr models, crystal lattice, bracket notation), IUPAC naming, and charge balance validation. Supports 9 metals, 6 nonmetals, and 6 polyatomic ions.',
            '**Simulations Hub:** Centralized discovery page with status badges (BETA/new/stable), difficulty labels, topics previews, and direct simulation request link.',
            '**Code Infrastructure:** Created shared simulation components (`MessageToast`, `VisualizationModeTabs`, `SimulationHeader`), centralized constants file to eliminate magic numbers, and Unicode formatting utilities for chemical notation across all simulations.'
          ]
        }
      ]
    },
    {
      date: 'March 22, 2026',
      entries: [
        {
          version: 'v.22Mar.01 (BETA)',
          title: 'New: Simulations Module (Initial Beta)',
          changes: [
            '**Covalent Bonding Simulator (BETA v0.1):** Introducing our first interactive science simulation! This initial beta release features an electron apportionment mechanic where students manually assign valence electrons to bonds, building molecules atom-by-atom.',
            '**Scientific Calculator:** Built a floating, draggable Desmos Scientific Calculator into Calculation Partner, allowing students to crunch numbers alongside the AI step-by-step guidance.',
            '**Core Features:** Real-time validation with octet rule checking, automatic formula generation (Hill notation), molecule identification (recognizes common molecules like water, carbon dioxide, ammonia), geometry calculation (VSEPR theory), polarity determination, and molar mass calculation.',
            '**Educational Focus:** Students explicitly assign electrons to bonds (single, double, triple), visualize remaining lone pairs, receive instant feedback on octet satisfaction, and understand why different atoms form different numbers of bonds.',
            '**New Simulations Section:** Look for the atom icon in the new Simulations category on the landing page. This is just the beginning - more simulations (ionic bonding, periodic table, acid-base, circuits, motion) are planned!'
          ]
        }
      ]
    },
    {
      date: 'March 15, 2026',
      entries: [
        {
          version: 'v.15Mar.01',
          title: 'Multi-Topic Practice & Session History',
          changes: [
            '**Multi-Topic Practice Sessions:** You can now combine multiple topics into a single quiz, FRQ, CER, or flashcard session! Instead of practicing one topic at a time, select several topics (e.g., "Photosynthesis, Cellular Respiration, Calvin Cycle") for comprehensive unit reviews. Feature requested by **Anna Mae**!',
            '**Practice Whole Unit:** Quick-start button for each unit allows you to instantly generate questions covering all topics in that unit — perfect for test prep!',
            '**Custom Topic Mix:** Use comma-separated input to specify exactly which topics you want to combine in your practice session.',
            '**Session History:** All completed practice sessions are now automatically saved! Access your complete practice history from the new History button (📜) on the landing page. Feature requested by **Anna Mae**!',
            '**Full Session Review:** Revisit any past session to see all questions, your original answers, and the detailed feedback you received. Navigate question-by-question with color-coded indicators (green = correct, red = incorrect, amber = partial).',
            '**Session Management:** Filter sessions by mode (quiz, FRQ, CER, flashcards, worksheet), search by topic or course, sort by date or score, and delete individual sessions or clear all history.',
            '**Storage Intelligence:** Session history automatically manages storage with a 50-session limit and size pruning to stay within browser storage constraints.',
            '**Trophy Room Integration:** Badges are now linked to their original sessions — click any badge in the Trophy Room to review the full session that earned it!'
          ]
        }
      ]
    },
    {
      date: 'February 25, 2026',
      entries: [
        {
          version: 'v.25Feb.01',
          title: 'Transparency & Teacher Metacognition',
          changes: [
            '**Shareable Public URLs:** The "How It Works" and "Features Guide" pages can now be shared via direct links (`/?page=how_it_works`, `/?page=features`) — no password required.',
            '**How It Works: AI Under the Hood:** Added a new collapsible accordion explaining exactly what the AI is doing in each of the 10 modes, including the prompt schemas used.',
            '**AI Limitations Note:** Added an honest section in "How It Works" acknowledging AI hallucinations, grading imperfections, and generation failures.',
            '**Cross-Linking:** "How It Works" and "Features Guide" now link prominently to each other.',
            '**Features Guide Update:** Fully updated mode reference with all current modes (Study Sprint, MultiMode, Lab Co-Pilot, Research Project) and a complete Teacher Tools section.',
            '**New: Reflection Prompter:** A new teacher tool that generates scaffolded metacognition prompt sheets. Supports 6 structures: Learning Journal, Exit Ticket, I Used to Think / Now I Think, 3-2-1, Plus/Delta, and Scientific Metacognition. Output is print-ready and designed for student journaling.',
          ]
        }
      ]
    },
    {
      date: 'February 22, 2026',
      entries: [
        {
          version: 'v.22Feb.01',
          title: 'Who Am I? & Core Improvements',
          changes: [
            '**Who Am I? Review Game:** Added a new 20-questions style review game in Teacher Tools! Teachers can configure a topic and project progressive clues to the class.',
            '**Study Sprint Refinements:** Ensured consistent save and quit behavior across all modes during Study Sprints, guaranteeing progress is logged correctly.',
            '**Accessibility & UI Polish:** Improved text contrast, clarified exit buttons on modals, and fixed "Take Photo" button styling.',
            '**Math Visualization & Input:** Enhanced equation rendering, improved math parser reliability, and added visual manipulatives (Cell Coloring, Ten Frames) for DysgraphiMath.',
            '**Security & Architecture:** Secured API Keys behind a Vercel backend proxy, preventing client-side exposure, and improved overall build stability.'
          ]
        }
      ]
    },
    {
      date: 'February 1, 2026',
      entries: [
        {
          version: 'v.01Feb.01',
          title: 'Support & Connectivity',
          changes: [
            '**Native Contact Form:** A built-in, secure contact form (powered by Formspree) that sends feedback directly to the developer without leaving the app.',
            '**Link Standardization:** Updated all support and social links to correctly point to the official `davidknuffke.com` domain.',
            '**Support Page:** Refreshed the Support page with clearer options and direct links for those who wish to contribute.'
          ]
        }
      ]
    },
    {
      date: 'January 30, 2026',
      entries: [
        {
          version: 'v.30Jan.01',
          title: 'Collaboration & Sharing Upgrade',
          changes: [
            '**Share Everything:** Use the **Share Link** button in Topic Dashboard, Explanation Partner, and Calculation Partner to instantly share your exact session configuration with students or colleagues.',
            '**Dashboard Reports:** You can now **Process & Share** your Topic Dashboard results! Download a high-res image of your session report or email a summary directly to your teacher.',
            '**Square Match Refinement:** Added a **"Regen"** button to individual pairs in the Square Match editor, letting you re-roll specific terms without scrapping the whole list.'
          ]
        }
      ]
    },
    {
      date: 'January 29, 2026',
      entries: [
        {
          version: 'v.29Jan.02',
          title: 'Jeopardy & Puzzle Refinements',
          changes: [
            '**Final Jeopardy UI:** Added **Score Feedback Badges** (+/-) for immediate visual confirmation of score changes and improved the text contrast for wagers and totals.',
            '**Audio Cues:** Added an audible **Countdown Beep** sequence for the final 5 seconds of the timer to ramp up the tension!',
            '**Square Match Answer Key:** The Teacher Answer Key now displays letters **rotated relative to the piece**, showing exactly how the physical pieces should be oriented in the final solution.',
            '**Puzzle Difficulty:** Tuned the "Medium" difficulty generation to ensure edge pieces are populated with unmatched distractors.'
          ]
        },
        {
          version: 'v.29Jan.01',
          title: 'Square Match Puzzle Mode',
          changes: [
            '**New Mode: Square Match Puzzle:** Create printable Tarsia-style scrambled matching puzzles for hands-on classroom review. Students cut out squares and arrange them by matching terms along edges.',
            '**Grid Sizes:** Choose from 3x3 (12 pairs), 4x4 (24 pairs), or 5x5 (40 pairs) grids to suit your lesson needs.',
            '**Difficulty Levels:** Easy (blank outer edges), Medium (unmatched topic terms on edges), or Hard (confusing distractors from puzzle terms).',
            '**AI Pair Generation:** One-click "AI Auto-Fill" generates topic-relevant term/match pairs from any Course and Topic.',
            '**Silly Mode 🎉:** Toggle on for punny, emoji-laden, humorous matches that make learning fun!',
            '**Print-Ready Output:** A4-optimized PDF with scrambled puzzle page and teacher answer key with position markers.'
          ]
        }
      ]
    },
    {
      date: 'January 28, 2026',
      entries: [
        {
          version: 'v.28Jan.01',
          title: 'Jeopardy & Graphing Overhaul',
          changes: [
            '**AI Science Jeopardy:** A modern implementation of the classic review game. Have AI draft your prompts for you, and then edit, etc. as you wish. Features include **"Discovery Double"** wagers, a ranked **Winner Celebration** screen with confetti, improved sound effects (Buzzer, Win), and manual score adjustment controls.',
            '**Teacher Preview & Edit:** Inspect your game board with confidence. The new Teacher Preview renders all graphs and tables directly in the card. You can now **Edit Questions** manually or use the new **"Refine Prompt"** button to have the AI regenerate a clue with specific instructions (e.g., "Make this a bar graph").',
            '**AI Model Stabilization:** Updated core services to use the stable `gemini-2.0-flash` release, resolving recent API deprecation errors.'
          ]
        }
      ]
    },
    {
      date: 'January 25, 2026',
      entries: [
        {
          version: 'v.25Jan.01',
          title: 'Research & Multi-Mode Expansion',
          changes: [
            '**Independent Research Mode:** A powerful new project workspace for long-term science investigations. Students can now define research questions, hypotheses, and methodology with persistent local storage.',
            '**Topic Dashboard (Multi-Mode):** A unified "Mission Control" for any topic. Upload your notes once and instantly launch Quizzes, Flashcards, or FRQ sessions derived from the same source material.',
            '**Context-Aware Analysis:** The new Topic Dashboard generates comprehensive topic summaries and maintains context across different learning activities.',
            '**AI Personas (Explanation Mode):** Choose your preferred teaching style: **Socratic** (Questions only), **Tutor** (Direct explanations), **Skeptic** (Challenges you), or **Growth Coach** (Builds confidence).',
            '**Editor Power-Ups:** All written response fields now support **Voice Dictation** (Speech-to-Text) and include a **Math & Science Symbol Picker** (Greek, Arrows, Subscripts).',
            '**Advanced Session Control:** Added granular settings for **Timer Duration**, **Flashcard Styles** (Topic vs Concept Map), and new question types like **Analogies** and **Fill-in-the-Blank**.'
          ]
        },
      ]
    },
    {
      date: 'January 22, 2026',
      entries: [
        {
          version: 'v.22Jan.03',
          title: 'System Health & Polish',
          changes: [
            '**Codebase Optimization:** Performed a comprehensive pre-release scrub, optimizing build settings and removing debug artifacts.',
            '**Configuration Engine:** Finalized the new **Document Configuration View**, ensuring a consistent and polished setup experience for all creative modes.'
          ]
        },
        {
          version: 'v.22Jan.02',
          title: 'Feedback & Visuals Polish',
          changes: [
            '**MCQ Feedback Engine:** Significantly improved the feedback report for Practice Sessions. It now displays **all possible answers** for each question, clearly indicating which was correct and explaining why, eliminating previous redundancy.',
            '**CER Graphing Upgrade:** The Data Analysis chart engine now properly handles **HTML formatting** (like chemical formulas) in titles and labels, and correctly plots comparison data (Control vs. Experimental).',
            '**Home Screen Layout:** Reorganized the main menu to be **alphabetical** for easier scanning and refreshed the card designs with centered headers and icons.',
            '**Icon Consistency:** Standardized the "Document Creator" iconography across the entire application to ensure a seamless visual experience.'
          ]
        },
        {
          version: 'v.22Jan.01',
          title: 'UI Refinement & Consistency',
          changes: [
            '**App-Wide Document Creator:** Expanded the Document Creator to include **6 distinct modes**: Worksheet Generator, Flashcard Grid, Active Note Sheet, Data Analysis (CER), Written Response (FRQ), and even a daily **Exit Ticket** generator!',
            '**Smart Scanner Upgrade:** Merged "Analyze Diagram" into the Smart Scanner mode! You can now upload images and notes to generate fully customizable practice quizzes (choose your question mix!) or active note sheets.',
            '**Universal Topic Selector:** Launched a unified "Let\'s Get Started" workflow that combines Course and Topic selection into a single, streamlined card.',
            '**Smart Navigation:** Added keyboard-driven auto-complete for varied courses and topics, with intelligent auto-focus to speed up session setup.',
            '**Practice Session Styling:** Renamed "Guided Practice" to **Practice Session** and updated the landing page button with a dedicated target emoji (🎯) and "Adaptive Multiple Choice" subtitle.',
            '**Settings Panel Polish:** Increased font sizes and improved spacing in the Session Settings panel for better readability.',
            '**Layout Fixes:** Resolved alignment issues in the "Let\'s Get Started" header, ensuring the title and icon are perfectly centered.',
            '**Security Patch:** Closed a critical login vulnerability. Special thanks to user **Keegan R.** for the responsible disclosure.'
          ]
        }
      ]
    },
    {
      date: 'January 21, 2026',
      entries: [
        {
          version: 'v.21Jan.01',
          title: 'CER Mode & Graphing Polish',
          changes: [
            '**CER Mode Stability:** Resolved the crash issue in Claim-Evidence-Reasoning practice mode (Thanks to **Kabir N.** for the report), implementing a persistent error system to catch and display any future issues.',
            '**Graphing Engine Overhaul:** Graphs now render cleanly with proper margins, non-overlapping axis labels, and HTML-formatted text (e.g., CO₂ subscripts).',
            '**Intelligent Chart Selection:** The AI now correctly chooses between Bar, Line, and Scatter charts based on the data context, and consistently plots multiple data series (e.g., Control vs. Experimental) when required.',
            '**Prompt Hardening:** Captions are now strictly descriptive to avoid spoilers, and strict schema validation ensures reliable content generation.'
          ]
        }
      ]
    },
    {
      date: 'January 20, 2026',
      entries: [
        {
          version: 'v.20Jan.02',
          title: 'System Stability & Standardization',
          changes: [
            '**File Upload Standardization:** Unified all file upload interfaces (LabView, Landing Page, Quiz My Notes) to use a consistent, reliable drag-and-drop component.',
            '**Lab Co-Pilot Repairs:** Fixed critical syntax errors preventing the Lab View from loading correctly.',
            '**Display Fixes:** Resolved Markdown rendering issues in Interview Script Mode to ensuring tables and equations display perfectly.'
          ]
        },
        {
          version: 'v.20Jan.01',
          title: 'Visual Learning & Logic Maps',
          changes: [
            '**Mermaid.js Integrations:** The AI can now generate **Flowcharts**, **Sequence Diagrams**, and **Decision Trees** to explain complex scientific processes visually.',
            '**Lab Co-Pilot Visuals:** Added a "Visuals" toggle to the Error Analysis track, creating troubleshooting flowcharts for failed experiments.',
            '**Logic Map Feedback:** Quiz feedback now includes visual logic maps to help you trace the mechanism of the correct answer.'
          ]
        }
      ]
    },
    {
      date: 'January 19, 2026',
      entries: [
        {
          version: 'v.19Jan.01',
          title: 'Teacher Utility Pathway',
          changes: [
            '**Rubric Translator:** Turn complex official rubrics into simple, student-friendly checklists with one click using our new AI-powered translator.',
            '**Worksheet Class Sets:** Generate "Version A" and "Version B" worksheets instantly. The system scrambles questions and options to help prevent cheating, and generates separate Answer Keys for each version.',
            '**Teacher Clipboard:** Enabled via the new "Teacher Mode" in settings. Allows educators to copy questions *with their answer keys* directly to the clipboard for use in slides or other assessments.'
          ]
        }
      ]
    },
    {
      date: 'January 17, 2026',
      entries: [
        {
          version: 'v.17Jan.01',
          title: 'Lab Co-Pilot & Security',
          changes: [
            '**Lab Partner Mode:** A full-featured research assistant with 5 specialized tracks: Experimental Design, Data Analysis, Report Feedback, Error Analysis, and Research Mentor.',
            '**Accessibility Suite:** Added **Text-to-Speech** (transliteration) and a **"Magic Wand"** text simplifier to help diverse learners access complex material.',
            '**Gamification 2.0:** Overhauled the Trophy Room with a new **XP-based Rank System**, detailed Badge Legends, and holographic styling for ultra-rare achievements.',
            '**Advanced Security:** Implemented comprehensive XSS (Cross-Site Scripting) prevention and API Authentication via Classroom Codes to keep your data safe.',
            '**Focus on English:** We have streamlined the experience by centering the tool on English-language support to ensure maximum quality and reliability.'
          ]
        }
      ]
    },
    {
      date: 'January 15, 2026',
      entries: [
        {
          version: 'v.15Jan.26',
          title: 'Major Feature Launch: Smart Partners',
          changes: [
            '**New Mode: Calculation Partner:** A Socratic math tutor that helps you solve problems step-by-step. Enter variables or upload an equation image, and the AI guides you to the solution without just giving away the answer.',
            '**New Mode: Smart Scanner:** Transform your study materials into active practice. Upload notes, PDFs, or textbook photos to instantly generate **Practice Quizzes** or structured **Active Note Sheets**.',
            '**Smart Scanner Level Selection:** You can now tailor the Smart Scanner output for any education level, from Elementary School to University.',
            '**Gemini 2.0 Integration:** We have officially upgraded our underlying AI models to **Gemini 2.0 Flash** for faster, more reasoned responses across all modes.',
            '**System Polish:** Improved landing page descriptions, unified feedback portal, and updated feature guides.'
          ]
        }
      ]
    },
    {
      date: 'January 13, 2026',
      entries: [
        {
          version: 'v.13Jan.02',
          title: 'Security & Access Control',
          changes: [
            '**Classroom Authentication:** Added a secure Gatekeeper to protect the application. Users must now enter a valid classroom code to access the tools.',
            '**Enhanced Security:** Implemented comprehensive HTML sanitization (XSS protection) across all content displays to ensure a safe learning environment.'
          ]
        },
        {
          version: 'v.13Jan.01',
          title: 'Feature Restoration & Reliability',
          changes: [
            '**Modes Restored:** Fixed the issue that was causing the **AP FRQ Simulator** and **Data Analysis (CER)** modes to crash. They are now fully available again.',
            '**Under-the-hood Improvements:** Valid foundational updates to make the site faster and easier to update in the future.'
          ]
        }
      ]
    },
    {
      date: 'Prior Updates',
      entries: [
        {
          version: 'v1.9.0',
          title: 'Performance & Stability Adjustments',
          changes: [
            '**Temporary Feature Adjustment:** The **AP FRQ Simulator** and **Data Analysis (CER)** modes have been temporarily disabled. These complex features were exceeding limits of our hosting environment. They will return once a more robust solution is implemented.',
            '**Core Reliability:** We are focusing resources on ensuring the Guided Practice, Explanation Partner, and Flashcard modes remain fast and reliable for daily study.'
          ]
        },
        {
          version: 'v1.8.0',
          title: 'Accessibility & Teacher Tools',
          changes: [
            '**Readable Mode (Accessibility):** Added a new toggle in the main menu to switch the application font to **Verdana** with increased line height and spacing. This is designed to improve readability for students with dyslexia or visual processing differences.',
            '**Clipboard Tool:** Teachers can now instantly copy AI-generated questions (including options and the correct answer key) to their clipboard with a single click, making it easier to paste into slides or LMS quizzes.'
          ]
        },
        {
          version: 'v1.7.0',
          title: 'Visual Learning & Accessibility',
          changes: [
            '**"Analyze This" Mode:** Added a new button to the landing page allowing you to upload scientific diagrams, graphs, or charts. The AI analyzes the image and generates a relevant practice question.',
            '**Shareable Deep Links:** Teachers can now share specific URLs (e.g., `...?course=AP%20Biology&topic=Enzymes`) to send students directly to a specific topic practice session.',
            '**Text-to-Speech (TTS):** Added a speaker button to question cards. Users can now have questions read aloud to them, improving accessibility for diverse learners.'
          ]
        },
        {
          version: 'v1.6.0',
          title: 'Worksheet Mixer & Visual Upgrades',
          changes: [
            '**Worksheet Mixer:** Teachers can now select **multiple focus areas** simultaneously (e.g., "Math & Problem Solving" + "Visuals & Diagrams") to generate perfectly tailored practice sheets.',
            '**Enhanced Scientific Visuals:** AI-generated graphs and tables in FRQ, CER, and Worksheet modes now include detailed **captions and legends** for better clarity.',
            '**Standardized Terminology:** Visual exhibits are now properly labeled as **"Figure X"** or **"Table X"** instead of generic "Exhibits".'
          ]
        },
        {
          version: 'v1.5.0',
          title: 'Curriculum & Terminology Update',
          changes: [
            'Overhauled course data for AP Biology, Chemistry, Physics (1, 2, C), and Environmental Science to strictly align with the latest AP Aligned Course Descriptions.',
            'Separated General and Honors High School courses (NGSS aligned) from AP courses to provide appropriate difficulty levels.',
            'Updated terminology: "Units" are now referred to as "Main Ideas" for broader curriculum flexibility.'
          ]
        },
        {
          version: 'v1.4.0',
          title: 'Advanced Practice Modes',
          changes: [
            'Added **C.E.R. (Claim, Evidence, Reasoning) Mode**: Analyze data tables and graphs to form scientific arguments.',
            'Added **AP FRQ Simulator**: Practice free-response questions with multi-part prompts and stimulus material.',
            'Added **Worksheet Generator**: Create printable, randomized worksheets for classroom use.'
          ]
        },
        {
          version: 'v1.3.0',
          title: 'Accessibility & Core Features',
          changes: [
            'Launched **Speech-to-Text**: Dictate answers directly into the browser.',
            'Added **Flashcard Mode**: Generate high-yield study decks for any topic.',
            'Implemented **AI Tutor Personas**: The AI now adapts its tone and complexity based on the selected grade level (Elementary vs. AP).'
          ]
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 text-left">
      
      {/* ── BACK BUTTON ── */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
      </div>

      {/* ── HEADER ── */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Site Updates</h1>
          <p className="text-slate-550 dark:text-slate-450 text-sm mt-1 leading-relaxed max-w-xl">
            Tracking the evolution and user-requested updates of Science Practice Partner.
          </p>
        </div>
        <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 shrink-0">
          <Megaphone className="w-6 h-6 animate-pulse" />
        </div>
      </header>

      {/* ── TIMELINE ── */}
      <div className="space-y-12 relative">
        {/* Vertical Line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800 hidden md:block"></div>

        {changelogData.map((group, gIdx) => (
          <div key={gIdx} className="relative md:pl-12 group">
            {/* Date Dot */}
            <div className="absolute left-[13px] top-6 w-3 h-3 rounded-full bg-indigo-500 border-4 border-slate-50 dark:border-[#12141C] hidden md:block shadow-lg shadow-indigo-500/50 z-10"></div>

            <div className="bento-card border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#15171C] p-6 md:p-8 transition-all hover:border-indigo-500/20">
              {/* Group Date Header */}
              <div className="mb-6 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <h2 className="text-xl font-black text-[#1A1C21] dark:text-white tracking-tight font-rounded">{group.date}</h2>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{group.entries.length} Update{group.entries.length !== 1 && 's'}</div>
              </div>

              {/* Entries within this date */}
              <div className="space-y-8">
                {group.entries.map((entry, eIdx) => (
                  <div key={eIdx} className={`${eIdx !== 0 ? 'pt-6 border-t border-slate-100 dark:border-slate-800/60' : ''}`}>
                    <div className="flex flex-col mb-3 gap-2">
                      <div className="inline-flex">
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">
                          {entry.version}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-[#1A1C21] dark:text-white font-rounded leading-snug">
                        {entry.title}
                      </h3>
                    </div>

                    <ul className="space-y-2.5 pl-1">
                      {entry.changes.map((change, cIdx) => (
                        <li key={cIdx} className="flex gap-2.5 text-slate-550 dark:text-slate-400 leading-relaxed text-xs">
                          <span className="text-indigo-550 dark:text-indigo-400 mt-1 text-[10px] shrink-0">●</span>
                          <span dangerouslySetInnerHTML={{ __html: cleanHtml(change.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#1A1C21] dark:text-white font-rounded font-black">$1</strong>')) }}></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── FEEDBACK ACTION CARD ── */}
      <div className="bento-card border border-indigo-500/20 dark:border-indigo-500/10 bg-white dark:bg-[#15171C] p-6 md:p-8 text-center space-y-4 mt-12">
        <h3 className="text-lg font-black text-[#1A1C21] dark:text-white font-rounded">Have a feature request?</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Most of these updates come directly from teacher and student feedback. Reach out to share your ideas!
        </p>
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="btn-squishy h-10 px-6 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-black dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 shadow-md transition-all"
        >
          Submit Request
        </button>
      </div>

      <ContactModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </div>
  );
};

export default ChangelogView;
