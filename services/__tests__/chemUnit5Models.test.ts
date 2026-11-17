import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

/**
 * Runs the model of each Unit 5 simulation on its own, with its own constants, and no page. The
 * lesson scripts register their model on window.GC_MODELS before they touch the page, so a
 * stubbed window is enough (the "run it headlessly" step of the textbook-work skill). A number
 * that goes negative, a star that does not settle, a sample that does not halve, or a value that
 * disagrees with the lesson text shows up here. (Sim Standard items 8, 9, 10, 12, 13.)
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

describe('5-1a: the Sun', () => {
	const m = load('5-1a.js', '5-1a');
	const run = (T0: number) => {
		const r = m.newRun(T0);
		let n = 0;
		let maxT = 0;
		while (!r.settled && n < 60 * 40) {
			m.step(r, 1 / 60);
			n++;
			maxT = Math.max(maxT, m.coreT(r));
		}
		return { r, steps: n, maxT };
	};

	it('starts balanced: the default Sun has equal pushes and nothing to see, so the prediction is not answered at load', () => {
		const r = m.newRun(m.DEFAULTS.T);
		const p = m.pushes(r);
		expect(near(p.P, 1)).toBe(true);
		expect(near(p.G, 1)).toBe(true);
		expect(m.DEFAULTS).toEqual({ T: 15, M: 1 });
		expect(m.startPush(15)).toBe('Equal');
	});

	it('a cooled core makes gravity the bigger push; a heated core makes pressure the bigger push', () => {
		for (const T0 of [10, 12, 14]) {
			const p = m.pushes(m.newRun(T0));
			expect(p.G, `${T0} MK`).toBeGreaterThan(p.P);
			expect(m.startPush(T0)).toBe('Gravity');
		}
		for (const T0 of [16, 18, 20]) {
			const p = m.pushes(m.newRun(T0));
			expect(p.P, `${T0} MK`).toBeGreaterThan(p.G);
			expect(m.startPush(T0)).toBe('Pressure');
		}
	});

	it('shrinks a cooled star, swells a heated one, and returns both to size 1.00 and 15 MK (the lesson’s thermostat)', () => {
		for (const T0 of [10, 11, 12, 14, 16, 18, 20]) {
			const { r } = run(T0);
			expect(r.settled, `${T0} MK settles`).toBe(true);
			expect(r.x, `${T0} MK size`).toBe(1);
			expect(m.coreT(r), `${T0} MK temperature`).toBe(15);
			if (T0 < 15) { expect(r.minX).toBeLessThan(0.99); expect(r.maxX).toBeLessThan(1.0001); }
			else { expect(r.maxX).toBeGreaterThan(1.01); expect(r.minX).toBeGreaterThan(0.9999); }
		}
	});

	it('gives the numbers the Try this steps promise', () => {
		const cool = run(12), hot = run(18);
		expect(cool.r.minX.toFixed(2)).toBe('0.85');
		expect(Math.round(cool.maxT)).toBe(18);
		expect(hot.r.maxX.toFixed(2)).toBe('1.15');
		// the core of the heated star cools to about 13 MK on the way
		const r = m.newRun(18);
		let low = 99;
		for (let i = 0; i < 700 && !r.settled; i++) { m.step(r, 1 / 60); low = Math.min(low, m.coreT(r)); }
		expect(Math.round(low)).toBe(13);
	});

	it('settles inside the longest reduced-motion run: three presses of 4 s', () => {
		for (const T0 of [10, 20]) expect(run(T0).steps / 60).toBeLessThan(12);
		expect(run(10).steps / 60).toBeGreaterThan(8);
	});

	it('keeps the pushes and the size in range at every step of every run', () => {
		for (const T0 of [10, 20]) {
			const r = m.newRun(T0);
			for (let i = 0; i < 60 * 20; i++) {
				m.step(r, 1 / 60);
				const p = m.pushes(r);
				expect(r.x).toBeGreaterThan(0.6);
				expect(r.x).toBeLessThan(1.4);
				expect(p.P).toBeGreaterThan(0);
				expect(p.G).toBeGreaterThan(0);
			}
			expect(r.series.length).toBeLessThanOrEqual(121);
		}
	});

	it('gives brightness 16 and lifetime 1.25 billion years for twice the Sun’s mass, as the exam says', () => {
		expect(m.brightness(1)).toBe(1);
		expect(m.lifetime(1)).toBe(10);
		expect(m.brightness(2)).toBe(16);
		expect(m.lifetime(2)).toBe(1.25);
		expect(m.brightness(0.5)).toBeCloseTo(0.0625, 10);
		expect(m.lifetime(0.5)).toBe(80);
		expect(m.lifetime(1.5)).toBeCloseTo(2.963, 3);
	});

	it('answers the mass question: more mass is hotter, bigger, brighter and shorter-lived', () => {
		const ms = [0.5, 1, 1.5, 2];
		for (let i = 1; i < ms.length; i++) {
			expect(m.massTemp(ms[i])).toBeGreaterThan(m.massTemp(ms[i - 1]));
			expect(m.massSize(ms[i])).toBeGreaterThan(m.massSize(ms[i - 1]));
			expect(m.brightness(ms[i])).toBeGreaterThan(m.brightness(ms[i - 1]));
			expect(m.lifetime(ms[i])).toBeLessThan(m.lifetime(ms[i - 1]));
		}
		expect(m.massTemp(1)).toBe(15);
		expect(Math.round(m.massTemp(2))).toBe(22);
	});
});

describe('5-4a: radiation and matter', () => {
	const m = load('5-4a.js', '5-4a');

	it('starts on visible light at brightness 3, which breaks nothing, so the prediction is not answered at load', () => {
		expect(m.DEFAULTS).toEqual({ band: 4, bright: 3, target: 3, ev: false });
		expect(m.BANDS[m.DEFAULTS.band - 1].name).toBe('Visible light');
		expect(m.brokenEachSecond(m.DEFAULTS.band - 1, m.DEFAULTS.bright)).toBe(0);
	});

	it('breaks bonds from ultraviolet up, and never in a lower band, however bright', () => {
		for (let b = 0; b < 7; b++) {
			for (let bright = 1; bright <= 5; bright++) {
				const n = m.brokenEachSecond(b, bright);
				if (b >= m.FIRST_IONIZING) expect(n, `band ${b}`).toBe(m.photonsEach(bright));
				else expect(n, `band ${b}`).toBe(0);
			}
		}
	});

	it('gives one set of brightness numbers: 1, 2, 4, 8 and 16 photons each second', () => {
		expect([1, 2, 3, 4, 5].map(m.photonsEach)).toEqual([1, 2, 4, 8, 16]);
	});

	it('gives the numbers the Try this steps promise', () => {
		expect([m.photonsEach(5), m.brokenEachSecond(0, 5)]).toEqual([16, 0]);   // radio at brightness 5
		expect([m.photonsEach(1), m.brokenEachSecond(5, 1)]).toEqual([1, 1]);    // X-rays at brightness 1
		expect(m.brokenEachSecond(3, 3)).toBe(0);                                // visible at brightness 3
		expect(m.brokenEachSecond(4, 3)).toBe(4);                                // ultraviolet at brightness 3
	});

	it('does not let brightness change the effect on a target', () => {
		for (let b = 0; b < 7; b++) for (let t = 0; t < 4; t++) expect(m.effect(b, t)).toBe(m.EFFECT[b][t]);
		expect(m.effect(1, 0)).toMatch(/rotates/);
		expect(m.effect(2, 1)).toMatch(/stretch/);
		expect(m.effect(1, 1)).toBe('No effect');          // carbon dioxide has no dipole to twist
		expect(m.effect(0, 3)).toBe('No effect');
		expect(m.effect(5, 3)).toBe('DNA bond breaks');
	});

	it('keeps the eV table in rising order and equal to the lesson table', () => {
		const ev = m.BANDS.map((b: { ev: string }) => b.ev);
		expect(ev).toEqual(['4.1 × 10⁻⁹ eV', '1.0 × 10⁻⁵ eV', '0.124 eV', '2.25 eV', '4.13 eV', '12,400 eV', '1,240,000 eV']);
		const html = read('lessons/5-4a_electromagnetic-radiation-matter.html');
		for (const v of ['0.124 eV', '2.25 eV', '4.13 eV', '12,400 eV']) expect(html).toContain(v.replace(' eV', '') );
		expect(html).toContain('1,240,000 eV');
	});
});

describe('5-8a: the decay lab', () => {
	const m = load('5-8a.js', '5-8a');
	const marks = (key: string) => {
		const s = m.newSample(key);
		const out: number[] = [];
		let steps = 0;
		while (steps < 4 * m.STEPS_PER_HL) {
			m.stepSample(s, 1 / 60);
			steps++;
			if (m.atMark(s)) out.push(s.remaining);
		}
		return { s, out, steps };
	};

	it('uses no random function that differs between engines', () => {
		const js = read('lessons/5-8a.js');
		const model = js.slice(0, js.indexOf('/* ================= the pages'));
		expect(model.replace(/\/\/.*$/gm, '')).not.toMatch(/Math\.(hypot|cos|sin|tan|atan2?|pow|exp|random)\(/);
	});

	it('halves the sample in 128 fixed steps, so a half-life is the same time on every screen', () => {
		expect(m.STEPS_PER_HL).toBe(128);
		expect(Math.abs(Math.pow(1 - m.P_STEP, 128) - 0.5)).toBeLessThan(1e-12);
	});

	it('shows the typical halving for every isotope, and the numbers the Try this steps promise', () => {
		expect(marks('C14').out).toEqual([49, 25, 12, 6]);
		expect(marks('Cs137').out).toEqual([54, 24, 12, 8]);
		expect(marks('I131').out).toEqual([46, 25, 11, 4]);
		expect(marks('U238').out).toEqual([47, 22, 15, 4]);
		expect(marks('Ra226').out).toEqual([51, 22, 14, 5]);
		for (const iso of m.ISOTOPES) {
			const o = marks(iso.key).out;
			expect(o[0], iso.key).toBeGreaterThanOrEqual(45); expect(o[0], iso.key).toBeLessThanOrEqual(55);
			expect(o[1], iso.key).toBeGreaterThanOrEqual(20); expect(o[1], iso.key).toBeLessThanOrEqual(30);
			expect(o[0] > o[1] && o[1] > o[2] && o[2] > o[3]).toBe(true);
		}
	});

	it('gives the same decays whatever is drawn on the screen: a second generator picks the directions', () => {
		const a = m.newSample('C14'), b = m.newSample('C14');
		for (let i = 0; i < 300; i++) { m.stepSample(a, 1 / 60); m.stepSample(b, 1 / 60); b.rV(); b.rV(); }
		expect(b.remaining).toBe(a.remaining);
	});

	it('writes the time with each isotope’s own unit', () => {
		const t = (k: string, h: number) => m.timeText(m.ISOTOPES.find((x: { key: string }) => x.key === k), h);
		expect(t('C14', 1)).toBe('5,730 years');
		expect(t('C14', 3)).toBe('17,190 years');
		expect(t('Cs137', 2)).toBe('60.4 years');
		expect(t('I131', 2)).toBe('16 days');
		expect(t('U238', 1)).toBe('4.47 billion years');
		expect(t('Ra226', 2)).toBe('3,200 years');
	});

	it('does not start solved: the default sample is whole and nothing has decayed', () => {
		const s = m.newSample('C14');
		for (let i = 0; i < 10; i++) expect(s.alive[i]).toBe(true);
		expect(s.remaining).toBe(100);
		expect(m.halfLives(s)).toBe(0);
	});
});

describe('5-8a: one fission', () => {
	const m = load('5-8a.js', '5-8a');
	it('runs a fixed 3.4 s timeline in three phases', () => {
		expect(m.FISS.TOTAL).toBeCloseTo(3.4, 10);
		expect(m.fissionPhase(0)).toBe('approach');
		expect(m.fissionPhase(1.5)).toBe('wobble');
		expect(m.fissionPhase(2.5)).toBe('split');
		expect(m.fissionPhase(3.4)).toBe('done');
	});
	it('counts the same protons and neutrons in and out, as the readouts say', () => {
		expect(235 + 1).toBe(141 + 92 + 3);
		expect(92).toBe(56 + 36);
		const html = read('lessons/5-8a_nuclear-reactions-radioactive-decay.html');
		expect(html).toContain('235 + 1 = 236');
	});
});

describe('5-8a: the chain reaction (Enrichment)', () => {
	const m = load('5-8a.js', '5-8a');
	const run = (rods: number, gens: number) => {
		const c = m.newChain();
		m.startChain(c);
		const out = [c.n];
		for (let i = 0; i < gens; i++) { m.nextGeneration(c, rods); out.push(Math.round(c.n)); }
		return out;
	};
	it('gives k from the rods: 1.50 with none in, 1.00 at half, 0.50 with all in', () => {
		expect([0, 30, 50, 100].map((r) => m.kOf(r))).toEqual([1.5, 1.2, 1, 0.5]);
	});
	it('holds steady at k = 1, grows above 1 and dies out below 1', () => {
		expect(run(50, 5)).toEqual([50, 50, 50, 50, 50, 50]);
		expect(run(30, 5)).toEqual([50, 60, 72, 86, 104, 124]);
		expect(run(100, 5)).toEqual([50, 25, 13, 6, 3, 2]);
		expect(run(100, 9)[9]).toBe(0);
	});
	it('caps a runaway chain and keeps the history to 24 bars', () => {
		const c = m.newChain();
		m.startChain(c);
		for (let i = 0; i < 60; i++) { m.nextGeneration(c, 0); expect(c.n).toBeLessThanOrEqual(m.CHAIN.CAP); expect(c.n).toBeGreaterThanOrEqual(0); }
		expect(c.series.length).toBe(24);
	});
	it('does nothing before the run starts', () => {
		const c = m.newChain();
		m.nextGeneration(c, 0);
		expect(c.n).toBe(0);
		expect(c.gen).toBe(0);
	});
});

describe('5-2a: the redshift analyzer', () => {
	const m = load('5-2a.js', '5-2a');
	it('starts at a distance of 0, so the lines have not moved and the prediction is not answered at load', () => {
		expect(m.DEFAULTS).toEqual({ d: 0 });
		for (const l of m.LINES) expect(m.observed(l.rest, 0)).toBe(l.rest);
	});
	it('moves every line toward red by an amount that grows with distance, in a straight line (Hubble’s law)', () => {
		for (const l of m.LINES) {
			let prev = 0;
			for (let d = 0.5; d <= 6; d += 0.5) {
				const s = m.shift(l.rest, d);
				expect(s).toBeGreaterThan(prev);
				expect(Math.abs(s - l.rest * 0.07 * d)).toBeLessThan(1e-9);
				prev = s;
			}
		}
	});
	it('gives the numbers the Try this steps and the figure promise', () => {
		const ha = m.LINES[3];
		expect(Math.round(m.observed(ha.rest, 1))).toBe(702);
		expect(Math.round(m.shift(ha.rest, 1))).toBe(46);
		expect(Math.round(m.observed(ha.rest, 3))).toBe(794);
		expect(m.inWindow(m.observed(ha.rest, 3))).toBe(false);
		expect(Math.round(m.observed(ha.rest, 5))).toBe(886);
		expect(Math.round(m.shift(ha.rest, 5))).toBe(230);
		// Figure 5.2: a galaxy 2 billion light-years away
		expect([410.2, 434.0, 486.1, 656.3].map((r) => Math.round(m.observed(r, 2)))).toEqual([468, 495, 554, 748]);
		// the Enrichment block: H0 = 70 km/s per Mpc is 0.07 per billion light-years (v = z c)
		expect((70 * (1e9 / 3.26e6)) / 3e5).toBeCloseTo(m.Z_PER_GLY, 2);
	});
	it('keeps the Hα line inside the visible window up to about 2.5 billion light-years', () => {
		const ha = m.LINES[3];
		expect(m.inWindow(m.observed(ha.rest, 2.5))).toBe(true);
		expect(m.inWindow(m.observed(ha.rest, 3))).toBe(false);
	});
});

describe('5-3a: the shell explorer and the collapse stepper (Enrichment)', () => {
	const m = load('5-3a.js', '5-3a');
	it('lists six shells that get hotter and burn for a shorter time, and an iron core that takes in energy', () => {
		expect(m.SHELLS.map((s: { temp: string }) => s.temp)).toEqual(['40 MK', '200 MK', '800 MK', '1.5 GK', '3.5 GK', '5 GK']);
		expect(m.SHELLS[0].time).toBe('7 million years');
		expect(m.SHELLS[4].time).toBe('about 1 day');
		expect(m.SHELLS.filter((s: { energy: string }) => s.energy === 'Takes in energy').map((s: { name: string }) => s.name)).toEqual(['Iron core']);
	});
	it('gives the same numbers as Figure 5.4 in the lesson', () => {
		const html = read('lessons/5-3a_stellar-nucleosynthesis-element-origins.html');
		for (const s of ['40 MK, 7 million years', '200 MK, 500,000 years', '800 MK, 600 years', '1.5 GK, 6 months', '3.5 GK, about 1 day']) expect(html).toContain(s);
	});
	it('has four collapse stages with the numbers the Try this steps promise', () => {
		expect(m.STAGES).toHaveLength(4);
		expect([m.STAGES[0].radius, m.STAGES[1].radius, m.STAGES[2].radius]).toEqual(['5,000 km', '80 km', '12 km']);
		expect([m.STAGES[0].speed, m.STAGES[1].speed, m.STAGES[2].speed]).toEqual(['0 km/s', '70,000 km/s', '30,000 km/s outward']);
	});
});
