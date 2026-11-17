import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Network, Info, Trophy } from 'lucide-react';
import { RegulatoryNode, RegulatoryConnection, RegulatoryNodeType, NodeTypeDefinition, ModelerSavedState } from '../../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SIMULATION_TICK_MS, STARTER_CIRCUITS, GRAPH_HISTORY_LENGTH, DECAY_RATE, PRESET_NODE_TYPE_SETS } from './modelerConstants';
import { calculateNextStep } from './regulatoryEngine';
import { NetworkCanvas } from './NetworkCanvas';
import { NodeControls } from './NodeControls';
import { ActivityGraph, GraphDataPoint } from './ActivityGraph';
import SimulationHeader from '../shared/SimulationHeader';
import AboutPanel from '../shared/AboutPanel';
import ChallengeDeck from '../shared/ChallengeDeck';
import { ExportButtons } from '../shared/ExportButtons';
import { REGULATORY_ABOUT } from './regulatoryAbout';
import {
  REGULATORY_CHALLENGES,
  verifyRegulatoryChallenge,
  applyRegulatoryChallengeSolution,
} from './regulatoryChallenges';

const STORAGE_KEY = 'sp_regulatory_modeler_state';

const DEFAULT_NODE_TYPES: NodeTypeDefinition[] = PRESET_NODE_TYPE_SETS.gene_regulation.types;

interface RegulatoryModelerViewProps {
  onBack: () => void;
}

export const RegulatoryModelerView: React.FC<RegulatoryModelerViewProps> = ({ onBack }) => {
  const [showAbout, setShowAbout] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [nodes, setNodes] = useState<RegulatoryNode[]>([]);
  const [connections, setConnections] = useState<RegulatoryConnection[]>([]);
  const [nodeTypeDefinitions, setNodeTypeDefinitions] = useState<NodeTypeDefinition[]>(DEFAULT_NODE_TYPES);
  const [decayRate, setDecayRate] = useState(DECAY_RATE);
  const [history, setHistory] = useState<GraphDataPoint[]>([]);
  const tickCountRef = useRef(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<'activation' | 'repression' | null>(null);
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(0);

  const handleApplyChallenge = (idx: number) => {
    const ch = REGULATORY_CHALLENGES[idx];
    if (!ch) return;
    setIsRunning(false);
    setNodes(ch.start.nodes.map(n => ({ ...n })));
    setConnections(ch.start.connections.map(c => ({ ...c })));
    if (ch.start.nodeTypeSetId && PRESET_NODE_TYPE_SETS[ch.start.nodeTypeSetId]) {
      setNodeTypeDefinitions(PRESET_NODE_TYPE_SETS[ch.start.nodeTypeSetId].types);
    }
    setHistory([]);
    setSelectedNodeId(null);
    setIsConnecting(null);
    tickCountRef.current = 0;
  };

  const handleVerifyChallenge = () => {
    const ch = REGULATORY_CHALLENGES[challengeIdx];
    if (!ch) return { success: false, message: 'Select a challenge' };
    return verifyRegulatoryChallenge(ch.id, nodes, connections, decayRate);
  };

  const handleApplySolution = (idx: number) => {
    const ch = REGULATORY_CHALLENGES[idx];
    if (!ch) return;
    setIsRunning(false);
    applyRegulatoryChallengeSolution(
      ch,
      setNodes,
      setConnections,
      setNodeTypeDefinitions
    );
    setHistory([]);
    setSelectedNodeId(null);
    setIsConnecting(null);
    tickCountRef.current = 0;
  };

  const stepEngine = useCallback(() => {
    setNodes(prevNodes => {
      const nextNodes = calculateNextStep(prevNodes, connections, decayRate);
      tickCountRef.current += 1;
      const dataPoint: GraphDataPoint = { tick: tickCountRef.current };
      nextNodes.forEach(n => { dataPoint[n.id] = n.activationLevel; });
      setHistory(prevHistory => {
        const h = [...prevHistory, dataPoint];
        if (h.length > GRAPH_HISTORY_LENGTH) return h.slice(h.length - GRAPH_HISTORY_LENGTH);
        return h;
      });
      return nextNodes;
    });
  }, [connections, decayRate]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(stepEngine, SIMULATION_TICK_MS);
    return () => clearInterval(interval);
  }, [isRunning, stepEngine]);

  const handleAddNode = (type: RegulatoryNodeType) => {
    const typeDef = nodeTypeDefinitions.find(d => d.id === type);
    const id = `n_${Date.now()}`;
    const label = typeDef?.label ?? type;
    const newNode: RegulatoryNode = {
      id, type, label,
      position: { x: CANVAS_WIDTH / 2 - 60 + Math.random() * 120 - 60, y: CANVAS_HEIGHT / 2 - 40 + Math.random() * 80 },
      activationLevel: type === 'gene' ? 0 : 50,
      isManualToggle: type === 'signal',
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);
    setIsConnecting(null);
  };

  const handleClear = () => {
    setIsRunning(false);
    setNodes([]);
    setConnections([]);
    setHistory([]);
    setSelectedNodeId(null);
    setIsConnecting(null);
    tickCountRef.current = 0;
  };

  // Zero out activation levels (including signal toggles) and clear the graph
  // without touching the network: lets users re-run an experiment without
  // losing the circuit they built.
  const handleResetActivation = () => {
    setIsRunning(false);
    setNodes(prev => prev.map(n => ({ ...n, activationLevel: 0 })));
    setHistory([]);
    tickCountRef.current = 0;
  };

  const handleDeleteConnection = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
  };

  const handleFlipConnection = (id: string) => {
    setConnections(prev => prev.map(c =>
      c.id === id ? { ...c, type: c.type === 'activation' ? 'repression' : 'activation' } : c
    ));
  };

  const handleConnectionStrength = (id: string, strength: number) => {
    setConnections(prev => prev.map(c => (c.id === id ? { ...c, strength } : c)));
  };

  const handleLoadCircuit = (circuitId: string) => {
    const circuit = STARTER_CIRCUITS.find(c => c.id === circuitId);
    if (!circuit) return;
    handleClear();
    setNodes([...circuit.nodes]);
    setConnections([...circuit.connections]);
    // Load the matching preset type set if specified
    if (circuit.nodeTypeSetId && PRESET_NODE_TYPE_SETS[circuit.nodeTypeSetId]) {
      setNodeTypeDefinitions(PRESET_NODE_TYPE_SETS[circuit.nodeTypeSetId].types);
    }
  };

  const handleLoadPresetTypes = (setId: string) => {
    const set = PRESET_NODE_TYPE_SETS[setId];
    if (set) setNodeTypeDefinitions(set.types);
  };

  const handleSave = () => {
    const state: ModelerSavedState = { nodes, connections, nodeTypeDefinitions };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const handleLoad = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const state = JSON.parse(raw) as ModelerSavedState;
      setNodes(state.nodes ?? []);
      setConnections(state.connections ?? []);
      setNodeTypeDefinitions(state.nodeTypeDefinitions ?? DEFAULT_NODE_TYPES);
      setHistory([]);
      tickCountRef.current = 0;
    } catch {
      // corrupt storage: ignore
    }
  };

  // Node DOM is roughly 140×110 (min-w-[120px] + padding + header); clamp by full
  // node bounds, not a 40px radius (the prior bug let nodes drag mostly off-canvas).
  const NODE_W = 140;
  const NODE_H = 110;
  const handleUpdateNodePosition = (id: string, dx: number, dy: number) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== id) return n;
      const newX = Math.max(0, Math.min(CANVAS_WIDTH - NODE_W, n.position.x + dx));
      const newY = Math.max(0, Math.min(CANVAS_HEIGHT - NODE_H, n.position.y + dy));
      return { ...n, position: { x: newX, y: newY } };
    }));
  };

  const handleToggleSignal = (id: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id && n.isManualToggle) {
        return { ...n, activationLevel: n.activationLevel > 50 ? 0 : 100 };
      }
      return n;
    }));
    if (!isRunning) stepEngine();
  };

  const handleSelectNode = (id: string | null) => {
    if (isConnecting && selectedNodeId && id && id !== selectedNodeId) {
      const newConn: RegulatoryConnection = {
        id: `c_${Date.now()}`,
        sourceId: selectedNodeId,
        targetId: id,
        type: isConnecting,
        strength: 1.0,
      };
      setConnections(prev => [...prev, newConn]);
      setIsConnecting(null);
      setSelectedNodeId(null);
      return;
    }
    setSelectedNodeId(id);
    if (!id) setIsConnecting(null);
  };

  // Default circuit on first load
  useEffect(() => {
    if (nodes.length === 0 && connections.length === 0) {
      handleLoadCircuit('simple_activation');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load the starter circuit once; later edits that empty the canvas must not reload it.
  }, []);

  // ESC cancels connection mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isConnecting) {
        setIsConnecting(null);
        setSelectedNodeId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConnecting]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-full overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <SimulationHeader
            title="Biological Systems Modeler"
            onBack={onBack}
            icon={Network}
            gradient="from-emerald-600 to-teal-700"
            onOpenAbout={() => setShowAbout(true)}
          />
          <button
            onClick={() => {
              const next = !challengeMode;
              setChallengeMode(next);
              if (next) handleApplyChallenge(challengeIdx);
            }}
            className={`self-start sm:self-center flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all shadow-md shrink-0 ${
              challengeMode
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            <Trophy className={`w-4 h-4 ${challengeMode ? 'text-slate-950' : 'text-amber-500'}`} />
            <span>{challengeMode ? 'Exit Challenges' : 'Challenge Mode'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">

          {/* Main canvas + graph */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {challengeMode && (
              <ChallengeDeck
                title="Biological Systems Mastery Challenges"
                challenges={REGULATORY_CHALLENGES}
                currentIndex={challengeIdx}
                onSelectIndex={idx => {
                  setChallengeIdx(idx);
                  handleApplyChallenge(idx);
                }}
                onVerify={handleVerifyChallenge}
                onApplySolution={() => handleApplySolution(challengeIdx)}
                solutionUnlockAfter={2}
                accentGradient="from-emerald-600 to-teal-700"
                className="mb-1"
              />
            )}
            <div className="relative border-4 border-slate-200 rounded-2xl w-full h-[500px] overflow-hidden">
              <NetworkCanvas
                nodes={nodes}
                connections={connections}
                selectedNodeId={selectedNodeId}
                onSelectNode={handleSelectNode}
                onUpdateNodePosition={handleUpdateNodePosition}
                onToggleSignal={handleToggleSignal}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
              />

              {isConnecting && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full shadow text-sm font-bold z-50">
                  Click a target node to <strong>{isConnecting}</strong> it. ESC to cancel.
                </div>
              )}

              {selectedNodeId && !isConnecting && (
                <button
                  onClick={() => {
                    setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
                    setConnections(prev => prev.filter(c => c.sourceId !== selectedNodeId && c.targetId !== selectedNodeId));
                    setSelectedNodeId(null);
                  }}
                  className="absolute top-4 right-4 bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-2 rounded-lg text-xs font-black tracking-widest uppercase z-50 shadow-md"
                >
                  Delete Node
                </button>
              )}
            </div>

            <div className="flex justify-end">
              <ExportButtons
                csvData={history.map(h => {
                  const row: Record<string, unknown> = { tick: h.tick };
                  nodes.forEach(n => { row[n.label] = (h[n.id] ?? 0).toFixed(1); });
                  return row;
                })}
                csvFilename="regulatory-modeler-data"
              />
            </div>
            <ActivityGraph history={history} nodes={nodes} />
          </div>

          {/* Controls sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <NodeControls
              onAddNode={handleAddNode}
              onClear={handleClear}
              onResetActivation={handleResetActivation}
              onLoadCircuit={handleLoadCircuit}
              isRunning={isRunning}
              onTogglePlay={() => setIsRunning(!isRunning)}
              selectedNodeId={selectedNodeId}
              onStartConnection={setIsConnecting}
              isConnecting={isConnecting}
              onSave={handleSave}
              onLoad={handleLoad}
              nodeTypeDefinitions={nodeTypeDefinitions}
              onLoadPresetTypes={handleLoadPresetTypes}
              nodes={nodes}
              connections={connections}
              onDeleteConnection={handleDeleteConnection}
              onFlipConnection={handleFlipConnection}
              onChangeConnectionStrength={handleConnectionStrength}
            />

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4">
              <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                <span>Component Decay Rate</span>
                <span className="text-emerald-600">{(decayRate * 100).toFixed(0)}% / tick</span>
              </label>
              <input
                type="range" min={0.01} max={0.5} step={0.01} value={decayRate}
                onChange={e => setDecayRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">How quickly nodes return to 0 without incoming activation.</p>
            </div>

            <div className="bg-slate-800 rounded-3xl shadow-xl p-6 text-white overflow-hidden relative border border-slate-700">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Info className="w-24 h-24" /></div>
              <div className="relative z-10">
                <h3 className="text-sm font-black mb-4 text-emerald-400">Concept Tips</h3>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li><span className="text-emerald-400 font-bold">Negative Feedback:</span> Product represses its own production: creates homeostasis or oscillation.</li>
                  <li><span className="text-emerald-400 font-bold">Double Negative:</span> Repressing a repressor = net activation. A bistable switch.</li>
                  <li><span className="text-emerald-400 font-bold">Cascade:</span> A → B → C amplifies a weak signal across multiple steps.</li>
                  <li><span className="text-emerald-400 font-bold">Toggle signals:</span> Click Signal nodes while running to inject a pulse.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AboutPanel
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        content={REGULATORY_ABOUT}
        gradient="from-emerald-600 to-teal-700"
      />
    </div>
  );
};

export default RegulatoryModelerView;
