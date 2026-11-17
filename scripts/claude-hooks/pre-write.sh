#!/usr/bin/env bash
# Claude Code PreToolUse hook (Write|Edit): refuses writing session-minting code
# outside the app's real auth implementation.
#
# pre-bash.sh can only see a command line; `npx tsx scripts/mint.ts` carries no
# auth words of its own. This closes that gap from the other end: code that
# signs a session, or plants one in localStorage, may only be written in the
# files that implement sign-in for real.
set -uo pipefail
cd "$(dirname "$0")/../.."

node scripts/claude-hooks/pre-write-check.cjs "$PWD"
exit 0
