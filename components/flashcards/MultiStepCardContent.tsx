import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Flashcard, MultiStepItem } from '../../types';
import { TTSButton } from '../TTSButton';
import {
  ChevronRight,
  Eye,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';

interface MultiStepCardContentProps {
  card: Flashcard;
  isFlipped: boolean;
  onComplete?: () => void;
}

export const MultiStepCardContent: React.FC<MultiStepCardContentProps> = ({
  card,
  isFlipped,
  onComplete,
}) => {
  // 1. Resolve steps from explicit array or fallback parse
  const steps: MultiStepItem[] = useMemo(() => {
    if (card.multiStepSteps && card.multiStepSteps.length > 0) {
      return card.multiStepSteps;
    }

    // Fallback: parse numbered lines or bullet points from definition
    const lines = (card.definition || '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsed: MultiStepItem[] = [];
    lines.forEach((line, idx) => {
      const match = line.match(/^(\d+)[.)]\s*(.*)$/);
      if (match) {
        parsed.push({
          stepNumber: parseInt(match[1], 10),
          title: `Step ${match[1]}`,
          description: match[2],
        });
      } else {
        parsed.push({
          stepNumber: idx + 1,
          title: `Stage ${idx + 1}`,
          description: line,
        });
      }
    });

    if (parsed.length >= 2) {
      return parsed;
    }

    // Default 2-step breakdown if single paragraph
    return [
      {
        stepNumber: 1,
        title: 'Initial Stage & Trigger',
        description: card.term,
      },
      {
        stepNumber: 2,
        title: 'Downstream Mechanism & Outcome',
        description: card.definition,
      },
    ];
  }, [card]);

  // Revealed steps counter (1 step initially visible)
  const [revealedCount, setRevealedCount] = useState<number>(1);

  // Sync with card flips: if flipped to back, reveal all steps
  useEffect(() => {
    if (isFlipped) {
      setRevealedCount(steps.length);
    }
  }, [isFlipped, steps.length]);

  // Reset when card changes
  useEffect(() => {
    setRevealedCount(1);
  }, [card.id]);

  const handleRevealNext = useCallback(() => {
    setRevealedCount((prev) => {
      const next = Math.min(steps.length, prev + 1);
      if (next === steps.length && onComplete) {
        onComplete();
      }
      return next;
    });
  }, [steps.length, onComplete]);

  const handleRevealAll = useCallback(() => {
    setRevealedCount(steps.length);
    if (onComplete) onComplete();
  }, [steps.length, onComplete]);

  const handleReset = useCallback(() => {
    setRevealedCount(1);
  }, []);

  // Keyboard navigation: Space or Down Arrow reveals next step
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space' || e.code === 'ArrowDown') {
        if (revealedCount < steps.length) {
          e.preventDefault();
          handleRevealNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealedCount, steps.length, handleRevealNext]);

  const progressPercent = Math.round((revealedCount / steps.length) * 100);
  const isFullyRevealed = revealedCount >= steps.length;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full flex flex-col gap-4 text-left max-w-2xl mx-auto"
    >
      {/* Progress Header */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
            <Layers className="w-4 h-4" />
            Sequential Pathway Recall
          </span>
          <span>
            Stage <strong className="text-slate-900 dark:text-white">{revealedCount}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{steps.length}</strong> revealed
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isRevealed = idx < revealedCount;
          const isCurrentTarget = idx === revealedCount;

          return (
            <div
              key={step.stepNumber}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                isRevealed
                  ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800/60 shadow-sm'
                  : isCurrentTarget
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-dashed border-amber-300 dark:border-amber-700/60'
                  : 'bg-slate-50/50 dark:bg-slate-850/30 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      isRevealed
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isCurrentTarget
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {step.stepNumber}
                  </span>
                  <h4
                    className={`text-sm font-bold ${
                      isRevealed
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step.title}
                  </h4>
                </div>

                {isRevealed && (
                  <div className="shrink-0">
                    <TTSButton
                      text={`${step.title}. ${step.description}`}
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    />
                  </div>
                )}
              </div>

              {/* Step Description */}
              {isRevealed ? (
                <p className="mt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-9">
                  {step.description}
                </p>
              ) : isCurrentTarget ? (
                <div className="mt-2 pl-9 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Next: Recall what triggers or happens in this stage!</span>
                </div>
              ) : (
                <div className="mt-2 pl-9 text-[11px] text-slate-400 italic">
                  Step {step.stepNumber} hidden
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Control Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {!isFullyRevealed ? (
          <>
            <button
              onClick={handleRevealNext}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <ChevronRight className="w-4 h-4" />
              <span>Reveal Step {revealedCount + 1}</span>
              <span className="text-[10px] opacity-75 font-mono ml-1 hidden sm:inline">[Space]</span>
            </button>
            <button
              onClick={handleRevealAll}
              className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Reveal All</span>
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 p-3 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All {steps.length} stages revealed! Test your recall again.</span>
            </div>
            <button
              onClick={handleReset}
              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Pathway</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiStepCardContent;
