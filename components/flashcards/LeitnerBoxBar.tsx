import React from 'react';
import { LeitnerStats } from './types';

interface LeitnerBoxBarProps {
  stats: LeitnerStats;
  className?: string;
}

interface BoxMeta {
  box: 1 | 2 | 3 | 4 | 5;
  label: string;
  interval: string;
  count: number;
  bg: string;
  text: string;
  border: string;
}

export const LeitnerBoxBar: React.FC<LeitnerBoxBarProps> = ({ stats, className = '' }) => {
  const boxes: BoxMeta[] = [
    { box: 1, label: 'Learning', interval: 'Daily', count: stats.box1, bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
    { box: 2, label: 'Familiar', interval: '3 Days', count: stats.box2, bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
    { box: 3, label: 'Competent', interval: '7 Days', count: stats.box3, bg: 'bg-sky-50 dark:bg-sky-950/30', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800' },
    { box: 4, label: 'Proficient', interval: '14 Days', count: stats.box4, bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
    { box: 5, label: 'Mastered', interval: '30 Days', count: stats.box5, bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  ];

  return (
    <div className={`w-full max-w-2xl mx-auto bg-white dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Leitner SRS Memory Engine
          </span>
          {stats.dueCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
              {stats.dueCount} Due
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-slate-700 dark:text-slate-200">
            {stats.masteredPercentage}%
          </span>
          <span className="text-[10px] font-medium text-slate-400 ml-1">Mastery</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {boxes.map(b => (
          <div
            key={b.box}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border ${b.border} ${b.bg} transition-all duration-300 relative group`}
            title={`Box ${b.box} (${b.label}) • Next review: ${b.interval} • ${b.count} cards`}
          >
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight text-slate-400 dark:text-slate-500">
              <span>B{b.box}</span>
              <span className="hidden sm:inline font-normal text-[9px]">({b.interval})</span>
            </div>
            <div className={`text-base sm:text-lg font-black ${b.text}`}>
              {b.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
