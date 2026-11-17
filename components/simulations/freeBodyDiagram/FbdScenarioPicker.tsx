import React from 'react';
import { FbdScenario } from '../../../types';
import { FBD_SCENARIOS } from './fbdScenarios';

interface FbdScenarioPickerProps {
  currentScenario: FbdScenario | null;
  onSelectScenario: (s: FbdScenario) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  flat: 'Flat Surface',
  incline: 'Inclined Plane',
  pulley: 'Hanging / Pulley',
  vertical: 'Free Fall / Vertical',
};

const CATEGORY_COLORS: Record<string, string> = {
  flat: 'bg-sky-50 border-sky-200 text-sky-700',
  incline: 'bg-violet-50 border-violet-200 text-violet-700',
  pulley: 'bg-amber-50 border-amber-200 text-amber-700',
  vertical: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};

export const FbdScenarioPicker: React.FC<FbdScenarioPickerProps> = ({ currentScenario, onSelectScenario }) => {
  const categories = ['flat', 'incline', 'pulley', 'vertical'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Choose a Scenario</h3>
      <div className="space-y-3">
        {categories.map(cat => {
          const scenarios = FBD_SCENARIOS.filter(s => s.category === cat);
          return (
            <div key={cat}>
              <p className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded mb-1.5 border inline-block ${CATEGORY_COLORS[cat]}`}>
                {CATEGORY_LABELS[cat]}
              </p>
              <div className="space-y-1">
                {scenarios.map(s => (
                  <button
                    key={s.id}
                    onClick={() => onSelectScenario(s)}
                    className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-all ${
                      currentScenario?.id === s.id
                        ? 'bg-cyan-50 border-cyan-400 text-cyan-800 font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="font-bold">{s.title}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5 line-clamp-1">{s.description}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
