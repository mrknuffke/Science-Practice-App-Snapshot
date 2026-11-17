import React, { useState, useRef, useCallback } from 'react';
import { ConceptNode, ConceptEdge } from './conceptMapTypes';
import { ConceptMapNodeComponent } from './ConceptMapNode';
import { ConceptMapEdgeComponent } from './ConceptMapEdge';

interface ConceptMapCanvasProps {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onSelectEdge: (edgeId: string | null) => void;
  onUpdateNodePosition: (nodeId: string, x: number, y: number) => void;
  onAddEdge: (sourceId: string, targetId: string) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const ConceptMapCanvas: React.FC<ConceptMapCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
  onUpdateNodePosition,
  onAddEdge,
  onDeleteNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Dragging Node State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });

  // Connection In-Progress State
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const getCanvasCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Node Drag handlers
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNode(nodeId);
    onSelectEdge(null);

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const coords = getCanvasCoords(e.clientX, e.clientY);
    dragOffsetRef.current = {
      offsetX: coords.x - node.x,
      offsetY: coords.y - node.y,
    };
    setDraggingNodeId(nodeId);
  };

  const handleNodeTouchStart = (nodeId: string, e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length !== 1) return;
    onSelectNode(nodeId);
    onSelectEdge(null);

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const touch = e.touches[0];
    const coords = getCanvasCoords(touch.clientX, touch.clientY);
    dragOffsetRef.current = {
      offsetX: coords.x - node.x,
      offsetY: coords.y - node.y,
    };
    setDraggingNodeId(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setMousePos(coords);

    if (draggingNodeId) {
      const newX = Math.max(90, coords.x - dragOffsetRef.current.offsetX);
      const newY = Math.max(60, coords.y - dragOffsetRef.current.offsetY);
      onUpdateNodePosition(draggingNodeId, newX, newY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const coords = getCanvasCoords(touch.clientX, touch.clientY);
    setMousePos(coords);

    if (draggingNodeId) {
      const newX = Math.max(90, coords.x - dragOffsetRef.current.offsetX);
      const newY = Math.max(60, coords.y - dragOffsetRef.current.offsetY);
      onUpdateNodePosition(draggingNodeId, newX, newY);
    }
  };

  const handlePointerUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }
  };

  // Connection handlers
  const handleStartConnect = (sourceId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (connectingSourceId === sourceId) {
      setConnectingSourceId(null);
    } else {
      setConnectingSourceId(sourceId);
    }
  };

  const handleCanvasClick = () => {
    onSelectNode(null);
    onSelectEdge(null);
    setConnectingSourceId(null);
  };

  const handleNodeTargetSelect = useCallback(
    (targetId: string) => {
      if (connectingSourceId && connectingSourceId !== targetId) {
        onAddEdge(connectingSourceId, targetId);
        setConnectingSourceId(null);
      } else {
        onSelectNode(targetId);
        onSelectEdge(null);
      }
    },
    [connectingSourceId, onAddEdge, onSelectNode, onSelectEdge]
  );

  const connectingSourceNode = nodes.find(n => n.id === connectingSourceId);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[620px] bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner select-none cursor-crosshair touch-none"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseUp={handlePointerUp}
      onTouchEnd={handlePointerUp}
    >
      {/* Background Grid Pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-20">
        <defs>
          <pattern id="concept-map-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-700" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#concept-map-grid)" />
      </svg>

      {/* SVG Arrows & Edges Layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          {/* Arrowhead Markers */}
          <marker id="arrowhead-default" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
          </marker>
          <marker id="arrowhead-correct" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
          </marker>
          <marker id="arrowhead-invalid" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#f43f5e" />
          </marker>
          <marker id="arrowhead-needs_work" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
          </marker>
        </defs>

        <g className="pointer-events-auto">
          {edges.map(edge => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            if (!source || !target) return null;

            return (
              <ConceptMapEdgeComponent
                key={edge.id}
                edge={edge}
                sourceNode={source}
                targetNode={target}
                isSelected={selectedEdgeId === edge.id}
                onSelectEdge={onSelectEdge}
              />
            );
          })}

          {/* Pending In-Progress Connection Line */}
          {connectingSourceNode && (
            <line
              x1={connectingSourceNode.x}
              y1={connectingSourceNode.y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="#f59e0b"
              strokeWidth={3}
              strokeDasharray="6,6"
              markerEnd="url(#arrowhead-needs_work)"
            />
          )}
        </g>
      </svg>

      {/* HTML Concept Cards Layer */}
      {nodes.map(node => (
        <ConceptMapNodeComponent
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          isConnectingSource={connectingSourceId === node.id}
          onSelect={handleNodeTargetSelect}
          onStartConnect={handleStartConnect}
          onDelete={onDeleteNode}
          onMouseDown={handleNodeMouseDown}
          onTouchStart={handleNodeTouchStart}
        />
      ))}

      {/* Floating Canvas Hint Banner */}
      {connectingSourceId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-full shadow-lg z-50 animate-bounce">
          Click any target concept card to complete connection
        </div>
      )}

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
          <p className="text-slate-400 font-bold text-sm">
            Canvas is empty. Select a preset or click "+ Add Concept" to begin mapping.
          </p>
        </div>
      )}
    </div>
  );
};
