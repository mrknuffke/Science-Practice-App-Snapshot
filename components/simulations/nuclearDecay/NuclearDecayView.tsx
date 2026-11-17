import React, { useState, useMemo, useCallback } from 'react';
import { Zap, RotateCcw, Calendar, Trophy } from 'lucide-react';
import SimulationHeader from '../shared/SimulationHeader';
import AboutPanel from '../shared/AboutPanel';
import ChallengeDeck from '../shared/ChallengeDeck';

import {
  ISOTOPES,
  PARTICLE_DECAY_RANKS,
  calculateDecay,
  calculateAgeFromPercent,
} from './nuclearDecayEngine';
import {
  NUCLEAR_CHALLENGES,
  NuclearSetup,
  verifyNuclearChallenge,
} from './nuclearDecayChallenges';
import { NUCLEAR_DECAY_ABOUT } from './nuclearDecayAbout';

interface NuclearDecayViewProps {
  onBack: () => void;
}

export const NuclearDecayView: React.FC<NuclearDecayViewProps> = ({ onBack }) => {
  const [showAbout, setShowAbout] = useState(false);

  // Challenge Mode State
  const [challengeMode, setChallengeMode] = useState<boolean>(false);
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [userAgeInput, setUserAgeInput] = useState<string>('');

  // Simulation Controls State
  const [selectedIsotopeKey, setSelectedIsotopeKey] = useState<string>('C14');
  const [halfLives, setHalfLives] = useState<number>(0); // 0.0 to 5.0
  const [remainingInput, setRemainingInput] = useState<string>('25');

  const isotope = ISOTOPES[selectedIsotopeKey] || ISOTOPES.C14;
  const decayMetrics = useMemo(
    () => calculateDecay(isotope.halfLifeVal, halfLives),
    [isotope.halfLifeVal, halfLives]
  );

  const calcAge = useMemo(
    () => calculateAgeFromPercent(isotope.halfLifeVal, parseFloat(remainingInput)),
    [isotope.halfLifeVal, remainingInput]
  );

  // Apply a challenge setup (start or solution)
  const applySetup = useCallback((setup: NuclearSetup) => {
    setSelectedIsotopeKey(setup.isotopeKey);
    setHalfLives(setup.halfLives);
    setRemainingInput(setup.remainingInput);
    setUserAgeInput(setup.userAge !== undefined ? String(setup.userAge) : '');
  }, []);

  const handleReset = () => {
    setHalfLives(0);
    setUserAgeInput('');
  };

  const handleVerifyChallenge = useCallback(() => {
    const cur = NUCLEAR_CHALLENGES[challengeIdx];
    return verifyNuclearChallenge(cur, selectedIsotopeKey, halfLives, userAgeInput);
  }, [challengeIdx, selectedIsotopeKey, halfLives, userAgeInput]);

  const curChallenge = NUCLEAR_CHALLENGES[challengeIdx];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        <SimulationHeader
          title="Nuclear Decay & Radiometric Dating"
          icon={Zap}
          onBack={onBack}
          gradient="from-emerald-500 to-amber-600"
          onOpenAbout={() => setShowAbout(true)}
        />

        {/* Mode Selector Header Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setChallengeMode(false);
                handleReset();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                !challengeMode
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              🧪 Half-Life Sandbox
            </button>
            <button
              onClick={() => {
                setChallengeMode(true);
                applySetup(NUCLEAR_CHALLENGES[challengeIdx].start);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                challengeMode
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              🏺 Radiometric Dating Mysteries
            </button>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline pr-2">
            {challengeMode ? 'Mystery Dating Challenge Active' : 'Free Sandbox Mode'}
          </span>
        </div>

        <AboutPanel
          isOpen={showAbout}
          onClose={() => setShowAbout(false)}
          content={NUCLEAR_DECAY_ABOUT}
          gradient="from-emerald-500 to-amber-600"
        />

        {/* Challenge Deck Banner */}
        {challengeMode && (
          <ChallengeDeck
            title="Radiometric Dating Mysteries"
            challenges={NUCLEAR_CHALLENGES}
            currentIndex={challengeIdx}
            onSelectIndex={idx => {
              setChallengeIdx(idx);
              applySetup(NUCLEAR_CHALLENGES[idx].start);
            }}
            onVerify={handleVerifyChallenge}
            onApplySolution={() => applySetup(NUCLEAR_CHALLENGES[challengeIdx].solutionSetup)}
            solutionUnlockAfter={2}
            accentGradient="from-emerald-500 to-amber-600"
          >
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>
                  Measured Parent Activity: <strong>{curChallenge.measuredPercentRemaining}%</strong>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                  Target Unit: {curChallenge.unit}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder={`Calculated Age in ${curChallenge.unit}`}
                  value={userAgeInput}
                  onChange={e => setUserAgeInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                  aria-label={`Calculated age in ${curChallenge.unit}`}
                />
              </div>
            </div>
          </ChallengeDeck>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <span className="font-bold text-sm">Decay Controls</span>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 transition-colors"
                aria-label="Reset decay slider"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Isotope Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. Select Radioisotope
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(ISOTOPES).map(key => (
                  <button
                    key={key}
                    onClick={() => setSelectedIsotopeKey(key)}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-left ${
                      selectedIsotopeKey === key
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>{ISOTOPES[key].name}</div>
                    <div className="text-[10px] opacity-75 font-mono">
                      t½ = {ISOTOPES[key].halfLifeVal} {ISOTOPES[key].halfLifeUnit}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time / Half-Life Slider */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
              <div className="flex justify-between text-xs font-bold">
                <span>Elapsed Half-Lives ($n$)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {halfLives.toFixed(2)} t½
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.05"
                value={halfLives}
                onChange={e => setHalfLives(Number(e.target.value))}
                className="w-full accent-emerald-500"
                aria-label="Elapsed Half-Lives slider"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 (Fresh)</span>
                <span>1 t½ (50%)</span>
                <span>2 t½ (25%)</span>
                <span>5 t½ (3%)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 font-mono text-xs text-center border border-slate-100 dark:border-slate-800">
                Real Time:{' '}
                <strong>
                  {decayMetrics.realTime.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </strong>{' '}
                {isotope.halfLifeUnit}
              </div>
            </div>

            {/* Radiometric Dating Mini-Calculator */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Radiometric Dating Tool
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.1"
                  max="99.9"
                  step="0.5"
                  value={remainingInput}
                  onChange={e => setRemainingInput(e.target.value)}
                  className="w-20 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-bold"
                  aria-label="Measured percent parent remaining"
                />
                <span className="text-xs text-slate-500">% Parent Remaining</span>
              </div>
              {calcAge && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-mono space-y-1">
                  <div>
                    Half-lives elapsed: <strong>{calcAge.nHalfLives.toFixed(2)}</strong>
                  </div>
                  <div>
                    Estimated age:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {calcAge.age.toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
                      {isotope.halfLifeUnit}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grid & Graph Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* 100-Particle Nucleon Grid Card */}
            <div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="font-bold text-sm text-slate-600 dark:text-slate-300">
                  100-Nucleus Particulate Sandbox
                </h3>
                <div className="flex gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: isotope.parentColor }}
                    ></span>
                    {isotope.symbol}-{isotope.mass}: <strong>{decayMetrics.parentCount}%</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block bg-slate-400"></span>
                    {isotope.daughterSymbol}-{isotope.daughterMass}:{' '}
                    <strong>{100 - decayMetrics.parentCount}%</strong>
                  </span>
                </div>
              </div>

              {/* 10x10 Particle Grid */}
              <div className="grid grid-cols-10 gap-1.5 sm:gap-2 p-3 sm:p-4 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 place-items-center">
                {PARTICLE_DECAY_RANKS.map((rank, idx) => {
                  const isParent = rank < decayMetrics.parentCount;
                  return (
                    <div
                      key={idx}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-white transition-all duration-300 shadow-sm"
                      style={{
                        backgroundColor: isParent ? isotope.parentColor : isotope.daughterColor,
                        transform: isParent ? 'scale(1)' : 'scale(0.85)',
                        opacity: isParent ? 1 : 0.6,
                      }}
                      title={isParent ? `${isotope.name} (Parent)` : `${isotope.daughterSymbol} (Daughter)`}
                    >
                      {isParent ? isotope.symbol : isotope.daughterSymbol}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Balanced Nuclear Reaction & Decay Curve */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Balanced Equation Card */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 text-xs space-y-3">
                <h4 className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Balanced Nuclear Transmutation
                </h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-center font-mono text-sm md:text-base font-bold overflow-x-auto">
                  <span>
                    <sup>{isotope.mass}</sup>
                    <sub>{isotope.atomicNum}</sub>
                    {isotope.symbol}
                  </span>
                  <span className="mx-2">➔</span>
                  <span>
                    <sup>{isotope.daughterMass}</sup>
                    <sub>{isotope.daughterAtomicNum}</sub>
                    {isotope.daughterSymbol}
                  </span>
                  <span className="mx-2">+</span>
                  <span>
                    {isotope.decayType === 'alpha' ? (
                      <span>
                        <sup>4</sup>
                        <sub>2</sub>α
                      </span>
                    ) : (
                      <span>
                        <sup>0</sup>
                        <sub>-1</sub>β
                      </span>
                    )}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 space-y-1 font-mono">
                  <div>
                    Mass ($A$): {isotope.mass} = {isotope.daughterMass} +{' '}
                    {isotope.decayType === 'alpha' ? 4 : 0} ✓
                  </div>
                  <div>
                    Atomic ($Z$): {isotope.atomicNum} = {isotope.daughterAtomicNum} + (
                    {isotope.decayType === 'alpha' ? 2 : -1}) ✓
                  </div>
                </div>
              </div>

              {/* Exponential Decay Curve Preview */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <h4 className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Decay Profile ($N/N_0$ vs $t$)
                </h4>
                <div className="relative h-28 w-full">
                  <svg viewBox="0 0 200 90" className="w-full h-full">
                    {/* Grid guides */}
                    <line x1="20" y1="10" x2="190" y2="10" stroke="#cbd5e1" strokeDasharray="2 2" strokeWidth="0.5" />
                    <line x1="20" y1="45" x2="190" y2="45" stroke="#cbd5e1" strokeDasharray="2 2" strokeWidth="0.5" />
                    <line x1="20" y1="80" x2="190" y2="80" stroke="#94a3b8" strokeWidth="1" />
                    <line x1="20" y1="10" x2="20" y2="80" stroke="#94a3b8" strokeWidth="1" />

                    {[1, 2, 3, 4, 5].map(n => (
                      <line
                        key={n}
                        x1={20 + n * 34}
                        y1="78"
                        x2={20 + n * 34}
                        y2="82"
                        stroke="#64748b"
                        strokeWidth="1"
                      />
                    ))}

                    <path
                      d="M 20 10 Q 54 45, 88 62.5 T 156 75 T 190 78"
                      fill="none"
                      stroke={isotope.parentColor}
                      strokeWidth="2.5"
                    />

                    {/* Current Position Marker */}
                    <circle
                      cx={20 + halfLives * 34}
                      cy={80 - (decayMetrics.parentPercent / 100) * 70}
                      r="4"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0 t½ (100%)</span>
                  <span>1 t½ (50%)</span>
                  <span>2 t½ (25%)</span>
                  <span>3 t½ (12.5%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuclearDecayView;
