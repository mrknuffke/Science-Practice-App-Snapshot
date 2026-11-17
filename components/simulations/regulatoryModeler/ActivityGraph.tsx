import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  type TooltipContentProps
} from 'recharts';
import { RegulatoryNode } from '../../../types';
import { NODE_COLORS } from './modelerConstants';

export interface GraphDataPoint {
  tick: number;
  [nodeId: string]: number; // Maps node ID to its activation level
}

interface ActivityGraphProps {
  history: GraphDataPoint[];
  nodes: RegulatoryNode[];
}

export const ActivityGraph: React.FC<ActivityGraphProps> = ({ history, nodes }) => {
  if (history.length === 0 || nodes.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-8 min-h-[300px] flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">
        Add nodes to start tracking activity
      </div>
    );
  }

  // Format tooltip nicely
  const CustomTooltip = ({ active, payload, label }: Partial<TooltipContentProps<number, string>>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
          <p className="font-bold text-slate-500 mb-2">Tick: {label}</p>
          {payload.map(entry => (
            <div key={entry.name} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="font-medium text-slate-700">{entry.name}:</span>
              <span className="font-black" style={{ color: entry.color }}>{Math.round(entry.value)}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
        Activation Levels
      </h3>
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
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
               iconType="circle" 
               wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }}
            />
            {nodes.map(node => (
              <Line
                key={node.id}
                type="monotone"
                dataKey={node.id}
                name={node.label}
                stroke={NODE_COLORS[node.type] || '#cbd5e1'}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false} // Prevent morphing artifacts during real-time updates
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
