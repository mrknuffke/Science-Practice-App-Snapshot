/**
 * PopulationGeneticsView: main orchestrator for the
 * Hardy-Weinberg Population Genetics simulation.
 *
 * Layout: 8-col main area (population grid + graphs) | 4-col control panel
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dna, Activity, BarChart2, GitBranch, Info, Trophy } from 'lucide-react';
import SimulationHeader from '../shared/SimulationHeader';
import { ExportButtons } from '../shared/ExportButtons';
import AboutPanel from '../shared/AboutPanel';
import { HW_ABOUT } from './hwAbout';
import HWControlPanel from './HWControlPanel';
import PopulationGrid from './PopulationGrid';
import HWFrequencyGraphs from './HWFrequencyGraphs';
import HWStatsPanel from './HWStatsPanel';
import { DEFAULT_PARAMS, HWParams, HWState, TICK_SPEEDS } from './hwConstants';
import { initPopulation, stepGeneration } from './hwEngine';
import { ChallengeDeck } from '../shared/ChallengeDeck';
import { HW_CHALLENGES } from './hwChallenges';

interface PopulationGeneticsViewProps {
  onBack: () => void;
}

const PopulationGeneticsView: React.FC<PopulationGeneticsViewProps> = ({ onBack }) => {
  const [hwState, setHwState] = useState<HWState>(() => initPopulation(DEFAULT_PARAMS));
  const [params, setParams] = useState<HWParams>(DEFAULT_PARAMS);
  const [isRunning, setIsRunning] = useState(false);
  const [tickSpeed, setTickSpeed] = useState(TICK_SPEEDS[1].ms); // Normal
  const [showAlleleGraph, setShowAlleleGraph] = useState(true);
  const [showGenotypeGraph, setShowGenotypeGraph] = useState(true);
  const [showAbout, setShowAbout] = useState(false);

  const requestRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const tickSpeedRef = useRef(tickSpeed);
  tickSpeedRef.current = tickSpeed;
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const tick = useCallback((time: number) => {
    if (isRunning) {
      if (time - lastUpdateRef.current > tickSpeedRef.current) {
        setHwState(prev => stepGeneration(prev, paramsRef.current));
        lastUpdateRef.current = time;
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  }, [isRunning]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [tick]);

  const handleToggleRunning = () => setIsRunning(r => !r);

  const handleReset = () => {
    setIsRunning(false);
    setHwState(initPopulation(params));
  };

  const handleParamsChange = (newParams: HWParams) => {
    setParams(newParams);
    // If not running, reinitialize so user sees the new starting state
    if (!isRunning) {
      setHwState(initPopulation(newParams));
    }
  };

  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(0);

  const handleVerifyChallenge = () => {
    const cur = HW_CHALLENGES[challengeIdx];

    if (cur.id === 'hw_null') {
      if (params.selectionEnabled || params.mutationEnabled || params.geneFlowEnabled || params.inbreedingEnabled) {
        return { success: false, message: 'Hardy-Weinberg equilibrium is a null baseline: turn off selection, mutation, gene flow, and inbreeding.' };
      }
      if (hwState.generation < 25) {
        return { success: false, message: `Generation ${hwState.generation} of 25. Let the population reproduce for at least 25 generations to confirm stability.` };
      }
      const pDiff = Math.abs(hwState.p - 0.50);
      if (pDiff <= 0.05) {
        return { success: true, message: `Over ${hwState.generation} generations, allele frequency p held rock-steady at ${hwState.p.toFixed(3)} (|Δ| = ${pDiff.toFixed(3)}). Evolution stood still.` };
      }
      return { success: false, message: `Allele frequency wandered too much: p = ${hwState.p.toFixed(3)} (|Δ| = ${pDiff.toFixed(3)} > 0.05). Increase population size to N = 1000 to eliminate genetic drift.` };
    }

    if (cur.id === 'selection_recessive') {
      if (!params.selectionEnabled || params.fitnessaa > 0.05) {
        return { success: false, message: 'Enable natural selection and set fitness of aa to 0.0 to exert maximum selection pressure.' };
      }
      if (hwState.generation < 30) {
        return { success: false, message: `Generation ${hwState.generation} of 30. Run for at least 30 generations to watch how quickly q drops at first and how it slows down later.` };
      }
      if (hwState.q < 0.20 && hwState.q > 0.01) {
        return { success: true, message: `At generation ${hwState.generation}, q dropped to ${hwState.q.toFixed(3)}, but it is still sheltered in heterozygous carriers (Aa freq = ${hwState.genotypeFreqs.Aa.toFixed(3)}).` };
      }
      return { success: false, message: `Current q = ${hwState.q.toFixed(3)}. Keep the simulation running to drive the recessive allele lower.` };
    }

    if (cur.id === 'genetic_drift') {
      if (params.populationSize > 30) {
        return { success: false, message: 'Drift is most dramatic in small founder groups: dial population size down to N ≤ 30.' };
      }
      if (hwState.p === 1.0 || hwState.p === 0.0) {
        const fixedAllele = hwState.p === 1.0 ? 'A' : 'a';
        return { success: true, message: `Allele ${fixedAllele} reached 100% by generation ${hwState.generation} purely through random gamete sampling in a small population.` };
      }
      return { success: false, message: `Current frequencies: p = ${hwState.p.toFixed(3)}, q = ${hwState.q.toFixed(3)}. Keep running generations until random drift drives one allele to complete fixation (1.0 or 0.0).` };
    }

    if (cur.id === 'heterozygote_advantage') {
      if (!params.selectionEnabled || params.fitnessAa <= params.fitnessAA || params.fitnessAa <= params.fitnessaa) {
        return { success: false, message: 'Overdominance requires heterozygotes (Aa) to have strictly higher fitness than both homozygotes (AA and aa).' };
      }
      if (hwState.generation < 30) {
        return { success: false, message: `Generation ${hwState.generation} of 30. Let the population reproduce for at least 30 generations to see if frequencies lock into an equilibrium plateau.` };
      }
      if (hwState.p >= 0.55 && hwState.p <= 0.75 && hwState.genotypeFreqs.Aa >= 0.40) {
        return { success: true, message: `Balanced polymorphism. At generation ${hwState.generation}, p stabilized at ${hwState.p.toFixed(3)} with heterozygote frequency at ${hwState.genotypeFreqs.Aa.toFixed(3)}.` };
      }
      return { success: false, message: `Current p = ${hwState.p.toFixed(3)}. Continue running to reach the stable equilibrium corridor between 0.55 and 0.75.` };
    }

    return { success: false, message: 'Challenge objective not yet met. Check your settings and give it another run.' };
  };

  const handleApplyChallenge = (idx = challengeIdx) => {
    const cur = HW_CHALLENGES[idx];
    setParams(cur.start);
    setHwState(initPopulation(cur.start));
    setIsRunning(true);
  };

  const handleApplySolution = (idx = challengeIdx) => {
    const cur = HW_CHALLENGES[idx];
    setParams(cur.solutionSetup);
    setHwState(initPopulation(cur.solutionSetup));
    setIsRunning(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-full overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto">
        <SimulationHeader
          title="Population Genetics"
          onBack={onBack}
          icon={Dna}
          gradient="from-blue-600 to-violet-700"
          onOpenAbout={() => setShowAbout(true)}
        />

        {/* Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mt-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setChallengeMode(false)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                !challengeMode
                  ? 'bg-blue-600 text-white shadow-sm'
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
                  ? 'bg-gradient-to-r from-blue-600 to-violet-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              🏆 Genetics Challenges
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
              title="Population Genetics Challenges"
              challenges={HW_CHALLENGES}
              currentIndex={challengeIdx}
              onSelectIndex={idx => {
                setChallengeIdx(idx);
                handleApplyChallenge(idx);
              }}
              onVerify={handleVerifyChallenge}
              onApplySolution={() => handleApplySolution(challengeIdx)}
              solutionUnlockAfter={2}
              accentGradient="from-blue-600 to-violet-700"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* ── Main Area ── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 md:p-4 text-white shadow-lg">
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-80">p (freq A)</p>
                <p className="text-xl md:text-3xl font-black">{hwState.p.toFixed(3)}</p>
              </div>
              <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-3 md:p-4 text-white shadow-lg">
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-80">q (freq a)</p>
                <p className="text-xl md:text-3xl font-black">{hwState.q.toFixed(3)}</p>
              </div>
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-3 md:p-4 text-white shadow-lg">
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-80">Generation</p>
                <p className="text-xl md:text-3xl font-black">{hwState.generation}</p>
              </div>
            </div>

            {/* Fixation warnings */}
            {hwState.p <= 0.001 && hwState.generation > 5 && (
              <div className="bg-emerald-500 text-white rounded-2xl p-4 shadow-xl border-2 border-emerald-600">
                <h3 className="font-black flex items-center gap-2">
                  A allele lost: a allele fixed (p = 0)
                </h3>
                <p className="text-sm mt-1 opacity-90">
                  All individuals are aa. Adjust parameters and reset to try again.
                </p>
              </div>
            )}
            {hwState.p >= 0.999 && hwState.generation > 5 && (
              <div className="bg-blue-500 text-white rounded-2xl p-4 shadow-xl border-2 border-blue-600">
                <h3 className="font-black flex items-center gap-2">
                  A allele fixed (p = 1)
                </h3>
                <p className="text-sm mt-1 opacity-90">
                  All individuals are AA. Adjust parameters and reset to try again.
                </p>
              </div>
            )}

            {/* Population Grid */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-5">
              <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-blue-500" />
                Live Population
                <span className="ml-auto text-xs font-normal text-slate-400">N = {params.populationSize}</span>
              </h3>
              <PopulationGrid individuals={hwState.individuals} />
            </div>

            {/* Stats Panel */}
            <HWStatsPanel state={hwState} params={params} />

            {/* Graph toggle controls */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => {
                  // Prevent turning off the last visible graph
                  if (showAlleleGraph && !showGenotypeGraph) return;
                  setShowAlleleGraph(v => !v);
                }}
                disabled={showAlleleGraph && !showGenotypeGraph}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${showAlleleGraph ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'} ${showAlleleGraph && !showGenotypeGraph ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Activity className="w-4 h-4" />
                Allele Frequency Graph
              </button>
              <button
                onClick={() => {
                  if (showGenotypeGraph && !showAlleleGraph) return;
                  setShowGenotypeGraph(v => !v);
                }}
                disabled={showGenotypeGraph && !showAlleleGraph}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${showGenotypeGraph ? 'bg-violet-600 text-white border-violet-600 shadow' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'} ${showGenotypeGraph && !showAlleleGraph ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <BarChart2 className="w-4 h-4" />
                Genotype Frequency Graph
              </button>
            </div>

            {/* Frequency Graphs */}
            {(showAlleleGraph || showGenotypeGraph) && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-5">
                <div className="flex justify-end mb-2">
                  <ExportButtons
                    csvData={hwState.history.map(h => ({
                      generation: h.generation,
                      p: h.p.toFixed(4),
                      q: h.q.toFixed(4),
                      AA: h.AA.toFixed(4),
                      Aa: h.Aa.toFixed(4),
                      aa: h.aa.toFixed(4),
                    }))}
                    csvFilename="population-genetics"
                    csvHeaders={['generation', 'p', 'q', 'AA', 'Aa', 'aa']}
                  />
                </div>
                <HWFrequencyGraphs
                  history={hwState.history}
                  showAlleleGraph={showAlleleGraph}
                  showGenotypeGraph={showGenotypeGraph}
                />
              </div>
            )}
          </div>

          {/* ── Controls Sidebar ── */}
          <div className="lg:col-span-4 space-y-6">
            <HWControlPanel
              params={params}
              onParamsChange={handleParamsChange}
              isRunning={isRunning}
              onToggleRunning={handleToggleRunning}
              onReset={handleReset}
              tickSpeed={tickSpeed}
              onTickSpeedChange={setTickSpeed}
            />

            {!isRunning && (
              <p className="text-xs text-slate-500 text-center -mt-3">
                Changes to allele frequency, population size, or initial conditions reinitialize the population when paused.
              </p>
            )}

            {/* Concept panel */}
            <div className="bg-indigo-900 rounded-3xl shadow-xl p-6 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Info className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-300" />
                  Evolutionary Forces
                </h3>
                <ul className="space-y-3 text-sm text-indigo-100 font-medium">
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-black">•</span>
                    <span><strong>Genetic Drift:</strong> Random sampling error: strongest in small populations. Can fix or eliminate alleles by chance alone.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-black">•</span>
                    <span><strong>Natural Selection:</strong> Differential survival by genotype. Changes allele frequencies directionally over time.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-black">•</span>
                    <span><strong>Mutation:</strong> Introduces new alleles; pushes p toward mutation-selection balance.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-black">•</span>
                    <span><strong>Gene Flow:</strong> Immigration of individuals from outside: homogenizes allele frequencies between populations.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-black">•</span>
                    <span><strong>Non-Random Mating:</strong> Inbreeding increases homozygosity (AA + aa) and reduces heterozygosity (Aa) without changing p or q.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* HW equilibrium conditions reminder */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3">H-W Equilibrium Requires</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {[
                  'Very large population (no drift)',
                  'No natural selection',
                  'No mutation',
                  'No gene flow',
                  'Random mating',
                ].map((cond, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-black text-[10px]">✓</span>
                    {cond}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AboutPanel
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        content={HW_ABOUT}
        gradient="from-blue-600 to-violet-700"
      />
    </div>
  );
};

export default PopulationGeneticsView;
