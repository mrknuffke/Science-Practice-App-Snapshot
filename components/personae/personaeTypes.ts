import { CourseType } from '../../types';

export type PersonaId = 'tutor' | 'socratic' | 'growth_coach';

export interface PersonaChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  metadata?: {
    mathSteps?: string[];
    scratchpadSnapshot?: string;
    conceptDepth?: number;
    errorCategory?: 'misconception' | 'calculation' | 'misread' | 'recall_gap';
  };
}

export interface PersonaPreset {
  id: string;
  persona: PersonaId;
  title: string;
  course: CourseType;
  topic: string;
  starterPrompt: string;
  initialScratchpad?: string;
  mathExpression?: string;
  sampleErrorText?: string;
}

export interface TutorMathStep {
  stepNumber: number;
  label: string;
  formula: string;
  calculation: string;
  explanation: string;
}

export interface GrowthCoachErrorAnalysis {
  category: 'misconception' | 'calculation' | 'misread' | 'recall_gap';
  categoryLabel: string;
  summary: string;
  correctiveStrategy: string;
  growthAffirmation: string;
}
