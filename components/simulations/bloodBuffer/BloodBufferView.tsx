import React, { useState, useCallback } from 'react';
import { Activity, RotateCcw, ShieldCheck, ShieldAlert, Wind, Trophy } from 'lucide-react';
import SimulationHeader from '../shared/SimulationHeader';
import AboutPanel from '../shared/AboutPanel';
import ChallengeDeck from '../shared/ChallengeDeck';

import {
  BloodBufferState,
  calculateBloodPH,
  classifyBloodStatus,
  getLeChatelierShift,
} from './bloodBufferEngine';
import {
  BLOOD_BUFFER_CHALLENGES,
  BloodBufferSetup,
  verifyBloodBufferChallenge,
} from './bloodBufferChallenges';
import { BLOOD_BUFFER_ABOUT } from './bloodBufferAbout';

interface BloodBufferViewProps {
  onBack: () => void;
}

export const BloodBufferView: React.FC<BloodBufferViewProps> = ({ onBack }) => {
  const [showAbout, setShowAbout] = useState(false);

  // Challenge Mode State
  const [challengeMode, setChallengeMode] = useState<boolean>(false);
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>('');

  // Homeostatic Controls State
  const [state, setState] = useState<BloodBufferState>({
    respRate: 14,
    metabolicAcid: 0,
    isBuffered: true,
    isRebreathing: false,
  });

  // Load a setup (neutral start or solution)
  const applySetup = useCallback((setup: BloodBufferSetup) => {
    setState({
      respRate: setup.respRate,
      metabolicAcid: setup.metabolicAcid,
      isBuffered: setup.isBuffered,
      isRebreathing: setup.isRebreathing,
    });
    setSelectedDiagnosis(setup.diagnosis || '');
  }, []);

  const currentPH = calculateBloodPH(state);
  const statusInfo = classifyBloodStatus(currentPH);
  const shiftDirection = getLeChatelierShift(state.respRate, state.metabolicAcid, currentPH);

  const handleReset = () => {
    setState({
      respRate: 14,
      metabolicAcid: 0,
      isBuffered: true,
      isRebreathing: false,
    });
    setSelectedDiagnosis('');
  };

  const handleVerifyChallenge = useCallback(() => {
    const cur = BLOOD_BUFFER_CHALLENGES[challengeIdx];
    return verifyBloodBufferChallenge(cur, state, selectedDiagnosis);
  }, [challengeIdx, state, selectedDiagnosis]);

  // Convert pH (6.8 to 8.0) to dial rotation angle (-80deg to +80deg)
  const angle = ((currentPH - 7.4) / 0.6) * 80;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        <SimulationHeader
          title="Arterial Blood Buffers"
          icon={Activity}
          onBack={onBack}
          gradient="from-rose-500 to-indigo-600"
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
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              🧪 Buffer Sandbox
            </button>
            <button
              onClick={() => {
                setChallengeMode(true);
                applySetup(BLOOD_BUFFER_CHALLENGES[challengeIdx].start);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                challengeMode
                  ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              🏥 Clinical ER Acid-Base Cases
            </button>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline pr-2">
            {challengeMode ? 'Clinical Case Simulator Active' : 'Free Sandbox Mode'}
          </span>
        </div>

        <AboutPanel
          isOpen={showAbout}
          onClose={() => setShowAbout(false)}
          content={BLOOD_BUFFER_ABOUT}
          gradient="from-rose-500 to-indigo-600"
        />

        {/* Challenge Deck Banner */}
        {challengeMode && (
          <ChallengeDeck
            title="Clinical ER Acid-Base Cases"
            challenges={BLOOD_BUFFER_CHALLENGES}
            currentIndex={challengeIdx}
            onSelectIndex={idx => {
              setChallengeIdx(idx);
              applySetup(BLOOD_BUFFER_CHALLENGES[idx].start);
            }}
            onVerify={handleVerifyChallenge}
            onApplySolution={() => applySetup(BLOOD_BUFFER_CHALLENGES[challengeIdx].solutionSetup)}
            solutionUnlockAfter={2}
            accentGradient="from-rose-500 to-indigo-600"
          >
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  1. Clinical Diagnosis:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'metabolic_acidosis', label: 'Metabolic Acidosis' },
                    { id: 'respiratory_acidosis', label: 'Respiratory Acidosis' },
                    { id: 'metabolic_alkalosis', label: 'Metabolic Alkalosis' },
                    { id: 'respiratory_alkalosis', label: 'Respiratory Alkalosis' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedDiagnosis(item.id)}
                      className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                        selectedDiagnosis === item.id
                          ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-xl text-slate-600 dark:text-slate-300">
                <strong>2. Clinical Compensation Target:</strong> Adjust the respiratory levers in the panel below until
                arterial blood pH is restored to the safe homeostatic corridor (<strong>7.35 to 7.45</strong>).
                Current pH:{' '}
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {currentPH.toFixed(2)}
                </span>
              </div>
            </div>
          </ChallengeDeck>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <span className="font-bold text-sm">Physiological Levers</span>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 transition-colors"
                aria-label="Reset simulation controls"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Buffer Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {state.isBuffered ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                )}
                <div className="text-xs">
                  <div className="font-bold">
                    {state.isBuffered ? 'Bicarbonate Buffer Active' : 'Unbuffered Saline'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {state.isBuffered ? 'Physiological Dampening' : 'Raw [H+] Sensitivity'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setState(prev => ({ ...prev, isBuffered: !prev.isBuffered }))}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  state.isBuffered ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {state.isBuffered ? 'Buffered' : 'Unbuffered'}
              </button>
            </div>

            {/* Respiratory Rate Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-sky-500" /> Respiratory Rate
                </span>
                <span className="font-mono text-sky-600 dark:text-sky-400">
                  {state.respRate} bpm{' '}
                  {state.respRate > 20
                    ? '(Hyperventilation)'
                    : state.respRate < 10
                      ? '(Hypoventilation)'
                      : '(Normal)'}
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="40"
                step="1"
                value={state.respRate}
                onChange={e => setState(prev => ({ ...prev, respRate: Number(e.target.value) }))}
                className="w-full accent-sky-500"
                aria-label="Respiratory Rate slider"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>4 (Depressed)</span>
                <span>14 (Resting)</span>
                <span>40 (Tachypneic)</span>
              </div>
            </div>

            {/* Metabolic Acid/Base Injections */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Metabolic Disturbances
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setState(prev => ({ ...prev, metabolicAcid: Math.min(5, prev.metabolicAcid + 1) }))}
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-all"
                >
                  + Add Acid (Keto/Lactic)
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, metabolicAcid: Math.max(-5, prev.metabolicAcid - 1) }))}
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-all"
                >
                  + Add Base (HCO₃⁻)
                </button>
              </div>

              {/* Rebreathing Paper Bag Rescue */}
              <button
                onClick={() => setState(prev => ({ ...prev, isRebreathing: !prev.isRebreathing }))}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  state.isRebreathing
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>🛍️</span>{' '}
                {state.isRebreathing
                  ? 'Rebreathing Mask Applied (CO₂ Trapped)'
                  : 'Apply Rebreathing Mask (Hyperventilation Rescue)'}
              </button>
            </div>
          </div>

          {/* Dial Gauge & Biochemical Visualizer */}
          <div className="lg:col-span-8 space-y-6">
            {/* Clinical pH Dial Card */}
            <div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-slate-600 dark:text-slate-300">
                  Arterial Blood pH Gauge
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>

              {/* Semicircular SVG Dial */}
              <div className="relative w-64 sm:w-72 h-36 sm:h-40 flex items-center justify-center">
                <svg viewBox="0 0 200 110" className="w-full h-full">
                  {/* Acidosis zone: 6.8 to 7.35 */}
                  <path d="M 20 100 A 80 80 0 0 1 85 22" fill="none" stroke="#f43f5e" strokeWidth="14" strokeLinecap="round" />
                  {/* Safe zone: 7.35 to 7.45 */}
                  <path d="M 85 22 A 80 80 0 0 1 115 22" fill="none" stroke="#10b981" strokeWidth="16" />
                  {/* Alkalosis zone: 7.45 to 8.0 */}
                  <path d="M 115 22 A 80 80 0 0 1 180 100" fill="none" stroke="#6366f1" strokeWidth="14" strokeLinecap="round" />

                  {/* Target Homeostatic Corridor Marker */}
                  <line x1="100" y1="12" x2="100" y2="28" stroke="#ffffff" strokeWidth="2" />

                  {/* Needle */}
                  <g transform={`rotate(${angle}, 100, 100)`}>
                    <line x1="100" y1="100" x2="100" y2="20" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="100" cy="100" r="8" fill="#1e293b" />
                    <circle cx="100" cy="22" r="3" fill="#ef4444" />
                  </g>
                </svg>

                {/* Live Readout Text */}
                <div className="absolute bottom-2 text-center">
                  <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-800 dark:text-white">
                    {currentPH.toFixed(2)}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    Normal: 7.35 to 7.45
                  </div>
                </div>
              </div>
            </div>

            {/* Le Chatelier Equilibrium Vector Card */}
            <div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="font-bold text-sm text-slate-600 dark:text-slate-300">
                Le Chatelier Equilibrium Response
              </h3>

              {/* Chemical Equation with Dynamic Highlights */}
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-around font-mono text-xs sm:text-sm md:text-base font-bold overflow-x-auto">
                <span className={`transition-all ${state.respRate > 20 ? 'opacity-30' : state.respRate < 10 ? 'text-sky-500 scale-110' : ''}`}>
                  CO₂(g)
                </span>
                <span className="text-slate-400">+ H₂O</span>

                <div className="flex flex-col items-center px-1">
                  <span className={`text-sm sm:text-base font-black transition-all ${shiftDirection === 'right' ? 'text-rose-500 scale-125' : 'text-slate-400'}`}>
                    {shiftDirection === 'right' ? '➔➔' : '⇄'}
                  </span>
                  <span className={`text-sm sm:text-base font-black transition-all ${shiftDirection === 'left' ? 'text-indigo-500 scale-125' : ''}`}>
                    {shiftDirection === 'left' ? '⬅⬅' : ''}
                  </span>
                </div>

                <span className="text-slate-400">H₂CO₃</span>
                <span className="text-slate-400">⇄</span>

                <span className={`transition-all ${currentPH < 7.35 ? 'text-rose-500 scale-110' : currentPH > 7.45 ? 'opacity-30' : ''}`}>
                  H⁺
                </span>
                <span className="text-slate-400">+</span>
                <span className={`transition-all ${state.metabolicAcid < 0 ? 'text-indigo-500 scale-110' : ''}`}>
                  HCO₃⁻
                </span>
              </div>

              {/* Clinical Explanatory Feedback */}
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700">
                {shiftDirection === 'right' && (
                  <p>
                    <strong className="text-rose-600 dark:text-rose-400">Acidosis Shift:</strong> Elevated CO₂ or
                    excess metabolic H⁺ shifts equilibrium rightward. Respiratory compensation accelerates breathing to
                    blow off CO₂ and consume excess H⁺.
                  </p>
                )}
                {shiftDirection === 'left' && (
                  <p>
                    <strong className="text-indigo-600 dark:text-indigo-400">Alkalosis Shift:</strong> Depleted CO₂
                    from rapid hyperventilation pulls the reaction leftward, consuming H⁺ and elevating pH. Rebreathing
                    mask application restores CO₂ partial pressure.
                  </p>
                )}
                {shiftDirection === 'balanced' && (
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ Perfect Homeostasis: Carbonic acid generation balances bicarbonate buffering. Arterial blood pH
                    is within optimal enzymatic operating thresholds.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodBufferView;
