/**
 * HS-PS2-6: Structure-Property Relationships & Scientific Argumentation
 * Items from Support Pack v.26-27 R2, rewritten (Oct 2026) to the Tier 3 register in
 * docs/textbook/VOICE.md and to the scope of lesson 2-6a: straight vs kinked chains, packing,
 * dispersion forces, melting point, the five-link argument, and GHS hazards.
 * Items that compare chain shapes carry a `figure` built with ../pe-figures.js.
 * Zero em-dash compliant: hyphens, colons, and parentheses only.
 */
(function() {
  'use strict';

  const { svg, label, fattyChain } = window.PE_FIGURES;

  // 17 bonds after the COOH carbon: an 18-carbon chain. The C9=C10 double bond is bond 8.
  const STRAIGHT = { bonds: 17 };
  const CIS = { bonds: 17, kinkAt: 9, kink: 38, doubleAt: 8 };
  const TRANS = { bonds: 17, doubleAt: 8 };

  const FIG_STEARIC_OLEIC = svg(560, 220,
    'Line drawings of two 18-carbon chains. Stearic acid is a straight zigzag with only single bonds. Oleic acid has one cis double bond in the middle that bends the chain.',
    label(60, 30, 'Stearic acid (saturated)', true, 'start') + fattyChain(120, 66, STRAIGHT) +
    label(60, 120, 'Oleic acid (one cis double bond)', true, 'start') + fattyChain(120, 150, CIS));

  const FIG_THREE_CHAINS = svg(560, 300,
    'Line drawings of three 18-carbon chains. Stearic acid is straight with only single bonds. Oleic acid has a cis double bond that bends the chain. Elaidic acid has a trans double bond in the same place, and its chain stays nearly straight.',
    label(60, 30, 'Stearic acid (saturated)', true, 'start') + fattyChain(120, 64, STRAIGHT) +
    label(60, 116, 'Oleic acid (cis double bond)', true, 'start') + fattyChain(120, 146, CIS) +
    label(60, 222, 'Elaidic acid (trans double bond)', true, 'start') + fattyChain(120, 256, TRANS));

  const FIG_PALMITIC_PALMITOLEIC = svg(560, 220,
    'Line drawings of two 16-carbon chains. Palmitic acid is a straight zigzag with only single bonds. Palmitoleic acid has one cis double bond partway along that bends the chain.',
    label(60, 30, 'Palmitic acid (saturated)', true, 'start') + fattyChain(120, 66, { bonds: 15 }) +
    label(60, 120, 'Palmitoleic acid (one cis double bond)', true, 'start') + fattyChain(120, 150, { bonds: 15, kinkAt: 9, kink: 38, doubleAt: 8 }));

  const FIG_LAURIC_STEARIC = svg(560, 220,
    'Line drawings of two straight saturated chains. Lauric acid has 12 carbons. Stearic acid has 18 carbons, so its chain is half again as long.',
    label(60, 30, 'Lauric acid (12 carbons, saturated)', true, 'start') + fattyChain(120, 66, { bonds: 11 }) +
    label(60, 120, 'Stearic acid (18 carbons, saturated)', true, 'start') + fattyChain(120, 150, STRAIGHT));

  const PE_INFO = {
    id: 'HS-PS2-6',
    code: 'PS2-6',
    title: 'Structure-Property Relationships & Scientific Argumentation',
    unit: 'Unit 2: Intermolecular Forces & Bulk Properties',
    description: 'Communicate scientific and technical information about why the molecular-level structure is important in the functioning of designed materials.',
    clarification: 'Emphasis is on the attractive and repulsive forces that determine the functioning of the material. Examples include connecting straight vs. kinked fatty acid chains to packing density, London dispersion forces, melting points, food science performance, and chemical safety hazards.',
    assessmentBoundary: 'Assessment is limited to provided molecular structures of specific designed materials.'
  };

  const SKILLS = [
    {
      id: 'PS2-6.1',
      title: 'Fatty Acid Shape & Packing',
      subtitle: 'Link saturated and unsaturated chains to straight and kinked shapes, and to how closely they pack.',
      watchOut: 'A cis double bond puts a kink in the chain, and kinked chains cannot line up closely. A saturated chain has only single bonds, stays straight, and packs tightly in neat rows. Both chains can have 18 carbons; the shape is what differs.',
      diagnostic: function(rng) {
        return {
          id: 'PS2-6.1_diag',
          skillId: 'PS2-6.1',
          level: 'Diagnostic',
          stem: 'The figure shows two 18-carbon fatty acids. Stearic acid has only single bonds. Oleic acid has one cis double bond in the middle of its chain.',
          figure: FIG_STEARIC_OLEIC,
          type: 'two_tier',
          tier1Prompt: 'How do their shapes and packing compare in the solid?',
          tier1Options: [
            'Stearic acid is straight and packs closely; oleic acid is kinked and leaves gaps between chains.',
            'Oleic acid packs more closely, because its double bond pulls neighboring chains inward.',
            'Both pack the same way, because both have 18 carbons in their chains.',
            'Stearic acid cannot pack at all, because its single bonds keep twisting out of line.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'The cis double bond bends the chain, so neighboring molecules cannot line up closely.',
            'Single bonds form ionic attractions that lock neighboring chains into a crystal.',
            'Double bonds give the chain an electric charge that pushes other chains away.',
            'Double bonds are longer than single bonds, so they push neighboring chains apart.'
          ],
          correctTier2: 0,
          hint: 'Look at the figure. Which chain could you stack neatly next to a copy of itself?',
          workedSolution: 'Stearic acid has only single bonds, so its chain stays a straight zigzag. Straight chains line up side by side with little empty space. Oleic acid\'s cis double bond bends the chain partway along. Kinked chains cannot get close to each other, so they pack with gaps.',
          givenSummary: 'Stearic vs oleic acid: shape and packing'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS2-6.1_diag2',
          skillId: 'PS2-6.1',
          level: 'Level 2 (Intermediate)',
          stem: 'The figure shows two 16-carbon fatty acids. Palmitic acid has only single bonds. Palmitoleic acid has one cis double bond partway along its chain.',
          figure: FIG_PALMITIC_PALMITOLEIC,
          type: 'two_tier',
          tier1Prompt: 'How do their shapes and packing compare in the solid?',
          tier1Options: [
            'Palmitic acid is straight and packs closely; palmitoleic acid is bent and leaves gaps.',
            'Palmitoleic acid packs more closely, because its bend lets chains nest inside each other.',
            'Both pack the same way, because both chains have 16 carbons and almost the same mass.',
            'Palmitic acid packs loosely, because single bonds let its chain flop around.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'A cis double bond locks a bend into the chain, so neighbors cannot lie flat against it.',
            'Single bonds carry extra hydrogen atoms that hook neighboring chains together.',
            'A double bond gives the chain a charge that pushes the chains around it away.',
            'Bent chains are shorter, so they slide past each other into tighter rows.'
          ],
          correctTier2: 0,
          hint: 'Look at the figure. Which chain could lie flat against a copy of itself all the way along?',
          workedSolution: 'Palmitic acid has only single bonds, so its chain stays a straight zigzag. Straight chains line up side by side with little empty space. The cis double bond in palmitoleic acid locks a bend into the chain. Bent chains bump into each other at the kink, so they pack loosely with gaps between them.',
          givenSummary: 'Palmitic vs palmitoleic acid: shape and packing'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS2-6.1_L1',
            skillId: 'PS2-6.1',
            level: 'Level 1 (Routine)',
            stem: 'Sort each description as a saturated fatty acid or an unsaturated fatty acid.',
            type: 'categorize',
            categories: ['Saturated Fatty Acid', 'Unsaturated Fatty Acid'],
            items: [
              { label: 'The chain has only single C-C bonds and as many H atoms as it can hold', correctCategoryIndex: 0 },
              { label: 'The chain has one or more cis double bonds (C=C)', correctCategoryIndex: 1 },
              { label: 'The chain is straight, so molecules stack neatly side by side', correctCategoryIndex: 0 },
              { label: 'A kink in the chain leaves gaps between neighboring molecules', correctCategoryIndex: 1 }
            ],
            hint: 'Saturated means "full of hydrogen": all single bonds, straight chain. Unsaturated means at least one double bond, which kinks the chain.',
            workedSolution: 'Saturated fatty acids have only single bonds and the most H atoms possible, so their chains are straight and pack tightly. Unsaturated fatty acids have at least one C=C double bond. A cis double bond kinks the chain, which stops tight packing.',
            givenSummary: 'Sorting saturated and unsaturated descriptions'
          };
        },
        function level2(rng) {
          return {
            id: 'PS2-6.1_L2',
            skillId: 'PS2-6.1',
            level: 'Level 2 (Application)',
            stem: 'Some processed foods contain trans fats, such as elaidic acid. It has a double bond in the same place as oleic acid, but in the trans arrangement. Compare the three chains in the figure. How does elaidic acid pack?',
            figure: FIG_THREE_CHAINS,
            type: 'mcq',
            options: [
              'Its chain stays nearly straight, so it packs tightly like stearic acid and stays solid at room temperature.',
              'Its chain bends into a hairpin, so it packs even more loosely than oleic acid and stays liquid.',
              'Its double bond turns into an alcohol group, so the fat dissolves easily in water.',
              'Its chain has no attractions to its neighbors at all, so the fat turns into a gas.'
            ],
            correctIndex: 0,
            hint: 'Look at the figure. Which chain does the trans chain look more like?',
            workedSolution: 'A trans double bond leaves the chain nearly straight, like a saturated chain. Elaidic acid has no kink, so its chains pack tightly, like stearic acid. That gives it a high melting point, so trans fats stay solid at room temperature.',
            givenSummary: 'Trans fat shape and packing'
          };
        }
      ]
    },
    {
      id: 'PS2-6.2',
      title: 'London Dispersion Forces in Fats and Oils',
      subtitle: 'Explain how chain length and packing decide the total strength of the dispersion forces between chains.',
      watchOut: 'Dispersion forces are strong only when molecules are close. Straight chains touch along their whole length, so the small attractions add up to a large total. A kink holds chains apart, and the total drops.',
      diagnostic: function(rng) {
        return {
          id: 'PS2-6.2_diag',
          skillId: 'PS2-6.2',
          level: 'Diagnostic',
          stem: 'Stearic acid and oleic acid both have 18 carbons and nonpolar chains (see the figure). Stearic acid takes more heat to melt than oleic acid.',
          figure: FIG_STEARIC_OLEIC,
          type: 'two_tier',
          tier1Prompt: 'Which force holds these chains together, and how do the strengths compare?',
          tier1Options: [
            'Both use dispersion forces; straight stearic chains sit closer, so their total attraction is stronger.',
            'Stearic acid uses hydrogen bonding, while oleic acid is held together by ionic attractions.',
            'Both have the same dispersion forces, because both contain the same number of carbon atoms.',
            'Oleic acid has stronger attractions, because its double bond makes the molecule polar.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Dispersion forces weaken quickly with distance, so chains that sit closer attract each other far more.',
            'Dispersion forces depend only on the mass of the molecule, not on how close the molecules sit.',
            'The double bond makes a magnetic field that pushes the neighboring chains apart.',
            'The H atoms on saturated chains form covalent bonds with the chains next to them.'
          ],
          correctTier2: 0,
          hint: 'Nonpolar chains attract each other by London dispersion forces. How close can each kind of chain get to its neighbors?',
          workedSolution: 'Both chains are nonpolar, so dispersion forces hold them together. These forces are strong only at close range. Straight stearic chains lie side by side along all 18 carbons, so the attractions add up to a large total. Oleic acid\'s kink holds the chains apart, so its total attraction is weaker, and it melts at a lower temperature.',
          givenSummary: 'Dispersion forces and packing in fats'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS2-6.2_diag2',
          skillId: 'PS2-6.2',
          level: 'Level 2 (Intermediate)',
          stem: 'Lauric acid (12 carbons) and stearic acid (18 carbons) are both saturated, with straight nonpolar chains (see the figure). Stearic acid takes more heat to melt.',
          figure: FIG_LAURIC_STEARIC,
          type: 'two_tier',
          tier1Prompt: 'Which force holds these chains together, and how do the strengths compare?',
          tier1Options: [
            'Both use dispersion forces; longer stearic chains touch along more length, so their total is stronger.',
            'Stearic acid uses hydrogen bonds along its chain, while lauric acid uses only dispersion forces.',
            'Both have the same dispersion forces, because both chains are straight and saturated.',
            'Lauric acid has stronger attractions, because shorter chains always pack more tightly.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Each pair of touching chain segments adds a small attraction, so a longer contact adds up to more.',
            'Dispersion forces depend only on whether a chain is straight, not on how long it is.',
            'Longer chains hold a charge at each end that pulls the next chain toward them.',
            'Longer chains form covalent bonds with their neighbors at every carbon atom.'
          ],
          correctTier2: 0,
          hint: 'Both chains are straight, so packing is the same. What is different about how much of each chain touches its neighbor?',
          workedSolution: 'Both chains are nonpolar and straight, so dispersion forces hold them together and both pack tightly. The difference is length. Each stretch of chain that lies against a neighbor adds a small attraction. Stearic chains are 6 carbons longer, so they touch along more length, and the total attraction is larger. That is why stearic acid needs more heat to melt.',
          givenSummary: 'Lauric vs stearic acid: chain length and dispersion forces'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS2-6.2_L1',
            skillId: 'PS2-6.2',
            level: 'Level 1 (Routine)',
            stem: 'Rank these fatty acids by the total strength of the dispersion forces between their chains, from weakest (1) to strongest (4).',
            type: 'ranking',
            rankingPrompt: 'Order from weakest dispersion forces (1) to strongest (4):',
            items: [
              'Linolenic acid: 18 carbons, 3 cis double bonds',
              'Oleic acid: 18 carbons, 1 cis double bond',
              'Lauric acid: 12 carbons, no double bonds',
              'Stearic acid: 18 carbons, no double bonds'
            ],
            correctOrder: [
              'Linolenic acid: 18 carbons, 3 cis double bonds',
              'Oleic acid: 18 carbons, 1 cis double bond',
              'Lauric acid: 12 carbons, no double bonds',
              'Stearic acid: 18 carbons, no double bonds'
            ],
            hint: 'Each cis double bond adds a kink. More kinks mean the chains sit farther apart. Among straight chains, a longer chain has more contact.',
            workedSolution: 'Linolenic acid has three kinks, so its chains sit farthest apart (weakest). Oleic acid has one kink. Lauric acid is straight and packs tightly, but its chain is only 12 carbons long. Stearic acid is straight and 18 carbons long, so it has the most contact (strongest).',
            givenSummary: 'Ranking fatty acids by dispersion force strength'
          };
        },
        function level2(rng) {
          return {
            id: 'PS2-6.2_L2',
            skillId: 'PS2-6.2',
            level: 'Level 2 (Application)',
            stem: 'A food company wants a fat with stronger attractions between its chains, so it stays solid on a warm day. Which changes would help? (Select all that apply)',
            type: 'multi_select',
            options: [
              'Use chains with 18 carbons instead of 14 carbons.',
              'Turn the cis double bonds into single bonds, so the chains straighten out.',
              'Use chains with 3 cis double bonds instead of 1.',
              'Get the neighboring chains to sit closer together.'
            ],
            correctIndices: [0, 1, 3],
            hint: 'Longer chains have more contact. Straight chains sit closer. More kinks push chains apart.',
            workedSolution: 'Longer chains (18 carbons) touch along more of their length, so the attractions add up to more. Turning double bonds into single bonds removes the kinks, so the chains pack closer. Closer chains attract more strongly. Adding more cis double bonds adds kinks, which pushes chains apart and weakens the attraction.',
            givenSummary: 'Changes that strengthen attractions between chains'
          };
        }
      ]
    },
    {
      id: 'PS2-6.3',
      title: 'Melting Points & Physical States',
      subtitle: 'Predict melting points and whether a fat is solid or liquid at room temperature.',
      watchOut: 'Fats are solid at room temperature; oils are liquid. Melting pulls the molecules apart from each other; it does not break the covalent bonds inside them.',
      diagnostic: function(rng) {
        return {
          id: 'PS2-6.3_diag',
          skillId: 'PS2-6.3',
          level: 'Diagnostic',
          stem: 'Stearic acid melts at 69.6 °C. Oleic acid melts at 13.4 °C. Both sit on a lab bench at room temperature (22 °C).',
          type: 'two_tier',
          tier1Prompt: 'Is each one solid or liquid at 22 °C?',
          tier1Options: [
            'Stearic acid is solid (it melts at 70 °C); oleic acid is liquid (it melts at 13 °C).',
            'Both are liquids, because every 18-carbon fatty acid melts below room temperature.',
            'Stearic acid is liquid, and oleic acid is solid, at room temperature.',
            'Both are solids, because long nonpolar chains are always solid at 22 °C.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason explains the difference in melting point?',
          tier2Options: [
            'Stearic acid packs tightly, so its strong dispersion forces take more heat to overcome than kinked oleic acid.',
            'Oleic acid reacts with oxygen at room temperature, and breaks into gases that look like a liquid.',
            'Saturated fats soak up heat from the room, which keeps the fat around them cold and solid.',
            'Double bonds are weak, so the oleic acid molecules break into pieces and become a liquid.'
          ],
          correctTier2: 0,
          hint: 'If room temperature is below a substance\'s melting point, it is still solid. If it is above, the substance has melted.',
          workedSolution: 'Room temperature is 22 °C. That is below stearic acid\'s melting point (69.6 °C), so stearic acid is solid. It is above oleic acid\'s melting point (13.4 °C), so oleic acid has melted into a liquid. Tight packing gives stearic acid the stronger attractions and the higher melting point.',
          givenSummary: 'Stearic and oleic acid at room temperature'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS2-6.3_diag2',
          skillId: 'PS2-6.3',
          level: 'Level 2 (Intermediate)',
          stem: 'Palmitic acid melts at 62.9 °C. Linoleic acid, with two cis double bonds, melts at -5 °C. Both are stored in a fridge at 4 °C.',
          type: 'two_tier',
          tier1Prompt: 'Is each one solid or liquid at 4 °C?',
          tier1Options: [
            'Palmitic acid is solid; linoleic acid is still liquid at 4 °C.',
            'Both are solid, because a fridge is colder than room temperature.',
            'Palmitic acid is liquid, and linoleic acid is solid, at 4 °C.',
            'Both are liquid, because fatty acids with long chains melt below 4 °C.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason explains the difference in melting point?',
          tier2Options: [
            'Two kinks hold linoleic chains apart, so their weak dispersion forces give way even at -5 °C.',
            'Double bonds are weak, so linoleic acid molecules break into pieces in the cold.',
            'Cold air stiffens the double bonds, and stiff bonds keep linoleic acid runny.',
            'Palmitic acid soaks up cold from the fridge, which keeps it solid around the oil.'
          ],
          correctTier2: 0,
          hint: 'Compare 4 °C with each melting point. Below the melting point means solid. Above it means liquid.',
          workedSolution: 'The fridge is at 4 °C. That is below palmitic acid\'s melting point (62.9 °C), so it is solid. It is above linoleic acid\'s melting point (-5 °C), so linoleic acid is still liquid. Here is the trap: "cold" does not mean "solid." A substance is solid only below its own melting point. Two kinks keep linoleic chains far apart, so their attractions are weak.',
          givenSummary: 'Palmitic vs linoleic acid in a fridge'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS2-6.3_L1',
            skillId: 'PS2-6.3',
            level: 'Level 1 (Routine)',
            stem: 'Sort each fat or oil as solid or liquid at room temperature (22 °C).',
            type: 'categorize',
            categories: ['Solid Fat at 22 °C', 'Liquid Oil at 22 °C'],
            items: [
              { label: 'Beef fat (mostly saturated chains; melts at about 45 °C)', correctCategoryIndex: 0 },
              { label: 'Olive oil (mostly oleic acid; melts at about 6 °C)', correctCategoryIndex: 1 },
              { label: 'Vegetable shortening (double bonds turned into single bonds; melts at about 48 °C)', correctCategoryIndex: 0 },
              { label: 'Canola oil (mostly chains with double bonds; melts at about -10 °C)', correctCategoryIndex: 1 }
            ],
            hint: 'A melting point above 22 °C means it is still solid. A melting point below 22 °C means it has melted.',
            workedSolution: 'Beef fat (about 45 °C) and shortening (about 48 °C) melt above 22 °C, so they are solid fats. Olive oil (about 6 °C) and canola oil (about -10 °C) melt below 22 °C, so they are liquid oils.',
            givenSummary: 'Solid fat or liquid oil at room temperature'
          };
        },
        function level2(rng) {
          return {
            id: 'PS2-6.3_L2',
            skillId: 'PS2-6.3',
            level: 'Level 2 (Application)',
            stem: 'Three 18-carbon fatty acids melt at these temperatures: stearic acid (no double bonds) at 69.6 °C, oleic acid (1 cis double bond) at 13.4 °C, and linoleic acid (2 cis double bonds) at -5.0 °C. By how many degrees does the first cis double bond lower the melting point?',
            type: 'numeric',
            unit: '°C',
            correctValue: 56.2,
            tolerance: 0.3,
            hint: 'Compare stearic acid (no double bonds) with oleic acid (one double bond).',
            workedSolution: '69.6 °C - 13.4 °C = 56.2 °C. One cis double bond lowers the melting point by 56.2 degrees, because its kink stops the chains from packing closely.',
            givenSummary: 'How much one cis double bond lowers the melting point'
          };
        }
      ]
    },
    {
      id: 'PS2-6.4',
      title: 'The Five-Link Material Argument',
      subtitle: 'Build an argument that links a molecular feature to how a material works, and to its trade-offs.',
      watchOut: 'A strong argument connects five links in order: the molecular feature, the forces and packing, the property you can observe, what the material does, and the trade-off. A common slip is skipping straight from "it is solid" to "it works."',
      diagnostic: function(rng) {
        return {
          id: 'PS2-6.4_diag',
          skillId: 'PS2-6.4',
          level: 'Diagnostic',
          stem: 'A recipe for flaky pastry needs solid butter or shortening, not liquid vegetable oil.',
          type: 'two_tier',
          tier1Prompt: 'Which chain puts the five links of the argument in the right order?',
          tier1Options: [
            'Straight chains -> tight packing and strong dispersion forces -> solid fat -> holds layers apart -> flaky, but more saturated fat.',
            'Flaky texture -> health trade-off -> double bonds -> high boiling point -> loose packing of gas molecules.',
            'Solid fat -> dissolves in water -> pastry flavor -> ionic crystal -> costs more to buy.',
            'Saturated fat -> traps air pockets -> runny liquid -> kinked chains -> molecules moving at random.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why does the argument need all five links in this order?',
          tier2Options: [
            'Each link causes the next, from molecular structure to forces, properties, function, and trade-offs.',
            'Arguments in science must be about food products, not about lab chemicals.',
            'A trade-off only appears when a solid fat is heated past the boiling point of water.',
            'Cause-and-effect chains only work for living cells, not for food materials.'
          ],
          correctTier2: 0,
          hint: 'Start with the shape of the molecule and end with what the baker gains and gives up.',
          workedSolution: 'Link 1: the chains are straight and saturated. Link 2: straight chains pack tightly, so dispersion forces are strong. Link 3: the fat is solid at room temperature. Link 4: solid fat holds the dough layers apart while they bake. Link 5: the pastry is flaky, but it has more saturated fat.',
          givenSummary: 'The five-link argument for pastry fat'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS2-6.4_diag2',
          skillId: 'PS2-6.4',
          level: 'Level 2 (Intermediate)',
          stem: 'Chocolate makers want a fat that stays solid in the wrapper but melts on your tongue. Cocoa butter does both.',
          type: 'two_tier',
          tier1Prompt: 'Which chain puts the five links of the argument in the right order?',
          tier1Options: [
            'Straight chains -> strong dispersion forces -> solid at room temperature -> melts in the mouth -> high in saturated fat.',
            'Melts in the mouth -> solid at room temperature -> straight chains -> strong dispersion forces -> high in saturated fat.',
            'Straight chains -> solid at room temperature -> strong dispersion forces -> melts in the mouth -> high in saturated fat.',
            'Kinked chains -> weak dispersion forces -> liquid at room temperature -> melts in the mouth -> low in saturated fat.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why does the trade-off belong at the end of the chain?',
          tier2Options: [
            'The same molecular feature that makes the fat work also causes the trade-off.',
            'The trade-off is a separate opinion, so it goes last where it cannot affect the argument.',
            'The trade-off is the least important link, so any order before it is fine.',
            'Every argument about food must end with health, because food is judged on health.'
          ],
          correctTier2: 0,
          hint: 'Start with the molecule and follow cause to effect. Ask what each link needs from the link before it.',
          workedSolution: 'Link 1: cocoa butter has mostly straight, saturated chains. Link 2: straight chains pack tightly, so dispersion forces are strong. Link 3: the fat is solid at room temperature but melts just below body temperature. Link 4: the bar stays solid in the wrapper and melts in your mouth. Link 5: the same straight saturated chains mean more saturated fat in your diet.',
          givenSummary: 'Five-link argument for cocoa butter in chocolate'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS2-6.4_L1',
            skillId: 'PS2-6.4',
            level: 'Level 1 (Routine)',
            stem: 'Put the five links of a material argument in order, from the molecule (1) to the trade-off (5).',
            type: 'ranking',
            rankingPrompt: 'Order from the molecule (1) to the trade-off (5):',
            items: [
              'The molecular feature (bonds, shape, straight or kinked chains)',
              'The forces and packing between molecules (how close they sit)',
              'A property you can observe (melting point, hardness, runniness)',
              'What the material does (holds dough layers, coats a pan)',
              'The trade-off (better performance against cost or health)'
            ],
            correctOrder: [
              'The molecular feature (bonds, shape, straight or kinked chains)',
              'The forces and packing between molecules (how close they sit)',
              'A property you can observe (melting point, hardness, runniness)',
              'What the material does (holds dough layers, coats a pan)',
              'The trade-off (better performance against cost or health)'
            ],
            hint: 'Start with one molecule. Each link must be caused by the one before it.',
            workedSolution: 'The molecule\'s shape decides how closely molecules pack and how strong the forces are. Those forces decide properties like melting point. The properties decide what the material can do. Last, you weigh what it does against cost or health.',
            givenSummary: 'Ordering the five links of a material argument'
          };
        },
        function level2(rng) {
          return {
            id: 'PS2-6.4_L2',
            skillId: 'PS2-6.4',
            level: 'Level 2 (Application)',
            stem: 'A student writes: "Shortening makes tender cookies because it is a solid fat. It is solid because it has a high melting point." What is the main problem with this argument?',
            type: 'mcq',
            options: [
              'It goes in a circle: solid and high melting point are both observations, and neither explains the other.',
              'Shortening is a liquid at room temperature, so the first sentence of the argument is false.',
              'Cookies contain no fat molecules, because the flour soaks up the fat while they bake.',
              'Melting points cannot be measured in a school lab, so the argument cannot be checked.'
            ],
            correctIndex: 0,
            hint: 'Does the argument ever say why the fat is solid at the level of the molecules?',
            workedSolution: '"Solid" and "high melting point" say the same thing in two ways, so one cannot explain the other. The argument is missing the molecular cause: shortening\'s chains are straight, so they pack tightly and have strong dispersion forces. That is why it is solid.',
            givenSummary: 'Spotting a circular argument'
          };
        }
      ]
    },
    {
      id: 'PS2-6.5',
      title: 'Structure and Hazard (GHS)',
      subtitle: 'Use structure and attractions to explain GHS physical hazards, and say what structure cannot tell you.',
      watchOut: 'Structure and attractions between molecules explain physical hazards, such as how easily a liquid evaporates and catches fire. They cannot tell you how poisonous a chemical is. That takes testing.',
      diagnostic: function(rng) {
        return {
          id: 'PS2-6.5_diag',
          skillId: 'PS2-6.5',
          level: 'Diagnostic',
          stem: 'Acetone (C₃H₆O) carries the GHS flammable liquid pictogram. Glycerol (C₃H₈O₃) carries no flammability label at room temperature.',
          type: 'two_tier',
          tier1Prompt: 'How do their attractions explain the difference in hazard?',
          tier1Options: [
            'Acetone has weaker attractions, so it evaporates into vapor that can burn; glycerol hydrogen bonds strongly and barely evaporates.',
            'Acetone contains oxygen atoms that catch fire on their own when they touch the nitrogen in the air.',
            'Glycerol is made of ions, and ionic bonds stop it from ever becoming a gas.',
            'Acetone reacts with the oxygen in the air with no activation energy at room temperature.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What can a structure NOT tell you without testing?',
          tier2Options: [
            'A structure predicts physical hazards from attractions, but how poisonous a chemical is needs lab testing.',
            'A structure cannot tell you whether a molecule contains electrons or nuclei.',
            'A structure cannot tell you whether a substance is likely to be a liquid or a gas.',
            'Nothing: a molecule\'s place on the periodic table predicts every health effect exactly.'
          ],
          correctTier2: 0,
          hint: 'Glycerol has three O-H groups. What does that do to how easily it evaporates?',
          workedSolution: 'Acetone has a polar C=O group but no O-H, so its attractions are fairly weak. It evaporates quickly, and the vapor mixed with air can catch fire. Glycerol has three O-H groups, so it hydrogen bonds strongly and hardly evaporates at room temperature. Attractions predict these physical hazards, but how poisonous a chemical is has to be tested.',
          givenSummary: 'Acetone vs glycerol flammability, and the limits of structure'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS2-6.5_diag2',
          skillId: 'PS2-6.5',
          level: 'Level 2 (Intermediate)',
          stem: 'Hexane (C₆H₁₄) carries the GHS flammable liquid pictogram. Mineral oil, made of much longer hydrocarbon chains, carries no flammable liquid label.',
          type: 'two_tier',
          tier1Prompt: 'How do their attractions explain the difference in hazard?',
          tier1Options: [
            'Hexane has weaker dispersion forces, so it evaporates into vapor that can catch fire; mineral oil barely evaporates.',
            'Hexane contains oxygen atoms that catch fire on their own, and mineral oil has none.',
            'Mineral oil is made of ions, and ionic bonds stop it from ever becoming a gas.',
            'Hexane reacts with the oxygen in the air at room temperature with no activation energy.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Long exposure to hexane vapor can also damage nerves. Can its structure tell you that?',
          tier2Options: [
            'No. Structure explains physical hazards like evaporation, but poison effects need lab and health testing.',
            'Yes. Any molecule that evaporates quickly must also be poisonous to nerves.',
            'Yes. Nonpolar molecules always harm nerves, because nerve cells are coated in fat.',
            'No, because only ionic compounds can be poisonous to the human body.'
          ],
          correctTier2: 0,
          hint: 'Both are hydrocarbons with only dispersion forces. Which one has more chain to hold on with?',
          workedSolution: 'Both are nonpolar hydrocarbons, held together only by dispersion forces. Hexane chains are short, so the attractions are weak. Hexane evaporates fast, and its vapor mixed with air can catch fire. Mineral oil chains are much longer, so they hold each other tightly and barely evaporate at room temperature. Structure explains this physical hazard. It cannot tell you that hexane harms nerves; only testing showed that.',
          givenSummary: 'Hexane vs mineral oil: flammability and what structure cannot tell you'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS2-6.5_L1',
            skillId: 'PS2-6.5',
            level: 'Level 1 (Routine)',
            stem: 'Match each substance to its main GHS hazard.',
            type: 'categorize',
            categories: ['Flammable Liquid (Flame)', 'Corrosive to Metals & Skin (Corrosion)', 'Compressed Gas (Gas Cylinder)', 'Reacts with Water (Flame)'],
            items: [
              { label: 'Acetone (evaporates fast and catches fire easily)', correctCategoryIndex: 0 },
              { label: 'Concentrated hydrochloric acid (a strong acid with a lot of H⁺)', correctCategoryIndex: 1 },
              { label: 'Argon gas stored at 200 atmospheres in a steel tank', correctCategoryIndex: 2 },
              { label: 'Potassium metal (a Group 1 metal with one loosely held outer electron)', correctCategoryIndex: 3 }
            ],
            hint: 'Fast-evaporating liquids catch fire. Strong acids eat skin and metal. Gas under pressure needs a cylinder. Group 1 metals react hard with water.',
            workedSolution: 'Acetone is a flammable liquid. Concentrated HCl is corrosive to skin and metal. Argon under high pressure is a compressed gas. Potassium reacts with water, giving off hydrogen gas and heat, which can catch fire.',
            givenSummary: 'Matching substances to GHS hazards'
          };
        },
        function level2(rng) {
          return {
            id: 'PS2-6.5_L2',
            skillId: 'PS2-6.5',
            level: 'Level 2 (Application)',
            stem: 'A chemist designs a new product. Which question can NOT be answered just by looking at the molecule\'s structure on paper?',
            type: 'mcq',
            options: [
              'How much of the chemical it would take to poison a person.',
              'Whether the molecule is polar or nonpolar overall.',
              'Which attractions hold its molecules to each other.',
              'Whether it will likely boil at a higher temperature than water.'
            ],
            correctIndex: 0,
            hint: 'Structure tells you about polarity, attractions, and boiling point. What does it take to find out what a chemical does inside a body?',
            workedSolution: 'From the structure you can work out polarity, the attractions between molecules, and whether the boiling point is likely high or low. How poisonous a chemical is depends on what it does inside living cells. Only testing can show that.',
            givenSummary: 'What structure cannot tell you'
          };
        }
      ]
    }
  ];

  window.PE_DATA_HS_PS2_6 = {
    info: PE_INFO,
    skills: SKILLS
  };
})();
