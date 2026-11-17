import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RotateCcw, Play, Pause, Trophy } from 'lucide-react';
import { HEATING_SUBSTANCES, HeatingSubstanceData } from './thermalStudioConstants';
import ChallengeDeck, { ChallengeDef } from '../shared/ChallengeDeck';

interface HeatingCurveChallengeDef extends ChallengeDef {
  targetSubstance: string;
  mass: number;
  tInitial: number;
  tFinal: number;
  expectedVal: number;
  unit: string;
  tolerancePct: number;
}

const HEATING_CHALLENGES: HeatingCurveChallengeDef[] = [
  {
    id: 'hc-1',
    title: 'Latent Heat of Fusion for Ice',
    description: 'Calculate the heat energy (in Joules) needed to completely melt 50.0 g of ice at 0.0 °C into liquid water at 0.0 °C without raising its temperature.',
    hints: [
      'Why does temperature remain constant while heat is continuously added during a phase change?',
      'Phase changes involve overcoming intermolecular attractions at constant temperature: q_fusion = m · ΔH_fus. For water, ΔH_fus = 334 J/g.',
      'Multiply the mass (50.0 g) by water\'s latent heat of fusion (334 J/g) to find total Joules.',
    ],
    targetSubstance: 'water',
    mass: 50,
    tInitial: 0,
    tFinal: 0,
    expectedVal: 16700,
    unit: 'J',
    tolerancePct: 2
  },
  {
    id: 'hc-2',
    title: 'Water: Multi-Stage Ice to Steam',
    description: 'Calculate the total heat in kilojoules (kJ) needed to transform 25.0 g of ice at -10.0 °C completely into steam at 110.0 °C across all 5 heating and plateau stages.',
    hints: [
      'How many separate thermodynamic stages occur as matter transitions from solid below freezing to gas above boiling?',
      'Sum all 5 stages: q_total = q_solid + q_fus + q_liquid + q_vap + q_gas. Remember to convert Joules to kJ by dividing by 1000.',
      'Calculate each heating step (q = m · c · ΔT) and plateau (q = m · ΔH), sum them, and convert to kJ.',
    ],
    targetSubstance: 'water',
    mass: 25,
    tInitial: -10,
    tFinal: 110,
    expectedVal: 75.6,
    unit: 'kJ',
    tolerancePct: 4
  },
  {
    id: 'hc-3',
    title: 'Ethanol Vaporization Plateau',
    description: 'Calculate the heat absorbed in Joules when 60.0 g of liquid ethanol boils into vapor at its boiling point (78.4 °C).',
    hints: [
      'Does temperature rise while a liquid is actively boiling at constant pressure?',
      'Latent heat of vaporization accounts for overcoming intermolecular attractions: q_vap = m · ΔH_vap. For ethanol, ΔH_vap = 838 J/g.',
      'Multiply the 60.0 g mass by ethanol\'s heat of vaporization (838 J/g).',
    ],
    targetSubstance: 'ethanol',
    mass: 60,
    tInitial: 78.4,
    tFinal: 78.4,
    expectedVal: 50280,
    unit: 'J',
    tolerancePct: 2
  },
  {
    id: 'hc-4',
    title: 'Benzene Liquid Heating Stage',
    description: 'Calculate the heat in Joules needed to warm 40.0 g of liquid benzene from its melting point (5.5 °C) to its boiling point (80.1 °C).',
    hints: [
      'Which heat equation applies when a single phase experiences a temperature change without changing state?',
      'For single-phase temperature changes, use q_liquid = m · c_liquid · ΔT, where benzene has c_liquid = 1.74 J/g·°C.',
      'Compute ΔT = (80.1 - 5.5) °C, and multiply by mass (40.0 g) and c (1.74 J/g·°C).',
    ],
    targetSubstance: 'benzene',
    mass: 40,
    tInitial: 5.5,
    tFinal: 80.1,
    expectedVal: 5192,
    unit: 'J',
    tolerancePct: 3
  }
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
}

export const HeatingCurvesTab: React.FC = () => {
  // Mode & Challenges
  const [challengeMode, setChallengeMode] = useState<boolean>(false);
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');

  // Substance & Parameters
  const [substanceKey, setSubstanceKey] = useState<string>('water');
  const [mass, setMass] = useState<number>(50); // grams
  const [tInitial, setTInitial] = useState<number>(-20); // °C
  const [tFinal, setTFinal] = useState<number>(120); // °C
  const [powerWatts, setPowerWatts] = useState<number>(500); // W (J/s)

  // Simulation State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [elapsedHeat, setElapsedHeat] = useState<number>(0); // Joules transferred

  const substance: HeatingSubstanceData = HEATING_SUBSTANCES[substanceKey] || HEATING_SUBSTANCES.water;

  // Compute 5-stage thermodynamics breakdown
  const stages = useMemo(() => {
    const tM = substance.tMelt;
    const tB = substance.tBoil;

    // Stage 1: Solid warming (if tInitial < tM)
    const q1 = tInitial < tM
      ? mass * substance.cSolid * (Math.min(tFinal, tM) - tInitial)
      : 0;

    // Stage 2: Melting plateau (if tFinal >= tM and tInitial <= tM)
    const q2 = tInitial <= tM && tFinal >= tM ? mass * substance.hFus : 0;

    // Stage 3: Liquid warming (if tFinal > tM and tInitial < tB)
    const tStartLiquid = Math.max(tInitial, tM);
    const tEndLiquid = Math.min(tFinal, tB);
    const q3 = tEndLiquid > tStartLiquid
      ? mass * substance.cLiquid * (tEndLiquid - tStartLiquid)
      : 0;

    // Stage 4: Boiling plateau (if tFinal >= tB and tInitial <= tB)
    const q4 = tInitial <= tB && tFinal >= tB ? mass * substance.hVap : 0;

    // Stage 5: Gas warming (if tFinal > tB)
    const q5 = tFinal > tB
      ? mass * substance.cGas * (tFinal - Math.max(tInitial, tB))
      : 0;

    const qTot = q1 + q2 + q3 + q4 + q5;

    return { q1, q2, q3, q4, q5, qTot };
  }, [substance, mass, tInitial, tFinal]);

  // Current temperature and phase fraction given elapsedHeat
  const currentStatus = useMemo(() => {
    let rem = elapsedHeat;
    const tM = substance.tMelt;
    const tB = substance.tBoil;

    if (stages.q1 > 0) {
      if (rem <= stages.q1) {
        const frac = stages.q1 > 0 ? rem / stages.q1 : 1;
        const curT = tInitial + (Math.min(tFinal, tM) - tInitial) * frac;
        return { temp: curT, phase: 'Solid', phaseDetail: 'Warming Solid Lattice', fraction: frac };
      }
      rem -= stages.q1;
    }

    if (stages.q2 > 0) {
      if (rem <= stages.q2) {
        const frac = stages.q2 > 0 ? rem / stages.q2 : 1;
        return { temp: tM, phase: 'Melting', phaseDetail: `Melting Plateau (${Math.round(frac * 100)}% Liquid)`, fraction: frac };
      }
      rem -= stages.q2;
    }

    if (stages.q3 > 0) {
      if (rem <= stages.q3) {
        const tStartLiquid = Math.max(tInitial, tM);
        const tEndLiquid = Math.min(tFinal, tB);
        const frac = stages.q3 > 0 ? rem / stages.q3 : 1;
        const curT = tStartLiquid + (tEndLiquid - tStartLiquid) * frac;
        return { temp: curT, phase: 'Liquid', phaseDetail: 'Warming Liquid Solution', fraction: frac };
      }
      rem -= stages.q3;
    }

    if (stages.q4 > 0) {
      if (rem <= stages.q4) {
        const frac = stages.q4 > 0 ? rem / stages.q4 : 1;
        return { temp: tB, phase: 'Boiling', phaseDetail: `Vaporization Plateau (${Math.round(frac * 100)}% Vapor)`, fraction: frac };
      }
      rem -= stages.q4;
    }

    if (stages.q5 > 0) {
      const frac = stages.q5 > 0 ? Math.min(1, rem / stages.q5) : 1;
      const curT = Math.max(tInitial, tB) + (tFinal - Math.max(tInitial, tB)) * frac;
      return { temp: curT, phase: 'Gas', phaseDetail: 'Superheated Vapor', fraction: frac };
    }

    return { temp: tFinal, phase: 'Complete', phaseDetail: 'Thermal Target Reached', fraction: 1 };
  }, [elapsedHeat, stages, substance, tInitial, tFinal]);

  // Animation Loop for Heat Addition
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    let reqId: number;

    const tick = (now: number) => {
      if (lastTimeRef.current !== null) {
        const dt = (now - lastTimeRef.current) / 1000;
        // Speed up time: 1 sec simulation = 15 seconds real energy input for responsive interaction
        const heatAdded = powerWatts * dt * 18;

        setElapsedHeat(prev => {
          const next = prev + heatAdded;
          if (next >= stages.qTot) {
            setIsPlaying(false);
            return stages.qTot;
          }
          return next;
        });
      }
      lastTimeRef.current = now;
      reqId = requestAnimationFrame(tick);
    };

    reqId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(reqId);
  }, [isPlaying, powerWatts, stages.qTot]);

  // Particulate Canvas Simulation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize particles in grid
  useEffect(() => {
    const list: Particle[] = [];
    const cols = 8;
    const rows = 6;
    const spacingX = 22;
    const spacingY = 22;
    const startX = 40;
    const startY = 30;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ox = startX + c * spacingX;
        const oy = startY + r * spacingY;
        list.push({
          x: ox,
          y: oy,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          originX: ox,
          originY: oy
        });
      }
    }
    particlesRef.current = list;
  }, []);

  // Animate particles based on currentStatus.phase
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let partReq: number;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.clearRect(0, 0, width, height);

      const phase = currentStatus.phase;
      const fraction = currentStatus.fraction;

      particlesRef.current.forEach(p => {
        if (phase === 'Solid') {
          // Lattice vibrations anchored to origin
          const amp = 1.2 + (currentStatus.temp - tInitial) * 0.05;
          p.x = p.originX + (Math.random() - 0.5) * amp;
          p.y = p.originY + (Math.random() - 0.5) * amp;
        } else if (phase === 'Melting') {
          // Partial lattice loosening
          const loose = Math.random() < fraction;
          if (loose) {
            p.x += p.vx * 1.5;
            p.y += p.vy * 1.5;
            if (p.x < 15 || p.x > width - 15) p.vx *= -1;
            if (p.y < 40 || p.y > height - 15) p.vy *= -1;
          } else {
            p.x = p.originX + (Math.random() - 0.5) * 2;
            p.y = p.originY + (Math.random() - 0.5) * 2;
          }
        } else if (phase === 'Liquid') {
          // Sliding particles, denser at bottom
          p.x += p.vx * 2;
          p.y += p.vy * 2;
          // Fluid boundary
          if (p.x < 15 || p.x > width - 15) p.vx *= -1;
          if (p.y < 35 || p.y > height - 15) p.vy *= -1;
        } else if (phase === 'Boiling') {
          // Fast liquid + escaping gas particles
          const isGas = Math.random() < fraction;
          const speedMult = isGas ? 4.5 : 2.5;
          p.x += p.vx * speedMult;
          p.y += p.vy * speedMult;
          if (p.x < 15 || p.x > width - 15) p.vx *= -1;
          if (p.y < 15 || p.y > height - 15) p.vy *= -1;
        } else {
          // Gas: high-velocity ballistic bouncing throughout chamber
          p.x += p.vx * 5;
          p.y += p.vy * 5;
          if (p.x < 15 || p.x > width - 15) p.vx *= -1;
          if (p.y < 15 || p.y > height - 15) p.vy *= -1;
        }

        // Draw particle sphere
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = substance.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      partReq = requestAnimationFrame(render);
    };

    partReq = requestAnimationFrame(render);
    return () => cancelAnimationFrame(partReq);
  }, [currentStatus, substance, tInitial]);

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedHeat(0);
  };

  const handleApplyChallenge = (idx: number = challengeIdx) => {
    const cur = HEATING_CHALLENGES[idx];
    setSubstanceKey(cur.targetSubstance);
    setMass(cur.mass);
    setTInitial(cur.tInitial);
    setTFinal(cur.tFinal);
    setIsPlaying(false);
    setElapsedHeat(0);
    setUserAnswer('');
  };

  const handleApplySolution = (idx: number = challengeIdx) => {
    handleApplyChallenge(idx);
    const cur = HEATING_CHALLENGES[idx];
    setUserAnswer(String(cur.expectedVal));
  };

  const handleVerifyChallenge = () => {
    const num = parseFloat(userAnswer);
    if (isNaN(num)) {
      return { success: false, message: 'Please enter a valid numeric value.' };
    }
    const cur = HEATING_CHALLENGES[challengeIdx];
    const diff = Math.abs(num - cur.expectedVal);
    const pct = (diff / cur.expectedVal) * 100;
    if (pct <= cur.tolerancePct) {
      return {
        success: true,
        message: `Your calculated value of ${num} ${cur.unit} matches theory within ${pct.toFixed(1)}% (${cur.expectedVal} ${cur.unit}).`
      };
    }
    return {
      success: false,
      message: `Your answer of ${num} ${cur.unit} is outside tolerance (expected ~${cur.expectedVal} ${cur.unit}). Check each stage equation.`
    };
  };

  const curChallenge = HEATING_CHALLENGES[challengeIdx];

  // SVG Heating Curve Coordinate Mapping
  const graphWidth = 440;
  const graphHeight = 180;
  const margin = { left: 45, right: 25, top: 15, bottom: 25 };
  const innerW = graphWidth - margin.left - margin.right;
  const innerH = graphHeight - margin.top - margin.bottom;

  const tMin = Math.min(tInitial, substance.tMelt - 10);
  const tMax = Math.max(tFinal, substance.tBoil + 20);

  const getX = (q: number) => margin.left + (stages.qTot > 0 ? (q / stages.qTot) * innerW : 0);
  const getY = (temp: number) => margin.top + innerH - ((temp - tMin) / (tMax - tMin || 1)) * innerH;

  // Key curve points
  const p0 = { x: getX(0), y: getY(tInitial) };
  const p1 = { x: getX(stages.q1), y: getY(substance.tMelt) };
  const p2 = { x: getX(stages.q1 + stages.q2), y: getY(substance.tMelt) };
  const p3 = { x: getX(stages.q1 + stages.q2 + stages.q3), y: getY(substance.tBoil) };
  const p4 = { x: getX(stages.q1 + stages.q2 + stages.q3 + stages.q4), y: getY(substance.tBoil) };
  const p5 = { x: getX(stages.qTot), y: getY(tFinal) };

  const tracerX = getX(elapsedHeat);
  const tracerY = getY(currentStatus.temp);

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
            Free Heating Workbench
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
            Heating Curve Challenges
          </button>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline pr-2 font-mono">
          Σq = q_solid + q_fus + q_liquid + q_vap + q_gas
        </span>
      </div>

      {/* Challenge Deck */}
      {challengeMode && (
        <ChallengeDeck
          title="Heating Curve Challenges"
          challenges={HEATING_CHALLENGES}
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

      {/* Controls & Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <span className="font-bold text-sm">Heating Controls</span>
            <button
              onClick={handleReset}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Substance Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Choose Chemical Substance
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(HEATING_SUBSTANCES).map(key => (
                <button
                  key={key}
                  disabled={isPlaying}
                  onClick={() => {
                    setSubstanceKey(key);
                    handleReset();
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                    substanceKey === key
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {HEATING_SUBSTANCES[key].name.split(' ')[0]}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-mono pt-1">
              <span>Melt: {substance.tMelt} °C</span>
              <span>Boil: {substance.tBoil} °C</span>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between text-xs font-bold">
              <span>Sample Mass</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono">{mass} g</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              disabled={isPlaying}
              value={mass}
              onChange={e => {
                setMass(Number(e.target.value));
                handleReset();
              }}
              className="w-full accent-amber-500 disabled:opacity-50"
            />

            <div className="flex justify-between text-xs font-bold">
              <span>Initial Temp (T_i)</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono">{tInitial} °C</span>
            </div>
            <input
              type="range"
              min={substance.tMelt - 40}
              max={substance.tMelt + 10}
              step="2"
              disabled={isPlaying}
              value={tInitial}
              onChange={e => {
                setTInitial(Number(e.target.value));
                handleReset();
              }}
              className="w-full accent-amber-500 disabled:opacity-50"
            />

            <div className="flex justify-between text-xs font-bold">
              <span>Target Final Temp (T_f)</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono">{tFinal} °C</span>
            </div>
            <input
              type="range"
              min={substance.tBoil - 10}
              max={substance.tBoil + 50}
              step="5"
              disabled={isPlaying}
              value={tFinal}
              onChange={e => {
                setTFinal(Number(e.target.value));
                handleReset();
              }}
              className="w-full accent-amber-500 disabled:opacity-50"
            />

            <div className="flex justify-between text-xs font-bold">
              <span>Heat Source Power</span>
              <span className="text-rose-600 dark:text-rose-400 font-mono">{powerWatts} W</span>
            </div>
            <input
              type="range"
              min="200"
              max="1500"
              step="50"
              value={powerWatts}
              onChange={e => setPowerWatts(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                isPlaying
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:brightness-110'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              {isPlaying ? 'Pause Heating' : 'Apply Heat Energy'}
            </button>
          </div>
        </div>

        {/* Visual Graph & Particulate Ensemble Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Synchronized Heating Curve SVG */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-600 dark:text-slate-300">
                  Dynamic Heating Curve (Temperature vs. Heat Added)
                </h3>
                <span className="text-xs text-slate-400">
                  Current Status: <strong className="text-amber-500">{currentStatus.phaseDetail}</strong> ({currentStatus.temp.toFixed(1)} °C)
                </span>
              </div>
              <div className="text-xs font-mono text-right">
                <span className="text-slate-400 block">Total Heat Input:</span>
                <strong className="text-rose-500 text-sm font-bold">
                  {(elapsedHeat / 1000).toFixed(1)} / {(stages.qTot / 1000).toFixed(1)} kJ
                </strong>
              </div>
            </div>

            {/* SVG Graph */}
            <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-2 border border-slate-100 dark:border-slate-800 overflow-x-auto">
              <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-auto">
                {/* Horizontal guide lines */}
                <line x1={margin.left} y1={getY(substance.tMelt)} x2={graphWidth - margin.right} y2={getY(substance.tMelt)} stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1={margin.left} y1={getY(substance.tBoil)} x2={graphWidth - margin.right} y2={getY(substance.tBoil)} stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3" />

                {/* Y-axis ticks */}
                <text x={margin.left - 6} y={getY(substance.tMelt) + 4} textAnchor="end" fontSize="9" fill="#64748b" fontFamily="monospace">{substance.tMelt}°</text>
                <text x={margin.left - 6} y={getY(substance.tBoil) + 4} textAnchor="end" fontSize="9" fill="#64748b" fontFamily="monospace">{substance.tBoil}°</text>

                {/* Stage 1: Solid */}
                {stages.q1 > 0 && (
                  <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                )}
                {/* Stage 2: Melting Plateau */}
                {stages.q2 > 0 && (
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                )}
                {/* Stage 3: Liquid */}
                {stages.q3 > 0 && (
                  <line x1={p2.x} y1={p2.y} x2={p3.x} y2={p3.y} stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
                )}
                {/* Stage 4: Boiling Plateau */}
                {stages.q4 > 0 && (
                  <line x1={p3.x} y1={p3.y} x2={p4.x} y2={p4.y} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                )}
                {/* Stage 5: Gas */}
                {stages.q5 > 0 && (
                  <line x1={p4.x} y1={p4.y} x2={p5.x} y2={p5.y} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                )}

                {/* Active Tracer Point */}
                <circle cx={tracerX} cy={tracerY} r="6" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                <circle cx={tracerX} cy={tracerY} r="10" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" className="animate-spin" />
              </svg>

              <div className="flex flex-wrap justify-between text-xs font-mono text-slate-500 pt-2 px-2 border-t border-slate-200 dark:border-slate-800">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500"></span> Solid (c_s)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500"></span> Fusion (ΔH_fus)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-sky-600"></span> Liquid (c_l)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500"></span> Vaporization (ΔH_vap)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500"></span> Gas (c_g)</span>
              </div>
            </div>
          </div>

          {/* Particulate State Chamber & Energy Stage Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Particulate Canvas */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-xs">
                  Molecular Ensemble Simulation
                </h4>
                <span className="font-mono text-xs font-bold text-amber-500">
                  {currentStatus.phase}
                </span>
              </div>

              <div className="h-44 w-full bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center border border-slate-700">
                <canvas
                  ref={canvasRef}
                  width={260}
                  height={170}
                  className="w-full h-full"
                />
              </div>
              <p className="text-xs text-slate-400 italic">
                {currentStatus.phase === 'Solid' && 'Particles vibrate in an ordered crystal lattice.'}
                {currentStatus.phase === 'Melting' && 'Intermolecular lattice bonds break without temperature rise.'}
                {currentStatus.phase === 'Liquid' && 'Particles slide and tumble past each other in continuous contact.'}
                {currentStatus.phase === 'Boiling' && 'Overcoming all intermolecular attractions into free vapor.'}
                {currentStatus.phase === 'Gas' && 'High-speed ballistic motion with negligible intermolecular attraction.'}
              </p>
            </div>

            {/* Five Stage Energy Breakdown */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 text-xs space-y-2.5">
              <h4 className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-xs">
                Energy Breakdown by Stage
              </h4>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">q1 (Solid):</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(stages.q1).toLocaleString()} J
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">q2 (Fusion Plateau):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(stages.q2).toLocaleString()} J
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">q3 (Liquid):</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    {Math.round(stages.q3).toLocaleString()} J
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">q4 (Boiling Plateau):</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {Math.round(stages.q4).toLocaleString()} J
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">q5 (Vapor):</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {Math.round(stages.q5).toLocaleString()} J
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Total Energy (Σq):</span>
                  <span className="font-black text-rose-600 dark:text-rose-400">
                    {(stages.qTot / 1000).toFixed(2)} kJ
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

export default HeatingCurvesTab;
