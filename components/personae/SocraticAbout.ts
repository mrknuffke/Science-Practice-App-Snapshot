import { SimulationAboutContent } from '../simulations/shared/AboutPanel';

export const SOCRATIC_ABOUT: SimulationAboutContent = {
  title: 'AI Socratic Guide (Inquiry & Conceptual Discovery)',
  summary:
    'A probing scientific dialogue partner that refuses to give away answers, guiding you through targeted counter-questions, thought experiments, and causal mechanism inquiries.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        'Socratic Dialogue Partner: An inquiry-driven guide that answers your questions with deeper questions rather than spoon-fed conclusions.',
        'Concept Depth Evaluation: A dynamic indicator measuring your conversational reasoning depth based on causal vocabulary and turn engagement.',
        'Reflective Scaffolding Levers: Quick prompting chips ("Probe My Assumptions", "Pose a Thought Experiment", "Test with Extreme Values") to push your thinking.',
        'Scientific First Principles: Prompts designed to deconstruct phenomena down to underlying thermodynamic, mechanical, or evolutionary forces.',
        'Downloadable Dialogue Transcript: Full Markdown export of your intellectual journey and breakthrough moments.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        'Curated Conceptual Puzzles: Explore classic paradoxes and subtle distinctions across Biology, Chemistry, Physics, and Environmental Science.',
        'Custom Curiosity Mode: Pose your own scientific dilemma or paradox to engage in dialectic investigation.',
        'Concept Depth Meter: Watch your depth meter advance from Surface Recall (10-30%) toward Causal Mastery (80-100%) as you articulate underlying mechanisms.',
        'Speech Dictation & Text-to-Speech: Articulate hypotheses aloud and listen to the guide’s spoken inquiries.',
        'Simplify Lever: Request a more grounded real-world analogy if a theoretical distinction feels elusive.',
        'Export Guide: Save your discovery sequence as a formatted study markdown artifact.',
      ],
    },
    {
      icon: 'flask',
      title: 'Socratic Inquiry Workflows',
      bullets: true,
      items: [
        'Boundary Testing: Test what happens at extreme physical limits (e.g. absolute zero temperature, infinite friction, or zero population density).',
        'Contradiction Discovery: Uncover implicit assumptions that contradict empirical observation or conservation principles.',
        'Counter-Factual Thought Experiments: Explore what the natural world would look like if a fundamental constant or biological mechanism were reversed.',
        'Causal Chain Elucidation: Trace every step between an initial trigger and the terminal biological or physical effect without skipping steps.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Pedagogical Principles',
      bullets: true,
      items: [
        'Active Cognitive Construction: True understanding cannot be gifted; it must be constructed through productive cognitive struggle.',
        'Precision in Articulation: Vague terminology hides flawed models; articulating hypotheses in complete sentences reveals gaps before exams do.',
        'Embrace Uncertainty: Not knowing the answer immediately is the fertile soil where authentic scientific curiosity takes root.',
        'Durable Mental Schemas: Concepts discovered through self-guided inquiry are retained far longer than memorized bullet points.',
      ],
    },
  ],
};
