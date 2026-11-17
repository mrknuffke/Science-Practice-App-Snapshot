/**
 * HS-PS1-5: Reaction Rates, Collision Theory & Catalysis
 * Items rewritten (Oct 2026) to the Tier 3 register in docs/textbook/VOICE.md and to the core scope
 * of lessons 4-1a and 4-1b: particles must collide hard enough (at or above the activation barrier)
 * and facing the right way; temperature raises how hard particles hit (so many more cross the barrier)
 * much more than how often they hit; concentration and surface area raise collision frequency;
 * a catalyst lowers the activation barrier without being used up or changing the energy released.
 * No orbitals, termolecular steps, rate-law equations, or adsorption jargon.
 * Zero em-dash compliant: hyphens, colons, and parentheses only.
 */
(function() {
  'use strict';

  // Calculation items pick their numbers per run (see ../pe-num.js).
  const { pick, fix } = window.PE_NUM;

  const PE_INFO = {
    id: 'HS-PS1-5',
    code: 'PS1-5',
    title: 'Reaction Rates, Collision Theory & Catalysis',
    unit: 'Unit 4: Kinetics & Equilibrium',
    description: 'Apply scientific principles and evidence to provide an explanation about the effects of changing the temperature or concentration of the reacting particles on the rate at which a reaction occurs.',
    clarification: 'Emphasis is on student reasoning that focuses on the number and energy of collisions between molecules.',
    assessmentBoundary: 'Assessment is limited to simple reactions in which there are only two reactants; evidence from temperature, concentration, and rate data; and qualitative relationships between rate and temperature.'
  };

  const SKILLS = [
    {
      id: 'PS1-5.1',
      title: 'Collision Theory: Energy & Orientation',
      subtitle: 'Explain why particles must collide with enough energy and facing the right way to react.',
      watchOut: 'Putting reactants in the same flask is not enough. The particles have to hit each other, and almost all collisions just bounce off because the particles either hit too softly (below the activation barrier) or hit with the wrong ends facing each other.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-5.1_diag',
          skillId: 'PS1-5.1',
          level: 'Level 2 (Intermediate)',
          stem: 'In a closed flask at 25 °C, NO and O₃ gas molecules collide billions of times each second, yet only a tiny fraction of those collisions make NO₂ and O₂.',
          type: 'two_tier',
          tier1Prompt: 'Why do most of the collisions fail to react?',
          tier1Options: [
            'Most collisions either hit with too little energy or hit with the wrong atoms facing each other.',
            'Most collisions happen too fast for the atoms to touch before they bounce apart.',
            'Gas molecules only react when they hit the glass walls of the flask at the same time.',
            'Like charges on the two gas molecules push them apart so they never touch.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What has to happen during a collision for the molecules to react?',
          tier2Options: [
            'The nitrogen end of NO must hit an oxygen atom of O₃ hard enough to cross the activation barrier.',
            'Both molecules must come to a complete stop so their atoms can settle into new bonds.',
            'The gases must first condense into liquid drops on the glass before any bonds can break.',
            'An electric spark must pass through the flask during every single collision.'
          ],
          correctTier2: 0,
          hint: 'A collision needs two things to work: enough kinetic energy to cross the activation barrier, and the right atoms hitting each other.',
          workedSolution: 'For NO + O₃ -> NO₂ + O₂, the nitrogen atom in NO has to form a new bond with an oxygen atom from O₃. If the oxygen end of NO hits instead, or if the molecules collide with less kinetic energy than the activation barrier (Ea), they just bounce apart unchanged.',
          givenSummary: 'Why most NO + O₃ collisions bounce off without reacting'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-5.1_diag2',
          skillId: 'PS1-5.1',
          level: 'Level 2 (Intermediate)',
          stem: 'Carbon monoxide (CO) and nitrogen dioxide (NO₂) gas collide constantly in a hot flask. Only a small fraction of the collisions make CO₂ and NO.',
          type: 'two_tier',
          tier1Prompt: 'Why do most of the collisions fail to react?',
          tier1Options: [
            'Most collisions are too gentle, or the wrong ends of the two molecules meet.',
            'Most collisions are too quick for any electrons to move between the molecules.',
            'Most molecules never collide at all, because gas particles are far apart.',
            'CO and NO₂ can react only after they first split into separate atoms.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What has to happen during a collision for the molecules to react?',
          tier2Options: [
            'The carbon end of CO must strike an oxygen atom of NO₂ with enough energy to cross the activation barrier.',
            'The two molecules must slow down and stop first, so the new bond has time to form.',
            'The molecules must line up in rows along the flask wall before any bond can change.',
            'Every collision must happen in the flame, because only a flame can break bonds.'
          ],
          correctTier2: 0,
          hint: 'A collision needs two things: enough energy to cross the activation barrier, and the right atoms meeting.',
          workedSolution: 'In CO + NO₂ -> CO₂ + NO, the carbon atom in CO must form a new bond with an oxygen atom from NO₂. If the oxygen end of CO hits instead, nothing changes. If the hit carries less energy than the activation barrier (Ea), the molecules bounce apart unchanged. Only collisions that pass both tests react.',
          givenSummary: 'Why most CO + NO₂ collisions bounce off without reacting'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-5.1_L1',
            skillId: 'PS1-5.1',
            level: 'Level 1 (Foundational)',
            stem: 'Which conditions are needed for a collision between two reactant molecules to make products? (Select ALL that apply)',
            type: 'multi_select',
            options: [
              'The colliding molecules must have at least enough kinetic energy to cross the activation barrier (Ea).',
              'The molecules must hit with the reacting atoms facing each other in the right orientation.',
              'The molecules must lose all of their mass and turn into heat upon impact.',
              'The collision must happen inside a liquid solvent rather than in a gas.',
              'The molecules must actually hit each other so old bonds can stretch and new bonds can form.'
            ],
            correctIndices: [0, 1, 4],
            hint: 'Think of the three requirements from Lesson 4-1a: collide, hit hard enough (at or above Ea), and face the right way.',
            workedSolution: 'To react, particles must collide, bring enough kinetic energy to reach the top of the activation barrier (Ea), and hit with the right atoms facing each other. Gas reactions need no liquid solvent, and mass is conserved.',
            givenSummary: 'Three conditions for an effective collision'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-5.1_L3',
            skillId: 'PS1-5.1',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Hydrogen gas (H₂) and oxygen gas (O₂) can sit mixed in a closed jar at 25 °C for years with no water forming, even though their reaction releases a large amount of energy. Why?',
            type: 'mcq',
            options: [
              'Strong H-H and O=O bonds create a high activation barrier that room-temperature collisions almost never cross.',
              'Hydrogen and oxygen molecules never collide at 25 °C because both are light gases.',
              'Making water from H₂ and O₂ is endothermic, so the reaction needs a steady supply of heat.',
              'Hydrogen and oxygen atoms are nonpolar, so they pass right through each other without bouncing.'
            ],
            correctIndex: 0,
            hint: 'At 25 °C the molecules collide billions of times a second. Why are those collisions too gentle to start the reaction?',
            workedSolution: 'Before water can form, the strong H-H and O=O bonds must start to break. That sets a high activation barrier (Ea). At 25 °C, the colliding molecules carry about 3.7 kJ/mol on average, far below the barrier, so they just bounce off.',
            givenSummary: 'Why H₂ and O₂ do not react at room temperature'
          };
        }
      ]
    },
    {
      id: 'PS1-5.2',
      title: 'Temperature & Reaction Rate',
      subtitle: 'Explain why warming a reaction speeds it up: particles move faster, hit slightly more often, and cross the barrier much more often.',
      watchOut: 'Warming a reaction does make particles collide a little more often, but that is the small part. The big change is that faster particles hit harder, so a much larger share of collisions has enough energy to cross the activation barrier (Ea).',
      diagnostic: function(rng) {
        return {
          id: 'PS1-5.2_diag',
          skillId: 'PS1-5.2',
          level: 'Level 2 (Intermediate)',
          stem: 'Warming a mixture from 15 °C to 80 °C makes the total number of collisions go up only a little, yet the reaction produces four to five times as much product in 10 seconds.',
          type: 'two_tier',
          tier1Prompt: 'What is the main reason the reaction speeds up so much?',
          tier1Options: [
            'A much larger fraction of collisions now hits hard enough to cross the activation barrier.',
            'The number of collisions per second goes up four to five times when the mixture is warmed.',
            'Warming the mixture lowers the activation barrier so weak collisions can react.',
            'Heat pushes the reactant molecules closer together by shrinking the container.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why does warming change the success of collisions so strongly?',
          tier2Options: [
            'At higher temperature, particles move faster on average, so many more collisions carry enough kinetic energy.',
            'At higher temperature, molecules no longer need to face the right way when they collide.',
            'Warming shrinks the atoms, so they can slip past each other without breaking any bonds.',
            'Heat turns covalent bonds into ionic bonds before the molecules ever collide.'
          ],
          correctTier2: 0,
          hint: 'Compare how often particles hit (collision count) with how hard they hit (how many reach Ea).',
          workedSolution: 'Warming raises the average kinetic energy of the particles. They move a bit faster, so they collide slightly more often. More importantly, they hit much harder, so four to five times as many collisions have enough energy to get over the activation barrier (Ea). The barrier itself does not move.',
          givenSummary: 'Why warming speeds up a reaction: harder hits cross Ea'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-5.2_diag2',
          skillId: 'PS1-5.2',
          level: 'Level 2 (Intermediate)',
          stem: 'A reaction takes 120 s to finish at 20 °C and 60 s at 30 °C. Warming by 10 °C raises the number of collisions by only about 2%.',
          type: 'two_tier',
          tier1Prompt: 'What is the main reason the reaction finishes in half the time?',
          tier1Options: [
            'Many more of the collisions now carry enough energy to cross the activation barrier.',
            'Collisions happen twice as often, because the particles move twice as fast.',
            'Warming lowers the activation barrier, so softer collisions can now react.',
            'Warming adds extra reactant particles to the mixture in the flask.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why does warming change the success of collisions so strongly?',
          tier2Options: [
            'At 30 °C, particles have a higher average kinetic energy, so a larger share of hits reach Ea.',
            'At 30 °C, particles move twice as fast as at 20 °C, so they hit twice as often.',
            'At 30 °C, molecules no longer need to face the right way when they collide.',
            'Heat breaks some bonds before the molecules collide, so fewer bonds are left to break.'
          ],
          correctTier2: 0,
          hint: 'The collision count rose by only 2%, but the rate doubled. What else about the collisions changed?',
          workedSolution: 'A 2% rise in collisions cannot double the rate. Warming raises the average kinetic energy of the particles, so they hit harder. A much larger share of collisions now has enough energy to get over the activation barrier (Ea). Here is the common slip: 30 °C is not twice as hot as 20 °C, and particles do not move twice as fast. The barrier itself does not move.',
          givenSummary: 'Why a 10 °C rise doubles a rate: harder hits cross Ea'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-5.2_L1',
            skillId: 'PS1-5.2',
            level: 'Level 1 (Foundational)',
            stem: 'A glow stick glows brightly in a cup of hot water, but grows dim in ice water. Why?',
            type: 'mcq',
            options: [
              'Hot water speeds up the reactant molecules, so more collisions have enough energy to cross the barrier.',
              'Hot water leaks through the plastic tube and acts as a catalyst inside the glow stick.',
              'Ice water breaks down the dye molecules inside the tube so they can never glow again.',
              'Ice water raises the activation barrier of the reaction until all collisions stop.'
            ],
            correctIndex: 0,
            hint: 'How does water temperature change the speed and kinetic energy of the molecules inside the glow stick?',
            workedSolution: 'Hot water warms the reactants inside the tube, raising their average kinetic energy. More collisions cross the activation barrier each second, so the light-producing reaction runs faster. In ice water, fewer collisions reach the barrier, so the reaction slows down and the glow dims.',
            givenSummary: 'Glow stick in hot water vs ice water'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-5.2_L3',
            skillId: 'PS1-5.2',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Order these four flasks from SLOWEST reaction rate (1) to FASTEST reaction rate (4):',
            type: 'ranking',
            rankingPrompt: 'Order from slowest reaction rate (1) to fastest reaction rate (4):',
            items: [
              'Flask A: 10 °C, high activation barrier (Ea = 85 kJ/mol)',
              'Flask B: 30 °C, high activation barrier (Ea = 85 kJ/mol)',
              'Flask C: 30 °C, lower activation barrier (Ea = 45 kJ/mol)',
              'Flask D: 60 °C, lower activation barrier (Ea = 45 kJ/mol)'
            ],
            correctOrder: [
              'Flask A: 10 °C, high activation barrier (Ea = 85 kJ/mol)',
              'Flask B: 30 °C, high activation barrier (Ea = 85 kJ/mol)',
              'Flask C: 30 °C, lower activation barrier (Ea = 45 kJ/mol)',
              'Flask D: 60 °C, lower activation barrier (Ea = 45 kJ/mol)'
            ],
            hint: 'A higher temperature gives particles more kinetic energy; a lower barrier means particles need less energy to react.',
            workedSolution: 'Flask A is coldest and has the highest barrier, so the fewest collisions succeed (slowest). Warming to 30 °C in Flask B helps more collisions cross that 85 kJ/mol barrier. Lowering the barrier to 45 kJ/mol at 30 °C in Flask C lets many more collisions succeed. Warming to 60 °C with the 45 kJ/mol barrier in Flask D is fastest.',
            givenSummary: 'Ranking reaction rates by temperature and activation barrier'
          };
        }
      ]
    },
    {
      id: 'PS1-5.3',
      title: 'Concentration & Pressure: Crowding Particles',
      subtitle: 'Explain how crowding more particles into the same space increases collision frequency and reaction rate.',
      watchOut: 'Raising concentration (or squeezing a gas into a smaller volume) packs more particles into the same space, so they bump into each other more often. At a fixed temperature, it does NOT make the particles move faster.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-5.3_diag',
          skillId: 'PS1-5.3',
          level: 'Level 2 (Intermediate)',
          stem: 'Doubling the concentration of hydrochloric acid at 25 °C doubles how fast hydrogen gas bubbles off a piece of zinc.',
          type: 'two_tier',
          tier1Prompt: 'What changed at the particle level when the acid concentration was doubled?',
          tier1Options: [
            'Acid ions hit the zinc surface twice as often each second.',
            'Each acid ion moved twice as fast through the water at 25 °C.',
            'The activation barrier for the reaction dropped to half its old height.',
            'The acid solution warmed up by 25 °C before touching the zinc.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why did doubling the concentration have that effect?',
          tier2Options: [
            'Twice as many acid ions are packed into the same volume, leaving less space between particles.',
            'More concentrated acid weakens the bonds inside the zinc metal before any collisions happen.',
            'Crowded ions push each other to higher speeds even when the temperature stays the same.',
            'Concentrated solutions pull heat in from the room air to speed the ions up.'
          ],
          correctTier2: 0,
          hint: 'Temperature stayed at 25 °C, so particle speed did not change. What happens when you pack twice as many particles into the same volume?',
          workedSolution: 'Doubling the concentration puts twice as many H⁺ ions into the same volume of liquid. With half the distance between ions and the zinc surface, collisions happen twice as often each second. Because the temperature is still 25 °C, the average speed of each ion and the activation barrier stay the same.',
          givenSummary: 'Why doubling acid concentration doubles the reaction rate'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-5.3_diag2',
          skillId: 'PS1-5.3',
          level: 'Level 2 (Intermediate)',
          stem: 'Bleach fades a drop of blue food dye. With twice as much bleach in the same volume of water at 22 °C, the dye fades twice as fast.',
          type: 'two_tier',
          tier1Prompt: 'What changed at the particle level when the bleach concentration was doubled?',
          tier1Options: [
            'Bleach particles hit dye molecules twice as often each second.',
            'Each bleach particle moved twice as fast through the water.',
            'The dye molecules needed half as much energy to react.',
            'The extra bleach warmed the water before the dye reacted.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why did doubling the concentration have that effect?',
          tier2Options: [
            'Twice as many bleach particles share the same volume, so each dye molecule meets one more often.',
            'Crowded particles bump each other up to higher speeds, even when the temperature stays the same.',
            'Concentrated bleach weakens the bonds in the dye before any collisions happen.',
            'A stronger solution lowers the activation barrier of every reaction it takes part in.'
          ],
          correctTier2: 0,
          hint: 'The temperature stayed at 22 °C, so particle speed did not change. What does packing more particles into the same volume do?',
          workedSolution: 'Doubling the concentration puts twice as many bleach particles into the same volume of water. Each dye molecule now meets a bleach particle twice as often, so collisions per second double. The temperature is still 22 °C, so the particles move at the same average speed, and the activation barrier stays the same.',
          givenSummary: 'Why doubling bleach concentration doubles the fading rate'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-5.3_L1',
            skillId: 'PS1-5.3',
            level: 'Level 1 (Foundational)',
            stem: 'A gas reacts inside a syringe at constant temperature: 2 NO₂(g) -> N₂O₄(g). You push the plunger in to cut the volume in half. What happens to the reaction rate?',
            type: 'mcq',
            options: [
              'It speeds up, because packing the gas into half the volume crowds the molecules so they collide more often.',
              'It slows down, because squeezing the gas leaves the molecules no room to move.',
              'It stays the same, because the total number of NO₂ molecules in the syringe did not change.',
              'It stops, because pushing the plunger in takes away the molecules\' kinetic energy.'
            ],
            correctIndex: 0,
            hint: 'Cutting the volume of a gas in half packs the same molecules into half the space. How does that affect how often they collide?',
            workedSolution: 'Pushing the plunger to half the volume doubles the concentration of the gas molecules. Packed closer together at the same temperature, they collide much more often each second, so the reaction speeds up.',
            givenSummary: 'Compressing a gas in a syringe speeds up collisions'
          };
        },
        function level3(rng) {
          const R = pick(rng, [{ r: 15, k: 3 }, { r: 12, k: 2 }, { r: 20, k: 3 }, { r: 18, k: 2 }]);
          const word = R.k === 2 ? 'double' : 'triple', times = R.k === 2 ? 'twice' : 'three times';
          return {
            id: 'PS1-5.3_L3',
            skillId: 'PS1-5.3',
            level: 'Level 3 (Mastery Challenge)',
            stem: `In a collision simulation at 25 °C, a box with 20 particles of A and 20 particles of B produces ${R.r} reactions in 10 seconds. If you ${word} the concentration of A (to ${20 * R.k} particles) in the same box at 25 °C, how many reactions will occur in 10 seconds?`,
            type: 'numeric',
            inputPrompt: 'Expected reactions in 10 seconds:',
            correctValue: R.r * R.k,
            tolerance: 1,
            unit: 'reactions',
            hint: `With ${times} as many A particles in the same box at the same temperature, B particles hit an A particle ${times} as often.`,
            workedSolution: `Putting ${times} as many A particles in the same volume makes A-B collisions happen ${times} as often. At the same temperature, the same share of collisions crosses the barrier, so the number of reactions goes up by the same factor: ${R.k} x ${R.r} = ${R.r * R.k} reactions.`,
            givenSummary: 'More reactant particles, more collisions'
          };
        }
      ]
    },
    {
      id: 'PS1-5.4',
      title: 'Surface Area & Solid Reactants',
      subtitle: 'Explain why crushing a solid into smaller pieces exposes more particles to collisions and speeds up a reaction.',
      watchOut: 'Crushing a solid lump into powder exposes many more surface atoms to collide at once. It does not change the temperature, the activation barrier, or the total amount of solid.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-5.4_diag',
          skillId: 'PS1-5.4',
          level: 'Level 2 (Intermediate)',
          stem: 'A 5.0 g marble chip (solid CaCO₃) fizzes slowly in dilute acid. A 5.0 g pile of marble powder in the same acid fizzes away in a few seconds.',
          type: 'two_tier',
          tier1Prompt: 'Why does the marble powder react so much faster than the single chip?',
          tier1Options: [
            'The powder exposes a much larger surface area of CaCO₃ to collide with the acid.',
            'Grinding the marble into powder lowers the activation barrier of the reaction.',
            '5.0 g of marble powder contains more moles of CaCO₃ than a 5.0 g chip.',
            'Crushing the marble heats the acid up by creating static electricity.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What is happening at the particle level?',
          tier2Options: [
            'In a solid chip, atoms trapped on the inside cannot be hit by acid ions until the outer layer reacts.',
            'Powdered particles do not need any activation energy when they collide with acid ions.',
            'Solid CaCO₃ ions swim through the water much faster once the chip is crushed.',
            'Grinding breaks the chemical bonds inside carbonate ions and turns them into a gas.'
          ],
          correctTier2: 0,
          hint: 'In a solid lump, where are the only atoms that acid ions can actually touch?',
          workedSolution: 'Acid ions can only collide with CaCO₃ particles sitting on the outside surface of the solid. In a single chip, most of the CaCO₃ is buried inside where acid cannot reach it yet. Crushing the chip into powder puts millions of those inside particles on the surface at once, so collisions per second jump.',
          givenSummary: 'Marble chip vs marble powder: surface area and collisions'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-5.4_diag2',
          skillId: 'PS1-5.4',
          level: 'Level 2 (Intermediate)',
          stem: 'You drop a whole antacid tablet into one glass of water and the same tablet, crushed to powder, into another. The powder fizzes away in a quarter of the time.',
          type: 'two_tier',
          tier1Prompt: 'Why does the crushed tablet react so much faster?',
          tier1Options: [
            'Crushing exposes much more of the tablet to collisions with the water.',
            'Crushing lowers the activation barrier for the reaction in the tablet.',
            'The crushed tablet holds more moles of reactant than the whole one.',
            'Crushing warms the tablet, so its particles move faster in the water.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What is happening at the particle level?',
          tier2Options: [
            'Only particles on the outside of a solid can be hit, and crushing moves inside particles to the surface.',
            'Small pieces need no activation energy, because their bonds are already partly broken.',
            'Crushed particles swim through the water faster than the particles of a whole tablet.',
            'Crushing breaks the bonds inside the tablet, so the gas is already made before it hits the water.'
          ],
          correctTier2: 0,
          hint: 'In a whole tablet, which particles can the water actually touch?',
          workedSolution: 'Water can only reach the particles on the outside surface of the tablet. In a whole tablet, most of the reactant is buried inside and waits its turn. Crushing it puts many of those inside particles on the surface at once, so more collisions happen each second. The mass, the temperature, and the activation barrier stay the same.',
          givenSummary: 'Whole vs crushed antacid tablet: surface area and collisions'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-5.4_L1',
            skillId: 'PS1-5.4',
            level: 'Level 1 (Foundational)',
            stem: 'Sort each change by whether it speeds up a reaction by increasing surface area or not:',
            type: 'categorize',
            categories: [
              'Increases surface area',
              'Does not change surface area'
            ],
            items: [
              { label: 'Crushing a solid antacid tablet into powder before dropping it in water', correctCategoryIndex: 0 },
              { label: 'Warming a clear solution of dissolved reactants from 20 °C to 40 °C', correctCategoryIndex: 1 },
              { label: 'Using fine steel wool instead of a thick iron nail in air', correctCategoryIndex: 0 },
              { label: 'Adding more water to dilute an acid solution', correctCategoryIndex: 1 },
              { label: 'Spraying liquid fuel as a fine mist of tiny droplets into air', correctCategoryIndex: 0 }
            ],
            hint: 'Surface area goes up when a solid lump or liquid stream is broken into smaller pieces or droplets.',
            workedSolution: 'Crushing a tablet, shredding iron into steel wool, and spraying liquid fuel into tiny droplets all break one piece into many smaller ones with much more exposed surface. Warming changes particle speed, and diluting changes concentration.',
            givenSummary: 'Sorting changes that increase surface area'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-5.4_L3',
            skillId: 'PS1-5.4',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A pile of flour on a counter barely chars if you touch a match to it, but a cloud of flour dust in the air can explode from one spark. Why?',
            type: 'mcq',
            options: [
              'In a dust cloud, air surrounds every tiny grain, giving a huge surface area that reacts at once.',
              'Floating in air causes flour grains to split their atomic nuclei when hit by a spark.',
              'Grinding wheat into fine flour turns the starch molecules into unstable nitroglycerin.',
              'Airborne flour grains have no activation barrier, so they burn without needing a spark.'
            ],
            correctIndex: 0,
            hint: 'Compare how much flour touches oxygen in a packed pile versus when every tiny grain is floating in air.',
            workedSolution: 'In a pile on the counter, oxygen molecules can only hit the top layer of flour. When the same flour is spread out as a dust cloud, air surrounds every microscopic grain. A spark sets off collisions across that huge surface area all at once.',
            givenSummary: 'Why a flour dust cloud explodes while a pile of flour does not'
          };
        }
      ]
    },
    {
      id: 'PS1-5.5',
      title: 'Catalysts & Enzymes',
      subtitle: 'Explain how a catalyst speeds up a reaction by offering a pathway with a lower activation barrier, without being used up.',
      watchOut: 'A catalyst lowers the activation barrier (Ea) so more collisions succeed at the same temperature. It is not used up, it does not warm the particles up, and it does not change the overall energy released or absorbed (ΔH).',
      diagnostic: function(rng) {
        return {
          id: 'PS1-5.5_diag',
          skillId: 'PS1-5.5',
          level: 'Level 2 (Intermediate)',
          stem: 'Adding a pinch of black MnO₂ powder to hydrogen peroxide (H₂O₂) makes oxygen gas bubble out rapidly. When the fizzing stops, you can filter out all the MnO₂ powder with the same mass it had at the start.',
          type: 'two_tier',
          tier1Prompt: 'How did the MnO₂ powder speed up the reaction?',
          tier1Options: [
            'It gave the reaction a new pathway with a lower activation barrier.',
            'It burned up inside the liquid and heated the hydrogen peroxide.',
            'It made the water and peroxide molecules move faster at room temperature.',
            'It changed the starting and ending energies of the reactants and products.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why does a lower activation barrier make the reaction go faster at the same temperature?',
          tier2Options: [
            'With a lower barrier to cross, a larger share of the collisions already has enough energy to react.',
            'The catalyst hands over its own atoms to become part of the oxygen gas.',
            'The reaction releases twice as much energy per mole when the catalyst is present.',
            'Reactant molecules no longer have to collide with anything to turn into products.'
          ],
          correctTier2: 0,
          hint: 'A catalyst lowers the hill (Ea) without raising the speed of the particles or changing the start and end levels.',
          workedSolution: 'MnO₂ is a catalyst. It provides an alternative pathway with a lower activation barrier (Ea). Even though the temperature and particle speeds did not change, many more collisions now have enough kinetic energy to get over the lower hill. The MnO₂ is not used up, and the overall energy change (ΔH) stays the same.',
          givenSummary: 'How MnO₂ catalyzes H₂O₂ decomposition'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-5.5_diag2',
          skillId: 'PS1-5.5',
          level: 'Level 2 (Intermediate)',
          stem: 'Your saliva contains an enzyme called amylase. It breaks starch in a cracker into sugar within minutes at 37 °C. Without amylase, starch at 37 °C barely breaks down at all.',
          type: 'two_tier',
          tier1Prompt: 'How does amylase speed up the breakdown of starch?',
          tier1Options: [
            'It gives the reaction a pathway with a lower activation barrier.',
            'It heats the starch above body temperature, so its bonds break.',
            'It is used up, adding its own energy to each starch molecule.',
            'It makes the reaction release more energy, so the reaction runs faster.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why does a lower activation barrier make the reaction faster at the same temperature?',
          tier2Options: [
            'With a lower barrier, a larger share of collisions at 37 °C have enough energy to react.',
            'Each amylase molecule breaks one starch bond, and then the amylase molecule is gone.',
            'The products of the reaction sit at a lower energy when amylase is present.',
            'Amylase makes the water molecules move faster, so they hit the starch harder.'
          ],
          correctTier2: 0,
          hint: 'A catalyst lowers the hill (Ea). It does not speed up the particles, and it is not used up.',
          workedSolution: 'Amylase is a catalyst made by your body. It provides a pathway with a lower activation barrier (Ea). Your mouth stays at 37 °C, so the particles move at the same speed. But many more collisions now have enough energy to get over the lower hill. Each amylase molecule is not used up, so it works on starch after starch. The energy change (ΔH) stays the same.',
          givenSummary: 'How amylase speeds up starch breakdown'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-5.5_L1',
            skillId: 'PS1-5.5',
            level: 'Level 1 (Foundational)',
            stem: 'Sort each statement about catalysts as True or False:',
            type: 'categorize',
            categories: [
              'True for catalysts',
              'False for catalysts'
            ],
            items: [
              { label: 'A catalyst lowers the activation barrier (Ea) of a reaction', correctCategoryIndex: 0 },
              { label: 'A catalyst is used up just like a reactant as products form', correctCategoryIndex: 1 },
              { label: 'A catalyst changes the overall energy released or absorbed (ΔH)', correctCategoryIndex: 1 },
              { label: 'A catalyst lets more collisions succeed without raising the temperature', correctCategoryIndex: 0 },
              { label: 'Enzymes are catalysts in living cells that speed up reactions at body temperature', correctCategoryIndex: 0 }
            ],
            hint: 'Check the three core rules from Lesson 4-1b: lowers the barrier, is not used up, and leaves the energy released unchanged.',
            workedSolution: 'A catalyst (including an enzyme in living things) lowers the activation barrier so more collisions cross it at the same temperature, and it is not used up. Because the reactants and products still start and end at the same energy levels, ΔH does not change.',
            givenSummary: 'True vs false statements about catalysts'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-5.5_L3',
            skillId: 'PS1-5.5',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'An uncatalyzed reaction has an activation barrier of 90 kJ/mol and releases 40 kJ/mol of energy (ΔH = -40 kJ/mol). Adding a catalyst lowers the activation barrier to 55 kJ/mol. Which statement is true after the catalyst is added?',
            type: 'mcq',
            options: [
              'The reaction runs faster because the barrier is 55 kJ/mol, and it still releases 40 kJ/mol overall.',
              'The reaction runs faster and now releases 75 kJ/mol because the barrier dropped by 35 kJ/mol.',
              'The reaction runs at the same speed, but it releases 35 kJ/mol less heat to the flask.',
              'The catalyst is used up until the activation barrier climbs back to 90 kJ/mol.'
            ],
            correctIndex: 0,
            hint: 'Lowering the peak of the energy profile makes the climb smaller, but does it move the starting or ending energy plateaus?',
            workedSolution: 'The catalyst lowers only the peak of the hill (from 90 to 55 kJ/mol), so more collisions cross the barrier each second. The reactant and product energy levels do not move, so the reaction still releases 40 kJ/mol (ΔH = -40 kJ/mol).',
            givenSummary: 'Effect of a catalyst on Ea vs ΔH'
          };
        }
      ]
    },
    {
      id: 'PS1-5.6',
      title: 'Rate Data & Fair Tests',
      subtitle: 'Read reaction-time data and design fair experiments that change only one variable at a time.',
      watchOut: 'To test one variable (like temperature), keep every other variable (concentration, volume, surface area) the same. Also remember that a shorter reaction time means a FASTER reaction rate.',
      diagnostic: function(rng) {
        const t1 = pick(rng, [60, 48, 80]), t2 = t1 / 2;
        return {
          id: 'PS1-5.6_diag',
          skillId: 'PS1-5.6',
          level: 'Level 2 (Intermediate)',
          stem: `A student mixes sodium thiosulfate with acid so pale yellow sulfur clouds the beaker and hides a black X drawn underneath.\n\n• Trial 1: 0.10 M Na₂S₂O₃ at 20 °C hides the X in ${t1} seconds.\n• Trial 2: 0.20 M Na₂S₂O₃ at 20 °C hides the X in ${t2} seconds.`,
          type: 'two_tier',
          tier1Prompt: 'What do these two trials show?',
          tier1Options: [
            'Doubling the Na₂S₂O₃ concentration cut the time in half, so the reaction ran twice as fast.',
            `Trial 2 was slower than Trial 1, because ${t2} seconds is a smaller number than ${t1} seconds.`,
            'Changing the Na₂S₂O₃ concentration had no effect, because the temperature stayed at 20 °C.',
            'The temperature must have risen in Trial 2, so the data cannot be used.'
          ],
          correctTier1: 0,
          tier2Prompt: 'How is the time it takes to hide the X related to the reaction rate?',
          tier2Options: [
            'A shorter time means the same amount of sulfur formed faster, so rate is proportional to 1 / time.',
            'A longer time means the reaction ran faster and made more sulfur each second.',
            'The stopwatch time measures the height of the activation barrier, not the reaction rate.',
            'You cannot compare rates unless the two beakers are heated to different temperatures.'
          ],
          correctTier2: 0,
          hint: 'Both trials had to make the same amount of sulfur to hide the X. Which trial made that sulfur in less time?',
          workedSolution: `Hiding the X takes the same amount of sulfur in both trials. Trial 2 made that amount in ${t2} s instead of ${t1} s, half the time, so the reaction ran twice as fast (rate is proportional to 1 / time).`,
          givenSummary: 'Reading disappearing-X reaction time data'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        const t1 = pick(rng, [64, 80, 48]), t2 = t1 / 4;
        return {
          id: 'PS1-5.6_diag2',
          skillId: 'PS1-5.6',
          level: 'Level 2 (Intermediate)',
          stem: `A student runs the disappearing-X reaction twice, with sulfur clouding the beaker until the X is hidden.\n\n• Trial 1: 0.10 M Na₂S₂O₃ at 20 °C hides the X in ${t1} seconds.\n• Trial 2: 0.10 M Na₂S₂O₃ at 40 °C hides the X in ${t2} seconds.`,
          type: 'two_tier',
          tier1Prompt: 'What do these two trials show?',
          tier1Options: [
            'Raising the temperature by 20 °C made the reaction run four times faster.',
            'Trial 2 was slower, because it took a smaller number of seconds.',
            'Temperature had no effect, because both trials used 0.10 M Na₂S₂O₃.',
            'Trial 2 made four times as much sulfur, because it finished sooner.'
          ],
          correctTier1: 0,
          tier2Prompt: 'How is the time it takes to hide the X related to the reaction rate?',
          tier2Options: [
            'Both trials made the same sulfur, so a time four times shorter means a rate four times higher.',
            'A longer time means more collisions happened in the beaker, so Trial 1 had the faster rate.',
            'The time measures only the concentration, so it cannot show a change in rate.',
            'Rate goes up with time, so the trial with the bigger number reacted faster.'
          ],
          correctTier2: 0,
          hint: 'Both trials had to make the same amount of sulfur to hide the X. Only one variable changed. Which one?',
          workedSolution: `Only the temperature changed; the concentration stayed at 0.10 M, so the test is fair. Hiding the X takes the same amount of sulfur both times. Trial 2 made it in ${t2} s instead of ${t1} s, a quarter of the time. So the reaction ran four times faster (rate is proportional to 1 / time).`,
          givenSummary: 'Reading disappearing-X data for a temperature change'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-5.6_L1',
            skillId: 'PS1-5.6',
            level: 'Level 1 (Foundational)',
            stem: 'You want to test how temperature affects the rate of magnesium reacting with hydrochloric acid. Which plan is a fair test?',
            type: 'mcq',
            options: [
              'Use identical 2 cm magnesium ribbons in 20 mL of 1.0 M HCl at 20 °C, 30 °C, 40 °C, and 50 °C.',
              'Use magnesium powder at 20 °C and a 2 cm magnesium ribbon at 50 °C in 20 mL of 1.0 M HCl.',
              'Use 2 cm magnesium ribbons in 0.5 M HCl at 20 °C and in 2.0 M HCl at 50 °C.',
              'Use a 1 cm ribbon in 10 mL of HCl at 20 °C and a 4 cm ribbon in 40 mL at 50 °C.'
            ],
            correctIndex: 0,
            hint: 'In a fair test of temperature, only temperature should change from one trial to the next.',
            workedSolution: 'To test the effect of temperature alone, you must change only the temperature while keeping the magnesium size and shape (surface area), acid volume, and acid concentration the same in every trial.',
            givenSummary: 'Designing a fair test for temperature and reaction rate'
          };
        },
        function level3(rng) {
          const R = pick(rng, [{ a: 80, b: 16 }, { a: 90, b: 30 }, { a: 72, b: 18 }, { a: 60, b: 24 }]);
          const x = R.a / R.b;
          return {
            id: 'PS1-5.6_L3',
            skillId: 'PS1-5.6',
            level: 'Level 3 (Mastery Challenge)',
            stem: `In a clock reaction at 20 °C, the solution turns dark blue after ${fix(R.a, 1)} seconds. With a catalyst added under the exact same conditions, it turns dark blue in ${fix(R.b, 1)} seconds. How many times faster was the catalyzed reaction?`,
            type: 'numeric',
            inputPrompt: 'Enter how many times faster the reaction ran:',
            correctValue: x,
            tolerance: 0.1,
            unit: 'x',
            hint: `Divide the time without the catalyst by the time with it: ${fix(R.a, 1)} s / ${fix(R.b, 1)} s.`,
            workedSolution: `The color change marks the same amount of product in both runs. Finishing in ${fix(R.b, 1)} s instead of ${fix(R.a, 1)} s means the reaction ran ${fix(R.a, 1)} / ${fix(R.b, 1)} = ${fix(x, 1)} times faster.`,
            givenSummary: 'How many times faster, from clock-reaction times'
          };
        }
      ]
    }
  ];

  window.PE_DATA_HS_PS1_5 = {
    info: PE_INFO,
    skills: SKILLS
  };
})();
