import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Chem Unit 5 (lessons 5-1a, 5-2a, 5-3a, 5-4a, 5-8a): every simulation and tool.
 *
 * Public pages only, nothing signed in, nothing stored. Each test opens a lesson, answers the
 * sim's prediction (a wrong answer unlocks it too), checks that the readouts come alive and the
 * drawing paints, and uses the control that matters. The numbers are the model's own (see
 * chemUnit5Models.test.ts). Run with UNIT5_SHOTS=<folder> to save a screenshot of each box (and
 * each figure on the page) in both themes and at phone width, for a look by eye.
 */

const SHOTS = process.env.UNIT5_SHOTS;

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
			await box.locator('.sim-stage').screenshot({ path: `${SHOTS}/${name}-stage-${label}-${dark ? 'dark' : 'light'}.png` });
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
	'5-1a': '/chem/lessons/5-1a_stellar-fusion-solar-energy.html',
	'5-2a': '/chem/lessons/5-2a_big-bang-cosmic-evidence.html',
	'5-3a': '/chem/lessons/5-3a_stellar-nucleosynthesis-element-origins.html',
	'5-4a': '/chem/lessons/5-4a_electromagnetic-radiation-matter.html',
	'5-8a': '/chem/lessons/5-8a_nuclear-reactions-radioactive-decay.html',
};

const readout = (box: Locator, id: string) => box.locator(`[data-readout="${id}"] .readout-value`);
const rows = (box: Locator) => box.locator('table.sim-record tbody tr:not(.empty)');

test('5-1a the Sun: locked until the prediction, then a cooled core shrinks the star and it settles back', async ({ page }) => {
	test.setTimeout(90_000);
	const errors = watch(page);
	await page.goto(LESSON['5-1a']);
	const box = page.locator('[data-sim="sun"]');
	await unlock(box);
	await expect(readout(box, 'size')).toHaveText('1.00', { timeout: 3000 });
	await expect(box.locator('.status-pill')).toHaveText('Balanced');
	await expect(box.getByRole('button', { name: 'Start run' })).toBeDisabled();
	expect(await painted(box)).toBeGreaterThan(0.01);
	await load(box, 'Load 12 MK');
	await expect(readout(box, 'size')).toHaveText('1.00');
	await expect(readout(box, 'grav')).toHaveText('1.00');
	await expect(readout(box, 'pres')).toHaveText('0.80');
	await box.getByRole('button', { name: 'Start run' }).click();
	await expect(box.locator('.status-pill')).toHaveText('Shrinking, core heating');
	await expect(box.locator('.status-pill')).toHaveText('Settled: back to the same size', { timeout: 25_000 });
	await expect(readout(box, 'size')).toHaveText('1.00');
	await expect(readout(box, 'temp')).toHaveText('15.0 MK');
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load 2.0 Suns');
	await expect(readout(box, 'bright')).toHaveText('16 Suns');
	await expect(readout(box, 'life')).toHaveText('1.25');
	await expect(box.locator('#sunTemp')).toBeDisabled();
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(rows(box)).toHaveCount(2);
	await shoot(page, box, '5-1a-sun');
	expect(errors).toEqual([]);
});

test('5-4a radiation and matter: more photons never break a bond that one photon cannot', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['5-4a']);
	const box = page.locator('[data-sim="radiation"]');
	await unlock(box);
	await expect(readout(box, 'band')).toHaveText('Visible light', { timeout: 3000 });
	await expect(readout(box, 'broken')).toHaveText('0');
	await expect(box.locator('.status-pill')).toHaveText('Bonds stay whole');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await load(box, 'Load radio at brightness 5');
	await expect(readout(box, 'photons')).toHaveText('16');
	await expect(readout(box, 'broken')).toHaveText('0');
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load X-rays at brightness 1');
	await expect(readout(box, 'photons')).toHaveText('1');
	await expect(readout(box, 'broken')).toHaveText('1');
	await expect(box.locator('.status-pill')).toHaveText('Bonds can break');
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load ultraviolet');
	await expect(readout(box, 'broken')).toHaveText('4');
	// the Enrichment chip swaps the rank for the energy in eV
	await expect(readout(box, 'energy')).toHaveText('5 of 7');
	await box.getByRole('button', { name: /Show energies in eV/ }).click();
	await expect(readout(box, 'energy')).toHaveText('4.13 eV');
	await expect(box.getByRole('button', { name: /Show energies in eV/ })).toHaveAttribute('aria-pressed', 'true');
	await box.getByRole('button', { name: 'Water' }).click();
	await expect(box.getByRole('button', { name: 'Water' })).toHaveAttribute('aria-pressed', 'true');
	await expect(box.getByRole('button', { name: 'DNA' })).toHaveAttribute('aria-pressed', 'false');
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(rows(box)).toHaveCount(3);
	await shoot(page, box, '5-4a-radiation');
	expect(errors).toEqual([]);
});

test('5-8a decay lab: the run stops at each half-life and Play goes on', async ({ page }) => {
	test.setTimeout(90_000);
	const errors = watch(page);
	await page.goto(LESSON['5-8a']);
	const box = page.locator('[data-sim="decay"]');
	await unlock(box);
	await expect(readout(box, 'left')).toHaveText('100 of 100', { timeout: 3000 });
	await expect(box.locator('.status-pill')).toHaveText('Ready to start the run');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await box.getByRole('button', { name: 'Start run' }).click();
	await expect(box.locator('.status-pill')).toHaveText(/Stopped at 1 half-life/, { timeout: 15_000 });
	await expect(readout(box, 'left')).toHaveText('49 of 100');
	await expect(readout(box, 'time')).toHaveText('5,730 years');
	await expect(readout(box, 'passed')).toHaveText('1.00');
	await box.getByRole('button', { name: 'Record' }).click();
	await box.getByRole('button', { name: 'Play' }).click();
	await expect(box.locator('.status-pill')).toHaveText(/Stopped at 2 half-lives/, { timeout: 15_000 });
	await expect(readout(box, 'left')).toHaveText('25 of 100');
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load iodine-131');
	await expect(readout(box, 'half')).toHaveText('8 days');
	await expect(readout(box, 'left')).toHaveText('100 of 100');
	await box.getByRole('button', { name: 'Start run' }).click();
	await expect(box.locator('.status-pill')).toHaveText(/Stopped at 1 half-life/, { timeout: 15_000 });
	await box.getByRole('button', { name: 'Play' }).click();
	await expect(box.locator('.status-pill')).toHaveText(/Stopped at 2 half-lives/, { timeout: 15_000 });
	await expect(readout(box, 'left')).toHaveText('25 of 100');
	await expect(readout(box, 'time')).toHaveText('16 days');
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(rows(box)).toHaveCount(3);
	await shoot(page, box, '5-8a-decay');
	expect(errors).toEqual([]);
});

test('5-8a fission lab: one neutron, one split, and the totals match', async ({ page }) => {
	test.setTimeout(60_000);
	const errors = watch(page);
	await page.goto(LESSON['5-8a']);
	const box = page.locator('[data-sim="fission"]');
	await unlock(box);
	await expect(readout(box, 'in')).toHaveText('235 + 1 = 236', { timeout: 3000 });
	await expect(readout(box, 'out')).toHaveText('–');
	await expect(box.locator('.status-pill')).toHaveText('Ready to fire');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await box.getByRole('button', { name: 'Fire a neutron' }).click();
	await expect(box.locator('.status-pill')).toHaveText('Split: the totals match', { timeout: 15_000 });
	await expect(readout(box, 'out')).toHaveText('141 + 92 + 3 = 236');
	await expect(readout(box, 'prot')).toHaveText('92 = 56 + 36');
	await expect(readout(box, 'energy')).toHaveText('about 200 million eV');
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(rows(box)).toHaveCount(1);
	await shoot(page, box, '5-8a-fission');
	expect(errors).toEqual([]);
});

test('5-8a chain reaction (Enrichment): k above 1 grows, k below 1 dies out', async ({ page }) => {
	test.setTimeout(60_000);
	const errors = watch(page);
	await page.goto(LESSON['5-8a']);
	const box = page.locator('[data-sim="chain"]');
	await openEnrichment(page, box);
	await unlock(box);
	await expect(readout(box, 'k')).toHaveText('1.00', { timeout: 3000 });
	await expect(readout(box, 'fissions')).toHaveText('–');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await load(box, 'Load 30% rods');
	await expect(readout(box, 'k')).toHaveText('1.20');
	await box.getByRole('button', { name: 'Start run' }).click();
	await expect(box.locator('.status-pill')).toHaveText(/Stopped at generation 5/, { timeout: 15_000 });
	await expect(readout(box, 'fissions')).toHaveText('124');
	await box.getByRole('button', { name: 'Record' }).click();
	await box.getByRole('button', { name: 'SCRAM' }).click();
	await expect(readout(box, 'k')).toHaveText('0.50');
	await load(box, 'Load 100% rods');
	await box.getByRole('button', { name: 'Start run' }).click();
	await expect(box.locator('.status-pill')).toHaveText(/Stopped at generation 5/, { timeout: 15_000 });
	await expect(readout(box, 'fissions')).toHaveText('2');
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(rows(box)).toHaveCount(2);
	await shoot(page, box, '5-8a-chain');
	expect(errors).toEqual([]);
});

test('5-2a redshift analyzer: a farther galaxy shifts the hydrogen lines farther toward red', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['5-2a']);
	const box = page.locator('[data-sim="redshift"]');
	await unlock(box);
	await expect(readout(box, 'ha')).toHaveText('656 nm', { timeout: 3000 });
	await expect(readout(box, 'shift')).toHaveText('0 nm');
	await expect(box.locator('.status-pill')).toHaveText('No shift: the same as the laboratory');
	await load(box, 'Load 1 billion light-years');
	await expect(readout(box, 'ha')).toHaveText('702 nm');
	await expect(readout(box, 'shift')).toHaveText('+46 nm');
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load 3 billion light-years');
	await expect(readout(box, 'ha')).toHaveText('794 nm');
	await expect(readout(box, 'where')).toHaveText('Infrared');
	await load(box, 'Load 5 billion light-years');
	await expect(readout(box, 'ha')).toHaveText('886 nm');
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(rows(box)).toHaveCount(2);
	expect(await box.locator('svg line').count()).toBeGreaterThan(8);
	await shoot(page, box, '5-2a-redshift');
	expect(errors).toEqual([]);
});

test('5-3a shell explorer and collapse stepper (Enrichment): the inner shells burn hotter and faster', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['5-3a']);
	const shells = page.locator('[data-sim="shells"]');
	await openEnrichment(page, shells);
	await unlock(shells);
	await expect(readout(shells, 'time')).toHaveText('7 million years', { timeout: 3000 });
	await load(shells, 'Load hydrogen');
	await shells.getByRole('button', { name: 'Record' }).click();
	await load(shells, 'Load silicon');
	await expect(readout(shells, 'temp')).toHaveText('3.5 GK');
	await expect(readout(shells, 'time')).toHaveText('about 1 day');
	await expect(shells.getByRole('button', { name: 'Silicon', exact: true })).toHaveAttribute('aria-pressed', 'true');
	await shells.getByRole('button', { name: 'Record' }).click();
	await load(shells, 'Load the iron core');
	await expect(shells.locator('.status-pill')).toHaveText('Fusion has stopped');
	await expect(readout(shells, 'energy')).toHaveText('Takes in energy');
	await expect(rows(shells)).toHaveCount(2);
	await shoot(page, shells, '5-3a-shells');
	const col = page.locator('[data-sim="collapse"]');
	await col.scrollIntoViewIfNeeded();
	await unlock(col);
	await load(col, 'Load stage 2');
	await expect(readout(col, 'speed')).toHaveText('70,000 km/s');
	await expect(col.locator('.status-pill')).toHaveText('Falling inward');
	await col.getByRole('button', { name: 'Record' }).click();
	await col.getByRole('button', { name: '4. Blast' }).click();
	await expect(readout(col, 'time')).toHaveText('days to months later');
	await shoot(page, col, '5-3a-collapse');
	expect(errors).toEqual([]);
});

// A look at every figure on the five pages (only when UNIT5_SHOTS is set): static SVG labels
// render at the caption size, and one that is too long for its figure clips at the right edge.
test('every figure on the five pages, for a look by eye', async ({ page }) => {
	test.skip(!SHOTS, 'only with UNIT5_SHOTS');
	test.setTimeout(180_000);
	for (const [id, url] of Object.entries(LESSON)) {
		await page.setViewportSize({ width: 400, height: 1000 });
		await page.goto(url);
		await page.getByRole('button', { name: /Show Synopsis/ }).click();
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

// Under reduced motion a looping sim starts paused and its Step chip must reach each data mark in a few presses.
test.describe('reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });
	const step = (box: Locator) => box.getByRole('button', { name: 'Step', exact: true });

	test('5-1a the Sun: Start run then three Step presses settle the star', async ({ page }) => {
		await page.goto(LESSON['5-1a']);
		const box = page.locator('[data-sim="sun"]');
		await unlock(box);
		await expect(box.getByRole('button', { name: 'Play' })).toBeVisible();
		await load(box, 'Load 12 MK');
		await box.getByRole('button', { name: 'Start run' }).click();
		await expect(box.getByRole('button', { name: 'Play' })).toBeVisible();
		for (let i = 0; i < 3; i++) await step(box).click();
		await expect(box.locator('.status-pill')).toHaveText('Settled: back to the same size');
		await expect(readout(box, 'size')).toHaveText('1.00');
		await box.getByRole('button', { name: 'Record' }).click();
		await expect(rows(box)).toHaveCount(1);
	});

	test('5-8a decay lab: one Step press reaches each half-life stop', async ({ page }) => {
		await page.goto(LESSON['5-8a']);
		const box = page.locator('[data-sim="decay"]');
		await unlock(box);
		await box.getByRole('button', { name: 'Start run' }).click();
		await step(box).click();
		await expect(readout(box, 'left')).toHaveText('49 of 100');
		await step(box).click();
		await expect(readout(box, 'left')).toHaveText('25 of 100');
		await step(box).click();
		await expect(readout(box, 'left')).toHaveText('12 of 100');
		await step(box).click();
		await expect(readout(box, 'left')).toHaveText('6 of 100');
		await expect(box.locator('.status-pill')).toHaveText('Stopped at 4 half-lives: the run is over');
		await box.getByRole('button', { name: 'Record' }).click();
		await expect(rows(box)).toHaveCount(1);
	});

	test('5-8a fission lab: Fire a neutron then two Step presses finish the split', async ({ page }) => {
		await page.goto(LESSON['5-8a']);
		const box = page.locator('[data-sim="fission"]');
		await unlock(box);
		await box.getByRole('button', { name: 'Fire a neutron' }).click();
		for (let i = 0; i < 2; i++) await step(box).click();
		await expect(readout(box, 'out')).toHaveText('141 + 92 + 3 = 236');
	});

	test('5-8a chain reaction: two Step presses reach generation 5', async ({ page }) => {
		await page.goto(LESSON['5-8a']);
		const box = page.locator('[data-sim="chain"]');
		await openEnrichment(page, box);
		await unlock(box);
		await load(box, 'Load 30% rods');
		await box.getByRole('button', { name: 'Start run' }).click();
		for (let i = 0; i < 2; i++) await step(box).click();
		await expect(readout(box, 'fissions')).toHaveText('124');
	});

	test('5-4a radiation: the sim starts paused, and a control still redraws it', async ({ page }) => {
		await page.goto(LESSON['5-4a']);
		const box = page.locator('[data-sim="radiation"]');
		await unlock(box);
		await expect(box.getByRole('button', { name: 'Play' })).toBeVisible();
		await load(box, 'Load X-rays at brightness 1');
		await expect(readout(box, 'broken')).toHaveText('1');
		expect(await painted(box)).toBeGreaterThan(0.01);
	});
});
