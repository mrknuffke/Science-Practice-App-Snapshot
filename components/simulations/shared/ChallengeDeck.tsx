import React, { useState } from 'react';
import { Trophy, ChevronLeft, ChevronRight, Zap, CheckCircle, AlertTriangle, HelpCircle, RotateCcw } from 'lucide-react';

export interface ChallengeDef {
  id: string | number;
  title: string;
  description: string;
  hint?: string;
  /** Tiered hints revealed one at a time, from a nudge to a near-answer. Takes precedence over `hint`. */
  hints?: string[];
  solution?: string;
}

export interface ChallengeDeckProps {
  title?: string;
  challenges: ChallengeDef[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  onVerify: () => { success: boolean; message: string };
  onApplySolution?: () => void;
  /** Failed checks on a challenge before "Load Solution" unlocks. 0 keeps it always available. */
  solutionUnlockAfter?: number;
  children?: React.ReactNode;
  accentGradient?: string;
  className?: string;
}

export const ChallengeDeck: React.FC<ChallengeDeckProps> = ({
  title = 'Challenge Deck',
  challenges,
  currentIndex,
  onSelectIndex,
  onVerify,
  onApplySolution,
  solutionUnlockAfter = 0,
  children,
  accentGradient = 'from-amber-500 to-orange-600',
  className = '',
}) => {
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string | number>>(new Set());
  const [failedChecks, setFailedChecks] = useState<Record<string, number>>({});

  const currentChallenge = challenges[currentIndex];
  const hints = currentChallenge?.hints ?? (currentChallenge?.hint ? [currentChallenge.hint] : []);
  const checksLeft = currentChallenge
    ? Math.max(0, solutionUnlockAfter - (failedChecks[String(currentChallenge.id)] ?? 0))
    : 0;
  const solutionLocked = checksLeft > 0 && !completedIds.has(currentChallenge?.id ?? '');

  const handleVerify = () => {
    const res = onVerify();
    setResult(res);
    if (!currentChallenge) return;
    if (res.success) {
      setCompletedIds(prev => new Set(prev).add(currentChallenge.id));
    } else {
      const key = String(currentChallenge.id);
      setFailedChecks(prev => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setResult(null);
      setHintsShown(0);
      onSelectIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < challenges.length - 1) {
      setResult(null);
      setHintsShown(0);
      onSelectIndex(currentIndex + 1);
    }
  };

  const _handleResetCurrent = () => {
    setResult(null);
    setHintsShown(0);
  };

  if (!currentChallenge) return null;

  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-xl bg-gradient-to-r ${accentGradient} text-white shadow-sm`}>
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              {title}
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">
              {completedIds.size} of {challenges.length} Solved
            </span>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            aria-label="Previous challenge"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-slate-600 dark:text-slate-300 px-2">
            {currentIndex + 1} / {challenges.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === challenges.length - 1}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            aria-label="Next challenge"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Challenge Card Content */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
            {currentChallenge.title}
          </h4>
          {completedIds.has(currentChallenge.id) && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Solved
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          {currentChallenge.description}
        </p>

        {/* Custom challenge-specific input/options if provided */}
        {children}

        {/* Hint banner */}
        {hints.slice(0, hintsShown).map((hint, i) => (
          <div key={i} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[11px] uppercase tracking-wider">
                {hints.length > 1 ? `Hint ${i + 1} of ${hints.length}:` : 'Hint:'}
              </strong>
              <span>{hint}</span>
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleVerify}
            className={`flex-1 py-2.5 px-4 bg-gradient-to-r ${accentGradient} text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Verify Solution
          </button>

          {hints.length > 0 && (
            <button
              onClick={() => setHintsShown(prev => (prev >= hints.length ? 0 : prev + 1))}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-bold"
              title={hintsShown >= hints.length ? 'Hide Hints' : hints.length > 1 ? 'Show Next Hint' : 'Show Hint'}
              aria-label={hintsShown >= hints.length ? 'Hide hints' : 'Show next hint'}
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          {onApplySolution && (
            <button
              onClick={onApplySolution}
              disabled={solutionLocked}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all text-xs font-bold"
              title={solutionLocked ? 'Check your answer to unlock the solution' : 'Load Solution into Simulation'}
              aria-label={solutionLocked ? 'Solution locked' : 'Load solution into simulation'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {onApplySolution && solutionLocked && (
          <p className="text-[10px] text-slate-400 font-semibold">
            Solution unlocks after {checksLeft} more {checksLeft === 1 ? 'check' : 'checks'}.
          </p>
        )}

        {/* Feedback result badge */}
        {result && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 shadow-sm border transition-all ${
              result.success
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800 animate-pulse'
            }`}
          >
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="block font-black">{result.success ? 'Challenge complete' : 'Not there yet:'}</span>
              <span className="text-[11px] font-medium leading-relaxed">{result.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeDeck;
