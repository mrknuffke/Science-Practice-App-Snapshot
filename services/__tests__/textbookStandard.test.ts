import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

/**
 * Guards for docs/textbook/STYLE_STANDARD.md and docs/textbook/RUNTIME_SPEC.md.
 *
 * The Phase 2 audit found 4,986 inline style attributes, 1,500 lines of
 * per-lesson <style> blocks and 14 animation loops that never stop, across 42
 * pages. None of it was caught at the time, because each lesson looked fine on
 * its own. These guards make the totals visible and one-directional.
 *
 * Two kinds of check live here:
 *
 *  1. RATCHETS (every book, from today). Counts are compared with
 *     textbookStandard.baseline.json. A count may never rise. When a count
 *     falls, the baseline is stale and must be lowered, so the gain cannot be
 *     lost again. Lower it with:
 *
 *       UPDATE_TEXTBOOK_BASELINE=1 npx vitest run services/__tests__/textbookStandard.test.ts
 *
 *     That command only ever lowers a number or removes an entry. A new lesson
 *     gets no allowance: it has to be clean.
 *
 *  2. STRICT CHECKS, switched on per book in two stages, because a book moves
 *     in three commits (markup, then content, then sims):
 *
 *     - "migrated": the book runs on the shared runtime. It must load the
 *       shared files in order and keep no copy of a shared component. A Phase 4
 *       session adds its book here in the markup commit.
 *     - "finished": the book's content and sims meet the standard. Every sim
 *       is built on the sim helper, and multiple-choice options are balanced
 *       with the key spread. The session adds its book here after the sims
 *       commit. A finished book must also be migrated.
 */

const ROOT = path.resolve(__dirname, '../..');
const BASELINE_PATH = path.join(__dirname, 'textbookStandard.baseline.json');
const UPDATE = process.env.UPDATE_TEXTBOOK_BASELINE === '1';
const BOOKS = ['chem', 'physics', 'bio'];

type Counts = Record<string, number>;

interface Baseline {
	migrated: string[];
	finished: string[];
	lessons: Record<string, Counts>;
	unregisteredLoops: string[];
	unresolvedTerms: string[];
}

// ---------------------------------------------------------------- counting

/** Selectors and references that look like hex colours and are not. */
function stripNonColours(src: string): string {
	return src
		.replace(/&#x?[0-9a-fA-F]+;/g, '')
		.replace(/url\(\s*['"]?#[^)]*\)/g, '')
		.replace(/\b(?:href|xlink:href|for|data-[a-z-]+|aria-[a-z-]+)\s*=\s*"#[^"]*"/g, '')
		.replace(/\b(?:querySelector(?:All)?|closest|matches|getElementById)\(\s*(['"`])[^'"`]*\1/g, '');
}

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;

function count(src: string, re: RegExp): number {
	return (src.match(re) || []).length;
}

/** Inline style is allowed only to set a diagram token (standard, section 5.5). */
function styleAttributes(html: string): string[] {
	return [...html.matchAll(/\sstyle\s*=\s*"([^"]*)"/g)]
		.map((m) => m[1])
		.filter((value) => !value.includes('var(--dia-'));
}

export function countHtml(html: string): Counts {
	const styles = styleAttributes(html);
	const blocks = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
	const inlineScripts = [...html.matchAll(/<script\b([^>]*)>/g)].filter(
		(m) => !/\bsrc\s*=/.test(m[1]) && !/application\/json/.test(m[1]),
	);
	return {
		styleAttrs: styles.length,
		fontSize: styles.filter((s) => /font-size/.test(s)).length,
		fontFamily: styles.filter((s) => /font-family/.test(s)).length,
		hex: count(stripNonColours(html), HEX),
		styleBlockLines: blocks.reduce((n, b) => n + b.split('\n').length, 0),
		inlineScripts: inlineScripts.length,
	};
}

export function countJs(js: string): Counts {
	const code = js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
	return {
		hex: count(stripNonColours(code), HEX),
		styleWrites: count(code, /\.style\.(?:[a-zA-Z]+\s*=[^=]|setProperty\()/g),
	};
}

function lessonFiles(book: string): string[] {
	const dir = path.join(ROOT, 'public', book, 'lessons');
	return fs
		.readdirSync(dir)
		.filter((f) => /\.(html|js)$/.test(f) && !f.startsWith('_'))
		.sort()
		.map((f) => `${book}/${f}`);
}

function read(rel: string): string {
	return fs.readFileSync(path.join(ROOT, 'public', rel.replace(/^([a-z]+)\//, '$1/lessons/')), 'utf8');
}

function currentCounts(): Record<string, Counts> {
	const out: Record<string, Counts> = {};
	for (const book of BOOKS) {
		for (const rel of lessonFiles(book)) {
			out[rel] = rel.endsWith('.html') ? countHtml(read(rel)) : countJs(read(rel));
		}
	}
	return out;
}

// ------------------------------------------------------------ sim loops

const REGISTERS = /TB\.sim\.create/;

/** Code without comments, so a header that says "Built on TB.sim.create" never counts as the call. */
export function code(js: string): string {
	return js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function currentUnregisteredLoops(): string[] {
	return BOOKS.flatMap((book) =>
		lessonFiles(book).filter((rel) => {
			if (!rel.endsWith('.js')) return false;
			const js = code(read(rel));
			return /requestAnimationFrame/.test(js) && !REGISTERS.test(js);
		}),
	);
}

// ------------------------------------------------------- glossary terms

function glossaryKeys(book: string): Set<string> {
	const file = path.join(ROOT, 'public', book, 'assets', 'glossary.js');
	const win: Record<string, unknown> = {};
	vm.runInNewContext(fs.readFileSync(file, 'utf8'), { window: win });
	const glossary = Object.entries(win).find(([name]) => name.endsWith('GLOSSARY'));
	return new Set(Object.keys((glossary?.[1] as Record<string, unknown>) ?? {}));
}

/** Mirrors getSlug in each book's core.js. */
export function termSlug(attrs: string, inner: string): string {
	const override = attrs.match(/data-term\s*=\s*"([^"]*)"/);
	if (override) return override[1];
	return inner
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&[a-z0-9#]+;/gi, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-');
}

function currentUnresolvedTerms(): string[] {
	const out = new Set<string>();
	for (const book of BOOKS) {
		const keys = glossaryKeys(book);
		for (const rel of lessonFiles(book)) {
			if (!rel.endsWith('.html')) continue;
			const terms = read(rel).matchAll(/<strong\b([^>]*\bclass="[^"]*\bterm\b[^"]*"[^>]*)>([\s\S]*?)<\/strong>/g);
			for (const [, attrs, inner] of terms) {
				const slug = termSlug(attrs, inner);
				if (!keys.has(slug)) out.add(`${rel}: ${slug}`);
			}
		}
	}
	return [...out].sort();
}

// ------------------------------------------------------------- baseline

function loadBaseline(): Baseline {
	const now = {
		lessons: currentCounts(),
		unregisteredLoops: currentUnregisteredLoops(),
		unresolvedTerms: currentUnresolvedTerms(),
	};
	if (!fs.existsSync(BASELINE_PATH)) {
		if (!UPDATE) throw new Error(`${BASELINE_PATH} is missing. Restore it from git.`);
		const first: Baseline = { migrated: [], finished: [], ...now };
		fs.writeFileSync(BASELINE_PATH, JSON.stringify(first, null, '\t') + '\n');
		return first;
	}
	const saved = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8')) as Baseline;
	if (!UPDATE) return saved;

	// Lower only. A file with no entry gets none, so it must be clean.
	const lessons: Record<string, Counts> = {};
	for (const [rel, counts] of Object.entries(now.lessons)) {
		const old = saved.lessons[rel];
		if (!old) continue;
		lessons[rel] = Object.fromEntries(
			Object.entries(counts).map(([k, v]) => [k, Math.min(v, old[k] ?? 0)]),
		);
	}
	const next: Baseline = {
		migrated: saved.migrated,
		finished: saved.finished,
		lessons,
		unregisteredLoops: saved.unregisteredLoops.filter((f) => now.unregisteredLoops.includes(f)),
		unresolvedTerms: saved.unresolvedTerms.filter((t) => now.unresolvedTerms.includes(t)),
	};
	fs.writeFileSync(BASELINE_PATH, JSON.stringify(next, null, '\t') + '\n');
	return next;
}

const HOW_TO_LOWER =
	'Lower the baseline: UPDATE_TEXTBOOK_BASELINE=1 npx vitest run services/__tests__/textbookStandard.test.ts';

function diffLists(now: string[], allowed: string[]): { added: string[]; fixed: string[] } {
	return {
		added: now.filter((x) => !allowed.includes(x)),
		fixed: allowed.filter((x) => !now.includes(x)),
	};
}

// ----------------------------------------------------- strict helpers

export const SHARED_HEAD = [
	'../../textbook/theme-boot.js',
	'../../textbook/base.css',
	'../../textbook/lesson.css',
	'../assets/tokens.css',
	'../assets/components.css',
];
export const SHARED_BODY = [
	'../assets/book.js',
	'../../textbook/core.js',
	'../../textbook/widgets.js',
	'../../textbook/sim.js',
	'../assets/glossary.js',
];
/** A book's dashboard and colophon (RUNTIME_SPEC 2.3, "Non-lesson pages"). */
export const PAGE_ORDER = [
	'../textbook/theme-boot.js',
	'../textbook/base.css',
	'assets/tokens.css',
	'assets/components.css',
	'assets/book.js',
	'../textbook/core.js',
];

/** Returns the first required file that is missing, out of order or versioned, or null. */
export function loadOrderProblem(html: string, order: string[] = [...SHARED_HEAD, ...SHARED_BODY]): string | null {
	const refs = [...html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)\s*=\s*"([^"]+)"/g)].map((m) => m[1]);
	const versioned = refs.find((r) => r.includes('?') && order.includes(r.split('?')[0]));
	if (versioned) return `${versioned} has a query string (no ?v= on shared files)`;
	const loaded = refs.map((r) => r.split('?')[0]);
	let last = -1;
	for (const file of order) {
		const at = loaded.indexOf(file);
		if (at === -1) return `missing ${file}`;
		if (at < last) return `${file} is loaded out of order`;
		last = at;
	}
	return null;
}

/** Selectors owned by the shared stylesheets. A book stylesheet must not redefine them. */
export const SHARED_SELECTORS = [
	'body', 'h1', 'h2', 'h3', 'h4', '.hero', '.section-tag', '.callout', '.brief', '.enrichment',
	'.btn', '.chip', '.sim-box', '.sim-stage', '.sim-controls', '.readout', '.status-pill',
	'.data-table', '.eq-display', '.w-opt', '.recall', '.exam-frame',
];

export function redefinedSelectors(css: string): string[] {
	const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
	const heads = [...clean.matchAll(/(?:^|[{}])\s*([^{}@]+?)\s*\{/g)].flatMap((m) => m[1].split(',').map((s) => s.trim()));
	return SHARED_SELECTORS.filter((sel) => heads.includes(sel));
}

interface Option { label?: string; correct?: boolean; feedback?: string }

/** Standard 8.4: feedback opens with the reason, never with a verdict. */
export const VERDICT_OPENER = /^\s*(?:<[^>]+>\s*)*(Right|Correct|Incorrect|Wrong|Yes|No|Exactly|Great|Good job|Well done|Perfect|Excellent|Not quite)\b/;

function words(label: string): number {
	return label.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
}

/** Standard, section 8.4: balanced lengths and a Tier 3 cap. Returns a problem or null. */
export function optionProblem(options: Option[]): string | null {
	const lengths = options.map((o) => words(o.label ?? ''));
	const longest = Math.max(...lengths);
	const shortest = Math.min(...lengths);
	if (longest > 22) return `an option has ${longest} words (cap 22)`;
	if (shortest > 6 && longest / shortest > 1.8) return `options run from ${shortest} to ${longest} words (limit 1.8x)`;
	return null;
}

function choiceQuestions(html: string): Option[][] {
	const out: Option[][] = [];
	for (const [, json] of html.matchAll(/<script\b[^>]*class="w-config"[^>]*>([\s\S]*?)<\/script>/g)) {
		let config: { options?: Option[]; items?: { options?: Option[] }[] };
		try {
			config = JSON.parse(json);
		} catch {
			continue;
		}
		if (Array.isArray(config.options)) out.push(config.options);
		for (const item of config.items ?? []) if (Array.isArray(item.options)) out.push(item.options);
	}
	return out.filter((opts) => opts.some((o) => o.correct === true));
}

/** No one letter may be the key for more than half of the questions (of a book, or of a lesson with `min` set lower). */
export function keySpreadProblem(keys: number[], min = 6): string | null {
	if (keys.length < min) return null;
	const tally = new Map<number, number>();
	for (const k of keys) tally.set(k, (tally.get(k) ?? 0) + 1);
	for (const [k, n] of tally) {
		if (n / keys.length > 0.5) return `${String.fromCharCode(65 + k)} is the key in ${n} of ${keys.length} questions`;
	}
	return null;
}

// ================================================================ tests

const baseline = loadBaseline();

describe('textbook ratchet: inline styling never grows', () => {
	const now = currentCounts();

	it('no lesson has more inline styling, hex colours or inline scripts than its baseline', () => {
		const worse: string[] = [];
		for (const [rel, counts] of Object.entries(now)) {
			const allowed = baseline.lessons[rel] ?? {};
			for (const [metric, value] of Object.entries(counts)) {
				const max = allowed[metric] ?? 0;
				if (value > max) worse.push(`${rel}: ${metric} rose from ${max} to ${value}`);
			}
		}
		expect(
			worse,
			'Textbook lessons take their look from shared components, not from inline styles, <style> blocks, ' +
				'hex colours or inline scripts (docs/textbook/STYLE_STANDARD.md, sections 1 and 5.5). ' +
				'Use a component class or a token:\n  ' + worse.join('\n  '),
		).toEqual([]);
	});

	it('the baseline is not stale', () => {
		const better: string[] = [];
		for (const [rel, allowed] of Object.entries(baseline.lessons)) {
			const counts = now[rel];
			if (!counts) {
				better.push(`${rel}: file is gone`);
				continue;
			}
			for (const [metric, max] of Object.entries(allowed)) {
				if ((counts[metric] ?? 0) < max) better.push(`${rel}: ${metric} fell from ${max} to ${counts[metric] ?? 0}`);
			}
		}
		expect(better, `These counts improved. ${HOW_TO_LOWER}\n  ` + better.join('\n  ')).toEqual([]);
	});
});

describe('textbook sims: every animation loop is registered', () => {
	const { added, fixed } = diffLists(currentUnregisteredLoops(), baseline.unregisteredLoops);

	it('no new lesson script runs requestAnimationFrame without registering it', () => {
		expect(
			added,
			'A loop that is not registered keeps running off screen. Build the sim on TB.sim.create ' +
				'(docs/textbook/RUNTIME_SPEC.md, section 4.3):\n  ' + added.join('\n  '),
		).toEqual([]);
	});

	it('the list of known unregistered loops is not stale', () => {
		expect(fixed, `These scripts now register their loop. ${HOW_TO_LOWER}\n  ` + fixed.join('\n  ')).toEqual([]);
	});
});

describe('textbook glossary: every marked term has an entry', () => {
	const { added, fixed } = diffLists(currentUnresolvedTerms(), baseline.unresolvedTerms);

	it('no new <strong class="term"> is missing from its book glossary', () => {
		expect(
			added,
			'A term with no glossary entry shows a dashed underline and nothing else. Add the entry to the ' +
				"book's assets/glossary.js, or set data-term to an existing key:\n  " + added.join('\n  '),
		).toEqual([]);
	});

	it('the list of known unresolved terms is not stale', () => {
		expect(fixed, `These terms now resolve. ${HOW_TO_LOWER}\n  ` + fixed.join('\n  ')).toEqual([]);
	});
});

describe('textbook strict checks: helpers', () => {
	const sample = (head: string[], body: string[]) =>
		head.map((f) => (f.endsWith('.js') ? `<script src="${f}"></script>` : `<link rel="stylesheet" href="${f}">`)).join('') +
		body.map((f) => `<script src="${f}"></script>`).join('');

	it('accepts the load order in the runtime spec and rejects a missing or misplaced file', () => {
		expect(loadOrderProblem(sample(SHARED_HEAD, SHARED_BODY))).toBeNull();
		expect(loadOrderProblem(sample(SHARED_HEAD, SHARED_BODY.slice(1)))).toBe('missing ../assets/book.js');
		expect(loadOrderProblem(sample(SHARED_HEAD, [...SHARED_BODY].reverse()))).toMatch(/out of order/);
		expect(loadOrderProblem(sample(SHARED_HEAD, SHARED_BODY).replace('sim.js"', 'sim.js?v=2"'))).toMatch(/query string/);
	});

	it('ignores a comment that names the sim helper', () => {
		expect(/TB\.sim\.create/.test(code('/* Built on TB.sim.create */ requestAnimationFrame(f);'))).toBe(false);
		expect(/TB\.sim\.create/.test(code('TB.sim.create(box, {}); // the helper'))).toBe(true);
	});

	it('finds a shared selector redefined in a book stylesheet, and ignores a descendant rule', () => {
		expect(redefinedSelectors('.balancer .btn{color:red} .sim-box{padding:0} /* .callout{} */')).toEqual(['.sim-box']);
	});

	it('flags unbalanced or over-long options and a lopsided key', () => {
		const opt = (n: number): Option => ({ label: Array(n).fill('word').join(' ') });
		expect(optionProblem([opt(10), opt(12), opt(11)])).toBeNull();
		expect(optionProblem([opt(3), opt(6)])).toBeNull();
		expect(optionProblem([opt(7), opt(20)])).toMatch(/1\.8x/);
		expect(optionProblem([opt(20), opt(23)])).toMatch(/cap 22/);
		expect(keySpreadProblem([1, 1, 1, 1, 0, 2])).toMatch(/^B is the key in 4 of 6/);
		expect(keySpreadProblem([0, 1, 2, 0, 1, 2])).toBeNull();
		expect(keySpreadProblem([0, 0, 0, 1], 3)).toMatch(/^A is the key in 3 of 4/);
		expect(keySpreadProblem([0, 0, 1, 2], 3)).toBeNull();
		expect(VERDICT_OPENER.test('Right. All three work.')).toBe(true);
		expect(VERDICT_OPENER.test('<p>Correct! Glucose is an input.</p>')).toBe(true);
		expect(VERDICT_OPENER.test('Rising glucose makes the pancreas release insulin.')).toBe(false);
		expect(VERDICT_OPENER.test('Normal blood is about 288.')).toBe(false);
	});

	it('counts inline styling the way the standard defines it', () => {
		const html =
			'<p style="font-size:var(--text-sm);color:#fff">x</p><circle style="r: var(--dia-r-atom)"/>' +
			'<a href="#abc">y</a>&#960;<style>\n.a{}\n</style><script>1</script>' +
			'<script type="application/json" class="w-config">{}</script>';
		expect(countHtml(html)).toEqual({ styleAttrs: 1, fontSize: 1, fontFamily: 0, hex: 1, styleBlockLines: 3, inlineScripts: 1 });
		expect(countJs("el.style.color = 'red'; ctx.fillStyle = '#10B981'; document.querySelector('#add'); // #fff")).toEqual({ hex: 1, styleWrites: 1 });
	});
});

describe('textbook strict checks: migrated books', () => {
	it('"migrated" names only real books, and a finished book is a migrated book', () => {
		expect(baseline.migrated.filter((b) => !BOOKS.includes(b))).toEqual([]);
		expect(baseline.finished.filter((b) => !baseline.migrated.includes(b))).toEqual([]);
	});

	for (const book of baseline.migrated) {
		const assets = path.join(ROOT, 'public', book, 'assets');
		const html = lessonFiles(book).filter((f) => f.endsWith('.html'));

		it(`${book}: every lesson loads the shared runtime in order`, () => {
			const problems = html.map((rel) => [rel, loadOrderProblem(read(rel))]).filter(([, p]) => p);
			expect(problems, 'See docs/textbook/RUNTIME_SPEC.md, section 2.3').toEqual([]);
		});

		it(`${book}: the dashboard and the colophon load the shared runtime in order`, () => {
			const problems = ['index.html', 'about.html']
				.map((page) => [page, loadOrderProblem(fs.readFileSync(path.join(ROOT, 'public', book, page), 'utf8'), PAGE_ORDER)])
				.filter(([, p]) => p);
			expect(problems, 'See docs/textbook/RUNTIME_SPEC.md, section 2.3, "Non-lesson pages"').toEqual([]);
		});

		it(`${book}: keeps no copy of the shared runtime`, () => {
			expect(fs.existsSync(path.join(assets, 'core.js')), `${book}/assets/core.js must become book.js`).toBe(false);
			const tokens = fs.readFileSync(path.join(assets, 'tokens.css'), 'utf8');
			expect(redefinedSelectors(tokens), `${book}/assets/tokens.css holds tokens only`).toEqual([]);
			expect(tokens).not.toMatch(/@import/);
			const components = fs.readFileSync(path.join(assets, 'components.css'), 'utf8');
			expect(redefinedSelectors(components), `${book}/assets/components.css redefines shared components`).toEqual([]);
		});
	}

	for (const book of baseline.finished) {
		const html = lessonFiles(book).filter((f) => f.endsWith('.html'));
		const scripts = lessonFiles(book).filter((f) => f.endsWith('.js'));

		it(`${book}: every sim is built on the sim helper`, () => {
			const offenders = scripts.filter((rel) => {
				const js = code(read(rel));
				return /requestAnimationFrame|getContext\(/.test(js) && !/TB\.sim\.create/.test(js);
			});
			expect(offenders, 'See docs/textbook/RUNTIME_SPEC.md, section 4.3').toEqual([]);
		});

		it(`${book}: multiple-choice options are balanced and the key is spread`, () => {
			const problems: string[] = [];
			const keys: number[] = [];
			for (const rel of html) {
				const lessonKeys: number[] = [];
				choiceQuestions(read(rel)).forEach((options, i) => {
					const problem = optionProblem(options);
					if (problem) problems.push(`${rel} question ${i + 1}: ${problem}`);
					for (const o of options) {
						if (o.feedback && VERDICT_OPENER.test(o.feedback)) problems.push(`${rel} question ${i + 1}: feedback opens with a verdict: "${o.feedback.slice(0, 40)}"`);
					}
					lessonKeys.push(options.findIndex((o) => o.correct === true));
				});
				// across a lesson as well as across the book (standard, section 8.4)
				const lessonSpread = keySpreadProblem(lessonKeys, 3);
				if (lessonSpread) problems.push(`${rel}: ${lessonSpread}`);
				keys.push(...lessonKeys);
			}
			const spread = keySpreadProblem(keys);
			if (spread) problems.push(`${book}: ${spread}`);
			expect(problems, 'See docs/textbook/STYLE_STANDARD.md, section 8.4').toEqual([]);
		});
	}

	it('the shared stylesheet carries the page foundation once any book depends on it', () => {
		if (baseline.migrated.length === 0) return;
		const css = fs.readFileSync(path.join(ROOT, 'public', 'textbook', 'base.css'), 'utf8');
		expect(css).toMatch(/\*\s*,\s*\*::before\s*,\s*\*::after\s*\{[^}]*box-sizing\s*:\s*border-box/);
		expect(css).toMatch(/body\s*\{[^}]*background(-color)?\s*:\s*var\(--paper\)/);
	});
});
