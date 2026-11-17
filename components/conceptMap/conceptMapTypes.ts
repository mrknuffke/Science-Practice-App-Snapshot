export interface ConceptNode {
  id: string;
  label: string;
  x: number;
  y: number;
  category?: string;
  color?: string;
  description?: string;
  isCustom?: boolean;
}

export interface ConceptEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  status?: 'correct' | 'needs_work' | 'invalid' | 'unreviewed';
  feedback?: string;
}

export interface Proposition {
  id: string;
  sourceId: string;
  sourceLabel: string;
  targetId: string;
  targetLabel: string;
  linkingPhrase: string;
  status: 'correct' | 'needs_work' | 'invalid' | 'unreviewed';
  feedback: string;
}

export interface ConceptMapEvaluation {
  overallScore: number;
  maxScore: number;
  masteryPercentage: number;
  feedbackSummary: string;
  propositions: Proposition[];
  missingKeyConnections: string[];
  misconceptions: string[];
  praise: string[];
}

export interface PresetConceptItem {
  id: string;
  label: string;
  category: string;
  description: string;
}

export interface TargetProposition {
  sourceLabel: string;
  linkingPhrase: string;
  targetLabel: string;
  explanation?: string;
}

export interface ConceptMapPreset {
  id: string;
  title: string;
  course: string;
  topic: string;
  description: string;
  concepts: PresetConceptItem[];
  canonicalPropositions: TargetProposition[];
}

export type LinkingPhraseOption =
  | 'produces'
  | 'consumes'
  | 'catalyzes'
  | 'inhibits'
  | 'is composed of'
  | 'regulates'
  | 'increases'
  | 'decreases'
  | 'requires'
  | 'converts into'
  | 'binds to'
  | 'transports'
  | 'causes';

export const COMMON_LINKING_PHRASES: LinkingPhraseOption[] = [
  'produces',
  'consumes',
  'catalyzes',
  'inhibits',
  'is composed of',
  'regulates',
  'increases',
  'decreases',
  'requires',
  'converts into',
  'binds to',
  'transports',
  'causes',
];
