import React, { useState } from 'react';
import { CourseType } from '../types';
import { translateRubric } from '../services/ai/documents';

interface RubricTranslatorViewProps {
    course: CourseType;
    onBack: () => void;
}

const RubricTranslatorView: React.FC<RubricTranslatorViewProps> = ({ course, onBack }) => {
    const [inputText, setInputText] = useState('');
    const [successCriteria, setSuccessCriteria] = useState<string[]>([]);
    const [studentFriendly, setStudentFriendly] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Helper to get theme - defaulting to Indigo/Standard if not specialized
    const getThemeColors = (_c: CourseType) => {
        return { bg: 'bg-indigo-600', text: 'text-indigo-900', border: 'border-indigo-600', light: 'bg-indigo-50', accent: 'text-indigo-500', hover: 'hover:bg-indigo-50' };
    };
    const theme = getThemeColors(course);

    const handleTranslate = async () => {
        if (!inputText.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const data = await translateRubric(inputText);
            setSuccessCriteria(data.successCriteria);
            setStudentFriendly(data.studentFriendly);
        } catch (err) {
            setError("Failed to translate rubric. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        const text = `Student Checklist:\n\n${successCriteria.map(s => `[ ] ${s}`).join('\n')}\n\nSummary:\n${studentFriendly}`;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className={`min-h-screen ${theme.light} p-6 md:p-12`}>
            <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">

                {/* Header */}
                <div className={`p-10 ${theme.bg} text-white`}>
                    <button onClick={onBack} className="mb-4 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Menu
                    </button>
                    <h1 className="text-4xl font-black mb-2">Rubric Translator</h1>
                    <p className="text-lg opacity-90">Paste a complex rubric below to generate a student-friendly checklist.</p>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* INPUT SIDE */}
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Original Rubric Text</label>
                        <textarea aria-label="Original Rubric Text"
                            className="w-full h-[400px] p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none resize-none font-medium text-slate-700 bg-slate-50"
                            placeholder="Paste rubric requirements here..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <button
                            onClick={handleTranslate}
                            disabled={isLoading || !inputText}
                            className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${theme.bg} hover:opacity-90`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Translating...
                                </span>
                            ) : (
                                "Translate to Student-Friendly"
                            )}
                        </button>
                        {error && <p className="text-rose-500 text-sm font-bold text-center">{error}</p>}
                    </div>

                    {/* OUTPUT SIDE */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold text-emerald-600 uppercase tracking-widest">Success Criteria Checklist</label>
                                {successCriteria.length > 0 && (
                                    <button onClick={handleCopy} className="text-xs font-bold text-slate-400 hover:text-indigo-500 flex items-center gap-1 transition-colors">
                                        {copied ? "Copied!" : "Copy All"}
                                    </button>
                                )}
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 min-h-[200px]">
                                {successCriteria.length > 0 ? (
                                    <ul className="space-y-3">
                                        {successCriteria.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded border-2 border-emerald-200 bg-white shrink-0 mt-0.5" />
                                                <span className="text-sm font-medium text-emerald-900">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-emerald-300 opacity-50">
                                        <span className="text-4xl mb-2">📋</span>
                                        <p className="text-xs font-bold uppercase tracking-widest">Checklist will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Student Summary</label>
                            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 min-h-[150px]">
                                {studentFriendly ? (
                                    <p className="text-indigo-900 leading-relaxed font-medium">{studentFriendly}</p>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-indigo-300 opacity-50">
                                        <span className="text-4xl mb-2">🗣️</span>
                                        <p className="text-xs font-bold uppercase tracking-widest">Summary will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RubricTranslatorView;
