import React, { useState } from 'react';
import { CourseType } from '../types';

interface SubjectLibraryViewProps {
  onBack: () => void;
  availableCourses: string[];
  starredSubjects: string[];
  onToggleStar: (course: string) => void;
  onSelectCourse: (course: CourseType) => void;
}

type DisciplineFilter = 'all' | 'life' | 'chem' | 'physics' | 'earth' | 'middle' | 'elementary' | 'electives';
type LevelFilter = 'general' | 'honors' | 'ap' | 'ib';
type FilterValue = DisciplineFilter | LevelFilter;

const LEVEL_VALUES: LevelFilter[] = ['general', 'honors', 'ap', 'ib'];

export const SubjectLibraryView: React.FC<SubjectLibraryViewProps> = ({
  onBack,
  availableCourses,
  starredSubjects,
  onToggleStar,
  onSelectCourse,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Course classification details
  const getDiscipline = (course: string): DisciplineFilter => {
    const lower = course.toLowerCase();
    if (lower.includes('elementary')) return 'elementary';
    if (lower.includes('middle school')) return 'middle';
    if (lower.includes('chemistry')) return 'chem';
    if (lower.includes('physics') && !lower.includes('physical science')) return 'physics';
    if (lower.includes('environmental') || lower.includes('earth and space')) return 'earth';
    if (['anatomy and physiology', 'marine biology', 'biotechnology', 'forensic science', 'physical science'].includes(lower)) return 'electives';
    // Defaults to life science (biology data)
    return 'life';
  };

  // Course rigor level. Returns null for courses without a level prefix.
  const getLevel = (course: string): LevelFilter | null => {
    if (course.startsWith('IB ')) return 'ib';
    if (course.startsWith('AP ')) return 'ap';
    if (course.startsWith('Honors ')) return 'honors';
    if (course.startsWith('General ')) return 'general';
    return null;
  };

  const getDisciplineLabel = (course: string): { text: string; bg: string; color: string } => {
    const disc = getDiscipline(course);
    switch (disc) {
      case 'elementary':
        return { text: 'Elementary', bg: 'bg-orange-500/10', color: 'text-orange-500' };
      case 'middle':
        return { text: 'Middle School', bg: 'bg-amber-500/10', color: 'text-amber-600 dark:text-amber-400' };
      case 'chem':
        return { text: 'Chemistry', bg: 'bg-skyBlue/10', color: 'text-sky-600 dark:text-skyBlue' };
      case 'physics':
        return { text: 'Physics', bg: 'bg-coral/10', color: 'text-rose-600 dark:text-coral' };
      case 'earth':
        return { text: 'Earth & Env', bg: 'bg-teal-500/10', color: 'text-teal-600 dark:text-teal-400' };
      case 'electives':
        return { text: 'Elective', bg: 'bg-slate-500/10', color: 'text-slate-600 dark:text-slate-400' };
      default:
        return { text: 'Life Science', bg: 'bg-mint/10', color: 'text-emerald-600 dark:text-mint' };
    }
  };

  const getCourseDescription = (course: string): string => {
    if (course.includes('IB ')) return 'Rigorous International Baccalaureate curriculum preparation, command terms, and analytical assessment practice.';
    if (course.includes('AP ')) return 'Rigorous Advanced Placement standard curriculum preparation and scoring practice.';
    if (course.includes('Honors ')) return 'Deep conceptual extensions, challenging quantitative tasks, and active models.';
    if (course.includes('General ')) return 'Comprehensive fundamental principles, everyday analogies, and clear tutorials.';
    if (course === 'Anatomy and Physiology') return 'Study body structures, organs, skeletal systems, and regulatory homeostasis functions.';
    if (course === 'Marine Biology') return 'Explore ocean water habitats, coral ecosystems, marine organisms, and biodiversity.';
    if (course === 'Biotechnology') return 'Explore genetic molecular engineering, CRISPR gene editing tools, and clinical lab techniques.';
    if (course === 'Forensic Science') return 'Solve crime scenes using DNA extraction analysis, fingerprint chromatography, and trace evidence.';
    return 'Curriculum-aligned science practices, adaptive tutorials, and real-time AI feedback.';
  };

  const getDisciplineIcon = (course: string): string => {
    const disc = getDiscipline(course);
    switch (disc) {
      case 'elementary': return '🌟';
      case 'middle': return '🎒';
      case 'chem': return '⚗️';
      case 'physics': return '⚛️';
      case 'earth': return '🌍';
      case 'electives': return '🔬';
      default: return '🧬';
    }
  };

  // Filter and Search available courses
  const filteredCourses = availableCourses
    .filter(c => c !== 'Custom Practice') // Hide empty custom course
    .filter(course => {
      // 1. Apply active filter tab (subject discipline or rigor level)
      if (activeFilter === 'all') return true;
      if (LEVEL_VALUES.includes(activeFilter as LevelFilter)) {
        return getLevel(course) === activeFilter;
      }
      return getDiscipline(course) === activeFilter;
    })
    .filter(course => {
      // 2. Apply search text query
      if (!searchQuery) return true;
      return course.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      // Pin starred courses to the top of the search grid!
      const aStarred = starredSubjects.includes(a);
      const bStarred = starredSubjects.includes(b);
      if (aStarred && !bStarred) return -1;
      if (!aStarred && bStarred) return 1;
      return a.localeCompare(b);
    });

  // Subject filters: "All Subjects" first, then disciplines alphabetically by label.
  const subjectTabs: { value: FilterValue; label: string }[] = [
    { value: 'all', label: 'All Subjects' },
    { value: 'chem', label: 'Chemistries' },
    { value: 'earth', label: 'Earth & Environmental' },
    { value: 'elementary', label: 'Elementary' },
    { value: 'life', label: 'Life Sciences' },
    { value: 'middle', label: 'Middle School' },
    { value: 'physics', label: 'Physics' },
    { value: 'electives', label: 'Science Electives' }
  ];

  // Level filters in order of increasing rigor.
  const levelTabs: { value: FilterValue; label: string }[] = [
    { value: 'general', label: 'General' },
    { value: 'honors', label: 'Honors' },
    { value: 'ap', label: 'AP' },
    { value: 'ib', label: 'IB' }
  ];

  const tabClass = (value: FilterValue) =>
    `px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
      activeFilter === value
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/15 dark:bg-[#818CF8] dark:text-slate-900'
        : 'bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 text-left">
      {/* Visor Header */}
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-4xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Subject Library</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed max-w-2xl">
          Browse all available curriculum science courses. Toggle the gold star on any subject to pin it directly to your primary home dashboard grid for quick-starts!
        </p>
      </div>

      {/* Grid Filter Options & Search Bar */}
      <div className="space-y-4">
        {/* Category tabs: subjects (alphabetical) then levels (increasing rigor) */}
        <div className="flex gap-2 flex-wrap items-center">
          {subjectTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={tabClass(tab.value)}
            >
              {tab.label}
            </button>
          ))}

          {/* Divider between subject and level groups */}
          <span className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" aria-hidden="true" />

          {levelTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={tabClass(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Search box */}
        <div className="max-w-md relative">
          <input aria-label="Search courses"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses... e.g. Biology, AP..."
            className="w-full bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/50 text-[#1A1C21] dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </div>

      {/* Catalog Cards Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bento-card text-center py-16 text-slate-400 dark:text-slate-500">
          <div className="text-5xl mb-4 select-none">🔬</div>
          <h3 className="text-lg font-black font-rounded text-[#1A1C21] dark:text-white">No courses match your query</h3>
          <p className="text-xs text-slate-400 mt-1">Try refining your search keyword or selecting a different tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const isStarred = starredSubjects.includes(course);
            const tag = getDisciplineLabel(course);
            const desc = getCourseDescription(course);
            const icon = getDisciplineIcon(course);

            return (
              <div
                key={course}
                className="bento-card border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between gap-6 h-56 relative group cursor-pointer"
                onClick={() => onSelectCourse(course as CourseType)}
              >
                {/* Starring toggle switch */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid launching course when starring
                    onToggleStar(course);
                  }}
                  className={`absolute top-5 right-5 p-2 rounded-xl transition-all border ${
                    isStarred
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                      : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/30 text-slate-400 hover:text-amber-500 hover:scale-110'
                  }`}
                  title={isStarred ? "Remove from dashboard favorites" : "Add to dashboard favorites"}
                >
                  <svg
                    className="w-4 h-4 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </button>

                <div className="flex justify-between items-start pr-10">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform select-none">
                    {icon}
                  </div>
                  <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg ${tag.bg} ${tag.color}`}>
                    {tag.text}
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-indigo-500 dark:group-hover:text-[#818CF8] transition-colors font-rounded line-clamp-1">
                    {course}
                  </h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">
                    {desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
