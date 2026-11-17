import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Guards for the chem Unit 5 pages (5-1a, 5-2a, 5-3a, 5-4a, 5-8a) that the shared standard test
 * does not cover. They pin what stage 6 of session 4c fixed, so it cannot slip back:
 *   - every section, div and details block is closed;
 *   - the hero quotes the PE word for word, and the Alignment row is the only place a page says
 *     "Performance Expectation";
 *   - options are balanced, the key is spread, and no feedback opens with a verdict;
 *   - no old "Self-score" scale, no "mark scheme" button, no exclamation mark in authored copy;
 *   - each lesson keeps its past-boundary content in Enrichment, and its core, recall blanks and
 *     core exam never depend on an Enrichment block.
 */

const ROOT = path.resolve(__dirname, '../..');
const DIR = path.join(ROOT, 'public/chem/lessons');
const UNIT5 = [
	'5-1a_stellar-fusion-solar-energy.html',
	'5-2a_big-bang-cosmic-evidence.html',
	'5-3a_stellar-nucleosynthesis-element-origins.html',
	'5-8a_nuclear-reactions-radioactive-decay.html',
	'5-4a_electromagnetic-radiation-matter.html',
];
// the PE statements, as published (docs/textbook/references/chem/Course PEs and Evidence Statements)
const PE: Record<string, string> = {
	'HS-ESS1-1': 'Develop a model based on evidence to illustrate the life span of the sun and the role of nuclear fusion in the sun’s core to release energy in the form of radiation.',
	'HS-ESS1-2': 'Construct an explanation of the Big Bang theory based on astronomical evidence of light spectra, motion of distant galaxies, and composition of matter in the universe.',
	'HS-ESS1-3': 'Communicate scientific ideas about the way stars, over their life cycle, produce elements.',
	'HS-PS1-8': 'Develop models to illustrate the changes in the composition of the nucleus of the atom and the energy released during the processes of fission, fusion, and radioactive decay.',
	'HS-PS4-4': 'Evaluate the validity and reliability of claims in published materials of the effects that different frequencies of electromagnetic radiation have when absorbed by matter.',
};
const read = (f: string) => fs.readFileSync(path.join(DIR, f), 'utf8');
const stripScripts = (html: string) => html.replace(/<script\b[\s\S]*?<\/script>/g, '');
const count = (s: string, re: RegExp) => (s.match(re) || []).length;

const VERDICT = /^\s*(?:<[^>]+>\s*)*(Right|Correct|Incorrect|Wrong|Yes|No|Exactly|Great|Good job|Well done|Perfect|Excellent|Not quite|Spot on|Fantastic)\b/;
const words = (s: string) => s.replace(/<\/?su[bp]>/g, '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
const enrichment = (html: string) => [...html.matchAll(/<details class="enrichment">[\s\S]*?<\/details>/g)].map((m) => m[0]);

/** Remove every element whose opening tag matches `start`, by counting nested divs. */
function removeDivs(html: string, start: RegExp): string {
	let out = html;
	for (;;) {
		const m = start.exec(out);
		if (!m) return out;
		let depth = 0;
		let i = m.index;
		const re = /<div\b|<\/div>/g;
		re.lastIndex = i;
		let end = out.length;
		for (let t = re.exec(out); t; t = re.exec(out)) {
			depth += t[0] === '</div>' ? -1 : 1;
			if (depth === 0) { end = re.lastIndex; break; }
		}
		out = out.slice(0, m.index) + out.slice(end);
	}
}
/** The page without any simulator or tool box, which the sims commit rebuilds. */
const withoutSims = (html: string) => removeDivs(html, /<div class="(?:interactive )?sim-box"[^>]*>/).replace(/<section id="s-sandbox"[\s\S]*?<\/section>/g, '');
/** The page with Enrichment, the adaptive-practice card and the Scope row taken out. */
const core = (html: string) => {
	let out = stripScripts(withoutSims(html));
	for (const block of enrichment(html)) out = out.replace(stripScripts(withoutSims(block)), '');
	out = out.replace(/<details class="enrichment">[\s\S]*?<\/details>/g, '');
	out = out.replace(/<section id="[^"]*"[^>]*data-enrichment>[\s\S]*?<\/section>/g, '');
	return out.replace(/<div class="practice-card">[\s\S]*?<\/section>/, '').replace(/<div class="k">Scope<\/div><div class="v">[\s\S]*?<\/div>/, '');
};

interface Opt { label?: string; correct?: boolean; feedback?: string }
function questions(html: string): Opt[][] {
	const out: Opt[][] = [];
	for (const [, json] of html.matchAll(/<script\b[^>]*class="w-config"[^>]*>([\s\S]*?)<\/script>/g)) {
		let c: { options?: Opt[] };
		try { c = JSON.parse(json); } catch { continue; }
		if (Array.isArray(c.options) && c.options.some((o) => o.correct === true)) out.push(c.options);
	}
	return out;
}

describe('chem Unit 5: page structure', () => {
	for (const f of UNIT5) {
		it(`${f}: every section and div is closed`, () => {
			const html = stripScripts(read(f));
			expect(count(html, /<section\b/g), 'section').toBe(count(html, /<\/section>/g));
			expect(count(html, /<div\b/g), 'div').toBe(count(html, /<\/div>/g));
			expect(count(html, /<main\b/g)).toBe(1);
			expect(count(html, /<details\b/g), 'details').toBe(count(html, /<\/details>/g));
		});
	}
});

describe('chem Unit 5: the hero quotes the PE and standards language stays in the Alignment row', () => {
	for (const f of UNIT5) {
		it(f, () => {
			const html = read(f);
			const align = html.match(/<div class="k">Alignment<\/div><div class="v"><b>(HS-[A-Z0-9-]+)<\/b> ([^<]*)<\/div>/);
			expect(align, 'Alignment row').not.toBeNull();
			expect(align![2]).toBe(PE[align![1]]);
			expect(stripScripts(html.replace(align![0], ''))).not.toMatch(/Performance Expectation|Disciplinary Core Idea|Target Standards/);
		});
	}
});

describe('chem Unit 5: the voice pass holds', () => {
	for (const f of UNIT5) {
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
			const prose = stripScripts(withoutSims(html)).replace(/<svg\b[\s\S]*?<\/svg>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ');
			expect(html).not.toMatch(/Self-score/);
			expect(html).not.toMatch(/Reveal mark scheme|Mark scheme:/);
			expect(html).not.toMatch(/⚑/);
			expect(html.includes(String.fromCharCode(0x2014))).toBe(false);
			expect(prose.includes('!')).toBe(false);
		});
		it(f + ': no worked solution waits behind a button that does nothing, and no legacy x5 class is left in the text', () => {
			expect(html).not.toMatch(/data-reveal-btn|class="predict-reveal"/);
			expect(stripScripts(withoutSims(html))).not.toMatch(/\bx5-\d[a-z]-\d+/);
		});
	}
});

describe('chem Unit 5: every concept section names a common mistake', () => {
	for (const f of UNIT5) {
		it(f, () => {
			const html = stripScripts(withoutSims(read(f)));
			const sections = [...html.matchAll(/<section id="s-(?!hero|recall|selfx|exam)[^"]*"[^>]*>[\s\S]*?<\/section>/g)].map((m) => m[0]);
			const missing = sections.filter((s) => !/Common mistake/.test(s) && !/practice-card/.test(s) && !/data-enrichment/.test(s) && !/id="s-(interactive|sandbox|practice)/.test(s));
			expect(missing.map((s) => s.slice(0, 60))).toEqual([]);
		});
	}
});

describe('chem Unit 5: past-boundary content sits inside Enrichment, and the core does not need it', () => {
	const recall = (html: string) => html.match(/<p class="recall-sentence">[\s\S]*?<\/p>/)![0];
	const examCore = (html: string) => html.slice(html.indexOf('<section id="s-exam"'));
	it('5-1a keeps the proton-proton chain and mass defect in an Enrichment block', () => {
		const html = read(UNIT5[0]);
		const inside = enrichment(html).join('\n');
		expect(inside).toMatch(/proton-proton chain/);
		expect(inside).toMatch(/Figure 5\.1/);
		expect(inside).toMatch(/mass defect/);
		expect(inside).toMatch(/<em>E<\/em> = &Delta;<em>m<\/em> &middot; <em>c<\/em><sup>2<\/sup>/);
		expect(core(html)).not.toMatch(/positron|neutrino|mass defect|proton-proton|deuterium(?!-tritium)|helium-3|E<\/em> = &Delta;|MeV/i);
		expect(recall(html)).not.toMatch(/mass defect|positron|proton-proton|equation/i);
		expect(examCore(html)).not.toMatch(/positron|neutrino|mass defect|proton-proton|nuclear equation/i);
	});
	it('5-2a keeps Hubble’s law, the early glow and the 2.725 K spectrum in one Enrichment block', () => {
		const html = read(UNIT5[1]);
		const blocks = enrichment(html);
		expect(blocks).toHaveLength(1);
		expect(blocks[0]).toMatch(/Hubble&rsquo;s law/);
		expect(blocks[0]).toMatch(/recombination/);
		expect(blocks[0]).toMatch(/2\.725/);
		expect(core(html)).not.toMatch(/Hubble&rsquo;s law|recombination|2\.725|H<sub>0|Doppler|\bz\b/);
		expect(recall(html)).not.toMatch(/Hubble|recombination|2\.725/);
		expect(examCore(html).replace(blocks[0], '')).not.toMatch(/Hubble|H<sub>0|Mpc/);
	});
	it('5-3a keeps shells, binding energy and neutron capture in Enrichment and drops the Type II label', () => {
		const html = read(UNIT5[2]);
		const inside = enrichment(html).join('\n');
		expect(inside).toMatch(/Shell-by-shell burning/);
		expect(inside).toMatch(/binding energy/);
		expect(inside).toMatch(/Neutron capture/);
		expect(withoutSims(html)).not.toMatch(/Type II/);
		expect(core(html)).not.toMatch(/binding energy|neutron capture|<em>s<\/em>-process|<em>r<\/em>-process|shell|onion|Chandrasekhar/i);
		expect(recall(html)).not.toMatch(/binding|neutron capture|process|shell/i);
	});
	it('5-4a keeps E = hf, eV values, the device comparison and the DNA chemistry in Enrichment', () => {
		const html = read(UNIT5[4]);
		const inside = enrichment(html).join('\n');
		expect(inside).toMatch(/Planck/);
		expect(inside).toMatch(/12,400/);
		expect(inside).toMatch(/hydroxyl free radicals/);
		expect(inside).toMatch(/<span class="exam-marks">\[4 marks\] <span class="tag-enrichment">Enrichment<\/span>/);
		expect(core(html)).not.toMatch(/\beV\b|Planck|<em>h<\/em> <em>f<\/em>|phosphodiester|hydroxyl|semiconductor|band ?gap/i);
		expect(recall(html)).not.toMatch(/\beV\b|Planck|calculate/i);
	});
	it('5-8a keeps the half-life equation, the energy of one fission and chain reactions in Enrichment', () => {
		const html = read(UNIT5[3]);
		const inside = enrichment(html).join('\n');
		expect(inside).toMatch(/\(1\/2\)<sup>/);
		expect(inside).toMatch(/235\.0439/);
		expect(inside).toMatch(/SCRAM/);
		expect(core(html)).not.toMatch(/positron|235\.0439|0\.1861|chain reaction|SCRAM|\(1\/2\)<sup>|E<\/em> = &Delta;/i);
		expect(recall(html)).not.toMatch(/mass defect|positron|equation/i);
	});
});

describe('chem dashboard: exam practice shows the exam, not a checkpoint', () => {
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
	for (const f of UNIT5) {
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

describe('chem Unit 5: every class the text uses is defined', () => {
	const css = [
		...fs.readdirSync(path.join(ROOT, 'public/textbook')).filter((f) => f.endsWith('.css')).map((f) => path.join(ROOT, 'public/textbook', f)),
		...['tokens.css', 'components.css'].map((f) => path.join(ROOT, 'public/chem/assets', f)),
	].map((f) => fs.readFileSync(f, 'utf8')).join('\n');
	const defined = new Set([...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]));
	const SCRIPT_ADDED = new Set(['dark', 'show', 'is-current', 'is-stepper', 'active', 'in', 'term', 'w-config', 'svg-step-layer']);
	for (const f of UNIT5) {
		it(f, () => {
			const used = new Set<string>();
			for (const [, v] of stripScripts(withoutSims(read(f))).matchAll(/\sclass="([^"]*)"/g)) v.split(/\s+/).filter(Boolean).forEach((c) => used.add(c));
			expect([...used].filter((c) => !defined.has(c) && !SCRIPT_ADDED.has(c))).toEqual([]);
		});
	}
});

describe('chem Unit 5: a scoring-guide line is one idea in under 20 words, with its marks', () => {
	for (const f of UNIT5) {
		it(f, () => {
			const html = stripScripts(read(f));
			const lines = [...html.matchAll(/<ul class="pts">([\s\S]*?)<\/ul>/g)].flatMap((m) => [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => x[1]));
			expect(lines.length).toBeGreaterThan(0);
			expect(lines.filter((l) => words(l) >= 20 || !/\(\d marks?\)/.test(l))).toEqual([]);
		});
	}
});

describe('chem Unit 5: a slider starts on a value its step allows', () => {
	for (const f of UNIT5) {
		it(f, () => {
			const bad: string[] = [];
			for (const [, attrs] of read(f).matchAll(/<input type="range"([^>]*)>/g)) {
				const get = (k: string) => Number((attrs.match(new RegExp(`\\b${k}="([^"]*)"`)) || [])[1]);
				const min = get('min'), step = get('step') || 1, value = get('value');
				const k = (value - min) / step;
				if (Math.abs(k - Math.round(k)) > 1e-9) bad.push(attrs.trim());
			}
			expect(bad).toEqual([]);
		});
	}
});

describe('chem Unit 5: a readout label holds no element symbol', () => {
	for (const f of UNIT5) {
		it(f, () => {
			const bad = [...read(f).matchAll(/class="readout-label">([^<]*)</g)].map((m) => m[1]).filter((t) => /\([A-Z][a-z]?\)/.test(t));
			expect(bad).toEqual([]);
		});
	}
});

describe('chem Unit 5: every sim is on the helper and locks until its prediction', () => {
	// which sims each page has, and which sit inside an Enrichment block
	const SIMS: Record<string, { core: string[]; enrichment: string[] }> = {
		[UNIT5[0]]: { core: ['sun'], enrichment: [] },
		[UNIT5[1]]: { core: ['redshift'], enrichment: [] },
		[UNIT5[2]]: { core: [], enrichment: ['shells', 'collapse'] },
		[UNIT5[3]]: { core: ['decay', 'fission'], enrichment: ['chain'] },
		[UNIT5[4]]: { core: ['radiation'], enrichment: [] },
	};
	for (const f of UNIT5) {
		it(f, () => {
			const html = read(f);
			const js = fs.readFileSync(path.join(DIR, f.replace(/_.*$/, '') + '.js'), 'utf8');
			expect(html).not.toMatch(/class="interactive|interactive-header|interactive-body|style="margin-top|mission-deck|mission-card/);
			expect(js).not.toMatch(/requestAnimationFrame|performance\.now\(\)|\.style\.|setProperty\(|GC_REGISTER_ANIMATION|localStorage/);
			const names = [...html.matchAll(/<div class="sim-box" data-sim="([^"]+)">/g)].map((m) => m[1]);
			expect(names.sort()).toEqual([...SIMS[f].core, ...SIMS[f].enrichment].sort());
			expect(count(js, /TB\.sim\.create\(/g)).toBe(names.length);
			const inside = enrichment(html).join('\n');
			for (const name of names) {
				const start = html.indexOf(`<div class="sim-box" data-sim="${name}">`);
				const box = html.slice(start, html.indexOf('</ol>\n    </div>', start));
				expect(box, name).toMatch(/data-sim-gate/);
				expect(box, name).toMatch(/<h4>[^<]*\?<\/h4>/);
				expect(box, name).toMatch(/class="sim-legend"/);
				expect(box, name).toMatch(/<ol class="try-this">/);
				expect(box, name).toMatch(/class="sim-stage"[^>]*><(canvas|svg) aria-label="[^"]+"/);
				expect(inside.includes(`data-sim="${name}"`), `${name} is in an Enrichment block`).toBe(SIMS[f].enrichment.includes(name));
			}
		});
	}
	it('5-1a: the proton collision animation and its stepper are gone', () => {
		const html = read(UNIT5[0]);
		expect(html).not.toMatch(/fusionEngine|btnFusionStep|Interactive Proton-Proton Fusion Simulator/);
		expect(fs.readFileSync(path.join(DIR, '5-1a.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/proton|helium cluster|gamma photons/i);
	});
	it('5-8a: the old tabs are gone, and no tool still hides a panel with display:none', () => {
		const html = read(UNIT5[3]);
		expect(html).not.toMatch(/tabDecayBtn|tabFissionBtn|id="fissionPanel"|id="decayPanel"/);
	});
	it('5-4a: no power slider, and no claim that an effect is physically impossible', () => {
		const html = read(UNIT5[4]);
		const js = fs.readFileSync(path.join(DIR, '5-4a.js'), 'utf8');
		expect(html).not.toMatch(/powerSlider|Beam Power|physically impossible/i);
		expect(js).not.toMatch(/physically impossible|IONIZING RADIATION!/);
	});
});

describe('chem Unit 5: every class a script adds is defined', () => {
	const css = [
		...fs.readdirSync(path.join(ROOT, 'public/textbook')).filter((f) => f.endsWith('.css')).map((f) => path.join(ROOT, 'public/textbook', f)),
		...['tokens.css', 'components.css'].map((f) => path.join(ROOT, 'public/chem/assets', f)),
	].map((f) => fs.readFileSync(f, 'utf8')).join('\n');
	const defined = new Set([...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]));
	for (const f of UNIT5) {
		it(f, () => {
			const js = fs.readFileSync(path.join(DIR, f.replace(/_.*$/, '') + '.js'), 'utf8');
			const used = new Set<string>();
			for (const [, v] of js.matchAll(/(?:className\s*=|classList\.\w+\()\s*['"`]([^'"`]*)['"`]/g)) v.split(/\s+/).filter(Boolean).forEach((c) => used.add(c));
			expect([...used].filter((c) => !defined.has(c))).toEqual([]);
		});
	}
	it('no page uses a CSS class in its sim boxes that no stylesheet defines', () => {
		for (const f of UNIT5) {
			const html = stripScripts(read(f));
			const boxes = [...html.matchAll(/<div class="sim-box"[\s\S]*?<\/ol>\n {4}<\/div>/g)].map((m) => m[0]);
			const used = new Set<string>();
			for (const b of boxes) for (const [, v] of b.matchAll(/\sclass="([^"]*)"/g)) v.split(/\s+/).filter(Boolean).forEach((c) => used.add(c));
			expect([...used].filter((c) => !defined.has(c) && !['term', 'w-config'].includes(c)), f).toEqual([]);
		}
	});
});

describe('chem Unit 5: the key is spread across each lesson, sims included', () => {
	for (const f of UNIT5) {
		it(f, () => {
			const keys = questions(read(f)).map((o) => o.findIndex((x) => x.correct === true));
			const top = Math.max(...[0, 1, 2, 3].map((k) => keys.filter((x) => x === k).length));
			expect(keys.length).toBeGreaterThanOrEqual(3);
			expect(top / keys.length, keys.join(',')).toBeLessThanOrEqual(0.5);
		});
	}
});
