/**
 * HS-PS3-4: Thermal Equilibrium in Closed Systems & Second Law of Thermodynamics
 * Items rewritten (Oct 2026) to the Tier 3 register in docs/textbook/VOICE.md and to the core scope
 * of lesson 3-4a: heat flows on its own from warmer to cooler until both reach the same temperature
 * (thermal equilibrium); collisions at the boundary transfer kinetic energy from faster particles to
 * slower ones on average; at thermal equilibrium collisions keep happening in both directions with
 * zero net heat transfer; closed-system calorimeter experiments.
 * Removed Enrichment-only microstates and Maxwell-Boltzmann curves from required choices, and fixed
 * the self-answering "Approach / Physical Contact / Energy Redistribution" labels in PS3-4.2_L1.
 * Zero em-dash compliant: hyphens, colons, and parentheses only.
 */
(function() {
  'use strict';

  // Calculation items pick their numbers per run (see ../pe-num.js).
  const { pick, fix, round } = window.PE_NUM;

  const PE_INFO = {
    id: 'HS-PS3-4',
    code: 'PS3-4',
    title: 'Thermal Equilibrium in Closed Systems',
    unit: 'Unit 3: Energy & Thermochemistry',
    description: 'Plan and conduct an investigation to provide evidence that the transfer of thermal energy when two components of different temperature are combined within a closed system results in a more uniform energy distribution among the components in the system (second law of thermodynamics).',
    clarification: 'Emphasis is on analyzing data from student investigations and using mathematical thinking to describe energy changes both quantitatively and conceptually. Examples include mixing liquids at different temperatures or adding a hot object to water in a calorimeter.',
    assessmentBoundary: 'Assessment is limited to systems of two components and the surroundings within a closed system.'
  };

  const SKILLS = [
    {
      id: 'PS3-4.1',
      title: 'The Second Law & Direction of Heat Flow',
      subtitle: 'Tell apart conserving total energy (First Law) and the direction heat flows on its own (Second Law).',
      watchOut: 'Conserving energy (the First Law) only says joules lost equal joules gained; it does not say which way heat moves. The Second Law says thermal energy spreads out on its own from warmer to cooler until both reach the same temperature.',
      diagnostic: function(rng) {
        return {
          id: 'PS3-4.1_diag',
          skillId: 'PS3-4.1',
          level: 'Level 2 (Intermediate)',
          stem: 'A beaker of warm water at 40 °C sits on a lab bench in a 22 °C room. The water never cools itself to 0 °C ice while heating the room air up to 50 °C, even though total energy could stay the same.',
          type: 'two_tier',
          tier1Prompt: 'Which law of thermodynamics rules out that backward process?',
          tier1Options: [
            'It would keep total energy constant, but it violates the Second Law because heat does not flow on its own from cooler to warmer.',
            'It violates both the First Law and the Second Law by creating brand-new energy out of nothing.',
            'It obeys the Second Law, but the First Law forbids heat from leaving liquid water.',
            'Both laws allow it, and it only needs a chemical catalyst to get started.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What happens at the particle level that sets this direction?',
          tier2Options: [
            'Collisions spread kinetic energy out from faster particles (warmer) to slower particles (cooler) until energy is shared evenly.',
            'Water molecules cannot pass kinetic energy to air molecules without breaking their O-H bonds first.',
            'Heat only moves across a boundary when an electric current pushes the molecules.',
            'Air molecules always move slower than liquid water molecules at every temperature.'
          ],
          correctTier2: 0,
          hint: 'The First Law checks whether total joules stay the same; the Second Law says heat spreads out from warmer to cooler.',
          workedSolution: 'Moving heat from the cooler room into the warmer water could keep total joules constant (First Law), but it never happens on its own. By the Second Law of Thermodynamics, random collisions spread kinetic energy from faster-moving (warmer) particles to slower-moving (cooler) particles until both reach the same temperature.',
          givenSummary: 'First Law vs Second Law: why heat flows from warmer to cooler'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS3-4.1_diag2',
          skillId: 'PS3-4.1',
          level: 'Level 2 (Intermediate)',
          stem: 'A can of soda at 4 °C sits on a table in a 25 °C room. It never gets colder by pushing its own heat out into the warm room, even though total energy could stay the same.',
          type: 'two_tier',
          tier1Prompt: 'Which law of thermodynamics rules out that backward process?',
          tier1Options: [
            'It conserves energy but breaks the Second Law: heat does not flow on its own from cool to warm.',
            'It breaks the First Law, because the can would be destroying energy as it got colder.',
            'It obeys both laws, so it would happen sooner or later if you waited long enough.',
            'It breaks the Second Law, because a closed can cannot trade any heat with the room.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What happens at the particle level that sets the direction of heat flow?',
          tier2Options: [
            'Faster air molecules hit the slower particles of the can and pass energy to them, on average.',
            'Cold flows out of the can into the room, which is why the can stays cold for a while.',
            'Metal cans block all heat until the soda inside reaches room temperature.',
            'The soda molecules stop moving at 4 °C, so they cannot collide with the can.'
          ],
          correctTier2: 0,
          hint: 'The First Law checks that the joules add up. The Second Law says which way heat moves on its own.',
          workedSolution: 'Pushing heat from the cold can into the warmer room could keep the total joules the same, so the First Law allows it. The Second Law does not: heat flows on its own only from warmer to cooler. At the particle level, faster air molecules strike the slower particles of the can and pass energy to them. The can warms up toward 25 °C.',
          givenSummary: 'A cold soda can in a warm room: First vs Second Law'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS3-4.1_L1',
            skillId: 'PS3-4.1',
            level: 'Level 1 (Foundational)',
            stem: 'Sort each statement by whether it is about the First Law (total energy stays constant) or the Second Law (heat spreads out from warmer to cooler):',
            type: 'categorize',
            categories: ['First Law (Energy Conservation)', 'Second Law (Direction of Heat Flow)'],
            items: [
              { label: 'The joules lost by cooling coffee equal the joules gained by the surrounding air', correctCategoryIndex: 0 },
              { label: 'Heat flows on its own from a hot iron pan into cool dishwater, never the other way', correctCategoryIndex: 1 },
              { label: 'A cup of warm tea never boils on its own by chilling the table underneath it', correctCategoryIndex: 1 },
              { label: 'Finding the final temperature in a sealed cup by setting q_hot + q_cold = 0', correctCategoryIndex: 0 },
              { label: 'Two touching blocks at different temperatures eventually settle at one shared temperature', correctCategoryIndex: 1 },
              { label: 'Total energy E_th + E_ch stays constant inside an insulated calorimeter', correctCategoryIndex: 0 }
            ],
            hint: 'First Law = how many joules (total stays constant). Second Law = which way heat moves on its own (warmer to cooler).',
            workedSolution: 'The First Law says energy is neither created nor destroyed (joules lost = joules gained). The Second Law says thermal energy spreads on its own from warmer to cooler until temperature differences disappear.',
            givenSummary: 'Sorting First Law vs Second Law statements'
          };
        },
        function level3(rng) {
          return {
            id: 'PS3-4.1_L3',
            skillId: 'PS3-4.1',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A kitchen refrigerator pulls heat out of its cold 4 °C inside and dumps that heat into the warm 22 °C kitchen. Why doesn\'t a refrigerator violate the Second Law of Thermodynamics?',
            type: 'mcq',
            options: [
              'Moving heat from cold to warm takes plugged-in electrical work from the motor; it does not happen on its own.',
              'The refrigerator creates new cold particles that cancel out the heat inside the insulated food compartment.',
              'The cooling gas inside the metal pipes turns all of the thermal energy directly into solid mass.',
              'A kitchen refrigerator is completely sealed off from the surroundings and from the laws of thermodynamics.'
            ],
            correctIndex: 0,
            hint: 'Unplug the refrigerator and see which way heat flows on its own. What keeps heat moving the other way when it is plugged in?',
            workedSolution: 'Left to itself (unplugged), heat flows from the 22 °C room into the 4 °C box until both are 22 °C. A running refrigerator pumps heat from cold to hot only because the electric compressor does work on the coolant.',
            givenSummary: 'Why a plugged-in refrigerator obeys the Second Law'
          };
        }
      ]
    },
    {
      id: 'PS3-4.2',
      title: 'Collisions at the Boundary',
      subtitle: 'Model how faster and slower particles exchange kinetic energy when they collide where two objects touch.',
      watchOut: 'When a fast particle and a slow particle collide, they push on each other with equal and opposite forces. On average, the faster particle slows down and the slower particle speeds up.',
      diagnostic: function(rng) {
        return {
          id: 'PS3-4.2_diag',
          skillId: 'PS3-4.2',
          level: 'Level 2 (Intermediate)',
          stem: 'A hot aluminum block at 90 °C touches cold water at 15 °C. Think about a fast-vibrating aluminum atom at the surface bumping into a slower water molecule right next to it.',
          type: 'two_tier',
          tier1Prompt: 'How do the forces between the aluminum atom and the water molecule compare during the bump?',
          tier1Options: [
            'The aluminum atom and the water molecule push on each other with equal and opposite forces.',
            'The faster aluminum atom pushes harder because it has more kinetic energy.',
            'The water molecule pushes harder because liquid molecules move more freely than solids.',
            'Neither particle pushes on the other unless a chemical bond forms between them.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What happens to their speeds on average as a result of these boundary collisions?',
          tier2Options: [
            'The faster aluminum atom rebounds slower and the slower water molecule rebounds faster, passing kinetic energy into the water.',
            'Both particles lose kinetic energy because bumping into a boundary destroys motion.',
            'Both particles speed up because collisions create new thermal energy at the surface.',
            'Kinetic energy moves from the cold water into the hot aluminum.'
          ],
          correctTier2: 0,
          hint: 'By Newton\'s Third Law, the two pushes are equal and opposite. When a fast ball hits a slow ball, which one speeds up?',
          workedSolution: 'During contact, the aluminum atom and water molecule push on each other with equal and opposite forces. On average, that push slows the faster aluminum atom down and speeds the slower water molecule up, transferring kinetic energy from the hot metal into the cold water.',
          givenSummary: 'Forces and energy transfer in a boundary collision'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS3-4.2_diag2',
          skillId: 'PS3-4.2',
          level: 'Level 2 (Intermediate)',
          stem: 'A cold metal spoon at 10 °C goes into hot soup at 70 °C. Think about a fast soup molecule bumping into a slow-vibrating metal atom at the spoon\'s surface.',
          type: 'two_tier',
          tier1Prompt: 'How do the forces between the soup molecule and the metal atom compare during the bump?',
          tier1Options: [
            'The soup molecule and the metal atom push on each other with equal and opposite forces.',
            'The fast soup molecule pushes harder, because it carries more kinetic energy.',
            'The metal atom pushes harder, because atoms in a solid are packed more tightly.',
            'Neither pushes on the other, because metal and liquid particles never touch.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What happens to their speeds on average as a result of these collisions?',
          tier2Options: [
            'The soup molecule rebounds slower and the metal atom vibrates faster, so energy moves into the spoon.',
            'Cold moves from the spoon into the soup, and it slows the soup molecules down.',
            'Both particles lose speed, because each bump wastes some of their energy.',
            'The metal atom speeds up, but the soup molecule keeps its full speed.'
          ],
          correctTier2: 0,
          hint: 'By Newton\'s Third Law, the two pushes are equal and opposite. Which particle speeds up when a fast one hits a slow one?',
          workedSolution: 'During the bump, the soup molecule and the metal atom push on each other with equal and opposite forces. On average, that push slows the fast soup molecule and speeds up the slow metal atom. Over billions of bumps, kinetic energy moves from the soup into the spoon. That is why the spoon handle warms up. Nothing called "cold" moves anywhere.',
          givenSummary: 'Spoon in hot soup: forces and energy at the boundary'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS3-4.2_L1',
            skillId: 'PS3-4.2',
            level: 'Level 1 (Foundational)',
            stem: 'Put these three events in order from first (1) to last (3) during a single collision between a hot metal atom and a cold water molecule:',
            type: 'ranking',
            items: [
              'A fast-vibrating metal atom and a slow-moving water molecule move toward each other at the surface',
              'The two particles hit and push on each other with equal and opposite forces',
              'The metal atom rebounds slower and the water molecule rebounds faster'
            ],
            correctOrder: [
              'A fast-vibrating metal atom and a slow-moving water molecule move toward each other at the surface',
              'The two particles hit and push on each other with equal and opposite forces',
              'The metal atom rebounds slower and the water molecule rebounds faster'
            ],
            hint: 'Follow the bump in time: before they touch, while they touch, and after they bounce apart.',
            workedSolution: 'First the fast metal atom and slow water molecule approach the boundary. Second, they collide and exert equal and opposite forces on each other. Third, the metal atom rebounds with less speed while the water molecule leaves with more speed.',
            givenSummary: 'Order of events during a boundary collision'
          };
        },
        function level3(rng) {
          return {
            id: 'PS3-4.2_L3',
            skillId: 'PS3-4.2',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'In the Lesson 3-4a collision chamber, two gas sides at different temperatures touch across a central wall. Why does net energy flow from the hot side to the cold side even though no energy is lost in any single collision?',
            type: 'mcq',
            options: [
              'When a fast particle hits a slow one, the fast one usually slows down and the slow one speeds up.',
              'Each collision destroys a little kinetic energy until all particles in both chambers stop moving completely.',
              'Cold particles pull heat across the central wall using much stronger intermolecular attractions than hot particles.',
              'Fast particles stick to the central wall and turn into cold particles before bouncing back out.'
            ],
            correctIndex: 0,
            hint: 'When a fast particle and a slow particle bump, which way does kinetic energy go in almost every bump?',
            workedSolution: 'Each individual collision conserves kinetic energy. Because the particles on the hot side move faster on average than the particles on the cold side, collisions at the wall transfer energy from the hot side to the cold side far more often than the reverse.',
            givenSummary: 'Why collisions move net energy from the hot side to the cold side'
          };
        }
      ]
    },
    {
      id: 'PS3-4.3',
      title: 'Thermal Equilibrium',
      subtitle: 'Describe thermal equilibrium both on a thermometer (equal temperatures, zero net heat flow) and at the particle level (collisions keep going both ways).',
      watchOut: 'Thermal equilibrium does NOT mean particles stop moving or stop colliding. They keep colliding across the boundary, but because both sides now have the same average kinetic energy, energy moves left-to-right and right-to-left at equal rates.',
      diagnostic: function(rng) {
        return {
          id: 'PS3-4.3_diag',
          skillId: 'PS3-4.3',
          level: 'Level 2 (Intermediate)',
          stem: 'Block X (80 °C) and Block Y (20 °C) touch inside an insulated box. After 30 minutes, both blocks read 50 °C.',
          type: 'two_tier',
          tier1Prompt: 'What is the net heat flow between Block X and Block Y once both read 50 °C?',
          tier1Options: [
            'Net heat flow between the blocks is zero because both are at the same temperature.',
            'Heat keeps flowing only from Block X into Block Y at the same rate as before.',
            'All thermal energy in both blocks is gone, so nothing can move.',
            'Net heat flow reverses so Block Y warms Block X back up to 80 °C.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What are the atoms doing at the boundary where the two 50 °C blocks touch?',
          tier2Options: [
            'Atoms keep colliding across the boundary, passing energy both ways at equal rates.',
            'Atoms at the boundary lock in place and stop vibrating once both blocks reach 50 °C.',
            'Every atom in both blocks moves at the exact same speed at every instant.',
            'Atoms in Block X still have a higher average kinetic energy because it started hotter.'
          ],
          correctTier2: 0,
          hint: 'At 50 °C, both blocks have the same average kinetic energy per atom. Do atoms at 50 °C stop vibrating, or do they keep bumping both ways?',
          workedSolution: 'Once both blocks reach 50 °C, they are at thermal equilibrium and net heat transfer is zero. At the particle level, atoms keep vibrating and colliding across the boundary, passing energy from X to Y and from Y to X at equal rates.',
          givenSummary: 'What thermal equilibrium means on a thermometer and at the particle level'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS3-4.3_diag2',
          skillId: 'PS3-4.3',
          level: 'Level 2 (Intermediate)',
          stem: 'A sealed bottle of juice sits in a fridge overnight. In the morning, the juice and the fridge air both read 4 °C.',
          type: 'two_tier',
          tier1Prompt: 'What is the net heat flow between the juice and the fridge air now?',
          tier1Options: [
            'Net heat flow is zero, because both are at the same temperature.',
            'Heat still flows only from the air into the juice, just more slowly.',
            'No heat flows, because the molecules have stopped moving at 4 °C.',
            'Cold keeps flowing into the juice to hold it at 4 °C.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What are the particles doing at the bottle wall?',
          tier2Options: [
            'Particles keep colliding at the wall, passing energy both ways at equal rates.',
            'Particles at the wall stop vibrating once both sides reach 4 °C.',
            'Every juice molecule moves at exactly the same speed as every air molecule.',
            'Juice molecules still have more energy, because liquids hold more heat than air.'
          ],
          correctTier2: 0,
          hint: 'At 4 °C, the particles on both sides have the same average kinetic energy. Do they stop, or keep bumping both ways?',
          workedSolution: 'The juice and the air are at thermal equilibrium, so net heat flow is zero. That does not mean the particles stopped. At 4 °C they still move and collide at the bottle wall. Energy passes from the juice to the air and from the air to the juice at equal rates, so neither side warms or cools.',
          givenSummary: 'Juice in a fridge: thermal equilibrium at the particle level'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS3-4.3_L1',
            skillId: 'PS3-4.3',
            level: 'Level 1 (Foundational)',
            stem: 'A mug of hot tea cools on a desk until it reaches thermal equilibrium with the 22 °C room air. Select ALL statements that are true at thermal equilibrium:',
            type: 'multi_select',
            options: [
              'The tea molecules and the room air molecules have the same average kinetic energy.',
              'Tea molecules and air molecules keep colliding at the surface of the tea.',
              'The net rate of heat transfer between the tea and the room air is zero.',
              'All molecules inside the liquid tea have stopped moving.',
              'The mug of tea holds the exact same total thermal energy (joules) as the whole room.'
            ],
            correctIndices: [0, 1, 2],
            hint: 'Equal temperature means equal AVERAGE kinetic energy per particle, not equal total joules (the room has far more mass) and not zero motion.',
            workedSolution: 'At thermal equilibrium, the tea and the room air share the same temperature (same average kinetic energy per particle), collisions keep happening both ways, and net heat flow is zero. Molecules keep moving at 22 °C, and the whole room holds far more total thermal energy than the small mug.',
            givenSummary: 'True statements at thermal equilibrium'
          };
        },
        function level3(rng) {
          return {
            id: 'PS3-4.3_L3',
            skillId: 'PS3-4.3',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A 50 g piece of copper and 50 g of liquid water sit in thermal equilibrium at 25 °C inside a sealed cup. Which statement compares them accurately?',
            type: 'mcq',
            options: [
              'Both have the same average kinetic energy per particle, but the 50 g of water stores much more total thermal energy.',
              'The copper atoms have a higher average kinetic energy because metals conduct heat faster than water.',
              'Both hold the exact same number of joules because thermal equilibrium means equal total energy.',
              'The water has a higher temperature than the copper because liquid molecules can slide around.'
            ],
            correctIndex: 0,
            hint: 'Same temperature (25 °C) means same average kinetic energy per particle. Compare their specific heat capacities (4.184 vs 0.385 J/(g·°C)) for total stored energy.',
            workedSolution: 'Because both are at 25 °C, their particles have the same average kinetic energy. However, water\'s specific heat capacity (4.184 J/(g·°C)) is more than ten times copper\'s (0.385 J/(g·°C)), so 50 g of water holds much more total thermal energy at 25 °C.',
            givenSummary: 'Equal average kinetic energy vs unequal total thermal energy at equilibrium'
          };
        }
      ]
    },
    {
      id: 'PS3-4.4',
      title: 'Why Heat Flow Is One-Way',
      subtitle: 'Explain why energy spreads out evenly across trillions of colliding particles and never gathers back into one side on its own.',
      watchOut: 'In a single bump, a slower particle can occasionally speed up a faster one. But in a real sample with trillions of particles, the chance that trillions of random collisions all push energy back into the hot side at once is essentially zero.',
      diagnostic: function(rng) {
        return {
          id: 'PS3-4.4_diag',
          skillId: 'PS3-4.4',
          level: 'Level 2 (Intermediate)',
          stem: 'A wall separates hot gas on the left from cold gas on the right. When the wall is removed, the gases mix and settle at one middle temperature.',
          type: 'two_tier',
          tier1Prompt: 'How has the distribution of kinetic energy changed after the wall is removed?',
          tier1Options: [
            'Kinetic energy is now spread out evenly across the whole box instead of bunched up on the left side.',
            'All kinetic energy has gathered into a few particles in the center while the rest stopped moving.',
            'Total kinetic energy in the box dropped by half when the hot and cold gases met.',
            'The hot gas stayed hot on the left and the cold gas stayed cold on the right.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why won\'t the mixed gas ever sort itself back into a hot left half and a cold right half on its own?',
          tier2Options: [
            'With trillions of random collisions, there are vastly more ways for energy to stay spread out than to gather on one side.',
            'Once gas particles mix, they form covalent bonds that lock them in place.',
            'The First Law forbids any single particle from ever changing its speed after equilibrium.',
            'Gravity pulls all of the fast particles to the bottom of the box and keeps them mixed.'
          ],
          correctTier2: 0,
          hint: 'Think about flipping trillions of coins at once: do they ever all land heads on the left side by chance?',
          workedSolution: 'When the wall comes out, collisions spread the kinetic energy across the whole box until both halves have the same average energy. Because there are trillions of particles bumping at random, the chance that all the fast ones wander back into the left half at the same time is essentially zero.',
          givenSummary: 'Why mixed hot and cold gases stay at one uniform temperature'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS3-4.4_diag2',
          skillId: 'PS3-4.4',
          level: 'Level 2 (Intermediate)',
          stem: 'You pour a spoonful of boiling water into a full bathtub of cool water. A minute later, the whole tub is a tiny bit warmer.',
          type: 'two_tier',
          tier1Prompt: 'How has the kinetic energy of the water molecules changed?',
          tier1Options: [
            'The energy that was bunched in the spoonful is now spread across the whole tub.',
            'The energy of the hot water was destroyed when it mixed with the cool water.',
            'The hot molecules stay together as a warm patch you could scoop back out.',
            'The tub now holds less total energy, because its temperature barely rose.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why won\'t that energy gather back into one hot spoonful on its own?',
          tier2Options: [
            'Among trillions of random collisions, there are far more ways to spread energy out than to bunch it up.',
            'Mixed water molecules bond to each other, so the hot ones can never separate out again.',
            'The First Law forbids any single molecule from speeding up after the water has mixed.',
            'Hot molecules always sink to the bottom, so they can never rise into one spot.'
          ],
          correctTier2: 0,
          hint: 'Think about shuffling a deck of cards. How often does a shuffle put all four aces back on top?',
          workedSolution: 'Collisions shared the spoonful\'s energy with every molecule in the tub, so the whole tub warmed slightly. In any one bump, a slow molecule can speed up a fast one. But for the energy to gather back, trillions of random bumps would all have to push it the same way at once. That is so unlikely that it never happens.',
          givenSummary: 'Boiling water in a bathtub: why spreading out is one-way'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS3-4.4_L1',
            skillId: 'PS3-4.4',
            level: 'Level 1 (Foundational)',
            stem: 'Sort each situation by whether thermal energy is bunched up (before heat spreads out) or spread out evenly (at thermal equilibrium):',
            type: 'categorize',
            categories: ['Energy bunched up (before equilibrium)', 'Energy spread out evenly (at equilibrium)'],
            items: [
              { label: 'A hot iron cube right after it is set next to a cold ice cube', correctCategoryIndex: 0 },
              { label: 'Two touching metal blocks after both have settled at 45 °C', correctCategoryIndex: 1 },
              { label: 'A chamber with 80 °C gas on the left and 10 °C gas on the right', correctCategoryIndex: 0 },
              { label: 'A well-stirred cup of water reading 32 °C throughout', correctCategoryIndex: 1 },
              { label: 'A freshly poured mug of 85 °C tea sitting in a 20 °C room', correctCategoryIndex: 0 },
              { label: 'A mug of tea that has cooled all the way to the 20 °C room temperature', correctCategoryIndex: 1 }
            ],
            hint: 'If two parts are at different temperatures, energy is still bunched up. Once everything shares one temperature, energy is spread out.',
            workedSolution: 'Whenever a hot region and a cold region sit next to each other, thermal energy is concentrated in the hot part. Once collisions have shared that energy until every part reads the same temperature, the system is at thermal equilibrium.',
            givenSummary: 'Sorting bunched-up vs spread-out thermal energy states'
          };
        },
        function level3(rng) {
          return {
            id: 'PS3-4.4_L3',
            skillId: 'PS3-4.4',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A student says: "In a single collision, a slower molecule can sometimes pass energy to a faster molecule, so a cup of lukewarm water could separate into boiling water on top and ice on the bottom." What is the best evaluation of the student\'s claim?',
            type: 'mcq',
            options: [
              'One collision can go that way, but separating a whole cup would require trillions of unlikely collisions all at once.',
              'The student is right; if you watch a cup of lukewarm water for an hour, it often separates into ice and boiling water.',
              'The student is wrong because a slower particle can never pass any energy to a faster particle in a single collision.',
              'The student is wrong because water molecules are polar and cannot pass kinetic energy when they collide.'
            ],
            correctIndex: 0,
            hint: 'Compare what can happen in one lucky collision with what happens across 10²⁴ collisions in a cup of water.',
            workedSolution: 'At the right angle, a single collision can occasionally speed up the faster particle. Across 10²⁴ molecules in a cup, however, the overwhelming majority of collisions pass energy from faster to slower particles, so the cup stays at one uniform temperature.',
            givenSummary: 'Why one lucky collision does not make a whole cup un-mix its heat'
          };
        }
      ]
    },
    {
      id: 'PS3-4.5',
      title: 'Closed-System Investigations',
      subtitle: 'Plan a fair closed-system calorimetry investigation and read temperature-vs-time graphs.',
      watchOut: 'An open beaker is not a closed thermal system: after the hot and cold water mix, heat keeps leaking into the room air so the temperature drifts down toward room temperature instead of holding a flat plateau.',
      diagnostic: function(rng) {
        return {
          id: 'PS3-4.5_diag',
          skillId: 'PS3-4.5',
          level: 'Level 2 (Intermediate)',
          stem: 'A student pours 100 mL of 80 °C water and 100 mL of 20 °C water into an open glass beaker. The thermometer reaches 46 °C right after mixing, then slowly drops to 22 °C over the next hour.',
          type: 'two_tier',
          tier1Prompt: 'Why didn\'t the mixture stay near 50 °C?',
          tier1Options: [
            'The open glass beaker let heat escape into the cooler 22 °C room air.',
            'The cold water destroyed thermal energy when the two liquids mixed.',
            'Room light caused an endothermic chemical reaction that broke water bonds.',
            'The specific heat capacity of water shrinks over time after it is stirred.'
          ],
          correctTier1: 0,
          tier2Prompt: 'How should the student redesign the setup to test thermal equilibrium in a closed system?',
          tier2Options: [
            'Mix the water inside nested foam cups with a lid so heat stays inside the system.',
            'Use a thin copper cup so room air can cool the water even faster.',
            'Boil the water while mixing so steam carries excess heat into the room.',
            'Leave the thermometer out until an hour after the two liquids are mixed.'
          ],
          correctTier2: 0,
          hint: 'To test how two water samples share energy with each other alone, you need to block heat flow to the room.',
          workedSolution: 'An open glass beaker loses heat to the cooler room air through the glass walls and from the open top, so the water eventually cools to room temperature (22 °C). Nested polystyrene foam cups with a lid insulate the mixture so the two water samples share energy only with each other.',
          givenSummary: 'Why a closed-system heat investigation needs an insulated cup and lid'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS3-4.5_diag2',
          skillId: 'PS3-4.5',
          level: 'Level 2 (Intermediate)',
          stem: 'In nested foam cups with a lid, 100 g of 80 °C water mixes with 100 g of 20 °C water. The reading rises to 49 °C, stays flat for 10 minutes, then drops slowly.',
          type: 'two_tier',
          tier1Prompt: 'Why does the reading settle near 49 °C, and not at exactly 50 °C?',
          tier1Options: [
            'A little heat went into warming the cup and the thermometer, so the water ended slightly low.',
            'The cold water destroyed one degree of thermal energy as the two samples mixed.',
            'Foam cups add cold to the water, which pulls the reading down by one degree.',
            'Mixed water always settles exactly 1 °C below the average of the two samples.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What does the flat part of the graph tell you about the setup?',
          tier2Options: [
            'Heat is barely leaking out, so the lidded foam cups work well as a closed system.',
            'The water molecules have stopped moving, so no more heat can be measured.',
            'The thermometer is broken, because a mixture should keep cooling the whole time.',
            'The two samples have not mixed yet, so the reading is stuck halfway.'
          ],
          correctTier2: 0,
          hint: 'Energy is never destroyed. Where else inside the cup could a little of the hot water\'s energy go?',
          workedSolution: 'Equal masses of water at 80 °C and 20 °C would settle at 50 °C if they shared energy only with each other. A little heat also warmed the foam and the thermometer, so the water settled near 49 °C. The flat stretch shows heat is barely leaking out, so the lidded cups work as a closed system. The slow drop later is the small leak to the room.',
          givenSummary: 'Reading a closed-system mixing graph'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS3-4.5_L1',
            skillId: 'PS3-4.5',
            level: 'Level 1 (Foundational)',
            stem: 'A student tests how changing the starting temperatures of two water samples affects their final equilibrium temperature in a sealed foam calorimeter. Sort each variable by its role in the investigation:',
            type: 'categorize',
            categories: ['Independent variable', 'Dependent variable', 'Controlled variable'],
            items: [
              { label: 'Starting temperatures of the two water samples before mixing', correctCategoryIndex: 0 },
              { label: 'Final equilibrium temperature of the mixture after stirring', correctCategoryIndex: 1 },
              { label: 'Mass of each water sample poured into the calorimeter', correctCategoryIndex: 2 },
              { label: 'Insulation of the container (same nested foam cups and lid every trial)', correctCategoryIndex: 2 },
              { label: 'Temperature curve recorded over time until the reading levels off', correctCategoryIndex: 1 },
              { label: 'Type of liquid used in both cups (pure water in every trial)', correctCategoryIndex: 2 }
            ],
            hint: 'Independent = what you change on purpose. Dependent = what you measure. Controlled = what you keep the same.',
            workedSolution: 'The student changes the starting temperatures on purpose (independent variable), measures the temperature over time and the final equilibrium temperature (dependent variables), and keeps the masses, liquid identity, and foam-cup insulation the same across trials (controlled variables).',
            givenSummary: 'Independent, dependent, and controlled variables in a thermal equilibrium lab'
          };
        },
        function level3(rng) {
          return {
            id: 'PS3-4.5_L3',
            skillId: 'PS3-4.5',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A student plots temperature versus time for hot water and cold water placed in thermal contact inside a sealed calorimeter. The hot curve drops, the cold curve rises, and both level off together along a flat line at 42 °C. What does that flat 42 °C line show?',
            type: 'mcq',
            options: [
              'Both samples have reached thermal equilibrium at 42 °C, with uniform average kinetic energy and zero net heat flow.',
              'All water molecules in both samples stopped moving once the thermometer hit 42 °C.',
              'Heat is now leaking out into the room at a steady rate of 42 joules per second.',
              'The cold water took all of the thermal energy out of the hot water, leaving the hot water at 0 K.'
            ],
            correctIndex: 0,
            hint: 'Why did the hot sample stop cooling and the cold sample stop warming once both reached 42 °C?',
            workedSolution: 'When the two temperature curves meet and stay flat at 42 °C, both samples have the same average kinetic energy per molecule. They are in thermal equilibrium, so net heat transfer between them is zero.',
            givenSummary: 'Reading a temperature-vs-time graph that levels off at equilibrium'
          };
        }
      ]
    },
    {
      id: 'PS3-4.6',
      title: 'Calculating Equilibrium Temperature',
      subtitle: 'Find the final equilibrium temperature when two samples mix, and explain why unequal masses or heat capacities shift the final temperature.',
      watchOut: 'The final temperature lands halfway between the two starting temperatures ONLY when both samples have the same mass AND the same specific heat capacity. Otherwise it lands closer to whichever sample has the larger m · c.',
      diagnostic: function(rng) {
        const R = pick(rng, [{ a: 60, ta: 80, b: 140, tb: 20 }, { a: 50, ta: 90, b: 150, tb: 10 }, { a: 40, ta: 85, b: 160, tb: 25 }]);
        const tf = (R.a * R.ta + R.b * R.tb) / (R.a + R.b);
        return {
          id: 'PS3-4.6_diag',
          skillId: 'PS3-4.6',
          level: 'Level 2 (Intermediate)',
          stem: `Inside an insulated calorimeter, ${fix(R.a, 1)} g of water at ${fix(R.ta, 1)} °C is mixed with ${fix(R.b, 1)} g of water at ${fix(R.tb, 1)} °C. Assuming no heat leaks out, what is the final equilibrium temperature (T_f) in °C?`,
          type: 'numeric',
          correctValue: round(tf, 1),
          tolerance: 0.5,
          unit: '°C',
          hint: `Both samples are water, so c cancels in q_hot + q_cold = 0: ${fix(R.a, 1)}(T_f - ${fix(R.ta, 1)}) + ${fix(R.b, 1)}(T_f - ${fix(R.tb, 1)}) = 0.`,
          workedSolution: `Set q_hot + q_cold = 0. Both are water, so c cancels: ${fix(R.a, 1)}(T_f - ${fix(R.ta, 1)}) + ${fix(R.b, 1)}(T_f - ${fix(R.tb, 1)}) = 0 -> ${fix(R.a + R.b, 1)} T_f = ${fix(R.a * R.ta, 0)} + ${fix(R.b * R.tb, 0)} = ${fix(R.a * R.ta + R.b * R.tb, 0)} -> T_f = ${fix(tf, 1)} °C. The answer sits closer to ${fix(R.tb, 1)} °C because there is more cold water (${fix(R.b, 1)} g) than hot water (${fix(R.a, 1)} g).`,
          givenSummary: 'Equilibrium temperature of two unequal water samples'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        const R = pick(rng, [{ a: 150, ta: 90, b: 50, tb: 10 }, { a: 120, ta: 80, b: 80, tb: 20 }, { a: 160, ta: 75, b: 40, tb: 15 }]);
        const tf = (R.a * R.ta + R.b * R.tb) / (R.a + R.b), avg = (R.ta + R.tb) / 2;
        return {
          id: 'PS3-4.6_diag2',
          skillId: 'PS3-4.6',
          level: 'Level 2 (Intermediate)',
          stem: `Inside an insulated calorimeter, ${fix(R.a, 1)} g of water at ${fix(R.ta, 1)} °C is mixed with ${fix(R.b, 1)} g of water at ${fix(R.tb, 1)} °C. Assuming no heat leaks out, what is the final equilibrium temperature (T_f) in °C?`,
          type: 'numeric',
          correctValue: round(tf, 1),
          tolerance: 0.5,
          unit: '°C',
          hint: `Both samples are water, so c cancels in q_hot + q_cold = 0: ${fix(R.a, 1)}(T_f - ${fix(R.ta, 1)}) + ${fix(R.b, 1)}(T_f - ${fix(R.tb, 1)}) = 0.`,
          workedSolution: `Set q_hot + q_cold = 0. Both are water, so c cancels: ${fix(R.a, 1)}(T_f - ${fix(R.ta, 1)}) + ${fix(R.b, 1)}(T_f - ${fix(R.tb, 1)}) = 0 -> ${fix(R.a + R.b, 1)} T_f = ${fix(R.a * R.ta, 0)} + ${fix(R.b * R.tb, 0)} = ${fix(R.a * R.ta + R.b * R.tb, 0)} -> T_f = ${fix(tf, 1)} °C. The answer sits closer to ${fix(R.ta, 1)} °C because there is more hot water. A common slip is taking the plain average, ${fix(avg, 1)} °C, which works only for equal masses.`,
          givenSummary: 'Equilibrium temperature with more hot water than cold'
        };
      },
      practiceLevels: [
        function level1(rng) {
          const R = pick(rng, [{ m: 100, ta: 70, tb: 10 }, { m: 100, ta: 90, tb: 30 }, { m: 150, ta: 60, tb: 20 }, { m: 50, ta: 80, tb: 40 }]);
          const tf = (R.ta + R.tb) / 2;
          return {
            id: 'PS3-4.6_L1',
            skillId: 'PS3-4.6',
            level: 'Level 1 (Foundational)',
            stem: `You mix ${fix(R.m, 1)} g of water at ${fix(R.ta, 1)} °C with ${fix(R.m, 1)} g of water at ${fix(R.tb, 1)} °C in an insulated cup. What is the final equilibrium temperature in °C?`,
            type: 'numeric',
            correctValue: tf,
            tolerance: 0.5,
            unit: '°C',
            hint: `With equal masses of the same liquid, the final temperature is halfway between ${fix(R.ta, 1)} °C and ${fix(R.tb, 1)} °C.`,
            workedSolution: `Both samples are ${fix(R.m, 1)} g of water, so the final temperature is the average of the two starting temperatures: (${fix(R.ta, 1)} + ${fix(R.tb, 1)}) / 2 = ${fix(tf, 1)} °C.`,
            givenSummary: 'Equilibrium temperature of equal water masses'
          };
        },
        function level3(rng) {
          return {
            id: 'PS3-4.6_L3',
            skillId: 'PS3-4.6',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'You drop 100.0 g of aluminum at 100.0 °C into 100.0 g of water at 20.0 °C in an insulated cup. They settle at 34.1 °C: the water warmed by only 14.1 °C while the aluminum cooled by 65.9 °C. Why did the final temperature land so much closer to the water\'s starting temperature?',
            type: 'mcq',
            options: [
              'Water has a specific heat capacity more than four times larger than aluminum\'s, so each joule moves water\'s temperature much less.',
              'The aluminum block gained heat from the cold water because metals pull thermal energy inward.',
              'Most of the thermal energy disappeared when it crossed from the solid metal into the liquid water.',
              'Water molecules are heavier than aluminum atoms, so they cannot speed up when bumped.'
            ],
            correctIndex: 0,
            hint: 'Both have mass 100.0 g and exchange the same number of joules. Compare c_water (4.184 J/(g·°C)) with c_Al (0.897 J/(g·°C)).',
            workedSolution: 'The aluminum loses the exact same number of joules that the water gains. Because water\'s specific heat capacity (4.184 J/(g·°C)) is about 4.6 times aluminum\'s (0.897 J/(g·°C)), the 100 g of water needs 4.6 times more joules for every 1 °C change, so its temperature moves 4.6 times less (14.1 °C vs 65.9 °C).',
            givenSummary: 'Why equal masses of aluminum and water settle much closer to the water\'s starting temperature'
          };
        }
      ]
    }
  ];

  window.PE_DATA_HS_PS3_4 = {
    info: PE_INFO,
    skills: SKILLS
  };
})();
