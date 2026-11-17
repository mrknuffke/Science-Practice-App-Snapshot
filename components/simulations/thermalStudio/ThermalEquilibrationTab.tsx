import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Play, Trophy } from 'lucide-react';
import { METALS, LIQUIDS, MetalData, LiquidData } from './thermalStudioConstants';
import ChallengeDeck, { ChallengeDef } from '../shared/ChallengeDeck';

interface ThermalEquilibrationChallengeDef extends ChallengeDef {
  targetMetal: string;
  targetLiquid: string;
  mMetal: number;
  tMetal: number;
  mLiquid: number;
  tLiquid: number;
  expectedVal: number;
  unit: string;
  tolerancePct: number;
}

const EQUILIBRATION_CHALLENGES: ThermalEquilibrationChallengeDef[] = [
  {
    id: 'eq-1',
    title: 'Unknown Metal X: Specific Heat Capacity',
    description: 'Determine the specific heat capacity c_X of Unknown Metal X (in J/g·°C) by submerging a 60.0 g hot sample (110.0 °C) into 100.0 g of water (20.0 °C).',
    hints: [
      'What temperature does the combined system reach when thermal equilibrium is established?',
      'Conservation of energy requires q_lost + q_gained = 0, so m_X · c_X · (T_eq - T_i,X) = -[m_w · c_w · (T_eq - T_i,w)].',
      'Submerge the 60.0 g sample of Metal X (110.0 °C) into 100.0 g of water (20.0 °C), observe T_eq, and solve for c_X.',
    ],
    targetMetal: 'UnkX',
    targetLiquid: 'water',
    mMetal: 60,
    tMetal: 110,
    mLiquid: 100,
    tLiquid: 20,
    expectedVal: 0.240,
    unit: 'J/g·°C',
    tolerancePct: 7
  },
  {
    id: 'eq-2',
    title: 'Lead Low Heat Capacity Transfer',
    description: 'Find the heat in Joules (J) absorbed by the water when 100.0 g of hot lead at 130.0 °C cools in 100.0 g of water starting at 22.0 °C.',
    hints: [
      'Which substance is absorbing heat energy, and how is its temperature changing?',
      'The heat absorbed by the liquid is given by q_water = m_water · c_water · (T_eq - T_initial,water), where c_water = 4.184 J/g·°C.',
      'Run the equilibration, note the final equilibrium temperature, and compute q_water.',
    ],
    targetMetal: 'Pb',
    targetLiquid: 'water',
    mMetal: 100,
    tMetal: 130,
    mLiquid: 100,
    tLiquid: 22,
    expectedVal: 1354,
    unit: 'J',
    tolerancePct: 6
  },
  {
    id: 'eq-3',
    title: 'Ethanol Thermal Absorption Comparison',
    description: 'Predict and verify the final equilibrium temperature in °C when 80.0 g of copper at 100.0 °C is placed into 120.0 g of ethanol at 20.0 °C.',
    hints: [
      'Why does a liquid with a lower specific heat capacity experience a larger temperature rise for the same amount of heat absorbed?',
      'Equating heat lost by copper to heat gained by ethanol yields T_eq = (m_m·c_m·T_m + m_l·c_l·T_l) / (m_m·c_m + m_l·c_l).',
      'Submerge 80.0 g of copper at 100.0 °C into 120.0 g of ethanol at 20.0 °C, and measure the plateau temperature.',
    ],
    targetMetal: 'Cu',
    targetLiquid: 'ethanol',
    mMetal: 80,
    tMetal: 100,
    mLiquid: 120,
    tLiquid: 20,
    expectedVal: 27.6,
    unit: '°C',
    tolerancePct: 4
  },
  {
    id: 'eq-4',
    title: 'Unknown Metal Y: Identification',
    description: 'Identify the specific heat capacity c_Y of Unknown Metal Y (in J/g·°C) when a 75.0 g sample at 100.0 °C equilibrates in 150.0 g of water at 21.0 °C.',
    hints: [
      'How does the temperature change of the water compare to the temperature change of Metal Y?',
      'Equate heat lost to heat gained: c_Y = [m_w · c_w · (T_eq - T_w)] / [m_Y · (T_Y - T_eq)].',
      'Submerge Metal Y, note the plateau temperature, and compute c_Y.',
    ],
    targetMetal: 'UnkY',
    targetLiquid: 'water',
    mMetal: 75,
    tMetal: 100,
    mLiquid: 150,
    tLiquid: 21,
    expectedVal: 0.160,
    unit: 'J/g·°C',
    tolerancePct: 7
  }
];

export const ThermalEquilibrationTab: React.FC = () => {
  // Mode
  const [challengeMode, setChallengeMode] = useState<boolean>(false);
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');

  // Parameters
  const [selectedMetal, setSelectedMetal] = useState<string>('Al');
  const [metalMass, setMetalMass] = useState<number>(60);
  const [metalTemp, setMetalTemp] = useState<number>(100);

  const [selectedLiquid, setSelectedLiquid] = useState<string>('water');
  const [liquidMass, setLiquidMass] = useState<number>(100);
  const [liquidTemp, setLiquidTemp] = useState<number>(20);

  // Simulation run state
  const [isSubmerged, setIsSubmerged] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 1
  const [history, setHistory] = useState<Array<{ t: number; tMetal: number; tLiquid: number }>>([]);

  const metal: MetalData = METALS[selectedMetal] || METALS.Al;
  const liquid: LiquidData = LIQUIDS[selectedLiquid] || LIQUIDS.water;

  // Theoretical equilibrium calculation
  const tFinal =
    (metalMass * metal.c * metalTemp + liquidMass * liquid.c * liquidTemp) /
    (metalMass * metal.c + liquidMass * liquid.c);

  const qLiquid = liquidMass * liquid.c * (tFinal - liquidTemp);
  const qMetal = metalMass * metal.c * (tFinal - metalTemp);

  // Animation Loop
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSubmerged) {
      setProgress(0);
      setHistory([]);
      return;
    }

    const duration = 4000; // 4 seconds equilibration
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const frac = Math.min(1, elapsed / duration);
      // Exponential asymptotic convergence
      const smoothProgress = 1 - Math.exp(-4.5 * frac);
      setProgress(smoothProgress);

      const curTm = metalTemp + (tFinal - metalTemp) * smoothProgress;
      const curTl = liquidTemp + (tFinal - liquidTemp) * smoothProgress;

      setHistory(prev => {
        const timeSec = (elapsed / 1000);
        if (prev.length === 0 || timeSec - prev[prev.length - 1].t >= 0.1) {
          return [...prev, { t: timeSec, tMetal: curTm, tLiquid: curTl }];
        }
        return prev;
      });

      if (frac < 1) {
        animRef.current = requestAnimationFrame(update);
      }
    };

    animRef.current = requestAnimationFrame(update);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isSubmerged, tFinal, liquidTemp, metalTemp]);

  const handleReset = () => {
    setIsSubmerged(false);
    setProgress(0);
    setHistory([]);
  };

  const handleApplyChallenge = (idx: number = challengeIdx) => {
    const cur = EQUILIBRATION_CHALLENGES[idx];
    setSelectedMetal(cur.targetMetal);
    setSelectedLiquid(cur.targetLiquid);
    setMetalMass(cur.mMetal);
    setMetalTemp(cur.tMetal);
    setLiquidMass(cur.mLiquid);
    setLiquidTemp(cur.tLiquid);
    setIsSubmerged(false);
    setProgress(0);
    setHistory([]);
    setUserAnswer('');
  };

  const handleApplySolution = (idx: number = challengeIdx) => {
    handleApplyChallenge(idx);
    const cur = EQUILIBRATION_CHALLENGES[idx];
    setUserAnswer(String(cur.expectedVal));
  };

  const handleVerifyChallenge = () => {
    const num = parseFloat(userAnswer);
    if (isNaN(num)) {
      return { success: false, message: 'Please enter a valid numeric calculation to test.' };
    }
    const cur = EQUILIBRATION_CHALLENGES[challengeIdx];
    const diff = Math.abs(num - cur.expectedVal);
    const pct = (diff / cur.expectedVal) * 100;
    if (pct <= cur.tolerancePct) {
      return {
        success: true,
        message: `Your calculated value of ${num} ${cur.unit} is accurate within ${pct.toFixed(1)}% of theory (${cur.expectedVal} ${cur.unit}).`
      };
    }
    return {
      success: false,
      message: `Your answer of ${num} ${cur.unit} is outside tolerance (expected ~${cur.expectedVal} ${cur.unit}). Check: q_lost = -q_gained and solve carefully.`
    };
  };

  const curTMetal = metalTemp + (tFinal - metalTemp) * progress;
  const curTLiquid = liquidTemp + (tFinal - liquidTemp) * progress;
  const curChallenge = EQUILIBRATION_CHALLENGES[challengeIdx];

  return (
    <div className="space-y-6">
      {/* Mode Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setChallengeMode(false)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              !challengeMode
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Free Exploration Sandbox
          </button>
          <button
            onClick={() => {
              setChallengeMode(true);
              handleApplyChallenge(challengeIdx);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              challengeMode
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Specific Heat Challenges
          </button>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline pr-2 font-mono">
          q = m · c · ΔT
        </span>
      </div>

      {/* Challenge Deck */}
      {challengeMode && (
        <ChallengeDeck
          title="Specific Heat Challenges"
          challenges={EQUILIBRATION_CHALLENGES}
          currentIndex={challengeIdx}
          onSelectIndex={idx => {
            setChallengeIdx(idx);
            handleApplyChallenge(idx);
          }}
          onVerify={handleVerifyChallenge}
          onApplySolution={() => handleApplySolution(challengeIdx)}
          solutionUnlockAfter={2}
          accentGradient="from-amber-500 to-rose-600"
        >
          <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Enter Your Calculated Value:</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono text-xs">Units: {curChallenge.unit}</span>
            </div>
            <div className="flex gap-2">
              <input aria-label="Your calculated value"
                type="number"
                step="any"
                placeholder={`Calculated value in ${curChallenge.unit}`}
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </ChallengeDeck>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <span className="font-bold text-sm">System Parameters</span>
            <button
              onClick={handleReset}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Metal Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Solid Metal Sample
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {Object.keys(METALS).map(key => (
                <button
                  key={key}
                  disabled={isSubmerged}
                  onClick={() => setSelectedMetal(key)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                    selectedMetal === key
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  } ${isSubmerged ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {METALS[key].symbol}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-mono pt-1">
              <span>{metal.name}</span>
              <span>{selectedMetal.startsWith('Unk') ? 'c = ?' : `c = ${metal.c} J/g·°C`}</span>
            </div>
          </div>

          {/* Sliders: Metal */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between text-xs font-bold">
              <span>Metal Mass</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono">{metalMass} g</span>
            </div>
            <input aria-label="Metal mass"
              type="range"
              min="10"
              max="150"
              step="5"
              disabled={isSubmerged}
              value={metalMass}
              onChange={e => setMetalMass(Number(e.target.value))}
              className="w-full accent-amber-500 disabled:opacity-50"
            />

            <div className="flex justify-between text-xs font-bold">
              <span>Metal Initial Temp (T_i)</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono">{metalTemp} °C</span>
            </div>
            <input aria-label="Metal initial temperature"
              type="range"
              min="40"
              max="180"
              step="5"
              disabled={isSubmerged}
              value={metalTemp}
              onChange={e => setMetalTemp(Number(e.target.value))}
              className="w-full accent-amber-500 disabled:opacity-50"
            />
          </div>

          {/* Liquid Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Calorimeter Liquid
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(LIQUIDS).map(key => (
                <button
                  key={key}
                  disabled={isSubmerged}
                  onClick={() => setSelectedLiquid(key)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                    selectedLiquid === key
                      ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  } ${isSubmerged ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {LIQUIDS[key].name.split(' ')[0]}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-mono pt-1">
              <span>{liquid.name}</span>
              <span>c = {liquid.c} J/g·°C</span>
            </div>
          </div>

          {/* Sliders: Liquid */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between text-xs font-bold">
              <span>Liquid Mass</span>
              <span className="text-sky-600 dark:text-sky-400 font-mono">{liquidMass} g</span>
            </div>
            <input aria-label="Liquid mass"
              type="range"
              min="50"
              max="250"
              step="10"
              disabled={isSubmerged}
              value={liquidMass}
              onChange={e => setLiquidMass(Number(e.target.value))}
              className="w-full accent-sky-500 disabled:opacity-50"
            />

            <div className="flex justify-between text-xs font-bold">
              <span>Liquid Initial Temp (T_i)</span>
              <span className="text-sky-600 dark:text-sky-400 font-mono">{liquidTemp} °C</span>
            </div>
            <input aria-label="Liquid initial temperature"
              type="range"
              min="10"
              max="35"
              step="1"
              disabled={isSubmerged}
              value={liquidTemp}
              onChange={e => setLiquidTemp(Number(e.target.value))}
              className="w-full accent-sky-500 disabled:opacity-50"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={() => setIsSubmerged(true)}
            disabled={isSubmerged}
            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
              isSubmerged
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:brightness-110 active:scale-95'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            {isSubmerged
              ? progress >= 0.98
                ? 'Equilibrium Reached'
                : 'Thermal Exchange Active...'
              : 'Submerge & Equilibrate'}
          </button>
        </div>

        {/* Visual Chamber & Readouts Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Visual Chamber */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-600 dark:text-slate-300">
                Calorimeter Cross-Section &amp; Dual Probes
              </h3>
              <div className="flex gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  Metal: <strong>{curTMetal.toFixed(1)} °C</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
                  Liquid: <strong>{curTLiquid.toFixed(1)} °C</strong>
                </span>
              </div>
            </div>

            {/* SVG Apparatus */}
            <div className="relative h-64 w-full bg-slate-100 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
              <svg viewBox="0 0 500 240" className="w-full h-full">
                {/* Calorimeter Outer Vessel */}
                <path
                  d="M 160 35 L 180 215 Q 250 225 320 215 L 340 35 Z"
                  fill="#e2e8f0"
                  stroke="#94a3b8"
                  strokeWidth="4"
                />
                {/* Inner Insulation Chamber */}
                <path
                  d="M 172 40 L 188 205 Q 250 215 312 205 L 328 40 Z"
                  fill="#f8fafc"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                />
                {/* Liquid Reservoir */}
                <path
                  d="M 178 95 Q 250 102 322 95 L 310 203 Q 250 213 190 203 Z"
                  fill={liquid.color}
                  fillOpacity="0.45"
                />

                {/* Probe A: Liquid Thermometer */}
                <rect x="210" y="20" width="7" height="150" rx="3.5" fill="#cbd5e1" />
                <rect x="212" y="22" width="3" height="146" rx="1.5" fill="#0284c7" />
                <circle cx="213.5" cy="170" r="9" fill="#0284c7" />

                {/* Submerged or Suspended Metal Cylinder */}
                <g
                  transform={`translate(260, ${
                    isSubmerged ? 45 + 130 * Math.min(1, progress * 2.5) : 45
                  })`}
                  style={{ transition: isSubmerged ? 'none' : 'transform 0.4s ease' }}
                >
                  <rect
                    x="-18"
                    y="-25"
                    width="36"
                    height="50"
                    rx="4"
                    fill={metal.color}
                    stroke="#1e293b"
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {metal.symbol}
                  </text>
                  {/* Embedded Probe B in Metal */}
                  <line x1="0" y1="-25" x2="0" y2="-60" stroke="#cbd5e1" strokeWidth="3" />
                  <circle cx="0" cy="-60" r="4" fill="#d97706" />
                </g>

                {/* Stirring Rod */}
                <path d="M 295 20 L 295 180 L 285 180" stroke="#64748b" strokeWidth="3" fill="none" />
              </svg>

              {/* Thermal Wave Ripples */}
              {isSubmerged && progress < 0.95 && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border-4 border-amber-400/40 animate-ping"></div>
                </div>
              )}
            </div>
          </div>

          {/* Live Heat Logging & Energy Balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Real-time Heat Metrics */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 text-xs space-y-3">
              <h4 className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-xs">
                Thermodynamic Heat Accounting
              </h4>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Liquid Heat Gain (q_l):</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    +{(qLiquid * progress).toFixed(1)} J
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Metal Heat Loss (q_m):</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {(qMetal * progress).toFixed(1)} J
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500">Net Energy Sum (Σq):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {((qLiquid + qMetal) * progress).toFixed(2)} J (Isolated System)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Equilibrium Temp (T_eq):</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {tFinal.toFixed(2)} °C
                  </span>
                </div>
              </div>
            </div>

            {/* Asymptotic Thermal Curve Mini-Graph */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 text-xs space-y-2 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-xs">
                  Equilibration Curve (T vs. Time)
                </h4>
                <span className="font-mono text-xs text-slate-400">
                  {progress >= 0.98 ? 'Equilibrium' : isSubmerged ? 'Logging...' : 'Standby'}
                </span>
              </div>

              <div className="h-28 w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-2 relative overflow-hidden border border-slate-100 dark:border-slate-800">
                <svg viewBox="0 0 200 80" className="w-full h-full">
                  {/* Grid lines */}
                  <line x1="0" y1="20" x2="200" y2="20" stroke="#e2e8f0" strokeWidth="0.5" />
                  <line x1="0" y1="40" x2="200" y2="40" stroke="#e2e8f0" strokeWidth="0.5" />
                  <line x1="0" y1="60" x2="200" y2="60" stroke="#e2e8f0" strokeWidth="0.5" />

                  {/* Metal decay curve */}
                  {history.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      points={history
                        .map(pt => {
                          const x = (pt.t / 4) * 200;
                          const y = 80 - ((pt.tMetal - 10) / (metalTemp - 10 || 1)) * 70;
                          return `${x},${Math.max(5, Math.min(75, y))}`;
                        })
                        .join(' ')}
                    />
                  )}

                  {/* Liquid rise curve */}
                  {history.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      points={history
                        .map(pt => {
                          const x = (pt.t / 4) * 200;
                          const y = 80 - ((pt.tLiquid - 10) / (metalTemp - 10 || 1)) * 70;
                          return `${x},${Math.max(5, Math.min(75, y))}`;
                        })
                        .join(' ')}
                    />
                  )}

                  {/* Equilibrium asymptote dashed line */}
                  {isSubmerged && (
                    <line
                      x1="0"
                      y1={80 - ((tFinal - 10) / (metalTemp - 10 || 1)) * 70}
                      x2="200"
                      y2={80 - ((tFinal - 10) / (metalTemp - 10 || 1)) * 70}
                      stroke="#10b981"
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    />
                  )}
                </svg>
              </div>

              <div className="flex justify-between text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Metal Curve
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span> Liquid Curve
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Asymptote T_eq
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermalEquilibrationTab;
