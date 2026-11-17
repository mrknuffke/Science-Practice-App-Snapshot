/**
 * Drift guards.
 *
 * Every one of these asserts a fact that exists in exactly one place in the
 * codebase and has, at least once, been silently copied somewhere else and left
 * to rot. They are cheap, they run in CI, and each maps to a real bug:
 *
 *  - hardcoded model strings   -> APReviewTutorView sat on gemini-2.5-flash for
 *                                 six weeks after the upgrade, because the July
 *                                 sweep grepped services/ and not components/.
 *  - docs naming a model       -> How It Works advertised Gemini 2.5 Flash, and
 *                                 DEVELOPER_GUIDE.md gemini-2.0-flash, long after
 *                                 DEFAULT_MODEL moved on.
 *  - counts typed into prose   -> "11 simulations" (13 shipped), "21 AP subjects"
 *                                 (28 AP and IB), "10+ practice modes" (16).
 *  - textbook triple manifest  -> lesson 1-2c was missing from one of the three
 *                                 copies, which silently killed its progress
 *                                 card, search entry, concept-map node, and
 *                                 review queue with no error of any kind.
 *  - names, not just counts    -> merging Coffee-Cup Calorimetry into the Thermal
 *                                 & Thermochemistry Studio kept the count at 16,
 *                                 so the count guard passed while CLAUDE.md went
 *                                 on listing a simulation that no longer existed
 *                                 and never listed the one that replaced it.
 *  - public routes             -> APP_PAGES in check-routes.mjs was a hand-copied
 *                                 snapshot of a map inside App.tsx, carrying a
 *                                 comment asking the next person to keep it in
 *                                 step by hand.
 *
 * If a guard here fails, fix the drift — do not loosen the guard.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { DEFAULT_MODEL, VISION_MODEL, formatModelName } from '../ai/core';
import { SIMULATIONS_REGISTRY } from '../../constants/simulationsRegistry';
import { MODES_METADATA } from '../../constants/modesRegistry';
import { COURSES } from '../../constants/apCourses';
import { VIEW_TO_PAGE, PUBLIC_PAGE_PARAMS } from '../../constants/publicRoutes';
import { TEXTBOOK_LESSONS } from '../../utils/textbookProgress';

const ROOT = join(__dirname, '..', '..');

const SKIP_DIRS = new Set([
  'node_modules', 'dist', 'build', 'coverage', '.git', 'public', 'docs', 'diagrams', 'scripts',
]);

function walk(dir: string, exts: string[], out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, exts, out);
    else if (exts.some(e => entry.endsWith(e))) out.push(full);
  }
  return out;
}

describe('AI model is defined in exactly one place', () => {
  // services/ai/core.ts owns both model ids. Nothing else may name a model,
  // except ChangelogView, whose entries are a dated historical record: "upgraded
  // to gemini-2.5-flash" stays true about April even after the app moves on. It
  // renders prose and never calls the API, so a stale id there cannot misroute a
  // request the way the APReviewTutorView one did.
  const ALLOWED = ['services/ai/core.ts', 'components/ChangelogView.tsx'];

  it('no source file hardcodes a gemini-* model string', () => {
    const offenders: string[] = [];
    for (const file of walk(ROOT, ['.ts', '.tsx'])) {
      const rel = relative(ROOT, file).split('\\').join('/');
      if (ALLOWED.includes(rel) || rel.includes('__tests__')) continue;
      const src = readFileSync(file, 'utf8');
      for (const m of src.matchAll(/['"`](gemini-[a-z0-9.-]+)['"`]/g)) {
        offenders.push(`${rel}: ${m[1]}`);
      }
    }
    expect(
      offenders,
      `Import DEFAULT_MODEL (or VISION_MODEL for image/PDF work) from services/ai/core.ts ` +
      `instead of naming a model inline:\n  ${offenders.join('\n  ')}`,
    ).toEqual([]);
  });

  it('exposes a display name for user-facing copy', () => {
    // Pages must render formatModelName(DEFAULT_MODEL), never a typed-out name.
    expect(formatModelName('gemini-3.6-flash')).toBe('Gemini 3.6 Flash');
    expect(formatModelName(VISION_MODEL)).toMatch(/^Gemini /);
  });
});

describe('documentation matches the code it describes', () => {
  const docs = ['CLAUDE.md', 'DEVELOPER_GUIDE.md', 'README.md'];

  it('no doc names a Gemini model the app no longer uses', () => {
    const live = new Set([DEFAULT_MODEL, VISION_MODEL]);
    const stale: string[] = [];
    for (const doc of docs) {
      const text = readFileSync(join(ROOT, doc), 'utf8');
      // CLAUDE.md used to carry its own change log, which was exempt as an
      // append-only record. That log now lives in docs/archive/, which this
      // list does not include, so the whole of each doc is checked.
      for (const m of text.matchAll(/`(gemini-[a-z0-9.-]+)`/g)) {
        // Experimental ids only ever appear as counter-examples ("NEVER use
        // gemini-2.5-flash-exp"), so naming a dead one there is the point.
        if (m[1].includes('-exp')) continue;
        if (!live.has(m[1])) stale.push(`${doc}: ${m[1]}`);
      }
    }
    expect(
      stale,
      `These docs name a model that is not DEFAULT_MODEL (${DEFAULT_MODEL}) or ` +
      `VISION_MODEL (${VISION_MODEL}):\n  ${stale.join('\n  ')}`,
    ).toEqual([]);
  });

  it('no doc states a count that contradicts its registry', () => {
    const claims: Array<[string, RegExp, number, string]> = [
      ['README.md', /Free Interactive Simulations \((\d+)\)/, SIMULATIONS_REGISTRY.length, 'SIMULATIONS_REGISTRY'],
      ['README.md', /\((\d+) AP & IB courses\)/, COURSES.length, 'COURSES'],
      ['README.md', /\*\*AI-Powered Tools \((\d+) dashboard modes/, MODES_METADATA.length, 'MODES_METADATA'],
      ['CLAUDE.md', /no sign-in required, (\d+) total/, SIMULATIONS_REGISTRY.length, 'SIMULATIONS_REGISTRY'],
    ];
    for (const [doc, pattern, actual, source] of claims) {
      const text = readFileSync(join(ROOT, doc), 'utf8');
      const match = text.match(pattern);
      expect(match, `${doc} no longer contains the phrase matching ${pattern}`).toBeTruthy();
      expect(
        Number(match![1]),
        `${doc} claims ${match![1]} but ${source} has ${actual}`,
      ).toBe(actual);
    }
  });
});

describe('the chemistry textbook has one lesson manifest', () => {
  // lessons.json is the only manifest. The dashboard (assets/dashboard.js) and the shared
  // runtime's previous and next links both read it at runtime. Until session 4c stage 1 chem
  // kept two more copies (index.html's MANIFEST_DATA and core.js's LESSONS_MANIFEST).
  const CHEM = join(ROOT, 'public', 'chem');

  it('the lesson count quoted in FeaturesView matches lessons.json', () => {
    // The textbook is a static site, so a component cannot import its manifest.
    // This count therefore has to be typed — which makes it exactly the kind of
    // fact that rots, so it is asserted here instead.
    const json = JSON.parse(readFileSync(join(CHEM, 'lessons.json'), 'utf8'));
    const count = (Array.isArray(json) ? json : json.lessons).length;
    const src = readFileSync(join(ROOT, 'components', 'FeaturesView.tsx'), 'utf8');
    const match = src.match(/(\d+) lessons of retrieval-practice/);
    expect(match, 'FeaturesView no longer quotes a textbook lesson count').toBeTruthy();
    expect(
      Number(match![1]),
      `FeaturesView says ${match![1]} lessons but lessons.json has ${count}`,
    ).toBe(count);
  });

  it('lessons.json is the only manifest; the dashboard reads it dynamically', () => {
    const json: Array<{ id: string }> = JSON.parse(
      readFileSync(join(CHEM, 'lessons.json'), 'utf8'),
    ).lessons ?? JSON.parse(readFileSync(join(CHEM, 'lessons.json'), 'utf8'));

    const canonical = (Array.isArray(json) ? json : []).map(l => l.id).filter(Boolean);
    expect(canonical.length, 'could not parse lesson ids out of lessons.json').toBeGreaterThan(0);

    const dashboardJs = readFileSync(join(CHEM, 'assets', 'dashboard.js'), 'utf8');
    expect(dashboardJs, 'the dashboard must dynamically fetch lessons.json').toMatch(/fetch\(['"]lessons\.json['"]\)/);

    // no second copy of the lesson list in any chem script or page
    for (const rel of ['assets/book.js', 'assets/dashboard.js', 'index.html']) {
      const text = readFileSync(join(CHEM, rel), 'utf8');
      expect(text, `${rel} holds its own lesson manifest; read lessons.json instead`).not.toMatch(/LESSONS_MANIFEST|MANIFEST_DATA\s*=\s*\{[^}]*slug/);
    }
  });

  it('TEXTBOOK_LESSONS in utils/textbookProgress.ts matches chem/lessons.json', () => {
    const json = JSON.parse(readFileSync(join(CHEM, 'lessons.json'), 'utf8'));
    const manifest: Array<{ id: string; slug: string }> = Array.isArray(json) ? json : json.lessons;
    const expected = manifest.map(l => ({ id: l.id, slug: l.slug })).sort((a, b) => a.id.localeCompare(b.id));
    const actual = TEXTBOOK_LESSONS.map(l => ({ id: l.id, slug: l.slug })).sort((a, b) => a.id.localeCompare(b.id));
    expect(
      actual,
      'TEXTBOOK_LESSONS in utils/textbookProgress.ts has drifted from public/chem/lessons.json',
    ).toEqual(expected);
  });
});

describe('the simulation list is generated, not retyped', () => {
  // CLAUDE.md carries a human-readable list of the simulations. It is fenced by
  // HTML comments so this guard can compare it to the registry name by name:
  // the count guard above cannot see a swap that leaves the total unchanged.
  const BEGIN = '<!-- BEGIN:SIMULATIONS';
  const END = '<!-- END:SIMULATIONS -->';

  // CLAUDE.md lists one per line; README.md joins them with a middot.
  const DOCS: Array<[string, (titles: string[]) => string, (block: string) => string[]]> = [
    ['CLAUDE.md',
      ts => ts.map(t => `- ${t}`).join('\n'),
      b => b.split('\n').map(l => l.trim()).filter(l => l.startsWith('- ')).map(l => l.slice(2).trim())],
    ['README.md',
      ts => ts.join(' \u00b7 '),
      b => b.split('\n').map(l => l.trim()).filter(Boolean).join(' ').split('\u00b7').map(t => t.trim()).filter(Boolean)],
  ];

  for (const [doc, render, parse] of DOCS) {
    it(`${doc} lists exactly the simulations in the registry`, () => {
      const text = readFileSync(join(ROOT, doc), 'utf8');
      const start = text.indexOf(BEGIN);
      const end = text.indexOf(END);
      expect(start, `${doc} lost its ${BEGIN} marker`).toBeGreaterThan(-1);
      expect(end, `${doc} lost its ${END} marker`).toBeGreaterThan(start);

      const listed = parse(text.slice(text.indexOf('-->', start) + 3, end));
      const expected = SIMULATIONS_REGISTRY.map(s => s.title);

      expect(
        listed,
        `${doc}'s simulation list has drifted from constants/simulationsRegistry.ts.\n` +
        `Replace the block between the markers with exactly:\n` + render(expected),
      ).toEqual(expected);
    });
  }
});

describe('the README mode list is generated, not retyped', () => {
  // Same reasoning as the simulation list: the mode count guard cannot see a
  // rename or a swap that leaves the total unchanged.
  const BEGIN = '<!-- BEGIN:MODES';
  const END = '<!-- END:MODES -->';

  it('README.md lists exactly the modes in MODES_METADATA', () => {
    const text = readFileSync(join(ROOT, 'README.md'), 'utf8');
    const start = text.indexOf(BEGIN);
    const end = text.indexOf(END);
    expect(start, `README.md lost its ${BEGIN} marker`).toBeGreaterThan(-1);
    expect(end, `README.md lost its ${END} marker`).toBeGreaterThan(start);

    const listed = text.slice(text.indexOf('-->', start) + 3, end)
      .split('\n').map(l => l.trim()).filter(Boolean).join(' ')
      .split('\u00b7').map(t => t.trim()).filter(Boolean);
    const expected = MODES_METADATA.map(m => m.title);

    expect(
      listed,
      `README.md's mode list has drifted from constants/modesRegistry.ts.\n` +
      `Replace the block between the markers with exactly:\n` + expected.join(' \u00b7 '),
    ).toEqual(expected);
  });
});

describe('public routes are checked by preflight', () => {
  // App.tsx builds ?page= URLs from VIEW_TO_PAGE; check-routes.mjs requests
  // them. The second list used to be a hand-copied snapshot of the first.
  it('every simulation in the registry has a shareable page', () => {
    const missing = SIMULATIONS_REGISTRY
      .filter(s => !VIEW_TO_PAGE[s.view])
      .map(s => `${s.title} (view: ${s.view})`);
    expect(
      missing,
      'These simulations have no entry in constants/publicRoutes.ts, so they ' +
      'have no shareable URL and preflight never requests them:\n  ' + missing.join('\n  '),
    ).toEqual([]);
  });

  it('check-routes.mjs requests every public page', () => {
    const src = readFileSync(join(ROOT, 'scripts', 'preflight', 'check-routes.mjs'), 'utf8');
    const block = src.slice(src.indexOf('const APP_PAGES = ['), src.indexOf('];', src.indexOf('const APP_PAGES = [')));
    const listed = [...block.matchAll(/'([a-z0-9_-]+)'/g)].map(m => m[1]).sort();
    expect(
      listed,
      'APP_PAGES in scripts/preflight/check-routes.mjs is out of step with ' +
      'PUBLIC_PAGE_PARAMS in constants/publicRoutes.ts. Expected:\n  ' +
      PUBLIC_PAGE_PARAMS.join(', '),
    ).toEqual(PUBLIC_PAGE_PARAMS);
  });
});

describe('every textbook is reachable and internally consistent', () => {
  // /physics/ shipped in Sept 2026 with no route check, no smoke test and no
  // drift guard: the whole subtree could 404 and preflight stayed green.
  const BOOKS = ['chem', 'physics', 'bio'];

  for (const root of BOOKS) {
    it(`${root}: every lesson in lessons.json is linked from the dashboard`, () => {
      const dir = join(ROOT, 'public', root);
      const { lessons } = JSON.parse(readFileSync(join(dir, 'lessons.json'), 'utf8'));
      const index = readFileSync(join(dir, 'index.html'), 'utf8');
      // A migrated book keeps its dashboard code in assets/book.js (RUNTIME_SPEC, section 2.2).
      const bookJs = join(dir, 'assets', 'book.js');
      // Chem's dashboard script is assets/dashboard.js.
      const dashJs = join(dir, 'assets', 'dashboard.js');
      const dashboardCode = index + (existsSync(bookJs) ? readFileSync(bookJs, 'utf8') : '') + (existsSync(dashJs) ? readFileSync(dashJs, 'utf8') : '');

      // If the dashboard dynamically fetches and renders from lessons.json at runtime,
      // verify that it fetches the manifest and defines the unit lesson containers.
      // Full runtime DOM link reachability for every lesson is asserted by tests/smoke/textbook.smoke.ts.
      if (dashboardCode.includes('lessons.json')) {
        expect(dashboardCode, `${root} dashboard references lessons.json but does not fetch it`).toMatch(/fetch\(['"]lessons\.json['"]\)/);
        expect(index, `${root} dashboard lacks unit lesson container`).toMatch(/data-unit-lessons|data-unit="/);
        return;
      }

      const unreachable = lessons
        .map((l: { slug: string }) => l.slug)
        .filter((slug: string) => !index.includes(`${slug}.html`));
      expect(
        unreachable,
        `These ${root} lessons exist in lessons.json but nothing on the dashboard ` +
        `links to them, so students cannot reach them:\n  ` + unreachable.join('\n  '),
      ).toEqual([]);
    });

    it(`${root}: has a public colophon, linked from the dashboard`, () => {
      // TEXTBOOK_DEV_GUIDE.md section 4: a student-visible change needs an entry
      // in CHANGELOG.md (engineering) AND about.html section 06 (public). That
      // policy is unenforceable for a book with no colophon, which is the state
      // physics shipped in. Nothing can check the two stay in step, but this at
      // least checks the page exists and is reachable.
      const dir = join(ROOT, 'public', root);
      expect(existsSync(join(dir, 'about.html')), `${root} has no about.html colophon`).toBe(true);
      // A book may list the colophon as a top-bar tool in assets/book.js instead of a link in the page.
      const bookJs = join(dir, 'assets', 'book.js');
      const index = readFileSync(join(dir, 'index.html'), 'utf8') + (existsSync(bookJs) ? readFileSync(bookJs, 'utf8') : '');
      expect(index.includes('about.html'), `${root}'s dashboard does not link its colophon`).toBe(true);
    });

    it(`${root}: every lesson slug in lessons.json exists on disk`, () => {
      const dir = join(ROOT, 'public', root);
      const { lessons } = JSON.parse(readFileSync(join(dir, 'lessons.json'), 'utf8'));
      const missing = lessons
        .map((l: { slug: string }) => l.slug)
        .filter((slug: string) => !existsSync(join(dir, 'lessons', `${slug}.html`)));
      expect(missing, `${root} lessons.json names files that do not exist`).toEqual([]);
    });

    it(`${root}: lesson and review counts in OpenResourcesView match lessons.json`, () => {
      const dir = join(ROOT, 'public', root);
      const { lessons } = JSON.parse(readFileSync(join(dir, 'lessons.json'), 'utf8'));
      const reviewCount = lessons.filter((l: { slug: string }) => l.slug.includes('-review')).length;
      const lessonCount = lessons.length - reviewCount;

      const src = readFileSync(join(ROOT, 'components', 'OpenResourcesView.tsx'), 'utf8');
      const blockMatch = src.match(new RegExp(`id:\\s*'${root}'[\\s\\S]*?lessons:\\s*(\\d+),\\s*reviews:\\s*(\\d+)`));
      expect(blockMatch, `OpenResourcesView.tsx is missing lessons/reviews counts for '${root}'`).toBeTruthy();
      expect(
        { lessons: Number(blockMatch![1]), reviews: Number(blockMatch![2]) },
        `OpenResourcesView.tsx counts for '${root}' do not match public/${root}/lessons.json`,
      ).toEqual({ lessons: lessonCount, reviews: reviewCount });
    });
  }
});

describe('textbook content invariants', () => {
  // An HTML tag inside an SVG <text> makes the HTML parser break out of foreign
  // content: the <text> closes early and everything after it is ejected into the
  // page below the drawing. It fails silently and looks like a layout bug.
  // Lived in 3-1c (<em>q</em>) and 5-1a.js (2 ν<sub>e</sub>) until Sept 2026.
  //
  // This is a source scan rather than a DOM check because much of the SVG is
  // built in JS template literals that only render once a widget is interacted
  // with, which no smoke test reaches.
  const BREAKOUT = /<text[^>]*>[^<]*<(sub|sup|em|strong|b|i)\b/g;

  const filesUnder = (dir: string, exts: string[], out: string[] = []): string[] => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) filesUnder(full, exts, out);
      else if (exts.some(e => entry.endsWith(e))) out.push(full);
    }
    return out;
  };

  it('no HTML tag sits inside an SVG <text> element', () => {
    const offenders: string[] = [];
    for (const book of ['chem', 'physics', 'bio']) {
      const dir = join(ROOT, 'public', book);
      if (!existsSync(dir)) continue;
      for (const file of filesUnder(dir, ['.html', '.js'])) {
        const src = readFileSync(file, 'utf8');
        for (const m of src.matchAll(BREAKOUT)) {
          offenders.push(`${relative(ROOT, file)}: <text>...<${m[1]}>`);
        }
      }
    }
    expect(
      offenders,
      'SVG <text> cannot contain HTML. Use <tspan> or a Unicode character ' +
      '(₂ ² ⁺ ⁻ ₑ):\n  ' + offenders.join('\n  '),
    ).toEqual([]);
  });
});

describe('Instant Explore and Universal Input are digital only', () => {
  it('UniversalInputView never includes worksheet in available modes', () => {
    const src = readFileSync(join(ROOT, 'components', 'UniversalInputView.tsx'), 'utf8');
    const match = src.match(/AVAILABLE_MODES\s*=\s*\[([\s\S]*?)\];/);
    expect(match).toBeTruthy();
    const modesBlock = match![1];
    expect(modesBlock).not.toContain("'worksheet'");
    expect(modesBlock).not.toContain('"worksheet"');
  });

  it('handleCustomStart in App.tsx always generates quiz mode', () => {
    const src = readFileSync(join(ROOT, 'App.tsx'), 'utf8');
    const match = src.match(/const handleCustomStart =[\s\S]*?startQuizGeneration\(([\s\S]*?)\);/);
    expect(match).toBeTruthy();
    expect(match![1]).toContain("'quiz'");
  });
});

