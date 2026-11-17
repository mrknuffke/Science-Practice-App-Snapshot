import { errorMessage } from '../../utils/errorMessage';
import React, { useState, useRef } from 'react';
import { ArrowLeft, Wand2, Printer, BookOpen, Grid3x3, RefreshCw, FileText, Check, Edit2, Trash2, Plus, Sparkles } from 'lucide-react';
import { CourseType, BingoTerm, BingoBoard } from '../../types';
import { BINGO_SMART_PRESETS, generateBingoBoards, generateBingoTermsFromAI, generateSmartPresetTerms, refreshBingoTerm, reviseBingoTerm } from '../../services/bingoService';
import { ReviseModal } from '../games/GameModals';

interface BingoGameViewProps {
    onBack: () => void;
    course: CourseType | null;
    topic: string | null;
}

const BingoGameView: React.FC<BingoGameViewProps> = ({ onBack, course, topic }) => {
    // --- State ---
    const [viewMode, setViewMode] = useState<'setup' | 'preview'>('setup');
    
    // Configuration
    const [selectedPresetId, setSelectedPresetId] = useState<string>('smart-periodic-table');
    const [customTopic, setCustomTopic] = useState<string>(topic || '');
    const [gradeLevel, setGradeLevel] = useState<string>('High School');
    
    // Track multi-select configuration dictionary for Smart Presets
    const [presetConfig, setPresetConfig] = useState<Record<string, string[]>>({});
    
    const [boardCount, setBoardCount] = useState<number>(20);
    const [printLayout, setPrintLayout] = useState<'1-per-page' | '2-per-page'>('1-per-page');
    const [includeFreeSpace, setIncludeFreeSpace] = useState<boolean>(true);
    
    // Game Data
    const [terms, setTerms] = useState<BingoTerm[]>([]);
    const [boards, setBoards] = useState<BingoBoard[]>([]);

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTermData, setEditTermData] = useState<Partial<BingoTerm>>({ clues: [] });

    // AI Revise / Regenerate state
    const [revisingId, setRevisingId] = useState<string | null>(null);
    const [reviseNotes, setReviseNotes] = useState('');
    const [busyTermId, setBusyTermId] = useState<string | null>(null);

    // UI State
    const [isLoadingTerms, setIsLoadingTerms] = useState(false);
    const [isGeneratingBoards, setIsGeneratingBoards] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Print
    const printRef = useRef<HTMLDivElement>(null);

    // --- Handlers ---
    
    // 1. Load Terms
    const handleLoadTerms = async () => {
        setIsLoadingTerms(true);
        setError(null);
        
        try {
            let activeTerms: BingoTerm[] = [];
            
            if (selectedPresetId === 'custom') {
                if (!customTopic.trim()) {
                    throw new Error("Please enter a custom topic.");
                }
                activeTerms = await generateBingoTermsFromAI(
                    course || 'Science' as CourseType, 
                    customTopic, 
                    gradeLevel, 
                    30 // Ask for 30 to ensure we have enough for a 5x5 board
                );
            } else {
                const preset = BINGO_SMART_PRESETS.find(p => p.id === selectedPresetId);
                if (!preset) throw new Error("Preset not found");
                
                activeTerms = await generateSmartPresetTerms(selectedPresetId, gradeLevel, presetConfig);
            }
            
            setTerms(activeTerms);
        } catch (e) {
            setError(errorMessage(e, "An unknown error occurred."));
        } finally {
            setIsLoadingTerms(false);
        }
    };

    // 2. Editor Handlers
    const handleAddTerm = () => {
        const newTerm: BingoTerm = {
            id: `manual-${Date.now()}`,
            term: 'New Term',
            clues: ['New Clue']
        };
        setTerms(prev => [newTerm, ...prev]);
        handleStartEdit(newTerm);
    };

    const handleDeleteTerm = (id: string) => {
        setTerms(prev => prev.filter(t => t.id !== id));
    };

    const handleStartEdit = (t: BingoTerm) => {
        setEditingId(t.id);
        setEditTermData({
            term: t.term,
            clues: [...(t.clues || [])]
        });
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        setTerms(prev => prev.map(t =>
            t.id === editingId ? { ...t, ...editTermData } as BingoTerm : t
        ));
        setEditingId(null);
    };

    const activeTopic = selectedPresetId === 'custom'
        ? customTopic
        : (BINGO_SMART_PRESETS.find(p => p.id === selectedPresetId)?.basePromptModifier || customTopic);

    const handleRefreshTerm = async (term: BingoTerm) => {
        setBusyTermId(term.id || null);
        setError(null);
        try {
            const replacement = await refreshBingoTerm(
                course || 'Science' as CourseType,
                activeTopic,
                gradeLevel,
                terms.filter(t => t.id !== term.id).map(t => t.term)
            );
            setTerms(prev => prev.map(t => t.id === term.id ? { ...replacement, id: term.id } as BingoTerm : t));
        } catch (e) {
            setError(errorMessage(e, 'Failed to refresh term.'));
        } finally {
            setBusyTermId(null);
        }
    };

    const handleConfirmRevise = async () => {
        if (!revisingId || !reviseNotes.trim()) return;
        const target = terms.find(t => t.id === revisingId);
        if (!target) return;
        setBusyTermId(revisingId);
        const id = revisingId;
        setRevisingId(null);
        try {
            const revised = await reviseBingoTerm(
                course || 'Science' as CourseType,
                activeTopic,
                gradeLevel,
                target,
                reviseNotes.trim()
            );
            setTerms(prev => prev.map(t => t.id === id ? { ...revised, id } as BingoTerm : t));
        } catch (e) {
            setError(errorMessage(e, 'AI Revise failed.'));
        } finally {
            setBusyTermId(null);
            setReviseNotes('');
        }
    };

    // 3. Generate Boards
    const handleGenerateBoards = () => {
        setIsGeneratingBoards(true);
        setError(null);
        
        try {
            const requiredCount = includeFreeSpace ? 24 : 25;
            if (terms.length < requiredCount) {
                 throw new Error(`You need at least ${requiredCount} terms to generate boards. Currently have ${terms.length}.`);
            }

            const generatedBoards = generateBingoBoards(terms, boardCount, includeFreeSpace);
            
            setBoards(generatedBoards);
            setViewMode('preview');
            
        } catch (e) {
            setError(errorMessage(e, "An unknown error occurred while generating boards."));
        } finally {
            setIsGeneratingBoards(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // --- Helpers ---
    const chunkArray = <T,>(arr: T[], chunkSize: number): T[][] => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            chunks.push(arr.slice(i, i + chunkSize));
        }
        return chunks;
    };

    const handlePresetChange = (presetId: string) => {
        setSelectedPresetId(presetId);
        setPresetConfig({}); // Reset config when changing preset
    };

    const handleConfigChange = (optionId: string, value: string, multiple: boolean) => {
        setPresetConfig(prev => {
            const currentVals = prev[optionId] || [];
            if (!multiple) {
                return { ...prev, [optionId]: [value] };
            } else {
                if (currentVals.includes(value)) {
                    return { ...prev, [optionId]: currentVals.filter(v => v !== value) };
                } else {
                    return { ...prev, [optionId]: [...currentVals, value] };
                }
            }
        });
    };

    const renderBoard = (board: BingoBoard, idx: number) => (
        <div key={board.id} className="w-full h-full flex flex-col border-4 border-slate-900 rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-900 text-white py-3 text-center print:py-2">
                <h2 className="text-2xl font-black uppercase tracking-widest print:text-xl px-2 truncate">
                    {selectedPresetId === 'custom' ? customTopic : BINGO_SMART_PRESETS.find(p => p.id === selectedPresetId)?.name || 'Science'} BINGO
                </h2>
                <div className="text-[10px] text-slate-400 font-medium">Board #{idx + 1}</div>
            </div>

            <div className="flex-1 grid grid-cols-5 grid-rows-5 divide-x-2 divide-y-2 divide-slate-300 border-t-4 border-slate-900 bg-white">
                {board.grid.map((row, rIdx) => 
                    row.map((cellText, cIdx) => (
                        <div key={`cell-${rIdx}-${cIdx}`} className="flex items-center justify-center p-2 text-center break-words aspect-square bg-white">
                            {cellText === null ? (
                                <div className="flex flex-col items-center justify-center text-rose-500">
                                    <span className="text-3xl mb-1 print:text-2xl">⭐</span>
                                    <span className="font-black text-[10px] uppercase tracking-wider">Free Space</span>
                                </div>
                            ) : (
                                <strong className="text-sm leading-tight text-slate-800 print:text-[10px]">{cellText}</strong>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    // --- Editor JSX (inlined where used) ---
    const termEditorMarkup = (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full max-h-[800px]">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-slate-700">Board Terms ({terms.length})</h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleAddTerm}
                        className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200 font-bold flex items-center gap-1 transition-colors"
                    >
                        <Plus className="w-3 h-3" /> Add
                    </button>
                    <button
                        onClick={handleLoadTerms}
                        disabled={isLoadingTerms || (selectedPresetId === 'custom' && !customTopic.trim())}
                        className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200 font-bold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoadingTerms ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                        {terms.length > 0 ? "Replace List" : "Load List"}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {terms.length === 0 && !isLoadingTerms && (
                    <div className="text-center p-12 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                        No terms loaded yet. Select a topic and use "Load List" to get AI or Preset terms, or "Add" to start typing manually.
                    </div>
                )}

                {terms.map(t => (
                    <div key={t.id} className="group flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors">
                        {editingId === t.id ? (
                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Term</label>
                                    <input aria-label="Term"
                                        className="w-full p-2 border rounded-lg text-sm font-bold bg-white"
                                        value={editTermData.term}
                                        onChange={e => setEditTermData(prev => ({ ...prev, term: e.target.value }))}
                                        placeholder="Term"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase flex justify-between items-center">
                                        <span>Clues</span>
                                        <button 
                                            onClick={() => setEditTermData(prev => ({ ...prev, clues: [...(prev.clues || []), ''] }))}
                                            className="text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3"/> Add Clue
                                        </button>
                                    </label>
                                    {(editTermData.clues || []).map((clue, idx) => (
                                        <div key={idx} className="flex gap-2 items-start">
                                            <span className="text-xs font-bold text-slate-400 mt-2">{idx + 1}.</span>
                                            <textarea aria-label="Clue"
                                                className="w-full p-2 border rounded-lg text-sm bg-white resize-y min-h-[40px]"
                                                value={clue}
                                                onChange={e => {
                                                    const newClues = [...(editTermData.clues || [])];
                                                    newClues[idx] = e.target.value;
                                                    setEditTermData(prev => ({ ...prev, clues: newClues }));
                                                }}
                                                placeholder="Enter a clue for this term..."
                                            />
                                            <button 
                                                onClick={() => {
                                                    const newClues = (editTermData.clues || []).filter((_, cIdx) => cIdx !== idx);
                                                    setEditTermData(prev => ({ ...prev, clues: newClues }));
                                                }}
                                                className="mt-2 p-1 text-slate-400 hover:text-red-500 transition-colors"
                title="Remove Clue"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ))}
                                    {(!editTermData.clues || editTermData.clues.length === 0) && (
                                        <div className="text-xs text-slate-400 italic">No clues added yet.</div>
                                    )}
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button onClick={handleSaveEdit} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-bold flex items-center gap-2 shadow-md">
                                        <Check className="w-4 h-4" /> Save Term
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-1">
                                    <div className="font-black text-slate-800 text-lg">{t.term}</div>
                                    {(t.clues && t.clues.length > 0) && (
                                        <div className="text-xs text-slate-500 flex flex-col gap-1 mt-2">
                                            {t.clues.map((clue, idx) => (
                                                <span key={idx}><strong>{idx + 1}.</strong> {clue}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 transition-opacity">
                                    <button
                                        onClick={() => handleStartEdit(t)}
                                        disabled={busyTermId === t.id}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-30"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => { setRevisingId(t.id || null); setReviseNotes(''); }}
                                        disabled={busyTermId === t.id}
                                        className="p-2 text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-lg transition-colors disabled:opacity-30"
                                        title="AI Revise — describe what to change"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleRefreshTerm(t)}
                                        disabled={busyTermId === t.id}
                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-30"
                                        title="Regenerate this term (single AI call, dedupes)"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${busyTermId === t.id ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTerm(t.id || '')}
                                        disabled={busyTermId === t.id}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    // --- Renders ---

    if (viewMode === 'setup') {
        const requiredCount = includeFreeSpace ? 24 : 25;
        const hasEnoughTerms = terms.length >= requiredCount;

        return (
            <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
                <div className="w-full max-w-7xl">
                    <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-900/50">
                                    <span className="text-2xl">🔢</span>
                                </div>
                                <h1 className="text-3xl font-black text-slate-900">BINGO Generator</h1>
                            </div>
                            <p className="text-slate-500">Create printable randomized BINGO boards & calling scripts for any topic.</p>
                        </div>
                        <button
                            onClick={handleGenerateBoards}
                            disabled={isGeneratingBoards || !hasEnoughTerms}
                            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all ${!hasEnoughTerms ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700 text-white hover:shadow-sky-500/25'}`}
                        >
                            {isGeneratingBoards ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
                            Preview & Print
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium flex items-start gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Settings Column */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs">1</span>
                                    Settings & Source
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <BookOpen className="w-3 h-3" /> Topic Source
                                        </label>
                                        <select aria-label="Topic Source"
                                            value={selectedPresetId}
                                            onChange={(e) => handlePresetChange(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-sky-600 transition-all font-bold text-slate-800 text-sm"
                                        >
                                            <optgroup label="Smart Presets (AI Configurable)">
                                                {BINGO_SMART_PRESETS.map(preset => (
                                                    <option key={preset.id} value={preset.id}>{preset.name}</option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="AI Generator">
                                                <option value="custom">✨ Custom Topic (AI Generated)</option>
                                            </optgroup>
                                        </select>
                                    </div>

                                    {/* Grade Level ALWAYS shown for AI sizing now since all presets hit AI */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Grade Level</label>
                                        <select aria-label="Target Grade Level"
                                            value={gradeLevel}
                                            onChange={(e) => setGradeLevel(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-sky-600 transition-all font-bold text-slate-800 text-sm"
                                        >
                                            <option>Elementary School</option>
                                            <option>Middle School</option>
                                            <option>High School</option>
                                            <option>AP / College</option>
                                        </select>
                                    </div>

                                    {/* Smart Preset Config Options UI */}
                                    {selectedPresetId !== 'custom' && (
                                        <div className="space-y-4 p-4 bg-sky-50 rounded-xl border border-sky-100">
                                            {BINGO_SMART_PRESETS.find(p => p.id === selectedPresetId)?.options.map(opt => {
                                                const selectedValues = presetConfig[opt.id] || opt.defaultValues;
                                                return (
                                                    <div key={opt.id}>
                                                        <label className="block text-xs font-bold text-slate-600 mb-2">{opt.label}</label>
                                                        {opt.type === 'select' ? (
                                                            <select aria-label={opt.label}
                                                                className="w-full bg-white border border-slate-200 p-2 rounded-lg text-sm text-slate-700 font-medium"
                                                                value={selectedValues[0] || opt.defaultValues[0]}
                                                                onChange={(e) => handleConfigChange(opt.id, e.target.value, false)}
                                                            >
                                                                {opt.choices.map(c => (
                                                                    <option key={c} value={c}>{c}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {opt.choices.map(c => {
                                                                    const isChecked = selectedValues.includes(c);
                                                                    return (
                                                                        <label key={c} className="flex items-start gap-2 cursor-pointer group">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isChecked}
                                                                                onChange={() => handleConfigChange(opt.id, c, true)}
                                                                                className="mt-1 flex-shrink-0 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-600"
                                                                            />
                                                                            <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                                                                {c}
                                                                            </span>
                                                                        </label>
                                                                    );
                                                                })}
                                                                {selectedValues.length === 0 && (
                                                                    <p className="text-[10px] text-red-500 font-bold mt-1">Please select at least one.</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Custom Topic Input */}
                                    {selectedPresetId === 'custom' && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                    <Wand2 className="w-3 h-3" /> Custom Topic
                                                </label>
                                                <input aria-label="Custom Topic"
                                                    type="text"
                                                    value={customTopic}
                                                    onChange={(e) => setCustomTopic(e.target.value)}
                                                    placeholder="e.g. DNA Replication, Kinematics"
                                                    className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-sky-600 transition-all font-bold text-slate-800 text-sm"
                                                />
                                                <p className="text-[10px] text-slate-400 mt-1">Requires ~30 terms from AI.</p>
                                            </div>
                                        </>
                                    )}

                                    <div className="h-px bg-slate-200 w-full my-4"></div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Number of Boards</label>
                                        <input aria-label="Number of Boards"
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={boardCount}
                                            onChange={(e) => setBoardCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                                            className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-sky-600 transition-all font-bold text-slate-800 text-sm"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">Unique student boards (Max 50)</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Print Layout</label>
                                        <select aria-label="Print Layout"
                                            value={printLayout}
                                            onChange={(e) => setPrintLayout(e.target.value as '1-per-page' | '2-per-page')}
                                            className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-sky-600 transition-all font-bold text-slate-800 text-sm"
                                        >
                                            <option value="1-per-page">1 Board Per Page (Large)</option>
                                            <option value="2-per-page">2 Boards Per Page (Half-sheets)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Center Square</label>
                                        <button
                                            onClick={() => setIncludeFreeSpace(!includeFreeSpace)}
                                            className={`w-full p-3 rounded-xl font-bold border-2 transition-all flex items-center justify-between ${includeFreeSpace ? 'bg-sky-50 border-sky-500 text-sky-700 ring-1 ring-sky-500' : 'bg-white border-slate-200 text-slate-600'}`}
                                        >
                                            <span className="text-sm">Use Free Space</span>
                                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${includeFreeSpace ? 'bg-sky-500' : 'bg-slate-300'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${includeFreeSpace ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                            </div>
                                        </button>
                                        <p className="text-[10px] text-slate-400 mt-1">{includeFreeSpace ? 'Requires 24 terms minimum.' : 'Requires 25 terms minimum.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Editor Column */}
                        <div className="lg:col-span-2 flex flex-col">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs">2</span>
                                Term Review & Edit
                            </h3>
                            {termEditorMarkup}
                        </div>
                    </div>
                </div>

                {revisingId && (
                    <ReviseModal
                        itemNoun="Term"
                        currentLabel={terms.find(t => t.id === revisingId)?.term || ''}
                        explainer="Describe what you want changed. The AI will revise the term and/or its clues."
                        placeholder="e.g., Make the clues more concrete; swap to a related but easier term; add a real-world example clue…"
                        notes={reviseNotes}
                        onChange={setReviseNotes}
                        onConfirm={handleConfirmRevise}
                        onCancel={() => { setRevisingId(null); setReviseNotes(''); }}
                    />
                )}
            </div>
        );
    }

    // --- Preview / Print View ---

    return (
        <div className="min-h-screen bg-slate-100 pb-12">
            {/* Control Bar */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg print:hidden sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => setViewMode('setup')} className="text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Setup
                    </button>
                    <div className="h-6 w-px bg-slate-700"></div>
                    <span className="font-bold flex items-center gap-2">
                        <Grid3x3 className="w-4 h-4 text-sky-400"/>
                        BINGO: {selectedPresetId === 'custom' ? customTopic : BINGO_SMART_PRESETS.find(p => p.id === selectedPresetId)?.name}
                    </span>
                    <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md font-medium">
                        {boardCount} Boards
                    </span>
                </div>
                <button onClick={handlePrint} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20">
                    <Printer className="w-4 h-4" /> Print PDF
                </button>
            </div>

            {/* Print Area */}
            <div className="max-w-[210mm] mx-auto print:max-w-none" ref={printRef}>
                <style>{`
                    @media print {
                         @page { size: A4 portrait; margin: 10mm; }
                         body { background: white; -webkit-print-color-adjust: exact; }
                         .print-break { break-after: page; page-break-after: always; break-inside: avoid; }
                         .print-break:last-child { break-after: auto; page-break-after: auto; }
                         .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                    }
                `}</style>

                {/* BOARD PAGES */}
                {printLayout === '1-per-page' ? (
                    // 1 BOARD PER PAGE
                    boards.map((board, idx) => (
                        <div key={board.id} className="p-[10mm] min-h-[277mm] flex flex-col print-break bg-white shadow-xl my-8 print:shadow-none print:my-0">
                            <div className="flex-1 flex flex-col p-4 w-full h-full max-w-[190mm] mx-auto aspect-square">
                                {renderBoard(board, idx)}
                            </div>
                        </div>
                    ))
                ) : (
                    // 2 BOARDS PER PAGE (Vertical Stack)
                    chunkArray(boards, 2).map((chunk, chunkIdx) => (
                        <div key={`chunk-${chunkIdx}`} className="p-[8mm] min-h-[277mm] h-[297mm] flex flex-col justify-between print-break bg-white shadow-xl my-8 print:shadow-none print:my-0 gap-6">
                            {chunk.map((board, idxInChunk) => (
                                <div key={board.id} className="flex-1 flex flex-col w-[160mm] h-[160mm] mx-auto">
                                    {renderBoard(board, chunkIdx * 2 + idxInChunk)}
                                </div>
                            ))}
                        </div>
                    ))
                )}

                {/* CALLING SCRIPT (Always appends at the end) */}
                <div className="p-[10mm] min-h-[277mm] flex flex-col print-break bg-white shadow-xl my-8 print:shadow-none print:my-0 font-sans">
                    <div className="flex items-center justify-between mb-8 border-b-2 border-slate-200 pb-4">
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
                                <FileText className="w-8 h-8 text-sky-600" />
                                Teacher Calling Script
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">Topic: {selectedPresetId === 'custom' ? customTopic : BINGO_SMART_PRESETS.find(p => p.id === selectedPresetId)?.name}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-slate-800">{terms.length}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Terms</div>
                        </div>
                    </div>
                    
                    <div className="mb-6 rounded-xl bg-sky-50 text-sky-800 p-4 border border-sky-100 text-sm">
                        <strong className="block mb-1 text-sky-900">How to play:</strong>
                        To increase difficulty, do not read the term itself. Instead, read the Definition, Example, or Fill-in-the-Blank sentence and have students figure out which term to mark on their boards. Keep track of which items you've called by checking the box next to them.
                    </div>

                    <div className="space-y-6 flex-1 columns-1">
                        {terms.map((t, idx) => (
                            <div key={`term-${idx}`} className="flex gap-4 p-4 border rounded-xl border-slate-200 bg-slate-50 break-inside-avoid">
                                <div className="pt-1">
                                    <div className="w-6 h-6 rounded border-2 border-slate-300 bg-white"></div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-slate-800 mb-2">{t.term}</h3>
                                    <ul className="space-y-2 text-sm">
                                        {t.clues && t.clues.length > 0 ? (
                                            t.clues.map((clue, cIdx) => (
                                                <li key={cIdx} className="flex gap-2 text-slate-600">
                                                    <span className="font-bold text-slate-400 text-[10px] w-4 pt-0.5">{cIdx + 1}.</span>
                                                    <span className="flex-1 italic">{clue}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-slate-400 italic text-xs">No clues provided for this term.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BingoGameView;
