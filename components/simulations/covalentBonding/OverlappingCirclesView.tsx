/**
 * Overlapping Circles Visualization
 * Shows covalent bonding with overlapping circles and dot/cross electrons
 * Based on the reference simulation style
 */

import React from 'react';
import type { Molecule } from '../../../types';
import { ATOM_COLORS } from './moleculeDatabase';
import { getCardinalElectronPlacement } from './cardinalSlots';

interface OverlappingCirclesViewProps {
  molecule: Molecule;
}

const OverlappingCirclesView: React.FC<OverlappingCirclesViewProps> = ({ molecule }) => {
  if (molecule.atoms.length === 0) {
    return null;
  }

  // Atomic radii for visual scaling
  const ATOM_RADII: Record<string, number> = {
    H: 30, // Hydrogen
    C: 55, // Carbon
    N: 50, // Nitrogen
    O: 45, // Oxygen
    F: 40, // Fluorine
    Cl: 65, // Chlorine
  };

  return (
    <>
      {/* Draw bonds as overlapping regions with shared electrons */}
      {molecule.bonds.map((bond) => {
        const atom1 = molecule.atoms.find(a => a.id === bond.atom1Id);
        const atom2 = molecule.atoms.find(a => a.id === bond.atom2Id);
        if (!atom1 || !atom2) return null;

        const x1 = atom1.position.x;
        const y1 = atom1.position.y;
        const x2 = atom2.position.x;
        const y2 = atom2.position.y;

        // Calculate midpoint for shared electrons
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        // Calculate angle between atoms
        const angle = Math.atan2(y2 - y1, x2 - x1);

        // Number of electron pairs to show
        const electronPairs = bond.type === 'single' ? 1 : bond.type === 'double' ? 2 : 3;

        // Render shared electrons in the overlap region
        const sharedElectrons = [];
        for (let i = 0; i < electronPairs; i++) {
          // Position electrons perpendicular to the bond
          const perpOffset = (i - (electronPairs - 1) / 2) * 10;
          const ex = midX + Math.cos(angle + Math.PI / 2) * perpOffset;
          const ey = midY + Math.sin(angle + Math.PI / 2) * perpOffset;

          // Alternate dots and crosses
          if (i % 2 === 0) {
            // Dot from atom1
            sharedElectrons.push(
              <circle
                key={`${bond.id}-e${i}-1`}
                cx={ex - 3}
                cy={ey}
                r="2.5"
                fill={ATOM_COLORS[atom1.element]}
                stroke="none"
              />
            );
            sharedElectrons.push(
              <circle
                key={`${bond.id}-e${i}-2`}
                cx={ex + 3}
                cy={ey}
                r="2.5"
                fill={ATOM_COLORS[atom2.element]}
                stroke="none"
              />
            );
          } else {
            // Cross from atom2
            const crossSize = 3;
            sharedElectrons.push(
              <g key={`${bond.id}-e${i}`}>
                <line
                  x1={ex - crossSize}
                  y1={ey - crossSize}
                  x2={ex + crossSize}
                  y2={ey + crossSize}
                  stroke={ATOM_COLORS[atom1.element]}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1={ex - crossSize}
                  y1={ey + crossSize}
                  x2={ex + crossSize}
                  y2={ey - crossSize}
                  stroke={ATOM_COLORS[atom2.element]}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
            );
          }
        }

        return (
          <g key={bond.id}>
            {sharedElectrons}
          </g>
        );
      })}

      {/* Draw atoms as circles with lone pair electrons */}
      {molecule.atoms.map((atom) => {
        const { x, y } = atom.position;
        const radius = ATOM_RADII[atom.element] || 45;

        // Unbonded atoms show initial valence electrons
        // Bonded atoms show calculated lone pairs
        const isUnbonded = atom.bonds.length === 0;
        let lonePairs = 0;
        let singles = 0;

        if (isUnbonded) {
           const v = atom.electronAssignments.available;
           if (v <= 4) { singles = v; lonePairs = 0; }
           else { lonePairs = v - 4; singles = 8 - v; }
        } else {
           lonePairs = Math.floor(atom.electronAssignments.lonePairs / 2);
           singles = atom.electronAssignments.lonePairs % 2;
        }

        // Snap lone pairs and unpaired electrons to cardinal slots (N/E/S/W).
        // Bonds claim the cardinal nearest each bond direction; lone pairs and
        // singles fill remaining cardinals (perpendicular-to-bond preferred).
        const { lonePairAngles, unpairedAngles } = getCardinalElectronPlacement(
          atom,
          molecule,
          lonePairs,
          singles,
        );
        const placementAngles: { angle: number; isPair: boolean }[] = [
          ...lonePairAngles.map(angle => ({ angle, isPair: true })),
          ...unpairedAngles.map(angle => ({ angle, isPair: false })),
        ];

        const lonePairElectrons: React.ReactNode[] = [];
        let electronIndex = 0;
        const distance = radius - 12;

        placementAngles.forEach(({ angle, isPair }) => {
          const ex = x + Math.cos(angle) * distance;
          const ey = y + Math.sin(angle) * distance;
          // For a pair, separate the two electrons perpendicular to the radial direction
          const perpX = -Math.sin(angle);
          const perpY = Math.cos(angle);

          if (isPair) {
            lonePairElectrons.push(
              <circle key={`${atom.id}-e${electronIndex++}`} cx={ex - perpX * 3} cy={ey - perpY * 3} r="2.5" fill={ATOM_COLORS[atom.element]} stroke="none" />
            );
            lonePairElectrons.push(
              <circle key={`${atom.id}-e${electronIndex++}`} cx={ex + perpX * 3} cy={ey + perpY * 3} r="2.5" fill={ATOM_COLORS[atom.element]} stroke="none" />
            );
          } else {
            lonePairElectrons.push(
              <circle key={`${atom.id}-e${electronIndex++}`} cx={ex} cy={ey} r="2.5" fill={ATOM_COLORS[atom.element]} stroke="none" />
            );
          }
        });

        return (
          <g key={atom.id}>
            {/* Atom circle (outline only) */}
            <circle
              cx={x}
              cy={y}
              r={radius}
              fill="none"
              stroke={ATOM_COLORS[atom.element]}
              strokeWidth="3"
            />

            {/* Element symbol */}
            <text
              x={x}
              y={y + 8}
              textAnchor="middle"
              fontSize="28"
              fontWeight="bold"
              fill={ATOM_COLORS[atom.element]}
            >
              {atom.element}
            </text>

            {/* Lone pair electrons */}
            {lonePairElectrons}
          </g>
        );
      })}
    </>
  );
};

export default OverlappingCirclesView;
