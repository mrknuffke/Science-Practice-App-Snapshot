import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

/**
 * Scoring rules for the chem PE adaptive practice (public/chem/pe/pe-scoring.js).
 *
 * Until 2026-11 a student who missed a Level 2 item twice, then passed Level 1, was served
 * the same Level 2 item again (every diagnostic is fixed; only the option order changed) and
 * a pass counted as Proficient. A second-try pass after a hint also counted as Proficient,
 * and the study tips read two fields nothing ever set, so every skill was flagged for review.
 * These tests pin the replacement rules: only a first-try answer counts as independent
 * evidence, and no item repeats inside a skill.
 */

const PE_DIR = path.resolve(__dirname, '../../public/chem/pe');

type Outcome = 'first' | 'second' | 'miss';
type Stage = 'L2' | 'L3' | 'CONFIRM' | 'L1' | 'L2B' | 'DONE';
interface StepResult { stage: Stage; score: number; done: boolean }
interface SkillLike { id: string; title?: string; watchOut?: string; diagnosticAlt?: () => unknown }
interface Progress { stage?: Stage; score?: number; done?: boolean; path?: { stage: Stage; outcome: Outcome }[]; earnedLevel?: string }
interface Scoring {
	step: (stage: Stage, outcome: Outcome, skill?: SkillLike) => StepResult;
	skillScore: (prog?: Progress) => number;
	summarize: (skills: SkillLike[], prog: Record<string, Progress>) => {
		counts: Record<number, number>; total: number; proficientOrAbove: number; median: number; levelString: string;
	};
	confirmItemLevel: (skill: SkillLike) => number;
}

function sandbox(withEngine = false): Record<string, unknown> {
	const win: Record<string, unknown> = {
		document: { addEventListener() {} },
		localStorage: { getItem: () => null, setItem() {} },
	};
	win.window = win;
	vm.createContext(win);
	vm.runInContext(fs.readFileSync(path.join(PE_DIR, 'pe-scoring.js'), 'utf8'), win);
	if (withEngine) vm.runInContext(fs.readFileSync(path.join(PE_DIR, 'pe-engine.js'), 'utf8'), win);
	return win;
}

const S = sandbox().PEScoring as Scoring;
const plain: SkillLike = { id: 'X.1' };
const withAlt: SkillLike = { id: 'X.2', diagnosticAlt: () => ({}) };

/** Run a skill to the end from a list of outcomes; return the final score and stages visited. */
function run(skill: SkillLike, outcomes: Outcome[]): { score: number; stages: Stage[] } {
	let stage: Stage = 'L2';
	const stages: Stage[] = [];
	let res: StepResult = { stage, score: 0, done: false };
	for (const o of outcomes) {
		stages.push(stage);
		res = S.step(stage, o, skill);
		stage = res.stage;
		if (res.done) break;
	}
	expect(res.done, `path ${outcomes.join(',')} did not finish`).toBe(true);
	return { score: res.score, stages };
}

describe('PE scoring: each path ends at the right level', () => {
	const cases: [string, SkillLike, Outcome[], number][] = [
		['L2 first, L3 first', plain, ['first', 'first'], 4],
		['L2 first, L3 second try', plain, ['first', 'second'], 3],
		['L2 first, L3 missed', plain, ['first', 'miss'], 3],
		['L2 second try, check first', plain, ['second', 'first'], 3],
		['L2 second try, check second', plain, ['second', 'second'], 2],
		['L2 second try, check missed', plain, ['second', 'miss'], 2],
		['L2 missed, L1 right, no second L2 item', plain, ['miss', 'first'], 2],
		['L2 missed, L1 second try, no second L2 item', plain, ['miss', 'second'], 2],
		['L2 missed, L1 missed', plain, ['miss', 'miss'], 1],
		['L2 missed, L1 right, new L2 first', withAlt, ['miss', 'first', 'first'], 3],
		['L2 missed, L1 right, new L2 second try', withAlt, ['miss', 'first', 'second'], 2],
		['L2 missed, L1 right, new L2 missed', withAlt, ['miss', 'first', 'miss'], 2],
		['L2 missed, L1 missed, with a second L2 item', withAlt, ['miss', 'miss'], 1],
	];
	for (const [name, skill, outcomes, expected] of cases) {
		it(name, () => expect(run(skill, outcomes).score).toBe(expected));
	}

	it('a second-try answer never raises a result above a first-try answer on the same path', () => {
		for (const skill of [plain, withAlt]) {
			for (const a of ['first', 'second', 'miss'] as Outcome[]) {
				for (const b of ['first', 'second', 'miss'] as Outcome[]) {
					for (const c of ['first', 'second', 'miss'] as Outcome[]) {
						const swapped = [a, b, c].map((o) => (o === 'second' ? 'first' : o)) as Outcome[];
						expect(run(skill, [a, b, c]).score).toBeLessThanOrEqual(run(skill, swapped).score);
					}
				}
			}
		}
	});
});

describe('PE scoring: no item is served twice inside a skill', () => {
	// Item each stage serves: L2 uses the primary Level 2 item, L2B and CONFIRM (when a second
	// Level 2 item exists) use the other one, CONFIRM without one uses Level 3.
	const itemFor = (stage: Stage, skill: SkillLike) => {
		if (stage === 'L2') return 'L2-primary';
		if (stage === 'L2B') return 'L2-other';
		if (stage === 'CONFIRM') return S.confirmItemLevel(skill) === 2 ? 'L2-other' : 'L3';
		return stage;
	};
	for (const skill of [plain, withAlt]) {
		it(skill.diagnosticAlt ? 'with a second Level 2 item' : 'with one Level 2 item', () => {
			const all: Outcome[] = ['first', 'second', 'miss'];
			for (const a of all) for (const b of all) for (const c of all) {
				const items = run(skill, [a, b, c]).stages.map((st) => itemFor(st, skill));
				expect(new Set(items).size, items.join(' > ')).toBe(items.length);
			}
		});
	}
});

describe('PE scoring: summaries and saved receipts', () => {
	it('summarizes counts, the median and the sealed Proficient-or-above count', () => {
		const skills = ['a', 'b', 'c', 'd'].map((id) => ({ id }));
		const prog: Record<string, Progress> = {
			a: { done: true, score: 4 }, b: { done: true, score: 3 }, c: { done: true, score: 2 }, d: { done: true, score: 1 },
		};
		const sum = S.summarize(skills, prog);
		expect(sum.counts).toEqual({ 4: 1, 3: 1, 2: 1, 1: 1 });
		expect(sum.proficientOrAbove).toBe(2);
		expect(sum.median).toBe(2.5);
		expect(sum.levelString).toBe('4321');
	});

	it('reads receipts saved before the change at the level they were sealed with', () => {
		expect(S.skillScore({ earnedLevel: 'Level 3 - Mastered' })).toBe(4);
		expect(S.skillScore({ earnedLevel: 'Level 2 - Proficient' })).toBe(3);
		expect(S.skillScore({ earnedLevel: 'Level 2 - Remediated' })).toBe(3);
		expect(S.skillScore({ earnedLevel: 'Level 1 - Developing' })).toBe(2);
		expect(S.skillScore({ earnedLevel: 'Needs Practice' })).toBe(1);
		expect(S.skillScore({ earnedLevel: 'Pending' })).toBe(0);
	});
});

describe('PE engine: study tips follow the results', () => {
	const win = sandbox(true);
	const engine = win.PEEngine as { generateStudyTips: (s: SkillLike[], p: Record<string, Progress>) => { type: string; skillId: string }[] };
	const skills = ['PS1-1.1', 'PS1-1.2', 'PS1-1.3', 'PS1-1.4'].map((id) => ({ id, title: id, watchOut: 'w' }));

	it('a fully mastered deck gets no priority review', () => {
		const prog = Object.fromEntries(skills.map((s) => [s.id, { done: true, score: 4 }]));
		const tips = engine.generateStudyTips(skills, prog);
		expect(tips.filter((t) => t.type === 'priority')).toEqual([]);
	});

	it('flags only the low skills, lowest first, then reinforces Proficient ones', () => {
		const scores = [4, 2, 1, 3];
		const prog = Object.fromEntries(skills.map((s, i) => [s.id, { done: true, score: scores[i] }]));
		const tips = engine.generateStudyTips(skills, prog);
		expect(tips.map((t) => `${t.type}:${t.skillId}`)).toEqual([
			'priority:PS1-1.3', 'priority:PS1-1.2', 'reinforce:PS1-1.4',
		]);
	});
});

describe('PE pages escape names before they reach HTML', () => {
	// ?name= and saved receipts are attacker-controllable, and /chem/pe/ shares an origin with
	// the signed-in app. Until 2026-11 both pages put the raw name into innerHTML.
	const engine = fs.readFileSync(path.join(PE_DIR, 'pe-engine.js'), 'utf8');
	const verify = fs.readFileSync(path.join(PE_DIR, 'verify.html'), 'utf8');

	it('pe-engine.js never interpolates a raw student name or saved-receipt field', () => {
		const raw = engine.match(/\$\{(this\.state\.studentName|item\.(studentName|peId|dateStr|levels|digitalSeal))\}/g) ?? [];
		expect(raw).toEqual([]);
	});

	it('verify.html builds its result only from escaped values', () => {
		const result = verify.slice(verify.indexOf('if (matched) {'), verify.indexOf('// Theme Toggle Handler'));
		expect(result).not.toMatch(/\$\{(name|peId|sealInput|score|total)\}/);
	});

	it('verify.html never prints the correct code for a mismatch', () => {
		expect(verify).not.toMatch(/correctSealToday|Expected seal/);
	});
});

describe('PE engine and verifier copy follows VOICE.md', () => {
	// The data banks are guarded by questionRegister.test.ts; the screen text in the engine and the
	// verifier was not, and drifted into testing-board register ("Saved!", "Mastery Certification").
	const strip = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
	const BANNED: [RegExp, string][] = [
		[/—|&mdash;/, 'em-dash'],
		[/[A-Za-z)]!(?=['"`<\s])/, 'exclamation mark'],
		[/\b(please|very|quite|simply|essentially|note that|in order to)\b/i, 'filler word'],
		[/\b(official|certif\w*|tamper\w*|cryptograph\w*|authentic\w*)\b/i, 'overclaiming word'],
	];
	for (const file of ['pe-engine.js', 'verify.html']) {
		it(file, () => {
			const src = strip(fs.readFileSync(path.join(PE_DIR, file), 'utf8'));
			const hits = BANNED.flatMap(([re, name]) => {
				const m = src.match(re);
				return m ? [`${name}: "${src.slice(Math.max(0, (m.index ?? 0) - 30), (m.index ?? 0) + 30)}"`] : [];
			});
			expect(hits).toEqual([]);
		});
	}
});

describe('XL Chem practice pages escape names and keep the code secret', () => {
	// Same flaw as the PE pages: ?name= reached innerHTML on the printed receipt, and the checker
	// printed the expected code on a mismatch.
	const XL_DIR = path.resolve(__dirname, '../../public/chem/xl/practice');
	for (let n = 1; n <= 8; n++) {
		it(`unit${n}.js escapes the name on the receipt`, () => {
			const src = fs.readFileSync(path.join(XL_DIR, `unit${n}.js`), 'utf8');
			expect(src).not.toMatch(/<b>Student:<\/b> \$\{this\.studentName\}/);
		});
	}
	it('verify.html never prints the correct code and escapes what it shows', () => {
		const src = fs.readFileSync(path.join(XL_DIR, 'verify.html'), 'utf8');
		expect(src).not.toMatch(/correctSealToday|Expected seal/);
		const result = src.slice(src.indexOf('const statsHTML'), src.indexOf("document.getElementById('btnInspect')"));
		expect(result.length).toBeGreaterThan(100);
		expect(result).not.toMatch(/\$\{(name|sealInput|unit|score|total|runParam|matchedDate|stats\.\w+)\}/);
	});
});
