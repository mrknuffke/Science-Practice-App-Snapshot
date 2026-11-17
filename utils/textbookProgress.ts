/**
 * Utility for reading and parsing SAS General Chemistry textbook progress from localStorage.
 * Integrates with gc-textbook-progress without requiring any LLM API calls.
 */

export interface TextbookLessonMeta {
  id: string;
  slug: string;
  title: string;
  unit: string;
}

export const TEXTBOOK_LESSONS: TextbookLessonMeta[] = [
  { id: '1-1a', slug: '1-1a_atomic-structure-electron-config', title: 'Atomic Structure & Electron Configuration', unit: '1' },
  { id: '1-1b', slug: '1-1b_periodic-trends-reactivity', title: 'Periodic Trends & Reactivity', unit: '1' },
  { id: '1-2a', slug: '1-2a_bonding-electronegativity', title: 'Bonding & Electronegativity', unit: '1' },
  { id: '1-2b', slug: '1-2b_molecular-polarity', title: 'Molecular Polarity', unit: '1' },
  { id: '1-2c', slug: '1-2c_chemical-nomenclature', title: 'Chemical Nomenclature', unit: '1' },
  { id: '1-3a', slug: '1-3a_lewis-structures', title: 'Lewis Structures', unit: '1' },
  { id: '1-3b', slug: '1-3b_imfs-properties', title: 'IMFs & Properties', unit: '1' },
  { id: '1-2d', slug: '2-2a_physical-chemical-change', title: 'Physical vs. Chemical Change & Particle Diagrams', unit: '2' },
  { id: '1-2e', slug: '1-2e_reaction-types-balancing', title: 'Reaction Types & Balancing', unit: '2' },
  { id: '1-7a', slug: '2-7a_the-mole-molar-mass', title: 'The Mole & Molar Mass', unit: '2' },
  { id: '1-7b', slug: '2-7b_mole-conversions', title: 'Mole Conversions', unit: '2' },
  { id: '1-7c', slug: '2-7c_stoichiometry', title: 'Stoichiometry', unit: '2' },
  { id: '2-6a', slug: '2-6a_structure-property-argument', title: 'Structure → Property → Argument', unit: '2' },
  { id: '3-1a', slug: '3-1a_temperature-heat-specific-heat', title: 'Temperature, Heat & Specific Heat', unit: '3' },
  { id: '3-1b', slug: '3-1b_phase-changes-heating-curves', title: 'Heating Curves & Phase Transitions', unit: '3' },
  { id: '3-1c', slug: '3-1c_calorimetry-energy-systems', title: 'Calorimetry & Energy Systems', unit: '3' },
  { id: '3-4a', slug: '3-4a_thermal-equilibrium-heat-transfer', title: 'Thermal Equilibrium & Heat Transfer', unit: '3' },
  { id: '1-4a', slug: '3-14a_bond-energy-reaction-profiles', title: 'Bond Energy & Reaction Profiles', unit: '3' },
  { id: '1-5a', slug: '4-1a_reaction-rates-collision-theory', title: 'Reaction Rates & Collision Theory', unit: '4' },
  { id: '1-5b', slug: '4-1b_catalysis-and-enzymes', title: 'Catalysis & Enzymes', unit: '4' },
  { id: '1-6a', slug: '4-6a_dynamic-equilibrium-le-chatelier', title: 'Dynamic Equilibrium & Le Chatelier’s Principle', unit: '4' },
  { id: '1-6b', slug: '4-6b_human-equilibrium-blood-buffers', title: 'Human Equilibrium & Blood Buffers', unit: '4' },
  { id: 'E1-1a', slug: '5-1a_stellar-fusion-solar-energy', title: 'The Life & Energy of the Sun', unit: '5' },
  { id: 'E1-2a', slug: '5-2a_big-bang-cosmic-evidence', title: 'The Big Bang & Cosmic Evidence', unit: '5' },
  { id: 'E1-3a', slug: '5-3a_stellar-nucleosynthesis-element-origins', title: 'Stellar Nucleosynthesis & Element Origins', unit: '5' },
  { id: '1-8a', slug: '5-8a_nuclear-reactions-radioactive-decay', title: 'Nuclear Reactions & Radioactive Decay', unit: '5' },
  { id: '4-4a', slug: '5-4a_electromagnetic-radiation-matter', title: 'Electromagnetic Radiation & Matter', unit: '5' },
];

export interface ResumeInfo {
  lessonId: string;
  lessonTitle: string;
  lessonSlug: string;
  sectionId?: string;
  sectionLabel?: string;
  url: string;
  lastVisited?: number;
}

export interface TextbookProgressSummary {
  totalLessons: number;
  startedLessonsCount: number;
  completedCheckpointsCount: number;
  hasProgress: boolean;
  resume: ResumeInfo | null;
}

/**
 * Checks if a stored checkpoint value represents a completed checkpoint.
 * Supports legacy boolean (true) and modern SRS object ({ completed: true, ... }).
 */
export function isCheckpointComplete(val: unknown): boolean {
  if (val === true) return true;
  if (val && typeof val === 'object' && (val as { completed?: boolean }).completed === true) {
    return true;
  }
  return false;
}

/**
 * Counts all completed checkpoints for a single lesson's stored object.
 * Ignores bookkeeping keys starting with underscore (e.g. _resume, _total).
 */
export function countLessonCheckpoints(lessonData: Record<string, unknown> | undefined): number {
  if (!lessonData || typeof lessonData !== 'object') return 0;
  return Object.keys(lessonData).filter(k => !k.startsWith('_') && isCheckpointComplete(lessonData[k])).length;
}

/**
 * Reads gc-textbook-progress from localStorage (or provided storage) and produces a summary.
 */
export function getTextbookProgressSummary(
  customStorage?: Pick<Storage, 'getItem'> | null
): TextbookProgressSummary {
  const totalLessons = TEXTBOOK_LESSONS.length;
  let rawProgress: Record<string, Record<string, unknown>> = {};

  try {
    const storage = customStorage !== undefined ? customStorage : (typeof window !== 'undefined' ? window.localStorage : null);
    const stored = storage?.getItem('gc-textbook-progress');
    if (stored) {
      rawProgress = JSON.parse(stored) || {};
    }
  } catch {
    rawProgress = {};
  }

  let startedLessonsCount = 0;
  let completedCheckpointsCount = 0;
  let mostRecentResume: ResumeInfo | null = null;
  let latestTimestamp = -1;

  for (const lesson of TEXTBOOK_LESSONS) {
    const data = rawProgress[lesson.id];
    if (!data || typeof data !== 'object') continue;

    const count = countLessonCheckpoints(data);
    const resumeObj = data._resume as {
      index?: number;
      id?: string;
      label?: string;
      lastVisited?: number;
    } | undefined;

    const isStarted = count > 0 || !!resumeObj;
    if (isStarted) {
      startedLessonsCount++;
      completedCheckpointsCount += count;

      const visitTime = resumeObj?.lastVisited ?? 0;
      if (visitTime > latestTimestamp) {
        latestTimestamp = visitTime;
        const sectionAnchor = resumeObj?.id ? `#${resumeObj.id}` : '';
        mostRecentResume = {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonSlug: lesson.slug,
          sectionId: resumeObj?.id,
          sectionLabel: resumeObj?.label,
          url: `/chem/lessons/${lesson.slug}.html${sectionAnchor}`,
          lastVisited: visitTime,
        };
      }
    }
  }

  // Fallback: If progress exists but no _resume timestamp was found, pick the first started lesson
  if (!mostRecentResume && startedLessonsCount > 0) {
    for (const lesson of TEXTBOOK_LESSONS) {
      if (rawProgress[lesson.id]) {
        mostRecentResume = {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonSlug: lesson.slug,
          url: `/chem/lessons/${lesson.slug}.html`,
        };
        break;
      }
    }
  }

  return {
    totalLessons,
    startedLessonsCount,
    completedCheckpointsCount,
    hasProgress: startedLessonsCount > 0 || completedCheckpointsCount > 0,
    resume: mostRecentResume,
  };
}
