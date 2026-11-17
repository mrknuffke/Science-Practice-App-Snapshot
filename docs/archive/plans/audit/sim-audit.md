# Simulation audit (2B)

Phase 2 of [the consistency plan](../textbook-consistency-fixes.md), scored against
Appendix A (the Sim Standard, 21 items) as David approved it on 2026-10-08.
Scope is decision D4: the three textbooks only. Read-only. Bio first, then
physics, then chem.

**Status:** all three books done: bio 4 sims, physics 15 units (18 canvases), chem 17 sims (15 canvases).

## How to read this report

- **Result codes:** Pass, Partial, Fail, N/A. A Pass needs evidence in the code or
  the page. A Fail names the line or the missing element.
- **Citations:** `1-2.js:319` is a line in `public/bio/lessons/1-2.js`.
  `1-2.html:268` is a line in the lesson page. Line numbers are from commit
  `59ef11b`.
- **"Seed" means a finding from the plan (S1 to S9).** I confirmed each seed
  against the code only far enough to cite its line. I did not re-derive them.
  **"New" means a finding the seed list did not contain.**
- **Layout claims are by calculation** (font size times character count against
  a panel width), not from a browser. At 360px the sim canvas is about 278px
  wide: 360px, minus a 20px page gutter on each side, minus 20px card padding on
  each side, minus borders.
- **Science and logic flags are questions for David.** Nothing here is a
  correction.
- **Recommendations.** *Keep*: no Fail in groups B to D, so only the shared
  guidance and accessibility additions are needed. *Repair*: at least one Fail
  in B to D that a targeted fix removes. *Redesign*: a Fail in the model itself
  (the sim teaches something the lesson contradicts) or content that sits
  outside the PE boundary at its core.
- **Draft briefs** are one paragraph each, written to the plan's brief format
  (what it shows, what the student changes, predicts and records, what they
  should see, the question it answers). Phase 3 sets policy; these are inputs.

## Items checked (Appendix A)

A1 question first, A2 predict before touching, A3 try-this steps, A4 what to look
for, A5 use the evidence, A6 legend, B7 no contradiction with the lesson, B8
conservation, B9 readouts match visuals, B10 consistent start state, C11 time-based
loop, C12 `GC_REGISTER_ANIMATION`, C13 paths chosen once and pre-warm, C14
readable speeds, D15 shared sim shell, D16 one control per variable and class-based
active state, D17 colours from tokens, D18 canvas text 11px or more in loaded
fonts with Unicode notation, D19 no label overlaps, D20 works at 360px and in both
themes, E21 accessibility.

---

# Part 1: Bio (`public/bio/`)

## Seed findings, confirmed with citations (not re-derived)

| Seed | Confirmed at | Note |
|---|---|---|
| S1 per-frame motion | 1-1 `1-1.js:671` (`simTime += 0.016`), `:125-126`; 1-2 `1-2.js:319`; 1-3 `1-3.js:320`; 1-4 `1-4.js:179` (physiology steps once per frame), `:316`, `:332` | 1-2 and 1-3 take an overall time from the rAF timestamp (`1-2.js:165`, `1-3.js:143`) but still advance particles per frame. |
| S1 not registered | 1-2 `1-2.js:625`, 1-3 `1-3.js:474`, 1-4 `1-4.js:507` call `requestAnimationFrame` directly. 1-1 registers at `1-1.js:733-737` | `isRunning` is set to true and never cleared in all three (`1-2.js:29`, `1-3.js:25`, `1-4.js:26`). |
| S1 text under 11px | 1-1: 7 to 10px (`1-1.js:220`, `:396`, `:547`, `:639`). 1-2: 9 to 13px. 1-3: 7 to 12px (`1-3.js:310`). 1-4: 8 to 13px (`1-4.js:454`) | |
| S1 fonts | 1-1 uses `IBM Plex Sans` (not loaded, `1-1.js:399`, `:421`, `:547`, `:639`). 1-2 to 1-4 use `system-ui`. The book loads Hanken Grotesk, Spectral and IBM Plex Mono only (`tokens.css:7`) | |
| S2 jitter | `1-1.js:125` (speed redrawn every frame), `:130-133`, `:166-167`, `:180-181` (endpoints redrawn every frame) | |
| S3 workload | `1-1.js:101` (`maxMolecules = 55`), `:125` | |
| S4 collisions | `1-1.js:664`, `:630-641`, `:547-549`, `:36` | |
| S5 controls | `1-1.html:184-196`, `1-1.js:88-94`, `1-1.html:214` against `1-1.js:54` | |
| S6 matter | `1-1.html:153-155`, `1-1.js:143-150` | |
| S7 start state | `1-2.js:19-20`, `:80-86`, `:133-144`, `1-2.html:279`, `:295` | |
| S8 osmoregulation | `1-3.js:50` (`vx` never applied), `:323`, `:316`, `:300`, `:210-217` | |
| S9 glucose | `1-4.js:455` (label), `:73-78` (Type 1 leaves glycogen alone) | The green bar was seen on a screenshot; I did not trace it to a draw call. |

---

## Sim 1-1: Dual-Scale Respiration Engine

**Where:** Book bio, lesson 1-1, section 03 (`1-1.html:161-232`). **Code:**
`initRespirationSim` in `1-1.js` (class `RespirationParticle` at `:103`; draw
functions `drawSwimmer` `:292`, `drawCapillaryBed` `:407`, `drawMyofibrils`
`:486`, `drawMitochondrion` `:555`; loop `render` `:670`).
**Learning target:** HS-LS1-7.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | Section intro (`1-1.html:169-171`) describes the screen. The question ("What chemical transformations...", `:103`) sits in section 01. |
| A2 | Predict before touching | Fail | First prediction box is section 04 (`:248`), after the sim. |
| A3 | Try this | Fail | No numbered steps. |
| A4 | What to look for | Fail | No per-step expectations. The legend (`:219-228`) names parts. |
| A5 | Use the evidence | Partial | Check 1 (`:248-275`) can be answered from the O2 and CO2 readouts, but it never points at the sim. |
| A6 | Legend | Partial | Legend exists (`:219-228`). It has no entry for the amber spark (`1-1.js:197-199`), the C6 label (`:224`), Z-discs, actin or myosin (`:509-544`). It says red blood cells release "glucose (green hexagons)" (`:222`), while `drawCapillaryBed` draws the cells only moving and the particles come from `RespirationParticle`. |
| B7 | No contradiction with lesson | Fail | Seed S6. |
| B8 | Conservation | Fail | Seed S6. Atoms are not traced: the type changes at random (`:143-150`). |
| B9 | Readouts and visuals match | Fail | Seed S3. **New:** the readouts disagree with each other (see flags). |
| B10 | Consistent start state | Fail | Seed S5 (`1-1.html:214` against `1-1.js:54`). |
| C11 | Time-based loop | Fail | `simTime += 0.016` per frame (`:671`). No `dt`, no clamp. |
| C12 | Registered | Pass | `1-1.js:733-737`. |
| C13 | Paths once per leg; pre-warm | Fail | Seed S2. Pre-warm is partial: progress is random (`:285`) but every particle is in the inflow stage, which is the smear in S3. |
| C14 | Readable speeds | Fail | Seed S2: endpoints change every frame, so no particle can be followed. At Level 3 a leg takes about 1 to 1.8 seconds on a 60Hz display (`:125`, speed 0.0093 to 0.0146 per frame). |
| D15 | Shared sim shell | Partial | Uses `.sim-box`, `.sim-stage`, `.sim-controls` (`:173-178`) in the Appendix A order (stage, controls, tiles, legend). The tiles and legend are inline styled (`:199-228`). |
| D16 | One control per variable; class-based active | Fail | Seed S5. Buttons and the slider drive one variable (`:741-757`). Active state is inline style set from JS (`:88-94`). |
| D17 | Colours from tokens | Fail | 76 hex and 31 `rgba()` in `1-1.js`; 0 `getComputedStyle` calls. Dark mode works by an `isDark` branch read every frame (`:677`), so a theme switch redraws, but the palette is not the book's tokens. |
| D18 | Canvas text | Fail | 7 to 10px (`:220`, `:251`, `:396-401`, `:418-423`, `:468`, `:498`, `:547`, `:635-664`). `IBM Plex Sans` is not loaded. ASCII stand-ins: `deg C` (`:63`, `:401`, `:664`), `->` (`:470`, `:664`), `O2` (`:423`), `VO2` (`:52`, `:61`, `:70`). |
| D19 | No label overlaps | Fail | Seed S4. |
| D20 | 360px and both themes | Partial | Both themes handled in code. At 360px, seed S4: `cssHeight = max(340, w * 0.52)` (`:36`) gives 340px high and 278px wide for four panels. |
| E21 | Accessibility | Partial | Slider has `aria-label` (`:196`). Pass: `<button>` elements. Fail: no `aria-pressed` on presets, no `aria-live` on the four tiles (`:199-216`), no text alternative on the canvas (`:175`), preset buttons about 29px tall (`:185`). |

**Science and logic flags (questions for David; not fixed):**

1. **Readouts disagree with each other.** O2 uptake and "% VO2 max" imply three
   different maximums: 0.35 L/min at 15% gives 2.3 L/min; 1.85 L/min at 55% gives
   3.4 L/min; 3.45 L/min at 92% gives 3.75 L/min (`1-1.js:52`, `:61`, `:70`).
   (New.)
2. **ATP and O2 move by different ratios.** ATP rises 4.0x then 8.2x (`:60`,
   `:69`). O2 rises 5.3x then 9.9x (0.35, 1.85, 3.45 L/min). If ATP comes from O2
   the two should move together. (New.)
3. **ATP magnitude against the review.** The review states 30 to 32 ATP per
   glucose (`1-review_packet.html:171`), which is about 5 ATP per O2. 0.35 L/min
   of O2 is about 15.6 mmol/min, so about 78 mmol/min of ATP. The sim's baseline
   reads 1.2 mmol/min (`1-1.js:51`), roughly 65 times lower. (New. Worth checking
   the intended unit before the redesign.)
4. **Leaf disc data (`1-1.html:396-483`).** The lesson says discs float in the
   dark because of respiration gas. I could not tell whether the float assay
   normally measures photosynthetic oxygen in light. This may be the author's
   intended simplification. Flagged as a question, not an assertion.
5. **Bar heights match the stated values** (420 s, 180 s, 270 s at 0.45 px per
   second, `1-1.html:433-442`). No mismatch found.

**Recommendation: redesign.** D6 and D7 are decided; the findings support it.
Two of the four draw functions (`drawMyofibrils` and `drawMitochondrion`, about
180 of the 370 lines of drawing code) show structures and steps that the HS-LS1-7
assessment boundary excludes (see 2C).

**Draft brief.** *Question:* where do the atoms in glucose go, and where does
the energy go? *Shows:* one muscle cell. Inside it, one glucose and six oxygen
molecules arrive, their bonds rearrange, and six carbon dioxide and six water
molecules leave, while a meter shows energy carried off as ATP and as heat.
Every atom is a coloured dot that can be followed. *Student changes:* a single
workload control with three settings. *Predicts, then records:* before touching,
predict how many carbon dioxide molecules one glucose will make. Then fill a
before and after atom tally (carbon, hydrogen, oxygen) and read ATP and heat at
each setting. *Should see:* the tally matches before and after at every setting
(matter is rearranged, not lost), and more molecules per second pass through at
higher workload. *Answers:* "Where does the matter go, and what changes when the
muscle works harder?" Matter tracing is decision D6.

---

## Sim 1-2: Environmental Chamber and Vasomotor Simulator

**Where:** bio 1-2, section 04 (`1-2.html:260-338`). **Code:** `1-2.js`
(`updatePhysiology` `:66`, `render` `:163`, `drawSkinSection` `:197`,
`drawCapillaryLoop` `:291`, `drawSweatGland` `:350`, `drawHairFollicle` `:392`,
`drawBodyThermalMap` `:425`). **Learning target:** HS-LS1-2, HS-LS1-3.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | `1-2.html:268-270` is an instruction ("Adjust Leo's ambient environment..."). |
| A2 | Predict before touching | Fail | Checkpoints are section 05 (`:354`). |
| A3 | Try this | Fail | None. |
| A4 | What to look for | Fail | None. |
| A5 | Use the evidence | Fail | Checkpoint 1 (frostbite) and 2 (humidity, `:385`) cannot be answered from the sim. It has no humidity control and no extremity temperature. |
| A6 | Legend | Fail | None; meaning lives in on-canvas labels. |
| B7 | No contradiction with lesson | Partial | Checkpoint 2 teaches that high humidity stops sweat cooling, but the model always cools by sweating (`:96-102`, comment "Evaporative cooling stabilizes core temp"). Nothing in the model can fail that way. |
| B8 | Conservation | N/A | |
| B9 | Readouts and visuals match | Partial | Vessel radius (`:293`) and blood-cell speed (`:316`) track the diameter readout. Sweat droplets cap at 8 (`:372`) while the rate reaches about 1,000 mL/hr. |
| B10 | Consistent start state | Fail | Seed S7. State starts at `activityLevel: 'mod'` (`:20`) while "Rest (85W)" is marked active (`1-2.html:295`). |
| C11 | Time-based loop | Partial | `animTime` comes from the rAF timestamp (`:165`) and drives wind, droplets and tremor. Blood-cell progress is per frame (`:319`). No `dt`, no clamp. |
| C12 | Registered | Fail | Seed S1 (`:625`). |
| C13 | Paths once per leg; pre-warm | Partial | Cells keep a fixed offset and start staggered (`:47-51`). **New:** the cell position uses straight segments (`:324-332`) while the vessel is drawn as a curve (`:305-306`), so the dots cut across the vessel. |
| C14 | Readable speeds | Pass | A full loop takes 280 to 950 frames (`:316`, `:319`). |
| D15 | Shared sim shell | Fail | Inline wrapper (`1-2.html:273`); order is presets, controls, canvas, status, tiles. |
| D16 | One control per variable; class-based active | Partial | `.active` is a class (`:559-561`). Presets duplicate the slider and the exertion row (`:577-620`), by design as shortcuts. S7 shows the active marks and the model disagree at load. |
| D17 | Colours from tokens | Fail | 55 hex, 14 `rgba()`, 0 `getComputedStyle`. |
| D18 | Canvas text | Fail | 9 to 13px, `system-ui` (`:230`, `:247`, `:342`, `:386`, `:419`, `:507`, `:518`). Unicode ° and µ are used correctly (`:231`, `:344`). |
| D19 | No label overlaps | Fail | Seed S7 (hair shaft over EPIDERMIS and DERMIS labels, arteriole label on the vessel `:344`, Hypothalamus on the head `:519`, tremor text over the legs `:508`). |
| D20 | 360px and both themes | Fail | Canvas is fixed at 340px high (`1-2.html:305`). Skin panel is 58% of 278px = 161px; its longest header, `SUBCUTANEOUS ADIPOSE (Insulating Fat Layer)` (`:276`), is about 260px of 10px bold text. The body panel draws arms to ±65px and legs to y=283 in 140px of width (`:477-485`). Both themes are handled by branches. |
| E21 | Accessibility | Partial | `<button>` elements, slider has a `<label for>` (`1-2.html:290`). No `aria-pressed`, no `aria-live` on the status pill (`:309`) or tiles, no canvas alternative, pills about 29px tall. |

**Science and logic flags:**

1. **The model is a lookup, not a loop.** Every output is an algebraic function
   of ambient temperature and exertion (`updatePhysiology` `:66-114`). Nothing
   changes over time, so core temperature never dips and recovers. The lesson's
   target is negative feedback (HS-LS1-3). A student can see the response but
   not the return. (New.)
2. **Humidity is taught but not modelled** (`1-2.html:385` against the missing
   control). (New.)
3. **Cold branch can raise core temperature.** At 18 °C and 280 W the core
   formula gives 37.2 °C (`:90`), above the 37.0 °C set point, while the status
   pill says equilibrium (`:143`). Part of S7. (New detail.)

**Recommendation: redesign.** The scene packs a skin cross-section and a whole
body into one 340px canvas, and the feedback loop the PE targets is not
visible.

**Draft brief.** *Question:* how does your body keep its core temperature steady
when the air gets hotter or colder? *Shows:* one body outline with a core
thermometer, and a live graph of core temperature against time. Four responses
light up on the body: shivering, goosebumps, skin vessels narrowing, sweating.
*Student changes:* air temperature, and a "humid air" switch. *Predicts, then
records:* before moving the slider, predict which responses switch on at 5 °C and
at 38 °C. Then record, for four air temperatures, which responses are on and what
the core temperature does over the first minute. *Should see:* core temperature
moves a little, a response switches on, and the line returns toward 37 °C (the
loop). With humid air on, sweating stays on but the line does not come back.
*Answers:* "What does a negative feedback loop do to a body variable over time?"

---

## Sim 1-3: Nephron Collecting Duct and Aquaporin Simulator

**Where:** bio 1-3, section 04 (`1-3.html:240-374`). **Code:** `1-3.js`
(`updatePhysiology` `:55`, `render` `:141`, `drawLumen` `:180`,
`drawEpithelialCell` `:240`, `drawMedullaAndCapillary` `:362`).
**Learning target:** HS-LS1-2, HS-LS1-3.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | `1-3.html:248-250` is an instruction. |
| A2 | Predict before touching | Fail | Checkpoints are section 05 (`:389`). |
| A3 | Try this | Fail | None. |
| A4 | What to look for | Fail | None. |
| A5 | Use the evidence | Fail | The ECR task uses the data table, not the sim (`:453`). |
| A6 | Legend | Fail | Pink dots, red and blue channel gates and the green receptor halves (`1-3.js:285-297`, `:337`, `:344`) are not explained. |
| B7 | No contradiction with lesson | Fail | Section 03 teaches a stimulus, response and return (`1-3.html:226-235`). The sim sets blood osmolarity directly from the slider (`1-3.js:60`), so ADH cannot be seen restoring it. Baseline and extremes also differ from the lesson's own data (flag 2). |
| B8 | Conservation | N/A | |
| B9 | Readouts and visuals match | Fail | Seed S8. Urine flow readout runs 0.25 to 13.7 mL/min (`:69`, `:76`), the picture is six lines (`:210`). |
| B10 | Consistent start state | Pass | Starting values agree with the page (`1-3.html:289-312`). It differs from the data table baseline (flag 2). |
| C11 | Time-based loop | Partial | Same pattern as 1-2 (`:143`, `:320`). |
| C12 | Registered | Fail | `:474`. |
| C13 | Paths once per leg; pre-warm | Fail | Seed S8: `vx` is never applied (`:50`, `:392-403`); water dots cross the whole cell on random rows (`:323`). Pre-warm is random (`:37`). |
| C14 | Readable speeds | Partial | At 140 channels a dot crosses in about 1.6 seconds (60Hz); at the maximum, about 0.8 seconds with 40 dots (`:317-320`). |
| D15 | Shared sim shell | Fail | Inline wrapper (`1-3.html:253`). |
| D16 | One control per variable | Fail | The three buttons and the slider drive the same variable (`1-3.js:441-469`). Labels read "-1000 mL" and "+500 mL" (`1-3.html:259`, `:265`) but each button moves the index by 3 steps (`:445`, `:455`). |
| D17 | Colours from tokens | Fail | 50 hex, 14 `rgba()`. Inline hex on the buttons (`1-3.html:258`, `:264`). |
| D18 | Canvas text | Fail | 7 to 12px, `system-ui`. `AQP2` is 7px (`1-3.js:310`). |
| D19 | No label overlaps | Fail | By calculation at 360px: `COLLECTING DUCT LUMEN` (`:200`, about 150px) in a 78px panel; `COLLECTING DUCT EPITHELIUM` (`:274`, about 175px) in a 122px panel. The next panel paints over the spill. |
| D20 | 360px and both themes | Fail | Fixed 340px canvas height (`1-3.html:284`); see D19. |
| E21 | Accessibility | Partial | The slider has no associated label: its text is a plain `<div>` (`1-3.html:275-279`). No `aria-pressed`, no `aria-live`, no canvas alternative. |

**Science and logic flags:**

1. **Seed S8 plus an extra contradiction.** At hydration index 3 and 4 the
   status says "ADH SUPPRESSED... Aquaporins Endocytosed" (`1-3.js:116-117`) and the
   gates are drawn closed (density 68 and 44, below the open threshold of 80,
   `:278`), yet water dots stream because the stream test is density > 40
   (`:316`). (New detail on the seed.)
2. **Sim against the lesson's own table.** The page tells students the data
   table is the "consensus dataset" (`1-3.html:322`).

   | | Sim start | Table start | Sim most dehydrated | Table at 90 min |
   |---|---|---|---|---|
   | Plasma osmolarity (mOsm/kg) | 290 | 288 | 330 (`:60`) | 304 |
   | Plasma ADH (pg/mL) | 2.5 | 1.8 | 8.3 | 8.2 |
   | Urine flow (mL/min) | 1.2 | 1.4 | 0.25 | 0.25 |
   | Urine osmolarity (mOsm/L) | 450 | 380 | 1,170 | 1,180 |

   (New.)
3. **The scenario text and the table disagree.** The hook says osmolarity "rises
   by only 4%" (`1-3.html:170`). The table gives 288 to 304, which is 5.6%.
   (New.)
4. **The sim only draws the cellular scale** (receptors, vesicles, channels).
   This is the level the HS-LS1-3 assessment boundary excludes. See 2C.

**Recommendation: redesign** at organ scale (decision D7).

**Draft brief.** *Question:* how does your body keep the water in your blood
steady after you sweat or drink? *Shows:* a simple body diagram: a sensor in the
brain, a gland under it, the bloodstream, a kidney and a bladder. A blood
concentration meter and a urine sample (volume and colour) sit alongside. A
hormone level bar (ADH) sits between brain and kidney. *Student changes:* two
buttons, "sweat 1 L" and "drink 1 L". *Predicts, then records:* before pressing,
predict whether urine will get darker or paler after sweating. Then record blood
concentration, hormone level and urine volume at 0, 30, 60 and 90 minutes (the
same four times as the lesson table). *Should see:* sweating raises blood
concentration, the hormone bar rises, urine gets darker and smaller, and the blood
concentration comes back down. Drinking does the reverse. *Answers:* "What does
the kidney change to keep blood water steady?" No channels, receptors or vesicles
appear, which matches the assessment boundary.

---

## Sim 1-4: Pancreatic Islet and Endocrine Seesaw Simulator

**Where:** bio 1-4, section 04 (`1-4.html:258-377`). **Code:** `1-4.js`
(`stepPhysiology` `:65`, `render` `:175`, `drawPancreasIslet` `:216`,
`drawBloodStream` `:289`, `drawHepatocyte` `:385`).
**Learning target:** HS-LS1-2, HS-LS1-3.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | `1-4.html:266-268` is an instruction. |
| A2 | Predict before touching | Fail | Checkpoints are section 05 (`:393`). |
| A3 | Try this | Fail | None. |
| A4 | What to look for | Fail | None. |
| A5 | Use the evidence | Partial | Checkpoint 1 (`:393-416`) can be tested with "- Fasting Drop", but the stem never says so. The ECR task uses the OGTT table (`:456`). |
| A6 | Legend | Fail | Green hexagon, purple dot and orange square (`1-4.js:322`, `:337`, `:342`) are not explained. |
| B7 | No contradiction with lesson | Partial | The lesson uses a 100 mg/dL baseline (`1-4.html:205`) and an 80 mg/dL trigger (`:215`) and a 70 to 110 band (`:183`). The sim uses a 90 set point, 105 and 85 trigger points (`1-4.js:69`, `:96`) and status cut-offs of 130 and 75 (`:150`, `:152`). Plus seed S9 (GLUT4 on the liver). |
| B8 | Conservation | Partial | Glucose falls by `excess * 0.04 + 0.3` per frame while glycogen rises by a fixed 0.12 per frame (`:93-94`). Nothing ties one to the other. Seed S9 for Type 1. |
| B9 | Readouts and visuals match | Fail | Hexagon count stops growing at 160 mg/dL (`:313`, `NUM_GLUCOSE = 36`), so 160 and 220 mg/dL look the same. |
| B10 | Consistent start state | Pass | 90 mg/dL, 10 µU/mL, 60 pg/mL, 15 mg/min, 72% match `1-4.html:302-325`. |
| C11 | Time-based loop | Fail | `stepPhysiology()` runs once per frame (`:179`). Recovery after a meal takes half the real time on a 120Hz display. Drift is per frame (`:316`, `:332`). |
| C12 | Registered | Fail | `:507`. |
| C13 | Paths once per leg; pre-warm | Partial | Each hexagon keeps its row (`:319`). Positions start random (`:45-46`). |
| C14 | Readable speeds | Pass | 0.4 to 0.9 px per frame is about 24 to 54 px/s (`:47`). |
| D15 | Shared sim shell | Fail | Inline wrapper (`1-4.html:271`). |
| D16 | One control per variable; class-based active | Pass | Mode uses a class (`:497-499`). The meal, fasting and reset buttons are events, not a duplicate slider. Note: Reset does not reset the mode (`:484-491`). |
| D17 | Colours from tokens | Fail | 56 hex, 6 `rgba()`. Inline hex on the buttons (`1-4.html:276`, `:279`). |
| D18 | Canvas text | Fail | 8 to 13px, `system-ui` (`:454` is 8px). |
| D19 | No label overlaps | Fail | By calculation at 360px: `PANCREATIC ISLET` (`:225`, about 110px) in an 83px panel; `LIVER HEPATOCYTE` (`:395`, about 110px) in a 95px panel. Plus the unlabelled bar in seed S9. |
| D20 | 360px and both themes | Fail | Fixed 340px height (`1-4.html:297`); three panels share 278px. |
| E21 | Accessibility | Partial | `<button>` elements. No `aria-pressed` on the mode buttons, no `aria-live`, no canvas alternative. |

**Science and logic flags:**

1. **Seed S9, plus where it comes from in code.** The liver panel draws a GLUT4
   gate (`1-4.js:411-417`, `:455`) and a header line "Glycogen Synthesis and
   Storage". Flag for David: GLUT4 on the liver (seed S9, his call).
2. **Healthy meal peak against the table.** One "High-Carb Meal Surge" adds 75
   mg/dL (`1-4.js:470`), so a healthy student reaches 165 mg/dL. The OGTT table
   gives a healthy peak of 138 mg/dL (`1-4.html:357`). (New.)
3. **Type 1 never recovers and its glycogen never moves** (seed S9; `:73-78`
   changes neither the glucose nor the reserve).
4. **Four different "normal" numbers on one screen:** 90 (set point and reset
   button label, `1-4.html:283`), 100 (hook text, `:205`), 70 to 110 (`:183`),
   85 to 105 (the sim's dead band, `1-4.js:96`, `:69`). (New.)

**Recommendation: redesign** at organ scale (decision D7).

**Draft brief.** *Question:* how does your body keep blood sugar steady after a
meal and between meals? *Shows:* four boxes joined by arrows: pancreas, bloodstream,
liver and muscle. A blood sugar line graph runs along the bottom, and two hormone
bars (insulin, glucagon) sit beside the pancreas. *Student changes:* "eat a meal"
and "skip a meal" buttons, and a three-way switch for Healthy, Type 1 and Type 2.
*Predicts, then records:* before eating, predict which hormone rises and whether
blood sugar will return to normal. Then record, for each of the three settings,
the peak blood sugar and the level two hours later (the same two numbers as the
OGTT table). *Should see:* healthy peaks and returns to normal; Type 1 stays high
because the insulin bar never rises; Type 2 returns slowly with a high insulin
bar. The liver store grows after the meal and shrinks between meals. *Answers:*
"What goes wrong with the blood sugar loop in Type 1 and Type 2?" No transporter
proteins appear.

---

## Bio sims: shared observations

- **All four autoplay and loop forever**, with no pause control and no
  `prefers-reduced-motion` handling (a search for `matchMedia` in the four sim
  files found only the theme check in `core.js`). `INTERACTION_SPEC.md` principle
  2 ("No autoplay, no loops") and principle 3 are chem's contract, not part of
  Appendix A, so this is a question for Phase 3: should the sim standard adopt
  them?
- **Layout reads every frame.** `getBoundingClientRect()` is called twice per
  frame in 1-2, 1-3 and 1-4 (`1-2.js:167-168`). Not a defect today. Another
  reason to move to one shared loop helper.
- **Resize** is handled by a window listener on the sims, with no
  `ResizeObserver`. A sim inside a collapsing panel would not resize.

## Bio summary

Counts of the 21 Appendix A items, taken from the four tables above.

| Sim | Pass | Partial | Fail | N/A | Recommendation |
|---|--:|--:|--:|--:|---|
| 1-1 Respiration | 1 | 5 | 15 | 0 | Redesign |
| 1-2 Thermoregulation | 1 | 6 | 13 | 1 | Redesign |
| 1-3 Osmoregulation | 1 | 3 | 16 | 1 | Redesign |
| 1-4 Blood glucose | 3 | 5 | 13 | 0 | Redesign |

All four bio sims fail A1 to A4 (question, prediction, steps, what to look for)
and D17 to D19 (tokens, canvas text, label overlap).

---

# Part 2: Physics (`public/physics/`)

## What counts as one sim

The plan counts 18 canvases in 8 lessons. A sim here is one student-facing
tool, so a tool with two or four canvases counts once, and the DOM-only
mini-tools are scored too (marked N/A where the item needs motion). That gives
**15 sim units** covering all 18 canvases:

| Lesson | Units |
|---|---|
| 1-1 | Vector Direction Builder (DOM), Velocity Unit Converter (DOM), Mars Rover 1D Navigator (2 canvases) |
| 1-2 | Motion Sensor Graph Matcher (1 canvas), Piecewise Displacement Decomposer (DOM), Dynamic Triple-Graph Motion Studio (4 canvases) |
| 1-3 | Dropped vs. Fired strobe (1 canvas), Kinematics Equation Solver (DOM), Operation Projectile Precision boss challenge (1 canvas) |
| 2-1 | Interactive Force Balancer (1 canvas), FBD Force Selector (DOM) |
| 2-2 | Dynamic Acceleration Rig (2 canvases) |
| 2-3 | Dual-Sensor Force Collider (2 canvases) |
| 2-4 | Inclined Plane Friction Sandbox (2 canvases) |
| 2-5 | Digital Atwood Machine Lab (2 canvases) |

(Level 2 section 05 in 2-2 to 2-5 is explanatory text with no interactive
element.)

**Seeds S1 to S9 are bio findings and do not apply here.** Everything below is
new. Several bio patterns recur, and where they do the report says so.

**Physics against bio, in one paragraph.** Physics sims are better built than
bio's on the motion items: every canvas sim that animates is time-based with a
clamped `dt` (`1-1.js:386`, `1-2.js:504`, `1-3.js:148`, `2-1.js:215`,
`2-2.js:291`, `2-3.js:393`, `2-4.js:412`, `2-5.js:501`) and the physics is
real (Hooke's-law bumper, kinetic and static friction, Atwood tension). The 2-x
canvases fill their column and resize. The weaknesses are the shell and the
guidance: dark-mode text on two sims, fixed-pixel canvases on 1-1 and 1-2,
undefined control classes in Level 2, and a handful of internal contradictions
listed below. **None of the physics sims is marked redesign.**

## Sim 1-1c: Mars Rover 1D Navigator

**Where:** physics 1-1, section 04 (`1-1.html:353-468`). **Code:**
`initMarsRoverSim` in `1-1.js:65-536` (`renderTrack` `:132`, `renderGraph` `:262`,
`loop` `:384`). **Learning target:** HS-PS2-1 (kinematics foundation).

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | Section intro (`1-1.html:362-364`) is an instruction ("Set the drive velocity and observe..."). |
| A2 | Predict before touching | Fail | The predictions are in section 05 (`:484`). The rover can be driven first. |
| A3 | Try this | Partial | Three "Cadet Training Missions" buttons (`:441-456`) load a setup, but they are labelled by outcome ("Target A (+30 m)"), not as numbered steps with verbs. |
| A4 | What to look for | Partial | The status line states each mission goal after loading (`1-1.js:491`, `:510`, `:529`). |
| A5 | Use the evidence | Fail | Checkpoints (`:484-539`) ask about new scenarios and never point at the sim. |
| A6 | Legend | Fail | None. The blue arrow, origin box and flags are labelled only on the canvas (`1-1.js:178`, `:199`). |
| B7 | No contradiction with lesson | Partial | Buttons say "Target A / Target B" (`1-1.html:447-450`); the flags and arrival status say "Sample A / Sample B" and "ARRIVED AT SAMPLE A!" (`1-1.js:102-103`, `:378`). |
| B8 | Conservation | N/A | |
| B9 | Readouts and visuals match | Pass | Position, velocity and the x-t trace come from one state (`:390-401`). |
| B10 | Consistent start state | Pass | Slider +5.0, readout +5.0, status "READY FOR DRIVE" agree (`1-1.html:375`, `:413`, `:420`, `:422`). |
| C11 | Time-based loop | Pass | `dt = Math.min(0.1, ...)` (`1-1.js:386`). |
| C12 | Registered | Partial | Registered (`:414-425`) but the stop callback is empty (`:422-424`). A running rover keeps animating off screen, and each re-entry calls `requestAnimationFrame(loop)` again while the first loop is still scheduled. |
| C13 | Paths once per leg | N/A | No particles. |
| C14 | Readable speeds | Pass | At most 10 m/s on a 120 m track, 20 s cap (`:394`). |
| D15 | Shared sim shell | Partial | `.sim-box`, `.sim-grid`, `.sim-stage` (`1-1.html:368`, `:383-384`); controls and tiles are inline-styled. |
| D16 | One control per variable; class-based active | Partial | One slider; missions are shortcuts. Status colour is written inline from JS (`1-1.js:379`, `:449`, `:459`, `:472`, `:492`, `:511`, `:530`). |
| D17 | Colours from tokens | Fail | 25 hex, 4 rgba, 0 `getComputedStyle` (`:102`, `:136`, `:142`, `:285-290`, `:304`, `:325`, `:337`). Track scene is a fixed dark scene on purpose (`#1A1412`). |
| D18 | Canvas text | Fail | 9 to 11px (`:151`, `:198`, `:289`, `:326`). Loaded fonts (IBM Plex Mono, Hanken Grotesk). Unicode not needed. |
| D19 | No label overlaps | Pass | By reading the draw code at 850px; at narrow widths see D20. |
| D20 | 360px and both themes | Fail | **Dark mode:** the graph sits on `var(--paper)` (`1-1.html:388`) but draws its gridlines in `rgba(15, 23, 42, 0.08)` (`1-1.js:285`, `:304`) and its axis titles in `#0F172A` (`:325`), so in dark mode the grid and the "Time t (s)" and "Position x (m)" titles are dark on near-black. **360px:** fixed 850px and 400px canvas widths (`:78`) squeeze about 3.4 times (page audit). |
| E21 | Accessibility | Partial | Slider has a `<label for>` (`1-1.html:419`); `<button>`s. No `aria-live` on the telemetry tiles or status (`:375`, `:398-414`), no canvas alternative, mission buttons are 30px tall (`:446`). |

**Science and logic flags:** none found. Missions are arithmetically correct
(30 m at 5 m/s in 6.0 s; 75 m at 7.5 m/s in 10.0 s; 80 m at -4 m/s in 20 s).
Axis range to 100 m while the stop is at 105 m (`:275`, `:394`): the last 5 m of
travel is off the graph.

**Recommendation: repair.** Fix D20 (dark text, canvas sizing), C12 (real stop
callback), B7 (one name), and add A1 to A5.

**Draft brief.** *Question:* what does a straight line on a position-time graph
tell you about how a rover moves? *Shows:* the existing track and graph.
*Student changes:* the drive velocity, positive or negative. *Predicts, then
records:* before driving, predict what the graph will look like for +5 m/s and
for -4 m/s, and sketch it; then drive each and record the slope and the position
after 10 seconds. *Should see:* a steady line whose slope equals the velocity,
leaning down for a negative velocity. *Answers:* "What does the slope of an x-t
graph mean?"

## Sim 1-2a: Motion Sensor Graph Matcher

**Where:** 1-2 section 02 (`1-2.html:219-249`). **Code:** `initGraphMatcher`
`1-2.js:24-184`.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Partial | "Mimic the Vernier ultrasonic detector lab!... match the red target curve" (`1-2.html:225`) names a task, not a question. |
| A2 | Predict before touching | Fail | None. |
| A3 | Try this | Partial | One sentence of instruction, not numbered steps. |
| A4 | What to look for | Fail | Feedback gives the numeric error after each move (`1-2.js:155-161`), not what the shape should show. |
| A5 | Use the evidence | Fail | Section 05 checkpoints (`1-2.html:525`, `:559`) do not use it. |
| A6 | Legend | Fail | The dashed red and solid blue lines are named only in the instruction sentence. |
| B7 | No contradiction with lesson | Partial | Instruction says "drag the blue position slider over 10 seconds" (`1-2.html:225`); the tool has two sliders, time and position, and records a point on every input event of either (`1-2.js:180-181`, `:142-150`). Moving only the time slider records a repeat position. |
| B8 | Conservation | N/A | |
| B9 | Readouts and visuals match | Pass | |
| B10 | Consistent start state | Pass | Profile 1 and 0.0 s / 0.0 m agree with the HTML (`1-2.html:239-248`). |
| C11 to C14 | Motion items | N/A | Static canvas, no loop. |
| D15 | Shared sim shell | Partial | `.sim-box` with inline layout. |
| D16 | One control per variable; class-based active | Partial | Three profile buttons have no active state. Two sliders drive two variables (pass). |
| D17 | Colours from tokens | Fail | Grid `rgba(15, 23, 42, 0.08)` (`:75`), `#64748B` (`:80`), `#DC2626` (`:103`), `#2563EB` (`:116`). |
| D18 | Canvas text | Fail | 10px (`:79`). |
| D19 | No label overlaps | Pass | |
| D20 | 360px and both themes | Fail | Fixed 600px by 200px (`:29-31`, helper `:14-21`). The gridlines are near-invisible on a dark paper. |
| E21 | Accessibility | Partial | `<label for>` on both sliders. No `aria-live` on `#matcherFeedback` (`1-2.html:246`), buttons about 32px tall (`:229`), no canvas alternative. |

**Flags:** the feedback says "Excellent match! ... You matched the motion
profile." after a single point is within 1 m (`1-2.js:155-157`), so one lucky
point is "a match". Exclamation mark in student text.

**Recommendation: repair.** **Draft brief.** *Question:* can you move so that
your position-time graph matches a given walk? *Shows:* the target walk as a
dashed curve. *Student changes:* one control, a position slider that runs while
time advances by itself. *Predicts, then records:* before the run, predict the
slope of each segment of the target; after, record the score and the segments
that were off. *Should see:* the trace follows the dashed line when the speed is
right. *Answers:* "How does a graph show speed, standing still and turning
back?"

## Sim 1-2c: Dynamic Triple-Graph Motion Studio

**Where:** 1-2 section 04 (`1-2.html:385-509`). **Code:** `initTripleGraphStudio`
`1-2.js:230-577` (`getMotion` `:278`, `renderSingleGraph` `:331`,
`renderPhysicalTrack` `:434`, `loop` `:502`).

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | `1-2.html:395` is an instruction ("Observe the absolute mathematical synchronization..."). |
| A2 | Predict before touching | Fail | Checkpoints follow (`:512`). |
| A3 | Try this | Partial | Four numbered preset buttons (`:404-415`), no steps. |
| A4 | What to look for | Partial | Each graph has a 9px caption ("Slope = Instantaneous Velocity", `:430`, `:441`, `:452`). |
| A5 | Use the evidence | Fail | The checkpoints at `:525` and `:559` can be answered from it, but never say so. |
| A6 | Legend | Fail | Axis names only; **the graphs have no tick numbers** (`renderSingleGraph` draws a zero line, the curve, a dot and one live value at top right, `1-2.js:331-425`; the `title` argument is never used). |
| B7 | No contradiction with lesson | Fail | The "Gravity Drop" preset animates a falling object as a vehicle moving along a horizontal track: height (`y`) is passed as position (`1-2.js:295-299`, `:454`), so a body falling from 45 m to 0 m drives leftward along the ground. |
| B8 | Conservation | N/A | |
| B9 | Readouts and visuals match | Pass | Single `getMotion` feeds all four panels. |
| B10 | Consistent start state | Pass | "PRESET: CONSTANT VELOCITY" and +4.0 m/s agree (`1-2.html:417-418`, `:467`). |
| C11 | Time-based loop | Pass | `dt = Math.min(0.08, ...)` (`:504`). |
| C12 | Registered | Partial | Registered (`:523-532`), stop callback is `() => {}` (`:531`). |
| C13 | Paths once per leg | N/A | |
| C14 | Readable speeds | Pass | Six-second run. |
| D15 | Shared sim shell | Partial | `.sim-box`, `.sim-stage`, inline grid. |
| D16 | One control per variable; class-based active | Partial | Preset buttons have no active state; the status text names the preset (`:539`). Two checkboxes toggle overlays. |
| D17 | Colours from tokens | Fail | 20 hex (`:401`, `:415`, `:421`, `:428-430`, `:437`, `:441`). `colorMixWithAlpha` maps three hex strings to rgba by hand (`:427-432`). |
| D18 | Canvas text | Fail | 9 to 10px (`:422`, `:458`). |
| D19 | No label overlaps | Pass | |
| D20 | 360px and both themes | Fail | Three canvases in `repeat(3, 1fr)` with no breakpoint (`1-2.html:423`), 280px canvases squeezed to about 80px wide at 360px (`1-2.js:242-250`). The live value is `#0F172A` text (`:421`), unreadable on dark paper. |
| E21 | Accessibility | Partial | Checkboxes inside `<label>`; presets are `<button>`s without `aria-pressed`; no `aria-live` on the telemetry line (`:464-469`); no canvas alternative. |

**Recommendation: repair.** **Draft brief.** *Question:* how do the x-t, v-t and
a-t graphs of one motion relate? *Shows:* the same four presets, with tick
numbers on every graph and the free-fall preset drawn vertically. *Student
changes:* the preset, and a time scrubber instead of Play only. *Predicts, then
records:* before choosing "braking", predict the shape of all three graphs, then
record the sign of the slope of each. *Should see:* constant velocity gives a
flat v-t and a zero a-t; braking gives a falling v-t and a negative flat a-t.
*Answers:* "Which graph is the slope of which?"

## Sim 1-3a: Dropped vs. Fired strobe

**Where:** 1-3 section 03 (`1-3.html:470-487`). **Code:** `1-3.js:14-229`
(`renderDropFire` `:47`, `stepDropFire` `:146`).

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Partial | "Which sphere strikes the ground first?" (`1-3.html:223`) sits in section 01, with the commit gate (`:226-262`). In section 03 the intro (`:470`) only says "Observe". |
| A2 | Predict before touching | Fail | The commit gate is two sections earlier (section 01, `:226`) and its reveal never opens (see page audit). |
| A3 | Try this | Fail | One button, "Trigger Release". |
| A4 | What to look for | Partial | "Strobe flash lines show their vertical positions" (`:470`). |
| A5 | Use the evidence | Fail | Checkpoint 1 and 2 (`:601`, `:633`) use new numbers. |
| A6 | Legend | Partial | Spheres are labelled on canvas (`1-3.js:140`, `:143`). |
| B7 | No contradiction with lesson | Fail | Sphere B's speed is **30 m/s** in the prediction text (`1-3.html:220`), **20 m/s** in the sim intro (`:470`), and **22 m/s** in the code and the on-canvas label (`1-3.js:26`, `:143`). Strobe flashes are "at 0.1-second intervals" (`1-3.html:470`) but fire every 0.25 s (`1-3.js:172`). |
| B8 | Conservation | N/A | |
| B9 | Readouts and visuals match | Pass | One state for both spheres. |
| B10 | Consistent start state | Partial | Timer 0.00 s and "Height: 45.0 m" are hard-coded text (`1-3.html:483`) rather than read from the sim. |
| C11 | Time-based loop | Pass | `dt` clamped to 0.05 (`1-3.js:148`). |
| C12 | Registered | Partial | Registered (`:220-228`); stopping leaves the button reading "Dropping..." (`:202`, `:223-225`). |
| C13 | Paths once per leg | N/A | |
| C14 | Readable speeds | Pass | 3.03-second drop. |
| D15 | Shared sim shell | Fail | Its own `.boss-sim-container` and `.drop-vs-fire-wrap` (`1-3.html:58`, `:127`). |
| D16 | One control per variable | Pass | Run and Reset only. |
| D17 | Colours from tokens | Partial | Reads `--hair`, `--card`, `--ink-mute` (`1-3.js:68`, `:76`, `:81`); spheres and strobe are hex (`:100`, `:105`, `:118`, `:128`). |
| D18 | Canvas text | Fail | 10 to 11px, and the font strings use `var()` (`:82` `'10px var(--mono)'`, `:137` `'11px var(--font-sans)'`), which canvas ignores. |
| D19 | No label overlaps | Fail | At t = 0 the two labels start at the same point and overprint: both are drawn at `x + 12` of spheres at the same `x` and `y` (`:117`, `:127`, `:140`, `:143`). |
| D20 | 360px and both themes | Partial | Fluid width, fixed 320px height (`1-3.html:130`). Resizes on window resize (`1-3.js:45`). Theme colours read, but there is no redraw on theme toggle. |
| E21 | Accessibility | Partial | Buttons are `<button>`; the timer has no `aria-live`; no canvas alternative. |

**Recommendation: repair.** **Draft brief.** *Question:* does a fast sideways
speed change how long a ball takes to fall? *Shows:* two balls released at the
same height, one dropped and one fired, with strobe dots every 0.25 s.
*Student changes:* the fired speed (three settings). *Predicts, then records:*
predict which lands first, then record the landing time of each at each speed.
*Should see:* both land together at every speed; the strobe rows line up.
*Answers:* "Does horizontal speed change fall time?" One speed value everywhere
on the page.

## Sim 1-3c: Operation Projectile Precision (boss challenge)

**Where:** 1-3 section 04 (`1-3.html:494-590`). **Code:** `1-3.js:361-725`
(`renderBoss` `:417`, `stepBoss` `:573`, prediction gate `:659-681`).

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Pass | The directive names the task: hit the target (`1-3.html:500-502`). |
| A2 | Predict before touching | Partial | "Step 1: Commit Your Mathematical Prediction" (`1-3.html:542-546`); Launch starts disabled (`:550`). The gate unlocks for any positive number (`1-3.js:662-679`), and the sliders can be moved before it. |
| A3 | Try this | Partial | "Step 1" only; there is no "Step 2". |
| A4 | What to look for | Partial | Flight time, landing x, target error and impact speed appear after launch (`:557-575`). |
| A5 | Use the evidence | Partial | The error readout is compared with the target. Checkpoints (`:601`) do not use the sim. |
| A6 | Legend | Fail | Cyan and amber velocity arrows (`1-3.js:538`, `:556`) and the red flag are not explained. |
| B7 | No contradiction with lesson | Fail | The directive says calculate "the exact launch speed required" (`1-3.html:501`); the gate asks for the predicted range at the current sliders (`:545`, `1-3.js:668`). The student is never asked for the speed. |
| B8 | Conservation | N/A | |
| B9 | Readouts and visuals match | Pass | |
| B10 | Consistent start state | Fail | **The sim starts solved.** Default sliders (45 m, 20 m/s, 9.8 m/s²) land at 20 × √(2 × 45 / 9.8) = 60.6 m, the same as the initial target (`1-3.js:385-388`), and the target value is printed in the Step 1 text (`1-3.html:545`). Entering 60.6 passes the gate, and launching without touching a slider earns "Level 1 Boss Challenge Cleared!" (`:581`). |
| C11 | Time-based loop | Pass | `dt` clamped (`:575`). |
| C12 | Registered | Partial | Stop sets `isFlying = false` (`:719-721`), which freezes a flight mid-air and leaves the button on "In Flight..." with Launch disabled (`:690-691`), so the sim is stuck until Random Target or reload. |
| C13 | Paths once per leg | N/A | |
| C14 | Readable speeds | Pass | |
| D15 | Shared sim shell | Fail | `.boss-sim-container`. |
| D16 | One control per variable | Pass | Height, speed, gravity: one control each. |
| D17 | Colours from tokens | Partial | Reads `--paper`, `--hair`, `--card`, `--ink`, `--accent` (`:443-499`); target, capsule and arrows are hex. |
| D18 | Canvas text | Fail | 10px with `'10px var(--mono)'` (`:480`, `:493`), ignored by canvas. |
| D19 | No label overlaps | Partial | `TARGET: nn.nm` (`:482`) can run into the cliff label at small ranges. By calculation only. |
| D20 | 360px and both themes | Partial | Fixed 380px height (`1-3.html:68`). No redraw on theme change. |
| E21 | Accessibility | Partial | Labels with `for` on sliders and select (`1-3.html:517-531`); no `aria-live` on telemetry or the prediction feedback (`:553`). |

**Other logic flags:** "Launch authorized!" (`1-3.js:672`) and the launch is
allowed after a wrong prediction anyway (`:678`, "allow launch but with
warning"), so the commit gate does not gate anything. "Random Target" draws a
target between 25 and 90 m with no check that the slider ranges can reach it
(`:700-702`).

**Recommendation: repair.** **Draft brief.** *Question:* what launch speed lands
the capsule on the target? *Shows:* the canyon, the cliff, a target flag.
*Student changes:* launch speed (and optionally height and planet).
*Predicts, then records:* work out the speed from the target distance and the
fall time, enter it, and record the result of the first launch. *Should see:*
a landing within 2.5 m earns the badge. A wrong value shows by how much it
missed. *Answers:* "How do you work backward from a landing point to a launch
speed?" The target must not be solved by the default sliders.

## Mini-tools (DOM-only): scored together

Items that need motion are omitted (C11 to C14 are N/A for all five).

| # | Item | 1-1a Vector Builder | 1-1b Unit Converter | 1-2b Area Decomposer | 1-3b Equation Solver | 2-1b FBD Selector |
|---|---|---|---|---|---|---|
| A1 | Question first | Partial (`1-1.html:225`) | Fail (`:322`) | Partial (`1-2.html:355`) | Partial (`1-3.html:349`) | Partial (`2-1.html:479`) |
| A2 | Predict before touching | Fail | Fail | Fail | Fail | Partial (check then validate, `2-1.js:515`) |
| A3 | Try this | Fail | Fail | Fail | Fail | Fail |
| A4 | What to look for | Partial (live equation `1-1.js:38`) | Partial (live working `:57`) | Partial (live geometry `1-2.js:197`) | Partial (shows chosen formula `1-3.js:269`) | Pass (feedback explains `2-1.js:493`) |
| A5 | Use the evidence | Fail | Fail | Fail | Fail | Fail |
| A6 | Legend | N/A | N/A | N/A | N/A | N/A |
| B7 | No contradiction | Pass | Pass | Pass (24 + 72 + 24 = 120, `1-2.js:197-223`) | Partial (3 of the 10 input combinations return an error, `1-3.js:343-353`) | Partial (see below) |
| B9 | Readouts match | Pass | Pass | Pass | Pass | Pass |
| B10 | Start state | Pass (`1-1.html:231-246`) | Pass (90 km/h gives 25.00 m/s, `:329-334`) | Partial (Segment 1 text shown, no active button, `1-2.html:359-371`) | Pass (empty, status "Enter exactly 3 knowns") | Pass |
| D15 | Shared shell | Partial | Partial | Partial | Fail (`.solver-grid`) | Partial (inline copy) |
| D16 | One control per variable | Pass | Pass | Partial (no active state) | Pass | Pass |
| D17 | Tokens | Pass | Pass | Pass | Partial (`1-3.js:261` `var(--good)` fine; 3 hex inline `1-3.html:333`, `:429`, `:431`) | Partial (force labels hex, `2-1.html:494-509`) |
| D20 | 360px and themes | Partial (two sliders in `1fr 1fr`, `1-1.html:229`) | Pass | Pass | Pass (`auto-fit`) | Pass (`auto-fit`) |
| E21 | Accessibility | Partial (labels present, no `aria-live`) | Partial (label present, output not live) | Partial (buttons, no `aria-pressed`) | Partial (labels present, 11px `.solver-field label` `1-3.html:39`) | Partial (labels wrap checkboxes, feedback not live) |

**Flags (mini-tools):**

- **FBD Selector feedback is partly wrong.** In the skydiver scenario a student
  who ticks "Upward Normal Force" is told "You selected a non-existent force (such
  as 'forward force of motion' or 'inertia')" (`2-1.js:533-537`), which does not
  describe what they ticked. Unknown keys are shown raw: "Missing: fg, fn"
  (`:542`). "Misconception Alert!" and "Correct FBD Construction!" end in
  exclamation marks. The wording is David's; the mismatch between message and
  choice is a logic flag.
- **Equation Solver.** Three of ten possible known-value triples (`vi` and `vf`
  unknown, `vi` and `a` unknown, `vi` and `t` unknown) return "Computation
  configuration requires standard initial or final conditions." (`1-3.js:343-353`).
  Dividing by `a = 0` gives `Infinity` with no message (`:306`).
- **Recall blanks, ECR scheme and Show Answers** are covered in the page audit.

**Recommendation:** keep the Vector Builder and Unit Converter (add a question
sentence and a predict step); repair the Area Decomposer (predict the area before
the selection reveals it), the Equation Solver (cover all ten triples) and the
FBD Selector (message that names what the student ticked).

**Draft briefs for the three mini-tool repairs.**

- *1-2b Area Decomposer.* Question: how much distance does each part of the trip
  cover? The student sees the v-t graph first, predicts the area of each segment
  (a triangle, a rectangle, a triangle), records the three numbers and their sum,
  and only then selects a segment to check. They should see 24 m, 72 m, 24 m and
  120 m in total.
- *1-3b Equation Solver.* Question: which kinematics equation fits what you
  know? The student is given a problem statement, lists the three knowns, picks
  the equation, and only then runs the solver to confirm. All ten triples of
  knowns work, and the unknown the solver cannot reach is named.
- *2-1b FBD Selector.* Question: which forces belong on the diagram? The student
  ticks the forces for a scenario, commits, and reads feedback that names the
  specific tick that was wrong and why it was tempting (for example "the puck is
  moving, so a forward force feels right; motion needs no force").

## Level 2 canvas sims: scored together

2-1 Interactive Force Balancer (`2-1.js`, `2-1.html:297-446`), 2-2 Dynamic
Acceleration Rig (`2-2.js`, `2-2.html:290-416`), 2-3 Dual-Sensor Force Collider
(`2-3.js`, `2-3.html:269-399`), 2-4 Inclined Plane Friction Sandbox (`2-4.js`,
`2-4.html:288-431`), 2-5 Digital Atwood Machine Lab (`2-5.js`, `2-5.html:268-405`).

| # | Item | 2-1 Balancer | 2-2 Rig | 2-3 Collider | 2-4 Incline | 2-5 Atwood |
|---|---|---|---|---|---|---|
| A1 | Question first | Partial (`2-1.html:306` "test whether you can establish equilibrium") | Fail (`2-2.html:300`) | Fail (`2-3.html:279`) | Fail (`2-4.html:298`) | Fail (`2-5.html:278`) |
| A2 | Predict before touching | Fail (hint opens on click, `2-1.js:474-478`) | Fail (`2-2.js:530-534`) | Fail (`2-3.js:707-711`) | Fail (`2-4.js:621-625`) | Fail (`2-5.js:763-766`) |
| A3 | Try this | Partial (4 missions, `2-1.html:413-433`) | Partial (4 missions) | Partial (4 missions) | Partial (4 surface presets, `2-4.js:599-602`) | Partial (4 missions) |
| A4 | What to look for | Partial (mission hint text) | Partial | Partial | Partial | Partial |
| A5 | Use the evidence | Partial (checkpoint `2-1.html:540` testable) | Partial (`2-2.html:512`) | Partial (`2-3.html:470`) | Partial (`2-4.html:503`) | Fail (the checkpoint answer is the default readout: 36.8 N, `2-5.html:311`, `:463`) |
| A6 | Legend | Partial (caption `2-1.html:329-332`) | Partial (on-canvas labels) | Partial (on-canvas labels) | Partial (on-canvas labels) | Partial (on-canvas labels) |
| B7 | No contradiction with lesson | Partial (the probe wraps off one edge onto the other, `2-1.js:231-234`; Gravity 50 N on a 10 kg probe means g = 5 m/s², `:13`, `:23`) | Partial (net force is clamped at zero, so friction can never slow a moving cart, `2-2.js:47`) | Pass | Partial (a sliding block that would decelerate stops dead, `2-4.js:435-439`) | Partial (checkpoint uses g about 10, weights 30 and 50 N, `2-5.html:463`; the sim uses 9.8) |
| B8 | Conservation | N/A | N/A | Partial (equal and opposite impulse each substep, `2-3.js:431-432`; track-end clamps destroy momentum, `:450-457`; no total-momentum readout) | N/A | N/A |
| B9 | Readouts match visuals | Pass | Partial (applied-force arrow saturates at 70px, `2-2.js:180`) | Partial (contact force starts at a 14 m centre spacing while the carts draw 44px wide, about 6 m, so forces appear on carts that are visibly apart, `2-3.js:28-30`, `:154`) | Partial (arrows cap at 50 to 60px, `2-4.js:250-260`) | Partial (arrows cap at 45px, so T and weight look equal for heavy masses, `2-5.js:253`, `:259`, `:266`) |
| B10 | Consistent start state | Pass | Pass | Partial (`cart1.x` starts at 10, Reset puts it at 12, `2-3.js:14`, `:501`) | Pass (26.6° and 20.7 N agree, `2-4.html:321`, `:329`) | Pass (2.45 m/s² and 36.8 N agree, `2-5.html:307`, `:311`) |
| C11 | Time-based loop | Pass (`2-1.js:215`) | Pass (`2-2.js:291`) | Pass (`2-3.js:393`, 10 substeps) | Pass (`2-4.js:412`) | Pass (`2-5.js:501`) |
| C12 | Registered | Partial (stop only; button still reads "Pause Motion", `2-1.js:245-251`) | Partial (`2-2.js:339-345`, same) | Fail (none) | Fail (none) | Fail (none) |
| C13 | Paths once per leg | N/A | N/A | N/A | N/A | N/A |
| C14 | Readable speeds | Pass | Pass | Pass | Pass | Pass |
| D15 | Shared sim shell | Fail (`.sim-box` with inline override `border:1.5px solid var(--ink)`, `2-1.html:310`) | Fail (undefined `.sim-container`, `2-2.html:303`) | Fail (same) | Fail (same) | Fail (same) |
| D16 | One control per variable; class-based active | Partial (`.w-btn` is undefined; `.active` is added to an unstyled class, `2-1.js:349`) | Partial (same, `2-2.js:441`) | Partial (`2-3.js:611`) | Partial | Partial |
| D17 | Colours from tokens | Partial (reads 6 tokens, `2-1.js:30-45`; force colours and `bad` are hex; no redraw on theme toggle) | Partial (**the v-t area fill uses a CSS variable string, `2-2.js:270`, so canvas ignores it and fills with the previous colour; see flag**) | Partial | Partial | Partial |
| D18 | Canvas text | Fail (9 to 11px, `system-ui` and `monospace`, `2-1.js:113`, `:157`) | Fail (8 to 10.5px, `2-2.js:109`, `:144`, `:245`) | Fail (9 to 10px, `2-3.js:113`, `:147`) | Fail (9 to 11px, `2-4.js:157`, `:316`) | Fail (9 to 9.5px, `2-5.js:142`) |
| D19 | No label overlaps | Partial (by calculation: gravity and support labels overlap when both vectors are short) | Fail (by calculation at 360px: eleven track labels in 218px, `2-2.js:134-147`) | Fail (same, `2-3.js:137-150`; force labels `F(2 on 1)` and `F(1 on 2)` run into each other when the carts are close) | Partial | Partial |
| D20 | 360px and both themes | Partial (fluid canvas, `auto-fit` controls, no redraw on theme change) | Fail (`repeat(6, 1fr)` HUD, about 40px per cell, `2-2.html:316`) | Fail (`repeat(5, 1fr)` HUD, `2-3.html:295`) | Fail (`repeat(5, 1fr)`, `2-4.html:314`) | Fail (`repeat(6, 1fr)`, `2-5.html:304`) |
| E21 | Accessibility | Partial | Partial | Partial | Partial | Partial |

(E21 for all five: the sliders in 2-2 to 2-5 have `<label for>` (for example `2-2.html:347`, `:355`, `:363`), but **2-1's six sliders have none**: its labels wrap the checkboxes only, `2-1.html:340-345`. `w-btn` elements are real `<button>`s. No `aria-pressed`, no `aria-live` on any HUD, no canvas alternative. No Level 2 lesson has a single `@media` rule.)

**Flags (Level 2 canvas sims):**

1. **2-2: the v-t shaded area is drawn in the wrong colour.** `ctxGraph.fillStyle
   = 'color-mix(in srgb, var(--accent) 15%, transparent)'` (`2-2.js:270`). Canvas
   cannot resolve `var()`, so the assignment is ignored and the fill keeps the
   last colour set, `colors.inkMute` (`:244`). By the rule in
   `RENDERING_GOTCHAS.md` ("A CSS variable passed to Canvas 2D silently keeps the
   previous colour") the area under the curve is a solid grey block, drawn after
   the line, rather than a 15% accent tint. **Worth a look by David on the Rig.**
2. **2-2: friction cannot slow a moving cart** (`2-2.js:47`,
   `Math.max(0, forceApp - forceFriction)`). With the cart moving, set the applied
   force below the friction: net force is 0, not negative, so the cart coasts.
3. **2-4: a block stops dead.** If the student lowers the angle mid-slide, kinetic
   friction can exceed the downhill pull, the acceleration goes negative, and the
   branch at `2-4.js:435-439` sets `v = 0` instantly instead of decelerating.
4. **2-4 draws a gravity component beside real forces.** The block shows `Fg`,
   `FN`, `f` and also `Fg∥` as a fourth arrow (`2-4.js:251-280`). The lesson's own
   FBD rule (`2-1.html:470`) is to draw forces that act on the body.
5. **2-3 lists PS2-2 but shows no total momentum.** The manifest tags the lesson
   HS-PS2-2 (conservation of momentum); the sim shows velocities and equal and
   opposite impulses but never a total-momentum readout or a before and after
   comparison (`2-3.js:525-545`). The word "momentum" appears once in the whole
   lesson (`2-3.html:486`).
6. **2-1: weight against mass.** The probe is 10 kg and the default Gravity arrow
   is 50 N (`2-1.js:13`, `:23`).
7. **2-5: mixed g.** The checkpoint says "weight ≈ 30 N" and "≈ 50 N" (g about 10)
   and asks for the tension (`2-5.html:463`). The sim shows 36.8 N at g = 9.8.
   The correct answer to the checkpoint is therefore visible in the sim's default
   readout before the student predicts.
8. **Wrap-around in 2-1** (`2-1.js:231-234`) makes the probe leave one edge and
   enter the opposite one.

**Recommendation for the five (all repair):** replace `w-btn` and
`sim-container` with the shared button and shell; move mission hints behind a
prediction; give every HUD a stacked layout below 600px; read theme colours and
redraw on toggle; fix the flagged logic items.

**Draft briefs (one line each, same template).**

- *2-1 Balancer.* Question: when is the net force on the pod zero? The student
  sets force sizes and angles, predicts whether the pod will speed up or coast
  for each of four setups, records ΣF and the result, and sees that zero net
  force means constant velocity, including at rest.
- *2-2 Rig.* Question: how do net force and mass set acceleration? The student
  changes force, mass and friction one at a time, predicts the new acceleration
  before each change, records a table of force, mass and acceleration, and sees
  that doubling the force doubles it and doubling the mass halves it. The v-t
  graph shows the same thing as a slope.
- *2-3 Collider.* Question: do the two carts push on each other with the same
  force? The student sets masses and speeds, predicts the lighter cart's
  acceleration compared with the heavier one, records both peak forces and the
  total momentum before and after, and sees equal forces, unequal accelerations
  and a constant total momentum.
- *2-4 Incline.* Question: at what angle does a block start to slide? The student
  picks a surface and raises the ramp, predicts the angle, records the angle at
  which it slips and compares it with the critical-angle readout, and sees that
  the angle depends on the surface and not on the mass.
- *2-5 Atwood.* Question: why is the cord tension between the two weights?
  The student changes both masses, predicts acceleration and tension before the
  readouts are visible, records the table, and sees acceleration set by the
  difference and tension between the two weights.

## Physics summary

Counts of the 21 Appendix A items from the tables above. The nine DOM-only
tools have 7 to 8 N/A items by nature.

| Sim | Pass | Partial | Fail | N/A | Recommendation |
|---|--:|--:|--:|--:|---|
| 1-1a Vector Direction Builder | 5 | 5 | 3 | 8 | Keep |
| 1-1b Velocity Unit Converter | 6 | 3 | 4 | 8 | Keep |
| 1-1c Mars Rover 1D Navigator | 5 | 7 | 7 | 2 | Repair |
| 1-2a Motion Sensor Graph Matcher | 3 | 6 | 7 | 5 | Repair |
| 1-2b Piecewise Displacement Decomposer | 4 | 6 | 3 | 8 | Repair |
| 1-2c Triple-Graph Motion Studio | 5 | 6 | 8 | 2 | Repair |
| 1-3a Dropped vs. Fired strobe | 4 | 8 | 7 | 2 | Repair |
| 1-3b Kinematics Equation Solver | 4 | 5 | 4 | 8 | Repair |
| 1-3c Projectile Precision boss challenge | 5 | 9 | 5 | 2 | Repair |
| 2-1a Force Balancer | 4 | 12 | 3 | 2 | Repair |
| 2-1b FBD Force Selector | 5 | 6 | 2 | 8 | Repair |
| 2-2 Acceleration Rig | 3 | 10 | 6 | 2 | Repair |
| 2-3 Force Collider | 3 | 10 | 7 | 1 | Repair |
| 2-4 Incline Friction Sandbox | 3 | 10 | 6 | 2 | Repair |
| 2-5 Atwood Machine Lab | 3 | 9 | 7 | 2 | Repair |

**No physics sim is marked redesign.** The models are sound; the fixes are in
the shell (classes, canvas sizing, dark mode), the student guidance (every sim
fails A2 and none has a numbered try-this sequence) and a short list of
contradictions (rover naming, strobe speeds, boss gate, Rig area fill).

---

# Part 3: Chem (`public/chem/`)

## What was scored

The plan counts 15 canvases in 11 lessons. Chem also animates SVG, so the unit
here is **one student-facing simulation with a motion or parameter loop**: 17
sims in 17 lessons, covering all 15 canvases. Lessons cite their on-disk id.

| Group | Lessons |
|---|---|
| SVG sims (older style, token-based) | 1-1a, 1-1b, 1-2a, 1-3b, 2-6a, 3-1c, 4-6b |
| Canvas sims (some with an SVG graph) | 3-14a, 3-1a (2 canvases), 3-1b, 3-4a (2), 4-1a (2), 4-1b, 4-6a, 5-1a, 5-4a, 5-8a (3) |

**Not scored: ten exercise lessons** (1-2b, 1-2c, 1-2e, 1-3a, 2-2a, 2-7a, 2-7b,
2-7c, 5-2a, 5-3a). They have no animation loop and their interactivity is
`data-widget` exercises or lesson-specific builders. 1-2e, 2-2a, 2-7a, 2-7b and
2-7c do have parameter-driven drawings (a balancer, a change slider, a molecule
builder, a conversion builder, a stoichiometry slider panel); their chemistry
logic was not traced. They are listed in the last table so Phase 3 can decide
whether they join the standard.

**Seeds S1 to S9 are bio findings.** Everything below is new. A leading `~` on
a line number means it is approximate (within about ten lines).

**Chem against bio and physics, in one paragraph.** The first lessons
(1-1a, 1-1b) are the best-built sims in the project: clamped `dt`, reduced
motion honoured, token-based colours and sizes, a real start and stop, and
buttons that are real `<button>`s with labels. From 1-3b on, the loops lose
`dt` or lose the registration, and from 3-14a on the canvases hard-code hex,
draw text at 5 to 9px and test a theme attribute that chem never sets. Four
defects are model errors rather than shell errors (3-14a pictures, 3-4a speeds,
4-6a rate law, 5-1a fusion).

## Cross-cutting chem findings

1. **The dark-mode test is wrong in 5 places (4 sims).** `3-14a.js:153`,
   `3-1b.js:216`, `4-1a.js:308`, `3-4a.js:184` and `:228` read
   `document.documentElement.getAttribute('data-theme') === 'dark'`. Chem toggles
   the class `dark` on the root (`core.js:341-344`) and never sets `data-theme`,
   so those canvases always draw their light palette. In dark mode the bonds in
   3-14a and 3-1b are dark lines on a dark card.
2. **Motion is tied to the frame rate in 13 of 17 sims.** Particle or step
   updates per frame: 1-2a (`:158`), 1-3b (`:157`, `:193`), 2-6a (`:398`),
   3-1a (`:106`), 3-1b (`:257-259`), 3-4a (`:110`), 4-1a (`:175`), 4-1b
   (`:340`, `:351`), 4-6a (`tick % 3`, `:368`), 4-6b (`:317`), 5-1a (`:278`),
   5-8a (`dt = 0.02`, `:300`). 1-1a, 1-1b (partly), 3-1c and 3-14a are
   timestamp-based.
3. **Four sims run an unregistered loop that never stops:** 3-1b (`:333`,
   `:374`), 4-1b (`:448`, `:490`), 4-6a (`:374`, `:450`), 4-6b (`:435`), plus
   2-6a (`:399-401`). They keep animating when scrolled off screen.
   Registered with a real stop: 1-1a, 1-1b, 1-2a (with a flaw), 1-3b, 3-1a, 3-4a,
   5-1a, 5-4a, 5-8a.
4. **`var()` is used in canvas strings in two sims:** a font in `3-14a.js:231`
   and a stroke colour in `4-1b.js:443`. The physics report lists three more
   (`2-2.js:270`, `1-3.js:82`, `1-3.js:480`).
5. **424 SVG labels under 11px** (page audit) plus canvas text at 5 to 9px:
   `4-6a.js:357` (6.5px), `5-1a.js:342` (5.5px), `5-4a.js` (7 to 9px),
   `5-8a.js` (5 to 12px), `4-1b.js:327` (8.5px), `3-14a.js:231` (8px).
6. **The sim guidance is the same everywhere.** Every sim lesson has a
   self-explain or exam prompt after the sim, and most units 3 to 5 sims have a
   mission deck of named presets that load a state and print a hint on click.
   None asks for a prediction first; where a commit item precedes the sim
   (3-14a, 3-1b, 3-1c, 4-1a) it sits in the hook, not at the sim. 14 of 17
   section headings are titles ("Interactive Solar Core & Hydrostatic Equilibrium
   Simulator"), not a question. Three sims have a legend (1-1b, 1-3b, 5-1a).
7. **Gating is better than the other books.** The self-explain and exam
   reveals are disabled until the student types (`1-3b.js:752-770`), and the
   self-test "Show answer" in 1-1a is disabled until a check (`1-1a.js:158-163`).
8. **Accessibility:** diagrams carry `role="img"` and `aria-label` in most
   lessons (the widgets carry `aria-live` in `core.js:950`, `:1387`). No
   lesson HTML has `aria-pressed`; only one has an `aria-live` region
   (`1-2b.html`). 3-1a has 4 sliders with no `<label for>`, 2-7c has 6.

## Per-sim scorecards

### Sim 1-1a: Bohr model and configuration builder

**Where:** 1-1a section 02 (`1-1a.html:266-330`). **Code:** `1-1a.js:12-150` (`build` `:36`, `frame` `:102`). **Learning target:** HS-PS1-1.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Partial | Heading is a task: "Step through the elements. Watch the shells fill..." (`1-1a.html:268`) |
| A2 | Predict before touching | Fail | First commit item is at `1-1a.html:998`, after the sim |
| A3 | Try this | Partial | Six jump chips (H, C, Na, Cl, Ca, Br) and prev/next (`:296-310`), no numbered steps |
| A4 | What to look for | Partial | `describe()` writes a sentence per element (`1-1a.js:19-30`) |
| A5 | Use the evidence | Partial | Self-test follows (`1-1a.html:1222`) |
| A6 | Legend | Partial | Valence electrons "stay in the accent colour" in the intro (`:270`); no legend panel |
| B7 | No contradiction with lesson | Pass | Description comes from the same data (`1-1a.js:19-30`, `:43-60`) |
| B8 | Conservation | N/A |  |
| B9 | Readouts and visuals match | Pass | Rings and electrons built from `e.shells` (`:43-60`) |
| B10 | Consistent start state | Pass | Starts on fluorine, built on load (`:17`, `:149`) |
| C11 | Time-based loop | Pass | `dt` clamped to 0.05, reduced motion honoured (`:21`, `:104-105`) |
| C12 | Registered | Pass | Registered with real start and stop (`:141-150`) |
| C13 | Paths once per leg; pre-warm | N/A |  |
| C14 | Readable speeds | Pass | 0.5 rad/s rotation (`:105`) |
| D15 | Shared sim shell | Partial | `.interactive` frame, not the Appendix A order |
| D16 | One control per variable; class-based active | Pass | Prev/next plus chips; chip active state is a class (`:93`) |
| D17 | Colours from tokens | Pass | SVG classes and `--dia-*` tokens, 0 hex and 0 rgba in the file |
| D18 | Canvas text | Pass | Text sizes come from `--dia-label-size` (`:70`) |
| D19 | No label overlaps | Pass | Only the nucleus label sits inside the rings (`:62-69`) |
| D20 | 360px and both themes | Pass | viewBox scales; tokens follow the theme |
| E21 | Accessibility | Partial | `role="img"` and `aria-label` on the SVG, labelled step buttons; no `aria-live` on readouts, no `aria-pressed` on chips |

**Science and logic flags:**

1. Z = 36 includes transition metals; PS1-1 is limited to main-group elements (see 2C).

**Recommendation: keep.**

### Sim 1-1b: Animated Bohr builder and periodic-trend explorer

**Where:** 1-1b section 02 (`1-1b.html:200-300`). **Code:** `1-1b.js:11-135`. **Learning target:** HS-PS1-1.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Partial | Heading is a statement: "The same two levers, drawn as atoms." (`1-1b.html:200`) |
| A2 | Predict before touching | Fail | First commit item `1-1b.html:272`, after the sim at `:212` |
| A3 | Try this | Partial | Period and group tabs (`1-1b.js:111`) |
| A4 | What to look for | Partial | Caption text after each step (`:70-72`) |
| A5 | Use the evidence | Partial | Self-explain and exam prompt follow (`1-1b.html:690`, `:715`) |
| A6 | Legend | Partial | A legend exists (`1-1b.html:248`) |
| B7 | No contradiction with lesson | Pass | Data table of radius, IE and EN (`1-1b.js:131`) |
| B8 | Conservation | N/A |  |
| B9 | Readouts and visuals match | Pass | Ring radius and nucleus size ease toward targets (`1-1b.js:83-84`) |
| B10 | Consistent start state | Pass | Lithium on load (`:116`) |
| C11 | Time-based loop | Partial | Rotation uses a clamped `dt` (`:81-82`); ring easing is per frame (`:83-84`) |
| C12 | Registered | Pass | Real start and stop (`:90-128`) |
| C13 | Paths once per leg; pre-warm | N/A |  |
| C14 | Readable speeds | Pass | 0.55 rad/s |
| D15 | Shared sim shell | Partial | `.interactive` frame |
| D16 | One control per variable; class-based active | Pass | Tabs use a class |
| D17 | Colours from tokens | Partial | 3 hex and 7 rgba in the file |
| D18 | Canvas text | Pass | Token sizes |
| D19 | No label overlaps | Partial | Label positions not traced (draw code not read for label geometry) |
| D20 | 360px and both themes | Partial | SVG; viewBox and layout not checked at 360px; tokens follow the theme |
| E21 | Accessibility | Partial | `role="img"` x7 and `aria-label` x11; no live region |

**Recommendation: keep.**

### Sim 1-2a: Interactive Bond Explorer

**Where:** 1-2a section 03 (`1-2a.html:436-500`). **Code:** `1-2a.js:8-511`. **Learning target:** HS-PS1-2.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Partial | "Select two elements. Watch their bond form." (`1-2a.html:436`) |
| A2 | Predict before touching | Fail | First commit item `:492`, after the sim at `:467` |
| A3 | Try this | Fail | Two dropdowns only |
| A4 | What to look for | Partial | Bond title and description rewrite per pair (`1-2a.js:~140-146`) |
| A5 | Use the evidence | Partial | Self-explain and exam prompt follow (`1-2a.html:553`, `:578`) |
| A6 | Legend | Fail | No legend; shaded cloud is explained in text only |
| B7 | No contradiction with lesson | Pass | Bond type chosen by electronegativity difference (`1-2a.js:60`) |
| B8 | Conservation | N/A |  |
| B9 | Readouts and visuals match | Pass | One state drives the drawing |
| B10 | Consistent start state | Pass | Defaults render on load |
| C11 | Time-based loop | Fail | `t += 0.045` per frame (`1-2a.js:158`, again at `:179`) |
| C12 | Registered | Partial | Registered (`:175-196`), but `isAnimationActive` starts true and the loop starts from the render function before the observer reports (`1-2a.js:158-170`) |
| C13 | Paths once per leg; pre-warm | N/A |  |
| C14 | Readable speeds | Pass | Slow oscillation |
| D15 | Shared sim shell | Partial | Shared `.interactive`; the whole SVG is deleted and rebuilt every frame (`1-2a.js:128`, `:199`) |
| D16 | One control per variable; class-based active | Pass | Two selects |
| D17 | Colours from tokens | Pass | 0 hex, 0 rgba |
| D18 | Canvas text | Pass | Token sizes |
| D19 | No label overlaps | Partial | Label positions not traced (draw code not read for label geometry) |
| D20 | 360px and both themes | Partial | SVG; viewBox and layout not checked at 360px; tokens follow the theme |
| E21 | Accessibility | Partial | `role="img"` x5; selects have no `<label for>` (0 in the lesson) |

**Science and logic flags:**

1. `cloud-gradient`, `atom-l`, `charge-l`, `atom-r`, `charge-r` are used in the HTML with no CSS rule (found by class comparison); effect not checked.

**Recommendation: repair.** **Draft brief.** *Question:* when atoms of different electronegativity meet, who ends up holding the shared electrons? *Shows:* two chosen atoms and the electron cloud between them. *Student changes:* the two elements. *Predicts, then records:* predict bond type from the electronegativity difference, then record the difference and the bond type for four pairs. *Should see:* the cloud sits in the middle for small differences, leans for medium differences, and moves entirely to one atom for large differences. *Answers:* "How does electronegativity decide the bond type?" Repair also: time-based loop and no per-frame rebuild.

### Sim 1-3b: IMF and Phase Lab (vapor-pressure chamber)

**Where:** 1-3b section 03 (`1-3b.html:421-500`). **Code:** `1-3b.js:8-776` (`update` `:156`, `loop` `:703`). **Learning target:** HS-PS1-3.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | Heading is a title: "Thermal Energy vs. Intermolecular Attractions." (`1-3b.html:421`) |
| A2 | Predict before touching | Fail | Commit items at `:862`, `:874`, after the sim at `:437` |
| A3 | Try this | Partial | Five substance tabs and preset temperatures (`1-3b.js:~755-765`) |
| A4 | What to look for | Partial | Energy-balance sentence per phase (`:~690`) |
| A5 | Use the evidence | Partial | Self-explain and exam prompt follow (`1-3b.html:937`, `:962`) |
| A6 | Legend | Partial | A legend exists (`:492`) |
| B7 | No contradiction with lesson | Partial | The lesson objective asks students to name and compare three IMFs (`:41`); the PE clarification statement says "not on naming specific intermolecular forces" (see 2C) |
| B8 | Conservation | N/A |  |
| B9 | Readouts and visuals match | Pass | Vapor count follows vapor pressure (`:~165-175`) |
| B10 | Consistent start state | Pass | Defaults render on load |
| C11 | Time-based loop | Fail | `t += 0.04` and `m.x += m.vx * speedScale` per frame (`1-3b.js:157`, `:193`) |
| C12 | Registered | Pass | Registered, real start and stop (`:703-723`) |
| C13 | Paths once per leg; pre-warm | Pass | Velocities set once at creation and nudged only when nearly still (`:92-95`, `:235-236`) |
| C14 | Readable speeds | Pass | Readable |
| D15 | Shared sim shell | Partial | `.interactive` frame |
| D16 | One control per variable; class-based active | Pass | Tabs and presets use classes |
| D17 | Colours from tokens | Partial | 2 hex |
| D18 | Canvas text | Pass | Token sizes |
| D19 | No label overlaps | Partial | Label positions not traced (draw code not read for label geometry) |
| D20 | 360px and both themes | Partial | SVG; viewBox and layout not checked at 360px; tokens follow the theme |
| E21 | Accessibility | Partial | `role="img"` x9; one range input with no `<label for>` |

**Science and logic flags:**

1. Self-explain and exam reveals are correctly gated on input (`1-3b.js:752-770`), the model the bio and physics books lack.

**Recommendation: repair.** **Draft brief.** *Question:* why does a liquid with stronger attractions have a lower vapor pressure at the same temperature? *Shows:* the same chamber. *Student changes:* the substance and the temperature. *Predicts, then records:* predict which of two liquids has more vapor above it, then record the vapor-pressure readout for each at three temperatures. *Should see:* weaker attractions give more vapor. *Answers:* "How do attractions between molecules set vapor pressure?" Repair: a time-based loop.

### Sim 2-6a: Structure and property dual simulator (fats and alkanes)

**Where:** 2-6a section 03 (`2-6a.html:473-700`). **Code:** `2-6a.js:13-420` (`renderSimulation` `:397`). **Learning target:** HS-PS2-6.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Partial | "Heat the chains. Construct the claim." (`2-6a.html:473`) |
| A2 | Predict before touching | Fail | First commit item `:696`, after the sim at `:511` |
| A3 | Try this | Partial | Two path buttons and five temperature presets (`2-6a.html`, `temp-preset-btn`; undefined) |
| A4 | What to look for | Partial | Badge and sentence per chamber (`2-6a.js:~420-440`) |
| A5 | Use the evidence | Partial | Self-explain and exam prompt follow (`2-6a.html:783`, `:814`) |
| A6 | Legend | Fail | No legend |
| B7 | No contradiction with lesson | Partial | Melting and boiling points used (`2-6a.js:41`, `:44`, `bpOctane = 125`) were not traced against the lesson text |
| B8 | Conservation | N/A |  |
| B9 | Readouts and visuals match | Partial | SVG is rebuilt each frame from `animTime` (`2-6a.js:~330-395`) |
| B10 | Consistent start state | Pass | Defaults render on load |
| C11 | Time-based loop | Fail | `animTime += 0.05` per frame (`2-6a.js:398`) |
| C12 | Registered | Fail | `requestAnimationFrame` from the first call and never stopped (`:399-401`) |
| C13 | Paths once per leg; pre-warm | Pass | Positions are computed from `sin(time)` around fixed bases |
| C14 | Readable speeds | Pass | Readable |
| D15 | Shared sim shell | Partial | Own `.dual-sim-grid` in a lesson `<style>` |
| D16 | One control per variable; class-based active | Partial | `path-btn` and `temp-preset-btn` have no CSS |
| D17 | Colours from tokens | Pass | 0 hex, 0 rgba |
| D18 | Canvas text | Pass | Token sizes |
| D19 | No label overlaps | Partial | Label positions not traced (draw code not read for label geometry) |
| D20 | 360px and both themes | Partial | SVG; viewBox and layout not checked at 360px; tokens follow the theme |
| E21 | Accessibility | Partial | `role="img"` x6; one range input with no `<label for>` |

**Recommendation: repair.** **Draft brief.** *Question:* why do straight chains pack and melt at a different temperature than kinked chains? *Shows:* two chambers of chains. *Student changes:* temperature. *Predicts, then records:* predict which chain is liquid at 20 °C, then record the temperature at which each melts. *Should see:* the straight chain stays packed to a higher temperature. *Answers:* "How does chain shape change a melting point?" Repair: time-based loop, stop off screen.

### Sim 3-14a: Reaction profile and molecular transition-state sandbox

**Where:** 3-14a section 04 (`3-14a.html:274-420`). **Code:** `3-14a.js:11-289` (`renderMoleculeState` `:147`). **Learning target:** HS-PS1-4.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | Heading is a title: "Interactive reaction profile & molecular transition state." (`3-14a.html:274`) |
| A2 | Predict before touching | Partial | A commit item comes first at `:137`, before the sim at `:362`, but it asks about cellular respiration |
| A3 | Try this | Fail | Reaction select, catalyst checkbox, progress slider and Play; no steps |
| A4 | What to look for | Partial | State label and sentence change with progress (`3-14a.js:159-206`) |
| A5 | Use the evidence | Partial | Self-explain and exam prompt follow (`3-14a.html:609`, `:653`) |
| A6 | Legend | Fail | No legend; atoms are labelled H and O only |
| B7 | No contradiction with lesson | Fail | **The picture is always 2 H₂ + O₂ becoming 2 H₂O** (`3-14a.js:158-222`), whatever reaction is selected, while the select offers 2 H₂O to 2 H₂ + O₂ and N₂ + 3 H₂ to 2 NH₃ (`:29-71`) |
| B8 | Conservation | Pass | Atoms are conserved in the combustion picture (4 H, 2 O both sides) |
| B9 | Readouts and visuals match | Partial | Activation energies are the bond enthalpies (436 and 945 kJ/mol) and the water-splitting value is not the forward value plus ΔH (`:32-34`, `:46-48`, `:60-62`) |
| B10 | Consistent start state | Pass | Defaults render on load |
| C11 | Time-based loop | Partial | The Play button is timed by timestamp (`:264-281`); the rest is static |
| C12 | Registered | N/A | Not registered, but the animation is a one-shot 2.4 s |
| C13 | Paths once per leg; pre-warm | N/A |  |
| C14 | Readable speeds | Pass | 2.4 s |
| D15 | Shared sim shell | Partial | `interactive-header` / `-badge` / `-body` and `btn-sm`, all undefined (`3-14a.html`) |
| D16 | One control per variable; class-based active | Pass | Checkbox and select; no duplicate |
| D17 | Colours from tokens | Partial | `#D94A38`, `#4B5563`, `#E5E7EB` in JS (`:154-156`) |
| D18 | Canvas text | Fail | 8px with a CSS variable in the font string, which canvas ignores (`:231`) |
| D19 | No label overlaps | Pass | No overlap found |
| D20 | 360px and both themes | Fail | **Dark mode:** the theme test reads `data-theme`, which chem never sets (`:153`; chem toggles class `dark`, `core.js:341-344`), so the canvas stays in the light palette. No DPR scaling (canvas drawn at attribute size) |
| E21 | Accessibility | Partial | One range input with a `<label for>`; no live region |

**Science and logic flags:**

1. The bond-enthalpy calculator in the same file (`3-14a.js:291-388`) computes ΔH = ΣD(broken) − ΣD(formed), which the PS1-4 assessment boundary excludes (see 2C).
2. Methane combustion numbers: 4 × 413 + 2 × 498 = 2,648 kJ in, 2 × 799 + 4 × 463 = 3,450 kJ out, ΔH = −802 kJ/mol (`3-14a.js:303-313`), which matches the usual value.

**Recommendation: repair.** **Draft brief.** *Question:* why does a reaction that releases energy still need a push to start? *Shows:* the energy profile and a picture of the particles that matches the chosen reaction. *Student changes:* the reaction and the catalyst switch. *Predicts, then records:* predict the height of the barrier with and without the catalyst, then record both barrier heights and the energy released. *Should see:* the catalyst lowers the barrier and leaves the energy released unchanged. *Answers:* "What does a catalyst change and what does it leave alone?" Repair: a picture for each reaction, the theme test, and removing the bond-enthalpy arithmetic if the boundary is applied.

### Sim 3-1a: Kinetic molecular theory sandbox (two vessels)

**Where:** 3-1a section 02 (`3-1a.html:168-240`). **Code:** `3-1a.js:10-248`. **Learning target:** HS-PS3-1.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Partial | "Compare temperature and total energy side-by-side." (`3-1a.html:168`) |
| A2 | Predict before touching | Fail | First commit item `:244`, after the sim at `:184` |
| A3 | Try this | Fail | Four sliders and an "Equalize" button; no steps |
| A4 | What to look for | Partial | A comparison sentence updates (`3-1a.js:190-193`) |
| A5 | Use the evidence | Partial | Self-explain and exam prompt follow (`3-1a.html:559`, `:596`) |
| A6 | Legend | Fail | No legend |
| B7 | No contradiction with lesson | Partial | Water in a vessel is shown as moving particles with a speed readout from the ideal-gas formula, about 600 m/s (`3-1a.js:175-176`) |
| B8 | Conservation | Partial | "Thermal energy" is computed as m × c × T(K) (`3-1a.js:179`); the comparison message depends on it |
| B9 | Readouts and visuals match | Pass | Speed readout and particle speed both scale with the square root of the Kelvin temperature |
| B10 | Consistent start state | Pass | Defaults render on load |
| C11 | Time-based loop | Fail | `p.x += p.vx * speedFactor` per frame, no `dt` (`3-1a.js:106`) |
| C12 | Registered | Pass | Real start and stop (`:218-251`) |
| C13 | Paths once per leg; pre-warm | Pass | Directions set once |
| C14 | Readable speeds | Pass | About 1.5 px per frame at 20 °C |
| D15 | Shared sim shell | Partial | `interactive-header` family undefined (`3-1a.html`) |
| D16 | One control per variable; class-based active | Partial | Mass and temperature are separate sliders (good); the preset buttons use undefined `preset-btn` |
| D17 | Colours from tokens | Partial | Particle colours are read from tokens once at load (`3-1a.js:143-144`) and not redrawn on a theme change |
| D18 | Canvas text | N/A | No canvas text |
| D19 | No label overlaps | Pass | No labels over particles |
| D20 | 360px and both themes | Partial | Canvas at attribute size, no DPR; theme colour frozen at load |
| E21 | Accessibility | Fail | 4 range inputs, 0 `<label for>` (`3-1a.html`) |

**Science and logic flags:**

1. Particle count is mass / 4 (`3-1a.js:162`) while the comment says one per 5 g (cosmetic).

**Recommendation: repair.** **Draft brief.** *Question:* can a cooler vessel hold more thermal energy than a hotter one? *Shows:* two vessels of water. *Student changes:* temperature and mass of each. *Predicts, then records:* predict which vessel holds more energy before the numbers show, then record temperature, mass and energy for three pairs. *Should see:* the large cool vessel can hold more. *Answers:* "How are temperature and total thermal energy different?" Repair: labelled sliders, `dt`, theme redraw; replace the ideal-gas speed readout for liquid water.

### Sim 3-1b: Heating curve and particle simulator

**Where:** 3-1b section 02 (`3-1b.html:240-420`). **Code:** `3-1b.js:10-374` (`renderParticles` `:225`). **Learning target:** HS-PS3-1.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | Heading is a title (`3-1b.html:240`) |
| A2 | Predict before touching | Partial | A commit item first at `:217` about 500 J added to ice and water at 0 °C, before the sim at `:333` |
| A3 | Try this | Partial | Five preset buttons: Ice, Melt, Liquid, Boil, Steam (`3-1b.js:337-362`) |
| A4 | What to look for | Partial | Stage title, formula and constants update (`:140-190`) |
| A5 | Use the evidence | Partial | Self-explain and exam prompt follow (`3-1b.html:691`, `:738`) |
| A6 | Legend | Fail | No legend |
| B7 | No contradiction with lesson | Partial | Ice is drawn as an offset square grid and labelled "Hexagonal Crystal Lattice" (`3-1b.js:172`) |
| B8 | Conservation | Pass | Heat totals check: 2.09, 18.79, 39.71, 152.71, 154.72 kJ for 50 g (`:32-41`) |
| B9 | Readouts and visuals match | Partial | The curve x-positions are not proportional to heat: boiling 145 units for 113 kJ against melting 45 units for 16.7 kJ (`:43-50`) |
| B10 | Consistent start state | Pass | 0 kJ at -20 °C on load (`:372`) |
| C11 | Time-based loop | Fail | Motion per frame, no `dt` (`3-1b.js:257-259`, `:~290-317`) |
| C12 | Registered | Fail | Own `requestAnimationFrame` that never stops and is never registered (`3-1b.js:333`, `:374`) |
| C13 | Paths once per leg; pre-warm | Partial | Solid vibration jitters with `Math.random()` every frame (`3-1b.js:257-259`) |
| C14 | Readable speeds | Pass | Readable |
| D15 | Shared sim shell | Partial | `interactive-header` family and `btn-sm` (8 uses) undefined |
| D16 | One control per variable; class-based active | Pass | One slider, presets are shortcuts |
| D17 | Colours from tokens | Partial | `#D94A38`, `#4B5563` in JS |
| D18 | Canvas text | Fail | Theme test reads `data-theme` (`:216`): never true; no DPR |
| D19 | No label overlaps | Partial | Label positions not traced (draw code not read for label geometry) |
| D20 | 360px and both themes | Fail | Dark mode frozen light (above); 40 SVG labels under 11px in the lesson |
| E21 | Accessibility | Partial | One range, labelled; no live region |

**Science and logic flags:**

1. Stage names use E_th and E_ph and "Overcoming Lattice IMFs" (`3-1b.js:164`, `:171`).

**Recommendation: repair.** **Draft brief.** *Question:* why does the temperature stop rising while ice melts? *Shows:* the same curve with a heat meter. *Student changes:* the amount of heat added. *Predicts, then records:* predict the temperature after each of five heat amounts, then record the temperature and phase for each. *Should see:* flat sections at 0 °C and 100 °C where heat goes into the phase change. *Answers:* "Where does the energy go while the temperature stays still?" Repair: a registered, time-based loop and the theme test.

### Sim 3-1c: Coffee-cup calorimeter and energy-bar workbench

**Where:** 3-1c section 03 (`3-1c.html:361-470`). **Code:** `3-1c.js:8-346` (`step` `:240`). **Learning target:** HS-PS3-1.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | Heading is a title (`3-1c.html:361`) |
| A2 | Predict before touching | Partial | A commit item first at `:139` asks about the final temperature of this setup, before the sim at `:413` |
| A3 | Try this | Partial | Three missions: Equal Mass, Al vs Pb, Heavy Metal (`3-1c.html:374-381`, `3-1c.js:~290-325`) |
| A4 | What to look for | Partial | Mission text states what to notice (`3-1c.js:310`) |
| A5 | Use the evidence | Partial | Self-explain and exam prompt follow (`3-1c.html:614`, `:660`) |
| A6 | Legend | Fail | No legend |
| B7 | No contradiction with lesson | Pass | Mission numbers check: 50 g Cu at 100 °C into 50 g water at 20 °C gives 26.7 °C; iron mission gives 44.0 °C |
| B8 | Conservation | Pass | Energy bars use q(system) + q(surroundings) = 0 |
| B9 | Readouts and visuals match | Pass | Thermometer and readout from the same result (`:240-268`) |
| B10 | Consistent start state | Pass | Defaults render on load (`:337`) |
| C11 | Time-based loop | Pass | One-shot 1.6 s animation timed by timestamp (`:236-268`) |
| C12 | Registered | N/A | One-shot, not registered |
| C13 | Paths once per leg; pre-warm | N/A |  |
| C14 | Readable speeds | Pass | 1.6 s |
| D15 | Shared sim shell | Partial | `interactive-header` family, `btn-sm` (3), `btn-subtle` (3) undefined |
| D16 | One control per variable; class-based active | Pass | Metal select and four numeric inputs |
| D17 | Colours from tokens | Pass | 4 hex (metal swatches), no rgba |
| D18 | Canvas text | N/A | SVG, not canvas; 59 SVG labels under 11px in the HTML |
| D19 | No label overlaps | Partial | Label positions not traced (draw code not read for label geometry) |
| D20 | 360px and both themes | Partial | SVG scales; 59 small labels |
| E21 | Accessibility | Partial | `<label for>` x5, no live region for the result |

**Science and logic flags:**

1. Mission strings end in exclamation marks ("copper drops over 70 °C!", `3-1c.js:310`).

**Recommendation: keep.**

### Sim 3-4a: Collision chamber and speed histogram

**Where:** 3-4a section 02 (`3-4a.html:281-420`). **Code:** `3-4a.js:10-395`. **Learning target:** HS-PS3-4.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | Heading is a title (`3-4a.html:281`) |
| A2 | Predict before touching | Fail | No commit item anywhere in the lesson |
| A3 | Try this | Partial | Three missions (`3-4a.html:294-301`, `3-4a.js:333-375`) |
| A4 | What to look for | Partial | Mission text and caption change (`:~340`, `:52`) |
| A5 | Use the evidence | Partial | Self-explain and exam prompt follow (`3-4a.html:508`, `:550`) |
| A6 | Legend | Fail | No legend; particle colour thresholds (speed 2.0 and 1.1) are not explained (`:~84-85`) |
| B7 | No contradiction with lesson | Fail | **Both chambers use a role multiplier, not their temperature:** hot gets `× 2.5`, cold `× 1.0` (`3-4a.js:64-65`). Mission 3, "50 °C vs 50 °C ... average kinetic energy is already equal" (`:365-375`), starts the left chamber at 2.5 times the speed of the right |
| B8 | Conservation | Partial | Elastic equal-mass collisions conserve momentum and energy (`:~147`) |
| B9 | Readouts and visuals match | Partial | Histogram bins and colours follow speed; the chamber fills are unrelated to the sliders |
| B10 | Consistent start state | Partial | The isothermal preset starts unequal (above) |
| C11 | Time-based loop | Fail | `p.x += p.vx` per frame (`3-4a.js:110`; loop `:296-301`) |
| C12 | Registered | Pass | Real start and stop (`:394`) |
| C13 | Paths once per leg; pre-warm | Pass | Directions set once |
| C14 | Readable speeds | Pass | Readable |
| D15 | Shared sim shell | Partial | `interactive-header` family, `btn-sm` (6), `btn-subtle` (6) undefined |
| D16 | One control per variable; class-based active | Pass | Two temperature sliders, one toggle |
| D17 | Colours from tokens | Partial | 18 hex in JS |
| D18 | Canvas text | Fail | 9px text; theme test reads `data-theme` (`:184`, `:228`) |
| D19 | No label overlaps | Partial | Label positions not traced (draw code not read for label geometry) |
| D20 | 360px and both themes | Fail | Dark mode frozen light; fixed 340 x 220 logical size (`:40-46`) |
| E21 | Accessibility | Partial | 2 range inputs with `<label for>`; no live region |

**Science and logic flags:**

1. Mission 1 and 2 numbers are correct (44.0 °C and 32.3 °C), `3-4a.js:~560-570`.

**Recommendation: repair.** **Draft brief.** *Question:* what happens to the speeds of fast and slow particles when they mix? *Shows:* two chambers and one speed histogram. *Student changes:* the two temperatures and the partition. *Predicts, then records:* predict the shape of the histogram after mixing, then record the speed spread before and after. *Should see:* two peaks merge into one in between. *Answers:* "Why does heat flow until temperatures are equal?" Repair: speed from temperature, theme test, `dt`.

### Sim 4-1a: Collision theory and rate sandbox

**Where:** 4-1a section 02 (`4-1a.html:211-340`). **Code:** `4-1a.js:9-459` (`updatePhysics` `:158`, `loop` `:356`). **Learning target:** HS-PS1-5.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | Heading is a title (`4-1a.html:211`) |
| A2 | Predict before touching | Partial | A commit item first at `:119` about why H₂ and O₂ do not react at 25 °C, before the sim at `:274` |
| A3 | Try this | Partial | Three missions (`4-1a.html:222-230`, `4-1a.js:~415-450`) |
| A4 | What to look for | Partial | Mission text (`:~420`) |
| A5 | Use the evidence | Partial | Self-explain and exam prompt follow (`4-1a.html:364`, `:408`) |
| A6 | Legend | Fail | No legend; red A, blue B and the AB molecule are explained in text only |
| B7 | No contradiction with lesson | Partial | Mission 1 says "Comparing 15 °C with 80 °C" but the preset sets only 80 °C (`4-1a.js:424`) |
| B8 | Conservation | Partial | A and B are consumed into one AB (`:~200-210`); counts are consistent |
| B9 | Readouts and visuals match | Fail | Rate readout is "mol/s" for a particle count per second (`4-1a.js:159`, `:375`) |
| B10 | Consistent start state | Pass | Defaults render on load |
| C11 | Time-based loop | Fail | Physics steps per frame (`4-1a.js:175`) but the trial runs for 20 seconds of clock time (`:356-395`): on a 120Hz display the same reaction gets twice the collisions, so the rate readout depends on the screen |
| C12 | Registered | Partial | Finite 20 s trial, not registered (`:384`, `:409`) |
| C13 | Paths once per leg; pre-warm | Pass | Directions set once |
| C14 | Readable speeds | Pass | Readable |
| D15 | Shared sim shell | Partial | `interactive-header` family, `btn-sm`, `btn-subtle` undefined |
| D16 | One control per variable; class-based active | Pass | Temperature, concentration and state: one control each |
| D17 | Colours from tokens | Partial | 12 hex in JS |
| D18 | Canvas text | Fail | 9px text; theme test `data-theme` (`:308`) |
| D19 | No label overlaps | Partial | Label positions not traced (draw code not read for label geometry) |
| D20 | 360px and both themes | Fail | Dark mode frozen light; fixed 320 x 210 logical size (`:40-50`) |
| E21 | Accessibility | Partial | 2 range inputs with `<label for>`; no live region |

**Science and logic flags:**

1. Effective collisions are chosen by a fixed relative-speed threshold and a random orientation factor (`4-1a.js:61`, `:210-211`), a reasonable teaching model.

**Recommendation: repair.** **Draft brief.** *Question:* what makes a collision lead to a reaction? *Shows:* the vessel and a rate graph. *Student changes:* temperature, concentration and the state of A. *Predicts, then records:* predict which change doubles the rate most, then record the reactions per 10 simulated seconds for each. *Should see:* hotter particles and more particles both raise the rate, and a solid clump hides most of A. *Answers:* "Why do temperature and concentration change reaction rate?" Repair: step by simulated time so the rate is the same on every screen.

### Sim 4-1b: Enzyme kinetics and saturation simulator

**Where:** 4-1b section 02 (`4-1b.html:270-420`). **Code:** `4-1b.js:5-491` (`animate` `:300-448`). **Learning target:** HS-PS1-5.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | Heading is a title (`4-1b.html:270`) |
| A2 | Predict before touching | Fail | First commit item `:414`, after the sim at `:346` |
| A3 | Try this | Partial | Four preset buttons: Optimum, Fever, Boil, Stomach (`4-1b.js:455-475`) |
| A4 | What to look for | Partial | Active-site status and regime text (`:~110-150`) |
| A5 | Use the evidence | Partial | Exam prompt follows (`4-1b.html:435`) |
| A6 | Legend | Fail | No legend |
| B7 | No contradiction with lesson | Partial | The "Stomach" preset (pH 2.4) shows the enzyme as "Misfolded" (`4-1b.js:329`, preset `:470`), though stomach enzymes such as pepsin work there; the model has a single enzyme with an optimum of 7.4 |
| B8 | Conservation | Partial | One substrate binds, a product forms, one respawns: matter is tracked loosely (`:~340-350`) |
| B9 | Readouts and visuals match | Pass | Rate, saturation percent and Vmax from one function (`calculateKinetics`) |
| B10 | Consistent start state | Pass | Optimum values on load |
| C11 | Time-based loop | Fail | Turnover is 24 frames (`occupancyTimer++`, `4-1b.js:58`, `:340`, `:351`) and motion is per frame |
| C12 | Registered | Fail | Own `requestAnimationFrame` that never stops and is never registered (`:448`, `:490`) |
| C13 | Paths once per leg; pre-warm | Partial | Substrate respawn positions use `Math.random()` once per binding (`:~380`) |
| C14 | Readable speeds | Pass | Readable |
| D15 | Shared sim shell | Partial | Frame mixes `sim-grid` with undefined `callout-warning` |
| D16 | One control per variable; class-based active | Pass | Four sliders, four presets that set the same sliders |
| D17 | Colours from tokens | Fail | `ctx.strokeStyle = 'var(--ink)'` (`4-1b.js:443`) is not a valid canvas colour, so the stroke keeps the previous colour; 10 hex |
| D18 | Canvas text | Fail | 8.5px `sans-serif` (`4-1b.js:327`) |
| D19 | No label overlaps | Partial | Label positions not traced (draw code not read for label geometry) |
| D20 | 360px and both themes | Partial | Fixed canvas size, no DPR; 18 SVG labels under 11px |
| E21 | Accessibility | Partial | 4 range inputs with `<label for>`; no live region |

**Science and logic flags:**

1. PS1-5 is limited to qualitative rate and temperature relations; Michaelis-Menten saturation, Vmax and Km are beyond that (see 2C).

**Recommendation: repair.** **Draft brief.** *Question:* why does adding more substrate stop speeding the reaction? *Shows:* an enzyme with a limited number of active sites and a saturation graph. *Student changes:* substrate amount, temperature, pH. *Predicts, then records:* predict the rate at three substrate amounts, then record rate and the share of occupied sites. *Should see:* rate levels off when all sites are busy. *Answers:* "What limits an enzyme-catalysed reaction?" Repair: registered, time-based loop; theme-aware colours.

### Sim 4-6a: Dynamic equilibrium and Le Chatelier chamber

**Where:** 4-6a section 02 (`4-6a.html:259-340`). **Code:** `4-6a.js:5-451` (`stepKinetics` `:~80`, `animate` `:~390`). **Learning target:** HS-PS1-6.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | Heading is a title (`4-6a.html:259`) |
| A2 | Predict before touching | Fail | First commit item `:410`, after the sim at `:339` |
| A3 | Try this | Partial | "Try This: Industrial Synthesis Missions" (`4-6a.html:265`) |
| A4 | What to look for | Partial | Shift status and net-shift readout (`4-6a.js:140-155`) |
| A5 | Use the evidence | Partial | Exam prompt follows (`4-6a.html:431`) |
| A6 | Legend | Fail | No legend; strip-chart series colours (hex) unexplained |
| B7 | No contradiction with lesson | Fail | **Rate law is not mass action:** forward rate = kf × [N₂] × min([H₂], 4) × P/200, reverse = kr × [NH₃]² (`4-6a.js:110-111`). The displayed Keq (`4-6a.js:72-78`) is for [NH₃]² / ([N₂][H₃]³), so the concentrations never settle at the K on screen |
| B8 | Conservation | Partial | Stoichiometric steps are right (N₂ -0.5, H₂ -1.5 per NH₃, `4-6a.js:121-122`) |
| B9 | Readouts and visuals match | Partial | Particle counts per concentration differ: 8 per M for N₂ and H₂, 10 per M for NH₃ (`4-6a.js:224`, `:226`) |
| B10 | Consistent start state | Pass | Starts at 450 °C, 200 atm, catalyst active |
| C11 | Time-based loop | Fail | The kinetic step runs every third frame (`tick % 3`, `4-6a.js:368`), so the approach to equilibrium depends on the display rate |
| C12 | Registered | Fail | Own `requestAnimationFrame` that never stops and is never registered (`:374`, `:450`) |
| C13 | Paths once per leg; pre-warm | Pass | Positions persist |
| C14 | Readable speeds | Pass | Readable |
| D15 | Shared sim shell | Partial | Frame uses `sim-grid`-like layout; `callout-warning` undefined |
| D16 | One control per variable; class-based active | Pass | Temperature, pressure sliders; catalyst toggle |
| D17 | Colours from tokens | Partial | 8 hex in JS; strip-chart strokes `#3b82f6` and `#9ca3af` |
| D18 | Canvas text | Fail | 6.5px canvas text (`4-6a.js:357`); 8px SVG text (`:183-184`) |
| D19 | No label overlaps | Partial | Label positions not traced (draw code not read for label geometry) |
| D20 | 360px and both themes | Partial | DPR handled; fixed 340 x 230 logical size (`:38-44`) |
| E21 | Accessibility | Partial | 2 range inputs with `<label for>`; no live region |

**Science and logic flags:**

1. PS1-6 does not include calculating equilibrium constants and concentrations; the sim shows both (see 2C).

**Recommendation: redesign.** **Draft brief.** *Question:* when you disturb an equilibrium, which way does it move? *Shows:* the chamber with particle counts and a concentration strip. *Student changes:* one condition at a time (add reactant, remove product, change temperature or pressure). *Predicts, then records:* predict the shift, then record the direction and the yield after each change. *Should see:* the system shifts to oppose the change. *Answers:* "How does a system respond to a change in conditions?" Redesign: a rate law that obeys mass action, or drop the numbers; time-based steps.

### Sim 4-6b: Human equilibrium and blood-buffer simulator

**Where:** 4-6b section 02 (`4-6b.html:212-300`). **Code:** `4-6b.js:5-436`. **Learning target:** HS-PS1-6.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | Heading is a title (`4-6b.html:212`) |
| A2 | Predict before touching | Fail | First commit item `:357`, after the sim at `:288` |
| A3 | Try this | Partial | "Try This: Clinical Homeostasis Missions" (`4-6b.html:218`) |
| A4 | What to look for | Partial | Clinical state badge and diagnosis text (`4-6b.js:~60-120`) |
| A5 | Use the evidence | Partial | Exam prompt follows (`4-6b.html:378`) |
| A6 | Legend | Fail | No legend |
| B7 | No contradiction with lesson | Partial | Henderson-Hasselbalch is correct (pH 7.40 at 24 mM and 40 mmHg), but the mission comment says "10 mM metabolic acid shock" while the code sets 19.5 mM, a 4.5 mM change (`4-6b.js:416`); the acid button removes 4.5 mM from the blood and adds 5 mM to the water mode |
| B8 | Conservation | N/A |  |
| B9 | Readouts and visuals match | Pass | Gauge and strip draw from one state |
| B10 | Consistent start state | Pass | Defaults render on load |
| C11 | Time-based loop | Fail | State advances every third frame (`4-6b.js:317`) and renal compensation is a fixed fraction per step (`:73`) |
| C12 | Registered | Fail | Own `requestAnimationFrame` that never stops and is never registered (`:435`) |
| C13 | Paths once per leg; pre-warm | N/A |  |
| C14 | Readable speeds | Pass | Readable |
| D15 | Shared sim shell | Partial | `sim-grid`-like layout |
| D16 | One control per variable; class-based active | Fail | Blood and water mode active state written as inline `style.borderColor` / `fontWeight` (`4-6b.js:329-330`, `:341`) |
| D17 | Colours from tokens | Partial | 6 hex and 1 rgba in JS |
| D18 | Canvas text | N/A | SVG, not canvas; 10 SVG labels under 11px |
| D19 | No label overlaps | Partial | Label positions not traced (draw code not read for label geometry) |
| D20 | 360px and both themes | Partial | SVG; viewBox and layout not checked at 360px; tokens follow the theme |
| E21 | Accessibility | Partial | 1 range input with `<label for>`; no live region |

**Science and logic flags:**

1. PS1-6 excludes calculating concentrations; the sim computes pH from HCO₃⁻ and pCO₂ (see 2C).

**Recommendation: repair.** **Draft brief.** *Question:* how does blood stay near pH 7.4 when acid or base is added? *Shows:* a gauge and a strip chart for blood and for plain water. *Student changes:* acid or base, and breathing rate. *Predicts, then records:* predict the pH change in blood and in water after the same acid dose, then record both. *Should see:* water swings widely and blood barely moves. *Answers:* "What does a buffer do?" Repair: registered, time-based loop; class-based active states.

### Sim 5-1a: Solar core and hydrostatic equilibrium simulator

**Where:** 5-1a section 02 (`5-1a.html:348-480`). **Code:** `5-1a.js:5-643` (`animate` `:~270-370`). **Learning target:** HS-ESS1-1.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | Heading is a title (`5-1a.html:348`) |
| A2 | Predict before touching | Fail | First commit item `:491`, after the sim at `:398` |
| A3 | Try this | Partial | "MISSION 1 Solar Baseline" and two more (`5-1a.html:439-442`), plus Our Sun / Cool Core / Massive Star presets |
| A4 | What to look for | Partial | Balance status and rate badge (`5-1a.js:~395-440`) |
| A5 | Use the evidence | Partial | Exam prompt follows (`5-1a.html:517`) |
| A6 | Legend | Partial | A legend exists (`5-1a.html:93`) |
| B7 | No contradiction with lesson | Fail | **Two colliding protons become one helium-4** and the second proton is moved elsewhere (`5-1a.js:310-311`): matter is not conserved, and the lesson goal lists the proton-proton chain (see 2C) |
| B8 | Conservation | Fail | Same as above: 4 H are not consumed for 1 He, and no positrons or neutrinos appear |
| B9 | Readouts and visuals match | Partial | Luminosity and lifespan readouts use the slider mass; not traced |
| B10 | Consistent start state | Pass | Defaults render on load |
| C11 | Time-based loop | Fail | Per-frame motion (`5-1a.js:278`) |
| C12 | Registered | Pass | Registered, real start and stop (`:366-389`) |
| C13 | Paths once per leg; pre-warm | Pass | Directions set once |
| C14 | Readable speeds | Pass | Readable |
| D15 | Shared sim shell | Partial | `mission-deck`, `mission-card`, `w-btn-sm` undefined |
| D16 | One control per variable; class-based active | Pass | Temperature and mass: one control each |
| D17 | Colours from tokens | Fail | 58 hex and 6 rgba in JS; inline `background:#0f172a` on the canvas (`5-1a.html:398`) |
| D18 | Canvas text | Fail | 5.5px label (`5-1a.js:342`); 32 SVG labels under 11px |
| D19 | No label overlaps | Partial | Label positions not traced (draw code not read for label geometry) |
| D20 | 360px and both themes | Partial | Resizes (`:39-50`); fixed 230px height; dark canvas on purpose |
| E21 | Accessibility | Partial | 2 range inputs with `<label for>`; no live region |

**Science and logic flags:**

1. ESS1-1 assessment boundary: no details of the atomic and subatomic processes in the Sun's fusion; this sim is entirely those details.

**Recommendation: redesign.** **Draft brief.** *Question:* why does the Sun stay the same size for billions of years? *Shows:* a balance of inward gravity and outward pressure. *Student changes:* the core temperature. *Predicts, then records:* predict whether the Sun shrinks or swells if the core cools, then record the balance reading for three temperatures. *Should see:* the core settles at the temperature where the two pushes match. *Answers:* "What keeps the Sun stable?" Redesign: drop the proton collisions or make them obey the 4-to-1 count.

### Sim 5-4a: Electromagnetic radiation and matter simulator

**Where:** 5-4a section 02 (`5-4a.html:368-470`). **Code:** `5-4a.js:5-632`. **Learning target:** HS-PS4-4.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | Heading is a title (`5-4a.html:368`) |
| A2 | Predict before touching | Fail | First commit item `:507`, after the sim at `:427` |
| A3 | Try this | Partial | Guided Investigation Missions (`5-4a.html:452-456`) and four target buttons |
| A4 | What to look for | Partial | Claim box rewrites per band (`5-4a.js:192`) |
| A5 | Use the evidence | Partial | Exam prompt follows (`5-4a.html:532`) |
| A6 | Legend | Partial | Spectrum gauge SVG acts as a key |
| B7 | No contradiction with lesson | Pass | Photon energies check out: 4.1e-9 eV at 1 MHz, 1.0e-5 eV at 2.45 GHz, 0.124 eV at 30 THz, 2.25 eV at 550 nm, 4.13 eV at 300 nm, 12.4 keV at 0.1 nm, 1.24 MeV at 0.001 nm (`5-4a.js:~70-120`) |
| B8 | Conservation | N/A |  |
| B9 | Readouts and visuals match | Partial | The power slider mixes unrelated cases (0.001 W dental pulse to 10,000 W mast, `5-4a.js:137`) and changes only the photon count |
| B10 | Consistent start state | Pass | Defaults render on load |
| C11 | Time-based loop | Partial | The animation loop (`5-4a.js:477-487`) was not traced for a time step |
| C12 | Registered | Pass | Registered, real start and stop (`:477-500`) |
| C13 | Paths once per leg; pre-warm | N/A |  |
| C14 | Readable speeds | Partial | Not traced |
| D15 | Shared sim shell | Partial | `mission-deck`-style panels without CSS |
| D16 | One control per variable; class-based active | Pass | Band slider and power slider |
| D17 | Colours from tokens | Fail | 30 hex in JS; 61 gradient and fill hex in the HTML (`5-4a.html:73-79`, `:157-162`) |
| D18 | Canvas text | Fail | 7 to 9px canvas text; 61 SVG labels under 11px |
| D19 | No label overlaps | Partial | Label positions not traced (draw code not read for label geometry) |
| D20 | 360px and both themes | Partial | DPR and resize handled (`:35-48`); fixed logical 340 x 210 size |
| E21 | Accessibility | Partial | 2 range inputs with `<label for>`; no live region |

**Science and logic flags:**

1. Strongly worded claims: "Claims that radio or Wi-Fi causes DNA damage are physically impossible" (`5-4a.js:67`) and capitalised "IONIZING RADIATION!" (`:121`) break the voice rules.
2. PS4-4 is limited to qualitative descriptions; the sim states photon energies in eV and the objective says "calculate photon energy" (see 2C).

**Recommendation: repair.** **Draft brief.** *Question:* why can X-rays damage cells and radio waves cannot? *Shows:* a spectrum bar and a target (water, CO₂, atom, DNA). *Student changes:* the band, and the power. *Predicts, then records:* predict which bands can break a bond, then record the photon energy and the effect for each band. *Should see:* energy per photon, not total power, sets the damage. *Answers:* "Does a more powerful source always cause more damage?" Repair: theme tokens, bigger text.

### Sim 5-8a: Nuclear physics laboratory (decay, fission, chain reaction)

**Where:** 5-8a section 03 (`5-8a.html:300-520`). **Code:** `5-8a.js:5-1097` (`masterLoop` `:1063`). **Learning target:** HS-PS1-8.

| # | Item | Result | Evidence |
|---|---|---|---|
| A1 | Question first | Fail | Heading is a title (`5-8a.html:300`) |
| A2 | Predict before touching | Fail | No commit item before or after the sim in the lesson body |
| A3 | Try this | Partial | Mission deck of named presets (`5-8a.html:373-384`) |
| A4 | What to look for | Partial | Decay curve and half-life readouts (`5-8a.js:~340-360`) |
| A5 | Use the evidence | Partial | Exam prompt follows (`5-8a.html:562`) |
| A6 | Legend | Fail | No legend |
| B7 | No contradiction with lesson | Partial | The decay stepping is correct (`probDecay = 1 - 0.5^dt`, `:296-299`); the lesson also states E = Δm c² and positron emission (`5-8a.html:42`), beyond the PE |
| B8 | Conservation | Partial | Nucleon counts in the decay lattice follow the isotope; fission and chain panels were not traced |
| B9 | Readouts and visuals match | Pass | Curve and lattice read the same atom array |
| B10 | Consistent start state | Pass | Defaults render on load |
| C11 | Time-based loop | Fail | Pace is a fixed 0.02 half-lives every second frame (`5-8a.js:300`, `tick % 2` `:1071`), so it depends on the display rate |
| C12 | Registered | Pass | One loop for all three canvases, registered with real start and stop (`:1063-1097`) |
| C13 | Paths once per leg; pre-warm | Pass | Directions set once |
| C14 | Readable speeds | Pass | Readable |
| D15 | Shared sim shell | Partial | Own tab panels; `recall-card` family undefined |
| D16 | One control per variable; class-based active | Fail | Tab buttons styled by inline `style.*` writes from JS (`:19-47`); 53 style writes in the file |
| D17 | Colours from tokens | Fail | 34 hex in JS |
| D18 | Canvas text | Fail | 5 to 12px canvas text (scan: 5, 7, 8, 9, 11, 12); 7px SVG text (`5-8a.js:283`) |
| D19 | No label overlaps | Partial | Label positions not traced (draw code not read for label geometry) |
| D20 | 360px and both themes | Partial | DPR and resize handled; fixed logical sizes |
| E21 | Accessibility | Partial | 1 range input with `<label for>`; no live region |

**Science and logic flags:**

1. The reactor-core panel is a chain-reaction model that goes beyond PS1-8's "alpha, beta, gamma" limit (see 2C).

**Recommendation: repair.** **Draft brief.** *Question:* why can no one say when one particular atom will decay, yet the whole sample decays on schedule? *Shows:* a grid of 100 atoms and a decay curve. *Student changes:* the isotope. *Predicts, then records:* predict how many atoms remain after one and two half-lives, then record the counts for two isotopes. *Should see:* half the atoms are left after each half-life, whichever isotope. *Answers:* "What is a half-life?" Repair: time-based, class-based tabs, tokens; decide the fission panel.

## Exercise lessons not scored (parameter-driven or `data-widget` builders)

| Lesson | Tool | Notes from the scan (chemistry logic not traced) |
|---|---|---|
| 1-2b | Molecular polarity: `data-widget` commit-reveal, faded-example, sort-classify | `1-2b.html` has the only `aria-live` region in the book's lesson HTML |
| 1-2c | Nomenclature: five commit-reveal widgets, scaffold, step-builder, sort-classify | 127-line `<style>` block; 18 selectors; `svg-step-layer` unstyled |
| 1-2e | Equation balancer (`balance-canvas`, coefficient adjusters) | 170-line `<style>` block; 51 hex in HTML; 13 hex in JS |
| 1-3a | Lewis structure lab (SVG, pointer events) | Injects a `<style>` rule from JS (`1-3a.js:13-30`); `card`, `alert`, `step-cards` have no CSS in the HTML (`1-3a.html`) |
| 2-2a | Physical and chemical change: slider and particle SVG | 128-line `<style>` block; 103 hex in HTML; own `.slider` |
| 2-7a | Molar mass builder (molecule canvas, formula input) | 155-line `<style>` block; `tally-card` shared with 2-2a |
| 2-7b | Mole conversion builder | 193-line `<style>`; `fraction`, `numerator`, `denominator` unstyled elsewhere |
| 2-7c | Stoichiometry: 6 sliders, particle canvas, BCA table | 195-line `<style>`; `.bca-table` `min-width: 520px` (`2-7c.html:90`); 6 sliders with no `<label for>` |
| 5-2a | Big Bang mission cards (no motion) | `mission-deck`, `mission-card`, `w-btn-sm` unstyled; 29 hex in HTML |
| 5-3a | Nucleosynthesis explorer (no motion) | 40 hex in JS; objective contrasts s- and r-process (see 2C) |

## Chem summary

Counts of the 21 Appendix A items from the tables above. **Keep** here means no
Fail in groups B to D; the A group (guidance) and E (accessibility) still need
the shared additions. **Repair** means at least one Fail that a targeted fix
removes. **Redesign** means a Fail in the model itself.

| Sim | Pass | Partial | Fail | N/A | Recommendation |
|---|--:|--:|--:|--:|---|
| 1-1a Bohr model and configuration builder | 11 | 7 | 1 | 2 | Keep (guidance and accessibility polish) |
| 1-1b Animated Bohr builder and periodic-trend explorer | 7 | 11 | 1 | 2 | Keep (guidance and accessibility polish) |
| 1-2a Interactive Bond Explorer | 7 | 8 | 4 | 2 | Repair |
| 1-3b IMF and Phase Lab (vapor-pressure chamber) | 7 | 10 | 3 | 1 | Repair |
| 2-6a Structure and property dual simulator (fats and alkanes) | 5 | 11 | 4 | 1 | Repair |
| 3-14a Reaction profile and molecular transition-state sandbox | 5 | 8 | 6 | 2 | Repair |
| 3-1a Kinetic molecular theory sandbox (two vessels) | 6 | 9 | 5 | 1 | Repair |
| 3-1b Heating curve and particle simulator | 4 | 11 | 6 | 0 | Repair |
| 3-1c Coffee-cup calorimeter and energy-bar workbench | 8 | 8 | 2 | 3 | Keep (guidance and accessibility polish) |
| 3-4a Collision chamber and speed histogram | 4 | 10 | 7 | 0 | Repair |
| 4-1a Collision theory and rate sandbox | 4 | 11 | 6 | 0 | Repair |
| 4-1b Enzyme kinetics and saturation simulator | 4 | 10 | 7 | 0 | Repair |
| 4-6a Dynamic equilibrium and Le Chatelier chamber | 4 | 10 | 7 | 0 | Redesign |
| 4-6b Human equilibrium and blood-buffer simulator | 3 | 9 | 6 | 3 | Repair |
| 5-1a Solar core and hydrostatic equilibrium simulator | 5 | 9 | 7 | 0 | Redesign |
| 5-4a Electromagnetic radiation and matter simulator | 4 | 11 | 4 | 2 | Repair |
| 5-8a Nuclear physics laboratory (decay, fission, chain reaction) | 5 | 9 | 7 | 0 | Repair |

**Two chem sims are marked redesign:** 4-6a (the rate law is not mass action,
so the shown K never matches the concentrations) and 5-1a (any two protons
become one helium, which also lies outside the ESS1-1 boundary). 3-14a, 3-4a and
4-1a have model defects too, but each has a contained fix (a picture per
reaction; speed from temperature; a time-stepped rate).

*(End of the sim audit for all three books. Appendix A is the rubric; the
cross-book list of what to do first is in the Phase 2 summary.)*


