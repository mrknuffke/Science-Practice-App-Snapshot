/**
 * HS-PS1-3: Electrical Forces, Molecular Polarity & Intermolecular Forces
 * Items from Support Pack v.26-27 R2, rewritten (Oct 2026) to the Tier 3 register in
 * docs/textbook/VOICE.md and to the scope of lessons 1-2a, 1-2b and 1-3b: shapes are given
 * as fact (linear, bent, pyramidal, symmetric), with no VSEPR.
 * Items that ask a student to reason from a structure carry a `figure` built with ../pe-figures.js.
 * Zero em-dash compliant: hyphens, colons, and parentheses only.
 */
(function() {
  'use strict';

  // Calculation items pick their numbers per run (see ../pe-num.js).
  const { pick, fix } = window.PE_NUM;

  const { svg, label, divider, hDivider, nh3, carbonCross } = window.PE_FIGURES;

  const ALL_CL = { n: 'Cl', s: 'Cl', e: 'Cl', w: 'Cl' };
  const ALL_H = { n: 'H', s: 'H', e: 'H', w: 'H' };
  // CH₂Cl₂ is drawn with its two Cl atoms side by side. Drawn opposite each other, the flat
  // picture would suggest the pulls cancel, which they do not in the real molecule.
  const CH2CL2 = { n: 'Cl', s: 'H', e: 'Cl', w: 'H' };
  const CH3CL = { n: 'H', s: 'H', e: 'Cl', w: 'H' };

  const FIG_NH3_CCL4 = svg(560, 220,
    'Lewis structures. Ammonia: three H atoms below N, with one lone pair on N, pyramidal. Carbon tetrachloride: four Cl atoms arranged symmetrically around C.',
    divider(280, 220) +
    label(140, 26, 'Ammonia (NH₃)', true) + nh3(140, 112) + label(140, 206, 'pyramidal') +
    label(420, 26, 'Carbon tetrachloride (CCl₄)', true) + carbonCross(420, 112, ALL_CL) + label(420, 206, 'symmetric'));

  const FIG_FOUR_CARBON = svg(560, 440,
    'Lewis structures of four molecules, each with four atoms around one carbon. Carbon tetrachloride: four Cl. Dichloromethane: two Cl side by side and two H. Methane: four H. Chloromethane: one Cl and three H.',
    divider(280, 440) + hDivider(220, 560) +
    label(140, 26, 'Carbon tetrachloride (CCl₄)', true) + carbonCross(140, 116, ALL_CL) +
    label(420, 26, 'Dichloromethane (CH₂Cl₂)', true) + carbonCross(410, 116, CH2CL2) +
    label(140, 246, 'Methane (CH₄)', true) + carbonCross(140, 336, ALL_H) +
    label(420, 246, 'Chloromethane (CH₃Cl)', true) + carbonCross(410, 336, CH3CL));

  const FIG_CCL4 = svg(280, 220,
    'Lewis structure of carbon tetrachloride: four Cl atoms, each with three lone pairs, arranged symmetrically around C.',
    label(140, 26, 'Carbon tetrachloride (CCl₄)', true) + carbonCross(140, 112, ALL_CL) + label(140, 206, 'symmetric'));

  const FIG_CH2CL2 = svg(280, 220,
    'Lewis structure of dichloromethane: a carbon atom bonded to two H atoms and two Cl atoms. Every H is bonded to carbon.',
    label(140, 26, 'Dichloromethane (CH₂Cl₂)', true) + carbonCross(130, 116, CH2CL2));

  const FIG_NH3_CH4 = svg(560, 220,
    'Lewis structures. Ammonia: three H atoms below N, with one lone pair on N, pyramidal. Methane: four H atoms arranged symmetrically around C.',
    divider(280, 220) +
    label(140, 26, 'Ammonia (NH₃)', true) + nh3(140, 112) + label(140, 206, 'pyramidal') +
    label(420, 26, 'Methane (CH₄)', true) + carbonCross(420, 112, ALL_H) + label(420, 206, 'symmetric'));

  const PE_INFO = {
    id: 'HS-PS1-3',
    code: 'PS1-3',
    title: 'Electrical Forces & Intermolecular Forces',
    unit: 'Unit 1: Chemical Hygiene & Atomic Structure',
    description: 'Plan and conduct an investigation to gather evidence comparing substance structures at the bulk scale to infer the strength of electrical forces between particles.',
    clarification: 'Emphasis is on understanding relative forces between particles (intermolecular forces) based on molecular polarity, and predicting properties like boiling point and evaporation rate.',
    assessmentBoundary: 'Assessment is limited to main group covalent substances and simple comparisons of attraction strength (London dispersion, dipole-dipole, hydrogen bonding).'
  };

  const SKILLS = [
    {
      id: 'PS1-3.7',
      title: 'Molecular Polarity',
      subtitle: 'Use bond polarity and molecular shape to decide whether a molecule is polar or nonpolar.',
      watchOut: 'Here is the trap: "the bonds are polar, so the molecule is polar." Not always. When the shape is symmetric and every outer atom is the same, the pulls cancel. Check the bonds first, then the shape.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-3.7_diag',
          skillId: 'PS1-3.7',
          level: 'Level 2 (Intermediate)',
          stem: 'The figure shows ammonia (NH₃) and carbon tetrachloride (CCl₄). Both have polar bonds: N-H has ΔEN = 0.84, and C-Cl has ΔEN = 0.61.',
          figure: FIG_NH3_CCL4,
          type: 'two_tier',
          tier1Prompt: 'Which molecule is polar overall?',
          tier1Options: [
            'Ammonia is polar overall. CCl₄ is nonpolar overall.',
            'CCl₄ is polar overall. Ammonia is nonpolar overall.',
            'Both are polar overall, because both have polar bonds.',
            'Neither is polar overall, because both have a central atom.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why do the bond pulls cancel in one molecule but not the other?',
          tier2Options: [
            'In symmetric CCl₄, every pull has an equal partner opposite it. In pyramidal NH₃, all three pulls lean toward nitrogen.',
            'C-Cl bonds are less polar than N-H bonds, so only the N-H bonds are strong enough to make a polar molecule.',
            'CCl₄ has more atoms than NH₃, and a molecule with more atoms always spreads its charge out evenly.',
            'The lone pair on nitrogen cancels the three N-H pulls, so NH₃ ends up with no overall pull.'
          ],
          correctTier2: 0,
          hint: 'Look at the shapes in the figure. Does each bond pull have an equal partner pointing the opposite way?',
          workedSolution: 'Both molecules have polar bonds, so the shape decides. In CCl₄, four identical Cl atoms sit symmetrically around carbon. Every pull has an equal partner opposite it, so they cancel and CCl₄ is nonpolar. NH₃ is pyramidal. All three N-H pulls lean toward nitrogen, so they add up and NH₃ is polar.',
          givenSummary: 'NH₃ vs CCl₄: shape and polarity'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-3.7_diag2',
          skillId: 'PS1-3.7',
          level: 'Level 2 (Intermediate)',
          stem: 'Sulfur dioxide (SO₂) is bent, with a lone pair on sulfur (S-O ΔEN = 0.86). Carbon dioxide (CO₂) is linear (C=O ΔEN = 0.89).',
          type: 'two_tier',
          tier1Prompt: 'Which molecule is polar overall?',
          tier1Options: [
            'SO₂ is polar overall. CO₂ is nonpolar overall.',
            'CO₂ is polar overall. SO₂ is nonpolar overall.',
            'Both are polar overall, because both have polar bonds to oxygen.',
            'Neither is polar overall, because both have two oxygen atoms.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why do the bond pulls cancel in one molecule but not the other?',
          tier2Options: [
            'In linear CO₂, the two pulls point in opposite directions. In bent SO₂, both pulls lean to one side.',
            'C=O bonds are slightly more polar than S-O bonds, so only CO₂ has an overall pull.',
            'Any molecule with the same outer atom on both ends cancels its pulls, whatever its shape.',
            'The lone pair on sulfur cancels the two bond pulls, so SO₂ ends up with no overall pull.'
          ],
          correctTier2: 0,
          hint: 'The two ΔEN values are almost the same, so the bonds cannot explain a difference. What else differs?',
          workedSolution: 'Both molecules have two polar bonds to oxygen, with almost the same ΔEN. The shape decides. CO₂ is linear, so its two pulls point in opposite directions and cancel. SO₂ is bent, so both S-O pulls lean toward the same side and add up. SO₂ is polar and CO₂ is nonpolar.',
          givenSummary: 'SO₂ vs CO₂: shape and polarity'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-3.7_L1',
            skillId: 'PS1-3.7',
            level: 'Level 1 (Foundational)',
            stem: 'The figure shows four molecules, each with four atoms around one carbon. C-Cl bonds are polar (ΔEN = 0.61), and C-H bonds are nonpolar (ΔEN = 0.35). Sort each molecule.',
            figure: FIG_FOUR_CARBON,
            type: 'categorize',
            categories: [
              'Nonpolar (pulls cancel)',
              'Polar (pulls do not cancel)'
            ],
            items: [
              { label: 'Carbon tetrachloride (CCl₄)', correctCategoryIndex: 0 },
              { label: 'Dichloromethane (CH₂Cl₂)', correctCategoryIndex: 1 },
              { label: 'Methane (CH₄)', correctCategoryIndex: 0 },
              { label: 'Chloromethane (CH₃Cl)', correctCategoryIndex: 1 }
            ],
            hint: 'The pulls cancel only when all four outer atoms are the same. Count the Cl atoms in each molecule.',
            workedSolution: 'CCl₄ has four identical Cl atoms around carbon, so the four pulls cancel: nonpolar. CH₄ has nonpolar bonds to begin with: nonpolar. CH₂Cl₂ and CH₃Cl mix polar C-Cl bonds with nonpolar C-H bonds. The C-Cl pulls have no equal partners, so they do not cancel: both are polar.',
            givenSummary: 'Polar or nonpolar: four molecules built on carbon'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-3.7_L3',
            skillId: 'PS1-3.7',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Carbon tetrachloride (CCl₄) is nonpolar. Which change would make a molecule built on it polar?',
            figure: FIG_CCL4,
            type: 'mcq',
            options: [
              'Swap one Cl for an H atom, so one pull no longer has an equal partner.',
              'Swap every Cl for an F atom, so each bond pulls harder than C-Cl does.',
              'Swap the C for a Si atom, so the central atom pulls less on its electrons.',
              'Cool CCl₄ to a liquid, so its molecules sit closer and their pulls add up.'
            ],
            correctIndex: 0,
            hint: 'Making every bond more polar does not help if every pull still has an equal partner. What breaks the match?',
            workedSolution: 'CCl₄ is nonpolar because four equal pulls cancel. Making all four bonds stronger (F) or changing the central atom (Si) keeps four equal pulls, so they still cancel. Swapping one Cl for H leaves three C-Cl pulls with nothing to match them, so the molecule (CHCl₃) is polar. Cooling changes the state, not the molecule.',
            givenSummary: 'What change makes CCl₄ polar'
          };
        }
      ]
    },
    {
      id: 'PS1-3.1',
      title: 'Comparing Strength of Attraction',
      subtitle: 'Identify intermolecular forces (LDF, dipole-dipole, H-bonding) and predict boiling points and how fast liquids evaporate.',
      watchOut: 'Hydrogen bonding needs an H bonded directly to N, O, or F. Do not mix up the attractions between molecules with the covalent bonds inside one molecule. Boiling pulls neighboring molecules apart; it never breaks covalent bonds.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-3.1_diag',
          skillId: 'PS1-3.1',
          level: 'Level 2 (Intermediate)',
          stem: 'Substance X has strong attractions between its molecules. Substance Y has weak attractions between its molecules. Which statements are true? (Select ALL that apply)',
          type: 'multi_select',
          options: [
            'Substance X will have a higher boiling point than Substance Y.',
            'Substance X will evaporate more slowly than Substance Y at room temperature.',
            'Substance X will have a lower vapor pressure than Substance Y.',
            'Substance X will have stronger covalent bonds inside its molecules than Substance Y.',
            'Substance X will evaporate faster than Substance Y at room temperature.'
          ],
          correctIndices: [0, 1, 2],
          hint: 'Stronger attractions hold molecules together more tightly. Does that make it easier or harder for a molecule to escape into the air?',
          workedSolution: 'A, B, and C are correct. Stronger attractions take more energy to overcome, so X boils at a higher temperature, evaporates more slowly, and puts fewer molecules into the air above it (lower vapor pressure). D is wrong because attractions between molecules are not the covalent bonds inside them. E is wrong because stronger attractions slow evaporation.',
          givenSummary: 'Attraction strength vs boiling point, evaporation and vapor pressure'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-3.1_diag2',
          skillId: 'PS1-3.1',
          level: 'Level 2 (Intermediate)',
          stem: 'Liquid P boils at 35 °C. Liquid Q boils at 118 °C. Which statements are true? (Select ALL that apply)',
          type: 'multi_select',
          options: [
            'Liquid Q has stronger attractions between its molecules than Liquid P.',
            'Liquid P will evaporate faster than Liquid Q at room temperature.',
            'Liquid P will have a higher vapor pressure than Liquid Q.',
            'Boiling Liquid Q breaks more covalent bonds than boiling Liquid P.',
            'Liquid P has stronger attractions, because its molecules escape more easily.'
          ],
          correctIndices: [0, 1, 2],
          hint: 'A higher boiling point means it takes more energy to pull the molecules apart. What does that say about escaping at room temperature?',
          workedSolution: 'A, B, and C are correct. Q needs a higher temperature to boil, so its molecules attract each other more strongly. P\'s molecules escape more easily, so P evaporates faster and puts more molecules into the air above it (higher vapor pressure). D is wrong because boiling separates whole molecules and breaks no covalent bonds. E has the link backward: escaping easily means weaker attractions.',
          givenSummary: 'Boiling point vs attractions, evaporation and vapor pressure'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-3.1_L1',
            skillId: 'PS1-3.1',
            level: 'Level 1 (Foundational)',
            stem: 'Sort each liquid by the STRONGEST attraction between its molecules.',
            type: 'categorize',
            categories: [
              'London Dispersion Forces Only',
              'Dipole-Dipole Attractions',
              'Hydrogen Bonding'
            ],
            items: [
              { label: 'Propane (CH₃-CH₂-CH₃)', correctCategoryIndex: 0 },
              { label: 'Dimethyl ether (CH₃-O-CH₃)', correctCategoryIndex: 1 },
              { label: 'Methanol (CH₃-O-H)', correctCategoryIndex: 2 },
              { label: 'Water (H-O-H)', correctCategoryIndex: 2 }
            ],
            hint: 'Look for an H bonded directly to O. If the O is bonded only to carbon, the molecule is polar but cannot hydrogen bond. A molecule of only C and H has dispersion forces only.',
            workedSolution: 'Methanol and water both have an H bonded directly to O, so their strongest attraction is hydrogen bonding. Dimethyl ether has polar C-O bonds, but every H is on a carbon, so its strongest attraction is dipole-dipole. Propane is only C and H, so it is nonpolar with London dispersion forces only.',
            givenSummary: 'Strongest attraction between molecules for four liquids'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-3.1_L3',
            skillId: 'PS1-3.1',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Ethanol (C₂H₅OH) boils at 78 °C. What happens to the particles when it boils?',
            type: 'mcq',
            options: [
              'Whole ethanol molecules pull away from their neighbors and move into the gas, each one still intact.',
              'The O-H bond inside each ethanol molecule breaks, and hydrogen gas escapes into the air.',
              'The bond between the two carbon atoms breaks, and ethanol splits into smaller gas molecules.',
              'Each oxygen atom loses an electron, and the liquid turns into a gas made of charged ions.'
            ],
            correctIndex: 0,
            hint: 'Boiling is a physical change, not a chemical reaction. What happens to the covalent bonds inside one molecule?',
            workedSolution: 'Boiling is a physical change. Heat gives ethanol molecules enough energy to overcome the hydrogen bonds and other attractions between them. Each C₂H₅OH molecule leaves the liquid whole. The covalent bonds inside the molecule are not touched, so the gas is still ethanol.',
            givenSummary: 'What happens to the particles when ethanol boils'
          };
        }
      ]
    },
    {
      id: 'PS1-3.8',
      title: 'From Structure to Physical Properties',
      subtitle: 'Connect molecular structure to the properties you can observe: structure, polarity, attractions, then properties.',
      watchOut: 'Never jump straight from a formula to a boiling point. Follow the chain: shape, whether the pulls cancel, molecular polarity, the attraction between molecules, and then the property you can observe.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-3.8_diag',
          skillId: 'PS1-3.8',
          level: 'Level 2 (Intermediate)',
          stem: 'Put the five steps in order, from the structure of one molecule (1) to a property you can observe in the lab (5).',
          type: 'ranking',
          rankingPrompt: 'Order the steps from cause (1) to what you observe (5):',
          items: [
            'The shape of the molecule',
            'Whether the bond pulls cancel',
            'Whether the molecule is polar overall',
            'The attraction between molecules (LDF, dipole-dipole, or H-bond)',
            'A property you can measure (boiling point, evaporation time)'
          ],
          correctOrder: [
            'The shape of the molecule',
            'Whether the bond pulls cancel',
            'Whether the molecule is polar overall',
            'The attraction between molecules (LDF, dipole-dipole, or H-bond)',
            'A property you can measure (boiling point, evaporation time)'
          ],
          hint: 'Start with one molecule and work outward. Which step needs the one before it?',
          workedSolution: 'Each step depends on the one before it. The shape decides whether the bond pulls cancel. That decides whether the molecule is polar. Polarity decides which attractions the molecules can have. Those attractions decide the boiling point and how fast the liquid evaporates.',
          givenSummary: 'Ordering the chain from structure to property'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-3.8_diag2',
          skillId: 'PS1-3.8',
          level: 'Level 2 (Intermediate)',
          stem: 'Put these statements about water in order, from the structure of one molecule (1) to a property you can observe (5).',
          type: 'ranking',
          rankingPrompt: 'Order the statements from cause (1) to what you observe (5):',
          items: [
            'Water molecules attract each other with hydrogen bonds.',
            'Water is bent, with two O-H bonds and two lone pairs on oxygen.',
            'Water boils at 100 °C, far higher than methane at -162 °C.',
            'The two O-H pulls do not cancel each other.',
            'Water is polar overall.'
          ],
          correctOrder: [
            'Water is bent, with two O-H bonds and two lone pairs on oxygen.',
            'The two O-H pulls do not cancel each other.',
            'Water is polar overall.',
            'Water molecules attract each other with hydrogen bonds.',
            'Water boils at 100 °C, far higher than methane at -162 °C.'
          ],
          hint: 'Start with the shape of one molecule. Which statement needs the one before it to be true?',
          workedSolution: 'The bent shape comes first. Because of it, the two O-H pulls do not cancel, so water is polar. Its H atoms bond directly to oxygen, so water molecules hold each other with hydrogen bonds. Those strong attractions take more energy to overcome, so water boils at 100 °C.',
          givenSummary: 'Ordering the structure-to-property chain for water'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-3.8_L1',
            skillId: 'PS1-3.8',
            level: 'Level 1 (Foundational)',
            stem: 'A student says dichloromethane (CH₂Cl₂) must form hydrogen bonds, because it has polar bonds and H atoms. What is wrong with this reasoning?',
            figure: FIG_CH2CL2,
            type: 'mcq',
            options: [
              'Hydrogen bonding needs H bonded directly to N, O, or F. Here every H is bonded to carbon.',
              'Nothing is wrong. Any molecule with polar bonds and H atoms can form hydrogen bonds.',
              'Molecules that contain chlorine are always nonpolar, so CH₂Cl₂ has dispersion forces only.',
              'Hydrogen bonds form only in water, so no other liquid can ever have them.'
            ],
            correctIndex: 0,
            hint: 'Look at the figure. Which atom is each H bonded to?',
            workedSolution: 'Hydrogen bonding needs an H bonded directly to N, O, or F. In CH₂Cl₂, both H atoms are bonded to carbon. The molecule is polar, so it has dipole-dipole attractions, but it cannot form hydrogen bonds.',
            givenSummary: 'CH₂Cl₂: polar, but no hydrogen bonds'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-3.8_L3',
            skillId: 'PS1-3.8',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Ammonia (NH₃) boils at -33 °C and methane (CH₄) boils at -162 °C. Their molar masses are almost the same (17 and 16 g/mol). Compare their structures in the figure.',
            figure: FIG_NH3_CH4,
            type: 'two_tier',
            tier1Prompt: 'Which statement compares their attractions and boiling points correctly?',
            tier1Options: [
              'Ammonia has stronger attractions between its molecules, so it takes more energy to boil.',
              'Methane has stronger attractions, which lets it turn into a gas at a lower temperature.',
              'Both have the same attractions, because their molar masses are almost the same.',
              'Methane has stronger attractions, because carbon atoms hold neighbors more tightly.'
            ],
            correctTier1: 0,
            tier2Prompt: 'Which structural feature explains the difference?',
            tier2Options: [
              'NH₃ is pyramidal with N-H bonds, so it is polar and hydrogen bonds. CH₄ is symmetric and nonpolar, with dispersion forces only.',
              'NH₃ has stronger covalent bonds inside each molecule, and those bonds must break before it can boil.',
              'CH₄ has more H atoms than NH₃, and more H atoms always means weaker attractions.',
              'CH₄ has a larger electron cloud than NH₃, which stops any attraction between its molecules.'
            ],
            correctTier2: 0,
            hint: 'Follow the chain for each molecule: shape, polarity, then the attraction between molecules.',
            workedSolution: 'Ammonia boils 129 degrees higher, so its molecules hold onto each other more strongly. NH₃ is pyramidal: its polar N-H pulls lean toward nitrogen, so it is polar, and its H atoms are bonded to N, so it hydrogen bonds. CH₄ is symmetric with nonpolar bonds, so it has only weak London dispersion forces.',
            givenSummary: 'NH₃ vs CH₄: structure explains boiling point'
          };
        }
      ]
    },
    {
      id: 'PS1-3.2',
      title: 'Designing a Controlled Investigation',
      subtitle: 'Name the independent, dependent, and controlled variables, with a value and a method for each control.',
      watchOut: 'A controlled variable needs more than "keep it the same." Name the variable, give its value, and say how you keep it constant in every trial.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-3.2_diag',
          skillId: 'PS1-3.2',
          level: 'Level 2 (Intermediate)',
          stem: 'In a lab, you time how long four liquids take to evaporate, to compare the attractions between their molecules. Sort each variable.',
          type: 'categorize',
          categories: [
            'Independent Variable',
            'Dependent Variable',
            'Controlled Variable'
          ],
          items: [
            { label: 'Which liquid is tested (acetone, ethanol, and so on)', correctCategoryIndex: 0 },
            { label: 'Time for the drop to evaporate completely (in seconds)', correctCategoryIndex: 1 },
            { label: 'Volume of each drop (50 μL)', correctCategoryIndex: 2 },
            { label: 'Size and material of the dish (50 mm watch glass)', correctCategoryIndex: 2 }
          ],
          hint: 'The independent variable is what you change on purpose. The dependent variable is what you measure. Controlled variables stay the same in every trial.',
          workedSolution: 'You change which liquid you test, so that is the independent variable. You measure the evaporation time in seconds, so that is the dependent variable. Drop volume (50 μL) and the dish (50 mm watch glass) stay the same in every trial, so they are controlled variables.',
          givenSummary: 'Evaporation lab variable sorting'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-3.2_diag2',
          skillId: 'PS1-3.2',
          level: 'Level 2 (Intermediate)',
          stem: 'You test how the temperature of a hot plate changes how long an ethanol drop takes to evaporate. Sort each variable.',
          type: 'categorize',
          categories: ['Independent Variable', 'Dependent Variable', 'Controlled Variable'],
          items: [
            { label: 'Temperature of the hot plate (30 °C, 40 °C, 50 °C)', correctCategoryIndex: 0 },
            { label: 'Time for the drop to evaporate completely (in seconds)', correctCategoryIndex: 1 },
            { label: 'The liquid tested (ethanol in every trial)', correctCategoryIndex: 2 },
            { label: 'Volume of each drop (50 μL from the same micropipette)', correctCategoryIndex: 2 }
          ],
          hint: 'This time the liquid is not what you change. What do you set to different values on purpose?',
          workedSolution: 'You set the hot plate to different temperatures on purpose, so temperature is the independent variable. You measure the evaporation time in seconds, so that is the dependent variable. Here the liquid stays the same (ethanol in every trial), so it is a controlled variable, just like the 50 μL drop volume.',
          givenSummary: 'Hot-plate evaporation lab variable sorting'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-3.2_L1',
            skillId: 'PS1-3.2',
            level: 'Level 1 (Foundational)',
            stem: 'Which statement describes a controlled variable properly for the evaporation lab?',
            type: 'mcq',
            options: [
              'Dispense exactly 50 μL of each liquid with a micropipette onto identical 50 mm glass watch glasses.',
              'Keep the evaporation time of each liquid as close to the same as possible in every trial.',
              'Choose liquids that have similar chemical formulas and the same boiling points.',
              'Let the room temperature change naturally across trials, without recording it.'
            ],
            correctIndex: 0,
            hint: 'Look for the statement that gives an exact amount and a clear way to keep it the same.',
            workedSolution: 'A complete control names the variable, its value, and how you keep it the same. "Exactly 50 μL with a micropipette onto identical 50 mm watch glasses" does all three. Evaporation time is what you measure, so you cannot hold it constant.',
            givenSummary: 'A properly stated controlled variable'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-3.2_L3',
            skillId: 'PS1-3.2',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A student tests a large drop of water on glass at 20 °C, and a small drop of acetone on plastic at 25 °C. Why is this comparison unfair?',
            type: 'mcq',
            options: [
              'Drop size, dish material, and temperature all changed with the liquid, so you cannot tell which change caused the difference.',
              'Water and acetone cannot be compared in one lab, because only one of them contains carbon.',
              'Plastic dishes change the formulas of liquids like acetone, so the acetone stops evaporating normally.',
              'An evaporation test only counts if every liquid is heated to its boiling point first.'
            ],
            correctIndex: 0,
            hint: 'In a fair test, only the independent variable changes. What else changed besides the liquid?',
            workedSolution: 'A fair test changes only one thing: the liquid. Here the drop size, the dish material, and the temperature changed too. Any of them could explain the different times, so the result says nothing clear about the attractions between molecules.',
            givenSummary: 'Spotting an unfair test with several changes'
          };
        }
      ]
    },
    {
      id: 'PS1-3.3',
      title: 'Recording Data',
      subtitle: 'Record raw data with units in the column heading, note what you observe, and handle a disturbed trial honestly.',
      watchOut: 'Units belong once, in the column heading, not in every cell. If a trial is bumped or disturbed, never erase the number: keep the row and write a note saying what happened.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-3.3_diag',
          skillId: 'PS1-3.3',
          level: 'Level 2 (Intermediate)',
          stem: 'During trial 3, someone bumps the bench, and the drop spreads across a wider area. What is the honest way to record this trial?',
          type: 'mcq',
          options: [
            'Record the measured time, and write a note that the drop spread when the bench was bumped.',
            'Erase trial 3 completely, so the table only shows the trials that went smoothly.',
            'Copy the time from trial 2 into row 3, so the numbers in the table look consistent.',
            'Subtract 20 seconds from the time, to guess what it would have been without the bump.'
          ],
          correctIndex: 0,
          hint: 'Never erase or invent data. What can you add so a reader knows what happened?',
          workedSolution: 'Keep the measured time and add a note about the bump. A spread-out drop has more surface, so it evaporates faster. The note tells you and any reader why trial 3 looks different, and lets you decide later whether to leave it out of the average.',
          givenSummary: 'Recording a disturbed trial honestly'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-3.3_diag2',
          skillId: 'PS1-3.3',
          level: 'Level 2 (Intermediate)',
          stem: 'During trial 2, a classmate opens a window, and a breeze blows across the dish. The drop finishes 40 s sooner than in the other trials. What is the honest way to record this trial?',
          type: 'mcq',
          options: [
            'Record the measured time, and add a note about the breeze from the open window.',
            'Leave row 2 blank, so the breeze does not change the class average.',
            'Write the average of trials 1 and 3 in row 2, to replace the odd time.',
            'Add 40 seconds to the time, so it matches what the other trials show.'
          ],
          correctIndex: 0,
          hint: 'Never erase or invent data. What can you add so a reader knows why this trial is different?',
          workedSolution: 'Keep the measured time and add a note about the breeze. Moving air carries evaporated molecules away from the drop, so the drop finishes sooner. The note explains the odd number, and you can decide later whether to leave that trial out of the average.',
          givenSummary: 'Recording a trial disturbed by a breeze'
        };
      },
      practiceLevels: [
        function level1(rng) {
          const t = pick(rng, [[96, 98, 95, 99], [112, 108, 110, 114], [87, 91, 90, 88], [125, 122, 127, 126]]);
          const sum = t[0] + t[1] + t[2] + t[3], mean = sum / 4;
          return {
            id: 'PS1-3.3_L1',
            skillId: 'PS1-3.3',
            level: 'Level 1 (Foundational)',
            stem: `Four ethanol trials take ${t[0]} s, ${t[1]} s, ${t[2]} s, and ${t[3]} s to evaporate. Calculate the mean evaporation time.`,
            type: 'numeric',
            inputPrompt: 'Enter the mean time in seconds (to 1 decimal place):',
            unit: 's',
            correctValue: mean,
            tolerance: 0.2,
            hint: 'Add the four times, then divide by 4.',
            workedSolution: `Mean = (${t.join(' + ')}) / 4 = ${sum} / 4 = ${fix(mean, 1)} seconds.`,
            givenSummary: 'Mean evaporation time for ethanol'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-3.3_L3',
            skillId: 'PS1-3.3',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A student\'s data table has the heading "Time". Its four cells read "96 s", "98 s", "1.6 min", and "99 s". What is the best way to fix the table?',
            type: 'mcq',
            options: [
              'Head the column "Evaporation time (s)", change 1.6 min to 96 s, and write only numbers in the cells.',
              'Keep the units in every cell, because that makes each number impossible to misread.',
              'Delete the 1.6 min trial, because a trial recorded in different units cannot be trusted.',
              'Leave the table as it is, because every value already has its unit written beside it.'
            ],
            correctIndex: 0,
            hint: 'Units belong once, in the heading. Every cell in a column should use the same unit.',
            workedSolution: '1.6 min × 60 = 96 s. Head the column "Evaporation time (s)" and write 96, 98, 96, and 99 in the cells. One unit in the heading makes every row easy to compare, and no data is thrown away.',
            givenSummary: 'Fixing units in a data table'
          };
        }
      ]
    },
    {
      id: 'PS1-3.4',
      title: 'Representing Data Graphically',
      subtitle: 'Plot every trial, label each axis with a quantity and a unit, and give the graph a title that names the comparison.',
      watchOut: 'A graph that shows only the average hides the evidence. Show every trial (or the range), so a reader can see how spread out the data is and whether two liquids overlap.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-3.4_diag',
          skillId: 'PS1-3.4',
          level: 'Level 2 (Intermediate)',
          stem: 'Which features does a graph of the evaporation lab data need? (Select ALL that apply)',
          type: 'multi_select',
          options: [
            'Every trial plotted as a point (or a range bar), so the spread shows.',
            'A title that names the comparison and the liquids tested.',
            'Axis labels with both the quantity and the unit, such as "Time (s)".',
            'No range bars or trial points, so the tops of the bars look smooth.',
            'A line connecting the liquids (acetone, ethanol, water) as if they were a trend.'
          ],
          correctIndices: [0, 1, 2],
          hint: 'Choose the features that show the data honestly and make the graph readable on its own.',
          workedSolution: 'A, B, and C are needed. Plotting every trial shows the spread, the title says what is compared, and the axis labels give quantities and units. D hides how uncertain the data is. E is wrong because the liquids are separate categories, not points along a scale.',
          givenSummary: 'What a lab graph needs'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-3.4_diag2',
          skillId: 'PS1-3.4',
          level: 'Level 2 (Intermediate)',
          stem: 'A student\'s bar graph shows one bar for each of four liquids. The y-axis says only "Time". Which changes make the graph more honest and readable? (Select ALL that apply)',
          type: 'multi_select',
          options: [
            'Add a dot for each trial, or a range bar, on top of each bar.',
            'Change the y-axis label from "Time" to "Evaporation time (s)".',
            'Add a title that names the comparison and the four liquids tested.',
            'Delete the slowest trial for each liquid, so the bars look more even.',
            'Join the tops of the bars with a line, to show a trend between liquids.'
          ],
          correctIndices: [0, 1, 2],
          hint: 'Choose the changes that show more of the evidence, or make the graph readable on its own.',
          workedSolution: 'A, B, and C help. Trial dots or range bars show how spread out the data is. The full axis label gives the quantity and the unit, and the title says what is compared. D throws away evidence. E is wrong because the liquids are separate categories, not points along a scale.',
          givenSummary: 'Fixing a lab bar graph'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-3.4_L1',
            skillId: 'PS1-3.4',
            level: 'Level 1 (Foundational)',
            stem: 'Which title and axis labels are complete for graphing the evaporation lab data?',
            type: 'mcq',
            options: [
              'Title: "Evaporation Time of Four Liquids"; X-axis: "Liquid Tested"; Y-axis: "Evaporation Time (s)"',
              'Title: "Evaporation Time of Four Liquids"; X-axis: "Liquid Tested"; Y-axis: "Evaporation Time"',
              'Title: "Comparison Graph"; X-axis: "Substances"; Y-axis: "Measurement (s)"',
              'Title: "Evaporation Rates"; X-axis: "Time (s)"; Y-axis: "Liquid Tested"'
            ],
            correctIndex: 0,
            hint: 'The title names the comparison. The measured axis needs both the quantity and its unit.',
            workedSolution: 'The first set names the comparison and gives the y-axis a quantity and a unit, "Evaporation Time (s)". The second has no unit. The third has a vague title and axis names. The fourth puts the measured time on the wrong axis.',
            givenSummary: 'Complete graph title and axis labels'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-3.4_L3',
            skillId: 'PS1-3.4',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Acetone and ethanol trials take 28 to 134 seconds. Water trials take over 600 seconds. How should you graph water alongside the others?',
            type: 'mcq',
            options: [
              'Keep every liquid on the same honest scale; water taking far longer is the key evidence of hydrogen bonding.',
              'Leave water off the graph, so the small differences between the other liquids look larger.',
              'Plot water in minutes and the others in seconds, without marking the change on the axis.',
              'Average all four liquids into one bar, so the large gap between them disappears.'
            ],
            correctIndex: 0,
            hint: 'Water taking much longer is not a mistake. What does it tell you about its molecules?',
            workedSolution: 'Water takes about 5 to 20 times longer than the other liquids. That gap is the evidence that its hydrogen bonds hold its molecules together far more strongly. Plot it on the same scale. Dropping water, mixing units, or averaging everything hides the result.',
            givenSummary: 'Graphing a liquid that takes far longer'
          };
        }
      ]
    },
    {
      id: 'PS1-3.5',
      title: 'Constructing a Claim from Data',
      subtitle: 'Make a claim that cites measured values and connects them to the attractions between molecules.',
      watchOut: 'A claim without numbers is only an opinion. A strong claim quotes the data and connects it to the attractions between molecules.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-3.5_diag',
          skillId: 'PS1-3.5',
          level: 'Level 2 (Intermediate)',
          stem: 'A class records evaporation times: acetone 28 s, ethanol 97 s, isopropanol 134 s, and water 626 s.',
          type: 'two_tier',
          tier1Prompt: 'Which claim does this data support?',
          tier1Options: [
            'Water has the strongest attractions between its molecules, and acetone has the weakest.',
            'Acetone has the strongest attractions, because its molecules leave the surface fastest.',
            'Ethanol and isopropanol have stronger attractions than water, because their molecules are larger.',
            'All four liquids have about the same attractions, because their times overlap.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reasoning connects the data to the attractions between molecules?',
          tier2Options: [
            'Evaporating means pulling molecules away from their neighbors; water taking 20 times longer than acetone shows its attractions are far stronger.',
            'Evaporating breaks covalent bonds; acetone evaporates fastest because its covalent bonds are the easiest to break.',
            'Lighter molecules always evaporate more slowly; water took longest because it has the lowest molar mass.',
            'Larger molecules always take longer to evaporate; isopropanol beat ethanol only because it is heavier.'
          ],
          correctTier2: 0,
          hint: 'Use the numbers. A longer evaporation time means the molecules hold onto each other more tightly.',
          workedSolution: 'Water took 626 s and acetone took 28 s, more than 20 times longer. Evaporating means a molecule pulls away from its neighbors. Water\'s hydrogen bonds hold its molecules far more strongly than the dipole-dipole attractions in acetone.',
          givenSummary: 'Claim and reasoning from evaporation data'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-3.5_diag2',
          skillId: 'PS1-3.5',
          level: 'Level 2 (Intermediate)',
          stem: 'Equal drops of three liquids evaporate on the same dish. The averages of four trials are: Liquid A 31 s, Liquid B 112 s, Liquid C 455 s.',
          type: 'two_tier',
          tier1Prompt: 'Which claim does this data support?',
          tier1Options: [
            'Liquid C has the strongest attractions between its molecules, and Liquid A has the weakest.',
            'Liquid A has the strongest attractions, because its molecules leave the dish fastest.',
            'Liquid C has the weakest covalent bonds, because they took the longest to break.',
            'All three liquids have the same attractions, because each one evaporated completely.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reasoning connects the data to the attractions between molecules?',
          tier2Options: [
            'Evaporating pulls molecules away from their neighbors; C taking about 15 times longer than A shows far stronger attractions.',
            'Evaporating breaks covalent bonds; the liquid with the weakest bonds inside its molecules evaporates the fastest.',
            'The longest time belongs to the drop with the most molecules, so the times only show drop size.',
            'The fastest liquid stores the most energy in its bonds, so its molecules have enough energy to leave first.'
          ],
          correctTier2: 0,
          hint: 'Use the numbers in your reasoning. What does a longer evaporation time say about how tightly molecules hold each other?',
          workedSolution: 'Liquid C took 455 s and Liquid A took 31 s, about 15 times longer. Evaporating means a molecule pulls away from its neighbors at the surface. The longer a liquid takes, the more tightly its molecules hold each other, so C has the strongest attractions and A the weakest. The drops were equal, so drop size cannot explain the gap.',
          givenSummary: 'Claim and reasoning from three evaporation times'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-3.5_L1',
            skillId: 'PS1-3.5',
            level: 'Level 1 (Foundational)',
            stem: 'Over four trials, Liquid A takes 79 to 101 s to evaporate. Liquid B takes 85 to 99 s. Which claim is the most honest?',
            type: 'mcq',
            options: [
              'The ranges overlap almost completely, so the data cannot tell the two liquids apart.',
              'Liquid A has stronger attractions, because its slowest trial reached 101 seconds.',
              'Liquid B has stronger attractions, because its fastest trial took 85 seconds.',
              'A 2-second difference in the averages proves that Liquid B has stronger attractions.'
            ],
            correctIndex: 0,
            hint: 'Compare the two ranges: 79 to 101 s and 85 to 99 s. How much do they overlap?',
            workedSolution: 'The ranges overlap almost completely (79 to 101 s and 85 to 99 s). A small difference between the averages is smaller than the spread in each liquid\'s own trials. The honest claim is that the two liquids have similar attractions.',
            givenSummary: 'Overlapping ranges limit the claim'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-3.5_L3',
            skillId: 'PS1-3.5',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A student claims acetone must be nonpolar, because it evaporates fastest of the four liquids. What is the flaw?',
            type: 'mcq',
            options: [
              'Acetone is polar (it has a polar C=O bond), but dipole-dipole attractions are weaker than hydrogen bonds.',
              'Acetone is nonpolar, but nonpolar liquids always evaporate more slowly than polar liquids do.',
              'Evaporation time depends only on molar mass, so polarity has nothing to do with it.',
              'Acetone is made of ions, so it has no attractions between molecules at all.'
            ],
            correctIndex: 0,
            hint: 'Acetone has a polar C=O bond. Why could a polar liquid still evaporate fastest in this set?',
            workedSolution: 'Acetone is polar because of its C=O bond, so it has dipole-dipole attractions. But the other three liquids (ethanol, isopropanol, and water) all hydrogen bond, which is stronger. Fastest in this set means weakest attractions in this set, not nonpolar.',
            givenSummary: 'Acetone: polar, but evaporates fastest'
          };
        }
      ]
    },
    {
      id: 'PS1-3.6',
      title: 'Limitations & Refinement',
      subtitle: 'Find a weakness in the procedure from the spread of the data, and propose a change to the equipment that fixes it.',
      watchOut: 'Never write "human error" as a limitation: it names a person, not a cause. Name the condition that changed (a draft, a cooling room, a drop spreading) and propose a change to the equipment that fixes it.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-3.6_diag',
          skillId: 'PS1-3.6',
          level: 'Level 2 (Intermediate)',
          stem: 'Rank these three responses to messy data, from worst practice (1) to best practice (3).',
          type: 'ranking',
          rankingPrompt: 'Order from worst practice (1) to best practice (3):',
          items: [
            'Write "human error" in the report and erase the odd trials from the table',
            'Repeat the trials in the same open room without changing any equipment',
            'Name the cause (such as a draft) and build a clear shield around the dish'
          ],
          correctOrder: [
            'Write "human error" in the report and erase the odd trials from the table',
            'Repeat the trials in the same open room without changing any equipment',
            'Name the cause (such as a draft) and build a clear shield around the dish'
          ],
          hint: 'Erasing data is never acceptable. Does repeating a trial in the same conditions fix the cause?',
          workedSolution: 'Erasing data and blaming "human error" is the worst: it hides evidence and names no cause. Repeating trials in the same open room keeps the same problem. The best response names the cause, such as a draft, and changes the equipment to block it.',
          givenSummary: 'Ranking responses to messy data'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-3.6_diag2',
          skillId: 'PS1-3.6',
          level: 'Level 2 (Intermediate)',
          stem: 'Drop sizes varied because each student used a different plastic dropper. Rank these responses from worst practice (1) to best practice (3).',
          type: 'ranking',
          rankingPrompt: 'Order from worst practice (1) to best practice (3):',
          items: [
            'Write "human error" as the limitation and change nothing for next time',
            'Name the cause (drops of different sizes) and use a micropipette set to 50 μL',
            'Erase the trials with large drops and keep only the ones that look right'
          ],
          correctOrder: [
            'Erase the trials with large drops and keep only the ones that look right',
            'Write "human error" as the limitation and change nothing for next time',
            'Name the cause (drops of different sizes) and use a micropipette set to 50 μL'
          ],
          hint: 'Erasing data is never acceptable. Which response names a cause and changes the equipment?',
          workedSolution: 'Erasing trials is the worst: it destroys evidence. Writing "human error" keeps the data but names no cause, so nothing improves. The best response names the cause, drops of different sizes, and fixes it with equipment that delivers the same 50 μL every time.',
          givenSummary: 'Ranking responses to uneven drop sizes'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-3.6_L1',
            skillId: 'PS1-3.6',
            level: 'Level 1 (Foundational)',
            stem: 'Four water trials over 90 minutes take 598 s, 615 s, 638 s, and 655 s. Each trial took longer than the one before. What most likely caused this trend?',
            type: 'mcq',
            options: [
              'The room cooled as the air conditioning ran, or the air became more humid.',
              'The student\'s reaction time with the stopwatch made every number drift upward.',
              'Each water drop absorbed nitrogen from the air, which made the next drop heavier.',
              'The glass watch glass expanded by several centimeters during the class.'
            ],
            correctIndex: 0,
            hint: 'The times rise steadily, trial after trial. What can change steadily in a room over 90 minutes?',
            workedSolution: 'The times climb steadily from 598 s to 655 s. A steady climb points to a condition that changed over the class, such as the room cooling or the air getting more humid. Stopwatch reaction time scatters numbers up and down; it does not push them all one way.',
            givenSummary: 'Finding the cause of a steady upward drift'
          };
        },
        function level2(rng) {
          return {
            id: 'PS1-3.6_L3',
            skillId: 'PS1-3.6',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A student plans to fix a steady drift in the times by running 10 more trials in the same open room. Why will this not work, and what would?',
            type: 'mcq',
            options: [
              'More trials only smooth out random scatter; they cannot remove a steady drift. Shield the dish from the room.',
              'Running more trials in an open room makes the liquids react with the air in the room.',
              'A larger average always removes every kind of error, so 10 more trials will fix it.',
              'Move the trials outdoors to the courtyard, where the air can move freely around the dish.'
            ],
            correctIndex: 0,
            hint: 'If the room keeps changing, does repeating the test in that room fix the problem?',
            workedSolution: 'Extra trials average out random scatter, but every new trial still drifts with the room. Change the equipment instead: put a clear shield around the dish and record the temperature and humidity during each trial.',
            givenSummary: 'Why more trials do not fix a drift'
          };
        }
      ]
    }
  ];

  window.PE_DATA_HS_PS1_3 = {
    info: PE_INFO,
    skills: SKILLS
  };
})();
