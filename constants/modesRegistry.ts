import { COURSES } from './apCourses';

// ADDING A NEW DASHBOARD MODE? Add it here first. This is the single source of
// truth for the mode list — the dashboard renders from it, and the Support page
// derives its "practice modes" count from its length. Never type that count into
// prose; the site advertised "10+" while shipping 16 for months.
export interface ModeMetadata {
  id: string;
  title: string;
  description: string;
  icon: string;
  colorClass: string;
  tagText: string;
}

export const MODES_METADATA: ModeMetadata[] = [
  { id: 'quiz', title: 'Adaptive Practice', description: 'AI-generated multiple choice and short answer questions tailored to your performance level.', icon: 'target', colorClass: 'indigo', tagText: 'MCQ & Short Answer' },
  { id: 'frq', title: 'Written Response (FRQ)', description: 'Draft detailed qualitative arguments graded in real-time against strict board rubrics.', icon: 'pen-tool', colorClass: 'amber', tagText: 'AP-Style FRQ' },
  { id: 'cer', title: 'Data Analysis (C.E.R.)', description: 'Analyze charts and observations to construct logical scientific claims.', icon: 'bar-chart', colorClass: 'teal', tagText: 'Claim-Evidence-Reasoning' },
  { id: 'study_sprint', title: 'Study Sprint', description: 'A focused 3-task scientific roadmap concluding in a personalized report.', icon: 'clock', colorClass: 'emerald', tagText: 'Multi-Task Roadmap' },
  { id: 'explanation', title: 'Explanation Partner', description: 'Engage in conversational Socratic study with your AI study companion.', icon: 'message-square', colorClass: 'teal', tagText: 'Socratic Chat' },
  { id: 'calculation', title: 'Calculation Partner', description: 'Step-by-step problem solver for physics, chemistry, and math equations.', icon: 'calculator', colorClass: 'violet', tagText: 'Equation Solver' },
  { id: 'quiz_my_notes', title: 'Smart Scanner', description: 'Upload notes/photos to instantly generate quizzes and flashcards.', icon: 'zap', colorClass: 'indigo', tagText: 'Notes Scanner' },
  { id: 'flashcards', title: 'Flashcard Study Decks', description: 'Study quick-recall vocabulary with interactive flipping flashcards.', icon: 'layers', colorClass: 'pink', tagText: 'Recall Deck' },
  { id: 'reflection', title: 'Metacognitive Reflection', description: 'Review progress, evaluate learning gaps, and receive suggestions.', icon: 'brain', colorClass: 'orange', tagText: 'Self-Evaluation' },
  { id: 'lab', title: 'Lab Co-Pilot', description: 'Design lab investigations, write protocols, plot graphs, and calculate margins of error.', icon: 'flask', colorClass: 'emerald', tagText: 'Lab Assistant' },
  { id: 'motion_tracker', title: 'Motion Tracker', description: 'Track falling coordinates and plot real-time mechanical trajectory curves.', icon: 'camera', colorClass: 'coral', tagText: 'Video Lab' },
  { id: 'research', title: 'Research Assistant', description: 'Get assistance with academic biology/chemistry projects and analyze sources.', icon: 'search', colorClass: 'sky', tagText: 'Literature Review' },
  { id: 'simulations_hub', title: 'Interactives Lab', description: 'Hands-on vector simulators for bonding, phase changes, and genetics.', icon: 'play', colorClass: 'violet', tagText: 'Simulations Hub' },
  { id: 'review_games', title: 'Review Games', description: 'Play scientific revision games like Jeopardy, Bingo, and Who Am I.', icon: 'gamepad', colorClass: 'pink', tagText: 'Revision Games' },
  { id: 'ap_review_catalog', title: 'Advanced Study Buddy', description: `Review core concepts across ${COURSES.length} AP and IB courses, aligned with official CED and subject-guide scope.`, icon: 'brain', colorClass: 'violet', tagText: 'AP & IB Review' },
  { id: 'learning_loop', title: 'The Learning Loop', description: 'Master any scientific topic via a 5-step active cycle including socratic checks, gap connection diagnosis, and challenge research.', icon: 'layers', colorClass: 'emerald', tagText: '5-Phase Mastery' },
  { id: 'concept_map', title: 'Concept Map Builder', description: 'Construct interactive node-and-edge relational concept webs with directional propositions and semantic evaluation.', icon: 'network', colorClass: 'violet', tagText: 'Concept Web' },
  { id: 'diagram_labeling', title: 'Diagram Labeling', description: 'Test and reinforce anatomical and schematic mastery on interactive publication-grade vector diagrams.', icon: 'image', colorClass: 'emerald', tagText: 'Visual Recall' },
  { id: 'skeptic', title: 'The Skeptic (Peer Review)', description: 'Defend your experimental design against an AI peer reviewer probing for confounding variables and control flaws.', icon: 'scale', colorClass: 'rose', tagText: 'Pre-Lab Defense' },
  { id: 'tutor', title: 'AI Science Tutor', description: 'Step-by-step calculation partner with dimensional analysis checks and an interactive mathematical scratchpad.', icon: 'graduation-cap', colorClass: 'emerald', tagText: 'Step-by-Step' },
  { id: 'socratic', title: 'AI Socratic Guide', description: 'Explore scientific paradoxes and first principles through dialectic inquiry and reasoning depth evaluation.', icon: 'help-circle', colorClass: 'violet', tagText: 'Dialectic Inquiry' },
  { id: 'growth_coach', title: 'AI Growth Coach', description: 'Transform exam mistakes and study blocks into mastery with evidence-based error taxonomy diagnostics.', icon: 'award', colorClass: 'amber', tagText: 'Metacognitive' },
];
