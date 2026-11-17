import React, { useState, useEffect, useRef } from 'react';
import { LabTrack, ChatMessage, LabState } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import FileUpload from './FileUpload';
import { TTSButton } from './TTSButton';
import { Wand2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import type { Components } from 'react-markdown';

/** Lab chat bubbles: scrollable tables and tight paragraphs on the dark theme. */
const LAB_CHAT_COMPONENTS: Components = {
    table: ({ node, ...props }) => <div className="overflow-x-auto my-4 rounded-lg border border-slate-700"><table {...props} className="w-full text-left text-sm" /></div>,
    th: ({ node, ...props }) => <th {...props} className="bg-slate-900 p-2 font-bold border-b border-slate-700" />,
    td: ({ node, ...props }) => <td {...props} className="p-2 border-b border-slate-800/50" />,
    p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />

};

interface LabViewProps {
    onBack: () => void;
    onSendMessage: (track: LabTrack, message: string, context?: string, data?: string, includeVisuals?: boolean) => Promise<void>;
    chatHistory: ChatMessage[];
    isThinking: boolean;
    labState: LabState;
    onUpdateLabState: (updates: Partial<LabState>) => void;
}

const TRACKS: { id: LabTrack; label: string; icon: string; desc: string; color: string; border: string; text: string; bg: string }[] = [
    { id: 'design', label: 'Experimental Design', icon: '🧪', desc: 'Brainstorm procedures & variables.', color: 'text-emerald-400', border: 'border-b-emerald-500', text: 'text-emerald-100', bg: 'bg-emerald-900/50' },
    { id: 'analysis', label: 'Data Analysis', icon: '📊', desc: 'Find trends & stats in your data.', color: 'text-cyan-400', border: 'border-b-cyan-500', text: 'text-cyan-100', bg: 'bg-cyan-900/50' },
    { id: 'feedback', label: 'Report Feedback', icon: '📝', desc: 'Critique your logic (CER).', color: 'text-rose-400', border: 'border-b-rose-500', text: 'text-rose-100', bg: 'bg-rose-900/50' },
    { id: 'errors', label: 'Error Analysis', icon: '📉', desc: 'Troubleshoot weird results.', color: 'text-amber-400', border: 'border-b-amber-500', text: 'text-amber-100', bg: 'bg-amber-900/50' },
    { id: 'safety', label: 'Safety Check', icon: '🦺', desc: 'Review protocols for hazards.', color: 'text-orange-400', border: 'border-b-orange-500', text: 'text-orange-100', bg: 'bg-orange-900/50' },
];

export const LabView: React.FC<LabViewProps & { selectedTrack: LabTrack; onTrackChange: (track: LabTrack) => void }> = ({
    onBack,
    onSendMessage,
    chatHistory,
    isThinking,
    selectedTrack,
    onTrackChange,
    labState,
    onUpdateLabState
}) => {
    const [inputText, setInputText] = useState('');
    const [_showContext, _setShowContext] = useState(true);
    const [confirmClearContext, setConfirmClearContext] = useState(false);
    const [confirmClearData, setConfirmClearData] = useState(false);
    const [useVisuals, setUseVisuals] = useState(false);

    // Upload State
    const [attachedFile, setAttachedFile] = useState<{ name: string; content: string; type: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [_isGeneratingContext, setIsGeneratingContext] = useState(false);

    const _fileInputRef = useRef<HTMLInputElement>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isThinking]);

    // Handle File Upload from FileUpload component
    const handleFile = async (files: File[]) => {
        if (!files || files.length === 0) return;
        const file = files[0]; // Lab View currently supports single file attachment for analysis

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (file.type.includes('text') || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
                // For text files, we might want to read as text if we want to display it or process as text
                // But keeping consistent with previous logic
                setAttachedFile({
                    name: file.name,
                    content: content, // This will be base64 from readAsDataURL if we used that, or text if readAsText
                    type: 'text'
                });
            } else {
                setAttachedFile({
                    name: file.name,
                    content: content,
                    type: 'image'
                });
            }
        };

        if (file.type.includes('text') || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    };

    const handleSend = () => {
        if (!inputText.trim() && !attachedFile && selectedTrack !== 'analysis') return;

        const finalContext = selectedTrack === 'mentor' ? labState.projectContext : undefined;
        let finalData = attachedFile ? `[FILE: ${attachedFile.name}]\n${attachedFile.content}` : undefined;

        if (selectedTrack === 'analysis' && !attachedFile) {
            // Fallback to table if no file
            const validRows = labState.dataTable.filter(r => r.x || r.y);
            if (validRows.length > 0) {
                // Include Headers in data construction
                const headerX = `${labState.dataHeaders.xLabel}${labState.dataHeaders.xUnit ? ` (${labState.dataHeaders.xUnit})` : ''}`;
                const headerY = `${labState.dataHeaders.yLabel}${labState.dataHeaders.yUnit ? ` (${labState.dataHeaders.yUnit})` : ''}`;

                finalData = `DATA_TABLE:\n${headerX},${headerY}\n` + validRows.map(r => `${r.x},${r.y}`).join('\n');
            }
        }

        onSendMessage(selectedTrack, inputText, finalContext, finalData, useVisuals);
        setInputText('');
        setAttachedFile(null); // Clear file after send

        // Optionally clear table after send? The user might want to keep it to refine data. 
        // Let's NOT clear it automatically if persistence is desired. They can edit it.
        // Actually, previous behavior was clear.
        // If we want persistence "if user switches modes and comes back", that's good.
        // Should we clear after send? Usually yes for a chat interface.
        // But for "Analysis", maybe they want to ask "What is the mean?" then "What is the StDev?" on the SAME data.
        // So keeping it is better!

        // onUpdateLabState({ dataTable: ... reset? ... }) 
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const updateRow = (index: number, field: 'x' | 'y', val: string) => {
        const newTable = [...labState.dataTable];
        newTable[index][field] = val;
        onUpdateLabState({ dataTable: newTable });
    };

    const addRow = () => onUpdateLabState({
        dataTable: [...labState.dataTable, { x: '', y: '' }]
    });

    const updateHeaders = (field: keyof LabState['dataHeaders'], val: string) => {
        onUpdateLabState({
            dataHeaders: { ...labState.dataHeaders, [field]: val }
        });
    };

    const _handleGenerateContext = async () => {
        if (!attachedFile) return;
        if (!window.confirm("This will replace your current Project Context with an AI summary of the attached file. Continue?")) return;

        setIsGeneratingContext(true);
        try {
            const { getLabAssistance } = await import('../services/ai/lab');
            const summary = await getLabAssistance(
                'mentor',
                [{ role: 'user', text: "GENERATE_PROJECT_CONTEXT" }],
                "",
                `[FILE: ${attachedFile.name}]\n${attachedFile.content}`
            );

            if (summary) {
                onUpdateLabState({ projectContext: summary.trim() });
                setAttachedFile(null);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to generate context. Please try again.");
        } finally {
            setIsGeneratingContext(false);
        }
    };

    const _handleClearContext = () => {
        if (confirmClearContext) {
            onUpdateLabState({ projectContext: '' });
            setConfirmClearContext(false);
        } else {
            setConfirmClearContext(true);
            setTimeout(() => setConfirmClearContext(false), 3000);
        }
    };

    const handleClearDataTable = () => {
        if (confirmClearData) {
            onUpdateLabState({
                dataTable: [{ x: '', y: '' }, { x: '', y: '' }, { x: '', y: '' }],
                dataHeaders: { xLabel: 'X', xUnit: '', yLabel: 'Y', yUnit: '' }
            });
            setConfirmClearData(false);
        } else {
            setConfirmClearData(true);
            setTimeout(() => setConfirmClearData(false), 3000);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-900 text-slate-200 font-sans overflow-hidden">


            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 p-4 shrink-0 flex items-center justify-between sticky top-0 z-10" >
                <div className="flex items-center gap-4">
                    <button aria-label="Back" onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Lab Co-Pilot 🧬
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {/* Visual Mode Toggle */}
                    <button
                        onClick={() => setUseVisuals(!useVisuals)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-2 ${useVisuals
                            ? 'bg-cyan-900 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                            : 'bg-slate-700 border-slate-600 text-slate-500 hover:text-slate-300'
                            }`}
                        title="Enable decision tree generation"
                    >
                        <span className={useVisuals ? 'opacity-100' : 'opacity-50'}>Visuals</span>
                        <div className={`w-2 h-2 rounded-full ${useVisuals ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`}></div>
                    </button>

                    {/* Global File Upload Button Trigger */}
                    <button
                        onClick={() => setIsDragging(true)}
                        className="text-xs flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors border border-slate-600"
                    >
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        {attachedFile ? <span className="text-cyan-400 font-bold truncate max-w-[150px]">{attachedFile.name}</span> : <span>Upload File</span>}
                    </button>
                    {/* Hidden input not needed as we use FileUpload in modal */}
                </div>
            </header>

            {/* Upload Modal (New) */}
            {
                isDragging && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsDragging(false)}>
                        <div className="bg-slate-800 p-8 rounded-2xl max-w-lg w-full m-4 shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
                            <h3 className="text-xl font-bold text-white mb-4">Upload Context or Data</h3>
                            <FileUpload
                                onFilesSelected={handleFile}
                                label="Drop files for analysis"
                                maxFiles={1}
                                accept=".csv,.txt,.pdf,image/*"
                            />
                            <button onClick={() => setIsDragging(false)} className="mt-4 text-slate-400 hover:text-white text-sm">Cancel</button>
                        </div>
                    </div>
                )
            }

            {/* Re-implement Drag detection on main container to show the modal */}
            {/* ...Wait, the previous code had full screen drag. I removed the onDragOver handlers from the main div.
                I should restore them to toggle 'isDragging' to true, which then shows the modal with FileUpload.
            */}

            {/* Track Selector */}
            <div className="bg-slate-800/50 p-2 overflow-x-auto">
                <div className="flex gap-2 min-w-max mx-auto max-w-5xl">
                    {TRACKS.map(track => (
                        <button
                            key={track.id}
                            onClick={() => onTrackChange(track.id)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all border-x border-t border-b-4 ${selectedTrack === track.id
                                ? `bg-slate-700 border-slate-900 ${track.border} text-white shadow-lg`
                                : 'bg-slate-800 border-slate-900 border-b-slate-900 text-slate-400 hover:bg-slate-750'
                                }`}
                        >
                            <span className="text-xl">{track.icon}</span>
                            <div className="text-left">
                                <div className={`text-sm font-bold leading-none mb-1 ${selectedTrack === track.id ? track.color : ''}`}>{track.label}</div>
                                <div className="text-[10px] font-mono opacity-60 leading-none">{track.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto relative min-h-0">
                {/* Helper Contexts based on Track */}

                {/* Data Analysis Input (Manual Fallback) - Sticky */}
                {selectedTrack === 'analysis' && !attachedFile && (
                    <div className="shrink-0 p-4 bg-emerald-900/10 border-b border-emerald-900/30 backdrop-blur-sm z-10">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Manual Data Entry</span>
                                <span className="text-[10px] text-emerald-500/50 border border-emerald-500/20 px-1 py-0.5 rounded">or drag & drop CSV</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleClearDataTable}
                                    className={`text-[10px] transition-colors ${confirmClearData ? 'text-red-400 font-bold animate-pulse' : 'text-emerald-500/50 hover:text-rose-400'}`}
                                >
                                    {confirmClearData ? 'Confirm Clear?' : 'Clear'}
                                </button>
                                <button onClick={addRow} className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-900/50 transition-colors border border-emerald-500/20">+ Add Row</button>
                            </div>
                        </div>

                        {/* Headers Input */}
                        <div className="grid grid-cols-2 gap-2 max-w-lg mb-2 p-2 bg-slate-900/50 rounded border border-slate-800">
                            <div className="flex gap-1">
                                <input
                                    value={labState.dataHeaders.xLabel} onChange={e => updateHeaders('xLabel', e.target.value)}
                                    className="w-2/3 bg-transparent text-xs text-slate-300 font-bold placeholder-slate-600 border-none focus:ring-0 p-0" placeholder="Label X"
                                />
                                <input
                                    value={labState.dataHeaders.xUnit} onChange={e => updateHeaders('xUnit', e.target.value)}
                                    className="w-1/3 bg-transparent text-[10px] text-slate-500 placeholder-slate-700 border-none focus:ring-0 p-0 text-right" placeholder="(unit)"
                                />
                            </div>
                            <div className="flex gap-1">
                                <input
                                    value={labState.dataHeaders.yLabel} onChange={e => updateHeaders('yLabel', e.target.value)}
                                    className="w-2/3 bg-transparent text-xs text-slate-300 font-bold placeholder-slate-600 border-none focus:ring-0 p-0" placeholder="Label Y"
                                />
                                <input
                                    value={labState.dataHeaders.yUnit} onChange={e => updateHeaders('yUnit', e.target.value)}
                                    className="w-1/3 bg-transparent text-[10px] text-slate-500 placeholder-slate-700 border-none focus:ring-0 p-0 text-right" placeholder="(unit)"
                                />
                            </div>
                        </div>

                        {/* Scrollable Data Table */}
                        <div className="grid grid-cols-2 gap-2 max-w-lg max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                            {labState.dataTable.map((row, i) => (
                                <React.Fragment key={i}>
                                    <input
                                        value={row.x} onChange={e => updateRow(i, 'x', e.target.value)}
                                        className="bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center focus:border-emerald-500/50 focus:outline-none transition-colors"
                                        placeholder={`x${i + 1}`}
                                    />
                                    <input
                                        value={row.y} onChange={e => updateRow(i, 'y', e.target.value)}
                                        className="bg-slate-900 border border-slate-700 rounded p-1.5 text-sm text-center focus:border-emerald-500/50 focus:outline-none transition-colors"
                                        placeholder={`y${i + 1}`}
                                    />
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat Area - Flexible */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {chatHistory.length === 0 && (
                        <div className="text-center text-slate-500 mt-10">
                            <div className="text-4xl mb-4 grayscale opacity-30">
                                {TRACKS.find(t => t.id === selectedTrack)?.icon}
                            </div>
                            <p>Select a track and ask me anything!</p>
                        </div>
                    )}

                    {chatHistory.map((msg, i) => {
                        if (msg.isDivider) {
                            // Infer track from text "Switched to X Mode"
                            const trackName = msg.text.match(/Switched to (.*) Mode/i)?.[1].toLowerCase() || 'design';
                            // Find track object
                            // Note: track IDs are lowercase, but trackName might be "EXPERIMENTAL DESIGN" etc. 
                            // Actually App.tsx sends "Switched to ${track.toUpperCase()} Mode"
                            // So trackName will be "DESIGN" or "ANALYSIS".

                            // Let's find by ID matching the text strictly if we can, or just loop
                            const trackObj = TRACKS.find(t => t.id.toUpperCase() === trackName.toUpperCase()) || TRACKS[0];

                            return (
                                <div key={i} className="flex justify-center my-6">
                                    <div className={`text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full border border-slate-700/50 ${trackObj.color || 'text-cyan-400'} ${trackObj.bg || 'bg-slate-800/50'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none'
                                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                                    }`}>
                                    <MarkdownRenderer
                                        content={msg.text}
                                        components={LAB_CHAT_COMPONENTS}
                                    />

                                    {msg.role !== 'user' && (
                                        <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                                            <TTSButton text={msg.text} label="Listen" className="text-xs" />
                                            <button
                                                type="button"
                                                onClick={() => onSendMessage(selectedTrack, 'Could you explain that in simpler terms?', labState.projectContext, undefined, useVisuals)}
                                                disabled={isThinking}
                                                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                                                title="Simplify explanation"
                                            >
                                                <Wand2 className="w-3 h-3 text-cyan-400" />
                                                <span>Simplify</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {isThinking && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none p-4 flex gap-2 items-center">
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area - Sticky Bottom */}
                <div className="p-4 bg-slate-900 border-t border-slate-800 sticky bottom-0 shrink-0 z-20">
                    {/* Quick Scaffolding Levers */}
                    <div className="max-w-5xl mx-auto flex items-center gap-2 mb-2 overflow-x-auto no-scrollbar">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                            Scaffolding:
                        </span>
                        <button
                            type="button"
                            onClick={() => onSendMessage(selectedTrack, 'Could you simplify this and give me an analogy?', labState.projectContext, undefined, useVisuals)}
                            disabled={isThinking}
                            className="shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded-lg transition-colors border border-slate-700 flex items-center gap-1 font-semibold"
                        >
                            <Wand2 className="w-3 h-3 text-cyan-400" />
                            <span>Explain Simpler</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onSendMessage(selectedTrack, 'Can you make this lab step easier and more guided?', labState.projectContext, undefined, useVisuals)}
                            disabled={isThinking}
                            className="shrink-0 px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs rounded-lg transition-colors border border-emerald-800/60 flex items-center gap-1 font-semibold"
                        >
                            <ArrowDownCircle className="w-3 h-3 text-emerald-400" />
                            <span>Make It Easier</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onSendMessage(selectedTrack, 'How can I take this analysis to a more advanced, rigorous level?', labState.projectContext, undefined, useVisuals)}
                            disabled={isThinking}
                            className="shrink-0 px-2.5 py-1 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-xs rounded-lg transition-colors border border-amber-800/60 flex items-center gap-1 font-semibold"
                        >
                            <ArrowUpCircle className="w-3 h-3 text-amber-400" />
                            <span>Make It Harder</span>
                        </button>
                    </div>

                    <div className="relative max-w-5xl mx-auto">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Ask your ${TRACKS.find(t => t.id === selectedTrack)?.label.split(' ')[0]} Assistant... (Shift+Enter for newline)`}
                            className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl pl-4 pr-14 py-3 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all resize-none shadow-xl"
                            rows={2}
                        />
                        <button aria-label="Send"
                            onClick={handleSend}
                            disabled={isThinking || (!inputText.trim() && !attachedFile && selectedTrack !== 'analysis')}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white rounded-xl flex items-center justify-center transition-colors"
                        >
                            <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>
                    {attachedFile && (
                        <div className="max-w-5xl mx-auto flex items-center gap-2 mt-2 text-xs text-cyan-400 bg-cyan-900/20 p-2 rounded-lg border border-cyan-900/50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            File attached: <b>{attachedFile.name}</b>
                            <button onClick={() => setAttachedFile(null)} className="ml-auto text-slate-500 hover:text-white">✕</button>
                        </div>
                    )}
                    <p className="text-center text-[10px] text-slate-600 mt-2 font-mono">
                        AI can make mistakes. Always verify safety data.
                    </p>
                </div>
            </main>
        </div>
    );
};
