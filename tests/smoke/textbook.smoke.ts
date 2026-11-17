import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';

/**
 * The zero-build interactive textbooks (/chem/, /physics/). Each check pins a
 * rendering bug that shipped; see docs/RENDERING_GOTCHAS.md. When a new one is
 * fixed, add its check here.
 *
 * Both books are driven off their own lessons.json, so a new textbook needs
 * only an entry in TEXTBOOKS below. Until Sept 2026 this file was chemistry-only
 * and /physics/ shipped with no coverage at all.
 */

interface Lesson { id: string; slug: string; title: string }

// Books that run on the shared runtime (services/__tests__/textbookStandard.baseline.json)
// must also fit a 360px phone, in both themes. Unmigrated books keep their own layouts.
const MIGRATED: string[] = JSON.parse(
	fs.readFileSync('services/__tests__/textbookStandard.baseline.json', 'utf8'),
).migrated;

const TEXTBOOKS = [
	{ root: 'chem', heading: 'SAS General Chemistry' },
	{ root: 'physics', heading: 'SAS General Physics' },
	{ root: 'bio', heading: 'SAS General Biology' },
].map((book) => ({
	...book,
	lessons: (JSON.parse(
		fs.readFileSync(`public/${book.root}/lessons.json`, 'utf8'),
	) as { lessons: Lesson[] }).lessons,
}));

/** Text outside code that looks like HTML markup, i.e. markup shown literally. */
async function literalMarkup(page: Page) {
	return page.evaluate(() => {
		const TAG = /<\/?(sub|sup|b|i|em|strong|span|br|p|div|ul|ol|li|a|code)(\s[^>]*)?>/i;
		const hits: string[] = [];
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		for (let n = walker.nextNode(); n; n = walker.nextNode()) {
			if (n.parentElement?.closest('code, pre, script, style, textarea, noscript')) continue;
			if (TAG.test(n.textContent || '')) hits.push((n.textContent || '').trim().slice(0, 120));
		}
		return hits;
	});
}

/**
 * An HTML tag inside an SVG <text> makes the HTML parser break out of foreign
 * content and eject the rest of the drawing into the page. Post-parse the
 * offending element is no longer inside the <svg>, so the symptom to look for
 * is an svg element that has been re-parented out of its own drawing.
 */
async function svgBreakout(page: Page) {
	return page.evaluate(() =>
		[...document.querySelectorAll('svg text')]
			.filter((t) => [...t.children].some((c) => c.namespaceURI !== 'http://www.w3.org/2000/svg'))
			.map((t) => (t.textContent || '').trim().slice(0, 80)),
	);
}

for (const { root, heading, lessons } of TEXTBOOKS) {
	test(`${root}: dashboard links every lesson in lessons.json`, async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(e.message));
		await page.goto(`/${root}/`);
		await expect(page.locator('h1', { hasText: heading })).toBeVisible();

		// A lesson that exists on disk and in the manifest but is not reachable
		// from the dashboard is invisible to students (lesson 1-2c, Sept 2026).
		await page.locator('a[href*="lessons/"]').first().waitFor();
		const hrefs = await page.locator('a[href]').evaluateAll((els) =>
			els.map((el) => el.getAttribute('href') || ''),
		);
		const unreachable = lessons
			.map((l) => l.slug)
			.filter((slug) => !hrefs.some((h) => h.includes(`${slug}.html`)));
		expect(unreachable, 'lessons in lessons.json with no dashboard link').toEqual([]);
		expect(errors).toEqual([]);
	});

	test(`${root}: dashboard and about page do not overflow horizontally at 420px`, async ({ page }) => {
		await page.setViewportSize({ width: 420, height: 800 });
		for (const path of [`/${root}/`, `/${root}/about.html`]) {
			await page.goto(path);
			const sw = await page.evaluate(() => document.documentElement.scrollWidth);
			expect(sw, `${path} overflows horizontally at 420px`).toBeLessThanOrEqual(420);
		}
	});

	for (const lesson of lessons) {
		test(`${root} lesson ${lesson.id} renders cleanly`, async ({ page }) => {
			const errors: string[] = [];
			page.on('pageerror', (e) => errors.push(e.message));
			const res = await page.goto(`/${root}/lessons/${lesson.slug}.html`);
			expect(res?.status()).toBe(200);
			await page.waitForLoadState('load');

			// No script errors while the widget framework boots.
			expect(errors, 'uncaught page errors').toEqual([]);

			// Markup authored into a plain-text field shows up as literal tags.
			expect(await literalMarkup(page), 'literal HTML markup in rendered text').toEqual([]);

			// HTML tags inside SVG <text> eject the rest of the drawing.
			expect(await svgBreakout(page), 'HTML element inside an SVG <text>').toEqual([]);

			// Sort-classify bin labels are set with textContent: markup there never renders.
			const binLabels = await page.locator('.w-sort-bin').allTextContents();
			expect(binLabels.filter((t) => /[<>]/.test(t)), 'bin labels containing markup').toEqual([]);

			// A migrated book fits a 360px phone in both themes, and every widget rendered.
			if (MIGRATED.includes(root)) {
				await page.setViewportSize({ width: 360, height: 800 });
				for (const dark of [false, true]) {
					await page.evaluate((d) => document.documentElement.classList.toggle('dark', d), dark);
					const sw = await page.evaluate(() => document.documentElement.scrollWidth);
					expect(sw, `${lesson.id} overflows at 360px (${dark ? 'dark' : 'light'})`).toBeLessThanOrEqual(360);
				}
				expect(await page.locator('.topbar').count(), 'the shared script renders the top bar').toBe(1);

				// Every widget prints its answer, and Enrichment prints open.
				await page.emulateMedia({ media: 'print' });
				await expect(page.locator('body.tb-printing')).toHaveCount(1);
				const blank = await page.evaluate(() =>
					[...document.querySelectorAll('[data-widget]')]
						.filter((w) => !w.closest('.w-reveal-area'))
						.filter((w) => {
							const block = w.querySelector(':scope > .print-only');
							return !block || !block.textContent || block.textContent.trim().length < 5;
						})
						.map((w) => w.getAttribute('data-widget')),
				);
				expect(blank, `${lesson.id}: widgets that print nothing`).toEqual([]);
				await page.emulateMedia({ media: 'screen' });
			}

			// tokens.css zeroes padding on everything; lists inside interactive cards
			// must restore it or their markers hang outside the text column.
			const lists = await page.locator('.interactive ul, .interactive ol').evaluateAll((els) =>
				els
					.filter((el) => getComputedStyle(el).listStyleType !== 'none')
					.map((el) => parseFloat(getComputedStyle(el).paddingLeft))
			);
			expect(lists.filter((pad) => pad <= 0), 'lists with zero left padding').toEqual([]);
		});
	}
}

/**
 * The shared runtime's own test page, public/textbook/specimen.html
 * (docs/textbook/RUNTIME_SPEC.md, section 8). It holds every component, all
 * eight widget types and one sim. Each book's token set is opened in both
 * themes, so a shared-file bug shows up here before it reaches a lesson.
 */
interface TBWindow {
	TB: { widgets: { types(): string[]; get(type: string): { print?: unknown } } };
}
interface TBSimWindow {
	TB: { sim: { instances: { env: { time: number; colors: Record<string, string> }; hold(): void; release(): void }[] } };
}
const SPECIMEN_BOOKS = ['chem', 'physics', 'bio'];
const SPECIMEN_THEMES = ['light', 'dark'];
const ACCENT: Record<string, Record<string, string>> = {
	chem: { light: '#D6452A', dark: '#F26B4E' },
	physics: { light: '#2563EB', dark: '#3B82F6' },
	bio: { light: '#059669', dark: '#10B981' },
};

/** Resolves a colour token to the rgb() the browser computes for it. */
async function tokenRgb(page: Page, token: string) {
	return page.evaluate((name) => {
		const probe = document.createElement('span');
		probe.style.color = `var(${name})`;
		document.body.appendChild(probe);
		const rgb = getComputedStyle(probe).color;
		probe.remove();
		return rgb;
	}, token);
}

const hexToRgb = (hex: string) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

for (const book of SPECIMEN_BOOKS) {
	for (const theme of SPECIMEN_THEMES) {
		test(`specimen: ${book} tokens, ${theme} theme, renders cleanly`, async ({ page }) => {
			const errors: string[] = [];
			page.on('pageerror', (e) => errors.push(e.message));
			page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
			const res = await page.goto(`/textbook/specimen.html?book=${book}&theme=${theme}`);
			expect(res?.status()).toBe(200);
			await page.waitForLoadState('load');
			await page.locator('.topbar').waitFor();

			expect(errors, 'console or page errors').toEqual([]);
			expect(await literalMarkup(page), 'literal HTML markup in rendered text').toEqual([]);
			expect(await svgBreakout(page), 'HTML element inside an SVG <text>').toEqual([]);

			// The book's tokens took effect: its accent, and the page paper in the right theme.
			expect(await tokenRgb(page, '--accent')).toBe(hexToRgb(ACCENT[book][theme]));
			const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
			expect(bodyBg).toBe(await tokenRgb(page, '--paper'));
			expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(theme === 'dark');

			// Every widget type on the page is rendered by the shared script.
			const types = await page.evaluate(() => (window as unknown as TBWindow).TB.widgets.types());
			expect(types.sort()).toEqual([
				'commit-reveal', 'construct-validate', 'diagnose-error', 'faded-example',
				'predict-run', 'scaffold', 'sort-classify', 'step-builder',
			]);
			expect(await page.locator('[data-widget] .w-prompt, [data-widget] .w-workspace').count()).toBeGreaterThan(8);

			// Nothing sticks out sideways at a phone width or a laptop width.
			for (const width of [360, 1280]) {
				await page.setViewportSize({ width, height: 900 });
				const sw = await page.evaluate(() => document.documentElement.scrollWidth);
				expect(sw, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(width);
			}
		});
	}
}

test('specimen: the sim stays locked until the prediction is committed, then runs and records', async ({ page }) => {
	await page.goto('/textbook/specimen.html?book=bio&theme=light');
	const box = page.locator('[data-sim="cooling"]');
	await expect(box).toHaveAttribute('data-locked', 'true');
	// Before the prediction: the stage, every control and Record are inert, and no readout has a value.
	await expect(box.locator('.sim-stage')).toHaveAttribute('inert', '');
	await expect(box.locator('.sim-record-actions')).toHaveAttribute('inert', '');
	for (const value of await box.locator('.readout-value').allTextContents()) expect(value).toBe('–');
	// A wrong prediction still unlocks the sim.
	await box.locator('.w-opt').first().click();
	await box.locator('.w-btn-check').click();
	await expect(box).toHaveAttribute('data-locked', 'false');
	await expect(box.locator('.sim-record-actions')).not.toHaveAttribute('inert', '');

	// The loop runs and the readout follows it (at most twice a second).
	await expect(box.locator('[data-readout="time"] .readout-value')).not.toHaveText('–');
	await expect(box.locator('[data-readout="time"] .readout-value')).not.toHaveText('0 min', { timeout: 5000 });

	// Record adds one row; the Pause chip reads Play while paused; the stage is a labelled image.
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(box.locator('table.sim-record tbody tr:not(.empty)')).toHaveCount(1);
	await box.getByRole('button', { name: 'Pause' }).click();
	await expect(box.getByRole('button', { name: 'Play' })).toBeVisible();
	await expect(box.getByRole('button', { name: 'Step', exact: true })).toBeVisible();
	await box.getByRole('button', { name: 'Play' }).click();
	await expect(box.getByRole('button', { name: 'Pause' })).toBeVisible();

	// hold() stops the model on the spot (a data mark); release() runs it again.
	const time = () => page.evaluate(() => (window as unknown as TBSimWindow).TB.sim.instances[0].env.time);
	await page.evaluate(() => (window as unknown as TBSimWindow).TB.sim.instances[0].hold());
	await expect(box.getByRole('button', { name: 'Play' })).toBeVisible();
	const held = await time();
	await page.waitForTimeout(300);
	expect(await time(), 'the model does not move while held').toBe(held);
	await page.evaluate(() => (window as unknown as TBSimWindow).TB.sim.instances[0].release());
	await expect(box.getByRole('button', { name: 'Pause' })).toBeVisible();
	await expect.poll(time).toBeGreaterThan(held);
	await expect(box.locator('canvas')).toHaveAttribute('role', 'img');
	expect(await box.locator('canvas').getAttribute('aria-label')).toBeTruthy();
	// The canvas is sized from its stage, not by a fixed pixel size set in script.
	expect(await box.locator('canvas').evaluate((c) => c.hasAttribute('style'))).toBe(false);
});

test('specimen: a sim printed from dark mode is redrawn in light colours first', async ({ page }) => {
	await page.goto('/textbook/specimen.html?book=bio&theme=dark');
	await page.locator('.topbar').waitFor();
	const paper = () => page.evaluate(() => (window as unknown as TBSimWindow).TB.sim.instances[0].env.colors.paper);
	const darkPaper = await paper();
	await page.emulateMedia({ media: 'print' });
	await expect(page.locator('body.tb-printing')).toHaveCount(1);
	const printPaper = await paper();
	const lightPaper = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--paper').trim());
	expect(printPaper, 'the still frame uses the light paper colour').toBe(lightPaper);
	expect(printPaper).not.toBe(darkPaper);
	await page.emulateMedia({ media: 'screen' });
	await expect.poll(paper).toBe(darkPaper);
});

test('bio 1-3: the sim stops on the table at 30 min, and Start over runs it again', async ({ page }) => {
	test.setTimeout(60_000);
	await page.goto('/bio/lessons/1-3_osmoregulation-water-balance.html');
	const box = page.locator('[data-sim="osmo"]');
	await box.locator('.w-opt').first().click();
	await box.locator('.w-btn-check').click();
	await box.getByRole('button', { name: 'Sweat 1.4 L' }).click();
	await expect(box.locator('.status-pill')).toHaveText(/Stopped at 30 min/, { timeout: 20_000 });
	await expect(box.locator('[data-readout="blood"] .readout-value')).toHaveText('292 mOsm/kg');
	await expect(box.locator('[data-readout="adh"] .readout-value')).toHaveText('3.4 pg/mL');
	await expect(box.getByRole('button', { name: 'Play' })).toBeVisible();
	await box.getByRole('button', { name: 'Start over' }).click();
	await expect(box.getByRole('button', { name: 'Pause' })).toBeVisible();
});

/**
 * How much of a printed still frame is drawn: the share of pixels that are not
 * transparent and not the corner colour. With `token`, the share of pixels within
 * a small distance of that token's colour instead (the model's own marks).
 */
async function printedFrameInk(page: Page, token = '') {
	return page.evaluate(async (token) => {
		const want = token
			? getComputedStyle(document.documentElement).getPropertyValue(token).trim().replace('#', '').match(/../g)!.map((h) => parseInt(h, 16))
			: null;
		const img = document.querySelector<HTMLImageElement>('.sim-stage img.print-only');
		if (!img) return -1;
		if (!img.complete) await new Promise((r) => { img.onload = r; img.onerror = r; });
		const c = document.createElement('canvas');
		c.width = img.naturalWidth; c.height = img.naturalHeight;
		if (!c.width || !c.height) return -2;
		const ctx = c.getContext('2d')!;
		ctx.drawImage(img, 0, 0);
		const d = ctx.getImageData(0, 0, c.width, c.height).data;
		const bg = [d[0], d[1], d[2], d[3]];
		let ink = 0;
		for (let i = 0; i < d.length; i += 16) {
			if (want) {
				if (d[i + 3] > 200 && Math.abs(d[i] - want[0]) + Math.abs(d[i + 1] - want[1]) + Math.abs(d[i + 2] - want[2]) < 40) ink++;
			} else if (d[i + 3] > 0 && (Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]) > 30 || bg[3] === 0)) ink++;
		}
		return ink / (d.length / 16);
	}, token);
}

for (const [lesson, theme] of [
	['1-1_cellular-respiration', 'light'], ['1-1_cellular-respiration', 'dark'],
	['1-2_homeostasis-thermoregulation', 'light'], ['1-3_osmoregulation-water-balance', 'light'],
	['1-4_blood-glucose-regulation', 'light'],
] as const) {
	test(`bio ${lesson.slice(0, 3)}: the sim prints as a drawn still frame (${theme})`, async ({ page }) => {
		await page.addInitScript((dark) => { try { localStorage.setItem('sp_dark_mode', dark); } catch { /* none */ } }, theme === 'dark' ? 'true' : 'false');
		await page.goto(`/bio/lessons/${lesson}.html`);
		await expect(page.locator('.sim-box[data-locked]')).toHaveCount(1);
		await page.waitForTimeout(800);   // fonts load, then the helper draws its first frame
		await page.emulateMedia({ media: 'print' });
		await expect(page.locator('body.tb-printing')).toHaveCount(1);
		const ink = await printedFrameInk(page);
		expect(ink, 'share of the still frame that is drawn').toBeGreaterThan(0.02);
		// 1-1's opening frame must show atoms, not an empty cell (RENDERING_GOTCHAS, "A sim prints an empty scene")
		if (lesson.startsWith('1-1')) expect(await printedFrameInk(page, '--oxygen'), 'oxygen atoms in the still frame').toBeGreaterThan(0.001);
		await page.emulateMedia({ media: 'screen' });
	});
}

test.describe('on a touch screen', () => {
	test.use({ hasTouch: true });
	test('specimen: a tap on a glossary term opens its tooltip, and a second tap closes it', async ({ page }) => {
		await page.goto('/textbook/specimen.html?book=bio&theme=light');
		const term = page.locator('strong.term').first();
		const tip = page.locator('#tb-glossary-tooltip');
		await term.tap();
		await expect(tip).toHaveClass(/visible/);
		await term.tap();
		await expect(tip).not.toHaveClass(/visible/);
	});
});

test('specimen: nothing is revealed before an attempt', async ({ page }) => {
	await page.goto('/textbook/specimen.html?book=bio&theme=light');

	// Recall: Show answers waits for one check.
	const recall = page.locator('.recall');
	await expect(recall.locator('[data-recall-reveal]')).toBeDisabled();
	// A Check with every blank empty is not an attempt.
	await recall.locator('[data-recall-check]').click();
	await expect(recall.locator('[data-recall-reveal]')).toBeDisabled();
	await recall.locator('input.blank').first().fill('a guess');
	await recall.locator('[data-recall-check]').click();
	await expect(recall.locator('[data-recall-reveal]')).toBeEnabled();

	// Written response: the scoring guide waits for an answer.
	const frame = page.locator('.exam-frame');
	await expect(frame.locator('[data-scheme]')).toBeDisabled();
	await expect(frame.locator('.scheme')).toBeHidden();
	await frame.locator('textarea').fill('The sensor notices the rise and the sweat glands release sweat.');
	await expect(frame.locator('[data-scheme]')).toBeEnabled();
	await frame.locator('[data-scheme]').click();
	await expect(frame.locator('.scheme')).toBeVisible();
	// Clearing the answer never traps the guide open.
	await frame.locator('textarea').fill('');
	await expect(frame.locator('[data-scheme]')).toBeEnabled();
	await frame.locator('[data-scheme]').click();
	await expect(frame.locator('.scheme')).toBeHidden();

	// A checkpoint: the reveal is empty until a choice is checked, then the chosen option's feedback comes first.
	const check = page.locator('[data-widget="commit-reveal"]').first();
	await expect(check.locator('.w-btn-check')).toBeDisabled();
	await expect(check.locator('.w-reveal-area')).toBeHidden();
	await check.locator('.w-opt').nth(1).click();
	await check.locator('.w-btn-check').click();
	await expect(check.locator('.w-feedback.wrong')).toBeVisible();
	await expect(check.locator('.w-opt.wrong')).toHaveCount(1);
	await expect(check.locator('.w-opt.correct')).toHaveCount(1);
	await expect(check.locator('.w-reveal-area')).toBeVisible();
	const order = await check.evaluate((el) => {
		const fb = el.querySelector('.w-controls')!.getBoundingClientRect().top;
		const rv = el.querySelector('.w-reveal-area')!.getBoundingClientRect().top;
		return fb < rv;
	});
	expect(order, 'feedback sits above the general explanation').toBe(true);
});

test('specimen: the contents menu lists every section and tags Enrichment', async ({ page }) => {
	await page.goto('/textbook/specimen.html?book=bio&theme=light');
	await page.locator('.toc-btn').click();
	await expect(page.locator('.toc-drop')).toHaveClass(/open/);
	const entries = await page.locator('.toc-drop a').count();
	expect(entries).toBe(await page.locator('section[data-toc]').count());
	await expect(page.locator('.toc-drop a .tag-enrichment')).toHaveCount(1);
});

test('specimen: every widget type has a print function and prints its answer', async ({ page }) => {
	await page.goto('/textbook/specimen.html?book=bio&theme=light');
	const missing = await page.evaluate(() => {
		const { widgets } = (window as unknown as TBWindow).TB;
		return widgets.types().filter((t) => typeof widgets.get(t).print !== 'function');
	});
	expect(missing, 'widget types with no print function').toEqual([]);

	await page.emulateMedia({ media: 'print' });
	// The hook runs on the print media change, so every widget gains a printed block.
	await expect(page.locator('body.tb-printing')).toHaveCount(1);
	const blank = await page.evaluate(() =>
		[...document.querySelectorAll('[data-widget]')]
			.filter((w) => !w.closest('.w-reveal-area'))
			.filter((w) => {
				const block = w.querySelector(':scope > .print-only');
				return !block || !block.textContent || block.textContent.trim().length < 10;
			})
			.map((w) => w.getAttribute('data-widget')),
	);
	expect(blank, 'widgets that print nothing').toEqual([]);

	// Enrichment prints open, and the live canvas gives way to a still frame.
	const closed = await page.locator('details.enrichment:not([open])').count();
	expect(closed, 'Enrichment blocks closed in print').toBe(0);
	await expect(page.locator('.sim-stage img.print-only')).toHaveCount(1);

	await page.emulateMedia({ media: 'screen' });
	await expect(page.locator('body.tb-printing')).toHaveCount(0);
});

test('snapshot: textbook dashboard header', async ({ page }) => {
	await page.goto('/chem/');
	await expect(page.locator('h1', { hasText: 'SAS General Chemistry' })).toMatchAriaSnapshot({
		name: 'chem-dashboard-heading.aria.yml',
	});
});
