import React, { useState } from 'react';
import { AppConfig } from '../types';

interface SettingsPanelProps {
    config: AppConfig;
    onUpdate: (newConfig: Partial<AppConfig>) => void;
    mode: string;
    transparent?: boolean;
}

const MAX_QUESTIONS_PER_TYPE = 10;

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, onUpdate, mode, transparent }) => {
    const [showWarning, setShowWarning] = useState(false);

    // Handler that validates and clamps values, showing warning if needed
    const handleQuestionCountChange = (field: keyof AppConfig, value: string) => {
        const numValue = parseInt(value) || 0;
        if (numValue > MAX_QUESTIONS_PER_TYPE) {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 3000);
            onUpdate({ [field]: MAX_QUESTIONS_PER_TYPE });
        } else {
            onUpdate({ [field]: Math.max(0, numValue) });
        }
    };

    return (
        <div className={`${transparent ? '' : 'bg-slate-800/30 border border-slate-700/50'} rounded-3xl p-6 md:p-8 mt-8 w-full backdrop-blur-sm overflow-hidden`}>
            <h3 className={`text-white font-black text-xl mb-6 flex items-center gap-3 ${transparent ? 'text-slate-800' : ''}`}>
                <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 shadow-inner shadow-indigo-500/10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </span>
                Session Settings
            </h3>

            <div className="space-y-8">
                {/* QUIZ / WORKSHEET SETTINGS */}
                {(mode === 'quiz' || mode === 'worksheet' || mode === 'quiz_my_notes') && (
                    <div className="space-y-8">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Difficulty */}
                            <div>
                                <label className={`text-sm font-bold uppercase tracking-wider mb-3 block ${transparent ? 'text-slate-500' : 'text-slate-400'}`}>Starting Difficulty</label>
                                <div className={`flex rounded-xl p-1.5 border ${transparent ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/50 border border-slate-700/50'}`}>
                                    {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => onUpdate({ difficulty: level })}
                                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${config.difficulty === level
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                                : transparent ? 'text-slate-500 hover:text-slate-800 hover:bg-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Progression Style */}
                            <div>
                                <label className={`text-sm font-bold uppercase tracking-wider mb-3 block ${transparent ? 'text-slate-500' : 'text-slate-400'}`}>Progression</label>
                                <div className={`flex rounded-xl p-1.5 border ${transparent ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/50 border border-slate-700/50'}`}>
                                    <button
                                        onClick={() => onUpdate({ worksheetStyle: 'Leveled' })}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${config.worksheetStyle === 'Leveled'
                                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/50'
                                            : transparent ? 'text-slate-500 hover:text-slate-800 hover:bg-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                            }`}
                                        title="Start easy, get harder"
                                    >
                                        Ramp Up
                                    </button>
                                    <button
                                        onClick={() => onUpdate({ worksheetStyle: 'Mixed' })}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${config.worksheetStyle === 'Mixed'
                                            ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/50'
                                            : transparent ? 'text-slate-500 hover:text-slate-800 hover:bg-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                            }`}
                                        title="Random difficulty mix"
                                    >
                                        Random Mix
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quiz MixControl */}
                        <div>
                            <label className={`text-sm font-bold uppercase tracking-wider mb-4 block border-b pb-2 ${transparent ? 'text-slate-800 border-slate-200' : 'text-white border-slate-700'}`}>Question Mix</label>

                            {/* Warning Message */}
                            {showWarning && (
                                <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Maximum 10 questions per type. Value has been capped.
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Standard Types */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-2xl border transition-all group ${transparent ? 'bg-slate-50 border-slate-200 hover:border-indigo-400' : 'bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/30'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm text-indigo-400 uppercase font-black tracking-wide">Multiple Choice</label>
                                            <input aria-label="Multiple Choice"
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={config.mcqCount}
                                                onChange={(e) => handleQuestionCountChange('mcqCount', e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                                className={`w-16 border text-center font-bold text-lg rounded-xl py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${transparent ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-600 text-white'}`}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 leading-snug">Standard selection questions to test recall and recognition.</p>
                                    </div>
                                    <div className={`p-4 rounded-2xl border transition-all group ${transparent ? 'bg-slate-50 border-slate-200 hover:border-indigo-400' : 'bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/30'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm text-indigo-400 uppercase font-black tracking-wide">Short Answer</label>
                                            <input aria-label="Short Answer"
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={config.saCount}
                                                onChange={(e) => handleQuestionCountChange('saCount', e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                                className={`w-16 border text-center font-bold text-lg rounded-xl py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${transparent ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-600 text-white'}`}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 leading-snug">Open-ended text responses requiring brief explanations.</p>
                                    </div>
                                </div>

                                {/* Advanced Types */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-2xl border transition-all group ${transparent ? 'bg-slate-50 border-slate-200 hover:border-teal-400' : 'bg-slate-800/50 border-slate-700/50 hover:border-teal-500/30'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm text-teal-400 uppercase font-black tracking-wide">Error Check</label>
                                            <input aria-label="Error Check"
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={config.errorCount}
                                                onChange={(e) => handleQuestionCountChange('errorCount', e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                                className={`w-16 border text-center font-bold text-lg rounded-xl py-2 focus:ring-2 focus:ring-teal-500 outline-none transition-all ${transparent ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-600 text-white'}`}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 leading-snug">Find and correct the factual error in a given statement.</p>
                                    </div>
                                    <div className={`p-4 rounded-2xl border transition-all group ${transparent ? 'bg-slate-50 border-slate-200 hover:border-teal-400' : 'bg-slate-800/50 border-slate-700/50 hover:border-teal-500/30'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm text-teal-400 uppercase font-black tracking-wide">Odd One Out</label>
                                            <input aria-label="Odd One Out"
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={config.oddOneOutCount || 0}
                                                onChange={(e) => handleQuestionCountChange('oddOneOutCount', e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                                className={`w-16 border text-center font-bold text-lg rounded-xl py-2 focus:ring-2 focus:ring-teal-500 outline-none transition-all ${transparent ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-600 text-white'}`}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 leading-snug">Identify the outlier option that doesn't fit the pattern.</p>
                                    </div>
                                </div>

                                {/* 6th Question Type */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-2xl border transition-all group ${transparent ? 'bg-slate-50 border-slate-200 hover:border-amber-400' : 'bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm text-amber-400 uppercase font-black tracking-wide">Fill in the Blank</label>
                                            <input aria-label="Fill in the Blank"
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={config.fillInBlankCount || 0}
                                                onChange={(e) => handleQuestionCountChange('fillInBlankCount', e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                                className={`w-16 border text-center font-bold text-lg rounded-xl py-2 focus:ring-2 focus:ring-amber-500 outline-none transition-all ${transparent ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-600 text-white'}`}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 leading-snug">Complete the sentence with the correct scientific term.</p>
                                    </div>
                                    <div className={`p-4 rounded-2xl border transition-all group ${transparent ? 'bg-slate-50 border-slate-200 hover:border-amber-400' : 'bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm text-amber-400 uppercase font-black tracking-wide">Analogies</label>
                                            <input aria-label="Analogies"
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={config.analogyCount || 0}
                                                onChange={(e) => handleQuestionCountChange('analogyCount', e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                                className={`w-16 border text-center font-bold text-lg rounded-xl py-2 focus:ring-2 focus:ring-amber-500 outline-none transition-all ${transparent ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-600 text-white'}`}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 leading-snug">Fill in the blank analogies to test relationships.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FRQ / CER Style */}
                {(mode === 'frq' || mode === 'cer') && (
                    <div className="space-y-6">
                        {mode === 'frq' && (
                            <div>
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 block">Question Style</label>
                                <select aria-label="Question Style"
                                    value={config.questionStyle || 'Standard'}
                                    onChange={(e) => onUpdate({ questionStyle: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 text-white text-base font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                                >
                                    <option value="Standard">Standard Conceptual</option>
                                    <option value="Data Analysis">Data Analysis</option>
                                    <option value="Experimental Design">Experimental Design</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block">Timer</label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={(config.timerDuration ?? 1200) === 0}
                                        onChange={(e) => onUpdate({ timerDuration: e.target.checked ? 0 : 1200 })}
                                        className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-0"
                                    />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Untimed Mode</span>
                                </label>
                            </div>

                            <div className={`bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 transition-opacity ${(config.timerDuration === 0) ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                <div className="flex items-center gap-4">
                                    <input aria-label="Timer length"
                                        type="range"
                                        min="5"
                                        max="60"
                                        step="5"
                                        value={((config.timerDuration ?? 1200) === 0 ? 20 : (config.timerDuration ?? 1200) / 60)}
                                        onChange={(e) => onUpdate({ timerDuration: parseInt(e.target.value) * 60 })}
                                        disabled={config.timerDuration === 0}
                                        className="flex-1 accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-white font-black text-xl w-16 text-right">
                                        {(config.timerDuration === 0) ? "∞" : Math.floor((config.timerDuration ?? 1200) / 60) + "m"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* EXPLANTION PARTNER SETTINGS */}
                {mode === 'explanation' && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 block">Partner Persona</label>
                            <div className="grid grid-cols-2 gap-3">
                                {([
                                    { value: 'Tutor', emoji: '📚', desc: 'Explains clearly, gives direct answers' },
                                    { value: 'Socratic', emoji: '🤔', desc: 'Asks probing questions' },
                                    { value: 'Skeptic', emoji: '🔬', desc: 'Challenges your reasoning' },
                                    { value: 'Growth Coach', emoji: '🌟', desc: 'Builds confidence, celebrates progress' }
                                ] as const).map(p => (
                                    <button
                                        key={p.value}
                                        onClick={() => onUpdate({ persona: p.value })}
                                        className={`p-3 rounded-xl border text-left transition-all ${config.persona === p.value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                                    >
                                        <div className="text-xs font-black uppercase mb-1">{p.emoji} {p.value}</div>
                                        <div className="text-[10px] opacity-75">{p.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* FLASHCARDS SETTINGS */}
                {mode === 'flashcards' && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 block">Card Style</label>
                            <div className="grid grid-cols-1 gap-3">
                                {(['Standard', 'Scenario', 'Concept Map'] as const).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => onUpdate({ flashcardStyle: s })}
                                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${config.flashcardStyle === s ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                                    >
                                        <span className="font-bold">{s}</span>
                                        {config.flashcardStyle === s && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TOPIC DASHBOARD SETTINGS */}
                {mode === 'multimode' && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 block">Dashboard Panels</label>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between bg-slate-800 p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-indigo-500 transition-colors">
                                    <span className="text-white font-bold text-sm">🤔 Explanation Partner</span>
                                    <input
                                        type="checkbox"
                                        checked={config.showExplanationPanel !== false}
                                        onChange={(e) => onUpdate({ showExplanationPanel: e.target.checked })}
                                        className="w-5 h-5 accent-indigo-500 rounded focus:ring-indigo-500"
                                    />
                                </label>
                                <label className="flex items-center justify-between bg-slate-800 p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-teal-500 transition-colors">
                                    <span className="text-white font-bold text-sm">🧮 Calculation Partner</span>
                                    <input
                                        type="checkbox"
                                        checked={config.showCalculationPanel !== false}
                                        onChange={(e) => onUpdate({ showCalculationPanel: e.target.checked })}
                                        className="w-5 h-5 accent-teal-500 rounded focus:ring-teal-500"
                                    />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 block">Partner Persona</label>
                            <div className="grid grid-cols-2 gap-3">
                                {([
                                    { value: 'Tutor', emoji: '📚', desc: 'Explains clearly' },
                                    { value: 'Socratic', emoji: '🤔', desc: 'Asks questions' },
                                    { value: 'Skeptic', emoji: '🔬', desc: 'Challenges you' },
                                    { value: 'Growth Coach', emoji: '🌟', desc: 'Builds confidence' }
                                ] as const).map(p => (
                                    <button
                                        key={p.value}
                                        onClick={() => onUpdate({ persona: p.value })}
                                        className={`p-3 rounded-xl border text-left transition-all ${config.persona === p.value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                                    >
                                        <div className="text-xs font-black uppercase mb-1">{p.emoji} {p.value}</div>
                                        <div className="text-[10px] opacity-75">{p.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
