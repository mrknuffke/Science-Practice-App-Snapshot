import React from 'react';
import { Eye, RefreshCcw, Sparkles, Edit3, Wand2, Save, Trash2 } from 'lucide-react';
import { JeopardyBoardData } from './types';
import { RenderHTML } from './RenderHTML';

interface PreGameReviewBoardProps {
    board: JeopardyBoardData;
    isProcessing: boolean;
    onApprove: () => void;
    onDiscard: () => void;
    onRefreshCat: (cIdx: number) => void;
    onRefreshQ: (cIdx: number, qIdx: number) => void;
    onEditQ: (cIdx: number, qIdx: number, q: string, a: string, h: string) => void;
    onToggleDD: (cIdx: number, qIdx: number) => void;
    onEditFinal: (final: { category: string; clue: string; answer: string }) => void;
    onAiReviseFinal: () => void;
    onSaveBoard: () => void;
}

export const PreGameReviewBoard: React.FC<PreGameReviewBoardProps> = ({
    board,
    isProcessing,
    onApprove,
    onDiscard,
    onRefreshCat,
    onRefreshQ,
    onEditQ,
    onToggleDD,
    onEditFinal,
    onAiReviseFinal,
    onSaveBoard
}) => {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
            <div className="bg-white rounded-t-[2.5rem] border border-slate-200 shadow-xl p-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Eye className="w-6 h-6" /></div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Review Before Starting</h2>
                        <p className="text-sm text-slate-500 font-medium">Verify clues, refresh or edit anything, then approve to begin.</p>
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 border-x border-slate-200">
                <div className="p-8 space-y-12">
                    {board.categories.map((cat, cIdx: number) => (
                        <div key={cIdx} className="space-y-6">
                            <div className="flex items-center gap-6 bg-white p-5 rounded-[2rem] border-2 border-slate-100 shadow-sm">
                                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight flex-1"><RenderHTML text={cat.title} /></h4>
                                <button onClick={() => onRefreshCat(cIdx)} disabled={isProcessing} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-md disabled:opacity-50 transition-all">
                                    <RefreshCcw className="w-4 h-4" /> Refresh Category
                                </button>
                            </div>
                            <div className="grid gap-4">
                                {cat.questions.map((q, qIdx: number) => {
                                    const isDD = (board.dailyDoubleIds || []).includes(q.id);
                                    return (
                                        <div key={qIdx} className={`p-6 bg-white rounded-[2rem] border-2 transition-all ${isDD ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-100 hover:border-indigo-300'}`}>
                                            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-4 py-1.5 bg-slate-900 text-white text-[11px] font-black rounded-full">${q.value}</span>
                                                    {isDD && <span className="px-3 py-1.5 bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow flex items-center gap-1"><Sparkles className="w-3 h-3" /> Daily Double</span>}
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    <button onClick={() => onToggleDD(cIdx, qIdx)} title={isDD ? "Remove Daily Double" : "Make Daily Double"} className={`text-[11px] font-black uppercase flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${isDD ? 'text-amber-700 bg-amber-100 hover:bg-amber-200' : 'text-slate-500 bg-slate-100 hover:bg-amber-50 hover:text-amber-600'}`}><Sparkles className="w-3.5 h-3.5" /> {isDD ? 'Remove DD' : 'Make DD'}</button>
                                                    <button onClick={() => onEditQ(cIdx, qIdx, q.question, q.answer, q.hint)} className="text-[11px] font-black text-slate-500 uppercase flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-all"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                                                    <button onClick={() => onRefreshQ(cIdx, qIdx)} disabled={isProcessing} className="text-[11px] font-black text-indigo-600 uppercase flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-all"><Wand2 className="w-3.5 h-3.5" /> AI Revise</button>
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-2">Clue</span>
                                                    <p className="text-base font-bold text-slate-800 leading-snug"><RenderHTML text={q.question} /></p>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">Answer Key</span>
                                                    <p className="text-sm font-bold text-slate-700"><RenderHTML text={q.answer} /></p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {board.finalJeopardy && (
                        <div className="space-y-4">
                            <div className="bg-slate-900 text-white p-5 rounded-[2rem] shadow-xl">
                                <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Final Jeopardy — {board.finalJeopardy.category}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => onEditFinal(board.finalJeopardy!)} className="text-[10px] font-black text-slate-200 uppercase flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-all"><Edit3 className="w-3 h-3" /> Edit</button>
                                        <button onClick={onAiReviseFinal} disabled={isProcessing} className="text-[10px] font-black text-indigo-200 uppercase flex items-center gap-1.5 bg-indigo-600/30 px-3 py-1.5 rounded-lg hover:bg-indigo-600/60 disabled:opacity-50 transition-all"><Wand2 className="w-3 h-3" /> AI Revise</button>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-slate-200 leading-snug mb-3"><RenderHTML text={board.finalJeopardy.clue} /></p>
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Answer</span>
                                <p className="text-xs font-semibold text-emerald-200"><RenderHTML text={board.finalJeopardy.answer} /></p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-white rounded-b-[2.5rem] border border-slate-200 shadow-xl p-8 flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={onDiscard} className="px-6 py-3 text-rose-500 font-bold hover:bg-rose-50 rounded-xl transition-all text-xs uppercase tracking-widest flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Discard
                    </button>
                    <button onClick={onSaveBoard} className="px-6 py-3 text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl transition-all text-xs uppercase tracking-widest flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save to Library
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onApprove} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Approve & Start Game
                    </button>
                </div>
            </div>
        </div>
    );
};
