import React from 'react';
import { X, Download, Trash2 } from 'lucide-react';
import { SavedBoard } from '../types';
import { useDialog } from '../../../hooks/useDialog';

interface LibraryModalProps {
    savedBoards: SavedBoard[];
    loadBoard: (b: SavedBoard) => void;
    deleteBoard: (id: string) => void;
    onClose: () => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
    savedBoards, loadBoard, deleteBoard, onClose
}) => {
    const dialog = useDialog({ onClose, labelledBy: 'library-modal-title' });
    return (
        <div className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-6">
            <div {...dialog} className="bg-white w-full max-w-4xl rounded-[4rem] p-12 max-h-[85vh] flex flex-col shadow-2xl border-8 border-white overflow-hidden animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-10 shrink-0 border-b pb-8">
                    <div>
                        <h3 id="library-modal-title" className="text-4xl font-black text-slate-900 flex items-center gap-4">Draft Library</h3>
                        <p className="text-slate-500 mt-1 font-medium italic">Manage and recall your prepared review sets.</p>
                    </div>
                    <button aria-label="Close" onClick={onClose} className="p-4 bg-slate-100 rounded-full hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all"><X className="w-6 h-6" /></button>
                </div>
                <div className="overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                    {savedBoards.length === 0 ? (
                        <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">No saved boards in library.</div>
                    ) : savedBoards.map((b: SavedBoard) => (
                        <div key={b.id} className="p-8 bg-slate-50 rounded-[3rem] border-2 border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-2xl hover:border-indigo-300 transition-all">
                            <div className="flex-1">
                                <h4 className="font-black text-slate-800 text-3xl leading-tight mb-2 uppercase tracking-tighter">{b.name}</h4>
                                <div className="flex gap-4">
                                    <span className="px-4 py-1.5 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{b.topic}</span>
                                    <span className="px-4 py-1.5 bg-slate-200 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">{b.gradeLevel}</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button aria-label={`Load ${b.name}`} onClick={() => loadBoard(b)} className="p-6 bg-slate-900 text-white rounded-3xl hover:bg-black shadow-xl transition-all active:scale-90"><Download className="w-8 h-8" /></button>
                                <button aria-label={`Delete ${b.name}`} onClick={() => deleteBoard(b.id)} className="p-6 bg-white text-rose-500 border-2 border-slate-100 rounded-3xl hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-90"><Trash2 className="w-8 h-8" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
