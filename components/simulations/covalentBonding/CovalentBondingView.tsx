/**
 * Covalent Bonding Simulation: Overlapping Circles Rebuild
 * 
 * Architecture:
 * - Pure SVG canvas for all rendering (atoms, bonds, lone pairs)
 * - No dragging: atoms auto-position symmetrically when added
 * - Toolbar-first bond mode: pick bond type → click two atoms
 * - Overlapping circles style: shared electrons shown as dots (•) and crosses (×) in overlap region
 * - Lone pairs shown in cardinal (N/S/E/W) positions, 2-per-side
 */

import React, { useState, useRef, useCallback } from 'react';
import type { CourseType, Molecule } from '../../../types';
import AboutPanel from '../shared/AboutPanel';
import { SocraticMascotPanel } from '../shared/SocraticMascotPanel';
import ChallengeDeck, { ChallengeDef } from '../shared/ChallengeDeck';
import { Trophy } from 'lucide-react';
import { COVALENT_ABOUT } from './covalentAbout';
import {
  createAtom,
  createBond,
  removeAtom,
  breakBond,
  assignLonePairs,
  validateMolecule,
  calculateGeometry,
  calculatePolarity,
} from './moleculeEngine';
import {
  generateChemicalFormula,
  calculateMolarMass,
  calculateFormalCharge,
  formatFormulaWithSubscripts,
  identifyMolecule,
} from './formulaEngine';
import { ATOM_COLORS, VALENCE_ELECTRONS } from './moleculeDatabase';
import DotCrossDiagram from './DotCrossDiagram';
import { PRESET_MOLECULES, getPresetsByDifficulty } from './presetMolecules';
import { getCardinalElectronPlacement } from './cardinalSlots';

interface CovalentBondingViewProps {
  course: CourseType;
  onBack: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CANVAS_W = 500;
const CANVAS_H = 350;
const CX = CANVAS_W / 2;
const CY = CANVAS_H / 2;

// Atom radius in SVG units: sized for good overlap visibility
const ATOM_RADII: Record<string, number> = {
  H: 28,
  Be: 30,
  B: 32,
  C: 38,
  N: 35,
  O: 34,
  F: 30,
  Si: 40,
  S: 36,
  P: 34,
  Cl: 42,
  Br: 44,
  I: 46,
  Xe: 44,
  default: 36,
};

function getRadius(element: string) {
  return ATOM_RADII[element] ?? ATOM_RADII.default;
}

// Element palette: elements available for building molecules (ordered by atomic number)
const ELEMENT_PALETTE: { symbol: string; name: string }[] = [
  { symbol: 'H',  name: 'Hydrogen' },   // Z=1
  { symbol: 'Be', name: 'Beryllium' },  // Z=4
  { symbol: 'B',  name: 'Boron' },      // Z=5
  { symbol: 'C',  name: 'Carbon' },     // Z=6
  { symbol: 'N',  name: 'Nitrogen' },   // Z=7
  { symbol: 'O',  name: 'Oxygen' },     // Z=8
  { symbol: 'F',  name: 'Fluorine' },   // Z=9
  { symbol: 'Si', name: 'Silicon' },    // Z=14
  { symbol: 'P',  name: 'Phosphorus' }, // Z=15
  { symbol: 'S',  name: 'Sulfur' },     // Z=16
  { symbol: 'Cl', name: 'Chlorine' },   // Z=17
  { symbol: 'Br', name: 'Bromine' },    // Z=35
  { symbol: 'I',  name: 'Iodine' },     // Z=53
  { symbol: 'Xe', name: 'Xenon' },      // Z=54
];

// ── Auto-positioning ───────────────────────────────────────────────────────────
/**
 * Recalculates atom positions so that bonded atoms overlap their circles
 * and unconnected atoms sit in a ring around the center.
 * 
 * Strategy: If a molecule already has bonds, place atoms based on bond graph
 * using a BFS tree layout. Otherwise, place in regular polygon.
 */
function autoPositionAtoms(molecule: Molecule): Molecule {
  const n = molecule.atoms.length;
  if (n === 0) return molecule;

  // Build adjacency
  const adj: Map<string, string[]> = new Map();
  for (const atom of molecule.atoms) adj.set(atom.id, []);
  for (const bond of molecule.bonds) {
    adj.get(bond.atom1Id)!.push(bond.atom2Id);
    adj.get(bond.atom2Id)!.push(bond.atom1Id);
  }

  // Find the most connected atom as root (central atom)
  const central = molecule.atoms.reduce((max, a) =>
    (adj.get(a.id)?.length ?? 0) > (adj.get(max.id)?.length ?? 0) ? a : max
  );

  const positions: Map<string, { x: number; y: number }> = new Map();
  const visited = new Set<string>();

  // Check if there are unbonded atoms: if so, shift bonded molecule down
  const hasBonds = molecule.bonds.length > 0;
  const hasUnbonded = molecule.atoms.some(a => (adj.get(a.id)?.length ?? 0) === 0);
  const moleculeCY = (hasBonds && hasUnbonded) ? CY + 40 : CY;

  // Place root at center (shifted down if unbonded atoms in top row)
  positions.set(central.id, { x: CX, y: moleculeCY });
  visited.add(central.id);

  // BFS layout: place bonded atoms around their parent
  const queue: Array<{ id: string; parentId: string | null; angle: number }> = [
    { id: central.id, parentId: null, angle: 0 },
  ];

  while (queue.length > 0) {
    const { id, parentId, angle: parentAngle } = queue.shift()!;
    let neighbors = (adj.get(id) ?? []).filter(nb => !visited.has(nb));
    if (neighbors.length === 0) continue;

    const atom = molecule.atoms.find(a => a.id === id)!;
    const r1 = getRadius(atom.element);

    // Sort neighbors: most-bonded (chain atoms) first, then by element weight
    // This ensures C-C chains get priority placement directions
    if (parentId === null && neighbors.length > 1) {
      neighbors = [...neighbors].sort((a, b) => {
        const aBonds = adj.get(a)?.length ?? 0;
        const bBonds = adj.get(b)?.length ?? 0;
        return bBonds - aBonds; // most-bonded first
      });
    }

    neighbors.forEach((nbId, i) => {
      const nbAtom = molecule.atoms.find(a => a.id === nbId)!;
      const r2 = getRadius(nbAtom.element);
      // Circles just touch - no overlap - so electrons sit at the touching point
      const dist = r1 + r2;

      let angle: number;

      if (parentId === null) {
        // ROOT atom: use geometry-aware placement
        if (neighbors.length === 1) {
          angle = -Math.PI / 2; // single neighbor goes up
        } else if (neighbors.length === 2) {
          // Linear vs bent: determined by lone pairs on the central atom
          // 0 lone pairs → linear (CO2, NO2 with double bonds)
          // 1+ lone pairs → bent (H2O)
          const lonePairCount = Math.floor(atom.electronAssignments.available / 2);
          const isLinear = lonePairCount === 0;
          if (isLinear) {
            angle = i === 0 ? Math.PI : 0; // left and right
          } else {
            angle = i === 0 ? Math.PI : Math.PI / 2; // left and bottom (bent)
          }
        } else if (neighbors.length === 3) {
          // Trigonal planar: first neighbor (most bonded) goes right,
          // remaining two fan out on the left at ±60° from horizontal
          const lonePairCount = Math.floor(atom.electronAssignments.available / 2);
          if (lonePairCount === 0) {
            // No lone pairs: true trigonal planar (120° apart)
            const angles = [0, Math.PI * 2 / 3, -Math.PI * 2 / 3]; // right, lower-left, upper-left
            angle = angles[i];
          } else {
            // Has lone pair: trigonal pyramidal (top free for lone pair)
            const angles = [0, Math.PI, Math.PI / 2]; // right, left, bottom
            angle = angles[i];
          }
        } else {
          // 4+ neighbors: distribute evenly around full circle (cardinal directions for 4)
          // First neighbor (most-bonded, e.g. chain atom) goes right, rest follow counterclockwise
          angle = i * (2 * Math.PI / neighbors.length);
        }
      } else {
        // NON-ROOT atom: fan out on the opposite side of the parent bond
        const awayFromParent = parentAngle;

        if (neighbors.length === 1) {
          // Single unvisited neighbor: continue away from parent
          angle = awayFromParent;
        } else {
          // Multiple neighbors: fan out symmetrically around the away direction.
          // Determine ideal angle based on total electron groups (VSEPR)
          const totalGroups = neighbors.length + 1; // +1 for the parent bond
          let idealAngle: number;
          if (totalGroups <= 3) {
            idealAngle = 2 * Math.PI / 3; // 120° for sp2 (trigonal planar)
          } else {
            // For sp3 and higher: use 90° in 2D projection to avoid
            // wrapping into the parent atom's substituents
            idealAngle = Math.PI / 2; // 90° between neighbors
          }
          angle = awayFromParent + (i - (neighbors.length - 1) / 2) * idealAngle;
        }
      }

      const parentPos = positions.get(id)!;
      const x = parentPos.x + dist * Math.cos(angle);
      const y = parentPos.y + dist * Math.sin(angle);

      // Clamp to canvas bounds
      const nx = Math.max(r2 + 10, Math.min(CANVAS_W - r2 - 10, x));
      const ny = Math.max(r2 + 10, Math.min(CANVAS_H - r2 - 10, y));

      positions.set(nbId, { x: nx, y: ny });
      visited.add(nbId);
      queue.push({ id: nbId, parentId: id, angle });
    });
  }

  // Any unvisited atoms (disconnected): place in a horizontal row near the top
  const unvisited = molecule.atoms.filter(a => !visited.has(a.id));
  if (unvisited.length > 0) {
    const rowY = 50; // near top of canvas
    const maxAtomR = Math.max(...unvisited.map(a => getRadius(a.element)));
    const spacing = maxAtomR * 2 + 10;
    const totalWidth = (unvisited.length - 1) * spacing;
    const startX = CX - totalWidth / 2;
    unvisited.forEach((atom, i) => {
      positions.set(atom.id, {
        x: startX + i * spacing,
        y: rowY,
      });
    });
  }

  return {
    ...molecule,
    atoms: molecule.atoms.map(atom => ({
      ...atom,
      position: positions.get(atom.id) ?? { x: CX, y: CY },
    })),
  };
}

// ── SVG Molecule Canvas Component ─────────────────────────────────────────────
type ElectronDisplayMode = 'dots-crosses' | 'colored-dots';

interface MoleculeCanvasProps {
  molecule: Molecule;
  selectedAtoms: string[];
  bondMode: BondMode;
  electronDisplayMode: ElectronDisplayMode;
  onAtomClick: (id: string) => void;
}

type BondMode = 'single' | 'double' | 'triple' | 'break' | null;

const MoleculeCanvas: React.FC<MoleculeCanvasProps> = ({
  molecule,
  selectedAtoms,
  bondMode,
  electronDisplayMode,
  onAtomClick,
}) => {
  // Determine if an atom uses dots or crosses (consistent per element)
  const getElectronStyle = (element: string): 'dot' | 'cross' => {
    if (electronDisplayMode === 'colored-dots') return 'dot'; // All dots in colored mode
    // First atom alphabetically uses dots, second uses crosses, etc.
    const elements = Array.from(new Set(molecule.atoms.map(a => a.element))).sort();
    const index = elements.indexOf(element);
    return index % 2 === 0 ? 'dot' : 'cross';
  };

  // Render a single electron (dot or cross)
  const renderElectron = (x: number, y: number, color: string, style: 'dot' | 'cross', key: string) => {
    if (style === 'dot') {
      return <circle key={key} cx={x} cy={y} r={3.5} fill={color} />;
    } else {
      const crossSize = 3.5;
      return (
        <g key={key}>
          <line x1={x - crossSize * 0.7} y1={y - crossSize * 0.7} x2={x + crossSize * 0.7} y2={y + crossSize * 0.7} stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          <line x1={x - crossSize * 0.7} y1={y + crossSize * 0.7} x2={x + crossSize * 0.7} y2={y - crossSize * 0.7} stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
    }
  };

  // Render non-bonding electrons around an atom.
  // Uses available electrons (valence - bonding) to show both pairs and singles.
  // Follows Lewis dot structure: distribute to 4 cardinal positions,
  // one electron per position first, then pair up.
  const renderLonePairs = (atom: Molecule['atoms'][0]) => {
    const { x, y } = atom.position;
    const r = getRadius(atom.element);
    // Use available electrons (all non-bonding electrons including odd ones)
    const totalElectrons = atom.electronAssignments.available;

    if (totalElectrons === 0) return null;

    const color = ATOM_COLORS[atom.element] ?? '#94a3b8';
    const style = getElectronStyle(atom.element);
    const svgElements: React.ReactNode[] = [];
    const pairSpacing = 8;

    // How many slots do we need? Each slot holds up to 2 electrons (a pair).
    const numSlots = Math.ceil(totalElectrons / 2);
    const isUnbonded = atom.bonds.length === 0;

    // Determine slot positions.
    //   - Unbonded: always 4 cardinals so Hund's-style fill (1 per slot, then
    //     pair) reproduces standard Lewis dots for 1 to 8 valence electrons
    //     (e.g., 4-valence C → 4 singles; 6-valence O → 2 pairs + 2 singles).
    //   - Bonded: cardinal-slot allocator claims a cardinal per bond, then
    //     returns one cardinal per remaining slot so non-bonding electrons
    //     land at N/E/S/W (e.g., HCl → pairs at N+E+S, NH₃ → pair at N).
    let positions: number[];
    if (isUnbonded) {
      positions = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
    } else {
      const { lonePairAngles } = getCardinalElectronPlacement(atom, molecule, numSlots, 0);
      positions = lonePairAngles;
    }

    // Lewis dot filling: place one electron at each position first, then pair up
    const slotElectrons: number[] = new Array(positions.length).fill(0);
    let remaining = totalElectrons;

    // Pass 1: one electron per position
    for (let si = 0; si < positions.length && remaining > 0; si++) {
      slotElectrons[si] = 1;
      remaining--;
    }

    // Pass 2: pair up (add second electron to each position)
    for (let si = 0; si < positions.length && remaining > 0; si++) {
      if (slotElectrons[si] === 1) {
        slotElectrons[si] = 2;
        remaining--;
      }
    }

    // Render electrons at each position
    slotElectrons.forEach((count, si) => {
      if (count === 0) return;
      const angle = positions[si];
      const posX = x + r * Math.cos(angle);
      const posY = y + r * Math.sin(angle);

      if (count === 1) {
        // Single electron
        svgElements.push(
          renderElectron(posX, posY, color, style, `${atom.id}-lp${si}-single`)
        );
      } else {
        // Pair of electrons perpendicular to the radial direction
        const perpAngle = angle + Math.PI / 2;
        const offset = pairSpacing / 2;
        svgElements.push(
          renderElectron(posX + offset * Math.cos(perpAngle), posY + offset * Math.sin(perpAngle), color, style, `${atom.id}-lp${si}-a`),
          renderElectron(posX - offset * Math.cos(perpAngle), posY - offset * Math.sin(perpAngle), color, style, `${atom.id}-lp${si}-b`)
        );
      }
    });

    return <>{svgElements}</>;
  };

  // Render shared electrons in the overlap zone between two bonded atoms
  // Position them on each atom's perimeter, slightly inside to show in overlap
  const renderBondElectrons = (bond: Molecule['bonds'][0]) => {
    const atom1 = molecule.atoms.find(a => a.id === bond.atom1Id);
    const atom2 = molecule.atoms.find(a => a.id === bond.atom2Id);
    if (!atom1 || !atom2) return null;

    const x1 = atom1.position.x;
    const y1 = atom1.position.y;
    const x2 = atom2.position.x;
    const y2 = atom2.position.y;
    const r1 = getRadius(atom1.element);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    // Unit vector along bond
    const ux = dx / len;
    const uy = dy / len;

    // Perpendicular to bond (no rotation - just 90 degrees to bond axis)
    const perpX = -uy;
    const perpY = ux;

    // Number of electron pairs
    const pairs = bond.type === 'single' ? 1 : bond.type === 'double' ? 2 : 3;

    const color1 = ATOM_COLORS[atom1.element] ?? '#94a3b8';
    const color2 = ATOM_COLORS[atom2.element] ?? '#94a3b8';
    const style1 = getElectronStyle(atom1.element);
    const style2 = getElectronStyle(atom2.element);

    const electrons: React.ReactNode[] = [];

    // For single bonds: place one pair side-by-side
    // For double/triple bonds: stack pairs vertically (perpendicular to bond)

    if (pairs === 1) {
      // Single bond: place electrons at the intersection point of the two circles
      // The intersection point is exactly where the circles touch (at r1 from atom1)

      // Point where circles touch (on both perimeters)
      const touchX = x1 + ux * r1;
      const touchY = y1 + uy * r1;

      // Use the same spacing as lone pairs (8 units)
      const spacing = 8;

      // Place electrons perpendicular to bond axis, centered on touch point
      const e1x = touchX + perpX * spacing / 2;
      const e1y = touchY + perpY * spacing / 2;
      const e2x = touchX - perpX * spacing / 2;
      const e2y = touchY - perpY * spacing / 2;

      electrons.push(
        renderElectron(e1x, e1y, color1, style1, `${bond.id}-e0-a1`),
        renderElectron(e2x, e2y, color2, style2, `${bond.id}-e0-a2`)
      );
    } else {
      // Double/triple bonds: spread pairs ALONG the bond axis
      const spacing = 8; // spacing between dot and cross within one pair (perpendicular to bond)
      const pairAlongSpacing = 10; // spacing between distinct pairs along the bond axis

      // Touch point between the two circles
      const touchX = x1 + ux * r1;
      const touchY = y1 + uy * r1;

      for (let i = 0; i < pairs; i++) {
        // Offset each pair along the bond axis, centered on the touch point
        const alongOffset = (i - (pairs - 1) / 2) * pairAlongSpacing;

        // Center of this pair, shifted along bond axis
        const pairCenterX = touchX + ux * alongOffset;
        const pairCenterY = touchY + uy * alongOffset;

        // Place dot and cross perpendicular to bond axis within this pair
        const e1x = pairCenterX + perpX * spacing / 2;
        const e1y = pairCenterY + perpY * spacing / 2;
        const e2x = pairCenterX - perpX * spacing / 2;
        const e2y = pairCenterY - perpY * spacing / 2;

        electrons.push(
          renderElectron(e1x, e1y, color1, style1, `${bond.id}-e${i}-a1`),
          renderElectron(e2x, e2y, color2, style2, `${bond.id}-e${i}-a2`)
        );
      }
    }

    return <g key={bond.id}>{electrons}</g>;
  };

  const cursorClass = bondMode ? 'cursor-crosshair' : 'cursor-pointer';

  return (
    <svg
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      className={`w-full h-full ${cursorClass}`}
      style={{ background: 'transparent' }}
    >
      <defs>
        <filter id="glow-amber" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-green" x="-40%" y="-40%" width="180%" height="180%">
          <feColorMatrix type="matrix" values="0 0 0 0 0  0.5 1 0 0 0  0 0 0 0 0  0 0 0 1 0" in="SourceGraphic" result="colored" />
          <feGaussianBlur in="colored" stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Empty state hint */}
      {molecule.atoms.length === 0 && (
        <g opacity="0.18">
          {/* Ghosted H₂O */}
          <circle cx={CX - 60} cy={CY + 30} r={38} fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="6 4" />
          <circle cx={CX + 60} cy={CY + 30} r={38} fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="6 4" />
          <circle cx={CX} cy={CY - 30} r={46} fill="none" stroke="#f87171" strokeWidth="2.5" strokeDasharray="6 4" />
          <text x={CX - 60} y={CY + 36} textAnchor="middle" fontSize="22" fontWeight="bold" fill="#60a5fa">H</text>
          <text x={CX + 60} y={CY + 36} textAnchor="middle" fontSize="22" fontWeight="bold" fill="#60a5fa">H</text>
          <text x={CX} y={CY - 23} textAnchor="middle" fontSize="22" fontWeight="bold" fill="#f87171">O</text>
          <text x={CX} y={CY + 60} textAnchor="middle" fontSize="12" fontWeight="600" fill="#94a3b8">
            Build molecules by adding atoms
          </text>
          <text x={CX} y={CY + 78} textAnchor="middle" fontSize="11" fill="#64748b">
            1. Click elements above to add atoms
          </text>
          <text x={CX} y={CY + 92} textAnchor="middle" fontSize="11" fill="#64748b">
            2. Select bond type, then click two atoms to bond
          </text>
          <text x={CX} y={CY + 106} textAnchor="middle" fontSize="11" fill="#64748b">
            3. Select an atom, then click "Remove" to delete
          </text>
        </g>
      )}

      {/* Atom circles (rendered first: behind electrons) */}
      {molecule.atoms.map((atom) => {
        const { x, y } = atom.position;
        const r = getRadius(atom.element);
        const color = ATOM_COLORS[atom.element] ?? '#94a3b8';
        const isSelected = selectedAtoms.includes(atom.id);

        return (
          <g key={atom.id}>
            {/* Selection glow */}
            {isSelected && (
              <circle
                cx={x}
                cy={y}
                r={r + 6}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="3"
                filter="url(#glow-amber)"
                opacity="0.85"
              />
            )}

            {/* Atom outline circle: transparent fill so overlaps show */}
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={color + '18'}
              stroke={color}
              strokeWidth="1.5"
              onClick={() => onAtomClick(atom.id)}
              className="cursor-pointer hover:brightness-125 transition-all"
            />

            {/* Element symbol */}
            <text
              x={x}
              y={y + 8}
              textAnchor="middle"
              fontSize={r > 48 ? '22' : '20'}
              fontWeight="bold"
              fill={color}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {atom.element}
            </text>
          </g>
        );
      })}

      {/* Bond shared electrons: rendered after circles so they appear in overlap */}
      {molecule.bonds.map(bond => renderBondElectrons(bond))}

      {/* Lone pair electrons: rendered last (outermost) */}
      {molecule.atoms.map(atom => (
        <g key={`lp-${atom.id}`}>
          {renderLonePairs(atom)}
        </g>
      ))}
    </svg>
  );
};

const COVALENT_SOCRATIC_TIPS = [
  "Why do H atoms only ever form a single bond with other atoms? Think about their valence shell limit (n=1, maximum of 2 electrons).",
  "Sodium and chlorine bond ionically, but carbon and oxygen bond covalently. Why does electronegativity difference cause this shift?",
  "Compare single, double, and triple bonds. Which is the shortest? Which is the strongest? Why?",
  "Observe the formal charges. If a neutral molecule has atoms with non-zero formal charges, is it fully stable? How could you minimize formal charge?",
  "Hybridization of carbon changes from sp³ (in methane) to sp² (in ethene) to sp (in ethyne). How does the number of electron domains determine this?",
  "Look at the polar bonds. If a molecule has polar bonds but is symmetric (like CO₂), why does it have a net dipole moment of zero (non-polar)?",
  "What happens to lone pairs on the central atom? Why do they push bonded atoms closer together, reducing bond angles (like in water, 104.5°)?"
];

interface CovalentChallengeDef extends ChallengeDef {
  targetFormula: string;
  targetName: string;
  presetId: string;
  atomsNeeded: string[];
}

const COVALENT_CHALLENGES: CovalentChallengeDef[] = [
  {
    id: 'cov-1',
    title: '1. Synthesize Water (H₂O)',
    description: 'Build a water molecule (H₂O) where oxygen satisfies its octet with two single bonds and two lone pairs, creating a bent shape.',
    hints: [
      'How many valence electrons does oxygen start with, and how many more does it need to complete its octet?',
      'Oxygen (Group 16) brings 6 valence electrons: it forms 2 single bonds with hydrogen and keeps 2 lone pairs.',
      'Select Single Bond, then connect the central oxygen to each hydrogen atom.',
    ],
    targetFormula: 'H2O',
    targetName: 'Water',
    presetId: 'H2O',
    atomsNeeded: ['O', 'H', 'H'],
  },
  {
    id: 'cov-2',
    title: '2. Synthesize Carbon Dioxide (CO₂)',
    description: 'Build a neutral carbon dioxide molecule (CO₂) with linear geometry and zero formal charges on every atom.',
    hints: [
      'If carbon only makes single bonds to each oxygen, will any of the atoms have a full octet?',
      'Carbon needs 4 shared pairs to fill its octet, and each oxygen needs 2 shared pairs: that means a double bond to each oxygen.',
      'Select Double Bond, then connect the central carbon to each oxygen atom.',
    ],
    targetFormula: 'CO2',
    targetName: 'Carbon Dioxide',
    presetId: 'CO2',
    atomsNeeded: ['C', 'O', 'O'],
  },
  {
    id: 'cov-3',
    title: '3. Synthesize Ammonia (NH₃)',
    description: 'Build an ammonia molecule (NH₃) with trigonal pyramidal geometry and a single lone pair on the central nitrogen.',
    hints: [
      'How many single bonds can nitrogen form using its 5 valence electrons before completing its octet?',
      'Nitrogen shares 3 of its valence electrons across single bonds to hydrogen, leaving 1 non-bonding lone pair at the top.',
      'Select Single Bond, then connect nitrogen to all three hydrogen atoms.',
    ],
    targetFormula: 'NH3',
    targetName: 'Ammonia',
    presetId: 'NH3',
    atomsNeeded: ['N', 'H', 'H', 'H'],
  },
  {
    id: 'cov-4',
    title: '4. Synthesize Methane (CH₄)',
    description: 'Build a methane molecule (CH₄) where carbon forms four symmetric single bonds in a tetrahedral arrangement.',
    hints: [
      'How many hydrogen atoms does carbon need to bond with to completely fill its valence shell?',
      'Carbon has 4 valence electrons and forms 4 single bonds, pointing toward the corners of a tetrahedron (109.5° angles).',
      'Select Single Bond, then link the central carbon to all four hydrogen atoms.',
    ],
    targetFormula: 'CH4',
    targetName: 'Methane',
    presetId: 'CH4',
    atomsNeeded: ['C', 'H', 'H', 'H', 'H'],
  },
  {
    id: 'cov-5',
    title: '5. Synthesize Nitrogen Gas (N₂)',
    description: 'Build diatomic nitrogen gas (N₂), sharing three electron pairs to give each nitrogen atom a complete octet and one lone pair.',
    hints: [
      'How many electron pairs must two nitrogen atoms share so both reach a full octet with no other atoms around?',
      'Each nitrogen brings 5 valence electrons. Sharing 3 pairs (a triple bond) leaves exactly 1 lone pair on each atom.',
      'Select Triple Bond, then click both nitrogen atoms to connect them.',
    ],
    targetFormula: 'N2',
    targetName: 'Nitrogen Gas',
    presetId: 'N2',
    atomsNeeded: ['N', 'N'],
  },
  {
    id: 'cov-6',
    title: '6. Synthesize Hydrogen Cyanide (HCN)',
    description: 'Build hydrogen cyanide (HCN) with linear geometry, placing carbon in the center between hydrogen and nitrogen.',
    hints: [
      'Why does carbon belong in the middle rather than hydrogen or nitrogen?',
      'Carbon needs 4 bonds total: 1 single bond to hydrogen (satisfying its duet) and 1 triple bond to nitrogen (giving it an octet).',
      'Connect hydrogen to carbon with a Single Bond, then connect carbon to nitrogen with a Triple Bond.',
    ],
    targetFormula: 'HCN',
    targetName: 'Hydrogen Cyanide',
    presetId: 'HCN',
    atomsNeeded: ['H', 'C', 'N'],
  },
  {
    id: 'cov-7',
    title: '7. Synthesize Formaldehyde (CH₂O)',
    description: 'Build formaldehyde (CH₂O) with trigonal planar geometry around the central carbon atom and zero formal charges.',
    hints: [
      'Which atom is capable of forming four bonds and sits at the center of the molecule?',
      'Carbon sits at the center of a trigonal planar arrangement, single-bonded to two hydrogens and double-bonded to oxygen.',
      'Use Single Bond for each C-H connection, then use Double Bond for C=O.',
    ],
    targetFormula: 'CH2O',
    targetName: 'Formaldehyde',
    presetId: 'CH2O',
    atomsNeeded: ['C', 'O', 'H', 'H'],
  },
  {
    id: 'cov-8',
    title: '8. Synthesize Sulfur Hexafluoride (SF₆)',
    description: 'Build sulfur hexafluoride (SF₆), using sulfur\'s expanded octet to hold six fluorine atoms in an octahedral shape.',
    hints: [
      'Why can Period 3 elements like sulfur hold more than 8 valence electrons?',
      'Because sulfur is in Period 3, it can access d-orbitals to expand its octet and form 6 single bonds.',
      'Select Single Bond, then connect the central sulfur to each of the 6 fluorine atoms.',
    ],
    targetFormula: 'SF6',
    targetName: 'Sulfur Hexafluoride',
    presetId: 'SF6',
    atomsNeeded: ['S', 'F', 'F', 'F', 'F', 'F', 'F'],
  },
];

// ── Main View ──────────────────────────────────────────────────────────────────
const CovalentBondingView: React.FC<CovalentBondingViewProps> = ({ course, onBack }) => {
  const [molecule, setMolecule] = useState<Molecule>({
    id: 'molecule-1', atoms: [], bonds: [], formula: '',
  });
  const [selectedAtoms, setSelectedAtoms] = useState<string[]>([]);
  const [bondMode, setBondMode] = useState<BondMode>(null);
  const [electronDisplayMode, setElectronDisplayMode] = useState<ElectronDisplayMode>('dots-crosses');
  const [visualizationMode, setVisualizationMode] = useState<'builder' | 'lewis'>('builder');
  const [selectedPresetDifficulty, setSelectedPresetDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [toast, setToast] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(0);

  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((text: string, type: 'info' | 'success' | 'error') => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ text, type });
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // Add atom: auto-positions after adding
  const handleAddAtom = (element: string) => {
    const newAtom = createAtom(element, { x: CX, y: CY });
    const updated = assignLonePairs({
      ...molecule,
      atoms: [...molecule.atoms, newAtom],
    });
    setMolecule(autoPositionAtoms(updated));
    setSelectedAtoms([]);
    showToast(`Added ${element}`, 'info');
  };

  // Atom click in bond mode
  const handleAtomClick = (atomId: string) => {
    if (!bondMode) {
      // No bond mode active: toggle selection for removal
      if (selectedAtoms.includes(atomId)) {
        setSelectedAtoms([]);
      } else {
        setSelectedAtoms([atomId]);
        showToast('Click "Remove Atom" button or click atom again to deselect', 'info');
      }
      return;
    }

    if (bondMode === 'break') {
      // In break mode single click = remove atom? No, break mode is for bonds
      // We'll handle bond clicking separately. For now, deselect.
      return;
    }

    if (selectedAtoms.includes(atomId)) {
      setSelectedAtoms([]);
      return;
    }

    if (selectedAtoms.length === 0) {
      setSelectedAtoms([atomId]);
      showToast('Now click the second atom', 'info');
    } else {
      // Second atom: create bond
      const result = createBond(molecule, selectedAtoms[0], atomId, bondMode as 'single' | 'double' | 'triple');
      if (result.success && result.molecule) {
        const withLonePairs = assignLonePairs(result.molecule);
        setMolecule(autoPositionAtoms(withLonePairs));
        showToast(`${bondMode!.charAt(0).toUpperCase() + bondMode!.slice(1)} bond created`, 'success');
      } else {
        showToast(result.error ?? 'Cannot create bond', 'error');
      }
      setSelectedAtoms([]);
    }
  };

  // Remove atom (double-click or dedicated button)
  const handleRemoveAtom = (atomId: string) => {
    const updated = removeAtom(molecule, atomId);
    setMolecule(autoPositionAtoms(assignLonePairs(updated)));
    setSelectedAtoms([]);
    showToast('Atom removed', 'info');
  };

  // Extend handleAtomClick for break mode
  const handleAtomClickFull = (atomId: string) => {
    if (bondMode === 'break') {
      if (selectedAtoms.includes(atomId)) {
        setSelectedAtoms([]);
        return;
      }
      if (selectedAtoms.length === 0) {
        setSelectedAtoms([atomId]);
        showToast('Now click the other bonded atom', 'info');
      } else {
        // Try to break bond between them
        const bond = molecule.bonds.find(
          b =>
            (b.atom1Id === selectedAtoms[0] && b.atom2Id === atomId) ||
            (b.atom1Id === atomId && b.atom2Id === selectedAtoms[0])
        );
        if (!bond) {
          showToast('Those atoms are not bonded', 'error');
          setSelectedAtoms([]);
          return;
        }
        const updated = breakBond(molecule, bond.id);
        setMolecule(autoPositionAtoms(updated));
        setSelectedAtoms([]);
        showToast('Bond broken', 'success');
      }
      return;
    }
    handleAtomClick(atomId);
  };

  const handleClear = () => {
    setMolecule({ id: 'molecule-1', atoms: [], bonds: [], formula: '' });
    setSelectedAtoms([]);
    setBondMode(null);
    showToast('Canvas cleared', 'info');
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_MOLECULES.find(p => p.id === presetId);
    if (preset) {
      // Presets already have correct electron assignments: just auto-position
      setMolecule(autoPositionAtoms(preset.molecule));
      setSelectedAtoms([]);
      setBondMode(null);
      showToast(`Loaded ${preset.name}`, 'success');
    }
  };

  const handleApplyChallenge = (idx: number) => {
    const cur = COVALENT_CHALLENGES[idx];
    let newMol: Molecule = { id: `challenge-${cur.id}`, atoms: [], bonds: [], formula: '' };
    cur.atomsNeeded.forEach(sym => {
      const a = createAtom(sym, { x: CX, y: CY });
      newMol.atoms.push(a);
    });
    newMol = assignLonePairs(newMol);
    setMolecule(autoPositionAtoms(newMol));
    setSelectedAtoms([]);
    setBondMode(null);
    showToast(`Challenge ${idx + 1}: Build ${cur.targetName}`, 'info');
  };

  const handleVerifyChallenge = () => {
    const cur = COVALENT_CHALLENGES[challengeIdx];
    if (!validation.valid) {
      return {
        success: false,
        message: `This structure is still incomplete (${validation.completeness}% complete). Take another look at your bonds and unshared pairs.`
      };
    }
    const curFormula = generateChemicalFormula(molecule);
    const match = curFormula === cur.targetFormula ||
      (cur.presetId === 'HCN' && (curFormula === 'CHN' || curFormula === 'HCN'));
    if (match) {
      return {
        success: true,
        message: `You built ${cur.targetName} (${cur.targetFormula}) with all valence requirements satisfied and the correct molecular shape.`
      };
    }
    return {
      success: false,
      message: `The bonds and valences here check out, but this is ${curFormula || 'an unexpected structure'} rather than ${cur.targetFormula} (${cur.targetName}).`
    };
  };

  const handleApplySolution = (idx: number) => {
    const cur = COVALENT_CHALLENGES[idx];
    handleLoadPreset(cur.presetId);
  };

  // Derived calculations
  const formula = generateChemicalFormula(molecule);
  const formattedFormula = formula ? formatFormulaWithSubscripts(formula) : '';
  const moleculeInfo = formula ? identifyMolecule(formula) : null;
  const molarMass = molecule.atoms.length > 0 ? calculateMolarMass(molecule) : 0;
  const formalCharge = molecule.atoms.length > 0 ? calculateFormalCharge(molecule) : 0;
  const validation = validateMolecule(molecule, course);
  const geometry = molecule.atoms.length > 1 ? calculateGeometry(molecule) : null;
  const polarity = molecule.atoms.length > 1 ? calculatePolarity(molecule) : null;

  const bondModeLabel: Record<NonNullable<BondMode>, string> = {
    single: 'Single Bond',
    double: 'Double Bond',
    triple: 'Triple Bond',
    break: 'Break Bond',
  };

  // Presets for the selected difficulty tab
  const currentPresets = getPresetsByDifficulty(selectedPresetDifficulty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 md:px-6 py-3 border-b border-slate-700/50 bg-slate-900/60 backdrop-blur-sm gap-2">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight">Covalent Bonding</h1>
            <p className="text-violet-300 text-[10px] mt-0.5">Overlapping circles electron model</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = !challengeMode;
              setChallengeMode(next);
              if (next && molecule.atoms.length === 0) {
                handleApplyChallenge(challengeIdx);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              challengeMode
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">{challengeMode ? 'Exit Challenges' : 'Challenge Mode'}</span>
          </button>
          <button
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
            aria-label="How to use this simulation"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01"/></svg>
            <span className="hidden sm:inline">How To Use</span>
          </button>
        </div>

        {/* Formula and compound name(s) */}
        <div className="hidden sm:flex flex-col items-center gap-0.5">
          {moleculeInfo && (
            <div className="text-lg font-bold text-violet-200">
              {moleculeInfo.common}
              {moleculeInfo.iupac && moleculeInfo.iupac !== moleculeInfo.common && (
                <span className="text-sm text-slate-400 ml-2">/ {moleculeInfo.iupac}</span>
              )}
            </div>
          )}
          {formattedFormula && (
            <div className="text-sm font-mono text-slate-400 tracking-wide">
              {formattedFormula}
            </div>
          )}
        </div>

        {/* Valid structure badge */}
        <div className="hidden sm:flex items-center gap-3">
          {molecule.atoms.length > 0 && (
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                validation.valid
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : validation.completeness > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-500/20 text-slate-400 border border-slate-600'
              }`}
            >
              {validation.valid
                ? '✓ Valid structure'
                : validation.completeness > 0
                ? `${validation.completeness}% complete`
                : 'Building...'}
            </span>
          )}
        </div>
      </div>

      {/* ── Visualization Mode Tabs ── */}
      <div className="px-4 py-2 border-b border-slate-700/50 bg-slate-900/60 flex items-center gap-2">
        <button
          onClick={() => setVisualizationMode('builder')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            visualizationMode === 'builder'
              ? 'bg-violet-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
          }`}
        >
          Builder
        </button>
        <button
          onClick={() => setVisualizationMode('lewis')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            visualizationMode === 'lewis'
              ? 'bg-violet-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
          }`}
        >
          Lewis Diagram
        </button>
      </div>

      {/* ── Element Palette Bar (above canvas, hidden in Lewis mode) ── */}
      {visualizationMode === 'builder' && (
      <div className="px-4 py-2.5 border-b border-slate-700/50 bg-slate-900/40 flex items-center justify-start gap-1.5 flex-wrap">
        {ELEMENT_PALETTE.map(({ symbol, name }) => {
          const color = ATOM_COLORS[symbol] ?? '#94a3b8';
          const valence = VALENCE_ELECTRONS[symbol] ?? '?';
          return (
            <button
              key={symbol}
              onClick={() => handleAddAtom(symbol)}
              title={`${name} (${valence} valence e⁻)`}
              className="relative flex flex-col items-center justify-center w-16 h-16 rounded-xl border transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              style={{
                borderColor: color + '50',
                backgroundColor: color + '12',
              }}
            >
              <span className="text-lg font-black leading-none" style={{ color }}>
                {symbol}
              </span>
              <span className="text-[8px] text-slate-400 leading-none mt-1 truncate max-w-[56px]">
                {name}
              </span>
              <span className="text-[7px] text-slate-600 leading-none mt-0.5">
                {valence}e⁻
              </span>
            </button>
          );
        })}
      </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden lg:overflow-hidden">

        {/* ── Left: Examples + Analysis Panel ── */}
        <div className="w-full lg:w-52 lg:flex-shrink-0 border-b lg:border-b-0 lg:border-r border-slate-700/50 bg-slate-900/40 p-4 flex flex-col gap-4 overflow-y-auto order-2 lg:order-1 max-h-64 lg:max-h-none">
          {/* Examples */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Examples</p>
            {/* Difficulty tabs */}
            <div className="flex bg-slate-800/60 rounded-xl p-1 gap-1 mb-3">
              {([
                { key: 'beginner' as const, label: 'Easy' },
                { key: 'intermediate' as const, label: 'Medium' },
                { key: 'advanced' as const, label: 'Hard' },
              ]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSelectedPresetDifficulty(key)}
                  className={`flex-1 px-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    selectedPresetDifficulty === key
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Molecule list */}
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {currentPresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset.id)}
                  className="w-full text-left px-2 py-1.5 rounded-lg bg-slate-800/30 hover:bg-violet-600/20 border border-transparent hover:border-violet-500/30 transition-all text-xs group"
                >
                  <div className="font-bold text-slate-300 group-hover:text-violet-200">{preset.name}</div>
                  <div className="text-[10px] text-slate-500">{preset.formula}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis */}
          {molecule.atoms.length > 0 && (
            <>
              <div className="border-t border-slate-700/50 pt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Analysis</p>
                <div className="space-y-2 text-sm">
                  {geometry && (
                    <div className="bg-slate-800/40 rounded-lg px-3 py-2">
                      <div className="text-xs text-slate-500">Geometry</div>
                      <div className="font-bold text-slate-200">{geometry.geometry}</div>
                      {geometry.hybridization && (
                        <div className="text-[10px] text-violet-400">{geometry.hybridization}</div>
                      )}
                    </div>
                  )}
                  {polarity && (
                    <div className="bg-slate-800/40 rounded-lg px-3 py-2">
                      <div className="text-xs text-slate-500">Polarity</div>
                      <div className={`font-bold capitalize ${polarity === 'polar' ? 'text-cyan-300' : 'text-slate-300'}`}>
                        {polarity}
                      </div>
                    </div>
                  )}
                  <div className="bg-slate-800/40 rounded-lg px-3 py-2">
                    <div className="text-xs text-slate-500">Molar Mass</div>
                    <div className="font-bold text-slate-200">{molarMass.toFixed(2)} g/mol</div>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg px-3 py-2">
                    <div className="text-xs text-slate-500">Formal Charge</div>
                    <div className="font-bold text-slate-200">{formalCharge === 0 ? '0 (neutral)' : formalCharge}</div>
                  </div>
                </div>
              </div>

              {/* Validation feedback */}
              {(validation.warnings.length > 0 || validation.errors.length > 0) && (
                <div className="border-t border-slate-700/50 pt-4 space-y-2">
                  {validation.errors.map((e, i) => (
                    <div key={i} className="bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-1.5 text-[10px] text-red-300">
                      {e}
                    </div>
                  ))}
                  {validation.warnings.map((w, i) => (
                    <div key={i} className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-2 py-1.5 text-[10px] text-amber-300">
                      {w}
                    </div>
                  ))}
                </div>
              )}

              {/* Atom list with remove */}
              <div className="mt-auto border-t border-slate-700/50 pt-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Atoms</p>
                <div className="space-y-1">
                  {molecule.atoms.slice(0, 8).map(atom => {
                    const color = ATOM_COLORS[atom.element] ?? '#94a3b8';
                    return (
                      <button
                        key={atom.id}
                        onClick={() => handleRemoveAtom(atom.id)}
                        className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-red-600/20 group transition-colors text-xs"
                      >
                        <span style={{ color }} className="font-bold">{atom.element}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 text-[10px]">remove</span>
                      </button>
                    );
                  })}
                  {molecule.atoms.length > 8 && (
                    <p className="text-[10px] text-slate-600 text-center">+{molecule.atoms.length - 8} more</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Center: Canvas ── */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-950/40 order-1 lg:order-2">
          {/* Toast notification */}
          {toast && (
            <div
              className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl text-sm font-bold shadow-xl transition-all ${
                toast.type === 'success'
                  ? 'bg-emerald-600/90 text-white'
                  : toast.type === 'error'
                  ? 'bg-red-600/90 text-white'
                  : 'bg-slate-700/90 text-slate-200'
              }`}
            >
              {toast.text}
            </div>
          )}

          {/* Active bond mode ribbon */}
          {bondMode && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-violet-600/80 backdrop-blur-sm rounded-full text-xs font-bold border border-violet-400/50">
              <span className="w-2 h-2 rounded-full bg-violet-300 animate-pulse" />
              {bondModeLabel[bondMode]} active
            </div>
          )}

          {/* Challenge Mode Deck */}
          {challengeMode && (
            <div className="p-4 pb-0 z-10">
              <ChallengeDeck
                title="Molecular Architecture Challenges"
                challenges={COVALENT_CHALLENGES}
                currentIndex={challengeIdx}
                onSelectIndex={idx => {
                  setChallengeIdx(idx);
                  handleApplyChallenge(idx);
                }}
                onVerify={handleVerifyChallenge}
                onApplySolution={() => handleApplySolution(challengeIdx)}
                solutionUnlockAfter={2}
                accentGradient="from-violet-500 to-indigo-600"
              />
            </div>
          )}

          {/* SVG Canvas */}
          <div className="flex-1 flex items-center justify-center p-4 min-h-[280px] lg:min-h-0">
            <div className="w-full h-full max-h-[60vh] lg:max-h-[85vh] aspect-[500/350] rounded-2xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
              {visualizationMode === 'builder' ? (
                <MoleculeCanvas
                  molecule={molecule}
                  selectedAtoms={selectedAtoms}
                  bondMode={bondMode}
                  electronDisplayMode={electronDisplayMode}
                  onAtomClick={handleAtomClickFull}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <DotCrossDiagram molecule={molecule} />
                </div>
              )}
            </div>
          </div>

          {/* Tip */}
          {molecule.atoms.length > 0 && visualizationMode === 'builder' && (
            <p className="text-center text-xs text-slate-500 pb-2">
              {!bondMode && selectedAtoms.length === 0 && 'Tip: Select a bond mode on the right, or click an atom to select for removal'}
              {!bondMode && selectedAtoms.length > 0 && 'Click "Remove Atom" button on the right to delete, or deselect by clicking again'}
              {bondMode && selectedAtoms.length === 0 && `${bondModeLabel[bondMode]} mode active: click first atom`}
              {bondMode && selectedAtoms.length === 1 && `${bondModeLabel[bondMode]} mode active: click second atom to complete bond`}
            </p>
          )}
          {molecule.atoms.length > 0 && (
            <div className="px-4 pb-4">
              <SocraticMascotPanel tips={COVALENT_SOCRATIC_TIPS} title="Covalent Socratic Advisor" mood="thinking" />
            </div>
          )}
        </div>

        {/* ── Right: Controls Panel (hidden in Lewis mode) ── */}
        {visualizationMode === 'builder' && (
        <div className="w-full lg:w-52 lg:flex-shrink-0 border-t lg:border-t-0 lg:border-l border-slate-700/50 bg-slate-900/40 p-4 flex flex-col gap-5 overflow-y-auto order-3 max-h-64 lg:max-h-none">

          {/* Bond Tools */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Bond Mode</p>
            <div className="space-y-2">
              {([
                { mode: 'single' as const,  label: 'Single Bond',  desc: '2e shared', color: 'emerald' },
                { mode: 'double' as const,  label: 'Double Bond',  desc: '4e shared', color: 'cyan' },
                { mode: 'triple' as const,  label: 'Triple Bond',  desc: '6e shared', color: 'violet' },
                { mode: 'break' as const,   label: 'Break Bond',   desc: 'Remove',    color: 'amber' },
              ] as const).map(({ mode, label, desc, color }) => (
                <button
                  key={mode}
                  onClick={() => setBondMode(bondMode === mode ? null : mode)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-left transition-all group ${
                    bondMode === mode
                      ? `bg-${color}-600/30 border-${color}-500/60 shadow-lg shadow-${color}-900/30`
                      : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className={`text-xs font-bold ${bondMode === mode ? `text-${color}-300` : 'text-slate-300'}`}>
                    {label}
                  </div>
                  <div className="text-[10px] text-slate-500">{desc}</div>
                </button>
              ))}
            </div>

            {selectedAtoms.length > 0 && bondMode && (
              <p className="mt-2 text-[10px] text-amber-400 text-center">
                1 atom selected: click another
              </p>
            )}
          </div>

          {/* Remove Atom Button (when atom selected but no bond mode) */}
          {selectedAtoms.length > 0 && !bondMode && (
            <div className="border-t border-slate-700/50 pt-4">
              <button
                onClick={() => {
                  if (selectedAtoms[0]) {
                    handleRemoveAtom(selectedAtoms[0]);
                  }
                }}
                className="w-full px-3 py-2.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 hover:border-red-500/60 rounded-xl text-xs font-bold text-red-400 transition-all"
              >
                Remove Selected Atom
              </button>
            </div>
          )}

          {/* Electron Display Toggle */}
          <div className="border-t border-slate-700/50 pt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Electron Style</p>
            <div className="flex bg-slate-800/60 rounded-xl p-1 gap-1">
              <button
                onClick={() => setElectronDisplayMode('dots-crosses')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  electronDisplayMode === 'dots-crosses'
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dots & Crosses
              </button>
              <button
                onClick={() => setElectronDisplayMode('colored-dots')}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  electronDisplayMode === 'colored-dots'
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Colored Dots
              </button>
            </div>
          </div>

          {/* Clear Canvas */}
          {molecule.atoms.length > 0 && (
            <div className="border-t border-slate-700/50 pt-4">
              <button
                onClick={handleClear}
                className="w-full px-3 py-2 bg-red-600/15 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-xs font-bold text-red-400 transition-all"
              >
                Clear Canvas
              </button>
            </div>
          )}
        </div>
        )}
      </div>

      <AboutPanel
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        content={COVALENT_ABOUT}
        gradient="from-violet-500 to-purple-600"
      />
    </div>
  );
};

export default CovalentBondingView;
