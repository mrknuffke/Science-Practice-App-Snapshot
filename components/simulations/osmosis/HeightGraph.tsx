import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

export interface HeightPoint {
  t: number;
  h: number;
}

interface HeightGraphProps {
  current: HeightPoint[];
  previous: HeightPoint[] | null;
  previousLabel: string | null;
}

const HeightGraph: React.FC<HeightGraphProps> = ({ current, previous, previousLabel }) => {
  const all = [...current, ...(previous ?? [])];
  const maxT = Math.max(60, ...all.map(p => p.t));
  const hs = all.map(p => p.h);
  const top = Math.max(20, Math.ceil((Math.max(0, ...hs) + 5) / 20) * 20);
  const bottom = Math.min(0, Math.floor((Math.min(0, ...hs) - 5) / 20) * 20);

  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            type="number"
            dataKey="t"
            domain={[0, Math.ceil(maxT / 30) * 30]}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            label={{ value: 'Time (s)', position: 'insideBottom', offset: -4, fill: '#94a3b8', fontSize: 11 }}
          />
          <YAxis
            type="number"
            domain={[bottom, top]}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            label={{ value: 'Height (mm)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
          />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 3" />
          <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
          {previous && previous.length > 1 && (
            <Line
              data={previous}
              dataKey="h"
              name={previousLabel ?? 'Last run'}
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={false}
            />
          )}
          <Line
            data={current}
            dataKey="h"
            name="This run"
            stroke="#0284c7"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HeightGraph;
