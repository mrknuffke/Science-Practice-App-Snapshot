import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { HelpCircle, Sparkles, Download, RotateCcw, Send, Mic, MicOff, Wand2, Brain, Compass, Zap, Target, TrendingUp } from 'lucide-react';
import SimulationHeader from '../simulations/shared/SimulationHeader';
import AboutPanel from '../simulations/shared/AboutPanel';
import { TTSButton } from '../TTSButton';
import { SOCRATIC_ABOUT } from './SocraticAbout';
import { SOCRATIC_PRESETS } from './personaePresets';
import { PersonaChatMessage } from './personaeTypes';
import {
  measureSocraticDepth,
  exportPersonaSessionToMarkdown,
} from './personaeEngine';
import { callPersonaAI } from '../../services/ai/personae';
import { CourseType } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface SocraticViewProps {
  onBack: () => void;
  course?: CourseType;
}

export const SocraticView: React.FC<SocraticViewProps> = ({ onBack, course }) => {
  const initialPreset = useMemo(() => {
    if (course) {
      const match = SOCRATIC_PRESETS.find(p => p.course === course);
      if (match) return match;
    }
    return SOCRATIC_PRESETS[0];
  }, [course]);

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [topic, setTopic] = useState<string>(initialPreset.topic);
  const [currentCourse, setCurrentCourse] = useState<CourseType>(initialPreset.course);
  const [messages, setMessages] = useState<PersonaChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Greetings. I am your Socratic Guide in **${initialPreset.course}**.\n\nConsider this puzzle in **${initialPreset.topic}**:\n*"${initialPreset.starterPrompt}"*\n\nRather than telling you what to think, I will help you discover the truth through reasoning. How would you begin dissecting this?`,
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

  // Concept Depth Score (0 - 100%)
  const conceptDepth = useMemo(() => {
    return measureSocraticDepth(messages);
  }, [messages]);

  const depthTier = useMemo(() => {
    if (conceptDepth >= 75) {
      return {
        label: 'Theoretical Mastery & First Principles',
        color: 'text-violet-400',
        barColor: 'bg-violet-500',
        badge: 'Tier 3: Deep Causal Reasoning',
      };
    }
    if (conceptDepth >= 40) {
      return {
        label: 'Intermediate Mechanism & Causality',
        color: 'text-purple-400',
        barColor: 'bg-purple-500',
        badge: 'Tier 2: Relational Exploration',
      };
    }
    return {
      label: 'Initial Phenomenon & Observational Recall',
      color: 'text-slate-400',
      barColor: 'bg-indigo-500',
      badge: 'Tier 1: Surface Inquiry',
    };
  }, [conceptDepth]);

  // Load preset
  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = SOCRATIC_PRESETS.find(p => p.id === presetId) || SOCRATIC_PRESETS[0];
    setSelectedPresetId(preset.id);
    setTopic(preset.topic);
    setCurrentCourse(preset.course);
    setMessages([
      {
        id: `welcome-${preset.id}`,
        role: 'model',
        text: `Greetings. I am your Socratic Guide in **${preset.course}**.\n\nConsider this puzzle in **${preset.topic}**:\n*"${preset.starterPrompt}"*\n\nRather than telling you what to think, I will help you discover the truth through reasoning. How would you begin dissecting this?`,
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
      text: query || 'Could you rephrase that question with an everyday analogy?',
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await callPersonaAI({
        persona: 'socratic',
        course: currentCourse,
        topic,
        history: newHistory,
        simplify,
      });

      const guideMessage: PersonaChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: reply,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, guideMessage]);
    } catch {
      showToast('Error getting Socratic response.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string, simplify: boolean = false) => {
    handleSendMessage(promptText, simplify);
  };

  const handleResetSession = () => {
    handleSelectPreset(selectedPresetId);
    showToast('Socratic inquiry reset.');
  };

  const handleExport = () => {
    const md = exportPersonaSessionToMarkdown(
      'socratic',
      currentCourse,
      topic,
      messages
    );
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `socratic-${currentCourse.toLowerCase().replace(/\s+/g, '-')}-dialogue.md`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported Socratic transcript to Markdown.');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-violet-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium border border-violet-400 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-violet-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <SimulationHeader
        title="AI Socratic Guide"
        icon={HelpCircle}
        onBack={onBack}
        gradient="from-violet-400 via-purple-400 to-indigo-400"
        onOpenAbout={() => setShowAbout(true)}
      />

      {/* Top Controls Bar */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 mb-6 border border-slate-700/60 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="socratic-preset" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Inquiry Puzzle:
          </label>
          <select
            id="socratic-preset"
            value={selectedPresetId}
            onChange={e => handleSelectPreset(e.target.value)}
            className="bg-slate-900 text-slate-200 text-sm font-medium rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            {SOCRATIC_PRESETS.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.title} ({preset.course})
              </option>
            ))}
          </select>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-950 text-violet-300 border border-violet-800">
            {topic}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuickPrompt('Could you explain this dilemma using an everyday analogy?', true)}
            title="Simplify inquiry with an analogy"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/90 hover:bg-amber-600 text-amber-50 text-xs font-semibold rounded-lg transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Analogy</span>
          </button>

          <button
            onClick={handleExport}
            title="Export Socratic Dialogue to Markdown"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-600"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={handleResetSession}
            title="Reset Dialogue"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-600"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Concept Depth Evaluation Card */}
      <div className="bg-slate-800/80 rounded-2xl p-4 mb-6 border border-slate-700/60 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Reasoning Depth Evaluation
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-violet-300">
              {depthTier.badge}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-mono font-bold text-violet-300">{conceptDepth}%</span>
            <span>Reasoning Index</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
          <div
            className={`h-full transition-all duration-500 rounded-full ${depthTier.barColor}`}
            style={{ width: `${conceptDepth}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Current Level: <strong className={depthTier.color}>{depthTier.label}</strong></span>
          <span className="italic hidden sm:inline">
            Include words like &quot;because&quot;, &quot;mechanism&quot;, and &quot;leads to&quot; to deepen inquiry.
          </span>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-lg flex flex-col h-[600px] overflow-hidden">
        {/* Chat Header */}
        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Socratic Dialectic Dialogue
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {messages.filter(m => m.role === 'model').length} inquiry turns
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
                  {msg.role === 'user' ? 'You (Reasoning)' : 'Socratic Guide'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-700 rounded-bl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                {msg.role === 'model' && (
                  <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                    <TTSButton text={msg.text} label="Listen" className="text-xs" />
                    <button
                      onClick={() => handleQuickPrompt(`Could you rephrase that in simpler terms?`, true)}
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
            <div className="flex items-center gap-2 text-violet-400 text-xs py-2 px-3 bg-slate-900/60 rounded-xl border border-slate-700/60 w-fit animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Socratic Guide is formulating an inquiry...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Socratic Levers */}
        <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-700/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Push Thinking:
          </span>
          <button
            onClick={() => handleQuickPrompt('What underlying assumption am I making in this hypothesis?')}
            disabled={isLoading}
            className="shrink-0 px-2.5 py-1 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-600/60 flex items-center gap-1"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Probe Assumptions</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('Can you pose a thought experiment that tests this to the extreme limit?')}
            disabled={isLoading}
            className="shrink-0 px-2.5 py-1 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-600/60 flex items-center gap-1"
          >
            <Brain className="w-3 h-3 text-violet-400" />
            <span>Extreme Boundary Test</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('What counter-example would completely falsify my line of reasoning?')}
            disabled={isLoading}
            className="shrink-0 px-2.5 py-1 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-600/60 flex items-center gap-1"
          >
            <Target className="w-3 h-3 text-rose-400" />
            <span>Counter-Example</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('How does this connect back to basic conservation of energy or mass?')}
            disabled={isLoading}
            className="shrink-0 px-2.5 py-1 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-600/60 flex items-center gap-1"
          >
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>First Principles</span>
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
                placeholder="State your hypothesis, explanation, or mechanism..."
                className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 text-sm rounded-xl px-4 py-2.5 pr-10 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              {hasSpeechSupport && (
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? 'Stop dictation' : 'Dictate hypothesis with microphone'}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                    isListening
                      ? 'text-rose-400 bg-rose-950/60 animate-pulse'
                      : 'text-slate-400 hover:text-violet-400'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl font-semibold shadow-md flex items-center gap-1.5 transition-all text-sm shrink-0"
            >
              <span>Explore</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* About Modal */}
      <AboutPanel
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        content={SOCRATIC_ABOUT}
        gradient="from-violet-500 to-purple-600"
      />
    </div>
  );
};

export default SocraticView;
