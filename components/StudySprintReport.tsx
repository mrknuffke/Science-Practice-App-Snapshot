import { errorMessage } from '../utils/errorMessage';
import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { StudySprintState, StudySprintReportData } from '../types';
import { getStudySprintReport, generateBonusPractice } from '../services/ai/studySprint';

interface StudySprintReportProps {
  studySprintState: StudySprintState;
  onBack: () => void;
}

export const StudySprintReport: React.FC<StudySprintReportProps> = ({
  studySprintState,
  onBack
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [reportData, setReportData] = useState<StudySprintReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    generateReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- one AI report per visit; re-running on re-render would re-bill and replace it.
  }, []);

  const generateReport = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const report = await getStudySprintReport(studySprintState);

      // Generate bonus practice if we have task responses
      const hasResponses = studySprintState.tasks.some(t => t.responses && t.responses.length > 0);

      if (hasResponses) {
        // Identify weak areas from task responses
        const weakAreas: string[] = [];
        studySprintState.tasks.forEach(task => {
          if (task.responses) {
            const incorrectCount = task.responses.filter(r => r.evaluation === 'Incorrect').length;
            const totalCount = task.responses.length;
            if (incorrectCount / totalCount > 0.3) {
              weakAreas.push(task.title);
            }
          }
        });

        const bonusPractice = await generateBonusPractice(
          studySprintState.course,
          studySprintState.topics,
          weakAreas
        );

        setReportData({ ...report });
        studySprintState.bonusPractice = bonusPractice;
      } else {
        setReportData(report);
      }
    } catch (err) {
      setError(errorMessage(err, 'Failed to generate report'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    setIsExporting(true);

    try {
      const container = reportRef.current;
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `study_sprint_${studySprintState.topics.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-xl text-slate-300">Generating your comprehensive report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4 text-red-400">Error Generating Report</h1>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Screen View - Visible Controls */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Generating PDF...
              </>
            ) : (
              <>
                📄 Download PDF Report
              </>
            )}
          </button>
        </div>

        {/* PDF-Ready Report Container */}
        <div
          ref={reportRef}
          className="bg-white text-slate-900 p-12 rounded-xl shadow-2xl"
          style={{ minHeight: '297mm' }}
        >
          {/* Header */}
          <div className="border-b-4 border-indigo-600 pb-6 mb-8">
            <h1 className="text-5xl font-black mb-2">Study Sprint Report</h1>
            <div className="text-lg text-slate-600 space-y-1">
              <p><strong>Course:</strong> {studySprintState.course} ({studySprintState.gradeLevel})</p>
              <p><strong>Topics:</strong> {studySprintState.topics}</p>
              {studySprintState.units && <p><strong>Units:</strong> {studySprintState.units}</p>}
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Session Duration:</strong> {formatDuration(Date.now() - studySprintState.sessionStartTime)}</p>
            </div>
          </div>

          {/* Summary */}
          {reportData && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-indigo-700">Session Summary</h2>
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded">
                <p className="text-lg leading-relaxed">{reportData.summary}</p>
              </div>
            </div>
          )}

          {/* Task Completion Overview */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4 text-indigo-700">Task Performance</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {studySprintState.tasks.map((task) => (
                <div key={task.id} className="bg-slate-100 border border-slate-300 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-600 mb-1">Task {task.order}</div>
                  <div className="font-bold mb-2">{task.title}</div>
                  <div className="text-2xl font-black text-emerald-600">{task.score || 'N/A'}</div>
                </div>
              ))}
            </div>

            {/* Task Analysis */}
            {reportData?.taskAnalysis && reportData.taskAnalysis.map((analysis) => {
              const task = studySprintState.tasks.find(t => t.id === analysis.taskId);
              if (!task) return null;

              return (
                <div key={task.id} className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-3">{task.title}</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-emerald-700 mb-2">✓ Strengths</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {analysis.strengths.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-700 mb-2">→ Areas for Growth</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {analysis.improvements.map((improvement, idx) => (
                          <li key={idx}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Transcripts */}
          <div className="mb-8 page-break-before">
            <h2 className="text-3xl font-bold mb-4 text-indigo-700">Full Session Transcript</h2>
            {studySprintState.tasks.map((task) => (
              <div key={task.id} className="mb-8 bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-4 border-b-2 border-indigo-300 pb-2">
                  Task {task.order}: {task.title}
                </h3>

                {task.responses && task.responses.length > 0 ? (
                  <div className="space-y-6">
                    {task.responses.map((response, idx) => (
                      <div key={response.questionId} className="border-l-4 border-indigo-300 pl-4">
                        <div className="font-bold mb-2">Question {idx + 1}:</div>
                        <div className="mb-3 text-slate-700">{response.questionText}</div>

                        <div className="bg-blue-50 p-3 rounded mb-2">
                          <div className="text-sm font-bold text-blue-900 mb-1">Your Answer:</div>
                          <div>{response.studentAnswer}</div>
                        </div>

                        {response.correctAnswer && (
                          <div className="bg-emerald-50 p-3 rounded mb-2">
                            <div className="text-sm font-bold text-emerald-900 mb-1">Correct Answer:</div>
                            <div>{response.correctAnswer}</div>
                          </div>
                        )}

                        {response.feedback && (
                          <div className="bg-amber-50 p-3 rounded">
                            <div className="text-sm font-bold text-amber-900 mb-1">Feedback:</div>
                            <div className="text-sm">{response.feedback}</div>
                          </div>
                        )}

                        <div className={`mt-2 inline-block px-3 py-1 rounded text-sm font-bold ${
                          response.evaluation === 'Correct' ? 'bg-emerald-100 text-emerald-800' :
                          response.evaluation === 'Partially Correct' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {response.evaluation}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No detailed responses captured for this task.</p>
                )}
              </div>
            ))}
          </div>

          {/* Recommendations */}
          {reportData?.recommendations && reportData.recommendations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-indigo-700">Next Steps for Learning</h2>
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded">
                <ul className="space-y-3">
                  {reportData.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="font-bold text-indigo-600">{idx + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Bonus Practice Materials */}
          {studySprintState.bonusPractice && (
            <div className="page-break-before">
              <h2 className="text-3xl font-bold mb-4 text-indigo-700">Additional Practice Materials</h2>
              <p className="text-slate-600 mb-6">
                Complete these questions to reinforce your learning:
              </p>

              <div className="space-y-6 mb-8">
                {studySprintState.bonusPractice.questions.map((q, idx) => (
                  <div key={q.id} className="border border-slate-300 rounded-lg p-4">
                    <div className="font-bold mb-2">{idx + 1}. {q.text}</div>
                    {q.options && (
                      <div className="ml-4 space-y-1">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="text-slate-700">
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-indigo-300 pt-6">
                <h3 className="text-2xl font-bold mb-4">Answer Key</h3>
                <div className="bg-slate-100 p-6 rounded-lg">
                  {studySprintState.bonusPractice.answerKey.map((answer, idx) => (
                    <div key={idx} className="mb-2">
                      <strong>{answer}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t-2 border-slate-300 text-center text-sm text-slate-500">
            <p>Generated with Science Practice Partner • {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
