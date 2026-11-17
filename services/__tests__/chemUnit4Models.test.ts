import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

/**
 * Runs the model of each Unit 4 simulation on its own, with its own constants, and no page. The
 * lesson scripts register their model on window.GC_MODELS before they touch the page, so a
 * stubbed window is enough (the "run it headlessly" step of the textbook-work skill). A number
 * that goes negative, a particle that leaves the vessel, a mixture that does not settle where its
 * own constant says, or a value that disagrees with the lesson text shows up here. (Sim Standard
 * items 8, 9, 10, 12, 13.)
 */

const ROOT = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, 'public/chem', rel), 'utf8');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function load(lessonScript: string, key: string): Record<string, any> {
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
	vm.runInNewContext(read(`lessons/${lessonScript}`), ctx);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return win.GC_MODELS[key] as Record<string, any>;
}
const near = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) <= tol;

describe('4-1a: the collision sandbox', () => {
	const m = load('4-1a.js', '4-1a');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const run = (o: Record<string, any>, seed?: number) => {
		const s = m.newSystem(o, seed);
		s.counting = true;
		let steps = 0;
		while (!m.finished(s)) { m.step(s, 1 / 60); steps++; }
		return { sys: s, steps: steps, coll: s.coll as number, react: s.react as number };
	};

	it('runs 10 simulated seconds in 600 fixed steps, so the result is the same on every screen', () => {
		const a = run(m.DEFAULTS), b = run(m.DEFAULTS);
		expect(a.steps).toBe(600);
		expect([a.coll, a.react]).toEqual([b.coll, b.react]);
		expect(a.sys.series.length).toBe(41);
	});

	it('gives the numbers the Try this steps promise', () => {
		const cold = run({ T: 15, nA: 25 }), hot = run({ T: 80, nA: 25 }), dbl = run({ T: 15, nA: 50 }), lump = run({ T: 15, nA: 25, lump: true });
		expect([cold.coll, cold.react]).toEqual([478, 23]);
		expect([hot.coll, hot.react]).toEqual([493, 102]);
		expect([dbl.coll, dbl.react]).toEqual([971, 44]);
		expect([lump.coll, lump.react]).toEqual([49, 2]);
	});

	it('does not start solved: the default vessel is ready, with nothing counted until a run starts', () => {
		const s = m.newSystem(m.DEFAULTS);
		for (let i = 0; i < 600; i++) m.step(s, 1 / 60);
		expect(s.counting).toBe(false);
		expect([s.coll, s.react]).toEqual([0, 0]);
		expect(m.DEFAULTS).toEqual({ T: 15, nA: 25, lump: false });
	});

	it('shows the lesson text: heat raises the share of collisions that react far more than the number of collisions', () => {
		for (let sd = m.SEED; sd < m.SEED + 24; sd += 3) {
			const cold = run({ T: 15, nA: 25 }, sd), hot = run({ T: 80, nA: 25 }, sd);
			expect(hot.react, `seed ${sd}`).toBeGreaterThan(2.5 * cold.react);
			expect(hot.coll / cold.coll, `seed ${sd}`).toBeGreaterThan(0.65);
			expect(hot.coll / cold.coll, `seed ${sd}`).toBeLessThan(1.7);
		}
	});

	it('answers the prediction: heating beats doubling A, and a lump is the worst', () => {
		for (let sd = m.SEED; sd < m.SEED + 24; sd += 3) {
			const base = run({ T: 15, nA: 25 }, sd), heat = run({ T: 80, nA: 25 }, sd), dbl = run({ T: 15, nA: 50 }, sd), lump = run({ T: 15, nA: 25, lump: true }, sd);
			expect(heat.react, `seed ${sd}`).toBeGreaterThan(dbl.react);
			expect(dbl.react, `seed ${sd}`).toBeGreaterThan(base.react * 1.1);
			expect(lump.react, `seed ${sd}`).toBeLessThan(base.react * 0.5);
		}
	});

	it('doubles the reactions when A doubles, on average (the lesson says twice the concentration is twice the rate)', () => {
		let one = 0, two = 0;
		for (let k = 0; k < 12; k++) { one += run({ T: 15, nA: 25 }, m.SEED + 5 * k).react; two += run({ T: 15, nA: 50 }, m.SEED + 5 * k).react; }
		expect(two / one).toBeGreaterThan(1.6);
		expect(two / one).toBeLessThan(2.4);
	});

	it('keeps the amounts steady: every reacting pair is replaced, and every particle stays in the vessel', () => {
		for (const o of [{ T: 95, nA: 50, lump: false }, { T: 95, nA: 50, lump: true }]) {
			const s = m.newSystem(o);
			s.counting = true;
			const n = s.parts.length;
			for (let i = 0; i < 600; i++) {
				m.step(s, 1 / 60);
				expect(s.parts.length).toBe(n);
				for (const p of s.parts) {
					expect(p.x).toBeGreaterThanOrEqual(0);
					expect(p.x).toBeLessThanOrEqual(m.W);
					expect(p.y).toBeGreaterThanOrEqual(0);
					expect(p.y).toBeLessThanOrEqual(m.H);
				}
			}
			expect(s.parts.filter((p: { t: string }) => p.t === 'A').length).toBe(o.nA);
			expect(s.parts.filter((p: { t: string }) => p.t === 'B').length).toBe(m.NB);
		}
	}, 20_000); // 1,200 steps with a check on every particle: about 5 s under a loaded full suite

	it('moves every free particle at the speed its temperature gives, and no faster at 15 than at 95', () => {
		const s = m.newSystem({ T: 95, nA: 25 });
		s.counting = true;
		for (let i = 0; i < 300; i++) m.step(s, 1 / 60);
		for (const p of s.parts) if (!p.fixed) expect(near(Math.hypot(p.vx, p.vy), m.speedFor(95), 1e-6)).toBe(true);
		expect(m.speedFor(95)).toBeGreaterThan(m.speedFor(15));
		expect(near(m.speedFor(20) / m.speedFor(15), Math.sqrt(293.15 / 288.15), 1e-9)).toBe(true);
	});
});

describe('4-1b: the enzyme simulator', () => {
	const m = load('4-1b.js', '4-1b');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const run = (o: Record<string, any>, seed?: number) => {
		const s = m.newSystem(o, seed);
		s.counting = true;
		let steps = 0;
		while (!m.finished(s)) { m.step(s, 1 / 60); steps++; }
		return { sys: s, steps: steps, n: s.reactions as number, use: Math.round(m.sitesInUse(s) * 100) };
	};
	const base = { T: 37, ph: 7.4, E: 8 };

	it('gives activity 1 at 37 degrees C and pH 7.4 (the old formula gave 95 there)', () => {
		expect(near(m.activity(37, 7.4), 1, 1e-9)).toBe(true);
		expect(m.activity(45, 7.4)).toBeGreaterThan(1);
		expect(m.activity(45, 7.4)).toBeLessThan(1.4);
		expect(m.activity(5, 7.4)).toBeLessThan(0.5);
		expect(m.activity(70, 7.4)).toBe(0);
		expect(m.activity(37, 2.4)).toBe(0);
		expect(m.stateOf(m.activity(70, 7.4))).toBe('denatured');
		expect(m.stateOf(m.activity(37, 7.4))).toBe('native');
		expect(m.stateOf(m.activity(55, 7.4))).toBe('strained');
	});

	it('runs 10 simulated seconds in 600 fixed steps, from a system that has already run for 6 s', () => {
		const a = run({ ...base, S: 40 }), b = run({ ...base, S: 40 });
		expect(a.steps).toBe(600);
		expect([a.n, a.use]).toEqual([b.n, b.use]);
		const s = m.newSystem({ ...base, S: 40 });
		expect(near(s.t, m.WARM_S, 1e-6)).toBe(true);
		expect(s.reactions).toBe(0);
	});

	it('gives the numbers the Try this steps promise, with the sites climbing from 47% to 92%', () => {
		expect(run({ ...base, S: 10 })).toMatchObject({ n: 17, use: 47 });
		expect(run({ ...base, S: 40 })).toMatchObject({ n: 30, use: 88 });
		expect(run({ ...base, S: 80 })).toMatchObject({ n: 33, use: 92 });
		expect(run({ ...base, S: 40, T: 70 }).n).toBe(0);
		expect(run({ ...base, S: 40, ph: 2.4 }).n).toBe(0);
	});

	it('levels off: on average the rate rises less from 40 to 80 than from 10 to 40, and never passes the top speed', () => {
		const seeds = [0, 7, 14, 21, 28, 35];
		const avg = (S: number) => seeds.reduce((t, k) => t + run({ ...base, S }, m.SEED + k).n, 0) / seeds.length;
		const r10 = avg(10), r40 = avg(40), r80 = avg(80);
		expect(r40 - r10).toBeGreaterThan(2 * (r80 - r40));
		expect(r80).toBeGreaterThan(r40);
		expect(r80).toBeLessThanOrEqual(m.topSpeed(8, 37, 7.4));
		expect(near(m.topSpeed(8, 37, 7.4), 36.36, 0.01)).toBe(true);
	});

	it('uses the active sites it draws: more substrate keeps more sites busy, and no more than all of them', () => {
		const lo = run({ ...base, S: 10 }), hi = run({ ...base, S: 80 });
		expect(hi.use).toBeGreaterThan(lo.use);
		expect(hi.use).toBeLessThanOrEqual(100);
		// adding enzyme raises the top speed, as the self-explain answer says
		expect(run({ ...base, S: 80, E: 12 }).n).toBeGreaterThan(run({ ...base, S: 80, E: 4 }).n * 2);
	});

	it('keeps every substrate inside the vessel, and never more than the slider says', () => {
		const s = m.newSystem({ ...base, S: 80 });
		s.counting = true;
		for (let i = 0; i < 600; i++) {
			m.step(s, 1 / 60);
			expect(s.subs.length).toBe(80);
			for (const p of s.subs) {
				expect(p.x).toBeGreaterThanOrEqual(0);
				expect(p.x).toBeLessThanOrEqual(m.W);
				expect(p.y).toBeGreaterThanOrEqual(0);
				expect(p.y).toBeLessThanOrEqual(m.H);
			}
		}
	});
});

describe('4-6a: the equilibrium chamber', () => {
	const m = load('4-6a.js', '4-6a');
	const settle = (st: ReturnType<typeof m.newState>) => {
		let t = 0;
		while (!m.settled(st) && t < 120) { m.step(st, 1 / 60); t += 1 / 60; }
		return t;
	};
	const quotient = (st: { n: { N2: number; H2: number; NH3: number }; P: number }) => {
		const V = m.volumeOf(st.P);
		return (st.n.NH3 * st.n.NH3 * V * V) / (st.n.N2 * Math.pow(st.n.H2, 3));
	};

	it('starts at equilibrium: the rates are equal and not zero, and nothing changes', () => {
		const st = m.newState();
		const q = m.rates(st);
		expect(near(q.f, q.r, 1e-9)).toBe(true);
		expect(q.f).toBeGreaterThan(1);
		for (let i = 0; i < 1200; i++) m.step(st, 1 / 60);
		expect(m.count(st)).toEqual({ N2: 9, H2: 27, NH3: 10 });
		expect(m.settled(st)).toBe(true);
	});

	it('settles where its own constant says, for every change and after a run of changes', () => {
		for (const seq of [['add'], ['remove'], ['heat'], ['cool'], ['compress'], ['expand'], ['heat', 'compress', 'add', 'cool'], ['expand', 'remove', 'cool', 'heat']]) {
			const st = m.newState();
			for (const name of seq) {
				expect(m.applyChange(st, name), name).toBe(true);
				settle(st);
				for (let i = 0; i < 1200; i++) m.step(st, 1 / 60);
				const c = m.constants(st.T);
				expect(Math.abs(quotient(st) / (c.kf / c.kr) - 1), `${seq.join(',')} ${name}`).toBeLessThan(0.01);
				const q = m.rates(st);
				expect(Math.abs(q.f - q.r) / q.f).toBeLessThan(0.01);
			}
		}
	});

	it('conserves nitrogen and hydrogen atoms and never goes negative', () => {
		const st = m.newState();
		const N0 = 2 * st.n.N2 + st.n.NH3, H0 = 2 * st.n.H2 + 3 * st.n.NH3;
		for (const name of ['add', 'cool', 'compress', 'heat', 'expand', 'heat']) {
			const N1 = 2 * st.n.N2 + st.n.NH3, H1 = 2 * st.n.H2 + 3 * st.n.NH3;
			expect(m.applyChange(st, name), name).toBe(true);
			const dn = name === 'add' ? 10 : 0, dh = name === 'add' ? 30 : 0;
			expect(near(2 * st.n.N2 + st.n.NH3, N1 + dn, 1e-9)).toBe(true);
			expect(near(2 * st.n.H2 + 3 * st.n.NH3, H1 + dh, 1e-9)).toBe(true);
			settle(st);
			for (const v of Object.values(st.n) as number[]) expect(v).toBeGreaterThan(0);
		}
		expect(N0).toBe(28);
		expect(H0).toBe(84);
	});

	it('shifts the way Le Chatelier says, one change at a time', () => {
		const expected: Record<string, ['right' | 'left', 'up' | 'down']> = {
			add: ['right', 'up'], heat: ['left', 'down'], cool: ['right', 'up'], compress: ['right', 'up'], expand: ['left', 'down'],
		};
		for (const [name, [dir, nh3]] of Object.entries(expected)) {
			const st = m.newState();
			m.applyChange(st, name);
			expect(st.shift, name).toBe(dir);
			settle(st);
			expect(st.settledNH3 > st.before ? 'up' : 'down', name).toBe(nh3);
		}
		const rm = m.newState();
		m.applyChange(rm, 'remove');
		expect(rm.shift).toBe('right');
		const dropped = m.count(rm).NH3;
		settle(rm);
		expect(rm.settledNH3).toBeGreaterThan(dropped);
		expect(rm.settledNH3).toBeLessThan(rm.before);
	});

	it('gives the numbers the Try this steps promise', () => {
		const go = (name: string) => { const st = m.newState(); m.applyChange(st, name); const after = m.count(st).NH3; settle(st); return [st.before, after, st.settledNH3]; };
		expect(go('add')).toEqual([10, 10, 16]);
		expect(go('remove')).toEqual([10, 5, 7]);
		expect(go('heat')).toEqual([10, 10, 8]);
		expect(go('compress')).toEqual([10, 10, 13]);
	});

	it('locks while it shifts, and settles within the steps a reduced-motion student takes (4 s each, 4 presses)', () => {
		const st = m.newState();
		expect(m.applyChange(st, 'add')).toBe(true);
		expect(st.phase).toBe('shifting');
		expect(m.applyChange(st, 'heat')).toBe(false);
		for (const name of m.CHANGES) {
			const s2 = m.newState();
			m.applyChange(s2, name);
			expect(settle(s2), name).toBeLessThan(16);
		}
	});

	it('caps every repeatable control and never leaves its range', () => {
		const st = m.newState();
		for (let i = 0; i < 5; i++) { if (m.applyChange(st, 'heat')) settle(st); }
		expect(st.T).toBe(m.T_MAX);
		expect(m.allowed(st, 'heat')).toBe(false);
		for (let i = 0; i < 5; i++) { if (m.applyChange(st, 'compress')) settle(st); }
		expect(st.P).toBe(m.P_MAX);
		expect(m.allowed(st, 'compress')).toBe(false);
		const add = m.newState();
		let adds = 0;
		while (m.applyChange(add, 'add')) { settle(add); adds++; }
		expect(add.n.N2).toBeLessThanOrEqual(m.N2_CAP + 5);
		expect(adds).toBeGreaterThan(0);
		const rm = m.newState();
		while (m.applyChange(rm, 'remove')) settle(rm);
		expect(rm.n.NH3).toBeGreaterThanOrEqual(0);
	});

	it('draws one particle for one molecule of every substance', () => {
		const st = m.newState();
		expect(m.count(st)).toEqual({ N2: 9, H2: 27, NH3: 10 });
		m.applyChange(st, 'add');
		expect(m.count(st)).toEqual({ N2: 14, H2: 42, NH3: 10 });
	});
});

describe('4-6b: the blood-buffer simulator', () => {
	const m = load('4-6b.js', '4-6b');
	const f2 = (x: number) => x.toFixed(2);

	it('adds the same 5 mM dose to blood and to pure water', () => {
		expect(m.DOSE).toBe(5);
		const blood = m.newState();
		m.dose(blood, 'acid');
		expect(blood.hco3).toBe(m.HCO3_NORMAL - 5);
		const water = m.newState();
		m.setLiquid(water, 'water');
		m.dose(water, 'acid');
		expect(water.wNet).toBe(5);
	});

	it('gives the numbers the Try this steps promise', () => {
		const b = m.newState();
		const e1 = m.dose(b, 'acid');
		expect([f2(e1.before), f2(e1.after)]).toEqual(['7.40', '7.30']);
		const w = m.newState();
		m.setLiquid(w, 'water');
		const e2 = m.dose(w, 'acid');
		expect([f2(e2.before), f2(e2.after)]).toEqual(['7.00', '2.30']);
		const fast = m.newState();
		const e3 = m.setRate(fast, 36);
		expect([f2(e3.before), f2(e3.after)]).toEqual(['7.40', '7.69']);
		// the swings the evidence question quotes
		expect(Math.abs(e1.after - e1.before)).toBeLessThan(0.15);
		expect(Math.abs(e2.after - e2.before)).toBeGreaterThan(4.5);
	});

	it('starts healthy and not solved: the default screen shows no dose', () => {
		const st = m.newState();
		expect(f2(m.phNow(st))).toBe('7.40');
		expect(st.event).toBeNull();
		expect(m.windowName(m.phNow(st))).toBe('Healthy');
	});

	it('lets the kidneys restore the bicarbonate in blood, and gives pure water nothing to restore', () => {
		const b = m.newState();
		m.dose(b, 'acid');
		for (let i = 0; i < 60 * 25; i++) m.step(b, 1 / 60);
		expect(Math.abs(m.phNow(b) - 7.4)).toBeLessThan(0.02);
		const w = m.newState();
		m.setLiquid(w, 'water');
		m.dose(w, 'acid');
		for (let i = 0; i < 60 * 25; i++) m.step(w, 1 / 60);
		expect(f2(m.phNow(w))).toBe('2.30');
	});

	it('moves the pCO2, and so the pH, the way the lesson says: fast breathing raises it, slow breathing lowers it', () => {
		const fast = m.newState();
		m.setRate(fast, 36);
		for (let i = 0; i < 60 * 8; i++) m.step(fast, 1 / 60);
		expect(m.phNow(fast)).toBeGreaterThan(7.45);
		expect(m.windowName(m.phNow(fast))).toBe('Alkalosis');
		const slow = m.newState();
		m.setRate(slow, 5);
		for (let i = 0; i < 60 * 8; i++) m.step(slow, 1 / 60);
		expect(m.phNow(slow)).toBeLessThan(7.35);
		expect(m.windowName(m.phNow(slow))).toBe('Acidosis');
		expect(m.targetPco2(14)).toBe(40);
	});

	it('caps every repeatable control: the bicarbonate, the net dose and the pH stay in range', () => {
		const b = m.newState();
		for (let i = 0; i < 40; i++) m.dose(b, 'acid');
		expect(b.hco3).toBe(m.HCO3_MIN);
		for (let i = 0; i < 60; i++) m.dose(b, 'base');
		expect(b.hco3).toBe(m.HCO3_MAX);
		const w = m.newState();
		m.setLiquid(w, 'water');
		for (let i = 0; i < 40; i++) m.dose(w, 'acid');
		expect(w.wNet).toBe(m.W_MAX);
		for (let i = 0; i < 80; i++) m.dose(w, 'base');
		expect(w.wNet).toBe(-m.W_MAX);
		for (const ph of [m.phNow(b), m.phNow(w)]) { expect(ph).toBeGreaterThanOrEqual(1); expect(ph).toBeLessThanOrEqual(13); }
		for (let rr = 4; rr <= 40; rr++) { const x = m.newState(); m.setRate(x, rr); expect(m.phSettled(x)).toBeGreaterThan(6.6); expect(m.phSettled(x)).toBeLessThan(8.2); }
	});
});
