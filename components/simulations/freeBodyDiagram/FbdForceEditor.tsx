import React from 'react';
import { Trash2 } from 'lucide-react';
import { FbdForce } from '../../../types';
import { MIN_MAGNITUDE, MAX_MAGNITUDE } from './fbdConstants';

interface FbdForceEditorProps {
  force: FbdForce;
  onUpdate: (updated: Partial<FbdForce>) => void;
  onDelete: () => void;
}

interface SliderNumberProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  accentColor: string;
  onChange: (v: number) => void;
  clamp?: (v: number) => number;
}

const SliderNumber: React.FC<SliderNumberProps> = ({
  label, value, min, max, step, unit, accentColor, onChange, clamp,
}) => {
  const handle = (raw: number) => {
    const v = clamp ? clamp(raw) : Math.min(max, Math.max(min, raw));
    if (!isNaN(v)) onChange(v);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <span className="text-xs font-bold" style={{ color: accentColor }}>{value.toFixed(0)}{unit}</span>
      </div>
      {/* Slider row */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => handle(parseFloat(e.target.value))}
          className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor }}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={Math.round(value)}
          onChange={e => handle(parseFloat(e.target.value))}
          className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-center focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
        />
      </div>
      <div className="flex justify-between text-[9px] text-slate-400 mt-0.5 px-0.5">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
};

export const FbdForceEditor: React.FC<FbdForceEditorProps> = ({ force, onUpdate, onDelete }) => {
  const normalizeAngle = (v: number) => ((v % 360) + 360) % 360;

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 p-4 space-y-3" style={{ borderColor: force.color }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: force.color }} />
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest">Edit Force</h3>
        </div>
        <button aria-label="Delete force" onClick={onDelete} className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Label */}
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Label</label>
        <input
          type="text"
          value={force.label}
          onChange={e => onUpdate({ label: e.target.value })}
          maxLength={6}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': force.color } as React.CSSProperties}
        />
      </div>

      {/* Magnitude: slider + number input */}
      <SliderNumber
        label="Magnitude"
        value={force.magnitude}
        min={MIN_MAGNITUDE}
        max={MAX_MAGNITUDE}
        step={5}
        unit=" N"
        accentColor={force.color}
        onChange={v => onUpdate({ magnitude: v })}
      />

      {/* Angle: slider (0-359) + number input */}
      <SliderNumber
        label="Angle"
        value={force.angle}
        min={0}
        max={359}
        step={1}
        unit="°"
        accentColor={force.color}
        onChange={v => onUpdate({ angle: normalizeAngle(v) })}
        clamp={v => ((Math.round(v) % 360) + 360) % 360}
      />
      <p className="text-[9px] text-slate-400 -mt-1">0° = right · 90° = up · 180° = left · 270° = down</p>

      {/* Quick-angle presets */}
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Quick Angles</p>
        <div className="grid grid-cols-4 gap-1">
          {[0, 90, 180, 270, 45, 135, 225, 315].map(a => (
            <button
              key={a}
              onClick={() => onUpdate({ angle: a })}
              className={`py-1 rounded-lg text-[10px] font-bold border transition-all ${
                Math.abs(force.angle - a) < 1
                  ? 'text-white'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              style={Math.abs(force.angle - a) < 1 ? { backgroundColor: force.color, borderColor: force.color } : {}}
            >
              {a}°
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
