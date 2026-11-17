import React from 'react';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
} from '@dnd-kit/core';
import { RegulatoryNode, RegulatoryConnection } from '../../../types';
import { CONNECTION_COLORS } from './modelerConstants';
import { NodeComponent } from './NodeComponent';

interface NetworkCanvasProps {
  nodes: RegulatoryNode[];
  connections: RegulatoryConnection[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateNodePosition: (id: string, dx: number, dy: number) => void;
  onToggleSignal: (id: string) => void;
  width: number;
  height: number;
}

export const NetworkCanvas: React.FC<NetworkCanvasProps> = ({
  nodes,
  connections,
  selectedNodeId,
  onSelectNode,
  onUpdateNodePosition,
  onToggleSignal,
  width: _width,
  height,
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [dragOffset, setDragOffset] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 10 } })
  );

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string);
    setDragOffset({ x: 0, y: 0 });
    onSelectNode(e.active.id as string);
  };

  const handleDragMove = (e: DragMoveEvent) => {
    setDragOffset({ x: e.delta.x, y: e.delta.y });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { delta, active } = e;
    setActiveId(null);
    setDragOffset({ x: 0, y: 0 });
    
    if (delta.x !== 0 || delta.y !== 0) {
      onUpdateNodePosition(active.id as string, delta.x, delta.y);
    }
  };

  const drawConnections = () => {
    return connections.map(conn => {
      const source = nodes.find(n => n.id === conn.sourceId);
      const target = nodes.find(n => n.id === conn.targetId);
      if (!source || !target) return null;

      // Calculate positions, including drag offsets if actively dragging
      let sX = source.position.x + 60; // Approx center of 120px node
      let sY = source.position.y + 40; // Approx center
      let tX = target.position.x + 60;
      let tY = target.position.y + 40;

      if (activeId === source.id) {
        sX += dragOffset.x;
        sY += dragOffset.y;
      }
      if (activeId === target.id) {
        tX += dragOffset.x;
        tY += dragOffset.y;
      }

      const isAct = conn.type === 'activation';
      const color = isAct ? CONNECTION_COLORS.activation : CONNECTION_COLORS.repression;

      // Determine arrow head structure (Arrow for activation, flat line for repression)
      const dx = tX - sX;
      const dy = tY - sY;
      const angle = Math.atan2(dy, dx);
      
      // Pull back target point so it doesn't overlap the target node (radius ~ 65px)
      const r = 70;
      tX = tX - Math.cos(angle) * r;
      tY = tY - Math.sin(angle) * r;
      sX = sX + Math.cos(angle) * r;
      sY = sY + Math.sin(angle) * r;

      const markerId = isAct ? 'arrow-head' : 'blunt-head';

      return (
        <g key={conn.id} className="transition-opacity duration-300">
          <line 
            x1={sX} y1={sY} 
            x2={tX} y2={tY} 
            stroke={color} 
            strokeWidth={4 * conn.strength} 
            markerEnd={`url(#${markerId})`} 
            opacity={0.8}
          />
        </g>
      );
    });
  };

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart} 
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div 
        className="relative bg-slate-900 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-inner w-full h-full"
        style={{ minHeight: height }}
        onClick={() => onSelectNode(null)}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker id="arrow-head" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={CONNECTION_COLORS.activation} />
            </marker>
            <marker id="blunt-head" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
               <rect x="5" y="0" width="3" height="10" fill={CONNECTION_COLORS.repression} />
            </marker>
          </defs>
          {drawConnections()}
        </svg>

        {nodes.map(node => (
          <NodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onSelect={(id, e) => {
              e.stopPropagation();
              onSelectNode(id);
            }}
            onToggleSignal={onToggleSignal}
          />
        ))}

        {!nodes.length && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-bold uppercase tracking-widest text-sm pointer-events-none">
            Drag nodes from panel to begin
          </div>
        )}
      </div>
    </DndContext>
  );
};
