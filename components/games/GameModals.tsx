import React, { useId } from 'react';
import { Sparkles } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';

/**
 * Modals shared by the review games (Bingo, Charades, Taboo, Who Am I?). Each game used to carry
 * its own copy; one copy keeps the look and the keyboard behaviour the same everywhere.
 */

interface ReviseModalProps {
  /** What is being revised, as the heading says it: "Card", "Term", "Puzzle". */
  itemNoun: string;
  currentLabel: string;
  /** Optional line under "Currently:" saying what the AI may change. */
  explainer?: string;
  placeholder: string;
  notes: string;
  onChange: (notes: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ReviseModal: React.FC<ReviseModalProps> = ({ itemNoun, currentLabel, explainer, placeholder, notes, onChange, onConfirm, onCancel }) => {
  const titleId = useId();
  const dialog = useDialog({ onClose: onCancel, labelledBy: titleId });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div {...dialog} className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
        <h3 id={titleId} className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-fuchsia-600" /> AI Revise {itemNoun}
        </h3>
        <p className={`text-slate-600 text-sm ${explainer ? 'mb-2' : 'mb-3'}`}>Currently: <strong>{currentLabel}</strong></p>
        {explainer && <p className="text-slate-500 mb-3 text-xs">{explainer}</p>}
        <textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-fuchsia-500 mb-4 resize-none"
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onConfirm} disabled={!notes.trim()} className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-4 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Revise
          </button>
          <button onClick={onCancel} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-3 rounded-xl font-bold transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
};

interface SaveDeckModalProps {
  title: string;
  onChange: (title: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  /** Tailwind focus border for the title box, in the game's accent (a literal class, so Tailwind keeps it). */
  focusClass: string;
}

export const SaveDeckModal: React.FC<SaveDeckModalProps> = ({ title, onChange, onConfirm, onCancel, focusClass }) => {
  const titleId = useId();
  const dialog = useDialog({ onClose: onCancel, labelledBy: titleId });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div {...dialog} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 id={titleId} className="text-2xl font-black text-slate-900 mb-3">Save Deck to Library</h3>
        <input
          value={title}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Deck title"
          aria-label="Deck title"
          className={`w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold mb-4 focus:outline-none ${focusClass}`}
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onConfirm} disabled={!title.trim()} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold disabled:opacity-50">Save</button>
          <button onClick={onCancel} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-3 rounded-xl font-bold">Cancel</button>
        </div>
      </div>
    </div>
  );
};

interface SavedDeck {
  id: string;
  title: string;
}

interface LoadDeckModalProps<D extends SavedDeck> {
  title: string;
  decks: D[];
  /** The grey line under each deck's title, e.g. "24 cards • Grade 9 • 3/11/2026". */
  describe: (deck: D) => string;
  onLoad: (deck: D) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function LoadDeckModal<D extends SavedDeck>({ title, decks, describe, onLoad, onDelete, onClose }: LoadDeckModalProps<D>) {
  const titleId = useId();
  const dialog = useDialog({ onClose, labelledBy: titleId });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div {...dialog} className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <h3 id={titleId} className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
        {decks.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No saved decks yet.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {decks.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate">{d.title}</div>
                  <div className="text-xs text-slate-500">{describe(d)}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onLoad(d)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold">Load</button>
                  <button onClick={() => onDelete(d.id)} aria-label={`Delete ${d.title}`} className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-sm font-bold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={onClose} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-3 rounded-xl font-bold">Close</button>
      </div>
    </div>
  );
}
