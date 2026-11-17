import { TaskResponse, Question, ChatMessage, Flashcard } from '../types';

/**
 * Universal adapter functions to normalize task completion data across different
 * practice modes into standardized TaskResponse[] objects for Study Sprint reports.
 */

export interface DetailedFeedbackItem {
  question?: string;
  studentAnswer?: string;
  feedback?: string;
  evaluation?: 'Correct' | 'Incorrect' | 'Partially Correct' | string;
}

/**
 * Adapts quiz, FRQ, or CER evaluation results into standardized TaskResponse objects.
 */
export function adaptQuizResponses(
  questions: Question[],
  answers: Record<number, string>,
  detailedFeedback?: DetailedFeedbackItem[]
): TaskResponse[] {
  if (!questions || questions.length === 0) {
    return [];
  }

  return questions.map((question, idx) => {
    const feedbackItem = detailedFeedback?.[idx];
    const evaluationStr = feedbackItem?.evaluation;
    const evaluation: 'Correct' | 'Incorrect' | 'Partially Correct' =
      evaluationStr === 'Correct' || evaluationStr === 'Incorrect' || evaluationStr === 'Partially Correct'
        ? evaluationStr
        : 'Partially Correct';

    return {
      questionId: question.id || `q-${idx}`,
      questionText: question.text,
      studentAnswer: answers[idx] || '',
      correctAnswer: question.correctAnswer || undefined,
      feedback: feedbackItem?.feedback || undefined,
      evaluation
    };
  });
}

/**
 * Adapts explanation conversation report items into standardized TaskResponse objects.
 */
export function adaptExplanationResponses(
  detailedFeedback?: DetailedFeedbackItem[]
): TaskResponse[] {
  if (!detailedFeedback || detailedFeedback.length === 0) {
    return [];
  }

  return detailedFeedback.map((fb, idx) => {
    const evaluationStr = fb.evaluation;
    const evaluation: 'Correct' | 'Incorrect' | 'Partially Correct' =
      evaluationStr === 'Correct' || evaluationStr === 'Incorrect' || evaluationStr === 'Partially Correct'
        ? evaluationStr
        : 'Partially Correct';

    return {
      questionId: `expl-${idx}`,
      questionText: fb.question || `Explanation Prompt ${idx + 1}`,
      studentAnswer: fb.studentAnswer || '',
      feedback: fb.feedback || undefined,
      evaluation
    };
  });
}

/**
 * Adapts a calculation chat session into structured TaskResponse items
 * by pairing student messages with tutor feedback.
 */
export function adaptCalculationResponses(
  chatHistory: ChatMessage[],
  topic?: string
): TaskResponse[] {
  if (!chatHistory || chatHistory.length === 0) {
    return [];
  }

  const responses: TaskResponse[] = [];
  let turnIndex = 1;

  for (let i = 0; i < chatHistory.length; i++) {
    const msg = chatHistory[i];
    if (msg.role === 'user' && !msg.isDivider) {
      // Find following model response if available
      const nextMsg = chatHistory[i + 1];
      const modelFeedback = (nextMsg && nextMsg.role === 'model' && !nextMsg.isDivider)
        ? nextMsg.text
        : undefined;

      responses.push({
        questionId: `calc-${turnIndex}`,
        questionText: topic ? `Calculation Step: ${topic}` : `Calculation Step ${turnIndex}`,
        studentAnswer: msg.text,
        feedback: modelFeedback,
        evaluation: 'Correct'
      });
      turnIndex++;
    }
  }

  return responses;
}

/**
 * Adapts flashcards reviewed in a study sprint into standardized TaskResponse items.
 */
export function adaptFlashcardResponses(
  flashcards: Flashcard[],
  score?: number,
  maxScore?: number
): TaskResponse[] {
  if (!flashcards || flashcards.length === 0) {
    return [];
  }

  const isPerfect = score !== undefined && maxScore !== undefined && score === maxScore;

  return flashcards.map((card, idx) => ({
    questionId: `card-${idx}`,
    questionText: card.term,
    studentAnswer: 'Reviewed in flashcard deck',
    correctAnswer: card.definition,
    feedback: card.context || undefined,
    evaluation: isPerfect ? 'Correct' : 'Partially Correct'
  }));
}

/**
 * Adapts worksheet practice questions into standardized TaskResponse items.
 */
export function adaptWorksheetResponses(
  questions: Question[]
): TaskResponse[] {
  if (!questions || questions.length === 0) {
    return [];
  }

  return questions.map((q, idx) => ({
    questionId: q.id || `ws-${idx}`,
    questionText: q.text,
    studentAnswer: 'Completed on printed/offline worksheet',
    correctAnswer: q.correctAnswer || undefined,
    evaluation: 'Correct'
  }));
}
