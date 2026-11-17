import React, { useState, useEffect, useRef } from 'react';
import { cleanHtml, normalizeScientificNotation } from '../../utils/sanitize';
import MarkdownRenderer, { INLINE_PARAGRAPHS } from '../MarkdownRenderer';

interface ClozeCardContentProps {
  sentence: string;
  answer: string;
  isFlipped: boolean;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

export const ClozeCardContent: React.FC<ClozeCardContentProps> = ({
  sentence,
  answer,
  isFlipped,
  onCorrect,
  onIncorrect
}) => {
  const [userInput, setUserInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect' | 'revealed'>('idle');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when sentence changes
  useEffect(() => {
    setUserInput('');
    setStatus('idle');
    setShake(false);
  }, [sentence, answer]);

  const cleanString = (s: string) => s
    .replace(/<[^>]+>/g, '')
    .replace(/\\(?:text|mathrm|mathbf)\{([^}]+)\}/g, '$1')
    .replace(/\$+/g, '')
    .toLowerCase()
    .replace(/[^\w\s]|_/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const cleanedInput = cleanString(userInput);
    const cleanedTarget = cleanString(answer);

    const isMatch = cleanedInput === cleanedTarget || (
      cleanedInput.length >= 3 && cleanedTarget.includes(cleanedInput)
    );

    if (isMatch) {
      setStatus('correct');
      if (onCorrect) onCorrect();
    } else {
      setStatus('incorrect');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (onIncorrect) onIncorrect();
    }
  };

  const handleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus('revealed');
  };

  // Find blank pattern: sequence of 3 or more underscores or "[...]"
  const blankRegex = /(_{3,}|\[\.\.\.\]|\[\s*blank\s*\])/i;
  const parts = sentence.split(blankRegex);

  return (
    <div className="w-full flex flex-col items-center py-2 text-left" onClick={e => e.stopPropagation()}>
      <div className="text-base sm:text-lg md:text-xl font-medium leading-relaxed text-slate-800 dark:text-slate-100 mb-6 max-w-xl">
        {parts.length > 1 ? (
          <span>
            <MarkdownRenderer
              content={cleanHtml(normalizeScientificNotation(parts[0]))}
              components={INLINE_PARAGRAPHS}
            />
            <span className="inline-block mx-1.5 align-baseline">
              {status === 'revealed' || isFlipped ? (
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-black border-2 border-emerald-300 dark:border-emerald-600 shadow-sm animate-in zoom-in-95">
                  {answer}
                </span>
              ) : status === 'correct' ? (
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-black border-2 border-emerald-400 dark:border-emerald-600 shadow-sm">
                  {userInput} ✓
                </span>
              ) : (
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCheck(e);
                  }}
                  placeholder="type answer..."
                  className={`px-3 py-1 text-sm sm:text-base font-bold rounded-xl border-2 transition-all outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-inner ${
                    shake
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 animate-shake'
                      : status === 'incorrect'
                        ? 'border-rose-400 dark:border-rose-600'
                        : 'border-indigo-300 dark:border-indigo-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                  }`}
                  style={{ minWidth: '130px', maxWidth: '200px' }}
                />
              )}
            </span>
            <MarkdownRenderer
              content={cleanHtml(normalizeScientificNotation(parts.slice(2).join('')))}
              components={INLINE_PARAGRAPHS}
            />
          </span>
        ) : (
          <MarkdownRenderer
            content={cleanHtml(normalizeScientificNotation(sentence))}
            components={INLINE_PARAGRAPHS}
          />
        )}
      </div>

      {status !== 'revealed' && !isFlipped && (
        <div className="flex items-center gap-3 mt-2">
          {status !== 'correct' && (
            <button
              onClick={handleCheck}
              disabled={!userInput.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Check Answer
            </button>
          )}
          <button
            onClick={handleReveal}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            Reveal Blank
          </button>
        </div>
      )}

      {status === 'incorrect' && (
        <p className="text-rose-500 text-xs font-bold mt-2 animate-in fade-in">
          Not quite right. Try again or tap Reveal!
        </p>
      )}
      {status === 'correct' && (
        <p className="text-emerald-600 text-xs font-black mt-2 animate-in fade-in">
          Spot on! Great active recall.
        </p>
      )}
    </div>
  );
};
