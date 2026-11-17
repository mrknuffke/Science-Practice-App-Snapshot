/**
 * Lewis Ion Component
 * Renders an atom or ion with Lewis dot diagram, brackets, and charge.
 */

import React from 'react';
import { IonicAtom } from './ionicBuilderEngine';
import { METALS, NONMETALS, POLYATOMIC_IONS } from './ionicDatabase';

interface LewisIonProps {
  atom: IonicAtom;
  showBrackets: boolean;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  isTransferringFrom?: boolean; // True if this atom is currently losing an electron
}

const LewisIon: React.FC<LewisIonProps> = ({
  atom,
  showBrackets,
  onSelect,
  isSelected,
  isTransferringFrom = false
}) => {
  const isPolyatomic = !!atom.polyatomicId;
  const polyInfo = atom.polyatomicId ? POLYATOMIC_IONS[atom.polyatomicId] : null;
  const monoInfo = METALS[atom.element] || NONMETALS[atom.element];
  const color = polyInfo?.color ?? monoInfo?.color ?? '#94A3B8';
  // Polyatomic ions need a slightly larger circle to fit the formula label
  const radius = isPolyatomic ? 52 : 40;
  
  // Use current position or target position if it's "bonded" (this can be handled by a parent transition too)
  const { x, y } = atom.position;

  // Render a single electron (dot or cross)
  const renderElectron = (ex: number, ey: number, key: string, style: 'dot' | 'cross') => {
    if (style === 'dot') {
      return <circle key={key} cx={ex} cy={ey} r={3.5} fill={color} />;
    } else {
      const crossSize = 3.5;
      return (
        <g key={key}>
          <line x1={ex - crossSize * 0.7} y1={ey - crossSize * 0.7} x2={ex + crossSize * 0.7} y2={ey + crossSize * 0.7} stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          <line x1={ex - crossSize * 0.7} y1={ey + crossSize * 0.7} x2={ex + crossSize * 0.7} y2={ey - crossSize * 0.7} stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
    }
  };

  // Lewis dot positions (approximate cardinal and diagonal)
  const getElectronPos = (index: number) => {
    const spacing = 10;
    const dist = radius + 8;
    const angles = [
      -Math.PI / 2, -Math.PI / 2, // North
      0, 0,                      // East
      Math.PI / 2, Math.PI / 2,   // South
      Math.PI, Math.PI             // West
    ];
    const offsets = [
      -spacing / 2, spacing / 2,
      -spacing / 2, spacing / 2,
      -spacing / 2, spacing / 2,
      -spacing / 2, spacing / 2
    ];

    const angle = angles[index];
    const offset = offsets[index];

    const perpAngle = angle + Math.PI / 2;
    return {
      x: x + dist * Math.cos(angle) + offset * Math.cos(perpAngle),
      y: y + dist * Math.sin(angle) + offset * Math.sin(perpAngle)
    };
  };

  const electrons: React.ReactNode[] = [];
  const fillingOrder = [0, 2, 4, 6, 1, 3, 5, 7];

  // Polyatomic ions and pre-ionized monoatomics don't show individual electrons
  const isPreIonized = !isPolyatomic && atom.isIonized && atom.currentValence === 0 && atom.initialValence > 0;
  if (!isPolyatomic && !isPreIonized) {
    if (atom.type === 'anion') {
      // Render initial valence as crosses
      for (let i = 0; i < atom.initialValence; i++) {
          const pos = getElectronPos(fillingOrder[i]);
          electrons.push(renderElectron(pos.x, pos.y, `initial-${i}`, 'cross'));
      }
      // Render transferred as dots
      for (let i = 0; i < atom.transferredElectrons; i++) {
          const idx = atom.initialValence + i;
          if (idx >= 8) break;
          const pos = getElectronPos(fillingOrder[idx]);
          electrons.push(renderElectron(pos.x, pos.y, `transferred-${i}`, 'dot'));
      }
    } else {
      // Cation: Render remaining valence as dots
      // If transferring, hide the last electron (it's animating separately)
      const electronsToShow = isTransferringFrom ? atom.currentValence - 1 : atom.currentValence;
      for (let i = 0; i < electronsToShow; i++) {
          const pos = getElectronPos(fillingOrder[i]);
          electrons.push(renderElectron(pos.x, pos.y, `remaining-${i}`, 'dot'));
      }
    }
  }

  // Bracket rendering
  const renderBrackets = () => {
    if (!showBrackets) return null;
    const bSize = radius + 20;
    const bThickness = 2;
    const bracketPadding = 5;

    return (
      <g stroke={color} strokeWidth={bThickness} fill="none" opacity="0.6">
        {/* Left Bracket */}
        <path d={`M ${x - bSize + bracketPadding} ${y - bSize} L ${x - bSize} ${y - bSize} L ${x - bSize} ${y + bSize} L ${x - bSize + bracketPadding} ${y + bSize}`} />
        {/* Right Bracket */}
        <path d={`M ${x + bSize - bracketPadding} ${y - bSize} L ${x + bSize} ${y - bSize} L ${x + bSize} ${y + bSize} L ${x + bSize - bracketPadding} ${y + bSize}`} />
      </g>
    );
  };

  // Charge label
  const renderCharge = () => {
    if (atom.charge === 0) return null;
    const chargeAbs = Math.abs(atom.charge);
    const chargeSign = atom.charge > 0 ? '+' : '-';
    // Use the 1+, 2+, etc convention or just + / - for 1
    const chargeLabel = chargeAbs === 1 ? chargeSign : `${chargeAbs}${chargeSign}`;

    // Position charge inside the top-right corner of the bracket
    return (
      <text
        x={x + radius + 10}
        y={y - radius + 5}
        fontSize="14"
        fontWeight="bold"
        fill={color}
        textAnchor="start"
      >
        {chargeLabel}
      </text>
    );
  };

  return (
    <g 
      className="cursor-pointer transition-all duration-300"
      onClick={() => onSelect?.(atom.id)}
    >
      {/* Selection Glow */}
      {isSelected && (
        <circle 
          cx={x} cy={y} r={radius + 15} 
          fill="none" 
          stroke="#fbbf24" 
          strokeWidth="3" 
          strokeDasharray="4 4"
          className="animate-spin-slow"
        />
      )}

      {/* Main Atom Circle */}
      <circle 
        cx={x} cy={y} r={radius} 
        fill={color + '10'} 
        stroke={color} 
        strokeWidth="2"
        className={isSelected ? 'filter brightness-125' : ''}
      />
      
      {/* Symbol / formula label */}
      {isPolyatomic && polyInfo ? (
        <>
          {/* Name on top line */}
          <text
            x={x} y={y - 4}
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill={color}
            style={{ userSelect: 'none' }}
          >
            {polyInfo.name}
          </text>
          {/* Formula on bottom line */}
          <text
            x={x} y={y + 12}
            textAnchor="middle"
            fontSize="13"
            fontWeight="black"
            fill={color}
            style={{ userSelect: 'none' }}
          >
            {polyInfo.formula}
          </text>
        </>
      ) : (
        <text
          x={x} y={y + 10}
          textAnchor="middle"
          fontSize="24"
          fontWeight="black"
          fill={color}
          style={{ userSelect: 'none' }}
        >
          {atom.element}
        </text>
      )}

      {/* Electrons */}
      {electrons}

      {/* Brackets & Charge */}
      {renderBrackets()}
      {renderCharge()}
    </g>
  );
};

export default LewisIon;
