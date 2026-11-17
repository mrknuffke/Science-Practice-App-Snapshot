import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  type TooltipContentProps
} from 'recharts';
import { ScenarioMode } from '../../../types';
import { REACTANT_PROPERTIES } from './kineticsConstants';

export interface KineticsGraphData {
  tick: number;
  reactants: number; // For Chem: A + B. For Bio: Substrate
  products: number;  // For both: Product
}

interface KineticsGraphProps {
  history: KineticsGraphData[];
  mode: ScenarioMode;
}

export const KineticsGraph: React.FC<KineticsGraphProps> = ({ history, mode }) => {
  if (history.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-8 min-h-[300px] flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">
        No Data
      </div>
    );
  }

  const reactantName = mode === 'chemistry' ? 'Reactants (A+B)' : 'Substrate';
  const productName = 'Product';

  const CustomTooltip = ({ active, payload, label }: Partial<TooltipContentProps<number, string>>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
          <p className="font-bold text-slate-500 mb-2">Time: {label}</p>
          {payload.map(entry => (
            <div key={entry.name} className="flex items-center justify-between gap-4 mb-1 border-b border-slate-50 pb-1">
              <span className="font-medium text-slate-700">{entry.name}:</span>
              <span className="font-black" style={{ color: entry.color }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
          Reaction Progress
        </h3>
      </div>

      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="tick" 
              tick={false} 
              axisLine={{ stroke: '#cbd5e1' }}
              label={{ value: 'Time', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
              allowDecimals={false}
              label={{ value: 'Molecules', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11, fontWeight: 'bold', offset: 0 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
               iconType="circle" 
               wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }}
            />
            <Line
              type="monotone"
              dataKey="reactants"
              name={reactantName}
              stroke={REACTANT_PROPERTIES.A.colors[mode]} // Red/Rose
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="products"
              name={productName}
              stroke={REACTANT_PROPERTIES.Product.colors[mode]} // Purple or Green
              strokeWidth={4}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
