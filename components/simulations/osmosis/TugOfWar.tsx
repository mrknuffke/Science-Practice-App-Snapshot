import React from 'react';

interface TugOfWarProps {
  /** Osmotic drive in mm of column. Positive moves water into the bag. */
  osmosisMm: number;
  /** Column drive in mm. Positive moves water into the bag (column below the surface). */
  columnMm: number;
}

const FULL_SCALE_MM = 110;

const Bar: React.FC<{ label: string; value: number; colour: string }> = ({ label, value, colour }) => {
  const pct = Math.min(50, (Math.abs(value) / FULL_SCALE_MM) * 50);
  const into = value > 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span>{label}</span>
        <span className="text-slate-500 dark:text-slate-400">
          {Math.abs(value) < 0.5 ? 'no push' : into ? 'moves water in' : 'moves water out'}
        </span>
      </div>
      <div className="relative h-4 rounded-full bg-slate-100 dark:bg-slate-900/60 overflow-hidden">
        <div className="absolute inset-y-0 left-1/2 w-px bg-slate-400" />
        <div
          className={`absolute inset-y-0 ${colour}`}
          style={into ? { left: '50%', width: `${pct}%` } : { right: '50%', width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

/** Two signed bars: osmosis and column weight. Their sum sets the flow. */
const TugOfWar: React.FC<TugOfWarProps> = ({ osmosisMm, columnMm }) => (
  <div className="space-y-3" aria-label="Tug of war between osmosis and the weight of the column">
    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
      <span>← out of bag</span>
      <span>into bag →</span>
    </div>
    <Bar label="Sugar difference (osmosis)" value={osmosisMm} colour="bg-amber-500" />
    <Bar label="Weight of the column" value={columnMm} colour="bg-sky-500" />
  </div>
);

export default TugOfWar;
