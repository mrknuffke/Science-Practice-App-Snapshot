import React from 'react';
import { ChatMessage } from '../types';
import { StudentTools } from './StudentTools';
import { useSimplify } from '../hooks/useSimplify';
import { cleanHtml } from '../utils/sanitize';

interface ExplanationMessageProps {
  message: ChatMessage;
  theme: {
    bg: string;
    text: string;
    border: string;
    bubble: string;
    userBubble: string;
  };
}

export const ExplanationMessage: React.FC<ExplanationMessageProps> = ({ message, theme: _theme }) => {
  // Only AI messages (model) support tools
  const isModel = message.role === 'model';

  // Always call hook, but only meaningful if model
  const { displayText, isSimplifying, isSimplified, toggleSimplify } = useSimplify(message.text);

  const contentToRender = isModel && isSimplified ? displayText : message.text;

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600 dark:text-[#818CF8]">$1</code>');
  };

  const parseMessage = (text: string) => {
    const lines = text.split('\n');
    const processedLines = lines.map(line => {
      const l = line.trimEnd();
      if (l.startsWith('### ')) return `<h3 class="font-black text-sm mt-3 mb-1 text-slate-900 dark:text-[#F8F9FB]">${formatInline(l.substring(4))}</h3>`;
      if (l.startsWith('## ')) return `<h2 class="font-black text-base mt-4 mb-2 text-slate-900 dark:text-[#F8F9FB]">${formatInline(l.substring(3))}</h2>`;

      const listMatch = l.match(/^\s*[-*]\s+(.*)$/);
      if (listMatch) return `<div class="flex gap-2 ml-1 mt-1"><span class="opacity-50 mt-1.5 text-[6px] shrink-0">●</span><span>${formatInline(listMatch[1])}</span></div>`;

      const numMatch = l.match(/^\s*(\d+)\.\s+(.*)$/);
      if (numMatch) return `<div class="flex gap-2 ml-1 mt-1"><span class="font-bold text-xs mt-0.5 shrink-0 text-slate-400">${numMatch[1]}.</span><span>${formatInline(numMatch[2])}</span></div>`;

      if (!l.trim()) return '<div class="h-2"></div>';
      return `<div class="mb-1">${formatInline(l)}</div>`;
    });
    return processedLines.join('');
  };

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] p-5 rounded-3xl shadow-sm text-sm leading-relaxed relative group ${
          message.role === 'user'
            ? 'bg-indigo-600 dark:bg-[#818CF8] text-white dark:text-slate-900 rounded-tr-none whitespace-pre-wrap'
            : 'bg-white dark:bg-[#1E212A] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800/80 rounded-tl-none'
        }`}
      >
        <span className="block text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">
          {message.role === 'user' ? 'You' : 'AI Tutor'}
        </span>

        {isModel ? (
          <>
            {/* Tools for AI Message */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <StudentTools
                text={contentToRender}
                onSimplify={toggleSimplify}
                isSimplified={isSimplified}
                isSimplifying={isSimplifying}
                className="scale-90 origin-top-right bg-white/95 dark:bg-[#12141C]/95 backdrop-blur rounded-xl shadow-md border border-slate-100 dark:border-slate-800/50 p-1"
              />
            </div>
            <div dangerouslySetInnerHTML={{ __html: cleanHtml(parseMessage(contentToRender)) }}></div>
          </>
        ) : (
          message.text
        )}
      </div>
    </div>
  );
};
