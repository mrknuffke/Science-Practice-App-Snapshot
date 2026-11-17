import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { COLORS } from './ecosystemConstants';

interface PopulationGraphProps {
  history: Array<{
    tick: number;
    plants: number;
    herbivores: number;
    carnivores: number;
  }>;
}

export const PopulationGraph: React.FC<PopulationGraphProps> = ({ history }) => {
  const displayHistory = history.slice(-200);

  const data = displayHistory.map(h => ({
    name: h.tick.toString(),
    plants: h.plants,
    herbivores: h.herbivores,
    carnivores: h.carnivores,
  }));

  if (data.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-100 p-4">
        <h4 className="text-center font-bold text-slate-700 mb-4">Population Dynamics</h4>
        <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm font-medium">
          Press Play to begin collecting data
        </div>
      </div>
    );
  }

  // Compute animal max for right axis domain (with padding)
  const maxAnimals = Math.max(
    10,
    ...data.map(d => Math.max(d.herbivores, d.carnivores))
  );
  const animalAxisMax = Math.ceil(maxAnimals * 1.2 / 10) * 10;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-100 p-4 shadow-lg">
      <h4 className="text-center font-bold text-slate-700 mb-4">Population Dynamics</h4>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 40, left: 40, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              label={{ value: 'Time (Ticks)', position: 'bottom', offset: 10, style: { fontSize: 12, fill: '#64748b' } }}
              tick={{ fontSize: 10, fill: '#64748b' }}
              interval="preserveStartEnd"
            />
            {/* Left Y-axis: Plant cells (0-1000) */}
            <YAxis
              yAxisId="plants"
              orientation="left"
              domain={[0, 1000]}
              label={{ value: 'Plant Cells', angle: -90, position: 'left', offset: 10, style: { fontSize: 11, fill: COLORS.PLANT_FULL } }}
              tick={{ fontSize: 10, fill: COLORS.PLANT_FULL }}
              stroke={COLORS.PLANT_FULL}
            />
            {/* Right Y-axis: Animal populations (auto-scaled) */}
            <YAxis
              yAxisId="animals"
              orientation="right"
              domain={[0, animalAxisMax]}
              label={{ value: 'Animals', angle: 90, position: 'right', offset: 10, style: { fontSize: 11, fill: '#64748b' } }}
              tick={{ fontSize: 10, fill: '#64748b' }}
              stroke="#64748b"
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: 12 }} verticalAlign="top" />
            <Line
              yAxisId="plants"
              type="monotone"
              dataKey="plants"
              name="Plants"
              stroke={COLORS.PLANT_FULL}
              strokeWidth={2}
              dot={false}
              strokeOpacity={0.5}
              isAnimationActive={false}
            />
            <Line
              yAxisId="animals"
              type="monotone"
              dataKey="herbivores"
              name="Herbivores"
              stroke={COLORS.HERBIVORE}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              yAxisId="animals"
              type="monotone"
              dataKey="carnivores"
              name="Carnivores"
              stroke={COLORS.CARNIVORE}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-slate-400 mt-2 text-center italic">
        Left axis: plant cells. Right axis: animal populations (auto-scaled).
      </p>
    </div>
  );
};
