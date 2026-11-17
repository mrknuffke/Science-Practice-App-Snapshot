import { errorMessage } from '../utils/errorMessage';
import React, { useState, useRef } from 'react';
import { ArrowLeft, Wand2, Printer, Edit2, Trash2, Plus, RefreshCw, Check, BookOpen, Sparkles, Upload } from 'lucide-react';
import { CourseType } from '../types';
import { TarsiaPair, TarsiaGrid, GridSize, Difficulty, generateTarsiaPuzzle, generateTarsiaPairsFromAI, generateSingleTarsiaPairFromAI } from '../services/tarsiaService';
import { combineSourceContent, validatePDFFile } from '../services/pdfService';
import { getAdaptiveFontSize, getAdaptiveKeySizeFont } from './squareMatch/fontUtils';

interface SquareMatchViewProps {
    onBack: () => void;
    course: CourseType | null;
    topic: string | null;
}

// Rotation-friendly symbols for puzzle pieces (25 unique for up to 5x5 grids)


const SquareMatchView: React.FC<SquareMatchViewProps> = ({ onBack, course, topic }) => {
    // --- State ---
    const [viewMode, setViewMode] = useState<'setup' | 'preview'>('setup');
    const [size, setSize] = useState<GridSize>(3);
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [pairs, setPairs] = useState<TarsiaPair[]>([]);

    // Local Course/Topic state for AI generation (user-editable)
    const [selectedCourse, _setSelectedCourse] = useState<string>(course || 'AP Biology');
    const [selectedTopic, setSelectedTopic] = useState<string>(topic || '');
    const [gradeLevel, setGradeLevel] = useState<string>('High School');
    const [silliness, setSilliness] = useState<number>(0);
    const [mathMix, setMathMix] = useState<number>(0); // 0, 25, 50, 75, 100

    // AI State
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // Source Material State
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [sourceText, setSourceText] = useState('');

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const [editTerm, setEditTerm] = useState('');
    const [editMatch, setEditMatch] = useState('');

    // Puzzle State
    const [puzzle, setPuzzle] = useState<TarsiaGrid | null>(null);

    // Print Layout Ref
    const printRef = useRef<HTMLDivElement>(null);


    // --- Handlers ---

    const handleGeneratePairs = async () => {
        if (!selectedTopic.trim()) {
            setAiError("Please enter a topic first.");
            return;
        }
        setIsGenerating(true);
        setAiError(null);
        try {
            // Combine PDF and text inputs into source context
            const sourceContext = await combineSourceContent(sourceFile, sourceText);
            // Request enough pairs for 5x5 by default to allow flexibility
            // 5x5 needs 40 internal edges + 20 edge buffers = 60
            const count = 60;
            const newPairs = await generateTarsiaPairsFromAI(
                selectedCourse as CourseType,
                selectedTopic,
                gradeLevel,
                count,
                silliness,
                sourceContext,
                mathMix
            );
            setPairs(newPairs);
        } catch (e) {
            setAiError(errorMessage(e, "Failed to generate pairs"));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) { setSourceFile(null); return; }
        const validation = validatePDFFile(file);
        if (!validation.valid) {
            setAiError(validation.error || 'Invalid file');
            setSourceFile(null);
        } else {
            setSourceFile(file);
            setAiError(null);
        }
    };

    const handleAddPair = () => {
        setPairs(prev => [
            { id: `manual-${Date.now()}`, term: 'New Term', match: 'New Match' },
            ...prev
        ]);
    };

    const handleDeletePair = (id: string) => {
        setPairs(prev => prev.filter(p => p.id !== id));
    };

    const handleStartEdit = (p: TarsiaPair) => {
        setEditingId(p.id);
        setEditTerm(p.term);
        setEditMatch(p.match);
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        setPairs(prev => prev.map(p =>
            p.id === editingId ? { ...p, term: editTerm, match: editMatch } : p
        ));
        setEditingId(null);
    };

    const handleRegeneratePair = async (pair: TarsiaPair, type: 'any' | 'math' | 'theory' = 'any') => {
        setRegeneratingId(pair.id);
        try {
            const newPair = await generateSingleTarsiaPairFromAI(
                selectedCourse as CourseType,
                selectedTopic,
                gradeLevel,
                silliness,
                pairs,
                type
            );

            if (newPair) {
                setPairs(prev => prev.map(p => p.id === pair.id ? { ...newPair, id: pair.id } : p));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setRegeneratingId(null);
        }
    };

    const handleGeneratePuzzle = () => {
        try {
            // Determine needed pairs based on size
            // 3x3: 12
            // 4x4: 24
            // 5x5: 40

            const generatedPuzzle = generateTarsiaPuzzle(pairs, size, difficulty);
            setPuzzle(generatedPuzzle);
            setViewMode('preview');
        } catch (e) {
            alert(errorMessage(e, "Something went wrong."));
        }
    };

    const handlePrint = () => {
        window.print();
    };


    // --- Main Render ---

    if (viewMode === 'setup') {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
                <div className="w-full max-w-5xl">
                    <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 mb-2">Square Match Puzzle</h1>
                            <p className="text-slate-500">Create printable scrambled matching puzzles.</p>
                        </div>
                        <button
                            onClick={handleGeneratePuzzle}
                            disabled={pairs.length < (size === 3 ? 12 : size === 4 ? 24 : 40)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/25 transition-all"
                        >
                            <Printer className="w-5 h-5" /> Preview & Print
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Settings Column */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs">1</span>
                                    Settings
                                </h3>

                                <div className="space-y-4">
                                    {/* Topic Input for AI Generation */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <BookOpen className="w-3 h-3" /> Topic for AI Pairs
                                        </label>
                                        <input aria-label="Topic for AI Pairs"
                                            type="text"
                                            value={selectedTopic}
                                            onChange={(e) => setSelectedTopic(e.target.value)}
                                            placeholder="e.g. Photosynthesis, Cell Division"
                                            className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-indigo-600 transition-all font-bold text-slate-800 text-sm"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Enter a topic to enable AI Auto-Fill for term/match pairs.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Grade Level</label>
                                        <select aria-label="Grade Level"
                                            value={gradeLevel}
                                            onChange={(e) => setGradeLevel(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl outline-none focus:border-indigo-600 font-bold text-slate-800 text-sm"
                                        >
                                            <option>Elementary</option>
                                            <option>Middle School</option>
                                            <option>High School</option>
                                            <option>AP / College</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Grid Size</label>
                                        <div className="flex gap-2">
                                            {[3, 4, 5].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setSize(s as GridSize)}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${size === s
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                                >
                                                    {s}x{s}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2">
                                            {size === 3 && "Requires ~12 Pairs. Good for quick review."}
                                            {size === 4 && "Requires ~24 Pairs. Standard lesson activity."}
                                            {size === 5 && "Requires ~40 Pairs. Full period challenge."}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Edge Difficulty</label>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => setDifficulty('easy')}
                                                className={`p-3 rounded-xl text-left border transition-all ${difficulty === 'easy' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                            >
                                                <div className={`font-bold text-sm ${difficulty === 'easy' ? 'text-emerald-700' : 'text-slate-700'}`}>Easy</div>
                                                <div className="text-xs text-slate-500 mt-0.5">Outer edges are blank. Easier to find corners.</div>
                                            </button>

                                            <button
                                                onClick={() => setDifficulty('medium')}
                                                className={`p-3 rounded-xl text-left border transition-all ${difficulty === 'medium' ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                            >
                                                <div className={`font-bold text-sm ${difficulty === 'medium' ? 'text-amber-700' : 'text-slate-700'}`}>Medium</div>
                                                <div className="text-xs text-slate-500 mt-0.5">Outer edges have unmatched text/fillers.</div>
                                            </button>

                                            <button
                                                onClick={() => setDifficulty('hard')}
                                                className={`p-3 rounded-xl text-left border transition-all ${difficulty === 'hard' ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                            >
                                                <div className={`font-bold text-sm ${difficulty === 'hard' ? 'text-rose-700' : 'text-slate-700'}`}>Hard</div>
                                                <div className="text-xs text-slate-500 mt-0.5">Outer edges contain distractors or matches from elsewhere.</div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Math Mix Slider */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                                            <span>Math vs Concepts</span>
                                            <span className="text-indigo-600">{mathMix}% Math</span>
                                        </label>
                                        <input aria-label="Math versus concepts mix"
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="25"
                                            value={mathMix}
                                            onChange={(e) => setMathMix(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1 px-1">
                                            <span>All Concepts</span>
                                            <span>Mix</span>
                                            <span>All Math</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2">
                                            Drag slider to generate Calculation Problems (Problem/Answer) versus Concept Matches (Term/Def).
                                        </p>
                                    </div>

                                    {/* Silliness Slider */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                                            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Fun Factor</span>
                                            <span className="text-fuchsia-600">
                                                {silliness === 0 && "Standard"}
                                                {silliness > 0 && silliness <= 33 && "Friendly"}
                                                {silliness > 33 && silliness <= 66 && "Punny"}
                                                {silliness > 66 && "Chaos"}
                                            </span>
                                        </label>
                                        <input aria-label="Fun factor"
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="33"
                                            value={silliness}
                                            onChange={(e) => setSilliness(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-600"
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1 px-1">
                                            <span>None</span>
                                            <span>:)</span>
                                            <span>:D</span>
                                            <span>XD</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2">
                                            {silliness === 0 && "Standard academic tone."}
                                            {silliness > 0 && silliness <= 33 && "Light tone with minimal emojis."}
                                            {silliness > 33 && silliness <= 66 && "Lots of puns and clever wordplay."}
                                            {silliness > 66 && "Maximum randomness and humor!"}
                                        </p>
                                    </div>

                                    {/* Source Material Section */}
                                    <details className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                        <summary className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-600 uppercase tracking-wide">
                                            <Upload className="w-3 h-3" /> Add Source Material <span className="text-emerald-400 font-normal normal-case">(optional)</span>
                                        </summary>
                                        <div className="mt-4 space-y-3">
                                            <div>
                                                <label className="text-xs font-bold text-emerald-500 mb-1 block">Upload PDF (max 2MB)</label>
                                                <input aria-label="Upload PDF (max 2MB)" type="file" accept=".pdf" onChange={handleSourceFileChange}
                                                    className="w-full bg-white border border-emerald-100 p-2 rounded-lg text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-600" />
                                                {sourceFile && <p className="text-xs text-emerald-600 mt-1 font-bold">✓ {sourceFile.name}</p>}
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-emerald-500 mb-1 block">Or Paste Notes</label>
                                                <textarea aria-label="Or Paste Notes" placeholder="Paste class notes, vocab..."
                                                    value={sourceText} onChange={(e) => setSourceText(e.target.value)} rows={3}
                                                    className="w-full bg-white border border-emerald-100 p-2 rounded-lg text-xs resize-none" />
                                            </div>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        </div>

                        {/* Editor Column */}
                        <div className="lg:col-span-2">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs">2</span>
                                Term Pairs
                            </h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-700">Puzzle Pairs ({pairs.length})</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAddPair}
                                            className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200 font-bold flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add
                                        </button>
                                        <button
                                            onClick={handleGeneratePairs}
                                            disabled={isGenerating || !selectedTopic.trim()}
                                            className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200 font-bold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                            {pairs.length > 0 ? "Regenerate" : "AI Auto-Fill"}
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-[500px] overflow-y-auto p-2 space-y-2">
                                    {aiError && (
                                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg mb-2">
                                            {aiError}
                                        </div>
                                    )}

                                    {pairs.length === 0 && !isGenerating && (
                                        <div className="text-center p-8 text-slate-400 text-sm">
                                            No pairs yet. Use AI Auto-Fill or Add manually.
                                        </div>
                                    )}

                                    {pairs.map(p => (
                                        <div key={p.id} className="group flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                                            {editingId === p.id ? (
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                    <input aria-label="Term"
                                                        className="p-2 border rounded-lg text-sm"
                                                        value={editTerm}
                                                        onChange={e => setEditTerm(e.target.value)}
                                                        placeholder="Term"
                                                    />
                                                    <input aria-label="Match"
                                                        className="p-2 border rounded-lg text-sm"
                                                        value={editMatch}
                                                        onChange={e => setEditMatch(e.target.value)}
                                                        placeholder="Match"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                                                    <div className="font-bold text-slate-700 truncate" title={p.term}>{p.term}</div>
                                                    <div className="text-slate-500 truncate" title={p.match}>{p.match}</div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1">
                                                {editingId === p.id ? (
                                                    <button aria-label="Save pair" onClick={handleSaveEdit} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button aria-label="Edit pair" onClick={() => handleStartEdit(p)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}

                                                <div className="flex flex-col gap-0.5">
                                                    <button
                                                        onClick={() => handleRegeneratePair(p, 'math')}
                                                        disabled={!!regeneratingId}
                                                        className="px-1.5 py-1 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded text-[10px] font-bold uppercase disabled:opacity-30 transition-colors"
                                                        title="Regenerate as Math Problem"
                                                    >
                                                        Math
                                                    </button>
                                                    <button
                                                        onClick={() => handleRegeneratePair(p, 'theory')}
                                                        disabled={!!regeneratingId}
                                                        className="px-1.5 py-1 text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded text-[10px] font-bold uppercase disabled:opacity-30 transition-colors"
                                                        title="Regenerate as Concept"
                                                    >
                                                        Text
                                                    </button>
                                                </div>

                                                <button aria-label="Delete pair" onClick={() => handleDeletePair(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Preview / Print View ---

    if (!puzzle) return null;

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Control Bar (Hidden on Print) */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg print:hidden sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => setViewMode('setup')} className="text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Edit
                    </button>
                    <div className="h-6 w-px bg-slate-700"></div>
                    <span className="font-bold">{topic} ({size}x{size})</span>
                </div>
                <button onClick={handlePrint} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20">
                    <Printer className="w-4 h-4" /> Print PDF
                </button>
            </div>

            {/* Printable Content */}
            <div className="max-w-[210mm] mx-auto bg-white min-h-screen shadow-2xl my-8 print:shadow-none print:m-0 print:w-full print:max-w-none print:h-auto" ref={printRef}>

                <style>{`
                    @media print {
                         @page { size: A4; margin: 10mm; }
                         body { background: white; -webkit-print-color-adjust: exact; }
                         .print-break { break-after: page; page-break-after: always; break-inside: avoid; }
                         .print-break:last-child { break-after: auto; page-break-after: auto; }
                    }
                `}</style>

                {/* PAGE 1: SCRAMBLE */}
                <div className="p-[10mm] min-h-[277mm] flex flex-col print-break">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black uppercase tracking-tight mb-2">{topic || "Science"} Puzzle Matches</h1>
                        <p className="text-sm text-gray-500">Directions: Cut out the squares. Rotate and arrange them so adjacent sides match (terms to definitions). <strong>Pieces may need to be rotated!</strong></p>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="grid gap-0 border-2 border-black"
                            style={{
                                gridTemplateColumns: `repeat(${size}, 1fr)`,
                                width: '100%',
                                maxWidth: '180mm' // Fit within A4 margins
                            }}>
                            {/* Render Squares in GRID order (but they are shuffled in the array) */}
                            {/* Wait, the puzzle.squares array is shuffled, but we need to render them in a grid layout to maximize paper usage? */}
                            {/* Yes, just render the list as a grid. They are already scrambled logically. */}

                            {puzzle.squares.map((sq, i) => (
                                <div key={i} className="aspect-square border border-black relative bg-white overflow-hidden">
                                    {/* Top Text */}
                                    <div className={`absolute top-1 left-0 w-full text-center px-1 font-bold z-10 break-words leading-tight ${getAdaptiveFontSize(sq.top, false, size)}`} style={{ transform: 'rotate(180deg)' }}>
                                        {sq.top}
                                    </div>

                                    {/* Right Text */}
                                    <div className={`absolute top-0 right-0 h-full flex items-center justify-center px-1 font-bold z-10 writing-mode-vertical ${getAdaptiveFontSize(sq.right, true, size)}`} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                        {sq.right}
                                    </div>

                                    {/* Bottom Text */}
                                    <div className={`absolute bottom-1 left-0 w-full text-center px-1 font-bold z-10 break-words leading-tight ${getAdaptiveFontSize(sq.bottom, false, size)}`}>
                                        {sq.bottom}
                                    </div>

                                    {/* Left Text */}
                                    <div className={`absolute top-0 left-0 h-full flex items-center justify-center px-1 font-bold z-10 ${getAdaptiveFontSize(sq.left, true, size)}`} style={{ writingMode: 'vertical-rl' }}>
                                        {sq.left}
                                    </div>

                                    {/* Rotation-friendly symbol ID for checking */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-30 font-black text-6xl pointer-events-none text-slate-600">
                                        {sq.center || ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-center text-xs text-gray-400 mt-4">Science Practice Partner • generated at {new Date().toLocaleDateString()}</div>
                </div>

                {/* PAGE 2: KEY */}
                <div className="p-[10mm] min-h-[277mm] flex flex-col print-break">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black uppercase tracking-tight mb-2">Answer Key</h1>
                        <p className="text-sm text-gray-500">Teacher Reference Solution - Each piece symbol shows where it belongs</p>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="grid gap-0 border-2 border-black"
                            style={{
                                gridTemplateColumns: `repeat(${size}, 1fr)`,
                                width: '70%', // Larger for readability
                            }}>

                            {puzzle.solution.map((row, rowIdx) =>
                                row.map((sq, colIdx) => {
                                    return (
                                        <div key={`sol-${rowIdx}-${colIdx}`} className="aspect-square border border-black relative bg-white overflow-hidden">
                                            {/* Top Text - horizontal, upside down to read from inside */}
                                            <div className={`absolute top-1 left-0 w-full text-center truncate px-1 font-medium ${getAdaptiveKeySizeFont(sq.top, false, size)}`} style={{ transform: 'rotate(180deg)' }}>
                                                {sq.top}
                                            </div>

                                            {/* Bottom Text - horizontal, normal */}
                                            <div className={`absolute bottom-1 left-0 w-full text-center truncate px-1 font-bold ${getAdaptiveKeySizeFont(sq.bottom, false, size)}`}>
                                                {sq.bottom}
                                            </div>

                                            {/* Left Text - vertical */}
                                            <div className={`absolute top-0 left-0 h-full flex items-center justify-center px-0.5 font-medium ${getAdaptiveKeySizeFont(sq.left, true, size)}`} style={{ writingMode: 'vertical-rl' }}>
                                                {sq.left}
                                            </div>

                                            {/* Right Text - vertical, rotated to read from inside */}
                                            <div className={`absolute top-0 right-0 h-full flex items-center justify-center px-0.5 font-bold ${getAdaptiveKeySizeFont(sq.right, true, size)}`} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                                {sq.right}
                                            </div>

                                            {/* Symbol ID in center - matches scrambled pieces */}
                                            <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-slate-400 opacity-40 pointer-events-none" style={{ transform: `rotate(-${sq.rotation}deg)` }}>
                                                {sq.center || '?'}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SquareMatchView;
