import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Leaf, Activity, Info, Trophy } from 'lucide-react';
import AboutPanel from '../shared/AboutPanel';
import { ECOSYSTEM_ABOUT } from './ecosystemAbout';
import { EcosystemCanvas } from './EcosystemCanvas';
import { ParameterControls } from './ParameterControls';
import { PopulationGraph } from './PopulationGraph';
import {
  seedEcosystem,
  updateEcosystem,
} from './ecologyEngine';
import {
  ECOSYSTEM_CANVAS,
  INITIAL_PARAMETERS,
  COLORS,
  EcosystemParameters,
  EcosystemState
} from './ecosystemConstants';
import SimulationHeader from '../shared/SimulationHeader';
import { ExportButtons } from '../shared/ExportButtons';
import { ChallengeDeck } from '../shared/ChallengeDeck';
import { ECOSYSTEM_CHALLENGES } from './ecosystemChallenges';

interface EcosystemSimulationViewProps {
  onBack: () => void;
}

const EcosystemSimulationView: React.FC<EcosystemSimulationViewProps> = ({ onBack }) => {
  const [parameters, setParameters] = useState<EcosystemParameters>(INITIAL_PARAMETERS);
  // Seed immediately so the canvas shows the initial population on first mount;
  // user elects when to start (no auto-run).
  const [state, setState] = useState<EcosystemState>(() => seedEcosystem(INITIAL_PARAMETERS));
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<Array<{tick: number, plants: number, herbivores: number, carnivores: number}>>([]);
  const [tickSpeed, setTickSpeed] = useState(200);
  const [showAbout, setShowAbout] = useState(false);

  const requestRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const tickSpeedRef = useRef(tickSpeed);
  tickSpeedRef.current = tickSpeed;

  const tick = useCallback((time: number) => {
    if (isRunning) {
      if (time - lastUpdateRef.current > tickSpeedRef.current) {
        setState(prev => {
          const next = updateEcosystem(prev, parameters);

          if (next.tick % 10 === 0) {
            setHistory(h => [...h, {
              tick: next.tick,
              plants: next.plantCount,
              herbivores: next.herbivoreCount,
              carnivores: next.carnivoreCount
            }].slice(-200));
          }

          return next;
        });
        lastUpdateRef.current = time;
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  }, [isRunning, parameters]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [tick]);

  const handleToggleRunning = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setState(seedEcosystem(parameters));
    setHistory([]);
    setIsRunning(false);
  };

  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(0);

  const handleVerifyChallenge = () => {
    const cur = ECOSYSTEM_CHALLENGES[challengeIdx];

    if (cur.id === 'green_world') {
      if (parameters.seedCarnivores > 0 || state.carnivoreCount > 0) {
        return { success: false, message: 'This challenge explores two trophic levels: keep carnivores set to 0.' };
      }
      if (state.tick < 80) {
        return { success: false, message: `Tick ${state.tick} of 80. Keep the simulation running to prove the balance holds over multiple generations.` };
      }
      if (state.plantCount >= 100 && state.herbivoreCount >= 20) {
        return { success: true, message: `You kept a stable two-trophic ecosystem going for ${state.tick} ticks (${state.plantCount} plants, ${state.herbivoreCount} herbivores).` };
      }
      return { success: false, message: `The balance slipped: you have ${state.plantCount} plants (need at least 100) and ${state.herbivoreCount} herbivores (need at least 20). Try tweaking plant regrowth or herbivore birth rate.` };
    }

    if (cur.id === 'three_trophic') {
      if (state.tick < 100) {
        return { success: false, message: `Tick ${state.tick} of 100. Keep running to ensure all three populations stay in dynamic balance.` };
      }
      if (state.plantCount >= 50 && state.herbivoreCount >= 15 && state.carnivoreCount >= 8) {
        return { success: true, message: `All three trophic levels are coexisting at tick ${state.tick} (${state.plantCount} plants, ${state.herbivoreCount} herbivores, ${state.carnivoreCount} carnivores).` };
      }
      return { success: false, message: `One or more populations fell below threshold: ${state.plantCount} plants (need ≥ 50), ${state.herbivoreCount} herbivores (need ≥ 15), ${state.carnivoreCount} carnivores (need ≥ 8). Watch the cycles and rebalance.` };
    }

    if (cur.id === 'trophic_cascade') {
      if (state.plantCount >= 250) {
        return { success: true, message: `The trophic cascade worked: predators checked the herbivore population, allowing vegetation to surge past ${state.plantCount} plants.` };
      }
      return { success: false, message: `Current vegetation: ${state.plantCount}/250 plants. Give your predators more time to curb the herbivore herd so plants can regrow.` };
    }

    return { success: false, message: 'Challenge objective not yet met. Check your settings and give it another run.' };
  };

  const handleApplyChallenge = (idx = challengeIdx) => {
    const cur = ECOSYSTEM_CHALLENGES[idx];
    setParameters(cur.start);
    setState(seedEcosystem(cur.start));
    setHistory([]);
    setIsRunning(true);
  };

  const handleApplySolution = (idx = challengeIdx) => {
    const cur = ECOSYSTEM_CHALLENGES[idx];
    setParameters(cur.solutionSetup);
    setState(seedEcosystem(cur.solutionSetup));
    setHistory([]);
    setIsRunning(true);
  };

  const herbivoreExtinct = state.herbivoreCount === 0 && state.tick > 50;
  const carnivoreExtinct = state.carnivoreCount === 0 && state.tick > 50;
  const ecosystemCollapsed = herbivoreExtinct && carnivoreExtinct;

  const graphRef = useRef<HTMLDivElement>(null);
  const csvData = history.map(h => ({ tick: h.tick, plants: h.plants, herbivores: h.herbivores, carnivores: h.carnivores }));

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        <SimulationHeader
          title="Ecosystem Dynamics"
          onBack={onBack}
          icon={Leaf}
          gradient="from-emerald-600 to-teal-700"
          onOpenAbout={() => setShowAbout(true)}
        />

        {/* Mode Switcher */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setChallengeMode(false)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                !challengeMode
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              🧪 Free Exploration Lab
            </button>
            <button
              onClick={() => {
                setChallengeMode(true);
                handleApplyChallenge();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                challengeMode
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              🏆 Ecosystem Challenges
            </button>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline pr-2">
            {challengeMode ? 'Formative Assessment Mode Active' : 'Sandbox Mode'}
          </span>
        </div>

        {/* Challenge Deck Banner */}
        {challengeMode && (
          <div className="mt-4">
            <ChallengeDeck
              title="Ecosystem Challenges"
              challenges={ECOSYSTEM_CHALLENGES}
              currentIndex={challengeIdx}
              onSelectIndex={idx => {
                setChallengeIdx(idx);
                handleApplyChallenge(idx);
              }}
              onVerify={handleVerifyChallenge}
              onApplySolution={() => handleApplySolution(challengeIdx)}
              solutionUnlockAfter={2}
              accentGradient="from-emerald-600 to-teal-700"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Main Simulation Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* Live Stats Panel */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-3 md:p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-80">Plants</p>
                    <p className="text-xl md:text-3xl font-black">{state.plantCount}</p>
                  </div>
                  <Leaf className="w-8 h-8 md:w-12 md:h-12 opacity-30 hidden sm:block" />
                </div>
              </div>
              <div className={`bg-gradient-to-br ${herbivoreExtinct ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600'} rounded-2xl p-3 md:p-4 text-white shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-80">
                      Herbivores {herbivoreExtinct && <span className="block sm:inline">⚠️ EXTINCT</span>}
                    </p>
                    <p className="text-xl md:text-3xl font-black">{state.herbivoreCount}</p>
                  </div>
                  <Activity className="w-8 h-8 md:w-12 md:h-12 opacity-30 hidden sm:block" />
                </div>
              </div>
              <div className={`bg-gradient-to-br ${carnivoreExtinct ? 'from-red-500 to-red-600' : 'from-slate-700 to-slate-800'} rounded-2xl p-3 md:p-4 text-white shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-80">
                      Carnivores {carnivoreExtinct && <span className="block sm:inline">⚠️ EXTINCT</span>}
                    </p>
                    <p className="text-xl md:text-3xl font-black">{state.carnivoreCount}</p>
                  </div>
                  <Activity className="w-8 h-8 md:w-12 md:h-12 opacity-30 hidden sm:block" />
                </div>
              </div>
            </div>

            {/* Collapse Warning */}
            {ecosystemCollapsed && (
              <div className="bg-red-500 text-white rounded-2xl p-6 shadow-xl border-4 border-red-600">
                <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                  ⚠️ Ecosystem Collapse
                </h3>
                <p className="text-sm font-medium">
                  All animal populations have gone extinct. Adjust parameters and reset to try again.
                </p>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-2 relative">
              <EcosystemCanvas
                agents={state.agents}
                grid={state.grid}
                width={ECOSYSTEM_CANVAS.WIDTH}
                height={ECOSYSTEM_CANVAS.HEIGHT}
              />
              {/* Legend: hidden on small screens (shown below), visible on md+ as overlay */}
              <div className="hidden md:block absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-slate-200">
                <h4 className="text-xs font-black text-slate-700 uppercase mb-2">Legend</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-emerald-400 border border-emerald-500" />
                    <span className="text-slate-700 font-medium">Plants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-amber-200 border border-amber-300" />
                    <span className="text-slate-700 font-medium">Bare Ground</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 14 14">
                      <ellipse cx="7" cy="8" rx="5.5" ry="4.5" fill={COLORS.HERBIVORE} stroke="#1d4ed8" strokeWidth="0.8" />
                      <circle cx="11" cy="5" r="2.5" fill={COLORS.HERBIVORE} stroke="#1d4ed8" strokeWidth="0.8" />
                    </svg>
                    <span className="text-slate-700 font-medium">Herbivore</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 12 12">
                      <path
                        d="M1 3.5C1 3 1.3 2.4 1.7 2L3.5 0.4C3.9 0.1 4.4 0 4.9 0.15L6.2 0.8L7.5 0.15C8 0 8.5 0.1 8.9 0.4L10.7 2C11.1 2.4 11.4 3 11.4 3.5C11.4 4.1 11.2 4.6 10.7 5L10 5.7V7.3C10 7.9 9.5 8.4 8.8 8.4H8L7 9.5C6.5 10 5.9 10 5.4 9.5L4.4 8.4H3.6C2.9 8.4 2.4 7.9 2.4 7.3V5.7L1.7 5C1.2 4.6 1 4.1 1 3.5Z"
                        fill={COLORS.CARNIVORE}
                        stroke="#1e293b"
                        strokeWidth="0.8"
                      />
                    </svg>
                    <span className="text-slate-700 font-medium">Carnivore</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Legend: mobile only, shown inline below canvas */}
            <div className="md:hidden flex flex-wrap gap-3 text-xs bg-white rounded-2xl px-4 py-3 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-emerald-400 border border-emerald-500" />
                <span className="text-slate-700 font-medium">Plants</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-amber-200 border border-amber-300" />
                <span className="text-slate-700 font-medium">Bare Ground</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 14 14">
                  <ellipse cx="7" cy="8" rx="5.5" ry="4.5" fill={COLORS.HERBIVORE} stroke="#1d4ed8" strokeWidth="0.8" />
                  <circle cx="11" cy="5" r="2.5" fill={COLORS.HERBIVORE} stroke="#1d4ed8" strokeWidth="0.8" />
                </svg>
                <span className="text-slate-700 font-medium">Herbivore</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 12 12">
                  <path
                    d="M1 3.5C1 3 1.3 2.4 1.7 2L3.5 0.4C3.9 0.1 4.4 0 4.9 0.15L6.2 0.8L7.5 0.15C8 0 8.5 0.1 8.9 0.4L10.7 2C11.1 2.4 11.4 3 11.4 3.5C11.4 4.1 11.2 4.6 10.7 5L10 5.7V7.3C10 7.9 9.5 8.4 8.8 8.4H8L7 9.5C6.5 10 5.9 10 5.4 9.5L4.4 8.4H3.6C2.9 8.4 2.4 7.9 2.4 7.3V5.7L1.7 5C1.2 4.6 1 4.1 1 3.5Z"
                    fill={COLORS.CARNIVORE}
                    stroke="#1e293b"
                    strokeWidth="0.8"
                  />
                </svg>
                <span className="text-slate-700 font-medium">Carnivore</span>
              </div>
            </div>

            <div ref={graphRef} className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
               <div className="flex items-center justify-between gap-2 mb-4">
                 <div className="flex items-center gap-2">
                   <Activity className="w-5 h-5 text-blue-500" />
                   <h3 className="text-lg font-black text-slate-800">Population Trends</h3>
                 </div>
                 <ExportButtons
                   csvData={csvData}
                   csvFilename="ecosystem-population"
                   csvHeaders={['tick', 'plants', 'herbivores', 'carnivores']}
                   graphRef={graphRef as React.RefObject<HTMLElement>}
                   pngFilename="ecosystem-graph"
                 />
               </div>
               <PopulationGraph history={history} />
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <ParameterControls
              parameters={parameters}
              onParameterChange={setParameters}
              isRunning={isRunning}
              onToggleRunning={handleToggleRunning}
              onReset={handleReset}
              tickSpeed={tickSpeed}
              onTickSpeedChange={setTickSpeed}
            />

            <div className="bg-indigo-900 rounded-3xl shadow-xl p-6 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Info className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-300" />
                  Ecological Principles
                </h3>
                <ul className="space-y-3 text-sm text-indigo-100 font-medium">
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-black">•</span>
                    <span><strong>Carrying Capacity:</strong> The maximum population an environment can sustain, limited by food availability.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-black">•</span>
                    <span><strong>Trophic Cascade:</strong> Changes in predator populations ripple through the food web to affect producers.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-black">•</span>
                    <span><strong>Predator-Prey Cycles:</strong> Predator and prey populations naturally oscillate: more prey leads to more predators, which reduces prey, which reduces predators.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AboutPanel
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        content={ECOSYSTEM_ABOUT}
        gradient="from-emerald-600 to-teal-700"
      />
    </div>
  );
};

export default EcosystemSimulationView;
