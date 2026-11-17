/**
 * HS-PS1-2: Simple Chemical Reactions, Bonding & Conservation of Matter
 * Items from Support Pack v.26-27 R2, rewritten (Oct 2026) to the Tier 3 register in
 * docs/textbook/VOICE.md and to the scope of lessons 1-2a, 1-2b, 1-2c, 1-2e and 2-2a:
 * shapes are given as fact (no VSEPR), and the nonpolar cutoff is ΔEN < 0.5.
 * Items that ask a student to reason from a structure carry a `figure` (inline SVG, built with
 * ../pe-figures.js), drawn by the engine under the stem.
 * Zero em-dash compliant: hyphens, colons, and parentheses only.
 */
(function() {
  'use strict';

  // Calculation items pick their numbers per run (see ../pe-num.js).
  const { pick } = window.PE_NUM;
  const SUBS = '₀₁₂₃₄₅₆₇₈₉';
  const sub = n => String(n).split('').map(d => SUBS[+d]).join('');
  const alkane = n => 'C' + sub(n) + 'H' + sub(2 * n + 2);

  // Drawing helpers live in ../pe-figures.js (loaded first by index.html).
  const { svg, label, divider, hDivider, co2, h2o, nh3, hcl, carbonCross, h2Particle, o2Particle, INK } = window.PE_FIGURES;

  const FIG_CO2_H2O = svg(560, 200,
    'Lewis structures. Carbon dioxide is linear: O double-bonded to C double-bonded to O, with two lone pairs on each oxygen. Water is bent: two H atoms bonded to O, with two lone pairs on the oxygen.',
    divider(280, 200) +
    label(140, 30, 'Carbon dioxide (CO₂)', true) + co2(140, 100) + label(140, 178, 'linear') +
    label(420, 30, 'Water (H₂O)', true) + h2o(420, 104) + label(420, 178, 'bent'));

  const FIG_FOUR_MOLECULES = svg(560, 440,
    'Lewis structures of four molecules. Carbon tetrachloride: four Cl atoms arranged symmetrically around C. Ammonia: three H atoms below N, with one lone pair on N, pyramidal. Hydrogen chloride: H bonded to Cl, linear. Methane: four H atoms arranged symmetrically around C.',
    divider(280, 440) + hDivider(220, 560) +
    label(140, 26, 'Carbon tetrachloride (CCl₄)', true) + carbonCross(140, 112, { n: 'Cl', s: 'Cl', e: 'Cl', w: 'Cl' }) + label(140, 206, 'symmetric') +
    label(420, 26, 'Ammonia (NH₃)', true) + nh3(420, 112) + label(420, 206, 'pyramidal') +
    label(140, 246, 'Hydrogen chloride (HCl)', true) + hcl(140, 332) + label(140, 426, 'linear') +
    label(420, 246, 'Methane (CH₄)', true) + carbonCross(420, 332, { n: 'H', s: 'H', e: 'H', w: 'H' }) + label(420, 426, 'symmetric'));

  const FIG_CH4_CH3CL = svg(560, 220,
    'Lewis structures. Methane: four H atoms arranged around C. Chloromethane: the same arrangement, with the H on the right replaced by a Cl atom that has three lone pairs.',
    divider(280, 220) +
    label(140, 26, 'Methane (CH₄)', true) + carbonCross(140, 116, { n: 'H', s: 'H', e: 'H', w: 'H' }) +
    label(420, 26, 'Chloromethane (CH₃Cl)', true) + carbonCross(410, 116, { n: 'H', s: 'H', e: 'Cl', w: 'H' }));

  const FIG_H2_O2_BOX = svg(560, 220,
    'A box before the spark holding four H2 molecules, each two small H atoms joined, and two O2 molecules, each two larger O atoms joined.',
    `<rect x="20" y="16" width="380" height="188" rx="10" fill="none" stroke="${INK}" stroke-width="1.6"/>` +
    label(210, 40, 'Before the spark', true) +
    h2Particle(85, 90) + h2Particle(320, 85) + h2Particle(140, 160) + h2Particle(350, 160) + o2Particle(215, 100) + o2Particle(250, 165) +
    h2Particle(462, 80) + label(515, 85, '= H₂') + o2Particle(462, 140) + label(520, 145, '= O₂'));

  const PE_INFO = {
    id: 'HS-PS1-2',
    code: 'PS1-2',
    title: 'Chemical Reactions, Bonding & Conservation of Matter',
    unit: 'Units 1 & 2: Chemical Hygiene, Reactions & Stoichiometry',
    description: 'Construct and revise an explanation for the outcome of a simple chemical reaction based on the outermost electron states of atoms, trends in the periodic table, and knowledge of the patterns of chemical properties.',
    clarification: 'Examples of chemical reactions could include the reaction of sodium and chlorine, of carbon and oxygen, or of carbon and hydrogen.',
    assessmentBoundary: 'Assessment is limited to chemical reactions involving main group elements and combustion of simple hydrocarbons.'
  };

  const SKILLS = [
    {
      id: 'PS1-2.1',
      title: 'Bonding & Electronegativity',
      subtitle: 'Use ΔEN and element types to sort bonds as nonpolar covalent, polar covalent, ionic, or metallic.',
      watchOut: 'ΔEN tells you how unevenly two atoms pull on their electrons. Under 0.5, they share equally (nonpolar covalent). From 0.5 up to 1.7, they share unequally (polar covalent). At 1.7 or more, a metal hands its electrons to a nonmetal, and the two become ions. A common slip is calling every bond with chlorine ionic: HCl shares, KCl transfers.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-2.1_diag',
          skillId: 'PS1-2.1',
          level: 'Diagnostic',
          stem: 'Look at three solids: potassium chloride (KCl, ΔEN = 2.34), frozen hydrogen chloride (HCl, ΔEN = 0.96), and copper metal (Cu).',
          type: 'two_tier',
          tier1Prompt: 'Which solid is made of positive and negative ions held together by their opposite charges?',
          tier1Options: [
            'Potassium chloride (KCl) only.',
            'Hydrogen chloride (HCl) only.',
            'Copper metal (Cu) only.',
            'Both KCl and HCl, because both contain chlorine.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'A metal and a nonmetal with ΔEN above 1.7 transfer electrons, so the atoms become ions.',
            'Any compound with chlorine forms ions, because chlorine always pulls electrons off its partner.',
            'Potassium and chlorine share their electrons in a sea that flows through the whole solid.',
            'Two nonmetals with ΔEN near 1.0 share unequally, and unequal sharing always makes ions.'
          ],
          correctTier2: 0,
          hint: 'Check which atoms are metals. Then compare each ΔEN with the 1.7 cutoff.',
          workedSolution: 'Potassium is a metal and chlorine is a nonmetal. Their ΔEN is 2.34, above the 1.7 cutoff, so potassium gives an electron to chlorine. That makes K⁺ and Cl⁻ ions, and their opposite charges hold the solid together. HCl is two nonmetals with ΔEN = 0.96, so they share electrons unequally (polar covalent). Copper atoms share a sea of electrons (metallic).',
          givenSummary: 'KCl vs HCl vs Cu: which solid is ionic'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-2.1_diag2',
          skillId: 'PS1-2.1',
          level: 'Level 2 (Intermediate)',
          stem: 'Look at three substances: calcium chloride (CaCl₂, ΔEN = 2.16), ammonia (NH₃, N-H ΔEN = 0.84), and methane (CH₄, C-H ΔEN = 0.35).',
          type: 'two_tier',
          tier1Prompt: 'In which substance do the atoms share electrons unequally (polar covalent bonds)?',
          tier1Options: [
            'Ammonia (NH₃) only.',
            'Methane (CH₄) only.',
            'Calcium chloride (CaCl₂) only.',
            'Both NH₃ and CH₄, because both are made of nonmetals.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Two nonmetals with ΔEN between 0.5 and 1.7 share electrons, but one atom pulls harder.',
            'Any two different nonmetals share unequally, because no two different atoms pull the same.',
            'A metal and a nonmetal with ΔEN above 1.7 share unequally, because the metal pulls weakly.',
            'Nitrogen has a lone pair, and a lone pair is what makes sharing unequal.'
          ],
          correctTier2: 0,
          hint: 'Sort out the metal first. Then compare each nonmetal ΔEN with the 0.5 cutoff.',
          workedSolution: 'Calcium is a metal and its ΔEN with chlorine is 2.16, above 1.7, so CaCl₂ is ionic. Ammonia and methane are both nonmetals sharing electrons. N-H has ΔEN = 0.84, between 0.5 and 1.7, so nitrogen pulls the shared pair harder: polar covalent. C-H has ΔEN = 0.35, under 0.5, so carbon and hydrogen share almost equally: nonpolar covalent.',
          givenSummary: 'CaCl₂ vs NH₃ vs CH₄: which bonds are polar covalent'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-2.1_L1',
            skillId: 'PS1-2.1',
            level: 'Level 1 (Routine)',
            stem: 'Sort each bond by its type. Use the element types and the ΔEN values given.',
            type: 'categorize',
            prompt: 'Choose the bond type for each bond:',
            categories: ['Nonpolar covalent', 'Polar covalent', 'Ionic', 'Metallic'],
            items: [
              { label: 'C-H bond in methane, CH₄ (ΔEN = 0.35)', correctCategoryIndex: 0 },
              { label: 'O-H bond in water, H₂O (ΔEN = 1.24)', correctCategoryIndex: 1 },
              { label: 'Mg-O bond in magnesium oxide, MgO (ΔEN = 2.13)', correctCategoryIndex: 2 },
              { label: 'Fe-Fe bonds in a solid iron nail', correctCategoryIndex: 3 }
            ],
            hint: 'Under 0.5 is nonpolar covalent. From 0.5 to 1.7 is polar covalent. A metal and a nonmetal at 1.7 or more is ionic. Metal bonded to metal is metallic.',
            workedSolution: 'C-H (0.35) is under 0.5, so the atoms share equally: nonpolar covalent. O-H (1.24) sits between 0.5 and 1.7, so oxygen pulls harder: polar covalent. Mg-O (2.13) is a metal and a nonmetal above 1.7: ionic. Fe-Fe is metal bonded to metal, sharing a sea of electrons: metallic.',
            givenSummary: 'Bond sorting (C-H, O-H, Mg-O, Fe-Fe)'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-2.1_L2',
            skillId: 'PS1-2.1',
            level: 'Level 2 (Application)',
            stem: 'Magnesium (Group 2) reacts with fluorine (Group 17). Which answer gives the right formula and bond type?',
            type: 'mcq',
            options: [
              'MgF₂, ionic: Mg gives away two electrons, one to each of two F atoms.',
              'MgF, ionic: one Mg atom gives all of its outer electrons to one F atom.',
              'MgF₂, polar covalent: Mg and F share electrons, and F pulls on them harder.',
              'Mg₂F, ionic: two Mg atoms each give one electron to the same F atom.'
            ],
            correctIndex: 0,
            hint: 'Group 2 atoms lose two electrons. Group 17 atoms gain one. How many F atoms does one Mg need?',
            workedSolution: 'Magnesium is in Group 2, so it loses two electrons and becomes Mg²⁺. Fluorine is in Group 17, so it gains one electron and becomes F⁻. One Mg²⁺ needs two F⁻ to balance the charge, which gives MgF₂. A metal handing electrons to a nonmetal (ΔEN = 2.67) is ionic bonding.',
            givenSummary: 'Magnesium and fluorine: formula and bond type'
          };
        }
      ]
    },
    {
      id: 'PS1-2.2',
      title: 'Molecular Polarity',
      subtitle: 'Use bond polarity and molecular shape to decide whether a molecule is polar overall.',
      watchOut: 'Here is the trap: "the bonds are polar, so the molecule is polar." Not always. When the shape is symmetric and every outer atom is the same, the pulls cancel. Swap one outer atom for a different one, and they stop canceling.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-2.2_diag',
          skillId: 'PS1-2.2',
          level: 'Diagnostic',
          stem: 'The figure shows carbon dioxide (CO₂) and water (H₂O). Both have polar bonds: C=O has ΔEN = 0.89, and O-H has ΔEN = 1.24.',
          figure: FIG_CO2_H2O,
          type: 'two_tier',
          tier1Prompt: 'Which molecule is polar overall?',
          tier1Options: [
            'Water is polar overall. Carbon dioxide is nonpolar overall.',
            'Carbon dioxide is polar overall. Water is nonpolar overall.',
            'Both are polar overall, because both have polar bonds.',
            'Neither is polar overall, because both have three atoms.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'In linear CO₂, the two pulls point in opposite directions and cancel. In bent H₂O, both lean toward oxygen.',
            'O-H bonds have a bigger ΔEN than C=O bonds, so only water has bonds strong enough to be polar.',
            'A molecule with the same atom on both ends always cancels its pulls, whatever its shape is.',
            'The lone pairs on oxygen cancel the bond pulls in water, and CO₂ has no lone pairs to do that.'
          ],
          correctTier2: 0,
          hint: 'Look at the shapes in the figure. Does each bond pull have an equal partner pointing the opposite way?',
          workedSolution: 'Both molecules have polar bonds, so the shape decides. CO₂ is linear. Its two C=O pulls are equal and point in opposite directions, so they cancel and CO₂ is nonpolar. H₂O is bent. Both O-H pulls lean toward oxygen, so they add up instead of canceling. Water is polar.',
          givenSummary: 'CO₂ vs H₂O: shape and polarity'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-2.2_diag2',
          skillId: 'PS1-2.2',
          level: 'Level 2 (Intermediate)',
          stem: 'Carbon tetrafluoride (CF₄) is tetrahedral, with four F atoms around carbon (C-F ΔEN = 1.43). Nitrogen trifluoride (NF₃) is pyramidal, with three F atoms and a lone pair on nitrogen (N-F ΔEN = 0.94).',
          type: 'two_tier',
          tier1Prompt: 'Which molecule is polar overall?',
          tier1Options: [
            'NF₃ is polar overall. CF₄ is nonpolar overall.',
            'CF₄ is polar overall. NF₃ is nonpolar overall.',
            'Both are polar overall, because both have polar bonds to fluorine.',
            'Neither is polar overall, because fluorine pulls the same way in both.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'In CF₄, four equal pulls point to the corners of a tetrahedron and cancel. NF₃\'s three pulls all lean one way.',
            'C-F bonds have a bigger ΔEN than N-F bonds, so CF₄ must be the more polar molecule.',
            'Fluorine is the outer atom in both, so the shape cannot change whether they are polar.',
            'The lone pair on nitrogen cancels the three bond pulls, and CF₄ has no lone pair to do that.'
          ],
          correctTier2: 0,
          hint: 'Both molecules have polar bonds, so the shape decides. Does each pull have partners that cancel it?',
          workedSolution: 'Here is the trap: CF₄ has the more polar bonds, yet it is the nonpolar molecule. Its four equal C-F pulls point to the corners of a tetrahedron, so they cancel. NF₃ is a pyramid. All three N-F pulls lean toward the same side, so they add up instead of canceling. NF₃ is polar.',
          givenSummary: 'CF₄ vs NF₃: shape and polarity'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-2.2_L1',
            skillId: 'PS1-2.2',
            level: 'Level 1 (Routine)',
            stem: 'The figure shows four molecules. Judge each bond first, then use the shape to decide.',
            figure: FIG_FOUR_MOLECULES,
            type: 'multi_select',
            prompt: 'Select every molecule that is polar overall (2 correct):',
            options: [
              'Carbon tetrachloride, CCl₄ (C-Cl: ΔEN = 0.61)',
              'Ammonia, NH₃ (N-H: ΔEN = 0.84)',
              'Hydrogen chloride, HCl (H-Cl: ΔEN = 0.96)',
              'Methane, CH₄ (C-H: ΔEN = 0.35)'
            ],
            correctIndices: [1, 2],
            hint: 'Polar bonds are not enough on their own. Check whether the shape lets the pulls cancel.',
            workedSolution: 'Methane has nonpolar bonds (0.35), so it is nonpolar. CCl₄ has polar bonds, but four identical Cl atoms sit symmetrically around carbon. The four pulls cancel, so CCl₄ is nonpolar. HCl has one polar bond and nothing to cancel it, so it is polar. NH₃ is pyramidal: all three N-H pulls lean toward nitrogen, so it is polar.',
            givenSummary: 'Polar or nonpolar: CCl₄, NH₃, HCl, CH₄'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-2.2_L2',
            skillId: 'PS1-2.2',
            level: 'Level 2 (Application)',
            stem: 'Chloromethane (CH₃Cl) has the same shape as methane, with one H swapped for Cl. A student says CH₃Cl must be nonpolar, just like methane. Is the student right?',
            figure: FIG_CH4_CH3CL,
            type: 'mcq',
            options: [
              'No. The polar C-Cl pull has no equal partner on the other side, so nothing cancels it.',
              'Yes. Both molecules have the same symmetric shape, so their bond pulls cancel the same way.',
              'Yes. One polar bond out of four is too few to make the whole molecule polar.',
              'No. Swapping in a chlorine atom changes the shape from symmetric to pyramidal.'
            ],
            correctIndex: 0,
            hint: 'In methane, every pull has a matching partner. Which pull in CH₃Cl has no match?',
            workedSolution: 'Methane has four equal C-H pulls that cancel, and they are nonpolar anyway (ΔEN = 0.35). In CH₃Cl, the C-Cl bond is polar (ΔEN = 0.61), but the C-H bonds are not. Nothing matches the C-Cl pull, so it does not cancel, and CH₃Cl is polar. The shape stayed the same. The outer atoms did not.',
            givenSummary: 'CH₄ vs CH₃Cl: same shape, different polarity'
          };
        }
      ]
    },
    {
      id: 'PS1-2.3',
      title: 'Chemical Nomenclature & Formulas',
      subtitle: 'Name ionic and covalent compounds, and write formulas that balance charge, including polyatomic ions.',
      watchOut: 'Prefixes like mono-, di-, and tri- belong to covalent compounds made of two nonmetals. Ionic compounds never get them. A common slip is "dicopper oxide" for Cu₂O. When a metal can form more than one charge, write its charge as a Roman numeral: copper(I) oxide.',
      diagnostic: function(rng) {
        // Metal oxides whose metal can form more than one charge (lesson 1-2c teaches iron and copper).
        const v = pick(rng, [
          { formula: 'Fe₂O₃', intro: 'Rust is mostly an iron oxide with the formula Fe₂O₃.', metal: 'iron',
            options: ['Iron(III) oxide', 'Iron(II) oxide', 'Diiron trioxide', 'Iron trioxide'],
            hint: 'Each oxide ion is O²⁻, so three of them carry 6- in total. What charge must each of the two iron ions carry?',
            workedSolution: 'Each oxide ion is O²⁻, so three oxide ions carry a total charge of 6-. The two iron ions must carry 6+ to balance it, so each iron ion is Fe³⁺. Iron can form more than one charge, so the name shows it as a Roman numeral: iron(III) oxide. Ionic names never use prefixes like di- or tri-.',
            name: 'iron(III) oxide' },
          { formula: 'Cu₂O', intro: 'Some boat paints contain a red copper oxide with the formula Cu₂O.', metal: 'copper',
            options: ['Copper(I) oxide', 'Copper(II) oxide', 'Dicopper oxide', 'Copper monoxide'],
            hint: 'Each oxide ion is O²⁻. The two copper ions share the job of balancing that 2- charge. What charge does each one carry?',
            workedSolution: 'The single oxide ion is O²⁻, so it carries a charge of 2-. The two copper ions must carry 2+ together, so each copper ion is Cu⁺. Copper can form more than one charge, so the name shows it as a Roman numeral: copper(I) oxide. A common slip is "dicopper oxide," but ionic names never use prefixes.',
            name: 'copper(I) oxide' },
          { formula: 'CuO', intro: 'Heating copper wire in air coats it with a black copper oxide with the formula CuO.', metal: 'copper',
            options: ['Copper(II) oxide', 'Copper(I) oxide', 'Copper monoxide', 'Copper oxygen'],
            hint: 'Each oxide ion is O²⁻. What charge must one copper ion carry to balance one oxide ion?',
            workedSolution: 'The single oxide ion is O²⁻, so it carries a charge of 2-. One copper ion must carry 2+ to balance it, so the copper ion is Cu²⁺. Copper can form more than one charge, so the name shows it as a Roman numeral: copper(II) oxide. "Copper monoxide" uses a prefix, which belongs only to compounds of two nonmetals.',
            name: 'copper(II) oxide' }
        ]);
        return {
          id: 'PS1-2.3_diag',
          skillId: 'PS1-2.3',
          level: 'Diagnostic',
          stem: v.intro,
          type: 'two_tier',
          tier1Prompt: `What is the correct name for ${v.formula}?`,
          tier1Options: v.options,
          correctTier1: 0,
          tier2Prompt: 'What does the Roman numeral in the name tell you?',
          tier2Options: [
            `The charge on each ${v.metal} ion, which balances the charge of the oxide ions.`,
            `The number of ${v.metal} ions that appear in the formula for the compound.`,
            `The number of oxide ions bonded to each single ${v.metal} ion.`,
            `The group number where ${v.metal} sits on the periodic table.`
          ],
          correctTier2: 0,
          hint: v.hint,
          workedSolution: v.workedSolution,
          givenSummary: `Naming ${v.formula}: ${v.name}`
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        // Metal chlorides; kept apart from the oxides above so the second item is new to the student.
        const v = pick(rng, [
          { formula: 'CuCl₂', intro: 'Copper forms a blue-green compound with chloride ions. Its formula is CuCl₂.', Metal: 'Copper',
            options: ['Copper(II) chloride', 'Copper(I) chloride', 'Copper dichloride', 'Copper chlorine'], prefix: 'di',
            hint: 'Each chloride ion is Cl⁻. What charge does one copper ion need to balance two of them?',
            workedSolution: 'Each chloride ion is Cl⁻, so two of them carry 2-. One copper ion must carry 2+ to balance them, so it is Cu²⁺. Copper can also form Cu⁺, so the name states the charge as a Roman numeral: copper(II) chloride. A common slip is "copper dichloride," but prefixes belong only to compounds of two nonmetals.',
            name: 'copper(II) chloride' },
          { formula: 'FeCl₃', intro: 'Circuit-board makers etch copper with a brown iron compound. Its formula is FeCl₃.', Metal: 'Iron',
            options: ['Iron(III) chloride', 'Iron(II) chloride', 'Iron trichloride', 'Iron chlorine'], prefix: 'tri',
            hint: 'Each chloride ion is Cl⁻. What charge does one iron ion need to balance three of them?',
            workedSolution: 'Each chloride ion is Cl⁻, so three of them carry 3-. One iron ion must carry 3+ to balance them, so it is Fe³⁺. Iron can also form Fe²⁺, so the name states the charge as a Roman numeral: iron(III) chloride. Here the numeral matches the number of chloride ions only because each one carries 1-. A common slip is "iron trichloride," but prefixes belong only to compounds of two nonmetals.',
            name: 'iron(III) chloride' },
          { formula: 'FeCl₂', intro: 'Iron forms a pale green compound with chloride ions. Its formula is FeCl₂.', Metal: 'Iron',
            options: ['Iron(II) chloride', 'Iron(III) chloride', 'Iron dichloride', 'Iron chlorine'], prefix: 'di',
            hint: 'Each chloride ion is Cl⁻. What charge does one iron ion need to balance two of them?',
            workedSolution: 'Each chloride ion is Cl⁻, so two of them carry 2-. One iron ion must carry 2+ to balance them, so it is Fe²⁺. Iron can also form Fe³⁺, so the name states the charge as a Roman numeral: iron(II) chloride. A common slip is "iron dichloride," but prefixes belong only to compounds of two nonmetals.',
            name: 'iron(II) chloride' }
        ]);
        return {
          id: 'PS1-2.3_diag2',
          skillId: 'PS1-2.3',
          level: 'Level 2 (Intermediate)',
          stem: v.intro,
          type: 'two_tier',
          tier1Prompt: `What is the correct name for ${v.formula}?`,
          tier1Options: v.options,
          correctTier1: 0,
          tier2Prompt: 'Why does the name use a Roman numeral and no prefix?',
          tier2Options: [
            `${v.Metal} can form more than one charge, and ionic names never use prefixes like ${v.prefix}-.`,
            'The Roman numeral counts the chloride ions, and prefixes are only for oxygen compounds.',
            `${v.Metal} shares electrons with chlorine, so the name needs a number for the bonds.`,
            'Every metal ion name needs a Roman numeral to show its group number.'
          ],
          correctTier2: 0,
          hint: v.hint,
          workedSolution: v.workedSolution,
          givenSummary: `Naming ${v.formula}: ${v.name}`
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-2.3_L1',
            skillId: 'PS1-2.3',
            level: 'Level 1 (Routine)',
            stem: 'Match each compound name to its formula.',
            type: 'categorize',
            prompt: 'Choose the formula for each name:',
            categories: ['Na₂SO₄', 'CuCl₂', 'CS₂', 'NH₄NO₃'],
            items: [
              { label: 'Sodium sulfate', correctCategoryIndex: 0 },
              { label: 'Copper(II) chloride', correctCategoryIndex: 1 },
              { label: 'Carbon disulfide', correctCategoryIndex: 2 },
              { label: 'Ammonium nitrate', correctCategoryIndex: 3 }
            ],
            hint: 'Sodium is Na⁺ and sulfate is SO₄²⁻. Copper(II) is Cu²⁺. Carbon disulfide is two nonmetals, so the prefix di- counts the S atoms. Ammonium is NH₄⁺ and nitrate is NO₃⁻.',
            workedSolution: 'Two Na⁺ balance one SO₄²⁻, giving Na₂SO₄. One Cu²⁺ needs two Cl⁻, giving CuCl₂. Carbon disulfide is covalent, and di- means two S atoms: CS₂. One NH₄⁺ balances one NO₃⁻, giving NH₄NO₃.',
            givenSummary: 'Name-to-formula match (Na₂SO₄, CuCl₂, CS₂, NH₄NO₃)'
          };
        },
        function level2(rng) {
          // Options: the right formula, a missing-parentheses or unbalanced slip, a no-balance slip,
          // and the monatomic look-alike (a different compound).
          const v = pick(rng, [
            { stem: 'Water treatment plants use aluminum sulfate to clean drinking water. It contains Al³⁺ ions and sulfate ions (SO₄²⁻). What is its formula?',
              options: ['Al₂(SO₄)₃', 'AlSO₄', 'Al₃(SO₄)₂', 'Al₂S₃'],
              hint: 'Find the smallest total charge that both 3 and 2 divide into. How many of each ion gets you there?',
              workedSolution: 'Aluminum ions are Al³⁺ and sulfate ions are SO₄²⁻. The smallest number that both 3 and 2 go into is 6. Two Al³⁺ give 6+, and three SO₄²⁻ give 6-. Sulfate gets parentheses because there are three of them: Al₂(SO₄)₃. Al₂S₃ is aluminum sulfide, a different compound with no oxygen.',
              givenSummary: 'Aluminum sulfate Al₂(SO₄)₃ charge balance' },
            { stem: 'Farmers spread calcium nitrate on fields as a fertilizer. It contains Ca²⁺ ions and nitrate ions (NO₃⁻). What is its formula?',
              options: ['Ca(NO₃)₂', 'CaNO₃', 'Ca₂NO₃', 'Ca₃N₂'],
              hint: 'One Ca²⁺ ion carries 2+. How many NO₃⁻ ions does it take to carry 2-?',
              workedSolution: 'Calcium ions are Ca²⁺ and nitrate ions are NO₃⁻. One Ca²⁺ gives 2+, so it needs two NO₃⁻ to give 2-. Nitrate gets parentheses because there are two of them: Ca(NO₃)₂. Ca₃N₂ is calcium nitride, a different compound with no oxygen.',
              givenSummary: 'Calcium nitrate Ca(NO₃)₂ charge balance' },
            { stem: 'Some antacid tablets contain aluminum hydroxide. It contains Al³⁺ ions and hydroxide ions (OH⁻). What is its formula?',
              options: ['Al(OH)₃', 'AlOH₃', 'AlOH', 'Al₂O₃'],
              hint: 'One Al³⁺ ion carries 3+. How many OH⁻ ions does it take to carry 3-, and where do the parentheses go?',
              workedSolution: 'Aluminum ions are Al³⁺ and hydroxide ions are OH⁻. One Al³⁺ gives 3+, so it needs three OH⁻ to give 3-. Hydroxide gets parentheses because there are three of them: Al(OH)₃. Without them, AlOH₃ would mean one O and three H atoms. Al₂O₃ is aluminum oxide, a different compound with no hydrogen.',
              givenSummary: 'Aluminum hydroxide Al(OH)₃ charge balance' },
            { stem: 'Milk of magnesia, used for upset stomachs, is magnesium hydroxide. It contains Mg²⁺ ions and hydroxide ions (OH⁻). What is its formula?',
              options: ['Mg(OH)₂', 'MgOH₂', 'MgOH', 'MgO'],
              hint: 'One Mg²⁺ ion carries 2+. How many OH⁻ ions does it take to carry 2-, and where do the parentheses go?',
              workedSolution: 'Magnesium ions are Mg²⁺ and hydroxide ions are OH⁻. One Mg²⁺ gives 2+, so it needs two OH⁻ to give 2-. Hydroxide gets parentheses because there are two of them: Mg(OH)₂. Without them, MgOH₂ would mean one O and two H atoms. MgO is magnesium oxide, a different compound with no hydrogen.',
              givenSummary: 'Magnesium hydroxide Mg(OH)₂ charge balance' }
          ]);
          return {
            id: 'PS1-2.3_L2',
            skillId: 'PS1-2.3',
            level: 'Level 2 (Application)',
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
      id: 'PS1-2.4',
      title: 'Physical vs. Chemical Change',
      subtitle: 'Tell physical changes from chemical reactions using particle models and evidence.',
      watchOut: 'Melting, boiling, and dissolving are physical changes. The molecules move apart, but every bond inside them stays whole. A chemical reaction breaks bonds and makes new ones, so new substances form. The trap is thinking that any change that needs energy must be chemical.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-2.4_diag',
          skillId: 'PS1-2.4',
          level: 'Diagnostic',
          stem: 'You boil water at 100 °C, and it turns to steam. In a second container, you pass an electric current through water. Hydrogen gas and oxygen gas bubble out.',
          type: 'two_tier',
          tier1Prompt: 'Which kind of change is each one?',
          tier1Options: [
            'Boiling is a physical change. Splitting water with a current is a chemical change.',
            'Both are chemical changes, because both need energy added to happen.',
            'Both are physical changes, because water is the starting substance in both.',
            'Boiling is a chemical change. Splitting water with a current is a physical change.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Boiling pulls whole water molecules away from each other. The current breaks bonds inside the molecules, making new substances.',
            'Boiling breaks the bonds inside water molecules. The current only pulls whole molecules away from each other.',
            'Boiling makes a gas, and making a gas always means that a new substance has formed.',
            'Steam is a different substance from liquid water, because it has different properties.'
          ],
          correctTier2: 0,
          hint: 'Look at what comes out. Steam is still H₂O. What about hydrogen gas and oxygen gas?',
          workedSolution: 'Boiling is physical. Heat lets water molecules break away from each other, but each H₂O stays whole, so steam is still water. The current is chemical. It breaks the O-H bonds inside water molecules, and the atoms regroup as H₂ and O₂. Those are new substances.',
          givenSummary: 'Boiling vs splitting water: physical or chemical'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-2.4_diag2',
          skillId: 'PS1-2.4',
          level: 'Level 2 (Intermediate)',
          stem: 'You light a candle. Wax near the wick melts into a liquid pool. At the flame, wax vapor burns and makes carbon dioxide and water.',
          type: 'two_tier',
          tier1Prompt: 'Which kind of change is each one?',
          tier1Options: [
            'Melting wax is a physical change. Burning wax is a chemical change.',
            'Both are chemical changes, because both need heat from the flame.',
            'Both are physical changes, because wax is the starting substance in both.',
            'Melting wax is a chemical change. Burning wax is a physical change.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Melting lets whole wax molecules slide past each other. Burning breaks their bonds and makes CO₂ and H₂O.',
            'Melted wax looks and feels different from solid wax, so it has become a new substance.',
            'Burning only turns the wax into a gas, so the wax molecules stay whole in the flame.',
            'Any change that needs energy from a flame must break bonds and make a new substance.'
          ],
          correctTier2: 0,
          hint: 'Ask what the wax becomes. Is liquid wax still wax? Are CO₂ and H₂O still wax?',
          workedSolution: 'Melting is physical. Heat lets wax molecules slide past each other, but each molecule stays whole, so liquid wax is still wax. Burning is chemical. Wax molecules react with O₂, their bonds break, and the atoms regroup as CO₂ and H₂O. Both changes need heat, so energy alone does not tell you which kind of change happened.',
          givenSummary: 'Melting vs burning candle wax: physical or chemical'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-2.4_L1',
            skillId: 'PS1-2.4',
            level: 'Level 1 (Routine)',
            stem: 'Sort each change as physical or chemical.',
            type: 'categorize',
            prompt: 'Choose the type of change for each one:',
            categories: ['Physical change', 'Chemical change'],
            items: [
              { label: 'Dry ice (solid CO₂) turning straight into CO₂ gas', correctCategoryIndex: 0 },
              { label: 'An iron nail rusting in damp air', correctCategoryIndex: 1 },
              { label: 'Table sugar dissolving in warm water', correctCategoryIndex: 0 },
              { label: 'Baking soda and vinegar fizzing while the cup gets colder', correctCategoryIndex: 1 }
            ],
            hint: 'Ask one question: did a new substance with a new formula form? If the molecules stay the same, the change is physical.',
            workedSolution: 'Dry ice turning to gas and sugar dissolving are physical: CO₂ is still CO₂, and sugar is still sugar. Rust is a new substance (iron oxide), so rusting is chemical. Baking soda and vinegar make a new gas, CO₂, and the temperature drops, so that change is chemical too.',
            givenSummary: 'Physical vs chemical change sorting'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-2.4_L2',
            skillId: 'PS1-2.4',
            level: 'Level 2 (Application)',
            stem: 'The box holds 4 H₂ molecules and 2 O₂ molecules. A spark makes them react: 2 H₂ + O₂ -> 2 H₂O. What is in the box afterward?',
            figure: FIG_H2_O2_BOX,
            type: 'mcq',
            options: [
              '4 molecules of H₂O, with no H₂ or O₂ left over.',
              '2 molecules of H₂O, with 2 molecules of H₂ left over.',
              '6 molecules of H₂O, one for each starting molecule.',
              '2 molecules of H₂O, because some atoms turn into energy.'
            ],
            correctIndex: 0,
            hint: 'Count the atoms in the box. How many H atoms and how many O atoms are there? Each H₂O needs 2 H and 1 O.',
            workedSolution: 'The box holds 8 H atoms (4 × 2) and 4 O atoms (2 × 2). Each water molecule uses 2 H and 1 O. Eight H and four O make exactly 4 H₂O, with nothing left over. The atoms rearrange, but none appear or disappear, so the total mass stays the same.',
            givenSummary: 'Hydrogen and oxygen: counting particles after the spark'
          };
        }
      ]
    },
    {
      id: 'PS1-2.5',
      title: 'Chemical Reaction Types',
      subtitle: 'Sort reactions as synthesis, decomposition, single replacement, double replacement, or combustion.',
      watchOut: 'Read the pattern, not the substances. Synthesis: two or more reactants make one product. Decomposition: one reactant breaks apart. Single replacement: a lone element swaps into a compound. Double replacement: two compounds swap partners. Combustion: a fuel burns in O₂ to make CO₂ and H₂O. The trap is calling any reaction with O₂ combustion: Mg + O₂ is synthesis.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-2.5_diag',
          skillId: 'PS1-2.5',
          level: 'Diagnostic',
          stem: 'Sort each balanced equation by reaction type.',
          type: 'categorize',
          prompt: 'Choose the reaction type for each equation:',
          categories: ['Synthesis', 'Decomposition', 'Single Replacement', 'Combustion'],
          items: [
            { label: '2 Mg(s) + O₂(g) -> 2 MgO(s)', correctCategoryIndex: 0 },
            { label: '2 KClO₃(s) -> 2 KCl(s) + 3 O₂(g)', correctCategoryIndex: 1 },
            { label: 'Zn(s) + 2 HCl(aq) -> ZnCl₂(aq) + H₂(g)', correctCategoryIndex: 2 },
            { label: 'CH₄(g) + 2 O₂(g) -> CO₂(g) + 2 H₂O(g)', correctCategoryIndex: 3 }
          ],
          hint: 'Count the reactants and the products. One product means synthesis. One reactant means decomposition. A fuel that burns into CO₂ and H₂O means combustion.',
          workedSolution: 'Mg + O₂ -> MgO is synthesis: two reactants make one product. KClO₃ -> KCl + O₂ is decomposition: one reactant breaks apart. In Zn + HCl, zinc swaps in for hydrogen: single replacement. CH₄ burns in O₂ to make CO₂ and H₂O: combustion.',
          givenSummary: 'Sorting four reaction types'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-2.5_diag2',
          skillId: 'PS1-2.5',
          level: 'Level 2 (Intermediate)',
          stem: 'Sort each balanced equation by reaction type.',
          type: 'categorize',
          prompt: 'Choose the reaction type for each equation:',
          categories: ['Synthesis', 'Decomposition', 'Single Replacement', 'Combustion'],
          items: [
            { label: '2 H₂O₂(aq) -> 2 H₂O(l) + O₂(g)', correctCategoryIndex: 1 },
            { label: '4 Al(s) + 3 O₂(g) -> 2 Al₂O₃(s)', correctCategoryIndex: 0 },
            { label: '2 C₂H₆(g) + 7 O₂(g) -> 4 CO₂(g) + 6 H₂O(g)', correctCategoryIndex: 3 },
            { label: 'Mg(s) + CuSO₄(aq) -> MgSO₄(aq) + Cu(s)', correctCategoryIndex: 2 }
          ],
          hint: 'O₂ appears in more than one equation. A metal plus O₂ making one product is not combustion.',
          workedSolution: 'H₂O₂ -> H₂O + O₂ is decomposition: one reactant breaks apart. Al + O₂ -> Al₂O₃ is synthesis, even though it uses O₂, because two reactants make one product. Ethane (C₂H₆) burns in O₂ to make CO₂ and H₂O: combustion. In Mg + CuSO₄, magnesium swaps in for copper: single replacement.',
          givenSummary: 'Sorting four reaction types (set 2)'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-2.5_L1',
            skillId: 'PS1-2.5',
            level: 'Level 1 (Routine)',
            stem: 'You put a copper strip into silver nitrate solution (AgNO₃). Silver crystals grow on the strip, and the solution turns blue from Cu²⁺ ions. Which balanced equation matches?',
            type: 'mcq',
            options: [
              'Cu(s) + 2 AgNO₃(aq) -> Cu(NO₃)₂(aq) + 2 Ag(s)',
              'Cu(s) + AgNO₃(aq) -> CuAg(s) + NO₃(aq)',
              'Cu(s) + 2 Ag(s) -> CuAg₂(s)',
              'CuNO₃(aq) + Ag(s) -> Cu(s) + AgNO₃(aq)'
            ],
            correctIndex: 0,
            hint: 'Copper takes the place of silver in the compound. Cu²⁺ needs two NO₃⁻ ions to balance its charge.',
            workedSolution: 'Copper swaps in for silver, so this is single replacement. The blue color tells you the copper became Cu²⁺. One Cu²⁺ needs two NO₃⁻ ions, giving Cu(NO₃)₂. Two nitrate ions come from 2 AgNO₃, which frees 2 Ag: Cu(s) + 2 AgNO₃(aq) -> Cu(NO₃)₂(aq) + 2 Ag(s).',
            givenSummary: 'Copper and silver nitrate single replacement equation'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-2.5_L2',
            skillId: 'PS1-2.5',
            level: 'Level 2 (Application)',
            stem: 'You mix two clear solutions: lead(II) nitrate, Pb(NO₃)₂, and potassium iodide, KI. A yellow solid, lead(II) iodide, forms right away. What type of reaction is this, and what is the other product?',
            type: 'mcq',
            options: [
              'Double replacement. The other product is potassium nitrate (KNO₃), which stays dissolved.',
              'Single replacement. The other product is potassium metal (K), which sinks to the bottom.',
              'Decomposition. The other product is nitrogen dioxide gas (NO₂), which bubbles out.',
              'Synthesis. The other product is a lead and potassium solid (KPb), which settles out.'
            ],
            correctIndex: 0,
            hint: 'Two compounds trade partners. Pb²⁺ pairs up with I⁻. Which ion does K⁺ pair up with?',
            workedSolution: 'Two compounds trade partners, so this is double replacement: Pb(NO₃)₂(aq) + 2 KI(aq) -> PbI₂(s) + 2 KNO₃(aq). Pb²⁺ pairs with I⁻ to make the yellow solid. K⁺ pairs with NO₃⁻ to make potassium nitrate, which stays dissolved in the water.',
            givenSummary: 'Lead(II) nitrate and potassium iodide double replacement'
          };
        }
      ]
    },
    {
      id: 'PS1-2.6',
      title: 'Balancing Equations',
      subtitle: 'Balance equations by changing coefficients until every atom is counted on both sides.',
      watchOut: 'Never change a subscript to balance an equation. H₂O and H₂O₂ are different substances. Change only the coefficients, the whole numbers in front of each formula.',
      diagnostic: function(rng) {
        const A = pick(rng, [{ n: 3, name: 'Propane' }, { n: 7, name: 'Heptane' }]);
        const f = alkane(A.n), o2 = (3 * A.n + 1) / 2, oCO2 = 2 * A.n, oH2O = A.n + 1;
        return {
          id: 'PS1-2.6_diag',
          skillId: 'PS1-2.6',
          level: 'Level 2 (Intermediate)',
          stem: `${A.name} burns in oxygen: ${f} + ? O₂ -> ${A.n} CO₂ + ${A.n + 1} H₂O. What coefficient goes in front of O₂ to balance the equation?`,
          type: 'numeric',
          correctValue: o2,
          tolerance: 0,
          unit: 'O₂',
          hint: `Count the O atoms on the right side: ${A.n} CO₂ has ${oCO2}, and ${A.n + 1} H₂O has ${oH2O}. How many O₂ molecules give you that many?`,
          workedSolution: `Count the oxygen atoms on the right. ${A.n} CO₂ has ${A.n} x 2 = ${oCO2} O atoms, and ${A.n + 1} H₂O has ${A.n + 1} x 1 = ${oH2O}. That makes ${oCO2 + oH2O} O atoms. Each O₂ molecule brings 2, so you need ${oCO2 + oH2O} ÷ 2 = ${o2} O₂. Balanced: ${f} + ${o2} O₂ -> ${A.n} CO₂ + ${A.n + 1} H₂O.`,
          givenSummary: `${A.name} combustion: the O₂ coefficient`
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        const A = pick(rng, [{ n: 5, name: 'Pentane' }, { n: 9, name: 'Nonane' }]);
        const f = alkane(A.n), o2 = (3 * A.n + 1) / 2, oCO2 = 2 * A.n, oH2O = A.n + 1;
        return {
          id: 'PS1-2.6_diag2',
          skillId: 'PS1-2.6',
          level: 'Level 2 (Intermediate)',
          stem: `${A.name} burns in oxygen: ${f} + ? O₂ -> ${A.n} CO₂ + ${A.n + 1} H₂O. What coefficient goes in front of O₂ to balance the equation?`,
          type: 'numeric',
          correctValue: o2,
          tolerance: 0,
          unit: 'O₂',
          hint: `Count the O atoms on the right side: ${A.n} CO₂ has ${oCO2}, and ${A.n + 1} H₂O has ${oH2O}. How many O₂ molecules give you that many?`,
          workedSolution: `Count the oxygen atoms on the right. ${A.n} CO₂ has ${A.n} x 2 = ${oCO2} O atoms, and ${A.n + 1} H₂O has ${A.n + 1} x 1 = ${oH2O}. That makes ${oCO2 + oH2O} O atoms. Each O₂ molecule brings 2, so you need ${oCO2 + oH2O} ÷ 2 = ${o2} O₂. Balanced: ${f} + ${o2} O₂ -> ${A.n} CO₂ + ${A.n + 1} H₂O.`,
          givenSummary: `${A.name} combustion: the O₂ coefficient`
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-2.6_L1',
            skillId: 'PS1-2.6',
            level: 'Level 1 (Routine)',
            stem: 'Aluminum metal reacts with copper(II) chloride solution: ? Al + ? CuCl₂ -> ? AlCl₃ + ? Cu. Which coefficients balance the equation?',
            type: 'mcq',
            options: [
              '2, 3, 2, 3 (2 Al + 3 CuCl₂ -> 2 AlCl₃ + 3 Cu)',
              '1, 1, 1, 1 (Al + CuCl₂ -> AlCl₃ + Cu)',
              '2, 2, 2, 2 (2 Al + 2 CuCl₂ -> 2 AlCl₃ + 2 Cu)',
              '3, 2, 3, 2 (3 Al + 2 CuCl₂ -> 3 AlCl₃ + 2 Cu)'
            ],
            correctIndex: 0,
            hint: 'Start with chlorine. CuCl₂ has 2 Cl and AlCl₃ has 3 Cl. What is the smallest number that both 2 and 3 go into?',
            workedSolution: 'Start with chlorine. CuCl₂ carries 2 Cl and AlCl₃ carries 3 Cl, so aim for 6 Cl on each side: 3 CuCl₂ and 2 AlCl₃. Now 2 AlCl₃ needs 2 Al on the left, and 3 CuCl₂ gives 3 Cu on the right. Balanced: 2 Al + 3 CuCl₂ -> 2 AlCl₃ + 3 Cu.',
            givenSummary: 'Aluminum and copper(II) chloride coefficients'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-2.6_L2',
            skillId: 'PS1-2.6',
            level: 'Level 2 (Application)',
            stem: 'Each fuel below burns in oxygen. Balance each equation on paper with the smallest whole numbers, then compare the O₂ coefficients.',
            type: 'ranking',
            rankingPrompt: 'Rank from fewest O₂ molecules needed (1) to most (4):',
            items: [
              'H₂ + O₂ -> H₂O',
              'CH₄ + O₂ -> CO₂ + H₂O',
              'C₂H₄ + O₂ -> CO₂ + H₂O',
              'C₂H₆ + O₂ -> CO₂ + H₂O'
            ],
            correctOrder: [
              'H₂ + O₂ -> H₂O',
              'CH₄ + O₂ -> CO₂ + H₂O',
              'C₂H₄ + O₂ -> CO₂ + H₂O',
              'C₂H₆ + O₂ -> CO₂ + H₂O'
            ],
            hint: 'Balance C first, then H, and O last. If O comes out as a half, double every coefficient.',
            workedSolution: '2 H₂ + O₂ -> 2 H₂O needs 1 O₂. CH₄ + 2 O₂ -> CO₂ + 2 H₂O needs 2. C₂H₄ + 3 O₂ -> 2 CO₂ + 2 H₂O needs 3. C₂H₆ would need 3.5 O₂, so double everything: 2 C₂H₆ + 7 O₂ -> 4 CO₂ + 6 H₂O needs 7.',
            givenSummary: 'Fuel combustion: ranking O₂ coefficients'
          };
        }
      ]
    }
  ];

  window.PE_DATA_HS_PS1_2 = {
    info: PE_INFO,
    skills: SKILLS
  };
})();
