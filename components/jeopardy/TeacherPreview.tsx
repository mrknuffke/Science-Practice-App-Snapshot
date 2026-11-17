import React from 'react';
import { Eye, X, Wand2, Sparkles, Edit3 } from 'lucide-react';
import { JeopardyBoardData } from './types';
import { RenderHTML } from './RenderHTML';
import { DynamicChart } from './DynamicChart';

interface TeacherPreviewProps {
    board: JeopardyBoardData | null;
    onClose: () => void;
    onRefreshQ: (c: number, q: number) => void;
    onRefreshCat: (c: number) => void;
    onEditQ: (c: number, q: number) => void;
    onToggleDD: (c: number, q: number) => void;
}

export const TeacherPreview: React.FC<TeacherPreviewProps> = ({
    board, onClose, onRefreshQ, onRefreshCat, onEditQ, onToggleDD
}) => {
    const ddIds = board?.dailyDoubleIds || [];
    return (
        <div className="fixed inset-0 z-[110] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-end p-6">
            <div className="bg-white w-full max-w-5xl h-full rounded-[4rem] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right-20">
                <div className="p-10 border-b flex justify-between items-center bg-slate-50 shrink-0">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3"><Eye className="text-indigo-600" /> Instructor Preview</h3>
                        <p className="text-slate-500 font-medium italic">Verify clues, mark Daily Doubles, and refine anything before play.</p>
                    </div>
                    <button aria-label="Close" onClick={onClose} className="p-4 bg-white border rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all"><X className="w-6 h-6" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-10 space-y-16 custom-scrollbar">
                    {board?.categories.map((cat, cIdx: number) => (
                        <div key={cIdx} className="space-y-8">
                            <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-100">
                                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight flex-1"><RenderHTML text={cat.title} /></h4>
                                <button onClick={() => onRefreshCat(cIdx)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
                                    <Wand2 className="w-4 h-4" /> AI Revise
                                </button>
                            </div>
                            <div className="grid gap-6">
                                {cat.questions.map((q, qIdx: number) => {
                                    const isDD = ddIds.includes(q.id);
                                    return (
                                        <div key={qIdx} className={`p-8 bg-slate-50 rounded-[3rem] border-2 transition-all group ${isDD ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-100 hover:border-indigo-300'}`}>
                                            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-5 py-2 bg-slate-900 text-white text-[11px] font-black rounded-full">${q.value}</span>
                                                    {isDD && <span className="px-4 py-2 bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-[11px] font-black rounded-full uppercase tracking-widest shadow flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Daily Double</span>}
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    <button onClick={() => onToggleDD(cIdx, qIdx)} title={isDD ? "Remove Daily Double" : "Make Daily Double"} className={`text-[11px] font-black uppercase flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isDD ? 'text-amber-700 bg-amber-100 hover:bg-amber-200' : 'text-slate-500 bg-slate-100 hover:bg-amber-50 hover:text-amber-600'}`}><Sparkles className="w-3.5 h-3.5" /> {isDD ? 'Remove DD' : 'Make DD'}</button>
                                                    <button onClick={() => onEditQ(cIdx, qIdx)} className="text-[11px] font-black text-slate-400 uppercase flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 transition-all"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                                                    <button onClick={() => onRefreshQ(cIdx, qIdx)} className="text-[11px] font-black text-indigo-600 uppercase flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all"><Wand2 className="w-3.5 h-3.5" /> AI Revise</button>
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-10">
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] block mb-2">Clue Text</span>
                                                    {q.chartData && q.chartData.length > 0 && (
                                                        <div className="w-full h-48 mb-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                                            <DynamicChart q={q} />
                                                        </div>
                                                    )}
                                                    {q.tableData && (
                                                        <div className="w-full mb-4 overflow-hidden rounded-2xl border border-indigo-100 shadow-sm">
                                                            <table className="w-full text-left text-[10px]">
                                                                <thead className="bg-indigo-600 text-white"><tr>{q.tableData.headers.map((h: string, i: number) => <th key={i} className="p-2 border-r border-indigo-500 last:border-none">{h}</th>)}</tr></thead>
                                                                <tbody>{q.tableData.rows.slice(0, 3).map((r: string[], i: number) => <tr key={i} className="border-b last:border-none">{r.map((c: string, j: number) => <td key={j} className="p-2 border-r last:border-none text-slate-600 font-bold">{c}</td>)}</tr>)}</tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                    <p className="text-2xl font-black text-slate-800 leading-tight"><RenderHTML text={q.question} /></p>
                                                </div>
                                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1">Teacher Answer Key</span>
                                                    <p className="text-lg font-bold text-slate-700"><RenderHTML text={q.answer} /></p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
