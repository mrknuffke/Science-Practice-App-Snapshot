import { CourseType } from '../../types';

export interface DiagramCallout {
  id: string;
  number: number;
  x: number; // percentage (0-100) or pixel in viewBox
  y: number; // percentage (0-100) or pixel in viewBox
  label: string; // canonical correct label
  hint?: string;
  description?: string;
  acceptableAnswers?: string[]; // alternative synonyms
}

export interface DiagramPreset {
  id: string;
  title: string;
  course: CourseType;
  topic: string;
  description: string;
  viewBox: string;
  svgMarkup: string; // clean SVG elements to render inside the viewport
  callouts: DiagramCallout[];
}

export interface CalloutAttempt {
  calloutId: string;
  userGuess: string;
  isCorrect: boolean;
  score: number; // 0 or 1
  feedback?: string;
}

export interface DiagramEvaluation {
  totalCallouts: number;
  correctCount: number;
  scorePercentage: number;
  attempts: Record<string, CalloutAttempt>;
  allComplete: boolean;
}

export type DiagramInteractionStyle = 'word_bank' | 'typing';
export type DiagramViewMode = 'quiz' | 'study';
