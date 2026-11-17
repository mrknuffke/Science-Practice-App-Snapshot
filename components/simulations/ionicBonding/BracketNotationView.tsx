/**
 * Bracket Notation View for Ionic Bonding
 * Shows atoms with Bohr diagrams and brackets with charges
 * Includes electron transfer animation
 */

import React, { useState, useEffect } from 'react';
import type { Ion } from './ionEngine';
import { getElectronConfig, getIonLabel } from './ionEngine';
import { METALS, NONMETALS } from './ionicDatabase';

interface BracketNotationViewProps {
  cation: Ion | null;
  anion: Ion | null;
  isIonized: boolean;
}

const BracketNotationView: React.FC<BracketNotationViewProps> = ({ cation, anion, isIonized }) => {
  const [showAnimation, setShowAnimation] = useState(false);

  // Trigger animation when ionization happens
  useEffect(() => {
    if (isIonized && cation && anion) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isIonized, cation, anion]);

  // Parse electron configuration string (e.g., "2,8,1" -> [2, 8, 1])
  const parseConfig = (config: string): number[] => {
    return config.split(',').map(n => parseInt(n.trim(), 10));
  };

  // Render a Bohr model with bracket notation
  const renderBohrWithBracket = (
    x: number,
    y: number,
    ion: Ion,
    isIonized: boolean
  ) => {
    if (!ion.element) return null;

    const nucleusRadius = 20;
    const shellSpacing = 25;

    // Get electron configuration
    const config = ion.element
      ? getElectronConfig(ion.element, isIonized, isIonized ? ion.charge : 0)
      : '';
    const shells = config ? parseConfig(config) : [];

    // Calculate bracket dimensions
    const maxShellRadius = nucleusRadius + shells.length * shellSpacing;
    const bracketHeight = maxShellRadius * 2 + 40;
    const _bracketWidth = maxShellRadius * 2 + 40;

    // Get element info
    const elementInfo = METALS[ion.element] || NONMETALS[ion.element];
    const elementColor = elementInfo?.color || '#64748b';

    return (
      <g>
        {/* Bracket (only for ionized) */}
        {isIonized && (
          <g>
            {/* Left bracket */}
            <path
              d={`M ${x - maxShellRadius - 20} ${y - bracketHeight / 2}
                  L ${x - maxShellRadius - 30} ${y - bracketHeight / 2}
                  L ${x - maxShellRadius - 30} ${y + bracketHeight / 2}
                  L ${x - maxShellRadius - 20} ${y + bracketHeight / 2}`}
              stroke={elementColor}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            {/* Right bracket */}
            <path
              d={`M ${x + maxShellRadius + 20} ${y - bracketHeight / 2}
                  L ${x + maxShellRadius + 30} ${y - bracketHeight / 2}
                  L ${x + maxShellRadius + 30} ${y + bracketHeight / 2}
                  L ${x + maxShellRadius + 20} ${y + bracketHeight / 2}`}
              stroke={elementColor}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            {/* Charge notation */}
            <text
              x={x + maxShellRadius + 40}
              y={y - bracketHeight / 2 + 20}
              fontSize="24"
              fontWeight="bold"
              fill={elementColor}
            >
              {ion.charge > 0 ? `${ion.charge}+` : `${Math.abs(ion.charge)}−`}
            </text>
          </g>
        )}

        {/* Nucleus */}
        <circle
          cx={x}
          cy={y}
          r={nucleusRadius}
          fill={elementColor}
          stroke="#475569"
          strokeWidth="2"
        />
        <text
          x={x}
          y={y + 6}
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#fff"
        >
          {ion.element}
        </text>

        {/* Electron shells */}
        {shells.map((electronCount, shellIndex) => {
          const shellRadius = nucleusRadius + (shellIndex + 1) * shellSpacing;

          return (
            <g key={`shell-group-${shellIndex}`}>
              {/* Shell circle */}
              <circle
                cx={x}
                cy={y}
                r={shellRadius}
                fill="none"
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />

              {/* Electrons on this shell */}
              {Array.from({ length: electronCount }).map((_, i) => {
                const angle = (i * 2 * Math.PI) / electronCount;
                const ex = x + shellRadius * Math.cos(angle);
                const ey = y + shellRadius * Math.sin(angle);

                return (
                  <circle
                    key={`electron-${shellIndex}-${i}`}
                    cx={ex}
                    cy={ey}
                    r="4"
                    fill="#10b981"
                    stroke="#059669"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
          );
        })}

        {/* Element label below */}
        <text
          x={x}
          y={y + maxShellRadius + 30}
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill={elementColor}
        >
          {isIonized ? getIonLabel(ion) : ion.element}
        </text>
      </g>
    );
  };

  // Render electron transfer animation
  const renderElectronTransfer = () => {
    if (!showAnimation || !cation || !anion || !cation.element) return null;

    const electronCount = Math.abs(cation.charge);
    const electrons = [];

    for (let i = 0; i < electronCount; i++) {
      const delay = i * 200; // Stagger the electrons
      electrons.push(
        <g key={`transfer-${i}`}>
          {/* Animated electron */}
          <circle r="5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2">
            <animateMotion
              dur="1s"
              begin={`${delay}ms`}
              fill="freeze"
              path="M 200 260 Q 400 200 600 260"
            />
          </circle>
        </g>
      );
    }

    return <g>{electrons}</g>;
  };

  const width = 800;
  const height = 520;

  return (
    <div className="relative w-full h-[520px] bg-slate-900/50 rounded-xl border border-slate-600">
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Show message if no atoms selected */}
        {!cation && !anion && (
          <text x={width / 2} y={height / 2} textAnchor="middle" fontSize="18" fill="#94a3b8">
            Select a metal and a non-metal to begin
          </text>
        )}

        {/* Cation (left side) */}
        {cation && renderBohrWithBracket(200, 260, cation, isIonized)}

        {/* Anion (right side) */}
        {anion && renderBohrWithBracket(600, 260, anion, isIonized)}

        {/* Electron transfer animation */}
        {renderElectronTransfer()}

        {/* Arrow and label when ionized */}
        {isIonized && cation && anion && !showAnimation && (
          <g>
            <defs>
              <marker
                id="arrow-transfer"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                fill="#10b981"
              >
                <polygon points="0 0, 10 3, 0 6" />
              </marker>
            </defs>
            <line
              x1={320}
              y1={height / 2}
              x2={480}
              y2={height / 2}
              stroke="#10b981"
              strokeWidth="2"
              markerEnd="url(#arrow-transfer)"
              strokeDasharray="4 2"
            />
            <text
              x={width / 2}
              y={height / 2 - 15}
              textAnchor="middle"
              fontSize="14"
              fill="#10b981"
              fontWeight="bold"
            >
              {Math.abs(cation.charge)} e⁻ transferred
            </text>
          </g>
        )}

        {/* Instructions */}
        {cation && anion && !isIonized && (
          <text
            x={width / 2}
            y={height - 30}
            textAnchor="middle"
            fontSize="14"
            fill="#a78bfa"
            fontWeight="bold"
          >
            Click "Form Ionic Compound" to transfer electrons →
          </text>
        )}
      </svg>
    </div>
  );
};

export default BracketNotationView;
