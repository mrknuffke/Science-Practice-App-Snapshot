import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CourseType, Flashcard, FlashcardReport } from '../types';
import { getFlashcardReport } from '../services/ai/flashcards';
import { cleanHtml, normalizeScientificNotation } from '../utils/sanitize';
import MarkdownRenderer, { INLINE_PARAGRAPHS, SPACED_PARAGRAPHS } from './MarkdownRenderer';
import { useReactToPrint } from 'react-to-print';
import { StudentTools } from './StudentTools';
import { LeitnerBoxBar } from './flashcards/LeitnerBoxBar';
import { ClozeCardContent } from './flashcards/ClozeCardContent';
import { ImageOcclusionCardContent } from './flashcards/ImageOcclusionCardContent';
import { MultiStepCardContent } from './flashcards/MultiStepCardContent';
import { SavedDecksModal } from './flashcards/SavedDecksModal';
import {
  getCardSignature,
  getCardSRS,
  updateCardSRS,
  getDeckSRSStats,
  getDueCards,
  saveDeckToStorage
} from './flashcards/srsEngine';
import { LeitnerStats, SavedFlashcardDeck } from './flashcards/types';
import { useWindowKeydown } from '../hooks/useWindowKeydown';

interface FlashcardViewProps {
  course: CourseType;
  topic: string;
  flashcards: Flashcard[];
  onFinish: (score?: number, maxScore?: number) => void;
  onQuit?: () => void;
  isLoading: boolean;
}

type MainViewMode = 'study' | 'quiz' | 'report';
type StudyFilter = 'all' | 'due' | 'cram';

const FlashcardView: React.FC<FlashcardViewProps> = ({
  course,
  topic,
  flashcards: initialFlashcards,
  onFinish,
  onQuit,
  isLoading
}) => {
  // === COMMON & DECK STATE ===
  const [activeCards, setActiveCards] = useState<Flashcard[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string>(topic);
  const [currentCourse, setCurrentCourse] = useState<CourseType>(course);
  const [mode, setMode] = useState<MainViewMode>('study');
  const [studyFilter, setStudyFilter] = useState<StudyFilter>('all');
  const [linkCopied, setLinkCopied] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isSavedDecksOpen, setIsSavedDecksOpen] = useState(false);
  const [activeSavedDeck, setActiveSavedDeck] = useState<SavedFlashcardDeck | null>(null);

  // === STUDY QUEUE & SRS STATE ===
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [isReverse, setIsReverse] = useState(false);
  const [isWriteMode, setIsWriteMode] = useState(false);
  const [writeAnswer, setWriteAnswer] = useState('');
  const [writeFeedback, setWriteFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [writeErrorAnimation, setWriteErrorAnimation] = useState(false);
  const [srsStats, setSrsStats] = useState<LeitnerStats>({
    box1: 0, box2: 0, box3: 0, box4: 0, box5: 0, total: 0, dueCount: 0, masteredPercentage: 0
  });

  // === ACTIVE RECALL INTERACTION STATE ===
  const [selectedMcqIdx, setSelectedMcqIdx] = useState<number | null>(null);
  const [mcqResult, setMcqResult] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedTf, setSelectedTf] = useState<'true' | 'false' | null>(null);
  const [tfResult, setTfResult] = useState<'correct' | 'incorrect' | null>(null);

  // === QUIZ MODE STATE ===
  const [quizTerms, setQuizTerms] = useState<Flashcard[]>([]);
  const [quizDefs, setQuizDefs] = useState<Flashcard[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [selectedDefId, setSelectedDefId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [quizMistakes, setQuizMistakes] = useState<Set<string>>(new Set());
  const [quizError, setQuizError] = useState<string | null>(null);

  // === REPORT STATE ===
  const [report, setReport] = useState<FlashcardReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // === PRINT REF ===
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${currentCourse} - ${currentTopic} - Flashcards`,
  });

  // Initialize cards on load or prop update
  useEffect(() => {
    if (initialFlashcards && initialFlashcards.length > 0) {
      setActiveCards([...initialFlashcards]);
      setCurrentTopic(topic);
      setCurrentCourse(course);
    }
  }, [initialFlashcards, topic, course]);

  // Rebuild deck and recompute SRS stats whenever activeCards or studyFilter changes
  useEffect(() => {
    if (activeCards.length === 0) return;

    const stats = getDeckSRSStats(activeCards);
    setSrsStats(stats);

    let queue: Flashcard[] = [];
    if (studyFilter === 'due') {
      queue = getDueCards(activeCards);
    } else {
      queue = [...activeCards];
    }

    setDeck(queue);
    setMasteredIds(new Set());
    setIsFlipped(false);
    resetCardInteractions();
  }, [activeCards, studyFilter]);

  const resetCardInteractions = () => {
    setWriteAnswer('');
    setWriteFeedback('none');
    setSelectedMcqIdx(null);
    setMcqResult(null);
    setSelectedTf(null);
    setTfResult(null);
  };

  // --- HELPER: THEME COLORS ---
  const getThemeColors = (c: CourseType) => {
    if (c === 'Custom Practice') return { bg: 'bg-indigo-600', text: 'text-indigo-900', border: 'border-indigo-600', light: 'bg-indigo-50', accent: 'text-indigo-500', hover: 'hover:bg-indigo-50' };
    if (c.includes('Chemistry')) return { bg: 'bg-violet-600', text: 'text-violet-900', border: 'border-violet-600', light: 'bg-violet-50', accent: 'text-violet-500', hover: 'hover:bg-violet-50' };
    if (c.includes('Physics') && !c.includes('Physical Science')) return { bg: 'bg-cyan-600', text: 'text-cyan-900', border: 'border-cyan-600', light: 'bg-cyan-50', accent: 'text-cyan-500', hover: 'hover:bg-cyan-50' };
    if (c.includes('Environmental')) return { bg: 'bg-teal-600', text: 'text-teal-900', border: 'border-teal-600', light: 'bg-teal-50', accent: 'text-teal-500', hover: 'hover:bg-teal-50' };
    if (c.includes('Middle School')) return { bg: 'bg-amber-500', text: 'text-amber-900', border: 'border-amber-600', light: 'bg-amber-50', accent: 'text-amber-500', hover: 'hover:bg-amber-50' };
    if (c.includes('Elementary School')) return { bg: 'bg-orange-500', text: 'text-orange-900', border: 'border-orange-500', light: 'bg-orange-50', accent: 'text-orange-500', hover: 'hover:bg-orange-50' };
    if (['Physical Science', 'Anatomy and Physiology', 'Marine Biology', 'Biotechnology', 'Forensic Science'].includes(c)) {
      return { bg: 'bg-slate-600', text: 'text-slate-900', border: 'border-slate-600', light: 'bg-slate-100', accent: 'text-slate-500', hover: 'hover:bg-slate-50' };
    }
    return { bg: 'bg-emerald-600', text: 'text-emerald-900', border: 'border-emerald-600', light: 'bg-emerald-50', accent: 'text-emerald-500', hover: 'hover:bg-emerald-50' };
  };
  const theme = getThemeColors(currentCourse);

  const currentCard = deck[0];

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('course', currentCourse);
    url.searchParams.set('topic', currentTopic);
    url.searchParams.set('mode', 'flashcards');
    navigator.clipboard.writeText(url.toString()).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleSaveDeck = () => {
    if (activeCards.length === 0) return;
    const newDeck: SavedFlashcardDeck = {
      id: activeSavedDeck?.id || `deck-${Date.now()}`,
      title: activeSavedDeck?.title || currentTopic,
      course: currentCourse,
      topic: currentTopic,
      createdAt: activeSavedDeck?.createdAt || Date.now(),
      updatedAt: Date.now(),
      cards: activeCards
    };
    saveDeckToStorage(newDeck);
    setActiveSavedDeck(newDeck);
    setSaveToast('Deck Saved to Library!');
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleLoadSavedDeck = (loaded: SavedFlashcardDeck) => {
    setActiveSavedDeck(loaded);
    setCurrentTopic(loaded.topic || loaded.title);
    setCurrentCourse(loaded.course);
    setActiveCards([...loaded.cards]);
    setMode('study');
    setStudyFilter('all');
    setSaveToast(`Loaded: ${loaded.title}`);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleStudyFlip = () => {
    if (isWriteMode && !isFlipped) return;
    setIsFlipped(!isFlipped);
  };

  const getCardTextSize = (text: string, isMcq: boolean) => {
    if (isMcq || text.length > 130) return 'text-base md:text-lg font-bold leading-relaxed';
    if (text.length > 70) return 'text-lg md:text-xl font-bold leading-relaxed';
    if (text.length > 35) return 'text-xl md:text-3xl font-extrabold leading-snug';
    return 'text-2xl md:text-4xl font-black leading-tight';
  };

  const checkFuzzyMatch = (input: string, target: string) => {
    const clean = (s: string) => s
      .replace(/<[^>]+>/g, '')
      .replace(/\\(?:text|mathrm|mathbf)\{([^}]+)\}/g, '$1')
      .replace(/\$+/g, '')
      .toLowerCase()
      .replace(/[^\w\s]|_/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const cleanInput = clean(input);
    const cleanTarget = clean(target);
    return cleanInput === cleanTarget || (cleanInput.length >= 3 && cleanTarget.includes(cleanInput));
  };

  const handleWriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCard || isFlipped) return;

    const targetAnswer = cleanHtml(isReverse ? currentCard.definition : currentCard.term);
    let isCorrect = false;

    if (currentCard.type === 'true_false' && !isReverse) {
      const cleanTarget = targetAnswer.toLowerCase().trim();
      const cleanInput = writeAnswer.toLowerCase().trim();
      if (cleanTarget.startsWith('true') && (cleanInput === 't' || cleanInput === 'true')) {
        isCorrect = true;
      } else if (cleanTarget.startsWith('false') && (cleanInput === 'f' || cleanInput === 'false')) {
        isCorrect = true;
      } else {
        isCorrect = checkFuzzyMatch(writeAnswer, targetAnswer);
      }
    } else {
      isCorrect = checkFuzzyMatch(writeAnswer, targetAnswer);
    }

    if (isCorrect) {
      setWriteFeedback('correct');
      setIsFlipped(true);
    } else {
      setWriteErrorAnimation(true);
      setTimeout(() => setWriteErrorAnimation(false), 400);
      setWriteFeedback('incorrect');
    }
  };

  // Active recall: MCQ Option Selection
  const handleSelectMcq = (opt: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard || selectedMcqIdx !== null) return;

    setSelectedMcqIdx(idx);
    const isCorrect = checkFuzzyMatch(opt, currentCard.definition);
    setMcqResult(isCorrect ? 'correct' : 'incorrect');

    // Auto-reveal after short moment for immediate feedback
    setTimeout(() => {
      setIsFlipped(true);
    }, 700);
  };

  // Active recall: True / False Button Selection
  const handleSelectTf = (val: 'true' | 'false', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard || selectedTf !== null) return;

    setSelectedTf(val);
    const defLower = (currentCard.definition || '').toLowerCase().trim();
    const isTargetTrue = defLower.startsWith('true');
    const isCorrect = (val === 'true' && isTargetTrue) || (val === 'false' && !isTargetTrue);
    setTfResult(isCorrect ? 'correct' : 'incorrect');

    setTimeout(() => {
      setIsFlipped(true);
    }, 700);
  };

  const handleStudyNext = useCallback((gotIt: boolean) => {
    if (!currentCard) return;

    // Update SRS schedule in localStorage
    if (studyFilter !== 'cram') {
      const sig = getCardSignature(currentCard);
      updateCardSRS(sig, gotIt ? 'correct' : 'incorrect');
      setSrsStats(getDeckSRSStats(activeCards));
    }

    setIsFlipped(false);
    resetCardInteractions();

    setTimeout(() => {
      if (gotIt) {
        setMasteredIds(prev => new Set(prev).add(currentCard.id));
        setDeck(prev => prev.slice(1));
      } else {
        // Move to back of deck for reinforcement
        setDeck(prev => [...prev.slice(1), prev[0]]);
      }
    }, 280);
  }, [currentCard, studyFilter, activeCards]);

  // Keyboard navigation shortcuts
  useWindowKeydown((e: KeyboardEvent) => {
    // Don't intercept if user is typing in an input or textarea
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }

    if (mode !== 'study' || !currentCard) return;

    if (e.code === 'Space') {
      e.preventDefault();
      handleStudyFlip();
    } else if (isFlipped) {
      if (e.key === 'ArrowLeft' || e.key === '1') {
        e.preventDefault();
        handleStudyNext(false);
      } else if (e.key === 'ArrowRight' || e.key === '2') {
        e.preventDefault();
        handleStudyNext(true);
      }
    } else if (!isFlipped && currentCard.type === 'mcq' && currentCard.options && !isReverse) {
      const key = e.key.toUpperCase();
      const letterIdx = ['A', 'B', 'C', 'D'].indexOf(key);
      const numberIdx = ['1', '2', '3', '4'].indexOf(key);
      const chosenIdx = letterIdx >= 0 ? letterIdx : numberIdx;
      if (chosenIdx >= 0 && chosenIdx < currentCard.options.length && selectedMcqIdx === null) {
        e.preventDefault();
        const opt = currentCard.options[chosenIdx];
        setSelectedMcqIdx(chosenIdx);
        const isCorrect = checkFuzzyMatch(opt, currentCard.definition);
        setMcqResult(isCorrect ? 'correct' : 'incorrect');
        setTimeout(() => setIsFlipped(true), 700);
      }
    }
  });

  const handleStartQuiz = () => {
    setQuizTerms([...activeCards]);
    const shuffledDefs = [...activeCards].sort(() => Math.random() - 0.5);
    setQuizDefs(shuffledDefs);
    setMatchedIds(new Set());
    setQuizMistakes(new Set());
    setMode('quiz');
  };

  // --- QUIZ LOGIC ---
  const handleQuizTermClick = (id: string) => {
    if (matchedIds.has(id)) return;
    setSelectedTermId(id);
    if (selectedDefId) checkMatch(id, selectedDefId);
  };

  const handleQuizDefClick = (id: string) => {
    if (matchedIds.has(id)) return;
    setSelectedDefId(id);
    if (selectedTermId) checkMatch(selectedTermId, id);
  };

  const checkMatch = (termId: string, defId: string) => {
    if (termId === defId) {
      setMatchedIds(prev => new Set(prev).add(termId));
      setSelectedTermId(null);
      setSelectedDefId(null);

      if (matchedIds.size + 1 === activeCards.length) {
        finishQuiz();
      }
    } else {
      setQuizMistakes(prev => new Set(prev).add(termId));
      setQuizError(`${termId}-${defId}`);

      setTimeout(() => {
        setQuizError(null);
        setSelectedTermId(null);
        setSelectedDefId(null);
      }, 500);
    }
  };

  const finishQuiz = async () => {
    setMode('report');
    setIsGeneratingReport(true);

    const missedTermTexts = activeCards
      .filter(f => quizMistakes.has(f.id))
      .map(f => f.term);

    try {
      const rep = await getFlashcardReport(currentCourse, currentTopic, missedTermTexts);
      const score = `${activeCards.length - quizMistakes.size}/${activeCards.length}`;
      const masteredTerms = activeCards
        .filter(f => !quizMistakes.has(f.id))
        .map(f => f.term);

      setReport({
        ...rep,
        score,
        masteredTerms
      });

      onFinish(activeCards.length - quizMistakes.size, activeCards.length);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // --- LOADING VIEW ---
  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme.light} flex flex-col items-center justify-center p-6 text-center`}>
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg w-full border border-slate-100">
          <div className={`w-24 h-24 border-4 ${theme.border} border-t-transparent rounded-full animate-spin mx-auto mb-8`}></div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Generating Flashcards</h2>
          <p className="text-slate-500 italic">Finding key terms for "{currentTopic}"...</p>
        </div>
      </div>
    );
  }

  // --- REPORT VIEW ---
  if (mode === 'report') {
    return (
      <div className={`min-h-screen ${theme.light} p-6 md:p-12 overflow-y-auto`}>
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
          <div className={`p-10 ${theme.bg} text-white text-center`}>
            <div className="text-6xl mb-4">
              {quizMistakes.size === 0 ? '🌟' : '📊'}
            </div>
            <h2 className="text-4xl font-black mb-2">Session Complete</h2>
            <p className="text-lg opacity-90">{currentTopic}</p>
          </div>

          {isGeneratingReport ? (
            <div className="p-20 text-center">
              <div className={`w-12 h-12 border-4 ${theme.border} border-t-transparent rounded-full animate-spin mx-auto mb-6`}></div>
              <p className="text-slate-500 font-bold">Analyzing your performance...</p>
            </div>
          ) : report ? (
            <div className="p-8 md:p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Score</div>
                  <div className={`text-4xl font-black ${theme.accent}`}>{report.score}</div>
                </div>
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                  <div className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Mastered</div>
                  <div className="text-4xl font-black text-emerald-600">{report.masteredTerms.length}</div>
                </div>
                <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                  <div className="text-xs font-black text-rose-400 uppercase tracking-widest mb-1">To Review</div>
                  <div className="text-4xl font-black text-rose-600">{report.missedTerms.length}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-2">AI Summary</h3>
                <p className="text-slate-600 italic leading-relaxed">"{report.summary}"</p>
              </div>

              {report.strategies.length > 0 && (
                <div>
                  <h3 className={`text-lg font-black ${theme.accent} uppercase tracking-widest mb-6`}>Recommended Strategies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.strategies.map((strat, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                        <div className={`w-8 h-8 rounded-full ${theme.bg} text-white flex items-center justify-center font-bold shrink-0`}>{i + 1}</div>
                        <p className="text-slate-600 font-medium text-sm leading-relaxed">{strat}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => { setMode('study'); setStudyFilter('all'); }}
                  className={`flex-1 py-4 rounded-2xl ${theme.bg} text-white font-bold hover:opacity-95 transition-all shadow-md`}
                >
                  Return to Flashcards
                </button>
                <button
                  onClick={() => onFinish()}
                  className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          ) : (
            <div className="p-20 text-center text-rose-500">Failed to load report.</div>
          )}
        </div>
      </div>
    );
  }

  // --- QUIZ VIEW ---
  if (mode === 'quiz') {
    return (
      <div className={`min-h-screen ${theme.light} p-4 md:p-8 flex flex-col`}>
        <header className="mb-8 flex justify-between items-center max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMode('study')}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
            >
              ← Back to Cards
            </button>
            <div>
              <h2 className={`text-2xl font-black ${theme.accent}`}>Matching Quiz</h2>
              <p className="text-slate-500 text-xs font-bold">Match key terms to their scientific definitions</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-slate-800">{matchedIds.size} <span className="text-slate-300">/</span> {activeCards.length}</div>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto w-full">
          {/* TERMS COLUMN */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Terms</h3>
            {quizTerms.map((card) => {
              const isMatched = matchedIds.has(card.id);
              const isSelected = selectedTermId === card.id;
              const isError = quizError?.startsWith(card.id);

              return (
                <button
                  key={card.id}
                  disabled={isMatched}
                  onClick={() => handleQuizTermClick(card.id)}
                  className={`w-full p-4 rounded-xl font-bold text-left transition-all duration-200 border-2 shadow-sm relative ${isMatched
                    ? 'hidden'
                    : isError
                      ? 'border-rose-400 bg-rose-50 text-rose-700 animate-shake'
                      : isSelected
                        ? `${theme.border} ${theme.light} ${theme.accent}`
                        : 'border-white bg-white text-slate-700 hover:border-slate-200'
                    }`}
                >
                  <MarkdownRenderer
                    content={cleanHtml(normalizeScientificNotation(card.term))}
                    components={INLINE_PARAGRAPHS}
                  />
                </button>
              );
            })}
          </div>

          {/* DEFINITIONS COLUMN */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Definitions</h3>
            {quizDefs.map((card) => {
              const isMatched = matchedIds.has(card.id);
              const isSelected = selectedDefId === card.id;
              const isError = quizError?.endsWith(card.id);

              return (
                <button
                  key={card.id}
                  disabled={isMatched}
                  onClick={() => handleQuizDefClick(card.id)}
                  className={`w-full p-4 rounded-xl text-sm font-medium text-left transition-all duration-200 border-2 shadow-sm ${isMatched
                    ? 'hidden'
                    : isError
                      ? 'border-rose-400 bg-rose-50 text-rose-700 animate-shake'
                      : isSelected
                        ? `${theme.border} ${theme.light} text-slate-900`
                        : 'border-white bg-white text-slate-600 hover:border-slate-200'
                    }`}
                >
                  <MarkdownRenderer
                    content={cleanHtml(normalizeScientificNotation(card.definition))}
                    components={INLINE_PARAGRAPHS}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          }
        `}</style>
      </div>
    );
  }

  // --- STUDY VIEW (Default) ---

  // Empty deck state (Completed study queue)
  if (deck.length === 0 && activeCards.length > 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/10 p-10 md:p-12 rounded-[3rem] max-w-lg w-full animate-in zoom-in duration-500 shadow-2xl">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-black text-white mb-3">Round Completed!</h2>
          <p className="text-slate-300 text-sm md:text-base mb-6">
            {studyFilter === 'due'
              ? "All due SRS cards reviewed for this cycle! Keep up the daily streak."
              : "You've cycled through all terms in this study set."}
          </p>

          <div className="mb-8">
            <LeitnerBoxBar stats={srsStats} className="bg-slate-800/90 border-slate-700" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleStartQuiz}
              className={`w-full ${theme.bg} text-white font-bold text-base py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-emerald-500/20`}
            >
              Start Matching Quiz
            </button>

            <button
              onClick={() => {
                setStudyFilter('all');
                setDeck([...activeCards]);
                setMasteredIds(new Set());
              }}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl transition-colors"
            >
              Review All Cards Again
            </button>

            <button
              onClick={() => onFinish()}
              className="w-full py-2.5 bg-transparent text-slate-400 font-bold text-xs hover:text-white transition-colors"
            >
              Back to Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  const progress = activeCards.length > 0 ? Math.round((masteredIds.size / activeCards.length) * 100) : 0;
  const frontText = isReverse ? currentCard.definition : currentCard.term;
  const backText = isReverse ? currentCard.term : currentCard.definition;
  const currentCardSRS = getCardSRS(getCardSignature(currentCard));

  return (
    <div className={`min-h-screen ${theme.light} flex flex-col overflow-y-auto`}>
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-black shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <span>✨</span>
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onQuit || (() => onFinish())}
            className="text-slate-400 hover:text-rose-500 transition-colors p-2 -ml-2 rounded-full hover:bg-slate-50"
            title="Quit Flashcards"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                {currentTopic}
              </h2>
              {activeSavedDeck && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Saved Deck
                </span>
              )}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{currentCourse}</p>
          </div>
        </div>

        {/* Study Mode Filter Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold order-3 md:order-2">
          <button
            onClick={() => setStudyFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${studyFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            All ({activeCards.length})
          </button>
          <button
            onClick={() => setStudyFilter('due')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${studyFilter === 'due' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            title="Cards scheduled for review based on spaced repetition intervals"
          >
            <span>SRS Due</span>
            {srsStats.dueCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-black">
                {srsStats.dueCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setStudyFilter('cram')}
            className={`px-3 py-1.5 rounded-lg transition-all ${studyFilter === 'cram' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            title="Cram without advancing SRS intervals"
          >
            ⚡ Cram
          </button>
          <button
            onClick={handleStartQuiz}
            className="px-3 py-1.5 rounded-lg transition-all text-emerald-700 hover:bg-white/80"
            title="Match terms with definitions"
          >
            🎮 Match
          </button>
        </div>

        {/* Right Actions Tray */}
        <div className="flex items-center gap-2 sm:gap-3 order-2 md:order-3">
          {/* Save Deck Button */}
          <button
            onClick={handleSaveDeck}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Save this deck locally to review later"
          >
            <span>💾</span>
            <span className="hidden sm:inline">Save Deck</span>
          </button>

          {/* Library Modal Opener */}
          <button
            onClick={() => setIsSavedDecksOpen(true)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-600 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Open saved flashcard decks library"
          >
            <span>📚</span>
            <span className="hidden sm:inline">Library</span>
          </button>

          {/* Print Button */}
          <button
            onClick={() => handlePrint && handlePrint()}
            className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl transition-colors hover:border-indigo-200"
            title="Print printable flashcard sheet"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            <span>Print</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="text-slate-400 hover:text-indigo-500 p-1.5 transition-colors"
            title="Share Link"
          >
            {linkCopied ? (
              <span className="text-xs font-bold text-emerald-500 animate-pulse">Copied!</span>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            )}
          </button>

          {/* Reverse / Write Toggles */}
          <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <label className="flex items-center gap-1.5 cursor-pointer group" title="Reverse Sides">
              <input type="checkbox" className="sr-only peer" checked={isReverse} onChange={(e) => setIsReverse(e.target.checked)} />
              <div className="w-7 h-3.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-indigo-500 relative"></div>
              <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-600 hidden sm:inline">Rev</span>
            </label>
            <div className="w-px h-3 bg-slate-300"></div>
            <label className="flex items-center gap-1.5 cursor-pointer group" title="Active Write Mode">
              <input type="checkbox" className="sr-only peer" checked={isWriteMode} onChange={(e) => { setIsWriteMode(e.target.checked); setIsFlipped(false); setWriteAnswer(''); setWriteFeedback('none'); }} />
              <div className="w-7 h-3.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-indigo-500 relative"></div>
              <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-600 hidden sm:inline">Write</span>
            </label>
          </div>

          {/* Queue Count */}
          <div className="text-right pl-1">
            <span className={`text-xl font-black ${theme.accent}`}>{masteredIds.size}</span>
            <span className="text-slate-300 font-bold mx-1">/</span>
            <span className="text-slate-400 font-bold text-sm">{deck.length + masteredIds.size}</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-200">
        <div className={`h-full ${theme.bg} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
      </div>

      {/* Leitner Box Progress HUD */}
      <div className="pt-4 px-4 sm:px-6">
        <LeitnerBoxBar stats={srsStats} />
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 relative perspective-1000">

        {/* The Card */}
        <div
          onClick={handleStudyFlip}
          className={`relative w-full max-w-2xl min-h-[440px] md:min-h-[480px] aspect-[4/3] md:aspect-[16/11] ${isWriteMode && !isFlipped ? 'cursor-default' : 'cursor-pointer'} transition-transform duration-500 transform-style-3d group ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col p-6 md:p-8 text-center hover:shadow-xl transition-shadow overflow-y-auto overscroll-contain">
            {/* Header row */}
            <div className="flex items-center justify-between w-full mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {isReverse
                    ? 'Definition'
                    : (currentCard.type === 'image_occlusion'
                      ? 'Image Occlusion'
                      : currentCard.type === 'mcq'
                        ? 'Question (MCQ)'
                        : currentCard.type === 'true_false'
                          ? 'Statement (T/F)'
                          : currentCard.type === 'cloze'
                            ? 'Fill-in-the-Blank (Cloze)'
                            : currentCard.type === 'multi_step'
                              ? 'Sequential Pathway (Multi-Step)'
                              : 'Term')}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  Box {currentCardSRS.box}
                </span>
              </div>
              <div onClick={e => e.stopPropagation()} className="shrink-0">
                <StudentTools text={frontText} />
              </div>
            </div>

            {/* Vertically centered scrollable content container */}
            <div className="my-auto w-full flex flex-col items-center py-2">
              {/* IMAGE OCCLUSION CARD TYPE */}
              {!isReverse && currentCard.type === 'image_occlusion' ? (
                <ImageOcclusionCardContent
                  card={currentCard}
                  isFlipped={isFlipped}
                  onCorrect={() => {
                    setTimeout(() => setIsFlipped(true), 600);
                  }}
                />
              ) : !isReverse && currentCard.type === 'cloze' ? (
                <ClozeCardContent
                  sentence={currentCard.term}
                  answer={currentCard.definition}
                  isFlipped={isFlipped}
                  onCorrect={() => {
                    setTimeout(() => setIsFlipped(true), 600);
                  }}
                />
              ) : !isReverse && currentCard.type === 'multi_step' ? (
                <MultiStepCardContent
                  card={currentCard}
                  isFlipped={isFlipped}
                  onComplete={() => {
                    setTimeout(() => setIsFlipped(true), 600);
                  }}
                />
              ) : (
                <div className={`${getCardTextSize(frontText, !isReverse && currentCard.type === 'mcq')} text-slate-800 w-full`}>
                  <MarkdownRenderer
                    content={cleanHtml(normalizeScientificNotation(frontText))}
                    components={isReverse ? SPACED_PARAGRAPHS : INLINE_PARAGRAPHS}
                  />
                </div>
              )}

              {/* MCQ CARD OPTIONS (Active Recall on Front) */}
              {!isReverse && currentCard.type === 'mcq' && currentCard.options && (
                <div className="mt-6 flex flex-col gap-2.5 text-left w-full max-w-lg">
                  {currentCard.options.map((opt, i) => {
                    const isSelected = selectedMcqIdx === i;
                    const isTarget = checkFuzzyMatch(opt, currentCard.definition);
                    let btnStyle = 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/70 hover:border-slate-300';

                    if (selectedMcqIdx !== null) {
                      if (isTarget) {
                        btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-50 border-rose-400 text-rose-800 shadow-sm';
                      } else {
                        btnStyle = 'opacity-50 bg-slate-50 border-slate-200';
                      }
                    }

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => handleSelectMcq(opt, i, e)}
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 text-sm md:text-base font-medium transition-all text-left ${btnStyle}`}
                      >
                        <span className={`font-bold shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                          selectedMcqIdx !== null && isTarget
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : selectedMcqIdx === i
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <MarkdownRenderer
                            content={cleanHtml(normalizeScientificNotation(opt))}
                            components={INLINE_PARAGRAPHS}
                          />
                        </div>
                      </button>
                    );
                  })}
                  {mcqResult && (
                    <div className="text-center text-xs font-bold mt-1 animate-in fade-in">
                      {mcqResult === 'correct' ? (
                        <span className="text-emerald-600">✓ Correct choice! Flipping to explanation...</span>
                      ) : (
                        <span className="text-rose-600">Review the correct option above, then tap to see reasoning.</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TRUE / FALSE SELECTION (Active Recall on Front) */}
              {!isReverse && currentCard.type === 'true_false' && (
                <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-xs" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-4 w-full">
                    <button
                      type="button"
                      onClick={(e) => handleSelectTf('true', e)}
                      className={`flex-1 py-3 px-4 rounded-2xl border-2 font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                        selectedTf === 'true'
                          ? tfResult === 'correct'
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20'
                            : 'bg-rose-500 text-white border-rose-500 shadow-rose-500/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>✅</span> True
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSelectTf('false', e)}
                      className={`flex-1 py-3 px-4 rounded-2xl border-2 font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                        selectedTf === 'false'
                          ? tfResult === 'correct'
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20'
                            : 'bg-rose-500 text-white border-rose-500 shadow-rose-500/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>❌</span> False
                    </button>
                  </div>
                  {tfResult && (
                    <p className={`text-xs font-bold animate-in fade-in ${tfResult === 'correct' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tfResult === 'correct' ? 'Spot on! Revealing reasoning...' : 'Incorrect — flipping to rationale.'}
                    </p>
                  )}
                </div>
              )}

              {/* WRITE MODE INPUT */}
              {isWriteMode && !isFlipped && (
                <form onSubmit={handleWriteSubmit} className="w-full mt-6 max-w-md mx-auto relative z-10" onClick={e => e.stopPropagation()}>
                  <input aria-label={isReverse ? 'Type the term' : 'Type the definition'}
                    type="text"
                    value={writeAnswer}
                    onChange={(e) => setWriteAnswer(e.target.value)}
                    placeholder={`Type the ${isReverse ? 'term' : 'definition'} here...`}
                    className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl text-lg outline-none transition-colors ${writeErrorAnimation ? 'border-rose-400 bg-rose-50 animate-shake' : 'border-slate-200 focus:border-indigo-400 focus:bg-white'}`}
                    autoFocus
                  />
                  <button type="submit" className="hidden">Submit</button>
                  {writeFeedback === 'incorrect' && <p className="text-rose-500 text-xs font-bold mt-2 animate-in fade-in">Not quite right, try again!</p>}
                </form>
              )}

              {!isWriteMode && currentCard.type !== 'multi_step' && (
                <p className="mt-6 text-slate-400 text-xs font-bold animate-pulse shrink-0">
                  Tap or press Space to flip
                </p>
              )}
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col p-6 md:p-8 text-center overflow-y-auto overscroll-contain">
            {/* Header row */}
            <div className="flex items-center justify-between w-full mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-80 ${theme.accent}`}>
                  {isReverse ? 'Term' : (currentCard.type === 'image_occlusion' ? 'Occluded Target & Anatomy' : (currentCard.type === 'mcq' || currentCard.type === 'true_false' ? 'Correct Answer & Explanation' : currentCard.type === 'multi_step' ? 'Complete Pathway Summary' : 'Definition'))}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-700 text-slate-300">
                  Box {currentCardSRS.box} ({currentCardSRS.intervalDays}d)
                </span>
              </div>
              <div onClick={e => e.stopPropagation()} className="shrink-0">
                <StudentTools text={backText} className="text-white/50 hover:text-white" />
              </div>
            </div>

            {/* Vertically centered scrollable content container */}
            <div className="my-auto w-full flex flex-col items-center py-2">
              <div className={`${getCardTextSize(backText, isReverse && currentCard.type === 'mcq')} text-white w-full`}>
                <MarkdownRenderer
                  content={cleanHtml(normalizeScientificNotation(backText))}
                  components={!isReverse ? SPACED_PARAGRAPHS : INLINE_PARAGRAPHS}
                />
              </div>

              {/* Context Callout */}
              {currentCard.context && !isReverse && (
                <div className="bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl mt-5 max-w-lg">
                  <div className="text-xs md:text-sm text-slate-300 italic">
                    <MarkdownRenderer
                      content={cleanHtml(normalizeScientificNotation(currentCard.context))}
                      components={INLINE_PARAGRAPHS}
                    />
                  </div>
                </div>
              )}

              <p className="mt-6 text-slate-400 text-xs font-bold shrink-0">Tap or press Space to flip back</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={`mt-6 md:mt-8 flex gap-6 w-full max-w-sm transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <button
            onClick={(e) => { e.stopPropagation(); handleStudyNext(false); }}
            className="flex-1 bg-white border border-slate-200 text-slate-600 p-4 rounded-2xl font-bold shadow-sm hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all flex flex-col items-center gap-1 group"
          >
            <svg className="w-6 h-6 group-hover:-rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            <span className="text-[10px] uppercase tracking-widest">Study Again (←)</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleStudyNext(true); }}
            className={`flex-1 ${theme.bg} text-white p-4 rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all flex flex-col items-center gap-1 group`}
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span className="text-[10px] uppercase tracking-widest opacity-90">Got It (→)</span>
          </button>
        </div>

        {/* Keyboard Shortcut Helper Chip */}
        <div className="mt-4 text-[11px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:flex items-center gap-3">
          <span><kbd className="px-1.5 py-0.5 bg-slate-200/80 rounded border border-slate-300 text-[10px]">Space</kbd> Flip</span>
          <span>•</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-200/80 rounded border border-slate-300 text-[10px]">←</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-200/80 rounded border border-slate-300 text-[10px]">1</kbd> Study Again</span>
          <span>•</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-200/80 rounded border border-slate-300 text-[10px]">→</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-200/80 rounded border border-slate-300 text-[10px]">2</kbd> Got It</span>
        </div>

      </div>

      {/* Saved Decks Modal */}
      <SavedDecksModal
        isOpen={isSavedDecksOpen}
        onClose={() => setIsSavedDecksOpen(false)}
        onLoadDeck={handleLoadSavedDeck}
        currentDeck={activeSavedDeck}
      />

      {/* PRINT VIEW (Hidden) */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="p-8 bg-white text-slate-900">
          <div className="mb-6 text-center border-b pb-4">
            <h1 className="text-2xl font-bold">{currentTopic}</h1>
            <p className="text-sm text-slate-500">{currentCourse} • {activeCards.length} Cards</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {activeCards.map((card, i) => (
              <div key={i} className="border-2 border-slate-300 rounded-xl p-6 min-h-[200px] flex flex-col justify-between break-inside-avoid">
                <div className="border-b border-slate-100 pb-2 mb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Term</span>
                  <div className="font-bold text-xl">
                    <MarkdownRenderer
                      content={cleanHtml(normalizeScientificNotation(card.term))}
                      components={INLINE_PARAGRAPHS}
                    />
                    {card.type === 'mcq' && card.options && (
                      <div className="mt-3 text-sm font-normal text-slate-600 flex flex-col gap-1.5">
                        {card.options.map((o, j) => (
                          <div key={j} className="flex gap-2">
                            <span className="font-bold text-indigo-600">{String.fromCharCode(65 + j)}.</span>
                            <div>
                              <MarkdownRenderer
                                content={cleanHtml(normalizeScientificNotation(o))}
                                components={INLINE_PARAGRAPHS}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {card.type === 'true_false' && (
                      <div className="mt-3 text-[10px] font-bold text-slate-500 bg-slate-100 uppercase tracking-widest px-2 py-0.5 rounded-full w-max">True or False?</div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Definition</span>
                  <div className="text-sm leading-relaxed">
                    <MarkdownRenderer
                      content={cleanHtml(normalizeScientificNotation(card.definition))}
                      components={INLINE_PARAGRAPHS}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center text-[10px] text-slate-400">
            Generated by SciencePracticeApp
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardView;
