import { errorMessage } from '../utils/errorMessage';
import React, { useState } from 'react';
import { getReflectionPrompts, type ReflectionStructure, type ReflectionPrompt } from '../services/ai/documents';

interface ReflectionViewProps {
    onBack: () => void;
}

const STRUCTURES: { id: ReflectionStructure; emoji: string; label: string; description: string; color: string }[] = [
    {
        id: 'learning_journal',
        emoji: '📓',
        label: 'Learning Journal',
        description: 'Open reflection: what did we learn, what was hard, what do we want to explore?',
        color: 'indigo'
    },
    {
        id: 'exit_ticket',
        emoji: '🎯',
        label: 'Exit Ticket',
        description: 'Muddiest point, most important takeaway, confidence self-rating.',
        color: 'emerald'
    },
    {
        id: 'i_used_to_think',
        emoji: '🔄',
        label: 'I Used to Think / Now I Think',
        description: 'Track how student understanding evolved through the lesson.',
        color: 'amber'
    },
    {
        id: '321',
        emoji: '3️⃣',
        label: '3-2-1',
        description: '3 things learned · 2 questions · 1 real-world connection.',
        color: 'sky'
    },
    {
        id: 'plus_delta',
        emoji: '➕',
        label: 'Plus / Delta',
        description: 'What worked well? What would I change next time?',
        color: 'rose'
    },
    {
        id: 'scientific_metacognition',
        emoji: '🔬',
        label: 'Scientific Metacognition',
        description: 'What surprised me? What would I test differently? How did evidence change my thinking?',
        color: 'teal'
    }
];

const GRADE_LEVELS = [
    'Elementary School (Grades 3-5)',
    'Middle School (Grades 6-8)',
    'High School',
    'AP / Advanced',
];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; ring: string }> = {
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/40', text: 'text-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300', ring: 'ring-indigo-500/60' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300', ring: 'ring-emerald-500/60' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300', ring: 'ring-amber-500/60' },
    sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/40', text: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300', ring: 'ring-sky-500/60' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/40', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300', ring: 'ring-rose-500/60' },
    teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/40', text: 'text-teal-400', badge: 'bg-teal-500/20 text-teal-300', ring: 'ring-teal-500/60' },
};

const ReflectionView: React.FC<ReflectionViewProps> = ({ onBack }) => {
    const [topic, setTopic] = useState('');
    const [course, setCourse] = useState('');
    const [gradeLevel, setGradeLevel] = useState('High School');
    const [selectedStructure, setSelectedStructure] = useState<ReflectionStructure>('learning_journal');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ReflectionPrompt | null>(null);
    const [error, setError] = useState<string | null>(null);

    const selectedDef = STRUCTURES.find(s => s.id === selectedStructure)!;
    const colors = colorMap[selectedDef.color];

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const output = await getReflectionPrompts(topic.trim(), selectedStructure, gradeLevel, course.trim());
            setResult(output);
        } catch (err) {
            setError(errorMessage(err, 'Something went wrong. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 p-6 md:p-12 overflow-y-auto">
            <style>{`
        @media print {
          body * { visibility: hidden; }
          #reflection-output, #reflection-output * { visibility: visible; }
          #reflection-output { position: fixed; top: 0; left: 0; width: 100%; padding: 2rem; background: white; color: black; }
          .no-print { display: none !important; }
          .print-border { border: 1px solid #ccc !important; }
        }
      `}</style>

            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <button
                    onClick={onBack}
                    className="no-print group flex items-center gap-2 text-sm font-bold text-violet-400 uppercase tracking-widest mb-10 hover:text-violet-300 transition-colors"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Teacher Tools
                </button>

                {/* Header */}
                <header className="no-print mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center text-3xl">🧠</div>
                        <div>
                            <h1 className="text-4xl font-black text-white">Reflection Prompter</h1>
                            <p className="text-slate-400 mt-1">Generate scaffolded metacognitive prompt sheets for your students.</p>
                        </div>
                    </div>
                </header>

                {/* Setup Form */}
                {!result && (
                    <div className="no-print space-y-8">

                        {/* Topic / Course inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Lesson Topic <span className="text-rose-400">*</span></label>
                                <input aria-label="Lesson Topic"
                                    type="text"
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    placeholder="e.g. Photosynthesis, Newton's Laws, Ecosystems…"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Course / Subject <span className="text-slate-500">(optional)</span></label>
                                <input aria-label="Course / Subject (optional)"
                                    type="text"
                                    value={course}
                                    onChange={e => setCourse(e.target.value)}
                                    placeholder="e.g. AP Biology, Middle School Science…"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60 transition-all"
                                />
                            </div>
                        </div>

                        {/* Grade Level */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Grade Level</label>
                            <div className="flex flex-wrap gap-3">
                                {GRADE_LEVELS.map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setGradeLevel(level)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${gradeLevel === level
                                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Structure selector */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Reflection Structure</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {STRUCTURES.map(s => {
                                    const c = colorMap[s.color];
                                    const isSelected = selectedStructure === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => setSelectedStructure(s.id)}
                                            className={`text-left p-4 rounded-2xl border-2 transition-all ${isSelected
                                                ? `${c.bg} ${c.border} ring-2 ${c.ring}`
                                                : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                                                }`}
                                        >
                                            <div className="text-2xl mb-2">{s.emoji}</div>
                                            <div className={`font-bold text-sm mb-1 ${isSelected ? c.text : 'text-white'}`}>{s.label}</div>
                                            <div className="text-xs text-slate-400 leading-relaxed">{s.description}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Generate button */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleGenerate}
                                disabled={!topic.trim() || isLoading}
                                className={`px-8 py-4 rounded-2xl font-bold text-white transition-all ${!topic.trim() || isLoading
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-900/40 hover:scale-105 active:scale-95'
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Generating…
                                    </span>
                                ) : `Generate ${selectedDef.label} Prompts`}
                            </button>
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-rose-300 text-sm">
                                ⚠️ {error}
                            </div>
                        )}
                    </div>
                )}

                {/* Output */}
                {result && (
                    <div>
                        {/* Action buttons (no-print) */}
                        <div className="no-print flex flex-wrap gap-3 mb-8">
                            <button
                                onClick={() => setResult(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors"
                            >
                                ← New Prompt Sheet
                            </button>
                            <button
                                onClick={handlePrint}
                                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-colors flex items-center gap-2"
                            >
                                🖨️ Print / Save as PDF
                            </button>
                        </div>

                        {/* The printable output */}
                        <div id="reflection-output" className={`bg-slate-800/60 border-2 ${colors.border} rounded-3xl p-8 space-y-8`}>

                            {/* Title block */}
                            <div className={`${colors.bg} rounded-2xl p-6`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-3xl">{selectedDef.emoji}</span>
                                    <div>
                                        <h2 className="text-2xl font-black text-white">{result.title}</h2>
                                        <p className={`text-sm mt-0.5 ${colors.text}`}>{result.subtitle}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap gap-3">
                                    <span className="font-bold">{topic}</span>
                                    {course && <span>· {course}</span>}
                                    <span>· {gradeLevel}</span>
                                </div>
                            </div>

                            {/* Student name line */}
                            <div className="border-b border-slate-600 pb-2">
                                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Name: _____________________________ Date: _____________ Period: _______</span>
                            </div>

                            {/* Prompts */}
                            <div className="space-y-6">
                                <h3 className={`text-xs font-black uppercase tracking-widest ${colors.text}`}>Reflection Prompts</h3>
                                {result.prompts.map((p: { question: string; sentenceStarter?: string }, i: number) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-7 h-7 rounded-full ${colors.badge} flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5`}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-semibold leading-relaxed">{p.question}</p>
                                                {p.sentenceStarter && (
                                                    <p className={`text-sm mt-1 italic ${colors.text}`}>
                                                        <span className="not-italic font-bold text-slate-500 text-xs uppercase tracking-wide mr-1">Starter:</span>
                                                        {p.sentenceStarter}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {/* Writing lines */}
                                        <div className="ml-10 space-y-2 pt-2">
                                            {[1, 2, 3].map(line => (
                                                <div key={line} className="border-b border-slate-700 h-8"></div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Sentence Frames */}
                            {result.sentenceFrames && result.sentenceFrames.length > 0 && (
                                <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-5">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">📌 Sentence Frames <span className="text-slate-600 font-normal normal-case tracking-normal">(for extra support)</span></h4>
                                    <ul className="space-y-2">
                                        {result.sentenceFrames.map((frame: string, i: number) => (
                                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                                <span className="text-slate-500 flex-shrink-0">→</span>
                                                <span className="italic">{frame}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Teacher debrief note */}
                            <div className="border-t border-slate-700/50 pt-6">
                                <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-violet-400 mb-2">🏫 Teacher Note</h4>
                                    <p className="text-sm text-violet-200/80 leading-relaxed">{result.teacherDebriefNote}</p>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReflectionView;
