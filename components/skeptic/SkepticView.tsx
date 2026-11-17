import React, { useState, useMemo, useCallback } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, XCircle, HelpCircle, Sparkles, Download, RotateCcw, FileText, Sliders, Scale, ChevronRight, Wand2 } from 'lucide-react';
import SimulationHeader from '../simulations/shared/SimulationHeader';
import AboutPanel from '../simulations/shared/AboutPanel';
import { TTSButton } from '../TTSButton';
import { SKEPTIC_ABOUT } from './SkepticAbout';
import { SKEPTIC_PRESETS } from './skepticPresets';
import { SkepticInvestigation, SkepticChallenge, SkepticEvaluation } from './skepticTypes';
import {
  evaluateDefenseRebuttals,
  exportPeerReviewReportToMarkdown,
} from './skepticEngine';
import {
  auditInvestigationWithSkeptic,
  evaluateDefenseWithSkeptic,
} from '../../services/ai/skeptic';
import { CourseType } from '../../types';

interface SkepticViewProps {
  onBack: () => void;
  course?: CourseType;
}

export const SkepticView: React.FC<SkepticViewProps> = ({ onBack, course }) => {
  const initialPreset = useMemo(() => {
    if (course) {
      const match = SKEPTIC_PRESETS.find(p => p.course === course);
      if (match) return match;
    }
    return SKEPTIC_PRESETS[0];
  }, [course]);

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [investigation, setInvestigation] = useState<SkepticInvestigation>(initialPreset);
  const [challenges, setChallenges] = useState<SkepticChallenge[]>(initialPreset.initialChallenges);
  const [rebuttals, setRebuttals] = useState<Record<string, string>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [simplifiedChallenges, setSimplifiedChallenges] = useState<Record<string, boolean>>({});
  const [evaluation, setEvaluation] = useState<SkepticEvaluation | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'protocol' | 'interrogation' | 'verdict'>('interrogation');

  const _currentPreset = useMemo(() => {
    return SKEPTIC_PRESETS.find(p => p.id === selectedPresetId) || SKEPTIC_PRESETS[0];
  }, [selectedPresetId]);

  // Load preset
  const handleSelectPreset = useCallback((presetId: string) => {
    const preset = SKEPTIC_PRESETS.find(p => p.id === presetId) || SKEPTIC_PRESETS[0];
    setSelectedPresetId(preset.id);
    setInvestigation(preset);
    setChallenges(preset.initialChallenges);
    setRebuttals({});
    setRevealedHints({});
    setEvaluation(null);
    setActiveTab('interrogation');
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Re-audit with AI
  const handleSummonAIAudit = async () => {
    setIsAuditing(true);
    showToast('The Skeptic is scrutinizing your experimental protocol...');
    try {
      const freshChallenges = await auditInvestigationWithSkeptic(investigation);
      setChallenges(freshChallenges);
      setRebuttals({});
      setRevealedHints({});
      setEvaluation(null);
      setActiveTab('interrogation');
      showToast('The Skeptic has issued 3 targeted methodological challenges.');
    } catch {
      showToast('Using heuristic peer review audit challenges.');
    } finally {
      setIsAuditing(false);
    }
  };

  // Update rebuttal text
  const handleRebuttalChange = (challengeId: string, text: string) => {
    setRebuttals(prev => ({
      ...prev,
      [challengeId]: text,
    }));
  };

  // Toggle hint
  const handleToggleHint = (challengeId: string) => {
    setRevealedHints(prev => ({
      ...prev,
      [challengeId]: !prev[challengeId],
    }));
  };

  // Submit defense
  const handleSubmitDefense = async () => {
    setIsEvaluating(true);
    showToast('Submitting defense to the peer review board...');
    try {
      const evalResult = await evaluateDefenseWithSkeptic(investigation, challenges, rebuttals);
      setEvaluation(evalResult);
      setActiveTab('verdict');
      if (evalResult.overallVerdict === 'approved') {
        showToast('Protocol Approved: Methodology certified by The Skeptic!');
      } else if (evalResult.overallVerdict === 'revisions_requested') {
        showToast('Revisions Requested: Review recommendations and refine defense.');
      } else {
        showToast('Protocol Rejected: Major methodological restructuring required.');
      }
    } catch {
      const evalResult = evaluateDefenseRebuttals(investigation, challenges, rebuttals);
      setEvaluation(evalResult);
      setActiveTab('verdict');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Export report
  const handleExportReport = () => {
    const md = exportPeerReviewReportToMarkdown(investigation, challenges, rebuttals, evaluation || undefined);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${investigation.id}-peer-review-report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded Peer Review Report to markdown.');
  };

  // Reset
  const handleResetSession = () => {
    setRebuttals({});
    setRevealedHints({});
    setEvaluation(null);
    setActiveTab('interrogation');
    showToast('Defense chamber reset.');
  };

  const answeredChallengesCount = challenges.filter(c => (rebuttals[c.id] || '').trim().length > 10).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-rose-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium border border-rose-400 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Standard Simulation Header */}
      <SimulationHeader
        title="The Skeptic (AI Peer Review Partner)"
        icon={Scale}
        onBack={onBack}
        gradient="from-amber-400 via-rose-400 to-indigo-400"
        onOpenAbout={() => setShowAbout(true)}
      />

      {/* Top Controls Bar */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 mb-6 border border-slate-700/60 shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Preset Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="skeptic-preset" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Investigation Setup:
          </label>
          <select
            id="skeptic-preset"
            value={selectedPresetId}
            onChange={e => handleSelectPreset(e.target.value)}
            className="bg-slate-900 text-slate-200 text-sm font-medium rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          >
            {SKEPTIC_PRESETS.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.title} ({preset.course})
              </option>
            ))}
          </select>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('protocol')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'protocol'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Protocol
          </button>
          <button
            onClick={() => setActiveTab('interrogation')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'interrogation'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Interrogation ({answeredChallengesCount}/{challenges.length})
          </button>
          <button
            onClick={() => setActiveTab('verdict')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'verdict'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Review Verdict {evaluation ? `(${evaluation.rigorScore}%)` : ''}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSummonAIAudit}
            disabled={isAuditing}
            title="Ask AI Skeptic to re-audit this protocol"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>{isAuditing ? 'Auditing...' : 'Re-Audit Protocol'}</span>
          </button>

          <button
            onClick={handleExportReport}
            title="Export Markdown Peer Review Report"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-600"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Report</span>
          </button>

          <button
            onClick={handleResetSession}
            title="Reset Rebuttals"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-600"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PROTOCOL VIEW */}
      {activeTab === 'protocol' && (
        <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/60 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                {investigation.course} &bull; {investigation.topic}
              </span>
              <h2 className="text-xl font-black text-slate-100 mt-1">
                {investigation.title}
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('interrogation')}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-md transition-all"
            >
              <span>Face The Skeptic</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Research Question
                  </span>
                  <TTSButton text={investigation.researchQuestion} label="Listen" className="text-xs text-slate-400 hover:text-white" />
                </div>
                <p className="text-sm font-medium text-slate-200">
                  {investigation.researchQuestion}
                </p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Working Hypothesis
                  </span>
                  <TTSButton text={investigation.hypothesis} label="Listen" className="text-xs text-slate-400 hover:text-white" />
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {investigation.hypothesis}
                </p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Control Group & Baseline
                </span>
                <p className="text-sm text-slate-300">
                  {investigation.controlGroup}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Variables
                </span>
                <div className="space-y-2 text-xs">
                  <div>
                    <strong className="text-emerald-400">Independent Variable (IV):</strong>{' '}
                    <span className="text-slate-300">{investigation.independentVariable}</span>
                  </div>
                  <div>
                    <strong className="text-cyan-400">Dependent Variable (DV):</strong>{' '}
                    <span className="text-slate-300">{investigation.dependentVariable}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Controlled Parameters
                </span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {investigation.controlledVariables.map((cv, idx) => (
                    <li key={idx}>{cv}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Measurement Methodology
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {investigation.measurementMethod}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERROGATION & DEFENSE */}
      {activeTab === 'interrogation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Challenges Stack */}
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  Peer Review Defense Interrogations ({challenges.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Draft procedural modifications, additional controls, or calibration fixes to address each vulnerability.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                {answeredChallengesCount} of {challenges.length} defended
              </span>
            </div>

            {challenges.map((challenge, idx) => {
              const isHintRevealed = !!revealedHints[challenge.id];
              const rebuttal = rebuttals[challenge.id] || '';
              const isAnswered = rebuttal.trim().length > 10;

              return (
                <div
                  key={challenge.id}
                  className={`bg-slate-800/90 rounded-2xl p-5 border transition-all shadow-md ${
                    isAnswered
                      ? 'border-slate-700/80'
                      : challenge.severity === 'critical'
                      ? 'border-rose-500/40 hover:border-rose-500/70'
                      : 'border-amber-500/40 hover:border-amber-500/70'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100">
                        {challenge.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        challenge.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : challenge.severity === 'moderate'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}>
                        {challenge.severity} Severity
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 text-slate-400 border border-slate-800">
                        {challenge.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs text-slate-200 leading-relaxed flex-1">
                        <strong className="text-rose-400">The Skeptic asks:</strong> &quot;{challenge.question}&quot;
                      </p>
                      <TTSButton text={challenge.question} label="Listen" className="shrink-0 text-slate-400 hover:text-white text-xs" />
                    </div>
                    {simplifiedChallenges[challenge.id] && (
                      <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-lg p-2.5 text-xs text-indigo-200 animate-in fade-in">
                        <strong className="text-indigo-400">Simplified Core Concern:</strong> {challenge.hint}
                      </div>
                    )}
                  </div>

                  {/* Hint & Simplify Controls */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleHint(challenge.id)}
                        className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{isHintRevealed ? 'Hide Reviewer Hint' : 'Show Reviewer Hint'}</span>
                      </button>
                      <button
                        onClick={() => setSimplifiedChallenges(prev => ({ ...prev, [challenge.id]: !prev[challenge.id] }))}
                        className={`text-xs flex items-center gap-1.5 transition-colors ${simplifiedChallenges[challenge.id] ? 'text-indigo-300 font-bold' : 'text-slate-400 hover:text-indigo-300'}`}
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>{simplifiedChallenges[challenge.id] ? 'Original Question' : 'Simplify Concern'}</span>
                      </button>
                    </div>
                    {challenge.suggestedFix && isHintRevealed && (
                      <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                        Suggested standard solution included below
                      </span>
                    )}
                  </div>

                  {isHintRevealed && (
                    <div className="mt-2 p-3 bg-amber-950/20 border border-amber-600/30 rounded-lg text-xs text-amber-200 space-y-1 animate-in fade-in duration-150">
                      <p><strong>Reviewer Hint:</strong> {challenge.hint}</p>
                      {challenge.suggestedFix && (
                        <p className="text-slate-300 pt-1 border-t border-amber-900/40">
                          <strong className="text-emerald-400">Protocol Benchmark Fix:</strong> {challenge.suggestedFix}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Student Rebuttal Input */}
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Your Methodological Defense & Protocol Adjustment:
                    </label>
                    <textarea aria-label="Your Methodological Defense & Protocol Adjustment"
                      rows={3}
                      value={rebuttal}
                      onChange={e => handleRebuttalChange(challenge.id, e.target.value)}
                      placeholder="Explain how you will isolate the variable, introduce a negative/positive control, or calibrate against systematic error..."
                      className="w-full bg-slate-950 text-slate-100 text-xs p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-y"
                    />
                  </div>
                </div>
              );
            })}

            {/* Bottom Defense Submission Bar */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 shadow-lg flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                {answeredChallengesCount === challenges.length ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> All challenges defended! Ready for evaluation.
                  </span>
                ) : (
                  <span>
                    Answer remaining {challenges.length - answeredChallengesCount} challenges before final review.
                  </span>
                )}
              </div>

              <button
                onClick={handleSubmitDefense}
                disabled={isEvaluating || answeredChallengesCount === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                <Scale className="w-4 h-4" />
                <span>{isEvaluating ? 'Evaluating Defense...' : 'Submit Protocol for Peer Review'}</span>
              </button>
            </div>
          </div>

          {/* Right Sidebar: Investigation Abstract & Defense Status */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                Experiment Under Audit
              </span>
              <h4 className="text-base font-bold text-slate-100 mt-1">
                {investigation.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-3">
                {investigation.researchQuestion}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Independent Variable:</span>
                  <span className="text-slate-200 font-medium">{investigation.independentVariable}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Dependent Variable:</span>
                  <span className="text-slate-200 font-medium">{investigation.dependentVariable}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Control Group:</span>
                  <span className="text-slate-200 font-medium">{investigation.controlGroup}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('protocol')}
                className="mt-4 w-full py-2 bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-600"
              >
                View Full Protocol Sheet
              </button>
            </div>

            {/* Defense Readiness Checklist */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 shadow-md">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Defense Readiness Checklist
              </h5>
              <div className="space-y-2.5 text-xs">
                {challenges.map((c, i) => {
                  const done = (rebuttals[c.id] || '').trim().length > 10;
                  return (
                    <div key={c.id} className="flex items-center gap-2">
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />
                      )}
                      <span className={done ? 'text-slate-200' : 'text-slate-400'}>
                        Challenge #{i + 1}: {c.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VERDICT & CERTIFICATE */}
      {activeTab === 'verdict' && (
        <div className="bg-slate-800/90 rounded-2xl p-6 md:p-8 border border-slate-700/60 shadow-xl space-y-6">
          {evaluation ? (
            <>
              {/* Verdict Header Banner */}
              <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg ${
                evaluation.overallVerdict === 'approved'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                  : evaluation.overallVerdict === 'revisions_requested'
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-100'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-100'
              }`}>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-current flex items-center justify-center flex-shrink-0">
                    {evaluation.overallVerdict === 'approved' ? (
                      <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                    ) : evaluation.overallVerdict === 'revisions_requested' ? (
                      <AlertTriangle className="w-9 h-9 text-amber-400" />
                    ) : (
                      <XCircle className="w-9 h-9 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                      Official Peer Review Determination
                    </span>
                    <h2 className="text-2xl font-black mt-0.5">
                      {evaluation.overallVerdict === 'approved'
                        ? 'Protocol Approved for Execution'
                        : evaluation.overallVerdict === 'revisions_requested'
                        ? 'Revisions Required Prior to Testing'
                        : 'Methodological Redesign Advised'}
                    </h2>
                    <p className="text-xs opacity-90 mt-1">
                      Certified on {new Date(evaluation.evaluatedAt).toLocaleDateString()} by The Skeptic Review Board
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center px-6 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Scientific Rigor Score
                  </span>
                  <span className="text-3xl font-black text-slate-100 mt-0.5">
                    {evaluation.rigorScore}/100
                  </span>
                </div>
              </div>

              {/* Strengths & Vulnerabilities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Commendations & Methodological Strengths
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {evaluation.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">&bull;</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Remaining Vulnerabilities & Risks
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {evaluation.vulnerabilities.map((vuln, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">&bull;</span>
                        <span>{vuln}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Mandatory Revisions */}
              {evaluation.recommendations.length > 0 && (
                <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    Mandatory Protocol Revisions
                  </h4>
                  <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
                    {evaluation.recommendations.map((rec, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {rec}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-700">
                <button
                  onClick={() => setActiveTab('interrogation')}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-600"
                >
                  Return to Defense Interrogations
                </button>

                <button
                  onClick={handleExportReport}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Peer Review Memorandum</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 space-y-4">
              <Scale className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-300">
                No Defense Submitted Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Navigate to the Interrogation tab, write defenses for the peer review challenges, and submit your experimental protocol for certification.
              </p>
              <button
                onClick={() => setActiveTab('interrogation')}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Go to Interrogations
              </button>
            </div>
          )}
        </div>
      )}

      {/* About / Help Modal */}
      <AboutPanel
        isOpen={showAbout}
        content={SKEPTIC_ABOUT}
        onClose={() => setShowAbout(false)}
      />
    </div>
  );
};

export default SkepticView;
