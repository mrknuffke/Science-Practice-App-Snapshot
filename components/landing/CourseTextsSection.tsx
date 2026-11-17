import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { TextbookProgressSummary } from '../../utils/textbookProgress';

interface CourseTextsSectionProps {
  textbookProgress: TextbookProgressSummary;
}

export const CourseTextsSection: React.FC<CourseTextsSectionProps> = ({ textbookProgress }) => {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2">
          <span className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
          Course Texts
          <span className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
        </h3>
        {textbookProgress.hasProgress && (
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
            {textbookProgress.startedLessonsCount} of {textbookProgress.totalLessons} Lessons Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bento-card border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between gap-4 p-5 rounded-[2rem] transition-all duration-300 hover:shadow-lg bg-white dark:bg-[#15171C]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-violet-500/10 dark:bg-violet-950/20 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Open Access · {textbookProgress.totalLessons} Lessons
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">
                SAS General Chemistry
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug mt-1 line-clamp-2">
              Interactive textbook with 2D particle dynamics, retrieval checkpoints, and constructed response tasks across 5 units.
            </p>

            {textbookProgress.hasProgress ? (
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-500 dark:text-slate-400">
                    {textbookProgress.completedCheckpointsCount} Checkpoint{textbookProgress.completedCheckpointsCount === 1 ? '' : 's'} Mastered
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {Math.round((textbookProgress.startedLessonsCount / textbookProgress.totalLessons) * 100)}% Curriculum
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(6, (textbookProgress.startedLessonsCount / textbookProgress.totalLessons) * 100))}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                Ready to begin with Unit 1: Chemical Hygiene.
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
            {textbookProgress.resume ? (
              <a
                href={textbookProgress.resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm truncate"
                title={`Resume ${textbookProgress.resume.lessonTitle}`}
              >
                <span className="truncate">Resume: {textbookProgress.resume.lessonId}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ) : (
              <a
                href="/chem/lessons/1-1a_atomic-structure-electron-config.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Start Chapter 1</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}
            <a
              href="/chem/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors shrink-0"
              title="Open Textbook Dashboard"
            >
              All Chapters
            </a>
          </div>
        </div>

        {/* SAS General Physics Card */}
        <div className="bento-card border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between gap-4 p-5 rounded-[2rem] transition-all duration-300 hover:shadow-lg bg-white dark:bg-[#15171C]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-950/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Curriculum Intake Active
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">
                SAS General Physics
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug mt-1 line-clamp-2">
              Interactive physical science textbook covering kinematics, dynamics, energy conservation, wave mechanics, and fields.
            </p>

            <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
              Course reference materials and unit consensus notes currently staging.
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
            <a
              href="/physics/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Explore Course</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            <a
              href="/physics/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors shrink-0"
              title="Open Physics Dashboard"
            >
              All Units
            </a>
          </div>
        </div>

        {/* SAS General Biology Card */}
        <div className="bento-card border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between gap-4 p-5 rounded-[2rem] transition-all duration-300 hover:shadow-lg bg-white dark:bg-[#15171C]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Open Access · Unit 1 Live
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">
                SAS General Biology
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug mt-1 line-clamp-2">
              Interactive life science textbook covering homeostasis, cellular respiration, feedback loops, genetics, and microevolution.
            </p>

            <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
              Unit 1: Cellular processes and homeostatic feedback mechanisms active.
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
            <a
              href="/bio/lessons/1-1_cellular-respiration.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Start Unit 1</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            <a
              href="/bio/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors shrink-0"
              title="Open Biology Dashboard"
            >
              All Units
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
