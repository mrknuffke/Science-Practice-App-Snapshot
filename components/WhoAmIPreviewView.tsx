import { errorMessage } from '../utils/errorMessage';
import React, { useState } from 'react';
import { WhoAmIPuzzle, CourseType } from '../types';
import { ArrowLeft, Play, RefreshCw, Edit2, Check, X, Save, Upload, Share2, Download, ChevronDown, ChevronUp, Sparkles, Plus, Trash2 } from 'lucide-react';
import { cleanHtml } from '../utils/sanitize';
import { saveWhoAmIGame, exportWhoAmIGame, importWhoAmIGame, SavedWhoAmIGame } from '../services/storageService';
import { reviseWhoAmIPuzzle, addOneWhoAmIPuzzle, refreshWhoAmIClue, addOneWhoAmIClue } from '../services/ai/whoAmI';
import LoadGameModal from './whoAmI/LoadGameModal';
import { ReviseModal } from './games/GameModals';
import { useDialog } from '../hooks/useDialog';

interface WhoAmIPreviewViewProps {
    puzzles: WhoAmIPuzzle[];
    course: CourseType;
    topic: string;
    onBack: () => void;
    onStartGame: (puzzles: WhoAmIPuzzle[]) => void;
    onRegenerateClues: (puzzleIndex: number, difficulty?: 'easier' | 'harder') => void;
    onLoadGame: (puzzles: WhoAmIPuzzle[]) => void;
    isRegenerating: boolean;
}

const WhoAmIPreviewView: React.FC<WhoAmIPreviewViewProps> = ({
    puzzles,
    course,
    topic,
    onBack,
    onStartGame,
    onRegenerateClues,
    onLoadGame,
    isRegenerating
}) => {
    const [editedPuzzles, setEditedPuzzles] = useState<WhoAmIPuzzle[]>(puzzles);
    const [editingPuzzle, setEditingPuzzle] = useState<number | null>(null);
    const [editingClue, setEditingClue] = useState<{ puzzleIdx: number; clueIdx: number } | null>(null);
    const [editValue, setEditValue] = useState('');

    // Save/Load/Share modals
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const saveDialog = useDialog({ onClose: () => { setShowSaveModal(false); setGameName(''); }, labelledBy: 'whoami-save-title', open: showSaveModal });
    const shareDialog = useDialog({ onClose: () => setShowShareModal(false), labelledBy: 'whoami-share-title', open: showShareModal });
    const [gameName, setGameName] = useState('');
    const [shareJSON, setShareJSON] = useState('');
    const [importJSON, setImportJSON] = useState('');

    // AI Revise + Add modals
    const [revisingPuzzleIdx, setRevisingPuzzleIdx] = useState<number | null>(null);
    const [reviseNotes, setReviseNotes] = useState('');
    const [busyPuzzleIdx, setBusyPuzzleIdx] = useState<number | null>(null);
    const [addingNew, setAddingNew] = useState(false);
    const [aiActionError, setAiActionError] = useState<string | null>(null);

    const handleOpenRevise = (idx: number) => {
        setRevisingPuzzleIdx(idx);
        setReviseNotes('');
        setAiActionError(null);
    };

    const handleConfirmRevise = async () => {
        if (revisingPuzzleIdx === null || !reviseNotes.trim()) return;
        const idx = revisingPuzzleIdx;
        setBusyPuzzleIdx(idx);
        setRevisingPuzzleIdx(null);
        try {
            const revised = await reviseWhoAmIPuzzle(course, topic, editedPuzzles[idx], reviseNotes.trim());
            const updated = [...editedPuzzles];
            updated[idx] = { ...revised, id: editedPuzzles[idx].id };
            setEditedPuzzles(updated);
        } catch (e) {
            setAiActionError(errorMessage(e, 'AI Revise failed.'));
        } finally {
            setBusyPuzzleIdx(null);
            setReviseNotes('');
        }
    };

    const handleAddPuzzle = async () => {
        setAddingNew(true);
        setAiActionError(null);
        try {
            const existing = editedPuzzles.map(p => p.entity);
            const newPuzzle = await addOneWhoAmIPuzzle(course, topic, existing);
            setEditedPuzzles([newPuzzle, ...editedPuzzles]);
        } catch (e) {
            setAiActionError(errorMessage(e, 'Failed to add a new puzzle.'));
        } finally {
            setAddingNew(false);
        }
    };

    const handleDeletePuzzle = (idx: number) => {
        if (editedPuzzles.length <= 1) {
            alert('You need at least one puzzle.');
            return;
        }
        if (!confirm(`Delete puzzle "${editedPuzzles[idx].entity}"?`)) return;
        setEditedPuzzles(editedPuzzles.filter((_, i) => i !== idx));
    };

    // --- Per-clue editing ---
    // busyClue: { puzzleIdx, clueIdx } when an AI call is in flight for a specific clue
    const [busyClue, setBusyClue] = useState<{ puzzleIdx: number; clueIdx: number } | null>(null);

    const handleRegenerateClue = async (puzzleIdx: number, clueIdx: number) => {
        setBusyClue({ puzzleIdx, clueIdx });
        setAiActionError(null);
        try {
            const newClue = await refreshWhoAmIClue(course, editedPuzzles[puzzleIdx], clueIdx);
            const updated = editedPuzzles.map((p, pi) =>
                pi !== puzzleIdx ? p : {
                    ...p,
                    clues: p.clues.map((c, ci) => ci === clueIdx ? newClue : c)
                }
            );
            setEditedPuzzles(updated);
        } catch (e) {
            setAiActionError(errorMessage(e, 'Failed to regenerate clue.'));
        } finally {
            setBusyClue(null);
        }
    };

    const handleDeleteClue = (puzzleIdx: number, clueIdx: number) => {
        if (editedPuzzles[puzzleIdx].clues.length <= 2) {
            alert('Each puzzle needs at least 2 clues.');
            return;
        }
        const updated = editedPuzzles.map((p, pi) =>
            pi !== puzzleIdx ? p : { ...p, clues: p.clues.filter((_, ci) => ci !== clueIdx) }
        );
        setEditedPuzzles(updated);
    };

    const handleAddClue = async (puzzleIdx: number) => {
        const puzzle = editedPuzzles[puzzleIdx];
        if (puzzle.clues.length >= 7) return;
        setBusyClue({ puzzleIdx, clueIdx: puzzle.clues.length });
        setAiActionError(null);
        try {
            const newClue = await addOneWhoAmIClue(course, puzzle, puzzle.clues.length + 1);
            const updated = editedPuzzles.map((p, pi) =>
                pi !== puzzleIdx ? p : { ...p, clues: [...p.clues, newClue] }
            );
            setEditedPuzzles(updated);
        } catch (e) {
            setAiActionError(errorMessage(e, 'Failed to add clue.'));
        } finally {
            setBusyClue(null);
        }
    };

    const handleStartEdit = (puzzleIdx: number, clueIdx: number) => {
        setEditingClue({ puzzleIdx, clueIdx });
        setEditValue(editedPuzzles[puzzleIdx].clues[clueIdx]);
    };

    const handleSaveEdit = () => {
        if (editingClue) {
            const updated = [...editedPuzzles];
            updated[editingClue.puzzleIdx].clues[editingClue.clueIdx] = editValue;
            setEditedPuzzles(updated);
            setEditingClue(null);
            setEditValue('');
        }
    };

    const handleCancelEdit = () => {
        setEditingClue(null);
        setEditValue('');
    };

    const handleEditEntity = (puzzleIdx: number) => {
        setEditingPuzzle(puzzleIdx);
        setEditValue(editedPuzzles[puzzleIdx].entity);
    };

    const handleSaveEntity = () => {
        if (editingPuzzle !== null) {
            const updated = [...editedPuzzles];
            updated[editingPuzzle].entity = editValue;
            setEditedPuzzles(updated);
            setEditingPuzzle(null);
            setEditValue('');
        }
    };

    const handleCancelEntity = () => {
        setEditingPuzzle(null);
        setEditValue('');
    };

    const handleSaveGame = () => {
        if (!gameName.trim()) return;

        const saved = saveWhoAmIGame(gameName, course, topic, editedPuzzles);
        alert(`Game "${saved.name}" saved successfully!`);
        setShowSaveModal(false);
        setGameName('');
    };

    const handleLoadGame = (game: SavedWhoAmIGame) => {
        setEditedPuzzles(game.puzzles);
        onLoadGame(game.puzzles);
        setShowLoadModal(false);
    };

    const handleExportGame = () => {
        const tempGame: SavedWhoAmIGame = {
            id: 'temp',
            name: gameName || `${course} - ${topic}`,
            course,
            topic,
            puzzles: editedPuzzles,
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString()
        };
        setShareJSON(exportWhoAmIGame(tempGame));
        setShowShareModal(true);
    };

    const handleImportGame = () => {
        const imported = importWhoAmIGame(importJSON);
        if (imported) {
            alert(`Game "${imported.name}" imported successfully!`);
            handleLoadGame(imported);
            setImportJSON('');
        } else {
            alert('Failed to import game. Please check the JSON format.');
        }
    };

    const handleCopyJSON = () => {
        navigator.clipboard.writeText(shareJSON);
        alert('Game JSON copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={onBack}
                            className="text-slate-400 hover:text-slate-600 flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Setup
                        </button>

                        <div className="text-center">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Review & Edit Puzzles</h1>
                            <p className="text-slate-500 font-medium mt-1">{course} - {topic}</p>
                        </div>

                        <button
                            onClick={() => onStartGame(editedPuzzles)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                        >
                            <Play className="w-5 h-5" fill="currentColor" />
                            Start Game
                        </button>
                    </div>

                    {/* Toolbar Buttons */}
                    <div className="flex gap-3 justify-center flex-wrap">
                        <button
                            onClick={handleAddPuzzle}
                            disabled={addingNew}
                            className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                        >
                            {addingNew ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {addingNew ? 'Generating…' : 'Add Puzzle (AI)'}
                        </button>
                        <button
                            onClick={() => {
                                if (!confirm('Regenerate all puzzles? Your current edits will be replaced.')) return;
                                onRegenerateClues(-1); // -1 = signal for bulk regenerate (handled in App.tsx)
                            }}
                            disabled={isRegenerating}
                            className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isRegenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            Regenerate All
                        </button>
                        <button
                            onClick={() => setShowSaveModal(true)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save Game
                        </button>
                        <button
                            onClick={() => setShowLoadModal(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            Load Game
                        </button>
                        <button
                            onClick={handleExportGame}
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            Share/Export
                        </button>
                    </div>
                </header>

                {aiActionError && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium flex items-center justify-between">
                        <span>{aiActionError}</span>
                        <button aria-label="Dismiss error" onClick={() => setAiActionError(null)} className="text-rose-500 hover:text-rose-700"><X className="w-4 h-4" /></button>
                    </div>
                )}

                {/* Puzzle Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {editedPuzzles.map((puzzle, pIdx) => (
                        <div
                            key={pIdx}
                            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200 hover:border-indigo-300 transition-all"
                        >
                            {/* Puzzle Header */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                        Puzzle {pIdx + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenRevise(pIdx)}
                                            disabled={busyPuzzleIdx === pIdx || isRegenerating}
                                            className="text-fuchsia-600 hover:text-fuchsia-500 flex items-center gap-1 text-xs font-bold transition-colors disabled:opacity-50"
                                            title="Revise this puzzle with AI based on your notes"
                                        >
                                            {busyPuzzleIdx === pIdx ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                            AI Revise
                                        </button>
                                        <button
                                            onClick={() => onRegenerateClues(pIdx)}
                                            disabled={isRegenerating}
                                            className="text-indigo-600 hover:text-indigo-500 flex items-center gap-1 text-xs font-bold transition-colors disabled:opacity-50"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                                            Regenerate
                                        </button>
                                        <button
                                            onClick={() => handleDeletePuzzle(pIdx)}
                                            className="text-rose-500 hover:text-rose-400 flex items-center gap-1 text-xs font-bold transition-colors"
                                            title="Delete puzzle"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {/* Difficulty Adjustment Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onRegenerateClues(pIdx, 'easier')}
                                        disabled={isRegenerating}
                                        className="flex-1 text-emerald-600 hover:text-emerald-500 hover:bg-emerald-50 flex items-center justify-center gap-1 text-xs font-bold py-1.5 px-2 rounded-lg transition-all disabled:opacity-50 border border-emerald-200"
                                    >
                                        <ChevronDown className="w-3 h-3" />
                                        Make Easier
                                    </button>
                                    <button
                                        onClick={() => onRegenerateClues(pIdx, 'harder')}
                                        disabled={isRegenerating}
                                        className="flex-1 text-rose-600 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center gap-1 text-xs font-bold py-1.5 px-2 rounded-lg transition-all disabled:opacity-50 border border-rose-200"
                                    >
                                        <ChevronUp className="w-3 h-3" />
                                        Make Harder
                                    </button>
                                </div>
                            </div>

                            {/* Entity Name */}
                            <div className="mb-4 pb-4 border-b border-slate-200">
                                {editingPuzzle === pIdx ? (
                                    <div className="space-y-2">
                                        <input aria-label="Entity name"
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-indigo-500 rounded-lg px-3 py-2 text-lg font-bold focus:outline-none"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSaveEntity}
                                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                                            >
                                                <Check className="w-4 h-4" /> Save
                                            </button>
                                            <button
                                                onClick={handleCancelEntity}
                                                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 px-3 py-1 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                                            >
                                                <X className="w-4 h-4" /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between group">
                                        <h3
                                            className="text-xl font-black text-slate-900"
                                            dangerouslySetInnerHTML={{ __html: cleanHtml(puzzle.entity) }}
                                        />
                                        <button aria-label="Edit name"
                                            onClick={() => handleEditEntity(pIdx)}
                                            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-slate-400 hover:text-indigo-600 transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Clues List */}
                            <div className="space-y-3">
                                {puzzle.clues.map((clue, cIdx) => (
                                    <div
                                        key={cIdx}
                                        className="group relative"
                                    >
                                        {editingClue?.puzzleIdx === pIdx && editingClue?.clueIdx === cIdx ? (
                                            <div className="space-y-2">
                                                <textarea aria-label="Clue text"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full bg-slate-50 border-2 border-indigo-500 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none resize-none"
                                                    rows={3}
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <Check className="w-3 h-3" /> Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 px-2 py-1 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <X className="w-3 h-3" /> Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3 items-start group">
                                                <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs mt-0.5">
                                                    {cIdx + 1}
                                                </span>
                                                <div className="flex-1 flex items-start justify-between">
                                                    <p
                                                        className="text-sm font-medium text-slate-700 flex-1"
                                                        dangerouslySetInnerHTML={{ __html: cleanHtml(clue) }}
                                                    />
                                                    <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                                        <button
                                                            onClick={() => handleStartEdit(pIdx, cIdx)}
                                                            title="Edit clue"
                                                            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                                        >
                                                            <Edit2 className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRegenerateClue(pIdx, cIdx)}
                                                            disabled={busyClue?.puzzleIdx === pIdx && busyClue?.clueIdx === cIdx}
                                                            title="Regenerate this clue"
                                                            className="p-1 text-slate-400 hover:text-emerald-600 rounded disabled:opacity-40"
                                                        >
                                                            <RefreshCw className={`w-3 h-3 ${busyClue?.puzzleIdx === pIdx && busyClue?.clueIdx === cIdx ? 'animate-spin' : ''}`} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClue(pIdx, cIdx)}
                                                            disabled={puzzle.clues.length <= 2}
                                                            title="Delete clue (min 2)"
                                                            className="p-1 text-slate-400 hover:text-rose-600 rounded disabled:opacity-40"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {/* Add clue button */}
                                {puzzle.clues.length < 7 && (
                                    <button
                                        onClick={() => handleAddClue(pIdx)}
                                        disabled={!!busyClue && busyClue.puzzleIdx === pIdx}
                                        className="mt-2 w-full text-xs font-bold text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 py-2 rounded-lg border border-dashed border-indigo-200 flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                                    >
                                        {busyClue?.puzzleIdx === pIdx && busyClue?.clueIdx === puzzle.clues.length
                                            ? <><RefreshCw className="w-3 h-3 animate-spin" /> Adding...</>
                                            : <><Plus className="w-3 h-3" /> Add Clue (AI)</>}
                                    </button>
                                )}
                            </div>

                            {/* Fun Fact */}
                            {puzzle.factoid && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <p
                                        className="text-xs text-slate-500 italic"
                                        dangerouslySetInnerHTML={{ __html: `💡 ${cleanHtml(puzzle.factoid)}` }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* AI Revise Modal */}
                {revisingPuzzleIdx !== null && (
                    <ReviseModal
                        itemNoun="Puzzle"
                        currentLabel={editedPuzzles[revisingPuzzleIdx]?.entity || ''}
                        explainer="Describe what you want changed. The AI will revise the entity and/or clues."
                        placeholder="e.g., Make the clues less abstract; pick a more famous example; replace clue 2 with a real-world application…"
                        notes={reviseNotes}
                        onChange={setReviseNotes}
                        onConfirm={handleConfirmRevise}
                        onCancel={() => { setRevisingPuzzleIdx(null); setReviseNotes(''); }}
                    />
                )}

                {/* Save Game Modal */}
                {showSaveModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div {...saveDialog} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                            <h3 id="whoami-save-title" className="text-2xl font-black text-slate-900 mb-4">Save Game</h3>
                            <p className="text-slate-600 mb-4">Give this game a memorable name so you can reuse it with other classes.</p>
                            <input aria-label="Game name"
                                type="text"
                                value={gameName}
                                onChange={(e) => setGameName(e.target.value)}
                                placeholder="e.g., Cell Organelles - Period 3"
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-medium focus:outline-none focus:border-indigo-500 mb-4"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSaveGame}
                                    disabled={!gameName.trim()}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save Game
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSaveModal(false);
                                        setGameName('');
                                    }}
                                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-3 rounded-xl font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Load Game Modal */}
                {showLoadModal && (
                    <LoadGameModal
                        onLoad={handleLoadGame}
                        onClose={() => setShowLoadModal(false)}
                    />
                )}

                {/* Share/Export Modal */}
                {showShareModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div {...shareDialog} className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
                            <h3 id="whoami-share-title" className="text-2xl font-black text-slate-900 mb-4">Share/Export Game</h3>

                            {/* Export Section */}
                            <div className="mb-6">
                                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Download className="w-5 h-5" />
                                    Export Game
                                </h4>
                                <p className="text-sm text-slate-600 mb-3">
                                    Copy this JSON to share with colleagues or save as a backup.
                                </p>
                                <textarea aria-label="Game JSON to copy"
                                    value={shareJSON}
                                    readOnly
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-mono text-xs resize-none focus:outline-none focus:border-indigo-500"
                                    rows={8}
                                />
                                <button
                                    onClick={handleCopyJSON}
                                    className="mt-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                                >
                                    Copy to Clipboard
                                </button>
                            </div>

                            {/* Import Section */}
                            <div className="mb-6">
                                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Upload className="w-5 h-5" />
                                    Import Game
                                </h4>
                                <p className="text-sm text-slate-600 mb-3">
                                    Paste JSON from a shared game to load it.
                                </p>
                                <textarea aria-label="Game JSON to import"
                                    value={importJSON}
                                    onChange={(e) => setImportJSON(e.target.value)}
                                    placeholder="Paste game JSON here..."
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-mono text-xs resize-none focus:outline-none focus:border-indigo-500"
                                    rows={8}
                                />
                                <button
                                    onClick={handleImportGame}
                                    disabled={!importJSON.trim()}
                                    className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Import Game
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    setShowShareModal(false);
                                    setShareJSON('');
                                    setImportJSON('');
                                }}
                                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-3 rounded-xl font-bold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WhoAmIPreviewView;
