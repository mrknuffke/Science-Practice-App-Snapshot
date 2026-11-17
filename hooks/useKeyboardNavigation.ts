import { useEffect } from 'react';
import { Question } from '../types';

interface UseKeyboardNavigationProps {
  isActive: boolean; // Whether keyboard navigation should be active (e.g., view === 'quiz')
  questions: Question[];
  currentQuestionIndex: number;
  onNextQuestion: () => void;
  onSubmit: () => void;
}

/**
 * Hook to handle keyboard navigation for quiz modes
 * - MCQ: Enter key advances to next question or submits
 * - Written/SA: Ctrl+Enter (or Cmd+Enter on Mac) advances or submits
 */
export const useKeyboardNavigation = ({
  isActive,
  questions,
  currentQuestionIndex,
  onNextQuestion,
  onSubmit
}: UseKeyboardNavigationProps) => {
  useEffect(() => {
    if (!isActive || questions.length === 0) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isLast = currentQuestionIndex === questions.length - 1;
      const currentQ = questions[currentQuestionIndex];
      const isMCQ = currentQ?.type === 'mcq';

      // MCQ: Enter works.
      // Written: Ctrl+Enter works.
      const isSubmitKey = isMCQ ? e.key === 'Enter' : ((e.metaKey || e.ctrlKey) && e.key === 'Enter');

      if (isSubmitKey) {
        e.preventDefault();
        if (isLast) {
          onSubmit();
        } else {
          onNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isActive, currentQuestionIndex, questions, onNextQuestion, onSubmit]);
};
