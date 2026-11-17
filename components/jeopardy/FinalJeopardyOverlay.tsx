import React, { useState, useEffect } from 'react';
import { Minus, Plus, Sparkles } from 'lucide-react';
import { Team } from './types';
import { RenderHTML } from './RenderHTML';
import { CountdownTimer } from './CountdownTimer';
import { playChime, playBuzz } from './audioUtils';

interface FinalJeopardyOverlayProps {
    data: { category: string; clue: string; answer: string };
    teams: Team[];
    step: 'wager' | 'clue' | 'reveal' | 'winner';
    setStep: (s: 'wager' | 'clue' | 'reveal' | 'winner') => void;
    wagers: Record<number, number>;
    setWagers: (w: Record<number, number>) => void;
    onScore: (id: number, val: number) => void;
    onClose: () => void;
    onWinner: () => void;
}

export const FinalJeopardyOverlay: React.FC<FinalJeopardyOverlayProps> = ({
    data, teams, step, setStep, wagers, setWagers, onScore, onClose, onWinner
}) => {
    const [localDeltas, setLocalDeltas] = useState<Record<number, number>>({});
    useEffect(() => {
        if (step === 'winner') {
            onWinner();
        }
    }, [step, onWinner]);

    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-6">
            <div className="w-full max-w-6xl text-center space-y-12 animate-in fade-in duration-500">
                {step === 'wager' ? (
                    <div className="space-y-12 max-w-5xl mx-auto">
                        <div className="space-y-2">
                            <h2 className="text-9xl font-black text-white uppercase tracking-tighter italic">FINAL STAGE</h2>
                            <div className="inline-block px-12 py-4 bg-indigo-600 rounded-full text-white text-2xl font-black uppercase tracking-widest shadow-2xl">
                                CATEGORY: <RenderHTML text={data.category} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {teams.map(t => {
                                const max = t.score <= 0 ? Math.abs(t.score) : t.score;
                                return (
                                    <div key={t.id} className="bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-800 text-white space-y-6 shadow-2xl">
                                        <div className="text-center">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] block mb-2">{t.name}</span>
                                            <span className="text-xl font-bold text-indigo-200 block">Bank: ${t.score}</span>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-indigo-500">$</span>
                                            <input type="number" step="100" value={wagers[t.id] || 0} onChange={(e) => setWagers({ ...wagers, [t.id]: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-slate-800 border-2 border-slate-700 p-6 pl-12 rounded-[2rem] outline-none text-4xl font-black text-white focus:border-indigo-500 transition-all" />
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase">Max Allowed: ${max}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setStep('clue')}
                            className="px-20 py-10 bg-white text-slate-950 rounded-[4rem] font-black text-4xl uppercase tracking-[0.4em] hover:bg-indigo-50 shadow-2xl transition-all">
                            Reveal Final Clue
                        </button>
                    </div>
                ) : step === 'clue' ? (
                    <div className="bg-white p-24 rounded-[6rem] shadow-2xl space-y-20 animate-in zoom-in-95 relative">
                        <div className="absolute top-10 right-10">
                            <CountdownTimer />
                        </div>
                        <h2 className="text-7xl font-black text-slate-900 leading-[1.1] max-w-5xl mx-auto"><RenderHTML text={data.clue} /></h2>
                        <button
                            onClick={() => setStep('reveal')}
                            className="px-20 py-10 bg-slate-900 text-white rounded-[4rem] font-black text-4xl uppercase tracking-[0.4em] hover:bg-black shadow-2xl transition-all">
                            Identify Response
                        </button>
                    </div>
                ) : step === 'reveal' ? (
                    <div className="bg-white p-24 rounded-[6rem] shadow-2xl space-y-16 animate-in zoom-in-95">
                        <div className="space-y-6">
                            <div className="text-emerald-500 font-black uppercase tracking-[0.5em]">The Correct Response</div>
                            <h2 className="text-8xl font-black text-indigo-950 leading-[1.1] bg-indigo-50 p-16 rounded-[4rem] shadow-inner border-2 border-indigo-100"><RenderHTML text={data.answer} /></h2>
                        </div>
                        <div className="pt-16 border-t border-slate-100 flex flex-wrap justify-center gap-10">
                            {teams.map(t => {
                                const delta = localDeltas[t.id] || 0;
                                return (
                                    <div key={t.id} className="p-8 bg-slate-50 rounded-[3rem] border-2 border-slate-200 min-w-[220px] text-center space-y-8 relative">
                                        <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{t.name}</span>
                                        <div className="flex gap-4">
                                            <button aria-label={`Subtract wager from ${t.name}`} onClick={() => {
                                                playBuzz();
                                                const val = -(wagers[t.id] || 0);
                                                onScore(t.id, val);
                                                setLocalDeltas(prev => ({ ...prev, [t.id]: (prev[t.id] || 0) + val }));
                                            }} className="flex-1 py-6 bg-white hover:bg-rose-50 text-rose-500 rounded-3xl border-2 border-slate-200 transition-all font-black text-2xl shadow-sm"><Minus className="mx-auto" /></button>
                                            <button aria-label={`Add wager to ${t.name}`} onClick={() => {
                                                playChime();
                                                const val = (wagers[t.id] || 0);
                                                onScore(t.id, val);
                                                setLocalDeltas(prev => ({ ...prev, [t.id]: (prev[t.id] || 0) + val }));
                                            }} className="flex-1 py-6 bg-white hover:bg-emerald-50 text-emerald-500 rounded-3xl border-2 border-slate-200 transition-all font-black text-2xl shadow-sm"><Plus className="mx-auto" /></button>
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
                        <div className="flex gap-4 justify-center">
                            <button onClick={onClose} className="px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-black transition-all">Close Stage</button>
                            <button onClick={() => setStep('winner')} className="px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2"><Sparkles className="animate-spin-slow" /> Celebrate Winner</button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12 animate-in slide-in-from-bottom-20 duration-1000">
                        <h2 className="text-8xl font-black text-white uppercase tracking-tighter italic drop-shadow-2xl">Final Standings</h2>
                        <div className="flex flex-wrap justify-center items-end gap-8 px-10">
                            {sortedTeams.map((t, i: number) => {
                                const isFirst = i === 0;
                                const height = isFirst ? 'h-96' : i === 1 ? 'h-72' : 'h-60';
                                const color = isFirst ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 border-yellow-200 text-yellow-950' :
                                    i === 1 ? 'bg-slate-300 text-slate-800' : 'bg-orange-300 text-orange-900';

                                return (
                                    <div key={t.id} className={`rounded-t-[3rem] ${isFirst ? 'w-80 z-10 scale-110 shadow-[0_0_100px_rgba(234,179,8,0.5)]' : 'w-60 opacity-90'} ${height} ${color} flex flex-col items-center justify-end p-8 border-t-4 border-white/50 relative transition-all`}>
                                        {isFirst && <Sparkles className="absolute -top-16 text-yellow-300 w-24 h-24 animate-pulse" />}
                                        <div className="text-center mb-6">
                                            <span className="block text-sm font-black uppercase tracking-widest mb-2 opacity-60">Rank #{i + 1}</span>
                                            <h3 className="text-3xl font-black uppercase leading-none mb-4">{t.name}</h3>
                                            <div className="text-5xl font-black">${t.score}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={onClose} className="mt-20 px-16 py-8 bg-white text-slate-900 rounded-full font-black text-2xl uppercase tracking-widest hover:bg-slate-200 shadow-2xl transition-all">Return to Dashboard</button>
                    </div>
                )}
            </div>
        </div>
    );
};
