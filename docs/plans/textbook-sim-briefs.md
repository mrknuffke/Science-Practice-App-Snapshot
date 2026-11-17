# Sim briefs (Phase 3, deliverable 3)

**Status: approved by David, 2026-10-12.**

One brief for every textbook simulation the Phase 2 audit marked **repair** or
**redesign** (31), and one line for each **keep** (5). The Phase 4 sessions build
from these. Evidence and line numbers are in
[the sim audit](../archive/plans/audit/sim-audit.md). The rules every sim must meet are the Sim
Standard in [`STYLE_STANDARD.md`](../textbook/STYLE_STANDARD.md), section 7.

## How to read a brief

- **Verdict:** redesign (new model and drawing), repair (same model, listed
  fixes), or keep.
- **Level:** *core* (inside the lesson's PE boundary), *Enrichment* (the whole sim
  sits in an Enrichment block), or *core with an Enrichment view* (a tagged
  control opens the deeper view).
- **The paragraph:** the question the sim answers, what it shows, what the
  student changes, what they predict, what they record, and what they should
  see.
- **Must fix:** defects from the audit that are specific to this sim.
- **For David:** an open science or wording point. The build does not guess
  these.

Question and prediction wording here is a proposal. The final student-facing
text is David's.

## What every sim gets, so no brief repeats it

Moving a sim onto the shared shell and the sim helper
([`RUNTIME_SPEC.md`](../textbook/RUNTIME_SPEC.md), section 4.3) fixes these for
all of them:

- the question as the sim's title; the prediction inside the sim box, with the
  stage and controls locked until it is committed;
- "Try this" steps in place of mission decks and preset rows, each with a
  "Look for" sentence;
- a Record button and table, a legend, and a follow-up check that compares two
  recorded rows;
- fixed time steps, stopping off screen, a Pause control, reduced motion;
- canvas sized from its box; colours and fonts from tokens; text at 11px or
  more; redraw on theme change;
- shared buttons, chips, labelled sliders, readout tiles that wrap on a phone,
  and live-region readouts.

So "Must fix" below lists only what the shell does not fix by itself.

---

# Bio (4 redesigns)

All four are redrawn at the scale the PE assesses. No transporter, receptor,
vesicle or organelle sub-structure appears in a core view (decision 8).

### Bio 1-1: Respiration. Redesign. Core.

**Where do the atoms in glucose go, and where does the energy go?** The stage
shows one muscle cell with one mitochondrion, labelled "where respiration
happens". Every atom is a coloured dot the student can follow: carbon, hydrogen,
oxygen. One glucose and six oxygen molecules enter. Their bonds break. The same
atoms leave as six carbon dioxide and six water molecules. An energy meter has
two bars and no numbers: "to ATP" and "as heat". The student changes one
control, workload, with three settings (rest, steady swim, sprint). **Predict:**
how many carbon dioxide molecules one glucose makes. **Record:** workload,
glucose used in 10 s, carbon dioxide made in 10 s, atoms in, atoms out.
**Should see:** atoms in equals atoms out at every setting; six carbon dioxide
for each glucose at every setting; at higher workload more molecules pass
through each second and both energy bars grow faster. The follow-up asks what
changed between rest and sprint, and what did not.

**Must fix:** matter is traced atom by atom (decision D6), never changed at
random. Remove the capillary panel, the muscle-fibre panel, cristae, "Krebs/ETC",
VO₂ max and the mmol/min readouts. One workload control, not buttons plus a
slider.
**For David:** the energy meter has no numbers and no ATP count, because the
"30-32 ATP" figure is out of core (decision 9). Say if you want a number.

### Bio 1-2: Thermoregulation. Redesign. Core.

**How does your body keep its core temperature steady when the air gets hotter
or colder?** The stage shows one body outline with a core thermometer, and a
live graph of core temperature against time with the 37 °C set point marked.
Four responses light up on the body, each with its name: shivering, goosebumps,
skin blood vessels narrowing or widening, sweating. The student changes air
temperature (5 to 40 °C) and a "humid air" chip. **Predict:** which responses
switch on at 5 °C. **Record:** air temperature, humid or dry, responses that
are on, core temperature after one minute. **Should see:** core temperature
moves a little, a response switches on, and the line returns toward 37 °C. With
humid air, sweating stays on and the line does not come back.

**Must fix:** the model is a feedback loop that runs over time, not a lookup.
The start state agrees with itself (selected setting, model, readouts, status).
Humidity is modelled, because the lesson's checkpoint asks about it. No skin
cross-section.

### Bio 1-3: Osmoregulation. Redesign. Core.

**What does the kidney change to keep the water in your blood steady?** The
stage shows a simple body diagram: a sensor in the brain (hypothalamus), the
pituitary under it, the bloodstream, a kidney and a bladder, joined by arrows.
Beside it sit a blood concentration meter, an ADH level bar, and a urine sample
that changes volume and colour. A clock runs 90 simulated minutes in about 30
seconds. The student presses "Sweat 1 L" or "Drink 1 L". **Predict:** whether
urine gets darker or paler after sweating. **Record:** time, blood
concentration, ADH level, urine volume, at 0, 30, 60 and 90 minutes. **Should
see:** sweating raises blood concentration; ADH rises; urine gets darker and
smaller. ADH slows the rise but cannot undo it; blood concentration comes back
down after drinking. Drinking does the reverse.

**Must fix:** the sim's numbers are the lesson table's numbers at 0, 30 and 90
minutes. The loop closes on screen when she drinks: ADH only slows the rise, as
the table shows (corrected in 4R; the first brief asked ADH alone to restore the
blood value, which the table cannot support).
One control per event (no slider duplicating the buttons).

### Bio 1-4: Blood glucose. Redesign. Core.

**How does your body keep blood sugar steady after a meal and between meals?**
The stage shows four labelled boxes joined by arrows: pancreas, bloodstream,
liver, muscle. A blood sugar graph runs along the bottom with the normal band
shaded. Two hormone bars (insulin, glucagon) sit beside the pancreas, and the
liver has a store bar. The student presses "Eat a meal" or "Skip a meal", and
picks one of three chips: Healthy, Type 1, Type 2. **Predict:** which hormone
rises after a meal, and whether blood sugar returns to the band. **Record:**
condition, peak blood sugar, blood sugar two hours later, insulin level (low,
normal, high). **Should see:** Healthy peaks and returns. Type 1 stays high
because the insulin bar never rises. Type 2 returns slowly with a high insulin
bar. The liver store grows after a meal and shrinks between meals; in Type 2
it grows less than in Healthy. Healthy follows the table's Patient A and Type 1
its Patient C. The table has no Type 2 patient (Patient B is pre-diabetic), so
Type 2 has its own invented curve that is still above 200 mg/dL at 2 hours
(decided in 4R).

**Must fix:** one normal band and one set of trigger values, the same in the
text, the table and the sim. The healthy peak matches the lesson's table.
Glucose leaving the blood is the glucose entering the liver store. Reset also
resets the condition. The graph still shows a difference above 160 mg/dL.

---

### Bio 2b-2: Reef disease. New. Core. (Approved by David 2026-11-07 with two changes: all five species can sicken, and the fish use the candy lab's colours.)

**Which reef keeps more of its fish when a disease kills one species?** The
stage shows two reef tanks side by side, Reef Alpha and Reef Beta, with 30
swimming fish each in the candy lab's five colours (red clownfish, blue tang,
yellow tang, green parrotfish, orange coral beauty; the red is `--rose`, never
`--bad`). The counts are the PLC Candy Coral Reef lab's: Alpha 6, 6, 6, 6, 6
and Beta 26 clownfish with 1 of each other species. The student picks one of
five species chips and presses "Release
disease": the fish of that species fade out one by one over 4 seconds, then the
clock stops. "Draw 5 fish" rings five random fish in each tank, the lab's blind
draw. **Predict:** which reef keeps more fish after a clownfish disease.
**Record:** disease hit, fish and species left in each reef. **Should see:**
clownfish disease leaves Alpha 24 fish and Beta 4, both with 4 species; a
disease of any other species leaves Alpha 24 and Beta 29. Alpha's loss never depends on which
species is hit; Beta's does.

**Must hold:** the sim's counts are Table 2's, and its results are the numbers
in the "Use your evidence" check. Only the sample is random; the layout is
seeded, so the first frame and a print show both full reefs, not a result.

### Bio 2b-4: Follow 1,000 units of energy. New. Core. (Approved by David 2026-11-08 with the 2b-4 outline.)

**How much of the energy in plants reaches the top of a food chain?** The stage
shows four levels as blocks of small squares, one square per unit of energy:
1,000 in the plants at the bottom, then plant-eaters, fish and top fish above.
"Pass energy up" moves one level: the squares that pass up fly to the next
block, and the rest turn heat-coloured and fade away. The clock holds after each
transfer. Chips choose the step sizes: Silver Springs (Odum 1957, via OpenStax:
3,368/20,810, 383/3,368, 21/383, so 16%, 11% and 5.5%) or 10% at every step.
**Predict:** how many of the 1,000 units reach the top fish. **Record:** step
sizes and the units at each level. **Should see:** Silver Springs 1,000, 162,
18, 1; 10% at every step 1,000, 100, 10, 1. Must hold: one set of numbers with
the lesson's Table 1; units never go up; the first frame shows only the plants
full.

### Bio 2a-2: Emissions and the air's carbon store. New. Core. (Approved by David 2026-11-08.)

**If we cut emissions in half, does the carbon dioxide in the air go down?** A
teaching model, labelled as one. A slider sets emissions as a share of 2023's
11.1 GtC (0 to 150%, step 10). Each year the air gains emissions minus uptake;
uptake = C x (air carbon - 278 ppm x 2.124), with C fitted so 2023 gives 5.2 GtC,
split 2.9 ocean and 2.3 land (Global Carbon Budget 2024, 2023 values). The stage
shows four sphere boxes (air in GtC and ppm; the others as change since 2023),
thin natural two-way arrows (130 and 80), and arrows for added and taken-up
carbon whose width follows the flow; below, a 2023 to 2063 graph of ppm with the
1750 level dashed and the last two runs faint. **Predict:** what half emissions
does. **Record:** emissions, CO2 in 2063, air gain in 2063. **Should see:** 100%
500 ppm; 50% 424 (still rising, slowly); 0% 348; about 47% holds the line level.
Must hold: carbon is conserved across the four boxes; the first frame is 2023 at
419 ppm with no answer; a slider move starts a new run. Known limit, stated in
the lesson: sinks are assumed to keep growing.

### Bio 2b-6: Days on land and carrying capacity. New. Core. (Approved by David 2026-11-08: option 1 of three, after two fat-budget models failed.)

**How does a longer stay on land change how many polar bears Hudson Bay can
support?** A teaching model, labelled as one. A slider sets the days bears spend
on land each year (100 to 180, step 5). The carrying capacity is a straight line
through two counts: about 1,200 bears at 105 days (1,194 counted in 1987; 105
days on land in 1985) and about 620 at 145 days (618 counted in 2021; 145 days
in 2018), so K = 1,200 - 14.5 x (days - 105). The bears follow yearly logistic
steps, N + 0.06 N (1 - N/K), from 1,200 at year 0, and the clock holds at year
40. The stage shows a year clock (ice season against days on land, a pointer
sweeping round), a "weight lost on land" bar that fills at Pilfold's 1 kg a day,
and a 40-year graph of bears with the carrying capacity dashed. The last two runs
stay as faint lines. **Predict:** what happens to the bears when days on land go
from 105 to 145. **Record:** days on land, carrying capacity, bears in year 40,
weight lost each summer. **Should see:** 105 days: K 1,200, 1,200 bears. 145
days: K 620, 645 bears. 180 days: K 113, 120 bears. Must hold: one set of numbers
with the lesson; the first frame shows year 0 at 1,200 bears and no answer; a
slider move starts a new run.

Rejected (2026-11-08): a fat-budget model (seal competition, fat stores anchored
to Pilfold et al. 2016's 180-day starvation rates). With competition, survivors
grew fatter as days on land rose, against Johnson et al. 2020. Without it, every
setting crashed by about 140 days, against the 618 bears alive in 2021.

# Physics (13 repairs, 2 keeps)

The models are sound. Level 2 sims also drop their undefined classes
(`w-btn`, `sim-container`) by moving to the shell. Working text uses the plain
register: mission names may stay as names; "Cadet", "Boss Challenge" and
exclamation marks go (decision 4).

### Physics 1-1c: Mars Rover. Repair. Core.

**What does the slope of a position-time graph tell you about how the rover
moves?** The existing track and graph. The student changes the drive velocity,
positive or negative. **Predict:** which of three graphs the rover draws at
-4 m/s. **Record:** velocity, position after 10 s, slope of the line. **Should
see:** a straight line whose slope equals the velocity, sloping down for a
negative velocity.

**Must fix:** graph grid and axis titles readable in dark mode. One name for
the flags ("Sample A", not also "Target A"). The graph's axis covers the whole
track. The three missions become "Try this" steps.

### Physics 1-2a: Graph Matcher. Repair. Core.

**Can you move so that your position-time graph matches a given walk?** The
target walk is a dashed line. Time runs by itself for 10 s while the student
moves one control, a position slider. **Predict:** which segment of the target
is the fastest. **Record:** which target, score for the run, the segment that
was furthest off. **Should see:** the trace follows the target when the speed
is right; a flat part means standing still.

**Must fix:** time advances by itself (no time slider). A "match" is scored
over the whole run, not from one point. The three targets are chips that show
which is selected.

### Physics 1-2b: Area Decomposer. Repair. Core. (No motion.)

**How much distance does each part of the trip cover?** The student sees the
velocity-time graph first. **Predict:** the area of each of the three segments.
**Record:** the three areas and their sum. Then they select a segment to check.
**Should see:** 24 m, 72 m, 24 m, and 120 m in total.

**Must fix:** the areas stay hidden until the prediction is committed. The
selected segment shows as selected.

### Physics 1-2c: Triple-Graph Studio. Repair. Core.

**How do the position, velocity and acceleration graphs of one motion relate?**
The same four motions, with numbered ticks on every graph. The student picks a
motion and drags a time scrubber. **Predict:** the shape of all three graphs
for braking. **Record:** motion, sign of the slope of each graph. **Should
see:** constant velocity gives a flat velocity graph and zero acceleration;
braking gives a falling velocity graph and a flat negative acceleration.

**Must fix:** the free-fall motion is drawn falling, not driving sideways. The
three graphs stack below 600px. Live values are readable in dark mode.
The tangent-line overlay opens from a chip tagged Enrichment (decided
2026-10-12).

### Physics 1-3a: Dropped and fired. Repair. Enrichment.

**Does sideways speed change how long a ball takes to fall?** Two balls leave
the same height together, one dropped and one fired, with a strobe mark every
0.25 s. The student sets the fired speed to one of three values. **Predict:**
which ball lands first. **Record:** fired speed, fall time of each ball, landing
distance. **Should see:** both land together at every speed, and the strobe rows
line up.

**Must fix:** one fired speed and one strobe interval in the text, the label
and the code. The two labels do not print on top of each other at the start.

### Physics 1-3b: Equation Solver. Repair. Core. (No motion.)

**Which kinematics equation fits what you know?** The student reads a problem,
lists the three knowns, and picks the equation. **Predict:** the equation,
before the solver runs. **Record:** knowns, equation, answer. **Should see:**
the solver confirms the choice and shows the working.

**Must fix:** all ten sets of three knowns work. A zero acceleration gives a
message, not "Infinity".

### Physics 1-3c: Projectile Precision. Repair. Enrichment.

**What launch speed lands the capsule on the target?** The cliff, the canyon
and a target flag. The student works out a launch speed, enters it, and
launches with that speed. **Predict:** the launch speed (this is the gate).
**Record:** target distance, launch speed, landing point, miss distance.
**Should see:** a landing within 2.5 m counts as a hit; a miss shows by how
much.

**Must fix:** the default settings do not hit the target, and the page never
prints the answer. The task and the gate ask for the same thing (the speed).
Every random target can be reached. Stopping in mid-flight leaves the controls
usable.

### Physics 2-1a: Force Balancer. Repair. Core with an Enrichment view.

**When is the net force on the pod zero, and what does the pod do then?** In
the core view, forces act left, right, up and down, each with a size slider.
An "Angled forces" chip, tagged Enrichment, adds the angle sliders and the
angled-cable task. **Predict:** what a moving pod does when the forces on it
balance. **Record:** net force across, net force up and down, what the pod did.
**Should see:** zero net force means constant velocity, and that includes
staying at rest.

**Must fix:** the pod never wraps from one edge to the other. Every slider has
a label. Hints appear after the prediction, not before.

### Physics 2-1b: FBD Selector. Repair. Core. (No motion.)

**Which forces belong on the diagram?** The student ticks the forces for a
scenario. **Predict:** the ticks are the commitment. **Record:** scenario,
forces chosen. **Should see:** feedback that names the specific tick that was
wrong and why it was tempting.

**Must fix:** the message matches what the student ticked. Force names appear
in words, never as internal keys.

### Physics 2-2: Acceleration Rig. Repair. Core.

**How do net force and mass set acceleration?** The cart, the track and the
velocity-time graph. The student changes applied force, mass and friction, one
at a time. **Predict:** the new acceleration before each change. **Record:**
applied force, friction, mass, acceleration. **Should see:** doubling the net
force doubles the acceleration; doubling the mass halves it; the graph's slope
shows the same thing.

**Must fix:** friction slows a moving cart when it is larger than the applied
force. The shaded area under the graph uses a real colour. Force arrows keep
their proportions (state the scale). The track has fewer tick labels at 360px.

### Physics 2-3: Force Collider. Repair. Core.

**Do two carts push on each other with the same force, and what happens to
their total momentum?** Two carts on a track with a force sensor on each. New
readouts: momentum of each cart, and total momentum before and after (decision
7). The student sets both masses and both speeds. **Predict:** which cart feels
the larger force. **Record:** masses, speeds before, peak force on each cart,
total momentum before, total momentum after. **Should see:** equal forces,
unequal accelerations, and the same total momentum before and after.

**Must fix:** forces appear only when the carts are drawn touching. The run
ends when a cart reaches the end of the track, so no momentum disappears at the
wall. Reset returns to the start positions.

### Physics 2-4: Incline Sandbox. Repair. Core with an Enrichment view.

**What decides the angle at which a block starts to slide?** A block on a ramp.
The student picks a surface, sets the mass, and raises the ramp. In the core
view the readouts are the angle and whether the block is sliding. A chip tagged
Enrichment adds the critical-angle readout and the components of the weight
(decision 6). **Predict:** whether a heavier block slips at a smaller angle.
**Record:** surface, mass, angle at which the block slipped. **Should see:** the
slip angle depends on the surface and not on the mass.

**Must fix:** a sliding block slows down when the ramp is lowered; it does not
stop dead. The weight's component along the ramp is drawn dashed, as a
component, and only in the Enrichment view.

### Physics 2-5: Atwood Machine. Repair. Core.

**Why is the cord tension between the two weights?** Two masses on a cord over
a pulley. The student changes both masses. **Predict:** acceleration and
tension, before any readout shows. **Record:** both masses, acceleration,
tension. **Should see:** acceleration follows the difference in mass, and the
tension always lies between the two weights.

**Must fix:** one value of g in the sim and in the checkpoint. The readouts
stay hidden until the prediction is committed, so the default screen does not
answer the checkpoint.

### Physics keeps

- **1-1a Vector Builder, 1-1b Unit Converter.** Add the question as the title,
  a one-line prediction, and live-region output. No model change.

---

# Chem (2 redesigns, 12 repairs, 3 keeps)

### Chem 1-2a: Bond Explorer. Repair. Core.

**When two atoms bond, which one ends up holding the shared electrons?** Two
chosen atoms and the electron cloud between them. The student picks the two
elements. **Predict:** the bond type, from the electronegativity difference.
**Record:** the pair, the difference, the bond type. **Should see:** the cloud
sits in the middle for a small difference, leans for a medium one, and moves
onto one atom for a large one.

**Must fix:** the drawing updates in place and is not rebuilt every frame.
Both selects have labels.

### Chem 1-3b: IMF and Phase Lab. Repair. Core.

**Why does a liquid with stronger attractions have less vapor above it at the
same temperature?** The existing chamber. The student picks the substance and
the temperature. **Predict:** which of two liquids has more vapor above it.
**Record:** substance, temperature, vapor pressure. **Should see:** weaker
attractions give more vapor at every temperature.

**Must fix:** nothing beyond the shell. Naming the three forces is core here
(decision 11).

### Chem 2-6a: Fats and Alkanes. Repair. Core.

**Why do straight chains stay solid to a higher temperature than kinked
chains?** Two chambers of chains side by side, one temperature slider for both.
**Predict:** which chain is liquid at 20 °C. **Record:** temperature, state of
each chamber. **Should see:** the straight chains stay packed to a higher
temperature.

**Must fix:** melting and boiling values are checked against the lesson text
(the audit did not trace them).

### Chem 3-14a: Reaction Profile. Repair. Core, with an Enrichment tool.

**Why does a reaction that releases energy still need a push to start?** The
energy profile, and a particle picture that matches the chosen reaction. The
student picks the reaction and switches the catalyst on or off. **Predict:**
what a catalyst does to the barrier and to the energy released. **Record:**
reaction, catalyst on or off, barrier height, energy released. **Should see:**
the catalyst lowers the barrier and leaves the energy released unchanged.

**Must fix:** every reaction offered has its own particle picture. The barrier
for a reverse reaction equals the forward barrier plus the energy released. The
bond-energy calculator moves into an Enrichment block (decision 11).
**For David:** the barrier values in the code are bond energies (436 and
945 kJ/mol). Session 4c lists them for you to confirm or replace.

### Chem 3-1a: Two Vessels. Repair. Core.

**Can a cooler vessel hold more thermal energy than a hotter one?** Two vessels
of water. The student sets the mass and the temperature of each. **Predict:**
which vessel holds more energy, before the numbers show. **Record:** mass,
temperature and thermal energy of each vessel. **Should see:** a large cool
vessel can hold more energy than a small hot one.

**Must fix:** all four sliders have labels. The particle-speed readout in m/s
goes, because it comes from a gas formula and the vessels hold liquid water.
Show "slower" to "faster" on a bar.

### Chem 3-1b: Heating Curve. Repair. Core.

**Why does the temperature stop rising while ice melts?** The heating curve
with a particle view and a heat meter. The student adds heat. **Predict:** the
temperature after each of five heat amounts. **Record:** heat added,
temperature, phase. **Should see:** flat parts at 0 °C and 100 °C, where the
heat goes into the phase change.

**Must fix:** the curve's horizontal axis is proportional to heat added. Solid
particles vibrate smoothly, not at random each frame. The ice picture and its
label agree. Stage names are plain words.

### Chem 3-4a: Collision Chamber. Repair. Core with an Enrichment view.

**What happens to fast and slow particles when two samples mix?** Two chambers
with a partition. The student sets the two temperatures and removes the
partition. The speed histogram opens from a chip tagged Enrichment, as the
lesson already marks it. **Predict:** the final temperature compared with the
two starting ones. **Record:** both starting temperatures, final temperature.
**Should see:** fast particles slow down, slow ones speed up, and one
temperature results in between.

**Must fix:** each chamber's particle speed comes from its own temperature, so
two chambers at 50 °C start the same.

### Chem 4-1a: Collision Sandbox. Repair. Core.

**What makes a collision lead to a reaction?** The vessel and a rate graph. The
student changes temperature, concentration and whether A is a lump or a powder.
**Predict:** which change raises the rate the most. **Record:** temperature,
concentration, form of A, reactions in 10 s. **Should see:** hotter particles
and more particles both raise the rate; a lump hides most of A.

**Must fix:** the rate is the same on every screen. It reads "reactions in
10 s", not mol/s. The step that compares 15 °C with 80 °C runs both.

### Chem 4-1b: Enzyme Sim. Repair. Enrichment.

**Why does adding more substrate stop speeding up the reaction?** An enzyme
with a limited number of active sites, and a rate graph. The student changes
substrate amount, temperature and pH. **Predict:** the rate at three substrate
amounts. **Record:** substrate amount, rate, share of sites in use. **Should
see:** the rate levels off when every site is busy.

**Must fix:** the enzyme outline uses a real colour. The "Stomach" preset goes,
or is renamed for what it is (strong acid), because stomach enzymes work at
that pH.

### Chem 4-6a: Equilibrium Chamber. Redesign. Core.

**When you disturb an equilibrium, which way does it move?** The chamber shows
particle counts for the three substances and a strip chart of their amounts.
The student makes one change at a time: add reactant, remove product, change
temperature, change pressure. The other controls lock until the system settles.
**Predict:** the direction of the shift. **Record:** the change made, direction
of the shift, yield of ammonia before and after. **Should see:** the system
shifts to oppose the change, then settles.

**Must fix:** the model obeys one rate law in both directions, so it settles
where its own constant says. The same number of particles stands for the same
amount of each substance. No equilibrium constant and no concentration values
appear in the core view (the PE excludes calculating them).

### Chem 4-6b: Blood Buffer. Repair. Enrichment.

**How does blood stay near pH 7.4 when acid is added?** A pH gauge and a strip
chart, for blood and for plain water. The student adds acid or base and changes
the breathing rate. **Predict:** the pH change in blood and in water after the
same dose. **Record:** liquid, dose, pH before, pH after. **Should see:** water
swings widely and blood barely moves.

**Must fix:** the same dose is added in both modes. The selected mode shows by
class, not by inline style.

### Chem 5-1a: The Sun. Redesign. Core.

**Why does the Sun stay the same size for billions of years?** The stage shows
a star with two arrows: gravity pulling in, pressure pushing out. The student
changes the core temperature, and in a second step the star's mass. **Predict:**
whether the Sun shrinks or swells if its core cools. **Record:** core
temperature, which push is larger, what the star does; then mass, brightness,
lifetime. **Should see:** the star settles where the two pushes match. A more
massive star is brighter and lives a shorter time.

**Must fix:** the fusion animation is removed (the PE excludes the sub-atomic
detail, and the current one turns two protons into one helium). The
proton-proton chain stays in the lesson as an Enrichment block with a still
figure (decided 2026-10-12).

### Chem 5-4a: Radiation and Matter. Repair. Core with an Enrichment view.

**Why can X-rays damage cells when radio waves cannot?** A spectrum bar and a
target (water, carbon dioxide, an atom, DNA). The student picks the band and
the brightness of the source. In the core view, photon energy is a bar from low
to high with the bond-breaking level marked. A chip tagged Enrichment shows the
values in eV. **Predict:** which bands can break a bond. **Record:** band,
brightness, photon energy (low to high), effect on the target. **Should see:**
energy per photon decides the damage. A brighter source sends more photons, not
stronger ones.

**Must fix:** the brightness control has one sensible range. Status text uses
normal case.
**For David:** the line "Claims that radio or Wi-Fi causes DNA damage are
physically impossible" is strong. Your wording.

### Chem 5-8a: Nuclear Lab. Repair. Core with Enrichment panels.

**Why can nobody say when one atom will decay, when a whole sample decays on
schedule?** A grid of 100 atoms and a decay curve. The student picks the
isotope. **Predict:** how many atoms remain after one and after two half-lives.
**Record:** isotope, half-lives passed, atoms remaining. **Should see:** half
the atoms remain after each half-life, for any isotope.

**Must fix:** the tabs show the selected panel by class. A prediction is added
(the lesson has none). The single-fission panel is core. The
chain-reaction panel is Enrichment (decided 2026-10-12).

### Chem keeps

- **1-1a Bohr builder, 1-1b Trend explorer, 3-1c Calorimeter.** Add the question
  title, a prediction at the sim, a legend and live-region readouts. 3-1c loses
  its exclamation marks. No model change.

### Chem building tools (not scored by the audit)

Five tools have a control that drives a drawing: the 1-2e equation balancer,
the 2-2a change slider, the 2-7a molar mass builder, the 2-7b conversion builder
and the 2-7c stoichiometry panel. Decision (2026-10-12):

- All five move to the shared shell and get a question as the title, a legend
  and the accessibility items. Their per-lesson `<style>` blocks go.
- 2-2a and 2-7c also get a prediction lock, because they show an outcome a
  student can predict. In the other three the building is the attempt.
- Nobody has traced their chemistry logic. Session 4c reports any defect it
  finds to David and does not fix it.

The other five exercise lessons (1-2b, 1-2c, 1-3a, 5-2a, 5-3a) are widgets or
static panels. They follow the component catalogue only.

---

# Values the build must not guess

Each row is a place where the audit found two or more values for one thing.
The default is what the build uses unless David says otherwise.

| Sim | What disagrees today | Default |
|---|---|---|
| Bio 1-3 | Sim start values against the lesson table | The table's values (288, 1.8, 1.40 at the start) |
| Bio 1-4 | Four different "normal" blood sugar values | One band, 70 to 110 mg/dL. The healthy start is the table's 88 (4R) |
| Bio 1-4 | Healthy meal peak 165 in the sim, 138 in the table | 138 |
| Physics 1-3a | Fired speed 30, 20 and 22 m/s; strobe 0.1 s and 0.25 s | Speeds 10, 20 and 30 m/s to choose from; strobe 0.25 s |
| Physics 2-1a | A 10 kg probe with a 50 N weight | 98 N (g = 9.8 N/kg, as in every other physics sim) |
| Physics 2-5 | g about 10 in the checkpoint, 9.8 in the sim | 9.8 in both; the checkpoint's weights become 29.4 N and 49 N |
| Chem 3-1a | Thermal energy counted from absolute zero | Counted from 0 °C |
| Chem 4-6b | Acid dose 4.5 mM in blood, 5 mM in water | 5 mM in both |
