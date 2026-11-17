import React, { useState } from 'react';
import { Edit3, X } from 'lucide-react';
import { useDialog } from '../../../hooks/useDialog';

export const FinalJeopardyEditModal: React.FC<{
    final: { category: string; clue: string; answer: string };
    onClose: () => void;
    onSave: (category: string, clue: string, answer: string) => void;
}> = ({ final, onClose, onSave }) => {
    const dialog = useDialog({ onClose, labelledBy: 'final-edit-title' });
    const [category, setCategory] = useState(final.category);
    const [clue, setClue] = useState(final.clue);
    const [answer, setAnswer] = useState(final.answer);
    return (
        <div className="fixed inset-0 z-[125] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div {...dialog} className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-10 border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-6 mb-6">
                    <div>
                        <h3 id="final-edit-title" className="text-2xl font-black text-slate-900 flex items-center gap-3"><Edit3 className="text-indigo-600" /> Edit Final Jeopardy</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Hand-edit the category, clue, and answer.</p>
                    </div>
                    <button aria-label="Close" onClick={onClose} className="p-3 bg-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all shrink-0"><X className="w-5 h-5" /></button>
                </div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category</label>
                <input aria-label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-800 focus:border-indigo-500 focus:outline-none mb-5"
                />
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Clue</label>
                <textarea aria-label="Clue"
                    value={clue}
                    onChange={(e) => setClue(e.target.value)}
                    rows={4}
                    className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-800 focus:border-indigo-500 focus:outline-none resize-none mb-5"
                />
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-2">Answer</label>
                <textarea aria-label="Answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={3}
                    className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-800 focus:border-indigo-500 focus:outline-none resize-none"
                />
                <div className="flex gap-3 mt-8 justify-end">
                    <button onClick={onClose} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200">Cancel</button>
                    <button
                        onClick={() => onSave(category, clue, answer)}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2"
                    >Save</button>
                </div>
            </div>
        </div>
    );
};
