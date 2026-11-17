import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FlaskConical, Trophy } from 'lucide-react';
import { KineticParticle, ScenarioMode } from '../../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, REACTANT_PROPERTIES, BASE_ACTIVATION_ENERGY, CATALYST_REDUCTION, ENZYME_DENATURATION_TEMP } from './kineticsConstants';
import { simulateKineticsStep } from './kineticsEngine';
import { ReactionVesselCanvas } from './ReactionVesselCanvas';
import { KineticsControls } from './KineticsControls';
import { KineticsGraph, KineticsGraphData } from './KineticsGraph';
import { KineticsLegend } from './KineticsLegend';
import SimulationHeader from '../shared/SimulationHeader';
import AboutPanel from '../shared/AboutPanel';
import { ExportButtons } from '../shared/ExportButtons';
import { KINETICS_ABOUT } from './kineticsAbout';
import { ChallengeDeck } from '../shared/ChallengeDeck';
import { KINETICS_CHALLENGES, VesselSetup } from './kineticsChallenges';

interface EnergyBarrierDiagramProps {
  mode: ScenarioMode;
  hasCatalyst: boolean;
  avgKE?: number;  // live average kinetic energy (normalized ~0-60)
  reactionPulse?: boolean;
}

const EnergyBarrierDiagram: React.FC<EnergyBarrierDiagramProps> = ({ mode, hasCatalyst, avgKE = 0, reactionPulse = false }) => {
  const uncatalyzedEa = BASE_ACTIVATION_ENERGY[mode];
  const catalyzedEa = mode === 'chemistry' ? uncatalyzedEa - CATALYST_REDUCTION : 10;
  const maxEa = BASE_ACTIVATION_ENERGY['chemistry']; // 35: normalisation reference

  const W = 240;
  const H = 110;
  const padX = 20;
  const padY = 10;
  const baseY = H - padY;
  const reactantY = baseY - 15;
  const productY = baseY - 10;

  const eaToY = (ea: number) => padY + (1 - ea / (maxEa + 5)) * (baseY - padY - 20);

  const peakYUncatalyzed = eaToY(uncatalyzedEa);
  const peakYCatalyzed = eaToY(catalyzedEa);
  const midX = W / 2;

  const makeCurve = (peakY: number) =>
    `M ${padX} ${reactantY} C ${padX + 40} ${reactantY}, ${midX - 30} ${peakY}, ${midX} ${peakY} S ${midX + 30} ${peakY}, ${W - padX} ${productY}`;

  const accentColor = mode === 'chemistry' ? '#6366f1' : '#10b981';
  const catalystColor = '#f59e0b';

  // Live energy pointer: map avgKE (0 to 60 range) to a 0 to 1 progress along the reaction coordinate
  // 0 = at reactants, 0.5 = at peak, 1 = at products
  const activeEa = hasCatalyst ? catalyzedEa : uncatalyzedEa;
  const normalizedKE = Math.min(1, avgKE / (activeEa * 1.5));
  // Pointer x: 0→padX, 0.5→midX, 1→W-padX
  const pointerX = padX + normalizedKE * (W - padX * 2);
  // Pointer y: follows the reaction curve shape (parabolic approximation)
  const t = (pointerX - padX) / (W - padX * 2); // 0 to 1
  const activepeakY = hasCatalyst ? peakYCatalyzed : peakYUncatalyzed;
  const pointerY = reactantY - 4 * (activepeakY - reactantY) * t * (t - 1); // parabola

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Energy barrier diagram">
      {/* Baseline */}
      <line x1={padX} y1={baseY} x2={W - padX} y2={baseY} stroke="#e2e8f0" strokeWidth="1" />

      {/* Uncatalyzed curve */}
      <path d={makeCurve(peakYUncatalyzed)} fill="none" stroke={accentColor} strokeWidth="2.5" opacity={hasCatalyst ? 0.3 : 1} />

      {/* Catalyzed curve */}
      {hasCatalyst && (
        <path d={makeCurve(peakYCatalyzed)} fill="none" stroke={catalystColor} strokeWidth="2.5" strokeDasharray="4 2" />
      )}

      {/* Ea dashed line: current active */}
      <line
        x1={padX} y1={hasCatalyst ? peakYCatalyzed : peakYUncatalyzed}
        x2={midX} y2={hasCatalyst ? peakYCatalyzed : peakYUncatalyzed}
        stroke={hasCatalyst ? catalystColor : accentColor} strokeWidth="1" strokeDasharray="3 2"
      />

      {/* Ea label */}
      <text x={padX + 4} y={(hasCatalyst ? peakYCatalyzed : peakYUncatalyzed) - 4} fontSize="9" fill={hasCatalyst ? catalystColor : accentColor} fontWeight="bold">
        {hasCatalyst ? 'Eₐ (catalyzed)' : 'Eₐ'}
      </text>

      {/* Reactants label */}
      <text x={padX} y={reactantY - 4} fontSize="8" fill="#64748b">{mode === 'chemistry' ? 'A + B' : 'E + S'}</text>

      {/* Products label */}
      <text x={W - padX - 2} y={productY - 4} fontSize="8" fill="#64748b" textAnchor="end">{mode === 'chemistry' ? 'C' : 'E + P'}</text>

      {/* Live system energy pointer */}
      <circle
        cx={pointerX}
        cy={pointerY}
        r={reactionPulse ? 7 : 5}
        fill={reactionPulse ? '#fbbf24' : '#1e293b'}
        stroke="white"
        strokeWidth="1.5"
        style={{ transition: 'cx 0.15s ease, cy 0.15s ease, r 0.1s ease' }}
      />
      <text x={pointerX} y={pointerY - 8} fontSize="7" fill="#64748b" textAnchor="middle">System</text>
    </svg>
  );
};

interface KineticsViewProps {
  onBack: () => void;
}

export const KineticsView: React.FC<KineticsViewProps> = ({ onBack }) => {
  const [showAbout, setShowAbout] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sparkle, setSparkle] = useState(false);

  const [mode, setMode] = useState<ScenarioMode>('chemistry');
  const [temperature, setTemperature] = useState<number>(1.0);
  const [heatingState, setHeatingState] = useState<'heating' | 'cooling' | 'none'>('none');
  const heatingStateRef = useRef<'heating' | 'cooling' | 'none'>('none');
  const [hasCatalyst, setHasCatalyst] = useState<boolean>(false);
  const [enzymeDenatured, setEnzymeDenatured] = useState(false);

  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(0);

  const [pendingSetup, setPendingSetup] = useState<VesselSetup | null>(null);

  const handleVerifyChallenge = () => {
    const cur = KINETICS_CHALLENGES[challengeIdx];
    const productsCount = particlesRef.current.filter(p => p.type === 'Product').length;

    if (cur.id === 'act_energy') {
      if (mode !== 'chemistry') {
        return { success: false, message: 'This one happens in Chemical Reaction mode. Switch back to it.' };
      }
      if (productsCount >= 15) {
        return { success: true, message: `${productsCount} products formed. More of the collisions now carried more energy than Eₐ, so more of them turned into C.` };
      }
      return { success: false, message: `${productsCount} of 15 products so far. A and B are colliding, but are the collisions getting over the hill on the Energy Diagram?` };
    }

    if (cur.id === 'catalysis') {
      if (mode !== 'chemistry') {
        return { success: false, message: 'This one happens in Chemical Reaction mode. Switch back to it.' };
      }
      if (temperature > 0.85) {
        return { success: false, message: `Temperature is ${temperature.toFixed(1)}. Heat is the lever from Challenge 1. This time, find one that works at 0.8 or below.` };
      }
      if (!hasCatalyst) {
        return { success: false, message: `${productsCount} of 12 products. At this temperature, few collisions have enough energy to clear Eₐ. Can you change the barrier instead of the particles?` };
      }
      if (productsCount >= 12) {
        return { success: true, message: `${productsCount} products at T = ${temperature.toFixed(1)}. The catalyst lowered Eₐ, so collisions that used to bounce off now react. Same particles, lower hill.` };
      }
      return { success: false, message: `${productsCount} of 12 products. The barrier is lower now. Give the collisions time to happen.` };
    }

    if (cur.id === 'enzyme_saturation') {
      if (mode !== 'biology') {
        return { success: false, message: 'This one happens inside a cell. Switch to Biological Enzyme mode.' };
      }
      if (temperature < 0.9 || temperature > 1.4) {
        return { success: false, message: `Temperature is ${temperature.toFixed(1)}. A cell has to work near body temperature (0.9 to 1.4). What does it use in place of heat?` };
      }
      if (!hasCatalyst) {
        return { success: false, message: 'The substrate is moving, but nothing is reacting. What does the substrate need to collide with?' };
      }
      if (productsCount >= 20) {
        return { success: true, message: `${productsCount} products at body temperature. Enzymes let cells run reactions that would otherwise need far more heat than a living thing can survive.` };
      }
      return { success: false, message: `${productsCount} of 20 products. Each enzyme handles one substrate at a time. Keep it running.` };
    }

    if (cur.id === 'denaturation') {
      if (mode !== 'biology') {
        return { success: false, message: 'This one happens inside a cell. Switch to Biological Enzyme mode.' };
      }
      if (!hasCatalyst) {
        return { success: false, message: 'There is no enzyme in the cytosol yet, so there is nothing to test. Add one first.' };
      }
      if (temperature >= ENZYME_DENATURATION_TEMP && enzymeDenatured) {
        return { success: true, message: `At ${temperature.toFixed(2)} the enzyme lost its shape and product formation stopped. For enzymes, hotter is faster only up to a point.` };
      }
      return { success: false, message: `Temperature is ${temperature.toFixed(1)} and the enzyme is still working. Keep heating, and watch the product count.` };
    }

    return { success: false, message: 'Challenge objective not yet met.' };
  };

  // Mode, temperature and catalyst are set now; the vessel is rebuilt in the
  // effect below, once those values have rendered.
  const loadSetup = (setup: VesselSetup) => {
    setIsRunning(false);
    setHeatingState('none');
    setTemperature(setup.temp);
    if (setup.mode !== mode) setMode(setup.mode);
    setPendingSetup(setup);
  };

  const particlesRef = useRef<KineticParticle[]>([]);
  const avgKERef = useRef<number>(0);
  const [history, setHistory] = useState<KineticsGraphData[]>([]);

  const tickCountRef = useRef(0);
  const rafRef = useRef<number>();
  const graphTickAccumulator = useRef<number>(0);
  const sparkleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [displayAvgKE, setDisplayAvgKE] = useState(0);
  const keUpdateAccRef = useRef(0);

  // Sync heatingState to a ref so the rAF loop can read it without stale closure
  useEffect(() => {
    heatingStateRef.current = heatingState;
  }, [heatingState]);

  const recordGraphPoint = useCallback(() => {
    tickCountRef.current++;
    
    let reactants = 0;
    let products = 0;

    particlesRef.current.forEach(p => {
      if (p.dead) return;
      if (mode === 'chemistry') {
        if (p.type === 'A' || p.type === 'B') reactants++;
        if (p.type === 'Product') products++;
      } else {
        if (p.type === 'A') reactants++; // Substrate
        if (p.type === 'Product') products++;
      }
    });

    const data: KineticsGraphData = { 
      tick: tickCountRef.current,
      reactants,
      products
    };

    setHistory(prev => {
      const newHist = [...prev, data];
      if (newHist.length > 200) return newHist.slice(newHist.length - 200);
      return newHist;
    });
  }, [mode]);

  // Initialization
  const initializeSimulation = useCallback(() => {
    const newParticles: KineticParticle[] = [];
    let idCounter = 0;

    const addGroup = (type: 'A' | 'B' | 'Enzyme', count: number) => {
      const config = REACTANT_PROPERTIES[type];
      for (let i = 0; i < count; i++) {
        const x = config.radius + Math.random() * (CANVAS_WIDTH - config.radius * 2);
        const y = config.radius + Math.random() * (CANVAS_HEIGHT - config.radius * 2);
        
        let vx = (Math.random() - 0.5) * 4 * temperature;
        let vy = (Math.random() - 0.5) * 4 * temperature;
        
        newParticles.push({
          id: `p_${idCounter++}`,
          type,
          x, y, vx, vy,
          radius: config.radius,
          mass: config.mass,
          energy: 0,
          dead: false
        });
      }
    };

    if (mode === 'chemistry') {
      addGroup('A', 25);
      addGroup('B', 25);
    } else {
      addGroup('A', 40); // 40 substrates
      if (hasCatalyst) {
        addGroup('Enzyme', 5);
      }
    }

    particlesRef.current = newParticles;
    setHistory([]);
    tickCountRef.current = 0;
    graphTickAccumulator.current = 0;
    
    recordGraphPoint();
  }, [mode, hasCatalyst, temperature, recordGraphPoint]);

  const handleAddParticles = useCallback((type: 'A' | 'B' | 'Enzyme', amount: number) => {
    const config = REACTANT_PROPERTIES[type];
    for (let i = 0; i < amount; i++) {
        const x = config.radius + Math.random() * (CANVAS_WIDTH - config.radius * 2);
        const y = config.radius + Math.random() * (CANVAS_HEIGHT - config.radius * 2);
        
        let vx = (Math.random() - 0.5) * 4 * temperature;
        let vy = (Math.random() - 0.5) * 4 * temperature;
        
        particlesRef.current.push({
          id: `p_${Date.now()}_${i}`,
          type,
          x, y, vx, vy,
          radius: config.radius,
          mass: config.mass,
          energy: 0,
          dead: false
        });
    }
    
    if (!isRunning) recordGraphPoint();
  }, [temperature, isRunning, recordGraphPoint]);

  // When mode changes, reset without pre-enabling the enzyme: let the user toggle it
  useEffect(() => {
    setHasCatalyst(false);
    initializeSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]); // Just mode triggers reset

  // Declared after the mode reset so its catalyst setting wins when both run.
  useEffect(() => {
    if (!pendingSetup) return;
    initializeSimulation();
    particlesRef.current = particlesRef.current.filter(p => p.type !== 'Enzyme');
    if (pendingSetup.catalyst && pendingSetup.mode === 'biology') handleAddParticles('Enzyme', 5);
    setHasCatalyst(pendingSetup.catalyst);
    setEnzymeDenatured(false);
    setIsRunning(true);
    setPendingSetup(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSetup]);

  const handleReaction = useCallback(() => {
    setSparkle(true);
    if (sparkleTimeoutRef.current) clearTimeout(sparkleTimeoutRef.current);
    sparkleTimeoutRef.current = setTimeout(() => setSparkle(false), 200);
  }, []);

  // Engine Loop
  const tick = useCallback(() => {
    if (!isRunning) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // Drive temperature from press-and-hold heating state
    if (heatingStateRef.current === 'heating') {
      setTemperature(prev => Math.min(2.0, prev + 0.005));
    } else if (heatingStateRef.current === 'cooling') {
      setTemperature(prev => Math.max(0.1, prev - 0.005));
    }

    // Run physics
    simulateKineticsStep(
      particlesRef.current,
      mode,
      temperature,
      hasCatalyst,
      handleReaction
    );

    // Denaturation: mark enzyme particles when temp is too high
    if (mode === 'biology' && hasCatalyst) {
      let anyDenatured = false;
      particlesRef.current.forEach(p => {
        if (p.type === 'Enzyme') {
          if (temperature >= ENZYME_DENATURATION_TEMP) {
            p.enzymeDenatured = true;
            const prog = p.denaturationProgress || 0;
            p.denaturationProgress = Math.min(1, prog + 0.02);
          } else {
            // Recover if cooled back down
            p.enzymeDenatured = false;
            p.denaturationProgress = Math.max(0, (p.denaturationProgress || 0) - 0.01);
          }
          if (p.enzymeDenatured) anyDenatured = true;
        }
      });
      setEnzymeDenatured(anyDenatured);
    }

    graphTickAccumulator.current++;
    keUpdateAccRef.current++;
    if (graphTickAccumulator.current >= 15) {
      recordGraphPoint();
      graphTickAccumulator.current = 0;
    }
    // Update KE display at ~10fps
    if (keUpdateAccRef.current >= 6) {
      setDisplayAvgKE(avgKERef.current);
      keUpdateAccRef.current = 0;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [isRunning, mode, temperature, hasCatalyst, recordGraphPoint, handleReaction]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);



  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        <SimulationHeader
          title={mode === 'chemistry' ? "Reaction Kinetics" : "Enzyme Kinetics"}
          onBack={onBack}
          icon={FlaskConical}
          gradient={mode === 'chemistry' ? "from-indigo-500 to-purple-600" : "from-emerald-500 to-teal-600"}
          onOpenAbout={() => setShowAbout(true)}
        />

        {/* Mode Switcher */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setChallengeMode(false)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                !challengeMode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              🧪 Free Exploration Lab
            </button>
            <button
              onClick={() => {
                setChallengeMode(true);
                loadSetup(KINETICS_CHALLENGES[challengeIdx].start);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                challengeMode
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              🏆 Kinetics Challenges
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
              title="Kinetics Challenges"
              challenges={KINETICS_CHALLENGES}
              currentIndex={challengeIdx}
              onSelectIndex={idx => {
                setChallengeIdx(idx);
                loadSetup(KINETICS_CHALLENGES[idx].start);
              }}
              onVerify={handleVerifyChallenge}
              onApplySolution={() => loadSetup(KINETICS_CHALLENGES[challengeIdx].solutionSetup)}
              solutionUnlockAfter={2}
              accentGradient="from-indigo-500 to-purple-600"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          
          <div className="lg:col-span-8 flex flex-col gap-6">
             <div className={`relative rounded-2xl w-full h-[500px] overflow-hidden bg-white shadow-inner ${mode === 'chemistry' ? 'border-4 border-slate-200' : 'border border-emerald-200 ring-4 ring-emerald-50'}`}>
               <ReactionVesselCanvas
                 particlesRef={particlesRef}
                 mode={mode}
                 avgKERef={avgKERef}
               />

               {/* Overlay Badge */}
               <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 text-xs font-black tracking-widest text-slate-500 uppercase pointer-events-none shadow-sm">
                 {mode === 'chemistry' ? 'Sealed Vessel' : 'Cytosol'}
               </div>

               {/* Reaction sparkle flash */}
               {sparkle && (
                 <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                   <div className="w-16 h-16 rounded-full bg-yellow-300 opacity-70 animate-ping" />
                 </div>
               )}
            </div>
            
            <KineticsLegend mode={mode} hasCatalyst={hasCatalyst} />
            <div className="flex justify-end">
              <ExportButtons
                csvData={history.map(h => ({ tick: h.tick, reactants: h.reactants, products: h.products }))}
                csvFilename="reaction-kinetics-data"
                csvHeaders={['tick', 'reactants', 'products']}
              />
            </div>
            <KineticsGraph
              history={history}
              mode={mode}
            />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
             <KineticsControls
                mode={mode}
                onChangeMode={setMode}
                isRunning={isRunning}
                onTogglePlay={() => setIsRunning(!isRunning)}
                temperature={temperature}
                onChangeTemperature={setTemperature}
                heatingState={heatingState}
                onSetHeatingState={setHeatingState}
                hasCatalyst={hasCatalyst}
                onToggleCatalyst={() => {
                   if (hasCatalyst && mode === 'biology') {
                     particlesRef.current = particlesRef.current.filter(p => p.type !== 'Enzyme');
                   } else if (!hasCatalyst && mode === 'biology') {
                     handleAddParticles('Enzyme', 5);
                   }
                   setHasCatalyst(!hasCatalyst);
                }}
                onAddParticle={handleAddParticles}
                onClear={initializeSimulation}
             />
             
            {/* Enzyme denaturation warning */}
            {mode === 'biology' && enzymeDenatured && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-xs font-bold text-red-700 flex items-center gap-2">
                <span>⚠</span> Enzyme denatured: reduce temperature to restore activity
              </div>
            )}

            {/* Energy Barrier Diagram */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Energy Diagram</h3>
              <EnergyBarrierDiagram
                mode={mode}
                hasCatalyst={hasCatalyst}
                avgKE={displayAvgKE}
                reactionPulse={sparkle}
              />
            </div>
          </div>
          
        </div>
      </div>
      
      <AboutPanel
        isOpen={showAbout}
        content={KINETICS_ABOUT}
        onClose={() => setShowAbout(false)}
        gradient={mode === 'chemistry' ? "from-indigo-500 to-purple-600" : "from-emerald-500 to-teal-600"}
      />
    </div>
  );
};

export default KineticsView;
