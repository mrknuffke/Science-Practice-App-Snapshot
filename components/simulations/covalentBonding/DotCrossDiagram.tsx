/**
 * Dot-Cross Lewis Diagram Visualization
 * Shows valence electrons as dots (one atom) and crosses (another atom)
 */

import React from 'react';
import type { Molecule } from '../../../types';
import { ATOM_COLORS } from './moleculeDatabase';
import { getCardinalElectronPlacement } from './cardinalSlots';

interface DotCrossDiagramProps {
  molecule: Molecule;
}

const DotCrossDiagram: React.FC<DotCrossDiagramProps> = ({ molecule }) => {
  if (molecule.atoms.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-center p-8">
        <p>Build a molecule to see its Lewis structure</p>
      </div>
    );
  }

  // Calculate viewBox based on atom positions
  const padding = 100;
  const minX = Math.min(...molecule.atoms.map(a => a.position.x)) - padding;
  const maxX = Math.max(...molecule.atoms.map(a => a.position.x)) + padding;
  const minY = Math.min(...molecule.atoms.map(a => a.position.y)) - padding;
  const maxY = Math.max(...molecule.atoms.map(a => a.position.y)) + padding;

  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  // Determine which electrons are dots vs crosses
  // First atom in each bond gets dots, second gets crosses
  const electronStyles: Record<string, Record<number, 'dot' | 'cross'>> = {};

  molecule.bonds.forEach((bond) => {
    if (!electronStyles[bond.atom1Id]) electronStyles[bond.atom1Id] = {};
    if (!electronStyles[bond.atom2Id]) electronStyles[bond.atom2Id] = {};

    // Assign electron positions for this bond
    const electronsPerBond = bond.type === 'single' ? 2 : bond.type === 'double' ? 4 : 6;
    for (let i = 0; i < electronsPerBond / 2; i++) {
      const _key = `${bond.id}-${i}`;
      electronStyles[bond.atom1Id][i] = 'dot';
      electronStyles[bond.atom2Id][i] = 'cross';
    }
  });

  // Bonding electrons render along each bond's direction (between atoms);
  // lone pairs snap to cardinal slots (N/E/S/W) not already claimed by bonds.
  // See cardinalSlots.ts for the slot-allocation algorithm.
  const ATOM_RADIUS = 25;
  const LONE_PAIR_DIST = ATOM_RADIUS + 14;
  const PAIR_SPREAD = 6;

  type SlotResult = { ex1: number; ey1: number; ex2: number; ey2: number; role: 'bonding' | 'lonePair' }[];

  const getElectronSlots = (atom: typeof molecule.atoms[0]): SlotResult => {
    const { x, y } = atom.position;
    const slots: SlotResult = [];

    // 1. Bonding electrons: along each bond direction.
    molecule.bonds.forEach(bond => {
      let other: typeof molecule.atoms[0] | undefined;
      if (bond.atom1Id === atom.id) other = molecule.atoms.find(a => a.id === bond.atom2Id);
      else if (bond.atom2Id === atom.id) other = molecule.atoms.find(a => a.id === bond.atom1Id);
      if (!other) return;
      const rdx = other.position.x - x;
      const rdy = other.position.y - y;
      const len = Math.sqrt(rdx * rdx + rdy * rdy);
      if (len === 0) return;
      const dx = rdx / len;
      const dy = rdy / len;
      const pairsInBond = bond.type === 'single' ? 1 : bond.type === 'double' ? 2 : 3;
      const perpX = -dy;
      const perpY = dx;
      for (let b = 0; b < pairsInBond; b++) {
        const pOffset = pairsInBond === 1 ? 0 : (b - (pairsInBond - 1) / 2) * 8;
        const bx = x + dx * (ATOM_RADIUS + 10) + perpX * pOffset;
        const by = y + dy * (ATOM_RADIUS + 10) + perpY * pOffset;
        slots.push({
          ex1: bx - perpX * PAIR_SPREAD,
          ey1: by - perpY * PAIR_SPREAD,
          ex2: bx + perpX * PAIR_SPREAD,
          ey2: by + perpY * PAIR_SPREAD,
          role: 'bonding',
        });
      }
    });

    // 2. Lone pairs at cardinal slots.
    const lonePairCount = Math.floor(atom.electronAssignments.lonePairs / 2);
    if (lonePairCount === 0) return slots;

    const { lonePairAngles } = getCardinalElectronPlacement(atom, molecule, lonePairCount, 0);
    for (const angle of lonePairAngles) {
      const cdx = Math.cos(angle);
      const cdy = Math.sin(angle);
      const midX = x + cdx * LONE_PAIR_DIST;
      const midY = y + cdy * LONE_PAIR_DIST;
      const perpX = -cdy;
      const perpY = cdx;
      slots.push({
        ex1: midX - perpX * PAIR_SPREAD,
        ey1: midY - perpY * PAIR_SPREAD,
        ex2: midX + perpX * PAIR_SPREAD,
        ey2: midY + perpY * PAIR_SPREAD,
        role: 'lonePair',
      });
    }

    return slots;
  };

  return (
    <div className="relative w-full h-[400px] bg-slate-900/50 rounded-xl border border-slate-600">
      <svg className="w-full h-full" viewBox={viewBox}>
        {/* Draw bonds first (under atoms) */}
        {molecule.bonds.map((bond) => {
          const atom1 = molecule.atoms.find(a => a.id === bond.atom1Id);
          const atom2 = molecule.atoms.find(a => a.id === bond.atom2Id);
          if (!atom1 || !atom2) return null;

          const x1 = atom1.position.x;
          const y1 = atom1.position.y;
          const x2 = atom2.position.x;
          const y2 = atom2.position.y;

          // Calculate perpendicular offset
          const dx = x2 - x1;
          const dy = y2 - y1;
          const length = Math.sqrt(dx * dx + dy * dy);

          if (length === 0) return null;

          // Draw lines from edge to edge instead of center to center
          const linePad = 28; // slightly larger than atom radius
          
          // Normalized direction vector
          const nx = dx / length;
          const ny = dy / length;
          
          // Start and end points for the bond line
          const startX = x1 + nx * linePad;
          const startY = y1 + ny * linePad;
          const endX = x2 - nx * linePad;
          const endY = y2 - ny * linePad;

          // Calculate perpendicular offset for double/triple bonds
          const offsetX = (-ny) * 5;
          const offsetY = (nx) * 5;

          if (bond.type === 'single') {
            return (
              <line
                key={bond.id}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            );
          } else if (bond.type === 'double') {
            return (
              <g key={bond.id}>
                <line
                  x1={startX + offsetX}
                  y1={startY + offsetY}
                  x2={endX + offsetX}
                  y2={endY + offsetY}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                <line
                  x1={startX - offsetX}
                  y1={startY - offsetY}
                  x2={endX - offsetX}
                  y2={endY - offsetY}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              </g>
            );
          } else {
            return (
              <g key={bond.id}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                <line
                  x1={startX + offsetX * 1.5}
                  y1={startY + offsetY * 1.5}
                  x2={endX + offsetX * 1.5}
                  y2={endY + offsetY * 1.5}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                <line
                  x1={startX - offsetX * 1.5}
                  y1={startY - offsetY * 1.5}
                  x2={endX - offsetX * 1.5}
                  y2={endY - offsetY * 1.5}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              </g>
            );
          }
        })}

        {/* Draw atoms with electrons */}
        {molecule.atoms.map((atom, atomIndex) => {
          const { x, y } = atom.position;
          const slots = getElectronSlots(atom);
          const style = atomIndex === 0 ? 'dot' : 'cross';

          const renderElectron = (ex: number, ey: number, role: 'bonding' | 'lonePair', key: string) => {
            const color = role === 'bonding' ? '#10b981' : '#f59e0b';
            const strokeColor = role === 'bonding' ? '#059669' : '#d97706';
            if (style === 'dot') {
              return (
                <circle key={key} cx={ex} cy={ey} r="3" fill={color} stroke={strokeColor} strokeWidth="1" />
              );
            } else {
              const s = 4;
              return (
                <g key={key}>
                  <line x1={ex - s} y1={ey - s} x2={ex + s} y2={ey + s} stroke={color} strokeWidth="2" strokeLinecap="round" />
                  <line x1={ex - s} y1={ey + s} x2={ex + s} y2={ey - s} stroke={color} strokeWidth="2" strokeLinecap="round" />
                </g>
              );
            }
          };

          return (
            <g key={atom.id}>
              {/* Atom circle */}
              <circle cx={x} cy={y} r={ATOM_RADIUS} fill={ATOM_COLORS[atom.element]} stroke="#475569" strokeWidth="2" />

              {/* Element symbol */}
              <text x={x} y={y + 6} textAnchor="middle" fontSize="20" fontWeight="bold" fill={atom.element === 'H' ? '#000' : '#fff'}>
                {atom.element}
              </text>

              {/* Electrons rendered from computed slots */}
              {slots.map((slot, si) => (
                <g key={`${atom.id}-slot-${si}`}>
                  {renderElectron(slot.ex1, slot.ey1, slot.role, `${atom.id}-e-${si}-1`)}
                  {renderElectron(slot.ex2, slot.ey2, slot.role, `${atom.id}-e-${si}-2`)}
                </g>
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-slate-800/90 border border-slate-600 rounded-lg p-3 text-xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span>Bonding electrons (dots/crosses)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span>Lone pair electrons</span>
        </div>
      </div>
    </div>
  );
};

export default DotCrossDiagram;
