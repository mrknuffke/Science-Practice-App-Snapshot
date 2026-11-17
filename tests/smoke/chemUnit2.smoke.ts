import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Chem Unit 2 (lessons 1-2d, 1-2e, 1-7a, 1-7b, 1-7c, 2-6a): every simulation and tool.
 *
 * Public pages only, nothing signed in, nothing stored. Each test opens a lesson, answers the
 * sim's prediction where it has one (a wrong answer unlocks it too), checks that the readouts
 * come alive and the drawing paints, and uses the control that matters. Run with
 * UNIT2_SHOTS=<folder> to save a screenshot of each box (and each figure on the page) in both
 * themes and at phone width, for a look by eye.
 */

const SHOTS = process.env.UNIT2_SHOTS;

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
	'1-2d': '/chem/lessons/2-2a_physical-chemical-change.html',
	'1-2e': '/chem/lessons/1-2e_reaction-types-balancing.html',
	'1-7a': '/chem/lessons/2-7a_the-mole-molar-mass.html',
	'1-7b': '/chem/lessons/2-7b_mole-conversions.html',
	'1-7c': '/chem/lessons/2-7c_stoichiometry.html',
	'2-6a': '/chem/lessons/2-6a_structure-property-argument.html',
};

test('1-2d change lab: locked until the prediction, then the dashboard counts the atoms that are drawn', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-2d']);
	const box = page.locator('[data-sim="change-lab"]');
	await unlock(box);
	await expect(box.locator('[data-readout="stage"] .readout-value')).toHaveText('Solid ice', { timeout: 3000 });
	await expect(box.locator('[data-readout="a1"] .readout-value')).toHaveText('18 → 18');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await load(box, 'Load water, 100%');
	await expect(box.locator('[data-readout="stage"] .readout-value')).toHaveText('Steam', { timeout: 3000 });
	await expect(box.locator('[data-readout="a1"] .readout-value')).toHaveText('18 → 18');
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load methane, 100%');
	await expect(box.locator('[data-readout="stage"] .readout-value')).toHaveText('Products', { timeout: 3000 });
	await expect(box.locator('[data-readout="a1"] .readout-label')).toHaveText(/Carbon/);
	await expect(box.locator('[data-readout="a1"] .readout-value')).toHaveText('2 → 2');
	await expect(box.locator('[data-readout="a4"]')).toBeHidden();
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(box.locator('table.sim-record tbody tr:not(.empty)')).toHaveCount(2);
	await load(box, 'Load salt, 100%');
	await expect(box.locator('[data-readout="a4"]')).toBeVisible();
	await shoot(page, box, '1-2d-change-lab');
	expect(errors).toEqual([]);
});

test('1-2e balancer: the ledger and the beam agree, and a balanced equation levels the beam', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-2e']);
	const box = page.locator('[data-sim="balancer"]');
	await box.scrollIntoViewIfNeeded();
	await expect(box.locator('.status-pill')).toHaveText('Not balanced yet', { timeout: 3000 });
	await expect(box.locator('[data-readout="e1"] .readout-value')).toHaveText('2 = 2');
	await expect(box.locator('[data-readout="e2"] .readout-value')).toHaveText('2 ≠ 1');
	expect(await painted(box)).toBeGreaterThan(0.005);
	await box.locator('[data-species="H2"] input').fill('2');
	await box.locator('[data-species="H2O"] input').fill('2');
	await expect(box.locator('.status-pill')).toHaveText('Balanced');
	await expect(box.locator('[data-readout="eq"] .readout-value')).toHaveText('2 H₂ + 1 O₂ → 2 H₂O');
	await expect(box.locator('[data-species="H2O2"]')).toBeHidden();
	await box.getByRole('button', { name: 'Methane combustion' }).click();
	await expect(box.locator('[data-readout="e3"]')).toBeVisible();
	await expect(box.locator('[data-readout="e2"] .readout-value')).toHaveText('4 ≠ 2');
	await box.locator('[data-species="O2"] input').fill('2');
	await box.locator('[data-species="H2O"] input').fill('2');
	await expect(box.locator('.status-pill')).toHaveText('Balanced');
	await shoot(page, box, '1-2e-balancer');
	expect(errors).toEqual([]);
});

test('1-7a molar mass builder: each count times its mass, added, for a preset and a typed formula', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-7a']);
	const box = page.locator('[data-sim="molar-mass"]');
	await box.scrollIntoViewIfNeeded();
	await expect(box.locator('[data-readout="total"] .readout-value')).toHaveText('18.02 g/mol', { timeout: 3000 });
	await expect(box.locator('#calcTableBody tr')).toHaveCount(2);
	expect(await painted(box)).toBeGreaterThan(0.01);
	await box.getByRole('button', { name: 'Baking soda' }).click();
	await expect(box.locator('[data-readout="total"] .readout-value')).toHaveText('84.01 g/mol');
	await expect(box.locator('#calcTableBody tr')).toHaveCount(4);
	await box.locator('#formulaInput').fill('Ca(OH)2');
	await box.locator('#formulaInput').press('Enter');
	await expect(box.locator('[data-readout="total"] .readout-value')).toHaveText('74.10 g/mol');
	await expect(box.getByRole('button', { name: 'Baking soda' })).toHaveAttribute('aria-pressed', 'false');
	await box.locator('#formulaInput').fill('h2o');
	await box.getByRole('button', { name: 'Calculate' }).click();
	await expect(box.locator('.status-pill')).toHaveText('Check the formula');
	await expect(box.locator('[data-readout="total"] .readout-value')).toHaveText('–');
	await box.locator('#formulaInput').fill('C6H12O6');
	await box.getByRole('button', { name: 'Calculate' }).click();
	await expect(box.locator('[data-readout="atoms"] .readout-value')).toHaveText('24');
	await shoot(page, box, '1-7a-builder');
	expect(errors).toEqual([]);
});

test('1-7b conversion builder: a wrong card says why, the right card cancels the unit and unlocks the next problem', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-7b']);
	const box = page.locator('[data-sim="conversion"]');
	await box.scrollIntoViewIfNeeded();
	await expect(box.locator('#problemCounter')).toHaveText('Problem 1 of 5');
	await expect(box.locator('#nextBtn')).toBeDisabled();
	expect(await painted(box)).toBeGreaterThan(0.005);
	const card = (num: string, den: string) => box.locator('.factor-card').filter({ has: page.locator('.numerator', { hasText: num }) }).filter({ has: page.locator('.denominator', { hasText: den }) });
	await card('18.02 g H₂O', '1 mol H₂O').click();
	await expect(box.locator('.status-pill')).toHaveText('Units do not cancel');
	await expect(box.locator('#finalResult')).toHaveText('?');
	await card('1 mol NaCl', '58.44 g NaCl').click();
	await expect(box.locator('.status-pill')).toHaveText('Wrong compound');
	await card('1 mol H₂O', '18.02 g H₂O').click();
	await expect(box.locator('.status-pill')).toHaveText('Correct setup');
	await expect(box.locator('#finalResult')).toHaveText('2.00 mol H₂O');
	await expect(box.locator('#nextBtn')).toBeEnabled();
	await box.locator('#nextBtn').click();
	await expect(box.locator('#problemCounter')).toHaveText('Problem 2 of 5');
	await expect(box.locator('#prevBtn')).toBeEnabled();
	await expect(box.locator('#nextBtn')).toBeDisabled();
	await shoot(page, box, '1-7b-conversion');
	expect(errors).toEqual([]);
});

test('1-7b empirical calculator: the work stays hidden until the guess is checked', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-7b']);
	const box = page.locator('[data-tool="empirical"]');
	await box.scrollIntoViewIfNeeded();
	await expect(box.locator('#empWorkWrapper')).toBeHidden();
	await expect(box.locator('#empCheckBtn')).toBeDisabled();
	await box.locator('#empGuessSelect').selectOption({ index: 1 });
	await box.locator('#empCheckBtn').click();
	await expect(box.locator('#empWorkWrapper')).toBeVisible();
	await expect(box.locator('[data-readout="mol"] .readout-value')).toHaveText('C₆H₁₂O₆');
	await expect(box.locator('#empTableBody tr')).toHaveCount(6);
	await box.locator('#empPresetSelect').selectOption('vitaminC');
	await expect(box.locator('#empWorkWrapper')).toBeHidden();
	await expect(box.locator('[data-readout="mol"] .readout-value')).toHaveText('–');
	await shoot(page, box, '1-7b-empirical');
	expect(errors).toEqual([]);
});

test('1-7c BCA simulator: locked until the prediction, then the table, the limiting reactant and the picture agree', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-7c']);
	const box = page.locator('[data-sim="stoichiometry"]');
	await unlock(box);
	await expect(box.locator('#bCH4')).toHaveText('2.00');
	await expect(box.locator('#aO2')).toHaveText('5.00');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await load(box, 'Load 2 CH₄, 5 O₂');
	await expect(box.locator('[data-readout="limiting"] .readout-value')).toHaveText('CH₄', { timeout: 3000 });
	await expect(box.locator('#aCH4')).toHaveText('0.00');
	await expect(box.locator('#aO2')).toHaveText('1.00');
	await expect(box.locator('#aCH4')).toHaveAttribute('data-limiting', 'true');
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load 3 CH₄, 4 O₂');
	await expect(box.locator('[data-readout="limiting"] .readout-value')).toHaveText('O₂', { timeout: 3000 });
	await expect(box.locator('#aCH4')).toHaveText('1.00');
	await expect(box.locator('#aH2O')).toHaveText('4.00');
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load 2 CH₄, 4 O₂');
	await expect(box.locator('[data-readout="limiting"] .readout-value')).toHaveText('Both (exact 1:2 ratio)', { timeout: 3000 });
	// a new starting amount puts the progress back to 0
	await box.locator('#ch4Input').fill('3');
	await expect(box.locator('#progressInput')).toHaveValue('0');
	await expect(box.locator('table.sim-record tbody tr:not(.empty)')).toHaveCount(2);
	await shoot(page, box, '1-7c-bca');
	expect(errors).toEqual([]);
});

test('1-7c s\'mores factory: locked until the prediction, then the limiting ingredient follows the recipe', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-7c']);
	const box = page.locator('[data-tool="smores"]');
	await unlock(box);
	await expect(box.locator('[data-readout="limiting"] .readout-value')).toHaveText('Graham crackers');
	await expect(box.locator('[data-readout="made"] .readout-value')).toHaveText('5');
	await box.locator('#smorMarshmallow').fill('12');
	await expect(box.locator('[data-readout="limiting"] .readout-value')).toHaveText('Graham crackers');
	await box.locator('#smorGraham').fill('6');
	await expect(box.locator('[data-readout="limiting"] .readout-value')).toHaveText('Graham crackers');
	await box.locator('#smorGraham').fill('14');
	await box.locator('#smorChocolate').fill('4');
	await expect(box.locator('[data-readout="limiting"] .readout-value')).toHaveText('Chocolate squares');
	await expect(box.locator('[data-ing="choco"]')).toHaveAttribute('data-limiting', 'true');
	await shoot(page, box, '1-7c-smores');
	expect(errors).toEqual([]);
});

test('2-6a chain simulator: locked until the prediction, then the states follow the melting and boiling points', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['2-6a']);
	const box = page.locator('[data-sim="chains"]');
	await unlock(box);
	await expect(box.locator('[data-readout="left"] .readout-value')).toHaveText('Solid', { timeout: 3000 });
	await expect(box.locator('[data-readout="right"] .readout-value')).toHaveText('Liquid');
	expect(await painted(box)).toBeGreaterThan(0.005);
	await load(box, 'Load fats, 45°C');
	await expect(box.locator('[data-readout="temp"] .readout-value')).toHaveText('45°C', { timeout: 3000 });
	await expect(box.locator('[data-readout="left"] .readout-value')).toHaveText('Solid');
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load fats, 75°C');
	await expect(box.locator('[data-readout="left"] .readout-value')).toHaveText('Liquid', { timeout: 3000 });
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load alkanes, 20°C');
	await expect(box.locator('[data-readout="left"] .readout-value')).toHaveText('Gas', { timeout: 3000 });
	await expect(box.locator('[data-readout="right"] .readout-value')).toHaveText('Liquid');
	await expect(box.locator('#tempInput')).toHaveAttribute('min', '-50');
	await expect(box.locator('table.sim-record tbody tr:not(.empty)')).toHaveCount(2);
	await load(box, 'Load fats, 20°C');
	await shoot(page, box, '2-6a-chains');
	expect(errors).toEqual([]);
});

test('2-6a argument builders: the paragraph follows the chosen statements and the path', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['2-6a']);
	const tool = page.locator('[data-tool="argument"]');
	await tool.scrollIntoViewIfNeeded();
	await expect(tool.locator('#argStatus')).toHaveText('Pending');
	for (let i = 1; i <= 5; i++) await tool.locator('#step' + i).selectOption('right');
	await expect(tool.locator('#argStatus')).toHaveText('Complete argument');
	await tool.locator('#step3').selectOption('wrong');
	await expect(tool.locator('#argStatus')).toHaveText('Not complete yet');
	await expect(tool.locator('#step3')).toHaveAttribute('data-result', 'no');
	// the argument follows the simulation's path
	const sim = page.locator('[data-sim="chains"]');
	await sim.scrollIntoViewIfNeeded();
	await unlock(sim);
	await sim.getByRole('button', { name: /Alkanes/ }).click();
	await expect(tool.locator('#argPath')).toHaveText('alkanes');
	await expect(tool.locator('#argStatus')).toHaveText('Pending');
	await shoot(page, tool, '2-6a-argument');
	const ghs = page.locator('[data-tool="ghs"]');
	await ghs.scrollIntoViewIfNeeded();
	await ghs.locator('#checkGhsBtn').click();
	await expect(ghs.locator('#ghsPill')).toContainText('Choose a statement for all four layers');
	for (let i = 1; i <= 4; i++) await ghs.locator('#ghsLayer' + i).selectOption('right');
	await ghs.locator('#checkGhsBtn').click();
	await expect(ghs.locator('#ghsPill')).toHaveText('Complete four-layer argument');
	await expect(ghs.locator('#ghsParagraphOutput')).toBeVisible();
	await ghs.locator('#ghsChemSelect').selectOption('co');
	await expect(ghs.locator('#ghsParagraphOutput')).toBeHidden();
	await shoot(page, ghs, '2-6a-ghs');
	expect(errors).toEqual([]);
});

// A look at every figure on the six pages (only when UNIT2_SHOTS is set): static SVG labels
// render at the caption size, and one that is too long for its figure clips at the right edge.
test('every figure on the six pages, for a look by eye', async ({ page }) => {
	test.skip(!SHOTS, 'only with UNIT2_SHOTS');
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
