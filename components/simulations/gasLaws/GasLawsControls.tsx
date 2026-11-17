import React from 'react';
import { Plus, Minus, RotateCcw, Play, Pause, Shield, Wind } from 'lucide-react';
import { GasType } from './gasLawsEngine';
import { HeatCoolButtons, HeatingState } from '../shared/HeatCoolButtons';

interface GasLawsControlsProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onChangeParticles: (type: GasType, delta: number) => void;
  heatingState: HeatingState;
  setHeatingState: (s: HeatingState) => void;
  indestructible: boolean;
  onToggleIndestructible: () => void;
  ventOpen: boolean;
  onToggleVent: () => void;
  pistonY: number;
  onPistonChange: (y: number) => void;
  pistonMin: number;
  pistonMax: number;
  countA: number;
  countB: number;
}

export const GasLawsControls: React.FC<GasLawsControlsProps> = ({
  isRunning,
  onTogglePlay,
  onReset,
  onChangeParticles,
  heatingState,
  setHeatingState,
  indestructible,
  onToggleIndestructible,
  ventOpen,
  onToggleVent,
  pistonY,
  onPistonChange,
  pistonMin,
  pistonMax,
  countA,
  countB,
}) => {
  // Volume slider: lower pistonY = smaller volume, so invert the slider
  const volumePercent = Math.round(((pistonMax - pistonY) / (pistonMax - pistonMin)) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col gap-5">

      {/* Playback */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Simulation</h3>
        <div className="flex gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
              isRunning
                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                : 'bg-sky-600 text-white'
            }`}
          >
            {isRunning ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5" /> Play</>}
          </button>
          <button
            onClick={onReset}
            className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-rose-100 hover:text-rose-600 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Volume (piston) slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Volume</h3>
          <span className="text-xs font-bold text-sky-600">{volumePercent}%</span>
        </div>
        <input aria-label="Volume"
          type="range"
          min={pistonMin}
          max={pistonMax}
          step={1}
          value={pistonY}
          onChange={(e) => onPistonChange(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          style={{ direction: 'rtl' }} // invert so drag right = expand
        />
        <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
          <span>Compressed</span>
          <span>Expanded</span>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Heat / Cool */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Temperature</h3>
        <HeatCoolButtons
          heatingState={heatingState}
          setHeatingState={setHeatingState}
          showInstruction={false}
        />
        <p className="text-[10px] text-slate-400 text-center mt-2">Press and hold to add or remove energy.</p>
      </div>

      <hr className="border-slate-100" />

      {/* Vessel safety */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Vessel</h3>
        <button
          onClick={onToggleIndestructible}
          className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm ${
            indestructible
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${indestructible ? 'text-emerald-600' : 'text-slate-400'}`} />
            Indestructible
          </span>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
            indestructible ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            {indestructible ? 'On' : 'Off'}
          </span>
        </button>
        <p className="text-[10px] text-slate-400 text-center mt-2">
          {indestructible ? 'Vessel will not break: safe to push pressure to extremes.' : 'Vessel breaks at very high pressure.'}
        </p>

        <button
          onClick={onToggleVent}
          className={`w-full mt-3 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm ${
            ventOpen
              ? 'bg-orange-50 border-orange-300 text-orange-700'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <Wind className={`w-4 h-4 ${ventOpen ? 'text-orange-600' : 'text-slate-400'}`} />
            Open Vent
          </span>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
            ventOpen ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            {ventOpen ? 'On' : 'Off'}
          </span>
        </button>
        <p className="text-[10px] text-slate-400 text-center mt-2">
          {ventOpen ? 'Gas particles can escape through the right wall.' : 'Open a hole in the right wall to let gas escape.'}
        </p>
      </div>

      <hr className="border-slate-100" />

      {/* Molecules */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Molecules</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-300" />
              <span className="text-sm font-bold text-slate-700">Gas A</span>
              <span className="text-xs text-slate-400">({countA})</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onChangeParticles('A', -10)}
                disabled={countA === 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-3 h-3" /> 10
              </button>
              <button
                onClick={() => onChangeParticles('A', 10)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
              >
                <Plus className="w-3 h-3" /> 10
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-300" />
              <span className="text-sm font-bold text-slate-700">Gas B</span>
              <span className="text-xs text-slate-400">({countB})</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onChangeParticles('B', -10)}
                disabled={countB === 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-3 h-3" /> 10
              </button>
              <button
                onClick={() => onChangeParticles('B', 10)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-3 h-3" /> 10
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Particle brightness reflects temperature: vivid is hot, dim is cold.</p>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          Dalton's Law: P<sub>total</sub> = P<sub>A</sub> + P<sub>B</sub>
        </p>
      </div>

    </div>
  );
};
