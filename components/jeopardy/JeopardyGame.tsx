import React, { useState, useEffect } from 'react';
import {
    generateJeopardyBoard,
    refreshSingleQuestion,
    refreshCategory,
    refreshFinalJeopardy
} from '../../services/jeopardyService';
import { JeopardyBoardData, Team, SavedBoard } from './types';
import {
    CheckCircle2, Loader2
} from 'lucide-react';
import { playChime, playWinSound } from './audioUtils';
import { Confetti } from './Confetti';
import { GameHUD } from './GameHUD';
import { CategoryHeader } from './CategoryHeader';
import { QuestionModal } from './QuestionModal';
import { FinalJeopardyOverlay } from './FinalJeopardyOverlay';
import { TeacherPreview } from './TeacherPreview';
import { PreGameReviewBoard } from './PreGameReviewBoard';
import { JeopardySetupDashboard } from './JeopardySetupDashboard';
import { exportJeopardyStudySheet } from './exportPdf';
import { ScoreAdjustmentModal } from './modals/ScoreAdjustmentModal';
import { EndSessionModal } from './modals/EndSessionModal';
import { HowToGuide } from './modals/HowToGuide';
import { BoardEditorModals } from './modals/BoardEditorModals';

const JeopardyGame: React.FC = () => {
    // --- Core Game State ---
    const [topic, setTopic] = useState('');
    const [gradeLevel, setGradeLevel] = useState('High School');
    const [standards, setStandards] = useState('');
    const [classicMode, setClassicMode] = useState(false);
    const [numTeams, setNumTeams] = useState(3);
    const [teams, setTeams] = useState<Team[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [savedBoards, setSavedBoards] = useState<SavedBoard[]>([]);

    const [board, setBoard] = useState<JeopardyBoardData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeQuestion, setActiveQuestion] = useState<{ catIndex: number, qIndex: number } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [feedback, setFeedback] = useState<'success' | 'fail' | null>(null);

    // --- Modal State ---
    const [inputModal, setInputModal] = useState<{ isOpen: boolean, title: string, defaultValue: string, onConfirm: (val: string) => void } | null>(null);
    const [scoreEditModal, setScoreEditModal] = useState<{ isOpen: boolean, teamId: number, teamName: string, currentScore: number } | null>(null);
    const [editingQ, setEditingQ] = useState<{ cIdx: number, qIdx: number, q: string, a: string, h: string } | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    // --- Wagering State ---
    const [isDailyDouble, setIsDailyDouble] = useState(false);
    const [wagerValue, setWagerValue] = useState<number>(0);
    const [wageringTeamId, setWageringTeamId] = useState<number | null>(null);
    const [isFinalJeopardyActive, setIsFinalJeopardyActive] = useState(false);
    const [finalJeopardyWagers, setFinalJeopardyWagers] = useState<Record<number, number>>({});
    const [finalJeopardyStep, setFinalJeopardyStep] = useState<'wager' | 'clue' | 'reveal' | 'winner'>('wager');

    // --- UI State ---
    const [showTeacherPreview, setShowTeacherPreview] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [showHowTo, setShowHowTo] = useState(false);
    const [lastClosed, setLastClosed] = useState<{ cIdx: number, qIdx: number } | null>(null);
    const [endSessionConfirm, setEndSessionConfirm] = useState(false);
    const [pendingReview, setPendingReview] = useState(false);
    const [aiReviseCat, setAiReviseCat] = useState<{ cIdx: number } | null>(null);
    const [aiReviseQ, setAiReviseQ] = useState<{ cIdx: number; qIdx: number } | null>(null);
    const [aiReviseFinal, setAiReviseFinal] = useState(false);
    const [editingFinal, setEditingFinal] = useState<{ category: string; clue: string; answer: string } | null>(null);
    const [difficultyMode, setDifficultyMode] = useState<'random' | 'increasing'>('random');
    const [isWholeCourse, setIsWholeCourse] = useState(false);

    // --- Persistent Storage ---
    useEffect(() => {
        const saved = localStorage.getItem('jeopardy_lib_v3');
        if (saved) {
            try {
                setSavedBoards(JSON.parse(saved));
            } catch {
                // Ignore parse errors
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('jeopardy_lib_v3', JSON.stringify(savedBoards));
    }, [savedBoards]);

    // --- Helpers ---
    const getBoardSignature = (b: JeopardyBoardData) => {
        return b.categories.map(c => c.title + c.questions.map(q => q.question).join('')).join('|');
    };

    const handleRenameTeam = (teamId: number) => {
        const currentName = teams.find(t => t.id === teamId)?.name || "";
        setInputModal({
            isOpen: true,
            title: "Rename Team",
            defaultValue: currentName,
            onConfirm: (newName) => {
                if (!newName.trim()) return;
                setTeams(prev => prev.map(t => t.id === teamId ? { ...t, name: newName } : t));
                setInputModal(null);
            }
        });
    };

    const startNewGame = async () => {
        if (!topic.trim()) return;
        setIsLoading(true);
        try {
            const data = await generateJeopardyBoard(
                topic,
                gradeLevel,
                standards,
                classicMode,
                "",
                [],
                isWholeCourse ? 'increasing' : difficultyMode,
                isWholeCourse
            );
            setBoard(data);
            setTeams(Array.from({ length: numTeams }, (_, i) => ({ id: i, name: `Team ${i + 1}`, score: 0 })));
            setPendingReview(true);
        } catch (e: unknown) {
            console.error("Jeopardy board generation failed", { topic, gradeLevel, standards, error: e });
            const errorObj = e as { message?: string; name?: string };
            const msg = (errorObj?.message || '').toString();
            const lower = msg.toLowerCase();
            let userMessage: string;
            if (errorObj?.name === 'AbortError' || lower.includes('took too long') || lower.includes('timeout')) {
                userMessage = "The AI took too long to build the board. Please try again — this can happen during peak hours.";
            } else if (lower.includes('401') || lower.includes('403') || lower.includes('unauthorized')) {
                userMessage = "Your session was rejected. Please sign in again and retry.";
            } else if (lower.includes('429') || lower.includes('rate') || lower.includes('quota')) {
                userMessage = "The AI is rate-limited right now. Please wait a moment and try again.";
            } else if (e instanceof SyntaxError || lower.includes('json') || lower.includes('unexpected token')) {
                userMessage = "The AI returned a malformed board. Please try again, or narrow the topic slightly.";
            } else {
                userMessage = `The board could not be built. ${msg ? `Details: ${msg}` : ''} Please try again.`;
            }
            alert(userMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportStudySheet = async () => {
        if (!board) return;
        setIsGeneratingPdf(true);
        try {
            await exportJeopardyStudySheet(board, topic);
        } catch (e) {
            console.error("PDF Gen Error", e);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleSaveBoard = () => {
        if (!board) return;
        const currentSig = getBoardSignature(board);
        const existing = savedBoards.find(b => b.signature === currentSig);

        if (existing) {
            alert(`This board is already in your library as: "${existing.name}"`);
            return;
        }

        setInputModal({
            isOpen: true,
            title: "Save Science Board",
            defaultValue: topic + " Review",
            onConfirm: (name) => {
                if (!name) return;
                const newSaved: SavedBoard = {
                    id: crypto.randomUUID(),
                    name, topic, gradeLevel,
                    board: JSON.parse(JSON.stringify(board)),
                    timestamp: Date.now(),
                    signature: currentSig,
                    isWholeCourse: isWholeCourse
                };
                setSavedBoards(prev => [newSaved, ...prev]);
                setInputModal(null);
                setTimeout(() => alert("Board successfully saved to Library!"), 100);
            }
        });
    };

    const loadSavedBoard = (saved: SavedBoard) => {
        setBoard(JSON.parse(JSON.stringify(saved.board)));
        setTopic(saved.topic);
        setGradeLevel(saved.gradeLevel);
        setIsWholeCourse(!!saved.isWholeCourse);
        setTeams(Array.from({ length: numTeams }, (_, i) => ({ id: i, name: `Team ${i + 1}`, score: 0 })));
        setPendingReview(true);
        setShowLibrary(false);
        setIsFinalJeopardyActive(false);
    };

    const handleCardOpen = (cIdx: number, qIdx: number) => {
        const q = board?.categories[cIdx].questions[qIdx];
        if (q?.answered) return;

        const isDD = board?.dailyDoubleIds.includes(q?.id || '');
        if (isDD) {
            setIsDailyDouble(true);
            setWagerValue(q?.value || 100);
            setWageringTeamId(null);
            playChime();
        } else {
            setIsDailyDouble(false);
        }

        setActiveQuestion({ catIndex: cIdx, qIndex: qIdx });
    };

    const handleScoreUpdate = (tId: number, amount: number) => {
        if (!board) return;
        setFeedback(amount > 0 ? 'success' : 'fail');
        setTeams(prev => prev.map(t => t.id === tId ? { ...t, score: t.score + amount } : t));
        setTimeout(() => setFeedback(null), 800);
    };

    const handleRefreshQ = (cIdx: number, qIdx: number) => {
        setAiReviseQ({ cIdx, qIdx });
    };

    const closeQuestion = () => {
        if (!activeQuestion || !board) return;
        const newBoard = { ...board };
        newBoard.categories[activeQuestion.catIndex].questions[activeQuestion.qIndex].answered = true;
        setBoard(newBoard);
        setLastClosed({ cIdx: activeQuestion.catIndex, qIdx: activeQuestion.qIndex });
        setActiveQuestion(null);
        setIsDailyDouble(false);
    };

    const reopenLastClosed = () => {
        if (!lastClosed || !board) return;
        const newBoard = { ...board };
        newBoard.categories[lastClosed.cIdx].questions[lastClosed.qIdx].answered = false;
        setBoard(newBoard);
        setLastClosed(null);
    };

    const handleRefreshCat = (cIdx: number) => {
        setAiReviseCat({ cIdx });
    };

    const submitAiReviseCategory = async (newTitle: string, prompt: string) => {
        if (!board || !aiReviseCat) return;
        const { cIdx } = aiReviseCat;
        setAiReviseCat(null);
        setIsProcessing(true);
        try {
            const nc = await refreshCategory(topic, board.categories[cIdx].title, gradeLevel, prompt || "", classicMode, newTitle, isWholeCourse);
            const nb = { ...board };
            nb.categories[cIdx] = nc;
            setBoard(nb);
        } catch (e: unknown) {
            console.error("Category AI revise failed", e);
            const msg = (e as Error)?.message;
            alert(`Could not revise this category. ${msg ? `Details: ${msg}` : ''} Please try again.`);
        } finally {
            setIsProcessing(false);
        }
    };

    const submitAiReviseQuestion = async (prompt: string) => {
        if (!board || !aiReviseQ) return;
        const { cIdx, qIdx } = aiReviseQ;
        setAiReviseQ(null);
        setIsProcessing(true);
        try {
            const cat = board.categories[cIdx];
            const val = cat.questions[qIdx].value;
            const existingId = cat.questions[qIdx].id;
            const newQ = await refreshSingleQuestion(topic, cat.title, val, gradeLevel, prompt || "", classicMode, [], isWholeCourse);
            const nb = { ...board };
            nb.categories[cIdx].questions[qIdx] = { ...newQ, id: existingId };
            setBoard(nb);
        } catch (e: unknown) {
            console.error("Question AI revise failed", e);
            const msg = (e as Error)?.message;
            alert(`Could not revise this clue. ${msg ? `Details: ${msg}` : ''} Please try again.`);
        } finally {
            setIsProcessing(false);
        }
    };

    const submitAiReviseFinal = async (newCategory: string, prompt: string) => {
        if (!board?.finalJeopardy) return;
        setAiReviseFinal(false);
        setIsProcessing(true);
        try {
            const nf = await refreshFinalJeopardy(
                topic,
                board.finalJeopardy,
                gradeLevel,
                prompt || "",
                classicMode,
                newCategory,
                isWholeCourse
            );
            setBoard({ ...board, finalJeopardy: nf });
        } catch (e: unknown) {
            console.error("Final Jeopardy AI revise failed", e);
            const msg = (e as Error)?.message;
            alert(`Could not revise Final Jeopardy. ${msg ? `Details: ${msg}` : ''} Please try again.`);
        } finally {
            setIsProcessing(false);
        }
    };

    const saveEditedFinal = (category: string, clue: string, answer: string) => {
        if (!board) return;
        setBoard({ ...board, finalJeopardy: { category, clue, answer } });
        setEditingFinal(null);
    };

    const toggleDailyDouble = (cIdx: number, qIdx: number) => {
        if (!board) return;
        const qId = board.categories[cIdx].questions[qIdx].id;
        const currentDDs = board.dailyDoubleIds || [];
        let nextDDs: string[];
        if (currentDDs.includes(qId)) {
            nextDDs = currentDDs.filter(id => id !== qId);
        } else if (currentDDs.length < 2) {
            nextDDs = [...currentDDs, qId];
        } else {
            nextDDs = [currentDDs[1], qId];
        }
        setBoard({ ...board, dailyDoubleIds: nextDDs });
    };

    const approvePendingBoard = () => {
        setPendingReview(false);
        setGameStarted(true);
    };

    const discardPendingBoard = () => {
        setPendingReview(false);
        setBoard(null);
        setTeams([]);
    };

    const endSession = (celebrate: boolean) => {
        setEndSessionConfirm(false);
        if (celebrate) {
            playWinSound();
            setShowConfetti(true);
            setTimeout(() => {
                setShowConfetti(false);
                setGameStarted(false);
                setBoard(null);
            }, 4500);
        } else {
            setGameStarted(false);
            setBoard(null);
        }
    };

    const hasAnyScore = teams.some(t => t.score !== 0);

    const startFinalJeopardy = () => {
        if (!board?.finalJeopardy) return;
        setFinalJeopardyStep('wager');
        setIsFinalJeopardyActive(true);
        setFinalJeopardyWagers({});
    };

    const handleSaveEditedQuestion = (q: string, a: string, h: string) => {
        if (!editingQ || !board) return;
        const nb = { ...board };
        nb.categories[editingQ.cIdx].questions[editingQ.qIdx] = {
            ...nb.categories[editingQ.cIdx].questions[editingQ.qIdx],
            question: q, answer: a, hint: h
        };
        setBoard(nb);
        setEditingQ(null);
    };

    const curQ = activeQuestion ? board?.categories[activeQuestion.catIndex].questions[activeQuestion.qIndex] : null;

    // --- Pre-Game Review ---
    if (pendingReview && board) {
        return (
            <>
                <PreGameReviewBoard
                    board={board}
                    isProcessing={isProcessing}
                    onApprove={approvePendingBoard}
                    onDiscard={discardPendingBoard}
                    onRefreshCat={handleRefreshCat}
                    onRefreshQ={handleRefreshQ}
                    onEditQ={(cIdx, qIdx, q, a, h) => setEditingQ({ cIdx, qIdx, q, a, h })}
                    onToggleDD={toggleDailyDouble}
                    onEditFinal={(final) => setEditingFinal(final)}
                    onAiReviseFinal={() => setAiReviseFinal(true)}
                    onSaveBoard={handleSaveBoard}
                />
                <BoardEditorModals
                    board={board}
                    topic={topic}
                    aiReviseCat={aiReviseCat}
                    onCloseAiReviseCat={() => setAiReviseCat(null)}
                    onSubmitAiReviseCat={submitAiReviseCategory}
                    aiReviseQ={aiReviseQ}
                    onCloseAiReviseQ={() => setAiReviseQ(null)}
                    onSubmitAiReviseQ={submitAiReviseQuestion}
                    aiReviseFinal={aiReviseFinal}
                    onCloseAiReviseFinal={() => setAiReviseFinal(false)}
                    onSubmitAiReviseFinal={submitAiReviseFinal}
                    editingQ={editingQ}
                    onCloseEditingQ={() => setEditingQ(null)}
                    onSaveEditingQ={handleSaveEditedQuestion}
                    editingFinal={editingFinal}
                    onCloseEditingFinal={() => setEditingFinal(null)}
                    onSaveEditingFinal={saveEditedFinal}
                    showLibrary={showLibrary}
                    savedBoards={savedBoards}
                    onLoadBoard={loadSavedBoard}
                    onDeleteBoard={(id: string) => setSavedBoards(p => p.filter(b => b.id !== id))}
                    onCloseLibrary={() => setShowLibrary(false)}
                    inputModal={inputModal}
                    onCloseInputModal={() => setInputModal(null)}
                />
                {isProcessing && (
                    <div className="fixed inset-0 z-[130] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white rounded-3xl p-10 shadow-2xl flex items-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                            <span className="font-black text-slate-800 uppercase tracking-widest text-sm">Refining...</span>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // --- Dashboard ---
    if (!gameStarted) {
        return (
            <>
                <JeopardySetupDashboard
                    topic={topic}
                    setTopic={setTopic}
                    gradeLevel={gradeLevel}
                    setGradeLevel={setGradeLevel}
                    standards={standards}
                    setStandards={setStandards}
                    classicMode={classicMode}
                    setClassicMode={setClassicMode}
                    numTeams={numTeams}
                    setNumTeams={setNumTeams}
                    difficultyMode={difficultyMode}
                    setDifficultyMode={setDifficultyMode}
                    isWholeCourse={isWholeCourse}
                    setIsWholeCourse={setIsWholeCourse}
                    isLoading={isLoading}
                    onStartNewGame={startNewGame}
                    onOpenLibrary={() => setShowLibrary(true)}
                    onOpenHowTo={() => setShowHowTo(true)}
                />
                {showHowTo && <HowToGuide onClose={() => setShowHowTo(false)} />}
                <BoardEditorModals
                    showLibrary={showLibrary}
                    savedBoards={savedBoards}
                    onLoadBoard={loadSavedBoard}
                    onDeleteBoard={(id: string) => setSavedBoards(p => p.filter(b => b.id !== id))}
                    onCloseLibrary={() => setShowLibrary(false)}
                    inputModal={inputModal}
                    onCloseInputModal={() => setInputModal(null)}
                />
            </>
        );
    }

    return (
        <div className={`h-full flex flex-col gap-6 transition-all duration-300 ${feedback === 'success' ? 'bg-emerald-50/50' : feedback === 'fail' ? 'bg-rose-50/50' : ''}`}>
            {/* Game HUD */}
            <GameHUD
                topic={topic}
                board={board}
                teams={teams}
                lastClosed={lastClosed}
                isGeneratingPdf={isGeneratingPdf}
                onEndSessionConfirm={() => setEndSessionConfirm(true)}
                onSaveBoard={handleSaveBoard}
                onExportStudySheet={handleExportStudySheet}
                onOpenLibrary={() => setShowLibrary(true)}
                onOpenPreview={() => setShowTeacherPreview(true)}
                onReopenLastClosed={reopenLastClosed}
                onRenameTeam={handleRenameTeam}
                onScoreEdit={(teamId, teamName, currentScore) => setScoreEditModal({ isOpen: true, teamId, teamName, currentScore })}
                onStartFinalJeopardy={startFinalJeopardy}
            />

            {/* Grid */}
            <div className="flex-1 grid grid-cols-5 gap-4 md:gap-6 min-h-0">
                {board?.categories.map((cat, cIdx) => (
                    <div key={cIdx} className="flex flex-col gap-4 md:gap-6 min-w-0">
                        <CategoryHeader title={cat.title} />
                        {cat.questions.map((q, qIdx) => (
                            <button key={qIdx} onClick={() => handleCardOpen(cIdx, qIdx)} disabled={q.answered}
                                className={`flex-1 rounded-[2.5rem] border-2 transition-all flex items-center justify-center font-black text-3xl md:text-5xl relative overflow-hidden shadow-lg ${q.answered ? 'bg-slate-100 text-slate-400 opacity-40 border-transparent cursor-default' : 'bg-white border-slate-100 text-indigo-600 hover:scale-[1.03] hover:shadow-2xl hover:border-indigo-400 active:scale-95'
                                    }`}>
                                {!q.answered && `$${q.value}`}
                                {q.answered && <CheckCircle2 className="w-12 h-12" />}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            {/* Overlays */}
            {activeQuestion && curQ && (
                <QuestionModal
                    curQ={curQ}
                    categoryTitle={board?.categories[activeQuestion.catIndex].title || ''}
                    teams={teams}
                    onClose={closeQuestion}
                    onScore={handleScoreUpdate}
                    isDailyDouble={isDailyDouble}
                    wagerValue={wagerValue}
                    onWagerChange={setWagerValue}
                    wageringTeamId={wageringTeamId}
                    onSelectWageringTeam={setWageringTeamId}
                    maxClueValue={board ? Math.max(...board.categories.flatMap(c => c.questions.map(q => q.value))) : 1000}
                />
            )}

            {isFinalJeopardyActive && board?.finalJeopardy && (
                <FinalJeopardyOverlay
                    data={board.finalJeopardy}
                    teams={teams}
                    step={finalJeopardyStep}
                    setStep={setFinalJeopardyStep}
                    wagers={finalJeopardyWagers}
                    setWagers={setFinalJeopardyWagers}
                    onScore={handleScoreUpdate}
                    onClose={() => setIsFinalJeopardyActive(false)}
                    onWinner={() => { playWinSound(); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5000); }}
                />
            )}

            {showConfetti && <Confetti />}

            <EndSessionModal
                isOpen={endSessionConfirm}
                hasAnyScore={hasAnyScore}
                onEndSession={endSession}
                onClose={() => setEndSessionConfirm(false)}
            />

            {scoreEditModal && (
                <ScoreAdjustmentModal
                    isOpen={scoreEditModal.isOpen}
                    teamName={scoreEditModal.teamName}
                    currentScore={scoreEditModal.currentScore}
                    onClose={() => setScoreEditModal(null)}
                    onConfirm={(newScore: number) => {
                        setTeams(prev => prev.map(t => t.id === scoreEditModal.teamId ? { ...t, score: newScore } : t));
                        setScoreEditModal(null);
                    }}
                />
            )}

            {showTeacherPreview && (
                <TeacherPreview
                    board={board}
                    onClose={() => setShowTeacherPreview(false)}
                    onRefreshQ={handleRefreshQ}
                    onEditQ={(c, q) => {
                        const quest = board!.categories[c].questions[q];
                        setEditingQ({ cIdx: c, qIdx: q, q: quest.question, a: quest.answer, h: quest.hint });
                    }}
                    onRefreshCat={handleRefreshCat}
                    onToggleDD={toggleDailyDouble}
                />
            )}

            <BoardEditorModals
                board={board}
                topic={topic}
                aiReviseCat={aiReviseCat}
                onCloseAiReviseCat={() => setAiReviseCat(null)}
                onSubmitAiReviseCat={submitAiReviseCategory}
                aiReviseQ={aiReviseQ}
                onCloseAiReviseQ={() => setAiReviseQ(null)}
                onSubmitAiReviseQ={submitAiReviseQuestion}
                aiReviseFinal={aiReviseFinal}
                onCloseAiReviseFinal={() => setAiReviseFinal(false)}
                onSubmitAiReviseFinal={submitAiReviseFinal}
                editingQ={editingQ}
                onCloseEditingQ={() => setEditingQ(null)}
                onSaveEditingQ={handleSaveEditedQuestion}
                editingFinal={editingFinal}
                onCloseEditingFinal={() => setEditingFinal(null)}
                onSaveEditingFinal={saveEditedFinal}
                showLibrary={showLibrary}
                savedBoards={savedBoards}
                onLoadBoard={loadSavedBoard}
                onDeleteBoard={(id: string) => setSavedBoards(p => p.filter(b => b.id !== id))}
                onCloseLibrary={() => setShowLibrary(false)}
                inputModal={inputModal}
                onCloseInputModal={() => setInputModal(null)}
            />

            <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
        </div>
    );
};

export default JeopardyGame;
