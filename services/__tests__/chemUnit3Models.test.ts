import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

/**
 * Runs the model of each Unit 3 simulation and tool on its own, with its own constants, and no
 * page. The lesson scripts register their model on window.GC_MODELS before they touch the page,
 * so a stubbed window is enough (the "run it headlessly" step of the textbook-work skill). A
 * number that goes negative, a particle that leaves the stage, an energy that is not conserved,
 * or a readout that disagrees with the lesson text shows up here. (Sim Standard items 9, 10, 12.)
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

describe('3-1a: two vessels', () => {
	const m = load('3-1a.js', '3-1a');

	it('counts thermal energy from 0 °C with the lesson table\'s specific heat', () => {
		expect(m.C_WATER).toBe(4.18);
		expect(near(m.energyKJ(50, 80), 16.72)).toBe(true);
		expect(near(m.energyKJ(250, 30), 31.35)).toBe(true);
		expect(m.energyKJ(100, 0)).toBe(0);
	});

	it('does not start solved: the starting vessel B holds more energy although A is hotter', () => {
		const d = m.DEFAULTS;
		expect(d.tA).toBeGreaterThan(d.tB);
		expect(m.energyKJ(d.mB, d.tB)).toBeGreaterThan(m.energyKJ(d.mA, d.tA));
	});

	it('gives the Try this setups the values the steps promise', () => {
		expect(m.energyKJ(200, 40) / m.energyKJ(50, 40)).toBe(4);
		expect(m.energyKJ(20, 100)).toBeLessThan(m.energyKJ(300, 20));
	});

	it('never goes negative over the whole slider range, and grows with temperature and with mass', () => {
		for (let t = 10; t <= 100; t += 5) for (let ms = 20; ms <= 300; ms += 10) {
			expect(m.energyKJ(ms, t)).toBeGreaterThan(0);
			expect(m.energyKJ(ms + 10, t)).toBeGreaterThan(m.energyKJ(ms, t));
			expect(m.energyKJ(ms, t + 5)).toBeGreaterThan(m.energyKJ(ms, t));
		}
	});

	it('keeps the slower-to-faster marker on its bar and moves it up with temperature', () => {
		expect(near(m.barPos(10), 0)).toBe(true);
		expect(near(m.barPos(100), 1)).toBe(true);
		for (let t = 10; t < 100; t += 5) expect(m.barPos(t + 5)).toBeGreaterThan(m.barPos(t));
	});

	it('draws a particle count that follows the mass', () => {
		expect(m.dotCount(20)).toBe(5);
		for (let ms = 20; ms < 300; ms += 10) expect(m.dotCount(ms + 10)).toBeGreaterThanOrEqual(m.dotCount(ms));
	});

	it('keeps every particle inside its vessel at every temperature, for a long run', () => {
		for (const t of [10, 55, 100]) {
			const v = m.newVessel(7);
			m.setDots(v, 75);
			for (let i = 0; i < 3000; i++) m.stepVessel(v, t, 1 / 60);
			for (const p of v.dots) {
				expect(p.x).toBeGreaterThanOrEqual(m.R);
				expect(p.x).toBeLessThanOrEqual(m.W - m.R);
				expect(p.y).toBeGreaterThanOrEqual(m.R);
				expect(p.y).toBeLessThanOrEqual(m.VH - m.R);
			}
		}
	});

	it('moves hotter particles faster', () => {
		expect(m.speed(100)).toBeGreaterThan(m.speed(10));
	});
});

describe('3-1a: the q = mc delta T calculator', () => {
	const m = load('3-1a.js', '3-1a-heat');

	it('matches the worked problems in the lesson', () => {
		expect(near(m.heat('water', 150, 77, 22).q, -34485, 1e-6)).toBe(true);   // practice 1: 150.0 g from 77.0 to 22.0
		expect(near(m.heat('water', 150, 77, 22).q, 150 * 4.18 * -55, 1e-6)).toBe(true);
		expect(near(m.heat('water', 500, 20, 100).q, 167200, 1e-6)).toBe(true);
		expect(near(577.5 / (50 * 30), m.SUBSTANCES.copper.c, 1e-12)).toBe(true);
	});

	it('gives the signs the page teaches: warming positive, cooling negative, no change zero', () => {
		expect(m.heat('water', 150, 20, 80).q).toBeGreaterThan(0);
		expect(m.heat('iron', 1200, 450, 25).q).toBeLessThan(0);
		expect(m.heat('copper', 10, 30, 30).q).toBe(0);
	});

	it('loads the three presets with the numbers the Try this steps promise', () => {
		const p = m.PRESETS;
		expect(near(m.heat(p.coffee.sub, p.coffee.m, p.coffee.ti, p.coffee.tf).q / 1000, 37.62, 1e-9)).toBe(true);
		const al = m.heat(p.aluminum.sub, p.aluminum.m, p.aluminum.ti, p.aluminum.tf).q;
		const cu = m.heat('copper', p.aluminum.m, p.aluminum.ti, p.aluminum.tf).q;
		expect(cu / al).toBeLessThan(0.5);
		expect(near(m.heat(p.iron.sub, p.iron.m, p.iron.ti, p.iron.tf).q / 1000, -228.99, 0.01)).toBe(true);
	});

	it('refuses a usable answer for a zero mass, a missing number or an unknown substance', () => {
		expect(m.heat('water', 0, 20, 80)).toBeNull();
		expect(m.heat('water', 100, NaN, 80)).toBeNull();
		expect(m.heat('lava', 100, 20, 80)).toBeNull();
	});
});

describe('3-1b: the heating curve', () => {
	const m = load('3-1b.js', '3-1b');
	const K = m.K;

	it('has the stage boundaries the lesson and the old simulator gave, for 50.0 g of water', () => {
		expect(near(K.Q_ICE_END, 2.09, 1e-9)).toBe(true);
		expect(near(K.Q_MELT_END, 18.79, 1e-9)).toBe(true);
		expect(near(K.Q_LIQ_END, 39.71, 1e-9)).toBe(true);
		expect(near(K.Q_BOIL_END, 152.71, 1e-9)).toBe(true);
		expect(near(K.Q_MAX, 154.72, 1e-9)).toBe(true);
	});

	it('shows melting costing 16.7 kJ and boiling 113.0 kJ, the numbers in the lesson text', () => {
		expect(near(K.Q_MELT_END - K.Q_ICE_END, 16.7, 1e-9)).toBe(true);
		expect(near(K.Q_BOIL_END - K.Q_LIQ_END, 113.0, 1e-9)).toBe(true);
	});

	it('holds the temperature at 0 and at 100 across both plateaus, and only there', () => {
		for (let q = 2.1; q < 18.7; q += 0.1) { expect(m.stateAt(q).T).toBe(0); expect(m.stateAt(q).stage).toBe('melt'); }
		for (let q = 39.8; q < 152.6; q += 0.1) { expect(m.stateAt(q).T).toBe(100); expect(m.stateAt(q).stage).toBe('boil'); }
		expect(m.stateAt(1).T).toBeLessThan(0);
		expect(m.stateAt(30).T).toBeGreaterThan(0);
		expect(m.stateAt(30).T).toBeLessThan(100);
		expect(m.stateAt(154).T).toBeGreaterThan(100);
	});

	it('never falls as heat is added, never leaves -20 to 120 degrees, and has no jump at a boundary', () => {
		let prev = m.stateAt(0).T;
		expect(prev).toBe(-20);
		for (let q = 0.05; q <= 160; q += 0.05) {
			const T = m.stateAt(q).T;
			expect(T).toBeGreaterThanOrEqual(prev - 1e-9);
			expect(T - prev).toBeLessThan(2);
			expect(T).toBeLessThanOrEqual(120 + 1e-9);
			prev = T;
		}
		expect(near(m.stateAt(1e9).T, 120, 1e-9)).toBe(true);
	});

	it('gives the Try this steps the numbers they promise', () => {
		expect(m.stateAt(10).stage).toBe('melt');
		expect(m.stateAt(10).T).toBe(0);
		expect(near(m.stateAt(30).T, 53.6, 0.05)).toBe(true);
		expect(m.stateAt(100).stage).toBe('boil');
		expect(near(m.stateAt(154).T, 112.8, 0.05)).toBe(true);
		expect(m.stateAt(154).stage).toBe('steam');
		// between 30 and 100 kJ the temperature rises only 46 degrees (the evidence check)
		expect(near(m.stateAt(100).T - m.stateAt(30).T, 46.4, 0.05)).toBe(true);
	});

	it('starts as a lattice that is inside the box, and not as the answer: the first frame is ice', () => {
		const st = m.stateAt(0);
		expect(st.stage).toBe('ice');
		for (let i = 0; i < K.N; i++) {
			const l = m.latticePos(i);
			expect(l.x).toBeGreaterThan(K.R);
			expect(l.x).toBeLessThan(K.PW - K.R);
			expect(l.y).toBeGreaterThan(K.R);
			expect(l.y).toBeLessThan(K.PH - K.R);
		}
	});

	it('melts molecules one at a time, never un-melts as heat rises, and turns them to gas only after melting', () => {
		let melted = 0;
		for (let q = 0; q <= 39.7; q += 0.1) {
			const st = m.stateAt(q);
			let n = 0;
			for (let i = 0; i < K.N; i++) n += m.meltShare(st, i);
			expect(n).toBeGreaterThanOrEqual(melted - 1e-9);
			melted = n;
			for (let i = 0; i < K.N; i++) expect(m.isGas(st, i)).toBe(false);
		}
		expect(near(melted, K.N, 1e-9)).toBe(true);
		expect(m.isGas(m.stateAt(100), 0)).toBe(true);
		expect(m.isGas(m.stateAt(154), K.N - 1)).toBe(true);
	});

	it('keeps every molecule inside the box through a long run with the heat moved back and forth', () => {
		const mols = m.newMolecules();
		let q = 0, dir = 3, bad = 0;
		for (let i = 0; i < 12000; i++) {
			q += dir * 0.02;
			if (q > 155 || q < 0) dir = -dir;
			m.stepMolecules(mols, m.stateAt(q), 1 / 60);
			for (const p of mols) {
				if (!(Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= K.R - 1e-6 && p.x <= K.PW - K.R + 1e-6 && p.y <= K.PH - K.R + 1e-6 && p.y >= K.R - 1e-6)) bad++;
			}
		}
		expect(bad).toBe(0);
	});

	it('draws a solid molecule with a small, smooth vibration (no jump from one step to the next)', () => {
		const mols = m.newMolecules();
		const st = m.stateAt(1);
		let prev = m.drawPos(mols, st, 3, 0);
		for (let t = 1 / 60; t < 2; t += 1 / 60) {
			const p = m.drawPos(mols, st, 3, t);
			expect(Math.hypot(p.x - prev.x, p.y - prev.y)).toBeLessThan(1.5);
			const l = m.latticePos(3);
			expect(Math.hypot(p.x - l.x, p.y - l.y)).toBeLessThan(4);
			prev = p;
		}
	});

	it('uses one speed on each plateau, because the temperature does not change there', () => {
		expect(m.speedAt(m.stateAt(10).T)).toBe(m.speedAt(m.stateAt(15).T));
		expect(m.speedAt(m.stateAt(60).T)).toBe(m.speedAt(m.stateAt(140).T));
		expect(m.speedAt(100)).toBeGreaterThan(m.speedAt(0));
	});
});

describe('3-1b: the multi-stage calculator', () => {
	const m = load('3-1b.js', '3-1b-stages');

	it('adds five stages for the full preset, and the total is the sum of the stages', () => {
		const p = m.PRESETS.full;
		const r = m.stages(p.sub, p.m, p.ti, p.tf);
		expect(r.steps.map((s: { id: string }) => s.id)).toEqual(['solid', 'melt', 'liquid', 'boil', 'gas']);
		expect(near(r.steps[0].q, 25 * 2.09 * 15, 1e-9)).toBe(true);
		expect(near(r.steps[1].q, 25 * 334, 1e-9)).toBe(true);
		expect(near(r.steps[3].q, 25 * 2260, 1e-9)).toBe(true);
		expect(near(r.total, 76596.25, 1e-6)).toBe(true);
		expect(near(r.total, r.steps.reduce((s: number, x: { q: number }) => s + x.q, 0), 1e-9)).toBe(true);
	});

	it('keeps the melting preset to two stages and the ethanol preset below its boiling point to one', () => {
		const a = m.PRESETS.melt, e = m.PRESETS.ethanol;
		expect(m.stages(a.sub, a.m, a.ti, a.tf).steps.length).toBe(2);
		const r = m.stages(e.sub, e.m, e.ti, e.tf);
		expect(r.steps.length).toBe(1);
		expect(near(r.total, 50 * 2.44 * 58, 1e-9)).toBe(true);
	});

	it('gives the same heat, with the opposite sign, when the same range is run backwards', () => {
		for (const [sub, ti, tf] of [['water', -15, 110], ['water', -15, 0], ['water', 20, 100], ['ethanol', -150, 100], ['ethanol', 20, 70]] as [string, number, number][]) {
			const up = m.stages(sub, 25, ti, tf).total, down = m.stages(sub, 25, tf, ti).total;
			expect(near(up, -down, 1e-6), `${sub} ${ti} to ${tf}`).toBe(true);
			expect(up).toBeGreaterThan(0);
		}
	});

	it('returns no stages for no temperature change, and refuses bad input', () => {
		expect(m.stages('water', 25, 40, 40).steps.length).toBe(0);
		expect(m.stages('water', 0, 40, 80)).toBeNull();
		expect(m.stages('water', 25, NaN, 80)).toBeNull();
	});

	it('matches the exam answer in the lesson: 30.0 g of ice from -15.0 to 0.0 and melted', () => {
		const r = m.stages('water', 30, -15, 0);
		expect(near(r.total, 10960.5, 1e-6)).toBe(true);
		const up = m.stages('water', 30, 100, 101).steps;
		expect(up.map((x: { id: string }) => x.id)).toEqual(['boil', 'gas']);
		expect(near(up[1].q, 30 * 2.01 * 1, 1e-9)).toBe(true);
	});
});

describe('3-1c: the calorimeter', () => {
	const m = load('3-1c.js', '3-1c');

	it('conserves energy: the metal loses what the water gains, and the temperature lands in between', () => {
		for (const metal of Object.keys(m.METALS)) for (const mm of [5, 50, 300]) for (const mw of [20, 100, 500]) {
			const r = m.equilibrium(metal, mm, 100, mw, 20);
			expect(near(r.qMetal + r.qWater, 0, 1e-6)).toBe(true);
			expect(r.tf).toBeGreaterThan(20);
			expect(r.tf).toBeLessThan(100);
			expect(r.dtWater).toBeGreaterThan(0);
			expect(r.dtMetal).toBeLessThan(0);
		}
	});

	it('gives the checkpoint answer and the Try this numbers', () => {
		const s = m.START;
		expect(near(m.equilibrium(s.metal, s.mm, s.tmi, s.mw, s.twi).tf, 23.52, 0.005)).toBe(true);
		const p = m.PRESETS;
		const run = (k: string) => m.equilibrium(p[k].metal, p[k].mm, p[k].tmi, p[k].mw, p[k].twi);
		expect(near(run('iron').tf, 44.03, 0.005)).toBe(true);
		expect(run('aluminum').tf).toBeGreaterThan(run('lead').tf + 10);
		expect(near(run('equal').dtMetal, -73.3, 0.05)).toBe(true);
	});

	it('does not start solved: the start screen is not the midpoint and not the answer', () => {
		const s = m.START;
		expect(m.equilibrium(s.metal, s.mm, s.tmi, s.mw, s.twi).tf).not.toBe((s.tmi + s.twi) / 2);
	});

	it('draws LOL blocks that are the same before and after, with something left in the metal', () => {
		for (const metal of Object.keys(m.METALS)) for (const mm of [5, 50, 100, 300]) for (const mw of [20, 100, 500]) for (const tmi of [40, 100, 150]) {
			const b = m.blocks(m.equilibrium(metal, mm, tmi, mw, 20));
			expect(b.initMetal + b.initWater).toBe(b.finalMetal + b.finalWater);
			expect(b.finalMetal).toBeGreaterThanOrEqual(1);
			expect(b.transfer).toBeGreaterThanOrEqual(1);
			expect(b.initMetal).toBeLessThanOrEqual(6);
		}
	});

	it('uses the water value the lesson uses', () => {
		expect(m.C_WATER).toBe(4.184);
	});
});

describe('3-4a: the collision chamber', () => {
	const m = load('3-4a.js', '3-4a');
	const sumV2 = (ch: { parts: { vx: number; vy: number }[] }) => ch.parts.reduce((s, p) => s + p.vx * p.vx + p.vy * p.vy, 0);
	const groupMean = (ch: { parts: { g: string; vx: number; vy: number }[] }, g: string) => {
		const a = ch.parts.filter((p) => p.g === g);
		return a.reduce((s, p) => s + p.vx * p.vx + p.vy * p.vy, 0) / a.length;
	};

	it('takes each chamber\'s speed from its own temperature, so two chambers at 50 degrees start alike', () => {
		const ch = m.newChamber(50, 50);
		expect(near(groupMean(ch, 'A'), groupMean(ch, 'B'), 1e-6)).toBe(true);
		const hot = m.newChamber(95, 15);
		expect(groupMean(hot, 'A')).toBeGreaterThan(groupMean(hot, 'B'));
		expect(near(groupMean(hot, 'A') / groupMean(hot, 'B'), 368.15 / 288.15, 1e-6)).toBe(true);
	});

	it('meets at the average of the two (in kelvin, which is the average in degrees C) and never leaves the two starts', () => {
		for (const [a, b] of [[95, 15], [120, 10], [50, 50]]) {
			let prevGap = Infinity;
			for (let t = 0; t <= 20; t += 0.25) {
				const r = m.relaxed(a, b, t);
				expect(near(r.A + r.B, a + b, 1e-9), `${a},${b} at ${t}`).toBe(true);
				expect(r.A).toBeLessThanOrEqual(a + 1e-9);
				expect(r.B).toBeGreaterThanOrEqual(b - 1e-9);
				const gap = Math.abs(r.A - r.B);
				expect(gap).toBeLessThanOrEqual(prevGap + 1e-9);
				prevGap = gap;
			}
			expect(near(m.relaxed(a, b, 100).A, (a + b) / 2, 1e-6)).toBe(true);
		}
	});

	it('shows 55 for 95 and 15, and 65 for 120 and 10 (the Try this steps and the evidence check)', () => {
		expect(near(m.relaxed(95, 15, 1e4).shared, 55, 1e-9)).toBe(true);
		expect(near(m.relaxed(120, 10, 1e4).shared, 65, 1e-9)).toBe(true);
		expect(near(m.relaxed(50, 50, 1e4).shared, 50, 1e-9)).toBe(true);
	});

	it('conserves the total kinetic energy through a long mixing run, and the groups end at one temperature', () => {
		const ch = m.newChamber(95, 15, 99);
		const e0 = sumV2(ch);
		// the energy the two temperatures mean, before and after
		const total = (T: { A: number; B: number }) => m.N * (m.meanV2(T.A) + m.meanV2(T.B));
		expect(near(e0, total({ A: 95, B: 15 }), e0 * 1e-9)).toBe(true);
		for (let i = 0; i < 300; i++) { m.step(ch, 1 / 60); expect(near(sumV2(ch), e0, e0 * 1e-6)).toBe(true); }
		ch.open = true;
		let settledAt = -1;
		for (let i = 0; i < 60 * 14; i++) {
			m.step(ch, 1 / 60);
			expect(near(sumV2(ch), e0, e0 * 1e-6), `step ${i}`).toBe(true);
			if (settledAt < 0 && m.settled(ch)) settledAt = ch.since;
		}
		expect(settledAt).toBeGreaterThan(3);
		expect(settledAt).toBeLessThan(12);
		expect(Math.abs(ch.T.A - 55)).toBeLessThan(m.SETTLED);
		// each group's mean speed follows its temperature, to the last digit
		expect(near(groupMean(ch, 'A'), m.meanV2(ch.T.A), 1e-6)).toBe(true);
		expect(near(groupMean(ch, 'B'), m.meanV2(ch.T.B), 1e-6)).toBe(true);
	});

	it('keeps the two groups apart while the partition is in place, and every particle inside the box', () => {
		const ch = m.newChamber(120, 10, 5);
		for (let i = 0; i < 60 * 20; i++) m.step(ch, 1 / 60);
		const mid = m.W / 2;
		for (const p of ch.parts) {
			if (p.g === 'A') expect(p.x).toBeLessThan(mid);
			else expect(p.x).toBeGreaterThan(mid);
		}
		expect(near(ch.T.A, 120, 1e-9)).toBe(true);
		ch.open = true;
		for (let i = 0; i < 60 * 20; i++) m.step(ch, 1 / 60);
		for (const p of ch.parts) {
			expect(Number.isFinite(p.x) && Number.isFinite(p.vx)).toBe(true);
			expect(p.x).toBeGreaterThanOrEqual(m.EDGE + m.R - 1e-6);
			expect(p.x).toBeLessThanOrEqual(m.W - m.EDGE - m.R + 1e-6);
			expect(p.y).toBeGreaterThanOrEqual(m.EDGE + m.R - 1e-6);
			expect(p.y).toBeLessThanOrEqual(m.H - m.EDGE - m.R + 1e-6);
		}
	});

	it('treats equal temperatures as already settled, so nothing changes (the 50 and 50 step)', () => {
		const ch = m.newChamber(50, 50);
		ch.open = true;
		m.step(ch, 1 / 60);
		expect(m.settled(ch)).toBe(true);
		expect(near(ch.T.A, 50, 1e-9)).toBe(true);
	});

	it('bins every particle into the histogram', () => {
		const ch = m.newChamber(95, 15);
		const h = m.histogram(ch, 12, m.V0 * 2.6);
		expect(h.A.reduce((a: number, b: number) => a + b, 0)).toBe(m.N);
		expect(h.B.reduce((a: number, b: number) => a + b, 0)).toBe(m.N);
	});
});

describe('3-4a: the closed-system investigation', () => {
	const m = load('3-4a.js', '3-4a-trial');

	it('meets at 44.0 for 80 g at 80 and 120 g at 20, not at the 50 midpoint (the checkpoint and the Try this step)', () => {
		const eq = m.equilibrium('water-water', 'ideal', 80, 20);
		expect(near(eq.ideal, 44, 1e-9)).toBe(true);
		expect(near(eq.end, 44, 1e-9)).toBe(true);
	});

	it('moves the same energy out of the hot part as into the cold part', () => {
		for (const design of Object.keys(m.DESIGNS)) for (const hot of [50, 80, 100]) for (const cold of [5, 20, 30]) {
			const eq = m.equilibrium(design, 'ideal', hot, cold);
			const d = m.DESIGNS[design];
			expect(near(d.capHot * (hot - eq.ideal), d.capCold * (eq.ideal - cold), 1e-6)).toBe(true);
			expect(eq.ideal).toBeLessThan(hot);
			expect(eq.ideal).toBeGreaterThan(cold);
		}
	});

	it('gives the aluminum and the leaking beaker numbers the Try this steps and the evidence check promise', () => {
		const p = m.PRESETS;
		expect(near(m.equilibrium(p.metal.design, p.metal.ins, p.metal.hot, p.metal.cold).end, 32.36, 0.005)).toBe(true);
		const leak = m.equilibrium(p.leak.design, p.leak.ins, p.leak.hot, p.leak.cold);
		expect(near(leak.ideal, 44, 1e-9)).toBe(true);
		expect(near(leak.end, 40.55, 1e-9)).toBe(true);
		expect(leak.end).toBeLessThan(leak.ideal);
	});

	it('leaks more heat with less insulation, and never ends below the room', () => {
		for (const hot of [50, 100]) for (const cold of [5, 30]) {
			const a = m.equilibrium('water-water', 'ideal', hot, cold).end;
			const b = m.equilibrium('water-water', 'moderate', hot, cold).end;
			const c = m.equilibrium('water-water', 'uninsulated', hot, cold).end;
			expect(Math.abs(b - m.ROOM)).toBeLessThan(Math.abs(a - m.ROOM) + 1e-9);
			expect(Math.abs(c - m.ROOM)).toBeLessThan(Math.abs(b - m.ROOM) + 1e-9);
		}
	});

	it('draws curves that start at the two starting temperatures, meet, and stay in range', () => {
		for (const ins of ['ideal', 'moderate', 'uninsulated']) {
			const eq = m.equilibrium('water-water', ins, 80, 20);
			const t0 = m.temps(eq, 0);
			expect(near(t0.hot, 80, 1e-9)).toBe(true);
			expect(near(t0.cold, 20, 1e-9)).toBe(true);
			for (let x = 0; x <= 1; x += 0.01) {
				const t = m.temps(eq, x);
				expect(t.hot).toBeLessThanOrEqual(80 + 1e-9);
				expect(t.cold).toBeGreaterThanOrEqual(20 - 1e-9);
				expect(t.hot).toBeGreaterThanOrEqual(t.cold - 1e-9);
			}
			const t1 = m.temps(eq, 1);
			expect(near(t1.hot, eq.end, 0.05 + 1e-9)).toBe(true);
			expect(Math.abs(t1.hot - t1.cold)).toBeLessThan(0.05);
		}
	});

	it('refuses input that is not a number', () => {
		expect(m.equilibrium('water-water', 'ideal', NaN, 20)).toBeNull();
		expect(m.equilibrium('nope', 'ideal', 80, 20)).toBeNull();
	});
});

describe('1-4a (file 3-14a): the reaction profile', () => {
	const m = load('3-14a.js', '3-14a');

	it('gives the reverse reaction the forward barrier plus the energy released', () => {
		const f = m.RXN.combust, r = m.RXN.split;
		expect(r.dH).toBe(-f.dH);
		expect(r.eaU).toBe(f.eaU - f.dH);
		expect(r.eaC).toBe(f.eaC - f.dH);
		expect(r.eaU).toBe(920);
		expect(r.eaC).toBe(609);
	});

	it('keeps the values the lesson and the figure carry for the forward reactions', () => {
		expect(m.RXN.combust.eaU).toBe(436);
		expect(m.RXN.combust.eaC).toBe(125);
		expect(m.RXN.combust.dH).toBe(-484);
		expect(m.RXN.ammonia.eaU).toBe(945);
		expect(m.RXN.ammonia.eaC).toBe(180);
		expect(m.RXN.ammonia.dH).toBe(-92);
	});

	it('lowers the barrier with a catalyst and leaves the energy change alone, for every reaction', () => {
		for (const k of Object.keys(m.RXN)) {
			const r = m.RXN[k];
			expect(m.barrier(r, true)).toBeLessThan(m.barrier(r, false));
			const eu = m.curve(r.dH, m.barrier(r, false)), ec = m.curve(r.dH, m.barrier(r, true));
			expect(near(eu(1), r.dH, 0.01)).toBe(true);
			expect(near(ec(1), r.dH, 0.01)).toBe(true);
			expect(near(eu(0), 0, 0.01)).toBe(true);
		}
	});

	it('draws a curve whose highest point is the barrier, and that never dips below the lower level', () => {
		for (const k of Object.keys(m.RXN)) for (const cat of [false, true]) {
			const r = m.RXN[k], peak = m.barrier(r, cat), E = m.curve(r.dH, peak);
			let top = -Infinity, low = Infinity;
			for (let i = 0; i <= 400; i++) { const e = E(i / 400); top = Math.max(top, e); low = Math.min(low, e); }
			expect(near(top, peak, 0.5), `${k} ${cat}`).toBe(true);
			expect(low).toBeGreaterThanOrEqual(Math.min(0, r.dH) - 1);
			expect(top).toBeGreaterThan(Math.max(0, r.dH));
		}
	});

	it('draws each reaction with its own atoms, and the same atoms before, at the barrier and after', () => {
		const want: Record<string, Record<string, number>> = { combust: { H: 4, O: 2 }, split: { H: 4, O: 2 }, ammonia: { N: 2, H: 6 } };
		for (const k of Object.keys(m.RXN)) {
			const sc = m.SCENES[k];
			expect(m.atomCount(sc.start), k).toEqual(want[k]);
			expect(m.atomCount(sc.end), k).toEqual(want[k]);
			expect(m.atomCount([sc.mid]), k).toEqual(want[k]);
		}
		expect(m.SCENES.split.start).toBe(m.SCENES.combust.end);
		expect(m.SCENES.ammonia.start).not.toBe(m.SCENES.combust.start);
	});

	it('names the stage from the progress, and has words for every reaction and stage', () => {
		expect(m.stageOf(0)).toBe('start');
		expect(m.stageOf(50)).toBe('mid');
		expect(m.stageOf(100)).toBe('end');
		for (const k of Object.keys(m.RXN)) for (const s of ['start', 'mid', 'end']) expect(m.TEXT[k][s].length).toBeGreaterThan(10);
	});
});

describe('1-4a (file 3-14a): the bond-energy calculator', () => {
	const m = load('3-14a.js', '3-14a-bonds');

	it('gives the totals from the bond table, for every reaction', () => {
		expect(m.enthalpy('methane').dH).toBe(-802);
		expect(m.enthalpy('methane').totalBroken).toBe(2648);
		expect(m.enthalpy('methane').totalFormed).toBe(3450);
		expect(m.enthalpy('hydrogen').dH).toBe(-482);
		expect(m.enthalpy('haber').dH).toBe(-93);
		expect(m.enthalpy('hcl').dH).toBe(-184);
	});

	it('matches the propane exam answer in the Enrichment block', () => {
		const broken = 2 * 348 + 8 * 413 + 5 * 498, formed = 6 * 799 + 8 * 463;
		expect(broken).toBe(6490);
		expect(formed).toBe(8498);
		expect(broken - formed).toBe(-2008);
	});

	it('counts every bond: the totals are the sum of the lines', () => {
		for (const k of Object.keys(m.DATA)) {
			const r = m.enthalpy(k);
			expect(r.broken.reduce((s: number, b: { sub: number }) => s + b.sub, 0)).toBe(r.totalBroken);
			expect(r.formed.reduce((s: number, b: { sub: number }) => s + b.sub, 0)).toBe(r.totalFormed);
			expect(r.dH).toBe(r.totalBroken - r.totalFormed);
		}
		expect(m.enthalpy('nope')).toBeNull();
	});
});
