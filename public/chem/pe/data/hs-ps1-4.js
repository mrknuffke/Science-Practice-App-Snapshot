/**
 * HS-PS1-4: Energy in Chemical Reactions (Bond Energy & Reaction Enthalpy)
 * Items rewritten (Oct 2026) to the Tier 3 register in docs/textbook/VOICE.md and to the scope
 * of lessons 3-14a, 3-1c and 3-4a: BENDO MEXO, a bonded molecule resting in a well of potential
 * energy, energy profiles, and bond-energy sums. No orbitals or bond dissociation language.
 * Items that ask a student to read a structure or a profile carry a `figure` built with ../pe-figures.js.
 * Zero em-dash compliant: hyphens, colons, and parentheses only.
 */
(function() {
  'use strict';

  const { svg, label, sign, arrow, divider, carbonCross, o2, co2, h2o, h2, n2, f2, nh3, energyProfile } = window.PE_FIGURES;

  const ALL_H = { n: 'H', s: 'H', e: 'H', w: 'H' };

  const FIG_PROFILE = energyProfile(150, 380, 60, 400,
    'Energy profile. The reactants sit at 150 kJ/mol, the curve rises to a peak at 380 kJ/mol, then falls to the products at 60 kJ/mol.');

  const FIG_METHANE_BURNS = svg(640, 200,
    'Lewis structures for CH4 + 2 O2 -> CO2 + 2 H2O. Methane has four C-H bonds. Each O2 has one O=O double bond. CO2 has two C=O double bonds. Each water has two O-H bonds.',
    carbonCross(80, 100, ALL_H) + sign(165, 100, '+') + sign(190, 100, '2') + o2(240, 100) +
    arrow(292, 338, 100) + co2(410, 100) + sign(492, 100, '+') + sign(515, 100, '2') + h2o(575, 100) +
    label(80, 186, 'CH₄') + label(240, 186, 'O₂') + label(410, 186, 'CO₂') + label(575, 186, 'H₂O'));

  const FIG_AMMONIA_FORMS = svg(560, 180,
    'Lewis structures for N2 + 3 H2 -> 2 NH3. N2 has one N triple bond. Each H2 has one H-H bond. Each ammonia has three N-H bonds.',
    n2(70, 80) + sign(140, 80, '+') + sign(165, 80, '3') + h2(215, 80) +
    arrow(262, 312, 80) + sign(340, 80, '2') + nh3(410, 84) +
    label(70, 166, 'N₂') + label(215, 166, 'H₂') + label(410, 166, 'NH₃'));

  const FIG_N2_F2 = svg(560, 150,
    'Lewis structures. Nitrogen: two N atoms joined by a triple bond, one lone pair on each. Fluorine: two F atoms joined by a single bond, three lone pairs on each.',
    divider(280, 150) +
    label(140, 26, 'Nitrogen (N₂)', true) + n2(140, 80) + label(140, 136, 'triple bond') +
    label(420, 26, 'Fluorine (F₂)', true) + f2(420, 80) + label(420, 136, 'single bond'));

  const FIG_PROFILE_ENDO = energyProfile(80, 340, 200, 400,
    'Energy profile. The reactants sit at 80 kJ/mol, the curve rises to a peak at 340 kJ/mol, then falls to the products at 200 kJ/mol.');

  const FIG_HYDROGEN_BURNS = svg(560, 170,
    'Lewis structures for 2 H2 + O2 -> 2 H2O. Each H2 has one H-H bond. O2 has one O=O double bond. Each water has two O-H bonds.',
    sign(75, 80, '2') + h2(125, 80) + sign(180, 80, '+') + o2(235, 80) +
    arrow(295, 341, 80) + sign(367, 80, '2') + h2o(435, 80) +
    label(125, 150, 'H₂') + label(235, 150, 'O₂') + label(435, 150, 'H₂O'));

  const PE_INFO = {
    id: 'HS-PS1-4',
    code: 'PS1-4',
    title: 'Bond Energy & Reaction Energetics',
    unit: 'Unit 3: Thermochemistry & Energetics',
    description: 'Develop a model to illustrate that the release or absorption of energy from a chemical reaction system depends upon the changes in total bond energy.',
    clarification: 'Emphasis is on the idea that a chemical reaction is a system that affects the energy change. Examples of models could include molecular-level drawings and diagrams of reactions, graphs showing the relative energies of reactants and products, and representations showing energy is conserved.',
    assessmentBoundary: 'Assessment does not include calculating the total bond energy changes during a chemical reaction from the bond energies of reactants and products using Hess\'s law or heats of formation.'
  };

  const SKILLS = [
    {
      id: 'PS1-4.1',
      title: 'Bond Energy Principle: Breaking vs. Forming',
      subtitle: 'Model why breaking bonds always takes energy and forming bonds always releases energy.',
      watchOut: 'Here is the trap: "energy is stored in bonds and released when they break." It is backward. A bonded molecule rests in a well of potential energy, so pulling atoms apart always takes energy. Energy comes out only when new bonds form.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-4.1_diag',
          skillId: 'PS1-4.1',
          level: 'Level 2 (Intermediate)',
          stem: 'A student says burning methane releases energy because "high-energy bonds break." Is the student right?',
          type: 'two_tier',
          tier1Prompt: 'Choose the best response to the student\'s claim:',
          tier1Options: [
            'No. Breaking the bonds takes energy; the energy comes out because stronger bonds form in the products.',
            'Yes. Breaking the bonds in fuel molecules releases the energy that was stored inside them.',
            'Partly. Breaking C-H bonds releases energy, but breaking O=O bonds takes energy.',
            'No. Bonds break and form without any energy change unless a flame stays in contact.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Bonded atoms rest in a well of potential energy. Pulling them apart takes energy, and forming bonds releases it.',
            'Bonds are packets of heat squeezed between atoms, and they pop open and release that heat when cut.',
            'Bonds in fuels are built differently from other bonds, so these bonds give off energy as they break.',
            'Burning is the one kind of reaction where forming bonds takes energy and breaking bonds releases it.'
          ],
          correctTier2: 0,
          hint: 'Use BENDO MEXO: Breaking is ENDOthermic (takes energy), Making is EXOthermic (releases energy).',
          workedSolution: 'Breaking any bond takes energy, because you must pull the atoms apart against their attraction. Forming a bond releases energy as the atoms settle into the well. Burning methane breaks C-H and O=O bonds (energy in) and forms C=O and O-H bonds (energy out). More energy comes out than goes in, so the reaction is exothermic.',
          givenSummary: 'Burning methane: where the energy comes from'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-4.1_diag2',
          skillId: 'PS1-4.1',
          level: 'Level 2 (Intermediate)',
          stem: 'Hydrogen burns in oxygen: 2 H₂ + O₂ → 2 H₂O, and the reaction releases energy. A student says the energy comes out "when the H-H bonds snap." Is the student right?',
          type: 'two_tier',
          tier1Prompt: 'Choose the best response to the student\'s claim:',
          tier1Options: [
            'No. Snapping H-H and O=O bonds takes energy; forming the O-H bonds in water releases more.',
            'Yes. Snapping the H-H bonds releases the energy that hydrogen stored inside them.',
            'Partly. Snapping H-H bonds releases energy, but snapping O=O bonds takes energy in.',
            'No. All of the energy comes from the spark, and the bonds change no energy at all.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Bonded atoms attract each other, so separating them takes energy. Energy comes out when new bonds pull atoms together.',
            'Hydrogen molecules hold squeezed heat between their atoms, and the heat escapes when the bond snaps.',
            'Small molecules like H₂ store energy differently from large ones, so their bonds release energy as they break.',
            'Water molecules need energy to form, so the released energy must come from breaking the bonds.'
          ],
          correctTier2: 0,
          hint: 'Breaking is ENDOthermic, making is EXOthermic (BENDO MEXO). Which bonds are made here?',
          workedSolution: 'Breaking any bond takes energy, because you pull atoms apart against their attraction. So breaking 2 H-H bonds and 1 O=O bond takes energy in. Forming 4 O-H bonds in two water molecules releases energy. More comes out than goes in, so the reaction is exothermic. The energy comes from bond making, not bond breaking.',
          givenSummary: 'Burning hydrogen: where the energy comes from'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-4.1_L1',
            skillId: 'PS1-4.1',
            level: 'Level 1 (Foundational)',
            stem: 'Sort each change as endothermic (energy taken in) or exothermic (energy released).',
            type: 'categorize',
            categories: [
              'Endothermic (Energy Absorbed)',
              'Exothermic (Energy Released)'
            ],
            items: [
              { label: 'Breaking the H-H bond in a hydrogen molecule (H₂ → 2 H)', correctCategoryIndex: 0 },
              { label: 'Forming an O-H bond from separate O and H atoms (O + H → O-H)', correctCategoryIndex: 1 },
              { label: 'Breaking the triple bond in nitrogen gas (N₂ → 2 N)', correctCategoryIndex: 0 },
              { label: 'Forming the two C=O bonds in carbon dioxide (C + 2 O → CO₂)', correctCategoryIndex: 1 },
              { label: 'Pulling a water molecule apart into separate atoms (H₂O → 2 H + O)', correctCategoryIndex: 0 }
            ],
            hint: 'Breaking any bond takes energy in. Forming any bond releases energy.',
            workedSolution: 'Every bond that breaks takes energy in, because the atoms must be pulled apart against their attraction (endothermic). Every bond that forms releases energy, because the atoms settle into a lower-energy well (exothermic).',
            givenSummary: 'Sorting bond breaking and bond forming'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-4.1_L3',
            skillId: 'PS1-4.1',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A biology textbook says ATP powers your cells with "high-energy phosphate bonds" that release energy when broken. What actually happens?',
            type: 'mcq',
            options: [
              'Breaking the phosphate bond takes energy; more energy comes out as new, stronger bonds form with water.',
              'The phosphate bond is squeezed like a spring, and it releases that stored energy when it snaps.',
              'Breaking the phosphate bond releases energy directly, because phosphorus pushes oxygen away.',
              'A small part of the mass of the phosphate disappears and turns into energy, as in E = mc².'
            ],
            correctIndex: 0,
            hint: 'A bond never releases energy by breaking. Count the bonds that form as well as the one that breaks.',
            workedSolution: 'Breaking the phosphate bond in ATP takes energy, like breaking any bond. In the same reaction, new bonds form between the pieces and water. Those new bonds release more energy than the broken bond took, so the reaction as a whole releases energy.',
            givenSummary: 'ATP: where the energy really comes from'
          };
        }
      ]
    },
    {
      id: 'PS1-4.2',
      title: 'Energy Profiles: Activation Energy & Energy Change',
      subtitle: 'Read an energy profile to find the activation energy, the energy change, and what a catalyst does.',
      watchOut: 'Activation energy (Ea) is the climb from the reactants up to the peak. The energy change (ΔH) is products minus reactants. A common slip is reading Ea from zero instead of from the reactants. A catalyst lowers the peak, but the reactants and products stay where they are, so ΔH does not change.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-4.2_diag',
          skillId: 'PS1-4.2',
          level: 'Level 2 (Intermediate)',
          stem: 'Read the energy profile. Find the activation energy (Ea), the energy change (ΔH), and whether the reaction is exothermic or endothermic.',
          figure: FIG_PROFILE,
          type: 'mcq',
          options: [
            'Ea = +230 kJ/mol, ΔH = -90 kJ/mol (exothermic)',
            'Ea = +380 kJ/mol, ΔH = +90 kJ/mol (endothermic)',
            'Ea = +230 kJ/mol, ΔH = +90 kJ/mol (endothermic)',
            'Ea = +320 kJ/mol, ΔH = -90 kJ/mol (exothermic)'
          ],
          correctIndex: 0,
          hint: 'Ea = peak minus reactants. ΔH = products minus reactants. If the products sit lower, ΔH is negative.',
          workedSolution: 'Ea is the climb from the reactants to the peak: 380 - 150 = +230 kJ/mol. ΔH is products minus reactants: 60 - 150 = -90 kJ/mol. The products sit lower than the reactants, so energy was released: the reaction is exothermic.',
          givenSummary: 'Reading Ea and ΔH from an energy profile'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-4.2_diag2',
          skillId: 'PS1-4.2',
          level: 'Level 2 (Intermediate)',
          stem: 'Read the energy profile. Find the activation energy (Ea), the energy change (ΔH), and whether the reaction is exothermic or endothermic.',
          figure: FIG_PROFILE_ENDO,
          type: 'mcq',
          options: [
            'Ea = +260 kJ/mol, ΔH = +120 kJ/mol (endothermic)',
            'Ea = +340 kJ/mol, ΔH = +120 kJ/mol (endothermic)',
            'Ea = +140 kJ/mol, ΔH = +120 kJ/mol (endothermic)',
            'Ea = +260 kJ/mol, ΔH = -120 kJ/mol (exothermic)'
          ],
          correctIndex: 0,
          hint: 'Ea = peak minus reactants, not peak minus zero. ΔH = products minus reactants.',
          workedSolution: 'Ea is the climb from the reactants to the peak: 340 - 80 = +260 kJ/mol. A common slip is reading 340 straight off the axis. ΔH is products minus reactants: 200 - 80 = +120 kJ/mol. The products sit higher than the reactants, so the system took energy in: the reaction is endothermic.',
          givenSummary: 'Reading Ea and ΔH from an endothermic energy profile'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-4.2_L1',
            skillId: 'PS1-4.2',
            level: 'Level 1 (Foundational)',
            stem: 'On the energy profile of an endothermic reaction, where do the products sit compared with the reactants?',
            type: 'two_tier',
            tier1Prompt: 'Choose the correct comparison:',
            tier1Options: [
              'The products sit higher than the reactants (ΔH > 0).',
              'The products sit lower than the reactants (ΔH < 0).',
              'The products and reactants sit at the same level (ΔH = 0).',
              'The products start higher, then drop below the reactants later.'
            ],
            correctTier1: 0,
            tier2Prompt: 'Which reason supports your answer?',
            tier2Options: [
              'Breaking the reactant bonds took more energy than forming the product bonds released.',
              'Forming the product bonds released a lot of heat, and that heat raised the products.',
              'Endothermic reactions skip the energy barrier and take cold in from the beaker.',
              'Some of the mass of the reactants turned into energy, as in E = mc².'
            ],
            correctTier2: 0,
            hint: 'In an endothermic reaction, energy flows into the chemicals. Does that leave the products higher or lower?',
            workedSolution: 'In an endothermic reaction, breaking the reactant bonds takes more energy than forming the product bonds gives back. The chemicals take in the difference from their surroundings. That leaves the products higher on the profile than the reactants, so ΔH is positive.',
            givenSummary: 'Endothermic profile: products sit higher'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-4.2_L3',
            skillId: 'PS1-4.2',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'An iron catalyst is added to the Haber reaction (ΔH = -92 kJ/mol). Which statements describe what the catalyst does to the energy profile? (Select all that apply)',
            type: 'multi_select',
            options: [
              'It lowers the peak, so the forward activation energy is smaller.',
              'It lowers the climb for the reverse reaction by the same amount.',
              'It leaves the energy change at exactly -92 kJ/mol.',
              'It moves the products (2 NH₃) lower on the profile.',
              'It lets a larger share of collisions have enough energy to react.'
            ],
            correctIndices: [0, 1, 2, 4],
            hint: 'A catalyst offers a lower path over the hill. Does it move the starting level or the finishing level?',
            workedSolution: 'A catalyst lowers the peak, so both the forward and the reverse climbs get smaller by the same amount. The reactants and products stay at the same levels, so ΔH stays -92 kJ/mol. With a lower peak, more collisions have enough energy to get over it.',
            givenSummary: 'What a catalyst changes on the profile'
          };
        }
      ]
    },
    {
      id: 'PS1-4.3',
      title: 'Energy Change from Bond Energies',
      subtitle: 'Calculate the energy change of a reaction: ΔH = energy of bonds broken minus energy of bonds formed.',
      watchOut: 'ΔH = bonds broken (reactants) minus bonds formed (products). A common slip is doing products minus reactants. Count every bond: CO₂ has two C=O bonds, and each H₂O has two O-H bonds.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-4.3_diag',
          skillId: 'PS1-4.3',
          level: 'Level 2 (Intermediate)',
          stem: 'Calculate ΔH (kJ/mol) for burning methane, CH₄ + 2 O₂ → CO₂ + 2 H₂O. Bond energies: C-H = 413, O=O = 498, C=O = 799, O-H = 463 kJ/mol. The figure shows every bond.',
          figure: FIG_METHANE_BURNS,
          type: 'numeric',
          inputPrompt: 'ΔH in kJ/mol (include the sign, for example -500):',
          correctValue: -808,
          tolerance: 5,
          unit: 'kJ/mol',
          hint: 'Bonds broken: 4 C-H and 2 O=O. Bonds formed: 2 C=O and 4 O-H. Then subtract: broken minus formed.',
          workedSolution: 'Bonds broken: 4 C-H = 4 x 413 = 1652, and 2 O=O = 2 x 498 = 996. Total broken = 2648 kJ/mol. Bonds formed: 2 C=O = 2 x 799 = 1598, and 4 O-H = 4 x 463 = 1852. Total formed = 3450 kJ/mol. ΔH = 2648 - 3450 = -808 kJ/mol.',
          givenSummary: 'Methane combustion ΔH from bond energies'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-4.3_diag2',
          skillId: 'PS1-4.3',
          level: 'Level 2 (Intermediate)',
          stem: 'Calculate ΔH (kJ/mol) for burning hydrogen, 2 H₂ + O₂ → 2 H₂O. Bond energies: H-H = 436, O=O = 498, O-H = 463 kJ/mol. The figure shows every bond.',
          figure: FIG_HYDROGEN_BURNS,
          type: 'numeric',
          inputPrompt: 'ΔH in kJ/mol (include the sign, for example -500):',
          correctValue: -482,
          tolerance: 5,
          unit: 'kJ/mol',
          hint: 'Bonds broken: 2 H-H and 1 O=O. Bonds formed: each H₂O has 2 O-H bonds, and there are 2 H₂O. Then subtract: broken minus formed.',
          workedSolution: 'Bonds broken: 2 H-H = 2 x 436 = 872, and 1 O=O = 498. Total broken = 1370 kJ/mol. Bonds formed: 2 H₂O hold 4 O-H bonds, so 4 x 463 = 1852 kJ/mol. ΔH = 1370 - 1852 = -482 kJ/mol. A common slip is counting only 2 O-H bonds, one per water molecule.',
          givenSummary: 'Hydrogen combustion ΔH from bond energies'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-4.3_L1',
            skillId: 'PS1-4.3',
            level: 'Level 1 (Foundational)',
            stem: 'Hydrogen reacts with chlorine: H₂ + Cl₂ → 2 HCl. Bond energies: H-H = 436, Cl-Cl = 242, H-Cl = 431 kJ/mol. Which setup gives ΔH correctly?',
            type: 'mcq',
            options: [
              'ΔH = [436 + 242] - [2(431)] = 678 - 862 = -184 kJ/mol',
              'ΔH = [2(431)] - [436 + 242] = 862 - 678 = +184 kJ/mol',
              'ΔH = [436 + 242 + 431] = +1109 kJ/mol',
              'ΔH = [436 - 242] - [431] = -237 kJ/mol'
            ],
            correctIndex: 0,
            hint: 'ΔH = bonds broken minus bonds formed. Two HCl molecules form, so count two H-Cl bonds.',
            workedSolution: 'Bonds broken: one H-H (436) and one Cl-Cl (242), a total of 678 kJ/mol. Bonds formed: two H-Cl bonds, 2 x 431 = 862 kJ/mol. ΔH = 678 - 862 = -184 kJ/mol, so the reaction is exothermic.',
            givenSummary: 'Setting up ΔH for hydrogen chloride'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-4.3_L3',
            skillId: 'PS1-4.3',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Ammonia forms from its elements: N₂ + 3 H₂ → 2 NH₃. Bond energies: N≡N = 945, H-H = 436, N-H = 391 kJ/mol. Calculate ΔH (kJ/mol). The figure shows every bond.',
            figure: FIG_AMMONIA_FORMS,
            type: 'numeric',
            inputPrompt: 'ΔH in kJ/mol (include a negative sign if exothermic):',
            correctValue: -93,
            tolerance: 5,
            unit: 'kJ/mol',
            hint: 'Break one N≡N bond and three H-H bonds. Two NH₃ molecules have 2 x 3 = 6 N-H bonds to form.',
            workedSolution: 'Bonds broken: one N≡N = 945, and three H-H = 3 x 436 = 1308. Total broken = 2253 kJ/mol. Bonds formed: two NH₃ molecules hold 6 N-H bonds, 6 x 391 = 2346 kJ/mol. ΔH = 2253 - 2346 = -93 kJ/mol.',
            givenSummary: 'Ammonia formation ΔH from bond energies'
          };
        }
      ]
    },
    {
      id: 'PS1-4.4',
      title: 'System vs. Surroundings & Conservation of Energy',
      subtitle: 'Track energy moving between the reacting chemicals (the system) and everything around them (the surroundings).',
      watchOut: 'The system is only the reacting chemicals. The surroundings are everything else: the water, the beaker, the air, and the thermometer. A thermometer measures the surroundings. When it rises, the system released energy (exothermic). When it drops, the system took energy in.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-4.4_diag',
          skillId: 'PS1-4.4',
          level: 'Level 2 (Intermediate)',
          stem: 'A student dissolves solid ammonium nitrate (NH₄NO₃) in water at 22 °C. After stirring, the thermometer reads 14 °C.',
          type: 'two_tier',
          tier1Prompt: 'Which way did energy flow, and what kind of process is this?',
          tier1Options: [
            'Endothermic: energy flowed from the water (surroundings) into the dissolving salt (system).',
            'Exothermic: energy flowed from the dissolving salt (system) into the water (surroundings).',
            'Energy was destroyed, because the salt crystals made cold inside the water.',
            'No energy moved between the salt and the water, because the beaker was closed.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'The thermometer measures the water. It dropped because the water gave energy to the dissolving salt.',
            'The water lost mass by evaporating, and losing mass is what made the temperature drop.',
            'The dissolving salt made the water hold less heat, so the same energy reads colder.',
            'Cold flowed out of the salt crystals and into the thermometer bulb.'
          ],
          correctTier2: 0,
          hint: 'The water and the thermometer are the surroundings. If they got colder, where did their energy go?',
          workedSolution: 'The thermometer sits in the water, so it measures the surroundings. The temperature dropped, so the water lost energy. Energy is not destroyed, so it went into the system: the dissolving ammonium nitrate. A system that takes energy in is endothermic (ΔH > 0).',
          givenSummary: 'Ammonium nitrate cold pack: system vs surroundings'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-4.4_diag2',
          skillId: 'PS1-4.4',
          level: 'Level 2 (Intermediate)',
          stem: 'A student drops a strip of magnesium into hydrochloric acid at 21 °C. Bubbles form, and the thermometer climbs to 34 °C.',
          type: 'two_tier',
          tier1Prompt: 'Which way did energy flow, and what kind of process is this?',
          tier1Options: [
            'Exothermic: energy flowed from the reacting chemicals (system) into the water (surroundings).',
            'Endothermic: energy flowed from the water (surroundings) into the reacting chemicals (system).',
            'Energy was created, because the reaction made new heat inside the solution.',
            'No energy moved between the reaction and the water, because both are in one beaker.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'The thermometer measures the water. It rose because the reaction gave energy to the water around it.',
            'The thermometer measures the reaction itself, and it rose because the chemicals took energy in.',
            'Hydrogen gas bubbles carry heat with them, so making any gas always warms the water.',
            'The reaction made extra heat from nothing, so the total energy in the beaker went up.'
          ],
          correctTier2: 0,
          hint: 'The water and the thermometer are the surroundings. If they got warmer, where did that energy come from?',
          workedSolution: 'The thermometer sits in the water, so it measures the surroundings. The temperature rose, so the water gained energy. Energy is not created, so it came from the system: the magnesium and acid reacting. A system that releases energy to its surroundings is exothermic (ΔH < 0).',
          givenSummary: 'Magnesium in acid: system vs surroundings'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-4.4_L1',
            skillId: 'PS1-4.4',
            level: 'Level 1 (Foundational)',
            stem: 'A reaction happens in a beaker on the lab bench. Sort each part as the system or the surroundings.',
            type: 'categorize',
            categories: [
              'Part of the Chemical System',
              'Part of the Surroundings'
            ],
            items: [
              { label: 'The reacting methane and oxygen molecules', correctCategoryIndex: 0 },
              { label: 'The water in the beaker', correctCategoryIndex: 1 },
              { label: 'The glass walls of the flask', correctCategoryIndex: 1 },
              { label: 'The liquid inside the thermometer', correctCategoryIndex: 1 },
              { label: 'The bonds that break and form during the reaction', correctCategoryIndex: 0 }
            ],
            hint: 'The system is only the reacting chemicals and their bonds. The container, the water, the thermometer, and the air are surroundings.',
            workedSolution: 'The system is the reactants, the products, and the bonds that break and form. The water, the flask, the thermometer, and the room air are all surroundings.',
            givenSummary: 'Sorting system and surroundings'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-4.4_L3',
            skillId: 'PS1-4.4',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'An insulated cup holds 100.0 g of water. A reaction in the water releases 4,184 J into it. No heat escapes. How much does the water temperature change? (The specific heat of water is 4.184 J/(g·°C).)',
            type: 'mcq',
            options: [
              '+10.0 °C (the water warms by 10.0 °C)',
              '-10.0 °C (the water cools by 10.0 °C)',
              '+1.0 °C (the water warms by 1.0 °C)',
              '+4.184 °C (the water warms by 4.184 °C)'
            ],
            correctIndex: 0,
            hint: 'Use q = m · c · ΔT, so ΔT = q / (m · c). The reaction released energy into the water. Does the water warm or cool?',
            workedSolution: 'The water gains 4,184 J. Using q = m · c · ΔT: 4,184 J = (100.0 g)(4.184 J/(g·°C))(ΔT). So ΔT = 4,184 / 418.4 = +10.0 °C. The water warms by 10.0 °C.',
            givenSummary: 'Temperature change of water in a calorimeter'
          };
        }
      ]
    },
    {
      id: 'PS1-4.5',
      title: 'Bond Strength & Molecular Stability',
      subtitle: 'Relate single, double, and triple bonds to bond energy and to how stable a molecule is.',
      watchOut: 'More shared pairs means a stronger bond: a triple bond is stronger than a double, and a double is stronger than a single. A stronger bond sits in a deeper well, so it takes more energy to break, and the molecule is more stable.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-4.5_diag',
          skillId: 'PS1-4.5',
          level: 'Level 2 (Intermediate)',
          stem: 'Rank these carbon-carbon bonds by bond energy, from weakest (1) to strongest (3).',
          type: 'ranking',
          rankingPrompt: 'Order from weakest bond (1) to strongest bond (3):',
          items: [
            'C-C single bond in ethane (one shared pair)',
            'C=C double bond in ethene (two shared pairs)',
            'C≡C triple bond in ethyne (three shared pairs)'
          ],
          correctOrder: [
            'C-C single bond in ethane (one shared pair)',
            'C=C double bond in ethene (two shared pairs)',
            'C≡C triple bond in ethyne (three shared pairs)'
          ],
          hint: 'More shared electron pairs pull the two nuclei together more strongly.',
          workedSolution: 'A C-C single bond shares one pair (348 kJ/mol). A C=C double bond shares two pairs (614 kJ/mol). A C≡C triple bond shares three pairs (839 kJ/mol). More shared pairs, stronger bond: single < double < triple.',
          givenSummary: 'Ranking single, double and triple C-C bonds'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-4.5_diag2',
          skillId: 'PS1-4.5',
          level: 'Level 2 (Intermediate)',
          stem: 'Rank these carbon-oxygen bonds by bond energy, from weakest (1) to strongest (3).',
          type: 'ranking',
          rankingPrompt: 'Order from weakest bond (1) to strongest bond (3):',
          items: [
            'C=O double bond in carbon dioxide (CO₂)',
            'C≡O triple bond in carbon monoxide (CO)',
            'C-O single bond in methanol (CH₃OH)'
          ],
          correctOrder: [
            'C-O single bond in methanol (CH₃OH)',
            'C=O double bond in carbon dioxide (CO₂)',
            'C≡O triple bond in carbon monoxide (CO)'
          ],
          hint: 'Count the shared pairs in each bond. More shared pairs pull the two nuclei together more strongly.',
          workedSolution: 'The C-O single bond in methanol shares one pair (358 kJ/mol). The C=O double bond in CO₂ shares two pairs (799 kJ/mol). The C≡O triple bond in carbon monoxide shares three pairs (1072 kJ/mol). More shared pairs, stronger bond: single < double < triple.',
          givenSummary: 'Ranking single, double and triple C-O bonds'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-4.5_L1',
            skillId: 'PS1-4.5',
            level: 'Level 1 (Foundational)',
            stem: 'Nitrogen gas (N₂) barely reacts with anything at room temperature. Fluorine gas (F₂) reacts with almost everything. Compare their Lewis structures. What explains the difference?',
            figure: FIG_N2_F2,
            type: 'mcq',
            options: [
              'N₂ has a strong triple bond (945 kJ/mol) to break, while F₂ has a weak single bond (158 kJ/mol).',
              'N₂ has no outer electrons left to react with, while F₂ has fourteen outer electrons available.',
              'N₂ has polar bonds that hold it together, while F₂ is held together by ionic bonds.',
              'Breaking the bond in N₂ releases energy, while breaking the bond in F₂ takes energy.'
            ],
            correctIndex: 0,
            hint: 'Look at the bonds in the figure. Which molecule must break a triple bond before it can react?',
            workedSolution: 'N₂ is held together by a triple bond. It takes 945 kJ/mol to break, so N₂ needs very high temperatures or a catalyst to react. F₂ has a single bond that takes only 158 kJ/mol to break, so it reacts readily.',
            givenSummary: 'N₂ triple bond vs F₂ single bond'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-4.5_L3',
            skillId: 'PS1-4.5',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Two made-up molecules, A₂ and B₂, have bond energies of 200 kJ/mol and 600 kJ/mol. Which one sits in a deeper well of potential energy, and which is more stable?',
            type: 'two_tier',
            tier1Prompt: 'Choose the molecule in the deeper well:',
            tier1Options: [
              'B₂ sits in the deeper well, so B₂ is more stable than A₂.',
              'A₂ sits in the deeper well, because a smaller bond energy means a deeper well.',
              'Both sit in wells of the same depth, because both are made of two identical atoms.',
              'A₂ is more stable, because it takes less energy to break apart.'
            ],
            correctTier1: 0,
            tier2Prompt: 'Which reason supports your answer?',
            tier2Options: [
              'The bond energy is the depth of the well, so B₂ needs 600 kJ/mol to climb out.',
              'Molecules with weaker bonds hold less energy, so they resist reacting more.',
              'Wells of potential energy apply only to ionic solids, not to molecules.',
              'Bond energy measures how fast a molecule moves, not how deep its well is.'
            ],
            correctTier2: 0,
            hint: 'Separated atoms sit at 0. The bond energy is how far below 0 the bonded molecule sits.',
            workedSolution: 'Separated atoms sit at zero energy. Forming the bond drops the molecule into a well as deep as its bond energy. B₂ sits 600 kJ/mol down and A₂ sits 200 kJ/mol down. Climbing out of the deeper well takes more energy, so B₂ is more stable.',
            givenSummary: 'Bond energy as the depth of the well'
          };
        }
      ]
    },
    {
      id: 'PS1-4.6',
      title: 'The Transition State & Activation Barrier',
      subtitle: 'Model the unstable peak of a reaction profile and explain why even exothermic reactions need a push to start.',
      watchOut: 'A reaction can release plenty of energy (ΔH < 0) and still not start on its own, like a match in a drawer. Before new bonds can form, old bonds must stretch to the peak of the curve. That peak (the transition state) is a brief, high-energy arrangement where old bonds are partly broken and new ones are partly formed.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-4.6_diag',
          skillId: 'PS1-4.6',
          level: 'Level 2 (Intermediate)',
          stem: 'Burning a match is strongly exothermic (ΔH < 0), yet a match can sit in a drawer for years without catching fire. Why?',
          type: 'two_tier',
          tier1Prompt: 'What keeps the match from reacting at room temperature?',
          tier1Options: [
            'The reactant molecules do not have enough energy to climb the activation barrier (Ea).',
            'The reaction is endothermic until a flame turns it into an exothermic reaction.',
            'Oxygen cannot touch the match head until friction scrapes a protective skin away.',
            'The products sit higher in energy than the reactants until the match is struck.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Old bonds must stretch before new bonds can form, and room-temperature collisions fall short of that peak.',
            'Exothermic reactions have no activation barrier once the reactants are mixed with air.',
            'Friction adds new atoms to the match head that lower the energy of the products.',
            'Bonds in the match head release energy the instant they start to stretch.'
          ],
          correctTier2: 0,
          hint: 'Look at an exothermic energy profile: before the curve drops to the products, what does it have to climb over?',
          workedSolution: 'Even an exothermic reaction has an activation barrier (Ea). Before the atoms can snap into lower-energy product bonds, the reactant bonds must stretch to the peak (the transition state). At room temperature, collisions do not supply enough energy to reach that peak. Striking the match provides the heat needed to get the first molecules over the hill.',
          givenSummary: 'Why a match needs friction to start burning'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-4.6_diag2',
          skillId: 'PS1-4.6',
          level: 'Level 2 (Intermediate)',
          stem: 'A balloon of hydrogen and oxygen gas can sit for days without reacting. A single spark makes it explode, releasing a lot of energy (ΔH < 0). Why does it wait for the spark?',
          type: 'two_tier',
          tier1Prompt: 'What keeps the gas mixture from reacting at room temperature?',
          tier1Options: [
            'Collisions at room temperature do not have enough energy to climb the activation barrier (Ea).',
            'The reaction is endothermic until the spark turns it into an exothermic reaction.',
            'The products sit higher in energy than the reactants until the spark adds energy.',
            'Hydrogen and oxygen molecules cannot collide until the spark pushes them together.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'At the peak, H-H and O=O bonds are partly broken, and reaching it takes more energy than these collisions bring.',
            'Exothermic reactions have no barrier, so the spark only speeds up a reaction that is already running.',
            'The spark adds new atoms to the balloon that lower the energy of the products.',
            'The bonds release their energy the moment the spark stretches them, so no climb is needed.'
          ],
          correctTier2: 0,
          hint: 'Picture an exothermic energy profile. Before the curve drops to the products, what does it climb over?',
          workedSolution: 'Even an exothermic reaction has an activation barrier (Ea). Before the O-H bonds of water can form, the H-H and O=O bonds must stretch to the peak (the transition state). Room-temperature collisions do not bring enough energy to get there. The spark heats a few molecules over the hill, and the energy they release pushes the next ones over.',
          givenSummary: 'Why a hydrogen-oxygen balloon needs a spark'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-4.6_L1',
            skillId: 'PS1-4.6',
            level: 'Level 1 (Foundational)',
            stem: 'Sort each description by whether it matches a collision that crosses the activation barrier or one that falls short.',
            type: 'categorize',
            categories: [
              'Crosses the Barrier (Reaction Occurs)',
              'Falls Short of the Barrier (No Reaction)'
            ],
            items: [
              { label: 'Collision energy is greater than Ea, so old bonds stretch to the peak and new bonds form', correctCategoryIndex: 0 },
              { label: 'Collision energy is less than Ea, so the molecules bounce apart unchanged', correctCategoryIndex: 1 },
              { label: 'A match sits in a cool drawer where collisions cannot reach the transition state', correctCategoryIndex: 1 },
              { label: 'A spark gives H₂ and O₂ molecules enough energy to climb over the peak into H₂O', correctCategoryIndex: 0 },
              { label: 'Molecules gently bump at low temperature and slide back down to the reactant level', correctCategoryIndex: 1 }
            ],
            hint: 'Compare the energy of the colliding molecules with the height of the hill (Ea).',
            workedSolution: 'To react, colliding molecules need at least the activation energy (Ea) so their bonds can stretch to the transition state at the peak. With less energy than Ea, the molecules cannot reach the peak and bounce apart as reactants.',
            givenSummary: 'Sorting collisions against the activation barrier'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-4.6_L3',
            skillId: 'PS1-4.6',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Which statements describe the arrangement at the peak of an energy profile (the transition state)? (Select ALL that apply)',
            type: 'multi_select',
            options: [
              'It is the highest-energy point along the path from reactants to products.',
              'Old bonds are partly broken while new bonds are partly formed.',
              'It does not last, so it cannot be collected in a bottle like a product.',
              'It has less energy than both the reactants and the products.',
              'Colliding molecules supply the energy needed to reach it.'
            ],
            correctIndices: [0, 1, 2, 4],
            hint: 'The transition state sits at the very top of the hill. Are its bonds whole, or halfway?',
            workedSolution: 'The transition state is the top of the hill, the highest-energy arrangement on the path. Colliding molecules supply the energy to reach it. Old bonds are partly broken and new ones partly formed, so it lasts only an instant and cannot be collected. It has more energy than the reactants or products, not less.',
            givenSummary: 'What the transition state is'
          };
        }
      ]
    }
  ];

  window.PE_DATA_HS_PS1_4 = {
    info: PE_INFO,
    skills: SKILLS
  };
})();
