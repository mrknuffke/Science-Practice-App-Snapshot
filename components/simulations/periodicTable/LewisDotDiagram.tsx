import React from 'react';
import { Element, CATEGORY_COLORS } from './periodicTableData';

interface LewisDotDiagramProps {
  element: Element;
  size?: number;
}

export const LewisDotDiagram: React.FC<LewisDotDiagramProps> = ({ element, size = 200 }) => {
  // Determine valence electrons based on Group
  const getValenceElectrons = (group: number | null, atomicNumber: number): number => {
    // Helium is an exception, it has 2 valence electrons but is in group 18
    if (atomicNumber === 2) return 2;

    if (group === null) return 2; // F-block usually has 2 outermost s electrons

    if (group >= 1 && group <= 2) return group;
    if (group >= 13 && group <= 18) return group - 10;
    
    // Transition metals (Groups 3-12) typically have 1 or 2 valence electrons
    // Simplification for the visual model: 2 unless known exception
    if (atomicNumber === 24 || atomicNumber === 29 || atomicNumber === 41 || 
        atomicNumber === 42 || atomicNumber === 44 || atomicNumber === 45 || 
        atomicNumber === 47 || atomicNumber === 78 || atomicNumber === 79) {
      return 1;
    }
    if (atomicNumber === 46) return 0; // Palladium has 4d10 5s0

    return 2;
  };

  const valenceElectrons = Math.max(0, Math.min(8, getValenceElectrons(element.group, element.atomicNumber)));
  const color = CATEGORY_COLORS[element.category];

  // Dot positions on a grid 
  const dotPositions: { x: number; y: number }[] = [];
  
  // Placement rules (percentages of container size)
  const top1 = { x: 45, y: 15 };
  const top2 = { x: 55, y: 15 };
  const right1 = { x: 85, y: 45 };
  const right2 = { x: 85, y: 55 };
  const bottom1 = { x: 55, y: 85 };
  const bottom2 = { x: 45, y: 85 };
  const left1 = { x: 15, y: 55 };
  const left2 = { x: 15, y: 45 };

  // Helium pairs up immediately
  if (element.atomicNumber === 2) {
      dotPositions.push(right1, right2);
  } else {
      // 1-4 populate singly
      if (valenceElectrons >= 1) dotPositions.push(top1);
      if (valenceElectrons >= 2) dotPositions.push(right1);
      if (valenceElectrons >= 3) dotPositions.push(bottom1);
      if (valenceElectrons >= 4) dotPositions.push(left1);
      
      // 5-8 pair up
      if (valenceElectrons >= 5) dotPositions.push(top2);
      if (valenceElectrons >= 6) dotPositions.push(right2);
      if (valenceElectrons >= 7) dotPositions.push(bottom2);
      if (valenceElectrons >= 8) dotPositions.push(left2);
  }

  const dotRadius = size * 0.04;

  return (
    <div 
      className="relative flex items-center justify-center font-bold" 
      style={{ width: size, height: size }}
    >
      <div 
        className="text-center absolute inset-0 flex items-center justify-center"
        style={{ fontSize: size * 0.4, color: color }}
      >
        {element.symbol}
      </div>
      
      {dotPositions.map((pos, i) => (
        <div 
          key={i}
          className="absolute rounded-full"
          style={{
            top: `${pos.y}%`,
            left: `${pos.x}%`,
            width: dotRadius * 2,
            height: dotRadius * 2,
            backgroundColor: color,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)'
          }}
        />
      ))}
    </div>
  );
};
