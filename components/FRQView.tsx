
import React, { useState, useEffect } from 'react';
import { Question, CourseType } from '../types';
import ResponseEditor from './ResponseEditor';
import { cleanHtml } from '../utils/sanitize';
import DataChart from './DataChart';
import MarkdownRenderer from './MarkdownRenderer';
import { StudentTools } from './StudentTools';
import { useSimplify } from '../hooks/useSimplify';
import { useDialog } from '../hooks/useDialog';

interface FRQViewProps {
  course: CourseType;
  topic: string;
  question: Question;
  durationSeconds: number;
  promptStyle?: string;
  onSubmit: (answer: string) => void;
  onRefresh?: () => void;
  onQuit: () => void;
  onHarder?: () => void;
  onEasier?: () => void;
}

const FRQView: React.FC<FRQViewProps> = ({
  course,
  topic,
  question,
  durationSeconds,
  promptStyle,
  onSubmit,
  onRefresh,
  onQuit,
  onHarder,
  onEasier
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const [isTimerVisible, setIsTimerVisible] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitDialog = useDialog({ onClose: () => setShowSubmitModal(false), labelledBy: 'frq-submit-title', open: showSubmitModal });
  const errorDialog = useDialog({ onClose: () => setSubmitError(null), labelledBy: 'frq-error-title', open: submitError !== null });

  // Simplify Hook
  const { displayText: scenarioText, isSimplifying, isSimplified, toggleSimplify } = useSimplify(question?.scenario || question?.text || "");

  // Initialize answer slots if subquestions exist
  useEffect(() => {
    if (question?.subQuestions) {
      const initialAnswers: Record<number, string> = {};
      question.subQuestions.forEach((_, index) => {
        initialAnswers[index] = '';
      });
      setAnswers(initialAnswers);
    }
  }, [question]);

  useEffect(() => {
    // If duration is 0, it means "Untimed" (Off)
    if (durationSeconds === 0) return;

    if (timeLeft <= 0) {
      setIsTimeUp(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, durationSeconds]);

  const formatTime = (seconds: number) => {
    if (durationSeconds === 0) return "Untimed";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('course', course);
    url.searchParams.set('topic', topic);
    url.searchParams.set('mode', 'frq');
    navigator.clipboard.writeText(url.toString()).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleManualSubmit = () => {
    // Check if any answer is provided
    const hasContent = Object.values(answers).some(a => a.trim().length > 0);
    if (!hasContent) {
      setSubmitError("Please write a response before submitting.");
      return;
    }
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    // Stitch answers together for the analyzer
    const stitchedAnswer = question.subQuestions
      ? question.subQuestions.map((_, i) => `Part (${String.fromCharCode(97 + i)}): ${answers[i] || "(No Answer)"}`).join('\n\n')
      : answers[0] || ""; // Fallback for unstructured

    onSubmit(stitchedAnswer);
    setShowSubmitModal(false);
  };

  // Safety check for loading state if this component is rendered prematurely
  if (!question) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 font-bold animate-pulse">Loading Data...</div>
      </div>
    );
  }

  const handleAnswerChange = (index: number, val: string) => {
    setAnswers(prev => ({ ...prev, [index]: val }));
  };

  // Naming logic: AP -> FRQ, Others -> Written Response
  const questionLabel = course.includes("AP") ? "FRQ Simulator" : "Written Response";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-lg flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Science Practice Partner</p>
          <h2 className="font-bold text-lg leading-none">
            {questionLabel} • {topic}
            {promptStyle && <span className="ml-2 px-2 py-0.5 bg-slate-700/50 rounded-lg text-slate-300 text-xs font-medium border border-slate-600 align-middle tracking-normal">{promptStyle}</span>}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleShare} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1" title="Share Link">
            {linkCopied ? (
              <span className="text-xs font-bold text-emerald-400 animate-pulse">Copied!</span>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            )}
          </button>

          {onRefresh && (
            <button
              onClick={() => {
                const hasContent = Object.values(answers).some(a => a.trim().length > 0);
                if (hasContent && !confirm("Get a new question? Your current answer will be lost.")) return;
                onRefresh();
              }}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              title="Regenerate Question"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          )}

          {/* Timer with Toggle */}
          <div className={`relative px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${durationSeconds > 0 && timeLeft < 60 ? 'bg-rose-900/50 border border-rose-500/50' : 'bg-slate-800'}`}>
            <button
              onClick={() => setIsTimerVisible(!isTimerVisible)}
              className="text-slate-400 hover:text-white transition-colors"
              title={isTimerVisible ? "Hide Timer" : "Show Timer"}
            >
              {isTimerVisible ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
            <div className={`font-mono font-bold text-xl min-w-[60px] text-center ${isTimerVisible ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
              {formatTime(timeLeft)}
            </div>
            {/* Fallback Icon when hidden */}
            {!isTimerVisible && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pl-6 text-slate-500 animate-pulse">
                ⏳
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Scenario & Exhibits (Sticky on Desktop) */}
        <div className="lg:col-span-6 h-full">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2 mb-6 border-b border-slate-100 pb-4">
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border border-amber-200">Stimulus Material</span>
              <StudentTools
                text={scenarioText}
                onSimplify={toggleSimplify}
                isSimplifying={isSimplifying}
                isSimplified={isSimplified}
                onHarder={onHarder}
                onEasier={onEasier}
                onRegenerate={onRefresh}
              />
            </div>

            {/* Context / Scenario */}
            <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-sm">
              <div dangerouslySetInnerHTML={{ __html: cleanHtml(scenarioText) }}></div>
            </div>

            {/* Exhibits (Graphs/Tables) */}
            {question.exhibits && question.exhibits.length > 0 && (
              <div className="space-y-8 mt-8">
                {question.exhibits.map((exhibit, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-2">
                      {exhibit.type === 'table' ? 'Table' : 'Figure'} {idx + 1}: {exhibit.title}
                    </h4>
                    {exhibit.type === 'graph' ? (
                      <div className="w-full bg-white rounded-lg border border-slate-100 p-2 overflow-hidden flex justify-center">
                        {/* Render Recharts DataChart */}
                        {exhibit.chartData ? (
                          <div className="w-full">
                            <DataChart config={exhibit.chartData} />
                          </div>
                        ) : (
                          <div className="w-full max-w-[500px]" dangerouslySetInnerHTML={{ __html: cleanHtml(exhibit.content) }} />
                        )}
                      </div>
                    ) : (
                      /* Render Table or Text (Diagram) */
                      <div className="overflow-x-auto">
                        <MarkdownRenderer content={exhibit.content} className="prose prose-slate max-w-none text-sm" />
                      </div>
                    )}
                    {exhibit.caption && (
                      <div className="mt-3 text-xs text-slate-600 italic border-t border-slate-200 pt-2">
                        <span className="font-bold not-italic text-slate-400 mr-1">Note:</span>
                        {exhibit.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Questions & Response Fields */}
        <div className="lg:col-span-6 space-y-12 pb-24">
          {question.subQuestions ? (
            question.subQuestions.map((partText, index) => (
              <div key={index} className="space-y-4">
                <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Part ({String.fromCharCode(97 + index)})</span>
                  <p className="font-bold text-slate-800 text-lg leading-snug" dangerouslySetInnerHTML={{ __html: cleanHtml(partText) }}></p>
                </div>
                <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 focus-within:ring-2 ring-indigo-500/20 transition-all">
                  <ResponseEditor
                    value={answers[index] || ''}
                    onChange={(val) => handleAnswerChange(index, val)}
                    disabled={isTimeUp && durationSeconds > 0}
                    placeholder={`Type your answer for part (${String.fromCharCode(97 + index)})...`}
                    minHeight="200px"
                    autoFocus={index === 0}
                  />
                </div>
              </div>
            ))
          ) : (
            // Fallback for unstructured FRQs
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
              <ResponseEditor
                value={answers[0] || ''}
                onChange={(val) => handleAnswerChange(0, val)}
                disabled={isTimeUp && durationSeconds > 0}
                placeholder="Type your full response here..."
                minHeight="400px"
                autoFocus={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={onQuit}
            className="text-slate-400 hover:text-rose-500 font-bold text-sm"
          >
            Quit Session
          </button>
          <button
            onClick={handleManualSubmit}
            disabled={isTimeUp && durationSeconds > 0}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTimeUp && durationSeconds > 0 ? "Time's Up - Submit" : "Submit for Feedback"}
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div {...submitDialog} className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🚀
              </div>
              <h3 id="frq-submit-title" className="text-xl font-black text-slate-800 mb-2">Ready to Submit?</h3>
              <p className="text-slate-600 mb-6">
                Your response will be analyzed by our AI for scientific accuracy.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Keep Editing
                </button>
                <button
                  onClick={confirmSubmit}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-200 transition-colors"
                >
                  Submit Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {submitError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSubmitError(null)}>
          <div {...errorDialog} className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ✍️
              </div>
              <h3 id="frq-error-title" className="text-xl font-black text-slate-800 mb-2">Blank Response</h3>
              <p className="text-slate-600 mb-6">
                {submitError}
              </p>
              <button
                onClick={() => setSubmitError(null)}
                className="w-full py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-200 transition-colors"
              >
                Okay, I'll Write Something
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FRQView;
