import { errorMessage } from '../../utils/errorMessage';
import React, { useState, useEffect } from 'react';
import { SavedFlashcardDeck } from './types';
import { getSavedDecks, deleteSavedDeck, saveDeckToStorage } from './srsEngine';
import { OCCLUSION_PRESETS, OcclusionDeckPreset } from './occlusionPresets';
import { MULTI_STEP_DECK_PRESETS, MultiStepDeckPreset } from './multiStepPresets';
import { CourseType } from '../../types';
import { useDialog } from '../../hooks/useDialog';

interface SavedDecksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDeck: (deck: SavedFlashcardDeck) => void;
  currentDeck?: SavedFlashcardDeck | null;
}

export const SavedDecksModal: React.FC<SavedDecksModalProps> = ({
  isOpen,
  onClose,
  onLoadDeck,
  currentDeck
}) => {
  const dialog = useDialog({ onClose, labelledBy: 'saved-decks-title', open: isOpen });
  const [decks, setDecks] = useState<SavedFlashcardDeck[]>([]);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const refreshDecks = () => {
    setDecks(getSavedDecks());
  };

  useEffect(() => {
    if (isOpen) {
      refreshDecks();
      setShowImport(false);
      setImportError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the deck "${title}"?`)) {
      deleteSavedDeck(id);
      refreshDecks();
    }
  };

  const handleExport = (deck: SavedFlashcardDeck, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(deck, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${deck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_flashcards.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoadPreset = (preset: OcclusionDeckPreset) => {
    const deck: SavedFlashcardDeck = {
      id: preset.id,
      title: preset.title,
      course: preset.course as CourseType,
      topic: preset.topic,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cards: preset.cards,
    };
    saveDeckToStorage(deck);
    onLoadDeck(deck);
    onClose();
  };

  const handleLoadMultiStepPreset = (preset: MultiStepDeckPreset) => {
    const deck: SavedFlashcardDeck = {
      id: preset.id,
      title: preset.title,
      course: preset.course as CourseType,
      topic: preset.topic,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cards: preset.cards,
    };
    saveDeckToStorage(deck);
    onLoadDeck(deck);
    onClose();
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    try {
      const parsed = JSON.parse(importText);
      if (!parsed.title || !Array.isArray(parsed.cards) || parsed.cards.length === 0) {
        throw new Error("Invalid deck format. Expected object with 'title' and a non-empty 'cards' array.");
      }
      const importedDeck: SavedFlashcardDeck = {
        id: parsed.id || `deck-${Date.now()}`,
        title: parsed.title,
        course: parsed.course || 'Custom Practice',
        topic: parsed.topic || parsed.title,
        createdAt: parsed.createdAt || Date.now(),
        updatedAt: Date.now(),
        cards: parsed.cards
      };
      saveDeckToStorage(importedDeck);
      refreshDecks();
      setShowImport(false);
      setImportText('');
    } catch (err) {
      setImportError(errorMessage(err, "Failed to parse JSON."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div {...dialog} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 id="saved-decks-title" className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2.5">
              <span>📚</span>
              <span>Saved Study Decks</span>
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Load previously generated study sets or import custom decks without using AI tokens.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {showImport ? (
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Paste Deck JSON</span>
                <button
                  type="button"
                  onClick={() => setShowImport(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
              <textarea aria-label="Deck JSON"
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder='{"title": "My Deck", "course": "AP Biology", "cards": [{"term": "...", "definition": "..."}]}'
                rows={8}
                className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                autoFocus
              />
              {importError && (
                <p className="text-rose-500 text-xs font-bold">{importError}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all"
              >
                Import Deck
              </button>
            </form>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {decks.length} {decks.length === 1 ? 'Deck' : 'Decks'} Stored Locally
                </span>
                <button
                  onClick={() => setShowImport(true)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>📥</span> Import JSON
                </button>
              </div>

              {/* Featured Image Occlusion Decks */}
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400 mb-2 flex items-center gap-1.5">
                  <span>🧠</span> Featured: Image Occlusion Decks
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {OCCLUSION_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleLoadPreset(preset)}
                      className="w-full p-3 rounded-2xl border-2 border-purple-200 dark:border-purple-800/60 bg-purple-50/60 dark:bg-purple-950/20 hover:border-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{preset.title}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {preset.course} &bull; {preset.cards.length} cards &bull; SVG occlusion
                          </p>
                        </div>
                        <span className="text-xs font-black text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0">Load →</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Sequential Pathway Decks */}
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                  <span>🪜</span> Featured: Sequential Pathways (Multi-Step)
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {MULTI_STEP_DECK_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleLoadMultiStepPreset(preset)}
                      className="w-full p-3 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/60 dark:bg-indigo-950/20 hover:border-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{preset.title}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {preset.course} &bull; {preset.cards.length} cards &bull; Multi-Step Progressive Recall
                          </p>
                        </div>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0">Load →</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {decks.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <div className="text-4xl mb-3">📭</div>
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No saved decks yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Click "Save Deck" on any flashcard session to keep it in your permanent study library.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {decks.map(deck => {
                    const isCurrent = currentDeck?.id === deck.id;
                    const dateStr = new Date(deck.updatedAt || deck.createdAt).toLocaleDateString();

                    return (
                      <div
                        key={deck.id}
                        onClick={() => {
                          onLoadDeck(deck);
                          onClose();
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                          isCurrent
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                            : 'border-slate-200/80 dark:border-slate-700 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white truncate">
                              {deck.title}
                            </h4>
                            {isCurrent && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <span>{deck.course}</span>
                            <span>•</span>
                            <span>{deck.cards.length} cards</span>
                            <span>•</span>
                            <span>Updated {dateStr}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={e => handleExport(deck, e)}
                            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="Export as JSON"
                          >
                            📤
                          </button>
                          <button
                            onClick={e => handleDelete(deck.id, deck.title, e)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Deck"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
