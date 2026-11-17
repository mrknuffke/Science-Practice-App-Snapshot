
import React from 'react';
import { FlaskConical, ArrowLeft } from 'lucide-react';

interface JeopardyLayoutProps {
    children: React.ReactNode;
    onExit: () => void;
}

const JeopardyLayout: React.FC<JeopardyLayoutProps> = ({ children, onExit }) => {
    return (
        <div className="flex h-screen flex-col bg-slate-50">
            {/* Immersive Header */}
            <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 shrink-0 shadow-2xl">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onExit}
                            className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
                            title="Exit to Menu"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-900/50">
                                <FlaskConical className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-xl font-black tracking-tighter text-white uppercase">AI SCIENCE<span className="text-indigo-500"> JEOPARDY</span></h1>
                        </div>
                    </div>
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] hidden md:block text-right">
                        AI Science Jeopardy: A modern science review game
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden p-4 md:p-8">
                <div className="max-w-[1600px] mx-auto h-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default JeopardyLayout;
