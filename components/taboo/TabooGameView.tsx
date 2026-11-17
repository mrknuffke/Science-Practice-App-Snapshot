import { errorMessage } from '../../utils/errorMessage';
import React, { useEffect, useRef, useState } from 'react';
import {
    ArrowLeft, Wand2, Printer, BookOpen, RefreshCw, Check, Edit2, Trash2, Plus, Sparkles, X,
    Save, Upload, Play, Pause, SkipForward, Trophy, Users, Ban, RotateCcw
} from 'lucide-react';
import { CourseType, TabooCard, TabooDeck } from '../../types';
import {
    generateTabooDeck, refreshTabooCard, reviseTabooCard,
    getSavedTabooDecks, saveTabooDeck, deleteTabooDeck
} from '../../services/tabooService';
import { useWindowKeydown } from '../../hooks/useWindowKeydown';
import { ReviseModal, SaveDeckModal, LoadDeckModal } from '../games/GameModals';

interface TabooGameViewProps {
    onBack: () => void;
    course: CourseType | null;
    topic: string | null;
}

type ViewMode = 'setup' | 'review' | 'play' | 'print';

const TabooGameView: React.FC<TabooGameViewProps> = ({ onBack, course, topic }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('setup');

    // Setup
    const [selectedCourse, setSelectedCourse] = useState<string>(course || 'AP Biology');
    const [selectedTopic, setSelectedTopic] = useState<string>(topic || '');
    const [gradeLevel, setGradeLevel] = useState<string>('High School');
    const [count, setCount] = useState<number>(20);
    const [forbiddenCount, setForbiddenCount] = useState<number>(5);

    // Deck
    const [deck, setDeck] = useState<TabooDeck | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Edit
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTerm, setEditTerm] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editForbidden, setEditForbidden] = useState<string[]>([]);

    // AI Revise
    const [revisingId, setRevisingId] = useState<string | null>(null);
    const [reviseNotes, setReviseNotes] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);

    // Library
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [savedDecks, setSavedDecks] = useState<TabooDeck[]>([]);

    useEffect(() => {
        if (showLoadModal) setSavedDecks(getSavedTabooDecks());
    }, [showLoadModal]);

    const handleGenerate = async () => {
        if (!selectedTopic.trim()) {
            setError('Please enter a topic first.');
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const newDeck = await generateTabooDeck(
                selectedCourse as CourseType,
                selectedTopic,
                gradeLevel,
                count,
                forbiddenCount
            );
            setDeck(newDeck);
            setViewMode('review');
        } catch (e) {
            setError(errorMessage(e, 'Failed to generate cards.'));
        } finally {
            setIsGenerating(false);
        }
    };

    const startEdit = (c: TabooCard) => {
        setEditingId(c.id);
        setEditTerm(c.term);
        setEditCategory(c.category);
        setEditForbidden([...c.forbiddenWords]);
    };

    const saveEdit = () => {
        if (!deck || !editingId) return;
        const cleaned = editForbidden.map(w => w.trim()).filter(Boolean);
        const padded = [...cleaned];
        while (padded.length < (deck.forbiddenCount || 5)) padded.push('');
        setDeck({
            ...deck,
            cards: deck.cards.map(c => c.id === editingId ? {
                ...c,
                term: editTerm.trim() || c.term,
                category: editCategory.trim() || c.category,
                forbiddenWords: padded.slice(0, deck.forbiddenCount)
            } : c)
        });
        setEditingId(null);
    };

    const updateForbiddenAt = (idx: number, value: string) => {
        setEditForbidden(prev => prev.map((w, i) => i === idx ? value : w));
    };

    const deleteCard = (id: string) => {
        if (!deck || deck.cards.length <= 1) return;
        setDeck({ ...deck, cards: deck.cards.filter(c => c.id !== id) });
    };

    const addManualCard = () => {
        if (!deck) return;
        const newCard: TabooCard = {
            id: `manual-${Date.now()}`,
            term: 'New Term',
            category: deck.topic,
            forbiddenWords: Array(deck.forbiddenCount).fill('')
        };
        setDeck({ ...deck, cards: [newCard, ...deck.cards] });
        startEdit(newCard);
    };

    const handleRefresh = async (card: TabooCard) => {
        if (!deck) return;
        setBusyId(card.id);
        setError(null);
        try {
            const replacement = await refreshTabooCard(
                deck.course as CourseType,
                deck.topic,
                deck.gradeLevel,
                deck.forbiddenCount,
                deck.cards.filter(c => c.id !== card.id).map(c => c.term)
            );
            setDeck({
                ...deck,
                cards: deck.cards.map(c => c.id === card.id ? { ...replacement, id: card.id } : c)
            });
        } catch (e) {
            setError(errorMessage(e, 'Failed to refresh card.'));
        } finally {
            setBusyId(null);
        }
    };

    const handleConfirmRevise = async () => {
        if (!deck || !revisingId || !reviseNotes.trim()) return;
        const target = deck.cards.find(c => c.id === revisingId);
        if (!target) return;
        const id = revisingId;
        setBusyId(id);
        setRevisingId(null);
        try {
            const revised = await reviseTabooCard(
                deck.course as CourseType,
                deck.topic,
                deck.forbiddenCount,
                target,
                reviseNotes.trim()
            );
            setDeck({
                ...deck,
                cards: deck.cards.map(c => c.id === id ? { ...revised, id } : c)
            });
        } catch (e) {
            setError(errorMessage(e, 'AI Revise failed.'));
        } finally {
            setBusyId(null);
            setReviseNotes('');
        }
    };

    const handleSaveDeck = () => {
        if (!deck) return;
        const titleToUse = saveTitle.trim() || deck.title;
        const toSave: TabooDeck = { ...deck, title: titleToUse };
        saveTabooDeck(toSave);
        setDeck(toSave);
        setShowSaveModal(false);
        setSaveTitle('');
        alert(`Deck "${titleToUse}" saved to library.`);
    };

    const handleLoadDeck = (d: TabooDeck) => {
        setDeck(d);
        setSelectedCourse(d.course);
        setSelectedTopic(d.topic);
        setGradeLevel(d.gradeLevel);
        setForbiddenCount(d.forbiddenCount);
        setShowLoadModal(false);
        setViewMode('review');
    };

    const handleDeleteSaved = (id: string) => {
        if (!confirm('Delete this saved deck?')) return;
        deleteTabooDeck(id);
        setSavedDecks(getSavedTabooDecks());
    };

    // SETUP
    if (viewMode === 'setup') {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-3xl mx-auto">
                    <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-900/40">
                            <span className="text-2xl">🚫</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Science Taboo</h1>
                    </div>
                    <p className="text-slate-500 mb-8">Target words with configurable forbidden clues. Edit, print, or play live with team buzzers.</p>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> Topic
                            </label>
                            <input
                                type="text"
                                value={selectedTopic}
                                onChange={(e) => setSelectedTopic(e.target.value)}
                                placeholder="e.g. Newton's Laws, Stoichiometry, Genetics"
                                className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500 transition-all font-bold text-slate-800 text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Course</label>
                                <input
                                    type="text"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500 font-bold text-slate-800 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Grade Level</label>
                                <select
                                    value={gradeLevel}
                                    onChange={(e) => setGradeLevel(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-rose-500 font-bold text-slate-800 text-sm"
                                >
                                    <option>Elementary</option>
                                    <option>Middle School</option>
                                    <option>High School</option>
                                    <option>AP / College</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Card Count</label>
                            <div className="flex gap-2">
                                {[10, 20, 30, 40].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setCount(n)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${count === n
                                            ? 'bg-rose-600 text-white border-rose-600'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                                <span>Forbidden Words per Card</span>
                                <span className="text-rose-600">{forbiddenCount}</span>
                            </label>
                            <input
                                type="range"
                                min={3}
                                max={7}
                                step={1}
                                value={forbiddenCount}
                                onChange={(e) => setForbiddenCount(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1 px-1">
                                <span>3 (easier)</span>
                                <span>5 (classic)</span>
                                <span>7 (harder)</span>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !selectedTopic.trim()}
                                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-900/20"
                            >
                                {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                                {isGenerating ? 'Generating…' : 'Generate Deck'}
                            </button>
                            <button
                                onClick={() => setShowLoadModal(true)}
                                className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-bold flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" /> Load
                            </button>
                        </div>
                    </div>
                </div>

                {showLoadModal && (
                    <LoadDeckModal
                        title="Load Saved Taboo Deck"
                        decks={savedDecks}
                        describe={d => `${d.cards.length} cards • ${d.forbiddenCount} forbidden • ${new Date(d.createdAt).toLocaleDateString()}`}
                        onLoad={handleLoadDeck}
                        onDelete={handleDeleteSaved}
                        onClose={() => setShowLoadModal(false)}
                    />
                )}
            </div>
        );
    }

    // REVIEW
    if (viewMode === 'review' && deck) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <button onClick={() => setViewMode('setup')} className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> Setup
                        </button>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={addManualCard} className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-sm flex items-center gap-1 hover:bg-emerald-200">
                                <Plus className="w-4 h-4" /> Add
                            </button>
                            <button onClick={() => { setSaveTitle(deck.title); setShowSaveModal(true); }} className="px-3 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm flex items-center gap-1 hover:bg-emerald-500">
                                <Save className="w-4 h-4" /> Save
                            </button>
                            <button onClick={() => setViewMode('print')} className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm flex items-center gap-1 hover:bg-slate-300">
                                <Printer className="w-4 h-4" /> Print
                            </button>
                            <button onClick={() => setViewMode('play')} className="px-3 py-2 bg-rose-600 text-white rounded-lg font-bold text-sm flex items-center gap-1 hover:bg-rose-500 shadow-lg shadow-rose-900/20">
                                <Play className="w-4 h-4" /> Play Live
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-2xl font-black text-slate-900">{deck.title}</h2>
                        <p className="text-sm text-slate-500">{deck.cards.length} cards • {deck.forbiddenCount} forbidden words • {deck.gradeLevel}</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium flex items-center justify-between">
                            <span>{error}</span>
                            <button aria-label="Dismiss error" onClick={() => setError(null)} className="text-rose-500"><X className="w-4 h-4" /></button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {deck.cards.map(c => (
                            <div key={c.id} className="bg-white rounded-2xl border-4 border-rose-600 overflow-hidden hover:shadow-xl transition-shadow">
                                {editingId === c.id ? (
                                    <div className="p-4 space-y-2">
                                        <input value={editTerm} onChange={e => setEditTerm(e.target.value)} placeholder="Term" className="w-full p-2 border-2 border-rose-300 rounded-lg text-base font-bold" autoFocus />
                                        <input value={editCategory} onChange={e => setEditCategory(e.target.value)} placeholder="Category" className="w-full p-2 border rounded-lg text-xs" />
                                        <div className="space-y-1">
                                            {editForbidden.map((w, i) => (
                                                <input
                                                    key={i}
                                                    value={w}
                                                    onChange={e => updateForbiddenAt(i, e.target.value)}
                                                    placeholder={`Forbidden word ${i + 1}`}
                                                    className="w-full p-2 border rounded-lg text-sm"
                                                />
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={saveEdit} className="flex-1 p-2 bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1">
                                                <Check className="w-3 h-3" /> Save
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="flex-1 p-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center justify-center gap-1">
                                                <X className="w-3 h-3" /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-white p-3 border-b-4 border-rose-600 text-center">
                                            <div className="text-[10px] font-black uppercase tracking-wider text-rose-600 mb-1">{c.category}</div>
                                            <div className="font-black text-slate-900 text-2xl">{c.term}</div>
                                        </div>
                                        <div className="bg-rose-600 p-3 space-y-1.5">
                                            {c.forbiddenWords.map((w, i) => (
                                                <div key={i} className="flex items-center gap-2 text-white font-bold text-sm">
                                                    <Ban className="w-3.5 h-3.5 shrink-0 opacity-75" />
                                                    <span>{w}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-1 p-2 bg-white border-t-2 border-rose-100">
                                            <button onClick={() => startEdit(c)} disabled={busyId === c.id} className="flex-1 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-30">
                                                <Edit2 className="w-3 h-3" /> Edit
                                            </button>
                                            <button onClick={() => { setRevisingId(c.id); setReviseNotes(''); }} disabled={busyId === c.id} className="flex-1 p-1.5 text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-lg text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-30" title="AI Revise">
                                                <Sparkles className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => handleRefresh(c)} disabled={busyId === c.id} className="flex-1 p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-30" title="Regenerate">
                                                <RefreshCw className={`w-3 h-3 ${busyId === c.id ? 'animate-spin' : ''}`} />
                                            </button>
                                            <button onClick={() => deleteCard(c.id)} disabled={busyId === c.id} className="flex-1 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-30" title="Delete">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {revisingId && deck && (
                    <ReviseModal
                        itemNoun="Card"
                        placeholder="Describe the change (e.g. swap term, adjust forbidden words, easier difficulty)…"
                        currentLabel={deck.cards.find(c => c.id === revisingId)?.term || ''}
                        notes={reviseNotes}
                        onChange={setReviseNotes}
                        onConfirm={handleConfirmRevise}
                        onCancel={() => { setRevisingId(null); setReviseNotes(''); }}
                    />
                )}

                {showSaveModal && (
                    <SaveDeckModal focusClass="focus:border-rose-500" title={saveTitle} onChange={setSaveTitle} onConfirm={handleSaveDeck} onCancel={() => setShowSaveModal(false)} />
                )}
            </div>
        );
    }

    // PLAY
    if (viewMode === 'play' && deck) {
        return <TabooLivePlay deck={deck} onExit={() => setViewMode('review')} />;
    }

    // PRINT
    if (viewMode === 'print' && deck) {
        return (
            <div className="min-h-screen bg-slate-100">
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg print:hidden sticky top-0 z-50">
                    <button onClick={() => setViewMode('review')} className="text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Edit
                    </button>
                    <span className="font-bold">{deck.title} — {deck.cards.length} cards</span>
                    <button onClick={() => window.print()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                </div>

                <style>{`
                    @media print {
                        @page { size: A4; margin: 8mm; }
                        body { background: white; -webkit-print-color-adjust: exact; }
                        .print-page { break-after: page; break-inside: avoid; page-break-after: always; }
                        .print-page:last-child { break-after: auto; page-break-after: auto; }
                        .print-card { break-inside: avoid; page-break-inside: avoid; overflow-wrap: anywhere; word-break: break-word; }
                    }
                `}</style>

                <div className="max-w-[210mm] mx-auto bg-white shadow-2xl my-8 print:shadow-none print:m-0 print:max-w-none">
                    {Array.from({ length: Math.ceil(deck.cards.length / 4) }).map((_, pageIdx) => {
                        const pageCards = deck.cards.slice(pageIdx * 4, pageIdx * 4 + 4);
                        return (
                            // Usable area = A4 (297mm) − 2×8mm page margin = 281mm.
                            <div
                                key={pageIdx}
                                className="grid grid-cols-2 grid-rows-2 gap-3 p-2 print-page print:p-0"
                                style={{ height: '281mm' }}
                            >
                                {pageCards.map(c => (
                                    <div key={c.id} className="print-card border-4 border-rose-600 rounded-xl overflow-hidden flex flex-col bg-white">
                                        <div className="bg-white p-3 text-center border-b-4 border-rose-600 shrink-0">
                                            <div className="text-xs font-black uppercase tracking-wider text-rose-600 mb-1 truncate">{c.category}</div>
                                            <div className="text-2xl md:text-3xl font-black text-slate-900 break-words hyphens-auto leading-tight">{c.term}</div>
                                        </div>
                                        <div className="bg-rose-600 flex-1 p-4 space-y-1.5 overflow-hidden">
                                            {c.forbiddenWords.map((w, i) => (
                                                <div key={i} className="flex items-start gap-2 text-white font-bold text-sm leading-tight break-words">
                                                    <Ban className="w-4 h-4 shrink-0 opacity-75 mt-0.5" />
                                                    <span>{w}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return null;
};

// LIVE PLAY
type TabooOutcome = 'correct' | 'foul' | 'skip';
interface TabooRoundEntry {
    cardId: string;
    term: string;
    category: string;
    outcome: TabooOutcome;
}

const TabooLivePlay: React.FC<{ deck: TabooDeck; onExit: () => void }> = ({ deck, onExit }) => {
    const [phase, setPhase] = useState<'config' | 'turn-ready' | 'turn-active' | 'turn-done' | 'final'>('config');
    const [teamCount, setTeamCount] = useState(2);
    const [secondsPerRound, setSecondsPerRound] = useState(60);
    const [skipPenalty, setSkipPenalty] = useState(false);
    const [scores, setScores] = useState<number[]>([]);
    const [activeTeam, setActiveTeam] = useState(0);
    const [shuffled, setShuffled] = useState<TabooCard[]>([]);
    const [cursor, setCursor] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [paused, setPaused] = useState(false);
    const [timeExpired, setTimeExpired] = useState(false);
    const [roundLog, setRoundLog] = useState<TabooRoundEntry[]>([]);
    const tickRef = useRef<number | null>(null);

    // When the clock hits 0 we DO NOT auto-transition — the teacher still needs
    // a chance to record the outcome of the in-flight card.
    useEffect(() => {
        if (phase !== 'turn-active' || paused || timeExpired) {
            if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
            return;
        }
        tickRef.current = window.setInterval(() => {
            setSecondsLeft(s => {
                if (s <= 1) {
                    if (tickRef.current) clearInterval(tickRef.current);
                    setTimeExpired(true);
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => { if (tickRef.current) clearInterval(tickRef.current); };
    }, [phase, paused, timeExpired]);

    const startGame = () => {
        const arr = [...deck.cards];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        setShuffled(arr);
        setScores(Array(teamCount).fill(0));
        setActiveTeam(0);
        setCursor(0);
        setPhase('turn-ready');
    };

    const beginTurn = () => {
        setSecondsLeft(secondsPerRound);
        setRoundLog([]);
        setPaused(false);
        setTimeExpired(false);
        setPhase('turn-active');
    };

    const recordOutcome = (outcome: TabooOutcome) => {
        const card = shuffled[cursor];
        if (!card) return;
        setRoundLog(prev => [...prev, { cardId: card.id, term: card.term, category: card.category, outcome }]);
        const nextCursor = cursor + 1;
        setCursor(nextCursor);
        if (timeExpired || nextCursor >= shuffled.length) {
            setPhase('turn-done');
        }
    };

    const markCorrect = () => recordOutcome('correct');
    const markFoul = () => recordOutcome('foul');
    const skip = () => recordOutcome('skip');

    // saveCard=true → cursor stays; in-flight card carries to next team.
    // saveCard=false → cursor advances; in-flight card is discarded.
    const endRoundEarly = (saveCard: boolean) => {
        if (tickRef.current) clearInterval(tickRef.current);
        if (!saveCard) {
            setCursor(c => Math.min(c + 1, shuffled.length));
        }
        setPhase('turn-done');
    };

    const deltaFor = (outcome: TabooOutcome): number => {
        if (outcome === 'correct') return 1;
        if (outcome === 'foul') return -1;
        return skipPenalty ? -1 : 0;
    };

    const computeDelta = (log: TabooRoundEntry[]) => log.reduce((sum, e) => sum + deltaFor(e.outcome), 0);
    const turnDelta = computeDelta(roundLog);
    const projectedScore = (scores[activeTeam] || 0) + turnDelta;
    const correctCount = roundLog.filter(e => e.outcome === 'correct').length;
    const foulCount = roundLog.filter(e => e.outcome === 'foul').length;

    const toggleEntryOutcome = (idx: number, next: TabooOutcome) => {
        setRoundLog(prev => prev.map((e, i) => i === idx ? { ...e, outcome: next } : e));
    };

    const removeEntry = (idx: number) => {
        setRoundLog(prev => prev.filter((_, i) => i !== idx));
    };

    const confirmTurn = () => {
        setScores(prev => prev.map((s, i) => i === activeTeam ? s + computeDelta(roundLog) : s));
        // Cursor === shuffled.length means the deck is exhausted.
        // Otherwise the in-flight card carries to the next team.
        if (cursor >= shuffled.length) {
            setPhase('final');
            return;
        }
        setActiveTeam(t => (t + 1) % teamCount);
        setRoundLog([]);
        setPhase('turn-ready');
    };

    const endGameNow = () => {
        setScores(prev => prev.map((s, i) => i === activeTeam ? s + computeDelta(roundLog) : s));
        setPhase('final');
    };

    useWindowKeydown((e: KeyboardEvent) => {
        if (phase !== 'turn-active' || paused) return;
        if (e.code === 'Space') { e.preventDefault(); markCorrect(); }
        if (e.code === 'KeyF') { e.preventDefault(); markFoul(); }
        if (e.code === 'KeyS') { e.preventDefault(); skip(); }
    });

    if (phase === 'config') {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-xl mx-auto">
                    <button onClick={onExit} className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <h2 className="text-3xl font-black text-slate-900 mb-6">Live Taboo — Setup</h2>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Number of Teams</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <button key={n} onClick={() => setTeamCount(n)} className={`flex-1 py-2 rounded-lg text-sm font-bold border ${teamCount === n ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Seconds per Round</label>
                            <div className="flex gap-2">
                                {[30, 60, 90, 120].map(n => (
                                    <button key={n} onClick={() => setSecondsPerRound(n)} className={`flex-1 py-2 rounded-lg text-sm font-bold border ${secondsPerRound === n ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                                        {n}s
                                    </button>
                                ))}
                            </div>
                        </div>
                        <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                            <input type="checkbox" checked={skipPenalty} onChange={(e) => setSkipPenalty(e.target.checked)} className="w-5 h-5 accent-rose-600" />
                            <span className="text-sm font-bold text-slate-700">Skip costs −1 point</span>
                        </label>
                        <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1">
                            <div className="font-bold text-slate-800 mb-1">Keyboard shortcuts</div>
                            <div>· <kbd className="px-1 bg-white border rounded">Space</kbd> Got It (+1)</div>
                            <div>· <kbd className="px-1 bg-white border rounded">F</kbd> Foul (−1, opponent buzzed)</div>
                            <div>· <kbd className="px-1 bg-white border rounded">S</kbd> Skip ({skipPenalty ? '−1' : '0'})</div>
                        </div>
                        <button onClick={startGame} className="w-full bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20">
                            <Play className="w-5 h-5" /> Start Game
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'turn-ready') {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
                <Users className="w-16 h-16 text-rose-400 mb-4" />
                <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Up Next</div>
                <div className="text-5xl font-black mb-8">Team {activeTeam + 1}</div>
                <div className="text-sm text-slate-400 mb-6">{shuffled.length - cursor} cards remaining • {secondsPerRound}s</div>
                <button onClick={beginTurn} className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-2 text-lg">
                    <Play className="w-5 h-5" /> Begin Turn
                </button>
                <button onClick={onExit} className="mt-4 text-slate-400 text-sm">End Game</button>
            </div>
        );
    }

    if (phase === 'turn-active') {
        const card = shuffled[cursor];
        const headerColor = timeExpired ? 'bg-amber-600' : 'bg-rose-600';
        return (
            <div className="min-h-screen bg-rose-50 flex flex-col">
                <div className={`${headerColor} text-white p-4 flex justify-between items-center transition-colors`}>
                    <div>
                        <div className="text-xs font-black uppercase tracking-widest opacity-80">Team {activeTeam + 1}</div>
                        <div className="text-sm font-bold">+{correctCount} −{foulCount} · projected {projectedScore}</div>
                    </div>
                    <div className="text-4xl font-black tabular-nums flex items-center gap-2">
                        {paused && !timeExpired && <Pause className="w-6 h-6" />}
                        {timeExpired ? 'TIME!' : `${secondsLeft}s`}
                    </div>
                    <div className="text-xs font-bold opacity-80">Card {cursor + 1} / {shuffled.length}</div>
                </div>

                {timeExpired && (
                    <div className="bg-amber-100 border-y-2 border-amber-400 text-amber-900 px-6 py-2 text-center text-sm font-bold">
                        Last call — record the outcome, or End Round (Save Card carries it to next team · Discard drops it).
                    </div>
                )}

                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="border-4 border-rose-600 rounded-2xl overflow-hidden bg-white max-w-md w-full mb-6 shadow-2xl">
                        <div className="bg-white p-4 text-center border-b-4 border-rose-600">
                            <div className="text-xs font-black uppercase tracking-wider text-rose-600 mb-1">{card?.category}</div>
                            <div className="text-4xl font-black text-slate-900">{card?.term}</div>
                        </div>
                        <div className="bg-rose-600 p-4 space-y-2">
                            {card?.forbiddenWords.map((w, i) => (
                                <div key={i} className="flex items-center gap-2 text-white font-bold text-lg">
                                    <Ban className="w-4 h-4 opacity-75" />
                                    <span>{w}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 flex-wrap justify-center">
                        <button onClick={markFoul} disabled={paused} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50">
                            <Ban className="w-5 h-5" /> Foul <span className="opacity-70 text-xs">(F)</span>
                        </button>
                        <button onClick={skip} disabled={paused} className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50">
                            <SkipForward className="w-5 h-5" /> Skip <span className="opacity-50 text-xs">(S)</span>
                        </button>
                        <button onClick={markCorrect} disabled={paused} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-2 shadow-xl disabled:opacity-50">
                            <Check className="w-5 h-5" /> Got It <span className="opacity-70 text-xs">(Space)</span>
                        </button>
                    </div>
                    <div className="flex gap-2 mt-6 flex-wrap justify-center">
                        {!timeExpired && (
                            <button onClick={() => setPaused(p => !p)} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-slate-200">
                                {paused ? <><Play className="w-3 h-3" /> Resume</> : <><Pause className="w-3 h-3" /> Pause</>}
                            </button>
                        )}
                        <button
                            onClick={() => endRoundEarly(true)}
                            className={`text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg border flex items-center gap-1 ${timeExpired
                                ? 'bg-amber-500 hover:bg-amber-400 text-white border-amber-500 shadow-lg shadow-amber-900/20'
                                : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'}`}
                            title="End the round; this card carries to the next team's turn"
                        >
                            <RotateCcw className="w-3 h-3" /> End Round · Save Card
                        </button>
                        <button
                            onClick={() => endRoundEarly(false)}
                            className="text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg border flex items-center gap-1 bg-white text-slate-500 hover:text-slate-800 border-slate-200"
                            title="End the round; this card is discarded"
                        >
                            <X className="w-3 h-3" /> End Round · Discard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'turn-done') {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Round Review</div>
                        <h2 className="text-2xl font-black text-slate-900 mb-1">Team {activeTeam + 1}</h2>
                        <p className="text-sm text-slate-500 mb-5">
                            Tap any card to fix its outcome before moving on. Your team's total will become <strong className="text-rose-600">{projectedScore}</strong>{' '}
                            ({scores[activeTeam] || 0} {turnDelta >= 0 ? '+' : '−'} {Math.abs(turnDelta)} this round).
                        </p>

                        {roundLog.length === 0 ? (
                            <div className="text-center p-8 bg-slate-50 rounded-xl text-slate-500 text-sm font-medium">
                                No cards played this round.
                            </div>
                        ) : (
                            <div className="space-y-2 mb-6">
                                {roundLog.map((entry, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 flex-wrap">
                                        <div className="flex-1 min-w-[140px]">
                                            <div className="font-bold text-slate-900 truncate">{entry.term}</div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                {entry.category} · {entry.outcome === 'correct' ? '+1' : entry.outcome === 'foul' ? '−1' : (skipPenalty ? '−1' : '0')}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => toggleEntryOutcome(idx, 'correct')}
                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${entry.outcome === 'correct'
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-300'}`}
                                            >
                                                <Check className="w-3 h-3" /> +1
                                            </button>
                                            <button
                                                onClick={() => toggleEntryOutcome(idx, 'foul')}
                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${entry.outcome === 'foul'
                                                    ? 'bg-amber-500 text-white'
                                                    : 'bg-white text-slate-500 border border-slate-200 hover:border-amber-300'}`}
                                            >
                                                <Ban className="w-3 h-3" /> Foul
                                            </button>
                                            <button
                                                onClick={() => toggleEntryOutcome(idx, 'skip')}
                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${entry.outcome === 'skip'
                                                    ? 'bg-slate-700 text-white'
                                                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'}`}
                                            >
                                                <SkipForward className="w-3 h-3" /> Skip
                                            </button>
                                            <button
                                                onClick={() => removeEntry(idx)}
                                                className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                title="Remove from round"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-3 flex-wrap">
                            <button onClick={confirmTurn} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20">
                                {cursor >= shuffled.length ? <>Confirm & Show Final <Trophy className="w-4 h-4" /></> : <>Confirm & Next Team <Play className="w-4 h-4" /></>}
                            </button>
                            <button onClick={endGameNow} className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm">
                                End Game
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const winner = scores.indexOf(Math.max(...scores));
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                    <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Game Over</h2>
                    <p className="text-rose-600 font-black text-2xl mb-6">Team {winner + 1} wins!</p>
                    <div className="space-y-2 mb-6">
                        {scores.map((s, i) => (
                            <div key={i} className={`flex justify-between items-center p-3 rounded-xl ${i === winner ? 'bg-amber-50 border-2 border-amber-300' : 'bg-slate-50'}`}>
                                <span className="font-bold">Team {i + 1}</span>
                                <span className="font-black tabular-nums">{s}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={onExit} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold">
                        Back to Deck
                    </button>
                </div>
            </div>
        </div>
    );
};

// MODALS

export default TabooGameView;
