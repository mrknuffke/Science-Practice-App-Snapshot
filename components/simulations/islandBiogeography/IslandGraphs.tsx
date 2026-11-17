import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { POOL, arrivalRate, equilibrium, extinctionRate } from './islandEngine';

const AXIS = { fontSize: 10, fill: '#94a3b8' };
const LABEL = { fill: '#94a3b8', fontSize: 11 };

interface CountGraphProps {
  current: Array<{ t: number; s: number }>;
  previous: Array<{ t: number; s: number }> | null;
  previousLabel: string | null;
}

/** Species on the island over time. The last run stays as a dashed line. */
export const CountGraph: React.FC<CountGraphProps> = ({ current, previous, previousLabel }) => {
  const maxT = Math.max(100, ...current.map(p => p.t), ...(previous ?? []).map(p => p.t));
  const minT = Math.min(0, ...current.map(p => p.t));
  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis type="number" dataKey="t" domain={[minT, Math.ceil(maxT / 50) * 50]} tick={AXIS}
            label={{ value: 'Years', position: 'insideBottom', offset: -4, ...LABEL }} />
          <YAxis type="number" domain={[0, POOL]} tick={AXIS}
            label={{ value: 'Bird species', angle: -90, position: 'insideLeft', ...LABEL }} />
          <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
          {previous && previous.length > 1 && (
            <Line data={previous} dataKey="s" name={previousLabel ?? 'Last run'} stroke="#94a3b8" strokeWidth={2}
              strokeDasharray="5 4" dot={false} isAnimationActive={false} />
          )}
          <Line data={current} dataKey="s" name="This run" stroke="#059669" strokeWidth={3} dot={false} isAnimationActive={false} type="stepAfter" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface RateCurvesProps {
  area: number;
  distance: number;
  current: number;
}

/**
 * MacArthur and Wilson's graph: arrivals fall as the island fills (fewer
 * mainland species are left to arrive), losses rise (more species are there
 * to die out). The count settles where the two lines cross.
 */
export const RateCurves: React.FC<RateCurvesProps> = ({ area, distance, current }) => {
  const i = arrivalRate(distance);
  const e = extinctionRate(area);
  const data = Array.from({ length: POOL + 1 }, (_, s) => ({
    s,
    arrive: Number((i * (POOL - s)).toFixed(3)),
    lose: Number((e * s).toFixed(3)),
  }));
  const settle = equilibrium(area, distance);
  const top = Math.max(...data.map(d => Math.max(d.arrive, d.lose)));
  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis type="number" dataKey="s" domain={[0, POOL]} tick={AXIS}
            label={{ value: 'Bird species on the island', position: 'insideBottom', offset: -4, ...LABEL }} />
          <YAxis type="number" domain={[0, Math.ceil(top * 1.1 * 10) / 10]} tick={AXIS}
            label={{ value: 'Species per year', angle: -90, position: 'insideLeft', ...LABEL }} />
          <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
          <Line dataKey="arrive" name="New species arriving" stroke="#0284c7" strokeWidth={3} dot={false} isAnimationActive={false} />
          <Line dataKey="lose" name="Species dying out" stroke="#d97706" strokeWidth={3} dot={false} isAnimationActive={false} />
          <ReferenceLine x={Number(settle.toFixed(1))} stroke="#059669" strokeWidth={2}
            label={{ value: `Settles near ${Math.round(settle)}`, position: 'insideTopRight', fill: '#059669', fontSize: 11, fontWeight: 700 }} />
          <ReferenceLine x={current} stroke="#64748b" strokeDasharray="4 3"
            label={{ value: `Now ${current}`, position: 'insideBottomRight', fill: '#64748b', fontSize: 11 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
