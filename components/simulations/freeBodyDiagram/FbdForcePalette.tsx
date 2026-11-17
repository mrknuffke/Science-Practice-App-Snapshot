import React from 'react';
import { FbdForceType } from '../../../types';
import { FORCE_DEFINITIONS } from './fbdConstants';

interface FbdForcePaletteProps {
  onAddForce: (type: FbdForceType) => void;
  activeTypes: FbdForceType[]; // already-placed force types
}

const CATEGORY_ORDER = ['field', 'contact', 'other'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  field: 'Field Forces',
  contact: 'Contact Forces',
  other: 'Other',
};

export const FbdForcePalette: React.FC<FbdForcePaletteProps> = ({ onAddForce, activeTypes }) => {
  const byCategory = CATEGORY_ORDER.map(cat => ({
    cat,
    defs: Object.values(FORCE_DEFINITIONS).filter(d => d.category === cat),
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Force Palette</h3>
      <div className="space-y-3">
        {byCategory.map(({ cat, defs }) => (
          <div key={cat}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{CATEGORY_LABELS[cat]}</p>
            <div className="flex flex-wrap gap-1.5">
              {defs.map(def => {
                const isActive = activeTypes.includes(def.type);
                return (
                  <button
                    key={def.type}
                    onClick={() => onAddForce(def.type)}
                    title={def.description}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      isActive
                        ? 'opacity-60 border-dashed'
                        : 'hover:scale-105 shadow-sm'
                    }`}
                    style={{
                      borderColor: def.color,
                      color: def.color,
                      backgroundColor: `${def.color}15`,
                    }}
                  >
                    <span className="font-mono text-[10px]">{def.symbol}</span>
                    <span>{def.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 mt-3 italic">Click to add. Drag arrowheads to rotate. You can add multiple forces of the same type.</p>
    </div>
  );
};
