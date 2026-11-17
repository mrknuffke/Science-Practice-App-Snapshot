# VOICE.md — Prose Contract
## All three textbooks · Binding for all student-facing text

**Status:** Applies to chem, physics, bio and any new textbook, and to student-facing copy across the repo (see `CLAUDE.md`). Load it in every build session. David's decisions on questions, feedback and scoring guides are in [`STYLE_STANDARD.md`](STYLE_STANDARD.md), section 8.4. The examples below are from chem; the rules are not chem-only. Every string a student reads — section prose, widget feedback, button labels, captions, model answers — must pass this contract. Claude Code regresses to textbook register without it.

---

## 1 · Who the reader is

A 15-year-old reviewing alone, probably at night, after one in-class exposure. They are not reading for pleasure. They half-remember the idea, they will skim, and they will quit the moment the page feels like a textbook. The page's job is to sound like a teacher who knows exactly where this specific student is about to go wrong — because the teacher has watched two hundred students go wrong in the same spot.

The register already exists in the built lessons. "Fluorine will tear an electron off almost anything it touches" is the target. "A polar bond and a polar molecule are not the same thing. A bond is polar when two atoms share electrons unequally — that's a bond-level property set by ΔEN" is the failure mode: correct, complete, and dead.

## 2 · The ten rules

1. **Second person by default.** The student is "you." Not "students," not "one," not "we" unless you and the student are genuinely doing something together in that sentence.
2. **Predict the wrong move, by name.** The single highest-value sentence pattern on these pages: "Here's where most people guess shell 3 goes to 9. It doesn't." If you know the common error, say it before the student makes it. If you don't know the common error for a topic, that's a content gap, not a style choice.
3. **Concrete before abstract.** Number, substance, or scene first; generalization second. "Stearic acid melts at 69 °C; oleic at 13 °C. One double bond, 56 degrees" — then the rule about packing.
4. **Short declaratives carry the load.** One idea per sentence. If a sentence needs two commas and a dash, it is usually two sentences.
5. **No throat-clearing.** Banned openers: "It is important to note," "In chemistry, we…," "One key concept is," "Let's explore," "In order to." Start inside the idea.
6. **Questions only when the student would actually be asking them.** "So why doesn't electron 19 go there?" works because the student is genuinely stuck there. Rhetorical questions used as paragraph decoration do not.
7. **Consequences, not definitions.** Don't define a term and stop. Say what it lets you predict, or what breaks if you ignore it. "You cannot unburn wood" teaches irreversibility better than the word "irreversible."
8. **Precision on the chemistry, looseness nowhere near it.** Terms, values, and mechanisms are exact. The sentences around them are conversational. Never trade accuracy for voice — TEXTBOOK_DEV_GUIDE.md's "honest > pretty" rule extends to prose.
9. **No costume.** No slang, no memes, no exclamation-mark enthusiasm, no "fun fact!" Students detect forced-casual instantly and it costs more trust than formal ever did. The target is dry, direct, and slightly wry — a teacher, not a mascot.
10. **Feedback strings follow the same rules.** Widget feedback is where register collapses first. "Incorrect. Please review the section above" is banned. Wrong-answer feedback names why that answer was tempting and points at the specific fix: "Losing 6 gets sulfur to a full shell too — but moving six electrons costs far more than moving two. Shortest path wins."

## 3 · Before → after pairs

Calibrate against these. Each "before" is real text from the v1 expansion draft.

**Pair 1 — defining by contrast**
- Before: "A polar bond and a polar molecule are not the same thing. A bond is polar when two atoms share electrons unequally — that's a bond-level property set by ΔEN. A molecule is polar when the unequal sharing in its bonds adds up to a net charge imbalance across the whole molecule — that's a molecule-level property that depends on shape."
- After: "Here's a trap: 'the bonds are polar, so the molecule is polar.' Sometimes. CO₂ has two polar bonds and is a nonpolar molecule, because the two pulls point in exactly opposite directions and cancel. Bond polarity is about one tug-of-war. Molecular polarity is about whether all the tugs-of-war add up to a net pull — and that depends on shape."

**Pair 2 — procedure framing**
- Before: "The molar mass of a compound is the mass of exactly one mole of that compound — in grams. You calculate it by adding up the atomic masses of every atom in the formula, accounting for how many of each type there are."
- After: "Molar mass is a reading-and-adding job. The formula tells you how many of each atom; the periodic table tells you what each one weighs; you multiply and sum. Every mistake in this calculation is one of two mistakes: misreading a subscript, or forgetting that a subscript after a parenthesis multiplies everything inside."

**Pair 3 — mechanism explanation**
- Before: "When a substance dissolves, its particles must push apart the solvent molecules and insert themselves into the gap. This only works if the solute-solvent attractions are at least as strong as the solvent-solvent attractions holding the solvent together."
- After: "'Like dissolves like' isn't a rule to memorize — it's a competition to referee. For oil to dissolve in water, oil molecules have to shove between water molecules. But water molecules are holding onto each other with hydrogen bonds, and the best oil can offer them is weak LDF. Water isn't letting go of water for that. So the water squeezes the oil back out. In hexane, the competition is fair — LDF against LDF — and the oil mixes right in."

**Pair 4 — the number that's too big**
- Before: "6.022 × 10²³ is genuinely hard to grasp. Here are two anchors that help: If you had one mole of grains of rice and spread them evenly across the Earth's surface, the layer of rice would be roughly 75 meters deep."
- After: "6.022 × 10²³ refuses to be pictured, but you can hold it. Eighteen milliliters of water — a couple of sips — contains one mole of water molecules. All of that number fits in your mouth. Going the other way: if you counted the molecules in that sip at one per second, you'd need about 19 quadrillion years, over a million times the age of the universe. The number is enormous because molecules are that small."

**Pair 5 — feedback string**
- Before: "Incorrect. Sulfur gains 2 electrons to complete its octet."
- After: "Tempting — losing 6 also lands on a full shell (the one underneath). But an atom takes the shortest path, and gaining 2 is far cheaper than losing 6. Sulfur pulls in two and becomes S²⁻."

## 4 · Register by section type

- **s-hero:** Hook with the phenomenon or the paradox. Two to four sentences. End by telling the student what this page will let them do, in one sentence, as an ability ("read an atom from its structure"), not a topic list.
- **Concept sections:** Rules 2, 3, 7 dominate. Every concept section should contain at least one named misconception or named wrong move.
- **"The one idea to hold onto" callouts:** Keep this exact recurring header. One short paragraph maximum. It should survive being the only thing the student remembers.
- **Predict prompts:** Terse and neutral. Never hint. The reveal text is where teaching happens (and it follows Rule 10).
- **Worked / faded examples:** Narrate decisions, not just steps. At each step, the sentence answers "why this move and not the other one."
- **Model answers (self-explain):** Written in the register a strong student would actually produce — complete sentences, causal chain explicit, no bullet fragments. The model answer is also a writing model.
- **Exam sections:** The prompt itself mimics exam formality (that's honest signal). Everything around it — setup, mark-scheme commentary, self-score guidance — stays in voice.
- **Practice questions & multiple-choice items:** Stems are direct and brief. Options must be balanced in length and grammatical structure so students cannot guess the answer by finding the longest, most academic sentence. Distractors must represent real, tempting student misconceptions (Rule 2), never absurd or cartoon-wrong statements. The correct option must never be more than 1.8x the length of any distractor.
- **Captions:** Existing telegraph convention holds: lowercase, `·` separators, no terminal period. The caption states the takeaway, never describes the picture. "more protons pulling the same shell inward → smaller atom," not "diagram of Na and Cl."

## 5 · Banned list (hard)

"It is important to note" · "Note that" · "In order to" · "serves to" · "plays a role in" · "In chemistry, we" · "Let's dive in / explore / take a look" · "Simply put" · "essentially" as filler · "Remember that" as an opener · exclamation points outside quoted speech · "fun" as an adjective for content · any sentence that restates the section header · "Please review the material above" or any feedback that scolds without teaching · "since" or "as" when meaning "because" · noun strings of 4 or more nouns · empty intensifiers ("very", "quite", "rather", "fairly") when used as vague filler · Em-dashes (`—` or `&mdash;`) in any context (prose, SVGs, captions, or runtime JS strings).

**Banned register.** Never write like a GRE item, a research paper, or a testing board. Avoid dense nominalizations and passive jargon. Bad: "candidate authentication", "breaks spatial symmetry into a 3D pyramid", "generates a higher rate of vaporization". Good: say what the thing does, in the words you would use at a student's desk.

## 6 · QA pass (run on every page before commit)

1. Read every paragraph aloud in your head as the teacher. Anything you wouldn't say to one kid at a desk, rewrite.
2. Search the page for the banned list. Zero hits.
3. Verify zero em-dashes in HTML prose, SVG text, captions, and runtime JavaScript.
4. Count named misconceptions: at least one per concept section.
5. Check every wrong-answer feedback string: does it explain the temptation? If it only says what's right, rewrite.
6. Check every caption: takeaway, not description.
7. Verify ASD-STE100 compliance: instructions <= 20 words, active voice, <= 3 nouns per cluster, "because" for causality.

## 7 · Tiered course register architecture

While the ten rules and universal invariants apply repo-wide, voice, syntax, and sentence length must mirror the developmental and curricular level of the course:

- **Tier 1: Elementary School (Grades 3-5).** Target: 8-11 year olds. Sentences: 8-12 words. MCQ options: <= 15 words. Keep language concrete, tactile, and sensory ("push", "pull", "hot", "cold", "heavier"). No abstract generalizations without an immediate physical anchor.
- **Tier 2: Middle School (Grades 6-8).** Target: 11-14 year olds. Sentences: 10-15 words. MCQ options: <= 20 words. Guided inquiry into systems, cause-and-effect, and simple particulate/force models ("particles", "energy transfer", "balanced forces").
- **Tier 3: General High School (Regents / NGSS HS Chem, Bio, Physics, PE modules).** Target: 14-16 year olds. Sentences: 12-18 words. MCQ options: <= 22 words. Conversational teacher voice connecting sub-microscopic structure to bulk properties. Standard terminology with real-world anchors ("tug-of-war").
- **Tier 4: Honors High School.** Target: accelerated high schoolers. Sentences: 15-20 words. MCQ options: <= 25 words. Precise terminology, quantitative problem solving, and multi-step causal reasoning.
- **Tier 5: AP & IB Courses (AP Bio, AP Chem, AP Physics, APES, IB DP).** Target: college-level high schoolers. Sentences: 15-22 words. MCQ options: <= 28 words. Rigorous College Board CED and IB conventions with rubric-clarifying teacher feedback.

## 8 · Simplified Technical English (ASD-STE100) Guidelines

To reduce cognitive load and maximize clarity for all learners (including multilingual and ELL students), all student-facing prose, instructions, and feedback incorporate key principles adapted from ASD-STE100:

1. **Sentence length caps.** Instructions and procedural steps must not exceed 20 words. Descriptive and explanatory sentences must not exceed 25 words (and must respect the narrower Tier limits in Section 7).
2. **One idea per sentence.** Express only one physical action, relationship, or observation per sentence. Avoid compound chaining ("which leads to...", "whereas...", "as well as...").
3. **Active voice with explicit agency.** Name the physical entity doing the action. Avoid passive constructions ("heat was added", "acceleration is observed to increase"). Write active, physical mechanisms ("You heat the flask", "Gravity accelerates the cart").
4. **Noun cluster limit (maximum 3 nouns).** Never string four or more nouns together (e.g. ban "reaction rate temperature coefficient calculation method"). Unpack noun stacks using prepositions or active verbs ("method to calculate the temperature coefficient of a reaction rate").
5. **Direct imperative instructions.** Begin procedural steps and prompts with direct imperative verbs ("Calculate", "Identify", "Measure", "Plot", "Compare"). Eliminate polite hedging and modal padding ("Students should now try to consider calculating...").
6. **Terminology consistency (one word, one meaning).** Never alternate synonyms for stylistic variety within a topic (e.g. do not alternate between "vessel", "beaker", "container", and "chamber" for the same apparatus). Use defined terms consistently.
7. **Causal clarity (ban ambiguous connectors).** Use "because" for cause and effect. Ban "since" or "as" when communicating causality (reserve "since" strictly for time intervals, e.g. "since Monday").
8. **Ban empty intensifiers and vague modifiers.** Eliminate "very", "quite", "rather", "fairly", "basically", "essentially", "somewhat". Either provide an exact measurement or comparison, or remove the word.
9. **Parallel grammatical structure.** All options in a multiple-choice set, and all steps in a sequence or list, must share identical grammatical construction (e.g. all start with an imperative verb, or all are noun phrases, or all are complete clauses).

