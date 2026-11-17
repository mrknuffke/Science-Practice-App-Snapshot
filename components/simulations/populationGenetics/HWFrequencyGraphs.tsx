/**
 * HWFrequencyGraphs: two toggleable Recharts line graphs:
 * 1. Allele frequency over time (p and q)
 * 2. Genotype frequency over time (AA, Aa, aa) with H-W expected dashed lines
 */

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { HistoryPoint } from './hwConstants';
import { GENOTYPE_COLORS } from './hwConstants';

interface HWFrequencyGraphsProps {
  history: HistoryPoint[];
  showAlleleGraph: boolean;
  showGenotypeGraph: boolean;
}

const tickStyle = { fontSize: 10, fill: '#64748b' };

const HWFrequencyGraphs: React.FC<HWFrequencyGraphsProps> = ({
  history,
  showAlleleGraph,
  showGenotypeGraph,
}) => {
  // Downsample history for performance if very long
  const data = history.length > 200 ? history.filter((_, i) => i % Math.ceil(history.length / 200) === 0) : history;

  if (!showAlleleGraph && !showGenotypeGraph) return null;

  return (
    <div className="space-y-4">
      {/* ── Allele Frequency Graph ── */}
      {showAlleleGraph && (
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
            Allele Frequency Over Time
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="generation"
                tick={tickStyle}
                label={{ value: 'Generation', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#94a3b8' }}
                height={30}
              />
              <YAxis domain={[0, 1]} tick={tickStyle} tickFormatter={v => v.toFixed(1)} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
                formatter={(value: number | string | undefined) => [typeof value === 'number' ? value.toFixed(3) : String(value ?? '')]}
                labelFormatter={l => `Gen ${l}`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="p"
                name="p (freq. A)"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="q"
                name="q (freq. a)"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Genotype Frequency Graph ── */}
      {showGenotypeGraph && (
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
            Genotype Frequency Over Time
            <span className="ml-2 text-slate-400 normal-case font-normal">(dashed = H-W expected)</span>
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="generation"
                tick={tickStyle}
                label={{ value: 'Generation', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#94a3b8' }}
                height={30}
              />
              <YAxis domain={[0, 1]} tick={tickStyle} tickFormatter={v => v.toFixed(1)} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
                formatter={(value: number | string | undefined) => [typeof value === 'number' ? value.toFixed(3) : String(value ?? '')]}
                labelFormatter={l => `Gen ${l}`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />

              {/* Observed genotype frequencies: solid lines */}
              <Line type="monotone" dataKey="AA" name="AA (obs)" stroke={GENOTYPE_COLORS.AA} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="Aa" name="Aa (obs)" stroke={GENOTYPE_COLORS.Aa} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="aa" name="aa (obs)" stroke={GENOTYPE_COLORS.aa} strokeWidth={2} dot={false} isAnimationActive={false} />

              {/* H-W expected: dashed lines, same colors */}
              <Line type="monotone" dataKey="expectedAA" name="AA (H-W)" stroke={GENOTYPE_COLORS.AA} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="expectedAa" name="Aa (H-W)" stroke={GENOTYPE_COLORS.Aa} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="expectedaa" name="aa (H-W)" stroke={GENOTYPE_COLORS.aa} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default HWFrequencyGraphs;
