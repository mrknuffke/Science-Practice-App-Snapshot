import { SimulationAboutContent } from '../simulations/shared/AboutPanel';

export const TUTOR_ABOUT: SimulationAboutContent = {
  title: 'AI Science Tutor (Step-by-Step Problem Solving)',
  summary:
    'A patient, direct AI calculation partner providing structured step-by-step guidance, formula breakdowns, dimensional analysis safety checks, and an interactive mathematical scratchpad.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        'Direct Tutor Dialogue: A focused conversation space providing clear explanations, formula breakdowns, and immediate arithmetic validation.',
        'Interactive Math Scratchpad: An integrated workspace for organizing givens, formulas, intermediate calculation steps, and unit conversions.',
        'Step-by-Step Pacing Levers: Quick action prompts ("Next Step", "Explain Step", "Check My Calculation") that prevent information overload.',
        'Formula & Units Cheatsheet: Real-time reference of core conservation laws, kinematic equations, and dimensional analysis multipliers.',
        'Downloadable Study Transcript: One-click export of your complete calculation sequence and scratchpad notes into a formatted Markdown document.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        'Curated Presets: Load classic multi-step quantitative problems across Chemistry, Physics, Biology, and Environmental Science.',
        'Custom Problem Mode: Paste any textbook homework problem or practice question to work through step by step.',
        'Interactive Scratchpad: Keep running notes, intermediate molar masses, or unit conversions directly alongside the chat.',
        'Speech Dictation & Text-to-Speech: Dictate your steps hands-free using microphone input or listen to audio explanations.',
        'Simplify Explanation: Instantly request a clearer, middle-school level explanation if a derivation feels overly abstract.',
        'Export Guide: Download a clean Markdown transcript of your entire problem-solving session.',
      ],
    },
    {
      icon: 'flask',
      title: 'Problem-Solving Workflows',
      bullets: true,
      items: [
        'Stoichiometric Dimensional Analysis: Follow mole conversions from grams of reactant to limiting reactant identification and theoretical product yield.',
        'Multi-Stage Kinematics: Deconstruct projectile or ramp motion into orthogonal components, identifying initial velocity, acceleration, and displacement.',
        'Population Genetics Frequency Balancing: Derive allele frequencies p and q from homozygous recessive phenotypes before calculating heterozygote counts.',
        'Trophic Ecological Efficiency: Chain energy conservation rules across multiple consumer levels with proper scientific notation.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Key Cognitive Strategies',
      bullets: true,
      items: [
        'Explicit Givens & Target: Always state known values with full units before selecting an algebraic relationship.',
        'Unit-Tracking Verification: Carry units through every multiplication and division; if the final units do not match the target quantity, re-examine the conversion steps.',
        'Reasonable Magnitude Check: After obtaining a numerical value, ask whether the physical scale makes physical sense (e.g. speeds cannot exceed c, efficiencies cannot exceed 100%).',
        'Scaffolded Autonomy: Use the AI Tutor to verify intermediate checkpoints while maintaining ownership of the arithmetic calculations.',
      ],
    },
  ],
};
