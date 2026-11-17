import { errorMessage } from '../utils/errorMessage';
import React, { useState } from 'react';
import { CourseType, StudySprintState, StudySprintTask } from '../types';
import { getStudySprintTaskRecommendations } from '../services/ai/studySprint';

interface StudySprintSetupViewProps {
  onStartSprint: (state: StudySprintState) => void;
  onBack: () => void;
}

const TASK_TYPE_OPTIONS: Array<{ value: StudySprintTask['type']; label: string; description: string }> = [
  { value: 'calculation', label: 'Calculation Practice', description: 'Step-by-step problem solving with Calculation Partner' },
  { value: 'cer', label: 'CER Analysis', description: 'Claim-Evidence-Reasoning with data exhibits' },
  { value: 'frq', label: 'FRQ Practice', description: 'Free response with scenarios and data' },
  { value: 'flashcards', label: 'Flashcards', description: 'Interactive review with reverse and write modes' },
  { value: 'quiz', label: 'Quick Quiz', description: 'Multiple choice and short answer questions' },
  { value: 'worksheet', label: 'Mixed Practice', description: 'Comprehensive worksheet with varied questions' }
];

export const StudySprintSetupView: React.FC<StudySprintSetupViewProps> = ({
  onStartSprint,
  onBack
}) => {
  const [course, setCourse] = useState<CourseType>('' as CourseType);
  const [gradeLevel, setGradeLevel] = useState('');
  const [units, setUnits] = useState('');
  const [topics, setTopics] = useState('');
  const [taskCount, setTaskCount] = useState(3);
  const [subtopicFocus, setSubtopicFocus] = useState('');
  const [recommendedTasks, setRecommendedTasks] = useState<StudySprintTask[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [editableTopics, setEditableTopics] = useState('');

  const handleGenerateRecommendations = async () => {
    if (!course.trim()) {
      setError('Please enter your course name.');
      return;
    }

    if (!gradeLevel.trim()) {
      setError('Please enter your grade level.');
      return;
    }

    if (!topics.trim()) {
      setError('Please enter at least one topic to practice.');
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      const tasks = await getStudySprintTaskRecommendations(
        course,
        gradeLevel,
        units,
        topics,
        taskCount,
        subtopicFocus
      );
      setRecommendedTasks(tasks);
      setEditableTopics(topics);
    } catch (err) {
      setError(errorMessage(err, 'Failed to generate recommendations. Please try again.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSwapTask = (taskIndex: number, newType: StudySprintTask['type']) => {
    if (!recommendedTasks) return;

    const newTasks = [...recommendedTasks];
    const taskOption = TASK_TYPE_OPTIONS.find(opt => opt.value === newType);

    newTasks[taskIndex] = {
      ...newTasks[taskIndex],
      type: newType,
      title: `${taskOption?.label} on ${topics.split(',')[0].trim()}`,
      description: taskOption?.description || ''
    };

    setRecommendedTasks(newTasks);
  };

  const handleUpdateTaskFocus = (taskIndex: number, newFocus: string) => {
    if (!recommendedTasks) return;
    const newTasks = [...recommendedTasks];
    newTasks[taskIndex] = {
      ...newTasks[taskIndex],
      focus: newFocus
    };
    setRecommendedTasks(newTasks);
  };

  const handleRegenerate = async () => {
    if (!editableTopics.trim()) {
      setError('Please enter at least one topic.');
      return;
    }
    setError('');
    setIsGenerating(true);
    try {
      const tasks = await getStudySprintTaskRecommendations(
        course,
        gradeLevel,
        units,
        editableTopics,
        taskCount,
        subtopicFocus
      );
      setRecommendedTasks(tasks);
      // Sync topics state so sprint uses updated value
      setTopics(editableTopics);
    } catch (err) {
      setError(errorMessage(err, 'Failed to regenerate. Please try again.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartSprint = () => {
    if (!recommendedTasks || recommendedTasks.length < 3) {
      setError('Please generate task recommendations first.');
      return;
    }

    const sprintState: StudySprintState = {
      isActive: true,
      course,
      gradeLevel,
      units,
      topics: editableTopics || topics,
      subtopicFocus: subtopicFocus || undefined,
      tasks: recommendedTasks,
      sessionStartTime: Date.now()
    };

    onStartSprint(sprintState);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-black mb-2">
            Study Sprint
            <span className="ml-3 text-xs font-bold bg-indigo-600 text-white px-2 py-1 rounded uppercase tracking-wider">
              Beta
            </span>
          </h1>
          <p className="text-slate-400">
            Complete 3 diverse review tasks and get a comprehensive PDF report
          </p>
        </div>

        {/* Configuration Form */}
        {!recommendedTasks && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Course <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value as CourseType)}
                placeholder="e.g., AP Biology, Chemistry, Physics 1"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Grade Level <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder="e.g., AP, Honors, General, Middle School"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Units (Optional)
              </label>
              <input
                type="text"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                placeholder="e.g., Units 1-3: Biochemistry, Cells, Cellular Energetics"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Topics <span className="text-red-400">*</span>
              </label>
              <textarea
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="e.g., Photosynthesis, Cellular Respiration, Enzyme Kinetics"
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                Enter the topics you want to practice (separate multiple topics with commas)
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Subtopic Focus (Optional)
              </label>
              <input
                type="text"
                value={subtopicFocus}
                onChange={(e) => setSubtopicFocus(e.target.value)}
                placeholder="e.g., Light-dependent reactions, Calvin Cycle"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Narrow down to specific aspects within your topics
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Number of Tasks
              </label>
              <div className="flex gap-2">
                {[3, 4, 5].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setTaskCount(count)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-colors ${taskCount === count
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-indigo-500'
                      }`}
                  >
                    {count} Tasks
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                More tasks = more comprehensive review
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerateRecommendations}
              disabled={isGenerating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-colors"
            >
              {isGenerating ? 'Generating Recommendations...' : 'Generate Task Recommendations'}
            </button>
          </div>
        )}

        {/* Recommended Tasks */}
        {recommendedTasks && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">Recommended Tasks</h2>
              <p className="text-slate-400 mb-3">
                Review these tasks, or swap any task type before starting.
              </p>

              {/* Editable foci */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Topics / Foci</label>
                <div className="flex gap-2">
                  <textarea
                    value={editableTopics}
                    onChange={(e) => setEditableTopics(e.target.value)}
                    rows={2}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                  <button
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap self-end"
                  >
                    {isGenerating ? 'Regenerating…' : '↺ Re-generate'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {recommendedTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-1 rounded">
                            Task {task.order}
                          </span>
                          <h3 className="font-bold text-lg">{task.title}</h3>
                        </div>
                        <p className="text-sm text-slate-400">{task.description}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-400 whitespace-nowrap">Task Focus:</label>
                        <input
                          type="text"
                          value={task.focus || ''}
                          onChange={(e) => handleUpdateTaskFocus(index, e.target.value)}
                          placeholder={`Default: ${editableTopics.split(',')[0].trim() || topics.split(',')[0].trim()}`}
                          className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-400 whitespace-nowrap">Swap Type:</label>
                        <select
                          value={task.type}
                          onChange={(e) => handleSwapTask(index, e.target.value as StudySprintTask['type'])}
                          className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                        >
                          {TASK_TYPE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex gap-3">
                  <button
                    onClick={() => setRecommendedTasks(null)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    ← Change Topics
                  </button>
                  <button
                    onClick={handleStartSprint}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    Start Study Sprint →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
