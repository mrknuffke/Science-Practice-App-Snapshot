import React from 'react';
import { X, FlaskConical, ShieldCheck, DollarSign, Eye, Timer as TimerIcon, ToggleLeft } from 'lucide-react';
import { useDialog } from '../../../hooks/useDialog';

interface HowToGuideProps {
    onClose: () => void;
}

export const HowToGuide: React.FC<HowToGuideProps> = ({ onClose }) => {
    const dialog = useDialog({ onClose, labelledBy: 'howto-guide-title' });
    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 flex items-center justify-center p-6 backdrop-blur-md">
            <div {...dialog} className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative animate-in slide-in-from-bottom-10">
                <button aria-label="Close" onClick={onClose} className="absolute top-8 right-8 p-4 bg-slate-100 rounded-full hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all"><X /></button>
                <h3 id="howto-guide-title" className="text-4xl font-black text-slate-900 mb-8 flex items-center gap-4"><FlaskConical className="text-indigo-600" /> Instructor Guide</h3>
                <div className="space-y-8 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
                    <div className="space-y-3">
                        <h4 className="font-black text-indigo-600 uppercase tracking-widest text-[10px] flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Curriculum Design</h4>
                        <p className="text-slate-600 leading-relaxed font-medium">Use the <b>Save Initial</b> feature to store your perfect review state. The app prevents duplicate boards in your library automatically.</p>
                    </div>
                    <div className="space-y-3 border-t pt-8">
                        <h4 className="font-black text-indigo-600 uppercase tracking-widest text-[10px] flex items-center gap-2"><DollarSign className="w-4 h-4" /> Wagering & Recovering</h4>
                        <p className="text-slate-600 leading-relaxed font-medium">Daily Doubles and Final Stage require wagers. Teams can wager up to their current bank. <b>House Rule:</b> If a team has negative funds, they can wager up to $1000 to attempt a recovery.</p>
                    </div>
                    <div className="space-y-3 border-t pt-8">
                        <h4 className="font-black text-indigo-600 uppercase tracking-widest text-[10px] flex items-center gap-2"><Eye className="w-4 h-4" /> Teacher Preview</h4>
                        <p className="text-slate-600 leading-relaxed font-medium">Always review clues before showing the class. You can regenerate any category or specific clue with custom AI refinement notes if it doesn't meet your standard.</p>
                    </div>
                    <div className="space-y-3 border-t pt-8">
                        <h4 className="font-black text-indigo-600 uppercase tracking-widest text-[10px] flex items-center gap-2"><TimerIcon className="w-4 h-4" /> Reusable Timer</h4>
                        <p className="text-slate-600 leading-relaxed font-medium">A 1-minute timer is available during question delivery. Click the play icon to start, and reset as many times as needed. A gentle chime sounds when time is up.</p>
                    </div>
                    <div className="space-y-3 border-t pt-8">
                        <h4 className="font-black text-indigo-600 uppercase tracking-widest text-[10px] flex items-center gap-2"><ToggleLeft className="w-4 h-4" /> Mode Toggle</h4>
                        <p className="text-slate-600 leading-relaxed font-medium"><b>Standard Mode:</b> Direct questions for fast pacing. <b>Classic Mode:</b> Emulates the TV show with statements as clues and questions as responses.</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-full mt-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Let's Science</button>
            </div>
        </div>
    );
};
