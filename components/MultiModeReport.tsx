import React, { useEffect, useState, useRef } from 'react';
import { MultiModeState } from '../types';
import { getMultiModeReport } from '../services/ai/overview';
import html2canvas from 'html2canvas';

interface MultiModeReportProps {
    state: MultiModeState;
    onClose: () => void;
}

export const MultiModeReport: React.FC<MultiModeReportProps> = ({ state, onClose }) => {
    const [reportText, setReportText] = useState<string>("Generating report...");
    const reportRef = useRef<HTMLDivElement>(null);
    const [shareOpen, setShareOpen] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            const text = await getMultiModeReport(state.course, state.topic, state.activityLog, state.partnerState);
            setReportText(text);
        };
        fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one AI report per visit; re-running on state changes would re-bill and replace the text.
    }, []);

    const totalActivities = state.activityLog.length;

    const handleDownloadImage = async () => {
        if (!reportRef.current) return;
        try {
            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: null,
                scale: 2,
            });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `StudyDashboard_${state.topic.replace(/\s+/g, '_')}.png`;
            link.click();
            setShareOpen(false);
        } catch (e) {
            console.error("Screenshot failed", e);
            alert("Could not create image.");
        }
    };

    const handleEmail = () => {
        const subject = `Study Session Report: ${state.topic}`;
        const body = `Course: ${state.course}%0D%0ATopic: ${state.topic}%0D%0AActivities Completed: ${totalActivities}%0D%0A%0D%0AFeedback:%0D%0A${encodeURIComponent(reportText)}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
        setShareOpen(false);
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 animate-in zoom-in-95 duration-300">
            <div ref={reportRef} className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">

                <div className="bg-slate-900 p-8 text-center text-white">
                    <h1 className="text-3xl font-bold mb-2">Session Complete!</h1>
                    <p className="text-slate-400 opacity-90">{state.topic}</p>
                </div>

                <div className="p-8 space-y-6">

                    <div className="text-center">
                        <div className="inline-block p-4 bg-emerald-50 rounded-2xl mb-4">
                            <span className="text-4xl font-black text-emerald-600">{totalActivities}</span>
                            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide mt-1">Activities Completed</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">AI Coach Feedback</h3>
                        <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                            {reportText}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-slate-500 uppercase">Activity Log</h3>
                        {state.activityLog.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">No activities recorded.</p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {state.activityLog.map((log, i) => (
                                    <li key={i} className="py-2 flex justify-between text-sm">
                                        <span className="font-medium text-slate-700">{log.type}</span>
                                        <span className="text-slate-500">{log.score || 'Completed'}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col gap-3 relative z-10">
                    {/* Share Menu */}
                    {shareOpen && (
                        <div className="absolute bottom-full left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-xl rounded-t-2xl animate-in slide-in-from-bottom-5">
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={handleDownloadImage} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold flex flex-col items-center gap-1">
                                    <span>📸</span> Download Image
                                </button>
                                <button onClick={handleEmail} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold flex flex-col items-center gap-1">
                                    <span>✉️</span> Email Teacher
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShareOpen(!shareOpen)}
                            className={`flex-1 py-3 font-bold rounded-xl shadow transition-all border ${shareOpen ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            {shareOpen ? 'Close Options' : 'Share Results'}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-all"
                        >
                            Return to Menu
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
