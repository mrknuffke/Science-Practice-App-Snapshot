import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Loader2, Trash2, HelpCircle, GraduationCap, BookOpen, Target, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CourseEntry } from '../constants/apCourses';
import { 
  getApTutorSystemInstruction, 
  getApMCQSet, 
  getApFRQ, 
  gradeApFRQ,
  type ApMCQ,
  type ApFRQ,
  type ApFRQGrade
} from '../services/ai/apReview';
import { CourseType } from '../types';
import { callAI, DEFAULT_MODEL } from '../services/ai/core';
import { ScienceBuddyMascot } from './ScienceBuddyMascot';
import MarkdownRenderer from './MarkdownRenderer';
import { FactualAccuracyIndicator } from './FactualAccuracyIndicator';
import SEO from './SEO';
import { getCarryOverGreeting } from '../services/ai/tutor';

interface APReviewTutorViewProps {
  course: CourseEntry;
  examParam: string | null;
  username: string;
  mascot: 'robot' | 'beaker' | 'plant' | 'gerbil';
  onBack: () => void;
  onStartFreshSession?: () => void;
}

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
};

interface ContextData {
  mode: string;
  alignmentScore: number;
  alignmentNote: string;
  currentObjective: string;
  currentUnit: string;
}

type BreakoutMode = 'none' | 'mcq' | 'frq';

/** The settings the tutor writes into its [mcq] or [frq] tag. Parsed from model text, so every field may be missing. */
interface BreakoutConfig {
  unit?: string;
  format?: 'independent' | 'passage';
  topic?: string;
}

export const APReviewTutorView: React.FC<APReviewTutorViewProps> = ({
  course,
  examParam,
  username,
  mascot,
  onBack,
  onStartFreshSession,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Pedagogical score states
  const [contextData, setContextData] = useState<ContextData>({
    mode: 'Socratic',
    alignmentScore: 10,
    alignmentNote: 'Tutor initialized and ready.',
    currentObjective: 'Introductory assessment',
    currentUnit: 'Unit 1: Foundations',
  });

  // Breakout modes
  const [breakoutMode, setBreakoutMode] = useState<BreakoutMode>('none');
  const [_pendingBreakout, setPendingBreakout] = useState<BreakoutMode>('none');
  const [activeConfig, setActiveConfig] = useState<BreakoutConfig | null>(null);

  // MCQ Breakout State
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqQuestions, setMcqQuestions] = useState<ApMCQ[]>([]);
  const [mcqStimulus, setMcqStimulus] = useState<string>('');
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, string>>({});
  const [mcqReviewed, setMcqReviewed] = useState<Record<number, boolean>>({});

  // FRQ Breakout State
  const [frqLoading, setFrqLoading] = useState(false);
  const [frqData, setFrqData] = useState<ApFRQ | null>(null);
  const [frqAnswers, setFrqAnswers] = useState<Record<string, string>>({});
  const [frqGrading, setFrqGrading] = useState(false);
  const [frqResults, setFrqResults] = useState<ApFRQGrade | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const _dripBufferRef = useRef('');
  const dripIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasGreetingFired = useRef(false);

  const isIB = course.displayName.startsWith('IB ');
  const examLabel = isIB ? 'IB' : 'AP';
  const frqTerm = isIB ? 'Constructed Response Question (CRQ)' : 'FRQ';

  let courseName = course.displayName;
  if (course.isPhysicsC) courseName = `AP Physics C: ${examParam === 'em' ? 'E&M' : 'Mechanics'}`;
  if (course.isCalcABBC) courseName = `AP Calculus ${examParam?.toUpperCase() || 'AB/BC'}`;

  const storageKey = `sp_ap_tutor_${course.slug}_${examParam || 'default'}`;

  // Load chat history or trigger greeting
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          hasGreetingFired.current = true;
          return;
        }
      } catch (e) {
        console.error("Error loading chat history", e);
      }
    }
    if (!hasGreetingFired.current) {
      hasGreetingFired.current = true;
      triggerGreeting();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- greet once per course (storageKey); triggerGreeting is rebuilt each render and must not re-fire it.
  }, [storageKey]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isStreaming]);

  // Trigger Socratic opening greeting
  const triggerGreeting = async () => {
    setIsLoading(true);
    try {
      const sysInstruction = await getApTutorSystemInstruction(course, examParam, false, 1);
      const greetingPrompt = course.subjectArea === 'language'
        ? `Hello! Please greet the student named ${username} warmly. Since this is a World Language course, please ask them whether they would like to proceed in English or in the target language before offering the standard study modes. Also briefly mention that you can generate speaking practice prompts for oral assessment.`
        : `Hello! Please greet the student named ${username} warmly and introduce yourself as their ${examLabel} Socratic study companion. In your opening message, explicitly let them know that beyond answering questions, you can also generate: (1) MCQ practice sets, and (2) ${frqTerm} simulations. Encourage them to ask you to start any of these when they are ready.`;

      const contents = [{ role: 'user', parts: [{ text: greetingPrompt }] }];
      const response = await callAI(DEFAULT_MODEL, contents, { systemInstruction: sysInstruction });
      
      const text = response.text || '';
      processAssistantStream(text);
    } catch (e) {
      console.error(e);
      setMessages([{
        id: '1',
        role: 'model',
        content: `Hello ${username}! I am your Socratic Study Partner for ${courseName}. Let's get started review catalog topics together. What are you currently working on?`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Typewriter style dripper stream builder
  const processAssistantStream = (rawText: string) => {
    // 1. Extract context metadata block
    const contextMatch = rawText.match(/:::context\s*(\{.*?\})\s*:::/);
    if (contextMatch) {
      try {
        const parsed = JSON.parse(contextMatch[1]);
        setContextData(parsed);
      } catch (e) { /* malformed context metadata, ignore */ }
    }

    // 2. Detect breakout trigger tags
    const mcqMatch = rawText.match(/:::mcq\s*(\{.*?\})\s*:::/);
    const frqMatch = rawText.match(/:::frq\s*(\{.*?\})\s*:::/);

    if (mcqMatch) {
      try { setActiveConfig(JSON.parse(mcqMatch[1])); } catch (e) { /* malformed mcq metadata, ignore */ }
      setPendingBreakout('mcq');
    } else if (frqMatch) {
      try { setActiveConfig(JSON.parse(frqMatch[1])); } catch (e) { /* malformed frq metadata, ignore */ }
      setPendingBreakout('frq');
    }

    // 3. Clean and filter metadata tags out of raw text
    const cleanText = rawText
      .replace(/\n?:::(?:mcq|frq|context)\s*\{.*?\}\s*:::/g, "")
      .replace(/\n?:::context\s*\{[^}]*\}\s*:::/g, "")
      .trim();

    // 4. Smooth visual reveal dripper
    if (dripIntervalRef.current) clearInterval(dripIntervalRef.current);
    
    let currentRevealText = "";
    let idx = 0;
    
    setIsStreaming(true);
    
    const newMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: newMsgId, role: 'model', content: "" }]);

    dripIntervalRef.current = setInterval(() => {
      if (idx >= cleanText.length) {
        if (dripIntervalRef.current) clearInterval(dripIntervalRef.current);
        dripIntervalRef.current = null;
        setIsStreaming(false);
        
        // If a breakout is pending, confirm and transition
        if (mcqMatch) {
          setBreakoutMode('mcq');
          triggerMcqBreakout(JSON.parse(mcqMatch[1]));
        } else if (frqMatch) {
          setBreakoutMode('frq');
          triggerFrqBreakout(JSON.parse(frqMatch[1]));
        }
        return;
      }
      
      const step = Math.min(4, cleanText.length - idx);
      currentRevealText += cleanText.slice(idx, idx + step);
      idx += step;

      setMessages(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.role === 'model') {
          last.content = currentRevealText;
        }
        return copy;
      });
    }, 15);
  };

  // Submit standard Socratic message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || isStreaming) return;

    const userText = input.trim();
    setInput('');

    const newMsgs: Message[] = [...messages, { id: Date.now().toString(), role: 'user', content: userText }];
    setMessages(newMsgs);
    setIsLoading(true);

    try {
      const sysInstruction = await getApTutorSystemInstruction(course, examParam, false, 1);
      
      // Map structures to Gemini API format
      const contents = newMsgs.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await callAI(DEFAULT_MODEL, contents, { systemInstruction: sysInstruction });
      const text = response.text || '';
      
      setIsLoading(false);
      processAssistantStream(text);

      // Persist to local memory
      setTimeout(() => {
        localStorage.setItem(storageKey, JSON.stringify([...newMsgs, { id: Date.now().toString(), role: 'model', content: text }]));
      }, 500);

    } catch (e) {
      console.error(e);
      setIsLoading(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: "I ran into a connection glitch. Let's try that again. What topic in the CED were we studying?"
      }]);
    }
  };

  // Breakout: Trigger MCQ Quiz Mode
  const triggerMcqBreakout = async (config: BreakoutConfig) => {
    setMcqLoading(true);
    setMcqQuestions([]);
    setMcqStimulus('');
    setMcqIndex(0);
    setMcqAnswers({});
    setMcqReviewed({});

    try {
      const data = await getApMCQSet(course, examParam, config.unit || 'General', config.format || 'independent');
      if (Array.isArray(data)) {
        setMcqQuestions(data);
      } else {
        setMcqStimulus(data.stimulus || '');
        setMcqQuestions(data.questions || []);
      }
    } catch (e) {
      console.error(e);
      setBreakoutMode('none');
    } finally {
      setMcqLoading(false);
    }
  };

  // Breakout: MCQ Option Select
  const handleMcqSelect = (option: string) => {
    if (mcqReviewed[mcqIndex]) return;
    setMcqAnswers(prev => ({ ...prev, [mcqIndex]: option }));
    setMcqReviewed(prev => ({ ...prev, [mcqIndex]: true }));
  };

  // Breakout: Return MCQ results to Tutor Chat
  const handleCompleteMcq = async () => {
    setBreakoutMode('none');
    
    // Build the score summary for the chatbot
    const score = mcqQuestions.reduce((acc, q, i) => acc + (mcqAnswers[i] === q.correctAnswer ? 1 : 0), 0);
    const summary = `Completed MCQ Practice on Unit ${activeConfig?.unit || 'CED Scope'}. Score: ${score}/${mcqQuestions.length} (${Math.round((score / mcqQuestions.length) * 100)}%).\n\nI reviewed my answers Socratic-style. Please continue coaching me!`;
    
    // Add to chat history and send to AI
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: summary };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    
    setIsLoading(true);
    try {
      const sysInstruction = await getApTutorSystemInstruction(course, examParam, false, 1);
      const contents = nextMsgs.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      const response = await callAI(DEFAULT_MODEL, contents, { systemInstruction: sysInstruction });
      setIsLoading(false);
      processAssistantStream(response.text);
    } catch (e) {
      setIsLoading(false);
    }
  };

  // Breakout: Trigger FRQ Simulator Mode
  const triggerFrqBreakout = async (config: BreakoutConfig) => {
    setFrqLoading(true);
    setFrqData(null);
    setFrqAnswers({});
    setFrqResults(null);

    try {
      const data = await getApFRQ(course, examParam, config.topic || 'General standard');
      setFrqData(data);
    } catch (e) {
      console.error(e);
      setBreakoutMode('none');
    } finally {
      setFrqLoading(false);
    }
  };

  // Breakout: Submit FRQ for Grading
  const handleSubmitFrq = async () => {
    if (!frqData || frqGrading) return;
    setFrqGrading(true);

    try {
      const answersPayload = frqData.parts.map(p => ({
        letter: p.letter,
        answer: frqAnswers[p.letter] || "",
        attachment: null
      }));

      const results = await gradeApFRQ(courseName, frqData.parts, answersPayload);
      setFrqResults(results);
    } catch (e) {
      console.error("Error grading FRQ", e);
    } finally {
      setFrqGrading(false);
    }
  };

  // Breakout: Return FRQ results to Tutor Chat
  const handleCompleteFrq = async () => {
    setBreakoutMode('none');
    if (!frqResults) return;

    const summary = `Completed FRQ practice session on topic: "${activeConfig?.topic || 'CED standard'}". Score: ${frqResults.totalPoints}/${frqResults.maxPoints}.\n\nRubric Feedback summary:\n${frqResults.overallSummary}\n\nLet's continue studying!`;
    
    // Add to chat history and send to AI
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: summary };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    
    setIsLoading(true);
    try {
      const sysInstruction = await getApTutorSystemInstruction(course, examParam, false, 1);
      const contents = nextMsgs.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      const response = await callAI(DEFAULT_MODEL, contents, { systemInstruction: sysInstruction });
      setIsLoading(false);
      processAssistantStream(response.text);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to flush study history for this tutor? This cannot be undone.")) {
      localStorage.removeItem(storageKey);
      setMessages([]);
      hasGreetingFired.current = true;
      triggerGreeting();
    }
  };

  const handleCarryOverSession = async () => {
    setIsLoading(true);
    try {
      const chatHistoryForAI = messages.map(m => ({
        role: m.role,
        text: m.content
      }));

      const carryOverGreeting = await getCarryOverGreeting(
        course.displayName as CourseType,
        contextData.currentObjective || courseName,
        chatHistoryForAI,
        'explanation'
      );

      const freshMessages = [{
        id: Date.now().toString(),
        role: 'model' as const,
        content: carryOverGreeting
      }];

      setMessages(freshMessages);
      localStorage.setItem(storageKey, JSON.stringify(freshMessages));
    } catch (e) {
      console.error("Error during carry over", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-[#15171C] animate-in fade-in duration-500 text-left shadow-lg">
      <SEO title={`${examLabel} Study Buddy: ${courseName}`} />
      
      {/* 1. MAIN TUTOR CHAT & BREAKOUT OVERLAY AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/[0.4] dark:bg-slate-900/[0.1] relative">
        
        {/* Tutor Top Banner */}
        <header className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#15171C] flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-[#818CF8] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Return to list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-3xl select-none">{course.emoji}</span>
              <div>
                <h2 className="text-base font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded leading-none">{courseName}</h2>
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-1 font-rounded">Official Socratic Study Partner</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FactualAccuracyIndicator
              course={course.displayName as CourseType}
              topic={contextData.currentObjective || courseName}
              turnCount={Math.round(messages.length / 2)}
              onStartFreshSession={onStartFreshSession || handleCarryOverSession}
            />
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 transition-colors"
              title="Reset Chat History"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-xl border transition-colors ${sidebarOpen ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-750 text-slate-400'}`}
              title="Toggle Scorecard Sidebar"
            >
              <GraduationCap className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Dynamic Breakout Modality Overlay */}
        {breakoutMode !== 'none' ? (
          <div className="absolute inset-0 bg-white dark:bg-[#15171C] z-30 flex flex-col animate-in fade-in duration-300">
            
            {/* MCQ Breakout screen */}
            {breakoutMode === 'mcq' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {mcqLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 font-rounded">Building Stimulus-Based MCQ set...</p>
                  </div>
                ) : mcqQuestions.length > 0 ? (
                  <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                    
                    {/* Left side stimulus */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                      <div className="max-w-prose space-y-4 text-[#1A1C21] dark:text-[#F8F9FB]">
                        <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Passage / Data Stimulus</span>
                        <h3 className="text-lg font-black font-rounded">Experimental Design Context</h3>
                        <div className="prose dark:prose-invert max-w-none prose-sm">
                          <MarkdownRenderer content={mcqStimulus || mcqQuestions[mcqIndex]?.stimulus || "Read the question scenario carefully to analyze options."} />
                        </div>
                      </div>
                    </div>

                    {/* Right side quiz controller */}
                    <div className="w-full md:w-[480px] p-6 md:p-10 flex flex-col justify-between shrink-0 overflow-y-auto custom-scrollbar">
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question {mcqIndex + 1} of {mcqQuestions.length}</span>
                          <div className="flex gap-1">
                            {mcqQuestions.map((_, i) => (
                              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === mcqIndex ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] leading-snug font-rounded">
                            <MarkdownRenderer content={mcqQuestions[mcqIndex]?.question || ""} />
                          </div>

                          <div className="space-y-3.5 mt-6">
                            {(['A', 'B', 'C', 'D'] as const).map(letter => {
                              const optionText = mcqQuestions[mcqIndex]?.options?.[letter] || '';
                              const isSelected = mcqAnswers[mcqIndex] === letter;
                              const isCorrect = letter === mcqQuestions[mcqIndex]?.correctAnswer;
                              const reviewed = mcqReviewed[mcqIndex];

                              let btnStyle = "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850";
                              if (reviewed) {
                                if (isCorrect) {
                                  btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400";
                                } else if (isSelected) {
                                  btnStyle = "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400";
                                }
                              } else if (isSelected) {
                                btnStyle = "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400";
                              }

                              return (
                                <button
                                  key={letter}
                                  onClick={() => handleMcqSelect(letter)}
                                  disabled={reviewed}
                                  className={`w-full text-left p-4 rounded-2xl border text-xs font-bold leading-normal transition-all flex items-start gap-3 ${btnStyle}`}
                                >
                                  <span className="font-black font-rounded">{letter}.</span>
                                  <div className="flex-1 min-w-0">
                                    <MarkdownRenderer content={optionText} />
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Reviewed explanation card */}
                          {mcqReviewed[mcqIndex] && (
                            <div className="mt-4 p-4 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10 text-xs text-slate-500 dark:text-slate-400 leading-normal animate-in fade-in duration-300">
                              <span className="font-black text-indigo-500 uppercase tracking-wider block mb-1">AI Grader Explanation</span>
                              <MarkdownRenderer content={mcqQuestions[mcqIndex]?.explanation || ""} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-8 flex gap-3">
                        <button
                          onClick={() => setMcqIndex(prev => Math.max(0, prev - 1))}
                          disabled={mcqIndex === 0}
                          className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-xl text-xs font-black disabled:opacity-30"
                        >
                          Previous
                        </button>
                        {mcqIndex < mcqQuestions.length - 1 ? (
                          <button
                            onClick={() => setMcqIndex(prev => prev + 1)}
                            className="flex-1 bg-indigo-600 dark:bg-[#818CF8] text-white dark:text-slate-900 px-4 py-3.5 rounded-xl text-xs font-black hover:opacity-90 shadow-md"
                          >
                            Next Question
                          </button>
                        ) : (
                          <button
                            onClick={handleCompleteMcq}
                            className="flex-1 bg-indigo-600 dark:bg-[#818CF8] text-white dark:text-slate-900 px-4 py-3.5 rounded-xl text-xs font-black hover:opacity-90 shadow-md flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-4 h-4" /> Return to Chat
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-xs text-slate-400">Failed to construct MCQs. Close and try again.</p>
                    <button onClick={() => setBreakoutMode('none')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black">Close</button>
                  </div>
                )}
              </div>
            )}

            {/* FRQ Breakout screen */}
            {breakoutMode === 'frq' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {frqLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 font-rounded">Constructing Free Response simulation...</p>
                  </div>
                ) : frqData ? (
                  frqResults ? (
                    /* Display FRQ grading scorecard results */
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-3xl mx-auto space-y-8 custom-scrollbar">
                      <div>
                        <h2 className="text-3xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded leading-none">FRQ Score: {frqResults.totalPoints}/{frqResults.maxPoints}</h2>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{frqResults.overallSummary}</p>
                      </div>

                      <div className="space-y-4">
                        {frqResults.parts.map(p => {
                          const originalPart = frqData?.parts.find(fp => fp.letter === p.letter);
                          const isFullPoints = p.pointsEarned === originalPart?.points;
                          
                          return (
                            <div key={p.letter} className="bento-card border border-slate-100 dark:border-slate-800 p-5 space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Part ({p.letter})</h4>
                                <span className={`text-xs font-black ${isFullPoints ? 'text-emerald-500' : 'text-amber-500'}`}>
                                  {p.pointsEarned} / {originalPart?.points || 1} Pts
                                </span>
                              </div>
                              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-400 leading-normal">
                                <MarkdownRenderer content={originalPart?.question || ''} />
                              </div>
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Your Answer:</span>
                                <p className="text-xs text-[#1A1C21] dark:text-[#F8F9FB] bg-slate-50/[0.3] dark:bg-slate-900/[0.2] p-3 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">{frqAnswers[p.letter] || "(none)"}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide block">Grader Feedback:</span>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{p.feedback}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={handleCompleteFrq}
                        className="w-full bg-indigo-600 dark:bg-[#818CF8] text-white dark:text-slate-900 py-4 rounded-xl text-xs font-black hover:opacity-90 shadow-md flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" /> Return to Chat
                      </button>
                    </div>
                  ) : (
                    /* Display FRQ question/answers inputs */
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                      
                      {/* Left: Stimulus */}
                      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                        <div className="max-w-prose space-y-4">
                          <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Free Response Stimulus</span>
                          <h3 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Constructed Response Scenario</h3>
                          <div className="prose dark:prose-invert max-w-none prose-sm">
                            <MarkdownRenderer content={frqData.stimulus || ''} />
                          </div>
                        </div>
                      </div>

                      {/* Right: Answer editor slots */}
                      <div className="w-full md:w-[500px] p-6 md:p-10 flex flex-col justify-between shrink-0 overflow-y-auto custom-scrollbar bg-slate-50/[0.2] dark:bg-slate-950/[0.1]">
                        <div className="space-y-6">
                          <h3 className="text-base font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Response Editor</h3>
                          <p className="text-slate-400 text-xs">Write focused, direct responses using active-learning standards.</p>
                          
                          <div className="space-y-5">
                            {frqData.parts.map(p => (
                              <div key={p.letter} className="space-y-2">
                                <div className="text-xs font-black text-[#1A1C21] dark:text-[#F8F9FB] flex items-start gap-1">
                                  <span className="text-indigo-500 font-black">({p.letter})</span>
                                  <div className="flex-1"><MarkdownRenderer content={p.question} /></div>
                                  <span className="text-[10px] font-bold text-slate-400 tracking-wider shrink-0">({p.points}pt)</span>
                                </div>
                                <textarea aria-label={`Your answer for part ${p.letter}`}
                                  value={frqAnswers[p.letter] || ''}
                                  onChange={e => setFrqAnswers(prev => ({ ...prev, [p.letter]: e.target.value }))}
                                  placeholder="Type your structured explanation..."
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-[#1A1C21] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none min-h-[90px]"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={handleSubmitFrq}
                          disabled={frqGrading}
                          className="mt-8 w-full bg-indigo-600 dark:bg-[#818CF8] text-white dark:text-slate-900 py-4 rounded-xl text-xs font-black hover:opacity-90 shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {frqGrading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Responses...
                            </>
                          ) : (
                            <>Submit to AI Grader</>
                          )}
                        </button>
                      </div>

                    </div>
                  )
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-xs text-slate-400">Failed to construct FRQ. Close and try again.</p>
                    <button onClick={() => setBreakoutMode('none')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black">Close</button>
                  </div>
                )}
              </div>
            )}

          </div>
        ) : null}

        {/* Messages Feed Viewport */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
        >
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Mascot Icon/Emoji container */}
                {!isUser && (
                  <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden select-none mt-1">
                    <ScienceBuddyMascot size={28} type={mascot} mood={isLoading || isStreaming ? 'excited' : 'happy'} />
                  </div>
                )}

                {/* Bubble content */}
                <div
                  className={`p-4 rounded-2xl border text-xs leading-relaxed shadow-sm font-bold ${
                    isUser
                      ? 'bg-indigo-600 border-indigo-600 text-white dark:bg-[#818CF8] dark:border-[#818CF8] dark:text-slate-900 rounded-tr-none'
                      : 'bg-white dark:bg-[#15171C] border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none prose-sm text-left">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Chatbot Loading state */}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center animate-pulse">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              </div>
              <div className="bg-white dark:bg-[#15171C] border border-slate-100 dark:border-slate-800/80 p-4 rounded-2xl rounded-tl-none h-11 w-24 flex items-center justify-center">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full animate-bounce duration-500" />
                  <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full animate-bounce duration-500 delay-100" />
                  <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full animate-bounce duration-500 delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input Form */}
        <form 
          onSubmit={handleSendMessage}
          className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15171C] flex gap-3 items-center shrink-0 z-10"
        >
          <input aria-label="Message your study buddy"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading || isStreaming || breakoutMode !== 'none'}
            placeholder="Ask a Socratic question or request 'MCQ Practice'..."
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-[#1A1C21] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isStreaming || breakoutMode !== 'none'}
            className="btn-squishy h-10 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </form>

      </div>

      {/* 2. PEDAGOGICAL ALIGNMENT COLLAPSIBLE SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#15171C] flex flex-col justify-between shrink-0 overflow-y-auto custom-scrollbar z-10"
          >
            <div className="p-6 space-y-6">
              
              {/* Scorecard Title */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block">Pedagogical scorecard</span>
                <h3 className="text-base font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">AI Alignment Score</h3>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Measures the conceptual fit of Socratic chat questions and topics relative to ${isIB ? 'IB syllabus' : 'college board CED'} specifications in real time.
                </p>
              </div>

              {/* Score radial/dial progress bar */}
              <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-5 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden bg-slate-50/[0.3] dark:bg-slate-950/[0.1]">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Radial Dial Track */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="40" 
                      stroke="currentColor" 
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="8" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="50" cy="50" r="40" 
                      stroke="currentColor" 
                      className="text-indigo-500 dark:text-[#818CF8]"
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * (contextData.alignmentScore * 10)) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded leading-none">{contextData.alignmentScore}</span>
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">out of 10</span>
                  </div>
                </div>

                <div className="space-y-1 mt-2">
                  <span className="px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-indigo-500/10 text-indigo-600 dark:text-[#818CF8]">
                    Mode: {contextData.mode || 'Socratic'}
                  </span>
                  <p className="text-[10px] font-medium text-slate-400 leading-snug mt-2 italic px-2">
                    "{contextData.alignmentNote}"
                  </p>
                </div>
              </div>

              {/* Standard objective details bento */}
              <div className="space-y-4">
                
                {/* Active Unit Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Active ${isIB ? 'Syllabus Theme/Topic' : 'CED Syllabus Unit'}</span>
                    <p className="text-xs font-black text-[#1A1C21] dark:text-[#F8F9FB] leading-snug truncate font-rounded">{contextData.currentUnit || 'General scope'}</p>
                  </div>
                </div>

                {/* Exam Objective Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0 mt-0.5">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">${isIB ? 'IB Curriculum Standard' : 'College Board Standard'}</span>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed font-rounded">{contextData.currentObjective || 'Adaptive inquiry'}</p>
                  </div>
                </div>

              </div>

            </div>

            <div className="p-6 bg-slate-50/[0.4] dark:bg-slate-950/[0.1] border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-2.5 text-[9px] text-slate-400 leading-normal">
              <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>Socratic alignment metrics are generated dynamically by parsing tailing context frames.</span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
