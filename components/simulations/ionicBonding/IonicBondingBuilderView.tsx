/**
 * Ionic Bonding Builder View
 * The main interactive container for the ionic compound builder.
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { CourseType } from '../../../types';
import AboutPanel from '../shared/AboutPanel';
import { SocraticMascotPanel } from '../shared/SocraticMascotPanel';
import { IONIC_ABOUT } from './ionicAbout';
import {
  IonicAtom,
  createBuilderAtom,
  createPreIonizedAtom,
  createPolyatomicBuilderAtom,
  transferElectron,
  validateBuilderCompound,
  calculateLatticePositions
} from './ionicBuilderEngine';
import LewisIon from './LewisIon';
import LewisTransferDiagram from './LewisTransferDiagram';
import BohrModelDiagram from './BohrModelDiagram';
import BracketNotationView from './BracketNotationView';
import CrystalLattice from './CrystalLattice';
import { METALS, NONMETALS, POLYATOMIC_IONS } from './ionicDatabase';
import ChallengeDeck, { ChallengeDef } from '../shared/ChallengeDeck';
import { Trophy } from 'lucide-react';
import type { IonicCompound } from './ionEngine';

type CompoundMode = 'binary' | 'ternary';

interface IonicBondingBuilderViewProps {
  course: CourseType;
  onBack: () => void;
}

const CANVAS_W = 700;
const CANVAS_H = 450;
const CX = CANVAS_W / 2;
const CY = CANVAS_H / 2;

interface IonicChallengeDef extends ChallengeDef {
  targetFormula: string;
  targetName: string;
  mode: CompoundMode;
  initialMetals: { sym: string; count: number };
  initialNonmetals: { sym: string; count: number; isPoly?: boolean };
}

const IONIC_CHALLENGES: IonicChallengeDef[] = [
  {
    id: 'ion-1',
    title: '1. Synthesize Sodium Chloride (NaCl)',
    description: 'Build neutral sodium chloride (NaCl) by transferring one electron from a sodium atom to a chlorine atom so both achieve full octets.',
    hints: [
      'How many valence electrons does sodium start with compared to chlorine?',
      'Sodium (Group 1) has 1 valence electron and readily gives it to chlorine (Group 17, with 7 valence electrons), creating Na⁺ and Cl⁻.',
      'Select sodium, then chlorine, and transfer 1 electron to balance the charges.',
    ],
    targetFormula: 'NaCl',
    targetName: 'Sodium Chloride',
    mode: 'binary',
    initialMetals: { sym: 'Na', count: 1 },
    initialNonmetals: { sym: 'Cl', count: 1 }
  },
  {
    id: 'ion-2',
    title: '2. Synthesize Magnesium Oxide (MgO)',
    description: 'Build neutral magnesium oxide (MgO) by transferring two valence electrons from magnesium to oxygen to balance the +2 and -2 charges.',
    hints: [
      'How many electrons does an alkaline earth metal like magnesium need to shed to reach a stable noble gas core?',
      'Magnesium loses 2 valence electrons (forming Mg²⁺), while oxygen accepts both electrons to complete its valence octet (forming O²⁻).',
      'Select magnesium, then oxygen, and transfer 2 electrons to form the 1:1 ionic pair.',
    ],
    targetFormula: 'MgO',
    targetName: 'Magnesium Oxide',
    mode: 'binary',
    initialMetals: { sym: 'Mg', count: 1 },
    initialNonmetals: { sym: 'O', count: 1 }
  },
  {
    id: 'ion-3',
    title: '3. Synthesize Calcium Chloride (CaCl₂)',
    description: 'Build neutral calcium chloride (CaCl₂), balancing calcium\'s +2 charge with two chloride ions.',
    hints: [
      'Calcium donates two electrons, but can a single chlorine atom take both of them?',
      'Each chlorine halogen can only accept 1 electron into its valence shell, so 1 Ca²⁺ cation needs 2 Cl⁻ anions.',
      'Transfer 1 electron from calcium to each of the two chlorine atoms.',
    ],
    targetFormula: 'CaCl₂',
    targetName: 'Calcium Chloride',
    mode: 'binary',
    initialMetals: { sym: 'Ca', count: 1 },
    initialNonmetals: { sym: 'Cl', count: 2 }
  },
  {
    id: 'ion-4',
    title: '4. Synthesize Sodium Oxide (Na₂O)',
    description: 'Build neutral sodium oxide (Na₂O), using two sodium atoms to provide the two electrons oxygen needs to form an oxide ion.',
    hints: [
      'How many electrons does oxygen need to complete its octet, and how many can one sodium atom give?',
      'Oxygen needs 2 electrons to form O²⁻, so two separate sodium atoms (Na⁺ each) must supply one electron each.',
      'Transfer 1 electron from each sodium atom to the single oxygen atom.',
    ],
    targetFormula: 'Na₂O',
    targetName: 'Sodium Oxide',
    mode: 'binary',
    initialMetals: { sym: 'Na', count: 2 },
    initialNonmetals: { sym: 'O', count: 1 }
  },
  {
    id: 'ion-5',
    title: '5. Synthesize Aluminum Oxide (Al₂O₃)',
    description: 'Build neutral aluminum oxide (Al₂O₃), finding the lowest common ratio of +3 aluminum cations to -2 oxide anions.',
    hints: [
      'What is the least common multiple of a +3 charge and a -2 charge?',
      'Two Al³⁺ ions supply a +6 charge, which balances three O²⁻ ions carrying a -6 charge.',
      'Transfer 3 electrons from each of the two aluminum atoms across the three oxygen atoms until every shell is satisfied.',
    ],
    targetFormula: 'Al₂O₃',
    targetName: 'Aluminum Oxide',
    mode: 'binary',
    initialMetals: { sym: 'Al', count: 2 },
    initialNonmetals: { sym: 'O', count: 3 }
  },
  {
    id: 'ion-6',
    title: '6. Synthesize Potassium Nitrate (KNO₃)',
    description: 'Build neutral potassium nitrate (KNO₃) by pairing a potassium cation with a polyatomic nitrate anion.',
    hints: [
      'What charge does the polyatomic nitrate ion (NO₃⁻) carry, and what charge does a potassium ion form?',
      'Potassium forms a +1 cation (K⁺) and nitrate carries a -1 charge, so they attract in a simple 1:1 ratio.',
      'In Ternary mode, combine 1 K⁺ cation with 1 NO₃⁻ polyatomic anion to form neutral KNO₃.',
    ],
    targetFormula: 'KNO₃',
    targetName: 'Potassium Nitrate',
    mode: 'ternary',
    initialMetals: { sym: 'K', count: 1 },
    initialNonmetals: { sym: 'NO3', count: 1, isPoly: true }
  }
];

const IONIC_SOCRATIC_TIPS = [
  "Why do metals (like Sodium) want to LOSE electrons, while nonmetals (like Chlorine) want to GAIN them? Think about electronegativity and ionization energy.",
  "Once Sodium loses an electron, it becomes a Na⁺ cation. Why does its radius shrink compared to its neutral atomic state?",
  "What keeps the ions together in NaCl? Is it a shared physical bond, or purely the electrostatic attraction between opposite charges?",
  "Ternary compounds contain polyatomic ions (like Sulfate, SO₄²⁻). Why are these groups of atoms held together by covalent bonds internally, yet form ionic bonds externally?",
  "Why do ionic compounds form regular, repeating crystal lattices rather than isolated pairs of Na-Cl molecules in the solid state?",
  "Why does NaCl conduct electricity when dissolved in water, but not when it is in its solid crystal state? What must ions be able to do to conduct current?"
];

const IonicBondingBuilderView: React.FC<IonicBondingBuilderViewProps> = ({ onBack }) => {
  const [mode, setMode] = useState<CompoundMode>('binary');
  const [atoms, setAtoms] = useState<IonicAtom[]>([]);
  const [selectedAtoms, setSelectedAtoms] = useState<string[]>([]); // [sourceId, targetId]
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [toast, setToast] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [vizTab, setVizTab] = useState<'builder' | 'lewis' | 'bracket' | 'bohr' | 'lattice'>('builder');
  const [challengeMode, setChallengeMode] = useState<boolean>(false);
  const [challengeIdx, setChallengeIdx] = useState<number>(0);

  const handleModeChange = (newMode: CompoundMode) => {
    setMode(newMode);
    setAtoms([]);
    setSelectedAtoms([]);
  };

  const showToast = useCallback((text: string, type: 'info' | 'success' | 'error') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleApplyChallenge = (idx: number = challengeIdx) => {
    const cur = IONIC_CHALLENGES[idx];
    setMode(cur.mode);
    setSelectedAtoms([]);

    const newAtoms: IonicAtom[] = [];
    for (let i = 0; i < cur.initialMetals.count; i++) {
      const yBase = 80 + i * 100;
      const at = cur.mode === 'ternary'
        ? createPreIonizedAtom(cur.initialMetals.sym, { x: 100, y: yBase })
        : createBuilderAtom(cur.initialMetals.sym, { x: 100, y: yBase });
      newAtoms.push(at);
    }
    for (let i = 0; i < cur.initialNonmetals.count; i++) {
      const yBase = 80 + i * 100;
      if (cur.initialNonmetals.isPoly) {
        newAtoms.push(createPolyatomicBuilderAtom(cur.initialNonmetals.sym, { x: 600, y: yBase }));
      } else {
        const at = cur.mode === 'ternary'
          ? createPreIonizedAtom(cur.initialNonmetals.sym, { x: 600, y: yBase })
          : createBuilderAtom(cur.initialNonmetals.sym, { x: 600, y: yBase });
        newAtoms.push(at);
      }
    }
    setAtoms(newAtoms);
    showToast(`Loaded scenario: ${cur.title}`, 'info');
  };

  const handleApplySolution = (idx: number = challengeIdx) => {
    const cur = IONIC_CHALLENGES[idx];
    setMode(cur.mode);
    setSelectedAtoms([]);

    const newAtoms: IonicAtom[] = [];
    for (let i = 0; i < cur.initialMetals.count; i++) {
      const yBase = 80 + i * 100;
      newAtoms.push(createPreIonizedAtom(cur.initialMetals.sym, { x: 100, y: yBase }));
    }
    for (let i = 0; i < cur.initialNonmetals.count; i++) {
      const yBase = 80 + i * 100;
      if (cur.initialNonmetals.isPoly) {
        newAtoms.push(createPolyatomicBuilderAtom(cur.initialNonmetals.sym, { x: 600, y: yBase }));
      } else {
        newAtoms.push(createPreIonizedAtom(cur.initialNonmetals.sym, { x: 600, y: yBase }));
      }
    }
    setAtoms(newAtoms);
    showToast(`Loaded solution: ${cur.title}`, 'info');
  };

  const normalizeFormula = (f: string) => {
    return f.replace(/[\u2080-\u2089]/g, c => (c.charCodeAt(0) - 0x2080).toString()).toLowerCase().trim();
  };

  const handleVerifyChallenge = () => {
    const cur = IONIC_CHALLENGES[challengeIdx];
    if (!validation.isBalanced) {
      const catCharge = atoms.filter(a => a.type === 'cation').reduce((s, a) => s + Math.abs(a.charge), 0);
      const anCharge = atoms.filter(a => a.type === 'anion').reduce((s, a) => s + Math.abs(a.charge), 0);
      return {
        success: false,
        message: `This compound isn't balanced yet: total positive charge (+${catCharge}) must cancel total negative charge (-${anCharge}). Transfer the remaining electrons or balance your ion count.`
      };
    }
    const currentNorm = normalizeFormula(validation.formula || '');
    const targetNorm = normalizeFormula(cur.targetFormula);
    if (currentNorm === targetNorm) {
      return {
        success: true,
        message: `You built neutral ${cur.targetName} (${cur.targetFormula}) with zero net charge and full octet stability.`
      };
    }
    return {
      success: false,
      message: `The charges balance, but the resulting formula is ${validation.formula} rather than target ${cur.targetFormula} (${cur.targetName}).`
    };
  };

  // Update lattice positions whenever atoms list changes
  useEffect(() => {
    const positionedAtoms = calculateLatticePositions(atoms, CX, CY);
    // Only update if target positions are actually different to avoid loops
    const hasChanges = positionedAtoms.some((pa: IonicAtom, i: number) => {
      const a = atoms[i];
      return pa.targetPosition?.x !== a.targetPosition?.x || pa.targetPosition?.y !== a.targetPosition?.y;
    });

    if (hasChanges) {
      setAtoms(positionedAtoms);
    }
  }, [atoms]);

  // Smoothly move atoms toward their target positions
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setAtoms(prevAtoms => {
        let moved = false;
        const nextAtoms = prevAtoms.map(atom => {
          if (!atom.targetPosition) return atom;
          
          const dx = atom.targetPosition.x - atom.position.x;
          const dy = atom.targetPosition.y - atom.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 1) {
            return { ...atom, position: atom.targetPosition };
          }
          
          moved = true;
          const speed = 0.1; // Smooth interpolation
          return {
            ...atom,
            position: {
              x: atom.position.x + dx * speed,
              y: atom.position.y + dy * speed
            }
          };
        });
        
        if (!moved) clearInterval(moveInterval);
        return nextAtoms;
      });
    }, 16);

    return () => clearInterval(moveInterval);
  }, [atoms]);

  const handleAddAtom = (element: string, oxidationState?: number) => {
    const isMetal = !!METALS[element];
    const typeAtoms = atoms.filter(a => (isMetal ? a.type === 'cation' : a.type === 'anion'));

    const xBase = isMetal ? 100 : 600;
    const yBase = 80 + (typeAtoms.length * 100);

    if (yBase > CANVAS_H - 100) {
      showToast("Too many atoms", 'error');
      return;
    }

    const newAtom = mode === 'ternary'
      ? createPreIonizedAtom(element, { x: xBase, y: yBase }, oxidationState)
      : createBuilderAtom(element, { x: xBase, y: yBase }, oxidationState);
    setAtoms([...atoms, newAtom]);
    showToast(`Added ${element}`, 'info');
  };

  const handleAddPolyatomic = (polyId: string) => {
    const info = POLYATOMIC_IONS[polyId];
    const isCation = info.charge > 0;
    const typeAtoms = atoms.filter(a => (isCation ? a.type === 'cation' : a.type === 'anion'));

    const xBase = isCation ? 100 : 600;
    const yBase = 80 + (typeAtoms.length * 100);

    if (yBase > CANVAS_H - 100) {
      showToast("Too many ions", 'error');
      return;
    }

    const newAtom = createPolyatomicBuilderAtom(polyId, { x: xBase, y: yBase });
    setAtoms([...atoms, newAtom]);
    showToast(`Added ${info.name}`, 'info');
  };

  const handleAtomClick = (id: string) => {
    if (isTransferring) return;
    if (selectedAtoms.includes(id)) {
      setSelectedAtoms(selectedAtoms.filter(aid => aid !== id));
      return;
    }
    const atom = atoms.find(a => a.id === id);
    if (selectedAtoms.length === 0) {
      // First selection must be a monoatomic cation (polyatomic cations can't donate)
      if (atom?.type !== 'cation' || atom.polyatomicId) {
        if (atom?.polyatomicId && atom.type === 'cation') {
          showToast(`${POLYATOMIC_IONS[atom.polyatomicId].name} can't donate electrons`, 'info');
        } else if (atom?.polyatomicId) {
          showToast(`Select a metal first, then click ${POLYATOMIC_IONS[atom.polyatomicId].name} to transfer`, 'info');
        } else {
          showToast("Select a metal atom first", 'info');
        }
        return;
      }
      setSelectedAtoms([id]);
    } else {
      // Second selection must be an anion (mono or polyatomic both OK)
      if (atom?.type !== 'anion') {
        showToast("Select a nonmetal or polyatomic anion", 'info');
        setSelectedAtoms([]);
        return;
      }
      setSelectedAtoms([...selectedAtoms, id]);
    }
  };

  // Helper to get slot positions (same logic as LewisIon)
  const getElectronSlotPos = (atomPos: {x: number, y: number}, index: number) => {
    const radius = 40;
    const spacing = 10;
    const dist = radius + 8;
    const angles = [-Math.PI/2, -Math.PI/2, 0, 0, Math.PI/2, Math.PI/2, Math.PI, Math.PI];
    const offsets = [-spacing/2, spacing/2, -spacing/2, spacing/2, -spacing/2, spacing/2, -spacing/2, spacing/2];
    const angle = angles[index];
    const offset = offsets[index];
    const perpAngle = angle + Math.PI/2;
    return {
      x: atomPos.x + dist * Math.cos(angle) + offset * Math.cos(perpAngle),
      y: atomPos.y + dist * Math.sin(angle) + offset * Math.sin(perpAngle)
    };
  };

  const fillingOrder = [0, 2, 4, 6, 1, 3, 5, 7];

  const handleTransfer = async () => {
    if (selectedAtoms.length !== 2) return;
    
    const [sourceId, targetId] = selectedAtoms;
    const source = atoms.find(a => a.id === sourceId);
    const target = atoms.find(a => a.id === targetId);

    if (!source || !target) return;
    // For polyatomic targets, only check source still has electrons
    if (target.polyatomicId) {
      if (source.currentValence === 0) return;
    } else {
      if (source.currentValence === 0 || target.currentValence === 8) return;
    }

    setIsTransferring(true);
    setTransferProgress(0);

    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      setTransferProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const { from, to } = transferElectron(source, target);
        setAtoms(atoms.map(a => {
          if (a.id === sourceId) return from;
          if (a.id === targetId) return to;
          return a;
        }));
        setIsTransferring(false);
        setTransferProgress(0);
        setSelectedAtoms([]);
        showToast("Electron transferred", 'success');
      }
    };

    requestAnimationFrame(animate);
  };

  const handleClear = () => {
    setAtoms([]);
    setSelectedAtoms([]);
    showToast("Canvas cleared", 'info');
  };

  const validation = validateBuilderCompound(atoms);

  // Adapter: convert IonicAtom[] → IonicCompound shape for sub-view components
  const asIonicCompound: IonicCompound = {
    id: 'builder-compound',
    formula: validation.formula || '',
    isBalanced: validation.isBalanced,
    cations: atoms.filter(a => a.type === 'cation').map(a => ({
      id: a.id,
      element: a.polyatomicId ? undefined : a.element,
      polyatomicId: a.polyatomicId,
      charge: a.charge,
      count: 1,
      position: a.position,
      type: 'cation' as const,
      isIonized: a.isIonized,
    })),
    anions: atoms.filter(a => a.type === 'anion').map(a => ({
      id: a.id,
      element: a.polyatomicId ? undefined : a.element,
      polyatomicId: a.polyatomicId,
      charge: a.charge,
      count: 1,
      position: a.position,
      type: 'anion' as const,
      isIonized: a.isIonized,
    })),
  };

  const sourceAtom = atoms.find(a => a.id === selectedAtoms[0]);
  const targetAtom = atoms.find(a => a.id === selectedAtoms[1]);

  // Current electron positions for animation
  const animStart = sourceAtom ? getElectronSlotPos(sourceAtom.position, fillingOrder[sourceAtom.currentValence - 1]) : {x:0, y:0};
  const animEnd = targetAtom ? getElectronSlotPos(targetAtom.position, fillingOrder[targetAtom.currentValence]) : {x:0, y:0};

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4 bg-slate-800 border-b border-slate-700 shadow-xl">
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <button aria-label="Back" onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-black text-violet-400 uppercase tracking-wider">Ionic Bonding Builder</h1>
            <p className="text-xs text-slate-400">
              {mode === 'binary' ? 'Transfer valence electrons to achieve charge neutrality' : 'Balance ionic charges to form a neutral ternary compound'}
            </p>
          </div>
          {/* Mode Selector */}
          <div className="flex bg-slate-900/60 rounded-xl border border-slate-700 p-1 gap-1 ml-2">
            <button
              onClick={() => handleModeChange('binary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${mode === 'binary' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Binary
            </button>
            <button
              onClick={() => handleModeChange('ternary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${mode === 'ternary' ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Ternary
            </button>
          </div>

          {/* Challenge Toggle */}
          <div className="flex bg-slate-900/60 rounded-xl border border-slate-700 p-1 gap-1 ml-2">
            <button
              onClick={() => setChallengeMode(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${!challengeMode ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sandbox
            </button>
            <button
              onClick={() => {
                setChallengeMode(true);
                handleApplyChallenge(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all ${challengeMode ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Challenges
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowAbout(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
          aria-label="How to use this simulation"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01"/></svg>
          <span className="hidden sm:inline">How To Use</span>
        </button>

        {/* Compound Info Badge */}
        {atoms.length > 0 && (
          <div className="flex items-center gap-4 bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-700 shadow-lg">
            <div className={`text-3xl font-black ${validation.isBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
              {validation.formula || '...'}
            </div>
            {validation.name && (
              <>
                <div className="h-10 w-px bg-slate-700" />
                <div className="text-sm font-bold text-slate-300">
                  {validation.name}
                </div>
              </>
            )}
            {validation.isBalanced && (
              <div className="ml-auto bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider animate-pulse flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Balanced
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 p-3 md:p-6 overflow-x-hidden min-w-0">
        {/* Left: Element Selection */}
        <div className="w-full lg:w-72 space-y-4 overflow-y-auto max-h-64 lg:max-h-[calc(100vh-120px)] pr-1 flex-shrink-0">
          {/* Metals: always shown */}
          <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-sm">
            <h3 className="text-xs font-black text-amber-500 uppercase mb-3 tracking-widest">⊕ Metals (Cations)</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['Li', 'Na', 'K', 'Mg', 'Ca', 'Ba', 'Al', 'Zn', 'Ag'] as const).map(el => {
                const info = METALS[el];
                return (
                  <button
                    key={el}
                    onClick={() => handleAddAtom(el)}
                    className="aspect-square bg-slate-700/50 hover:bg-amber-500/20 border border-slate-600 hover:border-amber-500/50 rounded-xl flex flex-col items-center justify-center transition-all group"
                    title={info.name}
                  >
                    <span className="text-base font-black group-hover:scale-110 transition-transform">{el}</span>
                    <span className="text-[9px] opacity-50">{info.commonOxidationStates.map(s => `+${s}`).join('/')}</span>
                  </button>
                );
              })}
              {(['Fe', 'Cu', 'Pb'] as const).map(el => {
                const info = METALS[el];
                return info.commonOxidationStates.map(os => (
                  <button
                    key={`${el}-${os}`}
                    onClick={() => handleAddAtom(el, os)}
                    className="aspect-square bg-slate-700/50 hover:bg-amber-500/20 border border-slate-600 hover:border-amber-500/50 rounded-xl flex flex-col items-center justify-center transition-all group"
                    title={`${info.name} (${os}+)`}
                  >
                    <span className="text-base font-black group-hover:scale-110 transition-transform leading-none">
                      {el}<sup className="text-[9px] text-amber-400">{os}+</sup>
                    </span>
                    <span className="text-[9px] opacity-40">{info.name.slice(0, 4)}</span>
                  </button>
                ));
              })}
            </div>
          </div>

          {/* Nonmetals: binary mode only */}
          {mode === 'binary' && (
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-sm">
              <h3 className="text-xs font-black text-violet-400 uppercase mb-3 tracking-widest">⊖ Nonmetals (Anions)</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['F', 'Cl', 'Br', 'I', 'O', 'S', 'N', 'P'] as const).map(el => (
                  <button
                    key={el}
                    onClick={() => handleAddAtom(el)}
                    className="aspect-square bg-slate-700/50 hover:bg-violet-500/20 border border-slate-600 hover:border-violet-500/50 rounded-xl flex flex-col items-center justify-center transition-all group"
                    title={NONMETALS[el].name}
                  >
                    <span className="text-base font-black group-hover:scale-110 transition-transform">{el}</span>
                    <span className="text-[9px] opacity-50">{NONMETALS[el].commonOxidationStates[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Polyatomic Ions: ternary mode only */}
          {mode === 'ternary' && (
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-sm">
              <h3 className="text-xs font-black text-teal-400 uppercase mb-1 tracking-widest">Polyatomic Ions</h3>
              <p className="text-[9px] text-slate-500 mb-3">All ions load pre-charged: balance by adding partners</p>
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Anions</p>
                {(['OH', 'NO3', 'NO2', 'SO4', 'SO3', 'CO3', 'PO4', 'ClO3', 'ClO4', 'MnO4', 'C2H3O2', 'CN', 'SCN', 'CrO4', 'Cr2O7', 'S2O3', 'HCO3', 'HSO4', 'H2PO4', 'HPO4'] as const).map(polyId => {
                  const poly = POLYATOMIC_IONS[polyId];
                  if (!poly) return null;
                  return (
                    <button
                      key={polyId}
                      onClick={() => handleAddPolyatomic(polyId)}
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between bg-slate-700/30 border border-slate-600 hover:bg-teal-500/20 hover:border-teal-500/50"
                    >
                      <span className="text-teal-300 font-mono">{poly.formula}</span>
                      <span className="text-slate-400 text-[10px]">{poly.name}</span>
                    </button>
                  );
                })}
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mt-2 mb-1">Cations</p>
                {(['NH4'] as const).map(polyId => {
                  const poly = POLYATOMIC_IONS[polyId];
                  if (!poly) return null;
                  return (
                    <button
                      key={polyId}
                      onClick={() => handleAddPolyatomic(polyId)}
                      className="w-full px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between bg-slate-700/30 border border-slate-600 hover:bg-amber-500/20 hover:border-amber-500/50"
                    >
                      <span className="text-amber-300 font-mono">{poly.formula}</span>
                      <span className="text-slate-400 text-[10px]">{poly.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleClear}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 hover:border-red-500/50 rounded-2xl font-black text-sm transition-all transform hover:scale-105 active:scale-95"
          >
            Clear Canvas
          </button>

          {/* Quick Start Suggestions */}
          {atoms.length === 0 && mode === 'binary' && (
            <div className="bg-violet-900/20 border border-violet-500/30 rounded-2xl p-4">
              <h4 className="text-[10px] font-black text-violet-400 uppercase mb-2 tracking-wider">Quick Start</h4>
              <div className="space-y-1.5 text-xs text-slate-300">
                <button onClick={() => { handleAddAtom('Na'); handleAddAtom('Cl'); }} className="w-full text-left hover:bg-violet-500/10 p-2 rounded-lg transition-colors">
                  <span className="font-bold">NaCl</span>: Sodium Chloride
                </button>
                <button onClick={() => { handleAddAtom('Mg'); handleAddAtom('Cl'); handleAddAtom('Cl'); }} className="w-full text-left hover:bg-violet-500/10 p-2 rounded-lg transition-colors">
                  <span className="font-bold">MgCl₂</span>: Magnesium Chloride
                </button>
                <button onClick={() => { handleAddAtom('Ca'); handleAddAtom('O'); }} className="w-full text-left hover:bg-violet-500/10 p-2 rounded-lg transition-colors">
                  <span className="font-bold">CaO</span>: Calcium Oxide
                </button>
              </div>
            </div>
          )}
          {atoms.length === 0 && mode === 'ternary' && (
            <div className="bg-teal-900/20 border border-teal-500/30 rounded-2xl p-4">
              <h4 className="text-[10px] font-black text-teal-400 uppercase mb-2 tracking-wider">Quick Start</h4>
              <div className="space-y-1.5 text-xs text-slate-300">
                <button onClick={() => { handleAddPolyatomic('NH4'); handleAddPolyatomic('NO3'); }} className="w-full text-left hover:bg-teal-500/10 p-2 rounded-lg transition-colors">
                  <span className="font-bold">NH₄NO₃</span>: Ammonium Nitrate
                </button>
                <button onClick={() => { handleAddAtom('Ca'); handleAddPolyatomic('SO4'); }} className="w-full text-left hover:bg-teal-500/10 p-2 rounded-lg transition-colors">
                  <span className="font-bold">CaSO₄</span>: Calcium Sulfate
                </button>
                <button onClick={() => { handleAddAtom('Na'); handleAddPolyatomic('OH'); }} className="w-full text-left hover:bg-teal-500/10 p-2 rounded-lg transition-colors">
                  <span className="font-bold">NaOH</span>: Sodium Hydroxide
                </button>
                <button onClick={() => { handleAddAtom('Ca'); handleAddAtom('Ca'); handleAddAtom('Ca'); handleAddPolyatomic('PO4'); handleAddPolyatomic('PO4'); }} className="w-full text-left hover:bg-teal-500/10 p-2 rounded-lg transition-colors">
                  <span className="font-bold">Ca₃(PO₄)₂</span>: Calcium Phosphate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 flex flex-col gap-3 min-w-0 overflow-x-hidden">

          {/* Challenge Mode Deck */}
          {challengeMode && (
            <ChallengeDeck
              title="Ionic Synthesis Challenges"
              challenges={IONIC_CHALLENGES}
              currentIndex={challengeIdx}
              onSelectIndex={idx => {
                setChallengeIdx(idx);
                handleApplyChallenge(idx);
              }}
              onVerify={handleVerifyChallenge}
              onApplySolution={() => handleApplySolution(challengeIdx)}
              solutionUnlockAfter={2}
              accentGradient="from-amber-500 to-orange-600"
              className="mb-1"
            />
          )}

          {/* Visualization mode tabs: only enabled when compound is balanced */}
          <div className="flex gap-1 flex-wrap">
          {(['builder', 'lewis', 'bracket', 'bohr', 'lattice'] as const).map(tab => {
            const labels: Record<string, string> = { builder: 'Builder', lewis: 'Lewis Transfer', bracket: 'Bracket', bohr: 'Bohr Model', lattice: 'Crystal Lattice' };
            const disabled = tab !== 'builder' && !validation.isBalanced;
            return (
              <button
                key={tab}
                onClick={() => !disabled && setVizTab(tab)}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  vizTab === tab
                    ? 'bg-violet-600 text-white shadow'
                    : disabled
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
          {!validation.isBalanced && atoms.length > 0 && (
            <span className="text-[10px] text-slate-500 self-center ml-2">Balance the compound to unlock views</span>
          )}
        </div>

        <div className="flex-1 bg-slate-800 rounded-3xl md:rounded-[2.5rem] border border-slate-700 shadow-inner relative overflow-hidden min-h-[320px] w-full max-w-full">
          <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} className="w-full h-full max-w-full">
            <defs>
              <filter id="glow-violet" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Grid Pattern Background */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Atoms */}
            {atoms.map(atom => (
              <LewisIon
                key={atom.id}
                atom={atom}
                showBrackets={atom.charge !== 0}
                onSelect={handleAtomClick}
                isSelected={selectedAtoms.includes(atom.id)}
                isTransferringFrom={isTransferring && atom.id === selectedAtoms[0]}
              />
            ))}

            {/* Animated Electron Transfer */}
            {isTransferring && sourceAtom && targetAtom && (
              <circle
                cx={animStart.x + (animEnd.x - animStart.x) * transferProgress}
                cy={animStart.y + (animEnd.y - animStart.y) * transferProgress}
                r={3.5}
                fill={METALS[sourceAtom.element]?.color || '#fbbf24'}
                className="filter drop-shadow-lg"
              />
            )}
          </svg>

          {/* Canvas Overlay UI: binary mode only */}
          {mode === 'binary' && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
              {selectedAtoms.length === 2 && sourceAtom && targetAtom && !isTransferring && (
                <div className="bg-slate-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold border border-slate-600 shadow-lg">
                  {targetAtom.polyatomicId
                    ? `${sourceAtom.element} (${sourceAtom.currentValence}e⁻) → ${POLYATOMIC_IONS[targetAtom.polyatomicId].name}`
                    : `${sourceAtom.element} (${sourceAtom.currentValence}e⁻) → ${targetAtom.element} (${targetAtom.currentValence}e⁻)`
                  }
                </div>
              )}
              <button
                onClick={handleTransfer}
                disabled={selectedAtoms.length !== 2 || isTransferring}
                className={`px-8 py-4 rounded-full font-black text-lg shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 ${
                  selectedAtoms.length === 2 && !isTransferring
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 border-b-4 border-amber-700 hover:from-amber-300 hover:to-amber-400'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Transfer Electron
              </button>
            </div>
          )}

          {/* Toast */}
          {toast && (
            <div className={`absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl font-bold shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300 ${
              toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' :
              toast.type === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
              'bg-blue-500/20 text-blue-400 border-blue-500/50'
            }`}>
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'info' && 'ℹ'}
              {toast.text}
            </div>
          )}

          {/* Visualization sub-views (rendered on top of canvas when active) */}
          {vizTab !== 'builder' && validation.isBalanced && (
            <div className="absolute inset-0 bg-slate-900 overflow-auto p-4">
              {vizTab === 'lewis' && <LewisTransferDiagram compound={asIonicCompound} />}
              {vizTab === 'bracket' && (
                <BracketNotationView
                  cation={asIonicCompound.cations[0] ?? null}
                  anion={asIonicCompound.anions[0] ?? null}
                  isIonized={true}
                />
              )}
              {vizTab === 'bohr' && <BohrModelDiagram compound={asIonicCompound} />}
              {vizTab === 'lattice' && <CrystalLattice compound={asIonicCompound} />}
            </div>
          )}
        </div>
        </div>

        {/* Right: Analysis & Instructions */}
        <div className="w-80 space-y-4">
          <div className="bg-slate-800/80 p-6 rounded-[2rem] border border-slate-700 shadow-2xl">
            <h2 className="text-sm font-black text-slate-500 uppercase mb-4 tracking-widest">Compound Analysis</h2>
            
            {atoms.length === 0 ? (
              <div className="text-slate-500 text-sm flex flex-col items-center py-8 text-center italic">
                <span className="text-4xl mb-2 opacity-20">⚗️</span>
                Add atoms to start building your ionic compound.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 font-mono text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Cations:</span>
                    <span className="text-amber-400">⊕ {atoms.filter(a => a.type === 'cation').length}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Anions:</span>
                    <span className="text-violet-400">⊖ {atoms.filter(a => a.type === 'anion').length}</span>
                  </div>
                  <div className="h-px bg-slate-700 my-2" />
                  <div className="flex justify-between font-black mb-1">
                    <span className="text-slate-300">Net Charge:</span>
                    <span className={validation.totalCharge === 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {validation.totalCharge > 0 ? '+' : ''}{validation.totalCharge}
                    </span>
                  </div>
                  {mode === 'binary' && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ionized:</span>
                      <span className="text-slate-300">
                        {atoms.filter(a => a.isIonized).length}/{atoms.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Atom-by-atom status */}
                {atoms.length > 0 && (
                  <div className="bg-slate-900/30 p-3 rounded-2xl border border-slate-700 max-h-32 overflow-y-auto">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-wider">Ion Status</h4>
                    <div className="space-y-1 text-xs">
                      {atoms.map(a => {
                        const label = a.polyatomicId
                          ? a.element
                          : `${a.element}${a.charge !== 0 ? (a.charge > 0 ? `${a.charge}+` : `${Math.abs(a.charge)}-`) : ''}`;
                        return (
                          <div key={a.id} className="flex justify-between items-center">
                            <span className={a.type === 'cation' ? 'text-amber-300' : 'text-violet-300'}>
                              {label}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">
                              {mode === 'binary' ? `${a.currentValence}e⁻ ` : ''}{a.isIonized ? '✓' : '○'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!validation.isBalanced && atoms.length > 0 && (
                  <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                    <span className="font-black text-amber-400 block mb-1 uppercase tracking-tighter">Status: UNBALANCED</span>
                    {mode === 'ternary'
                      ? (validation.totalCharge > 0
                          ? "Net charge is positive: add more anions to balance."
                          : "Net charge is negative: add more cations to balance.")
                      : (validation.totalCharge > 0
                          ? "Add more nonmetals or transfer remaining metal electrons to balance the charge."
                          : validation.totalCharge < 0
                          ? "Add more metals or transfer more electrons to balance the negative charge."
                          : "All atoms must reach their stable electron configuration (0 or 8 valence electrons).")}
                  </div>
                )}

                {validation.isBalanced && (
                  <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
                    <span className="font-black text-emerald-400 block mb-1 uppercase tracking-tighter flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      PERFECTLY BALANCED
                    </span>
                    Lattice formation complete. The electrostatic forces maintain a regular crystal arrangement.
                  </div>
                )}
              </div>
            )}
          </div>

          <SocraticMascotPanel tips={IONIC_SOCRATIC_TIPS} title="Ionic Socratic Advisor" mood="thinking" />

          {mode === 'binary' ? (
            <div className="bg-violet-600/10 p-6 rounded-[2rem] border border-violet-500/30">
              <h3 className="text-xs font-black text-violet-400 uppercase mb-3 tracking-widest">How to Play</h3>
              <ul className="text-xs text-slate-300 space-y-3">
                <li className="flex gap-2">
                  <span className="bg-violet-500 text-white h-4 w-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">1</span>
                  Add a metal and a nonmetal atom.
                </li>
                <li className="flex gap-2">
                  <span className="bg-violet-500 text-white h-4 w-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">2</span>
                  Click a metal atom, then a nonmetal atom.
                </li>
                <li className="flex gap-2">
                  <span className="bg-violet-500 text-white h-4 w-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">3</span>
                  Click 'Transfer' to move one valence electron.
                </li>
                <li className="flex gap-2">
                  <span className="bg-violet-500 text-white h-4 w-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">4</span>
                  Repeat until all atoms have full octets and net charge is zero.
                </li>
              </ul>
            </div>
          ) : (
            <div className="bg-teal-600/10 p-6 rounded-[2rem] border border-teal-500/30">
              <h3 className="text-xs font-black text-teal-400 uppercase mb-3 tracking-widest">How to Play</h3>
              <ul className="text-xs text-slate-300 space-y-3">
                <li className="flex gap-2">
                  <span className="bg-teal-500 text-white h-4 w-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">1</span>
                  Add a metal cation and a polyatomic anion (or NH₄⁺ + anion).
                </li>
                <li className="flex gap-2">
                  <span className="bg-teal-500 text-white h-4 w-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">2</span>
                  All ions load pre-charged. Watch the net charge in the panel.
                </li>
                <li className="flex gap-2">
                  <span className="bg-teal-500 text-white h-4 w-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">3</span>
                  Add more ions until the net charge reaches zero.
                </li>
                <li className="flex gap-2">
                  <span className="bg-teal-500 text-white h-4 w-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">4</span>
                  The formula and name appear automatically when balanced.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <AboutPanel
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        content={IONIC_ABOUT}
        gradient="from-violet-600 to-indigo-700"
      />
    </div>
  );
};

export default IonicBondingBuilderView;
