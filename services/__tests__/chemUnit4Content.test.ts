import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Guards for the chem Unit 4 pages (4-1a, 4-1b, 4-6a, 4-6b) that the shared standard test does
 * not cover yet, because chem is "migrated" but not "finished". They pin what stage 5 of session
 * 4c fixed, so it cannot slip back:
 *   - every section, div and details block is closed;
 *   - the hero quotes the PE word for word, and the Alignment row is the only place a page says
 *     "Performance Expectation";
 *   - options are balanced, the key is spread, and no feedback opens with a verdict;
 *   - no old "Self-score" scale, no "mark scheme" button, no exclamation mark in authored copy;
 *   - 4-1a keeps the spread of particle energies in Enrichment, 4-1b keeps how enzymes work and the
 *     enzyme simulator in Enrichment, 4-6a asks its Haber questions one variable at a time, and
 *     4-6b keeps buffers, pH values and the blood-buffer simulator in Enrichment;
 *   - no recall blank or core written response draws on Enrichment content.
 */

const ROOT = path.resolve(__dirname, '../..');
const DIR = path.join(ROOT, 'public/chem/lessons');
const UNIT4 = [
	'4-1a_reaction-rates-collision-theory.html',
	'4-1b_catalysis-and-enzymes.html',
	'4-6a_dynamic-equilibrium-le-chatelier.html',
	'4-6b_human-equilibrium-blood-buffers.html',
];
// the PE statements, as published (docs/textbook/references/chem/Course PEs and Evidence Statements)
const PE: Record<string, string> = {
	'HS-PS1-5': 'Apply scientific principles and evidence to provide an explanation about the effects of changing the temperature or concentration of the reacting particles on the rate at which a reaction occurs.',
	'HS-PS1-6': 'Refine the design of a chemical system by specifying a change in conditions that would produce increased amounts of products at equilibrium.',
};
const read = (f: string) => fs.readFileSync(path.join(DIR, f), 'utf8');
const stripScripts = (html: string) => html.replace(/<script\b[\s\S]*?<\/script>/g, '');
const count = (s: string, re: RegExp) => (s.match(re) || []).length;

const VERDICT = /^\s*(?:<[^>]+>\s*)*(Right|Correct|Incorrect|Wrong|Yes|No|Exactly|Great|Good job|Well done|Perfect|Excellent|Not quite|Spot on|Fantastic)\b/;
const words = (s: string) => s.replace(/<\/?su[bp]>/g, '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
const enrichment = (html: string) => [...html.matchAll(/<details class="enrichment">[\s\S]*?<\/details>/g)].map((m) => m[0]);
/**
 * The page with its Enrichment (sections and blocks), the adaptive-practice card (a separate
 * module) and the Scope row of the header (which names the Enrichment topics) taken out.
 */
const core = (html: string) => {
	let out = stripScripts(html);
	for (const block of enrichment(html)) out = out.replace(stripScripts(block), '');
	out = out.replace(/<section id="[^"]*"[^>]*data-enrichment>[\s\S]*?<\/section>/g, '');
	return out.replace(/<div class="practice-card">[\s\S]*?<\/section>/, '').replace(/<div class="k">Scope<\/div><div class="v">[\s\S]*?<\/div>/, '');
};

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
function freeQuestions(html: string): { prompt: string; reveal: string }[] {
	const out: { prompt: string; reveal: string }[] = [];
	for (const [, json] of html.matchAll(/<script\b[^>]*class="w-config"[^>]*>([\s\S]*?)<\/script>/g)) {
		let c: { mode?: string; prompt?: string; reveal?: string };
		try { c = JSON.parse(json); } catch { continue; }
		if (c.mode === 'free') out.push({ prompt: c.prompt ?? '', reveal: c.reveal ?? '' });
	}
	return out;
}

describe('chem Unit 4: page structure', () => {
	for (const f of UNIT4) {
		it(`${f}: every section and div is closed`, () => {
			const html = stripScripts(read(f));
			expect(count(html, /<section\b/g), 'section').toBe(count(html, /<\/section>/g));
			expect(count(html, /<div\b/g), 'div').toBe(count(html, /<\/div>/g));
			expect(count(html, /<main\b/g)).toBe(1);
			expect(count(html, /<details\b/g), 'details').toBe(count(html, /<\/details>/g));
		});
	}
});

describe('chem Unit 4: the hero quotes the PE and standards language stays in the Alignment row', () => {
	for (const f of UNIT4) {
		it(f, () => {
			const html = read(f);
			const align = html.match(/<div class="k">Alignment<\/div><div class="v"><b>(HS-[A-Z0-9-]+)<\/b> ([^<]*)<\/div>/);
			expect(align, 'Alignment row').not.toBeNull();
			expect(align![2]).toBe(PE[align![1]]);
			expect(stripScripts(html.replace(align![0], ''))).not.toMatch(/Performance Expectation|Disciplinary Core Idea|Target Standards/);
		});
	}
});

describe('chem Unit 4: the voice pass holds', () => {
	for (const f of UNIT4) {
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

describe('chem Unit 4: every concept section names a common mistake', () => {
	for (const f of UNIT4) {
		it(f, () => {
			const html = stripScripts(read(f));
			const sections = [...html.matchAll(/<section id="s-(?!hero|recall|selfx|exam)[^"]*"[^>]*>[\s\S]*?<\/section>/g)].map((m) => m[0]);
			const missing = sections.filter((s) => !/Common mistake/.test(s) && !/practice-card/.test(s) && !/data-enrichment/.test(s) && !/id="s-(interactive|sandbox|practice)/.test(s));
			expect(missing.map((s) => s.slice(0, 60))).toEqual([]);
		});
	}
});

describe('chem Unit 4: past-boundary content sits inside Enrichment', () => {
	it('4-1a keeps the spread of particle energies in an Enrichment block', () => {
		const html = read('4-1a_reaction-rates-collision-theory.html');
		const inside = enrichment(html).join('\n');
		expect(inside).toMatch(/Maxwell-Boltzmann/);
		expect(inside).toMatch(/Figure 4\.1/);
		expect(core(html)).not.toMatch(/Maxwell|Boltzmann|energy distribution|high-energy tail/i);
		// recall blanks draw on core content only
		expect(html.match(/<p class="recall-sentence">[\s\S]*?<\/p>/)![0]).not.toMatch(/curve|distribution|flatten/i);
	});
	it('4-1b keeps how enzymes work and the enzyme simulator in Enrichment, and cuts the dates and "zero order"', () => {
		const html = read('4-1b_catalysis-and-enzymes.html');
		const inside = enrichment(html).join('\n');
		expect(inside).toMatch(/active site/i);
		expect(inside).toMatch(/denaturation/i);
		expect(inside).toMatch(/Top speed/);
		expect(inside).toMatch(/id="subConc"|data-sim="enzyme"/);
		expect(html).not.toMatch(/Fischer|Koshland|1894|1958|[Zz]ero-order/);
		// the old simulator box (replaced in the sims commit) still has a "Current Vmax" label
		expect(html.replace(/<div class="sim-box"[\s\S]*?<\/section>/, '')).not.toMatch(/Vmax|V<sub>max<\/sub>/);
		const rest = core(html);
		expect(rest).not.toMatch(/active site|induced fit|lock.and.key|denatur|saturat|substrate|Michaelis|Km\b/i);
		// the core self-explain, the core exam and the recall blanks draw on core content only
		expect(rest.match(/<p class="recall-sentence">[\s\S]*?<\/p>/)![0]).not.toMatch(/active site|denatur|saturat|substrate/i);
		expect(inside).toMatch(/<span class="exam-marks">\[3 marks\] <span class="tag-enrichment">Enrichment<\/span>/);
		// one paragraph names enzymes in the core
		expect(rest).toMatch(/<strong class="term">enzymes<\/strong>/);
	});
	it('4-6a asks its two Haber questions one variable at a time', () => {
		const html = read('4-6a_dynamic-equilibrium-le-chatelier.html');
		const free = freeQuestions(html);
		expect(free).toHaveLength(2);
		const [t, p] = free;
		expect(t.prompt).toMatch(/temperature/i);
		expect(t.prompt).not.toMatch(/pressure|atmosphere|atm\b/i);
		expect(p.prompt).toMatch(/pressure/i);
		expect(p.prompt).not.toMatch(/temperature|°C|&deg;C/i);
		expect(p.reveal).not.toMatch(/condens|liquef|catalyst/i);
	});
	it('4-6b keeps buffers, pH values and the blood-buffer simulator in Enrichment, and cuts carbonic anhydrase', () => {
		const html = read('4-6b_human-equilibrium-blood-buffers.html');
		const inside = enrichment(html).join('\n');
		expect(inside).toMatch(/conjugate base/);
		expect(inside).toMatch(/7\.35/);
		expect(inside).toMatch(/H₂CO₃/);
		expect(inside).toMatch(/id="respSlider"|data-sim="blood"/);
		expect(html).not.toMatch(/carbonic anhydrase|CA enzyme/i);
		const rest = core(html);
		expect(rest).not.toMatch(/7\.35|7\.45|7\.40|pH [0-9]|conjugate|weak acid|H<sub>2<\/sub>CO<sub>3<\/sub>|Kussmaul|acetate|Henderson/i);
		expect(rest.replace(/<[^>]+>/g, ' ')).not.toMatch(/\bbuffer/);
		expect(rest.match(/<p class="recall-sentence">[\s\S]*?<\/p>/)![0]).not.toMatch(/buffer|conjugate|capacity|carbonic anhydrase|\bpH\b/i);
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
	for (const f of UNIT4) {
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

describe('chem Unit 4: every class a page or its script uses is defined', () => {
	// A class that no stylesheet defines does nothing and fails silently.
	const css = [
		...fs.readdirSync(path.join(ROOT, 'public/textbook')).filter((f) => f.endsWith('.css')).map((f) => path.join(ROOT, 'public/textbook', f)),
		...['tokens.css', 'components.css'].map((f) => path.join(ROOT, 'public/chem/assets', f)),
	].map((f) => fs.readFileSync(f, 'utf8')).join('\n');
	const defined = new Set([...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]));
	// classes the runtime scripts add themselves, and hooks that only scripts and tests look for
	const SCRIPT_ADDED = new Set(['dark', 'show', 'is-current', 'is-stepper', 'active', 'in', 'term', 'w-config', 'svg-step-layer']);

	for (const f of UNIT4) {
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

describe('chem Unit 4: a readout label holds no element symbol', () => {
	// .readout-label is set in capitals, so (Na) would read (NA)
	for (const f of UNIT4) {
		it(f, () => {
			const bad = [...read(f).matchAll(/class="readout-label">([^<]*)</g)].map((m) => m[1]).filter((t) => /\([A-Z][a-z]?\)/.test(t));
			expect(bad).toEqual([]);
		});
	}
});

describe('chem Unit 4: a scoring-guide line is one idea in under 20 words, with its marks', () => {
	for (const f of UNIT4) {
		it(f, () => {
			const html = stripScripts(read(f));
			const lines = [...html.matchAll(/<ul class="pts">([\s\S]*?)<\/ul>/g)].flatMap((m) => [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => x[1]));
			expect(lines.length).toBeGreaterThan(0);
			const bad = lines.filter((l) => words(l) >= 20 || !/\(\d marks?\)/.test(l));
			expect(bad).toEqual([]);
		});
	}
});

describe('chem Unit 4: every sim is on the helper and locks until its prediction', () => {
	for (const f of UNIT4) {
		it(f, () => {
			const html = read(f);
			const js = fs.readFileSync(path.join(DIR, f.replace(/_.*$/, '') + '.js'), 'utf8');
			expect(html).not.toMatch(/class="interactive"|interactive-header|interactive-body|style="margin-top/);
			expect(js).not.toMatch(/requestAnimationFrame|performance\.now\(\)|\.style\.|setProperty\(/);
			expect(js).toMatch(/TB\.sim\.create/);
			const boxes = [...html.matchAll(/<div class="sim-box"([^>]*)>/g)];
			expect(boxes).toHaveLength(1);
			for (const [, attrs] of boxes) {
				const tag = attrs.match(/data-sim="([^"]+)"/);
				expect(tag, attrs).not.toBeNull();
				const box = html.slice(html.indexOf(`<div class="sim-box"${attrs}>`));
				const mine = box.slice(0, box.indexOf('</ol>\n    </div>'));
				expect(mine, tag![1]).toMatch(/data-sim-gate/);
				expect(mine, tag![1]).toMatch(/<h4>[^<]*\?<\/h4>/);
				expect(mine, tag![1]).toMatch(/class="sim-legend"/);
				expect(mine, tag![1]).toMatch(/<ol class="try-this">/);
			}
		});
	}
	it('4-1b and 4-6b keep their simulator inside an Enrichment block, 4-1a and 4-6a keep theirs in the core', () => {
		for (const f of UNIT4) {
			const html = read(f);
			const inside = enrichment(html).some((b) => /class="sim-box"/.test(b));
			expect(inside, f).toBe(/4-1b|4-6b/.test(f));
		}
	});
});

describe('chem Unit 4: the old inline mode styling is gone', () => {
	it('4-6b shows the chosen liquid with aria-pressed, not an inline style', () => {
		const html = read('4-6b_human-equilibrium-blood-buffers.html');
		expect(html).toMatch(/id="btnModeBlood" aria-pressed="true"/);
		expect(html).toMatch(/id="btnModeWater" aria-pressed="false"/);
	});
});

describe('chem Unit 4: a slider starts on a value its step allows', () => {
	// A browser moves an off-grid value to the nearest step: 4-1b first showed 35 degrees C for a start of 37.
	for (const f of UNIT4) {
		it(f, () => {
			const bad: string[] = [];
			for (const [, attrs] of read(f).matchAll(/<input type="range"([^>]*)>/g)) {
				const get = (k: string) => Number((attrs.match(new RegExp(`\\b${k}="([^"]*)"`)) || [])[1]);
				const min = get('min'), step = get('step'), value = get('value');
				const k = (value - min) / step;
				if (Math.abs(k - Math.round(k)) > 1e-9) bad.push(attrs.trim());
			}
			expect(bad).toEqual([]);
		});
	}
});

describe('chem Unit 4: the chaotic models give the same numbers in every engine', () => {
	// 4-1a and 4-1b follow hundreds of collisions, which turn a last-bit difference into a different run.
	// Math.cos, Math.sin, Math.exp and Math.hypot are not exact in every engine; the model uses only
	// plain arithmetic and Math.sqrt (and a rounded Math.exp in 4-1b's activity). The Try this numbers in
	// the lesson text come from Node and are checked again in Chrome by tests/smoke/chemUnit4.smoke.ts.
	for (const f of ['4-1a.js', '4-1b.js']) {
		it(f, () => {
			const js = fs.readFileSync(path.join(DIR, f), 'utf8');
			const model = js.slice(0, js.indexOf('/* ---- the page ---- */'));
			expect(model.replace(/\/\/.*$/gm, '')).not.toMatch(/Math\.(hypot|cos|sin|tan|atan2?|pow|random)\(/);
		});
	}
});
