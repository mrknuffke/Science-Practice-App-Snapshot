/**
 * HS-PS3-1: Computational Thermal Energy & Calorimetry
 * Items rewritten (Oct 2026) to the Tier 3 register in docs/textbook/VOICE.md and to the core scope
 * of lessons 3-1a, 3-1b, and 3-1c: temperature as average kinetic energy per particle, thermal energy
 * as total kinetic energy of all particles, heat as energy moving from warmer to cooler, q = mcΔT,
 * heating curves with flat phase-change plateaus (q = mΔH), coffee-cup calorimetry (q_system + q_surroundings = 0),
 * and LOL energy bar charts using thermal energy (E_th) and chemical energy (E_ch) as in Lesson 3-1c.
 * Fixed the self-answering ranking item in PS3-1.2_L1.
 * Zero em-dash compliant: hyphens, colons, and parentheses only.
 */
(function() {
  'use strict';

  // Calculation items pick their numbers per run (see ../pe-num.js).
  const { pick, fix, round } = window.PE_NUM;

  const PE_INFO = {
    id: 'HS-PS3-1',
    code: 'PS3-1',
    title: 'Computational Thermal Energy & Calorimetry',
    unit: 'Unit 3: Energy & Thermochemistry',
    description: 'Create a computational model to calculate the change in the energy of one component in a system when the change in energy of the other component(s) and energy flows in and out of the system are known.',
    clarification: 'Emphasis is on explaining the meaning of mathematical expressions used in the model, calculating energy changes via q = mcΔT and latent heat, and tracking conservation across systems.',
    assessmentBoundary: 'Assessment is limited to basic algebraic expressions or computations, systems of two or three components, and thermal/phase energy changes.'
  };

  const SKILLS = [
    {
      id: 'PS3-1.1',
      title: 'Temperature, Heat & Thermal Energy',
      subtitle: 'Tell apart temperature (average per particle), thermal energy (total of all particles), and heat (energy in transit).',
      watchOut: 'Temperature is the average kinetic energy per particle. Thermal energy is the total kinetic energy of all the particles added together, so it depends on both temperature and how much stuff you have. Heat is thermal energy moving from a warmer object to a cooler one.',
      diagnostic: function(rng) {
        return {
          id: 'PS3-1.1_diag',
          skillId: 'PS3-1.1',
          level: 'Level 2 (Intermediate)',
          stem: 'A tiny spark from a sparkler at 1,200 °C lands on your hand without burning you, while spilling a 200 mL mug of 60 °C water causes a bad scald.',
          type: 'two_tier',
          tier1Prompt: 'How do the temperature and thermal energy of the spark and the mug of water compare?',
          tier1Options: [
            'The spark has a higher temperature, but the mug of water holds far more total thermal energy.',
            'The mug of water has both a higher temperature and more total thermal energy than the spark.',
            'Both transfer the same amount of heat because thermal energy depends only on temperature.',
            'The spark holds more thermal energy because 1,200 °C is twenty times hotter than 60 °C.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason explains why the 60 °C water burns your skin when the 1,200 °C spark does not?',
          tier2Options: [
            'Total thermal energy adds up all particles, so trillions more water molecules transfer far more joules to your skin.',
            'Each water molecule at 60 °C moves faster than an iron atom in the 1,200 °C spark.',
            'Smaller objects always have a lower temperature than larger objects made of liquid.',
            'Metals cannot transfer heat to skin because their electrons push skin molecules away.'
          ],
          correctTier2: 0,
          hint: 'Temperature is the average energy of one particle; thermal energy is the total across all particles in the sample.',
          workedSolution: 'Each atom in the 1,200 °C spark has a high average kinetic energy (high temperature), but the spark has almost no mass, so its total thermal energy is tiny. The 200 mL mug at 60 °C has a lower average per molecule, but it holds so many more molecules that its total thermal energy is thousands of joules.',
          givenSummary: 'Why a 60 °C mug of water holds more thermal energy than a 1,200 °C spark'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS3-1.1_diag2',
          skillId: 'PS3-1.1',
          level: 'Level 2 (Intermediate)',
          stem: 'A bathtub holds 150 L of water at 35 °C. A mug holds 0.25 L of tea at 80 °C.',
          type: 'two_tier',
          tier1Prompt: 'How do the temperature and thermal energy of the bathtub and the tea compare?',
          tier1Options: [
            'The tea has the higher temperature, but the bathtub holds far more thermal energy.',
            'The tea has both the higher temperature and more thermal energy than the bathtub.',
            'Both hold the same thermal energy, because both are made of water.',
            'The bathtub has the higher temperature, because it holds more water.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why could the 35 °C bathtub melt far more ice than the 80 °C tea?',
          tier2Options: [
            'Thermal energy adds up every particle, so hundreds of times more molecules can give far more joules.',
            'Each water molecule in the bathtub moves faster than each molecule in the hot tea.',
            'Heat always flows from a large object into a small one, whatever their temperatures are.',
            'Temperature and thermal energy are the same thing, so the bigger volume always wins.'
          ],
          correctTier2: 0,
          hint: 'Temperature is the average energy of one particle. Thermal energy is the total for every particle in the sample.',
          workedSolution: 'Each molecule in the 80 °C tea moves faster on average, so the tea has the higher temperature. But the bathtub holds 600 times as much water. Its molecules are slower on average, yet there are so many more of them that the total thermal energy is far larger. That total is what can melt ice.',
          givenSummary: 'Bathtub vs mug of tea: temperature and thermal energy'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS3-1.1_L1',
            skillId: 'PS3-1.1',
            level: 'Level 1 (Foundational)',
            stem: 'Match each description to Temperature, Thermal Energy, or Heat:',
            type: 'categorize',
            categories: ['Temperature', 'Thermal Energy', 'Heat'],
            items: [
              { label: 'Average kinetic energy per particle in a sample', correctCategoryIndex: 0 },
              { label: 'Energy moving from a warmer object to a cooler object', correctCategoryIndex: 2 },
              { label: 'Total kinetic energy of all the particles in a sample added together', correctCategoryIndex: 1 },
              { label: 'Measured in degrees Celsius (°C) or Kelvin (K)', correctCategoryIndex: 0 },
              { label: 'Doubles when you double the mass of water at the same °C reading', correctCategoryIndex: 1 }
            ],
            hint: 'Average per particle = temperature. Total stored in the sample = thermal energy. Moving from hot to cold = heat.',
            workedSolution: 'Temperature is the average kinetic energy per particle (measured in °C or K). Thermal energy is the total kinetic energy of all particles in the sample, so doubling the mass at the same temperature doubles it. Heat is thermal energy on the move from warmer to cooler.',
            givenSummary: 'Sorting temperature, thermal energy, and heat'
          };
        },
        function level3(rng) {
          return {
            id: 'PS3-1.1_L3',
            skillId: 'PS3-1.1',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Inside a sealed, insulated thermos, you mix 150 g of hot coffee at 85 °C with 50 g of cold milk at 5 °C. The mixture settles at 65 °C. Which statement is true?',
            type: 'mcq',
            options: [
              'The joules of thermal energy lost by the coffee equal the joules gained by the milk, so total energy stays constant.',
              'Total thermal energy drops because collisions between hot and cold molecules destroy energy.',
              'The cold milk gains more joules than the coffee loses because cold liquids soak up extra heat.',
              'Heat flows from the cold milk into the hot coffee until both liquids reach the same volume.'
            ],
            correctIndex: 0,
            hint: 'In an insulated thermos, no heat enters or leaves from the room. Where does the energy lost by the coffee go?',
            workedSolution: 'Because the thermos is insulated, energy is conserved inside: every joule of thermal energy lost by the cooling coffee is gained by the warming milk (q_coffee + q_milk = 0).',
            givenSummary: 'Energy conservation when mixing hot coffee and cold milk'
          };
        }
      ]
    },
    {
      id: 'PS3-1.2',
      title: 'Specific Heat Capacity (q = mcΔT)',
      subtitle: 'Use q = mcΔT to calculate heat, mass, specific heat, or temperature change.',
      watchOut: 'Specific heat capacity (c) is the joules needed to warm 1 g of a substance by 1 °C. A small c (like a metal) means the temperature jumps fast; a large c (like water, 4.184 J/(g·°C)) means it takes a lot of heat to move the temperature.',
      diagnostic: function(rng) {
        const R = pick(rng, [{ m: 250, dt: 20 }, { m: 200, dt: 25 }, { m: 100, dt: 40 }, { m: 300, dt: 10 }]);
        const q = R.m * 0.897 * R.dt, tf = 22 + R.dt;
        return {
          id: 'PS3-1.2_diag',
          skillId: 'PS3-1.2',
          level: 'Level 2 (Intermediate)',
          stem: `A ${fix(R.m, 1)} g block of aluminum (c = 0.897 J/(g·°C)) starts at 22.0 °C and absorbs ${fix(q, 0)} J of heat. What is its final temperature?`,
          type: 'numeric',
          prompt: 'Enter the final temperature in °C:',
          correctValue: tf,
          tolerance: 0.5,
          unit: '°C',
          hint: 'Use ΔT = q / (m · c) to find how much the temperature rises, then add that rise to 22.0 °C.',
          workedSolution: `First find the temperature change: ΔT = q / (m · c) = ${fix(q, 0)} J / (${fix(R.m, 1)} g x 0.897 J/(g·°C)) = ${fix(R.dt, 1)} °C. Add that to the starting temperature: 22.0 °C + ${fix(R.dt, 1)} °C = ${fix(tf, 1)} °C. A common slip is stopping at ΔT; the question asks for the final temperature.`,
          givenSummary: 'Final temperature of an aluminum block using q = mcΔT'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        const R = pick(rng, [{ m: 300, t2: 75 }, { m: 400, t2: 50 }, { m: 200, t2: 85 }]);
        const dt = R.t2 - 25, q = R.m * 0.385 * dt;
        return {
          id: 'PS3-1.2_diag2',
          skillId: 'PS3-1.2',
          level: 'Level 2 (Intermediate)',
          stem: `A copper pot (c = 0.385 J/(g·°C)) absorbs ${fix(q, 0)} J of heat and warms from 25.0 °C to ${fix(R.t2, 1)} °C. What is the mass of the pot?`,
          type: 'numeric',
          prompt: 'Enter the mass in grams (g):',
          correctValue: R.m,
          tolerance: 1,
          unit: 'g',
          hint: 'Rearrange q = mcΔT to m = q / (c · ΔT). Find ΔT first.',
          workedSolution: `First find the temperature change: ΔT = ${fix(R.t2, 1)} °C - 25.0 °C = ${fix(dt, 1)} °C. Then rearrange q = mcΔT: m = q / (c · ΔT) = ${fix(q, 0)} J / (0.385 J/(g·°C) x ${fix(dt, 1)} °C) = ${R.m} g. A common slip is using ${fix(R.t2, 1)} °C as ΔT instead of the change.`,
          givenSummary: 'Mass of a copper pot using q = mcΔT'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS3-1.2_L1',
            skillId: 'PS3-1.2',
            level: 'Level 1 (Foundational)',
            stem: 'Four 50.0 g samples all start at 20.0 °C and each absorbs 1,000 J of heat. Their specific heat capacities are: lead = 0.129, copper = 0.385, aluminum = 0.897, and liquid water = 4.184 J/(g·°C). Rank the four samples from the LARGEST temperature rise (1) to the SMALLEST temperature rise (4):',
            type: 'ranking',
            prompt: 'Order from largest temperature rise (1) to smallest temperature rise (4):',
            items: [
              'Lead',
              'Copper',
              'Aluminum',
              'Liquid water'
            ],
            correctOrder: [
              'Lead',
              'Copper',
              'Aluminum',
              'Liquid water'
            ],
            hint: 'From q = mcΔT, ΔT = q / (m · c). With the same mass and heat added, does a smaller c give a bigger or smaller ΔT?',
            workedSolution: 'Because ΔT = q / (m · c), the substance that needs the fewest joules per degree (smallest c) warms up by the most degrees. From smallest c to largest c: lead (0.129) warms the most, then copper (0.385), then aluminum (0.897), and liquid water (4.184) warms the least.',
            givenSummary: 'Ranking temperature rise from specific heat capacities'
          };
        },
        function level3(rng) {
          return {
            id: 'PS3-1.2_L3',
            skillId: 'PS3-1.2',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'An 80.0 g piece of metal alloy cools from 95.0 °C to 25.0 °C and gives off 1,904 J of heat.',
            type: 'two_tier',
            tier1Prompt: 'What is the specific heat capacity (c) of the alloy?',
            tier1Options: [
              '0.340 J/(g·°C)',
              '0.897 J/(g·°C)',
              '1.240 J/(g·°C)',
              '2.150 J/(g·°C)'
            ],
            correctTier1: 0,
            tier2Prompt: 'How does this alloy compare with liquid water (c = 4.184 J/(g·°C))?',
            tier2Options: [
              'Each gram of the alloy takes about 12 times less heat than water to change temperature by 1 °C.',
              'The alloy stores about 12 times more heat per gram than water for the same temperature change.',
              'The alloy and water change temperature by the same amount whenever they absorb equal heat.',
              'The alloy cools faster only because metals have no chemical bonds between their atoms.'
            ],
            correctTier2: 0,
            hint: 'First find c = |q| / (m · |ΔT|) with m = 80.0 g and |ΔT| = 70.0 °C. Then compare 0.340 with 4.184.',
            workedSolution: 'c = |q| / (m · |ΔT|) = 1,904 J / (80.0 g x 70.0 °C) = 1,904 / 5,600 = 0.340 J/(g·°C). Water\'s specific heat (4.184 J/(g·°C)) is about 12 times larger, so water resists temperature changes much more strongly than the metal.',
            givenSummary: 'Finding an alloy\'s specific heat and comparing it with water'
          };
        }
      ]
    },
    {
      id: 'PS3-1.3',
      title: 'Phase Changes & Latent Heat',
      subtitle: 'Explain why temperature stays flat during a phase change and calculate heat using q = mΔH.',
      watchOut: 'While ice melts at 0 °C or water boils at 100 °C, the thermometer reading stays flat. The added energy is pulling molecules apart against their attractions (raising potential energy), not making them move faster.',
      diagnostic: function(rng) {
        return {
          id: 'PS3-1.3_diag',
          skillId: 'PS3-1.3',
          level: 'Level 2 (Intermediate)',
          stem: 'A beaker holding crushed ice and liquid water at 0.0 °C sits over a steady burner flame. For eight minutes, the thermometer stays at 0.0 °C while the ice melts.',
          type: 'two_tier',
          tier1Prompt: 'What is happening to the energy of the H₂O molecules during those eight minutes?',
          tier1Options: [
            'Average kinetic energy stays the same while potential energy rises as molecules break out of the ice lattice.',
            'Average kinetic energy rises steadily while potential energy between the molecules drops to zero.',
            'Both kinetic and potential energy stay fixed because the flame\'s heat bounces off the glass.',
            'The heat turns into extra mass inside the hydrogen and oxygen nuclei.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why doesn\'t the thermometer reading rise while the burner is on?',
          tier2Options: [
            'All of the added heat goes into overcoming hydrogen-bond attractions to melt the ice, not into speeding molecules up.',
            'Water molecules form new covalent bonds with air at 0 °C, which uses up the heat.',
            'Thermometers cannot measure any temperature changes until all the water turns to steam.',
            'Melting is exothermic, so the ice gives off cold that cancels the burner flame.'
          ],
          correctTier2: 0,
          hint: 'A thermometer responds to how fast particles move (average kinetic energy). Where is the burner\'s energy going while the ice melts?',
          workedSolution: 'During melting, the temperature stays at 0.0 °C because the average speed of the molecules does not change. Instead, the energy from the burner (q = m · ΔH_fus) pulls water molecules out of their rigid ice lattice against hydrogen bonds, raising their potential energy.',
          givenSummary: 'Why temperature stays flat at 0 °C while ice melts'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS3-1.3_diag2',
          skillId: 'PS3-1.3',
          level: 'Level 2 (Intermediate)',
          stem: 'A pot of water boils on a steady burner. For ten minutes, the thermometer stays at 100 °C while the water level drops.',
          type: 'two_tier',
          tier1Prompt: 'What is happening to the energy of the H₂O molecules during those ten minutes?',
          tier1Options: [
            'Average kinetic energy stays the same while potential energy rises as molecules escape into the gas.',
            'Average kinetic energy keeps rising, but the thermometer cannot read above 100 °C.',
            'The molecules split into H₂ and O₂ gas, and splitting them uses up the heat.',
            'Both kinetic and potential energy stay fixed, because the heat leaves with the steam.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why doesn\'t the thermometer reading rise while the burner is on?',
          tier2Options: [
            'The added heat pulls molecules away from their neighbors against their attractions, instead of speeding them up.',
            'The heat breaks the O-H bonds inside water molecules, which is what makes the bubbles.',
            'Water can never be heated past 100 °C, so the extra heat is destroyed.',
            'Boiling is exothermic, so the steam gives back heat as fast as the burner adds it.'
          ],
          correctTier2: 0,
          hint: 'A thermometer reads how fast the particles move. If that is not changing, where is the burner\'s energy going?',
          workedSolution: 'While water boils, the temperature stays at 100 °C because the average speed of the molecules does not change. The burner\'s energy (q = m · ΔH_vap) pulls molecules away from their neighbors against hydrogen bonds, raising their potential energy. The bubbles are water vapor, still H₂O. No covalent bonds break.',
          givenSummary: 'Why boiling water stays at 100 °C'
        };
      },
      practiceLevels: [
        function level1(rng) {
          const m = pick(rng, [75, 50, 120, 30]);
          const j = m * 334;
          return {
            id: 'PS3-1.3_L1',
            skillId: 'PS3-1.3',
            level: 'Level 1 (Foundational)',
            stem: `How many kilojoules (kJ) of heat are needed to melt a ${fix(m, 1)} g ice cube at 0.0 °C? (For water, ΔH_fus = 334 J/g.)`,
            type: 'numeric',
            prompt: 'Enter the energy needed in kJ:',
            correctValue: round(j / 1000, 2),
            tolerance: 0.2,
            unit: 'kJ',
            hint: `Multiply mass by ΔH_fus (${fix(m, 1)} g x 334 J/g) to get joules, then divide by 1,000 to get kilojoules.`,
            workedSolution: `q = m · ΔH_fus = ${fix(m, 1)} g x 334 J/g = ${fix(j, 0)} J. Dividing by 1,000 gives ${fix(j / 1000, 2)} kJ. The temperature stays at 0.0 °C the whole time, so no q = mcΔT step is needed.`,
            givenSummary: 'Heat needed to melt ice at 0 °C'
          };
        },
        function level3(rng) {
          return {
            id: 'PS3-1.3_L3',
            skillId: 'PS3-1.3',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'For water, boiling 1 g at 100 °C takes 2,260 J (ΔH_vap = 2,260 J/g), while melting 1 g at 0 °C takes only 334 J (ΔH_fus = 334 J/g). Why is the boiling plateau nearly seven times wider than the melting plateau?',
            type: 'mcq',
            options: [
              'Boiling pulls water molecules completely apart into a gas, while melting only loosens the crystal so molecules can slide past each other.',
              'Melting breaks covalent O-H bonds inside each molecule, while boiling only stretches weak dispersion forces.',
              'Liquid water weighs more per molecule than steam, so it takes more energy to lift.',
              'Oxygen in the room pulls water molecules apart during melting but pushes them together during boiling.'
            ],
            correctIndex: 0,
            hint: 'Compare how close water molecules sit in liquid water versus in steam.',
            workedSolution: 'When ice melts into liquid water, the rigid lattice loosens so molecules can slide around each other, but they stay touching and keep most of their hydrogen-bond attractions. When liquid water boils into steam, the molecules must break completely free of each other, which takes about seven times more energy.',
            givenSummary: 'Why boiling water takes nearly seven times more energy than melting ice'
          };
        }
      ]
    },
    {
      id: 'PS3-1.4',
      title: 'Multi-Stage Heating Curves',
      subtitle: 'Add the energy of each sloped warming step (q = mcΔT) and each flat plateau (q = mΔH) along a heating curve.',
      watchOut: 'Never plug a temperature change that crosses a melting or boiling point into a single q = mcΔT step. Break the trip into separate pieces (warm the solid, melt it, warm the liquid) and add the joules.',
      diagnostic: function(rng) {
        const R = pick(rng, [{ m: 20, a: -10, b: 30 }, { m: 10, a: -20, b: 40 }, { m: 25, a: -10, b: 20 }, { m: 15, a: -5, b: 50 }]);
        const q1 = R.m * 2.09 * -R.a, q2 = R.m * 334, q3 = R.m * 4.184 * R.b, total = q1 + q2 + q3;
        return {
          id: 'PS3-1.4_diag',
          skillId: 'PS3-1.4',
          level: 'Level 2 (Intermediate)',
          stem: `You heat ${fix(R.m, 1)} g of ice from ${fix(R.a, 1)} °C to liquid water at ${fix(R.b, 1)} °C. Use c_ice = 2.09 J/(g·°C), ΔH_fus = 334 J/g, and c_water = 4.184 J/(g·°C). How many total joules (J) are absorbed across all three steps?`,
          type: 'numeric',
          prompt: 'Enter the total energy in joules (J):',
          correctValue: Math.round(total),
          tolerance: 50,
          unit: 'J',
          hint: `Add three steps: warm the ice by ${fix(-R.a, 1)} °C, melt it at 0 °C, then warm the water by ${fix(R.b, 1)} °C.`,
          workedSolution: `Step 1 (warm ice from ${fix(R.a, 1)} to 0 °C): q1 = ${fix(R.m, 1)} x 2.09 x ${fix(-R.a, 1)} = ${fix(q1, 1)} J. Step 2 (melt ice at 0 °C): q2 = ${fix(R.m, 1)} x 334 = ${fix(q2, 0)} J. Step 3 (warm water from 0 to ${fix(R.b, 1)} °C): q3 = ${fix(R.m, 1)} x 4.184 x ${fix(R.b, 1)} = ${fix(q3, 1)} J. Total: about ${fix(total, 0)} J. The melting step is the biggest share.`,
          givenSummary: 'Three-step heating calculation from ice to warm water'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        const R = pick(rng, [{ m: 10, a: 80, b: 110 }, { m: 5, a: 60, b: 120 }, { m: 20, a: 90, b: 105 }]);
        const q1 = R.m * 4.184 * (100 - R.a), q2 = R.m * 2260, q3 = R.m * 2.01 * (R.b - 100), total = q1 + q2 + q3;
        return {
          id: 'PS3-1.4_diag2',
          skillId: 'PS3-1.4',
          level: 'Level 2 (Intermediate)',
          stem: `You heat ${fix(R.m, 1)} g of liquid water from ${fix(R.a, 1)} °C to steam at ${fix(R.b, 1)} °C. Use c_water = 4.184 J/(g·°C), ΔH_vap = 2,260 J/g, and c_steam = 2.01 J/(g·°C). How many total joules (J) are absorbed across all three steps?`,
          type: 'numeric',
          prompt: 'Enter the total energy in joules (J):',
          correctValue: Math.round(total),
          tolerance: 50,
          unit: 'J',
          hint: `Add three steps: warm the water by ${fix(100 - R.a, 1)} °C, boil it at 100 °C, then warm the steam by ${fix(R.b - 100, 1)} °C.`,
          workedSolution: `Step 1 (warm water from ${fix(R.a, 1)} to 100 °C): q1 = ${fix(R.m, 1)} x 4.184 x ${fix(100 - R.a, 1)} = ${fix(q1, 1)} J. Step 2 (boil at 100 °C): q2 = ${fix(R.m, 1)} x 2,260 = ${fix(q2, 0)} J. Step 3 (warm steam from 100 to ${fix(R.b, 1)} °C): q3 = ${fix(R.m, 1)} x 2.01 x ${fix(R.b - 100, 1)} = ${fix(q3, 1)} J. Total: about ${fix(total, 0)} J. The boiling step is almost all of it.`,
          givenSummary: 'Three-step heating calculation from hot water to steam'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS3-1.4_L1',
            skillId: 'PS3-1.4',
            level: 'Level 1 (Foundational)',
            stem: 'A solid sample is heated steadily until it turns into a gas. Match each segment of its heating curve to what happens and which equation applies:',
            type: 'categorize',
            categories: ['Warming solid', 'Melting plateau', 'Warming liquid', 'Boiling plateau', 'Warming gas'],
            items: [
              { label: 'Temperature rises toward the melting point; use q = m · c_solid · ΔT', correctCategoryIndex: 0 },
              { label: 'Temperature stays flat at the melting point while solid turns to liquid; use q = m · ΔH_fus', correctCategoryIndex: 1 },
              { label: 'Temperature rises between the melting and boiling points; use q = m · c_liquid · ΔT', correctCategoryIndex: 2 },
              { label: 'Temperature stays flat at the boiling point while liquid turns to gas; use q = m · ΔH_vap', correctCategoryIndex: 3 },
              { label: 'Temperature rises above the boiling point as the gas warms; use q = m · c_gas · ΔT', correctCategoryIndex: 4 }
            ],
            hint: 'Sloped segments warm a single phase (q = mcΔT). Flat segments change the phase at constant temperature (q = mΔH).',
            workedSolution: 'On the three sloped segments, a single phase warms up as particles speed up (q = mcΔT). On the two flat plateaus, the temperature holds steady while added heat pulls particles apart into the next phase (q = mΔH).',
            givenSummary: 'Matching heating-curve segments to phases and equations'
          };
        },
        function level3(rng) {
          return {
            id: 'PS3-1.4_L3',
            skillId: 'PS3-1.4',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'On a heating curve for water with a steady heat input, the liquid water line slopes up more gently than the ice line or the steam line. Why is the liquid slope the gentlest?',
            type: 'mcq',
            options: [
              'Liquid water has the highest specific heat capacity (c), so each gram needs more joules for every 1 °C rise.',
              'Steam molecules weigh more than liquid water molecules, so steam warms up without needing much energy.',
              'Liquid water leaks most of its heat out through the glass walls, while ice and steam keep all of theirs.',
              'Steam has stronger hydrogen bonds than liquid water, which pushes its temperature up faster.'
            ],
            correctIndex: 0,
            hint: 'Compare c for liquid water (4.184 J/(g·°C)) with c for ice (2.09) and steam (2.01). If 1 °C takes more joules, is the slope steeper or gentler?',
            workedSolution: 'Liquid water has a higher specific heat capacity (4.184 J/(g·°C)) than ice (2.09) or steam (2.01). Because each degree of warming takes about twice as many joules in the liquid, the temperature rises half as fast under a steady heater, giving a gentler slope.',
            givenSummary: 'Why liquid water has a gentler slope on a heating curve than ice or steam'
          };
        }
      ]
    },
    {
      id: 'PS3-1.5',
      title: 'Coffee-Cup Calorimetry',
      subtitle: 'Use q_system + q_surroundings = 0 to track heat between a reaction or metal and the water in a calorimeter.',
      watchOut: 'The thermometer sits in the water (the surroundings), not inside the chemical bonds. When the water gets COLDER (q_water < 0), the reaction took heat in from the water (q_rxn > 0, endothermic). When the water gets WARMER (q_water > 0), the reaction released heat into the water (q_rxn < 0, exothermic).',
      diagnostic: function(rng) {
        return {
          id: 'PS3-1.5_diag',
          skillId: 'PS3-1.5',
          level: 'Level 2 (Intermediate)',
          stem: 'Dissolving 5.00 g of ammonium nitrate (NH₄NO₃) in 100.0 g of water inside a foam cup drops the thermometer reading from 22.0 °C to 17.5 °C.',
          type: 'two_tier',
          tier1Prompt: 'What are the signs of q_water and q_rxn, and is the dissolving endothermic or exothermic?',
          tier1Options: [
            'q_water is negative and q_rxn is positive, so the dissolving is endothermic.',
            'q_water is positive and q_rxn is negative, so the dissolving is exothermic.',
            'Both q_water and q_rxn are negative because the thermometer reading went down.',
            'Both q_water and q_rxn are positive because the total mass in the cup went up.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Where did the thermal energy go?',
          tier2Options: [
            'Pulling the ions apart took in thermal energy from the surrounding water, cooling the water down.',
            'Ammonium nitrate gave off cold particles into the water and lowered the total energy in the cup.',
            'Water froze onto the ions and gave off heat into the thermometer.',
            'Dissolving the salt destroyed thermal energy inside the cup.'
          ],
          correctTier2: 0,
          hint: 'The water cooled down, so the water lost heat (q_water < 0). Inside an insulated cup, q_rxn + q_water = 0.',
          workedSolution: 'Because the water cooled from 22.0 °C to 17.5 °C, the water lost thermal energy (q_water < 0). That energy went into the dissolving salt (q_rxn = -q_water > 0) as ions were pulled apart. Taking in heat from the surroundings is endothermic.',
          givenSummary: 'Signs of q_water and q_rxn in a cold-pack dissolution'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS3-1.5_diag2',
          skillId: 'PS3-1.5',
          level: 'Level 2 (Intermediate)',
          stem: 'You dissolve 4.00 g of calcium chloride (CaCl₂) in 100.0 g of water in a foam cup. The thermometer rises from 21.0 °C to 27.7 °C.',
          type: 'two_tier',
          tier1Prompt: 'What are the signs of q_water and q_rxn, and is the dissolving endothermic or exothermic?',
          tier1Options: [
            'q_water is positive and q_rxn is negative, so the dissolving is exothermic.',
            'q_water is negative and q_rxn is positive, so the dissolving is endothermic.',
            'Both q_water and q_rxn are positive, because the thermometer reading went up.',
            'Both q_water and q_rxn are zero, because the foam cup is insulated.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Where did the thermal energy come from?',
          tier2Options: [
            'The dissolving salt released energy into the water around it, warming the water up.',
            'The foam cup trapped heat from the room and passed that heat into the water.',
            'Salt makes water molecules speed up on their own, so the water created new heat.',
            'The thermometer gave its own heat to the water while it sat in the cup.'
          ],
          correctTier2: 0,
          hint: 'The water warmed up, so the water gained heat (q_water > 0). Inside an insulated cup, q_rxn + q_water = 0.',
          workedSolution: 'The water warmed from 21.0 °C to 27.7 °C, so it gained thermal energy (q_water > 0). Inside the insulated cup, that energy can only have come from the dissolving salt, so q_rxn = -q_water < 0. Releasing heat to the surroundings is exothermic. The insulated cup does not make q zero; it only keeps the heat from leaking out.',
          givenSummary: 'Signs of q_water and q_rxn when CaCl₂ dissolves'
        };
      },
      practiceLevels: [
        function level1(rng) {
          const R = pick(rng, [{ mm: 50, tm: 100, mw: 100, tw: 20, tf: 24 }, { mm: 75, tm: 90, mw: 120, tw: 18, tf: 22 }, { mm: 40, tm: 100, mw: 100, tw: 20, tf: 26 }, { mm: 60, tm: 95, mw: 100, tw: 22, tf: 25 }]);
          const qw = R.mw * 4.184 * (R.tf - R.tw), dtm = R.tm - R.tf, c = qw / (R.mm * dtm);
          return {
            id: 'PS3-1.5_L1',
            skillId: 'PS3-1.5',
            level: 'Level 1 (Foundational)',
            stem: `A ${fix(R.mm, 1)} g piece of hot metal at ${fix(R.tm, 1)} °C is dropped into ${fix(R.mw, 1)} g of water at ${fix(R.tw, 1)} °C in an insulated cup. The water and metal settle at ${fix(R.tf, 1)} °C. What is the specific heat capacity of the metal? (Use c_water = 4.184 J/(g·°C) and assume no heat is lost.)`,
            type: 'numeric',
            prompt: 'Enter the specific heat capacity in J/(g·°C):',
            correctValue: round(c, 3),
            tolerance: 0.02,
            unit: 'J/(g·°C)',
            hint: `First find the heat gained by the water: q_water = ${fix(R.mw, 1)} x 4.184 x (${fix(R.tf, 1)} - ${fix(R.tw, 1)}). Then set |q_metal| = q_water and divide by (${fix(R.mm, 1)} g x ${fix(dtm, 1)} °C).`,
            workedSolution: `Heat gained by the water: q_water = ${fix(R.mw, 1)} g x 4.184 J/(g·°C) x ${fix(R.tf - R.tw, 1)} °C = ${fix(qw, 1)} J. The metal lost that same ${fix(qw, 1)} J while cooling by ${fix(R.tm, 1)} - ${fix(R.tf, 1)} = ${fix(dtm, 1)} °C. So c_metal = ${fix(qw, 1)} J / (${fix(R.mm, 1)} g x ${fix(dtm, 1)} °C) = ${fix(c, 3)} J/(g·°C).`,
            givenSummary: 'Finding a metal\'s specific heat from coffee-cup calorimetry'
          };
        },
        function level3(rng) {
          return {
            id: 'PS3-1.5_L3',
            skillId: 'PS3-1.5',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'In a foam-cup calorimeter, 4.00 g of NaOH (40.00 g/mol, which is 0.100 mol) dissolves in 100.0 g of water at 21.0 °C, and the temperature climbs to 31.5 °C. The solution has mass 104.0 g and c = 4.18 J/(g·°C). What is ΔH in kJ per mole of NaOH? (Include a minus sign if exothermic.)',
            type: 'numeric',
            prompt: 'Enter ΔH in kJ/mol (negative if exothermic):',
            correctValue: -45.7,
            tolerance: 1.5,
            unit: 'kJ/mol',
            hint: 'Find q_soln = 104.0 x 4.18 x (31.5 - 21.0) in joules, convert to kJ, flip the sign for q_rxn = -q_soln, and divide by 0.100 mol.',
            workedSolution: 'The solution warmed by 31.5 - 21.0 = 10.5 °C, so q_soln = 104.0 g x 4.18 J/(g·°C) x 10.5 °C = 4,564.6 J = 4.565 kJ. Because the solution gained heat, the dissolving released it: q_rxn = -4.565 kJ. Dividing by 0.100 mol NaOH gives ΔH = -45.65 kJ/mol (-45.7 kJ/mol).',
            givenSummary: 'Calculating ΔH in kJ/mol for dissolving NaOH'
          };
        }
      ]
    },
    {
      id: 'PS3-1.6',
      title: 'LOL Energy Bar Charts & Lab Limits',
      subtitle: 'Use LOL energy bar charts (E_th and E_ch) to track energy in a calorimeter and spot real-lab heat leaks.',
      watchOut: 'In Lesson 3-1c\'s LOL diagrams, the bars track thermal energy (E_th) and chemical energy (E_ch), while the circle (O) shows whether heat entered or left the system. If the whole insulated calorimeter is the system, the circle has no arrow and E_th + E_ch stays constant.',
      diagnostic: function(rng) {
        return {
          id: 'PS3-1.6_diag',
          skillId: 'PS3-1.6',
          level: 'Level 2 (Intermediate)',
          stem: 'Inside a sealed, insulated coffee-cup calorimeter, magnesium reacts with acid and the solution warms up. Take the whole contents of the cup as the system.',
          type: 'two_tier',
          tier1Prompt: 'How do the LOL energy bars change from before the reaction to after the reaction?',
          tier1Options: [
            'Chemical energy (E_ch) drops and thermal energy (E_th) rises by the same number of bars, with zero heat crossing the circle.',
            'Both chemical energy (E_ch) and thermal energy (E_th) rise as heat flows inward through the circle.',
            'Thermal energy (E_th) drops while chemical energy (E_ch) rises, because the thermometer reading went up.',
            'Both energy bars drop to zero because the reaction uses up the energy inside the cup.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which conservation rule explains the two bar charts?',
          tier2Options: [
            'In an insulated system, chemical energy stored in bonds turns directly into thermal energy, keeping E_th + E_ch constant.',
            'An exothermic reaction creates brand-new joules that were not in the cup before the reaction started.',
            'Heat had to enter from the room air, because a liquid cannot warm up on its own.',
            'Temperature rises only when thermal energy leaves the water and goes into the chemical bonds.'
          ],
          correctTier2: 0,
          hint: 'The cup is insulated (nothing crosses the O circle) and the liquid got warmer (E_th went up). Where did those bars come from?',
          workedSolution: 'With the whole insulated cup as the system, no heat crosses the boundary (the O circle has no arrow). Because the reaction is exothermic, stored chemical energy (E_ch) drops and thermal energy (E_th) rises by the exact same number of bars, keeping total energy E_th + E_ch the same.',
          givenSummary: 'LOL energy bars (E_th and E_ch) for an exothermic calorimeter reaction'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS3-1.6_diag2',
          skillId: 'PS3-1.6',
          level: 'Level 2 (Intermediate)',
          stem: 'Inside a sealed, insulated coffee-cup calorimeter, ammonium nitrate dissolves and the solution cools down. Take the whole contents of the cup as the system.',
          type: 'two_tier',
          tier1Prompt: 'How do the LOL energy bars change from before dissolving to after dissolving?',
          tier1Options: [
            'Thermal energy (E_th) drops and chemical energy (E_ch) rises by the same amount, with no heat crossing.',
            'Both thermal energy (E_th) and chemical energy (E_ch) drop, as heat flows out through the circle.',
            'Chemical energy (E_ch) drops and thermal energy (E_th) rises, because dissolving releases stored energy.',
            'Both energy bars stay exactly the same, because the cup is sealed and fully insulated from the room.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which conservation rule explains the two bar charts?',
          tier2Options: [
            'In an insulated system, thermal energy turns into chemical energy, so E_th + E_ch stays constant.',
            'An endothermic process destroys joules, which is why the solution gets colder.',
            'Cold must have entered from the room air, because a liquid cannot cool down on its own.',
            'Temperature drops only when chemical energy leaves the cup through its walls.'
          ],
          correctTier2: 0,
          hint: 'Nothing crosses the O circle, and the liquid got colder (E_th went down). Where did those bars go?',
          workedSolution: 'With the whole insulated cup as the system, no heat crosses the boundary, so the O circle has no arrow. The solution got colder, so thermal energy (E_th) dropped. Pulling the ions apart stored that energy as chemical energy (E_ch), which rose by the same number of bars. E_th + E_ch stays constant. Nothing was destroyed; it changed form.',
          givenSummary: 'LOL bars for an endothermic process in an insulated cup'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS3-1.6_L1',
            skillId: 'PS3-1.6',
            level: 'Level 1 (Foundational)',
            stem: 'In a coffee-cup calorimetry calculation, we use q_rxn = -q_soln. Sort each statement as a simplifying assumption of the model or a real-lab limitation that causes error:',
            type: 'categorize',
            categories: ['Model assumption', 'Real-lab limitation (source of error)'],
            items: [
              { label: 'The foam cup itself absorbs zero heat from the liquid', correctCategoryIndex: 0 },
              { label: 'Some heat escapes through the lid hole into the room air', correctCategoryIndex: 1 },
              { label: 'The dilute solution has the exact same specific heat as pure water (4.184 J/(g·°C))', correctCategoryIndex: 0 },
              { label: 'Part of the solid salt stays undissolved at the bottom when the peak temperature is read', correctCategoryIndex: 1 },
              { label: 'All heat from the reaction stays inside the liquid with zero loss to the room', correctCategoryIndex: 0 },
              { label: 'The thermometer probe absorbs a little heat as it warms up', correctCategoryIndex: 1 }
            ],
            hint: 'Assumptions are what we pretend is true to keep the math simple; limitations are ways the real cup falls short.',
            workedSolution: 'To use q_rxn = -q_soln, the model assumes no heat leaks out, the cup absorbs nothing, and the solution has c = 4.184 J/(g·°C). In a real lab, heat escaping to the air, warming the thermometer probe, or incomplete dissolving all introduce small errors.',
            givenSummary: 'Calorimetry model assumptions vs real-lab error sources'
          };
        },
        function level3(rng) {
          return {
            id: 'PS3-1.6_L3',
            skillId: 'PS3-1.6',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A student drops a hot metal cylinder into water in an uninsulated paper cup. Some heat leaks out into the room air before the student reads the highest water temperature. How does that leak affect the calculated specific heat of the metal (c_metal)?',
            type: 'mcq',
            options: [
              'The calculated c_metal comes out too low, because the water\'s temperature rise (ΔT_water) is smaller than it should be.',
              'The calculated c_metal comes out too high, because lost heat makes the metal look like it held more energy.',
              'The calculated c_metal is unaffected, because specific heat is a fixed property of the metal.',
              'The calculated c_metal is unaffected, because heat loss changes the mass of the water instead of its temperature.'
            ],
            correctIndex: 0,
            hint: 'Because heat leaked out, did the water warm up as much as it should have? Follow a smaller ΔT_water into q_water and then into c_metal.',
            workedSolution: 'When heat leaks into the room, the water does not warm up as much as it would in a well-insulated cup. A smaller measured ΔT_water gives a smaller calculated q_water. Since the student sets |q_metal| = q_water, the calculated c_metal = |q_metal| / (m_metal · |ΔT_metal|) comes out too low.',
            givenSummary: 'How a heat leak affects the calculated specific heat of a metal'
          };
        }
      ]
    }
  ];

  window.PE_DATA_HS_PS3_1 = {
    info: PE_INFO,
    skills: SKILLS
  };
})();
