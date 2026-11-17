import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WhoAmIPuzzle } from '../types';
import {
    ArrowLeft, ArrowRight, ChevronRight, Eye, Download, Loader2,
    Pause, Play, RotateCcw
} from 'lucide-react';
import { cleanHtml, sanitizeForPdf } from '../utils/sanitize';
import { jsPDF } from 'jspdf';
import { useWindowKeydown } from '../hooks/useWindowKeydown';

interface WhoAmIGameViewProps {
    puzzles: WhoAmIPuzzle[];
    onBack: () => void;
}

type ScrollSpeed = 'slow' | 'medium' | 'fast';
const SPEED_KEY = 'sp_whoami_scroll_speed';

const dwellMs = (clue: string, multiplier: number): number => {
    const words = clue.trim().split(/\s+/).length;
    // 4s base + 0.4s per word, clamped to [5s, 12s], then scaled by speed
    const base = Math.max(5000, Math.min(12000, 4000 + words * 400));
    return base * multiplier;
};

const speedMultiplier = (speed: ScrollSpeed): number =>
    speed === 'slow' ? 1.5 : speed === 'fast' ? 0.7 : 1;

const WhoAmIGameView: React.FC<WhoAmIGameViewProps> = ({ puzzles, onBack }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealedClues, setRevealedClues] = useState<number>(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Auto-scroll state
    const [focusedClueIndex, setFocusedClueIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [speed, setSpeed] = useState<ScrollSpeed>(() => {
        return (localStorage.getItem(SPEED_KEY) as ScrollSpeed) || 'medium';
    });

    const tickRef = useRef<number | null>(null);
    const clueRefs = useRef<(HTMLDivElement | null)[]>([]);

    const currentPuzzle = puzzles[currentIndex];

    const resetPuzzleState = useCallback(() => {
        setRevealedClues(0);
        setShowAnswer(false);
        setFocusedClueIndex(0);
        setPaused(false);
        if (tickRef.current) clearTimeout(tickRef.current);
    }, []);

    const handleNextPuzzle = () => {
        if (currentIndex < puzzles.length - 1) {
            setCurrentIndex(prev => prev + 1);
            resetPuzzleState();
        }
    };

    const handlePrevPuzzle = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            resetPuzzleState();
        }
    };

    const handleResetSession = () => {
        if (!confirm('Reset to the first puzzle? All reveal progress will be cleared.')) return;
        setCurrentIndex(0);
        resetPuzzleState();
    };

    // Keyboard shortcuts
    useWindowKeydown((e: KeyboardEvent) => {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        if (e.code === 'Space') {
            e.preventDefault();
            if (showAnswer) return;
            if (revealedClues < 5) revealNextClue();
            else setShowAnswer(true);
        } else if (e.code === 'ArrowRight' || e.code === 'KeyN') {
            e.preventDefault();
            if (currentIndex < puzzles.length - 1) {
                setCurrentIndex(i => i + 1);
                resetPuzzleState();
            }
        } else if (e.code === 'ArrowLeft' || e.code === 'KeyB') {
            e.preventDefault();
            if (currentIndex > 0) {
                setCurrentIndex(i => i - 1);
                resetPuzzleState();
            }
        } else if (e.code === 'KeyP') {
            e.preventDefault();
            if (revealedClues >= 2) setPaused(p => !p);
        } else if (e.code === 'Escape') {
            e.preventDefault();
            onBack();
        }
    });

    // Auto-scroll: cycle focused clue through revealed clues with dwell timer.
    // Activates only when revealedClues >= 2 and not paused and answer not showing.
    useEffect(() => {
        if (tickRef.current) clearTimeout(tickRef.current);
        if (revealedClues < 2 || paused || showAnswer) return;

        const clue = currentPuzzle?.clues[focusedClueIndex] ?? '';
        const delay = dwellMs(clue, speedMultiplier(speed));

        tickRef.current = window.setTimeout(() => {
            setFocusedClueIndex(idx => (idx + 1) % revealedClues);
        }, delay);

        return () => { if (tickRef.current) clearTimeout(tickRef.current); };
    }, [focusedClueIndex, revealedClues, paused, showAnswer, speed, currentPuzzle]);

    // Scroll focused clue into view
    useEffect(() => {
        if (revealedClues < 2) return;
        const el = clueRefs.current[focusedClueIndex];
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, [focusedClueIndex, revealedClues]);

    // When a new clue is revealed, jump focus to it
    const revealNextClue = () => {
        if (revealedClues < 5) {
            const next = revealedClues; // index of the newly revealed clue
            setRevealedClues(revealedClues + 1);
            setFocusedClueIndex(next);
        }
    };

    const handleFocusClue = (idx: number) => {
        if (idx < revealedClues) {
            setFocusedClueIndex(idx);
            if (tickRef.current) clearTimeout(tickRef.current);
        }
    };

    const handleSpeedChange = (s: ScrollSpeed) => {
        setSpeed(s);
        localStorage.setItem(SPEED_KEY, s);
    };

    const handleExportReviewSheet = () => {
        setIsGeneratingPdf(true);
        try {
            const doc = new jsPDF();
            doc.setCharSpace(0);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("Who Am I? Review Sheet", 10, 20);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Use this sheet to review the puzzles or play again with your class.", 10, 28);
            let y = 40;
            puzzles.forEach((puzzle, idx) => {
                if (y > 250) { doc.addPage(); y = 20; }
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text(`Puzzle ${idx + 1}`, 10, y);
                y += 8;
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                puzzle.clues.forEach((clue, clueIdx) => {
                    const lines = doc.splitTextToSize(`${clueIdx + 1}. ${sanitizeForPdf(clue)}`, 190);
                    doc.text(lines, 15, y);
                    y += lines.length * 5;
                });
                y += 3;
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(`Answer: ${sanitizeForPdf(puzzle.entity)}`, 15, y);
                y += 8;
                if (puzzle.factoid) {
                    doc.setFontSize(9);
                    doc.setFont("helvetica", "italic");
                    const factLines = doc.splitTextToSize(`💡 ${sanitizeForPdf(puzzle.factoid)}`, 180);
                    doc.text(factLines, 15, y);
                    y += factLines.length * 4;
                }
                y += 8;
            });
            doc.save('who-am-i-review-sheet.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // Progress dots
    const progressDots = puzzles.map((_, i) => (
        <button
            key={i}
            onClick={() => { if (i !== currentIndex) { setCurrentIndex(i); resetPuzzleState(); } }}
            title={`Puzzle ${i + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentIndex
                ? 'bg-indigo-400 ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 scale-125'
                : i < currentIndex
                    ? 'bg-indigo-600'
                    : 'bg-slate-600'}`}
        />
    ));

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-5xl z-10 flex flex-col h-[90vh]">
                {/* Header */}
                <header className="flex justify-between items-center mb-6 shrink-0 gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="text-slate-400 hover:text-white flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Exit
                        </button>
                        <button
                            onClick={handleResetSession}
                            className="text-slate-500 hover:text-slate-300 flex items-center gap-1 text-xs font-bold transition-colors"
                            title="Reset to first puzzle"
                        >
                            <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="bg-slate-800 border border-slate-700 rounded-full px-6 py-2">
                            <span className="text-slate-400 font-bold tracking-widest uppercase text-xs">
                                Puzzle <span className="text-indigo-400">{currentIndex + 1}</span> of {puzzles.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">{progressDots}</div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Speed control */}
                        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
                            {(['slow', 'medium', 'fast'] as ScrollSpeed[]).map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleSpeedChange(s)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-all ${speed === s
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-400 hover:text-white'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleExportReviewSheet}
                            disabled={isGeneratingPdf}
                            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50"
                        >
                            {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            PDF
                        </button>
                    </div>
                </header>

                {/* Main Game Area */}
                <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col items-center justify-center relative min-h-0">
                    {!showAnswer ? (
                        <div className="w-full max-w-3xl space-y-4 flex flex-col h-full justify-center">
                            <h2 className="text-4xl md:text-5xl font-black text-center text-white mb-6 tracking-tight shrink-0">
                                Who Am I?
                            </h2>

                            <div className="space-y-3 flex-1 overflow-y-auto pr-2 pb-2">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        ref={el => { clueRefs.current[i] = el; }}
                                        onClick={() => handleFocusClue(i)}
                                        className={`w-full p-5 md:p-6 rounded-3xl transition-all duration-500 border-2 ${i < revealedClues
                                            ? i === focusedClueIndex && revealedClues >= 2
                                                ? 'bg-slate-800 border-indigo-400 shadow-2xl shadow-indigo-500/20 scale-[1.02] cursor-pointer'
                                                : 'bg-slate-800 border-indigo-500/50 opacity-60 scale-[0.98] cursor-pointer hover:opacity-80'
                                            : 'bg-slate-800/50 border-white/5 opacity-50 blur-[2px] scale-95 pointer-events-none'}`}
                                    >
                                        <div className="flex gap-5 items-start">
                                            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-all ${i < revealedClues
                                                ? i === focusedClueIndex && revealedClues >= 2
                                                    ? 'bg-indigo-400 text-white scale-110'
                                                    : 'bg-indigo-600 text-white'
                                                : 'bg-slate-700 text-slate-500'}`}>
                                                {i + 1}
                                            </div>
                                            {i < revealedClues ? (
                                                <p
                                                    className={`font-bold leading-tight text-white transition-all duration-300 ${i === focusedClueIndex && revealedClues >= 2
                                                        ? 'text-xl md:text-2xl'
                                                        : 'text-lg md:text-xl'}`}
                                                    dangerouslySetInnerHTML={{ __html: cleanHtml(currentPuzzle.clues[i]) }}
                                                />
                                            ) : (
                                                <p className="text-xl font-bold leading-tight text-slate-500 selection:bg-transparent text-transparent">
                                                    Hidden Clue...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Controls */}
                            <div className="pt-4 flex justify-center items-center gap-3 flex-wrap shrink-0">
                                {revealedClues >= 2 && (
                                    <button
                                        onClick={() => setPaused(p => !p)}
                                        className="bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2"
                                    >
                                        {paused ? <><Play className="w-3 h-3" /> Resume</> : <><Pause className="w-3 h-3" /> Pause</>}
                                    </button>
                                )}
                                {revealedClues < 5 ? (
                                    <button
                                        onClick={revealNextClue}
                                        className="bg-slate-800 border border-slate-700 text-slate-300 text-sm font-bold px-6 py-2 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2"
                                    >
                                        Reveal Clue {revealedClues + 1} <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowAnswer(true)}
                                        className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-sm font-bold px-6 py-2 rounded-xl hover:bg-emerald-500/30 transition-all flex items-center gap-2"
                                    >
                                        Reveal Answer <Eye className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col justify-center items-center text-center animate-in zoom-in duration-500">
                            <span className="text-[6rem] leading-none mb-6">🎉</span>
                            <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">I am</h3>
                            <h2
                                className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tight"
                                dangerouslySetInnerHTML={{ __html: cleanHtml(currentPuzzle.entity) }}
                            />
                            {currentPuzzle.factoid && (
                                <div className="bg-white/10 p-8 rounded-3xl max-w-2xl border border-white/20">
                                    <p
                                        className="text-xl md:text-2xl font-bold text-slate-300 italic"
                                        dangerouslySetInnerHTML={{ __html: `"${cleanHtml(currentPuzzle.factoid)}"` }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="mt-6 flex justify-between shrink-0">
                    <button
                        onClick={handlePrevPuzzle}
                        disabled={currentIndex === 0}
                        className={`flex items-center gap-2 p-4 rounded-2xl font-bold transition-all ${currentIndex === 0 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <ArrowLeft className="w-5 h-5" /> Previous
                    </button>
                    <button
                        onClick={handleNextPuzzle}
                        disabled={currentIndex === puzzles.length - 1}
                        className={`flex items-center gap-2 p-4 rounded-2xl font-bold transition-all ${currentIndex === puzzles.length - 1 ? 'text-slate-700 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10'}`}
                    >
                        Next <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WhoAmIGameView;
