import React, { useCallback, useRef } from 'react';
import { FbdForce, FbdScenario, FbdVerifyResult } from '../../../types';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, OBJECT_RADIUS, ARROW_HEAD_LENGTH, ARROW_HEAD_ANGLE,
  SURFACE_Y, OBJECT_CX, SurfaceType,
} from './fbdConstants';
import { computeNetForce } from './fbdEngine';

interface FbdCanvasProps {
  forces: FbdForce[];
  selectedForceId: string | null;
  onSelectForce: (id: string | null) => void;
  onDragForce: (id: string, newAngle: number, newMagnitude: number) => void;
  // Build mode props
  surfaceType?: SurfaceType;
  inclineAngle?: number;
  objectLabel?: string;
  // Practice mode
  scenario?: FbdScenario | null;
  verifyResult?: FbdVerifyResult | null;
  showSolution?: boolean;
}

// Returns the three points of the arrowhead triangle at the tip of a force arrow.
// SVG y-axis is flipped vs. math convention, so the y component negates sin to
// match the shaft direction (which uses oy - sin(rad)*mag).
function arrowHeadPoints(tipX: number, tipY: number, angleDeg: number): string {
  const rad = (angleDeg * Math.PI) / 180;
  const left = rad + Math.PI - ARROW_HEAD_ANGLE;
  const right = rad + Math.PI + ARROW_HEAD_ANGLE;
  const lx = tipX + ARROW_HEAD_LENGTH * Math.cos(left);
  const ly = tipY - ARROW_HEAD_LENGTH * Math.sin(left);
  const rx = tipX + ARROW_HEAD_LENGTH * Math.cos(right);
  const ry = tipY - ARROW_HEAD_LENGTH * Math.sin(right);
  return `${tipX},${tipY} ${lx},${ly} ${rx},${ry}`;
}

// Shaft end point: stop short of the tip so the arrowhead isn't buried
function shaftEnd(tipX: number, tipY: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: tipX - Math.cos(rad) * ARROW_HEAD_LENGTH * 0.7,
    y: tipY + Math.sin(rad) * ARROW_HEAD_LENGTH * 0.7,
  };
}

function getForceStatus(force: FbdForce, result?: FbdVerifyResult | null) {
  if (!result) return 'none';
  if (result.correct.some(f => f.id === force.id)) return 'correct';
  if (result.misdirected.some(f => f.id === force.id)) return 'misdirected';
  if (result.extra.some(f => f.id === force.id)) return 'extra';
  return 'none';
}

// Derive object center from surface type / scenario
function getObjectCenter(
  surfaceType: SurfaceType,
  inclineAngle: number,
  scenarioCategory?: string
): { ox: number; oy: number } {
  const cat = scenarioCategory ?? surfaceType;
  if (cat === 'rope' || cat === 'pulley' || cat === 'vertical' || cat === 'air') {
    // Hanging / in-air: center of canvas
    return { ox: OBJECT_CX, oy: CANVAS_HEIGHT / 2 - 20 };
  }
  if (cat === 'water') {
    return { ox: OBJECT_CX, oy: SURFACE_Y - OBJECT_RADIUS - 30 };
  }
  if (cat === 'incline') {
    const rad = (inclineAngle * Math.PI) / 180;
    return {
      ox: OBJECT_CX - OBJECT_RADIUS * Math.sin(rad),
      oy: SURFACE_Y - OBJECT_RADIUS * Math.cos(rad),
    };
  }
  // Flat
  return { ox: OBJECT_CX, oy: SURFACE_Y - OBJECT_RADIUS };
}

// Hatch pattern for ground below surface
function drawHatch(id: string) {
  return (
    <defs>
      <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="10" stroke="#cbd5e1" strokeWidth="2" />
      </pattern>
    </defs>
  );
}

// Point particle: standard FBD convention. All forces emanate from this dot.
function PointParticle({ ox, oy, label }: { ox: number; oy: number; label: string }) {
  return (
    <g>
      <circle cx={ox} cy={oy} r={7} fill="#1e293b" stroke="white" strokeWidth={2} />
      {label && (
        <text x={ox + 14} y={oy - 10} fontSize="11" fontWeight="bold" fill="#475569">
          {label}
        </text>
      )}
    </g>
  );
}

export const FbdCanvas: React.FC<FbdCanvasProps> = ({
  forces,
  selectedForceId,
  onSelectForce,
  onDragForce,
  surfaceType = 'flat',
  inclineAngle = 0,
  objectLabel = 'Object',
  scenario,
  verifyResult,
  showSolution,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Determine effective surface from scenario or build props
  const effectiveSurface: SurfaceType = scenario
    ? (scenario.category === 'pulley' || scenario.category === 'vertical' ? 'rope'
      : scenario.category === 'incline' ? 'incline'
      : 'flat')
    : surfaceType;

  const effectiveIncline = scenario?.inclineAngle ?? inclineAngle;

  const { ox, oy } = getObjectCenter(effectiveSurface, effectiveIncline, scenario?.category);

  const getCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: clientX, y: clientY };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    };
  }, []);

  const handleArrowPointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    onSelectForce(id);

    const handleMove = (ev: PointerEvent) => {
      const p = getCanvasPoint(ev.clientX, ev.clientY);
      const dx = p.x - ox;
      const dy = -(p.y - oy);
      const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
      const mag = Math.min(200, Math.max(20, Math.sqrt(dx * dx + dy * dy)));
      onDragForce(id, angle, mag);
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
  };

  const netForce = computeNetForce(forces);
  const solutionForces = showSolution && scenario ? scenario.expectedForces : [];

  // Surface rendering
  const renderSurface = () => {
    if (effectiveSurface === 'rope' || effectiveSurface === 'air') {
      // Ceiling anchor for rope
      if (effectiveSurface === 'rope') {
        return (
          <>
            <rect x={0} y={0} width={CANVAS_WIDTH} height={20} fill="#e2e8f0" />
            <line x1={ox} y1={20} x2={ox} y2={oy - OBJECT_RADIUS - 2}
              stroke="#64748b" strokeWidth="3" strokeDasharray="6 3" />
          </>
        );
      }
      return null;
    }

    if (effectiveSurface === 'water') {
      return (
        <>
          {/* water fill */}
          <rect x={0} y={SURFACE_Y - 60} width={CANVAS_WIDTH} height={CANVAS_HEIGHT - SURFACE_Y + 60}
            fill="#bfdbfe" opacity={0.4} />
          {/* waterline */}
          <line x1={0} y1={SURFACE_Y - 60} x2={CANVAS_WIDTH} y2={SURFACE_Y - 60}
            stroke="#3b82f6" strokeWidth="2" strokeDasharray="8 4" />
          <text x={20} y={SURFACE_Y - 45} fontSize="11" fill="#1d4ed8" fontWeight="bold">fluid surface</text>
          {/* ground */}
          <rect x={0} y={SURFACE_Y + 8} width={CANVAS_WIDTH} height={CANVAS_HEIGHT - SURFACE_Y}
            fill="url(#hatch)" />
          <line x1={0} y1={SURFACE_Y + 8} x2={CANVAS_WIDTH} y2={SURFACE_Y + 8}
            stroke="#94a3b8" strokeWidth="3" />
        </>
      );
    }

    if (effectiveSurface === 'incline') {
      const rad = (effectiveIncline * Math.PI) / 180;
      const groundLen = 380;
      const x1 = ox - groundLen / 2;
      const y1 = SURFACE_Y + (groundLen / 2) * Math.tan(rad);
      const x2 = ox + groundLen / 2;
      const y2 = SURFACE_Y - (groundLen / 2) * Math.tan(rad);

      // Hatching polygon below the incline line
      return (
        <>
          <polygon
            points={`${x1},${y1} ${x2},${y2} ${x2},${CANVAS_HEIGHT} ${x1},${CANVAS_HEIGHT}`}
            fill="url(#hatch)"
          />
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
          {/* angle label */}
          <text x={x2 - 40} y={y2 + 20} fontSize="12" fill="#475569" fontWeight="bold">{effectiveIncline}°</text>
        </>
      );
    }

    // Flat surface (default)
    return (
      <>
        <rect x={0} y={SURFACE_Y + 8} width={CANVAS_WIDTH} height={CANVAS_HEIGHT - SURFACE_Y}
          fill="url(#hatch)" />
        <line x1={0} y1={SURFACE_Y + 8} x2={CANVAS_WIDTH} y2={SURFACE_Y + 8}
          stroke="#64748b" strokeWidth="3" />
      </>
    );
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      className="w-full h-full"
      onClick={() => onSelectForce(null)}
      style={{ userSelect: 'none' }}
    >
      {drawHatch('hatch')}

      {/* Background */}
      <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#f8fafc" />

      {/* Grid (subtle) */}
      {Array.from({ length: Math.floor(CANVAS_WIDTH / 50) }).map((_, i) => (
        <line key={`vg${i}`} x1={(i + 1) * 50} y1={0} x2={(i + 1) * 50} y2={CANVAS_HEIGHT} stroke="#e2e8f0" strokeWidth="0.5" />
      ))}
      {Array.from({ length: Math.floor(CANVAS_HEIGHT / 50) }).map((_, i) => (
        <line key={`hg${i}`} x1={0} y1={(i + 1) * 50} x2={CANVAS_WIDTH} y2={(i + 1) * 50} stroke="#e2e8f0" strokeWidth="0.5" />
      ))}

      {/* Surface */}
      {renderSurface()}

      {/* Object: point-particle representation (standard FBD convention) */}
      <PointParticle ox={ox} oy={oy} label={objectLabel} />

      {/* Solution overlay */}
      {solutionForces.map((ef, i) => {
        const rad = (ef.angle * Math.PI) / 180;
        const mag = 80;
        const tx = ox + Math.cos(rad) * mag;
        const ty = oy - Math.sin(rad) * mag;
        const se = shaftEnd(tx, ty, ef.angle);
        return (
          <g key={`sol-${i}`} opacity={0.5}>
            <line x1={ox} y1={oy} x2={se.x} y2={se.y} stroke="#3b82f6" strokeWidth="3" strokeDasharray="6 3" />
            <polygon points={arrowHeadPoints(tx, ty, ef.angle)} fill="#3b82f6" />
            <text x={tx + Math.cos(rad) * 18} y={ty - Math.sin(rad) * 18 + 4}
              fontSize="11" fill="#3b82f6" fontWeight="bold" textAnchor="middle">{ef.label}</text>
          </g>
        );
      })}

      {/* Force arrows */}
      {forces.map(force => {
        const rad = (force.angle * Math.PI) / 180;
        const tx = ox + Math.cos(rad) * force.magnitude;
        const ty = oy - Math.sin(rad) * force.magnitude;
        const isSelected = force.id === selectedForceId;
        const status = getForceStatus(force, verifyResult);

        const strokeColor = status === 'correct' ? '#10b981'
          : status === 'misdirected' ? '#f59e0b'
          : status === 'extra' ? '#ef4444'
          : isSelected ? '#1e293b'
          : force.color;

        const haloColor = status === 'correct' ? '#d1fae5'
          : status === 'misdirected' ? '#fef3c7'
          : status === 'extra' ? '#fee2e2'
          : null;

        const se = shaftEnd(tx, ty, force.angle);
        return (
          <g key={force.id} style={{ cursor: 'grab', touchAction: 'none' }}
            onPointerDown={(e) => handleArrowPointerDown(e, force.id)}
            onClick={(e) => { e.stopPropagation(); onSelectForce(force.id); }}
          >
            {(isSelected || haloColor) && (
              <circle cx={ox + Math.cos(rad) * force.magnitude * 0.5}
                cy={oy - Math.sin(rad) * force.magnitude * 0.5}
                r={10} fill={haloColor ?? 'rgba(30,41,59,0.1)'} />
            )}
            {/* Shaft stops short of tip so arrowhead is visible */}
            <line x1={ox} y1={oy} x2={se.x} y2={se.y}
              stroke={strokeColor} strokeWidth={isSelected ? 3.5 : 2.5} strokeLinecap="round" />
            {/* Filled arrowhead triangle */}
            <polygon points={arrowHeadPoints(tx, ty, force.angle)}
              fill={strokeColor} stroke={strokeColor} strokeWidth="1" strokeLinejoin="round" />
            {/* Label offset beyond the tip */}
            <text x={tx + Math.cos(rad) * 18} y={ty - Math.sin(rad) * 18 + 4}
              fontSize="13" fontWeight="bold" fill={strokeColor} textAnchor="middle">
              {force.label}
            </text>
            {isSelected && (
              <text x={ox + Math.cos(rad) * force.magnitude * 0.5 + 12}
                y={oy - Math.sin(rad) * force.magnitude * 0.5 - 8}
                fontSize="10" fill="#64748b" textAnchor="middle">
                {force.magnitude.toFixed(0)} N
              </text>
            )}
          </g>
        );
      })}

      {/* Net force */}
      {forces.length > 0 && netForce.magnitude > 2 && (() => {
        const netRad = (netForce.angleDeg * Math.PI) / 180;
        const scale = Math.min(1, netForce.magnitude / 100);
        const displayLen = 40 + scale * 80;
        const ntx = ox + Math.cos(netRad) * displayLen;
        const nty = oy - Math.sin(netRad) * displayLen;
        const nse = shaftEnd(ntx, nty, netForce.angleDeg);
        return (
          <g opacity={0.7}>
            <line x1={ox} y1={oy} x2={nse.x} y2={nse.y} stroke="#1e293b" strokeWidth="2.5" strokeDasharray="7 4" />
            <polygon points={arrowHeadPoints(ntx, nty, netForce.angleDeg)} fill="#1e293b" />
            <text x={ntx + Math.cos(netRad) * 18} y={nty - Math.sin(netRad) * 18 + 4}
              fontSize="11" fill="#1e293b" fontWeight="bold" textAnchor="middle">Fnet</text>
          </g>
        );
      })()}

      {/* Equilibrium ring */}
      {forces.length > 0 && netForce.magnitude <= 2 && (
        <g>
          <circle cx={ox} cy={oy} r={OBJECT_RADIUS + 10} fill="none"
            stroke="#10b981" strokeWidth="2" strokeDasharray="5 3" opacity={0.7} />
          <text x={ox} y={oy + OBJECT_RADIUS + 26} textAnchor="middle"
            fontSize="11" fill="#10b981" fontWeight="bold">Fnet ≈ 0 (equilibrium)</text>
        </g>
      )}
    </svg>
  );
};
