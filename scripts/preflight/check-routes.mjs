/* global process, fetch, console, URL */
/**
 * Requests every public route of a running preflight server.
 *
 * Public means reachable without Google sign-in: the landing info pages, every
 * simulation (by its shareable ?page= param), and every interactive textbook.
 *
 * A missing file does not 404 here: `vite preview` answers it with a fallback
 * page and a 200. So a file counts as present only if its body differs from
 * what the server returns for a path that cannot exist. (An earlier version of
 * this script checked for the app's root div instead, and passed missing lesson
 * pages because the fallback under /chem/ is a different page.)
 *
 * Lesson scripts are read from each lesson's own <script src> tags, not guessed
 * from lesson ids: ids were renumbered, while script files kept their original
 * names (lesson 1-7a loads 2-7a.js).
 *
 *   node scripts/preflight/check-routes.mjs http://127.0.0.1:4499
 */
import fs from 'node:fs';

const base = (process.argv[2] || 'http://127.0.0.1:4499').replace(/\/$/, '');

const ERROR_MARKERS = ['Internal Server Error', '[object Object]', 'Cannot GET'];

// Mirrors PUBLIC_PAGE_PARAMS in constants/publicRoutes.ts, which App.tsx builds
// its ?page= URLs from. Kept in step by a drift guard in sourceOfTruth.test.ts,
// so a new simulation cannot ship without a route check here.
const APP_PAGES = [
	'blood_buffer', 'build_an_atom', 'calorimetry', 'carbon_atom', 'changelog', 'concept_map',
	'covalent_bonding', 'diagram_labeling', 'diffusion', 'ecosystem_simulation', 'features',
	'free_body_diagram', 'gas_laws', 'growth_coach', 'how_it_works', 'interactives', 'ionic_bonding', 'island_biogeography',
	'nuclear_decay', 'osmosis', 'periodic_table', 'phase_change', 'population_genetics',
	'reaction_kinetics', 'regulatory_modeler', 'resources', 'skeptic', 'socratic', 'support', 'teachers', 'tutor', 'video-lab', 'vocab_relay',
];

// Every zero-build static textbook under public/. Each is its own deployed
// subdomain (chem.sciencepractice.app, physics.sciencepractice.app, bio.sciencepractice.app) and each
// ships lessons the React app never imports, so nothing else checks them.
// bookScript is the book's own script: every book is on the shared runtime, so each has book.js.
const TEXTBOOKS = [
	{ root: 'chem', extraFiles: ['about.html', 'pe/index.html', 'pe/verify.html', 'assets/dashboard.js', 'assets/reference-center.js'], bookScript: 'book.js' },
	{ root: 'physics', extraFiles: ['about.html'], bookScript: 'book.js' },
	{ root: 'bio', extraFiles: ['about.html'], bookScript: 'book.js' },
];

const get = async (route) => {
	const res = await fetch(base + route);
	return { status: res.status, body: await res.text() };
};

// The shared runtime every textbook loads (docs/textbook/RUNTIME_SPEC.md). Bio depends
// on it from session 4a, so a missing or broken file here breaks a whole book.
// specimen.html is the runtime's own test page; it is checked, with every file it
// loads, but no book links to it.
const SHARED_RUNTIME = [
	'/textbook/theme-boot.js', '/textbook/base.css', '/textbook/lesson.css',
	'/textbook/core.js', '/textbook/widgets.js', '/textbook/sim.js',
	'/textbook/specimen.html', '/textbook/specimen.js', '/textbook/specimen.css',
];

// What "not found" looks like at each depth, for each textbook.
const fallbackBodies = [
	(await get('/__preflight_missing__.html')).body,
	(await get('/textbook/__preflight_missing__.html')).body,
	(await get('/textbook/__preflight_missing__.js')).body,
];
for (const { root } of TEXTBOOKS) {
	fallbackBodies.push(
		(await get(`/${root}/__preflight_missing__.html`)).body,
		(await get(`/${root}/lessons/__preflight_missing__.html`)).body,
		(await get(`/${root}/assets/__preflight_missing__.js`)).body,
	);
}
const fallbacks = new Set(fallbackBodies);

const checks = [
	{ route: '/', kind: 'app' },
	...APP_PAGES.map((p) => ({ route: `/?page=${p}`, kind: 'app' })),
];

checks.push(...SHARED_RUNTIME.map((route) => ({ route, kind: 'file' })));

const books = TEXTBOOKS.map(({ root, extraFiles, bookScript = 'core.js' }) => {
	const manifest = `public/${root}/lessons.json`;
	const { lessons } = JSON.parse(fs.readFileSync(manifest, 'utf8'));
	checks.push(
		{ route: `/${root}/`, kind: 'file' },
		{ route: `/${root}/lessons.json`, kind: 'file' },
		{ route: `/${root}/assets/${bookScript}`, kind: 'file' },
		{ route: `/${root}/assets/components.css`, kind: 'file' },
		{ route: `/${root}/assets/tokens.css`, kind: 'file' },
		...extraFiles.map((f) => ({ route: `/${root}/${f}`, kind: 'file' })),
	);
	return { root, lessons };
});

let failures = 0;
const fail = (route, msg) => {
	failures++;
	console.log(`  ✗ ${route} - ${msg}`);
};

async function check({ route, kind }) {
	let r;
	try {
		r = await get(route);
	} catch (err) {
		fail(route, `request failed: ${err.message}`);
		return null;
	}
	if (r.status !== 200) return fail(route, `HTTP ${r.status}`), null;
	if (ERROR_MARKERS.some((m) => r.body.includes(m))) return fail(route, 'body contains an error marker'), null;
	if (kind !== 'app' && fallbacks.has(r.body)) return fail(route, 'missing (server returned its not-found fallback)'), null;
	if (route.endsWith('.html') && !r.body.includes('</html>')) return fail(route, 'incomplete HTML document'), null;
	return r.body;
}

for (const c of checks) await check(c);

let lessonCount = 0;
let scriptCount = 0;
for (const { root, lessons } of books) {
	for (const lesson of lessons) {
		const route = `/${root}/lessons/${lesson.slug}.html`;
		lessonCount++;
		const html = await check({ route, kind: 'file' });
		if (!html) continue;
		const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)]
			.map((m) => m[1])
			.filter((src) => !/^(https?:)?\/\//.test(src));
		for (const src of scripts) {
			const resolved = new URL(src, `http://x${route}`).pathname;
			scriptCount++;
			await check({ route: resolved, kind: 'file' });
		}
	}
}

// Everything the specimen page loads must exist too.
const specimen = await check({ route: '/textbook/specimen.html', kind: 'file' });
if (specimen) {
	const refs = [...specimen.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)]
		.map((m) => m[1])
		.filter((ref) => !/^((https?:)?\/\/|data:)/.test(ref));
	for (const ref of refs) {
		scriptCount++;
		await check({ route: new URL(ref, 'http://x/textbook/specimen.html').pathname, kind: 'file' });
	}
}

const total = checks.length + lessonCount + scriptCount;
if (failures) {
	console.log(`\n${failures} of ${total} route checks failed.`);
	process.exit(1);
}
const books_desc = books.map((b) => `${b.lessons.length} ${b.root}`).join(', ');
console.log(`  ✓ all ${total} routes (${APP_PAGES.length} app pages, ${books_desc} lessons, ${scriptCount} lesson scripts)`);
