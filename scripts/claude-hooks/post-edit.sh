#!/usr/bin/env bash
# Claude Code PostToolUse hook (Edit|Write): fast checks on the file just edited.
# Exit 2 hands stderr back to Claude so the problem is fixed in the same turn.
# Slow, project-wide checks live in post-edit-async.sh.
set -uo pipefail
cd "$(dirname "$0")/../.."

FILE="$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write((j.tool_input&&j.tool_input.file_path)||"")}catch{}})')"
[ -n "$FILE" ] || exit 0
REL="${FILE#"$PWD"/}"
# Only this repo's files.
case "$REL" in /*) exit 0 ;; esac
[ -f "$REL" ] || exit 0

case "$REL" in
	*.ts|*.tsx|public/chem/*.js|scripts/*.mjs)
		# --fix applies safe autofixes; errors that remain come back to Claude.
		# Warnings (the repo carries ~1,170) are not reported. Per the two-attempt
		# rule, if the same error survives two fixes, stop and show David.
		if ! OUT="$(npx --no-install eslint --fix --quiet "$REL" 2>&1)"; then
			{ echo "ESLint errors in $REL:"; echo "$OUT" | head -20; } >&2
			exit 2
		fi
		;;
esac

# Sort-classify category labels render with textContent, so markup authored into
# one shows up as literal tags. (Shipped in lesson 1-2c; see
# docs/RENDERING_GOTCHAS.md.) Chemistry notation belongs in Unicode: CO₂, SO₄²⁻.
case "$REL" in
	public/chem/lessons/*.js|public/chem/lessons/*.html)
		if ! HITS="$(node scripts/claude-hooks/check-sort-labels.mjs "$REL")"; then
			{
				echo "HTML markup inside a sort-classify category label (renders as literal text):"
				echo "$HITS" | head -10
				echo "Use Unicode sub/superscripts (₀₁₂₃₄ ⁺⁻²³) or plain text instead."
			} >&2
			exit 2
		fi
		;;
esac
exit 0
