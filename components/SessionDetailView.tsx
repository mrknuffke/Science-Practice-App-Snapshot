import React, { useState, useEffect } from 'react';
import { SessionSnapshot } from '../types';
import { getSessionById } from '../services/storageService';
import { cleanHtml } from '../utils/sanitize';

interface SessionDetailViewProps {
  sessionId: string;
  onBack: () => void;
}

export const SessionDetailView: React.FC<SessionDetailViewProps> = ({
  sessionId,
  onBack
}) => {
  const [session, setSession] = useState<SessionSnapshot | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const loaded = getSessionById(sessionId);
    setSession(loaded);
  }, [sessionId]);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">Session not found</p>
          <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300">
            ← Back to History
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const studentAnswer = session.answers[currentQuestionIndex];
  const feedback = session.report.detailedFeedback[currentQuestionIndex];

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return null;
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button onClick={onBack} className="mb-6 text-slate-400 hover:text-white transition-colors">
          ← Back to History
        </button>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 bg-indigo-600 rounded-full text-xs font-bold uppercase">
                  {session.mode}
                </span>
                <span className="text-slate-400 text-sm">
                  {formatDate(session.dateCompleted)}
                </span>
              </div>
              <h1 className="text-3xl font-black mb-3">{session.course}</h1>
              <div className="flex flex-wrap gap-2">
                {session.topics.map(topic => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-slate-700 rounded-xl text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right ml-4">
              <div className="text-5xl font-black text-indigo-400 mb-1">
                {session.score}
              </div>
              <div className="text-sm text-slate-400">
                {session.questions.length} questions
              </div>
              {formatDuration(session.duration) && (
                <div className="text-sm text-slate-400 mt-1">
                  {formatDuration(session.duration)}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="font-bold text-lg mb-2">AI Summary</h3>
            <p className="text-slate-300">{session.report.summary}</p>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {session.questions.map((_, idx) => {
              const fb = session.report.detailedFeedback[idx];
              const isCorrect = fb.evaluation === 'Correct';
              const isPartial = fb.evaluation === 'Partially Correct';

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all flex-shrink-0 ${
                    currentQuestionIndex === idx
                      ? 'bg-indigo-600 text-white'
                      : isCorrect
                        ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50'
                        : isPartial
                          ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50'
                          : 'bg-rose-900/30 text-rose-400 hover:bg-rose-900/50'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Display */}
        <div className="space-y-6">
          {/* Question */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-sm font-bold text-slate-400">
                Question {currentQuestionIndex + 1} of {session.questions.length}
              </span>
              {currentQuestion.topic && (
                <span className="px-2 py-1 bg-slate-700 rounded text-xs">
                  {currentQuestion.topic}
                </span>
              )}
            </div>

            <div
              className="text-lg mb-4"
              dangerouslySetInnerHTML={{ __html: cleanHtml(currentQuestion.text) }}
            />

            {currentQuestion.options && currentQuestion.options.length > 0 && (
              <div className="space-y-2">
                {currentQuestion.options.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isStudentAnswer = studentAnswer === option;
                  const isCorrect = option === currentQuestion.correctAnswer;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border-2 ${
                        isStudentAnswer && isCorrect
                          ? 'border-emerald-500 bg-emerald-900/20'
                          : isStudentAnswer
                            ? 'border-rose-500 bg-rose-900/20'
                            : isCorrect
                              ? 'border-emerald-500 bg-emerald-900/10'
                              : 'border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-bold">{letter}.</span>
                        <span
                          className="flex-1"
                          dangerouslySetInnerHTML={{ __html: cleanHtml(option) }}
                        />
                        {isStudentAnswer && (
                          <span className="ml-auto text-sm font-bold whitespace-nowrap">
                            {isCorrect ? '✓ Your Answer' : '✗ Your Answer'}
                          </span>
                        )}
                        {!isStudentAnswer && isCorrect && (
                          <span className="ml-auto text-sm font-bold text-emerald-400 whitespace-nowrap">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Student Answer (for non-MCQ) */}
          {(!currentQuestion.options || currentQuestion.options.length === 0) && studentAnswer && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="font-bold mb-3">Your Answer:</h3>
              <div className="bg-slate-900 rounded-xl p-4">
                <p className="whitespace-pre-wrap">{studentAnswer}</p>
              </div>
            </div>
          )}

          {/* Feedback */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-bold text-lg">Feedback</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                feedback.evaluation === 'Correct'
                  ? 'bg-emerald-600'
                  : feedback.evaluation === 'Partially Correct'
                    ? 'bg-amber-600'
                    : 'bg-rose-600'
              }`}>
                {feedback.evaluation}
              </span>
            </div>

            <div className="space-y-4">
              {feedback.feedback && (
                <div>
                  <h4 className="font-bold text-sm text-slate-400 mb-2">Explanation</h4>
                  <p className="text-slate-300">{feedback.feedback}</p>
                </div>
              )}

              {feedback.tutorDeepDive && (
                <div>
                  <h4 className="font-bold text-sm text-slate-400 mb-2">Deep Dive</h4>
                  <p className="text-slate-300">{feedback.tutorDeepDive}</p>
                </div>
              )}

              {feedback.keyConcept && (
                <div>
                  <h4 className="font-bold text-sm text-slate-400 mb-2">Key Concept</h4>
                  <p className="text-slate-300">{feedback.keyConcept}</p>
                </div>
              )}

              {feedback.misconceptionAlert && (
                <div>
                  <h4 className="font-bold text-sm text-slate-400 mb-2">Common Misconception</h4>
                  <p className="text-slate-300">{feedback.misconceptionAlert}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-bold transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentQuestionIndex(prev =>
                Math.min(session.questions.length - 1, prev + 1)
              )}
              disabled={currentQuestionIndex === session.questions.length - 1}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-bold transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
