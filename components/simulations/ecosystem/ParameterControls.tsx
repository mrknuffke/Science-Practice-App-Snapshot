import React from 'react';
import { Settings2, RotateCcw, Play, Pause } from 'lucide-react';
import { EcosystemParameters, INITIAL_PARAMETERS } from './ecosystemConstants';

interface ParameterControlsProps {
  parameters: EcosystemParameters;
  onParameterChange: (newParams: EcosystemParameters) => void;
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
  tickSpeed: number;
  onTickSpeedChange: (ms: number) => void;
}

const SPEED_LABELS: Record<number, string> = {
  300: 'Slow',
  200: 'Normal',
  100: 'Fast',
  50: 'Very Fast',
};

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  parameters,
  onParameterChange,
  isRunning,
  onToggleRunning,
  onReset,
  tickSpeed,
  onTickSpeedChange,
}) => {
  const handleChange = (key: keyof EcosystemParameters, value: number) => {
    onParameterChange({ ...parameters, [key]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-slate-200 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-emerald-600" />
          Controls
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onToggleRunning}
            className={`p-2 rounded-lg transition-all ${isRunning ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
            title={isRunning ? 'Pause' : 'Play'}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={onReset}
            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
            title="Reset Simulation"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tick Speed */}
      <div className="mb-6">
        <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
          <span>Simulation Speed</span>
          <span className="text-indigo-600">{SPEED_LABELS[tickSpeed] || `${tickSpeed}ms`}</span>
        </label>
        <div className="flex gap-2">
          {[300, 200, 100, 50].map(ms => (
            <button
              key={ms}
              onClick={() => onTickSpeedChange(ms)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                tickSpeed === ms
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {SPEED_LABELS[ms]}
            </button>
          ))}
        </div>
      </div>

      {/* Starting Conditions */}
      <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-4">Starting Conditions</h3>
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter mb-4">Seed counts apply on next reset</p>
        <div className="space-y-5">
          {/* Plant Density */}
          <div>
            <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
              <span>Plant Density</span>
              <span className="text-emerald-600">{Math.round(parameters.seedPlantDensity * 100)}%</span>
            </label>
            <input aria-label="Plant density"
              type="range"
              min={0.1}
              max={0.9}
              step={0.05}
              value={parameters.seedPlantDensity}
              onChange={(e) => handleChange('seedPlantDensity', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Starting Herbivores */}
          <div>
            <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
              <span>Starting Herbivores</span>
              <span className="text-blue-600">{parameters.seedHerbivores}</span>
            </label>
            <input aria-label="Starting herbivores"
              type="range"
              min={10}
              max={150}
              step={5}
              value={parameters.seedHerbivores}
              onChange={(e) => handleChange('seedHerbivores', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Starting Carnivores */}
          <div>
            <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
              <span>Starting Carnivores</span>
              <span className="text-slate-600">{parameters.seedCarnivores}</span>
            </label>
            <input aria-label="Starting carnivores"
              type="range"
              min={5}
              max={50}
              step={5}
              value={parameters.seedCarnivores}
              onChange={(e) => handleChange('seedCarnivores', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Live Simulation Parameters */}
      <div className="space-y-5">
        <div>
          <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
            <span>Plant Regrowth Time</span>
            <span className="text-emerald-600">{parameters.plantRegrowthTime} ticks</span>
          </label>
          <input aria-label="Plant regrowth time"
            type="range"
            min={5}
            max={50}
            step={1}
            value={parameters.plantRegrowthTime}
            onChange={(e) => handleChange('plantRegrowthTime', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        <div>
          <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
            <span>Herbivore Reproduction Chance</span>
            <span className="text-blue-600">{(parameters.herbivoreReproduceChance * 100).toFixed(1)}% / tick</span>
          </label>
          <input aria-label="Herbivore reproduction chance"
            type="range"
            min={0.01}
            max={0.15}
            step={0.005}
            value={parameters.herbivoreReproduceChance}
            onChange={(e) => handleChange('herbivoreReproduceChance', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div>
          <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
            <span>Carnivore Reproduction Chance</span>
            <span className="text-slate-600">{(parameters.carnivoreReproduceChance * 100).toFixed(1)}% / tick</span>
          </label>
          <input aria-label="Carnivore reproduction chance"
            type="range"
            min={0.01}
            max={0.15}
            step={0.005}
            value={parameters.carnivoreReproduceChance}
            onChange={(e) => handleChange('carnivoreReproduceChance', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
          />
        </div>

        <div>
          <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
            <span>Energy from Plant</span>
            <span className="text-emerald-600">{parameters.herbivoreEnergyFromPlant} units</span>
          </label>
          <input aria-label="Energy from a plant"
            type="range"
            min={1}
            max={20}
            step={1}
            value={parameters.herbivoreEnergyFromPlant}
            onChange={(e) => handleChange('herbivoreEnergyFromPlant', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        <div>
          <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
            <span>Energy from Herbivore</span>
            <span className="text-slate-600">{parameters.carnivoreEnergyFromHerbivore} units</span>
          </label>
          <input aria-label="Energy from a herbivore"
            type="range"
            min={5}
            max={50}
            step={1}
            value={parameters.carnivoreEnergyFromHerbivore}
            onChange={(e) => handleChange('carnivoreEnergyFromHerbivore', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
          />
        </div>
      </div>

      {/* Reset to defaults */}
      <button
        onClick={() => onParameterChange(INITIAL_PARAMETERS)}
        className="w-full mt-6 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all uppercase tracking-wider"
      >
        Reset Parameters to Defaults
      </button>
    </div>
  );
};
