import React, { useState } from 'react';
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipContentProps
} from 'recharts';

export interface GasLawsDataPoint {
  tick: number;
  temperature: number;
  pressure: number;
  pressureA: number;
  pressureB: number;
  volume: number;  // piston height as % of max
}

interface GasLawsGraphProps {
  history: GasLawsDataPoint[];
}

type AxisKey = 'tick' | 'temperature' | 'pressure' | 'pressureA' | 'pressureB' | 'volume';

const AXIS_LABEL: Record<AxisKey, string> = {
  tick: 'Time',
  temperature: 'Temperature (K)',
  pressure: 'Pressure (total)',
  pressureA: 'Pressure (Gas A)',
  pressureB: 'Pressure (Gas B)',
  volume: 'Volume (%)',
};

const SERIES_COLOR: Record<Exclude<AxisKey, 'tick'>, string> = {
  temperature: '#f97316',
  pressure: '#e11d48',
  pressureA: '#ef4444',
  pressureB: '#3b82f6',
  volume: '#0ea5e9',
};

const CustomTooltip = ({ active, payload }: Partial<TooltipContentProps<number, string>>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs space-y-1">
      {payload.map(entry => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-black" style={{ color: entry.color || entry.fill }}>
            {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const GasLawsGraph: React.FC<GasLawsGraphProps> = ({ history }) => {
  const [xKey, setXKey] = useState<AxisKey>('tick');
  const [yKey, setYKey] = useState<AxisKey>('temperature');

  if (history.length < 2) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 min-h-[220px] flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
        Play simulation to collect data
      </div>
    );
  }

  const latest = history[history.length - 1];
  const isTimeSeries = xKey === 'tick';

  // For non-time X axes, sample fewer recent points to keep the scatter readable
  const scatterData = !isTimeSeries
    ? history.slice(-100).map(h => ({ x: h[xKey], y: h[yKey as Exclude<AxisKey, 'tick'>] }))
    : [];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-lg font-black text-slate-800">Live Readings</h3>
        <div className="flex gap-3 text-xs font-bold">
          <span className="text-orange-600">T = {latest.temperature.toFixed(0)} K</span>
          <span className="text-rose-600">P = {latest.pressure.toFixed(1)}</span>
          <span className="text-sky-600">V = {latest.volume.toFixed(0)}%</span>
        </div>
      </div>

      {/* Axis selectors */}
      <div className="flex items-center gap-2 mb-3 text-xs flex-wrap">
        <label className="flex items-center gap-1.5 text-slate-500 font-bold">
          X:
          <select
            value={xKey}
            onChange={(e) => setXKey(e.target.value as AxisKey)}
            className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="tick">Time</option>
            <option value="volume">Volume</option>
            <option value="temperature">Temperature</option>
            <option value="pressure">Pressure (total)</option>
            <option value="pressureA">Pressure (Gas A)</option>
            <option value="pressureB">Pressure (Gas B)</option>
          </select>
        </label>
        {!isTimeSeries && (
          <label className="flex items-center gap-1.5 text-slate-500 font-bold">
            Y:
            <select
              value={yKey}
              onChange={(e) => setYKey(e.target.value as AxisKey)}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="temperature">Temperature</option>
              <option value="pressure">Pressure (total)</option>
              <option value="pressureA">Pressure (Gas A)</option>
              <option value="pressureB">Pressure (Gas B)</option>
              <option value="volume">Volume</option>
            </select>
          </label>
        )}
        {!isTimeSeries && (
          <span className="text-[10px] text-slate-400 italic ml-auto">
            Scatter: recent {Math.min(100, history.length)} samples
          </span>
        )}
      </div>

      <div className="w-full h-[220px]">
        {isTimeSeries ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="tick" tick={false} axisLine={{ stroke: '#cbd5e1' }} label={{ value: 'Time', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '6px' }} />
              <Line type="monotone" dataKey="temperature" name="Temp (K)" stroke={SERIES_COLOR.temperature} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="pressure" name="Total Pressure" stroke={SERIES_COLOR.pressure} strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="pressureA" name="P(Gas A)" stroke={SERIES_COLOR.pressureA} strokeWidth={1.5} strokeDasharray="4 2" dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="pressureB" name="P(Gas B)" stroke={SERIES_COLOR.pressureB} strokeWidth={1.5} strokeDasharray="4 2" dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="volume" name="Volume %" stroke={SERIES_COLOR.volume} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 24, left: 8, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                dataKey="x"
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                axisLine={{ stroke: '#cbd5e1' }}
                label={{ value: AXIS_LABEL[xKey], position: 'insideBottom', offset: -8, fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                label={{ value: AXIS_LABEL[yKey], angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }: Partial<TooltipContentProps<number, string>>) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs space-y-1">
                      <div className="font-bold text-slate-700">{AXIS_LABEL[xKey]}: <span className="font-black">{p.x.toFixed(1)}</span></div>
                      <div className="font-bold text-slate-700">{AXIS_LABEL[yKey]}: <span className="font-black">{p.y.toFixed(1)}</span></div>
                    </div>
                  );
                }}
              />
              <Scatter
                data={scatterData}
                fill={SERIES_COLOR[yKey as Exclude<AxisKey, 'tick'>] || '#0ea5e9'}
                isAnimationActive={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
