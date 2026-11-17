import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Drift guard: every CSS custom property each textbook reads is defined.
 *
 * An undefined `var(--token)` fails silently: the property falls back to its
 * initial value, so a colour goes black, a gap collapses, a circle gets r=0, and
 * nothing errors. Undefined tokens shipped in the textbook once and were only
 * found in a later audit. See docs/RENDERING_GOTCHAS.md.
 *
 * `var(--x, fallback)` is exempt: the fallback is the author saying "may be unset".
 */

const BOOKS = ['chem', 'physics', 'bio'];
// A migrated book takes the type scale, spacing and fonts from the shared runtime
// (docs/textbook/RUNTIME_SPEC.md), so what public/textbook/ defines counts as defined.
const MIGRATED: string[] = JSON.parse(
	fs.readFileSync(path.resolve(__dirname, 'textbookStandard.baseline.json'), 'utf8'),
).migrated;
const SHARED_DIR = path.resolve(__dirname, '../../public/textbook');
const SKIP_DIRS = new Set(['References', 'diagram-generator']);

function files(dir: string): string[] {
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) return SKIP_DIRS.has(e.name) ? [] : files(p);
		return /\.(css|html|js)$/.test(e.name) ? [p] : [];
	});
}

const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');

describe.each(BOOKS)('%s textbook CSS tokens', (book) => {
	const ROOT = path.resolve(__dirname, `../../public/${book}`);

	it('defines every custom property it uses without a fallback', () => {
		const defined = new Set<string>();
		if (MIGRATED.includes(book)) {
			// the specimen's token preview is not a definition the book can rely on
			for (const file of files(SHARED_DIR).filter((f) => !f.endsWith('specimen.css'))) {
				const src = stripComments(fs.readFileSync(file, 'utf8'));
				for (const m of src.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)) defined.add(m[1]);
			}
		}
		const used = new Map<string, Set<string>>();

		for (const file of files(ROOT)) {
			const src = stripComments(fs.readFileSync(file, 'utf8'));
			for (const m of src.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)) defined.add(m[1]);
			for (const m of src.matchAll(/setProperty\(\s*['"`](--[A-Za-z0-9_-]+)/g)) defined.add(m[1]);
			for (const m of src.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)\s*(,)?/g)) {
				if (m[2]) continue;
				if (!used.has(m[1])) used.set(m[1], new Set());
				used.get(m[1])!.add(path.relative(ROOT, file));
			}
		}

		const undefinedTokens = [...used]
			.filter(([token]) => !defined.has(token))
			.map(([token, where]) => `${token} (used in ${[...where].slice(0, 3).join(', ')})`);

		expect(undefinedTokens).toEqual([]);
	});
});
