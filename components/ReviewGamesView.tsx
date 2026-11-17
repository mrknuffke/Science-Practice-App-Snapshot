
import React from 'react';
import { FlaskConical, ArrowRight, ArrowLeft } from 'lucide-react';

interface ReviewGamesViewProps {
    onBack: () => void;
    onStartJeopardy: () => void;
    onStartSquareMatch: () => void;
    onStartWhoAmI: () => void;
    onStartBingo: () => void;
    onStartCharades: () => void;
    onStartTaboo: () => void;
    onStartVocabRelay: () => void;
}

const ReviewGamesView: React.FC<ReviewGamesViewProps> = ({
    onBack,
    onStartJeopardy,
    onStartSquareMatch,
    onStartWhoAmI,
    onStartBingo,
    onStartCharades,
    onStartTaboo,
    onStartVocabRelay
}) => {
    return (
        <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
            <div className="max-w-6xl w-full">
                {/* Header */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                    <button
                        onClick={onBack}
                        className="absolute top-0 left-0 text-slate-400 hover:text-slate-600 flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Menu
                    </button>

                    <div className="inline-block bg-indigo-100 text-indigo-600 p-4 rounded-2xl mb-4">
                        <span className="text-4xl">🎮</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Review Games & Activities</h1>
                    <p className="text-slate-500 text-lg max-w-xl mx-auto">
                        Engaging, gamified review tools for the whole class.
                    </p>
                </div>

                {/* Selection Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Science Jeopardy */}
                    <button
                        onClick={onStartJeopardy}
                        className="bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800 hover:scale-[1.02] hover:shadow-2xl transition-all group text-left relative overflow-hidden h-full flex flex-col"
                    >
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FlaskConical className="w-32 h-32 text-indigo-500" />
                        </div>

                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-900/50 group-hover:bg-indigo-500 transition-colors">
                            <FlaskConical className="w-6 h-6 text-white" />
                        </div>

                        <h3 className="text-xl font-black text-white mb-2 group-hover:text-indigo-300 transition-colors uppercase tracking-tight">Science Jeopardy</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-1 font-medium">
                            A fully-featured, AI-powered review game. Supports multiple teams, daily doubles, final jeopardy, and teacher controls.
                        </p>

                        <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest group-hover:text-white transition-colors">
                            Launch Game <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>


                    {/* Square Match Puzzle */}
                    <button
                        onClick={onStartSquareMatch}
                        className="bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800 hover:scale-[1.02] hover:shadow-2xl transition-all group text-left relative overflow-hidden h-full flex flex-col"
                    >
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-[8rem]">🧩</span>
                        </div>

                        <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/50 group-hover:bg-emerald-500 transition-colors">
                            <span className="text-2xl">🧩</span>
                        </div>

                        <h3 className="text-xl font-black text-white mb-2 group-hover:text-emerald-300 transition-colors uppercase tracking-tight">Square Match Puzzle</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-1 font-medium">
                            Create printable scrambled "Tarsia-style" puzzles where students match terms on adjacent square edges. Ideal for hands-on review.
                        </p>

                        <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest group-hover:text-white transition-colors">
                            Build Grid <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>

                    {/* Who Am I? */}
                    <button
                        onClick={onStartWhoAmI}
                        className="bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800 hover:scale-[1.02] hover:shadow-2xl transition-all group text-left relative overflow-hidden h-full flex flex-col"
                    >
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-[8rem]">🕵️</span>
                        </div>

                        <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-amber-900/50 group-hover:bg-amber-500 transition-colors">
                            <span className="text-2xl">🕵️</span>
                        </div>

                        <h3 className="text-xl font-black text-white mb-2 group-hover:text-amber-300 transition-colors uppercase tracking-tight">Who Am I?</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-1 font-medium">
                            A classic 20-questions style guessing game! Project clues progressively to the class and see who can guess the entity first.
                        </p>

                        <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-widest group-hover:text-white transition-colors">
                            Setup Game <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>

                    {/* Bingo Generator */}
                    <button
                        onClick={onStartBingo}
                        className="bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800 hover:scale-[1.02] hover:shadow-2xl transition-all group text-left relative overflow-hidden h-full flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-[8rem]">🔢</span>
                        </div>

                        <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-sky-900/50 group-hover:bg-sky-500 transition-colors">
                            <span className="text-2xl">🔢</span>
                        </div>

                        <h3 className="text-xl font-black text-white mb-2 group-hover:text-sky-300 transition-colors uppercase tracking-tight">Review BINGO</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-1 font-medium">
                            Generate printable, randomized BINGO boards and a detailed teacher calling script for any topic.
                        </p>

                        <div className="flex items-center gap-2 text-sky-400 font-black text-xs uppercase tracking-widest group-hover:text-white transition-colors">
                            Build Boards <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>

                    {/* Charades & Pictionary */}
                    <button
                        onClick={onStartCharades}
                        className="bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800 hover:scale-[1.02] hover:shadow-2xl transition-all group text-left relative overflow-hidden h-full flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-[8rem]">🎭</span>
                        </div>

                        <div className="w-12 h-12 bg-fuchsia-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-fuchsia-900/50 group-hover:bg-fuchsia-500 transition-colors">
                            <span className="text-2xl">🎭</span>
                        </div>

                        <h3 className="text-xl font-black text-white mb-2 group-hover:text-fuchsia-300 transition-colors uppercase tracking-tight">Charades &amp; Pictionary</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-1 font-medium">
                            AI-generated cards in two flavors — act them out (Charades) or draw them (Pictionary). Print, or play live with timer, team scoring, and end-of-round score correction.
                        </p>

                        <div className="flex items-center gap-2 text-fuchsia-400 font-black text-xs uppercase tracking-widest group-hover:text-white transition-colors">
                            Build Deck <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>

                    {/* Taboo */}
                    <button
                        onClick={onStartTaboo}
                        className="bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800 hover:scale-[1.02] hover:shadow-2xl transition-all group text-left relative overflow-hidden h-full flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-[8rem]">🚫</span>
                        </div>

                        <div className="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-rose-900/50 group-hover:bg-rose-500 transition-colors">
                            <span className="text-2xl">🚫</span>
                        </div>

                        <h3 className="text-xl font-black text-white mb-2 group-hover:text-rose-300 transition-colors uppercase tracking-tight">Science Taboo</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-1 font-medium">
                            Target words with configurable forbidden clues. Edit, print, or play live with team buzzers and keyboard shortcuts.
                        </p>

                        <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-widest group-hover:text-white transition-colors">
                            Build Deck <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>

                    {/* Vocab Relay */}
                    <button
                        onClick={onStartVocabRelay}
                        className="bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800 hover:scale-[1.02] hover:shadow-2xl transition-all group text-left relative overflow-hidden h-full flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-[8rem]">🏃</span>
                        </div>

                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-900/50 group-hover:bg-indigo-500 transition-colors">
                            <span className="text-2xl">🏃</span>
                        </div>

                        <h3 className="text-xl font-black text-white mb-2 group-hover:text-indigo-300 transition-colors uppercase tracking-tight">Vocab Relay</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-1 font-medium">
                            High-energy, turn-based team review game. Pass &amp; Play, Projector Dual, or Solo Sprint with active runner baton passes, streaks, and match reports.
                        </p>

                        <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest group-hover:text-white transition-colors">
                            Sprint Now <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>

                </div>
            </div>
        </div>
    );
};

export default ReviewGamesView;
