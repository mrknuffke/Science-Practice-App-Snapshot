import React from 'react';
import { Sparkles } from 'lucide-react';
import { useDialog } from '../../../hooks/useDialog';

interface EndSessionModalProps {
    isOpen: boolean;
    hasAnyScore: boolean;
    onEndSession: (withWinner: boolean) => void;
    onClose: () => void;
}

export const EndSessionModal: React.FC<EndSessionModalProps> = ({
    isOpen,
    hasAnyScore,
    onEndSession,
    onClose
}) => {
  const dialog = useDialog({ onClose, labelledBy: 'end-session-title', open: isOpen });
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div {...dialog} className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 border border-slate-100 animate-in zoom-in-95 duration-200">
                <h3 id="end-session-title" className="text-2xl font-black text-slate-900 mb-3">End current session?</h3>
                <p className="text-slate-500 text-sm font-medium mb-8">
                    {hasAnyScore
                        ? "Teams have scored — you can end with a winner celebration or just discard the game."
                        : "This will clear the current board and teams."}
                </p>
                <div className="flex flex-col gap-3">
                    {hasAnyScore && (
                        <button
                            onClick={() => onEndSession(true)}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" /> Declare Winner & End
                        </button>
                    )}
                    <button
                        onClick={() => onEndSession(false)}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all"
                    >
                        {hasAnyScore ? "Discard & Exit" : "End Session"}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-2xl transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
