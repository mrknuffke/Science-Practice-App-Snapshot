import React from 'react';
import { Element, CATEGORY_COLORS } from './periodicTableData';

interface BohrModelAtomProps {
  element: Element;
  size?: number;
}

export const BohrModelAtom: React.FC<BohrModelAtomProps> = ({ element, size = 200 }) => {
  // Parse simple electron configuration (extract energy shells)
  // For period 1-7, the number of shells is the period.
  // We can calculate electrons per shell based on atomic number simply by following standard rules,
  // but it's easier to use a known list or algorithm.
  
  const getShells = (atomicNumber: number): number[] => {
    // simplified shell calculation up to Z=118
    const _maxElectrons = [2, 8, 18, 32, 32, 18, 8];
    let _remaining = atomicNumber;
    let _shells: number[] = [];
    
    // Instead of complex parsing, just use period/group logic or known shells.
    // For exact shells, since we don't have the explicit array in periodicTableData,
    // we do an approximation of principal quantum numbers.
    // Better yet, we can parse the semantic string we have, e.g., "[Ar] 4s2 3d10 4p5" -> but that's subshells.
    // A robust way to get electrons per shell (K, L, M, N, O, P, Q):
    const e = atomicNumber;
    if (e === 1) return [1];
    if (e === 2) return [2];
    
    if (e <= 10) return [2, e - 2];
    if (e <= 18) return [2, 8, e - 10];
    
    if (e <= 36) {
      if (e <= 20) return [2, 8, 8, e - 18];
      if (e <= 30) return [2, 8, 8 + (e - 20), 2]; // Transition metals approximated
      return [2, 8, 18, e - 28];
    }
    
    if (e <= 54) {
      if (e <= 38) return [2, 8, 18, 8, e - 36];
      if (e <= 48) return [2, 8, 18, 8 + (e - 38), 2];
      return [2, 8, 18, 18, e - 46];
    }
    
    if (e <= 86) {
      if (e <= 56) return [2, 8, 18, 18, 8, e - 54];
      if (e <= 70) return [2, 8, 18, 18 + (e - 56), 8, 2]; // Lanthanides
      if (e <= 80) return [2, 8, 18, 32, 8 + (e - 70), 2];
      return [2, 8, 18, 32, 18, e - 78];
    }
    
    if (e <= 118) {
      if (e <= 88) return [2, 8, 18, 32, 18, 8, e - 86];
      if (e <= 102) return [2, 8, 18, 32, 18 + (e - 88), 8, 2]; // Actinides
      if (e <= 112) return [2, 8, 18, 32, 32, 8 + (e - 102), 2];
      return [2, 8, 18, 32, 32, 18, e - 110];
    }
    
    return [2, 8, 18, 32, 32, 18, 8]; // placeholder
  };

  const shells = getShells(element.atomicNumber);
  const color = CATEGORY_COLORS[element.category] || '#94a3b8';
  
  const center = size / 2;
  const nucleusRadius = size * 0.12;
  const maxShellRadius = size * 0.45;
  const shellStep = (maxShellRadius - nucleusRadius) / Math.max(shells.length, 1);

  return (
    <div className="flex flex-col items-center justify-center bg-slate-900 rounded-xl p-4 shadow-inner" style={{ width: '100%' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Nucleus */}
        <circle cx={center} cy={center} r={nucleusRadius} fill={color} />
        <text x={center} y={center + nucleusRadius * 0.3} textAnchor="middle" fontSize={nucleusRadius * 0.8} fontWeight="bold" fill="#fff" className="font-sans">
          {element.symbol}
        </text>

        {/* Shells & Electrons */}
        {shells.map((count, i) => {
          const r = nucleusRadius + shellStep * (i + 1);
          // Calculate an animation duration based on distance so outer shells rotate slightly slower
          const duration = 10 + i * 5; 
          const direction = i % 2 === 0 ? 1 : -1; // alternate rotation direction

          return (
            <g key={`shell-${i}`}>
              <circle cx={center} cy={center} r={r} fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
              <g>
                <animateTransform 
                  attributeName="transform" 
                  type="rotate" 
                  from={`0 ${center} ${center}`} 
                  to={`${360 * direction} ${center} ${center}`} 
                  dur={`${duration}s`} 
                  repeatCount="indefinite" 
                />
                {Array.from({ length: count }).map((_, j) => {
                  const angle = (j * 2 * Math.PI) / count;
                  const cx = center + r * Math.cos(angle);
                  const cy = center + r * Math.sin(angle);
                  return (
                    <circle 
                      key={`electron-${i}-${j}`} 
                      cx={cx} 
                      cy={cy} 
                      r={Math.max(2, size * 0.015)} 
                      fill="#FCD34D" 
                      stroke="#B45309"
                      strokeWidth="0.5" 
                    />
                  );
                })}
              </g>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 text-xs text-slate-400 font-mono">
        Shells: {shells.join(', ')}
      </div>
    </div>
  );
};
