import React, { useState } from 'react';
import { Search, Star, ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  COURSES,
  COURSES_BY_SUBJECT,
  SUBJECT_ORDER,
  SUBJECT_LABELS,
  COLOR_CLASSES,
  type CourseEntry,
} from '../constants/apCourses';
import { useDialog } from '../hooks/useDialog';

interface APReviewCatalogViewProps {
  onBack: () => void;
  onSelectCourse: (course: CourseEntry, examParam: string | null) => void;
  studentName?: string;
}

// ── Reusable course card ──────────────────────────────────────────────────────
interface CourseCardProps {
  course: CourseEntry;
  isStarred: boolean;
  onCourseClick: (c: CourseEntry) => void;
  onToggleStar: (e: React.MouseEvent, slug: string) => void;
}
const CourseCard: React.FC<CourseCardProps> = ({ course, isStarred, onCourseClick, onToggleStar }) => {
  const colors = COLOR_CLASSES[course.color] || COLOR_CLASSES.blue;
  return (
    <button
      onClick={() => onCourseClick(course)}
      className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 text-left p-5 flex flex-col justify-between min-h-[9rem] group relative overflow-hidden transition-all duration-300 transform hover:scale-102 hover:shadow-md"
    >
      <div className="flex justify-between items-start w-full">
        <span className="text-3xl leading-none drop-shadow-sm select-none">{course.emoji}</span>
        <button aria-label={`${isStarred ? 'Unstar' : 'Star'} ${course.displayName}`} aria-pressed={isStarred}
          onClick={e => onToggleStar(e, course.slug)}
          className={`p-1 rounded-full hover:scale-110 transition-transform ${isStarred ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'}`}
        >
          <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="mt-4">
        <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-2 ${colors.badge} ${colors.text}`}>
          {SUBJECT_LABELS[course.subjectArea]}
        </span>
        <h4 className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-indigo-600 dark:group-hover:text-[#818CF8] font-rounded transition-colors leading-snug">
          {course.displayName}
        </h4>
      </div>
    </button>
  );
};

// ── Reusable course grid ──────────────────────────────────────────────────────
interface CourseGridProps {
  courses: CourseEntry[];
  starredSlugs: string[];
  onCourseClick: (c: CourseEntry) => void;
  onToggleStar: (e: React.MouseEvent, slug: string) => void;
}
const CourseGrid: React.FC<CourseGridProps> = ({ courses, starredSlugs, onCourseClick, onToggleStar }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {courses.map(course => (
      <CourseCard
        key={course.slug}
        course={course}
        isStarred={starredSlugs.includes(course.slug)}
        onCourseClick={onCourseClick}
        onToggleStar={onToggleStar}
      />
    ))}
  </div>
);

// ── Curriculum section wrapper ────────────────────────────────────────────────
interface CurriculumSectionProps {
  id: string;
  label: string;
  fullLabel: string;
  description: string;
  badgeClass: string;
  borderClass: string;
  children: React.ReactNode;
}
const CurriculumSection: React.FC<CurriculumSectionProps> = ({
  id, label, fullLabel, description, badgeClass, borderClass, children,
}) => (
  <section id={id} className={`space-y-6 rounded-3xl border ${borderClass} bg-slate-50/50 dark:bg-slate-900/30 p-6`}>
    <div className="flex items-center gap-3">
      <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${badgeClass}`}>
        {label}
      </span>
      <div>
        <h2 className="text-base font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded leading-none">{fullLabel}</h2>
        <p className="text-[10px] text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="space-y-6">{children}</div>
  </section>
);

export const APReviewCatalogView: React.FC<APReviewCatalogViewProps> = ({
  onBack,
  onSelectCourse,
  studentName = "Scholar",
}) => {
  const [filter, setFilter] = useState("");
  const [physicsCModal, setPhysicsCModal] = useState<CourseEntry | null>(null);
  const [calcModal, setCalcModal] = useState<CourseEntry | null>(null);
  const physicsDialog = useDialog({ onClose: () => setPhysicsCModal(null), labelledBy: 'physics-c-modal-title', open: physicsCModal !== null });
  const calcDialog = useDialog({ onClose: () => setCalcModal(null), labelledBy: 'calc-modal-title', open: calcModal !== null });
  const [starredSlugs, setStarredSlugs] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("sp_ap_starred_courses");
      return stored ? JSON.parse(stored) as string[] : [];
    } catch {
      return [];
    }
  });

  const handleToggleStar = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    setStarredSlugs(prev => {
      const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug];
      localStorage.setItem("sp_ap_starred_courses", JSON.stringify(next));
      return next;
    });
  };

  const handleCourseClick = (course: CourseEntry) => {
    if (course.isPhysicsC) {
      setPhysicsCModal(course);
    } else if (course.isCalcABBC) {
      setCalcModal(course);
    } else {
      onSelectCourse(course, null);
    }
  };

  const filteredCourses = filter.trim()
    ? COURSES.filter(c => c.displayName.toLowerCase().includes(filter.toLowerCase()))
    : null;

  const ibCourses = COURSES.filter(c => c.curriculumType === 'IB');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 text-left">
      {/* Header Area */}
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Practice Center
        </button>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Advanced Study Buddy</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed max-w-2xl">
              Hello {studentName}! Pick an AP or IB course catalog below. Chat Socratically with your mascot helper to review concepts exactly aligned with curriculum standards!
            </p>
          </div>
          <div className="w-full md:w-80 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search course standards..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 pl-11 pr-4 text-xs font-bold text-[#1A1C21] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Pinned section */}
      {starredSlugs.length > 0 && !filter && (
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-500" /> Pinned Advanced Tutors
          </h3>
          <CourseGrid
            courses={COURSES.filter(c => starredSlugs.includes(c.slug))}
            starredSlugs={starredSlugs}
            onCourseClick={handleCourseClick}
            onToggleStar={handleToggleStar}
          />
        </section>
      )}

      {/* Main catalog — grouped by curriculum */}
      <div className="space-y-8">
        {filteredCourses ? (
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Search Results</h3>
            {filteredCourses.length > 0 ? (
              <CourseGrid courses={filteredCourses} starredSlugs={starredSlugs} onCourseClick={handleCourseClick} onToggleStar={handleToggleStar} />
            ) : (
              <p className="text-slate-400 text-xs italic">No courses match your query.</p>
            )}
          </section>
        ) : (
          <>
            {/* ── AP ── */}
            <CurriculumSection
              id="curriculum-ap"
              label="AP"
              fullLabel="Advanced Placement"
              description="College Board · May exam · CED-aligned scoring"
              badgeClass="bg-blue-500/15 text-blue-600 dark:text-blue-400"
              borderClass="border-blue-500/20"
            >
              {SUBJECT_ORDER.map(subject => {
                const courses = (COURSES_BY_SUBJECT[subject] ?? []).filter(c => c.curriculumType === 'AP');
                if (courses.length === 0) return null;
                return (
                  <div key={subject} className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                      {SUBJECT_LABELS[subject]}
                    </h4>
                    <CourseGrid courses={courses} starredSlugs={starredSlugs} onCourseClick={handleCourseClick} onToggleStar={handleToggleStar} />
                  </div>
                );
              })}
            </CurriculumSection>

            {/* ── IB ── */}
            {ibCourses.length > 0 && (
              <CurriculumSection
                id="curriculum-ib"
                label="IB"
                fullLabel="International Baccalaureate"
                description="IB Organization · May / Nov exams · Command-term rubrics"
                badgeClass="bg-amber-500/15 text-amber-600 dark:text-amber-400"
                borderClass="border-amber-500/20"
              >
                <CourseGrid
                  courses={ibCourses}
                  starredSlugs={starredSlugs}
                  onCourseClick={handleCourseClick}
                  onToggleStar={handleToggleStar}
                />
              </CurriculumSection>
            )}
          </>
        )}
      </div>

      {/* Physics C Sub-modal */}
      <AnimatePresence>
        {physicsCModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setPhysicsCModal(null)}
          >
            <motion.div {...physicsDialog}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="bg-white dark:bg-[#15171C] border border-slate-100 dark:border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl text-left"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 id="physics-c-modal-title" className="text-2xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">AP Physics C</h2>
                <button aria-label="Close"
                  onClick={() => setPhysicsCModal(null)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-400 text-xs mb-6">Select which exam CED you are preparing for today:</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    onSelectCourse(physicsCModal, 'mechanics');
                    setPhysicsCModal(null);
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/40 hover:border-indigo-500/50 transition-all text-left"
                >
                  <span className="text-3xl">⚙️</span>
                  <div>
                    <p className="font-black text-sm text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Mechanics</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Kinematics, Newton's Laws, Rotational Motion</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onSelectCourse(physicsCModal, 'em');
                    setPhysicsCModal(null);
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/40 hover:border-indigo-500/50 transition-all text-left"
                >
                  <span className="text-3xl">🧲</span>
                  <div>
                    <p className="font-black text-sm text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Electricity & Magnetism</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Electrostatics, Circuits, Fields, Induction</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Calculus Sub-modal */}
        {calcModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setCalcModal(null)}
          >
            <motion.div {...calcDialog}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="bg-white dark:bg-[#15171C] border border-slate-100 dark:border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl text-left"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 id="calc-modal-title" className="text-2xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">AP Calculus</h2>
                <button aria-label="Close"
                  onClick={() => setCalcModal(null)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-400 text-xs mb-6">Select which exam standard you are preparing for today:</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    onSelectCourse(calcModal, 'ab');
                    setCalcModal(null);
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 hover:border-rose-500/50 transition-all text-left"
                >
                  <span className="text-3xl">📐</span>
                  <div>
                    <p className="font-black text-sm text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Calculus AB</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Limits, Derivatives, Fundamental Theorem</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onSelectCourse(calcModal, 'bc');
                    setCalcModal(null);
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 hover:border-rose-500/50 transition-all text-left"
                >
                  <span className="text-3xl">📈</span>
                  <div>
                    <p className="font-black text-sm text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Calculus BC</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">AB topics + Series, Polar, Vectors</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
