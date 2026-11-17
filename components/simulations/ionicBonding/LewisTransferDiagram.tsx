/**
 * Lewis Dot Transfer Diagram
 * Shows electron transfer from metal to non-metal with arrows
 */

import React from 'react';
import type { IonicCompound, Ion } from './ionEngine';
import { getIonLabel, getIonColor } from './ionEngine';
import { METALS, NONMETALS } from './ionicDatabase';

interface LewisTransferDiagramProps {
  compound?: IonicCompound | null;
  cation?: Ion | null;
  anion?: Ion | null;
}

const LewisTransferDiagram: React.FC<LewisTransferDiagramProps> = ({ compound, cation, anion }) => {
  const activeCation = compound?.cations[0] || cation;
  const activeAnion = compound?.anions[0] || anion;
  const [phase, setPhase] = React.useState<'initial' | 'transferring' | 'complete'>(compound ? 'initial' : 'initial');

  React.useEffect(() => {
    if (compound) {
      setPhase('initial');
      const t1 = setTimeout(() => setPhase('transferring'), 500);
      const t2 = setTimeout(() => setPhase('complete'), 2500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setPhase('initial');
    }
  }, [compound]);

  if (!activeCation || !activeAnion) {
    return (
      <div className="flex items-center justify-center h-[520px] text-slate-500 text-center">
        <p>Select a metal and a non-metal to begin</p>
      </div>
    );
  }

  const cElem = activeCation;
  const aElem = activeAnion;

  // Get valence electrons before ionization
  const cationElement = cElem.element ? METALS[cElem.element] : null;
  const anionElement = aElem.element ? NONMETALS[aElem.element] : null;

  const cationValenceElectrons = cationElement?.valenceElectrons || 0;
  const anionValenceElectrons = anionElement?.valenceElectrons || 0;

  // Determine transfer count. If un-ionized, 0. If ionized, use the cation's positive charge as the number of electrons it loses.
  const transferCount = compound ? (cElem.charge || 1) : 0;

  // Positions for electron dots (8 positions around atom)
  const electronPositions = [
    { dx: 0, dy: -25 }, // Top
    { dx: 18, dy: -18 }, // Top-right
    { dx: 25, dy: 0 }, // Right
    { dx: 18, dy: 18 }, // Bottom-right
    { dx: 0, dy: 25 }, // Bottom
    { dx: -18, dy: 18 }, // Bottom-left
    { dx: -25, dy: 0 }, // Left
    { dx: -18, dy: -18 }, // Top-left
  ];

  // Render electron dots for an atom
  const renderElectronDots = (x: number, y: number, count: number, color: string = '#10b981') => {
    return Array.from({ length: count }).map((_, i) => {
      const pos = electronPositions[i % 8];
      return (
        <circle
          key={`electron-${i}`}
          cx={x + pos.dx}
          cy={y + pos.dy}
          r="3"
          fill={color}
          stroke="#059669"
          strokeWidth="1"
        />
      );
    });
  };

  // SVG dimensions
  const width = 600;
  const height = 300;
  const centerY = height / 2;

  // Positions
  const cationX = 120;
  const anionX = 480;
  const cationY = centerY;
  const anionY = centerY;

  return (
    <div className="relative w-full h-[300px] bg-slate-900/50 rounded-xl border border-slate-600 p-4">
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        {/* Before Ionization and Transfer Animation */}
        {phase !== 'complete' ? (
          <>
            {/* Cation Structure */}
            <g>
              <circle cx={cationX} cy={cationY} r="35" fill={getIonColor(cElem)} opacity="0.3" stroke="#f59e0b" strokeWidth="2" />
              <text x={cationX} y={cationY + 5} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#fff">
                {cElem.element}
              </text>
              {cationElement && renderElectronDots(cationX, cationY, Math.max(0, cationValenceElectrons - transferCount))}
            </g>

            {/* Anion Structure */}
            <g>
              <circle cx={anionX} cy={anionY} r="35" fill={getIonColor(aElem)} opacity="0.3" stroke="#3b82f6" strokeWidth="2" />
              <text x={anionX} y={anionY + 5} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#fff">
                {aElem.element}
              </text>
              {anionElement && renderElectronDots(anionX, anionY, anionValenceElectrons)}
            </g>

            {/* Moving electrons */}
            {compound && Array.from({ length: transferCount }).map((_, i) => {
              const startPos = electronPositions[(cationValenceElectrons - 1 - i + 8) % 8];
              const startX = cationX + startPos.dx;
              const startY = cationY + startPos.dy;
              
              const endPos = electronPositions[(anionValenceElectrons + i) % 8];
              const endX = anionX + endPos.dx;
              const endY = anionY + endPos.dy;

              return (
                <circle
                  key={`moving-e-${i}`}
                  cx={phase === 'initial' ? startX : endX}
                  cy={phase === 'initial' ? startY : endY}
                  r="4"
                  fill="#10b981"
                  stroke="#059669"
                  strokeWidth="1"
                  className="transition-all duration-[2000ms] ease-in-out"
                />
              );
            })}

            {/* Label */}
            <text x={width / 2} y={30} textAnchor="middle" fontSize="16" fill="#94a3b8" fontWeight="bold">
              {phase === 'transferring' ? 'Transferring Electrons...' : 'Initial State (Pre-Reaction)'}
            </text>
          </>
        ) : (
          <>
            {/* After Ionization (Complete) */}
            {/* Cation (ionized) */}
            <g>
              <circle cx={cationX} cy={cationY} r="35" fill={getIonColor(cElem)} opacity="0.7" stroke="#f59e0b" strokeWidth="3" />
              <text x={cationX} y={cationY + 5} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#fff">
                {cElem.element}
              </text>
              <text x={cationX} y={cationY + 65} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#f59e0b">
                {getIonLabel(cElem)}
              </text>
            </g>

            {/* Anion (ionized) */}
            <g>
              <circle cx={anionX} cy={anionY} r="35" fill={getIonColor(aElem)} opacity="0.7" stroke="#3b82f6" strokeWidth="3" />
              <text x={anionX} y={anionY + 5} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#fff">
                {aElem.element}
              </text>
              {/* Show full octet for anion */}
              {anionElement && renderElectronDots(anionX, anionY, 8, '#10b981')}
              <text x={anionX} y={anionY + 65} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#3b82f6">
                {getIonLabel(aElem)}
              </text>
            </g>

            {/* Electron transfer arrow (Static representation) */}
            <g className="animate-pulse">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" fill="#10b981">
                  <polygon points="0 0, 10 3, 0 6" />
                </marker>
              </defs>
              <path
                d={`M ${cationX + 50} ${cationY - 30} Q ${width / 2} ${cationY - 80} ${anionX - 50} ${anionY - 30}`}
                stroke="#10b981"
                strokeWidth="3"
                strokeDasharray="5,5"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
              <text x={width / 2} y={cationY - 90} textAnchor="middle" fontSize="14" fill="#10b981" fontWeight="bold">
                {cElem.charge} e⁻ transferred
              </text>
            </g>

            {/* Label */}
            <text x={width / 2} y={30} textAnchor="middle" fontSize="16" fill="#94a3b8" fontWeight="bold">
              Reaction Complete
            </text>
          </>
        )}
      </svg>

      {/* Helper */}
      {!compound && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-amber-500 font-semibold bg-amber-500/10 px-4 py-2 rounded-full">
          Click "Form Ionic Compound" to start electron transfer
        </div>
      )}
    </div>
  );
};

export default LewisTransferDiagram;
