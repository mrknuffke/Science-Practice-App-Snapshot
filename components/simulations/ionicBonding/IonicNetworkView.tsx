/**
 * IonicNetworkView
 * Displays an extended 2D crystal lattice derived directly from the builder's IonicAtom list.
 * Works for any stoichiometric ratio (1:1, 1:2, 2:3, polyatomic compounds, etc.)
 */

import React, { useMemo } from 'react';
import { IonicAtom } from './ionicBuilderEngine';
import { METALS, NONMETALS, POLYATOMIC_IONS } from './ionicDatabase';

interface IonicNetworkViewProps {
  atoms: IonicAtom[];
  isBalanced: boolean;
  formula: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getAtomColor(atom: IonicAtom): string {
  if (atom.polyatomicId) return POLYATOMIC_IONS[atom.polyatomicId]?.color ?? '#94A3B8';
  return METALS[atom.element]?.color ?? NONMETALS[atom.element]?.color ?? '#94A3B8';
}

function getAtomLabel(atom: IonicAtom): string {
  if (atom.polyatomicId) return POLYATOMIC_IONS[atom.polyatomicId]?.formula ?? atom.element;
  return atom.element;
}

function getAtomName(atom: IonicAtom): string {
  if (atom.polyatomicId) return POLYATOMIC_IONS[atom.polyatomicId]?.name ?? atom.element;
  return METALS[atom.element]?.name ?? NONMETALS[atom.element]?.name ?? atom.element;
}

/** Greatest common divisor */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Reduce ratio to lowest terms, e.g. 2:4 → 1:2 */
function reduceRatio(cat: number, an: number): [number, number] {
  const d = gcd(cat, an);
  return [cat / d, an / d];
}

// ── Component ─────────────────────────────────────────────────────────────────

const IonicNetworkView: React.FC<IonicNetworkViewProps> = ({ atoms, isBalanced, formula }) => {
  const cationAtoms = atoms.filter(a => a.type === 'cation');
  const anionAtoms = atoms.filter(a => a.type === 'anion');

  // Collapse to representative ions (first unique cation and anion)
  const cationSample = cationAtoms[0] ?? null;
  const anionSample = anionAtoms[0] ?? null;

  // Derive stoichiometric ratio from the atoms on canvas
  const rawCatCount = cationAtoms.length;
  const rawAnCount = anionAtoms.length;
  const [catRatio, anRatio] = rawCatCount > 0 && rawAnCount > 0
    ? reduceRatio(rawCatCount, rawAnCount)
    : [1, 1];

  // Build the repeating unit cell pattern for a GRID_SIZE × GRID_SIZE lattice
  const GRID_SIZE = 7;
  const CELL = 72;
  const PAD = 44;

  interface LatticeCell {
    row: number;
    col: number;
    isCation: boolean;
    x: number;
    y: number;
  }

  const cells = useMemo<LatticeCell[]>(() => {
    const result: LatticeCell[] = [];
    const period = catRatio + anRatio; // length of one repeating sequence

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        // Offset alternating rows by half a period for a more realistic lattice look
        const effectiveCol = (col + Math.floor(row * catRatio / period)) % period;
        const posInPeriod = effectiveCol % period;
        const isCation = posInPeriod < catRatio;
        result.push({
          row,
          col,
          isCation,
          x: PAD + col * CELL + CELL / 2,
          y: PAD + row * CELL + CELL / 2,
        });
      }
    }
    return result;
  }, [catRatio, anRatio]);

  const SVG_W = PAD * 2 + GRID_SIZE * CELL;
  const SVG_H = PAD * 2 + GRID_SIZE * CELL;

  if (atoms.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-center p-8 text-sm">
        Add atoms to the canvas to see the network structure.
      </div>
    );
  }

  if (!isBalanced) {
    return (
      <div className="flex items-center justify-center h-64 text-amber-400 text-center p-8 text-sm font-semibold">
        ⚠️ Balance the charges to view the crystal network structure.
      </div>
    );
  }

  const cationColor = cationSample ? getAtomColor(cationSample) : '#f59e0b';
  const anionColor = anionSample ? getAtomColor(anionSample) : '#818cf8';
  const cationLabel = cationSample ? getAtomLabel(cationSample) : '?';
  const anionLabel = anionSample ? getAtomLabel(anionSample) : '?';
  const cationName = cationSample ? getAtomName(cationSample) : 'Cation';
  const anionName = anionSample ? getAtomName(anionSample) : 'Anion';
  const cationCharge = cationSample ? cationSample.charge : 1;
  const anionCharge = anionSample ? anionSample.charge : -1;

  const chargeStr = (c: number) => c > 0 ? `+${c}` : `${c}`;

  // Ionic radius sizing: larger charge magnitude → slightly larger sphere
  const baseR = 22;
  const cationR = Math.max(14, baseR - Math.abs(cationCharge) * 2);
  const anionR = Math.min(30, baseR + Math.abs(anionCharge) * 2);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Title */}
      <div className="text-center">
        <span className="text-slate-300 text-sm font-bold">Crystal Network: </span>
        <span className="text-white font-black">{formula}</span>
        <span className="text-slate-500 text-xs ml-2">(ratio {catRatio}:{anRatio})</span>
      </div>

      {/* SVG lattice */}
      <div className="w-full bg-slate-900/60 rounded-2xl border border-slate-700 overflow-hidden">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full"
          style={{ maxHeight: '420px' }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Faint grid */}
          <g opacity="0.06">
            {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
              <React.Fragment key={`gl-${i}`}>
                <line x1={PAD} y1={PAD + i * CELL} x2={PAD + GRID_SIZE * CELL} y2={PAD + i * CELL} stroke="#94a3b8" strokeWidth="1" />
                <line x1={PAD + i * CELL} y1={PAD} x2={PAD + i * CELL} y2={PAD + GRID_SIZE * CELL} stroke="#94a3b8" strokeWidth="1" />
              </React.Fragment>
            ))}
          </g>

          {/* Electrostatic bonds: lines between each ion and its nearest neighbors */}
          {cells.map((cell, idx) => {
            const neighbors = cells.filter(c =>
              c !== cell &&
              c.isCation !== cell.isCation && // only cation-anion bonds
              Math.abs(c.col - cell.col) <= 1 &&
              Math.abs(c.row - cell.row) <= 1 &&
              !(Math.abs(c.col - cell.col) === 1 && Math.abs(c.row - cell.row) === 1) // no diagonals
            );
            return neighbors.map((nb, ni) => (
              <line
                key={`bond-${idx}-${ni}`}
                x1={cell.x} y1={cell.y}
                x2={nb.x} y2={nb.y}
                stroke="rgba(148,163,184,0.18)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            ));
          })}

          {/* Ion spheres */}
          {cells.map((cell, idx) => {
            const color = cell.isCation ? cationColor : anionColor;
            const r = cell.isCation ? cationR : anionR;
            const label = cell.isCation ? cationLabel : anionLabel;
            const charge = cell.isCation ? cationCharge : anionCharge;
            const isPolyLabel = label.length > 4; // polyatomic: use two lines

            return (
              <g key={`ion-${idx}`}>
                {/* Glow */}
                <circle cx={cell.x} cy={cell.y} r={r + 5} fill={color} opacity="0.08" />
                {/* Main sphere */}
                <circle
                  cx={cell.x} cy={cell.y} r={r}
                  fill={color + '22'}
                  stroke={color}
                  strokeWidth="1.8"
                />
                {/* Label */}
                {isPolyLabel ? (
                  <>
                    <text x={cell.x} y={cell.y - 3} textAnchor="middle" fontSize="8" fontWeight="bold" fill={color} style={{ userSelect: 'none' }}>
                      {label.replace(/[⁺⁻¹²³⁴⁰]/g, '')}
                    </text>
                    <text x={cell.x} y={cell.y + 7} textAnchor="middle" fontSize="7" fill={color} opacity="0.7" style={{ userSelect: 'none' }}>
                      {chargeStr(charge)}
                    </text>
                  </>
                ) : (
                  <>
                    <text x={cell.x} y={cell.y + 4} textAnchor="middle" fontSize="11" fontWeight="black" fill={color} style={{ userSelect: 'none' }}>
                      {label}
                    </text>
                    <text x={cell.x + r - 2} y={cell.y - r + 5} textAnchor="middle" fontSize="8" fontWeight="bold" fill={color} style={{ userSelect: 'none' }}>
                      {chargeStr(charge)}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-xs text-slate-300 flex-wrap justify-center">
        <div className="flex items-center gap-2">
          <svg width="18" height="18">
            <circle cx="9" cy="9" r="7" fill={cationColor + '22'} stroke={cationColor} strokeWidth="1.5" />
          </svg>
          <span><span className="font-bold" style={{ color: cationColor }}>{cationLabel}</span> {cationName} ({chargeStr(cationCharge)})</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="18" height="18">
            <circle cx="9" cy="9" r="7" fill={anionColor + '22'} stroke={anionColor} strokeWidth="1.5" />
          </svg>
          <span><span className="font-bold" style={{ color: anionColor }}>{anionLabel}</span> {anionName} ({chargeStr(anionCharge)})</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <svg width="18" height="4">
            <line x1="0" y1="2" x2="18" y2="2" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
          <span>Electrostatic attraction</span>
        </div>
      </div>

      <p className="text-[10px] text-slate-600 text-center max-w-xs">
        Ions repeat in a 3D lattice held together by electrostatic forces. This 2D slice shows the repeating pattern.
      </p>
    </div>
  );
};

export default IonicNetworkView;
