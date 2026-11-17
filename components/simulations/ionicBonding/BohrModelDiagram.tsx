/**
 * Bohr Model Diagram
 * Shows electron shells before and after ionization
 */

import React from 'react';
import type { IonicCompound } from './ionEngine';
import { getIonLabel, getIonColor, getElectronConfig } from './ionEngine';

interface BohrModelDiagramProps {
  compound: IonicCompound;
}

const BohrModelDiagram: React.FC<BohrModelDiagramProps> = ({ compound }) => {
  if (compound.cations.length === 0 || compound.anions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-center p-8">
        <p>Build an ionic compound to see Bohr models</p>
      </div>
    );
  }

  const cation = compound.cations[0];
  const anion = compound.anions[0];

  // Parse electron configuration string (e.g., "2,8,1" -> [2, 8, 1])
  const parseConfig = (config: string): number[] => {
    return config.split(',').map(n => parseInt(n.trim(), 10));
  };

  // Get configurations before and after
  const cationConfigBefore = cation.element
    ? getElectronConfig(cation.element, false, 0)
    : '';
  const cationConfigAfter = cation.element
    ? getElectronConfig(cation.element, true, cation.charge)
    : '';

  const anionConfigBefore = anion.element
    ? getElectronConfig(anion.element, false, 0)
    : '';
  const anionConfigAfter = anion.element
    ? getElectronConfig(anion.element, true, anion.charge)
    : '';

  const cationShellsBefore = cationConfigBefore ? parseConfig(cationConfigBefore) : [];
  const cationShellsAfter = cationConfigAfter ? parseConfig(cationConfigAfter) : [];

  const anionShellsBefore = anionConfigBefore ? parseConfig(anionConfigBefore) : [];
  const anionShellsAfter = anionConfigAfter ? parseConfig(anionConfigAfter) : [];

  // Render a Bohr model
  const renderBohrModel = (
    x: number,
    y: number,
    element: string,
    shells: number[],
    label: string,
    color: string
  ) => {
    const nucleusRadius = 15;
    const shellSpacing = 20;

    return (
      <g>
        {/* Nucleus */}
        <circle cx={x} cy={y} r={nucleusRadius} fill={color} stroke="#64748b" strokeWidth="2" />
        <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">
          {element}
        </text>

        {/* Electron shells */}
        {shells.map((electronCount, shellIndex) => {
          const shellRadius = nucleusRadius + (shellIndex + 1) * shellSpacing;

          // Draw shell circle
          const shellCircle = (
            <circle
              key={`shell-${shellIndex}`}
              cx={x}
              cy={y}
              r={shellRadius}
              fill="none"
              stroke="#475569"
              strokeWidth="1"
              strokeDasharray="4 2"
            />
          );

          // Draw electrons on this shell
          const electrons = Array.from({ length: electronCount }).map((_, i) => {
            const angle = (i * 2 * Math.PI) / electronCount;
            const ex = x + shellRadius * Math.cos(angle);
            const ey = y + shellRadius * Math.sin(angle);

            return (
              <circle key={`electron-${shellIndex}-${i}`} cx={ex} cy={ey} r="3" fill="#10b981" stroke="#059669" strokeWidth="1" />
            );
          });

          return (
            <g key={`shell-group-${shellIndex}`}>
              {shellCircle}
              {electrons}
            </g>
          );
        })}

        {/* Label below */}
        <text x={x} y={y + nucleusRadius + shells.length * shellSpacing + 20} textAnchor="middle" fontSize="14" fontWeight="bold" fill={color}>
          {label}
        </text>
      </g>
    );
  };

  const width = 600;
  const height = 400;

  return (
    <div className="relative w-full h-[400px] bg-slate-900/50 rounded-xl border border-slate-600">
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        {/* Before Ionization */}
        <g>
          <text x={150} y={30} textAnchor="middle" fontSize="14" fill="#94a3b8" fontWeight="bold">
            Before Ionization
          </text>

          {/* Cation (neutral atom) */}
          {cation.element &&
            renderBohrModel(80, 140, cation.element, cationShellsBefore, cation.element, getIonColor(cation))}

          {/* Anion (neutral atom) */}
          {anion.element &&
            renderBohrModel(220, 140, anion.element, anionShellsBefore, anion.element, getIonColor(anion))}
        </g>

        {/* Arrow */}
        <g>
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" fill="#a78bfa">
              <polygon points="0 0, 10 3, 0 6" />
            </marker>
          </defs>
          <line
            x1={300}
            y1={height / 2}
            x2={340}
            y2={height / 2}
            stroke="#a78bfa"
            strokeWidth="3"
            markerEnd="url(#arrow)"
          />
          <text x={320} y={height / 2 - 10} textAnchor="middle" fontSize="12" fill="#a78bfa" fontWeight="bold">
            Ionize
          </text>
        </g>

        {/* After Ionization */}
        <g>
          <text x={470} y={30} textAnchor="middle" fontSize="14" fill="#94a3b8" fontWeight="bold">
            After Ionization
          </text>

          {/* Cation (ionized) */}
          {cation.element && cation.isIonized &&
            renderBohrModel(390, 140, cation.element, cationShellsAfter, getIonLabel(cation), '#f59e0b')}

          {/* Anion (ionized) */}
          {anion.element && anion.isIonized &&
            renderBohrModel(530, 140, anion.element, anionShellsAfter, getIonLabel(anion), '#3b82f6')}
        </g>

        {/* Electron transfer indicator */}
        {cation.isIonized && anion.isIonized && (
          <text x={width / 2} y={height - 20} textAnchor="middle" fontSize="12" fill="#10b981">
            {Math.abs(cation.charge)} electron{Math.abs(cation.charge) > 1 ? 's' : ''} transferred from {cation.element} to {anion.element}
          </text>
        )}
      </svg>
    </div>
  );
};

export default BohrModelDiagram;
