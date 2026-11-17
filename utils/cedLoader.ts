import { CourseEntry } from '../constants/apCourses';

export interface CedData {
  courseName: string;
  courseSlug?: string;
  practicesLabel?: string;
  practices?: string;
  sciencePractices?: string;
  units?: Array<{ unitNumber: string; unitTitle: string; examWeight: string; keyTopics?: string[] }>;
  examFormat?: { multipleChoice?: string; freeResponse?: string };
  antiPatterns?: string;
}

const cedsMap: Record<string, () => Promise<{ default?: unknown }>> = {
  'ap-african-american-studies': () => import('../constants/extracted-ceds/ap-african-american-studies.json'),
  'ap-biology': () => import('../constants/extracted-ceds/ap-biology.json'),
  'ap-calculus-ab-and-bc': () => import('../constants/extracted-ceds/ap-calculus-ab-and-bc.json'),
  'ap-chemistry': () => import('../constants/extracted-ceds/ap-chemistry.json'),
  'ap-chinese-language-and-culture': () => import('../constants/extracted-ceds/ap-chinese-language-and-culture.json'),
  'ap-comparative-government-and-politics': () => import('../constants/extracted-ceds/ap-comparative-government-and-politics.json'),
  'ap-computer-science-a': () => import('../constants/extracted-ceds/ap-computer-science-a.json'),
  'ap-english-language-and-composition': () => import('../constants/extracted-ceds/ap-english-language-and-composition.json'),
  'ap-english-literature-and-composition': () => import('../constants/extracted-ceds/ap-english-literature-and-composition.json'),
  'ap-environmental-science': () => import('../constants/extracted-ceds/ap-environmental-science.json'),
  'ap-french-language-and-culture': () => import('../constants/extracted-ceds/ap-french-language-and-culture.json'),
  'ap-macroeconomics': () => import('../constants/extracted-ceds/ap-macroeconomics.json'),
  'ap-microeconomics': () => import('../constants/extracted-ceds/ap-microeconomics.json'),
  'ap-physics-1': () => import('../constants/extracted-ceds/ap-physics-1.json'),
  'ap-physics-2': () => import('../constants/extracted-ceds/ap-physics-2.json'),
  'ap-physics-c-electricity-and-magnetism': () => import('../constants/extracted-ceds/ap-physics-c-electricity-and-magnetism.json'),
  'ap-physics-c-mechanics': () => import('../constants/extracted-ceds/ap-physics-c-mechanics.json'),
  'ap-spanish-language-and-culture': () => import('../constants/extracted-ceds/ap-spanish-language-and-culture.json'),
  'ap-statistics': () => import('../constants/extracted-ceds/ap-statistics.json'),
  'ap-us-government-and-politics': () => import('../constants/extracted-ceds/ap-us-government-and-politics.json'),
  'ap-us-history': () => import('../constants/extracted-ceds/ap-us-history.json'),
  // IB Sciences
  'ib-biology-sl': () => import('../constants/extracted-ceds/ib-biology-sl.json'),
  'ib-biology-hl': () => import('../constants/extracted-ceds/ib-biology-hl.json'),
  'ib-chemistry-sl': () => import('../constants/extracted-ceds/ib-chemistry-sl.json'),
  'ib-chemistry-hl': () => import('../constants/extracted-ceds/ib-chemistry-hl.json'),
  'ib-physics-sl': () => import('../constants/extracted-ceds/ib-physics-sl.json'),
  'ib-physics-hl': () => import('../constants/extracted-ceds/ib-physics-hl.json'),
  'ib-environmental-systems-and-societies-sl': () => import('../constants/extracted-ceds/ib-environmental-systems-and-societies-sl.json'),
  'ib-environmental-systems-and-societies-hl': () => import('../constants/extracted-ceds/ib-environmental-systems-and-societies-hl.json'),
};

export async function loadCedJson(stem: string): Promise<CedData | null> {
  try {
    const importFn = cedsMap[stem];
    if (!importFn) return null;
    const mod = await importFn();
    return (mod.default || mod) as CedData;
  } catch (e) {
    console.error(`Failed to dynamically load CED JSON for stem: ${stem}`, e);
    return null;
  }
}

export async function loadCedData(entry: CourseEntry, examParam?: string | null): Promise<CedData | null> {
  if (entry.isPhysicsC && Array.isArray(entry.cedFile)) {
    const [mechFile, emFile] = entry.cedFile as string[];
    const mechData = await loadCedJson(mechFile);
    const emData = await loadCedJson(emFile);

    if (!mechData && !emData) return null;

    const examLabel = examParam === 'em'
      ? 'AP Physics C: Electricity and Magnetism'
      : 'AP Physics C: Mechanics';

    const primaryData = examParam === 'em' ? emData : mechData;
    const secondaryData = examParam === 'em' ? mechData : emData;
    const secondaryLabel = examParam === 'em' ? 'Mechanics' : 'E&M';

    return {
      courseName: examLabel,
      courseSlug: entry.slug,
      practicesLabel: 'Science Practices',
      practices: primaryData?.practices ?? primaryData?.sciencePractices
        ?? 'Calculus-based mechanics and electromagnetism with emphasis on Mathematical Routines and Argumentation.',
      units: primaryData?.units ?? [],
      examFormat: primaryData?.examFormat ?? { multipleChoice: '35 MCQ, 45 min, 50%', freeResponse: '3 FRQ, 45 min, 50%' },
      antiPatterns: [
        primaryData?.antiPatterns ?? '',
        secondaryData
          ? `Note: ${secondaryLabel} topics are covered by a separate exam and are out of scope for this session.`
          : '',
      ].filter(Boolean).join(' '),
    };
  }

  const stem = typeof entry.cedFile === 'string' ? entry.cedFile : entry.cedFile[0];
  return loadCedJson(stem);
}

export function buildCedBlock(cedData: CedData, entry: CourseEntry): string {
  const practicesLabel = cedData.practicesLabel ?? 'Core Practices';
  const practicesText = cedData.practices ?? cedData.sciencePractices ?? '';

  const unitsText = cedData.units && cedData.units.length > 0
    ? cedData.units.map(u => {
        const header = `  Unit ${u.unitNumber}: ${u.unitTitle} (${u.examWeight})`;
        const topics = u.keyTopics && u.keyTopics.length > 0
          ? '\n' + u.keyTopics.map(t => `    - ${t}`).join('\n')
          : '';
        return header + topics;
      }).join('\n')
    : '  (Unit data not available — use your general knowledge of the CED)';

  const calcNote = (entry.subjectArea === 'science' && entry.slug.includes('physics-c'))
    ? '\nIMPORTANT: This is a CALCULUS-BASED course. Always use derivatives and integrals. Never use algebra-only solutions.'
    : '';

  return `## COURSE SCOPE: ${cedData.courseName}

### Unit Structure & Exam Weighting:
${unitsText}

### ${practicesLabel}:
${practicesText}

### Exam Format:
- Multiple Choice: ${cedData.examFormat?.multipleChoice ?? 'See CED'}
- Free Response: ${cedData.examFormat?.freeResponse ?? 'See CED'}
${calcNote}
### Topics Outside CED Scope (NEVER assess these):
${cedData.antiPatterns ?? 'Avoid topics not listed in the unit structure above.'}`;
}
