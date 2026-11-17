import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { RegulatoryNode } from '../../../types';
import { NODE_COLORS } from './modelerConstants';
import { Power, Settings, Hexagon, Circle, Droplet, Target, Atom, Users, Sprout, Star } from 'lucide-react';

interface NodeComponentProps {
  node: RegulatoryNode;
  isSelected: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onToggleSignal?: (id: string) => void;
}

export const NodeComponent: React.FC<NodeComponentProps> = ({ node, isSelected, onSelect, onToggleSignal }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: node.id,
    data: node,
  });

  const style: React.CSSProperties = {
    position: 'absolute',
    left: node.position.x,
    top: node.position.y,
    transform: CSS.Translate.toString(transform),
    zIndex: isSelected ? 100 : isDragging ? 99 : 10,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const getIcon = () => {
    switch (node.type) {
      case 'signal': return <Power className="w-5 h-5" />;
      case 'gene': return <Settings className="w-5 h-5" />;
      case 'protein': return <Circle className="w-5 h-5" />;
      case 'environment': return <Hexagon className="w-5 h-5" />;
      case 'hormone': return <Droplet className="w-5 h-5" />;
      case 'receptor': return <Target className="w-5 h-5" />;
      case 'molecule': return <Atom className="w-5 h-5" />;
      case 'population': return <Users className="w-5 h-5" />;
      case 'organism': return <Sprout className="w-5 h-5" />;
      case 'custom': return <Star className="w-5 h-5" />;
      default: return <Circle className="w-5 h-5" />;
    }
  };

  const bgColor = NODE_COLORS[node.type];
  
  // Create a glow showing activation level (0-100)
  const glowOpacity = node.activationLevel / 100;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => onSelect(node.id, e)}
      className={`relative rounded-xl border-2 transition-shadow shadow-md select-none touch-none 
        ${isSelected ? 'ring-4 ring-emerald-400 border-white' : 'border-slate-800'}`}
    >
      {/* Glow Effect */}
      <div 
        className="absolute inset-0 rounded-xl blur-lg transition-opacity duration-200 pointer-events-none"
        style={{ 
          backgroundColor: bgColor,
          opacity: glowOpacity * 0.8
        }}
      />
      
      {/* Node Body */}
      <div 
        className="relative bg-slate-900 text-white rounded-[10px] overflow-hidden flex flex-col min-w-[120px]"
        style={{ borderTop: `4px solid ${bgColor}` }}
      >
        <div className="px-3 py-2 flex items-center justify-between gap-2 border-b border-slate-700 bg-slate-800/50">
           <div className="flex items-center gap-1.5" style={{ color: bgColor }}>
             {getIcon()}
           </div>
           <span className="text-xs font-black tracking-wide truncate max-w-[80px]" title={node.label}>
             {node.label}
           </span>
        </div>
        
        <div className="px-3 py-3 flex flex-col items-center justify-center relative">
          {/* Activation Meter */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full transition-all duration-200" 
              style={{ width: `${node.activationLevel}%`, backgroundColor: bgColor }} 
            />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {Math.round(node.activationLevel)}% Active
          </span>
          
          {/* Signal Toggle Layer (only shown if isManualToggle is true) */}
          {node.isManualToggle && onToggleSignal && (
            <button 
              onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when clicking button
              onClick={(e) => { e.stopPropagation(); onToggleSignal(node.id); }}
              className={`mt-3 w-full py-1.5 rounded-md text-xs font-black uppercase tracking-wider transition-colors
                ${node.activationLevel > 50 ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              {node.activationLevel > 50 ? 'ON' : 'OFF'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
