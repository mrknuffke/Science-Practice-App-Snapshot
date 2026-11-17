
import { errorMessage } from '../utils/errorMessage';
import React, { useState } from 'react';
import { generateQuizFromDocuments, generateNoteSheet } from '../services/ai/documents';
import { FileData } from '../services/fileData';
import { Question, AppConfig } from '../types';
import FileUpload from './FileUpload';
import { SettingsPanel } from './SettingsPanel';

interface QuizMyNotesViewProps {
    onBack: () => void;
    onQuizReady: (questions: Question[], courseName: string, topicName: string) => void;
    onNoteSheetReady: (content: string, courseName: string, topicName: string) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export const QuizMyNotesView: React.FC<QuizMyNotesViewProps> = ({
    onBack,
    onQuizReady,
    onNoteSheetReady,
    isLoading,
    setIsLoading
}) => {
    const [courseInput, setCourseInput] = useState('');
    const [topicInput, setTopicInput] = useState('');
    const [textInput, setTextInput] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [_isDragging, _setIsDragging] = useState(false);
    const [mode, setMode] = useState<'quiz' | 'note_sheet'>('quiz');
    const [error, setError] = useState<string | null>(null);

    // Default configuration for the quiz mode
    const [config, setConfig] = useState<AppConfig>({
        difficulty: 'Medium',
        mcqCount: 2,
        saCount: 1,
        errorCount: 0,
        analogyCount: 0,
        oddOneOutCount: 0,
        worksheetStyle: 'Mixed',
        worksheetFocus: ['Standard Mixed']
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const convertFileConfigs = async (fileList: File[]): Promise<FileData[]> => {
        const promises = fileList.map(file => {
            return new Promise<FileData>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = (reader.result as string).split(',')[1];
                    resolve({
                        inlineData: {
                            data: base64String,
                            mimeType: file.type
                        }
                    });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
        return Promise.all(promises);
    };

    const handleStart = async () => {
        if (!courseInput.trim() || !topicInput.trim()) {
            setError("Please enter both a Course Name and a Topic.");
            return;
        }
        if (!textInput.trim() && files.length === 0) {
            setError("Please provide some text or upload a file.");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const filePayloads = await convertFileConfigs(files);
            const fullContext = `Course: ${courseInput}\nTopic: ${topicInput}\n\n${textInput}`;

            if (mode === 'quiz') {
                // Pass the full config object now
                const questions = await generateQuizFromDocuments(fullContext, filePayloads, 'High School', config);
                if (questions.length === 0) {
                    setError("Could not generate questions. Please ensure the content is clear.");
                } else {
                    onQuizReady(questions, courseInput, topicInput);
                }
            } else {
                // Generate Note Sheet
                const noteSheet = await generateNoteSheet(fullContext, filePayloads, 'High School');
                if (!noteSheet || noteSheet.length < 50) {
                    setError("Could not generate a sufficient summary.");
                } else {
                    onNoteSheetReady(noteSheet, courseInput, topicInput);
                }
            }

        } catch (err) {
            setError(errorMessage(err, "An error occurred."));
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg w-full border border-slate-100">
                    <div className="w-24 h-24 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-8"></div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Documents</h2>
                    <p className="text-slate-500 italic">
                        {mode === 'quiz' ? 'Crafting practice questions...' : 'Synthesizing comprehensive notes...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 max-w-6xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col lg:flex-row h-[85vh]">

                {/* Left Side: Info & Mode */}
                <div className="bg-slate-50 p-8 md:p-10 lg:w-1/3 border-r border-slate-100 flex flex-col overflow-y-auto">
                    <div>
                        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-8">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back
                        </button>
                        <h2 className="text-3xl font-black text-slate-800 mb-4">Smart Scanner</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Upload images, notes, or diagrams. The AI will transform them into study materials.
                        </p>
                    </div>

                    {/* Mode Selection */}
                    <div className="space-y-3 mb-8">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choose Output</p>

                        <button
                            onClick={() => setMode('quiz')}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${mode === 'quiz' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-200 bg-white'}`}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${mode === 'quiz' ? 'border-indigo-600' : 'border-slate-300'}`}>
                                {mode === 'quiz' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm ${mode === 'quiz' ? 'text-indigo-900' : 'text-slate-700'}`}>Practice Quiz</h4>
                                <p className="text-xs text-slate-500 mt-1">Generate mixed questions to test your knowledge.</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setMode('note_sheet')}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${mode === 'note_sheet' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200 bg-white'}`}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${mode === 'note_sheet' ? 'border-emerald-600' : 'border-slate-300'}`}>
                                {mode === 'note_sheet' && <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />}
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm ${mode === 'note_sheet' ? 'text-emerald-900' : 'text-slate-700'}`}>Active Note Sheet</h4>
                                <p className="text-xs text-slate-500 mt-1">Create a summary with interleaved questions.</p>
                            </div>
                        </button>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-200">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Supported Formats</p>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 bg-slate-200 text-slate-500 text-[10px] font-bold rounded">TXT</span>
                            <span className="px-2 py-1 bg-slate-200 text-slate-500 text-[10px] font-bold rounded">PDF</span>
                            <span className="px-2 py-1 bg-slate-200 text-slate-500 text-[10px] font-bold rounded">JPG/PNG</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Input */}
                <div className="bg-white p-8 md:p-10 lg:w-2/3 flex flex-col overflow-y-auto">
                    {/* Metadata Inputs */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Course Name</label>
                            <input
                                type="text"
                                value={courseInput}
                                onChange={(e) => setCourseInput(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="e.g. AP Biology"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Topic</label>
                            <input
                                type="text"
                                value={topicInput}
                                onChange={(e) => setTopicInput(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="e.g. Photosynthesis"
                            />
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-400 italic mb-4">* Tip: This feature works for any subject (History, Literature, etc.), not just Science!</p>

                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Study Materials (Text)</label>
                    <textarea
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none mb-4 font-medium leading-relaxed min-h-[150px]"
                        placeholder="Paste your notes here..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                    />

                    {/* File Upload Component */}
                    <div className="mb-6">
                        <FileUpload
                            onFilesSelected={(newFiles) => setFiles(prev => [...prev, ...newFiles])}
                            maxFiles={5}
                            accept=".txt,.pdf,image/*"
                            allowMultiple={true}
                            label="Click to Upload or Drag & Drop Notes"
                            subLabel="PDF, TXT, Images"
                        />

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 animate-in slide-in-from-top-2 duration-300">
                                        <span className="text-xs font-bold text-indigo-700 truncate max-w-[200px] flex items-center gap-2">
                                            <span className="opacity-50">📄</span> {file.name}
                                        </span>
                                        <button aria-label="Remove file" onClick={() => removeFile(idx)} className="text-indigo-400 hover:text-red-500 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SETTINGS PANEL (Only for Quiz Mode) */}
                    {mode === 'quiz' && (
                        <div className="mb-8">
                            <SettingsPanel
                                config={config}
                                onUpdate={(newConfig) => setConfig(prev => ({ ...prev, ...newConfig }))}
                                mode="quiz"
                                transparent={true}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl mb-4 text-center animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleStart}
                        disabled={isLoading || (!textInput && files.length === 0)}
                        className={`w-full py-4 text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-auto ${mode === 'quiz' ? 'bg-indigo-600 shadow-indigo-200 hover:shadow-indigo-300 hover:bg-indigo-500' : 'bg-emerald-600 shadow-emerald-200 hover:shadow-emerald-300 hover:bg-emerald-500'}`}
                    >
                        {mode === 'quiz' ? 'Generate Quiz' : 'Generate Note Sheet'}
                    </button>
                </div>
            </div>
        </div>
    );
};
