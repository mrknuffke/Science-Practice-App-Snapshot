import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { THEME_COLORS, SubstanceProperties } from './phaseChangeConstants';

interface HeatingCurveGraphProps {
  history: Array<{
    tick: number;
    temp: number;
    heat: number;
  }>;
  substance: SubstanceProperties;
}

export const HeatingCurveGraph: React.FC<HeatingCurveGraphProps> = ({ history, substance }) => {
  const displayHistory = history.slice(-150);

  const data = displayHistory.map(h => ({
    name: h.tick.toString(),
    temp: h.temp,
    heat: h.heat,
  }));

  if (data.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 p-4 min-h-[250px] flex items-center justify-center text-slate-400 font-bold uppercase text-xs">
        Waiting for data...
      </div>
    );
  }

  // Y-axis bounds
  const minTemp = 0; // Absolute zero
  const maxTemp = substance.boilingPoint * 1.5; 

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-4 shadow-lg">
      <h4 className="text-center font-bold text-slate-700 mb-4 whitespace-nowrap">Heating / Cooling Curve</h4>
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              label={{ value: 'Time', position: 'bottom', offset: 10, style: { fontSize: 11, fill: '#94a3b8' } }}
              tick={false}
              axisLine={false}
            />
            <YAxis
              domain={[minTemp, maxTemp]}
              label={{ value: 'Temperature (K)', angle: -90, position: 'left', style: { fontSize: 11, fill: '#64748b' } }}
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(v) => Math.round(v).toString()}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }}
              formatter={(value) => [Math.round(Number(value ?? 0)) + ' K', 'Temperature']}
              labelFormatter={() => ''}
            />
            {/* Melting Point / Boiling point reference lines */}
            <ReferenceLine y={substance.meltingPoint} stroke="#a78bfa" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'MP', fill: '#8b5cf6', fontSize: 10 }} />
            <ReferenceLine y={substance.boilingPoint} stroke="#f472b6" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'BP', fill: '#db2777', fontSize: 10 }} />
            
            <Line
              type="monotone"
              dataKey="temp"
              name="Temperature"
              stroke={THEME_COLORS.primaryDark}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
