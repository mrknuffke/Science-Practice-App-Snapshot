/* global process, console */
/**
 * Flags HTML markup inside sort-classify category labels.
 *
 * core.js renders those labels with textContent, so `NH<sub>4</sub>` shows the
 * tags literally (shipped in lesson 1-2c). Other widgets' `label` fields render
 * as HTML and may legitimately contain markup, which is why this looks only
 * inside `categories` arrays - the key only sort-classify reads.
 *
 *   node scripts/claude-hooks/check-sort-labels.mjs <lesson file>...
 */
import fs from 'node:fs';

let found = 0;
for (const file of process.argv.slice(2)) {
	const src = fs.readFileSync(file, 'utf8');
	for (const block of src.matchAll(/["']?categories["']?\s*:\s*\[([\s\S]*?)\]/g)) {
		for (const m of block[1].matchAll(/["']?label["']?\s*:\s*(["'`])((?:\\.|(?!\1).)*)\1/g)) {
			if (/<\/?[a-z][^>]*>/i.test(m[2])) {
				const line = src.slice(0, block.index + block[0].indexOf(m[0])).split('\n').length;
				console.log(`${file}:${line}: ${m[2]}`);
				found++;
			}
		}
	}
}
process.exit(found ? 1 : 0);
