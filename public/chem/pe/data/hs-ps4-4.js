/**
 * HS-PS4-4: Electromagnetic Radiation & Matter
 * Items rewritten (Oct 2026) to the Tier 3 register in docs/textbook/VOICE.md and to the core of
 * lesson 5-4a: higher frequency means more energy per photon; what a photon does depends on its
 * energy (rotate, vibrate, excite, ionize); brightness is not photon energy; judging claims.
 * E = hf and energies in eV are Enrichment in 5-4a, so eV values appear only as given data.
 * A typical covalent bond in DNA takes about 3 to 4 eV to break (matches the 2026-10-26 correction).
 * Zero em-dash compliant: hyphens, colons, and parentheses only.
 */
(function() {
  'use strict';

  const PE_INFO = {
    id: 'HS-PS4-4',
    code: 'PS4-4',
    title: 'Electromagnetic Radiation & Matter',
    unit: 'Unit 5: Nuclear & Astrophysics',
    description: 'Evaluate the validity and reliability of claims in published materials of the effects that different frequencies of electromagnetic radiation have when absorbed by matter.',
    clarification: 'Emphasis is on the idea that photons associated with different frequencies of light have different energies, and the damage to living tissue depends on the energy of the radiation. At lower frequencies (such as radio, microwave, and infrared), radiation can heat matter. At higher frequencies (such as ultraviolet, X-ray, and gamma), radiation has sufficient energy to ionize atoms and molecules, causing chemical changes and damaging cellular components like DNA.',
    assessmentBoundary: 'Assessment is limited to qualitative descriptions of ionization vs non-ionization, wave-particle relationships (E = hν = hc/λ), absorption spectra, and evaluating scientific claims vs pseudoscience.'
  };

  const SKILLS = [
    {
      id: 'PS4-4.1',
      title: 'Photon Energy & Frequency',
      subtitle: 'Relate the energy of one photon to its frequency and wavelength across the spectrum.',
      watchOut: 'Here is the trap: "a brighter or more powerful beam has stronger photons." It does not. Power tells you how many photons leave each second. The energy of each photon depends only on its frequency: higher frequency (shorter wavelength), more energy.',
      diagnostic: function(rng) {
        return {
          id: 'PS4-4.1_diag',
          skillId: 'PS4-4.1',
          level: 'Level 2 (Intermediate)',
          stem: 'A red light beam (wavelength 700 nm) and a violet light beam (wavelength 400 nm) have the same power: 5 watts each.',
          type: 'two_tier',
          tier1Prompt: 'How does the energy of one photon compare in the two beams?',
          tier1Options: [
            'Each violet photon carries more energy than each red photon.',
            'Each red photon carries more energy, because longer waves travel faster.',
            'Each photon carries the same energy, because the beams have the same power.',
            'Neither beam is made of photons, because visible light is only a wave.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Violet light has a shorter wavelength and a higher frequency, and higher frequency means more energy per photon.',
            'The power of the beam sets the energy of each photon, so equal power means equal photons.',
            'Red light has the higher frequency, because red waves are taller than violet waves.',
            'A difference in wavelength changes only how fast a photon travels, not its energy.'
          ],
          correctTier2: 0,
          hint: 'Shorter wavelength means higher frequency. How does frequency relate to the energy of one photon?',
          workedSolution: 'Violet light has the shorter wavelength, so it has the higher frequency. Higher frequency means more energy in each photon (about 3.1 eV for violet, against about 1.8 eV for red). The two beams have the same power because the red beam sends out more photons each second.',
          givenSummary: 'Red vs violet: energy per photon'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS4-4.1_diag2',
          skillId: 'PS4-4.1',
          level: 'Level 2 (Intermediate)',
          stem: 'A TV remote sends out infrared light (wavelength 940 nm) at 0.1 watts. A small lamp sends out ultraviolet light (wavelength 300 nm) at 0.01 watts.',
          type: 'two_tier',
          tier1Prompt: 'How does the energy of one photon compare in the two beams?',
          tier1Options: [
            'Each ultraviolet photon carries more energy than each infrared photon.',
            'Each infrared photon carries more energy, because the remote is ten times more powerful.',
            'Each photon carries the same energy, because all light travels at the same speed.',
            'Each infrared photon carries more energy, because infrared waves are longer.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which reason supports your answer?',
          tier2Options: [
            'Ultraviolet has a shorter wavelength and a higher frequency, and photon energy depends only on frequency.',
            'A more powerful source always sends out photons that each carry more energy.',
            'Longer waves have more room to store energy, so each long-wave photon is stronger.',
            'Wavelength changes only the color of a photon, not how much energy it carries.'
          ],
          correctTier2: 0,
          hint: 'Power tells you how many photons leave each second. What sets the energy of one photon?',
          workedSolution: 'Ultraviolet light has the shorter wavelength, so it has the higher frequency. Higher frequency means more energy in each photon: about 4.1 eV for 300 nm against about 1.3 eV for 940 nm. The remote has more power only because it sends out far more photons each second. Each of them is weaker.',
          givenSummary: 'Infrared remote vs ultraviolet lamp: energy per photon'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS4-4.1_L1',
            skillId: 'PS4-4.1',
            level: 'Level 1 (Foundational)',
            stem: 'Rank these kinds of radiation by the energy of one photon, from lowest (1) to highest (4).',
            type: 'ranking',
            items: [
              'FM radio waves (wavelength 3 meters)',
              'Microwave oven radiation (wavelength 12 centimeters)',
              'Green light (wavelength 532 nanometers)',
              'Medical X-rays (wavelength 0.1 nanometers)'
            ],
            correctOrder: [
              'FM radio waves (wavelength 3 meters)',
              'Microwave oven radiation (wavelength 12 centimeters)',
              'Green light (wavelength 532 nanometers)',
              'Medical X-rays (wavelength 0.1 nanometers)'
            ],
            hint: 'The shorter the wavelength, the higher the frequency, and the more energy each photon carries.',
            workedSolution: 'Energy per photon rises as the wavelength gets shorter. From longest wavelength to shortest: radio (3 m), microwaves (12 cm), green light (532 nm), then X-rays (0.1 nm). So X-ray photons carry by far the most energy.',
            givenSummary: 'Ranking radiation by energy per photon'
          };
        },
        function level3(rng) {
          return {
            id: 'PS4-4.1_L3',
            skillId: 'PS4-4.1',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A green laser pointer gives out 0.005 W of light. A dental X-ray machine gives out 0.001 W of X-rays. The X-rays can break bonds in your cells, but the laser cannot. Why?',
            type: 'mcq',
            options: [
              'Each X-ray photon carries thousands of times more energy than one green photon, whatever the power.',
              'The laser pointer\'s power is too low for its light to reach the electrons in your skin.',
              'Green light bounces off every molecule in the body, so none of its energy is taken in.',
              'X-rays travel faster than green light, so each one hits a molecule harder.'
            ],
            correctIndex: 0,
            hint: 'Look past the power. What decides whether one photon can break one bond?',
            workedSolution: 'A bond breaks when one photon brings enough energy. A green photon carries about 2.3 eV, which is less than the 3 to 4 eV a bond in DNA needs. An X-ray photon carries over 10,000 eV, so a single one can break bonds. The X-ray machine\'s lower power just means it sends fewer photons.',
            givenSummary: 'Energy per photon, not power, breaks bonds'
          };
        }
      ]
    },
    {
      id: 'PS4-4.2',
      title: 'What Each Kind of Radiation Does to Matter',
      subtitle: 'Match each part of the spectrum to what it does to molecules: rotate, vibrate, excite electrons, or ionize.',
      watchOut: 'Microwaves and infrared do not have enough energy per photon to break bonds. They make molecules spin and vibrate faster, which is heating. A common slip is thinking a microwave oven makes food radioactive.',
      diagnostic: function(rng) {
        return {
          id: 'PS4-4.2_diag',
          skillId: 'PS4-4.2',
          level: 'Level 2 (Intermediate)',
          stem: 'A microwave oven heats a bowl of soup. It does not break the bonds in the food or make the food radioactive.',
          type: 'two_tier',
          tier1Prompt: 'What do the microwaves do to the molecules in the soup?',
          tier1Options: [
            'They make polar water molecules spin back and forth, and that motion is heat.',
            'They push electrons up to higher energy levels, which then give off heat.',
            'They split water molecules into hydrogen and oxygen.',
            'They squeeze atomic nuclei until the nuclei split apart.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why do the bonds in the food stay whole?',
          tier2Options: [
            'Each microwave photon carries far less energy than it takes to break a bond.',
            'The bonds in water are too stiff to take in any kind of radiation at all.',
            'The oven surrounds the food with a field that blocks high-energy photons.',
            'The heat only moves in through the walls of the bowl, not into the food.'
          ],
          correctTier2: 0,
          hint: 'Match the radiation to what it does: rotate, vibrate, excite electrons, or ionize. Then compare its photon energy with what a bond needs.',
          workedSolution: 'Microwave photons have only enough energy to make polar molecules, like water, spin. The spinning water molecules bump their neighbors, and the soup warms up. Breaking a bond takes about 3 to 4 eV from one photon, and a microwave photon has about a hundred-thousandth of an eV. So no bonds break and nothing becomes radioactive.',
          givenSummary: 'Microwaves spin water, but break no bonds'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS4-4.2_diag2',
          skillId: 'PS4-4.2',
          level: 'Level 2 (Intermediate)',
          stem: 'Your face feels warm in front of a campfire, even though no flame touches you. Most of that warmth arrives as infrared radiation.',
          type: 'two_tier',
          tier1Prompt: 'What does the infrared do to the molecules in your skin?',
          tier1Options: [
            'It makes the bonds in molecules stretch and bend faster, and that motion is heat.',
            'It knocks electrons out of atoms, leaving charged ions behind in your skin.',
            'It splits the water molecules in your skin into hydrogen and oxygen gas.',
            'It changes the nuclei of atoms in your skin, so they give off radiation.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why do the bonds in your skin stay whole?',
          tier2Options: [
            'Each infrared photon carries less energy than it takes to break a bond.',
            'Skin reflects all infrared, so none of it is ever taken in.',
            'Infrared travels too slowly to reach the bonds inside molecules.',
            'Bonds can be broken only by the heat of a flame, never by light.'
          ],
          correctTier2: 0,
          hint: 'Match the radiation to what it does: rotate, vibrate, excite electrons, or ionize. Where does infrared sit?',
          workedSolution: 'Infrared photons carry enough energy to make bonds stretch and bend faster, but not enough to break them. Faster vibrating molecules bump their neighbors, and your skin warms up. Breaking a bond takes about 3 to 4 eV from one photon. An infrared photon from a fire carries well under 1 eV, so no bonds break.',
          givenSummary: 'Campfire infrared: vibration, not bond breaking'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS4-4.2_L1',
            skillId: 'PS4-4.2',
            level: 'Level 1 (Foundational)',
            stem: 'Match each effect to the kind of radiation that causes it.',
            type: 'categorize',
            categories: ['Microwave Radiation', 'Infrared Radiation', 'Visible Light', 'X-Ray Radiation'],
            items: [
              { label: 'Makes water molecules spin, warming food', correctCategoryIndex: 0 },
              { label: 'Makes the bonds in CO₂ stretch and bend faster', correctCategoryIndex: 1 },
              { label: 'Lifts outer electrons to higher levels, which powers photosynthesis', correctCategoryIndex: 2 },
              { label: 'Knocks electrons out of atoms (ionizing them)', correctCategoryIndex: 3 },
              { label: 'Heats leftovers without changing any of their chemical formulas', correctCategoryIndex: 0 },
              { label: 'Carries heat from the warm ground up into the air at night', correctCategoryIndex: 1 }
            ],
            hint: 'Spin goes with microwaves, vibration with infrared, lifting electrons with visible light, and knocking electrons out with X-rays.',
            workedSolution: 'Each kind of radiation brings a different amount of energy per photon. Microwaves make molecules spin. Infrared makes bonds vibrate. Visible light lifts outer electrons to higher levels. X-rays carry enough to knock electrons right out of atoms.',
            givenSummary: 'Matching radiation to its effect on molecules'
          };
        },
        function level3(rng) {
          return {
            id: 'PS4-4.2_L3',
            skillId: 'PS4-4.2',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'An infrared heat lamp at a restaurant keeps food warm for hours. An hour in summer sun can burn your skin. Why can sunlight burn you when the heat lamp does not?',
            type: 'mcq',
            options: [
              'Sunlight contains ultraviolet photons with enough energy to break bonds in skin cells; infrared photons only warm.',
              'The heat lamp is weaker than the sun, and any radiation burns skin once it is strong enough.',
              'Infrared from the lamp bounces off skin, while sunlight soaks into it and builds up.',
              'Sunlight travels much farther than the lamp\'s light, so it arrives with more speed.'
            ],
            correctIndex: 0,
            hint: 'A sunburn is damage to the molecules in skin cells. Which part of sunlight has photons strong enough to do that?',
            workedSolution: 'Infrared photons only make molecules vibrate, which warms them. Sunlight also contains ultraviolet light. Each UV photon carries enough energy to break bonds in the DNA of skin cells, and that damage is a sunburn. Making the heat lamp stronger would make you hotter, not sunburned.',
            givenSummary: 'Heat lamp vs sunlight: why only one burns'
          };
        }
      ]
    },
    {
      id: 'PS4-4.3',
      title: 'Ionizing Radiation & DNA Damage',
      subtitle: 'Tell ionizing from non-ionizing radiation, and explain how high-energy photons damage DNA.',
      watchOut: 'Only high-frequency radiation (some ultraviolet, X-rays, and gamma rays) has photons strong enough to knock electrons out of atoms. Low-frequency radiation cannot do this, however long you are exposed.',
      diagnostic: function(rng) {
        return {
          id: 'PS4-4.3_diag',
          skillId: 'PS4-4.3',
          level: 'Level 2 (Intermediate)',
          stem: 'A skin doctor tells you to wear sunscreen against ultraviolet light, but never tells you to shield your skin from the lights in your classroom.',
          type: 'two_tier',
          tier1Prompt: 'How do the hazards of ultraviolet and visible light compare?',
          tier1Options: [
            'Ultraviolet photons carry enough energy to damage DNA in skin cells, and visible photons do not.',
            'Visible light is more dangerous, because your eyes take it in all day long.',
            'Both damage DNA equally once you have been exposed for more than an hour.',
            'Ultraviolet only warms the water on your skin, without touching any molecules.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What does ultraviolet light do to skin cells?',
          tier2Options: [
            'Each UV photon can break bonds in DNA, so the cell may copy the damaged DNA wrongly.',
            'UV photons make the water in cells spin so fast that it boils into steam.',
            'UV light turns skin cells radioactive, and they then decay like a nucleus.',
            'UV light pulls neutrons out of the carbon atoms in the cell\'s enzymes.'
          ],
          correctTier2: 0,
          hint: 'A bond in DNA takes about 3 to 4 eV to break. Visible photons carry about 2 to 3 eV. UV photons carry more.',
          workedSolution: 'Visible photons carry about 1.8 to 3.1 eV, which is not enough to break a bond in DNA (about 3 to 4 eV). UV photons carry more, enough to break those bonds. If the cell copies the damaged DNA wrongly, the mistake can lead to skin cancer.',
          givenSummary: 'Ultraviolet vs visible light: DNA damage'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS4-4.3_diag2',
          skillId: 'PS4-4.3',
          level: 'Level 2 (Intermediate)',
          stem: 'A dental assistant steps out of the room before every X-ray. Nobody steps away from you when you answer a phone call, which uses radio waves.',
          type: 'two_tier',
          tier1Prompt: 'How do the hazards of X-rays and radio waves compare?',
          tier1Options: [
            'X-ray photons carry enough energy to knock electrons out of atoms; radio photons do not.',
            'Radio waves are more dangerous, because you are near phones for hours each day.',
            'Both knock electrons out of atoms equally once exposure lasts more than an hour.',
            'X-rays only warm the body, so the assistant leaves to avoid the extra heat.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What can an ionizing photon do inside a cell?',
          tier2Options: [
            'It can knock an electron off a molecule, and the damaged fragment can break DNA.',
            'It turns the cell radioactive, so the cell then decays like a nucleus.',
            'It makes the water in the cell spin until the cell boils.',
            'It pulls protons out of the nuclei of the carbon atoms in DNA.'
          ],
          correctTier2: 0,
          hint: 'Ionizing means one photon has enough energy to knock an electron out of an atom. Which of the two can do that?',
          workedSolution: 'X-ray photons carry thousands of eV each, far more than it takes to knock an electron out of an atom. That leaves charged fragments that can break DNA. Radio photons from a phone carry a few millionths of an eV, so they cannot ionize anything, however long the call lasts. The assistant leaves because they would take that dose many times a day.',
          givenSummary: 'Dental X-rays vs phone radio waves: ionizing or not'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS4-4.3_L1',
            skillId: 'PS4-4.3',
            level: 'Level 1 (Foundational)',
            stem: 'Sort each kind of radiation as non-ionizing or ionizing.',
            type: 'categorize',
            categories: ['Non-Ionizing Radiation', 'Ionizing Radiation'],
            items: [
              { label: 'AM and FM radio signals', correctCategoryIndex: 0 },
              { label: 'Phone (5G) and Wi-Fi signals', correctCategoryIndex: 0 },
              { label: 'Infrared from a restaurant heat lamp', correctCategoryIndex: 0 },
              { label: 'Green light from a laser pointer', correctCategoryIndex: 0 },
              { label: 'Medical chest X-rays', correctCategoryIndex: 1 },
              { label: 'Gamma rays from radioactive decay', correctCategoryIndex: 1 }
            ],
            hint: 'Ionizing radiation starts in the high-frequency part of the ultraviolet. Everything with a lower frequency is non-ionizing.',
            workedSolution: 'Radio, phone and Wi-Fi signals, infrared, and visible light all have photons too weak to knock electrons out of atoms, so they are non-ionizing. X-rays and gamma rays have far more energy per photon, so they are ionizing.',
            givenSummary: 'Sorting ionizing and non-ionizing radiation'
          };
        },
        function level3(rng) {
          return {
            id: 'PS4-4.3_L3',
            skillId: 'PS4-4.3',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'X-rays can knock electrons out of water molecules in your cells. This leaves fragments called free radicals. Why are free radicals dangerous?',
            type: 'mcq',
            options: [
              'A free radical has an unpaired electron, so it reacts with nearby molecules such as DNA and damages them.',
              'Free radicals give off gamma rays of their own, which keep heating the cell from inside.',
              'Free radicals turn the water in cells into a gas, so the cells dry out at once.',
              'Free radicals freeze the inside of the cell by stopping all of its molecules from moving.'
            ],
            correctIndex: 0,
            hint: 'What does an atom or molecule with an unpaired electron tend to do?',
            workedSolution: 'When an X-ray knocks an electron out of a water molecule, the pieces left behind have unpaired electrons. These free radicals react with almost anything nearby, including DNA. That damage can kill the cell or cause a harmful mutation.',
            givenSummary: 'Why free radicals damage cells'
          };
        }
      ]
    },
    {
      id: 'PS4-4.4',
      title: 'Judging Claims: Brightness vs. Photon Energy',
      subtitle: 'Judge published claims that mix up the power of a source with the energy of its photons.',
      watchOut: 'A bond breaks when one photon brings enough energy. Billions of weak photons cannot team up to do it. A more powerful source of weak photons can warm you, but it cannot break bonds.',
      diagnostic: function(rng) {
        return {
          id: 'PS4-4.4_diag',
          skillId: 'PS4-4.4',
          level: 'Level 2 (Intermediate)',
          stem: 'An article claims a 500-watt cell tower damages DNA more than a 100-watt tanning bed, because the tower uses more watts. Is the claim valid?',
          type: 'two_tier',
          tier1Prompt: 'Choose the best judgment of the claim:',
          tier1Options: [
            'Not valid. It mixes up the total power of a source with the energy of each photon.',
            'Valid. More watts always means the photons have a higher frequency.',
            'Valid. Radio waves go deeper into the body than ultraviolet light does.',
            'Not valid, but only when it is raining near the cell tower.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which idea shows the claim is wrong?',
          tier2Options: [
            'A bond breaks only when one photon brings enough energy; many weak photons cannot add up to do it.',
            'The power of a source decides how fast its photons travel through the body.',
            'Ultraviolet photons lose their energy as soon as they touch the oxygen in the air.',
            'Radio waves cannot put any heat at all into a living body.'
          ],
          correctTier2: 0,
          hint: 'Separate how many photons a source sends out (its power) from how much energy each photon has (its frequency).',
          workedSolution: 'The claim confuses the number of photons with the energy of each one. A cell tower photon carries about 0.0001 eV; breaking a bond in DNA takes about 3 to 4 eV from a single photon. Weak photons can only warm tissue slightly. Each UV photon from a tanning bed has enough energy to damage DNA directly.',
          givenSummary: 'Cell tower vs tanning bed claim'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS4-4.4_diag2',
          skillId: 'PS4-4.4',
          level: 'Level 2 (Intermediate)',
          stem: 'A video claims a 1,000-watt microwave oven harms DNA more than a 5-watt ultraviolet nail lamp, because the oven uses more power. Is the claim valid?',
          type: 'two_tier',
          tier1Prompt: 'Choose the best judgment of the claim:',
          tier1Options: [
            'Not valid. It treats the power of a source as the energy of each photon.',
            'Valid. More power always means the photons have a higher frequency and more energy.',
            'Valid. Microwaves pass deeper into the body than ultraviolet light from a lamp does.',
            'Not valid, because microwave ovens give out no radiation of any kind.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which idea shows the claim is wrong?',
          tier2Options: [
            'One microwave photon has far too little energy to break a bond; more watts just means more photons.',
            'Power decides how fast photons travel, so more power means harder hits on the DNA in cells.',
            'Ultraviolet photons lose all their energy in air, so the nail lamp never reaches skin.',
            'Microwaves can heat only metal objects, so they cannot affect a living body in any way.'
          ],
          correctTier2: 0,
          hint: 'Separate how many photons a source sends out (its power) from how much energy each one carries (its frequency).',
          workedSolution: 'The claim confuses the number of photons with the energy of each one. A microwave photon carries about 0.00001 eV. Breaking a bond in DNA takes about 3 to 4 eV from a single photon. A thousand watts of those photons can heat food, but they cannot break bonds. Each ultraviolet photon from the nail lamp carries about 3 eV, close to what DNA damage needs.',
          givenSummary: 'Microwave oven vs UV nail lamp claim'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS4-4.4_L1',
            skillId: 'PS4-4.4',
            level: 'Level 1 (Foundational)',
            stem: 'A company sells a "Quantum Protection Sticker" for phones that it says absorbs cancer-causing radiation. Which reasons show the claim is misleading? (Select ALL that apply)',
            type: 'multi_select',
            options: [
              'Phones give off radio waves, which are non-ionizing and too weak to damage DNA.',
              'A small sticker cannot block a signal that spreads in every direction from the antenna.',
              'Radio photons do not have enough energy to break bonds in living tissue.',
              'Phones give off gamma rays, which only thick lead plates can block.',
              'Radio waves become ionizing whenever the phone\'s battery drops below ten percent.'
            ],
            correctIndices: [0, 1, 2],
            hint: 'Think about what kind of radiation a phone gives off, and which way the signal travels.',
            workedSolution: 'Phones give off radio waves. Radio photons are far too weak to break bonds or damage DNA (statements 1 and 3). The antenna sends its signal in every direction, so a small sticker could not block it anyway (statement 2). Phones do not give off gamma rays, and battery level does not change the kind of radiation.',
            givenSummary: 'Judging an anti-radiation phone sticker'
          };
        },
        function level3(rng) {
          return {
            id: 'PS4-4.4_L3',
            skillId: 'PS4-4.4',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A worker stands next to an industrial microwave transmitter that gives out 10,000 watts. What risk does the worker really face if exposed by accident?',
            type: 'mcq',
            options: [
              'Serious burns, because the tissue heats up fast, but no risk of DNA damage from ionization.',
              'Mutations in skin cells, the same kind that medical X-rays can cause.',
              'Becoming radioactive, so the worker\'s body gives off gamma rays afterward.',
              'No effect at all, because microwaves pass through the body without being taken in.'
            ],
            correctIndex: 0,
            hint: 'A very powerful source sends out a huge number of photons. Does that change the energy of each one?',
            workedSolution: 'At 10,000 watts the transmitter sends out an enormous number of photons. Water in the tissue takes in that energy and heats up fast, which can cause serious burns. But each microwave photon is still far too weak to knock electrons out of atoms, so there is no ionization and no DNA damage from it.',
            givenSummary: 'High-power microwaves: burns, not mutations'
          };
        }
      ]
    },
    {
      id: 'PS4-4.5',
      title: 'Protection & Shielding',
      subtitle: 'Explain how sunscreen, the ozone layer, and a lead apron stop harmful radiation before it reaches your cells.',
      watchOut: 'Every shield works by taking in the harmful photons before they reach your cells. Mineral sunscreens take in UV photons and turn the energy into a little harmless heat. Lead takes in X-rays.',
      diagnostic: function(rng) {
        return {
          id: 'PS4-4.5_diag',
          skillId: 'PS4-4.5',
          level: 'Level 2 (Intermediate)',
          stem: 'Mineral sunscreens contain tiny particles of zinc oxide (ZnO) or titanium dioxide (TiO₂) to protect skin from ultraviolet light.',
          type: 'two_tier',
          tier1Prompt: 'How do these particles protect the DNA in your skin?',
          tier1Options: [
            'They take in UV photons before the photons reach your skin, and give off the energy as a little heat.',
            'They make a magnetic field that pushes UV light back up into the sky.',
            'They bond to the DNA in skin cells, so the DNA can never be damaged.',
            'They cool the skin below freezing, so it cannot take in any sunlight.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why do they block UV but not visible light?',
          tier2Options: [
            'Their electrons only take in photons above a set energy: UV photons have enough, visible ones do not.',
            'Their heavy nuclei catch the neutrons that travel along with ultraviolet light.',
            'Their metal crystals carry an electric current across the surface of the skin.',
            'Their bonds break for good each time a photon of visible light hits them.'
          ],
          correctTier2: 0,
          hint: 'The particles look white or clear on your skin. What does that tell you about visible light?',
          workedSolution: 'Zinc oxide and titanium dioxide take in photons only if they carry more than a certain amount of energy. UV photons carry enough, so the particles take them in and give off the energy as a little heat. Visible photons do not carry enough, so they pass by, and the sunscreen looks white or clear.',
          givenSummary: 'How mineral sunscreen protects skin'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS4-4.5_diag2',
          skillId: 'PS4-4.5',
          level: 'Level 2 (Intermediate)',
          stem: 'High in the atmosphere, ozone (O₃) takes in most of the Sun\'s harmful ultraviolet light before it reaches the ground.',
          type: 'two_tier',
          tier1Prompt: 'How does the ozone layer protect your skin?',
          tier1Options: [
            'Ozone molecules take in UV photons high in the sky, before the photons reach your cells.',
            'Ozone reflects UV light back out into space, the way a mirror reflects light.',
            'Ozone cools the air so much that UV light can no longer travel through it.',
            'Ozone drifts down and bonds to the DNA in your skin, shielding it from damage.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why does sunlight still reach you even though ozone blocks UV?',
          tier2Options: [
            'Ozone takes in UV photons strongly, but most visible photons pass straight through it.',
            'Ozone has heavy nuclei that catch the neutrons that travel along with UV light.',
            'Ozone carries an electric current that bends only the UV light away from Earth.',
            'Ozone molecules are destroyed for good each time any photon hits them.'
          ],
          correctTier2: 0,
          hint: 'Every shield works the same way: it takes in the harmful photons before they reach you. Which photons does ozone take in?',
          workedSolution: 'Ozone molecules take in high-energy UV photons and turn that energy into a little heat in the upper atmosphere. That happens before the photons can reach the DNA in your skin. Most visible photons pass through ozone, so daylight still reaches the ground. Where the ozone layer is thin, more UV reaches you.',
          givenSummary: 'How the ozone layer blocks ultraviolet light'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS4-4.5_L1',
            skillId: 'PS4-4.5',
            level: 'Level 1 (Foundational)',
            stem: 'Match each description to the protection it describes.',
            type: 'categorize',
            categories: ['UV Sunscreen (ZnO/TiO₂)', 'Lead Shielding (Dental Apron)', 'Atmospheric Ozone (O₃ Layer)'],
            items: [
              { label: 'Tiny particles that take in UV and give off the energy as a little heat', correctCategoryIndex: 0 },
              { label: 'A heavy metal sheet that takes in X-rays during a dental visit', correctCategoryIndex: 1 },
              { label: 'Gas high in the sky that takes in the strongest UV from the sun', correctCategoryIndex: 2 },
              { label: 'Rubbed onto skin to stop UV from damaging DNA', correctCategoryIndex: 0 },
              { label: 'Laid over the body to protect organs that are not being imaged', correctCategoryIndex: 1 },
              { label: 'A natural layer that protects all life on Earth\'s surface', correctCategoryIndex: 2 }
            ],
            hint: 'Sunscreen is on your skin. A lead apron is in the dentist\'s office. Ozone is high in the atmosphere.',
            workedSolution: 'Sunscreen particles on your skin take in UV. A lead apron takes in X-rays aimed at your teeth, so they do not reach the rest of your body. Ozone high in the atmosphere takes in the strongest UV from the sun before it reaches the ground.',
            givenSummary: 'Matching shields to what they block'
          };
        },
        function level3(rng) {
          return {
            id: 'PS4-4.5_L3',
            skillId: 'PS4-4.5',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Dentists use a lead apron, not an aluminum one, to block X-rays. Why does lead work so much better?',
            type: 'mcq',
            options: [
              'Lead atoms are large and packed with electrons, so an X-ray photon is far more likely to be taken in.',
              'Lead is radioactive, and its own radiation pushes the X-rays away from the body.',
              'Aluminum is full of tiny holes, so X-ray photons slip through the empty spaces.',
              'Lead takes in X-rays by spinning its molecules, the way water takes in microwaves.'
            ],
            correctIndex: 0,
            hint: 'Lead has 82 electrons per atom; aluminum has 13. What do X-ray photons interact with?',
            workedSolution: 'X-ray photons are taken in by the electrons in atoms. A lead atom has 82 electrons and an aluminum atom has 13, and lead is also much denser. So a thin sheet of lead puts far more electrons in the path of each X-ray, and almost none get through.',
            givenSummary: 'Why lead blocks X-rays better than aluminum'
          };
        }
      ]
    },
    {
      id: 'PS4-4.6',
      title: 'Judging Sources',
      subtitle: 'Judge how far to trust a source about radiation, from who wrote it, how they tested it, and what they sell.',
      watchOut: 'A source you can trust shows its data, tests its claim against a comparison group, and has nothing to sell you. A source that sells the cure for the danger it describes deserves the most doubt.',
      diagnostic: function(rng) {
        return {
          id: 'PS4-4.6_diag',
          skillId: 'PS4-4.6',
          level: 'Level 2 (Intermediate)',
          stem: 'You compare two sources about wireless earbuds. Source A is a study that combines the results of many cancer studies, checked by other scientists before it was published. Source B is a wellness blog that sells "anti-radiation" headbands.',
          type: 'two_tier',
          tier1Prompt: 'How do the two sources compare?',
          tier1Options: [
            'Source A is far more trustworthy, because other scientists checked it and it uses data from many people.',
            'Source B is more trustworthy, because a blog does not have to follow anyone else\'s rules.',
            'Both are equally trustworthy, because both are about the same radiation.',
            'Source A is biased, because medical journals want to hide the dangers of earbuds.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What is the main reason to doubt Source B?',
          tier2Options: [
            'It makes money from the fear it describes, and it shows no tested data.',
            'It uses too many equations about the frequency of photons.',
            'It uses careful tests with comparison groups instead of customer stories.',
            'It relies only on safety limits written by government scientists.'
          ],
          correctTier2: 0,
          hint: 'Ask three questions: who checked it, how much data is behind it, and does the writer sell something?',
          workedSolution: 'Source A combines many studies with large groups of people, and other scientists checked it before it was published. Source B sells a product that only matters if its scary claim is true, and it offers no tested data. That makes Source B the one to doubt.',
          givenSummary: 'A checked study vs a blog that sells a cure'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'PS4-4.6_diag2',
          skillId: 'PS4-4.6',
          level: 'Level 2 (Intermediate)',
          stem: 'You compare two sources about phones and cancer. Source A is a news headline, "Phones Cause Cancer," based on one study of 30 rats. Source B is a review of 50 studies with over a million people, which found no link.',
          type: 'two_tier',
          tier1Prompt: 'How do the two sources compare?',
          tier1Options: [
            'Source B is far more trustworthy, because it pulls together many large studies of people.',
            'Source A is more trustworthy, because it is newer and its result is more striking.',
            'Both are equally trustworthy, because both report on scientific studies.',
            'Source B is biased, because a large review hides small effects on purpose.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What is the main weakness of Source A?',
          tier2Options: [
            'It rests on one small rat study, and a headline hides how the test was run.',
            'It uses too few equations about the frequency of the photons from phones.',
            'Too many other scientists checked its results before the story was printed.',
            'It compares the rats with a control group instead of using customer stories.'
          ],
          correctTier2: 0,
          hint: 'Ask three questions: how many subjects were tested, were they people, and can you see how the test was run?',
          workedSolution: 'Source B combines 50 studies and over a million people, so one odd result cannot swing it. Source A rests on 30 rats, and a headline cannot tell you the dose, the control group, or whether anyone checked the work. A striking claim from a tiny study deserves the most doubt until larger studies agree.',
          givenSummary: 'Judging a one-study headline against a large review'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'PS4-4.6_L1',
            skillId: 'PS4-4.6',
            level: 'Level 1 (Foundational)',
            stem: 'Sort each feature of a source as one that makes it more trustworthy or one that is a warning sign.',
            type: 'categorize',
            categories: ['Increases Reliability', 'Indicates Bias or Pseudoscience'],
            items: [
              { label: 'Checked by other scientists before publishing, with its funding stated', correctCategoryIndex: 0 },
              { label: 'Sells a protective device or supplement for the danger it describes', correctCategoryIndex: 1 },
              { label: 'Compares groups, uses many people, and can be repeated', correctCategoryIndex: 0 },
              { label: 'Leans on scary stories and ignores how radiation actually works', correctCategoryIndex: 1 },
              { label: 'Accounts for other causes, such as sunlight, smoking, and age', correctCategoryIndex: 0 },
              { label: 'Says weak radio waves damage cells but never explains how', correctCategoryIndex: 1 }
            ],
            hint: 'Trustworthy sources show data and comparisons. Warning signs are fear, stories, and something to sell.',
            workedSolution: 'Trustworthy sources are checked by other scientists, use many people and comparison groups, rule out other causes, and say who paid for the work. Warning signs include selling a product for the danger described, relying on stories, and claiming harm without any way it could happen.',
            givenSummary: 'Trust signs and warning signs in a source'
          };
        },
        function level3(rng) {
          return {
            id: 'PS4-4.6_L3',
            skillId: 'PS4-4.6',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A study follows 100,000 people for 20 years. Heavy phone users and people who rarely use phones get brain tumors at the same rate: 1.2 cases per 100,000 people each year. What can you conclude?',
            type: 'mcq',
            options: [
              'Heavy phone use showed no link to more brain tumors, because both groups had the same rate.',
              'Phones cause brain tumors, because tumors appeared in both groups of people.',
              'Phone radiation cures brain tumors, because the heavy users did no worse.',
              'Radio waves should now be treated as ionizing radiation, starting right away.'
            ],
            correctIndex: 0,
            hint: 'Compare the two groups. If the phones caused tumors, which group should have more?',
            workedSolution: 'If heavy phone use caused brain tumors, the heavy users would have a higher rate. Both groups had the same rate, 1.2 per 100,000 each year, so the study found no link. That fits the physics: radio photons are too weak to damage DNA.',
            givenSummary: 'Reading a large phone and tumor study'
          };
        }
      ]
    }
  ];

  window.PE_DATA_HS_PS4_4 = {
    info: PE_INFO,
    skills: SKILLS
  };
})();
