import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Guards for the chem Unit 3 pages (3-1a, 3-1b, 3-1c, 3-4a, 3-14a) that the shared
 * standard test does not cover yet, because chem is "migrated" but not "finished". They
 * pin what stage 4 of session 4c fixed, so it cannot slip back:
 *   - every section, div and details block is closed (3-4a once left its exam section open);
 *   - the hero quotes the PE word for word, and the Alignment row is the only place
 *     a page says "Performance Expectation";
 *   - options are balanced, the key is spread, and no feedback opens with a verdict;
 *   - no old "Self-score" scale, no "mark scheme" button, no exclamation mark in authored copy;
 *   - 3-4a and 3-14a keep the content past their PE boundary inside Enrichment, and no
 *     recall blank or core written response draws on it.
 */

const ROOT = path.resolve(__dirname, '../..');
const DIR = path.join(ROOT, 'public/chem/lessons');
const UNIT3 = [
	'3-1a_temperature-heat-specific-heat.html',
	'3-1b_phase-changes-heating-curves.html',
	'3-1c_calorimetry-energy-systems.html',
	'3-4a_thermal-equilibrium-heat-transfer.html',
	'3-14a_bond-energy-reaction-profiles.html',
];
// the PE statements, as published (docs/textbook/references/chem/Course PEs and Evidence Statements)
const PE: Record<string, string> = {
	'HS-PS3-1': 'Create a computational model to calculate the change in the energy of one component in a system when the change in energy of the other component(s) and energy flows in and out of the system are known.',
	'HS-PS3-4': 'Plan and conduct an investigation to provide evidence that the transfer of thermal energy when two components of different temperature are combined within a closed system results in a more uniform energy distribution among the components in the system (second law of thermodynamics).',
	'HS-PS1-4': 'Develop a model to illustrate that the release or absorption of energy from a chemical reaction system depends upon the changes in total bond energy.',
};
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

describe('chem Unit 3: page structure', () => {
	for (const f of UNIT3) {
		it(`${f}: every section and div is closed`, () => {
			const html = stripScripts(read(f));
			expect(count(html, /<section\b/g), 'section').toBe(count(html, /<\/section>/g));
			expect(count(html, /<div\b/g), 'div').toBe(count(html, /<\/div>/g));
			expect(count(html, /<main\b/g)).toBe(1);
			expect(count(html, /<details\b/g), 'details').toBe(count(html, /<\/details>/g));
		});
	}
});

describe('chem Unit 3: the hero quotes the PE and standards language stays in the Alignment row', () => {
	for (const f of UNIT3) {
		it(f, () => {
			const html = read(f);
			const align = html.match(/<div class="k">Alignment<\/div><div class="v"><b>(HS-[A-Z0-9-]+)<\/b> ([^<]*)<\/div>/);
			expect(align, 'Alignment row').not.toBeNull();
			expect(align![2]).toBe(PE[align![1]]);
			expect(stripScripts(html.replace(align![0], ''))).not.toMatch(/Performance Expectation|Disciplinary Core Idea|Target Standards/);
		});
	}
});

describe('chem Unit 3: the voice pass holds', () => {
	for (const f of UNIT3) {
		const html = read(f);
		it(f + ': options are balanced, the key is spread and feedback opens with the reason', () => {
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
		it(f + ': no Self-score scale, mark-scheme button, flag line, dash or exclamation mark in authored copy', () => {
			const prose = stripScripts(html).replace(/<svg\b[\s\S]*?<\/svg>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ');
			expect(html).not.toMatch(/Self-score/);
			expect(html).not.toMatch(/Reveal mark scheme|Mark scheme:/);
			expect(html).not.toMatch(/⚑/);
			expect(html).not.toMatch(/class="cap"|class=\\"cap\\"/);
			expect(html.includes(String.fromCharCode(0x2014))).toBe(false);
			expect(prose.includes('!')).toBe(false);
		});
		it(f + ': no worked solution waits behind a button that does nothing', () => {
			expect(html).not.toMatch(/data-reveal-btn|class="predict-reveal"/);
		});
	}
});

describe('chem Unit 3: every concept section names a common mistake', () => {
	for (const f of UNIT3) {
		it(f, () => {
			const html = stripScripts(read(f));
			const sections = [...html.matchAll(/<section id="s-(?!hero|recall|selfx|exam)[^"]*"[^>]*>[\s\S]*?<\/section>/g)].map((m) => m[0]);
			const missing = sections.filter((s) => !/Common mistake/.test(s) && !/practice-card/.test(s) && !/data-enrichment/.test(s) && !/id="s-(interactive|sandbox|computational|calc-engine|practice)/.test(s));
			expect(missing.map((s) => s.slice(0, 60))).toEqual([]);
		});
	}
});

describe('chem Unit 3: past-boundary content sits inside Enrichment', () => {
	const enrichment = (html: string) => [...html.matchAll(/<details class="enrichment">[\s\S]*?<\/details>/g)].map((m) => m[0]);
	it('3-4a keeps the microstate argument in an Enrichment block', () => {
		const html = read('3-4a_thermal-equilibrium-heat-transfer.html');
		const inside = enrichment(html).join('\n');
		expect(inside).toMatch(/microstate/);
		// the adaptive practice card describes the separate PE module, which does cover Maxwell-Boltzmann
		expect(stripScripts(html).replace(inside, '').replace(/<div class="practice-card">[\s\S]*?<\/section>/, '')).not.toMatch(/microstate|Maxwell|statistically impossible/i);
	});
	it('3-14a keeps the bond-energy sum, its table and its practice item in an Enrichment block', () => {
		const html = read('3-14a_bond-energy-reaction-profiles.html');
		const inside = enrichment(html).join('\n');
		expect(inside).toMatch(/data-tool="bonds"|bondCalcWorkbench/);
		expect(inside).toMatch(/Average single and multiple covalent bond energies/);
		expect(inside).toMatch(/examAnsEnr/);
		expect(inside).toMatch(/<span class="exam-marks">\[2 marks\] <span class="tag-enrichment">Enrichment<\/span>/);
		const core = stripScripts(html).replace(inside, '');
		expect(core).not.toMatch(/data-tool="bonds"|bondCalcWorkbench|sum;\s*<em>D<\/em>|calculate (the )?(overall )?reaction enthalpy/i);
		// recall blanks draw on core content only
		const recall = core.match(/<p class="recall-sentence">[\s\S]*?<\/p>/)![0];
		expect(recall).not.toMatch(/broken|bond energies/i);
	});
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
	for (const f of UNIT3) {
		it(f, () => {
			const doc = new DOMParser().parseFromString(read(f), 'text/html');
			const frame = [...doc.querySelectorAll('.exam-frame')].find((x) => !x.closest('details.enrichment'));
			expect(frame).toBeTruthy();
			const got = extract(doc, { id: f, title: f });
			expect(got).not.toBeNull();
			const text = (h: string) => new DOMParser().parseFromString(h, 'text/html').body.textContent!.replace(/\s+/g, ' ').trim();
			expect(text(got!.promptHtml)).toContain(text(frame!.querySelector('.exam-q')?.innerHTML ?? '').slice(0, 50));
		});
	}
});

describe('chem Unit 3: every class a page or its script uses is defined', () => {
	// A class that no stylesheet defines does nothing and fails silently.
	const css = [
		...fs.readdirSync(path.join(ROOT, 'public/textbook')).filter((f) => f.endsWith('.css')).map((f) => path.join(ROOT, 'public/textbook', f)),
		...['tokens.css', 'components.css'].map((f) => path.join(ROOT, 'public/chem/assets', f)),
	].map((f) => fs.readFileSync(f, 'utf8')).join('\n');
	const defined = new Set([...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]));
	// classes the runtime scripts add themselves, and hooks that only scripts and tests look for
	const SCRIPT_ADDED = new Set(['dark', 'show', 'is-current', 'is-stepper', 'active', 'in', 'term', 'w-config', 'svg-step-layer']);

	for (const f of UNIT3) {
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

describe('chem Unit 3: a readout label holds no element symbol', () => {
	// .readout-label is set in capitals, so (Na) would read (NA)
	for (const f of UNIT3) {
		it(f, () => {
			const bad = [...read(f).matchAll(/class="readout-label">([^<]*)</g)].map((m) => m[1]).filter((t) => /\([A-Z][a-z]?\)/.test(t));
			expect(bad).toEqual([]);
		});
	}
});

describe('chem Unit 3: every sim is on the helper or the gated tool shell, and locks until its prediction', () => {
	for (const f of UNIT3) {
		it(f, () => {
			const html = read(f);
			const js = fs.readFileSync(path.join(DIR, f.replace(/_.*$/, '') + '.js'), 'utf8');
			expect(html).not.toMatch(/class="interactive"|interactive-header|interactive-body/);
			expect(js).not.toMatch(/requestAnimationFrame|performance\.now\(\)/);
			for (const [, attrs] of html.matchAll(/<div class="sim-box"([^>]*)>/g)) {
				const tag = attrs.match(/data-(sim|tool)="([^"]+)"/);
				expect(tag, attrs).not.toBeNull();
				const box = html.slice(html.indexOf(`<div class="sim-box"${attrs}>`));
				const end = box.indexOf('</ol>\n    </div>') > 0 ? box.indexOf('</ol>\n    </div>') : box.length;
				const mine = box.slice(0, end);
				// the Enrichment bond calculator is the one tool with no prediction (a calculator, with a practice item below it)
				if (tag![2] !== 'bonds') expect(mine, tag![2]).toMatch(/data-sim-gate/);
				expect(mine, tag![2]).toMatch(/<h4>[^<]*\?<\/h4>/);
				expect(mine, tag![2]).toMatch(/class="sim-legend"/);
			}
		});
	}
});

describe('chem Unit 3: a pressed chip keeps its Enrichment tag readable', () => {
	it('components.css has the rule', () => {
		const css = fs.readFileSync(path.join(ROOT, 'public/chem/assets/components.css'), 'utf8');
		expect(css).toMatch(/\.chip\[aria-pressed="true"\] \.tag-enrichment/);
	});
});

describe('chem Unit 3: a scoring-guide line is one idea in under 20 words, with its marks', () => {
	for (const f of UNIT3) {
		it(f, () => {
			const html = stripScripts(read(f));
			const lines = [...html.matchAll(/<ul class="pts">([\s\S]*?)<\/ul>/g)].flatMap((m) => [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => x[1]));
			expect(lines.length).toBeGreaterThan(0);
			const bad = lines.filter((l) => words(l) >= 20 || !/\(\d marks?\)/.test(l));
			expect(bad).toEqual([]);
		});
	}
});
