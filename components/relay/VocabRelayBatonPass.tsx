import React, { useEffect } from 'react';
import { RelayTeam } from './relayTypes';
import { playBatonPassSound } from './relayAudio';
import { Sparkles, Play, ShieldCheck, ArrowRight } from 'lucide-react';

interface VocabRelayBatonPassProps {
  incomingRunnerName: string;
  nextRunnerName: string;
  team: RelayTeam;
  lap: number;
  totalLaps: number;
  legPoints: number;
  cleanLegBonus: number;
  termsAnswered: number;
  onReady: () => void;
}

export const VocabRelayBatonPass: React.FC<VocabRelayBatonPassProps> = ({
  incomingRunnerName,
  nextRunnerName,
  team,
  lap,
  totalLaps,
  legPoints,
  cleanLegBonus,
  termsAnswered,
  onReady,
}) => {
  useEffect(() => {
    playBatonPassSound();
  }, []);

  // Keyboard shortcut: Space or Enter triggers onReady
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        onReady();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onReady]);

  const totalLegPoints = legPoints + cleanLegBonus;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-6 px-4">
      <div className="w-full bg-white dark:bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Baton Icon Badge */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-600 p-1 shadow-lg shadow-indigo-500/30 mb-6 animate-pulse">
          <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-3xl sm:text-4xl">
            🏃💨
          </div>
        </div>

        {/* Title */}
        <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-2">
          {team.name} • Lap {lap} of {totalLaps}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          BATON PASS!
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-md mb-6">
          Great leg, <strong className="text-indigo-600 dark:text-indigo-400">{incomingRunnerName}</strong>! Hand the device to your next runner now:
        </p>

        {/* Next Runner Spotlight Card */}
        <div className="w-full max-w-md bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/80 border-2 border-indigo-300 dark:border-indigo-700 rounded-2xl p-5 mb-6 shadow-inner flex items-center justify-between">
          <div className="text-left">
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Next Runner Up
            </div>
            <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <span>{nextRunnerName}</span>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <ArrowRight className="w-6 h-6" />
          </div>
        </div>

        {/* Previous Leg Breakdown */}
        <div className="w-full max-w-md bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-8 text-left">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
            Leg Summary ({incomingRunnerName})
          </div>
          <div className="flex justify-between items-center py-1 text-sm border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-400">Terms Completed:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              {termsAnswered}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 text-sm border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-400">Base Leg Points:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              +{legPoints.toLocaleString()}
            </span>
          </div>
          {cleanLegBonus > 0 && (
            <div className="flex justify-between items-center py-1 text-sm text-emerald-600 dark:text-emerald-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Clean Leg Bonus (0 Passes!):
              </span>
              <span className="font-bold font-mono">+{cleanLegBonus.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 text-base font-extrabold text-slate-900 dark:text-white">
            <span>Leg Total:</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-mono">
              +{totalLegPoints.toLocaleString()} pts
            </span>
          </div>
        </div>

        {/* Ready Action Button */}
        <button
          onClick={onReady}
          className="w-full max-w-md py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-black text-lg shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center gap-3 group"
          aria-label="I have the baton, ready to start turn"
        >
          <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
          <span>I HAVE THE BATON - START!</span>
        </button>
        <span className="text-xs text-slate-400 mt-2 font-mono hidden sm:inline">
          Press [Space] or [Enter] when ready
        </span>
      </div>
    </div>
  );
};

export default VocabRelayBatonPass;
