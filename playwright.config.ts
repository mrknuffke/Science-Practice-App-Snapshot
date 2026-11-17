import { defineConfig } from '@playwright/test';

/**
 * Browser smoke suite, run by scripts/preflight/preflight.sh against the
 * production build (`vite preview`). Public routes only: nothing here signs in,
 * mints a session, or touches localStorage auth. Authenticated screens are
 * checked by David (see CLAUDE.md, Verification & Visual UI Rules).
 *
 * Files are named *.smoke.ts, not *.spec.ts, so Vitest's default include does
 * not pick them up. Uses installed Google Chrome (`channel: 'chrome'`), so there
 * is no browser download; GitHub's ubuntu runners ship Chrome as well.
 */
export default defineConfig({
	testDir: 'tests/smoke',
	testMatch: '**/*.smoke.ts',
	snapshotPathTemplate: 'tests/smoke/__snapshots__/{arg}{ext}',
	timeout: 45_000,
	retries: 0,
	// Three parallel Chrome workers starved each other (tabs timing out "while
	// setting up page", tests that pass alone in 1s). Two is stable.
	workers: 2,
	reporter: [['list']],
	use: {
		baseURL: process.env.PREFLIGHT_BASE_URL || 'http://127.0.0.1:4499',
		channel: 'chrome',
		viewport: { width: 1440, height: 1000 },
	},
});
