import React from 'react';
import { ScenarioMode } from '../../../types';

interface KineticsLegendProps {
  mode: ScenarioMode;
  hasCatalyst: boolean;
}

export const KineticsLegend: React.FC<KineticsLegendProps> = ({ mode, hasCatalyst }) => {
  if (mode === 'chemistry') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Legend</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-rose-400 border-2 border-rose-200" />
            <span className="text-xs font-bold text-slate-600">A (Reactant)</span>
          </div>
          <span className="text-slate-300 text-sm font-bold">+</span>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-400 border-2 border-blue-200" />
            <span className="text-xs font-bold text-slate-600">B (Reactant)</span>
          </div>
          <span className="text-slate-300 text-sm font-bold">→</span>
          <div className="flex items-center gap-1.5">
            <div className="flex w-8 h-5 overflow-hidden rounded-full border-2 border-slate-200">
              <div className="flex-1 bg-rose-400" />
              <div className="flex-1 bg-blue-400" />
            </div>
            <span className="text-xs font-bold text-slate-600">AB (Product)</span>
          </div>
          {hasCatalyst && (
            <>
              <span className="text-slate-300 text-sm font-bold">|</span>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-violet-400 border-2 border-violet-200" />
                <span className="text-xs font-bold text-slate-600">Catalyst</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Legend</h3>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-rose-400 border-2 border-rose-200" />
          <span className="text-xs font-bold text-slate-600">Substrate</span>
        </div>
        {hasCatalyst && (
          <>
            <span className="text-slate-300 text-sm font-bold">+</span>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-5 rounded-full bg-amber-400 border-2 border-amber-200 flex items-center justify-center">
                <span className="text-[8px] font-black text-amber-900">E</span>
              </div>
              <span className="text-xs font-bold text-slate-600">Enzyme (active site)</span>
            </div>
          </>
        )}
        <span className="text-slate-300 text-sm font-bold">→</span>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-emerald-400 border-2 border-emerald-200" />
          <span className="text-xs font-bold text-slate-600">Product</span>
        </div>
        <span className="text-[10px] text-slate-400 italic">(enzyme recycled)</span>
      </div>
    </div>
  );
};
