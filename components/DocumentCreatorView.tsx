import React from 'react';
import { FileText, ClipboardList, PenTool, ArrowRight, Beaker, FileSpreadsheet, Calculator, Sparkles, Flame, Activity, Atom } from 'lucide-react';
import { AppConfig } from '../types';

export interface DocumentPreset {
    id: string;
    title: string;
    unit: string;
    unitBadge: string;
    badgeColor: string;
    modeLabel: string;
    description: string;
    mode: 'worksheet' | 'cer' | 'frq' | 'calculation' | 'exit_ticket';
    course: string;
    topic: string;
    configUpdates: Partial<AppConfig>;
    icon: React.ReactNode;
}

export const CHEMISTRY_PRESETS: DocumentPreset[] = [
    {
        id: 'unit-1-hygiene',
        title: 'Chemical Hygiene & Structure',
        unit: 'Unit 1 Storyline',
        unitBadge: 'Unit 1 · Hygiene & Structure',
        badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        modeLabel: 'Safety & Periodic Trends',
        description: 'Hazard identification, SDS protocols, atomic orbital arrangements, and periodic trend justifications.',
        mode: 'worksheet',
        course: 'General Chemistry',
        topic: 'Chemical Hygiene and Atomic Structure',
        configUpdates: { mcqCount: 5, saCount: 3, difficulty: 'Medium' },
        icon: <Beaker className="w-5 h-5 text-emerald-500" />
    },
    {
        id: 'unit-2-prata',
        title: 'Prata Problems & Stoichiometry',
        unit: 'Unit 2 Storyline',
        unitBadge: 'Unit 2 · Quantities & Moles',
        badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        modeLabel: 'Calculation Set',
        description: 'Multi-step dimensional analysis, molar conversions, limiting reactant calculations, and theoretical yields.',
        mode: 'calculation',
        course: 'General Chemistry',
        topic: 'The Mole and Stoichiometry',
        configUpdates: { saCount: 5, difficulty: 'Medium', sequencingStyle: 'Increasing' },
        icon: <Calculator className="w-5 h-5 text-cyan-500" />
    },
    {
        id: 'unit-3-calorimetry',
        title: 'Calorimetry & Heat Transfer',
        unit: 'Unit 3 Storyline',
        unitBadge: 'Unit 3 · Energy',
        badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
        modeLabel: 'Calculation Set',
        description: 'Specific heat calculations (q = mcΔT), insulated coffee-cup data, and heating curve phase transitions.',
        mode: 'calculation',
        course: 'General Chemistry',
        topic: 'Thermochemistry and Calorimetry',
        configUpdates: { saCount: 5, difficulty: 'Medium', sequencingStyle: 'Increasing' },
        icon: <Flame className="w-5 h-5 text-amber-500" />
    },
    {
        id: 'unit-4-equilibrium',
        title: 'Kinetics & Blood Homeostasis',
        unit: 'Unit 4 Storyline',
        unitBadge: 'Unit 4 · Equilibrium',
        badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        modeLabel: 'CER Data Analysis',
        description: 'Claim-Evidence-Reasoning scenarios on Le Chatelier stress, collision frequency, and arterial blood buffering.',
        mode: 'cer',
        course: 'General Chemistry',
        topic: 'Reaction Rates and Equilibrium',
        configUpdates: { difficulty: 'Medium' },
        icon: <Activity className="w-5 h-5 text-indigo-500" />
    },
    {
        id: 'unit-5-nuclear',
        title: 'Nuclear Decay & Element Origin',
        unit: 'Unit 5 Storyline',
        unitBadge: 'Unit 5 · Nuclear',
        badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
        modeLabel: 'Standard Worksheet',
        description: 'Balancing alpha/beta transmutations, exponential radiometric half-life dating, and stellar nucleosynthesis.',
        mode: 'worksheet',
        course: 'General Chemistry',
        topic: 'Nuclear Chemistry (Fission/Fusion)',
        configUpdates: { mcqCount: 5, saCount: 3, difficulty: 'Medium' },
        icon: <Atom className="w-5 h-5 text-rose-500" />
    }
];

interface DocumentCreatorViewProps {
    onBack: () => void;
    onStartWorksheet: () => void;
    onStartCER: () => void;
    onStartFRQ: () => void;
    onStartCalculation: () => void;
    onStartExitTicket: () => void;
    onStartTest?: () => void; // Optional/Deprecated
    onSelectPreset?: (preset: DocumentPreset) => void;
}

const DocumentCreatorView: React.FC<DocumentCreatorViewProps> = ({
    onBack,
    onStartWorksheet,
    onStartCER,
    onStartFRQ,
    onStartCalculation,
    onStartExitTicket,
    onStartTest,
    onSelectPreset
}) => {
    return (
        <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
            <div className="max-w-6xl w-full">
                {/* Header */}
                <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                    <button
                        onClick={onBack}
                        className="absolute top-0 left-0 text-slate-400 hover:text-slate-600 flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Menu
                    </button>

                    <div className="inline-block bg-emerald-100 text-emerald-600 p-4 rounded-2xl mb-4">
                        <span className="text-4xl">📄</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Document Creator</h1>
                    <p className="text-slate-500 text-lg max-w-xl mx-auto">
                        Generate curriculum-aligned resources for your classroom. Pick a 1-click unit preset or choose a document format below.
                    </p>
                </div>

                {/* 1-Click Chemistry Presets (Units 1-5) */}
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">
                                1-Click Curriculum Presets · General Chemistry (Units 1–5)
                            </h2>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
                            Pre-configured with topics &amp; optimal problem distributions
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {CHEMISTRY_PRESETS.map((preset) => (
                            <div
                                key={preset.id}
                                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-400/60 transition-all flex flex-col justify-between gap-4 group"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2.5">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${preset.badgeColor}`}>
                                            {preset.unitBadge}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                            {preset.modeLabel}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        {preset.icon}
                                        <h3 className="text-base font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                                            {preset.title}
                                        </h3>
                                    </div>
                                    <p className="text-slate-500 text-xs leading-relaxed">
                                        {preset.description}
                                    </p>
                                </div>
                                <button
                                    onClick={() => onSelectPreset?.(preset)}
                                    className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-black flex items-center justify-center gap-1.5 transition-all"
                                >
                                    <span>Load Preset</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section Divider */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Custom Document Formats</span>
                    <span className="flex-1 h-[1px] bg-slate-200"></span>
                </div>

                {/* Selection Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Worksheet Generator (Standard) */}
                    <button
                        onClick={onStartWorksheet}
                        className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 hover:border-emerald-500 hover:shadow-2xl hover:-translate-y-1 transition-all group text-left relative overflow-hidden h-full flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FileText className="w-32 h-32 text-emerald-500" />
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors">
                            <FileText className="w-6 h-6 text-emerald-600 group-hover:text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">Standard Worksheet</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-1">
                            Mixed practice sets with Multiple Choice and Short Answer questions.
                        </p>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                            Start Design <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>





                    {/* Data Analysis (CER) */}
                    <button
                        onClick={onStartCER}
                        className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-1 transition-all group text-left relative overflow-hidden h-full flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Beaker className="w-32 h-32 text-indigo-500" />
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 transition-colors">
                            <Beaker className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">Data Analysis (CER)</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-1">
                            Scenarios with data tables and graphs for Claim-Evidence-Reasoning practice.
                        </p>
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                            Design Scenario <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>

                    {/* Written Response (FRQ) */}
                    <button
                        onClick={onStartFRQ}
                        className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 hover:border-rose-500 hover:shadow-2xl hover:-translate-y-1 transition-all group text-left relative overflow-hidden h-full flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <PenTool className="w-32 h-32 text-rose-500" />
                        </div>
                        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-rose-500 transition-colors">
                            <PenTool className="w-6 h-6 text-rose-600 group-hover:text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-rose-600 transition-colors">Written Response</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-1">
                            Free Response Questions (FRQs) with scenarios and multi-part prompts.
                        </p>
                        <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                            Create FRQ <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>

                    {/* Calculation Problem Set */}
                    <button
                        onClick={onStartCalculation}
                        className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 hover:border-cyan-500 hover:shadow-2xl hover:-translate-y-1 transition-all group text-left relative overflow-hidden h-full flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Calculator className="w-32 h-32 text-cyan-500" />
                        </div>
                        <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-500 transition-colors">
                            <Calculator className="w-6 h-6 text-cyan-600 group-hover:text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-cyan-600 transition-colors">Problem Set</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-1">
                            Math-heavy calculation problems (e.g., Stoichiometry, Physics) with answer keys.
                        </p>
                        <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-wider">
                            Generate Set <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>


                    {/* Test Creator (BETA) */}
                    <button
                        onClick={onStartTest}
                        className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 hover:border-amber-500 hover:shadow-2xl hover:-translate-y-1 transition-all group text-left relative overflow-hidden h-full flex flex-col"
                    >
                        <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest z-10">
                            Beta
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FileSpreadsheet className="w-32 h-32 text-amber-500" />
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors">
                            <FileSpreadsheet className="w-6 h-6 text-amber-600 group-hover:text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">Test Creator</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-1">
                            Build comprehensive exams with multiple sections and mixed question types.
                        </p>
                        <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                            Build Test <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>

                    {/* Exit Ticket */}
                    <button
                        onClick={onStartExitTicket}
                        className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 hover:border-slate-500 hover:shadow-2xl hover:-translate-y-1 transition-all group text-left relative overflow-hidden h-full flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ClipboardList className="w-32 h-32 text-slate-500" />
                        </div>
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-slate-500 transition-colors">
                            <ClipboardList className="w-6 h-6 text-slate-600 group-hover:text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-600 transition-colors">Exit Ticket</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed flex-1">
                            Short, targeted check for understanding (1-3 questions) to end a lesson.
                        </p>
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider">
                            Create Slip <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentCreatorView;
