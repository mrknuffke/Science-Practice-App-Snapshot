# BIOLOGY_DEV_GUIDE.md: SAS General Biology (book appendix)

> **Scope:** only what is specific to the **SAS General Biology** textbook in
> `public/bio/`. Everything the three books share is in
> [`STYLE_STANDARD.md`](STYLE_STANDARD.md). Start any work here with the
> `textbook-work` skill.

Written 2026-10-07. Rewritten 2026-10-12 as an appendix to the standard.

## 1. What this book is

A zero-build static site: plain HTML, CSS and classic scripts. Served at `/bio/`
from the main Vercel deployment, and at `bio.sciencepractice.app` through a
redirect in `vercel.json`.

Scope: **Unit 1 (Homeostasis)**, four lessons and a review packet, and **Unit 2
(Ecology and the Carbon Cycle)**, nine lessons and two review packets. Unit 2 has two parts that share
one dashboard card: 2a, the carbon cycle (lesson ids `2a-*`), and 2b, ecology
(`2b-*`), matching the PLC's own unit names. Genetics and Microevolution are
staged in `docs/textbook/references/bio/`.

Unit 2 sources: the PLC's materials are in `docs/textbook/bio-sources/unit-2/`,
never under `public/` (everything there is served on the live site, answer keys
included).
The PLC's summative assessments stay out of the book: no lesson reuses their
scenarios, data or questions. Cheatgrass is the HS-LS2-1 formative, so no lesson
uses it either. The unit's anchor is Singapore's rainforest and the species it
has lost; the SAS campus forest plots and the Singapore tiger story are summative
scenarios, so no lesson uses them. Every data value in a Unit 2 lesson names its source under the
table.

## 2. The code

Bio runs on the shared runtime in `public/textbook/` (session 4a). Every lesson
loads, in this order: `theme-boot.js` in the head, then `base.css`, `lesson.css`,
the book's `tokens.css` and `components.css`, then `book.js`, `core.js`,
`widgets.js`, `sim.js`, `glossary.js` and the lesson's own script.

- **`public/bio/assets/tokens.css`**: tokens only (the standard's tokens plus the
  bio families `--glucose`, `--oxygen`, `--co2`, `--water`, `--atp`, `--thermal`,
  `--hormone`) in both themes.
- **`public/bio/assets/components.css`**: layouts only bio uses: the two-card
  grid, the sim legend swatches, the review print rules, the dashboard and the
  colophon.
- **`public/bio/assets/book.js`**: sets `window.TB_BOOK` (book id, brief label,
  `progress: false`) and holds the dashboard code. Bio stores no progress.
- **`public/bio/assets/glossary.js`**: sets `window.TB_GLOSSARY`.
- **Lesson scripts** `1-1.js` to `1-4.js`, `2b-2.js`, `2b-4.js`, `2b-6.js` and `2a-2.js`: one sim each, all on `TB.sim.create`.
  A fix to a shared behaviour goes in `public/textbook/`, never in a lesson script.
- Bio is "finished" in `services/__tests__/textbookStandard.baseline.json`: its
  sims and questions meet every strict guard test.

The four sims (briefs in [`textbook-sim-briefs.md`](../plans/textbook-sim-briefs.md)):

| Lesson | Model | Numbers |
|---|---|---|
| 1-1 | Traces every atom of one glucose and six oxygen molecules in and out. | Units on a fixed schedule; counts over 10 s are whole numbers. |
| 1-2 | A feedback loop over time: sensed temperature, four responses, heat balance, humid air. | The set point and band are the lesson's 37.0 and 36.5 to 37.5 °C. |
| 1-3 | The ADH loop with closed-loop curves. | Fitted to pass through the lesson's table at 0, 30, 60 and 90 min. The clock stops at each mark. |
| 1-4 | The insulin and glucagon loop for Healthy, Type 1 and Type 2. | Healthy and Type 1 are fitted to pass through the OGTT table's Patients A and C at 30, 60 and 120 min. Type 2 has its own invented curve (130, 205, 230, 212 mg/dL), because the table's Patient B is pre-diabetic. The clock stops at 120 min. |
| 2b-2 | Two reefs with the lesson's Table 2 counts (6, 6, 6, 6, 6 and 26, 1, 1, 1, 1). A disease kills one species, its deaths spread evenly over 4 s; the clock then holds. | Any of the five species can sicken. Clownfish: Alpha 24 fish, Beta 4. Any other species: Alpha 24, Beta 29. Four species left each time. The fish layout is seeded. Clownfish red is `--rose`, kept off `--bad`. |
| 2b-4 | 1,000 units of energy in the plants pass up three levels with Table 1's step sizes (3,368/20,810, 383/3,368, 21/383) or 10% each, each level rounded to a whole unit; the clock holds after each transfer. | Silver Springs: 1,000, 162, 18, 1. 10% every step: 1,000, 100, 10, 1. |
| 2b-6 | A teaching model: K = 1,200 - 14.5 x (days on land - 105), a straight line through the 1987 and 2021 counts; yearly logistic steps N + 0.06 N (1 - N/K) from 1,200 bears; the clock holds at year 40. The year clock and weight bar show Pilfold's 1 kg a day and do not drive the numbers. | Year 40: 105 days 1,200; 145 days 645; 180 days 120. |
| 2a-2 | A teaching model: each year the air gains emissions minus uptake, and uptake = C x (air carbon - 1750 air carbon), with C fitted so 2023 gives 5.2 GtC (ocean 2.9, land 2.3). Emissions are a share of 2023's 11.1 GtC (fossil 10.1, land use 1.0). 1 ppm = 2.124 GtC. The clock holds at 2063. | 2063: 100% 500 ppm, 50% 424, 0% 348. Year 0 at 100% reproduces the 2023 row (gain 5.9). |

Lesson 2a-1 section 04 links to the Simulations Hub's Tracking a Carbon Atom
(`?page=carbon_journey`, stages 1 and 2) instead of a textbook sim. Its close-ups
name ATP, NADPH and the Calvin cycle, past the HS-LS1-5 boundary, so the lesson
says the steps are not needed. Lesson 2a-2 section 02 links the same sim's stages 3 to 5.

Lesson 2b-2 section 05 also links to the Simulations Hub's Island Biogeography
sim (`?page=island_biogeography`, React app). It is calibrated to the lesson's
Table 1: Krakatoa settles at 34 bird species and Surtsey at 15. If Table 1
changes, change `KRAKATOA` and `SURTSEY` in
`components/simulations/islandBiogeography/islandEngine.ts` to match.

When you change a sim constant in 1-3 or 1-4, refit it: the table values must
still come out exactly, because one set of numbers is Sim Standard item 12.

## 3. Colours

| Token | Light | Dark |
|---|---|---|
| `--accent` (emerald) | `#059669` | `#10B981` |
| `--good` | `#059669` | `#10B981` |
| Subject families | `--glucose`, `--oxygen`, `--co2`, `--water`, `--atp`, `--thermal`, `--cool`, `--hormone`, `--rose` (2b-2 clownfish only) | |

`--thermal` is orange (`#EA580C`, dark `#FB923C`), never the `--bad` red, because sims fill with it.

In bio the accent and `--good` are the same green. That is why the standard
marks a selected option with an ink border and never with the accent.

Photos live in `public/bio/assets/photos/`, sized to 1600 px wide, with the
photographer and licence in the figure caption and in `about.html`.

## 4. Special tools

None. Bio has no reference drawer.

## 5. Performance expectations

| PE | Pages | Assessment boundary |
|---|---|---|
| HS-LS1-7 | 1-1, review | Should not include identification of the steps or specific processes involved in cellular respiration. |
| HS-LS1-2 | 1-2, 1-3, 1-4, review | Does not include interactions and functions at the molecular or chemical reaction level. |
| HS-LS1-3 | 1-2, 1-3, 1-4, review | Does not include the cellular processes involved in the feedback mechanism. |
| HS-LS2-2 | 2b-1, 2b-2, 2b-3, 2b-review | Assessment is limited to provided data. |
| HS-LS2-7 | 2b-1, 2b-review | None stated. |
| HS-LS2-4 | 2b-4, 2b-5, 2b-review | Assessment is limited to proportional reasoning to describe the cycling of matter and flow of energy. |
| HS-LS2-1 | 2b-6, 2b-7, 2b-review | Assessment does not include deriving mathematical equations to make comparisons. |
| HS-LS1-5 | 2a-1, 2a-review | Assessment does not include specific biochemical steps. |
| HS-LS2-5 | 2a-2, 2a-review | Assessment does not include the specific chemical steps of photosynthesis and respiration. |

The verbatim PE statements are in `docs/textbook/references/bio/`. Full wording of each
clarification statement is in
[the rewrite plan](../plans/textbook-rewrite-plan.md), section 2.

Course decisions (2026-10-12):
- Organ and hormone names (hypothalamus, pituitary, pancreas, insulin, glucagon,
  ADH) are core and are defined in the glossary.
- Cell-level detail is cut, except one Enrichment block in 1-3 (how a kidney
  cell lets more water through) and one in 1-4 (how insulin lets glucose into a
  cell).
- "30-32 ATP", Complex IV and the citric acid cycle are out of core.

## 6. Adding a lesson

1. Write `lessons/<slug>.html` and, if it has a sim, `lessons/<id>.js`.
2. Add the lesson to `public/bio/lessons.json` with `id`, `slug`, `title`,
   `unit`, `level`, `pes` and `description`. The dashboard renders from that
   file.
3. `npm run preflight` checks that every lesson exists, is linked from the
   dashboard and opens without errors.

## 7. Records

A student-visible change needs an entry in both `docs/textbook/CHANGELOG.md` and
`public/bio/about.html` section 06.
