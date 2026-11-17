import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Image as ImageIcon, Check, RotateCcw, BookOpen, Download, HelpCircle, Type, LayoutGrid, CheckCircle2, Sparkles } from 'lucide-react';
import SimulationHeader from '../simulations/shared/SimulationHeader';
import AboutPanel from '../simulations/shared/AboutPanel';
import { TTSButton } from '../TTSButton';
import { DIAGRAM_LABELING_ABOUT } from './DiagramLabelingAbout';
import { DiagramLabelingCanvas } from './DiagramLabelingCanvas';
import { DIAGRAM_PRESETS } from './diagramLabelingPresets';
import {
  DiagramPreset,
  DiagramEvaluation,
  DiagramViewMode,
  DiagramInteractionStyle,
} from './diagramLabelingTypes';
import {
  evaluateDiagramAttempts,
  exportDiagramNotesToMarkdown,
} from './diagramLabelingEngine';
import { CourseType } from '../../types';

interface DiagramLabelingViewProps {
  onBack: () => void;
  course?: CourseType;
}

export const DiagramLabelingView: React.FC<DiagramLabelingViewProps> = ({
  onBack,
  course,
}) => {
  // Select initial preset based on course if available
  const initialPreset = useMemo(() => {
    if (course) {
      const match = DIAGRAM_PRESETS.find(p => p.course === course);
      if (match) return match;
    }
    return DIAGRAM_PRESETS[0];
  }, [course]);

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [viewMode, setViewMode] = useState<DiagramViewMode>('quiz');
  const [interactionStyle, setInteractionStyle] = useState<DiagramInteractionStyle>('word_bank');
  const [userGuesses, setUserGuesses] = useState<Record<string, string>>({});
  const [selectedCalloutId, setSelectedCalloutId] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<DiagramEvaluation | null>(null);
  const [revealedCalloutHints, setRevealedCalloutHints] = useState<Record<string, boolean>>({});
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentPreset: DiagramPreset = useMemo(() => {
    return DIAGRAM_PRESETS.find(p => p.id === selectedPresetId) || DIAGRAM_PRESETS[0];
  }, [selectedPresetId]);

  // Shuffled word bank items
  const [wordBank, setWordBank] = useState<string[]>([]);

  const shuffleArray = useCallback((array: string[]) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, []);

  // Initialize or reset preset state
  const resetPreset = useCallback((preset: DiagramPreset) => {
    setUserGuesses({});
    setEvaluation(null);
    setRevealedCalloutHints({});
    setSelectedCalloutId(preset.callouts[0]?.id || null);
    const labels = preset.callouts.map(c => c.label);
    setWordBank(shuffleArray(labels));
  }, [shuffleArray]);

  useEffect(() => {
    resetPreset(currentPreset);
  }, [currentPreset, resetPreset]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find next unfilled callout
  const findNextUnfilledId = (currentId: string | null) => {
    const unfilled = currentPreset.callouts.find(c => !userGuesses[c.id]?.trim() && c.id !== currentId);
    return unfilled ? unfilled.id : currentId;
  };

  // Handle assigning a word bank chip
  const handleWordBankClick = (word: string) => {
    if (viewMode === 'study') return;

    // Check if word is already assigned to a callout
    const existingCalloutId = Object.keys(userGuesses).find(k => userGuesses[k] === word);

    if (existingCalloutId) {
      // If clicking already assigned word, clear it
      setUserGuesses(prev => {
        const next = { ...prev };
        delete next[existingCalloutId];
        return next;
      });
      setSelectedCalloutId(existingCalloutId);
      return;
    }

    // Assign to active or first unfilled callout
    let targetId = selectedCalloutId;
    if (!targetId || (userGuesses[targetId] && userGuesses[targetId].trim())) {
      const nextUnfilled = currentPreset.callouts.find(c => !userGuesses[c.id]?.trim());
      if (nextUnfilled) targetId = nextUnfilled.id;
    }

    if (targetId) {
      setUserGuesses(prev => ({
        ...prev,
        [targetId!]: word,
      }));
      // Advance selection to next unfilled
      const nextId = findNextUnfilledId(targetId);
      setSelectedCalloutId(nextId);
    }
  };

  // Direct text input update
  const handleUpdateGuess = (calloutId: string, value: string) => {
    setUserGuesses(prev => ({
      ...prev,
      [calloutId]: value,
    }));
  };

  // Clear single guess
  const handleClearGuess = (calloutId: string) => {
    setUserGuesses(prev => {
      const next = { ...prev };
      delete next[calloutId];
      return next;
    });
  };

  // Check answers action
  const handleCheckAnswers = () => {
    const evalResult = evaluateDiagramAttempts(currentPreset, userGuesses);
    setEvaluation(evalResult);
    if (evalResult.scorePercentage === 100) {
      showToast('Flawless! All anatomical and functional callouts accurately identified!');
    } else if (evalResult.scorePercentage >= 70) {
      showToast(`Solid work: ${evalResult.correctCount}/${evalResult.totalCallouts} correct (${evalResult.scorePercentage}%).`);
    } else {
      showToast(`Mastery: ${evalResult.correctCount}/${evalResult.totalCallouts} correct. Review errors and retry!`);
    }
  };

  // Reveal all answers
  const handleRevealAll = () => {
    const fullKey: Record<string, string> = {};
    currentPreset.callouts.forEach(c => {
      fullKey[c.id] = c.label;
    });
    setUserGuesses(fullKey);
    const evalResult = evaluateDiagramAttempts(currentPreset, fullKey);
    setEvaluation(evalResult);
    showToast('Revealed complete answer key.');
  };

  // Export Markdown Study Guide
  const handleExportMarkdown = () => {
    const md = exportDiagramNotesToMarkdown(currentPreset, evaluation || undefined);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentPreset.id}-study-guide.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported Markdown study guide to downloads.');
  };

  const selectedCallout = currentPreset.callouts.find(c => c.id === selectedCalloutId);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium border border-indigo-400 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Standard Simulation Header */}
      <SimulationHeader
        title="Diagram Labeling"
        icon={ImageIcon}
        onBack={onBack}
        gradient="from-emerald-400 via-teal-400 to-cyan-500"
        onOpenAbout={() => setShowAbout(true)}
      />

      {/* Top Toolbar / Mode & Preset Bar */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 mb-6 border border-slate-700/60 shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Preset Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="preset-select" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Preset Diagram:
          </label>
          <select
            id="preset-select"
            value={selectedPresetId}
            onChange={e => setSelectedPresetId(e.target.value)}
            className="bg-slate-900 text-slate-200 text-sm font-medium rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {DIAGRAM_PRESETS.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.title} ({preset.course})
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle (Study vs Quiz) */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setViewMode('study')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'study'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Study Mode
          </button>
          <button
            onClick={() => setViewMode('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'quiz'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            Quiz Mode
          </button>
        </div>

        {/* Secondary Action Buttons */}
        <div className="flex items-center gap-2">
          {viewMode === 'quiz' && (
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700 mr-2">
              <button
                onClick={() => setInteractionStyle('word_bank')}
                title="Word Bank Matching"
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  interactionStyle === 'word_bank'
                    ? 'bg-slate-700 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setInteractionStyle('typing')}
                title="Direct Keyboard Entry"
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  interactionStyle === 'typing'
                    ? 'bg-slate-700 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={handleExportMarkdown}
            title="Export Markdown Study Guide"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-600"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Guide</span>
          </button>

          <button
            onClick={() => resetPreset(currentPreset)}
            title="Reset Diagram"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-600"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Column: Canvas & Description */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <DiagramLabelingCanvas
            preset={currentPreset}
            viewMode={viewMode}
            userGuesses={userGuesses}
            selectedCalloutId={selectedCalloutId}
            evaluation={evaluation}
            onSelectCallout={setSelectedCalloutId}
            onUpdateGuess={handleUpdateGuess}
          />

          {/* Preset Context Card */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {currentPreset.course} &bull; {currentPreset.topic}
              </span>
              <span className="text-xs text-slate-400">
                {currentPreset.callouts.length} Structural Callouts
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  {currentPreset.title}
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {currentPreset.description}
                </p>
              </div>
              <TTSButton
                text={`${currentPreset.title}. ${currentPreset.description}`}
                label="Listen"
                className="shrink-0 text-slate-400 hover:text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Interaction Panel / Word Bank / Callout Inspector */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Quiz Scorecard Banner when evaluated */}
          {evaluation && (
            <div className={`p-4 rounded-xl border shadow-lg flex items-center gap-4 ${
              evaluation.scorePercentage === 100
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : evaluation.scorePercentage >= 70
                ? 'bg-teal-950/40 border-teal-500/50 text-teal-200'
                : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
            }`}>
              <div className="w-12 h-12 rounded-full bg-slate-900/60 border border-current flex items-center justify-center font-black text-lg">
                {evaluation.scorePercentage}%
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  {evaluation.scorePercentage === 100
                    ? 'Mastery Achieved!'
                    : evaluation.scorePercentage >= 70
                    ? 'Proficient Understanding'
                    : 'Targeted Practice Needed'}
                </h3>
                <p className="text-xs opacity-90 mt-0.5">
                  {evaluation.correctCount} of {evaluation.totalCallouts} features accurately labeled
                </p>
              </div>
            </div>
          )}

          {/* Interactive Word Bank (if Quiz Mode & Word Bank selected) */}
          {viewMode === 'quiz' && interactionStyle === 'word_bank' && (
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
                  Word Bank
                </span>
                <span className="text-xs text-slate-400">
                  Click to assign to #{selectedCallout?.number || 1}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {wordBank.map(word => {
                  const isAssigned = Object.values(userGuesses).includes(word);
                  return (
                    <button
                      key={word}
                      onClick={() => handleWordBankClick(word)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isAssigned
                          ? 'bg-slate-900/50 text-slate-500 border border-slate-700/40 line-through'
                          : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 hover:border-emerald-400 shadow-sm'
                      }`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Callout Checklist / Input List */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 shadow-md flex flex-col flex-1 max-h-[460px] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {viewMode === 'study' ? 'Anatomical Callout Index' : 'Feature Checklist'}
              </span>
              <span className="text-xs text-slate-400">
                {Object.keys(userGuesses).filter(k => !!userGuesses[k]?.trim()).length}/{currentPreset.callouts.length}
              </span>
            </div>

            <div className="space-y-2">
              {currentPreset.callouts.map(callout => {
                const isSelected = selectedCalloutId === callout.id;
                const guess = userGuesses[callout.id] || '';
                const att = evaluation?.attempts[callout.id];

                return (
                  <div
                    key={callout.id}
                    onClick={() => setSelectedCalloutId(callout.id)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-700/80 border-blue-500 shadow-sm'
                        : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          att
                            ? att.isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                            : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {callout.number}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          {viewMode === 'study' ? callout.label : `Feature #${callout.number}`}
                        </span>
                      </div>

                      {/* Status indicator in quiz mode */}
                      {viewMode === 'quiz' && (
                        att ? (
                          att.isCorrect ? (
                            <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Correct
                            </span>
                          ) : (
                            <span className="text-rose-400 text-xs font-medium">
                              Incorrect
                            </span>
                          )
                        ) : guess.trim() ? (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleClearGuess(callout.id);
                            }}
                            className="text-slate-400 hover:text-slate-200 text-xs"
                            title="Clear answer"
                          >
                            Clear
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs italic">Unanswered</span>
                        )
                      )}
                    </div>

                    {/* In Quiz Mode: Text input or assigned pill */}
                    {viewMode === 'quiz' && (
                      <div className="mt-2" onClick={e => e.stopPropagation()}>
                        {interactionStyle === 'typing' ? (
                          <input
                            type="text"
                            value={guess}
                            onChange={e => handleUpdateGuess(callout.id, e.target.value)}
                            onFocus={() => setSelectedCalloutId(callout.id)}
                            placeholder={`Identify feature #${callout.number}...`}
                            className="w-full bg-slate-950 text-slate-100 text-xs px-2.5 py-1.5 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        ) : (
                          <div className="flex items-center justify-between bg-slate-950/70 px-2.5 py-1.5 rounded border border-slate-800 text-xs">
                            <span className={guess ? 'text-slate-200 font-medium' : 'text-slate-500 italic'}>
                              {guess || 'None selected from word bank'}
                            </span>
                            {guess && (
                              <button
                                onClick={() => handleClearGuess(callout.id)}
                                className="text-slate-500 hover:text-rose-400 text-xs font-bold"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        )}

                        {callout.hint && !att && (
                          <div className="mt-1.5">
                            {revealedCalloutHints[callout.id] ? (
                              <p className="text-[11px] text-amber-300/90 bg-amber-950/20 border border-amber-800/40 p-1.5 rounded animate-in fade-in">
                                💡 <strong>Clue:</strong> {callout.hint}
                              </p>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setRevealedCalloutHints(prev => ({ ...prev, [callout.id]: true }))}
                                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                              >
                                <HelpCircle className="w-3 h-3" />
                                <span>Need a clue?</span>
                              </button>
                            )}
                          </div>
                        )}

                        {att && !att.isCorrect && (
                          <p className="text-[11px] text-rose-400 mt-1">
                            Expected: {callout.label}
                          </p>
                        )}
                      </div>
                    )}

                    {/* In Study Mode: Detailed description & TTS */}
                    {viewMode === 'study' && (
                      <div className="mt-1.5 flex items-start justify-between gap-2">
                        <p className="text-xs text-slate-400 leading-relaxed flex-1">
                          {callout.description || callout.hint}
                        </p>
                        <TTSButton
                          text={`${callout.label}: ${callout.description || callout.hint}`}
                          label="Listen"
                          className="shrink-0 text-slate-400 hover:text-white text-xs"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Action Bar */}
            {viewMode === 'quiz' && (
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                <button
                  onClick={handleCheckAnswers}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs rounded-lg shadow-md transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Check Answers
                </button>
                <button
                  onClick={handleRevealAll}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-600"
                >
                  Reveal Key
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About / Help Modal */}
      <AboutPanel
        isOpen={showAbout}
        content={DIAGRAM_LABELING_ABOUT}
        onClose={() => setShowAbout(false)}
      />
    </div>
  );
};

export default DiagramLabelingView;
