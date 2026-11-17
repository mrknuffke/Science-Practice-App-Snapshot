import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Network, RefreshCw, CircleDot, Sparkles, Download, Code, Check } from 'lucide-react';
import SimulationHeader from '../simulations/shared/SimulationHeader';
import AboutPanel from '../simulations/shared/AboutPanel';
import { CONCEPT_MAP_ABOUT } from './ConceptMapAbout';
import { ConceptMapCanvas } from './ConceptMapCanvas';
import { ConceptMapInspector } from './ConceptMapInspector';
import {
  ConceptNode,
  ConceptEdge,
  ConceptMapEvaluation,
  PresetConceptItem,
} from './conceptMapTypes';
import { CONCEPT_MAP_PRESETS } from './conceptMapPresets';
import {
  evaluatePresetMap,
  arrangeInCircle,
  exportToMermaid,
  exportToMarkdown,
} from './conceptMapEngine';
import { evaluateConceptMapWithGemini } from '../../services/ai/conceptMap';
import { CourseType } from '../../types';

interface ConceptMapViewProps {
  onBack: () => void;
  course?: CourseType;
}

export const ConceptMapView: React.FC<ConceptMapViewProps> = ({ onBack, course }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('bio-cellular-energy');
  const [nodes, setNodes] = useState<ConceptNode[]>([]);
  const [edges, setEdges] = useState<ConceptEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bank' | 'selection' | 'evaluation'>('bank');
  const [evaluation, setEvaluation] = useState<ConceptMapEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentPreset = useMemo(
    () => CONCEPT_MAP_PRESETS.find(p => p.id === selectedPresetId) || CONCEPT_MAP_PRESETS[0],
    [selectedPresetId]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Initialize canvas with preset concepts arranged in a circle
  const loadPreset = useCallback((presetId: string) => {
    const preset = CONCEPT_MAP_PRESETS.find(p => p.id === presetId) || CONCEPT_MAP_PRESETS[0];
    setSelectedPresetId(preset.id);

    const initialNodes: ConceptNode[] = preset.concepts.map(c => ({
      id: c.id,
      label: c.label,
      x: 0,
      y: 0,
      category: c.category,
      description: c.description,
    }));

    const arranged = arrangeInCircle(initialNodes, 400, 310, 230);
    setNodes(arranged);
    setEdges([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setEvaluation(null);
    setActiveTab('bank');
  }, []);

  useEffect(() => {
    loadPreset('cellular_energy');
  }, [loadPreset]);

  // Node position update
  const handleUpdateNodePosition = (nodeId: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => (n.id === nodeId ? { ...n, x, y } : n)));
  };

  // Add edge between two nodes
  const handleAddEdge = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    // Avoid duplicate directed edges
    const exists = edges.some(e => e.source === sourceId && e.target === targetId);
    if (exists) {
      showToast('This directional connection already exists.');
      return;
    }

    const newEdgeId = `edge_${Date.now()}`;
    const newEdge: ConceptEdge = {
      id: newEdgeId,
      source: sourceId,
      target: targetId,
      label: 'relates to',
      status: 'unreviewed',
    };

    setEdges(prev => [...prev, newEdge]);
    setSelectedNodeId(null);
    setSelectedEdgeId(newEdgeId);
    setActiveTab('selection');
    showToast('Connection created. Select a linking phrase in the editor.');
  };

  // Add concept node from preset bank
  const handleAddNodeFromPreset = (term: PresetConceptItem) => {
    const existingCount = nodes.length;
    const angle = (existingCount * 45 * Math.PI) / 180;
    const newNode: ConceptNode = {
      id: term.id,
      label: term.label,
      x: Math.round(400 + 180 * Math.cos(angle)),
      y: Math.round(310 + 180 * Math.sin(angle)),
      category: term.category,
      description: term.description,
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setSelectedEdgeId(null);
  };

  // Add custom concept node
  const handleAddCustomNode = (label: string, category: string, description: string) => {
    const id = `custom_${Date.now()}`;
    const newNode: ConceptNode = {
      id,
      label,
      x: 350 + Math.floor(Math.random() * 100),
      y: 250 + Math.floor(Math.random() * 100),
      category: category || 'General',
      description,
      isCustom: true,
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setSelectedEdgeId(null);
    showToast(`Added "${label}" to canvas.`);
  };

  // Node editing & deletion
  const handleUpdateNode = (nodeId: string, updates: Partial<ConceptNode>) => {
    setNodes(prev => prev.map(n => (n.id === nodeId ? { ...n, ...updates } : n)));
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  // Edge editing & deletion
  const handleUpdateEdge = (edgeId: string, updates: Partial<ConceptEdge>) => {
    setEdges(prev => prev.map(e => (e.id === edgeId ? { ...e, ...updates } : e)));
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
    if (selectedEdgeId === edgeId) setSelectedEdgeId(null);
  };

  // Auto-arrange nodes in circle
  const handleArrangeInCircle = () => {
    setNodes(prev => arrangeInCircle(prev, 400, 310, 230));
    showToast('Concepts arranged in circle.');
  };

  // Run proposition evaluation
  const handleEvaluate = async () => {
    if (edges.length === 0) {
      showToast('Connect at least two concepts with a linking phrase to evaluate.');
      return;
    }

    setIsEvaluating(true);
    try {
      let result: ConceptMapEvaluation;
      const hasCustomNodes = nodes.some(n => n.isCustom);

      // If map uses standard preset without custom nodes, evaluate with canonical rule engine
      if (!hasCustomNodes && currentPreset) {
        result = evaluatePresetMap(nodes, edges, currentPreset);
      } else {
        // Fall back to AI semantic proposition auditor
        result = await evaluateConceptMapWithGemini(
          (course || 'AP Biology') as CourseType,
          currentPreset ? currentPreset.topic : 'General Science',
          nodes,
          edges
        );
      }

      setEvaluation(result);

      // Sync evaluation status back to edge visual styling on canvas
      const propMap = new Map(result.propositions.map(p => [p.id, p]));
      setEdges(prev =>
        prev.map(e => {
          const evalProp = propMap.get(e.id);
          if (evalProp) {
            return {
              ...e,
              status: evalProp.status,
              feedback: evalProp.feedback,
            };
          }
          return e;
        })
      );

      setActiveTab('evaluation');
      showToast(`Evaluation complete: ${result.masteryPercentage}% mastery.`);
    } catch (err: unknown) {
      console.error('Error evaluating concept map:', err);
      showToast('Evaluation encountered an error. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Export to Markdown
  const handleExportMarkdown = () => {
    const md = exportToMarkdown(
      currentPreset.title,
      course || currentPreset.course,
      currentPreset.topic,
      nodes,
      edges,
      evaluation || undefined
    );

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `concept-map-${currentPreset.id}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Markdown report downloaded.');
  };

  // Export to Mermaid diagram definition
  const handleExportMermaid = () => {
    const mermaidCode = exportToMermaid(currentPreset.title, nodes, edges);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mermaidCode);
      showToast('Mermaid diagram code copied to clipboard.');
    } else {
      showToast('Clipboard access unavailable.');
    }
  };

  // Selected element lookups
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  const selectedEdge = edges.find(e => e.id === selectedEdgeId) || null;
  const selectedEdgeSourceNode = selectedEdge ? nodes.find(n => n.id === selectedEdge.source) || null : null;
  const selectedEdgeTargetNode = selectedEdge ? nodes.find(n => n.id === selectedEdge.target) || null : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 max-w-full overflow-x-hidden">
      {/* Simulation Header */}
      <SimulationHeader
        title="Concept Map Builder"
        icon={Network}
        onBack={onBack}
        gradient="from-violet-600 to-indigo-600"
        onOpenAbout={() => setShowAbout(true)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3.5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Preset Selector & Layout Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Topic Preset:
            </span>
            <select aria-label="Topic preset"
              value={selectedPresetId}
              onChange={e => loadPreset(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {CONCEPT_MAP_PRESETS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.course})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleArrangeInCircle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
            title="Reposition concepts in circle"
          >
            <CircleDot className="w-3.5 h-3.5 text-violet-500" />
            <span>Circle Layout</span>
          </button>

          <button
            onClick={() => loadPreset(selectedPresetId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
            title="Reset to default preset state"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportMermaid}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
            title="Copy Mermaid diagram markdown"
          >
            <Code className="w-3.5 h-3.5 text-indigo-500" />
            <span>Copy Mermaid</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
            title="Download full Markdown study report"
          >
            <Download className="w-3.5 h-3.5 text-teal-500" />
            <span>Export Markdown</span>
          </button>

          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-black transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isEvaluating ? 'Evaluating...' : 'Evaluate Web'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Canvas + Inspector */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Canvas Workspace */}
        <div className="flex-1 w-full min-w-0">
          <ConceptMapCanvas
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            onSelectNode={id => {
              setSelectedNodeId(id);
              if (id) {
                setSelectedEdgeId(null);
                setActiveTab('selection');
              }
            }}
            onSelectEdge={id => {
              setSelectedEdgeId(id);
              if (id) {
                setSelectedNodeId(null);
                setActiveTab('selection');
              }
            }}
            onUpdateNodePosition={handleUpdateNodePosition}
            onAddEdge={handleAddEdge}
            onDeleteNode={handleDeleteNode}
          />
        </div>

        {/* Sidebar Inspector Drawer */}
        <ConceptMapInspector
          activeTab={activeTab}
          onTabChange={setActiveTab}
          presetTerms={currentPreset.concepts}
          existingNodeLabels={nodes.map(n => n.label)}
          onAddNodeFromPreset={handleAddNodeFromPreset}
          onAddCustomNode={handleAddCustomNode}
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          selectedEdgeSourceNode={selectedEdgeSourceNode}
          selectedEdgeTargetNode={selectedEdgeTargetNode}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onUpdateEdge={handleUpdateEdge}
          onDeleteEdge={handleDeleteEdge}
          evaluation={evaluation}
          isEvaluating={isEvaluating}
          onEvaluate={handleEvaluate}
          onClearSelection={() => {
            setSelectedNodeId(null);
            setSelectedEdgeId(null);
          }}
        />
      </div>

      {/* About / Help Panel */}
      <AboutPanel
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        content={CONCEPT_MAP_ABOUT}
      />
    </div>
  );
};

export default ConceptMapView;
