/* eslint-disable @typescript-eslint/no-explicit-any -- this test runs untyped book JavaScript in a vm sandbox; its objects have no static type. */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

/**
 * Runs the model of each Unit 1 simulation on its own, with its own constants, and no page.
 * The lesson scripts register their model on window.GC_MODELS before they touch the page, so a
 * stubbed window is enough. This is the "run it headlessly" step of the textbook-work skill:
 * a number that goes negative, a ring that leaves the stage or a readout that disagrees with the
 * lesson text shows up here. (Sim Standard items 9, 10 and 12.)
 */

const ROOT = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, 'public/chem', rel), 'utf8');

function load(lessonScript: string): Record<string, any> {
	const noop = () => undefined;
	const win: Record<string, any> = { GC_MODELS: {} };
	const ctx: Record<string, any> = {
		window: win,
		document: { addEventListener: noop, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
		matchMedia: () => ({ matches: false }),
		console,
	};
	win.window = win;
	vm.runInNewContext(read('assets/elements.js'), ctx);
	vm.runInNewContext(read('assets/bohr.js'), ctx);
	vm.runInNewContext(read(`lessons/${lessonScript}`), ctx);
	const model = Object.values(win.GC_MODELS)[0] as Record<string, any>;
	return Object.assign({}, model, { EL: win.GC_ELEMENTS });
}

describe('element data (1-1a, 1-1b, 1-2a share it)', () => {
	const { EL } = load('1-1a.js');
	it('every element has as many electrons as protons, and a main-group valence is its outer shell', () => {
		for (const e of EL.list) {
			expect(e.shells.reduce((a: number, b: number) => a + b, 0), e.name).toBe(e.z);
			if (e.mainGroup) expect(e.valence, e.name).toBe(e.shells[e.shells.length - 1]);
		}
	});
	it('no shell holds more than its capacity (2, 8, 18, 32)', () => {
		const cap = [2, 8, 18, 32];
		for (const e of EL.list) e.shells.forEach((n: number, i: number) => expect(n, `${e.name} shell ${i + 1}`).toBeLessThanOrEqual(cap[i]));
	});
});

describe('1-1b: the outer ring follows the atomic radius', () => {
	const m = load('1-1b.js');
	const row = (syms: string[], mode: string) => syms.map((s) => ({ s, r: m.ringRadii(mode, m.EL.bySym[s]) }));

	it('across period 2 the outer ring shrinks at every step while the shell count stays at 2', () => {
		const list = row(['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'], 'period');
		for (let i = 1; i < list.length; i++) expect(list[i].r[1], list[i].s).toBeLessThan(list[i - 1].r[1]);
		list.forEach((x) => { expect(x.r.length).toBe(2); expect(x.r[1] - x.r[0], x.s).toBeGreaterThanOrEqual(8); });
	});
	it('down group 1 the outer ring grows and each new shell adds a ring, and every ring fits the 170-unit half stage', () => {
		const list = row(['Li', 'Na', 'K'], 'group');
		for (let i = 1; i < list.length; i++) expect(list[i].r[list[i].r.length - 1]).toBeGreaterThan(list[i - 1].r[list[i - 1].r.length - 1]);
		list.forEach((x, i) => { expect(x.r.length).toBe(i + 2); expect(Math.max(...x.r) + 6).toBeLessThan(170); });
	});
	it('the ring is drawn in proportion to the radius readout (same ratio from lithium to neon)', () => {
		const li = m.EL.bySym.Li, ne = m.EL.bySym.Ne;
		const ratio = m.ringRadii('period', ne)[1] / m.ringRadii('period', li)[1];
		expect(ratio).toBeCloseTo(ne.radius / li.radius, 1);
	});
});

describe('1-2a: bond type from the electronegativity difference', () => {
	const m = load('1-2a.js');
	const bond = (a: string, b: string) => m.classify(m.EL.bySym[a], m.EL.bySym[b]);
	it('reproduces the numbers on the lesson page', () => {
		expect(bond('C', 'O')).toMatchObject({ cls: 'polar' });
		expect(bond('C', 'O').diff).toBeCloseTo(0.89, 2);
		expect(bond('C', 'H')).toMatchObject({ cls: 'nonpolar' });
		expect(bond('H', 'F')).toMatchObject({ cls: 'polar' });          // 1.78, both nonmetals: the page's boundary case
		expect(bond('H', 'F').diff).toBeCloseTo(1.78, 2);
		expect(bond('Na', 'Cl')).toMatchObject({ cls: 'ionic' });
		expect(bond('Na', 'Mg')).toMatchObject({ cls: 'metallic' });
	});
	it('every pair in the pool gets exactly one class, and a bigger difference never makes a nonmetal pair less polar', () => {
		const nonmetals = m.POOL.filter((e: any) => e.kind !== 'metal');
		for (const a of m.POOL) for (const b of m.POOL) expect(['metallic', 'ionic', 'ionic-trans', 'nonpolar', 'polar']).toContain(m.classify(a, b).cls);
		for (const a of nonmetals) for (const b of nonmetals) {
			const r = m.classify(a, b);
			expect(r.cls === 'nonpolar' ? r.diff < 0.5 : r.diff >= 0.5).toBe(true);
		}
	});
});

describe('1-3b: vapor pressure, phases and the molecules', () => {
	const m = load('1-3b.js');
	const keys = ['CO2', 'acetone', 'H2O'];
	it('matches the numbers the lesson text quotes at 20 C and at the boiling point', () => {
		expect(m.vaporPressure('acetone', 20)).toBeCloseTo(24.0, 1);
		expect(m.vaporPressure('H2O', 20)).toBeCloseTo(2.3, 1);
		expect(m.vaporPressure('acetone', 56)).toBeCloseTo(101.3, 1);
		expect(m.vaporPressure('H2O', 100)).toBeCloseTo(101.3, 1);
		expect(m.phaseOf('H2O', 20)).toBe('liquid');
		expect(m.phaseOf('CO2', 20)).toBe('gas');
		expect(m.phaseOf('CO2', -100)).toBe('solid');
	});
	it('stronger attractions give less vapor at every temperature where both are liquid', () => {
		for (let t = 0; t < 56; t += 4) expect(m.vaporPressure('H2O', t), `${t} C`).toBeLessThan(m.vaporPressure('acetone', t));
	});
	it('stays between 0.1 kPa and 1 atm over the whole slider, and never falls as it warms', () => {
		for (const k of keys) {
			let prev = 0;
			for (let t = -100; t <= 120; t++) {
				const v = m.vaporPressure(k, t);
				expect(v).toBeGreaterThanOrEqual(0.1);
				expect(v).toBeLessThanOrEqual(101.3);
				if (k !== 'CO2' || t >= -78) expect(v, `${k} ${t}`).toBeGreaterThanOrEqual(prev - 1e-9);
				prev = v;
			}
		}
	});
	it('keeps every molecule inside the chamber and finite, at every temperature, after a long run', () => {
		for (const k of keys) for (const t of [-100, -50, 0, 20, 56, 100, 120]) {
			m.state.key = k; m.state.temp = t;
			for (let i = 0; i < 4000; i++) m.step();
			for (const mol of m.state.mols) {
				expect(Number.isFinite(mol.x) && Number.isFinite(mol.y), `${k} ${t}`).toBe(true);
				expect(mol.x).toBeGreaterThanOrEqual(14); expect(mol.x).toBeLessThanOrEqual(276);
				expect(mol.y).toBeGreaterThanOrEqual(14); expect(mol.y).toBeLessThanOrEqual(226);
			}
		}
	});
});
