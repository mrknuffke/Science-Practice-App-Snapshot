import React, { useState, useCallback, useRef } from 'react';
import { Move, RotateCcw, Sparkles, Loader2, Download } from 'lucide-react';
import { exportElementToPng } from '../../../utils/dataExport';
import { FbdForce, FbdForceType, FbdScenario, FbdVerifyResult } from '../../../types';
import {
  FORCE_DEFINITIONS, DEFAULT_MAGNITUDE,
  SurfaceType, SURFACE_LABELS, ObjectPreset, OBJECT_PRESET_LABELS,
} from './fbdConstants';
import { verifyFbd } from './fbdEngine';
import { FbdCanvas } from './FbdCanvas';
import { FbdForcePalette } from './FbdForcePalette';
import { FbdForceEditor } from './FbdForceEditor';
import { FbdVectorPanel } from './FbdVectorPanel';
import { FbdScenarioPicker } from './FbdScenarioPicker';
import { FbdCheckPanel } from './FbdCheckPanel';
import { FbdAiFeedbackPanel } from './FbdAiFeedbackPanel';
import { FBD_SCENARIOS } from './fbdScenarios';
import SimulationHeader from '../shared/SimulationHeader';
import AboutPanel from '../shared/AboutPanel';
import { SocraticMascotPanel } from '../shared/SocraticMascotPanel';
import { FBD_ABOUT } from './fbdAbout';
import { DEFAULT_MODEL, callAI, cleanJsonResponse } from '../../../services/ai/core';

interface FbdViewProps {
  onBack: () => void;
  isAuthenticated?: boolean;
}

type FbdMode = 'build' | 'practice';

const SURFACE_ICONS: Record<SurfaceType, string> = {
  flat: '▬',
  incline: '╱',
  rope: '⌇',
  water: '〰',
  air: '☁',
};

const OBJECT_ICONS: Record<ObjectPreset, string> = {
  block: '⬜',
  sphere: '⚽',
  car: '🚗',
  person: '🧍',
  book: '📖',
  crate: '📦',
  custom: '✏️',
};

const FBD_SOCRATIC_TIPS = [
  "When an object slides down a ramp with constant velocity, why is net force zero? What counteracts the parallel component of gravity?",
  "Why does normal force always act perpendicular to the surface? What is the physical origin of normal force?",
  "If a car accelerates forward, what force physically pushes it? Is it the engine, or the static friction between tires and road?",
  "When you throw a ball upward, what forces act on it at the absolute peak of its path? Does a vertical upward force still exist?",
  "Why does tension pull in both directions along a tight rope? Think about Newton's third law of action and reaction."
];

let _idCounter = 0;
function makeId() { return `f_${Date.now()}_${_idCounter++}`; }

export const FbdView: React.FC<FbdViewProps> = ({ onBack, isAuthenticated = false }) => {
  const [showAbout, setShowAbout] = useState(false);
  const [activeMode, setActiveMode] = useState<FbdMode>('build');

  // Forces state
  const [forces, setForces] = useState<FbdForce[]>([]);
  const [selectedForceId, setSelectedForceId] = useState<string | null>(null);

  // Build mode scene state
  const [surfaceType, setSurfaceType] = useState<SurfaceType>('flat');
  const [inclineAngle, setInclineAngle] = useState(30);
  const [objectPreset, setObjectPreset] = useState<ObjectPreset>('block');
  const [objectLabel, setObjectLabel] = useState('Block');
  const [context, setContext] = useState('');

  // AI object suggestion state
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ preset: ObjectPreset; label: string; context: string }>>([]);

  // Practice mode state
  const [scenario, setScenario] = useState<FbdScenario | null>(FBD_SCENARIOS[0]);
  const [verifyResult, setVerifyResult] = useState<FbdVerifyResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const addForce = useCallback((type: FbdForceType) => {
    const def = FORCE_DEFINITIONS[type];
    const newForce: FbdForce = {
      id: makeId(),
      type,
      label: def.symbol,
      magnitude: DEFAULT_MAGNITUDE,
      angle: def.defaultAngleDeg,
      color: def.color,
    };
    setForces(prev => [...prev, newForce]);
    setSelectedForceId(newForce.id);
  }, []);

  const updateForce = useCallback((id: string, patch: Partial<FbdForce>) => {
    setForces(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  }, []);

  const deleteForce = useCallback((id: string) => {
    setForces(prev => prev.filter(f => f.id !== id));
    setSelectedForceId(null);
  }, []);

  const dragForce = useCallback((id: string, newAngle: number, newMag: number) => {
    setForces(prev => prev.map(f => f.id === id ? { ...f, angle: newAngle, magnitude: newMag } : f));
  }, []);

  const clearForces = () => {
    setForces([]);
    setSelectedForceId(null);
    setVerifyResult(null);
    setShowSolution(false);
  };

  const handleSelectScenario = (s: FbdScenario) => {
    setScenario(s);
    clearForces();
  };

  const handleCheck = () => {
    if (!scenario) return;
    setVerifyResult(verifyFbd(forces, scenario));
  };

  // When user picks a preset, auto-update label to match
  const handleSetPreset = (p: ObjectPreset) => {
    setObjectPreset(p);
    if (p !== 'custom') setObjectLabel(OBJECT_PRESET_LABELS[p]);
  };

  // AI object suggestions
  const handleAiSuggest = async () => {
    setAiSuggesting(true);
    setAiSuggestions([]);
    try {
      const prompt = `You are a physics teacher. Given the surface type "${SURFACE_LABELS[surfaceType]}"${context ? ` and context: "${context}"` : ''}, suggest 4 concrete physics scenarios for a Free Body Diagram exercise.
For each, provide:
- preset: one of block, sphere, car, person, book, crate, custom
- label: short object name (max 8 chars)
- context: one sentence describing the scenario
 
Respond as JSON array: [{"preset":"...","label":"...","context":"..."},...]`;

      const response = await callAI(DEFAULT_MODEL, prompt, {
        responseMimeType: 'application/json',
      });
      const parsed = JSON.parse(cleanJsonResponse(response.text ?? '[]'));
      setAiSuggestions(Array.isArray(parsed) ? parsed.slice(0, 4) : []);
    } catch {
      setAiSuggestions([]);
    } finally {
      setAiSuggesting(false);
    }
  };

  const selectedForce = forces.find(f => f.id === selectedForceId) ?? null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto w-full min-w-0">
        <SimulationHeader
          title="Free Body Diagrams"
          onBack={onBack}
          icon={Move}
          gradient="from-cyan-500 to-blue-600"
          onOpenAbout={() => setShowAbout(true)}
        />

        {/* Mode Tabs */}
        <div className="flex gap-2 mt-5 mb-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 max-w-xs">
          <button
            onClick={() => { setActiveMode('build'); clearForces(); }}
            className={`flex-1 py-2 rounded-xl text-sm font-black transition-all ${activeMode === 'build' ? 'bg-cyan-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Build Mode
          </button>
          <button
            onClick={() => { setActiveMode('practice'); clearForces(); }}
            className={`flex-1 py-2 rounded-xl text-sm font-black transition-all ${activeMode === 'practice' ? 'bg-cyan-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Practice Mode
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left sidebar */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {activeMode === 'build' && (
              <>
                {/* Scene setup card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Scene Setup</h3>

                  {/* Surface type */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Surface</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(Object.keys(SURFACE_LABELS) as SurfaceType[]).map(s => (
                        <button
                          key={s}
                          onClick={() => setSurfaceType(s)}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-all flex flex-col items-center gap-0.5 ${
                            surfaceType === s
                              ? 'bg-cyan-600 text-white border-cyan-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          title={SURFACE_LABELS[s]}
                        >
                          <span className="text-base leading-none">{SURFACE_ICONS[s]}</span>
                          <span className="leading-tight text-center">{SURFACE_LABELS[s].split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Incline angle: only when incline surface */}
                  {surfaceType === 'incline' && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incline Angle</label>
                        <span className="text-xs font-bold text-cyan-600">{inclineAngle}°</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input aria-label="Incline angle"
                          type="range" min={5} max={60} step={5} value={inclineAngle}
                          onChange={e => setInclineAngle(parseInt(e.target.value))}
                          className="flex-1 h-3 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                        />
                        <input aria-label="Incline angle in degrees"
                          type="number" min={5} max={60} step={5} value={inclineAngle}
                          onChange={e => setInclineAngle(Math.max(5, Math.min(60, parseInt(e.target.value) || 5)))}
                          className="w-14 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Object preset */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Object Type</label>
                    <div className="grid grid-cols-4 gap-1">
                      {(Object.keys(OBJECT_PRESET_LABELS) as ObjectPreset[]).map(p => (
                        <button
                          key={p}
                          onClick={() => handleSetPreset(p)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all flex flex-col items-center gap-0.5 ${
                            objectPreset === p
                              ? 'bg-cyan-600 text-white border-cyan-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          title={OBJECT_PRESET_LABELS[p]}
                        >
                          <span className="text-sm leading-none">{OBJECT_ICONS[p]}</span>
                          <span>{OBJECT_PRESET_LABELS[p]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Object label */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Object Label</label>
                    <input aria-label="Object Label"
                      type="text" value={objectLabel}
                      onChange={e => setObjectLabel(e.target.value)}
                      maxLength={10}
                      placeholder="e.g. 'Block A'"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>

                  {/* Context / scenario description */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Context (optional)</label>
                    <textarea aria-label="Context (optional)"
                      value={context}
                      onChange={e => setContext(e.target.value)}
                      rows={2}
                      placeholder="e.g. A 5 kg box being pushed up a 30° ramp with friction..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                    />
                  </div>

                  {/* AI object suggestions (authed only) */}
                  {isAuthenticated && (
                    <div>
                      <button
                        onClick={handleAiSuggest}
                        disabled={aiSuggesting}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-violet-50 border border-violet-200 text-violet-700 rounded-xl text-xs font-black hover:bg-violet-100 transition-colors disabled:opacity-50"
                      >
                        {aiSuggesting
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                          : <><Sparkles className="w-3.5 h-3.5" /> AI: Suggest Scenarios</>
                        }
                      </button>
                      {aiSuggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {aiSuggestions.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                handleSetPreset(s.preset as ObjectPreset);
                                setObjectLabel(s.label);
                                setContext(s.context);
                                setAiSuggestions([]);
                              }}
                              className="w-full text-left px-3 py-2 bg-violet-50 border border-violet-200 rounded-xl text-[10px] text-violet-800 hover:bg-violet-100 transition-colors"
                            >
                              <span className="font-bold">{OBJECT_ICONS[s.preset as ObjectPreset] ?? '⬜'} {s.label}</span>
                              <span className="text-violet-600 ml-1">({s.context})</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            <FbdForcePalette onAddForce={addForce} activeTypes={forces.map(f => f.type)} />

            {selectedForce && (
              <FbdForceEditor
                force={selectedForce}
                onUpdate={patch => updateForce(selectedForceId!, patch)}
                onDelete={() => deleteForce(selectedForceId!)}
              />
            )}
          </div>

          {/* Main canvas */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Context display above canvas */}
            {activeMode === 'build' && context && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-2 text-xs text-cyan-800 font-medium">
                {context}
              </div>
            )}
            {activeMode === 'practice' && scenario && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-2 text-xs text-cyan-800 font-medium">
                <strong>{scenario.title}:</strong> {scenario.description}
              </div>
            )}

            <div ref={canvasContainerRef} className="bg-white rounded-2xl shadow-sm border-2 border-slate-200 overflow-hidden" style={{ aspectRatio: '6/5' }}>
              <FbdCanvas
                forces={forces}
                selectedForceId={selectedForceId}
                onSelectForce={setSelectedForceId}
                onDragForce={dragForce}
                surfaceType={surfaceType}
                inclineAngle={inclineAngle}
                objectLabel={objectLabel}
                scenario={activeMode === 'practice' ? (scenario ?? undefined) : undefined}
                verifyResult={verifyResult}
                showSolution={showSolution && activeMode === 'practice'}
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => canvasContainerRef.current && exportElementToPng(canvasContainerRef.current, 'free-body-diagram')}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Export PNG
              </button>
              <button
                onClick={clearForces}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Forces
              </button>
            </div>

            <FbdVectorPanel forces={forces} />
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {activeMode === 'practice' && scenario && (
              <>
                <FbdCheckPanel
                  forces={forces}
                  scenario={scenario}
                  verifyResult={verifyResult}
                  onCheck={handleCheck}
                  showSolution={showSolution}
                  onToggleSolution={() => {
                    const next = !showSolution;
                    setShowSolution(next);
                    if (next && scenario?.solutionForces && forces.length === 0) {
                      setForces(scenario.solutionForces.map(f => ({ ...f, id: makeId() })));
                    }
                  }}
                />
                <SocraticMascotPanel tips={FBD_SOCRATIC_TIPS} title="Mechanics Socratic Advisor" mood="thinking" />
                {isAuthenticated && (
                  <FbdAiFeedbackPanel forces={forces} scenario={scenario} />
                )}
                <FbdScenarioPicker currentScenario={scenario} onSelectScenario={handleSelectScenario} />
              </>
            )}

            {activeMode === 'build' && (
              <>
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 text-white">
                  <h3 className="text-sm font-black text-cyan-400 mb-3">Quick Tips</h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li>• Drag arrowheads to rotate forces</li>
                    <li>• Use slider + number box to set exact values</li>
                    <li>• Dashed arrow = net force direction</li>
                    <li>• Green ring = equilibrium (Fnet ≈ 0)</li>
                    <li>• Switch surface type to change the scene</li>
                    <li>• Switch to Practice Mode for guided scenarios</li>
                  </ul>
                </div>
                <SocraticMascotPanel tips={FBD_SOCRATIC_TIPS} title="Mechanics Socratic Advisor" mood="thinking" />
              </>
            )}
          </div>
        </div>
      </div>

      <AboutPanel
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        content={FBD_ABOUT}
        gradient="from-cyan-500 to-blue-600"
      />
    </div>
  );
};

export default FbdView;
