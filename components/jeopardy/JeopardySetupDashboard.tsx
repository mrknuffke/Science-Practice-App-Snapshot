import React from 'react';
import {
    FlaskConical, BookOpen, Sparkles, GraduationCap, LayoutList,
    Users, Minus, Plus, ToggleRight, ToggleLeft, Info, Loader2, History
} from 'lucide-react';
import { COURSE_PRESETS } from './presets';

interface JeopardySetupDashboardProps {
    topic: string;
    setTopic: (t: string) => void;
    gradeLevel: string;
    setGradeLevel: (g: string) => void;
    standards: string;
    setStandards: (s: string) => void;
    classicMode: boolean;
    setClassicMode: (c: boolean) => void;
    numTeams: number;
    setNumTeams: (n: number) => void;
    difficultyMode: 'random' | 'increasing';
    setDifficultyMode: (d: 'random' | 'increasing') => void;
    isWholeCourse: boolean;
    setIsWholeCourse: (w: boolean) => void;
    isLoading: boolean;
    onStartNewGame: () => void;
    onOpenLibrary: () => void;
    onOpenHowTo: () => void;
}

export const JeopardySetupDashboard: React.FC<JeopardySetupDashboardProps> = ({
    topic,
    setTopic,
    gradeLevel,
    setGradeLevel,
    standards,
    setStandards,
    classicMode,
    setClassicMode,
    numTeams,
    setNumTeams,
    difficultyMode,
    setDifficultyMode,
    isWholeCourse,
    setIsWholeCourse,
    isLoading,
    onStartNewGame,
    onOpenLibrary,
    onOpenHowTo
}) => {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto mt-10 mb-10 animate-in fade-in zoom-in duration-500">
                <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="bg-slate-900 p-12 text-center text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10"><FlaskConical className="w-32 h-32" /></div>
                        <h2 className="text-5xl font-black mb-2 relative z-10 flex items-center justify-center gap-4">
                            AI Science Jeopardy
                        </h2>
                        <p className="text-slate-400 font-medium relative z-10 uppercase tracking-widest text-xs">A modern science review game</p>
                    </div>

                    <div className="p-12 space-y-12">
                        {/* Scope Toggle */}
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Review Game Scope</span>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setIsWholeCourse(false)}
                                    className={`flex-1 px-5 py-4 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${!isWholeCourse ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:scale-[1.01]'}`}>
                                    <BookOpen className="w-4 h-4" /> Single Topic Review
                                </button>
                                <button
                                    onClick={() => setIsWholeCourse(true)}
                                    className={`flex-1 px-5 py-4 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isWholeCourse ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:scale-[1.01]'}`}>
                                    <Sparkles className="w-4 h-4" /> Clever Whole-Course Review
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 font-medium mt-3 leading-relaxed">
                                {isWholeCourse
                                    ? "Generates witty, actual-Jeopardy style clever categories mapping across the entire curriculum. Difficulty strictly ramps up from $200 to $1000."
                                    : "Generates high-rigor, targeted categories for a single focus unit, concept, or standard."}
                            </p>
                        </div>

                        {/* Presets Grid */}
                        {isWholeCourse && (
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4 animate-in slide-in-from-top-4 duration-300">
                                <div>
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Instant Setup Presets</span>
                                    <p className="text-xs text-slate-400 font-medium">Click a preset below to instantly pre-fill a standard course curriculum alignment.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {COURSE_PRESETS.map((preset) => (
                                        <button
                                            key={preset.name}
                                            onClick={() => {
                                                setTopic(preset.name);
                                                setGradeLevel(preset.gradeLevel);
                                                setStandards(preset.standards);
                                            }}
                                            className={`p-4 rounded-2xl border-2 text-left bg-gradient-to-br transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${preset.color} ${topic === preset.name ? 'ring-2 ring-indigo-500 border-transparent shadow-md' : 'border-slate-200/50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-xl">{preset.icon}</span>
                                                <span className="font-black text-xs uppercase tracking-tight leading-tight">{preset.name}</span>
                                            </div>
                                            <p className="text-[9px] opacity-75 font-semibold line-clamp-2 leading-snug">{preset.standards}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="group">
                                    <label className="text-[10px] font-black text-indigo-500 mb-2 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <BookOpen className="w-3 h-3" /> {isWholeCourse ? "Course or Subject Name" : "Topic or Unit"}
                                    </label>
                                    <input aria-label={isWholeCourse ? 'Course' : 'Topic'} type="text" placeholder={isWholeCourse ? "e.g. AP Biology, HS Chemistry" : "e.g. Stoichiometry"} value={topic} onChange={(e) => setTopic(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl outline-none focus:border-indigo-600 transition-all font-bold text-slate-800" />
                                </div>
                                <div className="group">
                                    <label className="text-[10px] font-black text-indigo-500 mb-2 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <GraduationCap className="w-3 h-3" /> Grade Level
                                    </label>
                                    <select aria-label="Grade Level" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl outline-none focus:border-indigo-600 transition-all font-bold text-slate-800 appearance-none">
                                        <option>Elementary</option><option>Middle School</option><option>High School</option><option>AP / College</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="group">
                                    <label className="text-[10px] font-black text-indigo-500 mb-2 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <LayoutList className="w-3 h-3" /> {isWholeCourse ? "Syllabus / Units to Cover (Optional)" : "Subtopics / AP Units"}
                                    </label>
                                    <input aria-label={isWholeCourse ? 'Units or themes' : 'Standards'} type="text" placeholder={isWholeCourse ? "e.g. Units 1-8, Genetics, Ecology" : "e.g. Unit 7, Natural Selection"} value={standards} onChange={(e) => setStandards(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl outline-none focus:border-indigo-600 font-bold text-slate-800" />
                                </div>
                                <div className="group">
                                    <label className="text-[10px] font-black text-indigo-500 mb-2 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Users className="w-3 h-3" /> Team Participation
                                    </label>
                                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border-2 border-slate-100">
                                        <button aria-label="Fewer teams" onClick={() => setNumTeams(Math.max(1, numTeams - 1))} className="p-3 bg-white rounded-xl shadow-sm hover:bg-slate-200 text-slate-800 transition-all"><Minus className="w-5 h-5" /></button>
                                        <div className="flex-1 text-center font-black text-2xl text-slate-800">{numTeams} Teams</div>
                                        <button aria-label="More teams" onClick={() => setNumTeams(Math.min(10, numTeams + 1))} className="p-3 bg-white rounded-xl shadow-sm hover:bg-slate-200 text-slate-800 transition-all"><Plus className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setClassicMode(!classicMode)} className="text-indigo-600 transition-transform active:scale-90">
                                    {classicMode ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                                </button>
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Response Style</span>
                                    <p className="font-bold text-slate-700">{classicMode ? "Classic (Clue Statement / Question Answer)" : "Standard (Direct Question / Answer)"}</p>
                                </div>
                            </div>
                            <button onClick={onOpenHowTo} className="p-4 text-slate-400 hover:text-indigo-600 transition-all flex items-center gap-2 group">
                                <Info className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Guide</span>
                            </button>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Difficulty Progression</span>
                            <div className="flex gap-3">
                                <button
                                    disabled={isWholeCourse}
                                    onClick={() => setDifficultyMode('random')}
                                    className={`flex-1 px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${difficultyMode === 'random' && !isWholeCourse ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed'}`}>
                                    Random
                                </button>
                                <button
                                    disabled={isWholeCourse}
                                    onClick={() => setDifficultyMode('increasing')}
                                    className={`flex-1 px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${difficultyMode === 'increasing' || isWholeCourse ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300'}`}>
                                    Increasing ($200 → $1000)
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 font-medium mt-3">
                                {isWholeCourse
                                    ? "Locked to Increasing ($200 → $1000) to ensure a rigorous conceptual ramp across the curriculum."
                                    : difficultyMode === 'random'
                                        ? "Difficulty varies naturally across the board; $ value does not track rigor."
                                        : "Within each category, $200 is the easiest and $1000 is the hardest."}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5">
                            <button onClick={onStartNewGame} disabled={isLoading || !topic.trim()}
                                className="flex-[2] bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-indigo-100 uppercase tracking-widest">
                                {isLoading ? <><Loader2 className="animate-spin" /> Sculpting Board...</> : <><Sparkles /> Build Board</>}
                            </button>
                            <button onClick={onOpenLibrary} className="flex-1 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-black transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-xl">
                                <History className="w-6 h-6" /> Library
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
