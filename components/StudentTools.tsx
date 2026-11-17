import React from 'react';
import { TTSButton } from './TTSButton';

interface StudentToolsProps {
    text: string;
    isSimplified?: boolean;
    isSimplifying?: boolean;
    onSimplify?: () => void;
    onHarder?: () => void;
    onEasier?: () => void;
    onRegenerate?: () => void;
    className?: string;
    includeShare?: boolean; // Optional: If we want to move Share here too eventually
}

export const StudentTools: React.FC<StudentToolsProps> = ({
    text,
    isSimplified,
    isSimplifying,
    onSimplify,
    onHarder,
    onEasier,
    onRegenerate,
    className = ''
}) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Difficulty Toggles */}
            {onEasier && (
                <button
                    onClick={onEasier}
                    title="Make it easier"
                    className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border border-transparent hover:border-emerald-200"
                >
                    <span className="text-xs font-bold uppercase tracking-wide hidden md:inline">Easier</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </button>
            )}
            {onHarder && (
                <button
                    onClick={onHarder}
                    title="Make it harder"
                    className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-200"
                >
                    <span className="text-xs font-bold uppercase tracking-wide hidden md:inline">Harder</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
            )}

            {(onHarder || onEasier) && <div className="h-4 w-px bg-slate-300 mx-1"></div>}

            {onRegenerate && (
                <button
                    onClick={onRegenerate}
                    title="Regenerate / Refresh Activity"
                    className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    <span className="text-xs font-bold uppercase tracking-wide hidden md:inline">Refresh</span>
                </button>
            )}

            {(onHarder || onEasier || onRegenerate) && <div className="h-4 w-px bg-slate-300 mx-1"></div>}

            {/* Accessibility Tools */}
            <TTSButton text={text} />

            {onSimplify && (
                <button
                    onClick={onSimplify}
                    disabled={isSimplifying}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${isSimplified ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-400'}`}
                    title={isSimplified ? "Show Original" : "Simplify Text"}
                >
                    {isSimplifying ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    )}
                    {isSimplified && <span className="text-xs font-bold uppercase hidden md:inline">Simplified</span>}
                </button>
            )}
        </div>
    );
};
