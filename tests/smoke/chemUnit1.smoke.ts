import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Chem Unit 1 (lessons 1-1a to 1-3b): every simulation and tool.
 *
 * Public pages only, nothing signed in, nothing stored. Each test opens a lesson,
 * answers the sim's prediction (a wrong answer unlocks it too), checks that the
 * readouts come alive and the drawing paints, and uses the control that matters.
 * Run with UNIT1_SHOTS=<folder> to save a screenshot of each box in both themes
 * and at phone width, for a look by eye.
 */

const SHOTS = process.env.UNIT1_SHOTS;

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
	'1-1a': '/chem/lessons/1-1a_atomic-structure-electron-config.html',
	'1-1b': '/chem/lessons/1-1b_periodic-trends-reactivity.html',
	'1-2a': '/chem/lessons/1-2a_bonding-electronegativity.html',
	'1-2b': '/chem/lessons/1-2b_molecular-polarity.html',
	'1-2c': '/chem/lessons/1-2c_chemical-nomenclature.html',
	'1-3a': '/chem/lessons/1-3a_lewis-structures.html',
	'1-3b': '/chem/lessons/1-3b_imfs-properties.html',
};

test('1-1a Bohr builder: unlocks, follows the slider, records', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-1a']);
	const box = page.locator('[data-sim="bohr"]');
	await unlock(box);
	await expect(box.locator('[data-readout="config"] .readout-value')).toHaveText('2, 7');
	expect(await painted(box)).toBeGreaterThan(0.01);
	await load(box, 'Load chlorine');
	await expect(box.locator('[data-readout="config"] .readout-value')).toHaveText('2, 8, 7', { timeout: 3000 });
	await expect(box.locator('[data-readout="val"] .readout-value')).toHaveText('7');
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(box.locator('table.sim-record tbody tr:not(.empty)')).toHaveCount(1);
	// a transition metal is marked Enrichment and has no simple valence count
	await box.locator('#bohrZ').fill('26');
	await expect(box.locator('.status-pill')).toHaveText(/Enrichment/, { timeout: 3000 });
	await box.locator('#bohrZ').fill('36');
	await expect(box.locator('[data-readout="config"] .readout-value')).toHaveText('2, 8, 18, 8', { timeout: 3000 });
	await shoot(page, box, '1-1a-bohr');
	expect(errors).toEqual([]);
});

test('1-1b Bohr model: the outer ring follows the atomic radius', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-1b']);
	const box = page.locator('[data-sim="atom"]');
	await unlock(box);
	await expect(box.locator('[data-readout="radius"] .readout-value')).toHaveText('167 pm', { timeout: 3000 });
	await box.locator('#atomIdx').fill('7');
	await expect(box.locator('[data-readout="radius"] .readout-value')).toHaveText('38 pm', { timeout: 3000 });
	await expect(box.locator('[data-readout="shells"] .readout-value')).toHaveText('2');
	await box.getByRole('button', { name: 'Down a group' }).click();
	await expect(box.locator('#atomIdx')).toHaveAttribute('max', '2');
	await box.locator('#atomIdx').fill('2');
	await expect(box.locator('[data-readout="shells"] .readout-value')).toHaveText('4', { timeout: 3000 });
	expect(await painted(box)).toBeGreaterThan(0.005);
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(box.locator('table.sim-record tbody tr:not(.empty)')).toHaveCount(1);
	await shoot(page, box, '1-1b-atom');
	expect(errors).toEqual([]);
});

test('1-1b trend explorer: locked until the prediction, then colors and compares', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-1b']);
	const box = page.locator('[data-tool="trends"]');
	await unlock(box);
	await expect(box.locator('#roAcross')).toHaveText('decreases');
	await box.getByRole('button', { name: 'Ionization energy' }).click();
	await expect(box.locator('#roAcross')).toHaveText('increases');
	expect(await box.locator('.pcell[data-level]').count()).toBeGreaterThan(20);
	await box.locator('.pcell[data-sym="Na"]').click();
	await box.locator('.pcell[data-sym="Cl"]').click();
	await expect(box.locator('#cmpOut')).toContainText('Cl has the higher ionization energy');
	await box.getByRole('button', { name: 'Reactivity' }).click();
	expect(await box.locator('.pcell[data-hue="metal"]').count()).toBeGreaterThan(5);
	expect(await box.locator('.pcell[data-hue="nonmetal"]').count()).toBeGreaterThan(5);
	await shoot(page, box, '1-1b-trends');
	expect(errors).toEqual([]);
});

test('1-1b reactivity chain: step 5 opens only after a prediction', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-1b']);
	const box = page.locator('[data-tool="chain"]');
	await box.scrollIntoViewIfNeeded();
	await expect(box.locator('#causalStep5Wrapper')).toBeHidden();
	await expect(box.locator('#causalChainDisplay li')).toHaveCount(4);
	await expect(box.locator('#causalCheckBtn')).toBeDisabled();
	await box.locator('#causalSeverityGuess').selectOption({ index: 1 });
	await box.locator('#causalCheckBtn').click();
	await expect(box.locator('#causalStep5Wrapper')).toBeVisible();
	await shoot(page, box, '1-1b-chain');
	expect(errors).toEqual([]);
});

test('1-2a bond explorer: the bond type follows the electronegativity difference', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-2a']);
	const box = page.locator('[data-sim="bond"]');
	await unlock(box);
	await expect(box.locator('[data-readout="type"] .readout-value')).toHaveText('Ionic', { timeout: 3000 });
	await load(box, 'Load C and O');
	await expect(box.locator('[data-readout="type"] .readout-value')).toHaveText('Polar covalent', { timeout: 3000 });
	await expect(box.locator('[data-readout="endiff"] .readout-value')).toHaveText('0.89');
	await load(box, 'Load H and F');
	await expect(box.locator('[data-readout="type"] .readout-value')).toHaveText('Polar covalent', { timeout: 3000 });
	await box.locator('#selectA').selectOption('Na');
	await box.locator('#selectB').selectOption('Mg');
	await expect(box.locator('[data-readout="type"] .readout-value')).toHaveText('Metallic', { timeout: 3000 });
	expect(await painted(box)).toBeGreaterThan(0.005);
	await box.getByRole('button', { name: 'Record' }).click();
	await expect(box.locator('table.sim-record tbody tr:not(.empty)')).toHaveCount(1);
	await box.locator('#selectA').selectOption('Na');
	await box.locator('#selectB').selectOption('Cl');
	await shoot(page, box, '1-2a-bond');
	expect(errors).toEqual([]);
});

test('1-2b cancel or reinforce: the verdict opens after both steps', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-2b']);
	const box = page.locator('[data-tool="polarity"]');
	await box.scrollIntoViewIfNeeded();
	await box.getByRole('button', { name: /H.?O$/ }).first().click();
	await expect(box.locator('#verdictBox')).toBeHidden();
	await box.getByRole('button', { name: 'Polar', exact: true }).click();
	await box.getByRole('button', { name: /Continue/ }).click();
	await box.getByRole('button', { name: 'Reinforce' }).click();
	await box.getByRole('button', { name: /verdict/ }).click();
	await expect(box.locator('#verdictBox')).toBeVisible();
	await shoot(page, box, '1-2b-polarity');
	expect(errors).toEqual([]);
});

test('1-2c charge balancer: the status follows the net charge', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-2c']);
	const box = page.locator('[data-tool="balancer"]');
	await box.scrollIntoViewIfNeeded();
	await expect(box.locator('#balanceStatus')).toHaveText('Balanced');
	await box.locator('#incCation').click();
	await expect(box.locator('#balanceStatus')).toHaveText('Too positive');
	await expect(box.locator('#ionicFormulaOutput')).toHaveText('Na₂Cl');
	await box.locator('#cationSelect').selectOption('Mg|+2|Magnesium');
	await box.locator('#incAnion').click();
	await expect(box.locator('#balanceStatus')).toHaveText('Balanced');
	await expect(box.locator('#ionicFormulaOutput')).toHaveText('MgCl₂');
	await shoot(page, box, '1-2c-balancer');
	expect(errors).toEqual([]);
});

test('1-3a Lewis lab: checks a drawn structure from the keyboard', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-3a']);
	const box = page.locator('[data-tool="lewis"]');
	await box.scrollIntoViewIfNeeded();
	await box.locator('#molSelect').selectOption('H2');
	await box.locator('.lewis-bond-group').first().focus();
	await page.keyboard.press('Enter');
	await expect(box.locator('#drawnElec')).toHaveText('2');
	await box.getByRole('button', { name: 'Check structure' }).click();
	await expect(box.locator('#lewisFeedback')).toContainText('octet or duet');
	await box.locator('#molSelect').selectOption('H2O');
	await shoot(page, box, '1-3a-lewis');
	expect(errors).toEqual([]);
});

test('1-3b IMF lab: acetone has more vapor than water at 20 C, and both boil at the 1 atm line', async ({ page }) => {
	const errors = watch(page);
	await page.goto(LESSON['1-3b']);
	const box = page.locator('[data-sim="phase"]');
	await unlock(box);
	await load(box, 'Load acetone, 20');
	await expect(box.locator('[data-readout="vp"] .readout-value')).toHaveText('24.0 kPa', { timeout: 3000 });
	await load(box, 'Load water, 20');
	await expect(box.locator('[data-readout="vp"] .readout-value')).toHaveText('2.3 kPa', { timeout: 3000 });
	await box.getByRole('button', { name: 'Record' }).click();
	await load(box, 'Load water, 100');
	await expect(box.locator('[data-readout="vp"] .readout-value')).toHaveText('101 kPa (1 atm)', { timeout: 3000 });
	await expect(box.locator('.status-pill')).toHaveText(/1 atm/);
	expect(await painted(box)).toBeGreaterThan(0.005);
	await load(box, 'Load acetone, 20');
	await shoot(page, box, '1-3b-phase');
	expect(errors).toEqual([]);
});
