/**
 * Permanent Convenience Barrel Export for AI Services
 *
 * This barrel is an intentional, permanent export facade that re-exports modular
 * AI service functions from services/ai/* for centralized, backward-compatible access.
 * Feature modules may also be imported directly from services/ai/* where preferred.
 */

// Core utilities
export { DEFAULT_MODEL, callAI, cleanJsonResponse, getCourseContext } from './ai/core';

// Flashcards
export { getFlashcards, getFlashcardReport } from './ai/flashcards';

// Questions
export { getDiverseQuestions, getReplacementQuestion, generateQuestionFromImage } from './ai/questions';

// FRQ
export { getFRQQuestion } from './ai/frq';

// CER
export { getCERQuestion } from './ai/cer';

// Lab
export { getLabAssistance } from './ai/lab';

// Tutor
export { getSimplifiedText, getCalculationChatResponse, getExplanationChatResponse, getMascotAdvisorResponse, getCarryOverGreeting } from './ai/tutor';

// Grading
export { getExplanationReport, getDiagnosticReport, getAIExplanation } from './ai/grading';

// Documents
export {
  generateQuizFromDocuments,
  generateCalculationProblems,
  generateNoteSheet,
  translateRubric,
  getInterviewQuestions,
  getRubricForQuestions,
  getReflectionPrompts
} from './ai/documents';

// Research
export { getResearchMentorResponse, parseResearchMaterials } from './ai/research';

// Overview
export { getTopicOverview, getMultiModeReport } from './ai/overview';

// Test
export { generateTest } from './ai/test';

// Review Games
export { getWhoAmIPuzzles, reviseWhoAmIPuzzle, addOneWhoAmIPuzzle, refreshWhoAmIClue, addOneWhoAmIClue } from './ai/whoAmI';

// Study Sprint
export { getStudySprintTaskRecommendations, getStudySprintReport, generateBonusPractice } from './ai/studySprint';

// Free Body Diagram
export { getFbdFeedback } from './ai/fbd';
