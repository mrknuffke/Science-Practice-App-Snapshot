import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Waves, Info, Trophy } from 'lucide-react';
import { DiffusionParticle, MembraneProtein, ParticleType } from '../../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, MEMBRANE_Y, PARTICLE_CONFIGS, INITIAL_EXTRACELLULAR, INITIAL_INTRACELLULAR } from './diffusionConstants';
import { simulateDiffusionStep, advancePumpPhase } from './diffusionEngine';
import { ExportButtons } from '../shared/ExportButtons';
import { DiffusionCanvas } from './DiffusionCanvas';
import { DiffusionControls } from './DiffusionControls';
import { ConcentrationGraph, DiffusionGraphData } from './ConcentrationGraph';
import SimulationHeader from '../shared/SimulationHeader';
import AboutPanel from '../shared/AboutPanel';
import { DIFFUSION_ABOUT } from './diffusionAbout';
import { ChallengeDeck } from '../shared/ChallengeDeck';
import { DIFFUSION_CHALLENGES } from './diffusionChallenges';

interface DiffusionViewProps {
  onBack: () => void;
}

export const DiffusionView: React.FC<DiffusionViewProps> = ({ onBack }) => {
  const [showAbout, setShowAbout] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(0);

  // React State for Proteins (Slow moving/user controlled)
  const [proteins, setProteins] = useState<MembraneProtein[]>([]);
  const [selectedProteinId, setSelectedProteinId] = useState<string | null>(null);

  // Mutable Ref for Particles (Fast moving/engine controlled)
  const particlesRef = useRef<DiffusionParticle[]>([]);

  // React State for Graph
  const [history, setHistory] = useState<DiffusionGraphData[]>([]);
  const [selectedGraphType, setSelectedGraphType] = useState<ParticleType>('oxygen');
  const [atEquilibrium, setAtEquilibrium] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

  const tickCountRef = useRef(0);
  const rafRef = useRef<number>();
  const graphTickAccumulator = useRef<number>(0);

  // Initialization
  const initializeSimulation = useCallback(() => {
    const newParticles: DiffusionParticle[] = [];
    let idCounter = 0;

    const addGroup = (type: ParticleType, count: number, isExtracellular: boolean) => {
      const config = PARTICLE_CONFIGS[type];
      for (let i = 0; i < count; i++) {
        const x = config.radius + Math.random() * (CANVAS_WIDTH - config.radius * 2);
        const yTopLimit = isExtracellular ? config.radius : MEMBRANE_Y + 30;
        const yBottomLimit = isExtracellular ? MEMBRANE_Y - 30 : CANVAS_HEIGHT - config.radius;
        const y = yTopLimit + Math.random() * (yBottomLimit - yTopLimit);
        
        let vx = (Math.random() - 0.5) * 2;
        let vy = (Math.random() - 0.5) * 2;
        // Normalize to starting speed
        const speed = Math.sqrt(vx * vx + vy * vy);
        vx = (vx / speed) * config.speed;
        vy = (vy / speed) * config.speed;
        
        newParticles.push({
          id: `p_${idCounter++}`,
          type,
          x, y, vx, vy,
          radius: config.radius,
          isTransporting: false
        });
      }
    };

    addGroup('oxygen', INITIAL_EXTRACELLULAR.oxygen, true);
    addGroup('oxygen', INITIAL_INTRACELLULAR.oxygen, false);
    addGroup('glucose', INITIAL_EXTRACELLULAR.glucose, true);
    addGroup('glucose', INITIAL_INTRACELLULAR.glucose, false);
    addGroup('sodium', INITIAL_EXTRACELLULAR.sodium, true);
    addGroup('sodium', INITIAL_INTRACELLULAR.sodium, false);

    particlesRef.current = newParticles;
    setProteins([]);
    setHistory([]);
    tickCountRef.current = 0;
    graphTickAccumulator.current = 0;
    
    // Initial graph point
    recordGraphPoint();
  }, []);

  useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  const recordGraphPoint = () => {
    tickCountRef.current++;
    const data: DiffusionGraphData = { tick: tickCountRef.current };
    
    // Tally
    const counts: Record<string, number> = {};
    particlesRef.current.forEach(p => {
      const region = p.y < MEMBRANE_Y ? '_ext' : '_int';
      const key = p.type + region;
      counts[key] = (counts[key] || 0) + 1;
    });

    (Object.keys(PARTICLE_CONFIGS) as ParticleType[]).forEach(type => {
      data[`${type}_ext`] = counts[`${type}_ext`] || 0;
      data[`${type}_int`] = counts[`${type}_int`] || 0;
    });

    setHistory(prev => {
      const newHist = [...prev, data];
      return newHist.length > 200 ? newHist.slice(newHist.length - 200) : newHist;
    });

    // Check equilibrium: if all particle types have <5% difference between ext and int
    const totalParticles = particlesRef.current.length;
    if (totalParticles > 0) {
      const isEq = (Object.keys(PARTICLE_CONFIGS) as ParticleType[]).every(type => {
        const ext = data[`${type}_ext`] ?? 0;
        const int = data[`${type}_int`] ?? 0;
        const total = ext + int;
        if (total === 0) return true;
        return Math.abs(ext - int) / total < 0.05;
      });
      setAtEquilibrium(isEq);
    }
  };

  // Engine Loop
  const tick = useCallback(() => {
    if (!isRunning) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // Advance pump phase animations and run physics
    setProteins(prev => prev.map(p => {
      if (p.type === 'pump') {
        // Start binding when transport is active
        const updated = p.isTransporting && p.hasATP && (p.pumpPhase === 'idle' || !p.pumpPhase)
          ? { ...p, pumpPhase: 'binding' as const, pumpPhaseProgress: 0 }
          : p;
        return advancePumpPhase(updated, speedMultiplier);
      }
      return p;
    }));

    simulateDiffusionStep(particlesRef.current, proteins, (id, status) => {
       setProteins(prev => prev.map(p => {
         if (p.id === id) {
           if (status === 'transport_start') return { ...p, isTransporting: true };
           if (status === 'transport_end') return { ...p, isTransporting: false, pumpPhase: 'idle' as const, pumpPhaseProgress: 0 };
           if (status === 'atp_consumed') return { ...p, hasATP: false };
         }
         return p;
       }));
    }, speedMultiplier);

    // Sub-sample graph updates so React state doesn't churn 60fps
    graphTickAccumulator.current++;
    if (graphTickAccumulator.current >= 15) { // Update graph every ~15 frames (4x a sec)
      recordGraphPoint();
      graphTickAccumulator.current = 0;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [isRunning, proteins, speedMultiplier]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  // Handlers
  const handleAddParticles = (type: ParticleType, region: 'extracellular' | 'intracellular', amount: number) => {
    const config = PARTICLE_CONFIGS[type];
    for (let i = 0; i < amount; i++) {
        const x = config.radius + Math.random() * (CANVAS_WIDTH - config.radius * 2);
        const yTopLimit = region === 'extracellular' ? config.radius : MEMBRANE_Y + 30;
        const yBottomLimit = region === 'extracellular' ? MEMBRANE_Y - 30 : CANVAS_HEIGHT - config.radius;
        const y = yTopLimit + Math.random() * (yBottomLimit - yTopLimit);
        
        let vx = (Math.random() - 0.5) * 2;
        let vy = (Math.random() - 0.5) * 2;
        const speed = Math.sqrt(vx * vx + vy * vy);
        vx = (vx / speed) * config.speed;
        vy = (vy / speed) * config.speed;
        
        particlesRef.current.push({
          id: `p_${Date.now()}_${i}`,
          type,
          x, y, vx, vy,
          radius: config.radius,
          isTransporting: false
        });
    }
    
    // Only force graph update if we are not running
    if (!isRunning) recordGraphPoint();
  };

  const handleAddProtein = (type: 'channel' | 'pump', allowed: ParticleType) => {
    // Prevent adding if there's no room
    const P_WIDTH = 60;
    let newX = 100 + Math.random() * (CANVAS_WIDTH - 200);
    
    let attempts = 0;
    let collision = true;
    while (collision && attempts < 50) {
      collision = proteins.some(p => Math.abs(p.x - newX) < P_WIDTH + 10);
      if (collision) newX = 100 + Math.random() * (CANVAS_WIDTH - 200);
      attempts++;
    }
    
    if (collision) return; // Too crowded
    
    setProteins(prev => [...prev, {
      id: `prot_${Date.now()}`,
      type,
      allowedParticle: allowed,
      x: newX,
      isTransporting: false,
      hasATP: type === 'pump' ? false : undefined
    }]);
  };

  const handleSupplyATP = () => {
    setProteins(prev => prev.map(p => {
      // Supply ATP to the selected pump, or to all pumps if none selected
      if (p.type === 'pump' && (!selectedProteinId || p.id === selectedProteinId)) {
        return { ...p, hasATP: true };
      }
      return p;
    }));
  };

  const handleTogglePumpDirection = () => {
    if (!selectedProteinId) return;
    setProteins(prev => prev.map(p => {
      if (p.id === selectedProteinId && p.type === 'pump') {
        const current = p.pumpDirection ?? 'out';
        return { ...p, pumpDirection: current === 'out' ? 'in' : 'out' };
      }
      return p;
    }));
  };

  const handleVerifyChallenge = () => {
    const cur = DIFFUSION_CHALLENGES[challengeIdx];

    const getCounts = (type: ParticleType) => {
      let ext = 0;
      let int = 0;
      particlesRef.current.forEach(p => {
        if (p.type === type) {
          if (p.y < MEMBRANE_Y) ext++;
          else int++;
        }
      });
      return { ext, int };
    };

    if (cur.id === 'passive_diffusion') {
      const { ext, int } = getCounts('oxygen');
      const diff = Math.abs(ext - int);
      if (diff <= 3 && (ext + int) >= 15) {
        return { success: true, message: `You reached dynamic equilibrium: ${ext} outside vs ${int} inside (|Δ| = ${diff}). Oxygen molecules keep crossing, but net movement is zero.` };
      }
      return { success: false, message: `Right now you have ${ext} oxygen outside vs ${int} inside (|Δ| = ${diff}). Let the simulation run until the difference drops to 3 or fewer.` };
    }

    if (cur.id === 'facilitated_glucose') {
      const { int } = getCounts('glucose');
      const hasGlucoseChannel = proteins.some(p => p.type === 'channel' && p.allowedParticle === 'glucose');
      if (!hasGlucoseChannel) {
        return { success: false, message: 'Glucose is too large and polar to cross the lipid bilayer alone. Add a glucose channel to the membrane.' };
      }
      if (int >= 10) {
        return { success: true, message: `${int} glucose molecules have entered through facilitated diffusion down their concentration gradient.` };
      }
      return { success: false, message: `You have ${int}/10 glucose molecules inside so far. Keep the clock running to let more pass through the channel.` };
    }

    if (cur.id === 'active_sodium') {
      const { ext } = getCounts('sodium');
      const hasSodiumPump = proteins.some(p => p.type === 'pump' && p.allowedParticle === 'sodium');
      if (!hasSodiumPump) {
        return { success: false, message: 'To build a steep concentration gradient, place a sodium pump in the membrane and make sure ATP is available.' };
      }
      if (ext >= 25) {
        return { success: true, message: `The pump pushed sodium against its gradient, packing ${ext} ions on the outside.` };
      }
      return { success: false, message: `Current extracellular sodium: ${ext}/25. Keep ATP supplied so the pump can continue driving ions against the gradient.` };
    }

    if (cur.id === 'homeostasis') {
      const { int: glucInt } = getCounts('glucose');
      const { ext: oxExt, int: oxInt } = getCounts('oxygen');
      const oxDiff = Math.abs(oxExt - oxInt);
      if (proteins.length < 2) {
        return { success: false, message: 'A real cell membrane uses a diverse set of transporters. Place at least 2 transport proteins into the bilayer.' };
      }
      if (glucInt >= 8 && oxDiff <= 5) {
        return { success: true, message: `The cell has ${proteins.length} active transporters, ${glucInt} internal glucose molecules, and equilibrated oxygen.` };
      }
      return { success: false, message: `Status check: ${proteins.length} proteins, ${glucInt}/8 internal glucose, and oxygen difference |Δ| = ${oxDiff}. Keep tweaking your membrane setup.` };
    }

    return { success: false, message: 'Check your conditions and keep experimenting.' };
  };

  const handleApplyChallenge = (idx = challengeIdx) => {
    const cur = DIFFUSION_CHALLENGES[idx];
    if (!cur.initialSetup) return;
    const setup = cur.initialSetup;

    const newParticles: DiffusionParticle[] = [];
    let idCounter = 0;
    const addGroup = (type: ParticleType, count: number, isExtracellular: boolean) => {
      const config = PARTICLE_CONFIGS[type];
      for (let i = 0; i < count; i++) {
        const x = config.radius + Math.random() * (CANVAS_WIDTH - config.radius * 2);
        const yTopLimit = isExtracellular ? config.radius : MEMBRANE_Y + 30;
        const yBottomLimit = isExtracellular ? MEMBRANE_Y - 30 : CANVAS_HEIGHT - config.radius;
        const y = yTopLimit + Math.random() * (yBottomLimit - yTopLimit);
        let vx = (Math.random() - 0.5) * 2;
        let vy = (Math.random() - 0.5) * 2;
        const speed = Math.sqrt(vx * vx + vy * vy);
        vx = (vx / speed) * config.speed;
        vy = (vy / speed) * config.speed;
        newParticles.push({
          id: `p_ch_${idCounter++}`,
          type,
          x, y, vx, vy,
          radius: config.radius,
          isTransporting: false
        });
      }
    };

    addGroup('oxygen', setup.oxygenExt, true);
    addGroup('oxygen', setup.oxygenInt, false);
    addGroup('glucose', setup.glucoseExt, true);
    addGroup('glucose', setup.glucoseInt, false);
    addGroup('sodium', setup.sodiumExt, true);
    addGroup('sodium', setup.sodiumInt, false);

    particlesRef.current = newParticles;
    setProteins([]);
    setIsRunning(true);
    recordGraphPoint();
  };

  const handleApplySolution = (idx = challengeIdx) => {
    const cur = DIFFUSION_CHALLENGES[idx];
    if (!cur.initialSetup) return;
    handleApplyChallenge(idx);
    if (cur.solutionProteins && cur.solutionProteins.length > 0) {
      const spacing = CANVAS_WIDTH / (cur.solutionProteins.length + 1);
      const newProts: MembraneProtein[] = cur.solutionProteins.map((sp, i) => ({
        id: `prot_sol_${Date.now()}_${i}`,
        type: sp.type,
        allowedParticle: sp.allowedParticle,
        x: spacing * (i + 1),
        isTransporting: false,
        hasATP: sp.type === 'pump' ? true : undefined,
        pumpDirection: sp.pumpDirection ?? 'out',
      }));
      setProteins(newProts);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-full overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto">
        <SimulationHeader
          title="Cell Membrane Diffusion"
          onBack={onBack}
          icon={Waves}
          gradient="from-blue-500 to-cyan-600"
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
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              🏆 Membrane Challenges
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
              title="Membrane Transport Challenges"
              challenges={DIFFUSION_CHALLENGES}
              currentIndex={challengeIdx}
              onSelectIndex={idx => {
                setChallengeIdx(idx);
                handleApplyChallenge(idx);
              }}
              onVerify={handleVerifyChallenge}
              onApplySolution={() => handleApplySolution(challengeIdx)}
              solutionUnlockAfter={2}
              accentGradient="from-blue-500 to-cyan-600"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          
          {/* Main Vis & Canvas */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Equilibrium banner */}
            {atEquilibrium && isRunning && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-2 text-sm font-bold text-center">
                Concentrations have reached equilibrium: particles still move, but net flux is zero.
              </div>
            )}

            {/* Labels outside canvas */}
            <div className="flex flex-col">
              <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase px-2 pb-1">Extracellular Fluid</div>
              <div className="relative border-4 border-slate-200 rounded-2xl w-full h-[500px] overflow-hidden bg-white shadow-inner">
                <DiffusionCanvas
                  particlesRef={particlesRef}
                  proteins={proteins}
                />
              </div>
              <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase px-2 pt-1">Intracellular Fluid</div>
            </div>
            
            <div className="flex justify-end">
              <ExportButtons
                csvData={history.map(h => ({
                  tick: h.tick,
                  oxygen_ext: h['oxygen_ext'] ?? 0,
                  oxygen_int: h['oxygen_int'] ?? 0,
                  glucose_ext: h['glucose_ext'] ?? 0,
                  glucose_int: h['glucose_int'] ?? 0,
                  sodium_ext: h['sodium_ext'] ?? 0,
                  sodium_int: h['sodium_int'] ?? 0,
                }))}
                csvFilename="membrane-transport-data"
                csvHeaders={['tick','oxygen_ext','oxygen_int','glucose_ext','glucose_int','sodium_ext','sodium_int']}
              />
            </div>
            <ConcentrationGraph
              history={history}
              selectedType={selectedGraphType}
              onChangeType={setSelectedGraphType}
            />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
             <DiffusionControls
                onAddParticles={handleAddParticles}
                onAddProtein={handleAddProtein}
                onSupplyATP={handleSupplyATP}
                onClear={initializeSimulation}
                proteins={proteins}
                selectedProteinId={selectedProteinId}
                onSelectProtein={setSelectedProteinId}
                onTogglePumpDirection={handleTogglePumpDirection}
                isRunning={isRunning}
                onTogglePlay={() => setIsRunning(!isRunning)}
                speedMultiplier={speedMultiplier}
                onSpeedChange={setSpeedMultiplier}
             />
             
            <div className="bg-slate-800 rounded-3xl shadow-xl p-6 text-white overflow-hidden relative border border-slate-700">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Info className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-blue-400">
                  Concept Tips
                </h3>
                <ul className="space-y-4 text-sm text-slate-200 font-medium">
                  <li className="flex flex-col gap-1">
                     <span className="text-blue-400 font-bold">Equilibrium</span>
                     <span className="text-slate-400">Diffusion continues until particles are equally dispersed. They don't stop moving, but net movement hits zero.</span>
                  </li>
                  <li className="flex flex-col gap-1">
                     <span className="text-amber-400 font-bold">Active Transport</span>
                     <span className="text-slate-400">Pumps use cellular energy (ATP) to push molecules the "wrong" way: creating a gradient instead of destroying one.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      <AboutPanel
        isOpen={showAbout}
        content={DIFFUSION_ABOUT}
        onClose={() => setShowAbout(false)}
        gradient="from-blue-500 to-cyan-600"
      />
    </div>
  );
};

export default DiffusionView;
