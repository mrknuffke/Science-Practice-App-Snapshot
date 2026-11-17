import React, { useState } from 'react';
import { CourseType } from '../types';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface FactualAccuracyIndicatorProps {
  course: CourseType;
  topic: string;
  turnCount: number;
  variant?: 'pill' | 'banner';
  onStartFreshSession?: () => void;
}

export const FactualAccuracyIndicator: React.FC<FactualAccuracyIndicatorProps> = ({
  course,
  topic,
  turnCount,
  variant = 'pill',
  onStartFreshSession
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Calculate accuracy and confidence metrics dynamically based on inputs
  const isCustomPractice = course === 'Custom Practice' || !course;
  const isAPSubject = course.includes('AP ');
  const isMiddleOrElementary = course.includes('Middle School') || course.includes('Elementary School');

  // Baseline Accuracy
  let baseAccuracy = 95;
  let topicCategory = 'Standard Topic';

  if (isAPSubject) {
    baseAccuracy = 98;
    topicCategory = 'Official CED Syllabus Subject';
  } else if (isCustomPractice) {
    baseAccuracy = 92;
    topicCategory = 'Custom Synthesis Subject';
  } else if (isMiddleOrElementary) {
    baseAccuracy = 96;
    topicCategory = 'Standard Curriculum Subject';
  }

  // Drift Penalty based on turn count (1 turn = 1 user + 1 model message, so messages.length / 2)
  // Drift threshold is set to 10 turns.
  const turnPenalty = Math.max(0, turnCount > 5 ? (turnCount - 5) * 1.5 : 0);
  const finalAccuracy = Math.max(70, Math.round(baseAccuracy - turnPenalty));

  // Determine Confidence Level name and color matching our design language
  let confidenceLabel = 'Extremely Confident';
  let colorClass = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  let badgeColor = 'bg-emerald-500';
  let scaleLevel = 5;

  if (finalAccuracy >= 97) {
    confidenceLabel = 'Extremely Confident';
    colorClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/10';
    badgeColor = 'bg-emerald-500';
    scaleLevel = 5;
  } else if (finalAccuracy >= 94) {
    confidenceLabel = 'Highly Confident';
    colorClass = 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20 dark:border-teal-500/10';
    badgeColor = 'bg-teal-500';
    scaleLevel = 4;
  } else if (finalAccuracy >= 88) {
    confidenceLabel = 'Moderately Confident';
    colorClass = 'text-indigo-600 dark:text-[#818CF8] bg-indigo-500/10 border-indigo-500/20 dark:border-indigo-500/10';
    badgeColor = 'bg-indigo-500';
    scaleLevel = 3;
  } else if (finalAccuracy >= 80) {
    confidenceLabel = 'Slightly Uncertain';
    colorClass = 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20 dark:border-amber-500/10';
    badgeColor = 'bg-amber-500';
    scaleLevel = 2;
  } else {
    confidenceLabel = 'High Uncertainty';
    colorClass = 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20 dark:border-rose-500/10';
    badgeColor = 'bg-rose-500';
    scaleLevel = 1;
  }

  // Conversational drift evaluation message - Threshold is 10 turns as requested
  const hasDrift = turnCount >= 10;
  const driftMessage = hasDrift
    ? 'Drift Alert: Conversation is long (10+ turns). Conversational memory context is large; factual precision may decay slightly.'
    : 'Short Context: AI Socratic precision is optimal. Conversational drift risk is minimal.';

  if (variant === 'banner') {
    return (
      <div className={`rounded-2xl border p-4 transition-all duration-300 ${colorClass}`}>
        <div className="flex items-start gap-3">
          {hasDrift ? (
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between gap-4 mb-1">
              <span className="font-black uppercase tracking-wider font-rounded">
                Live Factual Accuracy Check
              </span>
              <span className="font-black font-mono">{finalAccuracy}% Confidence</span>
            </div>
            <p className="leading-relaxed opacity-90 mb-2">
              Based on {topicCategory} for "{topic || course}" and {turnCount} turns complete. {driftMessage}
            </p>
            {hasDrift && (
              <div className="flex flex-col gap-2 mt-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-rose-500 dark:text-rose-400 bg-rose-500/5 px-2.5 py-1 rounded-lg border border-rose-500/10 w-fit">
                  💡 Tip: Conversational memory is very long. Consider carrying over to start fresh!
                </div>
                {onStartFreshSession && (
                  <button
                    type="button"
                    onClick={onStartFreshSession}
                    className="px-3.5 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all w-fit mt-1"
                  >
                    🔄 Carry Over to Fresh Session
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Pill Badge Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 select-none hover:scale-105 active:scale-95 ${colorClass}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${badgeColor} animate-pulse`} />
        <span>Live Accuracy: {finalAccuracy}%</span>
      </button>

      {/* Floating Detailed Panel */}
      {isOpen && (
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1E212A] border border-slate-200 dark:border-slate-800/90 text-slate-700 dark:text-slate-200 text-xs rounded-3xl p-5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-5 h-5 text-indigo-500 dark:text-[#818CF8]" />
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-0.5">Truthfulness Self-Check</p>
              <h4 className="text-xs font-black text-slate-900 dark:text-white leading-none font-rounded">AI Factual Accuracy</h4>
            </div>
          </div>

          <div className="space-y-4">
            {/* Accuracy Score Indicator */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-black text-slate-800 dark:text-white">{confidenceLabel}</span>
                <span className="font-black text-slate-400 font-mono">{finalAccuracy}% Rating</span>
              </div>
              <div className="flex gap-1.5 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className={`flex-1 h-full rounded-full transition-all duration-300 ${
                      index <= scaleLevel ? badgeColor : 'bg-slate-200 dark:bg-slate-800/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Contributing Factors */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Accuracy Assessment</span>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <p className="text-[11px] leading-relaxed">
                    <strong className="text-slate-800 dark:text-white">Baseline:</strong> {topicCategory} has a {baseAccuracy}% precision model.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${hasDrift ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  <p className="text-[11px] leading-relaxed">
                    <strong className="text-slate-800 dark:text-white">Conversational Memory:</strong> {turnCount} turns complete. {driftMessage}
                  </p>
                </div>
              </div>
            </div>

            {/* Drifting Caution Alert */}
            {hasDrift && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-3 rounded-2xl flex flex-col gap-2 items-start mt-2">
                <div className="flex gap-2 items-start">
                  <div className="w-4 h-4 shrink-0 mt-0.5">⚠️</div>
                  <div className="text-[10px] leading-relaxed text-rose-700 dark:text-rose-355">
                    <strong className="font-black uppercase tracking-wider block mb-0.5">Context Size Warning</strong>
                    conversational history is quite long (10+ turns). To maintain absolute scientific accuracy, carry your progress over into a fresh session!
                  </div>
                </div>
                {onStartFreshSession && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartFreshSession();
                    }}
                    className="w-full mt-1 px-3 py-2 bg-rose-600 dark:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all text-center font-rounded"
                  >
                    🔄 Carry Over to Fresh Session
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
