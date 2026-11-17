import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  type TooltipContentProps
} from 'recharts';
import { ParticleType } from '../../../types';
import { PARTICLE_CONFIGS } from './diffusionConstants';

export interface DiffusionGraphData {
  tick: number;
  [key: string]: number; // dynamic keys for e.g. 'oxygen_ext', 'oxygen_int'
}

interface ConcentrationGraphProps {
  history: DiffusionGraphData[];
  selectedType: ParticleType;
  onChangeType: (type: ParticleType) => void;
}

export const ConcentrationGraph: React.FC<ConcentrationGraphProps> = ({ history, selectedType, onChangeType }) => {
  if (history.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-8 min-h-[300px] flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">
        No Data
      </div>
    );
  }

  const config = PARTICLE_CONFIGS[selectedType];
  const color = config.color;

  // Format tooltip nicely
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
          Concentration Tracker
        </h3>
        
        {/* Toggle between particle types to graph */}
        <div className="flex bg-slate-100 rounded-lg p-1">
          {(Object.keys(PARTICLE_CONFIGS) as ParticleType[]).map(type => (
            <button
              key={type}
              onClick={() => onChangeType(type)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                selectedType === type 
                  ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {PARTICLE_CONFIGS[type].name.split(' ')[0]} {/* Shorter label */}
            </button>
          ))}
        </div>
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
              label={{ value: 'Particles', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11, fontWeight: 'bold', offset: 0 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
               iconType="circle" 
               wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }}
            />
            <Line
              type="monotone"
              dataKey={`${selectedType}_ext`}
              name="Extracellular (Top)"
              stroke={color}
              strokeWidth={4}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey={`${selectedType}_int`}
              name="Intracellular (Bottom)"
              stroke="#94a3b8" // Slate gray to cleanly contrast against the bright particle color
              strokeWidth={3}
              strokeDasharray="5 5"
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
