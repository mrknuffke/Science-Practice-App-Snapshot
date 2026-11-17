import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Rocket, Target, PenTool, BarChart2, MessageSquare, Calculator, Layers, Zap } from 'lucide-react';
import { SettingsPanel } from './SettingsPanel';
import { AppConfig, CourseType } from '../types';
import { getUnitsForCourse, getTopicsForUnit, hasUnits, getRandomTopicForCourse, getRandomCourseAndTopic } from '../constants';

interface UniversalInputViewProps {
    level: string;
    availableCourses: string[];
    getTopicsForCourse: (course: string) => string[];
    onStart: (course: string, topics: string | string[], modeOverride?: string) => void;
    onBack: () => void;
    onBrowse: () => void;
    config: AppConfig;
    onUpdateConfig: (newConfig: Partial<AppConfig>) => void;
    mode: string;
    onUpdateMode?: (newMode: string) => void;
    initialCourse?: string | null;
    initialTopic?: string | null;
    onStartResearch?: (course: string) => void;
}

const AVAILABLE_MODES = [
    { id: 'quiz', label: 'Adaptive Practice', tag: 'MCQ & SA', icon: Target },
    { id: 'flashcards', label: 'Flashcards', tag: 'Recall Deck', icon: Layers },
    { id: 'frq', label: 'Written Response', tag: 'AP FRQ', icon: PenTool },
    { id: 'cer', label: 'Data Analysis', tag: 'C.E.R.', icon: BarChart2 },
    { id: 'explanation', label: 'Socratic Chat', tag: 'Tutor Chat', icon: MessageSquare },
    { id: 'calculation', label: 'Equation Solver', tag: 'Math Helper', icon: Calculator },
    { id: 'multimode', label: 'Topic Dashboard', tag: 'All-in-One', icon: Zap },
];

export const UniversalInputView: React.FC<UniversalInputViewProps> = ({
    level,
    availableCourses,
    getTopicsForCourse,
    onStart,
    onBack,
    onBrowse,
    config,
    onUpdateConfig,
    mode,
    onUpdateMode,
    initialCourse,
    initialTopic,
    onStartResearch: _onStartResearch
}) => {
    const isValidMode = (m?: string) => AVAILABLE_MODES.some(item => item.id === m);
    const [selectedMode, setSelectedMode] = useState<string>(isValidMode(mode) ? mode : 'quiz');
    const [courseQuery, setCourseQuery] = useState(initialCourse || '');
    const [topicQuery, setTopicQuery] = useState(initialTopic || '');
    const [selectedCourse, setSelectedCourse] = useState(initialCourse || '');
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

    const [showCourseSuggestions, setShowCourseSuggestions] = useState(false);
    const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);

    // Multi-topic state
    const [multiTopicMode, setMultiTopicMode] = useState(false);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [multiTopicText, setMultiTopicText] = useState('');

    // Keyboard Navigation State
    const [activeCourseIndex, setActiveCourseIndex] = useState(-1);
    const [activeTopicIndex, setActiveTopicIndex] = useState(-1);

    const courseInputRef = useRef<HTMLInputElement>(null);
    const topicInputRef = useRef<HTMLInputElement>(null);
    // The wrappers hold each input and its suggestion list, so a click on a suggestion is not "outside".
    const courseBoxRef = useRef<HTMLDivElement>(null);
    const topicBoxRef = useRef<HTMLDivElement>(null);

    // Sync external mode if changed
    useEffect(() => {
        const safeMode = isValidMode(mode) ? mode : 'quiz';
        if (safeMode !== selectedMode) {
            setSelectedMode(safeMode);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync only when the parent changes mode; reading selectedMode here would undo the student's own choice.
    }, [mode]);

    const handleModeChange = (newMode: string) => {
        const safeMode = isValidMode(newMode) ? newMode : 'quiz';
        setSelectedMode(safeMode);
        onUpdateMode?.(safeMode);
    };

    // Filter courses based on input
    const courseSuggestions = useMemo(() => {
        if (!courseQuery) return availableCourses;
        return availableCourses.filter(c =>
            c.toLowerCase().includes(courseQuery.toLowerCase())
        );
    }, [courseQuery, availableCourses]);

    // Filter topics based on selected course and input
    const topicSuggestions = useMemo(() => {
        const matchedCourse = availableCourses.find(c => c.toLowerCase() === courseQuery.toLowerCase());
        const activeCourse = selectedCourse || matchedCourse;

        if (!activeCourse) return [];

        const topics = getTopicsForCourse(activeCourse);
        if (!topicQuery) return topics;

        return topics.filter(t =>
            t.toLowerCase().includes(topicQuery.toLowerCase())
        );
    }, [selectedCourse, courseQuery, topicQuery, availableCourses, getTopicsForCourse]);

    const handleCourseSelect = (course: string) => {
        setCourseQuery(course);
        setSelectedCourse(course);
        setSelectedUnit(null);
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
        if (courseQuery) {
            const safeMode = isValidMode(selectedMode) ? selectedMode : 'quiz';
            if (multiTopicMode && selectedTopics.length > 0) {
                onStart(courseQuery, selectedTopics, safeMode);
            } else if (!multiTopicMode && topicQuery) {
                onStart(courseQuery, topicQuery, safeMode);
            }
        }
    };

    const handlePracticeWholeUnit = (unit: string) => {
        const allTopicsInUnit = getTopicsForUnit(courseQuery as CourseType, unit);
        setSelectedTopics(allTopicsInUnit);
        setMultiTopicText(allTopicsInUnit.join(', '));
        setSelectedUnit(unit);
        setMultiTopicMode(true);
        setTopicQuery('');
    };

    const handleSelectUnitFilter = (unit: string) => {
        setSelectedUnit(prev => prev === unit ? null : unit);
        const topics = getTopicsForUnit(courseQuery as CourseType, unit);
        if (topics && topics.length > 0) {
            setTopicQuery(topics[0]);
        }
    };

    const handleMultiTopicInput = (value: string) => {
        setMultiTopicText(value);
        const topics = value
            .split(/[,\n]+/)
            .map(t => t.trim())
            .filter(t => t.length > 0);
        setSelectedTopics(Array.from(new Set(topics)));
    };

    const removeSelectedTopic = (topicToRemove: string) => {
        const nextTopics = selectedTopics.filter(t => t !== topicToRemove);
        setSelectedTopics(nextTopics);
        setMultiTopicText(nextTopics.join(', '));
    };

    const handleSurpriseMe = () => {
        let course = courseQuery as CourseType;
        if (!course) {
            const pair = getRandomCourseAndTopic((availableCourses && availableCourses.length > 0 ? availableCourses : undefined) as CourseType[] | undefined);
            if (!pair) return;
            setCourseQuery(pair.course);
            setSelectedCourse(pair.course);
            course = pair.course;
            if (multiTopicMode) {
                setSelectedTopics([pair.topic]);
                setMultiTopicText(pair.topic);
            } else {
                setTopicQuery(pair.topic);
                setShowTopicSuggestions(false);
            }
            return;
        }

        const randomTopic = getRandomTopicForCourse(course);
        if (!randomTopic) return;

        if (multiTopicMode) {
            if (!selectedTopics.includes(randomTopic)) {
                const nextTopics = [...selectedTopics, randomTopic];
                setSelectedTopics(nextTopics);
                setMultiTopicText(nextTopics.join(', '));
            }
        } else {
            setTopicQuery(randomTopic);
            setShowTopicSuggestions(false);
        }
    };

    // Keyboard Handler for Course
    const handleCourseKeyDown = (e: React.KeyboardEvent) => {
        if (!showCourseSuggestions) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveCourseIndex(prev => (prev < courseSuggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveCourseIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeCourseIndex >= 0 && courseSuggestions[activeCourseIndex]) {
                handleCourseSelect(courseSuggestions[activeCourseIndex]);
            } else {
                setShowCourseSuggestions(false);
                topicInputRef.current?.focus();
            }
        } else if (e.key === 'Escape') {
            setShowCourseSuggestions(false);
        }
    };

    // Keyboard Handler for Topic
    const handleTopicKeyDown = (e: React.KeyboardEvent) => {
        if (showTopicSuggestions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveTopicIndex(prev => (prev < topicSuggestions.length - 1 ? prev + 1 : prev));
                return;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveTopicIndex(prev => (prev > 0 ? prev - 1 : prev));
                return;
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeTopicIndex >= 0 && topicSuggestions[activeTopicIndex]) {
                    handleTopicSelect(topicSuggestions[activeTopicIndex]);
                    return;
                }
            } else if (e.key === 'Escape') {
                setShowTopicSuggestions(false);
                return;
            }
        }

        if (e.key === 'Enter') {
            handleStart();
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (courseBoxRef.current && !courseBoxRef.current.contains(e.target as Node)) {
                setShowCourseSuggestions(false);
            }
            if (topicBoxRef.current && !topicBoxRef.current.contains(e.target as Node)) {
                setShowTopicSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getCoursePlaceholder = () => {
        if (level === 'Elementary School') return "e.g. 5th Grade Science, Life Science...";
        if (level === 'Middle School') return "e.g. 8th Grade Science, Earth Science...";
        return "e.g. AP Biology, Honors Chemistry...";
    };

    const getTopicPlaceholder = () => {
        if (level === 'Elementary School') return "e.g. Plants, Solar System, Magnets...";
        if (level === 'Middle School') return "e.g. Cell Theory, Forces, Rock Cycle...";
        return "e.g. Cellular Respiration, Stoichiometry, Kinematics...";
    };

    const activeModeMeta = AVAILABLE_MODES.find(m => m.id === selectedMode) || AVAILABLE_MODES[0];

    return (
        <div className="w-full max-w-5xl mx-auto p-4 transition-colors duration-300">
            {/* Card Container */}
            <div className="w-full bg-white dark:bg-[#15171C] rounded-[2rem] border border-slate-100 dark:border-slate-800/80 shadow-xl transition-all duration-300 relative z-10 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/20 relative">
                    <button
                        onClick={onBack}
                        className="absolute top-8 left-8 text-slate-400 hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-550 dark:text-[#818CF8] mb-4 mx-auto">
                        <Rocket className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-[#1A1C21] dark:text-white mb-2 font-rounded">Configure Practice Session</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                        Tailoring <span className="text-indigo-600 dark:text-[#818CF8] font-bold">{activeModeMeta.label}</span> for <span className="font-bold text-slate-700 dark:text-slate-300">{courseQuery || level}</span>
                    </p>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8 bg-white dark:bg-[#15171C]">

                    {/* 0. Practice Mode Selector */}
                    <div>
                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block">
                            1. Select Practice Mode
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {AVAILABLE_MODES.map((m) => {
                                const Icon = m.icon;
                                const isSelected = selectedMode === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => handleModeChange(m.id)}
                                        className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2.5 transition-all ${
                                            isSelected
                                                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                                                : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white dark:bg-[#818CF8] dark:text-slate-900' : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500'}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-slate-800 text-slate-500">
                                                {m.tag}
                                            </span>
                                        </div>
                                        <div>
                                            <p className={`text-xs font-black font-rounded ${isSelected ? 'text-indigo-600 dark:text-[#818CF8]' : 'text-slate-800 dark:text-slate-200'}`}>
                                                {m.label}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 1. Course Input */}
                    <div className="relative" ref={courseBoxRef}>
                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">
                            2. Choose a Course
                        </label>
                        <input
                            ref={courseInputRef}
                            type="text"
                            value={courseQuery}
                            onChange={(e) => {
                                setCourseQuery(e.target.value);
                                setShowCourseSuggestions(true);
                                setActiveCourseIndex(-1);
                                if (selectedCourse && e.target.value !== selectedCourse) {
                                    setSelectedCourse('');
                                }
                            }}
                            onKeyDown={handleCourseKeyDown}
                            onFocus={() => setShowCourseSuggestions(true)}
                            placeholder={getCoursePlaceholder()}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#1A1C21] dark:text-white rounded-xl px-4 py-4 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-650"
                        />
                        {/* Suggestions Dropdown */}
                        {showCourseSuggestions && courseSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#15171C] border border-slate-150 dark:border-slate-800 rounded-xl shadow-xl max-h-60 overflow-y-auto z-20">
                                {courseSuggestions.map((course, index) => (
                                    <button
                                        key={course}
                                        onClick={() => handleCourseSelect(course)}
                                        className={`w-full text-left px-4 py-3 font-medium border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors ${
                                            index === activeCourseIndex 
                                                ? 'bg-indigo-650 text-white dark:bg-indigo-600' 
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                    >
                                        {course}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. Topic Selection */}
                    <div className={`transition-opacity duration-500 ${!courseQuery ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                3. Choose Topic(s)
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleSurpriseMe}
                                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 transition-colors"
                                    title="Pick a random topic from this course"
                                >
                                    <span>🎲</span>
                                    <span>Surprise Me</span>
                                </button>
                                <span className="text-slate-300 dark:text-slate-700">|</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const nextMode = !multiTopicMode;
                                        setMultiTopicMode(nextMode);
                                        if (nextMode) {
                                            if (topicQuery.trim()) {
                                                setSelectedTopics([topicQuery.trim()]);
                                                setMultiTopicText(topicQuery.trim());
                                            } else {
                                                setSelectedTopics([]);
                                                setMultiTopicText('');
                                            }
                                        } else {
                                            if (selectedTopics.length > 0) {
                                                setTopicQuery(selectedTopics[0]);
                                            }
                                            setSelectedTopics([]);
                                            setMultiTopicText('');
                                        }
                                    }}
                                    className="text-xs font-bold text-indigo-600 dark:text-[#818CF8] hover:underline transition-colors"
                                >
                                    {multiTopicMode ? '← Single Topic' : 'Multiple Topics →'}
                                </button>
                            </div>
                        </div>

                        {/* Quick Start Unit Badges */}
                        {selectedCourse && hasUnits(courseQuery as CourseType) && (
                            <div className="mb-3.5 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-150 dark:border-slate-800/60">
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2 font-bold uppercase tracking-wider">
                                    Quick Browse Curriculum Units:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {getUnitsForCourse(courseQuery as CourseType).map(unit => (
                                        <button
                                            key={unit}
                                            type="button"
                                            onClick={() => multiTopicMode ? handlePracticeWholeUnit(unit) : handleSelectUnitFilter(unit)}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                selectedUnit === unit
                                                    ? 'bg-indigo-600 text-white shadow-sm dark:bg-[#818CF8] dark:text-slate-900'
                                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                                            }`}
                                        >
                                            📚 {unit}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!multiTopicMode ? (
                            /* Single Topic Input */
                            <div className="relative" ref={topicBoxRef}>
                                <input
                                    ref={topicInputRef}
                                    type="text"
                                    value={topicQuery}
                                    onChange={(e) => {
                                        setTopicQuery(e.target.value);
                                        setShowTopicSuggestions(true);
                                        setActiveTopicIndex(-1);
                                    }}
                                    onKeyDown={handleTopicKeyDown}
                                    onFocus={() => setShowTopicSuggestions(true)}
                                    placeholder={selectedCourse ? `Search topics in ${selectedCourse}...` : getTopicPlaceholder()}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#1A1C21] dark:text-white rounded-xl px-4 py-4 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-650"
                                />
                                {showTopicSuggestions && topicSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#15171C] border border-slate-150 dark:border-slate-800 rounded-xl shadow-xl max-h-60 overflow-y-auto z-20">
                                        {topicSuggestions.map((topic, index) => (
                                            <button
                                                key={topic}
                                                onClick={() => handleTopicSelect(topic)}
                                                className={`w-full text-left px-4 py-3 font-medium border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors ${
                                                    index === activeTopicIndex 
                                                ? 'bg-indigo-650 text-white dark:bg-indigo-600' 
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                }`}
                                            >
                                                {topic}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Multi-Topic Input */
                            <div className="space-y-4">
                                <textarea
                                    value={multiTopicText}
                                    onChange={(e) => handleMultiTopicInput(e.target.value)}
                                    placeholder="Enter topics separated by commas (e.g., Photosynthesis, Cellular Respiration, Calvin Cycle)"
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#1A1C21] dark:text-white rounded-xl px-4 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-650 resize-none"
                                />

                                {/* Selected Topics Chips */}
                                {selectedTopics.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTopics.map(topic => (
                                            <div
                                                key={topic}
                                                className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-[#818CF8] text-sm font-semibold rounded-full border border-indigo-100 dark:border-indigo-900/50"
                                            >
                                                <span>{topic}</span>
                                                <button
                                                    onClick={() => removeSelectedTopic(topic)}
                                                    className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-bold ml-1 text-xs"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 3. Session Settings Panel */}
                    <SettingsPanel config={config} onUpdate={onUpdateConfig} mode={selectedMode} />

                    {/* Action Button */}
                    <button
                        onClick={handleStart}
                        disabled={!courseQuery || (!topicQuery && selectedTopics.length === 0)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] text-white dark:text-slate-900 rounded-xl py-4 font-black text-lg shadow-lg shadow-indigo-900/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] font-rounded flex items-center justify-center gap-2"
                    >
                        <span>{activeModeMeta.icon && React.createElement(activeModeMeta.icon, { className: "w-5 h-5 inline" })}</span>
                        <span>
                            {multiTopicMode && selectedTopics.length > 1
                                ? `Launch ${activeModeMeta.label} (${selectedTopics.length} Topics)`
                                : `Launch ${activeModeMeta.label}`}
                        </span>
                    </button>

                    <div className="text-center pt-4 flex flex-col gap-2 items-center">
                        <button onClick={onBrowse} className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-[#818CF8] text-xs font-black uppercase tracking-widest transition-colors">
                            or Browse All Courses
                        </button>
                        <button
                            onClick={() => {
                                setCourseQuery('');
                                setTopicQuery('');
                                setSelectedCourse('');
                                setSelectedUnit(null);
                                setSelectedTopics([]);
                                setMultiTopicText('');
                            }}
                            className="text-rose-500/80 hover:text-rose-650 dark:text-rose-450 dark:hover:text-rose-400 text-[10px] font-black uppercase tracking-widest transition-colors mt-2"
                        >
                            Clear Selections
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
