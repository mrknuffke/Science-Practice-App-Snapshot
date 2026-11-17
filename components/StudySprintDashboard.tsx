import React, { useState } from 'react';
import { StudySprintState } from '../types';

interface StudySprintDashboardProps {
  studySprintState: StudySprintState;
  onUpdateState: (newState: StudySprintState) => void;
  onLaunchTask: (taskId: string) => void;
  onGenerateReport: () => void;
  onExit: () => void;
  onShareSprint?: () => void;
}

export const StudySprintDashboard: React.FC<StudySprintDashboardProps> = ({
  studySprintState,
  onUpdateState: _onUpdateState,
  onLaunchTask,
  onGenerateReport,
  onExit,
  onShareSprint
}) => {
  const [showEndEarlyConfirm, setShowEndEarlyConfirm] = useState(false);

  const completedCount = studySprintState.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = studySprintState.tasks.length;
  const allComplete = completedCount === totalTasks;
  const canEndEarly = completedCount > 0 && !allComplete;

  const getTaskIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in_progress':
        return '◐';
      default:
        return '○';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-emerald-500 bg-emerald-500/10';
      case 'in_progress':
        return 'border-indigo-500 bg-indigo-500/10';
      default:
        return 'border-slate-700 bg-slate-800';
    }
  };

  const getTaskTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      calculation: 'Calculation Practice',
      cer: 'CER Analysis',
      frq: 'FRQ Practice',
      quiz: 'Quick Quiz',
      worksheet: 'Mixed Practice'
    };
    return labels[type] || type;
  };

  const handleExitConfirm = () => {
    onExit();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleExitConfirm}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              ← Exit Sprint
            </button>
            <div className="flex items-center gap-3">
              {onShareSprint && (
                <button
                  onClick={onShareSprint}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Sprint
                </button>
              )}
              <span className="text-xs font-bold bg-indigo-600 text-white px-3 py-1 rounded uppercase tracking-wider">
                Beta
              </span>
            </div>
          </div>

          <h1 className="text-4xl font-black mb-2">Study Sprint</h1>
          <p className="text-xl text-slate-400 mb-4">{studySprintState.topics}</p>

          {/* Progress Bar */}
          <div className="bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-500"
              style={{ width: `${(completedCount / totalTasks) * 100}%` }}
            />
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Progress: {completedCount}/{totalTasks} Tasks Complete
          </p>
        </div>

        {/* Task Cards */}
        <div className="space-y-4 mb-8">
          {studySprintState.tasks.map((task) => (
            <div
              key={task.id}
              className={`border-2 rounded-2xl p-6 transition-all ${getTaskStatusColor(task.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">
                      {getTaskIcon(task.status)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-slate-700 text-slate-300 px-2 py-1 rounded">
                          Task {task.order}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          {getTaskTypeLabel(task.type)}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold mt-1">{task.title}</h2>
                    </div>
                  </div>

                  <p className="text-slate-300 mb-4 ml-12">{task.description}</p>

                  {task.status === 'completed' && (
                    <div className="ml-12 flex items-center gap-2">
                      <span className="text-sm font-bold text-emerald-400">Completed ✓</span>
                      {task.duration && (
                        <span className="text-xs text-slate-400">
                          • {Math.round(task.duration / 60000)} min
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  {task.status === 'pending' && (
                    <button
                      onClick={() => onLaunchTask(task.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
                    >
                      Start Task
                    </button>
                  )}
                  {task.status === 'completed' && (
                    <button
                      onClick={() => onLaunchTask(task.id)}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
                    >
                      View Results
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => onLaunchTask(task.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* End Early Button */}
        {canEndEarly && !showEndEarlyConfirm && (
          <div className="text-center">
            <button
              onClick={() => setShowEndEarlyConfirm(true)}
              className="text-slate-400 hover:text-white text-sm font-bold underline transition-colors"
            >
              End Sprint Early & Get Feedback →
            </button>
          </div>
        )}

        {/* End Early Confirmation */}
        {canEndEarly && showEndEarlyConfirm && (
          <div className="bg-amber-500/10 border-2 border-amber-500 rounded-2xl p-6 text-center">
            <p className="text-amber-300 font-bold mb-4">
              End the sprint early and get feedback on your {completedCount} completed {completedCount === 1 ? 'task' : 'tasks'}?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowEndEarlyConfirm(false)}
                className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
              >
                Keep Going
              </button>
              <button
                onClick={onGenerateReport}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-colors"
              >
                Yes, End & Get Feedback
              </button>
            </div>
          </div>
        )}

        {/* Generate Report Button — All Complete */}
        {allComplete && (
          <div className="bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 border-2 border-emerald-500 rounded-2xl p-8 text-center">
            <div className="mb-4">
              <span className="text-6xl">🎉</span>
            </div>
            <h2 className="text-3xl font-black mb-2">All Tasks Complete!</h2>
            <p className="text-slate-300 mb-6">
              Great work! Generate your comprehensive feedback report.
            </p>
            <button
              onClick={onGenerateReport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Generate Feedback Report →
            </button>
          </div>
        )}

        {/* Session Info */}
        <div className="mt-8 text-center text-sm text-slate-400">
          <p>
            Course: {studySprintState.course} ({studySprintState.gradeLevel})
            {studySprintState.units && ` • Units: ${studySprintState.units}`}
          </p>
          <p className="mt-1">
            Session started: {new Date(studySprintState.sessionStartTime).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
