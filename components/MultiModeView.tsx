import React, { useReducer, useEffect } from 'react';
import { CourseType, MultiModeState, ChatMessage, AppConfig } from '../types';
import { getTopicOverview } from '../services/ai/overview';
import { getExplanationChatResponse, getCalculationChatResponse } from '../services/ai/tutor';
import FileUpload from './FileUpload';
import MarkdownRenderer from './MarkdownRenderer';
import { multiModeReducer, createInitialMultiModeState } from './multimode/multiModeReducer';

interface MultiModeViewProps {
    course: CourseType;
    topic: string;
    multiModeState: MultiModeState | null;
    onUpdateState: (_newState: MultiModeState | null) => void;
    onLaunchActivity: (_mode: string, _contextOverride?: string) => void;
    onBack: () => void;
    config: AppConfig;
    onUpdateConfig: (_newConfig: Partial<AppConfig>) => void;
    onShareLink?: () => void;
}

export const MultiModeView: React.FC<MultiModeViewProps> = ({
    course,
    topic,
    multiModeState,
    onUpdateState,
    onLaunchActivity,
    onBack,
    config,
    onUpdateConfig,
    onShareLink
}) => {
    const [state, dispatch] = useReducer(
        multiModeReducer,
        undefined,
        () => createInitialMultiModeState(multiModeState, config)
    );

    const {
        loading,
        uploadedContext,
        linkCopied,
        showExplanationPanel,
        showCalculationPanel,
        explanationChat,
        calculationChat,
        explanationInput,
        calculationInput,
        explanationLoading,
        calculationLoading,
    } = state;

    useEffect(() => {
        // Initial Load if no overview exists
        if (!multiModeState || !multiModeState.overview) {
            loadOverview();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load the overview once on entry; later state changes must not trigger another AI call.
    }, []);

    // Helper to persist partner state
    const persistPartnerState = (expChat: ChatMessage[], calcChat: ChatMessage[]) => {
        if (multiModeState) {
            onUpdateState({
                ...multiModeState,
                partnerState: {
                    explanationChat: expChat,
                    calculationChat: calcChat
                }
            });
        }
    };

    const loadOverview = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        const overview = await getTopicOverview(course, topic, uploadedContext);

        const newState: MultiModeState = {
            isActive: true,
            course,
            topic,
            overview,
            activityLog: multiModeState?.activityLog || [],
            partnerState: multiModeState?.partnerState || { explanationChat: [], calculationChat: [] }
        };

        onUpdateState(newState);
        dispatch({ type: 'SET_LOADING', payload: false });
    };

    const handleFileUpload = (files: File[]) => {
        if (files.length === 0) return;

        // Simple text extraction simulation (since we can't do full PDF parsing easily in browser without heavier libs)
        // For now, we assume text files or rely on the backend/service if we had one.
        // Ideally, we'd use a service or the Gemini File API.
        // For this mock, we'll just say "File Attached". In a real app we'd parse.
        // Let's prompt user or just store file metadata.

        // Actually, let's use the FileReader to read text files if possible.
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            dispatch({ type: 'SET_UPLOADED_CONTEXT', payload: text });
            // Trigger re-generation of overview with new context?
            // Maybe not auto-regenerate, but update state so next activity uses it.

            if (multiModeState && multiModeState.overview) {
                onUpdateState({
                    ...multiModeState,
                    overview: {
                        ...multiModeState.overview,
                        uploadedContext: text // Update context
                    }
                });
            }
        };
        reader.readAsText(file);
    };

    const handleRegenerateWithContext = () => {
        loadOverview();
    };

    const handleEndSession = async () => {
        // Logic to trigger report generation view
        // We likely need to signal parent to switch view to 'multimode_report'
        // But we can also just do it here if we passed a prop, but 'onLaunchActivity' might work if we treat report as an activity?
        // Better: Add a specific prop for ending session.
        // For now, let's use onLaunchActivity('report') and handle it in App.tsx
        onLaunchActivity('report');
    };

    const handleClearSession = () => {
        if (confirm("Are you sure? This will clear your current session progress.")) {
            onUpdateState(null); // Clear state
            onBack(); // Go back to topic selection
        }
    };

    // Toggle panel visibility and persist to config
    const toggleExplanationPanel = () => {
        const newValue = !showExplanationPanel;
        dispatch({ type: 'SET_SHOW_EXPLANATION_PANEL', payload: newValue });
        onUpdateConfig({ showExplanationPanel: newValue });
    };

    const toggleCalculationPanel = () => {
        const newValue = !showCalculationPanel;
        dispatch({ type: 'SET_SHOW_CALCULATION_PANEL', payload: newValue });
        onUpdateConfig({ showCalculationPanel: newValue });
    };

    // Explanation Partner chat handler
    const handleExplanationSend = async () => {
        if (!explanationInput.trim() || explanationLoading) return;
        const userMessage: ChatMessage = { role: 'user', text: explanationInput };
        const newHistory = [...explanationChat, userMessage];
        dispatch({ type: 'SEND_EXPLANATION_START', userMessage });

        // Persist immediately
        persistPartnerState(newHistory, calculationChat);

        try {
            const response = await getExplanationChatResponse(course, topic, newHistory, config.persona || 'Socratic');
            const modelMsg: ChatMessage = { role: 'model', text: response };
            const finalHistory = [...newHistory, modelMsg];
            dispatch({ type: 'SEND_EXPLANATION_SUCCESS', modelMessage: modelMsg });
            persistPartnerState(finalHistory, calculationChat);
        } catch {
            const errorMsg: ChatMessage = { role: 'model', text: 'Sorry, I had trouble responding. Try again!' };
            dispatch({ type: 'SEND_EXPLANATION_ERROR', errorMessage: errorMsg });
        }
    };

    // Calculation Partner chat handler
    const handleCalculationSend = async () => {
        if (!calculationInput.trim() || calculationLoading) return;
        const userMessage: ChatMessage = { role: 'user', text: calculationInput };
        const newHistory = [...calculationChat, userMessage];
        dispatch({ type: 'SEND_CALCULATION_START', userMessage });

        // Persist
        persistPartnerState(explanationChat, newHistory);

        try {
            const response = await getCalculationChatResponse(course, topic, newHistory);
            const modelMsg: ChatMessage = { role: 'model', text: response };
            const finalHistory = [...newHistory, modelMsg];
            dispatch({ type: 'SEND_CALCULATION_SUCCESS', modelMessage: modelMsg });
            persistPartnerState(explanationChat, finalHistory);
        } catch {
            const errorMsg: ChatMessage = { role: 'model', text: 'Sorry, I had trouble with that calculation. Try again!' };
            dispatch({ type: 'SEND_CALCULATION_ERROR', errorMessage: errorMsg });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
                <p className="text-xl font-medium text-slate-600">Generating Topic Dashboard...</p>
                <p className="text-sm text-slate-400">Analyzing topic: {topic}</p>
            </div>
        );
    }

    if (!multiModeState?.overview) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <p>Failed to load topic data. <button onClick={loadOverview} className="text-indigo-600 underline">Try Again</button></p>
            </div>
        );
    }

    const { overview } = multiModeState;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">BETA</span>
                        <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">{course}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">{topic}</h1>
                </div>
                <div className="flex gap-3">
                    {onShareLink && (
                        <button
                            onClick={() => {
                                onShareLink();
                                dispatch({ type: 'SET_LINK_COPIED', payload: true });
                                setTimeout(() => dispatch({ type: 'SET_LINK_COPIED', payload: false }), 2000);
                            }}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
                            title="Share Link to this Dashboard"
                        >
                            {linkCopied ? (
                                <span className="font-bold text-emerald-600 animate-pulse">Copied!</span>
                            ) : (
                                <>
                                    <span>🔗</span> Share Link
                                </>
                            )}
                        </button>
                    )}
                    <button
                        onClick={handleClearSession}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        New Topic
                    </button>
                    <button
                        onClick={handleEndSession}
                        className="px-5 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg shadow hover:bg-slate-800 transition-all hover:scale-105"
                    >
                        End Session
                    </button>
                </div>
            </div>

            {/* PARTNER CHAT PANELS (collapsible) - MOVED TO TOP */}
            {(showExplanationPanel || showCalculationPanel) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Explanation Partner Panel */}
                    {showExplanationPanel && (
                        <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden flex flex-col h-[400px]">
                            <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
                                <h3 className="text-white font-bold flex items-center gap-2">🤔 Explanation Partner</h3>
                                <button aria-label="Close Explanation Partner" onClick={toggleExplanationPanel} className="text-indigo-200 hover:text-white">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                                {explanationChat.length === 0 && (
                                    <p className="text-center text-slate-400 text-sm py-8">Ask about <span className="font-bold text-indigo-500">{topic}</span> to get started!</p>
                                )}
                                {explanationChat.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                                            {msg.role === 'user' ? msg.text : <MarkdownRenderer content={msg.text} />}
                                        </div>
                                    </div>
                                ))}
                                {explanationLoading && <div className="text-center text-indigo-400 text-sm animate-pulse">Thinking...</div>}
                            </div>
                            <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
                                <input aria-label="Ask the Explanation Partner"
                                    type="text"
                                    value={explanationInput}
                                    onChange={(e) => dispatch({ type: 'SET_EXPLANATION_INPUT', payload: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleExplanationSend()}
                                    placeholder="Ask about this topic..."
                                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button onClick={handleExplanationSend} disabled={explanationLoading} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-bold hover:bg-indigo-600 disabled:opacity-50">Send</button>
                            </div>
                        </div>
                    )}

                    {/* Calculation Partner Panel */}
                    {showCalculationPanel && (
                        <div className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden flex flex-col h-[400px]">
                            <div className="bg-teal-600 px-4 py-3 flex items-center justify-between">
                                <h3 className="text-white font-bold flex items-center gap-2">🧮 Calculation Partner</h3>
                                <button aria-label="Close Calculation Partner" onClick={toggleCalculationPanel} className="text-teal-200 hover:text-white">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                                {calculationChat.length === 0 && (
                                    <p className="text-center text-slate-400 text-sm py-8">Need help with calculations? Ask away!</p>
                                )}
                                {calculationChat.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-teal-500 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                                            {msg.role === 'user' ? msg.text : <MarkdownRenderer content={msg.text} />}
                                        </div>
                                    </div>
                                ))}
                                {calculationLoading && <div className="text-center text-teal-400 text-sm animate-pulse">Calculating...</div>}
                            </div>
                            <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
                                <input aria-label="Ask the Calculation Partner"
                                    type="text"
                                    value={calculationInput}
                                    onChange={(e) => dispatch({ type: 'SET_CALCULATION_INPUT', payload: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCalculationSend()}
                                    placeholder="Ask for calculation help..."
                                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                                <button onClick={handleCalculationSend} disabled={calculationLoading} className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-bold hover:bg-teal-600 disabled:opacity-50">Send</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* DASHBOARD GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: OVERVIEW & CONTEXT */}
                <div className="lg:col-span-2 space-y-8">

                    {/* SUMMARY CARD */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span>📚</span> Topic Overview
                        </h2>
                        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                            {overview.summary}
                        </div>
                    </div>

                    {/* KEY POINTS */}
                    <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
                        <h3 className="text-lg font-bold text-indigo-900 mb-4">Key Concepts</h3>
                        <ul className="space-y-3">
                            {overview.keyPoints.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-indigo-800">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* UPLOAD CONTEXT */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span>📂</span> Your Notes
                            </h2>
                            {uploadedContext && (
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                    Context Active
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-slate-500 mb-4">
                            Upload class notes or a study guide (txt/md). We'll use them to tailor your practice questions.
                        </p>

                        <FileUpload
                            onFilesSelected={handleFileUpload}
                            accept=".txt,.md,.csv"
                            label="Drop notes here to customize your session"
                        />

                        {uploadedContext && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-400 uppercase font-bold mb-2">Preview:</p>
                                <div className="bg-slate-50 p-3 rounded text-xs text-slate-600 font-mono h-24 overflow-y-auto">
                                    {uploadedContext.substring(0, 500)}...
                                </div>
                                <button
                                    onClick={handleRegenerateWithContext}
                                    className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                >
                                    ↻ Refresh Overview with these Notes
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                {/* RIGHT COLUMN: ACTION CENTER */}
                <div className="space-y-6">

                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span>⚡️</span> Action Center
                            </h2>
                            <p className="text-slate-400 text-sm">Choose a mode to practice this topic</p>
                        </div>

                        <div className="p-4 grid grid-cols-1 gap-3">
                            <ActionCard
                                title="Practice Quiz"
                                icon="📝"
                                desc="Test your knowledge"
                                onClick={() => onLaunchActivity('quiz')}
                                recommended={overview.suggestedActivities?.includes('Quiz')}
                            />
                            <ActionCard
                                title="Flashcards"
                                icon="🗂️"
                                desc="Memorize key terms"
                                onClick={() => onLaunchActivity('flashcards')}
                                recommended={overview.suggestedActivities?.includes('Flashcards')}
                            />
                            <ActionCard
                                title="FRQ Practice"
                                icon="✍️"
                                desc="Write detailed responses"
                                onClick={() => onLaunchActivity('frq')}
                                recommended={overview.suggestedActivities?.includes('FRQ')}
                            />
                            <ActionCard
                                title="Visual Analysis"
                                icon="🖼️"
                                desc="Analyze diagrams"
                                onClick={() => onLaunchActivity('cer')}
                                recommended={overview.suggestedActivities?.includes('CER')}
                            />
                        </div>
                    </div>

                    {/* RESOURCES */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Suggested Resources</h3>
                        <div className="space-y-3">
                            {overview.resources.length > 0 ? overview.resources.map((res, idx) => (
                                <a
                                    key={idx}
                                    href={`https://www.google.com/search?q=${encodeURIComponent(res.query)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-slate-700 group-hover:text-indigo-800 text-sm">{res.title}</span>
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">{res.type}</span>
                                    </div>
                                </a>
                            )) : (
                                <p className="text-sm text-slate-400 italic">No specific resources found.</p>
                            )}
                        </div>
                    </div>

                    {/* PARTNER PANEL TOGGLES */}
                    <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Study Partners</h4>
                        <div className="space-y-2">
                            <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                                <span className="text-sm font-medium text-slate-700">🤔 Explanation Partner</span>
                                <button role="switch" aria-checked={showExplanationPanel}
                                    onClick={toggleExplanationPanel}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${showExplanationPanel ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showExplanationPanel ? 'translate-x-5' : ''}`} />
                                </button>
                            </label>
                            <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                                <span className="text-sm font-medium text-slate-700">🧮 Calculation Partner</span>
                                <button role="switch" aria-checked={showCalculationPanel}
                                    onClick={toggleCalculationPanel}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${showCalculationPanel ? 'bg-teal-500' : 'bg-slate-300'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showCalculationPanel ? 'translate-x-5' : ''}`} />
                                </button>
                            </label>
                        </div>
                    </div>

                </div>
            </div>


        </div>
    );
};

const ActionCard: React.FC<{ title: string; icon: string; desc: string; onClick: () => void; recommended?: boolean }> = ({ title, icon, desc, onClick, recommended }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 group
        ${recommended
                ? 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 hover:border-indigo-300 shadow-sm'
                : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}
        `}
    >
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-800">{title}</h4>
                {recommended && <span className="text-[10px] font-bold bg-indigo-200 text-indigo-700 px-1.5 rounded uppercase tracking-wider">Rec</span>}
            </div>
            <p className="text-xs text-slate-500 group-hover:text-slate-600">{desc}</p>
        </div>
        <div className="text-slate-300 group-hover:text-slate-500">→</div>
    </button>
);
