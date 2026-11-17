import React, { useState, useRef, useEffect } from 'react';
import { CourseType, ChatMessage } from '../types';
import { ExplanationMessage } from './ExplanationMessage';
import { ScienceBuddyMascot } from './ScienceBuddyMascot';
import { FactualAccuracyIndicator } from './FactualAccuracyIndicator';
import SEO from './SEO';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ExplanationViewProps {
  course: CourseType;
  topic: string;
  history: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  onFinish: () => void;
  onQuit: () => void;
  isLoading: boolean;
  onShareLink?: () => void;
  onStartFreshSession?: () => void;
}

const ExplanationView: React.FC<ExplanationViewProps> = ({
  course,
  topic,
  history,
  onSendMessage,
  onFinish,
  onQuit,
  isLoading,
  onShareLink,
  onStartFreshSession
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // --- SPEECH RECOGNITION STATE ---
  const { isListening, hasSpeechSupport, toggleListening, stopListening } = useSpeechRecognition({
    value: input,
    onChange: setInput,
    onUnsupported: () => alert('Dictation is not supported in this browser.'),
    onStart: () => inputRef.current?.focus(),
  });

  const handleShare = () => {
    if (onShareLink) {
      onShareLink();
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('course', course);
    url.searchParams.set('topic', topic);
    url.searchParams.set('mode', 'explanation');
    navigator.clipboard.writeText(url.toString()).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isLoading, history]);

  // Focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    stopListening(); // Stop listening on send

    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  // Helper to get theme colors
  const getThemeColors = (c: CourseType) => {
    if (c === 'Custom Practice') return { bg: 'bg-indigo-600 dark:bg-[#818CF8]', text: 'text-indigo-900 dark:text-indigo-300', border: 'border-indigo-600 dark:border-[#818CF8]', bubble: 'bg-indigo-50 dark:bg-indigo-950/20', userBubble: 'bg-indigo-600 dark:bg-[#818CF8]' };
    if (c.includes('Chemistry')) return { bg: 'bg-skyBlue dark:bg-skyBlue', text: 'text-sky-900 dark:text-sky-300', border: 'border-skyBlue dark:border-skyBlue', bubble: 'bg-sky-50 dark:bg-sky-950/20', userBubble: 'bg-skyBlue dark:bg-skyBlue' };
    if (c.includes('Physics') && !c.includes('Physical Science')) return { bg: 'bg-coral dark:bg-coral', text: 'text-rose-900 dark:text-coral', border: 'border-coral dark:border-coral', bubble: 'bg-rose-50 dark:bg-rose-950/20', userBubble: 'bg-coral dark:bg-coral' };
    if (c.includes('Environmental')) return { bg: 'bg-teal-600 dark:bg-teal-500', text: 'text-teal-900 dark:text-teal-300', border: 'border-teal-600 dark:border-teal-500', bubble: 'bg-teal-50 dark:bg-teal-950/20', userBubble: 'bg-teal-600 dark:bg-teal-500' };
    if (c.includes('Middle School')) return { bg: 'bg-amber-500 dark:bg-amber-400', text: 'text-amber-900 dark:text-amber-300', border: 'border-amber-600 dark:border-amber-400', bubble: 'bg-amber-50 dark:bg-amber-950/20', userBubble: 'bg-amber-500 dark:bg-amber-400' };
    if (c.includes('Elementary School')) return { bg: 'bg-orange-500 dark:bg-orange-400', text: 'text-orange-900 dark:text-orange-300', border: 'border-orange-500 dark:border-orange-400', bubble: 'bg-orange-50 dark:bg-orange-950/20', userBubble: 'bg-orange-500 dark:bg-orange-400' };
    // Electives
    if (['Physical Science', 'Anatomy and Physiology', 'Marine Biology', 'Biotechnology', 'Forensic Science'].includes(c)) {
      return { bg: 'bg-slate-600 dark:bg-slate-500', text: 'text-slate-900 dark:text-slate-355', border: 'border-slate-600 dark:border-slate-500', bubble: 'bg-slate-100 dark:bg-slate-800/40', userBubble: 'bg-slate-600 dark:bg-slate-500' };
    }
    // Biology Default
    return { bg: 'bg-mint dark:bg-mint', text: 'text-emerald-950 dark:text-mint', border: 'border-mint dark:border-mint', bubble: 'bg-emerald-50/50 dark:bg-emerald-950/20', userBubble: 'bg-mint dark:bg-mint' };
  };

  const theme = getThemeColors(course);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#12141C] text-slate-800 dark:text-[#F8F9FB] flex flex-col h-screen overflow-hidden transition-colors duration-300">
      <SEO title={`Dialogue: ${topic || course}`} />
      {/* VISOR Visor Header */}
      <header className="bg-white dark:bg-[#1E212A] border-b border-slate-200 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-20 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={onQuit}
            className="text-slate-400 hover:text-rose-500 transition-colors p-2 -ml-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Quit to Home"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
          
          {/* Animated Mascot Integration inline inside VISOR header! */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 select-none">
              <ScienceBuddyMascot size={32} mood={isLoading ? "thinking" : "happy"} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Socratic Explanation Chat</p>
              <h2 className="text-sm md:text-base font-black text-slate-800 dark:text-white leading-none font-rounded">
                {course} • {topic}
              </h2>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <FactualAccuracyIndicator
            course={course}
            topic={topic}
            turnCount={Math.round(history.length / 2)}
            onStartFreshSession={onStartFreshSession}
          />
          <button
            onClick={handleShare}
            className="text-slate-400 hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors flex items-center gap-1"
            title="Share Link"
          >
            {linkCopied ? (
              <span className="text-xs font-bold text-emerald-500 animate-pulse">Copied!</span>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
          </button>
          <button
            onClick={onFinish}
            disabled={isLoading}
            className="btn-squishy px-5 py-2.5 rounded-2xl font-black text-xs text-white shadow-md bg-indigo-600 hover:bg-indigo-500 dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 disabled:opacity-50"
          >
            Finish & Get Report 🚀
          </button>
        </div>
      </header>

      {/* Chat Messages area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
        <div className="max-w-3xl mx-auto space-y-6 pb-8">
          {history.length === 0 && !isLoading && (
            <div className="text-center text-slate-450 dark:text-slate-500 text-xs font-bold mt-10">
              Initializing Socratic Study Session...
            </div>
          )}

          {history.map((msg, idx) => (
            <ExplanationMessage key={idx} message={msg} theme={theme} />
          ))}

          {isLoading && (
            /* typing bubble matching card colors */
            <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="bg-white dark:bg-[#1E212A] p-5 rounded-3xl rounded-tl-none border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-bounce bg-indigo-500 dark:bg-[#818CF8]"></div>
                <div className="w-2 h-2 rounded-full animate-bounce bg-indigo-500 dark:bg-[#818CF8]" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce bg-indigo-500 dark:bg-[#818CF8]" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input container visor */}
      <div className="bg-white dark:bg-[#1E212A] border-t border-slate-200 dark:border-slate-800/80 p-4 shrink-0 z-20 transition-colors duration-300">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative flex items-center gap-2.5">
          <div className="relative flex-1">
            <input aria-label="Your explanation"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Explain the concept here..."}
              disabled={isLoading}
              className={`w-full bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl pl-6 pr-14 py-4 focus:outline-none transition-all font-semibold text-sm ${
                isListening
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/20 placeholder-rose-400 text-rose-850 dark:text-rose-300'
                  : 'border-slate-200 dark:border-slate-800/60 focus:border-indigo-500 dark:focus:border-[#818CF8] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500'
              }`}
            />

            {/* Dictation mic */}
            {hasSpeechSupport && (
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                  isListening
                    ? 'text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 animate-pulse'
                    : 'text-slate-400 hover:text-slate-650 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title={isListening ? "Stop Listening" : "Voice Input"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
          </div>

          <button aria-label="Send"
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`aspect-square w-14 rounded-2xl flex items-center justify-center transition-colors shadow-sm shrink-0 ${
              !input.trim() || isLoading
                ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                : 'bg-indigo-600 hover:bg-indigo-500 dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] text-white dark:text-slate-900 hover:opacity-90'
            }`}
          >
            <svg className="w-6 h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExplanationView;
