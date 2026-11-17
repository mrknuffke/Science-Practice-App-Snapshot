import React, { useState } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { getAnswerForCustomQuestion } from '../../../services/jeopardyService';
import { useDialog } from '../../../hooks/useDialog';

interface QuestionEditModalProps {
    isOpen: boolean;
    qData: { q: string; a: string; h: string };
    topic: string;
    onConfirm: (q: string, a: string, h: string) => void;
    onClose: () => void;
}

export const QuestionEditModal: React.FC<QuestionEditModalProps> = ({ isOpen, qData, topic, onConfirm, onClose }) => {
    const dialog = useDialog({ onClose, labelledBy: 'question-edit-title', open: isOpen });
    const [q, setQ] = useState(qData.q);
    const [a, setA] = useState(qData.a);
    const [h, setH] = useState(qData.h);
    const [loadingAns, setLoadingAns] = useState(false);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[160] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
            <div {...dialog} className="bg-white rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl space-y-6 flex flex-col max-h-[90vh]">
                <h3 id="question-edit-title" className="text-xl font-black text-slate-800">Edit Question Content</h3>
                <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 p-2">
                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Clue Text</label>
                        <textarea aria-label="Clue Text" value={q} onChange={e => setQ(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl font-medium min-h-[100px] outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-black text-emerald-500 uppercase tracking-widest">Answer Key</label>
                            <button disabled={loadingAns} onClick={async () => {
                                if (!q.trim()) return;
                                setLoadingAns(true);
                                try {
                                    const res = await getAnswerForCustomQuestion(q, topic);
                                    setA(res.answer); setH(res.hint);
                                } catch { alert("Failed to generate answer."); }
                                setLoadingAns(false);
                            }} className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1 disabled:opacity-50">
                                {loadingAns ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} Auto-Generate Answer
                            </button>
                        </div>
                        <textarea aria-label="Answer key" value={a} onChange={e => setA(e.target.value)} className="w-full bg-emerald-50/50 border-2 border-emerald-100 p-4 rounded-xl font-medium min-h-[80px] outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                        <label className="text-xs font-black text-indigo-400 uppercase tracking-widest block mb-2">Hint</label>
                        <textarea aria-label="Hint" value={h} onChange={e => setH(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl font-medium min-h-[60px] outline-none focus:border-indigo-500" />
                    </div>
                </div>
                <div className="flex gap-4 shrink-0">
                    <button onClick={onClose} className="flex-1 py-4 bg-slate-100 font-bold rounded-xl text-slate-500 hover:bg-slate-200">Cancel</button>
                    <button onClick={() => onConfirm(q, a, h)} className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700">Save Changes</button>
                </div>
            </div>
        </div>
    );
};
