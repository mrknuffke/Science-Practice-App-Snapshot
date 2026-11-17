import React from 'react';
import { ParticleType, MembraneProtein } from '../../../types';
import { PARTICLE_CONFIGS } from './diffusionConstants';
import { Plus, Zap, Trash2, Atom, CircleDot, Play, Pause } from 'lucide-react';

const SPEED_OPTIONS = [
  { value: 0.25, label: '0.25×' },
  { value: 0.5, label: '0.5×' },
  { value: 1, label: '1×' },
  { value: 2, label: '2×' },
  { value: 4, label: '4×' },
];

interface DiffusionControlsProps {
  onAddParticles: (type: ParticleType, region: 'extracellular' | 'intracellular', amount: number) => void;
  onAddProtein: (type: 'channel' | 'pump', allowed: ParticleType) => void;
  onSupplyATP: () => void;
  onClear: () => void;
  proteins: MembraneProtein[];
  selectedProteinId: string | null;
  onSelectProtein: (id: string | null) => void;
  onTogglePumpDirection: () => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  speedMultiplier: number;
  onSpeedChange: (speed: number) => void;
}

export const DiffusionControls: React.FC<DiffusionControlsProps> = ({
  onAddParticles,
  onAddProtein,
  onSupplyATP,
  onClear,
  proteins,
  selectedProteinId,
  onSelectProtein,
  onTogglePumpDirection,
  isRunning,
  onTogglePlay,
  speedMultiplier,
  onSpeedChange,
}) => {
  const selectedPump = proteins.find(p => p.id === selectedProteinId && p.type === 'pump');
  const hasPumps = proteins.some(p => p.type === 'pump');
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col gap-6">
      
      {/* Playback Controls */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Simulation</h3>
        <div className="flex gap-2 mb-3">
          <button
            onClick={onTogglePlay}
            className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
              isRunning
                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isRunning ? <><Pause className="w-5 h-5"/> Pause</> : <><Play className="w-5 h-5"/> Play</>}
          </button>

          <button
            onClick={onClear}
            className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-rose-100 hover:text-rose-600 transition-colors"
            title="Reset Simulation"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Speed control */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Speed</p>
          <div className="flex gap-1">
            {SPEED_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onSpeedChange(opt.value)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  speedMultiplier === opt.value
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Particle Injection */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Add Particles</h3>
        <div className="flex flex-col gap-3">
          {(Object.keys(PARTICLE_CONFIGS) as ParticleType[]).map(type => {
            const config = PARTICLE_CONFIGS[type];
            return (
              <div key={type} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                  {config.name} {config.canDiffuse ? '(Simple)' : ''}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onAddParticles(type, 'extracellular', 10)}
                    className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Extracellular
                  </button>
                  <button 
                    onClick={() => onAddParticles(type, 'intracellular', 10)}
                    className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Intracellular
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Membrane Proteins */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Membrane Transport</h3>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onAddProtein('channel', 'glucose')}
            className="p-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors flex flex-col items-center gap-1"
          >
            <CircleDot className="w-4 h-4" />
            Glucose Channel
          </button>
          
          <button 
            onClick={() => onAddProtein('pump', 'sodium')}
            className="p-2 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors flex flex-col items-center gap-1"
          >
            <Atom className="w-4 h-4" />
            Sodium Pump
          </button>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* ATP Supply */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Active Transport</h3>

        {hasPumps && (
          <div className="flex flex-col gap-2 mb-3">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Select a pump to configure it:</p>
            {proteins.filter(p => p.type === 'pump').map((pump, idx) => (
              <button
                key={pump.id}
                onClick={() => onSelectProtein(selectedProteinId === pump.id ? null : pump.id)}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                  selectedProteinId === pump.id
                    ? 'bg-amber-100 text-amber-800 border border-amber-400'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Pump {idx + 1} {pump.hasATP ? '⚡' : ''}</span>
                <span className="text-[10px] opacity-70">→ {pump.pumpDirection === 'in' ? 'Inward' : 'Outward'}</span>
              </button>
            ))}
          </div>
        )}

        {selectedPump && (
          <button
            onClick={onTogglePumpDirection}
            className="w-full mb-2 py-2 px-3 rounded-lg text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors"
          >
            Direction: {selectedPump.pumpDirection === 'in' ? '⬇ Inward' : '⬆ Outward'} (click to flip)
          </button>
        )}

        <button
          onClick={onSupplyATP}
          className={`w-full py-3 px-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
            hasPumps
              ? 'bg-amber-400 text-amber-900 border border-amber-500 hover:bg-amber-300'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
          }`}
          disabled={!hasPumps}
        >
          <Zap className="w-5 h-5" />
          {selectedProteinId && selectedPump ? 'Supply ATP to Selected Pump' : 'Supply ATP to All Pumps'}
        </button>
        {!hasPumps && (
          <p className="text-[10px] text-center text-slate-400 mt-2">Requires an active pump.</p>
        )}
      </div>

    </div>
  );
};
