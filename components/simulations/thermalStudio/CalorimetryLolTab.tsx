import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Play, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';
import { SALTS, SaltReactionData } from './thermalStudioConstants';
import ChallengeDeck, { ChallengeDef } from '../shared/ChallengeDeck';

interface CalorimetryLolChallengeDef extends ChallengeDef {
  targetSalt: string;
  mSalt: number;
  mWater: number;
  tWater: number;
  expectedVal: number;
  unit: string;
  tolerancePct: number;
}

const CALORIMETRY_LOL_CHALLENGES: CalorimetryLolChallengeDef[] = [
  {
    id: 'lol-1',
    title: 'Cold Pack Enthalpy: Ammonium Nitrate',
    description: 'Calculate the heat in kilojoules (kJ) absorbed when 16.0 g of NH4NO3 (molar mass 80.04 g/mol) dissolves in 100.0 g of water.',
    hints: [
      'Is dissolution of ammonium nitrate endothermic or exothermic, and does thermal energy enter or leave the reaction system?',
      'The molar enthalpy of solution relates heat to moles: q_rxn = n · ΔH_soln (+25.7 kJ/mol), where n = mass / molar mass.',
      'Compute n = 16.0 g / 80.04 g/mol = 0.200 mol, then multiply by +25.7 kJ/mol.',
    ],
    targetSalt: 'nh4no3',
    mSalt: 16.0,
    mWater: 100.0,
    tWater: 22.0,
    expectedVal: 5.14,
    unit: 'kJ',
    tolerancePct: 4
  },
  {
    id: 'lol-2',
    title: 'Hot Pack Exothermic Release: CaCl2',
    description: 'Predict the final solution temperature in °C when 11.1 g of anhydrous CaCl2 (110.98 g/mol) dissolves in 100.0 g of water at 20.0 °C (ΔH_soln = -81.3 kJ/mol).',
    hints: [
      'Where does the heat released by the exothermic lattice breaking and hydration go?',
      'Heat released by reaction warms the total solution mass: q_soln = -q_rxn = m_total · c_water · ΔT.',
      'Find moles (0.100 mol), calculate q_rxn (-8130 J), and solve for ΔT = 8130 J / (111.1 g · 4.184 J/g·°C) to get final temperature.',
    ],
    targetSalt: 'cacl2',
    mSalt: 11.1,
    mWater: 100.0,
    tWater: 20.0,
    expectedVal: 37.5,
    unit: '°C',
    tolerancePct: 4
  },
  {
    id: 'lol-3',
    title: 'Molar Enthalpy from Solution Temperature',
    description: 'Calculate the molar enthalpy of solution ΔH_soln in kJ/mol when 10.0 g of NaOH (40.00 g/mol, 0.250 mol) warms 120.0 g of water by 20.3 °C.',
    hints: [
      'How does the temperature increase of the calorimeter relate to the enthalpy change of the dissolved solute?',
      'By energy conservation: q_soln = m_total · c_water · ΔT, with q_rxn = -q_soln. Then ΔH_soln = q_rxn / n_solute.',
      'Multiply total mass (130.0 g) by 4.184 and 20.3 °C to find q_soln, negate for q_rxn, convert to kJ, and divide by 0.250 mol.',
    ],
    targetSalt: 'naoh',
    mSalt: 10.0,
    mWater: 120.0,
    tWater: 22.0,
    expectedVal: -44.5,
    unit: 'kJ/mol',
    tolerancePct: 5
  },
  {
    id: 'lol-4',
    title: 'KNO3 Endothermic Lattice Dissolution',
    description: 'Find the heat in Joules (J) absorbed when 20.2 g of KNO3 (101.10 g/mol, 0.200 mol) dissolves in 100.0 g of water at 25.0 °C (ΔH_soln = +34.9 kJ/mol).',
    hints: [
      'Does potassium nitrate require energy input from the water to overcome its ionic lattice energy?',
      'Heat absorbed by the reaction equals moles of solute times molar enthalpy of solution: q_rxn = n · ΔH_soln.',
      'Compute n · ΔH_soln = 0.200 mol · 34.9 kJ/mol = 6.98 kJ = 6980 J.',
    ],
    targetSalt: 'kno3',
    mSalt: 20.2,
    mWater: 100.0,
    tWater: 25.0,
    expectedVal: 6980,
    unit: 'J',
    tolerancePct: 3
  }
];

export const CalorimetryLolTab: React.FC = () => {
  // Mode & Challenges
  const [challengeMode, setChallengeMode] = useState<boolean>(false);
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');

  // Reaction parameters
  const [saltKey, setSaltKey] = useState<string>('nh4no3');
  const [saltMass, setSaltMass] = useState<number>(16.0); // g
  const [waterMass, setWaterMass] = useState<number>(100.0); // g
  const [waterTemp, setWaterTemp] = useState<number>(22.0); // °C

  // Simulation run state
  const [isDissolving, setIsDissolving] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const salt: SaltReactionData = SALTS[saltKey] || SALTS.nh4no3;
  const cWater = 4.184; // J/g·°C

  // Thermodynamic calculations
  const moles = saltMass / salt.molarMass;
  // Reaction heat in Joules (positive for endo, negative for exo)
  const qRxnJoules = moles * salt.deltaH * 1000;
  // Solution calorimeter heat (equal & opposite)
  const qSolnJoules = -qRxnJoules;
  const totalSolutionMass = waterMass + saltMass;
  const deltaT = qSolnJoules / (totalSolutionMass * cWater);
  const _finalTemp = waterTemp + deltaT;

  // LOL Discrete Blocks Calculation
  // Total initial bars = initialEthBars + initialEchBars
  const initialEth = salt.initialEthBars;
  const initialEch = salt.initialEchBars;
  // Heat exchange blocks: transfer 2 blocks across boundary
  const qBlockTransfer = 2;
  const isEndo = salt.type === 'endothermic';

  // In endothermic: system absorbs heat (+q), Ech increases (+2), Eth remains in balance
  // In exothermic: system releases heat (-q), Ech decreases (-2), water warms
  const finalEth = isEndo ? initialEth : initialEth;
  const finalEch = isEndo ? initialEch + qBlockTransfer : Math.max(1, initialEch - qBlockTransfer);

  // Animation Loop
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isDissolving) {
      setProgress(0);
      return;
    }

    const duration = 4000; // 4 seconds dissolution
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const frac = Math.min(1, elapsed / duration);
      const smooth = 1 - Math.exp(-4 * frac);
      setProgress(smooth);

      if (frac < 1) {
        animRef.current = requestAnimationFrame(update);
      }
    };

    animRef.current = requestAnimationFrame(update);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isDissolving, saltKey, saltMass, waterMass, waterTemp]);

  const handleReset = () => {
    setIsDissolving(false);
    setProgress(0);
  };

  const handleApplyChallenge = (idx: number = challengeIdx) => {
    const cur = CALORIMETRY_LOL_CHALLENGES[idx];
    setSaltKey(cur.targetSalt);
    setSaltMass(cur.mSalt);
    setWaterMass(cur.mWater);
    setWaterTemp(cur.tWater);
    setIsDissolving(false);
    setProgress(0);
    setUserAnswer('');
  };

  const handleApplySolution = (idx: number = challengeIdx) => {
    handleApplyChallenge(idx);
    const cur = CALORIMETRY_LOL_CHALLENGES[idx];
    setUserAnswer(String(cur.expectedVal));
  };

  const handleVerifyChallenge = () => {
    const num = parseFloat(userAnswer);
    if (isNaN(num)) {
      return { success: false, message: 'Please enter a valid numeric value.' };
    }
    const cur = CALORIMETRY_LOL_CHALLENGES[challengeIdx];
    const diff = Math.abs(num - cur.expectedVal);
    const pct = (diff / Math.abs(cur.expectedVal)) * 100;
    if (pct <= cur.tolerancePct) {
      return {
        success: true,
        message: `Your calculated value of ${num} ${cur.unit} matches theory within ${pct.toFixed(1)}% (${cur.expectedVal} ${cur.unit}).`
      };
    }
    return {
      success: false,
      message: `Your answer of ${num} ${cur.unit} is outside tolerance (expected ~${cur.expectedVal} ${cur.unit}). Check signs and molar conversions.`
    };
  };

  const curSolnTemp = waterTemp + deltaT * progress;
  const curChallenge = CALORIMETRY_LOL_CHALLENGES[challengeIdx];

  // Helper to render stacked integer blocks
  const renderBlocks = (count: number, maxBlocks: number = 8, color: string = 'bg-amber-500') => {
    const blocks = [];
    for (let i = maxBlocks; i >= 1; i--) {
      const isFilled = i <= count;
      blocks.push(
        <div
          key={i}
          className={`w-full h-4 rounded-sm border border-slate-300 dark:border-slate-600 transition-all ${
            isFilled ? color : 'bg-transparent opacity-20'
          }`}
        />
      );
    }
    return <div className="flex flex-col gap-1 w-8">{blocks}</div>;
  };

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
            Free Calorimeter &amp; LOL Balancer
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
            Calorimetry Challenges
          </button>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline pr-2 font-mono">
          q_rxn = -q_calorimeter
        </span>
      </div>

      {/* Challenge Deck */}
      {challengeMode && (
        <ChallengeDeck
          title="Calorimetry Challenges"
          challenges={CALORIMETRY_LOL_CHALLENGES}
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
              <input
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

      {/* Controls & Visuals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <span className="font-bold text-sm">Reaction Controls</span>
            <button
              onClick={handleReset}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Salt Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Solute Salt Reaction
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(SALTS).map(key => (
                <button
                  key={key}
                  disabled={isDissolving}
                  onClick={() => {
                    setSaltKey(key);
                    handleReset();
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-left ${
                    saltKey === key
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  } ${isDissolving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="truncate">{SALTS[key].name}</div>
                  <div className={`text-xs font-mono mt-0.5 ${saltKey === key ? 'text-white' : 'text-slate-400'}`}>
                    ΔH = {SALTS[key].deltaH > 0 ? `+${SALTS[key].deltaH}` : SALTS[key].deltaH} kJ/mol
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 italic pt-1">
              {salt.description}
            </p>
          </div>

          {/* Parameters Sliders */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between text-xs font-bold">
              <span>Solute Mass (m_salt)</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono">
                {saltMass.toFixed(1)} g ({moles.toFixed(3)} mol)
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="35"
              step="0.5"
              disabled={isDissolving}
              value={saltMass}
              onChange={e => {
                setSaltMass(Number(e.target.value));
                handleReset();
              }}
              className="w-full accent-amber-500 disabled:opacity-50"
            />

            <div className="flex justify-between text-xs font-bold">
              <span>Calorimeter Water Mass</span>
              <span className="text-sky-600 dark:text-sky-400 font-mono">{waterMass} g</span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              step="10"
              disabled={isDissolving}
              value={waterMass}
              onChange={e => {
                setWaterMass(Number(e.target.value));
                handleReset();
              }}
              className="w-full accent-sky-500 disabled:opacity-50"
            />

            <div className="flex justify-between text-xs font-bold">
              <span>Initial Water Temp (T_i)</span>
              <span className="text-sky-600 dark:text-sky-400 font-mono">{waterTemp} °C</span>
            </div>
            <input
              type="range"
              min="15"
              max="30"
              step="1"
              disabled={isDissolving}
              value={waterTemp}
              onChange={e => {
                setWaterTemp(Number(e.target.value));
                handleReset();
              }}
              className="w-full accent-sky-500 disabled:opacity-50"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={() => setIsDissolving(true)}
            disabled={isDissolving}
            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
              isDissolving
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:brightness-110 active:scale-95'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            {isDissolving
              ? progress >= 0.98
                ? 'Dissolution Complete'
                : 'Dissolving & Exchanging Heat...'
              : 'Add Solute to Calorimeter'}
          </button>
        </div>

        {/* LOL Diagram & Apparatus Readouts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dynamic LOL Energy Bar Diagram */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-600 dark:text-slate-300">
                  Dynamic LOL Energy Block Diagram
                </h3>
                <span className="text-xs text-slate-400">
                  System = Reaction Solute | Surroundings = Calorimeter Water Solution
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                salt.type === 'endothermic'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
              }`}>
                {salt.type === 'endothermic' ? 'Endothermic (+ΔH)' : 'Exothermic (-ΔH)'}
              </span>
            </div>

            {/* LOL Visualizer Container */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-around">
              {/* Left 'L': Initial State */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial State</span>
                <div className="flex gap-4 items-end bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                  <div className="flex flex-col items-center gap-1">
                    {renderBlocks(initialEth, 6, 'bg-amber-500')}
                    <span className="text-xs font-mono font-bold text-amber-500">E_th ({initialEth})</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    {renderBlocks(initialEch, 6, 'bg-emerald-500')}
                    <span className="text-xs font-mono font-bold text-emerald-500">E_ch ({initialEch})</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">Total = {initialEth + initialEch} Blocks</span>
              </div>

              {/* Center 'O': System Boundary Circle & Heat Vector */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Heat Transfer (q)</span>
                <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-slate-400 dark:border-slate-600 flex flex-col items-center justify-center p-2 bg-white/40 dark:bg-slate-800/40 shadow-sm">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">System</span>
                  <div className={`flex items-center gap-1 my-1 ${
                    isEndo ? 'text-blue-500' : 'text-rose-500'
                  }`}>
                    {isEndo ? (
                      <>
                        <ArrowLeft className="w-5 h-5 animate-pulse" />
                        <span className="font-black text-xs font-mono">+q (in)</span>
                      </>
                    ) : (
                      <>
                        <span className="font-black text-xs font-mono">-q (out)</span>
                        <ArrowRight className="w-5 h-5 animate-pulse" />
                      </>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 text-center">
                    {isEndo ? 'Surroundings cool' : 'Surroundings warm'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  {isDissolving ? `${(qSolnJoules * progress / 1000).toFixed(2)} kJ` : 'Standby'}
                </span>
              </div>

              {/* Right 'L': Final State */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Final State</span>
                <div className="flex gap-4 items-end bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                  <div className="flex flex-col items-center gap-1">
                    {renderBlocks(finalEth, 6, 'bg-amber-500')}
                    <span className="text-xs font-mono font-bold text-amber-500">E_th ({finalEth})</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    {renderBlocks(finalEch, 6, 'bg-emerald-500')}
                    <span className="text-xs font-mono font-bold text-emerald-500">E_ch ({finalEch})</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">Total = {finalEth + finalEch} Blocks</span>
              </div>
            </div>
          </div>

          {/* Calorimeter Solution Readout & Heat Balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thermometer & Solution Apparatus SVG */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-xs">
                  Solution Calorimeter
                </h4>
                <span className="font-mono text-xs font-bold text-indigo-500">
                  T_soln: {curSolnTemp.toFixed(2)} °C
                </span>
              </div>

              <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800">
                <svg viewBox="0 0 320 180" className="w-full h-full">
                  {/* Cup insulation */}
                  <path d="M 80 20 L 95 150 Q 160 160 225 150 L 240 20 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3" />
                  <path d="M 90 25 L 102 145 Q 160 155 218 145 L 230 25 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                  {/* Liquid solution */}
                  <path
                    d="M 94 65 Q 160 70 226 65 L 217 144 Q 160 154 103 144 Z"
                    fill={isEndo ? '#60a5fa' : '#fb923c'}
                    fillOpacity="0.45"
                  />
                  {/* Stirring rod */}
                  <line x1="130" y1="10" x2="130" y2="130" stroke="#64748b" strokeWidth="2.5" />
                  <line x1="125" y1="130" x2="140" y2="130" stroke="#64748b" strokeWidth="2.5" />

                  {/* Digital Thermometer */}
                  <rect x="180" y="10" width="6" height="120" rx="3" fill="#cbd5e1" />
                  <rect x="181.5" y="12" width="3" height="116" rx="1.5" fill={isEndo ? '#0284c7' : '#ef4444'} />
                  <circle cx="183" cy="130" r="7" fill={isEndo ? '#0284c7' : '#ef4444'} />

                  {/* Dissolving salt granules animation */}
                  {isDissolving && progress < 0.9 && (
                    <g className="animate-pulse">
                      <circle cx="150" cy="110" r="2" fill="#ffffff" />
                      <circle cx="160" cy="120" r="2.5" fill="#ffffff" />
                      <circle cx="140" cy="125" r="2" fill="#ffffff" />
                    </g>
                  )}
                </svg>
              </div>
            </div>

            {/* Enthalpy of Solution Equation Accounting */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 text-xs space-y-2.5">
              <h4 className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-xs">
                First Law Enthalpy Accounting
              </h4>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Mass (m_total):</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {totalSolutionMass.toFixed(1)} g
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Temp Change (ΔT):</span>
                  <span className={`font-bold ${deltaT >= 0 ? 'text-rose-500' : 'text-blue-500'}`}>
                    {deltaT >= 0 ? `+${deltaT.toFixed(2)}` : deltaT.toFixed(2)} °C
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Heat of Solution (q_soln):</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {(qSolnJoules / 1000).toFixed(2)} kJ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Reaction Heat (q_rxn = -q_soln):</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {(qRxnJoules / 1000).toFixed(2)} kJ
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Molar Enthalpy (ΔH_soln):</span>
                  <span className={`font-black ${salt.deltaH >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {salt.deltaH >= 0 ? `+${salt.deltaH}` : salt.deltaH} kJ/mol
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalorimetryLolTab;
