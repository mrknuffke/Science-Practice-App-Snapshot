import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

/**
 * Guards for public/chem/assets/book.js (docs/textbook/RUNTIME_SPEC.md, sections 3 and 7).
 *
 * A student's progress is the one thing the move to the shared runtime must not lose. Chem keeps
 * it in localStorage under "gc-textbook-progress", keyed by lesson id and by "<type>-<position>".
 * Turning a data-predict question into a widget moved the position of every widget after it, so
 * book.js remaps the old keys once. These tests run the real file against a stubbed page.
 */

const ROOT = path.resolve(__dirname, '../..');
const BOOK = fs.readFileSync(path.join(ROOT, 'public/chem/assets/book.js'), 'utf8');
const LESSONS: Array<{ id: string; slug: string }> = JSON.parse(
	fs.readFileSync(path.join(ROOT, 'public/chem/lessons.json'), 'utf8'),
).lessons;

interface Page {
	store: Record<string, string>;
	window: Record<string, unknown> & { TB: { progressHandler: { mark: (t: string, i: number, v?: unknown) => void; isDone: (t: string, i: number) => boolean } } };
}

/** Runs book.js as it would run in a lesson: before the shared core.js, on a page with no elements it needs. */
function runBook(lesson: string, store: Record<string, string>): Page {
	const noop = () => undefined;
	const dataset: Record<string, string> = lesson ? { lesson } : {};
	const doc = {
		documentElement: { dataset },
		readyState: 'loading',
		body: { classList: { toggle: noop, add: noop } },
		querySelector: () => null,
		querySelectorAll: () => [],
		addEventListener: noop,
		createElement: () => ({}),
	};
	const win: Record<string, unknown> = {};
	const ctx: Record<string, unknown> = {
		window: win,
		document: doc,
		location: { pathname: `/chem/lessons/${lesson}.html` },
		localStorage: {
			getItem: (k: string) => (k in store ? store[k] : null),
			setItem: (k: string, v: string) => void (store[k] = String(v)),
			removeItem: (k: string) => void delete store[k],
			clear: () => Object.keys(store).forEach((k) => delete store[k]),
		},
		sessionStorage: { getItem: () => null, setItem: noop, removeItem: noop },
		matchMedia: () => ({ matches: false }),
		console,
		CustomEvent: class {},
		// book.js waits for the shared core.js, which is not loaded here
		TB: undefined,
	};
	ctx.window = Object.assign(win, ctx);
	vm.runInNewContext(BOOK, ctx);
	return { store, window: win as Page['window'] };
}

const progress = (store: Record<string, string>) => JSON.parse(store['gc-textbook-progress'] || '{}');

describe('chem book.js: progress survives the move to the shared runtime', () => {
	it('registers the progress handler and says it keeps progress', () => {
		const { window } = runBook('1-1b', {});
		expect(typeof window.TB.progressHandler.mark).toBe('function');
		expect((window as unknown as { TB_BOOK: { progress: boolean; id: string } }).TB_BOOK).toMatchObject({ id: 'chem', progress: true });
	});

	it('moves an old predict answer and the widget keys after it, once', () => {
		const seed = {
			'1-3b': {
				'predict-0': true,
				'predict-1': { completed: true, box: 2, interval: 3 },
				'commit-reveal-0': { completed: true, box: 1, interval: 1 },
				'diagnose-error-2': { completed: true, box: 1, interval: 1 },
				'recall-0': true,
			},
		};
		const store = { 'gc-textbook-progress': JSON.stringify(seed) };
		runBook('1-3b', store);
		const lp = progress(store)['1-3b'];
		// the two predict questions became widgets 2 and 3 (stage 1) and then 4 and 5 (Unit 1 rebuild);
		// the diagnose widget moved from 2 to 4 and then to 6
		expect(lp['commit-reveal-4']).toBe(true);
		expect(lp['commit-reveal-5']).toMatchObject({ completed: true, box: 2, interval: 3 });
		expect(lp['diagnose-error-6']).toMatchObject({ completed: true });
		expect(lp['predict-0']).toBeUndefined();
		expect(lp['diagnose-error-2']).toBeUndefined();
		expect(lp['diagnose-error-4']).toBeUndefined();
		// what did not move stays
		expect(lp['commit-reveal-0']).toMatchObject({ completed: true });
		expect(lp['recall-0']).toBe(true);
		expect(lp._map).toBe(1);

		// a second visit changes nothing
		const again = JSON.stringify(progress(store));
		runBook('1-3b', store);
		expect(JSON.stringify(progress(store))).toBe(again);
	});

	it('a student with no progress yet is marked as mapped, so later keys are never remapped', () => {
		const store: Record<string, string> = {};
		runBook('1-3b', store);
		expect(progress(store)['1-3b']._map).toBe(1);
	});

	it('a lesson with no predict questions is left alone', () => {
		const seed = { '1-2b': { 'commit-reveal-0': true } };
		const store = { 'gc-textbook-progress': JSON.stringify(seed) };
		runBook('1-2b', store);
		expect(progress(store)).toEqual(seed);
	});

	it('marks and reads a checkpoint in the same record the dashboard reads', () => {
		const store: Record<string, string> = {};
		const { window } = runBook('1-1b', store);
		expect(window.TB.progressHandler.isDone('commit-reveal', 0)).toBe(false);
		window.TB.progressHandler.mark('commit-reveal', 0);
		expect(window.TB.progressHandler.isDone('commit-reveal', 0)).toBe(true);
		const lp = progress(store)['1-1b'];
		expect(lp['commit-reveal-0']).toMatchObject({ completed: true, box: 1, interval: 1, attempts: 1 });
		expect(typeof lp['commit-reveal-0'].nextDue).toBe('number');
	});

	it('migrates the lesson ids that were renamed before the book moved, as it always did', () => {
		const store = { 'gc-textbook-progress': JSON.stringify({ '2-2a': { 'recall-0': true } }) };
		runBook('1-2d', store);
		expect(progress(store)['1-2d']['recall-0']).toBe(true);
	});
});

describe('chem book.js: the Unit 1 rebuild moves keys a second time, once', () => {
	it('moves every 1-1a widget after the new prediction and evidence check, all at once', () => {
		const seed = {
			'1-1a': {
				_map: 1,
				'faded-example-0': true,
				'commit-reveal-1': { completed: true, box: 2, interval: 3 },
				'commit-reveal-3': true,
				'recall-0': true,
			},
		};
		const store = { 'gc-textbook-progress': JSON.stringify(seed) };
		runBook('1-1a', store);
		const lp = progress(store)['1-1a'];
		expect(lp['faded-example-2']).toBe(true);
		expect(lp['commit-reveal-3']).toMatchObject({ completed: true, box: 2, interval: 3 });
		expect(lp['commit-reveal-5']).toBe(true);
		expect(lp['faded-example-0']).toBeUndefined();
		expect(lp['commit-reveal-1']).toBeUndefined();
		expect(lp['recall-0']).toBe(true);
		expect(lp._map2).toBe(1);
		const again = JSON.stringify(progress(store));
		runBook('1-1a', store);
		expect(JSON.stringify(progress(store))).toBe(again);
	});

	it('a student who never ran the first remap gets both, in order', () => {
		const seed = { '1-1b': { 'predict-0': true, 'predict-1': { completed: true, box: 2 } } };
		const store = { 'gc-textbook-progress': JSON.stringify(seed) };
		runBook('1-1b', store);
		const lp = progress(store)['1-1b'];
		// predict-0 became commit-reveal-0 (stage 1) and then commit-reveal-3 (stage 2)
		expect(lp['commit-reveal-3']).toBe(true);
		expect(lp['commit-reveal-4']).toMatchObject({ completed: true, box: 2 });
		expect(lp['predict-0']).toBeUndefined();
		expect(lp._map).toBe(1);
		expect(lp._map2).toBe(1);
	});

	it('a student with no progress yet is marked as mapped for both', () => {
		const store: Record<string, string> = {};
		runBook('1-2a', store);
		expect(progress(store)['1-2a']).toMatchObject({ _map: 1, _map2: 1 });
	});
});

describe('chem book.js: the Unit 2 rebuild moves keys a second time, once', () => {
	it('moves the 1-2d checkpoints and the sort drill behind the new prediction and evidence check', () => {
		const seed = {
			'1-2d': {
				_map: 1,
				'commit-reveal-0': { completed: true, box: 2, interval: 3 },
				'commit-reveal-1': true,
				'sort-classify-2': true,
				'recall-0': true,
			},
		};
		const store = { 'gc-textbook-progress': JSON.stringify(seed) };
		runBook('1-2d', store);
		const lp = progress(store)['1-2d'];
		expect(lp['commit-reveal-2']).toMatchObject({ completed: true, box: 2, interval: 3 });
		expect(lp['commit-reveal-3']).toBe(true);
		expect(lp['sort-classify-4']).toBe(true);
		expect(lp['commit-reveal-0']).toBeUndefined();
		expect(lp['sort-classify-2']).toBeUndefined();
		expect(lp['recall-0']).toBe(true);
		expect(lp._map2).toBe(1);
		const again = JSON.stringify(progress(store));
		runBook('1-2d', store);
		expect(JSON.stringify(progress(store))).toBe(again);
	});

	it('moves the 1-7c and 2-6a checkpoints past the two new checks in each lesson', () => {
		for (const [id, moves] of [['1-7c', [[0, 3], [1, 4]]], ['2-6a', [[0, 2], [1, 3]]]] as const) {
			const seed: Record<string, Record<string, unknown>> = { [id]: { _map: 1 } };
			for (const [from] of moves) seed[id][`commit-reveal-${from}`] = { completed: true, box: 1 + from };
			const store = { 'gc-textbook-progress': JSON.stringify(seed) };
			runBook(id, store);
			const lp = progress(store)[id];
			for (const [from, to] of moves) {
				expect(lp[`commit-reveal-${to}`], `${id} ${from} to ${to}`).toMatchObject({ completed: true, box: 1 + from });
				expect(lp[`commit-reveal-${from}`]).toBeUndefined();
			}
			expect(lp._map2).toBe(1);
		}
	});

	it('moves the 3-1a checkpoint past the vessels\' two new checks, and the 1-4a exam past its Enrichment practice item', () => {
		const seed3 = { '3-1a': { _map: 1, 'commit-reveal-0': { completed: true, box: 2 }, 'recall-0': true } };
		const store3 = { 'gc-textbook-progress': JSON.stringify(seed3) };
		runBook('3-1a', store3);
		const a = progress(store3)['3-1a'];
		expect(a['commit-reveal-2']).toMatchObject({ completed: true, box: 2 });
		expect(a['commit-reveal-0']).toBeUndefined();
		expect(a['recall-0']).toBe(true);
		expect(a._map2).toBe(1);
		const seed4 = { '1-4a': { _map: 1, 'commit-reveal-0': true, 'scheme-0': { completed: true, box: 1 }, 'peek-0': true } };
		const store4 = { 'gc-textbook-progress': JSON.stringify(seed4) };
		runBook('1-4a', store4);
		const b = progress(store4)['1-4a'];
		expect(b['scheme-1']).toMatchObject({ completed: true, box: 1 });
		expect(b['scheme-0']).toBeUndefined();
		expect(b['commit-reveal-0']).toBe(true);
		expect(b['peek-0']).toBe(true);
	});

	it('moves the 4-1b, 4-6a and 4-6b (1-5b, 1-6a, 1-6b) free-text checks past the sim\'s prediction and evidence check, and leaves 4-1a alone', () => {
		for (const id of ['1-5b', '1-6a', '1-6b']) {
			const seed = { [id]: { _map: 1, 'commit-reveal-0': { completed: true, box: 2 }, 'recall-0': true, 'scheme-0': true } };
			const store = { 'gc-textbook-progress': JSON.stringify(seed) };
			runBook(id, store);
			const lp = progress(store)[id];
			expect(lp['commit-reveal-2'], id).toMatchObject({ completed: true, box: 2 });
			expect(lp['commit-reveal-0'], id).toBeUndefined();
			expect(lp['recall-0']).toBe(true);
			expect(lp['scheme-0']).toBe(true);
			expect(lp._map2).toBe(1);
		}
		const seed = { '1-5a': { _map: 1, 'commit-reveal-0': true, 'recall-0': true, 'scheme-0': true, 'peek-0': true } };
		const store = { 'gc-textbook-progress': JSON.stringify(seed) };
		runBook('1-5a', store);
		const lp = progress(store)['1-5a'];
		expect(lp['commit-reveal-0']).toBe(true);
		expect(lp['peek-0']).toBe(true);
	});

	it('moves the Unit 5 self-explain to its model-answer box, and the core exam past the Enrichment exam, and leaves 5-1a\'s exam and 5-8a alone', () => {
		const cases: Record<string, { peek: string; scheme: string }> = {
			'E1-1a': { peek: 'peek-0', scheme: 'scheme-0' },
			'E1-2a': { peek: 'peek-0', scheme: 'scheme-1' },
			'E1-3a': { peek: 'peek-1', scheme: 'scheme-1' },
			'4-4a': { peek: 'peek-0', scheme: 'scheme-1' },
		};
		for (const [id, want] of Object.entries(cases)) {
			const seed = { [id]: { _map: 1, 'commit-reveal-0': { completed: true, box: 1 }, 'recall-0': true, 'scheme-0': true } };
			const store = { 'gc-textbook-progress': JSON.stringify(seed) };
			runBook(id, store);
			const lp = progress(store)[id];
			expect(lp[want.peek], id).toMatchObject({ completed: true, box: 1 });
			expect(lp['commit-reveal-0'], id).toBeUndefined();
			expect(lp[want.scheme], id).toBe(true);
			if (want.scheme !== 'scheme-0') expect(lp['scheme-0'], id).toBeUndefined();
			expect(lp['recall-0']).toBe(true);
			expect(lp._map2).toBe(1);
		}
		const seed = { '1-8a': { _map: 1, 'recall-0': true, 'scheme-0': true } };
		const store = { 'gc-textbook-progress': JSON.stringify(seed) };
		runBook('1-8a', store);
		const lp = progress(store)['1-8a'];
		expect(lp['recall-0']).toBe(true);
		expect(lp['scheme-0']).toBe(true);
	});

	it('leaves 3-1b, 3-1c and 3-4a alone: their checkpoints stay ahead of the new sims', () => {
		for (const id of ['3-1b', '3-1c', '3-4a']) {
			const seed = { [id]: { _map: 1, 'commit-reveal-0': true, 'recall-0': true, 'scheme-0': true } };
			const store = { 'gc-textbook-progress': JSON.stringify(seed) };
			runBook(id, store);
			const lp = progress(store)[id];
			expect(lp['commit-reveal-0']).toBe(true);
			expect(lp['recall-0']).toBe(true);
			expect(lp['scheme-0']).toBe(true);
		}
	});

	it('leaves 1-2e, 1-7a and 1-7b alone: their tools added no widget', () => {
		for (const id of ['1-2e', '1-7a', '1-7b']) {
			const seed = { [id]: { _map: 1, 'commit-reveal-0': true, 'recall-0': true } };
			const store = { 'gc-textbook-progress': JSON.stringify(seed) };
			runBook(id, store);
			const lp = progress(store)[id];
			expect(lp['commit-reveal-0']).toBe(true);
			expect(lp['recall-0']).toBe(true);
		}
	});
});

describe('chem book.js: nothing else about the book moved', () => {
	it('every lesson in the progress map is a lesson in lessons.json', () => {
		const ids = [...BOOK.matchAll(/^\s{4}'([A-Za-z0-9-]+)': \[$/gm)].map((m) => m[1]);
		expect(ids.length).toBeGreaterThan(0);
		expect(ids.filter((id) => !LESSONS.some((l) => l.id === id))).toEqual([]);
	});

	it('keys the practice bridge by manifest id, so every lesson that has an entry gets its bridge', () => {
		const start = BOOK.indexOf('const LESSON_INTEGRATION_MAP = {');
		const end = BOOK.indexOf('const bridgeData = LESSON_INTEGRATION_MAP');
		expect(start).toBeGreaterThan(-1);
		const keys = [...BOOK.slice(start, end).matchAll(/^ {6}'([A-Za-z0-9-]+)': \{$/gm)].map((m) => m[1]);
		expect(keys.length).toBeGreaterThan(20);
		expect(keys.filter((id) => !LESSONS.some((l) => l.id === id))).toEqual([]);
		expect(new Set(keys).size).toBe(keys.length);
		expect(LESSONS.filter((l) => !keys.includes(l.id)).map((l) => l.id)).toEqual([]);
	});

	it('keeps no lesson manifest of its own and no em-dash', () => {
		expect(BOOK).not.toMatch(/LESSONS_MANIFEST/);
		expect(BOOK.includes(String.fromCharCode(0x2014))).toBe(false);
	});

	it('lists the Reference Center, the review modes and feedback as top-bar tools, each with an icon', () => {
		for (const id of ['quick-check', 'cram-view', 'references', 'feedback']) {
			expect(BOOK).toContain(`id: '${id}', icon: ICONS['${id}']`);
		}
	});
});

describe('chem book.js: every selector it hands to querySelectorAll is valid', () => {
	// Cram View threw on every exam section, because one selector in its list began with ">" (no :scope).
	it('parses each literal selector without throwing', () => {
		const sels = [...BOOK.matchAll(/querySelectorAll\('([^']+)'\)/g)].map((m) => m[1]);
		expect(sels.length).toBeGreaterThanOrEqual(2);
		const el = document.createElement('div');
		for (const s of sels) expect(() => el.querySelectorAll(s), s).not.toThrow();
	});
	it('has no leftover data-predict code', () => {
		expect(BOOK.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/data-predict/);
	});
});
