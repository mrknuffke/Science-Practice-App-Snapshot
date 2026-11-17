---
trigger: always_on
---

# Development & Verification Workflow

**The rules are not in this file.** They live in the repo root, where every agent
and every human reads them:

- [`/CLAUDE.md`](../../CLAUDE.md) — conventions, verification rules, scope
  protocol, local-first iteration loop, the push gate, deploy safety, collaboration style.
- [`/docs/RENDERING_GOTCHAS.md`](../../docs/RENDERING_GOTCHAS.md) — every content
  and rendering invariant, each with the bug that produced it and the check that
  now guards it.

Read both before writing code.

## Why this file is a pointer

Until 2026-09-20 this file carried its own copy of the rendering invariants, in a
format only Antigravity loads. The two sets drifted: this file held rules
`RENDERING_GOTCHAS.md` had never heard of, and two of them were being violated in
the shipped textbook at the time, because the file that named the rule was not the
file anyone was told to read.

**Do not add rules here.** Add them to `RENDERING_GOTCHAS.md` (invariants) or
`CLAUDE.md` (workflow), with a guard, in the same commit. A drift guard in
`services/__tests__/docsIntegrity.test.ts` fails if this file grows back into a
second rulebook.
