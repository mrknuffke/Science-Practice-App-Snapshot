import React from 'react';
import { useDialog } from '../hooks/useDialog';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const dialog = useDialog({ onClose, labelledBy: 'feedback-modal-title', open: isOpen });
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
            <div {...dialog} className="relative bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
                    📬
                </div>
                <h3 id="feedback-modal-title" className="text-2xl font-black text-slate-800 mb-2">Send Feedback</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                    Have a feature request, bug report, or just want to say hi? I'd love to hear from you.
                </p>

                <a
                    href="mailto:dknuffke@sas.edu.sg?subject=Sciencepractice.app Feedback"
                    className="block w-full py-4 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 shadow-xl transition-all mb-3"
                >
                    Email Me
                </a>
                <button
                    onClick={onClose}
                    className="w-full py-4 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default FeedbackModal;
