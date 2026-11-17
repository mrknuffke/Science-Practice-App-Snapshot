import React, { useState } from 'react';
import { Award, CheckCircle2, AlertTriangle, XCircle, Sparkles, Copy, Check, BookOpen, Columns, ListFilter } from 'lucide-react';
import { DetailedFeedback, RubricCriterionEvaluation } from '../../types';
import MarkdownRenderer, { SPACED_PARAGRAPHS } from '../MarkdownRenderer';
import type { Components } from 'react-markdown';
import { cleanHtml } from '../../utils/sanitize';


const MODEL_ANSWER_PARAGRAPHS: Components = {
  p: ({ node, ...props }) => <p className="mb-2 last:mb-0 font-medium" {...props} />
};
interface RubricDiffViewerProps {
  feedback: DetailedFeedback;
  className?: string;
}

export const RubricDiffViewer: React.FC<RubricDiffViewerProps> = ({ feedback, className = '' }) => {
  const { rubricBreakdown, modelAnswer, studentAnswer, rubricScore } = feedback;
  const [activeTab, setActiveTab] = useState<'breakdown' | 'comparison'>('breakdown');
  const [copiedModel, setCopiedModel] = useState(false);
  const [copiedStudent, setCopiedStudent] = useState(false);

  // If neither rubric breakdown nor model answer is present, do not render
  if ((!rubricBreakdown || rubricBreakdown.length === 0) && !modelAnswer) {
    return null;
  }

  const handleCopy = async (text: string, type: 'model' | 'student') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'model') {
        setCopiedModel(true);
        setTimeout(() => setCopiedModel(false), 2000);
      } else {
        setCopiedStudent(true);
        setTimeout(() => setCopiedStudent(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  // Metrics
  const metCount = rubricBreakdown?.filter(c => c.status === 'met').length ?? 0;
  const partialCount = rubricBreakdown?.filter(c => c.status === 'partially_met').length ?? 0;
  const missingCount = rubricBreakdown?.filter(c => c.status === 'missing').length ?? 0;
  const totalCriteria = rubricBreakdown?.length ?? 0;

  const totalEarnedPoints = rubricBreakdown?.reduce((acc, c) => acc + (c.pointsAwarded ?? 0), 0) ?? 0;
  const totalPossiblePoints = rubricBreakdown?.reduce((acc, c) => acc + (c.pointsPossible ?? 0), 0) ?? 0;

  const getStatusBadge = (status: RubricCriterionEvaluation['status']) => {
    switch (status) {
      case 'met':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Met
          </span>
        );
      case 'partially_met':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Partially Met
          </span>
        );
      case 'missing':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Missing
          </span>
        );
    }
  };

  return (
    <div className={`bg-white rounded-3xl border-2 border-indigo-100 shadow-xl shadow-indigo-50/50 overflow-hidden print:border-slate-200 print:shadow-none ${className}`}>
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-black tracking-tight text-white">Rubric Alignment & Model Analysis</h4>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Diff Grader
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Criterion-by-criterion rubric checklist and gold-standard exemplar comparison.
            </p>
          </div>
        </div>

        {/* Score & View Switcher */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Score Badge */}
          {(rubricScore || totalPossiblePoints > 0) && (
            <div className="bg-white/10 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white/15 flex items-center gap-2 text-sm font-black">
              <span className="text-indigo-200 text-xs uppercase tracking-wider">Score</span>
              <span className="text-emerald-300">
                {rubricScore || `${totalEarnedPoints} / ${totalPossiblePoints} pts`}
              </span>
            </div>
          )}

          {/* View Mode Toggle */}
          {modelAnswer && (
            <div className="inline-flex rounded-xl bg-indigo-950/60 p-1 border border-indigo-700/50 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('breakdown')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'breakdown'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-300 hover:text-white'
                }`}
                title="View rubric checklist"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Rubric Checklist</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('comparison')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'comparison'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-300 hover:text-white'
                }`}
                title="View side-by-side comparison"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Model Comparison</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overview Stat Bar */}
      {totalCriteria > 0 && (
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Criteria Breakdown:</span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {metCount} Met
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {partialCount} Partial
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                {missingCount} Missing
              </span>
            </div>
          </div>
          <div className="text-slate-400 font-medium text-[11px]">
            {totalCriteria} Rubric {totalCriteria === 1 ? 'Dimension' : 'Dimensions'} Audited
          </div>
        </div>
      )}

      <div className="p-6 md:p-8 space-y-6">
        {/* Tab 1: Rubric Checklist View */}
        {activeTab === 'breakdown' && rubricBreakdown && rubricBreakdown.length > 0 && (
          <div className="space-y-4">
            {rubricBreakdown.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border-2 transition-all p-5 print:p-4 print:break-inside-avoid ${
                  item.status === 'met'
                    ? 'border-emerald-100 bg-emerald-50/20'
                    : item.status === 'partially_met'
                    ? 'border-amber-100 bg-amber-50/20'
                    : 'border-rose-100 bg-rose-50/20'
                }`}
              >
                {/* Criterion Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black text-slate-400 font-mono">#{idx + 1}</span>
                    <h5 className="font-bold text-slate-900 text-sm md:text-base">{item.criterion}</h5>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {item.pointsPossible !== undefined && (
                      <span className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {item.pointsAwarded ?? 0} / {item.pointsPossible} pts
                      </span>
                    )}
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* Comparative Evidence Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Student Response Analysis */}
                  <div className="bg-white/80 rounded-xl p-3.5 border border-slate-200 shadow-sm text-xs leading-relaxed">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <span>Your Response Analysis</span>
                    </div>
                    <p className="text-slate-700 font-medium">{item.studentExclusionOrMatch}</p>
                  </div>

                  {/* Model Exemplar Target */}
                  <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100 text-xs leading-relaxed">
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Exemplar Target</span>
                    </div>
                    <p className="text-emerald-950 font-medium">{item.modelEvidence}</p>
                  </div>
                </div>

                {/* Actionable Upgrade Suggestion */}
                {item.suggestedRevision && item.status !== 'met' && (
                  <div className="mt-3.5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent p-3.5 rounded-xl border border-indigo-200/60 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-black text-indigo-900 uppercase tracking-wider text-[10px] block mb-0.5">
                        How to Upgrade to Full Credit
                      </span>
                      <p className="text-slate-800 font-medium italic">
                        "{item.suggestedRevision}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Side-by-Side Comparison View */}
        {(activeTab === 'comparison' || !rubricBreakdown || rubricBreakdown.length === 0) && modelAnswer && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student's Response */}
              <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 overflow-hidden flex flex-col">
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-black text-slate-600 uppercase tracking-wider">
                  <span>Your Submitted Response</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(studentAnswer || '', 'student')}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
                    title="Copy your response"
                  >
                    {copiedStudent ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedStudent ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-5 text-slate-800 text-sm font-mono leading-relaxed flex-1 whitespace-pre-wrap">
                  {studentAnswer ? (
                    <MarkdownRenderer
                      content={cleanHtml(studentAnswer)}
                      components={SPACED_PARAGRAPHS}
                    />
                  ) : (
                    <span className="text-slate-400 italic">No answer submitted</span>
                  )}
                </div>
              </div>

              {/* Exemplar Model Answer */}
              <div className="bg-emerald-50/40 rounded-2xl border-2 border-emerald-200 overflow-hidden flex flex-col">
                <div className="bg-emerald-100/70 px-4 py-3 border-b border-emerald-200 flex items-center justify-between text-xs font-black text-emerald-800 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Gold-Standard Exemplar</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(modelAnswer, 'model')}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
                    title="Copy model answer"
                  >
                    {copiedModel ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedModel ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-5 text-emerald-950 text-sm leading-relaxed flex-1">
                  <MarkdownRenderer
                    content={cleanHtml(modelAnswer)}
                    components={MODEL_ANSWER_PARAGRAPHS}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
