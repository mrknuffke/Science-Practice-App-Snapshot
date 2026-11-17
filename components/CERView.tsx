
import React, { useState, useEffect } from 'react';
import { Question, CourseType } from '../types';
import ResponseEditor from './ResponseEditor';
import { cleanHtml } from '../utils/sanitize';
import DataChart from './DataChart';
import { StudentTools } from './StudentTools';
import { useSimplify } from '../hooks/useSimplify';
import { useDialog } from '../hooks/useDialog';

interface CERViewProps {
  course: CourseType;
  topic: string;
  question: Question;
  durationSeconds: number;
  onSubmit: (answer: string) => void;
  onQuit: () => void;
  onHarder?: () => void;
  onEasier?: () => void;
  onRefresh?: () => void;
}

const CERView: React.FC<CERViewProps> = ({
  course,
  topic,
  question,
  durationSeconds,
  onSubmit,
  onQuit,
  onHarder,
  onEasier,
  onRefresh
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitDialog = useDialog({ onClose: () => setShowSubmitModal(false), labelledBy: 'cer-submit-title', open: showSubmitModal });
  const errorDialog = useDialog({ onClose: () => setSubmitError(null), labelledBy: 'cer-error-title', open: submitError !== null });

  // Simplify Hook
  const { displayText: scenarioText, isSimplifying, isSimplified, toggleSimplify } = useSimplify(question?.scenario || question?.text || "");

  // CER Inputs
  const [claim, setClaim] = useState('');
  const [evidence, setEvidence] = useState('');
  const [reasoning, setReasoning] = useState('');

  // Helper to get theme colors
  const getThemeColors = (c: CourseType) => {
    if (c === 'Custom Practice') return { bg: 'bg-indigo-600', text: 'text-indigo-900', border: 'border-indigo-600', light: 'bg-indigo-50', accent: 'text-indigo-500', hover: 'hover:bg-indigo-50' };
    if (c.includes('Chemistry')) return { bg: 'bg-violet-600', text: 'text-violet-900', border: 'border-violet-600', light: 'bg-violet-50', accent: 'text-violet-500', hover: 'hover:bg-violet-50' };
    if (c.includes('Physics') && !c.includes('Physical Science')) return { bg: 'bg-cyan-600', text: 'text-cyan-900', border: 'border-cyan-600', light: 'bg-cyan-50', accent: 'text-cyan-500', hover: 'hover:bg-cyan-50' };
    if (c.includes('Environmental')) return { bg: 'bg-teal-600', text: 'text-teal-900', border: 'border-teal-600', light: 'bg-teal-50', accent: 'text-teal-500', hover: 'hover:bg-teal-50' };
    if (c.includes('Middle School')) return { bg: 'bg-amber-500', text: 'text-amber-900', border: 'border-amber-500', light: 'bg-amber-50', accent: 'text-amber-500', hover: 'hover:bg-amber-50' };
    if (c.includes('Elementary School')) return { bg: 'bg-orange-500', text: 'text-orange-900', border: 'border-orange-500', light: 'bg-orange-50', accent: 'text-orange-500', hover: 'hover:bg-orange-50' };
    if (['Physical Science', 'Anatomy and Physiology', 'Marine Biology', 'Biotechnology', 'Forensic Science'].includes(c)) {
      return { bg: 'bg-slate-600', text: 'text-slate-900', border: 'border-slate-600', light: 'bg-slate-100', accent: 'text-slate-500', hover: 'hover:bg-slate-50' };
    }
    return { bg: 'bg-emerald-600', text: 'text-emerald-900', border: 'border-emerald-600', light: 'bg-emerald-50', accent: 'text-emerald-500', hover: 'hover:bg-emerald-50' };
  };
  const theme = getThemeColors(course);

  useEffect(() => {
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
    url.searchParams.set('mode', 'cer');
    navigator.clipboard.writeText(url.toString()).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleManualSubmit = () => {
    if (!claim || !evidence || !reasoning) {
      setSubmitError("Please complete all three sections (Claim, Evidence, and Reasoning) before submitting.");
      return;
    }
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    const fullResponse = `
CLAIM: ${claim}

EVIDENCE: ${evidence}

REASONING: ${reasoning}
    `;
    onSubmit(fullResponse);
    setShowSubmitModal(false);
  };

  if (!question) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-lg flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Science Practice Partner</p>
          <h2 className="font-bold text-lg leading-none">{course} CER Practice • {topic}</h2>
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
                if ((claim || evidence || reasoning) && !confirm("Get a new question? Your current work will be lost.")) return;
                if (onRefresh) onRefresh();
              }}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              title="Regenerate Question"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          )}

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
            <div className={`text-2xl font-mono font-bold ${isTimerVisible ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
              {formatTime(timeLeft)}
            </div>
            {!isTimerVisible && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pl-6 text-slate-500 animate-pulse">
                ⏳
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Data & Scenario */}
        <div className="lg:col-span-6 h-full">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-4">
              <span className={`${theme.light} ${theme.text} text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border border-current`}>Confidential Dossier</span>
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

            {/* Context Text */}
            <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed mb-8 text-sm">
              <div dangerouslySetInnerHTML={{ __html: cleanHtml(scenarioText) }}></div>
            </div>

            {/* Exhibits (Graphs/Tables) */}
            {question.exhibits && Array.isArray(question.exhibits) && question.exhibits.length > 0 ? (
              <div className="space-y-8">
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
                          /* Fallback for old SVG contents, though we expect chartData now */
                          <div className="w-full max-w-[500px]" dangerouslySetInnerHTML={{ __html: cleanHtml(exhibit.content || '') }} />
                        )}
                      </div>
                    ) : (
                      /* Render Table */
                      <div className="overflow-x-auto">
                        <div dangerouslySetInnerHTML={{ __html: cleanHtml(exhibit.content) }} />
                      </div>
                    )}
                    {exhibit.caption && (
                      <div className="mt-3 text-xs text-slate-600 italic border-t border-slate-200 pt-2">
                        <span className="font-bold not-italic text-slate-400 mr-1">Note:</span>
                        <span dangerouslySetInnerHTML={{ __html: cleanHtml(exhibit.caption) }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback for legacy format */
              <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed mb-8">
                {/* Sometimes scenario contains the table in old version */}
              </div>
            )}

            {/* Central Question */}
            <div className={`${theme.light} p-6 rounded-2xl border-2 ${theme.border} mt-8`}>
              <span className={`${theme.text} text-xs font-black uppercase tracking-widest mb-2 block`}>Central Research Question</span>
              <p className="text-xl font-bold text-slate-900 leading-snug" dangerouslySetInnerHTML={{ __html: cleanHtml(question.text) }}></p>
            </div>
          </div>
        </div>

        {/* Right: CER Inputs */}
        <div className="lg:col-span-6 space-y-8 pb-24">

          {/* CLAIM */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wide">1. Claim</label>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Make a statement</span>
            </div>
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 focus-within:ring-2 ring-indigo-500/20 transition-all">
              <ResponseEditor
                value={claim}
                onChange={setClaim}
                disabled={isTimeUp && durationSeconds > 0}
                placeholder="Directly answer the central question..."
                minHeight="100px"
              />
            </div>
          </div>

          {/* EVIDENCE */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wide">2. Evidence</label>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cite specific data</span>
            </div>
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 focus-within:ring-2 ring-indigo-500/20 transition-all">
              <ResponseEditor
                value={evidence}
                onChange={setEvidence}
                disabled={isTimeUp && durationSeconds > 0}
                placeholder="Reference specific numbers, trends, or observations from BOTH the Table and Figure..."
                minHeight="140px"
              />
            </div>
          </div>

          {/* REASONING */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wide">3. Reasoning</label>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Explain the science</span>
            </div>
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 focus-within:ring-2 ring-indigo-500/20 transition-all">
              <ResponseEditor
                value={reasoning}
                onChange={setReasoning}
                disabled={isTimeUp && durationSeconds > 0}
                placeholder="Explain the scientific principle that connects your evidence to your claim..."
                minHeight="180px"
              />
            </div>
          </div>

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
            className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${theme.bg} text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isTimeUp && durationSeconds > 0 ? "Time's Up - Submit" : "Submit Analysis"}
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
              <h3 id="cer-submit-title" className="text-xl font-black text-slate-800 mb-2">Ready to Submit?</h3>
              <p className="text-slate-600 mb-6">
                Your response will be analyzed for scientific accuracy and use of evidence.
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
                  Submit Analysis
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
                ⚠️
              </div>
              <h3 id="cer-error-title" className="text-xl font-black text-slate-800 mb-2">Incomplete Response</h3>
              <p className="text-slate-600 mb-6">
                {submitError}
              </p>
              <button
                onClick={() => setSubmitError(null)}
                className="w-full py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-200 transition-colors"
              >
                Okay, I'll Fix It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CERView;
