import { SimulationAboutContent } from '../simulations/shared/AboutPanel';

export const VOCAB_RELAY_ABOUT: SimulationAboutContent = {
  title: 'Vocab Relay (High-Energy Classroom Review Game)',
  summary:
    'A fast-paced, turn-based team vocabulary sprint eliminating "spectator students" through short runner countdowns, physical or device baton hand-offs, and escalating retrieval challenges.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        'Team-Based Relay Legs: Teams divide into active runners who take turns completing rapid legs of 3 to 5 curriculum terms.',
        'Turn-Based Countdown Timer: Each runner races against a 20-30s shot clock to maintain momentum and energetic classroom engagement.',
        'Baton Pass Transfer Screen: A high-contrast transition gate locking the screen between runners with audio fanfares, preventing lost seconds during physical hand-offs.',
        'Multiple Game Modalities: Support for Pass & Play (single device per team), Classroom Projector Dual (Team Red vs Blue), or Hot-Seat Solo Sprint.',
        'Comprehensive Class Mastery Analytics: End-of-game summary identifying Match MVP, class accuracy percentage, and a targeted list of missed terms for follow-up review.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        'Curated Science Word Banks: Preloaded high-yield decks across AP Biology, General Chemistry, AP Physics 1, and Environmental Science.',
        'Custom AI Topic Generator: Enter any textbook unit or inquiry topic to generate an authentic curriculum deck on demand.',
        'Clue-Giver vs. Rapid Choice: Toggle between spoken description mode (with forbidden taboo root words) or rapid 4-option active recall grid.',
        'Streak & Chain Multipliers: Earn bonus speed points and a +25% Relay Chain bonus for completing a leg with zero passes.',
        'One-Click Markdown Recap Export: Download a formatted class match summary with team scores and missed vocabulary drill lists.',
      ],
    },
    {
      icon: 'flask',
      title: 'Gameplay Workflows',
      bullets: true,
      items: [
        'Pass & Play (Single Device): Team gathers around one device. Runner 1 completes their leg, the Baton Pass screen triggers, and Runner 2 takes the device.',
        'Classroom Projector Showdown: Project the dual board to the front of the classroom with two teams competing side-by-side or alternating turns.',
        'Hot-Seat Solo Sprint: A single student tests their active recall speed across multiple laps against personal best high scores.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Pedagogical Principles',
      bullets: true,
      items: [
        'Eliminating Spectator Students: Passing the device or turn ensures every student actively articulates scientific concepts rather than passively watching peers.',
        'Rapid Desirable Difficulty: Tight countdowns create productive friction that strengthens associative neural pathways and retrieval durability.',
        'Immediate Corrective Feedback: Identifying missed terms immediately after competition guides targeted study before unit assessments.',
        'Collaborative Cohesion: Speed bonuses and streak multipliers foster team encouragement and positive academic peer support.',
      ],
    },
  ],
};
