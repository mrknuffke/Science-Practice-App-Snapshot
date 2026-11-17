/**
 * PopulationGrid: displays all individuals (up to 1000) grouped by genotype.
 * Icon size scales down as N increases so the full population always fits.
 * Grouped order (AA -> Aa -> aa) makes proportions immediately visible.
 */

import React, { useMemo } from 'react';
import { Genotype, GENOTYPE_COLORS } from './hwConstants';
import CreatureIcon from './CreatureIcon';

interface PopulationGridProps {
  individuals: Genotype[];
}

/** Pick icon size based on population count */
function iconSize(n: number): number {
  if (n <= 50)  return 30;
  if (n <= 100) return 26;
  if (n <= 200) return 22;
  if (n <= 400) return 18;
  if (n <= 600) return 15;
  return 13;
}

/** Gap class based on icon size */
function gapClass(size: number): string {
  if (size >= 26) return 'gap-1';
  if (size >= 18) return 'gap-0.5';
  return 'gap-px';
}

const GENOTYPES: Genotype[] = ['AA', 'Aa', 'aa'];

const PopulationGrid: React.FC<PopulationGridProps> = ({ individuals }) => {
  const counts = useMemo(() => {
    const c = { AA: 0, Aa: 0, aa: 0 };
    for (const g of individuals) c[g]++;
    return c;
  }, [individuals]);

  // Grouped: all AA first, then Aa, then aa
  const grouped = useMemo<Genotype[]>(() => {
    return [
      ...Array(counts.AA).fill('AA'),
      ...Array(counts.Aa).fill('Aa'),
      ...Array(counts.aa).fill('aa'),
    ];
  }, [counts]);

  const N = individuals.length;
  const size = iconSize(N);
  const gap = gapClass(size);

  return (
    <div>
      {/* Legend bar with counts and percentages */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          {GENOTYPES.map(g => (
            <div key={g} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: GENOTYPE_COLORS[g] }}
              />
              <span className="text-xs font-bold text-slate-600">
                {g}
                <span className="ml-1 text-slate-400 font-normal">
                  {counts[g]} ({N > 0 ? ((counts[g] / N) * 100).toFixed(0) : 0}%)
                </span>
              </span>
            </div>
          ))}
        </div>
        <span className="text-[10px] text-slate-400">
          N = {N} · grouped by genotype
        </span>
      </div>

      {/* Proportional frequency bar */}
      <div className="h-2 rounded-full overflow-hidden flex mb-3">
        {GENOTYPES.map(g => (
          counts[g] > 0 && (
            <div
              key={g}
              className="h-full transition-all duration-300"
              style={{ width: `${(counts[g] / N) * 100}%`, backgroundColor: GENOTYPE_COLORS[g] }}
            />
          )
        ))}
      </div>

      {/* Grid of creatures: grouped by genotype */}
      {N === 0 ? (
        <div className="flex items-center justify-center h-32 text-slate-400 text-sm font-medium">
          Population extinct
        </div>
      ) : (
        <div
          className={`flex flex-wrap ${gap} p-2 bg-slate-50 rounded-xl border border-slate-100 min-h-[80px]`}
          role="img"
          aria-label={`Population: ${counts.AA} AA, ${counts.Aa} Aa, ${counts.aa} aa`}
        >
          {grouped.map((genotype, idx) => (
            <div key={idx} className="flex-shrink-0" title={genotype}>
              <CreatureIcon genotype={genotype} size={size} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PopulationGrid;
