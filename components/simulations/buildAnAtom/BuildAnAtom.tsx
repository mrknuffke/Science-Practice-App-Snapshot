import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Atom, RefreshCw, AlertTriangle, CheckCircle, Info, Plus, Minus } from 'lucide-react';
import { SocraticMascotPanel } from '../shared/SocraticMascotPanel';
import { PERIODIC_TABLE_ELEMENTS } from '../periodicTable/periodicTableData';
import ElementDetailModal from './ElementDetailModal';
import ChallengeDeck, { ChallengeDef } from '../shared/ChallengeDeck';

interface BuildAnAtomProps {
  onBack: () => void;
}

interface ElementInfo {
  z: number;
  symbol: string;
  name: string;
  mass: number;
  category: string;
}

const SANDBOX_ELEMENTS: Record<number, ElementInfo> = {
  1: { z: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, category: 'Nonmetal' },
  2: { z: 2, symbol: 'He', name: 'Helium', mass: 4.003, category: 'Noble Gas' },
  3: { z: 3, symbol: 'Li', name: 'Lithium', mass: 6.94, category: 'Alkali Metal' },
  4: { z: 4, symbol: 'Be', name: 'Beryllium', mass: 9.012, category: 'Alkaline Earth' },
  5: { z: 5, symbol: 'B', name: 'Boron', mass: 10.81, category: 'Metalloid' },
  6: { z: 6, symbol: 'C', name: 'Carbon', mass: 12.011, category: 'Nonmetal' },
  7: { z: 7, symbol: 'N', name: 'Nitrogen', mass: 14.007, category: 'Nonmetal' },
  8: { z: 8, symbol: 'O', name: 'Oxygen', mass: 15.999, category: 'Nonmetal' },
  9: { z: 9, symbol: 'F', name: 'Fluorine', mass: 18.998, category: 'Halogen' },
  10: { z: 10, symbol: 'Ne', name: 'Neon', mass: 20.180, category: 'Noble Gas' },
  11: { z: 11, symbol: 'Na', name: 'Sodium', mass: 22.990, category: 'Alkali Metal' },
  12: { z: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.305, category: 'Alkaline Earth' },
  13: { z: 13, symbol: 'Al', name: 'Aluminium', mass: 26.982, category: 'Post-Transition Metal' },
  14: { z: 14, symbol: 'Si', name: 'Silicon', mass: 28.085, category: 'Metalloid' },
  15: { z: 15, symbol: 'P', name: 'Phosphorus', mass: 30.974, category: 'Nonmetal' },
  16: { z: 16, symbol: 'S', name: 'Sulfur', mass: 32.06, category: 'Nonmetal' },
  17: { z: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, category: 'Halogen' },
  18: { z: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, category: 'Noble Gas' }
};

export interface AtomChallengeDef extends ChallengeDef {
  targetP: number;
  targetN: number;
  targetE: number;
}

export const ATOM_CHALLENGES: AtomChallengeDef[] = [
  {
    id: 1,
    title: 'Build Protium (Hydrogen-1)',
    description: 'Build a stable, neutral atom of Protium (¹H) with mass number 1 and charge 0.',
    hints: [
      'Which subatomic particle defines an element as Hydrogen?',
      'Hydrogen has atomic number Z = 1 (1 proton). Protium is the only stable nuclide with 0 neutrons, and neutrality requires equal protons and electrons.',
      'Configure 1 proton, 0 neutrons, and 1 electron.',
    ],
    solution: '1 proton, 0 neutrons, 1 electron.',
    targetP: 1,
    targetN: 0,
    targetE: 1,
  },
  {
    id: 2,
    title: 'Build Deuterium (Hydrogen-2)',
    description: 'Build a stable, neutral isotope of Deuterium (²H), doubling the mass of Hydrogen without changing its elemental identity.',
    hints: [
      'How can you increase the mass number of an atom without changing its chemical identity?',
      'Isotopes share the same number of protons but differ in neutron count. Deuterium has 1 proton and 1 neutron (mass number A = 2).',
      'Configure 1 proton, 1 neutron, and 1 electron.',
    ],
    solution: '1 proton, 1 neutron, 1 electron.',
    targetP: 1,
    targetN: 1,
    targetE: 1,
  },
  {
    id: 3,
    title: 'Build Helium-4',
    description: 'Build a stable, neutral atom of Helium-4 (⁴He) with a full first electron shell (duet).',
    hints: [
      'How many protons determine the noble gas Helium on the periodic table?',
      'Helium has atomic number 2. Its most abundant isotope has 2 neutrons (A = 4) and a completely filled n = 1 shell with 2 electrons.',
      'Configure 2 protons, 2 neutrons, and 2 electrons.',
    ],
    solution: '2 protons, 2 neutrons, 2 electrons.',
    targetP: 2,
    targetN: 2,
    targetE: 2,
  },
  {
    id: 4,
    title: 'Build a Lithium-7 Cation (Li⁺)',
    description: 'Build a stable Lithium-7 cation (⁷Li⁺) with a mass number of 7 and a net positive charge of +1.',
    hints: [
      'What creates a positive net charge (cation) in an atom: adding protons or removing electrons?',
      'Net charge = protons - electrons. Lithium has 3 protons. For mass 7, it needs 4 neutrons (3 + 4 = 7). A +1 charge means 1 fewer electron than protons.',
      'Configure 3 protons, 4 neutrons, and 2 electrons.',
    ],
    solution: '3 protons, 4 neutrons, 2 electrons.',
    targetP: 3,
    targetN: 4,
    targetE: 2,
  },
  {
    id: 5,
    title: 'Build a Carbon-12 Atom',
    description: 'Build the standard reference isotope for atomic mass: a neutral Carbon-12 atom (¹²C).',
    hints: [
      'What is the atomic number of Carbon on the periodic table?',
      'Carbon has 6 protons. Carbon-12 contains an equal number of neutrons (6) for a total mass number of 12, with 6 electrons balancing charge.',
      'Configure 6 protons, 6 neutrons, and 6 electrons.',
    ],
    solution: '6 protons, 6 neutrons, 6 electrons.',
    targetP: 6,
    targetN: 6,
    targetE: 6,
  },
  {
    id: 6,
    title: 'Build an Oxygen-16 Anion (O²⁻)',
    description: 'Construct a stable Oxygen-16 oxide anion (¹⁶O²⁻) with a complete valence octet and a charge of -2.',
    hints: [
      'How many electrons does an Oxygen atom gain to achieve a stable noble gas neon-like configuration?',
      'Oxygen (Z = 8) with mass 16 has 8 neutrons. Gaining 2 additional electrons yields an anion with charge -2 (8 protons, 10 electrons).',
      'Configure 8 protons, 8 neutrons, and 10 electrons.',
    ],
    solution: '8 protons, 8 neutrons, 10 electrons.',
    targetP: 8,
    targetN: 8,
    targetE: 10,
  },
  {
    id: 7,
    title: 'Build Radioactive Tritium (Hydrogen-3)',
    description: 'Construct an atom of Tritium (³H), the radioactive beta-emitting isotope of Hydrogen with mass number 3.',
    hints: [
      'Why does having too many neutrons compared to protons make a light nucleus unstable?',
      'Tritium has 1 proton and 2 neutrons (A = 3). The N/Z ratio of 2.0 causes beta-minus instability, decaying to Helium-3.',
      'Configure 1 proton, 2 neutrons, and 1 electron.',
    ],
    solution: '1 proton, 2 neutrons, 1 electron.',
    targetP: 1,
    targetN: 2,
    targetE: 1,
  },
  {
    id: 8,
    title: 'Build a stable Neon-20 Atom',
    description: 'Construct a neutral Neon-20 atom with completely filled first and second electron shells (duet and octet).',
    hints: [
      'What electron configuration corresponds to a complete octet in the second shell (n = 2)?',
      'Neon has atomic number 10. With 10 neutrons (A = 20) and 10 electrons (2 in shell 1, 8 in shell 2), it is chemically inert.',
      'Configure 10 protons, 10 neutrons, and 10 electrons.',
    ],
    solution: '10 protons, 10 neutrons, 10 electrons.',
    targetP: 10,
    targetN: 10,
    targetE: 10,
  },
];

const SOCRATIC_TIPS = [
  "Protons determine the element identity. If you change protons, you change the element. What happens when you change electrons or neutrons instead?",
  "Neutrons act like nuclear glue. Too few or too many, and the nucleus shakes. Why do larger elements require a higher neutron-to-proton ratio for stability?",
  "Electrons fill shells from the inside out: 2 in the first shell, 8 in the second, and 8 in the third. How does the valence (outermost) shell affect chemical reactivity?",
  "Net Charge = Protons minus Electrons. If you have more protons, it is a Cation (+). If you have more electrons, it is an Anion (-). When is it neutral?",
  "Mass Number = Protons + Neutrons. Electrons have negligible mass compared to nucleons, so they do not add to the mass number. Why is this?"
];

export const BuildAnAtom: React.FC<BuildAnAtomProps> = ({ onBack }) => {
  // Nucleon counts
  const [protons, setProtons] = useState<number>(0);
  const [neutrons, setNeutrons] = useState<number>(0);
  const [electrons, setElectrons] = useState<number>(0);

  // Animation angle offset for electrons
  const [angleOffset, setAngleOffset] = useState<number>(0);
  const requestRef = useRef<number | null>(null);

  // Challenge deck state
  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number>(0);
  const [_challengeSuccess, setChallengeSuccess] = useState<boolean | null>(null);

  // Element detail popup (periodic-table-style info)
  const [showElementDetail, setShowElementDetail] = useState<boolean>(false);

  // Update electron rotation angle
  useEffect(() => {
    const animate = () => {
      setAngleOffset(prev => (prev + 0.02) % (Math.PI * 2));
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Compute stability
  const getStability = (p: number, n: number): { stable: boolean; reason: string } => {
    if (p === 0) return { stable: true, reason: "No protons: empty space." };
    
    // Stability rules for Z <= 10
    switch (p) {
      case 1:
        if (n === 0 || n === 1) return { stable: true, reason: "Stable (Protium / Deuterium)" };
        if (n === 2) return { stable: false, reason: "Unstable Tritium (Radioactive Beta Decayer)" };
        return { stable: false, reason: "Highly unstable: Cannot hold this ratio." };
      case 2:
        if (n === 1 || n === 2) return { stable: true, reason: "Stable Helium isotope" };
        return { stable: false, reason: "Unstable: Ratios of Helium need 1 or 2 neutrons." };
      case 3:
        if (n === 3 || n === 4) return { stable: true, reason: "Stable Lithium isotope" };
        return { stable: false, reason: "Unstable: Too few/many neutrons for Lithium." };
      case 4:
        if (n === 5) return { stable: true, reason: "Stable Beryllium-9" };
        if (n === 4) return { stable: false, reason: "Highly Unstable Beryllium-8 (Alpha decays immediately!)" };
        return { stable: false, reason: "Unstable: Beryllium requires 5 neutrons." };
      case 5:
        if (n === 5 || n === 6) return { stable: true, reason: "Stable Boron isotope" };
        return { stable: false, reason: "Unstable: Boron requires 5 or 6 neutrons." };
      case 6:
        if (n === 6 || n === 7) return { stable: true, reason: "Stable Carbon-12 / Carbon-13" };
        if (n === 8) return { stable: false, reason: "Unstable Carbon-14 (Radioactive!)" };
        return { stable: false, reason: "Unstable: Carbon requires 6 or 7 neutrons." };
      case 7:
        if (n === 7 || n === 8) return { stable: true, reason: "Stable Nitrogen isotope" };
        return { stable: false, reason: "Unstable: Nitrogen requires 7 or 8 neutrons." };
      case 8:
        if (n === 8 || n === 9 || n === 10) return { stable: true, reason: "Stable Oxygen isotope" };
        return { stable: false, reason: "Unstable: Oxygen requires 8 to 10 neutrons." };
      case 9:
        if (n === 10) return { stable: true, reason: "Stable Fluorine-19" };
        return { stable: false, reason: "Unstable: Fluorine requires 10 neutrons." };
      case 10:
        if (n === 10 || n === 11 || n === 12) return { stable: true, reason: "Stable Neon isotope" };
        return { stable: false, reason: "Unstable: Neon requires 10 to 12 neutrons." };
      case 11:
        if (n === 12) return { stable: true, reason: "Stable Sodium-23" };
        return { stable: false, reason: "Unstable: Sodium requires 12 neutrons." };
      case 12:
        if (n === 12 || n === 13 || n === 14) return { stable: true, reason: "Stable Magnesium isotope" };
        return { stable: false, reason: "Unstable: Magnesium requires 12 to 14 neutrons." };
      case 13:
        if (n === 14) return { stable: true, reason: "Stable Aluminium-27" };
        return { stable: false, reason: "Unstable: Aluminium requires 14 neutrons." };
      case 14:
        if (n === 14 || n === 15 || n === 16) return { stable: true, reason: "Stable Silicon isotope" };
        return { stable: false, reason: "Unstable: Silicon requires 14 to 16 neutrons." };
      case 15:
        if (n === 16) return { stable: true, reason: "Stable Phosphorus-31" };
        return { stable: false, reason: "Unstable: Phosphorus requires 16 neutrons." };
      case 16:
        if (n === 16 || n === 17 || n === 18 || n === 20) return { stable: true, reason: "Stable Sulfur isotope" };
        return { stable: false, reason: "Unstable: Sulfur is stable at 16, 17, 18, or 20 neutrons." };
      case 17:
        if (n === 18 || n === 20) return { stable: true, reason: "Stable Chlorine isotope (Cl-35 / Cl-37)" };
        return { stable: false, reason: "Unstable: Chlorine requires 18 or 20 neutrons." };
      case 18:
        if (n === 18 || n === 20 || n === 22) return { stable: true, reason: "Stable Argon isotope (Ar-36 / Ar-38 / Ar-40)" };
        return { stable: false, reason: "Unstable: Argon is stable at 18, 20, or 22 neutrons." };
      default:
        return { stable: false, reason: "Heavy nuclei are outside this Bohr sandbox." };
    }
  };

  const stabilityInfo = getStability(protons, neutrons);
  const isUnstable = !stabilityInfo.stable;

  // Mass and charge
  const massNumber = protons + neutrons;
  const netCharge = protons - electrons;

  const getChargeLabel = (c: number) => {
    if (c > 0) return `Cation (+${c})`;
    if (c < 0) return `Anion (${c})`;
    return "Neutral Atom";
  };

  const activeElement = SANDBOX_ELEMENTS[protons] || null;
  // Full periodic-table record for the current element, used by the detail popup
  const periodicElement = protons > 0 ? PERIODIC_TABLE_ELEMENTS.find(e => e.atomicNumber === protons) ?? null : null;

  // Neutron count of the most abundant stable isotope, per atomic number (Z 1 to 18)
  const STD_NEUTRONS: Record<number, number> = {
    1: 0, 2: 2, 3: 4, 4: 5, 5: 6, 6: 6, 7: 7, 8: 8, 9: 10, 10: 10,
    11: 12, 12: 12, 13: 14, 14: 14, 15: 16, 16: 16, 17: 18, 18: 22,
  };

  // Autocomplete element
  const handleAutocomplete = (z: number) => {
    const el = SANDBOX_ELEMENTS[z];
    if (el) {
      setProtons(z);
      setNeutrons(STD_NEUTRONS[z] ?? z);
      setElectrons(z);
      setChallengeSuccess(null);
    }
  };

  // Reset sandbox
  const handleReset = () => {
    setProtons(0);
    setNeutrons(0);
    setElectrons(0);
    setChallengeSuccess(null);
  };

  // Golden ratio spiral for rendering protons & neutrons in nucleus
  const generateNucleusPositions = (pCount: number, nCount: number) => {
    const total = pCount + nCount;
    const positions = [];
    const spacing = 7.5; // spacing constant
    
    // Use a fixed seed pattern so nucleons don't swap types or move randomly on add/remove
    for (let i = 0; i < total; i++) {
      const r = spacing * Math.sqrt(i + 0.5);
      const theta = i * 2.39996; // Golden angle in radians
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      
      // Alternate protons and neutrons to look uniform, or allocate by counts
      let isProton = false;
      if (i < pCount) {
        isProton = true;
      }
      
      positions.push({ x, y, isProton });
    }
    return positions;
  };

  const nucleusParticles = generateNucleusPositions(protons, neutrons);

  // Electron shell configuration
  const getShellAllocation = (eCount: number) => {
    const shell1 = Math.min(eCount, 2);
    const shell2 = Math.min(Math.max(eCount - 2, 0), 8);
    const shell3 = Math.min(Math.max(eCount - 10, 0), 8);
    return [shell1, shell2, shell3];
  };

  const shellAllocations = getShellAllocation(electrons);
  const shellRadii = [60, 110, 160];
  // Index of the outermost occupied shell (valence shell)
  const valenceShellIdx = shellAllocations[2] > 0 ? 2 : shellAllocations[1] > 0 ? 1 : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#12141C] p-4 md:p-8 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1.5px, -1px) rotate(-0.5deg); }
          20% { transform: translate(-2px, 0px) rotate(0.5deg); }
          30% { transform: translate(0px, 1.5px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(0.5deg); }
          50% { transform: translate(-1px, 1px) rotate(-0.5deg); }
          60% { transform: translate(-2px, 0.5px) rotate(0deg); }
          70% { transform: translate(1.5px, 0.5px) rotate(-0.5deg); }
          80% { transform: translate(-0.5px, -0.5px) rotate(0.5deg); }
          90% { transform: translate(1.5px, 1.5px) rotate(0deg); }
          100% { transform: translate(0.5px, -1px) rotate(-0.5deg); }
        }
        .animate-shake {
          animation: shake 0.25s infinite;
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#1A1D26] p-4 rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-750 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-100 dark:bg-violet-950/40 rounded-2xl text-violet-600 dark:text-violet-400">
                <Atom className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black font-rounded tracking-tight">Build an Atom</h1>
                <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">Bohr atomic structure sandbox and isotope stability explorer. Inspired by PhET Interactive Simulations, University of Colorado Boulder</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Sandbox
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Bohr Canvas Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-[#1A1D26] border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
              
              {/* Stability Badge */}
              <div className="absolute top-4 left-4 z-10">
                {protons > 0 && (
                  <div className={`px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all ${
                    isUnstable
                      ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 animate-pulse'
                      : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                  }`}>
                    {isUnstable ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    <span>{isUnstable ? "Unstable Nucleus (Radioactive ☢️)" : "Stable Nucleus"}</span>
                  </div>
                )}
              </div>

              {/* Compact Mass & Charge readout above the atom window */}
              <div className="w-full flex justify-end gap-2 min-h-[2rem]">
                {protons > 0 && (
                  <>
                    <div className="px-3 py-1 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/50 text-violet-700 dark:text-violet-300 text-xs font-black">
                      Mass A = {massNumber}
                    </div>
                    <div className={`px-3 py-1 rounded-xl border text-xs font-black ${
                      netCharge === 0
                        ? 'bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border-slate-200 dark:border-slate-700'
                        : netCharge > 0
                        ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50'
                        : 'bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/50'
                    }`}>
                      Charge {netCharge > 0 ? `+${netCharge}` : netCharge}
                    </div>
                  </>
                )}
              </div>

              {/* Bohr SVG Drawing */}
              <div className="w-full flex justify-center py-4">
                <svg
                  viewBox="-200 -200 400 400"
                  className="w-full max-w-[400px] h-auto select-none"
                >
                  {/* Orbit Background Rings */}
                  {shellRadii.map((radius, idx) => (
                    <circle
                      key={idx}
                      cx="0"
                      cy="0"
                      r={radius}
                      fill="none"
                      stroke={shellAllocations[idx] > 0 ? "rgba(124, 58, 237, 0.25)" : "rgba(100, 116, 139, 0.1)"}
                      strokeWidth="1.5"
                      strokeDasharray={shellAllocations[idx] > 0 ? "none" : "4,4"}
                      className="transition-colors duration-300"
                    />
                  ))}

                  {/* Shell Labels */}
                  {shellRadii.map((radius, idx) => (
                    <text
                      key={idx}
                      x={radius}
                      y="-4"
                      className="text-[9px] font-black fill-slate-350 dark:fill-slate-500 uppercase tracking-widest pointer-events-none"
                    >
                      n={idx + 1}
                    </text>
                  ))}

                  {/* Central Nucleus (Shakes if unstable) */}
                  <g className={isUnstable ? "animate-shake" : ""}>
                    {/* Core boundary halo */}
                    <circle
                      cx="0"
                      cy="0"
                      r="40"
                      fill="rgba(100, 116, 139, 0.05)"
                      stroke="rgba(100, 116, 139, 0.15)"
                      strokeWidth="1"
                    />

                    {/* Clustered Protons & Neutrons */}
                    {nucleusParticles.map((nuc, idx) => (
                      <circle
                        key={idx}
                        cx={nuc.x}
                        cy={nuc.y}
                        r="6.5"
                        fill={nuc.isProton ? "url(#protonGrad)" : "url(#neutronGrad)"}
                        stroke={nuc.isProton ? "#dc2626" : "#475569"}
                        strokeWidth="0.5"
                        className="transition-all duration-300 shadow-sm"
                      />
                    ))}
                    
                    {/* Label when nucleus empty */}
                    {protons === 0 && neutrons === 0 && (
                      <text
                        cx="0"
                        cy="0"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-[9px] font-black fill-slate-300 dark:fill-slate-650 uppercase tracking-widest pointer-events-none"
                      >
                        Empty Core
                      </text>
                    )}
                  </g>

                  {/* Revolving Electrons */}
                  {shellAllocations.map((eInShell, shellIdx) => {
                    const radius = shellRadii[shellIdx];
                    return Array.from({ length: eInShell }).map((_, eIdx) => {
                      // Distribute electrons evenly around the circle
                      const baseAngle = (eIdx / eInShell) * Math.PI * 2;
                      const speedMultiplier = (3 - shellIdx) * 0.7 + 0.3; // shells move at slightly different speeds
                      const angle = baseAngle + angleOffset * speedMultiplier;
                      
                      const ex = radius * Math.cos(angle);
                      const ey = radius * Math.sin(angle);
                      
                      return (
                        <g key={`${shellIdx}-${eIdx}`}>
                          {/* Inner pulsing electron */}
                          <circle
                            cx={ex}
                            cy={ey}
                            r="5"
                            fill={shellIdx === valenceShellIdx ? "url(#electronGrad)" : "url(#kernelElectronGrad)"}
                            stroke={shellIdx === valenceShellIdx ? "#0891b2" : "#64748b"}
                            strokeWidth="0.5"
                            className="shadow"
                          />
                          {/* Small minus sign */}
                          <line
                            x1={ex - 2}
                            y1={ey}
                            x2={ex + 2}
                            y2={ey}
                            stroke={shellIdx === valenceShellIdx ? "white" : "#e2e8f0"}
                            strokeWidth="0.75"
                          />
                        </g>
                      );
                    });
                  })}

                  {/* SVG Spherical Gradients definitions */}
                  <defs>
                    <radialGradient id="protonGrad" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#fca5a5" />
                      <stop offset="60%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#991b1b" />
                    </radialGradient>
                    <radialGradient id="neutronGrad" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#e2e8f0" />
                      <stop offset="60%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#475569" />
                    </radialGradient>
                    <radialGradient id="electronGrad" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#a5f3fc" />
                      <stop offset="60%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#0891b2" />
                    </radialGradient>
                    <radialGradient id="kernelElectronGrad" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#cbd5e1" />
                      <stop offset="60%" stopColor="#64748b" />
                      <stop offset="100%" stopColor="#475569" />
                    </radialGradient>
                  </defs>

                  {/* Floating charge badge: only shown for non-zero charge */}
                  {netCharge !== 0 && (
                    <g>
                      <rect
                        x="130"
                        y="-195"
                        width="65"
                        height="30"
                        rx="15"
                        fill={netCharge > 0 ? "#fef2f2" : "#ecfeff"}
                        stroke={netCharge > 0 ? "#fca5a5" : "#a5f3fc"}
                        strokeWidth="1.5"
                      />
                      <text
                        x="162.5"
                        y="-176"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-[14px] font-black"
                        fill={netCharge > 0 ? "#dc2626" : "#0891b2"}
                      >
                        {netCharge > 0 ? `+${netCharge}` : `${Math.abs(netCharge)}−`}
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Valence / Kernel electron legend */}
              {electrons > 2 && (
                <div className="flex items-center justify-center gap-6 mt-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 border border-cyan-500"></div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Valence e⁻</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-slate-500 to-slate-400 border border-slate-400"></div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Kernel e⁻</span>
                  </div>
                </div>
              )}

              {/* Subtext info panel */}
              {protons > 0 && (
                <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                  Nucleus contains {protons} Proton{protons !== 1 && 's'} & {neutrons} Neutron{neutrons !== 1 && 's'}. Isotope: {activeElement?.name}-{massNumber}
                  {isUnstable && <span className="block text-rose-500 dark:text-rose-400 font-bold mt-1">⚠️ {stabilityInfo.reason}</span>}
                </div>
              )}
            </div>

            {/* Subatomic Particle Inventory Bins */}
            <div className="bg-white dark:bg-[#1A1D26] border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-405 dark:text-slate-500 mb-5">Subatomic Particle Inventory</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_1fr] gap-4 md:gap-6 items-start">
                
                {/* Nucleons sub-header (spans proton + neutron columns) */}
                <div className="hidden md:block col-span-2 text-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-dashed border-slate-200 dark:border-slate-750 pb-1 px-4">
                    Nucleons
                  </span>
                </div>
                {/* Spacer for divider column */}
                <div className="hidden md:block"></div>
                {/* Electrons sub-header */}
                <div className="hidden md:block text-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-dashed border-slate-200 dark:border-slate-750 pb-1 px-4">
                    Electrons
                  </span>
                </div>

                {/* Mobile-only sub-header for nucleons */}
                <div className="md:hidden text-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">[ Nucleons ]</span>
                </div>

                {/* Proton Bin */}
                <div className="flex flex-col items-center p-4 bg-red-50/40 dark:bg-red-950/10 border border-red-100 dark:border-red-950/40 rounded-2xl">
                  <div className="w-12 h-12 rounded-full fill-red-500 flex items-center justify-center text-white font-black text-xl shadow mb-2 bg-gradient-to-tr from-red-600 to-red-400">
                    +
                  </div>
                  <span className="text-xs font-black text-red-650 dark:text-red-400 uppercase tracking-widest">Protons</span>
                  <span className="text-[10px] text-slate-405 dark:text-slate-500 font-bold mb-3">(Positives, Z)</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setProtons(p => Math.max(p - 1, 0))}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-white dark:hover:bg-slate-900 transition-all active:scale-90"
                      title="Remove Proton"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-black text-slate-700 dark:text-slate-300 w-6 text-center">{protons}</span>
                    <button
                      onClick={() => setProtons(p => Math.min(p + 1, 18))}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-white dark:hover:bg-slate-900 transition-all active:scale-90"
                      title="Add Proton"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Neutron Bin */}
                <div className="flex flex-col items-center p-4 bg-slate-50/40 dark:bg-slate-900/20 border border-slate-150 dark:border-slate-800 rounded-2xl">
                  <div className="w-12 h-12 rounded-full fill-slate-400 flex items-center justify-center text-white font-black text-xl shadow mb-2 bg-gradient-to-tr from-slate-500 to-slate-400">
                    0
                  </div>
                  <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Neutrons</span>
                  <span className="text-[10px] text-slate-405 dark:text-slate-500 font-bold mb-3">(Neutral, N)</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setNeutrons(n => Math.max(n - 1, 0))}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-750 text-slate-650 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 transition-all active:scale-90"
                      title="Remove Neutron"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-black text-slate-700 dark:text-slate-300 w-6 text-center">{neutrons}</span>
                    <button
                      onClick={() => setNeutrons(n => Math.min(n + 1, 24))}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-750 text-slate-650 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 transition-all active:scale-90"
                      title="Add Neutron"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Vertical dotted divider (desktop only) */}
                <div className="hidden md:flex items-center justify-center h-full">
                  <div className="w-px h-28 border-l border-dashed border-slate-200 dark:border-slate-750"></div>
                </div>

                {/* Mobile-only sub-header for electrons */}
                <div className="md:hidden text-center mt-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">[ Electrons ]</span>
                </div>

                {/* Electron Bin */}
                <div className="flex flex-col items-center p-4 bg-cyan-50/40 dark:bg-cyan-950/10 border border-cyan-150 dark:border-cyan-950/40 rounded-2xl">
                  <div className="w-12 h-12 rounded-full fill-cyan-500 flex items-center justify-center text-white font-black text-xl shadow mb-2 bg-gradient-to-tr from-cyan-600 to-cyan-400">
                    -
                  </div>
                  <span className="text-xs font-black text-cyan-650 dark:text-cyan-400 uppercase tracking-widest">Electrons</span>
                  <span className="text-[10px] text-slate-405 dark:text-slate-500 font-bold mb-3">(Negative, e)</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setElectrons(e => Math.max(e - 1, 0))}
                      className="p-1.5 rounded-lg border border-cyan-200 dark:border-cyan-900/40 text-cyan-600 dark:text-cyan-400 hover:bg-white dark:hover:bg-slate-900 transition-all active:scale-90"
                      title="Remove Electron"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-black text-slate-700 dark:text-slate-300 w-6 text-center">{electrons}</span>
                    <button
                      onClick={() => setElectrons(e => Math.min(e + 1, 18))}
                      className="p-1.5 rounded-lg border border-cyan-200 dark:border-cyan-900/40 text-cyan-600 dark:text-cyan-400 hover:bg-white dark:hover:bg-slate-900 transition-all active:scale-90"
                      title="Add Electron"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Live Indicators & Scales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Mass Number Meter */}
              <div className="bg-white dark:bg-[#1A1D26] border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Mass Number Instrument</span>
                  <span className="text-sm font-black text-violet-600 dark:text-violet-400 px-3 py-1 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900/50">
                    A = {massNumber}
                  </span>
                </div>
                
                {/* Pointer Gauge */}
                <div className="relative pt-6 pb-2">
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-full overflow-hidden flex">
                    <div className="h-full bg-red-500" style={{ width: `${Math.min((protons / 40) * 100, 100)}%` }}></div>
                    <div className="h-full bg-slate-400" style={{ width: `${Math.min((neutrons / 40) * 100, 100)}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest px-1">
                    <span>0</span>
                    <span>20 (Neon)</span>
                    <span>40 (Argon)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center mt-2.5">
                    Total protons ({protons}) + neutrons ({neutrons}) count toward atomic mass.
                  </p>
                </div>
              </div>

              {/* Net Charge Scale */}
              <div className="bg-white dark:bg-[#1A1D26] border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Net Charge / Ionic Charge</span>
                  <span className={`text-sm font-black px-3 py-1 rounded-xl border ${
                    netCharge === 0
                      ? 'bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border-slate-200 dark:border-slate-700'
                      : netCharge > 0
                      ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50'
                      : 'bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/50'
                  }`}>
                    {netCharge > 0 ? `+${netCharge}` : netCharge} ({getChargeLabel(netCharge)})
                  </span>
                </div>

                {/* Sliding scale pointer */}
                <div className="relative pt-6 pb-2">
                  <div className="h-2 w-full bg-gradient-to-r from-cyan-500 via-slate-200 to-red-500 dark:via-slate-800 rounded-full relative">
                    {/* Sliding pin */}
                    <div
                      className="absolute -top-1.5 w-5 h-5 bg-white border-2 border-slate-650 dark:border-slate-300 rounded-full shadow transition-all duration-300 flex items-center justify-center -ml-2.5 cursor-pointer"
                      style={{ left: `${Math.min(100, Math.max(0, ((netCharge + 5) / 10) * 100))}%` }}
                    >
                      <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest px-1">
                    <span>-5 (Anion)</span>
                    <span>0 (Neutral)</span>
                    <span>+5 (Cation)</span>
                  </div>
                </div>
              </div>

              {/* Atomic Number (Z) Instrument */}
              <div className="bg-white dark:bg-[#1A1D26] border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Atomic Number</span>
                  <span className={`text-sm font-black px-3 py-1 rounded-xl border ${
                    protons > 0
                      ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                  }`}>
                    Z = {protons}
                  </span>
                </div>
                <div className="relative pt-6 pb-2">
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.min((protons / 18) * 100, 100)}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest px-1">
                    <span>0</span>
                    <span>9 (F)</span>
                    <span>18 (Ar)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center mt-2.5">
                    Atomic number = proton count ({protons}). Defines element identity.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Active Element Info Card */}
            <div className="bg-white dark:bg-[#1A1D26] border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">Active Element Card</span>
              
              {activeElement ? (
                <div className="space-y-4">
                  {/* Element graphic slot: click for full periodic-table details */}
                  <button
                    type="button"
                    onClick={() => periodicElement && setShowElementDetail(true)}
                    disabled={!periodicElement}
                    className="w-full flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl text-left transition-all hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:cursor-default"
                    title="View full element details"
                  >
                    <div className="w-16 h-16 bg-violet-600 text-white rounded-2xl flex flex-col items-center justify-center shadow font-rounded select-none shrink-0">
                      <span className="text-xs font-black self-start pl-2 leading-none">{activeElement.z}</span>
                      <span className="text-2xl font-black leading-none -mt-1">{activeElement.symbol}</span>
                      <span className="text-[8px] font-bold leading-none mt-1">{activeElement.mass.toFixed(3)}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg font-black font-rounded">{activeElement.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{activeElement.category}</p>
                      <p className="text-[10px] text-violet-600 dark:text-violet-400 font-black uppercase tracking-wider mt-1.5 flex items-center gap-1">
                        <Info className="w-3 h-3" /> Tap for full details
                      </p>
                    </div>
                  </button>

                  {/* Fact sheet stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2.5 rounded-xl">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Valence e-</span>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                        {shellAllocations[2] > 0 ? shellAllocations[2] : shellAllocations[1] > 0 ? shellAllocations[1] : shellAllocations[0]}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2.5 rounded-xl">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Kernel e⁻</span>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                        {electrons > 2 ? electrons - (shellAllocations[2] > 0 ? shellAllocations[2] : shellAllocations[1] > 0 ? shellAllocations[1] : shellAllocations[0]) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
                  Add protons in the inventory to discover elements here!
                </div>
              )}
            </div>

            {/* Miniature Periodic Table Highlights */}
            <div className="bg-white dark:bg-[#1A1D26] border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Mini Periodic Table</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Click to build</span>
              </div>

              {/* Layout grid representing Rows 1 to 3 of Periodic Table (H to Ar) */}
              <div className="space-y-1">
                {/* Row 1: Z=1 (H) and Z=2 (He) */}
                <div className="grid grid-cols-8 gap-1">
                  <button
                    onClick={() => handleAutocomplete(1)}
                    className={`aspect-square rounded-lg text-xs font-black border transition-all flex items-center justify-center flex-col relative ${
                      protons === 1
                        ? 'bg-violet-600 border-violet-600 text-white shadow font-black scale-105 z-10'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-150 dark:border-slate-800 hover:bg-slate-100 text-slate-650 dark:text-slate-400'
                    }`}
                    title="Hydrogen"
                  >
                    <span className="text-[8px] absolute top-0.5 left-1 font-bold">1</span>
                    <span className="leading-none mt-1">H</span>
                  </button>

                  {/* Empty gap of 6 cols */}
                  <div className="col-span-6"></div>

                  <button
                    onClick={() => handleAutocomplete(2)}
                    className={`aspect-square rounded-lg text-xs font-black border transition-all flex items-center justify-center flex-col relative ${
                      protons === 2
                        ? 'bg-violet-600 border-violet-600 text-white shadow font-black scale-105 z-10'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-150 dark:border-slate-800 hover:bg-slate-100 text-slate-650 dark:text-slate-400'
                    }`}
                    title="Helium"
                  >
                    <span className="text-[8px] absolute top-0.5 left-1 font-bold">2</span>
                    <span className="leading-none mt-1">He</span>
                  </button>
                </div>

                {/* Row 2: Z=3 to 10 */}
                <div className="grid grid-cols-8 gap-1">
                  {[3, 4, 5, 6, 7, 8, 9, 10].map(z => {
                    const el = SANDBOX_ELEMENTS[z];
                    return (
                      <button
                        key={z}
                        onClick={() => handleAutocomplete(z)}
                        className={`aspect-square rounded-lg text-xs font-black border transition-all flex items-center justify-center flex-col relative ${
                          protons === z
                            ? 'bg-violet-600 border-violet-600 text-white shadow font-black scale-105 z-10'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-150 dark:border-slate-800 hover:bg-slate-100 text-slate-650 dark:text-slate-400'
                        }`}
                        title={el?.name}
                      >
                        <span className="text-[8px] absolute top-0.5 left-0.5 font-bold">{z}</span>
                        <span className="leading-none mt-1">{el?.symbol}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Row 3: Z=11 to 18 */}
                <div className="grid grid-cols-8 gap-1">
                  {[11, 12, 13, 14, 15, 16, 17, 18].map(z => {
                    const el = SANDBOX_ELEMENTS[z];
                    return (
                      <button
                        key={z}
                        onClick={() => handleAutocomplete(z)}
                        className={`aspect-square rounded-lg text-xs font-black border transition-all flex items-center justify-center flex-col relative ${
                          protons === z
                            ? 'bg-violet-600 border-violet-600 text-white shadow font-black scale-105 z-10'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-150 dark:border-slate-800 hover:bg-slate-100 text-slate-650 dark:text-slate-400'
                        }`}
                        title={el?.name}
                      >
                        <span className="text-[8px] absolute top-0.5 left-0.5 font-bold">{z}</span>
                        <span className="leading-none mt-1">{el?.symbol}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Gamified Challenge Deck */}
            <ChallengeDeck
              title="Atomic Synthesis Challenges"
              challenges={ATOM_CHALLENGES}
              currentIndex={activeChallengeIdx}
              onSelectIndex={idx => {
                setActiveChallengeIdx(idx);
              }}
              onVerify={() => {
                const cur = ATOM_CHALLENGES[activeChallengeIdx];
                if (protons === cur.targetP && neutrons === cur.targetN && electrons === cur.targetE) {
                  return {
                    success: true,
                    message: `You built ${cur.title} with the right numbers of protons, neutrons, and electrons.`
                  };
                }
                return {
                  success: false,
                  message: `Current atom: ${protons}p, ${neutrons}n, ${electrons}e. Objective: ${cur.targetP}p, ${cur.targetN}n, ${cur.targetE}e.`
                };
              }}
              onApplySolution={() => {
                const cur = ATOM_CHALLENGES[activeChallengeIdx];
                setProtons(cur.targetP);
                setNeutrons(cur.targetN);
                setElectrons(cur.targetE);
              }}
              solutionUnlockAfter={2}
              accentGradient="from-amber-500 to-orange-600"
            />

            {/* Reusable Socratic Mascot Panel */}
            <SocraticMascotPanel
              tips={SOCRATIC_TIPS}
              title="Chemistry Bohr Advisor"
              mood="thinking"
            />

          </div>

        </div>

      </div>

      {/* Periodic-table-style element detail popup */}
      {showElementDetail && periodicElement && (
        <ElementDetailModal element={periodicElement} massNumber={massNumber} onClose={() => setShowElementDetail(false)} />
      )}
    </div>
  );
};

export default BuildAnAtom;
