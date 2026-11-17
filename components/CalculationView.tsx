import React, { useState, useRef, useEffect } from 'react';
import { CourseType, ChatMessage } from '../types';
import FileUpload from './FileUpload';
import MarkdownRenderer from './MarkdownRenderer';
import { Camera, Download, X, FileText, Calculator, Wand2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import DataChart, { GraphConfig } from './DataChart';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DesmosCalculatorModal from './DesmosCalculatorModal';
import { ScienceBuddyMascot } from './ScienceBuddyMascot';
import { FactualAccuracyIndicator } from './FactualAccuracyIndicator';
import { TTSButton } from './TTSButton';
import SEO from './SEO';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useDialog } from '../hooks/useDialog';

interface CalculationViewProps {
  course: CourseType;
  topic: string; // Initially might be empty if user uploads a problem
  history: ChatMessage[];
  onSendMessage: (msg: string, role?: 'user' | 'model', image?: string) => Promise<void>;
  onFinish: () => void;
  onQuit: () => void;
  isLoading: boolean;
  onShareLink?: () => void;
  isStudySprint?: boolean;
  onStartFreshSession?: () => void;
}

const CalculationView: React.FC<CalculationViewProps> = ({
  course,
  topic,
  history,
  onSendMessage,
  onFinish,
  onQuit,
  isLoading,
  onShareLink,
  isStudySprint = false,
  onStartFreshSession
}) => {
  const [input, setInput] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const uploadDialog = useDialog({ onClose: () => setShowUploadModal(false), labelledBy: 'calc-upload-title', open: showUploadModal });
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);

  const { isListening, hasSpeechSupport, toggleListening } = useSpeechRecognition({
    value: input,
    onChange: setInput,
    onUnsupported: () => alert('Dictation not supported.'),
    onStart: () => inputRef.current?.focus(),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [history, isLoading]);
  useEffect(() => { if (!isLoading) inputRef.current?.focus(); }, [isLoading, history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input, 'user', undefined);
      setInput('');
    }
  };

  const handleFileSelect = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setShowUploadModal(false);

    if (file.size > 5 * 1024 * 1024) {
      alert("Image file is too large. Please use an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const prompt = "I have uploaded an image. Please verify it and help me solve the math or science calculation within it.";
      onSendMessage(prompt, 'user', base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSession = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `calculation_session_${timestamp}.md`;

    const content = history.map(msg => {
      return `**${msg.role === 'user' ? 'User' : 'Math Tutor'}**: \n\n${msg.text}\n\n---\n`;
    }).join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const chatContainer = messagesEndRef.current?.parentElement;
    if (!chatContainer) return;

    try {
      const canvas = await html2canvas(chatContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#12141C' : '#F8F9FB'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`calculation_session_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
      alert("Could not generate PDF. Please try the Markdown export instead.");
    }
  };

  const getThemeColors = (c: CourseType) => {
    if (c.includes('Physics')) return { bg: 'bg-coral dark:bg-coral', text: 'text-rose-900 dark:text-coral', border: 'border-coral dark:border-coral', bubble: 'bg-rose-50 dark:bg-rose-950/20', userBubble: 'bg-coral dark:bg-coral' };
    if (c.includes('Chemistry')) return { bg: 'bg-skyBlue dark:bg-skyBlue', text: 'text-sky-900 dark:text-sky-350', border: 'border-skyBlue dark:border-skyBlue', bubble: 'bg-sky-50 dark:bg-sky-950/20', userBubble: 'bg-skyBlue dark:bg-skyBlue' };
    return { bg: 'bg-indigo-600 dark:bg-[#818CF8]', text: 'text-indigo-950 dark:text-indigo-300', border: 'border-indigo-600 dark:border-[#818CF8]', bubble: 'bg-indigo-50 dark:bg-indigo-950/20', userBubble: 'bg-indigo-600 dark:bg-[#818CF8]' };
  };

  const _theme = getThemeColors(course);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#12141C] text-slate-800 dark:text-[#F8F9FB] flex flex-col h-screen overflow-hidden transition-colors duration-300">
      <SEO title={`Calculations: ${topic === 'Math Helper' ? 'Math Helper' : topic}`} />
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

          {/* Inline Live Mascot Integration */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 select-none">
              <ScienceBuddyMascot size={32} mood={isLoading ? "thinking" : "happy"} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Step-by-Step Math Partner</p>
              <h2 className="text-sm md:text-base font-black text-slate-800 dark:text-white leading-none font-rounded">
                {topic === 'Math Helper' ? "Calculation Partner" : `${course} Calculation Partner`}
              </h2>
            </div>
          </div>
        </div>

        {/* Action Tray */}
        <div className="flex items-center gap-3">
          <FactualAccuracyIndicator
            course={course}
            topic={topic}
            turnCount={Math.round(history.length / 2)}
            onStartFreshSession={onStartFreshSession}
          />
          {onShareLink && (
            <button
              onClick={() => {
                onShareLink();
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
              className="p-2 text-slate-450 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-[#818CF8] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
              title="Share Link"
            >
              {linkCopied ? (
                <span className="absolute top-full right-0 mt-1 text-[9px] font-bold text-emerald-500 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-1.5 py-0.5 rounded shadow whitespace-nowrap animate-pulse">Copied!</span>
              ) : null}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
          )}
          <button
            onClick={handleSaveSession}
            className="p-2 text-slate-450 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-[#818CF8] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Download Markdown"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowCalculatorModal(true)}
            className="p-2 text-slate-450 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-[#818CF8] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Scientific Calculator"
          >
            <Calculator className="w-5 h-5" />
          </button>
          <button
            onClick={handleExportPDF}
            className="p-2 text-slate-450 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Export PDF"
          >
            <FileText className="w-5 h-5" />
          </button>
          <button
            onClick={onFinish}
            disabled={isLoading}
            className="btn-squishy hidden md:block px-5 py-2.5 rounded-2xl font-black text-xs text-white shadow-md bg-indigo-600 hover:bg-indigo-500 dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 disabled:opacity-50"
          >
            End Session 🚀
          </button>
        </div>
      </header>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
        <div className="max-w-3xl mx-auto space-y-6 pb-8">
          {history.length === 0 && !isLoading && (
            isStudySprint ? (
              <div className="bento-card border border-dashed border-slate-300 dark:border-slate-700 py-16 text-center flex flex-col items-center justify-center gap-6">
                <div className="text-4xl select-none">🎯</div>
                <div className="max-w-md">
                  <h4 className="text-lg font-black text-slate-800 dark:text-white font-rounded">Ready to calculate!</h4>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Get started by choosing to receive a targeted practice problem or upload your own notes / question outline!
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => onSendMessage('Give me a practice problem on this topic.', 'user')}
                    disabled={isLoading}
                    className="btn-squishy bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 px-6 py-3.5 text-xs font-black shadow-lg shadow-indigo-900/10"
                  >
                    🎯 Give me a practice problem
                  </button>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="btn-squishy bg-slate-700 hover:bg-slate-600 text-white dark:bg-slate-800 dark:hover:bg-slate-750 dark:border dark:border-slate-700 px-6 py-3.5 text-xs font-black shadow"
                  >
                    📤 Upload a problem
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-450 dark:text-slate-500 text-xs font-bold mt-10 p-8 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-3xl">
                <p className="mb-2 text-lg font-black text-slate-755 dark:text-white font-rounded">👋 Ready to calculate!</p>
                <p>Type your scientific calculation problem or ask for a custom practice question.</p>
              </div>
            )
          )}

          {history.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div
                className={`max-w-[85%] md:max-w-[75%] p-5 rounded-3xl shadow-sm text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 dark:bg-[#818CF8] text-white dark:text-slate-900 rounded-tr-none whitespace-pre-wrap'
                    : 'bg-white dark:bg-[#1E212A] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800/80 rounded-tl-none'
                }`}
              >
                <span className="block text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">
                  {msg.role === 'user' ? 'You' : 'Math Tutor'}
                </span>
                {(() => {
                  const chartRegex = /```json:chart([\s\S]*?)```/g;
                  const parts = [];
                  let lastIndex = 0;
                  let match;

                  while ((match = chartRegex.exec(msg.text)) !== null) {
                    if (match.index > lastIndex) {
                      parts.push(
                        <MarkdownRenderer key={`text-${lastIndex}`} content={msg.text.substring(lastIndex, match.index)} className="prose prose-sm max-w-none dark:prose-invert" />
                      );
                    }

                    try {
                      const jsonStr = match[1];
                      const config = JSON.parse(jsonStr) as GraphConfig;
                      parts.push(
                        <div key={`chart-${match.index}`} className="my-4">
                          <DataChart config={config} />
                        </div>
                      );
                    } catch (e) {
                      parts.push(<div key={`err-${match.index}`} className="text-red-500 text-xs">Error parsing chart</div>);
                    }

                    lastIndex = chartRegex.lastIndex;
                  }

                  if (lastIndex < msg.text.length) {
                    parts.push(
                      <MarkdownRenderer key={`text-${lastIndex}`} content={msg.text.substring(lastIndex)} className="prose prose-sm max-w-none dark:prose-invert" />
                    );
                  }

                  return parts.length > 0 ? parts : <MarkdownRenderer content={msg.text} className="prose prose-sm max-w-none dark:prose-invert" />;
                })()}

                {msg.role !== 'user' && (
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <TTSButton text={msg.text} label="Listen" className="text-xs" />
                    <button
                      type="button"
                      onClick={() => onSendMessage('Could you explain that in simpler terms with a step-by-step breakdown?', 'user')}
                      disabled={isLoading}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 transition-colors"
                      title="Request a simpler explanation"
                    >
                      <Wand2 className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                      <span>Explain Simpler</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
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

      {/* Quick Scaffolding Levers */}
      {history.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 px-4 py-2 shrink-0 z-10">
          <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Scaffolding:
            </span>
            <button
              type="button"
              onClick={() => onSendMessage('Can you break this down into smaller, simpler steps?', 'user')}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs rounded-lg transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1 font-semibold"
            >
              <Wand2 className="w-3 h-3 text-indigo-500" />
              <span>Simpler Steps</span>
            </button>
            <button
              type="button"
              onClick={() => onSendMessage('Can you give me an easier, introductory version of this calculation problem?', 'user')}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1 font-semibold"
            >
              <ArrowDownCircle className="w-3 h-3 text-emerald-500" />
              <span>Easier Problem</span>
            </button>
            <button
              type="button"
              onClick={() => onSendMessage('Can you give me a more challenging, advanced version of this calculation problem?', 'user')}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs rounded-lg transition-colors border border-amber-200 dark:border-amber-800/50 flex items-center gap-1 font-semibold"
            >
              <ArrowUpCircle className="w-3 h-3 text-amber-500" />
              <span>Harder Problem</span>
            </button>
          </div>
        </div>
      )}

      {/* Input Visor Panel */}
      <div className="bg-white dark:bg-[#1E212A] border-t border-slate-200 dark:border-slate-800/80 p-4 shrink-0 z-20 transition-colors duration-300">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative flex items-start gap-2.5">
          {/* Upload Button */}
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-indigo-600 dark:hover:text-[#818CF8] border border-slate-200 dark:border-slate-800/60 transition-colors flex items-center gap-2 group shrink-0"
            title="Upload Problem"
          >
            <Camera className="w-5 h-5" />
            <span className="hidden md:inline text-xs font-black font-rounded text-slate-500 group-hover:text-indigo-650 dark:group-hover:text-[#818CF8]">Upload Problem</span>
          </button>

          <div className="relative flex-1">
            <input aria-label="Your math problem"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Type your math problem here..."}
              disabled={isLoading}
              className={`w-full bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl pl-4 pr-12 py-3.5 focus:outline-none transition-all font-semibold text-sm ${
                isListening
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/20 placeholder-rose-400 text-rose-850 dark:text-rose-300'
                  : 'border-slate-200 dark:border-slate-800/60 focus:border-indigo-500 dark:focus:border-[#818CF8] text-slate-850 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500'
              }`}
            />
            {hasSpeechSupport && (
              <button aria-label={isListening ? 'Stop dictation' : 'Start dictation'}
                type="button"
                onClick={toggleListening}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                  isListening
                    ? 'text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 animate-pulse'
                    : 'text-slate-400 hover:text-slate-650 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
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
            className={`p-3.5 rounded-2xl transition-colors shadow-sm shrink-0 ${
              !input.trim() || isLoading
                ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                : 'bg-indigo-600 hover:bg-indigo-500 dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] text-white dark:text-slate-900 hover:opacity-90'
            }`}
          >
            <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>

      {/* Upload Problem Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div {...uploadDialog} className="bg-white dark:bg-[#1E212A] border border-slate-250 dark:border-slate-800 rounded-3xl shadow-xl w-full max-w-lg p-6 relative">
            <button aria-label="Close"
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 id="calc-upload-title" className="text-xl font-black text-slate-800 dark:text-white mb-1 font-rounded">Upload Problem</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Upload an image of your math equation or chemistry stoichiometry prompt.</p>

            <FileUpload
              onFilesSelected={handleFileSelect}
              maxFiles={1}
              accept="image/*,.pdf"
              label="Click to upload or drag and drop"
              subLabel="PDFs, text, and images of equations"
              allowMultiple={false}
            />

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-5 py-2 text-xs font-black text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors font-rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      {showCalculatorModal && (
        <DesmosCalculatorModal onClose={() => setShowCalculatorModal(false)} />
      )}
    </div>
  );
};

export default CalculationView;
