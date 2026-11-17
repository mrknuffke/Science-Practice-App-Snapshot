import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Minus, Plus } from 'lucide-react';
import { JeopardyQuestion, Team } from './types';
import { RenderHTML } from './RenderHTML';
import { DynamicChart } from './DynamicChart';
import { CountdownTimer } from './CountdownTimer';
import { playChime, playBuzz } from './audioUtils';

interface QuestionModalProps {
    curQ: JeopardyQuestion;
    categoryTitle: string;
    teams: Team[];
    onClose: () => void;
    onScore: (id: number, score: number) => void;
    isDailyDouble: boolean;
    wagerValue: number;
    onWagerChange: (val: number) => void;
    wageringTeamId: number | null;
    onSelectWageringTeam: (id: number) => void;
    maxClueValue: number;
}

const textLength = (s: string) => (s || '').replace(/<[^>]*>/g, '').length;

const clueFontSize = (s: string) => {
    const len = textLength(s);
    if (len <= 80) return 'text-5xl md:text-6xl';
    if (len <= 180) return 'text-4xl md:text-5xl';
    if (len <= 320) return 'text-3xl md:text-4xl';
    return 'text-2xl md:text-3xl';
};

const answerFontSize = (s: string) => {
    const len = textLength(s);
    if (len <= 20) return 'text-5xl md:text-7xl';
    if (len <= 60) return 'text-4xl md:text-5xl';
    if (len <= 120) return 'text-3xl md:text-4xl';
    return 'text-2xl md:text-3xl';
};

export const QuestionModal: React.FC<QuestionModalProps> = ({
    curQ, categoryTitle, teams, onClose, onScore,
    isDailyDouble, wagerValue, onWagerChange, wageringTeamId, onSelectWageringTeam, maxClueValue
}) => {
    const [showAnswer, setShowAnswer] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [confirmWager, setConfirmWager] = useState(false);
    const [sessionDeltas, setSessionDeltas] = useState<Record<number, number>>({});

    const selectedTeam = wageringTeamId !== null ? teams.find(t => t.id === wageringTeamId) : null;
    const maxWager = selectedTeam ? Math.max(selectedTeam.score, maxClueValue) : 0;

    const handleTeamScore = (tId: number, amount: number) => {
        if (amount > 0) {
            playChime();
        } else {
            playBuzz();
        }
        onScore(tId, amount);
        setSessionDeltas(prev => ({
            ...prev,
            [tId]: (prev[tId] || 0) + amount
        }));
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const tag = target?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
            if (isDailyDouble && !confirmWager) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            } else if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                if (!showHint && !showAnswer) setShowHint(true);
                else if (!showAnswer) setShowAnswer(true);
                else onClose();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [showHint, showAnswer, isDailyDouble, confirmWager, onClose]);

    return (
        <div className="fixed inset-0 z-[80] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-6">
            <div className="w-full max-w-6xl flex flex-col items-center">
                {isDailyDouble && !confirmWager ? (
                    <div className="w-full max-w-2xl text-center space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="relative inline-block mb-8">
                            <div className="absolute inset-0 rounded-[4rem] bg-indigo-400 animate-ping opacity-60"></div>
                            <div className="relative inline-block p-10 bg-indigo-600 rounded-[4rem] shadow-2xl shadow-indigo-500/50 animate-bounce ring-8 ring-indigo-300/40">
                                <h2 className="text-6xl font-black text-white uppercase tracking-tighter italic">DISCOVERY DOUBLE</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {teams.map(t => (
                                <button key={t.id} onClick={() => onSelectWageringTeam(t.id)}
                                    className={`p-6 rounded-3xl border-4 transition-all flex justify-between items-center ${wageringTeamId === t.id ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-800 bg-slate-800/40 opacity-40 hover:opacity-100'}`}>
                                    <span className="font-black text-white text-xl uppercase">{t.name}</span>
                                    <span className="text-2xl font-black text-white">${t.score}</span>
                                </button>
                            ))}
                        </div>
                        {wageringTeamId !== null && (
                            <div className="space-y-6">
                                <div className="bg-slate-900 p-10 rounded-[3rem] text-white border-2 border-slate-800">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-4">Enter Wager (Min: $100 — Max: ${maxWager})</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black text-indigo-400">$</span>
                                        <input aria-label="Wager" type="number" step="100" value={wagerValue} onChange={(e) => onWagerChange(parseInt(e.target.value) || 0)}
                                            className="w-full bg-slate-800 border-2 border-slate-700 p-8 pl-14 rounded-[2rem] outline-none text-5xl font-black text-white focus:border-indigo-500 transition-all" />
                                    </div>
                                </div>
                                <button
                                    disabled={wagerValue < 100 || wagerValue > maxWager}
                                    onClick={() => setConfirmWager(true)}
                                    className="w-full py-6 bg-white text-slate-900 rounded-[2rem] font-black text-xl hover:bg-indigo-50 disabled:opacity-20 uppercase tracking-[0.3em] shadow-2xl transition-all">
                                    Reveal Science Clue
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white w-full rounded-[4rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-8 border-white animate-in zoom-in-95">
                        <div className="px-10 py-8 bg-slate-50 border-b flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-6">
                                <span className="px-8 py-3 bg-slate-900 text-white rounded-full text-[12px] font-black uppercase tracking-[0.3em] shadow-xl">
                                    <RenderHTML text={categoryTitle} /> — {isDailyDouble ? `DD Wager: $${wagerValue}` : `$${curQ.value}`}
                                </span>
                                {!showAnswer && <CountdownTimer />}
                            </div>
                            <button aria-label="Close" onClick={onClose} className="p-4 bg-slate-200 text-slate-500 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-all shadow-sm"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="p-10 text-center overflow-y-auto flex-1 flex flex-col items-center justify-start">
                            <div className="w-full max-w-5xl animate-in fade-in duration-500 py-10">
                                {curQ.chartData && curQ.chartData.length > 0 && !showAnswer && (
                                    <div className="w-full h-64 mb-6 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                        <DynamicChart q={curQ} />
                                    </div>
                                )}
                                {curQ.tableData && !showAnswer && (
                                    <div className="w-full mb-12 overflow-hidden rounded-[2rem] border-2 border-indigo-100 shadow-xl">
                                        <table className="w-full text-left border-collapse bg-white">
                                            <thead>
                                                <tr className="bg-indigo-600 text-white">
                                                    {curQ.tableData.headers.map((h: string, i: number) => (
                                                        <th key={i} className="p-4 font-black uppercase tracking-wider text-sm border-r border-indigo-500 last:border-0">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {curQ.tableData.rows.map((row: string[], rI: number) => (
                                                    <tr key={rI} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                                        {row.map((cell: string, cI: number) => (
                                                            <td key={cI} className="p-4 font-bold text-slate-700 border-r border-slate-100 last:border-0">{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <h3 className={`${clueFontSize(curQ.question)} font-black text-slate-900 leading-[1.1] mb-16 drop-shadow-sm`}>
                                    <RenderHTML text={curQ.question} />
                                </h3>

                                {!showAnswer ? (
                                    <div className="space-y-10">
                                        {showHint && (
                                             <div className="p-10 bg-indigo-50 text-indigo-950 rounded-[3rem] text-2xl font-bold border-4 border-indigo-100 shadow-inner animate-in slide-in-from-top-4">
                                                <RenderHTML text={curQ.hint} />
                                            </div>
                                        )}
                                        <div className="flex flex-col md:flex-row gap-8 max-w-2xl mx-auto">
                                            {!showHint && <button onClick={() => setShowHint(true)} className="flex-1 py-7 bg-white border-4 border-slate-100 text-slate-400 rounded-[2rem] font-black text-lg hover:bg-slate-50 transition-all uppercase tracking-widest">Scientific Clue</button>}
                                            <button onClick={() => setShowAnswer(true)} className="flex-[2] py-7 bg-indigo-600 text-white rounded-[2rem] font-black text-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all uppercase tracking-[0.2em]">Verify Response</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-12 animate-in slide-in-from-bottom-12 duration-500">
                                        <div className="space-y-6">
                                            <div className="text-emerald-500 text-[12px] font-black uppercase tracking-[0.5em]">Consensus Response</div>
                                            <p className={`${answerFontSize(curQ.answer)} font-black text-indigo-950 bg-indigo-50 py-10 px-16 rounded-[4rem] inline-block shadow-inner border-2 border-indigo-100 leading-tight`}>
                                                <RenderHTML text={curQ.answer} />
                                            </p>
                                        </div>
                                        <div className="pt-12 border-t border-slate-100 space-y-12">
                                            <div className="flex flex-wrap justify-center gap-6">
                                                {teams.map(t => {
                                                    const delta = sessionDeltas[t.id] || 0;
                                                    return (
                                                        <div key={t.id} className="flex flex-col items-center bg-slate-50 p-6 rounded-[3rem] border-2 border-slate-200 min-w-[180px] relative transition-all hover:bg-white hover:shadow-xl">
                                                            <span className="text-[11px] font-black text-slate-400 mb-3 uppercase tracking-widest">{t.name}</span>
                                                            <div className="flex gap-3 w-full px-2">
                                                                <button aria-label={`Take points from ${t.name}`} onClick={() => handleTeamScore(t.id, -(isDailyDouble ? wagerValue : curQ.value))} className="flex-1 py-5 bg-white hover:bg-rose-50 text-rose-500 rounded-2xl border-2 border-slate-200 transition-all shadow-sm"><Minus className="mx-auto w-5 h-5" /></button>
                                                                <button aria-label={`Give points to ${t.name}`} onClick={() => handleTeamScore(t.id, (isDailyDouble ? wagerValue : curQ.value))} className="flex-1 py-5 bg-white hover:bg-emerald-50 text-emerald-500 rounded-2xl border-2 border-slate-200 transition-all shadow-sm"><Plus className="mx-auto w-5 h-5" /></button>
                                                            </div>
                                                            {delta !== 0 && (
                                                                <div className={`absolute -top-3 -right-3 px-4 py-2 rounded-xl text-white font-black text-sm shadow-lg ${delta > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                                                    {delta > 0 ? '+' : ''}${delta}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <button onClick={onClose} className="w-full max-w-lg mx-auto py-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl hover:bg-black uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 transition-all">
                                                Return to Board <ChevronRight className="w-8 h-8" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
