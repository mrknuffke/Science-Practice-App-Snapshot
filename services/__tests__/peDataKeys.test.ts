import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

/**
 * Every chem PE practice item carries the answer key the engine reads (public/chem/pe/pe-engine.js).
 * HS-PS1-2 once used `correctCategory` and `targetValue` where the engine reads `correctCategoryIndex`
 * and `correctValue`, so a student who answered every row of a classification, or typed 5 for the
 * propane coefficient, was marked wrong. Eight more files (ESS1-1, 1-2, 1-3, PS1-7, PS2-6, PS3-1,
 * PS3-4, PS4-4) used `category` by name, `correctRank` and `correctAnswer`; they were converted. The check runs each item function with a stub random
 * generator and asks each item type for the key the engine grades against.
 */

const DIR = path.resolve(__dirname, '../../public/chem/pe/data');

interface Item {
	type?: string;
	id?: string;
	options?: string[];
	correctIndex?: number;
	tier1Options?: string[];
	tier2Options?: string[];
	correctTier1?: number;
	correctTier2?: number;
	correctIndices?: number[];
	items?: unknown[];
	correctOrder?: string[];
	categories?: string[];
	correctValue?: number;
}
interface Skill { id: string; diagnostic: (r: () => number) => Item; diagnosticAlt?: (r: () => number) => Item; practiceLevels: ((r: () => number) => Item)[] }

function load(file: string): Skill[] {
	const win: Record<string, unknown> = {};
	win.window = win;
	vm.createContext(win);
	// Data files draw their figures with the shared helpers, which index.html loads first.
	vm.runInContext(fs.readFileSync(path.join(DIR, '..', 'pe-figures.js'), 'utf8'), win);
	vm.runInContext(fs.readFileSync(path.join(DIR, '..', 'pe-num.js'), 'utf8'), win);
	vm.runInContext(fs.readFileSync(path.join(DIR, file), 'utf8'), win);
	const key = Object.keys(win).find((k) => k.startsWith('PE_DATA_'));
	return (win[key as string] as { skills: Skill[] }).skills;
}

const isIndex = (n: unknown, len: number) => Number.isInteger(n) && (n as number) >= 0 && (n as number) < len;

describe('chem PE data: every item has the key the engine grades against', () => {
	for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.js'))) {
		it(file, () => {
			const problems: string[] = [];
			for (const skill of load(file)) {
				const items = [skill.diagnostic(() => 0.5), ...(skill.diagnosticAlt ? [skill.diagnosticAlt(() => 0.5)] : []), ...skill.practiceLevels.map((f) => f(() => 0.5))];
				for (const it of items) {
					const where = `${it.id ?? skill.id}`;
					const type = it.type ?? 'mcq';
					if (type === 'mcq' && !isIndex(it.correctIndex, (it.options ?? []).length)) problems.push(`${where}: mcq has no correctIndex`);
					if (type === 'two_tier') {
						if (!isIndex(it.correctTier1, (it.tier1Options ?? []).length)) problems.push(`${where}: two_tier has no correctTier1`);
						if (!isIndex(it.correctTier2, (it.tier2Options ?? []).length)) problems.push(`${where}: two_tier has no correctTier2`);
					}
					if (type === 'multi_select' && !(Array.isArray(it.correctIndices) && it.correctIndices.length)) problems.push(`${where}: multi_select has no correctIndices`);
					if (type === 'ranking' && !(Array.isArray(it.correctOrder) && it.correctOrder.length === (it.items ?? []).length)) problems.push(`${where}: ranking has no full correctOrder`);
					else if (type === 'ranking' && JSON.stringify([...(it.items as string[])].sort()) !== JSON.stringify([...(it.correctOrder as string[])].sort())) problems.push(`${where}: ranking correctOrder is not a permutation of its items`);
					if (type === 'categorize') for (const row of it.items as { label?: unknown }[]) if (typeof row.label !== 'string') problems.push(`${where}: a categorize row has no label`);
					if (type === 'categorize') {
						const n = (it.categories ?? []).length;
						(it.items as { correctCategoryIndex?: unknown }[]).forEach((row, i) => {
							if (!isIndex(row.correctCategoryIndex, n)) problems.push(`${where}: row ${i + 1} has no correctCategoryIndex`);
						});
					}
					if (type === 'numeric' && typeof it.correctValue !== 'number') problems.push(`${where}: numeric has no correctValue`);
				}
			}
			expect(problems).toEqual([]);
		});
	}
});

// The engine runs stems, options and hints through formatStudentContent, which wraps glossary
// terms in <span> and rewrites formulas. Inside an SVG <text> that markup breaks the drawing, so
// a structure or particle picture goes in `figure`, which the engine draws untouched.
describe('chem PE data: drawings live in `figure`, never in text the engine rewrites', () => {
	for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.js'))) {
		it(file, () => {
			const problems: string[] = [];
			for (const skill of load(file)) {
				const items = [skill.diagnostic(() => 0.5), ...(skill.diagnosticAlt ? [skill.diagnosticAlt(() => 0.5)] : []), ...skill.practiceLevels.map((f) => f(() => 0.5))];
				for (const it of items as Record<string, unknown>[]) {
					const where = `${it.id ?? skill.id}`;
					for (const [key, value] of Object.entries(it)) {
						if (key !== 'figure' && JSON.stringify(value).includes('<svg')) problems.push(`${where}: <svg> in ${key}`);
					}
					const fig = it.figure;
					if (fig !== undefined && !(typeof fig === 'string' && fig.startsWith('<svg') && fig.includes('role="img"') && fig.includes('aria-label="'))) {
						problems.push(`${where}: figure is not one <svg role="img"> with an aria-label`);
					}
					if (typeof fig === 'string' && /—|&mdash;/.test(fig)) problems.push(`${where}: em-dash in figure`);
				}
			}
			expect(problems).toEqual([]);
		});
	}
});

// Since 2026-11 every skill has a second Level 2 item. The engine serves it as the check after a
// hint-assisted pass and as the retry after Level 1, so it must exist and must be a different
// question, not the first item with its options reshuffled (public/chem/pe/pe-scoring.js).
describe('chem PE data: every skill has its own second Level 2 item', () => {
	for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.js'))) {
		it(file, () => {
			const problems: string[] = [];
			for (const skill of load(file)) {
				if (typeof skill.diagnosticAlt !== 'function') {
					problems.push(`${skill.id}: no diagnosticAlt`);
					continue;
				}
				const a = skill.diagnostic(() => 0.5) as Record<string, unknown>;
				const b = skill.diagnosticAlt(() => 0.5) as Record<string, unknown>;
				if (b.id !== `${skill.id}_diag2`) problems.push(`${skill.id}: diagnosticAlt id is ${String(b.id)}`);
				if (b.skillId !== skill.id) problems.push(`${skill.id}: diagnosticAlt has skillId ${String(b.skillId)}`);
				const answerParts = ['options', 'tier1Options', 'tier2Options', 'items', 'correctValue'];
				const same = answerParts.every((k) => JSON.stringify(a[k]) === JSON.stringify(b[k]));
				if (same) problems.push(`${skill.id}: diagnosticAlt repeats the first item's answers`);
			}
			expect(problems).toEqual([]);
		});
	}
});

// Calculation items draw their numbers per run (public/chem/pe/pe-num.js). Run every item over a
// spread of draws: the key must stay valid, no two options may read the same, no NaN or
// "undefined" may leak into the text, and a numeric answer must appear in its worked solution.
const DRAWS = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 0.999];
const answerShown = (value: number, solution: string) => {
	const plain = solution.replace(/,/g, '');
	return [0, 1, 2, 3].some((d) => plain.includes(Math.abs(value).toFixed(d)));
};

describe('chem PE data: items stay sound across random draws', () => {
	for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.js'))) {
		it(file, () => {
			const problems: string[] = [];
			for (const skill of load(file)) {
				const fns = [skill.diagnostic, ...(skill.diagnosticAlt ? [skill.diagnosticAlt] : []), ...skill.practiceLevels];
				for (const fn of fns) {
					for (const r of DRAWS) {
						const it = fn(() => r) as Item & { workedSolution?: string; correctIndex?: number };
						const where = `${it.id} @${r}`;
						const text = JSON.stringify(it);
						if (/NaN|undefined|Infinity/.test(text)) problems.push(`${where}: NaN or undefined in text`);
						const strings: string[] = [];
						const walk = (v: unknown, key = ''): void => {
							if (key === 'figure') return;
							if (typeof v === 'string') strings.push(v);
							else if (Array.isArray(v)) v.forEach((x) => walk(x));
							else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, k));
						};
						walk(it);
						const leak = strings.find((str) => /\$\{|[{}]/.test(str));
						if (leak) problems.push(`${where}: template leftovers in "${leak.slice(0, 50)}"`);
						for (const list of [it.options, it.tier1Options, it.tier2Options]) {
							if (list && new Set(list).size !== list.length) problems.push(`${where}: two options read the same`);
						}
						if (it.type === 'numeric') {
							if (!Number.isFinite(it.correctValue)) problems.push(`${where}: correctValue not finite`);
							else if (!answerShown(it.correctValue as number, it.workedSolution ?? '')) problems.push(`${where}: answer ${it.correctValue} not in worked solution`);
						}
					}
				}
			}
			expect(problems).toEqual([]);
		});
	}
});

// The calculation and element-swap items converted on 2026-11-02 must keep drawing new sets each run.
const VARIED = [
	'PS1-2.6_diag', 'PS1-2.6_diag2', 'PS1-3.3_L1', 'PS1-5.3_L3', 'PS1-5.6_diag', 'PS1-5.6_diag2', 'PS1-5.6_L3',
	'PS1-7.2_diag', 'PS1-7.2_diag2', 'PS1-7.2_L2', 'PS1-7.3_diag', 'PS1-7.3_diag2', 'PS1-7.3_L1', 'PS1-7.4_diag',
	'PS1-7.4_diag2', 'PS1-7.4_L1', 'PS1-7.5_diag', 'PS1-7.5_diag2', 'PS1-7.5_L2', 'PS1-7.6_diag', 'PS1-7.6_diag2',
	'PS1-7.6_L1', 'PS1-8.4_diag', 'PS1-8.4_diag2', 'PS3-1.2_diag', 'PS3-1.2_diag2', 'PS3-1.3_L1', 'PS3-1.4_diag',
	'PS3-1.4_diag2', 'PS3-1.5_L1', 'PS3-4.6_diag', 'PS3-4.6_diag2', 'PS3-4.6_L1',
	// Element-swap items (2026-11-02): each picks one of several vetted element or compound sets.
	'PS1-1.1_diag', 'PS1-1.1_diag2', 'PS1-1.1_L1', 'PS1-1.2_L1', 'PS1-1.3_diag', 'PS1-1.3_diag2', 'PS1-1.3_L1',
	'PS1-1.3_L2', 'PS1-1.4_diag', 'PS1-1.4_diag2', 'PS1-1.4_L1', 'PS1-1.4_L2', 'PS1-1.5_diag2', 'PS1-1.5_L1',
	'PS1-1.5_L2', 'PS1-1.6_L1', 'PS1-1.6_L2', 'PS1-2.3_diag', 'PS1-2.3_diag2', 'PS1-2.3_L2',
];
describe('chem PE data: varied items draw new sets', () => {
	// Compare the whole item: a ranking or sorting item keeps its stem and swaps the elements it lists.
	it('every listed item has at least two different versions across draws', () => {
		const stems = new Map<string, Set<string>>();
		for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.js'))) {
			for (const skill of load(file)) {
				for (const fn of [skill.diagnostic, ...(skill.diagnosticAlt ? [skill.diagnosticAlt] : []), ...skill.practiceLevels]) {
					for (const r of DRAWS) {
						const it = fn(() => r) as Item;
						if (!stems.has(it.id as string)) stems.set(it.id as string, new Set());
						stems.get(it.id as string)!.add(JSON.stringify(it));
					}
				}
			}
		}
		const frozen = VARIED.filter((id) => (stems.get(id)?.size ?? 0) < 2);
		expect(frozen).toEqual([]);
	});
});
