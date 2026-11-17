# Content rewrite policy and plan (Phase 3, deliverable 4)

**Status: approved by David, 2026-10-12.**

What each of the 42 textbook pages gets in Phase 4, and how the work is done so
that David keeps control of the content. Evidence is in
[the content-level audit](../archive/plans/audit/content-level-audit.md). The rules are in
[`STYLE_STANDARD.md`](../textbook/STYLE_STANDARD.md), section 8, and
[`VOICE.md`](../textbook/VOICE.md).

Every split below was approved by David on 2026-10-12.

## 1. Policy

### 1.1 When the rewrite happens

**With each book's migration, in a fixed order per book:**

1. **Migration commit.** Markup moves to the shared components. No word a
   student reads changes.
2. **Content commit.** The edits in this plan. Only words, question data and
   Enrichment boundaries change.
3. **Sim commit.** Sims rebuilt or repaired to their briefs.

Rewriting before migration would mean editing every checkpoint twice, once in
its old markup and once as a widget. Three commits per book mean David can read
the content changes alone, without the markup noise.

### 1.2 What a session may and may not do

**May:**
- split long sentences, change passive to active, replace a term using the
  glossary in section 5;
- move a block into an Enrichment block where this plan says so;
- rebalance multiple-choice options and move the key (decision 3);
- rewrite feedback to open with the reason (decision 2);
- rewrite scoring-guide lines as checklists (decision 10);
- cut the items this plan lists under "Cut".

**May not:**
- change a data value, a graph, a worked answer or a science claim;
- add a new claim, example or number that this plan does not call for;
- cut content this plan does not list;
- decide an item this plan marks "For David".

Anything that looks wrong goes in the review sheet as a flag.

### 1.3 The review sheet

Each book's session writes one review sheet for David before anything is
pushed. It lists, per lesson:

- every changed question, with old and new options, the old and new key, and
  the new feedback;
- every block moved to Enrichment, by its title;
- everything cut;
- the hero's new title, Objective and Scope;
- each new "Common mistake" callout;
- flags.

David edits or approves the sheet. The session applies his edits, then the
push proceeds. The sheet is deleted after the push.

### 1.4 The voice pass (every page, whatever its verdict)

1. Feedback opens with the reason. No "Correct!", "Incorrect.", "Perfect!", no
   exclamation marks.
2. Each wrong option has its own feedback that names why it was tempting.
3. Options balanced (longest at most 1.8 times the shortest, over six words);
   key spread across the letters; no cartoon distractor.
4. Scoring guides become checklists, under 20 words a line.
5. The hero's Objective and Scope are rewritten to the student in Tier 3.
6. Sentences over 25 words are split. Over 18 words: split where it reads
   better.
7. Each concept section has one "Common mistake" callout. Where the lesson
   names no misconception today, the session drafts one from a real wrong
   answer in that section's checkpoint and puts it in the review sheet.
8. Every bolded term has a glossary entry.

### 1.5 Treatments

| Treatment | Meaning |
|---|---|
| **Voice pass** | Section 1.4 only. |
| **Light edit** | Voice pass plus the listed term swaps and cuts. |
| **Tag** | Voice pass plus moving listed blocks into Enrichment. No rewriting of the science. |
| **Restructure** | The core is rebuilt at PE level from existing material; the rest is tagged or cut. Replaces the audit's "heavy rewrite" (decision 1). |

## 2. NGSS wording, checked against nextgenscience.org on 2026-10-12

The audit marked the bio and physics quotes "verify". Three differ from the
audit's text and are corrected here. Chem's are verbatim in the repo already.

| PE | Clarification statement | Assessment boundary |
|---|---|---|
| HS-LS1-2 | Emphasis is on functions at the organism system level such as nutrient uptake, water delivery, and organism movement in response to neural stimuli. An example of an interacting system could be an artery depending on the proper function of elastic tissue and smooth muscle to regulate and deliver the proper amount of blood within the circulatory system. | Assessment does not include interactions and functions at the molecular or chemical reaction level. |
| HS-LS1-3 | Examples of investigations could include heart rate response to exercise, stomate response to moisture and temperature, and root development in response to water levels. | Assessment does not include the cellular processes involved in the feedback mechanism. |
| HS-LS1-7 | Emphasis is on the conceptual understanding of the inputs and outputs of the process of cellular respiration. *(The audit said none was published.)* | Assessment should not include identification of the steps or specific processes involved in cellular respiration. |
| HS-PS2-1 | Examples of data could include tables or graphs of position or velocity as a function of time for objects subject to a net unbalanced force, such as a falling object, an object sliding down a ramp, or a moving object being pulled by a constant force. *(The audit had "rolling".)* | Assessment is limited to one-dimensional motion and to macroscopic objects moving at non-relativistic speeds. |
| HS-PS2-2 | Emphasis is on the quantitative conservation of momentum in interactions and the qualitative meaning of this principle. *(The audit's wording differed.)* | Assessment is limited to systems of two macroscopic bodies moving in one dimension. |

## 3. Bio (5 pages, session 4a)

| Page | Treatment | Core keeps | Enrichment | Cut |
|---|---|---|---|---|
| 1-1 Respiration | Light edit; sim redesign | Bonds break, bonds form, atoms are accounted for, energy is transferred (sections 02 and 04) | none | Cristae, matrix and outer membrane; muscle-fibre detail; VO₂ max; "phosphorylate"; the name "First Law of Thermodynamics" (the idea stays in plain words); "mesophyll" and "vacuum-infiltrated" (plain words) |
| 1-2 Thermoregulation | Light edit; sim redesign | Sensor, control centre, effectors, return to the set point; vasoconstriction and vasodilation (glossary) | none | "Preoptic area"; "cholinergic", "eccrine"; latent heat value; arteriole sizes in µm; "arrector pili" |
| 1-3 Osmoregulation | Restructure; sim redesign | Hypothalamus senses, pituitary releases ADH, kidneys return more water, blood concentration comes back | One block: "How a kidney cell lets more water through" (water channels called aquaporins, added to the cell surface when ADH arrives) | V2 receptors, G-proteins, cAMP, vesicle traffic; the medullary gradient and urea recycling; "water potential"; nephron part names; "polyuria", "polydipsia" |
| 1-4 Blood glucose | Restructure; sim redesign | Pancreas senses; insulin makes liver and muscle take in and store glucose; glucagon makes the liver release it; Type 1 and Type 2 in plain words | One block: "How insulin lets glucose into a cell" (glucose transporters, and which tissues have them) | Kinase cascade; vesicle translocation; "exocytosis"; "Islets of Langerhans"; "glycogenesis", "glycogenolysis", "gluconeogenesis" (plain words); "hyperinsulinemia"; "postprandial" |
| Unit 1 review | Restructure, after the lessons | The three feedback loops and the matter and energy accounting | Problems that need the two blocks above carry the tag | "30-32 ATP", Complex IV, the citric acid cycle (decision 9); phosphoanhydride bonds; V2 and GLUT4 mechanism in Problems 1(c), 3 and 4(c) |

Also in bio:
- **Review auto-checked section** (D8): six to eight items built from the
  lessons' own checkpoints, as `commit-reveal` drill and `sort-classify`.
- **Wrong answers shown "Correct!"** in 1-1 disappears with the move to the
  widget.
- **Glossary:** add entries for every kept term that lacks one (osmosis,
  osmoreceptor and aquaporin today).

**For David (bio):**
- Liver glucose uptake and GLUT4 (audit seed S9). The 1-4 Enrichment block
  must say which tissues have the transporter. Your wording.
- Lesson 1-1's leaf-disc claim (discs float in the dark because of respiration
  gas). The audit could not tell whether this is your intended simplification.
- Lesson 1-3's hook says blood concentration "rises by only 4%"; the table
  gives 288 to 304, which is 5.6%.

## 4. Physics (10 pages, session 4b)

Every page: mission names stay as names. "Cadet Directive" becomes the hero's
lede, "Target Competency" becomes the Objective row, and section tags use plain
labels (decision 4).

| Page | Treatment | Core keeps | Enrichment | Notes |
|---|---|---|---|---|
| 1-1 Constant velocity | Voice pass | all | none | |
| 1-2 Motion graphs | Light edit | Slope as velocity on a straight segment; area under a velocity graph; steeper means faster | The tangent-line construction for velocity at an instant, with the studio's tangent overlay | Two questions rebuilt (option ratios 3.0 and 4.3 today) |
| 1-3 Kinematics equations | Tag, plus rebuild on the standard template | Sections 01 and 02: the three equations in one dimension, and the solver | Sections 03 and 04 (launches in two directions, both projectile sims), the projectile checkpoints, the projectile written response (decision 5) | New core items needed: a 1D hook, two 1D checkpoints, 1D recall blanks, one 1D written response. Drafted by the session, approved in the review sheet |
| Level 1 review | Tag | 1D problems | The projectile problem (decision 5) | Add the auto-checked section (D8) |
| 2-1 First law | Tag | Forces, inertia, balanced forces along a line, the FBD method | Mission 4 and the angle controls (decision 6) | |
| 2-2 Second law | Tag | ΣF = ma in one dimension; apparent weight in an elevator | Section 03, "Component Equations in Two Dimensions" (decision 6) | Objective loses "multi-axis" |
| 2-3 Third law | Light edit, plus one new core section | Interaction pairs; why the pair never cancels | none | **New:** a short core section on conservation of momentum, two bodies, one dimension, placed before the Collider (decision 7). Drafted by the session, approved in the review sheet |
| 2-4 Friction and inclines | Tag | Static and kinetic friction on a level surface; a block on a ramp, described without trigonometry | "Tilted Reference Frames"; the critical angle; any checkpoint that needs sine, cosine or tangent (decision 6) | |
| 2-5 Coupled systems | Light edit | all (one dimension along the cord) | none | One value of g |
| Level 2 review | Tag | 1D problems | Any problem that needs trigonometry | Add the auto-checked section (D8) |

Also in physics:
- **Glossary terms.** Level 2 has none today. The session marks each new term
  and adds its entry (for example net force, inertia, normal force, friction,
  tension, momentum). Definitions go in the review sheet.
- **Exclamation marks** (45) and "Show Answers before an attempt" go.
- **No new figures.** Level 2 has none; adding them is new content and is not
  part of this project.

## 5. Replacement glossary

Core text uses the right-hand wording. The technical term may appear inside an
Enrichment block, or once in a glossary entry. Wording is a proposal; David's
edits in the review sheet win.

| Above-level term | Core wording |
|---|---|
| plasma osmolarity, hypertonic | how concentrated the blood is |
| osmoreceptor neurons | sensors in the brain |
| exocytosis of ADH; secretes | the pituitary releases ADH |
| collecting duct, nephron, tubule | kidney tubes |
| peritubular capillaries, vasa recta | blood vessels around the tubes |
| water reabsorption | the kidneys return water to the blood |
| diabetes insipidus | too little ADH |
| hepatocytes, myocytes | liver cells, muscle cells |
| Islets of Langerhans; alpha and beta cells | the pancreas |
| glycogenesis | stores glucose as glycogen |
| glycogenolysis | breaks glycogen back into glucose |
| insulin resistance, desensitization | cells stop responding well to insulin |
| OGTT; postprandial | glucose tolerance test; after a meal |
| preoptic anterior hypothalamus | the hypothalamus |
| vasomotor tone, caliber, perfusion | how wide the blood vessels are; blood flow |
| shivering thermogenesis | shivering muscles make heat |
| latent heat of vaporization | evaporating sweat takes heat from the skin |
| Krebs cycle, electron transport chain | (not named) bonds break and new bonds form |
| phosphorylate ADP | store the energy in ATP |
| telemetry (physics) | readings, data |
| translational equilibrium (physics) | balanced forces |
| resolve into orthogonal components (physics) | split into across and up-and-down parts (Enrichment only) |
| saturation kinetics, V<sub>max</sub> (chem 4-1b) | top speed, when every active site is busy (Enrichment only) |
| statistical microstates (chem 3-4a) | the many ways the particles can share the energy (Enrichment only) |

## 6. Chem (27 pages, session 4c)

Lessons are named by file prefix, as in the audit.

### 6.1 Voice pass only (5)

1-2a, 1-3a, 2-2a, 2-7b, 3-1a.

### 6.2 Light edit (13)

| Page | Specific work |
|---|---|
| 1-1b | Present kJ/mol values as supporting data; the target is the relative trend |
| 1-2b | Voice pass. Naming the forces is core (decision 11) |
| 1-2e | Six sentences over 25 words; 15 exclamation marks |
| 1-3b | Voice pass. Naming the forces is core (decision 11) |
| 2-6a | Sentence tail (16% over the cap) |
| 2-7a | Two task prompts of 43 and 47 words |
| 2-7c | Voice pass. Limiting reactant is core (decision 11) |
| 3-1b | 40 sentences over the cap; "an astounding 113.0 kJ" |
| 3-1c | Question at line 139 rebuilt (ratio 2.2) |
| 4-1a | Question at line 119 rebuilt (a 28-word key and two cartoon options); the Maxwell-Boltzmann figure becomes a real Enrichment block |
| 4-6a | The Haber task split into two single-variable questions; sim redesign |
| 5-2a | Recombination epoch, the 2.725 K spectrum and Hubble's law move to one Enrichment block |
| 3-4a | The microstate argument and the speed histogram move to Enrichment; "entropy" stays as a one-sentence gloss |

### 6.3 Tag (3)

| Page | Core keeps | Enrichment |
|---|---|---|
| 1-1a | Elements 1 to 20 and the main-group elements to 36 | The 4s-before-3d section, the six-step figure's transition-metal steps, the practice items on Sc to Zn |
| 1-2c | Ionic and covalent naming, polyatomic ions, prefixes | Roman numerals for transition metals, with their checkpoint (decision 11) |
| 5-8a | Alpha, beta and gamma decay; fission and fusion as changes to the nucleus; the scale of the energy; half-life as "half remain" | The half-life equation, positron emission, mass-defect energy calculation, the chain-reaction panel |

### 6.4 Restructure (6)

| Page | Core keeps | Enrichment | Cut |
|---|---|---|---|
| 3-14a | Breaking bonds absorbs energy, forming bonds releases it; the profile graph; a catalyst lowers the barrier | The bond-energy sum for ΔH, its calculator, checklist line and practice items (decision 11) | none |
| 4-1b | What a catalyst does: lowers the barrier, is not used up, leaves the energy released unchanged. Enzymes named as the catalysts of living things, in one paragraph | How enzymes work: active site, lock-and-key and induced fit, heat and pH damage, top speed. The enzyme sim | Dates and names (Fischer 1894, Koshland 1958); "zero-order with respect to substrate" |
| 4-6b | Le Chatelier in the body: carbon dioxide in the blood as one equilibrium, and what faster breathing does to it | Buffers as conjugate pairs, pH values, the coupled equation, the blood-buffer sim | "Carbonic anhydrase" |
| 5-1a | Fusion in the core powers the Sun (named, no steps); how the energy reaches Earth; why the Sun is stable; mass against brightness and lifetime | The proton-proton chain as a still figure; mass defect and E = Δm c² | Positron and neutrino bookkeeping in core checklist items |
| 5-3a | Which elements form where: hydrogen and helium from the Big Bang, elements up to iron inside stars, heavier ones in explosions and collisions; how this depends on a star's mass and age | Shell-by-shell burning, binding-energy detail, the s- and r-processes, neutron capture | "Type II" labels in core text |
| 5-4a | Higher frequency means more energy per photon; ionising and non-ionising; brightness is not photon energy; judging a claim in a published source | E = hf calculations, eV values, the device comparison, the DNA chemistry | none |

**For David (chem):**
- 5-1a: the PE stresses how fusion energy reaches Earth and the evidence from
  other stars and from sunspots and flares. Session 4c reports how much of that
  the lesson has today. It does not write new sections.
- 5-4a: the PE is about judging claims in published materials. The same check
  applies.

## 7. Hero titles for bio and physics

Chem already has its 27. These 15 follow the same form: the phenomenon or the
paradox, in one to three short sentences. The lesson's name moves to the label
above. Each uses facts already in that lesson. David accepted them as written on
2026-10-12. Each still appears in its book's review sheet for a second look in
context.

| Page | Title |
|---|---|
| Bio 1-1 | The sugar you burn leaves your body as breath and water. |
| Bio 1-2 | The air swings 43 degrees. Leo's core barely moves. |
| Bio 1-3 | She sweats out 1.4 litres. Her blood barely changes. |
| Bio 1-4 | Eat a big lunch or skip it. Your blood sugar returns to the same band. |
| Bio review | Unit 1 in one sitting. Find what you still cannot explain. |
| Physics 1-1 | Before a rover moves one metre, someone has to decide where zero is. |
| Physics 1-2 | A number gives you one snapshot. A graph gives you the whole trip. |
| Physics 1-3 | Drop a capsule from 45 metres. Three equations tell you when it lands. |
| Physics Level 1 review | Level 1 in one sitting. Find what you still cannot explain. |
| Physics 2-1 | No engine has pushed Voyager 1 for decades. It has not slowed down. |
| Physics 2-2 | The engines pushed no harder. The rocket accelerated three times faster. |
| Physics 2-3 | An astronaut is stranded five metres from the airlock. She throws her toolbox away to get home. |
| Physics 2-4 | A 36,000 kg truck loses its brakes. A ramp of loose gravel stops it. |
| Physics 2-5 | An elevator motor never lifts the full weight of the cabin. |
| Physics Level 2 review | Level 2 in one sitting. Find what you still cannot explain. |

## 8. What the sessions do not decide

- Every "For David" item above and in the sim briefs.
- Whether a flagged science point is an error. The session reports; David
  rules.
