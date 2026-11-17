import React, { useState } from 'react';
import { useDialog } from '../../../hooks/useDialog';

interface InputModalProps {
    isOpen: boolean;
    title: string;
    defaultValue: string;
    onConfirm: (val: string) => void;
    onClose: () => void;
}

export const InputModal: React.FC<InputModalProps> = ({ isOpen, title, defaultValue, onConfirm, onClose }) => {
    const dialog = useDialog({ onClose, labelledBy: 'input-modal-title', open: isOpen });
    const [value, setValue] = useState(defaultValue);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div {...dialog} className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl space-y-6">
                <h3 id="input-modal-title" className="text-2xl font-black text-slate-900">{title}</h3>
                <input aria-label={title}
                    autoFocus
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') onConfirm(value); }}
                    className="w-full bg-slate-100 border-2 border-slate-200 p-4 rounded-xl outline-none focus:border-indigo-600 font-bold text-slate-800"
                />
                <div className="flex gap-4 justify-end">
                    <button onClick={onClose} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                    <button onClick={() => onConfirm(value)} className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors uppercase tracking-widest shadow-lg shadow-indigo-200">Confirm</button>
                </div>
            </div>
        </div>
    );
};
