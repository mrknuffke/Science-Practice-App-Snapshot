/**
 * HS-PS1-1: Periodic Trends and Atomic Structure
 * Items from Support Pack v.26-27 R2, rewritten (Oct 2026) to the Tier 3 register in
 * docs/textbook/VOICE.md and to the core scope of lessons 1-1a, 1-1b, 1-2a, and 1-3a:
 * Bohr shells follow 2, 8, 8, 2 up to calcium (Z = 20); trends are explained by proton pull
 * across a period and extra shells down a group; no self-answering numbers in ranking labels.
 * Zero em-dash compliant: hyphens, colons, and parentheses only.
 */
(function() {
  'use strict';

  // Canonical elements Z=1..36 for parameterization
  const ELEMENTS = [
    { z: 1, sym: 'H', name: 'Hydrogen', group: 1, period: 1, shells: [1], valence: 1, kind: 'nonmetal', radius: 53, ie: 1312, en: 2.20 },
    { z: 2, sym: 'He', name: 'Helium', group: 18, period: 1, shells: [2], valence: 2, kind: 'noble', radius: 31, ie: 2372, en: null },
    { z: 3, sym: 'Li', name: 'Lithium', group: 1, period: 2, shells: [2, 1], valence: 1, kind: 'metal', radius: 167, ie: 520, en: 0.98 },
    { z: 4, sym: 'Be', name: 'Beryllium', group: 2, period: 2, shells: [2, 2], valence: 2, kind: 'metal', radius: 112, ie: 899, en: 1.57 },
    { z: 5, sym: 'B', name: 'Boron', group: 13, period: 2, shells: [2, 3], valence: 3, kind: 'metalloid', radius: 87, ie: 801, en: 2.04 },
    { z: 6, sym: 'C', name: 'Carbon', group: 14, period: 2, shells: [2, 4], valence: 4, kind: 'nonmetal', radius: 67, ie: 1086, en: 2.55 },
    { z: 7, sym: 'N', name: 'Nitrogen', group: 15, period: 2, shells: [2, 5], valence: 5, kind: 'nonmetal', radius: 56, ie: 1402, en: 3.04 },
    { z: 8, sym: 'Oxygen', name: 'Oxygen', group: 16, period: 2, shells: [2, 6], valence: 6, kind: 'nonmetal', radius: 48, ie: 1314, en: 3.44 },
    { z: 9, sym: 'F', name: 'Fluorine', group: 17, period: 2, shells: [2, 7], valence: 7, kind: 'nonmetal', radius: 42, ie: 1681, en: 3.98 },
    { z: 10, sym: 'Ne', name: 'Neon', group: 18, period: 2, shells: [2, 8], valence: 8, kind: 'noble', radius: 38, ie: 2081, en: null },
    { z: 11, sym: 'Na', name: 'Sodium', group: 1, period: 3, shells: [2, 8, 1], valence: 1, kind: 'metal', radius: 190, ie: 496, en: 0.93 },
    { z: 12, sym: 'Mg', name: 'Magnesium', group: 2, period: 3, shells: [2, 8, 2], valence: 2, kind: 'metal', radius: 145, ie: 738, en: 1.31 },
    { z: 13, sym: 'Al', name: 'Aluminum', group: 13, period: 3, shells: [2, 8, 3], valence: 3, kind: 'metal', radius: 118, ie: 578, en: 1.61 },
    { z: 14, sym: 'Si', name: 'Silicon', group: 14, period: 3, shells: [2, 8, 4], valence: 4, kind: 'metalloid', radius: 111, ie: 786, en: 1.90 },
    { z: 15, sym: 'P', name: 'Phosphorus', group: 15, period: 3, shells: [2, 8, 5], valence: 5, kind: 'nonmetal', radius: 98, ie: 1012, en: 2.19 },
    { z: 16, sym: 'S', name: 'Sulfur', group: 16, period: 3, shells: [2, 8, 6], valence: 6, kind: 'nonmetal', radius: 88, ie: 1000, en: 2.58 },
    { z: 17, sym: 'Cl', name: 'Chlorine', group: 17, period: 3, shells: [2, 8, 7], valence: 7, kind: 'nonmetal', radius: 79, ie: 1251, en: 3.16 },
    { z: 18, sym: 'Ar', name: 'Argon', group: 18, period: 3, shells: [2, 8, 8], valence: 8, kind: 'noble', radius: 71, ie: 1521, en: null },
    { z: 19, sym: 'K', name: 'Potassium', group: 1, period: 4, shells: [2, 8, 8, 1], valence: 1, kind: 'metal', radius: 243, ie: 419, en: 0.82 },
    { z: 20, sym: 'Ca', name: 'Calcium', group: 2, period: 4, shells: [2, 8, 8, 2], valence: 2, kind: 'metal', radius: 194, ie: 590, en: 1.00 },
    { z: 31, sym: 'Ga', name: 'Gallium', group: 13, period: 4, shells: [2, 8, 18, 3], valence: 3, kind: 'metal', radius: 136, ie: 579, en: 1.81 },
    { z: 32, sym: 'Ge', name: 'Germanium', group: 14, period: 4, shells: [2, 8, 18, 4], valence: 4, kind: 'metalloid', radius: 125, ie: 762, en: 2.01 },
    { z: 33, sym: 'As', name: 'Arsenic', group: 15, period: 4, shells: [2, 8, 18, 5], valence: 5, kind: 'metalloid', radius: 114, ie: 947, en: 2.18 },
    { z: 34, sym: 'Se', name: 'Selenium', group: 16, period: 4, shells: [2, 8, 18, 6], valence: 6, kind: 'nonmetal', radius: 103, ie: 941, en: 2.55 },
    { z: 35, sym: 'Br', name: 'Bromine', group: 17, period: 4, shells: [2, 8, 18, 7], valence: 7, kind: 'nonmetal', radius: 94, ie: 1140, en: 2.96 },
    { z: 36, sym: 'Kr', name: 'Krypton', group: 18, period: 4, shells: [2, 8, 18, 8], valence: 8, kind: 'noble', radius: 88, ie: 1351, en: 3.00 }
  ];
  ELEMENTS[7].sym = 'O';

  // Element-swap items pick one vetted set per run (see ../pe-num.js). Every set names its own
  // elements, values and explanation, so no sentence is assembled from a rule that might not hold.
  const { pick } = window.PE_NUM;
  const el = sym => ELEMENTS.find(e => e.sym === sym);
  const tag = e => `${e.name} (${e.sym}, Period ${e.period}, Group ${e.group})`;
  /** Two different entries of a list, chosen with the run's random stream. */
  function pickTwo(rng, list) {
    const i = Math.min(list.length - 1, Math.floor(rng() * list.length));
    const j = (i + 1 + Math.min(list.length - 2, Math.floor(rng() * (list.length - 1)))) % list.length;
    return [list[i], list[j]];
  }

  // PS1-1.3 sorting sets. The first Level 2 item and the second draw from separate pools, so the
  // second item never repeats a pair the student has just seen.
  const nuc = (name, sym, a, p) => ({ name, sym, a, p, n: a - p });
  const ISO_PAIRS = {
    first: [
      [nuc('Carbon', 'C', 12, 6), nuc('Carbon', 'C', 14, 6)],
      [nuc('Chlorine', 'Cl', 35, 17), nuc('Chlorine', 'Cl', 37, 17)],
      [nuc('Lithium', 'Li', 6, 3), nuc('Lithium', 'Li', 7, 3)],
      [nuc('Nitrogen', 'N', 14, 7), nuc('Nitrogen', 'N', 15, 7)]
    ],
    second: [
      [nuc('Oxygen', 'O', 16, 8), nuc('Oxygen', 'O', 18, 8)],
      [nuc('Hydrogen', 'H', 1, 1), nuc('Hydrogen', 'H', 2, 1)],
      [nuc('Magnesium', 'Mg', 24, 12), nuc('Magnesium', 'Mg', 26, 12)],
      [nuc('Potassium', 'K', 39, 19), nuc('Potassium', 'K', 41, 19)]
    ]
  };
  // Different elements that share a mass number, so the mass number alone cannot sort them.
  const SAME_A_PAIRS = {
    first: [
      [nuc('Carbon', 'C', 14, 6), nuc('Nitrogen', 'N', 14, 7)],
      [nuc('Argon', 'Ar', 40, 18), nuc('Potassium', 'K', 40, 19)]
    ],
    second: [
      [nuc('Argon', 'Ar', 40, 18), nuc('Calcium', 'Ca', 40, 20)],
      [nuc('Hydrogen', 'H', 3, 1), nuc('Helium', 'He', 3, 2)]
    ]
  };
  const ion = (name, sym, a, p, charge, ionName) => ({ name, sym, a, p, charge, ionName });
  const ION_PAIRS = {
    first: [
      ion('Sodium', 'Na', 23, 11, 1, 'sodium ion Na⁺'),
      ion('Chlorine', 'Cl', 35, 17, -1, 'chloride ion Cl⁻'),
      ion('Oxygen', 'O', 16, 8, -2, 'oxide ion O²⁻')
    ],
    second: [
      ion('Magnesium', 'Mg', 24, 12, 2, 'magnesium ion Mg²⁺'),
      ion('Aluminum', 'Al', 27, 13, 3, 'aluminum ion Al³⁺'),
      ion('Fluorine', 'F', 19, 9, -1, 'fluoride ion F⁻')
    ]
  };
  const NUM_WORD = ['zero', 'one', 'two', 'three'];
  const nucLabel = x => `${x.name}-${x.a} (${x.p} proton${x.p === 1 ? '' : 's'}, ${x.n} neutron${x.n === 1 ? '' : 's'})`;

  /** A four-pair sorting item: two isotope pairs, one same-mass-number pair, one atom and its ion. */
  function isotopeSort(rng, pool) {
    const [isoA, isoB] = pickTwo(rng, ISO_PAIRS[pool]);
    const diff = pick(rng, SAME_A_PAIRS[pool]);
    const io = pick(rng, ION_PAIRS[pool]);
    const ionSym = io.ionName.split(' ').pop();
    const e = io.p - io.charge;
    const k = Math.abs(io.charge);
    const items = [
      { label: `${nucLabel(isoA[0])} and ${nucLabel(isoA[1])}`, correctCategoryIndex: 0 },
      { label: `${nucLabel(diff[0])} and ${nucLabel(diff[1])}`, correctCategoryIndex: 1 },
      { label: `${io.name}-${io.a} atom (${io.p} protons, ${io.p} electrons) and ${io.ionName} (${io.p} protons, ${e} electrons)`, correctCategoryIndex: 2 },
      { label: `${nucLabel(isoB[0])} and ${nucLabel(isoB[1])}`, correctCategoryIndex: 0 }
    ];
    const short = x => `${x.sym}-${x.a}`;
    const workedSolution = `${short(isoA[0])} and ${short(isoA[1])} both have ${isoA[0].p} proton${isoA[0].p === 1 ? '' : 's'}, and ${short(isoB[0])} and ${short(isoB[1])} both have ${isoB[0].p} proton${isoB[0].p === 1 ? '' : 's'}; each pair differs only in neutrons, so they are isotopes. ${short(diff[0])} and ${short(diff[1])} share a mass number of ${diff[0].a}, but ${diff[0].name.toLowerCase()} has ${diff[0].p} proton${diff[0].p === 1 ? '' : 's'} and ${diff[1].name.toLowerCase()} has ${diff[1].p}, so they are different elements. A neutral ${io.sym} atom and ${ionSym} both have ${io.p} protons, but the ion has ${io.charge > 0 ? 'lost' : 'gained'} ${NUM_WORD[k]} electron${k === 1 ? '' : 's'}.`;
    return { items, workedSolution };
  }

  const PE_INFO = {
    id: 'HS-PS1-1',
    code: 'PS1-1',
    title: 'Periodic Trends & Atomic Structure',
    unit: 'Unit 1: Chemical Hygiene & Atomic Structure',
    description: 'Use the periodic table as a model to predict element properties based on outer electron patterns.',
    clarification: 'Properties predicted from patterns include reactivity of metals, types and numbers of bonds formed, and reactions with oxygen and water.',
    assessmentBoundary: 'Assessment is limited to main group elements (Z up to 36). Assessment does not include quantitative understanding of ionization energy beyond relative trends.'
  };

  const SKILLS = [
    {
      id: 'PS1-1.1',
      title: 'Periodic Trends',
      subtitle: 'Use an element\'s period and group to compare atomic radius, ionization energy, and electronegativity.',
      watchOut: 'Atomic radius runs opposite to ionization energy and electronegativity. A bigger atom holds its outer electrons more loosely, so it takes less energy to pull one off. Do not point all three trend arrows the same way.',
      diagnostic: function(rng) {
        // Three atoms across one period, then one atom from the next period down.
        const set = pick(rng, [
          { across: ['F', 'O', 'N'], big: 'Na' },
          { across: ['Cl', 'P', 'Mg'], big: 'K' },
          { across: ['O', 'C', 'Be'], big: 'Mg' }
        ]);
        const row = set.across.map(el);
        const big = el(set.big);
        const order = [...row, big].map(tag);
        const p = row[0].period;
        return {
          id: 'PS1-1.1_diag',
          skillId: 'PS1-1.1',
          level: 'Level 2 (Intermediate)',
          stem: 'Order these four neutral atoms from smallest atomic radius (1) to largest atomic radius (4):',
          type: 'ranking',
          rankingPrompt: 'Order from smallest radius (1) to largest radius (4):',
          items: order.slice(),
          correctOrder: order,
          hint: 'Across a period from left to right, more protons pull the same shell closer in. Starting a new period adds a whole new shell, making the atom much bigger.',
          workedSolution: `Across Period ${p}, each extra proton pulls shell ${p} closer in, so the atoms get smaller from left to right: ${row.map(e => `${e.sym} (${e.radius} pm)`).join(' < ')}. ${big.name} sits in Period ${big.period}, so its outer electrons are in shell ${big.period}, one shell further out. It is the largest of the four (${big.radius} pm).`,
          givenSummary: `Atomic radius trend ranking (${[...set.across, set.big].join(', ')})`
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        // One atom with an outer shell further out, then three across one period. Each set skips
        // the pairs where the trend dips (Be/B, N/O, Mg/Al, P/S), which the lessons do not teach.
        const set = pick(rng, [
          { low: 'K', across: ['Na', 'Mg', 'S'] },
          { low: 'Na', across: ['Li', 'C', 'F'] },
          { low: 'K', across: ['Mg', 'Si', 'Cl'] }
        ]);
        const low = el(set.low);
        const row = set.across.map(el);
        const p = row[0].period;
        const items = [row[1], low, row[2], row[0]].map(tag);
        return {
          id: 'PS1-1.1_diag2',
          skillId: 'PS1-1.1',
          level: 'Level 2 (Intermediate)',
          stem: 'Order these four neutral atoms from lowest ionization energy (1) to highest ionization energy (4):',
          type: 'ranking',
          rankingPrompt: 'Order from lowest ionization energy (1) to highest (4):',
          items,
          correctOrder: [low, ...row].map(tag),
          hint: 'Ionization energy runs opposite to atomic radius. Which atom holds its outer electron furthest from the nucleus?',
          workedSolution: `${low.name} puts its outer electron in shell ${low.period}, so it is held most loosely and is easiest to remove (${low.ie} kJ/mol). Across Period ${p}, more protons pull shell ${p} tighter: ${row.map(e => `${e.sym} (${e.ie})`).join(' < ')} kJ/mol.`,
          givenSummary: `Ionization energy trend ranking (${[set.low, ...set.across].join(', ')})`
        };
      },
      practiceLevels: [
        function level1(rng) {
          // Same-period pairs test proton pull on one shell; same-group pairs test an added shell.
          // Each kind has its own distractors, so no wrong option rests on a false premise.
          const pair = pick(rng, [
            { big: 'Na', small: 'Cl', kind: 'period' },
            { big: 'Li', small: 'F', kind: 'period' },
            { big: 'Mg', small: 'S', kind: 'period' },
            { big: 'Ca', small: 'Mg', kind: 'group' },
            { big: 'Na', small: 'Li', kind: 'group' },
            { big: 'Cl', small: 'F', kind: 'group' }
          ]);
          const big = el(pair.big);
          const small = el(pair.small);
          const [elA, elB] = big.z < small.z ? [big, small] : [small, big];
          const v = big.valence;
          const reason = pair.kind === 'period'
            ? `${big.sym} has fewer protons pulling on shell ${big.period}, so its outer shell sits further out.`
            : `${big.sym} puts its outer electrons into shell ${big.period}, one shell further out than ${small.sym}.`;
          const wrong = pair.kind === 'period'
            ? [
              `${small.sym}, because having more protons pushes the outer shell further out.`,
              'Both atoms have the same radius, because both fill the same outer shell.',
              `${small.sym}, because its extra outer electrons add a new shell.`
            ]
            : [
              `${small.sym}, because its fewer protons let the outer electrons drift further out.`,
              `Both atoms have the same radius, because both have ${v} outer electron${v === 1 ? '' : 's'}.`,
              `${small.sym}, because heavier atoms pack their electrons into a tighter space.`
            ];
          return {
            id: 'PS1-1.1_L1',
            skillId: 'PS1-1.1',
            level: 'Level 1 (Foundational)',
            stem: `Compare a neutral atom of ${elA.name.toLowerCase()} (${elA.sym}, Z = ${elA.z}) with a neutral atom of ${elB.name.toLowerCase()} (${elB.sym}, Z = ${elB.z}). Which atom has the larger atomic radius?`,
            type: 'mcq',
            options: [`${big.sym}, because ${reason}`, ...wrong],
            correctIndex: 0,
            hint: 'Check their positions: are they in the same period (compare protons pulling on the same shell) or the same group (count shells)?',
            workedSolution: `${big.sym} has the larger atomic radius (${big.radius} pm against ${small.radius} pm). ${reason}`,
            givenSummary: `Radius comparison: ${elA.sym} vs ${elB.sym}`
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-1.1_L2',
            skillId: 'PS1-1.1',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Fluorine (F) has the highest electronegativity on the periodic table. Why does fluorine pull harder on shared electrons than both oxygen (O) and chlorine (Cl)?',
            type: 'mcq',
            options: [
              'F has more protons than O in the same shell, and fewer shells than Cl so shared electrons sit closer.',
              'F has fewer protons than O, and more shells than Cl to reach out toward shared electrons.',
              'F already has a full outer shell of eight electrons, which pulls extra electrons in.',
              'F forms positive ions in water, and those positive ions pull electrons off nearby atoms.'
            ],
            correctIndex: 0,
            hint: 'Compare F with O across Period 2 (proton count), then compare F with Cl down Group 17 (number of shells).',
            workedSolution: 'Electronegativity is how strongly an atom pulls on shared electrons in a bond. Moving from O to F across Period 2 adds a proton without adding a shell, so F pulls harder. Moving from Cl up to F in Group 17 removes a whole shell, so shared electrons sit much closer to F\'s nucleus.',
            givenSummary: 'Why fluorine has the highest electronegativity'
          };
        }
      ]
    },
    {
      id: 'PS1-1.2',
      title: 'Bohr Diagrams & Shell Configuration',
      subtitle: 'Fill electron shells in order (2, 8, 8, 2) and count outer-shell electrons up to calcium (Z = 20).',
      watchOut: 'For the first 20 elements, the shells fill as 2, then 8, then 8, then 2 for calcium (Z = 20). Never put more than 2 electrons in shell 1, or more than 8 electrons in the outermost shell.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-1.2_diag',
          skillId: 'PS1-1.2',
          level: 'Level 2 (Intermediate)',
          stem: 'Which shell configuration shows a neutral calcium atom (Ca, Z = 20) in its ground state?',
          type: 'mcq',
          options: [
            '2-8-8-2',
            '2-8-10',
            '2-10-8',
            '2-8-9-1'
          ],
          correctIndex: 0,
          hint: 'For the first 20 elements, shell 1 holds 2, shell 2 holds 8, and shell 3 holds 8 before shell 4 opens.',
          workedSolution: 'A neutral calcium atom has 20 protons and 20 electrons. Shell 1 takes 2, shell 2 takes 8, shell 3 takes 8, and the last 2 go into shell 4: 2-8-8-2.',
          givenSummary: 'Calcium (Z = 20) shell configuration'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-1.2_diag2',
          skillId: 'PS1-1.2',
          level: 'Level 2 (Intermediate)',
          stem: 'Which shell configuration shows a neutral potassium atom (K, Z = 19) in its ground state?',
          type: 'mcq',
          options: [
            '2-8-8-1',
            '2-8-9',
            '2-9-8',
            '2-8-7-2'
          ],
          correctIndex: 0,
          hint: 'Shell 3 holds 8 before shell 4 opens for the first 20 elements. Where does electron 19 go?',
          workedSolution: 'A neutral potassium atom has 19 electrons. Shell 1 takes 2, shell 2 takes 8, and shell 3 takes 8. Most people want to put electron 19 into shell 3 as a ninth electron. It goes into shell 4 instead: 2-8-8-1.',
          givenSummary: 'Potassium (Z = 19) shell configuration'
        };
      },
      practiceLevels: [
        function level1(rng) {
          const e = el(pick(rng, ['P', 'N', 'S', 'Si', 'Al', 'Cl', 'O']));
          return {
            id: 'PS1-1.2_L1',
            skillId: 'PS1-1.2',
            level: 'Level 1 (Foundational)',
            stem: `A neutral ${e.name.toLowerCase()} atom (${e.sym}, Z = ${e.z}) sits in Group ${e.group}. How many valence electrons are in its outer shell?`,
            type: 'numeric',
            inputPrompt: 'Enter the number of valence electrons:',
            unit: 'electrons',
            correctValue: e.valence,
            tolerance: 0,
            hint: `Fill the shells for ${e.z} electrons (${e.period === 2 ? '2, then what is left' : '2, then 8, then what is left'}). The electrons in the outer shell are the valence electrons.`,
            workedSolution: `${e.name} (Z = ${e.z}) fills its shells as ${e.shells.join('-')}. There are ${e.valence} valence electrons in shell ${e.shells.length}.`,
            givenSummary: `${e.name} valence electron count`
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-1.2_L2',
            skillId: 'PS1-1.2',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A student writes the shell configuration for a neutral chlorine atom (Z = 17) as 2-7-8. What two mistakes did the student make?',
            type: 'mcq',
            options: [
              'Shell 2 must fill to 8 before shell 3 opens, and chlorine ends with 7 outer electrons, not 8.',
              'Shell 1 holds 8 electrons in Period 3, and shell 3 can hold at most 2 electrons.',
              'A neutral chlorine atom has 18 electrons in total, and shell 2 holds 18 electrons.',
              'A neutral chlorine atom has 16 electrons in total, and an outer shell cannot hold an odd number.'
            ],
            correctIndex: 0,
            hint: 'Check whether shell 2 is full at 7. Then check how many outer electrons a Group 17 atom has.',
            workedSolution: 'First, shell 2 holds 8 electrons and must fill completely before any electron goes into shell 3. Second, chlorine has 17 electrons in all, which leaves 7 in shell 3 (2-8-7), not 8.',
            givenSummary: 'Fixing a wrong chlorine configuration (2-7-8)'
          };
        }
      ]
    },
    {
      id: 'PS1-1.3',
      title: 'Isotopes & Subatomic Particles',
      subtitle: 'Count protons, neutrons, and electrons in isotopes and ions, and explain why atomic mass is a decimal.',
      watchOut: 'Isotopes of an element have the same number of protons (the atomic number Z), so they are the same element and react the same way. They differ only in neutron count and mass number (A = protons + neutrons).',
      diagnostic: function(rng) {
        const set = isotopeSort(rng, 'first');
        return {
          id: 'PS1-1.3_diag',
          skillId: 'PS1-1.3',
          level: 'Level 2 (Intermediate)',
          stem: 'Sort each pair of atoms or ions by how the two are related:',
          type: 'categorize',
          categories: [
            'Isotopes of the same element',
            'Atoms of different elements',
            'Neutral atom and ion of the same element'
          ],
          items: set.items,
          hint: 'Same protons with different neutrons means isotopes. Different protons means different elements. Same protons with different electrons means an atom and an ion.',
          workedSolution: set.workedSolution,
          givenSummary: 'Sorting isotopes, elements, and ions'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        const set = isotopeSort(rng, 'second');
        return {
          id: 'PS1-1.3_diag2',
          skillId: 'PS1-1.3',
          level: 'Level 2 (Intermediate)',
          stem: 'Sort each pair of atoms or ions by how the two are related:',
          type: 'categorize',
          categories: ['Isotopes of the same element', 'Atoms of different elements', 'Neutral atom and ion of the same element'],
          items: set.items,
          hint: 'Look at the proton count first. The mass number can match even when the elements are different.',
          workedSolution: set.workedSolution,
          givenSummary: 'Sorting isotopes, elements, and ions (set 2)'
        };
      },
      practiceLevels: [
        function level1(rng) {
          const isotopePool = [
            { sym: 'Cl', name: 'Chlorine', z: 17, a: 37, p: 17, n: 20, e: 17 },
            { sym: 'K', name: 'Potassium', z: 19, a: 39, p: 19, n: 20, e: 19 },
            { sym: 'C', name: 'Carbon', z: 6, a: 13, p: 6, n: 7, e: 6 },
            { sym: 'Mg', name: 'Magnesium', z: 12, a: 25, p: 12, n: 13, e: 12 }
          ];
          const iso = isotopePool[Math.floor(rng() * isotopePool.length)];
          return {
            id: 'PS1-1.3_L1',
            skillId: 'PS1-1.3',
            level: 'Level 1 (Foundational)',
            stem: `How many protons, neutrons, and electrons are in a neutral atom of ${iso.name}-${iso.a} (${iso.sym}, Z = ${iso.z})?`,
            type: 'mcq',
            options: [
              `${iso.p} protons, ${iso.n} neutrons, and ${iso.e} electrons`,
              `${iso.p} protons, ${iso.a} neutrons, and ${iso.p} electrons`,
              `${iso.n} protons, ${iso.p} neutrons, and ${iso.a} electrons`,
              `${iso.p} protons, ${iso.n} neutrons, and ${iso.n} electrons`
            ],
            correctIndex: 0,
            hint: 'Protons = Z. In a neutral atom, electrons = protons. Neutrons = mass number (A) minus Z.',
            workedSolution: `For ${iso.name}-${iso.a}, Z = ${iso.z} gives ${iso.p} protons, and a neutral atom has ${iso.e} electrons to match. Subtracting protons from the mass number gives ${iso.a} - ${iso.z} = ${iso.n} neutrons.`,
            givenSummary: `${iso.sym}-${iso.a} proton, neutron, and electron count`
          };
        },
        function level2(rng) {
          // Natural abundances rounded to whole percents; each set averages back to the listed mass.
          const x = pick(rng, [
            { name: 'Magnesium', z: 12, mass: '24.305', isotopes: 'Mg-24, Mg-25, Mg-26', count: 'three', sample: 'a piece of magnesium metal',
              mix: 'mostly Mg-24 (about 79%), with smaller amounts of Mg-25 (about 10%) and Mg-26 (about 11%)' },
            { name: 'Chlorine', z: 17, mass: '35.45', isotopes: 'Cl-35, Cl-37', count: 'two', sample: 'a sample of chlorine gas',
              mix: 'about 76% Cl-35 and about 24% Cl-37' },
            { name: 'Boron', z: 5, mass: '10.81', isotopes: 'B-10, B-11', count: 'two', sample: 'a sample of boron',
              mix: 'about 20% B-10 and about 80% B-11' }
          ]);
          const lower = x.name.toLowerCase();
          const frac = x.mass.slice(x.mass.indexOf('.'));
          return {
            id: 'PS1-1.3_L2',
            skillId: 'PS1-1.3',
            level: 'Level 3 (Mastery Challenge)',
            stem: `${x.name} has an atomic mass of ${x.mass} on the periodic table. Why is that number a decimal when every atom has a whole number of protons and neutrons?`,
            type: 'mcq',
            options: [
              `It is a weighted average of ${lower}'s natural isotopes (${x.isotopes}) based on how common each is.`,
              `The ${x.z} electrons in a ${lower} atom add ${frac} mass units as they move around the nucleus.`,
              'Protons and neutrons slowly wear down over time, so older atoms weigh a little less.',
              `A ${lower} atom gains and loses a small fraction of a neutron whenever it warms up.`
            ],
            correctIndex: 0,
            hint: `Does ${x.sample} contain only one isotope, or a mix of several isotopes?`,
            workedSolution: `${x.name} in nature is a mix of ${x.count} isotopes: ${x.mix}. Averaging their masses by those percentages gives ${x.mass}, which sits closest to the most common isotope.`,
            givenSummary: `Why ${lower}'s atomic mass is a decimal`
          };
        }
      ]
    },
    {
      id: 'PS1-1.4',
      title: 'Valence Electrons, Ions & Bonds',
      subtitle: 'Use group numbers to find valence electrons, ion charges, and how strongly atoms pull on bonding electrons.',
      watchOut: 'Metals in Groups 1, 2, and 13 lose 1, 2, or 3 electrons to form 1+, 2+, or 3+ ions. Nonmetals in Groups 15, 16, and 17 gain 3, 2, or 1 electrons to form 3-, 2-, or 1- ions, or share electrons to reach 8.',
      diagnostic: function(rng) {
        // Each metal carries its own distractors: the sign slip, gaining up to 8, and a charge
        // read from the wrong place on the table (the "only 1" rule, or the period number).
        const m = pick(rng, [
          { sym: 'Al', name: 'Aluminum', group: 13, ion: 'Al³⁺', options: [
            '3+, because it loses its 3 outer electrons to leave a full shell of 8.',
            '3-, because it gains 3 electrons, one for each outer electron it has.',
            '5-, because it gains 5 electrons to fill shell 3 up to 8.',
            '1+, because any metal atom loses only 1 electron when it reacts.'
          ], config: '2-8-3', inner: '2-8', inner2: 'second', k: 3, gain: 5 },
          { sym: 'Mg', name: 'Magnesium', group: 2, ion: 'Mg²⁺', options: [
            '2+, because it loses its 2 outer electrons to leave a full shell of 8.',
            '2-, because it gains 2 electrons, one for each outer electron it has.',
            '6-, because it gains 6 electrons to fill shell 3 up to 8.',
            '1+, because any metal atom loses only 1 electron when it reacts.'
          ], config: '2-8-2', inner: '2-8', inner2: 'second', k: 2, gain: 6 },
          { sym: 'K', name: 'Potassium', group: 1, ion: 'K⁺', options: [
            '1+, because it loses its 1 outer electron to leave a full shell of 8.',
            '1-, because it gains 1 electron, one for each outer electron it has.',
            '7-, because it gains 7 electrons to fill shell 4 up to 8.',
            '4+, because it loses one electron for each of its 4 shells.'
          ], config: '2-8-8-1', inner: '2-8-8', inner2: 'third', k: 1, gain: 7 },
          { sym: 'Ca', name: 'Calcium', group: 2, ion: 'Ca²⁺', options: [
            '2+, because it loses its 2 outer electrons to leave a full shell of 8.',
            '2-, because it gains 2 electrons, one for each outer electron it has.',
            '6-, because it gains 6 electrons to fill shell 4 up to 8.',
            '4+, because it loses one electron for each of its 4 shells.'
          ], config: '2-8-8-2', inner: '2-8-8', inner2: 'third', k: 2, gain: 6 }
        ]);
        const lower = m.name.toLowerCase();
        const el1 = m.k === 1 ? 'electron' : 'electrons';
        return {
          id: 'PS1-1.4_diag',
          skillId: 'PS1-1.4',
          level: 'Level 2 (Intermediate)',
          stem: `${m.name} (${m.sym}) sits in Group ${m.group} of the periodic table. What charge does ${m.sym === 'Al' ? 'an' : 'a'} ${lower} ion carry, and why?`,
          type: 'mcq',
          options: m.options,
          correctIndex: 0,
          hint: `${m.name} is ${m.config}. Is it easier for a metal atom to lose ${m.k} outer ${el1} or pull in ${m.gain} more?`,
          workedSolution: `${m.name} has the shell configuration ${m.config}. Losing its ${m.k} outer ${el1} leaves the full ${m.inner2} shell (${m.inner}) and ${m.k} more ${m.k === 1 ? 'proton' : 'protons'} than electrons, forming ${m.ion}.`,
          givenSummary: `${m.name} (Group ${m.group}) ion charge`
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        const n = pick(rng, [
          { sym: 'S', name: 'Sulfur', group: 16, ion: 'S²⁻', config: '2-8-6', options: [
            '2-, because it gains 2 electrons to fill its outer shell to 8.',
            '6+, because it loses its 6 outer electrons to empty shell 3.',
            '2+, because it loses 2 electrons like the metals in Group 2.',
            '6-, because it gains 6 electrons to match its group number.'
          ], k: 2, v: 6, kWord: 'two', vWord: 'six' },
          { sym: 'O', name: 'Oxygen', group: 16, ion: 'O²⁻', config: '2-6', options: [
            '2-, because it gains 2 electrons to fill its outer shell to 8.',
            '6+, because it loses its 6 outer electrons to empty shell 2.',
            '2+, because it loses 2 electrons like the metals in Group 2.',
            '6-, because it gains 6 electrons to match its group number.'
          ], k: 2, v: 6, kWord: 'two', vWord: 'six' },
          { sym: 'N', name: 'Nitrogen', group: 15, ion: 'N³⁻', config: '2-5', options: [
            '3-, because it gains 3 electrons to fill its outer shell to 8.',
            '5+, because it loses its 5 outer electrons to empty shell 2.',
            '3+, because it loses 3 electrons like aluminum in Group 13.',
            '5-, because it gains 5 electrons to match its 5 outer electrons.'
          ], k: 3, v: 5, kWord: 'three', vWord: 'five' },
          { sym: 'Cl', name: 'Chlorine', group: 17, ion: 'Cl⁻', config: '2-8-7', options: [
            '1-, because it gains 1 electron to fill its outer shell to 8.',
            '7+, because it loses its 7 outer electrons to empty shell 3.',
            '1+, because it loses 1 electron like the metals in Group 1.',
            '7-, because it gains 7 electrons to match its 7 outer electrons.'
          ], k: 1, v: 7, kWord: 'one', vWord: 'seven' }
        ]);
        const lower = n.name.toLowerCase();
        const kE = n.k === 1 ? 'electron' : 'electrons';
        return {
          id: 'PS1-1.4_diag2',
          skillId: 'PS1-1.4',
          level: 'Level 2 (Intermediate)',
          stem: `${n.name} (${n.sym}) sits in Group ${n.group} of the periodic table. What charge does ${n.sym === 'O' ? 'an' : 'a'} ${lower} ion carry, and why?`,
          type: 'mcq',
          options: n.options,
          correctIndex: 0,
          hint: `${n.name} is ${n.config}. Is it shorter to gain ${n.k} ${kE} or to lose ${n.v}?`,
          workedSolution: `${n.name} has the shell configuration ${n.config}. Losing ${n.v} electrons would also leave a full shell, but moving ${n.vWord} electrons costs far more than moving ${n.kWord}. ${n.name} gains ${n.k} ${kE} to reach 8, so it has ${n.k} more ${kE} than protons and forms ${n.ion}.`,
          givenSummary: `${n.name} (Group ${n.group}) ion charge`
        };
      },
      practiceLevels: [
        function level1(rng) {
          const set = pick(rng, [
            { order: ['F', 'Cl', 'Br', 'Na'],
              why: 'Halogens in Group 17 pull strongly on shared electrons, and that pull weakens down the group as extra shells are added: F (Period 2) > Cl (Period 3) > Br (Period 4). Sodium is a Group 1 metal on the far left, so it has the weakest pull of the four.' },
            { order: ['F', 'O', 'C', 'Li'],
              why: 'All four sit in Period 2, so they share the same outer shell. Each step to the right adds a proton that pulls harder on shared electrons: F > O > C. Lithium is a Group 1 metal on the far left, so it has the weakest pull of the four.' },
            { order: ['Cl', 'S', 'Si', 'Na'],
              why: 'All four sit in Period 3, so they share the same outer shell. Each step to the right adds a proton that pulls harder on shared electrons: Cl > S > Si. Sodium is a Group 1 metal on the far left, so it has the weakest pull of the four.' }
          ]);
          const order = set.order.map(el).map(tag);
          return {
            id: 'PS1-1.4_L1',
            skillId: 'PS1-1.4',
            level: 'Level 1 (Foundational)',
            stem: 'Use periodic table positions to rank these four elements from highest electronegativity (1, strongest pull on shared electrons) to lowest electronegativity (4):',
            type: 'ranking',
            rankingPrompt: 'Order from highest electronegativity (1) to lowest electronegativity (4):',
            items: order.slice(),
            correctOrder: order,
            hint: 'Electronegativity rises as you move right across a period and up a group toward fluorine. Metals on the far left pull the weakest.',
            workedSolution: set.why,
            givenSummary: `Electronegativity ranking from periodic position (${set.order.join(', ')})`
          };
        },
        function level2(rng) {
          const v = pick(rng, [
            {
              stem: 'Fluorine gas (F₂) is poisonous and attacks skin, yet sodium fluoride (NaF) is safe in toothpaste. Why does the fluoride in NaF behave so differently from F₂?',
              options: [
                'Each fluoride ion (F⁻) already has a full outer shell of 8 electrons, so it does not rip electrons from cells.',
                'Sodium turns the fluorine nucleus into a harmless neon nucleus when the two elements react.',
                'NaF is a nonpolar gas, so its molecules bounce off living cells without touching them.',
                'Water in toothpaste takes protons out of the fluoride nucleus and makes it neutral.'
              ],
              hint: 'Compare the outer shell of an F atom (2-7) with the outer shell of an F⁻ ion (2-8).',
              workedSolution: 'Fluorine atoms in F₂ have 7 outer electrons (2-7) and pull an electron off almost anything they touch. In NaF, each fluorine has already taken an electron from sodium to become F⁻ (2-8). With a full outer shell, F⁻ is stable.',
              givenSummary: 'Why F⁻ in toothpaste is stable while F₂ is reactive'
            },
            {
              stem: 'Chlorine gas (Cl₂) is poisonous and attacks the lungs, yet sodium chloride (NaCl) is table salt. Why does the chloride in NaCl behave so differently from Cl₂?',
              options: [
                'Each chloride ion (Cl⁻) already has a full outer shell of 8 electrons, so it does not rip electrons from cells.',
                'Sodium turns the chlorine nucleus into a harmless argon nucleus when the two elements react.',
                'NaCl is a nonpolar solid, so its particles slide past living cells without touching them.',
                'Water in food takes protons out of the chloride nucleus and makes it neutral.'
              ],
              hint: 'Compare the outer shell of a Cl atom (2-8-7) with the outer shell of a Cl⁻ ion (2-8-8).',
              workedSolution: 'Chlorine atoms in Cl₂ have 7 outer electrons (2-8-7) and pull an electron off almost anything they touch. In NaCl, each chlorine has already taken an electron from sodium to become Cl⁻ (2-8-8). With a full outer shell, Cl⁻ is stable.',
              givenSummary: 'Why Cl⁻ in table salt is stable while Cl₂ is reactive'
            }
          ]);
          return {
            id: 'PS1-1.4_L2',
            skillId: 'PS1-1.4',
            level: 'Level 3 (Mastery Challenge)',
            stem: v.stem,
            type: 'mcq',
            options: v.options,
            correctIndex: 0,
            hint: v.hint,
            workedSolution: v.workedSolution,
            givenSummary: v.givenSummary
          };
        }
      ]
    },
    {
      id: 'PS1-1.5',
      title: 'Comparing Reactivity',
      subtitle: 'Predict how metal and nonmetal reactivity change across a period and down a group.',
      watchOut: 'Metals react by losing outer electrons, so metals get more reactive DOWN a group and to the LEFT across a period, where outer electrons are held more loosely. Nonmetals react by gaining or sharing electrons, so they get more reactive UP a group and to the RIGHT.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-1.5_diag',
          skillId: 'PS1-1.5',
          level: 'Level 2 (Intermediate)',
          stem: 'Calcium (Ca, Period 4, Group 2) and magnesium (Mg, Period 3, Group 2) are both dropped into water.',
          type: 'two_tier',
          tier1Prompt: 'Which metal reacts faster with water?',
          tier1Options: [
            'Calcium reacts faster with water than magnesium.',
            'Magnesium reacts faster with water than calcium.',
            'Both metals react at the same speed in water.',
            'Neither metal reacts with water at room temperature.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why does metal reactivity change this way down a group?',
          tier2Options: [
            'Each step down adds a shell, so outer electrons sit further from the nucleus and are easier to lose.',
            'Each step down adds a shell, which lets the metal atom pull in outside electrons much faster.',
            'All atoms in the same group have two outer electrons, so they lose them at the same speed.',
            'Smaller metal atoms have fewer neutrons, so their outer electrons escape more easily.'
          ],
          correctTier2: 0,
          hint: 'Metals react by losing outer electrons. Does an extra shell make outer electrons easier or harder to lose?',
          workedSolution: 'Calcium is one row below magnesium in Group 2, so its two outer electrons sit in shell 4 instead of shell 3. Because they are further from the nucleus and shielded by an extra inner shell, calcium loses them more easily and bubbles in water much faster.',
          givenSummary: 'Group 2 metal reactivity: Ca vs Mg'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        const v = pick(rng, [
          {
            stem: 'Fluorine (F, Period 2, Group 17) and chlorine (Cl, Period 3, Group 17) are each passed over hot sodium metal.',
            tier1Options: [
              'Fluorine reacts more vigorously with sodium than chlorine.',
              'Chlorine reacts more vigorously with sodium than fluorine.',
              'Both nonmetals react with sodium at the same speed.',
              'Neither nonmetal reacts with sodium, because both are gases.'
            ],
            tier2Options: [
              'Fluorine has one fewer shell, so its nucleus pulls an incoming electron in more strongly.',
              'Chlorine has more protons, so its nucleus pulls an incoming electron in more strongly.',
              'Fluorine has more outer electrons than chlorine, so it fills its outer shell faster.',
              'Fluorine has fewer shells, so it loses its outer electrons more easily than chlorine.'
            ],
            hint: 'Nonmetals react by gaining electrons. Where does an incoming electron sit in fluorine compared with chlorine?',
            workedSolution: 'Both halogens need one more electron. In fluorine that electron lands in shell 2, close to the nucleus with little shielding. In chlorine it lands in shell 3, further out. Chlorine does have more protons, but the extra inner shell shields most of that pull. Fluorine grabs the electron harder, so it reacts more vigorously.',
            givenSummary: 'Group 17 nonmetal reactivity: F vs Cl'
          },
          {
            stem: 'Chlorine (Cl, Period 3, Group 17) and bromine (Br, Period 4, Group 17) are each passed as a gas over hot sodium metal.',
            tier1Options: [
              'Chlorine reacts more vigorously with sodium than bromine.',
              'Bromine reacts more vigorously with sodium than chlorine.',
              'Both nonmetals react with sodium at the same speed.',
              'Neither nonmetal reacts with sodium, because both already have 7 outer electrons.'
            ],
            tier2Options: [
              'Chlorine has one fewer shell, so its nucleus pulls an incoming electron in more strongly.',
              'Bromine has more protons, so its nucleus pulls an incoming electron in more strongly.',
              'Chlorine has more outer electrons than bromine, so it fills its outer shell faster.',
              'Chlorine has fewer shells, so it loses its outer electrons more easily than bromine.'
            ],
            hint: 'Nonmetals react by gaining electrons. Where does an incoming electron sit in chlorine compared with bromine?',
            workedSolution: 'Both halogens need one more electron. In chlorine that electron lands in shell 3. In bromine it lands in shell 4, further from the nucleus. Bromine does have more protons, but its extra inner shells shield most of that pull. Chlorine grabs the electron harder, so it reacts more vigorously.',
            givenSummary: 'Group 17 nonmetal reactivity: Cl vs Br'
          }
        ]);
        return {
          id: 'PS1-1.5_diag2',
          skillId: 'PS1-1.5',
          level: 'Level 2 (Intermediate)',
          stem: v.stem,
          type: 'two_tier',
          tier1Prompt: 'Which nonmetal reacts more vigorously with sodium?',
          tier1Options: v.tier1Options,
          correctTier1: 0,
          tier2Prompt: 'Why does nonmetal reactivity change this way up a group?',
          tier2Options: v.tier2Options,
          correctTier2: 0,
          hint: v.hint,
          workedSolution: v.workedSolution,
          givenSummary: v.givenSummary
        };
      },
      practiceLevels: [
        function level1(rng) {
          const [bigSym, smallSym] = pick(rng, [['K', 'Li'], ['Na', 'Li'], ['K', 'Na']]);
          const big = el(bigSym);
          const small = el(smallSym);
          const [first, second] = pick(rng, [[big, small], [small, big]]);
          return {
            id: 'PS1-1.5_L1',
            skillId: 'PS1-1.5',
            level: 'Level 1 (Foundational)',
            stem: `${first.name} (${first.sym}, Period ${first.period}) and ${second.name.toLowerCase()} (${second.sym}, Period ${second.period}) are both Group 1 metals. Which metal reacts more violently with water, and why?`,
            type: 'mcq',
            options: [
              `${big.name}, because its outer electron is in shell ${big.period}, further from the nucleus and easier to lose.`,
              `${small.name}, because its smaller atom concentrates positive charge and pulls water molecules in.`,
              'Both react the same way, because every Group 1 metal has 1 outer electron.',
              `${small.name}, because having fewer inner shells lets its outer electron leave without bumping others.`
            ],
            correctIndex: 0,
            hint: `Compare shell ${big.period} in ${big.name.toLowerCase()} with shell ${small.period} in ${small.name.toLowerCase()}. Which outer electron is held more loosely?`,
            workedSolution: `${big.name} puts its single outer electron in shell ${big.period} (${big.shells.join('-')}), while ${small.name.toLowerCase()} puts its outer electron in shell ${small.period} (${small.shells.join('-')}). Further from the nucleus and shielded by more inner shells, ${big.name.toLowerCase()}'s outer electron comes off much more easily.`,
            givenSummary: `Group 1 metal reactivity: ${big.sym} vs ${small.sym}`
          };
        },
        function level2(rng) {
          const [g1, g2] = pick(rng, [['Na', 'Mg'], ['K', 'Ca']]).map(el);
          const n = g1.period;
          return {
            id: 'PS1-1.5_L2',
            skillId: 'PS1-1.5',
            level: 'Level 3 (Mastery Challenge)',
            stem: `${g1.name} (${g1.sym}, Group 1) and ${g2.name.toLowerCase()} (${g2.sym}, Group 2) both sit in Period ${n}. Why does ${g1.name.toLowerCase()} react much faster with cold water than ${g2.name.toLowerCase()}?`,
            type: 'mcq',
            options: [
              `${g1.name} only has to lose 1 outer electron, and its ${g1.z} protons hold shell ${n} less tightly than ${g2.name.toLowerCase()}'s ${g2.z}.`,
              `${g1.name} has one more electron shell than ${g2.name.toLowerCase()}, so its outer electron sits further out.`,
              `${g2.name} has a higher electronegativity, so it forms nonpolar covalent bonds with water.`,
              `${g1.name} has extra protons in shell ${n} that push its outer electron out of the atom.`
            ],
            correctIndex: 0,
            hint: `Both atoms use shell ${n}. Compare how many outer electrons each metal loses and how many protons pull on shell ${n}.`,
            workedSolution: `${g1.name} is ${g1.shells.join('-')} (${g1.z} protons) and ${g2.name.toLowerCase()} is ${g2.shells.join('-')} (${g2.z} protons). ${g1.name} has one less proton pulling on shell ${n} and only needs to lose 1 electron to leave a full shell, whereas ${g2.name.toLowerCase()} must lose 2 electrons against a stronger pull.`,
            givenSummary: `Period ${n} metal reactivity: ${g1.sym} vs ${g2.sym}`
          };
        }
      ]
    },
    {
      id: 'PS1-1.6',
      title: 'From Position to Hazard',
      subtitle: 'Connect an element\'s group and outer shell to its lab hazards and safe storage.',
      watchOut: 'Lab hazards follow directly from outer shells. Group 1 metals lose their single outer electron to water so fast that they release flammable hydrogen gas (H₂) and heat, so they are stored under oil. Group 18 noble gases have full outer shells and no reactivity hazard.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-1.6_diag',
          skillId: 'PS1-1.6',
          level: 'Level 2 (Intermediate)',
          stem: 'Select every true statement about the reactivity and safe handling of Group 1 alkali metals such as sodium (Na) and potassium (K):',
          type: 'multi_select',
          options: [
            'They react with water to make flammable hydrogen gas (H₂) and a basic hydroxide solution.',
            'They are stored under mineral oil to keep air and water vapor away from the metal.',
            'They react more violently down the group because the outer electron sits further from the nucleus.',
            'They are unreactive gases at room temperature and carry only a compressed-gas symbol.',
            'Leftover pieces can be washed safely down a lab sink with plenty of tap water.'
          ],
          correctIndices: [0, 1, 2],
          hint: 'Group 1 metals have 1 loosely held outer electron. Think about what happens when they touch water or damp air.',
          workedSolution: 'Statements A, B, and C are true. Group 1 metals give up their single outer electron to water, releasing H₂ gas and enough heat to ignite it. Storing them under oil keeps moisture out, and the reaction grows more violent down the group.',
          givenSummary: 'Alkali metal reactivity and storage multi-select'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-1.6_diag2',
          skillId: 'PS1-1.6',
          level: 'Level 2 (Intermediate)',
          stem: 'Select every true statement about the hazards and safe handling of Group 17 halogens such as chlorine (Cl₂) and bromine (Br₂):',
          type: 'multi_select',
          options: [
            'They pull in one electron readily, so they attack metals and living tissue.',
            'They are used in a fume hood because chlorine and bromine vapors are toxic to breathe.',
            'Fluorine is the most reactive halogen because its outer shell sits closest to the nucleus.',
            'They are stored under mineral oil to stop them reacting with water vapor in air.',
            'They are safe to smell directly because their full outer shells make them unreactive.'
          ],
          correctIndices: [0, 1, 2],
          hint: 'Halogens have 7 outer electrons. Which hazards come from needing one more, and which storage rule belongs to a different group?',
          workedSolution: 'Statements A, B, and C are true. Halogens need one electron to fill their outer shell, so they rip electrons from metals and from the molecules in your lungs and skin. Storage under oil is the rule for Group 1 metals. A full outer shell describes the Group 18 noble gases, not the halogens.',
          givenSummary: 'Halogen hazards and handling multi-select'
        };
      },
      practiceLevels: [
        function level1(rng) {
          const g = el(pick(rng, ['Ne', 'Ar']));
          const lower = g.name.toLowerCase();
          const cfg = g.shells.join('-');
          return {
            id: 'PS1-1.6_L1',
            skillId: 'PS1-1.6',
            level: 'Level 1 (Foundational)',
            stem: `A tank of ${lower} gas (${g.sym}, Z = ${g.z}) carries a compressed-gas symbol, but no flammability or reactivity symbols. Why does ${lower} have no chemical reactivity hazard?`,
            type: 'mcq',
            options: [
              `${g.name} has a full outer shell of 8 electrons (${cfg}), so it neither gains nor loses electrons.`,
              g.sym === 'Ne'
                ? 'Neon atoms are so light and fast that they bounce off other molecules before a bond can form.'
                : 'Argon atoms move so fast that they bounce off other molecules before a bond can form.',
              'Colorless gases do not need hazard symbols on their storage tanks in a school lab.',
              `${g.name} forms tight covalent bonds with the steel tank wall that lock it in place.`
            ],
            correctIndex: 0,
            hint: `Write the shell configuration for ${lower} (Z = ${g.z}). Does its outer shell have any empty spots or loose electrons?`,
            workedSolution: `${g.name} (Z = ${g.z}) has the shell configuration ${cfg}. Because its outer shell is already full, it does not gain, lose, or share electrons under lab conditions.`,
            givenSummary: `Why ${lower} carries no chemical reactivity hazard`
          };
        },
        function level2(rng) {
          const v = pick(rng, [
            { big: 'K', gap: 'two periods', heat: 'enough heat to catch fire' },
            { big: 'Na', gap: 'one period', heat: 'enough heat to melt the metal and sometimes ignite the gas' }
          ]);
          const big = el(v.big);
          const li = el('Li');
          const lower = big.name.toLowerCase();
          return {
            id: 'PS1-1.6_L2',
            skillId: 'PS1-1.6',
            level: 'Level 3 (Mastery Challenge)',
            stem: `A stockroom bottle holds ${lower} (${big.sym}, Group 1, Period ${big.period}). How does its reaction with water compare with lithium (Li, Group 1, Period 2), and how should it be stored?`,
            type: 'mcq',
            options: [
              `${big.name} reacts much more violently because its shell ${big.period} electron is held more loosely; store it under oil.`,
              `${big.name} reacts more gently because heavier atoms move slower in water; store it in an open jar.`,
              'Both metals react at the same speed because both lose 1 electron; store both in water.',
              `${big.name} does not react with water because its ${big.z} protons lock its electrons in place.`
            ],
            correctIndex: 0,
            hint: `${big.name} sits ${v.gap} below lithium in Group 1. What does that extra distance do to its outer electron?`,
            workedSolution: `${big.name} sits ${v.gap} below lithium, so its outer electron is in shell ${big.period} (${big.shells.join('-')}) instead of shell 2 (${li.shells.join('-')}). Held more loosely, that electron transfers to water almost at once, releasing H₂ gas and ${v.heat}. Like other alkali metals, ${lower} is stored under mineral oil.`,
            givenSummary: `${big.name} vs lithium reactivity and storage`
          };
        }
      ]
    }
  ];

  window.PE_DATA_HS_PS1_1 = {
    info: PE_INFO,
    skills: SKILLS,
    elements: ELEMENTS
  };
})();
