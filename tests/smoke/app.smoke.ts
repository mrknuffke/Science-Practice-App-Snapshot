import { test, expect } from '@playwright/test';

/**
 * The React app's public surface: what a signed-out visitor can reach. Nothing
 * here signs in. Authenticated screens are checked by David, not automated.
 */

// Simulations are open without sign-in (isPublicView in App.tsx).
const SIMULATIONS = [
	'covalent_bonding', 'ionic_bonding', 'periodic_table', 'build_an_atom',
	'ecosystem_simulation', 'population_genetics', 'phase_change', 'regulatory_modeler',
	'diffusion', 'reaction_kinetics', 'gas_laws', 'free_body_diagram', 'video-lab',
	'calorimetry', 'blood_buffer', 'nuclear_decay', 'osmosis', 'carbon_atom',
	'island_biogeography',
];

const INFO_PAGES = ['how_it_works', 'features', 'support', 'teachers', 'changelog', 'interactives', 'resources'];

test('signed-out visitors reach the sign-in gate without errors', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.goto('/');
	await expect(page.locator('#root')).not.toBeEmpty();
	await expect(page.getByText(/sign in|google/i).first()).toBeVisible();
	expect(errors).toEqual([]);
});

for (const pageParam of [...INFO_PAGES, ...SIMULATIONS]) {
	test(`public page ?page=${pageParam} renders without a sign-in wall or errors`, async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(e.message));
		await page.goto(`/?page=${pageParam}`);
		await expect(page.locator('#root')).not.toBeEmpty();
		// A public page must not fall through to the sign-in gate.
		await page.waitForTimeout(500);
		const bodyText = (await page.locator('#root').innerText()).toLowerCase();
		expect(bodyText.length).toBeGreaterThan(50);
		expect(errors).toEqual([]);
	});
}

test('mobile 390px viewport: public simulations render without document horizontal scroll overflow', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	for (const sim of SIMULATIONS) {
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(e.message));
		await page.goto(`/?page=${sim}`);
		await page.waitForTimeout(200);
		const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
		expect(scrollWidth, `simulation ${sim} has horizontal overflow at 390px`).toBeLessThanOrEqual(395);
		expect(errors, `simulation ${sim} threw uncaught errors at 390px`).toEqual([]);
	}
});

test('mobile 390px viewport: open resources page renders without horizontal scroll overflow', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.goto('/?page=resources');
	await page.waitForTimeout(500);
	const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
	expect(scrollWidth, 'open resources page has horizontal overflow at 390px').toBeLessThanOrEqual(395);
	expect(errors, 'open resources page threw uncaught errors at 390px').toEqual([]);
});

