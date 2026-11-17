import React from 'react';
import { SUBSTANCES } from './phaseChangeConstants';
import { Settings2, RotateCcw } from 'lucide-react';
import { HeatCoolButtons } from '../shared/HeatCoolButtons';

interface PhaseChangeControlsProps {
  substanceId: string;
  onSubstanceChange: (id: string) => void;
  heatingState: 'heating' | 'cooling' | 'none';
  setHeatingState: (state: 'heating' | 'cooling' | 'none') => void;
  onReset: () => void;
}

export const PhaseChangeControls: React.FC<PhaseChangeControlsProps> = ({
  substanceId,
  onSubstanceChange,
  heatingState,
  setHeatingState,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings2 className="w-5 h-5 text-violet-600" />
        <h3 className="text-xl font-black text-slate-800">Controls</h3>
      </div>

      <div className="space-y-6">
        {/* Substance Selector */}
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
            Select Substance
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(SUBSTANCES).map(sub => (
              <button
                key={sub.id}
                onClick={() => onSubstanceChange(sub.id)}
                className={`py-2 px-3 rounded-lg text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  substanceId === sub.id
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{sub.name}</span>
                <span className="text-[10px] opacity-80">{sub.chemicalFormula}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Heat / Cool Buttons */}
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
            Energy Control
          </label>
          <HeatCoolButtons
            heatingState={heatingState}
            setHeatingState={setHeatingState}
          />
        </div>

        {/* Reset */}
        <div>
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all font-black tracking-wide"
          >
            <RotateCcw className="w-5 h-5" />
            <span>RESET</span>
          </button>
        </div>
      </div>
    </div>
  );
};
