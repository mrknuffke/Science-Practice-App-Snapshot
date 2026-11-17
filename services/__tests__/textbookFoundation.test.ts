import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Drift guard: every textbook's tokens.css applies its tokens to the page.
 *
 * Lessons declare `color-scheme: light dark`. With no body background the browser
 * paints the canvas from the OS theme, so a light book on a dark Mac showed dark
 * text on black. Without a box-sizing reset, padded width:100% elements overflow
 * their column. See docs/RENDERING_GOTCHAS.md.
 */

// A book that runs on the shared runtime takes its page foundation from the shared
// stylesheet, and textbookStandard.test.ts checks it there. A Phase 4 session adds
// its book to "migrated" in textbookStandard.baseline.json.
const MIGRATED: string[] = JSON.parse(
	fs.readFileSync(path.resolve(__dirname, 'textbookStandard.baseline.json'), 'utf8'),
).migrated;
const BOOKS = ['chem', 'physics', 'bio'].filter((book) => !MIGRATED.includes(book));

function rule(css: string, selector: string): string {
	const start = css.search(new RegExp(`(^|\\n)${selector}\\s*\\{`));
	if (start === -1) return '';
	return css.slice(start, css.indexOf('}', start));
}

describe.each(BOOKS)('%s tokens.css page foundation', (book) => {
	const css = fs
		.readFileSync(path.resolve(__dirname, `../../public/${book}/assets/tokens.css`), 'utf8')
		.replace(/\/\*[\s\S]*?\*\//g, '');

	it('resets box-sizing on every element', () => {
		expect(css).toMatch(/\*\s*,\s*\*::before\s*,\s*\*::after\s*\{[^}]*box-sizing\s*:\s*border-box/);
	});

	it('paints the page from the book tokens', () => {
		const body = rule(css, 'body');
		expect(body).toMatch(/background(-color)?\s*:\s*var\(--paper\)/);
		expect(body).toMatch(/color\s*:\s*var\(--ink\)/);
	});
});

describe('page foundation coverage', () => {
	it('every book is checked here or as a migrated book', () => {
		expect([...BOOKS, ...MIGRATED].sort()).toEqual(['bio', 'chem', 'physics']);
	});
});
