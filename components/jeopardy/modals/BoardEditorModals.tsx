import React from 'react';
import { JeopardyBoardData, SavedBoard, FinalJeopardy } from '../types';
import {
    AiReviseCategoryModal,
    AiReviseQuestionModal,
    AiReviseFinalModal
} from './AiReviseModals';
import { FinalJeopardyEditModal } from './FinalJeopardyEditModal';
import { QuestionEditModal } from './QuestionEditModal';
import { LibraryModal } from './LibraryModal';
import { InputModal } from './InputModal';

interface BoardEditorModalsProps {
    board?: JeopardyBoardData | null;
    topic?: string;
    aiReviseCat?: { cIdx: number } | null;
    onCloseAiReviseCat?: () => void;
    onSubmitAiReviseCat?: (newTitle: string, prompt: string) => void | Promise<void>;
    aiReviseQ?: { cIdx: number; qIdx: number } | null;
    onCloseAiReviseQ?: () => void;
    onSubmitAiReviseQ?: (prompt: string) => void | Promise<void>;
    aiReviseFinal?: boolean;
    onCloseAiReviseFinal?: () => void;
    onSubmitAiReviseFinal?: (newCategory: string, prompt: string) => void | Promise<void>;
    editingQ?: { cIdx: number; qIdx: number; q: string; a: string; h: string } | null;
    onCloseEditingQ?: () => void;
    onSaveEditingQ?: (q: string, a: string, h: string) => void;
    editingFinal?: FinalJeopardy | null;
    onCloseEditingFinal?: () => void;
    onSaveEditingFinal?: (category: string, clue: string, answer: string) => void;
    showLibrary: boolean;
    savedBoards: SavedBoard[];
    onLoadBoard: (board: SavedBoard) => void;
    onDeleteBoard: (id: string) => void;
    onCloseLibrary: () => void;
    inputModal: { title: string; defaultValue: string; onConfirm: (val: string) => void } | null;
    onCloseInputModal: () => void;
}

export const BoardEditorModals: React.FC<BoardEditorModalsProps> = ({
    board = null,
    topic = '',
    aiReviseCat = null,
    onCloseAiReviseCat = () => {},
    onSubmitAiReviseCat = () => {},
    aiReviseQ = null,
    onCloseAiReviseQ = () => {},
    onSubmitAiReviseQ = () => {},
    aiReviseFinal = false,
    onCloseAiReviseFinal = () => {},
    onSubmitAiReviseFinal = () => {},
    editingQ = null,
    onCloseEditingQ = () => {},
    onSaveEditingQ = () => {},
    editingFinal = null,
    onCloseEditingFinal = () => {},
    onSaveEditingFinal = () => {},
    showLibrary,
    savedBoards,
    onLoadBoard,
    onDeleteBoard,
    onCloseLibrary,
    inputModal,
    onCloseInputModal
}) => {
    return (
        <>
            {aiReviseCat && board && (
                <AiReviseCategoryModal
                    category={board.categories[aiReviseCat.cIdx]}
                    onClose={onCloseAiReviseCat}
                    onSubmit={onSubmitAiReviseCat}
                />
            )}
            {aiReviseQ && board && (
                <AiReviseQuestionModal
                    question={board.categories[aiReviseQ.cIdx].questions[aiReviseQ.qIdx]}
                    categoryTitle={board.categories[aiReviseQ.cIdx].title}
                    onClose={onCloseAiReviseQ}
                    onSubmit={onSubmitAiReviseQ}
                />
            )}
            {aiReviseFinal && board?.finalJeopardy && (
                <AiReviseFinalModal
                    final={board.finalJeopardy}
                    onClose={onCloseAiReviseFinal}
                    onSubmit={onSubmitAiReviseFinal}
                />
            )}
            {editingQ && (
                <QuestionEditModal
                    isOpen={true}
                    qData={editingQ}
                    topic={topic}
                    onClose={onCloseEditingQ}
                    onConfirm={onSaveEditingQ}
                />
            )}
            {editingFinal && (
                <FinalJeopardyEditModal
                    final={editingFinal}
                    onClose={onCloseEditingFinal}
                    onSave={onSaveEditingFinal}
                />
            )}
            {showLibrary && (
                <LibraryModal
                    savedBoards={savedBoards}
                    loadBoard={onLoadBoard}
                    deleteBoard={onDeleteBoard}
                    onClose={onCloseLibrary}
                />
            )}
            {inputModal && (
                <InputModal
                    isOpen={true}
                    title={inputModal.title}
                    defaultValue={inputModal.defaultValue}
                    onConfirm={inputModal.onConfirm}
                    onClose={onCloseInputModal}
                />
            )}
        </>
    );
};
