

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { GradingReport, Badge, CourseType } from '../types';
import { cleanHtml } from '../utils/sanitize';
import MarkdownRenderer, { INLINE_PARAGRAPHS, SPACED_PARAGRAPHS } from './MarkdownRenderer';
import MermaidDiagram from './MermaidDiagram';
import SEO from './SEO';
import { RubricDiffViewer } from './results/RubricDiffViewer';
import { useDialog } from '../hooks/useDialog';

interface ResultsViewProps {
  report: GradingReport;
  topic: string;
  course: CourseType;
  onRetry: () => void;
  onNewTopic: () => void;
  onChangeCourse: () => void;
  onGoHome: () => void;
}

const BadgeCard: React.FC<{ badge: Badge; innerRef?: React.Ref<HTMLDivElement> }> = ({ badge, innerRef }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative group perspective-1000 my-2">
        <div ref={innerRef} className="mx-auto rounded-[1.5rem] p-0.5 shadow-lg bg-white max-w-[240px]">
          <div className="rounded-[1.4rem] overflow-hidden p-3 text-center border-4" style={{ borderColor: badge.color }}>
            <div className="relative z-10">
              <div className="inline-block px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest mb-1 text-white" style={{ backgroundColor: badge.color }}>
                {badge.rarity}
              </div>
              <div className="text-6xl mb-3 drop-shadow-lg">{badge.emoji}</div>
              <h3 className="text-lg font-black text-slate-900 leading-tight mb-0.5">{badge.name}</h3>
              <p className="text-slate-500 text-[8px] italic leading-tight px-1">"{badge.description}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultsView: React.FC<ResultsViewProps> = ({ report, topic, course, onRetry, onNewTopic, onChangeCourse, onGoHome }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const shareDialog = useDialog({ onClose: () => setShowShareModal(false), labelledBy: 'results-share-title', open: showShareModal });
  const [copySuccess, setCopySuccess] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadBadge = async () => {
    if (!badgeRef.current) return;
    try {
      const element = badgeRef.current;
      // Use a significantly higher scale for high resolution
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 5,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Fix alignment in clone if necessary, usually scale works fine if layout is flex
          const clonedElement = clonedDoc.querySelector('[data-html2canvas-ignore]') as HTMLElement;
          if (clonedElement) clonedElement.style.display = 'none';
        }
      });

      // Create a large, high-res 1200x1200px canvas for the final output
      const finalSize = 1200;
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = finalSize;
      finalCanvas.height = finalSize;
      const ctx = finalCanvas.getContext('2d');

      if (ctx) {
        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalSize, finalSize);

        // Calculate scaling to fit nicely with a margin
        const padding = 150;
        const targetDrawSize = finalSize - (padding * 2);
        const scale = Math.min(targetDrawSize / canvas.width, targetDrawSize / canvas.height);

        const drawWidth = canvas.width * scale;
        const drawHeight = canvas.height * scale;

        // Center the image
        const x = (finalSize - drawWidth) / 2;
        const y = (finalSize - drawHeight) / 2;

        // Add a subtle drop shadow to the badge in the final image
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;

        ctx.drawImage(canvas, x, y, drawWidth, drawHeight);

        // Draw URL text at the bottom
        ctx.fillStyle = "#94a3b8"; // slate-400
        ctx.font = "bold 40px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("https://www.sciencepractice.app/", finalSize / 2, finalSize - 60);

        const link = document.createElement('a');
        link.download = `SciencePartner-Badge-HighRes.png`;
        link.href = finalCanvas.toDataURL('image/png', 1.0);
        link.click();
      }
    } catch (err) {
      console.error("Badge download failed", err);
      alert("Could not download badge. Please try again.");
    }
  };

  const generateReportSummary = () => {
    return `Science Practice Report 📊\nTopic: ${topic}\nScore: ${report.score}\n\nSummary: "${report.summary}"\n\nPracticed on Science Practice Partner`;
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(generateReportSummary()).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleEmailResults = () => {
    const subject = encodeURIComponent(`Science Practice Report: ${topic} - ${report.score}`);
    const body = encodeURIComponent(generateReportSummary());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleDownloadFullScreenshot = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => element.classList.contains('no-print')
      });
      const link = document.createElement('a');
      link.download = `Report-${topic.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (e) {
      alert("Screenshot failed. Please try printing to PDF instead.");
    }
  };

  // Helper to get theme colors similar to QuestionCard/App logic
  const getThemeColors = (c: CourseType) => {
    if (c === 'Custom Practice') return { bg: 'bg-indigo-900', text: 'text-indigo-200', border: 'border-indigo-100', accent: 'bg-indigo-600', hover: 'hover:bg-indigo-700', shadow: 'shadow-indigo-200', subBg: 'bg-indigo-50', subBorder: 'border-indigo-100', textMain: 'text-indigo-900', btnBg: 'bg-indigo-50', btnHover: 'hover:bg-indigo-100' };
    if (c.includes('Chemistry')) return { bg: 'bg-violet-900', text: 'text-violet-200', border: 'border-violet-100', accent: 'bg-violet-600', hover: 'hover:bg-violet-700', shadow: 'shadow-violet-200', subBg: 'bg-violet-50', subBorder: 'border-violet-100', textMain: 'text-violet-900', btnBg: 'bg-violet-50', btnHover: 'hover:bg-violet-100' };
    if (c.includes('Physics') && !c.includes('Physical Science')) return { bg: 'bg-cyan-900', text: 'text-cyan-200', border: 'border-cyan-100', accent: 'bg-cyan-600', hover: 'hover:bg-cyan-700', shadow: 'shadow-cyan-200', subBg: 'bg-cyan-50', subBorder: 'border-cyan-100', textMain: 'text-cyan-900', btnBg: 'bg-cyan-50', btnHover: 'hover:bg-cyan-100' };
    if (c.includes('Environmental')) return { bg: 'bg-teal-900', text: 'text-teal-200', border: 'border-teal-100', accent: 'bg-teal-600', hover: 'hover:bg-teal-700', shadow: 'shadow-teal-200', subBg: 'bg-teal-50', subBorder: 'border-teal-100', textMain: 'text-teal-900', btnBg: 'bg-teal-50', btnHover: 'hover:bg-teal-100' };
    if (c.includes('Middle School')) return { bg: 'bg-amber-500', text: 'text-amber-100', border: 'border-amber-100', accent: 'bg-amber-600', hover: 'hover:bg-amber-700', shadow: 'shadow-amber-200', subBg: 'bg-amber-50', subBorder: 'border-amber-100', textMain: 'text-amber-900', btnBg: 'bg-amber-50', btnHover: 'hover:bg-amber-100' };
    if (c.includes('Elementary School')) return { bg: 'bg-orange-600', text: 'text-orange-100', border: 'border-orange-100', accent: 'bg-orange-500', hover: 'hover:bg-orange-600', shadow: 'shadow-orange-200', subBg: 'bg-orange-50', subBorder: 'border-orange-100', textMain: 'text-orange-900', btnBg: 'bg-orange-50', btnHover: 'hover:bg-orange-100' };
    if (['Physical Science', 'Anatomy and Physiology', 'Marine Biology', 'Biotechnology', 'Forensic Science'].includes(c)) {
      return { bg: 'bg-slate-800', text: 'text-slate-200', border: 'border-slate-200', accent: 'bg-slate-600', hover: 'hover:bg-slate-700', shadow: 'shadow-slate-300', subBg: 'bg-slate-100', subBorder: 'border-slate-300', textMain: 'text-slate-900', btnBg: 'bg-slate-100', btnHover: 'hover:bg-slate-200' };
    }
    // Biology Default
    return { bg: 'bg-emerald-900', text: 'text-emerald-200', border: 'border-emerald-100', accent: 'bg-emerald-600', hover: 'hover:bg-emerald-700', shadow: 'shadow-emerald-200', subBg: 'bg-emerald-50', subBorder: 'border-emerald-100', textMain: 'text-emerald-900', btnBg: 'bg-emerald-50', btnHover: 'hover:bg-emerald-100' };
  };

  const theme = getThemeColors(course);

  // --- CALCULATE BADGE RARITY (FRONTEND OVERRIDE) ---
  // We use the score to determine the rarity/color, ignoring any hallucinated rarity from AI.
  // Format assumption: score is "X/Y" or "X%" or just a number string.
  const calculateRarity = (scoreStr: string) => {
    // Basic parser for "8/10" or "80%"
    let percent = 0;
    if (scoreStr.includes('/')) {
      const parts = scoreStr.split('/');
      percent = (parseFloat(parts[0]) / parseFloat(parts[1])) * 100;
    } else if (scoreStr.includes('%')) {
      percent = parseFloat(scoreStr);
    } else {
      // Fallback if just a number or weird string, try parsing as int out of 100?
      // Or just assume it's "S/A/B/C" -> map to percent
      if (scoreStr === 'S') percent = 100;
      else if (scoreStr === 'A') percent = 90;
      else if (scoreStr === 'B') percent = 80;
      else if (scoreStr === 'C') percent = 70;
      else percent = 60;
    }

    if (percent === 100) return { rarity: 'ULTRA RARE', color: '#ec4899' }; // Pink-500
    if (percent >= 90) return { rarity: 'RARE', color: '#f59e0b' }; // Amber-500
    if (percent >= 70) return { rarity: 'UNCOMMON', color: '#3b82f6' }; // Blue-500
    return { rarity: 'COMMON', color: '#64748b' }; // Slate-500
  };

  const badgeContext = calculateRarity(report.score);
  // Merged Badge (AI Name + Calculated Rarity)
  const displayBadge: Badge = {
    ...report.badge,
    rarity: badgeContext.rarity,
    color: badgeContext.color
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-40 print:p-0 print:pb-0 print:bg-white print:h-auto">
      <SEO title={`Results: ${topic || course}`} />
      <div
        ref={reportRef}
        className={`mx-auto bg-white shadow-2xl transition-all max-w-4xl rounded-[2.5rem] border ${theme.border} print:max-w-none print:shadow-none print:border-none print:rounded-none print:w-full`}
      >
        <header className={`p-12 ${theme.bg} text-white relative print:p-8 print:text-white print-color-adjust`}>
          <div className="flex justify-between items-center gap-4">
            <div>
              <h2 className="text-4xl font-black tracking-tight uppercase print:text-3xl">Practice Feedback</h2>
              <p className={`text-lg ${theme.text} font-bold mt-2 tracking-wide print:text-base`}>{topic}</p>
            </div>
            <div className="bg-white/10 px-8 py-4 rounded-2xl border border-white/20 text-center backdrop-blur-sm print:border-white print:px-6 print:py-2">
              <p className={`text-[10px] font-black uppercase tracking-widest opacity-80 mb-1`}>Points</p>
              <span className="text-6xl font-black print:text-4xl">{report.score}</span>
            </div>
          </div>
        </header>

        <div className="p-12 space-y-12 print:p-8 print:space-y-6">
          <div className="flex flex-col items-center print:flex-row print:items-start print:gap-8 print-break-avoid">
            <div className="shrink-0 flex flex-col items-center gap-4">
              <BadgeCard badge={displayBadge} innerRef={badgeRef} />
              <button
                onClick={handleDownloadBadge}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors no-print"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download High-Res Badge
              </button>
            </div>
            <div className="w-full text-center mt-8 print:mt-0 print:text-left print:flex-1 space-y-4">
              <div className={`${theme.subBg} p-8 rounded-3xl border ${theme.subBorder} text-center print:text-left print-break-avoid`}>
                <p className="text-slate-800 leading-loose font-medium italic text-xl print:text-sm">"{report.summary}"</p>
              </div>

              {/* Factual Accuracy Confidence Card */}
              {report.certainty && (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-left relative overflow-hidden transition-all duration-300 hover:border-slate-300 print-break-avoid">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <svg className="w-16 h-16 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-50 p-1.5 rounded-lg border border-indigo-100 text-indigo-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                        AI Self-Check: Likelihood of Factual Truth
                      </h4>
                    </div>

                    {/* Info Tooltip */}
                    <div className="group relative">
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors p-0.5 rounded-full" aria-label="Explanation of Factual Truthfulness Levels">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <div className="absolute right-0 bottom-full mb-2 w-72 bg-white border border-slate-200 text-slate-600 text-xs rounded-xl p-3 shadow-2xl opacity-0 scale-95 origin-bottom-right transition-all duration-200 pointer-events-none group-hover:opacity-100 group-hover:scale-100 z-50">
                        <p className="font-bold text-slate-800 mb-1.5">Factual Truthfulness Scale</p>
                        <ul className="space-y-1.5 text-[10px] leading-relaxed">
                          <li><strong className="text-emerald-600">5/5 Extremely Confident:</strong> Telling the truth; settled scientific facts, zero hallucination risk.</li>
                          <li><strong className="text-teal-600">4/5 Highly Confident:</strong> Standard consensus models, highly likely factually accurate.</li>
                          <li><strong className="text-indigo-600">3/5 Moderately Confident:</strong> Conceptually sound, phrasing could have minor variance.</li>
                          <li><strong className="text-amber-600">2/5 Slightly Uncertain:</strong> Complex synthesis; potential for minor terminology gaps.</li>
                          <li><strong className="text-rose-600">1/5 High Uncertainty:</strong> Speculative frontier; higher risk of hallucinated facts.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-100 mb-4 relative z-10">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className={`text-sm font-black uppercase tracking-wider ${
                        report.certainty.level >= 5 ? 'text-emerald-600' :
                        report.certainty.level === 4 ? 'text-teal-600' :
                        report.certainty.level === 3 ? 'text-indigo-600' :
                        report.certainty.level === 2 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {report.certainty.level >= 5 ? 'Extremely Confident' :
                         report.certainty.level === 4 ? 'Highly Confident' :
                         report.certainty.level === 3 ? 'Moderately Confident' :
                         report.certainty.level === 2 ? 'Slightly Uncertain' : 'High Uncertainty / Speculative'}
                      </span>
                      <span className="text-xs font-black text-slate-400">{report.certainty.level}/5 Truthfulness Rating</span>
                    </div>

                    <div className="flex gap-1.5 h-2 w-full mb-3">
                      {[1, 2, 3, 4, 5].map((index) => {
                        const isActive = index <= report.certainty!.level;
                        const activeColor = 
                          report.certainty!.level >= 5 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' :
                          report.certainty!.level === 4 ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.2)]' :
                          report.certainty!.level === 3 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.2)]' :
                          report.certainty!.level === 2 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                          'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
                        
                        return (
                          <div 
                            key={index} 
                            className={`flex-1 h-full rounded-full transition-all duration-500 ${
                              isActive ? activeColor : 'bg-slate-200'
                            }`}
                          />
                        );
                      })}
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed italic">
                      "{
                        report.certainty.level >= 5 ? 'Factual certainty; settled scientific consensus, double-verified by internal benchmarks.' :
                        report.certainty.level === 4 ? 'Strong consensus, standard scientific model, very low risk of error.' :
                        report.certainty.level === 3 ? 'Conceptually sound, but specific terminology or phrasing could have minor variance.' :
                        report.certainty.level === 2 ? 'Frontier concept or complex synthesis; some risk of simplified modeling or minor gaps.' :
                        'Complex custom query or highly speculative scientific frontier; moderate hallucination risk.'
                      }"
                    </p>
                  </div>

                  {report.certainty.factors && report.certainty.factors.length > 0 && (
                    <div className="relative z-10">
                      <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Contributing Factors Assessed</h5>
                      <div className="flex flex-wrap gap-2">
                        {report.certainty.factors.map((factor, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-600 text-[10px] font-medium leading-none">
                            <div className={`w-1 h-1 rounded-full ${
                              report.certainty!.level >= 5 ? 'bg-emerald-500' :
                              report.certainty!.level === 4 ? 'bg-teal-500' :
                              report.certainty!.level === 3 ? 'bg-indigo-500' :
                              report.certainty!.level === 2 ? 'bg-amber-500' : 'bg-rose-500'
                            }`} />
                            {factor}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <section>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest flex items-center gap-4 mb-8 print:mb-4 print:text-lg">
              <div className={`w-2 h-8 ${theme.accent} rounded-full print:h-6`}></div>
              Performance Analysis
            </h3>

            <div className="space-y-8 print:space-y-6">
              {report.detailedFeedback.map((item, i) => (
                <div key={i} className={`print-break-avoid bg-white rounded-3xl border-2 overflow-hidden transition-all ${item.evaluation === 'Correct' ? 'border-emerald-100 shadow-xl shadow-emerald-50 print:border-emerald-200 print:shadow-none' :
                  item.evaluation === 'Incorrect' ? 'border-rose-100 shadow-xl shadow-rose-50 print:border-rose-200 print:shadow-none' : 'border-amber-100 shadow-xl shadow-amber-50 print:border-amber-200 print:shadow-none'
                  }`}>
                  <div className={`px-8 py-6 flex items-center justify-between border-b print:px-6 print:py-3 ${item.evaluation === 'Correct' ? 'bg-emerald-50/50 border-emerald-100 print:bg-emerald-50' :
                    item.evaluation === 'Incorrect' ? 'bg-rose-50/50 border-rose-100 print:bg-rose-50' : 'bg-amber-50/50 border-amber-100 print:bg-amber-50'
                    }`}>
                    <h4 className="font-bold text-slate-800 leading-snug text-base print:text-sm">
                      <span className="opacity-40 mr-3 font-black">Q{i + 1}</span>
                      <div className="inline-block align-top">
                        <MarkdownRenderer
                          content={cleanHtml(item.question)}
                          components={INLINE_PARAGRAPHS}
                        />
                      </div>
                    </h4>
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 ml-6 print:border print:border-current ${item.evaluation === 'Correct' ? 'bg-emerald-100 text-emerald-800' :
                      item.evaluation === 'Incorrect' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                      {item.evaluation}
                    </span>
                  </div>

                  <div className="p-8 space-y-8 print:p-6 print:space-y-4">
                    {/* Student Answer Block */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Answer</p>
                      <div className="text-slate-700 font-medium font-mono text-sm">
                        <MarkdownRenderer
                          content={cleanHtml(item.studentAnswer || "(No answer provided)")}
                          components={INLINE_PARAGRAPHS}
                        />
                      </div>
                    </div>

                    {/* CONDITIONAL FEEDBACK: Only show text paragraph if no breakdown is available, OR if user wants to keep it. 
                        User requested "Remove redundant...". So if optionAnalysis exists, hide general feedback. 
                    */}
                    {(!item.optionAnalysis || item.optionAnalysis.length === 0) && (
                      <div>
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Feedback</h5>
                        <div className="text-slate-700 font-medium leading-loose text-base print:text-sm print:leading-normal">
                          <MarkdownRenderer
                            content={cleanHtml(item.feedback)}
                            components={SPACED_PARAGRAPHS}
                          />
                        </div>
                      </div>
                    )}

                    {/* RUBRIC DIFF VIEWER & MODEL COMPARISON (FRQ and CER) */}
                    {(item.rubricBreakdown || item.modelAnswer) && (
                      <RubricDiffViewer feedback={item} />
                    )}

                    {/* OPTION ANALYSIS (New Feature) - Main Feedback Source for MCQ */}
                    {item.optionAnalysis && item.optionAnalysis.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden print:border-slate-300 shadow-sm">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest print:bg-slate-100 flex justify-between items-center">
                          <span>Answer Analysis</span>
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">Review All Options</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {item.optionAnalysis.map((opt, idx) => {
                            // Normalize strings for comparison (remove HTML tags, trim) or just direct compare if clean
                            // Since studentAnswer comes from Markdown/HTML clean, we should be careful. 
                            // Usually strict match works if AI generated both from same source.
                            // Let's rely on loose string inclusion if exact match fails, or exact match.
                            const cleanOpt = opt.option.trim();
                            const cleanStudent = (item.studentAnswer || "").trim();
                            const isSelected = cleanStudent === cleanOpt || cleanStudent.includes(cleanOpt) && cleanStudent.length < cleanOpt.length + 10;

                            // Detect correctness from AI flag OR string content as fallback
                            const isCorrect = opt.isCorrect === true || opt.explanation.toLowerCase().startsWith("correct");

                            return (
                              <div
                                key={idx}
                                className={`p-4 text-sm flex gap-4 transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'} ${isCorrect ? 'bg-emerald-50/30' : ''} print:p-2`}
                              >
                                <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-black text-sm border ${isCorrect ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                  isSelected ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-white text-slate-400 border-slate-200'
                                  }`}>
                                  {String.fromCharCode(65 + idx)}
                                </div>

                                <div className="space-y-1.5 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className={`font-bold text-base ${isCorrect ? 'text-emerald-900' : 'text-slate-700'}`}>
                                      <MarkdownRenderer content={cleanHtml(opt.option)} components={INLINE_PARAGRAPHS} />
                                    </p>

                                    {/* STATUS BADGES */}
                                    {isCorrect && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wide border border-emerald-200">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        Correct Answer
                                      </span>
                                    )}
                                    {isSelected && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wide border border-blue-200">
                                        You Chose This
                                      </span>
                                    )}
                                  </div>

                                  <p className={`text-sm leading-relaxed ${isCorrect ? 'text-emerald-800' : 'text-slate-600'}`}>
                                    <span className="font-bold opacity-50 mr-1">Why:</span>
                                    {opt.explanation}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden print:bg-white print:border-slate-200 print:p-4">
                      <div className="relative z-10 space-y-6 print:space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-slate-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            </span>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Analysis: The Mechanism</p>
                          </div>
                          <div className="text-slate-600 italic leading-relaxed text-sm print:text-xs">"
                            <MarkdownRenderer
                              content={cleanHtml(item.tutorDeepDive)}
                              components={INLINE_PARAGRAPHS}
                            />
                            "</div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-200 print:pt-3 print:gap-4">
                          <div className="print-break-avoid">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Key Concept</p>
                            <div className="inline-block bg-amber-50 text-amber-800 px-3 py-1 rounded-lg font-bold text-xs border border-amber-100 print:bg-white print:border-amber-200">
                              <MarkdownRenderer
                                content={cleanHtml(item.keyConcept)}
                                components={INLINE_PARAGRAPHS}
                              />
                            </div>
                          </div>
                          <div className="print-break-avoid">
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-2">Common Pitfall</p>
                            <div className="text-rose-800/80 font-medium leading-relaxed text-sm print:text-xs">
                              <MarkdownRenderer
                                content={cleanHtml(item.misconceptionAlert)}
                                components={INLINE_PARAGRAPHS}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SMART SEARCH RESOURCES */}
                    <div className="flex flex-wrap gap-2 justify-end">
                      {/* 1. Textbook Search (OpenStax or CK-12) */}
                      {item.searchQueries && item.searchQueries.length > 0 && (
                        <a
                          href={`https://www.google.com/search?q=site:${course.includes('AP') ? 'openstax.org' : 'ck12.org'}+${encodeURIComponent(item.searchQueries[0])}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 ${theme.subBg} hover:bg-slate-200 px-4 py-2 rounded-full border ${theme.subBorder} transition-colors text-sm font-bold no-underline text-slate-700`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                          <span>Read {course.includes('AP') ? 'OpenStax' : 'CK-12'}</span>
                          <svg className="w-3 h-3 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      )}

                      {/* 2. YouTube Search */}
                      {item.searchQueries && item.searchQueries.length > 0 && (
                        <a
                          href={`https://www.youtube.com/results?search_query=science+explanation+${encodeURIComponent(item.searchQueries[0])}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-full border border-rose-100 transition-colors text-sm font-bold no-underline text-rose-700`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                          <span>Watch Video</span>
                          <svg className="w-3 h-3 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      )}
                    </div>

                    {/* MERMAID VISUAL MAPPING (Phase 3 Integration) */}
                    {item.visualMapping && item.visualMapping !== "null" && item.visualMapping.trim() !== "" && (
                      <div className="mt-6 border border-slate-200 bg-white rounded-xl p-4 overflow-hidden relative print:border-slate-800">
                        <div className="absolute top-0 left-0 bg-indigo-500/10 text-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-br-xl">Logic Map</div>
                        <div className="flex justify-center mt-4">
                          <MermaidDiagram chart={item.visualMapping} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={`${theme.bg} rounded-[2.5rem] p-10 shadow-2xl text-white print-break-avoid print:bg-white print:text-slate-900 print:border-2 print:border-slate-800 print:shadow-none`}>
            <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-4 mb-8 print:text-slate-900 print:mb-4 print:text-lg">
              <div className="w-2 h-8 bg-white/30 rounded-full print:bg-slate-800 print:h-6"></div>
              Tailored Study Plan
            </h3>
            <ul className="space-y-6 print:space-y-3">
              {report.studyRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-4 leading-loose font-medium text-base print:text-sm print:leading-normal">
                  <div className="w-2 h-2 rounded-full bg-white/50 mt-2.5 shrink-0 print:bg-slate-800"></div>
                  <div className="flex-1">
                    <MarkdownRenderer
                      content={cleanHtml(rec)}
                      components={INLINE_PARAGRAPHS}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="hidden print:block p-6 text-center border-t border-slate-200 mt-auto">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Science Practice Partner Report • {new Date().getFullYear()}
          </p>
        </footer>
      </div>

      {/* Share Modal Overlay - Positioned outside the fixed bottom container to prevent dynamic blur clipping */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div {...shareDialog} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 id="results-share-title" className="text-xl font-black text-slate-800">Share Results</h3>
              <button aria-label="Close" onClick={() => setShowShareModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <button onClick={handleDownloadFullScreenshot} className="w-full p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl flex items-center gap-4 transition-colors group">
                <div className="bg-white p-2 rounded-lg text-slate-400 group-hover:text-indigo-600 shadow-sm border border-slate-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-700">Download Image</div>
                  <div className="text-xs text-slate-400">Save full report as PNG</div>
                </div>
              </button>

              <button onClick={handleCopySummary} className="w-full p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl flex items-center gap-4 transition-colors group">
                <div className="bg-white p-2 rounded-lg text-slate-400 group-hover:text-emerald-600 shadow-sm border border-slate-100">
                  {copySuccess ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>}
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-700">{copySuccess ? "Copied!" : "Copy Summary"}</div>
                  <div className="text-xs text-slate-400">Copy text for email/chat</div>
                </div>
              </button>

              <button onClick={handleEmailResults} className="w-full p-4 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-xl flex items-center gap-4 transition-colors group">
                <div className="bg-white p-2 rounded-lg text-slate-400 group-hover:text-sky-600 shadow-sm border border-slate-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z" /></svg>
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-700">Email Teacher</div>
                  <div className="text-xs text-slate-400">Open default mail app</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-6 z-40 no-print">

        <div className="max-w-6xl mx-auto flex flex-wrap justify-center items-center gap-3 md:gap-4">
          <button
            onClick={onRetry}
            className={`${theme.accent} ${theme.hover} text-white px-6 py-4 rounded-2xl font-black text-sm md:text-lg transition-all ${theme.shadow} active:scale-95 flex-1 min-w-[160px] flex items-center justify-center gap-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Retry
          </button>

          <button
            onClick={onNewTopic}
            className={`${theme.btnBg} ${theme.btnHover} ${theme.textMain} px-5 py-4 rounded-2xl font-bold text-sm md:text-base transition-all active:scale-95 flex items-center justify-center gap-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Topics
          </button>

          <button
            onClick={onChangeCourse}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-4 rounded-2xl font-bold text-sm md:text-base transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Courses
          </button>

          <button
            onClick={onGoHome}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-5 py-4 rounded-2xl font-bold text-sm md:text-base transition-all active:scale-95 flex items-center justify-center gap-2"
            title="Exit to Landing Page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Exit
          </button>

          <button
            onClick={handlePrint}
            className="text-slate-400 hover:text-slate-600 p-4 rounded-2xl transition-all active:scale-95"
            title="Print"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-4 rounded-2xl transition-all active:scale-95"
            title="Share Results"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
