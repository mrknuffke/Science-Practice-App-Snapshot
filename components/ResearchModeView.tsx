import React, { useState, useEffect, useRef } from 'react';
import { CourseType, ChatMessage, ResearchState, AppConfig } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import FileUpload from './FileUpload';
import { useDialog } from '../hooks/useDialog';

interface ResearchModeViewProps {
    onBack: () => void;
    course: CourseType;
    config: AppConfig;
    onUpdateConfig: (updates: Partial<AppConfig>) => void;
}

const STORAGE_KEY = 'sp_research_project_data';

const DEFAULT_RESEARCH_STATE: ResearchState = {
    question: '',
    hypothesis: '',
    methodology: '',
    dataStatus: '',
    literatureNotes: '',
    chatHistory: [],
    lastUpdated: Date.now()
};

export const ResearchModeView: React.FC<ResearchModeViewProps> = ({
    onBack,
    course,
    config,
    onUpdateConfig
}) => {
    // Persistent State
    const [state, setState] = useState<ResearchState>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_RESEARCH_STATE;
    });

    const [isThinking, setIsThinking] = useState(false);
    const [inputText, setInputText] = useState('');
    const [_activeField, _setActiveField] = useState<keyof ResearchState | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const uploadDialog = useDialog({ onClose: () => setShowUploadModal(false), labelledBy: 'research-upload-title', open: showUploadModal });
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');


    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-save effect
    // Auto-save effect
    useEffect(() => {
        const saveTimeout = setTimeout(() => {
            setSaveStatus('saving');
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            setTimeout(() => setSaveStatus('saved'), 500);
            setTimeout(() => setSaveStatus('idle'), 3000);
        }, 1000); // Debounce save
        return () => clearTimeout(saveTimeout);
    }, [state]);

    // Scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.chatHistory, isThinking]);

    const handleUpdateField = (field: keyof ResearchState, value: string) => {
        setState(prev => ({ ...prev, [field]: value, lastUpdated: Date.now() }));
    };

    const handleClearProject = () => {
        if (confirm("Are you sure you want to clear your entire research project? This cannot be undone.")) {
            setState(DEFAULT_RESEARCH_STATE);
        }
    };

    const handleFileProcessed = async (files: File[]) => {
        if (files.length === 0) return;

        setIsThinking(true);
        setShowUploadModal(false);

        try {
            const { parseResearchMaterials } = await import('../services/ai/research');
            // Convert file to base64 or text
            const file = files[0];
            const reader = new FileReader();

            reader.onload = async (e) => {
                const content = e.target?.result as string;
                const result = await parseResearchMaterials(file.name, content);

                setState(prev => ({
                    ...prev,
                    question: prev.question || result.question || '',
                    hypothesis: prev.hypothesis || result.hypothesis || '',
                    methodology: prev.methodology || result.methodology || '',
                    chatHistory: [...prev.chatHistory, {
                        role: 'model',
                        text: `I've analyzed **${file.name}**. I've extracted relevant details into your project fields. Let me know if you want to refine them!`
                    }]
                }));
                setIsThinking(false);
            };

            if (file.type.includes('text') || file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to analyze file.");
            setIsThinking(false);
        }
    };

    const handleSendMessage = async (overrideText?: string) => {
        const text = overrideText || inputText;
        if (!text.trim()) return;

        const newHistory: ChatMessage[] = [...state.chatHistory, { role: 'user', text }];
        setState(prev => ({ ...prev, chatHistory: newHistory }));
        setInputText('');
        setIsThinking(true);

        try {
            const { getResearchMentorResponse } = await import('../services/ai/research');

            // Construct context from fields
            const contextSnapshot = `
                Project Title/Question: ${state.question}
                Hypothesis: ${state.hypothesis}
                Methodology: ${state.methodology}
                Data Status: ${state.dataStatus}
                Lit Notes: ${state.literatureNotes}
            `;

            const response = await getResearchMentorResponse(
                course,
                contextSnapshot,
                newHistory,
                config.persona || 'Socratic'
            );

            setState(prev => ({
                ...prev,
                chatHistory: [...newHistory, { role: 'model', text: response }]
            }));
        } catch (err) {
            console.error(err);
            setState(prev => ({
                ...prev,
                chatHistory: [...newHistory, { role: 'model', text: "I'm having trouble connecting to the research database. Please try again." }]
            }));
        } finally {
            setIsThinking(false);
        }
    };

    const QuickActions = [
        { label: "Review Literature", prompt: "Help me find gaps in my literature review and suggest 3 search queries." },
        { label: "Check Methodology", prompt: " critique my methodology for potential flaws or confounding variables." },
        { label: "Format Lab Report", prompt: "How should I structure my final paper based on the current standards?" },
        { label: "Idea Board", prompt: "I'm stuck. Let's brainstorm what my data might mean." }
    ];

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                        ← <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Back to Menu</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            🔬 Research Project
                        </h1>
                        <p className="text-[10px] text-slate-500">Persistent Workspace • Auto-saved locally</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mr-2">
                        {saveStatus === 'saving' && <span className="text-indigo-400 animate-pulse">Saving...</span>}
                        {saveStatus === 'saved' && <span className="text-emerald-400">Saved ✓</span>}
                    </div>

                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
                    >
                        📂 <span className="hidden md:inline">Upload Materials</span>
                    </button>
                    <button
                        onClick={handleClearProject}
                        className="text-xs text-rose-400/50 hover:text-rose-400 px-3 py-2 transition-colors"
                        title="Clear all project data"
                    >
                        Reset
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel: Project Context (Editable) */}
                <div className="w-1/2 max-w-xl border-r border-slate-800 flex flex-col bg-slate-900/30">
                    <div className="p-4 bg-slate-900/50 border-b border-slate-800 font-bold text-xs text-slate-400 uppercase tracking-widest flex justify-between">
                        <span>Project Context</span>
                        <span className="text-slate-600 font-normal normal-case">Edit these fields to guide the AI</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-indigo-300">Research Question / Title</label>
                            <textarea
                                value={state.question}
                                onChange={(e) => handleUpdateField('question', e.target.value)}
                                placeholder="e.g. What is the effect of soil pH on bean plant growth?"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-y min-h-[80px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-indigo-300">Hypothesis</label>
                            <textarea
                                value={state.hypothesis}
                                onChange={(e) => handleUpdateField('hypothesis', e.target.value)}
                                placeholder="If... then... because..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-y min-h-[80px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-indigo-300">Methodology & Materials</label>
                            <textarea
                                value={state.methodology}
                                onChange={(e) => handleUpdateField('methodology', e.target.value)}
                                placeholder="Briefly describe your procedure and variables..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-y min-h-[120px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-indigo-300">Data & Observations</label>
                            <textarea
                                value={state.dataStatus}
                                onChange={(e) => handleUpdateField('dataStatus', e.target.value)}
                                placeholder="Summary of data collected so far..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-y min-h-[100px]"
                            />
                        </div>

                    </div>
                </div>

                {/* Right Panel: Mentor Chat */}
                <div className="flex-1 flex flex-col bg-slate-950 relative">
                    {/* Persona Selector */}
                    <div className="absolute top-4 right-4 z-10">
                        <div className="relative group">
                            <select
                                value={config.persona || 'Socratic'}
                                onChange={(e) => onUpdateConfig({ persona: e.target.value as NonNullable<AppConfig['persona']> })}
                                className="bg-slate-800 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none shadow-lg cursor-pointer hover:border-indigo-500 transition-colors"
                                title="Choose your mentor's feedback style"
                            >
                                <option value="Tutor">📚 Tutor</option>
                                <option value="Socratic">🤔 Socratic</option>
                                <option value="Skeptic">🔬 Skeptic</option>
                                <option value="Growth Coach">🌟 Growth Coach</option>
                            </select>
                            {/* Tooltip */}
                            <div className="absolute top-full right-0 mt-2 w-72 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
                                <div className="space-y-2">
                                    <div><span className="font-bold text-amber-300">📚 Tutor:</span> <span className="text-slate-400">Explains clearly, gives direct answers and step-by-step guidance</span></div>
                                    <div><span className="font-bold text-indigo-300">🤔 Socratic:</span> <span className="text-slate-400">Asks probing questions to help you discover the answer yourself</span></div>
                                    <div><span className="font-bold text-rose-300">🔬 Skeptic:</span> <span className="text-slate-400">Challenges your reasoning like a tough peer reviewer</span></div>
                                    <div><span className="font-bold text-emerald-300">🌟 Growth Coach:</span> <span className="text-slate-400">Builds confidence, celebrates progress and effort</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {state.chatHistory.length === 0 && (
                            <div className="text-center mt-20 opacity-50">
                                <div className="text-6xl mb-4">🧭</div>
                                <h2 className="text-xl font-bold text-white mb-2">Research Mentor</h2>
                                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                                    I am here to guide your long-term project. Fill out the context on the left, upload your lab handouts, or just start chatting.
                                </p>
                            </div>
                        )}

                        {state.chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                                    }`}>
                                    <MarkdownRenderer content={msg.text} />
                                </div>
                            </div>
                        ))}

                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none p-4 flex gap-2 items-center">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
                        {QuickActions.map((action) => (
                            <button
                                key={action.label}
                                onClick={() => handleSendMessage(action.prompt)}
                                disabled={isThinking}
                                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-indigo-300 hover:bg-slate-700 hover:border-indigo-500 transition-all flex-shrink-0"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-slate-900 border-t border-slate-800">
                        <div className="relative">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                placeholder="Ask your mentor..."
                                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl pl-4 pr-14 py-3 text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all resize-none shadow-xl"
                                rows={1}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!inputText.trim() || isThinking}
                                className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors"
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Upload ModalOverlay */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}>
                    <div {...uploadDialog} className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 id="research-upload-title" className="text-xl font-bold text-white mb-2">Upload Project Materials</h3>
                        <p className="text-slate-400 text-sm mb-6">Upload a lab guide (PDF), data sheet (CSV), or notes (Text). I will extract the key details into your Project Context.</p>

                        <FileUpload
                            onFilesSelected={handleFileProcessed}
                            maxFiles={1}
                            accept=".pdf,.csv,.txt,image/*"
                            label="Drag files here"
                        />

                        <button onClick={() => setShowUploadModal(false)} className="mt-6 w-full py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
