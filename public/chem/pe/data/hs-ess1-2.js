/**
 * HS-ESS1-2: The Big Bang & Astronomical Evidence
 * Items rewritten (Oct 2026) to the Tier 3 register in docs/textbook/VOICE.md and to the core scope
 * of lesson 5-2a: three independent lines of evidence for the Big Bang (1: redshift of light from
 * distant galaxies showing space is expanding; 2: the cosmic microwave background as cooled leftover
 * radiation from the hot early universe; 3: the ~75% hydrogen / ~25% helium ratio matching the Big Bang
 * prediction). Fixed the self-answering ranking item in ESS1-2.1_L1 and removed Enrichment formulas
 * (z = Δλ/λ, v = H0 d, z = 1100) from required choices.
 * Zero em-dash compliant: hyphens, colons, and parentheses only.
 */
(function() {
  'use strict';

  const PE_INFO = {
    id: 'HS-ESS1-2',
    code: 'ESS1-2',
    title: 'The Big Bang & Astronomical Evidence',
    unit: 'Unit 5: Nuclear & Astrophysics',
    description: 'Construct an explanation of the Big Bang theory based on astronomical evidence of light spectra, motion of distant galaxies, and composition of matter in the universe.',
    clarification: 'Emphasis is on the astronomical evidence of the red shift of light from galaxies as an indication that the universe is currently expanding, the cosmic microwave background as the remnant radiation from the Big Bang, and the observed composition of ordinary matter of the universe, primarily found in stars and interstellar gases (from the spectra of electromagnetic radiation from stars), which matches that predicted by the Big Bang theory (3:1 ratio of hydrogen to helium).',
    assessmentBoundary: 'Assessment does not include relativistic Doppler equations, calculations of cosmic scale factors, or detailed nuclear reaction cross-sections during Big Bang nucleosynthesis.'
  };

  const SKILLS = [
    {
      id: 'ESS1-2.1',
      title: 'Redshift & Galaxy Spectra',
      subtitle: 'Read absorption lines in galaxy spectra to tell whether light has been stretched to longer (redder) wavelengths.',
      watchOut: 'Redshift does not mean a galaxy looks red to your eye. It means the dark fingerprint lines in its spectrum have shifted toward the red (longer-wavelength) end compared with the same element in a lab on Earth.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-2.1_diag',
          skillId: 'ESS1-2.1',
          level: 'Level 2 (Intermediate)',
          stem: 'In a lab on Earth, hydrogen gas absorbs a sharp red line at 656 nm. When astronomers look at the spectrum of a distant galaxy, that same hydrogen pattern appears at 722 nm.',
          type: 'two_tier',
          tier1Prompt: 'What happened to the wavelength of the light from that distant galaxy?',
          tier1Options: [
            'It shifted to a longer wavelength (toward the red end of the spectrum), called a redshift.',
            'It shifted to a shorter wavelength (toward the blue end of the spectrum), called a blueshift.',
            'It stayed at the exact same wavelength because hydrogen lines never move.',
            'It turned into sound waves before reaching the telescope.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What caused the light\'s wavelength to stretch on its way to Earth?',
          tier2Options: [
            'The space between the galaxy and Earth expanded while the light was traveling, stretching the waves.',
            'Hydrogen atoms in distant galaxies have more protons than hydrogen atoms on Earth.',
            'Dust clouds in space soaked up the blue light and painted the remaining light red.',
            'Gravity around Earth squeezed the light waves into shorter wavelengths.'
          ],
          correctTier2: 0,
          hint: '722 nm is longer than 656 nm, which is toward the red end. What does expanding space do to light waves traveling through it?',
          workedSolution: 'Moving from 656 nm to 722 nm is a shift to a longer wavelength, toward the red end of the visible spectrum (redshift). As light travels across expanding space on its way to Earth, the expansion stretches the light waves to longer wavelengths.',
          givenSummary: 'Reading a redshift (656 nm to 722 nm) and why expanding space causes it'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-2.1_diag2',
          skillId: 'ESS1-2.1',
          level: 'Level 2 (Intermediate)',
          stem: 'In a lab on Earth, hydrogen gas absorbs a sharp red line at 656.0 nm. In the spectrum of the nearby Andromeda galaxy, that same hydrogen line appears at 655.3 nm.',
          type: 'two_tier',
          tier1Prompt: 'What happened to the wavelength of the light from Andromeda?',
          tier1Options: [
            'It shifted to a shorter wavelength (toward the blue end), called a blueshift.',
            'It shifted to a longer wavelength (toward the red end), called a redshift.',
            'It stayed the same, because a change of less than 1 nm does not count.',
            'It changed into the line of a different element on its way to Earth.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What does this shift tell you about Andromeda?',
          tier2Options: [
            'Andromeda is moving toward us, so its light waves arrive squeezed slightly shorter.',
            'Andromeda is moving away from us faster than any other galaxy in the sky.',
            'Andromeda is made of a different kind of hydrogen from the hydrogen on Earth.',
            'Andromeda\'s light was stretched by expanding space on its way to Earth.'
          ],
          correctTier2: 0,
          hint: 'Compare 655.3 nm with 656.0 nm. Is the line now shorter or longer, and which end of the spectrum is that?',
          workedSolution: '655.3 nm is shorter than 656.0 nm, so the line moved toward the blue end: a blueshift. The pattern of lines still matches hydrogen, so the element did not change. A blueshift means Andromeda is moving toward us through space. Nearby galaxies can do that because gravity pulls them together. Across large distances, expanding space wins, and the lines shift red.',
          givenSummary: 'Andromeda\'s blueshifted hydrogen line'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-2.1_L1',
            skillId: 'ESS1-2.1',
            level: 'Level 1 (Foundational)',
            stem: 'In a lab at rest, a hydrogen line sits at 656 nm. Astronomers measure that same line in four galaxies: Galaxy P = 660 nm, Galaxy Q = 672 nm, Galaxy R = 710 nm, and Galaxy S = 780 nm. Order the four galaxies from CLOSEST to Earth (1) to FARTHEST from Earth (4):',
            type: 'ranking',
            items: [
              'Galaxy P',
              'Galaxy Q',
              'Galaxy R',
              'Galaxy S'
            ],
            correctOrder: [
              'Galaxy P',
              'Galaxy Q',
              'Galaxy R',
              'Galaxy S'
            ],
            hint: 'Light from a farther galaxy travels through expanding space for longer, so its wavelength is stretched more.',
            workedSolution: 'In an expanding universe, the farther away a galaxy is, the more its light has been stretched toward longer wavelengths. Ordering from smallest shift to largest shift above 656 nm gives: Galaxy P (660 nm) < Galaxy Q (672 nm) < Galaxy R (710 nm) < Galaxy S (780 nm).',
            givenSummary: 'Ordering galaxy distances from their observed wavelengths'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-2.1_L3',
            skillId: 'ESS1-2.1',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'When astronomers see a group of dark lines shifted to longer wavelengths in a galaxy\'s spectrum, how do they know those lines still come from hydrogen rather than from some unknown element?',
            type: 'mcq',
            options: [
              'The spacing pattern between the lines matches hydrogen\'s lab fingerprint, with every line shifted by the same proportion.',
              'Hydrogen is the only element in the universe that can absorb any light at all.',
              'Every element has only one dark line, so any single line must be hydrogen.',
              'Telescopes can only detect light that comes from hydrogen atoms.'
            ],
            correctIndex: 0,
            hint: 'If you stretch a barcode on a rubber band, each bar moves over, but the pattern of bars stays recognizable.',
            workedSolution: 'Hydrogen has a distinctive spacing of several absorption lines. Expanding space stretches every wavelength from that galaxy by the same percentage, so the whole hydrogen pattern slides toward the red end together without scrambling its spacing.',
            givenSummary: 'How astronomers recognize hydrogen\'s line pattern when it is redshifted'
          };
        }
      ]
    },
    {
      id: 'ESS1-2.2',
      title: 'Expanding Space & Galaxy Motion',
      subtitle: 'Connect galaxy distance and redshift to show that space itself is expanding everywhere.',
      watchOut: 'Earth is not sitting at a special center while galaxies fly away through empty space. Space itself is stretching everywhere, like raisins in rising bread dough: from any raisin, every other raisin moves away, and farther ones move away faster.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-2.2_diag',
          skillId: 'ESS1-2.2',
          level: 'Level 2 (Intermediate)',
          stem: 'When astronomers compare hundreds of galaxies in every direction, they find a clear pattern between a galaxy\'s distance and its redshift.',
          type: 'two_tier',
          tier1Prompt: 'What pattern do they observe?',
          tier1Options: [
            'Farther galaxies show larger redshifts, meaning they are moving away from us faster.',
            'Farther galaxies show smaller redshifts, meaning they have nearly stopped moving.',
            'Half of all distant galaxies are blueshifted and rushing toward Earth.',
            'Every galaxy has the exact same redshift no matter how far away it is.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What does this pattern tell us about the universe?',
          tier2Options: [
            'Space itself is expanding uniformly everywhere, so any two distant galaxies are carried further apart over time.',
            'Earth sits at the exact center of the universe and pushes all other galaxies away.',
            'Galaxies are being pulled outward by a ring of giant stars surrounding the universe.',
            'Light slows down as it gets tired, without any change in the distance between galaxies.'
          ],
          correctTier2: 0,
          hint: 'Think of dots on a stretching rubber band: a dot twice as far away gets carried away twice as fast, no matter which dot you stand on.',
          workedSolution: 'The farther a galaxy is, the more expanding space lies between us and it, so the faster that distance grows and the more its light is redshifted. Because space is stretching everywhere, an observer in any galaxy sees the same pattern.',
          givenSummary: 'Distance vs redshift and why it shows space is expanding everywhere'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-2.2_diag2',
          skillId: 'ESS1-2.2',
          level: 'Level 2 (Intermediate)',
          stem: 'A loaf of raisin bread rises so that every distance in the dough doubles in one hour. Raisin B starts 1 cm from raisin A, and raisin C starts 3 cm from raisin A.',
          type: 'two_tier',
          tier1Prompt: 'Seen from raisin A, how far does each raisin move away in that hour?',
          tier1Options: [
            'B moves 1 cm farther and C moves 3 cm farther, so the farther raisin moves away faster.',
            'B and C each move 1 cm farther, because the dough rises at the same rate everywhere.',
            'B moves away and C moves closer, because the dough pushes the far raisins back.',
            'Only C moves, because raisin A sits at the center of the loaf.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What does the raisin model say about Earth\'s place in the universe?',
          tier2Options: [
            'From any raisin, every other raisin moves away, so the pattern needs no special center.',
            'Raisin A is the center of the loaf, just as Earth is the center of the expansion.',
            'The raisins slide through the dough, just as galaxies fly through empty space.',
            'The dough stops at the crust, just as the universe has a hard outer edge.'
          ],
          correctTier2: 0,
          hint: 'Double each starting distance. Then ask: would raisin B see the same pattern if it looked at A and C?',
          workedSolution: 'Every distance doubles. B goes from 1 cm to 2 cm, moving 1 cm. C goes from 3 cm to 6 cm, moving 3 cm in the same hour, so it moves away three times as fast. Stand on any other raisin and you see the same thing. Galaxies work the same way: the space between them stretches, so farther galaxies recede faster, and no galaxy is the center.',
          givenSummary: 'Raisin bread model of expanding space'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-2.2_L1',
            skillId: 'ESS1-2.2',
            level: 'Level 1 (Foundational)',
            stem: 'Galaxy X is twice as far from Earth as Galaxy Y. How does the redshift and recession speed of Galaxy X compare with Galaxy Y?',
            type: 'mcq',
            options: [
              'Galaxy X has about twice the redshift and is moving away about twice as fast as Galaxy Y.',
              'Galaxy X has half the redshift and is moving away half as fast as Galaxy Y.',
              'Galaxy X is moving toward Earth while Galaxy Y is moving away.',
              'Both galaxies have the exact same redshift because all galaxies move at the same speed.'
            ],
            correctIndex: 0,
            hint: 'In uniformly expanding space, doubling the distance between two galaxies doubles how fast the gap grows.',
            workedSolution: 'Because space expands uniformly, twice as much space lies between Earth and Galaxy X as between Earth and Galaxy Y. That twice-as-long stretch of space grows twice as fast, giving Galaxy X about twice the redshift.',
            givenSummary: 'Comparing recession speed for a galaxy twice as far away'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-2.2_L3',
            skillId: 'ESS1-2.2',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Suppose an astronomer lived in a distant galaxy 5 billion light-years away and pointed a telescope at our Milky Way and other galaxies. What would that astronomer see?',
            type: 'mcq',
            options: [
              'They would see the Milky Way and other distant galaxies redshifted and moving away, just like we see.',
              'They would see the Milky Way standing still at the center of the universe while only their own galaxy moved.',
              'They would see every other galaxy in the sky blueshifted and rushing straight toward their own galaxy.',
              'They would see no starlight at all because light waves can only travel inward toward planet Earth.'
            ],
            correctIndex: 0,
            hint: 'In rising raisin bread, does only one raisin see the others move away, or does every raisin see the same thing?',
            workedSolution: 'Because space itself is expanding everywhere, there is no special center. From any galaxy in the universe, distant galaxies in all directions are carried away by expanding space, with farther galaxies receding faster.',
            givenSummary: 'Why any observer in any galaxy sees the same Hubble expansion'
          };
        }
      ]
    },
    {
      id: 'ESS1-2.3',
      title: 'Primordial Hydrogen & Helium (The 3:1 Ratio)',
      subtitle: 'Explain why the universe\'s ~75% hydrogen and ~25% helium composition is major evidence for the Big Bang.',
      watchOut: 'Ordinary matter in the universe is about 75% hydrogen and 25% helium by mass (a 3:1 ratio), with less than 2% heavier elements. Stars could not have made all that helium on their own; it was forged in the hot, dense first few minutes after the Big Bang.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-2.3_diag',
          skillId: 'ESS1-2.3',
          level: 'Level 2 (Intermediate)',
          stem: 'Spectra of stars and ancient gas clouds across the universe show that ordinary matter is everywhere about 75% hydrogen and 25% helium by mass (a 3:1 ratio).',
          type: 'two_tier',
          tier1Prompt: 'Where did that universal 3:1 mix of hydrogen to helium come from?',
          tier1Options: [
            'Nuclear fusion across the whole hot, dense universe during the first few minutes after the Big Bang.',
            'Slow fusion inside modern stars over the last few million years.',
            'Radioactive decay of heavy uranium atoms floating in cold space.',
            'Chemical burning of hydrogen gas with oxygen in giant space clouds.'
          ],
          correctTier1: 0,
          tier2Prompt: 'How do we know stars did NOT make all 25% of that helium on their own?',
          tier2Options: [
            'Even the oldest, most pristine gas clouds that have barely been touched by stars already contain ~25% helium.',
            'Stars actually use up helium and turn it back into pure hydrogen.',
            'Spectra show that stars contain zero helium in their outer layers.',
            'Nuclear fusion cannot happen inside stars because their cores are too cold.'
          ],
          correctTier2: 0,
          hint: 'Look at ancient gas clouds that formed before generations of stars enriched them: they already have the 75% H / 25% He mix.',
          workedSolution: 'During the first few minutes after the Big Bang, the whole universe was hot and dense enough to fuse about 25% of its protons and neutrons into helium-4 before expansion cooled it down, leaving about 75% as hydrogen. Ancient gas clouds with almost no star-made heavy elements already show this exact 3:1 hydrogen-to-helium ratio.',
          givenSummary: 'Why the 75% hydrogen / 25% helium ratio supports the Big Bang'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-2.3_diag2',
          skillId: 'ESS1-2.3',
          level: 'Level 2 (Intermediate)',
          stem: 'A gas cloud in a small, distant galaxy holds almost no elements heavier than helium. Yet it is about 25% helium by mass, the same as everywhere else.',
          type: 'two_tier',
          tier1Prompt: 'What does this cloud tell you about where its helium came from?',
          tier1Options: [
            'The helium was there before stars formed, made in the first minutes after the Big Bang.',
            'Stars inside the small galaxy made all of that helium in the last few million years.',
            'The helium came from uranium atoms decaying inside the cold gas cloud.',
            'The helium formed when hydrogen burned with oxygen inside the cloud.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why is the lack of heavy elements the key clue?',
          tier2Options: [
            'Stars that make helium also make heavier elements, so this cloud has seen almost no stars.',
            'Heavy elements turn into helium over time, so their absence proves nothing.',
            'Helium cannot exist in any cloud that also holds heavy elements.',
            'Clouds without heavy elements are too cold to hold any gas at all.'
          ],
          correctTier2: 0,
          hint: 'If stars had made the helium, what else would they have left behind in the cloud?',
          workedSolution: 'Stars fuse hydrogen into helium, but they also make carbon, oxygen, and heavier elements, and they spread these when they die. This cloud has almost none of those, so few stars have ever touched it. Its 25% helium must be older than the stars. It was made across the whole hot, dense universe in the first few minutes after the Big Bang.',
          givenSummary: 'A pristine cloud with 25% helium'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-2.3_L1',
            skillId: 'ESS1-2.3',
            level: 'Level 1 (Foundational)',
            stem: 'Sort each statement under Big Bang Fusion (first few minutes) or Stellar Fusion (inside stars):',
            type: 'categorize',
            categories: ['Big Bang Fusion (first few minutes)', 'Stellar Fusion (inside stars)'],
            items: [
              { label: 'Happened everywhere across the early universe and stopped after a few minutes as space cooled', correctCategoryIndex: 0 },
              { label: 'Happens inside dense star cores over millions or billions of years', correctCategoryIndex: 1 },
              { label: 'Made the ~75% hydrogen and ~25% helium mix (plus a trace of lithium), and nothing heavier', correctCategoryIndex: 0 },
              { label: 'Makes heavier elements such as carbon, oxygen, silicon, and iron', correctCategoryIndex: 1 }
            ],
            hint: 'The Big Bang made H and He in minutes; stars take millions or billions of years to make carbon, oxygen, and iron.',
            workedSolution: 'In the first few minutes after the Big Bang, fusion across the rapidly cooling universe produced ~75% hydrogen, ~25% helium, and a trace of lithium. Elements heavier than lithium (like carbon, oxygen, and iron) were forged much later inside stars.',
            givenSummary: 'Big Bang fusion vs fusion inside stars'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-2.3_L3',
            skillId: 'ESS1-2.3',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Why did fusion in the early Big Bang stop after making helium (and a tiny trace of lithium) instead of fusing all the way to carbon and iron?',
            type: 'mcq',
            options: [
              'The universe expanded and cooled so fast that within minutes it became too cool and thin for heavier fusion.',
              'Helium nuclei can never fuse under any temperature or pressure anywhere in the universe, even inside stars.',
              'All protons and free neutrons in the universe disappeared completely after the first twenty minutes of expansion.',
              'Carbon and iron nuclei had already been made in space before any hydrogen and helium nuclei formed.'
            ],
            correctIndex: 0,
            hint: 'Fusing helium into carbon takes high density and temperature for a long time. What was the early universe doing every second?',
            workedSolution: 'As the early universe expanded rapidly, its temperature and density dropped every second. Within about 20 minutes, the gas was already too cool and spread out to fuse helium into heavier nuclei like carbon, freezing the cosmic mix at ~75% H and ~25% He until the first stars formed.',
            givenSummary: 'Why Big Bang fusion stopped at helium as the universe expanded and cooled'
          };
        }
      ]
    },
    {
      id: 'ESS1-2.4',
      title: 'The Cosmic Microwave Background (CMB)',
      subtitle: 'Explain how the faint microwave glow coming from every direction in the sky is leftover radiation from the hot early universe.',
      watchOut: 'The Cosmic Microwave Background (CMB) does not come from stars or galaxies. It is the cooled afterglow of the hot early universe, stretched into low-energy microwaves as space expanded over 13.8 billion years.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-2.4_diag',
          skillId: 'ESS1-2.4',
          level: 'Level 2 (Intermediate)',
          stem: 'Radio telescopes pointed at empty sky in every direction detect a faint, uniform glow of microwave radiation.',
          type: 'two_tier',
          tier1Prompt: 'Where did this Cosmic Microwave Background (CMB) radiation come from?',
          tier1Options: [
            'It is leftover thermal glow from the hot early universe, released once the gas cooled enough to turn transparent.',
            'It is artificial radio noise broadcast by cell towers and communication satellites orbiting high above Earth.',
            'It is ordinary starlight bouncing back toward us off ice crystals at the edge of our solar system.',
            'It is microwave energy given off today by modern spiral galaxies burning solid iron in their cores.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why is that ancient glow observed today as low-energy microwaves instead of bright visible light?',
          tier2Options: [
            'Over 13.8 billion years of cosmic expansion, the traveling light waves stretched into the microwave range.',
            'Dust clouds in space ate up the red and green light and left only microwaves behind.',
            'The early universe started out freezing cold and only ever gave off low-energy microwave radiation.',
            'Earth\'s upper atmosphere absorbs incoming visible starlight and turns all of it into microwaves.'
          ],
          correctTier2: 0,
          hint: 'The early universe was glowing hot, and space has expanded enormously since that light was set free.',
          workedSolution: 'When the early universe cooled enough for electrons and nuclei to form neutral atoms, the hot glowing fog turned transparent and its light began streaming freely through space. Over 13.8 billion years of cosmic expansion, those light waves were stretched to much longer wavelengths, arriving today from every direction as a faint microwave glow.',
          givenSummary: 'Origin of the Cosmic Microwave Background and why it is now microwaves'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-2.4_diag2',
          skillId: 'ESS1-2.4',
          level: 'Level 2 (Intermediate)',
          stem: 'When the Cosmic Microwave Background (CMB) light was released, the gas that gave it off was about 3,000 K. Today the CMB matches a temperature of only 2.7 K.',
          type: 'two_tier',
          tier1Prompt: 'Why does the CMB look so much colder today?',
          tier1Options: [
            'Expanding space stretched the light to longer wavelengths, and longer waves match a cooler glow.',
            'The light lost its energy by bumping into dust between the galaxies.',
            'The early universe was always 2.7 K, so nothing about the light has changed.',
            'Earth\'s atmosphere cools the light down before telescopes can detect it.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why can\'t telescopes see any glow from before the gas cooled to 3,000 K?',
          tier2Options: [
            'Before that, free electrons scattered every photon, so the hot gas was not transparent.',
            'Before that, the universe gave off no light of any kind.',
            'Older light travels more slowly, so it has not reached Earth yet.',
            'Galaxies in front of it block all of the older light from reaching us.'
          ],
          correctTier2: 0,
          hint: 'The light has been traveling for 13.8 billion years through expanding space. What does stretching do to a wave?',
          workedSolution: 'Before the gas cooled to about 3,000 K, free electrons scattered light in every direction, so the universe was a glowing fog. Once electrons joined nuclei, the light could travel freely. Over 13.8 billion years, expanding space stretched those waves about 1,100 times longer. Longer waves carry less energy, so the glow now matches 2.7 K and arrives as microwaves.',
          givenSummary: 'Why the CMB cooled from 3,000 K to 2.7 K'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-2.4_L1',
            skillId: 'ESS1-2.4',
            level: 'Level 1 (Foundational)',
            stem: 'Put the four stages that produced today\'s Cosmic Microwave Background in order from earliest (1) to today (4):',
            type: 'ranking',
            items: [
              'The early universe is a hot, dense fog of loose nuclei and electrons that traps light by constant scattering.',
              'Expansion cools the universe enough for electrons and nuclei to join into neutral hydrogen and helium atoms.',
              'With neutral atoms formed, space turns transparent and the hot glow streams freely in every direction.',
              'Billions of years of cosmic expansion stretch those light waves into the faint microwave background we detect today.'
            ],
            correctOrder: [
              'The early universe is a hot, dense fog of loose nuclei and electrons that traps light by constant scattering.',
              'Expansion cools the universe enough for electrons and nuclei to join into neutral hydrogen and helium atoms.',
              'With neutral atoms formed, space turns transparent and the hot glow streams freely in every direction.',
              'Billions of years of cosmic expansion stretch those light waves into the faint microwave background we detect today.'
            ],
            hint: 'Follow the timeline: hot opaque fog -> cools to form neutral atoms -> light travels freely -> stretched into microwaves.',
            workedSolution: 'First, loose electrons in the hot plasma scattered light like a dense fog (1). Second, expansion cooled the gas so electrons bound to nuclei as neutral atoms (2). Third, the newly transparent universe let that thermal glow travel freely (3). Fourth, ongoing expansion stretched the waves into microwaves (4).',
            givenSummary: 'Timeline from the early hot fog to today\'s microwave background'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-2.4_L3',
            skillId: 'ESS1-2.4',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Why is the fact that the Cosmic Microwave Background comes nearly equally from EVERY direction in the sky strong evidence for the Big Bang?',
            type: 'mcq',
            options: [
              'It shows the glow filled the entire early universe, rather than coming from a single star, galaxy, or local explosion.',
              'It shows that Earth sits inside a hollow shell of microwave ovens orbiting the Sun.',
              'It shows that microwaves cannot travel through space and are made inside the telescope.',
              'It shows that only our Milky Way galaxy ever experienced the Big Bang.'
            ],
            correctIndex: 0,
            hint: 'If a glow comes from a single object (like the Sun or one galaxy), you only see it when you point your telescope at that spot.',
            workedSolution: 'Light from stars or individual galaxies comes from specific spots in the sky. Because the CMB arrives with the same temperature from every direction, it must be leftover radiation that filled the entire early universe.',
            givenSummary: 'Why an all-sky uniform glow points to a hot early universe everywhere'
          };
        }
      ]
    },
    {
      id: 'ESS1-2.5',
      title: 'Looking Far Away Means Looking Back in Time',
      subtitle: 'Explain why distant galaxies are seen as they were billions of years ago and how that shows the universe changes over time.',
      watchOut: 'Light travels fast, but not instantly. When we look at a galaxy 10 billion light-years away, we see the light that left it 10 billion years ago, showing us what young galaxies looked like in the early universe.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-2.5_diag',
          skillId: 'ESS1-2.5',
          level: 'Level 2 (Intermediate)',
          stem: 'Space telescopes looking at very distant galaxies (over 12 billion light-years away) see galaxies that are smaller, clumpier, and contain far fewer heavy elements than nearby galaxies.',
          type: 'two_tier',
          tier1Prompt: 'Why do those very distant galaxies look so young and low in heavy elements?',
          tier1Options: [
            'Their light took over 12 billion years to arrive, showing them when the universe was young and few stars had died.',
            'Galaxies located far from Earth are forbidden by gravity from ever forming large, bright stars.',
            'Telescope mirrors always blur distant spiral galaxies until they look small, clumpy, and low in mass.',
            'Heavy elements like iron cannot exist more than a billion light-years away from our Sun.'
          ],
          correctTier1: 0,
          tier2Prompt: 'How does this observation support the Big Bang model over an unchanging ("steady-state") universe?',
          tier2Options: [
            'It shows the universe has a history and evolves over time, starting with small, hydrogen-and-helium-rich galaxies.',
            'It shows the universe has looked the exact same at every distance and every point in time.',
            'It proves that light travels across the universe in zero seconds.',
            'It shows that nearby galaxies are getting smaller and losing their heavy elements.'
          ],
          correctTier2: 0,
          hint: 'A light-year is how far light travels in one year. How old is the picture when light has traveled for 12 billion years?',
          workedSolution: 'Because light takes time to travel, looking 12 billion light-years away shows galaxies as they were 12 billion years ago. Seeing smaller, clumpy galaxies with very few heavy elements confirms that the early universe started out with mostly hydrogen and helium and built larger, enriched galaxies over billions of years.',
          givenSummary: 'Why distant galaxies look young and how that supports an evolving Big Bang universe'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-2.5_diag2',
          skillId: 'ESS1-2.5',
          level: 'Level 2 (Intermediate)',
          stem: 'Light from the Sun takes about 8 minutes to reach Earth. Light from the Andromeda galaxy takes about 2.5 million years.',
          type: 'two_tier',
          tier1Prompt: 'If a star in Andromeda exploded yesterday, when could astronomers on Earth see it?',
          tier1Options: [
            'In about 2.5 million years, when the light from the explosion reaches Earth.',
            'Tonight, because light crosses the space between galaxies in an instant.',
            'In about 8 minutes, the same time that light takes from the Sun.',
            'Never, because light cannot travel from one galaxy to another.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What does this tell you about every image of deep space?',
          tier2Options: [
            'Each one shows objects as they were when their light left, so farther means further back.',
            'Each one shows objects exactly as they are right now, whatever their distance.',
            'Telescopes speed up old light, so we see distant galaxies as they are today.',
            'Distant galaxies only look young because telescopes blur their fine details.'
          ],
          correctTier2: 0,
          hint: 'Light is fast, but not instant. How long does Andromeda\'s light spend on the way?',
          workedSolution: 'Light from Andromeda spends about 2.5 million years crossing space. The light from an explosion yesterday has only just set off, so it will arrive in about 2.5 million years. The same idea runs the other way: the Andromeda we see tonight is how it looked 2.5 million years ago. The farther away you look, the further back in time you see.',
          givenSummary: 'Andromeda\'s light and looking back in time'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-2.5_L1',
            skillId: 'ESS1-2.5',
            level: 'Level 1 (Foundational)',
            stem: 'When a telescope captures light from a galaxy 10 billion light-years away, what are astronomers actually seeing?',
            type: 'mcq',
            options: [
              'The galaxy as it looked 10 billion years ago, when the light left it.',
              'The galaxy as it looks at this exact second today.',
              'What the galaxy will look like 10 billion years in the future.',
              'A reflection of our own Milky Way bouncing off the edge of space.'
            ],
            correctIndex: 0,
            hint: 'Light from a galaxy 10 billion light-years away takes 10 billion years to reach the telescope.',
            workedSolution: 'Light travels 1 light-year per year, so light from 10 billion light-years away spent 10 billion years in flight. The telescope shows the galaxy as it was 10 billion years ago.',
            givenSummary: 'Seeing the past when observing a galaxy 10 billion light-years away'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-2.5_L3',
            skillId: 'ESS1-2.5',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'An older rival idea called the "Steady State" model claimed the universe had no beginning and has always looked the same at every time. Which observation directly ruled that idea out?',
            type: 'mcq',
            options: [
              'Distant galaxies (seen in the ancient past) are smaller with fewer heavy elements than nearby ones, and the CMB fills the sky.',
              'Nearby stars in our galaxy shine with the same dark hydrogen absorption lines as our own Sun.',
              'All eight planets in our solar system orbit the Sun along nearly flat elliptical paths.',
              'The neighboring Andromeda galaxy is close enough that local gravity pulls it toward the Milky Way.'
            ],
            correctIndex: 0,
            hint: 'If the universe never changed over time, how should galaxies 12 billion years ago compare with galaxies today?',
            workedSolution: 'An unchanging universe would show the same mix of galaxies at every lookback distance and would never have been a hot, dense plasma. Finding that ancient galaxies were smaller and poorer in heavy elements, together with the all-sky Cosmic Microwave Background, showed the universe evolved from a hot, dense beginning.',
            givenSummary: 'Evidence that ruled out an unchanging steady-state universe'
          };
        }
      ]
    },
    {
      id: 'ESS1-2.6',
      title: 'Putting the Three Lines of Evidence Together',
      subtitle: 'Combine galaxy redshifts, the Cosmic Microwave Background, and the 3:1 H-to-He ratio into one explanation of the Big Bang.',
      watchOut: 'The Big Bang was not an explosion of a bomb inside an already-empty room. It was the rapid expansion of space itself from a very hot, very dense beginning about 13.8 billion years ago, supported by three independent lines of evidence.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-2.6_diag',
          skillId: 'ESS1-2.6',
          level: 'Level 2 (Intermediate)',
          stem: 'If space is expanding today so that distant galaxies are moving further apart, imagine running that expansion backward in time like rewinding a movie.',
          type: 'two_tier',
          tier1Prompt: 'What do you get when you rewind the expansion of the universe back to the beginning (~13.8 billion years ago)?',
          tier1Options: [
            'All matter and energy were packed together in an extremely hot, dense state before expanding and cooling.',
            'Galaxies were spread out even farther apart in the past and were freezing cold.',
            'Only our solar system existed, floating alone in an infinite empty room.',
            'Nothing changes when you rewind, because galaxies have never moved.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which two other observations independently confirm that hot, dense beginning?',
          tier2Options: [
            'The all-sky Cosmic Microwave Background afterglow and the universal ~75% hydrogen / ~25% helium composition.',
            'The phases of Earth\'s Moon and the daily rising and setting of the Sun.',
            'The presence of iron in Earth\'s core and oxygen in Earth\'s atmosphere.',
            'The fact that comets have icy tails when they pass near the Sun.'
          ],
          correctTier2: 0,
          hint: 'Rewinding an expansion brings everything closer and hotter. Which two cosmic fossils came straight out of that hot early state?',
          workedSolution: 'Rewinding the observed expansion of galaxies means the universe was once much smaller, denser, and hotter (~13.8 billion years ago). That hot, dense state predicted two things astronomers later measured: (1) a cooled microwave afterglow filling all of space (the CMB), and (2) ordinary matter made of ~75% hydrogen and ~25% helium forged in the first few minutes.',
          givenSummary: 'Connecting galaxy expansion, the CMB, and the 75% H / 25% He ratio'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-2.6_diag2',
          skillId: 'ESS1-2.6',
          level: 'Level 2 (Intermediate)',
          stem: 'A classmate says: "The Big Bang theory rests on one thing: galaxies are redshifted. Take that away and there is nothing left."',
          type: 'two_tier',
          tier1Prompt: 'Is your classmate right?',
          tier1Options: [
            'No. Redshifts, the CMB, and the 3:1 hydrogen-to-helium ratio each point to a hot, dense start.',
            'Yes. The CMB and the helium ratio have nothing to do with the Big Bang.',
            'Yes. Scientists accept the theory because it was the first idea anyone proposed.',
            'No. The only real evidence is that nearby galaxies are blueshifted toward us.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why does having three separate lines of evidence matter?',
          tier2Options: [
            'Each was measured a different way, so all three agreeing by accident would be a huge coincidence.',
            'Three results are what a theory needs before it can be called a law.',
            'Each line of evidence proves the theory alone, so the other two are extras.',
            'Having three lets scientists pick whichever one fits their opinion best.'
          ],
          correctTier2: 0,
          hint: 'Name the three pillars of evidence. Were they found with the same tool, or with different ones?',
          workedSolution: 'Three separate observations point to the same hot, dense beginning. Galaxy redshifts show space is expanding. The CMB is the cooled glow of the early hot universe. The 3:1 hydrogen-to-helium ratio matches fusion in the first few minutes. Each was found with different tools, so their agreement is strong support. No single result carries the theory alone.',
          givenSummary: 'Why the Big Bang does not rest on redshift alone'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-2.6_L1',
            skillId: 'ESS1-2.6',
            level: 'Level 1 (Foundational)',
            stem: 'Match each of the three main pillars of Big Bang evidence to what it tells us:',
            type: 'categorize',
            categories: ['Redshift of distant galaxies', 'Cosmic Microwave Background (CMB)', '75% hydrogen / 25% helium ratio'],
            items: [
              { label: 'Shows that space is currently expanding, with farther galaxies receding faster', correctCategoryIndex: 0 },
              { label: 'Cooled leftover light from when the hot early universe first became transparent', correctCategoryIndex: 1 },
              { label: 'Matches the mix of light nuclei forged during the hot first few minutes', correctCategoryIndex: 2 },
              { label: 'Measured from dark absorption lines shifted toward longer wavelengths', correctCategoryIndex: 0 },
              { label: 'Detected as a faint, uniform microwave glow coming from every direction in the sky', correctCategoryIndex: 1 }
            ],
            hint: 'Shifted spectral lines = redshift/expansion. All-sky microwave glow = CMB. 3:1 H-to-He mix = early fusion.',
            workedSolution: 'The Big Bang rests on three independent observations: (1) galaxy redshifts show space is expanding; (2) the Cosmic Microwave Background is the stretched, cooled glow from the hot early universe; and (3) the ~75% H / ~25% He abundance matches what fused in the first few minutes.',
            givenSummary: 'Matching the three pillars of Big Bang evidence'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-2.6_L3',
            skillId: 'ESS1-2.6',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A classmate says: "The Big Bang was just a giant bomb that exploded at one spot in empty space and threw galaxies outward." What is wrong with that picture?',
            type: 'mcq',
            options: [
              'The Big Bang was the expansion of space itself everywhere at once, not an explosion from one spot into empty space.',
              'The Big Bang happened inside our Sun and only threw out the eight planets of our solar system.',
              'Distant galaxies are actually rushing inward toward a single central point, not moving apart from one another.',
              'The Big Bang only created heavy elements like gold and uranium, not light elements like hydrogen or helium.'
            ],
            correctIndex: 0,
            hint: 'If a bomb explodes in a room, it has a center and an edge, and its glow comes from one spot. Why is the CMB in every direction?',
            workedSolution: 'An explosion in empty space would have a center and would not leave a uniform microwave glow coming equally from every direction. In the Big Bang model, space itself was hot and dense everywhere and has been stretching and cooling ever since.',
            givenSummary: 'Why the Big Bang is the expansion of space itself, not an explosion in empty space'
          };
        }
      ]
    }
  ];

  window.PE_DATA_HS_ESS1_2 = {
    info: PE_INFO,
    skills: SKILLS
  };
})();
