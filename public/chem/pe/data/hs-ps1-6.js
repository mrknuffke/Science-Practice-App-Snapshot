/**
 * HS-PS1-6: Dynamic Equilibrium & Le Chatelier's Principle
 * Items rewritten (Oct 2026) to the Tier 3 register in docs/textbook/VOICE.md and to the scope
 * of lessons 4-6a and 4-6b: rate balance, Le Chatelier, gas particles and pressure, the Haber
 * trade-off, and the blood buffer. No equilibrium constants (the PE boundary excludes them),
 * no complex ions, and no partial pressures.
 * Zero em-dash compliant: hyphens, colons, and parentheses only.
 */
(function() {
  'use strict';

  const PE_INFO = {
    id: 'HS-PS1-6',
    code: 'PS1-6',
    title: 'Dynamic Equilibrium & Le Chatelier\'s Principle',
    unit: 'Unit 4: Kinetics & Equilibrium',
    description: 'Refine the design of a chemical system by specifying a change in conditions that would produce increased amounts of products at equilibrium.',
    clarification: 'Emphasis is on the application of Le Chatelier\'s principle and on refining designs of chemical reaction systems, including descriptions of the connection between changes made at the macroscopic level and what happens at the molecular level.',
    assessmentBoundary: 'Assessment is limited to specifying the change in only one variable at a time. Assessment does not include calculating equilibrium constants and concentrations.'
  };

  const SKILLS = [
    {
      id: 'PS1-6.1',
      title: 'Dynamic Equilibrium & Opposing Rates',
      subtitle: 'Model equilibrium as two opposite reactions running at the same rate in a closed container.',
      watchOut: 'Equilibrium does not mean the reaction stopped, and it does not mean the amounts are equal. It means the forward and reverse reactions run at the same rate, so the amounts stop changing.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-6.1_diag',
          skillId: 'PS1-6.1',
          level: 'Level 2 (Intermediate)',
          stem: 'A sealed flask holds N₂O₄(g) ⇌ 2 NO₂(g) at equilibrium. The brown color of the gas stays the same for days.',
          type: 'two_tier',
          tier1Prompt: 'Why does the color stop changing?',
          tier1Options: [
            'The forward and reverse reactions run at the same rate, so the amounts stay the same.',
            'All of the reactant has been used up, so the molecules have stopped colliding.',
            'The activation energy grew so large that every molecule in the flask stopped moving.',
            'The molecules react only when sunlight shines in, and the flask is kept in the dark.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Equilibrium is dynamic: molecules keep colliding and reacting, but both directions keep pace.',
            'Equilibrium is still: every bond stops breaking once the products reach a set amount.',
            'The reactant and product molecules settle into separate layers, so they no longer meet.',
            'Reactions cannot run in either direction once the pressure in the flask stops changing.'
          ],
          correctTier2: 0,
          hint: 'Does a steady color mean the molecules stopped, or that both reactions keep pace with each other?',
          workedSolution: 'At equilibrium in a closed flask, N₂O₄ turns into NO₂ at the same rate that NO₂ turns back into N₂O₄. Both reactions keep running. Because they keep pace, the amount of brown NO₂ stays the same, and so does the color.',
          givenSummary: 'N₂O₄ and NO₂: why the color holds steady'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-6.1_diag2',
          skillId: 'PS1-6.1',
          level: 'Level 2 (Intermediate)',
          stem: 'A capped bottle holds some water and air at 25 °C. After a day, the water level stops dropping, even though molecules keep leaving the liquid surface.',
          type: 'two_tier',
          tier1Prompt: 'Why does the water level stop dropping?',
          tier1Options: [
            'Molecules leave the liquid at the same rate that vapor molecules return to it.',
            'Water molecules stop leaving the liquid once the air above it is full.',
            'The air above pushes down on the water and holds every molecule in place.',
            'All the water that can evaporate has evaporated, so the rest stays liquid.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Evaporation and condensation both keep going; the level is steady because the two rates match.',
            'Evaporation stops in a capped bottle, so condensation is the only process left running.',
            'The amount of vapor now equals the amount of liquid, so nothing more can change.',
            'Condensation runs faster than evaporation, and that is what holds the level steady.'
          ],
          correctTier2: 0,
          hint: 'The stem says molecules keep leaving. If the level is steady anyway, what else must be happening just as fast?',
          workedSolution: 'Molecules keep escaping from the surface, and vapor molecules keep landing back in the liquid. At first, more leave than return. As vapor builds up, the return rate climbs until it matches the escape rate. From then on the level holds steady, but both processes are still running. That is dynamic equilibrium.',
          givenSummary: 'Water in a capped bottle: why the level holds steady'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-6.1_L1',
            skillId: 'PS1-6.1',
            level: 'Level 1 (Foundational)',
            stem: 'Which statements describe a reaction at equilibrium in a closed container? (Select ALL that apply)',
            type: 'multi_select',
            options: [
              'The forward reaction runs at the same rate as the reverse reaction.',
              'The amounts of reactants and products stay the same over time.',
              'The container must be closed, so no matter gets in or out.',
              'The amount of reactants must exactly equal the amount of products.',
              'Molecules keep reacting in both directions the whole time.'
            ],
            correctIndices: [0, 1, 2, 4],
            hint: 'Equilibrium means balanced rates, not equal amounts.',
            workedSolution: 'At equilibrium the forward and reverse rates are equal, so the amounts stop changing. The container must be closed, and both reactions keep running. The amounts of reactants and products are rarely equal; they just stop changing.',
            givenSummary: 'What is true at equilibrium'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-6.1_L3',
            skillId: 'PS1-6.1',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'In a closed flask, A(g) ⇌ 2 B(g) settles down. The flask now holds four times as much B as A, and neither amount changes over the next hour. Is the reaction at equilibrium?',
            type: 'mcq',
            options: [
              'Yes. Equilibrium needs equal rates, not equal amounts, and the amounts have stopped changing.',
              'No. Equilibrium is reached only when the products turn completely into a solid.',
              'No. The reaction stopped because there is too little A left to react at all.',
              'Not yet. The amounts must become equal before the reaction can be at equilibrium.'
            ],
            correctIndex: 0,
            hint: 'What does it mean when the amounts stop changing, whichever side has more?',
            workedSolution: 'Amounts that hold steady mean the forward and reverse reactions are running at the same rate. That is equilibrium. Which side has more molecules depends on the reaction; equilibrium never requires the amounts to be equal.',
            givenSummary: 'Unequal but steady amounts at equilibrium'
          };
        }
      ]
    },
    {
      id: 'PS1-6.2',
      title: 'Adding or Removing a Substance',
      subtitle: 'Predict and explain which way an equilibrium shifts when you add or remove a reactant or a product.',
      watchOut: 'Adding a reactant makes forward collisions more frequent, so for a while the forward reaction outruns the reverse. The system shifts forward until the two rates match again. Removing a product works the same way.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-6.2_diag',
          skillId: 'PS1-6.2',
          level: 'Level 2 (Intermediate)',
          stem: 'A solution holds Fe³⁺ (pale yellow) + SCN⁻ (colorless) ⇌ FeSCN²⁺ (dark red) at equilibrium. You dissolve extra SCN⁻ ions into it, and the red color deepens.',
          type: 'two_tier',
          tier1Prompt: 'Which way did the equilibrium shift?',
          tier1Options: [
            'Forward, toward the products, making more of the dark red FeSCN²⁺.',
            'In reverse, toward the reactants, turning red FeSCN²⁺ back into SCN⁻.',
            'Neither way. The added ions made the iron fall out of the solution as rust.',
            'Neither way. Adding ions ended the equilibrium and stopped the reverse reaction.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'More SCN⁻ means Fe³⁺ and SCN⁻ collide more often, so the forward rate pulls ahead for a while.',
            'Adding SCN⁻ lowers the activation energy for the forward reaction and raises it for the reverse.',
            'Adding SCN⁻ warms the solution, and the extra heat breaks apart the red product.',
            'Adding SCN⁻ uses up the water, so there is too little water left to dissolve the ions.'
          ],
          correctTier2: 0,
          hint: 'Adding SCN⁻ raises the amount of a reactant. What happens to how often reactant ions collide?',
          workedSolution: 'The extra SCN⁻ ions collide with Fe³⁺ more often, so the forward reaction speeds up and outruns the reverse. The system shifts forward, using up some of the added SCN⁻ and making more dark red FeSCN²⁺, until the two rates match again.',
          givenSummary: 'Iron and thiocyanate: adding a reactant'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-6.2_diag2',
          skillId: 'PS1-6.2',
          level: 'Level 2 (Intermediate)',
          stem: 'A sealed flask holds H₂(g) + I₂(g) (purple) ⇌ 2 HI(g) (colorless) at equilibrium. You inject extra HI gas, and the purple color deepens.',
          type: 'two_tier',
          tier1Prompt: 'Which way did the equilibrium shift?',
          tier1Options: [
            'In reverse, toward the reactants, making more purple I₂.',
            'Forward, toward the products, making more colorless HI.',
            'Neither way. The extra gas stopped the forward reaction for good.',
            'Neither way. The added HI mixed in, and nothing else changed.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'More HI means HI molecules collide more often, so the reverse rate pulls ahead for a while.',
            'Adding HI raises the activation energy for the reverse reaction, so it slows down.',
            'Adding any gas to a flask always pushes the reaction toward the products.',
            'Adding HI warms the flask, and heat always breaks molecules into their elements.'
          ],
          correctTier2: 0,
          hint: 'HI is a product. Adding it raises the amount of the substance that runs the reverse reaction.',
          workedSolution: 'The extra HI molecules collide with each other more often, so the reverse reaction speeds up and outruns the forward one. The system shifts in reverse, using up some of the added HI and making more H₂ and purple I₂. It keeps shifting until the two rates match again.',
          givenSummary: 'Hydrogen iodide: adding a product'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-6.2_L1',
            skillId: 'PS1-6.2',
            level: 'Level 1 (Foundational)',
            stem: 'A factory makes ethyl acetate (a solvent in nail polish remover): acetic acid + ethanol ⇌ ethyl acetate + water. Which change keeps pushing the reaction forward?',
            type: 'mcq',
            options: [
              'Remove the water from the reactor as fast as it forms.',
              'Drain some of the ethanol out of the bottom of the reactor.',
              'Pump extra ethyl acetate back into the reacting mixture.',
              'Bubble nitrogen gas through the liquid to shrink its volume.'
            ],
            correctIndex: 0,
            hint: 'Removing a product makes the reaction shift toward that side, to replace what was taken.',
            workedSolution: 'Removing water lowers the amount of a product, so the reverse reaction slows down. The forward reaction now outruns it, and the system shifts forward to replace the lost water. That makes more ethyl acetate.',
            givenSummary: 'Removing a product to raise the yield'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-6.2_L3',
            skillId: 'PS1-6.2',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'In a sealed bottle of soda, CO₂(g) ⇌ CO₂(aq) is at equilibrium. You open the cap, and the CO₂ gas above the soda escapes. What happens to the dissolved CO₂?',
            type: 'mcq',
            options: [
              'Dissolved CO₂ comes out as bubbles, because the system shifts left to replace the gas.',
              'More CO₂ dissolves into the soda, because the system shifts right to make up the loss.',
              'Nothing happens to the dissolved CO₂, because only the gas above the soda escaped.',
              'The reaction stops completely, so the soda keeps all of its dissolved CO₂.'
            ],
            correctIndex: 0,
            hint: 'Opening the cap removes CO₂(g), which is on the left side. Which way does the system shift to replace it?',
            workedSolution: 'Opening the cap removes CO₂(g) from the left side. The system shifts left to replace it, so dissolved CO₂ comes out of the soda as bubbles. With the cap off, the gas keeps escaping, so the soda keeps fizzing until it goes flat.',
            givenSummary: 'Opening a soda: removing a substance'
          };
        }
      ]
    },
    {
      id: 'PS1-6.3',
      title: 'Changing the Temperature',
      subtitle: 'Use Le Chatelier\'s principle to predict how heating or cooling shifts an exothermic or endothermic equilibrium.',
      watchOut: 'Treat heat like a substance in the equation. It is a reactant in an endothermic reaction and a product in an exothermic one. Heating shifts the reaction away from the side with heat; cooling shifts it toward that side.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-6.3_diag',
          skillId: 'PS1-6.3',
          level: 'Level 2 (Intermediate)',
          stem: 'A sealed tube holds 2 NO₂(g) (brown) ⇌ N₂O₄(g) (colorless) + 57 kJ. You put the tube in an ice bath, and the gas turns pale.',
          type: 'two_tier',
          tier1Prompt: 'Which way did cooling shift the equilibrium?',
          tier1Options: [
            'Forward, the exothermic direction, making more colorless N₂O₄.',
            'In reverse, the endothermic direction, making more brown NO₂.',
            'Neither way. The cold froze the NO₂ into a white solid on the glass.',
            'Neither way. The cold stopped the gas molecules from taking in light.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Cooling removes heat, so the system shifts toward the side that releases heat.',
            'Cooling packs the molecules closer, which speeds up only the reverse collisions.',
            'Cooling changes the shape of the molecules, so nitrogen can no longer form bonds.',
            'Cooling shrinks the gas, which pulls the molecules toward the walls of the tube.'
          ],
          correctTier2: 0,
          hint: 'Heat is on the product side, so the forward reaction releases heat. Which way replaces the heat you removed?',
          workedSolution: 'The forward reaction is exothermic, so heat acts like a product. The ice bath removes heat. The system shifts forward to make more heat, turning brown NO₂ into colorless N₂O₄, so the gas turns pale.',
          givenSummary: 'Cooling NO₂ and N₂O₄'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-6.3_diag2',
          skillId: 'PS1-6.3',
          level: 'Level 2 (Intermediate)',
          stem: 'A sealed reactor holds CO(g) + 2 H₂(g) ⇌ CH₃OH(g) + 91 kJ at equilibrium. You heat the reactor from 250 °C to 350 °C.',
          type: 'two_tier',
          tier1Prompt: 'Which way does heating shift the equilibrium?',
          tier1Options: [
            'In reverse, the endothermic direction, making more CO and H₂.',
            'Forward, the exothermic direction, making more CH₃OH.',
            'Neither way, because heat speeds up both reactions by the same amount.',
            'Neither way, because the methanol boils and leaves the gas mixture.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Heat acts like a product here, so adding it shifts the system away from that side.',
            'Heating makes the molecules collide harder, and that always pushes a reaction forward.',
            'Heating lowers the activation barrier of the forward reaction only.',
            'Heating raises the pressure, which always shifts toward the side with more gas moles.'
          ],
          correctTier2: 0,
          hint: 'The 91 kJ sits on the product side. Which direction uses up heat you add?',
          workedSolution: 'The forward reaction is exothermic, so heat acts like a product. Heating adds more of that product. The system shifts in reverse to use up the extra heat, turning some CH₃OH back into CO and H₂. Heat does speed up both reactions, but it speeds up the endothermic one more, so the balance moves.',
          givenSummary: 'Heating the methanol equilibrium'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-6.3_L1',
            skillId: 'PS1-6.3',
            level: 'Level 1 (Foundational)',
            stem: 'Nitrogen monoxide forms in an endothermic reaction: N₂(g) + O₂(g) + 180 kJ ⇌ 2 NO(g). Which change makes more NO at equilibrium?',
            type: 'mcq',
            options: [
              'Raise the temperature of the container.',
              'Lower the temperature of the container.',
              'Remove some of the nitrogen gas.',
              'Keep adding NO to the container.'
            ],
            correctIndex: 0,
            hint: 'In an endothermic reaction, heat is a reactant. Adding a reactant pushes the reaction toward products.',
            workedSolution: 'Heat is a reactant in this endothermic reaction. Raising the temperature adds heat, so the system shifts forward to use it up, making more NO.',
            givenSummary: 'Heating an endothermic reaction'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-6.3_L3',
            skillId: 'PS1-6.3',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A reaction at equilibrium makes a colored product. When you warm the flask, the color deepens. When you cool it, the color fades. What does this tell you about the forward reaction?',
            type: 'mcq',
            options: [
              'It is endothermic, because adding heat pushed the reaction toward the colored product.',
              'It is exothermic, because heating always pushes every reaction toward its products.',
              'It is neither, because temperature changes only how fast a reaction reaches equilibrium.',
              'It cannot be at equilibrium, because the color would never change at equilibrium.'
            ],
            correctIndex: 0,
            hint: 'Heating pushes the reaction away from the side where heat sits. Which side must heat be on?',
            workedSolution: 'Warming made more of the product, so adding heat pushed the reaction forward. Heat must be a reactant, which means the forward reaction takes heat in: it is endothermic. Cooling removes that heat, so the reaction shifts back and the color fades.',
            givenSummary: 'Working out endothermic from a color change'
          };
        }
      ]
    },
    {
      id: 'PS1-6.4',
      title: 'Pressure, Volume & Moles of Gas',
      subtitle: 'Predict how squeezing or expanding a container shifts an equilibrium, by counting the moles of gas on each side.',
      watchOut: 'Pressure only shifts an equilibrium when the two sides have different numbers of gas molecules. Squeezing the container shifts it toward fewer gas molecules. Expanding the container shifts it toward more.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-6.4_diag',
          skillId: 'PS1-6.4',
          level: 'Level 2 (Intermediate)',
          stem: 'A cylinder holds 2 SO₂(g) + O₂(g) ⇌ 2 SO₃(g) at equilibrium. You push the piston in, so the gas has half the volume.',
          type: 'two_tier',
          tier1Prompt: 'Which way does the equilibrium shift?',
          tier1Options: [
            'Right, toward the products, making more SO₃.',
            'Left, toward the reactants, making more SO₂ and O₂.',
            'Neither way, because the number of gas moles never changes in a reaction.',
            'Neither way, because squeezing the gas stops the molecules from colliding.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Squeezing raises the pressure; shifting toward fewer gas moles (3 down to 2) lowers it again.',
            'Squeezing heats the gas, and the heat breaks SO₃ back apart into SO₂ and O₂.',
            'Squeezing takes away the energy of the molecules, so no forward collision can work.',
            'Squeezing makes SO₂ freeze into a solid on the walls of the cylinder.'
          ],
          correctTier2: 0,
          hint: 'Count the gas moles on each side. The left has 2 + 1 = 3. The right has 2.',
          workedSolution: 'Halving the volume doubles the pressure. The system shifts toward the side with fewer gas molecules to bring the pressure down. The left side has 3 moles of gas (2 SO₂ + 1 O₂) and the right has 2 (2 SO₃). Shifting right turns 3 gas molecules into 2.',
          givenSummary: 'Squeezing the SO₂ and SO₃ equilibrium'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-6.4_diag2',
          skillId: 'PS1-6.4',
          level: 'Level 2 (Intermediate)',
          stem: 'A cylinder holds PCl₅(g) ⇌ PCl₃(g) + Cl₂(g) at equilibrium. You push the piston in, so the gas has half the volume.',
          type: 'two_tier',
          tier1Prompt: 'Which way does the equilibrium shift?',
          tier1Options: [
            'Left, toward the reactant, making more PCl₅.',
            'Right, toward the products, making more PCl₃ and Cl₂.',
            'Neither way, because squeezing a gas does not change any rates.',
            'Neither way, because squeezing makes every molecule react at once.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Squeezing raises the pressure; shifting toward fewer gas moles (2 down to 1) lowers it again.',
            'Squeezing raises the pressure, so the system shifts toward the side with more gas moles.',
            'Squeezing heats the gas, and the heat always breaks PCl₅ into smaller molecules.',
            'Squeezing pushes the Cl₂ molecules out of the gas and onto the cylinder walls.'
          ],
          correctTier2: 0,
          hint: 'Count the gas moles on each side. The left has 1. The right has 1 + 1 = 2.',
          workedSolution: 'Halving the volume doubles the pressure. The system shifts toward the side with fewer gas molecules to bring the pressure down. The left side has 1 mole of gas (PCl₅) and the right has 2 (PCl₃ + Cl₂). Shifting left turns 2 gas molecules into 1.',
          givenSummary: 'Squeezing the PCl₅ equilibrium'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-6.4_L1',
            skillId: 'PS1-6.4',
            level: 'Level 1 (Foundational)',
            stem: 'For which reactions will changing the container volume NOT shift the equilibrium? (Select all that apply)',
            type: 'multi_select',
            options: [
              'H₂(g) + I₂(g) ⇌ 2 HI(g)',
              'N₂(g) + O₂(g) ⇌ 2 NO(g)',
              'N₂O₄(g) ⇌ 2 NO₂(g)',
              '2 CO(g) + O₂(g) ⇌ 2 CO₂(g)',
              'CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g)'
            ],
            correctIndices: [0, 1, 4],
            hint: 'Count the gas moles on each side. Look for reactions where the two sides match.',
            workedSolution: 'Volume shifts an equilibrium only when the two sides have different numbers of gas moles. In H₂ + I₂ ⇌ 2 HI, N₂ + O₂ ⇌ 2 NO, and CO + H₂O ⇌ CO₂ + H₂, both sides have 2 moles of gas. Neither side helps lower the pressure, so there is no shift.',
            givenSummary: 'Reactions where volume has no effect'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-6.4_L3',
            skillId: 'PS1-6.4',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A cylinder holds N₂O₄(g) (colorless) ⇌ 2 NO₂(g) (brown) at equilibrium. You pull the piston out, so the gas has twice the volume. Which way does it shift, and why?',
            type: 'mcq',
            options: [
              'Right, toward brown NO₂, because the side with more gas molecules raises the pressure back up.',
              'Left, toward N₂O₄, because the gas needs fewer molecules to fill a bigger space.',
              'Neither way, because the same molecules are in the cylinder before and after.',
              'Right, toward NO₂, because expanding the gas heats it up and breaks N₂O₄ apart.'
            ],
            correctIndex: 0,
            hint: 'Expanding the cylinder lowers the pressure. Which side has more gas molecules to push it back up?',
            workedSolution: 'Doubling the volume halves the pressure. The system shifts toward the side with more gas molecules to raise it again. One N₂O₄ becomes two NO₂, so the shift is to the right, and the mixture gets browner.',
            givenSummary: 'Expanding the N₂O₄ and NO₂ equilibrium'
          };
        }
      ]
    },
    {
      id: 'PS1-6.5',
      title: 'Engineering Industrial Systems: The Haber-Bosch Process',
      subtitle: 'Refine an industrial process by trading yield against speed with pressure, temperature, a catalyst, and product removal.',
      watchOut: 'For an exothermic reaction, a low temperature gives the most product at equilibrium, but the reaction becomes far too slow. Real plants use a middle temperature, a catalyst, high pressure, and remove the product as it forms.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-6.5_diag',
          skillId: 'PS1-6.5',
          level: 'Level 2 (Intermediate)',
          stem: 'In the Haber-Bosch process, N₂(g) + 3 H₂(g) ⇌ 2 NH₃(g) + 92 kJ. Engineers keep cooling the gas so NH₃ turns to liquid, and they drain the liquid away. What is the effect?',
          type: 'two_tier',
          tier1Prompt: 'What does draining the liquid ammonia do?',
          tier1Options: [
            'The equilibrium keeps shifting forward, so far more of the reactants become ammonia.',
            'The equilibrium shifts in reverse, turning the remaining ammonia back into N₂ and H₂.',
            'The liquid droplets ruin the catalyst, so the reaction stops for good.',
            'The reaction comes to a standstill, with all forward and reverse collisions stopped.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Removing NH₃ gas slows the reverse reaction, so the forward reaction keeps outrunning it.',
            'Turning NH₃ to liquid heats the reactor, which helps break the N≡N triple bond.',
            'Liquid ammonia on the walls makes an electric field that speeds up the hydrogen.',
            'Draining the liquid makes a vacuum that pulls the reactant gases together.'
          ],
          correctTier2: 0,
          hint: 'Turning NH₃ into a liquid removes it from the gas. How does that change the reverse reaction?',
          workedSolution: 'Turning NH₃ into a liquid takes it out of the gas mixture, so the reverse reaction slows down. The forward reaction keeps outrunning the reverse, so the system keeps shifting forward. Unreacted N₂ and H₂ are sent around again, and most of them end up as ammonia.',
          givenSummary: 'Haber-Bosch: draining the product'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-6.5_diag2',
          skillId: 'PS1-6.5',
          level: 'Level 2 (Intermediate)',
          stem: 'In the Haber-Bosch process, N₂(g) + 3 H₂(g) ⇌ 2 NH₃(g) + 92 kJ. Engineers run the reactor at about 200 atm instead of 1 atm. What is the effect?',
          type: 'two_tier',
          tier1Prompt: 'What does the high pressure do to the ammonia yield?',
          tier1Options: [
            'The equilibrium shifts forward, so a larger share of the gas becomes ammonia.',
            'The equilibrium shifts in reverse, so ammonia breaks back into N₂ and H₂.',
            'Pressure has no effect, because the catalyst decides how much ammonia forms.',
            'The reaction stops, because squeezed molecules can no longer move to collide.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'With 4 gas moles on the left and 2 on the right, high pressure favors the right.',
            'High pressure heats the gas, and that extra heat favors the exothermic forward reaction.',
            'High pressure lowers the activation barrier, so only the forward reaction can still run.',
            'High pressure breaks the N≡N triple bond, so nitrogen atoms are free to react.'
          ],
          correctTier2: 0,
          hint: 'Count the gas moles: 1 N₂ + 3 H₂ on the left, 2 NH₃ on the right.',
          workedSolution: 'The left side has 4 moles of gas (1 N₂ + 3 H₂) and the right has 2 (2 NH₃). High pressure shifts the equilibrium toward fewer gas molecules, so more ammonia forms. Crowding the gas also makes collisions more frequent, so the reaction runs faster. A catalyst speeds things up but does not change the yield.',
          givenSummary: 'Haber-Bosch: running at high pressure'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-6.5_L1',
            skillId: 'PS1-6.5',
            level: 'Level 1 (Foundational)',
            stem: 'Why do Haber-Bosch plants add an iron catalyst to the reactor?',
            type: 'mcq',
            options: [
              'It speeds up the forward and reverse reactions equally, so equilibrium arrives sooner with the same yield.',
              'It shifts the equilibrium toward ammonia by lowering the barrier for the forward reaction only.',
              'It uses up the extra nitrogen gas, so the hydrogen can react without getting in the way.',
              'It turns every bit of the reactants into ammonia, so nothing is left over.'
            ],
            correctIndex: 0,
            hint: 'A catalyst offers a lower path over the hill, for both directions.',
            workedSolution: 'A catalyst lowers the activation energy for the forward and reverse reactions by the same amount. The reaction reaches equilibrium sooner, but the amount of ammonia at equilibrium stays the same.',
            givenSummary: 'What the iron catalyst does'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-6.5_L3',
            skillId: 'PS1-6.5',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Le Chatelier\'s principle predicts more ammonia at equilibrium at 25 °C than at 450 °C. Why do Haber-Bosch plants run at 450 °C anyway?',
            type: 'mcq',
            options: [
              'At 25 °C, almost no collisions have enough energy, so the reaction is far too slow to be useful.',
              'Nitrogen and hydrogen turn solid below 400 °C and block the pipes into the plant.',
              'The iron catalyst only works once it is hot enough to melt into liquid droplets.',
              'At 25 °C, ammonia breaks apart on its own and the pieces damage the steel walls.'
            ],
            correctIndex: 0,
            hint: 'A high yield does not help if the reaction takes years to get there. Think about yield against speed.',
            workedSolution: 'This is the trade-off between yield and speed. Low temperatures favor ammonia at equilibrium, but breaking the N≡N triple bond needs a large activation energy. At 25 °C almost no collisions have enough energy, so the reaction barely runs. A middle temperature of 450 °C with a catalyst makes ammonia fast enough to be worth it.',
            givenSummary: 'Haber-Bosch: why 450 °C'
          };
        }
      ]
    },
    {
      id: 'PS1-6.6',
      title: 'Coupled Equilibria & Blood Buffers',
      subtitle: 'Use Le Chatelier\'s principle on the blood buffer to predict what fast or slow breathing does to blood pH.',
      watchOut: 'The blood buffer links your lungs to your blood. Breathing fast blows off CO₂, so the buffer shifts left and uses up H⁺: pH rises (alkalosis). Breathing too slowly traps CO₂, so the buffer shifts right and makes H⁺: pH falls (acidosis).',
      diagnostic: function(rng) {
        return {
          id: 'PS1-6.6_diag',
          skillId: 'PS1-6.6',
          level: 'Level 2 (Intermediate)',
          stem: 'Blood pH is held steady by CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻. A person breathing very fast (hyperventilating) blows off CO₂. What happens to blood pH?',
          type: 'two_tier',
          tier1Prompt: 'Choose the effect on blood pH:',
          tier1Options: [
            'Blood pH rises above normal (alkalosis), because the amount of H⁺ drops.',
            'Blood pH falls below normal (acidosis), because the amount of H⁺ rises.',
            'Blood pH stays at exactly 7.40, because breathing cannot affect the buffer.',
            'Blood pH falls to zero, because breathing out destroys the buffer completely.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Breathing out CO₂ removes a reactant, so both steps shift left and use up H⁺.',
            'Breathing out CO₂ adds oxygen to the blood, and the oxygen makes an acid.',
            'Fast breathing cools the lungs, which splits water into extra H⁺ and OH⁻.',
            'Fast breathing stops red blood cells from releasing bicarbonate into the blood.'
          ],
          correctTier2: 0,
          hint: 'Removing CO₂ takes a reactant away from the far left. What happens to H⁺ on the far right? Less H⁺ means higher pH.',
          workedSolution: 'Fast breathing removes CO₂ from the blood. Both linked steps shift left to replace it: H⁺ + HCO₃⁻ -> H₂CO₃ -> CO₂ + H₂O. That uses up H⁺. Less H⁺ means a higher pH, above 7.45: respiratory alkalosis.',
          givenSummary: 'Hyperventilation and blood pH'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-6.6_diag2',
          skillId: 'PS1-6.6',
          level: 'Level 2 (Intermediate)',
          stem: 'Blood pH is held steady by CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻. On a long run, your muscles send extra CO₂ into your blood. What happens to blood pH before your breathing speeds up?',
          type: 'two_tier',
          tier1Prompt: 'Choose the effect on blood pH:',
          tier1Options: [
            'Blood pH falls a little, because the extra CO₂ makes more H⁺.',
            'Blood pH rises a little, because the extra CO₂ uses up H⁺.',
            'Blood pH stays at exactly 7.40, because CO₂ is not an acid.',
            'Blood pH rises, because running adds oxygen to the blood.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Adding CO₂ adds a reactant on the far left, so both steps shift right and make more H⁺.',
            'Adding CO₂ removes a product on the far right, so both steps shift left and use up H⁺.',
            'Running warms the blood, and warm blood holds fewer H⁺ ions than cool blood.',
            'Extra CO₂ stops red blood cells from releasing bicarbonate into the blood.'
          ],
          correctTier2: 0,
          hint: 'CO₂ sits on the far left. Adding a reactant pushes both linked steps the same way. Where does H⁺ sit?',
          workedSolution: 'The extra CO₂ adds a reactant to the far left. Both linked steps shift right to use it: CO₂ + H₂O -> H₂CO₃ -> H⁺ + HCO₃⁻. That makes more H⁺, so blood pH falls a little. Your body answers by breathing faster, which blows off CO₂ and shifts the buffer back to the left.',
          givenSummary: 'Exercise, CO₂ and blood pH'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-6.6_L1',
            skillId: 'PS1-6.6',
            level: 'Level 1 (Foundational)',
            stem: 'During a hard sprint, your muscles release lactic acid, which adds H⁺ to your blood. Which part of the buffer reacts with this extra H⁺ to keep blood pH steady?',
            type: 'mcq',
            options: [
              'Bicarbonate ions (HCO₃⁻), which combine with H⁺ to make carbonic acid (H₂CO₃).',
              'Carbon dioxide (CO₂), which combines with H⁺ to make more bicarbonate ions.',
              'Water (H₂O), which takes in the H⁺ and turns it into hydrogen gas.',
              'Sodium ions (Na⁺), which take the H⁺ out of the blood and into the lungs.'
            ],
            correctIndex: 0,
            hint: 'A buffer has a base that can take in extra H⁺. Look for the negative ion in the equation.',
            workedSolution: 'Bicarbonate (HCO₃⁻) is the base in the buffer. It combines with the extra H⁺: H⁺ + HCO₃⁻ -> H₂CO₃. The carbonic acid breaks down to CO₂ and water, and you breathe out the CO₂. Blood pH stays near 7.40.',
            givenSummary: 'Bicarbonate takes up extra H⁺'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-6.6_L3',
            skillId: 'PS1-6.6',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'During a severe asthma attack, a person cannot breathe out CO₂ fast enough. Use CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻ to predict what happens to blood pH.',
            type: 'mcq',
            options: [
              'Trapped CO₂ pushes both steps right, making extra H⁺, so pH falls below 7.35 (acidosis).',
              'Trapped CO₂ pushes both steps left, using up H⁺, so pH rises above 7.45 (alkalosis).',
              'Carbonic acid turns into solid stones, so the H⁺ level in the blood stays the same.',
              'The lungs soak up all the extra H⁺, so blood pH stays normal for as long as the attack lasts.'
            ],
            correctIndex: 0,
            hint: 'CO₂ builds up in the blood. Adding a reactant on the far left pushes the system which way?',
            workedSolution: 'CO₂ that cannot be breathed out builds up in the blood. The extra reactant pushes both linked steps to the right: CO₂ + H₂O -> H₂CO₃ -> H⁺ + HCO₃⁻. That makes extra H⁺, so blood pH falls below 7.35: respiratory acidosis.',
            givenSummary: 'Slow breathing and blood pH'
          };
        }
      ]
    }
  ];

  window.PE_DATA_HS_PS1_6 = {
    info: PE_INFO,
    skills: SKILLS
  };
})();
