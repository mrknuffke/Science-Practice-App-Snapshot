import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Chem Unit 3 (lessons 3-1a, 3-1b, 3-1c, 3-4a, 1-4a): every simulation and tool.
 *
 * Public pages only, nothing signed in, nothing stored. Each test opens a lesson, answers the
 * sim's prediction where it has one (a wrong answer unlocks it too), checks that the readouts
 * come alive and the drawing paints, and uses the control that matters. Run with
 * UNIT3_SHOTS=<folder> to save a screenshot of each box (and each figure on the page) in both
 * themes and at phone width, for a look by eye.
 */

const SHOTS = process.env.UNIT3_SHOTS;

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

function watch(page: Page) {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
	return errors;
}

const LESSON = {
	'3-1a': '/chem/lessons/3-1a_temperature-heat-specific-heat.html',
	'3-1b': '/chem/lessons/3-1b_phase-changes-heating-curves.html',
	'3-1c': '/chem/lessons/3-1c_calorimetry-energy-systems.html',
	'3-4a': '/chem/lessons/3-4a_thermal-equilibrium-heat-transfer.html',
	'1-4a': '/chem/lessons/3-14a_bond-energy-reaction-profiles.html',
};

test('3-1a two vessels: locked until the prediction, then a cooler vessel can hold more energy', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['3-1a']);
	const box = page.locator('[data-sim="vessels"]');
	await unlock(box);
	await expect(box.locator('[data-readout="eA"] .readout-value')).toHaveText('16.7 kJ', { timeout: 3000 });
	await expect(box.locator('[data-readout="eB"] .readout-value')).toHaveText('31.4 kJ');
	await expect(box.locator('[data-readout="more"] .readout-value')).toHaveText('Vessel B');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load 40 °C in both');
	await expect(box.locator('[data-readout="eB"] .readout-value')).toHaveText('33.4 kJ', { timeout: 3000 });
	await expect(box.locator('[data-readout="eA"] .readout-value')).toHaveText('8.4 kJ');
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load hot small, cool large');
	await expect(box.locator('[data-readout="eA"] .readout-value')).toHaveText('8.4 kJ');
	await expect(box.locator('[data-readout="eB"] .readout-value')).toHaveText('25.1 kJ');
	await expect(box.locator('table.sim-record tbody tr:not(.empty)')).toHaveCount(2);
	await box.locator('#vesTempB').fill('100');
	await box.locator('#vesMassB').fill('20');
	await box.locator('#vesTempA').fill('100');
	await box.locator('#vesMassA').fill('20');
	await expect(box.locator('[data-readout="more"] .readout-value')).toHaveText('Equal');
	await shoot(page, box, '3-1a-vessels');
	expect(errors).toEqual([]);
});

test('3-1a heat calculator: locked until the prediction, then q follows the sign of the temperature change', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['3-1a']);
	const box = page.locator('[data-tool="heat"]');
	await unlock(box);
	await expect(box.locator('[data-readout="q"] .readout-value')).toHaveText('+37.62 kJ');
	await expect(box.locator('[data-readout="dir"] .readout-value')).toHaveText('Into the sample');
	await box.getByRole('button', { name: /Cooling iron/ }).click();
	await expect(box.locator('[data-readout="q"] .readout-value')).toHaveText('−228.99 kJ');
	await expect(box.locator('[data-readout="dir"] .readout-value')).toHaveText('Out of the sample');
	await expect(box.locator('.status-pill')).toHaveText('Energy released');
	await box.getByRole('button', { name: /Aluminum pan/ }).click();
	await expect(box.locator('[data-readout="q"] .readout-value')).toHaveText('+70.64 kJ');
	await box.locator('#calcSubstance').selectOption('copper');
	await expect(box.locator('[data-readout="q"] .readout-value')).toHaveText('+30.32 kJ');
	await box.locator('#calcMass').fill('0');
	await expect(box.locator('.status-pill')).toHaveText('Enter a positive mass and two temperatures');
	await expect(box.locator('[data-readout="q"] .readout-value')).toHaveText('–');
	await shoot(page, box, '3-1a-heat');
	expect(errors).toEqual([]);
});

test('3-1b heating curve: locked until the prediction, then flat parts sit at 0 and 100 degrees', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['3-1b']);
	const box = page.locator('[data-sim="heating-curve"]');
	await unlock(box);
	await expect(box.locator('[data-readout="temp"] .readout-value')).toHaveText('-20.0 °C', { timeout: 3000 });
	await expect(box.locator('[data-readout="stage"] .readout-value')).toHaveText('Ice warming');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await load(box, 'Load 10 kJ');
	await expect(box.locator('[data-readout="temp"] .readout-value')).toHaveText('0.0 °C', { timeout: 3000 });
	await expect(box.locator('[data-readout="stage"] .readout-value')).toHaveText('Melting');
	await expect(box.locator('.status-pill')).toHaveText('Temperature steady');
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load 30 kJ');
	await expect(box.locator('[data-readout="temp"] .readout-value')).toHaveText('53.6 °C');
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load 100 kJ');
	await expect(box.locator('[data-readout="temp"] .readout-value')).toHaveText('100.0 °C');
	await expect(box.locator('[data-readout="stage"] .readout-value')).toHaveText('Boiling');
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load 154 kJ');
	await expect(box.locator('[data-readout="stage"] .readout-value')).toHaveText('Steam warming');
	await expect(box.locator('table.sim-record tbody tr:not(.empty)')).toHaveCount(3);
	await shoot(page, box, '3-1b-curve');
	expect(errors).toEqual([]);
});

test('3-1b multi-stage calculator: locked until the prediction, then the stages add up', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['3-1b']);
	const box = page.locator('[data-tool="stages"]');
	await unlock(box);
	await expect(box.locator('[data-readout="count"] .readout-value')).toHaveText('5');
	await expect(box.locator('[data-readout="total"] .readout-value')).toHaveText('+76.60 kJ');
	await expect(box.locator('.calc-stage-list li')).toHaveCount(5);
	await box.getByRole('button', { name: /Melting ice/ }).click();
	await expect(box.locator('[data-readout="count"] .readout-value')).toHaveText('2');
	await expect(box.locator('[data-readout="total"] .readout-value')).toHaveText('+9.13 kJ');
	await box.getByRole('button', { name: /Warming ethanol/ }).click();
	await expect(box.locator('[data-readout="count"] .readout-value')).toHaveText('1');
	await box.locator('#multiMass').fill('25');
	await box.locator('#multiTi').fill('110');
	await box.locator('#multiTf').fill('-15');
	await box.locator('#multiSubstance').selectOption('water');
	await expect(box.locator('.status-pill')).toHaveText('Energy released');
	await expect(box.locator('[data-readout="total"] .readout-value')).toHaveText('−76.60 kJ');
	await shoot(page, box, '3-1b-stages');
	expect(errors).toEqual([]);
});

test('3-1c calorimeter: locked until the prediction, then nothing shows until the metal is dropped', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['3-1c']);
	const box = page.locator('[data-sim="calorimeter"]');
	await unlock(box);
	// the default screen does not answer the checkpoint
	await expect(box.locator('[data-readout="tf"] .readout-value')).toHaveText('–');
	await expect(box.locator('[data-readout="now"] .readout-value')).toHaveText('20.0 °C');
	await box.getByRole('button', { name: 'Drop metal and stir' }).click();
	await expect(box.locator('[data-readout="tf"] .readout-value')).toHaveText('23.52 °C', { timeout: 6000 });
	await expect(box.locator('[data-readout="dm"] .readout-value')).toHaveText('−76.5 °C');
	await expect(box.locator('[data-readout="dw"] .readout-value')).toHaveText('+3.5 °C');
	await expect(box.locator('.status-pill')).toHaveText('Equilibrium reached');
	expect(await box.locator('svg').evaluate((s) => s.textContent)).toMatch(/Initial (\d+) = Final \1/);
	await box.getByRole('button', { name: 'Record' }).click();
	// a change clears the result
	await box.locator('#metalMass').fill('100');
	await expect(box.locator('[data-readout="tf"] .readout-value')).toHaveText('–');
	await load(box, 'Load 200 g Fe, 50 g water');
	await box.getByRole('button', { name: 'Drop metal and stir' }).click();
	await expect(box.locator('[data-readout="tf"] .readout-value')).toHaveText('44.03 °C', { timeout: 6000 });
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(box.locator('table.sim-record tbody tr:not(.empty)')).toHaveCount(2);
	await shoot(page, box, '3-1c-calorimeter');
	expect(errors).toEqual([]);
});

test('3-4a collision chamber: locked until the prediction, then the two groups meet halfway', async ({ page }) => {
	test.setTimeout(90_000);
	const errors = watch(page);
	await page.goto(LESSON['3-4a']);
	const box = page.locator('[data-sim="chamber"]');
	await unlock(box);
	await expect(box.locator('[data-readout="a"] .readout-value')).toHaveText('95 °C', { timeout: 3000 });
	await expect(box.locator('[data-readout="b"] .readout-value')).toHaveText('15 °C');
	await expect(box.locator('[data-readout="part"] .readout-value')).toHaveText('In place');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await box.getByRole('button', { name: 'Remove partition and mix' }).click();
	await expect(box.locator('[data-readout="part"] .readout-value')).toHaveText('Removed');
	await expect(box.locator('.status-pill')).toHaveText('One temperature', { timeout: 20_000 });
	await expect(box.locator('[data-readout="a"] .readout-value')).toHaveText(/^5[4-6] °C$/);
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load 50 and 50 °C');
	await box.getByRole('button', { name: 'Remove partition and mix' }).click();
	await expect(box.locator('.status-pill')).toHaveText('One temperature');
	await expect(box.locator('[data-readout="a"] .readout-value')).toHaveText('50 °C');
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(box.locator('table.sim-record tbody tr:not(.empty)')).toHaveCount(2);
	// the speed histogram is the Enrichment view
	const hist = box.getByRole('button', { name: /Speed histogram/ });
	await hist.click();
	await expect(hist).toHaveAttribute('aria-pressed', 'true');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await shoot(page, box, '3-4a-chamber');
	expect(errors).toEqual([]);
});

test('3-4a investigation: locked until the prediction, then the curves meet at the model value', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['3-4a']);
	const box = page.locator('[data-sim="investigation"]');
	await unlock(box);
	await expect(box.locator('[data-readout="end"] .readout-value')).toHaveText('–');
	await box.getByRole('button', { name: 'Start trial' }).click();
	await expect(box.locator('[data-readout="end"] .readout-value')).toHaveText('44.0 °C', { timeout: 8000 });
	await expect(box.locator('[data-readout="dh"] .readout-value')).toHaveText('−36.0 °C');
	await expect(box.locator('[data-readout="dc"] .readout-value')).toHaveText('+24.0 °C');
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load aluminum and water');
	await expect(box.locator('[data-readout="end"] .readout-value')).toHaveText('–');
	await box.getByRole('button', { name: 'Start trial' }).click();
	await expect(box.locator('[data-readout="end"] .readout-value')).toHaveText('32.4 °C', { timeout: 8000 });
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load the open beaker');
	await box.getByRole('button', { name: 'Start trial' }).click();
	await expect(box.locator('[data-readout="end"] .readout-value')).toHaveText('40.5 °C', { timeout: 8000 });
	await expect(box.locator('[data-readout="eq"] .readout-value')).toHaveText('44.0 °C');
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(box.locator('table.sim-record tbody tr:not(.empty)')).toHaveCount(3);
	await shoot(page, box, '3-4a-investigation');
	expect(errors).toEqual([]);
});

test('1-4a reaction profile: locked until the prediction, then a catalyst lowers the barrier and keeps the energy change', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-4a']);
	const box = page.locator('[data-sim="profile"]');
	await unlock(box);
	await expect(box.locator('[data-readout="ea"] .readout-value')).toHaveText('+436 kJ/mol', { timeout: 3000 });
	await expect(box.locator('[data-readout="dh"] .readout-value')).toHaveText('−484 kJ/mol');
	await expect(box.locator('[data-readout="stage"] .readout-value')).toHaveText('Reactants');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await load(box, 'Load hydrogen, catalyst off');
	await expect(box.locator('[data-readout="stage"] .readout-value')).toHaveText('Transition state');
	await box.getByRole('button', { name: 'Record' }).click();
	await box.getByRole('button', { name: 'Catalyst', exact: true }).click();
	await expect(box.locator('[data-readout="ea"] .readout-value')).toHaveText('+125 kJ/mol');
	await expect(box.locator('[data-readout="dh"] .readout-value')).toHaveText('−484 kJ/mol');
	await expect(box.locator('[data-readout="cat"] .readout-value')).toHaveText('On');
	await box.getByRole('button', { name: 'Record' }).click();
	await box.locator('#rxnChoice').selectOption('split');
	await expect(box.locator('[data-readout="dh"] .readout-value')).toHaveText('+484 kJ/mol');
	await expect(box.locator('[data-readout="ea"] .readout-value')).toHaveText('+609 kJ/mol');
	await box.getByRole('button', { name: 'Catalyst', exact: true }).click();
	await expect(box.locator('[data-readout="ea"] .readout-value')).toHaveText('+920 kJ/mol');
	await box.locator('#rxnChoice').selectOption('ammonia');
	await box.getByRole('button', { name: 'Play the reaction' }).click();
	await expect(box.locator('[data-readout="stage"] .readout-value')).toHaveText('Products', { timeout: 8000 });
	await expect(box.locator('.status-pill')).toHaveText('Energy released');
	await expect(box.locator('table.sim-record tbody tr:not(.empty)')).toHaveCount(2);
	await shoot(page, box, '1-4a-profile');
	expect(errors).toEqual([]);
});

test('1-4a bond-energy calculator (Enrichment): the totals follow the bond counts', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-4a']);
	const block = page.locator('details.enrichment').first();
	await block.locator('summary').click();
	const box = block.locator('[data-tool="bonds"]');
	await box.scrollIntoViewIfNeeded();
	await expect(box.locator('[data-readout="net"] .readout-value')).toHaveText('−802 kJ/mol');
	await expect(box.locator('[data-bonds="broken"] li')).toHaveCount(2);
	await box.locator('#calcRxnPreset').selectOption('haber');
	await expect(box.locator('[data-readout="broken"] .readout-value')).toHaveText('+2,253 kJ');
	await expect(box.locator('[data-readout="net"] .readout-value')).toHaveText('−93 kJ/mol');
	await box.locator('#calcRxnPreset').selectOption('hcl');
	await expect(box.locator('[data-readout="net"] .readout-value')).toHaveText('−184 kJ/mol');
	await shoot(page, box, '1-4a-bonds');
	expect(errors).toEqual([]);
});

// A look at every figure on the five pages (only when UNIT3_SHOTS is set): static SVG labels
// render at the caption size, and one that is too long for its figure clips at the right edge.
test('every figure on the five pages, for a look by eye', async ({ page }) => {
	test.skip(!SHOTS, 'only with UNIT3_SHOTS');
	test.setTimeout(180_000);
	for (const [id, url] of Object.entries(LESSON)) {
		await page.setViewportSize({ width: 400, height: 1000 });
		await page.goto(url);
		await page.getByRole('button', { name: /Show Synopsis/ }).click();
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

	test('3-1c calorimeter: Drop metal then two Step presses finish the run', async ({ page }) => {
		await page.goto(LESSON['3-1c']);
		const box = page.locator('[data-sim="calorimeter"]');
		await unlock(box);
		await expect(box.getByRole('button', { name: 'Play' })).toBeVisible();
		await box.getByRole('button', { name: 'Drop metal and stir' }).click();
		await expect(box.getByRole('button', { name: 'Play' })).toBeVisible();
		for (let i = 0; i < 2; i++) await box.getByRole('button', { name: 'Step', exact: true }).click();
		await expect(box.locator('[data-readout="tf"] .readout-value')).toHaveText('23.52 °C');
	});

	test('3-4a investigation: Start trial then two Step presses finish the trial', async ({ page }) => {
		await page.goto(LESSON['3-4a']);
		const box = page.locator('[data-sim="investigation"]');
		await unlock(box);
		await box.getByRole('button', { name: 'Start trial' }).click();
		for (let i = 0; i < 2; i++) await box.getByRole('button', { name: 'Step', exact: true }).click();
		await expect(box.locator('[data-readout="end"] .readout-value')).toHaveText('44.0 °C');
	});

	test('1-4a reaction profile: Play the reaction then four Step presses reach the products', async ({ page }) => {
		await page.goto(LESSON['1-4a']);
		const box = page.locator('[data-sim="profile"]');
		await unlock(box);
		await box.getByRole('button', { name: 'Play the reaction' }).click();
		for (let i = 0; i < 4; i++) await box.getByRole('button', { name: 'Step', exact: true }).click();
		await expect(box.locator('[data-readout="stage"] .readout-value')).toHaveText('Products');
	});
});
