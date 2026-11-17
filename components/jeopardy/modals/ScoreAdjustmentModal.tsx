import React, { useState } from 'react';
import { useDialog } from '../../../hooks/useDialog';

interface ScoreAdjustmentModalProps {
    isOpen: boolean;
    teamName: string;
    currentScore: number;
    onConfirm: (newScore: number) => void;
    onClose: () => void;
}

export const ScoreAdjustmentModal: React.FC<ScoreAdjustmentModalProps> = ({
    isOpen, teamName, currentScore, onConfirm, onClose
}) => {
  const dialog = useDialog({ onClose, labelledBy: 'score-adjust-title', open: isOpen });
    const [score, setScore] = useState(currentScore);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
            <div {...dialog} className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl space-y-6">
                <h3 id="score-adjust-title" className="text-xl font-black text-slate-800">Adjust Score: {teamName}</h3>
                <input aria-label={`New score for ${teamName}`}
                    type="number"
                    value={score}
                    onChange={e => setScore(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-100 p-4 rounded-xl text-3xl font-black text-center outline-none focus:ring-4 focus:ring-indigo-100"
                />
                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl text-slate-500">Cancel</button>
                    <button onClick={() => onConfirm(score)} className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-xl">Save</button>
                </div>
            </div>
        </div>
    );
};
