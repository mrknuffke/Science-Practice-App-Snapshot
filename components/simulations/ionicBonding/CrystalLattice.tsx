/**
 * 2D Crystal Lattice Visualization
 * Shows repeating pattern of cations and anions in a grid
 */

import React from 'react';
import type { IonicCompound, Ion } from './ionEngine';
import { getIonLabel, getIonColor, getIonSize } from './ionEngine';

interface CrystalLatticeProps {
  compound: IonicCompound;
}

const CrystalLattice: React.FC<CrystalLatticeProps> = ({ compound }) => {
  if (compound.cations.length === 0 || compound.anions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-center p-8">
        <p>Build an ionic compound to see its crystal lattice</p>
      </div>
    );
  }

  if (!compound.isBalanced) {
    return (
      <div className="flex items-center justify-center h-full text-amber-500 text-center p-8">
        <p>⚠️ Balance charges to view crystal lattice structure</p>
      </div>
    );
  }

  const cation = compound.cations[0];
  const anion = compound.anions[0];

  // Determine lattice pattern based on formula ratio
  // For simplicity, we'll show a 5x5 grid with alternating pattern
  const gridSize = 5;
  const cellSize = 60;
  const padding = 40;
  const width = gridSize * cellSize + padding * 2;
  const height = gridSize * cellSize + padding * 2;

  // Simple alternating pattern (like NaCl)
  // For 1:1 ratio: checkerboard
  // For 1:2 ratio: cation surrounded by 4 anions (simplified)
  const is1to1 = cation.count === 1 && anion.count === 1;
  const is1to2 = (cation.count === 1 && anion.count === 2) || (cation.count === 2 && anion.count === 1);
  const _is2to3 = (cation.count === 2 && anion.count === 3) || (cation.count === 3 && anion.count === 2);

  const renderLatticePattern = () => {
    const ions: Array<{ x: number; y: number; ion: Ion; size: number }> = [];

    if (is1to1) {
      // Checkerboard pattern (like NaCl)
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const x = padding + col * cellSize + cellSize / 2;
          const y = padding + row * cellSize + cellSize / 2;

          // Alternate between cation and anion
          const isCation = (row + col) % 2 === 0;
          const ion = isCation ? cation : anion;
          const size = Math.min(40, getIonSize(ion));

          ions.push({ x, y, ion, size });
        }
      }
    } else if (is1to2) {
      // CaCl2-like pattern: Cations at (0,0), (2,1), (4,2)... Anions fill remaining
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const x = padding + col * cellSize + cellSize / 2;
          const y = padding + row * cellSize + cellSize / 2;

          // More anions than cations
          const isCation = (row * 2 + col) % 3 === 0;
          const ion = isCation ? cation : anion;
          const size = Math.min(40, getIonSize(ion));

          ions.push({ x, y, ion, size });
        }
      }
    } else {
      // Default: alternating pattern for complex ratios
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const x = padding + col * cellSize + cellSize / 2;
          const y = padding + row * cellSize + cellSize / 2;

          const isCation = (row + col) % 2 === 0;
          const ion = isCation ? cation : anion;
          const size = Math.min(40, getIonSize(ion));

          ions.push({ x, y, ion, size });
        }
      }
    }

    return ions.map((item, idx) => {
      const color = getIonColor(item.ion);
      const _label = getIonLabel(item.ion);
      const isCation = item.ion.type === 'cation' || item.ion.charge > 0;

      return (
        <g key={idx}>
          {/* Ion sphere */}
          <circle
            cx={item.x}
            cy={item.y}
            r={item.size / 2}
            fill={color}
            opacity="0.8"
            stroke={isCation ? '#f59e0b' : '#3b82f6'}
            strokeWidth="2"
          />

          {/* Ion label */}
          <text
            x={item.x}
            y={item.y + 4}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill={item.ion.element === 'F' || item.ion.element === 'Cl' ? '#000' : '#fff'}
          >
            {item.ion.element || (item.ion.polyatomicId ? item.ion.polyatomicId : '')}
          </text>

          {/* Charge indicator */}
          <text
            x={item.x}
            y={item.y - item.size / 2 - 5}
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill={isCation ? '#f59e0b' : '#3b82f6'}
          >
            {isCation ? '+' : '-'}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="relative w-full h-[400px] bg-slate-900/50 rounded-xl border border-slate-600 overflow-hidden">
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines (optional) */}
        <g opacity="0.1">
          {Array.from({ length: gridSize + 1 }).map((_, i) => (
            <React.Fragment key={`grid-${i}`}>
              <line
                x1={padding}
                y1={padding + i * cellSize}
                x2={padding + gridSize * cellSize}
                y2={padding + i * cellSize}
                stroke="#94a3b8"
                strokeWidth="1"
              />
              <line
                x1={padding + i * cellSize}
                y1={padding}
                x2={padding + i * cellSize}
                y2={padding + gridSize * cellSize}
                stroke="#94a3b8"
                strokeWidth="1"
              />
            </React.Fragment>
          ))}
        </g>

        {/* Lattice pattern */}
        {renderLatticePattern()}

        {/* Title */}
        <text x={width / 2} y={25} textAnchor="middle" fontSize="14" fill="#94a3b8" fontWeight="bold">
          2D Crystal Lattice Structure
        </text>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 border border-slate-600 rounded-lg p-3 text-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-amber-500"></div>
          <span>Cation (+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-blue-500"></div>
          <span>Anion (-)</span>
        </div>
        <div className="text-slate-400 mt-2">
          Ions arranged in repeating 3D pattern
        </div>
      </div>
    </div>
  );
};

export default CrystalLattice;
