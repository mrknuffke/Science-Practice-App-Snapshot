import React, { useState } from 'react';
import {
  ConceptNode,
  ConceptEdge,
  ConceptMapEvaluation,
  PresetConceptItem,
  COMMON_LINKING_PHRASES,
} from './conceptMapTypes';
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  BookOpen,
  Sliders,
  Check,
  Award,
} from 'lucide-react';

interface ConceptMapInspectorProps {
  activeTab: 'bank' | 'selection' | 'evaluation';
  onTabChange: (tab: 'bank' | 'selection' | 'evaluation') => void;
  presetTerms: PresetConceptItem[];
  existingNodeLabels: string[];
  onAddNodeFromPreset: (term: PresetConceptItem) => void;
  onAddCustomNode: (label: string, category: string, description: string) => void;
  selectedNode: ConceptNode | null;
  selectedEdge: ConceptEdge | null;
  selectedEdgeSourceNode: ConceptNode | null;
  selectedEdgeTargetNode: ConceptNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<ConceptNode>) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<ConceptEdge>) => void;
  onDeleteEdge: (edgeId: string) => void;
  evaluation: ConceptMapEvaluation | null;
  isEvaluating: boolean;
  onEvaluate: () => void;
  onClearSelection: () => void;
}

export const ConceptMapInspector: React.FC<ConceptMapInspectorProps> = ({
  activeTab,
  onTabChange,
  presetTerms,
  existingNodeLabels,
  onAddNodeFromPreset,
  onAddCustomNode,
  selectedNode,
  selectedEdge,
  selectedEdgeSourceNode,
  selectedEdgeTargetNode,
  onUpdateNode,
  onDeleteNode,
  onUpdateEdge,
  onDeleteEdge,
  evaluation,
  isEvaluating,
  onEvaluate,
  onClearSelection,
}) => {
  // Custom Node form state
  const [customLabel, setCustomLabel] = useState('');
  const [customCategory, setCustomCategory] = useState('Pathway');
  const [customDescription, setCustomDescription] = useState('');

  const handleCreateCustomNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLabel.trim()) return;
    onAddCustomNode(customLabel.trim(), customCategory.trim(), customDescription.trim());
    setCustomLabel('');
    setCustomDescription('');
  };

  const unusedPresetTerms = presetTerms.filter(
    pt => !existingNodeLabels.some(label => label.toLowerCase() === pt.label.toLowerCase())
  );

  return (
    <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden min-h-[620px] max-h-[750px]">
      {/* Header Tabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-1.5 gap-1">
        <button
          onClick={() => onTabChange('bank')}
          className={`flex-1 py-2 px-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'bank'
              ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Term Bank</span>
          {unusedPresetTerms.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-[10px] font-bold flex items-center justify-center">
              {unusedPresetTerms.length}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('selection')}
          className={`flex-1 py-2 px-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'selection'
              ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Editor</span>
          {(selectedNode || selectedEdge) && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => onTabChange('evaluation')}
          className={`flex-1 py-2 px-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'evaluation'
              ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Scorecard</span>
          {evaluation && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {evaluation.masteryPercentage}%
            </span>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* ── TAB 1: TERM BANK ── */}
        {activeTab === 'bank' && (
          <div className="space-y-6">
            {/* Preset Terms Bank */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Topic Concept Bank
                </h4>
                <span className="text-[10px] text-slate-400 font-bold">
                  {unusedPresetTerms.length} available
                </span>
              </div>

              {unusedPresetTerms.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
                  <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    All preset concepts are on the canvas!
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {unusedPresetTerms.map(term => (
                    <button
                      key={term.id}
                      onClick={() => onAddNodeFromPreset(term)}
                      className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-left transition-all text-xs font-bold text-slate-700 dark:text-slate-200"
                      title={term.description}
                    >
                      <Plus className="w-3.5 h-3.5 text-violet-500 group-hover:scale-125 transition-transform" />
                      <span>{term.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Concept Creator */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Add Custom Concept
              </h4>
              <form onSubmit={handleCreateCustomNode} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Concept Name *
                  </label>
                  <input aria-label="Concept Name"
                    type="text"
                    value={customLabel}
                    onChange={e => setCustomLabel(e.target.value)}
                    placeholder="e.g. Proton Gradient"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Category
                  </label>
                  <select aria-label="Category"
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="Pathway">Pathway</option>
                    <option value="Molecule">Molecule</option>
                    <option value="Organelle">Organelle</option>
                    <option value="Energy">Energy</option>
                    <option value="Protein">Protein</option>
                    <option value="Intramolecular">Intramolecular</option>
                    <option value="Intermolecular">Intermolecular</option>
                    <option value="Vector">Vector</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Description (Optional)
                  </label>
                  <textarea aria-label="Description (Optional)"
                    value={customDescription}
                    onChange={e => setCustomDescription(e.target.value)}
                    placeholder="Brief definition or role..."
                    rows={2}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!customLabel.trim()}
                  className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Concept to Canvas</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 2: SELECTION EDITOR ── */}
        {activeTab === 'selection' && (
          <div className="space-y-5">
            {selectedNode ? (
              /* Selected Node Editor */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    Concept Node Selected
                  </span>
                  <button
                    onClick={onClearSelection}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Deselect
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Label
                  </label>
                  <input aria-label="Label"
                    type="text"
                    value={selectedNode.label}
                    onChange={e => onUpdateNode(selectedNode.id, { label: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Category
                  </label>
                  <select aria-label="Category"
                    value={selectedNode.category || 'General'}
                    onChange={e => onUpdateNode(selectedNode.id, { category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="Pathway">Pathway</option>
                    <option value="Molecule">Molecule</option>
                    <option value="Organelle">Organelle</option>
                    <option value="Energy">Energy</option>
                    <option value="Protein">Protein</option>
                    <option value="Intramolecular">Intramolecular</option>
                    <option value="Intermolecular">Intermolecular</option>
                    <option value="Vector">Vector</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Description
                  </label>
                  <textarea aria-label="Description"
                    value={selectedNode.description || ''}
                    onChange={e => onUpdateNode(selectedNode.id, { description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onDeleteNode(selectedNode.id)}
                    className="w-full py-2 px-3 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Concept Node</span>
                  </button>
                </div>
              </div>
            ) : selectedEdge && selectedEdgeSourceNode && selectedEdgeTargetNode ? (
              /* Selected Edge Editor */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    Proposition Connection
                  </span>
                  <button
                    onClick={onClearSelection}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Deselect
                  </button>
                </div>

                {/* Proposition Preview */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Active Proposition
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                      {selectedEdgeSourceNode.label}
                    </span>
                    <span className="text-violet-500 font-black">[{selectedEdge.label || '...'}]</span>
                    <span className="px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                      {selectedEdgeTargetNode.label}
                    </span>
                  </div>
                </div>

                {/* Linking Phrase Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Linking Phrase
                  </label>
                  <input aria-label="Linking Phrase"
                    type="text"
                    value={selectedEdge.label}
                    onChange={e => onUpdateEdge(selectedEdge.id, { label: e.target.value })}
                    placeholder="e.g. produces, consumes, regulates"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {/* Quick Linking Phrase Chips */}
                <div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    Common Scientific Linking Verbs
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_LINKING_PHRASES.map(phrase => (
                      <button
                        key={phrase}
                        onClick={() => onUpdateEdge(selectedEdge.id, { label: phrase })}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          selectedEdge.label.toLowerCase() === phrase
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-950/60'
                        }`}
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Feedback (if evaluated) */}
                {selectedEdge.status && (
                  <div className="p-3 rounded-2xl border text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      {selectedEdge.status === 'correct' && (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-700 dark:text-emerald-400">Validated Proposition</span>
                        </>
                      )}
                      {selectedEdge.status === 'needs_work' && (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span className="text-amber-700 dark:text-amber-400">Needs Refinement</span>
                        </>
                      )}
                      {selectedEdge.status === 'invalid' && (
                        <>
                          <XCircle className="w-4 h-4 text-rose-500" />
                          <span className="text-rose-700 dark:text-rose-400">Scientific Misconception</span>
                        </>
                      )}
                    </div>
                    {selectedEdge.feedback && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {selectedEdge.feedback}
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => onDeleteEdge(selectedEdge.id)}
                    className="w-full py-2 px-3 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Connection</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-2">
                <Sliders className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  No concept or connection selected
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[220px] mx-auto leading-normal">
                  Click on any concept card or connection arrow in the canvas to edit labels, categories, and linking verbs.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: EVALUATION SCORECARD ── */}
        {activeTab === 'evaluation' && (
          <div className="space-y-5">
            {evaluation ? (
              <div className="space-y-4">
                {/* Score Gauge Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-slate-800 dark:to-slate-850 border border-violet-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-violet-600" />
                      Concept Mastery
                    </span>
                    <span className="text-xl font-black text-violet-700 dark:text-violet-300">
                      {evaluation.masteryPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all duration-500 ${
                        evaluation.masteryPercentage >= 80
                          ? 'bg-emerald-500'
                          : evaluation.masteryPercentage >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${evaluation.masteryPercentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {evaluation.feedbackSummary}
                  </p>
                </div>

                {/* Validated Propositions */}
                {evaluation.propositions.filter(p => p.status === 'correct').length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Validated Propositions
                    </h5>
                    <div className="space-y-2">
                      {evaluation.propositions
                        .filter(p => p.status === 'correct')
                        .map(p => (
                          <div
                            key={p.id}
                            className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs"
                          >
                            <div className="font-bold text-emerald-900 dark:text-emerald-200">
                              {p.sourceLabel} <span className="font-black">[{p.linkingPhrase}]</span> {p.targetLabel}
                            </div>
                            {p.feedback && (
                              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 leading-normal">
                                {p.feedback}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Propositions Needing Work */}
                {evaluation.propositions.filter(p => p.status !== 'correct').length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Propositions to Refine
                    </h5>
                    <div className="space-y-2">
                      {evaluation.propositions
                        .filter(p => p.status !== 'correct')
                        .map(p => (
                          <div
                            key={p.id}
                            className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs"
                          >
                            <div className="font-bold text-amber-900 dark:text-amber-200">
                              {p.sourceLabel} <span className="font-black">[{p.linkingPhrase}]</span> {p.targetLabel}
                            </div>
                            <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1 leading-normal">
                              {p.feedback}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Missing Key Connections */}
                {evaluation.missingKeyConnections.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-2">
                      Missing Key Connections
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {evaluation.missingKeyConnections.map((missing, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-violet-500 font-bold">•</span>
                          <span className="text-[11px] leading-normal">{missing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Praise points */}
                {evaluation.praise.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Strengths Demonstrated
                    </h5>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {evaluation.praise.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-emerald-500">✓</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={onEvaluate}
                    disabled={isEvaluating}
                    className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isEvaluating ? 'Evaluating Propositions...' : 'Re-Evaluate Concept Web'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-violet-500 mx-auto" />
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                  Ready to check your concept web?
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                  Evaluate validates all directed propositions against scientific consensus, flags misconceptions, and highlights missing pathways.
                </p>
                <button
                  onClick={onEvaluate}
                  disabled={isEvaluating}
                  className="py-2.5 px-5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 mx-auto transition-all shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isEvaluating ? 'Evaluating...' : 'Evaluate Propositions'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
