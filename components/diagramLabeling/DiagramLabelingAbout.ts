import { SimulationAboutContent } from '../simulations/shared/AboutPanel';

export const DIAGRAM_LABELING_ABOUT: SimulationAboutContent = {
  title: 'Diagram Labeling',
  summary: 'An interactive anatomical and schematic labeling environment where students test and reinforce their spatial, structural, and mechanistic understanding on publication-grade scientific figures.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        'Publication-Grade Vector Diagram: A high-precision SVG scientific illustration with callout anchor points.',
        'Numbered Callout Badges: Interactive numbered markers placed at key anatomical, morphological, or physical coordinates.',
        'Study Mode vs. Quiz Mode: Toggle between exploratory inspection (revealing labels and detailed functional notes) and active recall testing.',
        'Word Bank / Direct Input: Choose whether to match terms from an interactive word bank chip tray or challenge yourself with direct keyboard entry.',
        'Real-Time Evaluation Panel: Visual scorecard tracking identification accuracy, completion progress, and per-item feedback.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        'Mode Switcher (Study / Quiz): In Study mode, click or hover any numbered badge to inspect its canonical label, functional role, and hints. In Quiz mode, badges await your input.',
        'Interaction Style (Word Bank / Typing): Switch between clicking words from the bank to assign them to active pins or typing answers directly.',
        'Select Pin / Callout: Click any callout marker on the diagram or its corresponding row in the list to select it for labeling.',
        'Check Answers: Evaluates all placed labels against canonical answers and accepted scientific synonyms with flexible normalization.',
        'Reveal All / Reset: Reveal the complete answer key when studying, or clear all inputs to retake the quiz.',
        'Export Study Guide: Generates a structured Markdown study sheet with the complete anatomical index and quiz performance summary.',
      ],
    },
    {
      icon: 'flask',
      title: 'Things to Try',
      bullets: true,
      items: [
        'Trace Electron Transport in Chloroplasts: Identify the thylakoid membrane, lumen, stroma, and ATP synthase to visualize proton motive force and photophosphorylation.',
        'Inspect Half-Cell Chemistry: Locate the zinc anode, copper cathode, salt bridge, and external voltmeter in the Galvanic cell to track spontaneous electron flow.',
        'Analyze Circuit Topologies: Distinguish the series ammeter (measuring current in-line) from the parallel voltmeter (measuring potential drop across the load).',
        'Decompose Projectile Vectors: Contrast horizontal velocity vx (constant in ideal kinematics) with vertical velocity vy (accelerated downwards by gravity) across the trajectory.',
        'Map Countercurrent Exchange: Label the glomerulus, proximal convoluted tubule, loop of Henle, and collecting duct to understand osmoregulatory concentration gradients.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Key Concepts',
      bullets: true,
      items: [
        'Dual-Coding Theory: Pairing visual spatial schematics with verbal labels significantly improves long-term semantic memory and conceptual retention.',
        'Active Retrieval Practice: Recalling terms from memory or identifying them from an unlabelled diagram produces stronger neural pathways than passive re-reading.',
        'Structure-Function Relationships: Scientific structures (e.g. cristae folds, countercurrent loops, salt bridges) exist to optimize specific thermodynamic and physiological processes.',
        'Synonym Flexibility: Scientific terminology often allows valid variations (e.g. "loop of Henle" vs. "nephron loop", "anode" vs. "oxidation electrode"); both reflect accurate comprehension.',
        'Desirably Difficult Retrieval: Progressing from Study mode to Word Bank quiz, and finally to direct keyboard typing provides a structured scaffold towards mastery.',
      ],
    },
  ],
};
