/**
 * Visualization Mode Tabs Component
 * Reusable tab interface for switching between simulation visualization modes
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface VisualizationMode {
  id: string;
  label: string;
  icon?: LucideIcon;
  description?: string;
}

export interface VisualizationModeTabsProps {
  modes: VisualizationMode[];
  activeMode: string;
  onChange: (modeId: string) => void;
  className?: string;
}

const VisualizationModeTabs: React.FC<VisualizationModeTabsProps> = ({
  modes,
  activeMode,
  onChange,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-4 ${className}`}>
      <label className="block text-sm font-bold text-slate-700 mb-3">Visualization Mode</label>
      <div className="flex flex-wrap gap-2">
        {modes.map((mode) => {
          const isActive = activeMode === mode.id;
          const Icon = mode.icon;

          return (
            <button
              key={mode.id}
              onClick={() => onChange(mode.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2
                ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-102'
                }`}
              aria-pressed={isActive}
              title={mode.description}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VisualizationModeTabs;
