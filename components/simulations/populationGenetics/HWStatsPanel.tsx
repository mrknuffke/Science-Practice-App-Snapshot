/**
 * HWStatsPanel: current generation statistics:
 * observed vs. H-W expected genotype frequencies,
 * allele frequencies, mean fitness, and equilibrium badge.
 */

import React from 'react';
import { HWState, HWParams, GENOTYPE_BG, Genotype } from './hwConstants';
import { calcHWExpected, calcMeanFitness } from './hwEngine';

interface HWStatsPanelProps {
  state: HWState;
  params: HWParams;
}

const GENOTYPES: Genotype[] = ['AA', 'Aa', 'aa'];

const HWStatsPanel: React.FC<HWStatsPanelProps> = ({ state, params }) => {
  const { p, q, genotypeFreqs, individuals, generation } = state;
  const expected = calcHWExpected(p);
  const meanFitness = calcMeanFitness(genotypeFreqs, params);
  const N = individuals.length;

  // Equilibrium check: all forces off AND observed ≈ expected
  const noForces = !params.selectionEnabled && !params.mutationEnabled && !params.geneFlowEnabled && !params.inbreedingEnabled;
  const isEquilibrium = noForces &&
    Math.abs(genotypeFreqs.AA - expected.AA) < 0.03 &&
    Math.abs(genotypeFreqs.Aa - expected.Aa) < 0.03 &&
    Math.abs(genotypeFreqs.aa - expected.aa) < 0.03;

  const expectedMap: Record<Genotype, number> = {
    AA: expected.AA,
    Aa: expected.Aa,
    aa: expected.aa,
  };

  const observedMap: Record<Genotype, number> = {
    AA: genotypeFreqs.AA,
    Aa: genotypeFreqs.Aa,
    aa: genotypeFreqs.aa,
  };

  const countMap: Record<Genotype, number> = {
    AA: individuals.filter(g => g === 'AA').length,
    Aa: individuals.filter(g => g === 'Aa').length,
    aa: individuals.filter(g => g === 'aa').length,
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black text-slate-700">Generation {generation}</span>
          <span className="text-xs text-slate-400">N = {N}</span>
        </div>
        {generation > 0 && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-black ${
              isEquilibrium
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {isEquilibrium ? 'H-W Equilibrium' : 'Evolving'}
          </span>
        )}
      </div>

      {/* p / q bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-bold text-slate-500">
          <span>A allele (p = {p.toFixed(3)})</span>
          <span>a allele (q = {q.toFixed(3)})</span>
        </div>
        <div className="h-4 rounded-full overflow-hidden flex">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${p * 100}%`, backgroundColor: '#3B82F6' }}
          />
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${q * 100}%`, backgroundColor: '#10B981' }}
          />
        </div>
      </div>

      {/* Genotype table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="text-left py-1 pr-2 font-black">Genotype</th>
              <th className="text-right py-1 pr-2 font-black">Observed</th>
              <th className="text-right py-1 pr-2 font-black">H-W Expected</th>
              <th className="text-right py-1 font-black">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {GENOTYPES.map(g => (
              <tr key={g}>
                <td className="py-1.5 pr-2">
                  <span
                    className={`px-2 py-0.5 rounded-lg font-black ${GENOTYPE_BG[g]}`}
                  >
                    {g}
                  </span>
                </td>
                <td className="py-1.5 pr-2 text-right font-mono text-slate-700">
                  {observedMap[g].toFixed(3)}
                </td>
                <td className="py-1.5 pr-2 text-right font-mono text-slate-400">
                  {expectedMap[g].toFixed(3)}
                </td>
                <td className="py-1.5 text-right font-mono text-slate-700">
                  {countMap[g]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mean fitness (only shown when selection is on) */}
      {params.selectionEnabled && (
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-semibold">Mean fitness (w̄)</span>
          <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg">
            {meanFitness.toFixed(3)}
          </span>
        </div>
      )}
    </div>
  );
};

export default HWStatsPanel;
