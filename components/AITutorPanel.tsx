
import React, { useState, useEffect } from 'react';
import MermaidDiagram from './MermaidDiagram';
import { getAIExplanation } from '../services/ai/grading';
import { Question, AIExplanation, CourseType } from '../types';

interface AITutorPanelProps {
  course: CourseType;
  question: Question;
  studentAnswer: string;
}

const AITutorPanel: React.FC<AITutorPanelProps> = ({ course, question, studentAnswer }) => {
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useVisuals, setUseVisuals] = useState(false); // User Toggle to save tokens

  useEffect(() => {
    const fetchExplanation = async () => {
      if (!studentAnswer) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Pass useVisuals preference to API
        const data = await getAIExplanation(course, question, studentAnswer, useVisuals);
        setExplanation(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load AI explanation. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [course, question, studentAnswer, useVisuals]); // Re-fetch when toggle changes

  if (!studentAnswer) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-teal-900 text-white rounded-2xl p-6 mt-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-teal-700 rounded-full"></div>
          <div className="h-4 w-32 bg-teal-700 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-teal-700 rounded"></div>
          <div className="h-4 w-5/6 bg-teal-700 rounded"></div>
          <div className="h-4 w-4/6 bg-teal-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 text-rose-800 rounded-2xl p-6 mt-6 border border-rose-200">
        <p className="font-medium">AI Tutor Offline</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 md:p-8 mt-6 border border-slate-700 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      </div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-teal-500 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold tracking-tight">AI Tutor Insights</h3>
        </div>

        {/* Visual Mode Toggle */}
        <button
          onClick={() => setUseVisuals(!useVisuals)}
          className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-2 ${useVisuals
            ? 'bg-teal-900 border-teal-500 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.5)]'
            : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
        >
          <span className={useVisuals ? 'opacity-100' : 'opacity-50'}>Visual Mode</span>
          <div className={`w-3 h-3 rounded-full ${useVisuals ? 'bg-teal-400 animate-pulse' : 'bg-slate-600'}`}></div>
        </button>
      </div>

      <div className="space-y-6 relative z-10">
        <div>
          <h4 className="text-teal-400 font-bold text-xs uppercase tracking-widest mb-2">The Mechanism</h4>
          <p className="text-slate-300 leading-relaxed italic">
            "{explanation?.deepDive}"
          </p>

          {/* Render Mermaid Diagram if present */}
          {explanation?.visualMapping && (
            <div className="mt-6 border border-slate-700 bg-slate-800/50 rounded-xl p-4 overflow-hidden">
              <h4 className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>
                Visual Map
              </h4>
              <div className="bg-white rounded-lg p-2 flex justify-center">
                <MermaidDiagram chart={explanation.visualMapping} />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">Key Concepts</h4>
            <ul className="space-y-2">
              {explanation?.keyConcepts.map((concept, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-teal-500 mt-1">•</span>
                  {concept}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-rose-400 font-bold text-xs uppercase tracking-widest mb-3">Common Pitfall</h4>
            <p className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              {explanation?.commonMisconceptions}
            </p>
          </div>
        </div>

        {/* Factual Accuracy Confidence Self-Assessment Card */}
        {explanation?.certainty && (
          <div className="mt-8 border border-slate-700 bg-slate-800/40 backdrop-blur-sm rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:border-slate-600">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-900/60 p-1.5 rounded-lg border border-indigo-700/55 text-indigo-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  AI Self-Check: Likelihood of Factual Truth
                </h4>
              </div>

              {/* Info Tooltip */}
              <div className="group relative">
                <button className="text-slate-500 hover:text-indigo-400 transition-colors p-0.5 rounded-full" aria-label="Explanation of Factual Truthfulness Levels">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <div className="absolute right-0 bottom-full mb-2 w-72 bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl p-3 shadow-2xl opacity-0 scale-95 origin-bottom-right transition-all duration-200 pointer-events-none group-hover:opacity-100 group-hover:scale-100 z-50">
                  <p className="font-bold text-slate-100 mb-1.5">Factual Truthfulness Scale</p>
                  <ul className="space-y-1.5 text-[10px] leading-relaxed">
                    <li><strong className="text-emerald-400">5/5 Extremely Confident:</strong> Telling the truth; settled scientific facts, zero hallucination risk.</li>
                    <li><strong className="text-teal-400">4/5 Highly Confident:</strong> Standard consensus models, highly likely factually accurate.</li>
                    <li><strong className="text-indigo-400">3/5 Moderately Confident:</strong> Conceptually sound, phrasing could have minor variance.</li>
                    <li><strong className="text-amber-400">2/5 Slightly Uncertain:</strong> Complex synthesis; potential for minor terminology gaps.</li>
                    <li><strong className="text-rose-400">1/5 High Uncertainty:</strong> Speculative frontier; higher risk of hallucinated facts.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Segmented Meter */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 mb-4 relative z-10">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className={`text-sm font-black uppercase tracking-wider ${
                  explanation.certainty.level >= 5 ? 'text-emerald-400' :
                  explanation.certainty.level === 4 ? 'text-teal-400' :
                  explanation.certainty.level === 3 ? 'text-indigo-400' :
                  explanation.certainty.level === 2 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {explanation.certainty.level >= 5 ? 'Extremely Confident' :
                   explanation.certainty.level === 4 ? 'Highly Confident' :
                   explanation.certainty.level === 3 ? 'Moderately Confident' :
                   explanation.certainty.level === 2 ? 'Slightly Uncertain' : 'High Uncertainty / Speculative'}
                </span>
                <span className="text-xs font-black text-slate-500">{explanation.certainty.level}/5 Truthfulness Rating</span>
              </div>

              <div className="flex gap-1.5 h-2 w-full mb-3">
                {[1, 2, 3, 4, 5].map((index) => {
                  const isActive = index <= explanation.certainty!.level;
                  const activeColor = 
                    explanation.certainty!.level >= 5 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.35)]' :
                    explanation.certainty!.level === 4 ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.35)]' :
                    explanation.certainty!.level === 3 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.35)]' :
                    explanation.certainty!.level === 2 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.35)]' :
                    'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.35)]';
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex-1 h-full rounded-full transition-all duration-500 ${
                        isActive ? activeColor : 'bg-slate-700/60'
                      }`}
                    />
                  );
                })}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed italic">
                "{
                  explanation.certainty.level >= 5 ? 'Factual certainty; settled scientific consensus, double-verified by internal benchmarks.' :
                  explanation.certainty.level === 4 ? 'Strong consensus, standard scientific model, very low risk of error.' :
                  explanation.certainty.level === 3 ? 'Conceptually sound, but specific terminology or phrasing could have minor variance.' :
                  explanation.certainty.level === 2 ? 'Frontier concept or complex synthesis; some risk of simplified modeling or minor gaps.' :
                  'Complex custom query or highly speculative scientific frontier; moderate hallucination risk.'
                }"
              </p>
            </div>

            {/* Assessment Factors */}
            {explanation.certainty.factors && explanation.certainty.factors.length > 0 && (
              <div className="relative z-10">
                <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Contributing Factors Assessed</h5>
                <div className="flex flex-wrap gap-2">
                  {explanation.certainty.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-slate-900/40 border border-slate-700/45 px-2.5 py-1 rounded-lg text-slate-400 text-[10px] font-medium leading-none">
                      <div className={`w-1 h-1 rounded-full ${
                        explanation.certainty!.level >= 5 ? 'bg-emerald-400' :
                        explanation.certainty!.level === 4 ? 'bg-teal-400' :
                        explanation.certainty!.level === 3 ? 'bg-indigo-400' :
                        explanation.certainty!.level === 2 ? 'bg-amber-400' : 'bg-rose-400'
                      }`} />
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AITutorPanel;
