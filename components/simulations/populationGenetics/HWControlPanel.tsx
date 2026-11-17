/**
 * HWControlPanel: all simulation controls:
 * Play/Pause/Reset, speed, population size,
 * and collapsible sections for each evolutionary force.
 */

import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Zap,
  Wind,
  Shuffle,
  Users,
  Settings,
} from 'lucide-react';
import { DEFAULT_PARAMS, HWParams, TICK_SPEEDS } from './hwConstants';

interface HWControlPanelProps {
  params: HWParams;
  onParamsChange: (params: HWParams) => void;
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
  tickSpeed: number;
  onTickSpeedChange: (ms: number) => void;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children: React.ReactNode;
  accentColor: string;
}

const Section: React.FC<SectionProps> = ({ title, icon, enabled, onToggle, children, accentColor }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (v: boolean) => {
    onToggle(v);
    if (v) setOpen(true);
  };

  return (
    <div className={`rounded-2xl border-2 transition-colors ${enabled ? `border-${accentColor}-300 bg-${accentColor}-50` : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center justify-between p-3">
        <button
          className="flex items-center gap-2 text-left flex-1"
          onClick={() => enabled && setOpen(o => !o)}
          aria-expanded={open}
        >
          <span className={`${enabled ? `text-${accentColor}-600` : 'text-slate-400'}`}>{icon}</span>
          <span className={`font-bold text-sm ${enabled ? `text-${accentColor}-800` : 'text-slate-500'}`}>{title}</span>
          {enabled && (
            open
              ? <ChevronDown className="w-4 h-4 ml-auto text-slate-400" />
              : <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
          )}
        </button>
        {/* Toggle switch */}
        <button aria-label={`${enabled ? 'Turn off' : 'Turn on'} ${title}`}
          role="switch"
          aria-checked={enabled}
          onClick={() => handleToggle(!enabled)}
          className={`relative ml-2 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${accentColor}-400 flex-shrink-0 ${enabled ? `bg-${accentColor}-500` : 'bg-slate-300'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : ''}`}
          />
        </button>
      </div>
      {enabled && open && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  );
};

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
  color?: string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  color = 'blue',
}) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <span className={`text-xs font-black text-${color}-700 bg-${color}-100 px-2 py-0.5 rounded-lg`}>
        {formatValue ? formatValue(value) : value}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-blue-500"
    />
  </div>
);

const fmt2 = (v: number) => v.toFixed(2);
const fmt3 = (v: number) => v.toFixed(3);

const HWControlPanel: React.FC<HWControlPanelProps> = ({
  params,
  onParamsChange,
  isRunning,
  onToggleRunning,
  onReset,
  tickSpeed,
  onTickSpeedChange,
}) => {
  const set = (patch: Partial<HWParams>) => onParamsChange({ ...params, ...patch });

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-5 space-y-4">
      <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
        <Settings className="w-5 h-5 text-slate-500" />
        Controls
      </h3>

      {/* ── Playback buttons ── */}
      <div className="flex gap-2">
        <button
          onClick={onToggleRunning}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition-all shadow-md hover:shadow-lg active:scale-95 ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
          aria-label={isRunning ? 'Pause simulation' : 'Start simulation'}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
          aria-label="Reset simulation"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* ── Speed ── */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Speed</p>
        <div className="grid grid-cols-4 gap-1">
          {TICK_SPEEDS.map(s => (
            <button
              key={s.ms}
              onClick={() => onTickSpeedChange(s.ms)}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${tickSpeed === s.ms ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Population Size ── */}
      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-700">Population Size (N)</span>
        </div>
        <Slider
          label="N (larger N = less drift)"
          value={params.populationSize}
          min={10}
          max={1000}
          step={10}
          onChange={v => set({ populationSize: v })}
          formatValue={v => String(Math.round(v))}
        />
      </div>

      {/* ── Initial p ── */}
      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold text-slate-700">Initial Allele Frequency</span>
        </div>
        <Slider
          label="Starting p (freq. of A allele)"
          value={params.initialP}
          min={0.01}
          max={0.99}
          step={0.01}
          onChange={v => set({ initialP: v })}
          formatValue={fmt2}
        />
        <p className="text-[10px] text-slate-400 mt-1">Applied on Reset</p>
      </div>

      {/* ── Natural Selection ── */}
      <Section
        title="Natural Selection"
        icon={<Zap className="w-4 h-4" />}
        enabled={params.selectionEnabled}
        onToggle={v => set({ selectionEnabled: v })}
        accentColor="amber"
      >
        <Slider label="Fitness AA" value={params.fitnessAA} min={0} max={1} step={0.01} onChange={v => set({ fitnessAA: v })} formatValue={fmt2} color="amber" />
        <Slider label="Fitness Aa" value={params.fitnessAa} min={0} max={1} step={0.01} onChange={v => set({ fitnessAa: v })} formatValue={fmt2} color="amber" />
        <Slider label="Fitness aa" value={params.fitnessaa} min={0} max={1} step={0.01} onChange={v => set({ fitnessaa: v })} formatValue={fmt2} color="amber" />
        <p className="text-[10px] text-amber-600">Relative fitness (1.0 = no disadvantage). Set aa &lt; 1 for directional selection.</p>
      </Section>

      {/* ── Mutation ── */}
      <Section
        title="Mutation"
        icon={<Shuffle className="w-4 h-4" />}
        enabled={params.mutationEnabled}
        onToggle={v => set({ mutationEnabled: v })}
        accentColor="violet"
      >
        <Slider label="Forward rate (A → a)" value={params.mutationForward} min={0} max={0.05} step={0.001} onChange={v => set({ mutationForward: v })} formatValue={fmt3} color="violet" />
        <Slider label="Back rate (a → A)" value={params.mutationBack} min={0} max={0.05} step={0.001} onChange={v => set({ mutationBack: v })} formatValue={fmt3} color="violet" />
        <p className="text-[10px] text-violet-600">Typical realistic rates are 10⁻⁵ to 10⁻³. Higher values speed up observation.</p>
      </Section>

      {/* ── Gene Flow ── */}
      <Section
        title="Gene Flow"
        icon={<Wind className="w-4 h-4" />}
        enabled={params.geneFlowEnabled}
        onToggle={v => set({ geneFlowEnabled: v })}
        accentColor="cyan"
      >
        <Slider label="Immigration rate (m)" value={params.geneFlowRate} min={0} max={0.5} step={0.01} onChange={v => set({ geneFlowRate: v })} formatValue={fmt2} color="cyan" />
        <Slider label="Immigrant allele freq. (p)" value={params.geneFlowAlleleFreq} min={0} max={1} step={0.01} onChange={v => set({ geneFlowAlleleFreq: v })} formatValue={fmt2} color="cyan" />
        <p className="text-[10px] text-cyan-600">Each generation, m × N individuals are replaced by immigrants carrying the specified p.</p>
      </Section>

      {/* ── Non-Random Mating ── */}
      <Section
        title="Non-Random Mating"
        icon={<Users className="w-4 h-4" />}
        enabled={params.inbreedingEnabled}
        onToggle={v => set({ inbreedingEnabled: v })}
        accentColor="rose"
      >
        <Slider label="Inbreeding coefficient (F)" value={params.inbreedingF} min={0} max={1} step={0.01} onChange={v => set({ inbreedingF: v })} formatValue={fmt2} color="rose" />
        <p className="text-[10px] text-rose-600">F = 0 is random mating. F = 1 is complete selfing. Increases homozygosity without changing allele frequencies.</p>
      </Section>

      {/* ── Reset to Defaults ── */}
      <button
        onClick={() => onParamsChange(DEFAULT_PARAMS)}
        className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
      >
        Reset All to Defaults
      </button>
    </div>
  );
};

export default HWControlPanel;
