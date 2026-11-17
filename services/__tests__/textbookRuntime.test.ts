import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Guards for the shared textbook runtime in public/textbook/
 * (docs/textbook/RUNTIME_SPEC.md, sections 2 and 8).
 *
 * Three books load these files, so a slip here reaches every migrated book.
 * The browser checks (every widget prints, the sim gate, both themes) are in
 * tests/smoke/textbook.smoke.ts. These are the cheap static checks that run
 * with `npm run verify`.
 */

const DIR = path.resolve(__dirname, '../../public/textbook');
const read = (file: string) => fs.readFileSync(path.join(DIR, file), 'utf8');

const migrated = (JSON.parse(fs.readFileSync(path.resolve(__dirname, 'textbookStandard.baseline.json'), 'utf8')) as { migrated: string[] }).migrated;
const SHARED = ['theme-boot.js', 'base.css', 'lesson.css', 'core.js', 'widgets.js', 'sim.js'];
const SPECIMEN = ['specimen.html', 'specimen.js', 'specimen.css'];

/** The per-book tokens of STYLE_STANDARD.md section 2.2 that shared CSS may read. */
const BOOK_TOKENS = [
	'paper', 'paper-2', 'card', 'ink', 'ink-soft', 'ink-mute', 'accent', 'accent-soft',
	'good', 'bad', 'warn', 'cool', 'hair', 'hair-soft', 'grid',
];

const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '');

describe('shared runtime files exist and carry no em-dash', () => {
	it.each([...SHARED, ...SPECIMEN])('%s', (file) => {
		const src = read(file);
		expect(src.length).toBeGreaterThan(100);
		expect(src.includes('—'), `${file} has an em-dash`).toBe(false);
		expect(src.includes('&mdash;'), `${file} has &mdash;`).toBe(false);
	});
});

describe('shared stylesheets obey the token rules', () => {
	const sheets = ['base.css', 'lesson.css'];

	it('name no hex colour and no raw font size (standard, rule 3)', () => {
		const offenders: string[] = [];
		for (const file of sheets) {
			const css = stripComments(read(file));
			for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) offenders.push(`${file}: ${m[0]}`);
			for (const m of css.matchAll(/font-size:\s*([^;}]+)/g)) {
				const v = m[1].trim();
				if (/^[\d.]+(px|rem)\b/.test(v)) offenders.push(`${file}: font-size ${v}`);
			}
		}
		expect(offenders).toEqual([]);
	});

	it('read only tokens that are defined, here or by every book (standard, section 2)', () => {
		const defined = new Set<string>(BOOK_TOKENS);
		const css = sheets.map((f) => stripComments(read(f))).join('\n');
		for (const m of css.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)) defined.add(m[1].slice(2));
		const used = new Set<string>();
		for (const m of css.matchAll(/var\(\s*--([A-Za-z0-9_-]+)\s*(,)?/g)) {
			if (!m[2]) used.add(m[1]);
		}
		// --arrow-left is set by core.js on the tooltip at run time.
		const undefinedTokens = [...used].filter((t) => !defined.has(t) && t !== 'arrow-left');
		expect(undefinedTokens).toEqual([]);
	});

	it('the specimen loads the real tokens file of every book', () => {
		const js = read('specimen.js');
		for (const book of ['bio', 'physics', 'chem']) expect(js).toContain(`${book}: '../${book}/assets/tokens.css'`);
		expect(stripComments(read('specimen.css'))).not.toMatch(/html\[data-tokens=/);
	});

	it('the token preview defines every per-book token, in both themes, for each book not yet migrated', () => {
		const css = stripComments(read('specimen.css'));
		const missing: string[] = [];
		for (const book of ['chem', 'physics'].filter((b) => !migrated.includes(b))) {
			for (const theme of ['', '.dark']) {
				const block = css.match(new RegExp(`html\\[data-tokens="${book}"\\]${theme.replace('.', '\\.')}\\s*\\{([^}]*)\\}`));
				for (const token of BOOK_TOKENS) {
					if (!block || !new RegExp(`--${token}\\s*:`).test(block[1])) missing.push(`${book}${theme}: --${token}`);
				}
			}
		}
		expect(missing).toEqual([]);
	});
});

describe('widgets.js', () => {
	const src = read('widgets.js');
	const registered = [...src.matchAll(/TB\.widgets\.register\('([a-z-]+)',\s*(\w+),\s*(\w+)\)/g)];

	it('registers the eight types of the runtime spec, each with a print function', () => {
		expect(registered.map((m) => m[1]).sort()).toEqual([
			'commit-reveal', 'construct-validate', 'diagnose-error', 'faded-example',
			'predict-run', 'scaffold', 'sort-classify', 'step-builder',
		]);
		for (const [, type, init, print] of registered) {
			expect(src, `${type}: ${init} is not defined`).toMatch(new RegExp(`function ${init}\\b`));
			expect(src, `${type}: ${print} is not defined`).toMatch(new RegExp(`function ${print}\\b`));
		}
	});

	it('has no praise, no exclamation mark and no default "Correct!" in its fixed strings', () => {
		const strings = [...src.matchAll(/(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g)].map((m) => m[2]);
		const bad = strings.filter((t) => /\w!(?:\s|$|<)/.test(t) || /\b(Excellent|Great job|Well done|Perfect)\b/.test(t) || /^(Correct|Incorrect)[.!]/.test(t));
		expect(bad).toEqual([]);
	});

	it('never writes a missing feedback string into the page (it would print "undefined")', () => {
		expect(src.match(/\.feedback;/g)).toBeNull();
	});

	it('fires the gate event when a widget commits, and reads no storage of its own', () => {
		expect(src).toContain("new CustomEvent('tb:commit'");
		expect(src).not.toMatch(/localStorage|sessionStorage/);
	});
});

describe('core.js and sim.js', () => {
	it('core.js reads one theme key and the glossary global of the spec', () => {
		const core = read('core.js');
		expect(core).toContain('sp_dark_mode');
		expect(core).toContain('window.TB_GLOSSARY');
		expect(core).not.toMatch(/GC_GLOSSARY|BIO_GLOSSARY|GP_GLOSSARY/);
	});

	it('core.js holds the model answer back until the student has written something', () => {
		const core = read('core.js');
		expect(core).toContain('[data-peek]');
		expect(core).toMatch(/btn\.disabled = !ready/);
		// the specimen shows the pattern, and its button starts locked
		expect(read('specimen.html')).toMatch(/data-peek disabled/);
	});

	it('theme-boot.js migrates the old keys once', () => {
		const boot = read('theme-boot.js');
		for (const key of ['gc-theme', 'gp_theme', 'physics_theme', 'bio_theme', "'theme'"]) expect(boot).toContain(key);
		expect(boot).toContain('sp_accessibility_mode');
	});

	// The main app and chem's PE practice pages still read gc-theme, so the toggle keeps writing it (core.js).
	it('the toggle still writes gc-theme, and writes no key that nothing reads', () => {
		const core = read('core.js');
		expect(core).toContain("LEGACY_THEME_KEYS = ['gc-theme']");
		expect(stripComments(core)).not.toMatch(/gp_theme|physics_theme/);
	});

	// Until session 4c, chem's and physics' own scripts read their old keys first (RUNTIME_SPEC section 5).
	it.runIf(!migrated.includes('chem') || !migrated.includes('physics'))('while chem or physics is unmigrated, the toggle writes their keys and nothing deletes them', () => {
		const core = read('core.js');
		for (const key of ['gc-theme', 'gp_theme', 'physics_theme']) expect(core).toContain(`'${key}'`);
		expect(stripComments(read('theme-boot.js'))).not.toMatch(/removeItem/);
	});

	it('sim.js locks Record and blanks the readouts until the prediction is committed', () => {
		const sim = stripComments(read('sim.js'));
		expect(sim).toMatch(/lockTargets = \(\) => \[[^\]]*sim-record-actions/);
		// the gate is applied after the Record block is built, never before it
		expect(sim.indexOf('setLocked(true)')).toBeGreaterThan(sim.indexOf("block.className = 'sim-record-block'"));
		expect(sim).toContain('LOCKED_VALUE');
	});

	it('sim.js steps in fixed 1/60 s steps, at most five a frame, and never draws text under 11px', () => {
		const sim = read('sim.js');
		expect(sim).toMatch(/STEP = 1 \/ 60/);
		expect(sim).toMatch(/MAX_STEPS = 5/);
		expect(sim).toMatch(/MIN_FONT = 11/);
		expect(sim).toContain('tb:commit');
	});
});
