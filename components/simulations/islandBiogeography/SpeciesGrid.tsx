import React from 'react';
import { IslandState, POOL } from './islandEngine';
import { speciesColor } from './IslandMap';

interface SpeciesGridProps {
  state: IslandState;
  flashYears: number;
}

/** "Watch the list": every mainland species, filled when it is on the island now. */
const SpeciesGrid: React.FC<SpeciesGridProps> = ({ state, flashYears }) => {
  const recent = (k: number, kind: 'arrived' | 'lost') => {
    const ev = state.lastEvent[k];
    return ev !== null && ev.kind === kind && state.years - ev.at <= flashYears;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-10 gap-1.5" role="list" aria-label={`${POOL} mainland bird species`}>
        {state.present.map((on, k) => {
          const arrived = on && recent(k, 'arrived');
          const lost = !on && recent(k, 'lost');
          return (
            <div
              key={k}
              role="listitem"
              aria-label={`Species ${k + 1}: ${on ? 'on the island' : 'not on the island'}${arrived ? ', just arrived' : ''}${lost ? ', just lost' : ''}`}
              className={`aspect-square rounded-md flex items-center justify-center text-[11px] font-bold ${
                on ? 'text-white' : 'bg-slate-100 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500'
              } ${arrived ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white dark:ring-offset-slate-800' : ''} ${
                lost ? 'border-2 border-dashed border-slate-500 dark:border-slate-300' : ''
              }`}
              style={on ? { backgroundColor: speciesColor(k) } : undefined}
            >
              {k + 1}
            </div>
          );
        })}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
        <li className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> On the island</li>
        <li className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-600" /> Not on the island</li>
        <li className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm ring-2 ring-slate-900 dark:ring-white" /> Just arrived</li>
        <li className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm border-2 border-dashed border-slate-500 dark:border-slate-300" /> Just died out here</li>
      </ul>
      <p className="text-xs text-slate-600 dark:text-slate-300">
        Since this run began: <strong>{state.arrivals}</strong> arrivals and <strong>{state.losses}</strong> local extinctions.
      </p>
    </div>
  );
};

export default SpeciesGrid;
