import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AppConfig } from '../types';
import { FileText, ClipboardList, PenTool, Table, Beaker, FileSpreadsheet, Calculator, ArrowRight, BookOpen } from 'lucide-react';

interface DocumentConfigViewProps {
    mode: 'worksheet' | 'flashcards' | 'note_sheet' | 'frq' | 'cer' | 'calculation' | 'exit_ticket' | 'test_creator';
    config: AppConfig;
    onUpdateConfig: (newConfig: Partial<AppConfig>) => void;
    onStart: (course: string, topic: string) => void;
    onBack: () => void;
    availableCourses: string[]; // Pass from App.tsx logic
    getTopicsForCourse: (course: string) => string[]; // Pass from App.tsx logic
    initialCourse?: string;
    initialTopic?: string;
}

export const DocumentConfigView: React.FC<DocumentConfigViewProps> = ({
    mode,
    config,
    onUpdateConfig,
    onStart,
    onBack,
    availableCourses,
    getTopicsForCourse,
    initialCourse,
    initialTopic
}) => {
    // --- STATE ---
    const [courseQuery, setCourseQuery] = useState(initialCourse || '');
    const [topicQuery, setTopicQuery] = useState(initialTopic || '');
    const [selectedCourse, setSelectedCourse] = useState(initialCourse || '');

    // Suggestions State
    const [showCourseSuggestions, setShowCourseSuggestions] = useState(false);
    const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);
    const [_activeCourseIndex, setActiveCourseIndex] = useState(-1);
    const [_activeTopicIndex, setActiveTopicIndex] = useState(-1);

    const courseInputRef = useRef<HTMLInputElement>(null);
    const topicInputRef = useRef<HTMLInputElement>(null);
    // The wrappers hold each input and its suggestion list, so a click on a suggestion is not "outside".
    const courseBoxRef = useRef<HTMLDivElement>(null);
    const topicBoxRef = useRef<HTMLDivElement>(null);

    // --- LOGIC ---

    // Derived Mode Info
    const getModeInfo = () => {
        switch (mode) {
            case 'worksheet': return { title: 'Worksheet Generator', icon: <FileText className="w-8 h-8" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
            case 'flashcards': return { title: 'Flashcard Creator', icon: <Table className="w-8 h-8" />, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
            case 'frq': return { title: 'Written Response (FRQ)', icon: <PenTool className="w-8 h-8" />, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
            case 'cer': return { title: 'Data Analysis Builder', icon: <Beaker className="w-8 h-8" />, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' };
            case 'calculation': return { title: 'Problem Set Generator', icon: <Calculator className="w-8 h-8" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
            case 'exit_ticket': return { title: 'Exit Ticket Creator', icon: <ClipboardList className="w-8 h-8" />, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
            case 'note_sheet': return { title: 'Note Sheet Designer', icon: <FileSpreadsheet className="w-8 h-8" />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
            default: return { title: 'Document Creator', icon: <FileText className="w-8 h-8" />, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
        }
    };

    const modeInfo = getModeInfo();

    // Filters
    const courseSuggestions = useMemo(() => {
        if (!courseQuery) return availableCourses;
        return availableCourses.filter(c => c.toLowerCase().includes(courseQuery.toLowerCase()));
    }, [courseQuery, availableCourses]);

    const topicSuggestions = useMemo(() => {
        const matchedCourse = availableCourses.find(c => c.toLowerCase() === courseQuery.toLowerCase());
        const activeCourse = selectedCourse || matchedCourse;
        if (!activeCourse) return [];
        const topics = getTopicsForCourse(activeCourse);
        if (!topicQuery) return topics;
        return topics.filter(t => t.toLowerCase().includes(topicQuery.toLowerCase()));
    }, [selectedCourse, courseQuery, topicQuery, availableCourses, getTopicsForCourse]);

    // Handlers
    const handleCourseSelect = (course: string) => {
        setCourseQuery(course);
        setSelectedCourse(course);
        setShowCourseSuggestions(false);
        setActiveCourseIndex(-1);
        setTimeout(() => topicInputRef.current?.focus(), 100);
    };

    const handleTopicSelect = (topic: string) => {
        setTopicQuery(topic);
        setShowTopicSuggestions(false);
        setActiveTopicIndex(-1);
    };

    const handleStart = () => {
        if (courseQuery && topicQuery) {
            onStart(courseQuery, topicQuery);
        }
    };

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (courseBoxRef.current && !courseBoxRef.current.contains(e.target as Node)) setShowCourseSuggestions(false);
            if (topicBoxRef.current && !topicBoxRef.current.contains(e.target as Node)) setShowTopicSuggestions(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (initialCourse) {
            setCourseQuery(initialCourse);
            setSelectedCourse(initialCourse);
        }
        if (initialTopic) {
            setTopicQuery(initialTopic);
        }
    }, [initialCourse, initialTopic]);


    // --- RENDER HELPERS ---

    // Slider Component
    const renderSlider = (label: string, value: number, onChange: (val: number) => void, min: number, max: number, suffix: string = "") => (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</label>
                <span className="text-white font-black">{value}{suffix}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
        </div>
    );

    // Toggle Component
    const _renderToggle = (label: string, isActive: boolean, onToggle: () => void) => (
        <button
            onClick={onToggle}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all mb-4 ${isActive ? 'bg-indigo-600/20 border-indigo-500/50' : 'bg-slate-800 border-slate-700'}`}
        >
            <span className={`text-sm font-bold ${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>{label}</span>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isActive ? 'bg-indigo-500' : 'bg-slate-600'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
        </button>
    );

    const renderConfigPanel = () => {
        if (mode === 'worksheet' || mode === 'exit_ticket') {
            return (
                <div>
                    {mode === 'exit_ticket' && (
                        <div className="mb-8">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Quick Presets</label>
                            <div className="grid grid-cols-1 gap-2">
                                <button onClick={() => onUpdateConfig({ mcqCount: 1, saCount: 1 })} className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-sm font-bold text-slate-300 border border-slate-700 hover:border-indigo-500 transition-all">1 MCQ + 1 Short Answer</button>
                                <button onClick={() => onUpdateConfig({ mcqCount: 3, saCount: 0 })} className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-sm font-bold text-slate-300 border border-slate-700 hover:border-indigo-500 transition-all">3 MCQs (Quick Check)</button>
                                <button onClick={() => onUpdateConfig({ mcqCount: 0, saCount: 1 })} className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-sm font-bold text-slate-300 border border-slate-700 hover:border-indigo-500 transition-all">1 Reflective Question</button>
                            </div>
                        </div>
                    )}

                    {renderSlider("Multiple Choice Questions", config.mcqCount, (val) => onUpdateConfig({ mcqCount: val }), 0, 20)}
                    {renderSlider("Short Answer Questions", config.saCount, (val) => onUpdateConfig({ saCount: val }), 0, 10)}

                    <div className="border-t border-slate-700 my-6 pt-6"></div>

                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 block">Advanced Options</label>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Error Detection</label>
                            <input type="number" min="0" max="5" value={config.errorCount} onChange={(e) => onUpdateConfig({ errorCount: parseInt(e.target.value) || 0 })} className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-white font-bold text-center" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Analogies</label>
                            <input type="number" min="0" max="5" value={config.analogyCount || 0} onChange={(e) => onUpdateConfig({ analogyCount: parseInt(e.target.value) || 0 })} className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-white font-bold text-center" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Question Difficulty</label>
                        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                            {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                                <button key={d} onClick={() => onUpdateConfig({ difficulty: d })} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${config.difficulty === d ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{d}</button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (mode === 'frq') {
            return (
                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 block">Question Style</label>
                    <div className="space-y-2 mb-8">
                        {['Standard', 'Data Analysis', 'Experimental Design'].map(style => (
                            <button
                                key={style}
                                onClick={() => onUpdateConfig({ questionStyle: style })}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${config.questionStyle === style ? 'bg-rose-500/20 border-rose-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`}
                            >
                                <div className="font-bold">{style}</div>
                                <div className="text-xs opacity-70 mt-1">
                                    {style === 'Standard' ? 'Typical concept explanation and application.' :
                                        style === 'Data Analysis' ? 'Interpret charts, graphs, and tables.' :
                                            'Design experiments and identify variables.'}
                                </div>
                            </button>
                        ))}
                    </div>
                    {renderSlider("Difficulty Level (Complexity)", config.difficulty === 'Easy' ? 1 : config.difficulty === 'Medium' ? 2 : 3, (val) => onUpdateConfig({ difficulty: val === 1 ? 'Easy' : val === 2 ? 'Medium' : 'Hard' }), 1, 3, " / 3")}
                </div>
            );
        }

        if (mode === 'cer') {
            return (
                <div>
                    <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl mb-6">
                        <h4 className="font-bold text-indigo-300 text-sm mb-2">Data Scenario</h4>
                        <p className="text-xs text-indigo-200/70">The system will generate a unique data set (table/graph) based on the topic.</p>
                    </div>
                    {renderSlider("Scenario Complexity", config.difficulty === 'Easy' ? 1 : config.difficulty === 'Medium' ? 2 : 3, (val) => onUpdateConfig({ difficulty: val === 1 ? 'Easy' : val === 2 ? 'Medium' : 'Hard' }), 1, 3, " / 3")}
                </div>
            );
        }

        if (mode === 'test_creator') {
            return (
                <div>
                    <div className="mb-8">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Exam Composition</label>
                        <p className="text-xs text-slate-500 mb-6">Build your test by adjusting the mix of question types below.</p>

                        {renderSlider("Multiple Choice Questions", config.mcqCount, (val) => onUpdateConfig({ mcqCount: val }), 0, 30)}
                        {renderSlider("Short Answer Questions", config.saCount, (val) => onUpdateConfig({ saCount: val }), 0, 10)}
                    </div>

                    <div className="border-t border-slate-700 my-6 pt-6"></div>

                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 block">Cognitive Skills (Advanced)</label>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Analogies</label>
                            <input type="number" min="0" max="5" value={config.analogyCount || 0} onChange={(e) => onUpdateConfig({ analogyCount: parseInt(e.target.value) || 0 })} className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-white font-bold text-center" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Odd One Out</label>
                            <input type="number" min="0" max="5" value={config.oddOneOutCount || 0} onChange={(e) => onUpdateConfig({ oddOneOutCount: parseInt(e.target.value) || 0 })} className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-white font-bold text-center" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Test Difficulty</label>
                        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                            {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                                <button key={d} onClick={() => onUpdateConfig({ difficulty: d })} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${config.difficulty === d ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{d}</button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (mode === 'calculation') {
            return (
                <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Number of Problems</label>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={config.saCount} // Reusing saCount for problem count check
                        onChange={(e) => onUpdateConfig({ saCount: parseInt(e.target.value) || 5 })}
                        className="w-full bg-slate-800 border border-slate-700 text-white text-3xl font-black p-4 rounded-xl text-center mb-8 focus:border-cyan-500 outline-none"
                    />
                    {renderSlider("Difficulty", config.difficulty === 'Easy' ? 1 : config.difficulty === 'Medium' ? 2 : 3, (val) => onUpdateConfig({ difficulty: val === 1 ? 'Easy' : val === 2 ? 'Medium' : 'Hard' }), 1, 3, "")}

                    <div className="space-y-4 mb-6">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Problem Sequencing</label>
                        <div className="space-y-2">
                            {(['Massed', 'Interleaved', 'Increasing'] as const).map(seq => (
                                <button
                                    key={seq}
                                    onClick={() => onUpdateConfig({ sequencingStyle: seq })}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${config.sequencingStyle === seq ? 'bg-cyan-500/20 border-cyan-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`}
                                >
                                    <div className="font-bold">{seq === 'Massed' ? 'Massed (By Skill)' : seq === 'Interleaved' ? 'Randomly Interleaved' : 'Increasing Difficulty'}</div>
                                    <div className="text-xs opacity-70 mt-1">
                                        {seq === 'Massed' ? 'Group similar problems together for focused practice.' :
                                            seq === 'Interleaved' ? 'Mix different problem types to improve retention.' :
                                                'Start simple and progressively add complexity.'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // Default / Fallback
        return (
            <div className="text-center text-slate-500 italic text-sm p-4">
                No specific configuration for this mode.
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                {/* LEFT COLUMN: CONTEXT */}
                <div className="lg:col-span-7 bg-slate-900 rounded-[2rem] border border-slate-800 p-8 shadow-2xl flex flex-col relative">
                    {/* Header */}
                    <button
                        onClick={onBack}
                        className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest z-10"
                    >
                        ← Back
                    </button>

                    <div className="mt-12 mb-8">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${modeInfo.bg} ${modeInfo.color} border ${modeInfo.border}`}>
                            {modeInfo.icon}
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2">{modeInfo.title}</h1>
                        <p className="text-slate-400 text-lg">Define the context for your document.</p>
                    </div>

                    <div className="space-y-8 flex-1">
                        {/* Course Input */}
                        <div className="relative" ref={courseBoxRef}>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block flex items-center gap-2"><BookOpen className="w-4 h-4" /> 1. Subject / Course</label>
                            <input
                                ref={courseInputRef}
                                type="text"
                                value={courseQuery}
                                onChange={(e) => {
                                    setCourseQuery(e.target.value);
                                    setShowCourseSuggestions(true);
                                    if (selectedCourse && e.target.value !== selectedCourse) setSelectedCourse('');
                                }}
                                onFocus={() => setShowCourseSuggestions(true)}
                                placeholder="e.g. AP Biology, 8th Grade Science..."
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-4 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 text-lg"
                            />
                            {showCourseSuggestions && courseSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto z-20">
                                    {courseSuggestions.map((c) => (
                                        <button key={c} onClick={() => handleCourseSelect(c)} className="w-full text-left px-4 py-3 font-medium border-b border-slate-700 last:border-0 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">{c}</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Topic Input */}
                        <div className={`relative transition-all duration-500 ${!courseQuery ? 'opacity-50 pointer-events-none blur-sm' : 'opacity-100'}`} ref={topicBoxRef}>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block flex items-center gap-2"><ArrowRight className="w-4 h-4" /> 2. Topic / Unit</label>
                            <input
                                ref={topicInputRef}
                                type="text"
                                value={topicQuery}
                                onChange={(e) => {
                                    setTopicQuery(e.target.value);
                                    setShowTopicSuggestions(true);
                                }}
                                onFocus={() => setShowTopicSuggestions(true)}
                                placeholder="e.g. Photosynthesis, Newton's Laws..."
                                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-4 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 text-lg"
                            />
                            {showTopicSuggestions && topicSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto z-20">
                                    {topicSuggestions.map((t) => (
                                        <button key={t} onClick={() => handleTopicSelect(t)} className="w-full text-left px-4 py-3 font-medium border-b border-slate-700 last:border-0 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">{t}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: CONFIG */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 shadow-xl flex-1">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                <PenTool className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-white text-lg">Configuration</h3>
                        </div>

                        {renderConfigPanel()}

                    </div>

                    <button
                        onClick={handleStart}
                        disabled={!courseQuery || !topicQuery}
                        className={`w-full py-6 rounded-[1.5rem] font-black text-xl shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 ${!courseQuery || !topicQuery
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-900/50'
                            }`}
                    >
                        <span>Generate Document</span>
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>

            </div>
        </div>
    );
};
