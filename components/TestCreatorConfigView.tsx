import React, { useState } from 'react';
import { TestConfig } from '../types';
import { ArrowRight, ChevronDown, ChevronRight, BookOpen, Settings, FileText, CheckCircle } from 'lucide-react';

interface TestCreatorConfigViewProps {
    onStartTest: (config: TestConfig) => void;
    onBack: () => void;
    availableCourses: string[];
}

export const TestCreatorConfigView: React.FC<TestCreatorConfigViewProps> = ({
    onStartTest,
    onBack,
    availableCourses: _availableCourses
}) => {
    // --- STATE ---
    const [activeSection, setActiveSection] = useState<'context' | 'standards' | 'structure' | 'output' | null>('context');

    // Config State
    const [localConfig, setLocalConfig] = useState<TestConfig>({
        course: '',
        unitTitle: '',
        drivingQuestion: '',
        powerStandards: '',
        selectedStructure: 'Three-Section',
        mcqCount: 10,
        saCount: 2,
        calculationCount: 0,
        graphingCount: 0,
        includeRubric: true,
        includeAnswerKey: true,
        studentHeader: true,
        durationMinutes: 45,
        rigorProfile: 'Standard'
    });

    const [_courseQuery, _setCourseQuery] = useState('');
    const [_showCourseSuggestions, _setShowCourseSuggestions] = useState(false);

    // --- HANDLERS ---
    const updateConfig = (updates: Partial<TestConfig>) => {
        setLocalConfig(prev => ({ ...prev, ...updates }));
    };

    const handleStart = () => {
        if (!localConfig.course || !localConfig.unitTitle) return;
        onStartTest(localConfig);
    };

    // --- RENDER HELPERS ---
    const renderSectionHeader = (id: 'context' | 'standards' | 'structure' | 'output', title: string, icon: React.ReactNode, isComplete: boolean) => (
        <button
            onClick={() => setActiveSection(activeSection === id ? null : id)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all mb-4 ${activeSection === id ? 'bg-amber-50 border-amber-500 shadow-md' : 'bg-white border-slate-200 hover:border-amber-300'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeSection === id ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                    {icon}
                </div>
                <div className="text-left">
                    <h3 className={`font-bold ${activeSection === id ? 'text-amber-900' : 'text-slate-700'}`}>{title}</h3>
                    {isComplete && activeSection !== id && <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">Complete <CheckCircle className="w-3 h-3" /></span>}
                </div>
            </div>
            {activeSection === id ? <ChevronDown className="text-amber-500" /> : <ChevronRight className="text-slate-400" />}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
            <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">

                {/* Sidebar / Header */}
                <div className="bg-amber-500 p-8 md:w-1/3 flex flex-col justify-between text-white relative">
                    <button onClick={onBack} className="absolute top-6 left-6 text-amber-100 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        ← Back
                    </button>

                    <div className="mt-12">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-black mb-2">Test Creator</h1>
                        <p className="text-amber-100/90 text-lg leading-relaxed">Design comprehensive assessments aligned to your specific curriculum standards.</p>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/20">
                        <div className="text-xs font-bold uppercase tracking-widest text-amber-100 mb-2">Summary</div>
                        <ul className="space-y-2 text-sm font-medium">
                            <li className="flex justify-between"><span>Structure:</span> <span className="text-white">{localConfig.selectedStructure}</span></li>
                            <li className="flex justify-between"><span>Total Items:</span> <span className="text-white">{localConfig.mcqCount + localConfig.saCount + localConfig.calculationCount}</span></li>
                            <li className="flex justify-between"><span>Duration:</span> <span className="text-white">{localConfig.durationMinutes} min</span></li>
                        </ul>
                    </div>
                </div>

                {/* Main Config Area */}
                <div className="p-8 md:w-2/3 bg-slate-50">

                    {/* SECTION 1: CONTEXT */}
                    {renderSectionHeader('context', 'Test Context', <BookOpen className="w-5 h-5" />, !!localConfig.course && !!localConfig.unitTitle)}
                    {activeSection === 'context' && (
                        <div className="bg-white p-6 rounded-b-xl border-x border-b border-amber-200 -mt-4 mb-6 shadow-inner animate-in slide-in-from-top-2">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Course / Subject</label>
                                    <input
                                        type="text"
                                        value={localConfig.course}
                                        onChange={(e) => updateConfig({ course: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                                        placeholder="e.g. AP Biology, 8th Grade Science"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Unit Title</label>
                                    <input
                                        type="text"
                                        value={localConfig.unitTitle}
                                        onChange={(e) => updateConfig({ unitTitle: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                                        placeholder="e.g. Cellular Respiration"
                                    />
                                </div>
                                <button onClick={() => setActiveSection('standards')} className="w-full py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors">Next: Standards</button>
                            </div>
                        </div>
                    )}

                    {/* SECTION 2: STANDARDS */}
                    {renderSectionHeader('standards', 'Standards & Alignment', <CheckCircle className="w-5 h-5" />, !!localConfig.powerStandards)}
                    {activeSection === 'standards' && (
                        <div className="bg-white p-6 rounded-b-xl border-x border-b border-amber-200 -mt-4 mb-6 shadow-inner animate-in slide-in-from-top-2">
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Power Standards / Learning Objectives</label>
                            <textarea
                                value={localConfig.powerStandards}
                                onChange={(e) => updateConfig({ powerStandards: e.target.value })}
                                className="w-full p-3 rounded-lg border border-slate-300 h-32 text-sm"
                                placeholder="Paste your standards here (e.g. HS-LS1-1, define osmosis...)"
                            />
                            <div className="mt-4 flex gap-2">
                                <button onClick={() => updateConfig({ rigorProfile: 'Standard' })} className={`flex-1 py-2 text-xs font-bold rounded border ${localConfig.rigorProfile === 'Standard' ? 'bg-amber-100 border-amber-500 text-amber-700' : 'border-slate-200 text-slate-500'}`}>Standard</button>
                                <button onClick={() => updateConfig({ rigorProfile: 'Honors' })} className={`flex-1 py-2 text-xs font-bold rounded border ${localConfig.rigorProfile === 'Honors' ? 'bg-amber-100 border-amber-500 text-amber-700' : 'border-slate-200 text-slate-500'}`}>Honors</button>
                                <button onClick={() => updateConfig({ rigorProfile: 'AP/College' })} className={`flex-1 py-2 text-xs font-bold rounded border ${localConfig.rigorProfile === 'AP/College' ? 'bg-amber-100 border-amber-500 text-amber-700' : 'border-slate-200 text-slate-500'}`}>AP/College</button>
                            </div>
                            <button onClick={() => setActiveSection('structure')} className="w-full mt-4 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors">Next: Structure</button>
                        </div>
                    )}

                    {/* SECTION 3: STRUCTURE */}
                    {renderSectionHeader('structure', 'Test Structure', <Settings className="w-5 h-5" />, true)}
                    {activeSection === 'structure' && (
                        <div className="bg-white p-6 rounded-b-xl border-x border-b border-amber-200 -mt-4 mb-6 shadow-inner animate-in slide-in-from-top-2">
                            <div className="flex gap-4 mb-6">
                                <button onClick={() => updateConfig({ selectedStructure: 'Three-Section' })} className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${localConfig.selectedStructure === 'Three-Section' ? 'border-amber-500 bg-amber-50 relative' : 'border-slate-100 hover:border-amber-200'}`}>
                                    <div className="font-bold text-slate-800 mb-1">Three-Section Model</div>
                                    <div className="text-xs text-slate-500">Foundational → Application → Transfer. Best for comprehensive unit exams.</div>
                                    {localConfig.selectedStructure === 'Three-Section' && <div className="absolute top-2 right-2 text-amber-500"><CheckCircle className="w-4 h-4" /></div>}
                                </button>
                                <button onClick={() => updateConfig({ selectedStructure: 'Custom' })} className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${localConfig.selectedStructure === 'Custom' ? 'border-amber-500 bg-amber-50 relative' : 'border-slate-100 hover:border-amber-200'}`}>
                                    <div className="font-bold text-slate-800 mb-1">Custom Build</div>
                                    <div className="text-xs text-slate-500">Define your own mix of questions and types.</div>
                                    {localConfig.selectedStructure === 'Custom' && <div className="absolute top-2 right-2 text-amber-500"><CheckCircle className="w-4 h-4" /></div>}
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-1">
                                        <span>Multiple Choice</span>
                                        <span>{localConfig.mcqCount}</span>
                                    </div>
                                    <input type="range" min="0" max="50" value={localConfig.mcqCount} onChange={(e) => updateConfig({ mcqCount: parseInt(e.target.value) })} className="w-full accent-amber-500" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-1">
                                        <span>Short Answer</span>
                                        <span>{localConfig.saCount}</span>
                                    </div>
                                    <input type="range" min="0" max="20" value={localConfig.saCount} onChange={(e) => updateConfig({ saCount: parseInt(e.target.value) })} className="w-full accent-amber-500" />
                                </div>
                            </div>
                            <button onClick={() => setActiveSection('output')} className="w-full mt-6 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors">Next: Output Options</button>
                        </div>
                    )}

                    {/* SECTION 4: OUTPUT */}
                    {renderSectionHeader('output', 'Output Configuration', <FileText className="w-5 h-5" />, true)}
                    {activeSection === 'output' && (
                        <div className="bg-white p-6 rounded-b-xl border-x border-b border-amber-200 -mt-4 mb-6 shadow-inner animate-in slide-in-from-top-2">
                            <div className="space-y-3">
                                <button onClick={() => updateConfig({ includeRubric: !localConfig.includeRubric })} className="w-full flex justify-between items-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                                    <span className="font-bold text-slate-700">Generate Scoring Rubric</span>
                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${localConfig.includeRubric ? 'bg-amber-500' : 'bg-slate-300'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${localConfig.includeRubric ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                    </div>
                                </button>
                                <button onClick={() => updateConfig({ includeAnswerKey: !localConfig.includeAnswerKey })} className="w-full flex justify-between items-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                                    <span className="font-bold text-slate-700">Include Answer Key</span>
                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${localConfig.includeAnswerKey ? 'bg-amber-500' : 'bg-slate-300'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${localConfig.includeAnswerKey ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                    </div>
                                </button>
                            </div>
                            <button
                                onClick={handleStart}
                                disabled={!localConfig.course || !localConfig.unitTitle}
                                className={`w-full mt-6 py-4 rounded-xl font-black text-xl shadow-lg transition-all flex items-center justify-center gap-3 ${!localConfig.course || !localConfig.unitTitle ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-400 hover:-translate-y-1'}`}
                            >
                                Generate Test <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};
