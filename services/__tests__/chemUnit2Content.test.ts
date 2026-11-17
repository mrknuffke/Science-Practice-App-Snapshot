import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Guards for the chem Unit 2 pages (1-2d, 1-2e, 1-7a, 1-7b, 1-7c, 2-6a) that the shared
 * standard test does not cover yet, because chem is "migrated" but not "finished". They
 * pin what stage 3 of session 4c fixed, so it cannot slip back:
 *   - the exam section is closed (all six pages once left a section and two divs open);
 *   - a "+1" scoring list (ul.pts) is used only inside a scoring guide;
 *   - options are balanced, the key is spread, and no feedback opens with a verdict;
 *   - no old "Self-score" scale and no flag line in a scoring guide.
 */

const ROOT = path.resolve(__dirname, '../..');
const DIR = path.join(ROOT, 'public/chem/lessons');
const UNIT2 = [
	'2-2a_physical-chemical-change.html',
	'1-2e_reaction-types-balancing.html',
	'2-7a_the-mole-molar-mass.html',
	'2-7b_mole-conversions.html',
	'2-7c_stoichiometry.html',
	'2-6a_structure-property-argument.html',
];
const read = (f: string) => fs.readFileSync(path.join(DIR, f), 'utf8');
const stripScripts = (html: string) => html.replace(/<script\b[\s\S]*?<\/script>/g, '');
const count = (s: string, re: RegExp) => (s.match(re) || []).length;

const VERDICT = /^\s*(?:<[^>]+>\s*)*(Right|Correct|Incorrect|Wrong|Yes|No|Exactly|Great|Good job|Well done|Perfect|Excellent|Not quite|Spot on|Fantastic)\b/;
const words = (s: string) => s.replace(/<\/?su[bp]>/g, '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;

interface Opt { label?: string; correct?: boolean; feedback?: string }
function questions(html: string): Opt[][] {
	const out: Opt[][] = [];
	for (const [, json] of html.matchAll(/<script\b[^>]*class="w-config"[^>]*>([\s\S]*?)<\/script>/g)) {
		let c: { options?: Opt[]; steps?: { options?: Opt[] }[] };
		try { c = JSON.parse(json); } catch { continue; }
		if (Array.isArray(c.options) && c.options.some((o) => o.correct === true)) out.push(c.options);
		for (const s of c.steps ?? []) if (Array.isArray(s.options)) out.push(s.options);
	}
	return out;
}

describe('chem Unit 2: page structure', () => {
	for (const f of UNIT2) {
		it(`${f}: every section and div is closed`, () => {
			const html = stripScripts(read(f));
			expect(count(html, /<section\b/g), 'section').toBe(count(html, /<\/section>/g));
			expect(count(html, /<div\b/g), 'div').toBe(count(html, /<\/div>/g));
			expect(count(html, /<main\b/g)).toBe(1);
		});
	}
});

describe('chem lessons: a "+1" list is only a scoring guide', () => {
	// ul.pts puts a "+1" mark in front of every item (lesson.css), which is right in a
	// scoring guide and wrong in running text (2-7c once showed it on the Before, Change and After list).
	const lessons = fs.readdirSync(DIR).filter((f) => /\.html$/.test(f) && !f.startsWith('_'));
	for (const f of lessons) {
		it(f, () => {
			const html = read(f);
			const bad = [...html.matchAll(/<ul class="pts">/g)].filter((m) => {
				const before = html.slice(Math.max(0, m.index! - 400), m.index);
				return !/scheme-card|scoring guide|Scoring guide/i.test(before) && !/\\"pts\\"/.test(before);
			});
			expect(bad.length).toBe(0);
		});
	}
});

describe('chem Unit 2: the voice pass holds', () => {
	for (const f of UNIT2) {
		const html = read(f);
		it(`${f}: options are balanced, the key is spread and feedback opens with the reason`, () => {
			const problems: string[] = [];
			const keys: number[] = [];
			questions(html).forEach((options, i) => {
				const lens = options.map((o) => words(o.label ?? ''));
				if (Math.max(...lens) > 22) problems.push(`question ${i + 1}: an option has ${Math.max(...lens)} words`);
				if (Math.min(...lens) > 6 && Math.max(...lens) / Math.min(...lens) > 1.8) problems.push(`question ${i + 1}: options run ${Math.min(...lens)} to ${Math.max(...lens)} words`);
				for (const o of options) {
					if (!o.feedback) problems.push(`question ${i + 1}: an option has no feedback`);
					else if (VERDICT.test(o.feedback)) problems.push(`question ${i + 1}: feedback opens with a verdict`);
				}
				keys.push(options.findIndex((o) => o.correct === true));
			});
			if (keys.length >= 3) {
				const top = Math.max(...[0, 1, 2, 3].map((k) => keys.filter((x) => x === k).length));
				if (top / keys.length > 0.5) problems.push(`one letter is the key in ${top} of ${keys.length} questions`);
			}
			expect(problems).toEqual([]);
		});
		it(`${f}: no Self-score scale, no flag line, no exclamation mark in a scoring guide`, () => {
			expect(html).not.toMatch(/Self-score/);
			expect(html).not.toMatch(/⚑/);
			expect(html).not.toMatch(/class="cap"|class=\\"cap\\"/);
			expect(html.includes(String.fromCharCode(0x2014))).toBe(false);
		});
	}
});

describe('chem dashboard: exam practice shows the exam, not a checkpoint', () => {
	// extractExamQuestionData lives in a classic script, so run its source on each lesson page.
	const src = fs.readFileSync(path.join(ROOT, 'public/chem/assets/dashboard.js'), 'utf8');
	const start = src.indexOf('function extractExamQuestionData');
	let depth = 0;
	let end = start;
	for (let i = src.indexOf('{', start); i < src.length; i++) {
		if (src[i] === '{') depth++;
		if (src[i] === '}' && --depth === 0) { end = i + 1; break; }
	}
	const extract = new Function(`${src.slice(start, end)}; return extractExamQuestionData;`)() as (
		doc: Document,
		lesson: { id: string; title: string },
	) => { promptHtml: string; schemeHtml: string } | null;

	const lessons = fs.readdirSync(DIR).filter((f) => /\.html$/.test(f) && !f.startsWith('_'));
	for (const f of lessons) {
		it(f, () => {
			const doc = new DOMParser().parseFromString(read(f), 'text/html');
			const frame = [...doc.querySelectorAll('.exam-frame')].find((x) => !x.closest('details.enrichment'));
			if (!frame) return;
			const got = extract(doc, { id: f, title: f });
			expect(got).not.toBeNull();
			const own = frame.querySelector('[data-widget="commit-reveal"] .w-config');
			const wanted = own ? (JSON.parse(own.textContent ?? '{}').prompt as string) : frame.querySelector('.exam-q')?.innerHTML ?? '';
			const text = (h: string) => new DOMParser().parseFromString(h, 'text/html').body.textContent!.replace(/\s+/g, ' ').trim();
			// a diagram in the exam is put in front of the question, so the question is somewhere inside
			expect(text(got!.promptHtml)).toContain(text(wanted).slice(0, 50));
		});
	}
});

describe('chem Unit 2: every class a page or its script uses is defined', () => {
	// A class that no stylesheet defines does nothing and fails silently (the 1-7b fractions
	// had no rule at all, so a conversion factor printed as two lines of plain text).
	const css = [
		...fs.readdirSync(path.join(ROOT, 'public/textbook')).filter((f) => f.endsWith('.css')).map((f) => path.join(ROOT, 'public/textbook', f)),
		...['tokens.css', 'components.css'].map((f) => path.join(ROOT, 'public/chem/assets', f)),
	].map((f) => fs.readFileSync(f, 'utf8')).join('\n');
	const defined = new Set([...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]));
	// classes the runtime scripts add themselves, and hooks that only scripts and tests look for
	const SCRIPT_ADDED = new Set(['dark', 'show', 'is-current', 'is-stepper', 'active', 'in', 'term', 'w-config', 'svg-step-layer']);

	for (const f of UNIT2) {
		it(f, () => {
			const html = read(f);
			const js = fs.readFileSync(path.join(DIR, f.replace(/_.*$/, '') + '.js'), 'utf8');
			const used = new Set<string>();
			for (const [, v] of stripScripts(html).matchAll(/\sclass="([^"]*)"/g)) v.split(/\s+/).filter(Boolean).forEach((c) => used.add(c));
			for (const [, v] of js.matchAll(/(?:className\s*=|classList\.\w+\()\s*['"`]([^'"`]*)['"`]/g)) v.split(/\s+/).filter(Boolean).forEach((c) => used.add(c));
			const missing = [...used].filter((c) => !defined.has(c) && !SCRIPT_ADDED.has(c));
			expect(missing).toEqual([]);
		});
	}
});

describe('chem Unit 2: a readout label holds no element symbol', () => {
	// .readout-label is set in capitals, so (Na) would read (NA)
	for (const f of UNIT2) {
		it(f, () => {
			const bad = [...read(f).matchAll(/class="readout-label">([^<]*)</g)].map((m) => m[1]).filter((t) => /\([A-Z][a-z]?\)/.test(t));
			expect(bad).toEqual([]);
		});
	}
});
