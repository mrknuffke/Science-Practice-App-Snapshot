import React, { useState } from 'react';
import { getInterviewQuestions, getRubricForQuestions } from '../services/ai/documents';
import { FileData, readFileAsBase64 } from '../services/fileData';
import { ArrowLeft, FileText, Check, Copy, Download, RefreshCw, Layers, List, Edit3 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import FileUpload from './FileUpload';

interface InterviewScriptViewProps {
    onBack: () => void;
}

type Step = 'input' | 'questions' | 'review';

const InterviewScriptView: React.FC<InterviewScriptViewProps> = ({ onBack }) => {
    const [step, setStep] = useState<Step>('input');
    const [topic, setTopic] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Data
    const [questions, setQuestions] = useState<string[]>([]);
    const [rubric, setRubric] = useState<string>('');

    const _handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            if (uploadedFiles.length >= 3) {
                alert("Maximum 3 files allowed.");
                return;
            }
            const file = event.target.files[0];
            try {
                const base64 = await readFileAsBase64(file);
                const newFile: FileData = {
                    inlineData: {
                        data: base64,
                        mimeType: file.type
                    }
                };
                setUploadedFiles(prev => [...prev, newFile]);
            } catch (e) {
                console.error("File upload failed", e);
                alert("Failed to read file.");
            }
        }
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerateQuestions = async () => {
        if (!topic && uploadedFiles.length === 0) {
            setError("Please enter a topic or upload a file.");
            return;
        }
        setError(null);
        setIsProcessing(true);
        try {
            const qs = await getInterviewQuestions(topic, uploadedFiles);
            setQuestions(qs);
            setStep('questions');
        } catch (e) {
            setError("Failed to generate questions. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGenerateRubric = async () => {
        setError(null);
        setIsProcessing(true);
        try {
            // Pass the current state of questions (in case user edited them ideally, but simple string logic for now)
            const rub = await getRubricForQuestions(topic, questions);
            setRubric(rub);
            setStep('review');
        } catch (e) {
            setError("Failed to generate rubric.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleQuestionEdit = (index: number, newVal: string) => {
        const newQs = [...questions];
        newQs[index] = newVal;
        setQuestions(newQs);
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Menu
                </button>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <span className="bg-indigo-600 text-white p-2 rounded-lg"><FileText className="w-5 h-5" /></span>
                    Assessment Script Generator
                </h1>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Progress Bar */}
                <div className="flex justify-between items-center mb-12 relative px-8">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 translate-y-[-50%]" />
                    {['input', 'questions', 'review'].map((s, idx) => {
                        const isActive = step === s;
                        const isPast = ['input', 'questions', 'review'].indexOf(step) > idx;
                        return (
                            <div key={s} className={`flex flex-col items-center gap-2 bg-slate-50 px-2`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${isActive ? 'bg-indigo-600 text-white scale-110 shadow-lg' : isPast ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
                                    {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-indigo-700' : 'text-slate-400'}`}>{s}</span>
                            </div>
                        );
                    })}
                </div>

                {/* STEP 1: INPUT */}
                {step === 'input' && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">1. Define Topic & Context</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Topic or Standard</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    placeholder="e.g., Photosynthesis, The Great Gatsby, Newton's Laws..."
                                    className="w-full p-4 text-lg border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300 font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Upload Material (Optional)</label>
                                <div className="mb-4">
                                    <FileUpload
                                        onFilesSelected={async (files) => {
                                            if (uploadedFiles.length + files.length > 3) {
                                                alert("Maximum 3 files allowed.");
                                                return;
                                            }
                                            const newFiles: FileData[] = [];
                                            for (const file of files) {
                                                try {
                                                    const base64 = await readFileAsBase64(file);
                                                    newFiles.push({
                                                        inlineData: {
                                                            data: base64,
                                                            mimeType: file.type
                                                        }
                                                    });
                                                } catch (e) {
                                                    console.error("Failed to read file", file.name, e);
                                                }
                                            }
                                            setUploadedFiles(prev => [...prev, ...newFiles]);
                                        }}
                                        maxFiles={3 - uploadedFiles.length}
                                        accept=".pdf,.txt,.md,.csv,image/*"
                                        label="Click or Drag to Upload Rubrics, Readings, or Notes"
                                        subLabel="PDF, TXT, Images (Max 3)"
                                    />
                                </div>

                                {uploadedFiles.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {uploadedFiles.map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-indigo-100">
                                                <FileText className="w-4 h-4" />
                                                <span className="truncate max-w-[200px]">File {i + 1}</span>
                                                <button onClick={() => removeFile(i)} className="hover:text-rose-500 ml-1">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 flex items-center gap-2 font-bold animate-pulse">
                                    ⚠️ {error}
                                </div>
                            )}

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={handleGenerateQuestions}
                                    disabled={isProcessing}
                                    className={`bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                            Drafting...
                                        </>
                                    ) : (
                                        <>
                                            Generate Questions <ArrowLeft className="w-5 h-5 rotate-180" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: QUESTIONS */}
                {step === 'questions' && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
                            2. Review Questions
                            <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Edit as needed</span>
                        </h2>

                        <div className="space-y-4 mb-8">
                            {questions.map((q, idx) => (
                                <div key={idx} className="group relative">
                                    <textarea
                                        value={q}
                                        onChange={(e) => handleQuestionEdit(idx, e.target.value)}
                                        rows={2}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all resize-none font-medium text-slate-700"
                                    />
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <Edit3 className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <button
                                onClick={() => setStep('input')}
                                className="text-slate-500 font-bold hover:text-slate-800"
                            >
                                Back
                            </button>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleGenerateQuestions}
                                    disabled={isProcessing}
                                    className="px-6 py-3 rounded-xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" /> Regenerate
                                </button>
                                <button
                                    onClick={handleGenerateRubric}
                                    disabled={isProcessing}
                                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    {isProcessing ? 'Thinking...' : 'Create "Look-fors" (Rubric)'} <Layers className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3 + 4: RUBRIC & REVIEW (Combined View) */}
                {step === 'review' && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
                        <div className="flex justify-between items-start mb-6 print:hidden">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Assessment Script</h2>
                                <p className="text-slate-500 font-medium">Topic: {topic}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const element = document.createElement("a");
                                        const file = new Blob([`# ${topic} - Assessment Script\n\n## Questions\n${questions.map(q => `- ${q}`).join('\n')}\n\n## Look-fors\n${rubric}`], { type: 'text/plain' });
                                        element.href = URL.createObjectURL(file);
                                        element.download = `${topic.replace(/\s+/g, '_')}_Script.txt`;
                                        document.body.appendChild(element); // Required for this to work in FireFox
                                        element.click();
                                    }}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100 flex items-center gap-2"
                                    title="Download Text"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleCopyToClipboard(`# ${topic} - Assessment Script\n\n## Questions\n${questions.map(q => `- ${q}`).join('\n')}\n\n## Look-fors\n${rubric}`)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                    title="Copy All"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    Print / PDF
                                </button>
                            </div>
                        </div>

                        {/* Print Header */}
                        <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
                            <h1 className="text-2xl font-bold text-black mb-1">Assessment Script: {topic}</h1>
                            <p className="text-sm text-gray-600">Generated by Science Practice Partner</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block">
                            {/* Left Col: Questions */}
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 print:bg-white print:border-none print:p-0 print:mb-8">
                                <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-4 flex items-center gap-2 print:text-black print:border-b print:border-black print:pb-2">
                                    <List className="w-4 h-4" /> Questions
                                </h3>
                                <div className="space-y-4">
                                    {questions.map((q, i) => (
                                        <div key={i} className="flex gap-3 print:break-inside-avoid">
                                            <span className="font-bold text-indigo-400 print:text-black">{i + 1}.</span>
                                            <div className="text-slate-700 font-medium print:text-black">
                                                <MarkdownRenderer content={q} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Col: Rubric/Look-fors */}
                            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 print:bg-white print:border-none print:p-0">
                                <h3 className="font-bold text-emerald-600/60 uppercase tracking-widest text-xs mb-4 flex items-center gap-2 print:text-black print:border-b print:border-black print:pb-2">
                                    <Check className="w-4 h-4" /> Look-fors (Success Criteria)
                                </h3>
                                <div className="prose prose-sm prose-emerald print:prose-black max-w-none">
                                    <MarkdownRenderer content={rubric} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-8 print:hidden">
                            <button
                                onClick={() => setStep('questions')} // Go back to edit details
                                className="text-slate-500 font-bold hover:text-slate-800"
                            >
                                Back to Edit
                            </button>
                            <div className="flex gap-4">
                                <button
                                    onClick={onBack}
                                    className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-900 transition-all flex items-center gap-2"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default InterviewScriptView;
