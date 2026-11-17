import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Sparkles, Download, RotateCcw, Send, Mic, MicOff, Wand2, Award, AlertCircle, Lightbulb, ShieldCheck, Target } from 'lucide-react';
import SimulationHeader from '../simulations/shared/SimulationHeader';
import AboutPanel from '../simulations/shared/AboutPanel';
import { TTSButton } from '../TTSButton';
import { GROWTH_COACH_ABOUT } from './GrowthCoachAbout';
import { GROWTH_COACH_PRESETS } from './personaePresets';
import { PersonaChatMessage, GrowthCoachErrorAnalysis } from './personaeTypes';
import {
  classifyErrorTaxonomy,
  exportPersonaSessionToMarkdown,
} from './personaeEngine';
import { callPersonaAI } from '../../services/ai/personae';
import { CourseType } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface GrowthCoachViewProps {
  onBack: () => void;
  course?: CourseType;
}

export const GrowthCoachView: React.FC<GrowthCoachViewProps> = ({ onBack, course }) => {
  const initialPreset = useMemo(() => {
    if (course) {
      const match = GROWTH_COACH_PRESETS.find(p => p.course === course);
      if (match) return match;
    }
    return GROWTH_COACH_PRESETS[0];
  }, [course]);

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [topic, setTopic] = useState<string>(initialPreset.topic);
  const [currentCourse, setCurrentCourse] = useState<CourseType>(initialPreset.course);
  const [errorDescription, setErrorDescription] = useState<string>(initialPreset.sampleErrorText || initialPreset.starterPrompt);
  const [messages, setMessages] = useState<PersonaChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Welcome! I am your AI Growth Coach in **${initialPreset.course}**.\n\nMistakes are not failures, they are the most valuable diagnostic data in your science learning journey.\n\nHere is our current study scenario for **${initialPreset.topic}**:\n*"${initialPreset.starterPrompt}"*\n\nLet's analyze what happened and turn this into permanent mastery!`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Live Taxonomy Analysis based on current error text or last user message
  const liveAnalysis: GrowthCoachErrorAnalysis = useMemo(() => {
    const textToAnalyze = errorDescription || input || 'Conceptual misconception';
    return classifyErrorTaxonomy(textToAnalyze);
  }, [errorDescription, input]);

  // Taxonomy Category Visual Tokens
  const categoryConfig = useMemo(() => {
    switch (liveAnalysis.category) {
      case 'calculation':
        return {
          color: 'text-amber-400',
          bgColor: 'bg-amber-950/60',
          borderColor: 'border-amber-700/60',
          badge: 'Mathematical / Unit Slip',
        };
      case 'misread':
        return {
          color: 'text-rose-400',
          bgColor: 'bg-rose-950/60',
          borderColor: 'border-rose-700/60',
          badge: 'Prompt Constraint Misread',
        };
      case 'recall_gap':
        return {
          color: 'text-teal-400',
          bgColor: 'bg-teal-950/60',
          borderColor: 'border-teal-700/60',
          badge: 'Factual Retrieval Gap',
        };
      default:
        return {
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-950/60',
          borderColor: 'border-cyan-700/60',
          badge: 'Conceptual Misconception',
        };
    }
  }, [liveAnalysis.category]);

  // Select Preset
  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = GROWTH_COACH_PRESETS.find(p => p.id === presetId) || GROWTH_COACH_PRESETS[0];
    setSelectedPresetId(preset.id);
    setTopic(preset.topic);
    setCurrentCourse(preset.course);
    setErrorDescription(preset.sampleErrorText || preset.starterPrompt);
    setMessages([
      {
        id: `welcome-${preset.id}`,
        role: 'model',
        text: `Welcome! I am your AI Growth Coach in **${preset.course}**.\n\nMistakes are diagnostic data, never character judgments.\n\nLet's analyze this question from **${preset.topic}**:\n*"${preset.starterPrompt}"*\n\nHow did your thinking originally unfold on this problem?`,
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
      text: query || 'Can you summarize this coaching takeaway in simpler words?',
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await callPersonaAI({
        persona: 'growth_coach',
        course: currentCourse,
        topic,
        history: newHistory,
        scratchpadContent: `Diagnosed Category: ${liveAnalysis.categoryLabel}\nStudent Error Record: ${errorDescription}`,
        simplify,
      });

      const coachMessage: PersonaChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: reply,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, coachMessage]);
    } catch {
      showToast('Error getting Growth Coach response.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string, simplify: boolean = false) => {
    handleSendMessage(promptText, simplify);
  };

  const handleResetSession = () => {
    handleSelectPreset(selectedPresetId);
    showToast('Growth Coach session reset.');
  };

  const handleExport = () => {
    const md = exportPersonaSessionToMarkdown(
      'growth_coach',
      currentCourse,
      topic,
      messages,
      `Error Record:\n${errorDescription}\n\nTaxonomy Diagnostic: ${liveAnalysis.categoryLabel}\n${liveAnalysis.summary}\n\nPrescribed Action Strategy:\n${liveAnalysis.correctiveStrategy}`
    );
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `growth-coach-${currentCourse.toLowerCase().replace(/\s+/g, '-')}-error-log.md`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported Growth Coach error log to Markdown.');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-amber-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium border border-amber-400 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <SimulationHeader
        title="AI Growth Coach"
        icon={Award}
        onBack={onBack}
        gradient="from-amber-400 via-orange-400 to-rose-400"
        onOpenAbout={() => setShowAbout(true)}
      />

      {/* Top Controls Bar */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 mb-6 border border-slate-700/60 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="coach-preset" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Sample Exam Error:
          </label>
          <select
            id="coach-preset"
            value={selectedPresetId}
            onChange={e => handleSelectPreset(e.target.value)}
            className="bg-slate-900 text-slate-200 text-sm font-medium rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            {GROWTH_COACH_PRESETS.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.title} ({preset.course})
              </option>
            ))}
          </select>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
            {topic}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuickPrompt('Can you explain this growth mindset reframe more simply?', true)}
            title="Simplify explanation"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/90 hover:bg-amber-600 text-amber-50 text-xs font-semibold rounded-lg transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simplify</span>
          </button>

          <button
            onClick={handleExport}
            title="Export Growth Coach Log to Markdown"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-600"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Log</span>
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

      {/* Main Workspace (Error Workbench + Dialogue) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Error Workbench & Taxonomy Diagnostic (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Error Input Card */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Exam Error Workbench
                </h3>
              </div>
              <button
                onClick={() => setErrorDescription('')}
                className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
              >
                Clear Error
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Describe what question you missed, what you answered, and what the correct explanation was:
            </p>

            <textarea
              value={errorDescription}
              onChange={e => setErrorDescription(e.target.value)}
              placeholder="e.g. I picked B because I thought catalysts increase the total energy released..."
              rows={4}
              className="w-full bg-slate-900/90 text-slate-200 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y"
            />
          </div>

          {/* Error Taxonomy Diagnostic Card */}
          <div className={`rounded-2xl p-4 border shadow-lg space-y-3 ${categoryConfig.bgColor} ${categoryConfig.borderColor}`}>
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${categoryConfig.color}`} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Taxonomy Diagnostic
                </h4>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 ${categoryConfig.color}`}>
                {categoryConfig.badge}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {liveAnalysis.summary}
            </p>

            {/* Prescribed Corrective Strategy */}
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" />
                <span>Prescribed Action Drill</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {liveAnalysis.correctiveStrategy}
              </p>
            </div>

            {/* Growth Affirmation */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 italic font-sans">
                &ldquo;{liveAnalysis.growthAffirmation}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Coaching Dialogue (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-lg flex flex-col h-[600px] overflow-hidden">
            {/* Chat Header */}
            <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Metacognitive Dialogue
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {messages.filter(m => m.role === 'model').length} coaching responses
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
                      {msg.role === 'user' ? 'You' : 'Growth Coach'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-amber-600 text-white rounded-br-none shadow-md'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-700 rounded-bl-none shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                    {msg.role === 'model' && (
                      <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                        <TTSButton text={msg.text} label="Listen" className="text-xs" />
                        <button
                          onClick={() => handleQuickPrompt(`Could you simplify this coaching advice?`, true)}
                          className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Simpler</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-amber-400 text-xs py-2 px-3 bg-slate-900/60 rounded-xl border border-slate-700/60 w-fit animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Growth Coach is analyzing your reflection...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Scaffolding Chips */}
            <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-700/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Reflection:
              </span>
              <button
                onClick={() => handleQuickPrompt('How can I practice spotting this specific mistake earlier?')}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-600/60"
              >
                Early Warning Cues
              </button>
              <button
                onClick={() => handleQuickPrompt('Give me a 3-step action plan to review before my next test.')}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-600/60"
              >
                3-Step Exam Drill
              </button>
              <button
                onClick={() => handleQuickPrompt('How should I reframe this so I do not feel defeated?')}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-600/60"
              >
                Mindset Reframe
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
                    placeholder="Share how you reasoned through this problem..."
                    className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 text-sm rounded-xl px-4 py-2.5 pr-10 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  {hasSpeechSupport && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      title={isListening ? 'Stop dictation' : 'Dictate with microphone'}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                        isListening
                          ? 'text-rose-400 bg-rose-950/60 animate-pulse'
                          : 'text-slate-400 hover:text-amber-400'
                      }`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-semibold shadow-md flex items-center gap-1.5 transition-all text-sm shrink-0"
                >
                  <span>Reflect</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* About Modal */}
      <AboutPanel
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        content={GROWTH_COACH_ABOUT}
        gradient="from-amber-500 via-orange-500 to-rose-600"
      />
    </div>
  );
};

export default GrowthCoachView;
