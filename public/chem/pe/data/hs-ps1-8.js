/**
 * HS-PS1-8: Nuclear Processes & Radioactive Decay
 * Items rewritten (Oct 2026) to the Tier 3 register in docs/textbook/VOICE.md and to the core scope
 * of lessons 5-8a and 5-1a: alpha, beta, and gamma decay; nucleon and charge conservation;
 * half-life as half of the sample remaining after each period; fission and fusion as changes to the
 * nucleus that release millions of times more energy than chemical bonds.
 * Removed out-of-scope jargon (antineutrinos, K-shell capture, quantum tunneling, borated concrete,
 * and the Enrichment multiplication factor k).
 * Zero em-dash compliant: hyphens, colons, and parentheses only.
 */
(function() {
  'use strict';

  // Calculation items pick their numbers per run (see ../pe-num.js).
  const { pick, fix } = window.PE_NUM;

  const PE_INFO = {
    id: 'HS-PS1-8',
    code: 'PS1-8',
    title: 'Nuclear Processes & Radioactive Decay',
    unit: 'Unit 5: Nuclear & Stellar Chemistry',
    description: 'Develop models to illustrate the changes in the composition of the nucleus of the atom and the energy released during the processes of fission, fusion, and radioactive decay.',
    clarification: 'Emphasis is on simple qualitative models, such as pictures or diagrams, and on the scale of energy released in nuclear processes relative to other kinds of processes.',
    assessmentBoundary: 'Assessment does not include quantitative calculation of energy released. Assessment is limited to alpha, beta, and gamma radioactive decays.'
  };

  const SKILLS = [
    {
      id: 'PS1-8.1',
      title: 'Nuclear Composition & Stability',
      subtitle: 'Count protons and neutrons from a nuclear symbol and explain how the strong nuclear force holds a nucleus together.',
      watchOut: 'The top number is the mass number A (protons + neutrons), and the bottom number is the atomic number Z (protons). Positive protons push each other apart, so the nucleus stays together only because the strong nuclear force pulls nearby protons and neutrons together.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-8.1_diag',
          skillId: 'PS1-8.1',
          level: 'Level 2 (Intermediate)',
          stem: 'Lead-206 is a stable heavy nucleus written as ²⁰⁶₈₂Pb.',
          type: 'two_tier',
          tier1Prompt: 'How many protons and neutrons are in the nucleus of ²⁰⁶₈₂Pb?',
          tier1Options: [
            '82 protons and 124 neutrons, adding up to a mass number of 206.',
            '82 neutrons and 124 protons, with 206 electrons in the outer shells.',
            '206 protons and 82 neutrons held together by shared electrons.',
            '82 protons and 82 neutrons, plus 42 alpha particles.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why doesn\'t a nucleus with 82 positive protons fly apart?',
          tier2Options: [
            'The neutrons add strong nuclear pull between neighbors without adding any electric repulsion.',
            'The outer electrons push inward and squeeze the protons together.',
            'Protons lose their positive charge once they are packed inside a heavy nucleus.',
            'Gravity between the protons is stronger than their electric repulsion.'
          ],
          correctTier2: 0,
          hint: 'A = protons + neutrons, and Z = protons. Then think about what neutrons add: strong nuclear pull, with zero electric charge.',
          workedSolution: 'In ²⁰⁶₈₂Pb, the bottom number gives 82 protons and the top number gives 206 total nucleons, so there are 206 - 82 = 124 neutrons. All 82 protons repel each other electrically. The 124 neutrons add strong nuclear attraction to their neighbors without adding any positive charge, holding the nucleus together.',
          givenSummary: 'Lead-206 protons, neutrons, and strong nuclear force'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-8.1_diag2',
          skillId: 'PS1-8.1',
          level: 'Level 2 (Intermediate)',
          stem: 'Strontium-88 is a stable nucleus written as ⁸⁸₃₈Sr.',
          type: 'two_tier',
          tier1Prompt: 'How many protons and neutrons are in the nucleus of ⁸⁸₃₈Sr?',
          tier1Options: [
            '38 protons and 50 neutrons, adding up to a mass number of 88.',
            '50 protons and 38 neutrons, with 88 electrons around the nucleus.',
            '88 protons and 38 neutrons, held together by shared electrons.',
            '38 protons and 88 neutrons, because the top number counts neutrons.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What holds the 38 protons together, even though they repel each other?',
          tier2Options: [
            'The strong nuclear force pulls neighboring protons and neutrons together across tiny distances.',
            'The electrons around the nucleus pull the protons in toward each other.',
            'Neutrons carry a negative charge that cancels the positive charge of the protons.',
            'Protons packed tightly together lose their charge and stop repelling each other.'
          ],
          correctTier2: 0,
          hint: 'Z (bottom) counts protons. A (top) counts protons plus neutrons. Then ask what neutrons add without adding charge.',
          workedSolution: 'The bottom number gives 38 protons. The top number gives 88 nucleons in total, so there are 88 - 38 = 50 neutrons. The 38 protons push each other apart electrically. The strong nuclear force pulls every neighboring proton and neutron together, and the neutrons add that pull without adding any charge. A common slip is thinking neutrons are negative; they have no charge at all.',
          givenSummary: 'Strontium-88 protons, neutrons, and the strong nuclear force'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-8.1_L1',
            skillId: 'PS1-8.1',
            level: 'Level 1 (Foundational)',
            stem: 'Which statements about an atomic nucleus are true? (Select ALL that apply)',
            type: 'multi_select',
            options: [
              'The mass number (A) is the total number of protons plus neutrons in the nucleus.',
              'The strong nuclear force pulls nearby protons and neutrons together over very short distances.',
              'Heavy stable nuclei need more neutrons than protons to hold the nucleus together.',
              'Electrons sit inside the nucleus and glue the protons together with covalent bonds.',
              'Positive protons in the nucleus push each other apart with electric force.'
            ],
            correctIndices: [0, 1, 2, 4],
            hint: 'Protons and neutrons sit in the nucleus; electrons occupy shells outside it.',
            workedSolution: 'A nucleus contains protons and neutrons (mass number A). Protons push each other apart electrically, while the short-range strong nuclear force pulls neighboring nucleons together. Heavier stable nuclei need extra neutrons to supply more strong force without adding repulsion. Electrons stay in shells outside the nucleus.',
            givenSummary: 'Core facts about the nucleus and the strong force'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-8.1_L3',
            skillId: 'PS1-8.1',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Every element with more than 82 protons (such as uranium, Z = 92) is unstable and radioactive, no matter how many neutrons it has. Why?',
            type: 'mcq',
            options: [
              'The strong force reaches only next-door neighbors, while electric repulsion acts across the whole nucleus.',
              'Heavy atoms do not have enough electron shells to keep gravity from crushing the nucleus.',
              'Neutrons turn positive inside very heavy atoms and start pushing the protons apart.',
              'Light moves slower inside a large nucleus, which shuts off the strong nuclear force.'
            ],
            correctIndex: 0,
            hint: 'Compare how far the strong nuclear force reaches with how far electric repulsion between protons reaches.',
            workedSolution: 'The strong nuclear force only pulls on nucleons that touch right next to each other, while every proton pushes away every other proton all the way across the nucleus. Past Z = 82, the nucleus is so wide that electric repulsion wins out, and the nucleus eventually decays.',
            givenSummary: 'Why nuclei with Z > 82 are unstable'
          };
        }
      ]
    },
    {
      id: 'PS1-8.2',
      title: 'Alpha & Beta Decay',
      subtitle: 'Balance nuclear equations for alpha and beta decay by keeping the top numbers and bottom numbers equal on both sides.',
      watchOut: 'In a nuclear equation, the sum of the mass numbers (top) and the sum of the atomic numbers (bottom) must match on both sides. In beta decay, a neutron turns into a proton and an electron (⁰₋₁e), so A stays the same and Z goes up by 1.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-8.2_diag',
          skillId: 'PS1-8.2',
          level: 'Level 2 (Intermediate)',
          stem: 'Uranium-238 decays by giving off an alpha particle: ²³⁸₉₂U -> ²³⁴₉₀Th + ⁴₂He.',
          type: 'two_tier',
          tier1Prompt: 'How do the mass number and atomic number of the nucleus change in alpha decay?',
          tier1Options: [
            'The nucleus loses 2 protons and 2 neutrons, so A drops by 4 and Z drops by 2.',
            'The nucleus gives off an electron, so Z goes up by 1 while A stays the same.',
            'The nucleus takes in a neutron, so A goes up by 1 and Z stays the same.',
            'The nucleus splits into two equal halves, cutting both the mass number and atomic number in half.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What rule keeps a nuclear equation balanced?',
          tier2Options: [
            'The total nucleon count (top numbers) and total nuclear charge (bottom numbers) stay the same on both sides.',
            'The element symbol on the left must always match the element symbol on the right.',
            'The number of outer electron shells must stay the same before and after the decay.',
            'The mass lost in the decay turns into extra neutrons so both sides weigh the same.'
          ],
          correctTier2: 0,
          hint: 'An alpha particle is a helium-4 nucleus (⁴₂He). Check the addition on the top line (238 = 234 + 4) and the bottom line (92 = 90 + 2).',
          workedSolution: 'An alpha particle (⁴₂He) carries away 2 protons and 2 neutrons. That lowers the mass number by 4 (238 -> 234) and the atomic number by 2 (92 -> 90, changing uranium into thorium). Both totals match on the two sides of the arrow.',
          givenSummary: 'Balancing alpha decay of uranium-238'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-8.2_diag2',
          skillId: 'PS1-8.2',
          level: 'Level 2 (Intermediate)',
          stem: 'Strontium-90 decays by giving off a beta particle: ⁹⁰₃₈Sr -> ⁹⁰₃₉Y + ⁰₋₁e.',
          type: 'two_tier',
          tier1Prompt: 'How do the mass number and atomic number of the nucleus change in beta decay?',
          tier1Options: [
            'A neutron turns into a proton and an electron, so Z goes up by 1 and A stays the same.',
            'The nucleus loses 2 protons and 2 neutrons, so A drops by 4 and Z drops by 2.',
            'The atom loses an electron from its outer shell, so Z drops by 1 and A stays the same.',
            'The nucleus takes in a proton from outside, so both A and Z go up by 1.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What rule keeps a nuclear equation balanced?',
          tier2Options: [
            'The top numbers add to 90 and the bottom numbers add to 38 on both sides of the arrow.',
            'The element symbol must stay the same before and after the decay happens.',
            'An electron has a mass number of 0, so a beta decay equation does not need to balance.',
            'The bottom numbers balance only when the electron is counted as +1 instead of -1.'
          ],
          correctTier2: 0,
          hint: 'Check the top line (90 = 90 + 0) and the bottom line. What is 39 + (-1)?',
          workedSolution: 'In beta decay, a neutron in the nucleus turns into a proton and an electron, and the electron flies out. The nucleus gains a proton, so Z rises from 38 to 39 and strontium becomes yttrium. It lost a neutron and gained a proton, so A stays at 90. Both lines balance: 90 = 90 + 0, and 38 = 39 + (-1).',
          givenSummary: 'Balancing beta decay of strontium-90'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-8.2_L1',
            skillId: 'PS1-8.2',
            level: 'Level 1 (Foundational)',
            stem: 'Carbon-14 decays into nitrogen-14 by beta decay: ¹⁴₆C -> ¹⁴₇N + ⁰₋₁e. What happens inside the nucleus during this decay?',
            type: 'mcq',
            options: [
              'One neutron turns into a proton, and a fast beta electron shoots out of the nucleus.',
              'One proton turns into a neutron by pulling in an outer valence electron.',
              'Two protons and two neutrons leave the nucleus together as a helium nucleus.',
              'An electron from the inner shell falls into the nucleus and stays there.'
            ],
            correctIndex: 0,
            hint: 'Look at the numbers on ¹⁴₆C and ¹⁴₇N: the total nucleon count stays 14, while the proton count goes up from 6 to 7.',
            workedSolution: 'In beta decay, a neutron inside the nucleus changes into a proton and a beta electron (⁰₋₁e). The electron shoots out, while the new proton stays behind, raising Z from 6 (carbon) to 7 (nitrogen) without changing the mass number (14).',
            givenSummary: 'What happens inside the nucleus during beta decay'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-8.2_L3',
            skillId: 'PS1-8.2',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A decay chain starts with thorium-232 (²³²₉₀Th) and ends at stable lead-208 (²⁰⁸₈₂Pb). How many alpha particles (⁴₂He) and beta particles (⁰₋₁e) are given off in total along the way?',
            type: 'mcq',
            options: [
              '6 alpha particles and 4 beta particles.',
              '8 alpha particles and 2 beta particles.',
              '4 alpha particles and 6 beta particles.',
              '12 alpha particles and 8 beta particles.'
            ],
            correctIndex: 0,
            hint: 'Only alpha particles change the mass number (by 4 each). Find the number of alpha decays from 232 - 208 first, then adjust Z with beta decays.',
            workedSolution: 'The mass number drops by 232 - 208 = 24. Because beta particles have mass number 0 and each alpha particle carries away 4, there must be 24 / 4 = 6 alpha decays. Six alpha decays lower Z by 6 x 2 = 12 (from 90 down to 78). To end at lead (Z = 82), the chain needs 82 - 78 = 4 beta decays, each raising Z by 1.',
            givenSummary: 'Counting alpha and beta steps from Th-232 to Pb-208'
          };
        }
      ]
    },
    {
      id: 'PS1-8.3',
      title: 'Alpha, Beta & Gamma Radiation',
      subtitle: 'Compare alpha, beta, and gamma radiation by their mass, charge, and what it takes to block them.',
      watchOut: 'Gamma rays are high-energy photons with zero mass and zero charge, so they change neither A nor Z and pass deep into matter. Alpha particles are heavy and 2+ charged: a sheet of paper or outer dead skin stops them, but they are very dangerous if breathed in or swallowed.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-8.3_diag',
          skillId: 'PS1-8.3',
          level: 'Level 2 (Intermediate)',
          stem: 'Cobalt-60 gives off both beta particles and gamma rays. Outside the body, gamma rays are much harder to shield against than alpha or beta particles.',
          type: 'two_tier',
          tier1Prompt: 'How does the penetrating power of gamma rays compare with alpha and beta particles?',
          tier1Options: [
            'Gamma rays pass much deeper through matter and take thick lead or concrete to block.',
            'Gamma rays are heavy charged particles that are stopped by a single sheet of paper.',
            'Gamma rays carry a positive charge, so they bounce harmlessly off lab coats.',
            'Gamma rays stop in a few centimeters of air because they move slower than sound.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why do gamma rays travel so far through matter?',
          tier2Options: [
            'Gamma rays are photons with no mass and no electric charge, so atoms rarely slow them down.',
            'Gamma rays have a 2+ charge that pulls electrons out of the way to clear a path.',
            'Gamma rays weigh more than alpha particles, so they plow straight through thin metal.',
            'Gamma rays bounce off nuclei like rubber balls without ever being absorbed.'
          ],
          correctTier2: 0,
          hint: 'Charged particles push and pull on every electron they pass. What mass and charge does a gamma photon have?',
          workedSolution: 'Gamma rays are high-energy photons with zero mass and zero charge. Because they do not push or pull electrically on every atom they pass, they travel deep into matter and require thick lead or concrete shielding.',
          givenSummary: 'Why gamma rays penetrate deeper than alpha or beta particles'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-8.3_diag2',
          skillId: 'PS1-8.3',
          level: 'Level 2 (Intermediate)',
          stem: 'A school demo source gives off beta particles. A sheet of paper barely lowers the Geiger counter reading, but a 3 mm sheet of aluminum stops almost all of it.',
          type: 'two_tier',
          tier1Prompt: 'How does the penetrating power of beta particles compare with alpha and gamma?',
          tier1Options: [
            'Beta gets through paper, unlike alpha, but a few millimeters of aluminum stop it.',
            'Beta is stopped by a sheet of paper, the same as alpha particles are.',
            'Beta gets through thick lead and concrete, the same as gamma rays do.',
            'Beta cannot travel through air at all, so it never reaches the paper.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why do beta particles travel further than alpha but not as far as gamma?',
          tier2Options: [
            'A beta particle is a light electron with a 1- charge, so it slows less than alpha.',
            'A beta particle has no charge, so the atoms in paper cannot slow it down at all.',
            'A beta particle is a helium nucleus, so only a metal sheet is heavy enough to stop it.',
            'A beta particle is a photon, so it loses energy only when it enters a metal.'
          ],
          correctTier2: 0,
          hint: 'Compare charge and mass. Alpha is heavy and 2+. Gamma has no mass and no charge. Where does an electron fit?',
          workedSolution: 'A beta particle is a fast electron: small mass and a 1- charge. Its charge pulls on the electrons in every atom it passes, so it slows down, but less than a heavy 2+ alpha particle. Paper is too thin to stop it, but a few millimeters of aluminum is enough. A gamma photon has no charge, so it passes far deeper.',
          givenSummary: 'Where beta penetration fits between alpha and gamma'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-8.3_L1',
            skillId: 'PS1-8.3',
            level: 'Level 1 (Foundational)',
            stem: 'What is the thinnest barrier that will completely stop alpha particles from a source such as americium-241?',
            type: 'mcq',
            options: [
              'A single sheet of paper or outer dead skin.',
              'A solid block of lead at least ten centimeters thick.',
              'A sheet of aluminum foil wrapped around a steel box.',
              'A one-meter-thick wall of dense concrete.'
            ],
            correctIndex: 0,
            hint: 'Alpha particles (⁴₂He) are the heaviest of the three and carry a 2+ charge, so they hit atoms right away.',
            workedSolution: 'Because alpha particles have a mass of 4 u and a 2+ charge, they collide with molecules and lose their energy within a few centimeters of air. A sheet of paper or the outer layer of dead skin stops them.',
            givenSummary: 'What stops alpha particles'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-8.3_L3',
            skillId: 'PS1-8.3',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Alpha particles cannot get through the dead outer layer of your skin, yet breathing in radon-222 gas (an alpha emitter) is a major cause of lung cancer. Why is an alpha emitter so dangerous inside the lungs?',
            type: 'mcq',
            options: [
              'With no dead skin in the way, heavy 2+ alpha particles dump all their energy right into living lung cells.',
              'Once dissolved in blood, alpha particles speed up to the speed of light and turn into gamma rays.',
              'Alpha particles fuse with water in the lungs and turn it into concentrated hydrochloric acid.',
              'Breathing in radon gas turns the calcium in your bones into radioactive uranium atoms.'
            ],
            correctIndex: 0,
            hint: 'Outside the body, dead skin takes the hit. What happens when the alpha particle starts right next to living lung cells?',
            workedSolution: 'The same reason alpha particles stop in a short distance makes them destructive inside the body: their large mass and 2+ charge dump all of their ionizing energy into a tiny spot. Inside the lungs, with no dead skin layer in the way, that energy goes straight into living cells and damages their DNA.',
            givenSummary: 'Why alpha emitters are dangerous when inhaled'
          };
        }
      ]
    },
    {
      id: 'PS1-8.4',
      title: 'Half-Life',
      subtitle: 'Use half-life to find how much of a radioactive sample remains after 1, 2, 3, or 4 half-lives.',
      watchOut: 'After each half-life, HALF of the remaining radioactive nuclei decay: 1 -> 1/2 -> 1/4 -> 1/8 -> 1/16. A sample does not drop to zero after two half-lives, and heating or pressurizing a sample does not change its half-life.',
      diagnostic: function(rng) {
        const m = pick(rng, [80, 64, 120]);
        return {
          id: 'PS1-8.4_diag',
          skillId: 'PS1-8.4',
          level: 'Level 2 (Intermediate)',
          stem: `Iodine-131 has a half-life of 8.0 days. A hospital receives ${fix(m, 1)} mg of iodine-131.`,
          type: 'two_tier',
          tier1Prompt: 'How much iodine-131 remains after 24.0 days?',
          tier1Options: [
            `${fix(m / 8, 1)} mg of iodine-131 remains.`,
            `${fix(m / 4, 1)} mg of iodine-131 remains.`,
            '0.0 mg of iodine-131 remains.',
            `${fix(m / 2, 1)} mg of iodine-131 remains.`
          ],
          correctTier1: 0,
          tier2Prompt: 'Which calculation supports your answer?',
          tier2Options: [
            `24.0 days is 3 half-lives, so the mass halves three times: ${m} to ${m / 2} to ${m / 4} to ${m / 8} mg.`,
            `A quarter of the starting mass decays every 8 days, leaving ${m / 4} mg after 24 days.`,
            'Two half-lives use up the whole sample, so nothing is left after 16 days.',
            'The half-life doubles every 8 days as the radioactive sample gets smaller.'
          ],
          correctTier2: 0,
          hint: `First find how many 8.0-day half-lives fit into 24.0 days. Then cut ${fix(m, 1)} mg in half that many times.`,
          workedSolution: `24.0 days / 8.0 days = 3 half-lives. Cut the starting ${fix(m, 1)} mg in half three times: after 8 days, ${fix(m / 2, 1)} mg; after 16 days, ${fix(m / 4, 1)} mg; after 24 days, ${fix(m / 8, 1)} mg. Each half-life removes half of what is left, not a fixed amount.`,
          givenSummary: 'Iodine-131 remaining after 3 half-lives'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        const m = pick(rng, [40, 48, 64]);
        return {
          id: 'PS1-8.4_diag2',
          skillId: 'PS1-8.4',
          level: 'Level 2 (Intermediate)',
          stem: `A lab has ${fix(m, 1)} mg of a radioactive isotope with a half-life of 6.0 hours.`,
          type: 'two_tier',
          tier1Prompt: 'How much of the isotope remains after 24.0 hours?',
          tier1Options: [
            `${fix(m / 16, 1)} mg of the isotope remains.`,
            `${fix(m / 8, 1)} mg of the isotope remains.`,
            `${fix(m / 4, 1)} mg of the isotope remains.`,
            '0.0 mg of the isotope remains.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which calculation supports your answer?',
          tier2Options: [
            `24.0 hours is 4 half-lives, so the mass halves four times: ${m} to ${m / 2} to ${m / 4} to ${m / 8} to ${m / 16} mg.`,
            `A quarter of the starting ${m} mg decays every 6 hours, so all of it is gone after 24 hours.`,
            'Two half-lives use up the whole sample, so nothing is left after 12 hours.',
            `The first 6 hours do not count as a half-life, so the mass halves only three times to ${m / 8} mg.`
          ],
          correctTier2: 0,
          hint: `First find how many 6.0-hour half-lives fit into 24.0 hours. Then halve ${fix(m, 1)} mg that many times.`,
          workedSolution: `24.0 hours / 6.0 hours = 4 half-lives. Halve the starting ${fix(m, 1)} mg four times: ${fix(m / 2, 1)} mg after 6 hours, ${fix(m / 4, 1)} mg after 12, ${fix(m / 8, 1)} mg after 18, and ${fix(m / 16, 1)} mg after 24. Each half-life removes half of what is left, not half of what you started with, so the sample never drops straight to zero.`,
          givenSummary: 'A 6.0-hour isotope after 4 half-lives'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-8.4_L1',
            skillId: 'PS1-8.4',
            level: 'Level 1 (Foundational)',
            stem: 'A sealed radioactive sample has a half-life of 10 minutes. If you heat the container from 20 °C to 500 °C, what happens to its half-life?',
            type: 'mcq',
            options: [
              'Nothing; half-life is set by the nucleus and does not change with temperature or pressure.',
              'The half-life drops to 2 minutes because heat helps the nuclei cross an activation barrier.',
              'The half-life grows longer because faster electrons squeeze the nucleus together.',
              'Decay stops completely until the sample cools back down to 20 °C.'
            ],
            correctIndex: 0,
            hint: 'Warming speeds up molecules bumping each other\'s outer electron shells. Does laboratory heat reach the forces inside the nucleus?',
            workedSolution: 'Radioactive decay happens inside the nucleus, which is unaffected by laboratory temperatures, pressures, or chemical bonding. The half-life stays 10 minutes.',
            givenSummary: 'Why heating a sample does not change its half-life'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-8.4_L3',
            skillId: 'PS1-8.4',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A piece of charcoal from an ancient campfire has 1/8 (12.5%) as much carbon-14 as living wood. One half-life of carbon-14 is 5,730 years. How old is the charcoal?',
            type: 'mcq',
            options: [
              '17,190 years old (3 half-lives have passed).',
              '11,460 years old (2 half-lives have passed).',
              '22,920 years old (4 half-lives have passed).',
              '45,840 years old (8 half-lives have passed).'
            ],
            correctIndex: 0,
            hint: 'Count how many times you divide 1 by 2 to reach 1/8 (1 -> 1/2 -> 1/4 -> 1/8). Then multiply by 5,730 years.',
            workedSolution: 'Halving three times gives 1 -> 1/2 -> 1/4 -> 1/8, so 3 half-lives have passed since the wood stopped taking in carbon. 3 x 5,730 years = 17,190 years.',
            givenSummary: 'Carbon-14 dating across 3 half-lives'
          };
        }
      ]
    },
    {
      id: 'PS1-8.5',
      title: 'Nuclear Fission & Chain Reactions',
      subtitle: 'Model how a neutron splits a heavy nucleus into two smaller nuclei and releases more neutrons.',
      watchOut: 'Fission splits one heavy nucleus (like uranium-235) into two middle-weight nuclei and frees 2 or 3 neutrons. Even though new elements form, the total number of protons and the total number of neutrons stay the same before and after.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-8.5_diag',
          skillId: 'PS1-8.5',
          level: 'Level 2 (Intermediate)',
          stem: 'In a nuclear reactor, a slow neutron hits uranium-235: ¹₀n + ²³⁵₉₂U -> ¹⁴¹₅₆Ba + ⁹²₃₆Kr + 3 ¹₀n + energy.',
          type: 'two_tier',
          tier1Prompt: 'Why can a single fission event set off a chain reaction?',
          tier1Options: [
            'Each split releases 3 new neutrons that can go on to split nearby U-235 nuclei.',
            'Each split gives off light that melts the rest of the fuel rod.',
            'The barium and krypton nuclei fuse back into uranium and split all over again.',
            'The split creates an electric current that pulls other uranium atoms together.'
          ],
          correctTier1: 0,
          tier2Prompt: 'How does a nuclear power plant keep that chain reaction steady instead of letting it run away?',
          tier2Options: [
            'Control rods made of neutron-absorbing material soak up extra neutrons so only one continues the chain.',
            'Liquid oxygen is pumped into the core to put out the extra neutrons.',
            'The fuel rods are cooled to absolute zero so neutrons stop moving.',
            'Magnets bend the neutrons away from the uranium and out through the smokestack.'
          ],
          correctTier2: 0,
          hint: 'One neutron goes in on the left, and three come out on the right. What happens if two of those three are absorbed by control rods?',
          workedSolution: 'One neutron splits a U-235 nucleus and frees 3 neutrons. If all 3 split more nuclei, the reaction grows rapidly. Lowering control rods absorbs the extra neutrons so that, on average, just one neutron from each split triggers the next split, keeping the power steady.',
          givenSummary: 'How neutrons drive a fission chain reaction and how control rods steady it'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-8.5_diag2',
          skillId: 'PS1-8.5',
          level: 'Level 2 (Intermediate)',
          stem: 'Uranium-235 can also split this way: ¹₀n + ²³⁵₉₂U -> ¹⁴⁰₅₄Xe + ⁹⁴₃₈Sr + 2 ¹₀n + energy.',
          type: 'two_tier',
          tier1Prompt: 'What would happen if both freed neutrons split another U-235 nucleus every time?',
          tier1Options: [
            'The number of splits would double each step, and the reaction would grow out of control.',
            'The reaction would stop, because each split uses up both of the freed neutrons.',
            'The number of splits would stay the same, because each split releases the same energy.',
            'The xenon and strontium would fuse back into uranium and split all over again.'
          ],
          correctTier1: 0,
          tier2Prompt: 'How do reactor engineers keep the chain reaction steady?',
          tier2Options: [
            'Control rods absorb some freed neutrons, so on average one from each split causes the next.',
            'Engineers add more uranium, so the extra neutrons spread out over more targets.',
            'Engineers cool the fuel to slow the decay of the xenon and strontium nuclei.',
            'Engineers pump out the xenon gas, because xenon is what produces the neutrons.'
          ],
          correctTier2: 0,
          hint: 'One neutron goes in and two come out. What has to happen to the extra one to keep the count level?',
          workedSolution: 'One neutron causes a split that frees 2 more. If both split new nuclei, the next step has 4 splits, then 8, then 16, and the reaction runs away. Control rods absorb the extra neutrons. On average, just one neutron from each split triggers the next split, so the power stays steady.',
          givenSummary: 'A two-neutron fission: chain growth and control rods'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-8.5_L1',
            skillId: 'PS1-8.5',
            level: 'Level 1 (Foundational)',
            stem: 'How does nuclear fission differ from a chemical reaction like burning methane?',
            type: 'mcq',
            options: [
              'Fission splits atomic nuclei into lighter elements; burning only rearranges outer electrons between intact atoms.',
              'Fission gives off carbon dioxide gas, while burning methane uses up oxygen without making any gas.',
              'Fission only happens in gases, while chemical burning only happens in solids.',
              'Fission destroys protons and neutrons, while burning creates new atoms out of heat.'
            ],
            correctIndex: 0,
            hint: 'Which part of the atom changes in a chemical reaction, and which part changes in nuclear fission?',
            workedSolution: 'Burning only rearranges outer-shell electrons while every carbon, hydrogen, and oxygen nucleus stays the same element. Nuclear fission splits a heavy nucleus into two lighter elements and releases millions of times more energy per reaction.',
            givenSummary: 'Nuclear fission vs chemical burning'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-8.5_L3',
            skillId: 'PS1-8.5',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'In the fission step ¹₀n + ²³⁵₉₂U -> ¹⁴¹₅₆Ba + ⁹²₃₆Kr + 3 ¹₀n, count the total number of protons and the total number of neutrons before and after the split. What stays the same?',
            type: 'mcq',
            options: [
              'All 92 protons and all 144 neutrons are still there; they are just grouped into new nuclei.',
              'The number of uranium atoms stays the same, while three extra neutrons are created from heat.',
              'The total number of protons drops from 92 to 89 because three protons turn into free neutrons.',
              'Half of the protons and neutrons disappear to make the energy released by the reactor.'
            ],
            correctIndex: 0,
            hint: 'Before the split: 92 protons and 1 + (235 - 92) = 144 neutrons. Check the totals on the right side.',
            workedSolution: 'Before the split, there are 92 protons and 1 + 143 = 144 neutrons (236 nucleons in total). After the split, Ba and Kr hold 56 + 36 = 92 protons, and the neutrons add up to (141 - 56) + (92 - 36) + 3 = 85 + 56 + 3 = 144 neutrons. Every proton and neutron is accounted for.',
            givenSummary: 'Counting protons and neutrons before and after fission'
          };
        }
      ]
    },
    {
      id: 'PS1-8.6',
      title: 'Nuclear Fusion & Energy Scale',
      subtitle: 'Explain how fusion joins light nuclei in stars and compare nuclear energy with chemical bond energy.',
      watchOut: 'Fusion joins light nuclei (such as hydrogen into helium) while fission splits heavy nuclei. Both release millions of times more energy per gram than any chemical reaction because nuclear forces are vastly stronger than the pull on outer electrons.',
      diagnostic: function(rng) {
        return {
          id: 'PS1-8.6_diag',
          skillId: 'PS1-8.6',
          level: 'Level 2 (Intermediate)',
          stem: 'Inside the Sun\'s core, hydrogen nuclei fuse to form helium nuclei and release huge amounts of energy.',
          type: 'two_tier',
          tier1Prompt: 'What happens to the nuclei during nuclear fusion?',
          tier1Options: [
            'Light hydrogen nuclei join into a heavier helium nucleus, with a tiny mass loss that becomes energy.',
            'Heavy helium nuclei split apart into lighter hydrogen nuclei and free outer electrons.',
            'Hydrogen and oxygen atoms share outer electrons to form liquid water molecules.',
            'Electrons fall into the nucleus and turn helium nuclei back into hydrogen.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why does fusing 1 gram of hydrogen release millions of times more energy than burning 1 gram of coal?',
          tier2Options: [
            'Changes to the nucleus involve the strong nuclear force, which is millions of times stronger than chemical bonds between outer electrons.',
            'Hydrogen burns faster in space because the Sun is filled with pure liquid oxygen.',
            'Coal atoms are too heavy to collide, so most of their energy stays locked inside.',
            'Chemical reactions lose almost all of their energy to air resistance between atoms.'
          ],
          correctTier2: 0,
          hint: 'Compare what changes in fusion (the nucleus, bound by the strong force) with what changes in burning coal (outer electrons).',
          workedSolution: 'In fusion, four hydrogen nuclei join to make a helium-4 nucleus that weighs slightly less than the pieces that went in. That small mass difference turns into energy, and because the strong nuclear force binds nucleons millions of times more tightly than outer electrons are bound in molecules, nuclear reactions release millions of times more energy per gram.',
          givenSummary: 'What fusion is and why its energy scale is millions of times larger than burning'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS1-8.6_diag2',
          skillId: 'PS1-8.6',
          level: 'Level 2 (Intermediate)',
          stem: 'The Sun and a nuclear power plant both get their energy from nuclei, but they use opposite processes.',
          type: 'two_tier',
          tier1Prompt: 'Which process happens in each place?',
          tier1Options: [
            'Fusion joins light nuclei in the Sun; fission splits heavy nuclei in a power plant.',
            'Fission splits hydrogen nuclei in the Sun; fusion joins uranium nuclei in a power plant.',
            'Both burn hydrogen with oxygen, but the Sun does it at a much higher temperature.',
            'The Sun splits helium nuclei, and a power plant joins small uranium nuclei together.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why do both release millions of times more energy per gram than burning fuel?',
          tier2Options: [
            'Both change nuclei, and the strong force binds nucleons far tighter than atoms hold electrons.',
            'Both happen at high temperatures, and heat alone multiplies the energy a reaction releases.',
            'Both make new chemical bonds that are stronger than the bonds in any fuel.',
            'Both turn electrons into pure energy, and electrons hold most of an atom\'s energy.'
          ],
          correctTier2: 0,
          hint: 'Fusion builds up, fission breaks down. What changes in each one: outer electrons, or the nucleus?',
          workedSolution: 'The Sun fuses hydrogen nuclei into helium. A power plant splits uranium-235 into two middle-sized nuclei. Both change the nucleus itself. The strong nuclear force binds nucleons far more tightly than atoms hold their outer electrons. So each nuclear change releases millions of times more energy than a chemical reaction, which only moves outer electrons.',
          givenSummary: 'Fusion vs fission: where each happens and why both are so energetic'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS1-8.6_L1',
            skillId: 'PS1-8.6',
            level: 'Level 1 (Foundational)',
            stem: 'Why does nuclear fusion in the Sun\'s core need a temperature of about 15 million degrees Celsius and crushing pressure?',
            type: 'mcq',
            options: [
              'Hydrogen nuclei are all positively charged and push each other apart, so they must collide at huge speeds to get close enough to fuse.',
              'Extreme heat is needed to freeze hydrogen gas into a solid before the nuclei can touch.',
              'High temperature strips neutrons out of the air and pushes them into the Sun.',
              'Without 15 million degrees of heat, the Sun\'s core would turn into solid iron.'
            ],
            correctIndex: 0,
            hint: 'Every hydrogen nucleus is a positive proton. What do two positive charges do as they approach each other?',
            workedSolution: 'Because every hydrogen nucleus carries a positive charge, two approaching nuclei push each other apart electrically. Only at extreme temperatures (around 15 million °C) and high density do they move fast enough and sit close enough to slam together so the short-range strong force can bind them.',
            givenSummary: 'Why fusion needs extreme temperature and pressure'
          };
        },
        function level3(rng) {
          return {
            id: 'PS1-8.6_L3',
            skillId: 'PS1-8.6',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Breaking or forming a chemical bond involves a few electron-volts (eV) of energy per atom. Splitting or fusing a nucleus involves millions of electron-volts (MeV) per nucleus. What explains that million-fold gap?',
            type: 'mcq',
            options: [
              'Chemical reactions only shift outer electrons, while nuclear reactions rearrange protons and neutrons held by the much stronger nuclear force.',
              'Nuclear reactions use millions of atoms at once, while a chemical reaction only uses two atoms at a time.',
              'Outer electrons weigh millions of times more than protons and neutrons inside the nucleus.',
              'Chemical bonds only happen in cold liquids, which absorbs almost all of the energy.'
            ],
            correctIndex: 0,
            hint: 'Compare the force that holds outer electrons to an atom with the force that holds protons and neutrons in the nucleus.',
            workedSolution: 'A chemical reaction rearranges outer-shell electrons held by comparatively gentle electric attraction (a few eV per bond). A nuclear reaction rearranges protons and neutrons bound by the strong nuclear force (millions of eV per nucleus), converting a small fraction of mass into a huge amount of energy.',
            givenSummary: 'Why nuclear reactions release millions of times more energy than chemical bonds'
          };
        }
      ]
    }
  ];

  window.PE_DATA_HS_PS1_8 = {
    info: PE_INFO,
    skills: SKILLS
  };
})();
