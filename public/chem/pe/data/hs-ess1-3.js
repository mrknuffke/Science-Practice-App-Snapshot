/**
 * HS-ESS1-3: Stellar Nucleosynthesis of Elements
 * Items rewritten (Oct 2026) to the Tier 3 register in docs/textbook/VOICE.md and to the core scope
 * of lesson 5-3a: where the elements come from (Big Bang made H and He; stars fuse elements up to iron
 * during their lives; supernova explosions and neutron-star collisions make elements heavier than iron),
 * how a star's mass and stage decide what it can fuse, and why core fusion stops at iron (fusing up to
 * iron releases energy; fusing past iron costs energy).
 * Removed Enrichment-only jargon (Type II label, shell temperatures in ratusan/billions of K, 8.79 MeV,
 * electron degeneracy / electron capture, AGB stars, and s-process vs r-process) and fixed the
 * self-answering ranking item in ESS1-3.2_L1.
 * Zero em-dash compliant: hyphens, colons, and parentheses only.
 */
(function() {
  'use strict';

  const PE_INFO = {
    id: 'HS-ESS1-3',
    code: 'ESS1-3',
    title: 'Stellar Nucleosynthesis of Elements',
    unit: 'Unit 5: Nuclear & Astrophysics',
    description: 'Communicate scientific ideas about the way stars, over their life cycle, produce elements.',
    clarification: 'Emphasis is on the way nucleosynthesis, and therefore the different elements created, varies as a function of the mass of a star and the stage in its lifetime. Elements up to iron are produced by nuclear fusion in stellar cores. Elements heavier than iron are formed during supernova explosions and neutron star collisions.',
    assessmentBoundary: 'Assessment does not include the details of specific nucleosynthesis reactions beyond carbon, oxygen, and iron, or calculations of binding energies per nucleon.'
  };

  const SKILLS = [
    {
      id: 'ESS1-3.1',
      title: 'How a Star\'s Mass Decides What It Makes',
      subtitle: 'Compare which elements a Sun-like star can fuse versus what a massive star (>8 solar masses) can fuse.',
      watchOut: 'Our Sun fuses hydrogen into helium now, and after its core hydrogen runs out it will fuse helium into carbon and oxygen. It will NEVER get hot enough to make iron or gold. Only massive stars (above ~8 solar masses) fuse all the way up to iron.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-3.1_diag',
          skillId: 'ESS1-3.1',
          level: 'Level 2 (Intermediate)',
          stem: 'Compare a Sun-like star (1 solar mass) with a massive supergiant star (20 solar masses) over their full lifetimes.',
          type: 'two_tier',
          tier1Prompt: 'What are the heaviest elements our Sun will ever fuse in its core?',
          tier1Options: [
            'Carbon and oxygen, made by fusing helium after its core hydrogen runs out.',
            'Iron and nickel, made right before the Sun explodes as a supernova.',
            'Gold and uranium, made while the Sun is on the main sequence.',
            'Only helium, because the Sun can never fuse helium into anything heavier.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why can a 20-solar-mass star fuse elements all the way up to iron when the Sun cannot?',
          tier2Options: [
            'Its much larger mass creates a stronger gravitational squeeze, heating its core enough to fuse heavier nuclei.',
            'Massive supergiant stars have much cooler cores, so heavy nuclei do not break apart during collisions.',
            'Massive stars contain no positive protons in their cores, so nuclei never repel each other electrically.',
            'Low-mass stars like the Sun have magnetic fields that block carbon nuclei from ever forming.'
          ],
          correctTier2: 0,
          hint: 'Heavier nuclei have more protons and push each other apart harder. What gives a massive star a hotter, denser core?',
          workedSolution: 'After our Sun finishes core hydrogen fusion, it will fuse helium into carbon and oxygen during its red-giant stage, and stop there because 1 solar mass of gravity cannot heat the core enough to fuse carbon. A 20-solar-mass star has a much stronger gravitational squeeze that heats its core enough to fuse heavier elements step by step up to iron.',
          givenSummary: 'Sun-like star (stops at C and O) vs massive star (fuses up to Fe)'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-3.1_diag2',
          skillId: 'ESS1-3.1',
          level: 'Level 2 (Intermediate)',
          stem: 'A massive star of 15 solar masses ends its life with an iron core. The Sun will end its life with a carbon-oxygen core.',
          type: 'two_tier',
          tier1Prompt: 'What is the heaviest element the 15-solar-mass star fuses in its core?',
          tier1Options: [
            'Iron, after fusing its way up through carbon, oxygen, and silicon.',
            'Carbon and oxygen, the same as the Sun, because every star stops there.',
            'Gold, because a heavier star can fuse heavier elements without any limit.',
            'Only helium, because massive stars use up their hydrogen too fast to do more.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why does more mass let a star fuse heavier nuclei?',
          tier2Options: [
            'Stronger gravity squeezes the core hotter, so nuclei with more protons can hit hard enough to fuse.',
            'More mass means more neutrons, and neutrons are the only fuel for fusing heavy elements.',
            'Massive stars have cooler cores, so heavy nuclei stay together after they collide.',
            'In massive stars, protons lose their charge, so nuclei no longer repel each other.'
          ],
          correctTier2: 0,
          hint: 'Heavier nuclei carry more protons, so they push each other apart harder. What makes a core hot enough to beat that?',
          workedSolution: 'Every fusion stage needs nuclei to hit hard enough to beat their electric repulsion. Heavier nuclei carry more protons, so they repel harder and need a hotter core. A 15-solar-mass star has much stronger gravity, which squeezes its core far hotter than the Sun\'s. It can climb through carbon, oxygen, and silicon to iron. The Sun stops at carbon and oxygen.',
          givenSummary: '15-solar-mass star vs the Sun: the heaviest element fused'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-3.1_L1',
            skillId: 'ESS1-3.1',
            level: 'Level 1 (Foundational)',
            stem: 'Order these three types of stars from the LIGHTEST heaviest element they can fuse in their cores (1) to the HEAVIEST (3):',
            type: 'ranking',
            items: [
              'Tiny red dwarf (0.2 solar masses)',
              'Sun-like star (1.0 solar mass)',
              'Massive supergiant (20 solar masses)'
            ],
            correctOrder: [
              'Tiny red dwarf (0.2 solar masses)',
              'Sun-like star (1.0 solar mass)',
              'Massive supergiant (20 solar masses)'
            ],
            hint: 'More mass means a stronger gravitational squeeze, a hotter core, and heavier fusion products.',
            workedSolution: 'A tiny 0.2-solar-mass red dwarf only ever fuses hydrogen into helium (1). A 1.0-solar-mass star like our Sun fuses hydrogen to helium, and later helium to carbon and oxygen (2). A 20-solar-mass supergiant has enough gravity to fuse heavier elements all the way up to iron (3).',
            givenSummary: 'Ordering stars by mass and the heaviest elements their cores can fuse'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-3.1_L3',
            skillId: 'ESS1-3.1',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Why does fusing two carbon nuclei (6 protons each) take a much hotter core than fusing two hydrogen nuclei (1 proton each)?',
            type: 'mcq',
            options: [
              'Carbon nuclei carry six times the positive charge, so they push each other apart much harder and must collide much faster to touch.',
              'Carbon nuclei are neutral, so gravity has to pull them together without any electric force.',
              'Carbon atoms keep all of their outer electron shells inside the core, which cushions the collisions.',
              'Hydrogen nuclei weigh more than carbon nuclei, so hydrogen moves faster at low temperatures.'
            ],
            correctIndex: 0,
            hint: 'Compare the electric repulsion between two 1+ charges with the repulsion between two 6+ charges.',
            workedSolution: 'Every proton in a nucleus adds positive charge. Two carbon nuclei (Z = 6) push each other apart with far stronger electric repulsion than two single protons (Z = 1). Only at much higher core temperatures do carbon nuclei move fast enough to slam past that repulsion and fuse.',
            givenSummary: 'Why heavier nuclei with more protons need higher temperatures to fuse'
          };
        }
      ]
    },
    {
      id: 'ESS1-3.2',
      title: 'Fusion Stages Across a Star\'s Life',
      subtitle: 'Trace how a star builds heavier elements step by step as each core fuel runs out.',
      watchOut: 'A star does not make carbon, oxygen, silicon, and iron all at the same time from day one. Each stage uses the "ash" of the stage before it as the core contracts and heats up.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-3.2_diag',
          skillId: 'ESS1-3.2',
          level: 'Level 2 (Intermediate)',
          stem: 'Over its life, a massive star (20 solar masses) fuses different fuels in its core one stage after another.',
          type: 'two_tier',
          tier1Prompt: 'In what order do the main fuels fuse in the center of a massive star as it ages?',
          tier1Options: [
            'Hydrogen fuses into helium first, then helium into carbon and oxygen, and later heavier nuclei up to iron.',
            'Iron fuses into silicon first, then silicon splits into oxygen, carbon, helium, and finally hydrogen.',
            'Gold and uranium fuse first on the main sequence, and hydrogen fuses last.',
            'All elements from hydrogen to uranium fuse at the exact same rate from the day the star is born.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What triggers the start of each new fusion stage when the previous fuel runs out in the core?',
          tier2Options: [
            'When a fuel runs out, outward pressure drops and gravity squeezes the core until the ash gets hot enough to fuse.',
            'The star cools down toward absolute zero, which lets heavier positively charged nuclei stick together easily.',
            'Nearby rocky planets fall into the star and bring fresh chemical catalysts into the central core.',
            'Starlight from neighboring stars shines into the core and ignites the next heavier element.'
          ],
          correctTier2: 0,
          hint: 'Each stage\'s product (helium, then carbon/oxygen, then silicon...) has more protons and needs a hotter squeeze from gravity to ignite.',
          workedSolution: 'A massive star spends most of its life fusing hydrogen into helium. When core hydrogen runs out, gravity squeezes and heats the helium core until helium fuses into carbon and oxygen. In a massive star, that cycle repeats through heavier nuclei (such as silicon) until an iron core builds up.',
          givenSummary: 'Step-by-step fusion stages in an aging massive star'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-3.2_diag2',
          skillId: 'ESS1-3.2',
          level: 'Level 2 (Intermediate)',
          stem: 'A massive star\'s core has just run out of helium. The core is now mostly carbon and oxygen, the ash of helium fusion.',
          type: 'two_tier',
          tier1Prompt: 'What happens next in the core?',
          tier1Options: [
            'Gravity squeezes the core until it gets hot enough to fuse carbon.',
            'The star goes back to fusing hydrogen in the center of its core.',
            'The core cools, and the star stops fusing anything for good.',
            'The carbon splits back into helium to refuel the core.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why does each new stage need a hotter core than the stage before?',
          tier2Options: [
            'Each new fuel has nuclei with more protons, so they repel harder and need faster collisions.',
            'Each new fuel is lighter, so it floats away unless the core gets hotter.',
            'A hotter core makes gravity weaker, which lets the outer layers expand.',
            'Each stage uses up the star\'s heat, so the next stage starts out colder.'
          ],
          correctTier2: 0,
          hint: 'When a fuel runs out, outward pressure drops. What does gravity do then, and what does squeezing do to temperature?',
          workedSolution: 'With helium gone, fusion in the center slows and outward pressure drops. Gravity squeezes the core, and the squeeze heats it. Carbon nuclei have 6 protons each, so they repel far harder than helium nuclei. Only when the core gets hot enough do carbon nuclei hit hard enough to fuse. Each stage burns the ash of the stage before.',
          givenSummary: 'What happens after a massive star runs out of core helium'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-3.2_L1',
            skillId: 'ESS1-3.2',
            level: 'Level 1 (Foundational)',
            stem: 'Near the end of a massive supergiant\'s life, its elements sit in layers like an onion, with the lightest fuel on the outside and the heaviest ash at the center. Order these four elements from the OUTERMOST layer (1) to the INNERMOST core (4):',
            type: 'ranking',
            items: [
              'Hydrogen (Z = 1)',
              'Helium (Z = 2)',
              'Carbon and oxygen (Z = 6, 8)',
              'Iron (Z = 26)'
            ],
            correctOrder: [
              'Hydrogen (Z = 1)',
              'Helium (Z = 2)',
              'Carbon and oxygen (Z = 6, 8)',
              'Iron (Z = 26)'
            ],
            hint: 'Temperature and pressure rise as you go deeper, so lighter elements sit further out and heavier elements sit closer to the center.',
            workedSolution: 'From the cooler outside to the hottest center, the layers follow atomic number and fusion order: hydrogen on the outside (1), then helium (2), then carbon and oxygen (3), and iron at the very center (4).',
            givenSummary: 'Ordering a massive star\'s layers from outside (H) to center (Fe)'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-3.2_L3',
            skillId: 'ESS1-3.2',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Why doesn\'t our Sun fuse helium into carbon and oxygen right now while it still has plenty of hydrogen in its core?',
            type: 'mcq',
            options: [
              'While hydrogen fuses, its outward pressure keeps the core near 15 million K, which is too cool to fuse helium.',
              'There is zero helium anywhere inside the Sun until the very last second of its main-sequence life.',
              'Helium nuclei carry a negative electric charge and get pushed out of the Sun\'s positively charged core.',
              'Hydrogen gas in the core absorbs newly formed carbon atoms and turns them back into single protons.'
            ],
            correctIndex: 0,
            hint: 'Fusing helium (2 protons each) takes a much hotter core than fusing hydrogen (1 proton each). What happens to the core temperature only AFTER hydrogen runs out?',
            workedSolution: 'As long as hydrogen fusion is running, its outward pressure balances gravity at about 15 million K, which is hot enough to fuse hydrogen (Z = 1) but too cool to fuse helium (Z = 2). Only after core hydrogen runs out does gravity squeeze and heat the core enough (~100 million K) to start fusing helium into carbon and oxygen.',
            givenSummary: 'Why the Sun fuses helium into carbon and oxygen only after core hydrogen runs out'
          };
        }
      ]
    },
    {
      id: 'ESS1-3.3',
      title: 'Why Core Fusion Stops at Iron',
      subtitle: 'Explain why fusing elements up to iron releases energy, while fusing iron or heavier elements costs energy.',
      watchOut: 'Iron (Z = 26) is the turning point for nuclear energy. Fusing lighter nuclei up to iron RELEASES energy that pushes outward against gravity. Fusing iron or anything heavier ABSORBS energy instead of releasing it, so an iron core cannot hold a star up.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-3.3_diag',
          skillId: 'ESS1-3.3',
          level: 'Level 2 (Intermediate)',
          stem: 'A massive star can fuse lighter nuclei step by step all the way to iron (Fe, Z = 26), but its core can never power itself by fusing iron into heavier elements.',
          type: 'two_tier',
          tier1Prompt: 'How does the energy change for fusing nuclei lighter than iron compare with fusing iron itself?',
          tier1Options: [
            'Fusing nuclei lighter than iron releases energy, while fusing iron or heavier nuclei takes in (costs) energy.',
            'Fusing nuclei lighter than iron takes in energy, while fusing iron releases the most energy of all.',
            'Fusing iron releases the exact same energy per gram as fusing hydrogen into helium.',
            'Iron nuclei have no protons or neutrons, so they cannot touch other nuclei.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What happens to a massive star once its core fills with iron?',
          tier2Options: [
            'With no fusion energy pushing outward, gravity wins and the core collapses in a fraction of a second.',
            'The iron core floats gently to the surface and drifts off as a calm breeze.',
            'The star settles down and shines steadily on iron fusion for another 50 billion years.',
            'The iron core cools into a quiet planet orbiting inside the star.'
          ],
          correctTier2: 0,
          hint: 'What holds a massive star up against gravity? What happens the moment core fusion stops releasing energy?',
          workedSolution: 'Nuclei up to iron are bound more tightly at each step, so fusing them releases energy that pushes outward against gravity. Iron is the most tightly bound nucleus of all, so fusing iron into heavier elements costs energy instead of releasing it. Once the core turns to iron, outward fusion pressure vanishes and gravity crushes the core.',
          givenSummary: 'Why fusion stops releasing energy at iron and triggers core collapse'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-3.3_diag2',
          skillId: 'ESS1-3.3',
          level: 'Level 2 (Intermediate)',
          stem: 'Fusing silicon into iron keeps a massive star\'s core going for only about one day. After that, the center of the core is iron.',
          type: 'two_tier',
          tier1Prompt: 'Can the star keep its core going by fusing that iron?',
          tier1Options: [
            'No. Fusing iron takes in energy, so it cannot push outward against gravity.',
            'Yes. Fusing iron releases more energy than any of the earlier stages.',
            'Yes. Iron fuses into gold and keeps the star shining for millions of years.',
            'No. Iron nuclei have no protons, so they cannot get close to each other.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What held the star up against gravity during every earlier stage?',
          tier2Options: [
            'Energy released by fusion in the core pushed outward and balanced gravity.',
            'The iron in the core was solid, so it propped up the outer layers.',
            'The star\'s magnetic field held the outer layers away from the core.',
            'Light from the surface pushed inward and kept the core small.'
          ],
          correctTier2: 0,
          hint: 'Every earlier stage released energy. What does a star lose when its fuel stops releasing energy?',
          workedSolution: 'From hydrogen up to silicon, every fusion stage released energy, and that energy pushed outward against gravity. Iron is the turning point. Fusing iron takes in energy instead of releasing it, so an iron core has nothing left to push back with. Within a fraction of a second, gravity wins and the core collapses.',
          givenSummary: 'Why a massive star cannot run on iron'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-3.3_L1',
            skillId: 'ESS1-3.3',
            level: 'Level 1 (Foundational)',
            stem: 'Sort each nuclear reaction by whether it RELEASES energy (can power a star) or COSTS net energy:',
            type: 'categorize',
            categories: ['Releases energy (exothermic)', 'Costs energy (needs energy input)'],
            items: [
              { label: 'Fusing hydrogen nuclei into helium-4 in a star\'s core', correctCategoryIndex: 0 },
              { label: 'Fusing helium nuclei into carbon and oxygen in a red giant or supergiant', correctCategoryIndex: 0 },
              { label: 'Fusing silicon nuclei into iron in a massive supergiant\'s core', correctCategoryIndex: 0 },
              { label: 'Fusing iron nuclei together to build heavier elements like gold or uranium', correctCategoryIndex: 1 }
            ],
            hint: 'Every fusion step UP TO iron releases energy; fusing iron or anything heavier than iron costs energy.',
            workedSolution: 'Fusing lighter nuclei up to iron (H -> He -> C, O -> Si -> Fe) releases energy and supports the star against gravity. Fusing iron into heavier elements requires an outside supply of energy.',
            givenSummary: 'Sorting fusion steps before iron (release energy) vs past iron (cost energy)'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-3.3_L3',
            skillId: 'ESS1-3.3',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Why do astronomers call iron the "nuclear ash" at the center of a massive star?',
            type: 'mcq',
            options: [
              'Like wood ash that cannot burn for more heat, iron nuclei are already as tightly bound as possible and release no fusion energy.',
              'Iron is a black powder formed when carbon burns with oxygen gas in the star\'s outer atmosphere.',
              'Iron is the lightest element in the universe, so it floats out of the star\'s core like chimney smoke.',
              'Iron nuclei have zero electric charge and zero mass, so they cannot react with any other nuclei.'
            ],
            correctIndex: 0,
            hint: 'Why can\'t you burn fireplace ash a second time to warm a room?',
            workedSolution: 'Fireplace ash is what is left after chemical burning has released all the energy it can. In the same way, iron is the most tightly bound nucleus, so once a massive star\'s core fuses lighter elements into iron, no more fusion energy can be extracted from it.',
            givenSummary: 'Why iron is called the nuclear ash of a massive star'
          };
        }
      ]
    },
    {
      id: 'ESS1-3.4',
      title: 'Supernovae & Neutron-Star Collisions (Elements Past Iron)',
      subtitle: 'Explain how supernova explosions and neutron-star collisions make elements heavier than iron and scatter them into space.',
      watchOut: 'Because fusing past iron costs energy, elements heavier than iron (such as copper, silver, gold, platinum, and uranium) cannot be made by normal core fusion. They are forged during violent supernova explosions and neutron-star collisions, which supply huge energy and floods of neutrons.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-3.4_diag',
          skillId: 'ESS1-3.4',
          level: 'Level 2 (Intermediate)',
          stem: 'Earth\'s crust contains elements heavier than iron, such as silver (Z = 47), gold (Z = 79), and uranium (Z = 92), even though normal fusion inside star cores stops at iron (Z = 26).',
          type: 'two_tier',
          tier1Prompt: 'Where were those elements heavier than iron made?',
          tier1Options: [
            'In extreme events like supernova explosions of massive stars and collisions of neutron stars.',
            'Inside the core of our Sun during the last 4.6 billion years.',
            'During the first three minutes after the Big Bang.',
            'By lightning bolts and volcanoes in Earth\'s early atmosphere.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why can those extreme events build elements heavier than iron when a steady star core cannot?',
          tier2Options: [
            'The collapse and explosion supply a huge energy burst and a flood of neutrons that build heavier nuclei.',
            'Supernovae cool the gas to absolute zero so iron atoms glue together by ordinary static electricity.',
            'Volcanoes on rocky planets melt solid iron and turn its protons directly into gold and uranium.',
            'The Big Bang made only uranium nuclei, which have been splitting into hydrogen ever since.'
          ],
          correctTier2: 0,
          hint: 'Making elements heavier than iron costs energy and needs lots of neutrons. Which cosmic events supply both and then blast the new atoms into space?',
          workedSolution: 'When a massive star\'s iron core collapses and rebounds as a supernova, or when two neutron stars collide, the event releases an enormous burst of energy and a dense flood of neutrons. Iron and other nuclei rapidly absorb neutrons to form elements all the way up to gold, platinum, and uranium, and the blast scatters them into space.',
          givenSummary: 'How supernovae and neutron-star collisions make elements heavier than iron'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-3.4_diag2',
          skillId: 'ESS1-3.4',
          level: 'Level 2 (Intermediate)',
          stem: 'In 2017, telescopes watched two neutron stars collide. The glow afterward showed the fingerprints of freshly made elements heavier than iron.',
          type: 'two_tier',
          tier1Prompt: 'What does this observation tell you?',
          tier1Options: [
            'Collisions like this are one place where elements heavier than iron are made.',
            'Elements heavier than iron are made only in the core of the Sun.',
            'Neutron stars are made of gold, and the crash only released it.',
            'All heavy elements were made in the first three minutes after the Big Bang.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why can a neutron-star collision build nuclei heavier than iron?',
          tier2Options: [
            'It throws out a flood of free neutrons, and nuclei grab many of them within seconds.',
            'It cools the gas so much that iron atoms stick together with static electricity.',
            'It splits uranium into gold and silver as the two stars crash.',
            'It fuses iron slowly and steadily, releasing energy the way a normal star does.'
          ],
          correctTier2: 0,
          hint: 'Building past iron costs energy and needs lots of neutrons. What does a crash of two neutron stars have plenty of?',
          workedSolution: 'Steady core fusion stops at iron, because fusing past iron costs energy. A neutron-star collision throws out a huge burst of energy and a flood of free neutrons. Nuclei grab neutron after neutron in seconds, and some of those neutrons then turn into protons. That builds elements like gold and platinum, and the blast scatters them into space.',
          givenSummary: 'The 2017 neutron-star collision and heavy elements'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-3.4_L1',
            skillId: 'ESS1-3.4',
            level: 'Level 1 (Foundational)',
            stem: 'Put the four steps of a massive star\'s death and element dispersal in order from first (1) to last (4):',
            type: 'ranking',
            items: [
              'Core fusion builds up an iron core that can no longer release energy to fight gravity.',
              'With outward pressure gone, gravity crushes the core inward in less than a second.',
              'The collapsing outer layers rebound in a violent supernova explosion that forges elements heavier than iron.',
              'The blast throws both the star\'s lighter layers (C, O, Si, Fe) and newly made heavier elements out into space.'
            ],
            correctOrder: [
              'Core fusion builds up an iron core that can no longer release energy to fight gravity.',
              'With outward pressure gone, gravity crushes the core inward in less than a second.',
              'The collapsing outer layers rebound in a violent supernova explosion that forges elements heavier than iron.',
              'The blast throws both the star\'s lighter layers (C, O, Si, Fe) and newly made heavier elements out into space.'
            ],
            hint: 'Follow the sequence: iron core forms -> core collapses -> supernova explosion makes heavy elements -> debris spreads into space.',
            workedSolution: 'First an iron core forms and stops releasing fusion energy (1). Next, gravity collapses the core (2). The rebound drives a supernova explosion with enough energy and neutrons to forge elements heavier than iron (3), and the blast scatters all of those elements into surrounding gas clouds (4).',
            givenSummary: 'Order of events in a core-collapse supernova'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-3.4_L3',
            skillId: 'ESS1-3.4',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'If massive stars made carbon, oxygen, silicon, and iron in their cores, why would none of those elements ever end up in new planets if stars simply held onto all of their mass forever?',
            type: 'mcq',
            options: [
              'Without stellar winds and supernova explosions to blow those elements out into space, they would stay locked inside dead star cores.',
              'Elements inside a star turn back into pure hydrogen unless they are cooled by space.',
              'Planets can only form inside the core of a living supergiant star.',
              'Gravity pushes heavy elements out of stars only while hydrogen is fusing on the main sequence.'
            ],
            correctIndex: 0,
            hint: 'Making an element deep inside a star is only step one. How does that element get into the gas cloud that later forms a new solar system?',
            workedSolution: 'Forging elements inside a star\'s core is only half the story. Stellar winds from red giants and supernova explosions from massive stars are needed to eject carbon, oxygen, silicon, iron, and heavier elements into interstellar gas clouds so the next generation of stars and rocky planets can form from them.',
            givenSummary: 'Why supernovae and stellar winds are needed to seed space with elements'
          };
        }
      ]
    },
    {
      id: 'ESS1-3.5',
      title: 'Where Every Element on the Periodic Table Came From',
      subtitle: 'Match the three cosmic sources (Big Bang, star cores, and supernovae / neutron-star collisions) to the elements they produce.',
      watchOut: 'Keep the three cosmic factories straight: (1) Big Bang -> hydrogen and helium; (2) fusion in star cores -> elements from carbon and oxygen up to iron; (3) supernovae and neutron-star collisions -> elements heavier than iron.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-3.5_diag',
          skillId: 'ESS1-3.5',
          level: 'Level 2 (Intermediate)',
          stem: 'A student looks at a gold ring (Au, Z = 79), an iron skillet (Fe, Z = 26), and a balloon filled with helium (He, Z = 2).',
          type: 'two_tier',
          tier1Prompt: 'Which cosmic source made the bulk of each of those three elements?',
          tier1Options: [
            'Helium: mostly the Big Bang; Iron: fusion in massive star cores; Gold: supernovae and neutron-star collisions.',
            'Helium, iron, and gold were all made together in the first three minutes of the Big Bang.',
            'Helium was made in volcanoes on Earth, iron in the Sun, and gold in the Big Bang.',
            'All three were fused inside our Sun over the last 4.6 billion years and blown to Earth.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What rule decides whether an element heavier than helium is made by core fusion or requires a supernova / neutron-star collision?',
          tier2Options: [
            'Core fusion builds elements up to iron (Z = 26) while releasing energy; elements past iron cost energy and need an explosion.',
            'Core fusion only makes odd-numbered elements, while supernova explosions only make even-numbered elements on the periodic table.',
            'Low-mass stars make all elements above iron, while massive stars can only fuse hydrogen into helium.',
            'Only gases can form inside hot stars, while all solid metals must form inside cold rocky planets.'
          ],
          correctTier2: 0,
          hint: 'Use Z = 26 (iron) as the dividing line between exothermic star-core fusion and explosive nucleosynthesis.',
          workedSolution: 'Most helium (Z = 2) formed in the first few minutes after the Big Bang (with more added by stars). Iron (Z = 26) sits at the peak of energy-releasing core fusion in massive stars. Gold (Z = 79) is heavier than iron, so making it costs energy and requires a supernova or neutron-star collision.',
          givenSummary: 'Matching helium, iron, and gold to their cosmic origins'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-3.5_diag2',
          skillId: 'ESS1-3.5',
          level: 'Level 2 (Intermediate)',
          stem: 'Your kitchen holds hydrogen in water (H, Z = 1), carbon in sugar (C, Z = 6), and iodine in iodized salt (I, Z = 53).',
          type: 'two_tier',
          tier1Prompt: 'Which cosmic source made the bulk of each of those three elements?',
          tier1Options: [
            'Hydrogen: the Big Bang; carbon: fusion in star cores; iodine: supernovae and neutron-star collisions.',
            'All three were made in the Sun\'s core over the last 4.6 billion years.',
            'Hydrogen came from star cores, carbon from the Big Bang, and iodine from Earth\'s oceans.',
            'All three were made together in the first three minutes after the Big Bang.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Which clue tells you that iodine needed an explosion or a collision?',
          tier2Options: [
            'Its atomic number, 53, is past iron\'s 26, and fusing past iron costs energy.',
            'It is a solid, and solid elements can only form in explosions.',
            'It is found in the sea, and seawater elements come only from supernovae.',
            'It has an odd atomic number, and odd elements are made only in explosions.'
          ],
          correctTier2: 0,
          hint: 'Sort by atomic number. Up to helium: the Big Bang. Up to iron (Z = 26): star cores. Past iron: what?',
          workedSolution: 'Hydrogen was made in the Big Bang. Carbon was fused inside stars, from helium. Iodine has 53 protons, well past iron at 26. Fusing past iron costs energy instead of releasing it, so steady star cores cannot make iodine. It was built in supernovae and neutron-star collisions, where floods of neutrons build heavy nuclei.',
          givenSummary: 'Hydrogen, carbon, and iodine: three cosmic sources'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-3.5_L1',
            skillId: 'ESS1-3.5',
            level: 'Level 1 (Foundational)',
            stem: 'Sort each element or group of elements by the main cosmic process that forged it:',
            type: 'categorize',
            categories: [
              'Big Bang (first few minutes)',
              'Fusion in star cores (up to Z = 26)',
              'Supernovae & neutron-star collisions (above Z = 26)'
            ],
            items: [
              { label: 'Hydrogen (Z = 1) and most helium (Z = 2)', correctCategoryIndex: 0 },
              { label: 'Carbon (Z = 6) and oxygen (Z = 8) in your cells', correctCategoryIndex: 1 },
              { label: 'Silicon (Z = 14) in rocks and iron (Z = 26) in Earth\'s core', correctCategoryIndex: 1 },
              { label: 'Gold (Z = 79) and platinum (Z = 78) in jewelry', correctCategoryIndex: 2 },
              { label: 'Uranium (Z = 92) used as fuel in nuclear power plants', correctCategoryIndex: 2 }
            ],
            hint: 'Check the atomic number Z against 2 (He) and 26 (Fe).',
            workedSolution: 'Hydrogen and most helium (Z = 1, 2) come from the Big Bang. Elements from carbon through iron (Z = 6 to 26) are fused inside star cores. Elements heavier than iron (such as gold, platinum, and uranium, Z > 26) are forged in supernovae and neutron-star collisions.',
            givenSummary: 'Sorting H/He, C/O/Si/Fe, and Au/Pt/U by their cosmic origin'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-3.5_L3',
            skillId: 'ESS1-3.5',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'During a supernova or neutron-star collision, why is it so much easier for an iron nucleus to capture free NEUTRONS than to fuse with another positively charged nucleus?',
            type: 'mcq',
            options: [
              'Neutrons have zero electric charge, so the positive protons in an iron nucleus do not push them away.',
              'Neutrons carry a strong negative charge that pulls them inward toward positively charged protons.',
              'Free neutrons have zero mass, so they travel much faster than the speed of light.',
              'Free neutrons only stick to hydrogen atoms and can never enter a heavy iron nucleus.'
            ],
            correctIndex: 0,
            hint: 'What charge does a neutron carry, and how does an iron nucleus with 26 positive protons treat it?',
            workedSolution: 'An iron nucleus has 26 protons, creating a strong positive electric repulsion against any other positively charged nucleus. Because a neutron carries zero electric charge, it feels no electric repulsion and can slip right into the nucleus to build heavier elements.',
            givenSummary: 'Why neutral neutrons can build elements past iron without electric repulsion'
          };
        }
      ]
    },
    {
      id: 'ESS1-3.6',
      title: 'Cosmic Recycling & Stardust',
      subtitle: 'Explain why rocky planets and living things could only form after earlier generations of stars lived and died.',
      watchOut: 'The very first stars in the universe formed from pure Big Bang gas (only hydrogen and helium), so they could not have rocky planets made of silicon and iron or life made of carbon and oxygen. Our solar system formed 9 billion years later from gas enriched by earlier stars.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-3.6_diag',
          skillId: 'ESS1-3.6',
          level: 'Level 2 (Intermediate)',
          stem: 'The universe is about 13.8 billion years old, while our Sun and Earth formed about 4.6 billion years ago. Earth has an iron core, a silicon-oxygen crust, and carbon-based life.',
          type: 'two_tier',
          tier1Prompt: 'Where did the carbon, oxygen, silicon, and iron in Earth and your body come from?',
          tier1Options: [
            'They were fused inside earlier generations of stars that died and scattered their elements before the Sun formed.',
            'They were fused inside our Sun\'s core and blown outward to build Earth.',
            'They were made during the first three minutes of the Big Bang alongside hydrogen.',
            'They were created by chemical reactions in the cold cloud of gas before the Sun ignited.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why couldn\'t rocky, Earth-like planets form around the very first generation of stars after the Big Bang?',
          tier2Options: [
            'Before the first stars lived and died, the universe had only hydrogen, helium, and a trace of lithium.',
            'The very first stars in the universe had no gravity, so rocky planets could not orbit them.',
            'The early universe contained only solid iron and had no hydrogen gas left to make stars.',
            'Rocky planets can only form after a star has already cooled into a carbon-oxygen white dwarf.'
          ],
          correctTier2: 0,
          hint: 'What elements existed right after the Big Bang, and what elements do you need to build silicate rocks (Si, O) and an iron core (Fe)?',
          workedSolution: 'Right after the Big Bang, only hydrogen, helium, and a trace of lithium existed, so the first generation of stars could have no rocky planets. Over billions of years, stars fused H and He into C, O, Si, and Fe, and died in stellar winds and supernovae that seeded space with those elements. Our solar system formed 4.6 billion years ago from one of those enriched clouds.',
          givenSummary: 'Why Earth\'s elements prove our solar system formed from recycled star material'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-3.6_diag2',
          skillId: 'ESS1-3.6',
          level: 'Level 2 (Intermediate)',
          stem: 'Every red blood cell in your body carries iron in its hemoglobin. That iron was on Earth when Earth formed 4.6 billion years ago.',
          type: 'two_tier',
          tier1Prompt: 'Where was that iron made?',
          tier1Options: [
            'Inside earlier stars that lived and died before the Sun formed.',
            'In the Sun\'s core, which then blew the iron outward to Earth.',
            'In the first three minutes after the Big Bang, with the hydrogen.',
            'In Earth\'s core, where heat and pressure turn rock into iron.'
          ],
          correctTier1: 0,
          tier2Prompt: 'How did that iron get into the gas cloud that formed the Sun and Earth?',
          tier2Options: [
            'Those stars exploded and scattered their elements, which mixed into later gas clouds.',
            'The iron traveled to us as light and turned back into matter on arrival.',
            'Gravity from the young Sun pulled the iron out of a living star nearby.',
            'Comets made the iron by melting rock when they crashed into Earth.'
          ],
          correctTier2: 0,
          hint: 'The Sun will never make iron. Which stars do, and how do their elements leave them?',
          workedSolution: 'The Sun is not massive enough to fuse iron, and the Big Bang made only hydrogen, helium, and a trace of lithium. The iron in your blood was fused in earlier stars that lived and died before the Sun existed. Their explosions scattered that iron into space. The iron mixed into the gas cloud that later formed the Sun, Earth, and you.',
          givenSummary: 'Where the iron in your blood came from'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-3.6_L1',
            skillId: 'ESS1-3.6',
            level: 'Level 1 (Foundational)',
            stem: 'What does it mean scientifically to say that humans and Earth are "made of stardust"?',
            type: 'mcq',
            options: [
              'Nearly every atom in us besides hydrogen (carbon, oxygen, calcium, iron) was forged in stars that died before the Sun formed.',
              'Human cells glow in the dark by running tiny nuclear fusion reactions at normal body temperature.',
              'Planet Earth is a cooled piece of our Sun\'s core that broke off a million years ago.',
              'The hydrogen atoms in the water we drink were made inside nearby supernova explosions last week.'
            ],
            correctIndex: 0,
            hint: 'Compare the origin of hydrogen (the Big Bang) with the origin of carbon, oxygen, calcium, and iron.',
            workedSolution: 'While the hydrogen atoms in water date back to the Big Bang, the carbon, nitrogen, oxygen, calcium, and iron atoms in our bodies and in Earth\'s rocks were built inside ancient stars and scattered into the gas cloud that later formed our solar system.',
            givenSummary: 'Scientific meaning of "we are made of stardust"'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-3.6_L3',
            skillId: 'ESS1-3.6',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Astronomers measure the spectra of two stars: Star A formed 12 billion years ago, and Star B formed 1 billion years ago. Which star\'s atmosphere will show stronger absorption lines from heavy elements like iron and silicon, and why?',
            type: 'mcq',
            options: [
              'Star B, because it formed much later from gas that had been enriched by many more generations of dying stars.',
              'Star A, because older stars started out with all of the universe\'s iron and used it up.',
              'Both stars will have the exact same percentage of iron because space has never changed.',
              'Neither star can contain any iron because stars are made of 100% pure hydrogen.'
            ],
            correctIndex: 0,
            hint: 'Each generation of massive stars lives, dies, and adds more heavy elements to the gas clouds in a galaxy.',
            workedSolution: 'Star A formed 12 billion years ago when very few stars had died yet, so its gas cloud was almost pure hydrogen and helium. Star B formed 11 billion years later, after countless supernovae and dying stars had enriched the galaxy\'s gas with silicon, iron, and other heavy elements.',
            givenSummary: 'Why younger stars contain a higher share of heavy elements than ancient stars'
          };
        }
      ]
    }
  ];

  window.PE_DATA_HS_ESS1_3 = {
    info: PE_INFO,
    skills: SKILLS
  };
})();
