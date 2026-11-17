import React, { useRef, useState } from 'react';
import MarkdownRenderer, { INLINE_PARAGRAPHS } from './MarkdownRenderer';
import DataChart from './DataChart';
import { CourseType, Question } from '../types';
import { cleanHtml } from '../utils/sanitize';

interface WorksheetViewProps {
  course: CourseType;
  topic: string;
  questions: Question[];
  onBack: () => void;
  onRefresh: () => void;
  mode?: 'worksheet' | 'exit_ticket' | 'frq' | 'cer' | 'calculation';
}

const getPrintStyles = (isExitTicket: boolean) => `
  @page {
    size: ${isExitTicket ? 'A5' : 'A4'};
    margin: ${isExitTicket ? '10mm' : '20mm'};
  }
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-break {
      break-before: page;
    }
  }
`;

const WorksheetView: React.FC<WorksheetViewProps> = ({ course, topic, questions, onBack, onRefresh, mode = 'worksheet' }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [additionalVersions, setAdditionalVersions] = useState<{ label: string; questions: Question[] }[]>([]);
  const [isClassSetMode, setIsClassSetMode] = useState(false);
  const [versionCount, setVersionCount] = useState(2);
  const [scrambleConfig, setScrambleConfig] = useState({ questions: true, options: true });
  const [showAnswerKey, setShowAnswerKey] = useState(true);

  const isExitTicket = mode === 'exit_ticket';
  const containerClass = isExitTicket
    ? "max-w-[148mm] mx-auto bg-white shadow-xl min-h-[210mm] p-[10mm] print:shadow-none print:w-full print:max-w-none print:m-0 break-after-page"
    : "max-w-[210mm] mx-auto bg-white shadow-xl min-h-[297mm] p-[15mm] print:shadow-none print:w-full print:max-w-none print:m-0 break-after-page";

  const shuffle = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const generateClassSet = (count: number) => {
    const labels = ['B', 'C', 'D']; // A is original
    const newVersions: { label: string; questions: Question[] }[] = [];

    // Generate B, C, D... up to count-1 (since A is count 1)
    for (let i = 0; i < count - 1; i++) {
      const label = labels[i];
      // 1. Scramble Questions if enabled
      let questionsToUse = scrambleConfig.questions ? shuffle(questions) : [...questions];

      const shuffledQs = questionsToUse.map(q => {
        if (q.type === 'mcq' && q.options) {
          // 2. Scramble Options if enabled
          const shuffledOptions = scrambleConfig.options ? shuffle(q.options) : [...q.options];
          return {
            ...q,
            id: `${q.id}-${label}`,
            options: shuffledOptions
          };
        }
        return { ...q, id: `${q.id}-${label}` };
      });
      newVersions.push({ label: `Version ${label}`, questions: shuffledQs });
    }

    setAdditionalVersions(newVersions);
    setIsClassSetMode(true);
    setVersionCount(count);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportDocx = () => {
    const header = `<!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>`;
    const footer = "</body></html>";
    const sourceHTML = header + (document.getElementById("worksheet-content")?.innerHTML || "") + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${course.replace(/ /g, '_')}_${topic.replace(/ /g, '_')}_Worksheet.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('course', course);
    url.searchParams.set('topic', topic);
    url.searchParams.set('mode', 'worksheet');
    navigator.clipboard.writeText(url.toString()).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-400 font-bold animate-pulse">Designing Worksheet...</div>
      </div>
    );
  }

  // Helper to render exhibits (graphs/tables) for a question
  const renderExhibits = (q: Question) => {
    if (!q.exhibits || q.exhibits.length === 0) return null;
    return (
      <div className="my-4 space-y-6">
        {q.exhibits.map((exhibit, idx) => (
          <div key={idx} className="border border-gray-300 rounded p-4 break-inside-avoid">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 text-center">
              {exhibit.type === 'table' ? 'Table' : 'Figure'} {idx + 1}: {exhibit.title}
            </p>
            <div className="flex justify-center">
              <div className="w-full max-w-[500px]">
                {exhibit.type === 'graph' && exhibit.chartData ? (
                  <DataChart config={exhibit.chartData} />
                ) : (
                  <MarkdownRenderer content={cleanHtml(exhibit.content)} />
                )}
              </div>
            </div>
            {exhibit.caption && (
              <div className="mt-2 text-xs italic text-center text-gray-600 px-4">
                {exhibit.caption}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderWorksheetContent = (qs: Question[], titleSuffix: string = "") => {
    const mcqs = qs.filter(q => q.type === 'mcq');
    const sas = qs.filter(q => q.type !== 'mcq');

    return (
      <div className={containerClass}>
        {/* Header */}
        <header className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-black mb-1">{course} {titleSuffix}</h1>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-widest">{topic}</p>
          </div>
          <div className="text-right">
            <div className="w-64 border-b border-black mb-2"></div>
            <p className="text-xs uppercase font-bold text-gray-500">Name</p>
          </div>
        </header>

        <div className="space-y-8">
          {/* Multiple Choice Section */}
          {mcqs.length > 0 && (
            <section>
              <h2 className="text-lg font-bold border-b border-gray-300 mb-4 pb-1">Part I: Multiple Choice</h2>
              <div className="space-y-6">
                {mcqs.map((q, i) => (
                  <div key={q.id} className="break-inside-avoid">
                    {/* Section Title (for test creator) */}
                    {q.sectionTitle && (i === 0 || mcqs[i-1]?.sectionTitle !== q.sectionTitle) && (
                      <h3 className="text-md font-bold text-slate-700 mb-3 mt-6 first:mt-0">
                        {q.sectionTitle}
                      </h3>
                    )}
                    {renderExhibits(q)}
                    <div className="flex gap-2 mb-2">
                      <span className="font-bold">{i + 1}.</span>
                      <div className="text-sm w-full">
                        <MarkdownRenderer
                          content={cleanHtml(q.text)}
                          components={INLINE_PARAGRAPHS}
                        />
                      </div>
                    </div>
                    <div className="pl-6 grid grid-cols-1 gap-y-1">
                      {q.options?.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-start gap-2 text-sm w-full">
                          <div className="w-4 h-4 rounded-full border border-black flex items-center justify-center text-[8px] shrink-0 mt-0.5">
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <MarkdownRenderer
                            content={cleanHtml(opt)}
                            components={INLINE_PARAGRAPHS}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Short Answer / FRQ Section */}
          {sas.length > 0 && (
            <section>
              <h2 className="text-xl font-black border-b-2 border-slate-900 mb-6 pb-2 mt-8 uppercase tracking-wide">
                Part II: Constructed Response
                <span className="block text-xs text-slate-500 font-normal normal-case mt-1">
                  Answer the following questions in the space provided. Show all work for calculations.
                </span>
              </h2>
              <div className="space-y-12">
                {sas.map((q, i) => (
                  <div key={q.id} className="break-inside-avoid">
                    {/* Section Title (for test creator) */}
                    {q.sectionTitle && (i === 0 || sas[i-1]?.sectionTitle !== q.sectionTitle) && (
                      <h3 className="text-lg font-bold text-slate-800 mb-4 mt-8 first:mt-0">
                        {q.sectionTitle}
                      </h3>
                    )}

                    {/* Scenario Box */}
                    {q.scenario && (
                      <div className="mb-6 p-6 bg-slate-50 border-2 border-slate-200 rounded-xl relative">
                        <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold uppercase tracking-widest text-slate-400">Context</div>
                        <div className="text-sm leading-relaxed text-slate-700 italic font-serif" dangerouslySetInnerHTML={{ __html: cleanHtml(q.scenario) }} />
                      </div>
                    )}

                    {renderExhibits(q)}

                    {/* Question Stem */}
                    <div className="flex gap-4 mb-4 items-start">
                      <span className="font-black text-lg min-w-[1.5rem]">{mcqs.length + i + 1}.</span>
                      <div className="text-base w-full font-medium leading-relaxed pt-0.5">
                        <MarkdownRenderer
                          content={cleanHtml(q.text)}
                          components={INLINE_PARAGRAPHS}
                        />
                      </div>
                    </div>

                    {/* Sub-Questions or Default Lines */}
                    {q.subQuestions ? (
                      <div className="pl-4 md:pl-10 space-y-6">
                        {q.subQuestions.map((sq, sqIdx) => (
                          <div key={sqIdx} className="w-full">
                            <div className="flex gap-3 mb-2">
                              <span className="font-bold text-slate-500">({String.fromCharCode(97 + sqIdx)})</span>
                              <div className="text-sm font-semibold text-slate-800">
                                <span dangerouslySetInnerHTML={{ __html: cleanHtml(sq) }} />
                              </div>
                            </div>
                            {/* Writing Lines */}
                            <div className="bg-[linear-gradient(to_bottom,transparent_23px,#e2e8f0_24px)] bg-[length:100%_24px] h-36 w-full border-b border-slate-200"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pl-4 md:pl-10">
                        {/* Box style writing area for single questions */}
                        <div className="bg-[linear-gradient(to_bottom,transparent_27px,#e2e8f0_28px)] bg-[length:100%_28px] h-64 w-full border-b border-slate-200"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          Science Practice Partner • Generated Worksheet {titleSuffix}
        </div>
      </div>
    );
  };

  const renderAnswerKey = (qs: Question[], titleSuffix: string = "") => {
    const mcqs = qs.filter(q => q.type === 'mcq');

    return (
      <div className="break-inside-avoid mb-8">
        <h3 className="font-bold text-lg mb-2 text-slate-700 bg-slate-100 p-2 rounded">Answer Key {titleSuffix}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {mcqs.map((q, i) => {
            const correctIndex = q.options?.findIndex(opt => opt === q.correctAnswer);
            const letter = correctIndex !== undefined && correctIndex > -1 ? String.fromCharCode(65 + correctIndex) : null;

            return (
              <div key={q.id} className="flex gap-2 items-center">
                <span className="font-bold text-slate-500">{i + 1}.</span>
                {letter ? (
                  <span className="text-slate-900 font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded">{letter}</span>
                ) : (
                  <span className="text-gray-400 italic">--</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col print:bg-white print:block">
      <style>{getPrintStyles(isExitTicket)}</style>

      {/* Control Bar */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-lg flex justify-between items-center print:hidden">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Back
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Science Practice Partner</p>
            <h2 className="text-lg font-bold leading-none text-white">{course} Worksheet Generator</h2>
          </div>
        </div>
        <div className="flex gap-4 flex-wrap justify-end items-center">
          {!isClassSetMode ? (
            <>
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 mr-4">
                <label className="flex items-center gap-2 px-2 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAnswerKey}
                    onChange={(e) => setShowAnswerKey(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Answer Key</span>
                </label>
              </div>

              <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 mr-4">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 px-2">Scramble:</span>
                <button
                  onClick={() => setScrambleConfig(prev => ({ ...prev, questions: !prev.questions }))}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${scrambleConfig.questions ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
                >
                  Questions
                </button>
                <button
                  onClick={() => setScrambleConfig(prev => ({ ...prev, options: !prev.options }))}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${scrambleConfig.options ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'}`}
                >
                  Options
                </button>
              </div>

              <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 px-2">Versions:</span>
                {[2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => generateClassSet(num)}
                    className="px-3 py-1.5 rounded-md text-xs font-bold bg-slate-700 hover:bg-indigo-600 hover:text-white transition-all text-slate-300"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 bg-indigo-900/50 border border-indigo-500/30 rounded-lg px-3 py-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Generated {versionCount} Versions</span>
              <button onClick={() => setIsClassSetMode(false)} className="ml-2 text-xs text-indigo-200 hover:text-white underline">Reset</button>
            </div>
          )}

          <button onClick={handleShare} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors" title="Share Link">
            {linkCopied ? <span className="text-xs font-bold text-emerald-400 animate-pulse">Copied!</span> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
          </button>
          <button onClick={onRefresh} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-bold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            New Questions
          </button>
          <button onClick={handleExportDocx} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export to Word
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-900/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Save as PDF / Print
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 print:p-0 overflow-y-auto">
        <div ref={contentRef} id="worksheet-content">
          {/* Always render Version A */}
          {renderWorksheetContent(questions, isClassSetMode ? "(Version A)" : "")}

          {/* Render Additional Versions */}
          {isClassSetMode && additionalVersions.length > 0 && (
            <>
              {additionalVersions.map((ver, idx) => (
                <React.Fragment key={idx}>
                  <div className="break-before-page"></div>
                  {renderWorksheetContent(ver.questions, `(${ver.label})`)}
                </React.Fragment>
              ))}
            </>
          )}

          {/* Answer Keys Page */}
          {showAnswerKey && (
            <>
              {isClassSetMode ? (
                <>
                  <div className="break-before-page"></div>
                  <div className="max-w-[210mm] mx-auto bg-white shadow-xl min-h-[297mm] p-[15mm] print:shadow-none print:w-full print:max-w-none print:m-0">
                    <h1 className="text-3xl font-black text-center mb-10">Teacher Answer Keys</h1>

                    {renderAnswerKey(questions, "(Version A)")}

                    {additionalVersions.map((ver, _idx) => (
                      renderAnswerKey(ver.questions, `(${ver.label})`)
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="break-before-page"></div>
                  <div className="max-w-[210mm] mx-auto bg-white shadow-xl p-[15mm] print:shadow-none print:w-full print:max-w-none print:m-0">
                    <h1 className="text-xl font-bold mb-6">Answer Key</h1>
                    {renderAnswerKey(questions)}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div >
  );
};

export default WorksheetView;
