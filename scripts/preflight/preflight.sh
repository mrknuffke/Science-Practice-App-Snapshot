#!/usr/bin/env bash
# Preflight: the gate every push must pass. Run by the git pre-push hook
# (.githooks/pre-push), by .github/workflows/preflight.yml, and by /ship.
#
# Every push to main deploys sciencepractice.app, including the chemistry
# textbook at /chem/. This runs the full `npm run verify` under the production
# Node major, checks the edge functions stay edge-safe, serves the production
# build, requests every public route and every textbook lesson, and runs the
# browser smoke suite against it.
#
#   npm run preflight
#   PREFLIGHT_CLEAN=1 npm run preflight              # npm ci first (CI does this)
#   PREFLIGHT_SKIP_BROWSER=1 npm run preflight       # no Playwright
#   PREFLIGHT_PLAYWRIGHT_ARGS=--update-snapshots npm run preflight   # re-baseline
set -euo pipefail
cd "$(dirname "$0")/../.."

PORT="${PREFLIGHT_PORT:-4499}"
BASE="http://127.0.0.1:${PORT}"
PROD_NODE="$(tr -d '[:space:]v' < .nvmrc)"
LOG="$(mktemp -t spa-preflight-serve.XXXXXX)"
SERVER_PID=""

step() { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }
fail() { printf '\n\033[31m✗ PREFLIGHT FAILED: %s\033[0m\n' "$*" >&2; exit 1; }
cleanup() { [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true; }
trap cleanup EXIT

# A real binary path, not `npx ... node`: npx forks, so a backgrounded npx PID
# is not the server's, and killing it would orphan the server. (That exact bug
# once let a stale server answer MyWebsite's preflight and report a false pass.)
if [ "$(node -p 'process.versions.node.split(".")[0]')" = "$PROD_NODE" ]; then
	PROD_NODE_BIN="$(node -p 'process.execPath')"
else
	PROD_NODE_BIN="$(npx -y -p "node@${PROD_NODE}" node -p 'process.execPath')"
fi
PROD_BIN_DIR="$(dirname "$PROD_NODE_BIN")"

step "Runtime: builds on Node ${PROD_NODE} (.nvmrc, matches CI); local is $(node -v)"

if [ "${PREFLIGHT_CLEAN:-0}" = "1" ]; then
	step "Clean install"
	npm ci
fi

step "npm run verify under Node ${PROD_NODE} (tsc -b, lint, vitest incl. drift guards, vite build)"
PATH="${PROD_BIN_DIR}:${PATH}" npm run --silent verify || fail "npm run verify"

# api/*.ts run on Vercel's edge runtime, which has no Node built-ins. A Node
# import there builds and typechecks fine locally and fails only when deployed.
step "Edge functions use no Node built-ins"
if grep -nE "from ['\"](node:[a-z_]+|fs|path|os|child_process|http|https|net|crypto)['\"]|require\(['\"](node:|fs|path|os|crypto)" api/*.ts; then
	fail "an edge function imports a Node built-in (above)"
fi

# Auth must never depend on the Host header: a deployment URL can contain any
# string (a preview for a branch named "localhost-*"). Both api/verify.ts and
# api/gemini.ts once skipped sign-in for "localhost" hosts; removed Sept 2026.
step "Edge functions do not skip auth by hostname"
if grep -nE "host[^;]*\.includes\(['\"](localhost|127\.0\.0\.1)" api/*.ts; then
	fail "an edge function branches on a localhost Host header (above) - enforce auth unconditionally"
fi

step "Serve the production build"
# Refuse to start if something already answers: the checks would test that instead.
if curl -s -o /dev/null --max-time 2 "$BASE/"; then
	fail "port ${PORT} already in use (stale preflight server?) - run: pkill -f 'vite.js preview --port ${PORT}'"
fi
"$PROD_NODE_BIN" node_modules/vite/bin/vite.js preview --port "$PORT" --strictPort --host 127.0.0.1 >"$LOG" 2>&1 &
SERVER_PID=$!
READY=0
for _ in $(seq 1 60); do
	kill -0 "$SERVER_PID" 2>/dev/null || { cat "$LOG"; fail "preview server exited during boot"; }
	if curl -s -o /dev/null --max-time 2 "$BASE/"; then READY=1; break; fi
	sleep 1
done
[ "$READY" = "1" ] || { cat "$LOG"; fail "preview server not ready within 60s"; }

step "Routes"
node scripts/preflight/check-routes.mjs "$BASE" || fail "route checks"

if [ "${PREFLIGHT_SKIP_BROWSER:-0}" != "1" ]; then
	step "Browser smoke suite"
	PREFLIGHT_BASE_URL="$BASE" npx --no-install playwright test ${PREFLIGHT_PLAYWRIGHT_ARGS:-} \
		|| fail "smoke suite"
fi

printf '\n\033[32m✓ preflight passed\033[0m (Node %s build, %s)\n' "$PROD_NODE" "$BASE"
