import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  RelayCard,
  RelayTeam,
  RelayAnsweringModality,
} from './relayTypes';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface VocabRelayCardProps {
  card: RelayCard;
  allCardsInDeck?: RelayCard[];
  modality: RelayAnsweringModality;
  team: RelayTeam;
  runnerName: string;
  currentTermIndex: number;
  totalTermsInLeg: number;
  lap: number;
  totalLaps: number;
  secondsRemaining: number;
  maxTurnSeconds: number;
  streak: number;
  onCorrect: () => void;
  onPass: () => void;
}

const TEAM_COLOR_STYLES: Record<
  RelayTeam['color'],
  { badge: string; border: string; bar: string }
> = {
  indigo: {
    badge: 'bg-indigo-600 text-white',
    border: 'border-indigo-400 dark:border-indigo-600',
    bar: 'bg-indigo-500',
  },
  rose: {
    badge: 'bg-rose-600 text-white',
    border: 'border-rose-400 dark:border-rose-600',
    bar: 'bg-rose-500',
  },
  emerald: {
    badge: 'bg-emerald-600 text-white',
    border: 'border-emerald-400 dark:border-emerald-600',
    bar: 'bg-emerald-500',
  },
  amber: {
    badge: 'bg-amber-600 text-white',
    border: 'border-amber-400 dark:border-amber-600',
    bar: 'bg-amber-500',
  },
  cyan: {
    badge: 'bg-cyan-600 text-white',
    border: 'border-cyan-400 dark:border-cyan-600',
    bar: 'bg-cyan-500',
  },
  violet: {
    badge: 'bg-violet-600 text-white',
    border: 'border-violet-400 dark:border-violet-600',
    bar: 'bg-violet-500',
  },
};

export const VocabRelayCard: React.FC<VocabRelayCardProps> = ({
  card,
  allCardsInDeck = [],
  modality,
  team,
  runnerName,
  currentTermIndex,
  totalTermsInLeg,
  lap,
  totalLaps,
  secondsRemaining,
  maxTurnSeconds,
  streak,
  onCorrect,
  onPass,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'wrong'>('idle');

  // Compute 4 options if rapid_choice
  const options = useMemo(() => {
    if (modality !== 'rapid_choice') return [];
    if (card.options && card.options.length >= 4) {
      // Shuffle options deterministically for this card
      return [...card.options].sort(() => 0.5 - Math.random());
    }
    // Fallback: pick 3 distractors from deck
    const distractors = allCardsInDeck
      .filter((c) => c.term !== card.term)
      .map((c) => c.term);
    const shuffledDistractors = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 3);
    const combined = [card.term, ...shuffledDistractors];
    return combined.sort(() => 0.5 - Math.random());
  }, [card, modality, allCardsInDeck]);

  // Reset local state when card changes
  useEffect(() => {
    setSelectedOption(null);
    setFeedbackState('idle');
  }, [card.id]);

  const handleChooseOption = useCallback(
    (chosen: string) => {
      setSelectedOption(chosen);
      if (chosen === card.term) {
        onCorrect();
      } else {
        setFeedbackState('wrong');
        setTimeout(() => {
          onPass();
        }, 350);
      }
    },
    [card.term, onCorrect, onPass]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (modality === 'caller_guesser') {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          onCorrect();
        } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          e.preventDefault();
          onPass();
        }
      } else if (modality === 'rapid_choice') {
        if (['1', '2', '3', '4'].includes(e.key)) {
          e.preventDefault();
          const idx = parseInt(e.key, 10) - 1;
          if (options[idx]) {
            handleChooseOption(options[idx]);
          }
        } else if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          const letterMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
          const idx = letterMap[e.key.toLowerCase()];
          if (options[idx]) {
            handleChooseOption(options[idx]);
          }
        } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          e.preventDefault();
          onPass();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modality, options, onCorrect, onPass, handleChooseOption]);

  const timerFraction = Math.max(0, secondsRemaining / maxTurnSeconds);
  const timerPercentage = Math.round(timerFraction * 100);

  const timerColor =
    secondsRemaining <= 5
      ? 'bg-rose-500 animate-pulse'
      : secondsRemaining <= 10
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  const teamTheme = TEAM_COLOR_STYLES[team.color] || TEAM_COLOR_STYLES.indigo;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      {/* Top Runner HUD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${teamTheme.badge}`}
          >
            {team.name}
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>Runner:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {runnerName}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Lap {lap} of {totalLaps} • Term {currentTermIndex + 1} of {totalTermsInLeg}
            </div>
          </div>
        </div>

        {/* Streak & Score Counter */}
        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-full text-amber-700 dark:text-amber-300 text-xs font-bold animate-bounce">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{streak} Streak! (+{streak >= 5 ? '20%' : '10%'})</span>
            </div>
          )}
          <div className="text-right">
            <div className="text-xs uppercase text-slate-400 font-bold tracking-wider">Score</div>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
              {team.score.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Timer Bar */}
      <div className="bg-slate-100 dark:bg-slate-800/80 rounded-full h-3 w-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-300 ${timerColor}`}
          style={{ width: `${timerPercentage}%` }}
        />
      </div>
      <div className="flex justify-between items-center px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Time Remaining:
        </span>
        <span
          className={`font-mono font-bold text-sm ${
            secondsRemaining <= 5 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'
          }`}
        >
          {secondsRemaining}s
        </span>
      </div>

      {/* Main Flash / Relay Card */}
      <div
        className={`bg-white dark:bg-slate-900 border-2 ${teamTheme.border} rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col gap-6 transition-transform ${
          feedbackState === 'wrong' ? 'animate-shake' : ''
        }`}
      >
        {/* Card Header Category */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider">
            {card.category}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Standard AP Curriculum
          </span>
        </div>

        {/* Term / Prompt Display */}
        {modality === 'caller_guesser' ? (
          <div>
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
              Target Term (Call this out or describe without taboo words):
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {card.term}
            </h2>
            {card.formulaOrEquation && (
              <div className="mt-2 inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg font-mono text-xs text-indigo-700 dark:text-indigo-300">
                Formula: {card.formulaOrEquation}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              Identify the Scientific Term Matching This Definition:
            </div>
            <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              {card.definition}
            </p>
            {card.formulaOrEquation && (
              <div className="mt-2 inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg font-mono text-xs text-indigo-700 dark:text-indigo-300">
                Formula: {card.formulaOrEquation}
              </div>
            )}
          </div>
        )}

        {/* Clue Keywords and Taboo Forbidden Words (Caller Guesser Mode) */}
        {modality === 'caller_guesser' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Taboo Forbidden Words */}
            <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Taboo (Do NOT Say):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {card.tabooWords.map((word, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-xs font-bold rounded-lg border border-rose-300 dark:border-rose-700"
                  >
                    🚫 {word}
                  </span>
                ))}
              </div>
            </div>

            {/* Clue Keywords */}
            <div className="bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-sky-500" />
                <span>Helpful Concepts:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {card.clueKeywords.map((word, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 text-xs font-medium rounded-lg border border-sky-300 dark:border-sky-700"
                  >
                    💡 {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rapid 4-Choice Selection Grid */}
        {modality === 'rapid_choice' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOption === opt;
              const isWrong = isSelected && opt !== card.term;

              let btnClasses =
                'flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all font-semibold ';
              if (isWrong) {
                btnClasses += 'border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-100';
              } else if (isSelected) {
                btnClasses += 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100';
              } else {
                btnClasses +=
                  'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-700/80 hover:shadow-md';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleChooseOption(opt)}
                  className={btnClasses}
                  aria-label={`Option ${letter}: ${opt}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                      {letter}
                    </span>
                    <span className="text-sm sm:text-base">{opt}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">[{idx + 1}]</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {modality === 'caller_guesser' ? (
            <>
              <button
                onClick={onCorrect}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-lg shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group"
                aria-label="Got it right, award points"
              >
                <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>GOT IT! (+Points)</span>
                <span className="text-xs bg-emerald-700 px-2 py-0.5 rounded text-emerald-100 font-mono ml-2 hidden sm:inline">
                  [Space / Enter]
                </span>
              </button>

              <button
                onClick={onPass}
                className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-all flex items-center justify-center gap-2"
                aria-label="Pass to next term"
              >
                <XCircle className="w-5 h-5 text-slate-400" />
                <span>PASS</span>
                <span className="text-xs text-slate-400 font-mono ml-1 hidden sm:inline">[P]</span>
              </button>
            </>
          ) : (
            <button
              onClick={onPass}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              aria-label="Skip / Pass this question"
            >
              <XCircle className="w-4 h-4 text-slate-400" />
              <span>Pass Question (No Penalty)</span>
              <span className="text-xs text-slate-400 font-mono ml-1 hidden sm:inline">[P / Esc]</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabRelayCard;
