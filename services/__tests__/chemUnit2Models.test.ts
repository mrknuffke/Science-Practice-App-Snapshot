import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

/**
 * Runs the model of each Unit 2 simulation and tool on its own, with its own constants, and
 * no page. The lesson scripts register their model on window.GC_MODELS before they touch the
 * page, so a stubbed window is enough (the "run it headlessly" step of the textbook-work
 * skill). A number that goes negative, a particle that leaves the stage, or a readout that
 * disagrees with the lesson text shows up here. (Sim Standard items 9, 10 and 12.)
 */

const ROOT = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, 'public/chem', rel), 'utf8');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function load(lessonScript: string, key?: string): Record<string, any> {
	const noop = () => undefined;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const win: Record<string, any> = { GC_MODELS: {} };
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const ctx: Record<string, any> = {
		window: win,
		document: { addEventListener: noop, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
		matchMedia: () => ({ matches: false }),
		console,
	};
	win.window = win;
	vm.runInNewContext(read('assets/elements.js'), ctx);
	vm.runInNewContext(read(`lessons/${lessonScript}`), ctx);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (key ? win.GC_MODELS[key] : Object.values(win.GC_MODELS)[0]) as Record<string, any>;
}

describe('1-2d: the change lab counts the atoms that are drawn', () => {
	const m = load('2-2a.js');
	const scenes = ['water', 'salt', 'combust'];
	const START: Record<string, Record<string, number>> = {
		water: { H: 18, O: 9 },
		salt: { H: 20, O: 10, Na: 2, Cl: 2 },
		combust: { C: 2, H: 8, O: 8 },
	};

	it('starts with the atoms the lesson text and the old dashboard gave', () => {
		for (const s of scenes) expect(m.count(s, 0), s).toEqual(START[s]);
	});

	it('keeps every atom count the same at every step of the slider, in every scene', () => {
		for (const s of scenes) for (let p = 0; p <= 100; p++) expect(m.count(s, p / 100), `${s} at ${p}%`).toEqual(START[s]);
	});

	it('draws every particle inside the design box and never makes a number that is not finite', () => {
		for (const s of scenes) for (let p = 0; p <= 100; p++) {
			const lay = m.SCENES[s].layout(p / 100);
			for (const mol of lay.mols) {
				for (const v of [mol.x, mol.y, mol.a, mol.op]) expect(Number.isFinite(v), `${s} ${p}%`).toBe(true);
				expect(mol.x, `${s} ${p}%`).toBeGreaterThanOrEqual(10);
				expect(mol.x, `${s} ${p}%`).toBeLessThanOrEqual(390);
				expect(mol.y, `${s} ${p}%`).toBeGreaterThanOrEqual(8);
				expect(mol.y, `${s} ${p}%`).toBeLessThanOrEqual(230);
				expect(mol.op).toBeGreaterThanOrEqual(0);
				expect(mol.op).toBeLessThanOrEqual(1);
			}
		}
	});

	it('shows nine whole water molecules from ice to steam, and the products of methane at the end', () => {
		for (let p = 0; p <= 100; p++) {
			const lay = m.SCENES.water.layout(p / 100);
			expect(lay.mols.length).toBe(9);
			expect(lay.mols.every((x: { type: string }) => x.type === 'H2O')).toBe(true);
		}
		const end = m.SCENES.combust.layout(1).mols as { type: string; op: number }[];
		const visible = end.filter((x) => x.op > 0.99).map((x) => x.type).sort();
		expect(visible).toEqual(['CO2', 'CO2', 'H2O', 'H2O', 'H2O', 'H2O']);
		const start = m.SCENES.combust.layout(0).mols as { type: string }[];
		expect(start.map((x) => x.type).sort()).toEqual(['CH4', 'CH4', 'O2', 'O2', 'O2', 'O2']);
	});

	it('never leaves an empty beaker: something is drawn at every step of the methane change', () => {
		for (let p = 0; p <= 100; p++) {
			const lay = m.SCENES.combust.layout(p / 100);
			const opacity = lay.mols.reduce((n: number, x: { op: number }) => n + x.op, 0);
			expect(opacity, `${p}%`).toBeGreaterThan(2);
		}
	});

	it('names the stage at the thresholds the text uses', () => {
		expect(m.SCENES.water.stage(0)).toBe('Solid ice');
		expect(m.SCENES.water.stage(0.5)).toBe('Liquid water');
		expect(m.SCENES.water.stage(1)).toBe('Steam');
		expect(m.SCENES.salt.stage(1)).toBe('Dissolved');
		expect(m.SCENES.combust.stage(0.5)).toBe('Colliding');
	});
});

describe('1-2e: the equation balancer', () => {
	const m = load('1-2e.js');
	const names = Object.keys(m.REACTIONS);
	const all = (rxn: string): Record<string, number>[] => {
		const r = m.REACTIONS[rxn];
		const species: string[] = [...r.left, ...r.right];
		const out: Record<string, number>[] = [];
		const walk = (i: number, cur: Record<string, number>) => {
			if (i === species.length) { out.push({ ...cur }); return; }
			for (let v = m.MIN; v <= m.MAX; v++) walk(i + 1, { ...cur, [species[i]]: v });
		};
		walk(0, {});
		return out;
	};
	const mass = (rxn: string, side: 'left' | 'right', c: Record<string, number>) =>
		m.REACTIONS[rxn][side].reduce((n: number, k: string) => n + c[k] * m.SPECIES[k].mass, 0);

	it('balances exactly the combinations the equations allow, and none at the start (all ones)', () => {
		const solutions: Record<string, string[]> = {
			water: ['2,1,2', '4,2,4'],            // H2, O2, H2O
			ammonia: ['1,3,2'],                    // N2, H2, NH3
			peroxide: ['2,2,1', '4,4,2'],          // H2O2, H2O, O2
			methane: ['1,2,1,2', '2,4,2,4'],       // CH4, O2, CO2, H2O
		};
		for (const rxn of names) {
			const r = m.REACTIONS[rxn];
			const species: string[] = [...r.left, ...r.right];
			const found = all(rxn).filter((c) => m.balanced(rxn, c)).map((c) => species.map((k) => c[k]).join(','));
			expect(found.sort(), rxn).toEqual(solutions[rxn].sort());
			expect(m.balanced(rxn, Object.fromEntries(species.map((k) => [k, 1]))), `${rxn} at the start`).toBe(false);
		}
	});

	it('levels the beam exactly when the atoms match, and tips it to the heavier side otherwise', () => {
		for (const rxn of names) for (const c of all(rxn)) {
			const t = m.tilt(rxn, c);
			if (m.balanced(rxn, c)) { expect(t).toBe(0); continue; }
			expect(Math.abs(t), rxn).toBeGreaterThanOrEqual(4.5);
			expect(Math.abs(t)).toBeLessThanOrEqual(14);
			const heavier = mass(rxn, 'right', c) - mass(rxn, 'left', c);
			if (Math.abs(heavier) > 0.5) expect(Math.sign(t), JSON.stringify(c)).toBe(Math.sign(heavier));
		}
	});

	it('uses molar masses that agree on both sides of every balanced equation', () => {
		for (const rxn of names) for (const c of all(rxn).filter((x) => m.balanced(rxn, x))) {
			expect(Math.abs(mass(rxn, 'left', c) - mass(rxn, 'right', c)), `${rxn} ${JSON.stringify(c)}`).toBeLessThan(0.05);
		}
	});

	it('draws every molecule on its pan and keeps everything inside the design box', () => {
		for (const rxn of names) for (const c of all(rxn)) {
			const lay = m.layout(rxn, c);
			const r = m.REACTIONS[rxn];
			expect(lay.left.mols.length).toBe(r.left.reduce((n: number, k: string) => n + c[k], 0));
			expect(lay.right.mols.length).toBe(r.right.reduce((n: number, k: string) => n + c[k], 0));
			for (const side of [lay.left, lay.right]) {
				for (const mol of side.mols) {
					expect(Math.abs(mol.x - side.cx), `${rxn} ${JSON.stringify(c)}`).toBeLessThanOrEqual(m.PAN - 14);
					expect(mol.y).toBeLessThan(side.plateY);
					expect(mol.y).toBeGreaterThan(0);
				}
				expect(side.plateY + 30).toBeLessThan(m.H);
				expect(side.cx - m.PAN - 5).toBeGreaterThanOrEqual(0);
				expect(side.cx + m.PAN + 5).toBeLessThanOrEqual(m.W);
			}
		}
	});

	it('counts atoms from the formulas: methane with all ones has 4 H on the left and 2 on the right', () => {
		const one = { CH4: 1, O2: 1, CO2: 1, H2O: 1 };
		expect(m.ledger('methane', one)).toEqual([
			{ el: 'C', left: 1, right: 1, match: true },
			{ el: 'H', left: 4, right: 2, match: false },
			{ el: 'O', left: 2, right: 3, match: false },
		]);
	});
});

describe('1-7a: the molar mass builder', () => {
	const m = load('2-7a.js');

	it('reproduces every molar mass the lesson page quotes', () => {
		const quoted: Record<string, number> = { H2O: 18.02, CO2: 44.01, NaCl: 58.44, NaHCO3: 84.01, CH4: 16.05, CaCO3: 100.09, C12H22O11: 342.34 };
		for (const [f, v] of Object.entries(quoted)) expect(m.molarMass(f).total, f).toBe(v);
	});

	it('reads parentheses and counts, in any order of the same atoms', () => {
		expect(m.molarMass('Ca(OH)2').total).toBeCloseTo(40.08 + 32.0 + 2.02, 2);
		expect(m.molarMass('Al2(SO4)3').atoms).toEqual({ Al: 2, S: 3, O: 12 });
		expect(m.molarMass('OH2').total).toBe(18.02);
		expect(m.pretty({ H: 2, O: 1 })).toBe('H₂O');
	});

	it('rejects what is not a formula, never throws, and never returns a mass for it', () => {
		for (const bad of ['', '   ', 'h2o', '2H2O', 'H2O)', '((H)', 'H0', 'H99999', 'Na+', 'H2O!']) {
			const r = m.molarMass(bad);
			expect(r.ok, JSON.stringify(bad)).toBe(false);
			expect(r.total).toBeUndefined();
		}
	});

	it('flags an unknown element and gives no total', () => {
		const r = m.molarMass('Xx2O');
		expect(r.ok).toBe(false);
		expect(r.unknown).toEqual(['Xx']);
	});

	it('lays out every preset with the atoms the formula has, inside the 400 by 250 box', () => {
		for (const [f, atoms] of Object.entries(m.PRESETS) as [string, [string, number, number, number][]][]) {
			const lay = m.layout(m.parse(f));
			expect(lay.length, f).toBe(atoms.length);
			const have: Record<string, number> = {};
			for (const a of lay) have[a.sym] = (have[a.sym] || 0) + 1;
			expect(have, f).toEqual(m.parse(f));
			for (const a of lay) {
				expect(a.x - a.r, f).toBeGreaterThanOrEqual(0);
				expect(a.x + a.r, f).toBeLessThanOrEqual(400);
				expect(a.y - a.r, f).toBeGreaterThanOrEqual(0);
				expect(a.y + a.r, f).toBeLessThanOrEqual(250);
			}
		}
	});

	it('draws a custom formula in rings that stay inside the box, and declines to draw too many atoms', () => {
		for (const f of ['H2SO4', 'C2H5OH', 'Ca(OH)2', 'C8H18', 'Fe2O3', 'C12H22O11', 'C20H20', 'KMnO4']) {
			const atoms = m.parse(f);
			const total = Object.values(atoms as Record<string, number>).reduce((n, v) => n + v, 0);
			const lay = m.layout(atoms);
			if (total > m.MAX_DRAWN) { expect(lay, f).toBeNull(); continue; }
			expect(lay.length, f).toBe(total);
			for (const a of lay) {
				expect(Number.isFinite(a.x) && Number.isFinite(a.y), f).toBe(true);
				expect(a.x - a.r, f).toBeGreaterThanOrEqual(0);
				expect(a.x + a.r, f).toBeLessThanOrEqual(400);
				expect(a.y - a.r, f).toBeGreaterThanOrEqual(0);
				expect(a.y + a.r, f).toBeLessThanOrEqual(250);
			}
		}
		expect(m.layout(m.parse('C40H80'))).toBeNull();
	});

	it('lays out the same custom formula the same way every time', () => {
		expect(JSON.stringify(m.layout(m.parse('C2H5OH')))).toBe(JSON.stringify(m.layout(m.parse('C2H5OH'))));
	});
});

describe('1-7b: the conversion factor builder', () => {
	const m = load('2-7b.js', '1-7b');
	const P = m.PROBLEMS as { text: string; startVal: number; startUnit: string; target: string; correctVal: number; correctUnit: string; order: number[]; factors: { num: string; den: string; numVal: number; denVal: number; substance: string; isCorrect: boolean }[] }[];

	it('has exactly one correct card per problem, and it reaches the answer the lesson text gives', () => {
		for (const p of P) {
			const right = p.factors.filter((f) => f.isCorrect);
			expect(right.length, p.text).toBe(1);
			const r = m.evaluate(p, right[0]);
			expect(r.state).toBe('correct');
			expect(r.value, p.text).toBeCloseTo(p.correctVal, 2);
		}
		expect(P.map((p) => p.correctVal)).toEqual([2.0, 146.1, 2.0, 8.02, 2.0]);
	});

	it('sends every other card to the right kind of feedback', () => {
		for (const p of P) for (const f of p.factors.filter((x) => !x.isCorrect)) {
			const r = m.evaluate(p, f);
			if (f.substance !== p.target) expect(r.state).toBe('wrong-substance');
			else expect(r.state, `${p.startUnit}: ${f.num} / ${f.den}`).toBe('wrong-orientation');
			expect(r.value).toBeUndefined();
		}
	});

	it('shows the cards in an order that never puts the correct card in the same place twice in a row, and in every place at least once', () => {
		const slots = P.map((p) => p.order.findIndex((fi) => p.factors[fi].isCorrect));
		for (let i = 1; i < slots.length; i++) expect(slots[i], `problem ${i + 1}`).not.toBe(slots[i - 1]);
		expect(new Set(slots).size).toBeGreaterThanOrEqual(3);
		for (const p of P) expect([...p.order].sort()).toEqual([0, 1, 2, 3]);
	});

	it('uses the molar masses the lesson uses (18.02, 58.44, 44.01, 16.04, 84.01)', () => {
		const masses = new Set(P.flatMap((p) => p.factors.map((f) => Math.max(f.numVal, f.denVal))));
		expect([...masses].sort((a, b) => a - b)).toEqual([16.04, 18.02, 44.01, 58.44, 84.01]);
	});
});

describe('1-7b: the empirical formula calculator', () => {
	const m = load('2-7b.js', '1-7b-empirical');

	it('finds the empirical and molecular formulas for glucose, caffeine and vitamin C', () => {
		expect(m.solve(m.DATA.glucose)).toMatchObject({ empirical: 'CH₂O', n: 6, molecular: 'C₆H₁₂O₆', k: 1 });
		expect(m.solve(m.DATA.caffeine)).toMatchObject({ empirical: 'C₄H₅N₂O', n: 2, molecular: 'C₈H₁₀N₄O₂' });
		expect(m.solve(m.DATA.vitaminC)).toMatchObject({ empirical: 'C₃H₄O₃', n: 2, molecular: 'C₆H₈O₆', k: 3 });
	});

	it('offers three different guesses, with the right one in each place at most once and never listed twice', () => {
		const spots: number[] = [];
		for (const key of Object.keys(m.DATA)) {
			const item = m.DATA[key];
			const options = [m.solve(item).empirical, ...item.distractors];
			expect(new Set(options).size).toBe(3);
			spots.push(m.GUESS_ORDER[key].indexOf(0));
		}
		expect([...spots].sort()).toEqual([0, 1, 2]);
	});

	it('has percentages that add to 100 and masses that add up to the molar mass', () => {
		for (const key of Object.keys(m.DATA)) {
			const item = m.DATA[key];
			const total = item.elements.reduce((n: number, e: { massG: number }) => n + e.massG, 0);
			expect(total, key).toBeCloseTo(100, 1);
			const sol = m.solve(item);
			expect(sol.empMass * sol.n, key).toBeCloseTo(item.molarMass, 0);
		}
	});
});

describe('1-7c: the BCA simulator', () => {
	const m = load('2-7c.js', '1-7c');
	const combos: [number, number, number][] = [];
	for (let a = 0; a <= 4; a++) for (let b = 0; b <= 8; b++) for (let p = 0; p <= 100; p += 5) combos.push([a, b, p]);

	it('matches the numbers on the page: 2.0 CH4 with 4.0 O2 uses both, 3.0 CH4 with 4.0 O2 leaves 1.0 CH4 and makes 4.0 H2O', () => {
		const a = m.bca(2, 4, 100);
		expect(a.limiting).toBe('both');
		expect(a.after).toEqual({ CH4: 0, O2: 0, CO2: 2, H2O: 4 });
		const b = m.bca(3, 4, 100);
		expect(b.limiting).toBe('O2');
		expect(b.after).toEqual({ CH4: 1, O2: 0, CO2: 2, H2O: 4 });
		const c = m.bca(2, 5, 100);
		expect(c.limiting).toBe('CH4');
		expect(c.after).toEqual({ CH4: 0, O2: 1, CO2: 2, H2O: 4 });
		// the exam question (1.50 mol CH4 and 2.00 mol O2) is outside the sliders, but the same model answers it
		const d = m.bca(1.5, 2, 100);
		expect(d.limiting).toBe('O2');
		expect(d.after.H2O).toBeCloseTo(2.0, 9);
		expect(d.after.CH4).toBeCloseTo(0.5, 9);
	});

	it('keeps the change row in the ratio 1 : 2 : 1 : 2 and never lets a quantity go negative', () => {
		for (const [a, b, p] of combos) {
			const r = m.bca(a, b, p);
			expect(r.change.O2, `${a} ${b} ${p}`).toBeCloseTo(2 * r.change.CH4, 9);
			expect(r.change.CO2).toBeCloseTo(-r.change.CH4, 9);
			expect(r.change.H2O).toBeCloseTo(2 * r.change.CO2, 9);
			for (const v of Object.values(r.after) as number[]) expect(v, `${a} ${b} ${p}`).toBeGreaterThanOrEqual(-1e-9);
			expect(r.after.CH4 + r.after.CO2).toBeCloseTo(a, 9);          // carbon is conserved
		}
	});

	it('draws one molecule per half mole: the picture and the table agree at every progress', () => {
		for (const [a, b, p] of combos) {
			const r = m.bca(a, b, p);
			const items = m.bays(a, b, p) as { kind: string; p?: number }[];
			const ev = items.filter((i) => i.kind === 'event');
			expect(ev.length, `${a} ${b}`).toBe(m.events(a, b));
			expect(ev.length).toBe(2 * r.xmax);
			expect(ev.reduce((n, i) => n + (i.p ?? 0), 0), `${a} ${b} ${p}`).toBeCloseTo(2 * r.x, 9);
		}
	});

	it('conserves every atom in what is drawn, at every progress', () => {
		for (const [a, b, p] of combos) {
			expect(m.atoms(a, b, p), `${a} ${b} ${p}`).toEqual({ C: 2 * a, H: 8 * a, O: 4 * b });
		}
	});

	it('fits every combination into the eight bays, with no bay holding two kinds of spare', () => {
		for (const [a, b, p] of combos) {
			const items = m.bays(a, b, p) as { kind: string; bay: number }[];
			for (const i of items) { expect(i.bay).toBeGreaterThanOrEqual(0); expect(i.bay).toBeLessThan(m.BAYS.length); }
			const byBay: Record<number, Set<string>> = {};
			for (const i of items) (byBay[i.bay] ||= new Set()).add(i.kind);
			for (const kinds of Object.values(byBay)) expect(kinds.size, `${a} ${b}`).toBe(1);
			const o2 = items.filter((i) => i.kind === 'spare-o2');
			const perBay: Record<number, number> = {};
			for (const i of o2) perBay[i.bay] = (perBay[i.bay] || 0) + 1;
			for (const n of Object.values(perBay)) expect(n).toBeLessThanOrEqual(2);
		}
	});

	it('starts unsolved: at the default amounts and 0% nothing has reacted', () => {
		const r = m.bca(2, 5, 0);
		expect(r.x).toBe(0);
		expect(r.after).toEqual({ CH4: 2, O2: 5, CO2: 0, H2O: 0 });
	});
});

describe('1-7c: the s\'mores factory', () => {
	const m = load('2-7c.js', '1-7c-smores');

	it('at the starting amounts the crackers are limiting even though the marshmallows are the fewest', () => {
		const f = m.factory({ graham: 10, marsh: 6, choco: 8 });
		expect(f.made).toBe(5);
		expect(f.limiting).toEqual(['graham']);
		expect(f.left).toEqual({ graham: 0, marsh: 1, choco: 3 });
		expect(f.ratio).toEqual({ graham: 5, marsh: 6, choco: 8 });
	});

	it('uses the recipe numbers for every slider setting, never leaves a negative amount, and uses only whole s\'mores', () => {
		for (let g = 2; g <= 20; g += 2) for (let ma = 1; ma <= 12; ma++) for (let c = 1; c <= 12; c++) {
			const f = m.factory({ graham: g, marsh: ma, choco: c });
			expect(Number.isInteger(f.made)).toBe(true);
			for (const v of Object.values(f.left) as number[]) expect(v, `${g} ${ma} ${c}`).toBeGreaterThanOrEqual(0);
			expect(f.left.graham + f.made * m.RECIPE.graham).toBe(g);
			expect(f.limiting.length).toBeGreaterThanOrEqual(1);
			// at least one ingredient has nothing left to make another s'more with
			const another = f.left.graham >= 2 && f.left.marsh >= 1 && f.left.choco >= 1;
			expect(another, `${g} ${ma} ${c}`).toBe(false);
		}
	});

	it('names the two lowest ingredients together when they tie', () => {
		expect(m.factory({ graham: 12, marsh: 6, choco: 9 }).limiting.sort()).toEqual(['graham', 'marsh']);
	});
});

describe('2-6a: the chain simulator and the argument builders', () => {
	const m = load('2-6a.js');
	const words = (s: string) => s.trim().split(/\s+/).length;

	it('uses the melting and boiling points the lesson text quotes', () => {
		expect(m.MP).toEqual({ sat: 69, unsat: 13 });
		expect(m.BP).toEqual({ propane: -42, octane: 125 });
		expect([m.stateOf('lipids', 'left', 20), m.stateOf('lipids', 'right', 20)]).toEqual(['solid', 'liquid']);
		expect([m.stateOf('lipids', 'left', 69), m.stateOf('lipids', 'left', 70)]).toEqual(['solid', 'liquid']);
		expect([m.stateOf('lipids', 'right', 13), m.stateOf('lipids', 'right', 14)]).toEqual(['solid', 'liquid']);
		expect([m.stateOf('alkanes', 'left', 20), m.stateOf('alkanes', 'right', 20)]).toEqual(['gas', 'liquid']);
		expect([m.stateOf('alkanes', 'left', -42), m.stateOf('alkanes', 'left', -41)]).toEqual(['liquid', 'gas']);
		expect([m.stateOf('alkanes', 'right', 124), m.stateOf('alkanes', 'right', 125)]).toEqual(['liquid', 'gas']);
	});

	it('is not solved at load: the default path and temperature put the two chambers in different states', () => {
		const p = m.PATHS.lipids;
		expect(p.def).toBe(20);
		expect(m.stateOf('lipids', 'left', p.def)).not.toBe(m.stateOf('lipids', 'right', p.def));
	});

	it('keeps every atom of every chain inside its chamber, at every temperature and moment', () => {
		const outside: string[] = [];
		for (const path of Object.keys(m.PATHS)) {
			const P = m.PATHS[path];
			const temps = [...Array.from({ length: Math.floor((P.max - P.min) / 3) + 1 }, (_, i) => P.min + 3 * i), P.max];
			for (const side of ['left', 'right']) for (const t of temps) for (let T = 0; T < 40; T += 1.13) {
				for (const ch of m.chains(path, side, t, T) as { pts: { x: number; y: number }[] }[]) for (const p of ch.pts) {
					const ok = Number.isFinite(p.x) && Number.isFinite(p.y) && p.x > 6 && p.x < m.W - 6 && p.y > 24 && p.y < m.H - 6;
					if (!ok) outside.push(`${path} ${side} ${t} ${T.toFixed(2)}: ${p.x.toFixed(1)}, ${p.y.toFixed(1)}`);
				}
			}
		}
		expect(outside.slice(0, 5)).toEqual([]);
	});

	it('draws five chains in each lipid and octane chamber and six propane chains, with nine, eight and three carbons', () => {
		expect(m.chains('lipids', 'left', 20, 0).length).toBe(5);
		expect(m.chains('lipids', 'left', 20, 0)[0].pts.length).toBe(9);
		expect(m.chains('lipids', 'right', 20, 0)[0].pts.length).toBe(8);
		expect(m.chains('alkanes', 'right', 20, 0)[0].pts.length).toBe(8);
		expect(m.chains('alkanes', 'left', -50, 0).length).toBe(6);
		expect(m.chains('alkanes', 'left', -50, 0)[0].pts.length).toBe(3);
		expect(m.newGas().length).toBe(6);
	});

	it('keeps the propane gas inside the chamber after a long run, at the coldest and the hottest setting', () => {
		for (const t of [-41, 0, 20, 100, 150]) {
			const gas = m.newGas();
			for (let i = 0; i < 20000; i++) m.stepGas(gas, t);
			for (const g of gas) {
				expect(Number.isFinite(g.x) && Number.isFinite(g.y), `${t}`).toBe(true);
				expect(g.x).toBeGreaterThanOrEqual(30); expect(g.x).toBeLessThanOrEqual(280);
				expect(g.y).toBeGreaterThanOrEqual(30); expect(g.y).toBeLessThanOrEqual(170);
			}
		}
	});

	it('says something true for every chamber and temperature, naming the temperature', () => {
		for (const path of Object.keys(m.PATHS)) {
			const P = m.PATHS[path];
			for (const side of ['left', 'right']) for (let t = P.min; t <= P.max; t += 5) {
				const text = m.describe(path, side, t) as string;
				expect(text.length).toBeGreaterThan(40);
				expect(text).toContain(String(Math.abs(t)));
				expect(text).not.toMatch(/undefined|NaN/);
			}
		}
	});

	it('gives every argument step one right and one wrong statement, in the same length range, and puts the right one in different places', () => {
		for (const path of Object.keys(m.ARGUMENT)) {
			expect(m.ARGUMENT[path].length).toBe(5);
			m.ARGUMENT[path].forEach((pair: string[], i: number) => {
				const [r, w] = pair;
				expect(Math.max(words(r), words(w)), `${path} ${i}`).toBeLessThanOrEqual(22);
				expect(Math.max(words(r), words(w)) / Math.min(words(r), words(w)), `${path} ${i}`).toBeLessThanOrEqual(1.8);
			});
		}
		const rightSlot = m.ARG_ORDER.map((o: number[]) => o.indexOf(0));
		expect(new Set(rightSlot).size).toBe(2);
	});

	it('gives every hazard layer one right and two wrong statements of similar length', () => {
		for (const key of Object.keys(m.GHS)) {
			expect(m.GHS[key].layers.length).toBe(4);
			for (const layer of m.GHS[key].layers as string[][]) {
				expect(layer.length).toBe(3);
				const lens = layer.map(words);
				expect(Math.max(...lens), key).toBeLessThanOrEqual(22);
				expect(Math.max(...lens) / Math.min(...lens), `${key}: ${layer[0]}`).toBeLessThanOrEqual(1.8);
			}
		}
	});
});
