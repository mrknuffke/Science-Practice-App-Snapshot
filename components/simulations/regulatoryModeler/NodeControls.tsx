import React, { useState } from 'react';
import { RegulatoryNode, RegulatoryConnection, RegulatoryNodeType, NodeTypeDefinition } from '../../../types';
import { STARTER_CIRCUITS, PRESET_NODE_TYPE_SETS, CONNECTION_COLORS } from './modelerConstants';
import { Play, Pause, Trash2, Link as LinkIcon, Download, Save, Upload, ChevronDown, ChevronUp, RotateCcw, X, Repeat } from 'lucide-react';

interface NodeControlsProps {
  onAddNode: (type: RegulatoryNodeType) => void;
  onClear: () => void;
  onResetActivation: () => void;
  onLoadCircuit: (id: string) => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  selectedNodeId: string | null;
  onStartConnection: (type: 'activation' | 'repression') => void;
  isConnecting: 'activation' | 'repression' | null;
  onSave: () => void;
  onLoad: () => void;
  nodeTypeDefinitions: NodeTypeDefinition[];
  onLoadPresetTypes: (setId: string) => void;
  nodes: RegulatoryNode[];
  connections: RegulatoryConnection[];
  onDeleteConnection: (id: string) => void;
  onFlipConnection: (id: string) => void;
  onChangeConnectionStrength: (id: string, strength: number) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  gene: 'Gene Regulation',
  hormonal: 'Hormonal',
  signal: 'Signal Transduction',
  ecology: 'Ecological',
};

export const NodeControls: React.FC<NodeControlsProps> = ({
  onAddNode,
  onClear,
  onResetActivation,
  onLoadCircuit,
  isRunning,
  onTogglePlay,
  selectedNodeId,
  onStartConnection,
  isConnecting,
  onSave,
  onLoad,
  nodeTypeDefinitions,
  onLoadPresetTypes,
  nodes,
  connections,
  onDeleteConnection,
  onFlipConnection,
  onChangeConnectionStrength,
}) => {
  const [circuitsExpanded, setCircuitsExpanded] = useState(true);
  const [presetsExpanded, setPresetsExpanded] = useState(false);
  const [connectionsExpanded, setConnectionsExpanded] = useState(true);

  const nodeLabel = (id: string) => nodes.find(n => n.id === id)?.label ?? '?';

  const groupedCircuits = Object.keys(CATEGORY_LABELS).map(cat => ({
    cat,
    label: CATEGORY_LABELS[cat],
    circuits: STARTER_CIRCUITS.filter(c => c.category === cat),
  }));

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col gap-5">

      {/* Playback */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Simulation</h3>
        <div className="flex gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
              isRunning
                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isRunning ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5" /> Play</>}
          </button>

          <button onClick={onResetActivation} title="Zero out activation levels: keeps the network intact so you can re-run the experiment" className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button onClick={onSave} title="Save to browser" className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
            <Save className="w-5 h-5" />
          </button>
          <button onClick={onLoad} title="Load from browser" className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <Upload className="w-5 h-5" />
          </button>
          <button onClick={onClear} title="Clear canvas: removes all nodes and connections" className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-rose-100 hover:text-rose-600 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Add Nodes */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Add Component</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {nodeTypeDefinitions.map(def => (
            <button
              key={def.id}
              onClick={() => onAddNode(def.id as RegulatoryNodeType)}
              className="p-2 text-xs font-bold rounded-lg transition-colors border text-left"
              style={{
                backgroundColor: `${def.color}15`,
                borderColor: `${def.color}50`,
                color: def.color,
              }}
            >
              {def.label}
            </button>
          ))}
        </div>

        {/* Load preset type sets */}
        <button
          onClick={() => setPresetsExpanded(e => !e)}
          className="mt-2 w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
        >
          <span>Switch Component Palette</span>
          {presetsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {presetsExpanded && (
          <div className="grid grid-cols-2 gap-1 mt-1">
            {Object.entries(PRESET_NODE_TYPE_SETS).map(([key, set]) => (
              <button
                key={key}
                onClick={() => { onLoadPresetTypes(key); setPresetsExpanded(false); }}
                className="p-1.5 text-[10px] font-bold rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-left"
              >
                {set.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* Connections */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <LinkIcon className="w-4 h-4" /> Connections
        </h3>
        {!selectedNodeId ? (
          <p className="text-xs text-slate-400 italic">Select a node first.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onStartConnection('activation')}
              className={`p-2 text-xs font-bold rounded-lg transition-all border ${
                isConnecting === 'activation'
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-800 ring-2 ring-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              → Activates (click target)
            </button>
            <button
              onClick={() => onStartConnection('repression')}
              className={`p-2 text-xs font-bold rounded-lg transition-all border ${
                isConnecting === 'repression'
                  ? 'bg-rose-100 border-rose-500 text-rose-800 ring-2 ring-rose-300'
                  : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
              }`}
            >
              ⊣ Represses (click target)
            </button>
            {isConnecting && (
              <p className="text-[10px] text-center text-slate-500 animate-pulse">Now click a target node. ESC to cancel.</p>
            )}
          </div>
        )}
      </div>

      {/* Edit existing connections */}
      {connections.length > 0 && (
        <>
          <hr className="border-slate-100" />
          <div>
            <button
              onClick={() => setConnectionsExpanded(e => !e)}
              className="w-full flex items-center justify-between mb-3"
            >
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Edit Connections ({connections.length})
              </h3>
              {connectionsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {connectionsExpanded && (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {connections.map(conn => {
                  const isAct = conn.type === 'activation';
                  const involvesSelected = selectedNodeId && (conn.sourceId === selectedNodeId || conn.targetId === selectedNodeId);
                  const color = isAct ? CONNECTION_COLORS.activation : CONNECTION_COLORS.repression;
                  return (
                    <div
                      key={conn.id}
                      className={`p-2 rounded-lg border bg-slate-50 ${involvesSelected ? 'ring-2 ring-emerald-300 border-emerald-200' : 'border-slate-200'}`}
                    >
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 mb-1.5">
                        <span className="truncate flex-1" title={nodeLabel(conn.sourceId)}>{nodeLabel(conn.sourceId)}</span>
                        <span style={{ color }} className="font-black">{isAct ? '→' : '⊣'}</span>
                        <span className="truncate flex-1 text-right" title={nodeLabel(conn.targetId)}>{nodeLabel(conn.targetId)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0.2}
                          max={2.0}
                          step={0.1}
                          value={conn.strength}
                          onChange={(e) => onChangeConnectionStrength(conn.id, parseFloat(e.target.value))}
                          className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                          style={{ accentColor: color }}
                          title="Connection strength"
                        />
                        <span className="text-[10px] font-mono text-slate-500 w-7 text-right">{conn.strength.toFixed(1)}</span>
                        <button
                          onClick={() => onFlipConnection(conn.id)}
                          title="Flip activation ↔ repression"
                          className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors"
                        >
                          <Repeat className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteConnection(conn.id)}
                          title="Delete connection"
                          className="p-1 rounded hover:bg-rose-100 text-rose-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <hr className="border-slate-100" />

      {/* Starter Circuits */}
      <div>
        <button
          onClick={() => setCircuitsExpanded(e => !e)}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Download className="w-4 h-4" /> Starter Circuits
          </h3>
          {circuitsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {circuitsExpanded && (
          <div className="space-y-3">
            {groupedCircuits.map(({ cat, label, circuits }) => circuits.length > 0 && (
              <div key={cat}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="space-y-1">
                  {circuits.map(circuit => (
                    <button
                      key={circuit.id}
                      onClick={() => onLoadCircuit(circuit.id)}
                      className="w-full p-2.5 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors group"
                    >
                      <div className="font-bold text-slate-700 text-xs group-hover:text-emerald-700 transition-colors">{circuit.name}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">{circuit.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
