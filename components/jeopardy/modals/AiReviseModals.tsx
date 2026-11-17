import React, { useState } from 'react';
import { Wand2, X, Sparkles } from 'lucide-react';
import { RenderHTML } from '../RenderHTML';
import { JeopardyCategory, JeopardyQuestion } from '../types';

import { useDialog } from '../../../hooks/useDialog';

export const AiReviseCategoryModal: React.FC<{
    category: JeopardyCategory;
    onClose: () => void;
    onSubmit: (newTitle: string, prompt: string) => void;
}> = ({ category, onClose, onSubmit }) => {
    const dialog = useDialog({ onClose, labelledBy: 'ai-revise-category-title' });
    const [newTitle, setNewTitle] = useState(category.title);
    const [prompt, setPrompt] = useState('');
    return (
        <div className="fixed inset-0 z-[125] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div {...dialog} className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-10 border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-6 mb-6">
                    <div>
                        <h3 id="ai-revise-category-title" className="text-2xl font-black text-slate-900 flex items-center gap-3"><Wand2 className="text-indigo-600" /> AI Revise Category</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Change the title, regenerate all 5 clues, or both.</p>
                    </div>
                    <button aria-label="Close" onClick={onClose} className="p-3 bg-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all shrink-0"><X className="w-5 h-5" /></button>
                </div>
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Current Questions</span>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                        {category.questions.map((q, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="font-black text-indigo-600 shrink-0">${q.value}</span>
                                <span className="truncate"><RenderHTML text={q.question} /></span>
                            </li>
                        ))}
                    </ul>
                </div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">New Category Title (edit to change)</label>
                <input aria-label="New Category Title (edit to change)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-800 focus:border-indigo-500 focus:outline-none mb-6"
                />
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">What Should Change? <span className="text-slate-300 normal-case font-medium tracking-normal">(optional — describe what you want the AI to do)</span></label>
                <textarea aria-label="What Should Change?"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder="e.g. Make clues harder and add more quantitative reasoning. Emphasize lab applications."
                    className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-800 focus:border-indigo-500 focus:outline-none resize-none"
                />
                <div className="flex gap-3 mt-8 justify-end">
                    <button onClick={onClose} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200">Cancel</button>
                    <button
                        onClick={() => onSubmit(newTitle.trim() === category.title ? '' : newTitle, prompt)}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2"
                    ><Sparkles className="w-4 h-4" /> Revise with AI</button>
                </div>
            </div>
        </div>
    );
};

export const AiReviseQuestionModal: React.FC<{
    question: JeopardyQuestion;
    categoryTitle: string;
    onClose: () => void;
    onSubmit: (prompt: string) => void;
}> = ({ question, categoryTitle, onClose, onSubmit }) => {
    const dialog = useDialog({ onClose, labelledBy: 'ai-revise-clue-title' });
    const [prompt, setPrompt] = useState('');
    return (
        <div className="fixed inset-0 z-[125] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div {...dialog} className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-10 border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-6 mb-6">
                    <div>
                        <h3 id="ai-revise-clue-title" className="text-2xl font-black text-slate-900 flex items-center gap-3"><Wand2 className="text-indigo-600" /> AI Revise Clue</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">{categoryTitle} — ${question.value}</p>
                    </div>
                    <button aria-label="Close" onClick={onClose} className="p-3 bg-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all shrink-0"><X className="w-5 h-5" /></button>
                </div>
                <div className="mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Current Clue</span>
                    <p className="text-sm font-bold text-slate-800 leading-snug mb-4"><RenderHTML text={question.question} /></p>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-2">Current Answer</span>
                    <p className="text-sm font-bold text-slate-600 leading-snug"><RenderHTML text={question.answer} /></p>
                </div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tell the AI What You Want Changed</label>
                <textarea aria-label="Tell the AI What You Want Changed"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder="e.g. Make it harder. Focus on stoichiometry. Use a real lab scenario. Replace the topic with photosynthesis."
                    className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-800 focus:border-indigo-500 focus:outline-none resize-none"
                />
                <div className="flex gap-3 mt-8 justify-end">
                    <button onClick={onClose} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200">Cancel</button>
                    <button
                        onClick={() => onSubmit(prompt)}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2"
                    ><Sparkles className="w-4 h-4" /> Revise with AI</button>
                </div>
            </div>
        </div>
    );
};

export const AiReviseFinalModal: React.FC<{
    final: { category: string; clue: string; answer: string };
    onClose: () => void;
    onSubmit: (newCategory: string, prompt: string) => void;
}> = ({ final, onClose, onSubmit }) => {
    const dialog = useDialog({ onClose, labelledBy: 'ai-revise-final-title' });
    const [newCategory, setNewCategory] = useState(final.category);
    const [prompt, setPrompt] = useState('');
    return (
        <div className="fixed inset-0 z-[125] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div {...dialog} className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-10 border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-6 mb-6">
                    <div>
                        <h3 id="ai-revise-final-title" className="text-2xl font-black text-slate-900 flex items-center gap-3"><Wand2 className="text-indigo-600" /> AI Revise Final Jeopardy</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Change the category, rewrite the clue, or both.</p>
                    </div>
                    <button aria-label="Close" onClick={onClose} className="p-3 bg-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all shrink-0"><X className="w-5 h-5" /></button>
                </div>
                <div className="mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Current Clue</span>
                    <p className="text-sm font-bold text-slate-800 leading-snug mb-4"><RenderHTML text={final.clue} /></p>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-2">Current Answer</span>
                    <p className="text-sm font-bold text-slate-600 leading-snug"><RenderHTML text={final.answer} /></p>
                </div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Final Jeopardy Category (edit to change)</label>
                <input aria-label="Final Jeopardy Category (edit to change)"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-800 focus:border-indigo-500 focus:outline-none mb-6"
                />
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">What Should Change? <span className="text-slate-300 normal-case font-medium tracking-normal">(optional)</span></label>
                <textarea aria-label="What Should Change? (optional)"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder="e.g. Make it harder. Focus on a specific case study. Require synthesis across two units."
                    className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-800 focus:border-indigo-500 focus:outline-none resize-none"
                />
                <div className="flex gap-3 mt-8 justify-end">
                    <button onClick={onClose} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200">Cancel</button>
                    <button
                        onClick={() => onSubmit(newCategory.trim() === final.category ? '' : newCategory, prompt)}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2"
                    ><Sparkles className="w-4 h-4" /> Revise with AI</button>
                </div>
            </div>
        </div>
    );
};
