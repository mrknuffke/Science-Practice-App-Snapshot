import React, { useRef } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { useReactToPrint } from 'react-to-print';
import type { Components } from 'react-markdown';

/** Note sheet styling: check-understanding callouts, heading hierarchy and print-friendly lists. */
const NOTE_SHEET_COMPONENTS: Components = {
    // Custom rendering for "Check Understanding" boxes
    blockquote: ({ node, className, children, ..._props }) => {
        // unused: node, cite (if any)
        return (
            <blockquote className="bg-indigo-50 border-l-4 border-indigo-500 p-6 my-8 rounded-r-xl break-inside-avoid shadow-sm print:border-l-2 print:bg-white print:border-slate-300">
                <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    🧠 Check Your Understanding
                </h4>
                <div className="text-indigo-900 italic font-medium print:text-slate-800">
                    {children}
                </div>
            </blockquote>
        );
    },
    // Better heading hierarchy visuals
    h1: ({ node, ...props }) => <h1 className="text-3xl font-black text-slate-900 mt-8 mb-4 border-b-2 border-slate-100 pb-2 break-after-avoid" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-3 break-after-avoid flex items-center gap-2 before:content-[''] before:w-2 before:h-8 before:bg-indigo-500 before:rounded-full before:mr-2" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-slate-700 mt-6 mb-2 underline decoration-indigo-200 decoration-4 underline-offset-4 break-after-avoid" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-indigo-500" {...props} />,
    li: ({ node, ...props }) => <li className="pl-2" {...props} />,
    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed print:text-justify" {...props} />,
    strong: ({ node, ...props }) => <strong className="font-extrabold text-indigo-700 bg-indigo-50 px-1 rounded print:bg-transparent print:text-black" {...props} />

};

interface NoteSheetViewProps {
    content: string;
    courseName: string;
    topic: string;
    onBack: () => void;
}

export const NoteSheetView: React.FC<NoteSheetViewProps> = ({ content, courseName, topic, onBack }) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `${courseName} - ${topic}`,
    });

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Top Bar (No Print) */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 print:hidden shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 font-bold text-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back
                    </button>
                    <div className="h-6 w-px bg-slate-300"></div>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{courseName} • {topic}</span>
                </div>
                <button
                    onClick={() => handlePrint && handlePrint()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold shadow-lg hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print / Save PDF
                </button>
            </div>

            {/* Note Sheet Content */}
            <div className="flex-1 overflow-y-auto p-8 flex justify-center print:p-0 print:overflow-visible">
                <div
                    ref={componentRef}
                    className="bg-white max-w-4xl w-full mx-auto p-12 min-h-[1100px] shadow-xl print:shadow-none print:w-full print:max-w-none text-slate-800"
                >
                    {/* Print Header */}
                    <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black mb-2 font-serif text-slate-900">{topic}</h1>
                            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-500">{courseName}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Generated By</p>
                            <p className="text-lg font-black font-serif italic text-indigo-700">SciencePracticeApp</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="prose prose-slate prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:leading-relaxed prose-li:marker:text-indigo-500 prose-strong:text-indigo-800">
                        <MarkdownRenderer
                            content={content}
                            components={NOTE_SHEET_COMPONENTS}
                        />
                    </div>

                    {/* Print Footer */}
                    <div className="mt-16 border-t border-slate-200 pt-6 text-center print:fixed print:bottom-0 print:left-0 print:w-full print:bg-white print:pb-6 print:pt-4">
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">Active Note Sheet • Generated by AI</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
