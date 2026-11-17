import { describe, it, expect } from 'vitest';
import {
  adaptQuizResponses,
  adaptExplanationResponses,
  adaptCalculationResponses,
  adaptFlashcardResponses,
  adaptWorksheetResponses
} from '../../utils/studySprintAdapter';
import { Question, ChatMessage, Flashcard } from '../../types';

describe('StudySprintAdapter', () => {
  describe('adaptQuizResponses', () => {
    it('returns empty array for empty questions', () => {
      expect(adaptQuizResponses([], {})).toEqual([]);
    });

    it('standardizes quiz questions, answers, and feedback', () => {
      const mockQuestions: Question[] = [
        {
          id: 'q1',
          unit: 'Unit 1',
          topic: 'Cell Structure',
          text: 'What is the powerhouse of the cell?',
          options: ['Mitochondria', 'Nucleus'],
          correctAnswer: 'Mitochondria',
          type: 'mcq'
        },
        {
          id: 'q2',
          unit: 'Unit 3',
          topic: 'Cellular Energetics',
          text: 'Describe glycolysis.',
          options: [],
          correctAnswer: 'Cytoplasmic glucose breakdown',
          type: 'frq'
        }
      ];

      const answers: Record<number, string> = {
        0: 'Mitochondria',
        1: 'Breakdown of glucose in the cytoplasm'
      };

      const detailedFeedback = [
        { feedback: 'Spot on!', evaluation: 'Correct' },
        { feedback: 'Good conceptual grasp.', evaluation: 'Partially Correct' }
      ];

      const adapted = adaptQuizResponses(mockQuestions, answers, detailedFeedback);
      expect(adapted).toHaveLength(2);
      expect(adapted[0]).toEqual({
        questionId: 'q1',
        questionText: 'What is the powerhouse of the cell?',
        studentAnswer: 'Mitochondria',
        correctAnswer: 'Mitochondria',
        feedback: 'Spot on!',
        evaluation: 'Correct'
      });
      expect(adapted[1]).toEqual({
        questionId: 'q2',
        questionText: 'Describe glycolysis.',
        studentAnswer: 'Breakdown of glucose in the cytoplasm',
        correctAnswer: 'Cytoplasmic glucose breakdown',
        feedback: 'Good conceptual grasp.',
        evaluation: 'Partially Correct'
      });
    });
  });

  describe('adaptExplanationResponses', () => {
    it('handles empty feedback cleanly', () => {
      expect(adaptExplanationResponses(undefined)).toEqual([]);
    });

    it('formats explanation conversational feedback', () => {
      const feedback = [
        {
          question: 'How does enzyme active site shape dictate specificity?',
          studentAnswer: 'The shape fits the substrate like a lock and key.',
          feedback: 'Accurate, though remember induced fit model too.',
          evaluation: 'Correct'
        }
      ];

      const adapted = adaptExplanationResponses(feedback);
      expect(adapted).toHaveLength(1);
      expect(adapted[0].questionText).toContain('enzyme active site');
      expect(adapted[0].studentAnswer).toContain('lock and key');
      expect(adapted[0].evaluation).toBe('Correct');
    });
  });

  describe('adaptCalculationResponses', () => {
    it('pairs user steps with model responses', () => {
      const chat: ChatMessage[] = [
        { role: 'model', text: 'Welcome! What problem would you like to solve?' },
        { role: 'user', text: 'q = mc Delta T for 100g water heated 5C.' },
        { role: 'model', text: 'Great start. What is the specific heat capacity c of liquid water?' },
        { role: 'user', text: 'c is 4.184 J/g C, so q = 100 * 4.184 * 5 = 2092 J.' },
        { role: 'model', text: 'Exactly right! 2092 Joules.' }
      ];

      const adapted = adaptCalculationResponses(chat, 'Thermodynamics');
      expect(adapted).toHaveLength(2);
      expect(adapted[0].questionId).toBe('calc-1');
      expect(adapted[0].questionText).toBe('Calculation Step: Thermodynamics');
      expect(adapted[0].studentAnswer).toBe('q = mc Delta T for 100g water heated 5C.');
      expect(adapted[0].feedback).toContain('What is the specific heat capacity');
      expect(adapted[1].questionId).toBe('calc-2');
      expect(adapted[1].studentAnswer).toContain('2092 J');
      expect(adapted[1].feedback).toContain('Exactly right');
    });
  });

  describe('adaptFlashcardResponses', () => {
    it('handles flashcard decks with scores', () => {
      const flashcards: Flashcard[] = [
        { id: 'fc1', term: 'Mitochondria', definition: 'Site of cellular respiration', context: 'Organelle, ATP' },
        { id: 'fc2', term: 'Ribosome', definition: 'Site of protein synthesis', context: 'Translation' }
      ];

      const adapted = adaptFlashcardResponses(flashcards, 2, 2);
      expect(adapted).toHaveLength(2);
      expect(adapted[0].questionText).toBe('Mitochondria');
      expect(adapted[0].correctAnswer).toBe('Site of cellular respiration');
      expect(adapted[0].evaluation).toBe('Correct');

      const imperfectAdapted = adaptFlashcardResponses(flashcards, 1, 2);
      expect(imperfectAdapted[0].evaluation).toBe('Partially Correct');
    });
  });

  describe('adaptWorksheetResponses', () => {
    it('converts worksheet questions into completed task responses', () => {
      const questions: Question[] = [
        { id: 'w1', unit: 'Unit 2', topic: 'Homeostasis', text: 'Define homeostasis.', options: [], correctAnswer: 'Dynamic equilibrium', type: 'frq' }
      ];

      const adapted = adaptWorksheetResponses(questions);
      expect(adapted).toHaveLength(1);
      expect(adapted[0].questionId).toBe('w1');
      expect(adapted[0].studentAnswer).toContain('worksheet');
      expect(adapted[0].evaluation).toBe('Correct');
    });
  });
});
