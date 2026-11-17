import React from 'react';
import { ConceptNode } from './conceptMapTypes';
import { X, ArrowUpRight } from 'lucide-react';

interface ConceptMapNodeProps {
  node: ConceptNode;
  isSelected: boolean;
  isConnectingSource: boolean;
  onSelect: (nodeId: string) => void;
  onStartConnect: (nodeId: string, e: React.MouseEvent | React.TouchEvent) => void;
  onDelete: (nodeId: string) => void;
  onMouseDown: (nodeId: string, e: React.MouseEvent) => void;
  onTouchStart: (nodeId: string, e: React.TouchEvent) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Pathway: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  Molecule: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  Organelle: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  Energy: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  Protein: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  Intramolecular: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
  Intermolecular: { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
  Vector: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
  Mechanical: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  Default: { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
};

export const ConceptMapNodeComponent: React.FC<ConceptMapNodeProps> = ({
  node,
  isSelected,
  isConnectingSource,
  onSelect,
  onStartConnect,
  onDelete,
  onMouseDown,
  onTouchStart,
}) => {
  const catTheme = (node.category && CATEGORY_COLORS[node.category]) || CATEGORY_COLORS.Default;

  return (
    <div
      id={`node-${node.id}`}
      style={{
        position: 'absolute',
        left: `${node.x}px`,
        top: `${node.y}px`,
        transform: 'translate(-50%, -50%)',
        touchAction: 'none',
      }}
      className={`
        w-44 select-none cursor-move rounded-2xl bg-white dark:bg-slate-800 shadow-md border-2 transition-shadow
        ${isSelected ? 'ring-2 ring-violet-500 shadow-xl border-violet-500 z-30' : 'border-slate-200 dark:border-slate-700 hover:shadow-lg z-10'}
        ${isConnectingSource ? 'ring-4 ring-amber-400 ring-offset-2 z-40' : ''}
      `}
      onClick={e => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      onMouseDown={e => onMouseDown(node.id, e)}
      onTouchStart={e => onTouchStart(node.id, e)}
    >
      {/* Node Header Pill */}
      <div className={`flex items-center justify-between px-3 py-1.5 rounded-t-xl border-b ${catTheme.bg} ${catTheme.border}`}>
        <span className={`text-[10px] font-black tracking-wider uppercase truncate ${catTheme.text}`}>
          {node.category || 'Concept'}
        </span>
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          className="text-slate-400 hover:text-rose-500 transition-colors p-0.5 rounded"
          title="Delete concept"
          aria-label={`Delete ${node.label}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Concept Label */}
      <div className="p-3">
        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">
          {node.label}
        </h4>
        {node.description && (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2 mt-1">
            {node.description}
          </p>
        )}
      </div>

      {/* Connector Port Handle */}
      <div className="px-3 pb-2.5 flex justify-end">
        <button
          onClick={e => {
            e.stopPropagation();
            onStartConnect(node.id, e);
          }}
          className={`
            flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all shadow-sm
            ${
              isConnectingSource
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 hover:bg-violet-600 hover:text-white border border-violet-200 dark:border-violet-800'
            }
          `}
          title="Click then click target node to connect"
        >
          <span>Connect</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
