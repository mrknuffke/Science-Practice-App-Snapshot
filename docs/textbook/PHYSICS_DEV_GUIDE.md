# PHYSICS_DEV_GUIDE.md: SAS General Physics (book appendix)

> **Scope:** only what is specific to the **SAS General Physics**
> textbook in `public/physics/`. Everything the three books share is in
> [`STYLE_STANDARD.md`](STYLE_STANDARD.md). Start any work here with the
> `textbook-work` skill.

Rewritten 2026-10-12 as an appendix to the standard. The first version
(2026-09-20) gave this book its governing document, route check, smoke test and
drift guards.

## 1. What this book is

A zero-build static site: plain HTML, CSS and classic scripts. Served at
`/physics/` from the main Vercel deployment, and at `physics.sciencepractice.app`
through a 301 in `vercel.json`.

Scope: **Level 1 (Kinematics)**, 3 lessons and a review packet, and **Level 2
(Force Frontier)**, 5 lessons and a review packet. Later levels are on hold
pending feedback from the Physics PLC.

## 2. Today's code (since Phase 4, session 4b)

Physics runs on the shared runtime in `public/textbook/` (`theme-boot.js`,
`base.css`, `lesson.css`, `core.js`, `widgets.js`, `sim.js`) in the load order of
[`RUNTIME_SPEC.md`](RUNTIME_SPEC.md) section 2.3. The book's own files are in
`public/physics/assets/`:

- `tokens.css` (tokens only) and `components.css` (physics-only components).
- `book.js` (`window.TB_BOOK`: book name, level names, the dashboard).
- `glossary.js` (`window.TB_GLOSSARY`, entries are `{term, definition}`).
- `draw.js` (`window.PD`): arrows, boxed labels, graph axes, chip groups. A
  physics-only tool (RUNTIME_SPEC 2.2); a sim's own script owns its model.
- `reference-center.js`: the equation sheet, constants and calculator drawer.

Every sim is `lessons/<lesson>.js`, built on `TB.sim.create`, with its model
checked headlessly before it shipped. A fix to the shared runtime reaches physics
and bio. A fix here reaches physics only. Do not copy code in from chem.

## 3. Colours

| Token | Light | Dark |
|---|---|---|
| `--accent` (cobalt) | `#2563EB` | `#3B82F6` |
| `--good` | `#2E7D57` | `#34D399` |
| Subject families | `--vector`, `--vector-alt`, `--vector-net`, `--kinematics`, `--potential`, `--kinetic`, `--thermal`, `--cool`, `--hot` | |

## 4. Book theme

The book is titled SAS General Physics, like the other two books. It keeps its
level names and its mission names ("Operation Projectile Precision", "Solo
Trial Review"). Instructions, feedback,
explanations, section labels and buttons use the plain teacher register. No
"Cadet Directive" or "Boss Challenge" in working text (standard, section 8.5).

## 5. Special tools

- **Reference Center** (`assets/reference-center.js`): equation sheet,
  constants, graphing patterns, calculator. Loaded by every page. Physics-only.

## 6. Performance expectations

| PE | Pages | Assessment boundary |
|---|---|---|
| HS-PS2-1 | all ten | Limited to one-dimensional motion and to macroscopic objects moving at non-relativistic speeds. |
| HS-PS2-2 | 2-3 | Limited to systems of two macroscopic bodies moving in one dimension. |

Course decisions (2026-10-12):
- Trigonometry is not assumed. Angled forces, component equations, tilted
  coordinates and the critical angle are Enrichment.
- Motion in two dimensions (lesson 1-3 sections 03 and 04, and the review's
  projectile problem) is Enrichment.
- The tangent-line construction in 1-2 is Enrichment.
- Lesson 2-3 carries a core section on conservation of momentum.

Full wording of each PE is in
[the rewrite plan](../plans/textbook-rewrite-plan.md), section 2.

## 7. Adding a lesson

1. Write `lessons/<id>_<slug>.html` and, if it needs behaviour, `lessons/<id>.js`.
2. Add an entry to `lessons.json` with `id`, `slug`, `title`, `unit`, `level`,
   `pes`, `description`. The dashboard renders from that file.
3. `npm run preflight` checks that every lesson in `lessons.json` exists, is
   linked from the dashboard and opens without errors.

## 8. Records

A student-visible change needs an entry in both `docs/textbook/CHANGELOG.md`
(engineering) and `public/physics/about.html` section 06 (public).

## 9. Known gaps

- No spaced repetition and no print path for lessons. Deliberate for now.
- Level 2 lessons have no figures and no glossary terms. Glossary terms are
  added in session 4b. Figures are not part of the consistency project.
