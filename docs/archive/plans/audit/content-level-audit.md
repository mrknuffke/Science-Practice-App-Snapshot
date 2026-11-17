# Content level and register audit (2C)

Phase 2 of [the consistency plan](../textbook-consistency-fixes.md). Read-only.
Bio first, then physics, then chem.

**Status:** bio, physics and chem done (2026-10-12).

David's judgement, restated from the plan: the explanatory resolution is too
high for general high school, and the register is off. This audit measures the
claim against fixed yardsticks. **It proposes no rewrites.** Suggested
replacements are examples for Phase 3, and David decides.

## Yardsticks

1. **The NGSS PE the lesson serves, and its assessment boundary.** Content past
   the boundary is "above level".
2. **Tier 3 from `CLAUDE.md`** (general high school): sentences of 12 to 18
   words, multiple-choice options of 22 words or fewer, standard terms anchored
   to observable phenomena. The `VOICE.md` section 8 (STE) caps also apply:
   instructions 20 words, descriptions 25 words, at most 3 nouns in a stack,
   "because" for cause, active voice with a named actor.
3. **`VOICE.md` and its QA list**, including: at least one named misconception
   per concept section, feedback that explains why a wrong answer was tempting,
   captions that state a takeaway.

## Method and limits

- **Counts come from a script** that splits text on end punctuation. It counts
  words in label prefixes such as "Claim (1 mark):" and may split on "e.g.".
  Treat sentence counts as close, not exact. Passive voice and "since/as" counts
  are rough pattern matches and are given only to show direction.
- **Term counts** include lesson HTML and lesson JS, with comments removed. They
  differ from the plan's seed list by up to 3 per term (for example GLUT: 24
  here, 27 in the seed) because the seed counted comment text. Per-lesson
  distribution is the new information.
- **Citations:** `1-3.html:233` is a line in `public/bio/lessons/1-3_osmoregulation-water-balance.html`.
  `1-3.js:310` is the sim script. Line numbers are from commit `59ef11b`.
- **The bio References sheet holds the PE statement only.** Assessment
  boundaries are quoted from the plan (plan section "Why this is a multi-phase
  project", item 5). Clarification statements are not in the repo; the ones below
  are from my reading of the published NGSS text and are marked "verify". David
  should confirm the wording before it is cited in a Phase 3 document.

---

# Part 1: Bio

## PEs and boundaries

Source for the statements: `public/bio/References/U1 Homeostasis.html`
(verbatim export of the NGSS text).

| PE | Statement | Assessment boundary (from the plan) | Clarification statement (verify) |
|---|---|---|---|
| **HS-LS1-2** Interacting Body Systems | "Develop and use a model to illustrate the hierarchical organization of interacting systems that provide specific functions within multicellular organisms." | "interactions and functions at the molecular or chemical reaction level" are excluded | Emphasis is on functions at the organism system level, such as nutrient uptake, water delivery and movement in response to neural stimuli. |
| **HS-LS1-3** Feedback Mechanisms and Homeostasis | "Plan and conduct an investigation to provide evidence that feedback mechanisms maintain homeostasis." | "the cellular processes involved in the feedback mechanism" are excluded | Examples include heart rate response to exercise, stomate response to moisture and temperature, and root development in response to water levels. |
| **HS-LS1-7** Cellular Respiration and Energy Transfer | "Use a model to illustrate that cellular respiration is a chemical process whereby the bonds of food molecules and oxygen molecules are broken and the bonds in new compounds are formed resulting in a net transfer of energy." | "identification of the steps or specific processes involved in cellular respiration" is excluded | None published. |

**Reading the boundaries for these lessons.** For 1-2 to 1-4, the target is
feedback at the level of organs and the whole body: sensor, control centre,
effector, and the variable returning to its set point. Receptors, signalling
cascades, membrane proteins and vesicle traffic are molecular or cellular
mechanism, which both HS-LS1-2 and HS-LS1-3 exclude. For 1-1, the target is the
matter and energy accounting (bonds broken, bonds formed, net energy transfer).
Naming the stages of respiration and the structures inside the mitochondrion
goes past it.

## Seed terms: where they live

Counts per lesson (HTML plus JS, comments removed). Seed list from the plan; a
blank means none.

| Term | 1-1 | 1-2 | 1-3 | 1-4 | review | Seed total |
|---|--:|--:|--:|--:|--:|--:|
| GLUT (GLUT4) | | | | 20 | 4 | 27 |
| hepatocyte | | | | 7 | 2 | 11 |
| myofibril | 4 | | | | | 10 |
| hypertonic | | | 4 | | 2 | 10 |
| Islets of Langerhans | | | | 2 | 1 | 5 |
| endocytosis / endocytosed | | | 2 | | 1 | 4 |
| interstitium / interstitial | | | (code comments only) | | | 4 |
| exocytosis / exocytose | | | 1 | 3 | | 3 |
| translocate / translocation | | | 1 | 4 | 2 | 3 |
| medullary / medulla | | | 10 | | 1 | 3 |
| vasomotor | | 1 | | | | 3 |
| VO2 | 4 | | | | | 3 |
| cAMP | | | 1 | | | 2 |
| sarcoplasm | (code comments only) | | | | | 2 |
| perfusion | | 2 | | | | 2 |
| caliber | | 2 | | | | 2 |
| G-protein | | | 1 | | | 1 |
| Krebs / citric acid cycle | 1 | | | | 1 | 1 |
| vasopressin | | | 1 | | | 1 |
| hydrolysis / hydrolyze | 1 | | | 1 | 1 | 1 |

(Interstitium and sarcoplasm appear only in code comments, which students do
not see. cAMP appears once in student text, `1-3.html:233`, not twice as in the
seed. Counts below the seed totals reflect the comment-stripping noted above.)

**Other above-level terms the seed list does not include** (counts, HTML plus
JS): osmolarity / mOsm 57 (1-3: 50, review: 7), aquaporin-2 / AQP2 27 (1-3: 25),
glycogenesis / glycogenolysis 11, Loop of Henle / glomerulus / nephron 9,
sarcomere / actin / myosin / Z-disc 8, vesicle 8, principal cell / epithelium
8, basolateral / apical 7, eccrine / cholinergic 5, latent heat of vaporization
5, polyuria / polydipsia 5, hyperinsulinemia / hyperglycemia 5, preoptic 4,
vasa recta / peritubular 4, cristae 3, piloerection 3, thermogenesis 3, V2
receptor 3, Complex IV / electron transport 3, mesophyll / vacuum infiltration 2,
facilitated diffusion 2, insulin resistance / receptor desensitization 2, kinase
cascade 1, gluconeogenesis 1, First Law of Thermodynamics 1, phosphoanhydride
and phosphorylate 2.

**The glossary** (`glossary.js`) holds 27 entries, almost all at level
(homeostasis, stimulus, receptor, insulin, glucagon). None of the seed terms
has an entry except through `adh`, `glycogen` and `mitochondria`. So the book
introduces about 40 advanced terms and defines almost none of them.

## Register at a glance

| Page | Sentences | Mean words | Over 18 words | Over 25 words | "Correct!" openers | Named misconceptions | "you / your" |
|---|--:|--:|--:|--:|--:|--:|--:|
| 1-1 | 106 | 11.7 | 17 (16%) | 4 | 3 (+1 in JS) | 0 | 2 |
| 1-2 | 77 | 12.5 | 20 (26%) | 8 | 0 | 0 | 4 |
| 1-3 | 89 | 12.4 | 20 (22%) | 7 | 0 | 0 | 4 |
| 1-4 | 97 | 12.4 | 23 (24%) | 6 | 0 | 0 | 3 |
| review | 118 | 10.2 | 17 (14%) | 8 | 0 | 0 | 0 |

The averages look fine. The damage is in the tails: a quarter of the sentences
in 1-2 to 1-4 are over the Tier 3 cap, and the longest are the scoring-guide and
mechanism sentences (30 to 41 words). Almost no sentence addresses the student
as "you". No concept section names a common wrong move, which `VOICE.md`
QA item 4 requires.

## Multiple-choice options (all 10 questions)

| Question | Words per option (correct marked *) | Longest / shortest | Correct is the longest? | Cartoon distractors (candidates) |
|---|---|--:|---|---|
| 1-1 Q1 (`1-1.html:248`) | 12, 12*, 10, 10 | 1.20 | tied | none |
| 1-1 Q2 (`:278`) | 15, 17*, 14, 16 | 1.21 | yes | none |
| 1-1 Q3 (`:308`) | 14, 14, 17*, 15 | 1.21 | yes | (D) "direct conversion of waste carbon dioxide into oxygen atoms" (`:324`) |
| 1-2 CP1 (`1-2.html:354`) | 16, 15*, 15 | 1.07 | no | (C) "blood cells in the fingers rapidly evaporate their water content" (`:372`) |
| 1-2 CP2 (`:380`) | 20*, 13, 12 | 1.67 | yes | (C) "hypothalamus stops receiving nerve signals whenever relative humidity exceeds 80%" (`:398`) |
| 1-3 CP1 (`1-3.html:390`) | 12, 14*, 12 | 1.17 | yes | (C) "nephrons permanently destroy their aquaporin channels" (`:408`) |
| 1-3 CP2 (`:416`) | 15*, 12, 10 | 1.50 | yes | (C) "immediate hypothermia caused by loss of muscle shivering capacity" (`:434`) |
| 1-4 CP1 (`1-4.html:393`) | 13, 17*, 9 | **1.89** | yes | (C) "The stomach converts swallowed air into glucose polymers" (`:411`) |
| 1-4 CP2 (`:419`) | 19*, 10, 13 | **1.90** | yes | (B) "High glucose breaks all mitochondria..." (`:433`), (C) "Excess glucagon converts all internal cellular ATP directly back into carbon dioxide" (`:437`) |

- **The correct answer is the longest or tied-longest in 9 of 10 questions.**
  Two questions (1-4 CP1 and CP2) are also over the 1.8 length-ratio limit in
  `CLAUDE.md`. All options are within 22 words.
- **In 1-2, 1-3 and 1-4 the correct letters are b then a in every lesson**
  (the inline handlers test `'b'` then `'a'`, `1-2.html:473`, `:492`; the same in
  1-3 and 1-4). A student can learn the pattern.
- **Cartoon distractors:** 8 candidates across 6 questions. Arguably real
  misconceptions that survive: 1-1 Q2 (C) "the stroke mechanically squeezes
  stored carbon dioxide" (`:291`), 1-4 CP1 (A) "beta cells secrete insulin to
  break down glycogen" (`1-4.html:403`).
- **Feedback.** In 1-1, the `.reveal-box` text is fixed and opens whichever
  option the student chose. It begins "Correct!" (`1-1.html:272`, `:302`,
  `:332`). **A student who picks a wrong option is told "Correct!"**
  (`core.js:186-188` only opens the box). In 1-2 to 1-4 the wrong-answer message
  is one string per question: "Re-evaluate: The correct option is (B)..."
  (`1-2.html:476`, `:495`; `1-4.html:514`, `:533`). It does not say why the
  chosen option was tempting (`VOICE.md` rule 10).

---

## Lesson 1-1: Cellular Respiration and Energy Transfer

**PE:** HS-LS1-7. **Boundary:** no identification of the steps or specific
processes of cellular respiration.

### Above-level concepts

| Item | Location | Suggested course-level replacement (David decides) |
|---|---|---|
| "Krebs/ETC" on the sim's matrix label | `1-1.js:641` | "Bonds break and re-form here" |
| Cristae, outer membrane, ATP synthase knobs, "Folded Cristae (ATP Synthase)" | `1-1.js:587-626`, `:648-649`; `1-1.html:170` ("outer membrane, folded cristae, and matrix") | Draw the mitochondrion as one labelled organelle, "where respiration happens" |
| Myofibrils, sarcomere, actin, myosin, Z-discs, "ATP Hydrolysis (Power Stroke)" | `1-1.js:486-552`; `1-1.html:224` ("contracting myofibril filaments") | "Muscle fibres use ATP to pull" or remove the panel |
| VO2 max (4) and mmol/min units | `1-1.js:52`, `:61`, `:70`; `1-1.html:206` | "Oxygen used per minute" with a small, plain number scale |
| "phosphorylate ADP into ATP" | `1-1.html:332` | "add a phosphate to ADP to make ATP" or "store the energy in ATP" |
| "First Law of Thermodynamics" | `1-1.html:332` | "Energy is never created. It moves from one place to another." |
| "carbon-carbon and carbon-hydrogen bonds" | `1-1.html:302` | "bonds in glucose" |
| "mesophyll", "vacuum-infiltrated" | `1-1.html:398`, `:407` | "leaf discs" and "air removed from the leaf discs" |
| "terminal"/"phosphoanhydride" language | review only | see review |

The core of the lesson is at level. Sections 02 and 04 do the work the PE asks
for: bonds break, bonds form, atoms are accounted for. The above-level content
is concentrated in the sim and its readouts.

### Register

- **Over Tier 3 cap:** 17 of 106 sentences; 4 over 25 words. The five longest:
  32 words, `1-1.html:170` ("On the right, look inside Maya's active muscle cell to
  see an authentic mitochondrion: outer membrane, folded cristae..."); 32 words,
  `:332` ("The chemical potential energy stored in the chemical bonds of glucose is
  released as bonds are broken and reformed..."); 30 words, `:100`; 29 words,
  `:479`; 24 words, `:103`.
- **Noun stacks:** "Dual-Scale Respiration Engine: Maya's Swim & Mitochondrial
  Flux" (`:168`, heading); "Tracing matter rearrangement and net energy transfer
  across biological systems" (`:90`); "gas exchange rates" (`:251`); "Metabolic
  Demands Under Extreme Exertion" (`:97`).
- **Passive voice that hides the actor:** "the chemical bonds ... are
  systematically broken apart" (`:123`); "Energy is transferred between forms"
  (`:154`); "energy ... is released as bonds are broken and reformed" (`:332`).
  Suggested actor: "the cell breaks the bonds".
- **Nominalisations:** "gas exchange rates", "net energy transfer", "the
  continuous supply of usable energy" (`:100`).
- **Standards jargon addressed to students:** the callout title "Critical
  Disciplinary Core Idea: Matter vs. Energy" (`:151`).
- **Voice:** "we must look inside" (`:108`); "Correct!" openers (see above); no
  named misconception.

### Dependent content (rewrite together)

- The sim's labels, mitochondrion drawing and four readouts (`1-1.js:46-74`,
  `:555-667`).
- Legend text `1-1.html:219-228` names cristae, matrix and myofibrils.
- Checkpoints 2 and 3 (`:278-335`) lean on "carbon-carbon bonds" and the First
  Law.
- Review Pillar 1 and Problem 1.

### Verdict: **light edit** for the page text; the sim is a separate redesign
(see the 2B report).

---

## Lesson 1-2: Homeostasis and Thermoregulation

**PE:** HS-LS1-2, HS-LS1-3. **Boundaries:** no molecular or chemical-reaction
interactions (LS1-2); no cellular processes in the feedback mechanism (LS1-3).

### Above-level concepts

| Item | Location | Suggested replacement |
|---|---|---|
| "preoptic area" / "preoptic anterior hypothalamus" | `1-2.html:204`, `:438` | "the hypothalamus" |
| "Sympathetic cholinergic nerves stimulate eccrine sweat glands to secrete hypotonic fluid" | `:251` | "Nerves signal the sweat glands to release sweat" |
| "latent heat of vaporization of water (~2400 J/g)" | `:251`, `:390`, `:493`, `:495` | "Evaporating sweat takes heat from the skin" |
| Arteriole sizes "14 µm down to 4 µm", "26 µm" | `:241`, `:250`, sim readout | "narrow" and "widen", with the sim's picture carrying the size |
| "smooth muscle rings around dermal arterioles", "arrector pili" | `:241`, `:243` | "small muscles around the blood vessels" |
| "antagonistic skeletal muscles", "shivering thermogenesis" | `:242` | "shivering muscles make heat" |
| vasomotor, caliber, perfusion | `:267`, `:269`, `:310`, `:324`; `1-2.js:143` | "blood vessel width", "blood flow" |

This lesson is mostly organ-level, so it is closest to what the PEs ask. The
terms vasoconstriction and vasodilation are standard high school vocabulary and
have glossary entries. The pockets above are the exceptions.

### Register

- **Over Tier 3 cap:** 20 of 77 sentences (26%); 8 over 25 words. Longest:
  32 words `:175` (scenario paragraph); 31 words `:436` (scoring guide claim);
  29 words `:183`; 29 words `:493`; 27 words `:250`.
- **Noun stacks / jargon strings:** "Universal Architecture of Negative Feedback"
  (`:196`), "Environmental Chamber & Vasomotor Simulator" (`:267`), "Evidence-
  Claim-Reasoning (ECR) Challenge" (`:415`).
- **Nominalisations and hedging:** "The capacity to sustain a stable internal
  state in the presence of turbulent external conditions is known as homeostasis"
  (`:183`, 20 words before the colon sentence continues); "dynamic equilibrium".
- **Flavour words in a data context:** "dramatic external swings", "razor-thin
  window" (`:175`).
- **Standards text shown to students:** "Target Standards: NGSS HS-LS1-2
  (Interacting Body Systems)..." (`:178`).
- **MCQ and feedback:** see the table above. Two cartoon distractors.

### Dependent content

- Sim labels and the status strings (`1-2.js:133-145`).
- Rubric (`:436-439`) uses "preoptic anterior hypothalamus" and "somatic motor
  signals".
- Review Pillar 2 table and Problem 2.

### Verdict: **light edit.**

---

## Lesson 1-3: Osmoregulation and Water Balance

**PE:** HS-LS1-2, HS-LS1-3. **Boundaries:** as for 1-2.

### Above-level concepts

| Item | Location | Suggested replacement |
|---|---|---|
| "ADH travels to kidney collecting duct principal cells and binds to basolateral V2 G-protein coupled receptors. This initiates an intracellular cAMP signaling cascade, causing storage vesicles carrying aquaporin-2 (AQP2) water channels to translocate and fuse with the apical membrane" | `1-3.html:233` | "ADH tells the kidney to let more water go back into the blood." |
| "exocytosis of ADH" | `:232` | "the pituitary releases ADH" |
| Renal medullary gradient: "active sodium pumping in the Loop of Henle and urea recycling", "thermodynamic pulling force" | `:210` | "The inner kidney is much saltier than the urine tubes, so water moves out of the tubes into the blood." |
| osmolarity, mOsm/kg (50 uses), "hypertonic" | `:178`, `:193`, `:210`, `:230-234`, sim readouts | "how concentrated the blood is" with one plain scale |
| nephron, glomerulus (~180 L/day), peritubular capillaries, vasa recta | `:197`, `:234`, `:474`; `1-3.js:390` | "kidney tubes", "blood vessels around the tubes" |
| "water potential" | `:188`, `:193` | delete (this is a plant-biology idea) |
| "osmoreceptor neurons detect cellular shrinkage" | `:231` | "sensors in the brain notice the blood getting more concentrated" |
| "diabetes insipidus", "polyuria", "polydipsia" | `:421`, `:426` | "too little ADH" in plain words |
| Sim: aquaporin density in channels per µm² | `:303`, `1-3.js:101` | remove |

This lesson is the clearest case. The PE is organ-level feedback, and the
lesson's effector step, its sim and its scoring guide are cellular mechanism.

### Register

- **Over Tier 3 cap:** 20 of 89 (22%); 7 over 25 words. Longest: 35 words `:471`;
  33 words `:473`; 31 words `:474`; 29 words `:210`; 28 words `:232`.
- **Noun stacks:** "Nephron Collecting Duct & Aquaporin Simulator" (`:247`, five
  nouns); "Singapore American School consensus dataset" (`:322`); "Plasma
  Osmolarity (mOsm/kg)" (table header, `:331`).
- **Passive voice:** "rising plasma osmolarity is detected by hypothalamic
  osmoreceptors" (`:473`); "Water is drawn out of the tubule ... and reclaimed
  into peritubular capillaries" (`:474`); "The fine-tuning of water
  reabsorption ... is regulated by..." (`:226`).
- **Nominalisations:** "the exocytosis of ADH" (`:232`), "the fine-tuning of water
  reabsorption" (`:226`), "Cellular Effector Mechanism" (rubric label, `:473`).
- **Intensifiers and flavour:** "extraordinarily hypertonic" (`:210`),
  "substantial fluid loss" (`:170`), "extremely dilute urine" (`:426`).
- **Numbers that disagree:** the hook says osmolarity "rises by only 4%" (`:170`),
  the table gives 288 to 304 (5.6%).

### Dependent content

- The sim draws the cellular scale only (principal cell, V2 receptors, AQP2
  vesicles; `1-3.js:240-359`). A rewrite to organ level removes the sim's subject.
- Checkpoint 1 option (B) says "inserting aquaporins" (`:404`); the feedback
  repeats it (`1-3.html:509-528`).
- Scoring-guide line "Cellular Effector Mechanism" (`:474`).
- Glossary: `aquaporin`, `osmosis`, `osmoreceptor` missing.
- Review Pillar 3 row, Problem 3 (entirely about V2 receptors and AQP2).

### Verdict: **heavy rewrite.**

---

## Lesson 1-4: Blood Glucose and Hormone Signaling

**PE:** HS-LS1-2, HS-LS1-3. **Boundaries:** as for 1-2.

### Above-level concepts

| Item | Location | Suggested replacement |
|---|---|---|
| GLUT4 transporters "sequestered within intracellular vesicles", "kinase cascade triggers vesicle translocation and membrane fusion" | `1-4.html:207`, `:235`, `:248`, `:251` | "Insulin tells muscle and liver cells to take in glucose." |
| GLUT4 in checkpoint 2 correct answer, and in the rubric | `:429`, `:476-477`; feedback `:531`, `:533` | answer rewritten in terms of "cells cannot take in glucose without insulin" |
| "Islets of Langerhans" | `:198`; `1-4.js:228` | "the pancreas" |
| hepatocytes, myocytes | `:207`, `:217`, `:456`, sim panel title `1-4.js:395` | "liver cells", "muscle cells" |
| glycogenesis, glycogenolysis, gluconeogenesis | `:207`, `:217`, `:407`, `:512` | "store glucose as glycogen", "break glycogen back into glucose" |
| beta and alpha cell exocytosis | `:267`, `:476`, `1-4.js:151` | "the pancreas releases insulin" |
| "desensitization (insulin resistance)", "hyperinsulinemia" | `:251` | "cells stop responding well to insulin" |
| "facilitated diffusion mediated by glucose transporter proteins" | `:235` | delete |
| "autoimmune" | `:248` | at level (keep) |
| OGTT, postprandial | `:332-335`, `:461` | "glucose tolerance test", "after a meal" |

The structure (insulin stores, glucagon releases, the pancreas senses) is the
organ-level feedback loop the PE wants. The GLUT4 mechanism is not.

### Register

- **Over Tier 3 cap:** 23 of 97 (24%); 6 over 25 words. Longest: 33 words `:475`;
  33 words `:477`; 28 words `:217`; 28 words `:424`; 27 words `:474`.
- **Noun stacks:** "Pancreatic Islet & Endocrine Seesaw Simulator" (`:265`);
  "Clinical Reference: Oral Glucose Tolerance Test (OGTT) Data" (`:332`);
  "Postprandial Homeostatic Recovery" (`:461`).
- **Passive voice and nominalisations:** "Blood glucose is monitored at 30-minute
  intervals" (`:335`); "The individual produces virtually zero insulin" (`:249`).
- **Voice:** the opening of the hook describes "diabetic shock or hypoglycemic
  syncope" (`:175`).
- **Numbers that disagree:** see the sim audit (four "normal" values).

### Dependent content

- Sim: the liver panel and GLUT4 labels (`1-4.js:411-417`, `:455`), status
  strings (`:147-155`), "Islets of Langerhans" (`:228`).
- Checkpoint 2 (`:419-442`) and its feedback; rubric lines `:476-477`.
- Review Pillar 3 row, Problem 4 part (c) (GLUT4 location).

### Verdict: **heavy rewrite.**

---

## Unit 1 review packet

**PE:** all three. The review repeats the lessons' vocabulary and adds more.

### Above-level concepts

| Item | Location | Note |
|---|---|---|
| "terminal electron acceptor at Complex IV of the mitochondrial electron transport chain", "citric acid cycle" | `1-review_packet.html:302-303` | Directly excluded by the LS1-7 boundary |
| "terminal phosphoanhydride bonds of ATP", "actin-myosin contraction, ion pumping" | `:175` | |
| "V2 receptors ... Aquaporin-2 water channels remain sequestered inside intracellular vesicles ... apical membrane" | `:368-369`, `:256` | Excluded by the LS1-3 boundary |
| GLUT4 location "endocytosed and sequestered in intracellular vesicles" | `:387`, `:394-395`, `:266` | |
| hepatocytes, Islets of Langerhans | `:264`, `:386`, `:263` | |
| polyuria, "hypertonic medulla", "renal pelvis" | `:369` | |
| "preoptic area of the anterior hypothalamus" | `:208`, `:343` | |
| "30-32 ATP" (a count stated with no basis in the lessons) | `:171` | Lesson 1-1 never gives this number |

### Register

- **Over Tier 3 cap:** 17 of 118 sentences (14%); 8 over 25 words. Longest: 41 words
  `:168` (the Pillar 1 definition); 36 words `:303`; 31 words `:425`; 30 words
  `:302`; 30 words `:368`.
- **Marks and rubric voice.** Every item carries a bracketed mark count and a
  "Scoring Criteria and Worked Solution". This is exam register, not the
  conversational Tier 3 voice.
- No second person anywhere.

### Dependent content

- It restates each lesson, so it must be rewritten after the lessons.
- Problem 1 (c) and Problem 3 (all three marks) and Problem 4 (c) depend wholly
  on above-level mechanism.

### Verdict: **heavy rewrite** (follows the lessons; about half the problems
change).

---

## Bio summary

| Lesson | Verdict | Main reason |
|---|---|---|
| 1-1 Cellular respiration | Light edit (page); sim redesign | Core accounting at level; mitochondrion and muscle detail in the sim and a few sentences |
| 1-2 Thermoregulation | Light edit | Mostly organ level; a dozen terms and long scoring-guide sentences |
| 1-3 Osmoregulation | **Heavy rewrite** | Effector step, sim, checkpoint answer and rubric are all cellular mechanism |
| 1-4 Blood glucose | **Heavy rewrite** | GLUT4 mechanism runs through text, sim, checkpoint and rubric |
| Review | **Heavy rewrite** | Inherits 1-3 and 1-4, adds Complex IV and the citric acid cycle |

**Book-wide, outside the lessons:**

- Wrong answers in 1-1 are shown "Correct!" (a logic bug, see above).
- Correct answers are the longest in 9 of 10 questions, and 1-2 to 1-4 always
  key b then a.
- 8 candidate cartoon distractors.
- 0 named misconceptions.
- 27 glossary entries against about 40 introduced advanced terms.

## Questions for David (bio, content level)

- Is hormone and structure vocabulary like "hypothalamus", "pituitary", "alpha
  and beta cells" welcome at general level, or should the organs alone carry the
  loop? The PE statements do not name them.
- Should the review keep the exam-style mark counts and "Scoring Criteria" at
  Tier 3, or move to the conversational register?
- The "30-32 ATP" figure (`1-review_packet.html:171`): keep, or remove with the
  rest of the respiration detail?

---

# Part 2: Physics

## PEs and boundaries

Source for the statements: the NGSS standards map in
`public/physics/References` (a Word file, `NGSS Standards Map Physics (Mission_
Physica).docx`) and the lesson manifest `public/physics/lessons.json`. Boundaries
and clarification statements are not in the repo; they are given from my reading
of the published NGSS text and marked "verify".

| PE | Statement (repo) | Assessment boundary (verify) | Clarification statement (verify) |
|---|---|---|---|
| **HS-PS2-1** (all 10 pages) | "Analyze data to support the claim that Newton's second law of motion describes the mathematical relationship among the net force on a macroscopic object, its mass, and its acceleration." | "Assessment is limited to one-dimensional motion and to macroscopic objects moving at nonrelativistic speeds." | "Examples of data could include tables or graphs of position or velocity as a function of time for objects subject to a net unbalanced force, such as a falling object, an object rolling down a ramp, or a moving object being pulled by a constant force." |
| **HS-PS2-2** (lesson 2-3 only) | "Use mathematical representations to support the claim that the total momentum of a system of objects is conserved when there is no net force on the system." | "Assessment is limited to systems of two macroscopic bodies moving in one dimension." | "Emphasis is on the quantitative conservation of momentum in interactions between two objects." |

**Reading the boundary for these lessons.** The boundary limits the PE to
motion along a line. A ramp is allowed (the clarification statement names it),
because the block moves along one line. What the boundary excludes is **motion in
two dimensions** (projectiles, 1-3) and, by extension, assessment of forces at
arbitrary angles. Level 1 kinematics is a foundation for the PE, not the PE
itself; the manifest tags it HS-PS2-1 anyway.

## Register at a glance

| Page | Sentences | Mean words | Over 18 words | Over 25 words | "!" in student text (HTML / JS) | Misconception or mistake wording (pattern match) | "you / your" | Mission-theme words |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| 1-1 | 131 | 9.4 | 7 (5%) | 0 | 4 / 0 | 2 | 16 | 19 |
| 1-2 | 134 | 10.3 | 19 (14%) | 0 | 5 / 1 | 3 | 8 | 15 |
| 1-3 | 146 | 8.8 | 10 (7%) | 0 | 2 / 1 | 0 | 16 | 12 |
| 1-review | 97 | 8.8 | 7 (7%) | 0 | 1 / 0 | 1 | 1 | 7 |
| 2-1 | 164 | 9.0 | 6 (4%) | 0 | 2 / 8 | 1 | 9 | 16 |
| 2-2 | 153 | 7.9 | 1 (1%) | 0 | 1 / 3 | 0 | 13 | 16 |
| 2-3 | 147 | 9.2 | 8 (5%) | 0 | 2 / 5 | 2 | 5 | 16 |
| 2-4 | 135 | 8.7 | 4 (3%) | 0 | 2 / 4 | 0 | 8 | 16 |
| 2-5 | 129 | 9.1 | 7 (5%) | 0 | 1 / 3 | 0 | 4 | 17 |
| 2-review | 125 | 8.7 | 5 (4%) | 0 | 0 / 0 | 0 | 1 | 3 |

**Physics reads at Tier 3.** No sentence is over 25 words, at most 14% are over
the 18-word cap (1-2), and the prose is concrete and direct. "Yet it moves
forward through the dark without slowing down." (`2-1.html:117`) is the target
register. This is the result of the 2026-10-05 STE pass, and the contrast with
bio (22 to 26% over cap, rubric sentences of 30 to 41 words) is large. Counts of
"!" are student text only (the HTML count excludes script blocks).

## Concept footprint against the boundary

Counts of HTML plus JS (comments removed), from the same script as bio.

| Concept | 1-1 | 1-2 | 1-3 | 2-1 | 2-2 | 2-3 | 2-4 | 2-5 |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| Trigonometry (sin, cos, tan, θ) | | | | 14 | 4 | 4 | 60 | 8 |
| Components or resolving | 2 | 4 | 2 | 5 | 10 | 2 | 9 | 2 |
| Two-dimensional wording | 2 | 6 | 13 | 3 | 3 | 2 | 2 | 2 |
| Projectile | 1 | 3 | 13 | | | | | |
| Square root / quadratic | | | 23 | | | | | |
| Critical slip angle | | | | | | | 9 | |
| Atwood or pulley | | | | | | | | 97 / 43 |
| Impulse | | | | | | 10 | | |
| Momentum | | | | | | 1 | | |
| Tangent line / instantaneous | 4 | 19 | | | | | | |

(Zero rows omitted. Rows are not exhaustive; the counts show where the load sits.)

## Lesson 1-1: Constant Velocity and 1D Motion

**PE:** HS-PS2-1 (foundation). **Boundary:** one dimension.

- **Above-level concepts:** none. Position, displacement, scalars and vectors,
  average velocity, in one dimension. The misconception is named in plain words
  ("A negative velocity does not mean slowing down", `1-1.html:294`; "One of the
  most persistent misconceptions... is treating distance and displacement as
  identical", `:166`).
- **Register:** 7 sentences over 18 words, none over 25. Worst: 25 words
  `1-1.html:363` (sim intro); 23 words `:111`; 21 words `:295`. Noun stack:
  "Interactive Tool: Velocity Unit Converter & Dimensional Analysis" (`:320`).
  Costume: "Cadet Directive" (`:108`), "Lesson 1-1 Complete!" (`:642`),
  "ARRIVED AT SAMPLE A!" (`1-1.js:378`).
- **MCQ:** one question, options 9, 9, 9, 9 words, correct = B (`1-1.html:484`).
- **Dependent content:** none above level.

**Verdict: at level.**

## Lesson 1-2: Motion Graphs and Uniform Acceleration

**PE:** HS-PS2-1. This is the clarification statement's own data type (graphs of
position or velocity against time).

- **Above-level concepts:** tangent-line slope for instantaneous velocity
  (19 mentions, `1-2.html:211-217`, and the studio's tangent overlay,
  `1-2.js:392-409`) is a calculus idea at graph level. It is a natural step for
  the PE; whether it belongs at general level is David's call. "ultrasonic
  sensor telemetry" (`:108`) is theme language.
- **Register:** 19 sentences over 18 words (14%), none over 25. Worst: 25 words
  `:570`; 24 words `:108`, `:119`, `:207`, `:346`.
- **MCQ:** two questions. **Option lengths 12, 21, 16, 7 (ratio 3.0) and 9, 26,
  7, 6 (ratio 4.3), and the correct option is the longest in both**
  (`1-2.html:525-545`, `:559-580`). Both ratios break the 1.8 limit in
  `CLAUDE.md`, and the second option is 26 words against a Tier 3 cap of 22.
  The distractors are real graph-reading errors ("Both objects are cruising
  forward at a constant speed of 5 m/s"), which is the standard to keep.
- **Dependent content:** the studio's tangent and shaded-area overlays (tangent
  overlay would go if the idea is removed).

**Verdict: light edit** (MCQ lengths; decide on the tangent-line idea).

## Lesson 1-3: Kinematics Equations and 2D Projectiles

**PE:** HS-PS2-1. **This lesson sits outside the boundary.**

- **Above-level concepts (with locations):**
  - **Two-dimensional motion.** Section 03 "Perpendicular Independence and
    Horizontal Launches" (`1-3.html:392-490`), the strobe sim, the boss challenge
    (`:494-590`), checkpoints 1 and 2 (`:598-660`), the ECR problem (`:704-745`).
    The boundary says "one-dimensional motion".
  - **The vector sum of speeds.** Part (c) of the ECR asks for the magnitude of
    the total velocity vector, v = √(vx² + vy²) (`1-3.html:715`).
  - **Square roots and rearranging.** t = √(2h/g) (23 mentions) and "derive"
    (13). Algebra beyond a single substitution.
  - **Kinematics Big Three** (10 mentions). The three equations are the usual
    toolkit; the boundary does not mention them either way.
- **Register:** 10 over 18 words, none over 25.
- **MCQ:** radio questions (3, 3, 3 options); correct letters C, B, A. Option
  lengths 12/14/10, 9/9/7, 3/3/3. Distractors name a misconception ("takes the
  shortest straight-line path", "the launcher gives it high initial kinetic
  energy"). No length tell.
- **Dependent content:** the whole lesson, both canvases and the boss badge.
  "Level 1 Boss Challenge Cleared! Solo Trial Access Granted." (`:581`) ties the
  review to this lesson.

**Verdict: scope decision for David.** If 2D projectile motion stays in the
course, this is a **light edit** (the language is at level). If the boundary is
applied literally, it is a **heavy rewrite** of sections 03 to 05.

## Level 1 review packet

Five exam frames with scoring guides. **Verdict: light edit** (inherits 1-3).
None over 25 words; 7 over 18. Includes a projectile problem under the
"Operation Projectile Precision" label (`1-review_packet.html:235`).

## Lesson 2-1: Newton's First Law and Inertia

**PE:** HS-PS2-1.

- **Above-level concepts:** force vectors at arbitrary angles (balancer angle
  sliders from 0 to 360°, `2-1.html:380`, `:396`), Mission 4 "Angled Cable Tug"
  with sin 30° and cos 30° (`2-1.js:429-447`), and the FBD protocol itself.
  Trigonometry: 14 mentions. The boundary is silent on force diagrams but
  limits the motion to one dimension.
- **Register:** 6 over 18, none over 25. Worst: 22 words `:687`; 21 words
  `:111`, `:468`, `:470`.
- **MCQ:** one question, 4 options of 11, 7, 12, 10 words, correct = B, which is
  the shortest option (`2-1.html:540`). Good. Position pattern: B.
- **Misconception content is excellent:** "Force of Inertia" and "Forward
  Force of Motion" as named traps in the FBD Selector (`2-1.html:503-506`).
- **Dependent content:** Mission 4, the angle sliders and the tester's scenarios.

**Verdict: light edit.**

## Lesson 2-2: Newton's Second Law and Acceleration

**PE:** HS-PS2-1 (the PE's own law).

- **Above-level concepts:** "resolve multi-axis force systems" (`2-2.html:111`),
  section 03 "Component Equations" (`:222`), 10 mentions of components. The 1D
  law itself (ΣF = ma, proportionality) is at level and well explained
  (`:141-200`). Apparent weight in an elevator is 1D.
- **Register:** 1 sentence over 18 words, none over 25. Best in the book.
- **MCQ:** one question, 11, 11, 11, 11 words, correct = B.
- **Dependent content:** the Rig is 1D and at level; the component equations are
  taught in section 03 only.

**Verdict: light edit** (the component section against the boundary).

## Lesson 2-3: Newton's Third Law and Action-Reaction

**PEs:** HS-PS2-1 and HS-PS2-2 (per the manifest).

- **Above-level concepts:** none. Two carts on a line is exactly the PS2-2
  boundary. The "horse and cart" and rowboat examples are concrete.
- **Coverage gap against the PE (not above level):** **momentum conservation is
  barely taught.** "momentum" occurs once in the lesson (`2-3.html:486`) and
  "conservation" nowhere; the sim shows impulses but no total-momentum readout.
  The manifest tags the lesson HS-PS2-2.
- **Register:** 8 over 18, none over 25.
- **MCQ:** one question, 14, 12, 12, 11 words, correct = B.

**Verdict: light edit; coverage gap (PS2-2).**

## Lesson 2-4: Friction Models and Inclined Planes

**PE:** HS-PS2-1; ramp named in the clarification statement.

- **Above-level concepts:** trigonometry is the heaviest load in the book (60
  mentions), section 03 "Tilted Coordinates" (`2-4.html:215`), critical slip angle
  θc = tan⁻¹(μs) (9 mentions, `2-4.js:62`). Whether tan⁻¹ is a general-level skill
  is David's call.
- **Register:** 4 over 18, none over 25.
- **MCQ:** one question, 12, 15, 11, 16 words, correct = B.
- **Dependent content:** the sim, the checkpoint at the critical angle, the
  ramp sketches.

**Verdict: light edit** (trigonometric load flagged for David).

## Lesson 2-5: Coupled Systems and Atwood Machines

**PE:** HS-PS2-1.

- **Above-level concepts:** the whole-system method, cord tension and the Atwood
  formulas (97 and 70 mentions). All of it is one-dimensional along the cord, so
  it meets the boundary. It is a topic many courses place at honors level.
- **Register:** 7 over 18, none over 25.
- **MCQ:** one question, 7, 9, 7, 10 words, correct = B.
- **Number mismatch:** checkpoint weights at g of about 10 against the sim at 9.8
  (see the sim audit).

**Verdict: light edit.**

## Level 2 review packet

**Verdict: light edit.** 5 over 18, none over 25.

## Physics voice items (apply across the book)

- **Correct answer is B in all 8 option-button questions** (1-1 once, 1-2 twice,
  2-1 to 2-5 once each). A student can score on position alone. The 1-3
  questions use radios and differ (C, B, A).
- **Costume.** "Cadet Directive", "Operation ...", "Mission Control", "Solo
  Trial", "Boss Challenge" (12 to 19 mission-theme words per lesson) against
  `VOICE.md` rule 9 ("No costume... a teacher, not a mascot"). This is a design
  choice for the book, so it is a question, not a defect.
- **Exclamation marks:** 20 in student-facing HTML and 25 in JS strings, against
  `VOICE.md` section 5. Examples: "Lesson 1-1 Complete!" (`1-1.html:642`),
  "Excellent match!" (`1-2.js:156`), "Misconception Alert!" (`2-1.js:537`),
  "Launch authorized!" (`1-3.js:672`).
- **"Show Answers"** fills the blanks without an attempt (`core.js:198-208`).

## Physics summary

| Lesson | Verdict | Main reason |
|---|---|---|
| 1-1 | At level | 1D, concrete, misconceptions named |
| 1-2 | Light edit | MCQ options up to 26 words, correct always longest; tangent-line idea |
| 1-3 | Scope decision | 2D projectile motion is outside the one-dimension boundary; language is at level |
| 1-review | Light edit | follows 1-3 |
| 2-1 | Light edit | Angled forces and trigonometry against a 1D boundary |
| 2-2 | Light edit | Component equations section |
| 2-3 | Light edit; coverage gap | Tagged PS2-2 but momentum is barely taught |
| 2-4 | Light edit | Heaviest trigonometry |
| 2-5 | Light edit | Honors-level topic, 1D |
| 2-review | Light edit | |

**No physics lesson is marked heavy rewrite.** The contrast with bio is the
finding: physics needs scope decisions, not language rewrites.

## Questions for David (physics, content level)

- Does the course keep 2D projectile motion (lesson 1-3) given the
  HS-PS2-1 boundary of one dimension?
- Does the course teach angled forces and trigonometry (2-1 Mission 4, 2-2
  component equations, 2-4 inclines)? Is `tan⁻¹` a prerequisite skill?
- Should 2-3 teach momentum conservation, since the manifest tags HS-PS2-2?
- Is the cadet and mission framing and the exclamation-mark style intended?
- Is "B" correct in every option-button question deliberate?

---

# Part 3: Chem

## PEs and boundaries

Source: `public/chem/References/Course PEs and Evidence Statements/` (one file
per PE, verbatim NGSS text). Unlike bio and physics, **chem has the boundary
text in the repo**, so nothing below is marked "verify". Spacing is normalised
(the source drops spaces in places, for example "Assessmentdoes"). The lesson to
PE map is from `public/chem/lessons.json`. Lessons are cited by file prefix, so
`4-1a.html:41` is `public/chem/lessons/4-1a_reaction-rates-collision-theory.html`
line 41. The manifest ids differ from the file names for four lessons (file
`2-2a` is manifest `1-2d`, `3-14a` is `1-4a`, `4-1a` and `4-1b` are `1-5a` and
`1-5b`, and so on); this report uses file names throughout. Line numbers are
from the working tree at commit `a52875d`.

| PE (lessons) | Clarification statement (verbatim) | Assessment boundary (verbatim) |
|---|---|---|
| **HS-PS1-1** (1-1a, 1-1b) | Examples of properties that could be predicted from patterns could include reactivity of metals, types of bonds formed, numbers of bonds formed, and reactions with oxygen. | Assessment is limited to main group elements. Assessment does not include quantitative understanding of ionization energy beyond relative trends. |
| **HS-PS1-2** (1-2a, 1-2b, 1-2c, 1-2e, 2-2a) | Examples of chemical reactions could include the reaction of sodium and chlorine, of carbon and oxygen, or of carbon and hydrogen. | Assessment is limited to chemical reactions involving main group elements and combustion reactions. |
| **HS-PS1-3** (1-3a, 1-3b) | Emphasis is on understanding the strengths of forces between particles, not on naming specific intermolecular forces (such as dipole-dipole). Examples of particles could include ions, atoms, molecules, and networked materials (such as graphite). Examples of bulk properties of substances could include the melting point and boiling point, vapor pressure, and surface tension. | Assessment does not include Raoult's law calculations of vapor pressure. |
| **HS-PS1-4** (3-14a) | Emphasis is on the idea that a chemical reaction is a system that affects the energy change. Examples of models could include molecular-level drawings and diagrams of reactions, graphs showing the relative energies of reactants and products, and representations showing energy is conserved. | Assessment does not include calculating the total bond energy changes during a chemical reaction from the bond energies of reactants and products. |
| **HS-PS1-5** (4-1a, 4-1b) | Emphasis is on student reasoning that focuses on the number and energy of collisions between molecules. | Assessment is limited to simple reactions in which there are only two reactants; evidence from temperature, concentration, and rate data; and qualitative relationships between rate and temperature. |
| **HS-PS1-6** (4-6a, 4-6b) | Emphasis is on the application of Le Chatelier's Principle and on refining designs of chemical reaction systems, including descriptions of the connection between changes made at the macroscopic level and what happens at the molecular level. Examples of designs could include different ways to increase product formation including adding reactants or removing products. | Assessment is limited to specifying the change in only one variable at a time. Assessment does not include calculating equilibrium constants and concentrations. |
| **HS-PS1-7** (2-7a, 2-7b, 2-7c) | Emphasis is on using mathematical ideas to communicate the proportional relationships between masses of atoms in the reactants and the products, and the translation of these relationships to the macroscopic scale using the mole as the conversion from the atomic to the macroscopic scale. Emphasis is on assessing students' use of mathematical thinking and not on memorization and rote application of problem-solving techniques. | Assessment does not include complex chemical reactions. |
| **HS-PS1-8** (5-8a) | Emphasis is on simple qualitative models, such as pictures or diagrams, and on the scale of energy released in nuclear processes relative to other kinds of transformations. | Assessment does not include quantitative calculation of energy released. Assessment is limited to alpha, beta, and gamma radioactive decays. |
| **HS-PS2-6** (2-6a) | Emphasis is on the attractive and repulsive forces that determine the functioning of the material. Examples could include why electrically conductive materials are often made of metal, flexible but durable materials are made up of long chained molecules, and pharmaceuticals are designed to interact with specific receptors. | Assessment is limited to provided molecular structures of specific designed materials. |
| **HS-PS3-1** (3-1a, 3-1b, 3-1c) | Emphasis is on explaining the meaning of mathematical expressions used in the model. | Assessment is limited to basic algebraic expressions or computations; to systems of two or three components; and to thermal energy, kinetic energy, and/or the energies in gravitational, magnetic, or electric fields. |
| **HS-PS3-4** (3-4a) | Emphasis is on analyzing data from student investigations and using mathematical thinking to describe the energy changes both quantitatively and conceptually. Examples of investigations could include mixing liquids at different initial temperatures or adding objects at different temperatures to water. | Assessment is limited to investigations based on materials and tools provided to students. |
| **HS-PS4-4** (5-4a) | Emphasis is on the idea that photons associated with different frequencies of light have different energies, and the damage to living tissue from electromagnetic radiation depends on the energy of the radiation. Examples of published materials could include trade books, magazines, web resources, videos, and other passages that may reflect bias. | Assessment is limited to qualitative descriptions. |
| **HS-ESS1-1** (5-1a) | Emphasis is on the energy transfer mechanisms that allow energy from nuclear fusion in the sun's core to reach Earth. Examples of evidence for the model include observations of the masses and lifetimes of other stars, as well as the ways that the sun's radiation varies due to sudden solar flares ("space weather"), the 11-year sunspot cycle, and non-cyclic variations over centuries. | Assessment does not include details of the atomic and sub-atomic processes involved with the sun's nuclear fusion. |
| **HS-ESS1-2** (5-2a) | Emphasis is on the astronomical evidence of the red shift of light from galaxies as an indication that the universe is currently expanding, the cosmic microwave background as the remnant radiation from the Big Bang, and the observed composition of ordinary matter of the universe, primarily found in stars and interstellar gases (from the spectra of electromagnetic radiation from stars), which matches that predicted by the Big Bang theory (3/4 hydrogen and 1/4 helium). | None published. |
| **HS-ESS1-3** (5-3a) | Emphasis is on the way nucleosynthesis, and therefore the different elements created, varies as a function of the mass of a star and the stage of its lifetime. | Details of the many different nucleosynthesis pathways for stars of differing masses are not assessed. |

**Reading the boundaries for these lessons.** Four of the boundaries describe
exactly the content a lesson teaches: PS1-4 excludes the bond-energy sum that
3-14a is built around, PS1-8 excludes energy calculations, PS4-4 limits
assessment to qualitative description, and ESS1-1 excludes the sub-atomic
detail of fusion. PS1-3's clarification statement discourages naming the IMFs.
These are the clearest "above level" cases in the book. The other boundaries
(main group only, simple reactions, one variable at a time) are close calls
that depend on David's course design.

**A pattern already in the book.** Four places in chem already mark content as
beyond the boundary on the page: `1-1a.html:328-329` ("Beyond assessment
boundary"), `1-2e.html:835` (naming "neutralization"), `4-1a.html:194` ("Enrichment /
Beyond Assessment" on the Maxwell-Boltzmann figure) and `3-4a.html:288`
("Enrichment" on the speed-distribution sim). Neither bio nor physics does this.
It is the right device, and it is applied to four items out of dozens.

## Method for this part

- **Register counts include widget text.** The script counts sentences in the
  page body and in every `w-config` JSON block (prompts, option labels, feedback,
  scoring guides). It ignores scripts, styles and SVG. Sentences shorter than 4
  words are dropped. Rubric lines such as "Self-score: 4 = ..." count as one
  sentence each and are the source of most of the over-25 cases.
- **These counts are higher than the checkpoint's earlier rough pass** (14.1%
  over 18 words and 63 over 25, against 10.8% and 23 in the note). The earlier
  run left out most widget text. Use the table below; do not mix the two.
- **Concept counts** come from HTML plus each lesson's `.js`, comments removed.
  Several generic patterns (a bare "shell", a bare "M" or "Q") gave false hits
  and were discarded. Only terms read in context are cited.

## Register at a glance

Sentences over the Tier 3 cap of 18 words, and over the STE description cap of
25 words. "you" counts "you", "your" and "you're". "!" counts every exclamation
mark in student text, including widget feedback.

| Page | Sentences | Mean words | Over 18 | Over 25 | "you" | "!" |
|---|--:|--:|--:|--:|--:|--:|
| 1-1a | 231 | 10.4 | 23 (10%) | 4 | 23 | 1 |
| 1-1b | 185 | 10.7 | 22 (12%) | 0 | 19 | 0 |
| 1-2a | 155 | 10.8 | 13 (8%) | 1 | 7 | 0 |
| 1-2b | 172 | 11.7 | 27 (16%) | 2 | 15 | 6 |
| 1-2c | 356 | 11.4 | 39 (11%) | 5 | 42 | 10 |
| 1-2e | 188 | 11.6 | 25 (13%) | 6 | 17 | 15 |
| 1-3a | 138 | 11.1 | 16 (12%) | 1 | 7 | 0 |
| 1-3b | 243 | 12.0 | 35 (14%) | 2 | 13 | 14 |
| 2-2a | 175 | 11.5 | 19 (11%) | 1 | 14 | 0 |
| 2-6a | 183 | 11.4 | 30 (16%) | 0 | 4 | 0 |
| 2-7a | 127 | 12.3 | 21 (17%) | 4 | 20 | 3 |
| 2-7b | 130 | 11.2 | 14 (11%) | 2 | 17 | 0 |
| 2-7c | 147 | 11.3 | 21 (14%) | 1 | 15 | 0 |
| 3-14a | 196 | 10.5 | 16 (8%) | 1 | 6 | 2 |
| 3-1a | 221 | 11.2 | 27 (12%) | 1 | 19 | 2 |
| 3-1b | 218 | 11.9 | 40 (18%) | 4 | 11 | 5 |
| 3-1c | 200 | 11.8 | 31 (16%) | 3 | 18 | 5 |
| 3-4a | 164 | 11.8 | 31 (19%) | 2 | 8 | 2 |
| 4-1a | 157 | 13.0 | 33 (21%) | 4 | 12 | 6 |
| 4-1b | 143 | 13.6 | 30 (21%) | 4 | 4 | 1 |
| 4-6a | 165 | 12.0 | 27 (16%) | 3 | 12 | 4 |
| 4-6b | 151 | 11.9 | 23 (15%) | 2 | 11 | 2 |
| 5-1a | 170 | 12.0 | 25 (15%) | 2 | 4 | 1 |
| 5-2a | 148 | 11.9 | 23 (16%) | 1 | 1 | 0 |
| 5-3a | 153 | 11.8 | 21 (14%) | 4 | 5 | 4 |
| 5-4a | 154 | 12.5 | 32 (21%) | 2 | 5 | 3 |
| 5-8a | 164 | 11.2 | 19 (12%) | 1 | 5 | 0 |
| **Book** | **4,834** | | **683 (14.1%)** | **63** | **334** | **86** |

By unit (units as in the manifest):

| Unit | Lessons | Mean words | Over 18 | "you" per lesson |
|---|--:|--:|--:|--:|
| 1 | 7 | 11.2 | 12% | 18.0 |
| 2 | 6 | 11.5 | 14% | 14.5 |
| 3 | 5 | 11.4 | 15% | 12.4 |
| 4 | 4 | 12.6 | 18% | 9.8 |
| 5 | 5 | 11.9 | 15% | 4.0 |

**Chem reads close to Tier 3, and it drifts.** Mean sentence length is 10.4 to
13.6 words, at or just under the bottom of the 12 to 18 band, which is a good
place to be. The book is better than bio (22 to 26% over cap) and behind
physics (1 to 14%, counted on page text only). The tail is the problem. Over-cap sentences rise from 12% in unit 1 to 18% in unit 4, and
the address to the student ("you") falls from 18 per lesson to 4 per lesson in
unit 5, which reads as the voice moving from a teacher at a desk toward a
reference text. The worst pages are 4-1a, 4-1b and 5-4a (21% each), then 3-4a
(19%) and 3-1b (18%).

**What the over-cap tail is made of.** Most of the 63 sentences over 25 words
are not narrative. They are three kinds:
- **Scoring guides.** "Self-score: 4 = flawless particulate justification for
  concentration, temperature tail, and surface area. 3 = ..." (`4-1a.html:440`,
  36 words; `4-1b.html:472`, 36; `3-1b.html:762`, 40; `3-4a.html:573`, 42;
  `3-1c.html:684`, 40; `4-6a.html:485`, 35; `5-4a.html:584`, 30).
  One rubric line is one "sentence" to the script. These are written in the
  examiner voice, not the teacher voice.
- **Task prompts.** "Explain why industrial chemical plants synthesize ammonia
  at an intermediate compromise temperature of ~450 °C..." (`4-6a.html:414`, 41
  words); `2-7a.html:678` (43) and `:680` (47).
- **Worked solutions.** "Step 1 (Ice Warming): q1 = m × cice × ΔT = ..."
  (`3-1b.html:750`, 33); `3-4a.html:563` (36). These are arithmetic chains, so
  length is expected; they are a different problem from prose.

Narrative sentences that are over cap are fewer than the table suggests, but
they exist: `1-1a.html:1312` (36 words, the lithium, sodium, potassium
sentence), `1-2c.html:343` (32, the ammonium exception), `1-2b.html:553` (36),
`5-3a.html:269` (26, ends in "!"), `3-1b.html:370` ("an astounding 113.0 kJ",
an empty intensifier).

**Other voice items (book-wide).**
- **Zero em-dashes.** None in any lesson (`grep` for U+2014 and `&mdash;`
  finds nothing). This is the 2026-10-05 pass holding.
- **"Since" as cause:** 2 cases (`1-2a.html:498`, `1-2b.html:486`). The third use
  (`5-8a.html:575`, "elapsed since the tree was harvested") is a time use and is
  allowed. The rest of the STE pass held.
- **Exclamation marks:** 86 in student text, concentrated in 1-2e (15), 1-3b
  (14), 1-2c (10) and 1-2b (6). In widget feedback, **39 answers open with
  "Correct!" and 51 with "Incorrect."** Examples: "Correct! Breaking glucose and
  oxygen bonds absorbs energy" (`3-14a.html:151`), "Perfect!" (`1-2e.html:890`).
  `VOICE.md` section 5 asks for no cheering. This is the same finding as physics
  (20 and 25), at larger scale.
- **Named misconceptions** (pattern match for "misconception", "common mistake",
  "tempting", "students often"): 0 in 1-1a, 1-1b, 1-2a, 1-3a, 2-7a, 2-7b, 3-1a,
  3-4a, 4-6b, 5-1a, 5-2a and 5-3a; 1 to 4 elsewhere. The best, 1-2c (4), is also
  the lesson with the most worked contrasts. `VOICE.md` QA item 4 wants one per
  concept section. The wrong-answer feedback often does name the error (see
  below), so the real count is higher than the pattern match.

## Multiple-choice options (23 questions)

Two kinds of question exist. **10 are option-button questions** (`data-correct`
on `.opt`, in 1-1b, 1-2a, 1-3a, 1-3b, 3-1a). **13 are commit-reveal "choice"
widgets** whose options sit in a JSON block (1-1a, 1-2c, 1-2e, 2-7a, 3-14a,
3-1b, 3-1c, 4-1a). Eleven more `data-predict` items (2-2a, 2-6a, 2-7b, 2-7c,
3-1a) use `data-val` buttons such as "Physical Change / Chemical Change", with
the answer revealed after the choice, and are left out.

| Question | Words per option (correct *) | Longest / shortest | Correct is longest? |
|---|---|--:|---|
| 1-1b `:272` | 6*, 7 | 1.17 | no |
| 1-1b `:377` | 11, 14* | 1.27 | yes |
| 1-2a `:492` | 5*, 7, 6 | 1.40 | no |
| 1-2a `:504` | 8, 12*, 11 | 1.50 | yes |
| 1-2a `:516` | 5, 6, 8* | 1.60 | yes |
| 1-3a `:350` | 2, 2*, 2 | 1.00 | tied |
| 1-3a `:388` | 6, 5*, 5 | 1.20 | no |
| 1-3b `:862` | 5, 5*, 5 | 1.00 | tied |
| 1-3b `:874` | 8, 7*, 9 | 1.29 | no |
| 3-1a `:244` | 12, 13*, 12 | 1.08 | yes |
| 1-1a `:998` | 9, 9* | 1.00 | tied |
| 1-2c `:354` | 10, 17*, 10, 12 | 1.70 | yes |
| 1-2c `:766` | 3, 3, 3*, 3 | 1.00 | tied |
| 1-2c `:950` | 3*, 3, 3, 3 | 1.00 | tied |
| 1-2c `:1120` | 4, 4*, 4, 4 | 1.00 | tied |
| 1-2e `:1158` | 1, 1*, 1 | 1.00 | tied |
| 1-2e `:1175` | 1, 2, 2* | 2.00 | tied |
| 2-7a `:634` | 2, 2, 4* | 2.00 | yes |
| 2-7a `:650` | 3, 6* | 2.00 | yes |
| 3-14a `:137` | 10, 20*, 9 | **2.22** | yes |
| 3-1b `:217` | 10, 13*, 12 | 1.30 | yes |
| 3-1c `:139` | 10, 22*, 18 | **2.20** | yes |
| 4-1a `:119` | 11, 28*, 7 | **4.00** | yes |

- **The correct answer is B in 16 of 23 questions** (A in 3: 1-1b `:272`, 1-2a
  `:492` and 1-2c `:950`; C in 4: 1-2a `:516`, 1-2c `:766`, 1-2e `:1175` and
  2-7a `:634`). A student can score on position alone, which is the same finding
  as bio and physics.
- **The correct answer is the longest or tied-longest in 19 of 23** (strictly the
  longest alone in 11). The real length tells are the three **over the 1.8
  ratio with long text: 3-14a `:137`, 3-1c `:139` and 4-1a `:119`**. In 4-1a the
  correct option is 28 words against 7 and 11, and it is over the Tier 3 cap of
  22. The other ratios over 1.8 (1-2e `:1175`, 2-7a `:634`, `:650`) are options
  of 1 to 6 words, where the ratio is arithmetic and no student would notice.
- **Distractors:** mostly real misconceptions, which is the standard to keep. 1-2c
  distractors are exact wrong formulas ("Cu2(SO4)2", "Na(OH)2"), 1-2a's are real
  bond-type errors, and 3-1c's are real ("both samples have identical masses so
  the midpoint"). Two lessons have **cartoon distractors**: 4-1a `:119` ("The
  molecules are too small to collide directly", "Hydrogen and oxygen repel each
  other magnetically") and 3-14a `:154` ("From the destruction of mass into
  pure kinetic energy").
- **Feedback is per option, and it explains.** This is the best part of chem.
  3-14a `:137`: the wrong answer "From breaking the high-energy C-C and C-H bonds"
  gets "Breaking bonds never releases energy. Bond breaking always absorbs energy
  (endothermic). Energy is released when product bonds form." That is the
  `VOICE.md` rule 10 model. Bio's single fixed message and its "Correct!"
  bug on wrong answers do not occur here. The only issue is the "Correct!" /
  "Incorrect." openers counted above.

## Lesson 1-1a: Atomic Structure and Electron Configuration

**PE:** HS-PS1-1. **Boundary:** main group elements only.

- **Above-level concepts:** the objective takes the book to **Z up to 36**
  (`1-1a.html:120`), and the scope line says "transition metals (Sc-Zn) fill in an
  order we'll flag but not lean on" (`:124`). The page then spends a section on it:
  the 4s-below-3d explanation (`:334-337`), a six-step figure that ends on
  scandium and zinc (`:343`, `:687-799`), "3d" (19 mentions) and "transition
  metal" (7). The page itself says this is "beyond the assessment boundary"
  (`:328-329`). Suggested: stop at calcium (Z = 20), or keep Sc-Zn and tag it
  "Enrichment" as 4-1a does.
- **Register:** 23 over 18 (10%), 4 over 25. Worst: `:1312` (36 words),
  `:1377` and `:1379` (33). "you": 23.
- **Dependent content:** the Bohr builder sim (to Z = 36), figure steps 4 and 5,
  the practice items on transition metals.

**Verdict: light edit** (scope decision on Z up to 36).

## Lesson 1-1b: Periodic Trends and Reactivity

**PE:** HS-PS1-1. **Boundary:** no quantitative ionization energy beyond
relative trends.

- **Above-level concepts:** the objective is "predict and compare" (`:41`), which
  is at level. kJ/mol values appear in the sim and figures (for example "IE = 496
  kJ/mol", `:604`); relative order is all the PE needs. "Shielding" is a named
  checklist item (`:99`).
- **Register:** 22 over 18 (12%), none over 25. "you": 19.

**Verdict: light edit** (numbers as supporting data, not as the target).

## Lesson 1-2a: Bonding and Electronegativity

**PE:** HS-PS1-2.

- **Above-level concepts:** none. The 1.7 threshold is called "a guideline, not a
  strict law" (`:510`), and bond types follow from ΔEN. Three questions with
  concrete atoms and numbers.
- **Register:** 13 over 18 (8%), 1 over 25. MCQ: keys A, B, C, options 5 to 12
  words (best option set in the book).

**Verdict: at level.**

## Lesson 1-2b: Molecular Polarity

**PE:** HS-PS1-2 (the topic fits PS1-3's strength-of-forces idea better).

- **Above-level concepts:** the objective ends "predict which intermolecular force
  that molecule can access" (`:41`), and the sim label reads "Polar overall ·
  Dipole-dipole + H-bonding" (`:348`). PS1-3's clarification statement asks for
  strengths, "not ... naming specific intermolecular forces (such as
  dipole-dipole)". The scope line is clean: "No VSEPR, no angle derivation"
  (`:42`). Dipole-dipole (13), hydrogen bond (9), London (8).
- **Register:** 27 over 18 (16%), 2 over 25: `:553` (36 words), `:581`
  (a scoring line). 6 exclamation marks.
- **Dependent content:** the sim label, the IMF checkpoint.

**Verdict: light edit** (decide the IMF-naming policy once, see 1-3b).

## Lesson 1-2c: Chemical Nomenclature

**PE:** HS-PS1-2. **Boundary:** main group elements and combustion only.

- **Above-level concepts:** the objective is "apply Roman numerals for transition
  metals" (`:170`). "Fe3+ is Iron(III) ... to specify oxidation state" (`:184`),
  `FeCl3: iron(III) chloride` (`:215`), Roman numeral (25 mentions), transition
  metal (5). Polyatomic ions (15) are not main group in the strict sense but are
  standard. Naming is not a PS1-2 target at all; it is a skill the course adds.
- **Register:** the longest page in the book (356 sentences), 39 over 18 (11%),
  5 over 25: `:1215` (a 32-word scoring line), `:343` (32), `:1129` (28). "you":
  42 (highest). 10 exclamation marks. MCQ: four questions with 3 to 4 word
  options; the one long set (`:354`) has the right option at 17 words against 10.
- **Dependent content:** the naming widgets, the Roman-numeral checkpoint.

**Verdict: light edit; scope decision** on naming transition-metal compounds.

## Lesson 1-2e: Reaction Types and Balancing

**PE:** HS-PS1-2 (combustion is in the boundary).

- **Above-level concepts:** none beyond the course. It already flags
  "neutralization" as out of boundary (`:835`). The precipitation question
  (`:1183`) uses silver, a transition metal, against a main-group boundary; it is
  a small point.
- **Register:** 25 over 18 (13%), **6 over 25**: `:1165` (33), `:1278` (31),
  `:1064` (28). 15 exclamation marks, "Perfect!" at `:890`.

**Verdict: light edit** (rubric lines, exclamation marks).

## Lesson 1-3a: Lewis Structures

**PE:** HS-PS1-3.

- **Above-level concepts:** none. Scope is explicit: covalent, main group, Z up
  to 36, "No VSEPR geometry or molecular polarity" (`:42`). One mention of
  "expanded octet".
- **Register:** 16 over 18 (12%), 1 over 25. Two questions, both keyed B.

**Verdict: at level.**

## Lesson 1-3b: IMFs and Properties

**PE:** HS-PS1-3. **Clarification:** strengths, "not on naming specific
intermolecular forces (such as dipole-dipole)". Boundary: no Raoult's law.

- **Above-level concepts:** the objective is "Identify and compare London
  dispersion, dipole-dipole, and hydrogen bonding" (`:41`). The page is
  organised by name: "1. London Dispersion Forces" (`:196`), "2. Dipole-Dipole
  Forces" (`:233`); London (36 mentions), hydrogen bond (29), dipole-dipole
  (13). Energy values are given (about 460 kJ/mol intramolecular, about 25
  kJ/mol hydrogen bond, `:147`, `:171`). The PE wants the strength story; the
  naming is the course's addition.
- **Register:** 35 over 18 (14%), 2 over 25: `:971` (scoring line), `:786`
  (26). 14 exclamation marks. Questions keyed B.
- **Dependent content:** the vapor pressure sim, 1-2b's IMF label, 2-6a's use of
  LDF as a term.

**Verdict: light edit; scope decision** on naming the three IMFs (affects 1-2b
and 2-6a too).

## Lesson 2-2a: Physical and Chemical Change

**PE:** HS-PS1-2.

- **Above-level concepts:** none. The sugar and baking predictions are concrete
  (`:671`, `:686`).
- **Register:** 19 over 18 (11%), 1 over 25. No exclamation marks.

**Verdict: at level.**

## Lesson 2-6a: Structure, Property, Argument

**PE:** HS-PS2-6. **Boundary:** provided molecular structures only.

- **Above-level concepts:** none. Saturated and unsaturated fat chains and London
  dispersion (46 mentions) are the clarification statement's own kind of example.
  The Velcro analogy (`:279`) is the right register.
- **Register:** 30 over 18 (16%), none over 25 (worst 25: `:829`, `:836`).
  "you": 4, the lowest in unit 2.

**Verdict: light edit** (sentence tail only).

## Lessons 2-7a, 2-7b, 2-7c: Moles and Stoichiometry

**PE:** HS-PS1-7. **Boundary:** no complex chemical reactions.

- **2-7a. Register:** 21 over 18 (17%), 4 over 25, led by two task prompts
  (`:678`, 43 words; `:680`, 47). The dozen-eggs analogy is the right concrete
  anchor. **Verdict: light edit.**
- **2-7b.** 14 over 18, 2 over 25. Unit conversions, no concept above level.
  **Verdict: at level.**
- **2-7c.** The scope line says "identify limiting/excess reactants ... calculate
  product yield" (`:249-257`); "limiting" appears 69 times. PS1-7 asks for
  conservation of atoms and the mole as a conversion, and "no complex
  reactions". Limiting reactant is standard first-year chemistry, but it is not
  in the PE text. 21 over 18 (14%), 1 over 25. **Verdict: light edit; scope
  decision** on limiting reactant.

## Lesson 3-14a: Bond Energy and Reaction Profiles

**PE:** HS-PS1-4. **Boundary:** "does not include calculating the total bond
energy changes ... from the bond energies of reactants and products".

- **Above-level concepts:** this is the calculation the PE excludes.
  "Reaction Enthalpy (ΔHrxn): Calculated from average bond energies: ΔHrxn = Σ D
  (bonds broken) − Σ D (bonds formed)" (`:54`); objective "Model reaction
  enthalpy (ΔHrxn) as the difference between energy absorbed breaking
  reactant bonds and energy released forming product bonds" (`:41`); checklist
  "Calculate ΔHrxn using bond energies" (`:93`); scope "multi-bond
  stoichiometry" (`:42`). kJ values (37 mentions), ΔH (26). The qualitative
  half (bond breaking absorbs, bond forming releases, the profile graph, a
  catalyst lowers Ea) is exactly the PE.
- **Register:** the best in the book on the over-cap measure: 16 over 18 (8%),
  1 over 25. MCQ `:137`: 10, 20*, 9 words (ratio 2.22), and the wrong option
  "destruction of mass into pure kinetic energy" is a cartoon.
- **Dependent content:** the sandbox sim, the checklist, the bond-energy
  practice items.

**Verdict: heavy rewrite of the calculation strand if the boundary is applied;
otherwise light edit.** This is a scope decision, as in physics 1-3.

## Lessons 3-1a, 3-1b, 3-1c: Heat and Calorimetry

**PE:** HS-PS3-1. **Boundary:** basic algebra, two or three components.

- **3-1a.** At level. 27 over 18 (12%), 1 over 25; the one button question
  (`:244`) has options of 12, 13 and 12 words. **Verdict: at level.**
- **3-1b.** The calculation (q = mcΔT, then q = mL, summed over stages,
  `:55-57`) fits the PE: algebra, one system. Register: 40 over 18 (18%), 4 over
  25: `:762` (40), `:750` (33), `:783` (26); "an astounding 113.0 kJ" (`:370`).
  **Verdict: light edit.**
- **3-1c.** At level on content. 31 over 18 (16%), 3 over 25. MCQ `:139`: options
  of 10, **22***, 18 words (ratio 2.2, correct longest); "much" twice in the
  correct option. **Verdict: light edit.**

## Lesson 3-4a: Thermal Equilibrium and Heat Transfer

**PE:** HS-PS3-4 (names the second law). **Boundary:** investigations with
provided materials.

- **Above-level concepts:** the objective says "Explain the direction of heat
  transfer using particulate collision mechanics and statistical probability
  (entropy)" (`:41`). Entropy (7), statistical microstates (9), Maxwell-Boltzmann
  (4); "The Second Law is not an arbitrary rule imposed by nature, it is the
  inevitable statistical outcome of trillions of random particle collisions"
  (`:147`). The PE only names the second law, so entropy is a reasonable
  gloss; the microstate argument is beyond. The page tags the speed-distribution
  sim "[Enrichment]" (`:288`).
- **Register:** 31 over 18 (19%), 2 over 25 (`:573`, 42 words; `:563`, 36).

**Verdict: light edit.**

## Lesson 4-1a: Reaction Rates and Collision Theory

**PE:** HS-PS1-5. **Boundary:** two reactants, qualitative rate against
temperature.

- **Above-level concepts:** the objective names "the fraction of particles with
  sufficient kinetic energy (KE >= Ea)" (`:41`). The Maxwell-Boltzmann
  distribution (14 mentions) is introduced at `:156` and **tagged "Enrichment /
  Beyond Assessment"** at `:194`. The clarification statement ("number and energy
  of collisions") is covered by the earlier sections.
- **Register:** the highest over-cap share with 4-1b and 5-4a: 33 over 18 (21%),
  mean 13.0, 4 over 25 (`:440`, 36 words; `:416`, 27; `:38`, 25).
- **MCQ:** `:119` is the worst in the book. Options 11, **28***, 7 words, ratio
  4.0, the correct answer is over the 22-word cap, and both wrong options
  ("too small to collide directly", "repel each other magnetically") are
  cartoons.
- **Dependent content:** the sandbox sim (sim audit: repair).

**Verdict: light edit** (checkpoint, objective).

## Lesson 4-1b: Catalysis and Enzymes

**PE:** HS-PS1-5. **Boundary:** simple reactions, qualitative.

- **Above-level concepts:** the PE is about collisions. This lesson adds a
  biochemistry unit: induced-fit and lock-and-key models with dates (Fischer 1894,
  Koshland 1958, `:185`), the enzyme-substrate complex (`E + S -> ES`, `:190`),
  denaturation and tertiary protein folding (`:57`, `:204`), saturation at Vmax
  (31 mentions) and "zero-order with respect to substrate" (`:468`). Enzyme (126
  mentions), pH (15), Arrhenius (2). The objective itself reads "explain the
  particulate basis of thermal and pH denaturation, and analyze saturation
  kinetics" (`:41`).
- **Register:** the highest mean in the book (13.6), 30 over 18 (21%), 4 over 25
  (`:472`, 36; `:468`, 27; `:204`, 25; `:55`, 25).
- **Dependent content:** the "Enzyme kinetics and saturation simulator" (sim
  audit: repair), the saturation checkpoint, the rubric.

**Verdict: heavy rewrite.** The inorganic-catalyst half (lower Ea, same ΔH) is
at level; the enzyme half is the same kind of cellular mechanism as bio 1-3 and
1-4.

## Lesson 4-6a: Dynamic Equilibrium and Le Chatelier

**PE:** HS-PS1-6. **Boundary:** one variable at a time; no K calculations.

- **Above-level concepts:** no K is calculated; Keq is named (11 mentions) and
  "Temperature is the only stress that changes the numerical equilibrium
  constant" (`:214`). The Haber process asks for **two variables together**:
  "an intermediate compromise temperature of ~450 °C" and "extreme pressure
  (200 atm)" (`:414-416`), against "only one variable at a time".
- **Register:** 27 over 18 (16%), 3 over 25 (`:414`, 41 words; `:485`, 35;
  `:416`, 26).
- **Dependent content:** the chamber sim, which is a **redesign** in the sim audit
  (the rate law is not mass action, so the shown K never matches).

**Verdict: light edit** (the page); the sim is a separate redesign.

## Lesson 4-6b: Human Equilibrium and Blood Buffers

**PE:** HS-PS1-6. **Boundary:** one variable at a time; no equilibrium
calculations.

- **Above-level concepts:** the lesson adds acid-base chemistry that the PE does
  not name. Objective: "Model buffer solutions as dynamic conjugate acid-base
  equilibria" (`:41`). The coupled equilibrium CO2(g) <-> CO2(aq) <-> H2CO3 <->
  H+ + HCO3- (`:55`), conjugate (12), carbonic or bicarbonate (29), pH (48),
  "carbonic anhydrase" (`:158`, `:344`), and a checklist item "Write the
  complete coupled carbonic acid-bicarbonate equilibrium equation" (`:88`). The
  Le Chatelier shift logic (add CO2, shift right) is at level.
- **Register:** 23 over 18 (15%), 2 over 25.
- **Dependent content:** the buffer sim (sim audit: repair), the fill-in at `:344`.

**Verdict: heavy rewrite, or re-scope as enrichment** (the buffer layer).

## Lesson 5-1a: The Life and Energy of the Sun

**PE:** HS-ESS1-1. **Boundary:** "does not include details of the atomic and
sub-atomic processes involved with the sun's nuclear fusion".

- **Above-level concepts:** exactly the excluded detail. Objective: "trace the
  proton-proton fusion chain. Calculate energy release via mass defect (E = Δm c2)"
  (`:41`); "The reaction emits 2 positrons, 2 neutrinos, and gamma photons"
  (`:54`); "0.71% less massive ... converted into pure energy via Einstein's
  equation" (`:55`); checklist "Write the overall net nuclear equation for the
  solar proton-proton fusion chain" (`:109`). Positron or neutrino (12), mass
  defect (12), hydrostatic (9). What the PE does want, the masses and lifetimes
  of stars, is present: `:559` (lifespan from mass over luminosity) is at level.
- **Register:** 25 over 18 (15%), 2 over 25 (`:559`, 32 words; `:564`, 31).
- **Dependent content:** the simulator (sim audit: **redesign**; any two
  protons become one helium, which also lies outside the boundary).

**Verdict: heavy rewrite.**

## Lesson 5-2a: The Big Bang and Cosmic Evidence

**PE:** HS-ESS1-2 (no assessment boundary published).

- **Above-level concepts:** the clarification statement names redshift, the CMB
  and the 3/4 to 1/4 composition, and all three are the lesson's spine. Beyond it:
  "Cosmological redshift vs. Doppler effect", the "recombination epoch" and
  "the 2.725 K CMB blackbody spectrum" (`:42`), and "state Hubble's Law"
  (`:141`). They can stay as enrichment. The register is plain, but "you"
  appears once in 148 sentences.
- **Register:** 23 over 18 (16%), 1 over 25.

**Verdict: light edit.**

## Lesson 5-3a: Stellar Nucleosynthesis and Element Origins

**PE:** HS-ESS1-3. **Boundary:** "Details of the many different nucleosynthesis
pathways for stars of differing masses are not assessed."

- **Above-level concepts:** the lesson is the pathways. Objective: "Model
  concentric shell fusion in massive stars ... contrast slow (s-process) and
  rapid (r-process) neutron capture" (`:41`). The onion architecture "H, He, C,
  O, Ne, Si" (`:54`), nuclear binding energy and the iron catastrophe (`:55`),
  r-process and kilonovae (`:56`), neutron beta decay (`:269`), "Type II" core
  collapse (`:386`). Shell (38 mentions), binding energy (20), iron peak (14),
  s or r process (11), neutron capture (10). The PE asks for how the elements made
  vary with the mass and life stage of the star.
- **Register:** 21 over 18 (14%), 4 over 25 (`:473`, 31; `:42`, 28; `:269`, 26,
  ends "bumping the element up the periodic table!"; `:386`).
- **Dependent content:** the nucleosynthesis explorer (sim audit: repair, with
  hard-coded colours), the s and r contrast checkpoint.

**Verdict: heavy rewrite.**

## Lesson 5-4a: Electromagnetic Radiation and Matter

**PE:** HS-PS4-4. **Boundary:** "limited to qualitative descriptions".

- **Above-level concepts:** the lesson is quantitative. Objective: "Calculate
  photon energy (E = hv = hc/λ)" (`:41`); "The Planck-Einstein Relation"
  (`:53`, `:130`, `:136`); the 10 eV ionisation threshold (`:62`); checklist
  "calculate photon energy from frequency or wavelength" (`:113`); practice
  devices with eV values ("12,400 eV", `:538-539`); DNA damage as "covalent
  phosphodiester bonds ... hydroxyl free radicals" (`:340`). Photon (69),
  wavelength (26), ionising (18). The qualitative core (higher frequency, more
  energy per photon, more damage; intensity is not photon energy) is the PE and is
  present.
- **Register:** 32 over 18 (21%), 2 over 25 (`:584`, `:574`).
- **Dependent content:** the simulator (sim audit: repair), the calculation
  checkpoint, the device-comparison problem.

**Verdict: heavy rewrite** of the calculation strand.

## Lesson 5-8a: Nuclear Reactions and Radioactive Decay

**PE:** HS-PS1-8. **Boundary:** no quantitative energy; alpha, beta and gamma only.

- **Above-level concepts:** the objective is "calculate half-life kinetics, and
  contrast fission versus fusion energetics" (`:41`). The scope adds positron
  emission, the exponential half-life formula and "mass defect (E = Δm c2)"
  (`:42`, `:57-58`). Half-life is not named in the PE or its boundary, and
  positron emission is a form of beta decay; the energy calculation is the
  excluded part. Fission (62 mentions).
- **Register:** 19 over 18 (12%), 1 over 25. No exclamation marks.
- **Dependent content:** the nuclear laboratory (sim audit: repair).

**Verdict: light edit; scope decision** on mass-defect energy calculation.

## Chem summary

| Lesson | Verdict | Main reason |
|---|---|---|
| 1-1a | Light edit | Z up to 36 and a 3d section the page itself calls beyond the boundary |
| 1-1b | Light edit | kJ/mol values where relative trends are the target |
| 1-2a | At level | concrete atoms, short options |
| 1-2b | Light edit | names dipole-dipole and H-bonding in a polarity lesson |
| 1-2c | Light edit; scope decision | Roman numerals for transition metals against "main group" |
| 1-2e | Light edit | 6 sentences over 25, 15 exclamation marks |
| 1-3a | At level | explicit scope line, no VSEPR |
| 1-3b | Light edit; scope decision | PS1-3 asks for strengths, lesson names three IMFs |
| 2-2a | At level | |
| 2-6a | Light edit | sentence tail (16% over cap) |
| 2-7a | Light edit | two 43 and 47-word prompts |
| 2-7b | At level | |
| 2-7c | Light edit; scope decision | limiting reactant, 69 mentions |
| 3-14a | **Heavy rewrite** (scope decision) | PS1-4 excludes the bond-energy sum the lesson is built on |
| 3-1a | At level | |
| 3-1b | Light edit | 40 sentences over cap |
| 3-1c | Light edit | MCQ ratio 2.2 |
| 3-4a | Light edit | entropy and microstates; already tagged Enrichment |
| 4-1a | Light edit | MCQ with a 28-word correct answer and cartoon distractors |
| 4-1b | **Heavy rewrite** | enzyme mechanism and saturation kinetics against a collisions PE |
| 4-6a | Light edit | two variables together in the Haber task; sim redesign separate |
| 4-6b | **Heavy rewrite** (or enrichment) | conjugate pairs, coupled equilibria, carbonic anhydrase |
| 5-1a | **Heavy rewrite** | p-p chain, positrons, mass defect against ESS1-1 boundary |
| 5-2a | Light edit | recombination epoch, 2.725 K blackbody |
| 5-3a | **Heavy rewrite** | shell burning and s and r processes against ESS1-3 boundary |
| 5-4a | **Heavy rewrite** | calculation against a "qualitative only" boundary |
| 5-8a | Light edit; scope decision | half-life formula and mass defect energy |

**Totals:** 5 at level (1-2a, 1-3a, 2-2a, 2-7b, 3-1a), 16 light edit, 6 heavy
rewrite (3-14a, 4-1b, 4-6b, 5-1a, 5-3a, 5-4a). Seven carry a scope decision
(1-2c, 1-3b, 2-7c, 3-14a, 5-8a, plus 1-1a's Z limit and 4-6b's buffer layer).

**Book-wide, outside the lessons:**

- Correct is B in 16 of 23 questions, and longest or tied-longest in 19.
- Three questions break the 1.8 length limit with long text (3-14a, 3-1c, 4-1a);
  4-1a's correct option is over the Tier 3 cap of 22 words.
- 39 answers open with "Correct!" and 51 with "Incorrect."; 86 exclamation
  marks in student text.
- The register drifts across the book: over-cap sentences 12% in unit 1, 18% in
  unit 4; "you" 18 per lesson in unit 1, 4 in unit 5.
- Heavy rewrites cluster in unit 5 (three of five lessons) and unit 4 (two of
  four).
- The "beyond the boundary" device is used four times in 27 lessons.

## Questions for David (chem, content level)

- **One boundary policy for all three books.** The lessons that go past the PE
  (3-14a, 4-1b, 4-6b, 5-1a, 5-3a, 5-4a, plus naming IMFs in 1-3b and Roman numerals in
  1-2c) are the course's choice, not an accident. Does the course teach to the NGSS
  boundary, or does it go beyond it on purpose? If beyond, the "Enrichment"
  tag (already on 4-1a and 3-4a) could mark everything past the PE.
- **IMF naming** (1-2b, 1-3b, 2-6a): PS1-3 asks for strengths, not names. Keep
  London, dipole-dipole and hydrogen bonding as the vocabulary?
- **Bond-energy calculation** (3-14a): keep the sum, or keep only the
  qualitative profile?
- **Biochemistry and physiology contexts** (4-1b enzymes, 4-6b blood buffers): are
  these the unit's application contexts, or part of what is taught?
- **Unit 5 (ESS and nuclear):** should the sun, Big Bang and star lessons be
  rewritten at the PE's qualitative level (mass and lifetime, evidence, which
  elements form where)?
- **"Correct!" and "Incorrect." openers** in feedback: drop for a reason-first
  opening, as `VOICE.md` section 5 asks?
- **Answer position:** is B in 16 of 23 deliberate? Randomising is a data change
  only, but the options in the commit-reveal widgets are David's content.

*(End of the content-level audit for all three books. Phase 3 sets the
reading-level policy and the rewrite plan; nothing here has been rewritten.)*

