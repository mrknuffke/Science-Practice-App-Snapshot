import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wind, Trophy } from 'lucide-react';
import SimulationHeader from '../shared/SimulationHeader';
import AboutPanel from '../shared/AboutPanel';
import ChallengeDeck from '../shared/ChallengeDeck';
import { GasCanvas } from './GasCanvas';
import { GasLawsControls } from './GasLawsControls';
import { GasLawsGraph, GasLawsDataPoint } from './GasLawsGraph';
import {
  GasState,
  GasType,
  initGasState,
  stepGasLaws,
  createParticle,
} from './gasLawsEngine';
import { INITIAL_GAS_A_COUNT, INITIAL_GAS_B_COUNT, INITIAL_PISTON_Y, HEAT_DELTA, COOL_DELTA, PISTON_MIN, PISTON_MAX, GRAPH_HISTORY_MAX } from './gasLawsConstants';
import { GAS_LAWS_ABOUT } from './gasLawsAbout';
import { ExportButtons } from '../shared/ExportButtons';
import {
  GAS_LAWS_CHALLENGES,
  verifyGasLawsChallenge,
  applyGasLawsChallengeSolution,
} from './gasLawsChallenges';

interface GasLawsViewProps {
  onBack: () => void;
}

export const GasLawsView: React.FC<GasLawsViewProps> = ({ onBack }) => {
  const [showAbout, setShowAbout] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [indestructible, setIndestructible] = useState(false);
  const indestructibleRef = useRef(false);
  useEffect(() => { indestructibleRef.current = indestructible; }, [indestructible]);
  const [ventOpen, setVentOpen] = useState(false);

  // Piston Y is the user-facing control (volume)
  const [pistonY, setPistonY] = useState(INITIAL_PISTON_Y);

  // Press-and-hold heat/cool (mirrors Phase Change's HeatCoolButtons interaction)
  const [heatingState, setHeatingState] = useState<'heating' | 'cooling' | 'none'>('none');
  const heatingStateRef = useRef<'heating' | 'cooling' | 'none'>('none');
  useEffect(() => { heatingStateRef.current = heatingState; }, [heatingState]);

  // Live gas state lives in a ref (mutable, 60fps), only summary values go to React state
  const gasStateRef = useRef<GasState | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Graph data (React state, updated at ~4fps)
  const [history, setHistory] = useState<GasLawsDataPoint[]>([]);
  const [displayState, setDisplayState] = useState({ temperature: 0, pressureA: 0, pressureB: 0, totalPressure: 0, isBroken: false, countA: INITIAL_GAS_A_COUNT, countB: INITIAL_GAS_B_COUNT });

  const rafRef = useRef<number>();
  const tickRef = useRef(0);
  const graphAccRef = useRef(0);

  const initSim = useCallback(() => {
    gasStateRef.current = initGasState(INITIAL_PISTON_Y, INITIAL_GAS_A_COUNT, INITIAL_GAS_B_COUNT);
    setPistonY(INITIAL_PISTON_Y);
    setHistory([]);
    setHeatingState('none');
    setVentOpen(false);
    tickRef.current = 0;
    graphAccRef.current = 0;
  }, []);

  useEffect(() => {
    initSim();
  }, [initSim]);

  // Auto-resume the sim when user presses Heat/Cool while paused
  const handleSetHeatingState = useCallback((s: 'heating' | 'cooling' | 'none') => {
    setHeatingState(s);
    if (s !== 'none') setIsRunning(true);
  }, []);

  const tick = useCallback(() => {
    const s = gasStateRef.current;
    if (!s) { rafRef.current = requestAnimationFrame(tick); return; }

    if (!isRunning) { rafRef.current = requestAnimationFrame(tick); return; }

    // Step physics: heat/cool driven by held button state
    const heatDelta = heatingStateRef.current === 'heating' ? HEAT_DELTA
                    : heatingStateRef.current === 'cooling' ? -COOL_DELTA
                    : 0;

    if (s.ventOpen !== ventOpen) s.ventOpen = ventOpen;
    gasStateRef.current = stepGasLaws(s, pistonY, heatDelta, indestructibleRef.current);
    tickRef.current++;
    graphAccRef.current++;

    // Update React state at ~4fps for graph + display
    if (graphAccRef.current >= 15) {
      const ns = gasStateRef.current;
      const countA = ns.particles.filter(p => p.type === 'A').length;
      const countB = ns.particles.filter(p => p.type === 'B').length;
      const volumePct = Math.round(((PISTON_MAX - ns.pistonY) / (PISTON_MAX - PISTON_MIN)) * 100);

      setDisplayState({
        temperature: ns.temperature,
        pressureA: ns.pressureA,
        pressureB: ns.pressureB,
        totalPressure: ns.totalPressure,
        isBroken: ns.isBroken,
        countA,
        countB,
      });

      if (!ns.isBroken) {
        setHistory(prev => {
          const raw = {
            tick: tickRef.current,
            temperature: ns.temperature,
            pressure: ns.totalPressure,
            pressureA: ns.pressureA,
            pressureB: ns.pressureB,
            volume: volumePct,
          };
          const win = [...prev.slice(-4), raw];
          const avg = (key: 'temperature' | 'pressure' | 'pressureA' | 'pressureB' | 'volume') =>
            win.reduce((s, p) => s + p[key], 0) / win.length;
          const smoothed = {
            tick: raw.tick,
            temperature: avg('temperature'),
            pressure: avg('pressure'),
            pressureA: avg('pressureA'),
            pressureB: avg('pressureB'),
            volume: avg('volume'),
          };
          const next = [...prev, smoothed];
          return next.length > GRAPH_HISTORY_MAX ? next.slice(next.length - GRAPH_HISTORY_MAX) : next;
        });
      }

      graphAccRef.current = 0;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [isRunning, pistonY, ventOpen]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [tick]);

  const handleChangeParticles = (type: GasType, delta: number) => {
    const s = gasStateRef.current;
    if (!s) return;

    let nextParticles: typeof s.particles;
    if (delta > 0) {
      const newParticles = Array.from({ length: delta }, () => createParticle(type, s.pistonY));
      nextParticles = [...s.particles, ...newParticles];
    } else {
      let toRemove = -delta;
      const result: typeof s.particles = [];
      for (let i = s.particles.length - 1; i >= 0; i--) {
        if (toRemove > 0 && s.particles[i].type === type) { toRemove--; continue; }
        result.unshift(s.particles[i]);
      }
      nextParticles = result;
    }

    gasStateRef.current = { ...s, particles: nextParticles };
    const countA = nextParticles.filter(p => p.type === 'A').length;
    const countB = nextParticles.filter(p => p.type === 'B').length;
    setDisplayState(prev => ({ ...prev, countA, countB }));
  };

  const handleReset = () => {
    initSim();
    setIsRunning(true);
    setDisplayState({ temperature: 0, pressureA: 0, pressureB: 0, totalPressure: 0, isBroken: false, countA: INITIAL_GAS_A_COUNT, countB: INITIAL_GAS_B_COUNT });
  };

  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(0);

  const handleApplyChallenge = (idx: number) => {
    handleReset();
    setIndestructible(true);
    const challenge = GAS_LAWS_CHALLENGES[idx];
    if (!challenge) return;
    setPistonY(challenge.start.pistonY);
    if (gasStateRef.current) {
      gasStateRef.current.pistonY = challenge.start.pistonY;
    }
  };

  const handleVerifyChallenge = () => {
    const challenge = GAS_LAWS_CHALLENGES[challengeIdx];
    if (!challenge) return { success: false, message: 'Select a challenge to begin.' };
    return verifyGasLawsChallenge(challenge.id, {
      temperature: displayState.temperature,
      totalPressure: displayState.totalPressure,
      pressureA: displayState.pressureA,
      pressureB: displayState.pressureB,
      pistonY,
      countA: displayState.countA,
      countB: displayState.countB,
    });
  };

  const handleApplySolution = (idx: number) => {
    setIndestructible(true);
    const challenge = GAS_LAWS_CHALLENGES[idx];
    if (!challenge || !gasStateRef.current) return;
    const { countA, countB } = applyGasLawsChallengeSolution(
      challenge,
      gasStateRef.current,
      setPistonY
    );
    setDisplayState(prev => ({ ...prev, countA, countB }));
  };

  // Stop holding heat/cool when the vessel breaks (button no longer represents reality)
  useEffect(() => {
    if (displayState.isBroken && heatingState !== 'none') setHeatingState('none');
  }, [displayState.isBroken, heatingState]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <SimulationHeader
            title="Ideal Gas Laws"
            onBack={onBack}
            icon={Wind}
            gradient="from-sky-500 to-indigo-600"
            onOpenAbout={() => setShowAbout(true)}
          />
          <button
            onClick={() => {
              const next = !challengeMode;
              setChallengeMode(next);
              if (next) handleApplyChallenge(challengeIdx);
            }}
            className={`self-start sm:self-center flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all shadow-md ${
              challengeMode
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            <Trophy className={`w-4 h-4 ${challengeMode ? 'text-slate-950' : 'text-amber-500'}`} />
            <span>{challengeMode ? 'Exit Challenges' : 'Challenge Mode'}</span>
          </button>
        </div>

        {/* Vessel broken warning */}
        {displayState.isBroken && (
          <div className="mb-4 bg-red-50 border-2 border-red-300 text-red-800 rounded-2xl px-6 py-3 font-bold text-center flex items-center justify-center gap-3">
            <span className="text-2xl">💥</span>
            The vessel exceeded its pressure limit. Click Reset to start over.
            <button
              onClick={handleReset}
              className="ml-4 px-4 py-1.5 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700 transition-colors"
            >
              Reset
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">

          {/* Main: Canvas + Graph */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {challengeMode && (
              <ChallengeDeck
                title="Gas Laws Mastery Challenges"
                challenges={GAS_LAWS_CHALLENGES}
                currentIndex={challengeIdx}
                onSelectIndex={idx => {
                  setChallengeIdx(idx);
                  handleApplyChallenge(idx);
                }}
                onVerify={handleVerifyChallenge}
                onApplySolution={() => handleApplySolution(challengeIdx)}
                solutionUnlockAfter={2}
                accentGradient="from-sky-500 to-indigo-600"
                className="mb-1"
              />
            )}

            <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 shadow-inner overflow-hidden">
              <GasCanvas
                stateRef={gasStateRef}
                ref={canvasRef}
                onPistonDrag={(y) => {
                  const clamped = Math.max(PISTON_MIN, Math.min(PISTON_MAX, y));
                  setPistonY(clamped);
                  if (gasStateRef.current) gasStateRef.current.pistonY = clamped;
                }}
              />
            </div>

            {/* Stats: mirrors Phase Change's Temp + Phase Mix layout */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 text-center">
                <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Temperature</span>
                <span className="text-3xl font-black text-orange-600">{displayState.temperature.toFixed(0)} K</span>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pressure</span>
                  <span className="text-sm font-black text-rose-600">{displayState.totalPressure.toFixed(1)}</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 mb-2">
                  {(() => {
                    const tot = displayState.pressureA + displayState.pressureB;
                    const aPct = tot > 0 ? (displayState.pressureA / tot) * 100 : 0;
                    const bPct = tot > 0 ? (displayState.pressureB / tot) * 100 : 0;
                    return (
                      <>
                        <div className="bg-red-500" style={{ width: `${aPct}%` }} />
                        <div className="bg-blue-500" style={{ width: `${bPct}%` }} />
                      </>
                    );
                  })()}
                </div>
                <div className="flex justify-between text-[10px] font-black tracking-wider">
                  <span className="text-red-600">P<sub>A</sub> {displayState.pressureA.toFixed(1)}</span>
                  <span className="text-blue-600">P<sub>B</sub> {displayState.pressureB.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <ExportButtons
                csvData={history.map(h => ({ tick: h.tick, temperature: h.temperature.toFixed(1), pressure: h.pressure.toFixed(2), pressureA: h.pressureA.toFixed(2), pressureB: h.pressureB.toFixed(2), volume: h.volume }))}
                csvFilename="gas-laws-data"
                csvHeaders={['tick', 'temperature', 'pressure', 'pressureA', 'pressureB', 'volume']}
              />
            </div>
            <GasLawsGraph history={history} />
          </div>

          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <GasLawsControls
              isRunning={isRunning}
              onTogglePlay={() => setIsRunning(r => !r)}
              onReset={handleReset}
              onChangeParticles={handleChangeParticles}
              heatingState={heatingState}
              setHeatingState={handleSetHeatingState}
              indestructible={indestructible}
              onToggleIndestructible={() => setIndestructible(v => !v)}
              ventOpen={ventOpen}
              onToggleVent={() => setVentOpen(v => !v)}
              pistonY={pistonY}
              onPistonChange={(y) => {
                setPistonY(y);
                if (gasStateRef.current) gasStateRef.current.pistonY = y;
              }}
              pistonMin={PISTON_MIN}
              pistonMax={PISTON_MAX}
              countA={displayState.countA}
              countB={displayState.countB}
            />

            {/* Gas laws quick-reference */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 text-white">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Gas Laws Quick Ref</h3>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-28 text-sky-400 font-bold">Boyle's</span>
                  <span className="text-slate-300">PV = const (fixed T, n)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-28 text-orange-400 font-bold">Charles's</span>
                  <span className="text-slate-300">V/T = const (fixed P, n)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-28 text-rose-400 font-bold">Gay-Lussac's</span>
                  <span className="text-slate-300">P/T = const (fixed V, n)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-28 text-emerald-400 font-bold">Avogadro's</span>
                  <span className="text-slate-300">V/n = const (fixed T, P)</span>
                </div>
                <div className="h-px bg-slate-700 my-1" />
                <div className="flex items-center gap-2">
                  <span className="w-28 text-violet-400 font-bold">Ideal Gas</span>
                  <span className="text-slate-300">PV = nRT</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-28 text-amber-400 font-bold">Dalton's</span>
                  <span className="text-slate-300">P<sub>tot</sub> = P<sub>A</sub> + P<sub>B</sub></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AboutPanel
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        content={GAS_LAWS_ABOUT}
        gradient="from-sky-500 to-indigo-600"
      />
    </div>
  );
};

export default GasLawsView;
