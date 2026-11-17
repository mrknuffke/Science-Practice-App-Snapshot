import React from 'react';
import { ConceptNode, ConceptEdge } from './conceptMapTypes';

interface ConceptMapEdgeProps {
  edge: ConceptEdge;
  sourceNode: ConceptNode;
  targetNode: ConceptNode;
  isSelected: boolean;
  onSelectEdge: (edgeId: string) => void;
}

export const ConceptMapEdgeComponent: React.FC<ConceptMapEdgeProps> = ({
  edge,
  sourceNode,
  targetNode,
  isSelected,
  onSelectEdge,
}) => {
  const dx = targetNode.x - sourceNode.x;
  const dy = targetNode.y - sourceNode.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return null;

  // Shorten arrow so it points cleanly at the edge of the node card (width ~176px, height ~110px)
  const nodeRadius = 60;
  const startRatio = Math.min(0.4, nodeRadius / dist);
  const endRatio = Math.max(0.6, 1 - nodeRadius / dist);

  const x1 = sourceNode.x + dx * startRatio;
  const y1 = sourceNode.y + dy * startRatio;
  const x2 = sourceNode.x + dx * endRatio;
  const y2 = sourceNode.y + dy * endRatio;

  // Center coordinate for linking phrase pill
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Status styling
  let strokeColor = '#8b5cf6'; // default violet
  let badgeBg = 'bg-violet-600 text-white border-violet-700';

  if (edge.status === 'correct') {
    strokeColor = '#10b981'; // emerald
    badgeBg = 'bg-emerald-600 text-white border-emerald-700';
  } else if (edge.status === 'invalid') {
    strokeColor = '#f43f5e'; // rose
    badgeBg = 'bg-rose-600 text-white border-rose-700';
  } else if (edge.status === 'needs_work') {
    strokeColor = '#f59e0b'; // amber
    badgeBg = 'bg-amber-500 text-white border-amber-600';
  }

  const markerId = `arrowhead-${edge.status || 'default'}`;

  return (
    <g className="cursor-pointer" onClick={() => onSelectEdge(edge.id)}>
      {/* Invisible wider hit area for easy clicking */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="transparent"
        strokeWidth={24}
        className="cursor-pointer"
      />

      {/* Main Connection Line */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={strokeColor}
        strokeWidth={isSelected ? 3.5 : 2.5}
        strokeDasharray={edge.status === 'invalid' ? '5,5' : undefined}
        markerEnd={`url(#${markerId})`}
        className="transition-all"
      />

      {/* Linking Phrase HTML Badge */}
      <foreignObject
        x={midX - 70}
        y={midY - 14}
        width={140}
        height={28}
        className="overflow-visible pointer-events-none"
      >
        <div className="flex items-center justify-center w-full h-full">
          <div
            className={`
              pointer-events-auto px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider
              shadow-sm border transition-transform hover:scale-105 select-none text-center truncate max-w-full
              ${badgeBg} ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-violet-600 scale-105' : ''}
            `}
            title={`Proposition: ${sourceNode.label} [${edge.label}] ${targetNode.label}`}
          >
            {edge.label || 'relates to'}
          </div>
        </div>
      </foreignObject>
    </g>
  );
};
