import { CourseType, Flashcard } from '../../types';

export type LeitnerBoxNumber = 1 | 2 | 3 | 4 | 5;

export interface SRSItemRecord {
  signature: string;
  box: LeitnerBoxNumber;
  intervalDays: number;
  nextDue: number; // Unix timestamp in ms
  lastAttempt: number; // Unix timestamp in ms
  attempts: number;
  consecutiveCorrect: number;
}

export type SRSProgressMap = Record<string, SRSItemRecord>;

export interface LeitnerStats {
  box1: number; // Learning
  box2: number; // Familiar
  box3: number; // Competent
  box4: number; // Proficient
  box5: number; // Mastered
  total: number;
  dueCount: number;
  masteredPercentage: number;
}

export interface SavedFlashcardDeck {
  id: string;
  title: string;
  course: CourseType;
  topic: string;
  createdAt: number;
  updatedAt: number;
  cards: Flashcard[];
}

export type FlashcardStudyMode = 'learn' | 'srs_due' | 'cram' | 'quiz' | 'report';
