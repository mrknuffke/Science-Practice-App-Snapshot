/**
 * Guards on the documentation itself.
 *
 * The rules an agent follows are only as good as its ability to find them. Each
 * guard here maps to a way that stopped being true:
 *
 *  - dead / case-wrong links  -> CLAUDE.md pointed at DESIGN_System.md,
 *                                release_checklist.md and
 *                                Feature_addition_checklist.md. All three
 *                                resolve on macOS and 404 on GitHub and on any
 *                                case-sensitive checkout, so the links worked
 *                                for exactly one reader.
 *  - a second rulebook        -> .agent/rules/development-workflow.md grew its
 *                                own copy of the rendering invariants, in a
 *                                format only Antigravity reads. The two drifted;
 *                                two of its rules were being violated in the
 *                                shipped textbook because the file naming the
 *                                rule was not the file anyone was told to read.
 *  - CLAUDE.md size           -> it reached 116 KB, of which 78 KB was an
 *                                out-of-order change log. Its own Drift Guards
 *                                section argues that a long list gets skimmed.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, relative, resolve } from 'path';

const ROOT = join(__dirname, '..', '..');

const SKIP = new Set(['node_modules', 'dist', 'build', 'coverage', '.git', 'test-results']);

function markdownFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) markdownFiles(full, out);
    else if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

/** Case-sensitive existence check, so macOS agrees with Linux and GitHub. */
function existsExactly(path: string): boolean {
  if (!existsSync(path)) return false;
  const parent = dirname(path);
  const name = path.slice(parent.length + 1);
  try {
    return readdirSync(parent).includes(name);
  } catch {
    return false;
  }
}

describe('documentation links resolve', () => {
  it('every relative markdown link points at a file that exists, with matching case', () => {
    const broken: string[] = [];
    for (const file of markdownFiles(ROOT)) {
      const rel = relative(ROOT, file).split('\\').join('/');
      const text = readFileSync(file, 'utf8');
      for (const m of text.matchAll(/\]\(([^)]+)\)/g)) {
        const target = m[1].split('#')[0].trim();
        if (!target) continue;
        if (/^(https?:|mailto:|tel:|data:)/.test(target)) continue;
        const abs = resolve(dirname(file), decodeURIComponent(target));
        if (!existsExactly(abs)) {
          broken.push(`${rel} -> ${target}`);
        }
      }
    }
    expect(
      broken,
      'These markdown links do not resolve (a case-only mismatch still counts: ' +
      'it works on macOS and 404s on GitHub and Linux):\n  ' + broken.join('\n  '),
    ).toEqual([]);
  });
});

describe('documentation file references resolve', () => {
  // DEVELOPER_GUIDE.md pointed at `docs/OAUTH_MIGRATION_PLAN.md` in backticks
  // rather than as a link, so the markdown-link guard above could not see it
  // when that file moved to docs/archive/.
  it('every backticked path that looks like a repo path exists', () => {
    const PATHISH = /`((?:[A-Za-z0-9_.-]+\/)+[A-Za-z0-9_.-]+\.(?:ts|tsx|js|mjs|cjs|json|css|html|md|sh|yml))`/g;
    const broken: string[] = [];
    for (const file of markdownFiles(ROOT)) {
      const rel = relative(ROOT, file).split('\\').join('/');
      // Archived documents describe a repo layout that no longer exists; that
      // is the point of an archive. docs/archive/README.md is current, though.
      if (rel.startsWith('docs/archive/') && rel !== 'docs/archive/README.md') continue;
      for (const m of readFileSync(file, 'utf8').matchAll(PATHISH)) {
        const target = m[1];
        // Only check paths rooted at the repo, not illustrative fragments.
        if (!existsExactly(join(ROOT, target)) && /^(components|services|constants|utils|hooks|api|scripts|tests|docs|public|contexts)\//.test(target)) {
          broken.push(`${rel} -> ${target}`);
        }
      }
    }
    expect(
      broken,
      'These docs name a repo path that does not exist:\n  ' + broken.join('\n  '),
    ).toEqual([]);
  });
});

describe('there is one rulebook, not several', () => {
  // .agent/rules/* are loaded by Antigravity, never by Claude Code. They must
  // stay pointers to the canonical docs so the two cannot drift apart again.
  const AGENT_RULES = join(ROOT, '.agent', 'rules');

  it('.agent/rules files stay pointers to the canonical docs', () => {
    const offenders: string[] = [];
    for (const entry of readdirSync(AGENT_RULES)) {
      if (!entry.endsWith('.md')) continue;
      const text = readFileSync(join(AGENT_RULES, entry), 'utf8');
      const lines = text.split('\n').length;
      if (lines > 40) {
        offenders.push(`${entry}: ${lines} lines — too long to be a pointer`);
      }
      if (!/CLAUDE\.md/.test(text)) {
        offenders.push(`${entry}: does not point at CLAUDE.md`);
      }
    }
    expect(
      offenders,
      'A file in .agent/rules/ has grown back into a second rulebook. Rules go in ' +
      'CLAUDE.md (workflow) or docs/RENDERING_GOTCHAS.md (invariants), with a ' +
      'guard, and .agent/rules/ points at them:\n  ' + offenders.join('\n  '),
    ).toEqual([]);
  });

  it('the canonical docs every pointer names actually exist', () => {
    for (const doc of [
      'CLAUDE.md',
      'docs/RENDERING_GOTCHAS.md',
      'docs/textbook/TEXTBOOK_DEV_GUIDE.md',
      'docs/textbook/PHYSICS_DEV_GUIDE.md',
      'docs/textbook/BIOLOGY_DEV_GUIDE.md',
      'docs/archive/README.md',
    ]) {
      expect(existsExactly(join(ROOT, doc)), `${doc} is missing`).toBe(true);
    }
  });
});

describe('CLAUDE.md stays readable', () => {
  it('is instructions, not an archive', () => {
    const text = readFileSync(join(ROOT, 'CLAUDE.md'), 'utf8');
    const kb = Buffer.byteLength(text) / 1024;
    expect(
      kb,
      `CLAUDE.md is ${kb.toFixed(0)} KB. It hit 116 KB once by accumulating a ` +
      `change log; dated entries belong in docs/archive/CLAUDE_HISTORY.md. If the ` +
      `instructions themselves have genuinely outgrown this budget, split them ` +
      `into docs/ and link out — do not just raise the number.`,
    ).toBeLessThan(22);
  });
});

describe('textbook changelog and colophons stay in step', () => {
  // TEXTBOOK_DEV_GUIDE.md section 4: every student-visible textbook change must
  // be recorded in both docs/textbook/CHANGELOG.md (engineering) and about.html
  // section 06 (public). This guard asserts that each book's colophon has not
  // stopped being updated: its most recent entry date must be at least as recent
  // as the most recent entry in CHANGELOG.md mentioning that book.
  const BOOKS = [
    { root: 'chem', keywords: [/\bchem(?:istry)?\b/i, /\/chem\//] },
    { root: 'physics', keywords: [/\bphysics\b/i, /\bphysica\b/i, /\/physics\//] },
    { root: 'bio', keywords: [/\bbio(?:logy)?\b/i, /\/bio\//] },
  ];

  const MONTHS: Record<string, string> = {
    January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
    July: '07', August: '08', September: '09', October: '10', November: '11', December: '12',
  };

  function parseHumanDate(str: string): string {
    const parts = str.trim().split(/\s+/);
    if (parts.length < 3) return '';
    const day = parts[0].padStart(2, '0');
    const month = MONTHS[parts[1]] || '00';
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }

  for (const { root, keywords } of BOOKS) {
    it(`${root}: colophon latest version date is not older than changelog`, () => {
      const colophonHtml = readFileSync(join(ROOT, 'public', root, 'about.html'), 'utf8');
      const dateMatches = [...colophonHtml.matchAll(/(?:<span class="date">|<div class="rel-date">)([^<]+)/g)];
      expect(dateMatches.length, `${root} about.html has no version history dates`).toBeGreaterThan(0);
      const colophonDates = dateMatches.map(m => parseHumanDate(m[1])).filter(d => d > '2000-01-01').sort().reverse();
      const latestColophonDate = colophonDates[0];

      // Parse CHANGELOG.md entries
      const changelog = readFileSync(join(ROOT, 'docs', 'textbook', 'CHANGELOG.md'), 'utf8');
      const entryBlocks = changelog.split(/\n(?=- \*\*\d{4}-\d{2}-\d{2}\*\*)/);
      let latestChangelogDate = '';

      for (const block of entryBlocks) {
        const dateMatch = block.match(/^- \*\*(\d{4}-\d{2}-\d{2})\*\*/);
        if (!dateMatch) continue;
        const date = dateMatch[1];
        const mentionsBook = keywords.some(k => k.test(block));
        if (mentionsBook) {
          if (!latestChangelogDate || date > latestChangelogDate) {
            latestChangelogDate = date;
          }
        }
      }

      expect(latestChangelogDate, `could not find any CHANGELOG.md entry for ${root}`).toBeTruthy();
      expect(
        latestColophonDate >= latestChangelogDate,
        `${root} colophon latest version date (${latestColophonDate}) is older than ` +
        `the most recent student-visible changelog entry (${latestChangelogDate}). ` +
        `Per TEXTBOOK_DEV_GUIDE.md section 4, update public/${root}/about.html section 06.`,
      ).toBe(true);
    });
  }
});

