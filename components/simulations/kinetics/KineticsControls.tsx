import React from 'react';
import { ScenarioMode } from '../../../types';
import { Play, Pause, FlaskConical, Dna, Plus } from 'lucide-react';
import { HeatCoolButtons, HeatingState } from '../shared/HeatCoolButtons';

interface KineticsControlsProps {
  mode: ScenarioMode;
  onChangeMode: (mode: ScenarioMode) => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  temperature: number; // 0.1 to 2.0
  onChangeTemperature: (val: number) => void;
  heatingState: HeatingState;
  onSetHeatingState: (s: HeatingState) => void;
  hasCatalyst: boolean;
  onToggleCatalyst: () => void;
  onAddParticle: (type: 'A' | 'B' | 'Enzyme', amount: number) => void;
  onClear: () => void;
}

export const KineticsControls: React.FC<KineticsControlsProps> = ({
  mode, onChangeMode, isRunning, onTogglePlay, temperature, onChangeTemperature: _onChangeTemperature,
  heatingState, onSetHeatingState,
  hasCatalyst, onToggleCatalyst, onAddParticle, onClear
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col gap-6">
      
      {/* Mode Switcher */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Subject Mode</h3>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => onChangeMode('chemistry')}
            className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition-all ${
              mode === 'chemistry' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FlaskConical className="w-4 h-4" /> Collision Theory
          </button>
          <button
            onClick={() => onChangeMode('biology')}
            className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition-all ${
              mode === 'biology' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Dna className="w-4 h-4" /> Enzymes
          </button>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Playback Controls */}
      <div className="flex gap-2">
        <button
          onClick={onTogglePlay}
          className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
            isRunning 
              ? 'bg-amber-100 text-amber-700 border border-amber-300' 
              : 'bg-indigo-600 text-white'
          }`}
        >
          {isRunning ? <><Pause className="w-5 h-5"/> Pause</> : <><Play className="w-5 h-5"/> Play</>}
        </button>
        <button
          onClick={onClear}
          className="px-4 py-3 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl font-bold text-sm transition-colors"
        >
          Reset
        </button>
      </div>

      <hr className="border-slate-100" />

      {/* Temperature */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Temperature</h3>
          <span className="text-xs font-bold text-slate-500">{(temperature * 100).toFixed(0)} (rel.)</span>
        </div>
        <HeatCoolButtons
          heatingState={heatingState}
          setHeatingState={onSetHeatingState}
          disabled={!isRunning}
        />
      </div>

      <hr className="border-slate-100" />

      {/* Add Particles */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Add Reactants</h3>
        <div className="grid grid-cols-2 gap-2">
          {mode === 'chemistry' ? (
            <>
              <button onClick={() => onAddParticle('A', 10)} className="flex items-center justify-center gap-1 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-bold text-sm hover:bg-rose-100">
                <Plus className="w-4 h-4"/> 10x A
              </button>
              <button onClick={() => onAddParticle('B', 10)} className="flex items-center justify-center gap-1 p-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg font-bold text-sm hover:bg-blue-100">
                <Plus className="w-4 h-4"/> 10x B
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onAddParticle('A', 10)} className="flex items-center justify-center gap-1 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-bold text-sm hover:bg-rose-100">
                <Plus className="w-4 h-4"/> 10x Substrate
              </button>
            </>
          )}
        </div>
      </div>

      {/* Catalyst / Enzyme Toggle */}
      <div>
         <button
            onClick={onToggleCatalyst}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-center font-bold text-sm transition-all border ${
              hasCatalyst 
                 ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-inner'
                 : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm'
            }`}
         >
            {hasCatalyst
              ? (mode === 'chemistry' ? 'Catalyst added (click to remove)' : 'Remove Enzyme')
              : (mode === 'chemistry' ? 'Add Catalyst (Lowers Ea)' : 'Add Enzyme')}
         </button>
      </div>

    </div>
  );
};
