/**
 * HS-PS1-7: The Mole, Stoichiometry & Conservation of Mass
 * Items from Support Pack v.26-27 R2, revised (Oct 2026) to the Tier 3 register in
 * docs/textbook/VOICE.md and to the scope of lessons 2-7a, 2-7b and 2-7c.
 * Multi-modal question bank: two-tier, ranking, categorize, numeric, multi-select, and MCQ.
 * Zero em-dash compliant: hyphens, colons, and parentheses only.
 */
(function() {
  'use strict';

  // Calculation items pick their numbers per run (see ../pe-num.js).
  const { pick, fix, sci, round } = window.PE_NUM;

  // Molar mass of M_a(XO_b)_c and the three parenthesis slips students make.
  function parenMolarMass(C) {
    const base = C.a * C.mm;
    return {
      right: base + C.c * C.xm + C.c * C.b * 16,
      ignore: base + C.xm + C.b * 16,
      onlyX: base + C.c * C.xm + C.b * 16,
      added: base + C.c * C.xm + (C.b + C.c) * 16
    };
  }

  const PE_INFO = {
    id: 'HS-PS1-7',
    code: 'PS1-7',
    title: 'The Mole, Stoichiometry & Conservation of Mass',
    unit: 'Unit 2: The Mole & Stoichiometry',
    description: 'Use mathematical representations to support the claim that atoms, and therefore mass, are conserved during a chemical reaction.',
    clarification: 'Emphasis is on using mathematical ideas to communicate proportional relationships between masses of atoms in reactants and products, and the translation of these relationships to the macroscopic scale using the mole as the conversion factor from atomic to macroscopic scales.',
    assessmentBoundary: 'Assessment does not include complex chemical reactions.'
  };

  const SKILLS = [
    {
      id: 'PS1-7.1',
      title: 'The Mole as a Bridge',
      subtitle: 'Use Avogadro\'s number to connect the mass of one atom (in amu) to grams you can weigh.',
      watchOut: 'The mole is a count (6.022 x 10²³ particles), not a mass. A mole of carbon and a mole of magnesium have the same number of atoms, but magnesium weighs more because each atom is heavier.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-7.1_diag',
          skillId: 'PS1-7.1',
          level: 'Level 2 (Intermediate)',
          stem: 'A balance holds two containers. Container A has 1.00 mol of C-12 (12.00 g). Container B has 1.00 mol of Mg (24.31 g).',
          type: 'two_tier',
          tier1Prompt: 'How do the numbers of atoms in Container A and Container B compare?',
          tier1Options: [
            'Both containers hold the same number of atoms: 6.022 x 10²³ each.',
            'Container B holds twice as many atoms, because its mass is about double.',
            'Container A holds more atoms, because smaller atoms pack more tightly.',
            'You cannot compare them without knowing how much space each one takes up.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'A mole is a fixed count; magnesium weighs more because each Mg atom is heavier.',
            'A heavier container must always hold more atoms, whatever the element is.',
            'Avogadro\'s number is different for each element, depending on its group.',
            'Elements with fewer valence electrons need fewer atoms to make one mole.'
          ],
          correctTier2: 0,
          hint: 'A dozen eggs and a dozen bowling balls are both 12 things. Their masses are far apart.',
          workedSolution: 'A mole is a count: 6.022 x 10²³ particles, whatever they are. So 1.00 mol of C and 1.00 mol of Mg hold the same number of atoms. The common slip is reading the bigger mass as more atoms. Each Mg atom is about twice as heavy as a C atom, so the same count weighs twice as much (24.31 g against 12.00 g).',
          givenSummary: '1.00 mol C vs 1.00 mol Mg: comparing atom counts'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-7.1_diag2',
          skillId: 'PS1-7.1',
          level: 'Level 2 (Intermediate)',
          stem: 'A balance holds two containers with the same mass. Container A has 12.0 g of carbon (12.01 g/mol). Container B has 12.0 g of magnesium (24.31 g/mol).',
          type: 'two_tier',
          tier1Prompt: 'How do the numbers of atoms in Container A and Container B compare?',
          tier1Options: [
            'Container A holds about twice as many atoms as Container B.',
            'Both containers hold the same number of atoms, because the masses match.',
            'Container B holds more atoms, because magnesium atoms are larger.',
            'Container B holds twice as many atoms, because its molar mass is double.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'A Mg atom weighs about twice a C atom, so the same mass holds half as many.',
            'Equal masses always hold equal numbers of atoms, whatever element the sample is made of.',
            'A mole of any element weighs 12.0 g, so each container holds one mole.',
            'Heavier atoms have more protons, so each gram of a heavy element holds more atoms.'
          ],
          correctTier2: 0,
          hint: 'Turn each mass into moles first. How many moles is 12.0 g of each element?',
          workedSolution: 'Here the masses match, not the counts. Carbon: 12.0 g / 12.01 g/mol = 1.00 mol. Magnesium: 12.0 g / 24.31 g/mol = 0.494 mol. Each Mg atom is about twice as heavy, so the same 12.0 g holds only about half as many atoms. Container A has about twice as many atoms.',
          givenSummary: '12.0 g C vs 12.0 g Mg: comparing atom counts'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-7.1_L1',
            skillId: 'PS1-7.1',
            level: 'Level 1 (Routine)',
            stem: 'Sort each statement about the mole as true or false.',
            type: 'categorize',
            categories: ['True', 'False'],
            items: [
              { label: 'One mole of liquid water (H₂O) contains exactly 6.022 x 10²³ water molecules.', correctCategoryIndex: 0 },
              { label: 'One mole of any element has a mass of 12 grams, the same as carbon-12.', correctCategoryIndex: 1 },
              { label: 'The average atomic mass of an element in amu is numerically equal to its molar mass in grams per mole.', correctCategoryIndex: 0 },
              { label: 'A sample containing 12.044 x 10²³ helium atoms equals exactly 2.00 moles of helium.', correctCategoryIndex: 0 }
            ],
            hint: 'Recall that 1 mole is 6.022 x 10²³ particles. Molar mass in grams equals atomic mass in amu.',
            workedSolution: 'Statement 1 is True (1 mol of molecules = 6.022 x 10²³ molecules). Statement 2 is False. Every element has its own molar mass; only carbon-12 has exactly 12 g per mole. Statement 3 is True (that match is what makes the mole a bridge from atoms to grams). Statement 4 is True (12.044 x 10²³ / 6.022 x 10²³ = 2.00 mol).',
            givenSummary: 'True or false: the mole'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-7.1_L2',
            skillId: 'PS1-7.1',
            level: 'Level 2 (Application)',
            stem: 'Rank the four samples by the TOTAL number of atoms in each, from fewest (1) to most (4).',
            type: 'ranking',
            rankingPrompt: 'Order from fewest total atoms (1) to most total atoms (4):',
            items: [
              '0.50 mol of neon gas (Ne)',
              '0.40 mol of oxygen gas (O₂)',
              '1.00 mol of argon gas (Ar)',
              '0.50 mol of water vapor (H₂O)'
            ],
            correctOrder: [
              '0.50 mol of neon gas (Ne)',
              '0.40 mol of oxygen gas (O₂)',
              '1.00 mol of argon gas (Ar)',
              '0.50 mol of water vapor (H₂O)'
            ],
            hint: 'Count the atoms in each formula. Multiply the moles by that count, then compare.',
            workedSolution: '0.50 mol Ne has 0.50 x 1 = 0.50 mol atoms (3.01 x 10²³). 0.40 mol O₂ has 0.40 x 2 = 0.80 mol atoms (4.82 x 10²³). 1.00 mol Ar has 1.00 x 1 = 1.00 mol atoms (6.02 x 10²³). 0.50 mol H₂O has 0.50 x 3 = 1.50 mol atoms (9.03 x 10²³). The ranked order from fewest to most atoms is Ne < O₂ < Ar < H₂O.',
            givenSummary: 'Ranking samples by total atoms'
          };
        }
      ]
    },
    {
      id: 'PS1-7.2',
      title: 'Molar Mass Determination',
      subtitle: 'Calculate formula mass and molar mass of elements and compounds in grams per mole.',
      watchOut: 'Subscripts outside parentheses multiply every atom inside. In Ca(NO₃)₂, there is 1 Ca, 2 N, and 2 x 3 = 6 O atoms. Never add subscripts or ignore parentheses.',
      diagnostic: function(rng) {
        const C = pick(rng, [
          { name: 'aluminum sulfate', f: 'Al₂(SO₄)₃', use: 'which water plants use to clean drinking water', m: 'Al', mm: 26.98, a: 2, x: 'S', xm: 32.06, b: 4, c: 3 },
          { name: 'iron(III) sulfate', f: 'Fe₂(SO₄)₃', use: 'which water plants also use to clean drinking water', m: 'Fe', mm: 55.85, a: 2, x: 'S', xm: 32.06, b: 4, c: 3 },
          { name: 'calcium phosphate', f: 'Ca₃(PO₄)₂', use: 'the main mineral in your bones', m: 'Ca', mm: 40.08, a: 3, x: 'P', xm: 30.97, b: 4, c: 2 }
        ]);
        const M = parenMolarMass(C);
        return {
          id: 'PS1-7.2_diag',
          skillId: 'PS1-7.2',
          level: 'Level 2 (Intermediate)',
          stem: `Calculate the molar mass of ${C.name}, ${C.f}, ${C.use}. (Atomic masses: ${C.m} = ${fix(C.mm, 2)} g/mol, ${C.x} = ${fix(C.xm, 2)} g/mol, O = 16.00 g/mol.)`,
          type: 'two_tier',
          tier1Prompt: `What is the correct molar mass of ${C.name}, ${C.f}?`,
          tier1Options: [
            `${fix(M.right, 2)} g/mol`,
            `${fix(M.ignore, 2)} g/mol`,
            `${fix(M.onlyX, 2)} g/mol`,
            `${fix(M.added, 2)} g/mol`
          ],
          correctTier1: 0,
          tier2Prompt: 'Which atom count is correct for this formula?',
          tier2Options: [
            `${C.a} ${C.m} + ${C.c} ${C.x} + ${C.b * C.c} O (the ${C.c} outside the parentheses multiplies both ${C.x} and O).`,
            `${C.a} ${C.m} + 1 ${C.x} + ${C.b} O (ignoring the ${C.c} outside the parentheses).`,
            `${C.a} ${C.m} + ${C.c} ${C.x} + ${C.b} O (multiplying only the ${C.x} by ${C.c}).`,
            `${C.a} ${C.m} + ${C.c} ${C.x} + ${C.b + C.c} O (adding the ${C.c} to the oxygen subscript of ${C.b}).`
          ],
          correctTier2: 0,
          hint: `The ${C.c} outside the parentheses multiplies everything inside: ${C.x} and O.`,
          workedSolution: `${C.f} holds ${C.a} ${C.m}, ${C.c} ${C.x}, and ${C.c} x ${C.b} = ${C.b * C.c} O. ${C.m}: ${C.a} x ${fix(C.mm, 2)} = ${fix(C.a * C.mm, 2)}. ${C.x}: ${C.c} x ${fix(C.xm, 2)} = ${fix(C.c * C.xm, 2)}. O: ${C.b * C.c} x 16.00 = ${fix(C.b * C.c * 16, 2)}. Add them: ${fix(M.right, 2)} g/mol. Leaving oxygen at ${C.b} gives ${fix(M.onlyX, 2)} g/mol, the most common wrong answer.`,
          givenSummary: `${C.f} molar mass and parentheses`
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        const C = pick(rng, [
          { name: 'calcium nitrate', f: 'Ca(NO₃)₂', use: 'a common fertilizer', m: 'Ca', mm: 40.08, a: 1, x: 'N', xm: 14.01, b: 3, c: 2 },
          { name: 'magnesium nitrate', f: 'Mg(NO₃)₂', use: 'another common fertilizer', m: 'Mg', mm: 24.31, a: 1, x: 'N', xm: 14.01, b: 3, c: 2 },
          { name: 'barium nitrate', f: 'Ba(NO₃)₂', use: 'which gives fireworks their green color', m: 'Ba', mm: 137.33, a: 1, x: 'N', xm: 14.01, b: 3, c: 2 }
        ]);
        const M = parenMolarMass(C);
        return {
          id: 'PS1-7.2_diag2',
          skillId: 'PS1-7.2',
          level: 'Level 2 (Intermediate)',
          stem: `Calculate the molar mass of ${C.name}, ${C.f}, ${C.use}. (Atomic masses: ${C.m} = ${fix(C.mm, 2)} g/mol, N = 14.01 g/mol, O = 16.00 g/mol.)`,
          type: 'two_tier',
          tier1Prompt: `What is the correct molar mass of ${C.name}, ${C.f}?`,
          tier1Options: [
            `${fix(M.right, 2)} g/mol`,
            `${fix(M.ignore, 2)} g/mol`,
            `${fix(M.onlyX, 2)} g/mol`,
            `${fix(M.added, 2)} g/mol`
          ],
          correctTier1: 0,
          tier2Prompt: 'Which atom count is correct for this formula?',
          tier2Options: [
            `1 ${C.m} + 2 N + 6 O (the 2 outside the parentheses multiplies both N and O).`,
            `1 ${C.m} + 1 N + 3 O (ignoring the 2 outside the parentheses).`,
            `1 ${C.m} + 2 N + 3 O (multiplying only the N by 2).`,
            `1 ${C.m} + 2 N + 5 O (adding the 2 to the oxygen subscript of 3).`
          ],
          correctTier2: 0,
          hint: 'The 2 outside the parentheses multiplies everything inside: N and O.',
          workedSolution: `${C.f} holds 1 ${C.m}, 2 N, and 2 x 3 = 6 O. ${C.m}: ${fix(C.mm, 2)}. N: 2 x 14.01 = 28.02. O: 6 x 16.00 = 96.00. Add them: ${fix(C.mm, 2)} + 28.02 + 96.00 = ${fix(M.right, 2)} g/mol. The common slip is leaving oxygen at 3 (${fix(M.onlyX, 2)} g/mol).`,
          givenSummary: `${C.f} molar mass and parentheses`
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-7.2_L1',
            skillId: 'PS1-7.2',
            level: 'Level 1 (Routine)',
            stem: 'Match each formula to its molar mass, rounded to one decimal place (H=1.0, C=12.0, N=14.0, O=16.0, Na=23.0, Cl=35.5, Ca=40.1):',
            type: 'categorize',
            categories: ['18.0 g/mol', '44.0 g/mol', '58.5 g/mol', '100.1 g/mol'],
            items: [
              { label: 'Water (H₂O)', correctCategoryIndex: 0 },
              { label: 'Carbon dioxide (CO₂)', correctCategoryIndex: 1 },
              { label: 'Sodium chloride (NaCl)', correctCategoryIndex: 2 },
              { label: 'Calcium carbonate (CaCO₃)', correctCategoryIndex: 3 }
            ],
            hint: 'Sum the atomic masses for each formula: H₂O = 2(1)+16; CO₂ = 12+2(16); NaCl = 23+35.5; CaCO₃ = 40.1+12+3(16).',
            workedSolution: 'H₂O: (2 x 1.0) + 16.0 = 18.0 g/mol. CO₂: 12.0 + (2 x 16.0) = 44.0 g/mol. NaCl: 23.0 + 35.5 = 58.5 g/mol. CaCO₃: 40.1 + 12.0 + (3 x 16.0) = 100.1 g/mol.',
            givenSummary: 'Molar mass matching matrix for common compounds'
          };
        },
        function level2(rng) {
          const S = pick(rng, [
            { name: 'glucose', f: 'C₆H₁₂O₆', c: 6, h: 12, o: 6 },
            { name: 'sucrose (table sugar)', f: 'C₁₂H₂₂O₁₁', c: 12, h: 22, o: 11 },
            { name: 'ribose (the sugar in RNA)', f: 'C₅H₁₀O₅', c: 5, h: 10, o: 5 }
          ]);
          const mc = S.c * 12.01, mh = S.h * 1.008, mo = S.o * 16.00, total = mc + mh + mo;
          return {
            id: 'PS1-7.2_L2',
            skillId: 'PS1-7.2',
            level: 'Level 2 (Application)',
            stem: `Calculate the molar mass of ${S.name}, ${S.f}, given C = 12.01, H = 1.008, and O = 16.00 g/mol. Enter your result in g/mol:`,
            type: 'numeric',
            unit: 'g/mol',
            correctValue: round(total, 2),
            tolerance: 0.3,
            hint: `Multiply ${S.c} by 12.01, ${S.h} by 1.008, and ${S.o} by 16.00, then add the three values.`,
            workedSolution: `Carbon: ${S.c} x 12.01 = ${fix(mc, 2)} g/mol. Hydrogen: ${S.h} x 1.008 = ${fix(mh, 3)} g/mol. Oxygen: ${S.o} x 16.00 = ${fix(mo, 2)} g/mol. Add them: ${fix(total, 3)} g/mol, which rounds to ${fix(total, 2)} g/mol.`,
            givenSummary: `Molar mass of ${S.f}`
          };
        }
      ]
    },
    {
      id: 'PS1-7.3',
      title: 'Mole, Mass & Particle Conversions',
      subtitle: 'Use dimensional analysis to convert between grams, moles, and numbers of particles.',
      watchOut: 'Always cross the mole bridge. To go from grams to particles: first divide by molar mass to get moles, then multiply by Avogadro\'s number.',
      diagnostic: function(rng) {
        const n = pick(rng, [2, 3, 0.5, 2.5]);
        const g = n * 18.02, N = n * 6.022e23;
        return {
          id: 'PS1-7.3_diag',
          skillId: 'PS1-7.3',
          level: 'Level 2 (Intermediate)',
          stem: `A beaker holds ${fix(g, 2)} g of water (H₂O, molar mass = 18.02 g/mol). How many water molecules are in it?`,
          type: 'two_tier',
          tier1Prompt: `How many water molecules are in the ${fix(g, 2)} g sample?`,
          tier1Options: [
            `${sci(N)} molecules`,
            '6.022 x 10²³ molecules',
            `${sci(6.022e23 / n)} molecules`,
            `${sci(g * 6.022e23)} molecules`
          ],
          correctTier1: 0,
          tier2Prompt: 'Which steps give this answer?',
          tier2Options: [
            'Divide grams by molar mass to find moles, then multiply moles by Avogadro\'s number.',
            'Multiply grams by molar mass to find moles, then multiply moles by Avogadro\'s number.',
            'Divide grams directly by Avogadro\'s number, then multiply that result by molar mass.',
            'Multiply grams by the number of atoms in one formula, with no moles at all.'
          ],
          correctTier2: 0,
          hint: 'Cross the mole bridge: grams to moles first (divide by molar mass), then moles to molecules.',
          workedSolution: `Step 1: grams to moles. ${fix(g, 2)} g / 18.02 g/mol = ${fix(n, 3)} mol H₂O. Step 2: moles to molecules. ${fix(n, 3)} mol x 6.022 x 10²³ molecules/mol = ${sci(N)} molecules. Multiplying grams by molar mass in step 1 is the common slip; check that the gram units cancel.`,
          givenSummary: `${fix(g, 2)} g H₂O to molecules`
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        const n = pick(rng, [0.5, 2, 1.5]);
        const N = n * 6.022e23, g = n * 44.01;
        return {
          id: 'PS1-7.3_diag2',
          skillId: 'PS1-7.3',
          level: 'Level 2 (Intermediate)',
          stem: `A balloon holds ${sci(N)} molecules of carbon dioxide (CO₂, molar mass = 44.01 g/mol). What is the mass of the CO₂?`,
          type: 'two_tier',
          tier1Prompt: 'What is the mass of the CO₂ in the balloon?',
          tier1Options: [
            `${fix(g, 2)} g`,
            '44.01 g',
            `${fix(44.01 / n, 2)} g`,
            `${sci(N * 44.01)} g`
          ],
          correctTier1: 0,
          tier2Prompt: 'Which steps give this answer?',
          tier2Options: [
            'Divide molecules by Avogadro\'s number to find moles, then multiply moles by molar mass.',
            'Divide Avogadro\'s number by the molecule count, then multiply that result by molar mass.',
            'Multiply the molecule count by molar mass, because each molecule weighs 44.01 g.',
            'Divide molecules by molar mass, then multiply that result by Avogadro\'s number.'
          ],
          correctTier2: 0,
          hint: 'Cross the mole bridge going the other way: molecules to moles first, then moles to grams.',
          workedSolution: `Step 1: molecules to moles. ${sci(N)} / 6.022 x 10²³ per mol = ${fix(n, 4)} mol CO₂. Step 2: moles to grams. ${fix(n, 4)} mol x 44.01 g/mol = ${fix(g, 2)} g. A common slip is treating 44.01 g as the mass of one molecule; it is the mass of a whole mole.`,
          givenSummary: `${sci(N)} CO₂ molecules to grams`
        };
      },
      practiceLevels: [
        function level1(rng) {
          const n = pick(rng, [2, 0.5, 3]);
          const g = n * 44.01;
          return {
            id: 'PS1-7.3_L1',
            skillId: 'PS1-7.3',
            level: 'Level 1 (Routine)',
            stem: `How many moles are in ${fix(g, 2)} g of carbon dioxide gas (CO₂, molar mass = 44.01 g/mol)? Enter your answer in moles:`,
            type: 'numeric',
            unit: 'mol',
            correctValue: n,
            tolerance: 0.02,
            hint: 'Moles = mass (g) / molar mass (g/mol).',
            workedSolution: `Moles of CO₂ = ${fix(g, 2)} g / 44.01 g/mol = ${fix(n, 2)} mol.`,
            givenSummary: 'Grams to moles for CO₂'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-7.3_L2',
            skillId: 'PS1-7.3',
            level: 'Level 2 (Application)',
            stem: 'A sample holds 0.750 mol of CaCl₂ (molar mass = 110.98 g/mol). Which statements are correct? (Select all that apply)',
            type: 'multi_select',
            options: [
              'The mass of the sample is 83.2 grams (calculated as 0.750 mol x 110.98 g/mol).',
              'The sample contains 4.52 x 10²³ units of CaCl₂ (calculated as 0.750 mol x 6.022 x 10²³ units/mol).',
              'The sample contains 9.03 x 10²³ chloride (Cl⁻) ions because each CaCl₂ unit contains 2 chloride ions.',
              'The mass of the sample is 148.0 grams (calculated by dividing 110.98 by 0.750).'
            ],
            correctIndices: [0, 1, 2],
            hint: 'Mass = moles x molar mass. Particle count = moles x Avogadro\'s number. Don\'t forget that each CaCl₂ unit has 2 Cl⁻ ions.',
            workedSolution: 'Option 1 is correct: 0.750 mol x 110.98 g/mol = 83.2 g CaCl₂. Option 2 is correct: 0.750 mol x 6.022 x 10²³ = 4.52 x 10²³ units of CaCl₂. Option 3 is correct: (4.52 x 10²³ units) x (2 Cl⁻ / unit) = 9.03 x 10²³ Cl⁻ ions. Option 4 is incorrect because grams are found by multiplying moles by molar mass, not dividing.',
            givenSummary: 'Checking mole, mass and particle conversions'
          };
        }
      ]
    },
    {
      id: 'PS1-7.4',
      title: 'Mole Ratios & Balanced Equations',
      subtitle: 'Use the coefficients in a balanced equation to relate moles of reactants used to moles of products made.',
      watchOut: 'Coefficients in balanced equations tell you mole ratios, not gram ratios. 2 H₂ + O₂ -> 2 H₂O means 2 moles of H₂ react with 1 mole of O₂, not 2 grams with 1 gram.',
      diagnostic: function(rng) {
        const X = pick(rng, [6, 4, 10]);
        return {
          id: 'PS1-7.4_diag',
          skillId: 'PS1-7.4',
          level: 'Level 2 (Intermediate)',
          stem: `Factories make ammonia by the Haber process: N₂(g) + 3 H₂(g) -> 2 NH₃(g). An engineer needs to make exactly ${fix(X, 1)} mol of NH₃.`,
          type: 'two_tier',
          tier1Prompt: 'How many moles of H₂ must react, with plenty of nitrogen available?',
          tier1Options: [
            `${fix(1.5 * X, 1)} moles of H₂`,
            `${fix(X, 1)} moles of H₂`,
            `${fix(X / 2, 1)} moles of H₂`,
            `${fix(3 * X, 1)} moles of H₂`
          ],
          correctTier1: 0,
          tier2Prompt: 'Which mole ratio sets up this conversion?',
          tier2Options: [
            `Multiply ${fix(X, 1)} mol NH₃ by (3 mol H₂ / 2 mol NH₃).`,
            `Multiply ${fix(X, 1)} mol NH₃ by (2 mol NH₃ / 3 mol H₂).`,
            `Multiply ${fix(X, 1)} mol NH₃ by (1 mol N₂ / 3 mol H₂).`,
            `Multiply ${fix(X, 1)} mol NH₃ by (3 mol H₂ / 1 mol N₂).`
          ],
          correctTier2: 0,
          hint: 'Use the mole ratio from the equation. Three moles of H₂ react for every two moles of NH₃ formed.',
          workedSolution: `The equation N₂ + 3 H₂ -> 2 NH₃ uses 3 mol H₂ for every 2 mol NH₃ made. Put the unit you want (mol H₂) on top: ${fix(X, 1)} mol NH₃ x (3 mol H₂ / 2 mol NH₃) = ${fix(1.5 * X, 1)} mol H₂. The mol NH₃ units cancel, which tells you the ratio is the right way up.`,
          givenSummary: `Haber process: moles of H₂ for ${fix(X, 1)} mol NH₃`
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        const X = pick(rng, [8, 12, 4]);
        return {
          id: 'PS1-7.4_diag2',
          skillId: 'PS1-7.4',
          level: 'Level 2 (Intermediate)',
          stem: `Iron rusts: 4 Fe(s) + 3 O₂(g) -> 2 Fe₂O₃(s). A steel beam loses ${fix(X, 1)} mol of Fe to rust.`,
          type: 'two_tier',
          tier1Prompt: 'How many moles of O₂ reacted with the iron?',
          tier1Options: [
            `${fix(0.75 * X, 1)} moles of O₂`,
            `${fix(X, 1)} moles of O₂`,
            `${fix(X * 4 / 3, 1)} moles of O₂`,
            `${fix(3 * X, 1)} moles of O₂`
          ],
          correctTier1: 0,
          tier2Prompt: 'Which mole ratio sets up this conversion?',
          tier2Options: [
            `Multiply ${fix(X, 1)} mol Fe by (3 mol O₂ / 4 mol Fe).`,
            `Multiply ${fix(X, 1)} mol Fe by (4 mol Fe / 3 mol O₂).`,
            `Multiply ${fix(X, 1)} mol Fe by (2 mol Fe₂O₃ / 4 mol Fe).`,
            `Multiply ${fix(X, 1)} mol Fe by (3 mol O₂ / 1 mol Fe).`
          ],
          correctTier2: 0,
          hint: 'The equation uses 3 mol O₂ for every 4 mol Fe. Put the unit you want on top.',
          workedSolution: `From 4 Fe + 3 O₂ -> 2 Fe₂O₃, 3 mol O₂ react for every 4 mol Fe. So ${fix(X, 1)} mol Fe x (3 mol O₂ / 4 mol Fe) = ${fix(0.75 * X, 1)} mol O₂. Flipping the ratio gives ${fix(X * 4 / 3, 1)}, but its units do not cancel to mol O₂.`,
          givenSummary: `Rusting iron: moles of O₂ for ${fix(X, 1)} mol Fe`
        };
      },
      practiceLevels: [
        function level1(rng) {
          const n = pick(rng, [2.5, 1.5, 4]);
          return {
            id: 'PS1-7.4_L1',
            skillId: 'PS1-7.4',
            level: 'Level 1 (Routine)',
            stem: `Propane burns: C₃H₈ + 5 O₂ -> 3 CO₂ + 4 H₂O. If ${fix(n, 1)} moles of propane burn, how many moles of CO₂ form?`,
            type: 'mcq',
            options: [
              `${fix(3 * n, 1)} moles of CO₂`,
              `${fix(n, 1)} moles of CO₂`,
              '3.0 moles of CO₂',
              `${fix(5 * n, 1)} moles of CO₂`
            ],
            correctIndex: 0,
            hint: 'Compare the coefficients of C₃H₈ and CO₂: each 1 mol of C₃H₈ that burns makes 3 mol of CO₂.',
            workedSolution: `The equation makes 3 mol CO₂ for every 1 mol C₃H₈. Moles of CO₂ = ${fix(n, 1)} mol C₃H₈ x (3 mol CO₂ / 1 mol C₃H₈) = ${fix(3 * n, 1)} mol CO₂. Using the 5 in front of O₂ instead gives ${fix(5 * n, 1)}, which is moles of oxygen used, not CO₂ made.`,
            givenSummary: 'Propane combustion mole ratio'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-7.4_L2',
            skillId: 'PS1-7.4',
            level: 'Level 2 (Application)',
            stem: 'Rank the fuels by the moles of O₂ needed to burn 1.0 mol of fuel, from least (1) to most (4).',
            type: 'ranking',
            rankingPrompt: 'Order from smallest moles of O₂ needed (1) to largest moles of O₂ needed (4):',
            items: [
              'Carbon monoxide: 2 CO + O₂ -> 2 CO₂',
              'Methane: CH₄ + 2 O₂ -> CO₂ + 2 H₂O',
              'Ethane: 2 C₂H₆ + 7 O₂ -> 4 CO₂ + 6 H₂O',
              'Propane: C₃H₈ + 5 O₂ -> 3 CO₂ + 4 H₂O'
            ],
            correctOrder: [
              'Carbon monoxide: 2 CO + O₂ -> 2 CO₂',
              'Methane: CH₄ + 2 O₂ -> CO₂ + 2 H₂O',
              'Ethane: 2 C₂H₆ + 7 O₂ -> 4 CO₂ + 6 H₂O',
              'Propane: C₃H₈ + 5 O₂ -> 3 CO₂ + 4 H₂O'
            ],
            hint: 'Divide the coefficient of O₂ by the coefficient of the fuel. That gives the O₂ needed for one mole of fuel.',
            workedSolution: 'CO: 1 mol O₂ / 2 mol CO = 0.5 mol O₂. CH₄: 2 mol O₂ / 1 mol CH₄ = 2.0 mol O₂. C₂H₆: 7 mol O₂ / 2 mol C₂H₆ = 3.5 mol O₂. C₃H₈: 5 mol O₂ / 1 mol C₃H₈ = 5.0 mol O₂. The ranked order from least to most O₂ required is CO (0.5) < CH₄ (2.0) < C₂H₆ (3.5) < C₃H₈ (5.0).',
            givenSummary: 'Ranking fuels by O₂ needed per mole'
          };
        }
      ]
    },
    {
      id: 'PS1-7.5',
      title: 'Limiting Reactants & BCA Tables',
      subtitle: 'Use a BCA table to find the limiting reactant, the theoretical yield, and what is left over.',
      watchOut: 'The limiting reactant is not just the reactant with fewer starting moles. It is the one that runs out first when you divide starting moles by its coefficient in the balanced equation.',
      diagnostic: function(rng) {
        const R = pick(rng, [{ h: 6, o: 4 }, { h: 8, o: 5 }, { h: 10, o: 6 }]);
        const need = R.h / 2, left = R.o - need;
        return {
          id: 'PS1-7.5_diag',
          skillId: 'PS1-7.5',
          level: 'Level 2 (Intermediate)',
          stem: `In a chamber, ${fix(R.h, 1)} moles of H₂ and ${fix(R.o, 1)} moles of O₂ react: 2 H₂ + O₂ -> 2 H₂O.`,
          type: 'two_tier',
          tier1Prompt: 'Which substance is the limiting reactant, and what is the maximum amount of water that can form?',
          tier1Options: [
            `H₂ is the limiting reactant; ${fix(R.h, 1)} moles of H₂O can form.`,
            `O₂ is the limiting reactant; ${fix(2 * R.o, 1)} moles of H₂O can form.`,
            `Neither is limiting; ${fix(R.h, 1)} + ${fix(R.o, 1)} = ${fix(R.h + R.o, 1)} moles of H₂O form.`,
            `O₂ is the limiting reactant; ${fix(R.o, 1)} moles of H₂O can form.`
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            `Divide by coefficients: H₂ runs out first (${fix(R.h, 1)} / 2 = ${fix(need, 1)} is less than ${fix(R.o, 1)} / 1 = ${fix(R.o, 1)}).`,
            'The reactant with fewer starting moles always runs out first, whatever the coefficients say.',
            'Lighter molecules react faster and get used up first, so the lighter reactant runs out.',
            'Gases in a sealed chamber always react completely, with nothing left over.'
          ],
          correctTier2: 0,
          hint: `How much O₂ does ${fix(R.h, 1)} mol of H₂ need? The equation uses 1 O₂ for every 2 H₂.`,
          workedSolution: `From 2 H₂ + O₂ -> 2 H₂O, ${fix(R.h, 1)} mol of H₂ needs only ${fix(need, 1)} mol of O₂, and ${fix(R.o, 1)} mol is there. H₂ runs out first, so it is the limiting reactant. BCA table: Change for H₂ = -${fix(R.h, 1)} mol, for O₂ = -${fix(need, 1)} mol, for H₂O = +${fix(R.h, 1)} mol. After: H₂ = 0, O₂ = ${fix(left, 1)} mol left over, H₂O = ${fix(R.h, 1)} mol.`,
          givenSummary: 'H₂ + O₂ limiting reactant with a BCA table'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        const R = pick(rng, [{ na: 5, cl: 3 }, { na: 7, cl: 4 }, { na: 9, cl: 5 }]);
        const need = R.na / 2, left = R.cl - need;
        return {
          id: 'PS1-7.5_diag2',
          skillId: 'PS1-7.5',
          level: 'Level 2 (Intermediate)',
          stem: `In a flask, ${fix(R.na, 1)} moles of Na and ${fix(R.cl, 1)} moles of Cl₂ react: 2 Na + Cl₂ -> 2 NaCl.`,
          type: 'two_tier',
          tier1Prompt: 'Which substance is the limiting reactant, and what is the maximum amount of NaCl that can form?',
          tier1Options: [
            `Na is the limiting reactant; ${fix(R.na, 1)} moles of NaCl can form.`,
            `Cl₂ is the limiting reactant; ${fix(2 * R.cl, 1)} moles of NaCl can form.`,
            `Cl₂ is the limiting reactant; ${fix(R.cl, 1)} moles of NaCl can form.`,
            `Neither is limiting; ${fix(R.na, 1)} + ${fix(R.cl, 1)} = ${fix(R.na + R.cl, 1)} moles of NaCl form.`
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            `Na runs out first: ${fix(R.na, 1)} / 2 = ${fix(need, 1)} is less than ${fix(R.cl, 1)} / 1 = ${fix(R.cl, 1)}.`,
            'The reactant with fewer starting moles always runs out first, whatever the coefficients say.',
            'Sodium is a metal, and the metal is always the limiting reactant in a synthesis.',
            'Both reactants are used up completely, because the equation is balanced.'
          ],
          correctTier2: 0,
          hint: `How much Cl₂ does ${fix(R.na, 1)} mol of Na need? The equation uses 1 Cl₂ for every 2 Na.`,
          workedSolution: `Here is the trap: Cl₂ has fewer moles, but it is not the limiting reactant. ${fix(R.na, 1)} mol of Na needs only ${fix(need, 1)} mol of Cl₂, and ${fix(R.cl, 1)} mol is there. Na runs out first. BCA table: Change for Na = -${fix(R.na, 1)} mol, for Cl₂ = -${fix(need, 1)} mol, for NaCl = +${fix(R.na, 1)} mol. After: Na = 0, Cl₂ = ${fix(left, 1)} mol left over, NaCl = ${fix(R.na, 1)} mol.`,
          givenSummary: 'Na + Cl₂ limiting reactant with a BCA table'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-7.5_L1',
            skillId: 'PS1-7.5',
            level: 'Level 1 (Routine)',
            stem: 'Ammonia forms by N₂ + 3 H₂ -> 2 NH₃. You start with 3.0 mol N₂ and 6.0 mol H₂. Match each part of the finished BCA table.',
            type: 'categorize',
            categories: ['H₂ (Hydrogen)', 'N₂ (Nitrogen)', '4.0 moles', '1.0 mole remaining'],
            items: [
              { label: 'Limiting reactant (runs out first)', correctCategoryIndex: 0 },
              { label: 'Excess reactant (some is left over)', correctCategoryIndex: 1 },
              { label: 'Theoretical yield of NH₃', correctCategoryIndex: 2 },
              { label: 'Excess reactant left after the reaction', correctCategoryIndex: 3 }
            ],
            hint: 'All 6.0 mol of H₂ needs 6.0 / 3 = 2.0 mol of N₂. You have 3.0 mol of N₂, so how much is left over?',
            workedSolution: 'N₂ + 3 H₂ -> 2 NH₃. 6.0 mol H₂ needs (1/3) x 6.0 = 2.0 mol N₂. You have 3.0 mol N₂, so H₂ runs out first (limiting) and N₂ is in excess. Excess N₂ remaining = 3.0 - 2.0 = 1.0 mol. Theoretical yield of NH₃ = 6.0 mol H₂ x (2 mol NH₃ / 3 mol H₂) = 4.0 moles NH₃.',
            givenSummary: 'BCA table for making ammonia'
          };
        },
        function level2(rng) {
          const R = pick(rng, [{ al: 4, cl: 9 }, { al: 2, cl: 6 }, { al: 6, cl: 10 }]);
          const used = 1.5 * R.al, left = R.cl - used;
          return {
            id: 'PS1-7.5_L2',
            skillId: 'PS1-7.5',
            level: 'Level 2 (Application)',
            stem: `Aluminum reacts with chlorine: 2 Al + 3 Cl₂ -> 2 AlCl₃. Starting with ${fix(R.al, 1)} mol Al and ${fix(R.cl, 1)} mol Cl₂, how many moles of excess reactant remain unreacted?`,
            type: 'numeric',
            unit: 'mol',
            correctValue: left,
            tolerance: 0.1,
            hint: `Find the limiting reactant first. ${fix(R.al, 1)} mol Al needs (3/2) x ${fix(R.al, 1)} = ${fix(used, 1)} mol Cl₂. Subtract the Cl₂ used from the Cl₂ you started with.`,
            workedSolution: `${fix(R.al, 1)} mol Al needs ${fix(R.al, 1)} x (3/2) = ${fix(used, 1)} mol Cl₂, and ${fix(R.cl, 1)} mol is there, so Al runs out first (limiting). Cl₂ left over = ${fix(R.cl, 1)} mol at the start - ${fix(used, 1)} mol used = ${fix(left, 1)} mol Cl₂.`,
            givenSummary: 'Excess Cl₂ left over in Al + Cl₂'
          };
        }
      ]
    },
    {
      id: 'PS1-7.6',
      title: 'Theoretical Yield & Mass Conservation',
      subtitle: 'Calculate theoretical and percent yield, and show that total mass stays the same in a closed reaction.',
      watchOut: 'Atoms cannot appear or disappear. In a closed container, total mass never changes. If an open beaker loses mass, a gas escaped into the room.',
      diagnostic: function(rng) {
        const m = pick(rng, [100, 50, 25]);
        const cao = round(m * 56.08 / 100.09, 1), co2 = round(m - cao, 1);
        return {
          id: 'PS1-7.6_diag',
          skillId: 'PS1-7.6',
          level: 'Level 2 (Intermediate)',
          stem: `A student heats ${fix(m, 1)} g of CaCO₃ in a sealed container: CaCO₃(s) -> CaO(s) + CO₂(g). After cooling, ${fix(cao, 1)} g of solid CaO is left, with the CO₂ gas trapped inside.`,
          type: 'two_tier',
          tier1Prompt: 'What is the mass of the CO₂ gas trapped in the container?',
          tier1Options: [
            `${fix(co2, 1)} grams of CO₂`,
            `${fix(cao, 1)} grams of CO₂`,
            `${fix(m, 1)} grams of CO₂`,
            '0.0 grams, because a gas has no mass'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'In a sealed container, atoms are not lost, so the products weigh what the reactant weighed.',
            'The solid\'s lost mass turns into gas volume instead, so the gas weighs nothing.',
            'A trapped gas slowly loses mass, because high pressure squeezes it.',
            'The mass of a gas depends on the air pressure outside, not on the reactant.'
          ],
          correctTier2: 0,
          hint: 'In a sealed container, mass in = mass out. Subtract the solid product from the starting mass.',
          workedSolution: `Every atom in the ${fix(m, 1)} g of CaCO₃ ends up in the CaO or the CO₂, and the container is sealed. So CaO + CO₂ = ${fix(m, 1)} g, and the CO₂ is ${fix(m, 1)} g - ${fix(cao, 1)} g = ${fix(co2, 1)} g. A gas has mass; you just cannot see it. Open the container and the balance drops by ${fix(co2, 1)} g as the CO₂ escapes.`,
          givenSummary: 'Heating CaCO₃ in a sealed container: mass conservation'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        const R = pick(rng, [{ mg: 2.4, o: 1.6 }, { mg: 4.8, o: 3.2 }, { mg: 1.2, o: 0.8 }]);
        const mgo = R.mg + R.o;
        return {
          id: 'PS1-7.6_diag2',
          skillId: 'PS1-7.6',
          level: 'Level 2 (Intermediate)',
          stem: `In a sealed flask, ${fix(R.mg, 1)} g of magnesium burns in ${fix(R.o, 1)} g of oxygen gas: 2 Mg(s) + O₂(g) -> 2 MgO(s). Both reactants are used up completely.`,
          type: 'two_tier',
          tier1Prompt: 'What is the mass of the magnesium oxide (MgO) that forms?',
          tier1Options: [
            `${fix(mgo, 1)} grams of MgO`,
            `${fix(R.mg, 1)} grams of MgO`,
            `${fix(R.mg - R.o, 1)} grams of MgO`,
            `More than ${fix(mgo, 1)} grams, because the flame adds mass`
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'In a closed system, atoms are not created or destroyed, so product mass equals the reactant mass used.',
            'Burning turns some of the magnesium into light and heat, so the product weighs less.',
            'Oxygen is a gas, so its mass does not count toward the mass of the solid product.',
            'The flame adds heat to the flask, and the added heat adds mass to the product.'
          ],
          correctTier2: 0,
          hint: 'Every Mg atom and every O atom ends up in the MgO. Add up what went in.',
          workedSolution: `In a sealed flask, mass in = mass out. All ${fix(R.mg, 1)} g of Mg and all ${fix(R.o, 1)} g of O₂ end up in the product. So the MgO has a mass of ${fix(R.mg, 1)} + ${fix(R.o, 1)} = ${fix(mgo, 1)} g. A common slip is ignoring the oxygen because it is a gas. Its atoms are now part of the white solid.`,
          givenSummary: 'Burning magnesium in a sealed flask: mass conservation'
        };
      },
      practiceLevels: [
        function level1(rng) {
          const R = pick(rng, [{ t: 25, a: 21.5 }, { t: 40, a: 34 }, { t: 12, a: 10.8 }, { t: 50, a: 41 }]);
          const pct = R.a / R.t * 100;
          return {
            id: 'PS1-7.6_L1',
            skillId: 'PS1-7.6',
            level: 'Level 1 (Routine)',
            stem: `Your calculations predict ${fix(R.t, 1)} g of aspirin (the theoretical yield). After drying the product, you weigh ${fix(R.a, 1)} g of crystals. Calculate the percent yield (type 75.0 for 75.0%).`,
            type: 'numeric',
            unit: '%',
            correctValue: round(pct, 1),
            tolerance: 0.5,
            hint: 'Percent yield = (actual yield / theoretical yield) x 100%.',
            workedSolution: `Percent yield = (${fix(R.a, 1)} g / ${fix(R.t, 1)} g) x 100% = ${fix(pct, 1)}%. Putting the theoretical yield on top gives a number over 100%, which is a sign the fraction is upside down.`,
            givenSummary: 'Percent yield calculation'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-7.6_L2',
            skillId: 'PS1-7.6',
            level: 'Level 2 (Application)',
            stem: 'In an open beaker, a student mixes 10.0 g of baking soda with 50.0 g of vinegar. It fizzes hard. When the fizzing stops, the beaker\'s contents weigh 57.8 g, not 60.0 g. What explains the difference?',
            type: 'mcq',
            options: [
              'Escaped CO₂ gas accounts for the missing 2.2 g; mass is conserved when including the air.',
              'Vigorous bubbling destroyed 2.2 g of matter by converting chemical mass into thermal energy.',
              'The 2.2 g is weighing error, because the baking soda and vinegar were not measured carefully.',
              'The scale lost accuracy because reacting liquids decrease in density as bubbles rise rapidly.'
            ],
            correctIndex: 0,
            hint: 'Think about open systems versus closed systems: where did the bubbles go when they left the beaker?',
            workedSolution: 'Mass is always conserved in chemical reactions. In an open system, gaseous products escape into the surrounding atmosphere. The missing mass (60.0 g - 57.8 g = 2.2 g) is the CO₂ gas that bubbled away. It dispersed into the room air.',
            givenSummary: 'Open system apparent mass loss vs closed system conservation MCQ'
          };
        }
      ]
    }
  ];

  window.PE_DATA_HS_PS1_7 = {
    info: PE_INFO,
    skills: SKILLS
  };
})();
