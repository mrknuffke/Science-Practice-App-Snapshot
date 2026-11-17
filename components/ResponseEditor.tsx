import React, { useState, useRef, useEffect } from 'react';
import { TTSButton } from './TTSButton';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ResponseEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
  autoFocus?: boolean;
}

const SYMBOL_CATEGORIES = [
  {
    name: 'Arrows',
    symbols: ['→', '⇌', '↑', '↓', '↔', '⇒', '⇐', '⇔']
  },
  {
    name: 'Greek',
    symbols: ['α', 'β', 'γ', 'Δ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'ρ', 'Σ', 'σ', 'Φ', 'φ', 'Ψ', 'Ω', 'ω']
  },
  {
    name: 'Math',
    symbols: ['±', '≈', '≠', '≤', '≥', '×', '÷', '∞', '√', '°', '∆', '∇', '∂', '∫']
  },
  {
    name: 'Sup/Sub',
    symbols: ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁺', '⁻', '₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']
  }
];

const ResponseEditor: React.FC<ResponseEditorProps> = ({
  value,
  onChange,
  placeholder,
  disabled,
  minHeight = '160px',
  autoFocus = false
}) => {
  const [showSymbols, setShowSymbols] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // --- SPEECH RECOGNITION STATE ---
  const { isListening, hasSpeechSupport, toggleListening } = useSpeechRecognition({
    value,
    onChange,
    onUnsupported: () =>
      alert('Dictation is not supported in this browser. Please use Chrome, Edge, or Safari.'),
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowSymbols(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleInsert = (symbol: string) => {
    const input = textareaRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const text = value;
      const newText = text.substring(0, start) + symbol + text.substring(end);

      onChange(newText);

      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + symbol.length, start + symbol.length);
      }, 0);
    } else {
      onChange(value + symbol);
    }
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* SYMBOLS BUTTON */}
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowSymbols(!showSymbols)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all ${showSymbols
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="text-lg leading-none">Ω</span>
              <span className="hidden sm:inline">Symbols</span>
            </button>

            {/* Symbol Popover */}
            {showSymbols && (
              <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 w-[280px] sm:w-[320px] animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-350 pr-2">
                  {SYMBOL_CATEGORIES.map((cat) => (
                    <div key={cat.name}>
                      <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-100 dark:border-slate-850 pb-1">
                        {cat.name}
                      </h4>
                      <div className="grid grid-cols-6 gap-1">
                        {cat.symbols.map((sym) => (
                          <button
                            key={sym}
                            onClick={() => handleInsert(sym)}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-450 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors"
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MICROPHONE BUTTON */}
          {hasSpeechSupport && (
            <button
              type="button"
              disabled={disabled}
              onClick={toggleListening}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all ${isListening
                ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-200 dark:ring-rose-950/30 animate-pulse'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-450'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Dictate Answer (Speech-to-Text)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Dictate'}</span>
            </button>
          )}

          {/* TTS READ BACK */}
          <div className="mx-1">
            <TTSButton text={value} label="Read Draft" className="border border-slate-200 dark:border-slate-800" />
          </div>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowTips(!showTips)}
          className={`text-[10px] font-bold uppercase tracking-wide transition-colors flex items-center gap-1 ${showTips ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-450'
            }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {showTips ? 'Hide Tips' : 'Formatting Tips'}
        </button>
      </div>

      {/* Formatting Tips Panel */}
      {showTips && (
        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-3 rounded-xl mb-3 text-xs text-indigo-900 dark:text-indigo-300 animate-in slide-in-from-top-2 duration-200">
          <ul className="space-y-1">
            <li className="flex gap-2">
              <span className="font-mono bg-white dark:bg-slate-900 px-1 rounded border border-indigo-100 dark:border-indigo-850 text-indigo-600 dark:text-indigo-400">H2O</span>
              <span>Type numbers for subscripts.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono bg-white dark:bg-slate-900 px-1 rounded border border-indigo-100 dark:border-indigo-850 text-indigo-600 dark:text-indigo-400">x^2</span>
              <span>Use ^ for superscripts.</span>
            </li>
            {hasSpeechSupport && (
              <li className="flex gap-2">
                <span className="bg-rose-100 dark:bg-rose-950/40 px-1 rounded border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-bold">🎙️</span>
                <span>You can use the Dictate button to speak your answer. You may need to speak punctuation (e.g., "Period", "Comma").</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Text Area */}
      <div className="relative">
        <textarea aria-label={placeholder || 'Your response'}
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isListening ? "Listening... speak now..." : placeholder}
          disabled={disabled}
          className={`w-full p-4 rounded-xl border-2 transition-all bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-y font-medium leading-relaxed ${isListening
            ? 'border-rose-300 ring-2 ring-rose-100 dark:ring-rose-950/40 bg-rose-50/20 dark:bg-rose-950/10'
            : 'border-slate-200 dark:border-slate-750 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-0 outline-none'
            }`}
          style={{ minHeight }}
        />
        {isListening && (
          <div className="absolute top-2 right-2 flex gap-1">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseEditor;
