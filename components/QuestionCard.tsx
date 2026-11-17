
import React, { useEffect, useState } from 'react';
import { Question, CourseType } from '../types';
import ResponseEditor from './ResponseEditor';
import { cleanHtml } from '../utils/sanitize';
import { TTSButton } from './TTSButton';
import { getSimplifiedText } from '../services/ai/tutor';
import MarkdownRenderer, { INLINE_PARAGRAPHS } from './MarkdownRenderer';
import type { Components } from 'react-markdown';


/** Question stems: each paragraph as a block with a small gap (a div, so it may hold block markdown). */
const QUESTION_PARAGRAPHS: Components = {
  p: ({ node, ...props }) => <div className="mb-2" {...props} />
};
interface QuestionCardProps {
  course: CourseType;
  question: Question;
  answer: string;
  onAnswerChange: (value: string) => void;
  onFlag: () => void;
  onEasier?: () => void;
  onHarder?: () => void;
  isSubmitted: boolean;
  isReplacing: boolean;
  teacherMode?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  course,
  question,
  answer,
  onAnswerChange,
  onFlag,
  onEasier,
  onHarder,
  isSubmitted,
  isReplacing,
  teacherMode: _teacherMode = false
}) => {
  const [copied, setCopied] = useState(false);
  const [displayText, setDisplayText] = useState(question.text);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [isSimplified, setIsSimplified] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayText(question.text);
    setIsSimplified(false);
  }, [question]);

  const handleSimplify = async () => {
    if (isSimplified) {
      setDisplayText(question.text);
      setIsSimplified(false);
      return;
    }

    setIsSimplifying(true);
    const simple = await getSimplifiedText(question.text);
    setDisplayText(simple);
    setIsSimplifying(false);
    setIsSimplified(true);
  };

  // Keyboard shortcut logic for MCQ
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (question.type !== 'mcq' || isSubmitted || isReplacing) return;

      // Ignore if user is typing in an input/textarea (though rare for MCQ view)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      const indices: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

      if (key in indices && question.options && question.options[indices[key]]) {
        onAnswerChange(question.options[indices[key]]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question, isSubmitted, isReplacing, onAnswerChange]);

  const handleCopy = async () => {
    // Legacy support (Plain Text)
    const plainTextQuestion = question.text.replace(/<[^>]*>?/gm, '');
    let plainContent = `Question: ${plainTextQuestion}\n`;
    if (question.type === 'mcq' && question.options) {
      plainContent += '\n';
      question.options.forEach((opt, idx) => {
        plainContent += `${String.fromCharCode(65 + idx)}) ${opt.replace(/<[^>]*>?/gm, '')}\n`;
      });
    }

    // Rich Support
    try {
      let htmlContent = "";
      // Grab rendered HTML if available
      if (contentRef.current) {
        // Clone to avoid modifying DOM
        const clone = contentRef.current.cloneNode(true) as HTMLElement;
        // Basic cleanup of clone if needed (remove buttons?)
        // The contentRef wraps the question text and options area, which contains buttons like "Simplify" 
        // We might want to remove them.
        const tools = clone.querySelectorAll('button, .exclude-from-copy');
        tools.forEach(el => el.remove());
        htmlContent = clone.innerHTML;
      } else {
        // Fallback manual HTML construction
        htmlContent = `<div><p><strong>Question:</strong></p><div>${question.text}</div></div>`;
      }

      // Clipboard Item
      const data = [new ClipboardItem({
        'text/plain': new Blob([plainContent], { type: 'text/plain' }),
        'text/html': new Blob([htmlContent], { type: 'text/html' })
      })];

      await navigator.clipboard.write(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
      // Fallback to simple text copy
      navigator.clipboard.writeText(plainContent).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const getSubjectTheme = (c: CourseType) => {
    if (c === 'Custom Practice') return { bg: 'bg-indigo-600', text: 'text-indigo-900 dark:text-indigo-250', border: 'border-indigo-600 dark:border-indigo-500', pale: 'bg-indigo-50 dark:bg-indigo-950/20', hover: 'hover:border-indigo-200 dark:hover:border-indigo-850' };
    if (c.includes('Chemistry')) return { bg: 'bg-violet-600', text: 'text-violet-900 dark:text-violet-250', border: 'border-violet-600 dark:border-violet-500', pale: 'bg-violet-50 dark:bg-violet-950/20', hover: 'hover:border-violet-200 dark:hover:border-violet-850' };
    if (c.includes('Physics') && !c.includes('Physical Science')) return { bg: 'bg-cyan-600', text: 'text-cyan-900 dark:text-cyan-250', border: 'border-cyan-600 dark:border-cyan-500', pale: 'bg-cyan-50 dark:bg-cyan-950/20', hover: 'hover:border-cyan-200 dark:hover:border-cyan-850' };
    if (c.includes('Environmental')) return { bg: 'bg-teal-600', text: 'text-teal-900 dark:text-teal-250', border: 'border-teal-600 dark:border-teal-500', pale: 'bg-teal-50 dark:bg-teal-950/20', hover: 'hover:border-teal-200 dark:hover:border-teal-850' };
    if (c.includes('Middle School')) return { bg: 'bg-amber-500', text: 'text-amber-900 dark:text-amber-250', border: 'border-amber-500 dark:border-amber-500', pale: 'bg-amber-50 dark:bg-amber-950/20', hover: 'hover:border-amber-200 dark:hover:border-amber-850' };
    // Electives (Physical Science, Anatomy, Marine, Biotech, Forensics)
    if (['Physical Science', 'Anatomy and Physiology', 'Marine Biology', 'Biotechnology', 'Forensic Science'].includes(c)) {
      return { bg: 'bg-slate-500', text: 'text-slate-900 dark:text-slate-200', border: 'border-slate-500 dark:border-slate-500', pale: 'bg-slate-100 dark:bg-slate-800/40', hover: 'hover:border-slate-300 dark:hover:border-slate-700' };
    }
    // Biology
    return { bg: 'bg-emerald-600', text: 'text-emerald-900 dark:text-emerald-250', border: 'border-emerald-600 dark:border-emerald-500', pale: 'bg-emerald-50 dark:bg-emerald-950/20', hover: 'hover:border-emerald-200 dark:hover:border-emerald-850' };
  };

  const theme = getSubjectTheme(course);

  const getBadgeText = (c: CourseType) => {
    if (c === 'Custom Practice') return 'Custom Topic';
    if (c.includes('AP')) return 'Advanced Placement';
    if (c.includes('Honors')) return 'Honors';
    if (c.includes('Middle School')) return 'Middle School';
    if (c.includes('Environmental') && !c.includes('AP')) return 'Environmental';
    if (['Anatomy and Physiology', 'Marine Biology', 'Biotechnology', 'Forensic Science', 'Physical Science'].includes(c)) return 'HS Elective';
    return 'General';
  };

  const badgeText = getBadgeText(course);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all relative">
      {isReplacing && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4 animate-in fade-in duration-300">
          <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-slate-500 rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Generating better question...</p>
        </div>
      )}

      <div className="bg-slate-50/50 dark:bg-slate-950/30 px-6 py-4 border-b border-slate-100 dark:border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-4 items-center flex-1">
          <span className={`${theme.bg} text-white font-black px-4 py-1.5 rounded-xl text-xs shrink-0 shadow-sm`}>{badgeText}</span>
          <span className={`text-[9px] font-black uppercase tracking-widest ${question.type === 'error_correction' ? 'text-rose-500' : 'text-slate-400'}`}>
            {question.subType === 'analogy' ? 'Analogy Challenge' :
              question.subType === 'odd_one_out' ? 'Odd One Out' :
                question.subType === 'error' ? 'Error Detection' :
                  question.type === 'mcq' ? 'Multiple Choice' :
                    question.type === 'fill_in_blank' ? 'Fill in the Blank' :
                      question.type === 'sa' ? 'Short Answer' : 'Error Catcher'}
          </span>
        </div>

        {!isSubmitted && (
          <div className="flex items-center gap-2">
            {onEasier && (
              <button
                onClick={onEasier}
                title="Make it easier"
                className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border border-transparent hover:border-emerald-200"
              >
                <span className="text-xs font-bold uppercase tracking-wide">Easier</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              </button>
            )}
            {onHarder && (
              <button
                onClick={onHarder}
                title="Make it harder"
                className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-200"
              >
                <span className="text-xs font-bold uppercase tracking-wide">Harder</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              </button>
            )}
            <div className="h-4 w-px bg-slate-300 mx-1"></div>

            {/* COPY BUTTON */}
            <button
              onClick={handleCopy}
              title="Copy Question to Clipboard"
              className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-200"
            >
              {copied ? (
                <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              )}
              <span className={`text-xs font-bold uppercase tracking-wide ${copied ? 'text-emerald-500' : ''}`}>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <div className="h-4 w-px bg-slate-300 mx-1"></div>

            <button
              onClick={onFlag}
              title="Replace with a new question"
              className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all border border-transparent hover:border-slate-200 group"
            >
              <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wide">Replace</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-8" ref={contentRef}>
        <div className="mb-8 relative">
          {question.type === 'error_correction' && (
            <div className="inline-block bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-350 px-3 py-1 rounded-lg text-xs font-bold mb-4 border border-rose-100 dark:border-rose-900/40">
              ⚠️ Find and correct the error in this statement
            </div>
          )}
          <div className="flex items-start gap-4">
            <div className="flex-1 text-slate-800 dark:text-slate-200">
              <div className={`text-xl font-bold leading-snug ${isSimplified ? 'font-serif' : ''}`}>
                <MarkdownRenderer
                  content={isSimplified ? cleanHtml(displayText) : cleanHtml(displayText)}
                  components={QUESTION_PARAGRAPHS}
                />
              </div>
              {isSimplified && <span className="inline-block mt-2 text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded">✨ Simplified Text</span>}
            </div>
 
            <div className="flex flex-col gap-2 shrink-0 exclude-from-copy">
              <TTSButton text={cleanHtml(displayText)} />
 
              <button
                onClick={handleSimplify}
                disabled={isSimplifying}
                className={`p-2 rounded-lg transition-all ${isSimplified ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-400'}`}
                title={isSimplified ? "Show Original" : "Simplify Text"}
              >
                {isSimplifying ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
 
        {question.type === 'mcq' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options?.map((opt, oIdx) => (
              <button
                key={oIdx}
                disabled={isSubmitted || isReplacing}
                onClick={() => onAnswerChange(opt)}
                className={`p-4 rounded-xl border-2 text-left transition-all font-semibold flex items-center group ${answer === opt
                  ? `${theme.border} ${theme.pale} ${theme.text} shadow-md`
                  : `border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 ${theme.hover} hover:bg-slate-50 dark:hover:bg-slate-850/40`
                  } ${isSubmitted || isReplacing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="inline-block w-8 h-8 rounded-lg text-center leading-8 mr-3 font-bold transition-colors shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {String.fromCharCode(65 + oIdx)}
                </div>
                <div className="flex-1">
                  <MarkdownRenderer
                    content={cleanHtml(opt)}
                    components={INLINE_PARAGRAPHS}
                  />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="exclude-from-copy">
            <ResponseEditor
              key={question.id} /* FORCE REMOUNT ON QUESTION CHANGE */
              value={answer}
              onChange={onAnswerChange}
              disabled={isSubmitted || isReplacing}
              placeholder={question.type === 'error_correction' ? "Identify the error and explain the correction..." : "Draft your explanation here..."}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;