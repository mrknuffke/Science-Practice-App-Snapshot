import React from 'react';
import { Flame, Snowflake } from 'lucide-react';

export type HeatingState = 'heating' | 'cooling' | 'none';

interface HeatCoolButtonsProps {
  heatingState: HeatingState;
  setHeatingState: (s: HeatingState) => void;
  heatColor?: 'orange' | 'red' | 'amber';
  coolColor?: 'cyan' | 'blue' | 'sky';
  layout?: 'horizontal' | 'stacked';
  showInstruction?: boolean;
  disabled?: boolean;
}

const COLOR_MAP = {
  orange: {
    active: 'bg-orange-100 border-orange-400 text-orange-700 scale-95 shadow-inner',
    idle: 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50 shadow-md',
  },
  red: {
    active: 'bg-red-100 border-red-400 text-red-700 scale-95 shadow-inner',
    idle: 'bg-white border-red-200 text-red-600 hover:bg-red-50 shadow-md',
  },
  amber: {
    active: 'bg-amber-100 border-amber-400 text-amber-700 scale-95 shadow-inner',
    idle: 'bg-white border-amber-200 text-amber-600 hover:bg-amber-50 shadow-md',
  },
  cyan: {
    active: 'bg-cyan-100 border-cyan-400 text-cyan-700 scale-95 shadow-inner',
    idle: 'bg-white border-cyan-200 text-cyan-600 hover:bg-cyan-50 shadow-md',
  },
  blue: {
    active: 'bg-blue-100 border-blue-400 text-blue-700 scale-95 shadow-inner',
    idle: 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 shadow-md',
  },
  sky: {
    active: 'bg-sky-100 border-sky-400 text-sky-700 scale-95 shadow-inner',
    idle: 'bg-white border-sky-200 text-sky-600 hover:bg-sky-50 shadow-md',
  },
};

export const HeatCoolButtons: React.FC<HeatCoolButtonsProps> = ({
  heatingState,
  setHeatingState,
  heatColor = 'orange',
  coolColor = 'cyan',
  layout = 'horizontal',
  showInstruction = true,
  disabled = false,
}) => {
  const heatColors = COLOR_MAP[heatColor];
  const coolColors = COLOR_MAP[coolColor];
  const containerClass = layout === 'stacked' ? 'flex flex-col gap-3' : 'flex gap-4 items-center';

  return (
    <div>
      <div className={containerClass}>
        {/* Cool button */}
        <button
          onMouseDown={() => !disabled && setHeatingState('cooling')}
          onMouseUp={() => setHeatingState('none')}
          onMouseLeave={() => setHeatingState('none')}
          onTouchStart={() => !disabled && setHeatingState('cooling')}
          onTouchEnd={() => setHeatingState('none')}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all select-none ${
            disabled ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400' :
            heatingState === 'cooling' ? coolColors.active : coolColors.idle
          }`}
        >
          <Snowflake className={`w-6 h-6 ${heatingState === 'cooling' ? 'animate-spin' : ''}`} style={{ animationDuration: '2s' }} />
          <span className="font-black tracking-wide">COOL</span>
        </button>

        {/* Heat button */}
        <button
          onMouseDown={() => !disabled && setHeatingState('heating')}
          onMouseUp={() => setHeatingState('none')}
          onMouseLeave={() => setHeatingState('none')}
          onTouchStart={() => !disabled && setHeatingState('heating')}
          onTouchEnd={() => setHeatingState('none')}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all select-none ${
            disabled ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400' :
            heatingState === 'heating' ? heatColors.active : heatColors.idle
          }`}
        >
          <Flame className={`w-6 h-6 ${heatingState === 'heating' ? 'animate-pulse' : ''}`} />
          <span className="font-black tracking-wide">HEAT</span>
        </button>
      </div>

      {showInstruction && (
        <p className="text-center text-xs text-slate-400 mt-4 italic">
          Press and hold to add or remove heat energy.
        </p>
      )}
    </div>
  );
};
