import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { StageCheck } from './carbonJourneyData';

interface StageCheckCardProps {
  check: StageCheck;
  onAnswered: (_correct: boolean) => void;
}

/**
 * One question per stage. Every option gets its own feedback, so a wrong pick
 * explains why it was tempting. A student can keep trying after a miss.
 */
const StageCheckCard: React.FC<StageCheckCardProps> = ({ check, onAnswered }) => {
  const [picked, setPicked] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  const choose = (i: number) => {
    if (solved) return;
    setPicked(i);
    const correct = check.options[i].correct;
    if (correct) setSolved(true);
    onAnswered(correct);
  };

  const chosen = picked === null ? null : check.options[picked];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
      <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Check your thinking</div>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{check.question}</p>
      <div className="space-y-2">
        {check.options.map((o, i) => {
          const isPicked = picked === i;
          const tone = isPicked
            ? o.correct
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
              : 'border-rose-400 bg-rose-50 dark:bg-rose-950/30'
            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50';
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={solved && !isPicked}
              className={`w-full min-h-[44px] text-left p-3 rounded-xl border text-sm transition-colors disabled:opacity-50 flex gap-2 ${tone}`}
              aria-pressed={isPicked}
            >
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{String.fromCharCode(65 + i)}.</span>
              <span className="text-slate-700 dark:text-slate-200">{o.text}</span>
            </button>
          );
        })}
      </div>
      {chosen && (
        <div
          role="status"
          className={`p-3 rounded-xl text-sm flex gap-2 ${
            chosen.correct
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100'
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100'
          }`}
        >
          {chosen.correct ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
          <span>
            {chosen.feedback}
            {!chosen.correct && ' Try another answer.'}
          </span>
        </div>
      )}
    </div>
  );
};

export default StageCheckCard;
