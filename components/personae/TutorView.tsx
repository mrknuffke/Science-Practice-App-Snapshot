import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { GraduationCap, Sparkles, Download, RotateCcw, Send, Mic, MicOff, Calculator, Wand2, BookOpen, Copy, Check, PanelRightClose, PanelRightOpen } from 'lucide-react';
import SimulationHeader from '../simulations/shared/SimulationHeader';
import AboutPanel from '../simulations/shared/AboutPanel';
import { TTSButton } from '../TTSButton';
import { TUTOR_ABOUT } from './TutorAbout';
import { TUTOR_PRESETS } from './personaePresets';
import { PersonaChatMessage, TutorMathStep } from './personaeTypes';
import {
  parseTutorMathSteps,
  exportPersonaSessionToMarkdown,
} from './personaeEngine';
import { callPersonaAI } from '../../services/ai/personae';
import { CourseType } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface TutorViewProps {
  onBack: () => void;
  course?: CourseType;
}

export const TutorView: React.FC<TutorViewProps> = ({ onBack, course }) => {
  const initialPreset = useMemo(() => {
    if (course) {
      const match = TUTOR_PRESETS.find(p => p.course === course);
      if (match) return match;
    }
    return TUTOR_PRESETS[0];
  }, [course]);

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [topic, setTopic] = useState<string>(initialPreset.topic);
  const [currentCourse, setCurrentCourse] = useState<CourseType>(initialPreset.course);
  const [scratchpad, setScratchpad] = useState<string>(initialPreset.initialScratchpad || '');
  const [messages, setMessages] = useState<PersonaChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I am your AI Science Tutor for **${initialPreset.course}**. We are looking at **${initialPreset.topic}**.\n\n${initialPreset.starterPrompt}\n\nLet's break this down into clear, structured steps. What is our first step?`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [showScratchpad, setShowScratchpad] = useState<boolean>(true);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const { isListening, hasSpeechSupport, toggleListening, stopListening } = useSpeechRecognition({
    value: input,
    onChange: setInput,
    onUnsupported: () => showToast('Speech recognition is not supported in this browser.'),
  });

  const _currentPreset = useMemo(() => {
    return TUTOR_PRESETS.find(p => p.id === selectedPresetId) || TUTOR_PRESETS[0];
  }, [selectedPresetId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Change preset
  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = TUTOR_PRESETS.find(p => p.id === presetId) || TUTOR_PRESETS[0];
    setSelectedPresetId(preset.id);
    setTopic(preset.topic);
    setCurrentCourse(preset.course);
    setScratchpad(preset.initialScratchpad || '');
    setMessages([
      {
        id: `welcome-${preset.id}`,
        role: 'model',
        text: `Hello! I am your AI Science Tutor for **${preset.course}** working on **${preset.topic}**.\n\n${preset.starterPrompt}\n\nLet's break this down into clear, structured steps. What is our first step?`,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  // Send message
  const handleSendMessage = async (textToSend?: string, simplify: boolean = false) => {
    const query = (textToSend || input).trim();
    if (!query && !simplify) return;

    stopListening();

    const userMessage: PersonaChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query || 'Could you please simplify that explanation?',
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await callPersonaAI({
        persona: 'tutor',
        course: currentCourse,
        topic,
        history: newHistory,
        scratchpadContent: scratchpad,
        simplify,
      });

      const tutorMessage: PersonaChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: reply,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, tutorMessage]);
    } catch {
      showToast('Error getting tutor response.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action Chips
  const handleQuickPrompt = (promptText: string, simplify: boolean = false) => {
    handleSendMessage(promptText, simplify);
  };

  // Reset Session
  const handleResetSession = () => {
    handleSelectPreset(selectedPresetId);
    showToast('Tutor session reset.');
  };

  // Export Markdown
  const handleExport = () => {
    const md = exportPersonaSessionToMarkdown(
      'tutor',
      currentCourse,
      topic,
      messages,
      scratchpad
    );
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tutor-${currentCourse.toLowerCase().replace(/\s+/g, '-')}-session.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported tutor session to Markdown.');
  };

  // Extract structured math steps from all model responses
  const parsedSteps: TutorMathStep[] = useMemo(() => {
    const allModelText = messages
      .filter(m => m.role === 'model')
      .map(m => m.text)
      .join('\n\n');
    return parseTutorMathSteps(allModelText);
  }, [messages]);

  const insertSymbolIntoScratchpad = (symbol: string) => {
    setScratchpad(prev => prev + symbol);
  };

  const copyStepToScratchpad = (step: TutorMathStep) => {
    const textToAppend = `\n[${step.label}] ${step.calculation || step.explanation}`;
    setScratchpad(prev => prev + textToAppend);
    setCopiedStep(step.stepNumber);
    setTimeout(() => setCopiedStep(null), 2000);
    showToast(`Added ${step.label} to scratchpad.`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium border border-emerald-400 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <SimulationHeader
        title="AI Science Tutor"
        icon={GraduationCap}
        onBack={onBack}
        gradient="from-emerald-400 via-teal-400 to-cyan-400"
        onOpenAbout={() => setShowAbout(true)}
      />

      {/* Top Controls Bar */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 mb-6 border border-slate-700/60 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="tutor-preset" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Problem Scenario:
          </label>
          <select
            id="tutor-preset"
            value={selectedPresetId}
            onChange={e => handleSelectPreset(e.target.value)}
            className="bg-slate-900 text-slate-200 text-sm font-medium rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {TUTOR_PRESETS.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.title} ({preset.course})
              </option>
            ))}
          </select>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            {topic}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScratchpad(prev => !prev)}
            title={showScratchpad ? 'Collapse Math Scratchpad' : 'Expand Math Scratchpad'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-600"
          >
            {showScratchpad ? (
              <>
                <PanelRightClose className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hide Scratchpad</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Show Scratchpad</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleQuickPrompt('Could you simplify this explanation for a beginner?', true)}
            title="Simplify the explanation"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/90 hover:bg-amber-600 text-amber-50 text-xs font-semibold rounded-lg transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simplify</span>
          </button>

          <button
            onClick={handleExport}
            title="Export Markdown Session Log"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-600"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={handleResetSession}
            title="Reset Session"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-600"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (Split View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chat Dialogue (takes 7 or 12 cols depending on scratchpad visibility) */}
        <div className={`space-y-4 ${showScratchpad ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          {/* Chat Container */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-lg flex flex-col h-[600px] overflow-hidden">
            {/* Header info */}
            <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Step-by-Step Pacing Dialogue
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {messages.filter(m => m.role === 'model').length} tutor responses
              </span>
            </div>

            {/* Message history */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {msg.role === 'user' ? 'You' : 'AI Tutor'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-700 rounded-bl-none shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                    {msg.role === 'model' && (
                      <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                        <TTSButton text={msg.text} label="Listen" className="text-xs" />
                        <button
                          onClick={() => handleQuickPrompt(`Can you explain that more simply?`, true)}
                          className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Simplify</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs py-2 px-3 bg-slate-900/60 rounded-xl border border-slate-700/60 w-fit animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Tutor is calculating the next step...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Scaffolding Chips */}
            <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-700/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Pacing:
              </span>
              <button
                onClick={() => handleQuickPrompt('What is the next step in this calculation?')}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-600/60"
              >
                Next Step
              </button>
              <button
                onClick={() => handleQuickPrompt('Can you check my math and conversion units?')}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-600/60"
              >
                Check My Math
              </button>
              <button
                onClick={() => handleQuickPrompt('Show me the dimensional analysis setup for this.')}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-600/60"
              >
                Dimensional Analysis
              </button>
              <button
                onClick={() => handleQuickPrompt('Why do we use this particular formula here?')}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-600/60"
              >
                Formula Rationale
              </button>
            </div>

            {/* Message Input Bar */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-700">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Enter your calculation, question, or proposed next step..."
                    className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 text-sm rounded-xl px-4 py-2.5 pr-10 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  {hasSpeechSupport && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      title={isListening ? 'Stop dictation' : 'Dictate with microphone'}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                        isListening
                          ? 'text-rose-400 bg-rose-950/60 animate-pulse'
                          : 'text-slate-400 hover:text-emerald-400'
                      }`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-semibold shadow-md flex items-center gap-1.5 transition-all text-sm shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Scratchpad & Step Breakdown (takes 5 cols) */}
        {showScratchpad && (
          <div className="lg:col-span-5 space-y-4">
            {/* Scratchpad Card */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Interactive Math Scratchpad
                  </h3>
                </div>
                <button
                  onClick={() => setScratchpad('')}
                  className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Clear Notes
                </button>
              </div>

              {/* Quick Science Math Symbols */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">Insert:</span>
                {['×', '÷', 'Δ', '²', '½', '→', '⇌', 'π', 'μ', 'λ', '°C', 'mol'].map(sym => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => insertSymbolIntoScratchpad(sym)}
                    className="px-2 py-0.5 bg-slate-900/80 hover:bg-emerald-950 text-emerald-300 hover:text-emerald-200 text-xs font-mono rounded border border-slate-700 transition-colors"
                  >
                    {sym}
                  </button>
                ))}
              </div>

              {/* Textarea for Scratchpad */}
              <textarea
                value={scratchpad}
                onChange={e => setScratchpad(e.target.value)}
                placeholder="Track given values, dimensional analysis multipliers, molar masses, or intermediate steps here..."
                rows={8}
                className="w-full bg-slate-900/90 text-emerald-200 font-mono text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y"
              />
              <p className="text-[11px] text-slate-400 italic">
                Notes in your scratchpad are automatically sent to the AI Tutor as context during each step.
              </p>
            </div>

            {/* Structured Steps Detected */}
            {parsedSteps.length > 0 && (
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 shadow-lg space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-700/60 pb-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Detected Step Sequence ({parsedSteps.length})
                  </h3>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {parsedSteps.map(step => (
                    <div
                      key={step.stepNumber}
                      className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-700/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="font-bold text-emerald-400">{step.label}</span>
                        <button
                          onClick={() => copyStepToScratchpad(step)}
                          title="Copy step to scratchpad"
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-300 transition-colors"
                        >
                          {copiedStep === step.stepNumber ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>To Scratchpad</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-slate-300 font-sans">{step.explanation}</p>
                      {step.calculation && (
                        <div className="bg-slate-950 px-2 py-1 rounded text-cyan-300 font-mono text-[11px]">
                          {step.calculation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* About Modal */}
      <AboutPanel
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        content={TUTOR_ABOUT}
        gradient="from-emerald-500 to-teal-600"
      />
    </div>
  );
};

export default TutorView;
