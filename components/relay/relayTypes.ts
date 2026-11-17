import { CourseType } from '../../types';

export type RelayGameMode = 'pass_and_play' | 'projector_dual' | 'solo_sprint';

export type RelayAnsweringModality = 'caller_guesser' | 'rapid_choice' | 'rapid_typing';

export interface RelayCard {
  id: string;
  term: string;
  category: string;
  definition: string;
  clueKeywords: string[];
  tabooWords: string[];
  formulaOrEquation?: string;
  options?: string[]; // for rapid choice mode
}

export interface RelayTeam {
  id: string;
  name: string;
  color: 'indigo' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'violet';
  score: number;
  currentRunnerIndex: number;
  runners: string[];
}

export interface RelayAnswerRecord {
  term: string;
  category: string;
  correct: boolean;
  timeSpentSeconds: number;
  teamId: string;
  runnerName: string;
  lap: number;
  pointsEarned: number;
}

export interface RelayGameStats {
  totalTerms: number;
  totalCorrect: number;
  totalPassed: number;
  fastestAnswerSeconds: number;
  cleanLegsCount: number; // legs completed with 0 passes
  answers: RelayAnswerRecord[];
}

export interface RelayDeck {
  id: string;
  title: string;
  course: CourseType;
  topic: string;
  cards: RelayCard[];
}

export interface RelayConfig {
  gameMode: RelayGameMode;
  modality: RelayAnsweringModality;
  course: CourseType;
  topic: string;
  totalLaps: number;
  termsPerRunner: number;
  turnSeconds: number;
  teams: RelayTeam[];
}
