import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Chem Unit 4 (lessons 4-1a, 4-1b, 4-6a, 4-6b): every simulation.
 *
 * Public pages only, nothing signed in, nothing stored. Each test opens a lesson, answers the
 * sim's prediction (a wrong answer unlocks it too), checks that the readouts come alive and the
 * drawing paints, and uses the control that matters. The numbers are the model's own (see
 * chemUnit4Models.test.ts). Run with UNIT4_SHOTS=<folder> to save a screenshot of each box (and
 * each figure on the page) in both themes and at phone width, for a look by eye.
 */

const SHOTS = process.env.UNIT4_SHOTS;

async function shoot(page: Page, box: Locator, name: string) {
	if (!SHOTS) return;
	for (const [w, label] of [[1280, 'wide'], [400, 'phone']] as const) {
		await page.setViewportSize({ width: w, height: 1000 });
		for (const dark of [false, true]) {
			await page.evaluate((d) => {
				document.documentElement.classList.toggle('dark', d);
				// the theme button runs the theme listeners; a class toggle does not, so redraw the sims here
				(window as unknown as { TB?: { sim?: { refreshColors(): void } } }).TB?.sim?.refreshColors();
			}, dark);
			await page.waitForTimeout(250);
			await box.scrollIntoViewIfNeeded();
			await box.screenshot({ path: `${SHOTS}/${name}-${label}-${dark ? 'dark' : 'light'}.png` });
		}
	}
	await page.evaluate(() => document.documentElement.classList.remove('dark'));
	await page.setViewportSize({ width: 1440, height: 1000 });
}

/** The share of canvas pixels that are not transparent: a drawn stage is well above zero. */
async function painted(box: Locator): Promise<number> {
	return box.locator('canvas').evaluate((c: HTMLCanvasElement) => {
		const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
		let n = 0;
		for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
		return n / (d.length / 4);
	});
}

/** A locked sim shows a dash in every readout until its prediction is committed. */
async function unlock(box: Locator) {
	await expect(box).toHaveAttribute('data-locked', 'true');
	for (const v of await box.locator('.readout-value').allTextContents()) expect(v, 'a readout shows a dash before the prediction').toBe('–');
	await box.locator('[data-sim-gate] .w-opt').first().click();
	await box.locator('[data-sim-gate] .w-btn-check').click();
	await expect(box).toHaveAttribute('data-locked', 'false');
}

/** Try this shows one step at a time, so a step's "Load" chip needs its step on screen first. */
async function load(box: Locator, name: string | RegExp) {
	const chip = box.getByRole('button', { name }).first();
	const next = box.getByRole('button', { name: 'Next step' }), prev = box.getByRole('button', { name: 'Previous step' });
	for (let i = 0; i < 8 && !(await chip.isVisible()); i++) await ((await next.isEnabled()) && i < 4 ? next : prev).click();
	await chip.click();
}

/** The Enrichment blocks are closed until opened. */
async function openEnrichment(page: Page, box: Locator) {
	await page.locator('details.enrichment').filter({ has: box }).locator('summary').first().click();
	await box.scrollIntoViewIfNeeded();
}

function watch(page: Page) {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
	return errors;
}

const LESSON = {
	'4-1a': '/chem/lessons/4-1a_reaction-rates-collision-theory.html',
	'4-1b': '/chem/lessons/4-1b_catalysis-and-enzymes.html',
	'4-6a': '/chem/lessons/4-6a_dynamic-equilibrium-le-chatelier.html',
	'4-6b': '/chem/lessons/4-6b_human-equilibrium-blood-buffers.html',
};

const readout = (box: Locator, id: string) => box.locator(`[data-readout="${id}"] .readout-value`);
const rows = (box: Locator) => box.locator('table.sim-record tbody tr:not(.empty)');

test('4-1a collision sandbox: locked until the prediction, then a run stops on the 10 second mark', async ({ page }) => {
	test.setTimeout(90_000);
	const errors = watch(page);
	await page.goto(LESSON['4-1a']);
	const box = page.locator('[data-sim="collisions"]');
	await unlock(box);
	await expect(readout(box, 'react')).toHaveText('0 so far', { timeout: 3000 });
	await expect(readout(box, 'share')).toHaveText('–');
	await expect(box.locator('.status-pill')).toHaveText('Ready to start the run');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await box.getByRole('button', { name: 'Start run' }).click();
	await expect(box.locator('.status-pill')).toHaveText('Run in progress');
	await expect(box.locator('.status-pill')).toHaveText('Stopped at 10.0 s', { timeout: 20_000 });
	await expect(readout(box, 'time')).toHaveText('10.0 s');
	await expect(readout(box, 'coll')).toHaveText('478');
	await expect(readout(box, 'react')).toHaveText('23');
	await expect(readout(box, 'share')).toHaveText('5 %');
	await expect(box.getByRole('button', { name: 'Play' })).toBeVisible();
	await box.getByRole('button', { name: 'Record' }).click();
	// a change puts it back to ready, so the default screen never answers the checkpoint
	await load(box, 'Load 80 °C');
	await expect(readout(box, 'react')).toHaveText('0 so far');
	await expect(readout(box, 'share')).toHaveText('–');
	await box.getByRole('button', { name: 'Start run' }).click();
	await expect(box.locator('.status-pill')).toHaveText('Stopped at 10.0 s', { timeout: 20_000 });
	await expect(readout(box, 'react')).toHaveText('102');
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(rows(box)).toHaveCount(2);
	await shoot(page, box, '4-1a-sandbox');
	expect(errors).toEqual([]);
});

test('4-1b enzyme simulator (Enrichment): the sites fill and the rate levels off', async ({ page }) => {
	test.setTimeout(90_000);
	const errors = watch(page);
	await page.goto(LESSON['4-1b']);
	const box = page.locator('[data-sim="enzyme"]');
	await openEnrichment(page, box);
	await unlock(box);
	await expect(readout(box, 'shape')).toHaveText('Native fold', { timeout: 3000 });
	await expect(readout(box, 'sites')).toHaveText('–');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await load(box, 'Load 10 particles');
	await box.getByRole('button', { name: 'Start run' }).click();
	await expect(box.locator('.status-pill')).toHaveText('Stopped at 10.0 s', { timeout: 20_000 });
	await expect(readout(box, 'react')).toHaveText('17');
	await expect(readout(box, 'sites')).toHaveText('47 %');
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load 70 °C');
	await expect(readout(box, 'shape')).toHaveText('Denatured');
	await expect(box.locator('.status-pill')).toHaveText('Active sites collapsed');
	await shoot(page, box, '4-1b-enzyme');
	expect(errors).toEqual([]);
});

test('4-6a equilibrium chamber: one change at a time, and the controls unlock when it settles', async ({ page }) => {
	test.setTimeout(60_000);
	const errors = watch(page);
	await page.goto(LESSON['4-6a']);
	const box = page.locator('[data-sim="equilibrium"]');
	await unlock(box);
	await expect(readout(box, 'nh3')).toHaveText('10', { timeout: 3000 });
	await expect(readout(box, 'fwd')).toHaveText('1.2 a second');
	await expect(readout(box, 'rev')).toHaveText('1.2 a second');
	await expect(box.locator('.status-pill')).toHaveText('At equilibrium');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await box.getByRole('button', { name: 'Add N₂ and H₂' }).click();
	await expect(box.locator('.status-pill')).toHaveText('Shifting right');
	// the other controls are locked while it shifts
	for (const name of ['Remove NH₃', 'Heat by 50 °C', 'Cool by 50 °C', 'Compress', 'Expand']) await expect(box.getByRole('button', { name })).toBeDisabled();
	await expect(box.locator('.status-pill')).toHaveText('Settled: rates are equal', { timeout: 15_000 });
	await expect(readout(box, 'nh3')).toHaveText('16');
	await expect(box.getByRole('button', { name: 'Heat by 50 °C' })).toBeEnabled();
	await box.getByRole('button', { name: 'Record' }).click();
	await box.getByRole('button', { name: 'Start over' }).click();
	await expect(readout(box, 'nh3')).toHaveText('10');
	await box.getByRole('button', { name: 'Heat by 50 °C' }).click();
	await expect(box.locator('.status-pill')).toHaveText('Shifting left');
	await expect(box.locator('.status-pill')).toHaveText('Settled: rates are equal', { timeout: 15_000 });
	await expect(readout(box, 'nh3')).toHaveText('8');
	await expect(readout(box, 'temp')).toHaveText('500 °C');
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(rows(box)).toHaveCount(2);
	await shoot(page, box, '4-6a-chamber');
	expect(errors).toEqual([]);
});

test('4-6b blood-buffer simulator (Enrichment): the same dose moves blood a little and water a lot', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['4-6b']);
	const box = page.locator('[data-sim="blood"]');
	await openEnrichment(page, box);
	await unlock(box);
	await expect(readout(box, 'ph')).toHaveText('7.40', { timeout: 3000 });
	await expect(box.getByRole('button', { name: 'Buffered blood' })).toHaveAttribute('aria-pressed', 'true');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await box.getByRole('button', { name: 'Add 5 mM acid' }).click();
	await expect(readout(box, 'ph')).toHaveText(/^7\.3\d$/);
	await box.getByRole('button', { name: 'Record' }).click();
	await box.getByRole('button', { name: 'Pure water' }).click();
	await expect(box.getByRole('button', { name: 'Pure water' })).toHaveAttribute('aria-pressed', 'true');
	await expect(box.getByRole('button', { name: 'Buffered blood' })).toHaveAttribute('aria-pressed', 'false');
	await expect(readout(box, 'ph')).toHaveText('7.00');
	await expect(box.locator('#respSlider')).toBeDisabled();
	await box.getByRole('button', { name: 'Add 5 mM acid' }).click();
	await expect(readout(box, 'ph')).toHaveText('2.30');
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(rows(box)).toHaveCount(2);
	await expect(box.locator('table.sim-record tbody tr').nth(0)).toContainText('7.40');
	await expect(box.locator('table.sim-record tbody tr').nth(0)).toContainText('7.30');
	await expect(box.locator('table.sim-record tbody tr').nth(1)).toContainText('2.30');
	await load(box, 'Load 36 a minute');
	await expect(readout(box, 'window')).toHaveText('Alkalosis', { timeout: 8000 });
	await expect(readout(box, 'ph')).toHaveText(/^7\.[67]\d$/);
	await shoot(page, box, '4-6b-blood');
	expect(errors).toEqual([]);
});

// A look at every figure on the four pages (only when UNIT4_SHOTS is set): static SVG labels
// render at the caption size, and one that is too long for its figure clips at the right edge.
test('every figure on the four pages, for a look by eye', async ({ page }) => {
	test.skip(!SHOTS, 'only with UNIT4_SHOTS');
	test.setTimeout(180_000);
	for (const [id, url] of Object.entries(LESSON)) {
		await page.setViewportSize({ width: 400, height: 1000 });
		await page.goto(url);
		await page.getByRole('button', { name: /Show Synopsis/ }).click();
		// open every Enrichment block so its figure can be seen
		const blocks = page.locator('details.enrichment > summary');
		for (let i = 0; i < (await blocks.count()); i++) await blocks.nth(i).click();
		const figs = page.locator('figure, .figure[data-motion]');
		const n = await figs.count();
		for (let i = 0; i < n; i++) {
			const f = figs.nth(i);
			await f.scrollIntoViewIfNeeded();
			await f.screenshot({ path: `${SHOTS}/fig-${id}-${i}-phone-light.png` });
		}
	}
});

// Under reduced motion a looping sim starts paused and its Step chip must reach the end of a run in a few presses.
test.describe('reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });
	const step = (box: Locator) => box.getByRole('button', { name: 'Step', exact: true });

	test('4-1a collision sandbox: Start run then three Step presses finish the run', async ({ page }) => {
		await page.goto(LESSON['4-1a']);
		const box = page.locator('[data-sim="collisions"]');
		await unlock(box);
		await expect(box.getByRole('button', { name: 'Play' })).toBeVisible();
		await box.getByRole('button', { name: 'Start run' }).click();
		await expect(box.getByRole('button', { name: 'Play' })).toBeVisible();
		for (let i = 0; i < 3; i++) await step(box).click();
		await expect(readout(box, 'react')).toHaveText('23');
		await expect(box.locator('.status-pill')).toHaveText('Stopped at 10.0 s');
		await load(box, 'Load 80 °C');
		await box.getByRole('button', { name: 'Start run' }).click();
		for (let i = 0; i < 3; i++) await step(box).click();
		await expect(readout(box, 'react')).toHaveText('102');
	});

	test('4-1a collision sandbox: a lump and a doubled amount of A', async ({ page }) => {
		await page.goto(LESSON['4-1a']);
		const box = page.locator('[data-sim="collisions"]');
		await unlock(box);
		await load(box, 'Load 50 particles of A');
		await box.getByRole('button', { name: 'Start run' }).click();
		for (let i = 0; i < 3; i++) await step(box).click();
		await expect(readout(box, 'react')).toHaveText('44');
		await expect(readout(box, 'coll')).toHaveText('971');
		await load(box, 'Load a lump of A');
		await box.getByRole('button', { name: 'Start run' }).click();
		for (let i = 0; i < 3; i++) await step(box).click();
		await expect(readout(box, 'react')).toHaveText('2');
		await box.getByRole('button', { name: 'Record' }).click();
		await expect(rows(box)).toHaveCount(1);
	});

	test('4-1b enzyme simulator: Start run then three Step presses finish the run', async ({ page }) => {
		await page.goto(LESSON['4-1b']);
		const box = page.locator('[data-sim="enzyme"]');
		await openEnrichment(page, box);
		await unlock(box);
		await load(box, 'Load 40 particles');
		await box.getByRole('button', { name: 'Start run' }).click();
		for (let i = 0; i < 3; i++) await step(box).click();
		await expect(readout(box, 'react')).toHaveText('30');
		await expect(readout(box, 'sites')).toHaveText('88 %');
		await load(box, 'Load 80 particles');
		await box.getByRole('button', { name: 'Start run' }).click();
		for (let i = 0; i < 3; i++) await step(box).click();
		await expect(readout(box, 'react')).toHaveText('33');
		await load(box, 'Load pH 2.4');
		await box.getByRole('button', { name: 'Start run' }).click();
		for (let i = 0; i < 3; i++) await step(box).click();
		await expect(readout(box, 'react')).toHaveText('0');
	});

	test('4-6a equilibrium chamber: a change settles in four Step presses and the clock stops there', async ({ page }) => {
		await page.goto(LESSON['4-6a']);
		const box = page.locator('[data-sim="equilibrium"]');
		await unlock(box);
		await box.getByRole('button', { name: 'Expand' }).click();
		await expect(box.locator('.status-pill')).toHaveText('Shifting left');
		for (let i = 0; i < 4; i++) await step(box).click();
		await expect(box.locator('.status-pill')).toHaveText('Settled: rates are equal');
		await expect(readout(box, 'nh3')).toHaveText('7');
		await expect(readout(box, 'press')).toHaveText('100 atm');
		await expect(box.getByRole('button', { name: 'Compress' })).toBeEnabled();
		await box.getByRole('button', { name: 'Record' }).click();
		await expect(rows(box)).toHaveCount(1);
	});

	test('4-6b blood-buffer simulator: two Step presses carry the breathing change', async ({ page }) => {
		await page.goto(LESSON['4-6b']);
		const box = page.locator('[data-sim="blood"]');
		await openEnrichment(page, box);
		await unlock(box);
		await load(box, 'Load 36 a minute');
		for (let i = 0; i < 2; i++) await step(box).click();
		await expect(readout(box, 'ph')).toHaveText(/^7\.[67]\d$/);
		await expect(readout(box, 'window')).toHaveText('Alkalosis');
	});
});
