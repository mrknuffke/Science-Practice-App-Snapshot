import { SimulationAboutContent } from '../simulations/shared/AboutPanel';

export const GROWTH_COACH_ABOUT: SimulationAboutContent = {
  title: 'AI Growth Coach (Metacognitive Error Analysis)',
  summary:
    'An empathetic, growth-mindset mentor transforming exam mistakes and academic frustrations into structured learning strategies through an evidence-based 4-part error taxonomy.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        'Metacognitive Error Workbench: A safe, judgment-free space to deconstruct wrong answers, missed test questions, and frustrating study blocks.',
        '4-Part Error Taxonomy: Immediate classification into Conceptual Misconception, Mathematical/Unit Slip, Prompt Constraint Misread, or Retrieval Gap.',
        'Actionable Study Roadmaps: Concrete, evidence-based revision strategies tailored specifically to the diagnosed error type.',
        'Growth Mindset Reframing: Transform negative performance anxiety into productive curiosity and high-leverage procedural improvements.',
        'Downloadable Error Log: Export a complete study reflection log to review before your next unit exam.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        'Curated Exam Mistake Presets: Load classic student errors from AP Biology, Chemistry, Physics, and Physiology to see taxonomy classification in action.',
        'Custom Mistake Entry: Paste any problem you got wrong, what you thought, and what the correct answer was.',
        'Dynamic Error Classification: Live heuristic and AI categorization identifying whether your mistake was conceptual, computational, perceptual, or retrieval-based.',
        'Voice Dictation & Text-to-Speech: Vent or explain your thought process aloud using speech recognition; listen to audio coaching affirmations.',
        'Action Step Generator: Instant actionable study drills (contrasting flashcards, dimensional analysis brackets, qualifier circling).',
        'Markdown Log Export: Download your session analysis as a personal exam debrief guide.',
      ],
    },
    {
      icon: 'flask',
      title: 'The 4-Part Error Taxonomy',
      bullets: true,
      items: [
        'Conceptual Misconception: An incomplete or flawed mental model of how natural mechanisms interact; requires causal mapping from first principles.',
        'Mathematical / Unit Slip: Sound conceptual understanding undermined by unit conversion slips, algebraic manipulation, or arithmetic errors; requires dimensional analysis brackets.',
        'Constraint Overlook / Misread: Skimming past negative qualifiers ("NOT", "EXCEPT"), inverted variables, or scale changes; requires active question annotation.',
        'Factual Retrieval Gap: Blanking under pressure or confusing homologous terms (e.g. mitosis vs meiosis, aldosterone vs ADH); requires active spaced retrieval practice.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Growth Mindset Philosophy',
      bullets: true,
      items: [
        'Errors are Data, Not Identity: A missed question tells you what neural pathways need reinforcement; it says nothing about your scientific potential.',
        'High-Leverage Leverage Points: Fixing a repeated unit slip or misread habit can instantly boost an exam score by 10-15% without reteaching whole units.',
        'The Power of "Not Yet": Replace "I can\'t do thermodynamics" with "I haven\'t mastered free energy equilibrium relationships yet."',
        'Metacognitive Self-Correction: The strongest scientists are not those who never make errors, but those who debug their own thinking with ruthless curiosity.',
      ],
    },
  ],
};
