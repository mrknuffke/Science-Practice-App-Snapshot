#!/usr/bin/env bash
# Claude Code PostToolUse hook (Edit|Write), async with rewake: project-wide
# checks too slow to block on (~5s+), run after edits to the files they cover.
# Exit 2 wakes Claude with the failure.
#
#   .ts/.tsx                           -> tsc -b (the whole project typechecks)
#   manifests, counts, model names     -> the source-of-truth drift guards
set -uo pipefail
cd "$(dirname "$0")/../.."

FILE="$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write((j.tool_input&&j.tool_input.file_path)||"")}catch{}})')"
REL="${FILE#"$PWD"/}"
case "$REL" in /*|"") exit 0 ;; esac

RUN_TSC=0
RUN_DRIFT=0
case "$REL" in
	*.ts|*.tsx) RUN_TSC=1 ;;
esac
case "$REL" in
	README.md|CLAUDE.md|public/chem/lessons.json|public/chem/index.html|public/chem/assets/core.js|constants/*|services/ai/core.ts|*.tsx)
		RUN_DRIFT=1 ;;
esac
[ "$RUN_TSC$RUN_DRIFT" = "00" ] && exit 0

# One run at a time; a later edit's pre-push preflight catches anything missed.
LOCK="${TMPDIR:-/tmp}/spa-post-edit-async.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
	[ -n "$(find "$LOCK" -maxdepth 0 -mmin +10 2>/dev/null)" ] && rm -rf "$LOCK" && mkdir "$LOCK" || exit 0
fi
trap 'rm -rf "$LOCK"' EXIT

FAILED=0
if [ "$RUN_TSC" = "1" ] && ! OUT="$(npx --no-install tsc -b 2>&1)"; then
	{ echo "TypeScript errors after editing $REL (tsc -b):"; echo "$OUT" | head -25; } >&2
	FAILED=1
fi
if [ "$RUN_DRIFT" = "1" ] && ! OUT="$(npx --no-install vitest run services/__tests__/sourceOfTruth.test.ts 2>&1)"; then
	{
		echo "Source-of-truth drift guard failed after editing $REL:"
		echo "$OUT" | grep -E "✗|×|FAIL|AssertionError|expected|Expected|Received" | head -20
		echo "Render counts and model names from their registries; never type them into copy."
	} >&2
	FAILED=1
fi
[ "$FAILED" = "1" ] && exit 2
exit 0
