import { CourseType } from '../../types';

export type SkepticCritiqueCategory =
  | 'falsifiability'
  | 'variable_isolation'
  | 'controls'
  | 'measurement_error'
  | 'alternative_hypotheses';

export type SkepticSeverity = 'critical' | 'moderate' | 'minor';

export interface SkepticChallenge {
  id: string;
  category: SkepticCritiqueCategory;
  title: string;
  question: string;
  severity: SkepticSeverity;
  hint: string;
  suggestedFix?: string;
}

export interface SkepticInvestigation {
  id: string;
  title: string;
  course: CourseType;
  topic: string;
  researchQuestion: string;
  hypothesis: string;
  independentVariable: string;
  dependentVariable: string;
  controlledVariables: string[];
  controlGroup: string;
  measurementMethod: string;
  potentialConfounders?: string[];
}

export interface SkepticPreset extends SkepticInvestigation {
  initialChallenges: SkepticChallenge[];
}

export interface SkepticRebuttal {
  challengeId: string;
  studentArgument: string;
  verdict?: 'accepted' | 'partial' | 'unconvincing';
  reviewerNotes?: string;
}

export interface SkepticEvaluation {
  overallVerdict: 'approved' | 'revisions_requested' | 'rejected';
  rigorScore: number; // 0 - 100
  strengths: string[];
  vulnerabilities: string[];
  recommendations: string[];
  evaluatedAt: string;
}
