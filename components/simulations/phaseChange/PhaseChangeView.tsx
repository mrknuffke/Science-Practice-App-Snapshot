import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Flame, Info, Trophy } from 'lucide-react';
import { SUBSTANCES, SubstanceProperties, CANVAS_WIDTH, CANVAS_HEIGHT, PARTICLE_COUNT } from './phaseChangeConstants';
import { PHASE_CHANGE_ABOUT } from './phaseChangeAbout';
import { initializeParticles, updateParticles, calculateThermodynamics, getInitialHeat, type Particle } from './particleEngine';
import { PhaseChangeCanvas } from './PhaseChangeCanvas';
import { PhaseChangeControls } from './PhaseChangeControls';
import { HeatingCurveGraph } from './HeatingCurveGraph';
import SimulationHeader from '../shared/SimulationHeader';
import AboutPanel from '../shared/AboutPanel';
import { SocraticMascotPanel } from '../shared/SocraticMascotPanel';
import { ExportButtons } from '../shared/ExportButtons';
import ChallengeDeck, { ChallengeDef } from '../shared/ChallengeDeck';

interface PhaseChangeViewProps {
  onBack: () => void;
}

const PHASE_CHANGE_SOCRATIC_TIPS = [
  "What happens to the molecules' arrangement when you heat a solid? Do they move faster, or do they completely slide past one another?",
  "Watch the heating curve graph. Why does the temperature stop rising (plateau) during melting or boiling, even though the flame is still on?",
  "Look at the particles of water vs. carbon dioxide. Why does CO₂ sublime directly from solid to gas at room pressure? Think about intermolecular forces.",
  "When you cool the gas down, what pulls the particles back together into a liquid? Is it gravity, or electromagnetic intermolecular forces?",
  "In a gas state, why do molecules fly in straight lines until they hit the walls or each other? Think about kinetic molecular theory assumptions."
];

interface PhaseChangeChallengeDef extends ChallengeDef {
  targetSubstanceId: string;
}

const PHASE_CHANGE_CHALLENGES: PhaseChangeChallengeDef[] = [
  {
    id: 'phase-1',
    title: '1. Water: Catch the Melting Plateau',
    description: 'Heat solid ice until it begins melting at 273 K (0 °C). Keep the system balanced on the melting plateau with both solid and liquid coexisting (at least 20% solid and 20% liquid).',
    hints: [
      'What happens to temperature while ice melts? Does added heat speed up particles or break intermolecular bonds?',
      'On a heating curve, the melting plateau sits at 273 K where latent heat of fusion breaks lattice bonds without changing temperature.',
      'Hold the temperature steady near 273 K so that both ice crystals and liquid water droplets coexist.',
    ],
    targetSubstanceId: 'water',
  },
  {
    id: 'phase-2',
    title: '2. Water: Catch the Boiling Transition',
    description: 'Continue heating liquid water until it reaches its boiling plateau (373 K / 100 °C). Achieve a steady two-phase vaporization mixture (at least 20% liquid and 20% gas).',
    hints: [
      'What plateau forms when liquid water absorbs its latent heat of vaporization?',
      'Water boils at 373 K: energy added here separates liquid molecules into high-speed vapor rather than raising temperature.',
      'Apply heat until bubbles break the surface, keeping temperature near 373 K with both liquid and gas present.',
    ],
    targetSubstanceId: 'water',
  },
  {
    id: 'phase-3',
    title: '3. Superheated Pure Gas Phase',
    description: 'Drive the system entirely into the gas phase. All molecules must overcome intermolecular forces and fly freely as vapor (gas fraction >= 95%).',
    hints: [
      'What must happen to intermolecular attractions for a sample to become completely gaseous?',
      'Once all liquid vaporizes, continuing to add heat increases the kinetic energy and speed of the gas particles.',
      'Apply steady heat until virtually every molecule bounces freely off the container boundaries with no liquid pool left.',
    ],
    targetSubstanceId: 'water',
  },
  {
    id: 'phase-4',
    title: '4. Carbon Dioxide: Direct Sublimation',
    description: 'Switch to Carbon Dioxide (Dry Ice). Heat the solid until it sublimes directly into gas at 195 K with essentially zero liquid phase (liquid <= 5%, gas >= 50%).',
    hints: [
      'Why does dry ice produce fog and gas without leaving a wet puddle behind at atmospheric pressure?',
      'At 1 atm, CO₂ cannot exist as a liquid because normal atmospheric pressure is well below its triple point.',
      'Switch the substance dropdown to Carbon Dioxide and apply gentle heat so particles break straight out of the crystal lattice into gas.',
    ],
    targetSubstanceId: 'co2',
  },
];

export const PhaseChangeView: React.FC<PhaseChangeViewProps> = ({ onBack }) => {
  const [showAbout, setShowAbout] = useState(false);
  const [substanceId, setSubstanceId] = useState<string>('water');
  const substance = SUBSTANCES[substanceId];
  
  // React-driven state for UI updates
  const [heatingState, setHeatingState] = useState<'heating' | 'cooling' | 'none'>('none');
  const [temperature, setTemperature] = useState<number>(0);
  const [_heat, setHeat] = useState<number>(getInitialHeat(substance));
  const [phaseCounts, setPhaseCounts] = useState<{ solid: number; liquid: number; gas: number }>({
    solid: PARTICLE_COUNT,
    liquid: 0,
    gas: 0,
  });

  // Throttle graph updates
  const [history, setHistory] = useState<Array<{ tick: number; temp: number; heat: number }>>([]);

  // Mutable Engine state (Refs prevent re-rendering entire component every frame)
  const engineState = useRef({
    particles: initializeParticles(PARTICLE_COUNT, substance),
    heatEnergy: getInitialHeat(substance),
    tickCount: 0,
    heatingState: 'none' as 'heating' | 'cooling' | 'none',
    substanceId: 'water' // Track to reset if modified
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  // Sync heating state to ref
  useEffect(() => {
    engineState.current.heatingState = heatingState;
  }, [heatingState]);

  const resetSimulation = useCallback(() => {
    const initial = getInitialHeat(substance);
    engineState.current.particles = initializeParticles(PARTICLE_COUNT, substance);
    engineState.current.heatEnergy = initial;
    engineState.current.tickCount = 0;
    engineState.current.substanceId = substanceId;
    setHistory([]);
    setHeat(initial);
    setTemperature(0);
    setPhaseCounts({ solid: PARTICLE_COUNT, liquid: 0, gas: 0 });
    setHeatingState('none');
  }, [substance, substanceId]);

  // Sync substance switch
  useEffect(() => {
    if (engineState.current.substanceId !== substanceId) {
      resetSimulation();
    }
  }, [substanceId, resetSimulation]);

  const drawMolecule = useCallback((ctx: CanvasRenderingContext2D, p: Particle, sub: SubstanceProperties) => {
    const P = sub.particleSize;
    ctx.save();
    ctx.translate(p.x, p.y);

    ctx.rotate(p.rotation || 0);

    if (sub.shape === 'water') {
      // Bent H₂O: central O + two H at ~104.5° bond angle
      const bondAngle = (104.5 / 2) * (Math.PI / 180); // half angle from axis
      const bondLen = P * 1.4;
      const hRadius = P * 0.55;

      // Oxygen (center)
      ctx.beginPath();
      ctx.arc(0, 0, P, 0, Math.PI * 2);
      ctx.fillStyle = sub.oxygenColor || '#ef4444';
      ctx.fill();

      // Hydrogen left
      const hx1 = -Math.sin(bondAngle) * bondLen;
      const hy1 = -Math.cos(bondAngle) * bondLen;
      ctx.beginPath();
      ctx.arc(hx1, hy1, hRadius, 0, Math.PI * 2);
      ctx.fillStyle = sub.hydrogenColor || '#e2e8f0';
      ctx.fill();

      // Hydrogen right
      const hx2 = Math.sin(bondAngle) * bondLen;
      const hy2 = -Math.cos(bondAngle) * bondLen;
      ctx.beginPath();
      ctx.arc(hx2, hy2, hRadius, 0, Math.PI * 2);
      ctx.fillStyle = sub.hydrogenColor || '#e2e8f0';
      ctx.fill();

    } else if (sub.shape === 'diatomic') {
      // O₂: two spheres side by side
      const offset = P * 0.8;
      ctx.beginPath();
      ctx.arc(-offset, 0, P, 0, Math.PI * 2);
      ctx.fillStyle = sub.particleColor;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(offset, 0, P, 0, Math.PI * 2);
      ctx.fillStyle = sub.particleColor;
      ctx.fill();

    } else if (sub.shape === 'co2') {
      // CO₂: linear: O-C-O
      const bondLen = P * 1.5;
      const oRadius = P * 0.75;

      // Left oxygen
      ctx.beginPath();
      ctx.arc(-bondLen, 0, oRadius, 0, Math.PI * 2);
      ctx.fillStyle = sub.oxygenColor || '#ef4444';
      ctx.fill();

      // Central carbon
      ctx.beginPath();
      ctx.arc(0, 0, P * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = sub.particleColor;
      ctx.fill();

      // Right oxygen
      ctx.beginPath();
      ctx.arc(bondLen, 0, oRadius, 0, Math.PI * 2);
      ctx.fillStyle = sub.oxygenColor || '#ef4444';
      ctx.fill();

    } else {
      // sphere (neon, default)
      ctx.beginPath();
      ctx.arc(0, 0, P, 0, Math.PI * 2);
      ctx.fillStyle = sub.particleColor;
      ctx.fill();
    }

    ctx.restore();
  }, []);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[], sub: SubstanceProperties) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background tint shifts with dominant phase
    let gasCount = 0, liquidCount = 0;
    for (const p of particles) {
      if (p.state === 'gas') gasCount++;
      else if (p.state === 'liquid') liquidCount++;
    }
    const N = particles.length || 1;
    const gasFrac = gasCount / N;
    const liquidFrac = liquidCount / N;
    if (gasFrac > 0.05) {
      ctx.fillStyle = `rgba(251, 191, 36, ${gasFrac * 0.08})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    if (liquidFrac > 0.05) {
      ctx.fillStyle = `rgba(56, 189, 248, ${liquidFrac * 0.06})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    for (let i = 0; i < particles.length; i++) {
      drawMolecule(ctx, particles[i], sub);
    }

    // Draw floor indicator
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.stroke();
  }, [drawMolecule]);

  const tick = useCallback(() => {
    const s = engineState.current;
    
    // 1. Heat Energy update
    if (s.heatingState === 'heating') s.heatEnergy += 3.0;
    if (s.heatingState === 'cooling') s.heatEnergy -= 3.0;
    
    // Clamp heat energy
    if (s.heatEnergy < 1) s.heatEnergy = 1;
    
    // 2. Thermodynamics Calculation
    const thermo = calculateThermodynamics(s.heatEnergy, SUBSTANCES[s.substanceId]);
    
    // 3. Physics update
    updateParticles(
        s.particles, 
        SUBSTANCES[s.substanceId], 
        thermo.temp, 
        thermo.solidFraction, 
        thermo.liquidFraction, 
        thermo.gasFraction
    );
    
    s.tickCount++;
    
    // 4. Render
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) drawParticles(ctx, s.particles, SUBSTANCES[s.substanceId]);
    }
    
    // 5. Publish state periodically for React UI updates (every 10 frames = 6fps graph update)
    if (s.tickCount % 10 === 0) {
        setTemperature(Math.round(thermo.temp));
        setHeat(Math.round(s.heatEnergy));
        let cs = 0, cl = 0, cg = 0;
        for (const p of s.particles) {
          if (p.state === 'solid') cs++;
          else if (p.state === 'liquid') cl++;
          else cg++;
        }
        setPhaseCounts({ solid: cs, liquid: cl, gas: cg });
        if (s.heatingState !== 'none') {
            setHistory(h => {
              const next = [...h, { tick: s.tickCount, temp: thermo.temp, heat: s.heatEnergy }];
              return next.length > 500 ? next.slice(next.length - 500) : next;
            });
        }
    }
    
    requestRef.current = requestAnimationFrame(tick);
  }, [drawParticles]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [tick]);

  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(0);

  const handleApplyChallenge = (idx: number) => {
    const cur = PHASE_CHANGE_CHALLENGES[idx];
    setSubstanceId(cur.targetSubstanceId);
    resetSimulation();
  };

  const handleVerifyChallenge = () => {
    const cur = PHASE_CHANGE_CHALLENGES[challengeIdx];
    const sPct = (phaseCounts.solid / PARTICLE_COUNT) * 100;
    const lPct = (phaseCounts.liquid / PARTICLE_COUNT) * 100;
    const gPct = (phaseCounts.gas / PARTICLE_COUNT) * 100;

    if (substanceId !== cur.targetSubstanceId) {
      return {
        success: false,
        message: `Please switch substance to ${SUBSTANCES[cur.targetSubstanceId].name} for this challenge.`
      };
    }

    if (challengeIdx === 0) {
      if (temperature >= 271 && temperature <= 275 && sPct >= 20 && lPct >= 20) {
        return {
          success: true,
          message: `At ${temperature} K, ice and liquid water coexist on the melting plateau (${sPct.toFixed(0)}% solid, ${lPct.toFixed(0)}% liquid). All incoming heat is going into breaking lattice attractions.`
        };
      }
      return {
        success: false,
        message: `Current temperature is ${temperature} K (${sPct.toFixed(0)}% solid, ${lPct.toFixed(0)}% liquid). Try holding the sample near 273 K until both solid and liquid make up at least 20% each.`
      };
    } else if (challengeIdx === 1) {
      if (temperature >= 371 && temperature <= 375 && lPct >= 20 && gPct >= 20) {
        return {
          success: true,
          message: `At ${temperature} K, liquid water and steam coexist on the boiling plateau (${lPct.toFixed(0)}% liquid, ${gPct.toFixed(0)}% gas). That plateau is the heat of vaporization at work.`
        };
      }
      return {
        success: false,
        message: `Current state is ${temperature} K (${lPct.toFixed(0)}% liquid, ${gPct.toFixed(0)}% gas). Aim for 373 K with at least 20% liquid and 20% gas.`
      };
    } else if (challengeIdx === 2) {
      if (gPct >= 95) {
        return {
          success: true,
          message: `Gas fraction reached ${gPct.toFixed(0)}% at ${temperature} K. The particles have completely overcome intermolecular attractions and fly freely.`
        };
      }
      return {
        success: false,
        message: `Current gas fraction is ${gPct.toFixed(0)}%. Add more heat to break the remaining intermolecular attractions until the sample is at least 95% gas.`
      };
    } else if (challengeIdx === 3) {
      if (substanceId === 'co2' && lPct <= 5 && gPct >= 50) {
        return {
          success: true,
          message: `At 1 atm, CO₂ sublimes directly from solid to gas (${gPct.toFixed(0)}% gas, ${lPct.toFixed(0)}% liquid), bypassing the liquid phase entirely.`
        };
      }
      return {
        success: false,
        message: `Current CO₂ state: ${gPct.toFixed(0)}% gas, ${lPct.toFixed(0)}% liquid. Keep heating until at least 50% of the sample has sublimed into vapor with minimal liquid.`
      };
    }
    return { success: false, message: 'Select a challenge to start.' };
  };

  const handleApplySolution = (idx: number) => {
    const cur = PHASE_CHANGE_CHALLENGES[idx];
    setSubstanceId(cur.targetSubstanceId);
    const sub = SUBSTANCES[cur.targetSubstanceId];
    let targetHeat = 100;
    const hMeltStart = sub.meltingPoint * 2.0;
    const hMeltEnd = hMeltStart + sub.enthalpyFusion;
    const hBoilStart = hMeltEnd + (sub.boilingPoint - sub.meltingPoint) * 1.5;
    const hBoilEnd = hBoilStart + sub.enthalpyVaporization;

    if (idx === 0) {
      targetHeat = hMeltStart + (hMeltEnd - hMeltStart) * 0.5;
    } else if (idx === 1) {
      targetHeat = hBoilStart + (hBoilEnd - hBoilStart) * 0.5;
    } else if (idx === 2) {
      targetHeat = hBoilEnd + 300;
    } else if (idx === 3) {
      const hSubStart = sub.meltingPoint * 2.0;
      const hSubEnd = hSubStart + sub.enthalpyVaporization;
      targetHeat = hSubStart + (hSubEnd - hSubStart) * 0.7;
    }
    engineState.current.heatEnergy = targetHeat;
    setHeat(Math.round(targetHeat));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <SimulationHeader
            title="Particle Phase Change Simulator"
            onBack={onBack}
            icon={Flame}
            gradient="from-violet-600 to-purple-700"
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Main Vis & Canvas */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {challengeMode && (
              <ChallengeDeck
                title="Phase Transition Challenges"
                challenges={PHASE_CHANGE_CHALLENGES}
                currentIndex={challengeIdx}
                onSelectIndex={idx => {
                  setChallengeIdx(idx);
                  handleApplyChallenge(idx);
                }}
                onVerify={handleVerifyChallenge}
                onApplySolution={() => handleApplySolution(challengeIdx)}
                accentGradient="from-violet-600 to-purple-700"
                className="mb-1"
              />
            )}

            <PhaseChangeCanvas ref={canvasRef} />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 text-center">
                <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Current Temp</span>
                <span className="text-3xl font-black text-violet-600">{temperature} K</span>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Phase Mix</span>
                <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 mb-2">
                  <div className="bg-blue-500" style={{ width: `${(phaseCounts.solid / PARTICLE_COUNT) * 100}%` }} />
                  <div className="bg-sky-400" style={{ width: `${(phaseCounts.liquid / PARTICLE_COUNT) * 100}%` }} />
                  <div className="bg-amber-400" style={{ width: `${(phaseCounts.gas / PARTICLE_COUNT) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-black tracking-wider">
                  <span className="text-blue-600">S {Math.round((phaseCounts.solid / PARTICLE_COUNT) * 100)}%</span>
                  <span className="text-sky-600">L {Math.round((phaseCounts.liquid / PARTICLE_COUNT) * 100)}%</span>
                  <span className="text-amber-600">G {Math.round((phaseCounts.gas / PARTICLE_COUNT) * 100)}%</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <ExportButtons
                csvData={history.map(h => ({ tick: h.tick, temperature: h.temp.toFixed(2), heat: h.heat.toFixed(2) }))}
                csvFilename="phase-change-data"
                csvHeaders={['tick', 'temperature', 'heat']}
              />
            </div>
            <HeatingCurveGraph history={history} substance={substance} />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
             <PhaseChangeControls
                substanceId={substanceId}
                onSubstanceChange={setSubstanceId}
                heatingState={heatingState}
                setHeatingState={setHeatingState}
                onReset={resetSimulation}
             />
             
             <SocraticMascotPanel tips={PHASE_CHANGE_SOCRATIC_TIPS} title="Thermodynamics Advisor" mood="thinking" />
             
            <div className="bg-slate-800 rounded-3xl shadow-xl p-6 text-white overflow-hidden relative border border-slate-700">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Info className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-violet-300">
                  Concepts at Play
                </h3>
                <ul className="space-y-4 text-sm text-slate-200 font-medium">
                  <li className="flex gap-2">
                    <span className="text-violet-400 font-black">•</span>
                    <span><strong>Kinetic Molecular Theory:</strong> As heat energy is added, particles move with higher average velocities.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 font-black">•</span>
                    <span><strong>Intermolecular Anchors:</strong> In a solid, particles vibrate locally without breaking their attraction to neighbors.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 font-black">•</span>
                    <span><strong>Latent Heat Plateaus:</strong> Notice how temperature halts during a state change. The energy is being used to break the bonds rather than increase speeds.</span>
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
        content={PHASE_CHANGE_ABOUT}
        gradient="from-violet-600 to-purple-700"
      />
    </div>
  );
};

export default PhaseChangeView;
