import React, { useState, useMemo } from 'react';
import { CourseType, WhoAmIPuzzle } from '../types';
import { Play, ArrowLeft, Loader2, Sparkles, Upload } from 'lucide-react';
import { SavedWhoAmIGame, getSavedWhoAmIGames } from '../services/storageService';
import { validatePDFFile } from '../services/pdfService';
import LoadGameModal from './whoAmI/LoadGameModal';

export interface WhoAmIGenerateOptions {
    count: number;
    difficultyMix: 'easier' | 'mixed' | 'harder';
    silliness: number;
    sourceContext: string;
}

interface WhoAmISetupViewProps {
    onBack: () => void;
    onGenerate: (course: CourseType, topic: string, options: WhoAmIGenerateOptions) => void;
    onLoadGame: (puzzles: WhoAmIPuzzle[], course: string, topic: string) => void;
    isLoading: boolean;
    defaultCourse: CourseType | null;
    defaultTopic: string | null;
}

const WhoAmISetupView: React.FC<WhoAmISetupViewProps> = ({
    onBack,
    onGenerate,
    onLoadGame,
    isLoading,
    defaultCourse,
    defaultTopic
}) => {
    const [course, setCourse] = useState<CourseType>(defaultCourse || 'Custom Practice');
    const [topic, setTopic] = useState(defaultTopic || '');
    const [count, setCount] = useState<number>(5);
    const [difficultyMix, setDifficultyMix] = useState<'easier' | 'mixed' | 'harder'>('mixed');
    const [silliness, setSilliness] = useState<number>(0);
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [sourceText, setSourceText] = useState('');
    const [sourceError, setSourceError] = useState<string | null>(null);

    // Recent topics from saved games (up to 5 unique)
    const recentTopics = useMemo<string[]>(() => {
        try {
            const games = getSavedWhoAmIGames();
            const topics: string[] = [];
            for (const g of games) {
                if (g.topic && !topics.includes(g.topic)) topics.push(g.topic);
                if (topics.length >= 5) break;
            }
            return topics;
        } catch {
            return [];
        }
    }, []);
    const [showLoadModal, setShowLoadModal] = useState(false);

    const handleLoadGame = (game: SavedWhoAmIGame) => {
        setShowLoadModal(false);
        onLoadGame(game.puzzles, game.course, game.topic);
    };

    const handleSourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) { setSourceFile(null); return; }
        const validation = validatePDFFile(file);
        if (!validation.valid) {
            setSourceError(validation.error || 'Invalid file');
            setSourceFile(null);
        } else {
            setSourceFile(file);
            setSourceError(null);
        }
    };

    const handleGenerate = async () => {
        if (!topic.trim() || isLoading) return;
        let sourceContext = sourceText;
        if (sourceFile) {
            const { combineSourceContent } = await import('../services/pdfService');
            sourceContext = await combineSourceContent(sourceFile, sourceText);
        }
        onGenerate(course, topic, { count, difficultyMix, silliness, sourceContext });
    };

    const courses: CourseType[] = [
        'AP Biology', 'General Biology', 'AP Environmental Science', 'AP Physics 1', 'AP Physics 2', 'AP Physics C',
        'General Chemistry', 'General Physics', 'Environmental Science', 'Physical Science',
        'Anatomy and Physiology', 'Marine Biology', 'Forensic Science', 'Biotechnology',
        'Middle School Life Science', 'Middle School Physical Science', 'Middle School Earth and Space Science',
        'Elementary School Life Science', 'Custom Practice'
    ];

    const canGenerate = topic.trim().length > 0 && !isLoading;

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <header className="mb-8 relative flex items-center justify-center">
                    <button
                        onClick={onBack}
                        className="absolute left-0 text-slate-400 hover:text-slate-600 flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <div className="text-center">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <span className="text-4xl">🕵️</span> Who Am I? Setup
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">Generate a 20-questions style guessing game.</p>
                    </div>
                </header>

                {/* Form Container */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                        {/* Left: Topic + Options */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">
                                    Subject Area
                                </label>
                                <div className="relative">
                                    <select aria-label="Subject Area"
                                        value={course}
                                        onChange={(e) => setCourse(e.target.value as CourseType)}
                                        className="w-full appearance-none bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold text-base rounded-2xl px-5 py-3 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                                    >
                                        {courses.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">
                                    Topic or Entity List
                                </label>
                                <textarea aria-label="Topic or Entity List"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. 'Cell Organelles' or 'Einstein, Newton, Curie, Darwin'"
                                    className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 font-medium text-base rounded-2xl px-5 py-3 min-h-[120px] resize-none focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                                />
                                <p className="text-slate-400 text-xs font-semibold mt-2 italic">
                                    Tip: Give a general topic, or explicitly list the entities you want.
                                </p>
                                {recentTopics.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Recent</p>
                                        <div className="flex flex-wrap gap-2">
                                            {recentTopics.map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setTopic(t)}
                                                    className="text-xs px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg border border-indigo-100 transition-colors truncate max-w-[180px]"
                                                    title={t}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">
                                    Number of Puzzles
                                </label>
                                <div className="flex gap-2">
                                    {[3, 5, 8, 10].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setCount(n)}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${count === n
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">
                                    Difficulty
                                </label>
                                <div className="flex gap-2">
                                    {(['easier', 'mixed', 'harder'] as const).map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDifficultyMix(d)}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border capitalize transition-all ${difficultyMix === d
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                                        >
                                            {d === 'easier' ? 'Easier' : d === 'harder' ? 'Harder' : 'Mixed'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
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
                            </div>

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
                                        {sourceError && <p className="text-xs text-red-500 mt-1">{sourceError}</p>}
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

                        {/* Right: How It Works + CTAs */}
                        <div className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-black text-indigo-900 mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-500" />
                                    How It Works
                                </h3>
                                <ul className="space-y-4">
                                    {[
                                        `The AI will generate ${count} puzzle${count !== 1 ? 's' : ''} based on your topic.`,
                                        "Each puzzle has 5 clues ranging from obscure to obvious.",
                                        "Review and edit puzzles before playing.",
                                        "Project the game on your board and reveal clues one by one.",
                                        "The display cycles through revealed clues automatically so students can re-read them."
                                    ].map((step, i) => (
                                        <li key={i} className="flex gap-3 text-indigo-800 font-medium text-sm">
                                            <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                {i + 1}
                                            </span>
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-8 space-y-3">
                                <button
                                    onClick={handleGenerate}
                                    disabled={!canGenerate}
                                    className={`w-full font-black text-lg py-5 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl ${canGenerate
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/25 hover:-translate-y-1'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Generating Game...
                                        </>
                                    ) : (
                                        <>
                                            Generate {count} Puzzle{count !== 1 ? 's' : ''} <Play className="w-5 h-5" fill="currentColor" />
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowLoadModal(true)}
                                    disabled={isLoading}
                                    className="w-full font-bold text-base py-3 px-8 rounded-2xl bg-white border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Upload className="w-4 h-4" />
                                    Load from Library
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showLoadModal && (
                <LoadGameModal
                    onLoad={handleLoadGame}
                    onClose={() => setShowLoadModal(false)}
                />
            )}
        </div>
    );
};

export default WhoAmISetupView;
