/* global process */
// Logic for pre-write.sh; see the comment there.
const fs = require('fs');
const root = process.argv[2];
let j;
try { j = JSON.parse(fs.readFileSync(0, 'utf8')); } catch { process.exit(0); }
const input = j.tool_input || {};
const file = input.file_path || '';
const text = [input.content, input.new_string].filter(Boolean).join('\n');
if (!text) process.exit(0);

// The files that legitimately implement sign-in.
const rel = file.startsWith(root + '/') ? file.slice(root.length + 1) : file;
const ALLOWED = [/^utils\/jwt\.ts$/, /^api\/[^/]+\.ts$/, /^vite\.config\.ts$/, /^App\.tsx$/,
	/^components\/Gatekeeper\.tsx$/, /^utils\/googleAuth\.ts$/, /^CLAUDE\.md$/, /^docs\//];
if (ALLOWED.some((re) => re.test(rel))) process.exit(0);

const mints = /\b(signSession|SignJWT)\s*\(|\bjwt\.sign\s*\(/.test(text);
const plants = /localStorage\.setItem\(\s*['"`]oauth_session/.test(text);
const usesSecret = /\bAUTH_SECRET\b/.test(text);
if (plants || (mints && usesSecret) || (mints && !/^(utils|api)\//.test(rel))) {
	process.stdout.write(JSON.stringify({
		hookSpecificOutput: {
			hookEventName: 'PreToolUse',
			permissionDecision: 'deny',
			permissionDecisionReason:
				`Refusing to write session-minting or session-planting code to ${rel || file}. ` +
				'Never forge credentials or bypass Google sign-in (~/.claude/CLAUDE.md, Verification). ' +
				'For screens behind sign-in, /verify-ui hands David a checklist.',
		},
	}));
}
