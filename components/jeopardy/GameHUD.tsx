import React from 'react';
import { FlaskConical, X, Save, Download, History, Eye, RefreshCcw, Edit3, Loader2 } from 'lucide-react';
import { JeopardyBoardData, Team } from './types';

interface GameHUDProps {
    topic: string;
    board: JeopardyBoardData | null;
    teams: Team[];
    lastClosed: { cIdx: number; qIdx: number } | null;
    isGeneratingPdf: boolean;
    onEndSessionConfirm: () => void;
    onSaveBoard: () => void;
    onExportStudySheet: () => void;
    onOpenLibrary: () => void;
    onOpenPreview: () => void;
    onReopenLastClosed: () => void;
    onRenameTeam: (id: number) => void;
    onScoreEdit: (teamId: number, teamName: string, currentScore: number) => void;
    onStartFinalJeopardy: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
    topic,
    board,
    teams,
    lastClosed,
    isGeneratingPdf,
    onEndSessionConfirm,
    onSaveBoard,
    onExportStudySheet,
    onOpenLibrary,
    onOpenPreview,
    onReopenLastClosed,
    onRenameTeam,
    onScoreEdit,
    onStartFinalJeopardy
}) => {
    return (
        <div className="flex flex-col lg:flex-row gap-4 shrink-0">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xl lg:w-[40%] shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shrink-0"><FlaskConical className="w-6 h-6" /></div>
                    <h2 className="font-black text-slate-800 truncate text-lg uppercase tracking-tighter flex-1 min-w-0">{topic}</h2>
                    {board && (() => {
                        const total = board.categories.reduce((sum, c) => sum + c.questions.length, 0);
                        const done = board.categories.reduce((sum, c) => sum + c.questions.filter(q => q.answered).length, 0);
                        return (
                            <span className="px-3 py-2 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 shrink-0">
                                {done}/{total}
                            </span>
                        );
                    })()}
                    <button onClick={onEndSessionConfirm} className="p-3 text-slate-300 hover:text-rose-500 transition-colors shrink-0" title="End session"><X className="w-6 h-6" /></button>
                </div>
                <div className="flex gap-x-4 items-center mt-3 pl-16 overflow-x-auto no-scrollbar whitespace-nowrap">
                    <button onClick={onSaveBoard} className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1 hover:underline tracking-widest shrink-0"><Save className="w-3 h-3" /> Save to Library</button>
                    <button onClick={onExportStudySheet} disabled={isGeneratingPdf} className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1 hover:underline tracking-widest disabled:opacity-50 shrink-0">
                        {isGeneratingPdf ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        {isGeneratingPdf ? "Generating..." : "PDF Guide"}
                    </button>
                    <button onClick={onOpenLibrary} className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 hover:underline tracking-widest shrink-0"><History className="w-3 h-3" /> Library</button>
                    <button onClick={onOpenPreview} className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1 hover:underline tracking-widest shrink-0"><Eye className="w-3 h-3" /> Preview</button>
                    {lastClosed && (
                        <button onClick={onReopenLastClosed} title="Re-open the last closed clue" className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-1 hover:underline tracking-widest shrink-0"><RefreshCcw className="w-3 h-3" /> Re-open</button>
                    )}
                </div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xl flex-1 flex items-center gap-4 min-w-0">
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar flex-1 min-w-0">
                    {teams.map(t => (
                        <div key={t.id} className="px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 shrink-0 hover:bg-white transition-all hover:shadow-lg border-b-4 border-b-indigo-200">
                            <button onClick={() => onRenameTeam(t.id)} className="flex items-center gap-1 group">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{t.name}</span>
                                <Edit3 className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                            </button>
                            <button onClick={() => onScoreEdit(t.id, t.name, t.score)} className={`text-2xl font-black hover:scale-110 transition-transform cursor-pointer ${t.score >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>${t.score}</button>
                        </div>
                    ))}
                </div>
                <button onClick={onStartFinalJeopardy} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shrink-0">Enter Final Stage</button>
            </div>
        </div>
    );
};
