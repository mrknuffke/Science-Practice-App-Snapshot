import React, { useState } from 'react';
import { getSavedWhoAmIGames, deleteWhoAmIGame, SavedWhoAmIGame } from '../../services/storageService';
import { useDialog } from '../../hooks/useDialog';

interface LoadGameModalProps {
    onLoad: (game: SavedWhoAmIGame) => void;
    onClose: () => void;
}

const LoadGameModal: React.FC<LoadGameModalProps> = ({ onLoad, onClose }) => {
    const dialog = useDialog({ onClose, labelledBy: 'load-game-title' });
    const [refresh, setRefresh] = useState(0);
    const _games = getSavedWhoAmIGames();

    const handleDelete = (game: SavedWhoAmIGame) => {
        if (confirm(`Delete "${game.name}"?`)) {
            deleteWhoAmIGame(game.id);
            setRefresh(r => r + 1); // re-fetch saved games
        }
    };

    // trigger re-read on each refresh tick
    void refresh;
    const currentGames = getSavedWhoAmIGames();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div {...dialog} className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
                <h3 id="load-game-title" className="text-2xl font-black text-slate-900 mb-4">Load Saved Game</h3>
                {currentGames.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No saved games yet. Save a game to reuse it later!</p>
                ) : (
                    <div className="space-y-3">
                        {currentGames.map((game) => (
                            <div
                                key={game.id}
                                className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 hover:border-indigo-300 transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 text-lg">{game.name}</h4>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {game.course} • {game.topic} • {game.puzzles.length} puzzles
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Created: {new Date(game.dateCreated).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onLoad(game)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() => handleDelete(game)}
                                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <button
                    onClick={onClose}
                    className="mt-4 w-full bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-3 rounded-xl font-bold transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default LoadGameModal;
